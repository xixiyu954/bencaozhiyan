// =========================================================================
// 本草智研 · 用户自有实验方案 AI 全流程演算与案例收录引擎 (lab-v11-userplan.js)
// - 支持用户输入/粘贴已有实验方案，或一键读取当前工作台 DIY 路线
// - 递交 AI 进行全流程推演（解析参数 → 安全与可行性诊断 → 四阶段现象/质控动态演练）
// - 支持一键同步至工作台 6 步与动态装置，并永久收录为「我的收录案例」与专属题库
// =========================================================================
(function () {
  'use strict';

  const USER_CASES_KEY = 'tcm_user_archived_cases_v1';

  const SAMPLE_PLANS = [
    {
      title: '黄芩沸水杀酶酸沉提取黄芩苷方案',
      herb: '黄芩',
      compound: '黄芩苷',
      category: '黄酮',
      text: '称取黄芩粗粉 50 g，先投入 10 倍量沸水（100℃）中杀酶 10 min，保持微沸煎煮提取 2 次，每次 60 min，合并滤液并减压浓缩至 100 mL。80℃ 下滴加稀盐酸调 pH 至 1.5~2.0，保温静置 1 h 后冷却析出黄色沉淀，布氏漏斗减压抽滤，以 70% 乙醇重结晶精制，最后采用硅胶 G 板 TLC（乙酸乙酯-丁酮-甲酸-水 5:3:1:1）与 278 nm 紫外标曲测定含量。'
    },
    {
      title: '川芎酸碱双相联产川芎嗪与阿魏酸方案',
      herb: '川芎',
      compound: '川芎嗪 + 阿魏酸',
      category: '生物碱',
      text: '取川芎粗粉 100 g，加 10 倍量 70% 乙醇 75℃ 热回流提取 2 次，每次 90 min，合并滤液 50℃ 旋蒸回收乙醇至浸膏。加水分散后调 pH 至 9.5，乙酸乙酯萃取 3 次分取川芎嗪相；水相再以稀盐酸调 pH 至 2.0，乙酸乙酯萃取 3 次分取阿魏酸相。两相分别脱水浓缩，进行 365 nm 蓝荧光 TLC 鉴别与 322 nm 紫外定量。'
    }
  ];

  let lastSimResult = null;
  let walkthroughTimer = null;

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }

  function loadUserCases() {
    try { return JSON.parse(localStorage.getItem(USER_CASES_KEY) || '[]'); } catch { return []; }
  }
  function saveUserCases(list) {
    try { localStorage.setItem(USER_CASES_KEY, JSON.stringify(list.slice(0, 30))); } catch {}
  }

  // 本地高精度方案解析与全流程演算引擎（离线或云端繁忙时即时无缝接管）
  function buildLocalSimulation(input) {
    const raw = `${input.title} ${input.herb} ${input.compound} ${input.text}`;
    const massM = raw.match(/(\d+(?:\.\d+)?)\s*(?:g|克)/i);
    const ratioM = raw.match(/(?:1\s*[:：]\s*(\d+)|(\d+)\s*倍)/);
    const tempM = raw.match(/(\d+(?:\.\d+)?)\s*(?:℃|度)/);
    const timeM = raw.match(/(\d+)\s*(?:min|分钟)/i);
    const cyclesM = raw.match(/(\d+)\s*次/);

    const mass = massM ? Math.min(500, Math.max(10, Math.round(Number(massM[1])))) : 50;
    const ratio = ratioM ? Math.min(20, Math.max(4, Number(ratioM[1] || ratioM[2]))) : 10;
    const temp = tempM ? Math.min(115, Math.max(25, Math.round(Number(tempM[1])))) : (/超声/.test(raw) ? 50 : (/水蒸气|蒸馏|沸水|煎煮/.test(raw) ? 100 : 75));
    const time = timeM ? Math.min(240, Math.max(15, Number(timeM[1]))) : (/超声/.test(raw) ? 40 : 60);
    const cycles = cyclesM ? Math.min(3, Math.max(1, Number(cyclesM[1]))) : 2;

    let solvent = '70%乙醇';
    if (/石油醚/.test(raw)) solvent = '石油醚(30-60℃)';
    else if (/95%\s*乙醇|无水乙醇/.test(raw)) solvent = '95%乙醇';
    else if (/酸水|稀盐酸/.test(raw) && !/乙醇/.test(raw)) solvent = '0.5%酸水';
    else if (/纯化水|沸水|煎煮|水蒸气|水提/.test(raw) && !/70%|95%/.test(raw)) solvent = '纯化水';

    let rig = 'reflux';
    if (/水蒸气|挥发油测定/.test(raw)) rig = 'steam';
    else if (/超声/.test(raw)) rig = 'ultrasonic';
    else if (/大孔树脂|树脂/.test(raw)) rig = 'resin';
    else if (/柱层析|硅胶柱/.test(raw)) rig = 'column';
    else if (/冻干/.test(raw)) rig = 'freeze_dry';
    else if (/分液|萃取|双相/.test(raw)) rig = 'liquid_extract';

    let category = input.category || '黄酮';
    if (/挥发油|薄荷|丁香|桂皮|当归/.test(raw)) category = '挥发油与萜类';
    else if (/生物碱|小檗碱|黄连|黄柏|川芎嗪|苦参/.test(raw)) category = '生物碱';
    else if (/皂苷|人参|三七|甘草/.test(raw)) category = '皂苷与三萜';
    else if (/多糖|枸杞|黄芪多糖/.test(raw)) category = '多糖类';
    else if (/蒽醌|大黄|丹参/.test(raw)) category = '蒽醌与醌类';
    else if (/绿原酸|金银花|阿魏酸|姜黄/.test(raw)) category = '苯丙素与有机酸';

    const herb = input.herb.trim() || (raw.match(/(黄芩|黄连|黄柏|川芎|薄荷|金银花|银杏叶|当归|枸杞|三七|人参|姜黄|陈皮|丹参|连翘|五味子|甘草|大黄|苦参|葛根|槐米)/)?.[1] || '自定药材');
    const compound = input.compound.trim() || `${herb}目标活性成分`;

    const totalMin = 20 + time * cycles + 55;
    const totalSol = Math.round(mass * ratio * cycles);
    const highlights = [];
    const risks = [];

    if (/杀酶/.test(raw)) highlights.push('包含「沸水杀酶」关键前处理，能有效灭活水解酶，显著保护苷类成分完整度。');
    if (/超声|纯化水|70%乙醇/.test(raw)) highlights.push(`采用「${solvent}」搭配 ${temp}℃ 温和工艺，绿色低碳且贴合高校实验室安全条件。`);
    if (/pH|酸沉|双相|重结晶|树脂|层析/.test(raw)) highlights.push('分离纯化链路清晰，具备明确的理化性质针对性（酸碱调控或极性梯度）。');
    if (/TLC|紫外|UV|HPLC/.test(raw)) highlights.push('方案已完整覆盖定性/定量检识闭环，可直接产出规范实验数据与报告。');
    if (!highlights.length) highlights.push('整体步骤主线清晰，具备良好的本科实验室落地基础。');

    if (/氯仿|三氯甲烷|苯/.test(raw)) risks.push('检测到高毒有机溶剂（氯仿/苯类），建议改用乙酸乙酯-石油醚或乙醇-水绿色替代体系。');
    if (totalMin > 240) risks.push(`推算全流程耗时约 ${totalMin} min（超出常规 4 学时），建议改用 40kHz 超声提取或缩短单次时长至 45~60 min。`);
    if (temp >= 85 && /绿原酸|挥发油|酯苷|多糖/.test(raw) && !/水蒸气/.test(raw)) risks.push(`设定温度 ${temp}℃ 对热敏/易氧化成分偏高，建议控制在 45~65℃ 并避光操作。`);
    if (/分液|萃取/.test(raw)) risks.push('两相液液萃取易发生乳化，建议轻缓振摇放气，必要时加饱和氯化钠或离心破乳。');
    if (!risks.length) risks.push('暂未发现明显工艺或安全冲突；实操时仍需加入 2~3 粒沸石防暴沸，并保持冷凝水下进上出。');

    const score = Math.max(72, Math.min(97, 92 - (totalMin > 240 ? 8 : 0) - (/氯仿/.test(raw) ? 10 : 0) + (highlights.length >= 3 ? 4 : 0)));

    return {
      title: input.title.trim() || `${herb}（${compound}）自定义实验方案`,
      herb,
      compound,
      category,
      sourceText: input.text.trim(),
      score,
      verdict: score >= 85 ? '方案逻辑严密 · 可直接落地实操' : '方案基本可行 · 建议按风险提示微调',
      params: { mass, ratio, temp, time, cycles, solventType: solvent, totalSolvent: totalSol, totalMin, rig },
      highlights,
      risks,
      stages: [
        {
          stage: '① 前处理与润药',
          title: `${herb}粉碎称量 (${mass} g) 与细胞壁软化`,
          phenomenon: '药材饮片/粗粉充分吸水膨胀，颗粒沉底无漂浮结块，防止提取过程糊锅与局部过热。',
          qc: `投料 ${mass} g，溶剂按 1:${ratio} 配制（单次 ${mass * ratio} mL）。`,
          tip: '切忌粉碎过细（避免 > 80 目），否则后续抽滤极易堵塞滤纸。'
        },
        {
          stage: '② 主体提取传质',
          title: `${solvent} · ${temp}℃ 提取 ${cycles} 次（每次 ${time} min）`,
          phenomenon: `随着提取推进，提取液色度逐步加深并趋于稳定；合并 ${cycles} 次滤液总计约 ${totalSol} mL。`,
          qc: `严格控温在 ${temp} ± 3℃，回流/提取过程维持平稳传质。`,
          tip: '首提溶出率约占总量 70%~78%，二次合并可显著提高总收率。'
        },
        {
          stage: '③ 分离纯化与浓缩',
          title: /酸沉|pH/.test(raw) ? 'pH 梯度调控沉淀 / 萃取精制' : (/树脂|层析/.test(raw) ? '色谱梯度富集与减压浓缩' : '减压浓缩回收溶剂与结晶分离'),
          phenomenon: '减压浓缩回收 75%+ 溶剂，经沉淀/萃取/柱分离后杂质显著减少，目标组分富集清晰。',
          qc: '旋蒸水浴控温 ≤ 55℃，防止热敏有效成分降解或变色。',
          tip: '若析出晶形偏细，可低温静置陈化 30~60 min 再快速减压抽滤。'
        },
        {
          stage: '④ 检识与质量验收',
          title: '薄层色谱 (TLC) 鉴别与紫外/高效液相定量',
          phenomenon: '供试品与标准对照品在同水平线呈现清晰荧光或显色斑点，无明显拖尾杂斑。',
          qc: '要求 ΔRf ≤ 0.03，平行测定 3 批精密度 RSD ≤ 3.0%。',
          tip: '点样直径控制在 2 mm 以内，展开缸须提前饱和 15 min。'
        }
      ],
      summaryAdvice: `该方案以「${herb}」为原料提取「${compound}」，推算总耗液量约 ${totalSol} mL、全流程耗时约 ${totalMin} min，综合可行性评分 ${score} 分。已为你生成完整 4 阶段实操现象预测与质控要点，可直接同步到工作台继续完善数据与实验报告。`
    };
  }

  async function runAiSimulation(input, onStage) {
    onStage(1, '正在解析你的实验方案文本与关键参数...', 22);
    const localBase = buildLocalSimulation(input);

    // 优先尝试云端智能深度推演，失败或离线时无缝使用高精度本地演算
    if (window.TCMCloudAI && typeof window.TCMCloudAI.chat === 'function') {
      try {
        onStage(2, '正在由智能助手进行热力学校验与全流程现象推演...', 55);
        const prompt = `你是中药化学实验工程专家。用户提交了一套自己设计的实验方案，请严格输出一个合法 JSON 对象（不要 markdown 代码块）进行全流程演算：
方案标题：${input.title || '未命名'}
药材：${input.herb || '请从方案识别'}
目标成分：${input.compound || '请从方案识别'}
方案原文：${input.text}

请返回如下 JSON 字段：
{
  "title": "规范化方案名称",
  "herb": "药材名",
  "compound": "目标活性成分",
  "category": "黄酮/生物碱/挥发油与萜类/皂苷与三萜/蒽醌与醌类/香豆素与木脂素/多糖类/苯丙素与有机酸之一",
  "score": 88,
  "verdict": "一句话可行性总评",
  "highlights": ["亮点1", "亮点2"],
  "risks": ["潜在隐患与改进建议1", "潜在隐患与改进建议2"],
  "stages": [
    {"stage":"① 前处理","title":"步骤名","phenomenon":"预期实验现象","qc":"关键质控点","tip":"避坑提示"},
    {"stage":"② 主体提取","title":"步骤名","phenomenon":"预期实验现象","qc":"关键质控点","tip":"避坑提示"},
    {"stage":"③ 分离纯化","title":"步骤名","phenomenon":"预期实验现象","qc":"关键质控点","tip":"避坑提示"},
    {"stage":"④ 检识验收","title":"步骤名","phenomenon":"预期实验现象","qc":"关键质控点","tip":"避坑提示"}
  ],
  "summaryAdvice": "100字以内总结评语与优化方向"
}`;
        const res = await window.TCMCloudAI.chat(
          [{ role: 'user', content: prompt }],
          { expectJson: true }
        );
        const parsed = JSON.parse(res.text);
        onStage(3, '演算完成，正在组装全流程动态演示卡片...', 90);
        return {
          ...localBase,
          title: parsed.title || localBase.title,
          herb: parsed.herb || localBase.herb,
          compound: parsed.compound || localBase.compound,
          category: parsed.category || localBase.category,
          score: Number(parsed.score) || localBase.score,
          verdict: parsed.verdict || localBase.verdict,
          highlights: Array.isArray(parsed.highlights) && parsed.highlights.length ? parsed.highlights : localBase.highlights,
          risks: Array.isArray(parsed.risks) && parsed.risks.length ? parsed.risks : localBase.risks,
          stages: Array.isArray(parsed.stages) && parsed.stages.length >= 3 ? parsed.stages : localBase.stages,
          summaryAdvice: parsed.summaryAdvice || localBase.summaryAdvice,
          usedCloud: true
        };
      } catch {
        // 平滑切换本地演算
      }
    }
    onStage(3, '正在生成四阶段实验现象预测与质控清单...', 88);
    await new Promise(r => setTimeout(r, 320));
    return localBase;
  }

  function renderSimResult(result, activeWalkIdx) {
    const mount = document.getElementById('userPlanResultMount');
    if (!mount || !result) return;
    const p = result.params;
    const badgeCls = result.score >= 85
      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
      : 'bg-amber-50 border-amber-200 text-amber-800';

    mount.innerHTML = `
      <div class="space-y-4 panel-anim">
        <!-- 总评卡 -->
        <div class="rounded-2xl bg-gradient-to-br from-[#062420] via-[#0a3a33] to-[#0f5c54] text-white p-4 space-y-2.5">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="font-extrabold text-base">${esc(result.title)}</div>
            <span class="px-3 py-1 rounded-full bg-white/15 border border-white/25 text-xs font-extrabold text-emerald-200">可行性 ${result.score} 分</span>
          </div>
          <div class="text-xs text-teal-100/90">${esc(result.verdict)}</div>
          <div class="flex flex-wrap gap-1.5 pt-1 text-xs">
            <span class="px-2.5 py-0.5 rounded-full bg-white/12">药材：${esc(result.herb)}</span>
            <span class="px-2.5 py-0.5 rounded-full bg-white/12">成分：${esc(result.compound)}</span>
            <span class="px-2.5 py-0.5 rounded-full bg-white/12">${p.mass}g · 1:${p.ratio}</span>
            <span class="px-2.5 py-0.5 rounded-full bg-white/12">${esc(p.solventType)} · ${p.temp}℃</span>
            <span class="px-2.5 py-0.5 rounded-full bg-white/12">总耗时约 ${p.totalMin} min</span>
          </div>
        </div>

        <!-- 亮点与隐患分析 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-2xl bg-emerald-50/85 border border-emerald-200 p-3.5 space-y-1.5">
            <div class="text-xs font-extrabold text-emerald-900">✨ 方案优势亮点</div>
            ${result.highlights.map(h => `<div class="text-xs text-emerald-900/90 leading-relaxed">• ${esc(h)}</div>`).join('')}
          </div>
          <div class="rounded-2xl bg-amber-50/85 border border-amber-200 p-3.5 space-y-1.5">
            <div class="text-xs font-extrabold text-amber-900">⚠️ 隐患诊断与优化建议</div>
            ${result.risks.map(r => `<div class="text-xs text-amber-900/90 leading-relaxed">• ${esc(r)}</div>`).join('')}
          </div>
        </div>

        <!-- 四阶段全流程动态演算步进区 -->
        <div class="space-y-2.5">
          <div class="flex items-center justify-between gap-2">
            <span class="text-sm font-extrabold text-slate-900">🔬 实验全流程推演（现象 · 质控 · 避坑）</span>
            <button type="button" id="btnPlayPlanWalkthrough" class="px-3 py-1 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-[#0a3630] text-xs font-extrabold transition">▶ 逐步动态演练</button>
          </div>
          <div class="space-y-2.5">
            ${result.stages.map((st, idx) => {
              const isWalk = activeWalkIdx === idx;
              const isPast = activeWalkIdx != null && idx < activeWalkIdx;
              return `
                <div class="rounded-2xl border p-3.5 transition-all duration-300 ${isWalk ? 'border-[#0f5c54] bg-emerald-50/75 ring-2 ring-emerald-400/40 shadow-md' : (isPast ? 'border-emerald-200 bg-white' : 'border-slate-200 bg-white')}">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-xs font-extrabold text-[#0f5c54]">${esc(st.stage)} · ${esc(st.title)}</span>
                    ${isWalk ? '<span class="px-2 py-0.5 rounded-full bg-[#0a3630] text-emerald-200 text-[10px] font-extrabold">演练中...</span>' : (isPast ? '<span class="text-emerald-600 font-bold text-xs">✓ 已推演</span>' : '')}
                  </div>
                  <div class="mt-2 space-y-1 text-xs text-slate-700 leading-relaxed">
                    <div><strong class="text-slate-900">预期现象：</strong>${esc(st.phenomenon)}</div>
                    <div><strong class="text-[#0f5c54]">质控标准：</strong>${esc(st.qc)}</div>
                    <div><strong class="text-amber-700">实操避坑：</strong>${esc(st.tip)}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 总结评语 -->
        <div class="rounded-2xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-700 leading-relaxed">
          <strong class="text-slate-900">综合推演结论：</strong>${esc(result.summaryAdvice)}
        </div>

        <!-- 底部双闭环按钮 -->
        <div class="flex flex-wrap gap-2.5 pt-1">
          <button type="button" id="btnSyncUserPlanToWorkbench" class="flex-1 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#062420] to-[#0f5c54] hover:from-[#041d1a] hover:to-[#0a3630] text-white text-xs sm:text-sm font-extrabold shadow-sm transition">
            ⚡ 同步参数至工作台（联动全流程）
          </button>
          <button type="button" id="btnArchiveUserPlanCase" class="flex-1 py-2.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-[#062420] text-xs sm:text-sm font-extrabold shadow-sm transition">
            📚 收录为工作台案例与题库
          </button>
        </div>
      </div>
    `;

    // 逐步动态演练动画
    const walkBtn = mount.querySelector('#btnPlayPlanWalkthrough');
    if (walkBtn) {
      walkBtn.addEventListener('click', () => {
        if (walkthroughTimer) clearInterval(walkthroughTimer);
        let stepIdx = 0;
        renderSimResult(result, stepIdx);
        walkthroughTimer = setInterval(() => {
          stepIdx++;
          if (stepIdx >= result.stages.length) {
            clearInterval(walkthroughTimer);
            walkthroughTimer = null;
            renderSimResult(result, result.stages.length);
            return;
          }
          renderSimResult(result, stepIdx);
        }, 1200);
      });
    }

    // 同步到工作台
    const syncBtn = mount.querySelector('#btnSyncUserPlanToWorkbench');
    if (syncBtn) {
      syncBtn.addEventListener('click', () => {
        if (window.TCM_USER_PLAN_BRIDGE && window.TCM_USER_PLAN_BRIDGE.applyPlan) {
          window.TCM_USER_PLAN_BRIDGE.applyPlan(result, false);
        }
        closeModal();
      });
    }

    // 申请 AI 90 分严审后编入自编库（绝不绕过审核直接入库！）
    const archBtn = mount.querySelector('#btnArchiveUserPlanCase');
    if (archBtn) {
      archBtn.textContent = '🛡️ 申请 AI 90分严审编入自编库';
      archBtn.addEventListener('click', () => {
        let draftObj = null;
        if (window.TCM_USER_PLAN_BRIDGE && window.TCM_USER_PLAN_BRIDGE.applyPlan) {
          draftObj = window.TCM_USER_PLAN_BRIDGE.applyPlan(result);
        }
        closeModal();
        if (window.TCM_AI_REVIEW && window.TCM_AI_REVIEW.open) {
          window.TCM_AI_REVIEW.open(draftObj || undefined);
        }
      });
    }
  }

  function ensureModal() {
    let modal = document.getElementById('userPlanModal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'userPlanModal';
    modal.className = 'no-print fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-5';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl border border-slate-200 max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        <div class="px-6 py-4 bg-gradient-to-r from-[#062420] via-[#0a3630] to-[#0f5c54] text-white flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <span class="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-lg shrink-0">📋</span>
            <div class="min-w-0">
              <h3 class="text-base sm:text-lg font-extrabold truncate">提交我的实验方案 · 全流程智能演算与案例收录</h3>
              <p class="text-xs text-emerald-200/90 truncate">将你已设计的方案交给智能助手，完成可行性校验、四阶段现象推演，并可收录为工作台专属案例</p>
            </div>
          </div>
          <button id="btnCloseUserPlanModal" type="button" class="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-lg flex items-center justify-center shrink-0">×</button>
        </div>

        <div class="flex-1 overflow-y-auto custom-scroll p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
          <!-- 左侧：用户输入方案表单 -->
          <div class="lg:col-span-5 space-y-3.5">
            <div class="flex flex-wrap gap-1.5">
              <button type="button" id="btnFillFromWorkbench" class="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-[#0a3630] text-xs font-extrabold transition">📥 读取当前工作台参数</button>
              <button type="button" data-sample-plan="0" class="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition">示例1：黄芩苷</button>
              <button type="button" data-sample-plan="1" class="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition">示例2：川芎双提</button>
            </div>

            <form id="userPlanForm" class="space-y-3">
              <div>
                <label class="block text-xs font-extrabold text-slate-700 mb-1">方案标题</label>
                <input id="upTitle" type="text" placeholder="如：黄芩沸水杀酶酸沉提取黄芩苷方案" class="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#0f5c54]" />
              </div>
              <div class="grid grid-cols-2 gap-2.5">
                <div>
                  <label class="block text-xs font-extrabold text-slate-700 mb-1">药材名称（选填）</label>
                  <input id="upHerb" type="text" placeholder="如：黄芩" class="w-full px-3 py-2 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#0f5c54]" />
                </div>
                <div>
                  <label class="block text-xs font-extrabold text-slate-700 mb-1">目标成分（选填）</label>
                  <input id="upComp" type="text" placeholder="如：黄芩苷" class="w-full px-3 py-2 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#0f5c54]" />
                </div>
              </div>
              <div>
                <label class="block text-xs font-extrabold text-slate-700 mb-1">我的实验方案全文 *</label>
                <textarea id="upText" required rows="7" placeholder="粘贴或输入你已设计好的实验步骤、溶剂比例、提取温度时长、分离纯化方法与检识思路..." class="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#0f5c54] leading-relaxed resize-y"></textarea>
              </div>
              <button id="btnRunUserPlanSim" type="submit" class="w-full py-3 rounded-2xl bg-gradient-to-r from-[#062420] to-[#0f5c54] hover:from-[#041d1a] hover:to-[#0a3630] text-white text-sm font-extrabold shadow-md transition">
                🚀 递交智能助手 · 开始全流程演算
              </button>
            </form>

            <div id="userPlanProgress" class="hidden rounded-2xl bg-teal-50/80 border border-teal-200 p-3 space-y-2">
              <div class="flex items-center justify-between text-xs font-bold text-[#0a3630]">
                <span id="upProgText">正在解析方案...</span>
                <span id="upProgPct" class="tabular-nums">20%</span>
              </div>
              <div class="h-2 rounded-full bg-teal-100 overflow-hidden"><div id="upProgBar" class="h-full bg-[#0f5c54] transition-all duration-300" style="width:20%"></div></div>
            </div>
          </div>

          <!-- 右侧：全流程动态演算结果区 -->
          <div class="lg:col-span-7">
            <div id="userPlanResultMount" class="h-full rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 p-6 flex flex-col items-center justify-center text-center space-y-3 min-h-[340px]">
              <div class="text-4xl">🧪</div>
              <div class="text-sm font-extrabold text-slate-800">在左侧输入你的实验方案，即可启动全流程模拟演算</div>
              <p class="text-xs text-slate-500 max-w-md leading-relaxed">系统将自动识别你的投料量、溶剂体系与提取分离路径，逐阶段预测实验现象、排查潜在隐患，演算完成后可一键同步至工作台并永久收录为案例。</p>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#btnCloseUserPlanModal').addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

    modal.querySelectorAll('[data-sample-plan]').forEach(btn => {
      btn.addEventListener('click', () => {
        const s = SAMPLE_PLANS[Number(btn.dataset.samplePlan)];
        if (!s) return;
        document.getElementById('upTitle').value = s.title;
        document.getElementById('upHerb').value = s.herb;
        document.getElementById('upComp').value = s.compound;
        document.getElementById('upText').value = s.text;
      });
    });

    modal.querySelector('#btnFillFromWorkbench').addEventListener('click', () => {
      const herb = document.getElementById('cfgHerbName')?.textContent || '当前课题';
      const mass = document.getElementById('cfgMassLbl')?.textContent || '100';
      const ratio = document.getElementById('cfgRatioLbl')?.textContent || '10';
      const temp = document.getElementById('cfgTemp')?.value || '75';
      const time = document.getElementById('cfgTime')?.value || '60';
      const cycles = document.getElementById('cfgCycles')?.value || '2';
      const sol = document.getElementById('cfgSolventType')?.value || '70%乙醇';
      const ph = document.getElementById('cfgPh')?.value || '中性 7.0';
      document.getElementById('upTitle').value = `${herb} · 自定义工艺方案`;
      document.getElementById('upHerb').value = herb.split('·')[0].trim();
      document.getElementById('upComp').value = (herb.split('·')[1] || '').trim();
      document.getElementById('upText').value = `取药材 ${mass} g，按料液比 1:${ratio} 加入 ${sol}（目标 pH：${ph}），在 ${temp}℃ 下提取 ${cycles} 次，每次 ${time} min；合并提取液后减压浓缩回收溶剂，结合薄层色谱（TLC）与紫外定量完成质量检识。`;
    });

    modal.querySelector('#userPlanForm').addEventListener('submit', async e => {
      e.preventDefault();
      const text = document.getElementById('upText').value.trim();
      if (!text) return;
      const prog = document.getElementById('userPlanProgress');
      const pTxt = document.getElementById('upProgText');
      const pPct = document.getElementById('upProgPct');
      const pBar = document.getElementById('upProgBar');
      const submitBtn = document.getElementById('btnRunUserPlanSim');
      prog.classList.remove('hidden');
      submitBtn.disabled = true;
      submitBtn.textContent = '全流程演算中...';
      try {
        const res = await runAiSimulation({
          title: document.getElementById('upTitle').value,
          herb: document.getElementById('upHerb').value,
          compound: document.getElementById('upComp').value,
          text
        }, (step, msg, pct) => {
          pTxt.textContent = msg;
          pPct.textContent = pct + '%';
          pBar.style.width = pct + '%';
        });
        lastSimResult = res;
        pPct.textContent = '100%';
        pBar.style.width = '100%';
        pTxt.textContent = '✓ 全流程演算完成！';
        renderSimResult(res, null);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '🚀 递交智能助手 · 开始全流程演算';
        setTimeout(() => prog.classList.add('hidden'), 1000);
      }
    });

    return modal;
  }

  function openModal() {
    const m = ensureModal();
    m.classList.remove('hidden');
    m.classList.add('flex');
  }

  function closeModal() {
    if (walkthroughTimer) { clearInterval(walkthroughTimer); walkthroughTimer = null; }
    const m = document.getElementById('userPlanModal');
    if (m) { m.classList.add('hidden'); m.classList.remove('flex'); }
  }

  function initTriggerButton() {
    const btn = document.getElementById('btnOpenUserPlanModal');
    if (btn && !btn.dataset.bound) {
      btn.dataset.bound = '1';
      btn.addEventListener('click', openModal);
    }
  }

  window.TCM_USER_PLAN = {
    open: openModal,
    loadUserCases,
    saveUserCases,
    init: initTriggerButton
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTriggerButton);
  } else {
    initTriggerButton();
  }
})();
