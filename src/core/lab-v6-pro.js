// 本草智研 v6.0 旗舰交互引擎（双课题 A vs B 十维度横向对比矩阵 + Ctrl+K 全局极速命令面板 + 快捷键导航）
(function () {
  'use strict';

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }

  function initProSuite(api) {
    // api: { getAllTopics, getTopicById, getRigs, getLiterature, getUnivCases, selectTopic, goStep, openHubRig, copyText, showToast }
    if (!api) return;

    // 1. 注入「双课题横向对比弹窗」与「Ctrl+K 全局命令面板」DOM
    if (!document.getElementById('compareTopicsModal')) {
      const wrap = document.createElement('div');
      wrap.innerHTML = `
        <!-- v6.0 双课题 A vs B 十维度横向对比矩阵弹窗 -->
        <div id="compareTopicsModal" class="no-print fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6">
          <div class="bg-white rounded-3xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div class="px-6 py-4 bg-gradient-to-r from-[#05211d] to-[#0f5c54] text-white flex items-center justify-between gap-2">
              <div>
                <div class="text-[10px] font-extrabold text-emerald-200 tracking-wider">课题横向对比</div>
                <h3 class="text-base sm:text-lg font-extrabold">双课题 A vs B 十维度横向对比矩阵</h3>
              </div>
              <button id="btnCloseCompareModal" type="button" class="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-lg">×</button>
            </div>
            <div class="p-4 sm:p-5 border-b border-slate-100 bg-[#f7f7f4] grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
              <div class="sm:col-span-5">
                <label class="block text-[11px] font-bold text-[#0a3630] mb-1">候选课题 A</label>
                <select id="cmpSelectA" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-bold text-slate-800"></select>
              </div>
              <div class="sm:col-span-5">
                <label class="block text-[11px] font-bold text-amber-900 mb-1">候选课题 B</label>
                <select id="cmpSelectB" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-bold text-slate-800"></select>
              </div>
              <div class="sm:col-span-2">
                <button id="btnCopyCompareMd" type="button" class="w-full py-2 px-3 rounded-xl bg-[#0a3630] hover:bg-[#062420] text-white text-xs font-extrabold transition">复制对比表</button>
              </div>
            </div>
            <div id="cmpTableMount" class="flex-1 overflow-y-auto custom-scroll p-4 sm:p-5"></div>
          </div>
        </div>

        <!-- v6.0 全局极速命令面板 (Ctrl+K / ⌘K) -->
        <div id="cmdPaletteModal" class="no-print fixed inset-0 z-50 hidden items-start justify-center bg-slate-900/55 backdrop-blur-xs pt-14 sm:pt-20 p-4">
          <div class="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full shadow-2xl overflow-hidden">
            <div class="px-4 py-3 border-b border-slate-100 flex items-center gap-2.5 bg-[#fbfcfa]">
              <span class="px-2 py-0.5 rounded-lg bg-[#0a3630] text-emerald-200 text-[10px] font-extrabold">⌘K</span>
              <input id="cmdPaletteInput" type="text" placeholder="输入任意药材、成分、装置、工具名（如：黄连解毒汤 / 旋转蒸发 / 正交 / 标曲 / MSDS）..." class="flex-1 text-sm bg-transparent focus:outline-none text-slate-900 font-medium" />
              <button id="btnCloseCmdPalette" type="button" class="px-2 py-1 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-bold">ESC</button>
            </div>
            <div id="cmdPaletteResults" class="max-h-[60vh] overflow-y-auto custom-scroll p-2.5 space-y-1"></div>
            <div class="px-4 py-2 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between text-[10.5px] text-slate-500">
              <span>快捷键：<kbd class="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono">Ctrl+K</kbd> 极速搜索 · <kbd class="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono">Alt+1~6</kbd> 切步骤 · <kbd class="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono">Alt+H</kbd> 装置库</span>
              <span class="font-bold text-[#0f5c54]">全站极速检索</span>
            </div>
          </div>
        </div>`;
      document.body.appendChild(wrap);
    }

    // ============ 双课题对比逻辑 ============
    const cmpModal = document.getElementById('compareTopicsModal');
    const selA = document.getElementById('cmpSelectA');
    const selB = document.getElementById('cmpSelectB');
    const cmpMount = document.getElementById('cmpTableMount');
    let lastCmpMd = '';

    function greenBadge(solvent) {
      const s = String(solvent || '');
      if (/纯化水|NADES|水/.test(s) && !/乙醇|氯仿/.test(s)) return '🟢 极佳（纯水/绿色低共熔）';
      if (/乙醇/.test(s)) return '🟢 良好（低毒乙醇体系）';
      if (/氯仿|三氯甲烷|石油醚|乙醚/.test(s)) return '🟠 需防爆/通风橱管控';
      return '🔵 常规实验室体系';
    }

    function renderCompareTable() {
      const a = api.getTopicById(selA.value);
      const b = api.getTopicById(selB.value);
      if (!a || !b) return;
      const rigs = api.getRigs();
      const rigName = k => rigs[k]?.title || k;
      const cfgA = a.defaultCfg || {}, cfgB = b.defaultCfg || {};
      const solVolA = (Number(cfgA.mass) || 50) * (Number(cfgA.ratio) || 10) * (Number(cfgA.cycles) || 2);
      const solVolB = (Number(cfgB.mass) || 50) * (Number(cfgB.ratio) || 10) * (Number(cfgB.cycles) || 2);

      const rows = [
        ['目标活性成分', a.compound, b.compound],
        ['化学结构大类', a.category, b.category],
        ['药典参考限度', `≥ ${a.limitVal}${a.limitUnit || '%'}`, `≥ ${b.limitVal}${b.limitUnit || '%'}`],
        ['推荐提取溶剂与绿色度', `${cfgA.solventType || '70%乙醇'} · ${greenBadge(cfgA.solventType)}`, `${cfgB.solventType || '70%乙醇'} · ${greenBadge(cfgB.solventType)}`],
        ['工艺温度 / 时长 / 次数', `${cfgA.temp || 75}℃ · ${cfgA.time || 60} min · ${cfgA.cycles || 2} 次`, `${cfgB.temp || 75}℃ · ${cfgB.time || 60} min · ${cfgB.cycles || 2} 次`],
        ['单批总溶剂耗量估算', `${solVolA} mL（投料 ${cfgA.mass || 50}g）`, `${solVolB} mL（投料 ${cfgB.mass || 50}g）`],
        ['核心适用实验装置', (a.applicableRigs || [a.defaultRig]).map(rigName).join(' → '), (b.applicableRigs || [b.defaultRig]).map(rigName).join(' → ')],
        ['TLC 薄层检识体系', a.tlcSystem || '按药典同板对照', b.tlcSystem || '按药典同板对照'],
        ['参考熔点 / 性状指标', a.mpRef || '按标准品核对', b.mpRef || '按标准品核对'],
        ['创新与中西医结合亮点', a.integrative || a.origin || '', b.integrative || b.origin || '']
      ];

      lastCmpMd = `| 对比维度 | 课题 A：${a.herb} | 课题 B：${b.herb} |\n| --- | --- | --- |\n` +
        rows.map(r => `| ${r[0]} | ${String(r[1]).replace(/\|/g, '/')} | ${String(r[2]).replace(/\|/g, '/')} |`).join('\n');

      cmpMount.innerHTML = `
        <div class="overflow-x-auto rounded-2xl border border-slate-200">
          <table class="w-full text-xs text-left border-collapse">
            <thead>
              <tr class="bg-[#0a3630] text-white">
                <th class="py-2.5 px-3 w-36">对比维度</th>
                <th class="py-2.5 px-3">课题 A：${esc(a.herb)}</th>
                <th class="py-2.5 px-3">课题 B：${esc(b.herb)}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              ${rows.map((r, i) => `
                <tr class="${i % 2 ? 'bg-slate-50/70' : 'bg-white'}">
                  <td class="py-2.5 px-3 font-extrabold text-[#0a3630] align-top">${esc(r[0])}</td>
                  <td class="py-2.5 px-3 text-slate-700 leading-relaxed align-top">${esc(r[1])}</td>
                  <td class="py-2.5 px-3 text-slate-700 leading-relaxed align-top">${esc(r[2])}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div class="flex flex-wrap justify-end gap-2 pt-3">
          <button type="button" id="btnLoadCmpA" class="px-3.5 py-2 rounded-xl bg-teal-50 border border-teal-200 text-[#0a3630] text-xs font-extrabold hover:bg-teal-100">选用课题 A 进工作台</button>
          <button type="button" id="btnLoadCmpB" class="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-extrabold hover:bg-amber-100">选用课题 B 进工作台</button>
        </div>`;

      cmpMount.querySelector('#btnLoadCmpA').onclick = () => { api.selectTopic(a.id); closeCompare(); };
      cmpMount.querySelector('#btnLoadCmpB').onclick = () => { api.selectTopic(b.id); closeCompare(); };
    }

    function openCompare(defaultIdA, defaultIdB) {
      const list = api.getAllTopics();
      const optsHtml = list.map(item => `<option value="${esc(item.id)}">${esc(item.herb)} · ${esc(item.compound)} [${esc(item.category)}]</option>`).join('');
      selA.innerHTML = optsHtml;
      selB.innerHTML = optsHtml;
      selA.value = defaultIdA || list[0]?.id || 'mint';
      selB.value = defaultIdB || (list.find(x => x.id === 'cinnamon_oil' || x.id === 'huanglian_jiedu' || x.id !== selA.value)?.id) || 'coptis';
      renderCompareTable();
      cmpModal.classList.remove('hidden');
      cmpModal.classList.add('flex');
    }
    function closeCompare() {
      cmpModal.classList.add('hidden');
      cmpModal.classList.remove('flex');
    }

    selA.addEventListener('change', renderCompareTable);
    selB.addEventListener('change', renderCompareTable);
    document.getElementById('btnCloseCompareModal').onclick = closeCompare;
    cmpModal.addEventListener('click', e => { if (e.target === cmpModal) closeCompare(); });
    document.getElementById('btnCopyCompareMd').onclick = () => api.copyText(lastCmpMd, '已复制 Markdown 双课题十维对比表');

    // ============ 全局极速命令面板 (Ctrl+K) ============
    const cmdModal = document.getElementById('cmdPaletteModal');
    const cmdInput = document.getElementById('cmdPaletteInput');
    const cmdRes = document.getElementById('cmdPaletteResults');

    function buildCommandIndex() {
      const items = [
        { type: '工具', tagCls: 'bg-indigo-100 text-indigo-800', title: '⚖️ 双课题 A vs B 十维度横向对比矩阵', sub: '任选全库任意两项课题横向对比工艺、溶剂与限度', run: () => openCompare() },
        { type: '工具', tagCls: 'bg-sky-100 text-sky-800', title: '📊 UV-Vis 标准曲线拟合与含量测定计算器', sub: '前往 Step 5 拟合 A=kC+b 与 R² 并反算药材含量', run: () => { api.goStep(5); setTimeout(() => document.getElementById('step5UvCalCard')?.scrollIntoView({ behavior: 'smooth' }), 150); } },
        { type: '工具', tagCls: 'bg-teal-100 text-[#0a3630]', title: '📐 L₉(3⁴) 正交实验设计与极差 R 分析器', sub: '前往 Step 5 自动计算均值 k、极差 R 与最优组合', run: () => { api.goStep(5); setTimeout(() => document.getElementById('step5OrthoCard')?.scrollIntoView({ behavior: 'smooth' }), 150); } },
        { type: '工具', tagCls: 'bg-emerald-100 text-emerald-900', title: '🧪 TLC 展开剂极性调优器与 10 种溶剂极性速查', sub: '前往 Step 5 诊断 Rf 偏高/偏低与拖尾处方', run: () => { api.goStep(5); setTimeout(() => document.getElementById('step5TlcTunerCard')?.scrollIntoView({ behavior: 'smooth' }), 150); } },
        { type: '工具', tagCls: 'bg-rose-100 text-rose-900', title: '🛡️ 智能试剂安全 MSDS 与废液分类助手', sub: '前往 Step 4 查看防护规范与含卤/非卤废液桶归口', run: () => { api.goStep(4); setTimeout(() => document.getElementById('step4SafetyMatrix')?.scrollIntoView({ behavior: 'smooth' }), 150); } },
        { type: '工具', tagCls: 'bg-amber-100 text-amber-900', title: '🏭 小试 → 药企中试四级放大与溶剂回收核算器', sub: '前往 Step 2 测算 50g~50kg 罐体容积与溶剂回收', run: () => { api.goStep(2); setTimeout(() => document.getElementById('step2ScaleUpCard')?.scrollIntoView({ behavior: 'smooth' }), 150); } },
        { type: '工具', tagCls: 'bg-amber-100 text-amber-900', title: '🎓 实验答辩高频 5 问速测卡', sub: '前往 Step 6 演练当前课题导师高频答辩问答', run: () => { api.goStep(6); setTimeout(() => document.getElementById('step6DefenseQuizCard')?.scrollIntoView({ behavior: 'smooth' }), 150); } }
      ];
      Object.entries(api.getRigs()).forEach(([k, r]) => {
        items.push({
          type: '装置', tagCls: 'bg-amber-100 text-amber-900',
          title: `⚙️ ${r.title}`,
          sub: `${r.stageTag || '动态装置'} · 精准B站词：${r.videoKw || ''}`,
          run: () => api.openHubRig(k)
        });
      });
      api.getAllTopics().forEach(t => {
        items.push({
          type: '课题', tagCls: 'bg-teal-50 text-[#0f5c54]',
          title: `🌿 ${t.herb} · ${t.compound}`,
          sub: `${t.category}${t.sourceTag ? ' · ' + t.sourceTag : ''}`,
          run: () => api.selectTopic(t.id)
        });
      });
      return items;
    }

    function renderCmdResults(q) {
      const query = String(q || '').trim().toLowerCase();
      const all = buildCommandIndex();
      const matched = query
        ? all.filter(x => `${x.type} ${x.title} ${x.sub}`.toLowerCase().includes(query)).slice(0, 18)
        : all.slice(0, 14);
      if (!matched.length) {
        cmdRes.innerHTML = '<div class="p-6 text-center text-xs text-slate-400">未找到匹配项，试试输入“薄荷”、“黄连解毒汤”、“HPLC”、“正交”或“标曲”</div>';
        return;
      }
      cmdRes.innerHTML = matched.map((item, idx) => `
        <button type="button" data-cmd-i="${idx}" class="w-full text-left px-3 py-2.5 rounded-2xl hover:bg-teal-50/80 flex items-center justify-between gap-3 transition">
          <div class="min-w-0">
            <div class="text-xs sm:text-sm font-bold text-slate-900 truncate">${esc(item.title)}</div>
            <div class="text-[11px] text-slate-500 truncate">${esc(item.sub)}</div>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${item.tagCls}">${esc(item.type)}</span>
        </button>`).join('');
      cmdRes.querySelectorAll('[data-cmd-i]').forEach(btn => {
        btn.onclick = () => {
          const item = matched[Number(btn.dataset.cmdI)];
          closeCmdPalette();
          if (item && item.run) item.run();
        };
      });
    }

    function openCmdPalette() {
      cmdModal.classList.remove('hidden');
      cmdModal.classList.add('flex');
      cmdInput.value = '';
      renderCmdResults('');
      setTimeout(() => cmdInput.focus(), 40);
    }
    function closeCmdPalette() {
      cmdModal.classList.add('hidden');
      cmdModal.classList.remove('flex');
    }

    cmdInput.addEventListener('input', e => renderCmdResults(e.target.value));
    document.getElementById('btnCloseCmdPalette').onclick = closeCmdPalette;
    cmdModal.addEventListener('click', e => { if (e.target === cmdModal) closeCmdPalette(); });

    // 全局快捷键绑定
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (cmdModal.classList.contains('hidden')) openCmdPalette(); else closeCmdPalette();
      } else if (e.key === 'Escape') {
        closeCmdPalette();
        closeCompare();
      } else if (e.altKey && ['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        e.preventDefault();
        api.goStep(Number(e.key));
      } else if (e.altKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        api.goStep('hub');
      }
    });

    // 绑定顶栏触发按钮
    const btnCmd = document.getElementById('btnOpenCmdPalette');
    if (btnCmd) btnCmd.onclick = openCmdPalette;
    const btnCmp = document.getElementById('btnOpenCompareTop');
    if (btnCmp) btnCmp.onclick = () => openCompare();

    return { openCompare, openCmdPalette };
  }

  window.TCM_V6_PRO = Object.freeze({ initProSuite });
})();
