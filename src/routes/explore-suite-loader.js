// 板块四（4.1~4.5 知识图谱与可视化探索中心 v29）轻代理加载器：首屏零加载 90KB 图谱引擎，点击即时按需水合
let explorePromise = null;
let exploreLoaded = false;

function showExploreLoadingPill(show) {
  if (typeof document === 'undefined') return;
  let el = document.getElementById('tcmExploreLoadingPill');
  if (!show) {
    if (el) el.remove();
    return;
  }
  if (el) return;
  el = document.createElement('div');
  el.id = 'tcmExploreLoadingPill';
  el.className = 'no-print fixed bottom-16 left-5 z-50 px-3.5 py-2 rounded-full bg-[#062922]/95 text-emerald-100 text-xs font-extrabold border border-emerald-400/35 shadow-xl flex items-center gap-2';
  el.innerHTML = '<span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span><span>正在按需加载知识图谱与探索引擎…</span>';
  document.body.appendChild(el);
}

export function loadExploreSuite() {
  if (exploreLoaded) return Promise.resolve();
  if (!explorePromise) {
    showExploreLoadingPill(true);
    explorePromise = import('./explore-suite-chunk.js')
      .then(() => {
        exploreLoaded = true;
        showExploreLoadingPill(false);
      })
      .catch((err) => {
        explorePromise = null;
        showExploreLoadingPill(false);
        throw err;
      });
  }
  return explorePromise;
}

function initExploreProxy() {
  if (typeof window === 'undefined') return;
  if (!window.TCM_V29_EXPLORE) {
    window.TCM_V29_EXPLORE = {
      __isLazyProxy: true,
      open(tab) {
        return loadExploreSuite().then(() => {
          const api = window.TCM_V29_EXPLORE;
          if (api && !api.__isLazyProxy && typeof api.open === 'function') {
            return api.open(tab);
          }
          return undefined;
        });
      },
      close() {
        const m = document.getElementById('tcmV29ExploreModal');
        if (m) m.classList.remove('is-open');
      },
      getState() {
        return { open: false, tab: 'kg', lazyPending: true };
      }
    };
  }

  if (window.TCM_V16_PORTAL && typeof window.TCM_V16_PORTAL.registerExtension === 'function') {
    window.TCM_V16_PORTAL.registerExtension({
      id: 'v29_explore',
      icon: '🔭',
      title: '知识图谱与可视化探索中心（4.1~4.5）',
      desc: '4.1 中药化学知识图谱 · 4.2 极性三维宇宙 · 4.3 工艺流水线 · 4.4 导演时间轴 · 4.5 对比显微镜。',
      onOpen: () => window.TCM_V29_EXPLORE.open('kg')
    });
  }
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExploreProxy, { once: true });
  } else {
    initExploreProxy();
  }
}

export default loadExploreSuite;
