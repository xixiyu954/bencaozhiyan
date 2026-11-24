/**
 * 本草智研 v20 · 板块一第二波：3D 分子结构库 + 粒子级显色反应引擎（MVP）
 * 规范：零构建纯静态 IIFE，零外部依赖（离线可用），仅暴露 window.TCM_V20_VISUALS
 */
(function () {
  "use strict";

  var ATOM_STYLE = {
    C: { color: "#334155", radius: 11, name: "碳 (C)" },
    O: { color: "#dc2626", radius: 12, name: "氧 (O)" },
    N: { color: "#2563eb", radius: 12, name: "氮 (N)" },
    H: { color: "#cbd5e1", radius: 7, name: "氢 (H)" }
  };

  var MOLECULES = {
    menthol: {
      name: "薄荷脑 (Menthol)",
      herb: "薄荷",
      formula: "C₁₀H₂₀O · 单萜醇",
      desc: "环己烷椅式构象，含 1 个仲羟基（-OH）与异丙基，脂溶性强、易随水蒸气共沸。",
      atoms: [
        { x: -1.2, y: 0.4, z: 0.2, el: "C", group: "环己烷骨架" },
        { x: -0.4, y: 1.2, z: -0.3, el: "C", group: "环己烷骨架" },
        { x: 0.8, y: 0.8, z: 0.2, el: "C", group: "环己烷骨架" },
        { x: 1.0, y: -0.5, z: -0.2, el: "C", group: "环己烷骨架" },
        { x: 0.1, y: -1.3, z: 0.3, el: "C", group: "环己烷骨架" },
        { x: -1.1, y: -0.9, z: -0.2, el: "C", group: "环己烷骨架" },
        { x: 1.8, y: 1.5, z: 0.7, el: "O", group: "仲羟基 (-OH · 极性中心)" },
        { x: 2.5, y: 1.2, z: 1.1, el: "H", group: "仲羟基 (-OH · 极性中心)" },
        { x: -2.4, y: 0.8, z: 0.6, el: "C", group: "甲基 (-CH₃ · 亲脂)" },
        { x: 2.2, y: -1.0, z: -0.7, el: "C", group: "异丙基 (亲脂区)" },
        { x: 3.1, y: -0.3, z: -1.3, el: "C", group: "异丙基 (亲脂区)" },
        { x: 2.3, y: -2.2, z: -1.2, el: "C", group: "异丙基 (亲脂区)" }
      ],
      bonds: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[2,6],[6,7],[0,8],[3,9],[9,10],[9,11]]
    },
    tanshinone: {
      name: "丹参酮 IIA (Tanshinone IIA)",
      herb: "丹参",
      formula: "C₁₉H₁₈O₃ · 菲醌类",
      desc: "邻菲醌共轭平面母核 + 呋喃环，显鲜明丹红色，强亲脂性，需高浓度乙醇或低极性溶剂提取。",
      atoms: [
        { x: -2.2, y: 0.7, z: 0.1, el: "C", group: "A环脂环区" },
        { x: -1.1, y: 1.3, z: -0.1, el: "C", group: "A环脂环区" },
        { x: -0.1, y: 0.6, z: 0.0, el: "C", group: "菲醌共轭母核" },
        { x: -0.1, y: -0.7, z: 0.0, el: "C", group: "菲醌共轭母核" },
        { x: -1.2, y: -1.3, z: 0.1, el: "C", group: "A环脂环区" },
        { x: -2.2, y: -0.6, z: -0.1, el: "C", group: "A环脂环区" },
        { x: 1.0, y: 1.2, z: 0.0, el: "C", group: "邻醌羰基 (发色团)" },
        { x: 2.0, y: 0.5, z: 0.0, el: "C", group: "邻醌羰基 (发色团)" },
        { x: 2.0, y: -0.8, z: 0.0, el: "C", group: "呋喃并环" },
        { x: 1.0, y: -1.4, z: 0.0, el: "C", group: "菲醌共轭母核" },
        { x: 1.1, y: 2.4, z: 0.1, el: "O", group: "邻醌羰基 (C=O · 发色团)" },
        { x: 3.1, y: 1.0, z: -0.1, el: "O", group: "邻醌羰基 (C=O · 发色团)" },
        { x: 3.1, y: -1.4, z: 0.0, el: "O", group: "呋喃氧环" },
        { x: 2.7, y: -2.5, z: 0.1, el: "C", group: "呋喃并环" },
        { x: 1.4, y: -2.5, z: 0.0, el: "C", group: "呋喃并环" }
      ],
      bonds: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[2,6],[6,7],[7,8],[8,9],[9,3],[6,10],[7,11],[8,12],[12,13],[13,14],[14,9]]
    },
    baicalin: {
      name: "黄芩苷 (Baicalin)",
      herb: "黄芩",
      formula: "C₂₁H₁₈O₁₁ · 黄酮苷",
      desc: "黄酮母核接葡萄糖醛酸，含邻酚羟基与羧基，遇酶易水解变绿，工艺核心为沸水杀酶保苷。",
      atoms: [
        { x: -2.3, y: 0.5, z: 0.0, el: "C", group: "黄酮A环" },
        { x: -1.3, y: 1.2, z: 0.0, el: "C", group: "黄酮A环" },
        { x: -0.2, y: 0.6, z: 0.0, el: "C", group: "黄酮A/C并环" },
        { x: -0.2, y: -0.7, z: 0.0, el: "C", group: "黄酮A/C并环" },
        { x: -1.3, y: -1.3, z: 0.0, el: "C", group: "黄酮A环" },
        { x: -2.3, y: -0.7, z: 0.0, el: "C", group: "黄酮A环" },
        { x: 0.9, y: 1.2, z: 0.0, el: "O", group: "吡喃酮氧 (C环)" },
        { x: 2.0, y: 0.5, z: 0.1, el: "C", group: "黄酮C环" },
        { x: 2.0, y: -0.7, z: 0.0, el: "C", group: "黄酮C环" },
        { x: 0.9, y: -1.4, z: 0.0, el: "C", group: "4-位羰基 (C=O)" },
        { x: 0.9, y: -2.5, z: 0.0, el: "O", group: "4-位羰基 (C=O · 铝盐络合点)" },
        { x: -3.4, y: 1.0, z: 0.3, el: "O", group: "7-O-葡萄糖醛酸苷键 (酶解位点)" },
        { x: -3.4, y: -1.3, z: -0.2, el: "O", group: "5,6-邻酚羟基 (易氧化变绿)" },
        { x: 3.2, y: 1.0, z: 0.3, el: "C", group: "B环苯环" }
      ],
      bonds: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[2,6],[6,7],[7,8],[8,9],[9,3],[9,10],[0,11],[5,12],[7,13]]
    },
    berberine: {
      name: "小檗碱 (Berberine)",
      herb: "黄连",
      formula: "C₂₀H₁₈NO₄⁺ · 季铵型生物碱",
      desc: "四环共轭季铵碱母核，季铵氮（N⁺）使其在酸性水溶液中溶解度高，常以酸水提取盐析结晶。",
      atoms: [
        { x: -2.4, y: 0.6, z: 0.0, el: "C", group: "异喹啉母核" },
        { x: -1.3, y: 1.2, z: 0.0, el: "C", group: "异喹啉母核" },
        { x: -0.2, y: 0.6, z: 0.0, el: "N", group: "季铵氮中心 (N⁺ · 强亲水)" },
        { x: -0.2, y: -0.7, z: 0.0, el: "C", group: "异喹啉母核" },
        { x: -1.3, y: -1.3, z: 0.0, el: "C", group: "异喹啉母核" },
        { x: -2.4, y: -0.6, z: 0.0, el: "C", group: "异喹啉母核" },
        { x: 0.9, y: 1.2, z: 0.1, el: "C", group: "共轭芳环" },
        { x: 2.0, y: 0.6, z: 0.0, el: "C", group: "共轭芳环" },
        { x: 2.0, y: -0.7, z: 0.0, el: "C", group: "共轭芳环" },
        { x: 0.9, y: -1.3, z: 0.0, el: "C", group: "共轭芳环" },
        { x: -3.5, y: 0.3, z: 0.2, el: "O", group: "亚甲二氧基 (-OCH₂O-)" },
        { x: -3.5, y: -0.9, z: -0.2, el: "O", group: "亚甲二氧基 (-OCH₂O-)" },
        { x: 3.1, y: 1.1, z: 0.2, el: "O", group: "甲氧基 (-OCH₃)" },
        { x: 3.1, y: -1.2, z: -0.2, el: "O", group: "甲氧基 (-OCH₃)" }
      ],
      bonds: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[2,6],[6,7],[7,8],[8,9],[9,3],[0,10],[5,11],[7,12],[8,13]]
    }
  };

  var PARTICLE_REACTIONS = [
    { id: "hcl_mg", name: "盐酸-镁粉反应", target: "黄酮类 (芦丁/黄芩苷)", base: [254, 240, 138], targetRgb: [220, 38, 38], dropColor: "#e2e8f0", bubbles: true, precip: false, desc: "镁粉与盐酸产生氢气气泡，溶液由浅黄扩散渐变为樱红/深红色。" },
    { id: "molish", name: "Molish 紫环反应", target: "糖与苷类 (多糖/芦丁)", base: [248, 250, 252], targetRgb: [126, 34, 206], dropColor: "#a855f7", bubbles: false, precip: true, desc: "浓硫酸沿壁缓加，界面处迅速富集紫红色扩散环。" },
    { id: "fecl3", name: "FeCl₃ 酚羟基显色", target: "酚羟基 (绿原酸/丁香酚)", base: [253, 224, 71], targetRgb: [15, 118, 110], dropColor: "#d97706", bubbles: false, precip: false, desc: "铁离子与邻酚羟基络合，墨绿色粒子云由液面迅速向下扩散。" },
    { id: "dragendorff", name: "改良碘化铋钾", target: "生物碱 (小檗碱/苦参碱)", base: [254, 249, 195], targetRgb: [194, 65, 12], dropColor: "#ea580c", bubbles: false, precip: true, desc: "滴入瞬间生成致密橘红色无定形微粒并向管底沉降。" }
  ];

  var modalEl = null;
  var activeTab = "mol3d";
  var molKey = "menthol";
  var molMode = "ballstick";
  var rotX = 0.35, rotY = 0.55, zoom = 62;
  var dragging = false, lastX = 0, lastY = 0, hoverAtomIdx = -1;
  var molRaf = null;

  var rxnIdx = 0;
  var rxnRaf = null;
  var rxnState = { progress: 0, drops: [], particles: [], ripples: [], bubbles: [] };

  function ensureModal() {
    if (modalEl) return modalEl;
    modalEl = document.createElement("div");
    modalEl.id = "tcmV20VisualModal";
    modalEl.className = "no-print fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/65 backdrop-blur-xs p-3 sm:p-5";
    modalEl.innerHTML =
      '<div class="bg-white rounded-3xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">' +
        '<div class="px-5 py-3.5 bg-gradient-to-r from-[#062922] via-[#0a4538] to-[#0f6b58] text-white flex items-center justify-between gap-3">' +
          '<div class="flex items-center gap-2.5">' +
            '<span class="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-[11px] font-extrabold">3D 实验室</span>' +
            '<h3 class="text-sm sm:text-base font-extrabold">3D 分子结构库 & 粒子级显色反应实验室</h3>' +
          '</div>' +
          '<button type="button" id="v20BtnClose" class="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold">×</button>' +
        '</div>' +
        '<div class="px-5 pt-3 pb-2 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-[#f6f8f7]">' +
          '<div class="inline-flex p-1 rounded-xl bg-white border border-slate-200 text-xs font-extrabold">' +
            '<button type="button" data-v20-tab="mol3d" class="px-3.5 py-1.5 rounded-lg transition">🧬 3D 分子结构库</button>' +
            '<button type="button" data-v20-tab="particles" class="px-3.5 py-1.5 rounded-lg transition">🧪 粒子级显色动画</button>' +
          '</div>' +
          '<span class="text-[11px] text-slate-500 font-semibold">纯前端物理渲染 · 零网络依赖离线可用</span>' +
        '</div>' +
        '<div id="v20Body" class="flex-1 overflow-y-auto p-4 sm:p-5"></div>' +
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
    if (molRaf) { cancelAnimationFrame(molRaf); molRaf = null; }
    if (rxnRaf) { cancelAnimationFrame(rxnRaf); rxnRaf = null; }
  }

  function closeModal() {
    stopLoops();
    if (modalEl) {
      modalEl.classList.add("hidden");
      modalEl.classList.remove("flex");
    }
  }

  function openModal(tab, presetMol) {
    ensureModal();
    if (tab) activeTab = tab;
    if (presetMol && MOLECULES[presetMol]) molKey = presetMol;
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

  function renderModalBody() {
    stopLoops();
    var body = modalEl.querySelector("#v20Body");
    modalEl.querySelectorAll("[data-v20-tab]").forEach(function (b) {
      var on = b.getAttribute("data-v20-tab") === activeTab;
      b.className = "px-3.5 py-1.5 rounded-lg transition " + (on ? "bg-[#064e3b] text-white" : "text-slate-600 hover:text-slate-900");
    });

    if (activeTab === "mol3d") renderMol3dView(body);
    else renderParticlesView(body);
  }

  function renderMol3dView(container) {
    var m = MOLECULES[molKey];
    var molBtns = Object.keys(MOLECULES).map(function (k) {
      var on = k === molKey;
      return '<button type="button" data-v20-mol="' + k + '" class="px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ' +
        (on ? 'bg-[#059669] text-white border-[#059669]' : 'bg-white text-slate-700 border-slate-200 hover:border-[#059669]') + '">' +
        MOLECULES[k].herb + " · " + MOLECULES[k].name.split(" ")[0] + "</button>";
    }).join("");

    var modeBtns = [
      ["ballstick", "球棍模式"],
      ["wireframe", "骨架模式"],
      ["spacefill", "空间填充"]
    ].map(function (pair) {
      var on = pair[0] === molMode;
      return '<button type="button" data-v20-mode="' + pair[0] + '" class="px-2.5 py-1 rounded-lg text-xs font-bold border ' +
        (on ? 'bg-[#f97316] text-white border-[#f97316]' : 'bg-white text-slate-700 border-slate-200') + '">' + pair[1] + "</button>";
    }).join("");

    container.innerHTML =
      '<div class="space-y-4">' +
        '<div class="flex flex-wrap items-center justify-between gap-2">' +
          '<div class="flex flex-wrap gap-1.5">' + molBtns + "</div>" +
          '<div class="flex gap-1.5">' + modeBtns + "</div>" +
        "</div>" +
        '<div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">' +
          '<div class="lg:col-span-8 relative rounded-2xl bg-gradient-to-br from-[#071f1c] to-[#0e3630] border border-emerald-400/25 overflow-hidden">' +
            '<canvas id="v20MolCanvas" width="600" height="360" class="w-full h-[320px] sm:h-[360px] block cursor-grab active:cursor-grabbing"></canvas>' +
            '<div id="v20MolHoverTip" class="pointer-events-none absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-black/55 border border-white/15 text-xs text-emerald-200 font-bold">拖拽 360° 旋转 · 滚轮缩放 · 悬停原子看官能团</div>' +
          "</div>" +
          '<div class="lg:col-span-4 rounded-2xl bg-white border border-slate-200 p-4 flex flex-col justify-between gap-3 text-xs">' +
            '<div class="space-y-2">' +
              '<span class="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#059669] font-extrabold">' + m.formula + "</span>" +
              '<h4 class="text-base font-extrabold text-slate-900">' + m.name + "</h4>" +
              '<p class="text-slate-600 leading-relaxed">' + m.desc + "</p>" +
            "</div>" +
            '<div class="p-3 rounded-xl bg-[#f6f8f7] border border-slate-200/80 space-y-1.5">' +
              '<div class="font-extrabold text-slate-800">原子图例 (CPK)</div>' +
              '<div class="grid grid-cols-2 gap-1.5 text-[11px] font-bold text-slate-700">' +
                '<span><i class="inline-block w-2.5 h-2.5 rounded-full bg-[#334155] mr-1"></i>碳 (C)</span>' +
                '<span><i class="inline-block w-2.5 h-2.5 rounded-full bg-[#dc2626] mr-1"></i>氧 (O)</span>' +
                '<span><i class="inline-block w-2.5 h-2.5 rounded-full bg-[#2563eb] mr-1"></i>氮 (N)</span>' +
                '<span><i class="inline-block w-2.5 h-2.5 rounded-full bg-[#cbd5e1] border border-slate-400 mr-1"></i>氢 (H)</span>' +
              "</div>" +
            "</div>" +
          "</div>" +
        "</div>" +
      "</div>";

    container.querySelectorAll("[data-v20-mol]").forEach(function (b) {
      b.addEventListener("click", function () { molKey = b.getAttribute("data-v20-mol"); renderMol3dView(container); });
    });
    container.querySelectorAll("[data-v20-mode]").forEach(function (b) {
      b.addEventListener("click", function () { molMode = b.getAttribute("data-v20-mode"); renderMol3dView(container); });
    });

    var canvas = container.querySelector("#v20MolCanvas");
    var tip = container.querySelector("#v20MolHoverTip");
    var ctx = canvas.getContext("2d");
    var projected = [];

    canvas.addEventListener("pointerdown", function (e) { dragging = true; lastX = e.clientX; lastY = e.clientY; });
    window.addEventListener("pointerup", function () { dragging = false; });
    canvas.addEventListener("pointermove", function (e) {
      var rect = canvas.getBoundingClientRect();
      var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
      var my = (e.clientY - rect.top) * (canvas.height / rect.height);
      if (dragging) {
        rotY += (e.clientX - lastX) * 0.012;
        rotX += (e.clientY - lastY) * 0.012;
        lastX = e.clientX;
        lastY = e.clientY;
        return;
      }
      hoverAtomIdx = -1;
      for (var i = projected.length - 1; i >= 0; i--) {
        var p = projected[i];
        var dx = mx - p.sx, dy = my - p.sy;
        if (dx * dx + dy * dy <= (p.r + 5) * (p.r + 5)) {
          hoverAtomIdx = p.idx;
          break;
        }
      }
      if (hoverAtomIdx >= 0) {
        var at = m.atoms[hoverAtomIdx];
        tip.textContent = "官能团高亮：" + at.group + " · " + (ATOM_STYLE[at.el] ? ATOM_STYLE[at.el].name : at.el);
      } else {
        tip.textContent = "拖拽 360° 旋转 · 滚轮缩放 · 悬停原子看官能团";
      }
    });
    canvas.addEventListener("wheel", function (e) {
      e.preventDefault();
      zoom = Math.max(36, Math.min(105, zoom - e.deltaY * 0.05));
    }, { passive: false });

    function drawMol() {
      if (!dragging) rotY += 0.004;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      var cx = canvas.width / 2, cy = canvas.height / 2;
      var cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      var cosY = Math.cos(rotY), sinY = Math.sin(rotY);

      var pts = m.atoms.map(function (a, idx) {
        var x1 = a.x * cosY - a.z * sinY;
        var z1 = a.x * sinY + a.z * cosY;
        var y2 = a.y * cosX - z1 * sinX;
        var z2 = a.y * sinX + z1 * cosX;
        var scale = 320 / (320 - z2 * 35);
        var st = ATOM_STYLE[a.el] || ATOM_STYLE.C;
        var r = molMode === "spacefill" ? st.radius * 2.1 : (molMode === "wireframe" ? 3.5 : st.radius);
        return { idx: idx, el: a.el, sx: cx + x1 * zoom * scale, sy: cy + y2 * zoom * scale, z: z2, r: r * scale, color: st.color };
      });

      ctx.lineWidth = molMode === "wireframe" ? 3 : 4;
      m.bonds.forEach(function (pair) {
        var p1 = pts[pair[0]], p2 = pts[pair[1]];
        if (!p1 || !p2) return;
        ctx.strokeStyle = "rgba(226, 232, 240, 0.72)";
        ctx.beginPath();
        ctx.moveTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.stroke();
      });

      projected = pts.slice().sort(function (a, b) { return a.z - b.z; });
      projected.forEach(function (p) {
        var isHover = p.idx === hoverAtomIdx;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, p.r, 0, Math.PI * 2);
        var grad = ctx.createRadialGradient(p.sx - p.r * 0.3, p.sy - p.r * 0.3, p.r * 0.1, p.sx, p.sy, p.r);
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.35, p.color);
        grad.addColorStop(1, "#0f172a");
        ctx.fillStyle = grad;
        ctx.fill();
        if (isHover) {
          ctx.lineWidth = 3;
          ctx.strokeStyle = "#fde047";
          ctx.stroke();
        }
      });

      molRaf = requestAnimationFrame(drawMol);
    }
    drawMol();
  }

  function renderParticlesView(container) {
    var rxn = PARTICLE_REACTIONS[rxnIdx];
    rxnState = { progress: 0, drops: [], particles: [], ripples: [], bubbles: [] };

    var rxnBtns = PARTICLE_REACTIONS.map(function (r, i) {
      var on = i === rxnIdx;
      return '<button type="button" data-v20-rxn="' + i + '" class="px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ' +
        (on ? 'bg-[#059669] text-white border-[#059669]' : 'bg-white text-slate-700 border-slate-200 hover:border-[#059669]') + '">' + r.name + "</button>";
    }).join("");

    container.innerHTML =
      '<div class="space-y-4">' +
        '<div class="flex flex-wrap items-center justify-between gap-2">' +
          '<div class="flex flex-wrap gap-1.5">' + rxnBtns + "</div>" +
          '<div class="flex gap-2">' +
            '<button type="button" id="v20BtnDrop" class="px-4 py-1.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-extrabold shadow-sm">💧 滴加检识试液</button>' +
            '<button type="button" id="v20BtnResetRxn" class="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold">↺ 清洗试管</button>' +
          "</div>" +
        "</div>" +
        '<div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">' +
          '<div class="lg:col-span-7 rounded-2xl bg-gradient-to-b from-[#071f1c] to-[#0b2d24] border border-emerald-400/25 overflow-hidden flex justify-center">' +
            '<canvas id="v20RxnCanvas" width="460" height="340" class="w-full max-w-[460px] h-[320px] block"></canvas>' +
          "</div>" +
          '<div class="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-4 space-y-3 text-xs">' +
            '<span class="inline-block px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 font-extrabold">' + rxn.target + "</span>" +
            '<h4 class="text-base font-extrabold text-slate-900">' + rxn.name + "</h4>" +
            '<p class="text-slate-600 leading-relaxed">' + rxn.desc + "</p>" +
            '<div class="p-3 rounded-xl bg-[#f6f8f7] border border-slate-200/80 space-y-1">' +
              '<div class="font-extrabold text-slate-800">反应进程</div>' +
              '<div class="w-full h-2 rounded-full bg-slate-200 overflow-hidden"><div id="v20RxnBar" class="h-full bg-[#059669] transition-all duration-200" style="width:0%"></div></div>' +
              '<div id="v20RxnStatus" class="text-[11px] text-slate-600 pt-1">点击「滴加检识试液」观察液面冲击波与粒子扩散渐变。</div>' +
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
        desc: "360° 旋转观察丹参酮、黄芩苷、薄荷脑、小檗碱立体构象，体验粒子级滴加显色动画。",
        onOpen: function () { openModal("mol3d"); }
      });
    }

    var s1Title = document.getElementById("s1HerbTitle");
    if (s1Title && s1Title.parentNode && !document.getElementById("v20BtnQuickMol")) {
      var btn = document.createElement("button");
      btn.id = "v20BtnQuickMol";
      btn.type = "button";
      btn.className = "mt-1.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-extrabold transition";
      btn.textContent = "🧬 查看 3D 分子与粒子显色";
      btn.addEventListener("click", function () {
        var txt = (s1Title.textContent || "");
        var key = /丹参/.test(txt) ? "tanshinone" : (/黄芩/.test(txt) ? "baicalin" : (/黄连|小檗/.test(txt) ? "berberine" : "menthol"));
        openModal("mol3d", key);
      });
      s1Title.parentNode.appendChild(btn);
    }
  }

  window.TCM_V20_VISUALS = {
    version: "1.0.0",
    openMol3d: function (key) { openModal("mol3d", key); },
    openParticles: function () { openModal("particles"); }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", registerIntegrations);
  } else {
    registerIntegrations();
  }
})();
