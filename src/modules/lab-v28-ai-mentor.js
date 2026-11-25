/**
 * 本草智研 v28 · 3.1 AI 导师对话（v2 精工上下文感知版）
 * - 精准同步 2.1 自由配方沙盒所选药材、2.5 AI 课题生成器及六步工坊实时上下文
 * - 支持每条导师解答一键复制、Esc 快捷键关闭、会话历史本机持久化（localStorage）
 */
(function () {
  "use strict";

  var STORAGE_HIST = "tcm_v28_mentor_hist_v1";

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var ROUTE_NAMES = {
    home: "首页总览",
    bank: "药材实验题库",
    ai: "智能实验设计",
    diy: "DIY 创意实验室",
    translation: "8 阶段产业转化",
    workflow: "六步规范实验工坊"
  };

  var messages = loadHistory();
  var isOpen = false;
  var isBusy = false;

  function loadHistory() {
    try {
      var raw = localStorage.getItem(STORAGE_HIST);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.slice(-12) : [];
    } catch (_) { return []; }
  }

  function saveHistory() {
    try { localStorage.setItem(STORAGE_HIST, JSON.stringify(messages.slice(-12))); } catch (_) {}
  }

  function collectLiveContext() {
    var route = document.body.getAttribute("data-v16-route") || "home";
    var api = window.TCM_LAB_API;
    var topic = (api && typeof api.getCurrentTopic === "function" && api.getCurrentTopic()) || { herb: "丹参", compound: "丹参酮 IIA", category: "醌类" };
    var step = (api && typeof api.getStep === "function" && api.getStep()) || 1;
    var ws = (api && typeof api.getCurrentWorkState === "function" && api.getCurrentWorkState()) || {};

    var herb = String(topic.herb || "丹参").split("（")[0];
    var compound = topic.compound || "核心有效成分";
    var category = topic.category || "中药化学";
    var solvent = (document.getElementById("cfgSolventType") && document.getElementById("cfgSolventType").value) || ws.solventType || "70%乙醇";
    var temp = (document.getElementById("cfgTemp") && document.getElementById("cfgTemp").value) || ws.temp || 78;
    var ratio = (document.getElementById("cfgRatio") && document.getElementById("cfgRatio").value) || ws.ratio || 10;
    var time = (document.getElementById("cfgTime") && document.getElementById("cfgTime").value) || ws.time || 60;

    // 若当前在 DIY 自由配方沙盒中，优先读取沙盒内实际选中的药材与实时参数（跳过未水合懒代理）
    if (route === "diy" && window.TCM_V25_FORMULA_SANDBOX && !window.TCM_V25_FORMULA_SANDBOX.__isLazyProxy && typeof window.TCM_V25_FORMULA_SANDBOX.evaluateCurrent === "function") {
      try {
        var sbRes = window.TCM_V25_FORMULA_SANDBOX.evaluateCurrent();
        var sbSt = window.TCM_V25_FORMULA_SANDBOX.getState();
        var sbSel = document.getElementById("v25HerbSelect");
        if (sbSel && sbSel.selectedOptions && sbSel.selectedOptions[0]) {
          herb = sbSel.selectedOptions[0].textContent.split("（")[0].trim() || herb;
        }
        if (sbRes && sbRes.solv) {
          solvent = sbRes.solv.name;
          temp = sbSt.temp;
          ratio = sbSt.ratio;
          time = sbSt.time;
        }
      } catch (_) {}
    } else if (route === "ai") {
      var sEl = document.getElementById("v27Solvent");
      var tEl = document.getElementById("v27Temp");
      var rEl = document.getElementById("v27Ratio");
      if (sEl && sEl.value) {
        solvent = sEl.value;
        temp = Number((tEl && tEl.value) || temp);
        ratio = Number((rEl && rEl.value) || ratio);
      }
    }

    return {
      route: route,
      routeLabel: ROUTE_NAMES[route] || route,
      step: step,
      herb: herb,
      compound: compound,
      category: category,
      solvent: solvent,
      temp: Number(temp),
      ratio: Number(ratio),
      time: Number(time)
    };
  }

  function buildQuickPrompts(ctx) {
    return [
      ctx.herb + "为什么选「" + ctx.solvent + "」？原理是什么？",
      "当前 " + ctx.temp + "℃ / 1:" + ctx.ratio + " 参数有没有热敏或安全隐患？",
      ctx.herb + "分离纯化与 TLC 检识怎么防拖尾？"
    ];
  }

  function buildContextAwareLocalReply(question, ctx) {
    var q = String(question || "");
    var msdsList = (window.TCM_V3_DATA && window.TCM_V3_DATA.REAGENT_MSDS_DB) || [];
    var msdsHit = msdsList.find(function (m) { return m.match && m.match.test(ctx.solvent + " " + q); });

    if (/安全|MSDS|废液|通风|明火|暴沸|氯仿|乙醚|甲醇|隐患/.test(q)) {
      var safeTip = msdsHit
        ? "【MSDS 实时核查 · " + msdsHit.name + "】\n• 风险等级：" + msdsHit.level + "\n• 强制防护：" + msdsHit.ppe + "\n• 废液去向：" + msdsHit.waste + "\n• 操作要点：" + msdsHit.tip
        : "【当前工艺安全评估（" + ctx.herb + " · " + ctx.solvent + " · " + ctx.temp + "℃）】\n• 回流/加热前务必投入 2~3 粒沸石防暴沸，冷却水严格「下进上出」。\n• 严禁明火加热有机溶剂，装液量不超过烧瓶容积 2/3。";
      return safeTip + "\n\n（提示：点击右下角「🛡️ 安全督察」可勾选实验前 PPE 核对清单并导出安全预案。）";
    }

    if (/TLC|拖尾|检识|纯化|分离|乳化/.test(q)) {
      var tlcAdvice = /生物碱|黄连|小檗碱|延胡索/.test(ctx.herb + ctx.compound + ctx.category)
        ? "生物碱在酸性硅胶板上易发生离子交换拖尾，建议展开缸用浓氨水蒸气预饱和或改用 1% NaOH 碱板。"
        : /酸|黄酮|黄芩|绿原酸|槐米/.test(ctx.herb + ctx.compound + ctx.category)
          ? "酚酸与黄酮含酸性酚羟基/羧基，建议在展开剂中加入 0.5%~1% 甲酸/冰醋酸抑制电离，UV 365 nm 或喷 3% AlCl₃/FeCl₃ 检视。"
          : "控制点样斑径 ≤2 mm、展开缸提前饱和 15 min，可显著提高斑点圆度与 Rf 重复性。";
      return "【针对 " + ctx.herb + " 的纯化与检识建议】\n1. 纯化除杂：醇提液浓缩脱醇后可结合乙酸乙酯萃取（加饱和 NaCl 防乳化）或 D101 大孔树脂分级洗脱。\n2. TLC 防拖尾：" + tlcAdvice;
    }

    if (/温度|料液比|参数|时间|热敏|杀酶/.test(q)) {
      var thermNote = /黄芩/.test(ctx.herb)
        ? "黄芩含黄芩酶，35~65℃ 温水会酶解变绿，必须 ≥95℃ 沸水瞬时杀酶或用 ≥70% 乙醇！"
        : /金银花|绿原酸|丹参/.test(ctx.herb + ctx.compound)
          ? ctx.herb + "含热敏/光敏基团，建议控温 ≤" + (/金银花|绿原酸/.test(ctx.herb + ctx.compound) ? "50℃" : "80℃") + " 并避光操作。"
          : "当前设定 " + ctx.temp + "℃、料液比 1:" + ctx.ratio + "、时长 " + ctx.time + " min，建议采用 2 次合并提取以维持菲克扩散浓度差。";
      return "【针对当前场景（" + ctx.routeLabel + " · " + ctx.herb + "）的参数诊断】\n• 温控要点：" + thermNote + "\n• 料液比建议：常规 1:8~1:12 兼顾浸润充分度与后续旋蒸浓缩能耗。";
    }

    return (
      "【AI 导师场景解答 · " + ctx.herb + "】\n" +
      "1. 当前定位：你正处于「" + ctx.routeLabel + "」，体系为 " + ctx.solvent + " / " + ctx.temp + "℃ / 1:" + ctx.ratio + "。\n" +
      "2. 提取原理：按相似相溶与菲克扩散规律，需依据目标成分极性窗合理选择溶剂与提取装置。\n" +
      "3. 实操关键：投料前充分浸润 20 min，加沸石防暴沸，合并 2 次滤液后低温减压浓缩以防热降解。"
    );
  }

  async function askMentor(questionText) {
    var q = String(questionText || "").trim();
    if (!q || isBusy) return;
    var ctx = collectLiveContext();
    messages.push({ role: "user", text: q });
    saveHistory();
    isBusy = true;
    renderPanel();

    var reply = "";
    if (window.TCMCloudAI && typeof window.TCMCloudAI.complete === "function") {
      try {
        var sys = "你是「本草智研」中药化学 24 小时 AI 导师。请结合学生当前实验上下文给出简洁、准确、贴近实操的中文解答（120~220字）。";
        var usr = "当前场景：" + JSON.stringify(ctx) + "\n学生提问：" + q;
        var res = await Promise.race([
          window.TCMCloudAI.complete({
            messages: [
              { role: "system", content: sys },
              { role: "user", content: usr }
            ],
            useCache: false
          }),
          new Promise(function (_, rej) { setTimeout(function () { rej(new Error("timeout")); }, 8000); })
        ]);
        if (res && typeof res === "string" && res.trim().length > 8) reply = res.trim();
        else if (res && res.text && res.text.trim().length > 8) reply = res.text.trim();
        else if (res && res.content && res.content.trim().length > 8) reply = res.content.trim();
      } catch (_) {}
    }

    if (!reply) reply = buildContextAwareLocalReply(q, ctx);
    messages.push({ role: "ai", text: reply });
    saveHistory();
    isBusy = false;
    renderPanel();
  }

  var ICO_SHIELD = '<svg class="craft-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
  var ICO_CHAT = '<svg class="craft-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';

  function ensureDockAndPanel() {
    var dock = document.getElementById("tcmV28AiDock");
    if (!dock) {
      dock = document.createElement("div");
      dock.id = "tcmV28AiDock";
      dock.className = "no-print";
      dock.innerHTML =
        '<button type="button" id="tcmV28SafetyFab" class="v28-fab v28-fab-safety" title="实验安全合规状态">' + ICO_SHIELD + '<span>安全合规</span></button>' +
        '<button type="button" id="tcmV28MentorFab" class="v28-fab v28-fab-mentor" title="提问当前实验原理、参数与安全">' + ICO_CHAT + '<span>实验导师</span></button>';
      document.body.appendChild(dock);

      dock.querySelector("#tcmV28MentorFab").addEventListener("click", function () { togglePanel(); });
      dock.querySelector("#tcmV28SafetyFab").addEventListener("click", function () {
        if (window.TCM_V28_SAFETY && typeof window.TCM_V28_SAFETY.toggleCard === "function") {
          window.TCM_V28_SAFETY.toggleCard();
        }
      });
    }

    var panel = document.getElementById("tcmV28MentorPanel");
    if (!panel) {
      panel = document.createElement("aside");
      panel.id = "tcmV28MentorPanel";
      panel.className = "no-print";
      panel.setAttribute("aria-label", "AI 导师悬浮对话");
      document.body.appendChild(panel);
    }
    return panel;
  }

  function renderPanel() {
    var panel = ensureDockAndPanel();
    panel.classList.toggle("is-open", isOpen);
    if (!isOpen) return;

    var ctx = collectLiveContext();
    var quicks = buildQuickPrompts(ctx);

    var displayMsgs = messages.length
      ? messages
      : [{ role: "ai", text: "你好！我是你的 24 小时中药化学 AI 导师。当前已同步你在「" + ctx.routeLabel + "」的实时参数，原理、分离纯化或安全疑问都可以直接问我。" }];

    panel.innerHTML =
      '<div class="v28-mentor-head">' +
        '<div><strong>实验导师对话</strong> <span style="font-size:11px;opacity:0.82;">上下文实时同步 · Esc 关闭</span></div>' +
        '<div style="display:flex;gap:6px;">' +
          '<button type="button" id="v28ClearChat" style="border:none;background:rgba(255,255,255,0.16);color:#fff;border-radius:6px;padding:3px 9px;font-size:11px;font-weight:700;cursor:pointer;">清空</button>' +
          '<button type="button" id="v28CloseMentor" style="border:none;background:rgba(255,255,255,0.2);color:#fff;border-radius:6px;padding:3px 9px;font-size:12px;font-weight:800;cursor:pointer;">×</button>' +
        "</div>" +
      "</div>" +
      '<div class="v28-mentor-ctx">' +
        '<span>当前场景：' + esc(ctx.routeLabel) + " · " + esc(ctx.herb) + " · " + esc(ctx.solvent) + " " + ctx.temp + "℃</span>" +
      "</div>" +
      '<div class="v28-mentor-msgs" id="v28MsgList">' +
        displayMsgs.map(function (m, idx) {
          var copyBtn = m.role === "ai"
            ? '<div class="v28-msg-foot"><button type="button" class="v28-copy-mini" data-v28-copy-msg="' + idx + '">复制</button></div>'
            : "";
          return '<div class="v28-msg ' + (m.role === "user" ? "is-user" : "is-ai") + '">' + esc(m.text) + copyBtn + "</div>";
        }).join("") +
        (isBusy ? '<div class="v28-msg is-ai">正在结合当前工艺参数生成解答...</div>' : "") +
      "</div>" +
      '<div class="v28-quick-chips">' +
        quicks.map(function (q) {
          return '<button type="button" class="v28-qchip" data-v28-ask="' + esc(q) + '">' + esc(q) + "</button>";
        }).join("") +
      "</div>" +
      '<div class="v28-mentor-input-row">' +
        '<input type="text" id="v28MentorInput" class="v28-mentor-input" placeholder="输入原理、参数或安全疑问..." />' +
        '<button type="button" id="v28MentorSend" class="v28-mentor-send">发送</button>' +
      "</div>";

    var list = panel.querySelector("#v28MsgList");
    if (list) list.scrollTop = list.scrollHeight;

    panel.querySelector("#v28CloseMentor").addEventListener("click", function () { isOpen = false; renderPanel(); });
    panel.querySelector("#v28ClearChat").addEventListener("click", function () {
      messages = [];
      saveHistory();
      renderPanel();
    });
    panel.querySelectorAll("[data-v28-ask]").forEach(function (btn) {
      btn.addEventListener("click", function () { askMentor(this.getAttribute("data-v28-ask")); });
    });
    panel.querySelectorAll("[data-v28-copy-msg]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = Number(this.getAttribute("data-v28-copy-msg"));
        var txt = displayMsgs[idx] ? displayMsgs[idx].text : "";
        if (txt && navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(txt).catch(function () {});
        }
        this.textContent = "✅ 已复制";
        var self = this;
        setTimeout(function () { self.textContent = "📋 复制"; }, 1400);
      });
    });

    var inp = panel.querySelector("#v28MentorInput");
    var sendBtn = panel.querySelector("#v28MentorSend");
    var submit = function () {
      var val = inp ? inp.value.trim() : "";
      if (val) askMentor(val);
    };
    if (sendBtn) sendBtn.addEventListener("click", submit);
    if (inp) {
      inp.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); submit(); }
      });
    }
  }

  function togglePanel(forceOpen) {
    isOpen = typeof forceOpen === "boolean" ? forceOpen : !isOpen;
    renderPanel();
  }

  function init() {
    ensureDockAndPanel();
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen) {
        isOpen = false;
        renderPanel();
      }
    });
    if (typeof MutationObserver !== "undefined") {
      new MutationObserver(function () {
        if (isOpen) renderPanel();
      }).observe(document.body, { attributes: true, attributeFilter: ["data-v16-route"] });
    }
  }

  window.TCM_V28_MENTOR = {
    version: "2.0.0-craft",
    open: function () { togglePanel(true); },
    close: function () { togglePanel(false); },
    toggle: togglePanel,
    ask: function (q) {
      isOpen = true;
      renderPanel();
      return askMentor(q);
    },
    getContext: collectLiveContext,
    getState: function () {
      return { version: "2.0.0-craft", isOpen: isOpen, messageCount: messages.length, context: collectLiveContext() };
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
