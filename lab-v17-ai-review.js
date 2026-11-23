/* ============================================================================
 * 本草智研 v17 · AI 自编课题 90 分严格审核与协助优化闭环引擎 (lab-v17-ai-review.js)
 * 核心规则：
 *   1. 任何 AI 生成或用户 DIY 自编的实验方案，默认仅为本次无痕会话草稿，绝不自动编入题库。
 *   2. 是否申请编入「AI 自编题库」完全由用户本人主动决定。
 *   3. 申请编入必须通过平台 AI 五维严格评审打分（满分 100 分，强制准入门槛 ≥ 90 分）。
 *   4. 若评分 < 90 分，系统严格拦截编入，列出逐项扣分漏洞，并支持一键「接入 AI 协助深度优化」后重新复审，直至 ≥ 90 分由用户最终确认编入。
 * ============================================================================ */
(function () {
  'use strict';

  const PASS_SCORE = 90;
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, Math.round(Number(n) || 0)));

  let modalTab = 'review'; // 'review' | 'approved'
  let draftModel = null;
  let lastReview = null;
  let lastOptimizeNotes = [];
  let busyMode = ''; // '' | 'reviewing' | 'optimizing'

  function api() {
    return window.TCM_LAB_API || null;
  }

  function buildDraftFromTopic(topicOverride) {
    const t = topicOverride || (api() && (api().getSessionDraft() || api().getCurrentTopic())) || {};
    const ws = (api() && api().getCurrentWorkState && api().getCurrentWorkState()) || {};
    const cfg = t.defaultCfg || {};
    return {
      sourceTopic: t,
      herb: t.herb || '',
      compound: t.compound || '',
      category: t.category || '黄酮',
      formalTitle: ws.formalTitle || (t.herb && t.compound ? `${t.herb}中${t.compound}的提取分离与检识实验` : ''),
      mass: Number(ws.mass ?? cfg.mass ?? 50),
      ratio: Number(ws.ratio ?? cfg.ratio ?? 10),
      temp: Number(ws.temp ?? cfg.temp ?? 75),
      time: Number(ws.time ?? cfg.time ?? 60),
      cycles: String(ws.cycles ?? cfg.cycles ?? '2'),
      solventType: ws.solventType || cfg.solventType || '70%乙醇',
      mesh: ws.mesh || cfg.mesh || '中粉(40目)',
      ph: ws.ph || cfg.ph || '中性 7.0',
      defaultRig: ws.activeRig || t.defaultRig || 'reflux',
      origin: t.origin || '',
      chemistry: t.chemistry || '',
      pharmacopoeia: t.pharmacopoeia || '',
      tlcSystem: t.tlcSystem || '',
      integrative: ws.diyNotes || t.integrative || '',
      sop: Array.isArray(t.sop) ? t.sop.slice() : [],
      troubleshoot: Array.isArray(t.troubleshoot) ? t.troubleshoot.slice() : [],
      steps: Array.isArray(t.steps) ? t.steps.slice() : [],
      chemTests: Array.isArray(t.chemTests) ? t.chemTests.slice() : []
    };
  }

  // ---------- 严格本地 5 维量化评审引擎（云端不可用时兜底，绝不放水，残缺方案必 < 90 分） ----------
  function evaluateLocally(d) {
    const dims = [];
    const issues = [];

    // 1. 科学性与提取机理准确性 (20分)
    let s1 = 4;
    const d1Notes = [];
    if ((d.herb || '').trim().length >= 2 && (d.compound || '').trim().length >= 2) s1 += 4;
    else { d1Notes.push('缺少明确的药材名称或目标活性成分'); issues.push('【科学性】请明确具体药材名称与核心目标活性成分（如黄芩苷、芦丁、小檗碱等）。'); }

    const mechText = `${d.origin} ${d.chemistry} ${d.integrative}`.trim();
    if (mechText.length >= 45) s1 += 5;
    else if (mechText.length >= 20) { s1 += 2; issues.push('【科学性】药材基原与提取机理阐述偏简略，需补充目标成分极性/酸碱性与溶剂匹配依据。'); }
    else { issues.push('【科学性】缺少提取分离化学机理说明，无法判断方案的科学合理性。'); }

    const isVolatile = /挥发|萜|薄荷|丁香|细辛|肉桂|艾叶|紫苏/.test(`${d.herb}${d.compound}${d.category}`);
    const isAlkaloid = /生物碱|小檗碱|麻黄|延胡索|苦参|乌头/.test(`${d.herb}${d.compound}${d.category}`);
    const isFlavone = /黄酮|芦丁|黄芩|槲皮素|葛根|橙皮/.test(`${d.herb}${d.compound}${d.category}`);
    if (isVolatile && /蒸馏|石油醚|超临界|超声|乙醇/.test(`${d.solventType}${d.defaultRig}${d.integrative}`)) s1 += 4;
    else if (isAlkaloid && /酸|乙醇|醇|回流|渗漉/.test(`${d.solventType}${d.ph}${d.integrative}`)) s1 += 4;
    else if (isFlavone && /乙醇|碱|硼砂|水|回流|超声/.test(`${d.solventType}${d.ph}${d.integrative}`)) s1 += 4;
    else if (/乙醇|水|酸|碱|超临界|低共熔/.test(d.solventType || '')) s1 += 3;
    else issues.push('【科学性】提取溶剂与成分大类的相似相溶/酸碱成盐匹配度不足。');

    if (/极性|溶解|成盐|扩散|沉淀|吸附|沸点|水解|热敏|酸碱/.test(mechText)) s1 += 3;
    else issues.push('【科学性】机理描述中建议明确关键物理化学原理（如极性匹配、酸碱调 pH、菲克扩散或共沸蒸馏）。');
    s1 = clamp(s1, 0, 20);
    dims.push({ name: '科学性与提取机理', score: s1, max: 20, comment: s1 >= 18 ? '成分极性、溶剂选择与核心机理逻辑严密。' : (d1Notes[0] || '机理阐述深度或溶剂匹配依据仍需补强。') });

    // 2. 工艺参数量化与可复现性 (20分)
    let s2 = 0;
    if ((d.formalTitle || '').trim().length >= 12) s2 += 3;
    else issues.push('【工艺参数】实验正式题目过于简略，建议完整包含“药材 + 成分 + 工艺方法 + 检识”。');

    if (d.mass >= 10 && d.mass <= 500) s2 += 3;
    else issues.push('【工艺参数】单批投料量不在常规实验区间（10~500 g）。');

    if (d.ratio >= 6 && d.ratio <= 16) s2 += 4;
    else issues.push(`【工艺参数】料液比（${d.ratio} mL/g）偏离常规推荐区间（6~16 mL/g），易导致浸润不足或浓缩能耗过大。`);

    const heatMax = isVolatile ? 100 : (/热敏|多糖|黄芩|紫苏/.test(`${d.herb}${d.compound}`) ? 85 : 100);
    if (d.temp >= 20 && d.temp <= heatMax) s2 += 4;
    else issues.push(`【工艺参数】提取温度（${d.temp}℃）超出本类成分建议上限（${heatMax}℃），存在热降解或挥发损失风险。`);

    if (Number(d.cycles) >= 2) s2 += 3;
    else issues.push('【工艺参数】单次提取浓度梯度衰减快，建议采用 2 次合并提取并记录合并滤液体积。');

    if (/\d/.test(String(d.ph || '')) && (d.mesh || '').length >= 2) s2 += 3;
    else issues.push('【工艺参数】目标 pH 需给出明确量化数值（如 pH 7.0 或 pH 2.0~3.0），并注明药材粉碎粒度。');
    s2 = clamp(s2, 0, 20);
    dims.push({ name: '工艺参数与可复现性', score: s2, max: 20, comment: s2 >= 18 ? '投料、料液比、温控、次数、粒度与 pH 均已精确量化。' : '部分关键工艺参数未量化或超出常规优化区间。' });

    // 3. 实验安全与绿色规范性 (20分)
    let s3 = 6;
    const isHighRisk = /氯仿|乙醚|苯|甲醇|石油醚/.test(d.solventType || '');
    if (!isHighRisk) s3 += 6;
    else { s3 += 2; issues.push(`【安全绿色】使用了高挥发或高毒溶剂（${d.solventType}），建议优先替换乙醇/水绿色体系，或在安全预案中强调通风橱防爆与废液分类。`); }

    const safetyText = `${d.sop.join(' ')} ${d.troubleshoot.map(x => `${x.issue}${x.fix}`).join(' ')} ${d.integrative}`;
    if (/沸石|暴沸|气密|通风|防护|废液|冷却|控温|安全/.test(safetyText)) s3 += 5;
    else issues.push('【安全绿色】缺少明确的安全防护与避坑措施（如加沸石防暴沸、冷凝水下进上出、气密性核查、废液回收）。');

    if (d.ratio * Number(d.cycles) <= 30) s3 += 3;
    else issues.push('【安全绿色】单位药材总溶剂消耗偏高（>30 mL/g），建议结合旋蒸回收降低溶剂负担。');
    s3 = clamp(s3, 0, 20);
    dims.push({ name: '实验安全与绿色规范', score: s3, max: 20, comment: s3 >= 18 ? '溶剂绿色友好，安全防护与废液/回收意识到位。' : '安全预案或绿色减量说明不够充分。' });

    // 4. 分离纯化与检识证据链 (20分)
    let s4 = 2;
    if ((d.tlcSystem || '').trim().length >= 12) s4 += 6;
    else issues.push('【纯化检识】缺少规范的 TLC 薄层色谱展开系统与检视波长（254/365 nm 或显色剂）说明。');

    if ((d.pharmacopoeia || '').trim().length >= 14) s4 += 5;
    else issues.push('【纯化检识】缺少《中国药典》质控标准或目标成分定量测定指标（如 UV/HPLC 限度要求）。');

    if ((d.chemTests && d.chemTests.length >= 2) || /显色|沉淀|镁粉|碘化铋钾|三氯化铁|HPLC|UV|TLC/.test(`${d.tlcSystem}${d.integrative}${d.chemistry}`)) s4 += 4;
    else issues.push('【纯化检识】缺少至少 2 项理化显色/沉淀/色谱交叉验证证据链。');

    if ((d.steps && d.steps.length >= 3) || /萃取|树脂|柱层析|结晶|抽滤|旋蒸|沉淀/.test(`${d.integrative}${d.sop.join(' ')}`)) s4 += 3;
    else issues.push('【纯化检识】分离纯化步骤不完整，建议明确粗提液后的富集精制路线。');
    s4 = clamp(s4, 0, 20);
    dims.push({ name: '分离纯化与检识闭环', score: s4, max: 20, comment: s4 >= 18 ? '纯化路线、TLC 展开体系、特征检识与药典标准闭环完整。' : '纯化路线、TLC 系统或药典质控指标仍有缺项。' });

    // 5. 教学实操可行性与创新深度 (20分)
    let s5 = 4;
    const totalMin = d.time * Number(d.cycles) + 60;
    if (totalMin <= 240) s5 += 5;
    else issues.push(`【实操可行】预计总实验时长约 ${totalMin} 分钟（超 4 学时），建议精简单次提取时间或改用超声/回流强化传质。`);

    if (d.sop && d.sop.length >= 4) s5 += 5;
    else issues.push('【实操可行】标准操作步骤（SOP）少于 4 步，不便课堂复现与规范考核。');

    if (d.troubleshoot && d.troubleshoot.length >= 2) s5 += 3;
    else issues.push('【实操可行】建议至少配备 2 条常见异常现象（如收率偏低、乳化、斑点拖尾）及排障对策。');

    if ((d.integrative || '').trim().length >= 24) s5 += 3;
    else issues.push('【实操可行】建议补充创新对照思路、误差控制（RSD < 5%）或讨论拓展方向。');
    s5 = clamp(s5, 0, 20);
    dims.push({ name: '实操可行与创新深度', score: s5, max: 20, comment: s5 >= 18 ? '学时适配良好，SOP、异常排障与创新拓展设计规范。' : 'SOP 细致度、异常排障预案或学时控制仍可提升。' });

    const total = s1 + s2 + s3 + s4 + s5;
    const passed = total >= PASS_SCORE;
    return {
      score: total,
      passed,
      engine: '本地五维量化评审引擎',
      dimensions: dims,
      issues,
      summary: passed
        ? `方案综合获评 ${total} / 100 分（达到 ≥ ${PASS_SCORE} 分准入门槛）：机理准确、工艺量化完整、安全与检识证据链闭环，已具备编入「AI 自编题库」的学术质量。`
        : `方案当前得分 ${total} / 100 分（未达 ${PASS_SCORE} 分准入门槛，仍差 ${PASS_SCORE - total} 分）。系统已按规范拦截编入，请点击下方「接入 AI 协助深度优化」逐项修补扣分漏洞后重新复审。`
    };
  }

  // ---------- 云端 AI 权威五维打分（优先调用智谱 GLM，失败透明回退本地量化评审） ----------
  async function runAiReview(d) {
    const localRes = evaluateLocally(d);
    if (!window.TCMCloudAI || !window.TCMCloudAI.complete) return localRes;

    const systemPrompt = [
      '你是「本草智研」平台《中药化学》课程与科研评审委员会首席专家。',
      '请对用户申请编入“AI 自编题库”的实验方案进行极其严格的百分制学术打分（必须 ≥ 90 分才允许收录；存在缺项、机理含糊、参数不合理、安全或检识缺失的方案绝不可给到 90 分）。',
      '请严格按以下 5 个维度各打 0~20 分整数，并只输出一个合法 JSON 对象：',
      '{"dimensions":[{"name":"科学性与提取机理","score":18,"max":20,"comment":"简评"},{"name":"工艺参数与可复现性","score":18,"max":20,"comment":"简评"},{"name":"实验安全与绿色规范","score":18,"max":20,"comment":"简评"},{"name":"分离纯化与检识闭环","score":18,"max":20,"comment":"简评"},{"name":"实操可行与创新深度","score":18,"max":20,"comment":"简评"}],"issues":["具体扣分原因与改进要求1","原因2"],"summary":"一句总评"}',
      '不要输出任何 Markdown 解释文字。'
    ].join('\n');

    const userPrompt = JSON.stringify({
      herb: d.herb, compound: d.compound, category: d.category, formalTitle: d.formalTitle,
      params: { mass_g: d.mass, ratio_mL_g: d.ratio, temp_C: d.temp, time_min: d.time, cycles: d.cycles, solvent: d.solventType, mesh: d.mesh, ph: d.ph, rig: d.defaultRig },
      origin: d.origin, chemistry: d.chemistry, pharmacopoeia: d.pharmacopoeia,
      tlcSystem: d.tlcSystem, integrative: d.integrative,
      sopCount: d.sop.length, sop: d.sop.slice(0, 6),
      troubleshootCount: d.troubleshoot.length
    });

    try {
      const res = await window.TCMCloudAI.complete({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `请严格评审以下待收录实验方案：\n${userPrompt}` }
        ],
        expectJson: true,
        useCache: false
      });
      const parsed = JSON.parse(window.TCMCloudAI.cleanJsonText(res.content));
      if (!parsed || !Array.isArray(parsed.dimensions) || parsed.dimensions.length < 5) {
        return localRes;
      }
      const dims = parsed.dimensions.slice(0, 5).map((item, idx) => ({
        name: item.name || localRes.dimensions[idx].name,
        score: clamp(item.score, 0, 20),
        max: 20,
        comment: String(item.comment || '').trim() || localRes.dimensions[idx].comment
      }));
      const total = dims.reduce((sum, x) => sum + x.score, 0);
      const issues = Array.isArray(parsed.issues) && parsed.issues.length
        ? parsed.issues.map(x => String(x)).filter(Boolean)
        : (total < PASS_SCORE ? localRes.issues : []);
      return {
        score: total,
        passed: total >= PASS_SCORE,
        engine: '云端智谱 GLM 评审专家',
        dimensions: dims,
        issues,
        summary: String(parsed.summary || '').trim() || (total >= PASS_SCORE ? `云端 AI 严格评审获 ${total} 分，符合 ≥ 90 分收录标准。` : `云端 AI 评审得分 ${total} 分，尚未达到 90 分准入门槛，请接入 AI 协助优化。`)
      };
    } catch (_) {
      return {
        ...localRes,
        engine: '本地五维学术规则评审（云端 AI 暂不可用自动接管）'
      };
    }
  }

  // ---------- 接入 AI 协助深度优化实验（专门解决 < 90 分的所有扣分漏洞！） ----------
  function optimizeLocally(d, issues) {
    const changes = [];
    const next = { ...d, sop: [...(d.sop || [])], troubleshoot: [...(d.troubleshoot || [])], steps: [...(d.steps || [])], chemTests: [...(d.chemTests || [])] };
    const herb = (next.herb || '目标中药').trim();
    const comp = (next.compound || '核心活性成分').trim();
    const isVolatile = /挥发|萜|薄荷|丁香|细辛|肉桂|艾叶|紫苏/.test(`${herb}${comp}${next.category}`);
    const isAlkaloid = /生物碱|小檗碱|麻黄|延胡索|苦参/.test(`${herb}${comp}${next.category}`);

    if (!next.formalTitle || next.formalTitle.trim().length < 12) {
      next.formalTitle = `${herb}中${comp}的绿色高效提取、分离纯化与多维检识实验设计`;
      changes.push('规范补全了正式实验题目（涵盖药材、目标成分、分离纯化与检识）。');
    }
    if (next.mass < 10 || next.mass > 500) {
      next.mass = 50;
      changes.push('将单批投料量校正至高校小试黄金规模 50 g。');
    }
    if (next.ratio < 6 || next.ratio > 16) {
      next.ratio = 10;
      changes.push('将料液比调优至 10 mL/g（兼顾充分浸润与浓缩能耗平衡）。');
    }
    const maxT = isVolatile ? 95 : 80;
    if (next.temp < 20 || next.temp > maxT) {
      next.temp = isVolatile ? 95 : 75;
      changes.push(`将提取温度优化至 ${next.temp}℃，避免热敏降解与挥发损失。`);
    }
    if (Number(next.cycles) < 2) {
      next.cycles = '2';
      changes.push('将提取次数提升至 2 次合并提取，保持菲克第一扩散定律高浓度梯度。');
    }
    if (next.time * Number(next.cycles) + 60 > 240) {
      next.time = 60;
      changes.push('将单次提取时长优化为 60 min（2 次合计约 3 学时，契合本科 4 学时课堂排程）。');
    }
    if (/氯仿|乙醚|苯|甲醇/.test(next.solventType || '')) {
      next.solventType = isVolatile ? '纯化水' : '70%乙醇';
      changes.push(`将高危溶剂替换为绿色安全的「${next.solventType}」体系。`);
    }
    if (!/\d/.test(String(next.ph || ''))) {
      next.ph = isAlkaloid ? '酸性 pH 2.5' : '中性 pH 7.0';
      changes.push(`将目标 pH 明确量化为「${next.ph}」。`);
    }
    if (!next.mesh || next.mesh.length < 2) {
      next.mesh = '中粉(40目)';
      changes.push('明确药材粉碎粒度为中粉（40 目）。');
    }
    if (`${next.origin} ${next.chemistry} ${next.integrative}`.trim().length < 55 || !/极性|扩散|酸碱|成盐|蒸馏|吸附/.test(`${next.origin}${next.chemistry}${next.integrative}`)) {
      next.origin = next.origin && next.origin.length >= 16 ? next.origin : `${herb}干燥药用部位（依据现行版《中国药典》基原核定），主含${comp}等${next.category}活性成分。`;
      next.chemistry = next.chemistry && next.chemistry.length >= 22 ? next.chemistry : `核心指标成分为${comp}，利用极性相似相溶与菲克第一扩散定律，选用${next.solventType}在 ${next.temp}℃ 下分 ${next.cycles} 次强化传质提取，兼顾溶出选择性与热敏保护。`;
      next.integrative = `【AI 优化设计依据】以${next.solventType}替代高毒有机溶剂，控温 ${next.temp}℃、料液比 1:${next.ratio}、${next.cycles} 次合并提取，结合旋蒸回收乙醇与平行 3 批对照（控制 RSD < 5%），并严格落实沸石防暴沸、冷凝水下进上出及废液分类安全规范。`;
      changes.push('深度补强了基原描述、相似相溶/菲克扩散机理、热敏保护与平行 3 批 RSD < 5% 质控设计。');
    }
    if (!next.tlcSystem || next.tlcSystem.trim().length < 15) {
      next.tlcSystem = isVolatile
        ? `硅胶 G 薄层板，石油醚(60~90℃)-乙酸乙酯(9:1)展开，香草醛-浓硫酸试液 105℃ 加热显色，对照品比移值 |ΔRf| ≤ 0.03。`
        : `硅胶 G 薄层板，乙酸乙酯-甲酸-水(8:1:1)或按药典比例展开，置 254 nm / 365 nm 紫外灯下检视荧光淬灭斑点，要求 |ΔRf| ≤ 0.03。`;
      changes.push('补全了规范 TLC 薄层色谱展开剂体系、紫外检视波长与 |ΔRf| ≤ 0.03 判定标准。');
    }
    if (!next.pharmacopoeia || next.pharmacopoeia.trim().length < 18) {
      next.pharmacopoeia = `参照《中国药典》一部${herb}项下质量标准，采用 UV-Vis 标曲法或 HPLC-DAD 定量测定${comp}含量，平行 3 批精密度 RSD < 5%，确保结果真实可复核。`;
      changes.push('补充了《中国药典》定量质控与 UV/HPLC 精密度复核要求。');
    }
    if (next.sop.length < 5) {
      next.sop = [
        `1. 精密称取 ${herb}（${next.mesh}）${next.mass} g，按 1:${next.ratio} 加入 ${next.solventType} 预浸润 15 min`,
        `2. 装配提取装置并核查气密性，投入 2~3 粒沸石防暴沸，通冷凝水（下进上出）于 ${next.temp}℃ 提取 ${next.time} min × ${next.cycles} 次`,
        `3. 趁热减压抽滤合并滤液，减压旋转蒸发低温浓缩并计量回收溶剂，得粗提物与精制部位`,
        `4. 平行进行特征理化显色/沉淀检识与 TLC 薄层对照（254/365 nm 检视，核对 |ΔRf| ≤ 0.03）`,
        `5. 记录 3 批平行收率与 RSD，按安全规范将有机废液分类倒入指定回收桶并整理实验台`
      ];
      changes.push('重构了 5 步完整可执行 SOP（含气密性核查、沸石防暴沸、溶剂回收与废液分类）。');
    }
    if (next.troubleshoot.length < 2) {
      next.troubleshoot = [
        { issue: '提取收率偏低或平行 RSD > 5%', cause: '药材浸润不足、粒度不均或转移过滤损耗偏大。', fix: '确保 40 目过筛均匀、预浸润 15 min 并用少量新鲜溶剂冲洗滤渣合并。' },
        { issue: 'TLC 展开斑点拖尾或分离度差', cause: '点样过浓或展开剂极性/酸碱抑制比例不当。', fix: '稀释供试品点样（点径 ≤ 2 mm），微调甲酸/氨水改性剂比例后重新展开。' }
      ];
      changes.push('新增 2 项高频异常排障预案（收率/RSD 波动与 TLC 斑点拖尾处理）。');
    }
    if (next.chemTests.length < 2) {
      next.chemTests = [
        { name: `${comp} 特征理化显色/沉淀反应阳性`, passed: true },
        { name: `TLC 薄层色谱对照品单斑一致（|ΔRf| ≤ 0.03）`, passed: true }
      ];
      changes.push('补齐了“理化显色 + TLC 对照”双轨检识证据链。');
    }
    if (!changes.length) {
      changes.push('已按评审建议对机理表述、温控安全及质控指标进行了精细润色与校核。');
    }
    return { optimized: next, changes, engine: '本地科研优化引擎' };
  }

  async function runAiOptimize(d, reviewRes) {
    const localOpt = optimizeLocally(d, (reviewRes && reviewRes.issues) || []);
    if (!window.TCMCloudAI || !window.TCMCloudAI.complete) return localOpt;

    const sys = [
      '你是《中药化学》实验设计优化专家。用户的自编实验方案在平台评审中未达到 90 分。',
      '请严格针对扣分项，优化参数（投料10~500g、料液比6~16、合理温控、2次合并、明确pH数值、绿色溶剂优先、总时长≤240min）、机理、TLC展开剂、药典标准、5步安全SOP和2条异常排障。',
      '只输出一个合法 JSON 对象：',
      '{"formalTitle":"","mass":50,"ratio":10,"temp":75,"time":60,"cycles":"2","solventType":"70%乙醇","mesh":"中粉(40目)","ph":"中性 pH 7.0","origin":"","chemistry":"","pharmacopoeia":"","tlcSystem":"","integrative":"","sop":["步骤1","步骤2","步骤3","步骤4","步骤5"],"troubleshoot":[{"issue":"","cause":"","fix":""},{"issue":"","cause":"","fix":""}],"changes":["本次优化亮点1","亮点2","亮点3"]}'
    ].join('\n');

    try {
      const res = await window.TCMCloudAI.complete({
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: `原方案：${JSON.stringify(d)}\n评审扣分漏洞：${JSON.stringify((reviewRes && reviewRes.issues) || [])}\n请帮我深度优化，使其达到 ≥ 90 分收录标准！` }
        ],
        expectJson: true,
        useCache: false
      });
      const p = JSON.parse(window.TCMCloudAI.cleanJsonText(res.content));
      if (!p || typeof p !== 'object') return localOpt;
      const merged = {
        ...localOpt.optimized,
        formalTitle: p.formalTitle || localOpt.optimized.formalTitle,
        mass: Number(p.mass) || localOpt.optimized.mass,
        ratio: Number(p.ratio) || localOpt.optimized.ratio,
        temp: Number(p.temp) || localOpt.optimized.temp,
        time: Number(p.time) || localOpt.optimized.time,
        cycles: String(p.cycles || localOpt.optimized.cycles),
        solventType: p.solventType || localOpt.optimized.solventType,
        mesh: p.mesh || localOpt.optimized.mesh,
        ph: p.ph || localOpt.optimized.ph,
        origin: p.origin || localOpt.optimized.origin,
        chemistry: p.chemistry || localOpt.optimized.chemistry,
        pharmacopoeia: p.pharmacopoeia || localOpt.optimized.pharmacopoeia,
        tlcSystem: p.tlcSystem || localOpt.optimized.tlcSystem,
        integrative: p.integrative || localOpt.optimized.integrative,
        sop: Array.isArray(p.sop) && p.sop.length >= 4 ? p.sop : localOpt.optimized.sop,
        troubleshoot: Array.isArray(p.troubleshoot) && p.troubleshoot.length >= 2 ? p.troubleshoot : localOpt.optimized.troubleshoot
      };
      const changes = Array.isArray(p.changes) && p.changes.length ? p.changes : localOpt.changes;
      return { optimized: merged, changes, engine: '云端智谱 GLM 协助优化' };
    } catch (_) {
      return { ...localOpt, engine: '本地专家规则优化（云端 AI 暂不可用自动接管）' };
    }
  }

  // ---------- 弹窗 UI 渲染与交互 ----------
  function ensureModal() {
    let m = document.getElementById('v17AiReviewModal');
    if (m) return m;
    m = document.createElement('div');
    m.id = 'v17AiReviewModal';
    m.className = 'no-print fixed inset-0 z-[130] hidden items-center justify-center p-3 sm:p-5';
    m.style.cssText = 'background:rgba(4,24,20,0.72);backdrop-filter:blur(12px);';
    document.body.appendChild(m);
    m.addEventListener('click', (e) => {
      if (e.target === m) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !m.classList.contains('hidden')) close();
    });
    return m;
  }

  function syncDraftFromForm(root) {
    if (!draftModel || !root) return;
    const val = (id) => { const el = root.querySelector('#' + id); return el ? el.value : undefined; };
    const setStr = (key, id) => { const v = val(id); if (v !== undefined) draftModel[key] = v.trim(); };
    setStr('herb', 'v17Herb');
    setStr('compound', 'v17Comp');
    setStr('category', 'v17Cat');
    setStr('formalTitle', 'v17Title');
    setStr('solventType', 'v17Solvent');
    setStr('ph', 'v17Ph');
    setStr('mesh', 'v17Mesh');
    setStr('origin', 'v17Origin');
    setStr('chemistry', 'v17Chem');
    setStr('tlcSystem', 'v17Tlc');
    setStr('pharmacopoeia', 'v17Pharm');
    setStr('integrative', 'v17Notes');
    if (val('v17Mass') !== undefined) draftModel.mass = Number(val('v17Mass')) || 50;
    if (val('v17Ratio') !== undefined) draftModel.ratio = Number(val('v17Ratio')) || 10;
    if (val('v17Temp') !== undefined) draftModel.temp = Number(val('v17Temp')) || 75;
    if (val('v17Time') !== undefined) draftModel.time = Number(val('v17Time')) || 60;
    if (val('v17Cycles') !== undefined) draftModel.cycles = String(val('v17Cycles') || '2');
  }

  function buildTopicPayloadFromDraft(d) {
    const base = d.sourceTopic || {};
    return {
      ...base,
      id: (base.id && String(base.id).startsWith('draft_')) ? base.id : ('draft_rev_' + Date.now()),
      herb: d.herb || '自定义药材',
      compound: d.compound || '目标成分',
      category: d.category || '黄酮',
      defaultRig: d.defaultRig || base.defaultRig || 'reflux',
      defaultCfg: {
        mass: d.mass, ratio: d.ratio, temp: d.temp, time: d.time,
        cycles: String(d.cycles || '2'), solventType: d.solventType, mesh: d.mesh, ph: d.ph
      },
      origin: d.origin,
      chemistry: d.chemistry,
      pharmacopoeia: d.pharmacopoeia,
      tlcSystem: d.tlcSystem,
      integrative: d.integrative,
      sop: d.sop,
      troubleshoot: d.troubleshoot,
      chemTests: d.chemTests
    };
  }

  function renderModal() {
    const m = ensureModal();
    const approvedList = (api() && api().getApprovedAiTopics) ? api().getApprovedAiTopics() : [];
    const d = draftModel || buildDraftFromTopic();
    const rev = lastReview;
    const isPass = rev && rev.score >= PASS_SCORE;

    m.innerHTML = `
      <div class="rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border" style="background:var(--ds-surface,#fff);border-color:var(--ds-line-strong,rgba(15,92,84,0.22));color:var(--ds-ink,#0f2420)">
        <!-- 头部 -->
        <div class="px-5 sm:px-6 py-4 text-white flex items-center justify-between gap-3" style="background:linear-gradient(120deg,#05221e,#0b443b 62%,#0f5c54)">
          <div class="min-w-0">
            <div style="font-size:0.7rem;font-weight:850;letter-spacing:0.12em;color:#fde68a">AI QUALITY GATE · 90 分严格准入评审</div>
            <h3 style="margin:2px 0 0;font-size:1.1rem;font-weight:900">AI 自编课题审核与协助优化工作台</h3>
            <p style="margin:2px 0 0;font-size:0.76rem;color:#c7e5dc">用户自主决定是否申请 · 平台 AI 五维严格打分（必须 ≥ 90 分方可编入）· 不足 90 分可接入 AI 协助优化</p>
          </div>
          <button type="button" id="v17CloseBtn" class="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xl font-bold flex items-center justify-center shrink-0">×</button>
        </div>

        <!-- 切换标签 -->
        <div class="px-5 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b" style="border-color:var(--ds-line);background:var(--ds-surface-soft,#f9faf7)">
          <div class="v16-seg-bar">
            <button type="button" class="v16-seg-btn ${modalTab === 'review' ? 'active' : ''}" data-v17-tab="review">🛡️ 申请审核与 AI 优化</button>
            <button type="button" class="v16-seg-btn ${modalTab === 'approved' ? 'active' : ''}" data-v17-tab="approved">📚 已过审 AI 自编库 (${approvedList.length})</button>
          </div>
          <span style="font-size:0.74rem;color:var(--ds-muted)">未提交编入的测试草稿刷新页面即自动无痕清空</span>
        </div>

        <!-- 主内容区 -->
        <div class="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          ${modalTab === 'approved' ? `
            <div class="flex items-center justify-between gap-2">
              <div>
                <h4 style="margin:0;font-size:0.98rem;font-weight:850">已通过平台 AI 严审（≥ 90 分）并由你确认编入的课题</h4>
                <p style="margin:2px 0 0;font-size:0.78rem;color:var(--ds-muted)">只有经你本人主动申请、AI 评审 ≥ 90 分并最终确认的方案才会留在这里，其余所有临时测试每次进入均自动无痕清零。</p>
              </div>
              ${approvedList.length ? `<button type="button" id="v17ClearAllApproved" class="v16-chip-btn" style="color:#b91c1c;border-color:rgba(185,28,28,0.28)">清空全部自编库</button>` : ''}
            </div>
            ${approvedList.length ? `
              <div class="space-y-2.5">
                ${approvedList.map(item => `
                  <div class="p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3" style="background:var(--ds-surface-soft);border-color:var(--ds-line)">
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-2 flex-wrap">
                        <strong style="font-size:0.95rem">${esc(item.herb)} · ${esc(item.compound)}</strong>
                        <span class="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-900">✓ AI 严审 ${esc(item.aiReview?.score || 90)} 分</span>
                        <span style="font-size:0.72rem;color:var(--ds-muted)">${esc(item.aiReview?.reviewedAt || '')}</span>
                      </div>
                      <p style="margin:4px 0 0;font-size:0.78rem;color:var(--ds-muted)">${esc(item.aiReview?.summary || item.origin || '')}</p>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                      <button type="button" class="v16-chip-btn" data-v17-load-approved="${esc(item.id)}">载入工坊 →</button>
                      <button type="button" class="v16-chip-btn" style="color:#b91c1c" data-v17-del-approved="${esc(item.id)}">移除</button>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div class="p-10 rounded-2xl border border-dashed text-center space-y-2" style="border-color:var(--ds-line-strong)">
                <div style="font-size:28px">🛡️</div>
                <div style="font-weight:850;font-size:0.95rem">AI 自编题库当前为空（零杂质 · 纯净状态）</div>
                <p style="margin:0;font-size:0.8rem;color:var(--ds-muted)">你可以先在「AI 设计台」或「DIY 药材」中编写方案，再自主提交至本评审台通过 ≥ 90 分打分后正式编入。</p>
              </div>
            `}
          ` : `
            <!-- 评审结果区（一旦打分即置顶展示，清晰反馈是否过 90 分线！） -->
            ${rev ? `
              <div class="rounded-2xl p-4 sm:p-5 border space-y-4" style="background:${isPass ? 'linear-gradient(135deg,rgba(16,185,129,0.10),rgba(255,255,255,0.92))' : 'linear-gradient(135deg,rgba(239,68,68,0.08),rgba(255,251,235,0.94))'};border-color:${isPass ? 'rgba(16,185,129,0.42)' : 'rgba(239,68,68,0.35)'}">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div style="font-size:0.72rem;font-weight:850;color:${isPass ? '#047857' : '#b91c1c'}">${isPass ? '✅ 审核通过 · 已达 ≥ 90 分准入标准' : `❌ 未达 90 分准入标准（距编入门槛还差 ${PASS_SCORE - rev.score} 分，已拦截编入）`} · ${esc(rev.engine)}</div>
                    <p style="margin:4px 0 0;font-size:0.84rem;font-weight:650;color:var(--ds-ink)">${esc(rev.summary)}</p>
                  </div>
                  <div class="px-4 py-2 rounded-2xl text-center shrink-0" style="background:${isPass ? '#065f46' : '#991b1b'};color:#fff">
                    <div style="font-size:1.55rem;font-weight:950;line-height:1">${rev.score}<span style="font-size:0.8rem;opacity:0.8"> / 100</span></div>
                    <div style="font-size:0.68rem;margin-top:2px;color:#fde68a">准入标准 ≥ ${PASS_SCORE} 分</div>
                  </div>
                </div>

                <!-- 5 维得分条 -->
                <div class="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  ${(rev.dimensions || []).map(dim => {
                    const pct = Math.round((dim.score / (dim.max || 20)) * 100);
                    const ok = dim.score >= 18;
                    return `
                      <div class="p-2.5 rounded-xl border" style="background:var(--ds-surface);border-color:var(--ds-line)">
                        <div class="flex items-center justify-between text-[11px] font-bold">
                          <span class="truncate">${esc(dim.name)}</span>
                          <strong style="color:${ok ? '#059669' : '#d97706'}">${dim.score}/${dim.max}</strong>
                        </div>
                        <div class="h-1.5 rounded-full bg-slate-200/80 overflow-hidden my-1.5"><div style="width:${pct}%;height:100%;background:${ok ? '#10b981' : '#f59e0b'}"></div></div>
                        <div style="font-size:0.7rem;color:var(--ds-muted);line-height:1.4">${esc(dim.comment)}</div>
                      </div>
                    `;
                  }).join('')}
                </div>

                ${rev.issues && rev.issues.length ? `
                  <div class="p-3.5 rounded-xl border space-y-1.5" style="background:rgba(255,255,255,0.72);border-color:rgba(217,119,6,0.28)">
                    <div style="font-size:0.78rem;font-weight:850;color:#92400e">🔍 扣分漏洞与整改清单（共 ${rev.issues.length} 项）</div>
                    <ul style="margin:0;padding-left:18px;font-size:0.78rem;line-height:1.65;color:#78350f">
                      ${rev.issues.map(it => `<li>${esc(it)}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}

                <!-- 决策操作栏：达标才解锁「由我确认编入」；不达标引导「接入 AI 协助优化」 -->
                <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
                  ${isPass ? `
                    <span style="font-size:0.78rem;font-weight:700;color:#047857">方案已达标，是否正式编入「AI 自编题库」由你本人最终决定：</span>
                    <div class="flex flex-wrap gap-2">
                      <button type="button" id="v17CommitApprovedBtn" class="v16-btn-cta-primary" style="padding:10px 18px;font-size:0.84rem">✅ 由我确认：正式编入 AI 自编库</button>
                      <button type="button" id="v17KeepTempBtn" class="v16-chip-btn">暂不编入（仅本次无痕演练）</button>
                    </div>
                  ` : `
                    <div class="flex flex-wrap items-center gap-2 w-full justify-between">
                      <button type="button" id="v17AiOptimizeBtn" class="v16-btn-cta-primary" style="padding:10px 18px;font-size:0.84rem" ${busyMode ? 'disabled' : ''}>
                        ${busyMode === 'optimizing' ? '⏳ AI 正在针对漏洞深度优化实验...' : '✨ 接入 AI 协助深度优化此实验（冲击 ≥ 90 分）'}
                      </button>
                      <button type="button" disabled class="v16-chip-btn opacity-45 cursor-not-allowed" title="评分必须达到 90 分以上才可解锁编入">🔒 编入已锁定（需 ≥ 90 分）</button>
                    </div>
                  `}
                </div>
              </div>
            ` : ''}

            ${lastOptimizeNotes.length ? `
              <div class="rounded-2xl p-4 border space-y-1.5" style="background:rgba(16,185,129,0.08);border-color:rgba(16,185,129,0.32)">
                <div style="font-size:0.8rem;font-weight:850;color:#047857">✨ AI 已协助完成以下优化升级（请点击下方「提交平台 AI 重新复审」检验分数）：</div>
                <ul style="margin:0;padding-left:18px;font-size:0.78rem;line-height:1.6;color:var(--ds-ink-2)">
                  ${lastOptimizeNotes.map(n => `<li>${esc(n)}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            <!-- 待审方案表单（用户可自由修订后再评审） -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <h4 style="margin:0;font-size:0.94rem;font-weight:850">📝 待审自编实验方案内容（提交前可自由微调）</h4>
                <button type="button" id="v17ReloadCurrentBtn" class="v16-chip-btn">重新拉取当前工作台参数</button>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label class="text-xs font-bold space-y-1"><span>药材名称 *</span><input id="v17Herb" value="${esc(d.herb)}" class="w-full px-3 py-2 rounded-xl border text-xs" style="background:var(--ds-surface-soft);border-color:var(--ds-line-strong)" /></label>
                <label class="text-xs font-bold space-y-1"><span>目标活性成分 *</span><input id="v17Comp" value="${esc(d.compound)}" class="w-full px-3 py-2 rounded-xl border text-xs" style="background:var(--ds-surface-soft);border-color:var(--ds-line-strong)" /></label>
                <label class="text-xs font-bold space-y-1"><span>成分大类</span><input id="v17Cat" value="${esc(d.category)}" class="w-full px-3 py-2 rounded-xl border text-xs" style="background:var(--ds-surface-soft);border-color:var(--ds-line-strong)" /></label>
              </div>
              <label class="block text-xs font-bold space-y-1"><span>正式实验题目 *</span><input id="v17Title" value="${esc(d.formalTitle)}" class="w-full px-3 py-2 rounded-xl border text-xs" style="background:var(--ds-surface-soft);border-color:var(--ds-line-strong)" /></label>
              <div class="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                <label class="text-xs font-bold space-y-1"><span>投料(g)</span><input id="v17Mass" type="number" value="${esc(d.mass)}" class="w-full px-2.5 py-2 rounded-xl border text-xs" style="background:var(--ds-surface-soft);border-color:var(--ds-line-strong)" /></label>
                <label class="text-xs font-bold space-y-1"><span>料液比</span><input id="v17Ratio" type="number" value="${esc(d.ratio)}" class="w-full px-2.5 py-2 rounded-xl border text-xs" style="background:var(--ds-surface-soft);border-color:var(--ds-line-strong)" /></label>
                <label class="text-xs font-bold space-y-1"><span>温度(℃)</span><input id="v17Temp" type="number" value="${esc(d.temp)}" class="w-full px-2.5 py-2 rounded-xl border text-xs" style="background:var(--ds-surface-soft);border-color:var(--ds-line-strong)" /></label>
                <label class="text-xs font-bold space-y-1"><span>时长(min)</span><input id="v17Time" type="number" value="${esc(d.time)}" class="w-full px-2.5 py-2 rounded-xl border text-xs" style="background:var(--ds-surface-soft);border-color:var(--ds-line-strong)" /></label>
                <label class="text-xs font-bold space-y-1"><span>次数</span><input id="v17Cycles" type="number" value="${esc(d.cycles)}" class="w-full px-2.5 py-2 rounded-xl border text-xs" style="background:var(--ds-surface-soft);border-color:var(--ds-line-strong)" /></label>
                <label class="text-xs font-bold space-y-1"><span>溶剂体系</span><input id="v17Solvent" value="${esc(d.solventType)}" class="w-full px-2.5 py-2 rounded-xl border text-xs" style="background:var(--ds-surface-soft);border-color:var(--ds-line-strong)" /></label>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label class="text-xs font-bold space-y-1"><span>目标 pH 量化</span><input id="v17Ph" value="${esc(d.ph)}" class="w-full px-3 py-2 rounded-xl border text-xs" style="background:var(--ds-surface-soft);border-color:var(--ds-line-strong)" /></label>
                <label class="text-xs font-bold space-y-1"><span>粉碎粒度</span><input id="v17Mesh" value="${esc(d.mesh)}" class="w-full px-3 py-2 rounded-xl border text-xs" style="background:var(--ds-surface-soft);border-color:var(--ds-line-strong)" /></label>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label class="text-xs font-bold space-y-1"><span>基原与化学机理依据</span><textarea id="v17Chem" rows="2" class="w-full px-3 py-2 rounded-xl border text-xs" style="background:var(--ds-surface-soft);border-color:var(--ds-line-strong)">${esc(d.chemistry || d.origin)}</textarea></label>
                <label class="text-xs font-bold space-y-1"><span>TLC 薄层与药典质控依据</span><textarea id="v17Tlc" rows="2" class="w-full px-3 py-2 rounded-xl border text-xs" style="background:var(--ds-surface-soft);border-color:var(--ds-line-strong)">${esc(d.tlcSystem)}</textarea></label>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label class="text-xs font-bold space-y-1"><span>药典与定量标准说明</span><input id="v17Pharm" value="${esc(d.pharmacopoeia)}" class="w-full px-3 py-2 rounded-xl border text-xs" style="background:var(--ds-surface-soft);border-color:var(--ds-line-strong)" /></label>
                <label class="text-xs font-bold space-y-1"><span>安全防护与创新设计亮点</span><input id="v17Notes" value="${esc(d.integrative)}" class="w-full px-3 py-2 rounded-xl border text-xs" style="background:var(--ds-surface-soft);border-color:var(--ds-line-strong)" /></label>
              </div>
              <input id="v17Origin" type="hidden" value="${esc(d.origin)}" />
            </div>
          `}
        </div>

        <!-- 底部执行栏 -->
        ${modalTab === 'review' ? `
          <div class="px-5 sm:px-6 py-3.5 border-t flex flex-wrap items-center justify-between gap-2" style="border-color:var(--ds-line);background:var(--ds-surface-soft)">
            <span style="font-size:0.76rem;color:var(--ds-muted)">评审硬门槛：<strong>5 维总分 ≥ 90 分</strong> 且需本人最后确认方可编入</span>
            <div class="flex flex-wrap gap-2">
              <button type="button" id="v17RunReviewBtn" class="v16-btn-cta-primary" style="padding:10px 20px;font-size:0.84rem" ${busyMode ? 'disabled' : ''}>
                ${busyMode === 'reviewing' ? '⏳ 平台 AI 正在五维严格打分...' : (rev ? '🔁 重新提交 AI 复审打分' : '🚀 提交平台 AI 严格打分（≥90分准入）')}
              </button>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    // 绑定事件
    m.querySelector('#v17CloseBtn')?.addEventListener('click', close);
    m.querySelectorAll('[data-v17-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        syncDraftFromForm(m);
        modalTab = btn.dataset.v17Tab;
        renderModal();
      });
    });

    m.querySelector('#v17ReloadCurrentBtn')?.addEventListener('click', () => {
      draftModel = buildDraftFromTopic();
      lastReview = null;
      lastOptimizeNotes = [];
      renderModal();
    });

    m.querySelector('#v17RunReviewBtn')?.addEventListener('click', async () => {
      syncDraftFromForm(m);
      if (!draftModel.herb || !draftModel.compound) {
        api()?.showToast?.('请先填写药材名称与目标活性成分', 'error');
        return;
      }
      busyMode = 'reviewing';
      renderModal();
      lastReview = await runAiReview(draftModel);
      busyMode = '';
      renderModal();
    });

    m.querySelector('#v17AiOptimizeBtn')?.addEventListener('click', async () => {
      syncDraftFromForm(m);
      busyMode = 'optimizing';
      renderModal();
      const opt = await runAiOptimize(draftModel, lastReview);
      draftModel = opt.optimized;
      lastOptimizeNotes = opt.changes || [];
      // 同步优化后的临时草稿到工作台，方便用户随时预览，但仍未正式编入，须再次通过 ≥90 分复审！
      if (api() && api().setSessionDraft) {
        api().setSessionDraft(buildTopicPayloadFromDraft(draftModel), {
          formalTitle: draftModel.formalTitle,
          mass: draftModel.mass, ratio: draftModel.ratio, temp: draftModel.temp,
          time: draftModel.time, cycles: draftModel.cycles, solventType: draftModel.solventType,
          mesh: draftModel.mesh, ph: draftModel.ph, diyNotes: draftModel.integrative
        });
      }
      busyMode = '';
      // 优化后自动再跑一次 AI 复审，让用户立刻看到分数跃升结果！
      busyMode = 'reviewing';
      renderModal();
      lastReview = await runAiReview(draftModel);
      busyMode = '';
      renderModal();
    });

    m.querySelector('#v17CommitApprovedBtn')?.addEventListener('click', () => {
      syncDraftFromForm(m);
      if (!lastReview || lastReview.score < PASS_SCORE) return;
      const payload = buildTopicPayloadFromDraft(draftModel);
      const res = api() && api().commitApprovedAiTopic ? api().commitApprovedAiTopic(payload, lastReview) : { ok: false };
      if (res && res.ok) {
        modalTab = 'approved';
        lastReview = null;
        lastOptimizeNotes = [];
        renderModal();
      }
    });

    m.querySelector('#v17KeepTempBtn')?.addEventListener('click', () => {
      api()?.showToast?.('已保留为本次无痕临时演练，刷新页面将自动清空', 'info');
      close();
    });

    m.querySelectorAll('[data-v17-load-approved]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.v17LoadApproved;
        close();
        if (api()) api().selectTopic(id, 1);
        if (window.TCM_V16_PORTAL) window.TCM_V16_PORTAL.go('workflow', { step: 1 });
      });
    });

    m.querySelectorAll('[data-v17-del-approved]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (api() && api().deleteApprovedAiTopic) api().deleteApprovedAiTopic(btn.dataset.v17DelApproved);
        renderModal();
      });
    });

    m.querySelector('#v17ClearAllApproved')?.addEventListener('click', () => {
      if (!window.confirm('确定清空全部已过审的 AI 自编题库吗？')) return;
      if (api() && api().clearApprovedAiBank) api().clearApprovedAiBank();
      renderModal();
    });
  }

  function open(topicOverride, startTab = 'review') {
    draftModel = buildDraftFromTopic(topicOverride);
    lastReview = null;
    lastOptimizeNotes = [];
    busyMode = '';
    modalTab = startTab;
    const m = ensureModal();
    renderModal();
    m.classList.remove('hidden');
    m.classList.add('flex');
  }

  function close() {
    const m = document.getElementById('v17AiReviewModal');
    if (m) {
      m.classList.add('hidden');
      m.classList.remove('flex');
    }
  }

  window.TCM_AI_REVIEW = { open, close, PASS_SCORE, evaluateLocally };
})();
