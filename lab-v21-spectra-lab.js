/**
 * 本草智研 v21 · 1.6 交互式四谱工作站（深度科研细节版）
 * 特性：
 * - 4 大类核心中药成分（黄酮、生物碱、蒽醌与醌类、酚酸类）UV / IR / ¹H-NMR / MS 四谱
 * - UV 诊断试剂位移叠加（+NaOMe / +AlCl₃ 虚线红移对照）
 * - IR 官能团分区着色带（O-H/N-H、C=O、芳环骨架、指纹区）
 * - ¹H-NMR 洛伦兹多重峰劈裂（s/d/m）+ 可切换积分阶梯曲线（∫）
 * - MS 中性丢失裂解路径箭头标注（Δm/z -176 / -28 CO）
 * - 特征峰速览芯片联动 + 十字光标实时读数 + 高对比浮动解析卡 + 5 题综合猜峰挑战结算
 */
(function () {
  "use strict";

  var SPECTRA_PROFILES = {
    "黄酮": {
      label: "黄酮类（黄芩苷 / 芦丁）",
      UV: {
        xMin: 200, xMax: 450, unit: "nm", reverse: false, type: "curve",
        shiftReagent: { label: "+ NaOMe 诊断位移 (带Ⅰ 红移 +48 nm 证 4'-OH)", shift: 48, targetIdx: 1 },
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
        xMin: 0, xMax: 14, unit: "ppm", reverse: true, type: "nmr",
        peaks: [
          { x: 12.6, h: 0.75, mult: "s", integ: "1H", name: "5-OH 分子内氢键质子", detail: "δ 12.0~13.5 极低场尖单峰 (s, 1H)，5-OH 与 4-C=O 形成稳定六元环分子内氢键。" },
          { x: 7.8, h: 0.85, mult: "d", integ: "2H", name: "B 环 AA'BB' 芳氢 (H-2',6')", detail: "δ 6.8~8.0 (d, J=8.5 Hz, 2H)，对位取代 B 环特征双峰。" },
          { x: 6.4, h: 0.70, mult: "d", integ: "2H", name: "A 环间位质子 (H-6/H-8)", detail: "δ 6.1~6.5 (d, J=2.0 Hz, 2H)，5,7-二羟基黄酮 A 环特征间位偶合。" },
          { x: 5.1, h: 0.62, mult: "d", integ: "1H", name: "糖端基质子 (H-1'')", detail: "δ 4.5~5.5 (d, J=7.4 Hz, 1H)，β-D-葡萄糖醛酸端基质子信号。" }
        ]
      },
      MS: {
        xMin: 50, xMax: 500, unit: "m/z", reverse: false, type: "ms",
        losses: [{ from: 446, to: 270, label: "-176 (脱葡萄糖醛酸)" }, { from: 270, to: 153, label: "RDA 裂解" }],
        peaks: [
          { x: 446, h: 0.65, name: "准分子离子峰 [M]⁺", detail: "对应黄酮苷完整分子量（如黄芩苷 M=446）。" },
          { x: 270, h: 0.96, name: "苷元基峰 [M-176]⁺", detail: "中性丢失葡萄糖醛酸 (-176) 生成稳定黄芩素苷元离子。" },
          { x: 153, h: 0.58, name: "RDA 裂解 A₁⁺ 碎片", detail: "C 环逆狄尔斯-阿尔德 (RDA) 裂解，直接判定 A 环羟基取代数。" }
        ]
      }
    },
    "生物碱": {
      label: "生物碱类（小檗碱）",
      UV: {
        xMin: 200, xMax: 460, unit: "nm", reverse: false, type: "curve",
        shiftReagent: { label: "+ HCl 酸化对照 (季铵碱峰位基本不变)", shift: 4, targetIdx: 2 },
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
          { x: 3300, h: 0.55, w: 90, name: "N-H / 结晶水伸缩", detail: "3300 cm⁻¹ 附近吸收带，反映仲胺或结晶水缔合。" },
          { x: 1620, h: 0.86, w: 32, name: "C=N⁺ 季铵/亚胺键", detail: "1600~1640 cm⁻¹ 强吸收，原小檗碱季铵亚胺特征峰。" },
          { x: 1250, h: 0.78, w: 40, name: "芳醚 C-O-C 伸缩", detail: "1250 cm⁻¹，对应甲氧基与亚甲二氧基醚键。" }
        ]
      },
      NMR: {
        xMin: 0, xMax: 11, unit: "ppm", reverse: true, type: "nmr",
        peaks: [
          { x: 9.8, h: 0.88, mult: "s", integ: "1H", name: "C8-H 季铵邻位低场单峰", detail: "δ 9.5~9.9 (s, 1H)，受带正电季铵氮强去屏蔽效应影响，极具辨识度。" },
          { x: 6.05, h: 0.76, mult: "s", integ: "2H", name: "亚甲二氧基 (-OCH₂O-)", detail: "δ 5.9~6.1 特征 2H 单峰，异喹啉生物碱标志取代基。" },
          { x: 4.02, h: 0.92, mult: "s", integ: "6H", name: "芳甲氧基 (-OCH₃ ×2)", detail: "δ 3.8~4.1 强单峰，对应 C9/C10 双甲氧基。" },
          { x: 2.8, h: 0.54, mult: "t", integ: "2H", name: "四氢异喹啉亚甲基", detail: "δ 2.2~3.2 三重峰，指示 B 环饱和亚甲基。" }
        ]
      },
      MS: {
        xMin: 100, xMax: 400, unit: "m/z", reverse: false, type: "ms",
        losses: [{ from: 336, to: 320, label: "-16 (CH₃+H)" }, { from: 320, to: 292, label: "-28 (CO)" }],
        peaks: [
          { x: 336, h: 0.98, name: "季铵分子离子 [M]⁺ (336)", detail: "小檗碱带固有正电荷，ESI-MS 正离子模式响应极高。" },
          { x: 320, h: 0.68, name: "[M-CH₃-H]⁺ 脱甲基碎片", detail: "芳甲氧基易发生自由基脱甲基裂解。" },
          { x: 292, h: 0.56, name: "脱 CO 特征碎片 (292)", detail: "进一步失去一分子 CO (-28) 生成稳定共轭离子。" }
        ]
      }
    },
    "蒽醌与醌类": {
      label: "蒽醌类（大黄素 / 丹参酮）",
      UV: {
        xMin: 200, xMax: 560, unit: "nm", reverse: false, type: "curve",
        shiftReagent: { label: "+ 5% NaOH 碱液红移 (432 → 518 nm Bornträger 显红)", shift: 86, targetIdx: 2 },
        peaks: [
          { x: 252, h: 0.92, name: "252 nm 苯环 K 带", detail: "蒽醌母核强紫外吸收。" },
          { x: 288, h: 0.72, name: "288 nm 特征肩峰", detail: "羟基蒽醌共轭吸收带。" },
          { x: 432, h: 0.64, name: "432 nm 醌羰基发色带", detail: "430 nm 附近吸收使蒽醌显橙黄色；加碱红移至 ~520 nm（Bornträger 机理）。" }
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
        xMin: 0, xMax: 14, unit: "ppm", reverse: true, type: "nmr",
        peaks: [
          { x: 12.1, h: 0.82, mult: "s", integ: "2H", name: "α-OH 强氢键低场单峰", detail: "δ 11.5~13.5 (s, 2H)，1,8-二羟基蒽醌双 α-OH 标志信号。" },
          { x: 7.5, h: 0.86, mult: "m", integ: "4H", name: "蒽醌芳环质子", detail: "δ 7.0~8.2 芳香质子区多重峰。" },
          { x: 2.42, h: 0.94, mult: "s", integ: "3H", name: "芳环甲基 (Ar-CH₃)", detail: "δ 2.42 (s, 3H) 强单峰，大黄素型蒽醌特征甲基。" }
        ]
      },
      MS: {
        xMin: 150, xMax: 300, unit: "m/z", reverse: false, type: "ms",
        losses: [{ from: 270, to: 242, label: "-28 (CO)" }, { from: 242, to: 214, label: "-28 (CO)" }],
        peaks: [
          { x: 270, h: 0.96, name: "分子离子峰 M⁺ (270)", detail: "大黄素完整分子离子峰，稳定度极高。" },
          { x: 242, h: 0.62, name: "[M-CO]⁺ (m/z -28)", detail: "醌环脱去第一分子 CO。" },
          { x: 214, h: 0.54, name: "[M-2CO]⁺ (m/z -56)", detail: "连续脱去两分子 CO，为醌类母核经典裂解规律。" }
        ]
      }
    },
    "酚酸类": {
      label: "苯丙素酚酸（绿原酸）",
      UV: {
        xMin: 200, xMax: 420, unit: "nm", reverse: false, type: "curve",
        shiftReagent: { label: "+ AlCl₃ 邻二酚络合红移 (+34 nm)", shift: 34, targetIdx: 2 },
        peaks: [
          { x: 218, h: 0.86, name: "218 nm 苯环 E₂ 带", detail: "咖啡酰基苯环 π→π* 电子跃迁。" },
          { x: 242, h: 0.62, name: "242 nm 特征肩峰", detail: "邻二酚取代苯环辅助吸收带。" },
          { x: 327, h: 0.96, name: "327 nm 咖啡酰共轭定量峰", detail: "绿原酸最大共轭紫外吸收峰，《中国药典》HPLC/UV 含量测定核心波长。" }
        ]
      },
      IR: {
        xMin: 500, xMax: 4000, unit: "cm⁻¹", reverse: true, type: "ir",
        peaks: [
          { x: 3350, h: 0.84, w: 150, name: "多元酚/醇羟基 -OH", detail: "奎宁酸醇羟基与咖啡酸邻二酚羟基叠加宽强峰。" },
          { x: 1690, h: 0.88, w: 30, name: "共轭酯/羧基 C=O", detail: "1685~1700 cm⁻¹，对应缩酚酸酯键与羧基羰基伸缩。" },
          { x: 1630, h: 0.74, w: 26, name: "反式烯键 C=C", detail: "咖啡酰基反式双键特征伸缩振动。" }
        ]
      },
      NMR: {
        xMin: 0, xMax: 10, unit: "ppm", reverse: true, type: "nmr",
        peaks: [
          { x: 7.45, h: 0.82, mult: "d", integ: "1H", name: "反式烯氢 H-7' (J=16 Hz)", detail: "δ 7.45 (d, J=16.0 Hz, 1H)，大偶合常数确证反式构型。" },
          { x: 6.22, h: 0.78, mult: "d", integ: "1H", name: "反式烯氢 H-8' (J=16 Hz)", detail: "δ 6.22 (d, J=16.0 Hz, 1H)，与 H-7' 成对出现。" },
          { x: 5.10, h: 0.70, mult: "m", integ: "1H", name: "奎宁酸酰化位 H-3", detail: "酯化后向低场位移至 δ 5.0~5.3，用于判定咖啡酰取代位点。" },
          { x: 2.05, h: 0.88, mult: "m", integ: "4H", name: "奎宁酸亚甲基 H-2/H-6", detail: "δ 1.8~2.2 脂肪环亚甲基多重峰。" }
        ]
      },
      MS: {
        xMin: 100, xMax: 400, unit: "m/z", reverse: false, type: "ms",
        losses: [{ from: 353, to: 191, label: "-162 (失咖啡酰基)" }],
        peaks: [
          { x: 353, h: 0.84, name: "负离子准分子峰 [M-H]⁻ (353)", detail: "绿原酸分子量 354，负离子 ESI-MS 极易去质子化。" },
          { x: 191, h: 0.98, name: "奎宁酸基峰 [M-H-162]⁻ (191)", detail: "酯键断裂失去咖啡酰基后生成高丰度奎宁酸负离子基峰。" },
          { x: 179, h: 0.45, name: "咖啡酸碎片离子 (179)", detail: "确证咖啡酰基单元存在。" }
        ]
      }
    }
  };

  var modalEl = null;
  var curCat = "黄酮";
  var curSpec = "IR";
  var showUvShift = false;
  var showNmrInteg = true;
  var quizMode = false;
  var quizState = { targetIdx: 0, answered: false, picked: -1, score: 0, total: 0, streak: 0, maxRounds: 5, options: [] };
  var view = { zoom: 1, panX: 0 };
  var drag = { active: false, startX: 0, startPan: 0 };
  var hoverIdx = -1;
  var lockedIdx = -1;
  var cursorX = -1;

  function ensureModal() {
    if (modalEl) return modalEl;
    modalEl = document.createElement("div");
    modalEl.id = "tcmV21SpectraModal";
    modalEl.className = "no-print fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2.5 sm:p-5";
    modalEl.innerHTML =
      '<div class="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-700 max-w-5xl w-full max-h-[93vh] flex flex-col shadow-2xl overflow-hidden">' +
        '<div class="px-4 sm:px-5 py-3 bg-gradient-to-r from-[#062922] via-[#0a4538] to-[#0f6b58] text-white flex items-center justify-between gap-3">' +
          '<div class="flex items-center gap-2.5 min-w-0">' +
            '<span class="shrink-0 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-[11px] font-extrabold">1.6 析谱工作站</span>' +
            '<h3 class="text-sm sm:text-base font-extrabold truncate">交互式四谱工作站（UV / IR / ¹H-NMR / MS）& 猜峰挑战</h3>' +
          '</div>' +
          '<button type="button" id="v21BtnClose" class="shrink-0 w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-lg leading-none">×</button>' +
        '</div>' +
        '<div id="v21Body" class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3"></div>' +
      '</div>';
    document.body.appendChild(modalEl);

    modalEl.querySelector("#v21BtnClose").addEventListener("click", closeModal);
    modalEl.addEventListener("click", function (e) { if (e.target === modalEl) closeModal(); });
    return modalEl;
  }

  function closeModal() {
    if (modalEl) { modalEl.classList.add("hidden"); modalEl.classList.remove("flex"); }
  }

  function openModal(cat) {
    ensureModal();
    if (cat && SPECTRA_PROFILES[cat]) curCat = cat;
    view = { zoom: 1, panX: 0 };
    hoverIdx = -1; lockedIdx = -1; quizMode = false;
    modalEl.classList.remove("hidden");
    modalEl.classList.add("flex");
    renderAll();
    try { window.dispatchEvent(new CustomEvent("tcm:achievement-event", { detail: { type: "spectra_open", key: curCat } })); } catch (_) {}
  }

  window.addEventListener("keydown", function (e) {
    if (!modalEl || modalEl.classList.contains("hidden")) return;
    if (e.key === "Escape") { closeModal(); return; }
    if (e.key === "+" || e.key === "=") zoomBy(1.25);
    else if (e.key === "-") zoomBy(0.8);
    else if (e.key === "0") { view = { zoom: 1, panX: 0 }; updateZoomBadge(); drawSpectrum(); }
    else if (e.key === "1") { curSpec = "UV"; view = { zoom: 1, panX: 0 }; renderAll(); }
    else if (e.key === "2") { curSpec = "IR"; view = { zoom: 1, panX: 0 }; renderAll(); }
    else if (e.key === "3") { curSpec = "NMR"; view = { zoom: 1, panX: 0 }; renderAll(); }
    else if (e.key === "4") { curSpec = "MS"; view = { zoom: 1, panX: 0 }; renderAll(); }
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
    quizState.targetIdx = idx;
    quizState.answered = false;
    quizState.picked = -1;
    quizState.options = [correct].concat(pool.slice(0, 3)).sort(function () { return Math.random() - 0.5; });
  }

  function clampPan(w) {
    var plotW = w - 76;
    var maxShift = Math.max(0, plotW * (view.zoom - 1));
    view.panX = Math.max(-maxShift, Math.min(0, view.panX));
  }

  function renderAll() {
    var body = modalEl.querySelector("#v21Body");
    var prof = SPECTRA_PROFILES[curCat];
    var sp = prof[curSpec];

    var catBtns = Object.keys(SPECTRA_PROFILES).map(function (k) {
      var on = k === curCat;
      return '<button type="button" data-v21-cat="' + k + '" class="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ' +
        (on ? 'bg-[#059669] text-white border-[#059669]' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-[#059669]') + '">' + k + "</button>";
    }).join("");

    var specBtns = ["UV", "IR", "NMR", "MS"].map(function (s) {
      var on = s === curSpec;
      return '<button type="button" data-v21-spec="' + s + '" class="px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ' +
        (on ? 'bg-[#064e3b] text-white border-[#064e3b]' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700') + '">' + (s === "NMR" ? "¹H-NMR" : s) + "</button>";
    }).join("");

    // Context-specific scientific feature toggle
    var extraSpecCtrl = "";
    if (curSpec === "UV" && sp.shiftReagent) {
      extraSpecCtrl = '<button type="button" id="v21BtnUvShift" class="px-2.5 py-1.5 rounded-xl text-xs font-extrabold border transition ' +
        (showUvShift ? 'bg-amber-500 text-white border-amber-500' : 'bg-amber-50 text-amber-900 border-amber-300') + '">🧪 ' + (showUvShift ? "隐藏诊断位移" : "叠加诊断试剂位移") + '</button>';
    } else if (curSpec === "NMR") {
      extraSpecCtrl = '<button type="button" id="v21BtnNmrInteg" class="px-2.5 py-1.5 rounded-xl text-xs font-extrabold border transition ' +
        (showNmrInteg ? 'bg-sky-600 text-white border-sky-600' : 'bg-sky-50 text-sky-900 border-sky-300') + '">∫ 积分曲线</button>';
    }

    var peakChipsHtml = !quizMode
      ? '<div class="flex flex-wrap items-center gap-1.5 pt-2">' +
          '<span class="text-[11px] font-extrabold text-slate-500">特征峰速览（悬停/点击定位）：</span>' +
          sp.peaks.map(function (pk, idx) {
            var active = idx === lockedIdx || idx === hoverIdx;
            return '<button type="button" data-v21-peak-chip="' + idx + '" class="px-2 py-0.5 rounded-lg text-[11px] font-bold border transition ' +
              (active ? 'bg-orange-500 text-white border-orange-500' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-orange-400') + '">' +
              pk.x + ' ' + sp.unit + ' · ' + pk.name.split(" ")[0] + '</button>';
          }).join("") +
        '</div>'
      : "";

    var quizHtml = "";
    if (quizMode) {
      var targetPeak = sp.peaks[quizState.targetIdx];
      var acc = quizState.total ? Math.round((quizState.score / quizState.total) * 100) : 0;
      var finished = quizState.total >= quizState.maxRounds && quizState.answered;
      var optHtml = quizState.options.map(function (opt, oi) {
        var cls = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-[#059669]";
        if (quizState.answered) {
          if (opt === targetPeak.name) cls = "bg-emerald-50 border-emerald-500 text-emerald-900 font-extrabold ring-1 ring-emerald-400";
          else if (oi === quizState.picked) cls = "bg-rose-50 border-rose-400 text-rose-900 line-through";
        }
        return '<button type="button" data-v21-qopt="' + oi + '" class="p-2.5 rounded-xl border text-left text-xs transition ' + cls + '">' + String.fromCharCode(65 + oi) + ". " + opt + "</button>";
      }).join("");

      quizHtml =
        '<div class="rounded-2xl bg-amber-50/90 dark:bg-amber-950/35 border border-amber-300/80 p-4 space-y-3">' +
          '<div class="flex flex-wrap items-center justify-between gap-2">' +
            '<div class="text-xs sm:text-sm font-extrabold text-amber-950 dark:text-amber-200">🎯 猜峰挑战（第 ' + Math.min(quizState.maxRounds, quizState.total + (quizState.answered ? 0 : 1)) + '/' + quizState.maxRounds + ' 题）：橙红高亮峰（' + targetPeak.x + " " + sp.unit + "）归属于？</div>" +
            '<div class="flex items-center gap-2 text-xs font-extrabold">' +
              '<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">得分：' + quizState.score + " / " + quizState.total + "（" + acc + "%）</span>" +
              '<span class="px-2 py-0.5 rounded-full bg-amber-200 text-amber-950">🔥 连胜 ' + quizState.streak + "</span>" +
            "</div>" +
          "</div>" +
          '<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">' + optHtml + "</div>" +
          (quizState.answered
            ? '<div class="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-700 dark:text-slate-300">' +
                '<span><strong>' + (quizState.options[quizState.picked] === targetPeak.name ? "✅ 回答正确！" : "❌ 正确答案：" + targetPeak.name + "。") + '</strong> ' + targetPeak.detail + "</span>" +
                (finished
                  ? '<button type="button" id="v21BtnRestartQuiz" class="shrink-0 px-3.5 py-1.5 rounded-xl bg-[#ea580c] text-white font-extrabold">🏆 本轮 ' + acc + '% · 再来一局</button>'
                  : '<button type="button" id="v21BtnNextQuiz" class="shrink-0 px-3.5 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-extrabold">下一题 →</button>') +
              "</div>"
            : "") +
        "</div>";
    }

    var v4Db = window.TCM_V4_SPECTRO && window.TCM_V4_SPECTRO.FOUR_SPECTRA_DB;
    var v4Note = "";
    if (v4Db && v4Db[curCat]) {
      var mapKey = curSpec === "UV" ? "uvDiag" : (curSpec === "IR" ? "ir" : (curSpec === "NMR" ? "nmr" : "ms"));
      v4Note = v4Db[curCat][mapKey] || "";
    }

    body.innerHTML =
      '<div class="flex flex-wrap items-center justify-between gap-2">' +
        '<div class="flex flex-wrap items-center gap-1.5">' + catBtns + '<span class="mx-1 text-slate-300">|</span>' + specBtns + "</div>" +
        '<div class="flex flex-wrap items-center gap-1.5">' +
          extraSpecCtrl +
          '<button type="button" id="v21BtnZoomIn" class="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-700 dark:text-slate-200">+ 放大</button>' +
          '<button type="button" id="v21BtnZoomOut" class="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-700 dark:text-slate-200">− 缩小</button>' +
          '<span id="v21ZoomBadge" class="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300">' + view.zoom.toFixed(1) + '×</span>' +
          '<button type="button" id="v21BtnResetView" class="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200">↺ 复位</button>' +
          '<button type="button" id="v21BtnExportPng" class="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-teal-700 dark:text-emerald-300">📸 导出谱图</button>' +
          '<button type="button" id="v21BtnToggleQuiz" class="px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition ' +
            (quizMode ? 'bg-amber-400 text-[#062420]' : 'bg-[#ea580c] hover:bg-[#c2410c] text-white') + '">' + (quizMode ? "退出猜峰" : "🎮 猜峰小游戏") + "</button>" +
        "</div>" +
      "</div>" +

      '<div class="relative rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3 shadow-xs">' +
        '<canvas id="v21SpecCanvas" width="840" height="315" class="w-full h-[275px] sm:h-[315px] block cursor-grab active:cursor-grabbing" style="touch-action:none;"></canvas>' +
        '<div id="v21FloatTip" style="background:rgba(6,36,32,0.96);color:#f8fafc;border:1.5px solid #fbbf24;" class="pointer-events-none hidden absolute z-20 max-w-[290px] p-3 rounded-xl shadow-2xl text-xs leading-snug"></div>' +
        peakChipsHtml +
        '<div id="v21PeakCard" class="mt-2 p-2.5 rounded-xl bg-[#f6f8f7] dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200">' +
          '<strong>操作提示：</strong>滚轮或点击 +/- 缩放谱图、拖拽平移；悬停/点击任意谱峰或上方特征峰芯片立即弹出归属解析卡。' +
        "</div>" +
      "</div>" +
      quizHtml +
      (v4Note ? '<div class="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/35 border border-emerald-200 dark:border-emerald-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"><strong class="text-[#064e3b] dark:text-emerald-300">📚 站内四谱规则库速查：</strong>' + v4Note + "</div>" : "");

    body.querySelectorAll("[data-v21-cat]").forEach(function (b) {
      b.addEventListener("click", function () { curCat = b.getAttribute("data-v21-cat"); view = { zoom: 1, panX: 0 }; hoverIdx = -1; lockedIdx = -1; if (quizMode) buildQuizRound(); renderAll(); });
    });
    body.querySelectorAll("[data-v21-spec]").forEach(function (b) {
      b.addEventListener("click", function () { curSpec = b.getAttribute("data-v21-spec"); view = { zoom: 1, panX: 0 }; hoverIdx = -1; lockedIdx = -1; if (quizMode) buildQuizRound(); renderAll(); });
    });
    var btnUv = body.querySelector("#v21BtnUvShift");
    if (btnUv) btnUv.addEventListener("click", function () { showUvShift = !showUvShift; renderAll(); });
    var btnInteg = body.querySelector("#v21BtnNmrInteg");
    if (btnInteg) btnInteg.addEventListener("click", function () { showNmrInteg = !showNmrInteg; renderAll(); });

    body.querySelector("#v21BtnZoomIn").addEventListener("click", function () { zoomBy(1.35); });
    body.querySelector("#v21BtnZoomOut").addEventListener("click", function () { zoomBy(1 / 1.35); });
    body.querySelector("#v21BtnResetView").addEventListener("click", function () { view = { zoom: 1, panX: 0 }; updateZoomBadge(); drawSpectrum(); });
    var expBtn = body.querySelector("#v21BtnExportPng");
    if (expBtn) expBtn.addEventListener("click", function () {
      var c = modalEl.querySelector("#v21SpecCanvas");
      if (!c) return;
      var a = document.createElement("a");
      a.download = "本草智研_" + curCat + "_" + curSpec + "_谱图.png";
      a.href = c.toDataURL("image/png");
      a.click();
    });
    body.querySelector("#v21BtnToggleQuiz").addEventListener("click", function () {
      quizMode = !quizMode; hoverIdx = -1; lockedIdx = -1;
      if (quizMode) { quizState.score = 0; quizState.total = 0; quizState.streak = 0; buildQuizRound(); }
      renderAll();
    });

    body.querySelectorAll("[data-v21-peak-chip]").forEach(function (chip) {
      var idx = Number(chip.getAttribute("data-v21-peak-chip"));
      chip.addEventListener("mouseenter", function () {
        hoverIdx = idx;
        updateFloatingCard(idx, modalEl.querySelector("#v21SpecCanvas"));
        drawSpectrum();
      });
      chip.addEventListener("click", function () {
        lockedIdx = lockedIdx === idx ? -1 : idx;
        updateFloatingCard(lockedIdx >= 0 ? lockedIdx : idx, modalEl.querySelector("#v21SpecCanvas"));
        drawSpectrum();
      });
    });

    if (quizMode) {
      body.querySelectorAll("[data-v21-qopt]").forEach(function (b) {
        b.addEventListener("click", function () {
          if (quizState.answered) return;
          var oi = Number(b.getAttribute("data-v21-qopt"));
          quizState.picked = oi; quizState.answered = true; quizState.total += 1;
          if (quizState.options[oi] === sp.peaks[quizState.targetIdx].name) { quizState.score += 1; quizState.streak += 1; }
          else { quizState.streak = 0; }
          renderAll();
        });
      });
      var nextBtn = body.querySelector("#v21BtnNextQuiz");
      if (nextBtn) nextBtn.addEventListener("click", function () { buildQuizRound(); renderAll(); });
      var rstBtn = body.querySelector("#v21BtnRestartQuiz");
      if (rstBtn) rstBtn.addEventListener("click", function () { quizState.score = 0; quizState.total = 0; quizState.streak = 0; buildQuizRound(); renderAll(); });
    }

    bindCanvasEvents();
    drawSpectrum();
  }

  function updateZoomBadge() {
    var zb = modalEl && modalEl.querySelector("#v21ZoomBadge");
    if (zb) zb.textContent = view.zoom.toFixed(1) + "×";
  }

  function zoomBy(factor) {
    var canvas = modalEl && modalEl.querySelector("#v21SpecCanvas");
    var w = canvas ? canvas.width : 840;
    var oldZoom = view.zoom;
    view.zoom = Math.max(1, Math.min(6, view.zoom * factor));
    var center = (w - 76) * 0.5;
    view.panX = center - (center - view.panX) * (view.zoom / oldZoom);
    clampPan(w);
    updateZoomBadge();
    drawSpectrum();
  }

  function updateFloatingCard(idx, canvas) {
    var tip = modalEl.querySelector("#v21FloatTip");
    var card = modalEl.querySelector("#v21PeakCard");
    var sp = SPECTRA_PROFILES[curCat][curSpec];
    if (idx >= 0 && !quizMode && sp.peaks[idx]) {
      var p = sp.peaks[idx];
      var extra = p.integ ? (" · " + p.mult + ", " + p.integ) : "";
      if (card) card.innerHTML = '<strong class="text-[#ea580c]">【' + p.x + " " + sp.unit + extra + " · " + p.name + "】</strong> " + p.detail;
      if (tip && canvas) {
        var px = valToX(p.x, sp, canvas.width);
        var py = sp.type === "ir" ? (30 + 10 + p.h * (canvas.height - 68 - 18)) : (canvas.height - 38 - p.h * (canvas.height - 68 - 20));
        var rect = canvas.getBoundingClientRect();
        var sx = (px / canvas.width) * rect.width;
        var sy = (py / canvas.height) * rect.height;
        tip.innerHTML =
          '<div style="color:#fbbf24;font-weight:800;">' + p.x + " " + sp.unit + extra + " · " + p.name + '</div>' +
          '<div style="color:#e2e8f0;margin-top:4px;">' + p.detail + '</div>';
        tip.style.left = Math.max(14, Math.min(rect.width - 295, sx + 14)) + "px";
        tip.style.top = Math.max(14, Math.min(rect.height - 102, sy - 20)) + "px";
        tip.classList.remove("hidden");
      }
    } else {
      if (tip) tip.classList.add("hidden");
      if (card && !quizMode) card.innerHTML = '<strong>操作提示：</strong>滚轮或点击 +/- 缩放谱图、拖拽平移；悬停/点击任意谱峰或上方特征峰芯片立即弹出归属解析卡。';
    }
  }

  function bindCanvasEvents() {
    var canvas = modalEl.querySelector("#v21SpecCanvas");
    if (!canvas) return;
    canvas.addEventListener("pointerdown", function (e) {
      drag.active = true; drag.startX = e.clientX; drag.startPan = view.panX;
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
    });
    canvas.addEventListener("pointerup", function (e) {
      var moved = Math.abs(e.clientX - drag.startX);
      drag.active = false;
      if (moved < 5 && !quizMode && hoverIdx >= 0) {
        lockedIdx = lockedIdx === hoverIdx ? -1 : hoverIdx;
        updateFloatingCard(lockedIdx >= 0 ? lockedIdx : hoverIdx, canvas);
        drawSpectrum();
      }
    });
    canvas.addEventListener("pointercancel", function () { drag.active = false; });
    canvas.addEventListener("pointermove", function (e) {
      var rect = canvas.getBoundingClientRect();
      var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
      cursorX = mx;
      if (drag.active) {
        view.panX = drag.startPan + (e.clientX - drag.startX) * (canvas.width / rect.width);
        clampPan(canvas.width);
        drawSpectrum();
        return;
      }
      if (quizMode) { drawSpectrum(); return; }
      var sp = SPECTRA_PROFILES[curCat][curSpec];
      var found = -1, minDist = 28;
      sp.peaks.forEach(function (pk, idx) {
        var d = Math.abs(mx - valToX(pk.x, sp, canvas.width));
        if (d < minDist) { minDist = d; found = idx; }
      });
      hoverIdx = found;
      updateFloatingCard(hoverIdx >= 0 ? hoverIdx : lockedIdx, canvas);
      drawSpectrum();
    });
    canvas.addEventListener("pointerleave", function () {
      cursorX = -1; hoverIdx = -1;
      updateFloatingCard(lockedIdx, canvas);
      drawSpectrum();
    });
    canvas.addEventListener("wheel", function (e) {
      e.preventDefault();
      zoomBy(e.deltaY < 0 ? 1.18 : 0.85);
    }, { passive: false });
  }

  function valToX(val, sp, width) {
    var padL = 52, padR = 24;
    var ratio = (val - sp.xMin) / (sp.xMax - sp.xMin);
    if (sp.reverse) ratio = 1 - ratio;
    return padL + (ratio * (width - padL - padR) * view.zoom) + view.panX;
  }

  function xToVal(px, sp, width) {
    var padL = 52, padR = 24;
    var ratio = (px - padL - view.panX) / ((width - padL - padR) * view.zoom);
    if (sp.reverse) ratio = 1 - ratio;
    return sp.xMin + ratio * (sp.xMax - sp.xMin);
  }

  function isDarkModeActive() {
    return document.body.classList.contains("dark-lab") ||
      document.body.classList.contains("dark-mode") ||
      document.documentElement.classList.contains("dark");
  }

  function drawSpectrum() {
    var canvas = modalEl.querySelector("#v21SpecCanvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var w = canvas.width, h = canvas.height;
    var padL = 52, padR = 24, padT = 30, padB = 38;
    var plotH = h - padT - padB;
    var sp = SPECTRA_PROFILES[curCat][curSpec];
    var isDark = isDarkModeActive();

    // Solid backdrop so both live view and exported PNG have crisp contrast
    ctx.fillStyle = isDark ? "#0f2622" : "#ffffff";
    ctx.fillRect(0, 0, w, h);

    // IR Functional Group Region Shading Bands!
    if (sp.type === "ir") {
      var bands = [
        { a: 3650, b: 3150, lbl: "O-H / N-H", row: 0, col: isDark ? "rgba(248,113,113,0.13)" : "rgba(239,68,68,0.08)" },
        { a: 1760, b: 1615, lbl: "C=O 羰基区", row: 0, col: isDark ? "rgba(251,146,60,0.15)" : "rgba(249,115,22,0.10)" },
        { a: 1610, b: 1450, lbl: "芳环骨架", row: 1, col: isDark ? "rgba(52,211,153,0.14)" : "rgba(16,185,129,0.09)" },
        { a: 1300, b: 550,  lbl: "指纹区 (<1300)", row: 0, col: isDark ? "rgba(148,163,184,0.12)" : "rgba(100,116,139,0.07)" }
      ];
      ctx.save();
      ctx.beginPath(); ctx.rect(padL, padT, w - padL - padR, plotH); ctx.clip();
      bands.forEach(function (bd) {
        var x1 = valToX(bd.a, sp, w), x2 = valToX(bd.b, sp, w);
        ctx.fillStyle = bd.col;
        ctx.fillRect(Math.min(x1, x2), padT, Math.abs(x2 - x1), plotH);
        ctx.fillStyle = isDark ? "rgba(226,241,237,0.88)" : "rgba(51,65,85,0.72)";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(bd.lbl, (x1 + x2) * 0.5, padT + (bd.row ? 25 : 12));
      });
      ctx.restore();
    }

    // Grid lines & axes
    ctx.strokeStyle = isDark ? "rgba(148, 163, 184, 0.16)" : "rgba(15, 23, 42, 0.06)";
    ctx.lineWidth = 1;
    for (var gy = 0; gy <= 4; gy++) {
      var yy = padT + (plotH / 4) * gy;
      ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(w - padR, yy); ctx.stroke();
    }
    ctx.strokeStyle = isDark ? "#64748b" : "#334155";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, h - padB); ctx.lineTo(w - padR, h - padB); ctx.stroke();

    ctx.fillStyle = isDark ? "#cbd5e1" : "#475569";
    ctx.font = "11px monospace";
    ctx.textAlign = "center";
    var ticks = Math.min(14, Math.round(6 * view.zoom));
    for (var i = 0; i <= ticks; i++) {
      var v = sp.xMin + ((sp.xMax - sp.xMin) / ticks) * i;
      var tx = valToX(v, sp, w);
      if (tx >= padL && tx <= w - padR) ctx.fillText(sp.unit === "ppm" ? v.toFixed(1) : Math.round(v), tx, h - padB + 16);
    }
    ctx.textAlign = "right";
    ctx.fillText(sp.unit, w - padR, h - 6);
    ctx.save(); ctx.translate(16, padT + plotH / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center";
    ctx.fillText(sp.type === "ir" ? "透射率 T%" : (sp.type === "ms" ? "相对丰度 %" : "相对强度"), 0, 0);
    ctx.restore();

    ctx.save();
    ctx.beginPath(); ctx.rect(padL, padT, w - padL - padR, plotH); ctx.clip();

    if (cursorX >= padL && cursorX <= w - padR) {
      var curV = xToVal(cursorX, sp, w);
      ctx.strokeStyle = "rgba(249, 115, 22, 0.42)";
      ctx.setLineDash([4, 3]); ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(cursorX, padT); ctx.lineTo(cursorX, h - padB); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = isDark ? "#fb923c" : "#f97316"; ctx.font = "bold 11px monospace"; ctx.textAlign = "left";
      ctx.fillText((sp.unit === "ppm" ? curV.toFixed(2) : Math.round(curV)) + " " + sp.unit, Math.min(w - padR - 72, cursorX + 6), padT + 14);
    }

    var activeIdx = quizMode ? quizState.targetIdx : (hoverIdx >= 0 ? hoverIdx : lockedIdx);
    var curveColor = isDark ? "#34d399" : "#059669";

    if (sp.type === "curve" || sp.type === "ir") {
      // Main spectrum curve
      ctx.strokeStyle = curveColor;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      var steps = Math.round(300 * Math.min(2.5, view.zoom));
      for (var s = 0; s <= steps; s++) {
        var xv = sp.xMin + ((sp.xMax - sp.xMin) / steps) * s;
        var sum = 0;
        sp.peaks.forEach(function (pk) {
          var sigma = pk.w || (sp.xMax - sp.xMin) * 0.042;
          sum += pk.h * Math.exp(-0.5 * Math.pow((xv - pk.x) / sigma, 2));
        });
        var clamped = Math.min(0.98, sum);
        var px = valToX(xv, sp, w);
        var py = sp.type === "ir" ? (padT + 14 + clamped * (plotH - 22)) : (h - padB - clamped * (plotH - 14));
        if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // UV Diagnostic Shift Reagent Dashed Overlay!
      if (sp.type === "curve" && showUvShift && sp.shiftReagent) {
        ctx.strokeStyle = isDark ? "#fb923c" : "#f97316";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        for (var s2 = 0; s2 <= steps; s2++) {
          var xv2 = sp.xMin + ((sp.xMax - sp.xMin) / steps) * s2;
          var sum2 = 0;
          sp.peaks.forEach(function (pk, pi) {
            var shift = pi === sp.shiftReagent.targetIdx ? sp.shiftReagent.shift : 6;
            var sigma = (sp.xMax - sp.xMin) * 0.044;
            sum2 += pk.h * 0.96 * Math.exp(-0.5 * Math.pow((xv2 - (pk.x + shift)) / sigma, 2));
          });
          var px2 = valToX(xv2, sp, w);
          var py2 = h - padB - Math.min(0.98, sum2) * (plotH - 14);
          if (s2 === 0) ctx.moveTo(px2, py2); else ctx.lineTo(px2, py2);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = isDark ? "#fdba74" : "#ea580c"; ctx.font = "bold 11px sans-serif"; ctx.textAlign = "left";
        ctx.fillText("---- " + sp.shiftReagent.label, padL + 10, padT + 16);
      }
    } else if (sp.type === "nmr") {
      // Realistic Lorentzian NMR curve with doublet/triplet/multiplet splitting!
      ctx.strokeStyle = curveColor;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      var nSteps = Math.round(420 * Math.min(2.5, view.zoom));
      var integAcc = 0;
      var integPts = [];
      for (var ns = 0; ns <= nSteps; ns++) {
        var ppm = sp.xMax - ((sp.xMax - sp.xMin) / nSteps) * ns; // sweep downfield -> upfield
        var ySum = 0;
        sp.peaks.forEach(function (pk) {
          var g = 0.045;
          if (pk.mult === "d") {
            ySum += pk.h * 0.72 * (g * g / ((ppm - (pk.x - 0.07)) ** 2 + g * g) + g * g / ((ppm - (pk.x + 0.07)) ** 2 + g * g));
          } else if (pk.mult === "t") {
            ySum += pk.h * 0.55 * (0.6 * g * g / ((ppm - (pk.x - 0.10)) ** 2 + g * g) + g * g / ((ppm - pk.x) ** 2 + g * g) + 0.6 * g * g / ((ppm - (pk.x + 0.10)) ** 2 + g * g));
          } else if (pk.mult === "m") {
            ySum += pk.h * 0.45 * (g * g / ((ppm - (pk.x - 0.12)) ** 2 + g * g) + g * g / ((ppm - pk.x) ** 2 + g * g) + g * g / ((ppm - (pk.x + 0.12)) ** 2 + g * g));
          } else {
            ySum += pk.h * (g * g / ((ppm - pk.x) ** 2 + g * g));
          }
        });
        var yVal = Math.min(0.96, ySum);
        integAcc += yVal * 0.024;
        var npx = valToX(ppm, sp, w);
        var npy = h - padB - yVal * (plotH - 22);
        if (ns === 0) ctx.moveTo(npx, npy); else ctx.lineTo(npx, npy);
        integPts.push({ x: npx, acc: integAcc });
      }
      ctx.stroke();

      // Optional NMR Integration Step Curve (∫)
      if (showNmrInteg && integAcc > 0) {
        ctx.strokeStyle = isDark ? "rgba(56, 189, 248, 0.85)" : "rgba(2, 132, 199, 0.75)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        integPts.forEach(function (ip, idx) {
          var iy = h - padB - 12 - (ip.acc / integAcc) * (plotH * 0.46);
          if (idx === 0) ctx.moveTo(ip.x, iy); else ctx.lineTo(ip.x, iy);
        });
        ctx.stroke();
      }
    } else {
      // MS Stick Spectrum + Neutral Loss Fragmentation Arrows!
      sp.peaks.forEach(function (pk, idx) {
        var px = valToX(pk.x, sp, w);
        var py = h - padB - pk.h * (plotH - 24);
        var isTarget = idx === activeIdx;
        ctx.strokeStyle = isTarget ? "#f97316" : curveColor;
        ctx.lineWidth = isTarget ? 3.8 : 2.5;
        ctx.beginPath(); ctx.moveTo(px, h - padB); ctx.lineTo(px, py); ctx.stroke();
      });
      if (sp.losses && !quizMode) {
        sp.losses.forEach(function (ls, li) {
          var x1 = valToX(ls.from, sp, w), x2 = valToX(ls.to, sp, w);
          var ay = padT + 22 + li * 22;
          ctx.strokeStyle = isDark ? "#fb923c" : "#f97316";
          ctx.setLineDash([4, 3]); ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.moveTo(x1, ay); ctx.lineTo(x2, ay); ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = isDark ? "#fdba74" : "#ea580c"; ctx.font = "bold 10.5px sans-serif"; ctx.textAlign = "center";
          ctx.fillText("◀ " + ls.label, (x1 + x2) * 0.5, ay - 4);
        });
      }
    }

    // Peak markers & collision-aware labels
    var placedLabels = [];
    sp.peaks.forEach(function (pk, idx) {
      var px = valToX(pk.x, sp, w);
      var py = sp.type === "ir" ? (padT + 14 + pk.h * (plotH - 22)) : (h - padB - pk.h * (plotH - 24));
      var isTarget = idx === activeIdx;
      ctx.fillStyle = isTarget ? "#fb923c" : curveColor;
      ctx.beginPath(); ctx.arc(px, py, isTarget ? 6.5 : 4.2, 0, Math.PI * 2); ctx.fill();
      if (!quizMode || (quizMode && idx === quizState.targetIdx)) {
        ctx.fillStyle = isTarget ? "#fb923c" : (isDark ? "#f0fdfa" : "#1e293b");
        ctx.font = isTarget ? "bold 12px sans-serif" : "11px sans-serif";
        ctx.textAlign = "center";
        var labelText = quizMode ? ("? (" + pk.x + ")") : (pk.x + (pk.integ ? " (" + pk.integ + ")" : "") + " " + pk.name.split(" ")[0]);
        var ly = sp.type === "ir" ? Math.min(h - padB - 6, py + 16) : Math.max(padT + 16, py - 10);
        // Prevent nearby peak labels (e.g., 1690 & 1630 cm⁻¹) from colliding
        for (var pi = 0; pi < placedLabels.length; pi++) {
          if (Math.abs(px - placedLabels[pi].x) < 92 && Math.abs(ly - placedLabels[pi].y) < 15) {
            ly = sp.type === "ir" ? Math.max(padT + 38, ly - 24) : Math.max(padT + 16, ly - 16);
          }
        }
        var lx = Math.max(padL + 46, Math.min(w - padR - 46, px));
        placedLabels.push({ x: lx, y: ly });
        ctx.fillText(labelText, lx, ly);
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
        var cat = /生物碱/.test(catText) ? "生物碱" : (/蒽醌/.test(catText) ? "蒽醌与醌类" : (/酚酸|苯丙素/.test(catText) ? "酚酸类" : "黄酮"));
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
        desc: "UV 诊断位移 / IR 官能团区 / ¹H-NMR 劈裂积分 / MS 裂解路径与自动判分猜峰小游戏。",
        onOpen: function () { openModal("黄酮"); }
      });
    }
    mountStep3Button();
    var s3Card = document.getElementById("step3FourSpectraCard");
    if (s3Card && typeof MutationObserver !== "undefined") {
      new MutationObserver(function () { mountStep3Button(); }).observe(s3Card, { childList: true });
    }
    if (typeof MutationObserver !== "undefined" && document.body && !document.body.__v21ThemeObs) {
      document.body.__v21ThemeObs = true;
      new MutationObserver(function () {
        if (modalEl && !modalEl.classList.contains("hidden")) drawSpectrum();
      }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
    }
  }

  window.TCM_V21_SPECTRA_LAB = {
    version: "2.1.0-scientific",
    open: openModal,
    getState: function () {
      return {
        cat: curCat, spec: curSpec, zoom: Number(view.zoom.toFixed(2)), panX: Math.round(view.panX),
        showUvShift: showUvShift, showNmrInteg: showNmrInteg,
        quizMode: quizMode, quizScore: quizState.score, quizTotal: quizState.total, quizStreak: quizState.streak
      };
    }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", registerIntegrations);
  else registerIntegrations();
})();
