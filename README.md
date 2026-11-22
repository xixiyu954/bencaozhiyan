# 本草智研 · 中药化学智能实验设计工作台

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-brightgreen?logo=github)](https://xixiyu954.github.io/tcm-chemistry-lab/)
[![Netlify Status](https://img.shields.io/badge/Netlify-Mirror%20%26%20Proxy-00C7B7?logo=netlify)](https://tcm-chemistry-lab.netlify.app/)
[![AI Engine](https://img.shields.io/badge/AI%20Engine-GLM--4--Flash%20(SSE)-4f46e5)](https://open.bigmodel.cn/)
[![Herb Database](https://img.shields.io/badge/Herbs-79%20Topics-0f5c54)](https://xixiyu954.github.io/tcm-chemistry-lab/)
[![Literature](https://img.shields.io/badge/Literature-34%20GB%2FT%207714-d99b26)](https://xixiyu954.github.io/tcm-chemistry-lab/)

面向全国高校药学、中药学及相关专业师生的公开通用《中药化学》智能实验设计、工艺核算、动态装置仿真与报告自动生成工作台。

---

## 🌐 在线体验与双镜像站点

本项目支持国内外双平台高速访问，国内免翻墙直连：

- **GitHub Pages 站点**：[https://xixiyu954.github.io/tcm-chemistry-lab/](https://xixiyu954.github.io/tcm-chemistry-lab/)
- **Netlify 镜像与 AI 代理站点**：[https://tcm-chemistry-lab.netlify.app/](https://tcm-chemistry-lab.netlify.app/)

---

## 📁 站点与仓库目录结构

```text
tcm-chemistry-lab/
├── index.html                  # 核心单页工作台主入口（含 SEO、PWA 清单与 6 步视觉流）
├── app.js                      # 核心业务调度逻辑、79 味题库、34 篇文献、TLC 模拟与助教渲染
├── cloud-ai.js                 # 智谱 GLM SSE 流式客户端与本地容灾调度器
├── styles.css                  # 定制主题样式表（国内加速字体、物理装置流线动画）
├── manifest.webmanifest        # PWA 渐进式 Web 应用配置清单
├── netlify.toml                # Netlify 部署、函数路由与静态安全响应头规则
├── netlify/
│   └── functions/
│       └── ai-proxy.mjs        # Netlify Functions 安全无服务器代理（SSE 流式透传、CORS 白名单、限流）
└── .github/
    └── workflows/
        └── validate.yml        # CI 自动化语法校验与代码安全防护检查
```

---

## 🛠️ 技术架构与国产 AI 赋能

### 1. 前端技术栈（零构建依赖）
- **核心框架**：原生 HTML5 + 响应式布局 + Tailwind CSS
- **图表与图形**：Chart.js 4.4 + 自研交互式 TLC 薄层色谱仿真器
- **动态物理仿真**：自研原生 SVG 动画引擎（7 大中药化学经典提取分离实验装置）
- **图标与导出**：Lucide Icons + html2canvas（支持一键导出 A4 实验报告长图、PDF 打印及 Word 文档）
- **国内高速加速**：全面移除外网不可用资源，字体切换为国内加速源（`fonts.loli.net`），公共库由 jsDelivr CDN 加速。

### 2. 公共 AI 服务体系（免配置 · 安全合规 · 自动容灾）
- **核心云端大模型**：对接智谱开放平台（BigModel）**GLM-4-Flash / GLM-4.7-Flash** 免费高效通道，国内直连毫秒级响应。
- **安全无服务器代理（Netlify Functions）**：
  - 核心入口：`netlify/functions/ai-proxy.mjs`
  - 密钥安全隔离：`ZHIPU_API_KEY` 严格托管于 Netlify 平台环境变量中，前端代码与 Git 仓库零密钥暴露。
  - 安全防护与治理：集成严格的 CORS 跨域白名单（仅放行 GitHub Pages 与 Netlify 自身域名）、IP 速率限制（防止盗刷）以及请求体深度校验。
  - 智能弹性容灾：主模型遇高并发 429 或限流时，后端无缝自动降级重试备用版本。
- **本地智算演练引擎（Local RAG）**：
  - 当处于无网络、离线环境或外部服务异常时，前端自动无缝激活内置本地智算引擎，根据 79 味药材数据库与 34 篇权威文献规则库进行逻辑编排，保障核心功能 100% 可用。

---

## 🌟 核心功能亮点

1. **AI 智能实验总控台**：支持自然语言输入课题意向（如“丹参酮ⅡA的低毒高效提取分离与TLC鉴别”），AI 自动匹配题库文献，一键智能装配工艺参数、仪器装置与预期结论。
2. **六步渐进式工作流**：
   - **01 课题目标**：79 项药材经典与创新题库，覆盖挥发油、生物碱、黄酮、蒽醌、皂苷等 10 大章节。
   - **02 原料与工艺规划**：精密计算批次用量、理论限度与绿色度评分。
   - **03 提取分离四步路线**：提取、纯化、分离、结晶四步 SOP 全闭环。
   - **04 动态物理仿真装置**：水蒸气蒸馏、加热回流、索氏提取、超声波提取、减压抽滤、分液萃取、硅胶柱层析等 7 种实验装置动态交互。
   - **05 检识与理化鉴别**：化学显色反应（如盐酸-镁粉、Dragendorff 反应等）与交互式 TLC 薄层色谱斑点模拟。
   - **06 综合实验报告与导出**：标准 GB/T 7714 参考文献引用、智能图表生成，支持手机长按保存、高清 PNG、PDF 打印与 Word 导出。

---

## 🚀 部署与环境变量配置

### 自行部署到 Netlify（推荐）
1. 在 Netlify 控制台选择 **Import from Git**，关联本仓库。
2. 构建配置：
   - **Build command**: 留空（纯静态无需编译）
   - **Publish directory**: `.`（根目录）
   - **Functions directory**: `netlify/functions`
3. 环境变量设置（**Site configuration -> Environment variables**）：
   - `ZHIPU_API_KEY`：填入在[智谱开放平台](https://open.bigmodel.cn/)申请的免费 API Key。
4. 部署完成后，在 `cloud-ai.js` 中确认 `NETLIFY_SITE_URL` 对应你的 Netlify 域名即可。

---

## 📄 授权与联系

- **交流与反馈**：工作台内置「网页直邮作者」表单，或发送邮件至 `Chenovo495666@163.com`。
- **免责声明**：本工作台生成的实验参数仅供高校教学与实验方案设计参考，实际上手操作请严格遵守实验室安全规范并由专业指导教师复核。
