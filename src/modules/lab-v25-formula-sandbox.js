/**
 * 本草智研 v25 · 2.1 自由配方沙盒（v2 精工深度版）
 * - 真实接入全站 119 项药材题库 + SOLVENT_POLARITY_TABLE（15 溶剂）+ 8 提取装置 + REAGENT_MSDS_DB
 * - 新增实时极性光谱匹配尺（p=0.1~10.2）、动态提取液现象预览瓶（丹红/酶解墨绿/氧化褐变/皂苷泡沫/暴沸气泡）、
 *   温时提取动力学曲线（实时展示高温长时热降解拐点）
 * - 局部 DOM 更新引擎：拖拽滑块 60fps 顺滑更新右侧遥测台，绝不重建左侧滑块丢焦点
 * - 支持随机挑战配方、4 方案最优高亮对比槽 + 一键回填、复制配方摘要、一键导入六步工坊
 */
(function () {
  "use strict";

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var APPARATUSES = [
    { id: "reflux", name: "热回流提取装置", tag: "通用高效", optTemp: [65, 98], kMass: 1.0, maxSafeBpOver: 8, volatileLoss: 0.18, energyFactor: 1.0 },
    { id: "steam", name: "水蒸气蒸馏器", tag: "挥发油专用", optTemp: [95, 105], kMass: 0.96, maxSafeBpOver: 6, volatileLoss: 0.02, energyFactor: 1.15 },
    { id: "ultrasonic", name: "超声辅助提取仪", tag: "低温护热敏", optTemp: [25, 58], kMass: 1.06, maxSafeBpOver: 0, volatileLoss: 0.05, energyFactor: 0.72 },
    { id: "soxhlet", name: "索氏连续虹吸器", tag: "省溶剂穷尽", optTemp: [45, 85], kMass: 1.08, maxSafeBpOver: 6, volatileLoss: 0.10, energyFactor: 0.92 },
    { id: "percolation", name: "常温渗漉柱", tag: "零热损", optTemp: [18, 38], kMass: 0.86, maxSafeBpOver: 0, volatileLoss: 0.02, energyFactor: 0.35 },
    { id: "scfe", name: "超临界 CO₂ 萃取仪", tag: "绿色无残毒", optTemp: [32, 55], kMass: 1.05, maxSafeBpOver: 30, volatileLoss: 0.01, energyFactor: 0.85 },
    { id: "microwave", name: "微波辅助提取仪", tag: "极速升温", optTemp: [50, 90], kMass: 1.09, maxSafeBpOver: 5, volatileLoss: 0.14, energyFactor: 0.65 },
    { id: "decoction", name: "常压煎煮/温浸锅", tag: "传统水提", optTemp: [40, 100], kMass: 0.88, maxSafeBpOver: 2, volatileLoss: 0.42, energyFactor: 1.05 }
  ];

  function buildSolventSystems() {
    var baseTable = (window.TCM_V3_DATA && window.TCM_V3_DATA.SOLVENT_POLARITY_TABLE) || [
      { name: "石油醚(30-60℃)", p: 0.1, bp: "30~60℃", density: "0.65 (上层)", green: "易燃低毒" },
      { name: "正己烷", p: 0.1, bp: "69℃", density: "0.66 (上层)", green: "易燃神经毒" },
      { name: "甲苯", p: 2.4, bp: "111℃", density: "0.87 (上层)", green: "中等毒性" },
      { name: "二氯甲烷", p: 3.1, bp: "40℃", density: "1.33 (下层)", green: "含卤需通风" },
      { name: "三氯甲烷(氯仿)", p: 4.1, bp: "61℃", density: "1.49 (下层)", green: "含卤高危" },
      { name: "乙酸乙酯", p: 4.4, bp: "77℃", density: "0.90 (上层)", green: "绿色推荐" },
      { name: "丙酮", p: 5.1, bp: "56℃", density: "0.79 (互溶)", green: "绿色易燃" },
      { name: "乙醇", p: 5.2, bp: "78℃", density: "0.79 (互溶)", green: "绿色首选" },
      { name: "甲醇", p: 5.1, bp: "65℃", density: "0.79 (互溶)", green: "易燃有毒" },
      { name: "纯化水", p: 10.2, bp: "100℃", density: "1.00 (基准)", green: "零毒环保" }
    ];

    function parseBpMax(bpStr) {
      var m = String(bpStr || "80").match(/(\d+)(?!.*\d)/);
      return m ? parseInt(m[1], 10) : 80;
    }

    function scoreGreen(greenLabel, name) {
      if (/零毒|环保/.test(greenLabel)) return 98;
      if (/绿色首选/.test(greenLabel)) return 92;
      if (/绿色推荐/.test(greenLabel)) return 86;
      if (/绿色/.test(greenLabel)) return 78;
      if (/易燃低毒/.test(greenLabel)) return 62;
      if (/中等毒性|易燃有毒/.test(greenLabel)) return 42;
      if (/含卤高危/.test(greenLabel)) return 18;
      if (/含卤|神经毒/.test(greenLabel)) return 26;
      if (/酸水|碱水/.test(name)) return 84;
      return 65;
    }

    var mixed = [
      { id: "etoh95", name: "95%乙醇", p: 5.45, bp: "78℃", bpMax: 78, green: "绿色首选", greenScore: 90, isAqueous: false, isFlammable: true, ph: 7, waterFrac: 0.05 },
      { id: "etoh70", name: "70%乙醇", p: 6.70, bp: "81℃", bpMax: 81, green: "绿色首选", greenScore: 93, isAqueous: false, isFlammable: true, ph: 7, waterFrac: 0.30 },
      { id: "etoh50", name: "50%乙醇", p: 7.70, bp: "84℃", bpMax: 84, green: "绿色环保", greenScore: 95, isAqueous: true, isFlammable: true, ph: 7, waterFrac: 0.50 },
      { id: "acid_water", name: "酸水(0.5%H₂SO₄)", p: 10.2, bp: "100℃", bpMax: 100, green: "微酸水相", greenScore: 84, isAqueous: true, isFlammable: false, ph: 2, waterFrac: 0.99 },
      { id: "alkali_water", name: "碱水(Ca(OH)₂/硼砂)", p: 10.2, bp: "100℃", bpMax: 100, green: "微碱水相", greenScore: 82, isAqueous: true, isFlammable: false, ph: 9.2, waterFrac: 0.99 }
    ];

    var pureList = baseTable.map(function (row, idx) {
      var bpMax = parseBpMax(row.bp);
      var isWater = /水/.test(row.name);
      var isHalogen = /氯仿|二氯甲烷/.test(row.name);
      var isNonPolar = row.p <= 2.5;
      return {
        id: "pure_" + idx,
        name: row.name,
        p: Number(row.p),
        bp: row.bp,
        bpMax: bpMax,
        green: row.green,
        greenScore: scoreGreen(row.green, row.name),
        isAqueous: isWater,
        isFlammable: !isWater && !isHalogen,
        isHalogen: isHalogen,
        isNonPolar: isNonPolar,
        ph: 7,
        waterFrac: isWater ? 1.0 : 0.0
      };
    });

    return mixed.concat(pureList);
  }

  function deriveHerbProfile(topic) {
    var text = [topic.herb, topic.compound, topic.category, topic.chemistry, topic.method].join(" ");
    var prof = {
      idealPMin: 5.2, idealPMax: 8.5, optimalP: 6.7, maxSafeTemp: 90,
      volatile: false, enzymeRisk: false, alkaliSensitive: false, alkaliBoost: false,
      acidBoost: false, saponinFoam: false, polysaccharide: false, lipophilic: false,
      extractColor: "#d97706", extractColorName: "琥珀澄清提取液",
      bestRig: "reflux", bestSolventId: "etoh70", bestTemp: 78, bestRatio: 10, bestTime: 60,
      chemNote: "中等极性天然产物，常规 50%~70% 乙醇热回流或超声提取表现稳健。"
    };

    if (/多糖|茯苓|麦冬|枸杞|黄芪多糖/.test(text) && !/黄芪甲苷/.test(text)) {
      prof.idealPMin = 8.4; prof.idealPMax = 10.2; prof.optimalP = 10.2; prof.maxSafeTemp = 102; prof.polysaccharide = true;
      prof.extractColor = "#eab308"; prof.extractColorName = "淡黄微黏多糖液";
      prof.bestRig = "decoction"; prof.bestSolventId = "pure_9"; prof.bestTemp = 95; prof.bestRatio = 12; prof.bestTime = 90;
      prof.chemNote = "强亲水大分子多糖，须热水浸提；高浓度乙醇会导致多糖直接沉淀析出。";
    } else if (/挥发油|薄荷|丁香|细辛|广藿香|当归|艾叶|肉桂|紫苏|陈皮挥发/.test(text)) {
      prof.idealPMin = 0.5; prof.idealPMax = 5.6; prof.optimalP = 3.2; prof.maxSafeTemp = 82; prof.volatile = true; prof.lipophilic = true;
      prof.extractColor = "#10b981"; prof.extractColorName = "清亮芳油馏出液";
      prof.bestRig = "steam"; prof.bestSolventId = "pure_9"; prof.bestTemp = 100; prof.bestRatio = 10; prof.bestTime = 120;
      prof.chemNote = "挥发性芳香成分，宜水蒸气蒸馏共沸提取或超临界 CO₂ 低温萃取；敞口高温易严重挥散。";
    } else if (/丹参酮|邻菲醌|紫草/.test(text)) {
      prof.idealPMin = 2.4; prof.idealPMax = 5.8; prof.optimalP = 5.2; prof.maxSafeTemp = 82; prof.lipophilic = true;
      prof.extractColor = "#dc2626"; prof.extractColorName = "丹红澄清邻菲醌液";
      prof.bestRig = "reflux"; prof.bestSolventId = "etoh95"; prof.bestTemp = 78; prof.bestRatio = 8; prof.bestTime = 60;
      prof.chemNote = "强亲脂邻菲醌，需高浓度乙醇（95%）或乙酸乙酯避光回流；纯水极性过高几乎不溶。";
    } else if (/黄芩|黄芩苷/.test(text)) {
      prof.idealPMin = 6.2; prof.idealPMax = 10.2; prof.optimalP = 10.2; prof.maxSafeTemp = 100; prof.enzymeRisk = true;
      prof.extractColor = "#eab308"; prof.extractColorName = "金黄澄清黄芩苷液";
      prof.bestRig = "decoction"; prof.bestSolventId = "pure_9"; prof.bestTemp = 100; prof.bestRatio = 12; prof.bestTime = 60;
      prof.chemNote = "含内源黄芩酶：35~65℃ 温水浸泡会触发苷键酶解变绿失活，须沸水投药瞬时杀酶或高醇抑制！";
    } else if (/绿原酸|金银花|杜仲|丹酚酸|咖啡酰/.test(text)) {
      prof.idealPMin = 6.2; prof.idealPMax = 10.2; prof.optimalP = 7.7; prof.maxSafeTemp = 58; prof.alkaliSensitive = true;
      prof.extractColor = "#84cc16"; prof.extractColorName = "清透嫩黄酚酸液";
      prof.bestRig = "ultrasonic"; prof.bestSolventId = "etoh50"; prof.bestTemp = 42; prof.bestRatio = 12; prof.bestTime = 40;
      prof.chemNote = "含邻二酚羟基与酯键，极度热敏且怕强碱；宜 40~50℃ 微酸/50%乙醇超声提取防氧化褐变。";
    } else if (/槐米|芦丁|陈皮|橙皮苷/.test(text)) {
      prof.idealPMin = 6.0; prof.idealPMax = 10.2; prof.optimalP = 9.2; prof.maxSafeTemp = 98; prof.alkaliBoost = true;
      prof.extractColor = "#f59e0b"; prof.extractColorName = "亮黄黄酮碱溶液";
      prof.bestRig = "reflux"; prof.bestSolventId = "alkali_water"; prof.bestTemp = 92; prof.bestRatio = 12; prof.bestTime = 45;
      prof.chemNote = "酚羟基黄酮苷，微碱水（硼砂/石灰水 pH 8.5~9.2）可成盐显著增溶，再调酸沉淀精制。";
    } else if (/生物碱|黄连|小檗碱|黄柏|苦参|延胡索|麻黄|防己/.test(text)) {
      prof.idealPMin = 4.6; prof.idealPMax = 10.2; prof.optimalP = 8.8; prof.maxSafeTemp = 90; prof.acidBoost = true;
      prof.extractColor = "#facc15"; prof.extractColorName = "明黄生物碱盐液";
      prof.bestRig = "percolation"; prof.bestSolventId = "acid_water"; prof.bestTemp = 35; prof.bestRatio = 10; prof.bestTime = 90;
      prof.chemNote = "碱性含氮生物碱，酸水（0.5%H₂SO₄）成盐极易溶出；游离碱形态亦可用 70% 乙醇或氯仿萃取。";
    } else if (/皂苷|人参|黄芪|甘草|柴胡|三七|桔梗/.test(text)) {
      prof.idealPMin = 5.8; prof.idealPMax = 9.6; prof.optimalP = 6.7; prof.maxSafeTemp = 88; prof.saponinFoam = true;
      prof.extractColor = "#d97706"; prof.extractColorName = "浅琥珀皂苷醇液";
      prof.bestRig = "reflux"; prof.bestSolventId = "etoh70"; prof.bestTemp = 78; prof.bestRatio = 10; prof.bestTime = 90;
      prof.chemNote = "两亲性皂苷，70% 乙醇回流可避开大量多糖杂质；水提沸腾易产生持久泡沫导致暴沸冲料。";
    } else if (/蒽醌|大黄|虎杖|何首乌/.test(text)) {
      prof.idealPMin = 3.6; prof.idealPMax = 7.4; prof.optimalP = 5.45; prof.maxSafeTemp = 85;
      prof.extractColor = "#ea580c"; prof.extractColorName = "橙红蒽醌提取液";
      prof.bestRig = "reflux"; prof.bestSolventId = "etoh95"; prof.bestTemp = 78; prof.bestRatio = 10; prof.bestTime = 60;
      prof.chemNote = "蒽醌类具酸性酚羟基，醇提可兼顾游离与结合型，后续以 NaHCO₃/Na₂CO₃/NaOH 梯度分离。";
    } else if (/黄酮|槲皮素|银杏|葛根|菊花/.test(text)) {
      prof.idealPMin = 4.8; prof.idealPMax = 8.2; prof.optimalP = 6.7; prof.maxSafeTemp = 85;
      prof.extractColor = "#eab308"; prof.extractColorName = "金黄黄酮澄清液";
      prof.bestRig = "reflux"; prof.bestSolventId = "etoh70"; prof.bestTemp = 75; prof.bestRatio = 10; prof.bestTime = 60;
      prof.chemNote = "典型黄酮类化合物，60%~70% 乙醇回流或超声提取兼具高溶出率与低杂质共溶。";
    }
    return prof;
  }

  function calcYieldAtTime(tMin, polarityScore, rigScore, thermalScore, ratio, temp, cycles, prof, rig) {
    var ratioFactor = Math.min(1.04, 0.58 + 0.46 * (1 - Math.exp(-ratio / 7.5)));
    var kinRate = (0.025 + Math.min(temp, 95) * 0.00055) * rig.kMass;
    var timeFactor = Math.min(1.02, 1 - Math.exp(-kinRate * tMin * (1 + (cycles - 1) * 0.35)));
    // 热敏高温随时间累积降解衰减因子
    var degradeFactor = 1.0;
    if (temp > prof.maxSafeTemp) {
      var over = temp - prof.maxSafeTemp;
      degradeFactor = Math.exp(-0.00028 * over * tMin);
    }
    var raw = 95 * (polarityScore / 100) * (rigScore / 100) * (thermalScore / 100) * ratioFactor * timeFactor * degradeFactor;
    if (prof.volatile) raw *= (1 - rig.volatileLoss * Math.max(0, (temp - 45) / 55));
    return Math.max(1.2, Math.min(97.8, Number(raw.toFixed(1))));
  }

  function evaluateFormula(cfg, topic, solvents) {
    var prof = deriveHerbProfile(topic);
    var solv = solvents.find(function (s) { return s.id === cfg.solventId; }) || solvents[1];
    var rig = APPARATUSES.find(function (r) { return r.id === cfg.rigId; }) || APPARATUSES[0];

    var conflicts = [];
    var byproducts = [];
    var tips = [];
    var phenomenon = { color: prof.extractColor, label: prof.extractColorName, foam: false, boilDanger: false, ultrasonic: rig.id === "ultrasonic", turbid: false };

    // 1. 极性匹配度
    var polarityScore = 100;
    if (rig.id === "steam" && prof.volatile && solv.isAqueous) {
      polarityScore = 96;
    } else if (rig.id === "scfe") {
      if (prof.optimalP <= 5.5) polarityScore = 94;
      else if (prof.optimalP <= 7.5) {
        polarityScore = 62;
        conflicts.push("目标成分极性偏高，超临界 CO₂ 需添加 5%~8% 无水乙醇夹带剂方可有效溶解。");
      } else {
        polarityScore = 18;
        conflicts.push("极性严重失配：超临界 CO₂ 为非极性流体，几乎无法萃取强水溶性多糖/极性苷类。");
      }
    } else {
      var dist = 0;
      if (solv.p < prof.idealPMin) dist = prof.idealPMin - solv.p;
      else if (solv.p > prof.idealPMax) dist = solv.p - prof.idealPMax;
      polarityScore = Math.max(8, Math.round(100 - dist * 17.5));

      if (prof.acidBoost && solv.id === "acid_water") polarityScore = Math.min(100, polarityScore + 14);
      if (prof.alkaliBoost && solv.id === "alkali_water") polarityScore = Math.min(100, polarityScore + 12);
      if (prof.polysaccharide && solv.waterFrac < 0.6) {
        polarityScore = Math.min(polarityScore, 14);
        phenomenon.turbid = true; phenomenon.color = "#cbd5e1"; phenomenon.label = "白色多糖醇沉浑浊";
        conflicts.push("醇沉失配：乙醇/有机相会使多糖发生脱水沉淀，目标多糖收率将跌至极低水平。");
      } else if (dist > 2.2) {
        phenomenon.turbid = true; phenomenon.color = "#a8a29e"; phenomenon.label = "极性失配 · 浅褐未溶";
        conflicts.push("相似相溶严重失配：所选溶剂极性 p=" + solv.p + " 远偏离目标成分理想极性窗（" + prof.idealPMin + "~" + prof.idealPMax + "）。");
      } else if (dist > 0.8) {
        tips.push("溶剂极性（p=" + solv.p + "）略偏离最佳区间，可微调醇水比例进一步拉升选择性。");
      }
    }

    // 2. 热敏 / 沸点 / 酶解 / 酸碱冲突
    var thermalScore = 100;
    var temp = Number(cfg.temp);
    var time = Number(cfg.time);
    var ratio = Number(cfg.ratio);
    var cycles = Number(cfg.cycles || 1);

    if (rig.id !== "scfe" && temp > solv.bpMax + rig.maxSafeBpOver) {
      thermalScore -= 38;
      phenomenon.boilDanger = true;
      conflicts.push("超沸点暴沸/挥散风险：设定温度 " + temp + "℃ 高于 " + solv.name + " 沸点（" + solv.bp + "），易冲料或引发易燃蒸汽爆燃。");
    }

    if (temp > prof.maxSafeTemp) {
      var over = temp - prof.maxSafeTemp;
      thermalScore -= Math.min(55, Math.round(16 + over * 1.35));
      conflicts.push("热敏降解冲突：" + topic.herb.split("（")[0] + " 目标成分耐热上限约 " + prof.maxSafeTemp + "℃，当前 " + temp + "℃ 将导致活性成分热氧化或水解损失。");
    }

    if (prof.enzymeRisk && solv.waterFrac >= 0.5 && temp >= 30 && temp <= 72) {
      thermalScore -= 48;
      phenomenon.color = "#15803d"; phenomenon.turbid = true; phenomenon.label = "墨绿浑浊 · 黄芩酶解变绿!";
      conflicts.push("黄芩酶解陷阱：" + temp + "℃ 温水环境正处黄芩酶最适活性区间，黄芩苷将被迅速酶解为黄芩素并氧化变绿失效！须 ≥95℃ 沸水投药杀酶或改用 ≥70% 乙醇。");
      byproducts.push("黄芩素氧化绿变产物（三羟基黄酮醌式聚合沉淀）");
    }

    if (prof.alkaliSensitive && solv.ph >= 8.5) {
      thermalScore -= 42;
      phenomenon.color = "#5c2d0c"; phenomenon.turbid = true; phenomenon.label = "深棕褐变 · 酚酸氧化!";
      conflicts.push("酸碱化学冲突：绿原酸/酚酸含邻二酚羟基与酯键，碱水（pH " + solv.ph + "）下迅速氧化褐变并发生酯键水解。");
      byproducts.push("酚酸醌式氧化深褐色聚合物 + 咖啡酸/奎宁酸水解碎片");
    }

    if (prof.volatile && rig.id === "decoction" && temp >= 75) {
      thermalScore -= 36;
      conflicts.push("挥发油逃逸风险：常压敞口煎煮 " + temp + "℃ 会使大量芳香挥发油随水蒸气逸散，应换用水蒸气蒸馏器或密闭低温提取。");
    }

    thermalScore = Math.max(8, Math.min(100, thermalScore));

    // 3. 装置适用性
    var rigScore = 96;
    if (rig.id === "steam" && (!prof.volatile || !solv.isAqueous)) {
      rigScore = 18;
      conflicts.push("装置不适用：水蒸气蒸馏器仅适用于「纯化水 + 挥发油」体系，非挥发性成分无法随水蒸气馏出。");
    }
    if (rig.id === "decoction" && solv.isFlammable) {
      rigScore = 12; phenomenon.boilDanger = true;
      conflicts.push("严重安全禁令：常压煎煮锅无密闭冷凝系统，严禁加热易燃有机溶剂（" + solv.name + "）！");
    }
    if (rig.id === "microwave" && solv.isNonPolar) {
      rigScore = 22;
      conflicts.push("微波介质不匹配：" + solv.name + " 为非极性低介电常数溶剂，几乎不吸收微波能量，无法有效升温。");
    }
    if (rig.id === "ultrasonic" && temp > 70) {
      rigScore -= 28;
      conflicts.push("超声空化衰减：温度超过 70℃ 后溶剂蒸汽压过高，空化泡缓冲效应增强，超声破壁效率大幅下降。");
    }
    if (rig.id === "percolation" && temp > 45) {
      rigScore -= 30;
      conflicts.push("装置温域冲突：渗漉柱为常温浸出装置（宜 20~40℃），不适合 " + temp + "℃ 高温加热操作。");
    }
    if (rig.id === "soxhlet" && solv.isAqueous) {
      rigScore -= 26;
      tips.push("纯水沸点高、汽化潜热大，在索氏提取器中虹吸循环缓慢且能耗高，建议改用乙醇或常规回流。");
    }
    if (rig.id === "scfe" && (temp < 31 || temp > 65)) {
      rigScore -= 34;
      conflicts.push("超临界态偏离：CO₂ 临界温度为 31.1℃，萃取釜温控须保持在 32~60℃ 以维持超临界流体密度与溶解力。");
    }
    rigScore = Math.max(10, Math.min(100, rigScore));

    // 4. 副产物与 MSDS 废液
    if (solv.waterFrac >= 0.7 && temp >= 80 && !prof.polysaccharide) {
      byproducts.push("高温水相导致淀粉糊化、果胶与粘液质大量溶出，抽滤易堵滤膜。");
    }
    if (solv.p <= 5.5 && !solv.isAqueous) {
      byproducts.push("低中极性有机相会共溶叶绿素、油脂及植物蜡质，浓缩后需脱脂或石油醚萃取除杂。");
    }
    if (prof.saponinFoam && solv.waterFrac >= 0.5 && temp >= 85) {
      phenomenon.foam = true;
      byproducts.push("皂苷水溶液高温沸腾产生大量持久泡沫，建议降低装液量或改用 70% 乙醇回流消泡。");
    }
    if (time > 150 && temp >= 80) {
      byproducts.push("长时间高温提取易引起糖类焦糖化与热敏色素深染，增加后续脱色纯化负担。");
    }
    if (byproducts.length === 0) {
      byproducts.push("当前极性与温域选择性良好，非目标大分子与脂蜡共溶处于受控水平。");
    }

    var msdsList = (window.TCM_V3_DATA && window.TCM_V3_DATA.REAGENT_MSDS_DB) || [];
    var msdsHit = msdsList.find(function (m) { return m.match && m.match.test(solv.name); });
    var wasteTip = msdsHit ? (msdsHit.waste + "（" + msdsHit.ppe + "）") : (solv.isAqueous ? "合规中和后排入实验室废水系统" : "分类收集至有机废液桶");

    // 5. 提取率与动力学曲线采样（10~240 min）
    var estYield = calcYieldAtTime(time, polarityScore, rigScore, thermalScore, ratio, temp, cycles, prof, rig);
    var curvePoints = [];
    for (var tm = 10; tm <= 240; tm += 15) {
      curvePoints.push({ t: tm, y: calcYieldAtTime(tm, polarityScore, rigScore, thermalScore, ratio, temp, cycles, prof, rig) });
    }

    // 6. 绿色工艺评分
    var solventGreen = rig.id === "scfe" ? 97 : solv.greenScore;
    var ratioPenalty = Math.max(0, (ratio - 12) * 1.4);
    var energyPenalty = Math.max(0, ((temp - 40) * 0.14 + (time / 120) * 6) * rig.energyFactor * (1 + (cycles - 1) * 0.25));
    var greenScore = Math.max(10, Math.min(99, Math.round(solventGreen - ratioPenalty - energyPenalty)));
    var greenGrade = greenScore >= 88 ? "S" : greenScore >= 76 ? "A" : greenScore >= 62 ? "B" : greenScore >= 45 ? "C" : "D";

    if (solv.isHalogen) {
      conflicts.push("环保与职业健康警示：" + solv.name + " 属含卤有毒溶剂，建议优先改用乙酸乙酯或乙醇绿色替代体系。");
    }

    var overallScore = Math.round(polarityScore * 0.36 + thermalScore * 0.32 + rigScore * 0.32);
    var verdict = { level: "great", icon: "🟢", title: "工艺优选 · 高度可行", summary: "极性窗口、温控安全与装置传质高度匹配，可直接用于规范实验或放大验证。" };
    if (overallScore < 45 || rigScore < 30 || polarityScore < 30) {
      verdict = { level: "fail", icon: "🔴", title: "严重失配 · 实验易翻车", summary: "存在核心极性/安全/装置冲突，预计目标成分收率极低或触发安全风险，请按下方诊断修正。" };
    } else if (overallScore < 70 || conflicts.length >= 2) {
      verdict = { level: "warn", icon: "🟠", title: "存在隐患 · 建议调优", summary: "配方可勉强运行，但存在热损、酶解或溶剂环保短板，建议点击「一键智能优化」对照提升。" };
    } else if (overallScore < 85 || conflicts.length === 1) {
      verdict = { level: "ok", icon: "🟡", title: "基本可行 · 有提升空间", summary: "主路线成立，微调料液比、温度或溶剂比例可进一步提高收率与绿色评分。" };
    }

    return {
      prof: prof, solv: solv, rig: rig,
      polarityScore: polarityScore, thermalScore: thermalScore, rigScore: rigScore, overallScore: overallScore,
      estYield: estYield, curvePoints: curvePoints, phenomenon: phenomenon,
      greenScore: greenScore, greenGrade: greenGrade,
      verdict: verdict, conflicts: conflicts, byproducts: byproducts, tips: tips, wasteTip: wasteTip
    };
  }

  var PLAY_PRESETS = [
    { id: "green_lonicera", label: "🌿 绿色优选 · 金银花低温超声", matchHerb: /金银花/, solventId: "etoh50", rigId: "ultrasonic", ratio: 12, temp: 42, time: 40, cycles: 2 },
    { id: "polar_fail", label: "⚠️ 极性失配 · 纯水提丹参酮", matchHerb: /丹参/, solventId: "pure_9", rigId: "reflux", ratio: 10, temp: 95, time: 60, cycles: 1 },
    { id: "enzyme_trap", label: "🧪 酶解陷阱 · 50℃温水泡黄芩", matchHerb: /黄芩/, solventId: "pure_9", rigId: "decoction", ratio: 10, temp: 50, time: 60, cycles: 1 },
    { id: "alkali_fail", label: "🔥 热敏翻车 · 高温碱水提绿原酸", matchHerb: /金银花/, solventId: "alkali_water", rigId: "reflux", ratio: 14, temp: 95, time: 90, cycles: 2 }
  ];

  var state = {
    topicId: "",
    herbQuery: "",
    solventId: "etoh70",
    rigId: "reflux",
    ratio: 10,
    temp: 78,
    time: 60,
    cycles: 2,
    savedPlans: []
  };

  function getTopics() {
    if (window.TCM_LAB_API && typeof window.TCM_LAB_API.getAllTopics === "function") {
      var list = window.TCM_LAB_API.getAllTopics();
      if (list && list.length) return list;
    }
    return [
      { id: "demo_jinyinhua", herb: "金银花（绿原酸低温超声提取）", compound: "绿原酸", category: "苯丙素" },
      { id: "demo_danshen", herb: "丹参（丹参酮IIA回流提取）", compound: "丹参酮IIA", category: "醌类" },
      { id: "demo_huangqin", herb: "黄芩（黄芩苷沸水杀酶保苷）", compound: "黄芩苷", category: "黄酮" },
      { id: "demo_bohe", herb: "薄荷（挥发油与薄荷脑提取）", compound: "薄荷脑", category: "挥发油" },
      { id: "demo_huanglian", herb: "黄连（盐酸小檗碱提取精制）", compound: "小檗碱", category: "生物碱" },
      { id: "demo_huaimi", herb: "槐米（芦丁提取与酸水解制槲皮素）", compound: "芦丁 / 槲皮素", category: "黄酮" }
    ];
  }

  function resolveCurrentTopic(topics) {
    if (state.topicId) {
      var found = topics.find(function (t) { return t.id === state.topicId; });
      if (found) return found;
    }
    state.topicId = topics[0].id;
    return topics[0];
  }

  function barColor(score) {
    if (score >= 82) return "#10b981";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  }

  function buildFlaskSvg(res) {
    var ph = res.phenomenon;
    var bubbles = ph.boilDanger
      ? '<circle cx="38" cy="64" r="3.5" fill="#fff" opacity="0.85"/><circle cx="50" cy="58" r="2.8" fill="#fff" opacity="0.8"/><circle cx="44" cy="48" r="3" fill="#fecaca" opacity="0.9"/>'
      : '<circle cx="40" cy="66" r="1.8" fill="#fff" opacity="0.55"/><circle cx="52" cy="60" r="1.5" fill="#fff" opacity="0.45"/>';
    var foam = ph.foam
      ? '<ellipse cx="45" cy="48" rx="18" ry="5" fill="#fef3c7" opacity="0.9"/><circle cx="36" cy="46" r="4" fill="#fffbeb"/><circle cx="46" cy="44" r="5" fill="#fffbeb"/><circle cx="54" cy="47" r="3.5" fill="#fffbeb"/>'
      : "";
    var sonic = ph.ultrasonic
      ? '<path d="M16 58 Q10 64 16 70" stroke="#0ea5e9" stroke-width="1.6" fill="none" opacity="0.75"/><path d="M74 58 Q80 64 74 70" stroke="#0ea5e9" stroke-width="1.6" fill="none" opacity="0.75"/>'
      : "";
    return (
      '<svg viewBox="0 0 90 92" width="76" height="78" aria-label="实时提取液现象预览">' +
        sonic +
        '<path d="M36 10 L36 32 L18 68 C15 74 19 82 27 82 L63 82 C71 82 75 74 72 68 L54 32 L54 10 Z" fill="rgba(226,232,240,0.22)" stroke="' + (ph.boilDanger ? "#ef4444" : "#64748b") + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<path d="M27 50 L63 50 L71 67 C73 72 70 79 63 79 L27 79 C20 79 17 72 19 67 Z" fill="' + ph.color + '" opacity="' + (ph.turbid ? "0.92" : "0.78") + '"/>' +
        foam + bubbles +
        '<line x1="33" y1="10" x2="57" y2="10" stroke="#475569" stroke-width="2.5" stroke-linecap="round"/>' +
      "</svg>"
    );
  }

  function buildKineticCurveSvg(res) {
    var w = 310, h = 68, padL = 22, padR = 10, padT = 8, padB = 14;
    var plotW = w - padL - padR, plotH = h - padT - padB;
    var pts = res.curvePoints.map(function (pt) {
      var x = padL + ((pt.t - 10) / 230) * plotW;
      var y = padT + (1 - pt.y / 100) * plotH;
      return x.toFixed(1) + "," + y.toFixed(1);
    }).join(" ");
    var curX = padL + ((state.time - 10) / 230) * plotW;
    var curY = padT + (1 - res.estYield / 100) * plotH;
    var stroke = barColor(res.estYield);
    return (
      '<svg viewBox="0 0 ' + w + " " + h + '" style="width:100%;height:68px;display:block;">' +
        '<line x1="' + padL + '" y1="' + (h - padB) + '" x2="' + (w - padR) + '" y2="' + (h - padB) + '" stroke="rgba(100,116,139,0.28)" stroke-width="1"/>' +
        '<line x1="' + padL + '" y1="' + padT + '" x2="' + padL + '" y2="' + (h - padB) + '" stroke="rgba(100,116,139,0.28)" stroke-width="1"/>' +
        '<polyline fill="none" stroke="' + stroke + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" points="' + pts + '"/>' +
        '<circle cx="' + curX.toFixed(1) + '" cy="' + curY.toFixed(1) + '" r="4.2" fill="' + stroke + '" stroke="#fff" stroke-width="1.6"/>' +
        '<text x="' + padL + '" y="' + (h - 2) + '" font-size="9" fill="#64748b">10m</text>' +
        '<text x="' + (w - 32) + '" y="' + (h - 2) + '" font-size="9" fill="#64748b">240m</text>' +
        '<text x="2" y="14" font-size="9" fill="#64748b">100%</text>' +
      "</svg>"
    );
  }

  function buildEngineHtml(topic, res) {
    var winLeft = Math.max(0, Math.min(100, (res.prof.idealPMin / 10.2) * 100)).toFixed(1);
    var winWidth = Math.max(6, Math.min(100 - Number(winLeft), ((res.prof.idealPMax - res.prof.idealPMin) / 10.2) * 100)).toFixed(1);
    var pinLeft = Math.max(1, Math.min(99, (res.solv.p / 10.2) * 100)).toFixed(1);

    // 找出对比槽中的最优方案索引
    var bestPlanIdx = -1;
    var bestScore = -1;
    state.savedPlans.forEach(function (sp, idx) {
      var composite = sp.estYield * 0.6 + sp.greenScore * 0.4;
      if (composite > bestScore) { bestScore = composite; bestPlanIdx = idx; }
    });

    return (
      '<h3 class="v25-sec-title"><span>2. 实时可行性引擎与工艺预估</span><span style="font-size:11.5px;color:#64748b;">随参数毫秒级更新</span></h3>' +

      // 实时可视化遥测条：提取液现象瓶 + 极性光谱匹配尺 + 动力学曲线
      '<div class="v25-visual-strip">' +
        '<div class="v25-flask-box">' +
          buildFlaskSvg(res) +
          '<div class="v25-flask-caption">' + esc(res.phenomenon.label) + "</div>" +
        "</div>" +
        '<div class="v25-telemetry-col">' +
          '<div class="v25-ruler-wrap">' +
            '<div class="v25-field-label" style="margin:0;font-size:11.5px;"><span>极性光谱匹配尺（绿框 = 目标极性窗 ' + res.prof.idealPMin + "~" + res.prof.idealPMax + '）</span><span class="v25-val-pill">当前溶剂 p=' + res.solv.p + "</span></div>" +
            '<div class="v25-ruler-track">' +
              '<div class="v25-ruler-window" style="left:' + winLeft + "%;width:" + winWidth + '%;"></div>' +
              '<div class="v25-ruler-pin" style="left:' + pinLeft + '%;" title="当前溶剂极性 p=' + res.solv.p + '"></div>' +
            "</div>" +
            '<div class="v25-ruler-scale"><span>0.1 石油醚(非极性)</span><span>5.2 乙醇</span><span>10.2 纯化水(强极性)</span></div>' +
          "</div>" +
          '<div class="v25-curve-box">' +
            '<div class="v25-field-label" style="margin:0 0 2px;font-size:11px;"><span>提取动力学曲线（收率 vs 时间 · 当前 ' + state.time + ' min）</span><span style="color:' + barColor(res.estYield) + ';">' + (state.temp > res.prof.maxSafeTemp ? "⚠ 高温长时热降解" : "稳态溶出") + "</span></div>" +
            buildKineticCurveSvg(res) +
          "</div>" +
        "</div>" +
      "</div>" +

      '<div class="v25-kpi-row">' +
        '<div class="v25-kpi-tile">' +
          '<span class="v25-kpi-label">目标成分提取率预估</span>' +
          '<span class="v25-kpi-num" style="color:' + barColor(res.estYield) + ';">' + res.estYield + '%</span>' +
          '<span class="v25-kpi-sub">' + esc(topic.compound ? topic.compound.slice(0, 14) : "目标成分") + "</span>" +
        "</div>" +
        '<div class="v25-kpi-tile">' +
          '<span class="v25-kpi-label">绿色工艺评分</span>' +
          '<span class="v25-kpi-num" style="color:' + barColor(res.greenScore) + ';">' + res.greenScore + ' <small style="font-size:15px;">(' + res.greenGrade + '级)</small></span>' +
          '<span class="v25-kpi-sub">溶剂：' + esc(res.solv.green) + "</span>" +
        "</div>" +
        '<div class="v25-kpi-tile">' +
          '<span class="v25-kpi-label">综合可行性指数</span>' +
          '<span class="v25-kpi-num" style="color:' + barColor(res.overallScore) + ';">' + res.overallScore + '</span>' +
          '<span class="v25-kpi-sub">' + res.conflicts.length + " 项冲突预警</span>" +
        "</div>" +
      "</div>" +

      '<div class="v25-verdict-banner lv-' + res.verdict.level + '">' +
        '<div>' +
          '<div style="font-size:14px;font-weight:900;">' + res.verdict.icon + " " + esc(res.verdict.title) + "</div>" +
          '<div style="font-size:12px;margin-top:3px;opacity:0.92;">' + esc(res.verdict.summary) + "</div>" +
        "</div>" +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
          (window.TCM_V26_FAILURE_BRANCHES && window.TCM_V26_FAILURE_BRANCHES.matchFromSandbox(res)
            ? '<button type="button" class="v25-btn-ghost" id="v25BtnOpenFailure" style="border-color:rgba(225,29,72,0.45);color:#be123c;">🚨 事故复盘卡</button>'
            : '') +
          '<button type="button" class="v25-btn-primary" id="v25BtnAutoOpt">✨ 一键智能优化</button>' +
        '</div>' +
      "</div>" +

      '<div class="v25-bars">' +
        '<div class="v25-bar-item"><div class="v25-field-label" style="margin:0;"><span>极性匹配度</span><span>' + res.polarityScore + '/100</span></div><div class="v25-bar-track"><div class="v25-bar-fill" style="width:' + res.polarityScore + '%;background:' + barColor(res.polarityScore) + ';"></div></div></div>' +
        '<div class="v25-bar-item"><div class="v25-field-label" style="margin:0;"><span>热敏与化学稳定性</span><span>' + res.thermalScore + '/100</span></div><div class="v25-bar-track"><div class="v25-bar-fill" style="width:' + res.thermalScore + '%;background:' + barColor(res.thermalScore) + ';"></div></div></div>' +
        '<div class="v25-bar-item"><div class="v25-field-label" style="margin:0;"><span>装置适用性</span><span>' + res.rigScore + '/100</span></div><div class="v25-bar-track"><div class="v25-bar-fill" style="width:' + res.rigScore + '%;background:' + barColor(res.rigScore) + ';"></div></div></div>' +
        '<div class="v25-bar-item"><div class="v25-field-label" style="margin:0;"><span>绿色环保指数</span><span>' + res.greenScore + '/100</span></div><div class="v25-bar-track"><div class="v25-bar-fill" style="width:' + res.greenScore + '%;background:' + barColor(res.greenScore) + ';"></div></div></div>' +
      "</div>" +

      '<div class="v25-diag-grid">' +
        '<div class="v25-diag-box">' +
          '<h4>🔍 可行性冲突与化学诊断</h4>' +
          '<ul class="v25-diag-list">' +
            (res.conflicts.length
              ? res.conflicts.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("")
              : "<li>未检出极性、热敏、酶解或装置硬冲突，工艺路线稳健。</li>") +
            res.tips.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") +
          "</ul>" +
        "</div>" +
        '<div class="v25-diag-box">' +
          '<h4>🧪 副产物共溶与 MSDS 废液提示</h4>' +
          '<ul class="v25-diag-list">' +
            res.byproducts.map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("") +
            "<li><strong>废液去向：</strong>" + esc(res.wasteTip) + "</li>" +
          "</ul>" +
        "</div>" +
      "</div>" +

      '<div class="v25-action-bar">' +
        '<button type="button" class="v25-btn-primary" id="v25BtnSavePlan">📌 存入对比槽（' + state.savedPlans.length + '/4）</button>' +
        '<button type="button" class="v25-btn-ghost" id="v25BtnImportWf">🚀 一键导入六步工坊</button>' +
        '<button type="button" class="v25-btn-ghost" id="v25BtnCopyRecipe">📋 复制配方摘要</button>' +
        (state.savedPlans.length ? '<button type="button" class="v25-btn-ghost" id="v25BtnClearPlans">清空对比槽</button>' : "") +
      "</div>" +

      (state.savedPlans.length
        ? '<div style="margin-top:12px;overflow-x:auto;">' +
            '<table class="v25-compare-table">' +
              '<thead><tr><th>方案</th><th>药材</th><th>溶剂 / 装置</th><th>料液比·温·时</th><th>预估收率</th><th>绿色分</th><th>操作</th></tr></thead>' +
              "<tbody>" +
                state.savedPlans.map(function (sp, idx) {
                  var isBest = idx === bestPlanIdx && state.savedPlans.length > 1;
                  return (
                    '<tr class="' + (isBest ? "is-best" : "") + '">' +
                      "<td><strong>#" + (idx + 1) + (isBest ? " 🏆" : "") + "</strong></td>" +
                      "<td>" + esc(sp.herbShort) + "</td>" +
                      "<td>" + esc(sp.solventName) + " · " + esc(sp.rigName) + "</td>" +
                      "<td>1:" + sp.ratio + " · " + sp.temp + "℃ · " + sp.time + "m</td>" +
                      '<td><strong style="color:' + barColor(sp.estYield) + ';">' + sp.estYield + "%</strong></td>" +
                      "<td><strong>" + sp.greenScore + " (" + sp.greenGrade + ")</strong></td>" +
                      '<td><button type="button" class="v25-reload-btn" data-v25-reload="' + idx + '">回填</button></td>' +
                    "</tr>"
                  );
                }).join("") +
              "</tbody>" +
            "</table>" +
          "</div>"
        : "")
    );
  }

  function bindEngineActions(container, topic, res) {
    var failReviewBtn = container.querySelector("#v25BtnOpenFailure");
    if (failReviewBtn && window.TCM_V26_FAILURE_BRANCHES) {
      failReviewBtn.addEventListener("click", function () {
        var fid = window.TCM_V26_FAILURE_BRANCHES.matchFromSandbox(res);
        if (fid) window.TCM_V26_FAILURE_BRANCHES.openReview(fid);
      });
    }

    var optBtn = container.querySelector("#v25BtnAutoOpt");
    if (optBtn) {
      optBtn.addEventListener("click", function () {
        state.solventId = res.prof.bestSolventId;
        state.rigId = res.prof.bestRig;
        state.temp = res.prof.bestTemp;
        state.ratio = res.prof.bestRatio;
        state.time = res.prof.bestTime;
        state.cycles = 2;
        renderInto(container);
      });
    }

    var saveBtn = container.querySelector("#v25BtnSavePlan");
    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        if (state.savedPlans.length >= 4) state.savedPlans.shift();
        state.savedPlans.push({
          topicId: topic.id,
          solventId: state.solventId,
          rigId: state.rigId,
          cycles: state.cycles,
          herbShort: topic.herb.split("（")[0],
          solventName: res.solv.name,
          rigName: res.rig.name,
          ratio: state.ratio,
          temp: state.temp,
          time: state.time,
          estYield: res.estYield,
          greenScore: res.greenScore,
          greenGrade: res.greenGrade
        });
        updateEngineOnly(container);
      });
    }

    var clearBtn = container.querySelector("#v25BtnClearPlans");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        state.savedPlans = [];
        updateEngineOnly(container);
      });
    }

    container.querySelectorAll("[data-v25-reload]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = Number(this.getAttribute("data-v25-reload"));
        var sp = state.savedPlans[idx];
        if (!sp) return;
        state.topicId = sp.topicId;
        state.solventId = sp.solventId;
        state.rigId = sp.rigId;
        state.ratio = sp.ratio;
        state.temp = sp.temp;
        state.time = sp.time;
        state.cycles = sp.cycles || 2;
        renderInto(container);
      });
    });

    var copyBtn = container.querySelector("#v25BtnCopyRecipe");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var summary = [
          "【本草智研 · 自由配方沙盒评估】",
          "药材：" + topic.herb + "（目标成分：" + (topic.compound || "-") + "）",
          "配方：" + res.solv.name + " (p=" + res.solv.p + ") | " + res.rig.name + " | 料液比 1:" + state.ratio + " | " + state.temp + "℃ × " + state.time + "min × " + state.cycles + "次",
          "结果：预估提取率 " + res.estYield + "% | 绿色评分 " + res.greenScore + " (" + res.greenGrade + "级) | 综合可行性 " + res.overallScore + "（" + res.verdict.title + "）",
          "冲突诊断：" + (res.conflicts.length ? res.conflicts.join("；") : "无硬冲突")
        ].join("\n");
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(summary).catch(function () {});
        }
        if (window.TCM_LAB_API && typeof window.TCM_LAB_API.showToast === "function") {
          window.TCM_LAB_API.showToast("已复制自由配方评估摘要到剪贴板！");
        } else {
          copyBtn.textContent = "✅ 已复制摘要";
          setTimeout(function () { copyBtn.textContent = "📋 复制配方摘要"; }, 1800);
        }
      });
    }

    var impBtn = container.querySelector("#v25BtnImportWf");
    if (impBtn) {
      impBtn.addEventListener("click", function () {
        var api = window.TCM_LAB_API;
        if (api && typeof api.selectTopic === "function") api.selectTopic(topic.id);
        if (window.TCM_V16_PORTAL && typeof window.TCM_V16_PORTAL.go === "function") {
          window.TCM_V16_PORTAL.go("workflow", 2);
        }
        setTimeout(function () {
          var setVal = function (id, val) {
            var el = document.getElementById(id);
            if (!el) return;
            el.value = String(val);
            el.dispatchEvent(new Event("input", { bubbles: true }));
            el.dispatchEvent(new Event("change", { bubbles: true }));
          };
          setVal("cfgRatio", state.ratio);
          setVal("cfgTemp", state.temp);
          setVal("cfgTime", state.time);
          setVal("cfgCycles", state.cycles);
          if (api && typeof api.showToast === "function") {
            api.showToast("已将自由配方参数（" + topic.herb.split("（")[0] + " · " + res.solv.name + "）导入六步工坊！");
          }
        }, 120);
      });
    }
  }

  // 局部无刷新更新右侧引擎面板（滑块拖拽时保持 60fps 且绝不丢失滑块焦点）
  function updateEngineOnly(container) {
    var topics = getTopics();
    var solvents = buildSolventSystems();
    var topic = resolveCurrentTopic(topics);
    var res = evaluateFormula(state, topic, solvents);
    var pane = container.querySelector("#v25EnginePane");
    if (!pane) return;
    pane.innerHTML = buildEngineHtml(topic, res);
    bindEngineActions(container, topic, res);
  }

  function renderInto(container) {
    if (!container) return;
    var topics = getTopics();
    var solvents = buildSolventSystems();
    var topic = resolveCurrentTopic(topics);
    var res = evaluateFormula(state, topic, solvents);

    var filteredTopics = state.herbQuery.trim()
      ? topics.filter(function (t) {
          var q = state.herbQuery.trim().toLowerCase();
          return (t.herb + " " + (t.compound || "") + " " + (t.category || "")).toLowerCase().indexOf(q) >= 0;
        })
      : topics;
    if (filteredTopics.length === 0) filteredTopics = topics;

    var comboCount = (topics.length * solvents.length * APPARATUSES.length).toLocaleString("zh-CN");

    var html =
      '<div class="v25-sandbox-shell">' +
        '<div class="v25-preset-bar">' +
          '<div class="v25-preset-chips">' +
            '<span style="font-size:12px;font-weight:800;color:#64748b;">一键试玩：</span>' +
            PLAY_PRESETS.map(function (p) {
              return '<button type="button" class="v25-preset-btn" data-v25-preset="' + p.id + '">' + esc(p.label) + "</button>";
            }).join("") +
            '<button type="button" class="v25-preset-btn is-random" id="v25BtnRandom">🎲 随机挑战配方</button>' +
          "</div>" +
          '<span class="v25-space-badge">组合空间 ' + comboCount + '+ 种（' + topics.length + ' 药材 × ' + solvents.length + ' 溶剂 × ' + APPARATUSES.length + ' 装置）</span>' +
        "</div>" +

        '<div class="v25-main-grid">' +
          '<div class="v25-card">' +
            '<h3 class="v25-sec-title"><span>1. 自由组合配方参数</span><span style="font-size:11.5px;font-weight:700;color:#0f766e;">实时 0-Token 物理化学演算</span></h3>' +

            '<div class="v25-field">' +
              '<div class="v25-field-label"><span>目标药材（全库 ' + topics.length + ' 项可选）</span><span class="v25-val-pill">' + esc(topic.category || "中药化学") + "</span></div>" +
              '<div style="display:grid;grid-template-columns:140px 1fr;gap:8px;">' +
                '<input type="text" class="v25-input" id="v25HerbFilter" placeholder="筛药材/成分..." value="' + esc(state.herbQuery) + '" />' +
                '<select class="v25-select" id="v25HerbSelect">' +
                  filteredTopics.map(function (t) {
                    return '<option value="' + esc(t.id) + '"' + (t.id === topic.id ? " selected" : "") + ">" + esc(t.herb) + "</option>";
                  }).join("") +
                "</select>" +
              "</div>" +
              '<div class="v25-herb-meta-box">' +
                '<strong>🎯 目标成分：</strong>' + (window.TCM_MOL3D_REGISTRY ? window.TCM_MOL3D_REGISTRY.linkifyHtml(esc(topic.compound || "核心有效成分")) : esc(topic.compound || "核心有效成分")) +
                ' &nbsp;|&nbsp; <strong>理想极性窗：</strong>p = ' + res.prof.idealPMin + "~" + res.prof.idealPMax +
                ' &nbsp;|&nbsp; <strong>耐热上限：</strong>' + res.prof.maxSafeTemp + "℃<br/>" +
                '<span>' + esc(res.prof.chemNote) + "</span>" +
              "</div>" +
            "</div>" +

            '<div class="v25-field">' +
              '<div class="v25-field-label"><span>溶剂体系（调用真实极性表 p = 0.1~10.2）</span><span class="v25-val-pill">当前 p=' + res.solv.p + " · 沸点 " + esc(res.solv.bp) + "</span></div>" +
              '<div class="v25-solvent-pills">' +
                solvents.map(function (s) {
                  return (
                    '<button type="button" class="v25-opt-chip' + (s.id === state.solventId ? " is-active" : "") + '" data-v25-solvent="' + s.id + '">' +
                      '<span class="v25-opt-name">' + esc(s.name) + "</span>" +
                      '<span class="v25-opt-sub">p=' + s.p + " · " + esc(s.green) + "</span>" +
                    "</button>"
                  );
                }).join("") +
              "</div>" +
            "</div>" +

            '<div class="v25-field">' +
              '<div class="v25-field-label"><span>提取装置选择</span><span class="v25-val-pill">' + esc(res.rig.tag) + "</span></div>" +
              '<div class="v25-rig-grid">' +
                APPARATUSES.map(function (r) {
                  return (
                    '<button type="button" class="v25-opt-chip' + (r.id === state.rigId ? " is-active" : "") + '" data-v25-rig="' + r.id + '">' +
                      '<span class="v25-opt-name">' + esc(r.name) + "</span>" +
                      '<span class="v25-opt-sub">' + esc(r.tag) + "</span>" +
                    "</button>"
                  );
                }).join("") +
              "</div>" +
            "</div>" +

            '<div class="v25-slider-grid">' +
              '<div class="v25-slider-box">' +
                '<div class="v25-field-label" style="margin-bottom:2px;"><span>料液比 (g:mL)</span><span class="v25-val-pill" id="v25RatioLbl">1 : ' + state.ratio + "</span></div>" +
                '<input type="range" id="v25Ratio" min="4" max="30" step="1" value="' + state.ratio + '" />' +
              "</div>" +
              '<div class="v25-slider-box">' +
                '<div class="v25-field-label" style="margin-bottom:2px;"><span>提取温度</span><span class="v25-val-pill" id="v25TempLbl">' + state.temp + " ℃</span></div>" +
                '<input type="range" id="v25Temp" min="20" max="120" step="1" value="' + state.temp + '" />' +
              "</div>" +
              '<div class="v25-slider-box">' +
                '<div class="v25-field-label" style="margin-bottom:2px;"><span>单次提取时间</span><span class="v25-val-pill" id="v25TimeLbl">' + state.time + " min</span></div>" +
                '<input type="range" id="v25Time" min="10" max="240" step="5" value="' + state.time + '" />' +
              "</div>" +
              '<div class="v25-slider-box">' +
                '<div class="v25-field-label" style="margin-bottom:2px;"><span>提取次数</span><span class="v25-val-pill" id="v25CyclesLbl">' + state.cycles + " 次</span></div>" +
                '<input type="range" id="v25Cycles" min="1" max="3" step="1" value="' + state.cycles + '" />' +
              "</div>" +
            "</div>" +
          "</div>" +

          '<div class="v25-card" id="v25EnginePane">' +
            buildEngineHtml(topic, res) +
          "</div>" +
        "</div>" +
      "</div>";

    container.innerHTML = html;

    var filterInp = container.querySelector("#v25HerbFilter");
    if (filterInp) {
      filterInp.addEventListener("input", function () {
        state.herbQuery = this.value;
        var pos = this.selectionStart;
        renderInto(container);
        var nextInp = container.querySelector("#v25HerbFilter");
        if (nextInp) { nextInp.focus(); try { nextInp.setSelectionRange(pos, pos); } catch (_) {} }
      });
    }
    var herbSel = container.querySelector("#v25HerbSelect");
    if (herbSel) {
      herbSel.addEventListener("change", function () {
        state.topicId = this.value;
        renderInto(container);
      });
    }
    container.querySelectorAll("[data-v25-solvent]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.solventId = this.getAttribute("data-v25-solvent");
        renderInto(container);
      });
    });
    container.querySelectorAll("[data-v25-rig]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.rigId = this.getAttribute("data-v25-rig");
        renderInto(container);
      });
    });

    // 局部无刷新滑块联动（绝不重绘左侧滑块 DOM）
    [
      { id: "#v25Ratio", lbl: "#v25RatioLbl", key: "ratio", fmt: function (v) { return "1 : " + v; } },
      { id: "#v25Temp", lbl: "#v25TempLbl", key: "temp", fmt: function (v) { return v + " ℃"; } },
      { id: "#v25Time", lbl: "#v25TimeLbl", key: "time", fmt: function (v) { return v + " min"; } },
      { id: "#v25Cycles", lbl: "#v25CyclesLbl", key: "cycles", fmt: function (v) { return v + " 次"; } }
    ].forEach(function (item) {
      var el = container.querySelector(item.id);
      if (el) {
        el.addEventListener("input", function () {
          state[item.key] = Number(this.value);
          var lblEl = container.querySelector(item.lbl);
          if (lblEl) lblEl.textContent = item.fmt(state[item.key]);
          updateEngineOnly(container);
        });
      }
    });

    container.querySelectorAll("[data-v25-preset]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var pid = this.getAttribute("data-v25-preset");
        var p = PLAY_PRESETS.find(function (x) { return x.id === pid; });
        if (!p) return;
        var matched = topics.find(function (t) { return p.matchHerb.test(t.herb); }) || topics[0];
        state.topicId = matched.id;
        state.herbQuery = "";
        state.solventId = p.solventId;
        state.rigId = p.rigId;
        state.ratio = p.ratio;
        state.temp = p.temp;
        state.time = p.time;
        state.cycles = p.cycles;
        renderInto(container);
      });
    });

    var rndBtn = container.querySelector("#v25BtnRandom");
    if (rndBtn) {
      rndBtn.addEventListener("click", function () {
        var rt = topics[Math.floor(Math.random() * topics.length)];
        var rs = solvents[Math.floor(Math.random() * solvents.length)];
        var rr = APPARATUSES[Math.floor(Math.random() * APPARATUSES.length)];
        state.topicId = rt.id;
        state.herbQuery = "";
        state.solventId = rs.id;
        state.rigId = rr.id;
        state.ratio = 6 + Math.floor(Math.random() * 14);
        state.temp = 30 + Math.floor(Math.random() * 75);
        state.time = (3 + Math.floor(Math.random() * 12)) * 10;
        state.cycles = 1 + Math.floor(Math.random() * 3);
        renderInto(container);
      });
    }

    bindEngineActions(container, topic, res);
  }

  window.TCM_V25_FORMULA_SANDBOX = {
    version: "2.0.0-craft",
    render: function (targetEl) {
      var el = targetEl || document.getElementById("v16DiyFormulaPage");
      renderInto(el);
    },
    evaluateCurrent: function () {
      var topics = getTopics();
      var solvents = buildSolventSystems();
      var topic = resolveCurrentTopic(topics);
      return evaluateFormula(state, topic, solvents);
    },
    getState: function () {
      return Object.assign({}, state);
    }
  };
})();
