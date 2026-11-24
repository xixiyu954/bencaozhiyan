/**
 * 本草智研 v21 · 板块一第三波：交互式四谱工作站（UV / IR / 1H-NMR / MS）+ 猜峰小游戏
 * 规范：零构建纯静态 IIFE，零外部依赖（离线可用），仅暴露 window.TCM_V21_SPECTRA_LAB
 */
(function () {
  "use strict";

  var SPECTRA_PROFILES = {
    "黄酮": {
      label: "黄酮类（如黄芩苷 / 芦丁）",
      UV: {
        xMin: 200, xMax: 450, unit: "nm", reverse: false, type: "curve",
        peaks: [
          { x: 268, h: 0.92, name: "带Ⅱ 苯甲酰基吸收", detail: "240~280 nm，反映 A 环苯甲酰基共轭体系；加 NaOAc 红移 5~20 nm 可证 7-OH。" },
          { x: 335, h: 0.78, name: "带Ⅰ 桂皮酰基吸收", detail: "300~380 nm，反映 B 环桂皮酰基体系；加 NaOMe 红移 40~60 nm 可证 4'-OH。" }
        ]
      },
      IR: {
        xMin: 500, xMax: 4000, unit: "cm⁻¹", reverse: true, type: "ir",
        peaks: [
          { x: 3400, h: 0.78, w: 140, name: "酚羟基 -OH 宽峰", detail: "3400 cm⁻¹ 宽强吸收带，指示黄酮分子含多个游离酚羟基及糖羟基。" },
          { x: 1650, h: 0.88, w: 35, name: "共轭羰基 C=O 伸缩", detail: "1650 cm⁻¹ 强尖峰，黄酮 C 环 4-位羰基（受 5-OH 氢键影响波数略降）。" },
          { x: 1600, h: 0.72, w: 30, name: "芳环骨架 C=C (I)", detail: "1600 cm⁻¹ 芳环骨架振动特征峰。" },
          { x: 1500, h: 0.65, w: 28, name: "芳环骨架 C=C (II)", detail: "1500 cm⁻¹ 与 1600 cm⁻¹ 成对出现，确证苯环母核。" }
        ]
      },
      NMR: {
        xMin: 0, xMax: 14, unit: "ppm", reverse: true, type: "stick",
        peaks: [
          { x: 12.6, h: 0.75, name: "5-OH 分子内氢键质子", detail: "δ 12.0~13.5 极低场尖单峰，5-OH 与 4-C=O 形成稳定六元环分子内氢键。" },
          { x: 7.8, h: 0.85, name: "B 环 AA'BB' 芳氢 (H-2',6')", detail: "δ 6.8~8.0 (d, J=8.5 Hz)，对位取代 B 环特征双峰。" },
          { x: 6.4, h: 0.70, name: "A 环间位质子 (H-6/H-8)", detail: "δ 6.1~6.5 (d, J=2.0 Hz)，5,7-二羟基黄酮 A 环特征间位偶合。" },
          { x: 5.1, h: 0.62, name: "糖端基质子 (H-1'')", detail: "δ 4.5~5.5，指示黄酮氧苷结构（苷元无此信号）。" }
        ]
      },
      MS: {
        xMin: 50, xMax: 500, unit: "m/z", reverse: false, type: "stick",
        peaks: [
          { x: 446, h: 0.65, name: "准分子离子峰 [M]⁺", detail: "对应黄酮苷完整分子量（如黄芩苷 M=446）。" },
          { x: 270, h: 0.96, name: "苷元基峰 [M-176]⁺", detail: "中性丢失葡萄糖醛酸 (-176) 或葡萄糖 (-162) 生成稳定苷元离子。" },
          { x: 153, h: 0.58, name: "RDA 裂解 A₁⁺ 碎片", detail: "C 环逆狄尔斯-阿尔德 (RDA) 裂解，直接判定 A 环羟基取代数。" }
        ]
      }
    },
    "生物碱": {
      label: "生物碱类（如小檗碱）",
      UV: {
        xMin: 200, xMax: 460, unit: "nm", reverse: false, type: "curve",
        peaks: [
          { x: 228, h: 0.90, name: "228 nm 强吸收带", detail: "异喹啉芳环共轭 π→π* 跃迁。" },
          { x: 265, h: 0.85, name: "265 nm 特征吸收", detail: "原小檗碱骨架典型四组吸收之一。" },
          { x: 345, h: 0.95, name: "345 nm 推荐定量峰", detail: "小檗碱最大共轭吸收峰，常作 HPLC/UV 定量检测波长。" },
          { x: 420, h: 0.42, name: "420 nm 可见区吸收", detail: "延伸共轭季铵体系使小檗碱呈鲜明黄色。" }
        ]
      },
      IR: {
        xMin: 500, xMax: 4000, unit: "cm⁻¹", reverse: true, type: "ir",
        peaks: [
          { x: 3300, h: 0.55, w: 90, name: "N-H 伸缩振动", detail: "3300 cm⁻¹ 附近，仲胺或吲哚类生物碱特征。" },
          { x: 1620, h: 0.86, w: 32, name: "C=N⁺ 季铵/亚胺键", detail: "1600~1640 cm⁻¹ 强吸收，原小檗碱季铵亚胺特征峰。" },
          { x: 1250, h: 0.78, w: 40, name: "芳醚 C-O-C 伸缩", detail: "1250 cm⁻¹，对应甲氧基与亚甲二氧基醚键。" }
        ]
      },
      NMR: {
        xMin: 0, xMax: 11, unit: "ppm", reverse: true, type: "stick",
        peaks: [
          { x: 9.8, h: 0.88, name: "C8-H 季铵邻位低场单峰", detail: "δ 9.5~9.9，受带正电季铵氮强去屏蔽效应影响，极具辨识度。" },
          { x: 6.05, h: 0.76, name: "亚甲二氧基 (-OCH₂O-)", detail: "δ 5.9~6.1 特征 2H 单峰，异喹啉生物碱常见取代基。" },
          { x: 4.02, h: 0.92, name: "芳甲氧基 (-OCH₃)", detail: "δ 3.8~4.1 强 3H 单峰。" },
          { x: 2.8, h: 0.54, name: "N-CH₃ / 脂肪环质子", detail: "δ 2.2~3.2 区域，指示氮甲基或四氢异喹啉亚甲基。" }
        ]
      },
      MS: {
        xMin: 100, xMax: 400, unit: "m/z", reverse: false, type: "stick",
        peaks: [
          { x: 336, h: 0.98, name: "季铵分子离子 [M]⁺ (336)", detail: "小檗碱带固有正电荷，ESI-MS 正离子模式响应极高。" },
          { x: 320, h: 0.68, name: "[M-CH₃-H]⁺ 脱甲基碎片", detail: "芳甲氧基易发生自由基脱甲基裂解。" },
          { x: 292, h: 0.56, name: "脱 CO 特征碎片", detail: "进一步失去一分子 CO (-28) 生成稳定共轭离子。" }
        ]
      }
    },
    "蒽醌与醌类": {
      label: "蒽醌类（如大黄素）",
      UV: {
        xMin: 200, xMax: 560, unit: "nm", reverse: false, type: "curve",
        peaks: [
          { x: 252, h: 0.92, name: "252 nm 苯环 K 带", detail: "蒽醌母核强紫外吸收。" },
          { x: 288, h: 0.72, name: "288 nm 特征肩峰", detail: "羟基蒽醌共轭吸收带。" },
          { x: 432, h: 0.64, name: "432 nm 醌羰基发色带", detail: "430 nm 附近吸收使蒽醌显橙黄色；加碱红移至 520 nm（Borntrager 机理）。" }
        ]
      },
      IR: {
        xMin: 500, xMax: 4000, unit: "cm⁻¹", reverse: true, type: "ir",
        peaks: [
          { x: 3380, h: 0.68, w: 120, name: "β-酚羟基 -OH", detail: "游离 β-OH 伸缩振动（α-OH 因强氢键峰形极宽而减弱）。" },
          { x: 1675, h: 0.85, w: 28, name: "游离醌羰基 C=O", detail: "1675 cm⁻¹ 未缔合羰基峰。" },
          { x: 1625, h: 0.90, w: 28, name: "螯合醌羰基 C=O", detail: "1625 cm⁻¹，与 α-OH 形成氢键缔合，Δν≈50 cm⁻¹ 可判 α-OH 个数。" }
        ]
      },
      NMR: {
        xMin: 0, xMax: 14, unit: "ppm", reverse: true, type: "stick",
        peaks: [
          { x: 12.1, h: 0.82, name: "α-OH 强氢键低场单峰", detail: "δ 11.5~13.5，1,8-二羟基蒽醌双 α-OH 标志信号。" },
          { x: 7.5, h: 0.86, name: "蒽醌芳环质子", detail: "δ 7.0~8.2 芳香质子区。" },
          { x: 2.42, h: 0.94, name: "芳环甲基 (Ar-CH₃)", detail: "δ 2.4 强 3H 单峰，大黄素型蒽醌特征甲基。" }
        ]
      },
      MS: {
        xMin: 150, xMax: 300, unit: "m/z", reverse: false, type: "stick",
        peaks: [
          { x: 270, h: 0.96, name: "分子离子峰 M⁺ (270)", detail: "大黄素完整分子离子峰，稳定度极高。" },
          { x: 242, h: 0.62, name: "[M-CO]⁺ (m/z -28)", detail: "醌环脱去第一分子 CO。" },
          { x: 214, h: 0.54, name: "[M-2CO]⁺ (m/z -56)", detail: "连续脱去两分子 CO，为醌类母核经典裂解规律。" }
        ]
      }
    }
  };

  var modalEl = null;
  var curCat = "黄酮";
  var curSpec = "IR";
  var quizMode = false;
  var quizState = { targetIdx: 0, answered: false, picked: -1, score: 0, total: 0, options: [] };
  var view = { zoom: 1, panX: 0 };
  var drag = { active: false, startX: 0, startPan: 0 };
  var hoverIdx = -1;

  function ensureModal() {
    if (modalEl) return modalEl;
    modalEl = document.createElement("div");
    modalEl.id = "tcmV21SpectraModal";
    modalEl.className = "no-print fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/65 backdrop-blur-xs p-3 sm:p-5";
    modalEl.innerHTML =
      '<div class="bg-white rounded-3xl border border-slate-200 max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">' +
        '<div class="px-5 py-3.5 bg-gradient-to-r from-[#062922] via-[#0a4538] to-[#0f6b58] text-white flex items-center justify-between gap-3">' +
          '<div class="flex items-center gap-2.5">' +
            '<span class="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-[11px] font-extrabold">析谱工作站</span>' +
            '<h3 class="text-sm sm:text-base font-extrabold">交互式四谱工作站（UV / IR / ¹H-NMR / MS）& 猜峰挑战</h3>' +
          '</div>' +
          '<button type="button" id="v21BtnClose" class="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold">×</button>' +
        '</div>' +
        '<div id="v21Body" class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4"></div>' +
      '</div>';
    document.body.appendChild(modalEl);

    modalEl.querySelector("#v21BtnClose").addEventListener("click", closeModal);
    modalEl.addEventListener("click", function (e) {
      if (e.target === modalEl) closeModal();
    });
    return modalEl;
  }

  function closeModal() {
    if (modalEl) {
      modalEl.classList.add("hidden");
      modalEl.classList.remove("flex");
    }
  }

  function openModal(cat) {
    ensureModal();
    if (cat && SPECTRA_PROFILES[cat]) curCat = cat;
    view = { zoom: 1, panX: 0 };
    quizMode = false;
    modalEl.classList.remove("hidden");
    modalEl.classList.add("flex");
    renderAll();
    try {
      window.dispatchEvent(new CustomEvent("tcm:achievement-event", { detail: { type: "spectra_open", key: curCat } }));
    } catch (_) {}
  }

  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modalEl && !modalEl.classList.contains("hidden")) closeModal();
  });

  function buildQuizRound() {
    var sp = SPECTRA_PROFILES[curCat][curSpec];
    var peaks = sp.peaks;
    var idx = Math.floor(Math.random() * peaks.length);
    var correct = peaks[idx].name;

    var pool = [];
    Object.keys(SPECTRA_PROFILES).forEach(function (c) {
      ["UV", "IR", "NMR", "MS"].forEach(function (s) {
        SPECTRA_PROFILES[c][s].peaks.forEach(function (p) {
          if (p.name !== correct && pool.indexOf(p.name) === -1) pool.push(p.name);
        });
      });
    });
    pool.sort(function () { return Math.random() - 0.5; });
    var opts = [correct].concat(pool.slice(0, 3)).sort(function () { return Math.random() - 0.5; });

    quizState.targetIdx = idx;
    quizState.answered = false;
    quizState.picked = -1;
    quizState.options = opts;
  }

  function renderAll() {
    var body = modalEl.querySelector("#v21Body");
    var prof = SPECTRA_PROFILES[curCat];
    var sp = prof[curSpec];

    var catBtns = Object.keys(SPECTRA_PROFILES).map(function (k) {
      var on = k === curCat;
      return '<button type="button" data-v21-cat="' + k + '" class="px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ' +
        (on ? 'bg-[#059669] text-white border-[#059669]' : 'bg-white text-slate-700 border-slate-200 hover:border-[#059669]') + '">' + k + "</button>";
    }).join("");

    var specBtns = ["UV", "IR", "NMR", "MS"].map(function (s) {
      var on = s === curSpec;
      var lbl = s === "NMR" ? "¹H-NMR" : s;
      return '<button type="button" data-v21-spec="' + s + '" class="px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ' +
        (on ? 'bg-[#064e3b] text-white border-[#064e3b]' : 'bg-white text-slate-700 border-slate-200') + '">' + lbl + "</button>";
    }).join("");

    var v4Db = window.TCM_V4_SPECTRO && window.TCM_V4_SPECTRO.FOUR_SPECTRA_DB;
    var v4Note = "";
    if (v4Db && v4Db[curCat]) {
      var mapKey = curSpec === "UV" ? "uvDiag" : (curSpec === "IR" ? "ir" : (curSpec === "NMR" ? "nmr" : "ms"));
      v4Note = v4Db[curCat][mapKey] || "";
    }

    var quizHtml = "";
    if (quizMode) {
      var targetPeak = sp.peaks[quizState.targetIdx];
      var optHtml = quizState.options.map(function (opt, oi) {
        var cls = "bg-white border-slate-200 text-slate-800 hover:border-[#059669]";
        if (quizState.answered) {
          if (opt === targetPeak.name) cls = "bg-emerald-50 border-emerald-500 text-emerald-900 font-extrabold";
          else if (oi === quizState.picked) cls = "bg-rose-50 border-rose-400 text-rose-900 line-through";
        }
        return '<button type="button" data-v21-qopt="' + oi + '" class="p-2.5 rounded-xl border text-left text-xs transition ' + cls + '">' + opt + "</button>";
      }).join("");

      quizHtml =
        '<div class="rounded-2xl bg-amber-50/85 border border-amber-300/80 p-4 space-y-3">' +
          '<div class="flex flex-wrap items-center justify-between gap-2">' +
            '<div class="text-xs sm:text-sm font-extrabold text-amber-950">🎯 猜峰挑战：图中橙红高亮特征峰（' + targetPeak.x + " " + sp.unit + "）归属于？</div>" +
            '<div class="text-xs font-extrabold text-[#059669]">得分：' + quizState.score + " / " + quizState.total + "</div>" +
          "</div>" +
          '<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">' + optHtml + "</div>" +
          (quizState.answered
            ? '<div class="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-700">' +
                '<span><strong>解析：</strong>' + targetPeak.detail + "</span>" +
                '<button type="button" id="v21BtnNextQuiz" class="px-3.5 py-1.5 rounded-xl bg-[#059669] text-white font-extrabold">下一题 →</button>' +
              "</div>"
            : "") +
        "</div>";
    }

    body.innerHTML =
      '<div class="flex flex-wrap items-center justify-between gap-2">' +
        '<div class="flex flex-wrap items-center gap-1.5">' + catBtns + '<span class="mx-1 text-slate-300">|</span>' + specBtns + "</div>" +
        '<div class="flex flex-wrap items-center gap-2">' +
          '<button type="button" id="v21BtnResetView" class="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700">↺ 复位缩放</button>' +
          '<button type="button" id="v21BtnToggleQuiz" class="px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition ' +
            (quizMode ? 'bg-amber-400 text-[#062420]' : 'bg-[#f97316] text-white') + '">' + (quizMode ? "退出猜峰模式" : "🎮 开启猜峰小游戏") + "</button>" +
        "</div>" +
      "</div>" +
      '<div class="relative rounded-2xl bg-white border border-slate-200 p-3 shadow-xs">' +
        '<canvas id="v21SpecCanvas" width="840" height="300" class="w-full h-[260px] sm:h-[300px] block cursor-grab active:cursor-grabbing"></canvas>' +
        '<div id="v21PeakCard" class="mt-2.5 p-3 rounded-xl bg-[#f6f8f7] border border-slate-200/80 text-xs text-slate-800">' +
          '<strong>操作提示：</strong>滚轮缩放、鼠标拖拽平移；将鼠标悬停在任意谱峰附近即可弹出归属解析卡。' +
        "</div>" +
      "</div>" +
      quizHtml +
      (v4Note ? '<div class="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-slate-700 leading-relaxed"><strong class="text-[#064e3b]">📚 站内四谱规则库速查：</strong>' + v4Note + "</div>" : "");

    body.querySelectorAll("[data-v21-cat]").forEach(function (b) {
      b.addEventListener("click", function () { curCat = b.getAttribute("data-v21-cat"); view = { zoom: 1, panX: 0 }; if (quizMode) buildQuizRound(); renderAll(); });
    });
    body.querySelectorAll("[data-v21-spec]").forEach(function (b) {
      b.addEventListener("click", function () { curSpec = b.getAttribute("data-v21-spec"); view = { zoom: 1, panX: 0 }; if (quizMode) buildQuizRound(); renderAll(); });
    });
    body.querySelector("#v21BtnResetView").addEventListener("click", function () { view = { zoom: 1, panX: 0 }; drawSpectrum(); });
    body.querySelector("#v21BtnToggleQuiz").addEventListener("click", function () {
      quizMode = !quizMode;
      if (quizMode) { quizState.score = 0; quizState.total = 0; buildQuizRound(); }
      renderAll();
    });

    if (quizMode) {
      body.querySelectorAll("[data-v21-qopt]").forEach(function (b) {
        b.addEventListener("click", function () {
          if (quizState.answered) return;
          var oi = Number(b.getAttribute("data-v21-qopt"));
          quizState.picked = oi;
          quizState.answered = true;
          quizState.total += 1;
          if (quizState.options[oi] === sp.peaks[quizState.targetIdx].name) quizState.score += 1;
          renderAll();
        });
      });
      var nextBtn = body.querySelector("#v21BtnNextQuiz");
      if (nextBtn) nextBtn.addEventListener("click", function () { buildQuizRound(); renderAll(); });
    }

    bindCanvasEvents();
    drawSpectrum();
  }

  function bindCanvasEvents() {
    var canvas = modalEl.querySelector("#v21SpecCanvas");
    if (!canvas) return;

    canvas.addEventListener("pointerdown", function (e) {
      drag.active = true;
      drag.startX = e.clientX;
      drag.startPan = view.panX;
    });
    window.addEventListener("pointerup", function () { drag.active = false; });

    canvas.addEventListener("pointermove", function (e) {
      var rect = canvas.getBoundingClientRect();
      var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
      if (drag.active) {
        view.panX = drag.startPan + (e.clientX - drag.startX) * (canvas.width / rect.width);
        drawSpectrum();
        return;
      }
      if (quizMode) return;
      var sp = SPECTRA_PROFILES[curCat][curSpec];
      var found = -1;
      var minDist = 26;
      sp.peaks.forEach(function (pk, idx) {
        var px = valToX(pk.x, sp, canvas.width);
        var d = Math.abs(mx - px);
        if (d < minDist) { minDist = d; found = idx; }
      });
      if (found !== hoverIdx) {
        hoverIdx = found;
        drawSpectrum();
        var card = modalEl.querySelector("#v21PeakCard");
        if (card) {
          if (hoverIdx >= 0) {
            var p = sp.peaks[hoverIdx];
            card.innerHTML = '<strong class="text-[#f97316]">【' + p.x + " " + sp.unit + " · " + p.name + "】</strong> " + p.detail;
          } else {
            card.innerHTML = '<strong>操作提示：</strong>滚轮缩放、鼠标拖拽平移；将鼠标悬停在任意谱峰附近即可弹出归属解析卡。';
          }
        }
      }
    });

    canvas.addEventListener("wheel", function (e) {
      e.preventDefault();
      var factor = e.deltaY < 0 ? 1.15 : 0.87;
      view.zoom = Math.max(1, Math.min(5, view.zoom * factor));
      if (view.zoom === 1) view.panX = 0;
      drawSpectrum();
    }, { passive: false });
  }

  function valToX(val, sp, width) {
    var padL = 52, padR = 24;
    var plotW = width - padL - padR;
    var ratio = (val - sp.xMin) / (sp.xMax - sp.xMin);
    if (sp.reverse) ratio = 1 - ratio;
    return padL + (ratio * plotW * view.zoom) + view.panX;
  }

  function drawSpectrum() {
    var canvas = modalEl.querySelector("#v21SpecCanvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var w = canvas.width, h = canvas.height;
    var padL = 52, padR = 24, padT = 26, padB = 38;
    var plotH = h - padT - padB;
    var sp = SPECTRA_PROFILES[curCat][curSpec];

    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(15, 23, 42, 0.06)";
    ctx.lineWidth = 1;
    for (var gy = 0; gy <= 4; gy++) {
      var yy = padT + (plotH / 4) * gy;
      ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(w - padR, yy); ctx.stroke();
    }

    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, padT); ctx.lineTo(padL, h - padB); ctx.lineTo(w - padR, h - padB);
    ctx.stroke();

    ctx.fillStyle = "#475569";
    ctx.font = "11px monospace";
    ctx.textAlign = "center";
    for (var i = 0; i <= 6; i++) {
      var v = sp.xMin + ((sp.xMax - sp.xMin) / 6) * i;
      var tx = valToX(v, sp, w);
      if (tx >= padL && tx <= w - padR) {
        ctx.fillText(Math.round(v), tx, h - padB + 16);
      }
    }
    ctx.textAlign = "right";
    ctx.fillText(sp.unit, w - padR, h - 6);
    ctx.save();
    ctx.translate(16, padT + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText(sp.type === "ir" ? "透射率 T%" : "相对强度", 0, 0);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.rect(padL, padT, w - padL - padR, plotH);
    ctx.clip();

    if (sp.type === "curve" || sp.type === "ir") {
      ctx.strokeStyle = "#059669";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      var steps = 260;
      for (var s = 0; s <= steps; s++) {
        var xv = sp.xMin + ((sp.xMax - sp.xMin) / steps) * s;
        var sum = 0;
        sp.peaks.forEach(function (pk) {
          var sigma = pk.w || (sp.xMax - sp.xMin) * 0.045;
          sum += pk.h * Math.exp(-0.5 * Math.pow((xv - pk.x) / sigma, 2));
        });
        var clamped = Math.min(0.98, sum);
        var px = valToX(xv, sp, w);
        var py = sp.type === "ir" ? (padT + 10 + clamped * (plotH - 18)) : (h - padB - clamped * (plotH - 14));
        if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    } else {
      sp.peaks.forEach(function (pk, idx) {
        var px = valToX(pk.x, sp, w);
        var py = h - padB - pk.h * (plotH - 20);
        var isTarget = (quizMode && idx === quizState.targetIdx) || (!quizMode && idx === hoverIdx);
        ctx.strokeStyle = isTarget ? "#f97316" : "#059669";
        ctx.lineWidth = isTarget ? 3.5 : 2.2;
        ctx.beginPath();
        ctx.moveTo(px, h - padB);
        ctx.lineTo(px, py);
        ctx.stroke();
      });
    }

    sp.peaks.forEach(function (pk, idx) {
      var px = valToX(pk.x, sp, w);
      var py = sp.type === "ir" ? (padT + 10 + pk.h * (plotH - 18)) : (h - padB - pk.h * (plotH - 20));
      var isTarget = (quizMode && idx === quizState.targetIdx) || (!quizMode && idx === hoverIdx);

      ctx.fillStyle = isTarget ? "#f97316" : "#059669";
      ctx.beginPath();
      ctx.arc(px, py, isTarget ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();

      if (!quizMode || (quizMode && idx === quizState.targetIdx)) {
        ctx.fillStyle = isTarget ? "#f97316" : "#334155";
        ctx.font = isTarget ? "bold 12px sans-serif" : "11px sans-serif";
        ctx.textAlign = "center";
        var labelText = quizMode ? ("? (" + pk.x + ")") : (pk.x + " " + pk.name.split(" ")[0]);
        ctx.fillText(labelText, px, sp.type === "ir" ? Math.min(h - padB - 6, py + 16) : Math.max(padT + 14, py - 10));
      }
    });

    ctx.restore();
  }

  function mountStep3Button() {
    var s3Card = document.getElementById("step3FourSpectraCard");
    if (s3Card && !document.getElementById("v21BtnOpenFromS3")) {
      var bar = document.createElement("div");
      bar.id = "v21BtnOpenFromS3";
      bar.className = "pt-2 flex justify-end";
      bar.innerHTML = '<button type="button" class="px-3.5 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-extrabold transition">🌈 启动交互式四谱缩放 & 猜峰小游戏 →</button>';
      bar.querySelector("button").addEventListener("click", function () {
        var catText = (document.getElementById("cfgCategory") && document.getElementById("cfgCategory").textContent) || "";
        var cat = /生物碱/.test(catText) ? "生物碱" : (/蒽醌/.test(catText) ? "蒽醌与醌类" : "黄酮");
        openModal(cat);
      });
      s3Card.appendChild(bar);
    }
  }

  function registerIntegrations() {
    if (window.TCM_V16_PORTAL && typeof window.TCM_V16_PORTAL.registerExtension === "function") {
      window.TCM_V16_PORTAL.registerExtension({
        id: "v21_spectra",
        icon: "🌈",
        title: "交互式四谱工作站 & 猜峰挑战",
        desc: "UV / IR / ¹H-NMR / MS 可缩放谱图与悬停归属解析，内置猜峰小游戏。",
        onOpen: function () { openModal("黄酮"); }
      });
    }

    mountStep3Button();
    var s3Card = document.getElementById("step3FourSpectraCard");
    if (s3Card && typeof MutationObserver !== "undefined") {
      new MutationObserver(function () {
        mountStep3Button();
      }).observe(s3Card, { childList: true });
    }
  }

  window.TCM_V21_SPECTRA_LAB = {
    version: "1.0.0",
    open: openModal
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", registerIntegrations);
  } else {
    registerIntegrations();
  }
})();
