/* ============================================================================
 * 本草智研 · 中药药学研究与小试—中试产业转化训练引擎 (lab-v18-translation.js)
 * 主线：产品定位 → 药材与炮制 → 提取纯化 → 浓缩干燥 → 制剂成型 → 质量评价 → 中试放大 → 注册与转化
 * 严格遵循无痕运行原则：会话内实时演算，刷新页面不留历史进度痕迹；每项数据明确标注来源。
 * ============================================================================ */
(function () {
  'use strict';

  const D = () => window.TCM_V18_DATA || null;
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
  const num = (v, fb = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fb;
  };
  const round = (v, d = 2) => {
    const f = Math.pow(10, d);
    return Math.round(num(v) * f) / f;
  };

  // ---------------- 9维综合工艺最优指标定义 ----------------
  const ROUTE_DIMS = [
    { key: 'transfer', label: '指标成分转移率', desc: '目标活性成分从药材向浸膏的转移效率' },
    { key: 'yieldFit', label: '浸膏得率匹配度', desc: '得率与后续载药量、标准汤剂/处方要求的契合度' },
    { key: 'stability', label: '成分稳定性', desc: '热敏/光敏/易挥发成分是否降解或异常转化' },
    { key: 'repro', label: '批间重现性', desc: '三批小试及放大过程中的波动可控程度' },
    { key: 'energy', label: '工时与能耗', desc: '单批生产周期、蒸汽与电力负荷' },
    { key: 'cost', label: '溶剂消耗与成本', desc: '溶剂单耗、回收难度与综合制造成本' },
    { key: 'operability', label: '过滤浓缩可操作性', desc: '固液分离、浓缩防结焦、干燥流动性等工程顺畅度' },
    { key: 'green', label: '安全与绿色化', desc: '防爆防火压力、废液环保与职业健康安全' },
    { key: 'formFit', label: '制剂成型适配度', desc: '浸膏粘性、吸湿性与目标剂型成型的匹配度' }
  ];

  const WEIGHT_PRESETS = {
    balanced: { name: '均衡生产（推荐）', w: { transfer: 4, yieldFit: 3, stability: 4, repro: 4, energy: 3, cost: 3, operability: 4, green: 3, formFit: 4 } },
    scaleup: { name: '中试放大优先', w: { transfer: 3, yieldFit: 3, stability: 4, repro: 5, energy: 4, cost: 4, operability: 5, green: 4, formFit: 4 } },
    green: { name: '安全绿色低成本', w: { transfer: 3, yieldFit: 3, stability: 3, repro: 3, energy: 5, cost: 5, operability: 4, green: 5, formFit: 3 } },
    rd: { name: '早期研发高转移', w: { transfer: 5, yieldFit: 4, stability: 4, repro: 3, energy: 2, cost: 2, operability: 2, green: 2, formFit: 3 } }
  };

  const EVIDENCE_ITEMS = [
    { id: 'ev_origin', name: '药材基原、产地与饮片标准', stage: 'herb' },
    { id: 'ev_proc', name: '炮制／前处理对照与成分变化依据', stage: 'herb' },
    { id: 'ev_route', name: '提取纯化多路线对比与关键工艺参数', stage: 'extract' },
    { id: 'ev_dry', name: '浓缩干燥热稳定与粉体性质评估', stage: 'dry' },
    { id: 'ev_form', name: '剂型选择依据与小试处方成型数据', stage: 'form' },
    { id: 'ev_qc', name: '全过程质量标准草案、指纹图谱与稳定性计划', stage: 'quality' },
    { id: 'ev_batch', name: '三批小试复现与非线性中试物料衡算', stage: 'scale' },
    { id: 'ev_eff', name: '药效／安全评价对照方案与人用经验梳理', stage: 'quality' }
  ];

  // ---------------- 会话内存状态（无痕重置，不持久化旧进度） ----------------
  const state = {
    projectId: 'danshen',
    dynamicProjects: {},
    stage: 'position',
    qualitySub: 'matrix',     // 'matrix' | 'batch' | 'efficacy'
    scaleSub: 'mass',         // 'mass' | 'deviation' | 'fmea'
    pathId: 'improved',
    positionForm: {
      clinicalNeed: '',
      population: '成人为主，需长期或疗程服用',
      targetForm: '颗粒剂 / 硬胶囊',
      adminRoute: '口服',
      humanExp: '已有传统用药或临床应用基础，待系统整理'
    },
    procSelected: {},
    procCustomNote: '净制除杂、润切厚片、按干品折算投料，控制干燥温度 ≤ 60 ℃。',
    procUserData: {},         // { optId: { yield: number, marker: number } }
    routeWeights: Object.assign({}, WEIGHT_PRESETS.balanced.w),
    routePreset: 'balanced',
    selectedRouteId: '',
    dryCfg: {
      concMethod: 'vacuum',   // 'atm' | 'vacuum' | 'thinfilm'
      concTemp: 60,
      concHours: 2.0,
      dryMethod: 'vacuum',    // 'vacuum' | 'spray' | 'freeze' | 'oven'
      dryTemp: 60,
      dryHours: 4.0,
      avoidLight: true
    },
    dosageInput: null,
    selectedFormId: 'granule',
    excipientRatio: 35,       // 辅料占比 %
    batchRows: [],            // editable copy of project.batch
    batchEdited: false,
    similarity: [],
    scaleCfg: {
      batchKg: 10,
      moisturePct: 10,
      recoverPct: 80,
      marcHold: 1.4,          // 药渣吸液倍数 (L/kg 干药材)
      filterLossPct: 4,
      herbPrice: 60,
      ethanolPrice: 7.0
    },
    devId: 'yield',
    devClues: {},
    devAiReply: '',
    devAiLoading: false,
    fmeaRows: [],
    benchmarkDone: {},
    evidenceLevels: {
      ev_origin: 2,
      ev_proc: 1,
      ev_route: 2,
      ev_dry: 1,
      ev_form: 1,
      ev_qc: 1,
      ev_batch: 1,
      ev_eff: 1
    },
    regModalOpen: false,
    reportModalOpen: false
  };

  function srcBadge(type, customLabel) {
    const data = D();
    const meta = (data && data.SOURCES && data.SOURCES[type]) || { label: type, tone: 'example', tip: '' };
    const text = customLabel || meta.label;
    return `<span class="tr-src tr-src-${esc(meta.tone)}" title="${esc(meta.tip)}">${esc(text)}</span>`;
  }

  function getProject() {
    const data = D();
    if (!data) return null;
    if (data.PROJECTS[state.projectId]) return data.PROJECTS[state.projectId];
    if (state.dynamicProjects[state.projectId]) return state.dynamicProjects[state.projectId];
    return data.PROJECTS.danshen;
  }

  // 把题库中任意 119 项药材动态映射为完整的 8 阶段产业转化课题
  function buildDynamicProject(topic) {
    const herb = topic.herb || '自定义药材';
    const comp = topic.compound || '目标活性成分';
    const cat = topic.category || '中药活性成分';
    const isVolatile = /挥发油|萜|薄荷|丁香|肉桂|当归|川芎|紫苏|广藿香|荆芥|细辛/.test(herb + comp + cat);
    const isSugar = /多糖|糖|黄芪|枸杞|茯苓|灵芝|党参/.test(herb + comp + cat);
    const isAlk = /生物碱|小檗碱|麻黄|苦参|延胡索|防己|洋金花|乌头|附子/.test(herb + comp + cat);
    const isThermo = /酚酸|苷|黄酮|挥发油|酯|内酯|丹参|黄芩|金银花|连翘/.test(herb + comp + cat);
    const std = topic.pharmacopoeia || '以《中国药典》2025 年版正文规定为准';
    const yieldEst = isVolatile ? 1.2 : (isSugar ? 28 : 22);

    return {
      id: 'bank_' + (topic.id || herb),
      fromBank: true,
      bankTopicId: topic.id || '',
      herb,
      latin: topic.latin || '以《中国药典》2025 年版基原核对为准',
      badge: '题库导入课题',
      focus: `${cat} · 产业转化训练`,
      title: `${herb}（${comp}）· 药学研究与小试转化`,
      claim: topic.efficacy || topic.title || `围绕${herb}传统功效与目标成分开展药学研究与小试转化设计。`,
      source: topic.source || `${herb}干燥药用部位（实际立项请按《中国药典》2025 年版正文核对基原、采收期与药用部位）。`,
      regions: topic.origin || '建议固定 1～2 个道地产区并建立三批以上药材质量基线。',
      markers: [
        { key: 'm1', name: comp, type: cat, limit: std, default: isVolatile ? 1.0 : 2.5, k90: isVolatile ? 0.70 : (isThermo ? 0.14 : 0.04), ea: isVolatile ? 42 : 55, light: /醌|酮|蒽醌|香豆素/.test(cat + comp), volatile: isVolatile },
        { key: 'm2', name: '浸膏得率／特征峰组', type: '整体质控指标', limit: '按三批小试范围设定', default: yieldEst, k90: 0.02, ea: 50, light: false, volatile: false }
      ],
      herbQc: [
        { item: '性状、显微、薄层鉴别', limit: '应符合《中国药典》2025 年版规定', src: 'pharm' },
        { item: '水分、总灰分、酸不溶性灰分', limit: '按药材正文限度复核', src: 'pharm' },
        { item: '目标成分含量参考', limit: std, src: topic.pharmacopoeia ? 'pharm' : 'lit' },
        { item: '重金属、农残及真菌毒素（如适用）', limit: '按通则 2321 / 2341 / 2351 执行', src: 'pharm' }
      ],
      processing: {
        intro: `结合${herb}（${cat}）理化特点，建议设置生品、规范净制干燥品及炮制品（如炒、炙、蒸）对照，避免只凭文献假设炮制影响。`,
        options: [
          { id: 'raw', name: `生${herb}（低温干燥对照）`, desc: '保留原料本底组成，作为基准对照组。', effects: [{ m: comp, t: '≈', n: '基准对照' }] },
          { id: 'proc', name: isAlk ? `${herb}醋炙／炮制品` : (isThermo ? `${herb}低温可控加工品` : `${herb}规范炮制品`), desc: '模拟炮制对成分溶出、转化及减毒增效的影响。', effects: [{ m: comp, t: isAlk ? '↑' : '≈／↑', n: '需结合平行对照实测确认' }] },
          { id: 'hot', name: '高温烘干（> 80 ℃ 反面对照）', desc: '考察过度受热引起的降解或挥发损失。', effects: [{ m: comp, t: isThermo || isVolatile ? '↓↓' : '↓', n: '评估热敏／挥发风险边界' }] }
        ]
      },
      routes: [
        { id: 'primary', name: topic.method ? `推荐路线：${topic.method}` : `${herb}常规优化提取路线`, desc: topic.routeSummary || `结合${comp}（${cat}）溶解与稳定性特征设计的主路线。`, s: { transfer: 8, yieldFit: 8, stability: 7, repro: 8, energy: 6, cost: 7, operability: 7, green: 7, formFit: 7 } },
        { id: 'water', name: '传统水煎提取（2 次）', desc: '设备通用、成本低、绿色安全；脂溶性或热敏成分转移率可能偏低。', s: { transfer: isVolatile || isAlk ? 5 : 7, yieldFit: 7, stability: isThermo ? 5 : 8, repro: 8, energy: 6, cost: 9, operability: 8, green: 9, formFit: 6 } },
        { id: 'eth', name: '醇提回流（70% 乙醇 2 次）', desc: '杂质相对较少、得率更集中；需防爆及乙醇回收，成本高于水提。', s: { transfer: 8, yieldFit: 7, stability: 7, repro: 8, energy: 6, cost: 6, operability: 7, green: 6, formFit: 8 } },
        { id: 'assist', name: '超声／微波辅助提取（小试对比）', desc: '小试耗时短、表观转移率高；放大设备匹配与能耗往往制约产业化。', s: { transfer: 9, yieldFit: 7, stability: 8, repro: 6, energy: 4, cost: 5, operability: 3, green: 6, formFit: 7 } }
      ],
      scaleStages: isVolatile
        ? [{ name: '水蒸气蒸馏／挥发油收集', solvent: 'water', label: '水（蒸汽）', ratios: [10], hours: [3.5], temp: 100, eff: { m1: 0.78, m2: 0.75 } }]
        : [{ name: '主提取工艺（2 次）', solvent: /水/.test(topic.solvent || '') ? 'water' : 'ethanol', label: topic.solvent || '70% 乙醇', ratios: [8, 6], hours: [1.5, 1.0], temp: 80, eff: { m1: 0.62, m2: 0.70 } }],
      extractYield: yieldEst,
      herbPrice: 45,
      dosagePreset: {
        volatile: isVolatile ? 3 : 1,
        solubility: isSugar ? 3 : (isVolatile ? 1 : 2),
        thermo: isThermo ? 1 : 2,
        hygro: isSugar ? 3 : 2,
        daily: isVolatile ? 0.3 : 2.2,
        bitter: isAlk ? 3 : 2,
        population: 'adult',
        onset: 'normal',
        route: 'oral'
      },
      qcMatrix: [
        { level: '药材／饮片', items: [['性状、显微、薄层鉴别', '应符合药典规定', 'pharm'], ['水分与灰分', '按 2025 年版正文核对', 'pharm'], [comp, std, topic.pharmacopoeia ? 'pharm' : 'lit']] },
        { level: '中间体（提取液／浸膏）', items: [['清膏相对密度', '按工艺验证范围控制', 'lit'], [`${comp}转移率`, '建议建立三批转移率上下限', 'calc'], ['残溶（若用有机溶剂）', '按通则 0861 控制', 'pharm']] },
        { level: '成品', items: [['特征／指纹图谱相似度', '通常以 ≥ 0.90 作为研究参考', 'lit'], [`${comp}含量测定`, '按标准草案控制', 'calc'], ['水分与微生物限度', '按剂型通则与 1105～1107 执行', 'pharm']] }
      ],
      batch: [
        { name: '浸膏得率', unit: '%', vals: [round(yieldEst * 0.97, 1), round(yieldEst * 1.03, 1), round(yieldEst * 0.99, 1)], rsd: 5 },
        { name: comp, unit: 'mg/g', vals: [42.5, 44.1, 40.8], rsd: 5 },
        { name: '水分', unit: '%', vals: [4.9, 5.4, 5.1], rsd: 15 }
      ],
      similarity: [0.96, 0.94, 0.95],
      efficacy: {
        aim: `围绕${herb}功能主治，将“${comp}及整体指纹图谱变化”与药效、安全性指标关联评价。`,
        tree: [
          { g: '体外筛选', items: ['抗氧化／抗炎／靶点活性快筛', '不同工艺样品平行量效比较'] },
          { g: '体内药效', items: ['对应证候／适应症动物模型核心药效指标', '组织病理或生化标志物'] },
          { g: '安全性', items: ['急性毒性／最大给药量观察', '关键脏器及潜在不良反应监测'] }
        ],
        controls: [
          ['阴性对照', '溶媒或模型对照组'],
          ['阳性对照', '公认阳性药或已上市同类品种'],
          ['工艺对照', '传统水煎物与优化工艺提取物（等生药量给药）'],
          ['剂量组', '低、中、高三个剂量组']
        ]
      },
      risks: [
        { item: '原料批间波动', fail: '产地或采收期不一', eff: '收率与含量漂移', S: 4, O: 3, D: 2, ctl: '固定产地、入厂含量与指纹图谱验收' },
        { item: '提取与浓缩受热', fail: '温度过高或受热过久', eff: '活性成分降解或挥发', S: 4, O: 3, D: 3, ctl: '减压低温浓缩，设定温度与时长上限' },
        { item: '干燥与包装', fail: '水分偏高或吸湿', eff: '结块、含量下降、微生物超标', S: 3, O: 3, D: 2, ctl: '设定干燥终点水分，选用防潮包材' }
      ],
      benchmark: [
        { stage: 'herb', title: '药材基原与产地基线', points: ['按 2025 年版药典核对基原与检查项', '收集三批药材建立含量与水分基线'], out: '药材质量档案' },
        { stage: 'herb', title: '前处理与炮制对照', points: ['按干品折算投料', '生品与炮制／干燥条件对照'], out: '炮制工艺卡' },
        { stage: 'extract', title: '多路线综合工艺对比', points: ['对比转移率、能耗、过滤与成型适配度', '确定关键工艺参数'], out: '工艺路线评价表' },
        { stage: 'dry', title: '浓缩干燥条件验证', points: ['评估受热降解、挥发与吸湿风险'], out: '浓缩干燥记录' },
        { stage: 'form', title: '剂型选择与小试处方', points: ['按日剂量与理化性质确定剂型与辅料'], out: '小试处方单' },
        { stage: 'quality', title: '分级质控与三批复现', points: ['指纹图谱＋多指标含量＋三批 RSD 核查'], out: '质量标准草案' },
        { stage: 'scale', title: '中试放大与风险评估', points: ['非线性物料衡算、设备选型与偏差排查'], out: '中试放大清单' },
        { stage: 'register', title: '输出研究与转化报告', points: ['汇总数据来源与证据缺口清单'], out: '《药学研究与小试转化报告》' }
      ]
    };
  }

  function loadProjectState(proj) {
    if (!proj) return;
    state.positionForm = {
      clinicalNeed: proj.claim || '',
      population: proj.id === 'bohe' ? '成人及青少年，需快速清利咽喉或局部舒缓' : '成人为主，需按疗程规范使用',
      targetForm: proj.id === 'bohe' ? '软胶囊 / 包合物颗粒 / 外用凝胶' : (proj.id === 'huangqin' ? '硬胶囊 / 薄膜衣片' : '颗粒剂 / 硬胶囊'),
      adminRoute: proj.dosagePreset?.route === 'topical' ? '外用' : '口服',
      humanExp: '已有传统用药基础，待按规范整理临床使用与人用经验资料'
    };
    state.procSelected = {};
    (proj.processing?.options || []).slice(0, 3).forEach((o) => { state.procSelected[o.id] = true; });
    state.procUserData = {};
    state.selectedRouteId = (proj.routes && proj.routes[1] && proj.id === 'danshen') ? proj.routes[1].id : (proj.routes?.[0]?.id || '');
    state.dryCfg = {
      concMethod: 'vacuum',
      concTemp: proj.id === 'bohe' ? 45 : 60,
      concHours: 2.0,
      dryMethod: proj.id === 'bohe' ? 'freeze' : 'vacuum',
      dryTemp: proj.id === 'bohe' ? 40 : 60,
      dryHours: 4.0,
      avoidLight: proj.id === 'danshen' || proj.id === 'huangqin'
    };
    state.dosageInput = Object.assign({
      volatile: 1, solubility: 2, thermo: 2, hygro: 2, daily: 2.0, bitter: 2, population: 'adult', onset: 'normal', route: 'oral'
    }, proj.dosagePreset || {});
    const rankedForms = rankDosageForms(state.dosageInput);
    state.selectedFormId = rankedForms[0]?.form.id || 'granule';
    state.excipientRatio = state.selectedFormId === 'softcap' ? 40 : (state.selectedFormId === 'capsule' ? 25 : 35);
    state.batchRows = (proj.batch || []).map((b) => ({
      name: b.name,
      unit: b.unit,
      vals: b.vals.slice(),
      rsd: b.rsd,
      isUser: false
    }));
    state.batchEdited = false;
    state.similarity = (proj.similarity || [0.96, 0.95, 0.94]).slice();
    state.scaleCfg = {
      batchKg: 10,
      moisturePct: 10,
      recoverPct: 80,
      marcHold: 1.4,
      filterLossPct: 4,
      herbPrice: proj.herbPrice || 50,
      ethanolPrice: 7.0
    };
    state.fmeaRows = (proj.risks || []).map((r, i) => Object.assign({ id: 'r_' + i }, r));
    state.benchmarkDone = {};
    state.devClues = {};
    state.devAiReply = '';
  }

  // ---------------- 核心算法 1：综合工艺多目标评分 ----------------
  function scoreRoutes(proj) {
    const routes = proj.routes || [];
    const totalW = ROUTE_DIMS.reduce((s, d) => s + num(state.routeWeights[d.key], 0), 0) || 1;
    return routes.map((r) => {
      let weighted = 0;
      ROUTE_DIMS.forEach((d) => {
        weighted += num(r.s[d.key], 5) * num(state.routeWeights[d.key], 0);
      });
      const score = round((weighted / (totalW * 10)) * 100, 1);
      const weaknesses = ROUTE_DIMS.filter((d) => num(r.s[d.key], 5) <= 4).map((d) => d.label);
      return { route: r, score, transferScore: num(r.s.transfer, 5) * 10, weaknesses };
    }).sort((a, b) => b.score - a.score);
  }

  // ---------------- 核心算法 2：浓缩干燥热力学/挥发保留率估算 ----------------
  function calcDryRetention(proj) {
    const c = state.dryCfg;
    const concFactor = c.concMethod === 'thinfilm' ? 0.55 : (c.concMethod === 'vacuum' ? 0.85 : 1.25);
    const dryFactor = c.dryMethod === 'freeze' ? 0.15 : (c.dryMethod === 'spray' ? 0.35 : (c.dryMethod === 'vacuum' ? 0.75 : 1.15));
    const R = 8.314;

    const results = (proj.markers || []).map((m) => {
      const ea = num(m.ea, 55) * 1000;
      const k90 = num(m.k90, 0.08);
      const rateAt = (tempC) => k90 * Math.exp((ea / R) * (1 / 363.15 - 1 / (num(tempC, 60) + 273.15)));
      let lossConc = rateAt(c.concTemp) * num(c.concHours, 1) * concFactor;
      let lossDry = rateAt(c.dryTemp) * num(c.dryHours, 1) * dryFactor;
      if (m.volatile) {
        if (c.concMethod === 'atm') lossConc += 0.45;
        else if (c.concMethod === 'vacuum') lossConc += 0.25;
        if (c.dryMethod === 'oven' || c.dryMethod === 'spray') lossDry += 0.35;
        else if (c.dryMethod === 'freeze') lossDry *= 0.35;
      }
      if (m.light && !c.avoidLight) {
        lossConc += 0.08;
        lossDry += 0.10;
      }
      const retainConc = Math.max(12, Math.min(99.5, Math.exp(-lossConc) * 100));
      const retainTotal = Math.max(8, Math.min(99.2, Math.exp(-(lossConc + lossDry)) * 100));
      return {
        marker: m,
        retainConc: round(retainConc, 1),
        retainTotal: round(retainTotal, 1),
        risk: retainTotal < 75 ? 'high' : (retainTotal < 88 ? 'mid' : 'low')
      };
    });

    const powderRisk = c.dryMethod === 'spray'
      ? '粒径较细、比表面积大，若含糖/酚酸较多易吸湿粘壁，建议添加助流/防潮辅料或干法制粒。'
      : (c.dryMethod === 'freeze'
        ? '多孔疏松、复溶性佳，但极易吸湿结块，出料与分装需在低湿环境完成。'
        : (c.dryMethod === 'oven'
          ? '受热时间长，易结硬块且粉碎耗时，热敏成分降解风险偏高。'
          : '真空低温干燥块状较疏松，粉碎过筛后可结合干法/湿法制粒改善流动性。'));

    return { results, powderRisk };
  }

  // ---------------- 核心算法 3：剂型选择决策器 ----------------
  function rankDosageForms(inp) {
    const data = D();
    if (!data) return [];
    const daily = num(inp.daily, 2);
    return data.DOSAGE_FORMS.map((f) => {
      let score = 60;
      const reasons = [];
      const cautions = [];

      // 给药途径硬约束
      if (inp.route === 'topical' && f.route !== 'topical') {
        score -= 45;
        cautions.push('给药途径不匹配（当前选择外用）');
      } else if (inp.route === 'oral' && f.route !== 'oral') {
        score -= 45;
        cautions.push('给药途径不匹配（当前选择口服）');
      } else {
        score += 12;
      }

      // 挥发性
      if (inp.volatile === 3) {
        if (f.id === 'softcap') { score += 22; reasons.push('油性密闭囊壳最利于减少挥发油逸散'); }
        else if (f.id === 'gel' || f.id === 'patch') { score += 14; reasons.push('外用透皮体系可利用挥发油促渗特性'); }
        else if (f.id === 'granule' || f.id === 'capsule') { score += 4; cautions.push('须先进行 β-环糊精包合或微囊固化'); }
        else if (f.id === 'tablet') { score -= 12; cautions.push('压片与烘干环节挥发油损失显著'); }
        else if (f.id === 'liquid') { score -= 8; cautions.push('油水易分层，需增溶剂并考察乳化稳定性'); }
      }

      // 溶解性 (1 难溶/脂溶, 2 兼顾/中等, 3 易溶/水溶)
      if (inp.solubility === 1) {
        if (f.id === 'softcap' || f.id === 'pill') { score += 14; reasons.push('有助于脂溶或难溶性成分分散与溶出'); }
        if (f.id === 'liquid') { score -= 18; cautions.push('难溶成分在口服液中易析出沉淀'); }
      } else if (inp.solubility === 3) {
        if (f.id === 'granule' || f.id === 'liquid') { score += 12; reasons.push('水溶性良好，冲溶或澄清度易控制'); }
        if (f.id === 'softcap') { score -= 22; cautions.push('水溶性浸膏不适用于油性软胶囊内容物'); }
      } else {
        if (f.id === 'granule' || f.id === 'capsule' || f.id === 'tablet') { score += 8; reasons.push('适配脂水双提合并浸膏'); }
      }

      // 日服剂量 (g/d)
      if (daily > 3.0) {
        if (f.id === 'granule') { score += 18; reasons.push(`日服提取物 ${daily} g，颗粒剂载药空间充裕`); }
        else if (f.id === 'liquid') { score += 10; reasons.push('合剂/口服液可承载较高生药量'); }
        else if (f.id === 'pill') { score -= 30; cautions.push('日服量过大，滴丸单丸载药量小不适用'); }
        else if (f.id === 'capsule') { score -= 12; cautions.push('折合 0 号胶囊日服粒数偏多，影响依从性'); }
        else if (f.id === 'tablet') { score -= 10; cautions.push('大片剂或日服片数过多，吞咽不便'); }
      } else if (daily <= 0.6) {
        if (f.id === 'pill' || f.id === 'softcap' || f.id === 'capsule') { score += 14; reasons.push('小剂量高效部位适合高精密固体制剂'); }
      } else {
        if (f.id === 'capsule' || f.id === 'tablet' || f.id === 'granule') { score += 10; reasons.push('中等日服剂量，常规口服固体制剂适配度高'); }
      }

      // 苦味/异味 (1 轻, 2 中, 3 重)
      if (inp.bitter === 3) {
        if (f.id === 'capsule' || f.id === 'tablet') { score += 14; reasons.push('囊壳或薄膜包衣可有效掩盖苦味'); }
        if (f.id === 'granule' || f.id === 'liquid') { score -= 10; cautions.push('苦味明显，需重点做矫味处方筛选'); }
      }

      // 引湿性 (1 低, 2 中, 3 高)
      if (inp.hygro === 3) {
        if (f.id === 'tablet') { score += 6; reasons.push('薄膜包衣可提供一定防潮屏障'); }
        if (f.id === 'granule') { score -= 8; cautions.push('引湿性强，须配防潮辅料与铝塑复合膜'); }
        if (f.id === 'capsule') { score -= 6; cautions.push('内容物吸湿可能导致明胶囊壳变脆或软化'); }
      }

      // 热敏性 (1 敏感, 2 中等, 3 稳定)
      if (inp.thermo === 1) {
        if (f.id === 'capsule' || f.id === 'granule') { score += 4; reasons.push('可采用干法制粒或低温干燥降低受热'); }
        if (f.id === 'liquid') { score -= 10; cautions.push('终端湿热灭菌易造成热敏成分降解'); }
      }

      // 人群
      if (inp.population === 'child_elder') {
        if (f.id === 'granule' || f.id === 'liquid') { score += 14; reasons.push('便于儿童及吞咽困难老人服用'); }
        if (f.id === 'capsule' || f.id === 'tablet') { score -= 10; cautions.push('儿童/老年群体吞咽大号胶囊或片剂难度较高'); }
      }

      // 起效要求
      if (inp.onset === 'fast') {
        if (f.id === 'pill' || f.id === 'liquid') { score += 10; reasons.push('溶散快或溶液态，利于快速起效'); }
      }

      const finalScore = Math.max(10, Math.min(98, Math.round(score)));
      return { form: f, score: finalScore, reasons, cautions };
    }).sort((a, b) => b.score - a.score);
  }

  // ---------------- 核心算法 4：三批统计 ----------------
  function calcBatchStats(vals) {
    const arr = vals.map((v) => num(v, 0));
    const n = arr.length || 1;
    const mean = arr.reduce((a, b) => a + b, 0) / n;
    const variance = n > 1 ? arr.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / (n - 1) : 0;
    const sd = Math.sqrt(variance);
    const rsd = mean !== 0 ? (sd / Math.abs(mean)) * 100 : 0;
    const range = Math.max(...arr) - Math.min(...arr);
    return { mean: round(mean, 2), sd: round(sd, 3), rsd: round(rsd, 2), range: round(range, 2) };
  }

  // ---------------- 核心算法 5：非线性中试放大物料衡算 ----------------
  function calcScaleUp(proj) {
    const data = D();
    const cfg = state.scaleCfg;
    const batchKg = Math.max(0.1, num(cfg.batchKg, 10));
    const dryHerbKg = batchKg * (1 - num(cfg.moisturePct, 10) / 100);
    const scaleFactor = batchKg / 0.1; // 相对 100g 小试倍数
    const areaVolumeFactor = Math.pow(scaleFactor, 1 / 3); // 体积/传热面比值随规模呈 1/3 次方增长

    let totalWaterL = 0;
    let totalEthanolL = 0;
    let totalExtractH = 0;
    let totalHeatUpH = 0;
    let maxTankVolL = 0;

    const stageRows = (proj.scaleStages || []).map((st) => {
      const solMeta = data.SOLVENTS[st.solvent] || data.SOLVENTS.water;
      const sumRatio = (st.ratios || [8]).reduce((a, b) => a + b, 0);
      const maxRatio = Math.max(...(st.ratios || [8]));
      const solL = dryHerbKg * sumRatio;
      const peakL = dryHerbKg * (maxRatio + 1.2); // 药材体积 + 单次最大液量
      const tankRecL = Math.ceil((peakL / 0.7) / 10) * 10; // 70% 装液系数
      if (tankRecL > maxTankVolL) maxTankVolL = tankRecL;

      if (st.solvent === 'ethanol') totalEthanolL += solL;
      else totalWaterL += solL;

      const baseHoldH = (st.hours || [1.5]).reduce((a, b) => a + b, 0);
      const heatUpH = round(0.18 * (st.ratios || [8]).length * areaVolumeFactor, 2); // 规模越大升温越慢
      totalHeatUpH += heatUpH;
      totalExtractH += baseHoldH + heatUpH;

      const marcRetainL = round(dryHerbKg * num(cfg.marcHold, 1.4), 2);
      const netFiltrateL = Math.max(0, round(solL - marcRetainL, 2));
      const recoveredL = solMeta.recover ? round(netFiltrateL * (num(cfg.recoverPct, 80) / 100), 2) : 0;
      const netLossL = round(solL - recoveredL, 2);

      return {
        name: st.name,
        label: st.label,
        solvent: st.solvent,
        solL: round(solL, 2),
        marcRetainL,
        netFiltrateL,
        recoveredL,
        netLossL,
        tankRecL,
        baseHoldH: round(baseHoldH, 2),
        heatUpH
      };
    });

    const grossExtractKg = dryHerbKg * (num(proj.extractYield, 25) / 100);
    const netExtractKg = round(grossExtractKg * (1 - num(cfg.filterLossPct, 4) / 100), 3);
    const concVolL = stageRows.reduce((s, r) => s + r.netFiltrateL, 0);
    const concHoursEst = round(Math.max(1.2, 0.9 * Math.pow(scaleFactor, 0.36)), 1);
    const totalSolventL = round(totalWaterL + totalEthanolL, 2);
    const totalRecoverL = round(stageRows.reduce((s, r) => s + r.recoveredL, 0), 2);
    const netEthanolConsumeL = round(Math.max(0, totalEthanolL - totalRecoverL), 2);

    // 成本估算（示例单价，可在页面修改）
    const herbCost = round(batchKg * num(cfg.herbPrice, 50), 1);
    const solventCost = round(netEthanolConsumeL * num(cfg.ethanolPrice, 7) + totalWaterL * 0.015, 1);
    const energyCost = round((concVolL * 0.65 + totalExtractH * 8) * (batchKg >= 10 ? 0.55 : 0.9), 1);
    const totalDirectCost = round(herbCost + solventCost + energyCost, 1);
    const costPerKgExtract = netExtractKg > 0 ? round(totalDirectCost / netExtractKg, 1) : 0;

    // 非线性工程建议
    const filterAdvice = batchKg <= 0.5
      ? '布氏漏斗真空抽滤（小试）'
      : (batchKg <= 5 ? '不锈钢袋式过滤或小型三足离心机' : '板框压滤机或卧螺沉降离心机（需评估滤饼含液率与洗渣）');
    const concAdvice = batchKg <= 1
      ? '旋转蒸发仪减压浓缩（≤ 60 ℃）'
      : (batchKg <= 20 ? '外循环单效／双效减压浓缩器（≤ 60 ℃）' : '降膜／薄膜减压浓缩（显著缩短热敏成分受热时间）');
    const thermalWarn = concHoursEst >= 4.0
      ? `放大至 ${batchKg} kg 后，预计浓缩受热时长增至约 ${concHoursEst} h，请按实际升温+浓缩总时长核查热敏成分降解率，勿直接沿用小试时间。`
      : `当前规模受热时长约 ${concHoursEst} h，仍建议以“实际保温时长”而非“投料至出液总时长”控制工艺。`;

    return {
      batchKg,
      dryHerbKg: round(dryHerbKg, 3),
      scaleFactor: round(scaleFactor, 1),
      areaVolumeFactor: round(areaVolumeFactor, 2),
      stageRows,
      maxTankVolL: Math.max(2, maxTankVolL),
      totalWaterL: round(totalWaterL, 2),
      totalEthanolL: round(totalEthanolL, 2),
      totalSolventL,
      totalRecoverL,
      totalMarcL: round(stageRows.reduce((s, r) => s + r.marcRetainL, 0), 2),
      netEthanolConsumeL,
      netExtractKg,
      concHoursEst,
      totalExtractH: round(totalExtractH, 2),
      totalHeatUpH: round(totalHeatUpH, 2),
      herbCost,
      solventCost,
      energyCost,
      totalDirectCost,
      costPerKgExtract,
      filterAdvice,
      concAdvice,
      thermalWarn
    };
  }

  // ---------------- 核心算法 6：偏差根因打分排序 ----------------
  function rankDeviationCauses(dev) {
    if (!dev) return [];
    return (dev.causes || []).map((c) => {
      let score = num(c.base, 1);
      const matched = [];
      Object.entries(c.w || {}).forEach(([cid, w]) => {
        if (state.devClues[cid]) {
          score += num(w, 0);
          const clueObj = (dev.clues || []).find((x) => x.id === cid);
          if (clueObj) matched.push(clueObj.text);
        }
      });
      return { cause: c, score, matched };
    }).sort((a, b) => b.score - a.score);
  }

  // ---------------- 内联 SVG 图表生成器 ----------------
  function renderProcessingSvg(proj, opts) {
    const list = opts.length ? opts : (proj.processing?.options || []).slice(0, 1);
    const trendScore = (t) => {
      if (t === '↑↑') return 132;
      if (t === '↑') return 118;
      if (t === '≈／↑') return 108;
      if (t === '↑／↓') return 96;
      if (t === '≈／↓') return 90;
      if (t === '↓') return 78;
      if (t === '↓↓') return 55;
      return 100;
    };
    const h = list.length * 40 + 24;
    const rows = list.map((o, idx) => {
      const y = 14 + idx * 40;
      const ud = state.procUserData[o.id];
      const baseEff = o.effects?.[0] || { m: proj.markers?.[0]?.name || '主成分', t: '≈' };
      const pct = (ud && ud.marker != null && ud.marker > 0) ? Math.min(150, Math.round(ud.marker)) : trendScore(baseEff.t);
      const isUserVal = Boolean(ud && ud.marker != null && ud.marker > 0);
      const barW = Math.max(16, (Math.min(140, pct) / 140) * 300);
      const color = pct >= 105 ? '#10b981' : (pct >= 92 ? '#0ea5e9' : (pct >= 75 ? '#f59e0b' : '#ef4444'));
      return `
        <text x="0" y="${y + 15}" font-size="11" font-weight="700" fill="currentColor">${esc(o.name.slice(0, 18))}</text>
        <rect x="200" y="${y + 4}" width="300" height="14" rx="7" fill="rgba(148,163,184,0.16)" />
        <rect x="200" y="${y + 4}" width="${round(barW, 1)}" height="14" rx="7" fill="${color}" />
        <text x="510" y="${y + 15}" font-size="11" font-weight="700" fill="${color}">${isUserVal ? `实测 ${ud.marker} mg/g` : `相对趋势 ${pct}% (${esc(baseEff.t)})`}</text>
      `;
    }).join('');
    return `
      <svg viewBox="0 0 650 ${h}" class="w-full h-auto" role="img" aria-label="生品与炮制品成分变化对比图">
        <line x1="${round(200 + (100 / 140) * 300, 1)}" y1="6" x2="${round(200 + (100 / 140) * 300, 1)}" y2="${h - 6}" stroke="#64748b" stroke-dasharray="3 3" stroke-width="1" />
        ${rows}
      </svg>
    `;
  }

  function renderRouteBarSvg(ranked) {
    const maxScore = 100;
    const h = ranked.length * 46 + 18;
    const rows = ranked.map((item, idx) => {
      const y = 14 + idx * 46;
      const wComp = Math.max(8, (item.score / maxScore) * 320);
      const wTrans = Math.max(8, (item.transferScore / maxScore) * 320);
      const isTop = idx === 0;
      return `
        <text x="0" y="${y + 11}" font-size="11.5" font-weight="${isTop ? '800' : '600'}" fill="currentColor">${esc(item.route.name.slice(0, 22))}</text>
        <rect x="210" y="${y + 1}" width="320" height="10" rx="5" fill="rgba(15,92,84,0.10)" />
        <rect x="210" y="${y + 1}" width="${wComp}" height="10" rx="5" fill="${isTop ? '#0f5c54' : '#3b82f6'}" />
        <text x="538" y="${y + 10}" font-size="11" font-weight="800" fill="${isTop ? '#0f5c54' : 'currentColor'}">综合 ${item.score}</text>
        <rect x="210" y="${y + 16}" width="320" height="7" rx="3.5" fill="rgba(201,146,44,0.12)" />
        <rect x="210" y="${y + 16}" width="${wTrans}" height="7" rx="3.5" fill="#d97706" />
        <text x="538" y="${y + 23}" font-size="10" fill="#b45309">转移率 ${item.transferScore}</text>
      `;
    }).join('');
    return `
      <svg viewBox="0 0 620 ${h}" class="w-full h-auto" role="img" aria-label="综合工艺评分与单一转移率对比图">
        ${rows}
      </svg>
    `;
  }

  function renderDryCurveSvg(proj) {
    const marker = proj.markers?.[0];
    if (!marker) return '';
    const R = 8.314;
    const ea = num(marker.ea, 55) * 1000;
    const k90 = num(marker.k90, 0.12);
    const temps = [50, 65, 80, 95];
    const colors = ['#10b981', '#0ea5e9', '#f59e0b', '#ef4444'];
    const hours = [0, 1, 2, 3, 4, 5, 6];
    const xMap = (h) => 46 + (h / 6) * 440;
    const yMap = (pct) => 154 - (pct / 100) * 130;

    const lines = temps.map((tC, ti) => {
      const k = k90 * Math.exp((ea / R) * (1 / 363.15 - 1 / (tC + 273.15)));
      const pts = hours.map((h) => {
        const pct = Math.max(10, Math.exp(-k * h) * 100);
        return `${round(xMap(h), 1)},${round(yMap(pct), 1)}`;
      }).join(' ');
      const endPct = Math.max(10, Math.exp(-k * 6) * 100);
      return `
        <polyline fill="none" stroke="${colors[ti]}" stroke-width="2.4" points="${pts}" />
        <text x="492" y="${round(yMap(endPct) + 4, 1)}" font-size="10.5" font-weight="700" fill="${colors[ti]}">${tC}℃ (${round(endPct, 0)}%)</text>
      `;
    }).join('');

    const gridY = [20, 40, 60, 80, 100].map((p) => `
      <line x1="46" y1="${yMap(p)}" x2="486" y2="${yMap(p)}" stroke="rgba(148,163,184,0.28)" stroke-dasharray="3 3" />
      <text x="38" y="${yMap(p) + 3.5}" text-anchor="end" font-size="10" fill="#64748b">${p}%</text>
    `).join('');

    const gridX = hours.map((h) => `
      <text x="${xMap(h)}" y="172" text-anchor="middle" font-size="10" fill="#64748b">${h}h</text>
    `).join('');

    return `
      <svg viewBox="0 0 568 184" class="w-full h-auto" role="img" aria-label="${esc(marker.name)}温度-时间保留率估算曲线">
        ${gridY}
        <line x1="46" y1="24" x2="46" y2="154" stroke="#94a3b8" stroke-width="1" />
        <line x1="46" y1="154" x2="486" y2="154" stroke="#94a3b8" stroke-width="1" />
        ${gridX}
        ${lines}
      </svg>
    `;
  }

  function renderMassBalanceSvg(su) {
    const totalIn = Math.max(1, su.dryHerbKg + su.totalSolventL);
    const segs = [
      { label: `可回收溶剂 ${su.totalRecoverL} L`, val: su.totalRecoverL, color: '#0ea5e9' },
      { label: `药渣吸液 ${su.totalMarcL} L`, val: su.totalMarcL, color: '#f59e0b' },
      { label: `蒸发/水相排放 ${round(Math.max(0, su.totalSolventL - su.totalRecoverL - su.totalMarcL), 1)} L`, val: Math.max(0, su.totalSolventL - su.totalRecoverL - su.totalMarcL), color: '#94a3b8' },
      { label: `目标浸膏干重 ${su.netExtractKg} kg`, val: Math.max(su.netExtractKg, totalIn * 0.04), color: '#10b981' }
    ];
    const sumSeg = segs.reduce((s, x) => s + x.val, 0) || 1;
    let x = 0;
    const bars = segs.map((s) => {
      const w = Math.max(16, (s.val / sumSeg) * 560);
      const rect = `<rect x="${round(x, 1)}" y="12" width="${round(w, 1)}" height="24" rx="4" fill="${s.color}" />`;
      x += w + 3;
      return rect;
    }).join('');
    const legend = segs.map((s, i) => {
      const lx = (i % 2) * 290;
      const ly = 56 + Math.floor(i / 2) * 20;
      return `<rect x="${lx}" y="${ly - 9}" width="10" height="10" rx="2" fill="${s.color}" /><text x="${lx + 15}" y="${ly}" font-size="11" font-weight="600" fill="currentColor">${esc(s.label)}</text>`;
    }).join('');
    return `
      <svg viewBox="0 0 580 86" class="w-full h-auto" role="img" aria-label="中试物料平衡流向分配图">
        ${bars}
        ${legend}
      </svg>
    `;
  }

  // ---------------- 分阶段渲染函数 ----------------
  function renderStagePosition(proj) {
    const data = D();
    const curPath = data.PATHS.find((p) => p.id === state.pathId) || data.PATHS[0];
    const ev = curPath.evidence || { theory: 2, human: 2, clinical: 2 };
    const barRow = (label, lv) => `
      <div class="mb-2.5">
        <div class="flex items-center justify-between text-xs font-bold mb-1">
          <span>${label}</span>
          <span class="text-emerald-700">${lv === 0 ? '通常不要求' : (lv === 1 ? '参考支撑' : (lv === 2 ? '重要依据' : '核心关键证据'))}</span>
        </div>
        <div class="tr-bar-track"><div class="tr-bar-fill" style="width:${(lv / 3) * 100}%"></div></div>
      </div>
    `;

    return `
      <div class="tr-card">
        <div class="tr-card-head">
          <div>
            <h3 class="tr-card-title">01 · 产品定位与研发路径选择 ${srcBadge('reg')}</h3>
            <p class="tr-card-desc">不同研发路径对应的审评标准、对比基准与药学要求截然不同，先定路径再定工艺与质控目标。</p>
          </div>
          <button type="button" class="tr-btn tr-btn-sm" data-tr-act="open-regs">查看法规节点与施行日期</button>
        </div>

        <div class="tr-path-grid">
          ${data.PATHS.map((p) => `
            <button type="button" class="tr-path-card ${p.id === state.pathId ? 'active' : ''}" data-tr-path="${esc(p.id)}">
              <div class="tr-path-cat">${esc(p.cat)}</div>
              <div class="tr-path-name">${esc(p.name)}</div>
              <div class="tr-path-fit">${esc(p.fit.slice(0, 48))}${p.fit.length > 48 ? '…' : ''}</div>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="tr-split-64">
        <div class="tr-card space-y-3">
          <div class="tr-card-head" style="margin-bottom:6px">
            <h3 class="tr-card-title">目标产品概况（TPP 研发输入） ${srcBadge('user', '自定义输入')}</h3>
          </div>
          <div class="tr-field">
            <label>临床需求 / 功能定位</label>
            <textarea class="tr-textarea" rows="2" data-tr-pos="clinicalNeed">${esc(state.positionForm.clinicalNeed)}</textarea>
          </div>
          <div class="tr-grid-2">
            <div class="tr-field">
              <label>适用人群</label>
              <input type="text" class="tr-input" data-tr-pos="population" value="${esc(state.positionForm.population)}" />
            </div>
            <div class="tr-field">
              <label>给药途径与预期剂型</label>
              <input type="text" class="tr-input" data-tr-pos="targetForm" value="${esc(state.positionForm.targetForm)}" />
            </div>
          </div>
          <div class="tr-field">
            <label>中医药理论与人用经验基础</label>
            <input type="text" class="tr-input" data-tr-pos="humanExp" value="${esc(state.positionForm.humanExp)}" />
          </div>
          <div class="tr-alert">
            <strong>路径关键提示：</strong>${esc(curPath.caution)}
          </div>
        </div>

        <div class="tr-card space-y-3">
          <div class="tr-card-head" style="margin-bottom:6px">
            <h3 class="tr-card-title">产品目标与研发路径卡 ${srcBadge('reg')}</h3>
          </div>
          <div class="tr-card-soft">
            <div class="text-xs font-bold text-emerald-700">${esc(curPath.cat)} · ${esc(curPath.name)}</div>
            <div class="text-xs mt-1 leading-relaxed" style="color:var(--ds-ink-2)"><strong>法规依据：</strong>${esc(curPath.reg)}</div>
            <ul class="mt-2.5 space-y-1.5 text-xs" style="color:var(--ds-ink);padding-left:16px;list-style:disc">
              ${curPath.core.map((c) => `<li>${esc(c)}</li>`).join('')}
            </ul>
          </div>
          <div class="tr-card-soft">
            <div class="text-xs font-extrabold mb-2" style="color:var(--ds-ink)">“三结合”审评证据侧重示意</div>
            ${barRow('中医药理论支撑', ev.theory)}
            ${barRow('人用经验数据', ev.human)}
            ${barRow('临床试验要求', ev.clinical)}
          </div>
        </div>
      </div>
    `;
  }

  function renderStageHerb(proj) {
    const opts = proj.processing?.options || [];
    const activeOpts = opts.filter((o) => state.procSelected[o.id]);

    return `
      <div class="tr-split-64">
        <div class="tr-card">
          <div class="tr-card-head">
            <div>
              <h3 class="tr-card-title">02 · 药材基原、产地与法定质控 ${srcBadge('pharm', '中国药典 2025 年版')}</h3>
              <p class="tr-card-desc">${esc(proj.herb)}（<em>${esc(proj.latin)}</em>）— 产业转化必须先锁住原料基原与饮片质量基线。</p>
            </div>
          </div>
          <div class="tr-grid-2 mb-3">
            <div class="tr-card-soft text-xs leading-relaxed">
              <div class="font-bold mb-1" style="color:var(--ds-ink)">基原与药用部位</div>
              <div style="color:var(--ds-ink-2)">${esc(proj.source)}</div>
            </div>
            <div class="tr-card-soft text-xs leading-relaxed">
              <div class="font-bold mb-1" style="color:var(--ds-ink)">道地产区与供应商控制</div>
              <div style="color:var(--ds-ink-2)">${esc(proj.regions)}</div>
            </div>
          </div>
          <div class="tr-table-wrap">
            <table class="tr-table">
              <thead><tr><th>检查 / 含量项</th><th>限度参考</th><th>数据来源</th></tr></thead>
              <tbody>
                ${(proj.herbQc || []).map((q) => `
                  <tr>
                    <td class="font-bold">${esc(q.item)}</td>
                    <td>${esc(q.limit)}</td>
                    <td>${srcBadge(q.src)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="tr-card space-y-3">
          <div class="tr-card-head" style="margin-bottom:4px">
            <h3 class="tr-card-title">炮制工艺卡 ${srcBadge('lit')}</h3>
          </div>
          <p class="text-xs leading-relaxed" style="color:var(--ds-ink-2)">${esc(proj.processing?.intro || '')}</p>
          <div class="tr-field">
            <label>前处理与炮制规程要点（写入转化报告）</label>
            <textarea class="tr-textarea" rows="3" data-tr-proc-note="1">${esc(state.procCustomNote)}</textarea>
          </div>
          <div class="tr-alert-ok tr-alert">
            <strong>关键提示：</strong>投料前必须测定饮片水分并<strong>按干品折算投料</strong>，避免因含水量波动造成收率与含量假性偏低。
          </div>
        </div>
      </div>

      <div class="tr-card">
        <div class="tr-card-head">
          <div>
            <h3 class="tr-card-title">生品 / 制品与产地加工对照矩阵 ${Object.keys(state.procUserData).length ? srcBadge('user') : srcBadge('lit', '文献趋势 / 可填实测')}</h3>
            <p class="tr-card-desc">勾选需要进入平行对照的加工方式；若已有实验室数据，可在右侧直接录入实测收率与主指标含量（自动转为“用户实测”）。</p>
          </div>
        </div>
        <div class="tr-chip-row mb-3">
          ${opts.map((o) => `
            <button type="button" class="tr-chip ${state.procSelected[o.id] ? 'active' : ''}" data-tr-proc-toggle="${esc(o.id)}">${state.procSelected[o.id] ? '✓ ' : '+ '}${esc(o.name)}</button>
          `).join('')}
        </div>

        <div class="tr-table-wrap">
          <table class="tr-table">
            <thead>
              <tr>
                <th>炮制 / 加工组别</th>
                <th>工艺说明</th>
                <th>成分转化与减毒增效趋势</th>
                <th>实测得率（%，选填）</th>
                <th>实测主指标（mg/g，选填）</th>
              </tr>
            </thead>
            <tbody>
              ${(activeOpts.length ? activeOpts : opts.slice(0, 1)).map((o) => {
                const ud = state.procUserData[o.id] || {};
                return `
                  <tr>
                    <td class="font-bold">${esc(o.name)}</td>
                    <td class="text-xs" style="color:var(--ds-muted)">${esc(o.desc)}</td>
                    <td>
                      <div class="space-y-1">
                        ${(o.effects || []).map((e) => `
                          <div class="text-xs"><strong>${esc(e.m)}</strong> <span class="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold">${esc(e.t)}</span> <span style="color:var(--ds-muted)">${esc(e.n)}</span></div>
                        `).join('')}
                      </div>
                    </td>
                    <td><input type="number" step="0.1" placeholder="待实测" value="${ud.yield != null ? esc(ud.yield) : ''}" data-tr-proc-val="${esc(o.id)}:yield" /></td>
                    <td><input type="number" step="0.1" placeholder="待实测" value="${ud.marker != null ? esc(ud.marker) : ''}" data-tr-proc-val="${esc(o.id)}:marker" /></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div class="tr-card-soft mt-4">
          <div class="flex items-center justify-between flex-wrap gap-2 mb-2">
            <span class="text-xs font-extrabold" style="color:var(--ds-ink)">生品 / 炮制品成分变化趋势对照图（虚线 = 生品基准 100%）</span>
            ${Object.values(state.procUserData).some((u) => u && u.marker != null) ? srcBadge('user', '含用户实测') : srcBadge('lit', '文献变化趋势')}
          </div>
          ${renderProcessingSvg(proj, activeOpts)}
        </div>
      </div>
    `;
  }

  function renderStageExtract(proj) {
    const ranked = scoreRoutes(proj);
    const best = ranked[0];
    const highestTransfer = ranked.slice().sort((a, b) => b.transferScore - a.transferScore)[0];
    const hasTradeoff = best && highestTransfer && best.route.id !== highestTransfer.route.id;

    return `
      <div class="tr-card">
        <div class="tr-card-head">
          <div>
            <h3 class="tr-card-title">03 · 提取纯化：从“提取率最优”升级为“综合工艺最优” ${srcBadge('calc')}</h3>
            <p class="tr-card-desc">产业化工艺需要同时平衡成分转移率、热稳定性、批间重现、能耗成本、过滤干燥难度、安全绿色化与制剂成型适配度。</p>
          </div>
          <div class="tr-chip-row">
            ${Object.entries(WEIGHT_PRESETS).map(([k, p]) => `
              <button type="button" class="tr-chip ${state.routePreset === k ? 'active' : ''}" data-tr-wpreset="${esc(k)}">${esc(p.name)}</button>
            `).join('')}
          </div>
        </div>

        ${hasTradeoff ? `
          <div class="tr-alert mb-4">
            <strong>工艺取舍提示：</strong>「${esc(highestTransfer.route.name)}」的单一成分转移率最高（${highestTransfer.transferScore} 分），但因 <strong>${esc(highestTransfer.weaknesses.join('、') || '能耗与放大适配限制')}</strong>，在当前权重下综合得分低于「<strong>${esc(best.route.name)}</strong>」（综合 ${best.score} 分）。生产工艺不应仅以提取率最高作为唯一判据。
          </div>
        ` : `
          <div class="tr-alert tr-alert-ok mb-4">
            <strong>当前综合最优推荐：</strong>「<strong>${esc(best?.route.name || '')}</strong>」（综合 ${best?.score || 0} 分）。可拖动下方权重滑块，观察不同研发／中试约束下工艺排序的变化。
          </div>
        `}

        <div class="tr-split-64">
          <div class="space-y-4">
            <div class="tr-card-soft">
              <div class="text-xs font-extrabold mb-2" style="color:var(--ds-ink)">综合工艺评分 vs 单一转移率对比（满分 100）</div>
              ${renderRouteBarSvg(ranked)}
            </div>

            <div class="tr-table-wrap">
              <table class="tr-table">
                <thead>
                  <tr>
                    <th>选定</th>
                    <th>工艺路线</th>
                    <th>综合分</th>
                    <th>转移率</th>
                    <th>可操作性</th>
                    <th>短板与风险</th>
                  </tr>
                </thead>
                <tbody>
                  ${ranked.map((item) => `
                    <tr>
                      <td>
                        <input type="radio" name="trRoutePick" ${state.selectedRouteId === item.route.id ? 'checked' : ''} data-tr-pick-route="${esc(item.route.id)}" />
                      </td>
                      <td>
                        <div class="font-bold">${esc(item.route.name)}</div>
                        <div class="text-xs mt-0.5" style="color:var(--ds-muted)">${esc(item.route.desc)}</div>
                      </td>
                      <td class="font-extrabold text-emerald-700">${item.score}</td>
                      <td>${item.transferScore}</td>
                      <td>${item.route.s.operability * 10}</td>
                      <td class="text-xs" style="color:#b45309">${item.weaknesses.length ? esc(item.weaknesses.join('、')) : '无明显短板'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div class="tr-card-soft space-y-2.5">
            <div class="flex items-center justify-between">
              <div class="text-xs font-extrabold" style="color:var(--ds-ink)">9 维评价权重调节（0～5）</div>
              <span class="text-[11px]" style="color:var(--ds-muted)">实时重排</span>
            </div>
            ${ROUTE_DIMS.map((d) => `
              <div>
                <div class="flex items-center justify-between text-xs">
                  <span title="${esc(d.desc)}">${esc(d.label)}</span>
                  <strong>${state.routeWeights[d.key]}</strong>
                </div>
                <input type="range" class="tr-range" min="0" max="5" step="1" value="${state.routeWeights[d.key]}" data-tr-rweight="${esc(d.key)}" />
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function renderStageDry(proj) {
    const c = state.dryCfg;
    const { results, powderRisk } = calcDryRetention(proj);
    return `
      <div class="tr-split-64">
        <div class="tr-card space-y-4">
          <div class="tr-card-head" style="margin-bottom:4px">
            <div>
              <h3 class="tr-card-title">04 · 浓缩与干燥条件模拟 ${srcBadge('calc')}</h3>
              <p class="tr-card-desc">浓缩与干燥常是中药有效成分降解、挥发油逸散和浸膏粉吸湿结块的高发环节。</p>
            </div>
          </div>

          <div class="tr-grid-2">
            <div class="tr-field">
              <label>浓缩方式</label>
              <select class="tr-select" data-tr-dry="concMethod">
                <option value="atm" ${c.concMethod === 'atm' ? 'selected' : ''}>常压浓缩（沸点高、受热重）</option>
                <option value="vacuum" ${c.concMethod === 'vacuum' ? 'selected' : ''}>减压浓缩（推荐 ≤ 60 ℃）</option>
                <option value="thinfilm" ${c.concMethod === 'thinfilm' ? 'selected' : ''}>薄膜／降膜浓缩（受热时间短）</option>
              </select>
            </div>
            <div class="tr-field">
              <label>干燥方式</label>
              <select class="tr-select" data-tr-dry="dryMethod">
                <option value="vacuum" ${c.dryMethod === 'vacuum' ? 'selected' : ''}>真空低温干燥</option>
                <option value="spray" ${c.dryMethod === 'spray' ? 'selected' : ''}>喷雾干燥（瞬时高温、粉体细）</option>
                <option value="freeze" ${c.dryMethod === 'freeze' ? 'selected' : ''}>真空冷冻干燥（热敏/挥发最优）</option>
                <option value="oven" ${c.dryMethod === 'oven' ? 'selected' : ''}>热风烘箱干燥（成本低、受热久）</option>
              </select>
            </div>
          </div>

          <div class="tr-grid-2">
            <div class="tr-field">
              <label><span>浓缩温度</span><strong>${c.concTemp} ℃</strong></label>
              <input type="range" class="tr-range" min="40" max="100" step="5" value="${c.concTemp}" data-tr-dry="concTemp" />
            </div>
            <div class="tr-field">
              <label><span>浓缩受热时长</span><strong>${c.concHours} h</strong></label>
              <input type="range" class="tr-range" min="0.5" max="8" step="0.5" value="${c.concHours}" data-tr-dry="concHours" />
            </div>
            <div class="tr-field">
              <label><span>干燥物料温度</span><strong>${c.dryTemp} ℃</strong></label>
              <input type="range" class="tr-range" min="30" max="120" step="5" value="${c.dryTemp}" data-tr-dry="dryTemp" />
            </div>
            <div class="tr-field">
              <label><span>干燥持续时长</span><strong>${c.dryHours} h</strong></label>
              <input type="range" class="tr-range" min="0.5" max="12" step="0.5" value="${c.dryHours}" data-tr-dry="dryHours" />
            </div>
          </div>

          <label class="inline-flex items-center gap-2 text-xs font-bold cursor-pointer">
            <input type="checkbox" ${c.avoidLight ? 'checked' : ''} data-tr-dry-check="avoidLight" />
            全程避光操作（光敏成分如丹参酮类、黄芩素等须开启）
          </label>

          <div class="tr-card-soft">
            <div class="text-xs font-extrabold mb-1" style="color:var(--ds-ink)">粉体吸湿、结块与流动性评估</div>
            <p class="text-xs leading-relaxed m-0" style="color:var(--ds-ink-2)">${esc(powderRisk)}</p>
          </div>
        </div>

        <div class="tr-card space-y-4">
          <div class="tr-card-head" style="margin-bottom:4px">
            <h3 class="tr-card-title">指标成分保留率估算 ${srcBadge('calc', '简化动力学估算')}</h3>
          </div>
          <div class="space-y-2.5">
            ${results.map((r) => `
              <div class="tr-kpi">
                <div class="flex items-center justify-between">
                  <span class="tr-kpi-label">${esc(r.marker.name)}（${esc(r.marker.type)}）</span>
                  <span class="text-xs font-bold ${r.risk === 'high' ? 'text-rose-600' : (r.risk === 'mid' ? 'text-amber-600' : 'text-emerald-700')}">
                    ${r.risk === 'high' ? '降解/损失高风险' : (r.risk === 'mid' ? '需重点监控' : '保留良好')}
                  </span>
                </div>
                <div class="tr-kpi-val">${r.retainTotal}%</div>
                <div class="tr-bar-track mt-1.5"><div class="tr-bar-fill" style="width:${r.retainTotal}%;background:${r.risk === 'high' ? '#ef4444' : (r.risk === 'mid' ? '#f59e0b' : '#10b981')}"></div></div>
                <div class="tr-kpi-note">浓缩后约 ${r.retainConc}% → 干燥后约 ${r.retainTotal}%（教学模型推算，须以 HPLC/GC 实测为准）</div>
              </div>
            `).join('')}
          </div>

          <div class="tr-card-soft">
            <div class="text-xs font-extrabold mb-1.5" style="color:var(--ds-ink)">主成分受热温度—时间衰减趋势示意</div>
            ${renderDryCurveSvg(proj)}
          </div>
        </div>
      </div>
    `;
  }

  function renderStageForm(proj) {
    const inp = state.dosageInput;
    const ranked = rankDosageForms(inp);
    const chosen = ranked.find((x) => x.form.id === state.selectedFormId) || ranked[0];
    const f = chosen.form;
    const dailyExt = num(inp.daily, 2);
    const excRatio = Math.min(75, Math.max(10, num(state.excipientRatio, 35)));
    const totalDailyMix = round(dailyExt / (1 - excRatio / 100), 2);
    const excMass = round(totalDailyMix - dailyExt, 2);
    const unitsPerDay = f.route === 'oral' ? Math.max(1, Math.round(totalDailyMix / (f.id === 'liquid' ? 0.5 : f.unit))) : 2;
    const packAdvice = inp.hygro === 3 || inp.volatile === 3
      ? '铝塑复合膜（高阻湿/阻气）或棕色避光密封瓶＋干燥剂'
      : '铝塑泡罩（PVC/PVDC-铝箔）或药用高密度聚乙烯瓶';
    const excList = f.id === 'granule'
      ? [['糊精 / 乳糖（稀释剂）', `${round(excMass * 0.72, 2)} g`], ['可溶性淀粉 / 微粉硅胶（防潮助流）', `${round(excMass * 0.18, 2)} g`], ['矫味剂 / 甜菊糖苷（如苦味重）', `${round(excMass * 0.10, 2)} g`]]
      : (f.id === 'softcap'
        ? [['精制植物油 / MCT（分散介质）', `${round(excMass * 0.85, 2)} g`], ['蜂蜡 / 磷脂（助悬稳定剂）', `${round(excMass * 0.15, 2)} g`]]
        : (f.id === 'capsule'
          ? [['微晶纤维素（稀释/助流）', `${round(excMass * 0.80, 2)} g`], ['二氧化硅 / 硬脂酸镁（润滑剂）', `${round(excMass * 0.20, 2)} g`]]
          : [['主填充稀释剂（MCC / 乳糖）', `${round(excMass * 0.75, 2)} g`], ['崩解/黏合及润滑辅料', `${round(excMass * 0.25, 2)} g`]]));
    if (inp.volatile === 3 && (f.id === 'granule' || f.id === 'capsule' || f.id === 'tablet')) {
      excList.unshift(['β-环糊精（挥发油包合材料，油:β-CD 约 1:6～1:8）', '按实际含油量计']);
    }

    return `
      <div class="tr-split-64">
        <div class="tr-card space-y-4">
          <div class="tr-card-head" style="margin-bottom:4px">
            <div>
              <h3 class="tr-card-title">05 · 剂型选择决策器 ${srcBadge('calc')}</h3>
              <p class="tr-card-desc">从“提取出一个成分”走向“制成稳定可用的产品”：根据理化特征与日服剂量动态筛选适配剂型。</p>
            </div>
          </div>

          <div class="tr-grid-3">
            <div class="tr-field">
              <label>给药途径</label>
              <select class="tr-select" data-tr-dos="route">
                <option value="oral" ${inp.route === 'oral' ? 'selected' : ''}>口服</option>
                <option value="topical" ${inp.route === 'topical' ? 'selected' : ''}>外用局部</option>
              </select>
            </div>
            <div class="tr-field">
              <label>挥发性</label>
              <select class="tr-select" data-tr-dos="volatile">
                <option value="1" ${inp.volatile == 1 ? 'selected' : ''}>低（非挥发性）</option>
                <option value="2" ${inp.volatile == 2 ? 'selected' : ''}>中（含少量挥发组分）</option>
                <option value="3" ${inp.volatile == 3 ? 'selected' : ''}>高（挥发油为主）</option>
              </select>
            </div>
            <div class="tr-field">
              <label>溶解特征</label>
              <select class="tr-select" data-tr-dos="solubility">
                <option value="1" ${inp.solubility == 1 ? 'selected' : ''}>脂溶性 / 难溶于水</option>
                <option value="2" ${inp.solubility == 2 ? 'selected' : ''}>脂水兼有 / 中等溶解</option>
                <option value="3" ${inp.solubility == 3 ? 'selected' : ''}>水溶性良好</option>
              </select>
            </div>
            <div class="tr-field">
              <label>热稳定性</label>
              <select class="tr-select" data-tr-dos="thermo">
                <option value="1" ${inp.thermo == 1 ? 'selected' : ''}>热敏（易降解）</option>
                <option value="2" ${inp.thermo == 2 ? 'selected' : ''}>中等</option>
                <option value="3" ${inp.thermo == 3 ? 'selected' : ''}>较稳定</option>
              </select>
            </div>
            <div class="tr-field">
              <label>引湿性</label>
              <select class="tr-select" data-tr-dos="hygro">
                <option value="1" ${inp.hygro == 1 ? 'selected' : ''}>低</option>
                <option value="2" ${inp.hygro == 2 ? 'selected' : ''}>中</option>
                <option value="3" ${inp.hygro == 3 ? 'selected' : ''}>强（多糖/酚酸易结块）</option>
              </select>
            </div>
            <div class="tr-field">
              <label>苦味 / 异味</label>
              <select class="tr-select" data-tr-dos="bitter">
                <option value="1" ${inp.bitter == 1 ? 'selected' : ''}>轻</option>
                <option value="2" ${inp.bitter == 2 ? 'selected' : ''}>中</option>
                <option value="3" ${inp.bitter == 3 ? 'selected' : ''}>重（需掩味）</option>
              </select>
            </div>
            <div class="tr-field">
              <label><span>日服提取物量</span><strong>${dailyExt} g/d</strong></label>
              <input type="range" class="tr-range" min="0.1" max="8" step="0.1" value="${dailyExt}" data-tr-dos="daily" />
            </div>
            <div class="tr-field">
              <label>目标人群</label>
              <select class="tr-select" data-tr-dos="population">
                <option value="adult" ${inp.population === 'adult' ? 'selected' : ''}>常规成人</option>
                <option value="child_elder" ${inp.population === 'child_elder' ? 'selected' : ''}>儿童 / 吞咽困难老人</option>
              </select>
            </div>
            <div class="tr-field">
              <label>起效要求</label>
              <select class="tr-select" data-tr-dos="onset">
                <option value="normal" ${inp.onset === 'normal' ? 'selected' : ''}>常规起效</option>
                <option value="fast" ${inp.onset === 'fast' ? 'selected' : ''}>较快起效</option>
              </select>
            </div>
          </div>

          <div class="tr-grid-2">
            ${ranked.slice(0, 4).map((item, idx) => `
              <button type="button" class="tr-path-card ${item.form.id === f.id ? 'active' : ''}" data-tr-pick-form="${esc(item.form.id)}">
                <div class="flex items-center justify-between">
                  <span class="tr-path-cat">${idx === 0 ? '★ 首选推荐' : `备选 #${idx + 1}`} · ${esc(item.form.ref)}</span>
                  <strong class="text-sm text-emerald-700">${item.score} 分</strong>
                </div>
                <div class="tr-path-name">${esc(item.form.name)}</div>
                <div class="tr-path-fit">${esc((item.reasons[0] || item.form.pros))}</div>
                ${item.cautions.length ? `<div class="text-[11px] mt-1.5 text-amber-700">注意：${esc(item.cautions[0])}</div>` : ''}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="tr-card space-y-4">
          <div class="tr-card-head" style="margin-bottom:4px">
            <h3 class="tr-card-title">小试处方单与工艺流程 · ${esc(f.name)} ${srcBadge('calc')}</h3>
          </div>

          <div class="tr-field">
            <label><span>辅料占比调节</span><strong>${excRatio}%（浸膏 ${100 - excRatio}%）</strong></label>
            <input type="range" class="tr-range" min="15" max="70" step="5" value="${excRatio}" data-tr-exc="1" />
          </div>

          <div class="tr-table-wrap">
            <table class="tr-table">
              <thead><tr><th>处方组成（日剂量基准）</th><th>参考用量</th></tr></thead>
              <tbody>
                <tr><td class="font-bold">${esc(proj.herb)}提取物干粉 / 部位</td><td>${dailyExt} g</td></tr>
                ${excList.map(([n, a]) => `<tr><td>${esc(n)}</td><td>${esc(a)}</td></tr>`).join('')}
                <tr><td class="font-bold">合计日处方量 / 折合规格</td><td><strong>${totalDailyMix} g</strong>（约 ${unitsPerDay} ${esc(f.unitLabel)}）</td></tr>
                <tr><td class="font-bold">推荐包材方向</td><td>${esc(packAdvice)}</td></tr>
              </tbody>
            </table>
          </div>

          <div class="tr-card-soft">
            <div class="text-xs font-extrabold mb-2" style="color:var(--ds-ink)">制剂工艺流程</div>
            <div class="tr-flow-chain">
              ${f.steps.map((s, i) => `<span class="tr-flow-node">${i + 1}. ${esc(s)}</span>${i < f.steps.length - 1 ? '<span class="tr-flow-arrow">→</span>' : ''}`).join('')}
            </div>
          </div>

          <div class="tr-card-soft">
            <div class="text-xs font-extrabold mb-1.5" style="color:var(--ds-ink)">药典通则检查项（${esc(f.ref)}） ${srcBadge('pharm')}</div>
            <div class="tr-chip-row">
              ${f.qc.map((q) => `<span class="tr-src tr-src-pharm">${esc(q)}</span>`).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderStageQuality(proj) {
    const data = D();
    const sub = state.qualitySub;

    let bodyHtml = '';
    if (sub === 'matrix') {
      bodyHtml = `
        <div class="space-y-4">
          <div class="tr-grid-3">
            ${(proj.qcMatrix || []).map((lvl) => `
              <div class="tr-card-soft">
                <div class="text-sm font-extrabold mb-2.5" style="color:var(--ds-ink)">${esc(lvl.level)}</div>
                <div class="space-y-2">
                  ${lvl.items.map(([k, v, src]) => `
                    <div class="p-2.5 rounded-xl border" style="background:var(--ds-surface);border-color:var(--ds-line)">
                      <div class="flex items-center justify-between gap-2">
                        <span class="text-xs font-bold" style="color:var(--ds-ink)">${esc(k)}</span>
                        ${srcBadge(src)}
                      </div>
                      <div class="text-xs mt-1" style="color:var(--ds-muted)">${esc(v)}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>

          <div class="tr-card-soft">
            <div class="flex items-center justify-between flex-wrap gap-2 mb-2.5">
              <div class="text-sm font-extrabold" style="color:var(--ds-ink)">稳定性考察方案（通则 9001） ${srcBadge('pharm', '中国药典 2025 年版')}</div>
              <span class="text-xs" style="color:var(--ds-muted)">重点观察性状、吸湿结块、含量及指纹图谱相似度</span>
            </div>
            <div class="tr-table-wrap">
              <table class="tr-table">
                <thead><tr><th>试验类型</th><th>考察条件</th><th>取样时间点</th><th>考察重点</th></tr></thead>
                <tbody>
                  ${data.STABILITY.map((s) => `
                    <tr><td class="font-bold">${esc(s.type)}</td><td>${esc(s.cond)}</td><td>${esc(s.time)}</td><td class="text-xs">${esc(s.note)}</td></tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    } else if (sub === 'batch') {
      let hasOut = false;
      const rowsHtml = state.batchRows.map((row, rIdx) => {
        const st = calcBatchStats(row.vals);
        const fail = st.rsd > row.rsd;
        if (fail) hasOut = true;
        return `
          <tr>
            <td class="font-bold">${esc(row.name)}（${esc(row.unit)}）<div class="mt-1">${srcBadge(row.isUser ? 'user' : 'example')}</div></td>
            ${row.vals.map((v, bIdx) => `
              <td><input type="number" step="0.01" value="${esc(v)}" data-tr-batch="${rIdx}:${bIdx}" /></td>
            `).join('')}
            <td><strong>${st.mean}</strong> ± ${st.sd}</td>
            <td class="font-extrabold ${fail ? 'text-rose-600' : 'text-emerald-700'}">${st.rsd}% <span class="text-[11px] font-normal">(限≤${row.rsd}%)</span></td>
            <td>
              ${fail
                ? `<button type="button" class="tr-btn tr-btn-sm" style="color:#b91c1c;border-color:#fca5a5" data-tr-go-dev="repro">⚠ 超限 → 查偏差</button>`
                : `<span class="tr-src tr-src-pharm">✓ 一致</span>`}
            </td>
          </tr>
        `;
      }).join('');

      const simMin = Math.min(...state.similarity.map((x) => num(x, 0.9)));
      bodyHtml = `
        <div class="space-y-4">
          <div class="tr-alert ${hasOut ? 'tr-alert-warn' : 'tr-alert-ok'}">
            ${hasOut
              ? '<strong>检测到批间 RSD 超出预设限度：</strong>不建议直接推进中试放大，请点击右侧“查偏差”定位原料、折干或关键工艺参数波动原因。'
              : '<strong>三批小试关键指标 RSD 均在预设范围内</strong>，指纹图谱最低相似度 ' + round(simMin, 2) + '（直接修改下方数字可替换为你的实测数据）。'}
          </div>
          <div class="tr-table-wrap">
            <table class="tr-table">
              <thead>
                <tr><th>评价指标</th><th>批次 01</th><th>批次 02</th><th>批次 03</th><th>均值 ± SD</th><th>RSD%</th><th>判定</th></tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
            </table>
          </div>
          <div class="tr-card-soft">
            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div class="text-xs font-extrabold" style="color:var(--ds-ink)">指纹图谱相似度（vs 对照图谱，参考限度 ≥ 0.90） ${srcBadge(state.batchEdited ? 'user' : 'example')}</div>
            </div>
            <div class="tr-grid-3">
              ${state.similarity.map((sv, i) => `
                <div class="tr-field">
                  <label>批次 0${i + 1} 相似度</label>
                  <input type="number" step="0.01" min="0" max="1" class="tr-input" value="${esc(sv)}" data-tr-sim="${i}" />
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    } else {
      const eff = proj.efficacy || { aim: '', tree: [], controls: [] };
      bodyHtml = `
        <div class="space-y-4">
          <div class="tr-alert tr-alert-ok"><strong>评价设计原则：</strong>${esc(eff.aim)}</div>
          <div class="tr-grid-3">
            ${(eff.tree || []).map((g) => `
              <div class="tr-card-soft">
                <div class="text-sm font-extrabold mb-2" style="color:var(--ds-ink)">${esc(g.g)} ${srcBadge('lit')}</div>
                <ul class="space-y-1.5 text-xs" style="color:var(--ds-ink-2);padding-left:16px;list-style:disc">
                  ${g.items.map((it) => `<li>${esc(it)}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
          <div class="tr-table-wrap">
            <table class="tr-table">
              <thead><tr><th>实验对照分组</th><th>设置要点与意义</th></tr></thead>
              <tbody>
                ${(eff.controls || []).map(([k, v]) => `<tr><td class="font-bold">${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    return `
      <div class="tr-card space-y-4">
        <div class="tr-card-head" style="margin-bottom:0">
          <div>
            <h3 class="tr-card-title">06 · 全过程质量评价、三批复现与药效安全设计</h3>
            <p class="tr-card-desc">覆盖药材→中间体→成品分级质控、三批一致性核算、稳定性方案及“成分—药效—安全”关联对照。</p>
          </div>
          <div class="tr-subtabs">
            <button type="button" class="tr-subtab ${sub === 'matrix' ? 'active' : ''}" data-tr-qsub="matrix">分级质控与稳定性</button>
            <button type="button" class="tr-subtab ${sub === 'batch' ? 'active' : ''}" data-tr-qsub="batch">三批小试复现</button>
            <button type="button" class="tr-subtab ${sub === 'efficacy' ? 'active' : ''}" data-tr-qsub="efficacy">药效与安全评价</button>
          </div>
        </div>
        ${bodyHtml}
      </div>
    `;
  }

  function renderStageScale(proj) {
    const data = D();
    const sub = state.scaleSub;
    let bodyHtml = '';

    if (sub === 'mass') {
      const su = calcScaleUp(proj);
      const cfg = state.scaleCfg;
      bodyHtml = `
        <div class="space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="tr-chip-row">
              ${[[0.1, '100 g 小试'], [1, '1 kg 放大'], [10, '10 kg 中试'], [50, '50 kg 放大'], [100, '100 kg 批产']].map(([kg, lb]) => `
                <button type="button" class="tr-chip ${cfg.batchKg == kg ? 'active' : ''}" data-tr-batch-kg="${kg}">${lb}</button>
              `).join('')}
            </div>
            ${srcBadge('calc', '非线性放大核算')}
          </div>

          <div class="tr-grid-4">
            <div class="tr-field"><label>投料批量（kg）</label><input type="number" step="0.1" min="0.1" class="tr-input" value="${cfg.batchKg}" data-tr-scale="batchKg" /></div>
            <div class="tr-field"><label>药材水分（%）</label><input type="number" step="0.5" min="0" max="25" class="tr-input" value="${cfg.moisturePct}" data-tr-scale="moisturePct" /></div>
            <div class="tr-field"><label>乙醇回收率（%）</label><input type="number" step="1" min="30" max="95" class="tr-input" value="${cfg.recoverPct}" data-tr-scale="recoverPct" /></div>
            <div class="tr-field"><label>药材单价（元/kg）</label><input type="number" step="5" min="1" class="tr-input" value="${cfg.herbPrice}" data-tr-scale="herbPrice" /></div>
          </div>

          <div class="tr-grid-4">
            <div class="tr-kpi">
              <div class="tr-kpi-label">折干投料 / 预计浸膏干重</div>
              <div class="tr-kpi-val">${su.dryHerbKg} kg → ${su.netExtractKg} kg</div>
              <div class="tr-kpi-note">已扣 ${cfg.moisturePct}% 水分与 ${cfg.filterLossPct}% 转移损耗</div>
            </div>
            <div class="tr-kpi">
              <div class="tr-kpi-label">推荐提取罐容积</div>
              <div class="tr-kpi-val">${su.maxTankVolL} L</div>
              <div class="tr-kpi-note">按 70% 有效装液系数核算</div>
            </div>
            <div class="tr-kpi">
              <div class="tr-kpi-label">预计升温＋提取 / 浓缩时长</div>
              <div class="tr-kpi-val">${su.totalExtractH} h / ${su.concHoursEst} h</div>
              <div class="tr-kpi-note">传热面/体积比放大系数 ${su.areaVolumeFactor}×</div>
            </div>
            <div class="tr-kpi">
              <div class="tr-kpi-label">单批直接物料能耗估算</div>
              <div class="tr-kpi-val">¥${su.totalDirectCost}</div>
              <div class="tr-kpi-note">约 ¥${su.costPerKgExtract}/kg 浸膏（示例单价）</div>
            </div>
          </div>

          <div class="tr-alert">
            <strong>非线性放大提示：</strong>${esc(su.thermalWarn)}<br />
            <strong>设备选型建议：</strong>固液分离建议采用「${esc(su.filterAdvice)}」；浓缩建议采用「${esc(su.concAdvice)}」。
          </div>

          <div class="tr-split-64">
            <div class="tr-table-wrap">
              <table class="tr-table">
                <thead><tr><th>工段</th><th>溶剂投量</th><th>药渣吸液</th><th>可回收</th><th>净消耗</th><th>罐容建议</th></tr></thead>
                <tbody>
                  ${su.stageRows.map((r) => `
                    <tr>
                      <td class="font-bold">${esc(r.name)}<div class="text-[11px] font-normal" style="color:var(--ds-muted)">${esc(r.label)} · 升温约 ${r.heatUpH}h</div></td>
                      <td>${r.solL} L</td>
                      <td>${r.marcRetainL} L</td>
                      <td>${r.recoveredL} L</td>
                      <td>${r.netLossL} L</td>
                      <td>${r.tankRecL} L</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            <div class="tr-card-soft">
              <div class="text-xs font-extrabold mb-1" style="color:var(--ds-ink)">物料流向平衡图 ${srcBadge('calc')}</div>
              ${renderMassBalanceSvg(su)}
              <div class="text-[11px] mt-1" style="color:var(--ds-muted)">直接成本拆分：药材 ¥${su.herbCost} · 净耗溶剂 ¥${su.solventCost} · 估算能耗 ¥${su.energyCost}（不含人工折旧与检验费）</div>
            </div>
          </div>
        </div>
      `;
    } else if (sub === 'deviation') {
      const dev = data.DEVIATIONS.find((d) => d.id === state.devId) || data.DEVIATIONS[0];
      const ranked = rankDeviationCauses(dev);
      bodyHtml = `
        <div class="space-y-4">
          <div class="tr-chip-row">
            ${data.DEVIATIONS.map((d) => `
              <button type="button" class="tr-chip ${d.id === dev.id ? 'active' : ''}" data-tr-dev="${esc(d.id)}">${esc(d.title)}</button>
            `).join('')}
          </div>

          <div class="tr-split-64">
            <div class="tr-card-soft space-y-3">
              <div class="text-xs font-extrabold text-rose-700">异常现象</div>
              <div class="text-sm font-bold" style="color:var(--ds-ink)">${esc(dev.phenomenon)}</div>
              <div class="text-xs font-extrabold pt-2" style="color:var(--ds-ink)">勾选你观察到的现场线索（系统自动重排可能原因）</div>
              <div class="space-y-2">
                ${(dev.clues || []).map((cl) => `
                  <label class="flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer text-xs" style="background:var(--ds-surface);border-color:var(--ds-line)">
                    <input type="checkbox" ${state.devClues[cl.id] ? 'checked' : ''} data-tr-clue="${esc(cl.id)}" class="mt-0.5 accent-[#0f5c54]" />
                    <span>${esc(cl.text)}</span>
                  </label>
                `).join('')}
              </div>
              <button type="button" class="tr-btn tr-btn-primary w-full" data-tr-act="ask-ai-dev" ${state.devAiLoading ? 'disabled' : ''}>
                ${state.devAiLoading ? '正在生成偏差调查补充建议…' : '结合当前药材与线索生成偏差分析补充建议'}
              </button>
              ${state.devAiReply ? `
                <div class="p-3 rounded-xl border text-xs leading-relaxed whitespace-pre-wrap" style="background:var(--ds-surface);border-color:var(--ds-line-strong)">
                  <div class="mb-1.5 flex items-center justify-between"><strong>补充排查思路</strong>${srcBadge('ai')}</div>
                  ${esc(state.devAiReply)}
                </div>
              ` : ''}
            </div>

            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-extrabold" style="color:var(--ds-ink)">偏差根因排查与 CAPA 行动表</span>
                ${srcBadge('reg', '对齐 2025 生产监管规定')}
              </div>
              ${ranked.map((item, idx) => `
                <div class="tr-card-soft space-y-2">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-xs font-extrabold" style="color:var(--ds-ink)">#${idx + 1} ${esc(item.cause.text)}</span>
                    <span class="tr-src ${idx === 0 ? 'tr-src-calc' : 'tr-src-example'}">${idx === 0 ? '优先排查' : '备选原因'}</span>
                  </div>
                  ${item.matched.length ? `<div class="text-[11px] text-emerald-700">命中线索：${esc(item.matched.join('；'))}</div>` : ''}
                  <div class="grid grid-cols-1 gap-1.5 text-xs" style="color:var(--ds-ink-2)">
                    <div><strong>需核查数据：</strong>${esc(item.cause.check.join('；'))}</div>
                    <div><strong>验证实验：</strong>${esc(item.cause.verify.join('；'))}</div>
                    <div><strong>处理与预防（CAPA）：</strong>${esc(item.cause.action.join('；'))}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    } else {
      bodyHtml = `
        <div class="space-y-3">
          <div class="text-xs" style="color:var(--ds-muted)">直接调整严重度 S（1～5）、发生度 O（1～5）、可检出度 D（1～5），实时核算风险优先数 RPN = S×O×D（≥ 36 标红重点控制）。 ${srcBadge('calc')}</div>
          <div class="tr-table-wrap">
            <table class="tr-table">
              <thead><tr><th>关键工序</th><th>潜在失效模式与后果</th><th>S</th><th>O</th><th>D</th><th>RPN</th><th>控制措施</th></tr></thead>
              <tbody>
                ${state.fmeaRows.map((r, i) => {
                  const rpn = num(r.S, 3) * num(r.O, 3) * num(r.D, 3);
                  return `
                    <tr>
                      <td class="font-bold">${esc(r.item)}</td>
                      <td class="text-xs"><strong>${esc(r.fail)}</strong> → ${esc(r.eff)}</td>
                      <td><input type="number" min="1" max="5" value="${r.S}" data-tr-fmea="${i}:S" /></td>
                      <td><input type="number" min="1" max="5" value="${r.O}" data-tr-fmea="${i}:O" /></td>
                      <td><input type="number" min="1" max="5" value="${r.D}" data-tr-fmea="${i}:D" /></td>
                      <td class="font-extrabold ${rpn >= 36 ? 'text-rose-600' : (rpn >= 20 ? 'text-amber-600' : 'text-emerald-700')}">${rpn}</td>
                      <td class="text-xs">${esc(r.ctl)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    return `
      <div class="tr-card space-y-4">
        <div class="tr-card-head" style="margin-bottom:0">
          <div>
            <h3 class="tr-card-title">07 · 中试放大、偏差调查与工艺风险控制</h3>
            <p class="tr-card-desc">模拟 100 g 至 100 kg 级非线性物料与传热放大，并内置 7 大常见偏差调查与 FMEA 风险评估。</p>
          </div>
          <div class="tr-subtabs">
            <button type="button" class="tr-subtab ${sub === 'mass' ? 'active' : ''}" data-tr-ssub="mass">非线性物料衡算</button>
            <button type="button" class="tr-subtab ${sub === 'deviation' ? 'active' : ''}" data-tr-ssub="deviation">偏差调查与 CAPA</button>
            <button type="button" class="tr-subtab ${sub === 'fmea' ? 'active' : ''}" data-tr-ssub="fmea">工艺风险 FMEA</button>
          </div>
        </div>
        ${bodyHtml}
      </div>
    `;
  }

  function renderStageRegister(proj) {
    const data = D();
    const curPath = data.PATHS.find((p) => p.id === state.pathId) || data.PATHS[0];
    const totalEv = EVIDENCE_ITEMS.reduce((s, it) => s + num(state.evidenceLevels[it.id], 0), 0);
    const maxEv = EVIDENCE_ITEMS.length * 4;
    const pctEv = Math.round((totalEv / maxEv) * 100);
    const gaps = EVIDENCE_ITEMS.filter((it) => num(state.evidenceLevels[it.id], 0) < 2);
    const gateAdvice = pctEv >= 70 && gaps.length === 0
      ? '证据链较完整，可组织阶段评审并准备进入中试放大与工艺验证。'
      : (pctEv >= 45
        ? '具备初步药学基础，建议优先补齐下方待补缺口后再推进中试。'
        : '仍处早期方案探索阶段，需先完成小试对照与三批复现数据积累。');

    const taskGroups = [
      ['药学研究任务', curPath.tasks.pharm],
      ['药理毒理任务', curPath.tasks.tox],
      ['临床与人用经验', curPath.tasks.clinical],
      ['生产与验证任务', curPath.tasks.prod],
      ['申报与备案节点', curPath.tasks.file]
    ].filter(([, arr]) => arr && arr.length);

    return `
      <div class="tr-card space-y-4">
        <div class="tr-card-head" style="margin-bottom:4px">
          <div>
            <h3 class="tr-card-title">08 · ${esc(proj.herb)}转化全流程清单与阶段评审 ${srcBadge('reg')}</h3>
            <p class="tr-card-desc">对照当前选定研发路径（${esc(curPath.name)}），追踪证据成熟度、识别缺口并生成《药学研究与小试转化报告》。</p>
          </div>
          <button type="button" class="tr-btn tr-btn-primary" data-tr-act="open-report">生成《药学研究与小试转化报告》</button>
        </div>

        <div class="tr-grid-3">
          ${(proj.benchmark || []).map((b, i) => `
            <div class="tr-card-soft flex flex-col justify-between gap-2">
              <div>
                <div class="flex items-center justify-between gap-2 mb-1">
                  <label class="inline-flex items-center gap-1.5 text-xs font-extrabold cursor-pointer" style="color:var(--ds-ink)">
                    <input type="checkbox" ${state.benchmarkDone[i] ? 'checked' : ''} data-tr-bmark="${i}" class="accent-[#0f5c54]" />
                    <span>${i + 1}. ${esc(b.title)}</span>
                  </label>
                  <button type="button" class="tr-btn tr-btn-sm" data-tr-stage="${esc(b.stage)}">去查看</button>
                </div>
                <ul class="text-xs space-y-1 my-1.5" style="color:var(--ds-ink-2);padding-left:16px;list-style:disc">
                  ${b.points.map((pt) => `<li>${esc(pt)}</li>`).join('')}
                </ul>
              </div>
              <div class="text-[11px] font-bold text-emerald-700">阶段产出：${esc(b.out)}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="tr-split-64">
        <div class="tr-card space-y-3">
          <div class="tr-card-head" style="margin-bottom:4px">
            <h3 class="tr-card-title">证据成熟度与待补缺口评估</h3>
            <strong class="text-sm text-emerald-700">综合成熟度 ${pctEv}%</strong>
          </div>
          <div class="tr-bar-track"><div class="tr-bar-fill" style="width:${pctEv}%"></div></div>
          <div class="tr-alert ${pctEv >= 70 && !gaps.length ? 'tr-alert-ok' : ''}"><strong>阶段评审建议：</strong>${esc(gateAdvice)}</div>

          <div class="tr-table-wrap">
            <table class="tr-table">
              <thead><tr><th>关键证据模块</th><th>当前成熟度等级</th><th>状态</th></tr></thead>
              <tbody>
                ${EVIDENCE_ITEMS.map((it) => {
                  const lv = num(state.evidenceLevels[it.id], 0);
                  return `
                    <tr>
                      <td class="font-bold text-xs">${esc(it.name)}</td>
                      <td>
                        <select class="tr-select" style="padding:4px 8px;font-size:0.76rem" data-tr-ev="${esc(it.id)}">
                          ${data.EVIDENCE_LEVELS.map((el) => `<option value="${el.lv}" ${el.lv === lv ? 'selected' : ''}>${el.lv} 级 · ${esc(el.name)}</option>`).join('')}
                        </select>
                      </td>
                      <td><span class="tr-src ${lv >= 3 ? 'tr-src-pharm' : (lv >= 2 ? 'tr-src-reg' : 'tr-src-calc')}">${lv < 2 ? '待补数据' : (lv >= 3 ? '较成熟' : '已小试')}</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="tr-card space-y-3">
          <div class="tr-card-head" style="margin-bottom:4px">
            <h3 class="tr-card-title">研发路线图 · ${esc(curPath.name)} ${srcBadge('reg')}</h3>
          </div>
          ${taskGroups.map(([title, tasks]) => `
            <div class="tr-card-soft">
              <div class="text-xs font-extrabold mb-1.5" style="color:var(--ds-ink)">${esc(title)}</div>
              <ul class="text-xs space-y-1 m-0" style="color:var(--ds-ink-2);padding-left:16px;list-style:disc">
                ${tasks.map((t) => `<li>${esc(t)}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ---------------- 《药学研究与小试转化报告》HTML 与 Markdown 生成 ----------------
  function buildReportData(proj) {
    const data = D();
    const curPath = data.PATHS.find((p) => p.id === state.pathId) || data.PATHS[0];
    const rankedRoutes = scoreRoutes(proj);
    const chosenRoute = rankedRoutes.find((r) => r.route.id === state.selectedRouteId) || rankedRoutes[0];
    const dryRes = calcDryRetention(proj);
    const rankedForms = rankDosageForms(state.dosageInput);
    const chosenForm = rankedForms.find((x) => x.form.id === state.selectedFormId) || rankedForms[0];
    const su = calcScaleUp(proj);
    const gaps = EVIDENCE_ITEMS.filter((it) => num(state.evidenceLevels[it.id], 0) < 2).map((x) => x.name);
    const dev = data.DEVIATIONS.find((d) => d.id === state.devId) || data.DEVIATIONS[0];
    return { curPath, chosenRoute, dryRes, chosenForm, su, gaps, dev };
  }

  function buildReportHtml(proj) {
    const r = buildReportData(proj);
    const nowStr = new Date().toISOString().slice(0, 10);
    return `
      <div class="tr-report-sheet">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;border-bottom:2px solid #062b26;padding-bottom:10px;margin-bottom:12px">
          <div>
            <h1>《药学研究与小试转化报告》— ${esc(proj.herb)}</h1>
            <div style="font-size:0.78rem;color:#475569">项目名称：${esc(proj.title)} ｜ 生成日期：${nowStr}</div>
          </div>
          <div style="text-align:right;font-size:0.74rem;color:#065f46;font-weight:700">研究方案 / 小试模拟报告<br />非直接生产放行文件</div>
        </div>

        <div style="padding:10px 12px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;font-size:0.76rem;color:#78350f;margin-bottom:12px">
          <strong>数据可信度与法规边界声明：</strong>本报告明确区分「药典标准」「法规文件」「文献教材」「用户实测」「平台演算」「示例数据」。其中平台演算与示例数据仅用于药学研究设计与教学训练，实际生产与申报必须经实验室研究、三批工艺验证、质量审核及法定注册/备案程序，药典限度须以《中国药典》2025 年版（2025 年 10 月 1 日施行）正文原文核对。
        </div>

        <h3>一、产品定位与研发路径 [法规文件]</h3>
        <table>
          <tr><th style="width:22%">研发路径</th><td>${esc(r.curPath.name)}（${esc(r.curPath.cat)}）</td><th style="width:22%">主要法规依据</th><td>${esc(r.curPath.reg)}</td></tr>
          <tr><th>临床需求定位</th><td>${esc(state.positionForm.clinicalNeed)}</td><th>人群与预期剂型</th><td>${esc(state.positionForm.population)} ｜ ${esc(state.positionForm.targetForm)}</td></tr>
          <tr><th>人用经验基础</th><td colspan="3">${esc(state.positionForm.humanExp)}</td></tr>
        </table>

        <h3>二、药材基原、炮制与法定质控 [药典标准 / 文献教材]</h3>
        <p><strong>基原与产地：</strong>${esc(proj.source)} ${esc(proj.regions)}</p>
        <p><strong>前处理与炮制要点：</strong>${esc(state.procCustomNote)}</p>
        <table>
          <thead><tr><th>质量项目</th><th>参考限度</th><th>来源</th></tr></thead>
          <tbody>
            ${(proj.herbQc || []).map((q) => `<tr><td>${esc(q.item)}</td><td>${esc(q.limit)}</td><td>${esc(D().SOURCES[q.src]?.label || q.src)}</td></tr>`).join('')}
          </tbody>
        </table>

        <h3>三、提取纯化、浓缩干燥与制剂成型 [平台演算]</h3>
        <table>
          <tr><th style="width:24%">选定提取工艺路线</th><td>${esc(r.chosenRoute.route.name)}（综合工艺得分 ${r.chosenRoute.score}/100，转移率分 ${r.chosenRoute.transferScore}）</td></tr>
          <tr><th>浓缩与干燥条件</th><td>浓缩 ${state.dryCfg.concTemp} ℃ × ${state.dryCfg.concHours} h；干燥 ${state.dryCfg.dryTemp} ℃ × ${state.dryCfg.dryHours} h；主成分估算保留率：${r.dryRes.results.map((x) => `${x.marker.name} ${x.retainTotal}%`).join('、')}</td></tr>
          <tr><th>选定剂型与小试处方</th><td>${esc(r.chosenForm.form.name)}（${esc(r.chosenForm.form.ref)}，适配分 ${r.chosenForm.score}），日服提取物 ${state.dosageInput.daily} g，辅料占比 ${state.excipientRatio}%</td></tr>
          <tr><th>制剂工艺流程</th><td>${esc(r.chosenForm.form.steps.join(' → '))}</td></tr>
        </table>

        <h3>四、三批小试一致性与非线性中试放大核算 [${state.batchEdited ? '用户实测' : '示例数据'} / 平台演算]</h3>
        <table>
          <thead><tr><th>指标</th><th>批次 01</th><th>批次 02</th><th>批次 03</th><th>均值 ± SD</th><th>RSD%</th></tr></thead>
          <tbody>
            ${state.batchRows.map((b) => {
              const st = calcBatchStats(b.vals);
              return `<tr><td>${esc(b.name)}（${esc(b.unit)}）</td><td>${b.vals[0]}</td><td>${b.vals[1]}</td><td>${b.vals[2]}</td><td>${st.mean} ± ${st.sd}</td><td>${st.rsd}%（限≤${b.rsd}%）</td></tr>`;
            }).join('')}
          </tbody>
        </table>
        <p><strong>中试放大核算（目标批量 ${r.su.batchKg} kg，折干 ${r.su.dryHerbKg} kg）：</strong>预计浸膏干重 ${r.su.netExtractKg} kg，推荐提取罐容积 ${r.su.maxTankVolL} L，溶剂总投量 ${r.su.totalSolventL} L（可回收 ${r.su.totalRecoverL} L），预计提取总时长 ${r.su.totalExtractH} h、浓缩时长 ${r.su.concHoursEst} h；分离建议「${esc(r.su.filterAdvice)}」，浓缩建议「${esc(r.su.concAdvice)}」。直接物料能耗估算约 ¥${r.su.totalDirectCost}（¥${r.su.costPerKgExtract}/kg 浸膏，按示例单价）。</p>

        <h3>五、药效安全评价、风险清单与待补证据缺口</h3>
        <p><strong>药效与安全对照：</strong>${esc(proj.efficacy?.aim || '')}（对照分组：${(proj.efficacy?.controls || []).map((c) => c[0]).join('、')}）。</p>
        <p><strong>高关注工艺风险（FMEA）：</strong>${state.fmeaRows.map((x) => `${x.item}（RPN=${num(x.S) * num(x.O) * num(x.D)}，控制：${x.ctl}）`).join('；')}。</p>
        <p><strong>当前尚缺核心数据（成熟度 &lt; 2 级）：</strong>${r.gaps.length ? esc(r.gaps.join('、')) : '无明显缺口（各项均已达到小试及以上阶段）'}。</p>
      </div>
    `;
  }

  function buildReportMarkdown(proj) {
    const r = buildReportData(proj);
    const lines = [
      `# 《药学研究与小试转化报告》— ${proj.herb}`,
      '',
      `> **声明**：本报告为研究方案／小试模拟方案，明确区分药典标准、法规文件、文献教材、用户实测与平台演算，不可直接替代生产验证或申报资料。药典标准须以《中国药典》2025 年版（2025-10-01 施行）正文原文复核。`,
      '',
      `## 一、产品定位与研发路径 [法规文件]`,
      `- 研发路径：${r.curPath.name}（${r.curPath.cat}）`,
      `- 法规依据：${r.curPath.reg}`,
      `- 临床需求：${state.positionForm.clinicalNeed}`,
      `- 适用人群与剂型：${state.positionForm.population} / ${state.positionForm.targetForm}`,
      '',
      `## 二、药材、炮制与质控 [药典标准]`,
      `- 基原：${proj.source}`,
      `- 炮制要点：${state.procCustomNote}`,
      ...(proj.herbQc || []).map((q) => `- ${q.item}：${q.limit} [${D().SOURCES[q.src]?.label || q.src}]`),
      '',
      `## 三、提取、干燥与制剂成型 [平台演算]`,
      `- 选定提取工艺：${r.chosenRoute.route.name}（综合分 ${r.chosenRoute.score}，转移率分 ${r.chosenRoute.transferScore}）`,
      `- 浓缩干燥：浓缩 ${state.dryCfg.concTemp}℃×${state.dryCfg.concHours}h，干燥 ${state.dryCfg.dryTemp}℃×${state.dryCfg.dryHours}h，估算保留率 ${r.dryRes.results.map((x) => `${x.marker.name} ${x.retainTotal}%`).join('、')}`,
      `- 推荐剂型：${r.chosenForm.form.name}（${r.chosenForm.form.ref}，辅料占比 ${state.excipientRatio}%）`,
      `- 工艺流程：${r.chosenForm.form.steps.join(' → ')}`,
      '',
      `## 四、三批一致性与中试放大核算`,
      ...state.batchRows.map((b) => {
        const st = calcBatchStats(b.vals);
        return `- ${b.name}：${b.vals.join(' / ')} ${b.unit}，均值 ${st.mean} ± ${st.sd}，RSD ${st.rsd}%（限≤${b.rsd}%）[${b.isUser ? '用户实测' : '示例数据'}]`;
      }),
      `- 放大批量：${r.su.batchKg} kg（折干 ${r.su.dryHerbKg} kg）→ 浸膏干重 ${r.su.netExtractKg} kg，推荐提取罐 ${r.su.maxTankVolL} L，浓缩约 ${r.su.concHoursEst} h，直接成本估算 ¥${r.su.totalDirectCost} [平台演算]`,
      '',
      `## 五、待补证据缺口`,
      r.gaps.length ? r.gaps.map((g) => `- ${g}`).join('\n') : '- 各项核心证据均已达到小试及以上阶段'
    ];
    return lines.join('\n');
  }

  // ---------------- 主渲染器 ----------------
  let deferredRenderTimer = null;
  function scheduleNumericRender() {
    clearTimeout(deferredRenderTimer);
    deferredRenderTimer = setTimeout(() => {
      deferredRenderTimer = null;
      render();
    }, 150);
  }

  function render() {
    clearTimeout(deferredRenderTimer);
    deferredRenderTimer = null;
    const mount = document.getElementById('v18TranslationPage');
    const data = D();
    if (!mount || !data) return;
    const proj = getProject();
    if (!proj) return;

    const bankTopics = (window.TCM_LAB_API && window.TCM_LAB_API.getAllTopics) ? window.TCM_LAB_API.getAllTopics() : [];
    const curStageIdx = data.STAGES.findIndex((s) => s.id === state.stage);
    const prevStage = curStageIdx > 0 ? data.STAGES[curStageIdx - 1] : null;
    const nextStage = curStageIdx < data.STAGES.length - 1 ? data.STAGES[curStageIdx + 1] : null;

    let stageHtml = '';
    if (state.stage === 'position') stageHtml = renderStagePosition(proj);
    else if (state.stage === 'herb') stageHtml = renderStageHerb(proj);
    else if (state.stage === 'extract') stageHtml = renderStageExtract(proj);
    else if (state.stage === 'dry') stageHtml = renderStageDry(proj);
    else if (state.stage === 'form') stageHtml = renderStageForm(proj);
    else if (state.stage === 'quality') stageHtml = renderStageQuality(proj);
    else if (state.stage === 'scale') stageHtml = renderStageScale(proj);
    else stageHtml = renderStageRegister(proj);

    mount.innerHTML = `
      <div class="tr-wrap">
        <section class="tr-hero">
          <div class="tr-hero-top">
            <div>
              <div class="tr-hero-kicker">中药药学研究与小试—中试产业转化训练 · ${esc(proj.badge)}</div>
              <h2>${esc(proj.title)}</h2>
              <p class="tr-hero-sub">从实验室提取方案走向可验证、可放大、可评价、可合规申报的产品研究方案。保留现有教学实验工坊，按八大研发转化节点系统推演。</p>
            </div>
            <div class="tr-hero-actions">
              <button type="button" class="tr-btn-light" data-tr-act="open-report">药学研究与转化报告</button>
              <button type="button" class="tr-btn-ghost" data-tr-act="open-regs">法规与 2025 药典</button>
              <button type="button" class="tr-btn-ghost" data-v16-go="workflow">← 返回六步实验工坊</button>
            </div>
          </div>

          <div class="tr-proj-bar">
            <span class="tr-proj-label">标杆项目：</span>
            ${Object.values(data.PROJECTS).map((p) => `
              <button type="button" class="tr-proj-pill ${proj.id === p.id ? 'active' : ''}" data-tr-project="${esc(p.id)}">
                <span>${esc(p.herb)}</span>
                <span class="tr-pill-sub">${esc(p.badge)}</span>
              </button>
            `).join('')}
            <select class="tr-bank-select" data-tr-import-bank="1" aria-label="从全站药材题库导入任意课题进入产业转化">
              <option value="">＋ 导入题库药材（${bankTopics.length || 136} 项）…</option>
              ${bankTopics.map((t) => `<option value="${esc(t.id)}" ${proj.bankTopicId === t.id ? 'selected' : ''}>${esc(t.herb)} · ${esc(t.compound || t.category || '')}</option>`).join('')}
            </select>
          </div>
        </section>

        <section class="tr-trust-strip">
          <div class="tr-trust-legend">
            <strong style="font-size:0.75rem">数据来源分层：</strong>
            ${srcBadge('pharm')}
            ${srcBadge('reg')}
            ${srcBadge('lit')}
            ${srcBadge('user')}
            ${srcBadge('calc')}
            ${srcBadge('example')}
          </div>
          <div class="tr-trust-links">
            <span>依据：《中国药典》2025 年版（2025.10.01 施行）· 中药生产监管专门规定（2026.03.01 施行）</span>
          </div>
        </section>

        <nav class="tr-stepper" aria-label="产业转化八阶段主线">
          ${data.STAGES.map((st) => `
            <button type="button" class="tr-step-btn ${st.id === state.stage ? 'active' : ''}" data-tr-stage="${esc(st.id)}">
              <div class="tr-step-head"><span>${esc(st.no)}</span><span>${st.id === state.stage ? '当前' : ''}</span></div>
              <div class="tr-step-name">${esc(st.name)}</div>
              <div class="tr-step-out">${esc(st.output)}</div>
            </button>
          `).join('')}
        </nav>

        ${stageHtml}

        <div class="tr-stage-foot">
          <div>
            ${prevStage ? `<button type="button" class="tr-btn" data-tr-stage="${esc(prevStage.id)}">← 上一步：${esc(prevStage.no)} ${esc(prevStage.name)}</button>` : `<button type="button" class="tr-btn" data-v16-go="home">← 返回首页总览</button>`}
          </div>
          <div class="text-xs" style="color:var(--ds-muted)">
            当前产出：<strong>${esc(data.STAGES[curStageIdx]?.output || '')}</strong> · 本模块均为研究与小试模拟推演
          </div>
          <div>
            ${nextStage ? `<button type="button" class="tr-btn tr-btn-primary" data-tr-stage="${esc(nextStage.id)}">下一步：${esc(nextStage.no)} ${esc(nextStage.name)} →</button>` : `<button type="button" class="tr-btn tr-btn-primary" data-tr-act="open-report">预览并导出转化报告</button>`}
          </div>
        </div>
      </div>
    `;

    renderModals(proj);
  }

  function ensureModals() {
    if (!document.getElementById('trRegModal')) {
      const m1 = document.createElement('div');
      m1.id = 'trRegModal';
      m1.className = 'tr-modal-mask hidden';
      document.body.appendChild(m1);
      m1.addEventListener('click', (e) => {
        if (e.target === m1 || e.target.closest('[data-tr-close-modal]')) {
          state.regModalOpen = false;
          m1.classList.add('hidden');
        }
      });
    }
    if (!document.getElementById('trReportModal')) {
      const m2 = document.createElement('div');
      m2.id = 'trReportModal';
      m2.className = 'tr-modal-mask hidden';
      document.body.appendChild(m2);
      m2.addEventListener('click', (e) => {
        if (e.target === m2 || e.target.closest('[data-tr-close-report]')) {
          state.reportModalOpen = false;
          m2.classList.add('hidden');
        } else if (e.target.closest('[data-tr-print-report]')) {
          document.body.classList.add('tr-printing-report');
          window.print();
          setTimeout(() => document.body.classList.remove('tr-printing-report'), 400);
        } else if (e.target.closest('[data-tr-copy-md]')) {
          const md = buildReportMarkdown(getProject());
          navigator.clipboard?.writeText(md).then(() => {
            const btn = e.target.closest('[data-tr-copy-md]');
            if (btn) { btn.textContent = '✓ 已复制 Markdown'; setTimeout(() => { btn.textContent = '复制 Markdown'; }, 1800); }
          }).catch(() => {});
        }
      });
    }
  }

  function renderModals(proj) {
    ensureModals();
    const data = D();
    const regEl = document.getElementById('trRegModal');
    if (regEl) {
      regEl.classList.toggle('hidden', !state.regModalOpen);
      if (state.regModalOpen && data) {
        regEl.innerHTML = `
          <div class="tr-modal-shell">
            <div class="tr-modal-bar">
              <div>
                <strong style="font-size:0.95rem;color:var(--ds-ink)">现行中药法规节点与《中国药典》版本说明</strong>
                <div style="font-size:0.74rem;color:var(--ds-muted)">引用药典限度或申报要求前，请务必对照官方最新原文核实。</div>
              </div>
              <button type="button" class="tr-btn tr-btn-sm" data-tr-close-modal="1">关闭</button>
            </div>
            <div class="tr-modal-body space-y-3">
              ${data.REGS.map((rg) => `
                <div style="padding:12px 14px;border:1px solid #cbd5e1;border-radius:12px;background:#f8fafc">
                  <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
                    <strong style="font-size:0.88rem;color:#062b26">${esc(rg.name)}</strong>
                    <a href="${esc(rg.url)}" target="_blank" rel="noopener noreferrer" style="font-size:0.75rem;color:#0f5c54;font-weight:700">查看官方来源 ↗</a>
                  </div>
                  <div style="font-size:0.78rem;color:#334155;margin-top:4px"><strong>发布与施行节点：</strong>${esc(rg.node)}</div>
                  <div style="font-size:0.78rem;color:#475569;margin-top:3px"><strong>在平台中的对应范围：</strong>${esc(rg.use)}</div>
                </div>
              `).join('')}
              <div style="padding:11px 14px;border:1px solid #fde68a;border-radius:12px;background:#fffbeb;font-size:0.78rem;color:#78350f;line-height:1.6">
                <strong>勘误与适用范围提示：</strong>2025 年版《中国药典》已于 2025 年 10 月 1 日起施行，部分品种在含量测定、农残及重金属项下有修订。若发现站内个别药材限度仍沿用 2020 年版，请通过页脚「意见反馈」提交勘误。
              </div>
            </div>
          </div>
        `;
      }
    }

    const repEl = document.getElementById('trReportModal');
    if (repEl) {
      repEl.classList.toggle('hidden', !state.reportModalOpen);
      if (state.reportModalOpen && proj) {
        repEl.innerHTML = `
          <div class="tr-modal-shell">
            <div class="tr-modal-bar">
              <div>
                <strong style="font-size:0.95rem;color:var(--ds-ink)">《药学研究与小试转化报告》预览</strong>
                <div style="font-size:0.74rem;color:var(--ds-muted)">已按数据来源自动标注 · 支持 A4 打印或复制 Markdown</div>
              </div>
              <div class="flex items-center gap-2">
                <button type="button" class="tr-btn tr-btn-sm" data-tr-copy-md="1">复制 Markdown</button>
                <button type="button" class="tr-btn tr-btn-sm tr-btn-primary" data-tr-print-report="1">打印 / 导出 PDF</button>
                <button type="button" class="tr-btn tr-btn-sm" data-tr-close-report="1">关闭</button>
              </div>
            </div>
            <div class="tr-modal-body">${buildReportHtml(proj)}</div>
          </div>
        `;
      }
    }
  }

  // ---------------- AI 偏差排查补充建议（调用现有云端代理，明确标注智能建议） ----------------
  async function askAiDeviation() {
    if (state.devAiLoading) return;
    const data = D();
    const proj = getProject();
    const dev = data.DEVIATIONS.find((d) => d.id === state.devId) || data.DEVIATIONS[0];
    const clues = (dev.clues || []).filter((c) => state.devClues[c.id]).map((c) => c.text);
    state.devAiLoading = true;
    render();
    try {
      if (window.TCMCloudAI && window.TCMCloudAI.complete) {
        const res = await window.TCMCloudAI.complete({
          messages: [
            { role: 'system', content: '你是中药制药与质量管理专家，严格依据现行药品 GMP 与《中药生产监督管理专门规定》开展偏差调查。回答简明务实，不编造不存在的数据或标准。' },
            { role: 'user', content: `针对「${proj.herb}（${proj.title}）」小试/中试过程中的偏差「${dev.title}：${dev.phenomenon}」，已观察到线索：${clues.length ? clues.join('；') : '尚未勾选具体线索'}。请按“1. 重点核查记录 2. 建议验证对照实验 3. 纠正与预防措施（CAPA）”三段给出简洁可执行的排查建议（260字内）。` }
          ],
          expectJson: false
        });
        state.devAiReply = String(res?.content || '暂未获取到补充建议，请参考右侧结构化 CAPA 清单。').trim();
      } else {
        state.devAiReply = '当前处于离线模式，已根据所选线索自动完成右侧根因排序与 CAPA 清单生成。';
      }
    } catch (err) {
      state.devAiReply = `智能补充通道暂时不可用（${err?.message || '网络波动'}），请直接依据右侧结构化排查与验证清单开展偏差调查。`;
    } finally {
      state.devAiLoading = false;
      render();
    }
  }

  // ---------------- 事件委托绑定 ----------------
  function bindEvents() {
    const mount = document.getElementById('v18TranslationPage');
    if (!mount || mount.dataset.trBound === '1') return;
    mount.dataset.trBound = '1';

    mount.addEventListener('click', (e) => {
      const stageBtn = e.target.closest('[data-tr-stage]');
      if (stageBtn) {
        state.stage = stageBtn.dataset.trStage;
        render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const projBtn = e.target.closest('[data-tr-project]');
      if (projBtn) {
        state.projectId = projBtn.dataset.trProject;
        loadProjectState(getProject());
        render();
        return;
      }

      const pathBtn = e.target.closest('[data-tr-path]');
      if (pathBtn) {
        state.pathId = pathBtn.dataset.trPath;
        render();
        return;
      }

      const procTog = e.target.closest('[data-tr-proc-toggle]');
      if (procTog) {
        const oid = procTog.dataset.trProcToggle;
        state.procSelected[oid] = !state.procSelected[oid];
        render();
        return;
      }

      const wPreset = e.target.closest('[data-tr-wpreset]');
      if (wPreset) {
        const k = wPreset.dataset.trWpreset;
        if (WEIGHT_PRESETS[k]) {
          state.routePreset = k;
          state.routeWeights = Object.assign({}, WEIGHT_PRESETS[k].w);
          render();
        }
        return;
      }

      const formBtn = e.target.closest('[data-tr-pick-form]');
      if (formBtn) {
        state.selectedFormId = formBtn.dataset.trPickForm;
        render();
        return;
      }

      const qSub = e.target.closest('[data-tr-qsub]');
      if (qSub) { state.qualitySub = qSub.dataset.trQsub; render(); return; }

      const sSub = e.target.closest('[data-tr-ssub]');
      if (sSub) { state.scaleSub = sSub.dataset.trSsub; render(); return; }

      const goDev = e.target.closest('[data-tr-go-dev]');
      if (goDev) {
        state.stage = 'scale';
        state.scaleSub = 'deviation';
        state.devId = goDev.dataset.trGoDev || 'repro';
        render();
        return;
      }

      const bKg = e.target.closest('[data-tr-batch-kg]');
      if (bKg) {
        state.scaleCfg.batchKg = num(bKg.dataset.trBatchKg, 10);
        render();
        return;
      }

      const devBtn = e.target.closest('[data-tr-dev]');
      if (devBtn) {
        state.devId = devBtn.dataset.trDev;
        state.devClues = {};
        state.devAiReply = '';
        render();
        return;
      }

      const act = e.target.closest('[data-tr-act]')?.dataset.trAct;
      if (act === 'open-regs') { state.regModalOpen = true; renderModals(getProject()); return; }
      if (act === 'open-report') { state.reportModalOpen = true; renderModals(getProject()); return; }
      if (act === 'ask-ai-dev') { askAiDeviation(); return; }
    });

    mount.addEventListener('change', (e) => {
      const t = e.target;
      if (t.matches('[data-tr-import-bank]')) {
        const tid = t.value;
        if (tid) importBankTopic(tid);
        return;
      }
      if (t.matches('[data-tr-pick-route]')) {
        state.selectedRouteId = t.dataset.trPickRoute;
        render();
        return;
      }
      if (t.matches('[data-tr-dry]')) {
        const k = t.dataset.trDry;
        state.dryCfg[k] = (k === 'concMethod' || k === 'dryMethod') ? t.value : num(t.value, 60);
        render();
        return;
      }
      if (t.matches('[data-tr-dry-check]')) {
        state.dryCfg[t.dataset.trDryCheck] = Boolean(t.checked);
        render();
        return;
      }
      if (t.matches('[data-tr-dos]')) {
        const k = t.dataset.trDos;
        state.dosageInput[k] = (k === 'route' || k === 'population' || k === 'onset') ? t.value : num(t.value, 1);
        const top = rankDosageForms(state.dosageInput)[0];
        if (top) state.selectedFormId = top.form.id;
        render();
        return;
      }
      if (t.matches('[data-tr-exc]')) {
        state.excipientRatio = num(t.value, 35);
        render();
        return;
      }
      if (t.matches('[data-tr-batch]')) {
        const [rIdx, bIdx] = t.dataset.trBatch.split(':').map(Number);
        if (state.batchRows[rIdx]) {
          state.batchRows[rIdx].vals[bIdx] = num(t.value, 0);
          state.batchRows[rIdx].isUser = true;
          state.batchEdited = true;
          scheduleNumericRender();
        }
        return;
      }
      if (t.matches('[data-tr-sim]')) {
        const i = Number(t.dataset.trSim);
        state.similarity[i] = Math.min(1, Math.max(0, num(t.value, 0.95)));
        state.batchEdited = true;
        scheduleNumericRender();
        return;
      }
      if (t.matches('[data-tr-scale]')) {
        state.scaleCfg[t.dataset.trScale] = num(t.value, 1);
        scheduleNumericRender();
        return;
      }
      if (t.matches('[data-tr-clue]')) {
        state.devClues[t.dataset.trClue] = Boolean(t.checked);
        render();
        return;
      }
      if (t.matches('[data-tr-fmea]')) {
        const [i, col] = t.dataset.trFmea.split(':');
        const row = state.fmeaRows[Number(i)];
        if (row) {
          row[col] = Math.min(5, Math.max(1, num(t.value, 3)));
          scheduleNumericRender();
        }
        return;
      }
      if (t.matches('[data-tr-bmark]')) {
        state.benchmarkDone[t.dataset.trBmark] = Boolean(t.checked);
        return;
      }
      if (t.matches('[data-tr-ev]')) {
        state.evidenceLevels[t.dataset.trEv] = num(t.value, 0);
        render();
        return;
      }
      if (t.matches('[data-tr-proc-val]')) {
        const [oid, field] = t.dataset.trProcVal.split(':');
        if (!state.procUserData[oid]) state.procUserData[oid] = {};
        state.procUserData[oid][field] = t.value === '' ? null : num(t.value, 0);
        scheduleNumericRender();
      }
    });

    mount.addEventListener('input', (e) => {
      const t = e.target;
      if (t.matches('[data-tr-pos]')) {
        state.positionForm[t.dataset.trPos] = t.value;
      } else if (t.matches('[data-tr-proc-note]')) {
        state.procCustomNote = t.value;
      } else if (t.matches('[data-tr-rweight]')) {
        state.routePreset = 'custom';
        state.routeWeights[t.dataset.trRweight] = num(t.value, 3);
        render();
      } else if (t.matches('[data-tr-dry]') && t.type === 'range') {
        state.dryCfg[t.dataset.trDry] = num(t.value, 60);
        render();
      } else if (t.matches('[data-tr-dos]') && t.type === 'range') {
        state.dosageInput[t.dataset.trDos] = num(t.value, 2);
        render();
      } else if (t.matches('[data-tr-exc]')) {
        state.excipientRatio = num(t.value, 35);
        render();
      }
    });
  }

  // ---------------- 对外公共方法 ----------------
  function importBankTopic(topicId, opts = {}) {
    const data = D();
    if (!data) return;
    const all = (window.TCM_LAB_API && window.TCM_LAB_API.getAllTopics) ? window.TCM_LAB_API.getAllTopics() : [];
    const found = all.find((x) => x.id === topicId);
    if (!found) return;

    // 若命中 4 个精编标杆药材，优先使用深度标杆项目
    const herbMap = { '丹参': 'danshen', '黄芩': 'huangqin', '薄荷': 'bohe', '延胡索': 'yanhusuo' };
    if (herbMap[found.herb] && data.PROJECTS[herbMap[found.herb]]) {
      state.projectId = herbMap[found.herb];
    } else {
      const dyn = buildDynamicProject(found);
      state.dynamicProjects[dyn.id] = dyn;
      state.projectId = dyn.id;
    }
    loadProjectState(getProject());
    if (opts.stage) state.stage = opts.stage;
    if (window.TCM_V16_PORTAL && window.TCM_V16_PORTAL.go) {
      window.TCM_V16_PORTAL.go('translation');
    } else {
      render();
    }
  }

  function openProject(projId, stage = 'position') {
    const data = D();
    if (data && data.PROJECTS[projId]) {
      state.projectId = projId;
      loadProjectState(getProject());
    }
    state.stage = stage;
    if (window.TCM_V16_PORTAL && window.TCM_V16_PORTAL.go) {
      window.TCM_V16_PORTAL.go('translation');
    } else {
      render();
    }
  }

  function openDeviation(devId = 'yield') {
    state.stage = 'scale';
    state.scaleSub = 'deviation';
    state.devId = devId;
    if (window.TCM_V16_PORTAL && window.TCM_V16_PORTAL.go) {
      window.TCM_V16_PORTAL.go('translation');
    } else {
      render();
    }
  }

  function openReport() {
    state.reportModalOpen = true;
    renderModals(getProject());
  }

  function init() {
    const proj = getProject();
    if (proj && !state.dosageInput) loadProjectState(proj);
    bindEvents();
    render();
  }

  window.TCM_TRANSLATION = {
    init,
    render,
    openProject,
    importBankTopic,
    openDeviation,
    openReport,
    getState: () => state
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 60));
  } else {
    setTimeout(init, 60);
  }
})();
