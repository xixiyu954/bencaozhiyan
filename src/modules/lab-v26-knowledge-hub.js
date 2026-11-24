/**
 * 本草智研 v26 · 中药学六大学科知识库 & 实践资料汇编交互式阅读舱（按需懒加载 Chunk）
 * 支持 8 册切换、全文跨册即时检索、目录定位、3D 分子成分芯片自动联动、大字切换与分册打印
 */
import '../styles/knowledge-hub.css';
import { TCM_KNOWLEDGE_BOOKS } from '../data/knowledge-hub-data.js';

let modalEl = null;
let activeBookId = 'overview';
let searchQuery = '';
let largeFont = false;
let plainCache = null;

function getBook(id) {
  return TCM_KNOWLEDGE_BOOKS.find((b) => b.id === id) || TCM_KNOWLEDGE_BOOKS[0];
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildPlainSearchCache() {
  if (plainCache) return plainCache;
  plainCache = [];
  const parser = typeof document !== 'undefined' ? document.createElement('div') : null;
  for (const book of TCM_KNOWLEDGE_BOOKS) {
    if (!parser) continue;
    parser.innerHTML = book.html;
    const secs = parser.querySelectorAll('section[id]');
    secs.forEach((sec) => {
      const h2 = sec.querySelector('h2');
      const secTitle = h2 ? h2.textContent.trim() : book.shortTitle;
      const text = sec.textContent.replace(/\s+/g, ' ').trim();
      plainCache.push({
        bookId: book.id,
        bookShort: book.shortTitle,
        secId: sec.id,
        secTitle,
        text
      });
    });
  }
  return plainCache;
}

// 安全地为阅读正文中的 6 大核心成分注入 3D 分子联动芯片（跳过标题、SVG、代码块与已有链接）
function enhanceMol3dLinks(container) {
  const reg = typeof window !== 'undefined' ? window.TCM_MOL3D_REGISTRY : null;
  if (!reg || typeof reg.linkifyHtml !== 'function' || !container) return;

  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'SVG', 'CODE', 'PRE', 'BUTTON', 'A', 'H1', 'H2', 'H3']);
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || node.nodeValue.trim().length < 2) return NodeFilter.FILTER_REJECT;
      let p = node.parentElement;
      while (p && p !== container) {
        if (SKIP_TAGS.has(p.tagName) || p.classList.contains('tcm-mol3d-link')) {
          return NodeFilter.FILTER_REJECT;
        }
        p = p.parentElement;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const targets = [];
  let n;
  while ((n = walker.nextNode())) {
    if (reg.matchAll(n.nodeValue).length > 0) targets.push(n);
  }

  for (const textNode of targets) {
    const escaped = escapeHtml(textNode.nodeValue);
    const linked = reg.linkifyHtml(escaped);
    if (linked === escaped) continue;
    const span = document.createElement('span');
    span.innerHTML = linked;
    textNode.parentNode.replaceChild(span, textNode);
  }
}

function runBridgeAction(book) {
  if (!book || !book.bridge) return;
  closeModal();
  if (book.bridge.route && window.TCM_V16_PORTAL?.go) {
    window.TCM_V16_PORTAL.go(book.bridge.route);
  } else if (book.bridge.ext === 'v20_mol3d' && window.TCM_V20_VISUALS?.openMol3d) {
    window.TCM_V20_VISUALS.openMol3d('tanshinone');
  } else if (book.bridge.ext === 'v21_spectra' && window.TCM_V21_SPECTRA_LAB?.open) {
    window.TCM_V21_SPECTRA_LAB.open('黄酮');
  }
}

function printCurrentBook() {
  const book = getBook(activeBookId);
  const w = window.open('', '_blank', 'width=980,height=780');
  if (!w) {
    window.print();
    return;
  }
  w.document.write(`<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>${escapeHtml(book.title)} · 本草智研</title><style>
    body{font-family:"PingFang SC","Microsoft YaHei",sans-serif;color:#1e2421;margin:28px auto;max-width:860px;line-height:1.75;font-size:13.5px}
    h1{font-size:24px;margin:0 0 8px} h2{font-size:18px;margin:24px 0 8px;border-bottom:1px solid #d5dcd7;padding-bottom:4px}
    h3{font-size:15px;margin:16px 0 6px;border-left:3px solid #b45309;padding-left:8px}
    table{border-collapse:collapse;width:100%;margin:10px 0 16px;font-size:12px}
    th,td{border:1px solid #cbd5ce;padding:6px 8px;text-align:left;vertical-align:top} th{background:#edf5f1}
    .box{border:1px solid #cbd5ce;border-left:3px solid #0f5c54;padding:10px 12px;margin:12px 0;background:#fafbf8}
    .num{display:inline-block;background:#0f5c54;color:#fff;padding:1px 7px;border-radius:4px;font-size:11px;margin-right:6px}
    .chips span{display:inline-block;background:#eef3f0;padding:2px 8px;border-radius:12px;margin-right:6px;font-size:11px}
    @media print{body{margin:0}}
  </style></head><body>${book.html}</body></html>`);
  w.document.close();
  setTimeout(() => { w.focus(); w.print(); }, 250);
}

function ensureModal() {
  if (modalEl) return modalEl;
  modalEl = document.createElement('div');
  modalEl.id = 'tcmV26KbModal';
  modalEl.className = 'tcm-kb-backdrop no-print hidden';
  modalEl.innerHTML = `
    <div class="tcm-kb-shell" role="dialog" aria-modal="true" aria-label="中药学六大学科知识库与实践汇编">
      <div class="tcm-kb-head">
        <div class="tcm-kb-head-left">
          <span class="tcm-kb-badge">2025 药典 · 8 册全库</span>
          <h2 class="tcm-kb-head-title">中药学六大学科知识库 &amp; 实践资料汇编</h2>
        </div>
        <div class="tcm-kb-head-tools">
          <div class="tcm-kb-search-wrap">
            <input type="text" id="tcmKbSearchInput" class="tcm-kb-search-input" placeholder="全文检索 8 册（如：HLB / QAMS / 醇沉 / NMR）…" />
            <button type="button" id="tcmKbSearchClear" class="tcm-kb-search-clear" title="清除检索">×</button>
          </div>
          <button type="button" id="tcmKbFontBtn" class="tcm-kb-tool-btn" title="切换舒适大字阅读">Aa 大字</button>
          <button type="button" id="tcmKbPrintBtn" class="tcm-kb-tool-btn" title="打印或导出当前分册 PDF">🖨️ 打印</button>
          <button type="button" id="tcmKbCloseBtn" class="tcm-kb-tool-btn tcm-kb-close-btn" aria-label="关闭知识库">×</button>
        </div>
      </div>
      <div id="tcmKbTabs" class="tcm-kb-tabs"></div>
      <div class="tcm-kb-progress-track"><div id="tcmKbProgressBar" class="tcm-kb-progress-bar"></div></div>
      <div class="tcm-kb-body">
        <aside id="tcmKbToc" class="tcm-kb-toc" aria-label="本册目录"></aside>
        <div id="tcmKbPane" class="tcm-kb-pane"></div>
      </div>
    </div>`;
  document.body.appendChild(modalEl);

  const searchInp = modalEl.querySelector('#tcmKbSearchInput');
  const clearBtn = modalEl.querySelector('#tcmKbSearchClear');
  const pane = modalEl.querySelector('#tcmKbPane');

  modalEl.querySelector('#tcmKbCloseBtn').addEventListener('click', closeModal);
  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) closeModal();
  });

  modalEl.querySelector('#tcmKbFontBtn').addEventListener('click', (e) => {
    largeFont = !largeFont;
    modalEl.querySelector('.tcm-kb-shell').classList.toggle('kb-font-lg', largeFont);
    e.currentTarget.textContent = largeFont ? 'Aa 标准' : 'Aa 大字';
  });

  modalEl.querySelector('#tcmKbPrintBtn').addEventListener('click', printCurrentBook);

  let searchTimer = null;
  searchInp.addEventListener('input', () => {
    searchQuery = searchInp.value.trim();
    clearBtn.classList.toggle('show', searchQuery.length > 0);
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => renderBody(), 120);
  });

  clearBtn.addEventListener('click', () => {
    searchQuery = '';
    searchInp.value = '';
    clearBtn.classList.remove('show');
    renderBody();
    searchInp.focus();
  });

  modalEl.querySelector('#tcmKbTabs').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-kb-tab]');
    if (!btn) return;
    activeBookId = btn.getAttribute('data-kb-tab');
    searchQuery = '';
    searchInp.value = '';
    clearBtn.classList.remove('show');
    renderAll();
  });

  modalEl.querySelector('#tcmKbToc').addEventListener('click', (e) => {
    const bridgeBtn = e.target.closest('[data-kb-bridge]');
    if (bridgeBtn) {
      runBridgeAction(getBook(activeBookId));
      return;
    }
    const tocBtn = e.target.closest('[data-kb-goto]');
    if (!tocBtn) return;
    const secId = tocBtn.getAttribute('data-kb-goto');
    scrollToSection(secId);
  });

  pane.addEventListener('click', (e) => {
    const hit = e.target.closest('[data-kb-hit-book]');
    if (hit) {
      const bId = hit.getAttribute('data-kb-hit-book');
      const sId = hit.getAttribute('data-kb-hit-sec');
      activeBookId = bId;
      searchQuery = '';
      searchInp.value = '';
      clearBtn.classList.remove('show');
      renderAll(sId);
      return;
    }
    const bookLink = e.target.closest('[data-kb-book]');
    if (bookLink) {
      e.preventDefault();
      activeBookId = bookLink.getAttribute('data-kb-book');
      const secId = bookLink.getAttribute('data-kb-sec') || '';
      renderAll(secId);
      return;
    }
    const pagerBtn = e.target.closest('[data-kb-page]');
    if (pagerBtn) {
      activeBookId = pagerBtn.getAttribute('data-kb-page');
      renderAll();
      return;
    }
    const bridgeBtn = e.target.closest('[data-kb-bridge]');
    if (bridgeBtn) {
      runBridgeAction(getBook(activeBookId));
    }
  });

  pane.addEventListener('scroll', () => {
    const max = Math.max(1, pane.scrollHeight - pane.clientHeight);
    const pct = Math.min(100, Math.round((pane.scrollTop / max) * 100));
    const bar = modalEl.querySelector('#tcmKbProgressBar');
    if (bar) bar.style.width = `${pct}%`;

    // Scroll-spy active TOC item
    const sections = pane.querySelectorAll('section[id]');
    let currentId = '';
    const paneTop = pane.getBoundingClientRect().top + 80;
    sections.forEach((s) => {
      if (s.getBoundingClientRect().top <= paneTop) currentId = s.id;
    });
    if (currentId) {
      modalEl.querySelectorAll('#tcmKbToc .tcm-kb-toc-btn').forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-kb-goto') === currentId);
      });
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalEl && !modalEl.classList.contains('hidden')) {
      closeModal();
    }
  });

  return modalEl;
}

function renderTabs() {
  const tabsEl = modalEl.querySelector('#tcmKbTabs');
  tabsEl.innerHTML = TCM_KNOWLEDGE_BOOKS.map((b) => `
    <button type="button" class="tcm-kb-tab ${b.id === activeBookId && !searchQuery ? 'active' : ''}" data-kb-tab="${b.id}">
      <span>${escapeHtml(b.shortTitle)}</span>
    </button>
  `).join('');
}

function renderToc(book) {
  const tocEl = modalEl.querySelector('#tcmKbToc');
  const items = book.toc.map((t, idx) => `
    <button type="button" class="tcm-kb-toc-btn ${t.sub ? 'sub' : ''} ${idx === 0 ? 'active' : ''}" data-kb-goto="${escapeHtml(t.id)}">${escapeHtml(t.title)}</button>
  `).join('');

  const bridgeHtml = book.bridge
    ? `<div class="tcm-kb-bridge-box"><button type="button" class="tcm-kb-bridge-btn" data-kb-bridge="1">${escapeHtml(book.bridge.label)}</button></div>`
    : '';

  tocEl.innerHTML = `<div class="tcm-kb-toc-title">${escapeHtml(book.code)} · 本册目录</div>${items}${bridgeHtml}`;
}

function renderSearchResults(q) {
  const pane = modalEl.querySelector('#tcmKbPane');
  const cache = buildPlainSearchCache();
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hits = [];

  for (const entry of cache) {
    const hay = `${entry.bookShort} ${entry.secTitle} ${entry.text}`.toLowerCase();
    if (terms.every((t) => hay.includes(t))) {
      const idx = entry.text.toLowerCase().indexOf(terms[0]);
      const start = Math.max(0, idx - 36);
      const rawSnippet = (start > 0 ? '…' : '') + entry.text.slice(start, start + 150) + (start + 150 < entry.text.length ? '…' : '');
      let snippet = escapeHtml(rawSnippet);
      for (const t of terms) {
        const re = new RegExp(`(${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        snippet = snippet.replace(re, '<mark>$1</mark>');
      }
      hits.push({ ...entry, snippet });
    }
  }

  pane.scrollTop = 0;
  if (!hits.length) {
    pane.innerHTML = `
      <div class="tcm-kb-search-panel">
        <div class="tcm-kb-article"><div class="box warn"><span class="bt">未找到匹配结果</span><p>8 册知识库中未检索到 “<strong>${escapeHtml(q)}</strong>”。建议尝试简化关键词（如：黄酮、生物碱、HLB、醇沉、大孔树脂、qNMR、QAMS、三结合）。</p></div></div>
      </div>`;
    return;
  }

  pane.innerHTML = `
    <div class="tcm-kb-search-panel">
      <div style="margin-bottom:14px;font-size:0.84rem;font-weight:800;color:#059669">跨 8 册全文检索命中 ${hits.length} 个章节（点击直达）</div>
      ${hits.slice(0, 35).map((h) => `
        <button type="button" class="tcm-kb-search-item" data-kb-hit-book="${h.bookId}" data-kb-hit-sec="${h.secId}">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <span style="padding:2px 8px;border-radius:999px;background:rgba(16,185,129,0.14);color:#047857;font-size:0.7rem;font-weight:800">${escapeHtml(h.bookShort)}</span>
            <strong style="font-size:0.88rem">${escapeHtml(h.secTitle)}</strong>
          </div>
          <div style="font-size:0.78rem;line-height:1.6;opacity:0.86">${h.snippet}</div>
        </button>
      `).join('')}
    </div>`;
}

function scrollToSection(secId) {
  if (!secId || !modalEl) return;
  const pane = modalEl.querySelector('#tcmKbPane');
  const target = pane.querySelector(`#${CSS.escape(secId)}`);
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  target.classList.remove('kb-flash');
  void target.offsetWidth;
  target.classList.add('kb-flash');
}

function renderBody(scrollSecId = '') {
  const book = getBook(activeBookId);
  renderTabs();
  renderToc(book);

  if (searchQuery) {
    renderSearchResults(searchQuery);
    return;
  }

  const pane = modalEl.querySelector('#tcmKbPane');
  const idx = TCM_KNOWLEDGE_BOOKS.findIndex((b) => b.id === book.id);
  const prev = idx > 0 ? TCM_KNOWLEDGE_BOOKS[idx - 1] : null;
  const next = idx < TCM_KNOWLEDGE_BOOKS.length - 1 ? TCM_KNOWLEDGE_BOOKS[idx + 1] : null;

  const pagerHtml = `
    <div class="tcm-kb-pager">
      <div>${prev ? `<button type="button" class="tcm-kb-pager-btn" data-kb-page="${prev.id}">← 上一册：${escapeHtml(prev.shortTitle)}</button>` : ''}</div>
      <div>${book.bridge ? `<button type="button" class="tcm-kb-pager-btn" style="border-color:#059669;color:#047857" data-kb-bridge="1">${escapeHtml(book.bridge.label)}</button>` : ''}</div>
      <div>${next ? `<button type="button" class="tcm-kb-pager-btn" data-kb-page="${next.id}">下一册：${escapeHtml(next.shortTitle)} →</button>` : ''}</div>
    </div>`;

  pane.innerHTML = `<article class="tcm-kb-article">${book.html}</article>${pagerHtml}`;
  enhanceMol3dLinks(pane.querySelector('.tcm-kb-article'));

  const bar = modalEl.querySelector('#tcmKbProgressBar');
  if (bar) bar.style.width = '0%';

  if (scrollSecId) {
    requestAnimationFrame(() => scrollToSection(scrollSecId));
  } else {
    pane.scrollTop = 0;
  }
}

function renderAll(scrollSecId = '') {
  renderBody(scrollSecId);
}

export function openKnowledgeHub(bookId = 'overview', sectionId = '', query = '') {
  ensureModal();
  if (bookId && TCM_KNOWLEDGE_BOOKS.some((b) => b.id === bookId)) {
    activeBookId = bookId;
  }
  searchQuery = String(query || '').trim();
  const inp = modalEl.querySelector('#tcmKbSearchInput');
  const clr = modalEl.querySelector('#tcmKbSearchClear');
  if (inp) inp.value = searchQuery;
  if (clr) clr.classList.toggle('show', searchQuery.length > 0);

  modalEl.classList.remove('hidden');
  renderAll(sectionId);
}

export function closeModal() {
  if (modalEl) modalEl.classList.add('hidden');
}

if (typeof window !== 'undefined') {
  window.TCM_KNOWLEDGE_HUB = {
    ...(window.TCM_KNOWLEDGE_HUB || {}),
    __isLazyProxy: false,
    version: '1.0.0',
    open: openKnowledgeHub,
    close: closeModal,
    books: TCM_KNOWLEDGE_BOOKS
  };
}
