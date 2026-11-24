// 板块五（v24）轻代理加载器：首屏零加载，点击入口或触发成就事件时按需水合
let upgradePromise = null;
let upgradeMod = null;

export function loadUpgradeSuite() {
  if (upgradeMod) return Promise.resolve(upgradeMod);
  if (!upgradePromise) {
    upgradePromise = import('./upgrade-suite-chunk.js')
      .then((mod) => {
        upgradeMod = mod;
        return mod;
      })
      .catch((err) => {
        upgradePromise = null;
        throw err;
      });
  }
  return upgradePromise;
}

function initUpgradeProxies() {
  if (typeof window === 'undefined') return;

  if (!window.TCM_V24_GAMIFICATION) {
    window.TCM_V24_GAMIFICATION = {
      __isLazyProxy: true,
      open: () => loadUpgradeSuite().then((m) => m.TCM_V24_GAMIFICATION.open()),
      close: () => upgradeMod && upgradeMod.TCM_V24_GAMIFICATION.close(),
      recordEvent: (detail) => loadUpgradeSuite().then((m) => m.recordEvent(detail))
    };
  }

  // 全局监听成就事件：板块一等模块触发探索均自动记录 XP 与徽章
  window.addEventListener('tcm:achievement-event', (e) => {
    if (!e || !e.detail) return;
    loadUpgradeSuite().then((m) => m.recordEvent(e.detail)).catch(() => {});
  });

  if (window.TCM_V16_PORTAL && typeof window.TCM_V16_PORTAL.registerExtension === 'function') {
    window.TCM_V16_PORTAL.registerExtension({
      id: 'v24_gamification',
      icon: '🏆',
      title: '段位晋升 · 成就徽章 · 三本图鉴',
      desc: '记录从药材学徒到药学宗师的成长经验，收集徽章及药材/装置/3D 分子图鉴，支持 JSON 随身导出。',
      onOpen: () => window.TCM_V24_GAMIFICATION.open()
    });
  }
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUpgradeProxies, { once: true });
  } else {
    initUpgradeProxies();
  }
}
