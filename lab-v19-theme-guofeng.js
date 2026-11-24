/**
 * 本草智研 v19 · 方案 1：极简果味 · 现代 Bento 视觉模块
 * 规范：零构建 IIFE，仅向 window 暴露 TCM_V19_GUOFENG
 */
(function () {
  "use strict";

  var STORAGE_KEY_COLLAPSED = "tcm_v19_bento_strip_collapsed";

  var SOLAR_TERMS = [
    { name: "小寒", month: 1, day: 5, herbs: ["干姜", "肉桂"], note: "冬季灵感 · 温里挥发油与提取工艺" },
    { name: "大寒", month: 1, day: 20, herbs: ["干姜", "麻黄"], note: "冬季灵感 · 挥发油与生物碱质控" },
    { name: "立春", month: 2, day: 4, herbs: ["柴胡", "薄荷"], note: "春季灵感 · 挥发油提取与疏肝类药材" },
    { name: "雨水", month: 2, day: 19, herbs: ["茯苓", "白术"], note: "春季灵感 · 多糖纯化与健脾类药材" },
    { name: "惊蛰", month: 3, day: 5, herbs: ["金银花", "连翘"], note: "春季灵感 · 绿原酸与酚酸类提取" },
    { name: "春分", month: 3, day: 20, herbs: ["菊花", "枸杞子"], note: "春季灵感 · 黄酮分级与天然产物" },
    { name: "清明", month: 4, day: 4, herbs: ["艾叶", "茵陈"], note: "春季灵感 · 芳香挥发油与得率分析" },
    { name: "谷雨", month: 4, day: 20, herbs: ["丹参", "牡丹皮"], note: "春季灵感 · 丹参酮与丹酚酸双提" },
    { name: "立夏", month: 5, day: 5, herbs: ["黄连", "黄柏"], note: "夏季灵感 · 生物碱酸水结晶与分离" },
    { name: "小满", month: 5, day: 21, herbs: ["苦参", "葛根"], note: "夏季灵感 · 生物碱与异黄酮纯化" },
    { name: "芒种", month: 6, day: 5, herbs: ["藿香", "厚朴"], note: "夏季灵感 · 蒸馏与木脂素提取工艺" },
    { name: "夏至", month: 6, day: 21, herbs: ["黄芩", "栀子"], note: "夏季灵感 · 沸水杀酶保苷与黄酮苷" },
    { name: "小暑", month: 7, day: 7, herbs: ["紫苏叶", "金银花"], note: "夏季灵感 · 热敏挥发油与清热酚酸" },
    { name: "大暑", month: 7, day: 22, herbs: ["槐米", "荷叶"], note: "夏季灵感 · 碱提酸沉精制与黄酮" },
    { name: "立秋", month: 8, day: 7, herbs: ["麦冬", "甘草"], note: "秋季灵感 · 皂苷与多糖分离纯化" },
    { name: "处暑", month: 8, day: 23, herbs: ["桔梗", "甘草"], note: "秋季灵感 · 三萜皂苷起泡控制与纯化" },
    { name: "白露", month: 9, day: 7, herbs: ["苦杏仁", "贝母"], note: "秋季灵感 · 苷类与生物碱检识" },
    { name: "秋分", month: 9, day: 23, herbs: ["银杏叶", "陈皮"], note: "秋季灵感 · 黄酮内酯与橙皮苷" },
    { name: "寒露", month: 10, day: 8, herbs: ["丹参", "川芎"], note: "秋季灵感 · 活血成分与酚酸提取" },
    { name: "霜降", month: 10, day: 23, herbs: ["红花", "川芎"], note: "秋季灵感 · 阿魏酸与色素提取" },
    { name: "立冬", month: 11, day: 7, herbs: ["黄芪", "人参"], note: "冬季灵感 · 皂苷大孔树脂富集" },
    { name: "小雪", month: 11, day: 22, herbs: ["当归", "肉桂"], note: "冬季灵感 · 挥发油与回流工艺" },
    { name: "大雪", month: 12, day: 7, herbs: ["杜仲", "大黄"], note: "冬季灵感 · 蒽醌游离与结合型分离" },
    { name: "冬至", month: 12, day: 21, herbs: ["五味子", "延胡索"], note: "冬季灵感 · 绿色提取与炮制对照" }
  ];

  var CORNER_LABELS = {
    translation: "8 阶段",
    bank: "题库检索",
    ai: "AI 编排",
    diy: "交互沙盒"
  };

  var BENTO_CORNERS = ["机理图谱", "仿真装置", "项目体检", "A4 报告"];
  var currentTermIndex = 0;

  function detectCurrentTermIndex(date) {
    var d = date || new Date();
    var md = (d.getMonth() + 1) * 100 + d.getDate();
    var bestIdx = SOLAR_TERMS.length - 1;
    var bestMd = -1;
    for (var i = 0; i < SOLAR_TERMS.length; i++) {
      var tMd = SOLAR_TERMS[i].month * 100 + SOLAR_TERMS[i].day;
      if (tMd <= md && tMd > bestMd) {
        bestMd = tMd;
        bestIdx = i;
      }
    }
    return bestIdx;
  }

  function jumpToBankWithHerb(herbName) {
    if (!window.TCM_V16_PORTAL || typeof window.TCM_V16_PORTAL.go !== "function") return;
    window.TCM_V16_PORTAL.go("bank");
    setTimeout(function () {
      var inp = document.getElementById("v16BankSearch");
      if (!inp) return;
      inp.value = herbName;
      inp.dispatchEvent(new Event("input", { bubbles: true }));
      inp.focus();
    }, 60);
  }

  function renderTopStrip() {
    if (document.getElementById("tcmV19BentoStrip")) return;
    try {
      if (localStorage.getItem(STORAGE_KEY_COLLAPSED) === "1") return;
    } catch (_) {}

    var header = document.querySelector("header");
    if (!header || !header.parentNode) return;

    currentTermIndex = detectCurrentTermIndex(new Date());
    var bar = document.createElement("div");
    bar.id = "tcmV19BentoStrip";
    bar.className = "v19-bento-strip no-print";

    function updateStrip() {
      var term = SOLAR_TERMS[currentTermIndex];
      var pills = term.herbs
        .map(function (h) {
          return '<button type="button" class="v19-bento-pill" data-v19-herb="' + h + '">' + h + " ↗</button>";
        })
        .join("");

      bar.innerHTML =
        '<div class="v19-bento-strip-left">' +
          '<span class="v19-bento-tag"><span class="v19-bento-tag-dot"></span>' + term.name + "</span>" +
          pills +
          '<span class="v19-bento-tip">' + term.note + "</span>" +
        "</div>" +
        '<div class="v19-bento-strip-actions">' +
          '<button type="button" class="v19-bento-mini-btn" data-v19-act="prev">‹</button>' +
          '<button type="button" class="v19-bento-mini-btn" data-v19-act="next">›</button>' +
          '<button type="button" class="v19-bento-mini-btn" data-v19-act="close" title="隐藏">×</button>' +
        "</div>";
    }

    bar.addEventListener("click", function (e) {
      var herbBtn = e.target.closest("[data-v19-herb]");
      if (herbBtn) {
        jumpToBankWithHerb(herbBtn.getAttribute("data-v19-herb") || "");
        return;
      }
      var actBtn = e.target.closest("[data-v19-act]");
      if (!actBtn) return;
      var act = actBtn.getAttribute("data-v19-act");
      if (act === "prev") {
        currentTermIndex = (currentTermIndex - 1 + SOLAR_TERMS.length) % SOLAR_TERMS.length;
        updateStrip();
      } else if (act === "next") {
        currentTermIndex = (currentTermIndex + 1) % SOLAR_TERMS.length;
        updateStrip();
      } else if (act === "close") {
        try { localStorage.setItem(STORAGE_KEY_COLLAPSED, "1"); } catch (_) {}
        bar.remove();
      }
    });

    updateStrip();
    var homeWrap = document.querySelector("#v16HomePage .v16-home-wrap");
    if (homeWrap) {
      homeWrap.insertBefore(bar, homeWrap.firstChild);
    } else {
      header.parentNode.insertBefore(bar, header);
    }
  }

  function attachCornerPills() {
    // 仅向无右上角徽章的 Bento 功能卡追加角标，避免与 .v16-branch-badge 重叠
    var bentoCards = document.querySelectorAll("#v16HomePage .v16-bento-card");
    bentoCards.forEach(function (card, idx) {
      if (card.querySelector(".v19-bento-corner-pill")) return;
      var pill = document.createElement("span");
      pill.className = "v19-bento-corner-pill";
      pill.setAttribute("aria-hidden", "true");
      pill.textContent = BENTO_CORNERS[idx % BENTO_CORNERS.length];
      card.appendChild(pill);
    });
  }

  function init() {
    document.body.classList.add("tcm-v19-guofeng");
    renderTopStrip();
    attachCornerPills();

    var homePage = document.getElementById("v16HomePage");
    if (homePage && typeof MutationObserver !== "undefined") {
      new MutationObserver(function () {
        if (!document.getElementById("tcmV19BentoStrip")) renderTopStrip();
        attachCornerPills();
      }).observe(homePage, { childList: true });
    }
  }

  window.TCM_V19_GUOFENG = {
    version: "2.0.0-bento",
    theme: "bento-minimal-fresh",
    reapply: attachCornerPills,
    showStrip: function () {
      try { localStorage.removeItem(STORAGE_KEY_COLLAPSED); } catch (_) {}
      renderTopStrip();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
