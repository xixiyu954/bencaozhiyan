/**
 * 本草智研 v26 · 六大学科知识库 & 实践汇编轻代理加载器（首屏零加载 227 KB 正文）
 * 挂载入口：1) 右侧研学资料库「章节知识」顶部 8 册直达卡 2) Ctrl+K 全局检索联动 3) 首页 Bento 入口与扩展舱
 */
import { TCM_KNOWLEDGE_INDEX } from '../data/knowledge-index.js';

let kbPromise = null;
let kbLoaded = false;

export function loadKnowledgeHub() {
  if (kbLoaded) return Promise.resolve();
  if (!kbPromise) {
    kbPromise = import('../modules/lab-v26-knowledge-hub.js')
      .then(() => {
        kbLoaded = true;
      })
      .catch((err) => {
        kbPromise = null;
        throw err;
      });
  }
  return kbPromise;
}

export function openKnowledgeHub(bookId = 'overview', sectionId = '', query = '') {
  return loadKnowledgeHub().then(() => {
    if (window.TCM_KNOWLEDGE_HUB && !window.TCM_KNOWLEDGE_HUB.__isLazyProxy) {
      window.TCM_KNOWLEDGE_HUB.open(bookId, sectionId, query);
    }
  });
}

function searchIndex(query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return [];
  const out = [];
  for (const book of TCM_KNOWLEDGE_INDEX) {
    if (`${book.shortTitle} ${book.title} ${book.subtitle}`.toLowerCase().includes(q)) {
      out.push({ bookId: book.id, bookShort: book.shortTitle, secId: '', title: book.title, sub: book.subtitle });
    }
    for (const sec of book.sections) {
      if (sec.title.toLowerCase().includes(q)) {
        out.push({ bookId: book.id, bookShort: book.shortTitle, secId: sec.id, title: sec.title, sub: `${book.shortTitle} · 点击直达章节` });
      }
    }
  }
  return out.slice(0, 8);
}

function mountDrawerKnowledgeBanner() {
  const panel = document.getElementById('rpanel-chapters');
  if (!panel || document.getElementById('tcmKbDrawerCard')) return;

  const card = document.createElement('div');
  card.id = 'tcmKbDrawerCard';
  card.className = 'p-3.5 rounded-2xl bg-gradient-to-br from-[#062922] via-[#0a4538] to-[#0f6b58] text-white space-y-2.5 shadow-md';
  const pills = TCM_KNOWLEDGE_INDEX.map(
    (b) => `<button type="button" data-kb-open="${b.id}" class="px-2.5 py-1 rounded-lg bg-white/14 hover:bg-white/25 text-white text-[11px] font-bold border border-white/15 transition">${b.shortTitle}</button>`
  ).join('');

  card.innerHTML = `
    <div class="flex items-center justify-between gap-2">
      <div>
        <div class="text-[10px] font-extrabold tracking-wider text-emerald-300">2025 药典 · 全链路知识库</div>
        <div class="text-sm font-extrabold">六大学科知识库 &amp; 实践资料汇编</div>
      </div>
      <button type="button" data-kb-open="overview" class="shrink-0 px-2.5 py-1 rounded-xl bg-emerald-400 text-[#05211d] text-[11px] font-extrabold hover:bg-emerald-300 transition">全文阅读 ↗</button>
    </div>
    <p class="text-[11px] text-emerald-100/85 leading-relaxed">覆盖中药化学、中药制剂、制药工艺、分析化学、仪器分析、制剂分析 6 册及 7 大实践汇编模块（96 章、约 60 张速查表），支持跨册检索与 3D 分子联动。</p>
    <div class="flex flex-wrap gap-1.5">${pills}</div>`;

  panel.insertBefore(card, panel.firstChild);
}

function bindGlobalKbDelegation() {
  if (typeof document === 'undefined' || document.__tcmKbDelegated) return;
  document.__tcmKbDelegated = true;

  document.addEventListener('click', (e) => {
    const btn = e.target && e.target.closest ? e.target.closest('[data-kb-open]') : null;
    if (!btn) return;
    e.preventDefault();
    const bookId = btn.getAttribute('data-kb-open') || 'overview';
    const secId = btn.getAttribute('data-kb-sec') || '';
    const query = btn.getAttribute('data-kb-query') || '';
    // 若在抽屉中打开，先轻收起抽屉避免双重遮罩
    const closeDrawer = document.getElementById('btnCloseRightDrawer');
    const drawer = document.getElementById('rightDrawer');
    if (drawer && !drawer.classList.contains('translate-x-full') && closeDrawer) {
      closeDrawer.click();
    }
    openKnowledgeHub(bookId, secId, query);
  });
}

function bindCmdPaletteIntegration() {
  const input = document.getElementById('cmdPaletteInput');
  const list = document.getElementById('cmdPaletteResults');
  if (!input || !list || input.dataset.kbBound === '1') return;
  input.dataset.kbBound = '1';

  const appendKbHits = () => {
    const q = input.value.trim();
    const oldWrap = list.querySelector('#tcmKbCmdGroup');
    if (oldWrap) oldWrap.remove();
    if (q.length < 1) return;

    const hits = searchIndex(q);
    const wrap = document.createElement('div');
    wrap.id = 'tcmKbCmdGroup';
    wrap.className = 'mt-2 pt-2 border-t border-slate-200/80 space-y-1';

    const itemsHtml = hits.length
      ? hits.map((h) => `
          <button type="button" data-kb-cmd-book="${h.bookId}" data-kb-cmd-sec="${h.secId}" class="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 flex items-center justify-between gap-2 transition">
            <span class="min-w-0">
              <span class="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold mr-1.5">${h.bookShort}</span>
              <span class="text-xs font-extrabold text-slate-800">${h.title}</span>
            </span>
            <span class="shrink-0 text-[11px] font-bold text-emerald-700">阅读 ↗</span>
          </button>`).join('')
      : `<button type="button" data-kb-cmd-query="${q.replace(/"/g, '&quot;')}" class="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 flex items-center justify-between gap-2 transition">
          <span class="text-xs font-bold text-slate-700">📚 在《六大学科知识库 &amp; 实践汇编》8 册中全文检索 “${q.replace(/</g, '&lt;')}”</span>
          <span class="shrink-0 text-[11px] font-bold text-emerald-700">检索 ↗</span>
        </button>`;

    wrap.innerHTML = `<div class="px-2 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">六大学科知识库 &amp; 实践汇编</div>${itemsHtml}`;
    wrap.addEventListener('click', (e) => {
      const hitBtn = e.target.closest('[data-kb-cmd-book], [data-kb-cmd-query]');
      if (!hitBtn) return;
      const modal = document.getElementById('cmdPaletteModal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
      const bId = hitBtn.getAttribute('data-kb-cmd-book') || 'overview';
      const sId = hitBtn.getAttribute('data-kb-cmd-sec') || '';
      const qStr = hitBtn.getAttribute('data-kb-cmd-query') || '';
      openKnowledgeHub(bId, sId, qStr);
    });
    list.appendChild(wrap);
  };

  input.addEventListener('input', () => setTimeout(appendKbHits, 30));
}

function initKnowledgeLoader() {
  if (typeof window === 'undefined') return;

  window.TCM_KNOWLEDGE_HUB = {
    __isLazyProxy: true,
    version: '1.0.0-vite-lazy',
    open: openKnowledgeHub,
    searchIndex,
    index: TCM_KNOWLEDGE_INDEX
  };

  bindGlobalKbDelegation();
  mountDrawerKnowledgeBanner();
  bindCmdPaletteIntegration();

  if (window.TCM_V16_PORTAL && typeof window.TCM_V16_PORTAL.registerExtension === 'function') {
    window.TCM_V16_PORTAL.registerExtension({
      id: 'v26_knowledge_hub',
      icon: '📚',
      title: '六大学科知识库 & 实践汇编',
      desc: '中药化学、制剂、工艺、分析化学、仪器分析、制剂分析 6 册及 7 大实践汇编模块（约 60 张速查表）。',
      onOpen: () => openKnowledgeHub('overview')
    });
  }
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKnowledgeLoader, { once: true });
  } else {
    initKnowledgeLoader();
  }
}
