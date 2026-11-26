/**
 * 本草智研 v27 · 药材题库六大学科全链路智能增强引擎
 * 为题库全部 133+ 项药材课题自动匹配：
 *   01 中药化学（生物合成途径 + 分离路线推导）
 *   02 中药制剂（剂型适配 + 辅料/增溶对策）
 *   03 中药制药工艺（提取纯化 + 浓缩干燥 + 放大要点）
 *   04 分析化学（误差控制 + 滴定/前处理要点）
 *   05 仪器分析（UV/IR/NMR/MS/HPLC/GC 选型与特征）
 *   06 中药制剂分析（TLC 鉴别 + 安全性检查 + QAMS/指纹图谱）
 * 并提供一键直达六大学科知识库对应章节的深度链接
 */

const CLASS_PROFILES = {
  生物碱: {
    biosyn: '氨基酸途径',
    biosynDetail: '苯丙氨酸/酪氨酸/色氨酸/鸟氨酸/赖氨酸衍生；含氮杂环碱性骨架，成盐后水溶性反转。',
    chemSep: '酸水提取→碱化游离→有机溶剂萃取；多组分按 pKa 差异采用 pH 梯度萃取或离子交换树脂分离。',
    formulation: '苦味重且部分对胃有刺激，宜制包衣片、硬胶囊或缓释骨架片；难溶游离碱可成盐酸盐/硫酸盐改善溶出。',
    process: '工业常用酸水渗漉/逆流提取或 70% 乙醇热回流；纯化优先阳离子交换树脂或大孔树脂，注意 pH 精准控制防酯键水解。',
    analytical: '滴定法可用非水酸碱滴定（冰醋酸-高氯酸体系，消除水拉平效应）；样品前处理注意氨水润湿破结合态。',
    instrument: 'HPLC 需加缓冲盐或离子对试剂（如 SDS/三乙胺）防拖尾；MS 正离子 ESI⁺ 响应极高（[M+H]⁺ 偶/奇数氮律）；NMR 关注 N-CH₃（δ 2.3~3.2）。',
    qc: 'TLC 展开剂常加氨蒸气预饱和防拖尾，喷改良碘化铋钾显橘红；剧毒生物碱（附子/马钱子）须严格控制上限与下限双限度。',
    kbLinks: [
      { book: 'vol01', sec: 's4', label: '01 中药化学 · 第4章 生物碱' },
      { book: 'vol03', sec: 's4', label: '03 制药工艺 · 分离纯化' },
      { book: 'vol04', sec: 's4', label: '04 分析化学 · 非水滴定' },
      { book: 'vol06', sec: 's6', label: '06 制剂分析 · 含量测定' }
    ]
  },
  黄酮: {
    biosyn: '混合途径（莽草酸+乙酸）',
    biosynDetail: 'C6-C3-C6 苯色原酮母核，多带酚羟基呈弱酸性，苷类水溶/醇溶，苷元偏亲脂。',
    chemSep: '碱溶酸沉（防过碱氧化）、聚酰胺色谱（氢键吸附规律：酚羟基越多吸附越强）或大孔吸附树脂梯度洗脱。',
    formulation: '黄酮苷元普遍水溶性差（BCS Ⅱ类），宜采用 PVP 固体分散体、β-CD 包合、磷脂复合物或微粉化提升溶出度。',
    process: '含苷类（如黄芩苷）须先沸水或热醇杀酶保苷；醇提液浓缩温度 ≤ 65℃ 防氧化变色，大孔树脂 40%~70% 乙醇段富集。',
    analytical: 'UV 测定总黄酮常用 NaNO₂-Al(NO₃)₃-NaOH 比色法（500~510 nm）或 AlCl₃ 络合显色；注意标准品选型引入的系统误差。',
    instrument: 'UV 具带Ⅰ（300~400 nm，桂皮酰基）与带Ⅱ（240~285 nm，苯甲酰基），加诊断试剂（NaOMe/NaOAc/AlCl₃）可判酚羟基位置；¹H-NMR 关注 A 环间位偶合（J≈2 Hz）及 5-OH（δ 12~13）。',
    qc: 'TLC 喷 1% AlCl₃ 乙醇液在 UV 365 nm 下呈亮黄绿荧光；多黄酮共存在制剂中推荐采用 QAMS 一测多评降本增效。',
    kbLinks: [
      { book: 'vol01', sec: 's7', label: '01 中药化学 · 第7章 黄酮类' },
      { book: 'vol02', sec: 's5', label: '02 中药制剂 · 难溶增溶对策' },
      { book: 'vol05', sec: 's2', label: '05 仪器分析 · UV-Vis 光谱' },
      { book: 'vol06', sec: 's6', label: '06 制剂分析 · QAMS 一测多评' }
    ]
  },
  蒽醌与醌类: {
    biosyn: '乙酸-丙二酸 / MEP 途径',
    biosynDetail: '醌类含共轭二酮发色团（显黄/橙/红/紫）；羟基蒽醌酸性遵循：-COOH > β-OH > α-OH。',
    chemSep: '游离蒽醌经典 pH 梯度萃取：5% NaHCO₃（提含羧基大黄酸）→ 5% Na₂CO₃（提 β-OH 大黄素）→ 1% NaOH（提 α-OH 酚羟基）。',
    formulation: '菲醌/萘醌强亲脂易光解，宜用避光铝塑包装、滴丸（PEG 固体分散体）或软胶囊；蒽醌苷泻下制剂宜制肠溶片/包衣片。',
    process: '热敏菲醌/萘醌须低温避光醇提或超临界萃取；浓缩避强光防邻菲醌氧化褪色；大孔树脂或硅胶柱分级。',
    analytical: '含量测定前处理若测总蒽醌须严格控制酸水解回流时间与酸度，防止游离蒽醌损失造成回收率偏低。',
    instrument: 'UV 具多个特征芳环与醌羰基吸收；IR 在 1675~1620 cm⁻¹ 呈强 C=O 伸缩振动（螯合 α-OH 使波数降低）；HPLC 避光进样。',
    qc: 'Bornträger 碱液显色鉴别（羟基蒽醌显红，萘醌紫草素显蓝紫）；游离与结合蒽醌须分轨质控。',
    kbLinks: [
      { book: 'vol01', sec: 's5', label: '01 中药化学 · 第5章 醌类' },
      { book: 'vol02', sec: 's7', label: '02 中药制剂 · 固体制剂/滴丸' },
      { book: 'vol05', sec: 's3', label: '05 仪器分析 · 红外与近红外' },
      { book: 'vol06', sec: 's4', label: '06 制剂分析 · TLC 鉴别规范' }
    ]
  },
  香豆素与木脂素: {
    biosyn: '莽草酸途径',
    biosynDetail: '苯丙素 C6-C3 衍生物；香豆素具苯骈 α-吡喃酮内酯母核，木脂素为两分子苯丙素氧化聚合。',
    chemSep: '香豆素可用温和碱溶酸沉（控温防不可逆顺反异构）；木脂素脂溶性强，常用先脱脂 + 醇提 + 硅胶/大孔树脂纯化。',
    formulation: '亲脂性香豆素/木脂素适合软胶囊、微乳或滴丸；种子类含大量脂肪油（如牛蒡子/五味子），成型前须彻底除油防渗油。',
    process: '渗漉法或中低浓度乙醇回流；厚朴/五味子等脂溶性木脂素适合超临界 CO₂ 绿色萃取，无溶剂残留。',
    analytical: '含酯侧链香豆素（如白花前胡甲素）前处理忌用强酸碱，需验证溶液 24 h 稳定性（RSD ≤ 2%）。',
    instrument: '香豆素在 UV 365 nm 下呈强蓝色/黄绿色荧光；¹H-NMR 关注 C3-H（δ 6.1~6.4）与 C4-H（δ 7.5~8.3）一对顺式双键（J≈9.5 Hz）。',
    qc: '异羟肟酸铁反应显红色鉴别内酯环；易混伪品种（如前胡）须采用双指标 HPLC 联合控伪。',
    kbLinks: [
      { book: 'vol01', sec: 's6', label: '01 中药化学 · 第6章 苯丙素类' },
      { book: 'vol03', sec: 's3', label: '03 制药工艺 · 提取工艺全景' },
      { book: 'vol05', sec: 's5', label: '05 仪器分析 · NMR 特征区' },
      { book: 'vol06', sec: 's5', label: '06 制剂分析 · 检查项全表' }
    ]
  },
  挥发油与萜类: {
    biosyn: 'MEP/DXP 途径',
    biosynDetail: '单萜/倍半萜及芳香族小分子，强亲脂、易挥发，常温可随水蒸气共沸蒸出。',
    chemSep: '水蒸气蒸馏（药典甲/乙法）+ 盐析分层；热敏挥发油优先超临界 CO₂ 萃取或低温渗漉；分馏/冷冻结晶分离单体（如薄荷脑）。',
    formulation: '液态挥发油直接入固体制剂易挥发渗油，工业标配 β-环糊精（β-CD）饱和水溶液法/研磨法包合固化，或制软胶囊。',
    process: '蒸馏务必“先通冷凝水再加热”，并采用“挥发油先提 + 药渣水提”双提法；中试放大须精准控制蒸汽压力与防暴沸。',
    analytical: '药典四部通则 2204 挥发油测定法注意比重差异（轻油用甲法、重油如丁香/肉桂用乙法加二甲苯）；进样瓶严密封口防挥发误差。',
    instrument: '多数饱和单萜无强紫外吸收，首选毛细管气相色谱 GC-FID 或 GC-MS（结合 NIST 谱库与保留指数 RI 定性定量）。',
    qc: '关注折光率、相对密度、比旋度及 GC 指纹图谱；包合物须测定包合率与收得率双指标。',
    kbLinks: [
      { book: 'vol01', sec: 's8', label: '01 中药化学 · 第8章 萜类与挥发油' },
      { book: 'vol02', sec: 's10', label: '02 中药制剂 · 环糊精包合技术' },
      { book: 'vol03', sec: 's3', label: '03 制药工艺 · 中药双提法' },
      { book: 'vol05', sec: 's7', label: '05 仪器分析 · 气相色谱 GC/MS' }
    ]
  },
  萜类内酯与环烯醚萜: {
    biosyn: 'MEP / MVA 途径',
    biosynDetail: '含内酯环或半缩醛环烯醚萜结构，对热、酸、碱或内源酶敏感（如青蒿素过氧桥、栀子苷易变蓝）。',
    chemSep: '低温醇提/超临界提取防降解；环烯醚萜苷用大孔树脂水洗-低醇洗脱；萜类内酯用硅胶柱或低温重结晶。',
    formulation: '酸敏/热敏内酯宜选用温和非水制粒、低温真空干燥或流化床喷雾干燥，必要时采用肠溶包衣防胃酸破坏。',
    process: '提取温度严格控制在 45~65℃ 以下；干燥环节优先减压真空干燥或喷雾干燥，杜绝高温烘箱长时间烘烤。',
    analytical: '样品前处理严禁过酸过碱；含过氧桥（青蒿素）或无强共轭双键内酯（银杏内酯）须选用 ELSD 检测器或柱前衍生。',
    instrument: 'HPLC-ELSD 解决无紫外吸收难题（如银杏内酯 A/B/C）；IR 1740~1780 cm⁻¹ 呈强五元/六元内酯羰基吸收；2D NMR 确证立体构型。',
    qc: '环烯醚萜加酸/氨基酸易显深蓝或红紫（可作特征鉴别，也是提取变色警示）；重视加速稳定性试验降解产物监控。',
    kbLinks: [
      { book: 'vol01', sec: 's8', label: '01 中药化学 · 萜类内酯与环烯醚萜' },
      { book: 'vol03', sec: 's6', label: '03 制药工艺 · 低温浓缩与干燥' },
      { book: 'vol05', sec: 's6', label: '05 仪器分析 · 质谱与 ELSD' },
      { book: 'vol06', sec: 's12', label: '06 制剂分析 · 稳定性研究' }
    ]
  },
  皂苷与三萜: {
    biosyn: 'MVA 途径（甲羟戊酸）',
    biosynDetail: '三萜苷元连 1~5 糖链，具显著两亲性、起泡性与溶血性；亲水性随糖链增长而增大。',
    chemSep: '醇提浓缩后水饱和正丁醇液液萃取富集，或 D101/AB-8 大孔吸附树脂水洗除糖→50%~75% 乙醇洗脱总皂苷。',
    formulation: '严禁未经纯化直接制成静脉注射剂（溶血风险！）；口服制剂注意浸膏吸湿发黏，宜配伍微晶纤维素/二氧化硅防吸潮。',
    process: '提取与减压浓缩极易起泡冲料，中试设备须配消泡器/防暴沸缓冲球，装液量 ≤ 1/2 罐容积，必要时加药用级硅酮消泡剂。',
    analytical: '香草醛-高氯酸/冰醋酸比色法测总皂苷时严格控制显色温度（60℃）与时间；对照品注意含水量校正。',
    instrument: '多数三萜皂苷仅具 203 nm 末端紫外吸收，HPLC 须使用色谱纯乙腈-水梯度（防甲醇截止波长干扰）或改用 ELSD/CAD/LC-MS 检测。',
    qc: 'Liebermann-Burchard 反应显紫红→蓝绿；中试与制剂须监控农残、重金属（根茎类药材重点项）及多皂苷指纹图谱。',
    kbLinks: [
      { book: 'vol01', sec: 's9', label: '01 中药化学 · 第9章 三萜及其苷' },
      { book: 'vol02', sec: 's4', label: '02 中药制剂 · 粉体学与浸膏防潮' },
      { book: 'vol03', sec: 's4', label: '03 制药工艺 · 大孔吸附树脂' },
      { book: 'vol06', sec: 's5', label: '06 制剂分析 · 重金属与农残检查' }
    ]
  },
  甾体与强心苷: {
    biosyn: 'MVA 途径（甾体母核）',
    biosynDetail: '环戊烷并多氢菲母核；强心苷含不饱和内酯环与 2-去氧糖（极易酸水解），甾体皂苷多为螺甾烷醇型。',
    chemSep: '强心苷严禁酸水解，用 70% 乙醇低温提取 + 醋酸铅/氧化铝脱杂；甾体皂苷用醇提 + 正丁醇/大孔树脂富集。',
    formulation: '强心苷类治疗窗极窄、剂量微克级，制剂最核心难点是“含量均匀度（通则 0941）”，须采用等量递增混合与严格限度控制。',
    process: '强心苷提取须抑制内源酶切去末端葡萄糖（保留原生苷或定向控制次生苷）；提取浓缩全程控温防内酯环破坏。',
    analytical: '2-去氧糖与 Keller-Kiliani 试剂显蓝色界环；甲型强心苷与 Kedde / Legal 试剂显特征红紫色。',
    instrument: '甾体皂苷多在 203 nm 乙腈梯度或 ELSD 测定；强心苷甲型 UV 217~220 nm、乙型（蟾酥）295~300 nm 特征吸收清晰区分。',
    qc: '剧毒/窄治疗窗品种重点检查含量均匀度、降解产物及基原真伪；多指标总和定量（如重楼皂苷Ⅰ+Ⅱ+Ⅶ）。',
    kbLinks: [
      { book: 'vol01', sec: 's10', label: '01 中药化学 · 第10章 甾体及其苷' },
      { book: 'vol02', sec: 's7', label: '02 中药制剂 · 微量混合均匀度' },
      { book: 'vol05', sec: 's6', label: '05 仪器分析 · 质谱与高灵敏检测' },
      { book: 'vol06', sec: 's5', label: '06 制剂分析 · 含量均匀度检查' }
    ]
  },
  多糖类: {
    biosyn: '光合碳水化合物聚合',
    biosynDetail: '多由 ≥10 个单糖缩合而成的水溶性生物大分子（或水溶性活性多肽），不溶于高浓度乙醇，无特征紫外吸收。',
    chemSep: '热水浸提 + 浓缩 + 75%~80% 乙醇醇沉；Sevag 法/酶法脱蛋白 + 透析/超滤除小分子盐与游离糖。',
    formulation: '多糖吸湿性极强且黏度高，适合制颗粒剂、口服液、冻干粉针或喷雾干燥微粉（可加麦芽糊精抗粘壁）。',
    process: '水提醇沉是工业核心：先将水提液浓缩至相对密度 1.10~1.20（60℃），再慢速边搅边加乙醇至目标醇度，低温静置 12~24 h。',
    analytical: '苯酚-硫酸法（490 nm）或蒽酮-硫酸法（620 nm）测总糖；注意扣除游离还原糖（DNS 法）避免多糖含量虚高。',
    instrument: 'HPGPC（高效凝胶渗透色谱）-RI/MALLS 测定分子量分布；PMP 柱前衍生 HPLC 分析单糖组成；动物多肽类采用生物效价法（U/g）。',
    qc: '检查单糖组成比、重均分子量、蛋白残留（UV 280 nm）及微生物限度（富含营养极易染菌！）。',
    kbLinks: [
      { book: 'vol01', sec: 's3', label: '01 中药化学 · 第3章 糖和苷/多糖' },
      { book: 'vol03', sec: 's4', label: '03 制药工艺 · 醇沉与水沉工艺' },
      { book: 'vol04', sec: 's2', label: '04 分析化学 · 回归与标准曲线' },
      { book: 'vol06', sec: 's8', label: '06 制剂分析 · 生物效价与多糖质控' }
    ]
  },
  氰苷类: {
    biosyn: '氨基酸衍生物糖苷化',
    biosynDetail: '含氰醇羟基糖苷（苦杏仁苷）或硫苷（黑芥子苷）；自带内源水解酶，遇温水极易分解产剧毒 HCN 或辛辣异硫氰酸酯。',
    chemSep: '首步必须“燀制/炒制/热乙醇瞬时杀酶保苷”，随后 70% 乙醇回流提取并低温重结晶或离子交换纯化。',
    formulation: '苦杏仁/芥子含大量脂肪油，常采用“去皮尖→冷榨脱脂→热杀酶提取→制止咳颗粒/糖浆/贴膏”路线。',
    process: '严禁冷水长期浸泡！工业采用沸水短暂燀制或直接投入热乙醇罐灭酶，大幅提升原生苷保留率。',
    analytical: '苦味酸钠试纸检识释放的 HCN（黄→砖红）；滴定法（银量法）或 HPLC 210 nm 定量苦杏仁苷。',
    instrument: 'HPLC 210 nm（甲醇-水 20:80）测定苦杏仁苷，须监测 D/L 差向异构体转化；硫苷/芥子碱 227/326 nm 检测。',
    qc: '严格检查酶解失活率、油脂酸败度（过氧化值）及含毒药材安全限量。',
    kbLinks: [
      { book: 'vol01', sec: 's3', label: '01 中药化学 · 苷键裂解与杀酶保苷' },
      { book: 'vol03', sec: 's2', label: '03 制药工艺 · 前处理与灭酶' },
      { book: 'vol04', sec: 's6', label: '04 分析化学 · 沉淀与银量滴定' },
      { book: 'vol06', sec: 's3', label: '06 制剂分析 · 样品前处理' }
    ]
  },
  苯丙素与有机酸: {
    biosyn: '莽草酸途径',
    biosynDetail: '含酚羟基与羧基（绿原酸、丹酚酸 B、阿魏酸、迷迭香酸、没食子酸），水溶/极性醇溶，偏酸性，邻二酚羟基极易氧化褐变。',
    chemSep: '微酸低温超声/闪式提取防氧化；大孔树脂（pH 3~4 上样，20%~40% 乙醇洗脱）或乙酸乙酯酸化分配富集。',
    formulation: '易氧化变色，液体制剂需加抗氧剂（维生素 C/亚硫酸氢钠）、充氮并避光包装；固体制剂控水分活度防褐变。',
    process: '禁接触铁制容器（Fe³⁺ 与邻二酚羟基显墨绿/蓝黑）；浓缩温度 ≤ 60℃，优先真空低温浓缩与喷雾干燥。',
    analytical: '溶液配制宜加 0.1% 甲酸/磷酸稳 pH 防止酚酸异构化与电离拖尾；鞣质类采用通则 2202 干酪素差减比色法。',
    instrument: 'UV 320~330 nm 呈强共轭桂皮酰特征吸收（绿原酸 327 nm、阿魏酸 321 nm、丹酚酸 B 286 nm）；HPLC 必须加 0.1% 甲酸/磷酸抑制电离拖尾。',
    qc: 'FeCl₃ 显蓝绿/墨绿定性鉴别；重点监测加工过程异构化峰（新绿原酸/隐绿原酸）及指纹图谱相似度。',
    kbLinks: [
      { book: 'vol01', sec: 's6', label: '01 中药化学 · 苯丙素与酚酸' },
      { book: 'vol03', sec: 's5', label: '03 制药工艺 · 低温浓缩防褐变' },
      { book: 'vol05', sec: 's2', label: '05 仪器分析 · UV 与 HPLC 条件' },
      { book: 'vol06', sec: 's7', label: '06 制剂分析 · 指纹图谱建立' }
    ]
  }
};

const DEFAULT_PROFILE = CLASS_PROFILES['黄酮'];

const FAV_KEY = 'tcm_v27_bank_favorites';

export function getBankFavorites() {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch (_) {
    return new Set();
  }
}

export function toggleBankFavorite(id) {
  const favs = getBankFavorites();
  if (favs.has(id)) favs.delete(id);
  else favs.add(id);
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify([...favs]));
  } catch (_) {}
  return favs.has(id);
}

export function getTopicDisciplineProfile(topic) {
  if (!topic) return DEFAULT_PROFILE;
  const cat = String(topic.category || '');
  if (CLASS_PROFILES[cat]) return CLASS_PROFILES[cat];
  for (const key of Object.keys(CLASS_PROFILES)) {
    if (cat.includes(key) || key.includes(cat)) return CLASS_PROFILES[key];
  }
  return DEFAULT_PROFILE;
}

export function hasMol3dMatch(topic) {
  const reg = typeof window !== 'undefined' ? window.TCM_MOL3D_REGISTRY : null;
  if (!reg || !topic) return false;
  return !!reg.matchKey(`${topic.herb || ''} ${topic.compound || ''} ${topic.chemistry || ''}`);
}

export function isEastWestCompare(topic) {
  if (!topic) return false;
  const hay = `${topic.herb || ''} ${topic.compound || ''} ${topic.sourceTag || ''} ${topic.integrative || ''} ${topic.origin || ''}`;
  return /中西医|阿司匹林|柳树皮|紫杉醇|红豆杉|达菲|莽草酸|青蒿素|长春花|薯蓣|麻黄/.test(hay);
}

export function isLiaoningHerb(topic) {
  if (!topic) return false;
  if (topic.isLiaoyao) return true;
  const hay = `${topic.id || ''} ${topic.herb || ''} ${topic.sourceTag || ''}`;
  if (/西洋参/.test(hay)) return false;
  return /^liao_|辽五味|五味子|关龙胆|清原龙胆|龙胆|辽细辛|细辛|桓仁|辽藁本|关黄柏|关防风|刺五加|人参|穿山龙|满山红|鹿茸|威灵仙/.test(hay);
}

export function getExternalSearchUrls(topic) {
  const herb = String(topic?.herb || '').replace(/[（(].*?[）)]/g, '').trim() || '中药';
  const comp = String(topic?.compound || '').split(/[、/·→]/)[0].trim();
  const qCn = encodeURIComponent(`${herb} ${comp} 提取 纯化`.trim());
  const qEn = encodeURIComponent(`${topic?.latin || herb} ${comp}`.trim());
  return {
    cnki: `https://kns.cnki.net/kns8s/defaultresult/index?kw=${qCn}`,
    wanfang: `https://s.wanfangdata.com.cn/paper?q=${qCn}`,
    pubmed: `https://pubmed.ncbi.nlm.nih.gov/?term=${qEn}`,
    chp: 'https://ydz.chp.org.cn/'
  };
}

export function findRelatedLiterature(topic, limit = 4) {
  const api = typeof window !== 'undefined' ? window.TCM_LAB_API : null;
  const allLit = (api && typeof api.getAllLiterature === 'function')
    ? api.getAllLiterature()
    : (window.TCM_V27_KB_DATA?.V27_LITERATURE || []);
  if (!topic || !allLit.length) return [];

  const herbBase = String(topic.herb || '').replace(/[（(].*?[）)]/g, '').trim();
  const compBase = String(topic.compound || '').split(/[、/·→\s]/)[0].trim();
  const cat = String(topic.category || '');

  const scored = allLit.map((item) => {
    const t = String(item.text || '');
    let score = 0;
    if (herbBase && herbBase.length >= 2 && t.includes(herbBase)) score += 6;
    if (compBase && compBase.length >= 2 && t.includes(compBase)) score += 5;
    if (cat && t.includes(cat.slice(0, 2))) score += 2;
    if (item.cat === '药典教材') score += 1;
    return { item, score };
  });
  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.item);
}

if (typeof window !== 'undefined') {
  window.TCM_BANK_ENRICH = {
    getProfile: getTopicDisciplineProfile,
    getFavorites: getBankFavorites,
    toggleFavorite: toggleBankFavorite,
    hasMol3d: hasMol3dMatch,
    isEastWest: isEastWestCompare,
    isLiaoyao: isLiaoningHerb,
    getSearchUrls: getExternalSearchUrls,
    findRelatedLit: findRelatedLiterature
  };
}
