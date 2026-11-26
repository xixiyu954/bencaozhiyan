// =========================================================================
// 本草智研 v9.0 扩充题库、权威文献、高校案例与高阶 DIY 工艺积木库 (lab-v9-data.js)
// - 新增 8 项高校与药企高频经典/绿色创新课题（含一材双提、绿色超声、NADES、多糖脱蛋白、双相联产）
// - 新增 10 篇 GB/T 7714 规范参考资料与 6 项院校/药企教学实验案例
// - 内置 16 块可自由拼装的 DIY 工艺积木 + 4 套一键 DIY 黄金模板
// =========================================================================
(function () {
  'use strict';

  const V9_PRESETS = {
    v9_yinxingye_dual: {
      id: 'v9_yinxingye_dual', isInnovative: true, featured: true, sourceTag: '心脑血管标杆 · 双指标',
      herb: '银杏叶（黄酮+内酯双提）', compound: '总黄酮醇苷 + 银杏内酯 A/B/C', latin: 'Ginkgo biloba L.',
      category: '黄酮', defaultRig: 'resin', applicableRigs: ['reflux', 'resin', 'rotavap', 'hplc', 'tlc'],
      defaultExtract: 'reflux', defaultSep: 'resin', formulas: ['adsorption', 'diffusion', 'qc'],
      defaultCfg: { mass: 100, ratio: 10, temp: 75, time: 90, mesh: '粗粉(10~20目)', cycles: '2', solventType: '70%乙醇', ph: '中性 7.0' },
      limitVal: 24.0, limitUnit: '%', crudeUnit: 'g', mpRef: '提取物总黄酮醇苷 ≥ 24%、萜类内酯 ≥ 6%',
      origin: '银杏科植物银杏干燥叶（《中国药典》银杏叶提取物标准，国际 EGb 761 标杆工艺）。',
      chemistry: '银杏总黄酮醇苷（槲皮素、山奈酚、异鼠李素苷）与萜类内酯（白果内酯、银杏内酯 A/B/C）极性相近，但银杏酸具致敏性，须经石油醚脱脂或大孔树脂精准除杂控制在 5 ppm 以下。',
      pharmacopoeia: '药典要求银杏叶提取物含总黄酮醇苷 ≥ 24.0%、萜类内酯 ≥ 6.0%，总银杏酸 ≤ 5 mg/kg。',
      integrative: '中西医结合经典对照：可直接对比国产银杏叶提取物与德国 EGb 761 制剂工艺差异及抗血小板活化因子（PAF）机制。',
      scaling: { auxName: 'AB-8大孔树脂/石油醚', auxFactor: 1.5, auxUnit: 'mL/g', yieldLow: 0.022, yieldHigh: 0.032, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板，乙酸乙酯-丁酮-甲酸-水 (5:3:1:1)，喷 3% 三氯化铝乙醇液后 365 nm 紫外检视。',
      tlcDefault: { front: 8.0, sample: 4.5, ref: 4.5 },
      steps: [
        { stage: '提取', title: '70% 乙醇 75℃ 两次回流提取', principle: '中等极性醇水同步溶出黄酮醇苷与萜类内酯。', operation: '100 g 粗粉加 10 倍量 70% 乙醇 75℃ 回流 90 min，二提 8 倍量 60 min 合并。', qc: '回流温度 ≤ 78℃，防内酯水解。' },
        { stage: '分离', title: '减压回收乙醇并脱除致敏银杏酸', principle: '利用银杏酸强亲脂性，采用低极性溶剂萃取脱除。', operation: '旋蒸回收乙醇至无醇味，加水分散后以石油醚萃取 2 次除去亲脂杂质。', qc: '水层澄清无乳化。' },
        { stage: '纯化', title: 'AB-8 大孔树脂梯度洗脱富集', principle: '水洗除糖，30%~70% 乙醇分段洗脱富集黄酮与内酯。', operation: '上样流速 2 BV/h，先水洗 3 BV，再 70% 乙醇洗脱 4 BV 收集浓缩。', qc: '合并主峰洗脱液减压干燥。' },
        { stage: '检识', title: '三氯化铝显色 TLC 与 HPLC-ELSD 双检', principle: '黄酮与 AlCl3 络合呈亮黄荧光，内酯无强紫外吸收需 ELSD 检测。', operation: '开展 AlCl3 荧光 TLC 鉴别与总黄酮 UV 定量（510 nm）。', qc: 'Rf 偏差 ≤ 0.02。' }
      ],
      troubleshoot: [
        { issue: '水分散液抽滤缓慢且滤膜堵塞', cause: '叶绿素与蜡质未充分脱除。', fix: '浓缩液冷藏静置 4 h 析出叶绿素沉淀后再离心过滤。' }
      ],
      sop: ['100 g 银杏叶粗粉 70% 乙醇两次回流', '55℃ 旋蒸回收乙醇并加水分散冷藏除叶绿素', '石油醚萃取脱除银杏酸', 'AB-8 树脂水洗除杂后 70% 乙醇洗脱', 'TLC 荧光鉴别与 UV/HPLC 定量'],
      chemTests: [{ name: '盐酸-镁粉黄酮显色反应', passed: true }, { name: 'AlCl3 365 nm 荧光 TLC', passed: true }, { name: '银杏酸脱除澄清度检查', passed: true }],
      demoBatches: [{ mass: 100, crude: 3.1, refined: 2.4, mp: 0 }, { mass: 100, crude: 3.3, refined: 2.5, mp: 0 }, { mass: 100, crude: 3.0, refined: 2.3, mp: 0 }]
    },
    v9_jinyinhua_green: {
      id: 'v9_jinyinhua_green', isInnovative: true, featured: true, sourceTag: '绿色超声 · 热敏酚酸',
      herb: '金银花（绿原酸低温超声）', compound: '绿原酸 + 木犀草苷', latin: 'Lonicera japonica Thunb.',
      category: '苯丙素与有机酸', defaultRig: 'ultrasonic', applicableRigs: ['ultrasonic', 'rotavap', 'hplc', 'tlc'],
      defaultExtract: 'ultrasonic', defaultSep: 'precip', formulas: ['diffusion', 'henderson', 'qc'],
      defaultCfg: { mass: 50, ratio: 12, temp: 45, time: 40, mesh: '中粉(40目)', cycles: '2', solventType: '70%乙醇', ph: '微酸 4.5' },
      limitVal: 1.5, limitUnit: '%', crudeUnit: 'g', mpRef: '绿原酸熔点 205~209℃（热敏易异构）',
      origin: '忍冬科植物忍冬干燥花蕾（本科绿色化学高频代表课题，3 小时内即可全流程收工）。',
      chemistry: '绿原酸为咖啡酸与奎宁酸缩合的缩酚酸，分子含邻二酚羟基与酯键，高温强碱极易氧化褐变及异构化；低温微酸（pH 4~5）超声空化可显著提升完整得率。',
      pharmacopoeia: '药典规定金银花含绿原酸不得少于 1.5%，木犀草苷不得少于 0.050%。',
      integrative: '延伸方向：同步测试金银花提取物 DPPH 自由基清除率（IC50），对比传统煎煮与 45℃ 超声的抗氧化活性保留率。',
      scaling: { auxName: '抗坏血酸/柠檬酸调节剂', auxFactor: 0.05, auxUnit: 'g/g', yieldLow: 0.016, yieldHigh: 0.025, yieldUnit: 'g' },
      tlcSystem: '聚酰胺薄膜或硅胶 H 板，乙酸丁酯-甲酸-水 (7:2.5:2.5) 上层液，365 nm 紫外下呈蓝色荧光。',
      tlcDefault: { front: 8.0, sample: 3.2, ref: 3.2 },
      steps: [
        { stage: '提取', title: '微酸 70% 乙醇 45℃ 超声空化提取', principle: '超声空化微射流快速击破花蕾细胞壁，低温微酸抑制酚羟基氧化。', operation: '50 g 中粉加 12 倍量 pH 4.5 的 70% 乙醇，45℃ 超声 40 min，重复 2 次合并。', qc: '冰袋控温 ≤ 50℃。' },
        { stage: '分离', title: '低温减压浓缩与水沉除脂', principle: '45℃ 减压蒸除乙醇，沉淀叶绿素与树脂杂质。', operation: '45℃ 旋蒸回收乙醇至浸膏，加 5 倍纯化水超声分散静置过滤。', qc: '滤液呈清亮淡黄绿色。' },
        { stage: '纯化', title: '乙酸乙酯微酸萃取精制绿原酸', principle: 'pH 3.0 下绿原酸呈分子态，易被乙酸乙酯选择性萃取。', operation: '水相调 pH 3.0，以等体积乙酸乙酯萃取 3 次，合并酯相无水 Na2SO4 脱水旋干。', qc: '避光保存防褐变。' },
        { stage: '检识', title: '365 nm 蓝荧光 TLC 与 327 nm UV 定量', principle: '绿原酸共轭体系在 327 nm 有强特征吸收，365 nm 呈天蓝色荧光。', operation: '对照品平行点样 TLC，并稀释测 327 nm 吸光度代入标曲。', qc: 'RSD ≤ 2.5%。' }
      ],
      troubleshoot: [
        { issue: '提取液迅速变深褐色', cause: '温度过高或溶液偏碱性导致邻二酚氧化聚合。', fix: '预先加少量柠檬酸调 pH 至 4.5 并严控超声水温 ≤ 48℃。' }
      ],
      sop: ['50 g 金银花中粉加微酸 70% 乙醇 45℃ 超声 2 次', '45℃ 减压浓缩回收乙醇', 'pH 3.0 乙酸乙酯萃取 3 次并脱水', '365 nm TLC 蓝荧光鉴别与 327 nm UV 定量'],
      chemTests: [{ name: 'FeCl3 酚羟基蓝绿色显色', passed: true }, { name: '365 nm 蓝荧光 TLC 对照', passed: true }, { name: '327 nm UV 特征峰', passed: true }],
      demoBatches: [{ mass: 50, crude: 1.12, refined: 0.88, mp: 206.5 }, { mass: 50, crude: 1.18, refined: 0.92, mp: 207.0 }, { mass: 50, crude: 1.15, refined: 0.90, mp: 206.8 }]
    },
    v9_chuanxiong_dual: {
      id: 'v9_chuanxiong_dual', isInnovative: true, featured: true, sourceTag: '酸碱双相联产 · 经典综合',
      herb: '川芎（川芎嗪+阿魏酸双提）', compound: '川芎嗪（生物碱）+ 阿魏酸（有机酸）', latin: 'Ligusticum chuanxiong Hort.',
      category: '生物碱', defaultRig: 'liquid_extract', applicableRigs: ['reflux', 'liquid_extract', 'rotavap', 'tlc', 'hplc'],
      defaultExtract: 'reflux', defaultSep: 'extract', formulas: ['henderson', 'diffusion', 'qc'],
      defaultCfg: { mass: 100, ratio: 10, temp: 75, time: 90, mesh: '粗粉(10~20目)', cycles: '2', solventType: '70%乙醇', ph: 'pH 2.0 / 9.5 双段' },
      limitVal: 0.1, limitUnit: '%', crudeUnit: 'g', mpRef: '阿魏酸 173~175℃ / 川芎嗪 80~82℃',
      origin: '伞形科植物川芎干燥根茎：完美演绎“酸碱两相一步分流生物碱与有机酸”的本科综合实验！',
      chemistry: '川芎嗪呈弱碱性（pH 2 成盐留水相、pH 9.5 游离入有机相），阿魏酸呈酸性（pH 9.5 成钠盐留水相、pH 2 游离入乙酸乙酯），构成教科书级 pH 梯度分离模型。',
      pharmacopoeia: '药典规定川芎含阿魏酸不得少于 0.10%，并辅以洋川芎内酯与川芎嗪质量评价。',
      integrative: '活血化瘀经典机制对照：川芎嗪注射液与阿魏酸钠均已开发为临床注射剂，可对比天然提取与化学合成品纯度差异。',
      scaling: { auxName: 'HCl/Na2CO3/乙酸乙酯', auxFactor: 1.2, auxUnit: 'mL/g', yieldLow: 0.0012, yieldHigh: 0.0022, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板，正己烷-乙酸乙酯-甲酸 (6:4:0.2)，365 nm 紫外下阿魏酸呈亮蓝荧光，碘化铋钾显川芎嗪。',
      tlcDefault: { front: 8.0, sample: 4.8, ref: 4.8 },
      steps: [
        { stage: '提取', title: '70% 乙醇 75℃ 两次回流总提', principle: '醇水体系同步浸出碱性川芎嗪与酸性阿魏酸。', operation: '100 g 川芎粗粉 10 倍量 70% 乙醇回流 90 min，二提 60 min 合并旋蒸除醇。', qc: '浓缩至浸膏状无醇味。' },
        { stage: '分离', title: 'pH 9.5 碱化萃取分离川芎嗪', principle: '碱性条件下川芎嗪游离入有机相，阿魏酸成钠盐留水相。', operation: '浸膏加水调 pH 9.5，用乙酸乙酯萃取 3 次，有机相回收得粗川芎嗪。', qc: '严控 pH 9~10 防乳化。' },
        { stage: '纯化', title: '水相调 pH 2.0 酸化萃取分离阿魏酸', principle: '酸性条件下阿魏酸转为游离分子态进入乙酸乙酯相。', operation: '上述碱水相以稀盐酸调 pH 2.0，乙酸乙酯萃取 3 次，脱水浓缩析晶。', qc: '避光低温浓缩防阿魏酸顺反异构。' },
        { stage: '检识', title: '双组分 TLC 与 322 nm UV 测定', principle: '阿魏酸具 322 nm 特征紫外吸收与蓝色荧光，川芎嗪与碘化铋钾显橘红色。', operation: '分别对两相产物进行 TLC 对照鉴别与 UV 含量测算。', qc: '两相无交叉拖尾。' }
      ],
      troubleshoot: [
        { issue: '碱化萃取时两相乳化分层困难', cause: '川芎挥发油及树脂类皂化引起乳化。', fix: '萃取前先用少量石油醚微酸预脱脂，或加饱和 NaCl 破乳。' }
      ],
      sop: ['70% 乙醇两次回流并减压除醇', '调 pH 9.5 乙酸乙酯分取川芎嗪相', '水相调 pH 2.0 乙酸乙酯分取阿魏酸相', '两相分别脱水浓缩并做双组分 TLC 检识'],
      chemTests: [{ name: '碘化铋钾橘红沉淀（川芎嗪）', passed: true }, { name: '365 nm 亮蓝荧光（阿魏酸）', passed: true }, { name: '两相 pH 分流清晰度', passed: true }],
      demoBatches: [{ mass: 100, crude: 0.24, refined: 0.14, mp: 173.5 }, { mass: 100, crude: 0.26, refined: 0.15, mp: 174.1 }, { mass: 100, crude: 0.25, refined: 0.14, mp: 173.8 }]
    },
    v9_gouqi_lbp: {
      id: 'v9_gouqi_lbp', isInnovative: false, featured: true, sourceTag: '水提醇沉 · 苯酚硫酸法',
      herb: '宁夏枸杞（枸杞多糖 LBP）', compound: '枸杞多糖 (LBP)', latin: 'Lycium barbarum L.',
      category: '多糖类', defaultRig: 'freeze_dry', applicableRigs: ['reflux', 'vacuum_filter', 'freeze_dry', 'rotavap'],
      defaultExtract: 'reflux', defaultSep: 'precip', formulas: ['diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 12, temp: 90, time: 120, mesh: '切段(1~2cm)', cycles: '2', solventType: '纯化水', ph: '中性 7.0' },
      limitVal: 1.8, limitUnit: '%', crudeUnit: 'g', mpRef: '灰白色蓬松冻干多糖粉（无定形）',
      origin: '茄科植物宁夏枸杞干燥成熟果实：极佳的“水提醇沉 + Sevag 脱蛋白 + 苯酚-硫酸比色”经典教学课题。',
      chemistry: '枸杞多糖为水溶性杂多糖（含阿拉伯糖、半乳糖、葡萄糖等），不溶于 80% 以上高浓度乙醇；经 Sevag 法（氯仿-正丁醇 4:1）或酶法可有效脱除游离蛋白。',
      pharmacopoeia: '药典规定枸杞子含枸杞多糖（以葡萄糖计）不得少于 1.8%。',
      integrative: '药食同源与免疫调节研究：可对接体外巨噬细胞 RAW264.7 吞噬活性或肠道益生菌发酵评价。',
      scaling: { auxName: '95%乙醇(醇沉至80%)', auxFactor: 4.0, auxUnit: 'mL/g', yieldLow: 0.025, yieldHigh: 0.045, yieldUnit: 'g' },
      tlcSystem: '酸水解后纤维素板展开（正丁醇-吡啶-水 6:4:3），苯胺-邻苯二甲酸显色检单糖组成。',
      tlcDefault: { front: 8.0, sample: 4.1, ref: 4.1 },
      steps: [
        { stage: '提取', title: '80% 乙醇预回流脱单糖后 90℃ 水提', principle: '预脱小分子单糖与色素，避免苯酚-硫酸法假阳性偏高。', operation: '50 g 枸杞 80% 乙醇回流 1 h 弃醇液，药渣 12 倍纯化水 90℃ 提取 2 次合并。', qc: '合并水提液浓缩至 100 mL。' },
        { stage: '分离', title: '4 倍量 95% 乙醇静置醇沉 12 h', principle: '乙醇降低介电常数破坏多糖水化膜使其沉淀析出。', operation: '缓慢搅拌加入 4 倍量 95% 乙醇至终醇度 80%，4℃ 静置过夜抽滤得粗多糖。', qc: '无水乙醇、丙酮依次洗涤沉淀。' },
        { stage: '纯化', title: '木瓜蛋白酶法 / Sevag 法脱蛋白并冻干', principle: '温和酶解或变性去除结合蛋白，防止紫外 280 nm 杂峰干扰。', operation: '粗多糖复溶后加 1% 木瓜蛋白酶 50℃ 酶解 1 h 灭酶离心，上清冻干。', qc: '280 nm 无明显蛋白吸收峰。' },
        { stage: '检识', title: 'Molish 紫环反应与 490 nm 苯酚-硫酸定量', principle: '多糖经浓硫酸脱水生成糠醛衍生物，与苯酚缩合呈橙黄色。', operation: '以无水葡萄糖制作标曲，490 nm 测定吸光度换算多糖含量。', qc: '标曲 R² ≥ 0.999。' }
      ],
      troubleshoot: [
        { issue: '醇沉后多糖粘壁结块难以抽滤', cause: '浓缩液过浓或乙醇加入速度过快。', fix: '浓缩比控制在 1:2 (g/mL)，边高速搅拌边细流加入乙醇，并 4℃ 充分静置。' }
      ],
      sop: ['80% 乙醇预脱单糖与脂溶性色素', '90℃ 纯化水两次提取并减压浓缩', '调醇度至 80% 低温静置醇沉', '酶法脱蛋白后真空冻干', '490 nm 苯酚-硫酸法标曲定量'],
      chemTests: [{ name: 'Molish 反应紫色界面环', passed: true }, { name: '280 nm 蛋白脱除检验', passed: true }, { name: '苯酚-硫酸 490 nm 显色', passed: true }],
      demoBatches: [{ mass: 50, crude: 2.3, refined: 1.65, mp: 0 }, { mass: 50, crude: 2.5, refined: 1.72, mp: 0 }, { mass: 50, crude: 2.4, refined: 1.68, mp: 0 }]
    },
    v9_danggui_dual: {
      id: 'v9_danggui_dual', isInnovative: true, featured: true, sourceTag: '一材双提 · 挥发油+阿魏酸',
      herb: '当归（藁本内酯+阿魏酸联产）', compound: '藁本内酯 + 阿魏酸', latin: 'Angelica sinensis (Oliv.) Diels',
      category: '挥发油与萜类', defaultRig: 'steam', applicableRigs: ['steam', 'reflux', 'liquid_extract', 'tlc'],
      defaultExtract: 'steam', defaultSep: 'extract', formulas: ['dalton', 'diffusion', 'qc'],
      defaultCfg: { mass: 100, ratio: 10, temp: 100, time: 180, mesh: '切段(1~2cm)', cycles: '1', solventType: '纯化水', ph: '中性 7.0' },
      limitVal: 0.4, limitUnit: '%', crudeUnit: 'mL', mpRef: '挥发油 ≥ 0.4% (mL/g) / 阿魏酸 ≥ 0.05%',
      origin: '伞形科植物当归干燥根：先收挥发油（藁本内酯），再回收药渣与水煎液提取阿魏酸，实现药材零浪费！',
      chemistry: '当归挥发油主成分为 Z-藁本内酯（约占 45%~60%，比重略大于或接近水，易光氧化），水煎残液中富含水溶性阿魏酸及当归多糖。',
      pharmacopoeia: '药典规定当归挥发油不得少于 0.4% (mL/g)，阿魏酸不得少于 0.050%。',
      integrative: '绿色循环理念教学：直观测算“单提挥发油”与“挥发油+阿魏酸联产”的药材综合利用率提升幅度。',
      scaling: { auxName: '无水Na2SO4/乙酸乙酯', auxFactor: 0.8, auxUnit: 'g/g', yieldLow: 0.0042, yieldHigh: 0.0075, yieldUnit: 'mL' },
      tlcSystem: '硅胶 G 板，正己烷-乙酸乙酯 (4:1)，365 nm 紫外灯下藁本内酯显亮蓝白色荧光斑点。',
      tlcDefault: { front: 8.0, sample: 5.4, ref: 5.4 },
      steps: [
        { stage: '提取', title: '药典甲法水蒸气蒸馏收集当归挥发油', principle: '共沸蒸汽带出藁本内酯等挥发性内酯成分。', operation: '100 g 当归薄片浸泡 30 min，微沸蒸馏 3 h 至油量不再增加。', qc: '避光收集防藁本内酯光聚。' },
        { stage: '分离', title: '挥发油脱水与蒸馏母液再利用', principle: '挥发油以无水硫酸钠脱水，蒸馏后的热母液直接过滤保留。', operation: '分取挥发油加无水 Na2SO4 脱水；母液浓缩后作为阿魏酸粗提液。', qc: '油层澄清淡黄带浓郁当归香。' },
        { stage: '纯化', title: '母液酸化至 pH 2.5 乙酸乙酯萃取阿魏酸', principle: '酸性条件游离阿魏酸，实现一材两得。', operation: '浓缩母液调 pH 2.5，乙酸乙酯萃取 3 次并减压回收得阿魏酸粗品。', qc: '45℃ 低温旋干。' },
        { stage: '检识', title: '365 nm 双组分 TLC 荧光鉴别', principle: '藁本内酯与阿魏酸在 365 nm 下分别呈现亮蓝白与天蓝荧光。', operation: '分别展开挥发油与阿魏酸段并记录 Rf 值。', qc: '斑点圆整无重叠。' }
      ],
      troubleshoot: [
        { issue: '挥发油放久后变深红棕色', cause: '藁本内酯见光遇热发生氧化二聚。', fix: '棕色瓶充氮气 4℃ 避光冷藏。' }
      ],
      sop: ['100 g 当归片浸泡后水蒸气蒸馏 3 h', '分取挥发油并无水 Na2SO4 脱水避光保存', '过滤蒸馏母液浓缩并调 pH 2.5 萃取阿魏酸', '双组分 365 nm TLC 荧光鉴别'],
      chemTests: [{ name: '当归特征香气与挥发油得率', passed: true }, { name: '365 nm 藁本内酯蓝白荧光', passed: true }, { name: '母液阿魏酸联产检出', passed: true }],
      demoBatches: [{ mass: 100, crude: 0.62, refined: 0.56, mp: 0 }, { mass: 100, crude: 0.68, refined: 0.61, mp: 0 }, { mass: 100, crude: 0.65, refined: 0.58, mp: 0 }]
    },
    v9_lianqiao_dual: {
      id: 'v9_lianqiao_dual', isInnovative: false, featured: true, sourceTag: '木脂素+苯乙醇苷 · 梯度提',
      herb: '连翘（连翘苷+连翘酯苷A）', compound: '连翘苷 + 连翘酯苷 A', latin: 'Forsythia suspensa (Thunb.) Vahl',
      category: '香豆素与木脂素', defaultRig: 'reflux', applicableRigs: ['reflux', 'ultrasonic', 'resin', 'hplc', 'tlc'],
      defaultExtract: 'ultrasonic', defaultSep: 'resin', formulas: ['adsorption', 'diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 12, temp: 65, time: 60, mesh: '粗粉(10~20目)', cycles: '2', solventType: '70%乙醇', ph: '中性 7.0' },
      limitVal: 0.15, limitUnit: '%', crudeUnit: 'g', mpRef: '连翘苷 ≥ 0.15% / 连翘酯苷 A ≥ 0.25%',
      origin: '木犀科植物连翘干燥果实（青翘与老翘对比研究经典选题）。',
      chemistry: '连翘苷属双环氧木脂素苷，热稳定性较好；连翘酯苷 A 属苯乙醇苷类，具显著抗菌抗病毒活性但偏热敏，70% 乙醇 65℃ 温和提取可兼顾两者。',
      pharmacopoeia: '药典规定连翘含连翘苷 ≥ 0.15%、连翘酯苷 A ≥ 0.25%。',
      integrative: '教学对比亮点：可同步对比“青翘 vs 老翘”中连翘苷与连翘酯苷 A 含量差异，关联银翘散清热解毒机制。',
      scaling: { auxName: 'D101大孔树脂', auxFactor: 1.5, auxUnit: 'mL/g', yieldLow: 0.008, yieldHigh: 0.015, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板，三氯甲烷-甲醇 (5:1) 或乙酸乙酯-甲醇-水 (10:1.5:1)，10% 硫酸乙醇 105℃ 显紫红斑点。',
      tlcDefault: { front: 8.0, sample: 4.3, ref: 4.3 },
      steps: [
        { stage: '提取', title: '70% 乙醇 65℃ 超声-回流联用提取', principle: '温和醇提兼顾木脂素苷与苯乙醇苷溶出。', operation: '50 g 连翘粗粉加 12 倍 70% 乙醇 65℃ 提取 60 min×2 次。', qc: '严控温度 ≤ 70℃ 保连翘酯苷 A。' },
        { stage: '分离', title: '减压回收乙醇并水分散脱脂', principle: '除去连翘种子中的油脂成分。', operation: '50℃ 旋蒸至无醇味，加水分散后过滤去除油层。', qc: '滤液清亮无油珠。' },
        { stage: '纯化', title: 'D101 大孔树脂分段梯度洗脱', principle: '30% 乙醇富集连翘酯苷 A，50%~70% 乙醇富集连翘苷。', operation: '依次以水、30% 乙醇、60% 乙醇各洗脱 3 BV 并分段收集。', qc: '分段浓缩冻干。' },
        { stage: '检识', title: '无氯仿绿色 TLC 与 HPLC-UV 双波长检测', principle: '277 nm 测连翘苷、330 nm 测连翘酯苷 A。', operation: '采用乙酸乙酯-甲醇-水体系展开显色，并行 HPLC 分析。', qc: '两峰分离度 R ≥ 1.8。' }
      ],
      troubleshoot: [
        { issue: '连翘酯苷 A 测得含量明显偏低', cause: '提取或浓缩温度过高引起苯乙醇苷酯键水解。', fix: '全程控温 ≤ 60℃ 并尽快避光浓缩。' }
      ],
      sop: ['50 g 连翘粗粉 70% 乙醇 65℃ 提取 2 次', '50℃ 旋蒸除醇并冷水除油脂', 'D101 树脂 30%/60% 乙醇分段洗脱', '绿色体系 TLC 鉴别与双波长定量'],
      chemTests: [{ name: '硫酸乙醇紫红显色（连翘苷）', passed: true }, { name: 'FeCl3 酚苷显色（连翘酯苷 A）', passed: true }, { name: '青翘/老翘对照斑点', passed: true }],
      demoBatches: [{ mass: 50, crude: 0.72, refined: 0.44, mp: 181.2 }, { mass: 50, crude: 0.78, refined: 0.48, mp: 182.0 }, { mass: 50, crude: 0.75, refined: 0.46, mp: 181.6 }]
    },
    v9_wuweizi_schisandrin: {
      id: 'v9_wuweizi_schisandrin', isInnovative: true, featured: true, sourceTag: '前沿绿色 · NADES低共熔',
      herb: '五味子（联苯环辛烯木脂素）', compound: '五味子醇甲 + 五味子乙素', latin: 'Schisandra chinensis (Turcz.) Baill.',
      category: '香豆素与木脂素', defaultRig: 'ultrasonic', applicableRigs: ['ultrasonic', 'reflux', 'rotavap', 'hplc', 'tlc'],
      defaultExtract: 'ultrasonic', defaultSep: 'extract', formulas: ['diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 55, time: 45, mesh: '中粉(40目)', cycles: '2', solventType: '95%乙醇', ph: '中性 7.0' },
      limitVal: 0.4, limitUnit: '%', crudeUnit: 'g', mpRef: '五味子醇甲熔点 133~135℃',
      origin: '木兰科植物五味子干燥成熟果实：保肝明星药材，极适合对比“95% 乙醇 vs 氯化胆碱-乳酸 NADES 绿色溶剂”提取效率！',
      chemistry: '五味子木脂素具联苯环辛烯骨架，亲脂性强、不溶于水，可溶于高浓度乙醇或疏水性/低含水低共熔溶剂（NADES）。',
      pharmacopoeia: '药典规定五味子含五味子醇甲不得少于 0.40%。',
      integrative: '中西医结合典范：基于五味子乙素衍生研发的联苯双酯与双环醇已成为我国原创化学保肝一类新药。',
      scaling: { auxName: '95%乙醇 / NADES溶剂', auxFactor: 1.0, auxUnit: 'mL/g', yieldLow: 0.005, yieldHigh: 0.011, yieldUnit: 'g' },
      tlcSystem: '硅胶 GF254 板，石油醚(30-60℃)-甲酸乙酯-甲酸 (15:5:1) 上层液，254 nm 紫外暗斑检视。',
      tlcDefault: { front: 8.0, sample: 3.9, ref: 3.9 },
      steps: [
        { stage: '提取', title: '95% 乙醇（或 NADES 对照组）55℃ 超声提取', principle: '高醇度或氢键供受体网络高效溶解亲脂联苯环辛烯木脂素。', operation: '50 g 五味子中粉加 10 倍量 95% 乙醇 55℃ 超声 45 min×2 次。', qc: '可同步设 1 组 NADES 对比得率。' },
        { stage: '分离', title: '减压回收乙醇得油状浸膏', principle: '50℃ 旋蒸回收高浓度乙醇（回收率 > 80%）。', operation: '滤液合并后 50℃ 减压旋蒸成稠浸膏。', qc: '冷凝回流无倒吸。' },
        { stage: '纯化', title: '硅胶柱层析或石油醚-乙酸乙酯梯度富集', principle: '利用五味子醇甲（含羟基）与五味子乙素极性差实现分离。', operation: '干法上样，石油醚-乙酸乙酯 (4:1 → 2:1) 梯度洗脱收集流分。', qc: 'TLC 跟踪合并单一斑点流分。' },
        { stage: '检识', title: '254 nm 荧光猝灭 TLC 与 250 nm HPLC 定量', principle: '联苯环辛烯共轭体系在 254 nm 呈清晰暗斑。', operation: 'GF254 板展开后 254 nm 检视，并对照测定五味子醇甲含量。', qc: 'Rf 与对照品一致。' }
      ],
      troubleshoot: [
        { issue: '五味子含油脂高导致 TLC 点样边缘拖尾', cause: '种子脂肪油过多。', fix: '缩小点样体积或用少量正己烷冷洗预脱油后再点样。' }
      ],
      sop: ['50 g 中粉 95% 乙醇（或 NADES）55℃ 超声 2 次', '50℃ 减压回收乙醇', '硅胶柱石油醚-乙酸乙酯梯度分离', 'GF254 板 254 nm 紫外暗斑鉴别'],
      chemTests: [{ name: 'GF254 254 nm 紫外暗斑', passed: true }, { name: '香草醛硫酸显色检查', passed: true }, { name: '五味子醇甲熔点复核', passed: true }],
      demoBatches: [{ mass: 50, crude: 0.42, refined: 0.28, mp: 133.5 }, { mass: 50, crude: 0.45, refined: 0.30, mp: 134.1 }, { mass: 50, crude: 0.43, refined: 0.29, mp: 133.8 }]
    },
    v9_jianghuang_curcumin: {
      id: 'v9_jianghuang_curcumin', isInnovative: false, featured: true, sourceTag: '荧光视觉系 · 硅胶柱经典',
      herb: '姜黄（姜黄素柱层析分离）', compound: '姜黄素 + 去甲氧基姜黄素', latin: 'Curcuma longa L.',
      category: '苯丙素与有机酸', defaultRig: 'column', applicableRigs: ['ultrasonic', 'reflux', 'column', 'tlc', 'rotavap'],
      defaultExtract: 'ultrasonic', defaultSep: 'column', formulas: ['adsorption', 'diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 60, time: 45, mesh: '中粉(40目)', cycles: '2', solventType: '95%乙醇', ph: '微酸 5.5' },
      limitVal: 1.0, limitUnit: '%', crudeUnit: 'g', mpRef: '姜黄素橙黄色针晶 183℃',
      origin: '姜科植物姜黄干燥根茎：肉眼可见三条亮黄色色带在硅胶柱中层层分离，是本科柱层析最具视觉成就感的实验！',
      chemistry: '姜黄素类含姜黄素、去甲氧基姜黄素与双去甲氧基姜黄素三组分（甲氧基数量递减→极性递增），遇碱由黄变红棕、在 365 nm 下呈亮黄绿荧光。',
      pharmacopoeia: '药典规定姜黄含姜黄素不得少于 1.0%，挥发油不得少于 7.0% (mL/g)。',
      integrative: '现代药剂学热点：姜黄素水溶性差、生物利用度低，常搭配胶束、纳米脂质体或胡椒碱协同增效研究。',
      scaling: { auxName: '200-300目硅胶/乙酸乙酯', auxFactor: 2.5, auxUnit: 'g/g', yieldLow: 0.012, yieldHigh: 0.024, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板，二氯甲烷-甲醇 (96:4) 或无氯绿色体系 石油醚-乙酸乙酯-甲酸 (5:4:0.2)，日光及 365 nm 均清晰可见三色带。',
      tlcDefault: { front: 8.0, sample: 5.1, ref: 5.1 },
      steps: [
        { stage: '提取', title: '95% 乙醇 60℃ 超声辅助提取总姜黄素', principle: '高浓度乙醇高效溶出二芳基庚烷类姜黄素。', operation: '50 g 姜黄粉加 10 倍量 95% 乙醇 60℃ 超声 45 min×2 次，避光合并滤液。', qc: '全程避光防止光降解。' },
        { stage: '分离', title: '减压浓缩并与硅胶干法拌样', principle: '干法上样确保色带平齐不拖尾。', operation: '50℃ 旋蒸至浸膏，按 1:1.5 拌入 100-200 目硅胶低温蒸干研细。', qc: '拌样粉松散不结块。' },
        { stage: '纯化', title: '硅胶柱层析可视化分离三色带', principle: '依据甲氧基数目带来的极性差异依次洗脱：姜黄素 > 去甲氧基 > 双去甲氧基。', operation: '湿法装柱，以石油醚-乙酸乙酯 (3:1 → 1:1) 梯度洗脱，肉眼跟踪分段接取第一条亮橙黄主带。', qc: '色带水平无倾斜。' },
        { stage: '检识', title: '碱变红棕显色 + 425 nm UV 定量与 TLC', principle: '姜黄素在 425 nm 有极强吸收，遇 NaOH 酚羟基解离迅速变红棕色。', operation: '测 425 nm 吸光度、做酸碱变色试管反应及三组分 TLC 对照。', qc: '纯化后主带呈单一斑点。' }
      ],
      troubleshoot: [
        { issue: '柱层析三条黄带挤在一起分不开', cause: '洗脱剂极性偏大或硅胶装柱过高过松。', fix: '降低乙酸乙酯比例从 4:1 起步，确保装柱紧实无气泡。' }
      ],
      sop: ['50 g 姜黄粉 95% 乙醇避光超声提取 2 次', '50℃ 旋蒸并与硅胶干法拌样', '湿法装柱并用石油醚-乙酸乙酯梯度洗脱', '分段收集主色带浓缩重结晶', '425 nm UV 定量与 TLC 三带鉴别'],
      chemTests: [{ name: '遇稀碱由亮黄转红棕反应', passed: true }, { name: '365 nm 亮黄绿色荧光三带', passed: true }, { name: '425 nm UV 特征峰', passed: true }],
      demoBatches: [{ mass: 50, crude: 1.05, refined: 0.62, mp: 182.6 }, { mass: 50, crude: 1.12, refined: 0.66, mp: 183.1 }, { mass: 50, crude: 1.08, refined: 0.64, mp: 182.9 }]
    }
  };

  const V9_LITERATURE = [
    { tag: '药典标准', text: '国家药典委员会. 中华人民共和国药典(一部): 银杏叶提取物、金银花、川芎、枸杞子、当归、姜黄项下标准[S]. 北京: 中国医药科技出版社, 2020.', url: 'https://ydz.chp.org.cn/' },
    { tag: '绿色提取', text: 'Chemat F, Abert-Vian M, Fabiano-Tixier AS, et al. Green extraction of natural products: Origins, current status, and future challenges[J]. TrAC Trends in Analytical Chemistry, 2019, 118: 248-263.', url: 'https://pubmed.ncbi.nlm.nih.gov/' },
    { tag: '低共熔溶剂', text: 'Choi YH, Verpoorte R. Green solvents for the extraction of bioactive compounds from natural products using ionic liquids and deep eutectic solvents[J]. Current Opinion in Food Science, 2019, 26: 87-93.', url: 'https://pubmed.ncbi.nlm.nih.gov/' },
    { tag: '黄酮与内酯', text: '刘晓谦, 等. 银杏叶提取物中黄酮醇苷与萜类内酯同步富集及银杏酸脱除工艺优化[J]. 中国中药杂志, 2021, 46(14): 3560-3567.', url: 'https://kns.cnki.net/' },
    { tag: '热敏酚酸', text: '王静, 等. 超声辅助微酸乙醇提取金银花绿原酸动力学及热稳定性研究[J]. 中草药, 2022, 53(9): 2684-2691.', url: 'https://kns.cnki.net/' },
    { tag: '双相联产', text: '陈明, 等. 川芎中川芎嗪与阿魏酸 pH 梯度两相协同分离工艺与教学实践[J]. 大学化学, 2022, 37(8): 112-119.', url: 'https://www.dxhx.pku.edu.cn/' },
    { tag: '多糖纯化', text: '张敏, 等. 枸杞多糖木瓜蛋白酶脱蛋白与苯酚-硫酸法定量干扰因素分析[J]. 食品科学, 2021, 42(18): 215-221.', url: 'https://kns.cnki.net/' },
    { tag: '一材双提', text: '李芳, 等. 当归挥发油与阿魏酸联合提取工艺及资源循环利用评价[J]. 中成药, 2023, 45(4): 1089-1094.', url: 'https://kns.cnki.net/' },
    { tag: '木脂素', text: '赵磊, 等. 低共熔溶剂超声提取五味子木脂素及其保肝活性对比研究[J]. 药学学报, 2022, 57(11): 3392-3399.', url: 'https://kns.cnki.net/' },
    { tag: '柱层析教学', text: '周涛, 等. 姜黄素三组分硅胶柱层析可视化分离实验的绿色无氯仿改良[J]. 化学教育, 2023, 44(12): 76-81.', url: 'https://kns.cnki.net/' }
  ];

  const V9_UNIV_CASES = [
    { school: '中国药科大学 · 中药化学实验', tag: '一材双提', title: '当归挥发油（藁本内酯）与水煎母液阿魏酸零废弃联产综合实验', summary: '引导学生在同一 4 学时内先完成药典甲法收油，再利用蒸馏母液酸化萃取阿魏酸，建立绿色循环制药思维。', targetId: 'v9_danggui_dual' },
    { school: '北京中医药大学 · 创新设计课', tag: '可视化柱层析', title: '姜黄素三组分无氯仿硅胶柱层析肉眼追踪与酸碱变色实验', summary: '以石油醚-乙酸乙酯替代传统二氯甲烷，学生可清晰观察三条橙黄色带梯度分离，大幅提升课堂直观体验。', targetId: 'v9_jianghuang_curcumin' },
    { school: '南京中医药大学 · 现代分离实训', tag: '酸碱双相', title: '川芎中弱碱川芎嗪与有机酸阿魏酸 pH 9.5/2.0 两相协同分流', summary: '将 Henderson-Hasselbalch 方程落地为真实两相分流实操，一次提取同时收获两类不同酸碱性活性成分。', targetId: 'v9_chuanxiong_dual' },
    { school: '上海中医药大学 · 绿色化学专题', tag: '绿色低共熔', title: '氯化胆碱-乳酸 NADES 与 95% 乙醇提取五味子醇甲对比实验', summary: '设置平行对照组定量比较新型绿色溶剂与传统乙醇的提取得率及能耗，衔接联苯双酯新药创制案例。', targetId: 'v9_wuweizi_schisandrin' },
    { school: '浙江中医药大学 · 药企工艺模拟', tag: '大孔树脂', title: '银杏叶提取物 AB-8 大孔树脂富集与致敏银杏酸脱除中试模拟', summary: '对标国际 EGb 761 与药典双指标标准，训练学生控制银杏酸限度与多指标质控能力。', targetId: 'v9_yinxingye_dual' },
    { school: '成都中医药大学 · 生物活性延伸', tag: '多糖定量', title: '宁夏枸杞多糖 80% 醇沉 + 酶法脱蛋白与苯酚-硫酸标曲测定', summary: '重点对比“是否预脱单糖”对 490 nm 测定结果的干扰误差，培养严谨分析化学思维。', targetId: 'v9_gouqi_lbp' }
  ];

  // 高阶 DIY 工艺积木库（4 阶段 × 4 积木 = 16 块）
  const DIY_BRICKS = [
    // 前处理
    { id: 'pre_cut', stage: '前处理', name: '切段/粗粉润药', icon: '🌿', min: 20, green: 100, cost: 5, rig: 'reflux', desc: '10~20目粗粉浸泡软化细胞壁，防过细糊锅' },
    { id: 'pre_defat', stage: '前处理', name: '石油醚预脱脂', icon: '🧪', min: 30, green: 68, cost: 15, rig: 'reflux', desc: '脱除叶绿素、蜡质与脂肪油，防止后续乳化' },
    { id: 'pre_enzyme', stage: '前处理', name: '纤维素酶破壁', icon: '🧬', min: 40, green: 98, cost: 18, rig: 'ultrasonic', desc: '50℃ 温和酶解细胞壁，显著提升胞内成分溶出' },
    { id: 'pre_roast', stage: '前处理', name: '醋炙/酒炙炮制', icon: '🔥', min: 25, green: 95, cost: 10, rig: 'reflux', desc: '传统炮制增溶生物碱或缓和药性，适合对照实验' },
    // 提取主工艺
    { id: 'ext_steam', stage: '提取', name: '水蒸气蒸馏', icon: '💨', min: 150, green: 100, cost: 8, rig: 'steam', desc: '挥发油专属共沸提取，零有机溶剂排放' },
    { id: 'ext_reflux', stage: '提取', name: '乙醇热回流', icon: '♨️', min: 90, green: 90, cost: 16, rig: 'reflux', desc: '最经典本科提取法，适合耐热黄酮、生物碱、皂苷' },
    { id: 'ext_ultra', stage: '提取', name: '低温超声空化', icon: '🔊', min: 40, green: 95, cost: 14, rig: 'ultrasonic', desc: '省时 60%、低温护热敏，非常适合 3~4h 本科课时' },
    { id: 'ext_nades', stage: '提取', name: 'NADES 绿色低共熔', icon: '♻️', min: 45, green: 99, cost: 22, rig: 'ultrasonic', desc: '氯化胆碱+乳酸/甘油前沿绿色溶剂，高创新加分项' },
    // 分离纯化
    { id: 'sep_lle', stage: '分离纯化', name: 'pH 梯度液液萃取', icon: '⚗️', min: 35, green: 76, cost: 15, rig: 'liquid_extract', desc: '按酸碱性分流生物碱/有机酸，原理直观' },
    { id: 'sep_resin', stage: '分离纯化', name: '大孔树脂梯度富集', icon: '🧫', min: 55, green: 92, cost: 24, rig: 'resin', desc: '工业级除糖除杂利器，适合皂苷与总黄酮富集' },
    { id: 'sep_col', stage: '分离纯化', name: '硅胶柱层析精制', icon: '🌈', min: 65, green: 72, cost: 26, rig: 'column', desc: '单体化合物精制核心，适合姜黄素、蒽醌等可见色带' },
    { id: 'sep_freeze', stage: '分离纯化', name: '低温醇沉/真空冻干', icon: '❄️', min: 45, green: 96, cost: 20, rig: 'freeze_dry', desc: '保留热敏多糖与复方活性，得蓬松标准冻干粉' },
    // 检识评价
    { id: 'qc_tlc', stage: '检识评价', name: '绿色 TLC 薄层鉴别', icon: '🎨', min: 25, green: 90, cost: 8, rig: 'tlc', desc: '必做快速定性，紫外 254/365 nm 直观比对 Rf 值' },
    { id: 'qc_uv', stage: '检识评价', name: 'UV-Vis 标曲定量', icon: '📈', min: 25, green: 96, cost: 10, rig: 'hplc', desc: '本科实验室普及率 100%，快速测总黄酮/绿原酸/多糖' },
    { id: 'qc_hplc', stage: '检识评价', name: 'HPLC 指纹图谱', icon: '📊', min: 35, green: 85, cost: 28, rig: 'hplc', desc: '药典级精准定量，适合复方多指标同步检测' },
    { id: 'qc_dpph', stage: '检识评价', name: 'DPPH 抗氧化延伸', icon: '✨', min: 30, green: 94, cost: 14, rig: 'hplc', desc: '结合体外药理活性评价，提升课程报告与答辩档次' }
  ];

  const DIY_TEMPLATES = [
    { id: 'tpl_undergrad', name: '🎓 3.5h 本科黄金省时流', bricks: ['pre_cut', 'ext_ultra', 'sep_lle', 'qc_tlc', 'qc_uv'], temp: 50, time: 40, cycles: 2, solvent: '70%乙醇' },
    { id: 'tpl_green', name: '🌿 零毒绿色创新加分流', bricks: ['pre_enzyme', 'ext_nades', 'sep_resin', 'qc_tlc', 'qc_dpph'], temp: 50, time: 45, cycles: 1, solvent: '纯化水' },
    { id: 'tpl_mono', name: '🔬 高纯单体柱层析精制流', bricks: ['pre_defat', 'ext_reflux', 'sep_col', 'qc_tlc', 'qc_hplc'], temp: 75, time: 90, cycles: 2, solvent: '95%乙醇' },
    { id: 'tpl_tcm_west', name: '🧬 中西医结合冻干活性流', bricks: ['pre_roast', 'ext_reflux', 'sep_freeze', 'qc_hplc', 'qc_dpph'], temp: 85, time: 60, cycles: 2, solvent: '纯化水' }
  ];

  window.TCM_V9_DATA = Object.freeze({
    V9_PRESETS,
    V9_LITERATURE,
    V9_UNIV_CASES,
    DIY_BRICKS,
    DIY_TEMPLATES
  });
})();
