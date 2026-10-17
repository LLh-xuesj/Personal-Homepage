/**
 * 把字体收成本地子集。
 *
 * 为什么不用 Google Fonts 的 <link>：那是运行时要跨域去拿的东西，网络一断字就变了样。
 * 为什么不用现成的分块 webfont：霞鹜文楷在 npm 上只有按 unicode-range 切成 97 块的那种包，
 * 每块 50 KB 上下。这个单页总共只用了一百来个字，却散在 17 块里，光挑块就是 1.8 MB。
 *
 * 所以自己切：
 *   1. 先构建一次，量出页面上真正会显示的字（只算构建产物，不算源码注释里的中文）；
 *   2. 挑出与这些字相交的分块，用 subset-font 把每块削成只含这些字的 ttf；
 *   3. 把这几块合并成一个字体（合并要 Python 的 fontTools，没有就退回"每块一个文件"）；
 *   4. 输出 woff2 到 public/fonts/，样式写到 src/styles/fonts.css。
 *
 * 改完文案重跑一次就行：pnpm fonts
 */

import { execFileSync, execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import subsetFont from 'subset-font';

const ROOT = path.resolve(import.meta.dirname, '..');
const CACHE_DIR = path.join(ROOT, 'tools', '.cache');
const MERGE_DIR = path.join(CACHE_DIR, 'merge');
const FONT_DIR = path.join(ROOT, 'public', 'fonts');
const OUT_CSS = path.join(ROOT, 'src', 'styles', 'fonts.css');

const LXGW_BASE = 'https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0';
const LXGW_CHUNKS = [
  { family: 'LXGW WenKai', weight: 400, css: `${LXGW_BASE}/lxgwwenkai-regular.css` },
  { family: 'LXGW WenKai', weight: 700, css: `${LXGW_BASE}/lxgwwenkai-bold.css` },
];

/** EB Garamond 只管西文（站名、Bilibili、GitHub），一个 latin 切片就够 */
const GARAMOND_BASE = 'https://cdn.jsdelivr.net/npm/@fontsource/eb-garamond@5/files';
const GARAMOND = [
  { weight: 400, url: `${GARAMOND_BASE}/eb-garamond-latin-400-normal.woff2` },
  { weight: 700, url: `${GARAMOND_BASE}/eb-garamond-latin-700-normal.woff2` },
];
const GARAMOND_LATIN_RANGE =
  'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,' +
  'U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';

/** 标点、数字与少量兜底符号。页面上的汉字从 dist 与 daily.ts 里量，不在这里手写 */
const SAFETY = '0123456789，。、；：？！“”‘’（）《》〈〉【】—…·「」『』～°% .,:;!?()[]{}<>\'"-_/@#%&*+=|~^`$\\';

const refresh = process.argv.includes('--refresh');
const log = (msg) => process.stdout.write(`${msg}\n`);

/* ------------------------------------------------------------------ 取文件（带落盘缓存） */

async function grab(url) {
  const ext = path.extname(new URL(url, 'https://x.invalid').pathname).slice(1) || 'bin';
  const key = createHash('sha1').update(url).digest('hex').slice(0, 16);
  const cached = path.join(CACHE_DIR, `${key}.${ext}`);
  if (!refresh && existsSync(cached)) return readFile(cached);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`取不到 ${url}（HTTP ${res.status}）`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(cached, buf);
  return buf;
}

/* ------------------------------------------------------------------ 量字符集 */

async function pageText() {
  const distHtml = path.join(ROOT, 'dist', 'index.html');
  if (!existsSync(distHtml)) throw new Error('没有 dist/index.html，先 pnpm build');
  const html = await readFile(distHtml, 'utf8');
  // 首屏只印当天的字和句子，其余的只在运行时出现，
  // 所以把 daily.ts 里会拼进页面的文本也量进来（注释先剥掉）。
  const runtime = await readFile(path.join(ROOT, 'src', 'scripts', 'daily.ts'), 'utf8');
  return (
    html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]*>/g, ' ') +
    ' ' +
    runtime.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')
  );
}

/* ------------------------------------------------------------------ unicode-range */

function parseRanges(spec) {
  const out = [];
  for (const raw of spec.split(',')) {
    const token = raw.trim();
    if (!token) continue;
    const m = /^u\+([0-9a-f?]+)(?:-([0-9a-f]+))?$/i.exec(token);
    if (!m) continue;
    out.push(
      m[1].includes('?')
        ? [parseInt(m[1].replaceAll('?', '0'), 16), parseInt(m[1].replaceAll('?', 'f'), 16)]
        : [parseInt(m[1], 16), m[2] ? parseInt(m[2], 16) : parseInt(m[1], 16)],
    );
  }
  return out;
}

function intersects(ranges, points) {
  for (const [lo, hi] of ranges) {
    let low = 0;
    let high = points.length - 1;
    while (low <= high) {
      const mid = (low + high) >> 1;
      if (points[mid] < lo) low = mid + 1;
      else if (points[mid] > hi) high = mid - 1;
      else return true;
    }
  }
  return false;
}

/* ------------------------------------------------------------------ 合并（要 Python） */

const MERGE_PY = `
import sys
from fontTools.merge import Merger
Merger().merge(sys.argv[1:-1]).save(sys.argv[-1])
`;

function pythonWithFontTools() {
  for (const cmd of ['py', 'python3', 'python']) {
    try {
      execFileSync(cmd, ['-c', 'import fontTools'], { stdio: 'ignore' });
      return cmd;
    } catch {
      /* 换下一个 */
    }
  }
  return null;
}

/* ------------------------------------------------------------------ 干活 */

// 先构建一次，好拿到页面上真正会显示的字。不然就得记住"先 build 再 fonts"的顺序，
// 早晚有人反过来跑，然后发现字缺了。--no-build 可以跳过。
if (!process.argv.includes('--no-build')) {
  await mkdir(path.dirname(OUT_CSS), { recursive: true });
  // Base.astro import 了这个文件，头一次跑时它还不存在，先放个占位把构建救回来
  if (!existsSync(OUT_CSS)) {
    await writeFile(OUT_CSS, '/* 占位，马上由 tools/subset-fonts.mjs 覆盖 */\n');
  }
  log('· 构建一次，按页面上真正的文字量子集化');
  execSync('npx astro build', { cwd: ROOT, stdio: 'inherit' });
}

const text = (await pageText()) + SAFETY;
const points = [...new Set(text)].map((ch) => ch.codePointAt(0)).sort((a, b) => a - b);
log(`量出来 ${points.length} 个码位要用`);

await mkdir(CACHE_DIR, { recursive: true });
await rm(FONT_DIR, { recursive: true, force: true });
await mkdir(FONT_DIR, { recursive: true });

const python = pythonWithFontTools();
if (!python) log('· 没找到带 fontTools 的 Python，退回"每个分块一个文件"（慢一点，但是对的）');

const faces = [];
let totalBytes = 0;

for (const { family, weight, css: cssUrl } of LXGW_CHUNKS) {
  const css = (await grab(cssUrl)).toString('utf8');
  const blocks = [...css.matchAll(/@font-face\s*\{([\s\S]*?)\}/g)].map((m) => m[1]);

  const wanted = [];
  for (const block of blocks) {
    const spec = /unicode-range\s*:\s*([^;}]+)/.exec(block)?.[1];
    const file = /url\(\s*['"]?([^'")]+)['"]?\s*\)/.exec(block)?.[1];
    // 这些 CSS 最后一条声明后面没有分号，所以收尾不能靠分号
    if (!spec || !file) continue;
    if (intersects(parseRanges(spec), points)) {
      wanted.push({ name: file.split('/').pop(), spec: spec.replace(/\s+/g, ' ').trim() });
    }
  }

  // 每块只留这个站用得到的字，50 KB 一块通常能削到 1 KB 上下
  const parts = [];
  for (const [i, chunk] of wanted.entries()) {
    const src = await grab(`${LXGW_BASE}/files/${chunk.name}`);
    parts.push(await subsetFont(src, text, { targetFormat: 'truetype' }));
    if (i % 6 === 0) log(`  · ${family} ${weight}：已削 ${i + 1}/${wanted.length} 块`);
  }

  let merged = null;
  if (python) {
    await rm(MERGE_DIR, { recursive: true, force: true });
    await mkdir(MERGE_DIR, { recursive: true });
    const files = await Promise.all(
      parts.map(async (buf, i) => {
        const p = path.join(MERGE_DIR, `part-${i}.ttf`);
        await writeFile(p, buf);
        return p;
      }),
    );
    const out = path.join(MERGE_DIR, `lxgw-${weight}.ttf`);
    execFileSync(python, ['-c', MERGE_PY, ...files, out], { stdio: 'inherit' });
    merged = await readFile(out);
  }

  if (merged) {
    const buf = await subsetFont(merged, text, { targetFormat: 'woff2' });
    const name = `lxgw-wenkai-${weight}.woff2`;
    await writeFile(path.join(FONT_DIR, name), buf);
    totalBytes += buf.byteLength;
    faces.push({ family, weight, file: name });
    log(`· ${family} ${weight}：${wanted.length} 块合成 1 个，${(buf.byteLength / 1024).toFixed(1)} KB`);
  } else {
    let bytes = 0;
    for (const [i, buf] of parts.entries()) {
      const out = await subsetFont(buf, text, { targetFormat: 'woff2' });
      const name = `lxgw-wenkai-${weight}-${i}.woff2`;
      await writeFile(path.join(FONT_DIR, name), out);
      bytes += out.byteLength;
      faces.push({ family, weight, file: name, range: wanted[i].spec });
    }
    totalBytes += bytes;
    log(`· ${family} ${weight}：${wanted.length} 个分块文件，共 ${(bytes / 1024).toFixed(1)} KB`);
  }
}

for (const { weight, url } of GARAMOND) {
  const buf = await grab(url);
  const name = `ebgaramond-latin-${weight}.woff2`;
  await writeFile(path.join(FONT_DIR, name), buf);
  totalBytes += buf.byteLength;
  faces.push({ family: 'EB Garamond', weight, file: name, range: GARAMOND_LATIN_RANGE });
  log(`· EB Garamond ${weight}：${(buf.byteLength / 1024).toFixed(1)} KB`);
}

const css = `/**
 * 这个文件由 tools/subset-fonts.mjs 生成，不要手改。
 * 文案改完跑一次 pnpm fonts，它会重新量字、重新切。
 */

${faces
  .map(
    (f) => `@font-face {
  font-family: '${f.family}';
  font-style: normal;
  font-weight: ${f.weight};
  font-display: swap;
  src: url('/fonts/${f.file}') format('woff2');${f.range ? `\n  unicode-range: ${f.range};` : ''}
}`,
  )
  .join('\n\n')}
`;

await writeFile(OUT_CSS, css);
await rm(MERGE_DIR, { recursive: true, force: true });

log(`\n共 ${faces.length} 个 @font-face，${(totalBytes / 1024).toFixed(1)} KB`);
log('字体写到 public/fonts/，样式写到 src/styles/fonts.css');
