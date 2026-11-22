// 本草智研 v4.0 多维波谱解析与分析/保活级装置模块
// 新增：HPLC-DAD 高效液相色谱仪、真空冷冻干燥机 2 套动态 SVG 装置（全库 13 套）；
// 新增：11 大类化合物 UV诊断试剂 / IR / 1H-NMR / MS 四谱联合解析卡；
// 新增：Step 5 交互式 UV-Vis 标准曲线最小二乘拟合（A=kC+b, R²）与实测含量测定计算器。
(function () {
  'use strict';

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }

  const V4_RIGS = {
    hplc: {
      title: '高效液相色谱仪（HPLC-DAD）定量与指纹图谱系统',
      stageTag: '精密分析装置',
      videoKw: 'HPLC 操作',
      order: '流动相 0.45μm 抽滤超声脱气 20 min → 平衡 C18 色谱柱至基线平直 → 供试品与对照品经 0.22μm 针头滤膜过滤 → 设定波长与梯度程序进样 → 外标法积分定量 → 结束高水相冲盐后切纯甲醇封柱。',
      plainTheory: '【高压微型赛跑·定量金标准】如果说 TLC 是手工肉眼赛跑，HPLC 就是装了高压泵和激光电子眼的“F1 级自动赛跑系统”！高压泵以 10~20 MPa 推着流动相高速冲过装满 5 μm 超细填料的 C18 色谱柱，复杂中药提取液里的几十种成分被拉开成一根根尖锐独立的色谱峰。紫外检测器（DAD）自动测出每根峰的保留时间（定性）和峰面积（定量），精准度可达 0.01%！',
      equipment: ['二元高压梯度泵', 'C18反相色谱柱(250×4.6mm)', '柱温箱与自动进样器', 'DAD紫外检测器', '0.22μm微孔滤膜', '流动相脱气过滤装置'],
      hotspots: [
        { id: 1, name: '流动相脱气瓶与梯度泵', desc: '乙腈/甲醇 + 0.1% 甲酸水经 0.45 μm 膜过滤并超声脱气 20 min。', warn: '流动相未脱气会产生气泡导致柱压剧烈波动与鬼峰！' },
        { id: 2, name: '0.22μm 滤膜与自动进样器', desc: '进样量常用 10 μL；所有中药供试品必须经 0.22 μm 滤膜滤清。', warn: '未过滤浑浊液直接进样会瞬间堵死昂贵的 C18 色谱柱！' },
        { id: 3, name: 'C18 反相色谱柱（柱温 30℃）', desc: '反相柱“极性大先出峰、极性小后出峰”（与正相硅胶柱恰好相反）。', warn: '含缓冲盐流动相结束后，务必先用 10% 甲醇水冲盐 30 min 再切纯甲醇封柱！' },
        { id: 4, name: 'DAD 检测器与外标法积分', desc: '依据对照品与供试品峰面积比值计算精确含量，要求理论塔板数 ≥ 3000、分离度 R ≥ 1.5。', warn: '进样前需确认连续 6 针对照品峰面积 RSD < 2.0%。' }
      ],
      subSteps: [
        { code: 'H1', title: '流动相配制、抽滤与超声脱气', action: '选用色谱纯乙腈/甲醇与超纯水配制流动相，经 0.45 μm 滤膜抽滤后超声脱气 20 min。', tip: '水相缓冲盐（如磷酸盐）现配现用防长菌堵柱。', biliKw: '流动相 配制' },
        { code: 'H2', title: '排气泡与 C18 色谱柱基线平衡', action: '打开排空阀排尽泵头气泡，以 1.0 mL/min 流速在设定柱温（30℃）下平衡色谱柱至基线漂移平稳。', tip: '切勿在无液状态下高速空转柱塞泵！', biliKw: 'HPLC 开机' },
        { code: 'H3', title: '0.22μm 针滤进样与外标定量', action: '供试品与对照品经 0.22 μm 针式滤器滤入进样小瓶，依次进空白、对照品、供试品记录峰面积与保留时间。', tip: '峰形拖尾或前伸时核查供试品溶剂极性是否强于初始流动相。', biliKw: 'HPLC 进样' },
        { code: 'H4', title: '梯度冲柱与纯甲醇封柱关机', action: '分析完毕先用低比例有机相/水冲去缓冲盐 30 min，再切 90%~100% 甲醇/乙腈冲洗 30 min 降流速关机。', tip: '严禁含缓冲盐体系直接切纯甲醇，盐瞬间析出会报废色谱柱！', biliKw: '色谱柱 冲洗' }
      ],
      svg: `<svg viewBox="0 0 420 260" class="w-full max-w-md h-auto"><rect x="28" y="230" width="364" height="8" rx="4" fill="#475569"/><rect x="40" y="54" width="32" height="54" rx="5" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/><rect x="42" y="74" width="28" height="32" fill="#38bdf8" opacity="0.6"/><text x="56" y="48" text-anchor="middle" font-size="8" fill="#0369a1" font-weight="700">A水相</text><rect x="78" y="54" width="32" height="54" rx="5" fill="#fef3c7" stroke="#d97706" stroke-width="2"/><rect x="80" y="70" width="28" height="36" fill="#fbbf24" opacity="0.65"/><text x="94" y="48" text-anchor="middle" font-size="8" fill="#b45309" font-weight="700">B乙腈</text><path d="M56 108 L56 142 L126 142 M94 108 L94 142" fill="none" stroke="#0f5c54" stroke-width="2.4" class="anim-flow"/><rect x="126" y="118" width="66" height="50" rx="8" fill="#0f172a" stroke="#0f5c54" stroke-width="2"/><text x="159" y="140" text-anchor="middle" font-size="9" fill="#34d399" font-weight="700">高压梯度泵</text><text x="159" y="154" text-anchor="middle" font-size="8" fill="#94a3b8" font-family="monospace">1.0 mL/min</text><path d="M192 142 L222 142" stroke="#0f5c54" stroke-width="2.6" class="anim-flow"/><rect x="222" y="128" width="76" height="28" rx="12" fill="#ffffff" stroke="#0f5c54" stroke-width="2.5"/><rect x="230" y="134" width="60" height="16" rx="6" fill="#ccfbf1"/><text x="260" y="145" text-anchor="middle" font-size="8.5" fill="#0a3630" font-weight="800">C18 色谱柱</text><path d="M298 142 L322 142" stroke="#0f5c54" stroke-width="2.6" class="anim-flow"/><rect x="322" y="116" width="62" height="52" rx="8" fill="#1e293b" stroke="#0284c7" stroke-width="2"/><text x="353" y="140" text-anchor="middle" font-size="9" fill="#38bdf8" font-weight="700">DAD检测器</text><text x="353" y="154" text-anchor="middle" font-size="8" fill="#cbd5e1" font-family="monospace">254 nm</text><rect x="126" y="34" width="258" height="66" rx="10" fill="#062420" stroke="#0f5c54" stroke-width="1.8"/><path d="M138 86 L186 86 Q194 86 198 56 Q202 86 210 86 L248 86 Q256 86 262 44 Q268 86 276 86 L310 86 Q316 86 320 66 Q324 86 332 86 L372 86" fill="none" stroke="#34d399" stroke-width="2.2" class="anim-flow"/><text x="262" y="42" text-anchor="middle" font-size="8" fill="#fde047" font-weight="700">目标主峰 (R≥1.5)</text><g class="hotspot-btn" data-hotspot="1"><circle cx="75" cy="84" r="10" fill="#0284c7"/><text x="75" y="88" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">1</text></g><g class="hotspot-btn" data-hotspot="2"><circle cx="159" cy="182" r="10" fill="#0a3630"/><text x="159" y="186" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">2</text></g><g class="hotspot-btn" data-hotspot="3"><circle cx="260" cy="168" r="10" fill="#c58a32"/><text x="260" y="172" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">3</text></g><g class="hotspot-btn" data-hotspot="4"><circle cx="353" cy="182" r="10" fill="#4f46e5"/><text x="353" y="186" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">4</text></g></svg>`
    },
    freeze_dry: {
      title: '真空冷冻干燥机（热敏成分零热损保活装置）',
      stageTag: '保活干燥装置',
      videoKw: '冷冻干燥机 使用',
      order: '浓缩液除尽乙醇后分装冻干盘（液厚 ≤ 1 cm）→ -40℃/-80℃ 深度预冻 4~6 h → 冷阱降温至 -50℃ 以下 → 放入样品罩紧密封圈 → 抽真空至 < 20 Pa 升华干燥 24~36 h → 先放气破真空再停泵取样。',
      plainTheory: '【冰晶直接升华·极脆热敏成分救星】多糖、皂苷、丹酚酸 B 和西红花苷一旦进烘箱加热烘干，立刻氧化发黑结硬块。冻干机先把药液冻成实心冰块，再抽成极高真空，让冰晶绕过液态水阶段直接“升华”成水蒸气被 -55℃ 的冷阱吸走！最后得到的冻干粉像棉花糖一样蓬松多孔、一碰水秒溶，活性保留接近 100%！',
      equipment: ['台式冷冻干燥机', '-80℃超低温冰箱(预冻)', '旋片式高真空泵', '冻干盘与封口膜', '干燥器与棕色样品瓶'],
      hotspots: [
        { id: 1, name: '透明真空升华干燥罩', desc: '样品预冻透后装入，封口膜扎微孔防抽真空时粉末飞扬。', warn: '样品若残留乙醇/甲醇 > 5%，冰点骤降会融化起泡喷料！' },
        { id: 2, name: '-55℃ 低温冷阱捕水器', desc: '必须先预冷至 -45℃ 以下再开真空泵，强力捕获升华水汽。', warn: '未预冷直接抽真空会把大量水蒸气抽进真空泵油里毁坏泵体！' },
        { id: 3, name: '真空度监测与放气阀', desc: '正常工作真空度应维持在 10~20 Pa 以下；结束务必先缓慢放气再关泵。', warn: '先关泵不放气会导致真空泵油倒吸污染全部珍贵冻干样品！' },
        { id: 4, name: '蓬松冻干粉密封防潮', desc: '冻干粉比表面积极大极易吸潮结块，出舱后立即称重并密封避光保存。', warn: '多糖与皂苷冻干粉暴露空气 5 分钟即会吸湿发黏。' }
      ],
      subSteps: [
        { code: 'L1', title: '彻底脱醇与薄层深度预冻', action: '将水提液旋蒸彻底除尽有机溶剂，分装入培养皿/西林瓶（液层厚度 ≤ 1 cm），置 -40℃~-80℃ 冰箱预冻 4~6 h 至完全冻实。', tip: '有乙醇残留必融化鼓泡，预冻前务必闻确认无醇味！', biliKw: '冻干 预冻' },
        { code: 'L2', title: '冷阱预冷至 -50℃ 与密封入舱', action: '开启冻干机制冷使冷阱降至 -50℃ 以下，取出冻实样品扎孔覆膜迅速放入托盘，擦净橡胶密封圈扣紧有机玻璃罩。', tip: '密封圈沾有灰尘或药粉会导致真空度死活抽不下去。', biliKw: '冷冻干燥机 操作' },
        { code: 'L3', title: '高真空升华干燥（< 20 Pa）', action: '确认放气阀关闭后启动真空泵，观察 10 min 内真空度降至 20 Pa 以下，连续冻干 24~36 h 至冰晶完全升华。', tip: '定期观察真空泵油视窗，油液乳化变白需及时更换。', biliKw: '真空冷冻干燥' },
        { code: 'L4', title: '规范停机：先放气破真空再关泵', action: '冻干结束后，先缓慢拧开放气阀听见进气声直至恢复常压，立即关闭真空泵与制冷电源，快速密封称重冻干粉。', tip: '严禁带负压直接关闭真空泵！', biliKw: '冻干机 关机' }
      ],
      svg: `<svg viewBox="0 0 420 260" class="w-full max-w-md h-auto"><rect x="44" y="232" width="332" height="8" rx="4" fill="#475569"/><rect x="84" y="138" width="152" height="94" rx="10" fill="#0f172a" stroke="#0f5c54" stroke-width="2.4"/><rect x="98" y="152" width="124" height="44" rx="6" fill="#062420"/><text x="160" y="172" text-anchor="middle" font-size="10" fill="#38bdf8" font-family="monospace" font-weight="700">冷阱 -56.4℃</text><text x="160" y="188" text-anchor="middle" font-size="9.5" fill="#34d399" font-family="monospace">真空 12.5 Pa</text><path d="M104 138 L104 56 Q104 34 160 34 Q216 34 216 56 L216 138 Z" fill="#e0f2fe" fill-opacity="0.55" stroke="#0284c7" stroke-width="2.5"/><line x1="118" y1="80" x2="202" y2="80" stroke="#64748b" stroke-width="3"/><line x1="118" y1="112" x2="202" y2="112" stroke="#64748b" stroke-width="3"/><rect x="132" y="68" width="56" height="12" rx="3" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/><rect x="132" y="100" width="56" height="12" rx="3" fill="#fde68a" stroke="#d97706" stroke-width="1.5"/><circle cx="145" cy="60" r="2.2" fill="#38bdf8" class="anim-bubble-1"/><circle cx="165" cy="56" r="2.5" fill="#38bdf8" class="anim-bubble-2"/><circle cx="178" cy="62" r="2.0" fill="#38bdf8" class="anim-bubble-3"/><path d="M236 184 L296 184" stroke="#475569" stroke-width="3.2"/><path d="M236 184 L296 184" stroke="#38bdf8" stroke-width="1.6" class="anim-flow"/><rect x="296" y="156" width="76" height="58" rx="8" fill="#1e293b" stroke="#334155" stroke-width="2"/><text x="334" y="182" text-anchor="middle" font-size="9.5" fill="#fff" font-weight="700">高真空泵</text><text x="334" y="198" text-anchor="middle" font-size="8" fill="#fbbf24">先放气再停泵</text><g class="hotspot-btn" data-hotspot="1"><circle cx="160" cy="86" r="10" fill="#c58a32"/><text x="160" y="90" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">1</text></g><g class="hotspot-btn" data-hotspot="2"><circle cx="160" cy="212" r="10" fill="#0284c7"/><text x="160" y="216" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">2</text></g><g class="hotspot-btn" data-hotspot="3"><circle cx="266" cy="184" r="10" fill="#0a3630"/><text x="266" y="188" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">3</text></g><g class="hotspot-btn" data-hotspot="4"><circle cx="204" cy="54" r="10" fill="#4f46e5"/><text x="204" y="58" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">4</text></g></svg>`
    }
  };

  // 11 大类中药化学成分四谱联合解析知识库（UV诊断试剂 + IR + 1H-NMR + MS裂解）
  const FOUR_SPECTRA_DB = {
    '黄酮': {
      lambda: 275,
      uvDiag: '带Ⅰ(300~380nm, 桂皮酰基)与带Ⅱ(240~280nm, 苯甲酰基)。加 NaOMe 带Ⅰ红移 40~60nm 且增强→4′-OH；加 NaOAc 带Ⅱ红移 5~20nm→7-OH；加 AlCl₃/HCl 仍红移 35~55nm→5-OH；加 H₃BO₃ 带Ⅰ红移 12~30nm→B环邻二酚羟基。',
      ir: '3400 cm⁻¹ (宽峰，酚羟基-OH)、1650 cm⁻¹ (C=O 伸缩)、1600/1500 cm⁻¹ (芳环骨架 C=C)。',
      nmr: '5-OH 分子内氢键低场尖峰 δ 12.0~13.5；A环 H-6/H-8 (δ 6.1~6.5, d, J=2Hz)；B环 AA\'BB\' 系统 (δ 6.8~8.0, J=8.5Hz)；糖端基质子 δ 4.5~5.5。',
      ms: '经典 RDA 逆狄尔斯-阿尔德裂解（C环断裂得 A1⁺ 与 B1⁺ 碎片）直接判定 A/B 环取代基；氧苷易脱中性糖基（-162 葡萄糖、-146 鼠李糖、-176 葡萄糖醛酸）。'
    },
    '生物碱': {
      lambda: 345,
      uvDiag: '异喹啉/原小檗碱类（如小檗碱）在 228、265、345、420 nm 呈四组特征强吸收；吲哚类（如喜树碱）在 254、368 nm 强吸收。',
      ir: '3300 cm⁻¹ (N-H 伸缩，仲胺/吲哚)、1600~1640 cm⁻¹ (C=N⁺ 季铵/亚胺键)、1250 cm⁻¹ (芳醚 C-O-C)。',
      nmr: 'N-CH₃ 特征单峰 δ 2.2~3.2；O-CH₃ 单峰 δ 3.8~4.1；亚甲二氧基 (-OCH₂O-) 特征单峰 δ 5.9~6.1；原小檗碱 C8-H 低场单峰 δ 9.5~9.9。',
      ms: '遵循氮规则（含奇数个 N 原子则分子离子峰为奇数！）；苄基异喹啉类易发生 α-裂解与 RDA 裂解。'
    },
    '挥发油与萜类': {
      lambda: 225,
      uvDiag: '饱和单萜醇（如薄荷脑）无共轭紫外吸收（仅末端吸收）；含 α,β-不饱和羰基（桂皮醛 286nm、胡薄荷酮 252nm）具强 K 带吸收。',
      ir: '3350 cm⁻¹ (-OH，薄荷脑)、1680~1715 cm⁻¹ (共轭/非共轭 C=O)、1640 cm⁻¹ (C=C)、2960/2870 cm⁻¹ (强脂肪族 C-H)。',
      nmr: '角甲基单峰 δ 0.8~1.3；异丙基双峰 δ 0.8~1.0 (d, J=7Hz)；双键质子 δ 4.8~5.6；醛基质子 δ 9.6~10.0（桂皮醛）。',
      ms: '常以 GC-MS 联用鉴定！典型异戊二烯单元裂解：m/z 136 (单萜 M⁺)、93、69 (异戊烯基特征基峰)、138/123 (薄荷脑脱水 m/z 138)。'
    },
    '蒽醌与醌类': {
      lambda: 430,
      uvDiag: '在 250、265、290、430 nm 呈 4~5 组特征吸收；加碱后羟基蒽醌红移至 510~530 nm 呈紫红色（Borntrager 机理）。',
      ir: '1675 cm⁻¹ (游离 C=O)、1625 cm⁻¹ (与 α-OH 缔合的螯合 C=O，两者差值 Δν≈50 cm⁻¹ 可判 α-OH 个数！)。',
      nmr: 'α-OH 强分子内氢键低场单峰 δ 11.5~13.5；芳环质子 δ 7.0~8.2；大黄素型 C-CH₃ 单峰 δ 2.4。',
      ms: '特征连续脱去两分子 CO：M⁺ → [M-28]⁺ → [M-56]⁺，为醌类母核极高辨识度碎片！'
    },
    '香豆素与木脂素': {
      lambda: 325,
      uvDiag: '7-羟基香豆素在 325 nm 强吸收，加碱后红移至 370 nm 且产生强烈蓝紫色荧光；呋喃香豆素（欧前胡素）在 250、300 nm 特征峰。',
      ir: '1710~1745 cm⁻¹ (α-吡喃酮内酯强 C=O 峰)、1610/1560 cm⁻¹ (苯环与双键共轭)。',
      nmr: '内酯环 H-3 (δ 6.1~6.4, d, J=9.5Hz) 与 H-4 (δ 7.5~8.1, d, J=9.5Hz) 为香豆素“黄金一对双峰”！',
      ms: '内酯环易失 CO (m/z -28) 收缩成苯并呋喃离子；含异戊烯基侧链易失 C₅H₈ (m/z -68)。'
    },
    '皂苷与三萜': {
      lambda: 203,
      uvDiag: '达玛烷/齐墩果烷型皂苷缺乏共轭发色团，仅在 203 nm 有弱末端吸收（HPLC 须用 203 nm 或 ELSD 蒸发光散射检测器！）。',
      ir: '3400 cm⁻¹ (极宽强多糖羟基峰)、2940 cm⁻¹ (强脂肪族 C-H)、1050 cm⁻¹ (强糖苷 C-O-C 伸缩)。',
      nmr: '高场区 δ 0.7~1.3 密集出现 6~8 个角甲基尖单峰；δ 3.0~4.5 为重叠糖环质子区；端基质子 δ 4.3~5.5（β-D-Glc J=7~8Hz）。',
      ms: 'ESI-MS 负离子模式 [M-H]⁻ 或 [M+HCOO]⁻ 极其清晰，依次脱去葡萄糖 (-162)、鼠李糖 (-146)、木糖/阿拉伯糖 (-132) 直接读出糖链连接顺序！'
    },
    '苯丙素与有机酸': {
      lambda: 327,
      uvDiag: '咖啡酰基/阿魏酰基（绿原酸 327 nm、阿魏酸 316 nm、丹酚酸 B 286 nm）具强肉桂酸共轭吸收，UV 365 nm 呈亮蓝荧光。',
      ir: '3350 cm⁻¹ (酚-OH)、1690 cm⁻¹ (共轭羧酸/酯 C=O)、1630 cm⁻¹ (反式 C=C)、980 cm⁻¹ (反式双键面外弯曲)。',
      nmr: '反式烯烃质子偶合常数 J = 15.5~16.5 Hz（δ 6.2~6.4 与 δ 7.4~7.6 一对宽双峰）；ABX 苯环质子 δ 6.7~7.1。',
      ms: '负离子模式极易得 [M-H]⁻，绿原酸 (m/z 353) 特征裂解为奎宁酸碎片 m/z 191（基峰）与咖啡酸碎片 m/z 179！'
    },
    '萜类内酯与环烯醚萜': {
      lambda: 238,
      uvDiag: '环烯醚萜（栀子苷、芍药苷）因烯醚环-羧酯共轭在 235~240 nm 具强吸收；青蒿素无共轭紫外吸收，须柱前/柱后衍生化。',
      ir: '1705~1770 cm⁻¹ (内酯/酯基 C=O)、1630~1650 cm⁻¹ (烯醚 C=C-O- 强特征峰)。',
      nmr: '环烯醚萜 H-3 特征低场单峰/双峰 δ 7.4~7.6，H-1 缩醛质子 δ 5.0~5.8；青蒿素 C-12 缩醛质子特征单峰 δ 5.86。',
      ms: '环烯醚萜易失葡萄糖 (-162) 后发生吡喃环 RDA 裂解；内酯类易失 CO₂ (-44) 与 H₂O (-18)。'
    },
    '甾体与强心苷': {
      lambda: 217,
      uvDiag: '甲型强心苷（五元不饱和内酯环）在 217~220 nm 强吸收；乙型强心苷（六元双不饱和内酯环，如蟾酥）在 295~300 nm 强吸收！',
      ir: '1740/1780 cm⁻¹ (甲型内酯双峰)、1620 cm⁻¹ (C=C)、980/920/900/860 cm⁻¹ (螺甾烷醇 4 条特征吸收，900 > 920 为 25R 型)。',
      nmr: 'C18/C19 角甲基单峰 δ 0.7~1.0；2-去氧糖特征高场亚甲基 δ 1.5~2.3 与甲基双峰 δ 1.2；甲型内酯烯氢 δ 5.8~6.0。',
      ms: '高分辨 ESI-MS 逐级脱 2-去氧糖 (-130 / -144) 与葡萄糖 (-162)，快速鉴定苷元与糖链。'
    },
    '氰苷类': {
      lambda: 210,
      uvDiag: '单取代苯环弱吸收（210 nm 及 254~268 nm B 带精细结构）。',
      ir: '2240~2260 cm⁻¹ (特征弱腈基 -C≡N 伸缩峰)、3400 cm⁻¹ (糖羟基)、700/760 cm⁻¹ (单取代苯环)。',
      nmr: '单取代苯环 5H 多重峰 δ 7.4~7.6；α-氰基次甲基特征单峰 δ 5.8~6.0；龙胆二糖双端基质子 δ 4.3~4.6。',
      ms: '易失 HCN (-27) 与苯甲醛 (-106)，结合龙胆二糖碎片清晰确证。'
    },
    '多糖类': {
      lambda: 490,
      uvDiag: '纯多糖在 260/280 nm 应无核酸与蛋白质杂峰（纯度检验红线！）；苯酚-硫酸法衍生显色后于 490 nm 定量测定。',
      ir: '3400 cm⁻¹ (极宽 O-H)、2925 cm⁻¹ (C-H)、1000~1200 cm⁻¹ (吡喃糖环 C-O-C 三峰)、840 cm⁻¹ (α-糖苷键) vs 890 cm⁻¹ (β-糖苷键)！',
      nmr: '端基质子区 δ 4.4~5.5（α-构型通常 >5.0 ppm，β-构型 <5.0 ppm）；糖环质子密集分布于 δ 3.2~4.2。',
      ms: '单糖组成须经三氟乙酸(TFA)完全酸水解后 PMP 衍生化 HPLC 或糖腈乙酸酯 GC-MS 分析；分子量采用 HPGPC 测定。'
    }
  };

  // ============ 渲染 Step 3 四谱联合解析交互卡 ============
  function renderFourSpectraPanel(mountEl, t) {
    if (!mountEl) return;
    const cat = FOUR_SPECTRA_DB[t.category] ? t.category : '黄酮';
    const sp = FOUR_SPECTRA_DB[cat];
    mountEl.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div class="flex items-center gap-2">
          <span class="w-7 h-7 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-extrabold text-xs">🌈</span>
          <div>
            <h3 class="text-sm sm:text-base font-extrabold text-slate-900">UV / IR / ¹H-NMR / MS 四谱联合解析速查（${esc(cat)}）</h3>
            <p class="text-[11px] text-slate-500">涵盖紫外诊断试剂位移、红外特征波数、核磁标志质子与质谱裂解规律，直接支撑结构鉴定章节</p>
          </div>
        </div>
        <span class="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0f5c54] text-[10px] font-bold">推荐定量波长 λ ≈ ${sp.lambda} nm</span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div class="p-3.5 rounded-2xl bg-amber-50/55 border border-amber-200/80 space-y-1">
          <div class="font-extrabold text-amber-950">① UV-Vis 紫外与诊断试剂位移</div>
          <p class="text-slate-700 leading-relaxed">${esc(sp.uvDiag)}</p>
        </div>
        <div class="p-3.5 rounded-2xl bg-sky-50/55 border border-sky-200/80 space-y-1">
          <div class="font-extrabold text-sky-950">② IR 红外特征官能团波数 (cm⁻¹)</div>
          <p class="text-slate-700 leading-relaxed">${esc(sp.ir)}</p>
        </div>
        <div class="p-3.5 rounded-2xl bg-emerald-50/55 border border-emerald-200/80 space-y-1">
          <div class="font-extrabold text-emerald-950">③ ¹H-NMR 标志质子与偶合常数</div>
          <p class="text-slate-700 leading-relaxed">${esc(sp.nmr)}</p>
        </div>
        <div class="p-3.5 rounded-2xl bg-indigo-50/55 border border-indigo-200/80 space-y-1">
          <div class="font-extrabold text-indigo-950">④ MS 质谱特征裂解与去糖规律</div>
          <p class="text-slate-700 leading-relaxed">${esc(sp.ms)}</p>
        </div>
      </div>`;
  }

  // ============ 渲染 Step 5 UV-Vis 标准曲线最小二乘拟合与含量测定计算器 ============
  function renderUvCalibrationTool(mountEl, t, ws, copyFn, onSync) {
    if (!mountEl) return;
    const cat = FOUR_SPECTRA_DB[t.category] ? t.category : '黄酮';
    const lam = FOUR_SPECTRA_DB[cat].lambda || 280;
    if (!ws.uvCal) {
      ws.uvCal = {
        lambda: lam,
        pts: [
          { c: 5, a: 0.142 },
          { c: 10, a: 0.278 },
          { c: 20, a: 0.551 },
          { c: 30, a: 0.824 },
          { c: 40, a: 1.095 }
        ],
        sampleA: 0.512,
        sampleMassG: 0.50,
        volMl: 50,
        dilute: 10
      };
    }

    const draw = () => {
      const pts = ws.uvCal.pts;
      const n = pts.length;
      const xs = pts.map(p => Number(p.c) || 0);
      const ys = pts.map(p => Number(p.a) || 0);
      const mx = xs.reduce((a, b) => a + b, 0) / n;
      const my = ys.reduce((a, b) => a + b, 0) / n;
      let sxx = 0, syy = 0, sxy = 0;
      for (let i = 0; i < n; i++) {
        sxx += (xs[i] - mx) ** 2;
        syy += (ys[i] - my) ** 2;
        sxy += (xs[i] - mx) * (ys[i] - my);
      }
      const k = sxx > 0 ? sxy / sxx : 0;
      const b = my - k * mx;
      const r2 = (sxx > 0 && syy > 0) ? (sxy ** 2) / (sxx * syy) : 0;

      const sA = Number(ws.uvCal.sampleA) || 0;
      const calcC = k > 0 ? Math.max(0, (sA - b) / k) : 0; // μg/mL
      const massG = Math.max(0.001, Number(ws.uvCal.sampleMassG) || 0.5);
      const volMl = Math.max(1, Number(ws.uvCal.volMl) || 50);
      const dil = Math.max(1, Number(ws.uvCal.dilute) || 1);
      // 含量(mg/g) = C(μg/mL) * V(mL) * dilute / (massG * 1000)
      const contentMgG = (calcC * volMl * dil) / (massG * 1000);
      const contentPct = contentMgG / 10; // 10 mg/g = 1%
      const r2Ok = r2 >= 0.999;

      // 生成 SVG 回归散点直线图
      const maxX = Math.max(...xs, 10) * 1.12;
      const maxY = Math.max(...ys, sA, 0.2) * 1.15;
      const px = x => 36 + (x / maxX) * 230;
      const py = y => 148 - (y / maxY) * 124;
      const y0 = py(Math.max(0, b)), y1 = py(Math.max(0, k * maxX + b));

      const eqStr = `A = ${k.toFixed(5)}·C ${b >= 0 ? '+' : '-'} ${Math.abs(b).toFixed(4)}（R² = ${r2.toFixed(5)}）`;
      const uvSummary = `采用紫外分光光度法于 ${ws.uvCal.lambda} nm 测定「${t.herb} · ${t.compound}」含量，标准曲线回归方程为 ${eqStr}，线性关系${r2Ok ? '良好（R² ≥ 0.999）' : '待复测优化'}。测得供试品吸光度 A=${sA.toFixed(3)}，换算样液浓度 C=${calcC.toFixed(2)} μg/mL，最终测得目标成分含量为 ${contentMgG.toFixed(2)} mg/g（即 ${contentPct.toFixed(2)}%）。`;

      mountEl.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div class="flex items-center gap-2">
            <span class="w-7 h-7 rounded-xl bg-sky-50 text-sky-800 flex items-center justify-center font-extrabold text-xs">📊</span>
            <div>
              <h3 class="text-sm sm:text-base font-extrabold text-slate-900">UV-Vis 标准曲线线性拟合 &amp; 含量测定计算器（λ = ${ws.uvCal.lambda} nm）</h3>
              <p class="text-[11px] text-slate-500">0-Token 最小二乘法自动拟合 A = kC + b 与 R²，输入供试品吸光度一键算含量 (%)</p>
            </div>
          </div>
          <button id="btnCopyUvSummary" type="button" class="px-3 py-1.5 rounded-xl bg-[#0a3630] text-white text-xs font-bold hover:bg-[#062420] transition">复制标曲结论写入报告</button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div class="lg:col-span-5 space-y-2.5">
            <div class="overflow-x-auto rounded-2xl border border-slate-200">
              <table class="w-full text-xs text-center border-collapse">
                <thead><tr class="bg-slate-50 border-b border-slate-200 text-slate-600"><th class="py-1.5">标液点</th><th>浓度 C (μg/mL)</th><th>吸光度 A</th></tr></thead>
                <tbody class="divide-y divide-slate-100 bg-white tabular-nums">
                  ${pts.map((pt, i) => `
                    <tr>
                      <td class="py-1 font-bold text-slate-500">S${i + 1}</td>
                      <td class="py-1"><input type="number" step="0.5" data-uv-c="${i}" value="${pt.c}" class="w-20 px-2 py-1 text-center rounded-lg border border-slate-200 tabular-nums" /></td>
                      <td class="py-1"><input type="number" step="0.001" data-uv-a="${i}" value="${pt.a}" class="w-20 px-2 py-1 text-center rounded-lg border border-slate-200 tabular-nums font-bold text-[#0a3630]" /></td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>
            <div class="grid grid-cols-2 gap-2 text-[11px] bg-[#f7f7f4] p-3 rounded-2xl border border-slate-200/80">
              <div><label class="block text-slate-500 mb-0.5">供试品吸光度 A</label><input id="uvSampleA" type="number" step="0.001" value="${ws.uvCal.sampleA}" class="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold text-indigo-700 tabular-nums" /></div>
              <div><label class="block text-slate-500 mb-0.5">取样量 (g)</label><input id="uvMassG" type="number" step="0.05" value="${ws.uvCal.sampleMassG}" class="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white tabular-nums" /></div>
              <div><label class="block text-slate-500 mb-0.5">定容体积 (mL)</label><input id="uvVolMl" type="number" step="5" value="${ws.uvCal.volMl}" class="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white tabular-nums" /></div>
              <div><label class="block text-slate-500 mb-0.5">稀释倍数</label><input id="uvDilute" type="number" step="1" value="${ws.uvCal.dilute}" class="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white tabular-nums" /></div>
            </div>
          </div>

          <div class="lg:col-span-7 space-y-3">
            <div class="p-3.5 rounded-2xl bg-[#062420] text-white flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <div class="text-[10px] text-emerald-300 font-bold">标准曲线线性回归方程</div>
                <div class="font-mono text-sm font-extrabold text-white mt-0.5">${eqStr}</div>
              </div>
              <span class="px-2.5 py-1 rounded-full text-[11px] font-extrabold ${r2Ok ? 'bg-emerald-400/20 text-emerald-200' : 'bg-amber-400/20 text-amber-200'}">${r2Ok ? '✓ 线性合格 (R²≥0.999)' : '⚠ 建议复测标液'}</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div class="sm:col-span-7 rounded-2xl bg-white border border-slate-200 p-2 flex justify-center">
                <svg viewBox="0 0 285 170" class="w-full max-w-xs h-auto">
                  <line x1="36" y1="148" x2="270" y2="148" stroke="#64748b" stroke-width="1.5"/>
                  <line x1="36" y1="18" x2="36" y2="148" stroke="#64748b" stroke-width="1.5"/>
                  <line x1="36" y1="${y0.toFixed(1)}" x2="266" y2="${y1.toFixed(1)}" stroke="#0f5c54" stroke-width="2" stroke-dasharray="4 2"/>
                  ${pts.map(p => `<circle cx="${px(p.c).toFixed(1)}" cy="${py(p.a).toFixed(1)}" r="4" fill="#0f766e" stroke="#fff" stroke-width="1.2"/>`).join('')}
                  <circle cx="${px(calcC).toFixed(1)}" cy="${py(sA).toFixed(1)}" r="5.5" fill="#e11d48" stroke="#fff" stroke-width="1.5"/>
                  <text x="152" y="165" text-anchor="middle" font-size="9" fill="#475569">浓度 C (μg/mL)</text>
                  <text x="14" y="84" text-anchor="middle" font-size="9" fill="#475569" transform="rotate(-90 14 84)">吸光度 A</text>
                  <text x="266" y="28" text-anchor="end" font-size="8.5" fill="#e11d48" font-weight="700">● 红点：供试品</text>
                </svg>
              </div>
              <div class="sm:col-span-5 space-y-2 text-xs">
                <div class="p-3 rounded-2xl bg-teal-50/70 border border-teal-200"><div class="text-[10px] text-slate-500">反算样液浓度 C</div><div class="text-lg font-extrabold text-[#0a3630] tabular-nums">${calcC.toFixed(2)} <span class="text-xs font-normal">μg/mL</span></div></div>
                <div class="p-3 rounded-2xl bg-amber-50/70 border border-amber-200"><div class="text-[10px] text-slate-500">药材实测含量</div><div class="text-lg font-extrabold text-amber-900 tabular-nums">${contentMgG.toFixed(2)} <span class="text-xs font-normal">mg/g (${contentPct.toFixed(2)}%)</span></div></div>
              </div>
            </div>
          </div>
        </div>`;

      mountEl.querySelectorAll('[data-uv-c]').forEach(el => el.addEventListener('change', () => { ws.uvCal.pts[Number(el.dataset.uvC)].c = Number(el.value) || 0; draw(); }));
      mountEl.querySelectorAll('[data-uv-a]').forEach(el => el.addEventListener('change', () => { ws.uvCal.pts[Number(el.dataset.uvA)].a = Number(el.value) || 0; draw(); }));
      const bindOne = (id, key) => { const el = mountEl.querySelector(id); if (el) el.addEventListener('change', () => { ws.uvCal[key] = Number(el.value) || 0; draw(); }); };
      bindOne('#uvSampleA', 'sampleA'); bindOne('#uvMassG', 'sampleMassG'); bindOne('#uvVolMl', 'volMl'); bindOne('#uvDilute', 'dilute');
      const copyBtn = mountEl.querySelector('#btnCopyUvSummary');
      if (copyBtn) copyBtn.onclick = () => {
        if (onSync) onSync(uvSummary);
        if (copyFn) copyFn(uvSummary, '已复制标准曲线与含量测定结论并同步至第 6 步报告');
      };
    };
    draw();
  }

  window.TCM_V4_SPECTRO = Object.freeze({
    V4_RIGS,
    FOUR_SPECTRA_DB,
    renderFourSpectraPanel,
    renderUvCalibrationTool
  });
})();
