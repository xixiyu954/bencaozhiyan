// 板块二/三/五（v23~v25）轻代理加载器：首屏零加载重交互代码，点击任意入口或触发成就事件时按需水合
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

  if (!window.TCM_V23_GAMEPLAY) {
    window.TCM_V23_GAMEPLAY = {
      __isLazyProxy: true,
      open: (tab = 'sandbox') => loadUpgradeSuite().then((m) => m.TCM_V23_GAMEPLAY.open(tab)),
      close: () => upgradeMod && upgradeMod.TCM_V23_GAMEPLAY.close()
    };
  }
  if (!window.TCM_V24_GAMIFICATION) {
    window.TCM_V24_GAMIFICATION = {
      __isLazyProxy: true,
      open: () => loadUpgradeSuite().then((m) => m.TCM_V24_GAMIFICATION.open()),
      close: () => upgradeMod && upgradeMod.TCM_V24_GAMIFICATION.close(),
      recordEvent: (detail) => loadUpgradeSuite().then((m) => m.recordEvent(detail))
    };
  }
  if (!window.TCM_V25_MENTOR) {
    window.TCM_V25_MENTOR = {
      __isLazyProxy: true,
      open: () => loadUpgradeSuite().then((m) => m.TCM_V25_MENTOR.open()),
      close: () => upgradeMod && upgradeMod.TCM_V25_MENTOR.close()
    };
  }

  // 全局监听成就事件：任何模块触发探索/通关/提问均自动记录 XP 与徽章
  window.addEventListener('tcm:achievement-event', (e) => {
    if (!e || !e.detail) return;
    loadUpgradeSuite().then((m) => m.recordEvent(e.detail)).catch(() => {});
  });

  if (window.TCM_V16_PORTAL && typeof window.TCM_V16_PORTAL.registerExtension === 'function') {
    window.TCM_V16_PORTAL.registerExtension({
      id: 'v23_gameplay',
      icon: '🎮',
      title: '自由配方沙盒 · 药厂风云录 · 每日一题',
      desc: '任意组合 119 味药材与溶剂装置，触发真实失败分支事故复盘卡，挑战 3 大药厂探案剧本与每日扰动题。',
      onOpen: () => window.TCM_V23_GAMEPLAY.open('sandbox')
    });
    window.TCM_V16_PORTAL.registerExtension({
      id: 'v24_gamification',
      icon: '🏆',
      title: '段位晋升 · 成就徽章 · 三本图鉴',
      desc: '记录从药材学徒到药学宗师的成长经验，收集 8 枚徽章及药材/装置/3D 分子图鉴，支持 JSON 随身导出。',
      onOpen: () => window.TCM_V24_GAMIFICATION.open()
    });
    window.TCM_V16_PORTAL.registerExtension({
      id: 'v25_mentor',
      icon: '🧑‍🏫',
      title: '24h AI 导师（苏格拉底引导 + 安全督察）',
      desc: '感知当前药材与工艺参数，支持苏格拉底启发式追问 / 直接解答一键切换与实时 MSDS 安全体检。',
      onOpen: () => window.TCM_V25_MENTOR.open()
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
