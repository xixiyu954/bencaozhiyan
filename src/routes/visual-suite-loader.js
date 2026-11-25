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

// 1.2 全题库 136 味药材 × 65 项 PubChem 3D 分子映射注册表（首屏轻量化常驻，点击任意成分名即时按需水合 3D 分子库）
const MOL3D_ENTRIES = [
  { key: 'tanshinone', label: '丹参酮IIA', pattern: /丹参酮[ⅡI]{1,2}A|丹参酮IIA|丹参酮/g, herbRe: /丹参(?!.*水溶)/ },
  { key: 'baicalin', label: '黄芩苷', pattern: /黄芩苷|黄芩甙|黄芩素/g, herbRe: /黄芩|黄连解毒汤/ },
  { key: 'berberine', label: '小檗碱', pattern: /盐酸小檗碱|小檗碱|黄连素|巴马汀/g, herbRe: /黄连|黄柏|三颗针/ },
  { key: 'menthol', label: '薄荷脑', pattern: /左旋薄荷脑|薄荷脑|薄荷醇/g, herbRe: /薄荷|逍遥散/ },
  { key: 'chlorogenic', label: '绿原酸', pattern: /绿原酸/g, herbRe: /金银花|杜仲叶|茵陈/ },
  { key: 'quercetin', label: '槲皮素', pattern: /槲皮素苷元|槲皮素/g, herbRe: /银杏叶|槲皮|流苏石斛/ },
  { key: 'rutin', label: '芦丁', pattern: /芦丁|芸香苷/g, herbRe: /槐米/ },
  { key: 'puerarin', label: '葛根素', pattern: /葛根素/g, herbRe: /葛根/ },
  { key: 'hesperidin', label: '橙皮苷', pattern: /橙皮苷/g, herbRe: /陈皮/ },
  { key: 'nobiletin', label: '川陈皮素', pattern: /川陈皮素|橘皮素|多甲氧基黄酮/g, herbRe: /川陈皮素/ },
  { key: 'icaritin', label: '淫羊藿素', pattern: /淫羊藿苷|朝藿定\s*C|宝藿苷[ⅠI]|脱水淫羊藿素/g, herbRe: /淫羊藿/ },
  { key: 'daidzein', label: '大豆苷元', pattern: /大豆苷元|染料木素/g, herbRe: /大豆|淡豆豉/ },
  { key: 'silybin', label: '水飞蓟宾', pattern: /水飞蓟宾|水飞蓟素/g, herbRe: /水飞蓟/ },
  { key: 'vitexin', label: '牡荆素', pattern: /牡荆素鼠李糖苷|牡荆素|羟基红花黄色素\s*A/g, herbRe: /山楂叶|红花/ },
  { key: 'eugenol', label: '丁香酚', pattern: /(?<!甲基)丁香酚/g, herbRe: /^丁香/ },
  { key: 'methyleugenol', label: '甲基丁香酚', pattern: /甲基丁香酚|黄樟醚/g, herbRe: /细辛/ },
  { key: 'cinnamaldehyde', label: '桂皮醛', pattern: /桂皮醛|肉桂醛/g, herbRe: /肉桂/ },
  { key: 'ligustilide', label: '藁本内酯', pattern: /藁本内酯/g, herbRe: /当归(?!.*阿魏酸)/ },
  { key: 'patchoulol', label: '百秋李醇', pattern: /百秋李醇|广藿香醇/g, herbRe: /广藿香/ },
  { key: 'curcumol', label: '莪术醇', pattern: /莪术醇/g, herbRe: /莪术/ },
  { key: 'paeonol', label: '丹皮酚', pattern: /丹皮酚|牡丹酚/g, herbRe: /牡丹皮/ },
  { key: 'eucalyptol', label: '桉油精', pattern: /桉油精|异泽兰黄素/g, herbRe: /艾叶/ },
  { key: 'atractylenolide_i', label: '白术内酯I', pattern: /白术内酯[ⅠIⅢ]*/g, herbRe: /白术/ },
  { key: 'muscone', label: '麝香酮', pattern: /麝香酮/g, herbRe: /麝香/ },
  { key: 'borneol', label: '冰片', pattern: /冰片|龙脑/g, herbRe: /冰片/ },
  { key: 'artemisinin', label: '青蒿素', pattern: /青蒿素/g, herbRe: /青蒿/ },
  { key: 'geniposide', label: '栀子苷', pattern: /栀子苷|西红花苷/g, herbRe: /栀子|西红花/ },
  { key: 'andrographolide', label: '穿心莲内酯', pattern: /穿心莲内酯/g, herbRe: /穿心莲/ },
  { key: 'ginkgolide_b', label: '银杏内酯B', pattern: /银杏内酯[A-C\s/]*/g, herbRe: /银杏内酯/ },
  { key: 'gentiopicroside', label: '龙胆苦苷', pattern: /龙胆苦苷/g, herbRe: /龙胆/ },
  { key: 'oridonin', label: '冬凌草甲素', pattern: /冬凌草甲素/g, herbRe: /冬凌草/ },
  { key: 'paeoniflorin', label: '芍药苷', pattern: /芍药苷/g, herbRe: /白芍/ },
  { key: 'triptolide', label: '雷公藤甲素', pattern: /雷公藤甲素/g, herbRe: /雷公藤/ },
  { key: 'baccatin_iii', label: '紫杉烷母核', pattern: /紫杉醇|巴卡亭[ⅢI]+|10-DAB/g, herbRe: /红豆杉/ },
  { key: 'matrine', label: '苦参碱', pattern: /氧化苦参碱|苦参碱/g, herbRe: /苦参/ },
  { key: 'ephedrine', label: '麻黄碱', pattern: /盐酸麻黄碱|伪麻黄碱|麻黄碱/g, herbRe: /麻黄/ },
  { key: 'tetrahydropalmatine', label: '延胡索乙素', pattern: /延胡索乙素|四氢巴马汀/g, herbRe: /延胡索/ },
  { key: 'tetrandrine', label: '粉防己碱', pattern: /粉防己碱|千金藤素/g, herbRe: /防己|千金藤/ },
  { key: 'scopolamine', label: '东莨菪碱', pattern: /东莨菪碱/g, herbRe: /洋金花/ },
  { key: 'evodiamine', label: '吴茱萸碱', pattern: /吴茱萸碱/g, herbRe: /吴茱萸/ },
  { key: 'sinomenine', label: '青藤碱', pattern: /青藤碱/g, herbRe: /青风藤/ },
  { key: 'caffeine', label: '咖啡因', pattern: /咖啡因/g, herbRe: /绿茶/ },
  { key: 'ligustrazine', label: '川芎嗪', pattern: /川芎嗪/g, herbRe: /川芎/ },
  { key: 'huperzine_a', label: '石杉碱甲', pattern: /石杉碱甲|Huperzine\s*A/g, herbRe: /千层塔|蛇足石杉/ },
  { key: 'camptothecin', label: '喜树碱', pattern: /喜树碱/g, herbRe: /喜树果/ },
  { key: 'strychnine', label: '士的宁', pattern: /士的宁|马钱子碱|长春碱|长春新碱/g, herbRe: /马钱子|长春花/ },
  { key: 'dnj', label: 'DNJ', pattern: /1-脱氧野尻霉素|\bDNJ\b/g, herbRe: /桑叶/ },
  { key: 'aconine_core', label: '乌头原碱', pattern: /苯甲酰新乌头原碱|乌头碱|乌头原碱/g, herbRe: /附子/ },
  { key: 'emodin', label: '大黄素', pattern: /大黄素|番泻苷/g, herbRe: /大黄|番泻叶/ },
  { key: 'rhein', label: '大黄酸', pattern: /大黄酸/g, herbRe: /大黄酸/ },
  { key: 'chrysophanol', label: '大黄酚', pattern: /大黄酚|橙黄决明素/g, herbRe: /决明子/ },
  { key: 'resveratrol', label: '白藜芦醇', pattern: /白藜芦醇|虎杖苷/g, herbRe: /虎杖/ },
  { key: 'shikonin', label: '紫草素', pattern: /左旋紫草素|紫草素/g, herbRe: /紫草/ },
  { key: 'esculin', label: '秦皮甲素', pattern: /秦皮甲素|秦皮乙素|七叶苷/g, herbRe: /秦皮/ },
  { key: 'osthole', label: '蛇床子素', pattern: /蛇床子素/g, herbRe: /蛇床子/ },
  { key: 'psoralen', label: '补骨脂素', pattern: /异补骨脂素|补骨脂素/g, herbRe: /补骨脂/ },
  { key: 'imperatorin', label: '欧前胡素', pattern: /异欧前胡素|欧前胡素|白花前胡甲素/g, herbRe: /白芷|前胡/ },
  { key: 'schisandrin', label: '五味子醇甲', pattern: /五味子醇甲|五味子乙素/g, herbRe: /五味子/ },
  { key: 'phillyrin', label: '连翘苷', pattern: /连翘酯苷\s*A|连翘苷|松脂醇二葡萄糖苷/g, herbRe: /连翘|杜仲(?!叶)/ },
  { key: 'magnolol', label: '厚朴酚', pattern: /和厚朴酚|厚朴酚/g, herbRe: /厚朴/ },
  { key: 'arctigenin', label: '牛蒡苷元', pattern: /牛蒡苷元|牛蒡苷/g, herbRe: /牛蒡子/ },
  { key: 'ferulic', label: '阿魏酸', pattern: /阿魏酸|滨蒿内酯/g, herbRe: /阿魏酸/ },
  { key: 'curcumin', label: '姜黄素', pattern: /去甲氧基姜黄素|姜黄素/g, herbRe: /姜黄/ },
  { key: 'shikimic', label: '莽草酸', pattern: /莽草酸/g, herbRe: /八角茴香/ },
  { key: 'gastrodin', label: '天麻素', pattern: /天麻素|红景天苷/g, herbRe: /天麻|红景天/ },
  { key: 'rosmarinic', label: '迷迭香酸', pattern: /迷迭香酸|丹酚酸\s*B/g, herbRe: /夏枯草|丹参\(水溶/ },
  { key: 'aspirin', label: '乙酰水杨酸', pattern: /乙酰水杨酸|水杨苷|阿司匹林/g, herbRe: /柳树皮/ },
  { key: 'gallic', label: '没食子酸', pattern: /没食子酸|五倍子鞣酸|茶多酚/g, herbRe: /五倍子/ },
  { key: 'glycyrrhetinic', label: '甘草次酸', pattern: /甘草酸单铵盐|甘草酸|甘草次酸/g, herbRe: /甘草/ },
  { key: 'protopanaxadiol', label: '原人参二醇', pattern: /人参皂苷\s*Rg1|三七总皂苷|西洋参皂苷|原人参二醇/g, herbRe: /人参|三七|西洋参/ },
  { key: 'ursolic', label: '熊果酸', pattern: /熊果酸|柴胡皂苷|桔梗皂苷D|茯苓酸|灵芝酸A/g, herbRe: /柴胡|桔梗|茯苓|灵芝/ },
  { key: 'cycloastragenol', label: '环黄芪醇', pattern: /黄芪甲苷|环黄芪醇/g, herbRe: /黄芪(?!\(多糖)/ },
  { key: 'diosgenin', label: '薯蓣皂苷元', pattern: /薯蓣皂苷元|重楼皂苷|麦冬皂苷D|知母皂苷/g, herbRe: /穿山龙|重楼|麦冬|知母/ },
  { key: 'cinobufagin', label: '华蟾酥毒基', pattern: /华蟾酥毒基|杠柳毒苷/g, herbRe: /蟾酥|香加皮/ },
  { key: 'amygdalin', label: '苦杏仁苷', pattern: /苦杏仁苷|垂盆草苷|黑芥子苷/g, herbRe: /苦杏仁|垂盆草|芥子/ },
  { key: 'adenosine', label: '腺苷', pattern: /腺苷|水蛭素/g, herbRe: /冬虫夏草|水蛭/ },
  { key: 'glucose_unit', label: '多糖吡喃糖基元', pattern: /枸杞多糖|黄芪多糖|石斛多糖/g, herbRe: /枸杞|黄芪\(多糖|石斛/ }
];

const COMBINED_MOL_RE = new RegExp(
  '(' + MOL3D_ENTRIES.map((e) => e.pattern.source).join('|') + ')',
  'g'
);

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
        return `<${tag} ${extraAttrs} class="tcm-mol3d-link" data-mol3d-open="${key}" title="点击查看 ${match} 三维分子结构与官能团高亮"><svg class="tcm-mol3d-link-ico" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 20 7 20 17 12 22 4 17 4 7 12 2"/></svg>${match}</${tag}>`;
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
    body.dark-lab #tcmV21SpectraModal > div,
    body.dark-lab #tcmV22Modal > div {
      background: #0d1f1d !important;
      border-color: #1e3f3a !important;
      color: #e2f1ed !important;
    }
    body.dark-lab #tcmV20VisualModal [class*="bg-[#f6f8f7]"],
    body.dark-lab #tcmV21SpectraModal [class*="bg-[#f6f8f7]"],
    body.dark-lab #tcmV22Modal [class*="bg-[#f6f8f7]"] {
      background: #122926 !important;
      border-color: #1e3f3a !important;
    }
    body.dark-lab #tcmV21SpectraModal .bg-white,
    body.dark-lab #tcmV21SpectraModal .bg-slate-50,
    body.dark-lab #tcmV21SpectraModal .bg-slate-100 {
      background-color: #112a26 !important;
      border-color: #244a44 !important;
      color: #e2f1ed !important;
    }
    body.dark-lab #tcmV21SpectraModal [class*="bg-emerald-50"] {
      background-color: rgba(16, 185, 129, 0.14) !important;
      border-color: rgba(52, 211, 153, 0.35) !important;
      color: #d1fae5 !important;
    }
    body.dark-lab #tcmV21SpectraModal [class*="bg-amber-50"] {
      background-color: rgba(245, 158, 11, 0.14) !important;
      border-color: rgba(251, 191, 36, 0.45) !important;
      color: #fef3c7 !important;
    }
    body.dark-lab #tcmV21SpectraModal .text-slate-500,
    body.dark-lab #tcmV21SpectraModal .text-slate-600 {
      color: #94a3b8 !important;
    }
    body.dark-lab #tcmV21SpectraModal .text-slate-700,
    body.dark-lab #tcmV21SpectraModal .text-slate-800 {
      color: #e2f1ed !important;
    }
    body.dark-lab #tcmV21SpectraModal button:not([class*="bg-[#059669]"]):not([class*="bg-[#064e3b]"]):not([class*="bg-[#ea580c]"]):not([class*="bg-emerald-"]):not([class*="bg-amber-"]):not([class*="bg-white/10"]) {
      background-color: #132c29 !important;
      color: #e2e8f0 !important;
      border-color: #244a44 !important;
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
  const ico = (d) => `<svg class="craft-ico" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const dock = document.createElement('div');
  dock.id = 'tcmV22FabDock';
  dock.className = 'v22-fab-dock no-print';
  dock.innerHTML =
    '<div class="v22-fab-tray" id="v22FabTray" hidden>' +
      `<button type="button" class="v22-fab-btn accent" id="v29BtnExplore">${ico('<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.6M8.2 13.2l7.6 4.6"/>')}<span>知识图谱探索</span></button>` +
      `<button type="button" class="v22-fab-btn accent" data-v22-open="vlab">${ico('<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>')}<span>三维虚拟实验室</span></button>` +
      `<button type="button" class="v22-fab-btn" data-v22-open="fluid">${ico('<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>')}<span>液液萃取流体仿真</span></button>` +
      `<button type="button" class="v22-fab-btn" data-v22-open="cockpit">${ico('<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>')}<span>五维雷达驾驶舱</span></button>` +
      `<button type="button" class="v22-fab-btn" data-kb-open="overview">${ico('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>')}<span>六大学科知识库</span></button>` +
      `<button type="button" class="v22-fab-btn" id="v22BtnPresent">${ico('<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>')}<span>教学投影模式</span></button>` +
      `<button type="button" class="v22-fab-btn" id="v24BtnOpenGrowth">${ico('<path d="M12 15l-3.5 2 .7-4-2.9-2.8 4-.6L12 6l1.7 3.6 4 .6-2.9 2.8.7 4z"/>')}<span>实验成长档案</span></button>` +
    '</div>' +
    '<button type="button" class="v22-fab-toggle" id="v22FabToggle" aria-expanded="false" aria-controls="v22FabTray">' +
      `<span class="v22-fab-toggle-dot" aria-hidden="true"></span>${ico('<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/>')}<span>实验工具舱</span>` +
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
    if (e.target.closest('#v29BtnExplore')) {
      setOpen(false);
      if (window.TCM_V29_EXPLORE && typeof window.TCM_V29_EXPLORE.open === 'function') {
        window.TCM_V29_EXPLORE.open('kg');
      }
      return;
    }
    if (e.target.closest('[data-kb-open]')) {
      setOpen(false);
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
      const cat = /生物碱/.test(catText) ? '生物碱' : (/蒽醌|醌/.test(catText) ? '蒽醌与醌类' : (/苯丙素|有机酸|酚酸/.test(catText) ? '酚酸类' : '黄酮'));
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
      icon: '3D',
      title: '三维分子结构与显色实验室',
      desc: '内置 65 项 PubChem 实测 3D 构象并全量贯通 136 味题库药材、91 篇文献与 12 项粒子显色反应。',
      onOpen: () => window.TCM_V20_VISUALS.openMol3d('tanshinone')
    });
    window.TCM_V16_PORTAL.registerExtension({
      id: 'v21_spectra',
      icon: 'UV',
      title: '交互式四谱工作站与猜峰训练',
      desc: '覆盖 11 大类中药成分的 UV / IR / ¹H-NMR / MS 交互谱图，直连 136 味药材药典波长与实证文献。',
      onOpen: () => window.TCM_V21_SPECTRA_LAB.open('黄酮')
    });
    window.TCM_V16_PORTAL.registerExtension({
      id: 'v22_visual_suite',
      icon: 'LAB',
      title: '三维虚拟实验室、流体仿真与驾驶舱',
      desc: '基于 Three.js 构建 10m×8m 实景 3D 实验室与多课题 SOP，内置液液萃取流体仿真与 136 题五维雷达驾驶舱。',
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
