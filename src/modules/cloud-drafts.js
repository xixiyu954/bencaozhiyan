// 本草智研 · 实验草稿云端保存与离线本地降级模块（阶段③动态化）
// 兼容原有 tcm_lab_backup.json 导出/导入数据结构，支持 Cloudflare Pages Functions (/api/drafts) 与 localStorage 自动回退。

const LOCAL_DRAFT_KEY = 'bencao_draft_local_v1';
const CLOUD_META_KEY = 'bencao_draft_cloud_meta_v1';
const API_ENDPOINT = '/api/drafts';

let autosaveTimer = null;
let hydrating = false;

function getLabApi() {
  return typeof window !== 'undefined' ? window.TCM_LAB_API || null : null;
}

function toast(msg, type = 'success') {
  const api = getLabApi();
  if (api && typeof api.showToast === 'function') {
    api.showToast(msg, type);
  }
}

export function getCloudMeta() {
  try {
    const raw = localStorage.getItem(CLOUD_META_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

function setCloudMeta(meta) {
  try {
    if (meta) localStorage.setItem(CLOUD_META_KEY, JSON.stringify(meta));
    else localStorage.removeItem(CLOUD_META_KEY);
  } catch (_) {}
}

export function getLocalDraft() {
  try {
    const raw = localStorage.getItem(LOCAL_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export function saveLocalDraft() {
  const api = getLabApi();
  if (!api || typeof api.exportDraftState !== 'function') return null;
  try {
    const data = api.exportDraftState();
    const record = {
      schemaVersion: 1,
      updatedAt: new Date().toISOString(),
      data
    };
    localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(record));
    updateStatusUi('local', record.updatedAt);
    return record;
  } catch (_) {
    return null;
  }
}

export function clearLocalDraft() {
  try {
    localStorage.removeItem(LOCAL_DRAFT_KEY);
    setCloudMeta(null);
  } catch (_) {}
  updateStatusUi('ready');
}

export function restoreLocalDraft(silent = true) {
  const api = getLabApi();
  const saved = getLocalDraft();
  if (!api || typeof api.importDraftState !== 'function' || !saved || !saved.data) {
    return false;
  }
  try {
    hydrating = true;
    const ok = api.importDraftState(saved.data, silent);
    if (ok) {
      const meta = getCloudMeta();
      updateStatusUi(meta && meta.id ? 'cloud' : 'local', saved.updatedAt, meta?.id);
    }
    return Boolean(ok);
  } finally {
    hydrating = false;
  }
}

export async function checkCloudHealth(endpoint = API_ENDPOINT) {
  try {
    const res = await fetch(endpoint, { method: 'GET', headers: { Accept: 'application/json' } });
    if (!res.ok) return { ok: false, configured: false, backend: 'unavailable' };
    return await res.json();
  } catch (_) {
    return { ok: false, configured: false, backend: 'offline' };
  }
}

export async function saveToCloud(options = {}) {
  const endpoint = options.endpoint || API_ENDPOINT;
  const api = getLabApi();
  if (!api || typeof api.exportDraftState !== 'function') {
    return { ok: false, fallback: 'none', error: '工作台接口未就绪' };
  }

  // 先落盘一份本地草稿，确保任何网络异常下零数据丢失
  const localRec = saveLocalDraft();
  const data = localRec ? localRec.data : api.exportDraftState();
  const meta = getCloudMeta();
  const topic = api.getCurrentTopic ? api.getCurrentTopic() : null;
  const title = options.title || (topic ? `${topic.herb} · ${topic.compound}` : data.activeTopicId);

  const payload = {
    id: options.forceNew ? undefined : meta?.id,
    title,
    data
  };
  const headers = { 'Content-Type': 'application/json' };
  if (!options.forceNew && meta?.editToken) {
    headers['X-Draft-Token'] = meta.editToken;
  }

  try {
    const res = await fetch(endpoint, {
      method: meta?.id && !options.forceNew ? 'PUT' : 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.ok && json.id) {
      const nextMeta = {
        id: json.id,
        editToken: json.editToken || meta?.editToken || '',
        backend: json.backend || 'cloud',
        updatedAt: json.updatedAt || new Date().toISOString()
      };
      setCloudMeta(nextMeta);
      updateStatusUi('cloud', nextMeta.updatedAt, nextMeta.id);
      if (!options.silent) {
        toast(`云端草稿已保存（编号：${nextMeta.id}）`);
      }
      return { ok: true, mode: 'cloud', ...nextMeta };
    }

    // 后端未配置 KV/D1 或离线时平滑降级为本地自动保存
    updateStatusUi('local', localRec?.updatedAt);
    const reason = json?.error?.message || `服务返回 ${res.status}`;
    if (!options.silent) {
      toast(`云端暂不可用（${reason}），已自动保存在本地`, 'info');
    }
    return { ok: true, mode: 'local-fallback', reason, updatedAt: localRec?.updatedAt };
  } catch (_) {
    updateStatusUi('local', localRec?.updatedAt);
    if (!options.silent) {
      toast('当前为离线/静态预览模式，草稿已自动保存在本地（刷新不丢失）', 'info');
    }
    return { ok: true, mode: 'local-fallback', reason: 'network-unavailable', updatedAt: localRec?.updatedAt };
  }
}

export async function restoreFromCloud(draftId, options = {}) {
  const endpoint = options.endpoint || API_ENDPOINT;
  const id = String(draftId || '').trim();
  if (!id) return { ok: false, error: '请输入草稿编号' };
  const api = getLabApi();
  if (!api || typeof api.importDraftState !== 'function') {
    return { ok: false, error: '工作台接口未就绪' };
  }

  try {
    const res = await fetch(`${endpoint}?id=${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' }
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok || !json.draft?.data) {
      const msg = json?.error?.message || `读取失败 (${res.status})`;
      if (!options.silent) toast(msg, 'error');
      return { ok: false, error: msg };
    }
    hydrating = true;
    try {
      const applied = api.importDraftState(json.draft.data, true);
      if (!applied) {
        if (!options.silent) toast('云端草稿格式校验未通过', 'error');
        return { ok: false, error: '格式无效' };
      }
      saveLocalDraft();
      const prevMeta = getCloudMeta();
      setCloudMeta({
        id: json.draft.id,
        editToken: prevMeta && prevMeta.id === json.draft.id ? prevMeta.editToken : '',
        backend: json.backend || 'cloud',
        updatedAt: json.draft.updatedAt
      });
      updateStatusUi('cloud', json.draft.updatedAt, json.draft.id);
      if (!options.silent) toast(`已从云端恢复草稿 #${json.draft.id}`);
      return { ok: true, draft: json.draft };
    } finally {
      hydrating = false;
    }
  } catch (_) {
    if (!options.silent) toast('网络不可用，无法读取云端草稿', 'error');
    return { ok: false, error: 'network-error' };
  }
}

function formatClock(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch (_) {
    return '';
  }
}

function updateStatusUi(mode, updatedAt = '', cloudId = '') {
  const badge = typeof document !== 'undefined' ? document.getElementById('cloudDraftStatus') : null;
  if (!badge) return;
  const tm = formatClock(updatedAt);
  if (mode === 'cloud' && cloudId) {
    badge.textContent = `☁️ 云端已同步 ${cloudId}${tm ? ' · ' + tm : ''}`;
    badge.className = 'text-[10px] font-semibold text-emerald-300 truncate';
  } else if (mode === 'local') {
    badge.textContent = `💾 自动保存已开启（本地${tm ? ' · ' + tm : ''}）`;
    badge.className = 'text-[10px] font-semibold text-teal-200/90 truncate';
  } else {
    badge.textContent = '💾 自动保存已开启 · 刷新不丢失';
    badge.className = 'text-[10px] font-semibold text-teal-200/80 truncate';
  }
}

function mountSidebarControls() {
  if (typeof document === 'undefined' || document.getElementById('cloudDraftBar')) return;
  const exportBtn = document.getElementById('btnExportJson');
  const gridRow = exportBtn && exportBtn.parentElement;
  const footerBox = gridRow && gridRow.parentElement;
  if (!footerBox) return;

  const bar = document.createElement('div');
  bar.id = 'cloudDraftBar';
  bar.className = 'rounded-xl bg-white/5 border border-white/10 p-2 space-y-1.5';
  bar.innerHTML = `
    <div class="flex items-center justify-between gap-1">
      <span id="cloudDraftStatus" class="text-[10px] font-semibold text-teal-200/80 truncate">💾 自动保存已开启 · 刷新不丢失</span>
    </div>
    <div class="grid grid-cols-2 gap-1.5">
      <button id="btnCloudSaveDraft" type="button" class="py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-[11px] font-bold text-emerald-100 transition">☁️ 云端保存</button>
      <button id="btnCloudRestoreDraft" type="button" class="py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-medium text-teal-50 transition">📥 云端恢复</button>
    </div>`;
  footerBox.insertBefore(bar, gridRow);

  const btnSave = document.getElementById('btnCloudSaveDraft');
  const btnRestore = document.getElementById('btnCloudRestoreDraft');
  if (btnSave) {
    btnSave.addEventListener('click', () => {
      saveToCloud();
    });
  }
  if (btnRestore) {
    btnRestore.addEventListener('click', () => {
      const meta = getCloudMeta();
      const inputId = window.prompt('请输入云端草稿编号（例如 tcm_xxxxxxxxxxxx）：', meta?.id || '');
      if (inputId && inputId.trim()) {
        restoreFromCloud(inputId.trim());
      }
    });
  }
}

export function initCloudDrafts() {
  if (typeof window === 'undefined') return;
  mountSidebarControls();

  // 监听工作台状态变更，防抖写入本地草稿（未登录/离线自动回退）
  window.addEventListener('tcm:draft-changed', () => {
    if (hydrating) return;
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => {
      saveLocalDraft();
    }, 600);
  });

  // 优先检查 URL ?draft=<id> 参数进行云端恢复；否则如有本地草稿则自动恢复
  const params = new URLSearchParams(window.location.search || '');
  const urlDraftId = (params.get('draft') || '').trim();
  if (urlDraftId) {
    restoreFromCloud(urlDraftId);
  } else if (getLocalDraft()) {
    restoreLocalDraft(true);
  } else {
    updateStatusUi('ready');
  }
}

export const TCM_CLOUD_DRAFTS = Object.freeze({
  initCloudDrafts,
  saveLocalDraft,
  restoreLocalDraft,
  clearLocalDraft,
  getLocalDraft,
  getCloudMeta,
  checkCloudHealth,
  saveToCloud,
  restoreFromCloud
});

if (typeof window !== 'undefined') {
  window.TCM_CLOUD_DRAFTS = TCM_CLOUD_DRAFTS;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initCloudDrafts(), { once: true });
  } else {
    initCloudDrafts();
  }
}

export default TCM_CLOUD_DRAFTS;
