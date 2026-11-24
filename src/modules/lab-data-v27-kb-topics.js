/**
 * 本草智研 v27 · 六大学科知识库与实践资料汇编扩容课题库
 * 补齐《01 中药化学》~《06 中药制剂分析》及《实践资料汇编》中高频代表药材 14 项 + 权威文献 6 篇 + 院校/药企案例 4 项
 * 严格遵循原生 FEATURED_PRESETS / CATALOG_45 完整数据结构，无缝兼容六步工坊、DIY、八阶段产业转化、对比与报告导出
 */
export const V27_PRESETS = {
  aconite_process: {
    id: 'aconite_process',
    isInnovative: true,
    isKbNew: true,
    featured: true,
    sourceTag: '六科知识库 · 炮制减毒必考',
    herb: '附子（炮制水解减毒对照）',
    compound: '乌头碱 → 苯甲酰新乌头原碱',
    latin: 'Aconitum carmichaelii Debx.',
    category: '生物碱',
    defaultRig: 'reflux',
    applicableRigs: ['reflux', 'filter', 'hplc', 'tlc'],
    defaultExtract: 'acid_water',
    defaultSep: 'ph_gradient',
    formulas: ['henderson', 'qc'],
    defaultCfg: { mass: 50, ratio: 10, temp: 100, time: 120, mesh: '饮片(炮制对照)', cycles: '2', solventType: '纯化水', ph: 'pH 3.0~9.0 分离' },
    limitVal: 0.01,
    limitUnit: '%',
    crudeUnit: 'g',
    mpRef: '乌头碱 204℃ / 苯甲酰乌头原碱 211℃',
    origin: '毛茛科乌头子根加工品（盐附子、黑顺片、白附片）；回阳救逆要药，《中药化学》与炮制学双酯型生物碱减毒第一经典模型。',
    chemistry: '生品含剧毒双酯型二萜生物碱（乌头碱、新乌头碱、次乌头碱，LD₅₀极低）；水煮/蒸制炮制使 C-8 乙酰基水解脱去变为单酯型（苯甲酰乌头原碱），毒性骤降 100~200 倍而保留强心镇痛活性。',
    pharmacopoeia: '《中国药典》2025 年版规定：附子炮制品单酯型生物碱总量不得少于 0.010%，双酯型生物碱总量不得过 0.010%（HPLC 法）。',
    integrative: '生附子 vs 黑顺片对照实验：量化监测煎煮 30/60/120 min 时双酯碱向单酯碱转化曲线，直观阐释中药“久煎减毒”的现代化学本质。',
    scaling: { auxName: '0.1% 盐酸酸水', auxFactor: 1.0, auxUnit: 'mL', yieldLow: 0.006, yieldHigh: 0.012, yieldUnit: 'g' },
    tlcSystem: '硅胶 G 板，正己烷-乙酸乙酯-甲醇 (6.4:3.6:1)，氨蒸气饱和，喷改良碘化铋钾显橘红色斑点。',
    tlcDefault: { front: 8.0, sample: 4.1, ref: 4.1 },
    steps: [
      { stage: '提取', title: '酸水/乙醇超声提取与生品-炮制品平行备样', principle: '生物碱在酸性水或醇溶液中成盐溶出，避免强碱直接破坏酯键影响原始双酯/单酯比例测定。', operation: '精密称取生附子与黑顺片细粉各 2.0 g（教学采用安全对照品或低毒炮制品），氨试液润湿后异丙醇-乙酸乙酯 (1:1) 超声提取 30 min。', qc: '⚠️ 剧毒药材实验务必佩戴手套并在通风橱操作，严禁入口接触！' },
      { stage: '分离', title: '减压浓缩与正相/反相净化', principle: '去除脂溶性杂质与水溶性盐类，富集总二萜生物碱部位。', operation: '提取液 40℃ 以下减压蒸干，残渣用异丙醇-三氯甲烷定容过 0.22 μm 滤膜。', qc: '浓缩温度不得高于 45℃，防止测定前发生人为二次水解。' },
      { stage: '纯化', title: '久煎模拟（30 / 60 / 120 min）水解动力学对照', principle: '沸水持续加热促使 C-8 乙酰氧基定量水解，双酯型峰面积骤降、单酯型峰面积上升。', operation: '水浴回流不同时间点定量取样，对比双酯型/单酯型比值变化。', qc: '120 min 后双酯碱残留应低于药典限度 0.010%。' },
      { stage: '检识', title: 'HPLC 梯度洗脱定量测定双酯/单酯双限量', principle: 'C18 柱以乙腈-四氢呋喃与 0.1 mol/L 醋酸铵缓冲液梯度洗脱，235 nm 同步定量 6 种乌头生物碱。', operation: '对照品法外标计算单酯总量与双酯总量，核对是否双项达标。', qc: '双酯型 ≤ 0.010% 且单酯型 ≥ 0.010% 方为合格炮制品。' }
    ],
    troubleshoot: [
      { issue: '双酯型生物碱测定值偏低或重复性差', cause: '提取或浓缩温度过高引发 C-8 酯键水解，或未用缓冲盐流动相导致峰拖尾。', fix: '全程控温 ≤ 40℃，流动相严格配制醋酸铵-冰醋酸缓冲体系。' }
    ]
  },

  nuxvomica_alkaloid: {
    id: 'nuxvomica_alkaloid',
    isInnovative: true,
    isKbNew: true,
    featured: true,
    sourceTag: '六科知识库 · 吲哚碱与砂烫减毒',
    herb: '马钱子（士的宁/马钱子碱分离）',
    compound: '士的宁 / 马钱子碱',
    latin: 'Strychnos nux-vomica L.',
    category: '生物碱',
    defaultRig: 'percolation',
    applicableRigs: ['percolation', 'extract', 'hplc', 'tlc'],
    defaultExtract: 'acid_water',
    defaultSep: 'ph_gradient',
    formulas: ['henderson', 'qc'],
    defaultCfg: { mass: 50, ratio: 10, temp: 25, time: 60, mesh: '粗粉(10~20目)', cycles: '2', solventType: '0.5%酸水', ph: 'pH 2.0 提 / pH 9.5 萃' },
    limitVal: 1.2,
    limitUnit: '%',
    crudeUnit: 'g',
    mpRef: '士的宁 286℃ / 马钱子碱 178℃',
    origin: '马钱科马钱干燥成熟种子；大毒通络止痛药，《中药化学》吲哚类生物碱与砂烫炮制降毒经典案例。',
    chemistry: '含吲哚类生物碱士的宁（番木鳖碱，毒性强、活性高）与马钱子碱（甲氧基衍生物，碱性与溶解度有差异）；230~240℃ 砂烫使部分士的宁异构化为低毒异士的宁与氮氧化物。',
    pharmacopoeia: '《中国药典》2025 年版规定：马钱子含士的宁应为 1.20%~2.20%，含马钱子碱不得少于 0.80%（上限下限双控）。',
    integrative: '结合《01 中药化学》生物碱硫酸盐溶解度差异（硫酸马钱子碱水溶性远大于硫酸士的宁）完成二组分经典分级分离，并开展 HPLC 上下限双控训练。',
    scaling: { auxName: '氨水/稀硫酸', auxFactor: 0.4, auxUnit: 'mL', yieldLow: 0.012, yieldHigh: 0.022, yieldUnit: 'g' },
    tlcSystem: '硅胶 G 板，甲苯-丙酮-乙醇-浓氨试液 (4:5:0.6:0.4)，喷稀碘化铋钾显橙红色斑点。',
    tlcDefault: { front: 8.0, sample: 4.9, ref: 4.9 },
    steps: [
      { stage: '提取', title: '稀酸水渗漉/超声提取总吲哚生物碱', principle: '士的宁与马钱子碱均为中等强度叔胺碱，酸水成盐溶出，油脂留在药渣中。', operation: '制马钱子粉用 0.5% 硫酸水溶液渗漉或超声提取，合并酸提液。', qc: '⚠️ 严格按毒性药材管理规程双人核对投料量。' },
      { stage: '分离', title: '碱化游离与低极性有机相萃取', principle: '氨水调 pH 9.5 使生物碱游离，转入二氯甲烷/乙酸乙酯层。', operation: '酸液碱化至 pH 9.5，乙酸乙酯分次萃取 3 次，合并有机相浓缩。', qc: '防止乳化，可轻柔振摇并加少量氯化钠破乳。' },
      { stage: '纯化', title: '稀乙醇重结晶分级分离士的宁与马钱子碱', principle: '利用两者在稀乙醇及硫酸盐水中溶解度显著差异，先析出士的宁，母液浓缩得马钱子碱。', operation: '总碱加 25% 乙醇微热溶解，室温静置过滤得士的宁粗晶，母液浓缩精制马钱子碱。', qc: 'TLC 检查两晶体无相互交叉斑点。' },
      { stage: '检识', title: '浓硝酸显色鉴别与 HPLC 上下限双控', principle: '马钱子碱遇浓硝酸显深红色（邻二甲氧基氧化），士的宁遇重铬酸钾-浓硫酸显紫蓝色→红色。', operation: '254 nm 波长下 HPLC 同步测定士的宁与马钱子碱含量。', qc: '士的宁须严格落入 1.20%~2.20% 治疗窗！' }
    ],
    troubleshoot: [
      { issue: 'TLC 斑点拖尾严重', cause: '硅胶表面硅羟基与碱性生物碱强吸附。', fix: '展开剂必须加入浓氨试液并在展开缸中预饱和 20 min。' }
    ]
  },

  catharanthus_vinca: {
    id: 'catharanthus_vinca',
    isInnovative: true,
    isKbNew: true,
    featured: true,
    sourceTag: '六科知识库 · 中西医抗肿瘤对照',
    herb: '长春花（双吲哚碱与抗肿瘤溯源）',
    compound: '长春碱 / 长春新碱',
    latin: 'Catharanthus roseus (L.) G. Don',
    category: '生物碱',
    defaultRig: 'percolation',
    applicableRigs: ['percolation', 'extract', 'rotavap', 'hplc'],
    defaultExtract: 'acid_water',
    defaultSep: 'ph_gradient',
    formulas: ['henderson', 'diffusion'],
    defaultCfg: { mass: 100, ratio: 10, temp: 25, time: 90, mesh: '粗粉(10~20目)', cycles: '2', solventType: '0.5%酸水', ph: 'pH 2.0 → 4.5 → 7.0 梯度' },
    limitVal: 0.002,
    limitUnit: '%',
    crudeUnit: 'mg',
    mpRef: '长春碱 211℃ / 长春新碱 218℃',
    origin: '夹竹桃科长春花干燥全草；微管蛋白抑制剂类抗肿瘤明星天然产物（《01 中药化学》氨基酸途径与 pH 梯度萃取代表）。',
    chemistry: '属双吲哚（二聚吲哚）生物碱，分子大、碱性偏弱（pKa 约 5.4/7.4），对强酸强碱及高温极度敏感，易发生酯键水解或构型异构；药材含量极低（十万分级）。',
    pharmacopoeia: '参考《中国药典》二部硫酸长春碱/硫酸长春新碱原料药标准及现代 HPLC-MS/MS 微量定量方法。',
    integrative: '典型中西医对照课题：从民间降糖草药偶然发现白血病特效双吲哚碱，演示“低含量高活性天然产物的 pH 精细梯度富集策略”。',
    scaling: { auxName: '酒石酸/磷酸盐缓冲液', auxFactor: 0.6, auxUnit: 'mL', yieldLow: 0.001, yieldHigh: 0.003, yieldUnit: 'g' },
    tlcSystem: '硅胶 GF254 板，三氯甲烷-甲醇 (95:5)，喷硫酸铈铵试液显特征紫红色。',
    tlcDefault: { front: 8.0, sample: 3.8, ref: 3.8 },
    steps: [
      { stage: '提取', title: '常温 pH 2~3 弱酸醇渗漉防热分解', principle: '双吲哚碱热敏且忌强酸，选用弱有机酸（酒石酸/柠檬酸）常温渗漉保护骨架。', operation: '100 g 粗粉以 0.5% 酒石酸-70% 乙醇常温渗漉收集。', qc: '严禁超过 40℃ 长时间加热浓缩。' },
      { stage: '分离', title: 'pH 梯度精密萃取（pH 2 → 4.5 → 7.0）', principle: '弱碱性双吲哚碱在 pH 4.5~6.0 即可游离转入有机相，从而与强碱性单吲哚杂碱分离。', operation: '浓缩除醇后先在 pH 2.0 用石油醚脱脂，调 pH 4.5 萃取富集长春碱/长春新碱组分。', qc: '精密 pH 计逐滴调控，防止过碱皂化。' },
      { stage: '纯化', title: '氧化铝/反相 C18 制备色谱精制', principle: '双吲哚碱结构极相近（仅一个甲基与甲酰基差异），需高分离度色谱实现单体纯化。', operation: '富集流分上中性氧化铝柱梯度洗脱，核心流分用制备 HPLC 精制。', qc: '全程避光低温氮吹浓缩。' },
      { stage: '检识', title: 'LC-MS/MS 分子离子确证（m/z 811 / 825）', principle: '长春碱 [M+H]⁺ 811.4、长春新碱 [M+H]⁺ 825.4，高分辨质谱与对照品保留时间双确认。', operation: '结合 UV 220/262 nm 与质谱裂解碎片确证结构。', qc: '纯度与杂质谱须符合原料药级要求。' }
    ],
    troubleshoot: [
      { issue: '提取物中长春新碱检出率骤降', cause: '强碱调 pH 或高温旋蒸导致脱乙酰降解。', fix: '改用氨水/碳酸氢钠缓调 pH ≤ 7.5，旋蒸水浴控温 35℃。' }
    ]
  },

  lithospermum_shikonin: {
    id: 'lithospermum_shikonin',
    isInnovative: true,
    isKbNew: true,
    featured: true,
    sourceTag: '六科知识库 · 萘醌类代表药材',
    herb: '紫草（左旋紫草素萘醌提取）',
    compound: '左旋紫草素 / β,β\'-二甲基丙烯酰阿卡宁',
    latin: 'Arnebia euchroma (Royle) Johnst.',
    category: '蒽醌与醌类',
    defaultRig: 'ultrasonic',
    applicableRigs: ['ultrasonic', 'sfe', 'rotavap', 'tlc'],
    defaultExtract: 'ultrasonic',
    defaultSep: 'silica_col',
    formulas: ['diffusion', 'qc'],
    defaultCfg: { mass: 50, ratio: 10, temp: 35, time: 30, mesh: '粗粉(10~20目)', cycles: '2', solventType: '石油醚(30-60℃)', ph: '中性避光防聚合' },
    limitVal: 0.3,
    limitUnit: '%',
    crudeUnit: 'g',
    mpRef: '紫草素 147~149℃',
    origin: '紫草科新疆紫草干燥根；凉血活血、解毒透疹，《01 中药化学》萘醌类（与大黄蒽醌、丹参菲醌并列三醌）代表。',
    chemistry: '主要含脂溶性紫草素衍生物（萘醌母核带手性侧链酯基），呈鲜艳紫红色，强亲脂、极易热聚变黑，遇碱液显特征深蓝色/蓝紫色（区分于蒽醌的红色）。',
    pharmacopoeia: '《中国药典》2025 年版规定：紫草含 β,β\'-二甲基丙烯酰阿卡宁不得少于 0.30%，总羟基萘醌色素以左旋紫草素计不得少于 0.80%。',
    integrative: '三醌对比教学极佳案例：大黄（蒽醌·红）、丹参（菲醌·橙红）、紫草（萘醌·遇碱显蓝紫），结合低温石油醚/超临界 CO₂ 绿色提取与软膏剂成型（对应《02 中药制剂》）。',
    scaling: { auxName: '石油醚/乙醇', auxFactor: 0.5, auxUnit: 'mL', yieldLow: 0.008, yieldHigh: 0.015, yieldUnit: 'g' },
    tlcSystem: '硅胶 G 板，石油醚(60~90℃)-甲苯-乙酸乙酯-甲酸 (5:2:0.5:0.1)，日光下即见鲜明紫红色斑点。',
    tlcDefault: { front: 8.0, sample: 5.4, ref: 5.4 },
    steps: [
      { stage: '提取', title: '低温低极性溶剂超声提取（≤35℃）', principle: '紫草萘醌酯强亲脂且热敏易氧化聚合，选用石油醚或低温乙醇短时超声提取。', operation: '50 g 新疆紫草粗粉加 10 倍量石油醚(30~60℃) 35℃ 避光超声 30 min，提取 2 次。', qc: '提取液应呈通透艳丽紫红色，若发暗褐说明过热氧化。' },
      { stage: '分离', title: '低温减压回收溶剂得紫草浸膏', principle: '低沸点溶剂可在 35℃ 下快速回收，保留天然萘醌酯原貌。', operation: '合并滤液 35℃ 减压旋蒸浓缩至紫红色膏状物。', qc: '溶剂可回收套用，降低 VOC 排放。' },
      { stage: '纯化', title: '2% NaOH 温和碱洗或硅胶柱快速纯化', principle: '利用萘醌酚羟基弱酸性或硅胶极性差异分离各紫草素酯单体。', operation: '硅胶柱以石油醚-乙酸乙酯 (95:5) 梯度洗脱收集紫红主色带。', qc: '若需做紫草油/紫草软膏，浸膏可直接与麻油/蜂蜡基质低温配伍。' },
      { stage: '检识', title: '碱液蓝紫显色 + UV 516 nm 总萘醌测定', principle: '萘醌酚羟基成盐共轭红移显蓝紫色；UV 516 nm 测定总羟基萘醌，HPLC 275 nm 测单体酯。', operation: '取 1 mL 样液滴加 5% NaOH 观察由紫红瞬间变蓝紫；分光光度计 516 nm 测吸光度。', qc: '总羟基萘醌 ≥ 0.80%，酯单体 ≥ 0.30%。' }
    ],
    troubleshoot: [
      { issue: '紫草提取物颜色发黑发暗、得率偏低', cause: '加热温度超过 60℃ 或长时间光照导致萘醌氧化聚合。', fix: '全程 35℃ 以下避光操作，优先采用低温超声或超临界 CO₂。' }
    ]
  },

  peucedanum_praeruptorin: {
    id: 'peucedanum_praeruptorin',
    isInnovative: true,
    isKbNew: true,
    featured: true,
    sourceTag: '六科知识库 · 角型香豆素代表',
    herb: '前胡（白花前胡甲素/乙素）',
    compound: '白花前胡甲素 / 白花前胡乙素',
    latin: 'Peucedanum praeruptorum Dunn',
    category: '香豆素与木脂素',
    defaultRig: 'ultrasonic',
    applicableRigs: ['ultrasonic', 'reflux', 'hplc', 'tlc'],
    defaultExtract: 'ultrasonic',
    defaultSep: 'silica_col',
    formulas: ['diffusion', 'qc'],
    defaultCfg: { mass: 50, ratio: 10, temp: 45, time: 30, mesh: '中粉(40目)', cycles: '2', solventType: '70%乙醇', ph: '中性防内酯水解' },
    limitVal: 0.9,
    limitUnit: '%',
    crudeUnit: 'g',
    mpRef: '白花前胡甲素 137~139℃',
    origin: '伞形科白花前胡干燥根；降气化痰、散风清热，《01 中药化学》吡喃香豆素及 2025 药典基原防混伪重点品种。',
    chemistry: '主含角型吡喃香豆素类（白花前胡甲素、乙素、丙素等），分子含内酯环与酯键，亲脂性强，UV 365 nm 下具特征蓝色荧光，遇强碱易开环水解。',
    pharmacopoeia: '《中国药典》2025 年版规定：前胡含白花前胡甲素不得少于 0.90%，含白花前胡乙素不得少于 0.24%（双指标 HPLC 控伪）。',
    integrative: '前胡市场混伪品多（如紫花前胡、独活等），通过“白花前胡甲素+乙素双指标 HPLC + UV 365 nm 蓝荧光 TLC”建立教科书级真伪与含量双重防线。',
    scaling: { auxName: '95% 乙醇/石油醚', auxFactor: 0.4, auxUnit: 'mL', yieldLow: 0.009, yieldHigh: 0.018, yieldUnit: 'g' },
    tlcSystem: '硅胶 G 板，石油醚(60~90℃)-乙酸乙酯 (3:1)，置 UV 365 nm 下检视亮蓝色荧光主斑点。',
    tlcDefault: { front: 8.0, sample: 4.5, ref: 4.5 },
    steps: [
      { stage: '提取', title: '三氯甲烷或高浓度乙醇超声快速提取', principle: '角型吡喃香豆素脂溶性强，高浓度乙醇可高效溶出并避免强碱或长时间沸煮导致酯基水解。', operation: '前胡中粉加 10 倍量 80% 乙醇 45℃ 超声提取 30 min，提取 2 次。', qc: '忌用碱水提取，防止侧链当归酰基与内酯环水解。' },
      { stage: '分离', title: '减压浓缩与石油醚-乙酸乙酯梯度萃取', principle: '浓缩除醇后转入中等极性有机相，去除多糖与水溶性杂质。', operation: '滤液减压浓缩至无醇味，乙酸乙酯萃取 3 次，无水硫酸钠干燥。', qc: '分相清晰，无乳化。' },
      { stage: '纯化', title: '硅胶柱层析或低温乙醇重结晶', principle: '利用白花前胡甲素与乙素酯侧链极性微差完成柱层析分离。', operation: '石油醚-乙酸乙酯 (8:1 → 4:1) 梯度洗脱，TLC 荧光跟踪合并主峰流分。', qc: 'UV 365 nm 下呈单一亮蓝荧光斑点。' },
      { stage: '检识', title: '异羟肟酸铁反应 + HPLC 321 nm 双指标测定', principle: '香豆素内酯环具异羟肟酸铁显红色反应；HPLC 321 nm 同步测定甲素与乙素。', operation: '乙腈-水 (75:25) 等度洗脱，同步核算白花前胡甲素（≥0.90%）与乙素（≥0.24%）。', qc: '双指标同时合格可有效排除混伪品。' }
    ],
    troubleshoot: [
      { issue: '白花前胡甲素达标但乙素极低', cause: '可能混入非药典基原（如紫花前胡）或采收期抽薹木质化严重。', fix: '先核对基原显微特征，确认未抽薹前采收的干燥根。' }
    ]
  },

  arctium_arctiin: {
    id: 'arctium_arctiin',
    isInnovative: true,
    isKbNew: true,
    featured: true,
    sourceTag: '六科知识库 · 木脂素杀酶保苷',
    herb: '牛蒡子（牛蒡苷木脂素提取）',
    compound: '牛蒡苷 / 牛蒡苷元',
    latin: 'Arctium lappa L.',
    category: '香豆素与木脂素',
    defaultRig: 'reflux',
    applicableRigs: ['reflux', 'ultrasonic', 'macroporous', 'hplc'],
    defaultExtract: 'reflux',
    defaultSep: 'macroporous',
    formulas: ['diffusion', 'qc'],
    defaultCfg: { mass: 50, ratio: 10, temp: 80, time: 60, mesh: '粉碎脱脂(20目)', cycles: '2', solventType: '70%乙醇', ph: '中性防酶解' },
    limitVal: 5.0,
    limitUnit: '%',
    crudeUnit: 'g',
    mpRef: '牛蒡苷 110~112℃ / 牛蒡苷元 102℃',
    origin: '菊科牛蒡干燥成熟果实；疏散风热、解毒利咽，《01 中药化学》二苄基丁内酯型木脂素代表。',
    chemistry: '种子含 15%~20% 脂肪油与高含量木脂素苷（牛蒡苷，极性中等偏大），同时含内源性 β-葡萄糖苷酶，遇温水极易酶解为难溶牛蒡苷元（炒牛蒡子即通过热杀酶与去油改善溶出）。',
    pharmacopoeia: '《中国药典》2025 年版规定：牛蒡子含牛蒡苷不得少于 5.0%（HPLC 280 nm 测定）。',
    integrative: '典型“先脱脂防乳化 + 醇提杀酶保苷”双步骤训练，并可对照生牛蒡子 vs 炒牛蒡子的出膏率与牛蒡苷/苷元转化比。',
    scaling: { auxName: '石油醚脱脂/D101树脂', auxFactor: 0.5, auxUnit: 'mL', yieldLow: 0.045, yieldHigh: 0.07, yieldUnit: 'g' },
    tlcSystem: '硅胶 G 板，三氯甲烷-甲醇-水 (40:8:1)，喷 10% 硫酸乙醇 105℃ 加热显紫红色斑点。',
    tlcDefault: { front: 8.0, sample: 4.2, ref: 4.2 },
    steps: [
      { stage: '提取', title: '石油醚预处理脱脂 + 70% 乙醇热回流杀酶保苷', principle: '先除 15%~20% 脂肪油消除后续乳化与糊柱；70% 热乙醇既高效溶出牛蒡苷又瞬时钝化苷酶。', operation: '牛蒡子粗粉先以石油醚脱脂晾干，再加 10 倍量 70% 乙醇 80℃ 回流提取 2 次，每次 60 min。', qc: '脱脂后滤液清亮不浮油膜。' },
      { stage: '分离', title: '减压回收乙醇与水沉除杂', principle: '回收乙醇至无醇味，沉淀残留脂溶性蜡质与蛋白。', operation: '合并滤液减压浓缩，加水稀释静置过夜抽滤。', qc: '保持微温快速抽滤防止牛蒡苷提前共沉损失。' },
      { stage: '纯化', title: 'D101 大孔吸附树脂 50% 乙醇梯度富集', principle: '大孔树脂优先吸附木脂素苷，水洗除糖，50% 乙醇集中洗脱高纯牛蒡苷。', operation: '上样后依次以 3 BV 纯化水、2 BV 20% 乙醇除杂，4 BV 50% 乙醇洗脱并浓缩结晶。', qc: '纯度可达 70% 以上。' },
      { stage: '检识', title: 'HPLC 280 nm 定量测定牛蒡苷', principle: '木脂素苯环在 280 nm 具稳定紫外吸收，甲醇-水 (1:1.1) 等度基线分离。', operation: '外标法测算牛蒡苷含量，对比药典 5.0% 标准。', qc: '理论板数按牛蒡苷峰计 ≥ 1500。' }
    ],
    troubleshoot: [
      { issue: '提取液浑浊油腻、大孔树脂堵柱', cause: '未先脱去牛蒡子中大量脂肪油。', fix: '粉碎后务必先用石油醚脱脂或冷榨除油再醇提。' }
    ]
  },

  silybum_silybin: {
    id: 'silybum_silybin',
    isInnovative: true,
    isKbNew: true,
    featured: true,
    sourceTag: '六科知识库 · 化学-制剂增溶标杆',
    herb: '水飞蓟（水飞蓟宾与固体分散体增溶）',
    compound: '水飞蓟宾（黄酮木脂素）',
    latin: 'Silybum marianum (L.) Gaertn.',
    category: '黄酮',
    defaultRig: 'soxhlet',
    applicableRigs: ['soxhlet', 'reflux', 'rotavap', 'hplc'],
    defaultExtract: 'reflux',
    defaultSep: 'solvent_extract',
    formulas: ['diffusion', 'qc'],
    defaultCfg: { mass: 50, ratio: 10, temp: 75, time: 90, mesh: '脱脂饼粉(40目)', cycles: '2', solventType: '95%乙醇', ph: '中性避强碱' },
    limitVal: 0.6,
    limitUnit: '%',
    crudeUnit: 'g',
    mpRef: '水飞蓟宾 158~160℃',
    origin: '菊科水飞蓟干燥成熟果实；国际公认保肝药，串联《01 中药化学》（黄酮木脂素）与《02 中药制剂》（难溶成分固体分散体/磷脂复合物增溶）的最佳桥梁课题。',
    chemistry: '水飞蓟素由水飞蓟宾（Silybin A/B 非对映异构体，主成分）、异水飞蓟宾等黄酮木脂素构成；水溶性极差（<0.05 mg/mL），口服生物利用度低，是制剂学 BCS Ⅱ/Ⅳ 类难溶药增溶经典模型。',
    pharmacopoeia: '《中国药典》2025 年版规定：水飞蓟含水飞蓟宾（水飞蓟宾 A 与 B 总量）不得少于 0.60%，水飞蓟素提取物总黄酮 ≥ 80%。',
    integrative: '完整打通“脱脂→乙酸乙酯/乙醇提取→水飞蓟宾提取物→PVP K30 固体分散体/磷脂复合物增溶对比溶出度（对应《02 中药制剂》&《06 制剂分析》）”研发闭环。',
    scaling: { auxName: '乙酸乙酯/PVP K30', auxFactor: 0.8, auxUnit: 'mL', yieldLow: 0.015, yieldHigh: 0.028, yieldUnit: 'g' },
    tlcSystem: '硅胶 GF254 板，三氯甲烷-丙酮-甲酸 (9:2:1)，UV 365 nm 或喷 1% 三氯化铝乙醇液显黄绿色荧光。',
    tlcDefault: { front: 8.0, sample: 4.8, ref: 4.8 },
    steps: [
      { stage: '提取', title: '压榨/石油醚脱脂 + 乙酸乙酯/95% 乙醇回流', principle: '水飞蓟种子含 25%~30% 脂肪油，脱脂后以乙酸乙酯或高浓度乙醇高选择性溶出黄酮木脂素。', operation: '脱脂饼粉加 10 倍量 95% 乙醇 75℃ 回流 2 次，每次 90 min。', qc: '脱脂残油率 < 3% 可大幅提高后续水飞蓟素纯度。' },
      { stage: '分离', title: '减压浓缩与石油醚二次洗涤除油', principle: '去除残留中性油脂，使总水飞蓟素含量由 40% 跃升至 75%~80%。', operation: '浓缩得稠膏，冷石油醚搅洗 2 次，抽滤干燥得浅黄色水飞蓟素粉。', qc: '粉末松散不粘壁。' },
      { stage: '纯化', title: '溶剂法制备水飞蓟宾-PVP K30 固体分散体（选做增溶）', principle: '药物以无定形态高度分散于亲水载体 PVP 中，溶出度可提升 5~10 倍。', operation: '水飞蓟素与 PVP K30 按 1:4 共溶于无水乙醇，50℃ 旋蒸成膜真空干燥粉碎。', qc: '比较原料药 vs 固体分散体 45 min 溶出度差异。' },
      { stage: '检识', title: 'HPLC 288 nm 同步分离水飞蓟宾 A/B 双峰', principle: '甲醇-水-冰醋酸梯度在 C18 柱上实现水飞蓟宾 A、B 两个非对映异构体基线分离。', operation: '以水飞蓟宾 A+B 峰面积之和定量，核对药典 ≥ 0.60% 要求。', qc: 'A/B 双峰分离度 R ≥ 1.5。' }
    ],
    troubleshoot: [
      { issue: '水飞蓟宾原料药水中几乎不溶、溶出度极低', cause: '强疏水晶体结构导致润湿性与溶解速率双低。', fix: '在制剂阶段采用固体分散体、环糊精包合或磷脂复合物增溶技术。' }
    ]
  },

  tripterygium_triptolide: {
    id: 'tripterygium_triptolide',
    isInnovative: true,
    isKbNew: true,
    featured: true,
    sourceTag: '六科知识库 · 活性导向与严控毒效窗',
    herb: '雷公藤（雷公藤甲素活性导向分离）',
    compound: '雷公藤甲素（环氧二萜内酯）',
    latin: 'Tripterygium wilfordii Hook. f.',
    category: '萜类内酯与环烯醚萜',
    defaultRig: 'ultrasonic',
    applicableRigs: ['ultrasonic', 'column', 'rotavap', 'hplc'],
    defaultExtract: 'ultrasonic',
    defaultSep: 'silica_col',
    formulas: ['diffusion', 'qc'],
    defaultCfg: { mass: 100, ratio: 10, temp: 50, time: 45, mesh: '去皮木质部粗粉', cycles: '2', solventType: '70%乙醇', ph: '中性防环氧开环' },
    limitVal: 0.001,
    limitUnit: '%',
    crudeUnit: 'mg',
    mpRef: '雷公藤甲素 226~227℃',
    origin: '卫矛科雷公藤去皮根心；免疫抑制与抗类风湿名药，代表《01 中药化学》微量高活性二萜内酯及《06 制剂分析》窄治疗窗质控范式。',
    chemistry: '含三环氧二萜内酯雷公藤甲素（含量仅十万分之一至万分之一），对强酸强碱敏感易致环氧基开环失活；既是核心免疫抑制活性成分，也是肝肾生殖毒性来源，必须精密限量控制。',
    pharmacopoeia: '参考雷公藤多苷片国家药品标准（严格控制雷公藤甲素含量上下限，如 0.1~1.0 μg/片）及现代 LC-MS/MS 痕量检测标准。',
    integrative: '演示药企研发中“微量高毒效成分”的完整控制链：去皮减毒预处理 → 中性乙醇提取 → 硅胶/中性氧化铝富集 → SPE 净化 → HPLC/LC-MS 痕量双限测定。',
    scaling: { auxName: '乙酸乙酯/中性氧化铝', auxFactor: 0.6, auxUnit: 'mL', yieldLow: 0.0008, yieldHigh: 0.002, yieldUnit: 'g' },
    tlcSystem: '硅胶 GF254 板，三氯甲烷-乙醚 (2:1)，喷 2% 3,5-二硝基苯甲酸乙醇液与 1 mol/L NaOH（Kedde 试剂）显紫红色。',
    tlcDefault: { front: 8.0, sample: 4.3, ref: 4.3 },
    steps: [
      { stage: '提取', title: '去根皮预处理 + 中性 75% 乙醇温浸/超声', principle: '根皮毒性成分远高于木质部，先去皮减毒；中性醇提保护三环氧及内酯环。', operation: '去皮根心粗粉加 10 倍量 75% 乙醇 50℃ 超声提取 2 次。', qc: '⚠️ 剧毒药材实验做好防护，教学可用对照品模拟定量。' },
      { stage: '分离', title: '乙酸乙酯液液分配富集二萜内酯部位', principle: '浓缩除醇后乙酸乙酯选择性富集雷公藤甲素及雷公藤多苷群。', operation: '水混悬液用等体积乙酸乙酯萃取 3 次，合并有机相浓缩。', qc: '控制水相 pH 6.0~7.0。' },
      { stage: '纯化', title: '中性氧化铝脱色除鞣 + 硅胶柱梯度精制', principle: '氧化铝高效吸附酚酸、色素与鞣质，显著降低基质干扰。', operation: '样液过中性氧化铝柱（乙酸乙酯洗脱），收集流分进一步制备纯化。', qc: '洗脱液澄清浅黄，基质效应大幅下降。' },
      { stage: '检识', title: 'Kedde 试剂不饱和内酯显色 + HPLC 218 nm 痕量测定', principle: 'α,β-不饱和五元内酯环与 Kedde 试剂显紫红；218 nm 紫外末端或 LC-MS/MS 精准定量。', operation: '标准曲线外标法核算雷公藤甲素含量，验证是否在安全治疗窗内。', qc: '必须同时满足下限（保效）与上限（控毒）！' }
    ],
    troubleshoot: [
      { issue: '218 nm 检测基线漂移、杂质峰掩盖甲素峰', cause: '低波长末端吸收易受残留色素、鞣质及溶剂截止波长干扰。', fix: '采用中性氧化铝/SPE 前处理净化，并换用色谱纯乙腈（截止波长 190 nm）。' }
    ]
  },

  paris_polyphyllin: {
    id: 'paris_polyphyllin',
    isInnovative: true,
    isKbNew: true,
    featured: true,
    sourceTag: '六科知识库 · 甾体皂苷多指标',
    herb: '重楼（重楼皂苷Ⅰ/Ⅱ/Ⅶ 多指标测定）',
    compound: '重楼皂苷Ⅰ / Ⅱ / Ⅶ',
    latin: 'Paris polyphylla Smith var. yunnanensis',
    category: '甾体与强心苷',
    defaultRig: 'reflux',
    applicableRigs: ['reflux', 'macroporous', 'hplc', 'tlc'],
    defaultExtract: 'reflux',
    defaultSep: 'macroporous',
    formulas: ['diffusion', 'qc'],
    defaultCfg: { mass: 50, ratio: 10, temp: 78, time: 60, mesh: '中粉(40目)', cycles: '2', solventType: '70%乙醇', ph: '中性防酸水解' },
    limitVal: 0.6,
    limitUnit: '%',
    crudeUnit: 'g',
    mpRef: '重楼皂苷Ⅰ 282℃（分解）',
    origin: '百合科云南重楼/七叶一枝花干燥根茎；清热解毒、消肿止痛（云南白药等核心原料），《01 中药化学》螺甾烷醇型甾体皂苷代表。',
    chemistry: '以薯蓣皂苷元/偏诺皂苷元为苷元连接 3~4 糖链的甾体皂苷，具起泡性与溶血性，仅末端紫外吸收（203 nm），无强发色团。',
    pharmacopoeia: '《中国药典》2025 年版规定：重楼含重楼皂苷Ⅰ、重楼皂苷Ⅱ与重楼皂苷Ⅶ总量不得少于 0.60%（HPLC 203 nm 梯度法）。',
    integrative: '完美衔接《05 仪器分析》末端吸收梯度漂移控制（乙腈-水 203 nm 或 ELSD）与《06 制剂分析》多指标总和定量思路。',
    scaling: { auxName: '正丁醇/D101大孔树脂', auxFactor: 0.5, auxUnit: 'mL', yieldLow: 0.008, yieldHigh: 0.02, yieldUnit: 'g' },
    tlcSystem: '硅胶 G 板，三氯甲烷-甲醇-水 (15:5:1 下层)，喷 10% 硫酸乙醇 105℃ 加热显紫红色斑点。',
    tlcDefault: { front: 8.0, sample: 3.5, ref: 3.5 },
    steps: [
      { stage: '提取', title: '70% 乙醇加热回流提取总甾体皂苷', principle: '甾体皂苷含多糖链，70% 乙醇溶解度最佳且可沉淀大量淀粉与黏液质。', operation: '50 g 重楼中粉加 10 倍量 70% 乙醇 78℃ 回流 2 次，每次 60 min。', qc: '提取液冷却后过滤除沉淀。' },
      { stage: '分离', title: '减压浓缩与水饱和正丁醇液液分配', principle: '水饱和正丁醇选择性分配富集两亲性甾体皂苷，游离糖留于水相。', operation: '除醇后加水分散，等体积水饱和正丁醇萃取 3 次，合并正丁醇层减压蒸干。', qc: '振摇勿过猛以防强烈起泡乳化。' },
      { stage: '纯化', title: 'D101 大孔吸附树脂 70% 乙醇富集总皂苷', principle: '树脂水洗除杂、30% 乙醇洗极性杂苷、70% 乙醇集中收集重楼皂苷Ⅰ/Ⅱ/Ⅶ。', operation: '上样后梯度洗脱，收集 70% 乙醇流分浓缩干燥得白色/淡黄总皂苷粉。', qc: '泡沫试验持久稳定，Liebermann-Burchard 显紫红→蓝绿色。' },
      { stage: '检识', title: 'HPLC 203 nm 乙腈-水梯度测定三皂苷总量', principle: '使用低紫外截止的乙腈-水流动相实现 203 nm 末端紫外高灵敏定量。', operation: '分别测定重楼皂苷Ⅰ、Ⅱ、Ⅶ含量并求和，对照 0.60% 药典限度。', qc: '三皂苷分离度均 ≥ 1.5，基线漂移平稳。' }
    ],
    troubleshoot: [
      { issue: '203 nm 梯度洗脱基线急剧上翘', cause: '使用了含紫外吸收杂质的甲醇或普通分析纯溶剂。', fix: '必须使用 HPLC 级乙腈与超纯水，必要时改用 ELSD 蒸发光散射检测器。' }
    ]
  },

  galla_tannin: {
    id: 'galla_tannin',
    isInnovative: true,
    isKbNew: true,
    featured: true,
    sourceTag: '六科知识库 · 鞣质提取与除鞣经典',
    herb: '五倍子（水解鞣质与没食子酸）',
    compound: '五倍子鞣酸 / 没食子酸',
    latin: 'Rhus chinensis Mill. (Galla Chinensis)',
    category: '苯丙素与有机酸',
    defaultRig: 'ultrasonic',
    applicableRigs: ['ultrasonic', 'filter', 'rotavap', 'tlc'],
    defaultExtract: 'ultrasonic',
    defaultSep: 'solvent_extract',
    formulas: ['diffusion', 'qc'],
    defaultCfg: { mass: 50, ratio: 10, temp: 55, time: 40, mesh: '粗粉(20目)', cycles: '2', solventType: '纯化水', ph: 'pH 4.0~5.0 防氧化' },
    limitVal: 50.0,
    limitUnit: '%',
    crudeUnit: 'g',
    mpRef: '没食子酸 253℃（分解）',
    origin: '漆树科盐肤木叶上倍蚜虫瘿；敛肺降火、涩肠止泻，《01 中药化学》水解鞣质及《03 制药工艺》“除鞣技术”代表药材。',
    chemistry: '鞣质含量高达 50%~70%（主要为五没食子酰葡萄糖类水解鞣质），多酚羟基强水溶且极易氧化变深色，能与蛋白质（明胶）、生物碱、重金属生成沉淀，遇 FeCl₃ 显深蓝黑色。',
    pharmacopoeia: '《中国药典》2025 年版规定：五倍子含鞣质（以没食子酸计，干酪素法/HPLC 酸水解法）不得少于 50.0%。',
    integrative: '一材两用教学：既学习高纯度水解鞣质的防氧化提取与《中国药典》四部通则 2202 鞣质含量测定（磷钼钨酸干酪素比色法），又训练中药注射液/口服液中明胶法/聚酰胺法除鞣工艺。',
    scaling: { auxName: '乙酸乙酯/抗坏血酸', auxFactor: 0.3, auxUnit: 'mL', yieldLow: 0.45, yieldHigh: 0.6, yieldUnit: 'g' },
    tlcSystem: '硅胶 GF254 板，三氯甲烷-甲酸乙酯-甲酸 (5:5:1)，喷 1% FeCl₃ 乙醇液显深蓝黑色斑点。',
    tlcDefault: { front: 8.0, sample: 4.0, ref: 4.0 },
    steps: [
      { stage: '提取', title: '55℃ 温水/丙酮水低温避光提取防氧化', principle: '水解鞣质易溶于热水与含水丙酮，控温 ≤ 60℃ 并禁用铁器以防铁离子络合变黑。', operation: '50 g 五倍子粗粉加 10 倍量 55℃ 纯化水（可加 0.1% 维生素 C 抗氧）超声 40 min，玻璃器皿过滤。', qc: '严禁接触铁制筛网或不锈钢锈蚀容器！' },
      { stage: '分离', title: '乙酸乙酯液液萃取富集精制鞣酸', principle: '水相微酸化后乙酸乙酯选择性萃取多没食子酰葡萄糖，水溶性糖与无机盐留于水相。', operation: '滤液浓缩至 1/3，用乙酸乙酯萃取 3 次，合并有机相低温减压蒸干得淡黄白色精制鞣酸。', qc: '成品应为浅黄白色松散粉末，非焦黑色。' },
      { stage: '纯化', title: '明胶沉淀法与聚酰胺吸附除鞣对比实验（制剂应用）', principle: '模拟复方中去除干扰鞣质的工艺，对比除鞣前后溶液澄明度与有效成分保留率。', operation: '取样液分别加 1% 明胶盐溶液沉淀或过聚酰胺柱，检验滤液不再与明胶起浑。', qc: '明胶试液滴加无白色絮状沉淀即为除鞣完全。' },
      { stage: '检识', title: 'FeCl₃ 蓝黑显色 + 通则 2202 干酪素差减法测定', principle: '干酪素选择性吸附鞣质，分别测总酚与不被吸附多酚的 760 nm 吸光度差值即为鞣质含量。', operation: '磷钼钨酸试液显色 29 min 后 760 nm 测 A₁ 与 A₂，按没食子酸标准曲线计算。', qc: '全程避光、显色时间严格一致。' }
    ],
    troubleshoot: [
      { issue: '提取液瞬间变成墨水般蓝黑色', cause: '使用了含铁自来水或金属器具，Fe³⁺ 与邻苯三酚基团强烈络合。', fix: '必须使用纯化水及全玻璃/陶瓷/塑料器具操作。' }
    ]
  },

  artemisia_capillaris: {
    id: 'artemisia_capillaris',
    isInnovative: true,
    isKbNew: true,
    featured: true,
    sourceTag: '六科知识库 · 3D 绿原酸双指标',
    herb: '茵陈（绿原酸/滨蒿内酯双提）',
    compound: '绿原酸 / 滨蒿内酯',
    latin: 'Artemisia scoparia Waldst. et Kit.',
    category: '苯丙素与有机酸',
    defaultRig: 'ultrasonic',
    applicableRigs: ['ultrasonic', 'reflux', 'macroporous', 'hplc'],
    defaultExtract: 'ultrasonic',
    defaultSep: 'macroporous',
    formulas: ['henderson', 'diffusion'],
    defaultCfg: { mass: 50, ratio: 12, temp: 50, time: 40, mesh: '中粉(40目)', cycles: '2', solventType: '70%乙醇', ph: 'pH 4.0~5.0 保绿原酸' },
    limitVal: 0.5,
    limitUnit: '%',
    crudeUnit: 'g',
    mpRef: '绿原酸 208℃ / 滨蒿内酯 146℃',
    origin: '菊科滨蒿/茵陈蒿干燥地上部分（春季绵茵陈、秋季花茵陈）；清利湿热、利胆退黄，同时富含水溶性绿原酸与脂溶性香豆素滨蒿内酯。',
    chemistry: '绵茵陈主含绿原酸（咖啡酰奎宁酸，邻二酚羟基易氧化异构）及 6,7-二甲氧基香豆素（滨蒿内酯，利胆核心成分，UV 365 nm 显亮蓝荧光）。',
    pharmacopoeia: '《中国药典》2025 年版规定：茵陈含绿原酸不得少于 0.50%，花茵陈另控滨蒿内酯不得少于 0.20%。',
    integrative: '点击下方 🧬 绿原酸芯片可直接 3D 观察其邻二酚羟基与酯键；本课题同时比较春季绵茵陈与秋季花茵陈两类成分含量倒置规律（诠释“三月茵陈四月蒿”古训）。',
    scaling: { auxName: '0.1% 磷酸/D101树脂', auxFactor: 0.4, auxUnit: 'mL', yieldLow: 0.005, yieldHigh: 0.012, yieldUnit: 'g' },
    tlcSystem: '硅胶 GF254 板，甲苯-乙酸乙酯-甲酸 (5:4:1)，UV 365 nm 下同时观察绿原酸与滨蒿内酯特征荧光。',
    tlcDefault: { front: 8.0, sample: 3.1, ref: 3.1 },
    steps: [
      { stage: '提取', title: '50% 乙醇弱酸低温超声兼提绿原酸与滨蒿内酯', principle: '50% 乙醇对酚酸与香豆素均有良好溶解度，低温短时防止绿原酸异构为新绿原酸/隐绿原酸。', operation: '50 g 茵陈粗粉加 12 倍量 50% 乙醇（0.1% 磷酸调微酸）50℃ 超声提取 40 min。', qc: '避免碱性与长时间高温煎煮。' },
      { stage: '分离', title: '乙酸乙酯分配分离脂溶性滨蒿内酯与水溶性绿原酸', principle: '浓缩除醇后，乙酸乙酯萃取富集滨蒿内酯，水相微酸化保留高极性绿原酸。', operation: '醇提浓缩液依次以乙酸乙酯萃取 2 次（得滨蒿内酯部位），水相进树脂柱。', qc: '一次投料实现两类活性部位分轨回收。' },
      { stage: '纯化', title: '大孔树脂 30% 乙醇富集绿原酸', principle: 'AB-8/D101 树脂吸附绿原酸，水洗除糖后 30% 乙醇高效洗脱。', operation: '调水相 pH 3.5 上柱，3 BV 纯化水除杂，30% 乙醇洗脱并低温浓缩。', qc: '洗脱液澄清淡黄绿。' },
      { stage: '检识', title: 'HPLC 327 nm 同步测定绿原酸与滨蒿内酯', principle: '乙腈-0.1% 磷酸水梯度洗脱，327 nm 同步检出绿原酸与滨蒿内酯双主峰。', operation: '外标法核算双指标含量，对比绵茵陈与花茵陈差异。', qc: '绿原酸 ≥ 0.50%，滨蒿内酯 ≥ 0.20%。' }
    ],
    troubleshoot: [
      { issue: '绿原酸峰旁出现两个相邻小峰导致主峰偏低', cause: '高温或偏碱条件下绿原酸发生酰基迁移生成新绿原酸与隐绿原酸。', fix: '提取与浓缩控温 ≤ 55℃ 并保持微酸性（pH 3.5~4.5）。' }
    ]
  },

  cordyceps_adenosine: {
    id: 'cordyceps_adenosine',
    isInnovative: true,
    isKbNew: true,
    featured: true,
    sourceTag: '六科知识库 · N-苷与名贵药材防伪',
    herb: '冬虫夏草（腺苷 N-苷与指纹图谱防伪）',
    compound: '腺苷 / 虫草多糖',
    latin: 'Ophiocordyceps sinensis (Berk.) G.H.Sung',
    category: '多糖类',
    defaultRig: 'ultrasonic',
    applicableRigs: ['ultrasonic', 'filter', 'hplc', 'tlc'],
    defaultExtract: 'ultrasonic',
    defaultSep: 'alcohol_precip',
    formulas: ['diffusion', 'qc'],
    defaultCfg: { mass: 10, ratio: 20, temp: 40, time: 30, mesh: '细粉(60~80目)', cycles: '2', solventType: '纯化水', ph: '中性磷酸盐缓冲' },
    limitVal: 0.01,
    limitUnit: '%',
    crudeUnit: 'mg',
    mpRef: '腺苷 234~236℃',
    origin: '麦角菌科冬虫夏草菌寄生蝙蝠蛾幼虫复合体；名贵补益药，《01 中药化学》N-苷（核苷类）与《06 制剂分析》名贵药材指纹图谱及重金属（砷）安全性检查典型案例。',
    chemistry: '含核苷类 N-苷（腺苷、尿苷、鸟苷、肌苷，水溶性强、260 nm 紫外强吸收）、甘露醇（虫草酸）及免疫活性虫草多糖；常需与发酵虫草菌粉（如百令/金水宝）及伪品亚香棒虫草鉴别。',
    pharmacopoeia: '《中国药典》2025 年版规定：冬虫夏草含腺苷不得少于 0.010%（HPLC 260 nm），并重点关注重金属及有害元素（特别是总砷/无机砷）安全性检查。',
    integrative: '教学可用平价发酵虫草菌粉或蛹虫草对照演练“15% 甲醇超声提腺苷 + 剩余药渣水提醇沉得虫草多糖”一材双提，并学习名贵中药指纹图谱相似度评价（≥0.90）与砷形态安全评估。',
    scaling: { auxName: '15% 甲醇/95% 乙醇', auxFactor: 1.0, auxUnit: 'mL', yieldLow: 0.0002, yieldHigh: 0.001, yieldUnit: 'g' },
    tlcSystem: '硅胶 GF254 板，三氯甲烷-乙酸乙酯-异丙醇-水 (8:2:6:0.3)，UV 254 nm 下观察暗斑荧光淬灭。',
    tlcDefault: { front: 8.0, sample: 3.9, ref: 3.9 },
    steps: [
      { stage: '提取', title: '15% 甲醇超声提取核苷类 N-苷（腺苷）', principle: '腺苷强极性水溶，低比例甲醇既充分溶出腺苷又抑制多糖和蛋白过度糊化。', operation: '精密称取样品细粉 0.5 g（发酵菌粉教学替代），加 15% 甲醇 10 mL 40℃ 超声 30 min，补足减失重量。', qc: '0.45 μm 水系滤膜滤过即得 HPLC 供试液。' },
      { stage: '分离', title: '滤渣热水浸提 + 80% 乙醇醇沉富集虫草多糖', principle: '腺苷提取后的药渣仍富含水溶性多糖，80℃ 热水浸提后醇沉实现资源零浪费。', operation: '药渣加 15 倍量纯化水 80℃ 提取 2 h，浓缩至 1/4 后加 95% 乙醇至含醇量 80% 静置过夜。', qc: '4℃ 静置 12 h 提高多糖沉淀收率。' },
      { stage: '纯化', title: 'Sevag 法脱蛋白与苯酚-硫酸法测多糖', principle: '三氯甲烷-正丁醇 (4:1) 变性沉淀游离蛋白，纯化虫草多糖。', operation: '粗多糖复溶后 Sevag 脱蛋白 3 次，苯酚-硫酸法 490 nm 测定总糖。', qc: 'UV 260/280 nm 无明显核酸与蛋白吸收峰。' },
      { stage: '检识', title: 'HPLC 260 nm 测腺苷与多核苷特征指纹图谱', principle: '磷酸盐缓冲液-甲醇系统 260 nm 同步检出尿苷、鸟苷、腺苷等核苷指纹峰。', operation: '外标法核算腺苷（≥0.010%），对比正品与常见混淆品（如蛹虫草高虫草素特征峰）。', qc: '腺苷理论板数 ≥ 2000，重金属须符合药典限量。' }
    ],
    troubleshoot: [
      { issue: '腺苷峰拖尾或与尿苷分离不佳', cause: '未加磷酸盐缓冲液调节流动相离子强度与 pH。', fix: '采用 pH 6.5 磷酸二氢钾-磷酸氢二钠缓冲液与甲醇 (85:15) 洗脱。' }
    ]
  },

  sinapis_sinigrin: {
    id: 'sinapis_sinigrin',
    isInnovative: true,
    isKbNew: true,
    featured: true,
    sourceTag: '六科知识库 · S-苷杀酶保苷经典',
    herb: '黑芥子 / 白芥子（硫苷 S-苷杀酶保苷）',
    compound: '黑芥子苷 / 芥子碱硫氰酸盐',
    latin: 'Brassica juncea (L.) Czern. et Coss.',
    category: '氰苷类',
    defaultRig: 'reflux',
    applicableRigs: ['reflux', 'ultrasonic', 'hplc', 'tlc'],
    defaultExtract: 'boil_enzyme',
    defaultSep: 'alcohol_precip',
    formulas: ['diffusion', 'qc'],
    defaultCfg: { mass: 50, ratio: 10, temp: 75, time: 45, mesh: '捣碎脱脂(20目)', cycles: '2', solventType: '70%乙醇', ph: '中性热杀酶' },
    limitVal: 0.5,
    limitUnit: '%',
    crudeUnit: 'g',
    mpRef: '黑芥子苷 127~129℃',
    origin: '十字花科芥/白芥干燥成熟种子；温肺豁痰、通络散结，《01 中药化学》第 3 章“糖和苷”中 S-苷（硫苷）唯一代表品种。',
    chemistry: '含硫苷类代表黑芥子苷（芥子油苷）及季铵生物碱芥子碱；种子自带黑芥子酶，遇常温水迅速酶解生成辛辣挥发性异硫氰酸烯丙酯（发泡刺激物），炒制或热醇提可杀酶保苷。',
    pharmacopoeia: '《中国药典》2025 年版规定：芥子（白芥子/黄芥子）含芥子碱硫氰酸盐不得少于 0.50%，黑芥子以硫苷及挥发异硫氰酸酯为特色研究指标。',
    integrative: '与黄芩（O-苷）、苦杏仁（氰苷）并称《中药化学》三大“杀酶保苷”教学模型：冷水捣碎立闻强烈芥末辛辣气（酶解），沸乙醇热提则无辣味且完整保留 S-苷！',
    scaling: { auxName: '石油醚脱脂/70%乙醇', auxFactor: 0.5, auxUnit: 'mL', yieldLow: 0.008, yieldHigh: 0.018, yieldUnit: 'g' },
    tlcSystem: '硅胶 G 板，正丁醇-冰醋酸-水 (4:1:1)，喷 1% 硝酸银或碘化铋钾分别检视硫苷与芥子碱。',
    tlcDefault: { front: 8.0, sample: 3.6, ref: 3.6 },
    steps: [
      { stage: '提取', title: '脱脂后 70% 热乙醇回流杀酶保 S-苷', principle: '先除 25% 脂肪油；热乙醇直接使黑芥子酶变性失活，完整提取黑芥子苷与芥子碱。', operation: '石油醚脱脂后投入预热 75℃ 的 70% 乙醇中回流 45 min（切勿冷水预泡）。', qc: '对比冷水浸泡对照组：冷泡组迅速散出强烈刺激性芥末味！' },
      { stage: '分离', title: '减压浓缩与乙醇沉淀除蛋白', principle: '回收乙醇并沉淀伴生黏液质与水溶蛋白。', operation: '滤液低温减压浓缩，95% 乙醇沉淀静置滤过。', qc: '避免高温久煮导致硫苷热裂解。' },
      { stage: '纯化', title: '离子交换或反相 SPE 净化', principle: '黑芥子苷带硫酸酯负电荷、芥子碱带季铵正电荷，可借离子交换树脂精准分轨纯化。', operation: '取提取液经强酸性/弱碱性离子交换小柱分级洗脱。', qc: '实现 S-苷与生物碱双成分同步分离。' },
      { stage: '检识', title: '酶解气味/沉淀对照 + HPLC 326 nm 测定芥子碱', principle: 'HPLC 326 nm 测芥子碱硫氰酸盐（≥0.50%），227 nm 测黑芥子苷。', operation: '乙腈-0.08 mol/L 磷酸二氢钾溶液 (15:85) 洗脱定量。', qc: '理论板数按芥子碱硫氰酸盐峰计 ≥ 3000。' }
    ],
    troubleshoot: [
      { issue: '提取过程中刺激眼睛流泪、黑芥子苷测不出', cause: '加水润湿或在室温下缓慢升温导致内源黑芥子酶大量分解硫苷。', fix: '干粉直接投入沸腾/75℃ 热乙醇中瞬时灭酶，或先 110℃ 烘炒灭酶。' }
    ]
  },

  hirudo_bioassay: {
    id: 'hirudo_bioassay',
    isInnovative: true,
    isKbNew: true,
    featured: true,
    sourceTag: '六科知识库 · 生物效价评价标杆',
    herb: '水蛭（水蛭素抗凝血酶生物效价）',
    compound: '水蛭素（活性多肽 / 抗凝血酶效价）',
    latin: 'Whitmania pigra Whitman / Hirudo nipponica',
    category: '多糖类',
    defaultRig: 'ultrasonic',
    applicableRigs: ['ultrasonic', 'filter', 'freeze_dry'],
    defaultExtract: 'ultrasonic',
    defaultSep: 'dialysis',
    formulas: ['qc'],
    defaultCfg: { mass: 20, ratio: 10, temp: 25, time: 30, mesh: '细粉(60~80目)', cycles: '1', solventType: '纯化水', ph: '0.9% 生理盐水 pH 7.4' },
    limitVal: 16.0,
    limitUnit: 'U/g',
    crudeUnit: 'U',
    mpRef: '多肽活性成分（>65℃ 热失活）',
    origin: '水蛭科蚂蟥/水蛭干燥全体；破血通经、逐瘀消癥，《06 中药制剂分析》第 8 章“生物效价与生物评价”药典法定第一代表案例！',
    chemistry: '核心药效物质为天然强效凝血酶直接抑制多肽（水蛭素类，65 氨基酸残基，含 3 对二硫键），遇高温、强酸碱或高浓度乙醇即变性失活，无法用单一 HPLC 峰代表全部抗凝活性。',
    pharmacopoeia: '《中国药典》2025 年版规定：水蛭采用抗凝血酶活性生物效价滴定法测定，每 1 g 含抗凝血酶活性不得少于 16.0 U（菲牛蛭/水蛭更高）。',
    integrative: '补齐传统化学成分分析之外的“生物效价测定”维度：生理盐水低温浸提 → 纤维蛋白原-凝血酶体系滴定终点（凝块形成）→ 效价 U/g 核算，并与高温水煮失活组对照验证多肽热敏性。',
    scaling: { auxName: '0.9% NaCl / Tris-HCl 缓冲液', auxFactor: 1.0, auxUnit: 'mL', yieldLow: 16.0, yieldHigh: 45.0, yieldUnit: 'U' },
    tlcSystem: '多肽类采用 SDS-PAGE 凝胶电泳或柱前衍生氨基酸指纹图谱替代常规小分子 TLC。',
    tlcDefault: { front: 8.0, sample: 4.0, ref: 4.0 },
    steps: [
      { stage: '提取', title: '0.9% 生理盐水 25℃ 低温温和浸提保活', principle: '水蛭素为水溶性多肽，等渗生理盐水维持天然空间构象与二硫键完整，忌用热醇。', operation: '精密称取水蛭细粉 1.0 g，加 0.9% 氯化钠溶液 5 mL 充分浸润，室温（25℃）振摇浸提 30 min 后离心取上清。', qc: '全程低温（≤30℃），禁止沸水煎煮或强酸沉淀。' },
      { stage: '分离', title: '低温高速离心与超滤/透析除大分子杂蛋白', principle: '水蛭素分子量约 7 kDa，采用 10 kDa 超滤膜/透析袋可温和去除高分子杂蛋白与色素。', operation: '4℃ 4000 rpm 离心 10 min，取澄清上清液进一步超滤富集。', qc: '上清液清亮，无菌分装冰浴待测。' },
      { stage: '纯化', title: '真空冷冻干燥制备活性冻干粉（可选）', principle: '冻干升华脱水保留多肽 95% 以上抗凝活性，克服常温溶液易降解难题。', operation: '将精制活性液 -40℃ 预冻后真空冻干保存。', qc: '复溶后清澈无沉淀。' },
      { stage: '检识', title: '药典抗凝血酶活性滴定法测效价（U/g）', principle: '取供试液与 0.5% 纤维蛋白原于 37℃ 水浴中，逐滴加入凝血酶标准液至 1 min 内恰好凝固，按消耗凝血酶单位计算抗凝效价。', operation: '精确记录终点滴加凝血酶体积 V，按公式 U = (C₁·V₁) / m 核算每克药材抗凝效价（对比 ≥ 16.0 U/g）。', qc: '设 100℃ 煮沸 15 min 对照管验证热失活现象！' }
    ],
    troubleshoot: [
      { issue: '测得抗凝血酶效价远低于 16.0 U/g', cause: '药材经高温滑石粉烫制过度失活，或凝血酶标准液未按要求现配冰浴保存。', fix: '选用低温烘干/冻干水蛭生品，凝血酶工作液务必临用现配并冰浴保存。' }
    ]
  },

  moschus_muscone: {
    id: 'moschus_muscone',
    isInnovative: true,
    isKbNew: true,
    featured: true,
    sourceTag: '六科知识库 · 动物药 GC 定量典范',
    herb: '人工麝香（麝香酮 GC/GC-MS 测定）',
    compound: '麝香酮（大环酮）',
    latin: 'Moschus Artifactus / Moschus berezovskii',
    category: '挥发油与萜类',
    defaultRig: 'ultrasonic',
    applicableRigs: ['ultrasonic', 'gc', 'tlc'],
    defaultExtract: 'ultrasonic',
    defaultSep: 'solvent_extract',
    formulas: ['qc'],
    defaultCfg: { mass: 10, ratio: 10, temp: 25, time: 20, mesh: '细粉(密闭避挥发)', cycles: '1', solventType: '95%乙醇', ph: '中性密闭' },
    limitVal: 2.0,
    limitUnit: '%',
    crudeUnit: 'mg',
    mpRef: '麝香酮 沸点 328℃（油状液体）',
    origin: '天然麝香与国家一类新药人工麝香；开窍醒神、活血通经，代表《05 仪器分析》气相色谱（GC-FID / GC-MS）与《01 中药化学》动物药大环酮经典案例。',
    chemistry: '核心香气与药效成分为 (R)-(-)-3-甲基环十五烷酮（麝香酮，15 元大环酮），具强挥发性、亲脂性，无明显紫外发色团，必须采用 GC 或 GC-MS 测定。',
    pharmacopoeia: '《中国药典》2025 年版规定：天然麝香含麝香酮不得少于 2.0%（毛细管气相色谱 FID 检测器内标/外标法）。',
    integrative: '典型“无紫外吸收挥发性成分选型教学”：解释为何 HPLC-UV 测不了麝香酮、为何选用 DB-1/HP-5 毛细管柱程序升温 GC-FID，并配套手性 GC 鉴别天然左旋 vs 外消旋体思路。',
    scaling: { auxName: '无水乙醇/正己烷', auxFactor: 1.0, auxUnit: 'mL', yieldLow: 0.02, yieldHigh: 0.04, yieldUnit: 'g' },
    tlcSystem: '硅胶 G 板，石油醚(60~90℃)-乙酸乙酯 (9:1)，喷 2,4-二硝基苯肼试液显亮橙黄色腙斑点。',
    tlcDefault: { front: 8.0, sample: 6.2, ref: 6.2 },
    steps: [
      { stage: '提取', title: '无水乙醇密闭低温超声快速浸提', principle: '麝香酮易挥发且易溶于无水乙醇，具塞密闭瓶室温超声 20 min 即可完全溶出。', operation: '精密称取人工麝香（教学示例）0.1 g 置具塞锥形瓶，精密加无水乙醇 10 mL 密塞超声 20 min。', qc: '严禁开口加热回流以免麝香酮挥发损失！' },
      { stage: '分离', title: '离心微滤制备 GC 进样液', principle: '去除蛋白质、无机盐等不挥发基质，防止污染 GC 进样口衬管与毛细管柱。', operation: '静置离心取上清过 0.22 μm 有机系滤膜，装入棕色进样小瓶封盖。', qc: '进样垫密封良好防溶剂挥发浓缩误差。' },
      { stage: '纯化', title: '手性色谱与 GC-MS 真伪特征离子比对（拓展）', principle: '天然麝香酮为单一 (R)-(-)-异构体，MS 分子离子 m/z 238、基峰 m/z 85/223。', operation: '对比标准谱库 NIST 匹配度，排查掺伪合成酮。', qc: '匹配度 ≥ 95%，手性比符合标准。' },
      { stage: '检识', title: '2,4-二硝基苯肼羰基显色 + 毛细管 GC-FID 定量', principle: '酮羰基与 2,4-DNP 显橙黄；HP-5/DB-1 柱 200℃ 恒温或程序升温，FID 高线性响应定量。', operation: '进样 1 μL，分流比 10:1，外标法核算麝香酮含量（≥2.0%）。', qc: '系统适用性理论板数 ≥ 10000，RSD ≤ 2.0%。' }
    ],
    troubleshoot: [
      { issue: 'GC 测定结果逐针升高、RSD 超标', cause: '无水乙醇在进样小瓶穿刺后挥发，导致瓶内麝香酮浓缩。', fix: '使用高密封 PTFE 隔垫，配置内标（如正十八烷）抵消进样与挥发误差。' }
    ]
  },

  epimedium_icariin_process: {
    id: 'epimedium_icariin_process',
    isInnovative: true,
    isKbNew: true,
    featured: true,
    sourceTag: '六科知识库 · 羊脂油炙炮制增效',
    herb: '淫羊藿（羊脂油炙促进朝藿定 C/宝藿苷Ⅰ转化）',
    compound: '淫羊藿苷 / 朝藿定 C / 宝藿苷Ⅰ',
    latin: 'Epimedium brevicornu Maxim.',
    category: '黄酮',
    defaultRig: 'reflux',
    applicableRigs: ['reflux', 'macroporous', 'hplc', 'tlc'],
    defaultExtract: 'reflux',
    defaultSep: 'macroporous',
    formulas: ['diffusion', 'qc'],
    defaultCfg: { mass: 50, ratio: 12, temp: 80, time: 60, mesh: '丝段(炮制对照)', cycles: '2', solventType: '70%乙醇', ph: '中性防酸水解' },
    limitVal: 0.5,
    limitUnit: '%',
    crudeUnit: 'g',
    mpRef: '淫羊藿苷 231~233℃',
    origin: '小檗科淫羊藿干燥叶；补肾阳、强筋骨，《中药化学》异戊烯基黄酮苷与“羊脂油炙自组装胶束增溶促吸收”现代炮制机制标杆案例。',
    chemistry: '主含 8-异戊烯基黄酮苷（朝藿定 A/B/C、淫羊藿苷、宝藿苷Ⅰ）；羊脂油炙加热使多糖苷部分脱糖转化为更易吸收的次级苷宝藿苷Ⅰ，且羊脂油脂肪酸形成自组装纳米胶束显著提升肠道生物利用度。',
    pharmacopoeia: '《中国药典》2025 年版规定：淫羊藿含淫羊藿苷不得少于 0.50%（朝鲜淫羊藿等另控朝藿定 A/B/C 与淫羊藿苷四指标总和 ≥ 1.3%）。',
    integrative: '串联《01 中药化学》（异戊烯基黄酮）、《02 中药制剂》（自组装胶束增溶）与《06 制剂分析》（QAMS 一测多评同时测定朝藿定 A/B/C + 淫羊藿苷 + 宝藿苷Ⅰ）的典范课题！',
    scaling: { auxName: '羊脂油(20%)/D101树脂', auxFactor: 0.2, auxUnit: 'g', yieldLow: 0.008, yieldHigh: 0.018, yieldUnit: 'g' },
    tlcSystem: '硅胶 H 板，乙酸乙酯-丁酮-甲酸-水 (10:1:1:1)，喷 1% AlCl₃ 乙醇液 UV 365 nm 下显亮黄色荧光。',
    tlcDefault: { front: 8.0, sample: 4.4, ref: 4.4 },
    steps: [
      { stage: '提取', title: '生品 vs 羊脂油炙品 70% 乙醇平行回流', principle: '70% 乙醇兼顾多糖基朝藿定与低极性宝藿苷Ⅰ的同步提取。', operation: '生淫羊藿与炙淫羊藿各 25 g，分别加 12 倍量 70% 乙醇 80℃ 回流 60 min。', qc: '对比炙品与生品的次级苷宝藿苷Ⅰ增量。' },
      { stage: '分离', title: '浓缩除醇与大孔树脂梯度分离', principle: 'AB-8 树脂 50%~70% 乙醇段富集异戊烯基总黄酮，水洗除去水溶杂糖。', operation: '除醇后上 AB-8 树脂柱，依次水洗、30% 乙醇除杂、70% 乙醇洗脱收集。', qc: '总黄酮纯度可达 50% 以上。' },
      { stage: '纯化', title: 'QAMS 一测多评相对校正因子核算（方法学训练）', principle: '以易得的淫羊藿苷为内参物，通过相对校正因子 fₖ 同步计算朝藿定 A/B/C 与宝藿苷Ⅰ含量，大幅节约对照品成本。', operation: '记录 270 nm 下 5 个异戊烯基黄酮峰面积，套用 QAMS 公式换算各成分含量。', qc: 'QAMS 法与外标法相对误差应 ≤ 3%。' },
      { stage: '检识', title: '盐酸-镁粉 + AlCl₃ 荧光 + HPLC 270 nm 多指标定量', principle: '异戊烯基黄酮具经典黄酮显色与 270 nm 特征吸收。', operation: '乙腈-水梯度洗脱测定淫羊藿苷与朝藿定群，核对 2025 药典限度。', qc: '生/炙品五峰比例变化清晰可辨。' }
    ],
    troubleshoot: [
      { issue: '朝藿定 A/B/C 与淫羊藿苷四峰重叠难分离', cause: '等度洗脱分离度不足，或流动相未用乙腈体系。', fix: '使用 C18 柱以乙腈-0.1% 甲酸水慢梯度洗脱（24%→28% 乙腈 30 min）。' }
    ]
  },

  dioscorea_qams_demo: {
    id: 'dioscorea_qams_demo',
    isInnovative: true,
    isKbNew: true,
    featured: true,
    sourceTag: '六科知识库 · 丹参/复方 QAMS 一测多评',
    herb: '复方丹参滴丸/片（QAMS 一测多评与溶出评价）',
    compound: '丹参酮ⅡA / 丹酚酸 B / 三七皂苷 R1 / 冰片',
    latin: 'Compound Danshen Preparation (ChP 2025)',
    category: '蒽醌与醌类',
    defaultRig: 'hplc',
    applicableRigs: ['hplc', 'ultrasonic', 'gc', 'tlc'],
    defaultExtract: 'ultrasonic',
    defaultSep: 'macroporous',
    formulas: ['qc', 'diffusion'],
    defaultCfg: { mass: 20, ratio: 10, temp: 35, time: 30, mesh: '制剂研细(80目)', cycles: '1', solventType: '70%乙醇', ph: '中性避光' },
    limitVal: 0.2,
    limitUnit: 'mg/片',
    crudeUnit: 'mg',
    mpRef: '复方多指标质控标杆制剂',
    origin: '丹参 + 三七 + 冰片经典复方制剂；串联全部六大学科（化学→滴丸/片剂制剂→双提工艺→误差统计→HPLC/GC 仪器分析→制剂多指标/QAMS/溶出度分析）的终极综合实战课题！',
    chemistry: '复方涵盖四大类成分：亲脂菲醌（丹参酮ⅡA/隐丹参酮）、水溶酚酸（丹酚酸 B/丹参素）、皂苷（三七皂苷 R1/Rg1/Rb1）与挥发单萜（冰片/龙脑），性质跨度极大。',
    pharmacopoeia: '《中国药典》2025 年版一部收载复方丹参片与复方丹参滴丸：分轨采用 HPLC-UV 测丹参酮ⅡA 与丹酚酸 B、HPLC-203nm/ELSD 测三七皂苷群、GC-FID 测冰片。',
    integrative: '点击正文 🧬 丹参酮ⅡA 查看 3D 分子；一站式演练《02 中药制剂》滴丸 PEG 固体分散体溶出优势、《05 仪器分析》多检测器选型与《06 制剂分析》多指标 QAMS 质控闭环！',
    scaling: { auxName: '75% 甲醇 / 乙酸乙酯', auxFactor: 1.0, auxUnit: 'mL', yieldLow: 0.2, yieldHigh: 5.0, yieldUnit: 'mg' },
    tlcSystem: '分三块薄层板分别鉴别丹参（丹参酮ⅡA/丹酚酸 B）、三七（Rg1/Rb1/R1）与冰片（龙脑）。',
    tlcDefault: { front: 8.0, sample: 5.1, ref: 5.1 },
    steps: [
      { stage: '提取', title: '分轨前处理：75% 甲醇提酚酸/菲醌/皂苷 + 乙酸乙酯提冰片', principle: '复方成分极性与挥发性跨度大，需按《06 制剂分析》前处理原则分轨定量提取。', operation: '精密称取研细片粉/滴丸，分别用 75% 甲醇避光超声（供 HPLC）与乙酸乙酯超声（供 GC 测冰片）。', qc: '丹参酮供试液全程使用棕色容量瓶避光！' },
      { stage: '分离', title: '制剂溶出度/崩解时限对比（滴丸 PEG 基质 vs 常规片剂）', principle: '滴丸采用 PEG4000/6000 水溶性固体分散体基质，5~15 min 快速溶散释放，显著快于普通片剂。', operation: '按药典通则 0931 浆法（37℃, 50 rpm）对比 5/15/30/45 min 累积溶出曲线并计算 f₂ 相似因子。', qc: 'f₂ ≥ 50 判定两条溶出曲线相似。' },
      { stage: '纯化', title: 'QAMS 一测多评与多检测器联用方案设计', principle: '以丹参酮ⅡA 为内参同步测隐丹参酮/丹参酮Ⅰ（270 nm）；三七皂苷用 203 nm 乙腈梯度；冰片用 GC-FID。', operation: '建立三套方法学验证表（线性 R² ≥ 0.999、精密度 RSD ≤ 2%、加样回收率 95%~105%）。', qc: '全检项覆盖鉴别、重量差异、崩解、微生物与含量。' },
      { stage: '检识', title: '综合质量标准草案输出与指纹图谱相似度评价', principle: '整合 10 批样品生成对照指纹图谱，建立“多指标定量 + 指纹图谱整体控质”现代中药质量标准。', operation: '比对 2025 版药典限度并生成完整制剂分析报告。', qc: '指纹图谱相似度 ≥ 0.90，三味君臣佐药均实现专属性质控！' }
    ],
    troubleshoot: [
      { issue: '同一针 HPLC 无法同时测出冰片与丹参酮', cause: '冰片为饱和双环单萜醇，无共轭双键，在常规紫外检测器下几乎无吸收。', fix: '严格按《05 仪器分析》选型逻辑：冰片改用毛细管 GC-FID 测定。' }
    ]
  }
};

export const V27_LITERATURE = [
  { cat: '药典教材', text: '国家药典委员会. 中华人民共和国药典（2025 年版一部 & 四部通则）[S]. 北京: 中国医药科技出版社, 2025.（2025 年 10 月 1 日施行）' },
  { cat: '药典教材', text: '中药学六大学科知识库编研组. 中药学六大学科知识库（中药化学/中药制剂/制药工艺/分析化学/仪器分析/制剂分析六分册）[Z]. 2026.' },
  { cat: '中药化学', text: '吴立军, 冯卫生. 中药化学（全国中医药行业“十四五”规划教材）[M]. 北京: 中国中医药出版社, 2021.' },
  { cat: '药企中试', text: '国家药品监督管理局（NMPA）. 中药注册分类及申报资料要求 & “三结合”中药注册审评证据体系指导原则[Z]. 2020-2025.' },
  { cat: '高校实验', text: '王智民, 等. 一测多评法（QAMS）在中药多指标质量评价中的应用规范与相对校正因子研究[J]. 中国中药杂志, 2018, 43(12): 2421-2428.' },
  { cat: '中西医结合', text: '附子炮制水解减毒机制（双酯型→单酯型二萜生物碱）与淫羊藿羊脂油炙自组装胶束促吸收研究进展[J]. 中草药, 2022, 53(16): 5180-5190.' }
];

export const V27_UNIV_CASES = [
  { univ: '成都中医药大学 · 炮制与中药化学', type: '高校实验', title: '附子久煎减毒动力学：双酯型乌头碱向单酯型定量转化曲线测定', summary: '对比生附子与黑顺片在 30/60/120 min 沸水煎煮下的 6 种乌头生物碱 HPLC 谱图变化，直观量化炮制减毒存效机制。', topicId: 'aconite_process' },
  { univ: '上海中医药大学 · 中药标准化平台', type: '国家平台', title: '复方丹参制剂多检测器联用与 QAMS 一测多评全链路质控', summary: '综合运用 HPLC-UV、HPLC-203nm、GC-FID 与溶出度 f₂ 评价，建立覆盖丹参/三七/冰片三味药的现代制剂质量标准。', topicId: 'dioscorea_qams_demo' },
  { univ: '中国药科大学 · 中药制剂教研室', type: '高校实验', title: '水飞蓟宾 PVP K30 固体分散体增溶与 45 min 溶出度对比', summary: '将中药化学难溶黄酮木脂素转化为无定形固体分散体，打通成分极性→制剂成型→溶出评价完整学科链。', topicId: 'silybum_silybin' },
  { univ: '中国食品药品检定研究院（中检院）', type: '国家平台', title: '水蛭抗凝血酶生物效价滴定法（U/g）与多肽热失活对照', summary: '演练《中国药典》2025 年版动物多肽类药材生物效价法，补齐小分子化学定量之外的生物评价维度。', topicId: 'hirudo_bioassay' }
];

if (typeof window !== 'undefined') {
  window.TCM_V27_KB_DATA = Object.freeze({
    V27_PRESETS,
    V27_LITERATURE,
    V27_UNIV_CASES
  });
}
