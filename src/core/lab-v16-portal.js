/* ============================================================================
 * 本草智研 v16 · Multi-Branch Workbench Portal & Design System Router
 * 解决单页上下堆叠滚屏疲劳，将全站清晰拆分为：
 *   1. home     - 完整落地页（Hero / 三大核心走向网格 / 特性 Bento / CTA / 多栏页脚）
 *   2. bank     - 独立题库研学走向页（搜索筛选网格 + 右侧实时档案与小白速读）
 *   3. ai       - 独立 AI 设计走向页（自然语言编排 / v11 自有方案演练 / 助教答疑）
 *   4. diy      - 独立 DIY 创意走向页（4 大分段子标签：配伍分层TLC / 任务舱计算 / 15装置沙盒 / 零消耗工具箱）
 *   5. workflow - 纯净 6 步实验设计工坊（零冗余横幅，专注单步设计与右侧驾驶舱）
 * 并提供 window.TCM_V16_PORTAL 扩展注册 API，便于后续模块无缝接入。
 * ============================================================================ */
(function () {
  'use strict';

  const ROUTE_STORAGE_KEY = 'bencao_v16_last_route';
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));

  let currentRoute = 'home'; // 'home' | 'bank' | 'ai' | 'diy' | 'workflow'
  let aiSubTab = 'arena';    // 'arena' | 'compose' | 'plan' | 'chat'
  let diySubTab = 'formula';  // 'formula' | 'failures' | 'studio' | 'mission' | 'hub' | 'tools'
  let bankState = { tab: 'all', cat: '全部', scene: 'all', sort: 'default', detailTab: 'chem', query: '', previewId: '' };
  let extensions = [];
  let inited = false;

  const AI_TEMPLATES = [
    { tag: '本科 4 学时', title: '槐米芦丁碱提酸沉精制', desc: '经典硼砂保护水提 + 盐酸调 pH 结晶 + 盐酸-镁粉/TLC 检识', prompt: '设计高校本科 4 学时槐米芦丁碱提酸沉提取精制实验，自动配置料液比、pH 与动态回流/抽滤装置' },
    { tag: '绿色化学创新', title: '五味子 NADES 绿色低共熔提取', desc: '对比 95% 乙醇与氯化胆碱-乳酸绿色溶剂，零氯仿安全体系', prompt: '用绿色无毒低共熔溶剂对比乙醇提取五味子木脂素，给出环保评估与完整 6 步实验设计' },
    { tag: '经典名方复方', title: '黄连解毒汤三指标协同提取', desc: '黄连/黄芩/黄柏/栀子复方配伍，兼顾生物碱与黄酮溶出', prompt: '设计黄连解毒汤复方水提工艺，重点保护黄芩苷并同步提取小檗碱与栀子苷，配置装置与 HPLC 检测要点' },
    { tag: '炮制对比研究', title: '生黄芪 vs 炙黄芪一材双提', desc: '同批药材对比多糖与黄芪甲苷含量变化，适合创新训练项目', prompt: '设计生黄芪与炙黄芪一材双提黄芪多糖与黄芪甲苷对照实验，自动填好参数、装置与实验报告框架' },
    { tag: '挥发油热敏', title: '紫苏叶挥发油水蒸气蒸馏', desc: '2 小时教学友好方案，配套油水分离器与抗氧化活性拓展', prompt: '用普通本科实验室 2 小时内提取紫苏叶挥发油，结合抗氧化创新设计，自动配置参数与水蒸气蒸馏装置' },
    { tag: '中西医结合', title: '丹参脂水双提 + 大孔树脂分级', desc: '先醇提丹参酮 IIA 再水提丹酚酸 B，D101 树脂梯度纯化', prompt: '丹参脂水双提丹参酮IIA与丹酚酸B，配置D101大孔树脂分级纯化与规范质量控制报告' }
  ];

  const AI_CHAT_PROMPTS = [
    '为什么我的粗提物收率比文献偏低？请按药材粒度、浸润、温度与转移损失帮我逐项排查。',
    'TLC 薄层色谱出现斑点拖尾和前沿连片，应该怎么调整展开剂极性或加酸碱抑制剂？',
    '水蒸气蒸馏提取挥发油时油层乳化、不出油怎么办？',
    '请帮我用小白能听懂的话，总结当前药材提取分离的核心化学原理与避坑点。',
    '请根据我当前的实验参数，帮我润色一段规范的《实验讨论与误差分析》段落。',
    '如果把这个本科小试方案放大到 50L 中试提取罐，哪些参数必须调整？'
  ];

  const DIY_TOOLS = [
    { icon: '🧱', title: '工艺积木编排工坊', badge: '工艺编排', desc: '自由组合提取、纯化与检识单元，实时估算总耗时、环保指数与耗材清单。', action: 'go-v9-diy' },
    { icon: '🛠️', title: '实验装置自由组装台', badge: '装置组装', desc: '自由搭配烧瓶、冷凝管、分液漏斗与热源，实时检查气密性、温控与暴沸风险。', action: 'go-v10-sandbox' },
    { icon: '🛡️', title: 'MSDS 安全废液与 TLC 调优', badge: '安全与薄层', desc: '快速查询实验溶剂安全规范与废液分类去向，辅助调节薄层色谱展开剂极性。', action: 'go-step3-tools' },
    { icon: '📐', title: 'L9(3⁴) 正交分析与 UV 标曲拟合', badge: '数据统计', desc: '完成四因素三水平正交极差分析、最小二乘线性回归（R²）与实测含量核算。', action: 'go-step5-tools' },
    { icon: '🏭', title: '小试至中试放大核算', badge: '中试放大', desc: '根据小试投料参数，推算 10L、50L、500L 放大规模的投料、溶剂回收与能耗参考。', action: 'go-step2-scale' },
    { icon: '⚖️', title: '双课题多维度对比', badge: '方案对比', desc: '任选两项药材或工艺方案进行十项指标横向对比，支持导出对比表格用于开题讨论。', action: 'open-compare' }
  ];

  function api() {
    return window.TCM_LAB_API || null;
  }

  function getCounts() {
    if (api() && api().getCounts) return api().getCounts();
    return { topics: 117, rigs: 15, literature: 84, univCases: 34 };
  }

  function getTopics() {
    if (api() && api().getAllTopics) return api().getAllTopics();
    return [];
  }

  function getCurrentTopic() {
    if (api() && api().getCurrentTopic) return api().getCurrentTopic();
    return { id: 'default', herb: '黄芩', compound: '黄芩苷', category: '黄酮类' };
  }

  function getCurrentWs() {
    if (api() && api().getCurrentWorkState) return api().getCurrentWorkState();
    return { mass: 50, ratio: 10, temp: 80, time: 60, cycles: '2', solventType: '70%乙醇' };
  }

  function getV15Score() {
    try {
      if (window.TCM_V15_INSIGHT && window.TCM_V15_INSIGHT.calculate) {
        return window.TCM_V15_INSIGHT.calculate();
      }
    } catch (_) {}
    return null;
  }

  // ---------- 精美高清内联矢量 SVG 图标集（替代低清系统 Emoji，永不出现空框） ----------
  const SVG_ICONS = {
    brand: `<svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6"/><path d="M10 3v5.4L5.6 16.5A3 3 0 0 0 8.2 21h7.6a3 3 0 0 0 2.6-4.5L14 8.4V3"/><path d="M7.5 15.5c2-1 4 1 6.5 0s2.5-.5 2.5-.5"/></svg>`,
    home: `<svg viewBox="0 0 24 24" class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/><path d="M9 21v-6h6v6"/></svg>`,
    bank: `<svg viewBox="0 0 24 24" class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    ai: `<svg viewBox="0 0 24 24" class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z"/></svg>`,
    diy: `<svg viewBox="0 0 24 24" class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>`,
    workflow: `<svg viewBox="0 0 24 24" class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6"/><path d="M10 3v5.4L5.6 16.5A3 3 0 0 0 8.2 21h7.6a3 3 0 0 0 2.6-4.5L14 8.4V3"/></svg>`,
    translation: `<svg viewBox="0 0 24 24" class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18"/><path d="M5 20V9l5 3V9l5 3V5h4v15"/></svg>`
  };

  // 全局 Lucide 图标自愈渲染器：无论任意模块何时插入 <i data-lucide>，确保零空框
  let lucideTimer = null;
  function syncLucideIcons() {
    if (typeof window.lucide === 'undefined' || !window.lucide.createIcons) return;
    clearTimeout(lucideTimer);
    lucideTimer = setTimeout(() => {
      try {
        if (document.querySelector('i[data-lucide]')) window.lucide.createIcons();
      } catch (_) {}
    }, 30);
  }

  // ---------- 1. 升级顶栏导航：清晰路由 + 矢量图标 + 零破坏兼容旧按钮 ----------
  function upgradeHeaderNav() {
    const zone = document.getElementById('workspaceZoneBar');
    if (!zone || zone.dataset.v16Upgraded === '1') return;
    zone.dataset.v16Upgraded = '1';

    // 在顶栏最左侧加上定制矢量品牌回首页按钮
    const headerRow = zone.parentElement;
    const titleWrap = headerRow && headerRow.querySelector('#headerStepTag')?.parentElement;
    if (titleWrap && !document.getElementById('v16BrandHomeBtn')) {
      const brandBtn = document.createElement('button');
      brandBtn.type = 'button';
      brandBtn.id = 'v16BrandHomeBtn';
      brandBtn.className = 'v16-brand-btn';
      brandBtn.title = '返回本草智研首页总览';
      brandBtn.innerHTML = `<span class="v16-brand-logo" aria-hidden="true">${SVG_ICONS.brand}</span><span>本草智研</span>`;
      brandBtn.addEventListener('click', () => go('home'));
      titleWrap.insertBefore(brandBtn, titleWrap.firstChild);
    }

    const counts = getCounts();
    const makeTab = (id, route, svgIcon, label, pill) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.id = id;
      b.dataset.v16Route = route;
      b.className = 'v16-route-tab';
      b.innerHTML = `${svgIcon}<span>${label}</span>${pill ? `<span class="v16-route-pill">${pill}</span>` : ''}`;
      b.addEventListener('click', () => go(route));
      return b;
    };

    const tabHome = makeTab('v16NavHome', 'home', SVG_ICONS.home, '首页', '');
    const tabBank = makeTab('v16NavBank', 'bank', SVG_ICONS.bank, '药材题库', `${counts.topics}`);
    const tabAi = makeTab('v16NavAi', 'ai', SVG_ICONS.ai, '智能设计', '');
    const tabDiy = makeTab('v16NavDiy', 'diy', SVG_ICONS.diy, 'DIY 实验室', '');
    const tabTr = makeTab('v16NavTranslation', 'translation', SVG_ICONS.translation, '产业转化', '8阶段');
    const tabWf = makeTab('v16NavWorkflow', 'workflow', SVG_ICONS.workflow, '实验工坊', '');

    // 把新六大走向按钮放在最前面，把旧按钮隐藏（保留 DOM ID 以确保旧脚本监听不报错）
    const legacyIds = ['zoneTabWorkflow', 'btnOpenDiyStudio', 'btnOpenMissionOs', 'btnOpenApparatusHub'];
    legacyIds.forEach(lid => {
      const el = document.getElementById(lid);
      if (el) el.style.display = 'none';
    });

    const insertBeforeEl = zone.firstChild;
    [tabHome, tabBank, tabAi, tabDiy, tabTr, tabWf].forEach(btn => {
      zone.insertBefore(btn, insertBeforeEl);
    });
  }

  // ---------- 2. 挂载独立走向容器 ----------
  function ensureContainers() {
    const mainCol = document.getElementById('studioMainCol');
    if (!mainCol || document.getElementById('v16HomePage')) return;

    // (a) 工作台清爽面包屑条（仅在 workflow 时显示）
    const wfBar = document.createElement('div');
    wfBar.id = 'v16WorkflowBar';
    wfBar.className = 'v16-wf-bar hidden no-print';
    mainCol.insertBefore(wfBar, mainCol.firstChild);

    // (b) 首页完整落地页容器
    const homePage = document.createElement('section');
    homePage.id = 'v16HomePage';
    homePage.className = 'v16-page hidden no-print';
    mainCol.insertBefore(homePage, mainCol.firstChild);

    // (c) 独立题库研学走向页
    const bankPage = document.createElement('section');
    bankPage.id = 'v16BankPage';
    bankPage.className = 'v16-page hidden no-print space-y-5';
    mainCol.insertBefore(bankPage, wfBar);

    // (d) 独立 AI 设计走向页头部与扩展区（原生 #qwenCommandBar + #aiPlanShowcase 就紧跟在其后，零克隆零断链！）
    const aiHeader = document.createElement('section');
    aiHeader.id = 'v16AiHeader';
    aiHeader.className = 'v16-page hidden no-print space-y-4';
    const qwenBar = document.getElementById('qwenCommandBar');
    if (qwenBar) mainCol.insertBefore(aiHeader, qwenBar);
    else mainCol.insertBefore(aiHeader, wfBar);

    const aiExtra = document.createElement('section');
    aiExtra.id = 'v16AiExtra';
    aiExtra.className = 'v16-page hidden no-print space-y-5';
    const aiShowcase = document.getElementById('aiPlanShowcase');
    if (aiShowcase && aiShowcase.nextSibling) {
      mainCol.insertBefore(aiExtra, aiShowcase.nextSibling);
    } else {
      mainCol.appendChild(aiExtra);
    }

    // (e) 独立 DIY 创意走向页头部（4大分段标签，直接控制 #wpanel-diy / #wpanel-mission / #wpanel-hub / #v16DiyTools）
    const diyHeader = document.createElement('section');
    diyHeader.id = 'v16DiyHeader';
    diyHeader.className = 'v16-page hidden no-print space-y-4';
    mainCol.insertBefore(diyHeader, wfBar);

    const diyTools = document.createElement('section');
    diyTools.id = 'v16DiyToolsPage';
    diyTools.className = 'v16-page hidden no-print space-y-5';
    mainCol.appendChild(diyTools);

    // (f) 独立产业转化训练走向页（8阶段主线：定位→炮制→提取→干燥→制剂→质量→放大与偏差→转化报告）
    const trPage = document.createElement('section');
    trPage.id = 'v18TranslationPage';
    trPage.className = 'v16-page hidden no-print';
    mainCol.insertBefore(trPage, wfBar);

    upgradeFooter();
  }

  // ---------- 3. 精致多栏落地页页脚 ----------
  function upgradeFooter() {
    const footer = document.querySelector('footer');
    if (!footer || footer.dataset.v16Upgraded === '1') return;
    footer.dataset.v16Upgraded = '1';

    const inner = footer.firstElementChild;
    if (!inner) return;
    const fc = getCounts();
    const grid = document.createElement('div');
    grid.className = 'max-w-[1620px] mx-auto px-4 sm:px-6 xl:px-8';
    grid.innerHTML = `
      <div class="v16-footer-grid">
        <div class="v16-footer-col">
          <div class="flex items-center gap-2 mb-2.5">
            <span class="v16-brand-logo" aria-hidden="true">${SVG_ICONS.brand}</span>
            <strong style="font-size:0.98rem;color:var(--ds-ink)">本草智研 · 现代本草实验工作台</strong>
          </div>
          <p style="margin:0;font-size:0.8rem;line-height:1.68;color:var(--ds-muted);max-width:340px">
            面向高校药学与中药学课程教学、实验设计与科研训练的现代本草综合工作台。
          </p>
        </div>
        <div class="v16-footer-col">
          <h3>工作区</h3>
          <div class="v16-footer-links">
            <button type="button" data-v16-go="home">首页</button>
            <button type="button" data-v16-go="bank">药材实验题库（${fc.topics} 项）</button>
            <button type="button" data-v16-go="ai">智能实验设计</button>
            <button type="button" data-v16-go="diy">DIY 创意实验室</button>
            <button type="button" data-v16-go="translation">产业转化训练（丹参标杆）</button>
            <button type="button" data-v16-go="workflow">六步实验工坊</button>
          </div>
        </div>
        <div class="v16-footer-col">
          <h3>常用工具</h3>
          <div class="v16-footer-links">
            <button type="button" data-v16-trigger="v15">实验项目中枢与体检</button>
            <button type="button" data-v16-trigger="tr-dev">偏差调查与批间一致性</button>
            <button type="button" data-v16-go="diy" data-v16-sub="hub">实验装置与流程库</button>
            <button type="button" data-v16-trigger="compare">双课题横向对比</button>
            <button type="button" data-v16-trigger="drawer">实证文献与高校案例</button>
            <button type="button" data-v16-trigger="cmd">全局快捷检索</button>
          </div>
        </div>
        <div class="v16-footer-col">
          <h3>开放资源</h3>
          <div class="v16-footer-links">
            <a href="https://github.com/xixiyu954/bencaozhiyan" target="_blank" rel="noopener noreferrer">GitHub 项目仓库 ↗</a>
            <a href="https://ydz.chp.org.cn/" target="_blank" rel="noopener noreferrer">《中国药典》2025 年版在线检索 ↗</a>
            <a href="https://www.ilab-x.com/" target="_blank" rel="noopener noreferrer">国家虚拟仿真实验平台 ↗</a>
            <button type="button" data-v16-trigger="feedback">意见反馈与标准勘误</button>
          </div>
        </div>
      </div>
    `;
    footer.insertBefore(grid, inner);
    grid.addEventListener('click', handleGlobalDelegate);
  }

  // ---------- 4. 渲染：首页 ----------
  function renderHome() {
    const mount = document.getElementById('v16HomePage');
    if (!mount) return;
    const c = getCounts();

    mount.innerHTML = `
      <div class="v16-home-wrap">
        <!-- 1. Hero 主视觉区 -->
        <section class="v16-hero">
          <div class="v16-hero-grid">
            <div>
              <span class="v16-eyebrow"><span class="v16-eyebrow-dot"></span>本草智研 · 中药药学研究与小试—中试产业转化训练平台</span>
              <h2>从提取实验设计到<br/><em>药学研究与中试产业转化</em></h2>
              <p class="v16-hero-desc">
                保留完整的现代本草教学六步实验与装置仿真，并拓展“产品定位 → 炮制对照 → 综合工艺最优 → 剂型选择 → 全过程质控 → 非线性中试放大与偏差调查 → 转化报告”八阶段产业转化主线。
              </p>
              <div class="v16-hero-ctas">
                <button type="button" class="v16-btn-cta-primary" data-v16-go="translation">进入产业转化（丹参标杆）→</button>
                <button type="button" class="v16-btn-cta-secondary" data-v16-go="bank">浏览 ${c.topics} 项药材题库</button>
                <button type="button" class="v16-btn-cta-secondary" data-v16-go="ai">智能实验设计</button>
                <button type="button" class="v16-btn-cta-secondary" data-v16-go="diy">DIY 实验室</button>
              </div>
              <div class="v16-hero-stats">
                <div class="v16-hero-stat"><strong>${c.topics}</strong><span>药材与转化课题</span></div>
                <div class="v16-hero-stat"><strong>8 阶段</strong><span>产业转化主线</span></div>
                <div class="v16-hero-stat"><strong>${c.rigs} 套</strong><span>交互仿真装置</span></div>
                <div class="v16-hero-stat"><strong>2025 版</strong><span>中国药典对照基准</span></div>
              </div>
            </div>

            <!-- 右侧：实验设计快速导览卡 -->
            <div class="v16-hero-card">
              <div class="v16-hero-card-head">
                <span class="v16-hero-card-tag">快速开始</span>
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">标准实验流程</span>
              </div>
              <h3 class="v16-hero-card-title">规范化现代本草实验设计</h3>
              <p class="v16-hero-card-sub">选定目标药材或输入实验思路，即可完成工艺参数核算、机理对照、装置模拟与规范报告生成。</p>
              <div class="v16-hero-mini-grid">
                <div class="v16-hero-mini-cell"><span>第一步</span><strong>选材与定题</strong></div>
                <div class="v16-hero-mini-cell"><span>第二步</span><strong>工艺与装置</strong></div>
                <div class="v16-hero-mini-cell"><span>第三步</span><strong>数据与报告</strong></div>
              </div>
              <div class="v16-hero-card-btns">
                <button type="button" class="v16-hero-resume-btn" data-v16-go="workflow" data-v16-step="1">进入实验工坊 →</button>
                <button type="button" class="v16-hero-pulse-btn" data-v16-trigger="ai-review">自编课题审核</button>
              </div>
            </div>
          </div>
        </section>

        <!-- 2. 四大核心工作区 -->
        <section>
          <div class="v16-sec-head">
            <div>
              <h3>选择工作方式</h3>
            </div>
            <p>兼顾高校课程实验训练与中药小试—中试产业转化研究，按任务进入对应工作区。</p>
          </div>
          <div class="v16-branch-grid tr-cols-4">
            <button type="button" class="v16-branch-card" style="--branch-accent:#047857;--branch-bg:#ecfdf5;--branch-border:rgba(4,120,87,0.24)" data-v16-go="translation">
              <div>
                <div class="v16-branch-top">
                  <span class="v16-branch-icon">🏭</span>
                  <span class="v16-branch-badge">丹参标杆 · 8 阶段</span>
                </div>
                <h4>产业转化训练</h4>
                <p>从实验提取走向可验证、可放大、可申报的产品方案：内置丹参、黄芩、薄荷、延胡索标杆并支持导入全部题库。</p>
                <ul class="v16-branch-list">
                  <li>产品定位、炮制对照、9 维综合工艺最优与剂型选择</li>
                  <li>分级质控、三批复现、非线性放大核算与偏差 CAPA</li>
                  <li>来源分层标注并输出《药学研究与小试转化报告》</li>
                </ul>
              </div>
              <div class="v16-branch-foot"><span>进入产业转化</span><span class="v16-branch-arrow">→</span></div>
            </button>

            <button type="button" class="v16-branch-card" style="--branch-accent:#0f5c54;--branch-bg:#ecfdf5;--branch-border:rgba(15,92,84,0.18)" data-v16-go="bank">
              <div>
                <div class="v16-branch-top">
                  <span class="v16-branch-icon">📚</span>
                  <span class="v16-branch-badge">${c.topics} 项课题</span>
                </div>
                <h4>药材实验题库</h4>
                <p>适用于课程实验、复习备考与开题选题。支持按化学成分大类与实验场景检索，即时查看基原、成分与药典标准。</p>
                <ul class="v16-branch-list">
                  <li>涵盖黄酮、生物碱、皂苷、蒽醌、挥发油及经典名方</li>
                  <li>同步展示药材特性要点与《中国药典》质量参考</li>
                  <li>选定药材后可直接载入实验工坊配置参数</li>
                </ul>
              </div>
              <div class="v16-branch-foot"><span>进入药材题库</span><span class="v16-branch-arrow">→</span></div>
            </button>

            <button type="button" class="v16-branch-card" style="--branch-accent:#b45309;--branch-bg:#fffbeb;--branch-border:rgba(180,83,9,0.2)" data-v16-go="ai">
              <div>
                <div class="v16-branch-top">
                  <span class="v16-branch-icon">✨</span>
                  <span class="v16-branch-badge">辅助设计与评审</span>
                </div>
                <h4>智能实验设计</h4>
                <p>适用于创新性实验与竞赛方案构思。输入实验目标自动规划提取、分离与检识路线，支持已有方案校核与答疑。</p>
                <ul class="v16-branch-list">
                  <li>根据药材、课时与安全要求生成完整实验方案</li>
                  <li>支持提交已有实验路线进行可行性推演与风险提示</li>
                  <li>自编课题须经评审达到 90 分以上并由本人确认编入</li>
                </ul>
              </div>
              <div class="v16-branch-foot"><span>进入智能设计</span><span class="v16-branch-arrow">→</span></div>
            </button>

            <button type="button" class="v16-branch-card" style="--branch-accent:#0369a1;--branch-bg:#f0f9ff;--branch-border:rgba(3,105,161,0.2)" data-v16-go="diy">
              <div>
                <div class="v16-branch-top">
                  <span class="v16-branch-icon">🧩</span>
                  <span class="v16-branch-badge">交互仿真与工具</span>
                </div>
                <h4>DIY 创意实验室</h4>
                <p>适用于实验前预习、工艺推演与理化现象模拟，集成复方配伍、溶剂分层、薄层显色及常用实操计算工具。</p>
                <ul class="v16-branch-list">
                  <li>复方配伍模拟、混合溶剂分层与三光源 TLC 显色台</li>
                  <li>旋蒸真空降沸、柱层析硅胶量、显色反应与原始记录本</li>
                  <li>15 套交互实验装置图解及常用器皿自由组装</li>
                </ul>
              </div>
              <div class="v16-branch-foot"><span>进入 DIY 实验室</span><span class="v16-branch-arrow">→</span></div>
            </button>
          </div>
        </section>

        <!-- 3. 核心功能 -->
        <section>
          <div class="v16-sec-head">
            <div>
              <h3>核心功能</h3>
            </div>
          </div>
          <div class="v16-bento-grid">
            <button type="button" class="v16-bento-card" data-v16-go="workflow" data-v16-step="3">
              <span class="v16-bento-icon">💡</span>
              <h5>原理与图谱解读</h5>
              <p>结合成分极性、酸碱特性、沉淀规律与特征显色机理，直观理解提取与分离纯化设计依据。</p>
              <span class="v16-bento-link">查看原理与方案 →</span>
            </button>
            <button type="button" class="v16-bento-card" data-v16-go="diy" data-v16-sub="hub">
              <span class="v16-bento-icon">⚙️</span>
              <h5>交互仿真装置库</h5>
              <p>覆盖回流、索氏、超临界、旋蒸、大孔树脂、高效液相与真空冻干等 15 套实验装置与实操指引。</p>
              <span class="v16-bento-link">浏览装置库 →</span>
            </button>
            <button type="button" class="v16-bento-card" data-v16-trigger="v15">
              <span class="v16-bento-icon">◎</span>
              <h5>实验项目中枢</h5>
              <p>核对工艺参数完整性、估算溶剂消耗与实验排程，辅助排查设计疏漏并导出项目简报。</p>
              <span class="v16-bento-link">打开项目中枢 →</span>
            </button>
            <button type="button" class="v16-bento-card" data-v16-go="workflow" data-v16-step="6">
              <span class="v16-bento-icon">📄</span>
              <h5>波谱分析与实验报告</h5>
              <p>整合紫外、红外、核磁与质谱解析要点、标准曲线拟合及规范 A4 实验报告打印与导出。</p>
              <span class="v16-bento-link">前往实验报告 →</span>
            </button>
          </div>
        </section>

        ${extensions.length ? `
          <section>
            <div class="v16-sec-head">
              <div><h3>扩展工具</h3></div>
            </div>
            <div class="v16-bento-grid">
              ${extensions.map(ext => `
                <button type="button" class="v16-bento-card" data-v16-ext="${esc(ext.id)}">
                  <span class="v16-bento-icon">${esc(ext.icon || '🧩')}</span>
                  <h5>${esc(ext.title)}</h5>
                  <p>${esc(ext.desc || '')}</p>
                  <span class="v16-bento-link">打开 →</span>
                </button>
              `).join('')}
            </div>
          </section>
        ` : ''}

        <!-- 4. 底部行动号召 -->
        <section class="v16-cta-banner">
          <div>
            <h4>已确定研究药材？直接进入六步实验工坊</h4>
            <p>左侧配置工艺参数，右侧实时同步提取过程模拟与工艺指标雷达。</p>
          </div>
          <div class="v16-cta-actions">
            <button type="button" class="v16-btn-cta-primary" style="padding:10px 18px;font-size:0.84rem" data-v16-go="workflow">进入实验工坊</button>
            <button type="button" class="v16-chip-btn" style="padding:10px 14px" data-v16-trigger="compare">双课题对比</button>
            <button type="button" class="v16-chip-btn" style="padding:10px 14px" data-v16-trigger="cmd">快捷检索</button>
          </div>
        </section>
      </div>
    `;
  }

  // ---------- 5. 渲染：独立题库走向页 (BANK · 六大学科深度增强版) ----------
  function filterBankTopics(all) {
    const q = (bankState.query || '').trim().toLowerCase();
    const enrich = window.TCM_BANK_ENRICH;
    const favs = enrich ? enrich.getFavorites() : new Set();

    const matched = all.filter(item => {
      if (bankState.tab === 'class' && item.group !== 'class') return false;
      if (bankState.tab === 'innovative' && item.group !== 'innovative') return false;
      if (bankState.tab === 'kbnew' && !item.isKbNew) return false;
      if (bankState.tab === 'fav' && !favs.has(item.id)) return false;
      if (bankState.tab === 'custom' && !item._isCustom) return false;
      if (bankState.cat !== '全部' && (item.category || '') !== bankState.cat) return false;
      if (bankState.scene !== 'all') {
        const hydrated = (api() && api().getTopicById) ? api().getTopicById(item.id) : item;
        const hay = `${hydrated.herb || ''} ${hydrated.compound || ''} ${hydrated.category || ''} ${hydrated.sourceTag || ''} ${hydrated.origin || ''} ${hydrated.integrative || ''} ${(hydrated.tags || []).join(' ')}`;
        if (bankState.scene === 'undergrad' && item.group !== 'class') return false;
        if (bankState.scene === 'compound' && !/复方|汤|散|丸|方/.test(hay)) return false;
        if (bankState.scene === 'green' && !/绿色|NADES|水提|低共熔|超声|微波|超临界/.test(hay)) return false;
        if (bankState.scene === 'process' && !/炮制|醋炙|炙|炒|杀酶|对照|减毒|砂烫/.test(hay)) return false;
        if (bankState.scene === 'mol3d' && !(enrich && enrich.hasMol3d(hydrated))) return false;
        if (bankState.scene === 'eastwest' && !(enrich && enrich.isEastWest(hydrated))) return false;
        if (bankState.scene === 'liaoyao' && !(enrich && enrich.isLiaoyao && enrich.isLiaoyao(hydrated))) return false;
      }
      if (q) {
        const hydrated = (api() && api().getTopicById) ? api().getTopicById(item.id) : item;
        const prof = enrich ? enrich.getProfile(hydrated) : null;
        const hay = `${hydrated.herb || ''} ${hydrated.compound || ''} ${hydrated.category || ''} ${hydrated.latin || ''} ${hydrated.origin || ''} ${hydrated.chemistry || hydrated.chem || ''} ${hydrated.sourceTag || ''} ${prof ? prof.biosyn : ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (bankState.sort === 'limit') {
      return [...matched].sort((a, b) => {
        const ha = (api() && api().getTopicById) ? api().getTopicById(a.id) : a;
        const hb = (api() && api().getTopicById) ? api().getTopicById(b.id) : b;
        return (Number(hb.limitVal) || 0) - (Number(ha.limitVal) || 0);
      });
    }
    if (bankState.sort === 'name') {
      return [...matched].sort((a, b) => String(a.herb || '').localeCompare(String(b.herb || ''), 'zh-CN'));
    }
    if (bankState.scene === 'liaoyao' && bankState.sort === 'default') {
      return [...matched].sort((a, b) => (b.isLiaoyao ? 1 : 0) - (a.isLiaoyao ? 1 : 0));
    }
    return matched;
  }

  function computeBankData() {
    const all = getTopics();
    const cats = ['全部', ...Array.from(new Set(all.map(x => x.category).filter(Boolean)))];
    const filtered = filterBankTopics(all);
    const cur = getCurrentTopic();
    if (!bankState.previewId || !all.some(x => x.id === bankState.previewId)) {
      bankState.previewId = (filtered[0] && filtered[0].id) || cur.id;
    }
    const preview = (api() && api().getTopicById) ? api().getTopicById(bankState.previewId) : cur;
    const layman = (api() && api().getLaymanNote) ? api().getLaymanNote(preview) : '';
    return { all, cats, filtered, cur, preview, layman };
  }

  function buildPreviewDetailBody(preview, layman, prof, enrich) {
    const tab = bankState.detailTab || 'chem';
    const molReg = window.TCM_MOL3D_REGISTRY;
    const rawChem = esc(preview.chemistry || preview.chem || `${preview.compound || ''}（${preview.category || '中药化学'}）`);
    const linkedChem = molReg ? molReg.linkifyHtml(rawChem) : rawChem;
    const molMatches = molReg ? molReg.matchAll(`${preview.herb || ''} ${preview.compound || ''} ${preview.chemistry || ''}`) : [];

    if (tab === 'process') {
      const cfg = preview.defaultCfg || {};
      return `
        <div class="v27-bank-kv-grid">
          <div class="v27-bank-kv"><small>推荐溶剂</small><strong>${esc(cfg.solventType || '70% 乙醇 / 水')}</strong></div>
          <div class="v27-bank-kv"><small>参考温时</small><strong>${esc(cfg.temp || 75)}℃ · ${esc(cfg.time || 60)} min</strong></div>
          <div class="v27-bank-kv"><small>料液比/次数</small><strong>1:${esc(cfg.ratio || 10)} · ${esc(cfg.cycles || 2)} 次</strong></div>
        </div>
        <div class="v16-preview-block">
          <label>03 中药制药工艺 · 提取纯化与放大要点</label>
          <p>${esc(prof.process)}</p>
        </div>
        <div class="v16-preview-block">
          <label>02 中药制剂 · 剂型适配与增溶/防潮策略</label>
          <p>${esc(prof.formulation)}</p>
        </div>
        ${preview.integrative ? `<div class="v16-preview-block v16-preview-layman"><label>实验设计拓展思路</label><p>${esc(preview.integrative)}</p></div>` : ''}
        <div class="v27-kb-link-row">
          <button type="button" class="v27-kb-mini-link" data-kb-open="vol03" data-kb-sec="s3">📖 03 制药工艺 · 提取与放大 ↗</button>
          <button type="button" class="v27-kb-mini-link" data-kb-open="vol02" data-kb-sec="s5">📖 02 中药制剂 · 原料难题 ↗</button>
        </div>`;
    }

    if (tab === 'analysis') {
      const specCat = /生物碱/.test(preview.category || '') ? '生物碱' : (/蒽醌|醌/.test(preview.category || '') ? '蒽醌与醌类' : (/苯丙素|有机酸|酚酸/.test(preview.category || '') ? '酚酸类' : '黄酮'));
      return `
        <div class="v16-preview-block">
          <label>2025 版药典质控参考${preview.limitVal ? `（限度 ≥ ${esc(preview.limitVal)}${esc(preview.limitUnit || '%')}）` : ''}</label>
          <p>${esc(preview.pharmacopoeia || preview.pharm || '请参照现行版《中国药典》一部')}</p>
        </div>
        ${preview.tlcSystem ? `<div class="v16-preview-block"><label>TLC 薄层鉴别展开系统</label><p>${esc(preview.tlcSystem)}</p></div>` : ''}
        <div class="v16-preview-block">
          <label>05 仪器分析 · UV / IR / NMR / MS / 色谱特征</label>
          <p>${esc(prof.instrument)}</p>
        </div>
        <div class="v16-preview-block">
          <label>04 分析化学 &amp; 06 制剂分析 · 方法学与质控要点</label>
          <p>${esc(prof.analytical)} ${esc(prof.qc)}</p>
        </div>
        <div class="v27-kb-link-row">
          <button type="button" class="v27-kb-mini-link accent" data-v27-open-spectra="${esc(specCat)}">🌈 启动交互式四谱工作站 ↗</button>
          <button type="button" class="v27-kb-mini-link" data-kb-open="vol05" data-kb-sec="s5">📖 05 仪器分析 · NMR/MS ↗</button>
          <button type="button" class="v27-kb-mini-link" data-kb-open="vol06" data-kb-sec="s6">📖 06 制剂分析 · 含量/QAMS ↗</button>
        </div>`;
    }

    if (tab === 'refs') {
      const urls = enrich ? enrich.getSearchUrls(preview) : { cnki: 'https://kns.cnki.net/', wanfang: 'https://s.wanfangdata.com.cn/', pubmed: 'https://pubmed.ncbi.nlm.nih.gov/', chp: 'https://ydz.chp.org.cn/' };
      const relLit = enrich ? enrich.findRelatedLit(preview, 4) : [];
      return `
        <div class="v16-preview-block">
          <label>一键直达权威数据库（已预组本药材关键词）</label>
          <div class="grid grid-cols-4 gap-1.5 pt-1">
            <a href="${urls.cnki}" target="_blank" rel="noopener noreferrer" class="v27-ext-db-link">知网 ↗</a>
            <a href="${urls.wanfang}" target="_blank" rel="noopener noreferrer" class="v27-ext-db-link">万方 ↗</a>
            <a href="${urls.pubmed}" target="_blank" rel="noopener noreferrer" class="v27-ext-db-link sky">PubMed ↗</a>
            <a href="${urls.chp}" target="_blank" rel="noopener noreferrer" class="v27-ext-db-link amber">2025药典 ↗</a>
          </div>
        </div>
        <div class="v16-preview-block">
          <label>关联六大学科知识库直达</label>
          <div class="v27-kb-link-row pt-1">
            ${(prof.kbLinks || []).map(l => `<button type="button" class="v27-kb-mini-link" data-kb-open="${esc(l.book)}" data-kb-sec="${esc(l.sec)}">📖 ${esc(l.label)} ↗</button>`).join('')}
            <button type="button" class="v27-kb-mini-link" data-kb-open="handbook" data-kb-sec="hb-s1">📘 实践资料汇编 ↗</button>
          </div>
        </div>
        <div class="v16-preview-block">
          <label>平台关联实证文献（${relLit.length} 篇）</label>
          <div class="space-y-1.5 pt-1">
            ${relLit.length ? relLit.map(r => `<div class="v27-lit-mini"><span class="v27-lit-cat">${esc(r.cat || '文献')}</span>${esc(r.text)}</div>`).join('') : '<p>点击上方知网/PubMed 按钮检索最新文献。</p>'}
          </div>
        </div>`;
    }

    // Default tab: 'chem' (概要与化学)
    return `
      ${layman ? `
        <div class="v16-preview-block v16-preview-layman">
          <label>实验关键与成分特性</label>
          <p>${esc(layman)}</p>
        </div>
      ` : ''}
      <div class="v16-preview-block"><label>基原与性味</label><p>${esc(preview.origin || '暂未填写')}</p></div>
      <div class="v16-preview-block">
        <label>核心化学成分（点击成分芯片查看 3D 构象）</label>
        <p>${linkedChem}</p>
        ${molMatches.length ? `<div class="flex flex-wrap gap-1.5 pt-2">${molMatches.map(m => `<button type="button" class="tcm-mol3d-link" data-mol3d-open="${m.key}" style="padding:3px 9px;font-size:0.74rem"><svg class="tcm-mol3d-link-ico" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 20 7 20 17 12 22 4 17 4 7 12 2"/></svg><span>查看 ${esc(m.label)} 3D 模型 →</span></button>`).join('')}</div>` : ''}
      </div>
      <div class="v16-preview-block">
        <label>01 中药化学 · 生物合成（${esc(prof.biosyn)}）与分离推导</label>
        <p>${esc(prof.biosynDetail)} ${esc(prof.chemSep)}</p>
      </div>
      <div class="v27-kb-link-row">
        <button type="button" class="v27-kb-mini-link" data-kb-open="${esc((prof.kbLinks && prof.kbLinks[0] && prof.kbLinks[0].book) || 'vol01')}" data-kb-sec="${esc((prof.kbLinks && prof.kbLinks[0] && prof.kbLinks[0].sec) || 's1')}">📖 ${esc((prof.kbLinks && prof.kbLinks[0] && prof.kbLinks[0].label) || '01 中药化学精讲')} ↗</button>
        <button type="button" class="v27-kb-mini-link" data-kb-open="overview">🗺️ 六大学科逻辑图 ↗</button>
      </div>`;
  }

  function buildBankResultsHtml(filtered, cur, preview, layman) {
    const enrich = window.TCM_BANK_ENRICH;
    const favs = enrich ? enrich.getFavorites() : new Set();
    const prof = enrich ? enrich.getProfile(preview) : { biosyn: '天然产物途径', biosynDetail: '', chemSep: '', formulation: '', process: '', analytical: '', instrument: '', qc: '', kbLinks: [] };
    const isPreviewFav = favs.has(preview.id);
    const hasFilter = bankState.query || bankState.cat !== '全部' || bankState.scene !== 'all' || bankState.tab !== 'all' || bankState.sort !== 'default';

    return `
        <div class="space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2 text-xs" style="color:var(--ds-muted)">
            <span>当前筛选命中 <strong style="color:var(--ds-ink)">${filtered.length}</strong> 项课题（点击卡片右侧切换六大学科档案）</span>
            <div class="flex items-center gap-2">
              <label class="inline-flex items-center gap-1.5 text-[11px] font-bold">
                <span>排序</span>
                <select id="v16BankSort" class="v27-bank-sort-select">
                  <option value="default" ${bankState.sort === 'default' ? 'selected' : ''}>默认推荐</option>
                  <option value="limit" ${bankState.sort === 'limit' ? 'selected' : ''}>药典限度 ↓</option>
                  <option value="name" ${bankState.sort === 'name' ? 'selected' : ''}>按药材名称</option>
                </select>
              </label>
              ${hasFilter ? '<button type="button" id="v16BankReset" class="v16-chip-btn">重置筛选</button>' : ''}
            </div>
          </div>
          ${filtered.length ? `
            <div class="v16-bank-grid">
              ${filtered.map(item => {
                const isSel = item.id === bankState.previewId;
                const isActive = item.id === cur.id;
                const isFav = favs.has(item.id);
                const hydrated = (api() && api().getTopicById) ? api().getTopicById(item.id) : item;
                const itemProf = enrich ? enrich.getProfile(hydrated) : null;
                const itemHas3d = enrich ? enrich.hasMol3d(hydrated) : false;
                const cardSummary = hydrated.origin || hydrated.chemistry || `${item.latin ? item.latin + ' · ' : ''}主攻成分：${item.compound || '活性成分'}`;
                const badgeText = item._isCustom
                  ? '自定义课题'
                  : ((enrich && enrich.isLiaoyao && enrich.isLiaoyao(hydrated))
                    ? '辽药道地 · 本校特色'
                    : (item.isKbNew ? '六科新增' : (item.group === 'class' ? '高校经典' : '创新拓展')));
                return `
                  <div class="v16-topic-card ${isSel ? 'selected' : ''}" data-v16-preview="${esc(item.id)}" role="button" tabindex="0">
                    <div class="v16-topic-head">
                      <span class="v16-topic-herb">${esc(item.herb)}${isActive ? ' <span class="v27-active-pill">当前</span>' : ''}</span>
                      <div class="flex items-center gap-1 shrink-0">
                        <span class="v16-topic-cat">${esc(item.category || '中药化学')}</span>
                        <button type="button" class="v27-fav-btn ${isFav ? 'on' : ''}" data-v27-fav="${esc(item.id)}" title="${isFav ? '取消收藏' : '收藏课题'}" aria-label="收藏课题">${isFav ? '★' : '☆'}</button>
                      </div>
                    </div>
                    <div class="v16-topic-comp">${window.TCM_MOL3D_REGISTRY ? window.TCM_MOL3D_REGISTRY.linkifyHtml(esc(item.compound || '核心活性成分'), { inlineSpan: true }) : esc(item.compound || '核心活性成分')}</div>
                    <div class="v27-card-micro-tags">
                      ${(enrich && enrich.isLiaoyao && enrich.isLiaoyao(hydrated)) ? '<span class="v27-micro-pill" style="background:rgba(154,74,36,0.10);color:#9a4a24;border-color:rgba(154,74,36,0.28)">辽药道地</span>' : ''}
                      ${itemProf ? `<span class="v27-micro-pill">${esc(itemProf.biosyn)}</span>` : ''}
                      ${itemHas3d ? '<span class="v27-micro-pill mint">3D 构象</span>' : ''}
                      ${hydrated.limitVal ? `<span class="v27-micro-pill">限度≥${esc(hydrated.limitVal)}${esc(hydrated.limitUnit || '%')}</span>` : ''}
                    </div>
                    <div class="v16-topic-note">${esc(cardSummary)}</div>
                    <div class="v16-topic-foot">
                      <span>${badgeText}</span>
                      <span style="color:var(--ds-primary-2);font-weight:800">${isSel ? '右侧档案预览中' : '六科档案 →'}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : `
            <div class="v16-subhero text-center py-12">
              <div style="font-size:32px">🔍</div>
              <h3 style="margin:6px 0;font-size:1.05rem;font-weight:850;color:var(--ds-ink)">没有找到匹配的药材课题</h3>
              <p>你可以清空关键词，或者直接交给 AI 智能设计台为你现场定制全新药材方案！</p>
              <div class="flex justify-center gap-2 pt-2">
                <button type="button" id="v16BankResetEmpty" class="v16-chip-btn">显示全部题库</button>
                <button type="button" class="v16-btn-cta-primary" style="padding:9px 16px;font-size:0.82rem" data-v16-go="ai">✨ 用 AI 定制此药材</button>
              </div>
            </div>
          `}
        </div>

        <!-- 右侧固定六大学科全链路档案卡 -->
        <aside class="v16-bank-preview">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="v16-sec-kicker">六大学科药材档案</span>
                <span class="v27-micro-pill">${esc(prof.biosyn)}</span>
              </div>
              <h3 style="margin:5px 0 2px;font-size:1.18rem;font-weight:900;color:var(--ds-ink)">${esc(preview.herb)} · ${window.TCM_MOL3D_REGISTRY ? window.TCM_MOL3D_REGISTRY.linkifyHtml(esc(preview.compound)) : esc(preview.compound)}</h3>
              <div style="font-size:0.75rem;color:var(--ds-muted);font-style:italic">${esc(preview.latin || '')}</div>
            </div>
            <div class="flex flex-col items-end gap-1.5 shrink-0">
              <span class="v16-topic-cat">${esc(preview.category || '中药化学')}</span>
              <button type="button" class="v27-fav-pill ${isPreviewFav ? 'on' : ''}" data-v27-fav="${esc(preview.id)}">${isPreviewFav ? '★ 已收藏' : '☆ 收藏'}</button>
            </div>
          </div>

          <!-- 4 标签六学科深度视角切换 -->
          <div class="v27-detail-tabs" role="tablist" aria-label="药材六大学科档案维度">
            ${[
              ['chem', '概要与化学'],
              ['process', '工艺与制剂'],
              ['analysis', '分析与质控'],
              ['refs', '文献与知识库']
            ].map(([k, lbl]) => `<button type="button" role="tab" aria-selected="${bankState.detailTab === k ? 'true' : 'false'}" class="v27-detail-tab ${bankState.detailTab === k ? 'active' : ''}" data-v27-detail-tab="${k}">${lbl}</button>`).join('')}
          </div>

          <div class="space-y-2.5">
            ${buildPreviewDetailBody(preview, layman, prof, enrich)}
          </div>

          <div class="flex flex-col gap-2 pt-2 border-t border-slate-200/70">
            <button type="button" class="v16-btn-cta-primary" style="width:100%;justify-content:center;padding:11px 16px;font-size:0.86rem" data-v16-lock-topic="${esc(preview.id)}" data-v16-target-step="2">
              选定该药材，配置题目与参数 →
            </button>
            <div class="grid grid-cols-2 gap-2">
              <button type="button" class="v16-chip-btn justify-center py-2" data-v16-lock-topic="${esc(preview.id)}" data-v16-target-step="1">从第 1 步开始</button>
              <button type="button" class="v16-chip-btn gold justify-center py-2" data-v16-ai-herb="${esc(preview.herb)}" data-v16-ai-comp="${esc(preview.compound)}">智能定制方案</button>
            </div>
            <button type="button" class="v16-chip-btn justify-center py-2" style="width:100%;border-color:rgba(15,76,58,0.32);color:var(--craft-accent);background:var(--craft-accent-soft)" data-v16-to-translation="${esc(preview.id)}">
              转入产业转化研究（剂型 / 放大 / 质控）→
            </button>
          </div>
        </aside>
    `;
  }

  function updateBankResultsOnly() {
    const layout = document.querySelector('#v16BankPage .v16-bank-layout');
    if (!layout) {
      renderBank();
      return;
    }
    const { filtered, cur, preview, layman } = computeBankData();
    layout.innerHTML = buildBankResultsHtml(filtered, cur, preview, layman);
    bindBankSortControl();
  }

  function bindBankSortControl() {
    const sel = document.getElementById('v16BankSort');
    if (!sel || sel.dataset.bound === '1') return;
    sel.dataset.bound = '1';
    sel.addEventListener('change', () => {
      bankState.sort = sel.value || 'default';
      updateBankResultsOnly();
    });
  }

  function renderBank() {
    const mount = document.getElementById('v16BankPage');
    if (!mount) return;
    const { all, cats, filtered, cur, preview, layman } = computeBankData();
    const enrich = window.TCM_BANK_ENRICH;
    const favCount = enrich ? enrich.getFavorites().size : 0;
    const kbNewCount = all.filter(x => x.isKbNew).length;

    mount.innerHTML = `
      <div class="v16-subhero">
        <div class="v16-subhero-top">
          <div>
            <h2>药材实验题库（${all.length} 项 · 六大学科档案）</h2>
            <p>整合 6 大学科知识库、2025 版《中国药典》、PubChem 三维分子与实践汇编；支持成分与生物合成途径检索、收藏对比与章节直达。</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="v16-chip-btn" style="border-color:rgba(15,76,58,0.32);color:var(--craft-accent)" data-kb-open="vol01">六科知识库 ↗</button>
            <button type="button" class="v16-chip-btn gold" data-v16-trigger="ai-review">自编课题审核</button>
            <button type="button" class="v16-chip-btn" data-v16-trigger="diy-herb">+ 新建自定义药材</button>
            <button type="button" class="v16-chip-btn" data-v16-trigger="compare">对比课题</button>
            <button type="button" class="v16-chip-btn" data-v16-go="home">← 返回首页</button>
          </div>
        </div>

        <div class="v16-bank-controls">
          <div class="v16-search-wrap">
            <span class="v16-search-icon">⌕</span>
            <input id="v16BankSearch" type="text" value="${esc(bankState.query)}" placeholder="搜索药材名、目标成分、生物合成途径、炮制或工艺关键词（如：附子、水飞蓟、绿原酸、QAMS）..." />
          </div>
          <div class="v16-seg-bar">
            ${[
              ['all', `全部 (${all.length})`],
              ['kbnew', `六科新增 (${kbNewCount})`],
              ['class', '经典必做'],
              ['innovative', '创新拓展'],
              ['fav', `收藏 (${favCount})`],
              ['custom', `自编 (${(api()?.getCounts?.().approvedAi) || 0})`]
            ].map(([k, lbl]) => `<button type="button" class="v16-seg-btn ${bankState.tab === k ? 'active' : ''}" data-v16-bank-tab="${k}">${lbl}</button>`).join('')}
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="v16-pill-row">
            ${cats.map(cat => `<button type="button" class="v16-filter-pill ${bankState.cat === cat ? 'active' : ''}" data-v16-bank-cat="${esc(cat)}">${esc(cat)}</button>`).join('')}
          </div>
          <div class="v16-pill-row">
            ${[
              ['all', '全部场景'],
              ['liaoyao', '辽药道地'],
              ['mol3d', '含 3D 分子'],
              ['undergrad', '本科经典'],
              ['compound', '经典复方'],
              ['green', '绿色工艺'],
              ['process', '炮制对照'],
              ['eastwest', '中西医对照']
            ].map(([sc, lbl]) => `<button type="button" class="v16-filter-pill ${bankState.scene === sc ? 'active' : ''}" data-v16-bank-scene="${sc}">${lbl}</button>`).join('')}
          </div>
        </div>
      </div>

      <div class="v16-bank-layout">
        ${buildBankResultsHtml(filtered, cur, preview, layman)}
      </div>
    `;
    bindBankSortControl();

    // 绑定搜索框（兼容桌面与移动端中文输入法，不销毁输入框 DOM）
    const inp = mount.querySelector('#v16BankSearch');
    if (inp) {
      let isComposing = false;
      const syncQuery = (val) => {
        bankState.query = val;
        updateBankResultsOnly();
      };
      inp.addEventListener('compositionstart', () => {
        isComposing = true;
      });
      inp.addEventListener('compositionend', (e) => {
        isComposing = false;
        syncQuery(e.target.value);
      });
      inp.addEventListener('input', (e) => {
        if (isComposing || e.isComposing) return;
        syncQuery(e.target.value);
      });
    }
  }

  // ---------- 6. 渲染：独立 AI 设计走向页 (AI) ----------
  function renderAi(fromTabSwitch = false) {
    const head = document.getElementById('v16AiHeader');
    const extra = document.getElementById('v16AiExtra');
    const qBar = document.getElementById('qwenCommandBar');
    const qChat = document.getElementById('qwenChatBox');
    if (!head || !extra) return;

    const curRouteMode = window.TCMCloudAI?.getRouteMode ? window.TCMCloudAI.getRouteMode() : 'auto';
    const routeModeText = { auto: '三引擎自动调度', zhipu: '优先智谱 GLM', tencent: '优先腾讯云 TokenHub', xunfei: '优先讯飞星辰' }[curRouteMode] || '三引擎自动调度';
    const ico = (d) => `<svg class="craft-ico" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;

    head.innerHTML = `
      <div class="v16-subhero">
        <div class="v16-subhero-top">
          <div>
            <h2>智能实验设计</h2>
            <p>基于智谱 GLM、腾讯云 TokenHub 与讯飞星辰多模型协同，按 5 套标准化现代本草实验模板完成课题评审、方案编排、已有方案校核与助教答疑。</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="v16-chip-btn" id="v16AiEngineSwitchBtn" title="切换或体检三引擎通道">${ico('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.85 1 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>')}<span>${esc(routeModeText)}</span></button>
            <button type="button" class="v16-chip-btn gold" data-v16-trigger="ai-review">自编课题审核（≥90分）</button>
            <button type="button" class="v16-chip-btn" data-v16-go="workflow">进入实验工坊</button>
            <button type="button" class="v16-chip-btn" data-v16-go="home">← 返回首页</button>
          </div>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="v16-seg-bar">
            <button type="button" class="v16-seg-btn ${aiSubTab === 'arena' ? 'active' : ''}" data-v16-ai-tab="arena">${ico('<path d="M12 2l3 7h7l-5.5 4.5 2 7L12 16.5 5.5 20.5l2-7L2 9h7z"/>')}<span>课题评审竞技</span></button>
            <button type="button" class="v16-seg-btn ${aiSubTab === 'compose' ? 'active' : ''}" data-v16-ai-tab="compose">${ico('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>')}<span>方案模板编排</span></button>
            <button type="button" class="v16-seg-btn ${aiSubTab === 'plan' ? 'active' : ''}" data-v16-ai-tab="plan">${ico('<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>')}<span>已有方案校核</span></button>
            <button type="button" class="v16-seg-btn ${aiSubTab === 'chat' ? 'active' : ''}" data-v16-ai-tab="chat">${ico('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>')}<span>实验助教答疑</span></button>
          </div>
          <span style="font-size:0.78rem;color:var(--ds-muted)">当前课题：<strong style="color:var(--ds-ink)">${esc(getCurrentTopic().herb)} · ${esc(getCurrentTopic().compound)}</strong></span>
        </div>
      </div>
    `;
    const engBtn = document.getElementById('v16AiEngineSwitchBtn');
    if (engBtn) engBtn.addEventListener('click', () => document.getElementById('btnOpenQwenCfgTop')?.click());

    // 按当前子标签精准控制 #qwenCommandBar / #qwenAutoForm / #qwenChatBox，确保每个板块专注清爽不重叠
    const qForm = document.getElementById('qwenAutoForm');
    if (qBar) {
      qBar.style.display = (aiSubTab === 'plan' || aiSubTab === 'arena') ? 'none' : '';
      // 在「实验助教答疑」分页下折叠上方编排表单与快捷灵感行，突出纯对话体验
      const toggleFormVisibility = (showComposer) => {
        if (qForm) qForm.style.display = showComposer ? '' : 'none';
        qBar.querySelectorAll('#aiPrecondBar, [data-qwen-demo]').forEach(el => {
          const row = el.id === 'aiPrecondBar' ? el : el.parentElement;
          if (row && row !== qBar) row.style.display = showComposer ? '' : 'none';
        });
      };
      toggleFormVisibility(aiSubTab === 'compose');
    }
    if (qChat) {
      if (aiSubTab === 'chat') qChat.classList.remove('hidden');
      else if (fromTabSwitch || aiSubTab === 'compose' || aiSubTab === 'arena') qChat.classList.add('hidden');
    }

    if (aiSubTab === 'arena') {
      extra.innerHTML = '<div id="v16AiArenaPage"></div>';
      if (window.TCM_V27_AI_ARENA && window.TCM_V27_AI_ARENA.render) {
        window.TCM_V27_AI_ARENA.render(document.getElementById('v16AiArenaPage'));
      }
    } else if (aiSubTab === 'compose') {
      extra.innerHTML = `
        <div class="space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h3 style="margin:0;font-size:1.02rem;font-weight:800;color:var(--ds-ink)">标准场景参考模板（点击填入上方指令框，按选定模板生成方案）</h3>
            <span style="font-size:0.76rem;color:var(--ds-muted)">内置 5 套标准化模板：本科4学时 / 大创正交 / 绿色无氯仿 / 2025药典 / 复方协同</span>
          </div>
          <div class="v16-ai-template-grid">
            ${AI_TEMPLATES.map(tpl => `
              <button type="button" class="v16-ai-tpl" data-v16-fill-prompt="${esc(tpl.prompt)}">
                <span>${esc(tpl.tag)}</span>
                <strong>${esc(tpl.title)}</strong>
                <p>${esc(tpl.desc)}</p>
              </button>
            `).join('')}
          </div>
        </div>
      `;
    } else if (aiSubTab === 'plan') {
      const tplList = window.TCMCloudAI?.DESIGN_TEMPLATES || [{ id: 'undergrad_4h', label: '本科 4 学时标准模板' }];
      extra.innerHTML = `
        <div class="v16-subhero" style="background:var(--ds-surface)">
          <div class="v16-subhero-top">
            <div>
              <h3 style="margin:0 0 6px;font-size:1.14rem;font-weight:850;color:var(--ds-ink)">方案模板校核与 SOP 修订</h3>
              <p>粘贴教材步骤、文献方法或自拟工艺，对照所选模板解析参数、排查热敏与安全风险，并输出 6 步量化修订 SOP。</p>
            </div>
            <button type="button" class="v16-chip-btn" data-v16-trigger="user-plan">打开完整推演工作台 ↗</button>
          </div>
          <div class="space-y-2.5 pt-2">
            <div class="flex flex-wrap items-center gap-2 text-xs">
              <span class="font-bold text-slate-600">校核对标模板：</span>
              <select id="v16InlinePlanTpl" class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs font-bold">
                ${tplList.map(t => `<option value="${esc(t.id)}">${esc(t.label)}</option>`).join('')}
              </select>
              <button type="button" id="v16PlanSample1" class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-700 text-[11px] font-bold text-slate-700 transition">示例：黄芩沸水杀酶酸沉</button>
              <button type="button" id="v16PlanSample2" class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-700 text-[11px] font-bold text-slate-700 transition">示例：川芎酸碱双相联产</button>
            </div>
            <textarea id="v16InlinePlanText" rows="4" class="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 leading-relaxed focus:outline-none focus:border-emerald-700" placeholder="粘贴已有实验步骤（含药材、溶剂、温度、料液比、纯化与检识方法）..."></textarea>
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="text-[11px] text-slate-500">支持将校核后的修订方案同步至六步工坊，或收录至自编题库。</span>
              <button type="button" id="v16InlinePlanRunBtn" class="v16-btn-cta-primary">执行模板校核并生成修订 SOP →</button>
            </div>
          </div>
          <div class="v16-ai-template-grid pt-2">
            <div class="v16-preview-block"><label>01 参数与极性提取</label><p>解析投料量、料液比、温度、提取次数与溶剂极性匹配度。</p></div>
            <div class="v16-preview-block"><label>02 模板合规与安全诊断</label><p>识别高危溶剂、热敏降解、超 4 学时与乳化或拖尾风险。</p></div>
            <div class="v16-preview-block"><label>03 输出量化修订 SOP</label><p>按选定模板生成可直接上台操作的 6 步 SOP 与四阶段现象预演。</p></div>
          </div>
        </div>
      `;
      const s1 = document.getElementById('v16PlanSample1');
      const s2 = document.getElementById('v16PlanSample2');
      const txtEl = document.getElementById('v16InlinePlanText');
      const runBtn = document.getElementById('v16InlinePlanRunBtn');
      if (s1 && txtEl) s1.addEventListener('click', () => { txtEl.value = '称取黄芩粗粉 50 g，先投入 10 倍量沸水（100℃）中杀酶 10 min，保持微沸煎煮提取 2 次，每次 60 min，合并滤液并减压浓缩至 100 mL。80℃ 下滴加稀盐酸调 pH 至 1.5~2.0，保温静置 1 h 后冷却析出黄色沉淀，布氏漏斗减压抽滤，以 70% 乙醇重结晶精制，最后采用硅胶 G 板 TLC（乙酸乙酯-丁酮-甲酸-水 5:3:1:1）与 278 nm 紫外标曲测定含量。'; });
      if (s2 && txtEl) s2.addEventListener('click', () => { txtEl.value = '取川芎粗粉 100 g，加 10 倍量 70% 乙醇 75℃ 热回流提取 2 次，每次 90 min，合并滤液 50℃ 旋蒸回收乙醇至浸膏。加水分散后调 pH 至 9.5，乙酸乙酯萃取 3 次分取川芎嗪相；水相再以稀盐酸调 pH 至 2.0，乙酸乙酯萃取 3 次分取阿魏酸相。两相分别脱水浓缩，进行 365 nm 蓝荧光 TLC 鉴别与 322 nm 紫外定量。'; });
      if (runBtn && txtEl) {
        runBtn.addEventListener('click', () => {
          const text = txtEl.value.trim();
          const tplId = document.getElementById('v16InlinePlanTpl')?.value || 'undergrad_4h';
          if (window.TCM_USER_PLAN?.openWithText) {
            window.TCM_USER_PLAN.openWithText({ text, templateId: tplId, autoRun: text.length >= 10 });
          } else if (window.TCM_USER_PLAN?.open) {
            window.TCM_USER_PLAN.open();
          }
        });
      }
    } else {
      extra.innerHTML = `
        <div class="space-y-3">
          <h3 style="margin:0;font-size:1.02rem;font-weight:800;color:var(--ds-ink)">高频实验排障提问（点击填入上方助教对话，按 4 套结构化模板作答）</h3>
          <div class="v16-ai-template-grid">
            ${AI_CHAT_PROMPTS.map((q, idx) => `
              <button type="button" class="v16-ai-tpl" data-v16-fill-chat="${esc(q)}">
                <span>高频提问 0${idx + 1}</span>
                <p style="margin-top:8px;color:var(--ds-ink);font-weight:650">${esc(q)}</p>
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  // ---------- 7. 渲染：独立 DIY 创意走向页 (DIY 4合1分页) ----------
  function renderDiy() {
    const head = document.getElementById('v16DiyHeader');
    const tools = document.getElementById('v16DiyToolsPage');
    if (!head || !tools) return;
    const ico = (d) => `<svg class="craft-ico" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;

    head.innerHTML = `
      <div class="v16-subhero">
        <div class="v16-subhero-top">
          <div>
            <h2>DIY 创意实验室</h2>
            <p>支持 136 药材 × 15 溶剂 × 8 装置自由配方推演、7 类实验失败分支与应急 CAPA 实训、复方配伍与薄层显色模拟及 15 套交互仿真装置。</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="v16-chip-btn gold" data-v16-trigger="ai-review">自编课题审核</button>
            <button type="button" class="v16-chip-btn" data-v16-go="workflow">进入实验工坊</button>
            <button type="button" class="v16-chip-btn" data-v16-go="home">← 返回首页</button>
          </div>
        </div>
        <div class="v16-seg-bar">
          <button type="button" class="v16-seg-btn ${diySubTab === 'formula' ? 'active' : ''}" data-v16-diy-tab="formula">${ico('<path d="M9 3h6"/><path d="M10 3v5.4L5.6 16.5A3 3 0 0 0 8.2 21h7.6a3 3 0 0 0 2.6-4.5L14 8.4V3"/>')}<span>自由配方沙盒</span></button>
          <button type="button" class="v16-seg-btn ${diySubTab === 'failures' ? 'active' : ''}" data-v16-diy-tab="failures">${ico('<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>')}<span>失败分支实训</span></button>
          <button type="button" class="v16-seg-btn ${diySubTab === 'studio' ? 'active' : ''}" data-v16-diy-tab="studio">复方配伍与 TLC</button>
          <button type="button" class="v16-seg-btn ${diySubTab === 'mission' ? 'active' : ''}" data-v16-diy-tab="mission">实操工具与记录本</button>
          <button type="button" class="v16-seg-btn ${diySubTab === 'hub' ? 'active' : ''}" data-v16-diy-tab="hub">实验装置库（15 套）</button>
          <button type="button" class="v16-seg-btn ${diySubTab === 'tools' ? 'active' : ''}" data-v16-diy-tab="tools">专业计算工具</button>
        </div>
      </div>
    `;

    // 确保自由配方沙盒与失败分支实验室容器挂载在 #v16DiyPage 内部
    let formulaBox = document.getElementById('v16DiyFormulaPage');
    if (!formulaBox && tools.parentNode) {
      formulaBox = document.createElement('div');
      formulaBox.id = 'v16DiyFormulaPage';
      tools.parentNode.insertBefore(formulaBox, tools);
    }

    let failBox = document.getElementById('v16DiyFailurePage');
    if (!failBox && tools.parentNode) {
      failBox = document.createElement('div');
      failBox.id = 'v16DiyFailurePage';
      tools.parentNode.insertBefore(failBox, tools);
    }

    // 只显示当前激活的那个子模块，其他全部隐藏
    document.querySelectorAll('.wpanel').forEach(p => p.classList.add('hidden'));
    tools.classList.add('hidden');
    if (formulaBox) formulaBox.classList.add('hidden');
    if (failBox) failBox.classList.add('hidden');

    if (diySubTab === 'formula') {
      if (formulaBox) {
        formulaBox.classList.remove('hidden');
        if (window.TCM_V25_FORMULA_SANDBOX && window.TCM_V25_FORMULA_SANDBOX.render) {
          window.TCM_V25_FORMULA_SANDBOX.render(formulaBox);
        }
      }
    } else if (diySubTab === 'failures') {
      if (failBox) {
        failBox.classList.remove('hidden');
        if (window.TCM_V26_FAILURE_BRANCHES && window.TCM_V26_FAILURE_BRANCHES.render) {
          window.TCM_V26_FAILURE_BRANCHES.render(failBox);
        }
      }
    } else if (diySubTab === 'studio') {
      const p = document.getElementById('wpanel-diy');
      if (p) p.classList.remove('hidden');
      if (window.TCM_DIY_STUDIO && window.TCM_DIY_STUDIO.render) window.TCM_DIY_STUDIO.render();
    } else if (diySubTab === 'mission') {
      const p = document.getElementById('wpanel-mission');
      if (p) p.classList.remove('hidden');
      if (window.TCM_MISSION_OS && window.TCM_MISSION_OS.render) window.TCM_MISSION_OS.render();
    } else if (diySubTab === 'hub') {
      if (api() && api().getStep() !== 'hub') {
        api().goStep('hub');
        return; // goStep will call renderAll -> onAppRender
      }
      const p = document.getElementById('wpanel-hub');
      if (p) p.classList.remove('hidden');
    } else {
      tools.classList.remove('hidden');
      tools.innerHTML = `
        <div class="v16-diy-tools-grid">
          ${DIY_TOOLS.map(item => `
            <button type="button" class="v16-tool-card" data-v16-tool="${esc(item.action)}">
              <div class="flex items-center justify-between gap-2">
                <span class="v16-bento-icon">${item.icon}</span>
                <span class="v16-topic-cat">${esc(item.badge)}</span>
              </div>
              <h4>${esc(item.title)}</h4>
              <p>${esc(item.desc)}</p>
              <span class="v16-tool-go">立即打开使用 →</span>
            </button>
          `).join('')}
        </div>
      `;
    }
  }

  // ---------- 8. 渲染：纯净 6 步工坊面包屑条 ----------
  function renderWorkflowBar() {
    const bar = document.getElementById('v16WorkflowBar');
    if (!bar) return;
    const t = getCurrentTopic();
    const s = api() ? api().getStep() : 1;
    const stepNames = { 1: '01 选材档案', 2: '02 定题与参数', 3: '03 原理与方案', 4: '04 装置与流程', 5: '05 实验数据', 6: '06 A4 报告导出' };
    bar.innerHTML = `
      <div class="v16-crumb">
        <button type="button" data-v16-go="home">首页</button>
        <span>/</span>
        <button type="button" data-v16-go="bank">题库大厅</button>
        <span>/</span>
        <strong>${esc(t.herb)} · ${esc(t.compound)}</strong>
        <span class="px-2 py-0.5 rounded-md text-[11px] font-bold" style="background:var(--craft-accent-soft);color:var(--craft-accent);border:1px solid rgba(15,76,58,0.22)">${stepNames[s] || '实验工坊'}</span>
      </div>
      <div class="v16-wf-actions">
        <button type="button" class="v16-chip-btn" data-v16-go="bank">换药材</button>
        <button type="button" class="v16-chip-btn" data-v16-to-translation="${esc(t.id)}">产业转化</button>
        <button type="button" class="v16-chip-btn gold" data-v16-go="ai">智能设计与助教</button>
        <button type="button" class="v16-chip-btn" data-v16-go="diy">DIY 实验室</button>
        <button type="button" class="v16-chip-btn" data-v16-trigger="v15">方案体检</button>
      </div>
    `;
  }

  // ---------- 9. 路由核心切换控制器 ----------
  function applyRouteVisibility() {
    const isPortal = currentRoute !== 'workflow';
    document.body.dataset.v16Route = currentRoute;
    document.body.dataset.v16Mode = isPortal ? 'portal' : 'workflow';

    const show = (id, visible) => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('hidden', !visible);
    };

    show('v16HomePage', currentRoute === 'home');
    show('v16BankPage', currentRoute === 'bank');
    show('v16AiHeader', currentRoute === 'ai');
    show('v16AiExtra', currentRoute === 'ai');
    show('v16DiyHeader', currentRoute === 'diy');
    show('v16DiyToolsPage', currentRoute === 'diy' && diySubTab === 'tools');
    show('v18TranslationPage', currentRoute === 'translation');
    show('v16WorkflowBar', currentRoute === 'workflow');

    // 更新顶栏激活态与标题
    document.querySelectorAll('#workspaceZoneBar [data-v16-route]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.v16Route === currentRoute);
    });

    const stepTag = document.getElementById('headerStepTag');
    const titleEl = document.getElementById('headerTitle');
    const metaMap = {
      home: ['PORTAL', '总览首页'],
      bank: ['BANK', '药材题库大厅'],
      ai: ['AI STUDIO', '智能实验设计台'],
      diy: ['DIY LAB', 'DIY 创意实验室'],
      translation: ['TRANSLATION', '产业转化训练']
    };
    if (currentRoute !== 'workflow' && metaMap[currentRoute]) {
      if (stepTag) stepTag.textContent = metaMap[currentRoute][0];
      if (titleEl) titleEl.textContent = metaMap[currentRoute][1];
    }

    if (currentRoute === 'home') renderHome();
    else if (currentRoute === 'bank') renderBank();
    else if (currentRoute === 'ai') renderAi();
    else if (currentRoute === 'diy') renderDiy();
    else if (currentRoute === 'translation') {
      if (window.TCM_TRANSLATION && window.TCM_TRANSLATION.init) window.TCM_TRANSLATION.init();
    } else if (currentRoute === 'workflow') {
      // 确保 workflow 显示当前数字步骤的 wpanel，并同步顶栏标题与驾驶舱重绘
      const step = api() ? api().getStep() : 1;
      if (typeof step !== 'number') {
        api() && api().goStep(1);
        return;
      }
      const stepMeta = { 1: '选材', 2: '定题', 3: '原理与方案', 4: '装置与流程', 5: '数据', 6: '报告' };
      if (stepTag) stepTag.textContent = `0${step} / 06`;
      if (titleEl) titleEl.textContent = stepMeta[step] || '实验工坊';
      document.querySelectorAll('.wpanel').forEach(p => p.classList.add('hidden'));
      const curPanel = document.getElementById(`wpanel-${step}`);
      if (curPanel) curPanel.classList.remove('hidden');
      renderWorkflowBar();
      const qBar = document.getElementById('qwenCommandBar');
      if (qBar) qBar.style.display = '';
      setTimeout(() => window.dispatchEvent(new Event('resize')), 40);
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function go(route, opts = {}) {
    const valid = ['home', 'bank', 'ai', 'diy', 'translation', 'workflow'];
    if (!valid.includes(route)) route = 'home';
    currentRoute = route;
    if (route === 'ai' && opts.subTab) aiSubTab = opts.subTab;
    if (route === 'diy' && opts.subTab) diySubTab = opts.subTab;
    try { sessionStorage.setItem(ROUTE_STORAGE_KEY, route); } catch (_) {}

    if (route === 'workflow' && opts.step && api()) {
      api().goStep(Number(opts.step));
      return;
    }
    if (route === 'workflow' && api() && typeof api().getStep() !== 'number') {
      api().goStep(1);
      return;
    }
    if (route === 'diy' && diySubTab === 'hub' && api() && api().getStep() !== 'hub') {
      api().goStep('hub');
      return;
    }

    applyRouteVisibility();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------- 10. 全局事件委托（单点处理所有分支交互） ----------
  function handleGlobalDelegate(e) {
    const goBtn = e.target.closest('[data-v16-go]');
    if (goBtn) {
      go(goBtn.dataset.v16Go, { step: goBtn.dataset.v16Step, subTab: goBtn.dataset.v16Sub });
      return;
    }

    const resumeBtn = e.target.closest('[data-v16-resume]');
    if (resumeBtn) {
      if (window.TCM_RESUME_BRIDGE && window.TCM_RESUME_BRIDGE.getResumeInfo && window.TCM_RESUME_BRIDGE.getResumeInfo()) {
        currentRoute = 'workflow';
        window.TCM_RESUME_BRIDGE.resumeNow();
      } else {
        go('workflow', { step: 1 });
      }
      return;
    }

    const trig = e.target.closest('[data-v16-trigger]');
    if (trig) {
      const act = trig.dataset.v16Trigger;
      if (act === 'v15' && window.TCM_V15_INSIGHT) window.TCM_V15_INSIGHT.open();
      else if (act === 'ai-review' && window.TCM_AI_REVIEW) window.TCM_AI_REVIEW.open();
      else if (act === 'tr-dev' && window.TCM_TRANSLATION) window.TCM_TRANSLATION.openDeviation('yield');
      else if (act === 'compare') document.getElementById('btnOpenCompareTop')?.click();
      else if (act === 'cmd') document.getElementById('btnOpenCmdPalette')?.click();
      else if (act === 'drawer') api() && api().openRightDrawer('bank');
      else if (act === 'diy-herb') document.getElementById('btnOpenDiyHerbHero')?.click();
      else if (act === 'user-plan') document.getElementById('btnOpenUserPlanModal')?.click();
      else if (act === 'feedback') document.getElementById('btnOpenFeedbackFooter')?.click();
      return;
    }

    const toTrBtn = e.target.closest('[data-v16-to-translation]');
    if (toTrBtn) {
      const tid = toTrBtn.dataset.v16ToTranslation;
      if (window.TCM_TRANSLATION && window.TCM_TRANSLATION.importBankTopic && tid) {
        window.TCM_TRANSLATION.importBankTopic(tid);
      } else {
        go('translation');
      }
      return;
    }

    const favBtn = e.target.closest('[data-v27-fav]');
    if (favBtn) {
      e.stopPropagation();
      const id = favBtn.dataset.v27Fav;
      if (window.TCM_BANK_ENRICH && id) {
        window.TCM_BANK_ENRICH.toggleFavorite(id);
        renderBank();
      }
      return;
    }

    const detailTabBtn = e.target.closest('[data-v27-detail-tab]');
    if (detailTabBtn) {
      bankState.detailTab = detailTabBtn.dataset.v27DetailTab || 'chem';
      updateBankResultsOnly();
      return;
    }

    const spectraBtn = e.target.closest('[data-v27-open-spectra]');
    if (spectraBtn) {
      const cat = spectraBtn.dataset.v27OpenSpectra || '黄酮';
      if (window.TCM_V21_SPECTRA_LAB && typeof window.TCM_V21_SPECTRA_LAB.open === 'function') {
        window.TCM_V21_SPECTRA_LAB.open(cat);
      }
      return;
    }

    const previewBtn = e.target.closest('[data-v16-preview]');
    if (previewBtn) {
      bankState.previewId = previewBtn.dataset.v16Preview;
      updateBankResultsOnly();
      return;
    }

    const lockBtn = e.target.closest('[data-v16-lock-topic]');
    if (lockBtn) {
      const id = lockBtn.dataset.v16LockTopic;
      const targetStep = Number(lockBtn.dataset.v16TargetStep) || 2;
      currentRoute = 'workflow';
      if (api()) api().selectTopic(id, targetStep);
      else go('workflow', { step: targetStep });
      return;
    }

    const aiHerbBtn = e.target.closest('[data-v16-ai-herb]');
    if (aiHerbBtn) {
      const h = aiHerbBtn.dataset.v16AiHerb || '';
      const comp = aiHerbBtn.dataset.v16AiComp || '';
      go('ai', { subTab: 'compose' });
      const inp = document.getElementById('qwenPromptInput');
      if (inp) {
        inp.value = `请为「${h}（目标成分：${comp}）」设计一套适合高校本科 4 学时的绿色高效提取、分离纯化与薄层检识方案，并自动配置最优装置与报告框架。`;
        inp.focus();
      }
      return;
    }

    const bankTab = e.target.closest('[data-v16-bank-tab]');
    if (bankTab) { bankState.tab = bankTab.dataset.v16BankTab; renderBank(); return; }

    const bankCat = e.target.closest('[data-v16-bank-cat]');
    if (bankCat) { bankState.cat = bankCat.dataset.v16BankCat; renderBank(); return; }

    const bankScene = e.target.closest('[data-v16-bank-scene]');
    if (bankScene) { bankState.scene = bankScene.dataset.v16BankScene; renderBank(); return; }

    if (e.target.closest('#v16BankReset') || e.target.closest('#v16BankResetEmpty')) {
      bankState = { tab: 'all', cat: '全部', scene: 'all', sort: 'default', detailTab: bankState.detailTab || 'chem', query: '', previewId: bankState.previewId };
      renderBank();
      return;
    }

    const aiTab = e.target.closest('[data-v16-ai-tab]');
    if (aiTab) { aiSubTab = aiTab.dataset.v16AiTab; renderAi(true); return; }

    const fillPrompt = e.target.closest('[data-v16-fill-prompt]');
    if (fillPrompt) {
      const inp = document.getElementById('qwenPromptInput');
      if (inp) {
        inp.value = fillPrompt.dataset.v16FillPrompt || '';
        inp.scrollIntoView({ behavior: 'smooth', block: 'center' });
        inp.focus();
      }
      return;
    }

    const fillChat = e.target.closest('[data-v16-fill-chat]');
    if (fillChat) {
      const inp = document.getElementById('qwenChatInput');
      if (inp) {
        inp.value = fillChat.dataset.v16FillChat || '';
        inp.scrollIntoView({ behavior: 'smooth', block: 'center' });
        inp.focus();
      }
      return;
    }

    const diyTab = e.target.closest('[data-v16-diy-tab]');
    if (diyTab) {
      diySubTab = diyTab.dataset.v16DiyTab;
      renderDiy();
      return;
    }

    const toolBtn = e.target.closest('[data-v16-tool]');
    if (toolBtn) {
      const act = toolBtn.dataset.v16Tool;
      if (act === 'open-compare') { document.getElementById('btnOpenCompareTop')?.click(); return; }
      const jumpAndScroll = (stepNum, selector) => {
        go('workflow', { step: stepNum });
        setTimeout(() => {
          const el = selector && document.querySelector(selector);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
      };
      if (act === 'go-v9-diy') jumpAndScroll(3, '#v9DiyWorkshopMount');
      else if (act === 'go-v10-sandbox') jumpAndScroll(4, '#v10SandboxMount');
      else if (act === 'go-step3-tools') jumpAndScroll(3, '#v3ToolsStep3Mount');
      else if (act === 'go-step5-tools') jumpAndScroll(5, '#v3OrthogonalMount, #v4StdCurveMount');
      else if (act === 'go-step2-scale') jumpAndScroll(2, '#v5ScaleupMount');
      return;
    }

    const extBtn = e.target.closest('[data-v16-ext]');
    if (extBtn) {
      const found = extensions.find(x => x.id === extBtn.dataset.v16Ext);
      if (found && typeof found.onOpen === 'function') found.onOpen();
    }
  }

  // ---------- 11. 与原生 app.js / v6 / v15 的双向路由联动 ----------
  function bindCrossModuleHooks() {
    const mainCol = document.getElementById('studioMainCol');
    if (mainCol) mainCol.addEventListener('click', handleGlobalDelegate);

    // 当用户从 AI 回执点击「查看第 X 步」或从左侧/右侧抽屉点击课题、步骤时自动切入 workflow
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-qwen-jump]') || e.target.closest('#wizardNav [data-wstep]') || e.target.closest('#dockMiniTimeline [data-dock-step]')) {
        currentRoute = 'workflow';
      } else if (e.target.closest('#btnOpenQwenCfgTop')) {
        // 顶栏「智能助手」按钮直达 AI 设计台（而非只弹窗）
      }
    }, true);

    // 快捷键：Alt+0 回首页，Alt+B 主题题库，Alt+A 去 AI 设计台，Alt+D 去 DIY 实验室
    document.addEventListener('keydown', (e) => {
      if (!e.altKey || e.ctrlKey || e.metaKey) return;
      const k = (e.key || '').toLowerCase();
      if (k === '0') { e.preventDefault(); go('home'); }
      else if (k === 'b') { e.preventDefault(); go('bank'); }
      else if (k === 'a') { e.preventDefault(); go('ai'); }
      else if (k === 'd') { e.preventDefault(); go('diy'); }
      else if (k === 't') { e.preventDefault(); go('translation'); }
    });
  }

  function onAppRender(t, ws, stats, step) {
    if (!inited) return;
    // 若外部模块（如 Ctrl+K / v15 / AI回执）切换到了 hub/diy/mission，同步到 DIY 走向页
    if (step === 'hub' && currentRoute !== 'diy') {
      currentRoute = 'diy';
      diySubTab = 'hub';
    } else if (step === 'diy' && currentRoute !== 'diy') {
      currentRoute = 'diy';
      diySubTab = 'studio';
    } else if (step === 'mission' && currentRoute !== 'diy') {
      currentRoute = 'diy';
      diySubTab = 'mission';
    }
    applyRouteVisibility();
  }

  function registerExtension(ext) {
    if (!ext || !ext.id) return;
    extensions = extensions.filter(x => x.id !== ext.id);
    extensions.push(ext);
    if (inited && currentRoute === 'home') renderHome();
  }

  function init() {
    if (inited) return;
    inited = true;
    upgradeHeaderNav();
    ensureContainers();
    bindCrossModuleHooks();
    syncLucideIcons();
    window.addEventListener('load', syncLucideIcons, { once: true });
    if (typeof MutationObserver !== 'undefined') {
      new MutationObserver(() => {
        if (document.querySelector('i[data-lucide]')) syncLucideIcons();
      }).observe(document.body, { childList: true, subtree: true });
    }

    // 若 URL 明确指定 ?step= 或 ?route= 则直达对应页；否则默认展示高端落地页 home
    const params = new URLSearchParams(window.location.search || '');
    const urlRoute = params.get('route');
    const urlStep = params.get('step');
    if (urlRoute && ['home', 'bank', 'ai', 'diy', 'translation', 'workflow'].includes(urlRoute)) {
      currentRoute = urlRoute;
    } else if (urlStep) {
      currentRoute = 'workflow';
    } else {
      currentRoute = 'home';
    }
    applyRouteVisibility();
  }

  window.TCM_V16_PORTAL = {
    go,
    getRoute: () => currentRoute,
    onAppRender,
    registerExtension
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
