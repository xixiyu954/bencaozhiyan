/* 本草智研 · 产业转化训练 · 知识库
 * 收录：法规节点、研发路径、标杆项目（丹参 / 黄芩 / 薄荷 / 延胡索）、剂型规则、偏差调查场景、稳定性方案与证据成熟度。
 * 每条数据均带来源类型：pharm 药典标准 / reg 法规文件 / lit 文献教材 / calc 平台演算 / example 示例数据 / user 用户实测。
 */
(function () {
  'use strict';

  const SOURCES = {
    pharm: { label: '药典标准', tone: 'pharm', tip: '《中国药典》2025 年版相关正文或通则；引用前请以正文原文核对。' },
    reg: { label: '法规文件', tone: 'reg', tip: '国家药监局发布的规章、公告或技术指导原则；以官方原文为准。' },
    lit: { label: '文献教材', tone: 'lit', tip: '来自教材或公开文献的常用参数或趋势，适用条件以原文为准。' },
    calc: { label: '平台演算', tone: 'calc', tip: '按简化模型推算的教学参考值，不能替代实测数据。' },
    example: { label: '示例数据', tone: 'example', tip: '用于演示计算流程的假设数据，请替换为你的实测结果。' },
    user: { label: '用户实测', tone: 'user', tip: '由你录入的实验数据。' },
    ai: { label: '智能建议', tone: 'ai', tip: '由智能助手生成的建议，须人工核实后使用。' }
  };

  const REGS = [
    {
      id: 'chp2025',
      name: '《中华人民共和国药典》2025 年版',
      node: '国家药监局、国家卫生健康委 2025 年第 29 号公告颁布，自 2025 年 10 月 1 日起施行；实施事宜见 2025 年第 32 号公告。',
      use: '药材、饮片、制剂的质量标准与通则（水分、灰分、残留溶剂、重金属、微生物限度、稳定性试验指导原则等）。',
      url: 'https://www.chp.org.cn/#/newsDetail?id=6dc62081-28e9-42b0-8730-0c9fb0985873'
    },
    {
      id: 'tcmreg2023',
      name: '《中药注册管理专门规定》',
      node: '2023 年 2 月 10 日发布，自 2023 年 7 月 1 日起施行。',
      use: '中医药理论、人用经验和临床试验相结合的审评证据体系；强调临床价值与全过程质量控制。',
      url: 'https://www.nmpa.gov.cn/xxgk/zhcjd/zhcjdyp/20230210173935194.html'
    },
    {
      id: 'tcmprod2025',
      name: '《中药生产监督管理专门规定》',
      node: '国家药监局 2025 年第 79 号公告发布，自 2026 年 3 月 1 日起施行。',
      use: '关键工艺参数、工艺验证、收率范围、偏差调查、质量回顾与全过程追溯。',
      url: 'https://www.nmpa.gov.cn/xxgk/fgwj/xzhgfxwj/20250908094819150.html'
    },
    {
      id: 'tcmclass2020',
      name: '《中药注册分类及申报资料要求》',
      node: '国家药监局 2020 年第 68 号通告。',
      use: '中药创新药、改良型新药、古代经典名方中药复方制剂、同名同方药四类注册分类与申报资料要求。',
      url: 'https://www.nmpa.gov.cn/'
    }
  ];

  const STAGES = [
    { id: 'position', no: '01', name: '产品定位', short: '定位', desc: '明确研发路径、临床需求、适用人群、剂型与给药途径。', output: '产品目标与研发路径卡' },
    { id: 'herb', no: '02', name: '药材与炮制', short: '炮制', desc: '基原与产地质控，生品／制品对照，观察成分转化与收率变化。', output: '炮制工艺卡、成分变化图' },
    { id: 'extract', no: '03', name: '提取纯化', short: '提取', desc: '多路线对比，从“提取率最优”转向“综合工艺最优”。', output: '工艺路线综合评价表' },
    { id: 'dry', no: '04', name: '浓缩干燥', short: '干燥', desc: '温度、时间与方式对热敏成分保留和粉体性质的影响。', output: '浓缩干燥条件对比' },
    { id: 'form', no: '05', name: '制剂成型', short: '制剂', desc: '剂型选择决策、辅料与小试处方、包材与工艺流程。', output: '小试处方单、制剂工艺流程' },
    { id: 'quality', no: '06', name: '质量评价', short: '质量', desc: '分级质控、三批一致性、稳定性方案、药效与安全评价设计。', output: '质量标准草案、批次对比报告' },
    { id: 'scale', no: '07', name: '中试放大', short: '放大', desc: '物料衡算、设备与时间非线性放大、偏差调查。', output: '放大核算表、物料平衡、偏差记录' },
    { id: 'register', no: '08', name: '注册与转化', short: '转化', desc: '研发路线图、证据成熟度、阶段评审、成本与风险。', output: '研发路线图、阶段评审清单' }
  ];

  const EVIDENCE_LEVELS = [
    { lv: 0, name: '未开展', color: '#94a3b8' },
    { lv: 1, name: '文献／理论支撑', color: '#f59e0b' },
    { lv: 2, name: '小试数据', color: '#0ea5e9' },
    { lv: 3, name: '三批小试／放大数据', color: '#10b981' },
    { lv: 4, name: '中试／验证数据', color: '#047857' }
  ];

  // ---------------- 研发路径 ----------------
  const PATHS = [
    {
      id: 'innovative', name: '中药创新药', cat: '注册分类 1 类', reg: '《中药注册分类及申报资料要求》《中药注册管理专门规定》',
      fit: '处方未在国家药品标准中收载、具有明确临床价值的新处方制剂（含来源于名老中医经验方、医疗机构制剂的处方）。',
      core: ['以临床价值为导向，明确适应症与目标人群', '采用中医药理论、人用经验和临床试验相结合的证据体系', '药学研究需建立全过程质量控制，关注质量传递', '需完成非临床药理毒理研究与临床试验'],
      evidence: { theory: 3, human: 2, clinical: 3 },
      tasks: {
        pharm: ['处方药味基原、药用部位与产地确定', '饮片炮制与质量标准', '制备工艺研究与关键工艺参数', '中间体与制剂质量标准（含指纹／特征图谱、多指标含量）', '稳定性研究', '中试放大与三批工艺验证计划'],
        tox: ['主要药效学研究', '安全药理学', '单次与重复给药毒性', '必要时开展遗传毒性、生殖毒性等'],
        clinical: ['人用经验收集与整理（如有）', 'Ⅰ期耐受性研究', 'Ⅱ期剂量探索与概念验证', 'Ⅲ期确证性研究'],
        prod: ['商业规模工艺验证', '关键工艺参数与收率范围确定', '偏差与变更管理体系'],
        file: ['临床试验申请（IND）', '上市许可申请（NDA）']
      },
      caution: '路径最长、投入最大，适合有明确临床需求和人用经验基础的项目。'
    },
    {
      id: 'improved', name: '中药改良型新药', cat: '注册分类 2 类', reg: '《中药注册分类及申报资料要求》',
      fit: '改变已上市中药的给药途径、剂型、工艺或辅料等，且具有临床应用优势和特点。',
      core: ['改良目的明确，需说明临床优势（依从性、起效、安全性等）', '与原剂型／原工艺开展对比研究，说明物质基础变化', '质量标准不低于原品种', '根据改变程度确定非临床与临床研究要求'],
      evidence: { theory: 2, human: 2, clinical: 2 },
      tasks: {
        pharm: ['原品种工艺与质量现状分析', '改良工艺／剂型研究', '改良前后物质基础对比（指纹图谱、多指标）', '质量标准与稳定性研究'],
        tox: ['根据改变情况开展桥接性药效或毒理研究'],
        clinical: ['根据改良类型开展必要的临床研究，证明临床优势'],
        prod: ['新工艺放大与验证'],
        file: ['按注册分类提交申报资料']
      },
      caution: '“改剂型”本身不等于临床优势，需有数据证明改良价值。'
    },
    {
      id: 'classic', name: '古代经典名方中药复方制剂', cat: '注册分类 3 类', reg: '《中医药法》《中药注册分类及申报资料要求》《古代经典名方目录》',
      fit: '来源于古代经典名方的复方制剂。3.1 类为按《古代经典名方目录》管理的品种；3.2 类为其他来源于古代经典名方的中药复方制剂。',
      core: ['处方、炮制、剂量、用法与古籍记载对应，需开展关键信息考证', '以对应实物（基准样品）为标准，研究制剂与对应实物的质量一致性', '3.1 类实施简化注册审批，需提供药学及非临床安全性研究资料', '3.2 类以人用经验为重要证据，具体资料要求以官方文件为准'],
      evidence: { theory: 3, human: 3, clinical: 1 },
      tasks: {
        pharm: ['古籍文献与关键信息考证', '对应实物（基准样品）制备与研究', '制剂工艺与对应实物的质量一致性（出膏率、指纹图谱、转移率）', '质量标准与稳定性研究'],
        tox: ['非临床安全性研究'],
        clinical: ['人用经验资料整理（3.2 类）'],
        prod: ['工艺放大与质量一致性验证'],
        file: ['按 3.1 或 3.2 类提交申报资料']
      },
      caution: '质量一致性是核心：以对应实物为标尺，而不是以提取率最高为目标。'
    },
    {
      id: 'same', name: '同名同方药', cat: '注册分类 4 类', reg: '《中药注册分类及申报资料要求》',
      fit: '通用名称、处方、剂型、功能主治、用法及日用饮片量与已上市中药相同的制剂。',
      core: ['选择合适的同名同方已上市中药作为对照', '安全性、有效性、质量可控性不低于对照药', '开展与对照药的质量对比研究', '根据对照药情况判断是否需开展临床试验'],
      evidence: { theory: 1, human: 2, clinical: 2 },
      tasks: {
        pharm: ['对照药选择与多批次质量研究', '工艺研究与质量对比', '质量标准与稳定性'],
        tox: ['必要时开展非临床对比研究'],
        clinical: ['必要时开展临床对比研究'],
        prod: ['工艺放大与验证'],
        file: ['按注册分类提交申报资料']
      },
      caution: '关键在于“不低于”对照药，需要系统的多批次对比数据。'
    },
    {
      id: 'hospital', name: '医疗机构中药制剂', cat: '省级药监部门审批／备案', reg: '《药品管理法》及省级医疗机构制剂管理规定；传统工艺制剂备案管理相关公告',
      fit: '医疗机构根据本单位临床需要配制、自用的固定处方制剂，常作为创新药的人用经验来源。',
      core: ['由省级药品监管部门审批；仅应用传统工艺配制的中药制剂实行备案管理', '原则上仅限本医疗机构使用，调剂使用需经批准', '需具备相应配制条件与质量检验能力', '规范记录临床使用情况，可积累人用经验'],
      evidence: { theory: 2, human: 3, clinical: 1 },
      tasks: {
        pharm: ['处方与配制工艺研究', '质量标准制定', '稳定性考察'],
        tox: ['按要求提供安全性资料'],
        clinical: ['规范收集临床使用数据（人用经验）'],
        prod: ['制剂室配制规程与批记录'],
        file: ['省级注册申请或传统工艺制剂备案']
      },
      caution: '适合医院制剂室项目；规范积累的人用经验是后续转化为新药的重要依据。'
    },
    {
      id: 'granule', name: '中药配方颗粒', cat: '省级备案管理', reg: '国家药监局等四部门结束中药配方颗粒试点工作的公告（2021 年）及配套技术要求',
      fit: '由单味饮片经水提取、分离、浓缩、干燥、制粒而成，供中医临床按处方调配使用。',
      core: ['执行中药配方颗粒国家药品标准，无国家标准的执行省级标准', '以标准汤剂为对照，控制出膏率、含量转移率与特征图谱', '实施全过程质量控制与追溯', '生产企业向所在地省级药监部门备案'],
      evidence: { theory: 1, human: 2, clinical: 0 },
      tasks: {
        pharm: ['标准汤剂制备与研究（多批次饮片）', '工艺研究：提取、浓缩、干燥、制粒', '出膏率、转移率与特征图谱一致性', '质量标准与稳定性'],
        tox: [],
        clinical: [],
        prod: ['商业规模生产与全过程追溯'],
        file: ['省级药监部门备案']
      },
      caution: '核心指标是与标准汤剂的一致性，而非追求更高提取率。'
    },
    {
      id: 'change', name: '已上市中药工艺改进', cat: '上市后药学变更', reg: '《已上市中药药学变更研究技术指导原则（试行）》',
      fit: '已上市中药的生产工艺、设备、批量、辅料、包材等发生变更。',
      core: ['评估变更对物质基础和质量的影响', '按重大／中等／微小变更分级，分别进行补充申请、备案或年度报告', '开展变更前后对比研究', '必要时开展稳定性、药效或安全性桥接研究'],
      evidence: { theory: 1, human: 1, clinical: 1 },
      tasks: {
        pharm: ['变更风险评估与分级', '变更前后多批次质量对比', '稳定性对比研究'],
        tox: ['重大变更时评估桥接研究需求'],
        clinical: ['必要时开展临床研究'],
        prod: ['变更后工艺验证'],
        file: ['补充申请／备案／年度报告']
      },
      caution: '变更越大，对比研究越完整；以“质量不降低”为底线。'
    },
    {
      id: 'food', name: '药食同源产品', cat: '食品监管范畴', reg: '《食品安全法》及《按照传统既是食品又是中药材的物质目录》',
      fit: '使用目录内物质开发的普通食品；如需声称保健功能，需按保健食品注册或备案。',
      core: ['原料须在既是食品又是中药材的物质目录内，并符合使用条件与限量', '按食品安全国家标准生产与检验', '普通食品不得声称疾病预防、治疗功能', '保健食品需按规定注册或备案后方可声称保健功能'],
      evidence: { theory: 1, human: 1, clinical: 0 },
      tasks: {
        pharm: ['原料合规性核查', '配方与工艺研究', '产品标准与检验（含污染物、微生物）', '保质期研究'],
        tox: ['按食品安全要求评估'],
        clinical: [],
        prod: ['食品生产许可与过程控制'],
        file: ['食品生产许可；保健食品注册／备案（如适用）']
      },
      caution: '这是食品而非药品，宣传与标签不得涉及治疗功效。'
    }
  ];

  // ---------------- 剂型规则 ----------------
  const DOSAGE_FORMS = [
    { id: 'granule', name: '颗粒剂', route: 'oral', ref: '通则 0104', unit: 1.0, unitLabel: '袋（1 g）', steps: ['浸膏粉／清膏', '加辅料混合', '湿法制粒（乙醇润湿）', '干燥（≤60 ℃）', '整粒', '分装（复合膜）'], qc: ['粒度', '水分（中药颗粒剂不得过 8.0%）', '溶化性', '装量差异', '微生物限度'], pros: '载药量大、便于调整剂量、儿童老人易服', cons: '吸湿结块风险，需防潮包材；苦味明显' },
    { id: 'capsule', name: '硬胶囊', route: 'oral', ref: '通则 0103', unit: 0.45, unitLabel: '粒（0 号约 0.45 g）', steps: ['浸膏粉', '加稀释剂／润滑剂', '制粒或直接混合', '填充 0 号胶囊', '抛光', '铝塑包装'], qc: ['水分（中药硬胶囊内容物不得过 9.0%）', '装量差异', '崩解时限', '微生物限度'], pros: '掩盖苦味、剂量准确、工艺成熟', cons: '日服粒数多时依从性差；吸湿内容物会使囊壳变软' },
    { id: 'tablet', name: '片剂（薄膜衣）', route: 'oral', ref: '通则 0101', unit: 0.5, unitLabel: '片（约 0.5 g）', steps: ['浸膏粉', '加辅料制粒', '干燥整粒', '压片', '薄膜包衣', '包装'], qc: ['重量差异', '崩解时限', '脆碎度', '硬度', '微生物限度'], pros: '成本低、稳定性好、便于携带', cons: '浸膏粘性大时压片困难；载药量受限' },
    { id: 'pill', name: '滴丸', route: 'oral', ref: '通则 0108', unit: 0.035, unitLabel: '丸（约 35 mg）', steps: ['提取物', '与 PEG 类基质熔融混合', '滴制', '冷凝成丸', '去冷凝液', '包装'], qc: ['重量差异', '溶散时限', '含量均匀度', '微生物限度'], pros: '固体分散可提高难溶成分溶出，可舌下给药起效快', cons: '载药量小，适合高效部位或单体，日剂量大时不适用' },
    { id: 'softcap', name: '软胶囊', route: 'oral', ref: '通则 0103', unit: 0.5, unitLabel: '粒（约 0.5 g）', steps: ['挥发油／脂溶性提取物', '与植物油混悬或溶解', '压制成丸', '定型干燥', '包装'], qc: ['装量差异', '崩解时限', '囊壳完整性', '微生物限度'], pros: '适合油性、易挥发、易氧化成分', cons: '不适合水溶性浸膏；需专用生产线' },
    { id: 'liquid', name: '口服液（合剂）', route: 'oral', ref: '合剂相关通则', unit: 10, unitLabel: '支（10 mL）', steps: ['提取液', '浓缩', '醇沉或静置澄清', '配液（矫味、防腐）', '灌封', '灭菌'], qc: ['相对密度', 'pH 值', '装量', '澄清度／沉淀', '微生物限度'], pros: '吸收快、适合儿童与吞咽困难者', cons: '稳定性与沉淀问题突出，运输储存成本高' },
    { id: 'gel', name: '凝胶剂（外用）', route: 'topical', ref: '通则 0114', unit: 1, unitLabel: 'g', steps: ['提取物', '溶解或分散', '加入凝胶基质（卡波姆等）', '中和调 pH', '灌装'], qc: ['粒度（混悬型）', 'pH 值', '装量', '微生物限度'], pros: '局部给药、无首过效应、使用感好', cons: '透皮量有限，需研究渗透性' },
    { id: 'patch', name: '贴剂（外用）', route: 'topical', ref: '通则 0121', unit: 1, unitLabel: '贴', steps: ['提取物', '与压敏胶混合', '涂布', '干燥', '复合背衬与防粘层', '分切包装'], qc: ['含量均匀度', '释放度', '粘附力', '微生物限度'], pros: '长效平稳、依从性好', cons: '工艺与设备要求高，需评估皮肤刺激性' }
  ];

  // ---------------- 稳定性（《中国药典》9001 原料药物与制剂稳定性试验指导原则） ----------------
  const STABILITY = [
    { type: '影响因素试验', cond: '高温 60 ℃', time: '0、5、10 天', note: '考察热敏成分降解趋势' },
    { type: '影响因素试验', cond: '高湿 25 ℃、RH 90%±5%', time: '0、5、10 天', note: '考察吸湿增重、结块与含量' },
    { type: '影响因素试验', cond: '强光 4500 lx±500 lx', time: '0、5、10 天', note: '考察光敏成分（如醌类）变化' },
    { type: '加速试验', cond: '40 ℃±2 ℃、RH 75%±5%', time: '0、1、2、3、6 个月', note: '用于初步预测有效期' },
    { type: '长期试验', cond: '25 ℃±2 ℃、RH 60%±5%（或 30 ℃±2 ℃、RH 65%±5%）', time: '0、3、6、9、12、18、24、36 个月', note: '确定有效期的主要依据' }
  ];

  // ---------------- 偏差调查场景 ----------------
  const DEVIATIONS = [
    {
      id: 'raw', title: '原料产地或批次变化', phenomenon: '更换药材批次后，指标成分含量或浸膏得率明显波动。',
      clues: [
        { id: 'c1', text: '本批药材来自新产地或新供应商' },
        { id: 'c2', text: '药材入厂检验含量处于标准下限附近' },
        { id: 'c3', text: '药材外观（色泽、断面）与以往批次不同' },
        { id: 'c4', text: '同一批药材多次投料结果都偏低' },
        { id: 'c5', text: '仅一次投料异常，其余正常' }
      ],
      causes: [
        { text: '药材基原、产地或采收期差异导致成分含量本底不同', base: 2, w: { c1: 3, c2: 3, c3: 2, c4: 2 }, check: ['药材入厂检验报告与留样', '供应商、产地与采收期记录', '近 6 批药材含量趋势'], verify: ['新旧批药材平行对照提取', '药材 TLC／指纹图谱比对基原'], action: ['建立药材分级与产地准入标准', '按含量折算投料或批间勾兑（需验证）'] },
        { text: '贮藏不当导致药材变质（受潮、虫蛀、成分降解）', base: 1, w: { c3: 2, c4: 1 }, check: ['仓储温湿度记录', '药材水分与性状复检'], verify: ['留样与在库药材含量对比'], action: ['完善仓储条件与养护制度'] },
        { text: '取样不具代表性或检验误差', base: 1, w: { c5: 3 }, check: ['取样方案与样品量', '检验原始记录、系统适用性'], verify: ['重新取样复检'], action: ['按规范增加取样点与样品量'] }
      ]
    },
    {
      id: 'moisture', title: '水分、粒度和投料折干差异', phenomenon: '投料量相同，但按干品计的收率与含量出现系统性偏差。',
      clues: [
        { id: 'c1', text: '投料未按水分折干计算' },
        { id: 'c2', text: '雨季或药材存放时间较长' },
        { id: 'c3', text: '粉碎设备或筛网更换过' },
        { id: 'c4', text: '提取液过滤明显变慢' }
      ],
      causes: [
        { text: '未按干品折算投料，药材含水量变化带入偏差', base: 2, w: { c1: 4, c2: 2 }, check: ['投料前药材水分测定记录', '投料计算单'], verify: ['同批药材测水分后按干品重算收率'], action: ['投料规程中强制按干品折算'] },
        { text: '粉碎粒度变化影响浸润和扩散', base: 1, w: { c3: 3, c4: 2 }, check: ['粒度分布（过筛率）记录', '设备变更记录'], verify: ['不同粒度对比提取试验'], action: ['规定粒度范围并纳入过程控制'] },
        { text: '粒度过细导致过滤困难、药渣吸液增加', base: 1, w: { c4: 3, c3: 1 }, check: ['滤液体积与药渣含液量'], verify: ['测定药渣吸液率'], action: ['调整粒度或改用离心、板框过滤'] }
      ]
    },
    {
      id: 'yield', title: '提取收率异常', phenomenon: '浸膏得率或指标成分转移率低于既定范围。',
      clues: [
        { id: 'c1', text: '提取温度或时间记录有偏离' },
        { id: 'c2', text: '加溶剂量或提取次数与规程不符' },
        { id: 'c3', text: '药渣中指标成分残留偏高' },
        { id: 'c4', text: '提取液转移、过滤环节有损失' },
        { id: 'c5', text: '换用了新的提取设备或批量放大' }
      ],
      causes: [
        { text: '关键工艺参数偏离（温度、时间、溶剂倍量、次数）', base: 2, w: { c1: 4, c2: 4 }, check: ['批生产记录与设备运行记录', '温度探头校准记录'], verify: ['按规程参数重复小试'], action: ['参数纳入关键工艺参数并设报警'] },
        { text: '提取不完全：浸润不足或传质受限', base: 1, w: { c3: 4, c5: 2 }, check: ['药渣残留含量测定', '浸润时间记录'], verify: ['增加一次提取，测定增量'], action: ['优化浸润与搅拌，评估提取次数'] },
        { text: '放大后传热传质变化，规模效应未被评估', base: 1, w: { c5: 4 }, check: ['升温曲线与实际保温时长', '罐内温度分布'], verify: ['按实际升温时间修正后复验'], action: ['以实际保温时间而非总时间控制提取'] },
        { text: '固液分离和转移损失', base: 1, w: { c4: 4 }, check: ['各环节体积与浓度衡算'], verify: ['逐步物料衡算定位损失点'], action: ['增加压榨或洗渣步骤并验证'] }
      ]
    },
    {
      id: 'drift', title: '含量或指纹图谱漂移', phenomenon: '成品含量合格，但指纹图谱相似度下降或部分色谱峰比例改变。',
      clues: [
        { id: 'c1', text: '色谱柱、流动相或仪器有变化' },
        { id: 'c2', text: '部分峰面积下降，同时出现新峰' },
        { id: 'c3', text: '药材批次变化' },
        { id: 'c4', text: '浓缩或干燥时间比以往长' }
      ],
      causes: [
        { text: '分析方法系统性偏差（色谱柱、流动相、积分参数）', base: 1, w: { c1: 4 }, check: ['系统适用性数据', '色谱柱使用记录与批号'], verify: ['用对照提取物或留样复测'], action: ['方法耐用性研究与色谱柱管理'] },
        { text: '工艺过程中成分降解或转化', base: 2, w: { c2: 4, c4: 3 }, check: ['中间体各环节图谱对比', '温度与受热时间记录'], verify: ['中间体逐级取样分析定位转化环节'], action: ['控制受热温度与时长，设中间体放行标准'] },
        { text: '原料成分组成差异', base: 1, w: { c3: 4 }, check: ['药材指纹图谱'], verify: ['药材与成品图谱对应分析'], action: ['建立药材指纹图谱准入'] }
      ]
    },
    {
      id: 'degrade', title: '浓缩温度导致成分降解', phenomenon: '浓缩或干燥后，热敏指标成分明显降低，降解产物增加。',
      clues: [
        { id: 'c1', text: '采用常压浓缩或浓缩温度超过 70 ℃' },
        { id: 'c2', text: '浓缩时间明显延长（如放大后）' },
        { id: 'c3', text: '浸膏颜色加深、焦糊味' },
        { id: 'c4', text: '真空度不足或波动' }
      ],
      causes: [
        { text: '浓缩温度过高或受热时间过长', base: 2, w: { c1: 4, c2: 3, c3: 2 }, check: ['浓缩温度与时间曲线', '真空度记录'], verify: ['不同温度时间梯度下浓缩对照'], action: ['改用减压低温或薄膜浓缩，限定受热时长'] },
        { text: '真空系统故障导致实际沸点升高', base: 1, w: { c4: 4 }, check: ['真空泵与密封检查记录'], verify: ['校准真空表后重复浓缩'], action: ['设备预防性维护与真空度报警'] },
        { text: '局部过热或壁面结焦', base: 1, w: { c3: 3 }, check: ['加热面清洁与结垢情况'], verify: ['检查加热介质温度'], action: ['控制加热介质温度并加强循环'] }
      ]
    },
    {
      id: 'caking', title: '干燥后吸湿、结块或流动性变差', phenomenon: '浸膏粉或颗粒放置后结块、粘壁，分装与填充困难。',
      clues: [
        { id: 'c1', text: '车间或储存环境湿度高' },
        { id: 'c2', text: '浸膏粉水分偏高' },
        { id: 'c3', text: '提取物含较多糖类、多糖或有机酸' },
        { id: 'c4', text: '采用喷雾干燥或冷冻干燥' }
      ],
      causes: [
        { text: '物料本身引湿性强（多糖、小分子糖、有机酸盐）', base: 2, w: { c3: 4, c4: 2 }, check: ['临界相对湿度与吸湿曲线'], verify: ['不同 RH 下吸湿增重试验'], action: ['加入防潮辅料、制粒或醇沉除杂（需评估成分损失）'] },
        { text: '干燥终点控制不严，残留水分高', base: 1, w: { c2: 4 }, check: ['干燥终点水分记录'], verify: ['延长干燥并测水分对比'], action: ['设定干燥终点水分标准'] },
        { text: '环境湿度与包材防潮性不足', base: 1, w: { c1: 4 }, check: ['车间温湿度记录', '包材透湿性'], verify: ['不同包材加速条件对比'], action: ['控制车间湿度，改用铝塑复合膜'] }
      ]
    },
    {
      id: 'repro', title: '三批小试结果无法复现', phenomenon: '三批小试的收率、含量 RSD 超出预设范围。',
      clues: [
        { id: 'c1', text: '三批使用不同批次药材' },
        { id: 'c2', text: '操作人员或设备不同' },
        { id: 'c3', text: '部分参数未写入操作规程，凭经验控制' },
        { id: 'c4', text: '分析方法未完成验证' }
      ],
      causes: [
        { text: '关键工艺参数未识别或未受控', base: 2, w: { c3: 4, c2: 2 }, check: ['工艺规程完整性', '三批操作记录逐项比对'], verify: ['单因素或正交试验识别关键参数'], action: ['明确关键工艺参数及可接受范围'] },
        { text: '原料批间差异', base: 1, w: { c1: 4 }, check: ['三批药材含量与图谱'], verify: ['同一批药材重复三次'], action: ['固定药材批次完成工艺研究后再考察批间差'] },
        { text: '分析方法精密度不足', base: 1, w: { c4: 4 }, check: ['方法学验证数据（精密度、重复性）'], verify: ['同一样品重复测定 6 次'], action: ['完成方法学验证'] }
      ]
    }
  ];

  // ---------------- 标杆项目 ----------------
  const PROJECTS = {
    danshen: {
      id: 'danshen', herb: '丹参', latin: 'Salvia miltiorrhiza Bge.', badge: '标杆项目', focus: '脂水双提 · 多指标评价',
      title: '丹参脂水双提物 · 药学研究与小试转化',
      claim: '活血祛瘀，通经止痛，清心除烦，凉血消痈。',
      source: '唇形科植物丹参 Salvia miltiorrhiza Bge. 的干燥根和根茎。春、秋二季采挖，除去泥沙，干燥。',
      regions: '四川、山东、河南、陕西等地均有栽培；建议固定产地与采收期并建立供应商档案。',
      markers: [
        { key: 'sal', name: '丹酚酸 B', type: '水溶性酚酸', limit: '≥ 3.0%', default: 4.5, k90: 0.20, ea: 60, light: false, volatile: false },
        { key: 'tan', name: '丹参酮类（ⅡA＋隐丹参酮＋Ⅰ）', type: '脂溶性二萜醌', limit: '总量 ≥ 0.25%', default: 0.40, k90: 0.05, ea: 50, light: true, volatile: false }
      ],
      herbQc: [
        { item: '性状、显微、薄层鉴别', limit: '应符合规定', src: 'pharm' },
        { item: '水分', limit: '≤ 13.0%', src: 'pharm' },
        { item: '总灰分', limit: '≤ 10.0%', src: 'pharm' },
        { item: '酸不溶性灰分', limit: '≤ 3.0%', src: 'pharm' },
        { item: '重金属及有害元素', limit: '铅 ≤ 5 mg/kg、镉 ≤ 1 mg/kg、砷 ≤ 2 mg/kg、汞 ≤ 0.2 mg/kg、铜 ≤ 20 mg/kg', src: 'pharm' },
        { item: '浸出物', limit: '水溶性 ≥ 35.0%；醇溶性 ≥ 15.0%', src: 'pharm' },
        { item: '丹参酮类总量', limit: '≥ 0.25%', src: 'pharm' },
        { item: '丹酚酸 B', limit: '≥ 3.0%', src: 'pharm' }
      ],
      processing: {
        intro: '丹参常用生品与酒丹参。产地加工方式（直接干燥或“发汗”）及干燥温度对酚酸类成分影响较大，宜纳入对照。',
        options: [
          { id: 'raw', name: '生丹参（切厚片，低温干燥）', desc: '保留原有成分组成，作为对照组。', effects: [{ m: '丹酚酸 B', t: '≈', n: '基准' }, { m: '丹参酮类', t: '≈', n: '基准' }] },
          { id: 'wine', name: '酒丹参（黄酒拌润，文火炒干）', desc: '传统认为可增强活血通经作用。', effects: [{ m: '丹酚酸 B', t: '↓', n: '受热可能部分降解，幅度与火候相关' }, { m: '丹参酮类', t: '≈／↑', n: '溶出可能增加，需对照实验确认' }] },
          { id: 'sweat', name: '产地“发汗”加工', desc: '堆闷发汗后干燥，影响成分转化。', effects: [{ m: '丹酚酸 B', t: '↑／↓', n: '文献结论不一，需按条件验证' }, { m: '迷迭香酸、丹参素', t: '↑', n: '丹酚酸 B 降解转化可能使其升高' }] },
          { id: 'hot', name: '高温烘干（> 80 ℃）', desc: '缩短干燥时间，但热敏成分风险高。', effects: [{ m: '丹酚酸 B', t: '↓↓', n: '热敏，损失明显' }, { m: '丹参酮类', t: '↓', n: '受热受光易降解' }] }
        ]
      },
      routes: [
        { id: 'water', name: '单一水煎（2 次 × 1.5 h）', desc: '工艺简单、成本低；丹参酮类几乎不能提出，长时间煎煮使丹酚酸 B 部分降解。', s: { transfer: 5, yieldFit: 7, stability: 4, repro: 7, energy: 6, cost: 9, operability: 7, green: 9, formFit: 6 } },
        { id: 'dual', name: '分部双提（95% 乙醇回流 → 药渣水提）', desc: '先提脂溶性丹参酮，再提水溶性酚酸，两类成分兼顾；需乙醇防爆与回收。', s: { transfer: 9, yieldFit: 8, stability: 7, repro: 8, energy: 5, cost: 6, operability: 6, green: 6, formFit: 7 } },
        { id: 'mid', name: '60% 乙醇一次回流（2 次 × 1.5 h）', desc: '一步兼顾两类成分，但丹参酮类转移率低于分部双提。', s: { transfer: 7, yieldFit: 7, stability: 7, repro: 8, energy: 6, cost: 7, operability: 8, green: 7, formFit: 7 } },
        { id: 'ultra', name: '超声辅助乙醇提取', desc: '小试速度快、转移率高；放大设备与能耗难以匹配，规模化困难。', s: { transfer: 9, yieldFit: 7, stability: 8, repro: 6, energy: 4, cost: 5, operability: 3, green: 6, formFit: 7 } }
      ],
      scaleStages: [
        { name: '醇提（脂溶性部位）', solvent: 'ethanol', label: '95% 乙醇', ratios: [8, 6], hours: [1.5, 1.0], temp: 80, eff: { tan: 0.62, sal: 0.10 } },
        { name: '水提（水溶性部位）', solvent: 'water', label: '水', ratios: [8, 6], hours: [1.0, 1.0], temp: 100, eff: { tan: 0.05, sal: 0.58 } }
      ],
      extractYield: 32,
      herbPrice: 60,
      dosagePreset: { volatile: 1, solubility: 2, thermo: 1, hygro: 2, daily: 3.0, bitter: 1, population: 'adult', onset: 'normal', route: 'oral' },
      qcMatrix: [
        { level: '药材／饮片', items: [['鉴别（性状、显微、TLC）', '应符合规定', 'pharm'], ['水分', '≤ 13.0%', 'pharm'], ['丹参酮类总量 / 丹酚酸 B', '≥ 0.25% / ≥ 3.0%', 'pharm'], ['重金属及有害元素、农药残留', '按药典规定', 'pharm']] },
        { level: '中间体（提取液、浸膏）', items: [['相对密度（清膏）', '如 1.10～1.15（60 ℃），按工艺确定', 'lit'], ['丹酚酸 B 转移率', '设定可接受范围，如 ≥ 60%', 'calc'], ['丹参酮ⅡA 转移率', '设定可接受范围', 'calc'], ['乙醇残留（醇提浸膏）', '按工艺控制', 'lit']] },
        { level: '成品（颗粒／胶囊）', items: [['指纹图谱相似度', '与对照指纹图谱比较，常以 ≥ 0.90 作为判定参考', 'lit'], ['丹酚酸 B、丹参酮ⅡA 多指标含量', '按标准规定范围', 'calc'], ['水分', '颗粒 ≤ 8.0%；硬胶囊内容物 ≤ 9.0%', 'pharm'], ['残留溶剂（乙醇）', '按通则 0861 控制', 'pharm'], ['微生物限度', '按通则 1105～1107', 'pharm'], ['剂型通则检查', '粒度、溶化性／崩解时限、装量差异等', 'pharm']] }
      ],
      batch: [
        { name: '浸膏得率', unit: '%', vals: [31.6, 33.1, 30.4], rsd: 5 },
        { name: '丹酚酸 B', unit: 'mg/g', vals: [86.2, 81.5, 79.0], rsd: 5 },
        { name: '丹参酮ⅡA', unit: 'mg/g', vals: [3.12, 3.05, 2.71], rsd: 5 },
        { name: '水分', unit: '%', vals: [4.8, 5.3, 6.9], rsd: 15 }
      ],
      similarity: [0.96, 0.95, 0.91],
      efficacy: {
        aim: '围绕“活血祛瘀”功效，建立“成分—工艺—药效”关联，而不是只比较提取率。',
        tree: [
          { g: '体外筛选', items: ['抗氧化能力（DPPH、ABTS 清除率）', '血小板聚集抑制（ADP 诱导）', '内皮细胞氧化损伤保护'] },
          { g: '体内药效', items: ['大鼠心肌缺血模型：心电图、心肌酶、梗死面积', '血液流变学指标', '微循环改善'] },
          { g: '安全性', items: ['急性毒性（最大给药量）', '重复给药毒性（按研发阶段）', '与抗凝药合用的出血风险评估'] }
        ],
        controls: [
          ['阴性对照', '溶媒或模型组'],
          ['阳性对照', '公认阳性药或已上市同类中成药（按模型选择）'],
          ['工艺对照', '单一水煎物、单一醇提物、分部双提物，等生药量给药'],
          ['剂量组', '低、中、高三个剂量，体现量效关系']
        ]
      },
      risks: [
        { item: '乙醇回流与回收', fail: '乙醇蒸气泄漏、静电', eff: '火灾爆炸', S: 5, O: 2, D: 3, ctl: '防爆电气、接地、可燃气体报警' },
        { item: '水提液浓缩', fail: '温度过高或时间过长', eff: '丹酚酸 B 降解', S: 4, O: 3, D: 3, ctl: '减压≤60 ℃，限定受热时长' },
        { item: '醇提浸膏', fail: '避光不足', eff: '丹参酮ⅡA 光降解', S: 3, O: 3, D: 4, ctl: '避光操作与避光包材' },
        { item: '浸膏粉', fail: '吸湿结块', eff: '分装困难、含量下降', S: 3, O: 4, D: 2, ctl: '控制车间湿度，铝塑复合包装' },
        { item: '药材批次', fail: '含量波动', eff: '成品批间差异', S: 4, O: 3, D: 2, ctl: '药材分级准入与指纹图谱' }
      ],
      benchmark: [
        { stage: 'herb', title: '药材基原与产地', points: ['固定基原、产地、采收期与供应商', '按药典完成鉴别、检查与含量测定'], out: '药材质量档案' },
        { stage: 'herb', title: '饮片与前处理', points: ['净制、润切厚片、低温干燥', '粉碎成粗粉并测定水分，按干品折算投料'], out: '饮片质量与前处理记录' },
        { stage: 'extract', title: '脂溶性／水溶性分部提取', points: ['95% 乙醇回流提丹参酮类（8 倍、6 倍量）', '药渣水提丹酚酸类，控制温度与时间'], out: '分部提取液与转移率' },
        { stage: 'dry', title: '纯化、浓缩与干燥', points: ['醇提液减压回收乙醇（≤ 60 ℃）', '水提液减压浓缩，可选大孔树脂富集酚酸', '低温真空或喷雾干燥'], out: '两部位浸膏粉' },
        { stage: 'form', title: '颗粒或胶囊小试处方', points: ['按日服浸膏量选择剂型', '确定辅料、制粒溶剂与干燥条件'], out: '小试处方单' },
        { stage: 'quality', title: '指纹图谱＋多指标评价', points: ['丹酚酸 B、丹参酮ⅡA 多指标含量', '指纹图谱相似度与特征峰'], out: '质量标准草案' },
        { stage: 'quality', title: '三批复现与物料衡算', points: ['三批小试 RSD 与转移率范围', '逐环节物料衡算定位损失'], out: '批次对比报告' },
        { stage: 'scale', title: '成本、风险与中试放大清单', points: ['设备选型与时间非线性放大', 'FMEA 风险评估与成本核算'], out: '中试放大清单' },
        { stage: 'register', title: '药学研究与小试转化报告', points: ['汇总全流程数据与来源标注', '列出证据缺口与下一阶段任务'], out: '《药学研究与小试转化报告》' }
      ]
    },

    huangqin: {
      id: 'huangqin', herb: '黄芩', latin: 'Scutellaria baicalensis Georgi', badge: '炮制与稳定性', focus: '杀酶保苷 · 酶解转化',
      title: '黄芩提取物 · 炮制加工、酶解转化与稳定性',
      claim: '清热燥湿，泻火解毒，止血，安胎。',
      source: '唇形科植物黄芩 Scutellaria baicalensis Georgi 的干燥根。春、秋二季采挖，除去须根和泥沙，晒后撞去粗皮，晒干。',
      regions: '山西、河北、内蒙古、山东、陕西等地；注意栽培年限对黄芩苷含量的影响。',
      markers: [
        { key: 'bai', name: '黄芩苷', type: '黄酮苷', limit: '≥ 9.0%', default: 12.0, k90: 0.06, ea: 55, light: false, volatile: false },
        { key: 'agl', name: '黄芩素', type: '黄酮苷元', limit: '按研究设定', default: 0.8, k90: 0.10, ea: 50, light: true, volatile: false }
      ],
      herbQc: [
        { item: '性状、显微、薄层鉴别', limit: '应符合规定', src: 'pharm' },
        { item: '水分', limit: '≤ 12.0%', src: 'pharm' },
        { item: '总灰分', limit: '≤ 6.0%', src: 'pharm' },
        { item: '浸出物（稀乙醇）', limit: '≥ 40.0%', src: 'pharm' },
        { item: '黄芩苷', limit: '≥ 9.0%', src: 'pharm' }
      ],
      processing: {
        intro: '黄芩含 β-葡萄糖醛酸苷酶，冷水浸润时可将黄芩苷水解为黄芩素，后者易氧化变绿。蒸或沸水煮可“杀酶保苷”。',
        options: [
          { id: 'cold', name: '冷水浸润切片', desc: '酶活性保留，作为反面对照。', effects: [{ m: '黄芩苷', t: '↓↓', n: '酶解损失明显' }, { m: '黄芩素', t: '↑', n: '随后氧化，饮片变绿' }] },
          { id: 'steam', name: '蒸制或沸水煮后切片（杀酶）', desc: '高温使酶失活，保护黄芩苷。', effects: [{ m: '黄芩苷', t: '≈', n: '基本保留' }, { m: '黄芩素', t: '≈', n: '低水平' }] },
          { id: 'wine', name: '酒黄芩（黄酒拌炒）', desc: '传统认为可引药上行、缓和苦寒之性。', effects: [{ m: '黄芩苷', t: '≈／↓', n: '与火候相关' }, { m: '醇溶性成分', t: '↑', n: '溶出可能增加' }] },
          { id: 'enzyme', name: '定向酶解转化（研究型）', desc: '有意利用酶解获得黄芩素富集部位。', effects: [{ m: '黄芩苷', t: '↓↓', n: '转化为苷元' }, { m: '黄芩素', t: '↑↑', n: '需立即抗氧化保护' }] }
        ]
      },
      routes: [
        { id: 'water', name: '沸水投料水提＋酸沉', desc: '经典路线：沸水投料杀酶，提取液调 pH 酸沉得黄芩苷粗品。', s: { transfer: 7, yieldFit: 7, stability: 7, repro: 8, energy: 6, cost: 9, operability: 7, green: 8, formFit: 6 } },
        { id: 'eth', name: '70% 乙醇回流', desc: '转移率较高，杂质少；需乙醇回收。', s: { transfer: 8, yieldFit: 7, stability: 8, repro: 8, energy: 6, cost: 6, operability: 7, green: 6, formFit: 7 } },
        { id: 'cold', name: '冷水浸提（未杀酶）', desc: '黄芩苷大量酶解，作为反面对照，不宜作为生产工艺。', s: { transfer: 3, yieldFit: 6, stability: 2, repro: 4, energy: 8, cost: 9, operability: 7, green: 9, formFit: 4 } }
      ],
      scaleStages: [
        { name: '沸水投料水提', solvent: 'water', label: '水', ratios: [10, 8], hours: [1.0, 1.0], temp: 100, eff: { bai: 0.60, agl: 0.30 } }
      ],
      extractYield: 38,
      herbPrice: 35,
      dosagePreset: { volatile: 1, solubility: 1, thermo: 2, hygro: 2, daily: 1.5, bitter: 3, population: 'adult', onset: 'normal', route: 'oral' },
      qcMatrix: [
        { level: '药材／饮片', items: [['鉴别', '应符合规定', 'pharm'], ['水分', '≤ 12.0%', 'pharm'], ['黄芩苷', '≥ 9.0%', 'pharm'], ['饮片外观（变绿）', '杀酶工艺控制', 'lit']] },
        { level: '中间体', items: [['酸沉 pH', '按工艺确定，如 pH 1～2', 'lit'], ['黄芩苷转移率', '设定可接受范围', 'calc'], ['黄芩素比例', '监控酶解程度', 'calc']] },
        { level: '成品', items: [['黄芩苷含量', '按标准规定', 'calc'], ['有关物质／降解产物', '监控', 'lit'], ['水分', '按剂型通则', 'pharm'], ['微生物限度', '按通则 1105～1107', 'pharm']] }
      ],
      batch: [
        { name: '浸膏得率', unit: '%', vals: [37.5, 38.8, 36.9], rsd: 5 },
        { name: '黄芩苷', unit: 'mg/g', vals: [262, 255, 248], rsd: 5 },
        { name: '水分', unit: '%', vals: [5.1, 5.6, 5.4], rsd: 15 }
      ],
      similarity: [0.97, 0.96, 0.95],
      efficacy: {
        aim: '对照“保苷”与“转苷元”两条路线，比较抗炎、抑菌活性与稳定性差异。',
        tree: [
          { g: '体外筛选', items: ['抑菌活性（MIC）', 'LPS 诱导巨噬细胞炎症因子', '抗氧化活性'] },
          { g: '体内药效', items: ['发热或急性炎症模型', '炎症因子与组织病理'] },
          { g: '安全性', items: ['急性毒性', '肝功能相关指标'] }
        ],
        controls: [['阴性对照', '溶媒或模型组'], ['阳性对照', '按模型选择公认阳性药'], ['工艺对照', '杀酶提取物、未杀酶提取物、酶解转化物'], ['剂量组', '低、中、高']]
      },
      risks: [
        { item: '饮片前处理', fail: '冷水长时间浸润', eff: '黄芩苷酶解损失', S: 4, O: 3, D: 3, ctl: '蒸制或沸水投料杀酶' },
        { item: '酸沉', fail: 'pH 控制不当', eff: '沉淀不完全、收率低', S: 3, O: 3, D: 2, ctl: '在线 pH 监测' },
        { item: '提取物储存', fail: '受光、碱性环境', eff: '黄芩苷降解变色', S: 3, O: 2, D: 3, ctl: '避光、控制 pH' }
      ],
      benchmark: [
        { stage: 'herb', title: '基原与杀酶前处理', points: ['确认基原与栽培年限', '蒸制或沸水煮杀酶后切片'], out: '饮片质量档案' },
        { stage: 'herb', title: '生／制品与酶解对照', points: ['冷浸、杀酶、酒炙、定向酶解四组对照', '黄芩苷、黄芩素同步测定'], out: '炮制工艺卡' },
        { stage: 'extract', title: '水提酸沉或醇提', points: ['沸水投料，提取液酸沉', '对照 70% 乙醇路线'], out: '提取物与转移率' },
        { stage: 'dry', title: '干燥与稳定性', points: ['低温真空干燥', '影响因素试验关注光与 pH'], out: '提取物稳定性数据' },
        { stage: 'form', title: '制剂成型', points: ['苦味重，优先胶囊或薄膜衣片', '评估溶出'], out: '小试处方' },
        { stage: 'register', title: '转化报告', points: ['汇总炮制—成分—稳定性证据'], out: '《药学研究与小试转化报告》' }
      ]
    },

    bohe: {
      id: 'bohe', herb: '薄荷', latin: 'Mentha haplocalyx Briq.', badge: '挥发油保留', focus: '挥发油包合 · 制剂应用',
      title: '薄荷挥发油 · 保留、包合与制剂应用',
      claim: '疏散风热，清利头目，利咽，透疹，疏肝行气。',
      source: '唇形科植物薄荷 Mentha haplocalyx Briq. 的干燥地上部分。夏、秋二季茎叶茂盛或花开至三轮时，选晴天，分次采割，晒干或阴干。',
      regions: '江苏、安徽等地为传统产区；挥发油含量受采收期和干燥方式影响大。',
      markers: [
        { key: 'oil', name: '挥发油', type: '萜类挥发油', limit: '≥ 0.80%（mL/g）', default: 1.2, k90: 0.80, ea: 40, light: false, volatile: true },
        { key: 'men', name: '薄荷脑', type: '单萜醇', limit: '以现行版正文为准', default: 0.5, k90: 0.60, ea: 40, light: false, volatile: true }
      ],
      herbQc: [
        { item: '性状、显微、薄层鉴别', limit: '应符合规定', src: 'pharm' },
        { item: '水分', limit: '≤ 15.0%', src: 'pharm' },
        { item: '总灰分', limit: '≤ 11.0%', src: 'pharm' },
        { item: '酸不溶性灰分', limit: '≤ 3.0%', src: 'pharm' },
        { item: '挥发油', limit: '≥ 0.80%（mL/g）', src: 'pharm' }
      ],
      processing: {
        intro: '薄荷主要是产地加工问题：干燥温度越高、时间越长，挥发油损失越多。',
        options: [
          { id: 'shade', name: '阴干', desc: '挥发油保留较好，干燥周期长。', effects: [{ m: '挥发油', t: '≈', n: '保留较好' }, { m: '薄荷脑', t: '≈', n: '基准' }] },
          { id: 'sun', name: '晒干', desc: '周期短，但日晒升温导致部分损失。', effects: [{ m: '挥发油', t: '↓', n: '部分损失' }, { m: '叶片', t: '↓', n: '易碎落' }] },
          { id: 'oven', name: '低温烘干（≤ 40 ℃）', desc: '可控性好，适合规模化。', effects: [{ m: '挥发油', t: '≈／↓', n: '温度控制是关键' }] },
          { id: 'hot', name: '高温烘干（> 60 ℃）', desc: '反面对照。', effects: [{ m: '挥发油', t: '↓↓', n: '损失明显' }] }
        ]
      },
      routes: [
        { id: 'steam', name: '水蒸气蒸馏', desc: '经典方法，设备简单；热敏组分可能有少量变化。', s: { transfer: 7, yieldFit: 7, stability: 7, repro: 8, energy: 5, cost: 8, operability: 8, green: 9, formFit: 7 } },
        { id: 'sfe', name: '超临界 CO₂ 萃取', desc: '低温、无溶剂残留、得油率高；设备投资大。', s: { transfer: 9, yieldFit: 8, stability: 9, repro: 8, energy: 5, cost: 3, operability: 5, green: 9, formFit: 8 } },
        { id: 'distill_in', name: '提油后药渣再水提（双产物）', desc: '先提挥发油，药渣和蒸馏后水液再提水溶性成分，综合利用。', s: { transfer: 8, yieldFit: 8, stability: 7, repro: 7, energy: 5, cost: 7, operability: 6, green: 8, formFit: 8 } }
      ],
      scaleStages: [
        { name: '水蒸气蒸馏', solvent: 'water', label: '水（蒸汽）', ratios: [10], hours: [4.0], temp: 100, eff: { oil: 0.80, men: 0.80 } }
      ],
      extractYield: 1.0,
      herbPrice: 25,
      dosagePreset: { volatile: 3, solubility: 1, thermo: 1, hygro: 1, daily: 0.2, bitter: 1, population: 'adult', onset: 'fast', route: 'oral' },
      qcMatrix: [
        { level: '药材', items: [['挥发油', '≥ 0.80%（mL/g）', 'pharm'], ['水分', '≤ 15.0%', 'pharm']] },
        { level: '中间体（挥发油／包合物）', items: [['折光率、相对密度', '按标准', 'lit'], ['包合率与包合物含油率', '设定可接受范围', 'calc'], ['GC 指纹图谱', '主要组分比例', 'lit']] },
        { level: '成品', items: [['薄荷脑含量（GC）', '按标准规定', 'calc'], ['挥发损失（加速条件）', '监控', 'calc'], ['剂型通则检查', '按剂型', 'pharm']] }
      ],
      batch: [
        { name: '得油率', unit: '%', vals: [0.98, 1.05, 0.92], rsd: 8 },
        { name: '包合率', unit: '%', vals: [82.0, 85.4, 79.6], rsd: 5 },
        { name: '薄荷脑', unit: 'mg/g', vals: [118, 124, 109], rsd: 6 }
      ],
      similarity: [0.95, 0.96, 0.93],
      efficacy: {
        aim: '比较游离油、β-环糊精包合物与制剂在储存后的挥发损失与作用保持。',
        tree: [
          { g: '体外筛选', items: ['抑菌活性', '透皮或黏膜渗透（外用剂型）'] },
          { g: '体内药效', items: ['解热或止痒模型（按定位选择）'] },
          { g: '安全性', items: ['皮肤／黏膜刺激性', '急性毒性'] }
        ],
        controls: [['阴性对照', '空白辅料或包合材料'], ['阳性对照', '按模型选择'], ['工艺对照', '游离油、包合物、乳化制剂'], ['剂量组', '低、中、高']]
      },
      risks: [
        { item: '蒸馏', fail: '冷凝不充分', eff: '挥发油逸散', S: 4, O: 3, D: 3, ctl: '控制冷却水温与流量' },
        { item: '油水分离', fail: '乳化', eff: '得油率低', S: 3, O: 3, D: 3, ctl: '盐析或静置分层' },
        { item: '制剂', fail: '挥发损失', eff: '含量下降', S: 4, O: 4, D: 3, ctl: 'β-环糊精包合，密封包装' }
      ],
      benchmark: [
        { stage: 'herb', title: '采收与产地加工', points: ['花开至三轮时采收', '阴干或低温烘干对照'], out: '药材挥发油含量档案' },
        { stage: 'extract', title: '挥发油提取', points: ['水蒸气蒸馏与超临界 CO₂ 对照', '提油后药渣综合利用'], out: '挥发油与水溶性部位' },
        { stage: 'form', title: '包合与固化', points: ['β-环糊精包合（油：β-CD 常用 1:6～1:8，mL:g）', '包合率与含油率测定'], out: '包合物处方' },
        { stage: 'quality', title: '挥发损失与稳定性', points: ['加速条件下薄荷脑含量变化', 'GC 指纹图谱'], out: '稳定性数据' },
        { stage: 'register', title: '转化报告', points: ['汇总保留率与剂型证据'], out: '《药学研究与小试转化报告》' }
      ]
    },

    yanhusuo: {
      id: 'yanhusuo', herb: '延胡索', latin: 'Corydalis yanhusuo W.T.Wang', badge: '醋炙增效', focus: '醋炙前后 · 生物碱溶出',
      title: '延胡索 · 醋炙前后成分变化与增效评价',
      claim: '活血，行气，止痛。',
      source: '罂粟科植物延胡索 Corydalis yanhusuo W.T.Wang 的干燥块茎。夏初茎叶枯萎时采挖，除去须根，洗净，置沸水中煮至恰无白心时，取出，晒干。',
      regions: '浙江（东阳、磐安）为道地产区，陕西等地亦有栽培。',
      markers: [
        { key: 'thp', name: '延胡索乙素', type: '叔胺类生物碱', limit: '≥ 0.050%', default: 0.09, k90: 0.02, ea: 50, light: false, volatile: false },
        { key: 'tot', name: '总生物碱', type: '生物碱', limit: '按研究设定', default: 0.8, k90: 0.03, ea: 50, light: false, volatile: false }
      ],
      herbQc: [
        { item: '性状、显微、薄层鉴别', limit: '应符合规定', src: 'pharm' },
        { item: '水分', limit: '≤ 15.0%', src: 'pharm' },
        { item: '总灰分', limit: '≤ 4.0%', src: 'pharm' },
        { item: '浸出物（稀乙醇）', limit: '≥ 13.0%', src: 'pharm' },
        { item: '延胡索乙素', limit: '≥ 0.050%', src: 'pharm' }
      ],
      processing: {
        intro: '延胡索醋炙后，游离生物碱与醋酸成盐，水溶性增加，煎出率提高，传统认为止痛作用增强。',
        options: [
          { id: 'raw', name: '生延胡索', desc: '对照组。', effects: [{ m: '延胡索乙素（水煎出）', t: '≈', n: '基准' }] },
          { id: 'vinegar', name: '醋炙延胡索（米醋拌润，文火炒干）', desc: '经典炮制，增加水煎出率。', effects: [{ m: '延胡索乙素（水煎出）', t: '↑', n: '成盐后溶出增加' }, { m: '总生物碱（水煎出）', t: '↑', n: '溶出增加' }] },
          { id: 'vboil', name: '醋煮延胡索', desc: '醋液中煮至透心。', effects: [{ m: '总生物碱（水煎出）', t: '↑', n: '与醋炙相近，需对照' }] },
          { id: 'wine', name: '酒炙延胡索', desc: '对照组之一。', effects: [{ m: '醇溶性成分', t: '↑', n: '需实验确认' }] }
        ]
      },
      routes: [
        { id: 'acidwater', name: '酸水提取（醋酸调 pH）', desc: '模拟醋炙成盐原理，提高生物碱水提转移率。', s: { transfer: 8, yieldFit: 7, stability: 8, repro: 8, energy: 6, cost: 8, operability: 7, green: 8, formFit: 7 } },
        { id: 'eth', name: '70% 乙醇回流', desc: '生物碱转移率高；需乙醇回收。', s: { transfer: 9, yieldFit: 7, stability: 8, repro: 8, energy: 6, cost: 6, operability: 7, green: 6, formFit: 7 } },
        { id: 'water', name: '生品直接水煎', desc: '游离生物碱水溶性差，转移率低，作为对照。', s: { transfer: 4, yieldFit: 6, stability: 8, repro: 7, energy: 6, cost: 9, operability: 8, green: 9, formFit: 6 } }
      ],
      scaleStages: [
        { name: '酸水或醇提', solvent: 'ethanol', label: '70% 乙醇', ratios: [8, 6], hours: [1.5, 1.0], temp: 80, eff: { thp: 0.60, tot: 0.58 } }
      ],
      extractYield: 15,
      herbPrice: 90,
      dosagePreset: { volatile: 1, solubility: 1, thermo: 3, hygro: 1, daily: 1.0, bitter: 2, population: 'adult', onset: 'fast', route: 'oral' },
      qcMatrix: [
        { level: '药材／饮片', items: [['延胡索乙素', '≥ 0.050%', 'pharm'], ['水分', '≤ 15.0%', 'pharm'], ['醋炙饮片', '以现行版药典饮片规定为准', 'pharm']] },
        { level: '中间体', items: [['提取液 pH', '按工艺确定', 'lit'], ['总生物碱转移率', '设定可接受范围', 'calc']] },
        { level: '成品', items: [['延胡索乙素含量', '按标准规定', 'calc'], ['有关物质', '监控', 'lit'], ['剂型通则检查', '按剂型', 'pharm']] }
      ],
      batch: [
        { name: '浸膏得率', unit: '%', vals: [14.6, 15.3, 15.0], rsd: 5 },
        { name: '延胡索乙素', unit: 'mg/g', vals: [4.6, 4.8, 4.4], rsd: 5 },
        { name: '总生物碱', unit: 'mg/g', vals: [41.2, 43.0, 39.8], rsd: 5 }
      ],
      similarity: [0.96, 0.95, 0.94],
      efficacy: {
        aim: '以等生药量对比生品与醋炙品，验证“醋炙增效”是否来自溶出增加，并同步评价安全性。',
        tree: [
          { g: '体内药效', items: ['热板法、醋酸扭体法镇痛', '痛经或炎性疼痛模型（按定位）'] },
          { g: '成分关联', items: ['水煎液生物碱溶出量与镇痛效应相关性分析'] },
          { g: '安全性', items: ['急性毒性', '中枢抑制相关观察（镇静）'] }
        ],
        controls: [['阴性对照', '溶媒组'], ['阳性对照', '按模型选择公认镇痛药'], ['工艺对照', '生品、醋炙品、酸水提取物，等生药量'], ['剂量组', '低、中、高']]
      },
      risks: [
        { item: '醋炙', fail: '火候不一致', eff: '批间成分差异', S: 3, O: 4, D: 3, ctl: '规定温度、时间与醋用量' },
        { item: '提取', fail: 'pH 偏离', eff: '生物碱转移率波动', S: 3, O: 3, D: 2, ctl: '在线 pH 控制' },
        { item: '成品', fail: '剂量过高', eff: '中枢抑制不良反应', S: 4, O: 2, D: 3, ctl: '明确剂量范围与安全性研究' }
      ],
      benchmark: [
        { stage: 'herb', title: '产地加工与醋炙', points: ['沸水煮至恰无白心后晒干', '生品、醋炙、醋煮、酒炙对照'], out: '炮制工艺卡' },
        { stage: 'extract', title: '酸水提取与醇提对照', points: ['醋酸调 pH 模拟成盐', '对照 70% 乙醇'], out: '生物碱转移率' },
        { stage: 'quality', title: '多指标与药效关联', points: ['延胡索乙素与总生物碱', '镇痛药效与溶出相关性'], out: '评价指标树' },
        { stage: 'register', title: '转化报告', points: ['汇总炮制增效证据链'], out: '《药学研究与小试转化报告》' }
      ]
    }
  };

  // 溶剂物性与价格（价格为示例，可在页面修改）
  const SOLVENTS = {
    water: { name: '水', density: 1.0, cp: 4.18, latent: 2257, price: 0.01, recover: false },
    ethanol: { name: '乙醇', density: 0.81, cp: 2.6, latent: 846, price: 7.0, recover: true }
  };

  window.TCM_V18_DATA = { SOURCES, REGS, STAGES, EVIDENCE_LEVELS, PATHS, DOSAGE_FORMS, STABILITY, DEVIATIONS, PROJECTS, SOLVENTS };
})();
