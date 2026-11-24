// 板块一（v20~v22）轻代理加载器：首屏零加载 76 KB 渲染引擎，点击任意入口即时按需水合
let visualSuitePromise = null;
let visualSuiteLoaded = false;

export function loadVisualSuite() {
  if (visualSuiteLoaded) return Promise.resolve();
  if (!visualSuitePromise) {
    visualSuitePromise = import('./visual-suite-chunk.js')
      .then(() => {
        visualSuiteLoaded = true;
      })
      .catch((err) => {
        visualSuitePromise = null;
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

function mountBentoFabDock() {
  if (typeof document === 'undefined' || document.getElementById('tcmV22FabDock')) return;
  const dock = document.createElement('div');
  dock.id = 'tcmV22FabDock';
  dock.className = 'v22-fab-dock no-print';
  dock.innerHTML =
    '<button type="button" class="v22-fab-btn accent" data-v22-open="vlab">🕹️ 虚拟实验室</button>' +
    '<button type="button" class="v22-fab-btn" data-v22-open="fluid">🌊 流体仿真</button>' +
    '<button type="button" class="v22-fab-btn" data-v22-open="ar">📱 AR 药材卡</button>' +
    '<button type="button" class="v22-fab-btn" id="v22BtnPresent">🖥️ 投影模式</button>' +
    '<button type="button" class="v22-fab-btn" id="v23BtnOpenPlay">🎮 配方沙盒 & 闯关</button>' +
    '<button type="button" class="v22-fab-btn" id="v24BtnOpenGrowth">🏆 段位图鉴</button>' +
    '<button type="button" class="v22-fab-btn" id="v25BtnOpenMentor">🧑‍🏫 问导师</button>';

  dock.addEventListener('click', (e) => {
    const openBtn = e.target.closest('[data-v22-open]');
    if (openBtn) {
      const tab = openBtn.getAttribute('data-v22-open');
      window.TCM_V22_VISUAL_SUITE.open(tab);
      return;
    }
    if (e.target.closest('#v22BtnPresent')) {
      window.TCM_V22_VISUAL_SUITE.togglePresentMode();
      return;
    }
    if (e.target.closest('#v23BtnOpenPlay') && window.TCM_V23_GAMEPLAY) {
      window.TCM_V23_GAMEPLAY.open('sandbox');
      return;
    }
    if (e.target.closest('#v24BtnOpenGrowth') && window.TCM_V24_GAMIFICATION) {
      window.TCM_V24_GAMIFICATION.open();
      return;
    }
    if (e.target.closest('#v25BtnOpenMentor') && window.TCM_V25_MENTOR) {
      window.TCM_V25_MENTOR.open();
    }
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
    btn.textContent = '🧬 查看 3D 分子与粒子显色';
    btn.addEventListener('click', () => {
      const txt = s1Title.textContent || '';
      const key = /丹参/.test(txt) ? 'tanshinone' : (/黄芩/.test(txt) ? 'baicalin' : (/黄连|小檗/.test(txt) ? 'berberine' : 'menthol'));
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

  if (!window.TCM_V20_VISUALS) {
    window.TCM_V20_VISUALS = {
      __isLazyProxy: true,
      version: '1.1.0-vite-lazy',
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
      version: '1.1.0-vite-lazy',
      open: forwardVisual('TCM_V22_VISUAL_SUITE', 'open'),
      togglePresentMode: forwardVisual('TCM_V22_VISUAL_SUITE', 'togglePresentMode')
    };
  }

  if (window.TCM_V16_PORTAL && typeof window.TCM_V16_PORTAL.registerExtension === 'function') {
    window.TCM_V16_PORTAL.registerExtension({
      id: 'v20_mol3d',
      icon: '🧬',
      title: '3D 分子结构与粒子显色台',
      desc: '360° 旋转观察丹参酮、黄芩苷、薄荷脑、小檗碱立体构象，体验粒子级滴加显色动画。',
      onOpen: () => window.TCM_V20_VISUALS.openMol3d('menthol')
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
      title: '虚拟实验室 & 流体/AR 体验舱',
      desc: '包含 WASD 虚拟实验室、两相分层/乳化/滴定流体仿真及 AR 药材卡。',
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
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVisualProxies, { once: true });
  } else {
    initVisualProxies();
  }
}
