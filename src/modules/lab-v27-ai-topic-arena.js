/**
 * 本草智研 v27 · 2.5 AI 课题生成器（v2 双层五维雷达竞技版）
 * - 真实校准 AI 初版方案（落点约 70~78 分，精准保留 4~6 项真实科研初稿漏洞，竞技体验更真实）
 * - 新增 AI 初版（虚线）vs 学生当前迭代（翠绿实面）双层 SVG 五维雷达对比图
 * - 支持 SOP 逐行自由编辑、重置回 AI 初版、一键参考修补、90 分强制准入编入「AI 自编题库」与导入六步工坊
 */
(function () {
  "use strict";

  var PASS_SCORE = 90;
  var STORAGE_WINS = "tcm_v27_arena_wins_v1";

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function clamp(n, lo, hi) {
    return Math.max(lo, Math.min(hi, Math.round(Number(n) || 0)));
  }

  var STARTER_PROMPTS = [
    "我想研究黄芩中黄芩苷的提取与纯化",
    "我想研究丹参酮 IIA 的绿色乙醇回流提取",
    "我想研究金银花绿原酸的低温超声提取",
    "我想研究黄连盐酸小檗碱的酸提盐析精制",
    "我想研究薄荷中薄荷脑的水蒸气蒸馏提取",
    "我想研究槐米芦丁碱提酸沉与酸水解制槲皮素"
  ];

  // 生成逼真的 AI 初版方案（校准至 ~72~78 分，保留 5 项典型科研初稿短板供学生迭代超越）
  function generateAiInitialDraft(promptText) {
    var q = String(promptText || "").trim() || STARTER_PROMPTS[0];
    var herb = "丹参";
    var compound = "丹参酮 IIA";
    var category = "醌类";
    var solventType = "95%乙醇";
    var defaultRig = "reflux";
    var idealTemp = 78;
    var idealPh = "中性 pH 7.0";
    var idealTlc = "硅胶 G 板，甲苯-乙酸乙酯(19:1)展开，日光及 UV 365 nm 检视丹红特征斑点";
    var idealPharm = "《中国药典》2025 版：丹参酮类总量按干燥品计不得少于 0.25%（HPLC 270 nm）";
    var idealChem = "丹参酮 IIA 具邻菲醌共轭母核，亲脂性强（XLogP 4.3），按相似相溶原则宜采用 95% 乙醇避光回流提取并防高温光氧化。";

    if (/黄芩/.test(q)) {
      herb = "黄芩"; compound = "黄芩苷"; category = "黄酮"; solventType = "纯化水"; defaultRig = "decoction";
      idealTemp = 98; idealPh = "酸沉 pH 1.5~2.0";
      idealTlc = "聚酰胺薄膜/硅胶 G 板，乙酸乙酯-丁酮-甲酸-水(5:3:1:1)展开，喷 1% FeCl₃ 显墨绿色并于 365 nm 检视";
      idealPharm = "《中国药典》2025 版：黄芩苷按干燥品计不得少于 9.0%（HPLC 280 nm）";
      idealChem = "黄芩苷为黄酮葡萄糖醛酸苷，含羧基与酚羟基；须沸水投药瞬时钝化黄芩酶防酶解变绿，酸调 pH 1.5~2.0 沉淀精制。";
    } else if (/绿原酸|金银花/.test(q)) {
      herb = "金银花"; compound = "绿原酸"; category = "苯丙素"; solventType = "50%乙醇"; defaultRig = "ultrasonic";
      idealTemp = 42; idealPh = "微酸 pH 4.5";
      idealTlc = "硅胶 H 板，乙酸丁酯-甲酸-水(7:2.5:2.5)上层展开，UV 365 nm 检视亮蓝色荧光斑点";
      idealPharm = "《中国药典》2025 版：绿原酸按干燥品计不得少于 1.5%（HPLC 327 nm）";
      idealChem = "绿原酸含邻二酚羟基与酯键，极性强且热敏怕碱，按极性匹配原则宜 42℃ 微酸 50% 乙醇超声防氧化褐变。";
    } else if (/小檗碱|黄连/.test(q)) {
      herb = "黄连"; compound = "盐酸小檗碱"; category = "生物碱"; solventType = "酸水(0.5%H₂SO₄)"; defaultRig = "percolation";
      idealTemp = 35; idealPh = "酸提 pH 2.0 / 碱调 pH 9.0";
      idealTlc = "硅胶 G 板，甲苯-乙酸乙酯-异丙醇-甲醇-浓氨试液(6:3:1.5:1.5:0.5)氨蒸气预饱和展开，UV 365 nm 显亮黄荧光";
      idealPharm = "《中国药典》2025 版：按盐酸小檗碱计不得少于 5.5%（HPLC 345 nm）";
      idealChem = "小檗碱为异喹啉季铵生物碱，酸水成盐增溶浸出，石灰乳调碱除杂后加 8% NaCl 盐析结晶精制。";
    } else if (/薄荷/.test(q)) {
      herb = "薄荷"; compound = "薄荷脑"; category = "挥发油"; solventType = "纯化水"; defaultRig = "steam";
      idealTemp = 100; idealPh = "中性 pH 7.0";
      idealTlc = "硅胶 G 板，甲苯-乙酸乙酯(19:1)展开，喷香草醛硫酸试液 105℃ 加热显紫红色斑点";
      idealPharm = "《中国药典》2025 版：薄荷挥发油不得少于 0.80%（mL/g），GC 法测定薄荷脑含量";
      idealChem = "薄荷脑为单萜醇类挥发油核心成分，具挥发性与水共沸特性，宜水蒸气蒸馏提取并 -18℃ 冷冻析晶。";
    } else if (/芦丁|槐米|槲皮素/.test(q)) {
      herb = "槐米"; compound = "芦丁 / 槲皮素"; category = "黄酮"; solventType = "碱水(0.4%硼砂)"; defaultRig = "reflux";
      idealTemp = 90; idealPh = "碱提 pH 8.8 / 酸沉 pH 2.5";
      idealTlc = "硅胶 G 板，乙酸乙酯-甲酸-水(8:1:1)展开，喷 3% AlCl₃ 乙醇溶液于 UV 365 nm 显黄绿色强荧光";
      idealPharm = "《中国药典》2025 版：槐米总黄酮按无水芦丁计不得少于 20.0%（UV 500 nm / HPLC 257 nm）";
      idealChem = "芦丁含多个酚羟基，加硼砂保护邻二酚并微碱成盐增溶，盐酸调 pH 2.5 析晶，稀酸水解制槲皮素苷元。";
    } else {
      var m = q.match(/研究(.{2,10}?)(?:的提取|提取|纯化|分离)/);
      if (m && m[1]) {
        compound = m[1].replace(/中|里/g, " ").trim();
        herb = compound.slice(0, 2);
      }
    }

    // 校准 AI 初版为 ~73 分：基础框架完整，但保留 5 处典型初稿短板（单次提取 / 未量化 pH / 缺 TLC 展开体系 / 缺药典限度 / 缺安全与误差条款）
    return {
      prompt: q,
      herb: herb,
      compound: compound,
      category: category,
      formalTitle: herb + "中" + compound + "的提取分离实验",
      mass: 50,
      ratio: 10,
      temp: /金银花|绿原酸/.test(q) ? 82 : idealTemp,
      time: 60,
      cycles: "1", // 短板 1：单次提取
      solventType: solventType,
      mesh: "中粉(40目)",
      ph: "待定", // 短板 2：未量化 pH
      defaultRig: defaultRig,
      chemistry: idealChem,
      tlcSystem: "常规硅胶板展开", // 短板 3：缺展开剂比例与检视波长
      pharmacopoeia: "参考药典测定含量", // 短板 4：缺药典定量限度
      integrative: "记录粗提物得率并完成实验报告。", // 短板 5：缺安全防护与误差讨论
      sop: [
        "1. 精密称取 " + herb + " 中粉(40目) 50 g 置圆底烧瓶中",
        "2. 按料液比 1:10 加入 " + solventType + " 浸润 20 min",
        "3. 控温提取 60 min 后趁热减压抽滤并旋蒸浓缩",
        "4. 取浓缩液进行初步定性检识并核算粗提物得率"
      ],
      troubleshoot: [
        { issue: "提取液起泡或暴沸冲料", fix: "停热冷却后补加沸石，旋蒸加装防暴沸缓冲球" },
        { issue: "TLC 斑点拖尾或 Rf 偏离", fix: "调节展开剂 pH 并控制点样斑径 ≤2 mm" }
      ],
      _hints: {
        formalTitle: herb + "中" + compound + "的规范提取分离与质控检识实验",
        ratio: 10,
        temp: idealTemp,
        cycles: "2",
        mesh: "中粉(40目)",
        ph: idealPh,
        chemistry: idealChem,
        tlcSystem: idealTlc,
        pharmacopoeia: idealPharm,
        integrative: "全程执行加沸石防暴沸、冷凝水下进上出、通风橱防爆与有机废液分类回收；设 3 组平行样控制 RSD < 3.5%，对比超声与回流绿色评分。",
        sop: [
          "1. 精密称取 " + herb + " 中粉(40目) 50 g，按料液比 1:10 加入 " + solventType + " 浸润 20 min",
          "2. 投入 3 粒素瓷沸石防暴沸，先通冷凝水（下进上出）再控温 " + idealTemp + "℃ 提取 60 min × 2 次",
          "3. 趁热减压抽滤合并两次滤液，45℃ 旋蒸回收溶剂并按酸碱/树脂路线富集精制",
          "4. 按 " + idealTlc.slice(0, 26) + " 进行 TLC 与化学显色交叉检识，并计算得率与 RSD"
        ]
      }
    };
  }

  function evaluateFiveDimensions(d) {
    var dims = [];
    var issues = [];

    // 1. 科学性与提取机理 (20分)
    var s1 = 4;
    if ((d.herb || "").trim().length >= 2 && (d.compound || "").trim().length >= 2) s1 += 4;
    else issues.push({ dim: "科学性", key: "chemistry", text: "请明确药材名称与核心目标活性成分。" });

    var mechText = (d.chemistry || "") + " " + (d.integrative || "");
    if (mechText.trim().length >= 45) s1 += 5;
    else issues.push({ dim: "科学性", key: "chemistry", text: "提取机理阐述偏简略（<45字），需补充目标成分极性/酸碱性与溶剂匹配依据。" });

    if (/乙醇|水|酸|碱|超临界|低共熔|乙酸乙酯/.test(d.solventType || "")) s1 += 4;
    else issues.push({ dim: "科学性", key: "chemistry", text: "溶剂体系与成分大类的相似相溶匹配度不足。" });

    if (/极性|溶解|成盐|扩散|沉淀|吸附|沸点|水解|热敏|酸碱|共沸|杀酶/.test(mechText)) s1 += 3;
    else issues.push({ dim: "科学性", key: "chemistry", text: "机理中需明确核心物理化学原理（如极性匹配、酸碱成盐、杀酶保苷或共沸蒸馏）。" });
    s1 = clamp(s1, 0, 20);
    dims.push({ name: "科学性与提取机理", short: "科学机理", score: s1, max: 20 });

    // 2. 工艺参数与可复现性 (20分)
    var s2 = 0;
    if ((d.formalTitle || "").trim().length >= 12) s2 += 3;
    else issues.push({ dim: "工艺参数", key: "formalTitle", text: "实验正式题目过于简略（<12字），需包含“药材 + 成分 + 工艺 + 检识”。" });

    if (d.mass >= 10 && d.mass <= 500) s2 += 3;
    else issues.push({ dim: "工艺参数", key: "params", text: "单批投料量不在常规区间（10~500 g）。" });

    if (d.ratio >= 6 && d.ratio <= 16) s2 += 4;
    else issues.push({ dim: "工艺参数", key: "params", text: "料液比（1:" + d.ratio + "）偏离推荐区间（1:6~1:16）。" });

    var heatMax = /金银花|绿原酸|热敏/.test(d.herb + d.compound) ? 60 : (/丹参酮/.test(d.compound) ? 85 : 100);
    if (d.temp >= 20 && d.temp <= heatMax) s2 += 4;
    else issues.push({ dim: "工艺参数", key: "params", text: "提取温度（" + d.temp + "℃）超出本类成分建议耐热上限（" + heatMax + "℃）。" });

    if (Number(d.cycles) >= 2) s2 += 3;
    else issues.push({ dim: "工艺参数", key: "params", text: "单次提取（1 次）浸出不完全，建议设为 ≥2 次合并提取。" });

    if (/\d/.test(String(d.ph || "")) && (d.mesh || "").length >= 3) s2 += 3;
    else issues.push({ dim: "工艺参数", key: "params", text: "目标 pH 需给出明确数字（如 pH 7.0 / pH 4.5），并注明标准筛目数。" });
    s2 = clamp(s2, 0, 20);
    dims.push({ name: "工艺参数与可复现性", short: "工艺参数", score: s2, max: 20 });

    // 3. 实验安全与绿色规范 (20分)
    var s3 = 6;
    var isHighRisk = /氯仿|乙醚|苯|甲醇|石油醚/.test(d.solventType || "");
    if (!isHighRisk) s3 += 6;
    else { s3 += 2; issues.push({ dim: "安全绿色", key: "safety", text: "使用了高毒/高挥发溶剂，建议优先替换为乙醇/水绿色体系。" }); }

    var safetyText = (d.sop || []).join(" ") + " " + (d.integrative || "");
    if (/沸石|暴沸|气密|通风|防护|废液|冷却|控温|安全/.test(safetyText)) s3 += 5;
    else issues.push({ dim: "安全绿色", key: "safety", text: "缺少明确安全防护与避坑条款（加沸石防暴沸、冷凝水下进上出、废液分类回收）。" });

    if (d.ratio * Number(d.cycles) <= 30) s3 += 3;
    else issues.push({ dim: "安全绿色", key: "params", text: "总溶剂消耗偏高（>30 mL/g），建议下调料液比或旋蒸回收。" });
    s3 = clamp(s3, 0, 20);
    dims.push({ name: "实验安全与绿色规范", short: "安全绿色", score: s3, max: 20 });

    // 4. 分离纯化与检识闭环 (20分)
    var s4 = 2;
    if ((d.tlcSystem || "").trim().length >= 16) s4 += 6;
    else issues.push({ dim: "纯化检识", key: "tlcSystem", text: "缺少规范的 TLC 展开剂比例与检视波长（254/365 nm 或显色剂）。" });

    if ((d.pharmacopoeia || "").trim().length >= 16) s4 += 5;
    else issues.push({ dim: "纯化检识", key: "pharmacopoeia", text: "缺少《中国药典》定量限度或 HPLC/UV 质控指标说明。" });

    if (/显色|沉淀|镁粉|碘化铋钾|FeCl|AlCl|HPLC|UV|TLC|GC|荧光/.test((d.tlcSystem || "") + (d.pharmacopoeia || ""))) s4 += 4;
    else issues.push({ dim: "纯化检识", key: "tlcSystem", text: "缺少理化显色/色谱交叉验证证据链。" });

    if (/萃取|树脂|柱层析|结晶|抽滤|旋蒸|沉淀|析晶|蒸馏/.test((d.sop || []).join(" ") + (d.chemistry || ""))) s4 += 3;
    else issues.push({ dim: "纯化检识", key: "sop", text: "分离纯化富集步骤不够完整。" });
    s4 = clamp(s4, 0, 20);
    dims.push({ name: "分离纯化与检识闭环", short: "纯化检识", score: s4, max: 20 });

    // 5. 实操可行与创新深度 (20分)
    var s5 = 4;
    var totalMin = Number(d.time) * Number(d.cycles) + 60;
    if (totalMin <= 240) s5 += 5;
    else issues.push({ dim: "实操可行", key: "params", text: "总耗时约 " + totalMin + " min（超 4 学时），建议精简单次提取时间。" });

    if ((d.sop || []).length >= 4) s5 += 5;
    else issues.push({ dim: "实操可行", key: "sop", text: "标准操作步骤（SOP）少于 4 步，不便课堂规范复现。" });

    if ((d.troubleshoot || []).length >= 2) s5 += 3;
    else issues.push({ dim: "实操可行", key: "sop", text: "异常排障预案少于 2 条。" });

    if ((d.integrative || "").trim().length >= 24) s5 += 3;
    else issues.push({ dim: "实操可行", key: "safety", text: "缺少误差控制（RSD）或绿色工艺对照拓展思路。" });
    s5 = clamp(s5, 0, 20);
    dims.push({ name: "实操可行与创新深度", short: "实操创新", score: s5, max: 20 });

    var total = s1 + s2 + s3 + s4 + s5;
    return { score: total, passed: total >= PASS_SCORE, dimensions: dims, issues: issues };
  }

  // 生成双层 SVG 五维雷达图（AI 初版虚线 vs 学生迭代翠绿实面）
  function buildDualRadarSvg(aiDims, curDims) {
    var cx = 92, cy = 86, maxR = 56;
    function polyPoints(dims) {
      return dims.map(function (d, i) {
        var ang = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
        var r = (d.score / (d.max || 20)) * maxR;
        return (cx + r * Math.cos(ang)).toFixed(1) + "," + (cy + r * Math.sin(ang)).toFixed(1);
      }).join(" ");
    }
    var rings = [0.33, 0.66, 1.0].map(function (scale) {
      var pts = [];
      for (var i = 0; i < 5; i++) {
        var ang = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
        pts.push((cx + maxR * scale * Math.cos(ang)).toFixed(1) + "," + (cy + maxR * scale * Math.sin(ang)).toFixed(1));
      }
      return '<polygon points="' + pts.join(" ") + '" fill="none" stroke="rgba(100,116,139,0.22)" stroke-width="1"/>';
    }).join("");

    var axes = curDims.map(function (d, i) {
      var ang = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
      var x2 = (cx + maxR * Math.cos(ang)).toFixed(1);
      var y2 = (cy + maxR * Math.sin(ang)).toFixed(1);
      var lx = (cx + (maxR + 18) * Math.cos(ang)).toFixed(1);
      var ly = (cy + (maxR + 14) * Math.sin(ang) + 3).toFixed(1);
      return (
        '<line x1="' + cx + '" y1="' + cy + '" x2="' + x2 + '" y2="' + y2 + '" stroke="rgba(100,116,139,0.2)" stroke-width="1"/>' +
        '<text x="' + lx + '" y="' + ly + '" text-anchor="middle" font-size="9.5" font-weight="700" fill="#64748b">' + esc(d.short) + "</text>"
      );
    }).join("");

    return (
      '<svg viewBox="0 0 184 170" width="184" height="170" aria-label="AI初版与学生迭代五维雷达对比">' +
        rings + axes +
        '<polygon class="v27-radar-ai" points="' + polyPoints(aiDims) + '" fill="rgba(148,163,184,0.18)" stroke="#64748b" stroke-width="1.6" stroke-dasharray="4 3"/>' +
        '<polygon class="v27-radar-user" points="' + polyPoints(curDims) + '" fill="rgba(16,185,129,0.28)" stroke="#059669" stroke-width="2.2"/>' +
      "</svg>"
    );
  }

  var state = {
    prompt: STARTER_PROMPTS[0],
    templateId: "undergrad_4h",
    draft: null,
    aiInitialScore: 0,
    aiInitialDims: [],
    currentReview: null,
    round: 1,
    history: [],
    committed: false,
    wins: loadWins(),
    isGenerating: false,
    isCritiquing: false,
    engineLabel: "三引擎混编就绪（智谱 · 腾讯云 · 讯飞）",
    aiCritique: ""
  };

  function getTemplates() {
    if (window.TCMCloudAI && Array.isArray(window.TCMCloudAI.DESIGN_TEMPLATES)) {
      return window.TCMCloudAI.DESIGN_TEMPLATES;
    }
    return [
      { id: "undergrad_4h", short: "本科4学时", label: "🎓 本科 4 学时标准模板", promptRule: "严格按本科 4 学时、安全绿色与 3 批 RSD 规范设计。" }
    ];
  }

  function getActiveTemplate() {
    var list = getTemplates();
    return list.find(function (t) { return t.id === state.templateId; }) || list[0];
  }

  function loadWins() {
    try { return Number(localStorage.getItem(STORAGE_WINS) || 0) || 0; } catch (_) { return 0; }
  }

  function incWins() {
    state.wins += 1;
    try { localStorage.setItem(STORAGE_WINS, String(state.wins)); } catch (_) {}
  }

  function applyDraftToState(draftObj, engineLabel) {
    state.draft = draftObj;
    var rev = evaluateFiveDimensions(state.draft);
    state.aiInitialScore = rev.score;
    state.aiInitialDims = rev.dimensions.map(function (d) { return Object.assign({}, d); });
    state.currentReview = rev;
    state.round = 1;
    state.history = [{ round: 1, label: "AI 初版", score: rev.score }];
    state.committed = false;
    state.aiCritique = "";
    if (engineLabel) state.engineLabel = engineLabel;
  }

  function startNewGeneration(promptText) {
    state.prompt = promptText || state.prompt || STARTER_PROMPTS[0];
    applyDraftToState(generateAiInitialDraft(state.prompt), "本地化学规则即时生成");
  }

  async function startCloudGeneration(promptText, container) {
    state.prompt = (promptText || state.prompt || STARTER_PROMPTS[0]).trim();
    if (!(window.TCMCloudAI && typeof window.TCMCloudAI.complete === "function")) {
      startNewGeneration(state.prompt);
      renderInto(container);
      return;
    }
    state.isGenerating = true;
    state.aiCritique = "";
    renderInto(container);

    var tpl = getActiveTemplate();
    var localFallback = generateAiInitialDraft(state.prompt);
    var sysPrompt =
      "你是「本草智研」中药化学 90 分课题竞技场的 AI 出题与模板编排引擎。\n" +
      "请严格套用以下标准化模板：" + tpl.label + "。" + (tpl.promptRule || "") + "\n" +
      "请严格只输出一个合法 JSON 对象（不要 markdown 代码块、不要多余说明），同时包含：\n" +
      "1）一个逼真的科研初稿（刻意保留 3~4 处典型新手短板：如 cycles=1、ph='待定'、tlcSystem 偏简略、integrative 偏简略，使初稿落点在 70~80 分，供学生按扣分点迭代超越）；\n" +
      "2）一个完全达标（≥95 分）的模板标杆 _hints 字段供学生点击「参考修补」对照学习。\n" +
      "JSON 字段模板：\n" +
      '{"herb":"药材名","compound":"核心活性成分","category":"黄酮|生物碱|挥发油与萜类|蒽醌与醌类|皂苷与三萜|苯丙素与有机酸|多糖类",' +
      '"formalTitle":"初稿简略题目","mass":50,"ratio":10,"temp":78,"time":60,"cycles":"1","solventType":"70%乙醇","mesh":"中粉(40目)","ph":"待定",' +
      '"defaultRig":"reflux","chemistry":"55字以上化学母核与提取分离原理","tlcSystem":"常规硅胶板展开","pharmacopoeia":"参考药典测定含量","integrative":"记录得率并完成报告。",' +
      '"sop":["1. 称取...","2. 浸润...","3. 提取浓缩...","4. 初步检识..."],' +
      '"troubleshoot":[{"issue":"异常1","fix":"对策1"},{"issue":"异常2","fix":"对策2"}],' +
      '"_hints":{"formalTitle":"规范学术课题全称（≥15字）","ratio":10,"temp":78,"cycles":"2","mesh":"中粉(40目)","ph":"具体数值如 pH 4.5",' +
      '"chemistry":"60字以上完整机理（含极性/酸碱/杀酶/共沸关键词）","tlcSystem":"硅胶板+精确展开剂比例+254/365nm显色剂",' +
      '"pharmacopoeia":"《中国药典》2025版定量限度与HPLC/UV指标","integrative":"含加沸石防暴沸、冷凝水下进上出、通风废液分类、3批平行RSD<3.5%及模板特色创新",' +
      '"sop":["1. 量化步骤1","2. 含沸石/控温/2次提取","3. 抽滤旋蒸富集","4. TLC与显色交叉检识及RSD核算"]}}';

    try {
      var res = await window.TCMCloudAI.complete({
        messages: [
          { role: "system", content: sysPrompt },
          { role: "user", content: "研究课题意向：" + state.prompt + "（请严格按「" + tpl.label + "」输出 JSON）" }
        ],
        expectJson: true,
        useCache: false
      });
      var raw = res && (res.content || res.text || res);
      var cleaned = window.TCMCloudAI.cleanJsonText ? window.TCMCloudAI.cleanJsonText(raw) : String(raw || "");
      var parsed = JSON.parse(cleaned);
      var h = parsed._hints && typeof parsed._hints === "object" ? parsed._hints : {};
      var merged = Object.assign({}, localFallback, {
        prompt: state.prompt,
        herb: parsed.herb || localFallback.herb,
        compound: parsed.compound || localFallback.compound,
        category: parsed.category || localFallback.category,
        formalTitle: parsed.formalTitle || localFallback.formalTitle,
        mass: clamp(parsed.mass || localFallback.mass, 10, 500),
        ratio: clamp(parsed.ratio || localFallback.ratio, 4, 24),
        temp: clamp(parsed.temp || localFallback.temp, 20, 110),
        time: clamp(parsed.time || localFallback.time, 15, 240),
        cycles: String(parsed.cycles || "1"),
        solventType: parsed.solventType || localFallback.solventType,
        mesh: parsed.mesh || "中粉(40目)",
        ph: parsed.ph || "待定",
        defaultRig: parsed.defaultRig || localFallback.defaultRig,
        chemistry: parsed.chemistry || localFallback.chemistry,
        tlcSystem: parsed.tlcSystem || localFallback.tlcSystem,
        pharmacopoeia: parsed.pharmacopoeia || localFallback.pharmacopoeia,
        integrative: parsed.integrative || localFallback.integrative,
        sop: Array.isArray(parsed.sop) && parsed.sop.length >= 3 ? parsed.sop : localFallback.sop,
        troubleshoot: Array.isArray(parsed.troubleshoot) && parsed.troubleshoot.length >= 2 ? parsed.troubleshoot : localFallback.troubleshoot,
        _hints: Object.assign({}, localFallback._hints, {
          formalTitle: h.formalTitle || (parsed.herb || localFallback.herb) + "中" + (parsed.compound || localFallback.compound) + "的规范提取分离与质控检识实验",
          ratio: clamp(h.ratio || 10, 6, 16),
          temp: clamp(h.temp || parsed.temp || 75, 25, 100),
          cycles: String(h.cycles || "2"),
          mesh: h.mesh || "中粉(40目)",
          ph: h.ph || "中性 pH 7.0",
          chemistry: h.chemistry || parsed.chemistry || localFallback._hints.chemistry,
          tlcSystem: h.tlcSystem || localFallback._hints.tlcSystem,
          pharmacopoeia: h.pharmacopoeia || localFallback._hints.pharmacopoeia,
          integrative: h.integrative || localFallback._hints.integrative,
          sop: Array.isArray(h.sop) && h.sop.length >= 4 ? h.sop : localFallback._hints.sop
        })
      });
      var hitLabel = (res && res.label) ? ("已由 " + res.label + " 套用「" + tpl.short + "」生成") : "三引擎云端生成完成";
      applyDraftToState(merged, hitLabel);
    } catch (_) {
      applyDraftToState(localFallback, "云端繁忙 · 已切换站内化学规则兜底");
    } finally {
      state.isGenerating = false;
      renderInto(container);
    }
  }

  async function runCloudCritique(container) {
    if (state.isCritiquing || !state.draft) return;
    if (!(window.TCMCloudAI && typeof window.TCMCloudAI.complete === "function")) return;
    state.isCritiquing = true;
    renderInto(container);
    var d = state.draft;
    var rev = state.currentReview;
    var tpl = getActiveTemplate();
    try {
      var res = await window.TCMCloudAI.complete({
        messages: [
          {
            role: "system",
            content: "你是本草智研中药化学评审教授。请对照【" + tpl.label + "】对学生的实验方案做 140~220 字精炼中文点评：①肯定1处优点；②指出最关键的 2 处工艺/安全/质控可提升细节；③给出可直接填入的改进建议。禁止废话。"
          },
          {
            role: "user",
            content: "题目：" + d.formalTitle + "\n药材与成分：" + d.herb + " / " + d.compound + "\n参数：" + d.solventType + "，1:" + d.ratio + "，" + d.temp + "℃×" + d.time + "min×" + d.cycles + "次，pH=" + d.ph + "\nTLC：" + d.tlcSystem + "\n药典：" + d.pharmacopoeia + "\n安全与拓展：" + d.integrative + "\n当前五维总分：" + rev.score + "/100"
          }
        ],
        expectJson: false,
        useCache: false
      });
      var text = (res && (res.content || res.text)) || "";
      state.aiCritique = text.trim();
      if (res && res.label) state.engineLabel = "点评命中：" + res.label;
    } catch (_) {
      state.aiCritique = "当前云端繁忙：请优先对照上方红色扣分漏洞逐项修补（重点关注提取次数 ≥2、明确 pH 数值、TLC 展开剂体积比及防暴沸安全条款）。";
    } finally {
      state.isCritiquing = false;
      renderInto(container);
    }
  }

  function applyGuidedFix(fixKey) {
    if (!state.draft || !state.draft._hints) return;
    var h = state.draft._hints;
    if (fixKey === "formalTitle") state.draft.formalTitle = h.formalTitle;
    else if (fixKey === "chemistry") state.draft.chemistry = h.chemistry;
    else if (fixKey === "params") {
      state.draft.ratio = h.ratio;
      state.draft.temp = h.temp;
      state.draft.cycles = h.cycles;
      state.draft.mesh = h.mesh;
      state.draft.ph = h.ph;
    } else if (fixKey === "tlcSystem") state.draft.tlcSystem = h.tlcSystem;
    else if (fixKey === "pharmacopoeia") state.draft.pharmacopoeia = h.pharmacopoeia;
    else if (fixKey === "safety") {
      state.draft.integrative = h.integrative;
      state.draft.sop = h.sop.slice();
    } else if (fixKey === "sop") {
      state.draft.sop = h.sop.slice();
    }
  }

  function barColor(score, max) {
    var pct = (score / (max || 20)) * 100;
    if (pct >= 88) return "#10b981";
    if (pct >= 68) return "#f59e0b";
    return "#ef4444";
  }

  function buildReportFrameworkText(d) {
    return [
      "《" + d.formalTitle + "》A4 规范实验报告框架",
      "一、实验目的与化学机理：" + d.chemistry,
      "二、量化工艺参数：投料 " + d.mass + " g | " + d.solventType + " | 料液比 1:" + d.ratio + " | " + d.temp + "℃ × " + d.time + " min × " + d.cycles + " 次 | 粒度 " + d.mesh + " | pH " + d.ph,
      "三、标准操作流程（SOP）：" + (d.sop || []).join("；"),
      "四、纯化检识与药典质控：" + d.tlcSystem + "；" + d.pharmacopoeia,
      "五、安全防护与误差讨论：" + d.integrative
    ].join("\n");
  }

  function renderInto(container) {
    if (!container) return;
    if (!state.draft) startNewGeneration(state.prompt);

    var d = state.draft;
    var rev = state.currentReview;
    var delta = rev.score - state.aiInitialScore;
    var beatAi = rev.passed && delta > 0;
    var templates = getTemplates();
    var activeTpl = getActiveTemplate();
    var compBadge = window.TCM_MOL3D_REGISTRY ? window.TCM_MOL3D_REGISTRY.linkifyHtml(esc(d.compound || "")) : esc(d.compound || "");

    container.innerHTML =
      '<div class="v27-arena-shell">' +
        '<div class="v27-prompt-card">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
            '<div>' +
              '<div style="font-size:16px;font-weight:900;">⚔️ AI 课题生成器 · 90 分五维评审竞技场</div>' +
              '<div style="font-size:12.5px;color:#64748b;margin-top:2px;">先选标准化模板，再输入任意药材/成分，三引擎云端 AI 套模板生成初版并强制过 90 分五维评审；按扣分点修补超越 AI！</div>' +
            "</div>" +
            '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">' +
              '<span style="font-size:11.5px;font-weight:700;padding:3px 10px;border-radius:999px;background:rgba(15,118,110,0.10);color:#0f766e;">☁️ ' + esc(state.engineLabel) + "</span>" +
              '<span style="font-size:12px;font-weight:800;padding:4px 12px;border-radius:999px;background:rgba(16,185,129,0.14);color:#047857;">🏆 累计完胜 AI：' + state.wins + " 次</span>" +
            "</div>" +
          "</div>" +
          '<div class="v27-tpl-row" style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:10px;">' +
            '<span style="font-size:11.5px;font-weight:800;color:#64748b;">📐 套用设计模板：</span>' +
            templates.map(function (t) {
              var on = t.id === state.templateId;
              return '<button type="button" data-v27-tpl="' + esc(t.id) + '" class="v27-starter-chip' + (on ? " is-tpl-active" : "") + '" style="' +
                (on ? "background:#059669;color:#ffffff;border-color:#059669;font-weight:800;" : "") + '">' + esc(t.label) + "</button>";
            }).join("") +
          "</div>" +
          '<div style="font-size:11px;color:#0f766e;margin-top:5px;opacity:0.9;">当前模板规范：' + esc(activeTpl.desc || activeTpl.promptRule || "") + "</div>" +
          '<div class="v27-input-row">' +
            '<input type="text" id="v27PromptInput" class="v27-prompt-input" value="' + esc(state.prompt) + '" placeholder="支持输入任意药材与成分，如：我想研究青蒿素低温提取 / 葛根素大孔树脂纯化..." />' +
            '<button type="button" id="v27BtnGenerate" class="v27-btn-gen"' + (state.isGenerating ? " disabled" : "") + '>' + (state.isGenerating ? "⏳ 三引擎按模板生成中..." : "✨ 三引擎套模板生成并评审") + "</button>" +
          "</div>" +
          '<div class="v27-starter-row">' +
            STARTER_PROMPTS.map(function (sp) {
              return '<button type="button" class="v27-starter-chip" data-v27-starter="' + esc(sp) + '">' + esc(sp) + "</button>";
            }).join("") +
          "</div>" +
        "</div>" +

        '<div class="v27-vs-bar">' +
          '<div class="v27-vs-side">' +
            '<span class="v27-vs-label">🤖 AI 初版方案得分</span>' +
            '<span class="v27-vs-score" style="color:#64748b;">' + state.aiInitialScore + ' <small style="font-size:14px;">/ 100</small></span>' +
          "</div>" +
          '<div style="font-size:15px;font-weight:900;color:#94a3b8;">VS</div>' +
          '<div class="v27-vs-side">' +
            '<span class="v27-vs-label">🧑‍🔬 你的当前迭代得分（第 ' + state.round + ' 轮）</span>' +
            '<span class="v27-vs-score" style="color:' + (rev.passed ? "#059669" : "#d97706") + ';">' + rev.score + ' <small style="font-size:14px;">/ 100</small></span>' +
          "</div>" +
          '<div class="v27-vs-badge ' + (rev.passed ? "is-win" : "is-chase") + '">' +
            (beatAi
              ? "🏆 超越 AI +" + delta + " 分 · 达标可入库！"
              : rev.passed
                ? "✅ 已达 ≥90 分准入门槛"
                : "距 90 分门槛还差 " + (PASS_SCORE - rev.score) + " 分") +
          "</div>" +
        "</div>" +

        '<div class="v27-main-grid">' +
          '<div class="v27-card">' +
            '<h3 class="v27-sec-title"><span>1. AI 套模板生成方案（' + esc(d.herb) + ' · ' + compBadge + '）</span><button type="button" class="v27-btn-ghost" id="v27BtnResetDraft" style="padding:4px 10px;font-size:11.5px;">🔄 重置回 AI 初版</button></h3>' +

            '<div class="v27-field" style="margin-bottom:9px;">' +
              '<label>实验正式题目</label>' +
              '<input type="text" id="v27Title" value="' + esc(d.formalTitle) + '" />' +
            "</div>" +

            '<div class="v27-param-grid">' +
              '<div class="v27-field"><label>溶剂体系</label><input type="text" id="v27Solvent" value="' + esc(d.solventType) + '" /></div>' +
              '<div class="v27-field"><label>料液比 (mL/g)</label><input type="number" id="v27Ratio" value="' + d.ratio + '" /></div>' +
              '<div class="v27-field"><label>提取温度 (℃)</label><input type="number" id="v27Temp" value="' + d.temp + '" /></div>' +
              '<div class="v27-field"><label>单次时间 (min)</label><input type="number" id="v27Time" value="' + d.time + '" /></div>' +
              '<div class="v27-field"><label>提取次数</label><input type="number" id="v27Cycles" value="' + d.cycles + '" /></div>' +
              '<div class="v27-field"><label>目标 pH</label><input type="text" id="v27Ph" value="' + esc(d.ph) + '" /></div>' +
            "</div>" +

            '<div class="v27-field" style="margin-bottom:9px;">' +
              '<label>提取分离化学机理</label>' +
              '<textarea id="v27Chem">' + esc(d.chemistry) + "</textarea>" +
            "</div>" +

            '<div class="v27-field" style="margin-bottom:9px;">' +
              '<label>标准操作流程 SOP（每行一步，建议 ≥4 步）</label>' +
              '<textarea id="v27Sop" style="min-height:76px;">' + esc((d.sop || []).join("\n")) + "</textarea>" +
            "</div>" +

            '<div class="v27-field" style="margin-bottom:9px;">' +
              '<label>TLC 薄层展开体系与特征检识（需含比例与波长/显色剂）</label>' +
              '<input type="text" id="v27Tlc" value="' + esc(d.tlcSystem) + '" />' +
            "</div>" +

            '<div class="v27-field" style="margin-bottom:9px;">' +
              '<label>《中国药典》质控限度与定量方法</label>' +
              '<input type="text" id="v27Pharm" value="' + esc(d.pharmacopoeia) + '" />' +
            "</div>" +

            '<div class="v27-field" style="margin-bottom:9px;">' +
              '<label>安全防护（沸石/冷凝/废液）与创新对照设计</label>' +
              '<textarea id="v27Safety">' + esc(d.integrative) + "</textarea>" +
            "</div>" +

            '<div class="v27-report-box">' +
              '<div style="font-weight:800;margin-bottom:4px;">📄 自动同步 A4 实验报告框架：</div>' +
              '<div style="white-space:pre-line;opacity:0.9;">' + esc(buildReportFrameworkText(d)) + "</div>" +
            "</div>" +
          "</div>" +

          '<div class="v27-card">' +
            '<h3 class="v27-sec-title"><span>2. 强制 90 分五维评审台（双层雷达对照）</span><span style="font-size:11.5px;color:#64748b;">≥90分准入</span></h3>' +

            '<div class="v27-radar-strip">' +
              '<div>' +
                buildDualRadarSvg(state.aiInitialDims, rev.dimensions) +
                '<div class="v27-radar-legend"><span>--- AI初版</span><span style="color:#059669;">■ 你的迭代</span></div>' +
              "</div>" +
              '<div class="v27-dim-list">' +
                rev.dimensions.map(function (dim) {
                  var pct = Math.round((dim.score / dim.max) * 100);
                  return (
                    '<div class="v27-dim-item">' +
                      '<div class="v27-dim-head"><span>' + esc(dim.name) + '</span><span style="color:' + barColor(dim.score, dim.max) + ';">' + dim.score + " / " + dim.max + "</span></div>" +
                      '<div class="v27-dim-track"><div class="v27-dim-fill" style="width:' + pct + '%;background:' + barColor(dim.score, dim.max) + ';"></div></div>' +
                    "</div>"
                  );
                }).join("") +
              "</div>" +
            "</div>" +

            '<div class="v27-issue-box' + (rev.passed ? " is-pass" : "") + '">' +
              '<div style="font-size:13px;font-weight:900;margin-bottom:6px;">' +
                (rev.passed
                  ? "🎉 评审通过（" + rev.score + " 分 ≥ 90 分）：已满足「AI 自编题库」收录标准！"
                  : "🚨 当前未达标（拦截入库），共 " + rev.issues.length + " 项扣分漏洞待修补：") +
              "</div>" +
              (rev.issues.length
                ? rev.issues.map(function (iss) {
                    return (
                      '<div class="v27-issue-item">' +
                        '<span><strong>【' + esc(iss.dim) + "】</strong>" + esc(iss.text) + "</span>" +
                        '<button type="button" class="v27-fix-chip" data-v27-fix="' + iss.key + '">💡 参考修补</button>' +
                      "</div>"
                    );
                  }).join("")
                : '<div style="font-size:12px;">全部 5 个维度无硬性扣分漏洞，可立即编入自编题库或导入六步工坊演练。</div>') +
            "</div>" +

            '<div class="v27-btn-row">' +
              '<button type="button" class="v27-btn-gen" id="v27BtnReReview">⚖️ 提交修订并重新五维复审</button>' +
              '<button type="button" class="v27-btn-ghost" id="v27BtnAiCritique"' + (state.isCritiquing ? " disabled" : "") + '>' + (state.isCritiquing ? "⏳ AI 教授评审中..." : "🤖 三引擎 AI 深度点评") + "</button>" +
              '<button type="button" class="v27-btn-pass" id="v27BtnCommit"' + (rev.passed ? "" : " disabled") + ">" + (state.committed ? "✅ 已编入自编题库" : "🏆 确认编入自编题库（≥90分）") + "</button>" +
              '<button type="button" class="v27-btn-ghost" id="v27BtnToWorkflow">🚀 导入六步工坊</button>' +
              '<button type="button" class="v27-btn-ghost" id="v27BtnCopyFramework">📋 复制报告框架</button>' +
            "</div>" +

            (state.aiCritique
              ? '<div class="v27-report-box" style="margin-top:10px;border-color:rgba(16,185,129,0.4);background:rgba(16,185,129,0.08);">' +
                  '<div style="font-weight:800;margin-bottom:4px;color:#059669;">🤖 三引擎 AI 评审教授点评（对照 ' + esc(activeTpl.short) + '）：</div>' +
                  '<div style="white-space:pre-line;line-height:1.6;">' + esc(state.aiCritique) + "</div>" +
                "</div>"
              : "") +

            '<div style="margin-top:12px;font-size:11.5px;color:#64748b;">迭代轨迹：' +
              state.history.map(function (h) { return h.label + " " + h.score + "分"; }).join(" → ") +
            "</div>" +
          "</div>" +
        "</div>" +
      "</div>";

    function syncFieldsToDraft() {
      var val = function (id) { var el = container.querySelector(id); return el ? el.value : ""; };
      d.formalTitle = val("#v27Title");
      d.solventType = val("#v27Solvent");
      d.ratio = Number(val("#v27Ratio")) || d.ratio;
      d.temp = Number(val("#v27Temp")) || d.temp;
      d.time = Number(val("#v27Time")) || d.time;
      d.cycles = String(Number(val("#v27Cycles")) || 1);
      d.ph = val("#v27Ph");
      if (/\d/.test(d.ph) && d.mesh.length < 3) d.mesh = d._hints ? d._hints.mesh : "中粉(40目)";
      d.chemistry = val("#v27Chem");
      var sopLines = val("#v27Sop").split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean);
      if (sopLines.length) d.sop = sopLines;
      d.tlcSystem = val("#v27Tlc");
      d.pharmacopoeia = val("#v27Pharm");
      d.integrative = val("#v27Safety");
    }

    function runReReview(skipSync) {
      if (!skipSync) syncFieldsToDraft();
      var prevPassed = state.currentReview && state.currentReview.passed;
      state.round += 1;
      state.currentReview = evaluateFiveDimensions(state.draft);
      state.history.push({ round: state.round, label: "第" + state.round + "轮", score: state.currentReview.score });
      if (!prevPassed && state.currentReview.passed && state.currentReview.score > state.aiInitialScore) {
        incWins();
      }
      renderInto(container);
    }

    container.querySelectorAll("[data-v27-tpl]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.templateId = this.getAttribute("data-v27-tpl") || "undergrad_4h";
        renderInto(container);
      });
    });

    container.querySelector("#v27BtnGenerate").addEventListener("click", function () {
      var p = container.querySelector("#v27PromptInput").value.trim();
      startCloudGeneration(p || STARTER_PROMPTS[0], container);
    });

    container.querySelector("#v27BtnResetDraft").addEventListener("click", function () {
      startNewGeneration(state.prompt);
      renderInto(container);
    });

    var critBtn = container.querySelector("#v27BtnAiCritique");
    if (critBtn) {
      critBtn.addEventListener("click", function () {
        syncFieldsToDraft();
        runCloudCritique(container);
      });
    }

    container.querySelectorAll("[data-v27-starter]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        startCloudGeneration(this.getAttribute("data-v27-starter"), container);
      });
    });

    container.querySelectorAll("[data-v27-fix]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        syncFieldsToDraft();
        applyGuidedFix(this.getAttribute("data-v27-fix"));
        runReReview(true);
      });
    });

    container.querySelector("#v27BtnReReview").addEventListener("click", function () { runReReview(false); });

    container.querySelector("#v27BtnCommit").addEventListener("click", function () {
      if (!state.currentReview.passed) return;
      syncFieldsToDraft();
      var api = window.TCM_LAB_API;
      if (api && typeof api.commitApprovedAiTopic === "function") {
        api.commitApprovedAiTopic({
          id: "ai_arena_" + Date.now(),
          herb: d.herb + "（AI 竞技自编）",
          compound: d.compound,
          category: d.category,
          chemistry: d.chemistry,
          tlcSystem: d.tlcSystem,
          pharmacopoeia: d.pharmacopoeia,
          integrative: d.integrative,
          sop: d.sop,
          troubleshoot: d.troubleshoot,
          defaultRig: d.defaultRig,
          defaultCfg: { mass: d.mass, ratio: d.ratio, temp: d.temp, time: d.time, cycles: d.cycles, solventType: d.solventType, mesh: d.mesh, ph: d.ph }
        }, state.currentReview);
      }
      state.committed = true;
      if (api && typeof api.showToast === "function") {
        api.showToast("🏆 课题已以 " + state.currentReview.score + " 分正式编入「AI 自编题库」！");
      }
      renderInto(container);
    });

    container.querySelector("#v27BtnToWorkflow").addEventListener("click", function () {
      syncFieldsToDraft();
      var api = window.TCM_LAB_API;
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
        setVal("cfgRatio", d.ratio);
        setVal("cfgTemp", d.temp);
        setVal("cfgTime", d.time);
        setVal("cfgCycles", d.cycles);
        if (api && typeof api.showToast === "function") {
          api.showToast("已将 AI 课题参数导入六步工坊（02 定题与参数）！");
        }
      }, 120);
    });

    container.querySelector("#v27BtnCopyFramework").addEventListener("click", function () {
      syncFieldsToDraft();
      var txt = buildReportFrameworkText(d);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).catch(function () {});
      }
      if (window.TCM_LAB_API && typeof window.TCM_LAB_API.showToast === "function") {
        window.TCM_LAB_API.showToast("已复制 A4 实验报告框架到剪贴板！");
      }
    });
  }

  window.TCM_V27_AI_ARENA = {
    version: "2.0.0-radar-arena",
    render: function (targetEl) {
      var el = targetEl || document.getElementById("v16AiArenaPage");
      renderInto(el);
    },
    generate: function (promptText) {
      startNewGeneration(promptText);
      var el = document.getElementById("v16AiArenaPage");
      if (el) renderInto(el);
      return state.currentReview;
    },
    getState: function () {
      return {
        version: "2.0.0-radar-arena",
        prompt: state.prompt,
        aiInitialScore: state.aiInitialScore,
        currentScore: state.currentReview ? state.currentReview.score : 0,
        passed: state.currentReview ? state.currentReview.passed : false,
        issueCount: state.currentReview ? state.currentReview.issues.length : 0,
        round: state.round,
        committed: state.committed,
        wins: state.wins
      };
    }
  };
})();
