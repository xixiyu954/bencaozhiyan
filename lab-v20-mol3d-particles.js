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
    { id: "hcl_mg", name: "盐酸-镁粉反应", reagent: "浓 HCl + 镁粉", target: "黄酮类 (黄芩苷 / 槲皮素 / 芦丁)", base: [254, 243, 199], targetRgb: [220, 38, 38], dropColor: "#e2e8f0", mode: "bubbles", mech: "Mg + 2HCl → MgCl₂ + H₂↑；新生 [H] 还原黄酮 4-位羰基生成花色素盐，溶液由浅黄渐变为樱红/紫红色。", desc: "镁粉与盐酸剧烈产生 H₂ 微泡上浮，樱红色羽流自液面扩散至全管。" },
    { id: "molish", name: "Molish 紫环反应", reagent: "α-萘酚 + 浓 H₂SO₄", target: "糖与苷类 (黄芩苷 / 人参皂苷 / 多糖)", base: [241, 245, 249], targetRgb: [126, 34, 206], dropColor: "#c084fc", mode: "ring", mech: "浓 H₂SO₄ (ρ=1.84) 沉至管底，糖苷脱水成糠醛衍生物并与 α-萘酚在两液交界处缩合生成特征紫红环。", desc: "浓硫酸沿管壁缓加沉底，两液界面精准富集深紫红色扩散环。" },
    { id: "fecl3", name: "FeCl₃ 酚羟基络合", reagent: "1% FeCl₃ 乙醇液", target: "邻二酚羟基 (绿原酸 / 丹酚酸 B / 槲皮素)", base: [254, 249, 195], targetRgb: [15, 118, 110], dropColor: "#d97706", mode: "cloud", mech: "Fe³⁺ 与邻二酚羟基发生配位螯合，形成深墨绿/蓝黑色稳定络合物，随对流涡旋迅速扩散。", desc: "铁离子液滴冲击液面炸开墨绿色涡旋粒子云，迅速向下扩散变色。" },
    { id: "dragendorff", name: "改良碘化铋钾", reagent: "Dragendorff 试液", target: "生物碱类 (小檗碱 / 苦参碱)", base: [254, 249, 195], targetRgb: [234, 88, 12], dropColor: "#ea580c", mode: "precip", mech: "质子化生物碱阳离子与 [BiI₄]⁻ 结合，瞬时析出难溶性橘红色无定形复盐沉淀并向管底沉降堆积。", desc: "滴入瞬间析出致密橘红色沉淀颗粒，重力沉降并在管底形成沉淀层。" },
    { id: "borntrager", name: "Bornträger 碱液显红", reagent: "5% NaOH 碱水", target: "游离羟基蒽醌 (大黄素 / 茜草素)", base: [253, 224, 71], targetRgb: [190, 18, 60], dropColor: "#fda4af", mode: "cloud", mech: "游离酚羟基在碱液中解离形成共轭酚氧负离子，体系由亮黄迅速转为鲜明樱红/紫红色。", desc: "滴加稀碱液后游离蒽醌解离显色，樱红色扩散云团席卷整管。" }
  ];

  var modalEl = null;
  var activeTab = "mol3d";
  var molKey = "tanshinone";
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
    modalEl = document.createElement("div");
    modalEl.id = "tcmV20VisualModal";
    modalEl.className = "no-print fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-5";
    modalEl.innerHTML =
      '<div class="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-700 max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">' +
        '<div class="px-4 sm:px-5 py-3 bg-gradient-to-r from-[#062922] via-[#0a4538] to-[#0f6b58] text-white flex items-center justify-between gap-3">' +
          '<div class="flex items-center gap-2 min-w-0">' +
            '<span class="shrink-0 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-[11px] font-extrabold">PubChem 3D</span>' +
            '<h3 class="text-sm sm:text-base font-extrabold truncate">3D 分子结构库 & 粒子级显色反应实验室</h3>' +
          '</div>' +
          '<button type="button" id="v20BtnClose" aria-label="关闭弹窗" class="shrink-0 w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-lg leading-none">×</button>' +
        '</div>' +
        '<div class="px-4 sm:px-5 pt-2.5 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-[#f6f8f7] dark:bg-slate-800/70">' +
          '<div class="inline-flex p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-extrabold">' +
            '<button type="button" data-v20-tab="mol3d" class="px-3.5 py-1.5 rounded-lg transition">🧬 3D 分子结构库</button>' +
            '<button type="button" data-v20-tab="particles" class="px-3.5 py-1.5 rounded-lg transition">🧪 粒子级显色动画</button>' +
          '</div>' +
          '<span id="v20HeaderMeta" class="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">PubChem 真实 3D 构象 · 悬停/点击官能团高亮</span>' +
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
      b.className = "px-3.5 py-1.5 rounded-lg transition " + (on ? "bg-[#064e3b] text-white" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white");
    });

    if (activeTab === "mol3d") renderMol3dView(body);
    else renderParticlesView(body);
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

    var molBtns = keys.map(function (k) {
      var on = k === molKey;
      var item = mols[k];
      return '<button type="button" data-v20-mol="' + k + '" class="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ' +
        (on
          ? 'bg-[#059669] text-white border-[#059669] shadow-xs'
          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-[#059669]') + '">' +
        item.herb.split(" / ")[0] + " · " + item.shortName + "</button>";
    }).join("");

    var modeBtns = [
      ["ballstick", "球棍"],
      ["wireframe", "骨架"],
      ["spacefill", "空间填充"]
    ].map(function (pair) {
      var on = pair[0] === molMode;
      return '<button type="button" data-v20-mode="' + pair[0] + '" class="px-2.5 py-1.5 rounded-lg text-xs font-bold border transition ' +
        (on
          ? 'bg-[#ea580c] text-white border-[#ea580c]'
          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-orange-400') + '">' + pair[1] + "</button>";
    }).join("");

    var fgChips = (m.groups || []).map(function (g) {
      var active = lockedGroupId === g.id;
      return '<button type="button" data-v20-fg="' + g.id + '" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ' +
        (active
          ? 'bg-amber-50 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 border-amber-400 ring-1 ring-amber-400'
          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-400') + '">' +
        '<span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:' + g.color + '"></span>' +
        '<span>' + g.name + '</span>' +
        '<span class="opacity-60 text-[10px]">(' + g.atoms.length + ')</span>' +
      '</button>';
    }).join("");

    var heavyCount = m.atoms.filter(function (a) { return a[3] !== "H"; }).length;

    container.innerHTML =
      '<div class="space-y-3.5">' +
        '<div class="flex flex-wrap items-center justify-between gap-2">' +
          '<div class="flex flex-wrap gap-1.5" role="tablist" aria-label="核心成分选择">' + molBtns + "</div>" +
          '<div class="flex flex-wrap items-center gap-1.5">' +
            modeBtns +
            '<button type="button" id="v20BtnToggleH" class="px-2.5 py-1.5 rounded-lg text-xs font-bold border transition ' +
              (showHydrogens ? 'bg-slate-800 text-white border-slate-800 dark:bg-slate-200 dark:text-slate-900' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700') + '">' +
              (showHydrogens ? '隐 H 原子' : '显 H 原子') + '</button>' +
          "</div>" +
        "</div>" +

        '<div class="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">' +
          '<div class="lg:col-span-8 relative rounded-2xl bg-gradient-to-br from-[#061c19] via-[#0a2c27] to-[#0f3d35] border border-emerald-400/25 overflow-hidden select-none">' +
            '<canvas id="v20MolCanvas" class="w-full h-[300px] sm:h-full min-h-[300px] sm:min-h-[420px] block cursor-grab active:cursor-grabbing" style="touch-action:none;"></canvas>' +
            '<div id="v20MolHoverTip" class="pointer-events-none absolute top-3 left-3 right-24 sm:right-28 px-3 py-2 rounded-xl bg-slate-950/75 backdrop-blur-xs border border-emerald-300/25 text-xs text-emerald-100 leading-snug">' +
              '<div class="font-extrabold text-emerald-200">拖拽 360° 旋转 · 滚轮/双指缩放 · 悬停原子高亮官能团</div>' +
              '<div class="text-[11px] text-slate-300 mt-0.5">当前显示：' + m.name + '（' + m.atoms.length + ' 原子 / ' + m.bonds.length + ' 键）</div>' +
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

          '<div class="lg:col-span-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 flex flex-col justify-between gap-3 text-xs">' +
            '<div class="space-y-2.5">' +
              '<div class="flex flex-wrap items-center justify-between gap-1.5">' +
                '<span class="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-[#059669] dark:text-emerald-300 font-extrabold">' + m.formula + ' · ' + m.category + '</span>' +
                '<a href="' + m.pubchemUrl + '" target="_blank" rel="noopener noreferrer" class="text-[11px] font-bold text-teal-700 dark:text-teal-300 hover:underline">PubChem CID ' + m.cid + ' ↗</a>' +
              '</div>' +
              '<h4 class="text-base font-extrabold text-slate-900 dark:text-white leading-tight">' + m.name + '</h4>' +
              '<p class="text-slate-600 dark:text-slate-300 leading-relaxed">' + m.desc + '</p>' +

              '<div class="grid grid-cols-3 gap-1.5 pt-0.5">' +
                '<div class="p-2 rounded-xl bg-[#f6f8f7] dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-700 text-center">' +
                  '<div class="text-[10px] text-slate-500 dark:text-slate-400">分子量</div>' +
                  '<div class="font-extrabold text-slate-800 dark:text-slate-100">' + m.mw + '</div>' +
                '</div>' +
                '<div class="p-2 rounded-xl bg-[#f6f8f7] dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-700 text-center">' +
                  '<div class="text-[10px] text-slate-500 dark:text-slate-400">XLogP3</div>' +
                  '<div class="font-extrabold text-slate-800 dark:text-slate-100">' + m.xlogp + '</div>' +
                '</div>' +
                '<div class="p-2 rounded-xl bg-[#f6f8f7] dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-700 text-center">' +
                  '<div class="text-[10px] text-slate-500 dark:text-slate-400">TPSA (Å²)</div>' +
                  '<div class="font-extrabold text-slate-800 dark:text-slate-100">' + m.tpsa + '</div>' +
                '</div>' +
              '</div>' +

              '<div class="space-y-1.5 pt-1">' +
                '<div class="flex items-center justify-between">' +
                  '<span class="font-extrabold text-slate-800 dark:text-slate-200">官能团高亮检索（悬停或点击锁定）</span>' +
                  (lockedGroupId ? '<button type="button" id="v20BtnClearFg" class="text-[10.5px] text-orange-600 font-bold hover:underline">清除锁定</button>' : '') +
                '</div>' +
                '<div class="flex flex-wrap gap-1.5" id="v20FgChipList">' + fgChips + '</div>' +
              '</div>' +
            '</div>' +

            '<div class="p-2.5 rounded-xl bg-[#f6f8f7] dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-700 space-y-1">' +
              '<div class="font-extrabold text-slate-800 dark:text-slate-200 text-[11px]">CPK 元素色标（HBD ' + m.hbd + ' / HBA ' + m.hba + '）</div>' +
              '<div class="grid grid-cols-4 gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">' +
                '<span><i class="inline-block w-2.5 h-2.5 rounded-full bg-[#475569] mr-1 align-middle"></i>C</span>' +
                '<span><i class="inline-block w-2.5 h-2.5 rounded-full bg-[#dc2626] mr-1 align-middle"></i>O</span>' +
                '<span><i class="inline-block w-2.5 h-2.5 rounded-full bg-[#2563eb] mr-1 align-middle"></i>N</span>' +
                '<span><i class="inline-block w-2.5 h-2.5 rounded-full bg-[#e2e8f0] border border-slate-400 mr-1 align-middle"></i>H</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    // Bind switches
    container.querySelectorAll("[data-v20-mol]").forEach(function (b) {
      b.addEventListener("click", function () {
        molKey = b.getAttribute("data-v20-mol");
        lockedGroupId = null;
        hoverGroupId = null;
        hoverAtomIdx = -1;
        zoom = 1.0;
        renderMol3dView(container);
      });
    });
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
      return '<button type="button" data-v20-rxn="' + i + '" class="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ' +
        (on ? 'bg-[#059669] text-white border-[#059669]' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-[#059669]') + '">' + r.name + "</button>";
    }).join("");

    var baseCss = "rgb(" + rxn.base.join(",") + ")";
    var targetCss = "rgb(" + rxn.targetRgb.join(",") + ")";

    container.innerHTML =
      '<div class="space-y-3.5">' +
        '<div class="flex flex-wrap items-center justify-between gap-2">' +
          '<div class="flex flex-wrap gap-1.5">' + rxnBtns + "</div>" +
          '<div class="flex flex-wrap items-center gap-1.5">' +
            '<button type="button" id="v20BtnDrop" class="px-3 py-1.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-extrabold shadow-xs">💧 滴加试液</button>' +
            '<button type="button" id="v20BtnSwirl" class="px-3 py-1.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-extrabold">🌀 轻摇混匀</button>' +
            '<button type="button" id="v20BtnPauseRxn" class="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-extrabold">⏸ 暂停</button>' +
            '<button type="button" id="v20BtnReplayRxn" class="px-3 py-1.5 rounded-xl bg-[#064e3b] hover:bg-[#062922] text-white text-xs font-extrabold">↺ 重播</button>' +
            '<button type="button" id="v20BtnSpeedRxn" class="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold">1.0×</button>' +
            '<button type="button" id="v20BtnCtrlTube" class="px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold">🧪 双管对照</button>' +
          "</div>" +
        "</div>" +
        '<div class="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">' +
          '<div class="lg:col-span-7 relative rounded-2xl bg-gradient-to-b from-[#071f1c] to-[#0b2d24] border border-emerald-400/25 overflow-hidden flex justify-center">' +
            '<canvas id="v20RxnCanvas" width="480" height="360" class="w-full max-w-[480px] h-[340px] sm:h-[360px] block cursor-pointer" title="点击供试品试管可轻摇加速扩散"></canvas>' +
            '<div class="pointer-events-none absolute top-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-bold">' +
              '<span id="v20RxnStagePill" class="px-2.5 py-1 rounded-lg bg-slate-950/75 border border-emerald-400/30 text-emerald-200">滴加 → 扩散 → 变色终点</span>' +
              '<div class="flex items-center gap-1.5">' +
                '<span id="v20DropCountBadge" class="px-2 py-1 rounded-lg bg-slate-950/75 border border-white/15 text-slate-200 font-mono">0 滴</span>' +
                '<span id="v20RxnPauseBadge" class="hidden px-2 py-1 rounded-lg bg-amber-500/90 text-slate-950 font-extrabold">⏸ 已暂停</span>' +
              '</div>' +
            '</div>' +
          "</div>" +
          '<div class="lg:col-span-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 flex flex-col justify-between gap-3 text-xs">' +
            '<div class="space-y-2.5">' +
              '<div class="flex flex-wrap items-center gap-1.5">' +
                '<span class="inline-block px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 font-extrabold">' + rxn.target + "</span>" +
                '<span class="inline-block px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-bold">试液：' + rxn.reagent + "</span>" +
              '</div>' +
              '<h4 class="text-base font-extrabold text-slate-900 dark:text-white">' + rxn.name + "</h4>" +
              '<p class="text-slate-600 dark:text-slate-300 leading-relaxed">' + rxn.desc + "</p>" +
              '<div class="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/35 border border-emerald-200/80 dark:border-emerald-800 text-[11.5px] text-emerald-950 dark:text-emerald-200 leading-relaxed">' +
                '<strong>化学机理：</strong>' + rxn.mech +
              '</div>' +
              '<div class="grid grid-cols-3 gap-1.5 text-center text-[10.5px] font-bold">' +
                '<div class="p-1.5 rounded-xl bg-[#f6f8f7] dark:bg-slate-900 border border-slate-200 dark:border-slate-700"><span class="inline-block w-4 h-4 rounded-full border border-slate-400 align-middle mr-1" style="background:' + baseCss + '"></span>空白对照</div>' +
                '<div class="p-1.5 rounded-xl bg-[#f6f8f7] dark:bg-slate-900 border border-slate-200 dark:border-slate-700"><span id="v20CurColorDot" class="inline-block w-4 h-4 rounded-full border border-slate-400 align-middle mr-1" style="background:' + baseCss + '"></span>当前液色</div>' +
                '<div class="p-1.5 rounded-xl bg-[#f6f8f7] dark:bg-slate-900 border border-slate-200 dark:border-slate-700"><span class="inline-block w-4 h-4 rounded-full border border-slate-400 align-middle mr-1" style="background:' + targetCss + '"></span>阳性终点</div>' +
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
