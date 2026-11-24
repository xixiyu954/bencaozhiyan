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
    homePage.innerHTML = `
      <div class="v19-home-shell">
        <!-- 1. 清透浅色 Hero 主视觉（左文案 + 右 3D 磨砂玻璃本草叶片与晶透分子） -->
        <section class="v19-hero">
          <div class="v19-hero-copy">
            <span class="v19-hero-eyebrow"><span class="v19-hero-eyebrow-dot"></span>2025 版中国药典对照 · 沉浸式教学科研工作台</span>
            <h2 class="v19-hero-title">本草智研</h2>
            <p class="v19-hero-sub">中药化学沉浸式实验平台</p>
            <p class="v19-hero-desc">
              通过 AI 与 3D 模拟，探索草本医学的分子奥秘
            </p>
            <div class="v19-hero-actions">
              <button type="button" class="v19-cta-primary" data-v16-go="bank">立即探索 <span>↗</span></button>
              <button type="button" class="v19-cta-secondary" data-v16-ext="v22_visual_suite">🕹️ 3D 虚拟实验室</button>
              <button type="button" class="v19-cta-secondary" data-v16-go="workflow" data-v16-step="1">进入实验工坊 →</button>
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
            <img src="${heroArtUrl}" alt="本草智研 3D 磨砂玻璃本草叶片与晶透分子模型" class="v19-hero-art" width="760" height="570" fetchpriority="high" />
            <span class="v19-hero-visual-hint">🧬 3D 分子 &amp; 粒子显色 ↗</span>
          </button>
        </section>

        <!-- 2. 四列磨砂玻璃 Bento 微插画卡片矩阵（第 1 排：四大旗舰体验） -->
        <section class="v19-bento-grid" aria-label="核心实验模块">
          <!-- 卡 1：3D 分子解析 -->
          <button type="button" class="v19-bento-card" data-v16-ext="v20_mol3d">
            <div>
              <div class="v19-bento-card-head">
                <span class="v19-pill-tag v19-pill-mint">3D 解析</span>
                <svg viewBox="0 0 36 18" class="w-9 h-4" aria-hidden="true">
                  <rect x="2" y="10" width="4" height="8" rx="2" fill="#10b981"/>
                  <rect x="9" y="5" width="4" height="13" rx="2" fill="#34d399"/>
                  <rect x="16" y="8" width="4" height="10" rx="2" fill="#0ea5e9"/>
                  <rect x="23" y="2" width="4" height="16" rx="2" fill="#f97316"/>
                  <rect x="30" y="6" width="4" height="12" rx="2" fill="#10b981"/>
                </svg>
              </div>
              <h3 class="v19-bento-title">3D 分子解析</h3>
              <p class="v19-bento-sub">6 大 PubChem 真实 3D 构象与官能团高亮</p>
            </div>
            <div class="v19-card-stage">
              <svg viewBox="0 0 180 100" class="w-40 h-24" aria-hidden="true">
                <ellipse cx="90" cy="82" rx="48" ry="11" fill="none" stroke="#94a3b8" stroke-width="1.4" stroke-dasharray="4 3"/>
                <line x1="90" y1="44" x2="54" y2="62" stroke="#64748b" stroke-width="4" stroke-linecap="round"/>
                <line x1="90" y1="44" x2="124" y2="28" stroke="#64748b" stroke-width="4" stroke-linecap="round"/>
                <line x1="90" y1="44" x2="118" y2="68" stroke="#64748b" stroke-width="4" stroke-linecap="round"/>
                <line x1="90" y1="44" x2="72" y2="20" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
                <circle cx="90" cy="44" r="14" fill="url(#v19MolC)"/>
                <circle cx="54" cy="62" r="10" fill="url(#v19MolG)"/>
                <circle cx="124" cy="28" r="10" fill="url(#v19MolO)"/>
                <circle cx="118" cy="68" r="8" fill="#cbd5e1"/>
                <circle cx="72" cy="20" r="7" fill="#94a3b8"/>
                <defs>
                  <radialGradient id="v19MolC" cx="35%" cy="30%"><stop offset="0%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#334155"/></radialGradient>
                  <radialGradient id="v19MolG" cx="35%" cy="30%"><stop offset="0%" stop-color="#6ee7b7"/><stop offset="100%" stop-color="#059669"/></radialGradient>
                  <radialGradient id="v19MolO" cx="35%" cy="30%"><stop offset="0%" stop-color="#fdba74"/><stop offset="100%" stop-color="#ea580c"/></radialGradient>
                </defs>
              </svg>
            </div>
            <div class="v19-card-foot"><span>丹参酮 · 黄芩苷 · 小檗碱等</span><span>打开 ↗</span></div>
          </button>

          <!-- 卡 2：AI 实验设计 -->
          <button type="button" class="v19-bento-card" data-v16-go="ai">
            <div>
              <div class="v19-bento-card-head">
                <span class="v19-pill-tag v19-pill-mint">智能编排</span>
                <span class="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white text-[11px] font-black shadow-sm">AI</span>
              </div>
              <h3 class="v19-bento-title">AI 实验设计</h3>
              <p class="v19-bento-sub">自然语言一键生成完整提取纯化路线</p>
            </div>
            <div class="v19-card-stage">
              <div class="v19-mini-ide" aria-hidden="true">
                <div class="v19-mini-ide-left">
                  <div class="v19-mini-ide-dots"><span style="background:#f87171"></span><span style="background:#fbbf24"></span><span style="background:#34d399"></span></div>
                  <div class="v19-mini-ide-bar" style="width:76%"></div>
                  <div class="v19-mini-ide-bar" style="width:58%"></div>
                  <div class="v19-mini-ide-bar" style="width:88%;background:rgba(52,211,153,0.55)"></div>
                  <div class="v19-mini-ide-bar" style="width:66%"></div>
                </div>
                <div class="v19-mini-ide-right">
                  <span class="v19-mini-chat-pill">✦ 工艺自动配置</span>
                  <div class="v19-mini-ide-bar" style="width:85%;background:#cbd5e1"></div>
                  <div class="v19-mini-ide-bar" style="width:64%;background:#94a3b8"></div>
                  <div class="v19-mini-ide-bar" style="width:72%;background:#cbd5e1"></div>
                </div>
              </div>
            </div>
            <div class="v19-card-foot"><span>方案编排 · 自编评审</span><span>进入 →</span></div>
          </button>

          <!-- 卡 3：智能题库 -->
          <button type="button" class="v19-bento-card" data-v16-go="bank">
            <div>
              <div class="v19-bento-card-head">
                <span class="v19-pill-tag v19-pill-coral">智能题库</span>
                <span class="text-xs font-extrabold text-slate-500">${c.topics} 项</span>
              </div>
              <h3 class="v19-bento-title">智能题库</h3>
              <p class="v19-bento-sub">按化学成分大类与药典标准即时检索</p>
            </div>
            <div class="v19-card-stage">
              <div class="v19-mini-checklist" aria-hidden="true">
                <div class="v19-mini-check-row"><span class="v19-mini-check-box bg-emerald-500 text-white">✓</span><span>黄芩 · 沸水杀酶保苷</span></div>
                <div class="v19-mini-check-row"><span class="v19-mini-check-box bg-emerald-100 text-emerald-700">✓</span><span>丹参 · 脂水双提工艺</span></div>
                <div class="v19-mini-check-row"><span class="v19-mini-check-box border border-slate-300 bg-white"></span><span class="text-slate-400">槐米 · 碱提酸沉精制</span></div>
                <div class="v19-mini-progress"><span style="width:74%"></span></div>
              </div>
            </div>
            <div class="v19-card-foot"><span>题库目录 · 小白速读</span><span>浏览 →</span></div>
          </button>

          <!-- 卡 4：DIY 虚拟实验室 -->
          <button type="button" class="v19-bento-card" data-v16-go="diy">
            <div>
              <div class="v19-bento-card-head">
                <span class="v19-pill-tag v19-pill-sky">虚拟实验</span>
                <span class="text-xs font-extrabold text-slate-500">${c.rigs} 装置</span>
              </div>
              <h3 class="v19-bento-title">DIY 虚拟实验室</h3>
              <p class="v19-bento-sub">配伍分层、流体仿真与 15 套装置沙盒</p>
            </div>
            <div class="v19-card-stage">
              <svg viewBox="0 0 180 100" class="w-44 h-24" aria-hidden="true">
                <path d="M58 18 L70 18 L70 40 L88 78 Q91 84 84 86 L44 86 Q37 84 40 78 L58 40 Z" fill="#ecfdf5" stroke="#94a3b8" stroke-width="2"/>
                <path d="M46 68 L82 68 L86 78 Q88 83 82 84 L46 84 Q40 83 42 78 Z" fill="#6ee7b7" opacity="0.7"/>
                <path d="M112 14 L126 14 L126 42 L148 80 Q151 86 144 88 L96 88 Q89 86 92 80 L112 42 Z" fill="#f0f9ff" stroke="#64748b" stroke-width="2"/>
                <path d="M100 64 L138 64 L145 79 Q148 85 142 86 L98 86 Q92 85 95 79 Z" fill="#34d399" opacity="0.55"/>
                <path d="M114 75 C110 62 122 50 132 48 C132 60 124 72 114 75 Z" fill="#10b981"/>
                <circle cx="24" cy="82" r="5" fill="#10b981"/><circle cx="38" cy="82" r="5" fill="#f97316"/><circle cx="52" cy="82" r="5" fill="#3b82f6"/>
              </svg>
            </div>
            <div class="v19-card-foot"><span>沙盒 · TLC · 流体/AR</span><span>进入 →</span></div>
          </button>

          <!-- 卡 5：八阶段产业转化 -->
          <button type="button" class="v19-bento-card" data-v16-go="translation">
            <div>
              <div class="v19-bento-card-head">
                <span class="v19-pill-tag v19-pill-mint">8 阶段主线</span>
                <span class="text-xs font-extrabold text-emerald-700">丹参标杆</span>
              </div>
              <h3 class="v19-bento-title">产业转化训练</h3>
              <p class="v19-bento-sub">定位 → 炮制 → 工艺 → 剂型 → 中试放大</p>
            </div>
            <div class="v19-card-stage">
              <div class="w-full space-y-2" aria-hidden="true">
                <div class="flex items-center justify-between text-[10px] font-bold text-emerald-800"><span>小试研究</span><span>中试放大</span><span>注册转化</span></div>
                <div class="grid grid-cols-8 gap-1">
                  ${[1,2,3,4,5,6,7,8].map((n) => `<div class="h-7 rounded-lg flex items-center justify-center text-[10px] font-extrabold ${n <= 5 ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'}">${n}</div>`).join('')}
                </div>
                <div class="text-[10px] text-slate-500">9 维综合工艺最优 · 偏差 CAPA · 转化报告</div>
              </div>
            </div>
            <div class="v19-card-foot"><span>4 大标杆 + 119 题导入</span><span>进入 →</span></div>
          </button>

          <!-- 卡 6：交互式四谱工作站 -->
          <button type="button" class="v19-bento-card" data-v16-ext="v21_spectra">
            <div>
              <div class="v19-bento-card-head">
                <span class="v19-pill-tag v19-pill-amber">四谱工作站</span>
                <span class="text-xs font-extrabold text-amber-700">猜峰挑战</span>
              </div>
              <h3 class="v19-bento-title">交互式四谱分析</h3>
              <p class="v19-bento-sub">UV / IR / ¹H-NMR / MS 缩放与峰归属</p>
            </div>
            <div class="v19-card-stage">
              <svg viewBox="0 0 180 86" class="w-full h-20" aria-hidden="true">
                <line x1="12" y1="72" x2="168" y2="72" stroke="#cbd5e1" stroke-width="1.5"/>
                <path d="M14 72 L42 72 Q52 72 56 30 Q60 72 68 72 L94 72 Q102 72 108 16 Q114 72 122 72 L138 72 Q144 72 148 44 Q152 72 164 72" fill="none" stroke="#10b981" stroke-width="2.4" stroke-linecap="round"/>
                <circle cx="108" cy="18" r="5" fill="#f97316"/>
                <rect x="116" y="8" width="44" height="16" rx="6" fill="#fff7ed" stroke="#fdba74"/>
                <text x="138" y="19" text-anchor="middle" font-size="8.5" fill="#c2410c" font-weight="800">归属峰</text>
              </svg>
            </div>
            <div class="v19-card-foot"><span>可拖拽缩放 · 互动猜峰</span><span>启动 ↗</span></div>
          </button>

          <!-- 卡 7：六步实验工坊 -->
          <button type="button" class="v19-bento-card" data-v16-go="workflow" data-v16-step="1">
            <div>
              <div class="v19-bento-card-head">
                <span class="v19-pill-tag v19-pill-sky">标准 6 步</span>
                <span class="text-xs font-extrabold text-slate-500">A4 报告</span>
              </div>
              <h3 class="v19-bento-title">六步实验工坊</h3>
              <p class="v19-bento-sub">选材 → 定题 → 原理 → 装置 → 数据 → 报告</p>
            </div>
            <div class="v19-card-stage">
              <div class="w-full grid grid-cols-3 gap-1.5 text-center text-[10px] font-extrabold" aria-hidden="true">
                <div class="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/70">01 选材</div>
                <div class="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/70">02 工艺</div>
                <div class="p-2 rounded-xl bg-teal-50 text-teal-800 border border-teal-200/70">03 原理</div>
                <div class="p-2 rounded-xl bg-sky-50 text-sky-800 border border-sky-200/70">04 装置</div>
                <div class="p-2 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200/70">05 数据</div>
                <div class="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/70">06 报告</div>
              </div>
            </div>
            <div class="v19-card-foot"><span>云草稿自动保存 · 长图/Word</span><span>进入 →</span></div>
          </button>

          <!-- 卡 8：段位成长与三本图鉴 -->
          <button type="button" class="v19-bento-card" data-v16-ext="v24_gamification">
            <div>
              <div class="v19-bento-card-head">
                <span class="v19-pill-tag v19-pill-violet">成长图鉴</span>
                <span class="text-xs font-extrabold text-violet-700">段位徽章</span>
              </div>
              <h3 class="v19-bento-title">段位与收集图鉴</h3>
              <p class="v19-bento-sub">药材学徒 → 提取师 → 工艺大师 → 宗师</p>
            </div>
            <div class="v19-card-stage">
              <div class="w-full p-3 rounded-2xl bg-[#f8fafc] border border-slate-200/70 space-y-2" aria-hidden="true">
                <div class="flex items-center justify-between text-[11px] font-extrabold text-slate-700"><span>🌱 探索成长进度</span><span class="text-emerald-600">三本图鉴</span></div>
                <div class="v19-mini-progress"><span style="width:62%;background:linear-gradient(90deg,#8b5cf6,#10b981)"></span></div>
                <div class="flex gap-1.5 text-[10px] font-bold">
                  <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">🧬 分子</span>
                  <span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">🌿 药材</span>
                  <span class="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">⚙️ 装置</span>
                </div>
              </div>
            </div>
            <div class="v19-card-foot"><span>徽章解锁 · JSON 档案导出</span><span>查看 ↗</span></div>
          </button>
        </section>

        <!-- 3. 六大学科知识库 & 实践资料汇编 8 册直达条（按需懒加载，不增加首屏负担） -->
        <section class="v19-bento-strip" aria-label="中药学六大学科知识库与实践汇编">
          <div class="v19-bento-strip-left">
            <span class="v19-bento-tag"><span class="v19-bento-tag-dot"></span>📚 六大学科知识库 &amp; 实践汇编</span>
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
            <button type="button" class="v19-bento-pill" data-kb-open="overview" style="border-color:rgba(16,185,129,0.45);color:#047857">全文检索 8 册 · 60 速查表 →</button>
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
