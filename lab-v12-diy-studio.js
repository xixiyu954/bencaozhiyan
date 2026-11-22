// =========================================================================
// 本草智研 · DIY 创意实验室独立板块 (lab-v12-diy-studio.js)
// 1. 复方配伍 DIY 模拟器（自由选 2~5 味药材与克重，实时推演酸碱沉淀/皂苷增溶/挥发油后下互作 + 动态网络图 + 一键入库）
// 2. 混合溶剂极性调配与分层/混溶实时试管模拟（Snyder 混合极性 P'、沸点、绿色评级与上下相密度判定）
// 3. 虚拟 TLC 薄层色谱三光源（日光 / 254nm / 365nm）实时显色实验台
// 4. 权威中医药与化学开源数据库一键联动台（药典在线 / TCMSP / HERB / 上海有机所 / iLab-X / PubChem）
// =========================================================================
(function () {
  'use strict';

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }

  // 1. 复方 DIY 药材库
  const FORMULA_HERBS = [
    { id: 'huanglian', name: '黄连', comp: '小檗碱', role: '碱', trait: 'alkaloid', color: '#eab308', grams: 15 },
    { id: 'huangqin', name: '黄芩', comp: '黄芩苷', role: '酸', trait: 'acid_flav', color: '#f59e0b', grams: 15 },
    { id: 'huangbai', name: '黄柏', comp: '小檗碱/巴马汀', role: '碱', trait: 'alkaloid', color: '#ca8a04', grams: 12 },
    { id: 'zhizi', name: '栀子', comp: '栀子苷', role: '苷', trait: 'iridoid', color: '#14b8a6', grams: 15 },
    { id: 'gancao', name: '甘草', comp: '甘草酸/甘草苷', role: '皂苷', trait: 'saponin', color: '#0ea5e9', grams: 10 },
    { id: 'danggui', name: '当归', comp: '藁本内酯/阿魏酸', role: '油+酸', trait: 'volatile', color: '#10b981', grams: 15 },
    { id: 'chuanxiong', name: '川芎', comp: '川芎嗪/阿魏酸', role: '碱+酸', trait: 'volatile', color: '#059669', grams: 12 },
    { id: 'bohe', name: '薄荷', comp: '薄荷脑挥发油', role: '挥发油', trait: 'volatile', color: '#34d399', grams: 10 },
    { id: 'jinyinhua', name: '金银花', comp: '绿原酸', role: '酚酸', trait: 'thermo', color: '#22c55e', grams: 15 },
    { id: 'lianqiao', name: '连翘', comp: '连翘苷/酯苷A', role: '木脂素', trait: 'thermo', color: '#8b5cf6', grams: 15 },
    { id: 'huangqi', name: '黄芪', comp: '黄芪甲苷/多糖', role: '皂苷', trait: 'saponin', color: '#06b6d4', grams: 20 },
    { id: 'danshen', name: '丹参', comp: '丹参酮ⅡA/丹酚酸B', role: '醌+酸', trait: 'lipo', color: '#ef4444', grams: 15 },
    { id: 'dahuang', name: '大黄', comp: '大黄素/番泻苷', role: '蒽醌', trait: 'lipo', color: '#dc2626', grams: 10 },
    { id: 'jianghuang', name: '姜黄', comp: '姜黄素', role: '亲脂', trait: 'lipo', color: '#f97316', grams: 12 }
  ];

  // 2. 常用实验室溶剂物性库 (Snyder 极性 P', 沸点, 密度, 水溶性, 绿色等级)
  const SOLVENTS = [
    { id: 'water', name: '纯化水', p: 10.2, bp: 100, density: 1.00, miscWater: true, green: '绿色首选', greenCls: 'bg-emerald-100 text-emerald-800', color: '#38bdf8' },
    { id: 'etoh', name: '无水乙醇', p: 5.2, bp: 78.3, density: 0.79, miscWater: true, green: '绿色推荐', greenCls: 'bg-emerald-100 text-emerald-800', color: '#34d399' },
    { id: 'meoh', name: '甲醇', p: 5.1, bp: 64.7, density: 0.79, miscWater: true, green: '注意通风', greenCls: 'bg-amber-100 text-amber-800', color: '#a78bfa' },
    { id: 'etoac', name: '乙酸乙酯', p: 4.4, bp: 77.1, density: 0.90, miscWater: false, green: '绿色推荐', greenCls: 'bg-emerald-100 text-emerald-800', color: '#fbbf24' },
    { id: 'pe', name: '石油醚 (30-60℃)', p: 0.1, bp: 45.0, density: 0.65, miscWater: false, green: '易燃防明火', greenCls: 'bg-amber-100 text-amber-800', color: '#fcd34d' },
    { id: 'nbutanol', name: '正丁醇', p: 3.9, bp: 117.7, density: 0.81, miscWater: false, green: '较安全', greenCls: 'bg-teal-100 text-teal-800', color: '#f472b6' },
    { id: 'dcm', name: '二氯甲烷', p: 3.1, bp: 39.8, density: 1.33, miscWater: false, green: '尽量替代', greenCls: 'bg-rose-100 text-rose-800', color: '#fb7185' }
  ];

  // 3. 权威开源数据库
  const OPEN_DBS = [
    { name: '中国药典在线', desc: '核查法定药材基原、显微/薄层鉴别与含量限度标准', url: 'https://ydz.chp.org.cn/', tag: '法定标准', icon: '📘' },
    { name: 'TCMSP 系统药理库', desc: '查询中药活性成分 OB/DL 成药性、靶点与疾病网络', url: 'https://www.tcmsp-e.com/', tag: '成分靶点', icon: '🧬' },
    { name: 'HERB 本草祖鉴', desc: '高通量中药实验参考数据库，关联基因表达谱与现代药物', url: 'http://herb.ac.cn/', tag: '转录组学', icon: '🌿' },
    { name: '中科院上海有机所库', desc: '检索 22,000+ 中药材、50,000+ 复方与 19,700+ 化合物结构', url: 'https://organchem.csdb.cn/scdb/main/tcm_introduce.asp', tag: '化学结构', icon: '⚗️' },
    { name: 'iLab-X 国家虚仿平台', desc: '全国高校中药与药学虚拟仿真实验示范课程共享平台', url: 'https://www.ilab-x.com/', tag: '教学示范', icon: '🎓' },
    { name: 'PubChem 国际化合物库', desc: '查询单体成分 3D 分子结构、SMILES、LogP 与光谱理化数据', url: 'https://pubchem.ncbi.nlm.nih.gov/', tag: '理化光谱', icon: '🔬' }
  ];

  let diyStudioState = {
    formula: [
      { id: 'huanglian', grams: 15 },
      { id: 'huangqin', grams: 15 },
      { id: 'gancao', grams: 10 }
    ],
    solA: 'etoh',
    solB: 'water',
    ratioA: 70,
    tlcLight: 'uv365', // 'day' | 'uv254' | 'uv365'
    tlcPolarity: 46
  };

  function getHerbMeta(id) { return FORMULA_HERBS.find(h => h.id === id); }
  function getSolMeta(id) { return SOLVENTS.find(s => s.id === id) || SOLVENTS[0]; }

  function analyzeFormula(items) {
    const metas = items.map(it => ({ ...getHerbMeta(it.id), grams: it.grams })).filter(Boolean);
    const totalG = metas.reduce((s, m) => s + m.grams, 0);
    const traits = new Set(metas.map(m => m.trait));
    const notes = [];
    let route = '70% 乙醇热回流提取 + 减压浓缩 + TLC/HPLC 多指标检测';
    let rig = 'reflux';
    let temp = 75;

    if (traits.has('alkaloid') && traits.has('acid_flav')) {
      notes.push({ kind: 'chem', text: '⚡ 检测到「生物碱（碱）+ 黄酮苷（酸）」经典配伍：合煎时小檗碱与黄芩苷易发生酸碱自组装生成微溶沉淀复合物，极适合设计「合煎 vs 分煎合并」对比实验！' });
      route = '纯化水合煎 + 离心分离沉淀对比 + 冻干粉 HPLC 多指标测定';
      rig = 'freeze_dry';
      temp = 95;
    }
    if (traits.has('saponin') && (traits.has('lipo') || traits.has('acid_flav'))) {
      notes.push({ kind: 'good', text: '🫧 检测到「皂苷类药材（甘草/黄芪）+ 难溶活性成分」：皂苷具有天然表面活性剂胶束效应，可显著增溶亲脂性成分并调和药性。' });
    }
    if (traits.has('volatile')) {
      notes.push({ kind: 'warn', text: '💨 复方含挥发油药材（薄荷/当归/川芎）：切忌长时间敞口武火久煎！建议采用「先收挥发油、残液合并其余药材煎煮」的双提法，或后下 5~10 min。' });
      if (metas.every(m => m.trait === 'volatile')) { rig = 'steam'; temp = 100; route = '药典甲法水蒸气共沸蒸馏收油 + 365nm 荧光 TLC 鉴别'; }
    }
    if (traits.has('thermo')) {
      notes.push({ kind: 'warn', text: '🌡️ 含热敏酚酸/苯乙醇苷（金银花/连翘）：建议全程控温 ≤ 60℃（如 40kHz 低温超声提取），防止氧化褐变与酯键水解。' });
      temp = Math.min(temp, 55);
      rig = 'ultrasonic';
    }
    if (!notes.length) {
      notes.push({ kind: 'good', text: '✅ 药味理化性质温和兼容，可直接按中等极性 70% 乙醇或纯化水进行联合提取并开展多指标质量评价。' });
    }
    return { metas, totalG, notes, route, rig, temp };
  }

  function renderDiyStudioPanel() {
    const panel = document.getElementById('wpanel-diy');
    if (!panel) return;

    const fInfo = analyzeFormula(diyStudioState.formula);
    const sA = getSolMeta(diyStudioState.solA);
    const sB = getSolMeta(diyStudioState.solB);
    const rA = diyStudioState.ratioA;
    const rB = 100 - rA;
    const mixP = (sA.p * (rA / 100) + sB.p * (rB / 100));
    const mixBp = (sA.bp * (rA / 100) + sB.bp * (rB / 100));
    const immiscible = (sA.id !== sB.id) && ((sA.id === 'water' && !sB.miscWater) || (sB.id === 'water' && !sA.miscWater));
    const upperSol = sA.density <= sB.density ? sA : sB;
    const lowerSol = sA.density <= sB.density ? sB : sA;

    const polarFit = mixP <= 2.2
      ? '低极性区：适合挥发油、游离萜类、植物蜡质脱脂'
      : mixP <= 4.8
        ? '中低极性区：适合游离蒽醌、香豆素、姜黄素、五味子木脂素'
        : mixP <= 7.2
          ? '黄金中等极性区：适合总黄酮、生物碱、皂苷、苯丙素酚酸'
          : '强极性水相区：适合中药多糖、氨基酸、强水溶性苷类';

    // 虚拟 TLC 参数计算
    const tp = diyStudioState.tlcPolarity; // 10..90
    const rfRef = Math.min(0.86, Math.max(0.14, 0.16 + (tp / 100) * 0.68));
    const rfSamA = Math.min(0.88, Math.max(0.12, rfRef + 0.01));
    const rfSamB = Math.min(0.90, Math.max(0.10, rfRef - 0.14));
    const rfComp1 = Math.min(0.87, Math.max(0.14, rfRef));
    const rfComp2 = Math.min(0.92, Math.max(0.22, rfRef + 0.16));

    const plateBg = diyStudioState.tlcLight === 'uv365'
      ? '#160d2e'
      : (diyStudioState.tlcLight === 'uv254' ? '#10b981' : '#fafaf7');
    const spotColA = diyStudioState.tlcLight === 'uv365'
      ? '#38bdf8'
      : (diyStudioState.tlcLight === 'uv254' ? '#062420' : '#f59e0b');
    const spotColB = diyStudioState.tlcLight === 'uv365'
      ? '#fde047'
      : (diyStudioState.tlcLight === 'uv254' ? '#0f172a' : '#d97706');
    const spotColC = diyStudioState.tlcLight === 'uv365'
      ? '#fb7185'
      : (diyStudioState.tlcLight === 'uv254' ? '#1e293b' : '#dc2626');

    const yFromRf = rf => (166 - rf * 136).toFixed(1);

    // 复方网络 SVG 节点
    const cx = 250, cy = 88;
    const netNodes = fInfo.metas.map((m, idx) => {
      const ang = -Math.PI / 2 + (idx * 2 * Math.PI) / Math.max(1, fInfo.metas.length);
      const nx = cx + Math.cos(ang) * 145;
      const ny = cy + Math.sin(ang) * 58;
      return `
        <line x1="${cx}" y1="${cy}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" stroke="${m.color}" stroke-width="2.2" stroke-dasharray="5 4" class="anim-flow" />
        <g transform="translate(${nx.toFixed(1)}, ${ny.toFixed(1)})">
          <rect x="-46" y="-20" width="92" height="40" rx="12" fill="#0d352f" stroke="${m.color}" stroke-width="2" />
          <text x="0" y="-3" text-anchor="middle" fill="#ffffff" font-size="11.5" font-weight="800">${esc(m.name)} ${m.grams}g</text>
          <text x="0" y="13" text-anchor="middle" fill="#a7f3d0" font-size="10">${esc(m.comp.slice(0, 7))}</text>
        </g>
      `;
    }).join('');

    panel.innerHTML = `
      <!-- 顶部横幅 -->
      <section class="lab-card rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#062420] via-[#0a3832] to-[#0f5c54] text-white space-y-2">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/12 text-amber-200 text-xs font-extrabold">🧩 DIY 创意实验室 · 自由设计 · 实时仿真</div>
        <h2 class="text-xl sm:text-2xl font-extrabold tracking-tight">复方配伍、溶剂调配、虚拟薄层显色与开放数据库一站联动</h2>
        <p class="text-sm text-teal-100/90">跳出固定模板限制，自由组合复方药味、调配混合溶剂极性、在三种光源下模拟 TLC 展板，并可一键同步到主工作台生成完整实验报告。</p>
      </section>

      <!-- 模块 1：复方配伍 DIY 模拟器 -->
      <section class="lab-card v9-visual-card rounded-3xl p-5 sm:p-6 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 class="text-base font-extrabold text-slate-900">🧬 1. 复方配伍 DIY 模拟器与化学互作推演</h3>
            <p class="text-xs text-slate-500">点击下方药材自由增减（建议 2~5 味），调整克重并即时洞察酸碱沉淀、皂苷增溶与挥发油后下规律</p>
          </div>
          <button type="button" id="diyBtnPushFormula" class="px-4 py-2 rounded-2xl bg-[#0a3630] hover:bg-[#062420] text-white text-xs font-extrabold shadow-sm transition">⚡ 一键生成复方课题并同步工作台 →</button>
        </div>

        <div class="flex flex-wrap gap-2">
          ${FORMULA_HERBS.map(h => {
            const on = diyStudioState.formula.some(x => x.id === h.id);
            return `<button type="button" data-f-herb="${h.id}" class="v9-brick-btn px-3 py-1.5 rounded-xl border text-xs font-bold transition ${on ? 'active' : ''}">${esc(h.name)} <span class="opacity-75">(${esc(h.role)})</span></button>`;
          }).join('')}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div class="lg:col-span-5 space-y-2.5">
            <div class="text-xs font-extrabold text-[#0f5c54]">已选组方克重调节（总投料 ${fInfo.totalG} g）</div>
            ${fInfo.metas.map(m => `
              <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 v9-chart-surface">
                <div class="flex items-center justify-between text-xs font-bold">
                  <span>${esc(m.name)} · <span class="text-slate-500">${esc(m.comp)}</span></span>
                  <span class="text-[#0f5c54] tabular-nums">${m.grams} g</span>
                </div>
                <input type="range" min="5" max="50" step="5" value="${m.grams}" data-f-grams="${m.id}" class="w-full accent-emerald-600" />
              </div>
            `).join('')}
          </div>

          <div class="lg:col-span-7 space-y-3">
            <div class="rounded-2xl bg-gradient-to-br from-[#061e1b] to-[#0b312c] border border-emerald-400/25 p-3">
              <svg viewBox="0 0 500 176" class="w-full h-[176px] block select-none">
                ${netNodes}
                <circle cx="${cx}" cy="${cy}" r="34" fill="#10b981" fill-opacity="0.24" stroke="#34d399" stroke-width="2" />
                <text x="${cx}" y="${cy - 3}" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="800">合煎体系</text>
                <text x="${cx}" y="${cy + 14}" text-anchor="middle" fill="#fde68a" font-size="11" font-weight="700">${fInfo.totalG} g</text>
              </svg>
            </div>
            <div class="space-y-2 text-xs">
              ${fInfo.notes.map(n => `
                <div class="p-3 rounded-2xl border ${n.kind === 'warn' ? 'bg-amber-50 border-amber-200 text-amber-900' : (n.kind === 'chem' ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900')} leading-relaxed font-medium">${esc(n.text)}</div>
              `).join('')}
              <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 v9-chart-surface">
                <strong>推荐提取路线：</strong>${esc(fInfo.route)}（建议控温 ${fInfo.temp}℃）
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 模块 2 & 3 并排：混合溶剂调配器 + 虚拟 TLC 三光源展板 -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <!-- 模块 2：混合溶剂极性调配与分层/混溶试管模拟 -->
        <section class="lab-card v9-visual-card rounded-3xl p-5 space-y-4">
          <div>
            <h3 class="text-base font-extrabold text-slate-900">⚗️ 2. 混合溶剂极性调配与液液分层模拟器</h3>
            <p class="text-xs text-slate-500">自由选择两种溶剂及体积比，实时计算混合极性 P'、沸点与单相/两相分层状态</p>
          </div>

          <div class="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">溶剂 A（${rA}%）</label>
              <select id="diySolA" class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold">
                ${SOLVENTS.map(s => `<option value="${s.id}" ${s.id === sA.id ? 'selected' : ''}>${esc(s.name)} (P'=${s.p})</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">溶剂 B（${rB}%）</label>
              <select id="diySolB" class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold">
                ${SOLVENTS.map(s => `<option value="${s.id}" ${s.id === sB.id ? 'selected' : ''}>${esc(s.name)} (P'=${s.p})</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 v9-chart-surface">
            <div class="flex justify-between text-xs font-bold"><span>体积配比：${esc(sA.name)} ${rA}% : ${esc(sB.name)} ${rB}%</span><span class="text-[#0f5c54] tabular-nums">混合极性 P' = ${mixP.toFixed(2)}</span></div>
            <input id="diySolRatio" type="range" min="10" max="90" step="5" value="${rA}" class="w-full accent-emerald-600" />
          </div>

          <div class="grid grid-cols-12 gap-3 items-center">
            <!-- 动态分层/混溶试管 SVG -->
            <div class="col-span-5 flex justify-center">
              <svg viewBox="0 0 130 160" class="w-[124px] h-[154px]">
                <defs><clipPath id="diyTubeClip"><rect x="36" y="14" width="58" height="128" rx="26"/></clipPath></defs>
                <g clip-path="url(#diyTubeClip)">
                  ${immiscible ? `
                    <rect x="36" y="34" width="58" height="52" fill="${upperSol.color}" fill-opacity="0.78" />
                    <rect x="36" y="86" width="58" height="56" fill="${lowerSol.color}" fill-opacity="0.88" />
                    <line x1="36" y1="86" x2="94" y2="86" stroke="#ffffff" stroke-width="2" stroke-dasharray="4 3" />
                    <text x="65" y="64" text-anchor="middle" fill="#062420" font-size="10.5" font-weight="800">上相</text>
                    <text x="65" y="116" text-anchor="middle" fill="#ffffff" font-size="10.5" font-weight="800">下相</text>
                  ` : `
                    <rect x="36" y="34" width="58" height="108" fill="${sA.color}" fill-opacity="0.65" />
                    <text x="65" y="92" text-anchor="middle" fill="#062420" font-size="11" font-weight="800">完全互溶</text>
                  `}
                </g>
                <rect x="36" y="14" width="58" height="128" rx="26" fill="none" stroke="#0f5c54" stroke-width="2.5" />
                <line x1="28" y1="14" x2="102" y2="14" stroke="#0f5c54" stroke-width="3" stroke-linecap="round" />
              </svg>
            </div>
            <div class="col-span-7 space-y-2 text-xs">
              <div class="p-2.5 rounded-xl bg-teal-50 border border-teal-200 font-bold text-[#0a3630]">
                ${immiscible
                  ? `🧪 两相分层（适合液液萃取）：上层为 ${esc(upperSol.name)} (ρ=${upperSol.density})，下层为 ${esc(lowerSol.name)} (ρ=${lowerSol.density})`
                  : `💧 单相完全互溶（适合提取或 TLC 展开剂）：估算混合沸点约 ${mixBp.toFixed(1)}℃`}
              </div>
              <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 v9-chart-surface">${polarFit}</div>
              <div class="flex flex-wrap gap-1.5">
                <span class="px-2 py-0.5 rounded-lg text-xs font-bold ${sA.greenCls}">${esc(sA.name)}：${sA.green}</span>
                <span class="px-2 py-0.5 rounded-lg text-xs font-bold ${sB.greenCls}">${esc(sB.name)}：${sB.green}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 模块 3：虚拟 TLC 薄层色谱三光源实时显色台 -->
        <section class="lab-card v9-visual-card rounded-3xl p-5 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 class="text-base font-extrabold text-slate-900">🎨 3. 虚拟 TLC 薄层三光源显色实验台</h3>
              <p class="text-xs text-slate-500">切换日光 / 254nm / 365nm 紫外光源并调节展开剂极性，实时观测斑点与 Rf 值</p>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            ${[
              ['day', '☀️ 日光检视'],
              ['uv254', '🟢 254nm 紫外暗斑'],
              ['uv365', '🟣 365nm 紫外荧光']
            ].map(([id, lbl]) => `
              <button type="button" data-tlc-light="${id}" class="px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ${diyStudioState.tlcLight === id ? 'bg-[#0a3630] text-white border-[#0a3630]' : 'bg-white text-slate-700 border-slate-200 hover:border-[#0f5c54]'}">${lbl}</button>
            `).join('')}
          </div>

          <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 v9-chart-surface">
            <div class="flex justify-between text-xs font-bold"><span>展开剂极性强度</span><span class="text-[#0f5c54] tabular-nums">${tp}%（Rf ≈ ${rfRef.toFixed(2)}）</span></div>
            <input id="diyTlcPol" type="range" min="15" max="85" step="1" value="${tp}" class="w-full accent-emerald-600" />
          </div>

          <div class="rounded-2xl border border-slate-200 p-3 flex flex-col items-center gap-2" style="background:${plateBg}; transition: background 0.35s ease;">
            <svg viewBox="0 0 360 194" class="w-full max-w-[360px] h-[186px] select-none">
              <!-- 溶剂前沿线与原点线 -->
              <line x1="24" y1="28" x2="336" y2="28" stroke="${diyStudioState.tlcLight === 'day' ? '#94a3b8' : '#e2e8f0'}" stroke-dasharray="5 4" stroke-width="1.3" />
              <text x="336" y="22" text-anchor="end" fill="${diyStudioState.tlcLight === 'day' ? '#64748b' : '#cbd5e1'}" font-size="10.5" font-weight="700">溶剂前沿 (Rf=1.0)</text>
              <line x1="24" y1="166" x2="336" y2="166" stroke="${diyStudioState.tlcLight === 'day' ? '#94a3b8' : '#e2e8f0'}" stroke-width="1.3" />

              <!-- 4 泳道斑点 -->
              <ellipse cx="72" cy="${yFromRf(rfRef)}" rx="11" ry="6.5" fill="${spotColA}" style="transition: cy 0.25s ease;" />
              <ellipse cx="148" cy="${yFromRf(rfSamA)}" rx="12" ry="7" fill="${spotColA}" style="transition: cy 0.25s ease;" />
              <ellipse cx="224" cy="${yFromRf(rfSamB)}" rx="11" ry="6.5" fill="${spotColB}" style="transition: cy 0.25s ease;" />
              <ellipse cx="300" cy="${yFromRf(rfComp1)}" rx="11" ry="6.5" fill="${spotColA}" style="transition: cy 0.25s ease;" />
              <ellipse cx="300" cy="${yFromRf(rfComp2)}" rx="10" ry="6" fill="${spotColC}" style="transition: cy 0.25s ease;" />

              <text x="72" y="184" text-anchor="middle" fill="${diyStudioState.tlcLight === 'day' ? '#334155' : '#f8fafc'}" font-size="11" font-weight="800">对照品</text>
              <text x="148" y="184" text-anchor="middle" fill="${diyStudioState.tlcLight === 'day' ? '#334155' : '#f8fafc'}" font-size="11" font-weight="800">供试品A</text>
              <text x="224" y="184" text-anchor="middle" fill="${diyStudioState.tlcLight === 'day' ? '#334155' : '#f8fafc'}" font-size="11" font-weight="800">杂质样B</text>
              <text x="300" y="184" text-anchor="middle" fill="${diyStudioState.tlcLight === 'day' ? '#334155' : '#f8fafc'}" font-size="11" font-weight="800">复方双斑</text>
            </svg>
            <div class="text-xs font-bold ${diyStudioState.tlcLight === 'day' ? 'text-slate-700' : 'text-white'}">
              判定：供试品 A 与对照品 ΔRf = ${Math.abs(rfSamA - rfRef).toFixed(2)}（≤ 0.03 鉴别一致，黄金 Rf 区间 0.30~0.70）
            </div>
          </div>
        </section>
      </div>

      <!-- 模块 4：全球权威中医药与化学开放数据库联动台 -->
      <section class="lab-card v9-visual-card rounded-3xl p-5 sm:p-6 space-y-4">
        <div>
          <h3 class="text-base font-extrabold text-slate-900">🌐 4. 权威中医药与化学开放数据库直通台</h3>
          <p class="text-xs text-slate-500">一键直达药典法定标准、系统药理学、化学结构与国家级虚拟仿真平台，辅助深度科研检索</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          ${OPEN_DBS.map(db => `
            <a href="${db.url}" target="_blank" rel="noopener noreferrer" class="pick-card rounded-2xl p-4 bg-white border border-slate-200/90 flex flex-col justify-between gap-2 text-left">
              <div class="flex items-center justify-between gap-2">
                <span class="text-sm font-extrabold text-slate-900">${db.icon} ${esc(db.name)}</span>
                <span class="px-2 py-0.5 rounded-full bg-teal-50 text-[#0f5c54] text-xs font-bold">${esc(db.tag)}</span>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed">${esc(db.desc)}</p>
              <span class="text-xs font-extrabold text-[#0f5c54]">立即访问 ↗</span>
            </a>
          `).join('')}
        </div>
      </section>
    `;

    // 绑定所有互动事件
    panel.querySelectorAll('[data-f-herb]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.fHerb;
        if (diyStudioState.formula.some(x => x.id === id)) {
          if (diyStudioState.formula.length > 1) diyStudioState.formula = diyStudioState.formula.filter(x => x.id !== id);
        } else if (diyStudioState.formula.length < 6) {
          const meta = getHerbMeta(id);
          diyStudioState.formula.push({ id, grams: meta ? meta.grams : 15 });
        }
        renderDiyStudioPanel();
      });
    });

    panel.querySelectorAll('[data-f-grams]').forEach(inp => {
      inp.addEventListener('input', () => {
        const item = diyStudioState.formula.find(x => x.id === inp.dataset.fGrams);
        if (item) item.grams = Number(inp.value);
        renderDiyStudioPanel();
      });
    });

    const pushBtn = panel.querySelector('#diyBtnPushFormula');
    if (pushBtn) {
      pushBtn.addEventListener('click', () => {
        const names = fInfo.metas.map(m => m.name).join('+');
        const comps = fInfo.metas.map(m => m.comp.split('/')[0]).join(' + ');
        if (window.TCM_USER_PLAN_BRIDGE && window.TCM_USER_PLAN_BRIDGE.applyPlan) {
          window.TCM_USER_PLAN_BRIDGE.applyPlan({
            id: 'diy_formula_' + Date.now(),
            title: `自拟复方（${names}）提取分离方案`,
            herb: `自拟复方：${names}`,
            compound: comps,
            category: '黄酮',
            score: 91,
            sourceText: `自拟复方组方：${fInfo.metas.map(m => `${m.name} ${m.grams}g`).join('、')}（共 ${fInfo.totalG}g）。推荐路线：${fInfo.route}。`,
            summaryAdvice: fInfo.notes.map(n => n.text).join(' '),
            params: { mass: fInfo.totalG, ratio: 10, temp: fInfo.temp, time: 60, cycles: 2, solventType: fInfo.rig === 'steam' || fInfo.rig === 'freeze_dry' ? '纯化水' : '70%乙醇', rig: fInfo.rig },
            stages: [
              { stage: '① 组方前处理', title: `按配比称量 ${names} 共 ${fInfo.totalG} g`, phenomenon: '润药 30 min 软化药材组织，含挥发油药味按需后下。', qc: '配比精确误差 ≤ 1%。', tip: '避免粉碎过细防过滤堵塞。' },
              { stage: '② 联合提取', title: `${fInfo.temp}℃ 联合浸提合并滤液`, phenomenon: '各味药活性成分协同溶出并产生特征色泽。', qc: `严控温度 ${fInfo.temp}℃。`, tip: '监测合煎液沉淀与澄清度。' },
              { stage: '③ 浓缩纯化', title: '减压浓缩与梯度分离富集', phenomenon: '回收 75%+ 溶剂并富集目标有效部位。', qc: '低温旋蒸 ≤ 55℃。', tip: '留存对照样品便于分析合煎互作。' },
              { stage: '④ 多指标质控', title: '多组分 TLC 荧光鉴别与定量', phenomenon: '在 254/365 nm 紫外下清晰检出多组分特征斑点。', qc: 'ΔRf ≤ 0.03。', tip: '同步记录各组得率与精密度。' }
            ],
            risks: fInfo.notes.map(n => n.text)
          }, true);
          const wfBtn = document.getElementById('zoneTabWorkflow');
          if (wfBtn) wfBtn.click();
        }
      });
    }

    const selA = panel.querySelector('#diySolA');
    const selB = panel.querySelector('#diySolB');
    const rngR = panel.querySelector('#diySolRatio');
    if (selA) selA.addEventListener('change', () => { diyStudioState.solA = selA.value; renderDiyStudioPanel(); });
    if (selB) selB.addEventListener('change', () => { diyStudioState.solB = selB.value; renderDiyStudioPanel(); });
    if (rngR) rngR.addEventListener('input', () => { diyStudioState.ratioA = Number(rngR.value); renderDiyStudioPanel(); });

    panel.querySelectorAll('[data-tlc-light]').forEach(btn => {
      btn.addEventListener('click', () => {
        diyStudioState.tlcLight = btn.dataset.tlcLight;
        renderDiyStudioPanel();
      });
    });
    const tlcPol = panel.querySelector('#diyTlcPol');
    if (tlcPol) tlcPol.addEventListener('input', () => { diyStudioState.tlcPolarity = Number(tlcPol.value); renderDiyStudioPanel(); });
  }

  window.TCM_DIY_STUDIO = {
    render: renderDiyStudioPanel
  };
})();
