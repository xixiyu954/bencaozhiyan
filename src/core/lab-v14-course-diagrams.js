// =========================================================================
// 本草智研 · 课程经典化学机理图文卡片、试管显色互动与规范实验册增强 (lab-v14-course-diagrams.js)
// 基于真实高校中药化学实验报告册与课程讲义构建：
// 1. 新增 2 项课程原版完整课题（细辛挥发油单向二次展开 / 槐米芦丁提取精制与酸水解制槲皮素）
// 2. Step 3 动态化学反应机理图文卡（芦丁碱提酸沉与水解 / 苦参732阳离子树脂交换 / 小檗碱三构型互变 / 挥发油单向二次展开）
// 3. 互动式「试管滴加显色模拟实验台」（HCl-Mg粉、Molish紫环、碱性KMnO4、FeCl3、2,4-DNPH、碘化铋钾）
// 4. Step 6 实验报告册增强条（日期/天气/室温/湿度抬头 + 教师评语签字栏自动同步至 A4 报告）
// =========================================================================
(function () {
  'use strict';

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }

  // ==================== 1. 新增 2 项真实课程原版完整课题 ====================
  const V14_COURSE_PRESETS = {
    v14_xixin_oil: {
      id: 'v14_xixin_oil', isInnovative: false, featured: true, sourceTag: '课程原版 · 单向二次展开',
      herb: '细辛（挥发油提取与定性鉴别）', compound: '细辛挥发油（甲基丁香酚/黄樟醚）', latin: 'Asarum heterotropoides / A. sieboldii',
      category: '挥发油与萜类', defaultRig: 'steam', applicableRigs: ['steam', 'tlc', 'liquid_extract'],
      defaultExtract: 'steam', defaultSep: 'extract', formulas: ['dalton', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 100, time: 120, mesh: '切段(1~2cm)', cycles: '1', solventType: '纯化水', ph: '中性 7.0' },
      limitVal: 2.0, limitUnit: '%', crudeUnit: 'mL', mpRef: '淡黄色芳香挥发油（折光率参考 1.52~1.54）',
      origin: '马兜铃科植物北细辛、汉城细辛或华细辛干燥根和根茎（性温味辛，祛风散寒、通窍止痛，挥发油含量 ≥ 2.0%）。',
      chemistry: '细辛挥发油为含双键、酚羟基、羰基等多种官能团的混合物，各组分极性差异大，适合采用硅胶 G 板「单向二次展开」并用香草醛-浓硫酸显色。',
      pharmacopoeia: '药典要求挥发油不得少于 2.0% (mL/g)，并严格控制马兜铃酸 I 限量（≤ 0.001%）。',
      integrative: '教学核心思考题：单向二次展开中若将展开剂①（石油醚-乙酸乙酯 8.5:1.5，展 7 cm）与展开剂②（纯石油醚，展 10 cm）顺序颠倒，会导致什么色谱结果？',
      scaling: { auxName: '无水Na2SO4/香草醛显色剂', auxFactor: 0.4, auxUnit: 'g/g', yieldLow: 0.020, yieldHigh: 0.032, yieldUnit: 'mL' },
      tlcSystem: '硅胶 G 板单向二次展开：① 石油醚(30-60℃)-乙酸乙酯 (8.5:1.5) 展 7 cm 晾干 → ② 石油醚展至 10 cm，喷香草醛-浓硫酸加热显色。',
      tlcDefault: { front: 10.0, sample: 6.2, ref: 6.2 },
      steps: [
        { stage: '提取', title: '细辛 50 g 剪碎水蒸气蒸馏提取 2 h', principle: '利用挥发油与水不互溶共沸特性，随水蒸气蒸出并分层收集。', operation: '50 g 细辛剪碎入圆底烧瓶加水，装挥发油测定器与冷凝管，微沸提取 2 h 读数收油。', qc: '先通冷凝水再加热，收集完毕先放气防倒吸。' },
        { stage: '分离', title: '分取挥发油并以乙醇配制检识试液', principle: '挥发油难溶于水、易溶于乙醇，配成均一醇液便于平行试管显色。', operation: '无水 Na2SO4 脱水得澄清细辛油，取适量溶于乙醇配制供试液。', qc: '油层澄清无水珠。' },
        { stage: '纯化', title: '硅胶 G 板单向二次展开分离极性差异组分', principle: '先用中等极性展 7 cm 分开极性组分，再用纯石油醚展至 10 cm 进一步拉开低极性萜类斑点。', operation: '点样后依次经展开剂①（7 cm）晾干、展开剂②（10 cm）展开，香草醛-浓硫酸显色。', qc: '展开剂顺序切勿颠倒。' },
        { stage: '检识', title: '三大官能团平行试管显色鉴别', principle: '碱性 KMnO4 检双键（紫红褪色）、FeCl3 检酚羟基（蓝绿显色）、2,4-二硝基苯肼检羰基（橙红沉淀）。', operation: '分别取 1 mL 挥发油乙醇液滴加三种检识试液，记录现象并绘制 TLC 图谱。', qc: '对照空白乙醇组排除干扰。' }
      ],
      troubleshoot: [
        { issue: '单向二次展开斑点挤在溶剂前沿分不开', cause: '展开剂①与②顺序加反（先用纯石油醚再用高极性乙酸乙酯体系）。', fix: '务必先用含乙酸乙酯体系展至 7 cm 晾干，再用低极性纯石油醚展至 10 cm。' }
      ],
      sop: ['50 g 细辛剪碎加水装挥发油测定器', '微沸水蒸气蒸馏 2 h 并记录挥发油体积', '取挥发油配乙醇液开展三项试管显色反应', '硅胶 G 板执行单向二次展开与香草醛显色', '记录 Rf 值、绘制色谱图并解答思考题'],
      chemTests: [{ name: '碱性 KMnO4 褪色（不饱和双键）', passed: true }, { name: 'FeCl3 显色（酚羟基）', passed: true }, { name: '2,4-二硝基苯肼沉淀（羰基）', passed: true }],
      demoBatches: [{ mass: 50, crude: 1.15, refined: 1.08, mp: 0 }, { mass: 50, crude: 1.22, refined: 1.14, mp: 0 }, { mass: 50, crude: 1.18, refined: 1.10, mp: 0 }]
    },
    v14_huaimi_rutin_hydro: {
      id: 'v14_huaimi_rutin_hydro', isInnovative: false, featured: true, sourceTag: '课程原版 · 碱提酸沉+水解',
      herb: '槐米（芦丁提取、精制与酸水解制槲皮素）', compound: '芦丁 → 槲皮素 + 葡萄糖 + 鼠李糖', latin: 'Sophora japonica L.',
      category: '黄酮', defaultRig: 'vacuum_filter', applicableRigs: ['reflux', 'vacuum_filter', 'crystallize', 'tlc', 'hplc'],
      defaultExtract: 'reflux', defaultSep: 'precip', formulas: ['henderson', 'qc'],
      defaultCfg: { mass: 30, ratio: 10, temp: 100, time: 30, mesh: '粗粉(10~20目)', cycles: '1', solventType: '弱碱硼砂水', ph: '碱提 pH 8~9 / 酸沉 pH 4~5' },
      limitVal: 20.0, limitUnit: '%', crudeUnit: 'g', mpRef: '芦丁熔点 177~178℃ / 槲皮素 313~314℃',
      origin: '豆科植物槐干燥花蕾（高校《中药化学》第一经典实验：覆盖碱提酸沉、热水重结晶、1% H2SO4 酸水解与黄酮/糖类鉴定全链路）。',
      chemistry: '芦丁为槲皮素 3-O-芸香糖苷，冷水溶解度仅 1:10000、热水 1:200；酚羟基遇石灰乳（pH 8~9）成酚盐溶于水，加浓 HCl 调 pH 4~5 游离析出；注意 pH 过低会形成𨦡盐重溶降收率！',
      pharmacopoeia: '药典规定槐米含总黄酮（以芦丁计）不得少于 20.0%，芦丁不得少于 15.0%。',
      integrative: '全链路实训价值：1 个药材串联「碱提酸沉 → 热水重结晶/HPLC 精制 → 1% H2SO4 酸水解得槲皮素与双糖 → HCl-Mg 粉 + Molish 反应 + 聚酰胺/纸色谱鉴定」。',
      scaling: { auxName: '石灰粉(CaO)/浓HCl/1%硫酸', auxFactor: 0.35, auxUnit: 'g/g', yieldLow: 0.14, yieldHigh: 0.21, yieldUnit: 'g' },
      tlcSystem: '聚酰胺薄膜（75% 乙醇）鉴芦丁/槲皮素；纸色谱（BAW 正丁醇-冰醋酸-水 4:1:5）鉴水解糖液（葡萄糖/鼠李糖对照）。',
      tlcDefault: { front: 8.0, sample: 4.6, ref: 4.6 },
      steps: [
        { stage: '提取', title: '30 g 槐米粗粉石灰乳调 pH 8~9 微沸碱提 30 min', principle: '石灰乳既使芦丁酚羟基成盐溶出，又可沉淀除去槐米中大量多糖黏液质。', operation: '30 g 槐米粗粉加水 300 mL，搅拌下加石灰乳（10 g CaO 研匀）维持 pH 8~9 微沸 30 min，趁热抽滤。', qc: 'pH 不可过高（防钙离子螯合沉淀及母核破坏）。' },
        { stage: '分离', title: '冷至 60~70℃ 加浓 HCl 调 pH 4~5 酸沉抽滤', principle: '酸化使酚盐转回难溶游离芦丁析出；先拔橡皮管再关真空泵防倒吸。', operation: '滤液冷至 60~70℃，滴加浓 HCl 调 pH 4~5，静置 1 h 抽滤得粗制芦丁。', qc: 'pH 严控 4~5，防过酸生成𨦡盐重溶。' },
        { stage: '纯化', title: '热水重结晶精制（1:200）及 1% H2SO4 酸水解制槲皮素', principle: '利用芦丁冷热水溶解度巨差精制；取 0.4 g 精制芦丁加 100 mL 1% 硫酸回流 1 h 水解得 ~0.2 g 槲皮素沉淀，滤液以 BaCO3 中和得糖液。', operation: '0.8 g 粗芦丁加 200 mL 水煮沸 10 min 趁热抽滤，静置 30 min 析晶；留 1/3 精制品备用，其余执行酸水解。', qc: 'BaCO3 中和至 pH 7 滤去 BaSO4 沉淀。' },
        { stage: '检识', title: 'HCl-Mg 粉、Molish 紫环与聚酰胺/纸色谱双检', principle: 'HCl-Mg 粉还原黄酮呈红至深红色；Molish 反应（α-萘酚+浓硫酸）在界面呈紫环检识糖/苷。', operation: '分别对芦丁、槲皮素与水解糖液做试管显色及聚酰胺薄膜/BAW 纸色谱对照。', qc: '槲皮素无糖基，Molish 反应呈阴性。' }
      ],
      troubleshoot: [
        { issue: '碱提趁热抽滤极慢或酸沉后几乎无沉淀', cause: '槐米粉碎过细导致黏液堵滤纸，或加酸过量 pH < 2 使芦丁成𨦡盐重新溶解。', fix: '仅压成粗粉即可；酸化时边测 pH 试纸边慢滴浓 HCl，精准停在 pH 4~5。' }
      ],
      sop: ['30 g 槐米粗粉加 300 mL 水与石灰乳控 pH 8~9 微沸 30 min', '趁热抽滤（注意滤纸直径小于漏斗底边缘，停泵前先拔管）', '冷至 60~70℃ 调 pH 4~5 静置 1 h 抽滤得粗芦丁', '热水重结晶精制并取 0.4 g 行 1% H2SO4 回流酸水解', '完成 HCl-Mg 粉、Molish 反应及聚酰胺/纸色谱鉴定'],
      chemTests: [{ name: 'HCl-Mg 粉还原呈深红色（黄酮）', passed: true }, { name: 'Molish 紫环反应（芦丁+/槲皮素-）', passed: true }, { name: '聚酰胺与 BAW 纸色谱对照', passed: true }],
      demoBatches: [{ mass: 30, crude: 5.4, refined: 4.2, mp: 177.5 }, { mass: 30, crude: 5.7, refined: 4.5, mp: 178.1 }, { mass: 30, crude: 5.5, refined: 4.3, mp: 177.8 }]
    }
  };

  // ==================== 2. 互动试管滴加显色数据 ====================
  const TUBE_TESTS = [
    { id: 'hcl_mg', name: 'HCl-Mg 粉反应', target: '黄酮类（芦丁/槲皮素）', before: '#fef08a', after: '#dc2626', result: '剧烈冒气泡，溶液由浅黄迅速转为樱红至深红色（生成花青素类盐）' },
    { id: 'molish', name: 'Molish 紫环反应', target: '糖与苷类（芦丁/多糖）', before: '#f8fafc', after: '#7e22ce', result: '沿管壁缓加浓硫酸后，两液界面处出现清晰紫红色环（苷元槲皮素无此环）' },
    { id: 'kmno4', name: '碱性 KMnO₄ 试验', target: '挥发油不饱和双键（细辛/薄荷）', before: '#9333ea', after: '#a16207', result: '紫红色高锰酸钾迅速褪色并析出棕褐色 MnO₂ 沉淀，证实含不饱和双键' },
    { id: 'fecl3', name: 'FeCl₃ 显色反应', target: '酚羟基（丁香酚/绿原酸/黄酮）', before: '#fde047', after: '#0f766e', result: '溶液瞬间由淡黄转为深蓝绿色或墨绿色络合物，证实分子含游离酚羟基' },
    { id: 'dnph', name: '2,4-二硝基苯肼', target: '挥发油羰基（醛/酮类）', before: '#fef3c7', after: '#ea580c', result: '生成鲜明橙红色腙类结晶沉淀，证实挥发油中含有醛基或酮羰基' },
    { id: 'dragendorff', name: '改良碘化铋钾', target: '生物碱（苦参碱/小檗碱）', before: '#fef9c3', after: '#c2410c', result: '立即产生致密橘红色无定形沉淀，可用于渗漉与阳离子树脂交换终点判定' }
  ];

  let uiState = {
    berberineForm: 'quat', // 'quat' | 'alc' | 'ald'
    activeTube: 'hcl_mg',
    tubeDropped: false,
    reportMeta: {
      date: new Date().toISOString().slice(0, 10),
      weather: '晴',
      roomTemp: '22',
      humidity: '45'
    }
  };

  // ==================== 3. Step 3 动态化学机理图文卡 & 试管显色互动 ====================
  function renderStep3MechanismAndTube(topic) {
    const panel = document.getElementById('wpanel-3');
    if (!panel) return;
    let mount = document.getElementById('v14CourseMechanismMount');
    if (!mount) {
      mount = document.createElement('div');
      mount.id = 'v14CourseMechanismMount';
      mount.className = 'space-y-5';
      panel.appendChild(mount);
    }

    const herbStr = `${topic ? topic.herb : ''} ${topic ? topic.compound : ''} ${topic ? topic.category : ''}`;
    let mode = 'rutin';
    if (/苦参|氧化苦参/.test(herbStr)) mode = 'kushen';
    else if (/黄连|黄柏|小檗碱/.test(herbStr)) mode = 'berberine';
    else if (/细辛|薄荷|挥发油|当归/.test(herbStr)) mode = 'volatile';

    const tube = TUBE_TESTS.find(x => x.id === uiState.activeTube) || TUBE_TESTS[0];
    const tubeFill = uiState.tubeDropped ? tube.after : tube.before;

    let mechSvgHtml = '';
    if (mode === 'kushen') {
      mechSvgHtml = `
        <div class="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-3 v9-chart-surface">
          <div class="text-sm font-extrabold text-[#0f5c54]">苦参总生物碱 · 732 阳离子交换树脂三步反应机理与结晶分离路径</div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
            <div class="p-3 rounded-xl bg-white border border-teal-200 space-y-1">
              <div class="font-extrabold text-[#0a3630]">① 0.3% 硫酸渗漉成盐</div>
              <div class="font-mono font-extrabold text-emerald-700 text-sm">B + H⁺ → BH⁺</div>
              <div class="text-slate-600">游离生物碱在酸水中质子化为水溶性盐，4~5 mL/min 连续渗漉得 400 mL。</div>
            </div>
            <div class="p-3 rounded-xl bg-white border border-amber-200 space-y-1">
              <div class="font-extrabold text-amber-900">② 732 树脂阳离子交换</div>
              <div class="font-mono font-extrabold text-amber-700 text-sm">BH⁺ + RSO₃⁻H⁺ → RSO₃⁻BH⁺ + H⁺</div>
              <div class="text-slate-600">3~5 mL/min 上柱，以碘化铋钾/硅钨酸检流出液呈阳性即停柱。</div>
            </div>
            <div class="p-3 rounded-xl bg-white border border-indigo-200 space-y-1">
              <div class="font-extrabold text-indigo-900">③ 氨水闷润游离 + 索氏提</div>
              <div class="font-mono font-extrabold text-indigo-700 text-sm">RSO₃⁻BH⁺ + NH₄OH → B↓ + H₂O</div>
              <div class="text-slate-600">氨水闷润 15 min 晾干后索氏乙醇回流 2 h；氯仿溶 + 10 倍乙醚析出氧化苦参碱。</div>
            </div>
          </div>
        </div>`;
    } else if (mode === 'berberine') {
      const bf = uiState.berberineForm;
      const bMap = {
        quat: { name: '季铵碱式 (a · 最稳定)', sol: '离子化强，亲水性强，易溶于水、难溶于有机溶剂，多以此形式存在。', badge: 'bg-emerald-100 text-emerald-900' },
        alc: { name: '醇式 (b · 游离碱)', sol: '具有一般游离生物碱性质，难溶于水、易溶于乙醚/氯仿等有机溶剂。', badge: 'bg-amber-100 text-amber-900' },
        ald: { name: '醛式 (c · 开环互变)', sol: '在游离小檗碱中含量较少；遇酸时迅速由醇式与醛式重新转为季铵碱式！', badge: 'bg-indigo-100 text-indigo-900' }
      };
      const curB = bMap[bf];
      mechSvgHtml = `
        <div class="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-3 v9-chart-surface">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="text-sm font-extrabold text-[#0f5c54]">小檗碱（黄连素）三种存在形式互变机理（点击切换构型）</div>
            <div class="flex gap-1.5">
              ${[['quat', '(a) 季铵碱式'], ['alc', '(b) 醇式'], ['ald', '(c) 醛式']].map(([k, l]) => `
                <button type="button" data-berb-form="${k}" class="px-2.5 py-1 rounded-xl text-xs font-extrabold border transition ${bf === k ? 'bg-[#0a3630] text-white border-[#0a3630]' : 'bg-white text-slate-700 border-slate-200'}">${l}</button>
              `).join('')}
            </div>
          </div>
          <div class="p-3.5 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div class="space-y-1">
              <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold ${curB.badge}">${curB.name}</span>
              <p class="text-xs text-slate-700 leading-relaxed pt-1">${curB.sol}</p>
            </div>
            <div class="text-xs font-mono font-bold text-[#0f5c54] bg-teal-50 px-3 py-2 rounded-xl border border-teal-200">季铵碱式 (N⁺OH⁻) ⇌ 醇式 (C-OH) ⇌ 醛式 (NH-CHO)</div>
          </div>
        </div>`;
    } else if (mode === 'volatile') {
      mechSvgHtml = `
        <div class="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-3 v9-chart-surface">
          <div class="text-sm font-extrabold text-[#0f5c54]">挥发油「单向二次展开」薄层色谱机理与 12 部件水蒸气蒸馏要点</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div class="p-3 rounded-xl bg-white border border-teal-200 space-y-1">
              <div class="font-extrabold text-[#0a3630]">单向二次展开流程（切忌颠倒顺序）</div>
              <div class="text-slate-700 leading-relaxed">① 先用 <strong>石油醚-乙酸乙酯 (8.5:1.5)</strong> 展距 <strong>7 cm</strong> 晾干，拉开极性含氧衍生物；<br/>② 再用 <strong>纯石油醚</strong> 展至 <strong>10 cm</strong>，进一步分离低极性单萜/倍半萜；香草醛-浓硫酸显色。</div>
            </div>
            <div class="p-3 rounded-xl bg-white border border-amber-200 space-y-1">
              <div class="font-extrabold text-amber-900">水蒸气蒸馏防倒吸黄金法则</div>
              <div class="text-slate-700 leading-relaxed">实验前「三通管夹不关」；水蒸气产生后通冷凝水再关三通管夹；<strong>结束时务必先打开三通管夹放气（防倒吸），再停火、最后停冷凝水！</strong></div>
            </div>
          </div>
        </div>`;
    } else {
      mechSvgHtml = `
        <div class="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-3 v9-chart-surface">
          <div class="text-sm font-extrabold text-[#0f5c54]">黄酮苷（芦丁）碱提酸沉与酸水解反应机理及溶解度核心数据</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div class="p-3 rounded-xl bg-white border border-teal-200 space-y-1.5">
              <div class="font-extrabold text-[#0a3630]">① 碱提酸沉可逆平衡（防过酸成𨦡盐！）</div>
              <div class="font-mono font-extrabold text-emerald-700">芦丁 (难溶) + OH⁻(pH 8~9) ⇌ 酚钠盐 (水溶) + H⁺(pH 4~5) ⇌ 粗芦丁↓</div>
              <div class="text-slate-600">溶解度基准：冷水 <strong>1:10000</strong>｜热水 <strong>1:200</strong>｜冷乙醇 1:650｜热乙醇 1:60。</div>
            </div>
            <div class="p-3 rounded-xl bg-white border border-amber-200 space-y-1.5">
              <div class="font-extrabold text-amber-900">② 1% H₂SO₄ 酸水解制槲皮素反应式</div>
              <div class="font-mono font-extrabold text-amber-700">精制芦丁 (0.4g) + H⁺/H₂O (回流1h) → 槲皮素↓(~0.2g) + 葡萄糖 + 鼠李糖</div>
              <div class="text-slate-600">水解滤液加 <strong>BaCO₃</strong> 中和至中性除硫酸根得糖液，供 BAW 纸色谱鉴定。</div>
            </div>
          </div>
        </div>`;
    }

    mount.innerHTML = `
      <section class="lab-card v9-visual-card rounded-3xl p-5 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2.5">
            <span class="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#062420] to-emerald-600 text-amber-300 flex items-center justify-center text-base">🧬</span>
            <div>
              <h3 class="text-base font-extrabold text-slate-900">课程经典化学反应机理图解与互动试管显色台</h3>
              <p class="text-xs text-slate-500">同步高校实验讲义核心化学方程式、关键溶解度与亲手滴加显色反应动画</p>
            </div>
          </div>
        </div>

        ${mechSvgHtml}

        <!-- 互动试管滴加显色模拟台 -->
        <div class="rounded-2xl bg-gradient-to-br from-[#071f1c] to-[#0e3630] border border-emerald-400/25 p-4 text-white grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div class="md:col-span-7 space-y-2.5">
            <div class="text-sm font-extrabold text-emerald-200">🧪 互动试管显色模拟（选择检识试剂并点击滴加）</div>
            <div class="flex flex-wrap gap-1.5">
              ${TUBE_TESTS.map(tb => `
                <button type="button" data-tube-pick="${tb.id}" class="px-2.5 py-1 rounded-xl text-xs font-bold border transition ${tb.id === tube.id ? 'bg-amber-400 text-[#062420] border-amber-300' : 'bg-white/10 text-teal-100 border-white/15 hover:bg-white/20'}">${esc(tb.name)}</button>
              `).join('')}
            </div>
            <div class="text-xs text-teal-100/90">适用成分：<strong>${esc(tube.target)}</strong></div>
            <div class="p-3 rounded-xl bg-white/10 border border-white/15 text-xs leading-relaxed">
              ${uiState.tubeDropped ? `✨ <strong>显色现象：</strong>${esc(tube.result)}` : '点击右侧「💧 滴加检识试液」按钮，观察试管内溶液颜色变化与沉淀生成！'}
            </div>
          </div>

          <div class="md:col-span-5 flex flex-col items-center gap-2.5">
            <svg viewBox="0 0 140 138" class="w-[132px] h-[132px] select-none">
              <!-- 滴管与动态液滴 -->
              <rect x="65" y="4" width="10" height="22" rx="4" fill="#cbd5e1" />
              <polygon points="67,26 73,26 71,38 69,38" fill="#e2e8f0" />
              ${uiState.tubeDropped ? `<circle cx="70" cy="48" r="3.5" fill="#fde047" class="anim-drop" />` : ''}
              <!-- 玻璃试管 -->
              <defs><clipPath id="v14TubeClip"><rect x="48" y="44" width="44" height="86" rx="22" /></clipPath></defs>
              <g clip-path="url(#v14TubeClip)">
                <rect x="48" y="72" width="44" height="58" fill="${tubeFill}" style="transition: fill 0.65s ease;" />
                ${uiState.tubeDropped ? `
                  <circle cx="62" cy="108" r="3" fill="#ffffff" fill-opacity="0.7" class="anim-bubble-1" />
                  <circle cx="78" cy="112" r="2.5" fill="#ffffff" fill-opacity="0.7" class="anim-bubble-2" />
                ` : ''}
              </g>
              <rect x="48" y="44" width="44" height="86" rx="22" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="2.2" />
              <line x1="42" y1="44" x2="98" y2="44" stroke="rgba(255,255,255,0.85)" stroke-width="3" stroke-linecap="round" />
            </svg>
            <div class="flex gap-2">
              <button type="button" id="v14BtnDropReagent" class="px-3.5 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-[#062420] text-xs font-extrabold transition shadow-sm">${uiState.tubeDropped ? '↺ 清洗试管重测' : '💧 滴加检识试液'}</button>
            </div>
          </div>
        </div>
      </section>
    `;

    mount.querySelectorAll('[data-berb-form]').forEach(b => b.addEventListener('click', () => {
      uiState.berberineForm = b.dataset.berbForm;
      renderStep3MechanismAndTube(topic);
    }));
    mount.querySelectorAll('[data-tube-pick]').forEach(b => b.addEventListener('click', () => {
      uiState.activeTube = b.dataset.tubePick;
      uiState.tubeDropped = false;
      renderStep3MechanismAndTube(topic);
    }));
    const dropBtn = mount.querySelector('#v14BtnDropReagent');
    if (dropBtn) dropBtn.addEventListener('click', () => {
      uiState.tubeDropped = !uiState.tubeDropped;
      renderStep3MechanismAndTube(topic);
    });
  }

  // ==================== 4. Step 6 规范手写实验报告册抬头（日期/天气/温湿度 + 教师签字栏） ====================
  function enhanceStep6ReportBook() {
    const p6 = document.getElementById('wpanel-6');
    const paper = document.getElementById('printableReportMount');
    if (!p6 || !paper) return;

    let ctrl = document.getElementById('v14ReportBookMetaBar');
    if (!ctrl) {
      ctrl = document.createElement('section');
      ctrl.id = 'v14ReportBookMetaBar';
      ctrl.className = 'no-print lab-card v9-visual-card rounded-3xl p-4 sm:p-5 space-y-3';
      ctrl.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 class="text-sm sm:text-base font-extrabold text-slate-900">📓 高校规范实验报告册抬头与签字栏设置</h3>
            <p class="text-xs text-slate-500">填写当天实验环境参数，自动同步至下方 A4 报告顶部（日期 / 天气 / 温度 / 湿度）及底部教师评语签字区</p>
          </div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div><label class="block font-bold text-slate-700 mb-1">实验日期</label><input id="rbDate" type="date" value="${uiState.reportMeta.date}" class="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white" /></div>
          <div><label class="block font-bold text-slate-700 mb-1">当日天气</label><select id="rbWeather" class="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white"><option ${uiState.reportMeta.weather === '晴' ? 'selected' : ''}>晴</option><option ${uiState.reportMeta.weather === '多云' ? 'selected' : ''}>多云</option><option ${uiState.reportMeta.weather === '阴' ? 'selected' : ''}>阴</option><option ${uiState.reportMeta.weather === '小雨' ? 'selected' : ''}>小雨</option></select></div>
          <div><label class="block font-bold text-slate-700 mb-1">室温 (℃)</label><input id="rbTemp" type="number" value="${uiState.reportMeta.roomTemp}" class="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white tabular-nums" /></div>
          <div><label class="block font-bold text-slate-700 mb-1">相对湿度 (%)</label><input id="rbHum" type="number" value="${uiState.reportMeta.humidity}" class="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white tabular-nums" /></div>
        </div>
      `;
      p6.insertAdjacentElement('afterbegin', ctrl);

      ['rbDate', 'rbWeather', 'rbTemp', 'rbHum'].forEach(id => {
        const el = ctrl.querySelector('#' + id);
        if (el) el.addEventListener('input', () => {
          uiState.reportMeta.date = ctrl.querySelector('#rbDate').value;
          uiState.reportMeta.weather = ctrl.querySelector('#rbWeather').value;
          uiState.reportMeta.roomTemp = ctrl.querySelector('#rbTemp').value;
          uiState.reportMeta.humidity = ctrl.querySelector('#rbHum').value;
          injectMetaIntoPaper();
        });
      });
    }

    function injectMetaIntoPaper() {
      const m = uiState.reportMeta;
      let hdr = paper.querySelector('#v14PaperEnvStrip');
      if (!hdr) {
        hdr = document.createElement('div');
        hdr.id = 'v14PaperEnvStrip';
        hdr.className = 'mb-3 pb-2 border-b border-slate-300 flex flex-wrap justify-between gap-2 text-xs text-slate-700 font-medium';
        paper.insertAdjacentElement('afterbegin', hdr);
      }
      hdr.innerHTML = `<span><strong>日期：</strong>${esc(m.date)}</span><span><strong>天气：</strong>${esc(m.weather)}</span><span><strong>室温：</strong>${esc(m.roomTemp)} ℃</span><span><strong>湿度：</strong>${esc(m.humidity)} %</span>`;

      let sign = paper.querySelector('#v14PaperSignFooter');
      if (!sign) {
        sign = document.createElement('div');
        sign.id = 'v14PaperSignFooter';
        sign.className = 'mt-6 pt-4 border-t-2 border-slate-300 text-xs text-slate-800 space-y-6';
        sign.innerHTML = `
          <div><strong>教师评语：</strong></div>
          <div class="flex justify-end gap-8 pt-4">
            <span><strong>指导教师签字：</strong>________________</span>
            <span><strong>日期：</strong>______ 年 ___ 月 ___ 日</span>
          </div>
        `;
        paper.appendChild(sign);
      }
    }
    injectMetaIntoPaper();
  }

  window.TCM_V14_COURSE = {
    V14_COURSE_PRESETS,
    sync: function (topic, ws, stats, step) {
      try {
        if (step === 3) renderStep3MechanismAndTube(topic);
        if (step === 6) enhanceStep6ReportBook();
      } catch (err) {
        console.error('TCM_V14_COURSE error:', err);
      }
    }
  };
})();
