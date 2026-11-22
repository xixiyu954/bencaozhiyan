// =========================================================================
// 本草智研 v8.0 宽屏双栏实验室工作站 & 动态可视化驾驶舱 (lab-v8-studio.js)
// - 彻底解放宽屏空间：右侧常驻实时可视化驾驶舱（动态萃取反应器 + 五维工艺雷达图 + 环形仪表 + 快捷进度轴）
// - 独立分区顶栏同步：实验设计工坊 / 动态流程与装置库 / 研学资料库 清晰分区
// - 实时响应左侧参数滑块、药材切换与步骤切换，零 Token 消耗，支持深色护眼模式
// =========================================================================
(function () {
  'use strict';

  const CATEGORY_THEME = {
    '挥发油与萜类': { liquid: '#10b981', glow: 'rgba(16,185,129,0.35)', tint: '#34d399', label: '翡翠挥发油相' },
    '萜类内酯与环烯醚萜': { liquid: '#14b8a6', glow: 'rgba(20,184,166,0.35)', tint: '#5eead4', label: '青碧内酯相' },
    '黄酮': { liquid: '#f59e0b', glow: 'rgba(245,158,11,0.38)', tint: '#fcd34d', label: '琥珀黄酮相' },
    '生物碱': { liquid: '#eab308', glow: 'rgba(234,179,8,0.36)', tint: '#fde047', label: '金黄生物碱相' },
    '蒽醌与醌类': { liquid: '#ef4444', glow: 'rgba(239,68,68,0.35)', tint: '#fca5a5', label: '丹砂蒽醌相' },
    '香豆素与木脂素': { liquid: '#8b5cf6', glow: 'rgba(139,92,246,0.35)', tint: '#c4b5fd', label: '紫荧香豆素相' },
    '皂苷与三萜': { liquid: '#0ea5e9', glow: 'rgba(14,165,233,0.35)', tint: '#7dd3fc', label: '澄蓝皂苷相' },
    '多糖类': { liquid: '#06b6d4', glow: 'rgba(6,182,212,0.35)', tint: '#67e8f9', label: '玉露多糖相' },
    '苯丙素与有机酸': { liquid: '#10b981', glow: 'rgba(16,185,129,0.32)', tint: '#6ee7b7', label: '碧绿有机酸相' },
    '甾体与强心苷': { liquid: '#6366f1', glow: 'rgba(99,102,241,0.35)', tint: '#a5b4fc', label: '靛紫甾体相' },
    '氰苷类': { liquid: '#f97316', glow: 'rgba(249,115,22,0.35)', tint: '#fdba74', label: '暖橙氰苷相' }
  };

  const STEP_LIST = [
    { n: 1, title: '01 选材', desc: '锁定药材与活性成分' },
    { n: 2, title: '02 定题', desc: '工艺路线与放大核算' },
    { n: 3, title: '03 原理与方案', desc: '传质机理与四谱特征' },
    { n: 4, title: '04 装置与流程', desc: '动态仿真与MSDS安全' },
    { n: 5, title: '05 数据', desc: 'TLC调优与正交/标曲' },
    { n: 6, title: '06 报告', desc: 'A4报告与答辩自测' }
  ];

  function getTheme(category) {
    if (!category) return CATEGORY_THEME['挥发油与萜类'];
    for (const k of Object.keys(CATEGORY_THEME)) {
      if (category.includes(k) || k.includes(category)) return CATEGORY_THEME[k];
    }
    return CATEGORY_THEME['挥发油与萜类'];
  }

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function computeMetrics(topic, ws) {
    const cfg = (ws && ws.cfg) ? ws.cfg : (ws || {});
    const mass = Number(cfg.mass) || 100;
    const ratio = Number(cfg.ratio) || 10;
    const temp = Number(cfg.temp) || 75;
    const time = Number(cfg.time) || 60;
    const cycles = Number(cfg.cycles) || 2;
    const solvent = String(cfg.solventType || '70%乙醇');
    const prop = (topic && topic.prop) || 'thermo_stable';

    const totalSolvent = Math.round(mass * ratio * cycles);

    // 1. 提取效率 (0-100)
    const tempOpt = prop === 'thermo_sensitive' ? 50 : (prop === 'volatile' ? 98 : 80);
    const tempScore = clamp(100 - Math.abs(temp - tempOpt) * 1.15, 42, 98);
    const cycleBonus = cycles >= 2 ? 12 : 0;
    const timeScore = clamp(55 + Math.min(time, 150) * 0.28, 55, 96);
    const efficiency = Math.round(clamp(tempScore * 0.52 + timeScore * 0.38 + cycleBonus, 45, 98));

    // 2. 绿色安全度 (0-100)
    let green = 88;
    if (/纯化水|水/.test(solvent) && !/酸|碱/.test(solvent)) green = 98;
    else if (/乙醇|低共熔|NADES/.test(solvent)) green = 91;
    else if (/酸水|碱/.test(solvent)) green = 82;
    else if (/石油醚|乙酸乙酯/.test(solvent)) green = 68;
    else if (/氯仿|甲醇|苯/.test(solvent)) green = 46;

    // 3. 课时适配度 (本科 3~4h 黄金区间)
    const totalMin = time * cycles + 45;
    let scheduleFit = 94;
    if (totalMin > 240) scheduleFit = clamp(94 - (totalMin - 240) * 0.25, 48, 94);
    else if (totalMin < 75) scheduleFit = 84;
    scheduleFit = Math.round(scheduleFit);

    // 4. 溶剂经济性
    const economy = Math.round(clamp(100 - (ratio - 6) * 2.4 - (cycles - 1) * 6, 48, 96));

    // 5. 热敏与结构保护
    let stability = 92;
    if (prop === 'thermo_sensitive' && temp > 65) stability = clamp(92 - (temp - 65) * 1.4, 40, 92);
    else if (prop === 'volatile' && temp > 105) stability = 72;
    else if (temp > 95) stability = 82;
    stability = Math.round(stability);

    const overall = Math.round((efficiency * 0.28 + green * 0.24 + scheduleFit * 0.18 + economy * 0.14 + stability * 0.16));

    return {
      mass, ratio, temp, time, cycles, solvent, totalSolvent,
      efficiency, green, scheduleFit, economy, stability, overall
    };
  }

  function radarPolygonPoints(values, cx, cy, r) {
    return values.map((v, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / values.length;
      const dist = (clamp(v, 10, 100) / 100) * r;
      return `${(cx + Math.cos(angle) * dist).toFixed(1)},${(cy + Math.sin(angle) * dist).toFixed(1)}`;
    }).join(' ');
  }

  function ringDash(pct, radius) {
    const c = 2 * Math.PI * radius;
    const fill = (clamp(pct, 0, 100) / 100) * c;
    return `${fill.toFixed(1)} ${(c - fill).toFixed(1)}`;
  }

  function buildDockSkeleton() {
    const dock = document.getElementById('rightVisualDock');
    if (!dock || dock.dataset.inited === '1') return dock;
    dock.dataset.inited = '1';
    dock.innerHTML = `
      <div class="sticky top-[134px] space-y-4">
        <!-- 卡片 1：实时动态萃取反应器 -->
        <section class="studio-dock-card rounded-3xl overflow-hidden">
          <div class="px-4 py-3 bg-gradient-to-r from-[#052420] via-[#0a3a33] to-[#0f5c54] text-white flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0">
              <span class="ai-live-dot shrink-0"></span>
              <span class="text-xs font-extrabold tracking-wide truncate">实时化学萃取动态视窗</span>
            </div>
            <span id="dockPhaseTag" class="px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-bold text-emerald-200 shrink-0">翡翠挥发油相</span>
          </div>

          <div class="p-4 space-y-3">
            <div class="relative rounded-2xl bg-gradient-to-b from-[#071f1c] to-[#0d352f] border border-emerald-400/20 p-3 overflow-hidden">
              <div class="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-emerald-400/15 blur-2xl pointer-events-none"></div>
              <div class="flex items-center justify-between text-[10px] text-teal-200/90 font-mono mb-1">
                <span id="dockHerbMini" class="font-bold text-white truncate max-w-[170px]">薄荷 · 挥发油</span>
                <span id="dockTempBadge" class="px-1.5 py-0.5 rounded bg-emerald-500/25 text-emerald-200 font-bold tabular-nums">100 ℃</span>
              </div>

              <!-- 动态玻璃反应器 SVG -->
              <svg id="dockReactorSvg" viewBox="0 0 280 156" class="w-full h-[148px] block select-none" aria-label="实时化学萃取反应器动画">
                <defs>
                  <linearGradient id="dockFlaskGlass" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.24" />
                    <stop offset="50%" stop-color="#a7f3d0" stop-opacity="0.06" />
                    <stop offset="100%" stop-color="#ffffff" stop-opacity="0.18" />
                  </linearGradient>
                  <linearGradient id="dockLiquidGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop id="dockLiqTop" offset="0%" stop-color="#34d399" stop-opacity="0.88" />
                    <stop id="dockLiqBot" offset="100%" stop-color="#059669" stop-opacity="0.96" />
                  </linearGradient>
                  <clipPath id="dockBulbClip">
                    <circle cx="122" cy="100" r="40" />
                  </clipPath>
                </defs>

                <!-- 实验室网格刻度背景 -->
                <g stroke="rgba(167,243,208,0.08)" stroke-width="1">
                  <line x1="12" y1="36" x2="268" y2="36" />
                  <line x1="12" y1="74" x2="268" y2="74" />
                  <line x1="12" y1="112" x2="268" y2="112" />
                  <line x1="12" y1="146" x2="268" y2="146" />
                </g>

                <!-- 铁架台立柱与夹具 -->
                <rect x="34" y="16" width="5" height="130" rx="2.5" fill="rgba(148,163,184,0.45)" />
                <rect x="20" y="142" width="46" height="5" rx="2.5" fill="rgba(148,163,184,0.55)" />
                <rect x="39" y="50" width="72" height="4" rx="2" fill="rgba(203,213,225,0.45)" />

                <!-- 球形冷凝管与冷却水流 -->
                <rect x="114" y="14" width="16" height="44" rx="5" fill="url(#dockFlaskGlass)" stroke="rgba(209,250,229,0.5)" stroke-width="1.4" />
                <path d="M122 58 L122 18" stroke="#6ee7b7" stroke-width="2" stroke-dasharray="5 5" class="anim-flow" />
                <path d="M132 48 L156 48" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" />
                <path d="M132 24 L156 24" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" />
                <text x="160" y="51" fill="#7dd3fc" font-size="11.5" font-family="monospace">水进</text>
                <text x="160" y="27" fill="#fcd34d" font-size="11.5" font-family="monospace">水出</text>

                <!-- 圆底烧瓶与动态液面 -->
                <g clip-path="url(#dockBulbClip)">
                  <rect id="dockLiquidRect" x="78" y="92" width="88" height="54" fill="url(#dockLiquidGrad)" style="transition: y 0.45s ease, height 0.45s ease;" />
                  <ellipse id="dockMeniscus" cx="122" cy="92" rx="38" ry="4.5" fill="#d1fae5" fill-opacity="0.45" style="transition: cy 0.45s ease;" />
                  <!-- 沸腾气泡 -->
                  <circle id="dockBub1" cx="106" cy="120" r="3" fill="#ecfdf5" fill-opacity="0.8" class="anim-bubble-1" />
                  <circle id="dockBub2" cx="122" cy="126" r="3.8" fill="#ecfdf5" fill-opacity="0.75" class="anim-bubble-2" />
                  <circle id="dockBub3" cx="136" cy="118" r="2.6" fill="#ecfdf5" fill-opacity="0.85" class="anim-bubble-3" />
                  <circle cx="115" cy="112" r="2" fill="#ffffff" fill-opacity="0.65" class="anim-bubble-3" />
                </g>
                <circle cx="122" cy="100" r="40" fill="url(#dockFlaskGlass)" stroke="rgba(226,232,240,0.68)" stroke-width="1.8" />
                <!-- 高光弧线 -->
                <path d="M96 84 A32 32 0 0 1 112 68" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="2.2" stroke-linecap="round" />

                <!-- 电热套底座 + 加热脉冲 -->
                <path d="M84 128 Q122 152 160 128 L154 146 L90 146 Z" fill="#1e293b" stroke="rgba(251,191,36,0.55)" stroke-width="1.2" />
                <ellipse id="dockHeatGlow" cx="122" cy="138" rx="22" ry="3.5" fill="#f59e0b" fill-opacity="0.75" class="dock-heat-pulse" />

                <!-- 右侧温度计动态水银柱 -->
                <rect x="218" y="24" width="12" height="100" rx="6" fill="rgba(15,23,42,0.75)" stroke="rgba(203,213,225,0.45)" stroke-width="1.2" />
                <rect id="dockThermBar" x="221" y="54" width="6" height="68" rx="3" fill="#f59e0b" style="transition: y 0.4s ease, height 0.4s ease, fill 0.4s ease;" />
                <circle id="dockThermBulb" cx="224" cy="126" r="8" fill="#f59e0b" stroke="rgba(255,255,255,0.4)" stroke-width="1" />
                <text id="dockThermText" x="242" y="76" fill="#fde68a" font-size="12.5" font-weight="800" font-family="monospace">100℃</text>
                <text x="242" y="92" fill="#94a3b8" font-size="11.5">实时温控</text>
              </svg>

              <div class="mt-2 grid grid-cols-3 gap-1.5 text-center">
                <div class="rounded-xl bg-white/8 border border-white/10 py-1.5 px-1">
                  <div class="text-[9px] text-teal-200/75">投料/料液比</div>
                  <div id="dockStatRatio" class="text-[11px] font-extrabold text-white tabular-nums">100g · 1:10</div>
                </div>
                <div class="rounded-xl bg-white/8 border border-white/10 py-1.5 px-1">
                  <div class="text-[9px] text-teal-200/75">溶剂体系</div>
                  <div id="dockStatSolvent" class="text-[11px] font-extrabold text-emerald-300 truncate">纯化水</div>
                </div>
                <div class="rounded-xl bg-white/8 border border-white/10 py-1.5 px-1">
                  <div class="text-[9px] text-teal-200/75">总耗液量</div>
                  <div id="dockStatTotal" class="text-[11px] font-extrabold text-amber-300 tabular-nums">1000 mL</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 卡片 2：五维工艺雷达图 + 环形仪表盘 -->
        <section class="studio-dock-card rounded-3xl p-4 space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs font-extrabold text-slate-900">五维工艺健康度雷达</div>
              <div class="text-[10px] text-slate-500">随左侧 DIY 滑块动态重算</div>
            </div>
            <span id="dockOverallScore" class="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold tabular-nums">综合 90 分</span>
          </div>

          <div class="flex items-center justify-center">
            <svg viewBox="0 0 240 184" class="w-full max-w-[248px] h-[176px]" aria-label="五维工艺特征雷达图">
              <!-- 同心五边形网格 -->
              <polygon points="120,26 183,72 159,146 81,146 57,72" fill="none" stroke="rgba(15,92,84,0.14)" stroke-width="1" />
              <polygon points="120,48 162,79 146,128 94,128 78,79" fill="none" stroke="rgba(15,92,84,0.10)" stroke-width="1" />
              <polygon points="120,70 141,85 133,110 107,110 99,85" fill="none" stroke="rgba(15,92,84,0.08)" stroke-width="1" />
              <g stroke="rgba(15,92,84,0.12)" stroke-width="1">
                <line x1="120" y1="92" x2="120" y2="26" />
                <line x1="120" y1="92" x2="183" y2="72" />
                <line x1="120" y1="92" x2="159" y2="146" />
                <line x1="120" y1="92" x2="81" y2="146" />
                <line x1="120" y1="92" x2="57" y2="72" />
              </g>
              <!-- 动态数据多边形 -->
              <polygon id="dockRadarPoly" points="120,34 176,74 152,138 88,136 65,75" fill="rgba(16,185,129,0.22)" stroke="#0f5c54" stroke-width="2.2" stroke-linejoin="round" style="transition: all 0.45s cubic-bezier(0.16,1,0.3,1);" />
              <!-- 轴标签 -->
              <text x="120" y="16" text-anchor="middle" fill="#0f5c54" font-size="11.5" font-weight="700">提取效率</text>
              <text x="192" y="75" text-anchor="start" fill="#0f5c54" font-size="11.5" font-weight="700">绿色安全</text>
              <text x="164" y="163" text-anchor="middle" fill="#0f5c54" font-size="11.5" font-weight="700">课时适配</text>
              <text x="76" y="163" text-anchor="middle" fill="#0f5c54" font-size="11.5" font-weight="700">溶剂经济</text>
              <text x="48" y="75" text-anchor="end" fill="#0f5c54" font-size="11.5" font-weight="700">热敏保护</text>
            </svg>
          </div>

          <!-- 三联环形仪表盘 -->
          <div class="grid grid-cols-3 gap-2 pt-1">
            <div class="rounded-2xl bg-slate-50/80 border border-slate-200/60 p-2.5 flex flex-col items-center justify-center text-center shadow-xs">
              <div class="relative w-11 h-11 flex items-center justify-center">
                <svg viewBox="0 0 44 44" class="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="#e2e8f0" stroke-width="3.2" />
                  <circle id="dockRingEff" cx="22" cy="22" r="18" fill="none" stroke="#10b981" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="99.5 13.6" style="transition: stroke-dasharray 0.45s ease;" />
                </svg>
                <span id="dockValEff" class="relative z-10 text-[11px] font-black text-slate-800 tabular-nums leading-none tracking-tight">88%</span>
              </div>
              <div class="text-[10px] font-bold text-slate-500 mt-1.5 truncate">提取效率</div>
            </div>
            <div class="rounded-2xl bg-slate-50/80 border border-slate-200/60 p-2.5 flex flex-col items-center justify-center text-center shadow-xs">
              <div class="relative w-11 h-11 flex items-center justify-center">
                <svg viewBox="0 0 44 44" class="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="#e2e8f0" stroke-width="3.2" />
                  <circle id="dockRingGreen" cx="22" cy="22" r="18" fill="none" stroke="#0ea5e9" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="104.1 9.0" style="transition: stroke-dasharray 0.45s ease;" />
                </svg>
                <span id="dockValGreen" class="relative z-10 text-[11px] font-black text-slate-800 tabular-nums leading-none tracking-tight">92%</span>
              </div>
              <div class="text-[10px] font-bold text-slate-500 mt-1.5 truncate">绿色环保</div>
            </div>
            <div class="rounded-2xl bg-slate-50/80 border border-slate-200/60 p-2.5 flex flex-col items-center justify-center text-center shadow-xs">
              <div class="relative w-11 h-11 flex items-center justify-center">
                <svg viewBox="0 0 44 44" class="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="#e2e8f0" stroke-width="3.2" />
                  <circle id="dockRingFit" cx="22" cy="22" r="18" fill="none" stroke="#d99b26" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="101.8 11.3" style="transition: stroke-dasharray 0.45s ease;" />
                </svg>
                <span id="dockValFit" class="relative z-10 text-[11px] font-black text-slate-800 tabular-nums leading-none tracking-tight">90%</span>
              </div>
              <div class="text-[10px] font-bold text-slate-500 mt-1.5 truncate">课时匹配</div>
            </div>
          </div>
        </section>

        <!-- 卡片 3：实验进度速览与快捷跳转 -->
        <section class="studio-dock-card rounded-3xl p-4 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold text-slate-900">实验流程速览</span>
            <span id="dockStepProgressText" class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">第 1 / 6 步</span>
          </div>
          <div id="dockMiniTimeline" class="space-y-1.5">
            ${STEP_LIST.map(s => `
              <button type="button" data-dock-step="${s.n}" class="dock-step-row w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-left transition">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="dock-step-dot w-5 h-5 rounded-full text-[10px] font-extrabold flex items-center justify-center shrink-0">${s.n}</span>
                  <div class="min-w-0">
                    <div class="text-[11px] font-bold truncate">${s.title}</div>
                  </div>
                </div>
                <span class="text-[10px] opacity-65 truncate max-w-[115px]">${s.desc}</span>
              </button>
            `).join('')}
          </div>
          <div class="grid grid-cols-2 gap-2 pt-1">
            <button type="button" id="dockBtnGoHub" class="py-2 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[11px] font-extrabold transition">⚙️ 13套装置库</button>
            <button type="button" id="dockBtnCompare" class="py-2 px-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-[#0a3630] text-[11px] font-extrabold transition">⚖️ 双课题对比</button>
          </div>
        </section>
      </div>
    `;

    // 绑定快捷跳转事件
    dock.querySelectorAll('[data-dock-step]').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetBtn = document.querySelector(`#wizardNav [data-wstep="${btn.dataset.dockStep}"]`);
        if (targetBtn) targetBtn.click();
      });
    });
    const goHub = document.getElementById('dockBtnGoHub');
    if (goHub) goHub.addEventListener('click', () => {
      const hubBtn = document.getElementById('btnOpenApparatusHub');
      if (hubBtn) hubBtn.click();
    });
    const cmp = document.getElementById('dockBtnCompare');
    if (cmp) cmp.addEventListener('click', () => {
      const topCmp = document.getElementById('btnOpenCompareTop');
      if (topCmp) topCmp.click();
    });
    return dock;
  }

  function syncTopZones(step) {
    const isHub = step === 'hub';
    const isDiy = step === 'diy';
    const isMission = step === 'mission';
    const zoneWf = document.getElementById('zoneTabWorkflow');
    const zoneDiy = document.getElementById('btnOpenDiyStudio');
    const zoneMis = document.getElementById('btnOpenMissionOs');
    const zoneHub = document.getElementById('btnOpenApparatusHub');
    const stepperStrip = document.getElementById('stepperZoneBar');

    if (zoneWf) zoneWf.classList.toggle('active', !isHub && !isDiy && !isMission);
    if (zoneDiy) zoneDiy.classList.toggle('active', isDiy);
    if (zoneMis) zoneMis.classList.toggle('active', isMission);
    if (zoneHub) zoneHub.classList.toggle('active', isHub);
    if (stepperStrip) stepperStrip.classList.toggle('hidden', isHub || isDiy || isMission);

    // 同步连接线的进度高亮
    const numStep = isHub ? 6 : Number(step) || 1;
    document.querySelectorAll('#wizardNav .stepper-conn').forEach((conn, idx) => {
      conn.classList.toggle('filled', idx + 1 < numStep);
    });
  }

  function syncVisualDock(topic, ws, stats, step) {
    buildDockSkeleton();
    syncTopZones(step);
    renderWelcomePortalAndResume(step);

    const m = computeMetrics(topic, ws);
    const theme = getTheme(topic && topic.category);

    const el = id => document.getElementById(id);
    if (el('dockPhaseTag')) el('dockPhaseTag').textContent = theme.label;
    if (el('dockHerbMini')) el('dockHerbMini').textContent = topic ? `${topic.herb} · ${topic.comp}` : '薄荷 · 挥发油';
    if (el('dockTempBadge')) el('dockTempBadge').textContent = `${m.temp} ℃`;
    if (el('dockStatRatio')) el('dockStatRatio').textContent = `${m.mass}g · 1:${m.ratio}`;
    if (el('dockStatSolvent')) el('dockStatSolvent').textContent = m.solvent;
    if (el('dockStatTotal')) el('dockStatTotal').textContent = `${m.totalSolvent} mL`;

    // 液面颜色与高度
    if (el('dockLiqTop')) el('dockLiqTop').setAttribute('stop-color', theme.tint);
    if (el('dockLiqBot')) el('dockLiqBot').setAttribute('stop-color', theme.liquid);
    const fillRatio = clamp((m.ratio - 4) / 16, 0.15, 0.92);
    const yTop = Math.round(122 - fillRatio * 42);
    if (el('dockLiquidRect')) {
      el('dockLiquidRect').setAttribute('y', String(yTop));
      el('dockLiquidRect').setAttribute('height', String(146 - yTop));
    }
    if (el('dockMeniscus')) el('dockMeniscus').setAttribute('cy', String(yTop));

    // 温度计水银柱与气泡速率
    const tempPct = clamp((m.temp - 15) / 105, 0.08, 0.96);
    const thermH = Math.round(tempPct * 86);
    const thermY = 122 - thermH;
    const thermColor = m.temp >= 85 ? '#f97316' : (m.temp >= 55 ? '#f59e0b' : '#10b981');
    if (el('dockThermBar')) {
      el('dockThermBar').setAttribute('y', String(thermY));
      el('dockThermBar').setAttribute('height', String(thermH));
      el('dockThermBar').setAttribute('fill', thermColor);
    }
    if (el('dockThermBulb')) el('dockThermBulb').setAttribute('fill', thermColor);
    if (el('dockThermText')) el('dockThermText').textContent = `${m.temp}℃`;

    const dur1 = Math.max(0.75, 2.5 - (m.temp / 120) * 1.5).toFixed(2) + 's';
    const dur2 = Math.max(0.95, 2.9 - (m.temp / 120) * 1.6).toFixed(2) + 's';
    if (el('dockBub1')) el('dockBub1').style.animationDuration = dur1;
    if (el('dockBub2')) el('dockBub2').style.animationDuration = dur2;

    // 五维雷达图与环形仪表
    const radarPts = radarPolygonPoints([m.efficiency, m.green, m.scheduleFit, m.economy, m.stability], 120, 92, 66);
    if (el('dockRadarPoly')) {
      el('dockRadarPoly').setAttribute('points', radarPts);
      el('dockRadarPoly').setAttribute('fill', theme.glow);
      el('dockRadarPoly').setAttribute('stroke', theme.liquid);
    }
    if (el('dockOverallScore')) el('dockOverallScore').textContent = `综合 ${m.overall} 分`;
    if (el('dockRingEff')) el('dockRingEff').setAttribute('stroke-dasharray', ringDash(m.efficiency, 18));
    if (el('dockRingGreen')) el('dockRingGreen').setAttribute('stroke-dasharray', ringDash(m.green, 18));
    if (el('dockRingFit')) el('dockRingFit').setAttribute('stroke-dasharray', ringDash(m.scheduleFit, 18));
    if (el('dockValEff')) el('dockValEff').textContent = `${m.efficiency}%`;
    if (el('dockValGreen')) el('dockValGreen').textContent = `${m.green}%`;
    if (el('dockValFit')) el('dockValFit').textContent = `${m.scheduleFit}%`;

    // 步骤进度条同步
    const isHub = step === 'hub';
    const curStep = isHub ? 0 : Number(step) || 1;
    if (el('dockStepProgressText')) {
      el('dockStepProgressText').textContent = isHub ? '装置总览模式' : `第 ${curStep} / 6 步`;
    }
    document.querySelectorAll('#dockMiniTimeline .dock-step-row').forEach(row => {
      const n = Number(row.dataset.dockStep);
      const dot = row.querySelector('.dock-step-dot');
      row.classList.remove('active', 'done');
      if (!isHub && n === curStep) {
        row.classList.add('active');
        if (dot) dot.textContent = String(n);
      } else if (!isHub && n < curStep) {
        row.classList.add('done');
        if (dot) dot.textContent = '✓';
      } else {
        if (dot) dot.textContent = String(n);
      }
    });
  }

  function bindStudioControls() {
    // 顶部「实验设计工坊」独立分区按钮
    const zoneWf = document.getElementById('zoneTabWorkflow');
    if (zoneWf && !zoneWf.dataset.bound) {
      zoneWf.dataset.bound = '1';
      zoneWf.addEventListener('click', () => {
        const backBtn = document.getElementById('btnBackToWorkflow');
        const inHub = document.getElementById('wpanel-hub') && !document.getElementById('wpanel-hub').classList.contains('hidden');
        const inDiy = document.getElementById('wpanel-diy') && !document.getElementById('wpanel-diy').classList.contains('hidden');
        const inMis = document.getElementById('wpanel-mission') && !document.getElementById('wpanel-mission').classList.contains('hidden');
        if (backBtn && (inHub || inDiy || inMis)) {
          backBtn.click();
        } else if (inHub || inDiy || inMis) {
          const step1 = document.querySelector('#wizardNav [data-wstep="1"]');
          if (step1) step1.click();
        }
      });
    }

    // 右侧驾驶舱折叠/展开开关
    const toggleDockBtn = document.getElementById('btnToggleVisualDock');
    if (toggleDockBtn && !toggleDockBtn.dataset.bound) {
      toggleDockBtn.dataset.bound = '1';
      if (localStorage.getItem('tcm_v8_dock_hidden') === '1') {
        document.body.classList.add('dock-collapsed');
      }
      toggleDockBtn.addEventListener('click', () => {
        document.body.classList.toggle('dock-collapsed');
        const collapsed = document.body.classList.contains('dock-collapsed');
        localStorage.setItem('tcm_v8_dock_hidden', collapsed ? '1' : '0');
        toggleDockBtn.title = collapsed ? '展开右侧动态可视化驾驶舱' : '收起右侧动态可视化驾驶舱';
      });
    }
  }



  // ==================== 首页四大场景快捷门户 & 上次进度可选续接条 ====================
  function renderWelcomePortalAndResume(step) {
    // 1. 可选「续接上次进度」提示条（仅在检测到上次停在 2~6 步或装置库时轻轻展示，可一键忽略）
    const mainCol = document.getElementById('studioMainCol');
    if (mainCol && window.TCM_RESUME_BRIDGE) {
      const info = window.TCM_RESUME_BRIDGE.getResumeInfo();
      let bar = document.getElementById('resumeProgressBanner');
      if (info && step === 1) {
        if (!bar) {
          bar = document.createElement('div');
          bar.id = 'resumeProgressBanner';
          bar.className = 'no-print rounded-2xl bg-gradient-to-r from-amber-50 via-emerald-50/70 to-white border border-amber-200/90 px-4 py-3 flex flex-wrap items-center justify-between gap-2.5 shadow-xs panel-anim';
          mainCol.insertAdjacentElement('afterbegin', bar);
        }
        bar.innerHTML = `
          <div class="flex items-center gap-2 text-xs text-slate-800">
            <span class="px-2 py-0.5 rounded-full bg-amber-400/25 text-amber-900 font-extrabold">上次进度</span>
            <span>检测到上次曾停留在 <strong class="text-[#0a3630]">${info.herb ? info.herb + ' · ' : ''}${info.label}</strong>，是否继续？</span>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" id="btnResumeLastStep" class="px-3 py-1 rounded-xl bg-[#0a3630] hover:bg-[#062420] text-white text-xs font-extrabold transition">继续上次进度 →</button>
            <button type="button" id="btnDismissResume" class="px-2 py-1 rounded-lg text-slate-500 hover:text-slate-800 text-xs font-bold" title="留在首页">留在首页 ×</button>
          </div>
        `;
        const btnGo = bar.querySelector('#btnResumeLastStep');
        const btnDis = bar.querySelector('#btnDismissResume');
        if (btnGo) btnGo.onclick = () => { bar.remove(); window.TCM_RESUME_BRIDGE.resumeNow(); };
        if (btnDis) btnDis.onclick = () => { bar.remove(); window.TCM_RESUME_BRIDGE.dismiss(); };
      } else if (bar) {
        bar.remove();
      }
    }

    // 2. 首页（第 1 步）四大场景快捷入口门户卡，让新访客 3 秒看懂全站结构
    const p1 = document.getElementById('wpanel-1');
    if (p1 && step === 1) {
      let hero = document.getElementById('welcomePortalHero');
      if (!hero) {
        hero = document.createElement('section');
        hero.id = 'welcomePortalHero';
        hero.className = 'no-print lab-card rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#062420] via-[#0a3832] to-[#0f5c54] text-white space-y-4 overflow-hidden relative';
        hero.innerHTML = `
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="space-y-1">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/12 border border-white/15 text-emerald-200 text-xs font-bold">
                <span>🌿 中药化学一站式智能实验设计平台</span>
              </div>
              <h2 class="text-lg sm:text-xl font-extrabold tracking-tight text-white">从选材定题、工艺仿真到 A4 规范报告，3 步轻松完成实验设计</h2>
            </div>
            <div class="flex flex-wrap items-center gap-1.5 text-xs text-teal-100/90">
              <span class="px-2.5 py-1 rounded-xl bg-white/10">① 选药材 / 提需求</span>
              <span class="text-emerald-300">→</span>
              <span class="px-2.5 py-1 rounded-xl bg-white/10">② 调参数 / 搭装置</span>
              <span class="text-emerald-300">→</span>
              <span class="px-2.5 py-1 rounded-xl bg-white/10">③ 算数据 / 出报告</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <button type="button" id="portalGoTopics" class="text-left p-3.5 rounded-2xl bg-white/10 hover:bg-white/18 border border-white/15 transition group">
              <div class="flex items-center justify-between"><span class="text-xl">🌿</span><span class="text-xs text-emerald-300 font-bold group-hover:translate-x-0.5 transition">去选材 →</span></div>
              <div class="text-sm font-extrabold text-white mt-2">117 项经典/创新题库</div>
              <div class="text-xs text-teal-100/80 mt-0.5">覆盖高校高频单味药、名方复方与中西医结合课题</div>
            </button>
            <button type="button" id="portalGoAi" class="text-left p-3.5 rounded-2xl bg-white/10 hover:bg-white/18 border border-white/15 transition group">
              <div class="flex items-center justify-between"><span class="text-xl">✨</span><span class="text-xs text-amber-300 font-bold group-hover:translate-x-0.5 transition">去输入 →</span></div>
              <div class="text-sm font-extrabold text-white mt-2">智能助手一键编排</div>
              <div class="text-xs text-teal-100/80 mt-0.5">一句话描述想法，自动生成全流程工艺与参数单</div>
            </button>
            <button type="button" id="portalGoUserPlan" class="text-left p-3.5 rounded-2xl bg-amber-400/18 hover:bg-amber-400/28 border border-amber-300/35 transition group">
              <div class="flex items-center justify-between"><span class="text-xl">📋</span><span class="text-xs text-amber-200 font-bold group-hover:translate-x-0.5 transition">去演算 →</span></div>
              <div class="text-sm font-extrabold text-white mt-2">提交已有方案演算</div>
              <div class="text-xs text-amber-100/90 mt-0.5">递交自定方案全流程推演，并永久收录为案例</div>
            </button>
            <button type="button" id="portalGoSandbox" class="text-left p-3.5 rounded-2xl bg-white/10 hover:bg-white/18 border border-white/15 transition group">
              <div class="flex items-center justify-between"><span class="text-xl">🛠️</span><span class="text-xs text-emerald-300 font-bold group-hover:translate-x-0.5 transition">去搭建 →</span></div>
              <div class="text-sm font-extrabold text-white mt-2">15 套装置与自由沙盒</div>
              <div class="text-xs text-teal-100/80 mt-0.5">14 种器皿自由组装，实时分析热安全与可行性</div>
            </button>
          </div>
        `;
        p1.insertAdjacentElement('afterbegin', hero);

        hero.querySelector('#portalGoTopics').addEventListener('click', () => {
          const grid = document.getElementById('step1FeaturedGrid') || document.getElementById('step1Search');
          if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        hero.querySelector('#portalGoAi').addEventListener('click', () => {
          const inp = document.getElementById('qwenPromptInput');
          if (inp) { inp.scrollIntoView({ behavior: 'smooth', block: 'center' }); inp.focus(); }
        });
        hero.querySelector('#portalGoUserPlan').addEventListener('click', () => {
          const btn = document.getElementById('btnOpenUserPlanModal');
          if (btn) btn.click();
        });
        hero.querySelector('#portalGoSandbox').addEventListener('click', () => {
          const hub = document.getElementById('btnOpenApparatusHub');
          if (hub) hub.click();
        });
      }
    }
  }

  // 字号舒适度切换与返回顶部浮球
  function bindUxComfortControls() {
    const scales = [
      { id: 'normal', label: 'Aa 标准' },
      { id: 'large', label: 'Aa 大字' },
      { id: 'xlarge', label: 'Aa 超大' }
    ];
    const saved = localStorage.getItem('tcm_font_scale') || 'normal';
    let idx = Math.max(0, scales.findIndex(s => s.id === saved));
    const applyScale = () => {
      const cur = scales[idx];
      if (cur.id === 'normal') document.documentElement.removeAttribute('data-font-scale');
      else document.documentElement.setAttribute('data-font-scale', cur.id);
      localStorage.setItem('tcm_font_scale', cur.id);
      const btn = document.getElementById('btnFontScale');
      if (btn) btn.textContent = cur.label;
    };
    applyScale();
    const fontBtn = document.getElementById('btnFontScale');
    if (fontBtn && !fontBtn.dataset.bound) {
      fontBtn.dataset.bound = '1';
      fontBtn.addEventListener('click', () => {
        idx = (idx + 1) % scales.length;
        applyScale();
      });
    }

    const fab = document.getElementById('quickAssistFab');
    const topBtn = document.getElementById('btnFabScrollTop');
    if (fab && !fab.dataset.bound) {
      fab.dataset.bound = '1';
      window.addEventListener('scroll', () => {
        fab.classList.toggle('hidden', window.scrollY < 320);
      }, { passive: true });
      if (topBtn) topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
  }

  window.TCM_STUDIO_V8 = {
    sync: syncVisualDock,
    init: function () {
      buildDockSkeleton();
      bindStudioControls();
      bindUxComfortControls();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.TCM_STUDIO_V8.init());
  } else {
    window.TCM_STUDIO_V8.init();
  }
})();
