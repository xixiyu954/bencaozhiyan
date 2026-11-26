/**
 * 本草智研 1.7 · 驾驶舱数据大屏（深度教学汇报版）
 * 特性：
 * - 3D 五维工艺雷达（支持 360° 拖拽旋转 + 基准方案白色线框对照叠层 + 实时增益 Δ 标注）
 * - 4 联动态弧形仪表盘 + 实时工艺风险与调优诊断条
 * - 3 套课堂一键对比预设（标准绿色工艺 / 高温热敏超载 / 含卤高危溶剂）
 * - 双向同步工作台 #cfgMass/#cfgRatio/#cfgTemp/#cfgTime/#cfgCycles/#cfgSolventType
 * - 一键全屏投影演示模式（1920×1080 大字高对比清晰可读）
 */
(function () {
  "use strict";

  var SOLVENT_PROFILES = {
    water:  { name: "纯化水", green: 98, econ: 96, effBase: 76 },
    etoh70: { name: "70% 乙醇", green: 90, econ: 86, effBase: 88 },
    etoh95: { name: "95% 乙醇", green: 84, econ: 80, effBase: 92 },
    ea:     { name: "乙酸乙酯", green: 78, econ: 74, effBase: 86 },
    meoh:   { name: "甲醇", green: 56, econ: 72, effBase: 90 },
    chcl3:  { name: "三氯甲烷(氯仿)", green: 34, econ: 64, effBase: 89 }
  };

  var BASELINE_DIMS = [86, 90, 90, 84, 88]; // Standard green reference baseline

  function detectSolventKey(raw) {
    var s = String(raw || "");
    if (/氯仿|三氯甲烷|二氯甲烷/.test(s)) return "chcl3";
    if (/甲醇/.test(s)) return "meoh";
    if (/乙酸乙酯/.test(s)) return "ea";
    if (/95%|高浓度乙醇|无水乙醇/.test(s)) return "etoh95";
    if (/乙醇|醇/.test(s)) return "etoh70";
    return "water";
  }

  function computeProcessScores(params) {
    var sv = SOLVENT_PROFILES[params.solventKey] || SOLVENT_PROFILES.etoh70;
    var temp = Number(params.temp) || 70;
    var ratio = Number(params.ratio) || 10;
    var time = Number(params.time) || 60;
    var cycles = Number(params.cycles) || 2;
    var mass = Number(params.mass) || 50;

    var tempEff = 100 - Math.min(42, Math.abs(temp - 75) * 0.85);
    var ratioEff = Math.min(100, 62 + Math.min(ratio, 14) * 2.5);
    var timeEff = Math.min(100, 58 + Math.min(time * cycles, 180) * 0.22);
    var eff = Math.round(Math.max(25, Math.min(99, sv.effBase * 0.4 + tempEff * 0.3 + ratioEff * 0.15 + timeEff * 0.15)));
    var thermal = temp <= 60 ? 98 : (temp <= 75 ? Math.round(98 - (temp - 60) * 0.6) : Math.round(Math.max(22, 89 - (temp - 75) * 1.9)));
    var green = Math.round(Math.max(20, Math.min(99, sv.green - (temp > 90 ? (temp - 90) * 0.45 : 0))));
    var totalVol = mass * ratio * cycles;
    var econ = Math.round(Math.max(28, Math.min(98, sv.econ - Math.max(0, ratio - 10) * 2.4 - Math.max(0, totalVol - 1200) * 0.008)));
    var totalMin = time * cycles;
    var schedule = totalMin <= 120 ? 96 : (totalMin <= 240 ? Math.round(96 - (totalMin - 120) * 0.16) : Math.round(Math.max(30, 77 - (totalMin - 240) * 0.22)));
    var overall = Math.round(eff * 0.28 + thermal * 0.20 + green * 0.22 + econ * 0.15 + schedule * 0.15);

    var diag = { level: "ok", text: "✅ 当前工艺处于高效绿色平衡区，热敏保护与溶剂经济性良好，适合课堂演示与中试放大。" };
    if (params.solventKey === "chcl3" || params.solventKey === "meoh") {
      diag = { level: "danger", text: "绿色安全预警：所选「" + sv.name + "」具高挥发/毒性风险（绿色分仅 " + green + "），建议评估 70%~95% 乙醇或乙酸乙酯绿色替代。" };
    } else if (temp > 85) {
      diag = { level: "warn", text: "热敏降解预警：当前温度 " + temp + "℃ 过高（热敏保护跌至 " + thermal + " 分），易致酚酸/黄酮苷/挥发油分解，建议控温 65~75℃。" };
    } else if (ratio > 14) {
      diag = { level: "warn", text: "溶剂经济提示：料液比 1:" + ratio + " 导致总耗液达 " + Math.round(totalVol) + " mL，后续旋蒸浓缩能耗偏高，建议优化至 1:8~1:12。" };
    }

    return {
      dims: [
        { key: "eff", name: "提取效率", value: eff, base: BASELINE_DIMS[0], color: "#34d399" },
        { key: "thermal", name: "热敏保护", value: thermal, base: BASELINE_DIMS[1], color: "#38bdf8" },
        { key: "green", name: "绿色安全", value: green, base: BASELINE_DIMS[2], color: "#4ade80" },
        { key: "econ", name: "溶剂经济", value: econ, base: BASELINE_DIMS[3], color: "#fbbf24" },
        { key: "schedule", name: "课时适配", value: schedule, base: BASELINE_DIMS[4], color: "#a78bfa" }
      ],
      overall: overall,
      totalVol: Math.round(totalVol),
      totalMin: Math.round(totalMin),
      estYieldPct: Number((eff * 0.032).toFixed(2)),
      diag: diag
    };
  }

  function readWorkbenchParams() {
    var massEl = document.getElementById("cfgMass");
    var ratioEl = document.getElementById("cfgRatio");
    var tempEl = document.getElementById("cfgTemp");
    var timeEl = document.getElementById("cfgTime");
    var cycEl = document.getElementById("cfgCycles");
    var solvEl = document.getElementById("cfgSolventType");
    var herbEl = document.getElementById("cfgHerbName");
    return {
      herb: (herbEl && herbEl.textContent && herbEl.textContent.trim()) || "丹参 · 丹参酮 IIA（脂水双提）",
      mass: massEl ? (Number(massEl.value) || 50) : 50,
      ratio: ratioEl ? (Number(ratioEl.value) || 8) : 8,
      temp: tempEl ? (Number(tempEl.value) || 70) : 70,
      time: timeEl ? (Number(timeEl.value) || 60) : 60,
      cycles: cycEl ? (parseInt(cycEl.value, 10) || 2) : 2,
      solventKey: solvEl ? detectSolventKey(solvEl.value || (solvEl.options && solvEl.options[solvEl.selectedIndex] ? solvEl.options[solvEl.selectedIndex].text : "")) : "etoh95"
    };
  }

  function syncBackToWorkbench(params) {
    function setVal(id, v) {
      var el = document.getElementById(id);
      if (!el || String(el.value) === String(v)) return;
      el.value = String(v);
      try {
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      } catch (_) {}
    }
    setVal("cfgMass", params.mass);
    setVal("cfgRatio", params.ratio);
    setVal("cfgTemp", params.temp);
    setVal("cfgTime", params.time);
  }

  function mountCockpit(container) {
    var destroyed = false;
    var rafId = null;
    var isFullscreen = false;
    var showBaseline = true;
    var params = readWorkbenchParams();
    var targetScores = computeProcessScores(params);
    var animVals = targetScores.dims.map(function (d) { return d.value; });
    var animOverall = targetScores.overall;
    var animTemp = params.temp;

    var rotY = 0.42, tiltX = 0.54, autoOrbit = true, dragging = false, lastX = 0, lastY = 0;

    function buildDom() {
      var allTopics = (window.TCM_LAB_API && window.TCM_LAB_API.getAllTopics) ? window.TCM_LAB_API.getAllTopics() : [];
      var curTopicObj = (window.TCM_LAB_API && window.TCM_LAB_API.getCurrentTopic) ? window.TCM_LAB_API.getCurrentTopic() : null;
      var topicOpts = '<option value="">快速切换题库课题（' + allTopics.length + ' 项全覆盖）</option>' +
        allTopics.map(function (t) {
          var sel = curTopicObj && curTopicObj.id === t.id ? " selected" : "";
          return '<option value="' + t.id + '"' + sel + '>' + t.herb + ' — ' + (t.compound || t.category) + '</option>';
        }).join("");
      var relLit = (window.TCM_LAB_API && window.TCM_LAB_API.findLiteratureForTopic && curTopicObj)
        ? window.TCM_LAB_API.findLiteratureForTopic(curTopicObj, 2)
        : [];
      var solvOpts = Object.keys(SOLVENT_PROFILES).map(function (k) {
        return '<option value="' + k + '"' + (k === params.solventKey ? " selected" : "") + '>' + SOLVENT_PROFILES[k].name + "</option>";
      }).join("");

      container.innerHTML =
        '<div id="v22CockpitRoot" class="rounded-2xl bg-gradient-to-br from-[#041b17] via-[#072923] to-[#0a362e] text-white border border-emerald-400/30 p-4 sm:p-5 space-y-3.5 transition-all">' +
          '<div class="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-400/20 pb-3">' +
            '<div class="min-w-0 flex-1">' +
              '<div class="flex flex-wrap items-center gap-2">' +
                '<span class="px-2 py-0.5 rounded-md bg-emerald-400/20 text-emerald-200 text-xs font-bold">五维雷达驾驶舱</span>' +
                '<span class="text-xs text-emerald-300/80 font-semibold">3D 五维雷达 × 基准线框对照 × ' + ((window.TCM_LAB_API && window.TCM_LAB_API.getCounts) ? window.TCM_LAB_API.getCounts().topics : 144) + ' 课题实时联动</span>' +
              '</div>' +
              '<div class="flex flex-wrap items-center gap-2.5 mt-1.5">' +
                '<h3 id="v22CpHerbTitle" class="text-base sm:text-lg font-extrabold text-white truncate">' + params.herb + '</h3>' +
                '<select id="v22CpTopicSelect" class="max-w-[270px] px-2.5 py-1 rounded-lg bg-slate-900/90 border border-emerald-400/35 text-emerald-100 text-xs font-bold">' + topicOpts + '</select>' +
              '</div>' +
            '</div>' +
            '<div class="flex flex-wrap items-center gap-1.5">' +
              '<button type="button" data-cp-preset="green" class="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/40 text-xs font-bold text-emerald-100">绿色优选</button>' +
              '<button type="button" data-cp-preset="hot" class="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/40 text-xs font-bold text-amber-100">高温超载</button>' +
              '<button type="button" data-cp-preset="toxic" class="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/35 border border-rose-400/40 text-xs font-bold text-rose-100">含卤高危</button>' +
              '<button type="button" id="v22CpBaselineBtn" class="px-2.5 py-1.5 rounded-lg bg-white/15 border border-cyan-300/50 text-xs font-bold text-cyan-200">基准对照</button>' +
              '<button type="button" id="v22CpAutoOrbit" class="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-emerald-100">⏸</button>' +
              '<button type="button" id="v22CpSnapBtn" class="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-emerald-100">导出雷达</button>' +
              '<button type="button" id="v22CpFullscreenBtn" class="px-3 py-1.5 rounded-lg bg-[#9a4a24] hover:bg-[#7d3a1b] text-white text-xs font-bold shadow-sm">全屏演示</button>' +
            '</div>' +
          '</div>' +
          (relLit.length ? '<div id="v22CpLitStrip" class="px-3 py-2 rounded-xl bg-white/5 border border-emerald-400/15 text-[11px] text-emerald-100/85 leading-snug"><strong class="text-emerald-300">关联实证文献：</strong>' + relLit.map(function (l) { return l.text; }).join(" ； ") + '</div>' : '<div id="v22CpLitStrip" class="hidden"></div>') +

          '<div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">' +
            '<div class="lg:col-span-7 flex flex-col gap-3">' +
              '<div class="relative rounded-2xl bg-slate-950/55 border border-emerald-400/25 overflow-hidden">' +
                '<canvas id="v22Radar3dCanvas" class="w-full h-[300px] sm:h-[355px] block cursor-grab active:cursor-grabbing" style="touch-action:none;"></canvas>' +
                '<div class="pointer-events-none absolute top-2.5 left-3 px-2.5 py-1 rounded-lg bg-slate-950/75 border border-emerald-400/30 text-[11.5px] font-bold text-emerald-200">拖拽旋转 3D 雷达 · 虚线框为标准绿色基准</div>' +
                '<div class="pointer-events-none absolute top-2.5 right-3 px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-xs sm:text-sm font-black text-emerald-200">综合分：<span id="v22CpOverallBadge">' + targetScores.overall + '</span> / 100</div>' +
              '</div>' +
              '<div class="rounded-2xl bg-slate-950/50 border border-emerald-400/20 p-2.5">' +
                '<canvas id="v22GaugesCanvas" class="w-full h-[122px] sm:h-[136px] block"></canvas>' +
              '</div>' +
            '</div>' +

            '<div class="lg:col-span-5 flex flex-col justify-between gap-3">' +
              '<div class="rounded-2xl bg-white/5 border border-emerald-400/20 p-4 space-y-2.5">' +
                '<div class="flex items-center justify-between">' +
                  '<span class="text-sm font-extrabold text-emerald-200">工艺参数实时联动面板</span>' +
                  '<span class="text-[11px] text-emerald-300/80 font-semibold">双向同步工作台</span>' +
                '</div>' +
                '<div class="space-y-2 text-xs sm:text-sm">' +
                  '<div><div class="flex justify-between font-bold mb-0.5"><span>提取温度</span><span id="v22CpTempVal" class="text-amber-300 font-mono">' + params.temp + ' ℃</span></div><input id="v22CpTemp" type="range" min="25" max="115" step="5" value="' + params.temp + '" class="w-full accent-amber-400" /></div>' +
                  '<div><div class="flex justify-between font-bold mb-0.5"><span>溶剂料液比</span><span id="v22CpRatioVal" class="text-emerald-300 font-mono">1 : ' + params.ratio + '</span></div><input id="v22CpRatio" type="range" min="4" max="20" step="1" value="' + params.ratio + '" class="w-full accent-emerald-400" /></div>' +
                  '<div><div class="flex justify-between font-bold mb-0.5"><span>单次提取时间</span><span id="v22CpTimeVal" class="text-sky-300 font-mono">' + params.time + ' min</span></div><input id="v22CpTime" type="range" min="15" max="180" step="15" value="' + params.time + '" class="w-full accent-sky-400" /></div>' +
                  '<div><div class="flex justify-between font-bold mb-0.5"><span>单批投料量</span><span id="v22CpMassVal" class="text-emerald-200 font-mono">' + params.mass + ' g</span></div><input id="v22CpMass" type="range" min="10" max="300" step="10" value="' + params.mass + '" class="w-full accent-emerald-400" /></div>' +
                  '<div><label class="block font-bold mb-0.5">提取溶剂体系</label><select id="v22CpSolvent" class="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-400/35 text-white font-bold text-xs sm:text-sm">' + solvOpts + '</select></div>' +
                '</div>' +
              '</div>' +

              '<div id="v22CpDiagBox" class="p-3 rounded-2xl border text-xs font-bold leading-snug"></div>' +

              '<div class="grid grid-cols-2 gap-2.5">' +
                '<div class="rounded-2xl bg-white/5 border border-emerald-400/20 p-3"><div class="text-xs text-emerald-200/80 font-bold">总溶剂耗量</div><div id="v22CpKpiVol" class="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">' + targetScores.totalVol + ' mL</div></div>' +
                '<div class="rounded-2xl bg-white/5 border border-emerald-400/20 p-3"><div class="text-xs text-emerald-200/80 font-bold">预计总工时</div><div id="v22CpKpiTime" class="text-xl sm:text-2xl font-black text-sky-300 font-mono mt-0.5">' + targetScores.totalMin + ' min</div></div>' +
                '<div class="rounded-2xl bg-white/5 border border-emerald-400/20 p-3"><div class="text-xs text-emerald-200/80 font-bold">预估活性得率</div><div id="v22CpKpiYield" class="text-xl sm:text-2xl font-black text-emerald-300 font-mono mt-0.5">' + targetScores.estYieldPct + '%</div></div>' +
                '<div class="rounded-2xl bg-white/5 border border-emerald-400/20 p-3"><div class="text-xs text-emerald-200/80 font-bold">当前工艺评级</div><div id="v22CpKpiGrade" class="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">A 优</div></div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';
    }

    buildDom();

    var rootEl = container.querySelector("#v22CockpitRoot");
    var radarCanvas = container.querySelector("#v22Radar3dCanvas");
    var gaugeCanvas = container.querySelector("#v22GaugesCanvas");
    var fsBtn = container.querySelector("#v22CpFullscreenBtn");
    var orbitBtn = container.querySelector("#v22CpAutoOrbit");
    var baseBtn = container.querySelector("#v22CpBaselineBtn");

    function refreshScores(pushToWorkbench) {
      targetScores = computeProcessScores(params);
      if (pushToWorkbench) syncBackToWorkbench(params);
      var bdg = container.querySelector("#v22CpOverallBadge"); if (bdg) bdg.textContent = String(targetScores.overall);
      var tv = container.querySelector("#v22CpTempVal"); if (tv) tv.textContent = params.temp + " ℃";
      var rv = container.querySelector("#v22CpRatioVal"); if (rv) rv.textContent = "1 : " + params.ratio;
      var tm = container.querySelector("#v22CpTimeVal"); if (tm) tm.textContent = params.time + " min";
      var mv = container.querySelector("#v22CpMassVal"); if (mv) mv.textContent = params.mass + " g";
      var kv = container.querySelector("#v22CpKpiVol"); if (kv) kv.textContent = targetScores.totalVol + " mL";
      var kt = container.querySelector("#v22CpKpiTime"); if (kt) kt.textContent = targetScores.totalMin + " min";
      var ky = container.querySelector("#v22CpKpiYield"); if (ky) ky.textContent = targetScores.estYieldPct + "%";
      var kg = container.querySelector("#v22CpKpiGrade");
      if (kg) {
        var o = targetScores.overall;
        kg.textContent = o >= 88 ? "A+ 卓越" : (o >= 78 ? "A 优良" : (o >= 65 ? "B 合格" : "C 需优化"));
        kg.className = "text-xl sm:text-2xl font-black mt-0.5 " + (o >= 80 ? "text-emerald-300" : (o >= 65 ? "text-amber-300" : "text-rose-400"));
      }
      var db = container.querySelector("#v22CpDiagBox");
      if (db) {
        db.textContent = targetScores.diag.text;
        db.className = "p-3 rounded-2xl border text-xs font-bold leading-snug " + (
          targetScores.diag.level === "danger"
            ? "bg-rose-950/75 border-rose-400/60 text-rose-100"
            : targetScores.diag.level === "warn"
              ? "bg-amber-950/75 border-amber-400/60 text-amber-100"
              : "bg-emerald-950/70 border-emerald-400/45 text-emerald-100"
        );
      }
    }
    refreshScores(false);

    function applyParamsPatch(patch, push) {
      Object.assign(params, patch || {});
      var elT = container.querySelector("#v22CpTemp"); if (elT) elT.value = String(params.temp);
      var elR = container.querySelector("#v22CpRatio"); if (elR) elR.value = String(params.ratio);
      var elTi = container.querySelector("#v22CpTime"); if (elTi) elTi.value = String(params.time);
      var elM = container.querySelector("#v22CpMass"); if (elM) elM.value = String(params.mass);
      var elS = container.querySelector("#v22CpSolvent"); if (elS) elS.value = params.solventKey;
      refreshScores(!!push);
    }

    var cpTopicSel = container.querySelector("#v22CpTopicSelect");
    if (cpTopicSel) {
      cpTopicSel.addEventListener("change", function () {
        var tid = cpTopicSel.value;
        if (!tid || !window.TCM_LAB_API || !window.TCM_LAB_API.getTopicById) return;
        var tObj = window.TCM_LAB_API.getTopicById(tid);
        if (!tObj) return;
        var cfg = tObj.defaultCfg || {};
        params.herb = (tObj.herb || "") + " · " + (tObj.compound || "");
        var hEl = container.querySelector("#v22CpHerbTitle");
        if (hEl) hEl.textContent = params.herb;
        var litEl = container.querySelector("#v22CpLitStrip");
        if (litEl && window.TCM_LAB_API.findLiteratureForTopic) {
          var lits = window.TCM_LAB_API.findLiteratureForTopic(tObj, 2);
          if (lits.length) {
            litEl.classList.remove("hidden");
            litEl.innerHTML = '<strong class="text-emerald-300">关联实证文献：</strong>' + lits.map(function (l) { return l.text; }).join(" ； ");
          }
        }
        applyParamsPatch({
          mass: Number(cfg.mass) || 50,
          ratio: Number(cfg.ratio) || 10,
          temp: Number(cfg.temp) || 75,
          time: Number(cfg.time) || 60,
          cycles: parseInt(cfg.cycles, 10) || 2,
          solventKey: detectSolventKey(cfg.solventType || "70%乙醇")
        }, false);
      });
    }

    container.querySelectorAll("[data-cp-preset]").forEach(function (b) {
      b.addEventListener("click", function () {
        var p = b.getAttribute("data-cp-preset");
        if (p === "green") applyParamsPatch({ temp: 70, ratio: 8, time: 60, mass: 50, solventKey: "etoh70" }, true);
        else if (p === "hot") applyParamsPatch({ temp: 105, ratio: 16, time: 120, mass: 120, solventKey: "water" }, true);
        else if (p === "toxic") applyParamsPatch({ temp: 65, ratio: 10, time: 60, mass: 80, solventKey: "chcl3" }, true);
      });
    });

    [["#v22CpTemp", "temp"], ["#v22CpRatio", "ratio"], ["#v22CpTime", "time"], ["#v22CpMass", "mass"]].forEach(function (pair) {
      var el = container.querySelector(pair[0]);
      if (el) el.addEventListener("input", function () { params[pair[1]] = Number(el.value); refreshScores(true); });
    });
    var solvSel = container.querySelector("#v22CpSolvent");
    if (solvSel) solvSel.addEventListener("change", function () { params.solventKey = solvSel.value; refreshScores(false); });

    var onWorkbenchChange = function () {
      params = readWorkbenchParams();
      var elH = container.querySelector("#v22CpHerbTitle"); if (elH) elH.textContent = params.herb;
      applyParamsPatch(params, false);
    };
    ["cfgMass", "cfgRatio", "cfgTemp", "cfgTime", "cfgCycles", "cfgSolventType"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.addEventListener("input", onWorkbenchChange); el.addEventListener("change", onWorkbenchChange); }
    });

    baseBtn.addEventListener("click", function () {
      showBaseline = !showBaseline;
      baseBtn.className = "px-2.5 py-1.5 rounded-xl border text-xs font-bold " + (showBaseline ? "bg-white/15 border-cyan-300/50 text-cyan-200" : "bg-white/5 border-white/15 text-slate-400");
    });
    orbitBtn.addEventListener("click", function () {
      autoOrbit = !autoOrbit;
      orbitBtn.textContent = autoOrbit ? "⏸" : "▶";
    });

    function setFullscreen(on) {
      isFullscreen = !!on;
      var h3 = container.querySelector("#v22CpHerbTitle");
      if (isFullscreen) {
        rootEl.classList.add("fixed", "inset-0", "z-[9999]", "rounded-none", "overflow-y-auto", "p-6", "sm:p-8");
        rootEl.setAttribute("data-projection-fullscreen", "true");
        if (h3) { h3.style.setProperty("font-size", "30px", "important"); h3.style.lineHeight = "1.25"; }
        fsBtn.textContent = "✕ 退出全屏演示 (Esc)";
        if (rootEl.requestFullscreen) { try { rootEl.requestFullscreen().catch(function () {}); } catch (_) {} }
      } else {
        rootEl.classList.remove("fixed", "inset-0", "z-[9999]", "rounded-none", "overflow-y-auto", "p-6", "sm:p-8");
        rootEl.removeAttribute("data-projection-fullscreen");
        if (h3) h3.style.fontSize = "";
        fsBtn.textContent = "全屏演示";
        if (document.fullscreenElement && document.exitFullscreen) { try { document.exitFullscreen().catch(function () {}); } catch (_) {} }
      }
    }
    var snapBtn = container.querySelector("#v22CpSnapBtn");
    if (snapBtn) snapBtn.addEventListener("click", function () {
      var a = document.createElement("a");
      a.download = "本草智研_3D五维工艺雷达_" + params.temp + "C.png";
      a.href = radarCanvas.toDataURL("image/png");
      a.click();
    });
    fsBtn.addEventListener("click", function () { setFullscreen(!isFullscreen); });
    var onKeyEsc = function (e) { if (e.key === "Escape" && isFullscreen) setFullscreen(false); };
    window.addEventListener("keydown", onKeyEsc);

    radarCanvas.addEventListener("pointerdown", function (e) {
      dragging = true; lastX = e.clientX; lastY = e.clientY;
      try { radarCanvas.setPointerCapture(e.pointerId); } catch (_) {}
    });
    radarCanvas.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      rotY += (e.clientX - lastX) * 0.01;
      tiltX = Math.max(0.22, Math.min(1.15, tiltX + (e.clientY - lastY) * 0.008));
      lastX = e.clientX; lastY = e.clientY;
    });
    radarCanvas.addEventListener("pointerup", function () { dragging = false; });
    radarCanvas.addEventListener("pointercancel", function () { dragging = false; });

    function fitCanvas(c) {
      var rect = c.getBoundingClientRect();
      var w = Math.max(280, Math.round(rect.width || 560));
      var h = Math.max(110, Math.round(rect.height || 320));
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
        c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      }
      var ctx = c.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { ctx: ctx, w: w, h: h };
    }

    function project3D(x, y, z, w, h) {
      var cy = Math.cos(rotY), sy = Math.sin(rotY);
      var cx = Math.cos(tiltX), sx = Math.sin(tiltX);
      var x1 = x * cy - z * sy, z1 = x * sy + z * cy;
      var y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
      var sc = 540 / Math.max(140, 540 - z2);
      return { sx: w * 0.5 + x1 * sc, sy: h * 0.56 - y2 * sc, z: z2, sc: sc };
    }

    function draw3DRadar(dt) {
      if (autoOrbit && !dragging) rotY += 0.26 * dt;
      var f = fitCanvas(radarCanvas);
      var ctx = f.ctx, w = f.w, h = f.h;
      ctx.clearRect(0, 0, w, h);

      var R = Math.min(w, h) * 0.34, N = 5, baseY = -28;
      var dims = targetScores.dims;
      for (var i = 0; i < N; i++) animVals[i] += (dims[i].value - animVals[i]) * Math.min(1, 8 * dt);
      animOverall += (targetScores.overall - animOverall) * Math.min(1, 8 * dt);
      animTemp += (params.temp - animTemp) * Math.min(1, 8 * dt);

      // Base rings
      [0.2, 0.4, 0.6, 0.8, 1.0].forEach(function (lv, li) {
        ctx.beginPath();
        for (var k = 0; k <= N; k++) {
          var ang = (Math.PI * 2 * (k % N)) / N - Math.PI / 2;
          var pt = project3D(Math.cos(ang) * R * lv, baseY, Math.sin(ang) * R * lv, w, h);
          if (k === 0) ctx.moveTo(pt.sx, pt.sy); else ctx.lineTo(pt.sx, pt.sy);
        }
        ctx.strokeStyle = li === 4 ? "rgba(52, 211, 153, 0.55)" : "rgba(148, 163, 184, 0.24)";
        ctx.lineWidth = li === 4 ? 1.8 : 1;
        ctx.stroke();
      });

      for (var s = 0; s < N; s++) {
        var angS = (Math.PI * 2 * s) / N - Math.PI / 2;
        var p0 = project3D(0, baseY, 0, w, h), p1 = project3D(Math.cos(angS) * R, baseY, Math.sin(angS) * R, w, h);
        ctx.strokeStyle = "rgba(148, 163, 184, 0.26)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(p0.sx, p0.sy); ctx.lineTo(p1.sx, p1.sy); ctx.stroke();
      }

      // Optional Reference Baseline 3D Wireframe Cap (Cyan Dashed)
      if (showBaseline) {
        ctx.save();
        ctx.strokeStyle = "rgba(103, 232, 249, 0.72)";
        ctx.setLineDash([5, 4]);
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (var bk = 0; bk <= N; bk++) {
          var bIdx = bk % N;
          var angB = (Math.PI * 2 * bIdx) / N - Math.PI / 2;
          var bFrac = dims[bIdx].base / 100;
          var bp = project3D(Math.cos(angB) * R * bFrac, baseY + bFrac * (R * 0.72), Math.sin(angB) * R * bFrac, w, h);
          if (bk === 0) ctx.moveTo(bp.sx, bp.sy); else ctx.lineTo(bp.sx, bp.sy);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Current 3D Prism Vertices
      var baseVerts = [], topVerts = [];
      for (var v = 0; v < N; v++) {
        var angV = (Math.PI * 2 * v) / N - Math.PI / 2;
        var frac = animVals[v] / 100;
        baseVerts.push(project3D(Math.cos(angV) * R * frac, baseY, Math.sin(angV) * R * frac, w, h));
        topVerts.push(project3D(Math.cos(angV) * R * frac, baseY + frac * (R * 0.72), Math.sin(angV) * R * frac, w, h));
      }

      var faces = [];
      for (var fi = 0; fi < N; fi++) {
        var fj = (fi + 1) % N;
        faces.push({ i: fi, j: fj, z: (baseVerts[fi].z + baseVerts[fj].z + topVerts[fi].z + topVerts[fj].z) * 0.25 });
      }
      faces.sort(function (a, b) { return a.z - b.z; });
      faces.forEach(function (fc) {
        ctx.beginPath();
        ctx.moveTo(baseVerts[fc.i].sx, baseVerts[fc.i].sy);
        ctx.lineTo(baseVerts[fc.j].sx, baseVerts[fc.j].sy);
        ctx.lineTo(topVerts[fc.j].sx, topVerts[fc.j].sy);
        ctx.lineTo(topVerts[fc.i].sx, topVerts[fc.i].sy);
        ctx.closePath();
        ctx.fillStyle = "rgba(16, 185, 129, 0.26)"; ctx.fill();
        ctx.strokeStyle = "rgba(52, 211, 153, 0.52)"; ctx.lineWidth = 1.2; ctx.stroke();
      });

      ctx.beginPath();
      for (var ti = 0; ti < N; ti++) { if (ti === 0) ctx.moveTo(topVerts[ti].sx, topVerts[ti].sy); else ctx.lineTo(topVerts[ti].sx, topVerts[ti].sy); }
      ctx.closePath();
      var capGrad = ctx.createLinearGradient(0, h * 0.15, 0, h * 0.75);
      capGrad.addColorStop(0, "rgba(52, 211, 153, 0.54)");
      capGrad.addColorStop(1, "rgba(251, 191, 36, 0.30)");
      ctx.fillStyle = capGrad; ctx.fill();
      ctx.strokeStyle = "#34d399"; ctx.lineWidth = 2.4; ctx.stroke();

      var labelFont = isFullscreen ? "bold 17px sans-serif" : "bold 12px sans-serif";
      for (var li2 = 0; li2 < N; li2++) {
        var d = dims[li2], bv = baseVerts[li2], tv = topVerts[li2];
        ctx.strokeStyle = d.color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(bv.sx, bv.sy); ctx.lineTo(tv.sx, tv.sy); ctx.stroke();
        ctx.fillStyle = d.color;
        ctx.beginPath(); ctx.arc(tv.sx, tv.sy, 5.2, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.6; ctx.stroke();

        var angL = (Math.PI * 2 * li2) / N - Math.PI / 2;
        var lp = project3D(Math.cos(angL) * (R * 1.24), baseY + 14, Math.sin(angL) * (R * 1.24), w, h);
        var delta = Math.round(animVals[li2]) - d.base;
        var deltaTxt = showBaseline ? (" (" + (delta >= 0 ? "+" : "") + delta + ")") : "";
        ctx.font = labelFont;
        ctx.textAlign = "center";
        ctx.fillStyle = "#ecfdf5";
        ctx.fillText(d.name + " " + Math.round(animVals[li2]) + deltaTxt, lp.sx, lp.sy);
      }
    }

    function drawGauges() {
      var f = fitCanvas(gaugeCanvas);
      var ctx = f.ctx, w = f.w, h = f.h;
      ctx.clearRect(0, 0, w, h);

      var gauges = [
        { label: "综合评分", val: animOverall, max: 100, unit: "分", color: animOverall >= 80 ? "#34d399" : (animOverall >= 65 ? "#fbbf24" : "#f43f5e") },
        { label: "提取温度", val: animTemp, max: 120, unit: "℃", color: animTemp > 85 ? "#f43f5e" : "#fbbf24" },
        { label: "提取效率", val: animVals[0], max: 100, unit: "%", color: "#38bdf8" },
        { label: "绿色安全", val: animVals[2], max: 100, unit: "分", color: animVals[2] >= 75 ? "#4ade80" : "#f43f5e" }
      ];

      var colW = w / 4, r = Math.min(colW * 0.36, h * 0.42), cy = h * 0.58;
      gauges.forEach(function (g, idx) {
        var cx = colW * idx + colW * 0.5;
        var startA = Math.PI * 0.80, endA = Math.PI * 2.20;
        var curA = startA + (endA - startA) * Math.max(0, Math.min(1, g.val / g.max));
        ctx.strokeStyle = "rgba(148, 163, 184, 0.22)"; ctx.lineWidth = isFullscreen ? 11 : 8; ctx.lineCap = "round";
        ctx.beginPath(); ctx.arc(cx, cy, r, startA, endA); ctx.stroke();
        ctx.strokeStyle = g.color;
        ctx.beginPath(); ctx.arc(cx, cy, r, startA, curA); ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.font = isFullscreen ? "bold 22px monospace" : "bold 15px monospace";
        ctx.textAlign = "center";
        ctx.fillText(Math.round(g.val) + g.unit, cx, cy + 5);
        ctx.fillStyle = "#a7f3d0";
        ctx.font = isFullscreen ? "bold 15px sans-serif" : "bold 11.5px sans-serif";
        ctx.fillText(g.label, cx, h - 6);
      });
    }

    var lastTs = performance.now();
    function loop(ts) {
      if (destroyed) return;
      rafId = requestAnimationFrame(loop);
      var dt = Math.min(0.05, Math.max(0.001, (ts - lastTs) / 1000));
      lastTs = ts;
      draw3DRadar(dt);
      drawGauges();
    }
    rafId = requestAnimationFrame(loop);

    return {
      destroy: function () {
        destroyed = true;
        if (rafId) cancelAnimationFrame(rafId);
        window.removeEventListener("keydown", onKeyEsc);
        ["cfgMass", "cfgRatio", "cfgTemp", "cfgTime", "cfgCycles", "cfgSolventType"].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) { el.removeEventListener("input", onWorkbenchChange); el.removeEventListener("change", onWorkbenchChange); }
        });
      },
      setParams: function (patch) { applyParamsPatch(patch, true); },
      setFullscreen: setFullscreen,
      getState: function () {
        return { params: Object.assign({}, params), scores: targetScores, isFullscreen: isFullscreen, showBaseline: showBaseline };
      }
    };
  }

  if (typeof window !== "undefined") {
    window.TCM_V22_COCKPIT = { mount: mountCockpit, computeProcessScores: computeProcessScores };
  }
})();
