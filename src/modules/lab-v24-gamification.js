/**
 * 本草智研 v24 · 板块五：游戏化成长体系（段位系统 + 徽章成就 + 三本收集图鉴 + 个人数据随身导出）
 */
const STORE_KEY = 'bencao_v24_growth_v1';
const esc = (v) => String(v == null ? '' : v).replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));

const RANKS = [
  { name: '药材学徒', minXp: 0, badge: '🌱', color: '#059669' },
  { name: '提取师', minXp: 100, badge: '⚗️', color: '#0284c7' },
  { name: '工艺大师', minXp: 260, badge: '🏆', color: '#d97706' },
  { name: '药学宗师', minXp: 520, badge: '👑', color: '#7c3aed' }
];

const BADGES = [
  { id: 'mol_explorer', icon: '🧬', name: '分子探索者', desc: '在 3D 分子结构库观察核心活性分子' },
  { id: 'particle_player', icon: '💧', name: '显色实验员', desc: '在粒子级显色反应台完成检识模拟' },
  { id: 'spectra_master', icon: '🌈', name: '识谱达人', desc: '体验交互式四谱工作站与峰位解析' },
  { id: 'rig_collector', icon: '⚙️', name: '装置能手', desc: '在实验工坊或虚拟实验室操作核心装置' }
];

const MOLECULE_ATLAS = [
  { key: 'menthol', name: '薄荷脑', herb: '薄荷', rarity: 'R', formula: 'C₁₀H₂₀O' },
  { key: 'baicalin', name: '黄芩苷', herb: '黄芩', rarity: 'SR', formula: 'C₂₁H₁₈O₁₁' },
  { key: 'berberine', name: '小檗碱', herb: '黄连', rarity: 'SR', formula: 'C₂₀H₁₈NO₄⁺' },
  { key: 'tanshinone', name: '丹参酮 IIA', herb: '丹参', rarity: 'SSR', formula: 'C₁₉H₁₈O₃' }
];

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
      addUnique(p.mols, detail.key || 'menthol');
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
    default:
      break;
  }

  p.xp += gained;
  saveProfile(p);

  const nextRank = getRank(p.xp).cur;
  if (nextRank.name !== prevRank) {
    toast(`🎉 段位晋升：${nextRank.badge} ${nextRank.name}（累计 ${p.xp} XP）！`);
  } else if (newBadges.length) {
    toast(`🏅 解锁成就徽章：${newBadges.join(' / ')} (+${gained} XP)`);
  }
  return p;
}

let modalEl = null;
let atlasTab = 'badges';

function ensureModal() {
  if (modalEl) return modalEl;
  modalEl = document.createElement('div');
  modalEl.id = 'tcmV24Modal';
  modalEl.className = 'no-print fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/65 backdrop-blur-xs p-3 sm:p-5';
  modalEl.innerHTML = `
    <div class="bg-white rounded-3xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
      <div class="px-5 py-3.5 bg-gradient-to-r from-[#062922] via-[#0a4538] to-[#0f6b58] text-white flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <span class="px-2 py-0.5 rounded-full bg-amber-400/25 text-amber-200 text-[11px] font-extrabold">板块五 · 成长图鉴</span>
          <h3 class="text-sm sm:text-base font-extrabold">段位晋升 · 成就徽章 · 三本收集图鉴</h3>
        </div>
        <button type="button" id="v24BtnClose" class="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold">×</button>
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
  const counts = window.TCM_LAB_API?.getCounts?.() || { topics: 119, rigs: 15 };
  const body = modalEl.querySelector('#v24Body');

  body.innerHTML = `
    <div class="p-4 rounded-2xl bg-gradient-to-r from-[#062922] to-[#0f5c54] text-white flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-2xl">${cur.badge}</div>
        <div>
          <div class="text-[11px] text-emerald-200 font-bold">当前本草段位</div>
          <div class="text-lg font-extrabold">${cur.name} <span class="text-sm font-mono text-amber-300 ml-1">${p.xp} XP</span></div>
          <div class="text-[11px] text-teal-100/80">${next ? `距下一段位「${next.name}」还需 ${next.minXp - p.xp} XP` : '已达最高宗师段位！'}</div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button id="v24ExportBtn" type="button" class="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-bold">导出成长档案 JSON</button>
      </div>
      <div class="w-full h-2 rounded-full bg-white/15 overflow-hidden"><div class="h-full bg-gradient-to-r from-emerald-300 to-amber-300 transition-all" style="width:${pct}%"></div></div>
    </div>

    <div class="inline-flex flex-wrap p-1 rounded-xl bg-[#f6f8f7] border border-slate-200 text-xs font-extrabold gap-1">
      <button type="button" data-v24-tab="badges" class="px-3 py-1.5 rounded-lg ${atlasTab === 'badges' ? 'bg-[#064e3b] text-white' : 'text-slate-600'}">🏅 徽章 (${p.badges.length}/${BADGES.length})</button>
      <button type="button" data-v24-tab="mols" class="px-3 py-1.5 rounded-lg ${atlasTab === 'mols' ? 'bg-[#064e3b] text-white' : 'text-slate-600'}">🧬 分子图鉴 (${p.mols.length}/${MOLECULE_ATLAS.length})</button>
      <button type="button" data-v24-tab="herbs" class="px-3 py-1.5 rounded-lg ${atlasTab === 'herbs' ? 'bg-[#064e3b] text-white' : 'text-slate-600'}">🌿 药材图鉴 (${p.herbs.length}/${counts.topics})</button>
    </div>

    <div id="v24Content">
      ${atlasTab === 'badges' ? `
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          ${BADGES.map((b) => {
            const ok = p.badges.includes(b.id);
            return `<div class="p-3 rounded-2xl border ${ok ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200 opacity-60'} space-y-1">
              <div class="flex items-center justify-between"><span class="text-xl">${b.icon}</span><span class="text-[10px] font-bold ${ok ? 'text-emerald-700' : 'text-slate-400'}">${ok ? '已解锁' : '未解锁'}</span></div>
              <div class="font-extrabold text-slate-900">${esc(b.name)}</div>
              <div class="text-[11px] text-slate-600">${esc(b.desc)}</div>
            </div>`;
          }).join('')}
        </div>
      ` : atlasTab === 'mols' ? `
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          ${MOLECULE_ATLAS.map((m) => {
            const ok = p.mols.includes(m.key);
            return `<button type="button" data-v24-open-mol="${m.key}" class="text-left p-3.5 rounded-2xl border transition ${ok ? 'bg-emerald-50/60 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:border-emerald-400'} space-y-1">
              <div class="flex items-center justify-between"><span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-extrabold">${m.rarity}</span><span class="text-[10px] font-bold ${ok ? 'text-emerald-700' : 'text-slate-400'}">${ok ? '已点亮' : '去观察 ↗'}</span></div>
              <div class="font-extrabold text-slate-900 text-sm">${esc(m.name)}</div>
              <div class="text-slate-600">${esc(m.herb)} · ${esc(m.formula)}</div>
            </button>`;
          }).join('')}
        </div>
      ` : `
        <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 text-xs max-h-[340px] overflow-y-auto pr-1">
          ${allTopics.slice(0, 60).map((t) => {
            const ok = p.herbs.includes(t.herb);
            return `<div class="p-2.5 rounded-xl border ${ok ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-500'}">
              <div class="font-bold truncate">${ok ? '✨ ' : ''}${esc(t.herb)}</div>
              <div class="text-[10px] truncate opacity-80">${esc(t.category)}</div>
            </div>`;
          }).join('')}
        </div>
      `}
    </div>`;

  body.querySelectorAll('[data-v24-tab]').forEach((b) => b.addEventListener('click', () => {
    atlasTab = b.dataset.v24Tab;
    renderModal();
  }));
  body.querySelectorAll('[data-v24-open-mol]').forEach((b) => b.addEventListener('click', () => {
    closeModal();
    if (window.TCM_V20_VISUALS) window.TCM_V20_VISUALS.openMol3d(b.dataset.v24OpenMol);
  }));
  body.querySelector('#v24ExportBtn')?.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), profile: loadProfile() }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'bencao_growth_profile.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('已导出个人段位与图鉴档案 JSON');
  });
}

export function openGamificationModal() {
  ensureModal();
  modalEl.classList.remove('hidden');
  modalEl.classList.add('flex');
  renderModal();
}

export const TCM_V24_GAMIFICATION = Object.freeze({
  version: '1.0.0',
  open: openGamificationModal,
  close: closeModal,
  recordEvent,
  getProfile: loadProfile
});

if (typeof window !== 'undefined') {
  window.TCM_V24_GAMIFICATION = TCM_V24_GAMIFICATION;
}

export default TCM_V24_GAMIFICATION;
