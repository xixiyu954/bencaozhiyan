// 非首屏交互工作区按需水合轻代理（DIY 实验室 / 任务舱 / 自有方案 / AI 评审）
let diyPromise = null;
let diyLoaded = false;

let aiReviewPromise = null;
let aiReviewLoaded = false;

let wfVisualsPromise = null;
let wfVisualsLoaded = false;
let lastWfSyncArgs = null;

let insightPromise = null;
let insightLoaded = false;

export function loadWorkflowVisuals() {
  if (wfVisualsLoaded) return Promise.resolve();
  if (!wfVisualsPromise) {
    wfVisualsPromise = import('./workflow-visuals-chunk.js')
      .then(() => {
        wfVisualsLoaded = true;
        if (typeof window !== 'undefined') {
          if (window.TCM_STUDIO_V8 && !window.TCM_STUDIO_V8.__isLazyProxy && window.TCM_STUDIO_V8.init) {
            window.TCM_STUDIO_V8.init();
          }
          if (lastWfSyncArgs) {
            if (window.TCM_STUDIO_V8 && !window.TCM_STUDIO_V8.__isLazyProxy && window.TCM_STUDIO_V8.sync) {
              window.TCM_STUDIO_V8.sync(...lastWfSyncArgs);
            }
            if (window.TCM_V9 && !window.TCM_V9.__isLazyProxy && window.TCM_V9.sync) {
              window.TCM_V9.sync(...lastWfSyncArgs);
            }
          }
        }
      })
      .catch((err) => {
        wfVisualsPromise = null;
        throw err;
      });
  }
  return wfVisualsPromise;
}

export function loadInsightHub() {
  if (insightLoaded) return Promise.resolve();
  if (!insightPromise) {
    insightPromise = import('./insight-chunk.js')
      .then(() => {
        insightLoaded = true;
      })
      .catch((err) => {
        insightPromise = null;
        throw err;
      });
  }
  return insightPromise;
}

export function loadDiyWorkspace() {
  if (diyLoaded) return Promise.resolve();
  if (!diyPromise) {
    diyPromise = import('./diy-chunk.js')
      .then(() => {
        diyLoaded = true;
      })
      .catch((err) => {
        diyPromise = null;
        throw err;
      });
  }
  return diyPromise;
}

export function loadAiReviewSuite() {
  if (aiReviewLoaded) return Promise.resolve();
  if (!aiReviewPromise) {
    aiReviewPromise = import('./ai-review-chunk.js')
      .then(() => {
        aiReviewLoaded = true;
      })
      .catch((err) => {
        aiReviewPromise = null;
        throw err;
      });
  }
  return aiReviewPromise;
}

function makeProxy(loader, globalName, method) {
  return function (...args) {
    return loader().then(() => {
      const api = typeof window !== 'undefined' ? window[globalName] : null;
      if (api && !api.__isLazyProxy && typeof api[method] === 'function') {
        return api[method](...args);
      }
      return undefined;
    });
  };
}

if (typeof window !== 'undefined') {
  if (!window.TCM_DIY_STUDIO) {
    window.TCM_DIY_STUDIO = {
      __isLazyProxy: true,
      render: makeProxy(loadDiyWorkspace, 'TCM_DIY_STUDIO', 'render')
    };
  }
  if (!window.TCM_MISSION_OS) {
    window.TCM_MISSION_OS = {
      __isLazyProxy: true,
      render: makeProxy(loadDiyWorkspace, 'TCM_MISSION_OS', 'render'),
      applyThemeSkin: makeProxy(loadDiyWorkspace, 'TCM_MISSION_OS', 'applyThemeSkin')
    };
  }
  if (!window.TCM_USER_PLAN) {
    window.TCM_USER_PLAN = {
      __isLazyProxy: true,
      open: makeProxy(loadAiReviewSuite, 'TCM_USER_PLAN', 'open'),
      init: () => {},
      loadUserCases: () => {
        try { return JSON.parse(localStorage.getItem('tcm_user_archived_cases_v1') || '[]'); } catch (_) { return []; }
      },
      saveUserCases: makeProxy(loadAiReviewSuite, 'TCM_USER_PLAN', 'saveUserCases')
    };
  }
  if (!window.TCM_AI_REVIEW) {
    window.TCM_AI_REVIEW = {
      __isLazyProxy: true,
      PASS_SCORE: 90,
      open: makeProxy(loadAiReviewSuite, 'TCM_AI_REVIEW', 'open'),
      close: () => {
        const m = document.getElementById('v17AiReviewModal');
        if (m) { m.classList.add('hidden'); m.classList.remove('flex'); }
      },
      evaluateLocally: makeProxy(loadAiReviewSuite, 'TCM_AI_REVIEW', 'evaluateLocally')
    };
  }

  if (!window.TCM_STUDIO_V8) {
    window.TCM_STUDIO_V8 = {
      __isLazyProxy: true,
      init: () => {},
      sync: (...args) => {
        lastWfSyncArgs = args;
        const route = typeof document !== 'undefined' ? document.body?.dataset?.v16Route : '';
        if (route === 'workflow' || wfVisualsLoaded) {
          loadWorkflowVisuals();
        }
      }
    };
  }
  if (!window.TCM_V9) {
    window.TCM_V9 = {
      __isLazyProxy: true,
      sync: (...args) => {
        lastWfSyncArgs = args;
        const route = typeof document !== 'undefined' ? document.body?.dataset?.v16Route : '';
        if (route === 'workflow' || wfVisualsLoaded) {
          loadWorkflowVisuals();
        }
      }
    };
  }
  if (!window.TCM_V15_INSIGHT) {
    window.TCM_V15_INSIGHT = {
      __isLazyProxy: true,
      open: makeProxy(loadInsightHub, 'TCM_V15_INSIGHT', 'open'),
      close: () => {},
      refresh: makeProxy(loadInsightHub, 'TCM_V15_INSIGHT', 'refresh'),
      calculate: () => null
    };
  }

  const bindLazyTrigger = () => {
    const btn = document.getElementById('btnOpenUserPlanModal');
    if (btn && !btn.dataset.lazyBound) {
      btn.dataset.lazyBound = '1';
      btn.addEventListener('click', () => {
        if (window.TCM_USER_PLAN && window.TCM_USER_PLAN.__isLazyProxy) {
          window.TCM_USER_PLAN.open();
        }
      });
    }
    const fontBtn = document.getElementById('btnFontScale');
    if (fontBtn && !fontBtn.dataset.lazyBound) {
      fontBtn.dataset.lazyBound = '1';
      fontBtn.addEventListener('click', () => {
        if (!wfVisualsLoaded) loadWorkflowVisuals().then(() => fontBtn.click());
      }, { once: true });
    }
    const dockBtn = document.getElementById('btnToggleVisualDock');
    if (dockBtn && !dockBtn.dataset.lazyBound) {
      dockBtn.dataset.lazyBound = '1';
      dockBtn.addEventListener('click', () => {
        if (!wfVisualsLoaded) loadWorkflowVisuals();
      }, { once: true });
    }
    // 监听进入 workflow 路由时立即按需加载工坊可视化引擎
    if (typeof MutationObserver !== 'undefined' && document.body) {
      const obs = new MutationObserver(() => {
        if (document.body.dataset.v16Route === 'workflow') {
          loadWorkflowVisuals();
          obs.disconnect();
        }
      });
      obs.observe(document.body, { attributes: true, attributeFilter: ['data-v16-route'] });
    }
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindLazyTrigger, { once: true });
  } else {
    bindLazyTrigger();
  }
}
