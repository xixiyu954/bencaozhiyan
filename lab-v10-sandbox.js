// =========================================================================
// 本草智研 v10.0 自由搭建动态装置沙盒、可行性诊断引擎与互动实操流程 (lab-v10-sandbox.js)
// - 扩展 2 套全新动画装置（索氏连续提取器 / 超临界 CO2 绿色萃取仪 → 装置库升至 15 套）
// - 14 种可自由插拔实验器皿/单元，支持自由组装、调序、清空、蓝图套用与 SVG 动态管路连线
// - 0-Token 化学工程可行性分析与深度解析引擎（热力学安全 / 物理连通性 / 药材匹配度 / 一键智能纠错）
// - 5 阶段可互动实验操作推演器（亲手按序执行气密性→温控→现象判定→分离→检识）
// =========================================================================
(function () {
  'use strict';

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }

  // ==================== 1. 新增 2 套动态 SVG 工艺装置（扩充至 15 套） ====================
  const V10_EXTRA_RIGS = {
    soxhlet: {
      id: 'soxhlet',
      name: '索氏连续虹吸提取装置',
      category: '提取主机',
      tag: '高效率 · 低溶剂耗量',
      shortDesc: '利用溶剂反复汽化、冷凝滴落与虹吸回流，用极少溶剂实现药材连续穷尽式萃取。',
      safety: '低沸点易燃溶剂须水浴加热、严禁明火，纸筒高度不得超过虹吸管最高拐点。',
      videoKw: '索氏提取器 实验操作 原理',
      svg: `<svg viewBox="0 0 360 220" class="w-full h-auto max-h-[220px] mx-auto">
        <defs><linearGradient id="soxLiq" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f59e0b" stop-opacity="0.8"/><stop offset="100%" stop-color="#b45309" stop-opacity="0.95"/></linearGradient></defs>
        <rect x="30" y="18" width="6" height="184" rx="3" fill="#64748b"/>
        <rect x="14" y="198" width="62" height="7" rx="3.5" fill="#475569"/>
        <rect x="36" y="70" width="110" height="5" rx="2" fill="#94a3b8"/>
        <!-- 球形冷凝管 -->
        <rect x="166" y="14" width="24" height="56" rx="8" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/>
        <path d="M178 66 L178 20" stroke="#0ea5e9" stroke-width="2.2" class="anim-flow"/>
        <!-- 索氏提取筒 + 滤纸筒 + 虹吸管 -->
        <rect x="158" y="72" width="40" height="62" rx="6" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
        <rect x="166" y="84" width="24" height="42" rx="4" fill="#fde68a" stroke="#b45309" stroke-dasharray="3 2"/>
        <path d="M198 126 C222 126 222 86 198 86" fill="none" stroke="#0f5c54" stroke-width="2.5" class="anim-flow"/>
        <path d="M158 124 C138 124 138 78 158 78" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="4 3" class="anim-flow"/>
        <!-- 底部圆底烧瓶与水浴 -->
        <circle cx="178" cy="164" r="28" fill="url(#soxLiq)" stroke="#0f5c54" stroke-width="2.2"/>
        <circle cx="170" cy="172" r="3" fill="#fff" class="anim-bubble-1"/>
        <circle cx="185" cy="168" r="2.5" fill="#fff" class="anim-bubble-2"/>
        <rect x="142" y="182" width="72" height="18" rx="6" fill="#1e293b"/>
        <text x="236" y="45" fill="#0369a1" font-size="10" font-weight="700">冷凝滴落</text>
        <text x="236" y="106" fill="#0f5c54" font-size="10" font-weight="700">虹吸自动回流</text>
        <text x="236" y="168" fill="#b45309" font-size="10" font-weight="700">水浴持续汽化</text>
      </svg>`,
      subSteps: [
        { title: '1. 滤纸筒装药与限高校验', detail: '将药材粗粉装入脱脂滤纸筒，高度务必低于虹吸管最高弯曲点 1 cm。', kw: '索氏提取器 装样' },
        { title: '2. 加注溶剂与沸石防暴沸', detail: '烧瓶内加溶剂约占容积 1/2~2/3 并投入 2~3 粒沸石，严防干烧。', kw: '索氏提取 沸石' },
        { title: '3. 控温回流观测虹吸循环', detail: '调节水浴温度保持每小时虹吸 4~6 次，观察提取筒液色由深变浅。', kw: '索氏提取 虹吸' },
        { title: '4. 终点判定与溶剂回收', detail: '待提取筒内溶剂近无色时停止加热，冷却后回收大部分有机溶剂。', kw: '有机溶剂 回收' }
      ]
    },
    supercritical: {
      id: 'supercritical',
      name: '超临界 CO₂ 绿色流体萃取仪',
      category: '前沿绿色',
      tag: '零有机残留 · 低温护热敏',
      shortDesc: '利用 CO₂ 临界点（31.1℃ / 7.38 MPa）以上兼具气体扩散力与液体溶解力的特性，低温无毒萃取脂溶性成分。',
      safety: '属高压容器设备（15~35 MPa），须严格检查釜盖密封圈与安全泄压阀，严禁带压开釜。',
      videoKw: '超临界CO2萃取 实验 原理',
      svg: `<svg viewBox="0 0 360 220" class="w-full h-auto max-h-[220px] mx-auto">
        <!-- CO2 钢瓶 -->
        <rect x="26" y="56" width="34" height="128" rx="14" fill="#0f5c54" stroke="#062420" stroke-width="2"/>
        <text x="43" y="124" text-anchor="middle" fill="#a7f3d0" font-size="11" font-weight="800">CO₂</text>
        <!-- 高压泵 -->
        <rect x="92" y="114" width="44" height="36" rx="8" fill="#0284c7" stroke="#0369a1" stroke-width="2"/>
        <text x="114" y="136" text-anchor="middle" fill="#fff" font-size="9.5" font-weight="700">高压泵</text>
        <!-- 萃取釜 -->
        <rect x="168" y="48" width="54" height="126" rx="10" fill="#ecfdf5" stroke="#059669" stroke-width="2.5"/>
        <rect x="176" y="76" width="38" height="72" rx="4" fill="#a7f3d0" stroke="#047857" stroke-dasharray="4 3"/>
        <text x="195" y="116" text-anchor="middle" fill="#064e3b" font-size="10" font-weight="800">萃取釜</text>
        <text x="195" y="164" text-anchor="middle" fill="#047857" font-size="8.5" font-weight="700">35℃/25MPa</text>
        <!-- 分离釜 -->
        <rect x="264" y="68" width="48" height="106" rx="10" fill="#fffbeb" stroke="#d97706" stroke-width="2.2"/>
        <text x="288" y="118" text-anchor="middle" fill="#92400e" font-size="10" font-weight="800">降压分离</text>
        <text x="288" y="156" text-anchor="middle" fill="#b45309" font-size="8.5" font-weight="700">无溶剂油膏</text>
        <!-- 动态流体管路 -->
        <path d="M60 132 L92 132 M136 132 L168 132 M222 84 L264 84" fill="none" stroke="#10b981" stroke-width="3" class="anim-flow"/>
        <path d="M288 68 L288 30 L114 30 L114 114" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="5 5" class="anim-flow"/>
        <text x="200" y="24" text-anchor="middle" fill="#0284c7" font-size="9.5" font-weight="700">CO₂ 闭环循环回收</text>
      </svg>`,
      subSteps: [
        { title: '1. 药材装料与夹带剂设定', detail: '极性偏中成分可按 3%~8% 比例加入无水乙醇作为夹带剂提升溶解度。', kw: '超临界萃取 夹带剂' },
        { title: '2. 预冷液化与高压泵升压', detail: '开启制冷循环使 CO₂ 液化，逐步升压至 20~30 MPa、控温 35~45℃。', kw: '超临界CO2 升压' },
        { title: '3. 动态循环萃取与降压分离', detail: '流体经节流阀降压至 5~6 MPa，CO₂ 气化循环，目标物在分离釜析出。', kw: '超临界 分离釜' },
        { title: '4. 缓慢泄压与取样检验', detail: '确认压力表归零后再开釜取样，检测无有机溶剂残留与活性成分含量。', kw: '超临界萃取 挥发油' }
      ]
    },
    microwave: {
      id: 'microwave',
      name: '微波辅助快速提取仪 (MAE)',
      category: '前沿绿色',
      tag: '分钟级破壁 · 高效节能',
      shortDesc: '利用极性水/醇分子高频偶极旋转产生内热，数分钟内瞬时胀破药材细胞壁，大幅缩短提取时间。',
      safety: '严禁将金属器皿或密闭普通玻璃瓶放入微波腔体；易燃有机溶剂须配防爆回流冷凝通道。',
      videoKw: '微波辅助提取 中药 实验',
      svg: `<svg viewBox="0 0 360 220" class="w-full h-auto max-h-[220px] mx-auto">
        <rect x="46" y="34" width="210" height="148" rx="14" fill="#0f2925" stroke="#10b981" stroke-width="2.2"/>
        <rect x="64" y="52" width="136" height="112" rx="10" fill="#061a17" stroke="#34d399" stroke-width="1.5"/>
        <circle cx="132" cy="116" r="30" fill="#10b981" fill-opacity="0.35" stroke="#a7f3d0" stroke-width="2"/>
        <circle cx="132" cy="116" r="14" fill="none" stroke="#f59e0b" stroke-width="2" class="anim-sonar"/>
        <circle cx="132" cy="116" r="14" fill="none" stroke="#38bdf8" stroke-width="2" class="anim-sonar-2"/>
        <rect x="126" y="14" width="12" height="72" rx="4" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.6"/>
        <path d="M132 82 L132 20" stroke="#38bdf8" stroke-width="2" class="anim-flow"/>
        <rect x="210" y="56" width="34" height="104" rx="8" fill="#1e293b"/>
        <text x="227" y="84" text-anchor="middle" fill="#34d399" font-size="9" font-weight="800">400W</text>
        <text x="227" y="106" text-anchor="middle" fill="#fde68a" font-size="9" font-weight="800">65℃</text>
        <text x="227" y="128" text-anchor="middle" fill="#7dd3fc" font-size="8.5" font-weight="700">8 min</text>
        <text x="272" y="96" fill="#0f5c54" font-size="10" font-weight="800">高频偶极内热</text>
        <text x="272" y="116" fill="#b45309" font-size="9.5" font-weight="700">细胞瞬时破壁</text>
      </svg>`,
      subSteps: [
        { title: '1. 极性溶剂润药装入聚四氟乙烯/石英瓶', detail: '优先选用 60%~75% 乙醇或纯化水等高介电常数极性溶剂。', kw: '微波提取 溶剂' },
        { title: '2. 设定阶梯功率与红外测温上限', detail: '先 300~500 W 升温 2 min，再恒温 60~75℃ 维持 5~10 min。', kw: '微波辅助提取 控温' },
        { title: '3. 防爆顶部冷凝回流', detail: '保持顶部外接冷凝管通水，防止乙醇蒸汽积聚。', kw: '微波回流 冷凝' },
        { title: '4. 迅速冷却过滤与得率对比', detail: '提取毕冷却后抽滤，可与传统回流 60 min 对照得率与能耗。', kw: '微波提取 黄酮' }
      ]
    }
  };

  // ==================== 2. 自由组装沙盒 14 种实验单元库 ====================
  const SANDBOX_UNITS = [
    // 热源与驱动
    { id: 'u_mantle', slot: '驱动源', name: '控温电热套', icon: '🔥', tempCap: 120, heat: true, color: '#ef4444', short: '70~110℃ 稳定回流加热' },
    { id: 'u_bath', slot: '驱动源', name: '恒温水浴锅', icon: '♨️', tempCap: 95, heat: true, color: '#f59e0b', short: '≤90℃ 防明火控温（低沸点必备）' },
    { id: 'u_ultra', slot: '驱动源', name: '40kHz 超声槽', icon: '🔊', tempCap: 60, heat: false, color: '#0ea5e9', short: '低温空化破壁、省时 60%' },
    { id: 'u_stir', slot: '驱动源', name: '常温磁力搅拌', icon: '🧲', tempCap: 35, heat: false, color: '#6366f1', short: '冷浸/渗漉/酸碱中和混匀' },
    // 提取主机
    { id: 'u_reflux', slot: '提取主机', name: '圆底烧瓶+冷凝管', icon: '⚗️', needHeat: true, color: '#0f5c54', short: '经典有机溶剂热回流提取' },
    { id: 'u_clevenger', slot: '提取主机', name: '挥发油测定器', icon: '💧', needHeat: true, volatileOnly: true, color: '#10b981', short: '药典甲法水蒸气共沸收油' },
    { id: 'u_soxhlet', slot: '提取主机', name: '索氏连续提取器', icon: '🔄', needHeat: true, color: '#d97706', short: '连续虹吸、极低溶剂耗量' },
    { id: 'u_percolator', slot: '提取主机', name: '酸水/醇渗漉筒', icon: '🧪', needHeat: false, color: '#14b8a6', short: '动态冷提、保护热敏成分' },
    // 分离与浓缩
    { id: 'u_funnel', slot: '分离浓缩', name: '梨形分液漏斗', icon: '⏳', color: '#8b5cf6', short: 'pH 梯度两相液液萃取' },
    { id: 'u_rotavap', slot: '分离浓缩', name: '减压旋转蒸发仪', icon: '🌀', color: '#0284c7', short: '45~55℃ 低温回收乙醇' },
    { id: 'u_filter', slot: '分离浓缩', name: '布氏漏斗抽滤', icon: '🧻', color: '#475569', short: '快速固液分离与析晶抽干' },
    { id: 'u_column', slot: '分离浓缩', name: '树脂/硅胶层析柱', icon: '🌈', color: '#db2777', short: '梯度洗脱富集或单体精制' },
    // 精制与质控
    { id: 'u_freeze', slot: '精制质控', name: '真空冷冻干燥机', icon: '❄️', color: '#06b6d4', short: '-50℃ 冻干得蓬松标准粉' },
    { id: 'u_tlc_hplc', slot: '精制质控', name: 'TLC 紫外 + HPLC', icon: '📊', color: '#059669', short: '斑点 Rf 鉴别与定量质控闭环' }
  ];

  const SANDBOX_BLUEPRINTS = [
    { id: 'bp_oil', name: '🌿 挥发油共沸收油链', units: ['u_mantle', 'u_clevenger', 'u_funnel', 'u_tlc_hplc'] },
    { id: 'bp_flav', name: '⚗️ 黄酮热回流精制链', units: ['u_bath', 'u_reflux', 'u_rotavap', 'u_column', 'u_tlc_hplc'] },
    { id: 'bp_green', name: '🔊 热敏超声绿色双相链', units: ['u_ultra', 'u_percolator', 'u_funnel', 'u_freeze', 'u_tlc_hplc'] },
    { id: 'bp_sox', name: '🔄 索氏低耗连续萃取链', units: ['u_bath', 'u_soxhlet', 'u_rotavap', 'u_filter', 'u_tlc_hplc'] }
  ];

  const INTERACTIVE_FLOW_STEPS = [
    { id: 'f1', title: '① 气密性检查与防暴沸准备', action: '加入 3 粒沸石并检查冷却水「下进上出」', explain: '多孔沸石提供气化中心防止液体过热暴沸冲料；冷却水下进上出可确保冷凝管始终充满冷水，冷凝效率最高。' },
    { id: 'f2', title: '② 启动驱动源并阶梯控温', action: '开启温控/超声至目标工艺设定值', explain: '阶梯升温避免瞬间剧烈沸腾导致泡沫冲入冷凝管，同时保护热敏性黄酮、绿原酸与酯键不被破坏。' },
    { id: 'f3', title: '③ 实时观测传质与终点判定', action: '核验提取液色度/回流滴速 (2~3滴/秒)', explain: '维持微沸回流 2~3 滴/秒既能保证 Fick 扩散浓度梯度，又避免溶剂过快挥发造成安全隐患。' },
    { id: 'f4', title: '④ 减压浓缩或两相分离纯化', action: '执行低温旋蒸回收溶剂 / pH 梯度萃取', explain: '45~55℃ 减压旋蒸可大幅降低沸点，回收 75%~85% 乙醇供循环使用，显著降低实验耗材与 VOC 排放。' },
    { id: 'f5', title: '⑤ 终点质控与收率验收', action: '点样 TLC 紫外检视并核算精制得率', explain: '平行点样供试品与标准对照品，要求 ΔRf ≤ 0.03 且无杂斑拖尾，完成“提取—分离—检识”完整闭环。' }
  ];

  let sbState = {
    chain: ['u_bath', 'u_reflux', 'u_rotavap', 'u_tlc_hplc'],
    doneFlow: []
  };

  function getUnit(id) { return SANDBOX_UNITS.find(u => u.id === id); }

  function getCfg(ws) {
    const src = (ws && ws.cfg) ? ws.cfg : (ws || {});
    return {
      temp: Number(src.temp) || 75,
      solventType: String(src.solventType || '70%乙醇'),
      time: Number(src.time) || 60
    };
  }

  // ==================== 3. 化学工程可行性分析与深度解析引擎 ====================
  function analyzeAssembly(chainIds, topic, ws) {
    const units = chainIds.map(getUnit).filter(Boolean);
    const cfg = getCfg(ws);
    const has = id => chainIds.includes(id);
    const slots = new Set(units.map(u => u.slot));

    const issues = [];
    const strengths = [];
    let connectivity = 100;
    let thermalSafety = 100;
    let completeness = 40;
    let feasibility = 92;

    if (units.length < 2) {
      return {
        score: 25, verdict: '装配未完成', verdictCls: 'bg-rose-50 border-rose-200 text-rose-800',
        connectivity: 20, thermalSafety: 60, completeness: 20, feasibility: 25,
        issues: [{ level: 'err', text: '当前组装单元少于 2 个，无法构成完整实验流程，请从上方器皿库点击添加。', fixAction: 'bp_flav' }],
        strengths: []
      };
    }

    if (slots.has('驱动源')) completeness += 18; else { completeness -= 10; issues.push({ level: 'warn', text: '缺少「驱动源」（如恒温水浴/电热套/超声槽），提取传质动力不足。', fixAdd: 'u_bath' }); }
    if (slots.has('提取主机')) completeness += 20; else { connectivity -= 28; issues.push({ level: 'err', text: '缺少「提取主机」（烧瓶/索氏/挥发油测定器/渗漉筒），无法承载药材浸提。', fixAdd: 'u_reflux' }); }
    if (slots.has('分离浓缩')) completeness += 12; else { issues.push({ level: 'warn', text: '未装配「分离浓缩」单元（如旋蒸/分液漏斗/层析柱），仅能获得粗提液。', fixAdd: 'u_rotavap' }); }
    if (slots.has('精制质控')) completeness += 10; else { issues.push({ level: 'warn', text: '缺少「TLC / HPLC 质控」闭环，实验报告将缺乏定性定量依据。', fixAdd: 'u_tlc_hplc' }); }

    // 关键热力学与工程规则校验
    if (has('u_mantle') && /石油醚/.test(cfg.solventType)) {
      thermalSafety -= 55; feasibility -= 35;
      issues.push({ level: 'err', text: '🚨 严重安全冲突：石油醚（沸程 30~60℃）极易燃，严禁使用高温「电热套」加热，必须换为「恒温水浴锅」≤ 50℃ 控温！', fixSwap: ['u_mantle', 'u_bath'] });
    }
    if ((has('u_clevenger') || has('u_soxhlet') || has('u_reflux')) && !has('u_mantle') && !has('u_bath')) {
      connectivity -= 42; feasibility -= 30;
      issues.push({ level: 'err', text: '⚠️ 物理连通性异常：回流/索氏/挥发油测定器均依赖溶剂持续汽化回流，必须配备「恒温水浴锅」或「控温电热套」作为热源！', fixAdd: 'u_bath' });
    }
    if (has('u_clevenger') && topic && topic.category && !/挥发油|萜类/.test(topic.category)) {
      feasibility -= 18;
      issues.push({ level: 'warn', text: `适配度提醒：当前课题「${topic.herb}」属于${topic.category}，并非挥发油主产药材，使用「挥发油测定器」可能几乎收不到油层，建议改用「圆底烧瓶+冷凝管」或「40kHz 超声槽」。`, fixSwap: ['u_clevenger', 'u_reflux'] });
    }
    if (has('u_mantle') && topic && topic.prop === 'thermo_sensitive') {
      thermalSafety -= 22;
      issues.push({ level: 'warn', text: `热敏成分保护提醒：「${topic.herb}」目标成分热敏易氧化降解，高温电热套易导致褐变失活，建议换为「40kHz 超声槽」或「恒温水浴锅」低温提取。`, fixSwap: ['u_mantle', 'u_ultra'] });
    }
    if (has('u_ultra') && has('u_freeze')) {
      strengths.push('🌟 低温超声 + 真空冻干黄金组合：全程免受高温热破坏，非常适合热敏酚酸、多糖及经典名方复方！');
      thermalSafety = Math.min(100, thermalSafety + 8);
    }
    if (has('u_rotavap')) {
      strengths.push('♻️ 已接入减压旋转蒸发仪：可在 45~55℃ 高效回收 75%+ 有机溶剂，绿色低碳且大幅缩短浓缩时间。');
    }
    if (has('u_tlc_hplc')) {
      strengths.push('✅ 已构建「提取 → 分离 → 质控检识」完整教学闭环，可直接支撑第 6 步规范实验报告撰写。');
    }
    if (has('u_soxhlet') && has('u_bath')) {
      strengths.push('🔄 水浴 + 索氏连续虹吸搭配精准：溶剂反复循环使用，比常规回流节省约 50% 溶剂且提取更完全。');
    }

    connectivity = Math.max(15, Math.min(100, connectivity));
    thermalSafety = Math.max(15, Math.min(100, thermalSafety));
    completeness = Math.max(20, Math.min(100, completeness));
    feasibility = Math.max(15, Math.min(100, feasibility));

    const score = Math.round(connectivity * 0.30 + thermalSafety * 0.28 + completeness * 0.22 + feasibility * 0.20);
    const hasErr = issues.some(i => i.level === 'err');
    const verdict = (!hasErr && score >= 82)
      ? '✅ 方案高度可行 · 可直接进实验室操作'
      : (!hasErr && score >= 65)
        ? '⚠️ 基本可行 · 建议按下方解析微调完善'
        : '🚨 存在工程或安全冲突 · 建议一键纠错';
    const verdictCls = (!hasErr && score >= 82)
      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
      : (!hasErr && score >= 65)
        ? 'bg-amber-50 border-amber-200 text-amber-800'
        : 'bg-rose-50 border-rose-200 text-rose-800';

    return { score, verdict, verdictCls, connectivity, thermalSafety, completeness, feasibility, issues, strengths };
  }

  // ==================== 4. 渲染自由搭建沙盒 + 互动实验流程 ====================
  function renderSandboxInto(mountEl, topic, ws) {
    if (!mountEl) return;
    const analysis = analyzeAssembly(sbState.chain, topic, ws);
    const slots = ['驱动源', '提取主机', '分离浓缩', '精制质控'];
    const mounted = sbState.chain.map(getUnit).filter(Boolean);

    // 动态 SVG 组装台绘制
    const nodeW = 104, gap = 34;
    const svgW = Math.max(540, mounted.length * (nodeW + gap) + 40);
    const svgNodes = mounted.map((u, idx) => {
      const x = 24 + idx * (nodeW + gap);
      const y = 32;
      const nextX = x + nodeW;
      return `
        ${idx < mounted.length - 1 ? `
          <g>
            <line x1="${nextX}" y1="${y + 42}" x2="${nextX + gap}" y2="${y + 42}" stroke="#10b981" stroke-width="3.2" class="anim-flow" />
            <polygon points="${nextX + gap - 2},${y + 42} ${nextX + gap - 9},${y + 37} ${nextX + gap - 9},${y + 47}" fill="#10b981" />
          </g>
        ` : ''}
        <g transform="translate(${x}, ${y})">
          <rect x="0" y="0" width="${nodeW}" height="86" rx="16" fill="#0d352f" stroke="${u.color}" stroke-width="2" />
          <rect x="0" y="0" width="${nodeW}" height="22" rx="14" fill="${u.color}" fill-opacity="0.22" />
          <text x="52" y="15" text-anchor="middle" fill="#a7f3d0" font-size="9" font-weight="800">${esc(u.slot)}</text>
          <text x="52" y="49" text-anchor="middle" font-size="22">${u.icon}</text>
          <text x="52" y="72" text-anchor="middle" fill="#ffffff" font-size="10" font-weight="800">${esc(u.name.slice(0, 8))}</text>
          <circle cx="${nodeW - 10}" cy="11" r="3.5" fill="#34d399" class="anim-sonar" />
        </g>
      `;
    }).join('');

    const flowDoneCount = sbState.doneFlow.length;
    const flowPct = Math.round((flowDoneCount / INTERACTIVE_FLOW_STEPS.length) * 100);

    mountEl.innerHTML = `
      <!-- A. 自由搭建动态装置沙盒主卡片 -->
      <section class="lab-card v9-visual-card rounded-3xl p-4 sm:p-6 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2.5">
          <div class="flex items-center gap-2.5">
            <span class="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#062420] via-emerald-700 to-teal-500 text-amber-300 flex items-center justify-center text-base shadow-sm">🛠️</span>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-sm sm:text-base font-extrabold text-slate-900">自由搭建与组装动态装置沙盒 · 可行性实时诊断</h3>
                <span class="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-extrabold">v10.0 互动工程台</span>
              </div>
              <p class="text-[11px] text-slate-500">点击下方 14 种真实实验器皿自由插拔组装，系统即时绘制动态管路并执行热力学与工艺可行性解析</p>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-1.5">
            <button type="button" id="v10BtnAutoFix" class="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-extrabold transition ${analysis.issues.length ? '' : 'hidden'}">🪄 一键智能纠错</button>
            <button type="button" id="v10BtnClearSb" class="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-rose-300 text-slate-600 hover:text-rose-600 text-xs font-bold transition">清空台面</button>
          </div>
        </div>

        <!-- 一键经典蓝图 -->
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="text-[11px] font-bold text-slate-500 mr-1">快捷蓝图：</span>
          ${SANDBOX_BLUEPRINTS.map(bp => `
            <button type="button" data-sb-bp="${bp.id}" class="px-2.5 py-1 rounded-xl bg-teal-50/80 hover:bg-teal-100 border border-teal-200 text-[#0a3630] text-[11px] font-bold transition">${esc(bp.name)}</button>
          `).join('')}
        </div>

        <!-- 实时 SVG 动态管道组装舞台 -->
        <div class="rounded-2xl bg-gradient-to-br from-[#061e1b] via-[#0a2f29] to-[#082521] border border-emerald-400/25 p-3.5 space-y-3 overflow-hidden">
          <div class="flex flex-wrap items-center justify-between gap-2 text-[11px] text-teal-200">
            <div class="flex items-center gap-2"><span class="ai-live-dot"></span><span class="font-extrabold text-white">动态流体管道组装台（已装配 ${mounted.length} 个单元）</span></div>
            <span class="text-[10px] text-emerald-300/90">提示：点击下方标签可调换顺序或移除器皿</span>
          </div>
          <div class="overflow-x-auto custom-scroll pb-1">
            ${mounted.length ? `
              <svg viewBox="0 0 ${svgW} 142" class="w-full h-[142px] min-w-[520px] block select-none">
                ${svgNodes}
              </svg>
            ` : '<div class="h-[110px] flex items-center justify-center text-xs text-teal-200/75 border border-dashed border-teal-500/30 rounded-xl">工作台空置中，请点击下方器皿库自由搭建你的实验装置链...</div>'}
          </div>
          <!-- 已装配单元可调序/移除控制条 -->
          ${mounted.length ? `
            <div class="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/10">
              ${mounted.map((u, idx) => `
                <span class="inline-flex items-center gap-1 px-2 py-1 rounded-xl bg-white/10 border border-white/15 text-[11px] font-bold text-white">
                  <span>${idx + 1}. ${u.icon} ${esc(u.name)}</span>
                  ${idx > 0 ? `<button type="button" data-sb-left="${idx}" class="px-1 text-emerald-300 hover:text-white" title="左移">‹</button>` : ''}
                  ${idx < mounted.length - 1 ? `<button type="button" data-sb-right="${idx}" class="px-1 text-emerald-300 hover:text-white" title="右移">›</button>` : ''}
                  <button type="button" data-sb-del="${idx}" class="px-1 text-rose-300 hover:text-rose-100" title="移除">×</button>
                </span>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <!-- 4 大类 14 种器皿库 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          ${slots.map(sl => `
            <div class="rounded-2xl bg-slate-50/90 border border-slate-200/80 p-3 space-y-2 v9-chart-surface">
              <div class="text-[11px] font-extrabold text-[#0f5c54]">${sl}</div>
              <div class="space-y-1.5">
                ${SANDBOX_UNITS.filter(u => u.slot === sl).map(u => {
                  const active = sbState.chain.includes(u.id);
                  return `
                    <button type="button" data-sb-unit="${u.id}" class="v9-brick-btn w-full text-left p-2 rounded-xl border transition ${active ? 'active' : ''}">
                      <div class="flex items-center justify-between gap-1 text-xs font-extrabold">
                        <span class="truncate">${u.icon} ${esc(u.name)}</span>
                        <span class="text-[10px] opacity-75 shrink-0">${active ? '已装' : '+ 装入'}</span>
                      </div>
                      <div class="text-[10px] opacity-75 line-clamp-1 mt-0.5">${esc(u.short)}</div>
                    </button>
                  `;
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- 实时化学工程可行性分析与深度解析面板 -->
        <div class="rounded-2xl border border-slate-200/90 bg-white/95 p-4 space-y-3 v9-chart-surface">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="text-sm font-extrabold text-slate-900">🔬 装置可行性分析与深度解析</span>
              <span class="px-2.5 py-0.5 rounded-full border text-xs font-extrabold tabular-nums ${analysis.verdictCls}">可行性 ${analysis.score} 分 · ${analysis.verdict}</span>
            </div>
            <span class="text-[11px] text-slate-500">当前校验对象：<strong>${esc(topic ? topic.herb : '薄荷')}</strong></span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            ${[
              ['物理连通性', analysis.connectivity, '#0f5c54'],
              ['热安全系数', analysis.thermalSafety, '#10b981'],
              ['工艺完整度', analysis.completeness, '#0284c7'],
              ['实操可行性', analysis.feasibility, '#d97706']
            ].map(([lbl, val, col]) => `
              <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5 v9-chart-surface">
                <div class="flex justify-between text-[11px] font-bold"><span>${lbl}</span><span class="tabular-nums" style="color:${col}">${val}%</span></div>
                <div class="h-2 rounded-full bg-slate-200/80 overflow-hidden"><div class="h-full rounded-full transition-all duration-300" style="width:${val}%; background:${col}"></div></div>
              </div>
            `).join('')}
          </div>

          <div class="space-y-2 text-xs">
            ${analysis.issues.map(it => `
              <div class="p-2.5 rounded-xl border ${it.level === 'err' ? 'bg-rose-50/90 border-rose-200 text-rose-900' : 'bg-amber-50/90 border-amber-200 text-amber-900'} leading-relaxed font-medium">
                ${esc(it.text)}
              </div>
            `).join('')}
            ${analysis.strengths.map(st => `
              <div class="p-2.5 rounded-xl border bg-emerald-50/85 border-emerald-200 text-emerald-900 leading-relaxed font-medium">
                ${esc(st)}
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- B. 5 阶段互动式实验实操推演器 -->
      <section class="lab-card v9-visual-card rounded-3xl p-4 sm:p-5 space-y-3.5">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2.5">
            <span class="w-8 h-8 rounded-2xl bg-gradient-to-br from-indigo-600 to-emerald-600 text-white flex items-center justify-center text-sm shadow-xs">🎮</span>
            <div>
              <h3 class="text-sm sm:text-base font-extrabold text-slate-900">互动式实验实操推演（亲手按序模拟进实验室）</h3>
              <p class="text-[11px] text-slate-500">依次点击下方 5 个操作按钮完成模拟实操，解锁每一步背后的化学原理解析</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold tabular-nums">完成度 ${flowDoneCount} / 5 (${flowPct}%)</span>
            <button type="button" id="v10BtnResetFlow" class="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold">重新推演</button>
          </div>
        </div>

        <div class="h-2 rounded-full bg-slate-200/80 overflow-hidden">
          <div class="h-full bg-gradient-to-r from-[#0a3630] via-emerald-500 to-amber-400 transition-all duration-400" style="width:${flowPct}%"></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-5 gap-2.5">
          ${INTERACTIVE_FLOW_STEPS.map(st => {
            const done = sbState.doneFlow.includes(st.id);
            return `
              <button type="button" data-v10-flow="${st.id}" class="v10-flow-card text-left p-3 rounded-2xl border transition ${done ? 'done' : ''}">
                <div class="flex items-center justify-between gap-1 text-[11px] font-extrabold">
                  <span>${esc(st.title)}</span>
                  <span>${done ? '✅' : '▶'}</span>
                </div>
                <div class="text-[11px] font-bold mt-1.5 opacity-90">${esc(st.action)}</div>
                <div class="text-[10px] mt-1.5 leading-relaxed ${done ? 'opacity-90' : 'opacity-65'}">${done ? '💡 ' + esc(st.explain) : '点击模拟执行此操作并查看解析'}</div>
              </button>
            `;
          }).join('')}
        </div>
      </section>
    `;

    // 绑定所有交互事件
    mountEl.querySelectorAll('[data-sb-unit]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.sbUnit;
        if (sbState.chain.includes(id)) sbState.chain = sbState.chain.filter(x => x !== id);
        else sbState.chain.push(id);
        renderSandboxInto(mountEl, topic, ws);
      });
    });
    mountEl.querySelectorAll('[data-sb-bp]').forEach(btn => {
      btn.addEventListener('click', () => {
        const bp = SANDBOX_BLUEPRINTS.find(x => x.id === btn.dataset.sbBp);
        if (bp) { sbState.chain = bp.units.slice(); renderSandboxInto(mountEl, topic, ws); }
      });
    });
    mountEl.querySelectorAll('[data-sb-left]').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.sbLeft);
        if (i > 0) { const tmp = sbState.chain[i - 1]; sbState.chain[i - 1] = sbState.chain[i]; sbState.chain[i] = tmp; renderSandboxInto(mountEl, topic, ws); }
      });
    });
    mountEl.querySelectorAll('[data-sb-right]').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.sbRight);
        if (i < sbState.chain.length - 1) { const tmp = sbState.chain[i + 1]; sbState.chain[i + 1] = sbState.chain[i]; sbState.chain[i] = tmp; renderSandboxInto(mountEl, topic, ws); }
      });
    });
    mountEl.querySelectorAll('[data-sb-del]').forEach(btn => {
      btn.addEventListener('click', () => {
        sbState.chain.splice(Number(btn.dataset.sbDel), 1);
        renderSandboxInto(mountEl, topic, ws);
      });
    });
    const clearBtn = mountEl.querySelector('#v10BtnClearSb');
    if (clearBtn) clearBtn.addEventListener('click', () => { sbState.chain = []; renderSandboxInto(mountEl, topic, ws); });

    const autoFixBtn = mountEl.querySelector('#v10BtnAutoFix');
    if (autoFixBtn) autoFixBtn.addEventListener('click', () => {
      analysis.issues.forEach(it => {
        if (it.fixAction) {
          const bp = SANDBOX_BLUEPRINTS.find(x => x.id === it.fixAction);
          if (bp) sbState.chain = bp.units.slice();
        } else if (it.fixSwap) {
          const [oldId, newId] = it.fixSwap;
          sbState.chain = sbState.chain.map(x => x === oldId ? newId : x);
        } else if (it.fixAdd && !sbState.chain.includes(it.fixAdd)) {
          sbState.chain.push(it.fixAdd);
        }
      });
      // 去重
      sbState.chain = Array.from(new Set(sbState.chain));
      renderSandboxInto(mountEl, topic, ws);
    });

    mountEl.querySelectorAll('[data-v10-flow]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.v10Flow;
        if (!sbState.doneFlow.includes(id)) sbState.doneFlow.push(id);
        renderSandboxInto(mountEl, topic, ws);
      });
    });
    const resetFlowBtn = mountEl.querySelector('#v10BtnResetFlow');
    if (resetFlowBtn) resetFlowBtn.addEventListener('click', () => { sbState.doneFlow = []; renderSandboxInto(mountEl, topic, ws); });
  }

  function ensureSandboxMount(panelId, mountId) {
    const panel = document.getElementById(panelId);
    if (!panel) return null;
    let m = document.getElementById(mountId);
    if (!m) {
      m = document.createElement('div');
      m.id = mountId;
      m.className = 'space-y-5';
      panel.appendChild(m);
    }
    return m;
  }

  window.TCM_V10_SANDBOX = {
    V10_EXTRA_RIGS,
    sync: function (topic, ws, stats, step) {
      try {
        if (step === 4) {
          const m4 = ensureSandboxMount('wpanel-4', 'v10SandboxMountStep4');
          renderSandboxInto(m4, topic, ws);
        } else if (step === 'hub') {
          const mHub = ensureSandboxMount('wpanel-hub', 'v10SandboxMountHub');
          renderSandboxInto(mHub, topic, ws);
        }
      } catch (err) {
        console.error('TCM_V10_SANDBOX error:', err);
      }
    }
  };
})();
