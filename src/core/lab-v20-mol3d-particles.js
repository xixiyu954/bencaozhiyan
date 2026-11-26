/**
 * 本草智研 v20 · 1.2 3D 分子结构库（PubChem 真实 3D 构象版）+ 粒子级显色反应引擎
 * 数据来源：NCBI PubChem PUG-REST 3D Conformer SDF（CID 16666/164676/64982/2353/1794427/5280343）
 * 规范：纯前端离线零外链渲染，暴露 window.TCM_V20_VISUALS
 */
(function () {
  "use strict";

  var ATOM_STYLE = {
    C: { color: "#475569", light: "#94a3b8", dark: "#1e293b", covR: 0.36, vdwR: 1.70, name: "碳 (C)" },
    O: { color: "#dc2626", light: "#fca5a5", dark: "#7f1d1d", covR: 0.34, vdwR: 1.52, name: "氧 (O)" },
    N: { color: "#2563eb", light: "#93c5fd", dark: "#1e3a8a", covR: 0.35, vdwR: 1.55, name: "氮 (N)" },
    H: { color: "#e2e8f0", light: "#ffffff", dark: "#64748b", covR: 0.22, vdwR: 1.20, name: "氢 (H)" },
    S: { color: "#eab308", light: "#fef08a", dark: "#713f12", covR: 0.42, vdwR: 1.80, name: "硫 (S)" }
  };

  function getMolecules() {
    if (typeof window !== "undefined" && window.TCM_MOL3D_PUBCHEM_DATA) {
      return window.TCM_MOL3D_PUBCHEM_DATA;
    }
    return {};
  }

  var PARTICLE_REACTIONS = [
    { id: "hcl_mg", name: "盐酸-镁粉反应", reagent: "浓 HCl + 镁粉", target: "黄酮类 (黄芩苷 / 槲皮素 / 芦丁 / 橙皮苷)", catMatch: /黄酮/, base: [254, 243, 199], targetRgb: [220, 38, 38], dropColor: "#e2e8f0", mode: "bubbles", mech: "Mg + 2HCl → MgCl₂ + H₂↑；新生 [H] 还原黄酮 4-位羰基生成花色素盐，溶液由浅黄渐变为樱红/紫红色。", desc: "镁粉与盐酸剧烈产生 H₂ 微泡上浮，樱红色羽流自液面扩散至全管（异黄酮/查耳酮通常不显色）。" },
    { id: "alcl3_fluor", name: "AlCl₃ 荧光络合", reagent: "1% AlCl₃ 乙醇液", target: "3-OH / 5-OH 黄酮 (槲皮素 / 芦丁 / 银杏黄酮)", catMatch: /黄酮/, base: [248, 250, 252], targetRgb: [132, 204, 22], dropColor: "#bef264", mode: "cloud", mech: "Al³⁺ 与黄酮 3-OH/4-C=O 或 5-OH/4-C=O 形成稳定螯合环，UV 365 nm 下呈现强烈亮黄绿色荧光并伴随红移。", desc: "滴加三氯化铝后生成黄绿色荧光络合云团，广泛用于黄酮 TLC 检视与 UV 诊断位移。" },
    { id: "molish", name: "Molish 紫环反应", reagent: "α-萘酚 + 浓 H₂SO₄", target: "糖与苷类 (黄芩苷 / 人参皂苷 / 枸杞多糖)", catMatch: /多糖|皂苷|苷/, base: [241, 245, 249], targetRgb: [126, 34, 206], dropColor: "#c084fc", mode: "ring", mech: "浓 H₂SO₄ (ρ=1.84) 沉至管底，糖苷脱水成糠醛衍生物并与 α-萘酚在两液交界处缩合生成特征紫红环。", desc: "浓硫酸沿管壁缓加沉底，两液界面精准富集深紫红色扩散环。" },
    { id: "fecl3", name: "FeCl₃ 酚羟基络合", reagent: "1% FeCl₃ 乙醇液", target: "邻二酚羟基/鞣质 (绿原酸 / 丹酚酸 B / 五倍子)", catMatch: /苯丙素|有机酸|酚|黄酮/, base: [254, 249, 195], targetRgb: [15, 118, 110], dropColor: "#d97706", mode: "cloud", mech: "Fe³⁺ 与酚羟基/邻二酚羟基发生配位螯合，形成深墨绿/蓝黑色稳定络合物，随对流涡旋迅速扩散。", desc: "铁离子液滴冲击液面炸开墨绿色涡旋粒子云，亦可用于检查阿司匹林游离水杨酸杂质。" },
    { id: "dragendorff", name: "改良碘化铋钾", reagent: "Dragendorff 试液", target: "生物碱类 (小檗碱 / 苦参碱 / 延胡索乙素)", catMatch: /生物碱/, base: [254, 249, 195], targetRgb: [234, 88, 12], dropColor: "#ea580c", mode: "precip", mech: "质子化生物碱阳离子与 [BiI₄]⁻ 结合，瞬时析出难溶性橘红色无定形复盐沉淀并向管底沉降堆积。", desc: "滴入瞬间析出致密橘红色沉淀颗粒，重力沉降并在管底形成沉淀层（咖啡因/麻黄碱常阴性）。" },
    { id: "mayer", name: "Mayer 碘化汞钾", reagent: "Mayer 试液 (K₂HgI₄)", target: "生物碱类 (东莨菪碱 / 士的宁 / 粉防己碱)", catMatch: /生物碱/, base: [241, 245, 249], targetRgb: [226, 232, 240], dropColor: "#f8fafc", mode: "precip", mech: "酸水中生物碱阳离子与 [HgI₄]²⁻ 结合，迅速析出类白色/淡黄色絮状沉淀，灵敏度极高。", desc: "滴加后液柱中瞬间生成致密类白色微晶云雾并沉降，常与 Dragendorff 交叉验证排除假阳性。" },
    { id: "borntrager", name: "Bornträger 碱液显红", reagent: "5% NaOH 碱水", target: "游离羟基蒽醌 (大黄素 / 大黄酸 / 决明子)", catMatch: /蒽醌|醌/, base: [253, 224, 71], targetRgb: [190, 18, 60], dropColor: "#fda4af", mode: "cloud", mech: "游离酚羟基在碱液中解离形成共轭酚氧负离子，体系由亮黄迅速转为鲜明樱红/紫红色。", desc: "滴加稀碱液后游离蒽醌解离显色（番泻苷等蒽酮类须先氧化后显色）。" },
    { id: "liebermann", name: "Liebermann-Burchard", reagent: "醋酐 + 浓 H₂SO₄", target: "三萜皂苷/甾体 (人参皂苷 / 甘草酸 / 薯蓣皂苷元)", catMatch: /皂苷|三萜|甾体/, base: [248, 250, 252], targetRgb: [147, 51, 234], dropColor: "#a855f7", mode: "ring", mech: "脱水氧化形成共轭多烯碳正离子，液面界面依次呈现黄→红→紫→蓝→绿多色渐变环（三萜多止于红紫，甾体偏蓝绿）。", desc: "沿管壁缓加浓硫酸，两液界面生成特征红紫色至蓝绿色渐层环带。" },
    { id: "kedde", name: "Kedde 不饱和内酯反应", reagent: "3,5-二硝基苯甲酸 + 碱", target: "甲型强心苷/内酯 (香加皮杠柳毒苷 / 穿心莲内酯)", catMatch: /甾体|强心苷|内酯/, base: [254, 249, 195], targetRgb: [162, 28, 175], dropColor: "#e879f9", mode: "cloud", mech: "甲型强心苷 C17 五元不饱和内酯环活性亚甲基在碱性下与 3,5-二硝基苯甲酸形成紫红色梅森海默络合物。", desc: "滴加碱性试剂后溶液迅速呈现特征紫红色（乙型强心苷华蟾酥毒基六元环此反应阴性）。" },
    { id: "hydroxamate", name: "异羟肟酸铁反应", reagent: "盐酸羟胺/碱 + FeCl₃", target: "香豆素与内酯 (补骨脂素 / 蛇床子素 / 秦皮甲素)", catMatch: /香豆素|木脂素|内酯/, base: [254, 243, 199], targetRgb: [159, 18, 57], dropColor: "#fb7185", mode: "cloud", mech: "碱性下香豆素内酯环开环与羟胺缩合生成异羟肟酸，酸化后与 Fe³⁺ 络合生成特征暗紫红色配合物。", desc: "专用于检识香豆素、萜内酯等内酯环结构，色泽深沉稳定。" },
    { id: "vanillin", name: "香草醛-浓硫酸显色", reagent: "1% 香草醛浓硫酸", target: "挥发油/萜类/皂苷 (薄荷脑 / 青蒿素 / 人参皂苷)", catMatch: /挥发油|萜|皂苷/, base: [248, 250, 252], targetRgb: [109, 40, 217], dropColor: "#8b5cf6", mode: "cloud", mech: "强酸脱水使萜醇/皂苷形成碳正离子，与香草醛芳醛缩合生成深紫红色至蓝紫色共轭发色体。", desc: "中药 TLC 最常用通用显色剂之一，105℃ 加热后紫红色斑点极为鲜明。" },
    { id: "fehling", name: "Fehling 还原糖沉淀", reagent: "斐林试液 A+B (热)", target: "水解多糖/还原糖 (枸杞多糖 / 黄芪多糖 / 石斛多糖)", catMatch: /多糖|氰苷/, base: [191, 219, 254], targetRgb: [180, 83, 9], dropColor: "#ea580c", mode: "precip", mech: "多糖酸水解产生的游离醛糖将碱性酒石酸铜中的 Cu²⁺（蓝色）还原为砖红色氧化亚铜（Cu₂O）沉淀。", desc: "深蓝色溶液加热滴加后迅速褪蓝并析出致密砖红色 Cu₂O 沉淀颗粒沉降管底。" }
  ];

  var MOL_CATEGORIES = [
    { id: "all", label: "全部" },
    { id: "黄酮", label: "黄酮" },
    { id: "挥发油", label: "挥发油与单萜" },
    { id: "内酯", label: "萜内酯与环烯醚萜" },
    { id: "生物碱", label: "生物碱" },
    { id: "醌", label: "蒽醌与醌类" },
    { id: "香豆素", label: "香豆素与木脂素" },
    { id: "苯丙素", label: "苯丙素与酚酸" },
    { id: "皂苷", label: "皂苷与甾体" },
    { id: "苷多糖", label: "氰苷/核苷/多糖" }
  ];

  function matchMolCategory(m, catId) {
    if (!catId || catId === "all") return true;
    var c = String(m.category || "");
    if (catId === "黄酮") return /黄酮/.test(c);
    if (catId === "挥发油") return /挥发油|单萜|倍半萜(?!内酯)/.test(c) && !/环烯醚萜/.test(c);
    if (catId === "内酯") return /内酯|环烯醚萜|二萜/.test(c) && !/生物碱|木脂素|苯酞/.test(c);
    if (catId === "生物碱") return /生物碱/.test(c);
    if (catId === "醌") return /醌|二苯乙烯/.test(c);
    if (catId === "香豆素") return /香豆素|木脂素/.test(c) && !/黄酮木脂素/.test(c);
    if (catId === "苯丙素") return /苯丙素|有机酸|酚酸|二芳基庚烷|酚苷|鞣质/.test(c);
    if (catId === "皂苷") return /皂苷|三萜|甾体|强心苷/.test(c);
    if (catId === "苷多糖") return /氰苷|核苷|多糖/.test(c);
    return true;
  }

  var modalEl = null;
  var activeTab = "mol3d";
  var molKey = "tanshinone";
  var molCatFilter = "all";
  var molSearchQuery = "";
  var selectedTopicId = "";
  var molMode = "ballstick"; // ballstick | wireframe | spacefill
  var showHydrogens = true;
  var autoRotate = true;
  var rotX = 0.32;
  var rotY = 0.58;
  var zoom = 1.0;
  var dragging = false;
  var lastX = 0;
  var lastY = 0;
  var hoverAtomIdx = -1;
  var hoverGroupId = null;
  var lockedGroupId = null;
  var molRaf = null;
  var molRenderToken = 0;
  var rxnRenderToken = 0;
  var activePointers = new Map();
  var pinchStartDist = 0;
  var pinchStartZoom = 1.0;
  var lastTipKey = "";
  var fpsFrames = 0;
  var fpsLastTs = 0;
  var currentFps = 60;

  var rxnIdx = 0;
  var rxnRaf = null;
  var rxnState = { progress: 0, drops: [], particles: [], ripples: [], bubbles: [] };

  function getMolRadius(m) {
    if (!m || !m.atoms || !m.atoms.length) return 4;
    if (m._maxR) return m._maxR;
    var maxR = 1;
    for (var i = 0; i < m.atoms.length; i++) {
      var a = m.atoms[i];
      var d = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
      if (d > maxR) maxR = d;
    }
    m._maxR = maxR;
    return maxR;
  }

  function getGroupMap(m) {
    if (!m) return {};
    if (m._groupMap) return m._groupMap;
    var map = {};
    (m.groups || []).forEach(function (g) { map[g.id] = g; });
    m._groupMap = map;
    return map;
  }

  function resolveMolKey(input) {
    var mols = getMolecules();
    if (!input) return molKey;
    if (mols[input]) return input;
    var s = String(input);
    var keys = Object.keys(mols);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var m = mols[k];
      if (m.shortName === s || m.name === s) return k;
      if (m.aliases && m.aliases.some(function (al) { return s.indexOf(al) !== -1; })) return k;
      if (m.herbs && m.herbs.some(function (hb) { return s.indexOf(hb) !== -1; })) return k;
    }
    return mols[molKey] ? molKey : (keys[0] || "menthol");
  }

  function ensureModal() {
    if (modalEl) return modalEl;
    var molTotal = Object.keys(getMolecules()).length || 77;
    var topicTotal = (window.TCM_LAB_API && window.TCM_LAB_API.getCounts && window.TCM_LAB_API.getCounts().topics) || 136;
    var ICO_MOL = '<svg class="craft-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="2.5"/><circle cx="6" cy="6" r="1.8"/><circle cx="18" cy="6" r="1.8"/><circle cx="6" cy="18" r="1.8"/><circle cx="18" cy="18" r="1.8"/><path d="m10.2 10.2-2.9-2.9M13.8 10.2l2.9-2.9M10.2 13.8l-2.9 2.9M13.8 13.8l2.9 2.9"/></svg>';
    var ICO_FLASK = '<svg class="craft-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6"/><path d="M10 3v5.4L5.6 16.5A3 3 0 0 0 8.2 21h7.6a3 3 0 0 0 2.6-4.5L14 8.4V3"/></svg>';
    modalEl = document.createElement("div");
    modalEl.id = "tcmV20VisualModal";
    modalEl.className = "no-print fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-5";
    modalEl.innerHTML =
      '<div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-6xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">' +
        '<div class="px-4 sm:px-5 py-3 bg-gradient-to-r from-[#062922] via-[#0a4538] to-[#0f6b58] text-white flex items-center justify-between gap-3">' +
          '<div class="flex items-center gap-2 min-w-0">' +
            '<span class="shrink-0 px-2 py-0.5 rounded-md bg-emerald-400/20 text-emerald-200 text-[11px] font-bold">PubChem 3D</span>' +
            '<h3 class="text-sm sm:text-base font-extrabold truncate">三维分子结构库（' + molTotal + ' 构象 · 贯通 ' + topicTotal + ' 题库）与粒子显色实验室</h3>' +
          '</div>' +
          '<button type="button" id="v20BtnClose" aria-label="关闭弹窗" class="shrink-0 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-lg leading-none">×</button>' +
        '</div>' +
        '<div class="px-4 sm:px-5 pt-2.5 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-[#f6f8f7] dark:bg-slate-800/70">' +
          '<div class="inline-flex p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold gap-1">' +
            '<button type="button" data-v20-tab="mol3d" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition">' + ICO_MOL + '<span>三维分子结构库 (' + molTotal + ')</span></button>' +
            '<button type="button" data-v20-tab="particles" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition">' + ICO_FLASK + '<span>粒子显色实验室 (' + PARTICLE_REACTIONS.length + ')</span></button>' +
          '</div>' +
          '<span id="v20HeaderMeta" class="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">PubChem 真实 3D 构象 · 悬停/点击官能团高亮 · 直连 ' + ((window.TCM_LAB_API && window.TCM_LAB_API.getCounts) ? window.TCM_LAB_API.getCounts().literature : 100) + ' 篇实证文献</span>' +
        '</div>' +
        '<div id="v20Body" class="flex-1 overflow-y-auto p-3.5 sm:p-5"></div>' +
      '</div>';

    document.body.appendChild(modalEl);

    modalEl.querySelector("#v20BtnClose").addEventListener("click", closeModal);
    modalEl.addEventListener("click", function (e) {
      if (e.target === modalEl) closeModal();
      var tabBtn = e.target.closest("[data-v20-tab]");
      if (tabBtn) {
        activeTab = tabBtn.getAttribute("data-v20-tab");
        renderModalBody();
      }
    });
    return modalEl;
  }

  function stopLoops() {
    molRenderToken++;
    rxnRenderToken++;
    if (molRaf) { cancelAnimationFrame(molRaf); molRaf = null; }
    if (rxnRaf) { cancelAnimationFrame(rxnRaf); rxnRaf = null; }
  }

  function closeModal() {
    stopLoops();
    dragging = false;
    activePointers.clear();
    if (modalEl) {
      modalEl.classList.add("hidden");
      modalEl.classList.remove("flex");
    }
  }

  function openModal(tab, presetMol) {
    ensureModal();
    if (tab) activeTab = tab;
    if (presetMol) {
      molKey = resolveMolKey(presetMol);
      lockedGroupId = null;
      hoverGroupId = null;
      hoverAtomIdx = -1;
      zoom = 1.0;
    }
    modalEl.classList.remove("hidden");
    modalEl.classList.add("flex");
    renderModalBody();
    try {
      window.dispatchEvent(new CustomEvent("tcm:achievement-event", { detail: { type: activeTab === "mol3d" ? "mol3d_view" : "particle_open", key: molKey } }));
    } catch (_) {}
  }

  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modalEl && !modalEl.classList.contains("hidden")) closeModal();
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      stopLoops();
    } else if (modalEl && !modalEl.classList.contains("hidden")) {
      renderModalBody();
    }
  });

  function renderModalBody() {
    stopLoops();
    var body = modalEl.querySelector("#v20Body");
    modalEl.querySelectorAll("[data-v20-tab]").forEach(function (b) {
      var on = b.getAttribute("data-v20-tab") === activeTab;
      b.className = "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition " + (on ? "bg-[#0f4c3a] text-white" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white");
    });

    if (activeTab === "mol3d") renderMol3dView(body);
    else renderParticlesView(body);
  }

  function escHtml(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function findTopicsForMol(m) {
    var api = window.TCM_LAB_API;
    if (!api || !api.getAllTopics) return [];
    var all = api.getAllTopics();
    var herbTokens = (m.herbs || [m.herb]).map(function (h) { return String(h).split(/[（(·/\s]/)[0].trim(); }).filter(Boolean);
    var aliasTokens = (m.aliases || [m.shortName]).filter(function (a) { return String(a).length >= 2; });
    return all.filter(function (t) {
      var hay = (t.herb || "") + " " + (t.compound || "");
      return herbTokens.some(function (hk) { return hay.indexOf(hk) !== -1; }) ||
        aliasTokens.some(function (ak) { return hay.indexOf(ak) !== -1; });
    }).slice(0, 6);
  }

  function renderMol3dView(container) {
    stopLoops();
    var myToken = ++molRenderToken;
    var mols = getMolecules();
    var keys = Object.keys(mols);
    if (!keys.length) {
      container.innerHTML = '<div class="p-8 text-center text-sm text-slate-500">分子结构数据加载中，请稍候重试。</div>';
      return;
    }
    if (!mols[molKey]) molKey = keys[0];
    var m = mols[molKey];
    var gMap = getGroupMap(m);
    lastTipKey = "";

    var allTopics = (window.TCM_LAB_API && window.TCM_LAB_API.getAllTopics) ? window.TCM_LAB_API.getAllTopics() : [];
    var matchedTopics = findTopicsForMol(m);
    var activeTopic = selectedTopicId
      ? (window.TCM_LAB_API && window.TCM_LAB_API.getTopicById ? window.TCM_LAB_API.getTopicById(selectedTopicId) : null)
      : (matchedTopics[0] && window.TCM_LAB_API && window.TCM_LAB_API.getTopicById ? window.TCM_LAB_API.getTopicById(matchedTopics[0].id) : null);
    var relLit = (window.TCM_LAB_API && window.TCM_LAB_API.findLiteratureForTopic)
      ? window.TCM_LAB_API.findLiteratureForTopic(activeTopic || { herb: m.herb, compound: m.shortName, category: m.category }, 4)
      : [];

    function getFilteredKeys() {
      var q = String(molSearchQuery || "").trim().toLowerCase();
      return keys.filter(function (k) {
        var item = mols[k];
        if (!matchMolCategory(item, molCatFilter)) return false;
        if (!q) return true;
        var hay = [
          k, item.name, item.shortName, item.herb, item.category, item.formula, String(item.cid || ""),
          (item.herbs || []).join(" "), (item.aliases || []).join(" ")
        ].join(" ").toLowerCase();
        return hay.indexOf(q) !== -1;
      });
    }

    function buildMolBtnHtml(filteredKeys) {
      if (!filteredKeys.length) {
        return '<div class="text-xs text-slate-500 py-2 px-1">未匹配到分子，可清空关键词或从右侧「' + (allTopics.length || 144) + ' 味题库直选」切换。</div>';
      }
      return filteredKeys.map(function (k) {
        var on = k === molKey;
        var item = mols[k];
        return '<button type="button" data-v20-mol="' + k + '" class="px-2.5 py-1 rounded-lg text-[11.5px] font-bold border transition whitespace-nowrap ' +
          (on
            ? 'bg-[#0f4c3a] text-white border-[#0f4c3a] shadow-xs'
            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-[#0f4c3a]') + '">' +
          escHtml(item.herb.split(" / ")[0]) + " · " + escHtml(item.shortName) + "</button>";
      }).join("");
    }

    var filteredKeys = getFilteredKeys();
    var catPillsHtml = MOL_CATEGORIES.map(function (cat) {
      var cnt = keys.filter(function (k) { return matchMolCategory(mols[k], cat.id); }).length;
      var on = molCatFilter === cat.id;
      return '<button type="button" data-v20-cat="' + cat.id + '" class="px-2.5 py-1 rounded-md text-[11px] font-bold border transition ' +
        (on ? 'bg-[#111d19] text-white border-[#111d19] dark:bg-[#5fb89c] dark:text-[#091713]' : 'bg-[#f7f6f2] dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#0f4c3a]') + '">' +
        cat.label + ' <span class="opacity-65 tabular-nums">(' + cnt + ')</span></button>';
    }).join("");

    var topicOptionsHtml = '<option value="">全题库直选（' + allTopics.length + ' 味药材课题）</option>' +
      allTopics.map(function (t) {
        var sel = activeTopic && activeTopic.id === t.id ? " selected" : "";
        return '<option value="' + escHtml(t.id) + '"' + sel + '>' + escHtml(t.herb) + ' — ' + escHtml(t.compound || t.category) + '</option>';
      }).join("");

    var modeBtns = [
      ["ballstick", "球棍"],
      ["wireframe", "骨架"],
      ["spacefill", "空间填充"]
    ].map(function (pair) {
      var on = pair[0] === molMode;
      return '<button type="button" data-v20-mode="' + pair[0] + '" class="px-2.5 py-1.5 rounded-lg text-xs font-bold border transition ' +
        (on
          ? 'bg-[#9a4a24] text-white border-[#9a4a24]'
          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-[#9a4a24]') + '">' + pair[1] + "</button>";
    }).join("");

    var fgChips = (m.groups || []).map(function (g) {
      var active = lockedGroupId === g.id;
      return '<button type="button" data-v20-fg="' + g.id + '" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ' +
        (active
          ? 'bg-amber-50 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 border-amber-400 ring-1 ring-amber-400'
          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-500') + '">' +
        '<span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:' + g.color + '"></span>' +
        '<span>' + escHtml(g.name) + '</span>' +
        '<span class="opacity-60 text-[10px] tabular-nums">(' + g.atoms.length + ')</span>' +
      '</button>';
    }).join("");

    var heavyCount = m.atoms.filter(function (a) { return a[3] !== "H"; }).length;
    var specCat = /生物碱/.test(m.category) ? "生物碱" : (/醌/.test(m.category) ? "蒽醌与醌类" : (/苯丙素|有机酸|酚酸|鞣质/.test(m.category) ? "酚酸类" : (/香豆素|木脂素/.test(m.category) ? "香豆素与木脂素" : (/挥发油|单萜/.test(m.category) ? "挥发油与萜类" : (/内酯|环烯醚萜|二萜/.test(m.category) ? "萜类内酯与环烯醚萜" : (/皂苷|三萜/.test(m.category) ? "皂苷与三萜" : (/甾体|强心苷/.test(m.category) ? "甾体与强心苷" : (/氰苷/.test(m.category) ? "氰苷类" : (/多糖|核苷/.test(m.category) ? "多糖类" : "黄酮")))))))));

    container.innerHTML =
      '<div class="space-y-3">' +
        '<div class="p-3 rounded-xl bg-[#f7f6f2] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2">' +
          '<div class="flex flex-wrap items-center gap-2">' +
            '<input type="text" id="v20MolSearch" value="' + escHtml(molSearchQuery) + '" placeholder="检索 ' + keys.length + ' 项分子 / ' + (allTopics.length || 144) + ' 味药材 / 分子式 / CID..." class="flex-1 min-w-[200px] px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#0f4c3a]" />' +
            '<select id="v20TopicJumpSelect" class="max-w-[260px] px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200">' + topicOptionsHtml + '</select>' +
            '<div class="flex flex-wrap items-center gap-1">' +
              modeBtns +
              '<button type="button" id="v20BtnToggleH" class="px-2.5 py-1.5 rounded-lg text-xs font-bold border transition ' +
                (showHydrogens ? 'bg-[#111d19] text-white border-[#111d19] dark:bg-slate-200 dark:text-slate-900' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700') + '">' +
                (showHydrogens ? '隐 H 原子' : '显 H 原子') + '</button>' +
            '</div>' +
          '</div>' +
          '<div class="flex flex-wrap gap-1" role="tablist" aria-label="化学大类筛选">' + catPillsHtml + '</div>' +
          '<div id="v20MolChipGrid" class="flex flex-wrap gap-1.5 max-h-[98px] overflow-y-auto custom-scroll py-0.5 pr-1" role="tablist" aria-label="核心成分选择">' + buildMolBtnHtml(filteredKeys) + '</div>' +
        '</div>' +

        '<div class="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">' +
          '<div class="lg:col-span-7 relative rounded-2xl bg-gradient-to-br from-[#061c19] via-[#0a2c27] to-[#0f3d35] border border-emerald-400/25 overflow-hidden select-none">' +
            '<canvas id="v20MolCanvas" class="w-full h-[310px] sm:h-full min-h-[320px] sm:min-h-[450px] block cursor-grab active:cursor-grabbing" style="touch-action:none;"></canvas>' +
            '<div id="v20MolHoverTip" class="pointer-events-none absolute top-3 left-3 right-24 sm:right-28 px-3 py-2 rounded-xl bg-slate-950/75 backdrop-blur-xs border border-emerald-300/25 text-xs text-emerald-100 leading-snug">' +
              '<div class="font-extrabold text-emerald-200">拖拽 360° 旋转 · 滚轮/双指缩放 · 悬停原子高亮官能团</div>' +
              '<div class="text-[11px] text-slate-300 mt-0.5">当前显示：' + escHtml(m.name) + '（' + m.atoms.length + ' 原子 / ' + m.bonds.length + ' 键）</div>' +
            '</div>' +
            '<div class="absolute top-3 right-3 flex flex-col gap-1.5">' +
              '<button type="button" id="v20BtnZoomIn" title="放大" class="w-8 h-8 rounded-lg bg-slate-950/65 hover:bg-slate-900 text-white border border-white/15 font-extrabold text-sm">+</button>' +
              '<button type="button" id="v20BtnZoomOut" title="缩小" class="w-8 h-8 rounded-lg bg-slate-950/65 hover:bg-slate-900 text-white border border-white/15 font-extrabold text-sm">−</button>' +
              '<button type="button" id="v20BtnAutoRot" title="切换自动旋转" class="w-8 h-8 rounded-lg bg-slate-950/65 hover:bg-slate-900 text-white border border-white/15 text-xs">' + (autoRotate ? '⏸' : '▶') + '</button>' +
              '<button type="button" id="v20BtnResetView" title="重置视角" class="w-8 h-8 rounded-lg bg-slate-950/65 hover:bg-slate-900 text-white border border-white/15 text-xs">↺</button>' +
            '</div>' +
            '<div class="pointer-events-none absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[10.5px] text-emerald-200/80 font-mono">' +
              '<span>CID ' + m.cid + ' · 重原子 ' + heavyCount + ' / 总原子 ' + m.atoms.length + '</span>' +
              '<span id="v20FpsBadge">60 FPS</span>' +
            '</div>' +
          "</div>" +

          '<div class="lg:col-span-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 flex flex-col justify-between gap-2.5 text-xs max-h-[500px] overflow-y-auto custom-scroll">' +
            '<div class="space-y-2.5">' +
              '<div class="flex flex-wrap items-center justify-between gap-1.5">' +
                '<span class="inline-block px-2.5 py-0.5 rounded-md bg-[#f2f1ec] dark:bg-emerald-900/40 text-[#0f4c3a] dark:text-emerald-300 font-bold">' + escHtml(m.formula) + ' · ' + escHtml(m.category) + '</span>' +
                '<a href="' + m.pubchemUrl + '" target="_blank" rel="noopener noreferrer" class="text-[11px] font-bold text-[#0f4c3a] dark:text-teal-300 hover:underline">PubChem CID ' + m.cid + ' ↗</a>' +
              '</div>' +
              '<h4 class="text-base font-extrabold text-slate-900 dark:text-white leading-tight">' + escHtml(m.name) + '</h4>' +
              '<p class="text-slate-600 dark:text-slate-300 leading-relaxed">' + escHtml(m.desc) + '</p>' +

              '<div class="grid grid-cols-3 gap-1.5">' +
                '<div class="p-2 rounded-lg bg-[#f7f6f2] dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-700 text-center">' +
                  '<div class="text-[10px] text-slate-500 dark:text-slate-400">分子量</div>' +
                  '<div class="font-extrabold text-slate-800 dark:text-slate-100 tabular-nums">' + m.mw + '</div>' +
                '</div>' +
                '<div class="p-2 rounded-lg bg-[#f7f6f2] dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-700 text-center">' +
                  '<div class="text-[10px] text-slate-500 dark:text-slate-400">XLogP3</div>' +
                  '<div class="font-extrabold text-slate-800 dark:text-slate-100 tabular-nums">' + m.xlogp + '</div>' +
                '</div>' +
                '<div class="p-2 rounded-lg bg-[#f7f6f2] dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-700 text-center">' +
                  '<div class="text-[10px] text-slate-500 dark:text-slate-400">TPSA (Å²)</div>' +
                  '<div class="font-extrabold text-slate-800 dark:text-slate-100 tabular-nums">' + m.tpsa + '</div>' +
                '</div>' +
              '</div>' +

              '<div class="space-y-1.5">' +
                '<div class="flex items-center justify-between">' +
                  '<span class="font-extrabold text-slate-800 dark:text-slate-200">官能团高亮检索（悬停或点击锁定）</span>' +
                  (lockedGroupId ? '<button type="button" id="v20BtnClearFg" class="text-[10.5px] text-[#9a4a24] font-bold hover:underline">清除锁定</button>' : '') +
                '</div>' +
                '<div class="flex flex-wrap gap-1.5" id="v20FgChipList">' + fgChips + '</div>' +
              '</div>' +

              (activeTopic ? (
                '<div class="p-2.5 rounded-xl bg-[#f7f6f2] dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-700 space-y-1">' +
                  '<div class="flex items-center justify-between gap-2">' +
                    '<span class="font-extrabold text-[#0f4c3a] dark:text-emerald-300 text-[11px]">关联题库：' + escHtml(activeTopic.herb) + '</span>' +
                    '<div class="flex gap-1">' +
                      '<button type="button" id="v20BtnOpenSpectra" class="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-[10.5px] font-bold text-slate-700 dark:text-slate-200 hover:border-[#0f4c3a]">看四谱 ↗</button>' +
                      '<button type="button" id="v20BtnLoadTopic" class="px-2 py-0.5 rounded-md bg-[#0f4c3a] text-white text-[10.5px] font-bold">载入工坊 →</button>' +
                    '</div>' +
                  '</div>' +
                  '<div class="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">' + escHtml(activeTopic.pharmacopoeia || activeTopic.pharm || activeTopic.chemistry || activeTopic.compound) + '</div>' +
                '</div>'
              ) : '') +

              (relLit.length ? (
                '<div class="p-2.5 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700 space-y-1">' +
                  '<div class="font-extrabold text-slate-800 dark:text-slate-200 text-[11px]">关联实证文献（' + ((window.TCM_LAB_API && window.TCM_LAB_API.getCounts) ? window.TCM_LAB_API.getCounts().literature : 100) + ' 篇文献库匹配）</div>' +
                  relLit.map(function (lit) {
                    return '<div class="text-[10.5px] text-slate-600 dark:text-slate-300 leading-snug pl-2 border-l-2 border-[#0f4c3a]/40">' + escHtml(lit.text) + '</div>';
                  }).join("") +
                '</div>'
              ) : '') +
            '</div>' +

            '<div class="p-2 rounded-lg bg-[#f7f6f2] dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-2 text-[10.5px] font-bold text-slate-700 dark:text-slate-300">' +
              '<span>CPK (HBD ' + m.hbd + '/HBA ' + m.hba + ')</span>' +
              '<div class="flex items-center gap-2">' +
                '<span><i class="inline-block w-2 h-2 rounded-full bg-[#475569] mr-1"></i>C</span>' +
                '<span><i class="inline-block w-2 h-2 rounded-full bg-[#dc2626] mr-1"></i>O</span>' +
                '<span><i class="inline-block w-2 h-2 rounded-full bg-[#2563eb] mr-1"></i>N</span>' +
                '<span><i class="inline-block w-2 h-2 rounded-full bg-[#e2e8f0] border border-slate-400 mr-1"></i>H</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    // Bind molecule chip clicks (delegated so live search updates never lose listeners)
    var chipGrid = container.querySelector("#v20MolChipGrid");
    if (chipGrid) {
      chipGrid.addEventListener("click", function (e) {
        var b = e.target.closest("[data-v20-mol]");
        if (!b) return;
        molKey = b.getAttribute("data-v20-mol");
        selectedTopicId = "";
        lockedGroupId = null;
        hoverGroupId = null;
        hoverAtomIdx = -1;
        zoom = 1.0;
        renderMol3dView(container);
      });
    }

    container.querySelectorAll("[data-v20-cat]").forEach(function (b) {
      b.addEventListener("click", function () {
        molCatFilter = b.getAttribute("data-v20-cat") || "all";
        var fks = getFilteredKeys();
        if (fks.length && fks.indexOf(molKey) === -1) {
          molKey = fks[0];
          selectedTopicId = "";
        }
        renderMol3dView(container);
      });
    });

    var searchInp = container.querySelector("#v20MolSearch");
    if (searchInp) {
      searchInp.addEventListener("input", function () {
        molSearchQuery = searchInp.value;
        if (chipGrid) chipGrid.innerHTML = buildMolBtnHtml(getFilteredKeys());
      });
    }

    var topicSel = container.querySelector("#v20TopicJumpSelect");
    if (topicSel) {
      topicSel.addEventListener("change", function () {
        var tid = topicSel.value;
        if (!tid) return;
        selectedTopicId = tid;
        var tObj = window.TCM_LAB_API && window.TCM_LAB_API.getTopicById ? window.TCM_LAB_API.getTopicById(tid) : null;
        if (tObj) {
          var regKey = window.TCM_MOL3D_REGISTRY && window.TCM_MOL3D_REGISTRY.matchKey((tObj.herb || "") + " " + (tObj.compound || ""));
          molKey = (regKey && mols[regKey]) ? regKey : resolveMolKey((tObj.herb || "") + " " + (tObj.compound || ""));
          molCatFilter = "all";
          lockedGroupId = null;
          hoverGroupId = null;
          zoom = 1.0;
          renderMol3dView(container);
        }
      });
    }

    var btnLoadTopic = container.querySelector("#v20BtnLoadTopic");
    if (btnLoadTopic && activeTopic) {
      btnLoadTopic.addEventListener("click", function () {
        closeModal();
        if (window.TCM_LAB_API && window.TCM_LAB_API.selectTopic) {
          window.TCM_LAB_API.selectTopic(activeTopic.id, 1);
        }
        if (window.TCM_V16_PORTAL && window.TCM_V16_PORTAL.go) {
          window.TCM_V16_PORTAL.go("workflow", { step: 1 });
        }
      });
    }

    var btnOpenSpectra = container.querySelector("#v20BtnOpenSpectra");
    if (btnOpenSpectra) {
      btnOpenSpectra.addEventListener("click", function () {
        closeModal();
        if (window.TCM_V21_SPECTRA_LAB && window.TCM_V21_SPECTRA_LAB.open) {
          window.TCM_V21_SPECTRA_LAB.open(specCat);
        }
      });
    }
    container.querySelectorAll("[data-v20-mode]").forEach(function (b) {
      b.addEventListener("click", function () {
        molMode = b.getAttribute("data-v20-mode");
        renderMol3dView(container);
      });
    });
    var btnH = container.querySelector("#v20BtnToggleH");
    if (btnH) {
      btnH.addEventListener("click", function () {
        showHydrogens = !showHydrogens;
        renderMol3dView(container);
      });
    }
    var btnClearFg = container.querySelector("#v20BtnClearFg");
    if (btnClearFg) {
      btnClearFg.addEventListener("click", function () {
        lockedGroupId = null;
        renderMol3dView(container);
      });
    }

    container.querySelectorAll("[data-v20-fg]").forEach(function (chip) {
      var gid = chip.getAttribute("data-v20-fg");
      chip.addEventListener("mouseenter", function () {
        hoverGroupId = gid;
        hoverAtomIdx = -1;
        updateTooltip(gMap, m);
      });
      chip.addEventListener("mouseleave", function () {
        hoverGroupId = null;
        updateTooltip(gMap, m);
      });
      chip.addEventListener("click", function () {
        lockedGroupId = (lockedGroupId === gid) ? null : gid;
        renderMol3dView(container);
      });
    });

    var canvas = container.querySelector("#v20MolCanvas");
    var tip = container.querySelector("#v20MolHoverTip");
    var fpsBadge = container.querySelector("#v20FpsBadge");
    var ctx = canvas.getContext("2d");
    var projectedAtoms = [];
    var dpr = 1;
    var cssW = 600;
    var cssH = 380;

    function syncCanvasSize() {
      var rect = canvas.getBoundingClientRect();
      cssW = Math.max(260, Math.round(rect.width || 600));
      cssH = Math.max(240, Math.round(rect.height || 360));
      var maxDpr = cssW < 480 ? 1.5 : 2;
      dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      var targetW = Math.round(cssW * dpr);
      var targetH = Math.round(cssH * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    syncCanvasSize();

    function updateTooltip(groupMap, mol) {
      var activeGid = hoverGroupId || lockedGroupId;
      var key = (activeGid || "none") + "|" + hoverAtomIdx;
      if (key === lastTipKey) return;
      lastTipKey = key;
      if (activeGid && groupMap[activeGid]) {
        var g = groupMap[activeGid];
        var atomLabel = "";
        if (hoverAtomIdx >= 0 && mol.atoms[hoverAtomIdx]) {
          var el = mol.atoms[hoverAtomIdx][3];
          atomLabel = " · " + (ATOM_STYLE[el] ? ATOM_STYLE[el].name : el);
        }
        tip.innerHTML =
          '<div class="font-extrabold flex items-center gap-1.5" style="color:' + g.color + '">' +
            '<span class="inline-block w-2.5 h-2.5 rounded-full shrink-0" style="background:' + g.color + '"></span>' +
            '<span>官能团高亮：' + g.name + atomLabel + '（共 ' + g.atoms.length + ' 原子）</span>' +
          '</div>' +
          '<div class="text-[11px] text-slate-200 mt-0.5">' + g.note + '</div>';
      } else {
        tip.innerHTML =
          '<div class="font-extrabold text-emerald-200">拖拽 360° 旋转 · 滚轮/双指缩放 · 悬停原子高亮官能团</div>' +
          '<div class="text-[11px] text-slate-300 mt-0.5">当前显示：' + mol.name + '（' + mol.atoms.length + ' 原子 / ' + mol.bonds.length + ' 键）</div>';
      }
    }
    updateTooltip(gMap, m);

    container.querySelector("#v20BtnZoomIn").addEventListener("click", function () {
      zoom = Math.min(2.2, zoom * 1.18);
    });
    container.querySelector("#v20BtnZoomOut").addEventListener("click", function () {
      zoom = Math.max(0.55, zoom / 1.18);
    });
    container.querySelector("#v20BtnAutoRot").addEventListener("click", function (e) {
      autoRotate = !autoRotate;
      e.currentTarget.textContent = autoRotate ? "⏸" : "▶";
    });
    container.querySelector("#v20BtnResetView").addEventListener("click", function () {
      rotX = 0.32;
      rotY = 0.58;
      zoom = 1.0;
      lockedGroupId = null;
      hoverGroupId = null;
      hoverAtomIdx = -1;
      updateTooltip(gMap, m);
    });

    function hitTestAtom(mx, my) {
      for (var i = projectedAtoms.length - 1; i >= 0; i--) {
        var p = projectedAtoms[i];
        var dx = mx - p.sx;
        var dy = my - p.sy;
        var hitR = Math.max(p.r + 5, 11);
        if (dx * dx + dy * dy <= hitR * hitR) return p;
      }
      return null;
    }

    canvas.addEventListener("pointerdown", function (e) {
      canvas.setPointerCapture(e.pointerId);
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (activePointers.size === 1) {
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        var rect = canvas.getBoundingClientRect();
        var hit = hitTestAtom(e.clientX - rect.left, e.clientY - rect.top);
        if (hit && e.pointerType === "touch") {
          hoverAtomIdx = hit.idx;
          hoverGroupId = hit.fg;
          updateTooltip(gMap, m);
        }
      } else if (activePointers.size === 2) {
        dragging = false;
        var pts = Array.from(activePointers.values());
        pinchStartDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
        pinchStartZoom = zoom;
      }
    });

    canvas.addEventListener("pointerup", function (e) {
      activePointers.delete(e.pointerId);
      if (activePointers.size < 2) pinchStartDist = 0;
      if (activePointers.size === 0) dragging = false;
    });
    canvas.addEventListener("pointercancel", function (e) {
      activePointers.delete(e.pointerId);
      dragging = false;
    });

    canvas.addEventListener("pointermove", function (e) {
      if (activePointers.has(e.pointerId)) {
        activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }
      if (activePointers.size === 2 && pinchStartDist > 0) {
        var pts = Array.from(activePointers.values());
        var curDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        zoom = Math.max(0.55, Math.min(2.2, pinchStartZoom * (curDist / pinchStartDist)));
        return;
      }
      if (dragging) {
        rotY += (e.clientX - lastX) * 0.011;
        rotX += (e.clientY - lastY) * 0.011;
        lastX = e.clientX;
        lastY = e.clientY;
        return;
      }
      var rect = canvas.getBoundingClientRect();
      var hit = hitTestAtom(e.clientX - rect.left, e.clientY - rect.top);
      if (hit) {
        hoverAtomIdx = hit.idx;
        hoverGroupId = hit.fg;
      } else {
        hoverAtomIdx = -1;
        hoverGroupId = null;
      }
      updateTooltip(gMap, m);
    });

    canvas.addEventListener("pointerleave", function () {
      if (!dragging) {
        hoverAtomIdx = -1;
        hoverGroupId = null;
        updateTooltip(gMap, m);
      }
    });

    canvas.addEventListener("wheel", function (e) {
      e.preventDefault();
      var factor = e.deltaY < 0 ? 1.09 : 0.92;
      zoom = Math.max(0.55, Math.min(2.2, zoom * factor));
    }, { passive: false });

    var molRadius = getMolRadius(m);
    fpsFrames = 0;
    fpsLastTs = performance.now();
    var lastFrameTs = fpsLastTs;

    function drawMol(ts) {
      if (myToken !== molRenderToken) return;
      var dt = Math.min(0.05, Math.max(0, (ts - lastFrameTs) / 1000));
      lastFrameTs = ts;
      if (autoRotate && !dragging && !hoverGroupId) rotY += 0.30 * dt;
      syncCanvasSize();
      ctx.clearRect(0, 0, cssW, cssH);

      var cx = cssW / 2;
      var cy = cssH * (cssW < 420 ? 0.61 : 0.54);
      var baseScale = (Math.min(cssW, cssH) * 0.36 / Math.max(2.6, molRadius)) * zoom;
      var cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      var cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      var camDist = molRadius * 4.2 + 12;
      var activeGid = hoverGroupId || lockedGroupId;

      var pts = new Array(m.atoms.length);
      var visibleAtoms = [];
      for (var i = 0; i < m.atoms.length; i++) {
        var a = m.atoms[i];
        var el = a[3];
        if (!showHydrogens && el === "H") {
          pts[i] = null;
          continue;
        }
        var x1 = a[0] * cosY - a[2] * sinY;
        var z1 = a[0] * sinY + a[2] * cosY;
        var y2 = a[1] * cosX - z1 * sinX;
        var z2 = a[1] * sinX + z1 * cosX;
        var persp = camDist / Math.max(4, camDist - z2);
        var st = ATOM_STYLE[el] || ATOM_STYLE.C;
        var r;
        if (molMode === "spacefill") {
          r = st.vdwR * baseScale * 0.56 * persp;
        } else if (molMode === "wireframe") {
          r = Math.max(2.2, 0.14 * baseScale * persp);
        } else {
          r = st.covR * baseScale * persp;
        }
        var pt = {
          kind: "atom",
          idx: i,
          el: el,
          fg: a[4],
          sx: cx + x1 * baseScale * persp,
          sy: cy - y2 * baseScale * persp,
          z: z2,
          r: r,
          st: st
        };
        pts[i] = pt;
        visibleAtoms.push(pt);
      }

      // Build depth-sorted draw queue (bonds + atoms interleaved by z)
      var drawList = visibleAtoms.slice();
      if (molMode !== "spacefill") {
        for (var bi = 0; bi < m.bonds.length; bi++) {
          var b = m.bonds[bi];
          var p1 = pts[b[0]];
          var p2 = pts[b[1]];
          if (!p1 || !p2) continue;
          drawList.push({
            kind: "bond",
            p1: p1,
            p2: p2,
            order: b[2] || 1,
            z: (p1.z + p2.z) * 0.5 - 0.05
          });
        }
      }
      drawList.sort(function (u, v) { return u.z - v.z; });

      var activeColor = activeGid && gMap[activeGid] ? gMap[activeGid].color : "#fde047";

      for (var di = 0; di < drawList.length; di++) {
        var item = drawList[di];
        if (item.kind === "bond") {
          var p1 = item.p1, p2 = item.p2;
          var bondInGroup = activeGid && (p1.fg === activeGid && p2.fg === activeGid);
          var bondDim = activeGid && !bondInGroup;
          var dx = p2.sx - p1.sx;
          var dy = p2.sy - p1.sy;
          var len = Math.hypot(dx, dy) || 1;
          var nx = -dy / len;
          var ny = dx / len;
          var lw = molMode === "wireframe" ? Math.max(2.6, baseScale * 0.13) : Math.max(2.0, baseScale * 0.11);

          ctx.lineCap = "round";
          if (item.order === 2) {
            var off = Math.max(2.2, lw * 0.72);
            for (var s = -1; s <= 1; s += 2) {
              drawSplitBond(ctx, p1.sx + nx * off * s, p1.sy + ny * off * s, p2.sx + nx * off * s, p2.sy + ny * off * s, p1, p2, lw * 0.78, bondInGroup, bondDim, activeColor);
            }
          } else {
            drawSplitBond(ctx, p1.sx, p1.sy, p2.sx, p2.sy, p1, p2, lw, bondInGroup, bondDim, activeColor);
          }
        } else {
          var p = item;
          var inGroup = activeGid && p.fg === activeGid;
          var isDim = activeGid && !inGroup;
          var depthAlpha = Math.max(0.45, Math.min(1, 0.78 + p.z / (molRadius * 3.5)));
          ctx.save();
          ctx.globalAlpha = isDim ? depthAlpha * 0.34 : depthAlpha;

          if (inGroup) {
            ctx.beginPath();
            ctx.arc(p.sx, p.sy, p.r + (molMode === "wireframe" ? 5 : 4.5), 0, Math.PI * 2);
            ctx.fillStyle = activeColor + "40";
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(p.sx, p.sy, p.r, 0, Math.PI * 2);
          if (molMode === "wireframe") {
            ctx.fillStyle = inGroup ? activeColor : p.st.color;
            ctx.fill();
          } else {
            var grad = ctx.createRadialGradient(p.sx - p.r * 0.32, p.sy - p.r * 0.32, p.r * 0.08, p.sx, p.sy, p.r);
            grad.addColorStop(0, p.st.light);
            grad.addColorStop(0.42, p.st.color);
            grad.addColorStop(1, p.st.dark);
            ctx.fillStyle = grad;
            ctx.fill();
          }

          if (inGroup) {
            ctx.lineWidth = p.idx === hoverAtomIdx ? 2.6 : 1.7;
            ctx.strokeStyle = activeColor;
            ctx.stroke();
          } else if (molMode === "spacefill") {
            ctx.lineWidth = 0.7;
            ctx.strokeStyle = "rgba(15, 23, 42, 0.35)";
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      projectedAtoms = visibleAtoms.sort(function (a, b) { return a.z - b.z; });

      fpsFrames++;
      if (ts - fpsLastTs >= 600) {
        currentFps = Math.round((fpsFrames * 1000) / (ts - fpsLastTs));
        if (fpsBadge) fpsBadge.textContent = Math.min(60, currentFps) + " FPS";
        fpsFrames = 0;
        fpsLastTs = ts;
      }

      molRaf = requestAnimationFrame(drawMol);
    }

    function drawSplitBond(c, x1, y1, x2, y2, p1, p2, lw, highlight, dim, hiColor) {
      var mx = (x1 + x2) * 0.5;
      var my = (y1 + y2) * 0.5;
      c.save();
      c.globalAlpha = dim ? 0.25 : 0.92;
      c.lineWidth = highlight ? lw * 1.25 : lw;
      if (highlight) {
        c.strokeStyle = hiColor;
        c.beginPath();
        c.moveTo(x1, y1);
        c.lineTo(x2, y2);
        c.stroke();
      } else if (molMode === "wireframe") {
        c.strokeStyle = p1.st.color === "#475569" ? "#cbd5e1" : p1.st.color;
        c.beginPath();
        c.moveTo(x1, y1);
        c.lineTo(mx, my);
        c.stroke();
        c.strokeStyle = p2.st.color === "#475569" ? "#cbd5e1" : p2.st.color;
        c.beginPath();
        c.moveTo(mx, my);
        c.lineTo(x2, y2);
        c.stroke();
      } else {
        c.strokeStyle = "rgba(226, 232, 240, 0.82)";
        c.beginPath();
        c.moveTo(x1, y1);
        c.lineTo(x2, y2);
        c.stroke();
      }
      c.restore();
    }

    molRaf = requestAnimationFrame(drawMol);
  }

  function renderParticlesView(container) {
    stopLoops();
    var myRxnToken = ++rxnRenderToken;
    var rxn = PARTICLE_REACTIONS[rxnIdx] || PARTICLE_REACTIONS[0];
    rxnState = {
      progress: 0,
      stage: "ready",
      paused: false,
      showControl: true,
      speed: 1,
      dropCount: 0,
      swirlEnergy: 0,
      autoQueue: 0,
      autoCooldown: 0,
      sedimentH: 0,
      ringAlpha: 0,
      drops: [],
      particles: [],
      ripples: [],
      bubbles: []
    };

    var rxnBtns = PARTICLE_REACTIONS.map(function (r, i) {
      var on = i === rxnIdx;
      return '<button type="button" data-v20-rxn="' + i + '" class="px-2.5 py-1 rounded-lg text-[11.5px] font-bold border transition ' +
        (on ? 'bg-[#0f4c3a] text-white border-[#0f4c3a]' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-[#0f4c3a]') + '">' + r.name + "</button>";
    }).join("");

    var rxnTopics = (function () {
      if (!window.TCM_LAB_API || !window.TCM_LAB_API.getAllTopics || !rxn.catMatch) return [];
      var seenHerb = {};
      var list = [];
      window.TCM_LAB_API.getAllTopics().forEach(function (t) {
        if (!rxn.catMatch.test((t.category || "") + " " + (t.compound || ""))) return;
        var h = String(t.herb || "").split("（")[0].trim();
        if (!h || seenHerb[h]) return;
        seenHerb[h] = true;
        list.push(t);
      });
      return list.slice(0, 8);
    })();
    var baseCss = "rgb(" + rxn.base.join(",") + ")";
    var targetCss = "rgb(" + rxn.targetRgb.join(",") + ")";

    container.innerHTML =
      '<div class="space-y-3.5">' +
        '<div class="p-3 rounded-xl bg-[#f7f6f2] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2">' +
          '<div class="flex flex-wrap gap-1.5">' + rxnBtns + "</div>" +
          '<div class="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200/70 dark:border-slate-700">' +
            '<button type="button" id="v20BtnDrop" class="px-3 py-1.5 rounded-lg bg-[#9a4a24] hover:bg-[#7d3a1b] text-white text-xs font-bold shadow-xs">滴加试液</button>' +
            '<button type="button" id="v20BtnSwirl" class="px-3 py-1.5 rounded-lg bg-[#0f4c3a] hover:bg-[#0a382b] text-white text-xs font-bold">轻摇混匀</button>' +
            '<button type="button" id="v20BtnPauseRxn" class="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold">暂停</button>' +
            '<button type="button" id="v20BtnReplayRxn" class="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold">重播</button>' +
            '<button type="button" id="v20BtnSpeedRxn" class="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold tabular-nums">1.0×</button>' +
            '<button type="button" id="v20BtnCtrlTube" class="px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold">双管对照</button>' +
          "</div>" +
        "</div>" +
        '<div class="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">' +
          '<div class="lg:col-span-7 relative rounded-2xl bg-gradient-to-b from-[#071f1c] to-[#0b2d24] border border-emerald-400/25 overflow-hidden flex justify-center">' +
            '<canvas id="v20RxnCanvas" width="480" height="360" class="w-full max-w-[480px] h-[340px] sm:h-[360px] block cursor-pointer" title="点击供试品试管可轻摇加速扩散"></canvas>' +
            '<div class="pointer-events-none absolute top-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-bold">' +
              '<span id="v20RxnStagePill" class="px-2.5 py-1 rounded-lg bg-slate-950/75 border border-emerald-400/30 text-emerald-200">滴加 → 扩散 → 变色终点</span>' +
              '<div class="flex items-center gap-1.5">' +
                '<span id="v20DropCountBadge" class="px-2 py-1 rounded-lg bg-slate-950/75 border border-white/15 text-slate-200 font-mono">0 滴</span>' +
                '<span id="v20RxnPauseBadge" class="hidden px-2 py-1 rounded-lg bg-amber-500/90 text-slate-950 font-extrabold">已暂停</span>' +
              '</div>' +
            '</div>' +
          "</div>" +
          '<div class="lg:col-span-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 flex flex-col justify-between gap-3 text-xs">' +
            '<div class="space-y-2.5">' +
              '<div class="flex flex-wrap items-center gap-1.5">' +
                '<span class="inline-block px-2.5 py-0.5 rounded-md bg-[#f2f1ec] dark:bg-amber-900/40 text-[#9a4a24] dark:text-amber-200 font-bold">' + rxn.target + "</span>" +
                '<span class="inline-block px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/40 text-[#0f4c3a] dark:text-emerald-300 font-bold">试液：' + rxn.reagent + "</span>" +
              '</div>' +
              '<h4 class="text-base font-extrabold text-slate-900 dark:text-white">' + rxn.name + "</h4>" +
              '<p class="text-slate-600 dark:text-slate-300 leading-relaxed">' + rxn.desc + "</p>" +
              '<div class="p-2.5 rounded-xl bg-[#f7f6f2] dark:bg-emerald-950/35 border border-slate-200/80 dark:border-emerald-800 text-[11.5px] text-slate-800 dark:text-emerald-200 leading-relaxed">' +
                '<strong>化学机理：</strong>' + rxn.mech +
              '</div>' +
              (rxnTopics.length ? (
                '<div class="space-y-1">' +
                  '<div class="text-[11px] font-bold text-slate-600 dark:text-slate-300">题库典型适用药材（点击看 3D 构象）：</div>' +
                  '<div class="flex flex-wrap gap-1">' +
                    rxnTopics.map(function (t) {
                      return '<button type="button" data-v20-rxn-herb="' + escHtml(t.herb + ' ' + t.compound) + '" class="px-2 py-0.5 rounded-md bg-[#f7f6f2] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-[#0f4c3a] text-[10.5px] font-bold text-slate-700 dark:text-slate-200">' + escHtml(t.herb.split("（")[0]) + '</button>';
                    }).join("") +
                  '</div>' +
                '</div>'
              ) : '') +
              '<div class="grid grid-cols-3 gap-1.5 text-center text-[10.5px] font-bold">' +
                '<div class="p-1.5 rounded-lg bg-[#f6f8f7] dark:bg-slate-900 border border-slate-200 dark:border-slate-700"><span class="inline-block w-3.5 h-3.5 rounded-full border border-slate-400 align-middle mr-1" style="background:' + baseCss + '"></span>空白对照</div>' +
                '<div class="p-1.5 rounded-lg bg-[#f6f8f7] dark:bg-slate-900 border border-slate-200 dark:border-slate-700"><span id="v20CurColorDot" class="inline-block w-3.5 h-3.5 rounded-full border border-slate-400 align-middle mr-1" style="background:' + baseCss + '"></span>当前液色</div>' +
                '<div class="p-1.5 rounded-lg bg-[#f6f8f7] dark:bg-slate-900 border border-slate-200 dark:border-slate-700"><span class="inline-block w-3.5 h-3.5 rounded-full border border-slate-400 align-middle mr-1" style="background:' + targetCss + '"></span>阳性终点</div>' +
              '</div>' +
            '</div>' +
            '<div class="p-3 rounded-xl bg-[#f6f8f7] dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-700 space-y-2">' +
              '<div class="flex justify-between font-extrabold text-slate-800 dark:text-slate-200">' +
                '<span>显色转化进度</span><span id="v20RxnPct">0%</span>' +
              '</div>' +
              '<div class="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"><div id="v20RxnBar" class="h-full bg-[#059669] transition-all duration-150" style="width:0%"></div></div>' +
              '<div class="grid grid-cols-3 gap-1 text-center text-[10.5px] font-bold pt-0.5">' +
                '<span id="v20St1" class="py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">1. 滴加</span>' +
                '<span id="v20St2" class="py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">2. 扩散</span>' +
                '<span id="v20St3" class="py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">3. 变色终点</span>' +
              '</div>' +
              '<div id="v20RxnStatus" class="text-[11px] text-slate-600 dark:text-slate-400">左侧空白对照管、右侧供试品管；点击试管或「轻摇混匀」可加速扩散。</div>' +
            "</div>" +
          "</div>" +
        "</div>" +
      "</div>";

    container.querySelectorAll("[data-v20-rxn]").forEach(function (b) {
      b.addEventListener("click", function () {
        rxnIdx = Number(b.getAttribute("data-v20-rxn"));
        renderParticlesView(container);
      });
    });
    container.querySelectorAll("[data-v20-rxn-herb]").forEach(function (b) {
      b.addEventListener("click", function () {
        var q = b.getAttribute("data-v20-rxn-herb") || "";
        var regKey = window.TCM_MOL3D_REGISTRY && window.TCM_MOL3D_REGISTRY.matchKey(q);
        molKey = regKey || resolveMolKey(q);
        activeTab = "mol3d";
        molCatFilter = "all";
        renderModalBody();
      });
    });

    var canvas = container.querySelector("#v20RxnCanvas");
    var ctx = canvas.getContext("2d");
    var barEl = container.querySelector("#v20RxnBar");
    var pctEl = container.querySelector("#v20RxnPct");
    var statusEl = container.querySelector("#v20RxnStatus");
    var stagePill = container.querySelector("#v20RxnStagePill");
    var dropBadge = container.querySelector("#v20DropCountBadge");
    var pauseBadge = container.querySelector("#v20RxnPauseBadge");
    var pauseBtn = container.querySelector("#v20BtnPauseRxn");
    var speedBtn = container.querySelector("#v20BtnSpeedRxn");
    var ctrlBtn = container.querySelector("#v20BtnCtrlTube");
    var curColorDot = container.querySelector("#v20CurColorDot");
    var st1 = container.querySelector("#v20St1");
    var st2 = container.querySelector("#v20St2");
    var st3 = container.querySelector("#v20St3");

    function getActiveTubeX() { return rxnState.showControl ? 268 : 185; }
    var tw = 110, ty = 98, th = 224, liquidY = 166;

    function syncStageUi() {
      var pct = Math.round(rxnState.progress * 100);
      if (barEl) barEl.style.width = pct + "%";
      if (pctEl) pctEl.textContent = pct + "%";
      if (dropBadge) dropBadge.textContent = rxnState.dropCount + " 滴";
      var activeCls = "py-1 rounded-lg bg-[#059669] text-white border border-[#059669]";
      var idleCls = "py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500";
      if (st1) st1.className = (rxnState.dropCount > 0 || rxnState.drops.length > 0) ? activeCls : idleCls;
      if (st2) st2.className = (rxnState.particles.length > 0 || pct >= 30) ? activeCls : idleCls;
      if (st3) st3.className = pct >= 95 ? activeCls : idleCls;
      if (stagePill) {
        stagePill.textContent = pct >= 95
          ? "✅ 阶段 3/3：显色终点达成（对比空白管）"
          : (rxnState.particles.length > 0 ? "🌊 阶段 2/3：粒子对流扩散显色中" : (rxnState.drops.length > 0 ? "💧 阶段 1/3：检识试液滴加冲击液面" : "就绪：点击滴加或重播"));
      }
      if (pauseBadge) pauseBadge.classList.toggle("hidden", !rxnState.paused);
      if (pauseBtn) pauseBtn.textContent = rxnState.paused ? "▶ 继续" : "⏸ 暂停";
    }

    function spawnDrop() {
      rxnState.stage = "drop";
      rxnState.drops.push({ x: getActiveTubeX() + tw / 2, y: 54, vy: 58 });
      syncStageUi();
    }

    function triggerSwirl() {
      rxnState.swirlEnergy = 1.0;
      rxnState.particles.forEach(function (pt) {
        pt.vx += (Math.random() - 0.5) * 140;
        pt.vy += (Math.random() - 0.5) * 90;
      });
      if (rxnState.progress > 0 && rxnState.progress < 1) {
        rxnState.progress = Math.min(1, rxnState.progress + 0.08);
        syncStageUi();
      }
    }

    function replayReaction() {
      rxnState.progress = 0;
      rxnState.stage = "drop";
      rxnState.paused = false;
      rxnState.dropCount = 0;
      rxnState.swirlEnergy = 0;
      rxnState.sedimentH = 0;
      rxnState.ringAlpha = 0;
      rxnState.drops = [];
      rxnState.particles = [];
      rxnState.ripples = [];
      rxnState.bubbles = [];
      rxnState.autoQueue = 3;
      rxnState.autoCooldown = 0.05;
      if (statusEl) statusEl.textContent = "已重播：自动连续滴加 3 滴试液至显色终点，可随时暂停或轻摇混匀。";
      syncStageUi();
    }

    container.querySelector("#v20BtnDrop").addEventListener("click", function () { rxnState.paused = false; spawnDrop(); });
    container.querySelector("#v20BtnSwirl").addEventListener("click", triggerSwirl);
    canvas.addEventListener("click", triggerSwirl);
    pauseBtn.addEventListener("click", function () { rxnState.paused = !rxnState.paused; syncStageUi(); });
    container.querySelector("#v20BtnReplayRxn").addEventListener("click", replayReaction);
    speedBtn.addEventListener("click", function () {
      rxnState.speed = rxnState.speed === 1 ? 2 : (rxnState.speed === 2 ? 0.5 : 1);
      speedBtn.textContent = rxnState.speed.toFixed(1) + "×";
    });
    ctrlBtn.addEventListener("click", function () {
      rxnState.showControl = !rxnState.showControl;
      ctrlBtn.className = "px-2.5 py-1.5 rounded-xl text-xs font-bold border " + (rxnState.showControl ? "bg-emerald-50 border-emerald-300 text-emerald-900" : "bg-white border-slate-200 text-slate-600");
      replayReaction();
    });

    replayReaction();

    var lastTs = performance.now();

    function drawTestTubeGlass(x, labelTxt) {
      // Rim flange
      ctx.strokeStyle = "rgba(226, 232, 240, 0.88)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 6, ty); ctx.lineTo(x + tw + 6, ty);
      ctx.stroke();

      // Tube body outline
      ctx.beginPath();
      ctx.roundRect(x, ty, tw, th, [4, 4, 55, 55]);
      ctx.stroke();

      // Volumetric graduation ticks (2mL, 4mL, 6mL)
      ctx.strokeStyle = "rgba(226, 232, 240, 0.45)";
      ctx.lineWidth = 1;
      ctx.fillStyle = "rgba(226, 232, 240, 0.65)";
      ctx.font = "10px monospace";
      [2, 4, 6].forEach(function (ml, idx) {
        var gy = ty + th - 48 - idx * 44;
        ctx.beginPath(); ctx.moveTo(x + tw - 12, gy); ctx.lineTo(x + tw, gy); ctx.stroke();
        ctx.fillText(ml + "mL", x + tw - 34, gy + 3);
      });

      // Specular glass highlight streak
      ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 10, ty + 14); ctx.lineTo(x + 10, ty + th - 58);
      ctx.stroke();

      // Bottom label
      ctx.fillStyle = "#a7f3d0";
      ctx.font = "bold 11.5px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(labelTxt, x + tw / 2, ty + th + 20);
      ctx.textAlign = "left";
    }

    function drawRxn(ts) {
      if (myRxnToken !== rxnRenderToken) return;
      rxnRaf = requestAnimationFrame(drawRxn);

      var rawDt = Math.min(0.04, Math.max(0.001, (ts - lastTs) / 1000));
      lastTs = ts;
      var dt = rxnState.paused ? 0 : rawDt * rxnState.speed;
      var tx = getActiveTubeX();

      if (dt > 0 && rxnState.autoQueue > 0) {
        rxnState.autoCooldown -= dt;
        if (rxnState.autoCooldown <= 0) {
          spawnDrop();
          rxnState.autoQueue--;
          rxnState.autoCooldown = 0.82;
        }
      }

      if (dt > 0) {
        rxnState.swirlEnergy = Math.max(0, rxnState.swirlEnergy - 1.4 * dt);

        for (var d = rxnState.drops.length - 1; d >= 0; d--) {
          var dr = rxnState.drops[d];
          dr.vy += 430 * dt;
          dr.y += dr.vy * dt;
          if (dr.y >= liquidY) {
            rxnState.drops.splice(d, 1);
            rxnState.dropCount++;
            rxnState.ripples.push({ rad: 4, alpha: 0.95 });
            rxnState.progress = Math.min(1, rxnState.progress + 0.34);
            rxnState.stage = rxnState.progress >= 0.95 ? "endpoint" : "diffuse";
            if (rxn.mode === "ring") rxnState.ringAlpha = Math.min(1, rxnState.ringAlpha + 0.36);

            for (var n = 0; n < 54; n++) {
              rxnState.particles.push({
                x: tx + tw / 2 + (Math.random() - 0.5) * 14,
                y: liquidY + 4,
                vx: (Math.random() - 0.5) * 95,
                vy: rxn.mode === "ring" ? (55 + Math.random() * 55) : (38 + Math.random() * 105),
                size: 2.2 + Math.random() * 3.6,
                life: 1.0
              });
            }
            if (statusEl) {
              statusEl.textContent = rxnState.progress >= 0.95 ? "✅ 显色终点已达（与左侧空白管对比鲜明）：" + rxn.desc : "🌊 第 " + rxnState.dropCount + " 滴正在对流扩散显色（" + Math.round(rxnState.progress * 100) + "%）...";
            }
            syncStageUi();
          }
        }

        var ifaceY = liquidY + 72;
        for (var i = rxnState.particles.length - 1; i >= 0; i--) {
          var pt = rxnState.particles[i];
          if (rxn.mode === "ring") {
            pt.vy += (ifaceY - pt.y) * 3.2 * dt;
            pt.vx *= Math.pow(0.25, dt);
            pt.vy *= Math.pow(0.18, dt);
          } else if (rxn.mode === "precip") {
            pt.vy = Math.min(115, pt.vy + 75 * dt);
            pt.vx *= Math.pow(0.35, dt);
          } else {
            pt.vx += Math.sin(pt.y * 0.08 + i) * (32 + rxnState.swirlEnergy * 95) * dt;
            pt.vx *= Math.pow(0.45, dt);
            pt.vy *= Math.pow(0.55, dt);
          }
          pt.x += pt.vx * dt; pt.y += pt.vy * dt;
          if (pt.x < tx + 8) { pt.x = tx + 8; pt.vx = Math.abs(pt.vx) * 0.6; }
          if (pt.x > tx + tw - 8) { pt.x = tx + tw - 8; pt.vx = -Math.abs(pt.vx) * 0.6; }
          if (pt.y > ty + th - 10) {
            pt.y = ty + th - 10; pt.vy = 0; pt.vx *= 0.5;
            if (rxn.mode === "precip") rxnState.sedimentH = Math.min(28, rxnState.sedimentH + 0.14);
          }
          pt.life -= 0.26 * dt;
          if (pt.life <= 0) rxnState.particles.splice(i, 1);
        }

        if (rxn.mode === "bubbles" && rxnState.progress > 0.12 && Math.random() < 18 * dt) {
          rxnState.bubbles.push({ x: tx + 16 + Math.random() * (tw - 32), y: ty + th - 16, vy: -(70 + Math.random() * 65), r: 1.8 + Math.random() * 2.5 });
        }
        for (var k = rxnState.bubbles.length - 1; k >= 0; k--) {
          var bb = rxnState.bubbles[k];
          bb.y += bb.vy * dt;
          bb.x += Math.sin(bb.y * 0.12) * 14 * dt;
          if (bb.y < liquidY) rxnState.bubbles.splice(k, 1);
        }

        for (var j = rxnState.ripples.length - 1; j >= 0; j--) {
          var rp = rxnState.ripples[j];
          rp.rad += 70 * dt; rp.alpha -= 1.3 * dt;
          if (rp.alpha <= 0) rxnState.ripples.splice(j, 1);
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1) Optional Left Control Blank Tube (阴性空白对照管)
      if (rxnState.showControl) {
        var cx0 = 92;
        ctx.save();
        ctx.beginPath(); ctx.roundRect(cx0, ty, tw, th, [4, 4, 55, 55]); ctx.clip();
        ctx.fillStyle = "rgb(" + rxn.base.join(",") + ")";
        ctx.fillRect(cx0, liquidY, tw, ty + th - liquidY);
        // Concave meniscus
        ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(cx0, liquidY); ctx.quadraticCurveTo(cx0 + tw / 2, liquidY + 6, cx0 + tw, liquidY); ctx.stroke();
        ctx.restore();
        drawTestTubeGlass(cx0, "空白对照管（未加试液）");
      }

      // 2) Glass dropper above active tube
      var dropCenterX = tx + tw / 2;
      ctx.fillStyle = "#cbd5e1";
      ctx.fillRect(dropCenterX - 8, 12, 16, 26);
      ctx.beginPath();
      ctx.moveTo(dropCenterX - 6, 38); ctx.lineTo(dropCenterX + 6, 38); ctx.lineTo(dropCenterX + 2, 54); ctx.lineTo(dropCenterX - 2, 54);
      ctx.fill();

      // 3) Active Sample Reaction Tube (with gentle swirl offset)
      var swirlDx = rxnState.swirlEnergy > 0.01 ? Math.sin(ts * 0.032) * rxnState.swirlEnergy * 6 : 0;
      ctx.save();
      ctx.translate(swirlDx, 0);

      var p = Math.min(1, rxnState.progress);
      var r = Math.round(rxn.base[0] + (rxn.targetRgb[0] - rxn.base[0]) * (rxn.mode === "ring" ? p * 0.16 : p));
      var g = Math.round(rxn.base[1] + (rxn.targetRgb[1] - rxn.base[1]) * (rxn.mode === "ring" ? p * 0.16 : p));
      var b = Math.round(rxn.base[2] + (rxn.targetRgb[2] - rxn.base[2]) * (rxn.mode === "ring" ? p * 0.16 : p));
      if (curColorDot) curColorDot.style.background = "rgb(" + r + "," + g + "," + b + ")";

      ctx.save();
      ctx.beginPath(); ctx.roundRect(tx, ty, tw, th, [4, 4, 55, 55]); ctx.clip();

      ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
      ctx.fillRect(tx, liquidY, tw, ty + th - liquidY);

      if (rxn.mode === "ring" && rxnState.ringAlpha > 0.02) {
        var ifaceY2 = liquidY + 72;
        ctx.fillStyle = "rgba(226, 232, 240, 0.55)";
        ctx.fillRect(tx, ifaceY2, tw, ty + th - ifaceY2);
        var ringGrad = ctx.createLinearGradient(tx, ifaceY2 - 18, tx, ifaceY2 + 18);
        ringGrad.addColorStop(0, "rgba(126,34,206,0)");
        ringGrad.addColorStop(0.5, "rgba(126,34,206," + (rxnState.ringAlpha * 0.94) + ")");
        ringGrad.addColorStop(1, "rgba(126,34,206,0)");
        ctx.fillStyle = ringGrad;
        ctx.fillRect(tx, ifaceY2 - 18, tw, 36);
      }

      if (rxn.mode === "precip" && rxnState.sedimentH > 1) {
        ctx.fillStyle = "rgba(194, 65, 12, 0.94)";
        ctx.fillRect(tx, ty + th - rxnState.sedimentH, tw, rxnState.sedimentH);
      }

      for (var pi = 0; pi < rxnState.particles.length; pi++) {
        var pt2 = rxnState.particles[pi];
        ctx.fillStyle = "rgba(" + rxn.targetRgb[0] + "," + rxn.targetRgb[1] + "," + rxn.targetRgb[2] + "," + Math.max(0.18, pt2.life * 0.9) + ")";
        ctx.beginPath(); ctx.arc(pt2.x, pt2.y, pt2.size, 0, Math.PI * 2); ctx.fill();
      }
      for (var bi = 0; bi < rxnState.bubbles.length; bi++) {
        var bb2 = rxnState.bubbles[bi];
        ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(bb2.x, bb2.y, bb2.r, 0, Math.PI * 2); ctx.stroke();
      }
      for (var ri = 0; ri < rxnState.ripples.length; ri++) {
        var rp2 = rxnState.ripples[ri];
        ctx.strokeStyle = "rgba(255,255,255," + Math.max(0, rp2.alpha) + ")"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(dropCenterX, liquidY + 2, rp2.rad, rp2.rad * 0.25, 0, 0, Math.PI * 2); ctx.stroke();
      }
      // Concave meniscus
      ctx.strokeStyle = "rgba(255,255,255,0.65)"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(tx, liquidY); ctx.quadraticCurveTo(tx + tw / 2, liquidY + 6, tx + tw, liquidY); ctx.stroke();
      ctx.restore();

      drawTestTubeGlass(tx, "供试品反应管");
      if (p >= 0.30) {
        var tagTxt = rxn.mode === "bubbles" ? "H₂↑ 气泡溢出"
          : (rxn.mode === "ring" ? "界面紫红环 (浓H₂SO₄沉底)"
          : (rxn.mode === "precip" ? "[BiI₄]⁻ 橘红沉淀层" : "络合/解离显色羽流"));
        ctx.fillStyle = "rgba(6, 36, 32, 0.88)";
        ctx.strokeStyle = "rgba(251, 191, 36, 0.8)";
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.roundRect(tx - 16, ty + 20, tw + 32, 22, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#fde68a";
        ctx.font = "bold 10.5px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(tagTxt, tx + tw / 2, ty + 35);
        ctx.textAlign = "left";
      }
      ctx.restore();

      for (var di = 0; di < rxnState.drops.length; di++) {
        var dr2 = rxnState.drops[di];
        ctx.fillStyle = rxn.dropColor;
        ctx.beginPath(); ctx.arc(dr2.x, dr2.y, 4.8, 0, Math.PI * 2); ctx.fill();
      }
    }

    rxnRaf = requestAnimationFrame(drawRxn);
  }

  function registerIntegrations() {
    if (window.TCM_V16_PORTAL && typeof window.TCM_V16_PORTAL.registerExtension === "function") {
      window.TCM_V16_PORTAL.registerExtension({
        id: "v20_mol3d",
        icon: "🧬",
        title: "3D 分子结构与粒子显色台",
        desc: "基于 PubChem 真实 3D 构象：薄荷脑、丹参酮IIA、黄芩苷、小檗碱、绿原酸、槲皮素（支持官能团高亮与三模式切换）。",
        onOpen: function () { openModal("mol3d"); }
      });
    }
  }

  window.TCM_V20_VISUALS = {
    version: "2.0.0-pubchem-3d",
    openMol3d: function (key) { openModal("mol3d", key); },
    openParticles: function () { openModal("particles"); },
    getMoleculeKeys: function () { return Object.keys(getMolecules()); },
    getCurrentFps: function () { return currentFps; },
    getRotY: function () { return rotY; },
    getParticlesState: function () { return { rxnId: PARTICLE_REACTIONS[rxnIdx].id, rxnCount: PARTICLE_REACTIONS.length, progress: Number((rxnState.progress || 0).toFixed(2)), paused: !!rxnState.paused, speed: rxnState.speed || 1, particles: (rxnState.particles || []).length }; }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", registerIntegrations);
  } else {
    registerIntegrations();
  }
})();
