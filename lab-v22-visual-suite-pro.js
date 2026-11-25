/**
 * 本草智研 v22 · 板块一深度补全套件（现代 Bento 交互风格）
 * 规范：零构建 IIFE，零外部依赖，仅向 window 暴露 TCM_V22_VISUAL_SUITE
 */
(function () {
  "use strict";

  var modalEl = null;
  var activeTab = "vlab";
  var animId = null;
  var vlab3dInstance = null;
  var fluidSimInstance = null;
  var cockpitInstance = null;

  var vlab = {
    x: 240,
    y: 230,
    zone: "实验台",
    rig: "reflux",
    pickedReagent: "70% 乙醇",
    stepDone: [false, false, false]
  };
  var keysDown = {};

  var ZONES = [
    { name: "试剂架", x: 110, y: 85, r: 52, tip: "选取 70% 乙醇 / 乙酸乙酯 / 纯化水等实验溶剂" },
    { name: "精密天平区", x: 390, y: 85, r: 52, tip: "称量药材饮片与试剂，核对天平水平泡与归零" },
    { name: "通风橱", x: 115, y: 245, r: 56, tip: "有机溶剂回流与萃取操作区，保持排风开启" },
    { name: "实验台", x: 385, y: 245, r: 56, tip: "旗舰装置（回流提取 / HPLC / 旋蒸）主操作台" }
  ];

  var FLAGSHIP_RIGS = {
    reflux: {
      name: "回流提取装置",
      steps: ["装入药材与溶剂并加沸石", "冷凝水下进上出并控温微沸", "回流结束后断热冷却再取样"]
    },
    hplc: {
      name: "HPLC 高效液相色谱",
      steps: ["流动相 0.45 μm 过滤超声脱气", "供试品 0.22 μm 滤膜过滤进样", "核对保留时间与峰面积后冲柱"]
    },
    rotavap: {
      name: "减压旋转蒸发仪",
      steps: ["检查收集瓶与防溅球密封", "设定真空度与水浴温差（约 +20℃）", "先放气破真空再停泵取浸膏"]
    }
  };

  var fluid = {
    mode: "layer",
    turbulence: 0.2,
    demulsify: 0,
    titrVol: 0,
    particles: []
  };

  var AR_CARDS = [
    { name: "丹参", comp: "丹参酮 IIA · 丹酚酸 B", polarity: "脂溶性酮类 + 水溶性酚酸", rig: "回流提取 / D101 大孔树脂", note: "脂水双提兼顾亲脂与亲水活性成分，注意防氧化与乳化。" },
    { name: "黄芩", comp: "黄芩苷 · 汉黄芩苷", polarity: "中等极性黄酮苷", rig: "沸水杀酶 / 酸沉精制", note: "切忌常温久置酶解变绿，建议沸水短时提取。" },
    { name: "薄荷", comp: "薄荷脑 · 挥发油", polarity: "低极性挥发性单萜", rig: "水蒸气蒸馏 / 挥发油测定器", note: "先通冷凝水再加热，注意控制蒸馏速率与防倒吸。" },
    { name: "黄连", comp: "小檗碱", polarity: "季铵型生物碱", rig: "酸水提取 / 盐析结晶", note: "酸性条件下溶解度高，注意 pH 控制与试剂安全。" }
  ];
  var arIndex = 0;
  var arStream = null;

  function ensureModal() {
    if (modalEl) return modalEl;
    modalEl = document.createElement("div");
    modalEl.id = "tcmV22Modal";
    modalEl.className = "no-print fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/65 backdrop-blur-xs p-3 sm:p-5";
    modalEl.innerHTML =
      '<div class="bg-white rounded-3xl border border-slate-200 max-w-6xl w-full max-h-[93vh] flex flex-col shadow-2xl overflow-hidden">' +
        '<div class="px-5 py-3.5 bg-gradient-to-r from-[#062922] via-[#0a4538] to-[#0f6b58] text-white flex items-center justify-between gap-3">' +
          '<div class="flex items-center gap-2.5">' +
            '<span class="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-[11px] font-extrabold">3D 视觉体验舱</span>' +
            '<h3 class="text-sm sm:text-base font-extrabold">3D 虚拟实验室 · 物理流体仿真 · 驾驶舱大屏 · AR 药材卡</h3>' +
          '</div>' +
          '<button type="button" id="v22BtnClose" aria-label="关闭弹窗" class="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-lg leading-none">×</button>' +
        '</div>' +
        '<div class="px-5 pt-3 pb-2 border-b border-slate-100 bg-[#f6f8f7] flex flex-wrap items-center justify-between gap-2">' +
          '<div class="inline-flex flex-wrap p-1 rounded-xl bg-white border border-slate-200 text-xs font-extrabold">' +
            '<button type="button" data-v22-tab="vlab" class="px-3.5 py-1.5 rounded-lg transition">🕹️ 第一人称 3D 实验室</button>' +
            '<button type="button" data-v22-tab="fluid" class="px-3.5 py-1.5 rounded-lg transition">🌊 物理流体仿真</button>' +
            '<button type="button" data-v22-tab="cockpit" class="px-3.5 py-1.5 rounded-lg transition">📊 驾驶舱大屏</button>' +
            '<button type="button" data-v22-tab="ar" class="px-3.5 py-1.5 rounded-lg transition">📱 AR 药材卡</button>' +
          '</div>' +
          '<span class="text-[11px] text-slate-500 font-semibold">实时物理溶剂内核 · 3D 雷达投影 · 离线零外链</span>' +
        '</div>' +
        '<div id="v22Body" class="flex-1 overflow-y-auto p-4 sm:p-5"></div>' +
      '</div>';

    document.body.appendChild(modalEl);

    modalEl.querySelector("#v22BtnClose").addEventListener("click", closeModal);
    modalEl.addEventListener("click", function (e) {
      if (e.target === modalEl) closeModal();
      var tabBtn = e.target.closest("[data-v22-tab]");
      if (tabBtn) {
        activeTab = tabBtn.getAttribute("data-v22-tab");
        stopLoop();
        stopCamera();
        renderTab();
      }
    });

    window.addEventListener("keydown", function (e) {
      if (!modalEl || modalEl.classList.contains("hidden")) return;
      if (e.key === "Escape") { closeModal(); return; }
      var tag = (document.activeElement && document.activeElement.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      keysDown[e.key.toLowerCase()] = true;
    });
    window.addEventListener("keyup", function (e) {
      keysDown[e.key.toLowerCase()] = false;
    });

    return modalEl;
  }

  function stopLoop() {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    if (vlab3dInstance && typeof vlab3dInstance.destroy === "function") {
      vlab3dInstance.destroy();
      vlab3dInstance = null;
    }
    if (fluidSimInstance && typeof fluidSimInstance.destroy === "function") {
      fluidSimInstance.destroy();
      fluidSimInstance = null;
    }
    if (cockpitInstance && typeof cockpitInstance.destroy === "function") {
      cockpitInstance.destroy();
      cockpitInstance = null;
    }
  }

  function stopCamera() {
    if (arStream) {
      arStream.getTracks().forEach(function (t) { t.stop(); });
      arStream = null;
    }
  }

  function openModal(tab) {
    ensureModal();
    if (tab) activeTab = tab;
    modalEl.classList.remove("hidden");
    modalEl.classList.add("flex");
    renderTab();
  }

  function closeModal() {
    stopLoop();
    stopCamera();
    if (modalEl) {
      modalEl.classList.add("hidden");
      modalEl.classList.remove("flex");
    }
  }

  function renderTab() {
    modalEl.querySelectorAll("[data-v22-tab]").forEach(function (b) {
      var on = b.getAttribute("data-v22-tab") === activeTab;
      b.className = "px-3.5 py-1.5 rounded-lg transition " + (on ? "bg-[#064e3b] text-white" : "text-slate-600 hover:text-slate-900");
    });
    var body = modalEl.querySelector("#v22Body");
    if (activeTab === "vlab") renderVlab(body);
    else if (activeTab === "fluid") renderFluid(body);
    else if (activeTab === "cockpit") renderCockpit(body);
    else renderArCard(body);
  }

  function renderVlab(container) {
    stopLoop();
    if (window.TCM_V22_VLAB3D && typeof window.TCM_V22_VLAB3D.mount === "function") {
      vlab3dInstance = window.TCM_V22_VLAB3D.mount(container);
      return;
    }
    if (typeof window.__loadTcmVlab3d === "function") {
      container.innerHTML =
        '<div class="rounded-2xl bg-[#071f1b] border border-emerald-500/25 min-h-[420px] flex flex-col items-center justify-center gap-3 text-emerald-100 p-6">' +
          '<div class="w-10 h-10 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin"></div>' +
          '<div class="text-sm font-extrabold">正在按需加载 Three.js 3D 第一人称实景实验室…</div>' +
          '<div class="text-xs text-emerald-200/75">包含 10m×8m 实验室场景、三层 17 件配型试剂架与丹参回流 7 步 SOP</div>' +
        '</div>';
      window.__loadTcmVlab3d().then(function () {
        if (modalEl && !modalEl.classList.contains("hidden") && activeTab === "vlab" && window.TCM_V22_VLAB3D) {
          vlab3dInstance = window.TCM_V22_VLAB3D.mount(container);
        }
      }).catch(function () {
        if (modalEl && !modalEl.classList.contains("hidden") && activeTab === "vlab") {
          renderVlabFallback2d(container);
        }
      });
      return;
    }
    renderVlabFallback2d(container);
  }

  function renderVlabFallback2d(container) {
    var rigObj = FLAGSHIP_RIGS[vlab.rig];
    container.innerHTML =
      '<div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">' +
        '<div class="lg:col-span-7 space-y-2.5">' +
          '<div class="relative rounded-2xl bg-[#0b1f1c] border border-emerald-500/25 overflow-hidden">' +
            '<canvas id="v22VlabCanvas" width="500" height="330" class="w-full h-[300px] sm:h-[330px] block"></canvas>' +
            '<div class="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 text-emerald-200 text-xs font-bold">当前工位：<span id="v22ZoneName">' + vlab.zone + '</span></div>' +
          '</div>' +
          '<div class="flex flex-wrap items-center justify-between gap-2 text-xs bg-[#f6f8f7] p-3 rounded-2xl border border-slate-200/80">' +
            '<span class="text-slate-600 font-semibold">移动：<strong>WASD</strong> / 方向键 或点击下方摇杆</span>' +
            '<div class="flex items-center gap-1.5">' +
              '<button type="button" data-v22-move="0,-14" class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-bold">↑</button>' +
              '<button type="button" data-v22-move="-14,0" class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-bold">←</button>' +
              '<button type="button" data-v22-move="0,14" class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-bold">↓</button>' +
              '<button type="button" data-v22-move="14,0" class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-bold">→</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-4 space-y-3 text-xs">' +
          '<div class="flex flex-wrap gap-1.5">' +
            Object.keys(FLAGSHIP_RIGS).map(function (k) {
              var on = k === vlab.rig;
              return '<button type="button" data-v22-rig="' + k + '" class="px-2.5 py-1.5 rounded-xl font-extrabold border ' +
                (on ? 'bg-[#059669] text-white border-[#059669]' : 'bg-slate-50 text-slate-700 border-slate-200') + '">' + FLAGSHIP_RIGS[k].name + "</button>";
            }).join("") +
          '</div>' +
          '<div id="v22ZoneTip" class="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 font-semibold"></div>' +
          '<div class="space-y-1.5">' +
            '<div class="font-extrabold text-slate-900">实操检查点（点击打卡）</div>' +
            rigObj.steps.map(function (st, idx) {
              var checked = vlab.stepDone[idx];
              return '<button type="button" data-v22-step="' + idx + '" class="w-full text-left p-2.5 rounded-xl border flex items-center justify-between gap-2 transition ' +
                (checked ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700') + '">' +
                '<span>' + (idx + 1) + ". " + st + "</span>" +
                '<span class="text-xs font-extrabold">' + (checked ? "✓" : "待做") + "</span></button>";
            }).join("") +
          '</div>' +
        '</div>' +
      '</div>';

    container.querySelectorAll("[data-v22-rig]").forEach(function (b) {
      b.addEventListener("click", function () {
        vlab.rig = b.getAttribute("data-v22-rig");
        vlab.stepDone = [false, false, false];
        renderTab();
      });
    });

    container.querySelectorAll("[data-v22-move]").forEach(function (b) {
      b.addEventListener("click", function () {
        var parts = b.getAttribute("data-v22-move").split(",");
        vlab.x = Math.max(36, Math.min(464, vlab.x + Number(parts[0])));
        vlab.y = Math.max(36, Math.min(294, vlab.y + Number(parts[1])));
      });
    });

    container.querySelectorAll("[data-v22-step]").forEach(function (b) {
      b.addEventListener("click", function () {
        var i = Number(b.getAttribute("data-v22-step"));
        vlab.stepDone[i] = !vlab.stepDone[i];
        renderTab();
      });
    });

    var canvas = container.querySelector("#v22VlabCanvas");
    var ctx = canvas.getContext("2d");
    var zoneEl = container.querySelector("#v22ZoneName");
    var tipEl = container.querySelector("#v22ZoneTip");

    function updateZone() {
      var nearest = ZONES[3];
      var bestD = 999999;
      ZONES.forEach(function (z) {
        var d = Math.hypot(vlab.x - z.x, vlab.y - z.y);
        if (d < bestD) { bestD = d; nearest = z; }
      });
      vlab.zone = nearest.name;
      if (zoneEl) zoneEl.textContent = nearest.name;
      if (tipEl) tipEl.textContent = "【" + nearest.name + "】" + nearest.tip + " · 当前旗舰：" + rigObj.name;
    }

    function stepVlab() {
      var spd = 3.2;
      if (keysDown["w"] || keysDown["arrowup"]) vlab.y -= spd;
      if (keysDown["s"] || keysDown["arrowdown"]) vlab.y += spd;
      if (keysDown["a"] || keysDown["arrowleft"]) vlab.x -= spd;
      if (keysDown["d"] || keysDown["arrowright"]) vlab.x += spd;
      vlab.x = Math.max(36, Math.min(464, vlab.x));
      vlab.y = Math.max(36, Math.min(294, vlab.y));
      updateZone();

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(167,243,208,0.08)";
      ctx.lineWidth = 1;
      for (var gx = 0; gx < canvas.width; gx += 40) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, canvas.height); ctx.stroke();
      }
      for (var gy = 0; gy < canvas.height; gy += 40) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(canvas.width, gy); ctx.stroke();
      }

      ZONES.forEach(function (z) {
        var isCur = z.name === vlab.zone;
        ctx.fillStyle = isCur ? "rgba(16, 185, 129, 0.24)" : "rgba(255, 255, 255, 0.06)";
        ctx.strokeStyle = isCur ? "#34d399" : "rgba(148, 163, 184, 0.35)";
        ctx.lineWidth = isCur ? 2.5 : 1.5;
        ctx.beginPath();
        ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(z.name, z.x, z.y + 4);
      });

      ctx.fillStyle = "#f97316";
      ctx.beginPath();
      ctx.arc(vlab.x, vlab.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      animId = requestAnimationFrame(stepVlab);
    }
    stepVlab();
  }

  function renderFluid(container) {
    stopLoop();
    if (window.TCM_V22_FLUID_SIM && typeof window.TCM_V22_FLUID_SIM.mount === "function") {
      fluidSimInstance = window.TCM_V22_FLUID_SIM.mount(container);
      return;
    }
    container.innerHTML =
      '<div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">' +
        '<div class="lg:col-span-7 rounded-2xl bg-[#091b18] border border-emerald-500/25 overflow-hidden flex justify-center">' +
          '<canvas id="v22FluidCanvas" width="460" height="320" class="w-full max-w-[460px] h-[300px] sm:h-[320px] block"></canvas>' +
        '</div>' +
        '<div class="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-4 space-y-3.5 text-xs">' +
          '<div class="flex flex-wrap gap-1.5">' +
            '<button type="button" data-v22-fmode="layer" class="px-3 py-1.5 rounded-xl font-extrabold border ' + (fluid.mode === "layer" ? "bg-[#059669] text-white border-[#059669]" : "bg-slate-50 text-slate-700 border-slate-200") + '">两相分层/破乳</button>' +
            '<button type="button" data-v22-fmode="titration" class="px-3 py-1.5 rounded-xl font-extrabold border ' + (fluid.mode === "titration" ? "bg-[#059669] text-white border-[#059669]" : "bg-slate-50 text-slate-700 border-slate-200") + '">滴定终点突变</button>' +
          '</div>' +
          (fluid.mode === "layer"
            ? '<div class="space-y-3">' +
                '<div><div class="flex justify-between font-bold mb-1"><span>振摇乳化强度</span><span>' + Math.round(fluid.turbulence * 100) + '%</span></div>' +
                '<input id="v22TurbSlider" type="range" min="0" max="1" step="0.05" value="' + fluid.turbulence + '" class="w-full accent-emerald-600" /></div>' +
                '<button type="button" id="v22BtnDemulsify" class="w-full py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-extrabold">🧂 加入饱和 NaCl / 静置破乳</button>' +
                '<p class="text-slate-600 leading-relaxed">观察上层有机相（琥珀/浅色）与下层水相（翠绿/深色）在剧烈振摇时的乳化分散，以及加入电解质静置后的重新分层。</p>' +
              '</div>'
            : '<div class="space-y-3">' +
                '<button type="button" id="v22BtnTitrate" class="w-full py-2.5 rounded-xl bg-[#064e3b] hover:bg-[#062922] text-white font-extrabold">💧 滴加标准液 (+2 mL，临近 10 mL 终点)</button>' +
                '<button type="button" id="v22BtnResetTitrate" class="w-full py-2 rounded-xl bg-slate-100 text-slate-700 font-bold">↺ 重置滴定</button>' +
                '<div class="p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800">当前滴加量：<span id="v22TitrVal">' + fluid.titrVol + ' mL</span>（终点阈值：10 mL 颜色突变）</div>' +
              '</div>') +
        '</div>' +
      '</div>';

    container.querySelectorAll("[data-v22-fmode]").forEach(function (b) {
      b.addEventListener("click", function () {
        fluid.mode = b.getAttribute("data-v22-fmode");
        renderTab();
      });
    });

    var turb = container.querySelector("#v22TurbSlider");
    if (turb) turb.addEventListener("input", function () { fluid.turbulence = Number(turb.value); });

    var demBtn = container.querySelector("#v22BtnDemulsify");
    if (demBtn) demBtn.addEventListener("click", function () {
      fluid.turbulence = Math.max(0.05, fluid.turbulence - 0.55);
      renderTab();
    });

    var titBtn = container.querySelector("#v22BtnTitrate");
    if (titBtn) titBtn.addEventListener("click", function () {
      fluid.titrVol = Math.min(16, fluid.titrVol + 2);
      var lbl = container.querySelector("#v22TitrVal");
      if (lbl) lbl.textContent = fluid.titrVol + " mL" + (fluid.titrVol >= 10 ? " · ✨ 终点突变！" : "");
    });

    var rstBtn = container.querySelector("#v22BtnResetTitrate");
    if (rstBtn) rstBtn.addEventListener("click", function () {
      fluid.titrVol = 0;
      renderTab();
    });

    var canvas = container.querySelector("#v22FluidCanvas");
    var ctx = canvas.getContext("2d");
    var t = 0;

    function drawFluid() {
      t += 0.06;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      var bx = 140, by = 50, bw = 180, bh = 220;
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.lineWidth = 3;
      ctx.strokeRect(bx, by, bw, bh);

      if (fluid.mode === "layer") {
        ctx.fillStyle = "rgba(16, 185, 129, 0.72)";
        ctx.fillRect(bx + 2, by + 115, bw - 4, bh - 117);
        ctx.fillStyle = "rgba(245, 158, 11, 0.72)";
        ctx.fillRect(bx + 2, by + 40, bw - 4, 75);

        var count = Math.round(fluid.turbulence * 70);
        for (var i = 0; i < count; i++) {
          var px = bx + 12 + ((i * 37 + Math.sin(t + i) * 18 * fluid.turbulence) % (bw - 24));
          var py = by + 115 + Math.sin(t * 1.4 + i) * (55 * fluid.turbulence);
          ctx.fillStyle = i % 2 === 0 ? "rgba(253,230,138,0.8)" : "rgba(167,243,208,0.8)";
          ctx.beginPath();
          ctx.arc(px, py, 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        var reached = fluid.titrVol >= 10;
        ctx.fillStyle = reached ? "rgba(236, 72, 153, 0.85)" : "rgba(226, 232, 240, 0.55)";
        ctx.fillRect(bx + 2, by + 70, bw - 4, bh - 72);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(reached ? "终点色变完成 (pH 突变)" : "滴定进行中...", bx + bw / 2, by + 170);
      }

      animId = requestAnimationFrame(drawFluid);
    }
    drawFluid();
  }

  function renderCockpit(container) {
    stopLoop();
    if (window.TCM_V22_COCKPIT && typeof window.TCM_V22_COCKPIT.mount === "function") {
      cockpitInstance = window.TCM_V22_COCKPIT.mount(container);
      return;
    }
    container.innerHTML = '<div class="p-6 text-center text-sm text-slate-500">驾驶舱数据大屏加载中...</div>';
  }

  function renderArCard(container) {
    var card = AR_CARDS[arIndex];
    container.innerHTML =
      '<div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">' +
        '<div class="lg:col-span-7 relative rounded-2xl bg-[#091b18] border border-emerald-500/25 overflow-hidden min-h-[290px] flex items-center justify-center">' +
          '<video id="v22ArVideo" autoplay playsinline class="w-full h-[290px] object-cover hidden"></video>' +
          '<div id="v22ArSimView" class="p-6 text-center space-y-2 text-white">' +
            '<div class="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold">AR 识别视角 · ' + card.name + '</div>' +
            '<div class="text-2xl font-black tracking-wide pt-1">' + card.name + '</div>' +
            '<div class="text-xs text-teal-200/85 max-w-md mx-auto">将教材药材卡置于镜头前，或点击右侧「启动摄像头 AR」体验实景叠加；无摄像头亦可直接切换下方药材卡。</div>' +
          '</div>' +
        '</div>' +
        '<div class="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-4 space-y-3 text-xs">' +
          '<div class="flex flex-wrap gap-1.5">' +
            AR_CARDS.map(function (c, i) {
              var on = i === arIndex;
              return '<button type="button" data-v22-ar="' + i + '" class="px-3 py-1.5 rounded-xl font-extrabold border ' +
                (on ? 'bg-[#059669] text-white border-[#059669]' : 'bg-slate-50 text-slate-700 border-slate-200') + '">' + c.name + "</button>";
            }).join("") +
          '</div>' +
          '<div class="p-3.5 rounded-2xl bg-[#f6f8f7] border border-slate-200/80 space-y-1.5">' +
            '<div class="font-extrabold text-slate-900">核心成分：' + card.comp + '</div>' +
            '<div class="text-slate-700">极性特征：' + card.polarity + '</div>' +
            '<div class="text-[#047857] font-bold">推荐装置：' + card.rig + '</div>' +
            '<p class="text-slate-600 leading-relaxed pt-1">' + card.note + '</p>' +
          '</div>' +
          '<div class="flex gap-2">' +
            '<button type="button" id="v22BtnCamOn" class="flex-1 py-2 rounded-xl bg-[#064e3b] text-white font-extrabold">📷 启动摄像头 AR</button>' +
            '<button type="button" id="v22BtnCamOff" class="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold">关闭镜头</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    container.querySelectorAll("[data-v22-ar]").forEach(function (b) {
      b.addEventListener("click", function () {
        arIndex = Number(b.getAttribute("data-v22-ar"));
        renderTab();
      });
    });

    var vid = container.querySelector("#v22ArVideo");
    var sim = container.querySelector("#v22ArSimView");
    container.querySelector("#v22BtnCamOn").addEventListener("click", function () {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function (stream) {
        stopCamera();
        arStream = stream;
        vid.srcObject = stream;
        vid.classList.remove("hidden");
        sim.classList.add("hidden");
      }).catch(function () {
        if (sim) sim.innerHTML = '<div class="text-amber-300 font-bold">未检测到可用摄像头或权限已拒绝，已保持虚拟 AR 卡预览。</div>';
      });
    });

    container.querySelector("#v22BtnCamOff").addEventListener("click", function () {
      stopCamera();
      if (vid) vid.classList.add("hidden");
      if (sim) sim.classList.remove("hidden");
    });
  }

  function togglePresentMode() {
    var active = document.body.classList.toggle("tcm-v22-present-mode");
    var exitBtn = document.getElementById("v22PresentExitBtn");
    if (active) {
      if (!exitBtn) {
        exitBtn = document.createElement("button");
        exitBtn.id = "v22PresentExitBtn";
        exitBtn.type = "button";
        exitBtn.className = "v22-present-exit no-print";
        exitBtn.textContent = "退出投影汇报模式";
        exitBtn.addEventListener("click", togglePresentMode);
        document.body.appendChild(exitBtn);
      }
    } else if (exitBtn) {
      exitBtn.remove();
    }
  }

  function mountFloatingDock() {
    if (document.getElementById("tcmV22FabDock")) return;
    var dock = document.createElement("div");
    dock.id = "tcmV22FabDock";
    dock.className = "v22-fab-dock no-print";
    dock.innerHTML =
      '<button type="button" class="v22-fab-btn accent" data-v22-open="vlab">🕹️ 虚拟实验室</button>' +
      '<button type="button" class="v22-fab-btn" data-v22-open="fluid">🌊 流体仿真</button>' +
      '<button type="button" class="v22-fab-btn" data-v22-open="ar">📱 AR 药材卡</button>' +
      '<button type="button" class="v22-fab-btn" id="v22BtnPresent">🖥️ 投影模式</button>';

    dock.addEventListener("click", function (e) {
      var openBtn = e.target.closest("[data-v22-open]");
      if (openBtn) {
        openModal(openBtn.getAttribute("data-v22-open"));
        return;
      }
      if (e.target.closest("#v22BtnPresent")) {
        togglePresentMode();
      }
    });

    document.body.appendChild(dock);
  }

  function init() {
    mountFloatingDock();
    if (window.TCM_V16_PORTAL && typeof window.TCM_V16_PORTAL.registerExtension === "function") {
      window.TCM_V16_PORTAL.registerExtension({
        id: "v22_visual_suite",
        icon: "🕹️",
        title: "虚拟实验室 & 流体/AR 体验舱",
        desc: "包含 WASD 虚拟实验室、两相分层/乳化/滴定流体仿真及 AR 药材卡。",
        onOpen: function () { openModal("vlab"); }
      });
    }
  }

  window.TCM_V22_VISUAL_SUITE = {
    version: "1.0.0",
    open: openModal,
    togglePresentMode: togglePresentMode,
    getVlab3d: function () { return vlab3dInstance; },
    getFluidSim: function () { return fluidSimInstance; },
    getCockpit: function () { return cockpitInstance; }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
