// 本草智研 v3.0 零消耗科研交互工具箱（TLC展开剂调优器 / 智能MSDS安全废液助手 / L9(3^4)正交实验极差分析器 / 答辩5问速测卡）
(function () {
  'use strict';

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }

  // ============ 工具 1：智能试剂安全 MSDS 与废液分类助手（Step 4） ============
  function renderSafetyMatrix(mountEl, t, ws, copyFn) {
    if (!mountEl) return;
    const db = window.TCM_V3_DATA?.REAGENT_MSDS_DB || [];
    const blob = [
      ws.solventType, ws.ph, t.tlcSystem, t.chemistry,
      ...(t.steps || []).map(s => `${s.title} ${s.operation || ''} ${s.reagents || ''}`),
      ...(t.sop || [])
    ].join(' ');

    const matched = db.filter(item => item.match.test(blob));
    const list = matched.length ? matched : [
      { name: '纯化水与常规玻璃器皿', level: '低风险', badgeCls: 'bg-emerald-100 text-emerald-900', ppe: '实验服 + 防烫手套', waste: '常规水相排口（药渣投干湿垃圾）', tip: '加热沸腾实验必加沸石并先通冷却水。' }
    ];

    const summaryText = `【${t.herb}实验安全与废液分类清单】\n` + list.map((x, i) => `${i + 1}. ${x.name}（${x.level}）｜防护：${x.ppe}｜废液归口：${x.waste}｜注意：${x.tip}`).join('\n');

    mountEl.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div class="flex items-center gap-2">
          <span class="w-7 h-7 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-extrabold text-xs">🛡️</span>
          <div>
            <h3 class="text-sm sm:text-base font-extrabold text-slate-900">智能试剂安全 MSDS 与废液分类助手</h3>
            <p class="text-[11px] text-slate-500">已自动识别本课题涉及的 ${list.length} 类试剂与耗材，精准标注防护要求与废液归口</p>
          </div>
        </div>
        <button id="btnCopySafetyList" type="button" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition">复制安全清单</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        ${list.map(item => `
          <div class="p-3 rounded-2xl bg-[#fbfcfa] border border-slate-200/80 space-y-1.5 text-xs">
            <div class="flex items-center justify-between gap-2">
              <strong class="text-slate-900">${esc(item.name)}</strong>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold ${item.badgeCls}">${esc(item.level)}</span>
            </div>
            <div class="text-[11px] text-slate-600"><strong class="text-slate-800">防护：</strong>${esc(item.ppe)}</div>
            <div class="text-[11px] text-[#0f5c54] font-bold">♻ 废液归口：${esc(item.waste)}</div>
            <div class="text-[11px] text-amber-900 bg-amber-50/70 rounded-lg px-2 py-1">${esc(item.tip)}</div>
          </div>`).join('')}
      </div>`;

    const btn = mountEl.querySelector('#btnCopySafetyList');
    if (btn && copyFn) btn.onclick = () => copyFn(summaryText, '已复制试剂安全与废液分类清单');
  }

  // ============ 工具 2：TLC 展开剂极性调优与溶剂极性速查器（Step 5） ============
  function renderTlcTuner(mountEl, t) {
    if (!mountEl) return;
    const solvents = window.TCM_V3_DATA?.SOLVENT_POLARITY_TABLE || [];
    const defaultNature = /生物碱/.test(t.category) ? 'alkaloid' : /挥发油|萜类/.test(t.category) ? 'neutral' : 'acidic';

    mountEl.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div class="flex items-center gap-2">
          <span class="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-extrabold text-xs">🧪</span>
          <div>
            <h3 class="text-sm sm:text-base font-extrabold text-slate-900">TLC 展开剂极性调优器 &amp; 常用溶剂极性速查</h3>
            <p class="text-[11px] text-slate-500">0-Token 实时诊断薄层拖尾、Rf 偏高/偏低，给出精准配比微调方案</p>
          </div>
        </div>
        <span class="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 text-[10px] font-bold">正相硅胶板</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label class="block text-[11px] font-bold text-slate-700 mb-1">1. 当前 TLC 实测异常现象</label>
          <select id="tlcDiagIssue" class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800">
            <option value="low_rf">斑点趴在原点跑不动（Rf &lt; 0.20）</option>
            <option value="high_rf">斑点冲到前沿顶线（Rf &gt; 0.80）</option>
            <option value="tailing">斑点拉长严重拖尾（Tailing）</option>
            <option value="smile">边缘效应 / 斑点呈微笑曲线</option>
            <option value="overlap">多组分斑点重叠分离度差</option>
          </select>
        </div>
        <div>
          <label class="block text-[11px] font-bold text-slate-700 mb-1">2. 目标成分酸碱极性属性</label>
          <select id="tlcDiagNature" class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800">
            <option value="acidic" ${defaultNature === 'acidic' ? 'selected' : ''}>弱酸性成分（黄酮 / 酚酸 / 蒽醌 / 香豆素）</option>
            <option value="alkaloid" ${defaultNature === 'alkaloid' ? 'selected' : ''}>碱性成分（生物碱 / 胺类）</option>
            <option value="neutral" ${defaultNature === 'neutral' ? 'selected' : ''}>中性成分（挥发油 / 萜类 / 皂苷 / 甾体）</option>
          </select>
        </div>
      </div>
      <div id="tlcDiagAdvice" class="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 leading-relaxed"></div>
      <div class="space-y-1.5">
        <div class="text-[11px] font-bold text-slate-700">常用 10 种溶剂极性指数（P' 由弱到强）与液-液萃取上下层速查：</div>
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[10.5px]">
          ${solvents.map(s => `
            <div class="p-2 rounded-xl border border-slate-200/80" style="background:${s.color}">
              <div class="font-extrabold text-slate-900 truncate">${esc(s.name)}</div>
              <div class="text-slate-700 tabular-nums">P' = <strong>${s.p}</strong> · ${esc(s.bp)}</div>
              <div class="text-[10px] text-slate-600">${esc(s.density)}</div>
            </div>`).join('')}
        </div>
      </div>`;

    const updateAdvice = () => {
      const issue = mountEl.querySelector('#tlcDiagIssue')?.value || 'low_rf';
      const nature = mountEl.querySelector('#tlcDiagNature')?.value || 'acidic';
      const adv = mountEl.querySelector('#tlcDiagAdvice');
      if (!adv) return;
      let html = '';
      if (issue === 'low_rf') {
        html = '<strong>📈 极性增强调优方案：</strong>正相硅胶板上 Rf 偏低说明展开剂洗脱力不足。建议将<strong>强极性组分</strong>（如乙酸乙酯、甲醇或丙酮）体积占比上调 <strong>+5% ~ +15%</strong>（如石油醚-乙酸乙酯由 10:1 改为 5:1，或氯仿-甲醇由 20:1 改为 10:1），目标将主斑点拉升至黄金区间 <strong>Rf = 0.30 ~ 0.55</strong>。';
      } else if (issue === 'high_rf') {
        html = '<strong>📉 极性减弱调优方案：</strong>斑点冲顶说明展开剂极性过强。建议大幅提高<strong>弱极性稀释剂</strong>（石油醚、正己烷、环己烷或甲苯）占比，将强极性溶剂比例减半，使主斑点回落至 <strong>Rf = 0.30 ~ 0.55</strong>。';
      } else if (issue === 'tailing') {
        if (nature === 'acidic') {
          html = '<strong>🔧 酸性成分防拖尾处方：</strong>黄酮/酚酸/蒽醌因解离导致拖尾！在现有展开剂体系中加入 <strong>0.5% ~ 2% 甲酸或冰醋酸</strong> 抑制羧基/酚羟基电离，同时将点样浓度稀释 2 倍、斑点直径控在 ≤ 2 mm，即可瞬间收敛成圆整斑点！';
        } else if (nature === 'alkaloid') {
          html = '<strong>🔧 生物碱防拖尾处方：</strong>硅胶呈微酸性会死拽碱性生物碱！在展开剂中加入 <strong>0.5% ~ 1% 二乙胺或浓氨试液</strong>，或于展开缸内放一小杯浓氨水<strong>氨蒸气预饱和 15 min</strong>（亦可改用 1% NaOH 碱化硅胶板），拖尾立消！';
        } else {
          html = '<strong>🔧 中性成分防拖尾处方：</strong>多由<strong>点样过浓超载</strong>或样品含微量水/油脂引起。建议将供试品稀释 2~3 倍、微量点样（1~2 μL），并确保展开前硅胶板 105℃ 活化 30 min 除湿。';
        }
      } else if (issue === 'smile') {
        html = '<strong>📐 消除边缘效应处方：</strong>展开缸内壁务必紧贴半圈滤纸并被展开剂充分浸润，盖紧缸盖<strong>预饱和 20~30 min</strong>；点样位置距板左右边缘至少保留 <strong>1.5 cm</strong>。';
      } else {
        html = '<strong>🎯 提升分离度处方：</strong>保持混合展开剂总极性 P\' 近似不变，更换<strong>选择性不同的溶剂对</strong>（例如将“石油醚-乙酸乙酯”切换为“甲苯-丙酮”或“二氯甲烷-甲醇”），或采用<strong>二次同向展开法</strong>拉大相邻斑点间距。';
      }
      adv.innerHTML = html;
    };
    mountEl.querySelector('#tlcDiagIssue')?.addEventListener('change', updateAdvice);
    mountEl.querySelector('#tlcDiagNature')?.addEventListener('change', updateAdvice);
    updateAdvice();
  }

  // ============ 工具 3：L9(3^4) 三因素三水平正交实验设计与极差 R 自动分析器（Step 5） ============
  const L9_MATRIX = [
    [1, 1, 1], [1, 2, 2], [1, 3, 3],
    [2, 1, 2], [2, 2, 3], [2, 3, 1],
    [3, 1, 3], [3, 2, 1], [3, 3, 2]
  ];

  function renderOrthogonalTool(mountEl, t, ws, copyFn, onSyncConclusion) {
    if (!mountEl) return;
    if (!Array.isArray(ws.orthoYields) || ws.orthoYields.length !== 9) {
      const base = Math.max(0.5, Number(t.limitVal) || 1.2);
      ws.orthoYields = [0.88, 1.05, 1.02, 1.08, 1.24, 1.15, 1.04, 1.19, 1.12].map(k => Number((base * k).toFixed(2)));
    }
    const r0 = Math.max(4, Number(ws.ratio) || 10);
    const t0 = Math.max(30, Number(ws.temp) || 75);
    const tm0 = Math.max(20, Number(ws.time) || 60);
    const factors = [
      { code: 'A', name: '料液比(mL/g)', levels: [Math.max(4, r0 - 2), r0, r0 + 2] },
      { code: 'B', name: '提取温度(℃)', levels: [Math.max(25, t0 - 10), t0, Math.min(100, t0 + 10)] },
      { code: 'C', name: '提取时间(min)', levels: [Math.max(15, tm0 - 15), tm0, tm0 + 15] }
    ];

    const calcRange = (yields) => {
      const stats = factors.map((f, fi) => {
        const kSum = [0, 0, 0];
        L9_MATRIX.forEach((row, ri) => { kSum[row[fi] - 1] += (Number(yields[ri]) || 0); });
        const kAvg = kSum.map(v => v / 3);
        const R = Math.max(...kAvg) - Math.min(...kAvg);
        const bestIdx = kAvg.indexOf(Math.max(...kAvg));
        return { code: f.code, name: f.name, kAvg, R, bestLevel: bestIdx + 1, bestVal: f.levels[bestIdx] };
      });
      const ranked = [...stats].sort((a, b) => b.R - a.R);
      return { stats, ranked };
    };

    const draw = () => {
      const { stats, ranked } = calcRange(ws.orthoYields);
      const orderStr = ranked.map(x => `${x.code}(${x.name.split('(')[0]})`).join(' > ');
      const bestCombo = stats.map(x => `${x.code}${x.bestLevel}`).join('');
      const bestDetail = stats.map(x => `${x.name.split('(')[0]} ${x.bestVal}`).join('、');
      const orthoSummary = `针对「${t.herb} · ${t.compound}」开展 L₉(3⁴) 正交工艺优化，极差分析表明各因素影响主次顺序为 ${orderStr}（极差 R 分别为 ${ranked.map(x => `${x.code}=${x.R.toFixed(3)}`).join('，')}）；优选最佳提取工艺组合为 ${bestCombo}（即 ${bestDetail}）。`;

      mountEl.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div class="flex items-center gap-2">
            <span class="w-7 h-7 rounded-xl bg-teal-50 text-[#0f5c54] flex items-center justify-center font-extrabold text-xs">📐</span>
            <div>
              <h3 class="text-sm sm:text-base font-extrabold text-slate-900">L₉(3⁴) 正交实验设计与极差 R 自动分析器</h3>
              <p class="text-[11px] text-slate-500">自动以左侧配置单参数为中心生成 3 因素 3 水平正交表，实时计算均值 k、极差 R 与最优组合</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <button id="btnCopyOrthoSummary" type="button" class="px-3 py-1.5 rounded-xl bg-[#0a3630] text-white text-xs font-bold hover:bg-[#062420] transition">复制正交结论写入报告</button>
            <button id="btnExportOrthoCsv" type="button" class="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition">导出 CSV</button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div class="lg:col-span-7 overflow-x-auto custom-scroll rounded-2xl border border-slate-200">
            <table class="w-full text-xs text-center border-collapse">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th class="py-2 px-2">试验号</th>
                  <th class="py-2 px-2">A 料液比</th>
                  <th class="py-2 px-2">B 温度(℃)</th>
                  <th class="py-2 px-2">C 时间(min)</th>
                  <th class="py-2 px-2">实测收率 (%)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white tabular-nums">
                ${L9_MATRIX.map((row, ri) => `
                  <tr class="hover:bg-teal-50/30">
                    <td class="py-1.5 px-2 font-bold text-slate-500">#${ri + 1}</td>
                    <td class="py-1.5 px-2">1:${factors[0].levels[row[0] - 1]} <span class="text-[10px] text-slate-400">(A${row[0]})</span></td>
                    <td class="py-1.5 px-2">${factors[1].levels[row[1] - 1]}℃ <span class="text-[10px] text-slate-400">(B${row[1]})</span></td>
                    <td class="py-1.5 px-2">${factors[2].levels[row[2] - 1]}m <span class="text-[10px] text-slate-400">(C${row[2]})</span></td>
                    <td class="py-1 px-2"><input type="number" step="0.01" min="0" data-ortho-i="${ri}" value="${ws.orthoYields[ri]}" class="w-20 px-2 py-1 text-center rounded-lg border border-slate-200 font-bold text-[#0a3630] tabular-nums" /></td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
          <div class="lg:col-span-5 space-y-3">
            <div class="p-3.5 rounded-2xl bg-[#062420] text-white space-y-2 text-xs">
              <div class="text-[11px] text-emerald-300 font-bold">极差 R 实时分析结论</div>
              <div class="flex items-center justify-between"><span class="text-teal-100/80">主次因素排序</span><strong class="text-amber-300">${esc(orderStr)}</strong></div>
              <div class="flex items-center justify-between"><span class="text-teal-100/80">最优工艺组合</span><strong class="text-emerald-300 text-sm">${esc(bestCombo)}</strong></div>
              <div class="text-[11px] text-teal-100/90 pt-1 border-t border-white/10">推荐参数：${esc(bestDetail)}</div>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white overflow-hidden text-[11px]">
              <table class="w-full text-center border-collapse tabular-nums">
                <thead><tr class="bg-slate-50 border-b border-slate-200 text-slate-600"><th class="py-1.5">指标</th><th>A 料液比</th><th>B 温度</th><th>C 时间</th></tr></thead>
                <tbody class="divide-y divide-slate-100">
                  <tr><td class="py-1.5 font-bold text-slate-500">k₁</td>${stats.map(s => `<td>${s.kAvg[0].toFixed(2)}%</td>`).join('')}</tr>
                  <tr><td class="py-1.5 font-bold text-slate-500">k₂</td>${stats.map(s => `<td>${s.kAvg[1].toFixed(2)}%</td>`).join('')}</tr>
                  <tr><td class="py-1.5 font-bold text-slate-500">k₃</td>${stats.map(s => `<td>${s.kAvg[2].toFixed(2)}%</td>`).join('')}</tr>
                  <tr class="bg-amber-50/70 font-extrabold text-amber-950"><td class="py-1.5">极差 R</td>${stats.map(s => `<td>${s.R.toFixed(3)}</td>`).join('')}</tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>`;

      mountEl.querySelectorAll('[data-ortho-i]').forEach(inp => {
        inp.addEventListener('change', () => {
          ws.orthoYields[Number(inp.dataset.orthoI)] = Number(inp.value) || 0;
          draw();
        });
      });
      const btnCopy = mountEl.querySelector('#btnCopyOrthoSummary');
      if (btnCopy) btnCopy.onclick = () => {
        if (onSyncConclusion) onSyncConclusion(orthoSummary);
        if (copyFn) copyFn(orthoSummary, '已复制正交分析结论并同步至第 6 步报告');
      };
      const btnCsv = mountEl.querySelector('#btnExportOrthoCsv');
      if (btnCsv) btnCsv.onclick = () => {
        const csv = '\uFEFF试验号,A料液比,B提取温度(℃),C提取时间(min),收率(%)\n' +
          L9_MATRIX.map((r, i) => `${i + 1},1:${factors[0].levels[r[0] - 1]},${factors[1].levels[r[1] - 1]},${factors[2].levels[r[2] - 1]},${ws.orthoYields[i]}`).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${t.herb}_L9正交实验表.csv`; a.click();
      };
    };
    draw();
  }

  // ============ 工具 4：实验答辩高频 5 问速测卡（Step 6） ============
  function renderDefenseQuiz(mountEl, t, ws, applicableRigs, LAB_RIGS) {
    if (!mountEl) return;
    const mainRig = LAB_RIGS[applicableRigs[0]?.key || t.defaultRig] || {};
    const firstPitfall = (t.troubleshoot && t.troubleshoot[0]) || { issue: '收率偏低', cause: '传质不充分或溶剂选择不当', fix: '优化粉碎目数与提取次数' };
    const qaList = [
      {
        q: `Q1. 为什么针对「${t.herb}」中的「${t.compound}」优先选用「${ws.solventType}」并在 ${ws.temp}℃ 下提取？`,
        a: `依据相似相溶与菲克第一扩散定律：${t.compound} 属于【${t.category}】，与 ${ws.solventType} 极性高度匹配，能最大化溶出目标成分同时减少淀粉/果胶等无效杂糖共提；控制温度 ${ws.temp}℃ 既能加速分子扩散，又能避免超过其稳定阈值（${t.mpRef || '热敏区'}）发生分解或异构化。`
      },
      {
        q: `Q2. 本实验核心装置「${mainRig.title || '提取装置'}」在搭建与收尾时最容易发生哪类安全或操作事故？`,
        a: `搭建顺序须严格遵循：${mainRig.order || '自下而上、先固定后加料'}。关键安全红线：${(mainRig.hotspots && mainRig.hotspots[0]?.warn) || '先通冷却水再加热，结束先断热/破真空再关泵'}。`
      },
      {
        q: `Q3. 实验中如果遇到「${firstPitfall.issue}」怎么快速排查和补救？`,
        a: `核心成因：${firstPitfall.cause}；现场对策：${firstPitfall.fix}。`
      },
      {
        q: `Q4. 你如何从《中国药典》和现代分析角度证明提取出的确实是「${t.compound}」且工艺稳定？`,
        a: `① 定量质控：平行 3 批平均粗提收率需对标参考限度（≥${t.limitVal}${t.limitUnit || '%'}）且相对标准偏差 RSD < 5%；② 定性确证：采用薄层色谱（${t.tlcSystem}）与对照品同板共色谱，要求斑点显色一致且 |ΔRf| ≤ 0.03，并可叠加 UV / NMR 特征峰确证。`
      },
      {
        q: `Q5. 如果要将本课题拓展为创新竞赛或中西医结合转化研究，你的下一步改进方向是什么？`,
        a: `${t.integrative || `可探索天然低共熔溶剂(NADES)绿色替代、大孔吸附树脂工业纯化或现代靶向制剂转化。`}`
      }
    ];

    mountEl.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div class="flex items-center gap-2">
          <span class="w-7 h-7 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-extrabold text-xs">🎓</span>
          <div>
            <h3 class="text-sm sm:text-base font-extrabold text-slate-900">实验答辩 &amp; 考核高频 5 问速测卡（0-Token 专属定制）</h3>
            <p class="text-[11px] text-slate-500">点击任意题目展开导师评分要点，提前演练课程答辩与实验考核</p>
          </div>
        </div>
        <button id="btnToggleAllDefense" type="button" class="px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-100 transition">展开/收起全部答案</button>
      </div>
      <div class="space-y-2">
        ${qaList.map((item, idx) => `
          <details class="group rounded-2xl bg-[#fbfcfa] border border-slate-200/80 p-3 text-xs">
            <summary class="font-extrabold text-slate-900 cursor-pointer list-none flex items-center justify-between gap-2">
              <span>${esc(item.q)}</span>
              <span class="text-[#0f5c54] text-[11px] font-bold shrink-0 group-open:rotate-180 transition">▾</span>
            </summary>
            <div class="mt-2 pt-2 border-t border-slate-200/70 text-slate-700 leading-relaxed">${esc(item.a)}</div>
          </details>`).join('')}
      </div>`;

    let allOpen = false;
    const tog = mountEl.querySelector('#btnToggleAllDefense');
    if (tog) tog.onclick = () => {
      allOpen = !allOpen;
      mountEl.querySelectorAll('details').forEach(d => { d.open = allOpen; });
    };
  }

  window.TCMToolsV3 = Object.freeze({
    renderSafetyMatrix,
    renderTlcTuner,
    renderOrthogonalTool,
    renderDefenseQuiz
  });
})();
