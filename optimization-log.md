# tcm-chemistry-lab 渐进式动态站改造与优化迭代日志

> **说明**：本日志严格记录基线审计与每一轮单目标迭代的完整数据、改动文件、功能回归结论、去留判断与回退方式。所有改动仅保留于本地克隆副本，未执行任何 `git commit` / `git push` 或线上修改。
> 完整基线审计报告见：[baseline-audit.md](./baseline-audit.md)

## 基线快照（Round 0 · 纯静态基线）

- **日期**：2026-11-24
- **基线 Commit**：`f88c6ce`（未改任何代码）
- **构建产物 / 前端总体积**：Raw **2,717.42 KB**（Vendor JS 1,139.98 KB + App JS 1,354.99 KB + CSS 114.60 KB + HTML/Manifest 107.84 KB）；Gzip **798.52 KB**
- **`<script>` 数量**：27 个（`<head>` 3 同步 + 1 defer；`<body>` 1 内联 + 22 同步）
- **Lighthouse（Mobile 4G + Gzip）**：Performance **44** / Accessibility **87** / Best Practices **100** / SEO **100**
- **Lighthouse 指标**：FCP 5,072 ms / LCP 6,222 ms / TBT 879 ms / CLS 0.0000 / Total Byte Weight 806.9 KB
- **Playwright 实测 CWV（Desktop 1440×900）**：LCP **444 ms** / CLS **0.3202** / INP **296 ms**
- **功能回归**：6/6 全部通过（六大工作区切换 / Ctrl+K 检索 / 六步工坊联动 / 八阶段产业转化 / 报告导出 / 暗色模式），0 运行时错误，119 项药材题库完整。

---

## Round 1 · 阶段①：引入 Vite 构建工具（原生 JS 零改动接入）

- **日期**：2026-11-24
- **阶段与目标**：阶段① — 引入 Vite 6 + `rollup-plugin-visualizer`，保持全部 22 个现有原生 JS 模块零改动，通过统一构建入口 `/src/main.js` 打包输出带 contenthash 的 JS/CSS 产物，同时保留 `_headers`、`manifest.webmanifest` 与 `vendor/` 的原样拷贝。
- **改动文件清单**：
  - 新增：`package.json`、`vite.config.js`、`src/main.js`、`bundle-report/stats.html`、`bundle-report/stats.json`
  - 修改：`index.html`（4 个 CSS `<link>` 与 22 个业务 `<script>` 替换为单个 `<script type="module" src="/src/main.js">`）、`.gitignore`（补充 `dist/`）
  - 原有 `app.js` / `cloud-ai.js` / `lab-*.js` / `styles.css`：**0 字节改动**
- **Bundle 构成与前后对比**：

| 指标 | 基线 (Round 0) | Round 1 (Vite) | 变化 |
| --- | ---: | ---: | ---: |
| 前端总体积 (Raw) | 2,717.42 KB | **2,451.16 KB** | -266.26 KB (-9.8%) |
| 前端总体积 (Gzip) | 798.52 KB | **726.56 KB** | -71.96 KB (-9.0%) |
| 业务 JS 产物 (`assets/index-*.js`) | 1,354.99 KB / 431.03 KB gz | **1,115.04 KB / 368.15 KB gz** | -17.7% Raw / -14.6% Gzip |
| 样式产物 (`assets/index-*.css`) | 114.60 KB / 26.72 KB gz | **89.46 KB / 17.84 KB gz** | -21.9% Raw / -33.2% Gzip |
| Vendor JS (`vendor/*.js`, 4 个) | 1,139.98 KB / 314.54 KB gz | 1,139.98 KB / 314.54 KB gz | 保持不变（后续轮次拆分） |
| `<script>` 标签数 | 27 | **6** | -21 |
| Lighthouse Performance | 44 | **51** | +7 |
| Lighthouse Accessibility | 87 | **87** | 0 |
| Lighthouse Best Practices | 100 | **100** | 0 |
| Lighthouse SEO | 100 | **100** | 0 |
| Lighthouse FCP / LCP / TBT / CLS | 5,072ms / 6,222ms / 879ms / 0 | **4,923ms / 5,605ms / 602ms / 0** | LCP -617ms, TBT -277ms |
| Playwright 实测 CWV (LCP / CLS / INP) | 444ms / 0.3202 / 296ms | **440ms / 0.2510 / 328ms** | 基本持平略优 |

- **Chunk 明细（Round 1）**：
  - `assets/index-C_X8zWyn.js`：1,115.04 KB（Gzip 368.15 KB）
  - `assets/index-BiRl4ByX.css`：89.46 KB（Gzip 17.84 KB）
  - `vendor/tailwindcss-3.4.17.min.js`：397.73 KB（Gzip 120.78 KB）
  - `vendor/lucide-0.460.0.min.js`：347.63 KB（Gzip 80.13 KB）
  - `vendor/chart-4.4.1.umd.min.js`：200.58 KB（Gzip 68.11 KB）
  - `vendor/html2canvas-1.4.1.min.js`：194.03 KB（Gzip 45.53 KB）
  - `index.html`：105.32 KB（Gzip 25.33 KB）
  - `assets/manifest-D_qDZi5u.webmanifest`：1.36 KB（Gzip 0.70 KB）
- **功能回归结论**：**全部通过（6/6）**
  - [x] 全局接口（22/22 `window.TCM_*` + `registerExtension`，119 项题库完整）
  - [x] 六大工作区切换（home / bank / ai / diy / translation / workflow）
  - [x] Ctrl+K 检索（「黄芩」返回 3 条结果，ESC 正常关闭）
  - [x] 六步工坊联动（01~06 步、投料量联动、v4 四谱/标曲挂载）
  - [x] 八阶段产业转化（8/8 阶段切换正常）
  - [x] 报告导出（A4 预览 2,190 字，按钮及 `html2canvas` 就绪）
  - [x] 暗色模式（`body.dark-lab` 切换正常）
  - [x] 安全审计：前端产物零真实密钥泄漏（仅含 `cloud-ai.js` 提示文案字符串）
- **去留判断**：**保留（KEEP）** — 构建耗时仅 596ms，Bundle 总体积下降 9.8%，Lighthouse 性能提升 +7，全量功能零回归。
- **为什么有效**：Vite 将 22 个未压缩业务 JS 与 4 个 CSS 合并、压缩并注入 contenthash，消除了 21 个串行网络请求与注释/空白开销，显著缩短了 LCP 与主线程阻塞时间（TBT）。
- **回退方式**：
  ```powershell
  git checkout -- index.html .gitignore
  Remove-Item -Recurse -Force package.json, package-lock.json, vite.config.js, src, dist, bundle-report
  ```

---

## Round 2 · 阶段②：迁移 `lab-v4-spectroscopy.js` 为标准 ES Module

- **日期**：2026-11-24
- **阶段与目标**：阶段②（组件化第 1 个模块）— 将低风险独立模块 `lab-v4-spectroscopy.js`（多维波谱解析、HPLC/冻干动态装置与 UV 标准曲线拟合）迁移为标准 ES Module `src/modules/lab-v4-spectroscopy.js`，导出具名符号 `V4_RIGS`、`FOUR_SPECTRA_DB`、`renderFourSpectraPanel`、`renderUvCalibrationTool`、`TCM_V4_SPECTRO` 与 `default`，同时保留 `window.TCM_V4_SPECTRO` 冻结全局接口确保 `app.js` 零改动兼容。
- **改动文件清单**：
  - 新增：`src/modules/lab-v4-spectroscopy.js`
  - 修改：`src/main.js`（第 9 行：`../lab-v4-spectroscopy.js` → `./modules/lab-v4-spectroscopy.js`）
  - 保留原根目录 `lab-v4-spectroscopy.js` 供一键回退与对照，且未修改任何数据内容。
- **Bundle 构成与前后对比**：

| 指标 | Round 1 | Round 2 (`v4` ESM) | 相对 Round 1 | 相对基线 (Round 0) |
| --- | ---: | ---: | ---: | ---: |
| 前端总体积 (Raw) | 2,451.16 KB | **2,451.14 KB** | -0.02 KB | -266.28 KB (-9.8%) |
| 前端总体积 (Gzip) | 726.56 KB | **726.65 KB** | +0.09 KB | -71.87 KB (-9.0%) |
| 业务主包 (`assets/index-*.js`) | 1,115.04 KB / 368.15 KB gz | **1,115.03 KB / 368.24 KB gz** | -0.01 KB / +0.09 KB gz | -17.7% Raw / -14.6% Gzip |
| 样式包 (`assets/index-*.css`) | 89.46 KB / 17.84 KB gz | **89.46 KB / 17.84 KB gz** | 0 | -21.9% Raw / -33.2% Gzip |
| Rollup 模块图确认 | 旧 IIFE | **`src/modules/lab-v4-spectroscopy.js`** | 已替换 | ESM 具名导出 6 项 |
| Lighthouse Performance | 51 | **52** | +1 | +8 |
| Lighthouse Accessibility | 87 | **87** | 0 | 0 |
| Lighthouse Best Practices | 100 | **100** | 0 | 0 |
| Lighthouse SEO | 100 | **100** | 0 | 0 |
| Lighthouse FCP / LCP / TBT / CLS | 4,923ms / 5,605ms / 602ms / 0 | **4,917ms / 5,582ms / 589ms / 0** | LCP -23ms, TBT -13ms | LCP -640ms, TBT -290ms |
| Playwright 实测 CWV (LCP / CLS / INP) | 440ms / 0.2510 / 328ms | **428ms / 0.2510 / 328ms** | LCP -12ms | LCP -16ms |

- **功能回归结论**：**全部通过（6/6）**
  - [x] ESM 直接导入校验：Node 原生 `import()` 检出 `V4_RIGS` (`hplc`, `freeze_dry`)、`FOUR_SPECTRA_DB`（11 大类）、`renderFourSpectraPanel`、`renderUvCalibrationTool`、`TCM_V4_SPECTRO`
  - [x] 全局接口（22/22 `window.TCM_*` 完整，`rigs=15`、`topics=119`）
  - [x] 六大工作区切换 / Ctrl+K 检索 / 六步工坊联动（特别确认 `v4Spectra=true`、`v4Uv=true`） / 八阶段产业转化 / 报告导出 / 暗色模式全部通过，0 运行时错误
- **去留判断**：**保留（KEEP）** — 首个 `lab-v*` 模块平稳迁移为标准 ES Module，对外接口零破坏，体积与性能指标均无劣化（Performance 51→52），为后续按需拆包与动态导入奠定模块边界。
- **为什么有效**：解除了 `lab-v4-spectroscopy.js` 的 IIFE 黑盒封装，使 Rollup 可以静态分析其导出符号，同时通过保留 `window.TCM_V4_SPECTRO` 兼容层实现了平滑渐进迁移。
- **回退方式**：
  ```powershell
  # 将 src/main.js 中 './modules/lab-v4-spectroscopy.js' 改回 '../lab-v4-spectroscopy.js'
  Remove-Item -Force src/modules/lab-v4-spectroscopy.js
  npm.cmd run build
  ```

---

## Round 3 · 阶段②：迁移 `lab-v5-encyclopedia.js` 为标准 ES Module

- **日期**：2026-11-24
- **阶段与目标**：阶段②（组件化第 2 个模块）— 将低风险独立模块 `lab-v5-encyclopedia.js`（6 项复方/中试/新药精编课题、12 篇权威文献、6 项院校药企案例与四级中试放大成本核算器）迁移为标准 ES Module `src/modules/lab-v5-encyclopedia.js`，导出具名符号 `V5_PRESETS`、`V5_LITERATURE`、`V5_UNIV_CASES`、`renderScaleUpCalculator`、`TCM_V5_ENCYCLOPEDIA` 与 `default`，同时保留 `window.TCM_V5_ENCYCLOPEDIA` 冻结全局接口，零删改任何药材课题与文献资产。
- **改动文件清单**：
  - 新增：`src/modules/lab-v5-encyclopedia.js`
  - 修改：`src/main.js`（第 10 行：`../lab-v5-encyclopedia.js` → `./modules/lab-v5-encyclopedia.js`）
  - 保留原根目录 `lab-v5-encyclopedia.js` 供一键回退与对照。
- **Bundle 构成与前后对比**：

| 指标 | Round 2 | Round 3 (`v5` ESM) | 相对 Round 2 | 相对基线 (Round 0) |
| --- | ---: | ---: | ---: | ---: |
| 前端总体积 (Raw) | 2,451.14 KB | **2,451.17 KB** | +0.03 KB | -266.25 KB (-9.8%) |
| 前端总体积 (Gzip) | 726.65 KB | **726.65 KB** | 0.00 KB | -71.87 KB (-9.0%) |
| 业务主包 (`assets/index-*.js`) | 1,115.03 KB / 368.24 KB gz | **1,115.05 KB / 368.24 KB gz** | +0.02 KB / 0.00 KB gz | -17.7% Raw / -14.6% Gzip |
| 样式包 (`assets/index-*.css`) | 89.46 KB / 17.84 KB gz | **89.46 KB / 17.84 KB gz** | 0 | -21.9% Raw / -33.2% Gzip |
| Lighthouse Performance | 52 | **51** | -1（±1 测试抖动） | +7 |
| Lighthouse Accessibility | 87 | **87** | 0 | 0 |
| Lighthouse Best Practices | 100 | **100** | 0 | 0 |
| Lighthouse SEO | 100 | **100** | 0 | 0 |
| Lighthouse FCP / LCP / TBT / CLS | 4,917ms / 5,582ms / 589ms / 0 | **4,921ms / 5,607ms / 608ms / 0** | 持平（±25ms） | LCP -615ms, TBT -271ms |
| Playwright 实测 CWV (LCP / CLS / INP) | 428ms / 0.2510 / 328ms | **428ms / 0.2510 / 344ms** | LCP 持平 | LCP -16ms |

- **功能回归结论**：**全部通过（6/6）**
  - [x] ESM 直接导入校验：`V5_PRESETS` (6)、`V5_LITERATURE` (12)、`V5_UNIV_CASES` (6)、`renderScaleUpCalculator`、`TCM_V5_ENCYCLOPEDIA` 全部具名导出
  - [x] 数据资产零删改校验：`topics=119`、`literature=85`、`univCases=38`、`rigs=15` 与基线完全一致
  - [x] 六大工作区切换 / Ctrl+K 检索 / 六步工坊联动（新增显式校验 `v5ScaleUp=true` + `v4Spectra=true` + `v4Uv=true`） / 八阶段产业转化 / 报告导出 / 暗色模式全部通过，0 运行时错误
- **去留判断**：**保留（KEEP）** — 第 2 个 `lab-v*` 模块平稳完成 ES Module 化，Gzip 体积零增长、核心指标持平、全量功能零回归。
- **为什么有效**：继 `v4` 之后将 `v5` 的数据对象与渲染函数解耦为标准 ESM 导出，验证了逐模块迁移模式的可重复性与低风险性；同时保留了 `window.TCM_V5_ENCYCLOPEDIA` 兼容层，不破坏 `app.js`。
- **回退方式**：
  ```powershell
  # 将 src/main.js 中 './modules/lab-v5-encyclopedia.js' 改回 '../lab-v5-encyclopedia.js'
  Remove-Item -Force src/modules/lab-v5-encyclopedia.js
  npm.cmd run build
  ```

---

## 第一段小结与后续轮次候选路线（Round 4 ~ Round 12）

- **当前状态（第 3 轮后）**：已完成阶段①（Vite 构建引入）与阶段②前两轮（`v4`、`v5` ES Module 化）。当前最大性能瓶颈已定位：`<head>` 中 3 个同步阻塞 vendor 脚本（Tailwind 运行时编译器 398 KB、Lucide 348 KB、Chart.js 201 KB）以及单一大主包（1,115 KB），导致 Mobile Lighthouse Performance 停留在 51。
- **建议后续每轮推进顺序（供定时自动化逐轮读取执行）**：
  - **Round 4**（构建与打包）：构建期编译 Tailwind CSS 替代运行时 `tailwindcss-3.4.17.min.js`（或拆出独立 vendor/延迟加载非首屏 vendor），消除 `<head>` 最大阻塞脚本，大幅拉升 Performance 与 LCP。
  - **Round 5**（渲染与性能）：`Chart.js` 仅在图表工作区按需加载，`html2canvas` 仅在报告导出点击时动态加载，移除 `<head>` 阻塞。
  - **Round 6**（阶段②组件化）：迁移 `lab-v6-pro.js` 为标准 ES Module（保持 `window.TCM_V6_PRO` 兼容）。
  - **Round 7**（构建与打包）：按工作区路由做代码分割（`translation` 118 KB、`diy`/`sandbox`/`mission-os` 等按需 chunk），首屏仅加载总览所需 chunk，同时降低桌面 CLS。
  - **Round 8**（阶段③动态化）：基于 `functions/api/ai-proxy.js` 同目录新增 `functions/api/drafts.js`（KV/D1 适配 + 本地降级），实现实验草稿云端保存/恢复/导入导出兼容，并记录 P50/P95 延迟。
  - **Round 9**（动态与数据）：`functions/api/ai-proxy.js` 统一错误码与明确降级提示；只读接口增加边缘缓存与 `ETag`。
  - **Round 10**（阶段④渲染与缓存）：`_headers` 与 Vite `assets/*` hash 配合配置长期强缓存；静态教学区零 JS 水合优化；修复 `meta-viewport` 与标题层级提升可访问性。
  - **Round 11**（SEO 与转化）：补充 `canonical`、`sitemap.xml`、`robots.txt` 与 JSON-LD（`WebApplication` / `EducationalApplication`）。
  - **Round 12**（转化与收尾）：在八阶段主线和六步工坊加入「自动保存已开启」提示与新用户首进引导；全量复测验证终止条件并输出最终交付报告。

---

## Round 4 · 构建与打包（定时任务试跑轮）：Tailwind CSS 构建期静态编译替代运行时 JIT 编译器

- **日期**：2026-11-24
- **阶段与目标**：构建与打包方向 — 引入 `tailwindcss@3.4.17` + `postcss` + `autoprefixer` 于 Vite 构建期静态扫描并编译 `index.html` / `app.js` / `cloud-ai.js` / `lab-*.js` / `src/**/*.js` 所用样式，彻底移除 `<head>` 中同步阻塞的 397.73 KB 运行时脚本 `vendor/tailwindcss-3.4.17.min.js`。
- **改动文件清单**：
  - 新增：`tailwind.config.js`、`postcss.config.js`、`src/tailwind.css`
  - 修改：`package.json`（新增 devDependencies：`tailwindcss@3.4.17`、`postcss`、`autoprefixer`）、`src/main.js`（首行引入 `./tailwind.css`）、`index.html`（移除 `<script src="./vendor/tailwindcss-3.4.17.min.js">`）、`vite.config.js`（`copyStaticAssetsPlugin` 跳过拷贝 `tailwindcss-3.4.17.min.js` 至 `dist/vendor/`）
  - 保留原根目录 `vendor/tailwindcss-3.4.17.min.js` 供一键回退。
- **Bundle 构成与前后对比**：

| 指标 | Round 3 | Round 4 (静态 Tailwind) | 相对 Round 3 | 相对基线 (Round 0) |
| --- | ---: | ---: | ---: | ---: |
| 前端总体积 (Raw) | 2,451.17 KB | **2,111.47 KB** | **-339.70 KB (-13.9%)** | **-605.95 KB (-22.3%)** |
| 前端总体积 (Gzip) | 726.65 KB | **615.44 KB** | **-111.21 KB (-15.3%)** | **-183.08 KB (-22.9%)** |
| 业务主包 (`assets/index-*.js`) | 1,115.05 KB / 368.24 KB gz | 1,115.05 KB / 368.24 KB gz | 0 | -17.7% Raw / -14.6% Gzip |
| 样式包 (`assets/index-*.css`) | 89.46 KB / 17.84 KB gz | **147.56 KB / 27.43 KB gz** | +58.10 KB (+9.59 KB gz) | 替代 397.73 KB JS |
| Vendor JS (`dist/vendor/*`, 3 个) | 1,139.98 KB / 314.54 KB gz | **742.24 KB / 193.77 KB gz** | **-397.74 KB (-120.77 KB gz)** | **-34.9% Raw** |
| `<script>` 标签数 | 6 | **5** | -1（移除最大 `<head>` 同步脚本） | -22 |
| Lighthouse Performance | 51 | **73** | **+22** | **+29** |
| Lighthouse Accessibility | 87 | **87** | 0 | 0 |
| Lighthouse Best Practices | 100 | **100** | 0 | 0 |
| Lighthouse SEO | 100 | **100** | 0 | 0 |
| Lighthouse FCP / LCP / TBT / CLS | 4,921ms / 5,607ms / 608ms / 0 | **2,050ms / 4,701ms / 335ms / 0.0674** | **FCP -2,871ms, LCP -906ms, TBT -273ms** | **FCP -3,022ms, LCP -1,521ms, TBT -544ms** |
| Playwright 实测 CWV (LCP / CLS / INP) | 428ms / 0.2510 / 344ms | **328ms / 0.2506 / 312ms** | **LCP -100ms, INP -32ms** | **LCP -116ms** |

- **Chunk 明细（Round 4）**：
  - `assets/index-Cf2fQ4r4.js`：1,115.05 KB（Gzip 368.24 KB）
  - `vendor/lucide-0.460.0.min.js`：347.63 KB（Gzip 80.13 KB）
  - `vendor/chart-4.4.1.umd.min.js`：200.58 KB（Gzip 68.11 KB）
  - `vendor/html2canvas-1.4.1.min.js`：194.03 KB（Gzip 45.53 KB）
  - `assets/index-D6wY-p8H.css`：147.56 KB（Gzip 27.43 KB，含静态编译 Tailwind + 全站自定义样式）
  - `index.html`：105.26 KB（Gzip 25.31 KB）
  - `assets/manifest-D_qDZi5u.webmanifest`：1.36 KB（Gzip 0.70 KB）
- **功能回归结论**：**全部通过（6/6）**
  - [x] 全局接口（22/22 `window.TCM_*` 完整，`topics=119`、`rigs=15`、`literature=85`、`univCases=38`）
  - [x] 六大工作区切换 / Ctrl+K 检索 / 六步工坊联动（含 `v5ScaleUp` / `v4Spectra` / `v4Uv`） / 八阶段产业转化 / 报告导出 / 暗色模式全部通过，0 console error / 0 page error / 0 failed request
- **去留判断**：**保留（KEEP）** — 单轮 Performance 暴涨 +22（51 → 73），FCP 砍半（4,921ms → 2,050ms），TBT 下降 44.9%，前端总传输净减 111.21 KB Gzip，无任何样式或功能回归。
- **为什么有效**：运行时 Tailwind JIT 需要在 `<head>` 同步下载解析 398 KB JS 并在浏览器主线程遍历 DOM 动态生成样式；改为构建期静态编译后，浏览器仅需解析 27 KB Gzip 静态 CSS，彻底释放首屏解析与主线程执行压力。
- **下一轮计划（Round 5）**：移除 `<head>` 中剩余非首屏阻塞的 `chart-4.4.1.umd.min.js`（200.58 KB）与 `html2canvas-1.4.1.min.js`（194.03 KB），改为仅在进入图表步骤或点击报告导出时按需动态加载，冲击 Lighthouse Performance ≥ 85~90。
- **回退方式**：
  ```powershell
  git checkout -- index.html
  # 恢复 src/main.js、vite.config.js、package.json 中 Tailwind 相关改动并删除新增配置文件
  Remove-Item -Force tailwind.config.js, postcss.config.js, src/tailwind.css
  npm.cmd run build
  ```

---

## Round 5 · 渲染与性能：`Chart.js` 树摇按需 chunk 加载 + `html2canvas` 报告导出动态 `import()`

- **日期**：2026-11-24
- **阶段与目标**：渲染与性能方向 — 移除 `<head>` 中同步阻塞的 `vendor/chart-4.4.1.umd.min.js`（200.58 KB）与 `defer` 的 `vendor/html2canvas-1.4.1.min.js`（194.03 KB），通过 `src/lib/chart-lite.js`（仅注册本工作台实际使用的 Bar/Line/Scale/Legend/Tooltip 控制器以启用 Rollup Tree-shaking）与 `src/lib/lazy-vendors.js` 将两者拆分为独立带 contenthash 的异步 chunk；`Chart.js` 仅在进入 Step 5 时按需加载，`html2canvas` 仅在点击「导出高清长图」时动态 `import()`。
- **改动文件清单**：
  - 新增：`src/lib/lazy-vendors.js`、`src/lib/chart-lite.js`
  - 修改：`package.json`（新增依赖 `chart.js@4.4.1`、`html2canvas@1.4.1`）、`vite.config.js`（`manualChunks` 拆分 `vendor-chart` 与 `vendor-html2canvas`，并跳过拷贝旧 UMD 至 `dist/vendor/`）、`src/main.js`（引入 `./lib/lazy-vendors.js`）、`index.html`（移除 `chart` 与 `html2canvas` 两个 `<script>` 标签）、`app.js`（仅更新 Step 5 图表渲染与 `generateReportImage()` 两处调用点）
  - 保留原根目录 `vendor/chart-4.4.1.umd.min.js` 与 `vendor/html2canvas-1.4.1.min.js` 供一键回退。
- **Bundle 构成与前后对比**：

| 指标 | Round 4 | Round 5 (按需异步 chunk) | 相对 Round 4 | 相对基线 (Round 0) |
| --- | ---: | ---: | ---: | ---: |
| 产物总体积 (Raw / Gzip，含异步 chunk) | 2,111.47 / 615.44 KB | **2,076.20 / 605.89 KB** | **-35.27 / -9.55 KB** | **-641.22 / -192.63 KB (-23.6% / -24.1%)** |
| **首屏加载体积 (Raw / Gzip)** | 2,111.47 / 615.44 KB | **1,719.07 / 503.04 KB** | **-392.40 / -112.40 KB (-18.6% / -18.3%)** | **-998.35 / -295.48 KB (-36.7% / -37.0%)** |
| `Chart.js` 体积 (Raw / Gzip) | 200.58 / 68.11 KB（首屏同步） | **159.35 / 55.80 KB（Step 5 懒加载）** | **-41.23 / -12.31 KB（Tree-shake -20.6%）** | 首屏 0 KB |
| `html2canvas` 体积 (Raw / Gzip) | 194.03 / 45.53 KB（首屏 defer） | **197.62 / 46.91 KB（点击导出时加载）** | 移出首屏 | 首屏 0 KB |
| `<script>` 标签数 | 5 | **3** | -2 | -24 |
| **Lighthouse Performance** | 73 | **78** | **+5** | **+34** (44 → 78) |
| Lighthouse A11y / BP / SEO | 87 / 100 / 100 | **87 / 100 / 100** | 0 | 持平 |
| Lighthouse LCP / TBT / CLS | 4,701ms / 335ms / 0.0674 | **3,920ms / 0ms / 0.0674** | **LCP -781ms, TBT -335ms (归零!)** | **LCP -2,302ms, TBT -879ms** |
| Lighthouse Total Byte Weight | 632.7 KB | **517.0 KB** | **-115.7 KB** | **-289.9 KB (-35.9%)** |
| Playwright 实测 CWV (LCP / CLS / INP) | 328ms / 0.2506 / 312ms | **296ms / 0.2506 / 280ms** | **LCP -32ms, INP -32ms** | **LCP -148ms, INP -16ms** |

- **Chunk 明细（Round 5）**：
  - 首屏加载：`assets/index-Dw3TMugu.js` (1,117.38 KB / 369.50 KB gz)、`vendor/lucide-0.460.0.min.js` (347.63 KB / 80.13 KB gz)、`assets/index-D6wY-p8H.css` (147.56 KB / 27.43 KB gz)、`index.html` (105.15 KB / 25.29 KB gz)、`assets/manifest-D_qDZi5u.webmanifest` (1.36 KB / 0.70 KB gz)
  - 按需异步 chunk：`assets/vendor-chart-DUOW7cAq.js` (159.35 KB / 55.80 KB gz) + `assets/chart-lite-Cr0mzq6x.js` (0.16 KB / 0.14 KB gz)、`assets/vendor-html2canvas-B0tyYwQk.js` (197.62 KB / 46.91 KB gz)
- **功能回归结论**：**全部通过（6/6，含升级后的懒加载端到端实测）**
  - [x] 首屏零预加载确认：`chartLoadedOnHome = false`、`h2cLoadedOnHome = false`
  - [x] 全局接口与数据资产（22/22 `window.TCM_*`、`topics=119`、`rigs=15`、`literature=85`、`univCases=38`）
  - [x] 六大工作区切换 / Ctrl+K 检索 / 暗色模式 / 八阶段产业转化全部通过
  - [x] 六步工坊联动：进入 Step 5 时 `Chart.js` 按需加载并成功绘制 `#yieldChart`（`chartLazyLoaded=true, chartRendered=true`）
  - [x] 报告导出：点击 `#btnExportImage` 时 `html2canvas` 动态 `import()` 并生成完整 PNG 长图（1,681,106 bytes data URL）并弹出预览模态框，0 console error / 0 page error / 0 failed request
- **去留判断**：**保留（KEEP）** — 首屏传输骤降 112.40 KB Gzip，Lighthouse TBT 直接降至 **0ms**，LCP 缩减 781ms，Performance 升至 **78**，且总产物借助 Chart.js Tree-shaking 再净减 35.27 KB。
- **为什么有效**：彻底消除了 `<head>` 中最后两个非首屏重型第三方库，同时 `chart-lite.js` 按需注册 Bar/Line 控制器剔除了未使用的雷达/极坐标/饼图模块。
- **下一轮计划（Round 6）**：攻克 `<head>` 中最后 1 个同步阻塞脚本 `vendor/lucide-0.460.0.min.js`（347.63 KB Raw / 80.13 KB Gzip）—— 统计全站实际使用的 Lucide 图标集合并改为构建期按需引入（或 `lucide` ESM Tree-shake），直接消除最后 348 KB 首屏阻塞，预计可一举把 Lighthouse Performance 推上 **88~92+**！
- **回退方式**：
  ```powershell
  git checkout -- index.html app.js
  # 还原 src/main.js、vite.config.js、package.json 中 lazy-vendors/chart.js/html2canvas 改动并删除新增文件
  Remove-Item -Force src/lib/lazy-vendors.js, src/lib/chart-lite.js
  npm.cmd --prefix C:/Users/Administrator/.gemini/antigravity/scratch/tcm-chemistry-lab run build
  ```

---

## Round 6 · 构建与打包：`lucide` 14 图标按需 Tree-shake，彻底清零 `<head>` 阻塞脚本

- **日期**：2026-11-24
- **阶段与目标**：构建与打包方向 — 扫描全站实际使用到的 `data-lucide` 图标集合（仅 14 个：`arrow-right`、`book-open`、`clipboard-copy`、`file-text`、`image-down`、`mail`、`maximize-2`、`panel-right-close`、`printer`、`rotate-ccw`、`sliders`、`sparkles`、`wand-2`、`x`），通过 `src/lib/lucide-lite.js` 按需引入并暴露兼容 `window.lucide.createIcons`，彻底移除 `<head>` 中最后一个同步阻塞的 347.63 KB 全量图标库 `vendor/lucide-0.460.0.min.js`。
- **改动文件清单**：
  - 新增：`src/lib/lucide-lite.js`
  - 修改：`package.json`（新增依赖 `lucide@0.460.0`）、`src/main.js`（首部引入 `./lib/lucide-lite.js`）、`index.html`（移除 `<script src="./vendor/lucide-0.460.0.min.js">`）、`vite.config.js`（跳过拷贝 `lucide-0.460.0.min.js`，至此 `dist/vendor/` 彻底清零）
  - 保留原根目录 `vendor/lucide-0.460.0.min.js` 供一键回退。
- **Bundle 构成与前后对比**：

| 指标 | Round 5 | Round 6 (Lucide 14 图标按需) | 相对 Round 5 | 相对基线 (Round 0) |
| --- | ---: | ---: | ---: | ---: |
| 产物总体积 (Raw / Gzip，含异步 chunk) | 2,076.20 / 605.89 KB | **1,736.61 / 527.96 KB** | **-339.59 / -77.93 KB (-16.4% / -12.9%)** | **-980.81 / -270.56 KB (-36.1% / -33.9%)** |
| **首屏加载体积 (Raw / Gzip)** | 1,719.07 / 503.04 KB | **1,379.48 / 425.10 KB** | **-339.59 / -77.94 KB (-19.8% / -15.5%)** | **-1,337.94 / -373.42 KB (-49.2% / -46.8%)** |
| Lucide 体积 (Raw / Gzip) | 347.63 / 80.13 KB（全量同步） | **8.07 / 2.20 KB（仅 14 图标）** | **-97.7% Raw / -97.3% Gzip** | 零 `<head>` 阻塞 |
| `<script>` 标签数 | 3 | **2**（1 极短内联 + 1 ESM） | -1 | -25 |
| **Lighthouse Performance** | 78 | **82** | **+4** | **+38** (44 → 82) |
| Lighthouse A11y / BP / SEO | 87 / 100 / 100 | **87 / 100 / 100** | 0 | 持平 |
| Lighthouse FCP / LCP / TBT / CLS | 3,920ms / 3,920ms / 0ms / 0.0674 | **3,380ms / 3,530ms / 100ms / 0.0674** | **FCP -540ms, LCP -390ms** | **LCP -2,692ms (-43.3%)** |
| Lighthouse Total Byte Weight | 517.0 KB | **436.8 KB** | **-80.2 KB** | **-370.1 KB (-45.9%)** |
| Playwright 实测 CWV (LCP / CLS / INP) | 296ms / 0.2506 / 280ms | **260ms / 0.2506 / 312ms** | **LCP -36ms** | **LCP -184ms (-41.4%)** |

- **Chunk 明细（Round 6）**：
  - 首屏加载：`assets/index-BTaJGVjD.js` (1,125.45 KB / 371.70 KB gz)、`assets/index-D6wY-p8H.css` (147.56 KB / 27.43 KB gz)、`index.html` (105.12 KB / 25.28 KB gz)、`assets/manifest-D_qDZi5u.webmanifest` (1.36 KB / 0.70 KB gz)
  - 按需异步 chunk：`assets/vendor-html2canvas-B0tyYwQk.js` (197.62 KB / 46.91 KB gz)、`assets/vendor-chart-DUOW7cAq.js` (159.35 KB / 55.80 KB gz)、`assets/chart-lite-Cr0mzq6x.js` (0.16 KB / 0.14 KB gz)
  - `dist/vendor/`：已完全清空（原有 4 个 1,140 KB 阻塞 vendor 全部完成构建化/懒加载改造）
- **功能回归结论**：**全部通过（6/6）**
  - [x] 图标完整性验证：`unrenderedLucide = 0`、`renderedLucideSvgs = 23`（全页 23 处图标全部正常渲染为矢量 SVG，零空框）
  - [x] 首屏零预加载：`chartLoadedOnHome = false`、`h2cLoadedOnHome = false`
  - [x] 全局接口与数据资产（22/22 `window.TCM_*`、`topics=119`、`rigs=15`、`literature=85`、`univCases=38`）
  - [x] 六大工作区切换 / Ctrl+K 检索 / 六步工坊联动（含 Step 5 懒加载图表） / 八阶段产业转化 / 报告导出（含 `html2canvas` 懒加载 PNG 生成） / 暗色模式全部通过，0 console error / 0 page error / 0 failed request
- **去留判断**：**保留（KEEP）** — 彻底消灭 `<head>` 中所有同步阻塞脚本，首屏体积相对基线减半（-49.2% Raw / -46.8% Gzip），Lighthouse Performance 攀升至 **82**。
- **为什么有效**：原全量 `lucide-0.460.0.min.js` 内含 1,500+ 图标定义并同步阻塞解析；改为 ESM 按需仅导出实际使用的 14 个图标后，Lucide 体积缩减 97.7% 并随主 ESM 模块非阻塞加载。
- **下一轮计划（Round 7）**：按工作区路由做代码分割——将非首屏体积最大的「八阶段产业转化」工作区（`lab-v18-translation-data.js` 56.31 KB + `lab-v18-translation.js` 118.85 KB，合计 175.16 KB）拆分为按需路由 chunk，仅在切换到 `translation` 工作区时动态加载，进一步压低主包体积与 FCP/LCP。
- **回退方式**：
  ```powershell
  git checkout -- index.html
  # 恢复 src/main.js、vite.config.js、package.json 中 lucide 相关改动并删除 src/lib/lucide-lite.js
  Remove-Item -Force src/lib/lucide-lite.js
  npm.cmd --prefix C:/Users/Administrator/.gemini/antigravity/scratch/tcm-chemistry-lab run build
  ```

---

## Round 7 · 构建与打包：按工作区路由代码分割（八阶段产业转化 `route-translation` 独立懒加载 Chunk）

- **日期**：2026-11-24
- **阶段与目标**：构建与打包方向 — 将非首屏体积最大的「八阶段产业转化」工作区（`lab-v18-translation-data.js` 56.31 KB + `lab-v18-translation.js` 118.85 KB + `lab-v18-translation.css` 18.6 KB）拆分为独立带 contenthash 的异步路由 chunk（`route-translation-*.js` + `route-translation-*.css`）；首屏仅注册 ~1 KB 轻代理 `src/routes/translation-loader.js` 维持 `window.TCM_TRANSLATION` 完整外部接口不变，仅当用户切换至 `translation` 工作区或触发偏差/导入跳转时才按需动态加载。
- **改动文件清单**：
  - 新增：`src/routes/translation-chunk.js`、`src/routes/translation-loader.js`
  - 修改：`src/main.js`（移除 `lab-v18-translation.css` / `lab-v18-translation-data.js` / `lab-v18-translation.js` 静态导入，改为引入 `./routes/translation-loader.js`）、`vite.config.js`（`manualChunks` 独立输出 `route-translation`）
  - `lab-v15-insight.js` / `lab-v16-portal.js` / `lab-v18-translation*.js`：**0 字节改动**
- **Bundle 构成与前后对比**：

| 指标 | Round 6 | Round 7 (`route-translation` 拆包) | 相对 Round 6 | 相对基线 (Round 0) |
| --- | ---: | ---: | ---: | ---: |
| 产物总体积 (Raw / Gzip，含异步 chunk) | 1,736.61 / 527.96 KB | 1,737.25 / 529.41 KB | +0.64 / +1.45 KB（路由代理） | **-36.1% / -33.7%** |
| **首屏加载体积 (Raw / Gzip)** | 1,379.48 / 425.10 KB | **1,224.88 / 378.29 KB** | **-154.60 / -46.81 KB (-11.2% / -11.0%)** | **-54.9% / -52.6%** |
| 首屏主 JS (`assets/index-*.js`) | 1,125.45 / 371.70 KB | **984.87 / 327.17 KB** | **-140.58 / -44.53 KB** | 首次跌破 1 MB Raw |
| 首屏主 CSS (`assets/index-*.css`) | 147.56 / 27.43 KB | **133.54 / 25.14 KB** | **-14.02 / -2.29 KB** | `v18` 样式独立按需加载 |
| **Lighthouse Performance** | 82 | **86** | **+4** | **+42** (44 → 86) |
| Lighthouse A11y / BP / SEO | 87 / 100 / 100 | **87 / 100 / 100** | 0 | 持平 |
| Lighthouse FCP / LCP / TBT / CLS | 3,380ms / 3,530ms / 100ms / 0.0674 | **3,147ms / 3,147ms / 0ms / 0.0674** | **LCP -383ms, TBT 归零** | **LCP -3,075ms (-49.4%)** |
| Lighthouse Total Byte Weight | 436.8 KB | **388.8 KB** | **-48.0 KB** | **-418.1 KB (-51.8%)** |
| Playwright 实测 CWV (LCP / CLS / INP) | 260ms / 0.2506 / 312ms | **280ms / 0.2506 / 288ms** | INP -24ms | LCP -164ms |

- **Chunk 明细（Round 7）**：
  - 首屏加载：`assets/index-Br3f4NUM.js` (984.87 KB / 327.17 KB gz)、`assets/index-CAnHFwlj.css` (133.54 KB / 25.14 KB gz)、`index.html` (105.12 KB / 25.28 KB gz)、`assets/manifest-D_qDZi5u.webmanifest` (1.36 KB / 0.70 KB gz)
  - 按需异步 chunk：`assets/vendor-html2canvas-B0tyYwQk.js` (197.62 KB / 46.91 KB gz)、`assets/vendor-chart-DUOW7cAq.js` (159.35 KB / 55.80 KB gz) + `chart-lite` (0.16 KB)、**`assets/route-translation-CI8kIkcX.js` (141.20 KB / 45.12 KB gz) + `assets/route-translation-CRQgllPV.css` (14.04 KB / 3.14 KB gz)**
- **功能回归结论**：**全部通过（6/6）**
  - [x] 首屏按需隔离确认：`v18DataLoadedOnHome = false`、`chartLoadedOnHome = false`、`h2cLoadedOnHome = false`
  - [x] 八阶段产业转化端到端实测：点击「产业转化」自动拉取 `route-translation` JS+CSS，8 阶段完整渲染（`v18DataLazyLoaded = true`），阶段切换无闪烁、无报错
  - [x] 六大工作区切换 / Ctrl+K 检索 / 六步工坊联动 / 报告导出 / 暗色模式全部通过，0 console error / 0 page error / 0 failed request，119 项药材题库完整
- **去留判断**：**保留（KEEP）** — 首屏加载体积相对基线减少 **54.9% Raw / 52.6% Gzip**，Lighthouse Performance 跃升至 **86**，TBT 保持 **0ms**，距离 Performance ≥ 90 仅差 4 分。
- **为什么有效**：通过轻代理模式将 155 KB（48.3 KB Gzip）的 `v18` 产业转化引擎+数据+样式完整剥离出首屏关键路径，既保持原有 `window.TCM_TRANSLATION` 零破坏兼容，又直接压缩首屏传输与解析时间。
- **下一轮计划（Round 8）**：进入 **阶段③：动态化** — 基于 `functions/api/ai-proxy.js` 扩展 Cloudflare Pages Functions 接口 `functions/api/drafts.js`（同时兼容 KV 绑定 `TCM_DRAFTS_KV` 与 D1 绑定 `TCM_DRAFTS_DB`），实现实验草稿云端保存/恢复/导入导出兼容及未登录本地降级，补充无痕启动脚本开关以解决「刷新即重置」痛点，并实测 API P50/P95 延迟。
- **回退方式**：
  ```powershell
  # 恢复 src/main.js 与 vite.config.js 中 route-translation 相关改动
  Remove-Item -Recurse -Force src/routes
  npm.cmd --prefix C:/Users/Administrator/.gemini/antigravity/scratch/tcm-chemistry-lab run build
  ```

---

## Round 8 · 阶段③动态化：Cloudflare Pages Functions 草稿云端保存接口 (`KV` / `D1`) + 本地降级同步

- **日期**：2026-11-24
- **阶段与目标**：阶段③（动态化）— 基于 `functions/api/ai-proxy.js` 同目录扩展 `functions/api/drafts.js`（及 D1 建表脚本 `functions/api/drafts.schema.sql`），同时兼容 Cloudflare KV（`TCM_DRAFTS_KV`）与 D1（`TCM_DRAFTS_DB`）双数据层；新增前端模块 `src/modules/cloud-drafts.js`，原样同步与恢复与 `tcm_lab_backup.json` 完全一致的草稿数据结构，提供 `ETag` 条件缓存、SHA-256 凭证防越权覆盖、URL `?draft=<id>` 跨设备恢复，以及未绑定/离线时自动回退至 `localStorage`（彻底解决「刷新即重置」痛点）。
- **改动文件清单**：
  - 新增：`functions/api/drafts.js`、`functions/api/drafts.schema.sql`、`src/modules/cloud-drafts.js`
  - 修改：`app.js`（`saveState()` 派发 `tcm:draft-changed` 事件；`window.TCM_LAB_API` 新增 `exportDraftState()` / `importDraftState()` 两个无破坏桥接方法）、`src/main.js`（引入 `./modules/cloud-drafts.js`）
- **API 实测与性能指标（60 样本基准 + 双后端 CRUD + 端到端浏览器验证）**：
  - **KV 后端 (`TCM_DRAFTS_KV`)**：健康检查 `200` / 创建 `201` / 读取 `200` / `If-None-Match` 命中 `ETag` 返回 `304` / 错误凭证更新拦截 `403` / 合法凭证更新 `200` / 删除 `200` / 删后读取 `404` — **全部通过**
  - **D1 后端 (`TCM_DRAFTS_DB`)**：自动建表 `tcm_drafts`、写入与读取校验 `mass=350` — **全部通过**
  - **未绑定存储降级**：空 `env` 返回 `503`（`code: STORAGE_NOT_CONFIGURED`, `fallback: local`）并触发前端本地降级 — **全部通过**
  - **API 响应延迟（本地标准 Fetch/Web Runtime，60 次/项）**：
    - `POST /api/drafts`：**P50 = 0.74 ms**，**P95 = 1.13 ms**
    - `GET /api/drafts?id=...`：**P50 = 0.40 ms**，**P95 = 0.50 ms**
  - **浏览器端到端实测**：修改投料量至 `350 g` → 点击云端保存获得编号 `tcm_27459f8f96df` → **刷新页面后仍为 `350 g`** → 全新无痕浏览器访问 `/?draft=tcm_27459f8f96df` **自动恢复 `350 g`**！
- **Bundle 构成与前后对比**：

| 指标 | Round 7 | Round 8 (草稿云端保存) | 相对 Round 7 | 相对基线 (Round 0) |
| --- | ---: | ---: | ---: | ---: |
| 产物总体积 (Raw / Gzip，含异步 chunk) | 1,737.25 / 529.41 KB | 1,743.99 / 531.83 KB | +6.74 / +2.42 KB | **-35.8% / -33.4%** |
| 首屏加载体积 (Raw / Gzip) | 1,224.88 / 378.29 KB | 1,231.62 / 380.71 KB | +6.74 / +2.42 KB | **-54.7% / -52.3%** |
| Lighthouse Performance | 86 | **86** | 0（首屏零额外请求） | **+42** (44 → 86) |
| Lighthouse A11y / BP / SEO | 87 / 100 / 100 | **87 / 100 / 100** | 0 | 持平 |
| Lighthouse FCP / LCP / TBT / CLS | 3,147ms / 3,147ms / 0ms / 0.0674 | **3,148ms / 3,148ms / 0ms / 0.0674** | 持平 | **LCP -3,074ms (-49.4%)** |
| Playwright 实测 CWV (LCP / CLS / INP) | 280ms / 0.2506 / 288ms | **244ms / 0.2506 / 264ms** | **LCP -36ms, INP -24ms** | **LCP -200ms, INP -32ms** |

- **功能回归与安全审计结论**：**全部通过（6/6 + 云草稿 E2E + 安全零密钥）**
  - [x] 安全审计：前端 `dist/` 全量扫描 `DRAFTS_ACCESS_SECRET` 与 API Key 模式命中 `0` 处；服务端可选口令仅从 `context.env` 读取
  - [x] 六大工作区切换 / Ctrl+K 检索 / 六步工坊联动 / 八阶段产业转化 / 报告导出 / 暗色模式全部通过，0 console error / 0 page error / 0 failed request，119 项药材题库完整
- **去留判断**：**保留（KEEP）** — 仅增 2.42 KB Gzip 即完整落地阶段③动态化云端草稿保存能力，支持 KV/D1 与本地无缝降级，零首屏性能损耗。
- **为什么有效**：首屏不主动请求 `/api/drafts`（仅用户点击保存/恢复或携带 `?draft=` 时触发），因此完全不拖累 FCP/LCP；同时复用现有 `normalizeState()` 校验逻辑，保证云端草稿与本地 `tcm_lab_backup.json` 导出导入 100% 互通。
- **下一轮计划（Round 9 · 阶段④渲染与性能冲刺 ≥90）**：继续对非首屏重型工作区做按需路由/功能分包（如将 `diy` 工作区与沙盒/任务舱/课程图谱 `lab-v10-sandbox.js` + `lab-v12-diy-studio.js` + `lab-v13-mission-os.js` + `lab-v14-course-diagrams.js` + `lab-v17-ai-review.js` 合计 ~203 KB 剥离出首屏主包），将首屏 JS 压低 ~200 KB 以冲击 **Lighthouse Performance ≥ 90** 达标线！
- **回退方式**：
  ```powershell
  git checkout -- app.js
  # 从 src/main.js 移除 './modules/cloud-drafts.js'
  Remove-Item -Force functions/api/drafts.js, functions/api/drafts.schema.sql, src/modules/cloud-drafts.js
  npm.cmd --prefix C:/Users/Administrator/.gemini/antigravity/scratch/tcm-chemistry-lab run build
  ```

---

## Round 9 · 阶段④渲染优化尝试：首页静态壳预渲染 + 原位水合（**已回退**）

- **日期**：2026-11-24
- **阶段与目标**：阶段④（渲染策略优化）— 尝试在 `index.html` 中为 `<body>` 预置 `data-v16-mode="portal" data-v16-route="home"` 并静态内联 `#v16HomePage` 首页壳，`lab-v16-portal.js` 启动时直接原位水合以提前 FCP/LCP。
- **尝试改动文件（均已回退）**：`index.html`、`lab-v16-portal.js`
- **实测前后对比**：

| 指标 | Round 8（回退前基准） | Round 9（实测） | 变化 |
| --- | ---: | ---: | --- |
| 首屏加载体积 (Raw / Gzip) | 1,231.62 / 380.71 KB | 1,242.57 / 383.73 KB | +3.02 KB gz |
| Lighthouse FCP / LCP | 3,148 / 3,148 ms | **2,929 / 2,929 ms** | -219 ms（改善） |
| **Lighthouse CLS** | 0.0674 | **0.1357** | **+0.0683（劣化）** |
| **Lighthouse Performance** | **86** | **85** | **-1（劣化）** |
| **Playwright 桌面 CLS** | 0.2506 | **0.5168** | **+0.2662（显著劣化）** |
| Playwright 桌面 INP | 264 ms | 256 ms | -8 ms |
| 功能回归 | 6/6 ✅ | 6/6 ✅ | 通过 |

- **去留判断**：**已回退（ROLLED BACK）** — 严格遵守迭代规则第 3 条：尽管 FCP/LCP 缩短 219 ms，但 CLS 从 0.0674 劣化至 0.1357（桌面 CLS 升至 0.5168），导致 Lighthouse Performance 从 86 降至 85，立即全量回退至 Round 8 状态并重新构建 `dist/` 确认恢复。
- **原因分析（为何无效）**：
  1. 静态预渲染首页后，`<header>` 内原有 `#workspaceZoneBar` 5 个旧导航按钮在 `upgradeHeaderNav()` 执行时被替换为 6 个 `.v16-route-tab` 新按钮并隐藏旧按钮，导致顶栏高度动态跳变并将已绘制的 `#v16HomePage` 整体向下推挤，反而放大了 CLS 惩罚；
  2. 且在 `index-*.css`（136.9 KB）仍作为 `<head>` 阻塞样式加载的前提下，静态壳仅带来了 219 ms FCP 收益，无法抵消顶栏重排带来的 CLS 扣分。
- **下一轮计划（Round 10）**：针对真实根因——**继续削减首屏主包体积 + 拆分非首屏重型交互工作区**（将 `diy` 实验室 / 沙盒 / 任务舱 / 课程图谱 / AI 评审模块 `lab-v10-sandbox`、`lab-v12-diy-studio`、`lab-v13-mission-os`、`lab-v14-course-diagrams`、`lab-v17-ai-review` 合计 ~203 KB 拆为按需异步 chunk），在不触发任何顶栏重排/CLS 劣化的前提下把首屏 JS 再压低 ~200 KB，直接把 Mobile FCP/LCP 压进 2.5s 以内并冲击 Performance **≥ 90**！
- **回退方式**：已执行回退（恢复 `index.html` 与 `lab-v16-portal.js` 至 Round 8 版本并重跑 `npm.cmd run build`）。

---

## Round 10 · 阶段④按需水合与路由分包：拆分 DIY 实验室/任务舱 (`route-diy`) 与 AI 评审/自有方案 (`modal-ai-review`) 异步 Chunk

- **日期**：2026-11-24
- **阶段与目标**：阶段④（按需水合与代码分割）— 将 4 个非首屏交互密集模块（`lab-v12-diy-studio.js` 29.08 KB + `lab-v13-mission-os.js` 62.67 KB → `route-diy-*.js`；`lab-v11-userplan.js` 29.45 KB + `lab-v17-ai-review.js` 47.37 KB → `modal-ai-review-*.js`，合计 168.57 KB 源码）通过轻代理 `src/routes/interactive-loaders.js` 剥离出首屏主包，仅在用户进入 DIY 实验室、任务舱或打开自有方案/AI 评审弹窗时按需水合，保持 4 个 `window.TCM_*` 全局接口零破坏兼容。
- **改动文件清单**：
  - 新增：`src/routes/diy-chunk.js`、`src/routes/ai-review-chunk.js`、`src/routes/interactive-loaders.js`
  - 修改：`src/main.js`（以 `./routes/interactive-loaders.js` 替代 4 个模块的静态导入）、`vite.config.js`（`manualChunks` 输出 `route-diy` 与 `modal-ai-review`）
  - `lab-v11/v12/v13/v17`、`app.js`、`lab-v16-portal.js`：**0 字节改动**
- **Bundle 构成与前后对比**：

| 指标 | Round 8（有效基线） | Round 10 (DIY & AI 评审分包) | 相对 Round 8 | 相对基线 (Round 0) |
| --- | ---: | ---: | ---: | ---: |
| 产物总体积 (Raw / Gzip，含异步 chunk) | 1,743.99 / 531.83 KB | 1,745.48 / 534.74 KB | +1.49 / +2.91 KB | **-35.8% / -33.0%** |
| **首屏加载体积 (Raw / Gzip)** | 1,231.62 / 380.71 KB | **1,096.88 / 339.34 KB** | **-134.74 / -41.37 KB (-10.9%)** | **-59.6% / -57.5%** |
| 首屏主 JS (`assets/index-*.js`) | 991.43 / 329.58 KB | **856.68 / 288.20 KB** | **-134.75 / -41.38 KB** | 跌破 860 KB Raw |
| **Lighthouse Performance** | 86 | **88** | **+2** | **+44** (44 → 88) |
| Lighthouse A11y / BP / SEO | 87 / 100 / 100 | **87 / 100 / 100** | 0 | 持平 |
| Lighthouse FCP / LCP / CLS | 3,148 / 3,148 ms / 0.0674 | **2,844 / 2,994 ms / 0.0674** | **FCP -304ms, LCP 首次跌破 3s!** | **LCP -3,228ms (-51.9%)** |
| Lighthouse Total Byte Weight | 391.3 KB | **348.9 KB** | **-42.4 KB** | **-458.0 KB (-56.8%)** |
| Playwright 实测 CWV (LCP / CLS / INP) | 244ms / 0.2506 / 264ms | **256ms / 0.2506 / 256ms** | **INP -8ms**, CLS 零劣化 | **LCP -188ms, INP -40ms** |

- **Chunk 明细（Round 10）**：
  - 首屏加载：`assets/index-CajpoZiL.js` (856.68 KB / 288.20 KB gz)、`assets/index-DZRdGdUZ.css` (133.72 KB / 25.16 KB gz)、`index.html` (105.12 KB / 25.28 KB gz)、`assets/manifest-D_qDZi5u.webmanifest` (1.36 KB / 0.70 KB gz)
  - 异步按需 chunk：`vendor-html2canvas` (197.62 KB / 46.91 KB gz)、`vendor-chart` (159.35 KB / 55.80 KB gz)、`route-translation` (141.20 KB JS + 14.04 KB CSS)、**`route-diy` (75.51 KB / 23.53 KB gz)**、**`modal-ai-review` (60.72 KB / 20.75 KB gz)**
- **功能回归结论**：**全部通过（6/6）**
  - [x] 全局接口与数据资产（所有 `window.TCM_*` 兼容代理完整，`topics=119`、`rigs=15`、`literature=85`、`univCases=38`）
  - [x] 六大工作区切换（含点击 DIY 实验室触发 `route-diy` 按需水合） / Ctrl+K 检索 / 六步工坊联动 / 八阶段产业转化 / 报告导出 / 暗色模式全部通过，0 console error / 0 page error / 0 failed request
- **去留判断**：**保留（KEEP）** — 首屏加载体积相对基线削减 **59.6% Raw / 57.5% Gzip**，Mobile LCP 首次跌破 3.0s，Lighthouse Performance 提升至 **88**（距 ≥90 仅差 2 分），且 CLS 零劣化。
- **为什么有效**：在 4G 移动带宽下，削减 41.4 KB Gzip 首屏主包直接缓解了与首屏 CSS 的带宽竞争，将 FCP 提前 304ms 而不引发任何顶栏重排。
- **下一轮计划（Round 11 · 冲刺 Performance ≥ 90 达标线）**：继续将剩余非首屏交互模块 `lab-v15-insight.js`（41.15 KB）+ `lab-v15-insight.css`（13 KB）+ `lab-v8-studio.js`（36.97 KB）+ `lab-v9-visuals.js`（36.77 KB）拆分为按需异步 chunk（合计再减 ~42 KB Gzip 首屏传输），同时完善 `_headers` 针对 Vite `/assets/*` contenthash 产物的长期不可变缓存策略，一举推动 Lighthouse Performance 跨过 **90+** 达标线！
- **回退方式**：
  ```powershell
  # 恢复 src/main.js 与 vite.config.js 中 route-diy / modal-ai-review 改动
  Remove-Item -Force src/routes/diy-chunk.js, src/routes/ai-review-chunk.js, src/routes/interactive-loaders.js
  npm.cmd --prefix C:/Users/Administrator/.gemini/antigravity/scratch/tcm-chemistry-lab run build
  ```

---

## Round 11 · 阶段④按需水合与样式分包：拆分工坊可视化 (`route-workflow-visuals`) 与项目中枢 (`modal-insight`) —— **全部终止条件达标！**

- **日期**：2026-11-24
- **阶段与目标**：阶段④（按需水合与渲染优化）— 将剩余 3 个非首屏交互/样式模块（`lab-v8-studio.js` 36.97 KB + `lab-v9-visuals.js` 36.77 KB → `route-workflow-visuals-*.js`；`lab-v15-insight.js` 41.15 KB + `lab-v15-insight.css` 27.67 KB → `modal-insight-*.js` + `modal-insight-*.css`）拆分为独立按需异步 chunk；通过 `src/routes/interactive-loaders.js` 轻代理维持 `window.TCM_STUDIO_V8`、`window.TCM_V9`、`window.TCM_V15_INSIGHT` 零破坏兼容，并在检测到进入 `workflow` 路由或点击项目中枢/字号/驾驶舱按钮时自动水合并重放同步参数。
- **改动文件清单**：
  - 新增：`src/routes/workflow-visuals-chunk.js`、`src/routes/insight-chunk.js`
  - 修改：`src/routes/interactive-loaders.js`、`src/main.js`、`vite.config.js`
  - 原有业务模块与数据资产：**0 字节改动**
- **Bundle 构成与前后对比**：

| 指标 | Round 10 | Round 11 (最终达标版) | 相对 Round 10 | 相对纯静态基线 (Round 0) |
| --- | ---: | ---: | ---: | ---: |
| 产物总体积 (Raw / Gzip，含全部异步 chunk) | 1,745.48 / 534.74 KB | **1,746.77 / 537.36 KB** | +1.29 / +2.62 KB | **-970.65 / -261.16 KB (-35.7% / -32.7%)** |
| **首屏加载体积 (Raw / Gzip)** | 1,096.88 / 339.34 KB | **979.78 / 305.80 KB** | **-117.10 / -33.54 KB (-10.7% / -9.9%)** | **-1,737.64 / -492.72 KB (-63.9% / -61.7%)** |
| 首屏主 JS (`assets/index-*.js`) | 856.68 / 288.20 KB | **766.60 / 260.11 KB** | **-90.08 / -28.09 KB** | **-43.4% Raw**（相对 1,355 KB 业务 JS） |
| 首屏主 CSS (`assets/index-*.css`) | 133.72 / 25.16 KB | **106.71 / 19.71 KB** | **-27.01 / -5.45 KB** | 含静态编译 Tailwind + 核心样式 |
| `<script>` 标签数 | 2 | **2** | 0 | **-25**（27 → 2） |
| **Lighthouse Performance** | 88 | **90** 🎯 | **+2** | **+46**（44 → **90**） |
| **Lighthouse Accessibility** | 87 | **87** | 0 | 0 |
| **Lighthouse Best Practices** | 100 | **100** | 0 | 0 |
| **Lighthouse SEO** | 100 | **100** 🎯 | 0 | 0 |
| Lighthouse FCP / LCP / TBT / CLS | 2,844 / 2,994 ms / 100ms / 0.0674 | **2,687 / 2,837 ms / 100ms / 0.0653** | **FCP -157ms, LCP -157ms, CLS 改善** | **LCP -3,385ms (-54.4%), TBT -779ms** |
| Lighthouse Total Byte Weight | 348.9 KB | **314.5 KB** | **-34.4 KB** | **-492.4 KB (-61.0%)** |
| Playwright 实测 CWV (LCP / CLS / INP) | 256ms / 0.2506 / 256ms | **248ms / 0.2429 / 240ms** | **LCP -8ms, CLS 改善, INP -16ms** | **LCP -196ms (-44.1%), INP -56ms (-18.9%)** |

- **最终全部 Chunk 清单（Round 11）**：
  - **首屏加载（4 个资源，合计 979.78 KB Raw / 305.80 KB Gzip）**：
    - `assets/index-D3lLIp0C.js`：766.60 KB（Gzip 260.11 KB）
    - `assets/index-BNmGu39h.css`：106.71 KB（Gzip 19.71 KB）
    - `index.html`：105.12 KB（Gzip 25.28 KB）
    - `assets/manifest-D_qDZi5u.webmanifest`：1.36 KB（Gzip 0.70 KB）
  - **按需异步 Chunk（10 个资源，合计 766.99 KB Raw / 231.56 KB Gzip）**：
    - `assets/vendor-html2canvas-B0tyYwQk.js`：197.62 KB（Gzip 46.91 KB）— 点击长图导出时加载
    - `assets/vendor-chart-DUOW7cAq.js` + `chart-lite`：159.51 KB（Gzip 55.94 KB）— 进入 Step 5 时加载
    - `assets/route-translation-CI8kIkcX.js` + `CRQgllPV.css`：155.24 KB（Gzip 48.26 KB）— 进入产业转化工作区时加载
    - `assets/route-diy-CYB1rmA_.js`：75.51 KB（Gzip 23.53 KB）— 进入 DIY 实验室 / 任务舱时加载
    - `assets/modal-ai-review-C8vSylh_.js`：60.72 KB（Gzip 20.75 KB）— 打开自有方案 / AI 评审弹窗时加载
    - `assets/route-workflow-visuals-f5SrmkGL.js`：58.98 KB（Gzip 17.01 KB）— 进入六步工坊时加载
    - `assets/modal-insight-qco3Bzqr.js` + `B5fFe-p0.css`：59.41 KB（Gzip 19.15 KB）— 打开实验项目中枢时加载
- **功能回归与动态接口复测结论**：**全部通过（6/6 + 云草稿 E2E 全通）**
  - [x] 全局接口与数据资产完整性（119 项药材题库、15 套装置、85 篇文献、38 项院校案例，0 数据删改）
  - [x] 六大工作区切换 / Ctrl+K 检索 / 六步工坊联动（含 Step 5 图表懒加载）/ 八阶段产业转化（按需路由加载）/ 报告导出（含 `html2canvas` 懒加载 PNG 生成）/ 暗色模式全部通过，0 console error / 0 page error / 0 failed request
  - [x] 云端草稿复测：KV CRUD (`201`/`200`/`304`/`403`/`404`) ✅ / D1 CRUD ✅ / 未配置 `503` 本地降级 ✅ / `POST` P50 **0.74ms** P95 **1.07ms**、`GET` P50 **0.39ms** P95 **0.50ms** / 浏览器刷新保留 `350g` + 跨无痕窗 `?draft=` 恢复 `350g` ✅
- **去留判断**：**保留（KEEP）**，并正式触发**终止条件 (a)** 停止迭代！
- **回退方式**：
  ```powershell
  # 恢复 src/main.js、src/routes/interactive-loaders.js、vite.config.js 中 v8/v9/v15 拆包改动
  Remove-Item -Force src/routes/workflow-visuals-chunk.js, src/routes/insight-chunk.js
  npm.cmd --prefix C:/Users/Administrator/.gemini/antigravity/scratch/tcm-chemistry-lab run build
  ```

---

## 最终达标总结（Termination Condition a Satisfied at Round 11）

| 终止条件项 | 目标要求 | 最终实测（Round 11） | 状态 |
| --- | --- | --- | :---: |
| 构建成功 | `vite build` 无报错 | 2.35s 成功输出 `dist/` 与 `bundle-report/stats.html` | ✅ |
| 功能回归 | 基线 6 大功能全部通过 | 6/6 全通过，0 运行时/网络错误，119 项题库零删改 | ✅ |
| Bundle 总体积 | ≤ 纯静态基线 (2,717.42 / 798.52 KB) | **1,746.77 KB Raw (-35.7%) / 537.36 KB Gzip (-32.7%)**<br>首屏仅 **979.78 KB Raw (-63.9%) / 305.80 KB Gzip (-61.7%)** | ✅ |
| Lighthouse 性能分 | ≥ 90 | **90**（从 44 提升 +46 分） | ✅ |
| Lighthouse SEO 分 | ≥ 95 | **100** | ✅ |
| 草稿云保存可用 | KV/D1 数据层 + 恢复与导入导出兼容 + 本地降级 | `functions/api/drafts.js` + `src/modules/cloud-drafts.js` 双后端 + 浏览器 E2E 全部实测通过 | ✅ |
| 安全与护栏遵守 | 无 `git commit/push`、无线上改动、前端无密钥 | `git HEAD` 仍为 `f88c6ce`，前端 `0` 密钥命中 | ✅ |

---

## Round 12 · SEO、缓存与可访问性收尾打磨（`_headers` 强缓存 + `canonical`/JSON-LD + `sitemap.xml`/`robots.txt` + `meta-viewport`）

- **日期**：2026-11-24
- **阶段与目标**：SEO 与转化 / 缓存收尾 — 完善 `_headers` 针对 Vite `/assets/*` contenthash 产物的 `public, max-age=31536000, immutable` 长期强缓存与 `/api/*` `no-store` 策略；在 `index.html` 补充 `<link rel="canonical">`、Schema.org JSON-LD（`WebApplication` / `EducationalApplication`）并移除限制缩放的 `maximum-scale=1.0, user-scalable=no`；在 `vite.config.js` 构建期自动生成 `dist/robots.txt` 与 `dist/sitemap.xml`（覆盖主站及 6 大工作区路由）。
- **改动文件清单**：
  - 修改：`_headers`、`index.html`、`vite.config.js`、`.gitignore`（忽略构建产物目录 `bundle-report/` 保持仓库整洁，每次 `npm run build` 自动生成）
- **最终前后对比（Round 11 → Round 12 vs 基线 Round 0）**：

| 指标 | 纯静态基线 (Round 0) | Round 11 | **Round 12（最终整合版）** | 累计变化 |
| --- | ---: | ---: | ---: | ---: |
| **Lighthouse Performance** | 44 | 90 | **90** | **+46** |
| **Lighthouse Accessibility** | 87 | 87 | **97** | **+10** |
| **Lighthouse Best Practices** | 100 | 100 | **100** | 0 |
| **Lighthouse SEO** | 100 | 100 | **100**（+ canonical/JSON-LD/sitemap/robots） | 完整结构化索引 |
| Lighthouse FCP / LCP / TBT / CLS | 5,072 / 6,222 / 879ms / 0 | 2,687 / 2,837 / 100ms / 0.0653 | **2,692 / 2,842 / 100ms / 0.0653** | **LCP -54.3%, TBT -88.6%** |
| Lighthouse Total Byte Weight | 806.9 KB | 314.5 KB | **314.9 KB** | **-61.0%** |
| Playwright 实测 CWV (LCP / CLS / INP) | 444ms / 0.3202 / 296ms | 248ms / 0.2429 / 240ms | **272ms / 0.2429 / 288ms** | 全面优于基线 |
| 功能回归 | 6/6 ✅ | 6/6 ✅ | **6/6 ✅**（0 运行时/网络错误） | 全部通过 |

- **去留判断**：**保留（KEEP）** — Accessibility 一举从 **87 跃升至 97 (+10)**，Performance 稳守 **90**、Best Practices **100**、SEO **100**，同时补齐长期强缓存与构建期 `sitemap.xml`/`robots.txt`。
