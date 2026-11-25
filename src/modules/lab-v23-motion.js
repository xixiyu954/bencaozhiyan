/**
 * 本草智研 v23 · 1.8 动效系统控制器（v3 物理手感与精工质感版）
 * - 零顶栏开关冗余：静默遵循系统 prefers-reduced-motion，保留 window.TCM_V23_MOTION 编程接口
 * - 真单层弹性滑动导航胶囊（#tcmNavSlideIndicator）+ 悬停幽灵胶囊（#tcmNavHoverPill）
 * - 空间方向感路由转场（按导航顺序自动左/右滑入）+ 顶部翠金光丝 + 极轻柔雾
 * - 全 6 工作区定制零布局抖动（Zero-CLS）绝对覆盖骨架屏
 * - RAF 节流双层鼠标追踪镜面高光与边框聚光灯 + 六步工坊步骤微过渡 + 顶栏滚动景深
 */
(function () {
  "use strict";

  var reduceMotion = false;
  var lastRoute = "";
  var progressBar = null;
  var inkVeil = null;
  var navIndicator = null;
  var navHoverPill = null;
  var wipeTimer = null;
  var transitionCount = 0;
  var cardObserver = null;
  var lastDirection = "neutral";

  var ROUTE_ORDER = {
    home: 0,
    bank: 1,
    ai: 2,
    diy: 3,
    translation: 4,
    workflow: 5
  };

  var CARD_SELECTOR = [
    ".v19-bento-card",
    ".v16-branch-card",
    ".v16-bento-card",
    ".v16-topic-card",
    ".v16-bank-card",
    ".v16-bank-preview",
    ".v16-subhero",
    ".lab-card",
    ".pick-card"
  ].join(",");

  var ROUTE_MOUNT_MAP = {
    home: "#v16HomePage",
    bank: "#v16BankPage",
    workflow: "main",
    translation: "#v16TranslationPage",
    ai: "#v16AiPage",
    diy: "#v16DiyPage"
  };

  function detectSystemReducedMotion() {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  }

  function applyMotionState(isReduced) {
    reduceMotion = !!isReduced;
    document.body.classList.toggle("tcm-reduce-motion", reduceMotion);
    window.TCM_REDUCE_MOTION = reduceMotion;
  }

  function ensureTransitionLayers() {
    if (!progressBar) {
      progressBar = document.createElement("div");
      progressBar.id = "tcmRouteProgressBar";
      progressBar.setAttribute("aria-hidden", "true");
      document.body.appendChild(progressBar);
    }
    if (!inkVeil) {
      inkVeil = document.createElement("div");
      inkVeil.id = "tcmInkVeil";
      inkVeil.setAttribute("aria-hidden", "true");
      document.body.appendChild(inkVeil);
    }
  }

  function triggerRouteTransitionFx() {
    if (reduceMotion) return;
    ensureTransitionLayers();
    progressBar.classList.remove("is-running");
    inkVeil.classList.remove("is-wiping");
    void progressBar.offsetWidth;
    progressBar.classList.add("is-running");
    inkVeil.classList.add("is-wiping");
    if (wipeTimer) clearTimeout(wipeTimer);
    wipeTimer = setTimeout(function () {
      progressBar.classList.remove("is-running");
      inkVeil.classList.remove("is-wiping");
    }, 380);
  }

  function placePillOverTarget(pill, bar, target) {
    if (!pill || !bar || !target) return false;
    var barRect = bar.getBoundingClientRect();
    var btnRect = target.getBoundingClientRect();
    if (btnRect.width < 10 || btnRect.height < 10) return false;
    var dx = Math.round(btnRect.left - barRect.left);
    var dy = Math.round(btnRect.top - barRect.top);
    pill.style.width = Math.round(btnRect.width) + "px";
    pill.style.height = Math.round(btnRect.height) + "px";
    pill.style.transform = "translate3d(" + dx + "px, " + dy + "px, 0)";
    pill.style.opacity = "1";
    return true;
  }

  function ensureNavPills(bar) {
    if (!bar) return;
    if (!navHoverPill || navHoverPill.parentNode !== bar) {
      navHoverPill = document.createElement("div");
      navHoverPill.id = "tcmNavHoverPill";
      navHoverPill.setAttribute("aria-hidden", "true");
      bar.insertBefore(navHoverPill, bar.firstChild);
    }
    if (!navIndicator || navIndicator.parentNode !== bar) {
      navIndicator = document.createElement("div");
      navIndicator.id = "tcmNavSlideIndicator";
      navIndicator.setAttribute("aria-hidden", "true");
      bar.insertBefore(navIndicator, navHoverPill.nextSibling);
    }
    if (!bar.dataset.tcmHoverBound) {
      bar.dataset.tcmHoverBound = "1";
      bar.addEventListener("pointerover", function (e) {
        if (reduceMotion || e.pointerType === "touch") return;
        var tab = e.target && e.target.closest ? e.target.closest(".v16-route-tab") : null;
        if (!tab || tab.classList.contains("active")) {
          if (navHoverPill) navHoverPill.style.opacity = "0";
          return;
        }
        placePillOverTarget(navHoverPill, bar, tab);
      });
      bar.addEventListener("pointerleave", function () {
        if (navHoverPill) navHoverPill.style.opacity = "0";
      });
    }
  }

  function updateNavSlideIndicator() {
    var bar = document.getElementById("workspaceZoneBar");
    if (!bar) return;
    var activeBtn = bar.querySelector(".v16-route-tab.active, .active, [aria-current='page']");
    if (!activeBtn) return;

    ensureNavPills(bar);
    if (placePillOverTarget(navIndicator, bar, activeBtn)) {
      bar.classList.add("tcm-nav-glide-ready");
    }
  }

  function ensureCardObserver() {
    if (cardObserver || typeof IntersectionObserver === "undefined") return;
    cardObserver = new IntersectionObserver(function (entries) {
      var batchIdx = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.style.setProperty("--tcm-stagger", Math.min(200, batchIdx * 32) + "ms");
        el.classList.remove("tcm-card-anim");
        void el.offsetWidth;
        el.classList.add("tcm-card-anim");
        cardObserver.unobserve(el);
        batchIdx++;
      });
    }, { threshold: 0.05 });
  }

  function animateCardsIn(root) {
    if (reduceMotion || !root) return;
    ensureCardObserver();
    var cards = root.querySelectorAll(CARD_SELECTOR);
    var max = Math.min(cards.length, 24);
    for (var i = 0; i < max; i++) {
      var el = cards[i];
      if (cardObserver) {
        cardObserver.observe(el);
      } else {
        el.style.setProperty("--tcm-stagger", Math.min(200, i * 30) + "ms");
        el.classList.remove("tcm-card-anim");
        void el.offsetWidth;
        el.classList.add("tcm-card-anim");
      }
    }
  }

  function buildSkeletonHtml(variant) {
    if (variant === "bank") {
      return (
        '<div class="space-y-4">' +
          '<div class="flex items-center justify-between gap-4"><div class="tcm-skel-block h-8 w-56"></div><div class="tcm-skel-block h-8 w-44"></div></div>' +
          '<div class="tcm-skel-block h-11 w-full"></div>' +
          '<div class="grid grid-cols-1 lg:grid-cols-12 gap-4">' +
            '<div class="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-3">' +
              '<div class="tcm-skel-block h-36"></div><div class="tcm-skel-block h-36"></div><div class="tcm-skel-block h-36"></div>' +
              '<div class="tcm-skel-block h-36"></div><div class="tcm-skel-block h-36"></div><div class="tcm-skel-block h-36"></div>' +
            '</div>' +
            '<div class="lg:col-span-4 tcm-skel-block h-72"></div>' +
          '</div>' +
        '</div>'
      );
    }
    if (variant === "translation") {
      return (
        '<div class="space-y-4">' +
          '<div class="flex flex-wrap gap-2">' +
            '<div class="tcm-skel-block h-8 w-24"></div><div class="tcm-skel-block h-8 w-24"></div><div class="tcm-skel-block h-8 w-24"></div><div class="tcm-skel-block h-8 w-24"></div>' +
          '</div>' +
          '<div class="tcm-skel-block h-28 w-full"></div>' +
          '<div class="grid grid-cols-1 lg:grid-cols-12 gap-4">' +
            '<div class="lg:col-span-8 tcm-skel-block h-64"></div>' +
            '<div class="lg:col-span-4 tcm-skel-block h-64"></div>' +
          '</div>' +
        '</div>'
      );
    }
    if (variant === "ai") {
      return (
        '<div class="space-y-4">' +
          '<div class="tcm-skel-block h-20 w-full"></div>' +
          '<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">' +
            '<div class="tcm-skel-block h-64"></div><div class="tcm-skel-block h-64"></div>' +
          '</div>' +
        '</div>'
      );
    }
    if (variant === "diy") {
      return (
        '<div class="space-y-4">' +
          '<div class="flex items-center justify-between gap-3"><div class="tcm-skel-block h-9 w-64"></div><div class="tcm-skel-block h-9 w-36"></div></div>' +
          '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">' +
            '<div class="tcm-skel-block h-48"></div><div class="tcm-skel-block h-48"></div><div class="tcm-skel-block h-48"></div>' +
          '</div>' +
        '</div>'
      );
    }
    if (variant === "workflow") {
      return (
        '<div class="space-y-4">' +
          '<div class="flex gap-2"><div class="tcm-skel-block h-8 w-28"></div><div class="tcm-skel-block h-8 w-52"></div></div>' +
          '<div class="grid grid-cols-1 lg:grid-cols-12 gap-4">' +
            '<div class="lg:col-span-7 tcm-skel-block h-64"></div>' +
            '<div class="lg:col-span-5 tcm-skel-block h-64"></div>' +
          '</div>' +
        '</div>'
      );
    }
    return (
      '<div class="space-y-3.5">' +
        '<div class="tcm-skel-block h-8 w-64"></div>' +
        '<div class="tcm-skel-block h-4 w-3/4"></div>' +
        '<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">' +
          '<div class="tcm-skel-block h-40"></div><div class="tcm-skel-block h-40"></div><div class="tcm-skel-block h-40"></div>' +
        '</div>' +
      '</div>'
    );
  }

  // Zero-CLS 绝对覆盖骨架屏（平滑淡出，绝不顶开页面内容）
  function showSkeleton(targetEl, variant, durationMs) {
    if (!targetEl || reduceMotion) return null;
    targetEl.classList.add("tcm-skel-host");
    var existing = targetEl.querySelector(":scope > .tcm-skel-overlay");
    if (existing) existing.remove();

    var wrap = document.createElement("div");
    wrap.className = "tcm-skel-overlay no-print";
    wrap.setAttribute("role", "status");
    wrap.setAttribute("aria-label", "页面加载中");
    wrap.innerHTML = buildSkeletonHtml(variant || "default");
    targetEl.appendChild(wrap);

    var ms = typeof durationMs === "number" ? durationMs : 170;
    setTimeout(function () {
      wrap.classList.add("is-fading");
      setTimeout(function () { if (wrap.parentNode) wrap.remove(); }, 210);
    }, ms);
    return wrap;
  }

  function onRouteChanged(newRoute) {
    if (!newRoute || newRoute === lastRoute) return;
    var oldIdx = Object.prototype.hasOwnProperty.call(ROUTE_ORDER, lastRoute) ? ROUTE_ORDER[lastRoute] : -1;
    var newIdx = Object.prototype.hasOwnProperty.call(ROUTE_ORDER, newRoute) ? ROUTE_ORDER[newRoute] : -1;
    var enterClass = "tcm-route-entering";
    if (oldIdx >= 0 && newIdx >= 0 && oldIdx !== newIdx) {
      if (newIdx > oldIdx) {
        enterClass = "tcm-enter-from-right";
        lastDirection = "right";
      } else {
        enterClass = "tcm-enter-from-left";
        lastDirection = "left";
      }
    } else {
      lastDirection = "neutral";
    }

    lastRoute = newRoute;
    transitionCount++;

    if (navHoverPill) navHoverPill.style.opacity = "0";
    updateNavSlideIndicator();
    if (reduceMotion) return;

    triggerRouteTransitionFx();
    var sel = ROUTE_MOUNT_MAP[newRoute];
    var mount = sel ? document.querySelector(sel) : null;
    if (mount) {
      mount.classList.remove("tcm-route-entering", "tcm-enter-from-right", "tcm-enter-from-left");
      void mount.offsetWidth;
      mount.classList.add(enterClass);
      if (newRoute !== "home") {
        showSkeleton(mount, newRoute, 165);
      }
      setTimeout(function () { animateCardsIn(mount); }, 30);
    }
  }

  // RAF 节流鼠标追踪双层镜面高光与边框聚光灯
  function bindCardSpotlight() {
    var pendingCard = null;
    var pendingX = 0;
    var pendingY = 0;
    var rafId = 0;

    document.addEventListener("pointermove", function (e) {
      if (reduceMotion || e.pointerType === "touch") return;
      var card = e.target && e.target.closest
        ? e.target.closest(".v19-bento-card, .v16-branch-card, .v16-bento-card, .v16-topic-card, .v16-bank-card")
        : null;
      if (!card) return;
      pendingCard = card;
      pendingX = e.clientX;
      pendingY = e.clientY;
      if (!rafId) {
        rafId = requestAnimationFrame(function () {
          rafId = 0;
          if (!pendingCard) return;
          var rect = pendingCard.getBoundingClientRect();
          pendingCard.style.setProperty("--mx", Math.round(pendingX - rect.left) + "px");
          pendingCard.style.setProperty("--my", Math.round(pendingY - rect.top) + "px");
        });
      }
    }, { passive: true });
  }

  // 六步工坊步骤切换微过渡
  function bindStepMicroTransition() {
    document.addEventListener("click", function (e) {
      if (reduceMotion) return;
      var stepBtn = e.target && e.target.closest ? e.target.closest("[data-wstep]") : null;
      if (!stepBtn) return;
      var mainEl = document.querySelector("main");
      if (!mainEl) return;
      mainEl.classList.remove("tcm-step-switching");
      void mainEl.offsetWidth;
      mainEl.classList.add("tcm-step-switching");
    }, { passive: true });
  }

  // 顶栏滚动景深霜化
  function bindScrollDepth() {
    var ticking = false;
    function syncScroll() {
      ticking = false;
      document.body.classList.toggle("tcm-scrolled", (window.scrollY || 0) > 12);
    }
    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(syncScroll);
      }
    }, { passive: true });
    syncScroll();
  }

  function initMotionSystem() {
    applyMotionState(detectSystemReducedMotion());
    bindCardSpotlight();
    bindStepMicroTransition();
    bindScrollDepth();

    if (typeof window !== "undefined" && window.matchMedia) {
      var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mq.addEventListener) {
        mq.addEventListener("change", function (ev) { applyMotionState(ev.matches); });
      }
    }

    lastRoute = document.body.getAttribute("data-v16-route") || "home";
    var initMount = document.querySelector(ROUTE_MOUNT_MAP[lastRoute] || "#v16HomePage");
    if (initMount && !reduceMotion) animateCardsIn(initMount);

    // 多次时机校准导航胶囊（等待异步字体/首屏升级完成后精准贴合）
    setTimeout(updateNavSlideIndicator, 60);
    setTimeout(updateNavSlideIndicator, 280);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(updateNavSlideIndicator).catch(function () {});
    }
    window.addEventListener("resize", updateNavSlideIndicator, { passive: true });

    if (typeof MutationObserver !== "undefined") {
      new MutationObserver(function () {
        var cur = document.body.getAttribute("data-v16-route") || "home";
        if (cur !== lastRoute) onRouteChanged(cur);
        else updateNavSlideIndicator();
      }).observe(document.body, { attributes: true, attributeFilter: ["data-v16-route"] });
    }
  }

  window.TCM_V23_MOTION = {
    version: "3.0.0-craft",
    setReducedMotion: function (v) { applyMotionState(!!v); },
    isReducedMotion: function () { return reduceMotion; },
    showSkeleton: showSkeleton,
    triggerTransitionFx: triggerRouteTransitionFx,
    animateCardsIn: animateCardsIn,
    updateNavIndicator: updateNavSlideIndicator,
    getStats: function () {
      var bar = document.getElementById("workspaceZoneBar");
      return {
        version: "3.0.0-craft",
        reduceMotion: reduceMotion,
        lastRoute: lastRoute,
        lastDirection: lastDirection,
        transitionCount: transitionCount,
        hasNavIndicator: !!document.getElementById("tcmNavSlideIndicator"),
        hasNavHoverPill: !!document.getElementById("tcmNavHoverPill"),
        navGlideReady: !!(bar && bar.classList.contains("tcm-nav-glide-ready")),
        hasHeaderSwitch: !!document.getElementById("btnToggleMotion")
      };
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMotionSystem, { once: true });
  } else {
    initMotionSystem();
  }
})();
