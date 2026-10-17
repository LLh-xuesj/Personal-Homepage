# xuesj.top

一页纸，三个入口。

线上：https://xuesj.top
博客在 https://blog.xuesj.top（另一个仓库，这里不重复它的内容）

## 它是什么

- **一张纸**。整站只有一页，版式取印刷品：米色纸、墨黑、朱红，1px 墨线分栏，四角有套准十字，右侧一条阅读进度线。不滚动也能看到刊头、今日一字和三个入口。
- **两个油墨，一个强调色**。颜色只有纸、墨、朱红。没有阴影、没有圆角、没有渐变按钮。
- **零运行时依赖**。产物是 Astro 生成的静态 HTML/CSS 和几 KB 自己的 TypeScript，没有 React/Vue/Tailwind/GSAP。
- **不靠脚本也能读**。刊头、目录、编者的话、版权页都是真 DOM；脚本只负责把日期和「今日一字」换成访客本地的那天，以及推动阅读进度。
- **深色模式是纸墨对调**，不是另做一套皮肤；打印时是一张真正的纸。

## 开始

```bash
pnpm install
pnpm dev       # http://localhost:4321
pnpm build     # 产物在 dist/
pnpm preview   # 预览构建产物
```

Node 22+（Astro 7 的要求）。

## 改内容

**只改 `src/data/site.ts`**。站名、导语、三个入口、作品、编者的话、版权页都在里面，页面上所有文案都从这里来。

```ts
export const site = {
  url: 'https://xuesj.top',
  title: 'xuesj',
  kicker: '个人主页',
  description: '...', // 只进 <meta description> 与分享卡片，页面上不显示
  entries: [{ id, label, note, href, external }],
  projects: [{ id, title, summary, year, role, url, repo }],
  note: { label, lead, paragraphs, signature },
  colophon: { year, items: [{ label, value }] },
} as const
```

- `entries` 的顺序就是目录顺序，序号自动生成。
- `external: false` 的入口不加 `target="_blank"`。
- 改了页面上的汉字，重跑 `pnpm fonts`（见下）。
- 期号与「今日一字」不用手填，见 `src/scripts/daily.ts`。
- 文案怎么写见 `AGENTS.md`「文案：写成人话」：不用否定对仗、三段排比、比喻收尾和"都在下面"这类指路句。

### 作品怎么加

作品的序号接着入口往下排（三个入口之后从 `04` 开始），加一件就多一行，不用改编号。`summary` 是一句话，超过 40 字就该拆成两件事；`url` 是网页、`repo` 是代码仓库，两栏都留空的话标题就不可点，只作为一条记录。`role` 写你干的部分，年份按倒序排。首页满四件时会自动收掉「待印」版位；超过五件就另开一页，别硬塞。

## 日期、一字与一言

`src/scripts/daily.ts`：

- `doy` = 年内第几天，刊头写成「第 290 期」。
- `weekday` = 星期几，`iso` = `YYYY.MM.DD`。
- `glyph` = 从 48 个汉字里按 `seed = y*372 + m*31 + d` 取一个，同一天固定；以访客本地日期为准。
- `quote` = 从 `QUOTES` 里按同一个种子取一句旧诗，刊头下面那句就是它；想换句子改这个数组，收公有领域的句子，别收网上的段子。
- 构建时先按构建日期渲染一份，客户端脚本加载后再按访客时区改写，所以静态 HTML 也不是空的。

## 设计系统

全部令牌在 `src/styles/paper.css`：

| 令牌 | 浅色 | 深色 | 用途 |
| --- | --- | --- | --- |
| `--paper` | `#efe7d6` | `#15130f` | 纸 |
| `--paper-deep` | `#e4d8c0` | `#201c16` | 纸的暗部 |
| `--ink` | `#181510` | `#ece4d2` | 墨，正文 |
| `--ink-soft` | `#4f4739` | `#aaa189` | 次级文字 |
| `--ink-faint` | `#6b6254` | `rgba(236,228,210,.58)` | 小字、序号 |
| `--rule` | `rgba(24,21,16,.22)` | `rgba(236,228,210,.2)` | 1px 分隔线 |
| `--red` | `#c33f28` | `#e2653f` | 唯一强调色 |

字体：`--font-serif` = EB Garamond + 霞鹜文楷（大字、西文），`--font-cjk` = 霞鹜文楷 + EB Garamond（正文）。

规矩：

- 组件里不写新的色值，只取令牌；朱红只做强调，不做大块底色（印章除外）。
- 不用圆角、阴影、通用灰边框；分栏靠 `.rule`，线是版面的一部分。
- 动效只有 `transform` 与 `opacity`；不监听 scroll。
- 可见文案里不写 `—` 与 `–`。

## 字体

自托管，不连任何 CDN。中文霞鹜文楷（SIL OFL 1.1），西文 EB Garamond（SIL OFL 1.1）。

```bash
pnpm fonts
```

流程：构建一次 → 从 `dist/index.html` 的可见文本里量出实际用到的码位 → 从字体分块里只取相交的块、按 glyph 削成子集 → 用 Python fontTools 合并 → 每个字重输出一个 woff2 到 `public/fonts/`，同时重写 `src/styles/fonts.css`。

当前四个文件合计约 163 KB（中文 400/700 各约 58 KB，西文 23/25 KB）。没有 Python 时会退回「每个分块一个文件 + unicode-range」的慢路径。网络请求缓存在 `tools/.cache/`（已 gitignore），`--refresh` 忽略缓存。

**改了页面上的汉字就要重跑**，否则新字会落到系统字体。

## 图标

```bash
pnpm icon      # 重画 public/apple-touch-icon.png
```

`public/favicon.svg` 是手写的；`tools/make-icon.mjs` 用 pngjs 以 4 倍超采样画 180px 的 iOS 图标。改纸色或朱红时两个都要改。

## 结构

```text
src/
  data/site.ts            全站唯一内容文件
  scripts/daily.ts        期号、星期、今日一字
  styles/paper.css        令牌与基础样式
  styles/fonts.css        由 pnpm fonts 生成，不要手改
  components/PageFrame    版面框、四角套准十字、阅读进度槽
  components/GrainOverlay 纸面颗粒（fixed、不接收指针事件）
  components/Seal         朱红印章
  components/IndexRow     整行目录项（悬停墨色压满）
  components/WorkRow      作品行（导点连到年份，悬停只变朱红）
  layout/Base.astro       head、跳过链接、外壳
  pages/index.astro       刊头 / 入口 / 作品 / 编者的话 / 版权页
tools/
  subset-fonts.mjs        字体子集
  make-icon.mjs           iOS 图标
```

## 交互

- **目录行**：悬停或键盘聚焦时，墨色从左压满整行，文字翻成纸色，箭头右上移（`IndexRow.astro` 的 `::before` + `transform: scaleX()`）。
- **作品行**：手势刻意不同——只让标题、序号与描线变朱红，不压满墨色（作品是内容，不是导航）。描线用 `radial-gradient` 平铺成印刷导点，移动端隐藏。
- **入场**：`[data-rise]` 纯 CSS 上浮，`--i` 控制延迟。
- **阅读进度**：`requestAnimationFrame` 每帧读一次 `scrollY`，写 `[data-progress]` 的 `scaleY()`，不挂 scroll 监听。
- **深色模式**：跟随系统 `prefers-color-scheme`；`prefers-reduced-motion` 下所有动效归零。
- **打印**：隐藏版面框与颗粒，外链后面补 URL，整页落在一张纸上。

## 交付前自查

- 1440 / 768 / 390 三档都看：三行目录在首屏内（1280×720 也要），无横向滚动。
- 浅色与深色各截一张；正文对比度 ≥ 4.5:1，大字 ≥ 3:1。
- 键盘 Tab：跳过链接 → 三个入口 → 回到顶部；焦点样式可见，顺序不乱。
- 断网刷新：字体与页面都来自本地，`dist/` 里没有外部请求。
- `pnpm build` 通过，`dist/` 只有 `index.html`、图标与四个字体文件。
- 打印预览是一页，链接后面带 URL。

## 部署

仓库：https://github.com/LLh-xuesj/Personal-Homepage
`main` 每次推送都会触发 Cloudflare Pages 重新构建。

1. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git，选 `LLh-xuesj/Personal-Homepage`。
2. 构建设置：Framework preset 选 **Astro**；Build command `pnpm build`；Build output directory `dist`；Root directory 留空。
3. 环境变量：`NODE_VERSION=22`（Astro 7 要求 ≥ 22.12），`PNPM_VERSION=12.4.1`（lockfile 是 v9 格式，旧版 pnpm 读不了）。
4. 首次构建完先访问 `personal-homepage.pages.dev` 验收，再绑域名。
5. Custom domains → 加 `xuesj.top`。zone 在同一个 Cloudflare 账号下，会自动建好记录，不需要手动改 DNS。证书一般几分钟。
6. SSL/TLS 设 **Full (strict)**，打开 **Always Use HTTPS**。要 `www` 就一起加，再用 Redirect Rules 做 301。
7. 回滚：Deployments → 那次构建 → Rollback。排查构建失败就看那次的 log，最常见的是 Node/pnpm 版本。
8. 不用 Git 的备用方案：`npx wrangler pages deploy dist --project-name personal-homepage`。

字体已经提交在 `public/fonts/`，构建只跑 `astro build`，不需要联网，也不需要 Python。

站点地址写在 `astro.config.mjs` 的 `site` 与 `src/data/site.ts` 的 `url`，换域名时两处一起改。

## 许可

代码归作者。字体各自遵循其许可（霞鹜文楷与 EB Garamond 均为 SIL OFL 1.1）。
