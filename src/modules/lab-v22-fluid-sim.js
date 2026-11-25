/**
 * 本草智研 1.5 · 深度物理流体仿真引擎（梨形分液漏斗 · 真实溶剂规则 · 倾倒/湍动/分层/旋塞分液/滴定终点）
 * 规则来源：实时调用仓库 lab-data-v3.js 的 window.TCM_V3_DATA.SOLVENT_POLARITY_TABLE
 * 依据真实相对密度 ρ、极性 P' 与互溶标记求解浮力 Δρ = ρ_有机 - ρ_水，支持下口旋塞分液与目标成分分配示踪。
 */
(function () {
  "use strict";

  var FALLBACK_SOLVENTS = [
    { name: "石油醚(30-60℃)", p: 0.1, bp: "30~60℃", density: "0.65 (上层)", green: "易燃低毒", color: "#fef3c7" },
    { name: "正己烷", p: 0.1, bp: "69℃", density: "0.66 (上层)", green: "易燃神经毒", color: "#fef3c7" },
    { name: "甲苯", p: 2.4, bp: "111℃", density: "0.87 (上层)", green: "中等毒性", color: "#fde68a" },
    { name: "二氯甲烷", p: 3.1, bp: "40℃", density: "1.33 (下层)", green: "含卤需通风", color: "#fed7aa" },
    { name: "三氯甲烷(氯仿)", p: 4.1, bp: "61℃", density: "1.49 (下层)", green: "含卤高危", color: "#fecaca" },
    { name: "乙酸乙酯", p: 4.4, bp: "77℃", density: "0.90 (上层)", green: "绿色推荐", color: "#d1fae5" },
    { name: "丙酮", p: 5.1, bp: "56℃", density: "0.79 (互溶)", green: "绿色易燃", color: "#a7f3d0" },
    { name: "乙醇", p: 5.2, bp: "78℃", density: "0.79 (互溶)", green: "绿色首选", color: "#6ee7b7" },
    { name: "甲醇", p: 5.1, bp: "65℃", density: "0.79 (互溶)", green: "易燃有毒", color: "#bae6fd" },
    { name: "纯化水", p: 10.2, bp: "100℃", density: "1.00 (基准)", green: "零毒环保", color: "#7dd3fc" }
  ];

  function getSolventTable() {
    var live = typeof window !== "undefined" && window.TCM_V3_DATA && Array.isArray(window.TCM_V3_DATA.SOLVENT_POLARITY_TABLE)
      ? window.TCM_V3_DATA.SOLVENT_POLARITY_TABLE
      : null;
    var table = live && live.length ? live : FALLBACK_SOLVENTS;
    return {
      source: live && live.length ? "TCM_V3_DATA.SOLVENT_POLARITY_TABLE (实时调用)" : "SOLVENT_POLARITY_TABLE (独立演示副本)",
      items: table.filter(function (s) { return !/纯化水/.test(s.name); }).map(parseSolventRule)
    };
  }

  function parseSolventRule(raw) {
    var dStr = String(raw.density || "0.90 (上层)");
    var m = dStr.match(/([0-9]+\.[0-9]+|[0-9]+)/);
    var rho = m ? parseFloat(m[1]) : 0.9;
    var miscible = /互溶/.test(dStr);
    var layer = miscible ? "miscible" : (rho > 1.0 ? "bottom" : "top");
    var rgb = layer === "bottom"
      ? [234, 88, 12]
      : (miscible ? [20, 184, 166] : [245, 158, 11]);
    return {
      name: raw.name,
      p: raw.p,
      bp: raw.bp,
      densityRaw: dStr,
      rho: rho,
      miscible: miscible,
      layer: layer,
      green: raw.green || "",
      rgb: rgb
    };
  }

  // Separating funnel horizontal half-width profile for a given y in [78..252]
  function funnelHalfW(y) {
    if (y < 92) return 14; // neck
    if (y < 140) {
      var t = (y - 92) / 48;
      return 14 + Math.sin(t * Math.PI * 0.5) * 64; // bulb widening up to 78px half-width
    }
    if (y < 248) {
      var u = (y - 140) / 108;
      return 78 * (1 - u * 0.86); // smooth pear taper down to ~11px stem
    }
    return 9;
  }

  function traceFunnelPath(ctx, cx) {
    ctx.beginPath();
    ctx.moveTo(cx - 14, 72);
    ctx.lineTo(cx - 14, 92);
    ctx.bezierCurveTo(cx - 82, 108, cx - 82, 152, cx - 64, 182);
    ctx.lineTo(cx - 10, 248);
    ctx.lineTo(cx - 9, 286);
    ctx.lineTo(cx + 9, 286);
    ctx.lineTo(cx + 10, 248);
    ctx.lineTo(cx + 64, 182);
    ctx.bezierCurveTo(cx + 82, 152, cx + 82, 108, cx + 14, 92);
    ctx.lineTo(cx + 14, 72);
    ctx.closePath();
  }

  function mountFluidSim(container) {
    var destroyed = false;
    var rafId = null;
    var solventData = getSolventTable();
    var solvents = solventData.items;
    var selectedIdx = Math.max(0, solvents.findIndex(function (s) { return /乙酸乙酯/.test(s.name); }));

    var CX = 215;
    var sim = {
      mode: "extract",      // extract | titration
      behavior: "stratify", // pour | turbulence | stratify | drain
      turbulence: 0.08,
      naclAdded: false,
      showSolute: true,
      pourRemaining: 0,
      pouredCount: 0,
      valveOpen: false,
      drainedPhase: null,
      drainedLevel: 0,      // 0..1 fill in receiving conical flask
      drainWarn: "",
      paused: false,
      titrVol: 0,
      titrDrops: [],
      titrPlumes: [],
      particles: [],
      solutes: [],          // lipophilic solute tracers (e.g. 丹参酮IIA)
      shakePhase: 0,
      wavePhase: 0,
      fps: 60
    };

    function getCurSolvent() { return solvents[selectedIdx] || solvents[0]; }
    function getWaterRho() { return sim.naclAdded ? 1.19 : 1.00; }

    function initParticles(withOrganic) {
      sim.particles = [];
      sim.solutes = [];
      sim.pouredCount = 0;
      sim.pourRemaining = 0;
      sim.valveOpen = false;
      sim.drainedPhase = null;
      sim.drainedLevel = 0;
      sim.drainWarn = "";
      var org = getCurSolvent();

      // 115 Water particles inside pear funnel [120..242]
      for (var i = 0; i < 115; i++) {
        var wy = 165 + Math.random() * 76;
        var hw = Math.max(8, funnelHalfW(wy) - 8);
        sim.particles.push({
          phase: "water",
          x: CX + (Math.random() * 2 - 1) * hw,
          y: wy,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          r: 5.0 + Math.random() * 1.4
        });
      }

      if (withOrganic) {
        for (var j = 0; j < 115; j++) {
          var oy = org.miscible
            ? 122 + Math.random() * 116
            : (org.layer === "top" ? 116 + Math.random() * 58 : 178 + Math.random() * 62);
          var ohw = Math.max(8, funnelHalfW(oy) - 8);
          sim.particles.push({
            phase: "organic",
            x: CX + (Math.random() * 2 - 1) * ohw,
            y: oy,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            r: 5.0 + Math.random() * 1.4
          });
        }
        if (org.layer === "bottom") {
          sim.particles.forEach(function (p) {
            if (p.phase === "water") {
              p.y = 116 + Math.random() * 58;
              var hw2 = Math.max(8, funnelHalfW(p.y) - 8);
              p.x = CX + (Math.random() * 2 - 1) * hw2;
            }
          });
        }
        sim.pouredCount = 115;
      }

      // 24 Lipophilic active-compound tracer molecules (丹参酮 IIA, follows organic phase!)
      for (var s = 0; s < 24; s++) {
        var sy = 135 + Math.random() * 90;
        var shw = Math.max(6, funnelHalfW(sy) - 10);
        sim.solutes.push({
          x: CX + (Math.random() * 2 - 1) * shw,
          y: sy,
          vx: 0,
          vy: 0
        });
      }
    }

    function startPour() {
      sim.mode = "extract";
      sim.behavior = "pour";
      sim.turbulence = 0.25;
      sim.naclAdded = false;
      initParticles(false);
      sim.pourRemaining = 115;
      updateUi();
    }

    function triggerTurbulence(val) {
      sim.mode = "extract";
      sim.behavior = "turbulence";
      sim.valveOpen = false;
      sim.drainWarn = "";
      sim.turbulence = typeof val === "number" ? val : 0.94;
      if (sim.pouredCount < 20 && sim.pourRemaining === 0) initParticles(true);
      sim.particles.forEach(function (p) {
        var dx = p.x - CX, dy = p.y - 175;
        p.vx += (-dy * 2.5 + (Math.random() - 0.5) * 230) * sim.turbulence;
        p.vy += (dx * 2.0 + (Math.random() - 0.5) * 240) * sim.turbulence;
      });
      updateUi();
    }

    function triggerStratify(addSalt) {
      sim.mode = "extract";
      sim.behavior = "stratify";
      sim.drainWarn = "";
      if (addSalt) sim.naclAdded = true;
      sim.turbulence = 0.04;
      if (sim.pouredCount < 20 && sim.pourRemaining === 0) initParticles(true);
      updateUi();
    }

    function triggerDrainLowerPhase() {
      sim.mode = "extract";
      var org = getCurSolvent();
      var met = computeMetrics();
      if (org.miscible) {
        sim.drainWarn = "⚠️ 互溶体系呈均一单相，无分液界面，无法通过分液漏斗分离！";
        updateUi();
        return { ok: false, reason: "miscible" };
      }
      if (sim.turbulence > 0.35 || met.sepIndex < 50) {
        sim.drainWarn = "⚠️ 两相仍处于湍动/乳化态（分离度 " + met.sepIndex + "%），请先静置或加饱和 NaCl 破乳后再旋开活塞！";
        updateUi();
        return { ok: false, reason: "emulsified" };
      }
      sim.drainWarn = "";
      sim.behavior = "drain";
      sim.valveOpen = true;
      sim.drainedPhase = org.rho > getWaterRho() ? "organic" : "water";
      updateUi();
      return { ok: true, draining: sim.drainedPhase };
    }

    function computeMetrics() {
      var wSum = 0, wN = 0, oSum = 0, oN = 0;
      for (var i = 0; i < sim.particles.length; i++) {
        var p = sim.particles[i];
        if (p.phase === "water") { wSum += p.y; wN++; }
        else { oSum += p.y; oN++; }
      }
      var wMeanY = wN ? wSum / wN : 0;
      var oMeanY = oN ? oSum / oN : 0;
      var org = getCurSolvent();
      var sepIndex = (oN > 5 && wN > 5) ? Math.min(100, Math.round(Math.abs(wMeanY - oMeanY) / 0.58)) : (sim.drainedLevel > 0.5 ? 100 : 0);
      var actualTop = (oN === 0 && wN === 0) ? "漏斗已排空"
        : (wN === 0 ? "留存上层：" + org.name
        : (oN === 0 ? "留存上层：水相"
        : (org.miscible && sepIndex < 22 ? "均一互溶单相" : (oMeanY < wMeanY ? "上层：" + org.name : "上层：水相"))));
      var actualBot = sim.drainedLevel > 0.2
        ? "接液瓶已收：" + (sim.drainedPhase === "organic" ? org.name + "（下层有机相）" : "水相（下层）")
        : (oN === 0 ? "仅水相" : (org.miscible && sepIndex < 22 ? "无相界面" : (oMeanY < wMeanY ? "下层：水相" : "下层：" + org.name)));
      return { wMeanY: Number(wMeanY.toFixed(1)), oMeanY: Number(oMeanY.toFixed(1)), wCount: wN, oCount: oN, sepIndex: sepIndex, actualTop: actualTop, actualBot: actualBot };
    }

    function buildShell() {
      var solventOptions = solvents.map(function (s, idx) {
        var tag = s.miscible ? "互溶" : (s.layer === "bottom" ? "下层 ρ=" + s.rho : "上层 ρ=" + s.rho);
        return '<option value="' + idx + '"' + (idx === selectedIdx ? " selected" : "") + '>' + s.name + " · " + tag + " · P'=" + s.p + "</option>";
      }).join("");

      container.innerHTML =
        '<div class="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">' +
          '<div class="lg:col-span-7 flex flex-col gap-2.5">' +
            '<div class="relative rounded-2xl bg-gradient-to-b from-[#071f1c] to-[#0b2a25] border border-emerald-400/30 overflow-hidden flex justify-center">' +
              '<canvas id="v22FluidCanvas" width="460" height="390" class="w-full max-w-[460px] h-[350px] sm:h-[390px] block"></canvas>' +
              '<div class="pointer-events-none absolute top-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-bold">' +
                '<span id="v22FluidBehaviorTag" class="px-2.5 py-1 rounded-lg bg-slate-950/75 border border-emerald-400/30 text-emerald-200">梨形分液漏斗 · 物理求解中</span>' +
                '<span id="v22FluidFps" class="px-2 py-1 rounded-lg bg-slate-950/75 border border-white/15 text-emerald-300 font-mono">60 FPS</span>' +
              '</div>' +
              '<div id="v22FluidPhaseOverlay" class="pointer-events-none absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-2 text-[11px] text-slate-200 font-bold bg-slate-950/75 border border-white/15 rounded-xl px-3 py-1.5"></div>' +
            '</div>' +
            '<div class="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#f6f8f7] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px]">' +
              '<span class="font-bold text-slate-600 dark:text-slate-300">规则源：<code class="text-[#047857] dark:text-emerald-300">' + solventData.source + '</code></span>' +
              '<div class="flex items-center gap-1.5">' +
                '<button type="button" id="v22SoluteToggleBtn" class="px-2 py-1 rounded-lg border font-bold ' + (sim.showSolute ? 'bg-rose-50 border-rose-300 text-rose-800' : 'bg-white border-slate-200 text-slate-600') + '">🎯 溶质示踪</button>' +
                '<button type="button" id="v22FluidPauseBtn" class="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200">' + (sim.paused ? "▶ 继续" : "⏸ 暂停") + '</button>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div class="lg:col-span-5 rounded-2xl bg-white dark:bg-slate-800/85 border border-slate-200 dark:border-slate-700 p-4 flex flex-col justify-between gap-3 text-xs">' +
            '<div class="space-y-2.5">' +
              '<div class="flex flex-wrap gap-1.5">' +
                '<button type="button" data-v22-fmode="extract" class="px-3 py-1.5 rounded-xl font-extrabold border ' + (sim.mode === "extract" ? "bg-[#059669] text-white border-[#059669]" : "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700") + '">⚗️ 分液漏斗流体（倾倒/分层/湍动/分液）</button>' +
                '<button type="button" data-v22-fmode="titration" class="px-3 py-1.5 rounded-xl font-extrabold border ' + (sim.mode === "titration" ? "bg-[#059669] text-white border-[#059669]" : "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700") + '">💧 滴定终点突变</button>' +
              '</div>' +
              (sim.mode === "extract"
                ? '<div class="space-y-2.5">' +
                    '<div>' +
                      '<label class="block font-extrabold text-slate-800 dark:text-slate-200 mb-1">选择有机溶剂（读取现有极性密度表）</label>' +
                      '<select id="v22SolventSelect" class="w-full px-3 py-2 rounded-xl bg-[#f6f8f7] dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-bold text-xs">' + solventOptions + '</select>' +
                    '</div>' +
                    '<div id="v22SolventRuleCard" class="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1 text-[11px]"></div>' +
                    '<div class="grid grid-cols-2 gap-1.5">' +
                      '<button type="button" id="v22BtnPour" class="py-2 px-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold transition">🫗 1. 倾倒溶剂</button>' +
                      '<button type="button" id="v22BtnTurbulence" class="py-2 px-2 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-extrabold transition">🌀 2. 振摇湍动</button>' +
                      '<button type="button" id="v22BtnStratify" class="py-2 px-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-extrabold transition">⚖️ 3. 静置分层</button>' +
                      '<button type="button" id="v22BtnDrain" class="py-2 px-2 rounded-xl bg-[#0f172a] hover:bg-slate-800 text-emerald-300 border border-emerald-400/40 font-extrabold transition">🔧 4. 旋塞放下层</button>' +
                    '</div>' +
                    '<div>' +
                      '<div class="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1"><span>湍动振摇强度</span><span id="v22TurbVal">' + Math.round(sim.turbulence * 100) + '%</span></div>' +
                      '<input id="v22TurbSlider" type="range" min="0" max="1" step="0.05" value="' + sim.turbulence + '" class="w-full accent-emerald-600" />' +
                    '</div>' +
                    '<button type="button" id="v22BtnSaltDemulsify" class="w-full py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-extrabold transition">🧂 加入饱和 NaCl 盐析破乳（水相 ρ: 1.00 → 1.19）</button>' +
                    '<div id="v22DrainWarnBox" class="hidden p-2 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 font-bold text-[11px]"></div>' +
                  '</div>'
                : '<div class="space-y-3">' +
                    '<p class="text-slate-600 dark:text-slate-300 leading-relaxed">模拟酸碱滴定（酚酞指示剂）：滴加 0.1 mol/L NaOH 标准液，观察液滴入液瞬间局部紫红羽流扩散，及临近 10.0 mL 等当点时的全管颜色突变。</p>' +
                    '<div class="grid grid-cols-2 gap-2">' +
                      '<button type="button" id="v22BtnTitrate" class="py-2.5 rounded-xl bg-[#064e3b] hover:bg-[#062922] text-white font-extrabold">💧 滴加 (+2.0 mL)</button>' +
                      '<button type="button" id="v22BtnTitrateFine" class="py-2.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-extrabold">🎯 微滴 (+0.5 mL)</button>' +
                    '</div>' +
                    '<button type="button" id="v22BtnResetTitrate" class="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold">↺ 清洗锥形瓶重测</button>' +
                    '<div class="p-3 rounded-xl bg-[#f6f8f7] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">' +
                      '<div class="font-extrabold text-slate-900 dark:text-white">已滴加体积：<span id="v22TitrVal">' + sim.titrVol.toFixed(1) + ' mL</span> / 终点 10.0 mL</div>' +
                      '<div class="text-[11px] text-slate-600 dark:text-slate-400" id="v22TitrPh">当前 pH ≈ 4.6（无色酸性区）</div>' +
                    '</div>' +
                  '</div>') +
            '</div>' +
            '<div class="p-2.5 rounded-xl bg-[#f6f8f7] dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">' +
              '<strong>操作口诀：</strong>下层由<strong>下口旋塞放出</strong>，上层由<strong>上口倒出</strong>。开启「🎯 溶质示踪」可观察脂溶性丹参酮（红点）按相似相溶自动富集到有机相。' +
            '</div>' +
          '</div>' +
        '</div>';

      bindEvents();
      updateUi();
    }

    function updateUi() {
      var org = getCurSolvent();
      var wRho = getWaterRho();
      var deltaRho = (org.rho - wRho).toFixed(2);
      var ruleCard = container.querySelector("#v22SolventRuleCard");
      if (ruleCard) {
        var ruleDesc = org.miscible
          ? "⚠️ 与水<strong>完全互溶</strong>（γ=0），自由混溶为单相，禁止分液。"
          : (org.rho < wRho
            ? "✅ Δρ = " + deltaRho + " < 0 → <strong>" + org.name + " 上浮至上层</strong>，水相在下层（旋塞先放水相，上口倒出有机相）。"
            : "⚠️ Δρ = +" + deltaRho + " > 0 → <strong>" + org.name + " 下沉至下层</strong>，水相在上层（旋塞直接放出有机相）。");
        ruleCard.innerHTML =
          '<div class="flex flex-wrap justify-between font-extrabold text-emerald-950 dark:text-emerald-200">' +
            '<span>' + org.name + '（' + org.densityRaw + '）</span>' +
            '<span>P\'=' + org.p + ' · bp ' + org.bp + '</span>' +
          '</div>' +
          '<div class="text-slate-700 dark:text-slate-300 leading-snug">' + ruleDesc + '</div>' +
          '<div class="text-[10.5px] text-slate-500 dark:text-slate-400">安全属性：' + org.green + (sim.naclAdded ? " · 🧂 饱和 NaCl（水相 ρ=1.19）" : "") + '</div>';
      }
      var warnBox = container.querySelector("#v22DrainWarnBox");
      if (warnBox) {
        warnBox.textContent = sim.drainWarn;
        warnBox.classList.toggle("hidden", !sim.drainWarn);
      }
      var turbVal = container.querySelector("#v22TurbVal");
      if (turbVal) turbVal.textContent = Math.round(sim.turbulence * 100) + "%";
      var turbSlider = container.querySelector("#v22TurbSlider");
      if (turbSlider) turbSlider.value = String(sim.turbulence);
      var pauseBtn = container.querySelector("#v22FluidPauseBtn");
      if (pauseBtn) pauseBtn.textContent = sim.paused ? "▶ 继续" : "⏸ 暂停";
    }

    function bindEvents() {
      container.querySelectorAll("[data-v22-fmode]").forEach(function (b) {
        b.addEventListener("click", function () { sim.mode = b.getAttribute("data-v22-fmode"); buildShell(); });
      });
      var sel = container.querySelector("#v22SolventSelect");
      if (sel) {
        sel.addEventListener("change", function () {
          selectedIdx = Number(sel.value) || 0;
          sim.naclAdded = false;
          sim.behavior = "stratify";
          sim.turbulence = 0.10;
          initParticles(true);
          sim.particles.forEach(function (p) {
            p.y = 122 + Math.random() * 116;
            var hw = Math.max(8, funnelHalfW(p.y) - 8);
            p.x = CX + (Math.random() * 2 - 1) * hw;
          });
          updateUi();
        });
      }
      var btnPour = container.querySelector("#v22BtnPour");
      if (btnPour) btnPour.addEventListener("click", startPour);
      var btnTurb = container.querySelector("#v22BtnTurbulence");
      if (btnTurb) btnTurb.addEventListener("click", function () { triggerTurbulence(0.94); });
      var btnStrat = container.querySelector("#v22BtnStratify");
      if (btnStrat) btnStrat.addEventListener("click", function () { triggerStratify(false); });
      var btnDrain = container.querySelector("#v22BtnDrain");
      if (btnDrain) btnDrain.addEventListener("click", triggerDrainLowerPhase);
      var btnSalt = container.querySelector("#v22BtnSaltDemulsify");
      if (btnSalt) btnSalt.addEventListener("click", function () { triggerStratify(true); });
      var turbSlider = container.querySelector("#v22TurbSlider");
      if (turbSlider) {
        turbSlider.addEventListener("input", function () {
          sim.turbulence = Number(turbSlider.value);
          sim.behavior = sim.turbulence >= 0.35 ? "turbulence" : "stratify";
          if (sim.turbulence >= 0.35) sim.valveOpen = false;
          updateUi();
        });
      }
      var solBtn = container.querySelector("#v22SoluteToggleBtn");
      if (solBtn) {
        solBtn.addEventListener("click", function () { sim.showSolute = !sim.showSolute; buildShell(); });
      }
      var pauseBtn = container.querySelector("#v22FluidPauseBtn");
      if (pauseBtn) {
        pauseBtn.addEventListener("click", function () { sim.paused = !sim.paused; updateUi(); });
      }

      function addTitration(ml) {
        sim.titrVol = Math.min(16, Number((sim.titrVol + ml).toFixed(1)));
        sim.titrDrops.push({ x: 230, y: 54, vy: 45 });
        var lbl = container.querySelector("#v22TitrVal");
        var phEl = container.querySelector("#v22TitrPh");
        var estPh = sim.titrVol < 9.5 ? (4.6 + sim.titrVol * 0.25) : (sim.titrVol < 10.0 ? 7.4 : Math.min(11.8, 9.6 + (sim.titrVol - 10) * 0.4));
        if (lbl) lbl.textContent = sim.titrVol.toFixed(1) + " mL" + (sim.titrVol >= 10 ? " ✨ 终点突变" : "");
        if (phEl) phEl.textContent = "当前 pH ≈ " + estPh.toFixed(1) + (sim.titrVol >= 10 ? "（酚酞微红终点达成！）" : "（未达终点，局部瞬红后褪色）");
      }
      var btnTit = container.querySelector("#v22BtnTitrate");
      if (btnTit) btnTit.addEventListener("click", function () { addTitration(2.0); });
      var btnTitFine = container.querySelector("#v22BtnTitrateFine");
      if (btnTitFine) btnTitFine.addEventListener("click", function () { addTitration(0.5); });
      var btnTitRst = container.querySelector("#v22BtnResetTitrate");
      if (btnTitRst) btnTitRst.addEventListener("click", function () { sim.titrVol = 0; sim.titrDrops = []; sim.titrPlumes = []; buildShell(); });
    }

    initParticles(true);
    buildShell();

    var lastTs = performance.now();
    var fpsFrames = 0;
    var fpsTs = lastTs;

    function stepPhysics(dt) {
      var org = getCurSolvent();
      var wRho = getWaterRho();
      var deltaRho = org.rho - wRho;

      // Pouring into top neck of separating funnel
      if (sim.pourRemaining > 0) {
        var spN = Math.min(sim.pourRemaining, Math.max(1, Math.round(52 * dt)));
        for (var sp = 0; sp < spN; sp++) {
          sim.particles.push({
            phase: "organic",
            x: CX + (Math.random() - 0.5) * 10,
            y: 84 + Math.random() * 10,
            vx: (Math.random() - 0.5) * 28,
            vy: 155 + Math.random() * 45,
            r: 5.0 + Math.random() * 1.4
          });
          sim.pourRemaining--;
          sim.pouredCount++;
        }
        if (sim.pourRemaining === 0 && sim.behavior === "pour") sim.behavior = "stratify";
      }

      // Draining ONLY the lower phase through bottom stopcock into receiving conical flask!
      if (sim.valveOpen && sim.drainedPhase) {
        var removed = 0;
        for (var di = sim.particles.length - 1; di >= 0 && removed < 4; di--) {
          if (sim.particles[di].phase === sim.drainedPhase && sim.particles[di].y > 165) {
            sim.particles.splice(di, 1);
            removed++;
            sim.drainedLevel = Math.min(1, sim.drainedLevel + 0.0088);
          }
        }
        var remainingLower = sim.particles.some(function (p) { return p.phase === sim.drainedPhase; });
        if (!remainingLower) {
          sim.valveOpen = false;
          sim.behavior = "stratify";
        }
      }

      sim.shakePhase += dt * (4 + sim.turbulence * 15);
      sim.wavePhase += dt * (2.6 + sim.turbulence * 7);

      var parts = sim.particles;
      var n = parts.length;
      var saltBoost = sim.naclAdded ? 1.55 : 1.0;

      // Soft pairwise SPH repulsion
      for (var i = 0; i < n; i++) {
        var a = parts[i];
        for (var j = i + 1; j < n; j++) {
          var b = parts[j];
          var dx = b.x - a.x, dy = b.y - a.y;
          var d2 = dx * dx + dy * dy;
          if (d2 > 0.01 && d2 < 121) {
            var d = Math.sqrt(d2);
            var f = (11 - d) * 34 * dt;
            var nx = dx / d, ny = dy / d;
            a.vx -= nx * f; a.vy -= ny * f;
            b.vx += nx * f; b.vy += ny * f;
          }
        }
      }

      var topY = 112;
      var botY = 244;
      var midY = 175;

      for (var k = 0; k < n; k++) {
        var p = parts[k];
        var ay = 0;
        if (org.miscible) {
          ay = (midY - p.y) * 0.4 + (Math.random() - 0.5) * 90;
          p.vx += (Math.random() - 0.5) * 90 * dt;
        } else {
          var mag = Math.max(0.14, Math.abs(deltaRho)) * 360 * saltBoost * (1 - sim.turbulence * 0.65);
          if (p.phase === "organic") ay = deltaRho < 0 ? -mag : mag;
          else ay = deltaRho < 0 ? mag : -mag;
        }
        if (sim.valveOpen && p.phase === sim.drainedPhase) ay += 240;

        if (sim.turbulence > 0.06) {
          var rx = p.x - CX, ry = p.y - midY;
          p.vx += (-ry * 2.0 * sim.turbulence + Math.sin(sim.shakePhase + k * 0.3) * 185 * sim.turbulence) * dt;
          p.vy += (rx * 1.6 * sim.turbulence + Math.cos(sim.shakePhase * 1.3 + k * 0.2) * 195 * sim.turbulence) * dt;
        }

        p.vy += ay * dt;
        var damp = Math.pow(0.18 + sim.turbulence * 0.52, dt);
        p.vx *= damp; p.vy *= damp;
        p.x += p.vx * dt; p.y += p.vy * dt;

        // Pear-shaped separating funnel wall boundary clamping
        if (p.y < topY) { p.y = topY; p.vy = Math.abs(p.vy) * 0.4; }
        if (p.y > botY) { p.y = botY; p.vy = -Math.abs(p.vy) * 0.4; }
        var hw = Math.max(6, funnelHalfW(p.y) - 6);
        if (p.x < CX - hw) { p.x = CX - hw; p.vx = Math.abs(p.vx) * 0.5; }
        if (p.x > CX + hw) { p.x = CX + hw; p.vx = -Math.abs(p.vx) * 0.5; }
      }

      // Solute tracers (丹参酮 IIA lipophilic -> tracks organic centroid!)
      var met = computeMetrics();
      var targetSoluteY = org.miscible ? midY : (met.oCount > 0 ? met.oMeanY : midY);
      for (var s = 0; s < sim.solutes.length; s++) {
        var sl = sim.solutes[s];
        sl.vy += ((targetSoluteY - sl.y) * 2.6 + (Math.random() - 0.5) * (60 + sim.turbulence * 180)) * dt;
        sl.vx += ((CX - sl.x) * 0.5 + (Math.random() - 0.5) * (70 + sim.turbulence * 180)) * dt;
        sl.vx *= Math.pow(0.25, dt); sl.vy *= Math.pow(0.25, dt);
        sl.x += sl.vx * dt; sl.y += sl.vy * dt;
        sl.y = Math.max(topY + 4, Math.min(botY - 6, sl.y));
        var shw = Math.max(5, funnelHalfW(sl.y) - 9);
        sl.x = Math.max(CX - shw, Math.min(CX + shw, sl.x));
      }

      if (sim.behavior === "stratify" && sim.turbulence > 0.04) {
        sim.turbulence = Math.max(0.04, sim.turbulence - 0.14 * dt);
      }
    }

    function drawFrame(ts) {
      if (destroyed) return;
      rafId = requestAnimationFrame(drawFrame);

      var dt = Math.min(0.04, Math.max(0.001, (ts - lastTs) / 1000));
      lastTs = ts;

      var canvas = container.querySelector("#v22FluidCanvas");
      if (!canvas) return;
      var ctx = canvas.getContext("2d");
      var org = getCurSolvent();

      if (!sim.paused) {
        if (sim.mode === "extract") stepPhysics(dt);
        else stepTitration(dt);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (sim.mode === "extract") {
        var shakeX = sim.turbulence > 0.35 && !sim.paused ? Math.sin(sim.shakePhase * 2.4) * (sim.turbulence * 7) : 0;
        var met = computeMetrics();

        // Iron retort stand & ring clamp (subtle background apparatus)
        ctx.strokeStyle = "rgba(148, 163, 184, 0.45)";
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(64, 52); ctx.lineTo(64, 355); ctx.stroke();
        ctx.fillStyle = "rgba(148, 163, 184, 0.5)";
        ctx.fillRect(42, 353, 86, 6);
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(64, 178); ctx.lineTo(CX - 66, 178); ctx.stroke();

        ctx.save();
        ctx.translate(shakeX, 0);

        // Pouring beaker + parabolic jet when pouring
        if (sim.pourRemaining > 0) {
          ctx.save();
          ctx.translate(CX + 96, 46);
          ctx.rotate(-0.72);
          ctx.strokeStyle = "rgba(226,232,240,0.88)";
          ctx.lineWidth = 2.2;
          ctx.strokeRect(-22, -26, 44, 52);
          ctx.fillStyle = "rgba(" + org.rgb.join(",") + ",0.82)";
          ctx.fillRect(-20, -2, 40, 26);
          ctx.restore();

          ctx.strokeStyle = "rgba(" + org.rgb.join(",") + ",0.92)";
          ctx.lineWidth = 5.5;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(CX + 68, 52);
          ctx.quadraticCurveTo(CX + 12, 54, CX, 96);
          ctx.stroke();
        } else {
          // Glass stopper on top neck when not pouring
          ctx.fillStyle = "rgba(226, 232, 240, 0.65)";
          ctx.beginPath();
          ctx.roundRect(CX - 11, 56, 22, 16, 4);
          ctx.fill();
        }

        // Clip inside Pear-Shaped Separating Funnel
        ctx.save();
        traceFunnelPath(ctx, CX);
        ctx.clip();

        // Continuous translucent liquid body layers (eliminates "sparse dots" look!)
        var ifaceY = (met.wCount > 5 && met.oCount > 5) ? (met.wMeanY + met.oMeanY) * 0.5 : 176;
        var waveAmp = 2 + sim.turbulence * 12;
        if (org.miscible && met.oCount > 0) {
          var mixGrad = ctx.createLinearGradient(0, 110, 0, 250);
          mixGrad.addColorStop(0, "rgba(20, 184, 166, 0.52)");
          mixGrad.addColorStop(1, "rgba(14, 165, 233, 0.58)");
          ctx.fillStyle = mixGrad;
          ctx.fillRect(CX - 86, 112, 172, 145);
        } else {
          // Draw lower continuous body if present
          var lowerIsOrg = org.rho > getWaterRho();
          var lowerRgb = lowerIsOrg ? org.rgb : [14, 165, 233];
          var upperRgb = lowerIsOrg ? [14, 165, 233] : org.rgb;
          var hasLower = lowerIsOrg ? met.oCount > 4 : met.wCount > 4;
          var hasUpper = lowerIsOrg ? met.wCount > 4 : met.oCount > 4;
          var opacityBase = Math.max(0.22, 0.56 - sim.turbulence * 0.30);

          if (hasUpper) {
            ctx.fillStyle = "rgba(" + upperRgb.join(",") + "," + opacityBase + ")";
            ctx.beginPath();
            ctx.moveTo(CX - 86, 112);
            for (var wx = CX - 86; wx <= CX + 86; wx += 12) {
              var wyTop = 114 + Math.sin(sim.wavePhase + wx * 0.06) * (waveAmp * 0.45);
              ctx.lineTo(wx, wyTop);
            }
            ctx.lineTo(CX + 86, hasLower ? ifaceY : 252);
            ctx.lineTo(CX - 86, hasLower ? ifaceY : 252);
            ctx.closePath();
            ctx.fill();
          }
          if (hasLower) {
            ctx.fillStyle = "rgba(" + lowerRgb.join(",") + "," + opacityBase + ")";
            ctx.beginPath();
            ctx.moveTo(CX - 86, hasUpper ? ifaceY : 168);
            for (var wx2 = CX - 86; wx2 <= CX + 86; wx2 += 12) {
              var wyMid = (hasUpper ? ifaceY : 168) + Math.sin(sim.wavePhase * 1.2 + wx2 * 0.07) * waveAmp;
              ctx.lineTo(wx2, wyMid);
            }
            ctx.lineTo(CX + 86, 255);
            ctx.lineTo(CX - 86, 255);
            ctx.closePath();
            ctx.fill();
          }
        }

        // Render SPH fluid particles & emulsion droplets
        for (var i = 0; i < sim.particles.length; i++) {
          var p = sim.particles[i];
          var rgb = p.phase === "water" ? [56, 189, 248] : org.rgb;
          ctx.fillStyle = "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + (0.45 + sim.turbulence * 0.35) + ")";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 1.15, 0, Math.PI * 2);
          ctx.fill();
        }

        // Render lipophilic solute tracers (丹参酮 IIA crimson micro-dots)
        if (sim.showSolute) {
          ctx.fillStyle = "#f43f5e";
          for (var s = 0; s < sim.solutes.length; s++) {
            var sl = sim.solutes[s];
            ctx.beginPath();
            ctx.arc(sl.x, sl.y, 2.7, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Crisp dashed phase interface line when separated
        if (!org.miscible && met.sepIndex > 52 && met.wCount > 4 && met.oCount > 4) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.78)";
          ctx.setLineDash([5, 4]);
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(CX - 76, ifaceY);
          ctx.lineTo(CX + 76, ifaceY);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.restore();

        // Funnel glass outline + specular sheen
        traceFunnelPath(ctx, CX);
        ctx.strokeStyle = "rgba(226, 232, 240, 0.88)";
        ctx.lineWidth = 2.6;
        ctx.stroke();

        // PTFE Stopcock Valve at y=262 (horizontal = closed, vertical = open!)
        ctx.fillStyle = sim.valveOpen ? "#34d399" : "#e2e8f0";
        if (sim.valveOpen) {
          ctx.fillRect(CX - 5, 250, 10, 24);
        } else {
          ctx.fillRect(CX - 18, 257, 36, 10);
        }
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(sim.valveOpen ? CX - 5 : CX - 18, sim.valveOpen ? 250 : 257, sim.valveOpen ? 10 : 36, sim.valveOpen ? 24 : 10);

        // Draining stream from stem into receiving conical flask
        if (sim.valveOpen && sim.drainedPhase) {
          var dRgb = sim.drainedPhase === "organic" ? org.rgb : [14, 165, 233];
          ctx.strokeStyle = "rgba(" + dRgb.join(",") + ",0.92)";
          ctx.lineWidth = 4.5;
          ctx.beginPath(); ctx.moveTo(CX, 286); ctx.lineTo(CX, 344); ctx.stroke();
        }
        ctx.restore();

        // Receiving Conical Flask below stem (y = 296..356)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(CX - 14, 296); ctx.lineTo(CX + 14, 296);
        ctx.lineTo(CX + 38, 354); ctx.lineTo(CX - 38, 354); ctx.closePath();
        ctx.clip();
        if (sim.drainedLevel > 0.01) {
          var recRgb = sim.drainedPhase === "organic" ? org.rgb : [14, 165, 233];
          var fillH = sim.drainedLevel * 44;
          ctx.fillStyle = "rgba(" + recRgb.join(",") + ",0.78)";
          ctx.fillRect(CX - 40, 354 - fillH, 80, fillH);
        }
        ctx.restore();
        ctx.strokeStyle = "rgba(226, 232, 240, 0.82)";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(CX - 14, 296); ctx.lineTo(CX + 14, 296);
        ctx.lineTo(CX + 38, 354); ctx.lineTo(CX - 38, 354); ctx.closePath();
        ctx.stroke();

        // Side callout labels (Right of funnel)
        ctx.font = "bold 11px sans-serif";
        ctx.fillStyle = "#a7f3d0";
        ctx.fillText("上口玻璃塞", CX + 22, 68);
        ctx.fillStyle = sim.valveOpen ? "#34d399" : "#cbd5e1";
        ctx.fillText(sim.valveOpen ? "旋塞：开启分液" : "旋塞：关闭", CX + 24, 266);
        ctx.fillStyle = "#94a3b8";
        var recMl = Math.round(sim.drainedLevel * 100);
        ctx.fillText("接液瓶 (" + recMl + " mL)", CX + 44, 336);
        if (sim.turbulence > 0.72) {
          ctx.fillStyle = "rgba(127, 29, 29, 0.90)";
          ctx.beginPath(); ctx.roundRect(CX + 78, 134, 152, 24, 8); ctx.fill();
          ctx.fillStyle = "#fecaca";
          ctx.font = "bold 11px sans-serif";
          ctx.fillText("💨 振摇后注意开塞放气!", CX + 86, 150);
        }

        // Update HUD overlays
        var tagEl = container.querySelector("#v22FluidBehaviorTag");
        if (tagEl) {
          tagEl.textContent = sim.paused
            ? "⏸ 已暂停物理步进"
            : (sim.valveOpen
              ? "🔧 旋塞开启：下层液正流入接液瓶..."
              : (sim.pourRemaining > 0
                ? "🫗 倾倒中：有机相注入梨形分液漏斗..."
                : (sim.turbulence > 0.35
                  ? "🌀 振摇湍动乳化（强度 " + Math.round(sim.turbulence * 100) + "%）"
                  : (org.miscible ? "🔄 互溶单相无相界面" : "⚖️ 密度差分层（分离度 " + met.sepIndex + "%）"))));
        }
        var phaseEl = container.querySelector("#v22FluidPhaseOverlay");
        if (phaseEl) {
          phaseEl.innerHTML = '<span>' + met.actualTop + '</span><span class="text-emerald-300">' + met.actualBot + '</span>';
        }
      } else {
        drawTitration(ctx);
      }

      fpsFrames++;
      if (ts - fpsTs >= 500) {
        sim.fps = Math.round((fpsFrames * 1000) / (ts - fpsTs));
        var fpsEl = container.querySelector("#v22FluidFps");
        if (fpsEl) fpsEl.textContent = Math.min(60, sim.fps) + " FPS";
        fpsFrames = 0;
        fpsTs = ts;
      }
    }

    function stepTitration(dt) {
      for (var i = sim.titrDrops.length - 1; i >= 0; i--) {
        var d = sim.titrDrops[i];
        d.vy += 320 * dt; d.y += d.vy * dt;
        if (d.y >= 195) {
          sim.titrDrops.splice(i, 1);
          for (var p = 0; p < 18; p++) {
            sim.titrPlumes.push({ x: 230 + (Math.random() - 0.5) * 14, y: 198, vx: (Math.random() - 0.5) * 55, vy: 15 + Math.random() * 45, r: 6 + Math.random() * 7, life: 1.0 });
          }
        }
      }
      for (var j = sim.titrPlumes.length - 1; j >= 0; j--) {
        var pl = sim.titrPlumes[j];
        pl.x += pl.vx * dt; pl.y += pl.vy * dt; pl.r += 14 * dt; pl.life -= 0.75 * dt;
        if (pl.life <= 0) sim.titrPlumes.splice(j, 1);
      }
    }

    function drawTitration(ctx) {
      ctx.fillStyle = "#cbd5e1";
      ctx.fillRect(223, 24, 14, 24);
      ctx.beginPath(); ctx.moveTo(225, 48); ctx.lineTo(235, 48); ctx.lineTo(231, 62); ctx.lineTo(229, 62); ctx.fill();

      var reached = sim.titrVol >= 10;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(196, 120); ctx.lineTo(264, 120); ctx.lineTo(322, 325); ctx.lineTo(138, 325); ctx.closePath();
      ctx.clip();
      ctx.fillStyle = reached ? "rgba(236, 72, 153, 0.78)" : "rgba(226, 232, 240, 0.35)";
      ctx.fillRect(130, 195, 200, 135);
      sim.titrPlumes.forEach(function (pl) {
        ctx.fillStyle = "rgba(236, 72, 153, " + Math.max(0, pl.life * 0.75) + ")";
        ctx.beginPath(); ctx.arc(pl.x, pl.y, pl.r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.restore();

      ctx.strokeStyle = "rgba(226, 232, 240, 0.85)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(196, 120); ctx.lineTo(264, 120); ctx.lineTo(322, 325); ctx.lineTo(138, 325); ctx.closePath();
      ctx.stroke();

      sim.titrDrops.forEach(function (d) {
        ctx.fillStyle = "#f472b6";
        ctx.beginPath(); ctx.arc(d.x, d.y, 4.5, 0, Math.PI * 2); ctx.fill();
      });

      var tagEl = container.querySelector("#v22FluidBehaviorTag");
      if (tagEl) tagEl.textContent = reached ? "✨ 滴定终点颜色突变 (pH > 9.6)" : "💧 滴定进行中 (" + sim.titrVol.toFixed(1) + " mL)";
      var phaseEl = container.querySelector("#v22FluidPhaseOverlay");
      if (phaseEl) phaseEl.innerHTML = '<span>酚酞酸碱滴定</span><span class="text-pink-300">' + (reached ? "终点微红持续 >30s" : "未达终点") + '</span>';
    }

    rafId = requestAnimationFrame(drawFrame);

    return {
      destroy: function () { destroyed = true; if (rafId) cancelAnimationFrame(rafId); },
      selectSolventByName: function (kw) {
        var idx = solvents.findIndex(function (s) { return s.name.indexOf(kw) !== -1; });
        if (idx >= 0) {
          selectedIdx = idx;
          sim.naclAdded = false;
          sim.behavior = "stratify";
          sim.turbulence = 0.08;
          initParticles(true);
          sim.particles.forEach(function (p) {
            p.y = 122 + Math.random() * 116;
            var hw = Math.max(8, funnelHalfW(p.y) - 8);
            p.x = CX + (Math.random() * 2 - 1) * hw;
          });
          var sel = container.querySelector("#v22SolventSelect");
          if (sel) sel.value = String(idx);
          updateUi();
        }
      },
      startPour: startPour,
      triggerTurbulence: triggerTurbulence,
      triggerStratify: triggerStratify,
      triggerDrain: triggerDrainLowerPhase,
      getState: function () {
        var org = getCurSolvent();
        var met = computeMetrics();
        return {
          ruleSource: solventData.source,
          solvent: org.name,
          rho: org.rho,
          miscible: org.miscible,
          expectedLayer: org.layer,
          behavior: sim.behavior,
          turbulence: sim.turbulence,
          valveOpen: sim.valveOpen,
          drainedPhase: sim.drainedPhase,
          drainedLevel: Number(sim.drainedLevel.toFixed(2)),
          naclAdded: sim.naclAdded,
          particleCount: sim.particles.length,
          metrics: met,
          fps: sim.fps
        };
      }
    };
  }

  if (typeof window !== "undefined") {
    window.TCM_V22_FLUID_SIM = { mount: mountFluidSim };
  }
})();
