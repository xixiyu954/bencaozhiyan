/* 本草智研 v15 · 实验项目中枢
 * 独立读取现有工作台存档，不消耗 AI Token，不改动原六步工作流。
 */
(function () {
  'use strict';

  const MAIN_KEY = 'bencao_tcm_chem_pro_v8';
  const UI_KEY = 'bencao_v15_insight_v1';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const clamp = (n, min, max) => Math.max(min, Math.min(max, Number(n) || 0));
  const esc = (value) => String(value == null ? '' : value).replace(/[&<>'"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch]));
  const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const fmt = (value, digits = 0) => Number(value || 0).toLocaleString('zh-CN', { maximumFractionDigits: digits });
  const uid = () => `v15_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  let activeTab = 'overview';
  let lastFocus = null;
  let ui = loadUi();

  function loadUi() {
    try {
      const raw = JSON.parse(localStorage.getItem(UI_KEY) || '{}');
      return { recovery: clamp(raw.recovery == null ? 60 : raw.recovery, 0, 95), notes: raw.notes || {}, snapshots: Array.isArray(raw.snapshots) ? raw.snapshots : [] };
    } catch (_) {
      return { recovery: 60, notes: {}, snapshots: [] };
    }
  }

  function saveUi() {
    try { localStorage.setItem(UI_KEY, JSON.stringify(ui)); } catch (_) { toast('浏览器存储空间不足，请先导出或清理旧快照', 'error'); }
  }

  function loadMain() {
    try { return JSON.parse(localStorage.getItem(MAIN_KEY) || '{}'); } catch (_) { return {}; }
  }

  function toast(message, type = 'success') {
    const host = $('#toastContainer');
    if (!host) return;
    const el = document.createElement('div');
    el.className = `px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-xl ${type === 'error' ? 'bg-rose-600' : type === 'info' ? 'bg-slate-800' : 'bg-[#0a3630]'}`;
    el.textContent = message;
    host.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 2600);
  }

  function getContext() {
    const main = loadMain();
    const id = main.activeTopicId || 'current';
    const custom = main.customTopics && main.customTopics[id] ? main.customTopics[id] : {};
    const nameText = ($('#cfgHerbName') && $('#cfgHerbName').textContent || '当前药材 · 目标成分').trim();
    const parts = nameText.split('·').map(x => x.trim());
    const topic = {
      ...custom,
      id,
      herb: custom.herb || parts[0] || '当前药材',
      compound: custom.compound || parts.slice(1).join(' · ') || '目标成分',
      category: custom.category || ($('#cfgCategory') && $('#cfgCategory').textContent.trim()) || '中药化学'
    };
    const fallback = {
      formalTitle: `${topic.herb}中${topic.compound}的提取分离与检识`,
      mass: num($('#cfgMass') && $('#cfgMass').value, 50),
      ratio: num($('#cfgRatio') && $('#cfgRatio').value, 10),
      temp: num($('#cfgTemp') && $('#cfgTemp').value, 60),
      time: num($('#cfgTime') && $('#cfgTime').value, 60),
      cycles: ($('#cfgCycles') && $('#cfgCycles').value) || '2',
      solventType: ($('#cfgSolventType') && $('#cfgSolventType').value) || '70%乙醇',
      mesh: ($('#cfgMesh') && $('#cfgMesh').value) || '中粉(40目)',
      ph: ($('#cfgPh') && $('#cfgPh').value) || '中性 7.0',
      activeRig: topic.defaultRig || '', reportRig: topic.defaultRig || '',
      diyExtract: topic.defaultExtract || '', diySeparate: topic.defaultSep || '', diyDetects: [],
      sopDone: [], batches: [], chemTests: [], reportModules: {}, tlc: {}
    };
    const ws = { ...fallback, ...((main.topicStates && main.topicStates[id]) || {}) };
    ws.tlc = { ...fallback.tlc, ...(ws.tlc || {}) };
    ws.batches = Array.isArray(ws.batches) ? ws.batches : [];
    ws.chemTests = Array.isArray(ws.chemTests) ? ws.chemTests : [];
    ws.sopDone = Array.isArray(ws.sopDone) ? ws.sopDone : [];
    ws.diyDetects = Array.isArray(ws.diyDetects) ? ws.diyDetects : [];
    ws.reportModules = ws.reportModules || {};
    return { main, id, topic, ws };
  }

  function calculate(recovery = ui.recovery) {
    const ctx = getContext();
    const { topic: t, ws } = ctx;
    const mass = Math.max(0, num(ws.mass));
    const ratio = Math.max(0, num(ws.ratio));
    const temp = num(ws.temp);
    const time = Math.max(0, num(ws.time));
    const cycles = Math.max(1, parseInt(ws.cycles, 10) || 1);
    const totalSolvent = Math.round(mass * ratio * cycles);
    const unitSolvent = mass > 0 ? totalSolvent / mass : 0;
    const ethanol = /乙醇/.test(ws.solventType || '');
    const aqueous = /水|硼砂/.test(ws.solventType || '') && !ethanol;
    const effectiveRecovery = ethanol ? clamp(recovery, 0, 95) : 0;
    const recovered = Math.round(totalSolvent * effectiveRecovery / 100);
    const fresh = Math.max(0, totalSolvent - recovered);
    const batches = ws.batches.filter(b => num(b.mass) > 0 && num(b.crude) >= 0);
    const yields = batches.filter(b => num(b.crude) > 0).map(b => num(b.crude) / num(b.mass) * 100);
    const avgYield = yields.length ? yields.reduce((a, b) => a + b, 0) / yields.length : 0;
    const sd = yields.length > 1 ? Math.sqrt(yields.reduce((sum, x) => sum + Math.pow(x - avgYield, 2), 0) / (yields.length - 1)) : 0;
    const rsd = avgYield > 0 ? sd / avgYield * 100 : 0;
    const front = num(ws.tlc.front);
    const sample = num(ws.tlc.sample);
    const ref = num(ws.tlc.ref);
    const tlcValid = front > 0 && sample > 0 && ref > 0 && sample <= front && ref <= front;
    const deltaRf = tlcValid ? Math.abs(sample / front - ref / front) : null;
    const tlcOk = tlcValid && deltaRf <= 0.03;
    const testsPassed = ws.chemTests.filter(x => x && x.passed).length;
    const testsTotal = ws.chemTests.length;
    const sopRatio = ws.sopDone.length ? ws.sopDone.filter(Boolean).length / ws.sopDone.length : 0;
    const selectedReports = Object.values(ws.reportModules).filter(Boolean).length;
    const reportRatio = selectedReports / 9;

    const checks = [];
    const add = (id, title, ok, pass, fix, step, level = 'warn') => checks.push({ id, title, status: ok ? 'pass' : level, desc: ok ? pass : fix, step });
    add('topic', '药材与目标成分已明确', Boolean(t.herb && t.compound), `已锁定「${t.herb} · ${t.compound}」。`, '返回选材页，明确药材和目标成分。', 1);
    add('title', '实验题目完整且可辨识', String(ws.formalTitle || '').trim().length >= 10, '题目包含研究对象与实验任务，可直接用于报告。', '题目过短，建议写清药材、目标成分和实验任务。', 2);
    add('ratio', '料液比处于可操作区间', ratio >= 6 && ratio <= 15, `当前 ${fmt(ratio)} mL/g，兼顾浸润与后续浓缩负担。`, ratio < 6 ? '料液比偏低，需确认药材能否充分浸润并搅拌。' : '料液比偏高，后续过滤、浓缩时间与能耗可能增加。', 2);
    const heatLimit = /挥发|萜类|热敏/.test(`${t.category}${t.prop || ''}`) ? 80 : 100;
    add('temp', '提取温度与成分稳定性匹配', temp > 0 && temp <= heatLimit, `${fmt(temp)}℃ 未超过本类方案的提醒阈值 ${heatLimit}℃。`, `当前 ${fmt(temp)}℃，请核对热敏或挥发性成分风险，并参考原课题工艺。`, 2);
    const phMatch = String(ws.ph || '').match(/(?:\d+(?:\.\d+)?)/);
    add('ph', 'pH 目标已量化', Boolean(phMatch), `已记录目标 pH ${phMatch ? phMatch[0] : ''}，便于复现。`, '请将 pH 写成明确数值或范围，避免只写“适量”“中性”。', 2, 'info');
    add('cycles', '采用多次提取维持浓度梯度', cycles >= 2, `${cycles} 次合并提取，有利于维持固液浓度梯度。`, '单次提取传质推动力下降较快，建议与 2 次提取方案对照。', 2, 'info');
    add('solvent', '溶剂安全与绿色替代已核查', !/石油醚|氯仿|乙醚/.test(ws.solventType || ''), `${ws.solventType} 体系相对便于教学管理，仍须遵守通风与防火规范。`, `${ws.solventType} 涉及易燃或高挥发风险，请确认通风橱、防爆与废液分类条件。`, 3);
    add('rig', '装置与报告装置已联动', Boolean(ws.activeRig && ws.reportRig), '已选择流程装置，可继续核对小分支与关键操作。', '尚未完整选择装置，请到装置与流程页确认。', 4);
    add('sop', '关键 SOP 已逐项确认', sopRatio >= 1, '全部关键操作已勾选，适合进入实操。', `SOP 已确认 ${Math.round(sopRatio * 100)}%，请在实操前逐项核对，不建议跳过气密性与安全步骤。`, 4);
    add('batch', '平行批次满足初步统计要求', batches.length >= 3, `已有 ${batches.length} 批记录，可观察工艺重复性。`, `当前仅 ${batches.length} 批有效记录，建议至少保留 3 批平行数据。`, 5);
    add('rsd', '粗提收率重复性良好', yields.length >= 2 && rsd > 0 && rsd < 5, `粗提收率 RSD 为 ${fmt(rsd, 2)}%，低于 5% 提醒线。`, yields.length < 2 ? '至少需要两批非零收率才能计算 RSD。' : `当前 RSD 为 ${fmt(rsd, 2)}%，请复核称量、转移损失与提取条件。`, 5);
    add('tlc', 'TLC 对照一致性通过预检', tlcOk, `供试品与对照品 ΔRf = ${fmt(deltaRf, 3)}，符合 ≤0.03 的站内预检规则。`, !tlcValid ? '请填写合法的前沿、供试品与对照品迁移距离。' : `ΔRf = ${fmt(deltaRf, 3)}，超过 0.03；请复核点样、展开与测量记录。`, 5);
    add('chem', '特征检识项目已形成证据链', testsTotal > 0 && testsPassed === testsTotal, `${testsPassed}/${testsTotal} 项化学检识已记录为阳性或通过。`, '仍有检识项目未完成，请补充现象、阴阳性判断与对照依据。', 5);
    add('report', '报告章节覆盖完整', selectedReports >= 8, `已选择 ${selectedReports}/9 个报告板块。`, `当前选择 ${selectedReports}/9 个板块，请确认是否遗漏数据、故障排查或结论。`, 6, 'info');

    const deductions = checks.reduce((sum, c) => sum + (c.status === 'warn' ? 8 : c.status === 'info' ? 3 : 0), 0);
    const quality = Math.round(clamp(100 - deductions, 20, 100));
    const stepDefs = [
      { n: 1, label: '选材', detail: `${t.herb} · ${t.compound}`, pct: 100 },
      { n: 2, label: '定题', detail: `${fmt(mass)} g · ${ws.solventType}`, pct: Math.round((Number(String(ws.formalTitle || '').length >= 10) + Number(mass > 0) + Number(ratio > 0)) / 3 * 100) },
      { n: 3, label: '原理与方案', detail: ws.diyNotes ? '已记录设计依据与创新说明' : '可补充设计依据与创新说明', pct: Math.round((Number(Boolean(ws.diyExtract)) + Number(Boolean(ws.diySeparate)) + Number(Boolean(ws.diyDetects.length > 0 || ws.diyNotes))) / 3 * 100) },
      { n: 4, label: '装置与流程', detail: `SOP ${Math.round(sopRatio * 100)}% 已确认`, pct: Math.round((Number(Boolean(ws.activeRig)) * 0.45 + sopRatio * 0.55) * 100) },
      { n: 5, label: '实验数据', detail: `${batches.length} 批 · TLC ${tlcOk ? '通过' : '待复核'}`, pct: Math.round((clamp(batches.length / 3, 0, 1) * 0.5 + (Number(tlcOk) + Number(testsTotal > 0 && testsPassed === testsTotal)) / 2 * 0.5) * 100) },
      { n: 6, label: '报告', detail: `${selectedReports}/9 个板块`, pct: Math.round(clamp(reportRatio, 0, 1) * 100) }
    ];
    const completeness = Math.round(stepDefs.reduce((sum, s) => sum + s.pct, 0) / stepDefs.length);
    const score = Math.round(quality * 0.65 + completeness * 0.35);
    let green = 100 - Math.max(0, unitSolvent - 10) * 2.2 - Math.max(0, temp - 60) * 0.22 - Math.max(0, time * cycles - 90) * 0.05;
    if (ethanol) green += 4 + effectiveRecovery * 0.06;
    if (aqueous) green += 8;
    if (/石油醚|氯仿|乙醚/.test(ws.solventType || '')) green -= 20;
    green = Math.round(clamp(green, 15, 98));
    const timeline = [
      { label: '准备与称量', minutes: 20, color: '#d5a94e' },
      { label: `提取 × ${cycles}`, minutes: Math.max(10, time * cycles), color: '#0f766e' },
      { label: '分离与纯化', minutes: 45, color: '#3b82a0' },
      { label: '检识与测定', minutes: 25, color: '#8b6bb1' },
      { label: '整理与记录', minutes: 20, color: '#73807b' }
    ];
    const duration = timeline.reduce((sum, x) => sum + x.minutes, 0);
    const warnings = checks.filter(c => c.status !== 'pass');
    return { ...ctx, mass, ratio, temp, time, cycles, totalSolvent, unitSolvent, recovered, fresh, effectiveRecovery, batches, yields, avgYield, rsd, deltaRf, tlcOk, testsPassed, testsTotal, sopRatio, selectedReports, checks, quality, completeness, score, green, timeline, duration, warnings, stepDefs };
  }

  function durationText(minutes) {
    const h = Math.floor(minutes / 60), m = Math.round(minutes % 60);
    return h ? `${h} h${m ? ` ${m} min` : ''}` : `${m} min`;
  }

  function ensureShell() {
    if ($('#btnOpenV15')) return;
    const zone = $('#workspaceZoneBar');
    if (zone) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'btnOpenV15';
      btn.className = 'zone-tab v15-nav-button';
      btn.title = '项目总览、设计体检、绿色工艺、便签与版本快照（Alt+P）';
      btn.innerHTML = '<span class="v15-nav-orbit" aria-hidden="true">◎</span><span>项目中枢</span><span class="v15-new-badge">NEW</span>';
      const anchor = $('#btnOpenDiyStudio');
      zone.insertBefore(btn, anchor || null);
      btn.addEventListener('click', open);
    }
    const overlay = document.createElement('div');
    overlay.id = 'v15Overlay';
    overlay.className = 'v15-overlay hidden';
    overlay.innerHTML = `
      <section class="v15-dialog" role="dialog" aria-modal="true" aria-labelledby="v15Title">
        <header class="v15-header no-print">
          <div class="v15-brand-mark" aria-hidden="true"><span></span><span></span><span></span></div>
          <div class="v15-header-title"><h2 id="v15Title">实验项目中枢</h2><p>汇总实验选题、工艺参数、方案体检与排程记录</p></div>
          <div class="v15-header-actions"><button class="v15-btn v15-btn-ghost-light" data-v15-action="export" type="button">导出项目简报</button><button class="v15-close" data-v15-action="close" type="button" aria-label="关闭项目中枢">×</button></div>
        </header>
        <nav class="v15-tabs no-print" aria-label="项目中枢功能">
          <button type="button" data-v15-tab="overview">总览与排程</button>
          <button type="button" data-v15-tab="quality">设计体检 <span id="v15WarnCount" class="v15-tab-count">0</span></button>
          <button type="button" data-v15-tab="green">绿色工艺</button>
          <button type="button" data-v15-tab="notes">实验便签</button>
          <button type="button" data-v15-tab="versions">方案快照</button>
        </nav>
        <main id="v15Content" class="v15-content"></main>
        <footer class="v15-footer"><span>实验设计辅助工具</span><span>体检与绿色指数仅供方案设计参考，请以指导教师审核、药典标准及实测结果为准。</span></footer>
      </section>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', handleClick);
    overlay.addEventListener('submit', handleSubmit);
    overlay.addEventListener('input', handleInput);
    overlay.addEventListener('change', handleChange);
    document.addEventListener('keydown', event => {
      if (event.altKey && (event.key === 'p' || event.key === 'P')) { event.preventDefault(); open(); }
      if (event.key === 'Escape' && !overlay.classList.contains('hidden')) close();
    });
    ensureRibbon();
    updateMini();
  }

  function ensureRibbon() {
    if ($('#v15Mini')) return false;
    const hero = $('#welcomePortalHero');
    if (!hero || !hero.parentNode) return false;
    const mini = document.createElement('section');
    mini.id = 'v15Mini';
    mini.className = 'v15-mini no-print';
    mini.setAttribute('aria-label', '当前方案设计体检摘要');
    hero.parentNode.insertBefore(mini, hero.nextSibling);
    return true;
  }

  function updateMini() {
    const mini = $('#v15Mini');
    if (!mini) return;
    const c = calculate();
    mini.innerHTML = `
      <button type="button" class="v15-mini-main" id="btnV15MiniOpen" aria-label="打开实验项目中枢">
        <span class="v15-mini-icon" aria-hidden="true">◎</span>
        <span class="v15-mini-copy"><span class="v15-mini-kicker">PROJECT PULSE · 方案实时体检</span><strong>${esc(c.topic.herb)}方案已完成 ${c.completeness}%</strong><span>${c.warnings.length ? `发现 ${c.warnings.length} 项可优化细节，建议在实操前逐项核对` : '关键项目均已通过预检，可进入实操复核'}</span></span>
        <span class="v15-mini-metrics"><span><b>${c.score}</b>综合分</span><span><b>${c.green}</b>绿色指数</span><span><b>${durationText(c.duration)}</b>预计排程</span></span>
        <span class="v15-mini-cta">打开项目中枢 <b>→</b></span>
      </button>`;
    $('#btnV15MiniOpen').addEventListener('click', open);
  }

  function open() {
    ensureShell();
    lastFocus = document.activeElement;
    activeTab = 'overview';
    render();
    const overlay = $('#v15Overlay');
    overlay.classList.remove('hidden');
    document.body.classList.add('v15-modal-open');
    const nav = $('#btnOpenV15'); if (nav) nav.classList.add('active');
    setTimeout(() => { const btn = $('.v15-close', overlay); if (btn) btn.focus(); }, 30);
  }

  function close() {
    const overlay = $('#v15Overlay');
    if (overlay) overlay.classList.add('hidden');
    document.body.classList.remove('v15-modal-open');
    const nav = $('#btnOpenV15'); if (nav) nav.classList.remove('active');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function render() {
    const c = calculate();
    const content = $('#v15Content');
    if (!content) return;
    $$('.v15-tabs [data-v15-tab]').forEach(btn => {
      const on = btn.dataset.v15Tab === activeTab;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-selected', String(on));
    });
    const count = $('#v15WarnCount'); if (count) count.textContent = c.warnings.length;
    const views = { overview: renderOverview, quality: renderQuality, green: renderGreen, notes: renderNotes, versions: renderVersions };
    content.innerHTML = (views[activeTab] || renderOverview)(c);
    content.scrollTop = 0;
  }

  function projectHero(c) {
    const status = c.score >= 90 ? '方案状态优秀' : c.score >= 75 ? '方案可继续优化' : '建议先完成关键复核';
    return `<section class="v15-project-hero">
      <div class="v15-project-copy"><div class="v15-overline"><span class="v15-live-dot"></span> 当前项目 · ${esc(c.topic.category)}</div><h3>${esc(c.topic.herb)} <span>×</span> ${esc(c.topic.compound)}</h3><p>${esc(c.ws.formalTitle || '尚未填写正式实验题目')}</p><div class="v15-project-tags"><span>${esc(c.ws.solventType)}</span><span>${fmt(c.mass)} g 投料</span><span>${c.cycles} 次提取</span><span>${esc(c.ws.mesh || '粒度待确认')}</span></div><div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:8px"><button type="button" class="v15-btn" data-v15-action="open-deviation" style="min-height:32px;padding:5px 11px;font-size:11px;background:rgba(255,255,255,0.14);color:#ecfdf5;border:1px solid rgba(255,255,255,0.28)">偏差调查与批间一致性 →</button><button type="button" class="v15-btn" data-v15-action="open-translation" style="min-height:32px;padding:5px 11px;font-size:11px;background:rgba(16,185,129,0.25);color:#ecfdf5;border:1px solid rgba(110,231,183,0.4)">转入产业转化（8阶段）→</button></div></div>
      <div class="v15-score-ring" style="--score:${c.score * 3.6}deg"><div><strong>${c.score}</strong><span>综合设计分</span><small>${status}</small></div></div>
    </section>`;
  }

  function renderOverview(c) {
    const suggestions = c.warnings.length ? c.warnings.slice(0, 3).map(w => `<button type="button" class="v15-suggestion" data-v15-action="go-step" data-step="${w.step}"><span class="v15-suggestion-icon">${w.status === 'warn' ? '!' : 'i'}</span><span><b>${esc(w.title)}</b><small>${esc(w.desc)}</small></span><em>前往处理 →</em></button>`).join('') : '<div class="v15-empty-success">✓ 当前关键检查均已通过。实操中仍请如实记录偏差与异常现象。</div>';
    const total = Math.max(1, c.duration);
    return `${projectHero(c)}
      <section class="v15-kpi-grid">
        ${kpi('总溶剂需求', `${fmt(c.totalSolvent)} mL`, `${fmt(c.unitSolvent, 1)} mL/g · ${c.cycles} 次合并`, 'teal')}
        ${kpi('预计实验排程', durationText(c.duration), `提取段 ${durationText(c.time * c.cycles)} · 含准备与整理`, 'blue')}
        ${kpi('绿色工艺指数', `${c.green} / 100`, c.effectiveRecovery ? `假设回收 ${c.effectiveRecovery}% · 新补充 ${fmt(c.fresh)} mL` : '当前体系按不回收估算', 'gold')}
        ${kpi('数据可靠度', c.batches.length >= 3 && c.rsd < 5 ? '初步稳健' : '待完善', `${c.batches.length} 批平行 · RSD ${fmt(c.rsd, 2)}%`, 'violet')}
      </section>
      <div class="v15-two-col">
        <section class="v15-card"><div class="v15-card-head"><div><span class="v15-section-no">01</span><h3>六步项目完成度</h3></div><span class="v15-soft-badge">内容完整度 ${c.completeness}%</span></div><div class="v15-step-list">${c.stepDefs.map(s => `<button type="button" class="v15-step-row" data-v15-action="go-step" data-step="${s.n}"><span class="v15-step-number ${s.pct === 100 ? 'done' : ''}">${s.pct === 100 ? '✓' : String(s.n).padStart(2, '0')}</span><span class="v15-step-info"><span><b>${s.label}</b><small>${esc(s.detail)}</small></span><span class="v15-progress"><i style="width:${s.pct}%"></i></span></span><strong>${s.pct}%</strong></button>`).join('')}</div></section>
        <section class="v15-card"><div class="v15-card-head"><div><span class="v15-section-no">02</span><h3>下一步优先建议</h3></div><button class="v15-text-btn" data-v15-action="show-quality" type="button">全部 ${c.warnings.length} 项 →</button></div><div class="v15-suggestions">${suggestions}</div><div class="v15-note-callout"><b>体检逻辑</b><span>综合分 = 设计质量 65% + 内容完整度 35%。分数用于定位遗漏，不代表实验成绩或药品质量结论。</span></div></section>
      </div>
      <section class="v15-card v15-schedule-card"><div class="v15-card-head"><div><span class="v15-section-no">03</span><h3>一键实验排程</h3></div><span class="v15-soft-badge">预计 ${durationText(c.duration)}</span></div><div class="v15-timeline-bar">${c.timeline.map(x => `<span style="width:${x.minutes / total * 100}%;--seg:${x.color}" title="${x.label} ${x.minutes} 分钟"></span>`).join('')}</div><div class="v15-timeline-grid">${c.timeline.map((x, i) => `<div><span style="--dot:${x.color}">${String(i + 1).padStart(2, '0')}</span><b>${x.label}</b><small>${durationText(x.minutes)}</small></div>`).join('')}</div><p class="v15-card-footnote">排程依据当前提取时间与次数自动估算；分离、检识等为标准准备时长，可在原始记录中按实际情况修正。</p></section>`;
  }

  function kpi(label, value, detail, color) {
    return `<article class="v15-kpi v15-kpi-${color}"><span>${label}</span><strong>${value}</strong><small>${detail}</small><i aria-hidden="true"></i></article>`;
  }

  function renderQuality(c) {
    const groups = [
      { title: '方案与参数', steps: [1, 2, 3], icon: 'A' },
      { title: '装置与操作', steps: [4], icon: 'B' },
      { title: '数据与报告', steps: [5, 6], icon: 'C' }
    ];
    return `<section class="v15-quality-summary"><div><h3>设计体检报告</h3><p>${c.quality} 分设计质量 · ${c.checks.filter(x => x.status === 'pass').length} 项通过 · ${c.warnings.length} 项建议复核</p></div><button type="button" class="v15-btn v15-btn-primary" data-v15-action="copy">复制体检摘要</button></section>
      <div class="v15-quality-grid">${groups.map(g => `<section class="v15-card"><div class="v15-card-head"><div><span class="v15-section-no">${g.icon}</span><h3>${g.title}</h3></div></div><div class="v15-check-list">${c.checks.filter(x => g.steps.includes(x.step)).map(x => `<article class="v15-check v15-check-${x.status}"><span class="v15-check-status">${x.status === 'pass' ? '✓' : x.status === 'warn' ? '!' : 'i'}</span><div><h4>${esc(x.title)}<span>${x.status === 'pass' ? '通过' : x.status === 'warn' ? '需复核' : '建议'}</span></h4><p>${esc(x.desc)}</p></div>${x.status !== 'pass' ? `<button type="button" data-v15-action="go-step" data-step="${x.step}">去调整</button>` : ''}</article>`).join('')}</div></section>`).join('')}</div>`;
  }

  function renderGreen(c) {
    const ethanol = /乙醇/.test(c.ws.solventType || '');
    const solventPct = clamp(c.unitSolvent / 30 * 100, 4, 100);
    const heatPct = clamp(c.temp / 120 * 100, 4, 100);
    const timePct = clamp(c.time * c.cycles / 240 * 100, 4, 100);
    return `<section class="v15-green-hero"><div><h3>绿色工艺与溶剂核算</h3><p>从单位溶剂强度、温度、提取时长与回收情景四个维度评估工艺负担。</p></div><div class="v15-green-score"><strong>${c.green}</strong><span>绿色指数 / 100</span></div></section>
      <div class="v15-green-layout"><section class="v15-card"><div class="v15-card-head"><div><span class="v15-section-no">01</span><h3>工艺负担画像</h3></div><span class="v15-soft-badge">数值越低越轻量</span></div><div class="v15-burden-list">
        ${burden('单位溶剂强度', `${fmt(c.unitSolvent, 1)} mL/g`, solventPct, '建议结合浸润性，在满足提取的前提下避免过量。')}
        ${burden('提取温度', `${fmt(c.temp)} ℃`, heatPct, '温度提升可加快传质，也需同步评估热敏与能耗。')}
        ${burden('累计提取时长', durationText(c.time * c.cycles), timePct, '多次短时间与单次长时间可通过平行试验比较。')}
      </div><div class="v15-green-formula">单位溶剂强度 = 投料量 ${fmt(c.mass)} g × 料液比 ${fmt(c.ratio)} mL/g × ${c.cycles} 次 ÷ 投料量 = <b>${fmt(c.unitSolvent, 1)} mL/g</b></div></section>
      <section class="v15-card v15-recovery-card"><div class="v15-card-head"><div><span class="v15-section-no">02</span><h3>溶剂回收情景</h3></div><span class="v15-soft-badge">交互测算</span></div><label class="v15-range-label" for="v15Recovery"><span>假设回收率</span><output id="v15RecoveryOut">${c.effectiveRecovery}%</output></label><input id="v15Recovery" type="range" min="0" max="95" step="5" value="${c.effectiveRecovery}" ${ethanol ? '' : 'disabled'}><div class="v15-range-marks"><span>不回收</span><span>教学参考 60%</span><span>95%</span></div><div class="v15-recovery-results"><div><span>理论可回收</span><strong>${fmt(c.recovered)} mL</strong></div><div><span>需新补充</span><strong>${fmt(c.fresh)} mL</strong></div></div><p>${ethanol ? '这是方案比较情景，不代表实际回收率；请用回收前后体积实测值替换假设。' : '当前为非乙醇体系，回收滑块已停用；切换到乙醇方案后可进行情景比较。'}</p></section></div>
      <section class="v15-card"><div class="v15-card-head"><div><span class="v15-section-no">03</span><h3>绿色优化路线</h3></div></div><div class="v15-route-grid"><article><span>01 · 减量</span><h4>比较料液比，而非盲目加大</h4><p>以单位药材溶剂用量为横轴，结合得率与后续浓缩时长寻找平衡点。</p></article><article><span>02 · 替代</span><h4>优先水与乙醇体系</h4><p>在满足选择性的前提下，减少高挥发、高风险溶剂；安全条件仍须教师审核。</p></article><article><span>03 · 循环</span><h4>把回收率写进原始记录</h4><p>记录初始体积、回收体积与损耗，形成可复核的物料衡算证据。</p></article></div></section>`;
  }

  function burden(label, value, pct, tip) {
    return `<div class="v15-burden"><div><span>${label}</span><strong>${value}</strong></div><div class="v15-burden-track"><i style="width:${pct}%"></i></div><p>${tip}</p></div>`;
  }

  function topicNotes(id) {
    if (!Array.isArray(ui.notes[id])) ui.notes[id] = [];
    return ui.notes[id];
  }

  function renderNotes(c) {
    const notes = topicNotes(c.id).slice().sort((a, b) => b.created - a.created);
    return `<section class="v15-notes-head"><div><h3>实验便签与决策记录</h3><p>记录每次参数调整与异常观察，便于课后复盘与讨论撰写。</p></div><button class="v15-btn v15-btn-primary" data-v15-action="export" type="button">导出含便签简报</button></section><div class="v15-notes-layout"><section class="v15-card"><div class="v15-card-head"><div><span class="v15-section-no">＋</span><h3>记录一条发现</h3></div></div><form id="v15NoteForm"><label>记录类型<select name="tag"><option>关键决策</option><option>异常现象</option><option>教师反馈</option><option>文献线索</option><option>下一步</option></select></label><label>内容<textarea name="text" required maxlength="600" placeholder="例如：将料液比从 8 调整为 10 mL/g，因为 8 mL/g 时药粉浸润不充分；下一批记录搅拌状态与过滤时长。"></textarea></label><div class="v15-quick-notes"><span>快速模板</span><button type="button" data-v15-action="note-template" data-text="参数调整：由 ____ 调整为 ____，依据是 ____；下一批重点观察 ____。">参数调整</button><button type="button" data-v15-action="note-template" data-text="异常现象：在 ____ 阶段观察到 ____；已采取 ____；待复核 ____。">异常现象</button><button type="button" data-v15-action="note-template" data-text="答辩证据：本方案选择 ____ 的依据是 ____，对应数据或文献为 ____。">答辩证据</button></div><button class="v15-btn v15-btn-primary v15-full-btn" type="submit">保存到「${esc(c.topic.herb)}」课题</button></form></section><section class="v15-card"><div class="v15-card-head"><div><span class="v15-section-no">${notes.length}</span><h3>课题记录流</h3></div><span class="v15-soft-badge">仅保存在本机</span></div><div class="v15-note-list">${notes.length ? notes.map(n => `<article><div><span>${esc(n.tag)}</span><time>${new Date(n.created).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</time></div><p>${esc(n.text).replace(/\n/g, '<br>')}</p><button type="button" data-v15-action="delete-note" data-id="${n.id}" aria-label="删除这条便签">删除</button></article>`).join('') : '<div class="v15-empty"><span>✎</span><h4>还没有研学便签</h4><p>从一个参数决策或异常现象开始，逐步形成自己的实验证据链。</p></div>'}</div></section></div>`;
  }

  function renderVersions(c) {
    const snapshots = ui.snapshots.filter(s => s.topicId === c.id).sort((a, b) => b.created - a.created);
    return `<section class="v15-version-hero"><div><h3>方案快照对比</h3><p>在本次实验中暂存多套工艺参数组合，便于对比不同提取条件。</p></div><div class="v15-version-count"><strong>${snapshots.length}</strong><span>当前快照</span></div></section><section class="v15-card v15-save-version"><div><h3>保存当前方案</h3><p>${esc(c.topic.herb)} · 综合分 ${c.score} · 总溶剂 ${fmt(c.totalSolvent)} mL</p></div><div class="v15-save-controls"><input id="v15SnapshotName" maxlength="30" placeholder="版本名，如：70%乙醇·第2次优化" value="方案快照 ${new Date().toLocaleDateString('zh-CN')}"><button type="button" class="v15-btn v15-btn-primary" data-v15-action="save-snapshot">保存快照</button></div></section><div class="v15-version-list">${snapshots.length ? snapshots.map(s => `<article class="v15-version-card"><div class="v15-version-line"></div><div class="v15-version-main"><span class="v15-overline">${new Date(s.created).toLocaleString('zh-CN')}</span><h3>${esc(s.name)}</h3><div><span>综合分 <b>${s.score}</b></span><span>总溶剂 <b>${fmt(s.totalSolvent)} mL</b></span><span>绿色指数 <b>${s.green}</b></span></div></div><div class="v15-version-actions"><button type="button" data-v15-action="download-snapshot" data-id="${s.id}">下载</button><button type="button" data-v15-action="restore-snapshot" data-id="${s.id}">载入此版本</button><button type="button" class="danger" data-v15-action="delete-snapshot" data-id="${s.id}">删除</button></div></article>`).join('') : '<div class="v15-empty v15-empty-large"><span>◇</span><h4>还没有版本快照</h4><p>在大幅调整参数前保存一份，就能随时比较或返回。</p></div>'}</div>`;
  }

  function handleClick(event) {
    const tab = event.target.closest('[data-v15-tab]');
    if (tab) { activeTab = tab.dataset.v15Tab; render(); return; }
    const btn = event.target.closest('[data-v15-action]');
    if (!btn) return;
    const action = btn.dataset.v15Action;
    if (action === 'close') close();
    if (action === 'open-deviation') {
      close();
      if (window.TCM_TRANSLATION && window.TCM_TRANSLATION.openDeviation) window.TCM_TRANSLATION.openDeviation('repro');
      return;
    }
    if (action === 'open-translation') {
      const curId = getContext().id;
      close();
      if (window.TCM_TRANSLATION && window.TCM_TRANSLATION.importBankTopic && curId) {
        window.TCM_TRANSLATION.importBankTopic(curId);
      } else if (window.TCM_V16_PORTAL) {
        window.TCM_V16_PORTAL.go('translation');
      }
      return;
    }
    if (action === 'show-quality') { activeTab = 'quality'; render(); }
    if (action === 'go-step') {
      const step = btn.dataset.step;
      close();
      const target = document.querySelector(`#wizardNav [data-wstep="${step}"]`);
      if (target) { target.click(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
      else toast(`请使用顶部第 ${step} 步导航`, 'info');
    }
    if (action === 'copy') copyText(buildMarkdown(calculate(), false), '体检摘要已复制');
    if (action === 'export') download(buildMarkdown(calculate(), true), `本草智研_${getContext().topic.herb}_项目简报.md`, 'text/markdown;charset=utf-8');
    if (action === 'note-template') { const area = $('#v15NoteForm textarea'); if (area) { area.value = btn.dataset.text || ''; area.focus(); } }
    if (action === 'delete-note') {
      const c = getContext();
      ui.notes[c.id] = topicNotes(c.id).filter(n => n.id !== btn.dataset.id);
      saveUi(); render(); toast('便签已删除');
    }
    if (action === 'save-snapshot') saveSnapshot();
    if (action === 'delete-snapshot') {
      ui.snapshots = ui.snapshots.filter(s => s.id !== btn.dataset.id);
      saveUi(); render(); toast('快照已删除');
    }
    if (action === 'download-snapshot') {
      const snap = ui.snapshots.find(s => s.id === btn.dataset.id);
      if (snap) download(JSON.stringify(snap, null, 2), `${snap.name}.v15.json`, 'application/json;charset=utf-8');
    }
    if (action === 'restore-snapshot') restoreSnapshot(btn.dataset.id);
  }

  function handleSubmit(event) {
    if (event.target.id !== 'v15NoteForm') return;
    event.preventDefault();
    const data = new FormData(event.target);
    const text = String(data.get('text') || '').trim();
    if (!text) return;
    const c = getContext();
    topicNotes(c.id).push({ id: uid(), tag: String(data.get('tag') || '关键决策'), text, created: Date.now() });
    saveUi(); render(); toast('研学便签已归档');
  }

  function handleInput(event) {
    if (event.target.id === 'v15Recovery') {
      const out = $('#v15RecoveryOut'); if (out) out.textContent = `${event.target.value}%`;
    }
  }

  function handleChange(event) {
    if (event.target.id === 'v15Recovery') {
      ui.recovery = clamp(event.target.value, 0, 95); saveUi(); render(); updateMini();
    }
  }

  function saveSnapshot() {
    const c = calculate();
    const name = ($('#v15SnapshotName') && $('#v15SnapshotName').value.trim()) || `方案快照 ${new Date().toLocaleString('zh-CN')}`;
    ui.snapshots.push({
      id: uid(), topicId: c.id, name, created: Date.now(), score: c.score, green: c.green, totalSolvent: c.totalSolvent,
      payload: { activeTopicId: c.id, customTopic: c.main.customTopics && c.main.customTopics[c.id] ? c.main.customTopics[c.id] : null, workState: c.ws }
    });
    const others = ui.snapshots.filter(s => s.topicId !== c.id);
    const mine = ui.snapshots.filter(s => s.topicId === c.id).sort((a, b) => b.created - a.created).slice(0, 15);
    ui.snapshots = [...others, ...mine];
    saveUi(); render(); toast('当前方案已保存为版本快照');
  }

  function restoreSnapshot(id) {
    const snap = ui.snapshots.find(s => s.id === id);
    if (!snap || !snap.payload) return;
    if (!window.confirm(`确定载入「${snap.name}」吗？\n\n当前同课题配置将被此快照覆盖。建议先保存当前版本。`)) return;
    const main = loadMain();
    const topicId = snap.payload.activeTopicId || snap.topicId;
    main.activeTopicId = topicId;
    main.customTopics = main.customTopics || {};
    main.topicStates = main.topicStates || {};
    if (snap.payload.customTopic) main.customTopics[topicId] = snap.payload.customTopic;
    main.topicStates[topicId] = snap.payload.workState;
    main.step = 1;
    try { localStorage.setItem(MAIN_KEY, JSON.stringify(main)); location.reload(); } catch (_) { toast('载入失败，请检查浏览器存储权限', 'error'); }
  }

  function buildMarkdown(c, includeNotes) {
    const lines = [
      `# 本草智研 · ${c.topic.herb}实验项目简报`, '',
      `> 导出时间：${new Date().toLocaleString('zh-CN')}  `,
      `> 本简报用于实验设计与学习复盘，不替代教师审核、药典标准与实测记录。`, '',
      '## 一、项目概况', '',
      `- 课题：${c.ws.formalTitle || '未填写'}`,
      `- 药材与成分：${c.topic.herb} · ${c.topic.compound}`,
      `- 分类：${c.topic.category}`,
      `- 综合设计分：${c.score}/100（设计质量 ${c.quality}，内容完整度 ${c.completeness}%）`, '',
      '## 二、核心工艺参数', '',
      '| 参数 | 当前值 |', '| --- | --- |',
      `| 单批投料量 | ${c.mass} g |`, `| 料液比 | ${c.ratio} mL/g |`, `| 提取温度 | ${c.temp} ℃ |`, `| 单次提取时间 | ${c.time} min |`, `| 提取次数 | ${c.cycles} 次 |`, `| 溶剂体系 | ${c.ws.solventType} |`, `| 目标 pH | ${c.ws.ph || '未填写'} |`, `| 总溶剂需求 | ${c.totalSolvent} mL |`, `| 绿色指数 | ${c.green}/100（设计估算） |`, `| 预计排程 | ${durationText(c.duration)} |`, '',
      '## 三、设计体检', '',
      ...c.checks.map(x => `- [${x.status === 'pass' ? 'x' : ' '}] **${x.title}**：${x.desc}`), '',
      '## 四、数据概览', '',
      `- 平行批次：${c.batches.length} 批；粗提收率均值：${fmt(c.avgYield, 2)}%；RSD：${fmt(c.rsd, 2)}%。`,
      `- TLC：${c.tlcOk ? `站内预检通过，ΔRf=${fmt(c.deltaRf, 3)}` : '待补充或复核'}。`,
      `- 化学检识：${c.testsPassed}/${c.testsTotal} 项已记录通过。`, ''
    ];
    if (includeNotes) {
      const notes = topicNotes(c.id).slice().sort((a, b) => a.created - b.created);
      lines.push('## 五、研学便签与决策记录', '');
      if (notes.length) notes.forEach(n => lines.push(`### ${n.tag} · ${new Date(n.created).toLocaleString('zh-CN')}`, '', n.text, ''));
      else lines.push('暂无便签。', '');
    }
    return lines.join('\n');
  }

  function copyText(text, message) {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => toast(message)).catch(() => fallbackCopy(text, message));
    else fallbackCopy(text, message);
  }

  function fallbackCopy(text, message) {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast(message); } catch (_) { toast('复制失败，请使用导出功能', 'error'); }
    ta.remove();
  }

  function download(content, filename, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename.replace(/[\\/:*?"<>|]/g, '_'); document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1200); toast('文件已导出');
  }

  function init() {
    ensureShell();
    const panel = $('#wpanel-1');
    if (panel) new MutationObserver(() => { if (ensureRibbon()) updateMini(); }).observe(panel, { childList: true });
    ['cfgHerbName', 'cfgTotalSolvent'].forEach(id => { const el = document.getElementById(id); if (el) new MutationObserver(updateMini).observe(el, { childList: true, characterData: true, subtree: true }); });
    document.addEventListener('change', event => { if (/^cfg(Mass|Ratio|Temp|Time|Mesh|Cycles|SolventType|Ph)$/.test(event.target.id || '')) setTimeout(updateMini, 30); });
  }

  window.TCM_V15_INSIGHT = { open, close, refresh: render, calculate };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
