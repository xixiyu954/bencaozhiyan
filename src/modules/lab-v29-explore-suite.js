/**
 * 本草智研 v29.2 · 板块四：知识图谱与可视化探索系统（4.1 ~ 4.5 深度优化版）
 * - 4.1 中药化学知识图谱：贝塞尔曲线五层联动 + 节点搜索定位 + 缩放控制 + 流动高亮 + 跨模块跳转
 * - 4.2 极性宇宙探索器：极性分区网格 + 零重叠星图 + 混合溶剂黄金配比一键匹配 + 实时星标与 Top-3 推荐
 * - 4.3 工艺流水线沙盘：2.5D 八工段动态物料管道 + 预设工况切换 + 瓶颈工段自动诊断 + 级联产率仿真
 * - 4.4 实验时间轴导演模式：4 套经典剧本（24 分镜）+ 关键参数徽章 + 进度条 + localStorage 持久化批注 + 课件导出
 * - 4.5 对比显微镜：119 味全题库可选 + 样本互换 + 差异过滤 + UV 紫外双谱 / 提取动力学双曲线一键切换
 */
(function () {
  "use strict";

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var modalOpen = false;
  var activeTab = "kg"; // 'kg' | 'polarity' | 'pipeline' | 'timeline' | 'microscope'

  // ==================== 4.1 知识图谱状态 ====================
  var kgState = { filter: "全部", selectedId: "comp_baicalin", search: "", searchMsg: "", zoom: 1.0, panX: 0, panY: 0 };

  var KG_CORE_RELATIONS = [
    { herb: "黄芩", comp: "黄芩苷", cat: "黄酮", proc: "沸水杀酶酸沉", rig: "常压煎煮/回流", det: "HPLC 280nm + FeCl₃", note: "内源黄芩酶遇温水易水解黄芩苷变绿，须沸水瞬时杀酶后调酸至 pH 1.5~2.0 析晶。" },
    { herb: "槐米", comp: "芦丁 / 槲皮素", cat: "黄酮", proc: "硼砂碱提酸沉", rig: "热回流提取装置", det: "AlCl₃ 荧光 + 盐酸镁粉", note: "加入 0.4% 硼砂络合保护邻二酚羟基免受碱性氧化，随后酸沉得高纯芦丁。" },
    { herb: "银杏叶", comp: "槲皮素", cat: "黄酮", proc: "70%乙醇树脂纯化", rig: "热回流提取装置", det: "AlCl₃ 荧光 + HPLC", note: "70% 乙醇兼顾黄酮苷与萜内酯溶出，D101 大孔树脂富集脱除水溶性糖类。" },
    { herb: "丹参", comp: "丹参酮 IIA", cat: "醌类", proc: "95%乙醇避光回流", rig: "热回流提取装置", det: "HPLC 270nm + TLC日光", note: "脂溶性邻菲醌对光热敏感，选用 95% 乙醇 78℃ 避光回流并 ≤50℃ 减压旋蒸。" },
    { herb: "大黄", comp: "大黄酸 / 大黄素", cat: "醌类", proc: "pH梯度萃取", rig: "索氏连续虹吸器", det: "碱液显红 + TLC", note: "利用游离蒽醌酸性强弱（大黄酸 > 大黄素 > 大黄酚）依次用 5% NaHCO₃ / Na₂CO₃ / NaOH 分离。" },
    { herb: "黄连", comp: "盐酸小檗碱", cat: "生物碱", proc: "酸水渗漉盐析", rig: "常温渗漉柱", det: "碘化铋钾 + UV 365nm", note: "0.5% 硫酸水冷浸渗漉成硫酸小檗碱溶出，调酸并加 8%~10% NaCl 盐析得黄色结晶。" },
    { herb: "延胡索", comp: "延胡索乙素", cat: "生物碱", proc: "醋炙成盐增溶", rig: "热回流提取装置", det: "碱板TLC + 碘蒸气荧光", note: "叔胺型生物碱经醋炙成醋酸盐显著提高水溶性与溶出率，TLC 须用氨蒸气抑制拖尾。" },
    { herb: "金银花", comp: "绿原酸", cat: "苯丙素", proc: "42℃微酸超声", rig: "超声辅助提取仪", det: "HPLC 327nm + 蓝荧光", note: "含酯键与邻二酚羟基，高温碱性极易异构化分解，须 42℃ pH 4~5 超声短时提取。" },
    { herb: "薄荷", comp: "薄荷脑", cat: "挥发油", proc: "水蒸气共沸蒸馏", rig: "水蒸气蒸馏器", det: "GC法 + 香草醛显色", note: "单萜醇具强挥发性且不溶于水，借水蒸气共沸在低于沸点下温和馏出并冷却分油。" },
    { herb: "当归", comp: "藁本内酯", cat: "挥发油", proc: "水蒸气共沸蒸馏", rig: "水蒸气蒸馏器", det: "GC-MS + TLC荧光", note: "苯酞类挥发油易氧化聚合，水蒸气蒸馏配合避光密闭收集可显著提升保留率。" },
    { herb: "人参", comp: "人参皂苷 Rg1", cat: "皂苷", proc: "70%乙醇树脂纯化", rig: "热回流提取装置", det: "香草醛高氯酸 + HPLC", note: "两亲性三萜皂苷用 70% 乙醇既避开大量淀粉/多糖溶出，又利于后续大孔树脂梯度洗脱。" },
    { herb: "甘草", comp: "甘草酸", cat: "皂苷", proc: "氨水碱提酸沉", rig: "常压煎煮/回流", det: "HPLC 237nm + 泡沫试验", note: "甘草酸含三羧基呈强酸性，稀氨水成铵盐增溶提取后，加硫酸调 pH 2 析出甘草酸粗品。" },
    { herb: "青蒿", comp: "青蒿素", cat: "挥发油", proc: "低温乙醚/石油醚浸提", rig: "常温渗漉柱", det: "HPLC-ELSD + 香草醛显色", note: "含过氧桥结构对热与酸碱极敏感，必须采用低沸点非极性溶剂低温冷浸避光提取。" },
    { herb: "苦参", comp: "苦参碱", cat: "生物碱", proc: "酸水渗漉盐析", rig: "常温渗漉柱", det: "碘化铋钾 + HPLC 220nm", note: "喹诺里西啶类双稠哌啶生物碱既溶于水又溶于氯仿，酸水渗漉后阳离子树脂富集纯化。" },
    { herb: "麻黄", comp: "盐酸麻黄碱", cat: "生物碱", proc: "水蒸气共沸蒸馏", rig: "水蒸气蒸馏器", det: "双缩脲反应 + HPLC 210nm", note: "有机胺类生物碱游离态具挥发性，碱化后可借水蒸气蒸馏与高沸点杂质分离。" }
  ];

  function normalizeKgCat(catStr) {
    var s = String(catStr || "");
    if (/黄酮/.test(s)) return "黄酮";
    if (/蒽醌|醌/.test(s)) return "醌类";
    if (/生物碱/.test(s)) return "生物碱";
    if (/苯丙素|有机酸|酚酸/.test(s)) return "苯丙素";
    if (/挥发油/.test(s)) return "挥发油";
    if (/内酯|环烯醚萜/.test(s)) return "萜内酯";
    if (/香豆素|木脂素/.test(s)) return "香豆素/木脂素";
    if (/皂苷|三萜/.test(s)) return "皂苷";
    if (/甾体|强心苷/.test(s)) return "甾体/强心苷";
    if (/氰苷|多糖/.test(s)) return "氰苷/多糖";
    return "黄酮";
  }

  function getAllKgRelations() {
    var out = KG_CORE_RELATIONS.slice();
    var seenKey = {};
    out.forEach(function (r) { seenKey[r.herb + "|" + r.comp] = true; });
    var api = window.TCM_LAB_API;
    var all = (api && api.getAllTopics) ? api.getAllTopics() : [];
    var rigMap = {
      reflux: "热回流提取装置", steam: "水蒸气蒸馏器", soxhlet: "索氏连续虹吸器",
      ultrasonic: "超声辅助提取仪", percolation: "常温渗漉柱", decoction: "常压煎煮/回流",
      sfe: "超临界 CO₂ 萃取釜", resin: "大孔吸附树脂柱", rotavap: "减压旋转蒸发仪"
    };
    all.forEach(function (t) {
      var hRaw = String(t.herb || "").trim();
      var hShort = hRaw.split("（")[0].trim();
      if (!hShort) return;
      var hyd = (api && api.getTopicById) ? (api.getTopicById(t.id) || t) : t;
      var compShort = String(hyd.compound || "核心成分").slice(0, 18);
      var k = hShort + "|" + compShort;
      if (seenKey[k]) return;
      seenKey[k] = true;
      var cfg = hyd.defaultCfg || {};
      var solv = cfg.solventType || "70%乙醇";
      var temp = cfg.temp || 75;
      var rig = rigMap[hyd.defaultRig] || "热回流提取装置";
      var det = (hyd.tlcSystem ? "TLC展开" : "HPLC定量") + (hyd.limitVal ? " · 药典≥" + hyd.limitVal + (hyd.limitUnit || "%") : "");
      out.push({
        herb: hShort,
        comp: compShort,
        cat: normalizeKgCat(hyd.category),
        proc: solv + " " + temp + "℃提取",
        rig: rig,
        det: det,
        note: hyd.chemistry || hyd.pharmacopoeia || (hRaw + "核心有效成分：" + (hyd.compound || ""))
      });
    });
    return out;
  }

  function buildKgData(filterCat, searchKeyword) {
    var full = getAllKgRelations();
    var rows = filterCat === "全部" ? full : full.filter(function (r) { return r.cat === filterCat; });
    if (searchKeyword) {
      var q = String(searchKeyword).trim();
      var hits = full.filter(function (r) {
        return (r.herb + " " + r.comp + " " + r.proc + " " + r.rig + " " + r.det + " " + r.cat).indexOf(q) >= 0;
      });
      if (hits.length) rows = hits;
    }
    var totalMatched = rows.length;
    if (rows.length > 16) rows = rows.slice(0, 16);
    if (!rows.length) rows = KG_CORE_RELATIONS;
    var nodes = [];
    var edges = [];
    var nodeMap = {};

    function addNode(id, label, type, col, extra, note, herbName) {
      if (nodeMap[id]) return nodeMap[id];
      var n = { id: id, label: label, type: type, col: col, extra: extra || "", note: note || "", herbName: herbName || "" };
      nodeMap[id] = n;
      nodes.push(n);
      return n;
    }

    rows.forEach(function (r) {
      var n1 = addNode("herb_" + r.herb, r.herb, "药材", 0, r.cat, r.note, r.herb);
      var n2 = addNode("comp_" + (r.comp === "黄芩苷" ? "baicalin" : r.comp), r.comp, "活性成分", 1, r.cat, r.note, r.herb);
      var n3 = addNode("proc_" + r.proc, r.proc, "提取工艺", 2, r.cat, r.note, r.herb);
      var n4 = addNode("rig_" + r.rig, r.rig, "实验装置", 3, r.cat, r.note, r.herb);
      var n5 = addNode("det_" + r.det, r.det, "检测方法", 4, r.cat, r.note, r.herb);
      edges.push([n1.id, n2.id], [n2.id, n3.id], [n3.id, n4.id], [n4.id, n5.id]);
    });

    var colBuckets = [[], [], [], [], []];
    nodes.forEach(function (n) { colBuckets[n.col].push(n); });
    var colX = [82, 238, 410, 578, 738];
    colBuckets.forEach(function (bucket, cIdx) {
      var step = 412 / Math.max(1, bucket.length + 1);
      bucket.forEach(function (n, idx) {
        n.x = colX[cIdx] + ((idx % 2 === 0 ? -1 : 1) * 9);
        n.y = 34 + step * (idx + 1);
      });
    });

    return { nodes: nodes, edges: edges, nodeMap: nodeMap, totalMatched: totalMatched, totalBank: full.length };
  }

  function findConnectedSet(selectedId, edges) {
    var set = {};
    if (!selectedId) return set;
    set[selectedId] = true;
    for (var step = 0; step < 4; step++) {
      edges.forEach(function (e) {
        if (set[e[0]]) set[e[1]] = true;
        if (set[e[1]]) set[e[0]] = true;
      });
    }
    return set;
  }

  // ==================== 4.2 极性宇宙探索器状态 ====================
  var polarState = {
    compId: "tanshinone",
    solvA: 7, // 乙醇
    solvB: 9, // 纯化水
    ratioA: 70
  };

  // 按极性 p 严格升序排列，覆盖全部 11 大中药化学成分极性谱
  var POLAR_COMPOUNDS = [
    { id: "muscone", name: "麝香酮", p: 1.2, bp: 328, cat: "大环酮挥发油", desc: "强亲脂大环酮，易溶于石油醚与正己烷。" },
    { id: "menthol", name: "薄荷脑", p: 2.2, bp: 212, cat: "单萜挥发油", desc: "强亲脂单萜醇，适合石油醚/乙醇或水蒸气蒸馏。" },
    { id: "artemisinin", name: "青蒿素", p: 3.1, bp: 156, cat: "倍半萜内酯", desc: "含过氧桥低极性内酯，须低温石油醚/乙醚浸提。" },
    { id: "tanshinone", name: "丹参酮 IIA", p: 4.3, bp: 205, cat: "邻菲醌", desc: "脂溶性邻菲醌，最适 95% 乙醇或乙酸乙酯。" },
    { id: "emodin", name: "大黄素", p: 4.8, bp: 256, cat: "游离蒽醌", desc: "中低极性游离蒽醌，易溶于乙醇/乙酸乙酯/丙酮。" },
    { id: "quercetin", name: "槲皮素", p: 5.5, bp: 316, cat: "黄酮醇", desc: "中等极性苷元，优选 70% 乙醇或乙酸乙酯。" },
    { id: "berberine", name: "小檗碱", p: 6.4, bp: 145, cat: "生物碱", desc: "季铵盐型偏亲水，常用酸水盐析或 70% 乙醇。" },
    { id: "ginsenoside", name: "人参皂苷 Rg1", p: 7.1, bp: 194, cat: "三萜皂苷", desc: "两亲性三萜皂苷，优选 70% 乙醇回流避多糖。" },
    { id: "baicalin", name: "黄芩苷", p: 7.5, bp: 223, cat: "黄酮苷", desc: "含葡萄糖醛酸羧基，适合沸水杀酶或 50%~70% 乙醇。" },
    { id: "chlorogenic", name: "绿原酸", p: 8.2, bp: 208, cat: "苯丙素酚酸", desc: "强极性热敏酚酸，优选 50% 乙醇或微酸水低温超声。" },
    { id: "amygdalin", name: "苦杏仁苷", p: 8.9, bp: 214, cat: "氰苷类", desc: "强亲水龙胆二糖苷，沸水燀制杀酶保苷提取。" },
    { id: "polysacc", name: "枸杞/茯苓多糖", p: 9.8, bp: 100, cat: "中药多糖", desc: "强亲水大分子，仅溶于纯化水，80% 乙醇醇沉精制。" }
  ];

  function getSolventList() {
    var base = (window.TCM_V3_DATA && window.TCM_V3_DATA.SOLVENT_POLARITY_TABLE) || [
      { name: "石油醚(30-60℃)", p: 0.1, bp: "45℃", green: "易燃低毒" },
      { name: "正己烷", p: 0.1, bp: "69℃", green: "易燃神经毒" },
      { name: "甲苯", p: 2.4, bp: "111℃", green: "中等毒性" },
      { name: "二氯甲烷", p: 3.1, bp: "40℃", green: "含卤需通风" },
      { name: "三氯甲烷(氯仿)", p: 4.1, bp: "61℃", green: "含卤高危" },
      { name: "乙酸乙酯", p: 4.4, bp: "77℃", green: "绿色推荐" },
      { name: "丙酮", p: 5.1, bp: "56℃", green: "绿色易燃" },
      { name: "乙醇", p: 5.2, bp: "78℃", green: "绿色首选" },
      { name: "甲醇", p: 5.1, bp: "65℃", green: "易燃有毒" },
      { name: "纯化水", p: 10.2, bp: "100℃", green: "零毒环保" }
    ];
    return base.map(function (s, idx) {
      var m = String(s.bp || "78").match(/(\d+)(?!.*\d)/);
      return { idx: idx, name: s.name, p: Number(s.p), bpNum: m ? parseInt(m[1], 10) : 78, bp: s.bp, green: s.green || s.safety || "常规" };
    });
  }

  // ==================== 4.3 八阶段工艺流水线沙盘状态 ====================
  var PIPE_PRESETS = {
    gmp: { name: "标准 GMP 稳态", params: { mesh: 40, extTemp: 78, extRatio: 10, filtPress: 0.08, concTemp: 55, resinElute: 70, dryTemp: 60, granuleHum: 4.5, qcSample: 3 } },
    rush: { name: "高温抢产（热敏警报）", params: { mesh: 65, extTemp: 96, extRatio: 10, filtPress: 0.09, concTemp: 81, resinElute: 85, dryTemp: 84, granuleHum: 6.5, qcSample: 1 } },
    eco: { name: "低碳节能中试", params: { mesh: 35, extTemp: 72, extRatio: 10, filtPress: 0.07, concTemp: 50, resinElute: 65, dryTemp: 54, granuleHum: 4.0, qcSample: 2 } },
    danshen_bi: { name: "丹参脂水双提标杆", params: { mesh: 30, extTemp: 76, extRatio: 8, filtPress: 0.08, concTemp: 48, resinElute: 70, dryTemp: 56, granuleHum: 4.0, qcSample: 3 } },
    huangqin_enz: { name: "黄芩沸水杀酶酸沉", params: { mesh: 25, extTemp: 98, extRatio: 12, filtPress: 0.09, concTemp: 58, resinElute: 50, dryTemp: 60, granuleHum: 4.5, qcSample: 3 } },
    sanqi_resin: { name: "三七血塞通树脂纯化", params: { mesh: 40, extTemp: 74, extRatio: 10, filtPress: 0.08, concTemp: 52, resinElute: 70, dryTemp: 55, granuleHum: 3.5, qcSample: 4 } }
  };

  var pipeState = {
    activeStage: 1,
    preset: "gmp",
    baseline: null,
    params: Object.assign({}, PIPE_PRESETS.gmp.params)
  };

  var PIPE_STAGES = [
    { id: 0, code: "01", name: "饮片前处理", unit: "粉碎筛分", pKey: "mesh", label: "粉碎粒度 (目)", min: 10, max: 80, step: 5, opt: "35~45 目", tip: "过粗则传质慢，过细（>60 目）易黏结糊筛导致下游抽滤压差飙升。" },
    { id: 1, code: "02", name: "逆流提取", unit: "热回流罐", pKey: "extTemp", label: "提取温度 (℃)", min: 40, max: 100, step: 2, opt: "74~80℃", tip: "温度过高加速热敏成分氧化/水解，并显著推高能耗成本。" },
    { id: 2, code: "03", name: "固液分离", unit: "减压抽滤", pKey: "filtPress", label: "抽滤压差 (MPa)", min: 0.04, max: 0.10, step: 0.01, opt: "0.07~0.09 MPa", tip: "维持稳定负压并趁热抽滤可防止苷类析晶堵塞滤布。" },
    { id: 3, code: "04", name: "减压浓缩", unit: "双效旋蒸", pKey: "concTemp", label: "浓缩温度 (℃)", min: 40, max: 85, step: 2, opt: "48~58℃", tip: "浓缩温度 >60℃ 会引起热敏酚酸/邻菲醌显著焦化降解。" },
    { id: 4, code: "05", name: "树脂纯化", unit: "D101柱层析", pKey: "resinElute", label: "洗脱醇度 (%)", min: 30, max: 95, step: 5, opt: "65~75%", tip: "醇度过低洗脱不完全，过高则共洗脱脂溶性叶绿素与树脂杂质。" },
    { id: 5, code: "06", name: "真空干燥", unit: "真空烘箱", pKey: "dryTemp", label: "干燥温度 (℃)", min: 45, max: 90, step: 2, opt: "52~62℃", tip: "真空低温干燥可兼顾残溶达标与活性成分零热损。" },
    { id: 6, code: "07", name: "制剂成型", unit: "干法制粒", pKey: "granuleHum", label: "成品水分 (%)", min: 2, max: 9, step: 0.5, opt: "3.5~5.0%", tip: "《中国药典》颗粒剂/浸膏粉水分偏高易吸潮结块与霉变。" },
    { id: 7, code: "08", name: "成品放行QC", unit: "HPLC检验", pKey: "qcSample", label: "平行质检批数", min: 1, max: 5, step: 1, opt: "≥ 3 批平行", tip: "3 批平行进样可有效控制 RSD ≤ 2.0%，降低放行误判风险。" }
  ];

  function calcPipelineMetrics() {
    var p = pipeState.params;
    var s1 = Math.max(70, Math.min(99, 100 - Math.abs(p.mesh - 40) * 0.65));
    var s2 = Math.max(58, Math.min(98, 96 - Math.abs(p.extTemp - 78) * 0.9));
    var s3 = Math.max(78, Math.min(99, 86 + (p.filtPress - 0.04) * 200));
    var s4 = Math.max(62, Math.min(98, 98 - Math.max(0, p.concTemp - 55) * 1.1));
    var s5 = Math.max(60, Math.min(98, 97 - Math.abs(p.resinElute - 70) * 0.85));
    var s6 = Math.max(64, Math.min(99, 98 - Math.max(0, p.dryTemp - 60) * 1.05));
    var s7 = Math.max(65, Math.min(99, 98 - Math.max(0, p.granuleHum - 5.0) * 7));
    var s8 = Math.min(100, 82 + p.qcSample * 4);

    var stageEff = [s1, s2, s3, s4, s5, s6, s7, s8].map(function (v) { return Math.round(v); });
    var minIdx = 0;
    for (var i = 1; i < stageEff.length; i++) {
      if (stageEff[i] < stageEff[minIdx]) minIdx = i;
    }
    var totalYield = Number((0.92 * (s1 / 100) * (s2 / 100) * (s3 / 100) * (s4 / 100) * (s5 / 100) * (s6 / 100) * 100).toFixed(1));
    var qualityScore = Math.round((s2 + s4 + s5 + s6 + s7 + s8) / 6);
    var thermalLoss = Math.max(1.2, Number(((Math.max(0, p.extTemp - 78) * 0.4 + Math.max(0, p.concTemp - 55) * 0.5 + Math.max(0, p.dryTemp - 60) * 0.45)).toFixed(1)));
    var unitCost = Number((18 + (p.extTemp * 0.12) + (p.resinElute * 0.08) + (p.qcSample * 1.4)).toFixed(1));
    return { stageEff: stageEff, minIdx: minIdx, totalYield: totalYield, qualityScore: qualityScore, thermalLoss: thermalLoss, unitCost: unitCost };
  }

  // ==================== 4.4 实验时间轴导演模式状态 ====================
  var TL_NOTE_STORE_KEY = "tcm_v29_tl_notes_v2";
  function loadTlNotes() {
    try { return JSON.parse(localStorage.getItem(TL_NOTE_STORE_KEY) || "{}") || {}; } catch (e) { return {}; }
  }
  function saveTlNotes(obj) {
    try { localStorage.setItem(TL_NOTE_STORE_KEY, JSON.stringify(obj)); } catch (e) {}
  }

  var tlState = {
    scriptId: "danshen",
    shotIdx: 0,
    playing: false,
    speed: 1,
    timer: null,
    notes: loadTlNotes(),
    qcRevealed: false
  };

  var TL_SCRIPTS = {
    danshen: {
      name: "丹参 · 丹参酮 IIA 95%乙醇回流提取（6 镜头）",
      shots: [
        { code: "SHOT 01", title: "精密称量与润湿", dur: "15 min", temp: "常温避光", solv: "95% 乙醇 1:8", risk: "避光防氧化", detail: "电子天平称取丹参中粉 50.00 g，入 1000 mL 圆底烧瓶，加 400 mL 95% 乙醇浸润 20 min 使细胞溶胀。", tip: "避光操作，防止邻菲醌光氧化褪色。" },
        { code: "SHOT 02", title: "投入沸石与搭装置", dur: "10 min", temp: "未加热", solv: "95% 乙醇", risk: "防暴沸核验", detail: "投入 3 粒素瓷沸石，垂直安装球形冷凝管并扣紧防脱卡扣，核验磨口密封。", tip: "严禁加热后再补加沸石！" },
        { code: "SHOT 03", title: "先通冷水后控温", dur: "10 min", temp: "升温至 78℃", solv: "循环冷却水", risk: "禁明火加热", detail: "按「下进上出」通入循环冷却水，开启水浴锅平稳升温至 78℃。", tip: "严禁明火加热乙醇。" },
        { code: "SHOT 04", title: "恒温回流提取", dur: "60 min × 2", temp: "78℃ 恒温", solv: "95% 乙醇", risk: "回流 2~3 滴/秒", detail: "维持冷凝管每秒回流 2~3 滴，观察提取液由浅橙渐变为深丹红色。", tip: "记录每次回流时间与液色变化。" },
        { code: "SHOT 05", title: "趁热抽滤与旋蒸", dur: "35 min", temp: "旋蒸 ≤48℃", solv: "乙醇回收", risk: "加装缓冲球", detail: "布氏漏斗趁热减压抽滤合并滤液，45℃ 减压旋蒸回收大部分乙醇得丹红浸膏。", tip: "旋蒸加装防暴沸缓冲球，控温 ≤50℃。" },
        { code: "SHOT 06", title: "TLC 与 HPLC 检识", dur: "25 min", temp: "柱温 25℃", solv: "甲苯-乙酸乙酯", risk: "药典 ≥0.25%", detail: "甲苯-乙酸乙酯(19:1)展开对比对照品斑点，HPLC 270 nm 定量核算丹参酮 IIA 含量。", tip: "对照药典限度 ≥0.25% 撰写实验结论。" }
      ]
    },
    huangqin: {
      name: "黄芩 · 黄芩苷沸水杀酶保苷与酸沉精制（6 镜头）",
      shots: [
        { code: "SHOT 01", title: "沸水预备（防酶解）", dur: "10 min", temp: "100℃ 沸腾", solv: "纯化水 1:12", risk: "禁冷水浸泡", detail: "先将 12 倍量纯化水加热至 100℃ 沸腾，严禁冷水浸泡黄芩饮片。", tip: "35~65℃ 温水会激活黄芩酶致变绿失效！" },
        { code: "SHOT 02", title: "沸水投药瞬时杀酶", dur: "5 min", temp: "100℃ 瞬时", solv: "沸水", risk: "保持金黄色", detail: "将 50 g 黄芩粗粉迅速投入沸水中搅拌，使内源黄芩酶瞬间变性失活。", tip: "观察药液保持清亮金黄色。" },
        { code: "SHOT 03", title: "微沸煎煮提取", dur: "60 min × 2", temp: "98~100℃", solv: "纯化水", risk: "趁热抽滤", detail: "保持微沸煎煮 2 次，趁热过滤合并金黄色滤液。", tip: "趁热抽滤防止黄芩苷低温提前析出损失。" },
        { code: "SHOT 04", title: "80℃ 调酸酸沉", dur: "20 min", temp: "80℃ 保温", solv: "10% HCl", risk: "pH 1.5~2.0", detail: "80℃ 保温下缓慢滴加 10% HCl 调 pH 至 1.5~2.0，析出大量黄色絮状沉淀。", tip: "pH 过低易共沉杂质，严格用 pH 计监测。" },
        { code: "SHOT 05", title: "静置陈化与水洗", dur: "30 min", temp: "静置降温", solv: "50% 乙醇洗", risk: "洗至近中性", detail: "静置使结晶长大后抽滤，以少量纯化水与 50% 乙醇依次洗涤至近中性。", tip: "提高纯度至 ≥85%。" },
        { code: "SHOT 06", title: "FeCl₃ 显色与 UV/HPLC", dur: "20 min", temp: "柱温 30℃", solv: "HPLC 280nm", risk: "药典 ≥9.0%", detail: "三氯化铁反应显墨绿色，HPLC 280 nm 测定黄芩苷含量对照药典 ≥9.0%。", tip: "记录干燥品收率与 RSD。" }
      ]
    },
    huanglian: {
      name: "黄连 · 盐酸小檗碱酸水渗漉与盐析结晶（6 镜头）",
      shots: [
        { code: "SHOT 01", title: "酸水润湿与装柱", dur: "20 min", temp: "常温", solv: "0.5% 硫酸水", risk: "防气泡断层", detail: "称取黄连粗粉 50 g，用 0.5% 硫酸水充分润湿膨胀 30 min 后分次均匀装入渗漉筒。", tip: "装柱松紧须均匀，避免沟流导致提取不完全。" },
        { code: "SHOT 02", title: "排空气与密闭浸渍", dur: "24 h", temp: "常温避光", solv: "0.5% 硫酸水", risk: "液面高出 2cm", detail: "打开下口排尽气泡后关闭，补加酸水至高出药粉面 2~3 cm，浸渍过夜。", tip: "充分浸润使季铵生物碱完全转化为硫酸盐溶出。" },
        { code: "SHOT 03", title: "慢速连续渗漉", dur: "90 min", temp: "常温", solv: "1~3 mL/min", risk: "控制流速", detail: "控制渗漉速度约 1~3 mL/min，收集深黄色酸水渗漉液至流出液色泽极浅。", tip: "用碘化铋钾试剂检验流出液确认提取终点。" },
        { code: "SHOT 04", title: "石灰乳除杂调碱", dur: "20 min", temp: "常温搅拌", solv: "石灰乳 pH12", risk: "过滤除钙盐", detail: "向渗漉液中加石灰乳调 pH 至 12 左右沉淀酸性树脂与色素，迅速抽滤得澄清滤液。", tip: "过滤后立即调酸，避免强碱下小檗碱降解。" },
        { code: "SHOT 05", title: "调酸与 NaCl 盐析", dur: "30 min", temp: "常温静置", solv: "浓HCl + 8%NaCl", risk: "pH 2~3 析晶", detail: "滴加盐酸调 pH 至 2~3，加入 8%~10% 精制氯化钠搅拌溶解，静置析出亮黄色针状结晶。", tip: "利用同离子效应显著降低盐酸小檗碱溶解度。" },
        { code: "SHOT 06", title: "UV 365nm 荧光与含量测定", dur: "25 min", temp: "柱温 25℃", solv: "HPLC 265nm", risk: "药典 ≥5.5%", detail: "TLC 点样在 365 nm 紫外灯下显亮黄色荧光，HPLC 测定盐酸小檗碱含量。", tip: "对照药典限度 ≥5.5% 并记录结晶纯度。" }
      ]
    },
    jinyinhua: {
      name: "金银花 · 绿原酸 42℃ 微酸低温超声提取（6 镜头）",
      shots: [
        { code: "SHOT 01", title: "微酸 50% 乙醇配制", dur: "10 min", temp: "常温", solv: "50%乙醇 pH4.5", risk: "防酯键水解", detail: "用少量柠檬酸/甲酸将 50% 乙醇调至 pH 4.5，抑制绿原酸在中性/碱性下的氧化与异构化。", tip: "切忌使用碱性溶剂或超过 60℃ 长时间加热。" },
        { code: "SHOT 02", title: "投料浸润与冰浴准备", dur: "15 min", temp: "25℃ 浸润", solv: "料液比 1:12", risk: "避强光直射", detail: "称取金银花中粉 30 g 加入 360 mL 微酸 50% 乙醇，轻摇排泡并置入控温超声槽。", tip: "超声过程液体会升温，提前备好冰袋控温。" },
        { code: "SHOT 03", title: "42℃ 低温超声提取", dur: "30 min", temp: "严控 ≤45℃", solv: "40 kHz 超声", risk: "每10min测温", detail: "开启 40 kHz 超声空化提取 30 min，全程监控水温稳定在 40~44℃ 之间。", tip: "空化效应大幅缩短提取时间，兼顾高收率与零热损。" },
        { code: "SHOT 04", title: "减压抽滤与低温浓缩", dur: "25 min", temp: "旋蒸 ≤45℃", solv: "减压回收醇", risk: "防泡沫冲料", detail: "抽滤合并澄明浅黄绿色滤液，42℃ 减压旋蒸回收乙醇至无醇味。", tip: "控制真空度分段减压，避免酚酸提取液起泡冲料。" },
        { code: "SHOT 05", title: "聚酰胺/树脂精制", dur: "30 min", temp: "常温过柱", solv: "水洗+50%醇洗", risk: "弃去水洗杂", detail: "上样后先用纯化水洗脱糖类与无机盐，再用 50% 乙醇洗脱收集绿原酸富集段。", tip: "跟踪 UV 327 nm 吸收判断洗脱起止点。" },
        { code: "SHOT 06", title: "蓝荧光 TLC 与 HPLC 定量", dur: "20 min", temp: "柱温 25℃", solv: "HPLC 327nm", risk: "药典 ≥1.5%", detail: "乙酸丁酯-甲酸-水展开在 365 nm 显亮蓝色荧光斑点，HPLC 327 nm 定量。", tip: "核对《中国药典》绿原酸限度 ≥1.5%。" }
      ]
    }
  };

  function buildDynamicTopicScript(topicId) {
    var api = window.TCM_LAB_API;
    var t = (api && api.getTopicById) ? api.getTopicById(topicId) : null;
    if (!t) return TL_SCRIPTS.danshen;
    var cfg = t.defaultCfg || {};
    var solv = cfg.solventType || "70% 乙醇";
    var temp = cfg.temp || 75;
    var ratio = cfg.ratio || 10;
    var time = cfg.time || 60;
    var cyc = cfg.cycles || 2;
    var mass = cfg.mass || 50;
    var lits = (api && api.findLiteratureForTopic) ? api.findLiteratureForTopic(t, 1) : [];
    var litNote = lits.length ? "文献依据：" + lits[0].text : "严格遵循《中国药典》2025 版检验通则。";
    return {
      name: t.herb + " · " + (t.compound || t.category) + "（题库自动分镜 · 6 镜头）",
      shots: [
        { code: "SHOT 01", title: "药材基原核对与粉碎称量", dur: "15 min", temp: "常温干燥", solv: cfg.mesh || "中粉(40目)", risk: "基原与粒度控", detail: "核对 " + t.herb + " 饮片性状与基原（" + (t.origin || t.category || "中药饮片") + "），精密称取 " + mass + " g 置提取容器。", tip: "粒度过细易糊筛，过粗则浸出速率偏慢。" },
        { code: "SHOT 02", title: "溶剂润湿与防暴沸准备", dur: "20 min", temp: "常温浸润", solv: solv + " 1:" + ratio, risk: "加沸石防暴沸", detail: "加入 " + (mass * ratio) + " mL " + solv + " 静置浸润 20 min 使细胞溶胀，投入 2~3 粒素瓷沸石。", tip: "严禁加热后再补加沸石，防突沸冲料。" },
        { code: "SHOT 03", title: "装置搭建与冷却水互锁", dur: "10 min", temp: "升温至 " + temp + "℃", solv: "下进上出冷水", risk: "先通水后加热", detail: "自下而上装配核心提取装置，核验磨口密封与通风橱排风，先接通冷凝水再开启加热源。", tip: "有机溶剂严禁明火直接加热。" },
        { code: "SHOT 04", title: "控温循环提取与传质", dur: time + " min × " + cyc, temp: temp + "℃ 恒温", solv: solv, risk: "防热敏降解", detail: "于 " + temp + "℃ 下恒温提取 " + cyc + " 次，每次 " + time + " min，实时观察目标成分（" + (t.compound || "") + "）浸出色泽变化。", tip: t.chemistry ? t.chemistry.slice(0, 68) : "保持平稳回流速率，兼顾收率与热稳定。" },
        { code: "SHOT 05", title: "抽滤合并与低温减压浓缩", dur: "35 min", temp: "旋蒸 ≤50℃", solv: "溶剂回收", risk: "防泡沫冲料", detail: "趁热减压抽滤合并各次滤液，低温减压旋蒸回收溶剂并按极性/酸碱/树脂路线富集精制。", tip: "旋蒸须加装防暴沸缓冲球，先破真空再停泵。" },
        { code: "SHOT 06", title: "TLC / HPLC 检识与药典对标", dur: "25 min", temp: "室温检视", solv: t.tlcSystem ? t.tlcSystem.slice(0, 26) : "标准展开剂", risk: t.limitVal ? "药典 ≥" + t.limitVal + (t.limitUnit || "%") : "药典合格", detail: (t.tlcSystem || "按对照品进行 TLC 与理化显色交叉验证") + "；质控标准：" + (t.pharmacopoeia || t.pharm || "参照《中国药典》2025 版测定含量") + "。", tip: litNote }
      ]
    };
  }

  function resolveTimelineScript(id) {
    if (TL_SCRIPTS[id]) return TL_SCRIPTS[id];
    if (String(id || "").indexOf("topic:") === 0) {
      return buildDynamicTopicScript(String(id).slice(6));
    }
    return TL_SCRIPTS.danshen;
  }

  function stopTimelineTimer() {
    if (tlState.timer) { clearInterval(tlState.timer); tlState.timer = null; }
    tlState.playing = false;
  }

  // ==================== 4.5 对比显微镜状态 ====================
  var microState = { idA: "", idB: "", chartMode: "uv", diffOnly: false };

  function getMicroHerbs() {
    var api = window.TCM_LAB_API;
    var list = (api && typeof api.getAllTopics === "function" && api.getAllTopics()) || [];
    if (list.length >= 2) return list;
    return [
      { id: "m_danshen", herb: "丹参（丹参酮IIA回流提取）", compound: "丹参酮 IIA", category: "醌类" },
      { id: "m_huangqin", herb: "黄芩（黄芩苷沸水杀酶保苷）", compound: "黄芩苷", category: "黄酮" },
      { id: "m_jinyinhua", herb: "金银花（绿原酸低温超声提取）", compound: "绿原酸", category: "苯丙素" },
      { id: "m_huanglian", herb: "黄连（盐酸小檗碱酸提盐析）", compound: "盐酸小檗碱", category: "生物碱" }
    ];
  }

  function deriveMicroSpec(t) {
    var api = window.TCM_LAB_API;
    var hyd = (api && api.getTopicById && t && t.id) ? (api.getTopicById(t.id) || t) : (t || {});
    var cfg = hyd.defaultCfg || {};
    var txt = [hyd.herb, hyd.compound, hyd.category].join(" ");
    var base;
    if (/丹参/.test(txt)) base = { pWin: "2.4 ~ 5.8", maxT: 82, solv: "95%乙醇", rig: "热回流装置", ratio: "1:8", uvPeak: 270, uvPeak2: 355, kRate: 0.042, maxY: 88, decay: 0.0018, tlc: "甲苯-乙酸乙酯(19:1)", limit: "≥ 0.25%" };
    else if (/黄芩/.test(txt)) base = { pWin: "6.2 ~ 10.2", maxT: 100, solv: "沸水(杀酶)", rig: "常压煎煮/回流", ratio: "1:12", uvPeak: 278, uvPeak2: 316, kRate: 0.048, maxY: 91, decay: 0.0006, tlc: "乙酸乙酯-丁酮-甲酸-水", limit: "≥ 9.0%" };
    else if (/金银花|绿原酸/.test(txt)) base = { pWin: "6.2 ~ 10.2", maxT: 58, solv: "50%乙醇(微酸)", rig: "超声辅助仪", ratio: "1:12", uvPeak: 242, uvPeak2: 327, kRate: 0.068, maxY: 90, decay: 0.0036, tlc: "乙酸丁酯-甲酸-水", limit: "≥ 1.5%" };
    else if (/黄连|小檗碱/.test(txt)) base = { pWin: "4.6 ~ 10.2", maxT: 90, solv: "0.5%硫酸水", rig: "常温渗漉柱", ratio: "1:10", uvPeak: 263, uvPeak2: 345, kRate: 0.032, maxY: 85, decay: 0.0005, tlc: "甲苯-乙酸乙酯-氨蒸气", limit: "≥ 5.5%" };
    else if (/薄荷|挥发油|桂皮|丁香|艾叶|广藿香|细辛/.test(txt)) base = { pWin: "0.5 ~ 4.8", maxT: 85, solv: "纯化水(共沸)", rig: "水蒸气蒸馏器", ratio: "1:10", uvPeak: 215, uvPeak2: 280, kRate: 0.055, maxY: 82, decay: 0.0022, tlc: "甲苯-乙酸乙酯(19:1)", limit: "≥ 0.80%" };
    else if (/大黄|蒽醌|决明|虎杖|紫草/.test(txt)) base = { pWin: "3.2 ~ 6.4", maxT: 85, solv: "乙醇/pH梯度", rig: "索氏提取器", ratio: "1:10", uvPeak: 254, uvPeak2: 430, kRate: 0.039, maxY: 86, decay: 0.0010, tlc: "石油醚-甲酸乙酯-甲酸", limit: "≥ 1.5%" };
    else if (/人参|三七|皂苷|甘草|黄芪|柴胡|桔梗/.test(txt)) base = { pWin: "5.0 ~ 8.0", maxT: 85, solv: "70%乙醇", rig: "热回流+树脂柱", ratio: "1:10", uvPeak: 203, uvPeak2: 250, kRate: 0.036, maxY: 84, decay: 0.0009, tlc: "三氯甲烷-甲醇-水", limit: "≥ 0.30%" };
    else if (/香豆素|木脂素|五味子|厚朴|连翘|秦皮|补骨脂|白芷/.test(txt)) base = { pWin: "3.5 ~ 6.2", maxT: 80, solv: "80%乙醇", rig: "热回流装置", ratio: "1:10", uvPeak: 248, uvPeak2: 332, kRate: 0.044, maxY: 86, decay: 0.0012, tlc: "石油醚-乙酸乙酯", limit: "按药典标准" };
    else if (/多糖|枸杞|石斛/.test(txt)) base = { pWin: "8.0 ~ 10.2", maxT: 98, solv: "纯化水(醇沉)", rig: "常压煎煮/回流", ratio: "1:15", uvPeak: 205, uvPeak2: 260, kRate: 0.038, maxY: 89, decay: 0.0005, tlc: "PMP衍生HPLC", limit: "按药典标准" };
    else base = { pWin: "5.2 ~ 8.5", maxT: 88, solv: "70%乙醇", rig: "热回流装置", ratio: "1:10", uvPeak: 258, uvPeak2: 350, kRate: 0.044, maxY: 85, decay: 0.0011, tlc: "乙酸乙酯-甲酸-水", limit: "按药典标准" };

    if (cfg.solventType) base.solv = cfg.solventType;
    if (cfg.ratio) base.ratio = "1:" + cfg.ratio;
    if (hyd.tlcSystem) base.tlc = String(hyd.tlcSystem).slice(0, 28);
    if (hyd.limitVal) base.limit = "≥ " + hyd.limitVal + (hyd.limitUnit || "%");
    return base;
  }

  function buildMicroOverlaySvg(spA, spB, nameA, nameB, mode) {
    var w = 520, h = 156, padL = 42, padR = 18, padT = 20, padB = 22;
    var pw = w - padL - padR, ph = h - padT - padB;

    if (mode === "radar") {
      var cx = 260, cy = 82, R = 56;
      var dims = ["极性指数", "耐热稳定", "溶出速率", "峰值收率", "抗降解性"];
      function normVec(sp) {
        var pMid = parseFloat(String(sp.pWin).split("~")[0]) + 1.5;
        return [
          Math.min(1, pMid / 10),
          Math.min(1, sp.maxT / 100),
          Math.min(1, sp.kRate / 0.07),
          Math.min(1, sp.maxY / 95),
          Math.max(0.25, 1 - sp.decay * 220)
        ];
      }
      function polyPts(vec) {
        return vec.map(function (v, i) {
          var ang = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
          return (cx + Math.cos(ang) * R * v).toFixed(1) + "," + (cy + Math.sin(ang) * R * v).toFixed(1);
        }).join(" ");
      }
      var rings = [0.33, 0.66, 1.0].map(function (r) {
        var pts = [0, 1, 2, 3, 4].map(function (i) {
          var ang = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
          return (cx + Math.cos(ang) * R * r).toFixed(1) + "," + (cy + Math.sin(ang) * R * r).toFixed(1);
        }).join(" ");
        return '<polygon points="' + pts + '" fill="none" stroke="rgba(148,163,184,0.28)" stroke-width="1"/>';
      }).join("");
      var labels = dims.map(function (d, i) {
        var ang = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
        var lx = cx + Math.cos(ang) * (R + 18);
        var ly = cy + Math.sin(ang) * (R + 14) + 3;
        return '<text x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '" text-anchor="middle" font-size="10" font-weight="700" fill="#64748b">' + d + "</text>";
      }).join("");
      return (
        '<svg viewBox="0 0 ' + w + " " + h + '" style="width:100%;height:158px;display:block;">' +
          rings + labels +
          '<polygon points="' + polyPts(normVec(spA)) + '" fill="rgba(16,185,129,0.22)" stroke="#10b981" stroke-width="2.2"/>' +
          '<polygon points="' + polyPts(normVec(spB)) + '" fill="rgba(245,158,11,0.18)" stroke="#f59e0b" stroke-width="2.2" stroke-dasharray="5 3"/>' +
          '<text x="20" y="18" font-size="11" font-weight="800" fill="#10b981">■ ' + esc(nameA) + "</text>" +
          '<text x="20" y="34" font-size="11" font-weight="800" fill="#f59e0b">□ ' + esc(nameB) + "</text>" +
        "</svg>"
      );
    }

    if (mode === "kinetics") {
      function kinPts(sp) {
        var pts = [];
        for (var t = 0; t <= 120; t += 4) {
          var yVal = sp.maxY * (1 - Math.exp(-sp.kRate * t)) * Math.exp(-sp.decay * Math.max(0, t - 45));
          var x = padL + (t / 120) * pw;
          var y = padT + (1 - Math.min(100, yVal) / 100) * ph;
          pts.push(x.toFixed(1) + "," + y.toFixed(1));
        }
        return pts.join(" ");
      }
      return (
        '<svg viewBox="0 0 ' + w + " " + h + '" style="width:100%;height:156px;display:block;">' +
          '<line x1="' + padL + '" y1="' + (h - padB) + '" x2="' + (w - padR) + '" y2="' + (h - padB) + '" stroke="rgba(100,116,139,0.35)"/>' +
          '<line x1="' + padL + '" y1="' + padT + '" x2="' + padL + '" y2="' + (h - padB) + '" stroke="rgba(100,116,139,0.35)"/>' +
          '<line x1="' + padL + '" y1="' + (padT + ph * 0.5) + '" x2="' + (w - padR) + '" y2="' + (padT + ph * 0.5) + '" stroke="rgba(100,116,139,0.16)" stroke-dasharray="3 3"/>' +
          '<polyline fill="none" stroke="#10b981" stroke-width="2.5" points="' + kinPts(spA) + '"/>' +
          '<polyline fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="6 3" points="' + kinPts(spB) + '"/>' +
          '<text x="8" y="' + (padT + 6) + '" font-size="9.5" fill="#64748b">100%</text>' +
          '<text x="12" y="' + (padT + ph * 0.5 + 3) + '" font-size="9.5" fill="#64748b">50%</text>' +
          '<text x="' + padL + '" y="' + (h - 5) + '" font-size="10" fill="#64748b">0 min</text>' +
          '<text x="' + (padL + pw * 0.5 - 16) + '" y="' + (h - 5) + '" font-size="10" fill="#64748b">60 min</text>' +
          '<text x="' + (w - 52) + '" y="' + (h - 5) + '" font-size="10" fill="#64748b">120 min</text>' +
          '<text x="' + (padL + 6) + '" y="14" font-size="10.5" font-weight="800" fill="#10b981">━ ' + esc(nameA) + "（耐热上限 " + spA.maxT + "℃）</text>" +
          '<text x="' + (w / 2 + 8) + '" y="14" font-size="10.5" font-weight="800" fill="#f59e0b">--- ' + esc(nameB) + "（耐热上限 " + spB.maxT + "℃）</text>" +
        "</svg>"
      );
    }

    function uvPath(p1, p2) {
      var pts = [];
      for (var wl = 200; wl <= 420; wl += 4) {
        var g1 = Math.exp(-Math.pow((wl - p1) / 18, 2));
        var g2 = 0.72 * Math.exp(-Math.pow((wl - p2) / 22, 2));
        var val = Math.min(1, g1 + g2);
        var x = padL + ((wl - 200) / 220) * pw;
        var y = padT + (1 - val * 0.9) * ph;
        pts.push(x.toFixed(1) + "," + y.toFixed(1));
      }
      return pts.join(" ");
    }
    var pAx = padL + ((Math.min(420, spA.uvPeak) - 200) / 220) * pw;
    var pBx = padL + ((Math.min(420, spB.uvPeak) - 200) / 220) * pw;
    return (
      '<svg viewBox="0 0 ' + w + " " + h + '" style="width:100%;height:156px;display:block;">' +
        '<line x1="' + padL + '" y1="' + (h - padB) + '" x2="' + (w - padR) + '" y2="' + (h - padB) + '" stroke="rgba(100,116,139,0.35)"/>' +
        '<line x1="' + padL + '" y1="' + padT + '" x2="' + padL + '" y2="' + (h - padB) + '" stroke="rgba(100,116,139,0.35)"/>' +
        '<line x1="' + pAx.toFixed(1) + '" y1="' + padT + '" x2="' + pAx.toFixed(1) + '" y2="' + (h - padB) + '" stroke="rgba(16,185,129,0.38)" stroke-dasharray="3 3"/>' +
        '<line x1="' + pBx.toFixed(1) + '" y1="' + padT + '" x2="' + pBx.toFixed(1) + '" y2="' + (h - padB) + '" stroke="rgba(245,158,11,0.38)" stroke-dasharray="3 3"/>' +
        '<polyline fill="none" stroke="#10b981" stroke-width="2.5" points="' + uvPath(spA.uvPeak, spA.uvPeak2) + '"/>' +
        '<polyline fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="5 3" points="' + uvPath(spB.uvPeak, spB.uvPeak2) + '"/>' +
        '<text x="8" y="' + (padT + 8) + '" font-size="9.5" fill="#64748b">Abs</text>' +
        '<text x="' + padL + '" y="' + (h - 5) + '" font-size="10" fill="#64748b">200 nm</text>' +
        '<text x="' + (padL + pw * 0.5 - 16) + '" y="' + (h - 5) + '" font-size="10" fill="#64748b">310 nm</text>' +
        '<text x="' + (w - 48) + '" y="' + (h - 5) + '" font-size="10" fill="#64748b">420 nm</text>' +
        '<text x="' + (padL + 6) + '" y="14" font-size="10.5" font-weight="800" fill="#10b981">━ ' + esc(nameA) + " (" + spA.uvPeak + "/" + spA.uvPeak2 + "nm)</text>" +
        '<text x="' + (w / 2 + 8) + '" y="14" font-size="10.5" font-weight="800" fill="#f59e0b">--- ' + esc(nameB) + " (" + spB.uvPeak + "/" + spB.uvPeak2 + "nm)</text>" +
      "</svg>"
    );
  }

  // ==================== 5 大子视图渲染器 ====================
  function renderKgTab(bodyEl) {
    var kg = buildKgData(kgState.filter, kgState.search);
    if (!kg.nodeMap[kgState.selectedId]) kgState.selectedId = kg.nodes[0].id;
    var conn = findConnectedSet(kgState.selectedId, kg.edges);
    var selNode = kg.nodeMap[kgState.selectedId];
    var selLits = (window.TCM_LAB_API && window.TCM_LAB_API.findLiteratureForTopic && selNode.herbName)
      ? window.TCM_LAB_API.findLiteratureForTopic(selNode.herbName, 2)
      : [];

    var typeColors = { "药材": "#10b981", "活性成分": "#f59e0b", "提取工艺": "#38bdf8", "实验装置": "#a855f7", "检测方法": "#f43f5e" };
    var cats = ["全部", "黄酮", "醌类", "生物碱", "苯丙素", "挥发油", "萜内酯", "香豆素/木脂素", "皂苷", "甾体/强心苷", "氰苷/多糖"];

    // 平滑三次贝塞尔连线
    var edgesSvg = kg.edges.map(function (e) {
      var a = kg.nodeMap[e[0]], b = kg.nodeMap[e[1]];
      if (!a || !b) return "";
      var hi = conn[e[0]] && conn[e[1]];
      var mx = ((a.x + b.x) / 2).toFixed(1);
      var d = "M" + a.x + " " + a.y + " C" + mx + " " + a.y + " " + mx + " " + b.y + " " + b.x + " " + b.y;
      return '<path d="' + d + '" fill="none" class="' + (hi ? "v29-edge-hi" : "") + '" stroke="' + (hi ? "#34d399" : "rgba(148,163,184,0.20)") + '" stroke-width="' + (hi ? 2.8 : 1.1) + '"/>';
    }).join("");

    var nodesSvg = kg.nodes.map(function (n) {
      var hi = !!conn[n.id];
      var isSel = n.id === kgState.selectedId;
      var fill = typeColors[n.type] || "#10b981";
      return (
        '<g class="v29-kg-node" data-v29-node="' + esc(n.id) + '" style="cursor:pointer;opacity:' + (hi ? 1 : 0.24) + ';">' +
          (isSel ? '<circle cx="' + n.x + '" cy="' + n.y + '" r="18" fill="none" stroke="' + fill + '" stroke-width="1.5" opacity="0.55"/>' : "") +
          '<circle cx="' + n.x + '" cy="' + n.y + '" r="' + (isSel ? 12.5 : 9) + '" fill="' + fill + '" stroke="' + (isSel ? "#ffffff" : "rgba(255,255,255,0.45)") + '" stroke-width="' + (isSel ? 2.8 : 1.3) + '"/>' +
          '<text class="v29-svg-halo" x="' + n.x + '" y="' + (n.y + 21) + '" text-anchor="middle" fill="' + (hi ? "#f8fafc" : "#94a3b8") + '" font-size="10.5" font-weight="' + (hi ? 800 : 600) + '">' + esc(n.label) + "</text>" +
        "</g>"
      );
    }).join("");

    var relatedLabels = Object.keys(conn).map(function (id) { return kg.nodeMap[id]; }).filter(Boolean).sort(function (a, b) { return a.col - b.col; });

    var vw = Math.round(820 / kgState.zoom);
    var vh = Math.round(464 / kgState.zoom);
    var vx = Math.round((820 - vw) / 2 - kgState.panX);
    var vy = Math.round((464 - vh) / 2 - kgState.panY);

    bodyEl.innerHTML =
      '<div class="v29-toolbar">' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">' +
          '<span style="font-size:12px;font-weight:800;">化学大类：</span>' +
          cats.map(function (c) {
            return '<button type="button" class="v29-pill' + (kgState.filter === c ? " is-active" : "") + '" data-v29-kgcat="' + c + '">' + c + "</button>";
          }).join("") +
        "</div>" +
        '<div style="display:flex;gap:6px;align-items:center;">' +
          '<input type="text" id="v29KgSearch" class="v29-input" style="width:185px;padding:4px 10px;font-size:12px;" placeholder="定位节点（如 黄连 / 超声）" value="' + esc(kgState.search) + '"/>' +
          '<button type="button" class="v29-btn-ghost" id="v29KgFindBtn" style="padding:4px 10px;">定位</button>' +
          (kgState.searchMsg ? '<span style="font-size:11px;color:#e11d48;font-weight:700;">' + esc(kgState.searchMsg) + '</span>' : "") +
        "</div>" +
      "</div>" +
      '<div class="v29-split">' +
        '<div class="v29-canvas-box">' +
          '<svg id="v29KgSvg" class="v29-canvas-pan" viewBox="' + vx + " " + vy + " " + vw + " " + vh + '" style="width:100%;height:464px;display:block;">' +
            '<text x="82" y="20" text-anchor="middle" fill="#6ee7b7" font-size="11" font-weight="800">① 药材</text>' +
            '<text x="238" y="20" text-anchor="middle" fill="#fcd34d" font-size="11" font-weight="800">② 活性成分</text>' +
            '<text x="410" y="20" text-anchor="middle" fill="#7dd3fc" font-size="11" font-weight="800">③ 提取工艺</text>' +
            '<text x="578" y="20" text-anchor="middle" fill="#d8b4fe" font-size="11" font-weight="800">④ 实验装置</text>' +
            '<text x="738" y="20" text-anchor="middle" fill="#fda4af" font-size="11" font-weight="800">⑤ 检测方法</text>' +
            edgesSvg + nodesSvg +
          "</svg>" +
          '<div class="v29-zoom-bar">' +
            '<button type="button" class="v29-zoom-btn" data-v29-zoom="in">＋ 放大</button>' +
            '<button type="button" class="v29-zoom-btn" data-v29-zoom="out">－ 缩小</button>' +
            '<button type="button" class="v29-zoom-btn" data-v29-zoom="reset">重置 (' + Math.round(kgState.zoom * 100) + '%)</button>' +
          "</div>" +
        "</div>" +
        '<div class="v29-card">' +
          '<div style="font-size:15px;font-weight:900;margin-bottom:4px;">当前聚焦节点：' + esc(selNode.label) + "</div>" +
          '<div style="font-size:11.5px;color:#64748b;margin-bottom:8px;">层级：<strong>' + esc(selNode.type) + '</strong> · 大类：<strong>' + esc(selNode.extra) + '</strong> · 图谱贯通 <strong>' + kg.totalBank + '</strong> 项工艺链路（当前筛选命中 ' + kg.totalMatched + ' 项）</div>' +
          (selNode.note ? '<div style="padding:9px 11px;border-radius:10px;background:rgba(15,76,58,0.08);font-size:12px;line-height:1.55;margin-bottom:8px;"><strong>化学机制要点：</strong>' + esc(selNode.note) + "</div>" : "") +
          (selLits.length ? '<div style="padding:8px 10px;border-radius:10px;background:rgba(17,29,25,0.04);font-size:11px;line-height:1.5;margin-bottom:8px;"><strong>关联实证文献：</strong><br/>' + selLits.map(function (l) { return "• " + esc(l.text); }).join("<br/>") + "</div>" : "") +
          '<div style="display:flex;flex-direction:column;gap:6px;max-height:200px;overflow-y:auto;">' +
            relatedLabels.map(function (rn) {
              var isF = rn.id === kgState.selectedId;
              return '<button type="button" class="v29-kg-item' + (isF ? " is-focus" : "") + '" data-v29-node="' + esc(rn.id) + '"><strong>[' + esc(rn.type) + "]</strong> " + esc(rn.label) + "</button>";
            }).join("") +
          "</div>" +
          '<div style="display:flex;gap:6px;margin-top:10px;">' +
            (selNode.herbName ? '<button type="button" class="v29-btn" id="v29KgToMicro" style="flex:1;">送入对比显微镜</button>' : "") +
            '<button type="button" class="v29-btn-ghost" id="v29KgCopyChain" style="flex:1;">复制工艺链路</button>' +
          '</div>' +
        "</div>" +
      "</div>";

    bodyEl.querySelectorAll("[data-v29-kgcat]").forEach(function (b) {
      b.addEventListener("click", function () { kgState.filter = this.getAttribute("data-v29-kgcat"); renderBody(); });
    });
    bodyEl.querySelectorAll("[data-v29-node]").forEach(function (g) {
      g.addEventListener("click", function () { kgState.selectedId = this.getAttribute("data-v29-node"); renderBody(); });
    });
    bodyEl.querySelectorAll("[data-v29-zoom]").forEach(function (z) {
      z.addEventListener("click", function () {
        var act = this.getAttribute("data-v29-zoom");
        if (act === "in") kgState.zoom = Math.min(1.8, Number((kgState.zoom + 0.15).toFixed(2)));
        else if (act === "out") kgState.zoom = Math.max(0.85, Number((kgState.zoom - 0.15).toFixed(2)));
        else { kgState.zoom = 1.0; kgState.panX = 0; kgState.panY = 0; }
        renderBody();
      });
    });
    function runKgSearch() {
      var q = (bodyEl.querySelector("#v29KgSearch").value || "").trim();
      kgState.search = q;
      if (!q) return;
      var hit = kg.nodes.find(function (n) { return n.label.indexOf(q) >= 0; });
      if (hit) {
        kgState.selectedId = hit.id;
        kgState.searchMsg = "";
      } else {
        kgState.searchMsg = "未找到匹配节点";
      }
      renderBody();
    }
    bodyEl.querySelector("#v29KgFindBtn").addEventListener("click", runKgSearch);
    bodyEl.querySelector("#v29KgSearch").addEventListener("keydown", function (e) { if (e.key === "Enter") runKgSearch(); });
    var toMicroBtn = bodyEl.querySelector("#v29KgToMicro");
    if (toMicroBtn && selNode.herbName) {
      toMicroBtn.addEventListener("click", function () {
        var herbs = getMicroHerbs();
        var match = herbs.find(function (h) { return h.herb.indexOf(selNode.herbName) >= 0; });
        if (match) microState.idA = match.id;
        activeTab = "microscope";
        syncTabBar();
        renderBody();
      });
    }
    var copyBtn = bodyEl.querySelector("#v29KgCopyChain");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var txt = relatedLabels.map(function (rn) { return "[" + rn.type + "] " + rn.label; }).join(" → ") + (selNode.note ? "\n化学机制：" + selNode.note : "");
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).catch(function () {});
        copyBtn.textContent = "✅ 已复制链路";
        setTimeout(function () { copyBtn.textContent = "📋 复制工艺链路"; }, 1400);
      });
    }
    var kgSvg = bodyEl.querySelector("#v29KgSvg");
    if (kgSvg) {
      var dragging = false, sx = 0, sy = 0, spx = 0, spy = 0;
      kgSvg.addEventListener("mousedown", function (e) {
        if (e.target.closest && e.target.closest("[data-v29-node]")) return;
        dragging = true; sx = e.clientX; sy = e.clientY; spx = kgState.panX; spy = kgState.panY;
      });
      window.addEventListener("mousemove", function (e) {
        if (!dragging) return;
        kgState.panX = Math.max(-220, Math.min(220, spx + (e.clientX - sx) / kgState.zoom));
        kgState.panY = Math.max(-140, Math.min(140, spy + (e.clientY - sy) / kgState.zoom));
        var curVw = Math.round(820 / kgState.zoom), curVh = Math.round(464 / kgState.zoom);
        kgSvg.setAttribute("viewBox", Math.round((820 - curVw) / 2 - kgState.panX) + " " + Math.round((464 - curVh) / 2 - kgState.panY) + " " + curVw + " " + curVh);
      });
      window.addEventListener("mouseup", function () { dragging = false; });
      kgSvg.addEventListener("wheel", function (e) {
        e.preventDefault();
        kgState.zoom = Math.max(0.85, Math.min(1.8, Number((kgState.zoom + (e.deltaY < 0 ? 0.1 : -0.1)).toFixed(2))));
        renderBody();
      }, { passive: false });
    }
  }

  function renderPolarityTab(bodyEl) {
    var solvents = getSolventList();
    var comp = POLAR_COMPOUNDS.find(function (c) { return c.id === polarState.compId; }) || POLAR_COMPOUNDS[1];
    var sA = solvents[polarState.solvA] || solvents[7];
    var sB = solvents[polarState.solvB] || solvents[9];
    var fracA = polarState.ratioA / 100;
    var mixP = Number((sA.p * fracA + sB.p * (1 - fracA)).toFixed(2));
    var mixBp = Math.round(sA.bpNum * fracA + sB.bpNum * (1 - fracA));
    var mixDp = Number(Math.abs(mixP - comp.p).toFixed(2));

    var ranked = solvents.map(function (s) {
      return Object.assign({}, s, { dp: Number(Math.abs(s.p - comp.p).toFixed(2)) });
    }).sort(function (a, b) { return a.dp - b.dp; });
    var top3Ids = ranked.slice(0, 3).map(function (s) { return s.idx; });

    function mapX(p) { return 62 + (p / 10.5) * 684; }
    function mapY(bp) { return 372 - (Math.min(125, Math.max(25, bp)) - 25) * 2.55; }

    var cx = mapX(comp.p), cy = 114;
    var mx = mapX(mixP), my = mapY(mixBp);

    var neighborLines = ranked.slice(0, 3).map(function (s) {
      return '<line x1="' + cx.toFixed(1) + '" y1="' + cy + '" x2="' + mapX(s.p).toFixed(1) + '" y2="' + mapY(s.bpNum).toFixed(1) + '" stroke="#34d399" stroke-width="1.8" stroke-dasharray="4 3"/>';
    }).join("");

    var solvLabelOffsets = {
      "正己烷": [0, -13],
      "石油醚": [0, 19],
      "乙酸乙酯": [-26, -12],
      "乙醇": [34, 4],
      "甲醇": [30, 3],
      "丙酮": [0, 21],
      "三氯甲烷": [-14, 19]
    };
    var solvStars = solvents.map(function (s) {
      var x = mapX(s.p), y = mapY(s.bpNum);
      var isTop = top3Ids.indexOf(s.idx) >= 0;
      var shortName = s.name.split("(")[0].trim();
      var off = solvLabelOffsets[shortName] || [0, 18];
      return (
        '<g data-v29-psolv="' + s.idx + '" style="cursor:pointer;">' +
          '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="14" fill="transparent"/>' +
          '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (isTop ? 9 : 6) + '" fill="' + (isTop ? "#10b981" : "#38bdf8") + '" stroke="#fff" stroke-width="' + (isTop ? 2.2 : 1) + '"/>' +
          '<text class="v29-svg-halo" x="' + (x + off[0]).toFixed(1) + '" y="' + (y + off[1]).toFixed(1) + '" text-anchor="middle" fill="' + (isTop ? "#a7f3d0" : "#cbd5e1") + '" font-size="10" font-weight="' + (isTop ? 800 : 600) + '">' + esc(shortName) + " (" + s.p + ")</text>" +
        "</g>"
      );
    }).join("");

    // 按升序交替上下错层 + 紧邻节点微调 dx，实现 100% 零重叠
    var compStars = POLAR_COMPOUNDS.map(function (c, idx) {
      var x = mapX(c.p);
      var isAct = c.id === comp.id;
      var cyPos = isAct ? 114 : 62;
      var labelY = isAct ? 96 : (idx % 2 === 0 ? 46 : 82);
      var dx = 0;
      if (!isAct && c.id === "ginsenoside") dx = -12;
      if (!isAct && c.id === "baicalin") dx = 12;
      return (
        '<g data-v29-pcomp="' + c.id + '" style="cursor:pointer;">' +
          '<circle cx="' + x.toFixed(1) + '" cy="' + cyPos + '" r="16" fill="transparent"/>' +
          '<circle cx="' + x.toFixed(1) + '" cy="' + cyPos + '" r="' + (isAct ? 11 : 6.5) + '" fill="' + (isAct ? "#f59e0b" : "#94a3b8") + '" stroke="#fff" stroke-width="' + (isAct ? 2.5 : 1) + '"/>' +
          '<text class="v29-svg-halo" x="' + (x + dx).toFixed(1) + '" y="' + labelY + '" text-anchor="middle" fill="' + (isAct ? "#fde68a" : "#cbd5e1") + '" font-size="10.2" font-weight="' + (isAct ? 800 : 600) + '">' + esc(c.name) + "</text>" +
        "</g>"
      );
    }).join("");

    var z1 = mapX(3.0).toFixed(1), z2 = mapX(6.0).toFixed(1);

    bodyEl.innerHTML =
      '<div class="v29-split">' +
        '<div class="v29-canvas-box">' +
          '<svg viewBox="0 0 800 426" style="width:100%;height:434px;display:block;">' +
            // 三大极性背景分区带
            '<rect pointer-events="none" x="52" y="24" width="' + (Number(z1) - 52).toFixed(1) + '" height="360" fill="rgba(56,189,248,0.05)"/>' +
            '<rect pointer-events="none" x="' + z1 + '" y="24" width="' + (Number(z2) - Number(z1)).toFixed(1) + '" height="360" fill="rgba(16,185,129,0.06)"/>' +
            '<rect pointer-events="none" x="' + z2 + '" y="24" width="' + (760 - Number(z2)).toFixed(1) + '" height="360" fill="rgba(245,158,11,0.05)"/>' +
            '<text x="145" y="36" text-anchor="middle" fill="rgba(125,211,252,0.55)" font-size="10" font-weight="700">低极性亲脂区 (p 0~3)</text>' +
            '<text x="355" y="36" text-anchor="middle" fill="rgba(110,231,183,0.55)" font-size="10" font-weight="700">中等极性两亲区 (p 3~6)</text>' +
            '<text x="610" y="36" text-anchor="middle" fill="rgba(253,230,138,0.55)" font-size="10" font-weight="700">高极性亲水区 (p 6~10.2)</text>' +
            // 纵轴沸点参考刻度
            '<line x1="52" y1="384" x2="762" y2="384" stroke="rgba(148,163,184,0.35)"/>' +
            '<line x1="52" y1="24" x2="52" y2="384" stroke="rgba(148,163,184,0.30)"/>' +
            '<text x="46" y="' + mapY(100).toFixed(1) + '" text-anchor="end" fill="#64748b" font-size="9.5">100℃</text>' +
            '<text x="46" y="' + mapY(70).toFixed(1) + '" text-anchor="end" fill="#64748b" font-size="9.5">70℃</text>' +
            '<text x="46" y="' + mapY(40).toFixed(1) + '" text-anchor="end" fill="#64748b" font-size="9.5">40℃</text>' +
            '<text x="408" y="410" text-anchor="middle" fill="#94a3b8" font-size="11" font-weight="700">溶剂 / 成分极性指数 p（0.1 非极性 → 10.2 强极性）· 纵轴：沸点 (℃)</text>' +
            neighborLines + compStars + solvStars +
            // 实时混合溶剂星标（支持无重建原地更新）
            '<g id="v29MixStarGroup">' +
              '<circle id="v29MixCircle" cx="' + mx.toFixed(1) + '" cy="' + my.toFixed(1) + '" r="10.5" fill="#fbbf24" stroke="#ffffff" stroke-width="2.6"/>' +
              '<text id="v29MixLabel" class="v29-svg-halo" x="' + mx.toFixed(1) + '" y="' + (my - 15).toFixed(1) + '" text-anchor="middle" fill="#fef08a" font-size="11" font-weight="900">★ 混合体系 p=' + mixP + "</text>" +
            "</g>" +
          "</svg>" +
        "</div>" +
        '<div class="v29-card">' +
          '<div style="font-size:15px;font-weight:900;margin-bottom:8px;">🌌 混合溶剂实时调配与最近邻推荐</div>' +
          '<div style="font-size:12px;margin-bottom:10px;">当前目标成分：<strong style="color:#d97706;">' + esc(comp.name) + "（p=" + comp.p + "）</strong><br/>" + esc(comp.desc) + "</div>" +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">' +
            '<div><label style="font-size:11px;font-weight:700;display:block;margin-bottom:3px;">溶剂 A</label><select class="v29-select" id="v29SolvA" style="width:100%;">' + solvents.map(function (s) { return '<option value="' + s.idx + '"' + (s.idx === polarState.solvA ? " selected" : "") + ">" + esc(s.name) + "</option>"; }).join("") + "</select></div>" +
            '<div><label style="font-size:11px;font-weight:700;display:block;margin-bottom:3px;">溶剂 B</label><select class="v29-select" id="v29SolvB" style="width:100%;">' + solvents.map(function (s) { return '<option value="' + s.idx + '"' + (s.idx === polarState.solvB ? " selected" : "") + ">" + esc(s.name) + "</option>"; }).join("") + "</select></div>" +
          "</div>" +
          '<div style="margin-bottom:10px;">' +
            '<div style="display:flex;justify-content:space-between;font-size:12px;font-weight:800;"><span id="v29RatioText">配比（A ' + polarState.ratioA + '% : B ' + (100 - polarState.ratioA) + '%）</span><span id="v29MixPText" style="color:#0f766e;">混合极性 p = ' + mixP + "（|Δp|=" + mixDp + "）</span></div>" +
            '<input type="range" id="v29MixRatio" min="0" max="100" step="5" value="' + polarState.ratioA + '" style="width:100%;accent-color:#0f766e;margin-top:4px;"/>' +
          "</div>" +
          (function () {
            var polScore = Math.max(0, Math.round(100 - mixDp * 22));
            var ehsPen = /含卤|高危|有毒|神经毒|毒性/.test(sA.green + sB.green) ? 18 : 0;
            var bpPen = mixBp > 95 ? 8 : 0;
            var fitScore = Math.max(20, Math.min(100, polScore - ehsPen - bpPen));
            var fitColor = fitScore >= 82 ? "#059669" : fitScore >= 60 ? "#d97706" : "#e11d48";
            var mechHint = mixDp <= 0.6 ? "极性高度匹配，符合相似相溶最优溶出窗口。"
              : mixP > comp.p ? "体系偏强极性，易共提水溶性多糖/鞣质杂质，建议提高低极性溶剂比例。"
              : "体系偏弱极性，目标成分溶解度受限，建议提高极性溶剂比例。";
            return '<div class="v29-score-box"><div><div style="font-size:11.5px;font-weight:800;">🧪 综合适配度评分（极性/沸点/EHS）</div><div style="font-size:11px;color:#64748b;margin-top:2px;">' + mechHint + '</div></div><div class="v29-score-num" style="color:' + fitColor + ';">' + fitScore + '</div></div>';
          })() +
          '<div class="v29-ehs-bar' + (/含卤|高危|有毒|神经毒|毒性/.test(sA.green + sB.green) ? " is-warn" : "") + '">' +
            (/含卤|高危|有毒|神经毒|毒性/.test(sA.green + sB.green)
              ? "⚠️ EHS 安全提示：当前混合体系含卤/有毒溶剂（" + esc(sA.name.split("(")[0]) + "/" + esc(sB.name.split("(")[0]) + "），须在通风橱操作或改用乙醇/乙酸乙酯绿色替代。"
              : "✅ 绿色化学合规：当前二元溶剂体系环境友好，适用于常规教学与中试放大。") +
          "</div>" +
          '<button type="button" class="v29-btn" id="v29AutoMatchBtn" style="width:100%;margin-bottom:12px;">✨ 一键计算目标「' + esc(comp.name) + '」黄金混合配比</button>' +
          '<div style="font-size:12px;font-weight:800;margin-bottom:6px;">🎯 单一溶剂极性最近邻 Top 3：</div>' +
          '<div style="display:flex;flex-direction:column;gap:6px;">' +
            ranked.slice(0, 3).map(function (s, i) {
              return '<div style="padding:7px 10px;border-radius:10px;background:rgba(16,185,129,0.09);font-size:12px;display:flex;justify-content:space-between;"><span><strong>#' + (i + 1) + " " + esc(s.name) + "</strong> (p=" + s.p + ")</span><span>|Δp|=" + s.dp + " · " + esc(s.green) + "</span></div>";
            }).join("") +
          "</div>" +
        "</div>" +
      "</div>";

    bodyEl.querySelectorAll("[data-v29-pcomp]").forEach(function (g) {
      g.addEventListener("click", function () { polarState.compId = this.getAttribute("data-v29-pcomp"); renderBody(); });
    });
    bodyEl.querySelectorAll("[data-v29-psolv]").forEach(function (g) {
      g.addEventListener("click", function () {
        var idx = Number(this.getAttribute("data-v29-psolv"));
        if (idx !== polarState.solvB) polarState.solvA = idx;
        renderBody();
      });
    });
    bodyEl.querySelector("#v29SolvA").addEventListener("change", function () { polarState.solvA = Number(this.value); renderBody(); });
    bodyEl.querySelector("#v29SolvB").addEventListener("change", function () { polarState.solvB = Number(this.value); renderBody(); });

    // 60fps 原地更新混合星标，拖动不断焦
    bodyEl.querySelector("#v29MixRatio").addEventListener("input", function () {
      polarState.ratioA = Number(this.value);
      var f = polarState.ratioA / 100;
      var np = Number((sA.p * f + sB.p * (1 - f)).toFixed(2));
      var nbp = Math.round(sA.bpNum * f + sB.bpNum * (1 - f));
      var ndp = Number(Math.abs(np - comp.p).toFixed(2));
      var nx = mapX(np).toFixed(1), ny = mapY(nbp).toFixed(1);
      var cEl = bodyEl.querySelector("#v29MixCircle");
      var lEl = bodyEl.querySelector("#v29MixLabel");
      if (cEl) { cEl.setAttribute("cx", nx); cEl.setAttribute("cy", ny); }
      if (lEl) { lEl.setAttribute("x", nx); lEl.setAttribute("y", (Number(ny) - 15).toFixed(1)); lEl.textContent = "★ 混合体系 p=" + np; }
      var rt = bodyEl.querySelector("#v29RatioText");
      var pt = bodyEl.querySelector("#v29MixPText");
      if (rt) rt.textContent = "配比（A " + polarState.ratioA + "% : B " + (100 - polarState.ratioA) + "%）";
      if (pt) pt.textContent = "混合极性 p = " + np + "（|Δp|=" + ndp + "）";
    });

    // 一键黄金配比匹配
    bodyEl.querySelector("#v29AutoMatchBtn").addEventListener("click", function () {
      var low = sA.p <= sB.p ? sA : sB;
      var high = sA.p <= sB.p ? sB : sA;
      if (comp.p < low.p || comp.p > high.p || Math.abs(sA.p - sB.p) < 0.05) {
        // 自动切换为 乙醇(5.2)/正己烷(0.1) 或 乙醇(5.2)/纯化水(10.2) 覆盖目标极性
        if (comp.p <= 5.2) { polarState.solvA = 1; polarState.solvB = 7; }
        else { polarState.solvA = 7; polarState.solvB = 9; }
        sA = solvents[polarState.solvA];
        sB = solvents[polarState.solvB];
      }
      var rawFrac = (comp.p - sB.p) / (sA.p - sB.p);
      var pct = Math.max(0, Math.min(100, Math.round((rawFrac * 100) / 5) * 5));
      polarState.ratioA = pct;
      renderBody();
    });
  }

  function renderPipelineTab(bodyEl) {
    var m = calcPipelineMetrics();
    var st = PIPE_STAGES[pipeState.activeStage] || PIPE_STAGES[1];
    var curVal = pipeState.params[st.pKey];
    var bottleStage = PIPE_STAGES[m.minIdx];
    var bottleEff = m.stageEff[m.minIdx];

    var nodesSvg = PIPE_STAGES.map(function (s, idx) {
      var col = idx % 4;
      var row = Math.floor(idx / 4);
      var x = row === 0 ? (95 + col * 195) : (680 - col * 195);
      var y = row === 0 ? 115 : 275;
      var isAct = idx === pipeState.activeStage;
      var eff = m.stageEff[idx];
      var fill = eff >= 88 ? "#059669" : eff >= 74 ? "#d97706" : "#e11d48";
      return (
        '<g data-v29-pstage="' + idx + '" style="cursor:pointer;">' +
          '<polygon points="' + (x - 56) + "," + (y - 18) + " " + x + "," + (y - 42) + " " + (x + 56) + "," + (y - 18) + " " + x + "," + (y + 6) + '" fill="' + fill + '" opacity="' + (isAct ? "1" : "0.84") + '" stroke="' + (isAct ? "#fde68a" : "#ffffff") + '" stroke-width="' + (isAct ? 3.2 : 1.3) + '"/>' +
          '<polygon points="' + (x - 56) + "," + (y - 18) + " " + x + "," + (y + 6) + " " + x + "," + (y + 34) + " " + (x - 56) + "," + (y + 10) + '" fill="#064e3b" opacity="0.88"/>' +
          '<polygon points="' + (x + 56) + "," + (y - 18) + " " + x + "," + (y + 6) + " " + x + "," + (y + 34) + " " + (x + 56) + "," + (y + 10) + '" fill="#0f766e" opacity="0.78"/>' +
          '<text x="' + x + '" y="' + (y - 16) + '" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="900">' + s.code + " " + esc(s.name) + "</text>" +
          '<text x="' + x + '" y="' + (y + 52) + '" text-anchor="middle" fill="' + (idx === m.minIdx && eff < 85 ? "#fda4af" : "#a7f3d0") + '" font-size="10.5" font-weight="800">效率 ' + eff + "%" + (idx === m.minIdx && eff < 85 ? " ⚠短板" : "") + "</text>" +
        "</g>"
      );
    }).join("");

    bodyEl.innerHTML =
      '<div class="v29-toolbar">' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">' +
          '<span style="font-size:12px;font-weight:800;">工况预设：</span>' +
          Object.keys(PIPE_PRESETS).map(function (k) {
            return '<button type="button" class="v29-pill' + (pipeState.preset === k ? " is-active" : "") + '" data-v29-preset="' + k + '">' + esc(PIPE_PRESETS[k].name) + "</button>";
          }).join("") +
        "</div>" +
        '<div style="display:flex;gap:6px;align-items:center;"><button type="button" class="v29-btn-ghost" id="v29PipeSnap" style="padding:4px 10px;font-size:11.5px;">' + (pipeState.baseline ? "📸 更新基线对比" : "📸 设为基线对照") + '</button></div>' +
      "</div>" +
      (function () {
        var b = pipeState.baseline;
        function fmtDelta(cur, base, unit, invertGood) {
          if (!b) return "";
          var d = Number((cur - base).toFixed(1));
          if (Math.abs(d) < 0.05) return "";
          var good = invertGood ? d < 0 : d > 0;
          return '<span class="v29-delta ' + (good ? "is-up" : "is-down") + '">' + (d > 0 ? "+" : "") + d + unit + (d > 0 ? " ▲" : " ▼") + "</span>";
        }
        return (
          '<div class="v29-kpi-grid">' +
            '<div class="v29-kpi"><span>全链路总产率</span><strong style="color:#059669;">' + m.totalYield + '%' + fmtDelta(m.totalYield, b && b.totalYield, "%", false) + '</strong></div>' +
            '<div class="v29-kpi"><span>成品质量综合分</span><strong style="color:#0284c7;">' + m.qualityScore + ' / 100' + fmtDelta(m.qualityScore, b && b.qualityScore, "", false) + '</strong></div>' +
            '<div class="v29-kpi"><span>累计热敏损耗</span><strong style="color:' + (m.thermalLoss > 10 ? "#e11d48" : "#d97706") + ';">' + m.thermalLoss + '%' + fmtDelta(m.thermalLoss, b && b.thermalLoss, "%", true) + '</strong></div>' +
            '<div class="v29-kpi"><span>中试单位能耗成本</span><strong>¥ ' + m.unitCost + ' / kg' + fmtDelta(m.unitCost, b && b.unitCost, "", true) + '</strong></div>' +
          "</div>"
        );
      })() +
      '<div class="v29-split">' +
        '<div class="v29-canvas-box">' +
          '<svg viewBox="0 0 780 365" style="width:100%;height:365px;display:block;">' +
            '<path d="M95 115 L680 115 L680 275 L95 275" fill="none" stroke="rgba(52,211,153,0.28)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<path d="M95 115 L680 115 L680 275 L95 275" fill="none" stroke="#34d399" stroke-width="3.2" class="v29-pipe-flow" stroke-linejoin="round"/>' +
            nodesSvg +
          "</svg>" +
        "</div>" +
        '<div class="v29-card">' +
          '<div style="font-size:15px;font-weight:900;margin-bottom:4px;">⚙️ 工段参数控制：' + st.code + " " + esc(st.name) + "</div>" +
          '<div style="font-size:12px;color:#64748b;margin-bottom:12px;">设备单元：<strong>' + esc(st.unit) + '</strong> · 推荐安全窗：<strong>' + esc(st.opt) + "</strong></div>" +
          '<div style="padding:12px;border-radius:12px;background:rgba(16,185,129,0.08);margin-bottom:10px;">' +
            '<div style="display:flex;justify-content:space-between;font-size:13px;font-weight:800;margin-bottom:6px;"><span>' + esc(st.label) + '</span><span style="color:#0f766e;">' + curVal + "</span></div>" +
            '<input type="range" id="v29PipeSlider" min="' + st.min + '" max="' + st.max + '" step="' + st.step + '" value="' + curVal + '" style="width:100%;accent-color:#0f766e;"/>' +
          "</div>" +
          '<div style="font-size:12px;line-height:1.58;">当前工段效率：<strong style="color:#059669;">' + m.stageEff[pipeState.activeStage] + '%</strong><br/>' + esc(st.tip) + "</div>" +
          '<div class="v29-diag-box' + (bottleEff < 76 ? " is-danger" : "") + '">' +
            '<strong>🔎 全链路瓶颈自动诊断：</strong>当前最低效工段为 <strong>' + bottleStage.code + " " + esc(bottleStage.name) + "（" + bottleEff + "%）</strong>" +
            (bottleEff >= 88 ? "，全线处于 GMP 稳态优良区间。" : "，建议优先回调至推荐窗「" + esc(bottleStage.opt) + "」以拉升总产率。") +
            (bottleEff < 88 ? '<div style="display:flex;gap:6px;margin-top:8px;"><button type="button" class="v29-btn-ghost" id="v29PipeJumpBottle" style="padding:4px 9px;font-size:11px;">🎯 定位短板工段</button><button type="button" class="v29-btn" id="v29PipeFixBottle" style="padding:4px 10px;font-size:11px;">✨ 一键自动纠偏</button></div>' : "") +
          "</div>" +
          (function () {
            var p = pipeState.params;
            var cRaw = 18, cExt = p.extTemp * 0.12, cPur = p.resinElute * 0.08, cQc = p.qcSample * 1.4;
            var tot = cRaw + cExt + cPur + cQc;
            var w1 = Math.round((cRaw / tot) * 100), w2 = Math.round((cExt / tot) * 100), w3 = Math.round((cPur / tot) * 100), w4 = Math.max(4, 100 - w1 - w2 - w3);
            return '<div style="margin-top:10px;font-size:11px;font-weight:700;color:#64748b;">单位成本构成（原料 ' + w1 + '% · 提取能耗 ' + w2 + '% · 溶剂纯化 ' + w3 + '% · QC ' + w4 + '%）<div class="v29-cost-bar"><i style="width:' + w1 + '%;background:#0f766e;"></i><i style="width:' + w2 + '%;background:#f59e0b;"></i><i style="width:' + w3 + '%;background:#38bdf8;"></i><i style="width:' + w4 + '%;background:#a855f7;"></i></div></div>';
          })() +
          '<div class="v29-mini-bars">' +
            PIPE_STAGES.map(function (s, idx) {
              var e = m.stageEff[idx];
              var c = e >= 88 ? "#10b981" : e >= 74 ? "#f59e0b" : "#f43f5e";
              return '<button type="button" class="v29-mini-bar' + (idx === pipeState.activeStage ? " is-active" : "") + '" data-v29-pstage="' + idx + '" title="' + s.code + " " + esc(s.name) + " (" + e + '%)"><div class="v29-mini-bar-fill"><i style="height:' + e + '%;background:' + c + ';"></i></div><span>' + s.code + "</span></button>";
            }).join("") +
          "</div>" +
        "</div>" +
      "</div>";

    bodyEl.querySelectorAll("[data-v29-preset]").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = this.getAttribute("data-v29-preset");
        pipeState.preset = k;
        pipeState.params = Object.assign({}, PIPE_PRESETS[k].params);
        renderBody();
      });
    });
    bodyEl.querySelectorAll("[data-v29-pstage]").forEach(function (g) {
      g.addEventListener("click", function () { pipeState.activeStage = Number(this.getAttribute("data-v29-pstage")); renderBody(); });
    });
    bodyEl.querySelector("#v29PipeSlider").addEventListener("input", function () {
      pipeState.preset = "custom";
      pipeState.params[st.pKey] = Number(this.value);
      renderBody();
      var sl = bodyEl.querySelector("#v29PipeSlider");
      if (sl) sl.focus();
    });
    var jumpBtn = bodyEl.querySelector("#v29PipeJumpBottle");
    if (jumpBtn) jumpBtn.addEventListener("click", function () { pipeState.activeStage = m.minIdx; renderBody(); });
    var fixBtn = bodyEl.querySelector("#v29PipeFixBottle");
    if (fixBtn) fixBtn.addEventListener("click", function () {
      var bk = bottleStage.pKey;
      pipeState.params[bk] = PIPE_PRESETS.gmp.params[bk];
      pipeState.activeStage = m.minIdx;
      renderBody();
    });
    var snapBtn = bodyEl.querySelector("#v29PipeSnap");
    if (snapBtn) snapBtn.addEventListener("click", function () {
      pipeState.baseline = Object.assign({}, m);
      renderBody();
    });
  }

  function renderTimelineTab(bodyEl) {
    var script = resolveTimelineScript(tlState.scriptId);
    var shot = script.shots[tlState.shotIdx] || script.shots[0];
    var noteKey = tlState.scriptId + "_" + tlState.shotIdx;
    var curNote = tlState.notes[noteKey] || "";
    var pct = Math.round(((tlState.shotIdx + 1) / script.shots.length) * 100);
    var allTopics = (window.TCM_LAB_API && window.TCM_LAB_API.getAllTopics) ? window.TCM_LAB_API.getAllTopics() : [];

    bodyEl.innerHTML =
      '<div class="v29-toolbar">' +
        '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">' +
          '<select class="v29-select" id="v29TlScript" style="max-width:340px;">' +
            '<optgroup label="经典精编导演剧本">' +
              Object.keys(TL_SCRIPTS).map(function (k) {
                return '<option value="' + k + '"' + (k === tlState.scriptId ? " selected" : "") + ">" + esc(TL_SCRIPTS[k].name) + "</option>";
              }).join("") +
            '</optgroup>' +
            (allTopics.length ? (
              '<optgroup label="全题库 ' + allTopics.length + ' 味药材自动分镜剧本">' +
                allTopics.map(function (t) {
                  var val = "topic:" + t.id;
                  return '<option value="' + esc(val) + '"' + (val === tlState.scriptId ? " selected" : "") + ">" + esc(t.herb + " · " + (t.compound || t.category)) + "</option>";
                }).join("") +
              '</optgroup>'
            ) : "") +
          "</select>" +
          '<button type="button" class="v29-btn" id="v29TlPlay">' + (tlState.playing ? "暂停播放" : "播放分镜") + "</button>" +
          [0.5, 1, 2].map(function (sp) {
            return '<button type="button" class="v29-pill' + (tlState.speed === sp ? " is-active" : "") + '" data-v29-speed="' + sp + '">' + sp + "× 倍速</button>";
          }).join("") +
        "</div>" +
        '<div style="display:flex;gap:8px;align-items:center;"><span class="v29-kbd-hint">←/→ 切镜 · Space 播放</span><button type="button" class="v29-btn-ghost" id="v29TlExport">导出课堂演示课件 (HTML)</button></div>' +
      "</div>" +

      '<div class="v29-tl-progress"><div style="width:' + pct + '%;"></div></div>' +

      '<div class="v29-timeline-rail">' +
        script.shots.map(function (s, idx) {
          var hasNote = Boolean(tlState.notes[tlState.scriptId + "_" + idx]);
          return (
            '<button type="button" class="v29-shot-card' + (idx === tlState.shotIdx ? " is-active" : "") + '" data-v29-shot="' + idx + '">' +
              '<div style="font-size:10.5px;font-weight:800;opacity:0.82;display:flex;justify-content:space-between;"><span>' + esc(s.code) + " · " + esc(s.dur) + "</span>" + (hasNote ? "<span>📝</span>" : "") + "</div>" +
              '<div style="font-size:12.5px;font-weight:800;margin-top:3px;">' + esc(s.title) + "</div>" +
            "</button>"
          );
        }).join("") +
      "</div>" +

      '<div class="v29-split">' +
        '<div class="v29-card" style="min-height:248px;display:flex;flex-direction:column;justify-content:space-between;">' +
          '<div>' +
            '<div style="font-size:12px;font-weight:800;color:#0f766e;">🎬 当前镜头 ' + (tlState.shotIdx + 1) + " / " + script.shots.length + " · 耗时 " + esc(shot.dur) + "</div>" +
            '<h3 style="margin:6px 0 4px;font-size:20px;font-weight:900;">' + esc(shot.title) + "</h3>" +
            '<div class="v29-badge-row">' +
              '<span class="v29-badge">🌡️ ' + esc(shot.temp) + "</span>" +
              '<span class="v29-badge">🧪 ' + esc(shot.solv) + "</span>" +
              '<span class="v29-badge">🛡️ ' + esc(shot.risk) + "</span>" +
            "</div>" +
            '<p style="font-size:13.5px;line-height:1.7;margin:0 0 12px;">' + esc(shot.detail) + "</p>" +
            '<div style="padding:10px 12px;border-radius:12px;background:rgba(245,158,11,0.12);font-size:12.5px;font-weight:700;color:#b45309;">⚠️ 导演避坑要点：' + esc(shot.tip) + "</div>" +
            '<div class="v29-qc-card">' +
              '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;"><strong>🎯 课堂质控微问答：为何本镜头须遵循「' + esc(shot.risk) + '」？</strong><button type="button" class="v29-pill" id="v29TlQcToggle">' + (tlState.qcRevealed ? "收起解析" : "查看解析") + "</button></div>" +
              (tlState.qcRevealed ? '<div style="margin-top:6px;">标准解析：在「' + esc(shot.title) + '」工步中（条件：' + esc(shot.temp) + ' / ' + esc(shot.solv) + '），严格执行「' + esc(shot.risk) + '」可直接避免目标成分失活或安全事故——' + esc(shot.tip) + '</div>' : "") +
            "</div>" +
          "</div>" +
          '<div style="display:flex;justify-content:space-between;margin-top:12px;">' +
            '<button type="button" class="v29-btn-ghost" id="v29TlPrev">← 上一镜头</button>' +
            '<button type="button" class="v29-btn-ghost" id="v29TlNext">下一镜头 →</button>' +
          "</div>" +
        "</div>" +
        '<div class="v29-card">' +
          '<div style="font-size:14px;font-weight:900;margin-bottom:8px;">📝 本镜头课堂批注（自动持久化，随课件导出）</div>' +
          '<textarea id="v29TlNote" class="v29-input" style="width:100%;min-height:132px;resize:vertical;" placeholder="输入本步骤教学批注、安全强调或思考题...">' + esc(curNote) + "</textarea>" +
          '<div style="margin-top:10px;display:flex;justify-content:space-between;align-items:center;">' +
            '<span style="font-size:11.5px;color:#64748b;">已批注镜头：' + Object.keys(tlState.notes).filter(function (k) { return tlState.notes[k]; }).length + ' 个</span>' +
            '<button type="button" class="v29-btn" id="v29TlSaveNote">保存批注</button>' +
          "</div>" +
        "</div>" +
      "</div>";

    bodyEl.querySelector("#v29TlScript").addEventListener("change", function () {
      stopTimelineTimer();
      tlState.scriptId = this.value;
      tlState.shotIdx = 0;
      renderBody();
    });
    bodyEl.querySelectorAll("[data-v29-shot]").forEach(function (b) {
      b.addEventListener("click", function () {
        tlState.shotIdx = Number(this.getAttribute("data-v29-shot"));
        renderBody();
      });
    });
    bodyEl.querySelector("#v29TlPrev").addEventListener("click", function () {
      tlState.shotIdx = (tlState.shotIdx - 1 + script.shots.length) % script.shots.length;
      tlState.qcRevealed = false;
      renderBody();
    });
    var qcBtn = bodyEl.querySelector("#v29TlQcToggle");
    if (qcBtn) qcBtn.addEventListener("click", function () { tlState.qcRevealed = !tlState.qcRevealed; renderBody(); });
    bodyEl.querySelector("#v29TlNext").addEventListener("click", function () {
      tlState.shotIdx = (tlState.shotIdx + 1) % script.shots.length;
      renderBody();
    });
    bodyEl.querySelectorAll("[data-v29-speed]").forEach(function (b) {
      b.addEventListener("click", function () {
        tlState.speed = Number(this.getAttribute("data-v29-speed"));
        if (tlState.playing) { stopTimelineTimer(); startTimelinePlay(); }
        else renderBody();
      });
    });
    bodyEl.querySelector("#v29TlPlay").addEventListener("click", function () {
      if (tlState.playing) { stopTimelineTimer(); renderBody(); }
      else startTimelinePlay();
    });
    bodyEl.querySelector("#v29TlSaveNote").addEventListener("click", function () {
      var val = bodyEl.querySelector("#v29TlNote").value.trim();
      tlState.notes[noteKey] = val;
      saveTlNotes(tlState.notes);
      if (window.TCM_LAB_API && window.TCM_LAB_API.showToast) window.TCM_LAB_API.showToast("已保存 " + shot.code + " 课堂批注！");
      renderBody();
    });
    bodyEl.querySelector("#v29TlExport").addEventListener("click", function () {
      var slides = script.shots.map(function (s, idx) {
        var nk = tlState.scriptId + "_" + idx;
        return '<section style="padding:24px 28px;margin:16px auto;max-width:860px;border-radius:16px;background:#fff;border:1px solid #dbe7e3;box-shadow:0 4px 16px rgba(7,47,41,0.06);">' +
          '<div style="font-size:12px;font-weight:800;color:#0f766e;">' + esc(s.code) + " · 耗时 " + esc(s.dur) + " · " + esc(s.temp) + " · " + esc(s.solv) + "</div>" +
          '<h2 style="margin:6px 0 10px;color:#072f29;">' + esc(s.title) + "</h2>" +
          '<p style="line-height:1.75;color:#1e293b;">' + esc(s.detail) + "</p>" +
          '<p style="padding:10px 12px;border-radius:10px;background:#fef3c7;color:#92400e;font-weight:700;">避坑要点：' + esc(s.tip) + "</p>" +
          (tlState.notes[nk] ? '<p style="padding:10px 12px;border-radius:10px;background:#ecfdf5;color:#065f46;font-weight:700;">教师课堂批注：' + esc(tlState.notes[nk]) + "</p>" : "") + "</section>";
      }).join("");
      var htmlDoc = '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>' + esc(script.name) + '</title></head><body style="font-family:-apple-system,PingFang SC,sans-serif;background:#eef4f2;padding:24px;margin:0;"><header style="max-width:860px;margin:0 auto 20px;padding:20px 26px;border-radius:16px;background:linear-gradient(135deg,#072f29,#0f5c54);color:#fff;"><h1 style="margin:0;font-size:22px;">' + esc(script.name) + '</h1><p style="margin:6px 0 0;opacity:0.85;font-size:13px;">本草智研 · 实验时间轴导演模式导出课件</p></header>' + slides + "</body></html>";
      var blob = new Blob([htmlDoc], { type: "text/html;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "本草智研_课堂时间轴课件_" + tlState.scriptId + ".html";
      a.click();
    });
  }

  function startTimelinePlay() {
    stopTimelineTimer();
    tlState.playing = true;
    var script = resolveTimelineScript(tlState.scriptId);
    tlState.timer = setInterval(function () {
      tlState.shotIdx = (tlState.shotIdx + 1) % script.shots.length;
      renderBody();
    }, Math.round(2200 / tlState.speed));
    renderBody();
  }

  function renderMicroscopeTab(bodyEl) {
    var list = getMicroHerbs();
    if (!microState.idA) {
      var defA = list.find(function (x) { return /丹参/.test(x.herb); }) || list[0];
      var defB = list.find(function (x) { return /黄芩/.test(x.herb); }) || list[1] || list[0];
      microState.idA = defA.id;
      microState.idB = defB.id;
    }
    var tA = list.find(function (x) { return x.id === microState.idA; }) || list[0];
    var tB = list.find(function (x) { return x.id === microState.idB; }) || list[1] || list[0];
    var spA = deriveMicroSpec(tA);
    var spB = deriveMicroSpec(tB);
    var nameA = tA.herb.split("（")[0];
    var nameB = tB.herb.split("（")[0];

    var rows = [
      { dim: "化学大类", a: tA.category || "-", b: tB.category || "-", reason: "骨架母核不同直接决定极性、酸碱性与发色团差异。" },
      { dim: "核心活性成分", a: tA.compound || "-", b: tB.compound || "-", reason: "目标指标成分结构差异决定提取分离主路线。" },
      { dim: "理想极性窗 (p)", a: spA.pWin, b: spB.pWin, reason: "极性窗错位意味着必须选用不同极性指数的溶剂体系。" },
      { dim: "耐热上限 (℃)", a: spA.maxT + "℃", b: spB.maxT + "℃", reason: "热敏/酶解特性差异决定了低温超声、回流或沸水杀酶路线。" },
      { dim: "推荐溶剂体系", a: spA.solv, b: spB.solv, reason: "基于相似相溶与酸碱成盐规律自动匹配。" },
      { dim: "首选提取装置", a: spA.rig, b: spB.rig, reason: "挥发性、热敏性与传质阻力决定装置选型。" },
      { dim: "常规料液比", a: spA.ratio, b: spB.ratio, reason: "药材吸液膨胀率与目标成分溶解度不同。" },
      { dim: "UV 特征吸收峰", a: spA.uvPeak + " / " + spA.uvPeak2 + " nm", b: spB.uvPeak + " / " + spB.uvPeak2 + " nm", reason: "共轭双键与助色团差异导致紫外最大吸收波长偏移。" },
      { dim: "TLC 展开体系", a: spA.tlc, b: spB.tlc, reason: "展开剂极性与 pH 修饰剂须适配待测物解离特性。" },
      { dim: "《中国药典》限度", a: spA.limit, b: spB.limit, reason: "各药材天然积累丰度与质控指标不同。" },
      {
        dim: "关联实证文献",
        a: (window.TCM_LAB_API && window.TCM_LAB_API.findLiteratureForTopic ? (window.TCM_LAB_API.findLiteratureForTopic(tA, 1)[0]?.text || "参见平台文献库") : "参见平台文献库"),
        b: (window.TCM_LAB_API && window.TCM_LAB_API.findLiteratureForTopic ? (window.TCM_LAB_API.findLiteratureForTopic(tB, 1)[0]?.text || "参见平台文献库") : "参见平台文献库"),
        reason: "对照平台 91 篇实证文献库提供工艺与质控实验依据。"
      }
    ];

    var diffCount = rows.filter(function (r) { return r.a !== r.b; }).length;
    var visibleRows = microState.diffOnly ? rows.filter(function (r) { return r.a !== r.b; }) : rows;

    bodyEl.innerHTML =
      '<div class="v29-toolbar">' +
        '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">' +
          '<strong style="color:#059669;">样本 A：</strong>' +
          '<select class="v29-select" id="v29MicroA" style="max-width:240px;">' + list.map(function (t) { return '<option value="' + esc(t.id) + '"' + (t.id === tA.id ? " selected" : "") + ">" + esc(t.herb) + "</option>"; }).join("") + "</select>" +
          '<button type="button" class="v29-btn-ghost" id="v29MicroSwap" title="互换样本 A 与 B" style="padding:5px 9px;">⇄</button>' +
          '<strong style="color:#d97706;">样本 B：</strong>' +
          '<select class="v29-select" id="v29MicroB" style="max-width:240px;">' + list.map(function (t) { return '<option value="' + esc(t.id) + '"' + (t.id === tB.id ? " selected" : "") + ">" + esc(t.herb) + "</option>"; }).join("") + "</select>" +
        "</div>" +
        '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">' +
          '<button type="button" class="v29-pill' + (microState.diffOnly ? " is-active" : "") + '" id="v29MicroDiffOnly">' + (microState.diffOnly ? "仅看差异项 (" + diffCount + ")" : "全部 10 维") + "</button>" +
          '<button type="button" class="v29-btn-ghost" id="v29MicroCopyMd" style="padding:4px 10px;font-size:11.5px;">📋 复制对比表</button>' +
          '<span class="v29-diff-tag">检出 ' + diffCount + ' / 10 项差异</span>' +
        "</div>" +
      "</div>" +
      '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:10px;">' +
        '<span style="font-size:11.5px;font-weight:800;color:#64748b;">经典教学对照：</span>' +
        '<button type="button" class="v29-pill" data-v29-mpair="丹参|黄芩">丹参 vs 黄芩（脂溶/水溶）</button>' +
        '<button type="button" class="v29-pill" data-v29-mpair="黄连|金银花">黄连 vs 金银花（生物碱/热敏酚酸）</button>' +
        '<button type="button" class="v29-pill" data-v29-mpair="薄荷|人参">薄荷 vs 人参（挥发油/两亲皂苷）</button>' +
      "</div>" +
      '<div class="v29-card" style="margin-bottom:12px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:6px;">' +
          '<div style="font-size:13px;font-weight:800;">' + (microState.chartMode === "uv" ? "🌈 模拟 UV 紫外特征吸收双谱叠加（200~420 nm）" : microState.chartMode === "kinetics" ? "📈 提取动力学双曲线对比（0~120 min · 含热敏衰减）" : "🕸️ 五维理化性质雷达叠加对比") + "</div>" +
          '<div style="display:flex;gap:6px;">' +
            '<button type="button" class="v29-pill' + (microState.chartMode === "uv" ? " is-active" : "") + '" data-v29-mchart="uv">UV 特征谱</button>' +
            '<button type="button" class="v29-pill' + (microState.chartMode === "kinetics" ? " is-active" : "") + '" data-v29-mchart="kinetics">动力学曲线</button>' +
            '<button type="button" class="v29-pill' + (microState.chartMode === "radar" ? " is-active" : "") + '" data-v29-mchart="radar">五维雷达图</button>' +
          "</div>" +
        "</div>" +
        buildMicroOverlaySvg(spA, spB, nameA, nameB, microState.chartMode) +
      "</div>" +
      (function () {
        var tDiff = Math.abs(spA.maxT - spB.maxT);
        var sameSolv = spA.solv === spB.solv;
        var canCo = sameSolv && tDiff <= 15;
        return '<div class="v29-coext-banner' + (canCo ? "" : " is-split") + '">' +
          '<strong>🧬 复方共提可行性研判：</strong>' +
          (canCo
            ? esc(nameA) + " 与 " + esc(nameB) + " 极性窗与耐热上限（差值 " + tDiff + "℃）接近，具备同体系共提条件，可合并采用「" + esc(spA.solv) + "」协同提取以降低中试能耗。"
            : esc(nameA) + "（" + esc(spA.solv) + " / ≤" + spA.maxT + "℃）与 " + esc(nameB) + "（" + esc(spB.solv) + " / ≤" + spB.maxT + "℃）在溶剂极性或热敏阈值上存在显著错位（温差 " + tDiff + "℃），<strong>建议分提后合并浸膏</strong>，防止高热降解或溶解度失配。") +
        "</div>";
      })() +
      '<div class="v29-card" style="overflow-x:auto;">' +
        '<table class="v29-diff-table">' +
          '<thead><tr><th>对比维度</th><th>样本 A：' + esc(nameA) + '</th><th>样本 B：' + esc(nameB) + '</th><th>差异化学原因解析</th></tr></thead>' +
          "<tbody>" +
            visibleRows.map(function (r) {
              var diff = r.a !== r.b;
              return (
                '<tr class="' + (diff ? "is-diff" : "") + '">' +
                  "<td><strong>" + esc(r.dim) + "</strong> " + (diff ? '<span class="v29-diff-tag">差异</span>' : "") + "</td>" +
                  "<td>" + esc(r.a) + "</td>" +
                  "<td>" + esc(r.b) + "</td>" +
                  "<td>" + esc(diff ? r.reason : "两课题该项一致，可复用相同操作规范。") + "</td>" +
                "</tr>"
              );
            }).join("") +
          "</tbody>" +
        "</table>" +
      "</div>";

    bodyEl.querySelector("#v29MicroA").addEventListener("change", function () { microState.idA = this.value; renderBody(); });
    bodyEl.querySelector("#v29MicroB").addEventListener("change", function () { microState.idB = this.value; renderBody(); });
    bodyEl.querySelector("#v29MicroSwap").addEventListener("click", function () {
      var tmp = microState.idA; microState.idA = microState.idB; microState.idB = tmp;
      renderBody();
    });
    bodyEl.querySelector("#v29MicroDiffOnly").addEventListener("click", function () {
      microState.diffOnly = !microState.diffOnly;
      renderBody();
    });
    bodyEl.querySelectorAll("[data-v29-mchart]").forEach(function (b) {
      b.addEventListener("click", function () {
        microState.chartMode = this.getAttribute("data-v29-mchart");
        renderBody();
      });
    });
    bodyEl.querySelectorAll("[data-v29-mpair]").forEach(function (b) {
      b.addEventListener("click", function () {
        var parts = this.getAttribute("data-v29-mpair").split("|");
        var mA = list.find(function (x) { return x.herb.indexOf(parts[0]) >= 0; });
        var mB = list.find(function (x) { return x.herb.indexOf(parts[1]) >= 0; });
        if (mA) microState.idA = mA.id;
        if (mB) microState.idB = mB.id;
        renderBody();
      });
    });
    var copyMd = bodyEl.querySelector("#v29MicroCopyMd");
    if (copyMd) {
      copyMd.addEventListener("click", function () {
        var md = "| 对比维度 | " + nameA + " | " + nameB + " | 差异化学原因 |\n|---|---|---|---|\n" +
          rows.map(function (r) { return "| " + r.dim + " | " + r.a + " | " + r.b + " | " + (r.a !== r.b ? r.reason : "一致") + " |"; }).join("\n");
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(md).catch(function () {});
        copyMd.textContent = "✅ 已复制";
        setTimeout(function () { copyMd.textContent = "📋 复制对比表"; }, 1400);
      });
    }
  }

  // ==================== 统一模态框装配 ====================
  function ensureModal() {
    var modal = document.getElementById("tcmV29ExploreModal");
    if (modal) return modal;
    modal = document.createElement("div");
    modal.id = "tcmV29ExploreModal";
    modal.innerHTML =
      '<div class="v29-shell" role="dialog" aria-modal="true" aria-label="现代本草可视化探索中心">' +
        '<div class="v29-header">' +
          '<div class="v29-tabs">' +
            '<button type="button" class="v29-tab" data-v29-tab="kg">4.1 知识图谱</button>' +
            '<button type="button" class="v29-tab" data-v29-tab="polarity">4.2 极性宇宙</button>' +
            '<button type="button" class="v29-tab" data-v29-tab="pipeline">4.3 流水线沙盘</button>' +
            '<button type="button" class="v29-tab" data-v29-tab="timeline">4.4 导演时间轴</button>' +
            '<button type="button" class="v29-tab" data-v29-tab="microscope">4.5 对比显微镜</button>' +
          "</div>" +
          '<button type="button" class="v29-close" id="v29CloseBtn">关闭 ×</button>' +
        "</div>" +
        '<div class="v29-body" id="v29Body"></div>' +
      "</div>";
    document.body.appendChild(modal);

    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
    modal.querySelector("#v29CloseBtn").addEventListener("click", closeModal);
    modal.querySelectorAll("[data-v29-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        stopTimelineTimer();
        activeTab = this.getAttribute("data-v29-tab");
        syncTabBar();
        renderBody();
      });
    });
    document.addEventListener("keydown", function (e) {
      if (!modalOpen) return;
      if (e.key === "Escape") { closeModal(); return; }
      if (activeTab === "timeline") {
        var tag = (document.activeElement && document.activeElement.tagName) || "";
        if (tag === "TEXTAREA" || tag === "INPUT" || tag === "SELECT") return;
        var script = resolveTimelineScript(tlState.scriptId);
        if (e.key === "ArrowRight") { e.preventDefault(); tlState.shotIdx = (tlState.shotIdx + 1) % script.shots.length; renderBody(); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); tlState.shotIdx = (tlState.shotIdx - 1 + script.shots.length) % script.shots.length; renderBody(); }
        else if (e.key === " ") { e.preventDefault(); if (tlState.playing) { stopTimelineTimer(); renderBody(); } else startTimelinePlay(); }
      }
    });
    return modal;
  }

  function syncTabBar() {
    var modal = document.getElementById("tcmV29ExploreModal");
    if (!modal) return;
    modal.querySelectorAll("[data-v29-tab]").forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-v29-tab") === activeTab);
    });
  }

  function renderBody() {
    var bodyEl = document.getElementById("v29Body");
    if (!bodyEl) return;
    if (activeTab === "kg") renderKgTab(bodyEl);
    else if (activeTab === "polarity") renderPolarityTab(bodyEl);
    else if (activeTab === "pipeline") renderPipelineTab(bodyEl);
    else if (activeTab === "timeline") renderTimelineTab(bodyEl);
    else if (activeTab === "microscope") renderMicroscopeTab(bodyEl);
  }

  function openModal(tab) {
    if (tab) activeTab = tab;
    var modal = ensureModal();
    modalOpen = true;
    modal.classList.add("is-open");
    syncTabBar();
    renderBody();
  }

  function closeModal() {
    stopTimelineTimer();
    var modal = document.getElementById("tcmV29ExploreModal");
    if (modal) modal.classList.remove("is-open");
    modalOpen = false;
  }

  function mountDockEntry() {
    var dock = document.getElementById("tcmV22FabDock");
    if (!dock || document.getElementById("v29BtnExplore")) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "v29BtnExplore";
    btn.className = "tcm-v22-fab-btn";
    btn.innerHTML = "<span>🔭</span> 知识探索";
    btn.title = "打开板块四：知识图谱 / 极性宇宙 / 工艺流水线 / 导演时间轴 / 对比显微镜";
    btn.addEventListener("click", function () { openModal("kg"); });
    dock.appendChild(btn);
  }

  function init() {
    mountDockEntry();
    setTimeout(mountDockEntry, 600);
    setTimeout(mountDockEntry, 1500);
  }

  window.TCM_V29_EXPLORE = {
    open: openModal,
    close: closeModal,
    getState: function () { return { open: modalOpen, tab: activeTab }; }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
