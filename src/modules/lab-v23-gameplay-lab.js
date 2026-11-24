/**
 * 本草智研 v23 · 板块二：实验玩法系统（自由配方沙盒 + 失败分支事故复盘卡 + 药厂风云录 + 每日一题）
 * 严格复用现有 119 项题库与真实药典/工艺规则，现代 Bento 视觉风格，按需异步加载。
 */
const esc = (v) => String(v == null ? '' : v).replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));

const SOLVENT_OPTIONS = [
  { id: '纯化水', polarity: 9.0, green: 100, bp: 100, hazard: '无燃爆风险，环保极佳' },
  { id: '50%乙醇', polarity: 7.2, green: 88, bp: 82, hazard: '中等易燃，注意通风远离明火' },
  { id: '70%乙醇', polarity: 6.2, green: 84, bp: 80, hazard: '易燃液体，须水浴/防爆加热' },
  { id: '95%乙醇', polarity: 5.2, green: 78, bp: 78, hazard: '高易燃液体，严禁明火并备防爆冷凝' },
  { id: '0.5%酸水', polarity: 9.2, green: 85, bp: 100, hazard: '弱酸性腐蚀，注意护目镜与废液中和' },
  { id: '绿色NADES低共熔', polarity: 6.8, green: 96, bp: 110, hazard: '绿色低挥发溶剂，黏度偏高需适度控温' },
  { id: '石油醚(低极性)', polarity: 0.2, green: 42, bp: 60, hazard: '极易燃低沸溶剂！严禁明火，通风橱操作' }
];

const RIG_OPTIONS = [
  { id: 'reflux', name: '热回流提取装置', fit: ['黄酮', '生物碱', '皂苷与三萜', '蒽醌与醌类', '香豆素与木脂素', '苯丙素与有机酸', '萜类内酯与环烯醚萜'] },
  { id: 'steam', name: '水蒸气蒸馏装置', fit: ['挥发油与萜类'] },
  { id: 'ultrasonic', name: '超声辅助提取仪', fit: ['黄酮', '生物碱', '苯丙素与有机酸', '香豆素与木脂素', '皂苷与三萜', '挥发油与萜类'] },
  { id: 'percolation', name: '冷浸 / 渗漉装置', fit: ['生物碱', '萜类内酯与环烯醚萜', '甾体与强心苷', '氰苷类'] },
  { id: 'decoct', name: '水煮提取 + 醇沉罐', fit: ['多糖类', '黄酮', '生物碱', '苯丙素与有机酸'] }
];

const STORY_CASES = [
  {
    id: 'case_baicalin',
    title: '第一案：《消失的含量》',
    tag: '提取失活事故 · 黄芩',
    scene: '某高校中试车间投料 20 kg 黄芩饮片，质检发现水提液变绿且 HPLC 测得黄芩苷含量较标准骤降 42%，但黄芩素（苷元）峰面积异常升高。',
    clues: [
      '工艺记录显示：操作员为“充分润透”，将黄芩粗粉用 40℃ 温水浸泡了 4 小时后再升温煎煮。',
      '原药材留样 HPLC 复测：黄芩苷含量 11.2%（符合《中国药典》≥ 9.0% 要求）。',
      '提取液 pH 正常，未检出重金属或微生物污染。'
    ],
    question: '结合黄芩化学成分特性，导致黄芩苷暴跌且药液变绿的根本原因是？',
    options: [
      { id: 'a', text: '40℃ 温水长时浸泡激活了黄芩自身含有的「黄芩酶」，将黄芩苷水解为黄芩素并进一步氧化变绿', correct: true },
      { id: 'b', text: '提取罐搅拌转速过快导致黄酮母核机械断裂', correct: false },
      { id: 'c', text: '纯化水极性不足，无法溶解黄芩苷', correct: false }
    ],
    capa: '【CAPA 纠正预防措施】取消低温长时间浸泡；改为沸水直接投料煎煮（或蒸汽软化杀酶），迅速破坏黄芩酶活性，缩短提取前等待时间，并设「投入即沸」为关键工艺控制点（CPP）。'
  },
  {
    id: 'case_rutin',
    title: '第二案：《结晶疑云》',
    tag: '精制氧化事故 · 槐米芦丁',
    scene: '本科生创新小组采用碱提酸沉法制备槐米芦丁，所得粗品呈暗褐色黏稠块状，重结晶后收率极低且熔点偏宽（172~181℃）。',
    clues: [
      '实验记录：提取时直接加入 0.4% NaOH 溶液加热沸腾 45 分钟，未添加任何保护剂。',
      '酸化沉淀时一次倒入浓盐酸，体系 pH 瞬间降至 1.2，且未控温直接 90℃ 烘箱干燥。',
      '原槐米药材外观饱满，无霉变。'
    ],
    question: '该批次芦丁结晶发暗结块、收率暴跌的最核心工艺缺陷是？',
    options: [
      { id: 'a', text: '药材粉碎不够细，应磨成 200 目超微粉', correct: false },
      { id: 'b', text: '强碱热提未加硼砂保护邻二酚羟基导致氧化破坏，且强酸过量（pH<2）引起芦丁糖苷键水解与高温焦化', correct: true },
      { id: 'c', text: '应该用石油醚代替碱水提取芦丁', correct: false }
    ],
    capa: '【CAPA 纠正预防措施】采用石灰乳（Ca(OH)₂）或加入少量硼砂（Na₂B₄O₇）与邻二酚羟基络合保护；缓滴稀酸控 pH 3~4 静置析晶；60℃ 以下低温减压干燥。'
  },
  {
    id: 'case_danshen',
    title: '第三案：《车间警报》',
    tag: '中试放大偏差 · 丹参',
    scene: '丹参醇提工艺从 50 g 烧瓶小试放大至 50 L 多功能提取罐时，过滤网 15 分钟即严重堵塞，且丹参酮 IIA 转移率较实验室下降 18%。',
    clues: [
      '中试操作直接照搬实验室参数：把饮片打成了 80 目细粉，料液比未变（1:6），且提取罐未开启间歇循环泵。',
      '取渣检测发现罐底存在大块未浸润的干粉结团（“死角”）。',
      '溶剂乙醇浓度检验合格（90%）。'
    ],
    question: '放大生产出现堵网与转移率下降的工程根因与优先 CAPA 决策是？',
    options: [
      { id: 'a', text: '细粉导致滤饼压实堵塞与传质死角：应改用粗粉/切段（10~20目）、适当提高料液比并开启循环搅拌强制传质', correct: true },
      { id: 'b', text: '把乙醇浓度降到 20% 即可防止丹参堵网', correct: false },
      { id: 'c', text: '直接把提取温度升到 120℃ 加压蒸煮 6 小时', correct: false }
    ],
    capa: '【CAPA 纠正预防措施】小试到中试存在典型非线性传质/传热放大效应：中试禁止照搬细粉粒度，应锁定 10~20 目粗粉/薄片，配合底部循环泵与在线压差监测，并做三批工艺验证。'
  }
];

const DAILY_PERTURBATIONS = [
  {
    title: '溶剂库预警：今日高浓度乙醇紧缺',
    desc: '实验室仅剩 50% 乙醇与纯化水，且要求尽量维持绿色工艺。面对该药材应如何调整策略？',
    choices: [
      { text: '核查目标成分极性：亲水性成分可改水提/50%乙醇并增加 1 次提取；强脂溶性成分可改超声/NADES 或改选兼容课题', ok: true },
      { text: '直接用冷水浸泡 10 分钟即可得到相同收率', ok: false },
      { text: '随意改用剧毒有机溶剂且不进通风橱', ok: false }
    ]
  },
  {
    title: '温控限制：恒温水浴上限锁定 60℃',
    desc: '今日实验室控温设备最高仅能维持 60℃，若需保证目标成分充分溶出，最合理的工艺补偿方案是？',
    choices: [
      { text: '改用超声辅助提取（空化效应强化传质）或适当提高粉碎粒度与提取次数，兼顾保护热敏成分', ok: true },
      { text: '改用明火酒精灯直接猛火加热有机溶剂', ok: false },
      { text: '把料液比缩减到 1:2 强行干蒸', ok: false }
    ]
  },
  {
    title: '环保督查：今日执行零氯仿绿色教学标准',
    desc: '系部要求全天实验取消氯仿/三氯甲烷萃取与展开体系，该如何合规替代？',
    choices: [
      { text: '改用乙酸乙酯-正丁醇分级萃取或 D101 大孔树脂吸附纯化，TLC 展开剂切换为乙酸乙酯-甲酸-水等低毒体系', ok: true },
      { text: '直接跳过分离纯化与 TLC 检识步骤', ok: false },
      { text: '将氯仿倒入普通下水道隐瞒使用', ok: false }
    ]
  }
];

let modalEl = null;
let activeTab = 'sandbox';
let sandboxState = {
  topicId: '',
  solvent: '70%乙醇',
  rig: 'reflux',
  temp: 75,
  ratio: 10,
  time: 60,
  boilStone: true,
  sealed: true,
  result: null
};
let activeStoryIdx = 0;
let storyAnswered = {};
let dailyAnswered = null;

function getTopics() {
  if (typeof window !== 'undefined' && window.TCM_LAB_API?.getAllTopics) {
    return window.TCM_LAB_API.getAllTopics();
  }
  return [];
}

function dispatchAchievement(detail) {
  try {
    window.dispatchEvent(new CustomEvent('tcm:achievement-event', { detail }));
  } catch (_) {}
}

function getExpectedPolarity(topic) {
  const cat = String(topic?.category || '');
  const defSol = String(topic?.defaultCfg?.solventType || '');
  if (/挥发油|萜/.test(cat) || /石油醚|95%乙醇/.test(defSol)) return 3.2;
  if (/多糖/.test(cat) || (/水/.test(defSol) && !/乙醇/.test(defSol))) return 8.8;
  if (/生物碱/.test(cat) && /酸水/.test(defSol)) return 8.8;
  if (/黄酮|苯丙素|皂苷|蒽醌|香豆素/.test(cat)) return 6.2;
  return 6.5;
}

function evaluateSandbox(topic) {
  const sol = SOLVENT_OPTIONS.find((s) => s.id === sandboxState.solvent) || SOLVENT_OPTIONS[2];
  const rig = RIG_OPTIONS.find((r) => r.id === sandboxState.rig) || RIG_OPTIONS[0];
  const expectedPol = getExpectedPolarity(topic);
  const polDiff = Math.abs(sol.polarity - expectedPol);
  const cat = String(topic?.category || '');
  const herb = String(topic?.herb || '');
  const defTemp = Number(topic?.defaultCfg?.temp) || 80;

  const accidents = [];
  let yieldFactor = 1.0;

  // 1. 极性匹配度检查
  if (polDiff > 4.2) {
    yieldFactor *= 0.38;
    accidents.push({
      level: '严重失败',
      title: '溶剂极性严重错配（相似相溶违背）',
      phenomenon: `提取液几乎无目标成分特征显色，粗提得率骤降 60%+。`,
      cause: `「${herb} · ${topic.compound}」偏向极性值 ≈ ${expectedPol.toFixed(1)}（参考默认溶剂：${topic.defaultCfg?.solventType || '中极性乙醇'}），而所选「${sol.id}」极性为 ${sol.polarity}，跨度过大导致目标分子难以溶出。`,
      remedy: `立即更换为接近「${topic.defaultCfg?.solventType || '70%乙醇'}」的溶剂体系并重新浸润提取。`,
      prevent: '设计前先对照成分极性图谱：多糖/苷元盐选水或酸水，黄酮/皂苷选 50%~75% 乙醇，挥发油/菲醌选高醇或低极性溶剂。'
    });
  } else if (polDiff > 2.4) {
    yieldFactor *= 0.72;
    accidents.push({
      level: '工艺偏差',
      title: '溶剂极性偏离最优窗口',
      phenomenon: '浸膏中非目标杂质（如糖类或叶绿素）比例升高，后续纯化压力加大。',
      cause: `所选溶剂「${sol.id}」与推荐体系「${topic.defaultCfg?.solventType || '70%乙醇'}」存在极性偏差。`,
      remedy: '可通过调整醇水比例或增加一次液-液萃取/大孔树脂分级富集补救。',
      prevent: '以 L9 正交试验对比 3 档乙醇浓度，兼顾转移率与杂质溶出比。'
    });
  }

  // 2. 热敏降解 / 酶解风险检查
  if (/黄芩/.test(herb) && sandboxState.temp < 70 && sandboxState.time >= 45) {
    yieldFactor *= 0.55;
    accidents.push({
      level: '严重失败',
      title: '黄芩酶激活导致黄芩苷水解变绿',
      phenomenon: '提取液逐渐发绿，HPLC 示黄芩苷主峰锐减、苷元黄芩素异常升高。',
      cause: `在 ${sandboxState.temp}℃ 低温下长时浸泡（${sandboxState.time} min）恰好落入黄芩酶最适活性温区！`,
      remedy: '迅速升温至沸腾杀酶并单独评估已水解批次。',
      prevent: '黄芩类含酶药材必须采用沸水投料或预先蒸汽杀酶。'
    });
  } else if (sandboxState.temp > Math.max(defTemp + 20, 95) && /挥发油|酚酸|多糖|萜|丹参|黄酮/.test(cat + herb)) {
    yieldFactor *= 0.68;
    accidents.push({
      level: '热敏事故',
      title: '超温提取导致热敏/挥发成分降解逸散',
      phenomenon: '提取液颜色明显加深发褐，香气或热敏活性成分含量不升反降。',
      cause: `当前设定温度 ${sandboxState.temp}℃ 远高于推荐工艺温区（约 ${defTemp}℃），引发氧化焦化或挥发损失。`,
      remedy: '立即下调加热温度至推荐温区，必要时改减压低温浓缩。',
      prevent: '热敏成分严格设定温控红线，优先考虑超声辅助或低温减压工艺。'
    });
  }

  // 3. 暴沸冲料风险
  if (!sandboxState.boilStone && sandboxState.temp >= sol.bp - 5 && sandboxState.rig !== 'percolation' && sandboxState.rig !== 'ultrasonic') {
    yieldFactor *= 0.78;
    accidents.push({
      level: '安全事故',
      title: '未加沸石引发暴沸冲料',
      phenomenon: '烧瓶内液体剧烈翻涌并冲入冷凝管，造成料液喷溅与烫伤隐患。',
      cause: `加热温度（${sandboxState.temp}℃）接近溶剂「${sol.id}」沸点（${sol.bp}℃）且缺少气化中心。`,
      remedy: '立即撤离热源，待液温降至沸点以下至少 15℃ 后再补加 2~3 粒新沸石（严禁向沸腾液直接投沸石！）。',
      prevent: '任何回流/蒸馏加热前，将“加入沸石并核对液面 ≤ 2/3 容积”列为 SOP 必检项。'
    });
  }

  // 4. 气密性损失
  if (!sandboxState.sealed && (sandboxState.rig === 'reflux' || sandboxState.rig === 'steam' || /乙醇|石油醚/.test(sol.id))) {
    yieldFactor *= 0.75;
    accidents.push({
      level: '安全与收率事故',
      title: '装置气密性不良导致溶剂/挥发油逃逸',
      phenomenon: '磨口接口处持续冒白雾并伴随浓烈溶剂气味，回流液量明显减少，收率损失 20%+。',
      cause: '接口未涂凡士林或冷凝水未按“下进上出”充分开启。',
      remedy: '停热降温后重新涂抹密封脂并紧固铁夹，确认冷凝水流量稳定。',
      prevent: '开机前务必执行磨口检查与冷凝水通水测试。'
    });
  }

  // 5. 装置适配检查
  if (!rig.fit.includes(cat) && cat) {
    yieldFactor *= 0.82;
    accidents.push({
      level: '装置错配',
      title: `装置「${rig.name}」并非「${cat}」最优选择`,
      phenomenon: '传质效率偏低或分离界面不清晰，耗时显著增加。',
      cause: `「${topic.herb}」属于${cat}，更适配 ${rig.id === 'steam' ? '热回流/超声' : (cat.includes('挥发油') ? '水蒸气蒸馏' : '热回流/渗漉')} 类装置。`,
      remedy: '切换为对应类别推荐的提取装置并核对液料接触方式。',
      prevent: '依据目标成分挥发性与热稳定性选型装置。'
    });
  }

  // 料液比与时间修正
  const ratioBoost = sandboxState.ratio >= 8 && sandboxState.ratio <= 14 ? 1.0 : 0.88;
  const timeBoost = sandboxState.time >= 40 && sandboxState.time <= 120 ? 1.0 : 0.9;
  const estYieldPct = Math.max(12, Math.min(96, Math.round(88 * yieldFactor * ratioBoost * timeBoost)));
  const greenScore = Math.max(20, Math.min(100, Math.round(sol.green - (sandboxState.ratio > 14 ? 8 : 0) - (sandboxState.temp > 90 ? 6 : 0))));
  const totalScore = Math.max(15, Math.min(100, Math.round(estYieldPct * 0.55 + greenScore * 0.25 + (accidents.length === 0 ? 20 : Math.max(0, 14 - accidents.length * 6)))));

  return { estYieldPct, greenScore, totalScore, accidents, sol, rig };
}

function ensureModal() {
  if (modalEl) return modalEl;
  modalEl = document.createElement('div');
  modalEl.id = 'tcmV23Modal';
  modalEl.className = 'no-print fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/65 backdrop-blur-xs p-3 sm:p-5';
  modalEl.innerHTML = `
    <div class="bg-white rounded-3xl border border-slate-200 max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
      <div class="px-5 py-3.5 bg-gradient-to-r from-[#062922] via-[#0a4538] to-[#0f6b58] text-white flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <span class="px-2 py-0.5 rounded-full bg-orange-400/25 text-orange-200 text-[11px] font-extrabold">板块二 · 玩法实验室</span>
          <h3 class="text-sm sm:text-base font-extrabold">自由配方沙盒 · 失败复盘 · 药厂风云录 · 每日一题</h3>
        </div>
        <button type="button" id="v23BtnClose" class="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold">×</button>
      </div>
      <div class="px-5 pt-3 pb-2 border-b border-slate-100 bg-[#f6f8f7] flex flex-wrap items-center justify-between gap-2">
        <div class="inline-flex flex-wrap p-1 rounded-xl bg-white border border-slate-200 text-xs font-extrabold gap-1">
          <button type="button" data-v23-tab="sandbox" class="px-3.5 py-1.5 rounded-lg transition">🧪 自由配方沙盒 &amp; 失败复盘</button>
          <button type="button" data-v23-tab="story" class="px-3.5 py-1.5 rounded-lg transition">🕵️ 药厂风云录 (3案)</button>
          <button type="button" data-v23-tab="daily" class="px-3.5 py-1.5 rounded-lg transition">📅 每日一题挑战</button>
        </div>
        <span class="text-[11px] text-slate-500 font-semibold">复用 119 项药材题库与真实药典规则</span>
      </div>
      <div id="v23Body" class="flex-1 overflow-y-auto p-4 sm:p-5"></div>
    </div>`;
  document.body.appendChild(modalEl);

  modalEl.querySelector('#v23BtnClose').addEventListener('click', closeModal);
  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) closeModal();
    const tBtn = e.target.closest('[data-v23-tab]');
    if (tBtn) {
      activeTab = tBtn.dataset.v23Tab;
      renderBody();
    }
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalEl && !modalEl.classList.contains('hidden')) closeModal();
  });
  return modalEl;
}

function closeModal() {
  if (modalEl) {
    modalEl.classList.add('hidden');
    modalEl.classList.remove('flex');
  }
}

function renderSandbox(body) {
  const topics = getTopics();
  if (!sandboxState.topicId && topics.length) {
    const cur = window.TCM_LAB_API?.getCurrentTopic?.();
    sandboxState.topicId = cur?.id || topics[0].id;
  }
  const topic = topics.find((x) => x.id === sandboxState.topicId) || topics[0] || {
    id: 'mint_oil', herb: '薄荷', compound: '薄荷脑', category: '挥发油与萜类', defaultCfg: { solventType: '纯化水', temp: 100 }
  };
  const res = sandboxState.result;

  body.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div class="lg:col-span-5 space-y-3 bg-[#f6f8f7] p-4 rounded-2xl border border-slate-200/80 text-xs">
        <div class="font-extrabold text-slate-900 text-sm">自由参数配置（任意组合实时判分）</div>
        <div>
          <label class="block text-slate-600 font-bold mb-1">1. 选择药材课题（全库 ${topics.length} 项）</label>
          <select id="v23TopicSel" class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800">
            ${topics.slice(0, 120).map((t) => `<option value="${esc(t.id)}" ${t.id === topic.id ? 'selected' : ''}>${esc(t.herb)} · ${esc(t.compound)} (${esc(t.category)})</option>`).join('')}
          </select>
        </div>
        <div class="grid grid-cols-2 gap-2.5">
          <div>
            <label class="block text-slate-600 font-bold mb-1">2. 溶剂体系</label>
            <select id="v23SolSel" class="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-white font-semibold">
              ${SOLVENT_OPTIONS.map((s) => `<option value="${esc(s.id)}" ${s.id === sandboxState.solvent ? 'selected' : ''}>${esc(s.id)} (极性 ${s.polarity})</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-slate-600 font-bold mb-1">3. 提取装置</label>
            <select id="v23RigSel" class="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-white font-semibold">
              ${RIG_OPTIONS.map((r) => `<option value="${esc(r.id)}" ${r.id === sandboxState.rig ? 'selected' : ''}>${esc(r.name)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <div>
            <label class="block text-slate-600 font-bold mb-1">温度: <span id="v23TempVal">${sandboxState.temp}</span>℃</label>
            <input id="v23Temp" type="range" min="25" max="120" step="5" value="${sandboxState.temp}" class="w-full accent-emerald-600" />
          </div>
          <div>
            <label class="block text-slate-600 font-bold mb-1">料液比: 1:<span id="v23RatioVal">${sandboxState.ratio}</span></label>
            <input id="v23Ratio" type="range" min="4" max="20" step="1" value="${sandboxState.ratio}" class="w-full accent-emerald-600" />
          </div>
          <div>
            <label class="block text-slate-600 font-bold mb-1">时间: <span id="v23TimeVal">${sandboxState.time}</span>m</label>
            <input id="v23Time" type="range" min="15" max="180" step="15" value="${sandboxState.time}" class="w-full accent-emerald-600" />
          </div>
        </div>
        <div class="flex flex-wrap gap-3 pt-1">
          <label class="inline-flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700"><input id="v23Boil" type="checkbox" ${sandboxState.boilStone ? 'checked' : ''} class="accent-emerald-600" /> 已加沸石防暴沸</label>
          <label class="inline-flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700"><input id="v23Seal" type="checkbox" ${sandboxState.sealed ? 'checked' : ''} class="accent-emerald-600" /> 气密性与冷凝水已检</label>
        </div>
        <div class="flex gap-2 pt-1">
          <button id="v23RunBtn" type="button" class="flex-1 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-extrabold transition shadow-sm">🚀 运行可行性与事故推演</button>
          <button id="v23ChaosBtn" type="button" class="px-3 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-800 font-bold transition" title="故意制造危险/错配组合体验失败分支">💥 试错演练</button>
        </div>
      </div>

      <div class="lg:col-span-7 space-y-3">
        ${res ? `
          <div class="grid grid-cols-3 gap-2.5 text-center">
            <div class="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200"><div class="text-[11px] text-slate-500">预计相对提取率</div><div class="text-2xl font-extrabold text-emerald-800 tabular-nums">${res.estYieldPct}%</div></div>
            <div class="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200"><div class="text-[11px] text-slate-500">绿色工艺评分</div><div class="text-2xl font-extrabold text-teal-800 tabular-nums">${res.greenScore}</div></div>
            <div class="p-3.5 rounded-2xl ${res.totalScore >= 85 ? 'bg-indigo-50/70 border-indigo-200' : 'bg-rose-50/70 border-rose-200'} border"><div class="text-[11px] text-slate-500">综合实验得分</div><div class="text-2xl font-extrabold ${res.totalScore >= 85 ? 'text-indigo-800' : 'text-rose-700'} tabular-nums">${res.totalScore}</div></div>
          </div>
          ${res.accidents.length === 0 ? `
            <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5 text-xs">
              <div class="font-extrabold text-emerald-900 text-sm">✅ 零事故完美方案！参数匹配合理且符合安全规范</div>
              <p class="text-emerald-800 leading-relaxed">溶剂「${esc(res.sol.id)}」与「${esc(topic.herb)} · ${esc(topic.compound)}」极性契合，装置与温控无冲突。安全提示：${esc(res.sol.hazard)}。</p>
            </div>
          ` : `
            <div class="space-y-2.5">
              <div class="text-xs font-extrabold text-rose-700 flex items-center gap-1.5">⚠️ 触发 ${res.accidents.length} 项失败分支 · 事故复盘卡</div>
              ${res.accidents.map((ac) => `
                <div class="p-3.5 rounded-2xl bg-rose-50/75 border border-rose-200 space-y-1.5 text-xs">
                  <div class="flex items-center justify-between gap-2">
                    <span class="font-extrabold text-rose-900">${esc(ac.title)}</span>
                    <span class="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">${esc(ac.level)}</span>
                  </div>
                  <div class="text-slate-700"><strong>现象：</strong>${esc(ac.phenomenon)}</div>
                  <div class="text-slate-700"><strong>原因：</strong>${esc(ac.cause)}</div>
                  <div class="text-emerald-900"><strong>补救：</strong>${esc(ac.remedy)}</div>
                  <div class="text-slate-600"><strong>预防：</strong>${esc(ac.prevent)}</div>
                </div>
              `).join('')}
            </div>
          `}
        ` : `
          <div class="h-full min-h-[260px] rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 flex flex-col items-center justify-center p-6 text-center space-y-2">
            <div class="text-3xl">🧪</div>
            <div class="text-sm font-extrabold text-slate-800">自由组合 119 味药材 × 7 种溶剂 × 5 套装置</div>
            <p class="text-xs text-slate-500 max-w-md">点击左侧「运行可行性与事故推演」即时估算提取率与绿色工艺分；也可点「💥 试错演练」体验极性错配、暴沸与热敏降解的真实事故复盘卡。</p>
          </div>
        `}
      </div>
    </div>`;

  body.querySelector('#v23TopicSel').addEventListener('change', (e) => { sandboxState.topicId = e.target.value; sandboxState.result = null; });
  body.querySelector('#v23SolSel').addEventListener('change', (e) => { sandboxState.solvent = e.target.value; });
  body.querySelector('#v23RigSel').addEventListener('change', (e) => { sandboxState.rig = e.target.value; });
  body.querySelector('#v23Temp').addEventListener('input', (e) => { sandboxState.temp = Number(e.target.value); body.querySelector('#v23TempVal').textContent = sandboxState.temp; });
  body.querySelector('#v23Ratio').addEventListener('input', (e) => { sandboxState.ratio = Number(e.target.value); body.querySelector('#v23RatioVal').textContent = sandboxState.ratio; });
  body.querySelector('#v23Time').addEventListener('input', (e) => { sandboxState.time = Number(e.target.value); body.querySelector('#v23TimeVal').textContent = sandboxState.time; });
  body.querySelector('#v23Boil').addEventListener('change', (e) => { sandboxState.boilStone = e.target.checked; });
  body.querySelector('#v23Seal').addEventListener('change', (e) => { sandboxState.sealed = e.target.checked; });

  body.querySelector('#v23RunBtn').addEventListener('click', () => {
    const curTopic = topics.find((x) => x.id === sandboxState.topicId) || topic;
    sandboxState.result = evaluateSandbox(curTopic);
    dispatchAchievement({
      type: 'sandbox_run',
      herb: curTopic.herb,
      score: sandboxState.result.totalScore,
      greenScore: sandboxState.result.greenScore,
      zeroAccident: sandboxState.result.accidents.length === 0
    });
    renderSandbox(body);
  });

  body.querySelector('#v23ChaosBtn').addEventListener('click', () => {
    sandboxState.solvent = '石油醚(低极性)';
    sandboxState.temp = 105;
    sandboxState.boilStone = false;
    sandboxState.sealed = false;
    const curTopic = topics.find((x) => x.id === sandboxState.topicId) || topic;
    sandboxState.result = evaluateSandbox(curTopic);
    dispatchAchievement({ type: 'sandbox_run', herb: curTopic.herb, score: sandboxState.result.totalScore, zeroAccident: false });
    renderSandbox(body);
  });
}

function renderStory(body) {
  const c = STORY_CASES[activeStoryIdx];
  const ans = storyAnswered[c.id];
  body.innerHTML = `
    <div class="space-y-4">
      <div class="flex flex-wrap gap-2">
        ${STORY_CASES.map((sc, i) => `
          <button type="button" data-v23-story="${i}" class="px-3.5 py-2 rounded-xl text-xs font-extrabold border transition ${i === activeStoryIdx ? 'bg-[#064e3b] text-white border-[#064e3b]' : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400'}">
            ${esc(sc.title)} ${storyAnswered[sc.id]?.correct ? '✅' : ''}
          </button>`).join('')}
      </div>
      <div class="p-5 rounded-2xl bg-[#f6f8f7] border border-slate-200 space-y-3 text-xs">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h4 class="text-base font-extrabold text-slate-900">${esc(c.title)}</h4>
          <span class="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold">${esc(c.tag)}</span>
        </div>
        <p class="text-slate-700 leading-relaxed text-sm">${esc(c.scene)}</p>
        <div class="p-3.5 rounded-xl bg-white border border-slate-200/90 space-y-1.5">
          <div class="font-extrabold text-[#064e3b]">🔍 现场勘察线索：</div>
          <ul class="list-disc pl-4 space-y-1 text-slate-700">${c.clues.map((cl) => `<li>${esc(cl)}</li>`).join('')}</ul>
        </div>
        <div class="font-extrabold text-slate-900 pt-1">${esc(c.question)}</div>
        <div class="space-y-2">
          ${c.options.map((op) => {
            const picked = ans && ans.choice === op.id;
            const cls = !ans
              ? 'bg-white border-slate-200 hover:border-emerald-500 text-slate-800'
              : op.correct
                ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                : picked
                  ? 'bg-rose-50 border-rose-400 text-rose-900'
                  : 'bg-white border-slate-200 text-slate-400';
            return `<button type="button" data-v23-ans="${op.id}" class="w-full text-left p-3 rounded-xl border transition ${cls}">${op.id.toUpperCase()}. ${esc(op.text)}</button>`;
          }).join('')}
        </div>
        ${ans ? `
          <div class="p-3.5 rounded-xl ${ans.correct ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-amber-50 border-amber-200 text-amber-950'} border space-y-1">
            <div class="font-extrabold">${ans.correct ? '🎉 破案成功！+40 XP 已记入段位成长' : '💡 偏差判断有误，请参考正确根因与 CAPA 方案：'}</div>
            <p class="leading-relaxed">${esc(c.capa)}</p>
          </div>
        ` : ''}
      </div>
    </div>`;

  body.querySelectorAll('[data-v23-story]').forEach((b) => b.addEventListener('click', () => {
    activeStoryIdx = Number(b.dataset.v23Story);
    renderStory(body);
  }));
  body.querySelectorAll('[data-v23-ans]').forEach((b) => b.addEventListener('click', () => {
    const picked = b.dataset.v23Ans;
    const opt = c.options.find((o) => o.id === picked);
    storyAnswered[c.id] = { choice: picked, correct: Boolean(opt?.correct) };
    if (opt?.correct) dispatchAchievement({ type: 'story_solved', caseId: c.id });
    renderStory(body);
  }));
}

function renderDaily(body) {
  const topics = getTopics();
  const today = new Date().toISOString().slice(0, 10);
  const seed = today.split('-').reduce((acc, n) => acc * 31 + Number(n), 7);
  const topic = topics.length ? topics[seed % topics.length] : { herb: '丹参', compound: '丹参酮IIA', category: '蒽醌与醌类', defaultCfg: { solventType: '90%乙醇', temp: 75 } };
  const pert = DAILY_PERTURBATIONS[seed % DAILY_PERTURBATIONS.length];

  body.innerHTML = `
    <div class="p-5 rounded-2xl bg-[#f6f8f7] border border-slate-200 space-y-3.5 text-xs">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">📅 今日随机挑战 · ${today}</span>
          <h4 class="text-base font-extrabold text-slate-900 mt-1.5">今日药材：${esc(topic.herb)}（${esc(topic.compound)} · ${esc(topic.category)}）</h4>
        </div>
        <span class="px-2.5 py-1 rounded-xl bg-white border border-slate-200 font-bold text-slate-600">默认推荐：${esc(topic.defaultCfg?.solventType || '70%乙醇')} / ${esc(topic.defaultCfg?.temp || 75)}℃</span>
      </div>
      <div class="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1">
        <div class="font-extrabold text-amber-950">⚡ 突发工艺扰动：${esc(pert.title)}</div>
        <p class="text-amber-900 leading-relaxed">${esc(pert.desc)}</p>
      </div>
      <div class="space-y-2">
        ${pert.choices.map((ch, idx) => {
          const cls = dailyAnswered === null
            ? 'bg-white border-slate-200 hover:border-emerald-500 text-slate-800'
            : ch.ok
              ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
              : dailyAnswered === idx
                ? 'bg-rose-50 border-rose-400 text-rose-900'
                : 'bg-white border-slate-200 text-slate-400';
          return `<button type="button" data-v23-daily="${idx}" class="w-full text-left p-3 rounded-xl border transition ${cls}">${String.fromCharCode(65 + idx)}. ${esc(ch.text)}</button>`;
        }).join('')}
      </div>
      ${dailyAnswered !== null ? `
        <div class="p-3.5 rounded-xl ${pert.choices[dailyAnswered]?.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'} border font-bold">
          ${pert.choices[dailyAnswered]?.ok ? '✅ 每日挑战完成！+25 XP 已自动计入个人段位与打卡徽章。' : '❌ 思路偏差：请注意遵守溶剂极性匹配与实验安全红线。'}
        </div>
      ` : ''}
    </div>`;

  body.querySelectorAll('[data-v23-daily]').forEach((b) => b.addEventListener('click', () => {
    dailyAnswered = Number(b.dataset.v23Daily);
    if (pert.choices[dailyAnswered]?.ok) dispatchAchievement({ type: 'daily_pass', date: today, herb: topic.herb });
    renderDaily(body);
  }));
}

function renderBody() {
  ensureModal();
  modalEl.querySelectorAll('[data-v23-tab]').forEach((b) => {
    const on = b.dataset.v23Tab === activeTab;
    b.className = `px-3.5 py-1.5 rounded-lg transition ${on ? 'bg-[#064e3b] text-white' : 'text-slate-600 hover:text-slate-900'}`;
  });
  const body = modalEl.querySelector('#v23Body');
  if (activeTab === 'sandbox') renderSandbox(body);
  else if (activeTab === 'story') renderStory(body);
  else renderDaily(body);
}

export function openGameplayModal(tab = 'sandbox') {
  activeTab = tab;
  ensureModal();
  modalEl.classList.remove('hidden');
  modalEl.classList.add('flex');
  renderBody();
}

export const TCM_V23_GAMEPLAY = Object.freeze({
  version: '1.0.0',
  open: openGameplayModal,
  close: closeModal
});

if (typeof window !== 'undefined') {
  window.TCM_V23_GAMEPLAY = TCM_V23_GAMEPLAY;
}

export default TCM_V23_GAMEPLAY;
