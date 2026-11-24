// 八阶段产业转化工作区按需路由代理（首屏仅 ~1 KB，切换到 translation 工作区时动态加载 175 KB 引擎与数据）
let loadPromise = null;
let loadedApi = null;

function showLoadingPlaceholder() {
  const host = typeof document !== 'undefined' ? document.getElementById('v18TranslationPage') : null;
  if (host && !host.innerHTML.trim()) {
    host.innerHTML = '<div class="rounded-3xl bg-white border border-slate-200 p-8 text-center text-sm text-slate-500">正在按需加载「八阶段产业转化引擎」...</div>';
  }
}

export function loadTranslationWorkspace() {
  if (loadedApi) return Promise.resolve(loadedApi);
  if (!loadPromise) {
    showLoadingPlaceholder();
    loadPromise = import('./translation-chunk.js')
      .then((mod) => {
        loadedApi = (typeof window !== 'undefined' && window.TCM_TRANSLATION) || mod.default;
        return loadedApi;
      })
      .catch((err) => {
        loadPromise = null;
        throw err;
      });
  }
  return loadPromise;
}

function forward(method) {
  return function (...args) {
    if (loadedApi && typeof loadedApi[method] === 'function') {
      return loadedApi[method](...args);
    }
    return loadTranslationWorkspace().then((api) => {
      if (api && typeof api[method] === 'function') {
        return api[method](...args);
      }
      return undefined;
    });
  };
}

const translationProxy = {
  __isLazyProxy: true,
  load: loadTranslationWorkspace,
  init: forward('init'),
  render: forward('render'),
  openProject: forward('openProject'),
  importBankTopic: forward('importBankTopic'),
  openDeviation: forward('openDeviation'),
  openReport: forward('openReport'),
  getState: () => (loadedApi && typeof loadedApi.getState === 'function' ? loadedApi.getState() : null)
};

if (typeof window !== 'undefined' && !window.TCM_TRANSLATION) {
  window.TCM_TRANSLATION = translationProxy;
}

export default translationProxy;
