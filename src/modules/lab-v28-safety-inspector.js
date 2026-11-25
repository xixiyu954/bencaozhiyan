/**
 * 本草智研 v28 · 3.5 AI 安全督察（v2 精工安全评分与 PPE 核对版）
 * - 实时计算安全合规评分（0~100 分）+ 6 类高危 MSDS 冲突拦截
 * - 新增交互式实验前 PPE 核对清单（通风橱 / 护目镜 / 丁腈手套 / 废液桶就位）
 * - 新增「📋 复制安全预案」与 Esc 快捷关闭 + 智能防重复打扰机制
 */
(function () {
  "use strict";

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var PPE_ITEMS = [
    { id: "hood", label: "通风橱已开启" },
    { id: "goggles", label: "已戴护目镜" },
    { id: "gloves", label: "已戴丁腈手套" },
    { id: "waste", label: "废液桶已就位" }
  ];

  var cardOpen = false;
  var lastAudit = null;
  var lastAlertSignature = "";
  var dismissedSignature = "";
  var ppeChecked = {};

  function readActiveParams() {
    var route = document.body.getAttribute("data-v16-route") || "home";
    var solvent = (document.getElementById("cfgSolventType") && document.getElementById("cfgSolventType").value) || "70%乙醇";
    var temp = Number((document.getElementById("cfgTemp") && document.getElementById("cfgTemp").value) || 75);
    var ratio = Number((document.getElementById("cfgRatio") && document.getElementById("cfgRatio").value) || 10);
    var cycles = Number((document.getElementById("cfgCycles") && document.getElementById("cfgCycles").value) || 2);
    var rig = "reflux";
    var source = "workflow";

    if (route === "diy" && window.TCM_V25_FORMULA_SANDBOX && !window.TCM_V25_FORMULA_SANDBOX.__isLazyProxy && typeof window.TCM_V25_FORMULA_SANDBOX.evaluateCurrent === "function") {
      try {
        var r = window.TCM_V25_FORMULA_SANDBOX.evaluateCurrent();
        var s = window.TCM_V25_FORMULA_SANDBOX.getState();
        if (r && r.solv) {
          solvent = r.solv.name;
          temp = Number(s.temp);
          ratio = Number(s.ratio);
          cycles = Number(s.cycles || 1);
          rig = s.rigId || "reflux";
          source = "sandbox";
        }
      } catch (_) {}
    } else if (route === "ai") {
      var sEl = document.getElementById("v27Solvent");
      var tEl = document.getElementById("v27Temp");
      var rEl = document.getElementById("v27Ratio");
      var cEl = document.getElementById("v27Cycles");
      if (sEl && sEl.value) {
        solvent = sEl.value;
        temp = Number((tEl && tEl.value) || temp);
        ratio = Number((rEl && rEl.value) || ratio);
        cycles = Number((cEl && cEl.value) || cycles);
        source = "arena";
      }
    }

    return { route: route, source: source, solvent: solvent, temp: temp, ratio: ratio, cycles: cycles, rig: rig };
  }

  function runSafetyAudit(customParams) {
    var p = customParams || readActiveParams();
    var alerts = [];
    var s = String(p.solvent || "");
    var score = 100;

    if (/氯仿|三氯甲烷|二氯甲烷/.test(s)) {
      score -= 32;
      alerts.push({
        code: "S-01", level: "danger",
        title: "含卤高危溶剂警示（" + s + "）",
        detail: "具强挥发毒性与肝肾风险，严禁在开放实验台操作，且含卤废液严禁混入非卤有机废液桶！"
      });
    }

    var bpLimits = [
      { match: /石油醚/, max: 58, name: "石油醚(30-60℃)" },
      { match: /二氯甲烷/, max: 39, name: "二氯甲烷(40℃)" },
      { match: /丙酮/, max: 55, name: "丙酮(56℃)" },
      { match: /三氯甲烷|氯仿/, max: 60, name: "三氯甲烷(61℃)" },
      { match: /甲醇/, max: 64, name: "甲醇(65℃)" },
      { match: /正己烷/, max: 68, name: "正己烷(69℃)" },
      { match: /乙醇|酒精/, max: 84, name: "乙醇体系(78~84℃)" }
    ];
    for (var i = 0; i < bpLimits.length; i++) {
      if (bpLimits[i].match.test(s) && p.temp > bpLimits[i].max) {
        score -= 28;
        alerts.push({
          code: "S-02", level: "danger",
          title: "超沸点暴沸与易燃蒸汽风险（" + p.temp + "℃）",
          detail: "设定温度已超过 " + bpLimits[i].name + " 安全控温上限，极易引发剧烈暴沸冲料或易燃蒸汽闪燃。"
        });
        break;
      }
    }

    if (p.rig === "decoction" && !/水/.test(s)) {
      score -= 30;
      alerts.push({
        code: "S-03", level: "danger",
        title: "装置-溶剂危险组合（敞口锅加热易燃溶剂）",
        detail: "常压煎煮锅无密闭回流冷凝系统，严禁加热 " + s + "，必须切换为带球形冷凝管的回流装置或水浴超声！"
      });
    }

    if (/正己烷|甲醇|甲苯|乙醚/.test(s)) {
      score -= 18;
      alerts.push({
        code: "S-04", level: "warn",
        title: "高毒/神经毒有机溶剂提示（" + s + "）",
        detail: "存在吸入毒性或神经蓄积风险，建议优先使用 70% 乙醇或乙酸乙酯作为绿色安全替代溶剂。"
      });
    }

    if (/酸水|硫酸|盐酸|碱水|NaOH|氨水/.test(s) && p.temp >= 90) {
      score -= 10;
      alerts.push({
        code: "S-05", level: "warn",
        title: "高温酸碱腐蚀防飞溅提示",
        detail: "高温酸/碱水体系具强刺激腐蚀性，务必佩戴耐酸碱手套与护目镜，严禁向浓酸中加水。"
      });
    }

    if (p.ratio * p.cycles > 32 && !/纯化水/.test(s)) {
      score -= 10;
      alerts.push({
        code: "S-06", level: "warn",
        title: "有机溶剂总负荷偏高（" + (p.ratio * p.cycles) + " mL/g）",
        detail: "单批有机蒸汽与废液负荷过大，建议下调料液比至 1:8~1:12 并配套旋蒸回收。"
      });
    }

    var msdsList = (window.TCM_V3_DATA && window.TCM_V3_DATA.REAGENT_MSDS_DB) || [];
    var msds = msdsList.find(function (m) { return m.match && m.match.test(s); }) || {
      name: s || "常规水相体系",
      level: "常规安全",
      ppe: "实验服 + 护目镜 + 丁腈手套",
      waste: /水/.test(s) ? "合规中和后排入实验室废水系统" : "非卤有机废液桶",
      tip: "遵循加沸石防暴沸与冷凝水下进上出规范。"
    };

    var hasDanger = alerts.some(function (a) { return a.level === "danger"; });
    var hasWarn = alerts.length > 0;
    lastAudit = {
      params: p,
      alerts: alerts,
      msds: msds,
      safetyScore: Math.max(10, score),
      hasDanger: hasDanger,
      hasWarn: hasWarn
    };
    return lastAudit;
  }

  function applySafeRemediation() {
    if (!lastAudit) return;
    var src = lastAudit.params.source;
    if (src === "sandbox" && window.TCM_V25_FORMULA_SANDBOX) {
      var optBtn = document.getElementById("v25BtnAutoOpt");
      if (optBtn) optBtn.click();
    } else if (src === "arena") {
      var sEl = document.getElementById("v27Solvent");
      var tEl = document.getElementById("v27Temp");
      if (sEl) sEl.value = "70%乙醇";
      if (tEl && Number(tEl.value) > 78) tEl.value = "75";
      var revBtn = document.getElementById("v27BtnReReview");
      if (revBtn) revBtn.click();
    } else {
      var wsEl = document.getElementById("cfgSolventType");
      var wtEl = document.getElementById("cfgTemp");
      if (wsEl && /氯仿|二氯甲烷|石油醚|正己烷|甲醇/.test(wsEl.value)) {
        wsEl.value = "70%乙醇";
        wsEl.dispatchEvent(new Event("change", { bubbles: true }));
      }
      if (wtEl && Number(wtEl.value) > 78) {
        wtEl.value = "75";
        wtEl.dispatchEvent(new Event("input", { bubbles: true }));
        wtEl.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
    if (window.TCM_LAB_API && typeof window.TCM_LAB_API.showToast === "function") {
      window.TCM_LAB_API.showToast("🛡️ AI 安全督察已切换为绿色安全替代参数（70%乙醇 / ≤75℃）！");
    }
    setTimeout(function () { refreshAndSync(false); }, 100);
  }

  function ensureCard() {
    var card = document.getElementById("tcmV28SafetyCard");
    if (!card) {
      card = document.createElement("aside");
      card.id = "tcmV28SafetyCard";
      card.className = "no-print";
      card.setAttribute("aria-label", "AI 安全督察警告卡");
      document.body.appendChild(card);
    }
    return card;
  }

  function renderSafetyCard() {
    var card = ensureCard();
    var audit = lastAudit || runSafetyAudit();
    var fab = document.getElementById("tcmV28SafetyFab");

    if (fab) {
      fab.classList.toggle("has-danger", audit.hasDanger);
      fab.classList.toggle("has-warn", !audit.hasDanger && audit.hasWarn);
      fab.textContent = audit.hasDanger
        ? "🛡️ 高危预警 (" + audit.alerts.length + ")"
        : audit.hasWarn
          ? "🛡️ 安全提示 (" + audit.alerts.length + ")"
          : "🛡️ 安全合规";
    }

    card.classList.toggle("is-open", cardOpen);
    card.classList.toggle("is-safe", !audit.hasWarn);
    if (!cardOpen) return;

    var checkedCount = PPE_ITEMS.filter(function (it) { return !!ppeChecked[it.id]; }).length;

    card.innerHTML =
      '<div class="v28-safety-head">' +
        '<span>' + (audit.hasDanger ? "🚨 AI 安全督察 · 高危拦截" : audit.hasWarn ? "⚠️ AI 安全督察 · 安全提示" : "🛡️ AI 安全督察 · 方案合规") + "</span>" +
        '<div style="display:flex;align-items:center;gap:6px;">' +
          '<span class="v28-score-pill">安全分 ' + audit.safetyScore + '/100</span>' +
          '<button type="button" id="v28CloseSafety" style="border:none;background:rgba(255,255,255,0.2);color:#fff;border-radius:999px;padding:2px 9px;font-weight:800;cursor:pointer;">×</button>' +
        "</div>" +
      "</div>" +
      '<div class="v28-safety-body">' +
        '<div style="font-size:11.5px;color:#64748b;font-weight:700;">实时监控：' + esc(audit.params.solvent) + " · " + audit.params.temp + "℃ · 1:" + audit.params.ratio + " × " + audit.params.cycles + "次</div>" +
        (audit.alerts.length
          ? audit.alerts.map(function (a) {
              return '<div class="v28-alert-item lv-' + a.level + '"><strong>[' + esc(a.code) + "] " + esc(a.title) + "</strong><div>" + esc(a.detail) + "</div></div>";
            }).join("")
          : '<div style="padding:8px 11px;border-radius:12px;background:rgba(16,185,129,0.1);color:#047857;font-weight:700;">未检出 MSDS 冲突、超沸点暴沸或危险装置组合，可按标准 SOP 开展实验。</div>') +
        '<div class="v28-msds-box">' +
          '<div><strong>🧪 MSDS 防护（' + esc(audit.msds.name) + '）：</strong>' + esc(audit.msds.ppe) + "</div>" +
          '<div style="margin-top:3px;"><strong>♻️ 废液桶归属：</strong>' + esc(audit.msds.waste) + "</div>" +
        "</div>" +
        '<div>' +
          '<div style="font-size:11.5px;font-weight:800;margin-bottom:5px;display:flex;justify-content:space-between;"><span>入场前 PPE 核对清单</span><span>' + (checkedCount === PPE_ITEMS.length ? "✅ 已全项核对" : checkedCount + "/" + PPE_ITEMS.length) + "</span></div>" +
          '<div class="v28-ppe-grid">' +
            PPE_ITEMS.map(function (it) {
              var ck = !!ppeChecked[it.id];
              return '<button type="button" class="v28-ppe-item' + (ck ? " is-checked" : "") + '" data-v28-ppe="' + it.id + '">' + (ck ? "☑ " : "☐ ") + esc(it.label) + "</button>";
            }).join("") +
          "</div>" +
        "</div>" +
        '<div class="v28-safety-actions">' +
          (audit.hasWarn ? '<button type="button" class="v28-sbtn-fix" id="v28BtnSafeFix">✅ 一键安全替代</button>' : "") +
          '<button type="button" class="v28-sbtn-ask" id="v28BtnAskMentor">💬 追问 AI 导师</button>' +
          '<button type="button" class="v28-sbtn-ask" id="v28BtnCopySafety">📋 复制安全预案</button>' +
        "</div>" +
      "</div>";

    card.querySelector("#v28CloseSafety").addEventListener("click", function () {
      cardOpen = false;
      dismissedSignature = lastAlertSignature;
      renderSafetyCard();
    });
    card.querySelectorAll("[data-v28-ppe]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var pid = this.getAttribute("data-v28-ppe");
        ppeChecked[pid] = !ppeChecked[pid];
        renderSafetyCard();
      });
    });
    var fixBtn = card.querySelector("#v28BtnSafeFix");
    if (fixBtn) fixBtn.addEventListener("click", applySafeRemediation);
    var copyBtn = card.querySelector("#v28BtnCopySafety");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var txt = [
          "【本草智研 · AI 安全督察 MSDS 预案】",
          "当前参数：" + audit.params.solvent + " | " + audit.params.temp + "℃ | 1:" + audit.params.ratio + " × " + audit.params.cycles + "次（安全分 " + audit.safetyScore + "/100）",
          "风险核查：" + (audit.alerts.length ? audit.alerts.map(function (a) { return "[" + a.code + "]" + a.title; }).join("；") : "合规无高危冲突"),
          "PPE 防护：" + audit.msds.ppe,
          "废液去向：" + audit.msds.waste
        ].join("\n");
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).catch(function () {});
        copyBtn.textContent = "✅ 已复制预案";
        setTimeout(function () { copyBtn.textContent = "📋 复制安全预案"; }, 1400);
      });
    }
    var askBtn = card.querySelector("#v28BtnAskMentor");
    if (askBtn) {
      askBtn.addEventListener("click", function () {
        cardOpen = false;
        renderSafetyCard();
        if (window.TCM_V28_MENTOR && typeof window.TCM_V28_MENTOR.ask === "function") {
          window.TCM_V28_MENTOR.ask("当前使用 " + audit.params.solvent + " 在 " + audit.params.temp + "℃ 下有哪些 MSDS 安全与废液注意事项？");
        }
      });
    }
  }

  function refreshAndSync(autoPopupOnNewDanger) {
    var audit = runSafetyAudit();
    var sig = audit.alerts.map(function (a) { return a.code; }).join(",");
    if (autoPopupOnNewDanger && audit.hasDanger && sig && sig !== lastAlertSignature && sig !== dismissedSignature) {
      cardOpen = true;
    }
    lastAlertSignature = sig;
    renderSafetyCard();
  }

  function init() {
    ensureCard();
    setTimeout(function () { refreshAndSync(false); }, 260);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && cardOpen) {
        cardOpen = false;
        renderSafetyCard();
      }
    });
    document.addEventListener("input", function (e) {
      if (e.target && /^(cfg|v25|v27)/.test(e.target.id || "")) refreshAndSync(true);
    }, { passive: true });
    document.addEventListener("change", function (e) {
      if (e.target && /^(cfg|v25|v27)/.test(e.target.id || "")) refreshAndSync(true);
    }, { passive: true });
    document.addEventListener("click", function (e) {
      if (e.target && e.target.closest && e.target.closest("[data-v25-solvent], [data-v25-rig], [data-v25-preset], #v25BtnAutoOpt, #v27BtnGenerate")) {
        setTimeout(function () { refreshAndSync(true); }, 80);
      }
    }, { passive: true });
  }

  window.TCM_V28_SAFETY = {
    version: "2.0.0-craft",
    audit: runSafetyAudit,
    openCard: function () { cardOpen = true; refreshAndSync(false); },
    closeCard: function () { cardOpen = false; renderSafetyCard(); },
    toggleCard: function () { cardOpen = !cardOpen; refreshAndSync(false); },
    applySafeFix: applySafeRemediation,
    getState: function () {
      var a = lastAudit || runSafetyAudit();
      return {
        version: "2.0.0-craft",
        cardOpen: cardOpen,
        safetyScore: a.safetyScore,
        hasDanger: a.hasDanger,
        hasWarn: a.hasWarn,
        alertCodes: a.alerts.map(function (x) { return x.code; }),
        ppeCheckedCount: PPE_ITEMS.filter(function (it) { return !!ppeChecked[it.id]; }).length
      };
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
