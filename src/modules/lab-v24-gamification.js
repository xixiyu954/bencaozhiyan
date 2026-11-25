/**
 * 本草智研 v24 · 板块五：实验成长档案与全库收集图鉴
 * 全量贯通：8 枚精工徽章 + 77 项三维分子图鉴 + 136 味题库药材图鉴 + 15 套实验装置 & 91 篇实证文献档案
 */
const STORE_KEY = 'bencao_v24_growth_v1';
const esc = (v) => String(v == null ? '' : v).replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));

const RANKS = [
  { name: '药材学徒', minXp: 0, code: 'LV.1', color: '#0f4c3a' },
  { name: '提取实验师', minXp: 100, code: 'LV.2', color: '#0369a1' },
  { name: '工艺分析师', minXp: 260, code: 'LV.3', color: '#9a4a24' },
  { name: '本草研究宗师', minXp: 520, code: 'LV.4', color: '#111d19' }
];

const BADGES = [
  { id: 'mol_explorer', code: '01', name: '分子构象探索者', desc: '在三维分子结构库观察核心活性分子构象' },
  { id: 'particle_player', code: '02', name: '定性显色实验员', desc: '在粒子显色实验室完成理化检识模拟' },
  { id: 'spectra_master', code: '03', name: '四谱解析达人', desc: '完成交互式 UV/IR/NMR/MS 谱图峰位解析' },
  { id: 'rig_collector', code: '04', name: '仿真装置能手', desc: '在实验工坊或三维虚拟实验室操作核心装置' },
  { id: 'herb_scholar', code: '05', name: '百草档案研学者', desc: '查阅药材实验题库并点亮 5 味以上药材课题' },
  { id: 'green_chemist', code: '06', name: '绿色化学践行者', desc: '应用绿色无氯仿工艺与溶剂极性匹配模型' },
  { id: 'qc_auditor', code: '07', name: '药典质控审核员', desc: '完成 90 分课题评审或已有方案 SOP 校核' },
  { id: 'lit_researcher', code: '08', name: '文献实证研究者', desc: '检索并对照平台实证文献与高校药企案例' }
];

function getMoleculeAtlasList() {
  if (typeof window !== 'undefined' && window.TCM_MOL3D_PUBCHEM_DATA) {
    return Object.entries(window.TCM_MOL3D_PUBCHEM_DATA).map(([key, m]) => ({
      key,
      name: m.shortName || m.name,
      herb: (m.herb || '').split(' / ')[0],
      category: (m.category || '').split(' / ')[0],
      formula: m.formula || '',
      cid: m.cid || ''
    }));
  }
  if (typeof window !== 'undefined' && window.TCM_MOL3D_REGISTRY && Array.isArray(window.TCM_MOL3D_REGISTRY.entries)) {
    return window.TCM_MOL3D_REGISTRY.entries.map((e) => ({
      key: e.key,
      name: e.label,
      herb: e.label,
      category: 'PubChem 3D',
      formula: '点击展开 3D 构象',
      cid: ''
    }));
  }
  return [
    { key: 'menthol', name: '薄荷脑', herb: '薄荷', category: '挥发油', formula: 'C₁₀H₂₀O' },
    { key: 'baicalin', name: '黄芩苷', herb: '黄芩', category: '黄酮', formula: 'C₂₁H₁₈O₁₁' },
    { key: 'berberine', name: '小檗碱', herb: '黄连', category: '生物碱', formula: 'C₂₀H₁₈NO₄⁺' },
    { key: 'tanshinone', name: '丹参酮 IIA', herb: '丹参', category: '醌类', formula: 'C₁₉H₁₈O₃' }
  ];
}

function loadProfile() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    return {
      xp: Number(raw.xp) || 0,
      badges: Array.isArray(raw.badges) ? raw.badges : [],
      herbs: Array.isArray(raw.herbs) ? raw.herbs : [],
      rigs: Array.isArray(raw.rigs) ? raw.rigs : [],
      mols: Array.isArray(raw.mols) ? raw.mols : [],
      cases: Array.isArray(raw.cases) ? raw.cases : [],
      dailyDates: Array.isArray(raw.dailyDates) ? raw.dailyDates : []
    };
  } catch (_) {
    return { xp: 0, badges: [], herbs: [], rigs: [], mols: [], cases: [], dailyDates: [] };
  }
}

function saveProfile(p) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(p)); } catch (_) {}
}

function getRank(xp) {
  let cur = RANKS[0];
  let next = RANKS[1] || null;
  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].minXp) {
      cur = RANKS[i];
      next = RANKS[i + 1] || null;
    }
  }
  return { cur, next };
}

function toast(msg) {
  if (typeof window !== 'undefined' && window.TCM_LAB_API?.showToast) {
    window.TCM_LAB_API.showToast(msg);
  }
}

export function recordEvent(detail = {}) {
  const p = loadProfile();
  const prevRank = getRank(p.xp).cur.name;
  let gained = 0;
  const newBadges = [];

  const addBadge = (id) => {
    if (!p.badges.includes(id)) {
      p.badges.push(id);
      newBadges.push(BADGES.find((b) => b.id === id)?.name || id);
    }
  };
  const addUnique = (arr, val) => {
    if (val && !arr.includes(val)) arr.push(val);
  };

  switch (detail.type) {
    case 'mol3d_view':
      addUnique(p.mols, detail.key || 'tanshinone');
      addBadge('mol_explorer');
      gained += 15;
      break;
    case 'particle_open':
      addBadge('particle_player');
      gained += 15;
      break;
    case 'spectra_open':
      addBadge('spectra_master');
      gained += 15;
      break;
    case 'rig_used':
      addUnique(p.rigs, detail.rig);
      addBadge('rig_collector');
      gained += 15;
      break;
    case 'herb_viewed':
      addUnique(p.herbs, detail.herb);
      if (p.herbs.length >= 5) addBadge('herb_scholar');
      gained += 10;
      break;
    case 'lit_viewed':
      addBadge('lit_researcher');
      gained += 10;
      break;
    default:
      break;
  }

  p.xp += gained;
  saveProfile(p);

  const nextRank = getRank(p.xp).cur;
  if (nextRank.name !== prevRank) {
    toast(`段位晋升：${nextRank.code} ${nextRank.name}（累计 ${p.xp} XP）`);
  } else if (newBadges.length) {
    toast(`解锁研习徽章：${newBadges.join(' / ')} (+${gained} XP)`);
  }
  return p;
}

let modalEl = null;
let atlasTab = 'herbs';
let atlasQuery = '';

function ensureModal() {
  if (modalEl) return modalEl;
  modalEl = document.createElement('div');
  modalEl.id = 'tcmV24Modal';
  modalEl.className = 'no-print fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/65 backdrop-blur-xs p-3 sm:p-5';
  modalEl.innerHTML = `
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
      <div class="px-5 py-3.5 bg-gradient-to-r from-[#062922] via-[#0a4538] to-[#0f6b58] text-white flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <span class="px-2 py-0.5 rounded-md bg-emerald-400/20 text-emerald-200 text-[11px] font-bold">实验成长档案</span>
          <h3 class="text-sm sm:text-base font-extrabold">段位晋升 · 四库全集收集图鉴（分子 / 药材 / 装置 / 实证文献）</h3>
        </div>
        <button type="button" id="v24BtnClose" class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold">×</button>
      </div>
      <div id="v24Body" class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4"></div>
    </div>`;
  document.body.appendChild(modalEl);
  modalEl.querySelector('#v24BtnClose').addEventListener('click', closeModal);
  modalEl.addEventListener('click', (e) => { if (e.target === modalEl) closeModal(); });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalEl && !modalEl.classList.contains('hidden')) closeModal();
  });
  return modalEl;
}

function closeModal() {
  if (modalEl) { modalEl.classList.add('hidden'); modalEl.classList.remove('flex'); }
}

function renderModal() {
  ensureModal();
  const p = loadProfile();
  const { cur, next } = getRank(p.xp);
  const pct = next ? Math.min(100, Math.round(((p.xp - cur.minXp) / (next.minXp - cur.minXp)) * 100)) : 100;
  const allTopics = window.TCM_LAB_API?.getAllTopics?.() || [];
  const allLit = window.TCM_LAB_API?.getAllLiterature?.() || [];
  const allCases = window.TCM_LAB_API?.getAllUnivCases?.() || [];
  const allRigsObj = window.TCM_LAB_API?.getAllRigs?.() || {};
  const allRigs = Object.entries(allRigsObj).map(([k, r]) => ({ key: k, ...r }));
  const molAtlas = getMoleculeAtlasList();
  const q = atlasQuery.trim().toLowerCase();
  const body = modalEl.querySelector('#v24Body');

  const filteredMols = q
    ? molAtlas.filter((m) => `${m.name} ${m.herb} ${m.category} ${m.formula}`.toLowerCase().includes(q))
    : molAtlas;
  const filteredTopics = q
    ? allTopics.filter((t) => `${t.herb} ${t.compound} ${t.category}`.toLowerCase().includes(q))
    : allTopics;
  const filteredLit = q
    ? allLit.filter((l) => `${l.text} ${l.cat}`.toLowerCase().includes(q))
    : allLit;

  let tabContent = '';
  if (atlasTab === 'badges') {
    tabContent = `
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        ${BADGES.map((b) => {
          const ok = p.badges.includes(b.id);
          return `<div class="p-3 rounded-xl border ${ok ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-400' : 'bg-[#f7f6f2] dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 opacity-75'} space-y-1">
            <div class="flex items-center justify-between"><span class="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[10px] font-bold">${b.code}</span><span class="text-[10px] font-bold ${ok ? 'text-[#0f4c3a] dark:text-emerald-300' : 'text-slate-400'}">${ok ? '已解锁' : '未解锁'}</span></div>
            <div class="font-extrabold text-slate-900 dark:text-white">${esc(b.name)}</div>
            <div class="text-[11px] text-slate-600 dark:text-slate-300">${esc(b.desc)}</div>
          </div>`;
        }).join('')}
      </div>`;
  } else if (atlasTab === 'mols') {
    tabContent = `
      <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 text-xs max-h-[380px] overflow-y-auto custom-scroll pr-1">
        ${filteredMols.map((m) => {
          const ok = p.mols.includes(m.key);
          return `<button type="button" data-v24-open-mol="${esc(m.key)}" class="text-left p-2.5 rounded-xl border transition ${ok ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-400' : 'bg-[#f7f6f2] dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-[#0f4c3a]'} space-y-0.5">
            <div class="flex items-center justify-between gap-1"><span class="text-[10px] font-bold text-[#0f4c3a] dark:text-emerald-300 truncate">${esc(m.category)}</span><span class="text-[10px] font-bold ${ok ? 'text-emerald-700' : 'text-slate-400'}">${ok ? '已点亮' : '3D ↗'}</span></div>
            <div class="font-extrabold text-slate-900 dark:text-white truncate">${esc(m.name)}</div>
            <div class="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">${esc(m.herb)} · ${esc(m.formula)}</div>
          </button>`;
        }).join('')}
      </div>`;
  } else if (atlasTab === 'herbs') {
    tabContent = `
      <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 text-xs max-h-[380px] overflow-y-auto custom-scroll pr-1">
        ${filteredTopics.map((t) => {
          const ok = p.herbs.includes(t.herb);
          return `<button type="button" data-v24-open-herb="${esc(t.id)}" class="text-left p-2.5 rounded-xl border transition ${ok ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-950 dark:text-emerald-100' : 'bg-[#f7f6f2] dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-[#0f4c3a] text-slate-700 dark:text-slate-200'}">
            <div class="font-bold truncate">${esc(t.herb)}</div>
            <div class="text-[10px] truncate text-slate-500 dark:text-slate-400">${esc(t.compound || t.category)}</div>
            <div class="text-[9.5px] mt-0.5 font-semibold text-[#0f4c3a] dark:text-emerald-300 truncate">${esc(t.category)}</div>
          </button>`;
        }).join('')}
      </div>`;
  } else if (atlasTab === 'rigs') {
    tabContent = `
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs max-h-[380px] overflow-y-auto custom-scroll pr-1">
        ${allRigs.map((r) => {
          const ok = p.rigs.includes(r.key);
          return `<button type="button" data-v24-open-rig="${esc(r.key)}" class="text-left p-3 rounded-xl border transition ${ok ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-400' : 'bg-[#f7f6f2] dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-[#0f4c3a]'} space-y-1">
            <div class="flex items-center justify-between gap-1"><span class="font-extrabold text-slate-900 dark:text-white truncate">${esc(r.title || r.key)}</span><span class="text-[10px] font-bold ${ok ? 'text-emerald-700' : 'text-slate-400'}">${ok ? '已实训' : '查看 →'}</span></div>
            <div class="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">${esc(r.principle || r.desc || r.scope || '交互式现代本草实验装置')}</div>
          </button>`;
        }).join('')}
      </div>`;
  } else {
    tabContent = `
      <div class="space-y-3 max-h-[380px] overflow-y-auto custom-scroll pr-1 text-xs">
        <div class="text-[11px] font-bold text-slate-500 dark:text-slate-400">实证文献全库（命中 ${filteredLit.length} / ${allLit.length} 篇） · 另有 ${allCases.length} 项高校与药企实证案例</div>
        <div class="space-y-1.5">
          ${filteredLit.map((l, idx) => `
            <div class="p-2.5 rounded-xl bg-[#f7f6f2] dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-start gap-2">
              <span class="shrink-0 px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[10px] font-bold text-[#0f4c3a] dark:text-emerald-300 tabular-nums">${String(idx + 1).padStart(2, '0')}</span>
              <div class="min-w-0">
                <span class="inline-block px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-900/40 text-[#0f4c3a] dark:text-emerald-300 text-[10px] font-bold mr-1.5">${esc(l.cat || '核心文献')}</span>
                <span class="text-slate-700 dark:text-slate-200 leading-relaxed">${esc(l.text)}</span>
              </div>
            </div>`).join('')}
        </div>
      </div>`;
  }

  body.innerHTML = `
    <div class="p-4 rounded-xl bg-gradient-to-r from-[#062922] to-[#0f4c3a] text-white flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-sm font-mono font-black tracking-tight">${cur.code}</div>
        <div>
          <div class="text-[11px] text-emerald-200 font-bold">当前本草研习段位</div>
          <div class="text-lg font-extrabold">${cur.name} <span class="text-sm font-mono text-amber-300 ml-1 tabular-nums">${p.xp} XP</span></div>
          <div class="text-[11px] text-teal-100/80">${next ? `距下一段位「${next.name}」还需 ${next.minXp - p.xp} XP` : '已达最高研究宗师段位'}</div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button id="v24ExportBtn" type="button" class="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-bold">导出成长档案 JSON</button>
      </div>
      <div class="w-full h-1.5 rounded-full bg-white/15 overflow-hidden"><div class="h-full bg-emerald-300 transition-all" style="width:${pct}%"></div></div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-2">
      <div class="inline-flex flex-wrap p-1 rounded-xl bg-[#f7f6f2] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold gap-1">
        <button type="button" data-v24-tab="herbs" class="px-3 py-1.5 rounded-lg ${atlasTab === 'herbs' ? 'bg-[#0f4c3a] text-white' : 'text-slate-600 dark:text-slate-300'}">药材图鉴 (${p.herbs.length}/${allTopics.length})</button>
        <button type="button" data-v24-tab="mols" class="px-3 py-1.5 rounded-lg ${atlasTab === 'mols' ? 'bg-[#0f4c3a] text-white' : 'text-slate-600 dark:text-slate-300'}">三维分子 (${p.mols.length}/${molAtlas.length})</button>
        <button type="button" data-v24-tab="rigs" class="px-3 py-1.5 rounded-lg ${atlasTab === 'rigs' ? 'bg-[#0f4c3a] text-white' : 'text-slate-600 dark:text-slate-300'}">实验装置 (${p.rigs.length}/${allRigs.length})</button>
        <button type="button" data-v24-tab="lit" class="px-3 py-1.5 rounded-lg ${atlasTab === 'lit' ? 'bg-[#0f4c3a] text-white' : 'text-slate-600 dark:text-slate-300'}">实证文献 (${allLit.length})</button>
        <button type="button" data-v24-tab="badges" class="px-3 py-1.5 rounded-lg ${atlasTab === 'badges' ? 'bg-[#0f4c3a] text-white' : 'text-slate-600 dark:text-slate-300'}">成就徽章 (${p.badges.length}/${BADGES.length})</button>
      </div>
      ${(atlasTab === 'herbs' || atlasTab === 'mols' || atlasTab === 'lit') ? `<input id="v24AtlasSearch" type="text" value="${esc(atlasQuery)}" placeholder="筛选当前图鉴..." class="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 w-48 focus:outline-none focus:border-[#0f4c3a]" />` : ''}
    </div>

    <div id="v24Content">${tabContent}</div>`;

  body.querySelectorAll('[data-v24-tab]').forEach((b) => b.addEventListener('click', () => {
    atlasTab = b.dataset.v24Tab;
    atlasQuery = '';
    renderModal();
  }));
  const searchEl = body.querySelector('#v24AtlasSearch');
  if (searchEl) {
    searchEl.addEventListener('input', () => {
      atlasQuery = searchEl.value;
      const pos = searchEl.selectionStart || atlasQuery.length;
      renderModal();
      const nextInp = modalEl.querySelector('#v24AtlasSearch');
      if (nextInp) { nextInp.focus(); nextInp.setSelectionRange(pos, pos); }
    });
  }
  body.querySelectorAll('[data-v24-open-mol]').forEach((b) => b.addEventListener('click', () => {
    closeModal();
    if (window.TCM_V20_VISUALS) window.TCM_V20_VISUALS.openMol3d(b.dataset.v24OpenMol);
  }));
  body.querySelectorAll('[data-v24-open-herb]').forEach((b) => b.addEventListener('click', () => {
    const tid = b.dataset.v24OpenHerb;
    const tObj = window.TCM_LAB_API?.getTopicById?.(tid);
    if (tObj) recordEvent({ type: 'herb_viewed', herb: tObj.herb });
    closeModal();
    if (window.TCM_LAB_API?.selectTopic) window.TCM_LAB_API.selectTopic(tid, 1);
    if (window.TCM_V16_PORTAL?.go) window.TCM_V16_PORTAL.go('workflow', { step: 1 });
  }));
  body.querySelectorAll('[data-v24-open-rig]').forEach((b) => b.addEventListener('click', () => {
    recordEvent({ type: 'rig_used', rig: b.dataset.v24OpenRig });
    closeModal();
    if (window.TCM_V16_PORTAL?.go) window.TCM_V16_PORTAL.go('diy', { subTab: 'hub' });
  }));
  body.querySelector('#v24ExportBtn')?.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), profile: loadProfile() }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'bencao_growth_profile.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('已导出个人段位与四库全集图鉴档案 JSON');
  });
}

export function openGamificationModal() {
  ensureModal();
  modalEl.classList.remove('hidden');
  modalEl.classList.add('flex');
  renderModal();
}

export const TCM_V24_GAMIFICATION = Object.freeze({
  version: '2.0.0-full-codex',
  open: openGamificationModal,
  close: closeModal,
  recordEvent,
  getProfile: loadProfile
});

if (typeof window !== 'undefined') {
  window.TCM_V24_GAMIFICATION = TCM_V24_GAMIFICATION;
}

export default TCM_V24_GAMIFICATION;
