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
    { id: "hcl_mg", name: "盐酸-镁粉反应", target: "黄酮类 (芦丁/黄芩苷)", base: [254, 240, 138], targetRgb: [220, 38, 38], dropColor: "#e2e8f0", bubbles: true, precip: false, desc: "镁粉与盐酸产生氢气气泡，溶液由浅黄扩散渐变为樱红/深红色。" },
    { id: "molish", name: "Molish 紫环反应", target: "糖与苷类 (多糖/芦丁)", base: [248, 250, 252], targetRgb: [126, 34, 206], dropColor: "#a855f7", bubbles: false, precip: true, desc: "浓硫酸沿壁缓加，界面处迅速富集紫红色扩散环。" },
    { id: "fecl3", name: "FeCl₃ 酚羟基显色", target: "酚羟基 (绿原酸/丁香酚)", base: [253, 224, 71], targetRgb: [15, 118, 110], dropColor: "#d97706", bubbles: false, precip: false, desc: "铁离子与邻酚羟基络合，墨绿色粒子云由液面迅速向下扩散。" },
    { id: "dragendorff", name: "改良碘化铋钾", target: "生物碱 (小檗碱/苦参碱)", base: [254, 249, 195], targetRgb: [194, 65, 12], dropColor: "#ea580c", bubbles: false, precip: true, desc: "滴入瞬间生成致密橘红色无定形微粒并向管底沉降。" }
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
    var rxn = PARTICLE_REACTIONS[rxnIdx];
    rxnState = { progress: 0, drops: [], particles: [], ripples: [], bubbles: [] };

    var rxnBtns = PARTICLE_REACTIONS.map(function (r, i) {
      var on = i === rxnIdx;
      return '<button type="button" data-v20-rxn="' + i + '" class="px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ' +
        (on ? 'bg-[#059669] text-white border-[#059669]' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-[#059669]') + '">' + r.name + "</button>";
    }).join("");

    container.innerHTML =
      '<div class="space-y-4">' +
        '<div class="flex flex-wrap items-center justify-between gap-2">' +
          '<div class="flex flex-wrap gap-1.5">' + rxnBtns + "</div>" +
          '<div class="flex gap-2">' +
            '<button type="button" id="v20BtnDrop" class="px-4 py-1.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-extrabold shadow-sm">💧 滴加检识试液</button>' +
            '<button type="button" id="v20BtnResetRxn" class="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold">↺ 清洗试管</button>' +
          "</div>" +
        "</div>" +
        '<div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">' +
          '<div class="lg:col-span-7 rounded-2xl bg-gradient-to-b from-[#071f1c] to-[#0b2d24] border border-emerald-400/25 overflow-hidden flex justify-center">' +
            '<canvas id="v20RxnCanvas" width="460" height="340" class="w-full max-w-[460px] h-[320px] block"></canvas>' +
          "</div>" +
          '<div class="lg:col-span-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 space-y-3 text-xs">' +
            '<span class="inline-block px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 font-extrabold">' + rxn.target + "</span>" +
            '<h4 class="text-base font-extrabold text-slate-900 dark:text-white">' + rxn.name + "</h4>" +
            '<p class="text-slate-600 dark:text-slate-300 leading-relaxed">' + rxn.desc + "</p>" +
            '<div class="p-3 rounded-xl bg-[#f6f8f7] dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-700 space-y-1">' +
              '<div class="font-extrabold text-slate-800 dark:text-slate-200">反应进程</div>' +
              '<div class="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"><div id="v20RxnBar" class="h-full bg-[#059669] transition-all duration-200" style="width:0%"></div></div>' +
              '<div id="v20RxnStatus" class="text-[11px] text-slate-600 dark:text-slate-400 pt-1">点击「滴加检识试液」观察液面冲击波与粒子扩散渐变。</div>' +
            "</div>" +
          "</div>" +
        "</div>" +
      "</div>";

    container.querySelectorAll("[data-v20-rxn]").forEach(function (b) {
      b.addEventListener("click", function () { rxnIdx = Number(b.getAttribute("data-v20-rxn")); renderParticlesView(container); });
    });

    var canvas = container.querySelector("#v20RxnCanvas");
    var ctx = canvas.getContext("2d");
    var barEl = container.querySelector("#v20RxnBar");
    var statusEl = container.querySelector("#v20RxnStatus");

    function triggerDrop() {
      rxnState.drops.push({ x: 230, y: 52, vy: 2.2 });
    }

    container.querySelector("#v20BtnDrop").addEventListener("click", triggerDrop);
    container.querySelector("#v20BtnResetRxn").addEventListener("click", function () {
      rxnState = { progress: 0, drops: [], particles: [], ripples: [], bubbles: [] };
      if (barEl) barEl.style.width = "0%";
      if (statusEl) statusEl.textContent = "试管已清洗，请重新滴加试剂。";
    });

    function drawRxn() {
      if (myRxnToken !== rxnRenderToken) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#cbd5e1";
      ctx.fillRect(222, 10, 16, 26);
      ctx.beginPath();
      ctx.moveTo(224, 36); ctx.lineTo(236, 36); ctx.lineTo(232, 52); ctx.lineTo(228, 52);
      ctx.fill();

      var tx = 165, ty = 95, tw = 130, th = 215, liquidY = 165;
      var p = Math.min(1, rxnState.progress);
      var r = Math.round(rxn.base[0] + (rxn.targetRgb[0] - rxn.base[0]) * p);
      var g = Math.round(rxn.base[1] + (rxn.targetRgb[1] - rxn.base[1]) * p);
      var b = Math.round(rxn.base[2] + (rxn.targetRgb[2] - rxn.base[2]) * p);

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(tx, ty, tw, th, [8, 8, 65, 65]);
      ctx.clip();

      ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
      ctx.fillRect(tx, liquidY, tw, ty + th - liquidY);

      for (var i = rxnState.particles.length - 1; i >= 0; i--) {
        var pt = rxnState.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vx *= 0.985;
        pt.vy = rxn.precip ? Math.min(1.6, pt.vy + 0.03) : pt.vy * 0.985;
        if (pt.x < tx + 8 || pt.x > tx + tw - 8) pt.vx *= -0.8;
        if (pt.y > ty + th - 10) { pt.y = ty + th - 10; pt.vy = 0; pt.vx *= 0.6; }
        pt.life -= 0.005;
        ctx.fillStyle = "rgba(" + rxn.targetRgb[0] + "," + rxn.targetRgb[1] + "," + rxn.targetRgb[2] + "," + Math.max(0.15, pt.life) + ")";
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        if (pt.life <= 0) rxnState.particles.splice(i, 1);
      }

      if (rxn.bubbles && p > 0.1 && Math.random() < 0.35) {
        rxnState.bubbles.push({ x: tx + 20 + Math.random() * (tw - 40), y: ty + th - 15, vy: -1.4 - Math.random() * 1.2, r: 2 + Math.random() * 2.5 });
      }
      for (var k = rxnState.bubbles.length - 1; k >= 0; k--) {
        var bb = rxnState.bubbles[k];
        bb.y += bb.vy;
        ctx.strokeStyle = "rgba(255,255,255,0.75)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(bb.x, bb.y, bb.r, 0, Math.PI * 2);
        ctx.stroke();
        if (bb.y < liquidY) rxnState.bubbles.splice(k, 1);
      }

      for (var j = rxnState.ripples.length - 1; j >= 0; j--) {
        var rp = rxnState.ripples[j];
        rp.rad += 1.8;
        rp.alpha -= 0.03;
        ctx.strokeStyle = "rgba(255,255,255," + Math.max(0, rp.alpha) + ")";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(230, liquidY + 2, rp.rad, rp.rad * 0.25, 0, 0, Math.PI * 2);
        ctx.stroke();
        if (rp.alpha <= 0) rxnState.ripples.splice(j, 1);
      }
      ctx.restore();

      ctx.strokeStyle = "rgba(255,255,255,0.78)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(tx, ty, tw, th, [8, 8, 65, 65]);
      ctx.stroke();

      for (var d = rxnState.drops.length - 1; d >= 0; d--) {
        var dr = rxnState.drops[d];
        dr.vy += 0.25;
        dr.y += dr.vy;
        ctx.fillStyle = rxn.dropColor;
        ctx.beginPath();
        ctx.arc(dr.x, dr.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
        if (dr.y >= liquidY) {
          rxnState.drops.splice(d, 1);
          rxnState.ripples.push({ rad: 4, alpha: 0.9 });
          rxnState.progress = Math.min(1, rxnState.progress + 0.34);
          for (var n = 0; n < 48; n++) {
            rxnState.particles.push({
              x: 230 + (Math.random() - 0.5) * 16,
              y: liquidY + 4,
              vx: (Math.random() - 0.5) * 2.8,
              vy: 0.6 + Math.random() * 2.4,
              size: 2 + Math.random() * 3.5,
              life: 1
            });
          }
          if (barEl) barEl.style.width = Math.round(rxnState.progress * 100) + "%";
          if (statusEl) {
            statusEl.textContent = rxnState.progress >= 0.95 ? "✅ 显色终点已达：" + rxn.desc : "正在扩散显色，可继续滴加直至终点...";
          }
        }
      }

      rxnRaf = requestAnimationFrame(drawRxn);
    }
    drawRxn();
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
    getRotY: function () { return rotY; }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", registerIntegrations);
  } else {
    registerIntegrations();
  }
})();
