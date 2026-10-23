# AGENTS.md

给在这个工作区里干活的人（和 agent）。项目是 xuesj.top 的单页个人主页：一张纸，三个入口。

## 先读这两个

- `README.md`：命令、设计令牌、字体子集、部署。
- `src/data/site.ts`：**全站唯一内容文件**。改文案只改这里。

## 硬约束

- **零运行时依赖。** 不要加 React/Vue/Svelte/Tailwind/GSAP/three.js 或任何会在浏览器里跑的包。devDependencies 只服务 `tools/` 下的构建期脚本。
- **不许 `window.addEventListener('scroll')`**；只动画 `transform` 与 `opacity`。阅读进度用 rAF 读 `scrollY` 写刻度尺红点的 `translateY()`。
- **不动博客**（另一个仓库 `LLh-xuesj/astro_blog`）。这里不做文章列表、归档、评论、RSS、统计。
- 颜色只从 `src/styles/paper.css` 的令牌取。只有纸、墨、朱红；一个强调色（朱红 `#c33f28` / 深色 `#e2653f`）。组件里不要写死新色值。
- 不用圆角、阴影、通用 1px 灰边框；分隔线是 `.rule`（`--rule`），朱红只做强调，不做大块底色（印章除外）。刊头大字与印章的套印错位红影是印刷效果（平色、零模糊），不算阴影，别推广到别的元素。
- 可见文案里不要出现 `—` 与 `–`。
- 中文与西文走自托管 `@font-face`，不要改成 Google Fonts 外链。**改了页面上的汉字要重跑 `pnpm fonts`**。
- 改了 `src/data/site.ts` 的结构要同步 `Entry`、`ColophonItem` 等类型。
- 站点是单页；新内容默认加进现有版式，不要开新页面路由。

## 版式与文件

| 文件 | 管什么 |
| --- | --- |
| `src/styles/paper.css` | 令牌、reset、`.sheet`、`.label`、`.rule`、`.skip`、入场动画、打印 |
| `src/styles/fonts.css` | `pnpm fonts` 生成，不要手改 |
| `src/scripts/daily.ts` | 期号、星期、今日一字（44 字）、今日一言（按字的主题取 `QUOTES`），`seed = y*372+m*31+d` |
| `src/data/site.ts` | 站名、导语、入口、作品、编者的话、版权页 |
| `src/components/PageFrame.astro` | 版面框（fixed inset 11px）、四角套准十字、右缘阅读刻度尺 |
| `src/components/GrainOverlay.astro` | 纸面颗粒，fixed、`pointer-events: none` |
| `src/components/Seal.astro` | 今日一字印章 |
| `src/components/IndexRow.astro` | 整行目录项；悬停墨色压满、字翻纸色 |
| `src/components/WorkRow.astro` | 作品行；导点 + 网页/仓库两个入口，悬停只变朱红 |
| `src/layout/Base.astro` | head、跳过链接、外壳 |
| `src/pages/index.astro` | 刊头 / 入口 / 作品 / 编者的话 / 版权页，以及日期与进度脚本 |

几条不变量：

- **浅色与深色是同一套令牌对调**，不要在组件里写 `@media (prefers-color-scheme)` 分叉（`paper.css` 里已经统一处理）。
- 页面上「今日一字」「今日一言」与期号由构建期 `dailyInfo()` 先填、客户端再按访客本地日期改写；两条路径共用 `daily.ts`，不要各写一份。
- 目录行是**整行 `<a>`**，序号在 `IndexRow.astro` 里自动生成；`entries` 顺序就是页面顺序。
- **入口与作品是两种手势**：入口整行压满墨色（导航），作品只让标题/序号/导点变朱红（内容）。不要合并成同一个组件，也不要给作品加大缩略图。
- 序号全局连续：作品从 `entries.length + 1` 起（现为 04），加作品不用改号。首页最多五件；`projects.length < 4` 时才印「待印」版位。
- 印章的 `rotate(-1.6deg)` 与 hover 回正属于设计的一部分，不要改成弹跳。
- 断网可用：字体、图标、页面全部本地；不要引入外部请求。
- 打印时隐藏 `.frame`、`.grain`，外链后附 URL；改版式时看一眼打印预览。

## 文案：写成人话

这一页的文案被说过"有一股 AI 味"，下面这些是从现有文本里清出来的病根，别再写回去。

**一条判断标准**：把这句话搬到任何一个人的主页上都成立，那就是 AI 味；只有 xuesj 会这么说，才是人写的。

不要用的句式：

- **否定对仗**：`不写流水账，也不做长篇的自我介绍`、`没有框架运行时，也没有统计脚本`、`不是…而是…`。想否定就否定一次，说完就停。
- **三段排比**：`博客里是字，视频里是声音，代码里是另一种话`。三样东西并排还要各自配一个抽象名词，是最典型的机器写法。
- **比喻收尾**：`像贴在门上的一张纸条`、`像一张纸`。整页已经是纸了，不用再打比方。
- **总结腔**：`想找的东西，都在下面`、`都在这里`、`只负责把它们收在一处`。读者看得见下面有什么，不用指路。
- **抽象形容词**：温柔、安静、克制、流动、呼吸感、恰到好处。要形容就写具体的事。
- **空承诺**：`持续更新`、`欢迎交流`、`一起成长`。

该怎么写：

- 一句话只说一件事；超过 20 字就断句。
- 用具体名词和能核对的数字（`两百来 KB`、`第 288 期`、`48 个字`），不用"丰富""多元""优质"。
- 允许口语、半句、自嘲（`GitHub 看心情`）。个人站用"我"，或者干脆省主语，别用"我们"。
- 三条副标题别用同一个句式，长度也要错开。
- `note`、`colophon` 里的文案只在 `src/data/site.ts` 改；今日一言在 `daily.ts` 的 `QUOTES`（收公有领域的旧句子）；改完念一遍，像播音稿就重写。



开发服务器默认 `http://localhost:4321`。**Bash 沙箱里 curl localhost 连不上**，验证一律走内置浏览器。浏览器能力的入口是 Node REPL 的 `js` 工具，先加载 `control-browser` 技能拿 bootstrap。

1. **先滚到顶再截图**：页面可能在滚动位置，第一次截图会像"标题全空"；先 `window.scrollTo(0, 0)`。页面有 smooth scroll，读 `scrollY` 前把 `documentElement.style.scrollBehavior` 设成 `auto`。
2. **截图配额**每回合约 3 张；超了改用 `getComputedStyle` 与 `getBoundingClientRect` 读数值。截图偶发 `surface preparation timed out`，重试即可。`tab.screenshot({})` 只接受空对象。
3. **手机版**用同源 iframe：`iframe { width:390px; height:700px }` 加载 `/`，把 `body.style.display` 设成 `none`；验完重新 goto。不要指望 `browser.executeCommand` 做设备模拟。
4. **没有 hover API**。`:hover` 效果读计算样式验证：`:focus-visible` 可以真键盘触发（见下），`::before` 的 `transform` 能在聚焦后读到接近 `matrix(1,...)`。
5. **键盘**：先点一下页面给焦点，再 `browser.executeCommand({ method: 'press', tabId, key: 'Tab' })` 逐步 Tab；`locator.press` 会因"Active element is no longer the expected input target"报错。顺序应为：跳到正文 → 01 → 02 → 03 → 回到顶部。
6. **`playwright.evaluate` 只吃单个表达式**，多语句用 `(() => { ... })()` 包；里面不能用 `import()`；变量名用 ASCII。
7. **rAF 可能被挂起**（IAB 窗格被遮挡时 Chromium 停发 rAF）：进度红点停在顶、CSS 入场动画不跑，与代码 bug 同症状。先量 rAF 计数再下结论；必要时把 `requestAnimationFrame` 换成 MessageChannel 队列，并发一次 `tab.screenshot({})` 逼出 begin frame。
8. **dev 报 `[PARSE_ERROR]` 先看 `.astro/dev-run.log`**：重复 import 同一类型（例如两次 `type DayMood`）会让整页模块加载失败，而 `pnpm build` 可能仍然通过（构建管线会擦掉 type import）。`npx astro check` 会卡在安装 `@astrojs/check` 的交互提示，不要当类型检查用。
9. 改完必须 `pnpm build`；产物应只有 `dist/index.html`、`favicon.svg`、`apple-touch-icon.png` 与四个字体文件。

## 交付前自查

- 1440 / 768 / 390 三档都看：三行目录在首屏内（**1280×720 也要**，有 `@media (max-height: 800px)` 收边距），无横向滚动。
- 浅色与深色各截一张；正文对比度 ≥ 4.5:1，大字 ≥ 3:1。`--ink-faint` 已经是按 4.5:1 调的，不要再调淡。
- 键盘 Tab 顺序完整、焦点环可见（2px 朱红）；目录行聚焦时墨色压满。
- `prefers-reduced-motion` 下无动画；脚本禁用时刊头与目录照常可读。
- 打印预览一页，版面框与颗粒不出现。
- `pnpm build` 通过，`dist/` 没有旧文件残留（构建会清空 `dist/`）。
