// 本草智研 v3.0 旗舰扩展数据模块
// 新增：2 套高频动态 SVG 装置（薄层色谱 TLC 展开检视、玻璃渗漉筒）、10 项高校与药企前沿精编实验、
// 12 篇核实权威文献、6 项院校/药企案例、10 种常用溶剂极性速查表、试剂安全 MSDS 与废液分类规则库。
(function () {
  'use strict';

  const V3_RIGS = {
    tlc: {
      title: '薄层色谱展开与紫外检视装置（TLC 缸 + UV 暗箱）',
      stageTag: '检识定性装置',
      videoKw: '薄层色谱 点样',
      order: '展开缸内壁贴滤纸并倒入展开剂密封预饱和 20 min → 硅胶 G 板距底 1.5 cm 铅笔轻划基线 → 毛细管微量点样(直径≤2mm) → 置入展开缸防液面没过斑点 → 展至距顶 1 cm 吹干 → UV 254/365 nm 或喷显色剂测算 Rf。',
      plainTheory: '【微型硅胶赛道·一眼辨真伪】TLC 就是把柱层析“拍扁”铺在一块玻璃/铝箔板上！展开剂靠毛细作用顺着硅胶往上爬，顺便带着你点在起跑线上的供试品和标准品一起赛跑。极性小的成分跑得快（Rf 大），极性大的被硅胶拉着跑得慢（Rf 小）。只要你的样品斑点和标准品跑在同一高度（|ΔRf| ≤ 0.03）且紫外荧光/显色完全一致，就能快速定性确证！',
      equipment: ['硅胶G/GF254预制板', '玻璃双槽展开缸', '0.5mm定量毛细管', '三用紫外分析仪(254/365nm)', '吹风机与直尺', '喷雾显色瓶'],
      hotspots: [
        { id: 1, name: '点样基线与微量毛细管', desc: '距板底 1.5 cm 轻划铅笔线，斑点直径控制在 2 mm 以内，间距 ≥ 1 cm。', warn: '点样过浓会超载拖尾；严禁用圆珠笔划线以免油墨随展开剂跑出假斑！' },
        { id: 2, name: '滤纸饱和层与展开剂液面', desc: '缸内贴湿润滤纸密封预饱和 20 min，消除边缘效应（微笑曲线）。', warn: '展开剂液面必须低于点样基线至少 0.5 cm，切勿淹没斑点！' },
        { id: 3, name: '供试品与对照品共色谱斑点', desc: '待前沿距板顶 1 cm 取出标记前沿线 L₀，分别量取斑点中心位移 L。', warn: '含酸/碱成分拖尾时，在展开剂中加 0.5% 甲酸或氨蒸气预饱和。' },
        { id: 4, name: 'UV 254 / 365 nm 紫外检视灯', desc: 'GF254 板在 254 nm 下共轭双键呈暗斑荧光淬灭；黄酮/生物碱/香豆素在 365 nm 显特征荧光。', warn: '严禁肉眼直视紫外灯管，检视完毕及时关闭电源！' }
      ],
      subSteps: [
        { code: 'T1', title: '展开缸贴滤纸与 20 min 预饱和', action: '按处方精配展开剂倒入展开缸（液深约 0.5~0.8 cm），内壁紧贴半圈滤纸浸湿，盖紧磨口玻璃盖饱和 20 min。', tip: '未预饱和极易出现两侧跑得快、中间慢的“微笑边缘效应”。', biliKw: '展开缸 饱和' },
        { code: 'T2', title: '硅胶板划线与毛细管微量点样', action: '距底边 1.5 cm 用 2B 铅笔轻划基线（勿划破硅胶层），毛细管垂直轻触点样，少量多次吹干控制斑点直径 ≤ 2 mm。', tip: '同一板务必同时点“供试品 + 对照品”，消除板间误差。', biliKw: '薄层色谱 点样' },
        { code: 'T3', title: '垂直入缸展开与标记前沿', action: '镊子夹住硅胶板上缘平稳斜靠放入展开缸盖紧；当溶剂前沿升至距顶 1 cm 立即取出，铅笔标出前沿线 L₀ 并吹干。', tip: '展开过程中切忌晃动展开缸，防止液面冲花斑点。', biliKw: '薄层色谱 展开' },
        { code: 'T4', title: 'UV 检视、显色与 Rf 精准核算', action: '依次在日光、UV 254 nm、UV 365 nm 下圈出斑点，必要时喷香草醛-硫酸/AlCl₃ 加热显色，计算 Rf = L/L₀。', tip: '理想 Rf 为 0.2~0.8，供试品与对照品 |ΔRf| 须 ≤ 0.03。', biliKw: '薄层色谱 显色' }
      ],
      svg: `<svg viewBox="0 0 420 260" class="w-full max-w-md h-auto"><rect x="42" y="230" width="336" height="8" rx="4" fill="#475569"/><rect x="76" y="42" width="132" height="188" rx="8" fill="#f8fafc" stroke="#0f5c54" stroke-width="2.5"/><rect x="70" y="34" width="144" height="10" rx="4" fill="#0a3630"/><rect x="78" y="196" width="128" height="32" rx="4" fill="#bae6fd" opacity="0.72"/><rect x="98" y="60" width="88" height="156" rx="3" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.8"/><line x1="102" y1="78" x2="182" y2="78" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="4 3" class="anim-flow"/><line x1="102" y1="190" x2="182" y2="190" stroke="#64748b" stroke-width="1.2"/><circle cx="126" cy="190" r="2.2" fill="#475569"/><circle cx="158" cy="190" r="2.2" fill="#475569"/><g class="anim-band"><ellipse cx="126" cy="126" rx="10" ry="6" fill="#0f766e" opacity="0.82"/><ellipse cx="158" cy="125" rx="10" ry="6" fill="#4f46e5" opacity="0.82"/><ellipse cx="126" cy="156" rx="7" ry="4" fill="#f59e0b" opacity="0.65"/></g><text x="126" y="206" text-anchor="middle" font-size="8" fill="#0f5c54" font-weight="700">供试</text><text x="158" y="206" text-anchor="middle" font-size="8" fill="#4338ca" font-weight="700">对照</text><rect x="236" y="64" width="130" height="166" rx="12" fill="#0f172a" stroke="#334155" stroke-width="2.2"/><rect x="256" y="76" width="90" height="12" rx="6" fill="#818cf8" opacity="0.9"/><polygon points="262,88 340,88 358,214 244,214" fill="#6366f1" opacity="0.16"/><rect x="270" y="114" width="62" height="94" rx="3" fill="#1e1b4b" stroke="#6366f1" stroke-width="1.5"/><ellipse cx="290" cy="150" rx="8" ry="5" fill="#34d399" opacity="0.95"/><ellipse cx="312" cy="149" rx="8" ry="5" fill="#34d399" opacity="0.95"/><text x="301" y="106" text-anchor="middle" font-size="8.5" fill="#c7d2fe" font-weight="700">UV 254 / 365 nm</text><g class="hotspot-btn" data-hotspot="1"><circle cx="142" cy="190" r="10" fill="#0a3630"/><text x="142" y="194" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">1</text></g><g class="hotspot-btn" data-hotspot="2"><circle cx="88" cy="116" r="10" fill="#0284c7"/><text x="88" y="120" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">2</text></g><g class="hotspot-btn" data-hotspot="3"><circle cx="142" cy="126" r="10" fill="#c58a32"/><text x="142" y="130" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">3</text></g><g class="hotspot-btn" data-hotspot="4"><circle cx="301" cy="82" r="10" fill="#4f46e5"/><text x="301" y="86" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">4</text></g></svg>`
    },
    percolation: {
      title: '玻璃渗漉筒常温连续动态提取装置',
      stageTag: '常温动态提取',
      videoKw: '渗漉法 提取',
      order: '粗粉预先用溶剂润湿膨胀 2~4 h → 渗漉筒底垫脱脂棉与滤纸 → 分层装粉并均匀压实 → 加溶剂排净空气没过药面 2 cm → 闭阀浸渍 24 h → 开阀控速 1~3 mL/min 收集渗漉液。',
      plainTheory: '【持续新鲜浓差·常温零热损榨干法】普通冷浸泡到后面溶剂变浓就泡不动了。渗漉法把药粉装进高瘦玻璃筒里，上方不断补充新鲜溶剂，下方缓慢滴出浓提取液。这就像给药材做“单向持续冲淋”，始终保持极高的浓度梯度，既不需要加热（100% 保护热敏、挥发成分），又能把有效成分近乎 100% 榨干！',
      equipment: ['玻璃圆筒渗漉器', '铁架台双夹', '高位补液分液漏斗', '脱脂棉与滤纸', '流速接收量筒'],
      hotspots: [
        { id: 1, name: '高位溶剂补液瓶', desc: '持续补充新鲜溶剂，保持药粉层上方液面高出 2~3 cm。', warn: '严禁液面干涸进空气，否则产生沟流通道导致提取不完全！' },
        { id: 2, name: '润湿药粉装填层', desc: '先用溶剂拌湿药粉充分溶胀再装筒，压实度均匀（约占筒高 2/3）。', warn: '干粉直接装筒遇溶剂急剧膨胀会死堵渗漉筒甚至胀裂玻璃！' },
        { id: 3, name: '脱脂棉滤层与下口旋塞', desc: '筒底铺薄层脱脂棉防细粉穿漏；旋塞调节慢速 1~3 mL/min 流出。', warn: '流速过快浸出不充分，浪费大量溶剂。' },
        { id: 4, name: '分段接收瓶', desc: '先收集 85% 初滤液另器保存，续滤液低温浓缩后再合并。', warn: '易挥发乙醇渗漉时接收瓶口应加盖铝箔防挥发。' }
      ],
      subSteps: [
        { code: 'P1', title: '粗粉预润湿膨胀（防堵筒关键）', action: '药材粉碎过 20~40 目筛，加 0.8~1 倍体积溶剂拌匀密闭润湿 2~4 h，待细胞充分吸水/吸醇膨胀。', tip: '跳过润湿步骤直接装干粉，90% 会把渗漉筒彻底堵死！', biliKw: '渗漉法 润湿' },
        { code: 'P2', title: '筒底垫棉与分层压实装筒', action: '渗漉筒底部铺浸湿脱脂棉，分 3~4 次倒入润湿药粉并用玻棒轻压平整，装至筒容积 2/3，顶盖滤纸与玻璃珠。', tip: '松紧度须上下一致，避免溶剂沿筒壁走捷径（沟流）。', biliKw: '渗漉法 装筒' },
        { code: 'P3', title: '排尽气泡与闭阀静置浸渍', action: '打开下口阀缓加溶剂至下方滴出液滴赶走内部空气后立即关阀，继续加液高出药面 2~3 cm，静置浸渍 12~24 h。', tip: '充分浸渍能让细胞内有效成分先达到溶出平衡。', biliKw: '渗漉法 浸渍' },
        { code: 'P4', title: '恒速渗漉与终点检验', action: '微开下口阀控速 1~3 mL/min 收集渗漉液，顶部同步补新鲜溶剂；滴液近无色或显色阴性即止。', tip: '收集至药材量 6~8 倍体积即可满足常规提取率要求。', biliKw: '渗漉法 流速' }
      ],
      svg: `<svg viewBox="0 0 420 260" class="w-full max-w-md h-auto"><rect x="108" y="232" width="204" height="8" rx="4" fill="#475569"/><rect x="130" y="18" width="7" height="216" rx="3" fill="#64748b"/><rect x="137" y="76" width="52" height="5" rx="2" fill="#94a3b8"/><rect x="137" y="146" width="52" height="5" rx="2" fill="#94a3b8"/><rect x="196" y="18" width="28" height="26" rx="5" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/><circle cx="210" cy="48" r="2.4" fill="#0284c7" class="anim-drop"/><path d="M184 56 L236 56 L230 166 L216 184 L204 184 L190 166 Z" fill="#fff" stroke="#0f5c54" stroke-width="2.5"/><rect x="187" y="64" width="46" height="22" fill="#bae6fd" opacity="0.75"/><polygon points="188,86 232,86 227,156 193,156" fill="#d97706" opacity="0.45"/><line x1="210" y1="68" x2="210" y2="162" stroke="#0f5c54" stroke-width="2" class="anim-flow"/><rect x="196" y="156" width="28" height="10" rx="3" fill="#e2e8f0"/><rect x="198" y="180" width="24" height="6" rx="2" fill="#0a3630"/><circle cx="210" cy="196" r="2.8" fill="#d97706" class="anim-drop"/><path d="M196 206 L224 206 L232 232 L188 232 Z" fill="#fff" stroke="#0f5c54" stroke-width="2.2"/><path d="M192 220 L228 220 L231 231 L189 231 Z" fill="#f59e0b" opacity="0.65"/><text x="246" y="34" font-size="8.5" fill="#0369a1" font-weight="700">新鲜溶剂补液</text><text x="246" y="118" font-size="8.5" fill="#b45309" font-weight="700">润湿药粉床(2/3高)</text><text x="246" y="185" font-size="8.5" fill="#0a3630" font-weight="700">控速 1~3 mL/min</text><g class="hotspot-btn" data-hotspot="1"><circle cx="210" cy="30" r="10" fill="#0284c7"/><text x="210" y="34" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">1</text></g><g class="hotspot-btn" data-hotspot="2"><circle cx="210" cy="118" r="11" fill="#c58a32"/><text x="210" y="122" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">2</text></g><g class="hotspot-btn" data-hotspot="3"><circle cx="210" cy="183" r="10" fill="#0a3630"/><text x="210" y="187" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">3</text></g><g class="hotspot-btn" data-hotspot="4"><circle cx="210" cy="220" r="10" fill="#475569"/><text x="210" y="224" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">4</text></g></svg>`
    }
  };

  // 新增 10 项前沿高校/药企/炮制增效/绿色化学精编实验（精编总计 65 项，全库突破 100 项）
  const V3_PRESETS = {
    baicalin_enzyme: {
      id: 'baicalin_enzyme', isInnovative: true, featured: true, sourceTag: '高校机理对照 · 杀酶vs酶解',
      herb: '黄芩（杀酶vs酶解对照）', compound: '黄芩苷 / 黄芩素', latin: 'Scutellaria baicalensis Georgi',
      category: '黄酮', defaultRig: 'reflux', applicableRigs: ['reflux', 'filter', 'tlc'],
      defaultExtract: 'boil_enzyme', defaultSep: 'acid_precip', formulas: ['henderson', 'diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 100, time: 45, mesh: '粗粉(10~20目)', cycles: '2', solventType: '纯化水', ph: '酸沉 pH 1.5~2.0' },
      limitVal: 9.0, limitUnit: '%', crudeUnit: 'g', mpRef: '黄芩苷 223℃ / 黄芩素 264℃',
      origin: '唇形科黄芩干燥根；《中药化学》与炮制学第一经典酶促转化模型（参考 PMC3971064 & PMC12429897）。',
      chemistry: '黄芩含内源性 β-葡萄糖醛酸苷酶：沸水投药瞬时杀酶保住极性黄芩苷；45℃ 温水酶解则定量切去糖基转化为高脂溶性黄芩素（遇空气易氧化变绿）。',
      pharmacopoeia: '《中国药典》规定黄芩含黄芩苷不得少于 9.0%。',
      integrative: '一药双路线对照实验：A 组沸水杀酶保苷、B 组 45℃ 温水酶解 2h 转黄芩素，同板 TLC 一眼看清苷与苷元 Rf 剧变（解释中药炮制“黄芩冷水浸变绿失活”机理）。',
      scaling: { auxName: '浓盐酸(调pH 1.5)', auxFactor: 0.25, auxUnit: 'mL', yieldLow: 0.09, yieldHigh: 0.13, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板（聚酰胺膜更佳），乙酸乙酯-丁酮-甲酸-水 (5:3:1:1)，黄芩苷 Rf≈0.32，酶解后黄芩素 Rf 跃升至 ≈0.78！',
      tlcDefault: { front: 8.0, sample: 2.6, ref: 2.6 },
      steps: [
        { stage: '提取', title: '双组对照：A组沸水瞬时杀酶 vs B组45℃温水酶解', principle: '100℃ 沸水使内源苷酶瞬间变性失活保苷；45℃ 恰为酶最适温度催化糖苷键水解得黄芩素。', operation: '各取 25 g 黄芩粗粉：A 组直接投入沸水煮沸 45 min；B 组先 45℃ 温水保温 90 min 再醇提对照。', qc: 'A 组切忌冷水下锅慢煮！' },
        { stage: '分离', title: '酸沉析出（pH 1.5~2.0）与保温静置', principle: '黄芩苷含葡萄糖醛酸羧基，调 pH 1.5~2.0 呈分子态析出淡黄色沉淀。', operation: 'A 组滤液 80℃ 保温下滴加浓 HCl 至 pH 1.5~2.0，80℃ 保温 30 min 后静置抽滤。', qc: '酸沉保温可使沉淀颗粒粗大易抽滤。' },
        { stage: '纯化', title: '碱溶酸沉二次精制与水洗至中性', principle: '稀碱成钠盐滤除不溶杂质，再调酸析出高纯度黄芩苷晶体。', operation: '粗品加少量水调 pH 7.0 溶滤，再酸化至 pH 2.0 抽滤，水洗至中性后 60℃ 烘干。', qc: '注意防过碱导致邻三酚羟基氧化变绿。' },
        { stage: '检识', title: 'A/B 同板 TLC 苷与苷元 Rf 对比 + FeCl₃ 显色', principle: '黄芩素失糖基后极性骤降，在正相硅胶板上 Rf 远高于黄芩苷。', operation: 'A/B 两组样品与对照品同板展开，UV 365 nm 观察暗斑位置巨变。', qc: 'A 组主斑与黄芩苷 |ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [
        { issue: '黄芩水提液和沉淀变墨绿色', cause: '杀酶不彻底导致黄芩苷水解生成黄芩素（邻三酚羟基），进而氧化成绿色醌类。', fix: '务必待纯化水剧烈沸腾后再投入药材，切勿温水浸泡！' }
      ],
      sop: ['设置 A 组沸水杀酶与 B 组 45℃ 酶解平行对照', '趁热抽滤得澄清提取液', '80℃ 保温滴酸至 pH 1.5~2.0 酸沉', '抽滤水洗至中性并低温烘干', '同板 TLC 直观对比苷与苷元 Rf 差异'],
      chemTests: [{ name: '盐酸-镁粉橙红色反应', passed: true }, { name: 'FeCl₃ 绿褐色显色', passed: true }, { name: 'A/B 组 TLC 极性跃迁验证', passed: true }],
      demoBatches: [{ mass: 50, crude: 5.12, refined: 4.68, mp: 223.1 }, { mass: 50, crude: 5.26, refined: 4.82, mp: 223.6 }, { mass: 50, crude: 5.18, refined: 4.74, mp: 223.3 }]
    },
    corydalis_vinegar: {
      id: 'corydalis_vinegar', isInnovative: true, featured: true, sourceTag: '炮制增效 · NKA-9树脂',
      herb: '延胡索（生品vs醋炙对照）', compound: '延胡索乙素（四氢巴马汀）', latin: 'Corydalis yanhusuo W.T. Wang',
      category: '生物碱', defaultRig: 'resin', applicableRigs: ['reflux', 'resin', 'tlc'],
      defaultExtract: 'reflux', defaultSep: 'resin', formulas: ['henderson', 'adsorption', 'qc'],
      defaultCfg: { mass: 50, ratio: 12, temp: 75, time: 60, mesh: '中粉(40目)', cycles: '2', solventType: '70%乙醇', ph: '醋炙成盐 / 碱化pH 10' },
      limitVal: 0.05, limitUnit: '%', crudeUnit: 'g', mpRef: '延胡索乙素 147~149℃',
      origin: '罂粟科延胡索干燥块茎；“行气止痛”炮制典范，按《中国药典》5:1 醋炙后镇痛成分延胡索乙素水煎溶出率大幅翻倍（参考 PMC8739176 & PMC7011255）。',
      chemistry: '原小檗碱型叔胺生物碱，游离态难溶于水；醋炙中醋酸与其成易溶于水的醋酸盐，显著提高煎出率与脑组织分布并降低肝颤毒性。',
      pharmacopoeia: '《中国药典》规定延胡索含延胡索乙素不得少于 0.050%。',
      integrative: '高校炮制+药化联合标杆：平行对比生延胡索与醋延胡索水煎/醇提溶出率，并引入 PMC7011255 优化的 NKA-9 大孔树脂纯化工艺（总生物碱纯度 >50%）。',
      scaling: { auxName: '米醋/NKA-9树脂', auxFactor: 0.6, auxUnit: 'mL', yieldLow: 0.008, yieldHigh: 0.018, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板（1% NaOH 制备），甲苯-丙酮 (9:2)，碘蒸气显黄棕色后 UV 365 nm 呈亮黄绿色荧光（Rf≈0.58）。',
      tlcDefault: { front: 8.0, sample: 4.6, ref: 4.6 },
      steps: [
        { stage: '提取', title: '生品 vs 醋炙品（5:1 醋拌闷润炒干）平行提取', principle: '醋酸将游离叔胺生物碱转化为亲水性醋酸盐，打破溶出瓶颈。', operation: '平行称取生品与醋炙品各 25 g，分别水煎或 70% 乙醇（氨水调 pH 10）回流 60 min×2 次。', qc: '对比记录两组水煎液得率差异。' },
        { stage: '分离', title: '旋蒸脱醇与 NKA-9 大孔吸附树脂上样', principle: 'NKA-9 极性树脂对 8 种延胡索生物碱富集选择性最优。', operation: '提取液脱醇后以 2 BV/h 上 NKA-9 柱，5 BV 纯化水洗去糖类与色素杂质。', qc: '控制上样液无醇味。' },
        { stage: '纯化', title: '70% 乙醇洗脱富集总生物碱', principle: '70% 乙醇以 1.5 BV/h 洗脱可使总生物碱纯度提升至 50% 以上。', operation: '用 70% 乙醇梯度洗脱，45℃ 旋蒸浓缩干燥得精制总生物碱。', qc: '避光保存防生物碱氧化。' },
        { stage: '检识', title: '1% NaOH 碱板 TLC 与碘蒸气-UV 365 nm 荧光检识', principle: '碱板抑制叔胺电离消除拖尾，碘氧化使延胡索乙素呈现耀眼黄绿荧光。', operation: '点板展开后置碘缸熏 3 min，挥尽游离碘于 365 nm 对比生/醋品斑点强度。', qc: '醋炙品斑点明显更亮，|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [
        { issue: '普通硅胶板展开斑点严重拖尾', cause: '硅胶呈微酸性与叔胺生物碱发生离子交换吸附。', fix: '改用 1% NaOH 碱化硅胶板或在展开缸加浓氨水蒸气预饱和。' }
      ],
      sop: ['平行称取生延胡索与醋炙延胡索对照提取', '旋蒸脱醇并上 NKA-9 大孔树脂柱', '5 BV 纯化水洗杂、70% 乙醇洗脱收集', '碱化硅胶板 TLC 展开并碘熏 365 nm 检视', '对比计算炮制前后溶出率增幅'],
      chemTests: [{ name: '改良碘化铋钾橘红沉淀', passed: true }, { name: '碘熏后 UV 365nm 黄绿荧光', passed: true }, { name: '醋炙溶出率显著高于生品', passed: true }],
      demoBatches: [{ mass: 50, crude: 0.92, refined: 0.54, mp: 147.8 }, { mass: 50, crude: 0.96, refined: 0.57, mp: 148.3 }, { mass: 50, crude: 0.94, refined: 0.55, mp: 148.0 }]
    },
    berberine_des: {
      id: 'berberine_des', isInnovative: true, featured: true, sourceTag: '前沿绿色化学 · NADES',
      herb: '黄连（NADES绿色提取）', compound: '小檗碱 + 巴马汀（低共熔溶剂）', latin: 'Coptis chinensis Franch.',
      category: '生物碱', defaultRig: 'ultrasound', applicableRigs: ['ultrasound', 'filter', 'tlc'],
      defaultExtract: 'ultrasound', defaultSep: 'salting_out', formulas: ['diffusion', 'henderson', 'qc'],
      defaultCfg: { mass: 20, ratio: 20, temp: 55, time: 30, mesh: '细粉(60~80目)', cycles: '1', solventType: '氯化胆碱-乳酸NADES', ph: 'pH 3.0' },
      limitVal: 6.5, limitUnit: '%', crudeUnit: 'g', mpRef: '盐酸小檗碱 204~206℃',
      origin: '基于 PMC6150298、PMC8378955 与 PMC12257298 的绿色化学前沿实验：用食品级天然低共熔溶剂（NADES）替代强酸/有机溶剂提取小檗碱。',
      chemistry: '氯化胆碱（氢键受体）与乳酸（氢键供体，摩尔比 1:2 + 20% 水）形成强氢键网络，对小檗碱增溶 5~10 倍且口服生物利用度提升 2~20 倍！',
      pharmacopoeia: '参考《中国药典》黄连小檗碱 ≥ 5.5%，NADES-超声联用 30 min 提取率常达 7.5%~8.1%。',
      integrative: '完美契合“绿色可持续药学”竞赛方向：零挥发、零毒害、可生物降解，且溶剂本身可作为促吸收口服载体直接衔接药剂学研究。',
      scaling: { auxName: '氯化胆碱/乳酸', auxFactor: 1.5, auxUnit: 'g', yieldLow: 0.065, yieldHigh: 0.085, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板，甲苯-乙酸乙酯-甲醇-异丙醇-浓氨试液 (12:6:3:3:1)，UV 365 nm 亮黄色荧光。',
      tlcDefault: { front: 8.0, sample: 3.6, ref: 3.6 },
      steps: [
        { stage: '提取', title: '配制氯化胆碱-乳酸 NADES（含20%水降黏）并 55℃ 超声', principle: '适量水打破 NADES 过强黏度同时维持氢键增溶网络，超声空化 30 min 达峰值溶出。', operation: '氯化胆碱与乳酸 1:2 80℃ 搅拌至透明均一，加 20% 纯化水；按 1:20 料液比 55℃ 超声提取 30 min。', qc: '水含量严控 20%~30% 防黏度过高。' },
        { stage: '分离', title: '高速离心澄清与大孔树脂/反溶剂回收', principle: 'NADES 极性极高且不挥发，加水稀释破除共熔网络后经盐析或 D101 树脂捕获小檗碱。', operation: '3000 rpm 离心 10 min 取上清，加 3 倍水稀释后调酸盐析或上树脂柱回收小檗碱。', qc: '避免直接旋蒸（NADES 无挥发性）。' },
        { stage: '纯化', title: '重结晶精制与传统酸水法收率对比', principle: '对比 NADES 组与传统 0.5% 硫酸水组的提取率与耗时差异。', operation: '抽滤收集鲜黄色小檗碱结晶，50℃ 烘干称重核算绿色提升率。', qc: '平行 3 批 RSD < 3%。' },
        { stage: '检识', title: 'UV 365 nm 亮黄荧光 TLC 与漂白粉显色', principle: '同板验证 NADES 组与对照品化学结构一致无降解。', operation: '点板展开并观察 365 nm 强黄色荧光斑点。', qc: '|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [
        { issue: 'NADES 黏稠难以过滤', cause: '未按比例补加 20% 降黏水或提取温度偏低。', fix: '补加 20% 纯化水并于 50~60℃ 下离心分离代替普通抽滤。' }
      ],
      sop: ['80℃ 制备氯化胆碱-乳酸 (1:2) 透明 NADES 并加 20% 水', '与黄连粉 1:20 混合 55℃ 超声提取 30 min', '离心取上清并加水稀释破坏共熔网络', '盐析或树脂捕获小檗碱结晶称重', '与传统法对比收率并完成 TLC 检识'],
      chemTests: [{ name: 'NADES 澄清均一无析晶', passed: true }, { name: '漂白粉樱红特征显色', passed: true }, { name: 'UV 365nm 黄荧光 TLC 一致', passed: true }],
      demoBatches: [{ mass: 20, crude: 1.56, refined: 1.44, mp: 204.9 }, { mass: 20, crude: 1.62, refined: 1.49, mp: 205.4 }, { mass: 20, crude: 1.59, refined: 1.46, mp: 205.1 }]
    },
    cinnamon_oil: {
      id: 'cinnamon_oil', isInnovative: true, featured: true, sourceTag: '药典乙法 · 比水重挥发油',
      herb: '肉桂（药典乙法示范）', compound: '桂皮醛（肉桂挥发油）', latin: 'Cinnamomum cassia Presl',
      category: '挥发油与萜类', defaultRig: 'steam', applicableRigs: ['steam', 'extract', 'tlc'],
      defaultExtract: 'steam', defaultSep: 'extract', formulas: ['distill', 'diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 100, time: 240, mesh: '粗粉(10~20目)', cycles: '1', solventType: '纯化水', ph: '中性 7.0' },
      limitVal: 1.2, limitUnit: '%', crudeUnit: 'mL', mpRef: '肉桂油相对密度 1.055~1.070',
      origin: '樟科肉桂干燥树皮；专门演示《中国药典》通则 2204 挥发油测定法「乙法」——相对密度 > 1.0（沉在水底）挥发油的规范提取操作！',
      chemistry: '主含反式桂皮醛（占 75%~90%），相对密度 1.055~1.070 大于水；若用普通甲法会沉入水底无法直读体积，故乙法预先在测定管加入 1.00 mL 二甲苯降低油层密度使其上浮！',
      pharmacopoeia: '《中国药典》规定肉桂含挥发油不得少于 1.2%（mL/g），桂皮醛 ≥ 1.5%。',
      integrative: '补齐本科教学高频盲区（甲法薄荷油浮水 vs 乙法肉桂/丁香油沉水对比），精准掌握药典密度修正读数法。',
      scaling: { auxName: '二甲苯(乙法精确1.00mL)', auxFactor: 0.02, auxUnit: 'mL', yieldLow: 0.012, yieldHigh: 0.022, yieldUnit: 'mL' },
      tlcSystem: '硅胶 G 板，石油醚(60-90℃)-乙酸乙酯 (17:3)，喷 2,4-二硝基苯肼乙醇试液显橙红色斑点（Rf≈0.48）。',
      tlcDefault: { front: 8.0, sample: 3.8, ref: 3.8 },
      steps: [
        { stage: '提取', title: '药典乙法装填：测定管精准预加 1.00 mL 二甲苯', principle: '二甲苯（密度 0.86）与重质肉桂油（1.06）互溶后混合密度 < 1.0，实现油水上浮清晰读数。', operation: '50 g 肉桂粗粉加 500 mL 水与沸石；测定器注水调零后用移液管准确加入 1.00 mL 二甲苯，保持微沸共沸 4 h。', qc: '二甲苯体积务必精准至 0.01 mL。' },
        { stage: '分离', title: '静置读数（扣除 1.00 mL 空白）与分液脱水', principle: '总油层读数减去预先加入的 1.00 mL 二甲苯即得净肉桂挥发油体积。', operation: '停热静置 1 h 读数并扣除 1.00 mL；如需纯肉桂油可采用无二甲苯分液漏斗萃取回收。', qc: '油水界面清晰无乳化。' },
        { stage: '纯化', title: '无水硫酸钠脱水与棕色瓶避光封存', principle: '去除微量乳化水分防止桂皮醛缓慢氧化为肉桂酸结晶。', operation: '收集油层加无水 Na₂SO₄ 脱水过夜，过滤装入棕色螺口瓶冷藏。', qc: '防空气氧化生成白色肉桂酸沉淀。' },
        { stage: '检识', title: '2,4-二硝基苯肼醛基显色与 TLC 对照', principle: '桂皮醛 α,β-不饱和醛基与 2,4-二硝基苯肼缩合生成特征橙红色腙沉淀/斑点。', operation: '执行醛基特征显色及石油醚-乙酸乙酯 TLC 对照。', qc: '橙红色单斑 |ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [
        { issue: '油滴沉在水底回流回烧瓶导致测不出收率', cause: '误用了轻油甲法未加二甲苯托浮。', fix: '立即改用《中国药典》乙法，在测定管内准确预加 1.00 mL 二甲苯！' }
      ],
      sop: ['肉桂粗粉加水浸泡并加沸石', '测定器注水调零后准确移入 1.00 mL 二甲苯（乙法）', '微沸共沸蒸馏 4 h 至油层不再增长', '静置 1 h 读数并扣除 1.00 mL 核算收率', '完成 2,4-二硝基苯肼醛基显色与 TLC 检识'],
      chemTests: [{ name: '2,4-二硝基苯肼橙红显色', passed: true }, { name: '相对密度 > 1.0 乙法验证', passed: true }, { name: 'TLC 桂皮醛单斑一致', passed: true }],
      demoBatches: [{ mass: 50, crude: 0.78, refined: 0.68, mp: 0 }, { mass: 50, crude: 0.82, refined: 0.72, mp: 0 }, { mass: 50, crude: 0.80, refined: 0.70, mp: 0 }]
    },
    taxus_paclitaxel: {
      id: 'taxus_paclitaxel', isInnovative: true, featured: true, sourceTag: '抗癌明星 · 半合成前体',
      herb: '红豆杉枝叶（紫杉醇/巴卡亭Ⅲ）', compound: '紫杉醇 / 10-DAB Ⅲ', latin: 'Taxus wallichiana var. mairei',
      category: '萜类内酯与环烯醚萜', defaultRig: 'percolation', applicableRigs: ['percolation', 'rotavap', 'column', 'tlc'],
      defaultExtract: 'ultrasound', defaultSep: 'column', formulas: ['adsorption', 'diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 35, time: 60, mesh: '中粉(40目)', cycles: '2', solventType: '70%乙醇', ph: '中性 6.5~7.0' },
      limitVal: 0.02, limitUnit: '%', crudeUnit: 'g', mpRef: '紫杉醇 213~216℃(分解)',
      origin: '红豆杉科南方红豆杉可持续采收枝叶（严禁砍伐树皮！参考北京大学《大学化学》2022《紫杉醇抗癌记》）：提取 10-去乙酰巴卡亭Ⅲ用于半合成紫杉醇。',
      chemistry: '复杂四环二萜生物碱酯（含 11 个手性碳与氧杂环丁烷环），强酸强碱均易破坏酯键与环系，必须常温渗漉或低温超声提取并经硅胶柱梯度精制。',
      pharmacopoeia: '参考原料药提取标准：枝叶中 10-DAB Ⅲ 含量远高于紫杉醇（约 0.05%~0.15%），是现代绿色半合成工业主流路线。',
      integrative: '衔接《大学化学》“紫杉醇 + 姜黄素逆转肿瘤多重耐药”中西医结合前沿案例，贯通生态保护、常温渗漉、柱层析精制与微管稳定抗癌机理。',
      scaling: { auxName: '200-300目硅胶', auxFactor: 1.5, auxUnit: 'g', yieldLow: 0.0002, yieldHigh: 0.0008, yieldUnit: 'g' },
      tlcSystem: '硅胶 GF254 板，二氯甲烷-甲醇 (95:5)，UV 254 nm 暗斑，喷 1% 香草醛硫酸加热显紫蓝色（Rf≈0.44）。',
      tlcDefault: { front: 8.0, sample: 3.5, ref: 3.5 },
      steps: [
        { stage: '提取', title: '常温渗漉或 35℃ 低温超声温和提取', principle: '保护脆弱的氧杂环丁烷与酯键免受高温热解。', operation: '50 g 红豆杉枝叶粉用 70% 乙醇预润湿装渗漉筒，常温控速 2 mL/min 渗漉收集 8 倍液。', qc: '全程温度 ≤ 40℃、pH 维持中性。' },
        { stage: '分离', title: '低温旋蒸脱醇与脱脂液-液萃取', principle: '先石油醚除叶绿素蜡质，再乙酸乙酯富集中等极性紫杉烷类。', operation: '40℃ 旋蒸脱醇，石油醚脱脂后以乙酸乙酯萃取 3 次，合并浓缩。', qc: '严防含叶绿素直接上柱导致死吸附。' },
        { stage: '纯化', title: '硅胶柱层析精密梯度分离', principle: '按极性精细梯度分离紫杉醇与半合成前体 10-DAB Ⅲ。', operation: '二氯甲烷-甲醇 (100:1→95:5) 梯度洗脱，TLC 追踪合并纯流分浓缩析晶。', qc: '通风橱佩戴丁腈手套规范防护。' },
        { stage: '检识', title: 'UV 254 nm 暗斑与香草醛-硫酸紫蓝显色 TLC', principle: '紫杉醇苯甲酰基在 254 nm 强烈淬灭荧光，萜类母核遇香草醛-硫酸显紫蓝色。', operation: '同板点样展开，UV 254 nm 标记并喷显色剂烘烤对比。', qc: '|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [
        { issue: '提取物中叶绿素含量极高难以过柱', cause: '枝叶原料富含脂溶性叶绿素与蜡质。', fix: '旋蒸脱醇前保留 30% 水相，先用石油醚萃取脱脂 2 次再过活性炭短柱。' }
      ],
      sop: ['红豆杉枝叶润湿装渗漉筒常温提取', '40℃ 低温旋蒸脱醇', '石油醚脱除叶绿素后乙酸乙酯富集', '硅胶柱梯度洗脱并 TLC 追踪合并', 'UV 254 nm 与香草醛显色检识'],
      chemTests: [{ name: 'UV 254nm 强荧光淬灭暗斑', passed: true }, { name: '香草醛-硫酸紫蓝显色', passed: true }, { name: 'TLC 对照品共色谱', passed: true }],
      demoBatches: [{ mass: 50, crude: 0.018, refined: 0.012, mp: 214.2 }, { mass: 50, crude: 0.020, refined: 0.013, mp: 214.8 }, { mass: 50, crude: 0.019, refined: 0.012, mp: 214.5 }]
    },
    pueraria_enzyme: {
      id: 'pueraria_enzyme', isInnovative: true, featured: true, sourceTag: '酶解破壁 · 药食同源',
      herb: '葛根（纤维素酶解协同）', compound: '葛根素（异黄酮碳苷）', latin: 'Pueraria lobata (Willd.) Ohwi',
      category: '黄酮', defaultRig: 'resin', applicableRigs: ['ultrasound', 'resin', 'rotavap', 'tlc'],
      defaultExtract: 'ultrasound', defaultSep: 'resin', formulas: ['diffusion', 'adsorption', 'qc'],
      defaultCfg: { mass: 50, ratio: 12, temp: 50, time: 40, mesh: '中粉(40目)', cycles: '2', solventType: '60%乙醇', ph: '酶解pH 5.0' },
      limitVal: 2.4, limitUnit: '%', crudeUnit: 'g', mpRef: '葛根素 187~189℃',
      origin: '豆科野葛干燥根（国家“药食同源”目录品种，参考 PMC10535729 & PMC11121215）；富含淀粉与致密纤维素壁，酶解预处理可大幅提效。',
      chemistry: '异黄酮 8-C-葡萄糖苷（碳苷极耐酸水解！），可溶于热乙醇，不溶于冷氯仿；纤维素酶分解细胞壁使葛根素溶出率提升 25% 以上。',
      pharmacopoeia: '《中国药典》规定葛根含葛根素不得少于 2.4%。',
      integrative: '展示“生物酶解 + 物理超声 + 大孔树脂”绿色三联工艺，衔接葛根素心血管保护、微循环改善与解酒保肝现代药理研究。',
      scaling: { auxName: '纤维素酶/AB-8树脂', auxFactor: 0.8, auxUnit: 'g', yieldLow: 0.026, yieldHigh: 0.042, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板，三氯甲烷-甲醇-水 (7:2.5:0.25) 或乙酸乙酯-甲醇-水 (10:2:1)，UV 365 nm 下呈亮蓝白色荧光斑点（Rf≈0.46）。',
      tlcDefault: { front: 8.0, sample: 3.7, ref: 3.7 },
      steps: [
        { stage: '提取', title: '纤维素酶温和破壁 + 60% 乙醇超声提取', principle: '纤维素酶在 50℃/pH 5.0 下水解致密植物细胞壁，解除淀粉纤维包裹，随后 60% 乙醇超声高速溶出。', operation: '50 g 葛根粉加 1% 纤维素酶（pH 5.0）50℃ 酶解 45 min，补加乙醇至 60% 浓度超声 40 min×2 次。', qc: '酶解温度严控 48~52℃ 防酶失活。' },
        { stage: '分离', title: '旋蒸脱醇与 AB-8 大孔树脂除淀粉多糖', principle: '水洗彻底除去葛根大量淀粉与水溶糖，50% 乙醇精准洗脱异黄酮碳苷。', operation: '45℃ 旋蒸脱醇，澄清液上 AB-8 树脂柱，4 BV 水洗除糖后以 50% 乙醇洗脱收集。', qc: '上柱前务必离心澄清防淀粉糊柱。' },
        { stage: '纯化', title: '水-乙醇重结晶得白色针晶', principle: '利用葛根素在热稀乙醇中溶解度大、冷置急剧析晶特性提纯。', operation: '洗脱液浓缩至小体积，4℃ 静置析出类白色针状结晶，布氏漏斗抽滤烘干。', qc: '碳苷稳定不易水解，可安心热过滤。' },
        { stage: '检识', title: 'UV 365 nm 亮蓝白荧光 TLC 与碳苷耐酸验证', principle: '葛根素在 365 nm 呈标志性亮蓝白荧光，且稀酸煮沸不水解（区别于普通氧苷）。', operation: '同板 TLC 检视并测定 250 nm 紫外吸收。', qc: '|ΔRf| ≤ 0.03，收率 ≥ 2.4%。' }
      ],
      troubleshoot: [
        { issue: '提取液黏稠成淀粉糊无法过滤', cause: '提取温度过高导致葛根淀粉糊化。', fix: '先用 50℃ 纤维素酶/淀粉酶温和破壁，且后续乙醇浓度不低于 60% 抑制糊化！' }
      ],
      sop: ['pH 5.0 纤维素酶 50℃ 温和破壁 45 min', '调至 60% 乙醇超声提取 2 次', '离心澄清并 45℃ 旋蒸脱醇', 'AB-8 大孔树脂水洗除糖、50% 乙醇洗脱', '重结晶烘干并完成 UV 365 nm TLC 检识'],
      chemTests: [{ name: 'UV 365nm 亮蓝白色荧光', passed: true }, { name: '稀酸加热不水解（碳苷确证）', passed: true }, { name: 'TLC 对照品一致', passed: true }],
      demoBatches: [{ mass: 50, crude: 1.54, refined: 1.32, mp: 187.6 }, { mass: 50, crude: 1.60, refined: 1.38, mp: 188.2 }, { mass: 50, crude: 1.57, refined: 1.35, mp: 187.9 }]
    },
    tea_polyphenol: {
      id: 'tea_polyphenol', isInnovative: true, featured: true, sourceTag: '一材双提 · 本科明星实验',
      herb: '绿茶（茶多酚+咖啡因双提）', compound: '茶多酚(EGCG) + 咖啡因', latin: 'Camellia sinensis (L.) O. Ktze.',
      category: '苯丙素与有机酸', defaultRig: 'extract', applicableRigs: ['reflux', 'extract', 'rotavap', 'tlc'],
      defaultExtract: 'reflux', defaultSep: 'extract', formulas: ['nernst', 'diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 80, time: 45, mesh: '粗粉(10~20目)', cycles: '2', solventType: '70%乙醇', ph: 'pH 5.5(防氧化)' },
      limitVal: 12.0, limitUnit: '%', crudeUnit: 'g', mpRef: '咖啡因升华 178℃ / EGCG 218℃',
      origin: '山茶科绿茶干叶；原料廉价易得、3~4 学时轻松完成“一材双得”高附加值多酚与生物碱分离，是全国药学院最受欢迎综合设计之一。',
      chemistry: '茶多酚（以 EGCG 为主）易溶于乙酸乙酯而几乎不溶于氯仿；咖啡因在氯仿/二氯甲烷中分配系数极高且易升华，借双溶剂分级萃取实现零干扰分离！',
      pharmacopoeia: '优质绿茶含茶多酚 15%~25%、咖啡因 2%~4%，平行 3 批收率 RSD < 5%。',
      integrative: '变废为宝：传统咖啡因实验把茶多酚当杂质用生石灰毁掉，本双提方案用乙酸乙酯先回收高抗氧化茶多酚，再得白色丝光针状咖啡因！',
      scaling: { auxName: '乙酸乙酯萃取剂', auxFactor: 2.0, auxUnit: 'mL', yieldLow: 0.12, yieldHigh: 0.18, yieldUnit: 'g' },
      tlcSystem: '硅胶 GF254 板，乙酸乙酯-甲酸-水 (8:1:1) 检 EGCG（FeCl₃ 显深蓝黑）；乙酸乙酯-甲醇 (9:1) 检咖啡因（UV 254 nm 暗斑）。',
      tlcDefault: { front: 8.0, sample: 4.8, ref: 4.8 },
      steps: [
        { stage: '提取', title: '70% 乙醇 80℃ 回流同步浸提双成分', principle: '70% 乙醇兼溶茶多酚与咖啡因，同时减少水溶性果胶和蛋白质溶出。', operation: '50 g 绿茶加 500 mL 70% 乙醇（微酸 pH 5.5）80℃ 回流 45 min×2 次，抽滤并旋蒸脱醇。', qc: '加微量 Vc 或维持微酸防茶多酚氧化变棕。' },
        { stage: '分离', title: '分级萃取：先脱脂/萃咖啡因，再乙酸乙酯萃茶多酚', principle: '利用极性分配差异，先分离脂溶性咖啡因与色素，再由乙酸乙酯高选择性富集茶多酚。', operation: '脱醇水相先用二氯甲烷萃取收集咖啡因段；水相再以乙酸乙酯分液萃取 3 次得茶多酚段。', qc: '振摇及时放气，盐析破乳。' },
        { stage: '纯化', title: '茶多酚低温旋蒸干燥 + 咖啡因控温升华', principle: '茶多酚 45℃ 减压干燥得浅黄粉末；咖啡因拌生石灰控温升华得雪白丝光针晶。', operation: '分别旋蒸浓缩，咖啡因段按传统法升华纯化，双产物分别称重计收率。', qc: '升华火候温和防焦化发黄。' },
        { stage: '检识', title: 'FeCl₃ 多酚蓝黑显色 + 紫脲酸铵反应（咖啡因）', principle: '茶多酚遇 FeCl₃ 呈蓝黑色；咖啡因遇 HCl-KClO₃ 蒸干再遇氨气呈特征紫红色（紫脲酸铵反应）。', operation: '分别完成两类特征显色反应与双系统 TLC 对照。', qc: '两项特征反应均明确阳性。' }
      ],
      troubleshoot: [
        { issue: '茶多酚成品颜色深棕不呈淡黄', cause: '浓缩温度超过 60℃ 或溶液偏碱导致儿茶素氧化成茶红素/茶褐素。', fix: '全程维持 pH 5.0~5.5 且旋蒸温度控制在 45℃ 以下。' }
      ],
      sop: ['70% 乙醇 80℃ 回流提取绿茶 2 次并脱醇', '分液漏斗分级萃取分离咖啡因段与茶多酚段', '茶多酚段 45℃ 旋蒸真空干燥', '咖啡因段拌生石灰温和升华收白针晶', '分别执行 FeCl₃、紫脲酸铵反应与 TLC 检识'],
      chemTests: [{ name: '茶多酚 FeCl₃ 蓝黑色显色', passed: true }, { name: '咖啡因紫脲酸铵紫红反应', passed: true }, { name: '双产物 TLC 均达标', passed: true }],
      demoBatches: [{ mass: 50, crude: 7.45, refined: 6.12, mp: 178.2 }, { mass: 50, crude: 7.68, refined: 6.30, mp: 178.6 }, { mass: 50, crude: 7.56, refined: 6.21, mp: 178.4 }]
    },
    gastrodia_qc: {
      id: 'gastrodia_qc', isInnovative: true, featured: true, sourceTag: '药企QC · 双指标质控',
      herb: '天麻（药企QC双指标版）', compound: '天麻素 + 对羟基苯甲醇', latin: 'Gastrodia elata Bl.',
      category: '苯丙素与有机酸', defaultRig: 'ultrasound', applicableRigs: ['ultrasound', 'filter', 'tlc'],
      defaultExtract: 'ultrasound', defaultSep: 'resin', formulas: ['diffusion', 'qc'],
      defaultCfg: { mass: 20, ratio: 15, temp: 35, time: 30, mesh: '细粉(60~80目)', cycles: '1', solventType: '50%乙醇', ph: '中性 7.0' },
      limitVal: 0.25, limitUnit: '%', crudeUnit: 'g', mpRef: '天麻素 154~156℃',
      origin: '兰科天麻干燥块茎；道地川产/云产名贵药材，药企 QC 实验室典型 50% 稀乙醇超声快速定量检识规范。',
      chemistry: '天麻素为对羟基苯甲醇的 β-D-葡萄糖苷，强水溶性/稀醇溶，遇内源酶易水解为苷元对羟基苯甲醇，故药典以二者总量作为质控标准。',
      pharmacopoeia: '《中国药典》规定天麻含天麻素与对羟基苯甲醇总量不得少于 0.25%。',
      integrative: '对接药企 QC 日常快检流程：稀乙醇 30 min 超声一步溶出，免复杂加热，同步考核样品水分、浸出物与磷钼酸特征显色 TLC。',
      scaling: { auxName: '50%稀乙醇/滤膜', auxFactor: 0.2, auxUnit: '套', yieldLow: 0.003, yieldHigh: 0.008, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板，乙酸乙酯-甲醇-水 (9:1:0.2)，喷 10% 磷钼酸乙醇液 105℃ 加热显深蓝色斑点（天麻素 Rf≈0.34）。',
      tlcDefault: { front: 8.0, sample: 2.7, ref: 2.7 },
      steps: [
        { stage: '提取', title: '50% 稀乙醇常温超声定量浸提', principle: '天麻素极性强，50% 稀乙醇兼顾高溶出率并抑制大量天麻淀粉糊化。', operation: '精密称取天麻细粉 20 g，加 300 mL 50% 乙醇，35℃ 超声 30 min。', qc: '称量精准至 0.01 g，补足减失重量。' },
        { stage: '分离', title: '离心/微孔滤膜澄清与浓缩', principle: '迅速去除细小淀粉粒，获得清亮供试品母液。', operation: '抽滤或 4000 rpm 离心 10 min，取续滤液低温旋蒸浓缩定容。', qc: '避免高温久煮防糖苷水解。' },
        { stage: '纯化', title: '大孔树脂富集（制备备选）', principle: '常规 QC 可直接上样分析；制备单体可用极性大孔树脂水-低醇洗脱。', operation: '浓缩液按需过微孔膜或树脂柱纯化。', qc: '平行 3 批操作一致。' },
        { stage: '检识', title: '10% 磷钼酸显蓝 TLC 与 UV 220 nm 检测', principle: '酚苷与酚羟基还原磷钼酸生成特征深蓝色“钼蓝”斑点。', operation: '与天麻素对照品同板展开，喷磷钼酸乙醇液 105℃ 烘 5 min 检视。', qc: '深蓝主斑清晰 |ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [
        { issue: 'TLC 加热显色后整板发蓝背景过深', cause: '喷洒磷钼酸过多或烘烤温度过高时间过长。', fix: '采用雾化薄喷并在 105℃ 烘箱中随时观察，刚显清晰蓝斑立即取出！' }
      ],
      sop: ['精密称取天麻细粉与 50% 稀乙醇', '35℃ 超声 30 min 并补足失重', '离心抽滤澄清并低温浓缩', '同板 TLC 展开并薄喷 10% 磷钼酸显色', '核算双指标收率与 RSD'],
      chemTests: [{ name: '10%磷钼酸深蓝显色', passed: true }, { name: '碘液淀粉鉴别正常', passed: true }, { name: 'TLC 天麻素主斑一致', passed: true }],
      demoBatches: [{ mass: 20, crude: 0.082, refined: 0.064, mp: 154.6 }, { mass: 20, crude: 0.086, refined: 0.067, mp: 155.1 }, { mass: 20, crude: 0.084, refined: 0.065, mp: 154.9 }]
    },
    ginseng_rb1: {
      id: 'ginseng_rb1', isInnovative: true, featured: true, sourceTag: '皂苷经典 · 树脂vs萃取',
      herb: '人参（总皂苷树脂对比）', compound: '人参皂苷 Rg1 / Re / Rb1', latin: 'Panax ginseng C. A. Mey.',
      category: '皂苷与三萜', defaultRig: 'resin', applicableRigs: ['reflux', 'extract', 'resin', 'tlc'],
      defaultExtract: 'reflux', defaultSep: 'resin', formulas: ['adsorption', 'nernst', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 75, time: 60, mesh: '粗粉(10~20目)', cycles: '2', solventType: '70%乙醇', ph: '中性 7.0' },
      limitVal: 0.5, limitUnit: '%', crudeUnit: 'g', mpRef: '人参皂苷 Rg1 194~196℃',
      origin: '五加科人参干燥根；三萜达玛烷型皂苷代表，对比传统“水饱和正丁醇萃取”与现代“D101 大孔树脂纯化”工业主流工艺。',
      chemistry: '达玛烷型四环三萜皂苷，兼具亲水糖链与亲脂苷元，在水中剧烈发泡；正丁醇萃取易乳化且沸点高难浓缩，改用 D101 树脂 70% 乙醇洗脱效率与环保度双升！',
      pharmacopoeia: '《中国药典》规定人参含 Rg1 与 Re 总量 ≥ 0.30%，Rb1 ≥ 0.20%。',
      integrative: '经典工业替代对照实验：彻底解决本科做皂苷正丁醇萃取“乳化难分、旋蒸极慢、气味刺鼻”三大痛点。',
      scaling: { auxName: 'D101树脂/正丁醇', auxFactor: 1.2, auxUnit: 'mL', yieldLow: 0.015, yieldHigh: 0.028, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板，三氯甲烷-乙酸乙酯-甲醇-水 (15:40:22:10) 10℃ 以下放置下层液，喷 10% 硫酸乙醇 105℃ 加热显紫红色多带，UV 365 nm 显橙黄荧光。',
      tlcDefault: { front: 8.0, sample: 3.4, ref: 3.4 },
      steps: [
        { stage: '提取', title: '70% 乙醇回流浸提人参总皂苷', principle: '70% 乙醇高效溶出极性差异较大的 Rg1、Re 与 Rb1 皂苷群。', operation: '50 g 人参粗粉加 500 mL 70% 乙醇，75℃ 回流 60 min×2 次，抽滤合并。', qc: '防皂苷起泡溢出。' },
        { stage: '分离', title: '旋蒸脱醇（配缓冲球）与 D101 树脂吸附', principle: 'D101 树脂强吸附三萜骨架，纯化水与 20% 乙醇冲走糖类与色素杂质。', operation: '45℃ 加缓冲球脱醇，上 D101 柱，水洗 4 BV、20% 乙醇洗 2 BV 除杂。', qc: '脱醇浓缩务必装防暴沸缓冲球。' },
        { stage: '纯化', title: '70% 乙醇洗脱富集总皂苷', principle: '70% 乙醇一步洗脱高纯度人参总皂苷，免去高沸点正丁醇浓缩难题。', operation: '4 BV 70% 乙醇洗脱收集，50℃ 旋蒸干燥得类白色人参总皂苷粉末。', qc: '流速 1.5 BV/h。' },
        { stage: '检识', title: '10% 硫酸乙醇紫红 TLC 与持久泡沫试验', principle: '达玛烷三萜在浓酸加热下脱水显特征紫红斑点并在 365 nm 发荧光。', operation: '执行泡沫对比、Liebermann-Burchard 与药典下层液 TLC 检识。', qc: 'Rg1/Re/Rb1 三特征带清晰可辨。' }
      ],
      troubleshoot: [
        { issue: '旋蒸脱醇时剧烈起泡冲入冷凝管', cause: '人参皂苷具有极强表面活性，负压下发泡剧烈。', fix: '装液 ≤ 1/3、必加防暴沸球、阶梯降压并可滴加 1 滴正辛醇/硅油消泡。' }
      ],
      sop: ['70% 乙醇 75℃ 回流提取人参 2 次', '加防暴沸球 45℃ 旋蒸脱醇', 'D101 树脂水洗及 20% 乙醇除杂', '70% 乙醇洗脱浓缩干燥得总皂苷', '执行 10% 硫酸乙醇 TLC 与 365 nm 荧光检识'],
      chemTests: [{ name: '持久蜂窝状泡沫阳性', passed: true }, { name: '10%硫酸乙醇紫红多带', passed: true }, { name: 'UV 365nm 橙黄荧光一致', passed: true }],
      demoBatches: [{ mass: 50, crude: 1.18, refined: 0.86, mp: 194.5 }, { mass: 50, crude: 1.24, refined: 0.90, mp: 195.2 }, { mass: 50, crude: 1.21, refined: 0.88, mp: 194.8 }]
    },
    artemisinin_green: {
      id: 'artemisinin_green', isInnovative: true, featured: true, sourceTag: '诺奖经典 · 低温保过氧桥',
      herb: '青蒿（低温防降解精制）', compound: '青蒿素', latin: 'Artemisia annua L.',
      category: '萜类内酯与环烯醚萜', defaultRig: 'percolation', applicableRigs: ['percolation', 'ultrasound', 'rotavap', 'column'],
      defaultExtract: 'ultrasound', defaultSep: 'column', formulas: ['diffusion', 'adsorption', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 35, time: 30, mesh: '粗粉(10~20目)', cycles: '2', solventType: '石油醚(30-60℃)', ph: '中性 7.0' },
      limitVal: 0.6, limitUnit: '%', crudeUnit: 'g', mpRef: '青蒿素 156~157℃',
      origin: '菊科黄花蒿干燥地上部分；致敬屠呦呦团队“青蒿一握，以水二升渍，绞取汁”低温启发，凸显低沸点溶剂冷浸/渗漉保护过氧桥的化学核心！',
      chemistry: '倍半萜内酯，含极其独特的分子内过氧桥（-O-O-，抗疟必需药效团）；高温煎煮（>65℃）或强碱会瞬间破坏过氧桥失活！',
      pharmacopoeia: '《中国药典》规定优质黄花蒿含青蒿素 ≥ 0.60%（高产育种可达 1.0%+）。',
      integrative: '科学史与有机化学完美融合：对比高温回流失活与 35℃ 低温石油醚渗漉/超声高收率，并延伸至双氢青蒿素（NaBH₄ 还原）与蒿甲醚半合成逻辑。',
      scaling: { auxName: '石油醚(30-60℃)/硅胶', auxFactor: 1.2, auxUnit: 'g', yieldLow: 0.006, yieldHigh: 0.012, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板，石油醚(60-90℃)-乙酸乙酯 (4:1)，喷 2% 香草醛硫酸加热显特征紫红色斑点（Rf≈0.48）；或 KI-淀粉试液显蓝紫色（过氧桥氧化碘离子）。',
      tlcDefault: { front: 8.0, sample: 3.8, ref: 3.8 },
      steps: [
        { stage: '提取', title: '35℃ 低温石油醚(30-60℃)渗漉或超声提取', principle: '低沸点非极性石油醚选择性溶出青蒿素且全程低温，100% 保护过氧桥结构。', operation: '通风橱内以石油醚 (30-60℃) 35℃ 低温超声 30 min×2 次或常温渗漉，严禁明火！', qc: '温度严控 ≤ 40℃，全程通风防爆。' },
        { stage: '分离', title: '35℃ 低温旋蒸浓缩与 70% 乙醇除蜡质', principle: '低温回收石油醚得墨绿色粗膏，用稀醇溶解沉淀不溶性植物蜡质。', operation: '35℃ 减压回收石油醚，少量 70% 乙醇溶滤除蜡质与叶绿素粗杂。', qc: '浓缩浴温严禁超 40℃。' },
        { stage: '纯化', title: '硅胶柱层析与 50% 乙醇重结晶', principle: '硅胶柱脱色分离青蒿素单体，乙醇-水缓冷长出雪白针状结晶。', operation: '石油醚-乙酸乙酯 (8:1→4:1) 柱洗脱，TLC 合并目标管，50% 乙醇重结晶。', qc: '针状结晶熔点 156~157℃。' },
        { stage: '检识', title: '过氧桥 KI-淀粉氧化显蓝与香草醛 TLC', principle: '青蒿素过氧桥将 I⁻ 氧化为 I₂ 遇淀粉立即变蓝，为抗疟药效团专属定性试验！', operation: '执行 KI-淀粉过氧桥试验及香草醛-硫酸 TLC 共色谱。', qc: 'KI-淀粉显蓝阳性，|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [
        { issue: '提取物熔点不对且 KI-淀粉试验阴性', cause: '提取或浓缩温度过高导致过氧桥热解断裂失活。', fix: '严格将提取与旋蒸温度锁定在 35~40℃ 以下！' }
      ],
      sop: ['通风橱防爆检查并 35℃ 石油醚低温提取青蒿', '35℃ 低温旋蒸回收石油醚并脱蜡', '硅胶柱石油醚-乙酸乙酯梯度洗脱', '50% 乙醇低温重结晶得白色针晶', '执行过氧桥 KI-淀粉显色与 TLC 检识'],
      chemTests: [{ name: 'KI-淀粉过氧桥氧化变蓝', passed: true }, { name: '香草醛-硫酸紫红斑点', passed: true }, { name: '熔点 156~157℃ 达标', passed: true }],
      demoBatches: [{ mass: 50, crude: 0.42, refined: 0.32, mp: 156.2 }, { mass: 50, crude: 0.45, refined: 0.35, mp: 156.7 }, { mass: 50, crude: 0.44, refined: 0.34, mp: 156.5 }]
    }
  };

  // 新增 12 篇核实权威文献（总计 62 篇）
  const V3_LITERATURE = [
    { tag: '中西医结合', text: 'Processing and Compatibility of Corydalis yanhusuo: Vinegar Processing Mechanism & THP Tissue Distribution[J]. PMC, 2021.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8739176/' },
    { tag: '药企中试', text: 'Optimization of Extraction and NKA-9 Macroporous Resin Purification of 8 Q-Markers in Corydalis yanhusuo[J]. PMC, 2020.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7011255/' },
    { tag: '中药化学', text: 'Different Extraction Pretreatments Significantly Change the Flavonoid Profile (Baicalin vs Baicalein) of Scutellaria baicalensis[J]. PMC.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3971064/' },
    { tag: '中西医结合', text: 'Baicalin: Natural Sources, Ultrasonic/Enzyme-Assisted Extraction Techniques, and Antimicrobial Therapeutic Potential[J]. PMC, 2025.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12429897/' },
    { tag: '中药化学', text: 'A Comprehensive Review of Recent Advances in Ultrasonic Extraction and Antidiabetic Mechanisms of Berberine[J]. PMC, 2025.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12257298/' },
    { tag: '中西医结合', text: 'Natural Deep Eutectic Solvents (NADES) to Enhance Berberine Solubilization and Oral Bioavailability (2-20x)[J]. PMC, 2017.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6150298/' },
    { tag: '高校实验', text: 'Effective Extraction of Palmatine and Berberine from Coptis chinensis by Deep Eutectic Solvents (DES) + Ultrasound[J]. PMC, 2021.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8378955/' },
    { tag: '中西医结合', text: '紫杉醇抗癌记：红豆杉巴卡亭Ⅲ半合成与姜黄素逆转多重耐药联合抗癌[J]. 大学化学, 2022.', url: 'https://www.dxhx.pku.edu.cn/article/2022/1000-8438/20220930.shtml' },
    { tag: '药企中试', text: 'Approaches to Establish Q-Markers for Quality Standards of Traditional Chinese Medicine Decoctions (SDTS)[J]. PMC, 2017.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5518652/' },
    { tag: '中药化学', text: 'Deep Eutectic Solvents for Sustainable Green Extraction of Bioactive Alkaloids and Polyphenols[J]. PMC, 2025.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12985999/' },
    { tag: '高校实验', text: 'Natural Deep Eutectic Solvents (NADES) Combined with Reverse-Phase Extraction in Herbal Analysis[J]. PMC, 2022.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9818194/' },
    { tag: '中西医结合', text: 'The Antinociceptive Properties and Standardized Water Decoction Process of Vinegar-Processed Corydalis yanhusuo[J]. PMC, 2016.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5021270/' }
  ];

  // 新增 6 项前沿高校与药企实验室案例（总计 26 项）
  const V3_UNIV_CASES = [
    { type: '高校实验', univ: '黄芩酶促机制对照实验室', title: '沸水杀酶保苷 vs 45℃ 酶解转黄芩素对比实验', desc: '通过温控前处理精准控制黄芩苷与黄芩素转化，并用 TLC 直观揭示传统炮制机理。', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3971064/' },
    { type: '药企中试', univ: '延胡索 Q-Marker 工业化实验室', title: '醋炙减毒增效 + NKA-9 树脂富集 8 个 Q-Marker（>50%）', desc: '采用均匀设计与 NKA-9 大孔树脂纯化延胡索总生物碱，为镇痛中药中试提供完整工艺参数。', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7011255/' },
    { type: '中西医结合', univ: '绿色 NADES 药学实验室', title: '氯化胆碱-乳酸低共熔溶剂超声提取小檗碱（增溶 5~10 倍）', desc: '零有毒有机溶剂提取并大幅提高口服生物利用度，示范前沿绿色天然药物化学思路。', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6150298/' },
    { type: '中西医结合', univ: '北京大学《大学化学》', title: '红豆杉巴卡亭Ⅲ半合成紫杉醇与姜黄素逆转肿瘤耐药', desc: '以红豆杉可持续枝叶半合成解决资源瓶颈，结合姜黄素协同逆转癌细胞多重耐药机制。', url: 'https://www.dxhx.pku.edu.cn/article/2022/1000-8438/20220930.shtml' },
    { type: '药企QC', univ: '中药标准汤剂 Q-Marker 研究组', title: '标准汤剂 10 批次投料、减压浓缩(<50℃)与指纹图谱质控规范', desc: '建立从饮片炮制、浸泡煎煮、低温减压浓缩到 HPLC/LC-MS 质量标志物的全链路 QC 体系。', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5518652/' },
    { type: '高校实验', univ: '小檗碱超声动力学研究组', title: '黄连硫酸水浸泡 + 20kHz 超声 30 min 提效（收率 8.12%）', desc: '系统对比超声法与传统索氏提取法，证实超声法收率提高 9.6% 且重复性显著更优。', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12257298/' }
  ];

  // 10 种实验室常用溶剂极性指数与理化性质速查表（0-Token TLC 展开剂调优核心数据）
  const SOLVENT_POLARITY_TABLE = [
    { name: '石油醚(30-60℃)', p: 0.1, bp: '30~60℃', density: '0.65 (上层)', green: '易燃低毒', color: '#fef3c7' },
    { name: '正己烷', p: 0.1, bp: '69℃', density: '0.66 (上层)', green: '易燃神经毒', color: '#fef3c7' },
    { name: '甲苯', p: 2.4, bp: '111℃', density: '0.87 (上层)', green: '中等毒性', color: '#fde68a' },
    { name: '二氯甲烷', p: 3.1, bp: '40℃', density: '1.33 (下层)', green: '含卤需通风', color: '#fed7aa' },
    { name: '三氯甲烷(氯仿)', p: 4.1, bp: '61℃', density: '1.49 (下层)', green: '含卤高危', color: '#fecaca' },
    { name: '乙酸乙酯', p: 4.4, bp: '77℃', density: '0.90 (上层)', green: '绿色推荐', color: '#d1fae5' },
    { name: '丙酮', p: 5.1, bp: '56℃', density: '0.79 (互溶)', green: '绿色易燃', color: '#a7f3d0' },
    { name: '乙醇', p: 5.2, bp: '78℃', density: '0.79 (互溶)', green: '绿色首选', color: '#6ee7b7' },
    { name: '甲醇', p: 5.1, bp: '65℃', density: '0.79 (互溶)', green: '易燃有毒', color: '#bae6fd' },
    { name: '纯化水', p: 10.2, bp: '100℃', density: '1.00 (基准)', green: '零毒环保', color: '#7dd3fc' }
  ];

  // 实验室常见试剂安全 MSDS 与废液分类规则库
  const REAGENT_MSDS_DB = [
    { key: 'ethanol', match: /乙醇|酒精/, name: '乙醇 (Ethanol)', level: '易燃', badgeCls: 'bg-amber-100 text-amber-900', ppe: '通风良好 + 严禁明火（改水浴加热）', waste: '非卤有机废液桶', tip: '沸点 78℃，回流与旋蒸务必先通冷却水再加热。' },
    { key: 'chloroform', match: /氯仿|三氯甲烷|二氯甲烷/, name: '三氯甲烷 / 二氯甲烷 (含卤溶剂)', level: '高危挥发', badgeCls: 'bg-rose-100 text-rose-900', ppe: '强制通风橱 + 双层丁腈手套 + 护目镜', waste: '含卤有机废液桶（严禁混入非卤桶！）', tip: '密度大于水在下层，分液振摇必须勤放气。' },
    { key: 'ethyl_acetate', match: /乙酸乙酯|乙酸丁酯/, name: '乙酸乙酯 (Ethyl Acetate)', level: '易燃低毒', badgeCls: 'bg-emerald-100 text-emerald-900', ppe: '通风橱操作 + 远离火源', waste: '非卤有机废液桶', tip: '优良绿色替代萃取剂，密度 0.90 位于水相上层。' },
    { key: 'pet_ether', match: /石油醚|正己烷|环己烷|乙醚/, name: '石油醚 / 烃类低沸溶剂', level: '极易燃', badgeCls: 'bg-orange-100 text-orange-900', ppe: '防爆通风橱 + 严禁静电与明火', waste: '非卤有机废液桶', tip: '沸点低挥发极快，切勿用电热套直接明火加热。' },
    { key: 'methanol', match: /甲醇|甲苯|二甲苯|丙酮|丁酮/, name: '甲醇 / 甲苯 / 二甲苯', level: '有毒易燃', badgeCls: 'bg-rose-100 text-rose-900', ppe: '强制通风橱 + 丁腈手套 + 护目镜', waste: '非卤有机废液桶', tip: '避免皮肤接触与蒸汽吸入，TLC 展开缸须密封操作。' },
    { key: 'acid', match: /盐酸|硫酸|甲酸|醋酸|冰醋酸|酸水/, name: '强酸 / 有机酸 (HCl / H₂SO₄ / 甲酸)', level: '强腐蚀', badgeCls: 'bg-rose-100 text-rose-900', ppe: '耐酸碱手套 + 护目镜 + 通风橱配制', waste: '酸性无机废液桶（中和后合规处置）', tip: '稀释浓硫酸必须“酸缓慢入水并搅拌”，严禁水入酸！' },
    { key: 'base', match: /氢氧化钠|NaOH|氨水|石灰|硼砂|碳酸氢钠/, name: '碱液 / 浓氨水 (NaOH / NH₃·H₂O)', level: '腐蚀刺激', badgeCls: 'bg-amber-100 text-amber-900', ppe: '护目镜 + 手套（浓氨水须在通风橱开盖）', waste: '碱性无机废液桶', tip: '碱溅皮肤立即大量流动清水冲洗 15 min 以上。' },
    { key: 'silica', match: /硅胶|树脂|柱层析|TLC/, name: '硅胶粉 (200-300目) / 树脂固废', level: '粉尘防护', badgeCls: 'bg-slate-100 text-slate-800', ppe: '防尘口罩 + 通风橱干法装柱/拌样', waste: '含溶剂硅胶固废专用回收袋', tip: '严禁将废硅胶倒入水槽，极易造成实验室下水道彻底堵塞！' }
  ];

  window.TCM_V3_DATA = Object.freeze({
    V3_RIGS,
    V3_PRESETS,
    V3_LITERATURE,
    V3_UNIV_CASES,
    SOLVENT_POLARITY_TABLE,
    REAGENT_MSDS_DB
  });
})();
