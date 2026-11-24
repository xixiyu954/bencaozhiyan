// 板块一（v20~v22）轻代理加载器：首屏零加载 3D 渲染引擎与 Three.js，点击任意入口或成分名即时按需水合
let visualSuitePromise = null;
let visualSuiteLoaded = false;
let vlab3dPromise = null;

export function loadVlab3d() {
  if (typeof window !== 'undefined' && window.TCM_V22_VLAB3D) {
    return Promise.resolve(window.TCM_V22_VLAB3D);
  }
  if (!vlab3dPromise) {
    vlab3dPromise = import('../modules/lab-v22-vlab3d.js')
      .then(() => (typeof window !== 'undefined' ? window.TCM_V22_VLAB3D : null))
      .catch((err) => {
        vlab3dPromise = null;
        throw err;
      });
  }
  return vlab3dPromise;
}

function showSuiteLoadingToast(show) {
  if (typeof document === 'undefined') return;
  let el = document.getElementById('tcmVisualSuiteLoadingPill');
  if (!show) {
    if (el) el.remove();
    return;
  }
  if (el) return;
  el = document.createElement('div');
  el.id = 'tcmVisualSuiteLoadingPill';
  el.className = 'no-print fixed bottom-16 right-5 z-50 px-3.5 py-2 rounded-full bg-[#062922]/95 text-emerald-100 text-xs font-extrabold border border-emerald-400/35 shadow-xl flex items-center gap-2';
  el.innerHTML = '<span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span><span>正在按需加载 3D 实验室引擎…</span>';
  document.body.appendChild(el);
}

export function loadVisualSuite() {
  if (visualSuiteLoaded) return Promise.resolve();
  if (!visualSuitePromise) {
    showSuiteLoadingToast(true);
    visualSuitePromise = import('./visual-suite-chunk.js')
      .then(() => {
        visualSuiteLoaded = true;
        showSuiteLoadingToast(false);
      })
      .catch((err) => {
        visualSuitePromise = null;
        showSuiteLoadingToast(false);
        throw err;
      });
  }
  return visualSuitePromise;
}

function forwardVisual(globalName, method) {
  return function (...args) {
    return loadVisualSuite().then(() => {
      const api = typeof window !== 'undefined' ? window[globalName] : null;
      if (api && !api.__isLazyProxy && typeof api[method] === 'function') {
        return api[method](...args);
      }
      return undefined;
    });
  };
}

// 1.2 轻量化成分-3D模型映射注册表（首屏常驻 <1.5 KB，供药材题库页与工坊 Step 1 成分名点击联动）
const MOL3D_ENTRIES = [
  { key: 'tanshinone', label: '丹参酮IIA', pattern: /丹参酮[ⅡI]{1,2}A|丹参酮IIA|丹参酮/g, herbRe: /丹参/ },
  { key: 'baicalin', label: '黄芩苷', pattern: /黄芩苷|黄芩甙/g, herbRe: /黄芩/ },
  { key: 'berberine', label: '小檗碱', pattern: /盐酸小檗碱|小檗碱|黄连素/g, herbRe: /黄连|黄柏|三颗针/ },
  { key: 'menthol', label: '薄荷脑', pattern: /左旋薄荷脑|薄荷脑|薄荷醇/g, herbRe: /薄荷/ },
  { key: 'chlorogenic', label: '绿原酸', pattern: /绿原酸/g, herbRe: /金银花|杜仲叶|茵陈/ },
  { key: 'quercetin', label: '槲皮素', pattern: /槲皮素苷元|槲皮素/g, herbRe: /银杏|槐米|桑叶/ }
];

const COMBINED_MOL_RE = /(丹参酮[ⅡI]{1,2}A|丹参酮IIA|丹参酮|黄芩苷|黄芩甙|盐酸小檗碱|小檗碱|黄连素|左旋薄荷脑|薄荷脑|薄荷醇|绿原酸|槲皮素苷元|槲皮素)/g;

function lookupKeyByToken(token) {
  for (const e of MOL3D_ENTRIES) {
    e.pattern.lastIndex = 0;
    if (e.pattern.test(token)) return e.key;
  }
  return null;
}

function createMol3dRegistry() {
  return {
    entries: MOL3D_ENTRIES,
    matchKey(text) {
      const s = String(text || '');
      for (const e of MOL3D_ENTRIES) {
        e.pattern.lastIndex = 0;
        if (e.pattern.test(s) || e.herbRe.test(s)) return e.key;
      }
      return null;
    },
    matchAll(text) {
      const s = String(text || '');
      const seen = new Set();
      const out = [];
      for (const e of MOL3D_ENTRIES) {
        e.pattern.lastIndex = 0;
        if (e.pattern.test(s) && !seen.has(e.key)) {
          seen.add(e.key);
          out.push({ key: e.key, label: e.label });
        }
      }
      return out;
    },
    linkifyHtml(escapedText, opts = {}) {
      const s = String(escapedText || '');
      if (!s) return s;
      const tag = opts.inlineSpan ? 'span' : 'button';
      const extraAttrs = opts.inlineSpan
        ? 'role="button" tabindex="0"'
        : 'type="button"';
      COMBINED_MOL_RE.lastIndex = 0;
      return s.replace(COMBINED_MOL_RE, (match) => {
        const key = lookupKeyByToken(match);
        if (!key) return match;
        return `<${tag} ${extraAttrs} class="tcm-mol3d-link" data-mol3d-open="${key}" title="点击查看 ${match} 3D 分子结构与官能团高亮"><span class="tcm-mol3d-link-ico" aria-hidden="true">🧬</span>${match}</${tag}>`;
      });
    }
  };
}

function injectMol3dLinkStyles() {
  if (typeof document === 'undefined' || document.getElementById('tcmMol3dLinkStyles')) return;
  const style = document.createElement('style');
  style.id = 'tcmMol3dLinkStyles';
  style.textContent = `
    .tcm-mol3d-link {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      padding: 0 5px;
      margin: 0 1px;
      border-radius: 6px;
      border: 1px solid rgba(5, 150, 105, 0.35);
      background: rgba(16, 185, 129, 0.10);
      color: #047857;
      font-weight: 800;
      font-size: inherit;
      line-height: 1.35;
      cursor: pointer;
      vertical-align: baseline;
      transition: background 140ms ease, border-color 140ms ease, transform 120ms ease;
    }
    .tcm-mol3d-link:hover, .tcm-mol3d-link:focus-visible {
      background: rgba(5, 150, 105, 0.20);
      border-color: #059669;
      transform: translateY(-0.5px);
      outline: none;
    }
    .tcm-mol3d-link-ico {
      font-size: 0.85em;
      line-height: 1;
    }
    body.dark-lab .tcm-mol3d-link,
    body.dark-mode .tcm-mol3d-link,
    html.dark .tcm-mol3d-link {
      background: rgba(16, 185, 129, 0.18);
      border-color: rgba(52, 211, 153, 0.45);
      color: #6ee7b7;
    }
    body.dark-lab .tcm-mol3d-link:hover,
    body.dark-mode .tcm-mol3d-link:hover,
    html.dark .tcm-mol3d-link:hover {
      background: rgba(16, 185, 129, 0.30);
    }
    body.dark-lab #tcmV20VisualModal > div,
    body.dark-lab #tcmV22Modal > div {
      background: #0d1f1d !important;
      border-color: #1e3f3a !important;
      color: #e2f1ed !important;
    }
    body.dark-lab #tcmV20VisualModal [class*="bg-[#f6f8f7]"],
    body.dark-lab #tcmV22Modal [class*="bg-[#f6f8f7]"] {
      background: #122926 !important;
      border-color: #1e3f3a !important;
    }
    body.dark-lab #tcmV20VisualModal button[data-v20-mol]:not([class*="bg-[#059669]"]),
    body.dark-lab #tcmV20VisualModal button[data-v20-mode]:not([class*="bg-[#ea580c]"]),
    body.dark-lab #tcmV20VisualModal button[data-v20-fg],
    body.dark-lab #tcmV22Modal button[data-v22-tab]:not([class*="bg-[#064e3b]"]) {
      background: #132c29 !important;
      color: #e2e8f0 !important;
      border-color: #244a44 !important;
    }
    body.dark-lab #tcmV20VisualModal button[data-v20-fg] {
      background: #0f2925 !important;
      color: #d1fae5 !important;
    }
    body.dark-lab #tcmV22Modal .bg-slate-100,
    body.dark-lab #tcmV22Modal .bg-slate-50 {
      background-color: #15342f !important;
      color: #cbd5e1 !important;
      border-color: #244a44 !important;
    }
    body.dark-lab #tcmV22Modal .bg-amber-50,
    body.dark-lab #tcmV22Modal [class*="bg-amber-50"] {
      background-color: rgba(245, 158, 11, 0.16) !important;
      border-color: rgba(251, 191, 36, 0.45) !important;
      color: #fef3c7 !important;
    }
    body.dark-lab #tcmV22Modal .bg-emerald-50,
    body.dark-lab #tcmV22Modal [class*="bg-emerald-50"] {
      background-color: rgba(16, 185, 129, 0.16) !important;
      border-color: rgba(52, 211, 153, 0.35) !important;
      color: #d1fae5 !important;
    }
    body.dark-lab #tcmV22Modal button[data-vlab-goto],
    body.dark-lab #tcmV22Modal button[data-vlab-pad],
    body.dark-lab #tcmV22Modal #vlab3dBtnReset {
      background-color: #132c29 !important;
      color: #e2f1ed !important;
      border-color: #244a44 !important;
    }
    body.dark-lab #tcmV22Modal .text-slate-800,
    body.dark-lab #tcmV22Modal .text-slate-900 {
      color: #f0fdfa !important;
    }
    body.dark-lab #tcmV22Modal .text-slate-600,
    body.dark-lab #tcmV22Modal .text-slate-500 {
      color: #94a3b8 !important;
    }
  `;
  document.head.appendChild(style);
}

function bindGlobalMol3dLinkDelegation() {
  if (typeof document === 'undefined' || document.__tcmMol3dDelegated) return;
  document.__tcmMol3dDelegated = true;
  document.addEventListener('click', (e) => {
    const trigger = e.target && e.target.closest ? e.target.closest('[data-mol3d-open]') : null;
    if (!trigger) return;
    e.preventDefault();
    e.stopPropagation();
    const key = trigger.getAttribute('data-mol3d-open');
    if (window.TCM_V20_VISUALS && typeof window.TCM_V20_VISUALS.openMol3d === 'function') {
      window.TCM_V20_VISUALS.openMol3d(key);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const trigger = e.target && e.target.closest ? e.target.closest('span[data-mol3d-open]') : null;
    if (!trigger) return;
    e.preventDefault();
    e.stopPropagation();
    const key = trigger.getAttribute('data-mol3d-open');
    if (window.TCM_V20_VISUALS && typeof window.TCM_V20_VISUALS.openMol3d === 'function') {
      window.TCM_V20_VISUALS.openMol3d(key);
    }
  });
}

function mountBentoFabDock() {
  if (typeof document === 'undefined' || document.getElementById('tcmV22FabDock')) return;
  const dock = document.createElement('div');
  dock.id = 'tcmV22FabDock';
  dock.className = 'v22-fab-dock no-print';
  dock.innerHTML =
    '<div class="v22-fab-tray" id="v22FabTray" hidden>' +
      '<button type="button" class="v22-fab-btn accent" data-v22-open="vlab">🕹️ 3D 虚拟实验室</button>' +
      '<button type="button" class="v22-fab-btn" data-v22-open="fluid">🌊 流体仿真</button>' +
      '<button type="button" class="v22-fab-btn" data-v22-open="ar">📱 AR 药材卡</button>' +
      '<button type="button" class="v22-fab-btn" id="v22BtnPresent">🖥️ 投影模式</button>' +
      '<button type="button" class="v22-fab-btn" id="v24BtnOpenGrowth">🏆 段位图鉴</button>' +
    '</div>' +
    '<button type="button" class="v22-fab-toggle" id="v22FabToggle" aria-expanded="false" aria-controls="v22FabTray">' +
      '<span class="v22-fab-toggle-dot" aria-hidden="true"></span><span>扩展舱</span>' +
    '</button>';

  const tray = dock.querySelector('#v22FabTray');
  const toggleBtn = dock.querySelector('#v22FabToggle');
  const setOpen = (open) => {
    tray.hidden = !open;
    dock.classList.toggle('is-open', open);
    toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  dock.addEventListener('click', (e) => {
    if (e.target.closest('#v22FabToggle')) {
      setOpen(tray.hidden);
      return;
    }
    const openBtn = e.target.closest('[data-v22-open]');
    if (openBtn) {
      const tab = openBtn.getAttribute('data-v22-open');
      setOpen(false);
      window.TCM_V22_VISUAL_SUITE.open(tab);
      return;
    }
    if (e.target.closest('#v22BtnPresent')) {
      setOpen(false);
      window.TCM_V22_VISUAL_SUITE.togglePresentMode();
      return;
    }
    if (e.target.closest('#v24BtnOpenGrowth') && window.TCM_V24_GAMIFICATION) {
      setOpen(false);
      window.TCM_V24_GAMIFICATION.open();
    }
  });

  document.addEventListener('click', (e) => {
    if (!tray.hidden && !dock.contains(e.target)) setOpen(false);
  });

  document.body.appendChild(dock);
}

function mountStepQuickButtons() {
  if (typeof document === 'undefined') return;
  const s1Title = document.getElementById('s1HerbTitle');
  if (s1Title && s1Title.parentNode && !document.getElementById('v20BtnQuickMol')) {
    const btn = document.createElement('button');
    btn.id = 'v20BtnQuickMol';
    btn.type = 'button';
    btn.className = 'mt-1.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-extrabold transition';
    btn.textContent = '🧬 查看 3D 分子结构库';
    btn.addEventListener('click', () => {
      const txt = (s1Title.textContent || '') + ' ' + ((document.getElementById('s1Chem') && document.getElementById('s1Chem').textContent) || '');
      const reg = window.TCM_MOL3D_REGISTRY;
      const key = (reg && reg.matchKey(txt)) || 'tanshinone';
      window.TCM_V20_VISUALS.openMol3d(key);
    });
    s1Title.parentNode.appendChild(btn);
  }

  const s3Card = document.getElementById('step3FourSpectraCard');
  if (s3Card && s3Card.innerHTML.trim() && !document.getElementById('v21BtnOpenFromS3')) {
    const bar = document.createElement('div');
    bar.id = 'v21BtnOpenFromS3';
    bar.className = 'pt-2 flex justify-end';
    bar.innerHTML = '<button type="button" class="px-3.5 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-extrabold transition">🌈 启动交互式四谱缩放 & 猜峰小游戏 →</button>';
    bar.querySelector('button').addEventListener('click', () => {
      const catText = (document.getElementById('cfgCategory') && document.getElementById('cfgCategory').textContent) || '';
      const cat = /生物碱/.test(catText) ? '生物碱' : (/蒽醌/.test(catText) ? '蒽醌与醌类' : '黄酮');
      window.TCM_V21_SPECTRA_LAB.open(cat);
    });
    s3Card.appendChild(bar);
  }
}

function initVisualProxies() {
  if (typeof window === 'undefined') return;

  if (!window.TCM_MOL3D_REGISTRY) {
    window.TCM_MOL3D_REGISTRY = createMol3dRegistry();
  }
  injectMol3dLinkStyles();
  bindGlobalMol3dLinkDelegation();

  if (!window.TCM_V20_VISUALS) {
    window.TCM_V20_VISUALS = {
      __isLazyProxy: true,
      version: '2.0.0-vite-lazy',
      openMol3d: forwardVisual('TCM_V20_VISUALS', 'openMol3d'),
      openParticles: forwardVisual('TCM_V20_VISUALS', 'openParticles')
    };
  }
  if (!window.TCM_V21_SPECTRA_LAB) {
    window.TCM_V21_SPECTRA_LAB = {
      __isLazyProxy: true,
      version: '1.1.0-vite-lazy',
      open: forwardVisual('TCM_V21_SPECTRA_LAB', 'open')
    };
  }
  if (!window.TCM_V22_VISUAL_SUITE) {
    window.TCM_V22_VISUAL_SUITE = {
      __isLazyProxy: true,
      version: '1.3.0-vite-lazy',
      open: forwardVisual('TCM_V22_VISUAL_SUITE', 'open'),
      togglePresentMode: forwardVisual('TCM_V22_VISUAL_SUITE', 'togglePresentMode')
    };
  }

  if (window.TCM_V16_PORTAL && typeof window.TCM_V16_PORTAL.registerExtension === 'function') {
    window.TCM_V16_PORTAL.registerExtension({
      id: 'v20_mol3d',
      icon: '🧬',
      title: '3D 分子结构与粒子显色台',
      desc: '基于 PubChem 真实 3D 构象：薄荷脑、丹参酮IIA、黄芩苷、小檗碱、绿原酸、槲皮素（官能团高亮与三模式切换）。',
      onOpen: () => window.TCM_V20_VISUALS.openMol3d('tanshinone')
    });
    window.TCM_V16_PORTAL.registerExtension({
      id: 'v21_spectra',
      icon: '🌈',
      title: '交互式四谱工作站 & 猜峰挑战',
      desc: 'UV / IR / ¹H-NMR / MS 可缩放谱图与悬停归属解析，内置猜峰小游戏。',
      onOpen: () => window.TCM_V21_SPECTRA_LAB.open('黄酮')
    });
    window.TCM_V16_PORTAL.registerExtension({
      id: 'v22_visual_suite',
      icon: '🕹️',
      title: '3D 第一人称虚拟实验室 & 流体/AR 体验舱',
      desc: '基于 Three.js 构建 10m×8m 实景 3D 实验室与丹参 7 步回流 SOP，内置安全互锁、流体仿真与 AR 药材卡。',
      onOpen: () => window.TCM_V22_VISUAL_SUITE.open('vlab')
    });
  }

  mountBentoFabDock();
  mountStepQuickButtons();

  const s3Card = document.getElementById('step3FourSpectraCard');
  if (s3Card && typeof MutationObserver !== 'undefined') {
    new MutationObserver(() => mountStepQuickButtons()).observe(s3Card, { childList: true });
  }
}

if (typeof window !== 'undefined') {
  // 立即暴露注册表与 3D 实验室二级懒加载器（保持 suite-visuals 与 vendor-three 均首屏零加载）
  window.TCM_MOL3D_REGISTRY = createMol3dRegistry();
  window.__loadTcmVlab3d = loadVlab3d;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVisualProxies, { once: true });
  } else {
    initVisualProxies();
  }
}
