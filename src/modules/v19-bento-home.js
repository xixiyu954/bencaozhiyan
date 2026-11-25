/**
 * 本草智研 v19 · Apple 级极简磨砂玻璃 Bento 首页与二十四节气引擎
 * 复刻并升级现代极简 Bento 主视觉：清透薄荷雾底 + 悬浮胶囊导航 + 3D 磨砂玻璃主图 + 8 张微插画 Bento 卡片
 */
import heroArtUrl from '../assets/hero-botanical-3d.webp';

const STORAGE_KEY_COLLAPSED = 'tcm_v19_bento_strip_collapsed';

const SOLAR_TERMS = [
  { name: '小寒', month: 1, day: 5, herbs: ['干姜', '肉桂'], note: '冬季灵感 · 温里挥发油与提取工艺' },
  { name: '大寒', month: 1, day: 20, herbs: ['干姜', '麻黄'], note: '冬季灵感 · 挥发油与生物碱质控' },
  { name: '立春', month: 2, day: 4, herbs: ['柴胡', '薄荷'], note: '春季灵感 · 挥发油提取与疏肝类药材' },
  { name: '雨水', month: 2, day: 19, herbs: ['茯苓', '白术'], note: '春季灵感 · 多糖纯化与健脾类药材' },
  { name: '惊蛰', month: 3, day: 5, herbs: ['金银花', '连翘'], note: '春季灵感 · 绿原酸与酚酸类提取' },
  { name: '春分', month: 3, day: 20, herbs: ['菊花', '枸杞子'], note: '春季灵感 · 黄酮分级与天然产物' },
  { name: '清明', month: 4, day: 4, herbs: ['艾叶', '茵陈'], note: '春季灵感 · 芳香挥发油与得率分析' },
  { name: '谷雨', month: 4, day: 20, herbs: ['丹参', '牡丹皮'], note: '春季灵感 · 丹参酮与丹酚酸双提' },
  { name: '立夏', month: 5, day: 5, herbs: ['黄连', '黄柏'], note: '夏季灵感 · 生物碱酸水结晶与分离' },
  { name: '小满', month: 5, day: 21, herbs: ['苦参', '葛根'], note: '夏季灵感 · 生物碱与异黄酮纯化' },
  { name: '芒种', month: 6, day: 5, herbs: ['藿香', '厚朴'], note: '夏季灵感 · 蒸馏与木脂素提取工艺' },
  { name: '夏至', month: 6, day: 21, herbs: ['黄芩', '栀子'], note: '夏季灵感 · 沸水杀酶保苷与黄酮苷' },
  { name: '小暑', month: 7, day: 7, herbs: ['紫苏叶', '金银花'], note: '夏季灵感 · 热敏挥发油与清热酚酸' },
  { name: '大暑', month: 7, day: 22, herbs: ['槐米', '荷叶'], note: '夏季灵感 · 碱提酸沉精制与黄酮' },
  { name: '立秋', month: 8, day: 7, herbs: ['麦冬', '甘草'], note: '秋季灵感 · 皂苷与多糖分离纯化' },
  { name: '处暑', month: 8, day: 23, herbs: ['桔梗', '甘草'], note: '秋季灵感 · 三萜皂苷起泡控制与纯化' },
  { name: '白露', month: 9, day: 7, herbs: ['苦杏仁', '贝母'], note: '秋季灵感 · 苷类与生物碱检识' },
  { name: '秋分', month: 9, day: 23, herbs: ['银杏叶', '陈皮'], note: '秋季灵感 · 黄酮内酯与橙皮苷' },
  { name: '寒露', month: 10, day: 8, herbs: ['丹参', '川芎'], note: '秋季灵感 · 活血成分与酚酸提取' },
  { name: '霜降', month: 10, day: 23, herbs: ['红花', '川芎'], note: '秋季灵感 · 阿魏酸与色素提取' },
  { name: '立冬', month: 11, day: 7, herbs: ['黄芪', '人参'], note: '冬季灵感 · 皂苷大孔树脂富集' },
  { name: '小雪', month: 11, day: 22, herbs: ['当归', '肉桂'], note: '冬季灵感 · 挥发油与回流工艺' },
  { name: '大雪', month: 12, day: 7, herbs: ['杜仲', '大黄'], note: '冬季灵感 · 蒽醌游离与结合型分离' },
  { name: '冬至', month: 12, day: 21, herbs: ['五味子', '延胡索'], note: '冬季灵感 · 绿色提取与炮制对照' }
];

let currentTermIndex = 0;
let isRenderingHome = false;

function detectCurrentTermIndex(date = new Date()) {
  const md = (date.getMonth() + 1) * 100 + date.getDate();
  let bestIdx = 0;
  let bestMd = -1;
  for (let i = 0; i < SOLAR_TERMS.length; i++) {
    const tMd = SOLAR_TERMS[i].month * 100 + SOLAR_TERMS[i].day;
    if (tMd <= md && tMd > bestMd) {
      bestMd = tMd;
      bestIdx = i;
    }
  }
  return bestIdx;
}

function getCounts() {
  if (typeof window !== 'undefined' && window.TCM_LAB_API?.getCounts) {
    return window.TCM_LAB_API.getCounts();
  }
  return { topics: 119, rigs: 15, literature: 85, univCases: 38 };
}

function jumpToBankWithHerb(herbName) {
  if (!window.TCM_V16_PORTAL || typeof window.TCM_V16_PORTAL.go !== 'function') return;
  window.TCM_V16_PORTAL.go('bank');
  setTimeout(() => {
    const inp = document.getElementById('v16BankSearch');
    if (!inp) return;
    inp.value = herbName;
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    inp.focus();
  }, 60);
}

function upgradeBrandIcon() {
  const logo = document.querySelector('#v16BrandHomeBtn .v16-brand-logo');
  if (!logo || logo.dataset.v19Icon === '1') return;
  logo.dataset.v19Icon = '1';
  logo.innerHTML = `<svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" fill="currentColor" fill-opacity="0.28"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/><circle cx="6.5" cy="5.5" r="1.4" fill="currentColor" stroke="none"/><circle cx="10.5" cy="3.5" r="1" fill="currentColor" stroke="none"/></svg>`;
}

function renderSolarStrip(host) {
  if (!host) return;
  try {
    if (localStorage.getItem(STORAGE_KEY_COLLAPSED) === '1') return;
  } catch (_) {}

  currentTermIndex = detectCurrentTermIndex(new Date());
  let bar = host.querySelector('#tcmV19BentoStrip');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'tcmV19BentoStrip';
    bar.className = 'v19-bento-strip no-print';
    host.appendChild(bar);
  }

  const update = () => {
    const term = SOLAR_TERMS[currentTermIndex];
    const pills = term.herbs
      .map((h) => `<button type="button" class="v19-bento-pill" data-v19-herb="${h}">${h} ↗</button>`)
      .join('');
    bar.innerHTML = `
      <div class="v19-bento-strip-left">
        <span class="v19-bento-tag"><span class="v19-bento-tag-dot"></span>${term.name} · 节气本草</span>
        ${pills}
        <span class="v19-bento-tip">${term.note}</span>
      </div>
      <div class="v19-bento-strip-actions">
        <button type="button" class="v19-bento-mini-btn" data-v19-act="prev" title="上一节气">‹</button>
        <button type="button" class="v19-bento-mini-btn" data-v19-act="next" title="下一节气">›</button>
        <button type="button" class="v19-bento-mini-btn" data-v19-act="close" title="收起节气条">×</button>
      </div>`;
  };

  if (!bar.dataset.bound) {
    bar.dataset.bound = '1';
    bar.addEventListener('click', (e) => {
      const herbBtn = e.target.closest('[data-v19-herb]');
      if (herbBtn) {
        jumpToBankWithHerb(herbBtn.getAttribute('data-v19-herb') || '');
        return;
      }
      const actBtn = e.target.closest('[data-v19-act]');
      if (!actBtn) return;
      const act = actBtn.getAttribute('data-v19-act');
      if (act === 'prev') {
        currentTermIndex = (currentTermIndex - 1 + SOLAR_TERMS.length) % SOLAR_TERMS.length;
        update();
      } else if (act === 'next') {
        currentTermIndex = (currentTermIndex + 1) % SOLAR_TERMS.length;
        update();
      } else if (act === 'close') {
        try { localStorage.setItem(STORAGE_KEY_COLLAPSED, '1'); } catch (_) {}
        bar.remove();
      }
    });
  }
  update();
}

function renderBentoHome() {
  const homePage = document.getElementById('v16HomePage');
  if (!homePage || isRenderingHome) return;
  if (homePage.querySelector('.v19-home-shell')) return;

  isRenderingHome = true;
  try {
    const c = getCounts();
    const ICO_CUBE = `<svg class="craft-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`;
    const ICO_MOL = `<svg class="craft-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="2.5"/><circle cx="6" cy="6" r="1.8"/><circle cx="18" cy="6" r="1.8"/><circle cx="6" cy="18" r="1.8"/><circle cx="18" cy="18" r="1.8"/><path d="m10.2 10.2-2.9-2.9M13.8 10.2l2.9-2.9M10.2 13.8l-2.9 2.9M13.8 13.8l2.9 2.9"/></svg>`;
    const ICO_BOOK = `<svg class="craft-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`;
    const ICO_GRAPH = `<svg class="craft-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.6M8.2 13.2l7.6 4.6"/></svg>`;
    homePage.innerHTML = `
      <div class="v19-home-shell">
        <!-- 1. 学术典籍风格 Hero 主视觉 -->
        <section class="v19-hero">
          <div class="v19-hero-copy">
            <span class="v19-hero-eyebrow"><span class="v19-hero-eyebrow-dot"></span>《中国药典》2025 版对照 · 天然产物提取与质控工作台</span>
            <h2 class="v19-hero-title">本草智研</h2>
            <p class="v19-hero-sub">中药化学教学与科研实验台</p>
            <p class="v19-hero-desc">
              涵盖药材档案、提取纯化工艺推演、四谱解析与三维实验仿真。
            </p>
            <div class="v19-hero-actions">
              <button type="button" class="v19-cta-primary" data-v16-go="bank">进入药材题库 <span>→</span></button>
              <button type="button" class="v19-cta-secondary" data-v16-ext="v22_visual_suite">${ICO_CUBE}<span>三维虚拟实验室</span></button>
              <button type="button" class="v19-cta-secondary" data-v16-go="workflow" data-v16-step="1">六步实验工坊 →</button>
            </div>
            <div class="v19-hero-metrics">
              <span class="v19-metric-chip"><strong>${c.topics}</strong> 药材课题</span>
              <span aria-hidden="true">·</span>
              <span class="v19-metric-chip"><strong>6 大学科</strong> 知识全库</span>
              <span aria-hidden="true">·</span>
              <span class="v19-metric-chip"><strong>${c.rigs} 套</strong> 交互装置</span>
              <span aria-hidden="true">·</span>
              <span class="v19-metric-chip"><strong>${c.literature} 篇</strong> 实证文献</span>
            </div>
          </div>

          <button type="button" class="v19-hero-visual" data-v16-ext="v20_mol3d" title="点击启动 3D 分子结构库与粒子显色台">
            <div class="v19-hero-glow" aria-hidden="true"></div>
            <img src="${heroArtUrl}" alt="本草智研本草叶片与三维分子构象模型" class="v19-hero-art" width="760" height="570" fetchpriority="high" />
            <span class="v19-hero-visual-hint">${ICO_MOL}<span>三维构象与显色台 ↗</span></span>
          </button>
        </section>

        <!-- 1.5 二十四节气与新中式天气氛围推荐卡插槽（由 lab-v24-solar-atmosphere 同步挂载，零 CLS） -->
        <div id="v24SolarSlot"></div>

        <!-- 2. 四列精工细线卡片矩阵 -->
        <section class="v19-bento-grid" aria-label="核心实验模块">
          <!-- 卡 1：3D 分子解析 -->
          <button type="button" class="v19-bento-card" data-v16-ext="v20_mol3d">
            <div>
              <div class="v19-bento-card-head">
                <span class="v19-pill-tag v19-pill-mint">01 分子构象</span>
                <svg viewBox="0 0 36 18" class="w-9 h-4" aria-hidden="true">
                  <rect x="2" y="10" width="4" height="8" rx="1.5" fill="#0f4c3a" opacity="0.45"/>
                  <rect x="9" y="5" width="4" height="13" rx="1.5" fill="#0f4c3a" opacity="0.72"/>
                  <rect x="16" y="8" width="4" height="10" rx="1.5" fill="#0f4c3a" opacity="0.55"/>
                  <rect x="23" y="2" width="4" height="16" rx="1.5" fill="#9a4a24" opacity="0.82"/>
                  <rect x="30" y="6" width="4" height="12" rx="1.5" fill="#0f4c3a" opacity="0.65"/>
                </svg>
              </div>
              <h3 class="v19-bento-title">三维分子与显色</h3>
              <p class="v19-bento-sub">PubChem 实测构象、官能团高亮与经典理化显色</p>
            </div>
            <div class="v19-card-stage">
              <svg viewBox="0 0 180 100" class="w-40 h-24" aria-hidden="true">
                <ellipse cx="90" cy="82" rx="48" ry="11" fill="none" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="4 3"/>
                <line x1="90" y1="44" x2="54" y2="62" stroke="#64748b" stroke-width="3.5" stroke-linecap="round"/>
                <line x1="90" y1="44" x2="124" y2="28" stroke="#64748b" stroke-width="3.5" stroke-linecap="round"/>
                <line x1="90" y1="44" x2="118" y2="68" stroke="#64748b" stroke-width="3.5" stroke-linecap="round"/>
                <line x1="90" y1="44" x2="72" y2="20" stroke="#94a3b8" stroke-width="2.6" stroke-linecap="round"/>
                <circle cx="90" cy="44" r="13.5" fill="url(#v19MolC)"/>
                <circle cx="54" cy="62" r="9.5" fill="url(#v19MolG)"/>
                <circle cx="124" cy="28" r="9.5" fill="url(#v19MolO)"/>
                <circle cx="118" cy="68" r="7.5" fill="#cbd5e1"/>
                <circle cx="72" cy="20" r="6.5" fill="#94a3b8"/>
                <defs>
                  <radialGradient id="v19MolC" cx="35%" cy="30%"><stop offset="0%" stop-color="#64748b"/><stop offset="100%" stop-color="#1e293b"/></radialGradient>
                  <radialGradient id="v19MolG" cx="35%" cy="30%"><stop offset="0%" stop-color="#5fb89c"/><stop offset="100%" stop-color="#0f4c3a"/></radialGradient>
                  <radialGradient id="v19MolO" cx="35%" cy="30%"><stop offset="0%" stop-color="#d99268"/><stop offset="100%" stop-color="#9a4a24"/></radialGradient>
                </defs>
              </svg>
            </div>
            <div class="v19-card-foot"><span>丹参酮 · 黄芩苷 · 小檗碱</span><span>打开 ↗</span></div>
          </button>

          <!-- 卡 2：智能实验设计 -->
          <button type="button" class="v19-bento-card" data-v16-go="ai">
            <div>
              <div class="v19-bento-card-head">
                <span class="v19-pill-tag v19-pill-mint">02 实验编排</span>
                <span class="text-[11px] font-bold tracking-wider uppercase" style="color:var(--craft-muted)">5 套模板</span>
              </div>
              <h3 class="v19-bento-title">智能实验设计</h3>
              <p class="v19-bento-sub">90 分五维评审、模板编排、已有方案校核与答疑</p>
            </div>
            <div class="v19-card-stage">
              <div class="v19-mini-ide" aria-hidden="true">
                <div class="v19-mini-ide-left">
                  <div class="v19-mini-ide-dots"><span style="background:rgba(255,255,255,0.32)"></span><span style="background:rgba(255,255,255,0.22)"></span><span style="background:rgba(95,184,156,0.75)"></span></div>
                  <div class="v19-mini-ide-bar" style="width:76%"></div>
                  <div class="v19-mini-ide-bar" style="width:58%"></div>
                  <div class="v19-mini-ide-bar" style="width:88%;background:rgba(95,184,156,0.58)"></div>
                  <div class="v19-mini-ide-bar" style="width:66%"></div>
                </div>
                <div class="v19-mini-ide-right">
                  <span class="v19-mini-chat-pill" style="background:var(--craft-accent-soft);color:var(--craft-accent)">标准模板校核</span>
                  <div class="v19-mini-ide-bar" style="width:85%;background:#cbd5e1"></div>
                  <div class="v19-mini-ide-bar" style="width:64%;background:#94a3b8"></div>
                  <div class="v19-mini-ide-bar" style="width:72%;background:#cbd5e1"></div>
                </div>
              </div>
            </div>
            <div class="v19-card-foot"><span>三引擎调度 · 规范 SOP</span><span>进入 →</span></div>
          </button>

          <!-- 卡 3：药材实验题库 -->
          <button type="button" class="v19-bento-card" data-v16-go="bank">
            <div>
              <div class="v19-bento-card-head">
                <span class="v19-pill-tag v19-pill-coral">03 药材题库</span>
                <span class="text-xs font-bold tabular-nums" style="color:var(--craft-muted)">${c.topics} 项</span>
              </div>
              <h3 class="v19-bento-title">药材实验题库</h3>
              <p class="v19-bento-sub">按化学成分大类、生物合成途径与药典限度检索</p>
            </div>
            <div class="v19-card-stage">
              <div class="v19-mini-checklist" aria-hidden="true">
                <div class="v19-mini-check-row"><span class="v19-mini-check-box text-white" style="background:#0f4c3a">✓</span><span>黄芩 · 沸水杀酶保苷</span></div>
                <div class="v19-mini-check-row"><span class="v19-mini-check-box" style="background:rgba(15,76,58,0.12);color:#0f4c3a">✓</span><span>丹参 · 脂水双提工艺</span></div>
                <div class="v19-mini-check-row"><span class="v19-mini-check-box border border-slate-300 bg-white"></span><span style="color:var(--craft-muted)">槐米 · 碱提酸沉精制</span></div>
                <div class="v19-mini-progress"><span style="width:74%;background:#0f4c3a"></span></div>
              </div>
            </div>
            <div class="v19-card-foot"><span>六科档案 · 药典对照</span><span>浏览 →</span></div>
          </button>

          <!-- 卡 4：DIY 虚拟实验室 -->
          <button type="button" class="v19-bento-card" data-v16-go="diy">
            <div>
              <div class="v19-bento-card-head">
                <span class="v19-pill-tag v19-pill-sky">04 虚拟沙盒</span>
                <span class="text-xs font-bold tabular-nums" style="color:var(--craft-muted)">${c.rigs} 装置</span>
              </div>
              <h3 class="v19-bento-title">DIY 虚拟实验室</h3>
              <p class="v19-bento-sub">自由配方推演、7 类实验失败分支与 TLC 模拟</p>
            </div>
            <div class="v19-card-stage">
              <svg viewBox="0 0 180 100" class="w-44 h-24" aria-hidden="true">
                <path d="M58 18 L70 18 L70 40 L88 78 Q91 84 84 86 L44 86 Q37 84 40 78 L58 40 Z" fill="#f2f1ec" stroke="#64748b" stroke-width="1.8"/>
                <path d="M46 68 L82 68 L86 78 Q88 83 82 84 L46 84 Q40 83 42 78 Z" fill="#5fb89c" opacity="0.58"/>
                <path d="M112 14 L126 14 L126 42 L148 80 Q151 86 144 88 L96 88 Q89 86 92 80 L112 42 Z" fill="#f7f6f2" stroke="#475569" stroke-width="1.8"/>
                <path d="M100 64 L138 64 L145 79 Q148 85 142 86 L98 86 Q92 85 95 79 Z" fill="#0f4c3a" opacity="0.34"/>
                <path d="M114 75 C110 62 122 50 132 48 C132 60 124 72 114 75 Z" fill="#0f4c3a" opacity="0.82"/>
                <circle cx="24" cy="82" r="4.5" fill="#0f4c3a"/><circle cx="37" cy="82" r="4.5" fill="#9a4a24"/><circle cx="50" cy="82" r="4.5" fill="#64748b"/>
              </svg>
            </div>
            <div class="v19-card-foot"><span>配方沙盒 · 应急 CAPA · 装置</span><span>进入 →</span></div>
          </button>

          <!-- 卡 5：八阶段产业转化 -->
          <button type="button" class="v19-bento-card" data-v16-go="translation">
            <div>
              <div class="v19-bento-card-head">
                <span class="v19-pill-tag v19-pill-mint">05 产业转化</span>
                <span class="text-xs font-bold" style="color:var(--craft-accent)">丹参标杆</span>
              </div>
              <h3 class="v19-bento-title">产业转化训练</h3>
              <p class="v19-bento-sub">定位 → 炮制 → 工艺 → 剂型 → 中试放大</p>
            </div>
            <div class="v19-card-stage">
              <div class="w-full space-y-2" aria-hidden="true">
                <div class="flex items-center justify-between text-[10px] font-bold" style="color:var(--craft-ink-2)"><span>小试研究</span><span>中试放大</span><span>注册转化</span></div>
                <div class="grid grid-cols-8 gap-1">
                  ${[1,2,3,4,5,6,7,8].map((n) => `<div class="h-7 rounded-md flex items-center justify-center text-[10px] font-bold tabular-nums" style="${n <= 5 ? 'background:#0f4c3a;color:#ffffff' : 'background:var(--craft-surface-soft);color:var(--craft-ink-2);border:1px solid var(--craft-line)'}">${n}</div>`).join('')}
                </div>
                <div class="text-[10px]" style="color:var(--craft-muted)">9 维综合工艺最优 · 偏差 CAPA · 转化报告</div>
              </div>
            </div>
            <div class="v19-card-foot"><span>4 大标杆 · ${c.topics} 题导入</span><span>进入 →</span></div>
          </button>

          <!-- 卡 6：交互式四谱工作站 -->
          <button type="button" class="v19-bento-card" data-v16-ext="v21_spectra">
            <div>
              <div class="v19-bento-card-head">
                <span class="v19-pill-tag v19-pill-amber">06 四谱解析</span>
                <span class="text-xs font-bold" style="color:var(--craft-seal)">归属训练</span>
              </div>
              <h3 class="v19-bento-title">交互式四谱分析</h3>
              <p class="v19-bento-sub">UV 诊断位移、IR、NMR 积分与 MS 裂解归属</p>
            </div>
            <div class="v19-card-stage">
              <svg viewBox="0 0 180 86" class="w-full h-20" aria-hidden="true">
                <line x1="12" y1="72" x2="168" y2="72" stroke="#cbd5e1" stroke-width="1.3"/>
                <path d="M14 72 L42 72 Q52 72 56 30 Q60 72 68 72 L94 72 Q102 72 108 16 Q114 72 122 72 L138 72 Q144 72 148 44 Q152 72 164 72" fill="none" stroke="#0f4c3a" stroke-width="2" stroke-linecap="round"/>
                <circle cx="108" cy="18" r="4.5" fill="#9a4a24"/>
                <rect x="116" y="8" width="44" height="16" rx="4" fill="#f7f6f2" stroke="#9a4a24" stroke-opacity="0.45"/>
                <text x="138" y="19" text-anchor="middle" font-size="8.5" fill="#9a4a24" font-weight="700">归属峰</text>
              </svg>
            </div>
            <div class="v19-card-foot"><span>缩放谱图 · 特征峰检视</span><span>启动 ↗</span></div>
          </button>

          <!-- 卡 7：六步实验工坊 -->
          <button type="button" class="v19-bento-card" data-v16-go="workflow" data-v16-step="1">
            <div>
              <div class="v19-bento-card-head">
                <span class="v19-pill-tag v19-pill-sky">07 规范工坊</span>
                <span class="text-xs font-bold" style="color:var(--craft-muted)">A4 报告</span>
              </div>
              <h3 class="v19-bento-title">六步实验工坊</h3>
              <p class="v19-bento-sub">选材 → 定题 → 原理 → 装置 → 数据 → 报告</p>
            </div>
            <div class="v19-card-stage">
              <div class="w-full grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold tabular-nums" aria-hidden="true">
                <div class="p-2 rounded-lg" style="background:var(--craft-surface-soft);color:var(--craft-ink-2);border:1px solid var(--craft-line)">01 选材</div>
                <div class="p-2 rounded-lg" style="background:var(--craft-surface-soft);color:var(--craft-ink-2);border:1px solid var(--craft-line)">02 工艺</div>
                <div class="p-2 rounded-lg" style="background:var(--craft-surface-soft);color:var(--craft-ink-2);border:1px solid var(--craft-line)">03 原理</div>
                <div class="p-2 rounded-lg" style="background:var(--craft-surface-soft);color:var(--craft-ink-2);border:1px solid var(--craft-line)">04 装置</div>
                <div class="p-2 rounded-lg" style="background:var(--craft-surface-soft);color:var(--craft-ink-2);border:1px solid var(--craft-line)">05 数据</div>
                <div class="p-2 rounded-lg" style="background:var(--craft-accent-soft);color:var(--craft-accent);border:1px solid rgba(15,76,58,0.22)">06 报告</div>
              </div>
            </div>
            <div class="v19-card-foot"><span>云草稿同步 · 长图 / Word</span><span>进入 →</span></div>
          </button>

          <!-- 卡 8：实验档案与图鉴 -->
          <button type="button" class="v19-bento-card" data-v16-ext="v24_gamification">
            <div>
              <div class="v19-bento-card-head">
                <span class="v19-pill-tag v19-pill-violet">08 实验档案</span>
                <span class="text-xs font-bold" style="color:var(--craft-muted)">三本图鉴</span>
              </div>
              <h3 class="v19-bento-title">实验成长与图鉴</h3>
              <p class="v19-bento-sub">记录已研习分子、药材与装置进度并导出档案</p>
            </div>
            <div class="v19-card-stage">
              <div class="w-full p-3 rounded-xl space-y-2" style="background:var(--craft-surface-soft);border:1px solid var(--craft-line)" aria-hidden="true">
                <div class="flex items-center justify-between text-[11px] font-bold" style="color:var(--craft-ink-2)"><span>研习记录进度</span><span style="color:var(--craft-accent)">三本图鉴</span></div>
                <div class="v19-mini-progress"><span style="width:62%;background:#0f4c3a"></span></div>
                <div class="flex gap-1.5 text-[10px] font-bold">
                  <span class="px-2 py-0.5 rounded-md" style="background:var(--craft-surface);color:var(--craft-ink-2);border:1px solid var(--craft-line)">分子</span>
                  <span class="px-2 py-0.5 rounded-md" style="background:var(--craft-surface);color:var(--craft-ink-2);border:1px solid var(--craft-line)">药材</span>
                  <span class="px-2 py-0.5 rounded-md" style="background:var(--craft-surface);color:var(--craft-ink-2);border:1px solid var(--craft-line)">装置</span>
                </div>
              </div>
            </div>
            <div class="v19-card-foot"><span>记录解锁 · JSON 导出</span><span>查看 ↗</span></div>
          </button>
        </section>

        <!-- 3. 六大学科知识库 & 实践资料汇编 8 册直达条（按需懒加载，不增加首屏负担） -->
        <section class="v19-bento-strip" aria-label="中药学六大学科知识库与实践汇编">
          <div class="v19-bento-strip-left">
            <span class="v19-bento-tag">${ICO_BOOK}<span>六大学科知识库与实践汇编</span></span>
            <button type="button" class="v19-bento-pill" data-kb-open="overview">六科总览 ↗</button>
            <button type="button" class="v19-bento-pill" data-kb-open="handbook">实践汇编</button>
            <button type="button" class="v19-bento-pill" data-kb-open="vol01">01 中药化学</button>
            <button type="button" class="v19-bento-pill" data-kb-open="vol02">02 中药制剂</button>
            <button type="button" class="v19-bento-pill" data-kb-open="vol03">03 制药工艺</button>
            <button type="button" class="v19-bento-pill" data-kb-open="vol04">04 分析化学</button>
            <button type="button" class="v19-bento-pill" data-kb-open="vol05">05 仪器分析</button>
            <button type="button" class="v19-bento-pill" data-kb-open="vol06">06 制剂分析</button>
          </div>
          <div class="v19-bento-strip-actions">
            <button type="button" class="v19-bento-pill" data-v16-ext="v29_explore" style="display:inline-flex;align-items:center;gap:5px">${ICO_GRAPH}<span>知识图谱探索 ↗</span></button>
            <button type="button" class="v19-bento-pill" data-kb-open="overview" style="color:var(--craft-accent);border-color:rgba(15,76,58,0.28)">全文检索 8 册 · 60 速查表 →</button>
          </div>
        </section>
      </div>`;

    const shell = homePage.querySelector('.v19-home-shell');
    renderSolarStrip(shell);
  } finally {
    isRenderingHome = false;
  }
}

function init() {
  document.body.classList.add('tcm-v19-guofeng');
  upgradeBrandIcon();
  renderBentoHome();

  const homePage = document.getElementById('v16HomePage');
  if (homePage && typeof MutationObserver !== 'undefined') {
    new MutationObserver(() => {
      if (!homePage.querySelector('.v19-home-shell')) {
        renderBentoHome();
      }
    }).observe(homePage, { childList: true });
  }
}

export const TCM_V19_GUOFENG = {
  version: '3.0.0-apple-bento',
  theme: 'frosted-bento-minimal',
  reapply: renderBentoHome,
  showStrip: () => {
    try { localStorage.removeItem(STORAGE_KEY_COLLAPSED); } catch (_) {}
    renderSolarStrip(document.querySelector('#v16HomePage .v19-home-shell'));
  }
};

if (typeof window !== 'undefined') {
  window.TCM_V19_GUOFENG = TCM_V19_GUOFENG;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

export default TCM_V19_GUOFENG;
