// 本草智研 · 扩展实验室知识库与装置工艺数据模块
// 包含：新增交互式 SVG 实验装置（旋转蒸发仪、大孔吸附树脂柱）、全 9 套装置精准短词 B站检索与 4 步可操作小分支、
// 4 大工艺阶段细分小分支模板、12 项高校/药企/中西医结合精编实验、16 篇核实文献、10 项院校与社会实验室案例、AI 结构化前置模板。
(function () {
  'use strict';

  const EXTRA_RIGS = {
    rotavap: {
      title: '旋转蒸发仪减压浓缩与溶剂回收装置',
      stageTag: '浓缩回收装置',
      videoKw: '旋转蒸发仪 使用',
      order: '水浴锅预热(40~55℃) → 冷却循环水开启 → 装液不超过蒸发瓶1/2并夹紧防脱卡扣 → 开真空泵抽负压 → 调转速 60~90 rpm → 结束先停转、破真空、再关泵。',
      plainTheory: '【降压降沸点·低温快速蒸发法】很多中药有效成分怕高温，直接在常压下煮沸浓缩乙醇或水会把成分烤焦。旋转蒸发仪一边用真空泵把瓶内空气抽走（降低气压，让乙醇在 35~45℃ 就沸腾），一边让烧瓶匀速旋转，把药液在瓶壁摊成一层薄薄的液膜，蒸发面积瞬间扩大十几倍，既保住了热敏成分，又能把蒸出来的乙醇冷凝回收重复利用！',
      equipment: ['旋转蒸发仪主机', '500mL梨形蒸发瓶', '蛇形冷凝管与冷却循环泵', '防暴沸缓冲球', '循环水真空泵', '1000mL溶剂接收瓶'],
      hotspots: [
        { id: 1, name: '恒温水浴锅与梨形蒸发瓶', desc: '装液量严禁超过瓶容积 1/2，转速 60~90 rpm 形成均匀液膜。', warn: '先确认防脱卡扣扣紧，防止蒸发瓶滑落摔碎！' },
        { id: 2, name: '防暴沸缓冲球', desc: '拦截含皂苷/多糖提取液起泡冲料，保护冷凝管不被污染。', warn: '起泡严重时立即微调放气阀泄压并降转速。' },
        { id: 3, name: '蛇形双层冷凝管', desc: '低温冷却循环液（0~10℃）高效冷凝乙醇/乙酸乙酯蒸汽。', warn: '必须先通冷却液再抽真空加热，防止溶剂抽入真空泵。' },
        { id: 4, name: '真空表与放气阀', desc: '阶梯降压控沸，实验结束务必遵循“先停转→缓开放气阀→再关泵”。', warn: '直接关泵会导致水泵倒吸或气压冲击震碎玻璃！' }
      ],
      svg: `<svg viewBox="0 0 420 260" class="w-full max-w-md h-auto"><defs><linearGradient id="rvBath" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#bae6fd"/><stop offset="100%" stop-color="#0284c7"/></linearGradient><linearGradient id="rvLiq" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#d97706"/></linearGradient></defs><rect x="44" y="232" width="332" height="8" rx="4" fill="#475569"/><rect x="195" y="34" width="12" height="198" rx="4" fill="#64748b"/><rect x="52" y="182" width="112" height="50" rx="8" fill="#1e293b"/><rect x="60" y="190" width="96" height="22" rx="4" fill="url(#rvBath)" opacity="0.78"/><text x="108" y="224" text-anchor="middle" font-size="9" fill="#34d399" font-family="monospace">45.0℃ · 75 rpm</text><g transform="rotate(-28 112 168)"><ellipse cx="112" cy="168" rx="30" ry="26" fill="#fff" stroke="#0f5c54" stroke-width="2.5"/><path d="M84 174 A28 24 0 0 0 140 174 Z" fill="url(#rvLiq)" opacity="0.78"/><rect x="136" y="160" width="24" height="14" rx="2" fill="#fff" stroke="#0f5c54" stroke-width="2.2"/></g><circle cx="152" cy="144" r="14" fill="#fef3c7" stroke="#d97706" stroke-width="2"/><path d="M164 136 L228 96" stroke="#0f5c54" stroke-width="5"/><path d="M164 136 L228 96" stroke="#6ee7b7" stroke-width="2" class="anim-flow"/><rect x="234" y="36" width="44" height="122" rx="18" fill="#e0f2fe" stroke="#0284c7" stroke-width="2.2" opacity="0.9"/><path d="M244 52 Q268 62 244 74 Q268 86 244 98 Q268 110 244 122 Q268 134 256 146" fill="none" stroke="#0f5c54" stroke-width="2.4"/><circle cx="256" cy="158" r="2.8" fill="#0284c7" class="anim-drop"/><circle cx="256" cy="196" r="28" fill="#fff" stroke="#0f5c54" stroke-width="2.4"/><path d="M232 204 A26 24 0 0 0 280 204 Z" fill="#bae6fd" opacity="0.85"/><text x="256" y="216" text-anchor="middle" font-size="8.5" fill="#0369a1" font-weight="700">回收溶剂</text><path d="M278 54 L334 54 L334 156" fill="none" stroke="#475569" stroke-width="3"/><path d="M278 54 L334 54 L334 156" fill="none" stroke="#38bdf8" stroke-width="1.6" class="anim-flow"/><rect x="302" y="156" width="70" height="58" rx="8" fill="#1e293b"/><text x="337" y="182" text-anchor="middle" font-size="9.5" fill="#fff" font-weight="700">真空泵</text><text x="337" y="198" text-anchor="middle" font-size="8" fill="#34d399" font-family="monospace">-0.085 MPa</text><g class="hotspot-btn" data-hotspot="1"><circle cx="108" cy="176" r="11" fill="#0a3630"/><text x="108" y="180" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">1</text></g><g class="hotspot-btn" data-hotspot="2"><circle cx="152" cy="144" r="10" fill="#c58a32"/><text x="152" y="148" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">2</text></g><g class="hotspot-btn" data-hotspot="3"><circle cx="256" cy="94" r="11" fill="#0284c7"/><text x="256" y="98" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">3</text></g><g class="hotspot-btn" data-hotspot="4"><circle cx="334" cy="112" r="11" fill="#475569"/><text x="334" y="116" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">4</text></g></svg>`
    },
    resin: {
      title: '大孔吸附树脂柱分级纯化装置（D101 / AB-8）',
      stageTag: '工业级纯化装置',
      videoKw: '大孔吸附树脂 装柱',
      order: '树脂95%乙醇浸泡溶胀24h → 湿法装柱去气泡 → 醇洗至加水不浑浊 → 纯化水洗净至无醇味 → 缓速上样(1~2 BV/h) → 水洗除糖 → 乙醇梯度洗脱。',
      plainTheory: '【多孔海绵·水洗除糖醇洗收宝法】中药水提液里混杂着大量无用的糖类、无机盐和黏液质。大孔吸附树脂是一颗颗布满纳米微孔的高分子小珠子，像一块“只吸有效成分、不吸糖水”的智能海绵：上样时黄酮、皂苷等活性分子被牢牢吸在微孔里；先用清水冲一遍，糖和盐全被冲走；再用 30%~70% 乙醇一冲，高纯度的有效成分就干干净净流出来，而且树脂再生后能反复用几十次，是高校与药企最常用的绿色纯化神器！',
      equipment: ['玻璃层析柱(带砂芯)', 'D101或AB-8大孔树脂', '恒流泵/分液漏斗', '梯度乙醇洗脱液', 'BV体积量筒与接液瓶'],
      hotspots: [
        { id: 1, name: '树脂预处理与湿法装柱', desc: '95% 乙醇浸泡溶胀 24h 后水洗至无醇味，柱高径比控制在 6:1 ~ 10:1。', warn: '未除尽单体致孔剂会污染样品，必测“洗出液加水 1:5 不浑浊”！' },
        { id: 2, name: '低速上样吸附区', desc: '样液浓缩至无醇味并调至适宜 pH，控制流速 1~2 BV/h 充分吸附。', warn: '上样液含乙醇过高或流速太快会直接导致目标成分“穿漏”流失！' },
        { id: 3, name: '水洗除杂与乙醇梯度洗脱', desc: '先以 3~5 BV 纯化水除多糖与无机盐，再以 30%→70% 乙醇分段洗脱。', warn: '每次切换乙醇浓度时保持液面高出树脂床 2 cm，严禁干柱进气。' },
        { id: 4, name: '树脂再生循环', desc: '洗脱完毕以 95% 乙醇洗至无色，再用 5% HCl/NaOH 交替再生备用。', warn: '长期存放需浸泡于 20% 乙醇中防霉变干裂。' }
      ],
      svg: `<svg viewBox="0 0 420 260" class="w-full max-w-md h-auto"><rect x="108" y="232" width="204" height="8" rx="4" fill="#475569"/><rect x="128" y="20" width="7" height="214" rx="3" fill="#64748b"/><rect x="135" y="72" width="52" height="5" rx="2" fill="#94a3b8"/><rect x="135" y="152" width="52" height="5" rx="2" fill="#94a3b8"/><rect x="187" y="28" width="46" height="154" rx="6" fill="#fff" stroke="#0f5c54" stroke-width="2.5"/><rect x="189" y="34" width="42" height="22" fill="#e0f2fe" opacity="0.85"/><rect x="189" y="56" width="42" height="114" fill="#fef9c3" opacity="0.72"/><g class="anim-band"><rect x="189" y="68" width="42" height="12" fill="#d97706" opacity="0.68"/><rect x="189" y="96" width="42" height="16" fill="#0f766e" opacity="0.75"/><rect x="189" y="130" width="42" height="12" fill="#38bdf8" opacity="0.65"/></g><rect x="189" y="170" width="42" height="8" fill="#cbd5e1"/><rect x="195" y="182" width="30" height="7" rx="2" fill="#0a3630"/><circle cx="210" cy="196" r="2.8" fill="#0f766e" class="anim-drop"/><path d="M196 206 L224 206 L232 232 L188 232 Z" fill="#fff" stroke="#0f5c54" stroke-width="2.2"/><text x="244" y="48" font-size="8.5" fill="#0369a1" font-weight="700">梯度洗脱液 (水→乙醇)</text><text x="244" y="78" font-size="8.5" fill="#b45309" font-weight="700">弱极性色素保留</text><text x="244" y="108" font-size="8.5" fill="#0f5c54" font-weight="700">目标活性成分富集带</text><text x="244" y="139" font-size="8.5" fill="#0284c7" font-weight="700">水溶性多糖先洗脱</text><g class="hotspot-btn" data-hotspot="1"><circle cx="210" cy="45" r="10" fill="#0284c7"/><text x="210" y="49" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">1</text></g><g class="hotspot-btn" data-hotspot="2"><circle cx="210" cy="104" r="11" fill="#0a3630"/><text x="210" y="108" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">2</text></g><g class="hotspot-btn" data-hotspot="3"><circle cx="210" cy="162" r="10" fill="#c58a32"/><text x="210" y="166" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">3</text></g><g class="hotspot-btn" data-hotspot="4"><circle cx="210" cy="218" r="10" fill="#475569"/><text x="210" y="222" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">4</text></g></svg>`
    }
  };

  // 为全部 9 套装置提供精准短词 B站关键词（1~2 词高命中）与 4 步可操作小分支拆解
  const RIG_ENHANCEMENTS = {
    steam: {
      stageTag: '挥发油提取装置',
      videoKw: '水蒸气蒸馏 挥发油',
      subSteps: [
        { code: 'S1', title: '药材润湿与防暴沸装填', action: '药材切段/粗粉置圆底烧瓶，加 8~10 倍纯化水浸泡 30 min，投入 3~5 粒沸石，总液面严禁超瓶容积 2/3。', tip: '沸石切忌在液体沸腾后补加，防剧烈暴沸冲料。', biliKw: '挥发油测定器' },
        { code: 'S2', title: '自下而上气密搭建与调零', action: '按“电热套→圆底烧瓶→挥发油测定器→球形冷凝管”由下向上固定，磨口轻涂凡士林；从测定器顶端注水至刻度零并溢流回烧瓶。', tip: '注水调零能避免前期微量油滴直接挂壁粘附。', biliKw: '球形冷凝管 安装' },
        { code: 'S3', title: '先通冷水后升温微沸共沸', action: '确认冷却水“下进上出”顺畅流动后再开电热套；先大火至微沸，立即降功率维持回流速率 2~3 滴/秒，持续 3~5 h。', tip: '加热过猛易起泡乳化，可滴加 1~2 滴硅油消泡。', biliKw: '水蒸气蒸馏 实验' },
        { code: 'S4', title: '静置读数、接油与无水硫酸钠脱水', action: '停止加热静置 1 h 待油水界线清晰，直读挥发油体积；先缓放底层水相，再将油层接入干燥棕色小瓶，加少量无水 Na₂SO₄ 脱水过夜。', tip: '比水重挥发油（如丁香油）改用乙法并加二甲苯托浮。', biliKw: '无水硫酸钠 干燥' }
      ]
    },
    reflux: {
      stageTag: '热回流提取装置',
      videoKw: '加热回流 装置',
      subSteps: [
        { code: 'R1', title: '水浴定位与烧瓶双夹固定', action: '先摆放恒温水浴锅确定高度，再用带橡皮垫的铁夹垂直固定圆底烧瓶瓶颈，加入药材、乙醇溶剂与沸石。', tip: '易燃有机溶剂严禁明火加热，必须在通风橱水浴操作。', biliKw: '加热回流 搭建' },
        { code: 'R2', title: '球形冷凝管垂直对接（顶端敞口）', action: '将球形冷凝管垂直插入烧瓶磨口并用第二只铁夹辅助固定；确认冷凝管顶部保持敞口通大气。', tip: '顶端严禁加塞密闭，否则受热升压有炸裂风险！', biliKw: '球形冷凝管' },
        { code: 'R3', title: '逆流通水与控温微沸循环', action: '橡胶管“下口进冷水、上口出温水”并扎带防崩脱；升温至溶剂微沸，保持蒸汽冷凝环处于冷凝管下 1/3 处。', tip: '如冷凝环冲至顶端说明火力过大或水流量不足。', biliKw: '回流提取 实验' },
        { code: 'R4', title: '断电降温、趁热抽滤与二次合并', action: '先关热源待瓶内停止沸腾后再停冷却水；倾出提取液抽滤，药渣加新鲜溶剂重复提取 1~2 次合并滤液。', tip: '两次少量新鲜溶剂提取比一次大体积效率高 30%+。', biliKw: '趁热过滤 实验' }
      ]
    },
    soxhlet: {
      stageTag: '连续回流提取装置',
      videoKw: '索氏提取器',
      subSteps: [
        { code: 'X1', title: '滤纸筒折制与限高装药', action: '按提取筒内径卷折圆底滤纸筒，装入干燥药材粉，上方轻压一薄层脱脂棉防药粉漂浮堵塞虹吸管。', tip: '滤纸筒顶缘必须低于虹吸管最高弯折处 0.5~1 cm！', biliKw: '索氏提取 滤纸筒' },
        { code: 'X2', title: '三段式磨口串联与水浴就位', action: '烧瓶加 1/2 容积低沸点溶剂（乙醇/石油醚）与沸石，依次连接索氏提取筒与球形冷凝管，铁夹竖直稳固。', tip: '提取筒虹吸侧管较脆，夹持时切勿用力过猛。', biliKw: '索氏提取器 安装' },
        { code: 'X3', title: '控温虹吸循环监测', action: '通冷却水后温和加热，观察溶剂蒸汽经粗侧管上升、冷凝滴入筒内浸泡，液面达虹吸顶点瞬间自动回流；记录虹吸次数（通常 6~10 次）。', tip: '虹吸液近无色或点板无目标斑点即可终止提取。', biliKw: '索氏提取 原理' },
        { code: 'X4', title: '停止加热与溶剂回收浓缩', action: '待最后一次虹吸刚完成、提取筒空置时断电冷却，拆下提取筒，将烧瓶接旋转蒸发仪回收溶剂。', tip: '趁提取筒无液时拆除可避免溶剂洒漏与有效成分残留。', biliKw: '旋转蒸发仪 使用' }
      ]
    },
    ultrasound: {
      stageTag: '低温超声提取装置',
      videoKw: '超声波 提取',
      subSteps: [
        { code: 'U1', title: '超声槽注水与脱气准备', action: '向数控超声清洗槽注入纯化水至推荐液位线（没过换能器上方 2/3），短时开启超声 2 min 脱除水中气泡。', tip: '严禁无水或低液位空载开机，极易烧毁压电换能器！', biliKw: '超声波清洗机 使用' },
        { code: 'U2', title: '具塞锥形瓶加料与网篮悬置', action: '准确称取药材入具塞锥形瓶，加定量溶剂摇匀，轻盖磨口塞（勿拧死）；将瓶置于不锈钢网篮中避免直贴槽底。', tip: '瓶底直接接触超声槽底易因高频共振炸裂。', biliKw: '超声辅助提取' },
        { code: 'U3', title: '设定频率功率与冰袋控温', action: '设定 40 kHz、250~300 W、定时 20~30 min；热敏成分（青蒿素/绿原酸/多糖）随时监测水温，超过 40℃ 及时补冰水降温。', tip: '长时间超声会显著生热，需主动控温防成分氧化。', biliKw: '热敏成分 提取' },
        { code: 'U4', title: '离心/抽滤澄清与二次复提', action: '提取结束取出静置，经布氏漏斗抽滤或 4000 rpm 离心 10 min 得澄清提取液，药渣按需复提 1 次合并。', tip: '若用低沸点有机溶剂，必须在通风橱内开启超声。', biliKw: '减压抽滤 操作' }
      ]
    },
    filter: {
      stageTag: '固液分离装置',
      videoKw: '减压抽滤 布氏漏斗',
      subSteps: [
        { code: 'F1', title: '滤纸精准裁剪与润湿贴合', action: '剪取直径略小于布氏漏斗内底的滤纸（完全盖住筛孔且不翘边），用少量同体系溶剂润湿并微抽吸使其紧贴瓷板。', tip: '滤纸卷边会导致结晶穿滤、滤液浑浊。', biliKw: '减压抽滤 滤纸' },
        { code: 'F2', title: '抽滤瓶方向与安全缓冲瓶串联', action: '布氏漏斗斜口背对抽滤瓶抽气支管；抽滤瓶与真空泵之间串联安全瓶（长管接抽滤瓶、短管接泵，或双短管缓冲）。', tip: '斜口朝向支管会把滤液直接抽进真空管造成损失。', biliKw: '布氏漏斗 安装' },
        { code: 'F3', title: '玻璃棒引流与少量冷溶剂淋洗', action: '先开真空泵再沿玻璃棒将悬浊液倾入漏斗中心；抽干后关泵/泄压，加少量预冷溶剂润洗滤饼再抽干。', tip: '热饱和液抽滤前应预热漏斗，防止结晶提前堵塞筛孔。', biliKw: '抽滤 洗涤沉淀' },
        { code: 'F4', title: '规范收尾：先拔管放气，再关泵', action: '抽滤完毕务必先拔掉安全瓶连接管或打开放气阀恢复常压，确认无负压后再关闭真空泵电源。', tip: '直接关泵会瞬间把水泵水倒吸入抽滤瓶毁掉全部产物！', biliKw: '循环水真空泵' }
      ]
    },
    extract: {
      stageTag: '液-液萃取装置',
      videoKw: '分液漏斗 萃取',
      subSteps: [
        { code: 'E1', title: '分液漏斗检漏与铁圈定位', action: '向分液漏斗加少量水检查旋塞与磨口塞是否渗漏，活塞处微涂凡士林（勿堵孔）；用垫橡皮的铁圈稳固固定。', tip: '未检漏直接倒氯仿/乙酸乙酯极易漏液烫伤或损失样品。', biliKw: '分液漏斗 检漏' },
        { code: 'E2', title: '装液限容与倒置振摇放气', action: '倒入水相与萃取溶剂（总液量不超容积 2/3）；右手食指压紧瓶塞、左手握活塞，倒置轻摇 2~3 次立即开塞放气，重复至无“嘶嘶”放气声。', tip: '酸碱中和产 CO₂ 或用乙醚/二氯甲烷时，不放气必冲塞！', biliKw: '分液漏斗 放气' },
        { code: 'E3', title: '静置分层与乳化破乳处理', action: '置铁圈静置分层，明确溶剂密度（乙酸乙酯/正丁醇在上层，氯仿/二氯甲烷在下层）；若界面乳化，采用静置、加饱和 NaCl 盐析或玻棒轻搅破乳。', tip: '遵循“少量多次”（如 3×30 mL）萃取率远高于单次大体积。', biliKw: '萃取 乳化处理' },
        { code: 'E4', title: '开塞分液与有机相脱水', action: '分液前先取下顶部玻璃塞通气；下层液从下口缓慢放出至界面即停，上层液从上口倒出；合并有机层加无水 Na₂SO₄ 脱水。', tip: '上下层严禁全从下口放出，防止交叉污染。', biliKw: '分液漏斗 分液' }
      ]
    },
    column: {
      stageTag: '色谱精制装置',
      videoKw: '硅胶柱层析 装柱',
      subSteps: [
        { code: 'C1', title: '柱底垫棉与湿法匀浆装柱', action: '柱底轻塞脱脂棉并加洗脱剂赶走气泡；将 200~300 目硅胶与起始洗脱剂调成匀浆，边倒边轻敲柱壁沉降紧实，顶部铺 0.5 cm 石英砂保护。', tip: '装柱气泡或断层会导致色带歪斜、分离彻底失败。', biliKw: '硅胶柱 湿法装柱' },
        { code: 'C2', title: '湿法或干法拌样平整上样', action: '溶解度好时用极少量起始溶剂湿法沿壁缓加；难溶浸膏用 1.5 倍 100~200 目硅胶拌样蒸干后干法均匀铺于柱顶。', tip: '上样带越窄越平，最终分离度越高。', biliKw: '柱层析 干法上样' },
        { code: 'C3', title: '极性由小到大梯度洗脱', action: '按 TLC 筛选比例配制梯度洗脱剂（如石油醚-乙酸乙酯 10:1→5:1→2:1），控流速 1~2 滴/秒，全过程液面不得低于柱床。', tip: '严禁干柱！换极性时先沿壁缓加少量新洗脱剂。', biliKw: '梯度洗脱 柱层析' },
        { code: 'C4', title: '分段接管与 TLC 合并纯流分', action: '按每 10~15 mL 编管收集，逐管点板 TLC 检视；将仅含单一目标斑点的相邻流分合并，旋蒸回收溶剂结晶。', tip: '每切换一次梯度务必标记起始管号，便于复盘分析。', biliKw: '薄层色谱 点样' }
      ]
    },
    rotavap: {
      stageTag: '浓缩回收装置',
      videoKw: '旋转蒸发仪 使用',
      subSteps: [
        { code: 'V1', title: '水浴预热与冷却循环启动', action: '设定水浴锅温度（乙醇体系 45~50℃，水相 55~60℃），开启低温冷却循环泵确认冷凝管充分降温。', tip: '先通冷再抽真空，防止溶剂蒸汽未经冷凝直接抽入泵内。', biliKw: '旋转蒸发仪 操作' },
        { code: 'V2', title: '梨形瓶装液与卡扣锁紧', action: '倒入待浓缩提取液（不超过瓶容积 1/2），套好防暴沸缓冲球，扣紧蓝色防脱塑料卡扣并开启缓慢旋转（60~80 rpm）。', tip: '旋转离心力可摊开液膜并显著抑制爆沸。', biliKw: '旋蒸 防暴沸' },
        { code: 'V3', title: '阶梯降压与防起泡监控', action: '开启真空泵逐步关闭放气阀建立负压，观察冷凝管稳定滴液；含皂苷/多糖起泡时立即微开放气阀泄压。', tip: '出现冲料时第一时间手扶放气阀缓泄真空，勿直接关泵。', biliKw: '旋转蒸发仪 暴沸' },
        { code: 'V4', title: '标准停机顺序与浸膏转移', action: '浓缩至近干或预定体积后，严格按“升起水浴→停止旋转→缓开放气阀破真空→关闭真空泵”顺序拆瓶收集。', tip: '拆瓶前务必确认手托烧瓶并已彻底恢复常压。', biliKw: '旋蒸 停机顺序' }
      ]
    },
    resin: {
      stageTag: '工业级纯化装置',
      videoKw: '大孔吸附树脂 装柱',
      subSteps: [
        { code: 'M1', title: '树脂溶胀预处理与去残留检验', action: '新购 D101/AB-8 树脂用 95% 乙醇浸泡 24 h 充分溶胀，装柱后用乙醇洗至“流出液加 5 倍水不浑浊”，再以纯化水洗至无醇味。', tip: '未洗净致孔剂会在浓缩后产生白色油状假沉淀。', biliKw: '大孔树脂 预处理' },
        { code: 'M2', title: '湿法装柱与无醇浓缩液上样', action: '控制径高比 1:6~1:10 湿法装柱无气泡；提取液先旋蒸脱醇并加水稀释澄清，以 1~2 BV/h 缓速上样。', tip: '上样液残留乙醇 >5% 会大幅削弱树脂吸附容量。', biliKw: '大孔吸附树脂 上样' },
        { code: 'M3', title: '水洗除糖与乙醇梯度精准洗脱', action: '先以 3~5 BV 纯化水冲除糖类与无机盐（至 Molish 阴性），再依次用 20%、50%、70% 乙醇分段洗脱收集目标段。', tip: '边洗脱边用 TLC 或 UV 追踪，精准截取高纯度流分。', biliKw: '大孔树脂 洗脱' },
        { code: 'M4', title: '洗脱液浓缩与树脂再生保存', action: '合并目标乙醇洗脱液经旋蒸浓缩干燥；树脂柱以 95% 乙醇洗至无色并水洗再生，浸于 20% 乙醇密封保存。', tip: '树脂再生后可循环使用 20+ 次，大幅降低实验室耗材成本。', biliKw: '大孔树脂 再生' }
      ]
    }
  };

  // 四大工艺阶段默认可操作小分支（按工艺方法与阶段自动映射，零 AI 消耗）
  const STAGE_SUBBRANCHES = {
    extract: {
      steam: [
        { name: '药材切段与浸泡', detail: '干药材切 1~2 cm 短段，加 10 倍纯化水浸润 30 min 软化细胞壁。', biliKw: '薄荷 挥发油' },
        { name: '挥发油测定器调零', detail: '装置自下而上固定，测定器注水调零并保持冷凝水下进上出。', biliKw: '挥发油测定器' },
        { name: '控温微沸共沸蒸馏', detail: '沸腾后调小火力维持 2~3 滴/秒共沸 3~4 h 至油量不再增加。', biliKw: '水蒸气蒸馏' }
      ],
      reflux: [
        { name: '粉碎过筛与料液配比', detail: '药材粉碎过 40 目筛，按料液比 1:8~1:10 加入乙醇与沸石。', biliKw: '中药粉碎 过筛' },
        { name: '水浴恒温回流浸提', detail: '球形冷凝管顶端敞口通冷水，水浴微沸回流 60 min×2 次。', biliKw: '加热回流 实验' },
        { name: '趁热抽滤与合并滤液', detail: '布氏漏斗趁热减压抽滤，合并两次提取液待浓缩纯化。', biliKw: '减压抽滤' }
      ],
      soxhlet: [
        { name: '滤纸筒装药限高', detail: '滤纸筒装药后顶压脱脂棉，高度低于虹吸管顶点 1 cm。', biliKw: '索氏提取 滤纸筒' },
        { name: '连续虹吸循环提取', detail: '水浴控温连续虹吸 6~10 次至提取筒内溶剂近无色。', biliKw: '索氏提取器' },
        { name: '溶剂减压回收', detail: '拆下提取筒，将烧瓶接旋转蒸发仪低温回收溶剂得粗提物。', biliKw: '旋转蒸发仪' }
      ],
      ultrasound: [
        { name: '冰水浴控温准备', detail: '超声槽注水至标线，热敏成分全程维持水温 ≤ 40℃。', biliKw: '超声波 提取' },
        { name: '网篮悬置高频空化', detail: '具塞锥形瓶放于网篮中，40 kHz / 300 W 超声 25~30 min。', biliKw: '超声辅助提取' },
        { name: '离心澄清与复提合并', detail: '4000 rpm 离心或抽滤收上清液，药渣复提 1 次提高收率。', biliKw: '实验室 离心机' }
      ],
      acid_water: [
        { name: '酸水配制与冷浸润湿', detail: '配制 0.5% 硫酸/盐酸水溶液，使生物碱充分成盐转入水相。', biliKw: '生物碱 酸水提取' },
        { name: '温浸/渗漉分次收集', detail: '控温浸提或渗漉收集酸水液，监测 pH 保持 2.0~3.0。', biliKw: '渗漉法 提取' },
        { name: '澄清过滤除渣', detail: '双层纱布初滤后经布氏漏斗减压抽滤得澄清酸水提取液。', biliKw: '减压抽滤' }
      ],
      boil_enzyme: [
        { name: '沸水投药瞬时杀酶', detail: '水先煮沸再投入药材，高温瞬时钝化水解酶防止苷类分解。', biliKw: '黄芩苷 提取' },
        { name: '微沸煎煮与热滤', detail: '保持微沸 30~45 min，趁热双层纱布/抽滤分离药渣。', biliKw: '热过滤 操作' },
        { name: '水提液浓缩定容', detail: '减压浓缩至生药量 1:1~1:2，准备后续酸沉或醇沉。', biliKw: '旋转蒸发仪' }
      ]
    },
    separate: {
      freeze: [
        { name: '无水硫酸钠脱水除水', detail: '向粗挥发油加无水 Na₂SO₄ 脱水 12 h，滤去干燥剂得澄清纯油。', biliKw: '无水硫酸钠 干燥' },
        { name: '梯度冷冻析晶', detail: '置 -18℃ ~ -20℃ 梯度冷冻 4~12 h，促使薄荷脑等结晶析出。', biliKw: '冷冻结晶' },
        { name: '预冷快速抽滤', detail: '用预冷布氏漏斗快速抽滤分离白色针状结晶，防室温融化。', biliKw: '减压抽滤' }
      ],
      acid_precip: [
        { name: '滤液降温与 pH 监控', detail: '提取液浓缩至适量，在搅拌下用精密 pH 试纸/pH 计实时监测。', biliKw: 'pH计 校准' },
        { name: '缓滴调酸析出沉淀', detail: '缓慢滴加 10% HCl 至目标等电点（如 pH 1.5~3.5），保温静置陈化。', biliKw: '碱溶酸沉法' },
        { name: '抽滤水洗至中性', detail: '减压抽滤收沉淀，用纯化水少量多次洗涤至滤液近中性。', biliKw: '沉淀 洗涤' }
      ],
      salting_out: [
        { name: '调碱/调酸定向转化', detail: '按 pKa 调节提取液酸碱度，将目标生物碱转为低溶解度盐型。', biliKw: '小檗碱 提取' },
        { name: '加 NaCl 盐析促沉', detail: '搅拌下分批加入 8%~10% 食盐，利用同离子效应大幅降低溶解度。', biliKw: '盐析法 实验' },
        { name: '静置过夜与抽滤收晶', detail: '低温静置析出黄色针状结晶，布氏漏斗抽滤并用冷盐水淋洗。', biliKw: '减压抽滤' }
      ],
      resin: [
        { name: '脱醇上样动态吸附', detail: '浓缩液除尽乙醇后以 1~2 BV/h 缓速上 D101/AB-8 大孔树脂柱。', biliKw: '大孔树脂 上样' },
        { name: '纯化水洗脱除糖杂', detail: '以 4 BV 纯化水洗脱糖类、蛋白与无机盐至流出液近无色。', biliKw: '大孔吸附树脂' },
        { name: '乙醇梯度洗脱富集', detail: '改用 30%→70% 乙醇梯度洗脱，TLC 追踪收集目标高纯流分。', biliKw: '大孔树脂 洗脱' }
      ],
      extract: [
        { name: '倒置振摇并及时放气', detail: '水相与有机溶剂置于分液漏斗，每摇 2~3 次倒置开塞放气。', biliKw: '分液漏斗 放气' },
        { name: '三次少量萃取与破乳', detail: '按 3 次少量原则萃取；若乳化可加饱和 NaCl 盐析或轻搅破乳。', biliKw: '萃取 乳化' },
        { name: '合并有机相脱水浓缩', detail: '下层下口放、上层上口倒，加无水 Na₂SO₄ 脱水后旋蒸浓缩。', biliKw: '旋转蒸发仪' }
      ],
      column: [
        { name: '湿法装柱赶气泡', detail: '200~300 目硅胶调浆湿法装柱，轻敲紧实铺石英砂保护柱头。', biliKw: '硅胶柱 装柱' },
        { name: '干/湿法窄带上样', detail: '样品拌硅胶蒸干铺平或少量溶剂沿壁缓加，保证起始色带平齐。', biliKw: '柱层析 上样' },
        { name: '梯度洗脱与 TLC 合并', detail: '极性由小到大洗脱，每 15 mL 接管并点板 TLC 合并纯单体流分。', biliKw: '梯度洗脱' }
      ],
      precip: [
        { name: '水提液浓缩至 1:1', detail: '将水提液旋蒸浓缩至生药量 1:1~1:2，冷却至室温备用。', biliKw: '水提醇沉法' },
        { name: '缓加乙醇醇沉析出', detail: '剧烈搅拌下缓慢加入 95% 乙醇使含醇量达 75%~80%，4℃ 静置过夜。', biliKw: '多糖 醇沉' },
        { name: '离心洗涤与 Sevag 除蛋白', detail: '离心收多糖沉淀，无水乙醇/丙酮依次洗涤，必要时 Sevag 法除蛋白。', biliKw: 'Sevag法 除蛋白' }
      ]
    },
    purify: [
      { name: '重结晶热溶与热过滤', detail: '粗品加最小量热溶剂溶解，必要时加 1% 活性炭脱色后趁热过滤。', biliKw: '重结晶 操作' },
      { name: '缓冷析晶与冰水浴收尾', detail: '滤液自然静置缓冷长出规则晶型，再冰水浴冷却 15 min 提高得率。', biliKw: '重结晶 析晶' },
      { name: '减压抽滤与低温干燥', detail: '布氏漏斗抽滤，少量冷溶剂淋洗晶体，置 50℃ 真空干燥箱恒重。', biliKw: '真空干燥箱' }
    ],
    detect: [
      { name: '试管特征显色反应', detail: '取微量精制品溶解，按类别执行特征显色/沉淀反应并设空白对照。', biliKw: '中药化学 显色反应' },
      { name: 'TLC 毛细管点样与缸饱和', detail: '硅胶 G 板距底 1.5 cm 点样（斑点直径 ≤ 2 mm），展开缸贴滤纸饱和 20 min。', biliKw: '薄层色谱 点样' },
      { name: '展开检视与 Rf 精准测算', detail: '展开至距顶 1 cm 取出吹干，UV 254/365 nm 或显色剂检视，核对 |ΔRf| ≤ 0.03。', biliKw: '薄层色谱 Rf计算' }
    ]
  };

  // 新增 12 项高校、药企 QC 及中西医结合经典/前沿实验预设
  const EXTRA_PRESETS = {
    willow_aspirin: {
      id: 'willow_aspirin', isInnovative: true, featured: true, sourceTag: '中西医结合 · 药化经典',
      herb: '柳树皮（阿司匹林溯源）', compound: '水杨苷 / 乙酰水杨酸', latin: 'Salix babylonica L. / Acetylsalicylic acid',
      category: '苯丙素与有机酸', defaultRig: 'reflux', applicableRigs: ['reflux', 'filter', 'rotavap'],
      defaultExtract: 'reflux', defaultSep: 'acid_precip', formulas: ['henderson', 'diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 8, temp: 75, time: 45, mesh: '粗粉(10~20目)', cycles: '2', solventType: '70%乙醇', ph: 'pH 2.5~3.0' },
      limitVal: 1.5, limitUnit: '%', crudeUnit: 'g', mpRef: '乙酰水杨酸 135~136℃ / 水杨酸 158℃',
      origin: '柳树皮为经典解热镇痛天然本草来源（含水杨苷，体内代谢为水杨酸），也是现代西药阿司匹林（乙酰水杨酸）的化学结构溯源原型。',
      chemistry: '水杨苷为酚苷类，水解氧化得水杨酸（邻羟基苯甲酸）；水杨酸与乙酸酐在磷酸/绿色固体酸催化下乙酰化得乙酰水杨酸，显著降低胃黏膜刺激性。',
      pharmacopoeia: '参考《中国药典》阿司匹林项下：游离水杨酸限度检查（FeCl₃ 显色不得深于对照液），熔点 135~140℃，平行 3 批收率 RSD < 5%。',
      integrative: '中西医结合典范实验（参考北京大学《大学化学》2021 教学研究与四川大学 2025《Nature》水杨酸生源成果）：将天然柳树皮水杨苷提取与水杨酸绿色乙酰化合成、碳酸氢钠纯化及 FeCl₃ 杂质限度检查贯通。',
      scaling: { auxName: '饱和NaHCO₃/乙酸酐', auxFactor: 0.4, auxUnit: 'mL', yieldLow: 0.014, yieldHigh: 0.025, yieldUnit: 'g' },
      tlcSystem: '硅胶 GF254 板，乙酸乙酯-冰醋酸-环己烷 (5:1:10)，UV 254 nm 暗斑，区分乙酰水杨酸(Rf≈0.55)与游离水杨酸(Rf≈0.68)。',
      tlcDefault: { front: 8.0, sample: 4.4, ref: 4.5 },
      steps: [
        { stage: '提取', title: '柳树皮乙醇回流提取水杨苷 / 水杨酸前体准备', principle: '利用 70% 乙醇热回流高效溶出酚苷，或取标准水杨酸作为乙酰化底物。', operation: '称取柳树皮粗粉 50 g，加 400 mL 70% 乙醇水浴 75℃ 回流 45 min×2 次，趁热抽滤并旋蒸回收乙醇。', qc: '水浴控温 ≤ 80℃，防乙醇暴沸。' },
        { stage: '分离', title: '水杨酸乙酰化反应与饱和 NaHCO₃ 除聚体', principle: '乙酸酐在微酸催化下将酚羟基酯化；产物溶入 NaHCO₃ 成钠盐，不溶性副产聚合物过滤除去。', operation: '70℃ 水浴乙酰化 20 min 后冰水析晶，粗品溶于饱和 NaHCO₃ 至无气泡产生，减压抽滤去不溶副产物。', qc: '反应温度严控 70~75℃，超 85℃ 副产水杨酸聚酯剧增。' },
        { stage: '纯化', title: '酸化重析晶与乙醇-水重结晶', principle: '向钠盐滤液缓慢加稀盐酸至 pH 2.5，重新游离析出针状乙酰水杨酸，经乙醇-水重结晶提纯。', operation: '冰水浴下滴加稀 HCl 调 pH 至 2.5，布氏漏斗抽滤、冰水洗净，40% 乙醇热溶缓冷得白色针状结晶。', qc: '重结晶温度不超 65℃，防乙酰基水解。' },
        { stage: '检识', title: 'FeCl₃ 游离水杨酸限度检查与 TLC / 熔点确证', principle: '纯乙酰水杨酸无游离酚羟基，遇 FeCl₃ 不显紫堇色；若水解产生游离水杨酸则显紫色。', operation: '取 0.1 g 精制品溶乙醇，滴加 1% FeCl₃ 观察显色；同步点板 TLC 与对照品共色谱并测熔点。', qc: 'FeCl₃ 显色阴性，|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [
        { issue: '产品遇 FeCl₃ 显深紫色', cause: '反应不完全或重结晶加热过度导致酯键水解产生游离水杨酸。', fix: '降低重结晶温度至 60℃ 以下并改用乙醇-冷水快速析晶。' },
        { issue: '熔点偏低且熔程宽', cause: '残留乙酸或水分未彻底烘干。', fix: '冰水充分淋洗滤饼，置 50℃ 干燥箱烘干至恒重。' }
      ],
      sop: ['配制 70% 乙醇并称取柳树皮/水杨酸底物', '搭好水浴回流装置，控温 70~75℃', '冷却析晶并用饱和 NaHCO₃ 溶液除聚合物', '冰浴滴酸至 pH 2.5 抽滤收晶', '50℃ 干燥测熔点并执行 FeCl₃ 限度与 TLC 检识'],
      chemTests: [{ name: 'FeCl₃ 游离酚羟基限度（阴性合格）', passed: true }, { name: '熔点 135~136℃ 达标', passed: true }, { name: 'TLC 对照品共色谱', passed: true }],
      demoBatches: [{ mass: 50, crude: 1.05, refined: 0.82, mp: 135.4 }, { mass: 50, crude: 1.12, refined: 0.86, mp: 135.8 }, { mass: 50, crude: 1.08, refined: 0.84, mp: 135.5 }]
    },
    salvia_dual: {
      id: 'salvia_dual', isInnovative: true, featured: true, sourceTag: '药企中试 · 脂水双提',
      herb: '丹参（脂水双提）', compound: '丹参酮ⅡA + 丹酚酸B', latin: 'Salvia miltiorrhiza Bge.',
      category: '蒽醌与醌类', defaultRig: 'resin', applicableRigs: ['reflux', 'rotavap', 'resin', 'column'],
      defaultExtract: 'reflux', defaultSep: 'resin', formulas: ['adsorption', 'diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 8, temp: 70, time: 60, mesh: '粗粉(10~20目)', cycles: '2', solventType: '95%乙醇', ph: 'pH 3.0(水提段)' },
      limitVal: 3.2, limitUnit: '%', crudeUnit: 'g', mpRef: '丹参酮ⅡA 209~210℃',
      origin: '唇形科植物丹参的干燥根和根茎；现代中药企业（如复方丹参滴丸中试）核心痛点是如何同步高效回收脂溶性丹参酮与水溶性丹酚酸。',
      chemistry: '丹参酮ⅡA 属脂溶性邻菲醌（易溶于 95% 乙醇，对光敏感）；丹酚酸 B 属强水溶性酚酸（易溶于微酸性热水，高温强碱易降解）。',
      pharmacopoeia: '《中国药典》规定丹参酮类（以丹参酮ⅡA等计）≥ 0.25%，丹酚酸 B ≥ 3.0%。',
      integrative: '对接制药企业连续提取与 D101 大孔树脂分级纯化工艺（参考 PMC5981213 与 PMC6426754）：先 95% 乙醇回流提脂溶性丹参酮，药渣再 pH 3.0 温水提丹酚酸 B，一材双得零浪费。',
      scaling: { auxName: 'D101大孔吸附树脂', auxFactor: 1.2, auxUnit: 'mL', yieldLow: 0.031, yieldHigh: 0.048, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板，甲苯-乙酸乙酯 (19:1) 检丹参酮ⅡA（暗红色斑点 Rf≈0.48）；甲苯-三氯甲烷-乙酸乙酯-甲醇-甲酸 (2:3:4:0.5:2) 检丹酚酸 B。',
      tlcDefault: { front: 8.0, sample: 3.8, ref: 3.9 },
      steps: [
        { stage: '提取', title: '阶梯双提：先 95% 乙醇回流，药渣再微酸水提', principle: '利用溶解度截然相反的理化特征，实现脂溶性菲醌与水溶性酚酸顺序零干扰提取。', operation: '50 g 丹参粗粉用 95% 乙醇 400 mL 避光 70℃ 回流 60 min 得醇提液；药渣晾干后用 pH 3.0 温水 65℃ 浸提 45 min 得水提液。', qc: '醇提全程避光防丹参酮光解。' },
        { stage: '分离', title: '旋转蒸发脱醇与 D101 大孔树脂分级吸附', principle: 'D101 非极性树脂选择性吸附丹参酮与酚酸，通过水→45%→90% 乙醇梯度分段洗脱。', operation: '醇提液 45℃ 旋蒸浓缩上 D101 树脂柱，依次用纯化水、45% 乙醇除杂，90% 乙醇洗脱收集深红色总丹参酮流分。', qc: '上样流速控制在 1.5 BV/h。' },
        { stage: '纯化', title: '低温浓缩析晶与丹酚酸段浓缩干燥', principle: '90% 乙醇洗脱液低温旋蒸至小体积，置 4℃ 静置析出紫红色丹参酮针晶。', operation: '45℃ 减压浓缩回收乙醇，4℃ 静置 6 h，布氏漏斗抽滤收晶；水提段调酸后经树脂/减压干燥得丹酚酸粗品。', qc: '浓缩温度严控 ≤ 50℃ 防丹酚酸水解。' },
        { stage: '检识', title: '双系统 TLC 对照与 UV 特征吸收确证', principle: '丹参酮ⅡA 在 270 nm、丹酚酸 B 在 286 nm 具强特征紫外吸收。', operation: '分别配制脂溶与水溶供试品，与标准品同板 TLC 展开并测 UV 吸收峰位。', qc: '两类成分均检出清晰单斑，|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [
        { issue: '丹参酮溶液褪色变暗', cause: '光照引发邻菲醌光氧化分解。', fix: '提取瓶与接液瓶全程包裹锡箔纸避光操作。' },
        { issue: '丹酚酸 B 收率骤降', cause: '水提温度超过 80℃ 或 pH 偏碱导致酯键断裂。', fix: '水提液用柠檬酸调至 pH 3.0~3.5 且控温 65℃。' }
      ],
      sop: ['丹参粉碎过 20 目并锡箔纸避光包裹烧瓶', '95% 乙醇 70℃ 回流 60 min 提取丹参酮段', '药渣 pH 3.0 温水 65℃ 提取丹酚酸段', '旋蒸脱醇并上 D101 大孔树脂梯度洗脱', '低温析晶干燥并完成双指标 TLC 检识'],
      chemTests: [{ name: '丹参酮紫红色晶型外观', passed: true }, { name: '丹酚酸 FeCl₃ 墨绿色显色', passed: true }, { name: '双指标 TLC 同板一致', passed: true }],
      demoBatches: [{ mass: 50, crude: 1.72, refined: 0.24, mp: 209.2 }, { mass: 50, crude: 1.81, refined: 0.26, mp: 209.8 }, { mass: 50, crude: 1.76, refined: 0.25, mp: 209.5 }]
    },
    ginkgo_industrial: {
      id: 'ginkgo_industrial', isInnovative: true, featured: true, sourceTag: '药企 QC · EGb761 标准',
      herb: '银杏叶（EGb761工业纯化）', compound: '银杏总黄酮苷 + 萜类内酯', latin: 'Ginkgo biloba L.',
      category: '黄酮', defaultRig: 'resin', applicableRigs: ['reflux', 'rotavap', 'resin', 'extract'],
      defaultExtract: 'reflux', defaultSep: 'resin', formulas: ['adsorption', 'nernst', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 70, time: 60, mesh: '粗粉(10~20目)', cycles: '2', solventType: '70%乙醇', ph: 'pH 5.0' },
      limitVal: 2.4, limitUnit: '%', crudeUnit: 'g', mpRef: '槲皮素苷元 314℃',
      origin: '银杏科植物银杏的干燥叶；国际通行银杏叶提取物 EGb761 质量标准（总黄酮苷 ≥24%、萜类内酯 ≥6%、毒性银杏酸 ≤5 ppm）。',
      chemistry: '含黄酮醇苷（槲皮素、山奈酚、异鼠李素苷）及二萜内酯（银杏内酯 A/B/C、白果内酯），伴生致敏杂质烷基酚酸（银杏酸）。',
      pharmacopoeia: '《中国药典》银杏叶提取物项下：总黄酮醇苷 ≥ 24.0%、萜类内酯 ≥ 6.0%、总银杏酸 ≤ 5 mg/kg。',
      integrative: '典型药企 QC 与工业级纯化模拟实验：采用 70% 乙醇提取→旋蒸脱醇→石油醚萃取脱除毒性银杏酸→AB-8 大孔树脂 70% 乙醇段富集双活性群。',
      scaling: { auxName: 'AB-8大孔树脂', auxFactor: 1.5, auxUnit: 'mL', yieldLow: 0.022, yieldHigh: 0.036, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板，乙酸乙酯-丁酮-甲酸-水 (5:3:1:1)，喷 3% AlCl₃ 乙醇液，UV 365 nm 下呈亮黄色荧光斑点。',
      tlcDefault: { front: 8.0, sample: 4.3, ref: 4.4 },
      steps: [
        { stage: '提取', title: '70% 乙醇热回流同步浸提黄酮与内酯', principle: '70% 乙醇兼顾黄酮苷极性与萜类内酯溶解度，同时减少水溶性叶绿素与多糖溶出。', operation: '50 g 银杏叶粗粉加 500 mL 70% 乙醇，70℃ 水浴回流 60 min×2 次，抽滤合并滤液。', qc: '回流温度 70±2℃。' },
        { stage: '分离', title: '旋蒸脱醇与石油醚脱脂除银杏酸', principle: '毒性银杏酸具长烷基链亲脂性强，旋蒸无醇后用石油醚萃取可选择性脱除。', operation: '45℃ 旋蒸至无醇味，加水分散后用石油醚分液萃取 2 次（弃去石油醚层），水相调 pH 5.0。', qc: '萃取充分静置防乳化。' },
        { stage: '纯化', title: 'AB-8 大孔树脂水洗除糖、70% 乙醇洗脱', principle: 'AB-8 弱极性树脂对银杏黄酮苷与内酯具高吸附容量，70% 乙醇一步洗脱富集。', operation: '水相以 1.5 BV/h 上 AB-8 柱，4 BV 纯化水除杂后，用 4 BV 70% 乙醇洗脱收集，旋蒸干燥得淡黄色浸膏。', qc: '洗脱液浓缩温度 ≤ 55℃。' },
        { stage: '检识', title: 'AlCl₃ 络合显色与 TLC 荧光指纹检识', principle: '黄酮 3-OH/5-OH 与 Al³⁺ 形成稳定螯合物，在 UV 365 nm 呈现特征黄绿色强荧光。', operation: '供试品与芦丁/槲皮素对照品同板展开，喷 3% AlCl₃ 显色并于 365 nm 拍照核对 Rf。', qc: '特征斑点清晰无拖尾，|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [
        { issue: '树脂柱床变深绿堵塞', cause: '脱脂除叶绿素不彻底导致脂溶性色素死吸附。', fix: '上柱前先用石油醚充分萃取脱脂并离心澄清。' }
      ],
      sop: ['70% 乙醇 70℃ 回流提取银杏叶 2 次', '45℃ 旋蒸脱醇至无醇味', '石油醚液-液萃取 2 次脱除叶绿素与银杏酸', 'AB-8 大孔树脂水洗除糖、70% 乙醇洗脱富集', 'AlCl₃ 显色与 UV 365 nm TLC 荧光检识'],
      chemTests: [{ name: '盐酸-镁粉樱红色反应', passed: true }, { name: 'AlCl₃ 荧光增强反应', passed: true }, { name: 'TLC 荧光斑点一致', passed: true }],
      demoBatches: [{ mass: 50, crude: 1.38, refined: 0.94, mp: 0 }, { mass: 50, crude: 1.44, refined: 0.98, mp: 0 }, { mass: 50, crude: 1.41, refined: 0.96, mp: 0 }]
    },
    eucommia_chlorogenic: {
      id: 'eucommia_chlorogenic', isInnovative: true, featured: true, sourceTag: '高校绿色提取',
      herb: '杜仲叶', compound: '绿原酸', latin: 'Eucommia ulmoides Oliv.',
      category: '苯丙素与有机酸', defaultRig: 'ultrasound', applicableRigs: ['ultrasound', 'resin', 'rotavap'],
      defaultExtract: 'ultrasound', defaultSep: 'resin', formulas: ['diffusion', 'henderson', 'qc'],
      defaultCfg: { mass: 50, ratio: 12, temp: 40, time: 30, mesh: '中粉(40目)', cycles: '2', solventType: '50%乙醇', ph: 'pH 3.5' },
      limitVal: 0.8, limitUnit: '%', crudeUnit: 'g', mpRef: '绿原酸 205~209℃',
      origin: '杜仲科植物杜仲的干燥叶，为我国特色药食同源与高含量绿原酸替代资源（参考中国生物医学文献 2025 绿原酸综述）。',
      chemistry: '绿原酸为咖啡酸与奎宁酸缩合的缩酚酸（含邻二酚羟基与酯键），易溶于热水/稀乙醇，高温与碱性条件极易异构化或氧化变褐。',
      pharmacopoeia: '《中国药典》规定杜仲叶含绿原酸不得少于 0.08%（优质原料常达 0.8%~2.5%）。',
      integrative: '绿色低碳教学实验：全程 40℃ 低温超声 + 微酸性 pH 3.5 保护防氧化，配合 NKA-9/AB-8 树脂无氯仿纯化，避免传统乙酸乙酯高耗溶剂痛点。',
      scaling: { auxName: '柠檬酸/AB-8树脂', auxFactor: 0.8, auxUnit: 'mL', yieldLow: 0.008, yieldHigh: 0.018, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板，乙酸丁酯-甲酸-水 (7:2.5:2.5) 上层液，UV 365 nm 呈现特征亮蓝色荧光斑点（Rf≈0.42）。',
      tlcDefault: { front: 8.0, sample: 3.4, ref: 3.4 },
      steps: [
        { stage: '提取', title: '40℃ 低温微酸超声空化提取', principle: '超声波空化瞬时破壁，低温酸性条件抑制绿原酸酚羟基氧化与酯键水解。', operation: '50 g 杜仲叶中粉加 600 mL 50% 乙醇（调 pH 3.5），40 kHz/300 W 40℃ 超声 30 min×2 次。', qc: '严控槽温 ≤ 42℃。' },
        { stage: '分离', title: '减压浓缩脱醇与 pH 3.5 上树脂柱', principle: '酸性条件下绿原酸呈分子态，与大孔树脂疏水/氢键吸附力显著增强。', operation: '抽滤合并滤液，45℃ 旋蒸脱醇，调 pH 3.5 后上 AB-8 树脂柱动态吸附。', qc: '上样液澄清无悬浮颗粒。' },
        { stage: '纯化', title: '水洗除杂与 40% 乙醇梯度洗脱', principle: '纯化水洗去多糖色素，40% 乙醇精准洗脱高纯度绿原酸部位。', operation: '3 BV 纯化水洗杂后，用 40% 乙醇洗脱收集，低温旋蒸浓缩冻干/真空干燥。', qc: '避光低温干燥防褐变。' },
        { stage: '检识', title: 'FeCl₃ 酚酸显色与 UV 365 nm 蓝荧光 TLC', principle: '绿原酸具共轭咖啡酰基，在 UV 365 nm 下呈极易辨识的亮蓝色荧光。', operation: '取样品与绿原酸对照品同板 TLC，365 nm 检视并测 UV 327 nm 吸收。', qc: '亮蓝荧光单斑 |ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [
        { issue: '提取液发黑褐变', cause: 'pH 偏碱或温度过高引起邻二酚羟基氧化聚合。', fix: '立即补加微量维生素 C 或柠檬酸将 pH 维持在 3.5。' }
      ],
      sop: ['配制 pH 3.5 的 50% 乙醇提取液', '40℃ 冰浴辅助超声提取 30 min×2 次', '抽滤并 45℃ 旋蒸脱醇', 'AB-8 树脂水洗除杂、40% 乙醇洗脱富集', 'UV 365 nm 荧光 TLC 与 FeCl₃ 检识'],
      chemTests: [{ name: 'FeCl₃ 蓝绿色显色', passed: true }, { name: 'UV 365nm 亮蓝荧光', passed: true }, { name: 'TLC 同板单斑一致', passed: true }],
      demoBatches: [{ mass: 50, crude: 0.62, refined: 0.41, mp: 206.5 }, { mass: 50, crude: 0.66, refined: 0.44, mp: 207.1 }, { mass: 50, crude: 0.64, refined: 0.42, mp: 206.8 }]
    },
    ephedra_alkaloid: {
      id: 'ephedra_alkaloid', isInnovative: true, featured: true, sourceTag: '中西医结合 · 生物碱经典',
      herb: '麻黄（教学模拟/标准品）', compound: '麻黄碱 / 伪麻黄碱', latin: 'Ephedra sinica Stapf',
      category: '生物碱', defaultRig: 'extract', applicableRigs: ['steam', 'extract', 'filter'],
      defaultExtract: 'acid_water', defaultSep: 'extract', formulas: ['henderson', 'nernst', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 80, time: 60, mesh: '切段(1~2cm)', cycles: '2', solventType: '0.5%酸水', ph: '碱化 pH 10.5' },
      limitVal: 0.8, limitUnit: '%', crudeUnit: 'g', mpRef: '盐酸麻黄碱 217~220℃',
      origin: '麻黄科草麻黄干燥草质茎；有机胺类生物碱代表，也是西药拟肾上腺素类平喘药的核心先导化合物（注意：麻黄碱属管控品，高校实验须严格遵守双人双锁合规管理或采用模拟演练）。',
      chemistry: '麻黄碱与伪麻黄碱为一对非对映异构体，具挥发性、既溶于水又溶于氯仿；草酸麻黄碱难溶于水，而草酸伪麻黄碱易溶于水，借此实现精准分离。',
      pharmacopoeia: '《中国药典》规定麻黄含盐酸麻黄碱与盐酸伪麻黄碱总量不得少于 0.80%。',
      integrative: '经典构效与立体化学分离教学案例：解析草酸盐溶解度差异分离非对映异构体，并对比中药“发汗解表”与西药 α/β 受体激动药理。',
      scaling: { auxName: '草酸/NaOH调碱剂', auxFactor: 0.2, auxUnit: 'g', yieldLow: 0.008, yieldHigh: 0.015, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板，三氯甲烷-甲醇-浓氨试液 (20:5:0.5)，喷茚三酮试液 105℃ 加热显紫红色斑点。',
      tlcDefault: { front: 8.0, sample: 4.5, ref: 4.6 },
      steps: [
        { stage: '提取', title: '稀酸水提取或碱化水蒸气蒸馏', principle: '麻黄碱为有机胺类生物碱，碱性较强，酸水成盐溶出或碱化后可随水蒸气馏出。', operation: '50 g 麻黄段以 0.5% 酸水 80℃ 温浸 60 min×2 次，过滤合并浓缩。', qc: '严格执行实验室管控台账登记。' },
        { stage: '分离', title: '强碱游离与分液漏斗液-液萃取', principle: '调 pH > 10.5 使麻黄碱游离，加 NaCl 盐析降低水溶性后以有机相萃取富集。', operation: '浓缩液加 NaOH 调 pH 10.5 并加 NaCl 饱和，分液漏斗萃取 3 次，合并有机层。', qc: '振摇及时放气，防碱液接触皮肤。' },
        { stage: '纯化', title: '草酸盐溶解度差分离异构体', principle: '草酸麻黄碱在水中溶解度小先析出结晶，草酸伪麻黄碱留在母液中。', operation: '有机相浓缩后加草酸水溶液中和，冷却析出草酸麻黄碱结晶，抽滤分离。', qc: '控制 pH 中性，防过酸重溶。' },
        { stage: '检识', title: '铜络盐反应（CuSO₄-NaOH）与茚三酮 TLC', principle: '麻黄碱邻氨基醇结构与 Cu²⁺ 形成紫蓝色络合物，加乙醚振摇乙醚层显紫红色、水层显蓝色。', operation: '执行铜络盐特征显色与茚三酮显色 TLC 对照。', qc: '乙醚层紫红、水层蓝色双相特征明确。' }
      ],
      troubleshoot: [
        { issue: '常规生物碱沉淀试剂（碘化铋钾）不沉淀', cause: '麻黄碱分子量小且为脂肪胺类，属经典教材“不与多数生物碱沉淀试剂反应”的特例！', fix: '改用铜络盐反应与二硫化碳-硫酸铜反应进行特征检识。' }
      ],
      sop: ['完成实验室合规备案与酸水提取', '浓缩液加 NaOH 调 pH 10.5 并盐析', '分液漏斗 3 次萃取合并有机相', '草酸盐法分离麻黄碱与伪麻黄碱', '执行铜络盐双相显色与茚三酮 TLC 检识'],
      chemTests: [{ name: '铜络盐反应（醚层紫红/水层蓝）', passed: true }, { name: '二硫化碳-硫酸铜棕色反应', passed: true }, { name: '茚三酮 TLC 紫红斑点', passed: true }],
      demoBatches: [{ mass: 50, crude: 0.46, refined: 0.34, mp: 218.2 }, { mass: 50, crude: 0.49, refined: 0.36, mp: 218.6 }, { mass: 50, crude: 0.47, refined: 0.35, mp: 218.4 }]
    },
    angelica_ferulic: {
      id: 'angelica_ferulic', isInnovative: true, featured: true, sourceTag: '高校/药企质控',
      herb: '当归（阿魏酸项）', compound: '阿魏酸', latin: 'Angelica sinensis (Oliv.) Diels',
      category: '苯丙素与有机酸', defaultRig: 'ultrasound', applicableRigs: ['ultrasound', 'extract', 'rotavap'],
      defaultExtract: 'ultrasound', defaultSep: 'extract', formulas: ['henderson', 'nernst', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 45, time: 30, mesh: '中粉(40目)', cycles: '2', solventType: '70%乙醇', ph: 'pH 2.5(萃取)' },
      limitVal: 0.05, limitUnit: '%', crudeUnit: 'g', mpRef: '阿魏酸 173~174℃',
      origin: '伞形科植物当归干燥根；阿魏酸既为《中国药典》当归核心质控指标，也广泛应用于现代抗血小板与天然低共熔溶剂（DES）经皮递药。',
      chemistry: '属羟基肉桂酸类有机酸（含羧基与酚羟基），可溶于热水、乙醇与乙酸乙酯，见光易发生顺反异构化。',
      pharmacopoeia: '《中国药典》规定当归含阿魏酸不得少于 0.050%。',
      integrative: '衔接中山大学药学院阿魏酸-黄芩苷低共熔溶剂经皮研究，展示传统“补血活血”成分在现代透皮微针制剂中的转化价值。',
      scaling: { auxName: '乙酸乙酯萃取剂', auxFactor: 2.0, auxUnit: 'mL', yieldLow: 0.0005, yieldHigh: 0.0012, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板，甲苯-乙酸乙酯-甲酸 (10:8:1)，UV 365 nm 下呈亮蓝色荧光斑点（Rf≈0.58）。',
      tlcDefault: { front: 8.0, sample: 4.6, ref: 4.6 },
      steps: [
        { stage: '提取', title: '避光低温超声提取阿魏酸', principle: '70% 乙醇避光超声快速溶出阿魏酸，减少光致顺反异构。', operation: '50 g 当归中粉加 500 mL 70% 乙醇，棕色瓶/避光 45℃ 超声 30 min×2 次。', qc: '全程避光操作。' },
        { stage: '分离', title: '旋蒸脱醇与酸性乙酸乙酯萃取', principle: '调 pH 2.5 使阿魏酸羧基抑制电离呈分子态，高效分配进入乙酸乙酯相。', operation: '45℃ 旋蒸至无醇味，调 pH 2.5 后用乙酸乙酯分液萃取 3 次（每次 100 mL）。', qc: '分液充分放气。' },
        { stage: '纯化', title: '碱反萃除脂溶杂质与酸化析晶', principle: '5% NaHCO₃ 反萃阿魏酸至水相甩掉藁本内酯等中性油，再酸化析晶。', operation: '乙酸乙酯相用 5% NaHCO₃ 反萃，水相酸化至 pH 2.5 再萃回浓缩得精制品。', qc: 'NaHCO₃ 中和产气务必缓慢操作。' },
        { stage: '检识', title: 'UV 365 nm 亮蓝荧光 TLC 与 316 nm UV 定量', principle: '阿魏酸肉桂酰共轭结构在 UV 365 nm 显强蓝荧光、316 nm 具最大紫外吸收。', operation: '点板同板展开并于 365 nm 检视比对 Rf。', qc: '|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [
        { issue: 'TLC 出现双斑点', cause: '强光照导致反式阿魏酸部分转化为顺式异构体。', fix: '样品瓶包锡箔纸并在暗处展开。' }
      ],
      sop: ['当归过 40 目避光 70% 乙醇超声提取', '45℃ 旋蒸脱醇并调 pH 2.5', '乙酸乙酯 3 次液-液萃取富集', '5% NaHCO₃ 反萃脱除中性挥发油杂质', 'UV 365 nm 荧光 TLC 检识'],
      chemTests: [{ name: 'FeCl₃ 酚酸显色阳性', passed: true }, { name: 'UV 365nm 亮蓝荧光斑点', passed: true }, { name: 'TLC 对照品共色谱', passed: true }],
      demoBatches: [{ mass: 50, crude: 0.042, refined: 0.029, mp: 173.2 }, { mass: 50, crude: 0.045, refined: 0.031, mp: 173.6 }, { mass: 50, crude: 0.043, refined: 0.030, mp: 173.4 }]
    },
    stephania_atpe: {
      id: 'stephania_atpe', isInnovative: true, featured: true, sourceTag: '前沿绿色萃取 · 双水相',
      herb: '千金藤', compound: '千金藤素（双水相+树脂）', latin: 'Stephania epigaea Lo',
      category: '生物碱', defaultRig: 'ultrasound', applicableRigs: ['ultrasound', 'extract', 'resin'],
      defaultExtract: 'ultrasound', defaultSep: 'resin', formulas: ['nernst', 'adsorption', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 45, time: 30, mesh: '中粉(40目)', cycles: '2', solventType: '70%乙醇', ph: 'pH 6.5' },
      limitVal: 1.8, limitUnit: '%', crudeUnit: 'g', mpRef: '千金藤素 145~155℃',
      origin: '防己科千金藤属块根，含双苄基异喹啉类生物碱千金藤素（抗炎、升白细胞及广谱抗病毒研究热点，参考 PMC9797411）。',
      chemistry: '双苄基异喹啉生物碱，易溶于乙醇、丙酮与稀酸水，可采用“乙醇-硫酸铵双水相（ATPE）”或 D101 大孔树脂实现零氯仿绿色纯化。',
      pharmacopoeia: '参考药企质控与文献标准：总生物碱得率约 2.9%~3.4%，平行 3 批 RSD < 5%。',
      integrative: '绿色化学前沿替代教学实验：用“乙醇-硫酸铵双水相体系（ATPE）”替代传统有毒氯仿萃取，耗水量降低 70% 以上，且衔接 D101 树脂柱高纯富集。',
      scaling: { auxName: '硫酸铵/D101树脂', auxFactor: 0.6, auxUnit: 'g', yieldLow: 0.018, yieldHigh: 0.032, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板，乙酸乙酯-甲醇-浓氨水 (15:2:0.3)，喷改良碘化铋钾显橘红色斑点（Rf≈0.54）。',
      tlcDefault: { front: 8.0, sample: 4.3, ref: 4.4 },
      steps: [
        { stage: '提取', title: '超声波辅助乙醇高效破壁提取', principle: '40 kHz 空化效应缩短提取时间至 30 min，避免长时间煎煮致生物碱氧化。', operation: '50 g 药材中粉加 500 mL 70% 乙醇，45℃ 超声提取 30 min×2 次并抽滤。', qc: '控温 45℃。' },
        { stage: '分离', title: '乙醇-硫酸铵双水相（ATPE）绿色分相', principle: '盐析效应促使乙醇-水体系自动分层，千金藤素定向富集于上层富醇相，糖类与色素留于下层盐相。', operation: '向提取液中加入定量硫酸铵（22% w/w）振摇静置分相，分液漏斗收集上层富醇相。', qc: '严控盐浓度确保清晰分相界面。' },
        { stage: '纯化', title: 'D101 大孔树脂柱精制', principle: 'D101 树脂微孔吸附双苄基异喹啉母核，70% 乙醇洗脱得高纯度流分。', operation: '上层液旋蒸脱醇后上 D101 柱，纯化水洗杂、70% 乙醇洗脱浓缩干燥。', qc: '流速 1.5 BV/h。' },
        { stage: '检识', title: '碘化铋钾显色与 TLC 对照', principle: '异喹啉叔胺氮与碘化铋钾生成特征橘红色沉淀。', operation: '试管沉淀显色并同板 TLC 展开检识。', qc: '|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [
        { issue: '双水相未能分层', cause: '乙醇浓度或硫酸铵质量分数低于双节线阈值。', fix: '补加少量无水乙醇或固体硫酸铵至静置 5 min 出现清晰两相。' }
      ],
      sop: ['70% 乙醇 45℃ 超声提取千金藤 30 min×2 次', '加入硫酸铵构建双水相体系分液收上层', '旋蒸脱醇并上 D101 大孔树脂纯化', '70% 乙醇洗脱浓缩干燥称重', '碘化铋钾显色与 TLC 检识'],
      chemTests: [{ name: '改良碘化铋钾橘红沉淀', passed: true }, { name: '双水相清晰分相确认', passed: true }, { name: 'TLC 对照品一致', passed: true }],
      demoBatches: [{ mass: 50, crude: 1.42, refined: 0.96, mp: 148.5 }, { mass: 50, crude: 1.48, refined: 1.01, mp: 149.2 }, { mass: 50, crude: 1.45, refined: 0.98, mp: 148.8 }]
    },
    dendrobium_antiox: {
      id: 'dendrobium_antiox', isInnovative: true, featured: true, sourceTag: '工艺对比 · 萃取vs树脂',
      herb: '流苏石斛', compound: '石斛酚类与黄酮抗氧化部位', latin: 'Dendrobium fimbriatum Hook.',
      category: '苯丙素与有机酸', defaultRig: 'resin', applicableRigs: ['ultrasound', 'extract', 'resin', 'rotavap'],
      defaultExtract: 'ultrasound', defaultSep: 'resin', formulas: ['adsorption', 'nernst', 'qc'],
      defaultCfg: { mass: 50, ratio: 12, temp: 45, time: 30, mesh: '中粉(40目)', cycles: '2', solventType: '70%乙醇', ph: '中性 7.0' },
      limitVal: 1.2, limitUnit: '%', crudeUnit: 'g', mpRef: '总酚部位浸膏',
      origin: '兰科石斛属药用植物，含联苄、菲类及黄酮等强抗氧化酚类成分（参考 PMC10454342 对比研究）。',
      chemistry: '酚羟基丰富，兼具较强自由基清除活性；适合作为本科“液-液萃取 vs 大孔树脂纯化”对照实验模型。',
      pharmacopoeia: '参考研究与质控标准：对比两法总酚富集倍数与 DPPH 清除率 IC₅₀，平行 3 批 RSD < 5%。',
      integrative: '高校综合设计对比模板：同批石斛提取液一分为二，A 组走乙酸乙酯液-液萃取，B 组走大孔树脂纯化，定量比较收率、溶剂耗量与抗氧化活性。',
      scaling: { auxName: '大孔树脂/乙酸乙酯', auxFactor: 1.0, auxUnit: 'mL', yieldLow: 0.012, yieldHigh: 0.024, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板，石油醚-乙酸乙酯-甲酸 (5:4:0.5)，喷 1% FeCl₃-铁氰化钾显蓝绿色酚类斑点。',
      tlcDefault: { front: 8.0, sample: 4.1, ref: 4.1 },
      steps: [
        { stage: '提取', title: '70% 乙醇低温超声提取总酚', principle: '温和超声高效溶出联苄与黄酮类抗氧化酚。', operation: '50 g 石斛中粉 70% 乙醇 45℃ 超声 30 min×2 次，合并滤液旋蒸脱醇。', qc: '控温防酚类氧化。' },
        { stage: '分离', title: '平行对照：A 组液-液萃取 vs B 组大孔树脂', principle: '对比极性分配与多孔吸附在富集效率与环保耗材上的差异。', operation: 'A 组以乙酸乙酯萃取 3 次；B 组上 AB-8 树脂水洗除糖、60% 乙醇洗脱。', qc: '两组平行投料量完全一致。' },
        { stage: '纯化', title: '低温旋蒸浓缩与恒重', principle: '45℃ 减压回收溶剂得到干浸膏并核算富集得率。', operation: '分别 45℃ 旋蒸至稠膏，真空干燥称重计算收率与溶剂节约率。', qc: '恒重误差 ≤ 0.5 mg。' },
        { stage: '检识', title: 'TLC 酚类显色与 DPPH 抗氧化快筛', principle: '酚羟基供氢淬灭紫红色 DPPH 自由基使其褪为淡黄色（517 nm 测吸光度）。', operation: '同板 TLC 比对酚类特征带并测定两组 DPPH 清除率。', qc: '空白与 Vc 阳性对照同步测定。' }
      ],
      troubleshoot: [
        { issue: '乙酸乙酯层乳化严重', cause: '石斛富含黏性多糖易作乳化剂。', fix: '旋蒸脱醇后先静置醇沉或直接采用大孔树脂法可彻底规避乳化！' }
      ],
      sop: ['70% 乙醇 45℃ 超声提取石斛并脱醇', '将提取液均分为 A/B 两份对照处理', 'A 组乙酸乙酯萃取、B 组 AB-8 树脂洗脱', '分别旋蒸浓缩干燥对比收率与溶剂耗量', '执行 TLC 检识与 DPPH 抗氧化评价'],
      chemTests: [{ name: 'FeCl₃ 酚类蓝绿色显色', passed: true }, { name: 'DPPH 自由基褪色阳性', passed: true }, { name: 'TLC 特征斑点一致', passed: true }],
      demoBatches: [{ mass: 50, crude: 0.78, refined: 0.56, mp: 0 }, { mass: 50, crude: 0.82, refined: 0.59, mp: 0 }, { mass: 50, crude: 0.80, refined: 0.57, mp: 0 }]
    },
    saffron_crocin: {
      id: 'saffron_crocin', isInnovative: true, featured: true, sourceTag: '高值药材 · 企业QC快检',
      herb: '西红花', compound: '西红花苷-Ⅰ / 西红花苷-Ⅱ', latin: 'Crocus sativus L.',
      category: '萜类内酯与环烯醚萜', defaultRig: 'ultrasound', applicableRigs: ['ultrasound', 'filter'],
      defaultExtract: 'ultrasound', defaultSep: 'resin', formulas: ['diffusion', 'qc'],
      defaultCfg: { mass: 10, ratio: 20, temp: 25, time: 20, mesh: '细粉(60~80目)', cycles: '1', solventType: '纯化水', ph: '中性 7.0' },
      limitVal: 10.0, limitUnit: '%', crudeUnit: 'g', mpRef: '西红花苷-Ⅰ 186℃',
      origin: '鸢尾科番红花干燥柱头，属高价值名贵中药材；企业 QC 实验室典型微量（0.5~10 g）避光快检标杆。',
      chemistry: '属水溶性类胡萝卜素双龙胆二糖酯（藏红花素），极易溶于水呈金黄色，遇强光、高温迅速褪色降解。',
      pharmacopoeia: '《中国药典》规定西红花含西红花苷-Ⅰ和西红花苷-Ⅱ总量 ≥ 10.0%，且 440 nm 吸光度不得低于 0.50。',
      integrative: '药企高值药材微量化 QC 规范示范：仅需极少量投料、零有机溶剂纯水避光超声 + 440 nm UV-Vis 定量与掺伪鉴别（防染色红花/玉米须掺假）。',
      scaling: { auxName: '棕色容量瓶/滤膜', auxFactor: 0.1, auxUnit: '套', yieldLow: 0.10, yieldHigh: 0.16, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板，乙酸乙酯-甲醇-水 (100:16.5:13.5)，日光下显鲜明黄色主斑点（Rf≈0.35），滴浓硫酸显蓝色转紫红。',
      tlcDefault: { front: 8.0, sample: 2.8, ref: 2.8 },
      steps: [
        { stage: '提取', title: '避光常温纯水超声微量化提取', principle: '西红花苷强水溶且极怕热光，25℃ 避光超声 20 min 即可完全溶出。', operation: '精密称取西红花细粉，置棕色具塞瓶加纯化水，25℃ 避光超声 20 min。', qc: '全程严禁强光直射与升温。' },
        { stage: '分离', title: '微孔滤膜/抽滤快速澄清', principle: '去除柱头纤维残渣，获得澄清金黄色西红花苷水液。', operation: '经 0.45 μm 水系滤膜或微孔抽滤澄清，定容于棕色容量瓶。', qc: '滤液清亮无红色悬浮染料。' },
        { stage: '纯化', title: '大孔树脂水洗-乙醇段富集（备选制备）', principle: '需制备精制品时可上 AB-8 树脂以 50% 乙醇洗脱并冷冻干燥。', operation: '按需进行树脂纯化，常规 QC 检测可直接取澄清定容液测定。', qc: '干燥必须采用避光低温/冻干。' },
        { stage: '检识', title: '440 nm 紫外定量、浓硫酸变色与掺伪 TLC', principle: '共轭多烯链在 440 nm 有强吸收，遇浓硫酸由蓝变紫最后变红棕色；人工色素无此变色。', operation: '测 440 nm 吸光度并做日光+浓硫酸显色 TLC 排除柠檬黄等非法染色。', qc: '吸收值达标且无异常荧光染料斑点。' }
      ],
      troubleshoot: [
        { issue: '水液呈橙红色而非金黄色', cause: '疑似掺入合成色素（如胭脂红/柠檬黄）或以普通红花冒充。', fix: '立即做 TLC 与浓硫酸变色试验核查真伪。' }
      ],
      sop: ['棕色瓶精密称量与 25℃ 避光纯水超声', '0.45 μm 滤膜澄清并定容', '测定 440 nm 特征紫外吸光度', '执行浓硫酸蓝→紫→红棕特征显色', '日光与 UV 下完成 TLC 掺伪排查'],
      chemTests: [{ name: '水浸液金黄色（非红色）', passed: true }, { name: '浓硫酸蓝→紫→红棕变色', passed: true }, { name: 'TLC 无合成染料斑点', passed: true }],
      demoBatches: [{ mass: 10, crude: 1.24, refined: 1.08, mp: 186.1 }, { mass: 10, crude: 1.28, refined: 1.12, mp: 186.4 }, { mass: 10, crude: 1.26, refined: 1.10, mp: 186.2 }]
    },
    camptotheca: {
      id: 'camptotheca', isInnovative: true, featured: true, sourceTag: '抗肿瘤先导物 · 柱层析',
      herb: '喜树果', compound: '喜树碱', latin: 'Camptotheca acuminata Decne.',
      category: '生物碱', defaultRig: 'column', applicableRigs: ['reflux', 'rotavap', 'column', 'filter'],
      defaultExtract: 'reflux', defaultSep: 'column', formulas: ['adsorption', 'diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 75, time: 60, mesh: '中粉(40目)', cycles: '2', solventType: '70%乙醇', ph: 'pH 5.5(保内酯环)' },
      limitVal: 0.12, limitUnit: '%', crudeUnit: 'g', mpRef: '喜树碱 264~267℃(分解)',
      origin: '珙桐科植物喜树的干燥果实，我国特有抗肿瘤植物资源，是临床一线抗癌药伊立替康与拓扑替康的天然母体。',
      chemistry: '喹啉类吲哚生物碱，分子含 α-羟基-δ-内酯环（抗肿瘤活性必需基团）；遇碱开环失活，酸化可闭环恢复；具强蓝色荧光。',
      pharmacopoeia: '行业提取标准与高校天然药化典型案例：喜树果含喜树碱 0.10%~0.25%，需严控微酸性防内酯开环。',
      integrative: '衔接“天然先导化合物→结构修饰成药（伊立替康/拓扑替康）”的药物化学主线，强化内酯环 pH 稳定性与硅胶柱梯度分离训练。',
      scaling: { auxName: '200-300目硅胶', auxFactor: 1.2, auxUnit: 'g', yieldLow: 0.001, yieldHigh: 0.0022, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板，氯仿-甲醇 (20:1) 或乙酸乙酯-丙酮 (3:1)，UV 365 nm 呈极强天蓝色荧光斑点（Rf≈0.46）。',
      tlcDefault: { front: 8.0, sample: 3.7, ref: 3.7 },
      steps: [
        { stage: '提取', title: '70% 乙醇温热回流浸提', principle: '喜树碱中性/微酸性下极性适中，70% 乙醇回流可高效溶出并避免强碱破坏内酯环。', operation: '50 g 喜树果中粉加 500 mL 70% 乙醇，75℃ 回流 60 min×2 次，抽滤合并。', qc: '严禁使用强碱试剂以免内酯开环失活。' },
        { stage: '分离', title: '旋蒸浓缩与脱脂除杂', principle: '低温回收乙醇后经石油醚脱除油脂与叶绿素，减少硅胶柱死吸附。', operation: '45℃ 旋蒸浓缩成浸膏，少量石油醚洗涤脱脂，拌 100~200 目硅胶干法上样。', qc: '全程在通风橱戴手套操作（具细胞毒性）。' },
        { stage: '纯化', title: '硅胶柱层析梯度洗脱与重结晶', principle: '按极性梯度洗脱分离喜树碱与 10-羟基喜树碱，合并天蓝荧光纯流分。', operation: '乙酸乙酯-丙酮梯度洗脱，每 15 mL 接管，UV 365 nm TLC 追踪合并目标管，旋蒸析出淡黄色针晶。', qc: '柱床全程不得干柱。' },
        { stage: '检识', title: 'UV 365 nm 天蓝荧光 TLC 与酸碱可逆内酯验证', principle: '喜树碱共轭喹啉环在 365 nm 发耀眼天蓝色荧光，为极高灵敏度检识特征。', operation: '点板与标准品共色谱，UV 365 nm 观察天蓝荧光单斑并测熔点。', qc: '|ΔRf| ≤ 0.03，做好毒麻/细胞毒废液分类回收。' }
      ],
      troubleshoot: [
        { issue: '提取过程中活性或收率下降', cause: '误用碱性溶液导致 E 环内酯水解为羧酸盐留在水相。', fix: '酸化至 pH 3~4 加热片刻可促使内酯重新闭环析出。' }
      ],
      sop: ['通风橱个人防护并 70% 乙醇回流提取', '45℃ 旋蒸浓缩并石油醚脱脂', '湿法装硅胶柱、干法拌样上柱', '梯度洗脱并 UV 365 nm 追踪合并流分', '析晶干燥与规范废液回收'],
      chemTests: [{ name: 'UV 365nm 强天蓝色荧光', passed: true }, { name: '碘化铋钾生物碱显色', passed: true }, { name: 'TLC 对照品一致', passed: true }],
      demoBatches: [{ mass: 50, crude: 0.088, refined: 0.062, mp: 265.2 }, { mass: 50, crude: 0.094, refined: 0.066, mp: 265.8 }, { mass: 50, crude: 0.091, refined: 0.064, mp: 265.5 }]
    },
    coptis_qc: {
      id: 'coptis_qc', isInnovative: true, featured: true, sourceTag: '企业QC · 酸水盐析标杆',
      herb: '黄连（药企QC精制版）', compound: '盐酸小檗碱 + 巴马汀', latin: 'Coptis chinensis Franch.',
      category: '生物碱', defaultRig: 'filter', applicableRigs: ['reflux', 'filter', 'extract'],
      defaultExtract: 'acid_water', defaultSep: 'salting_out', formulas: ['henderson', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 70, time: 60, mesh: '粗粉(10~20目)', cycles: '2', solventType: '0.5%酸水', ph: '酸提2.0→碱9.0→酸2.0' },
      limitVal: 5.5, limitUnit: '%', crudeUnit: 'g', mpRef: '盐酸小檗碱 204~206℃',
      origin: '毛茛科黄连干燥根茎；药企提取车间最经典“酸水浸提—石灰乳除杂—盐析结晶”全工业化路线教学复刻。',
      chemistry: '小檗碱为季铵型异喹啉生物碱，硫酸盐较易溶于水，盐酸盐在冷水中难溶（尤其在 8%~10% NaCl 存在下几乎完全盐析）。',
      pharmacopoeia: '《中国药典》规定黄连含小檗碱（以盐酸小檗碱计）不得少于 5.5%。',
      integrative: '对接药企 GMP 车间成本控制：全程以纯化水、稀硫酸、石灰乳与食盐为主，零氯仿、零甲醇，出晶鲜黄、重复性极佳（RSD 常 < 2.5%）。',
      scaling: { auxName: 'NaCl盐析剂/石灰乳', auxFactor: 0.8, auxUnit: 'g', yieldLow: 0.055, yieldHigh: 0.075, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板，甲苯-乙酸乙酯-甲醇-异丙醇-浓氨试液 (12:6:3:3:1)，UV 365 nm 呈亮黄色荧光斑点（小檗碱 Rf≈0.45）。',
      tlcDefault: { front: 8.0, sample: 3.6, ref: 3.6 },
      steps: [
        { stage: '提取', title: '0.5% 硫酸水溶液温浸提取', principle: '硫酸小檗碱水溶性远高于盐酸盐，用稀硫酸水提取避免小檗碱提前沉淀流失。', operation: '50 g 黄连粗粉加 500 mL 0.5% H₂SO₄ 水溶液，70℃ 浸提 60 min×2 次，纱布趁热过滤。', qc: '切忌用盐酸直接提取！' },
        { stage: '分离', title: '石灰乳调 pH 9 除鞣质色素', principle: 'Ca(OH)₂ 与酸性树脂、鞣质及黏液质生成不溶钙盐沉淀，而季铵碱小檗碱仍稳定留在水相。', operation: '向硫酸提取液加 10% 石灰乳调 pH 9~10，静置沉淀后布氏漏斗抽滤弃去灰绿色杂质。', qc: 'pH 控制 9~10，过滤澄清透亮。' },
        { stage: '纯化', title: '盐酸酸化与 8% 食盐盐析结晶', principle: '酸化生成盐酸小檗碱，叠加 NaCl 同离子效应大幅降低溶解度，析出大量鲜黄色针晶。', operation: '澄清滤液用浓 HCl 调 pH 2.0，搅拌加入 8% NaCl 溶解，置 4℃ 静置 2 h，布氏漏斗抽滤并用 5% 冷盐水淋洗。', qc: '50℃ 干燥得亮黄色结晶。' },
        { stage: '检识', title: '漂白粉樱红反应与 UV 365 nm 黄荧光 TLC', principle: '小檗碱在酸性溶液中遇漂白粉（次氯酸钙）氧化呈特征樱红色。', operation: '做漂白粉显色与氨蒸气饱和 TLC 对照，核算 3 批收率与 RSD。', qc: '收率 ≥ 5.5%，|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [
        { issue: '提取阶段几乎提不出有效成分', cause: '误将 0.5% 硫酸换成了盐酸，导致小檗碱在药渣里直接生成难溶盐酸盐。', fix: '必须用稀硫酸提取、最后一步才用盐酸+食盐盐析！' }
      ],
      sop: ['0.5% 硫酸水 70℃ 提取黄连粗粉 2 次', '加石灰乳调 pH 9~10 静置抽滤除杂', '滤液浓 HCl 调 pH 2.0 并加 8% NaCl 盐析', '低温静置 2 h 后布氏漏斗抽滤收晶', '漂白粉樱红显色与 UV 365 nm TLC 检识'],
      chemTests: [{ name: '漂白粉特征樱红色反应', passed: true }, { name: '丙酮加成黄色结晶', passed: true }, { name: 'UV 365nm 黄荧光 TLC 一致', passed: true }],
      demoBatches: [{ mass: 50, crude: 3.12, refined: 2.86, mp: 204.8 }, { mass: 50, crude: 3.20, refined: 2.94, mp: 205.3 }, { mass: 50, crude: 3.16, refined: 2.90, mp: 205.0 }]
    },
    magnolia_dual: {
      id: 'magnolia_dual', isInnovative: true, featured: true, sourceTag: '高校科研 · 碱提柱分',
      herb: '厚朴（双酚分离版）', compound: '厚朴酚 + 和厚朴酚', latin: 'Magnolia officinalis Rehd. et Wils.',
      category: '香豆素与木脂素', defaultRig: 'column', applicableRigs: ['reflux', 'extract', 'column', 'rotavap'],
      defaultExtract: 'reflux', defaultSep: 'column', formulas: ['henderson', 'adsorption', 'qc'],
      defaultCfg: { mass: 50, ratio: 8, temp: 75, time: 60, mesh: '粗粉(10~20目)', cycles: '2', solventType: '70%乙醇', ph: '碱溶11→酸沉2.5' },
      limitVal: 2.0, limitUnit: '%', crudeUnit: 'g', mpRef: '厚朴酚 102℃ / 和厚朴酚 87.5℃',
      origin: '木兰科厚朴干燥干皮；厚朴酚与和厚朴酚互为同分异构体，兼具燥湿消痰与现代中枢抗焦虑、抗炎协同机制。',
      chemistry: '双联苯新木脂素类，含两个酚羟基呈弱酸性，可溶于碱水、乙醇、乙酸乙酯，借助硅胶柱极性微差实现双单体基线分离。',
      pharmacopoeia: '《中国药典》规定厚朴含厚朴酚与和厚朴酚总量不得少于 2.0%。',
      integrative: '串联“碱溶酸沉粗富集 + 硅胶柱层析异构体精分”双技术，非常适合高校中药化学综合设计实验。',
      scaling: { auxName: '200-300目硅胶', auxFactor: 1.5, auxUnit: 'g', yieldLow: 0.020, yieldHigh: 0.035, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板，甲苯-甲醇 (17:1) 或石油醚-乙酸乙酯 (5:1)，喷 1% 香草醛硫酸液显紫红色（厚朴酚 Rf≈0.52，和厚朴酚 Rf≈0.41）。',
      tlcDefault: { front: 8.0, sample: 4.1, ref: 4.2 },
      steps: [
        { stage: '提取', title: '70% 乙醇热回流提取总木脂素', principle: '联苯酚极性中等，70% 乙醇回流溶出迅速且杂糖少。', operation: '50 g 厚朴粗粉 400 mL 70% 乙醇 75℃ 回流 60 min×2 次，抽滤并旋蒸回收乙醇。', qc: '防止乙醇干烧。' },
        { stage: '分离', title: '碱溶酸沉与乙酸乙酯萃取粗纯化', principle: '利用双酚羟基与 2% NaOH 成钠盐溶于水，滤除中性树脂后酸化析出总厚朴酚。', operation: '浸膏加 2% NaOH 溶滤，滤液酸化至 pH 2.5，乙酸乙酯萃取 3 次并旋蒸浓缩。', qc: '酸化速度平缓防局部发热。' },
        { stage: '纯化', title: '硅胶柱梯度洗脱分离双异构体', principle: '厚朴酚分子内氢键较强、极性略小于和厚朴酚，在硅胶柱中先洗脱出柱。', operation: '石油醚-乙酸乙酯 (10:1 → 6:1) 梯度洗脱，TLC 追踪分别收集厚朴酚与和厚朴酚纯流分。', qc: '流速 1~2 滴/秒防两带重叠。' },
        { stage: '检识', title: '香草醛-硫酸显色 TLC 与双熔点测定', principle: '香草醛-硫酸试剂使双酚呈鲜明紫红/蓝紫色，两异构体 Rf 差约 0.11。', operation: '点板同板展开显色，并分别测定两单体的毛细管熔点。', qc: '双斑清晰分离，|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [
        { issue: '厚朴酚与和厚朴酚柱层析混带', cause: '起始洗脱剂极性过大导致两异构体同时冲出。', fix: '将起始石油醚-乙酸乙酯比例降至 12:1 缓慢拉大分离度。' }
      ],
      sop: ['70% 乙醇 75℃ 回流提取厚朴粗粉', '旋蒸浓缩后 2% NaOH 碱溶除中性杂质', '酸化至 pH 2.5 并乙酸乙酯萃取', '硅胶柱石油醚-乙酸乙酯梯度分得双异构体', '香草醛-硫酸 TLC 与熔点双确证'],
      chemTests: [{ name: 'FeCl₃ 蓝绿色酚羟基反应', passed: true }, { name: '香草醛-硫酸紫红显色', passed: true }, { name: '双异构体 TLC 基线分离', passed: true }],
      demoBatches: [{ mass: 50, crude: 1.32, refined: 0.94, mp: 101.6 }, { mass: 50, crude: 1.38, refined: 0.99, mp: 102.1 }, { mass: 50, crude: 1.35, refined: 0.96, mp: 101.8 }]
    },
    curcuma_resin: {
      id: 'curcuma_resin', isInnovative: true, featured: true, sourceTag: '高校/药企 · 树脂抗炎',
      herb: '姜黄（树脂纯化版）', compound: '姜黄素类（姜黄素/去甲氧基姜黄素）', latin: 'Curcuma longa L.',
      category: '苯丙素与有机酸', defaultRig: 'resin', applicableRigs: ['ultrasound', 'rotavap', 'resin', 'column'],
      defaultExtract: 'ultrasound', defaultSep: 'resin', formulas: ['adsorption', 'diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 45, time: 30, mesh: '中粉(40目)', cycles: '2', solventType: '70%乙醇', ph: 'pH 5.0' },
      limitVal: 1.0, limitUnit: '%', crudeUnit: 'g', mpRef: '姜黄素 183℃',
      origin: '姜科植物姜黄干燥根茎；全球关注度最高的天然抗炎多酚之一（参考 PMC11990265 大孔树脂联合纯化研究）。',
      chemistry: '二芳基庚烷类多酚，难溶于水、易溶于乙醇与丙酮；酸性条件下呈鲜明亮黄色，碱性条件转为红褐色且迅速降解。',
      pharmacopoeia: '《中国药典》规定姜黄含姜黄素不得少于 1.0%。',
      integrative: '绿色高效纯化路线：低温超声提取避免长时间高温失活，再经 AB-8/D101 树脂脱糖除杂，产出高纯度亮黄色姜黄素，可直接衔接抗炎/抗氧化评价。',
      scaling: { auxName: 'D101大孔树脂', auxFactor: 1.2, auxUnit: 'mL', yieldLow: 0.011, yieldHigh: 0.022, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板，三氯甲烷-甲醇-甲酸 (96:4:0.7) 或石油醚-乙酸乙酯-甲酸 (5:4:0.5)，日光下可见三条清晰黄色带（姜黄素 Rf 最高约 0.56）。',
      tlcDefault: { front: 8.0, sample: 4.5, ref: 4.5 },
      steps: [
        { stage: '提取', title: '避光 45℃ 超声乙醇浸提', principle: '姜黄素对光碱敏感，低温避光超声 30 min 可最大限度保留活性。', operation: '50 g 姜黄中粉加 500 mL 70% 乙醇（pH 5.0），避光 45℃ 超声 30 min×2 次。', qc: '避光且严禁遇碱。' },
        { stage: '分离', title: '旋蒸脱醇与 D101 大孔树脂富集', principle: 'D101 树脂强吸附疏水性姜黄素，30% 乙醇除杂、80% 乙醇精准洗脱。', operation: '提取液 45℃ 旋蒸脱醇上树脂柱，纯化水与 30% 乙醇洗杂后，80% 乙醇洗脱收集亮黄色流分。', qc: '流速 1.5 BV/h。' },
        { stage: '纯化', title: '乙醇重结晶提纯', principle: '浓缩洗脱液冷置重结晶，进一步除去残留姜黄挥发油。', operation: '80% 乙醇洗脱液旋蒸浓缩至小体积，4℃ 静置析出橙黄色结晶，抽滤烘干。', qc: '50℃ 避光干燥。' },
        { stage: '检识', title: '酸碱变色反应与日光三带 TLC', principle: '姜黄素遇硼酸/浓硫酸呈紫红色，遇碱变红棕色；TLC 日光下无需显色即见三组分黄斑。', operation: '做碱变红棕可逆实验及三组分 TLC 检视（姜黄素、去甲氧基、双去甲氧基姜黄素）。', qc: '三黄带清晰分离，|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [
        { issue: '姜黄素提取液变暗红失去亮黄色', cause: '容器残留洗涤碱液导致姜黄素烯醇式去质子化并降解。', fix: '立即滴加稀盐酸/柠檬酸调回 pH 4~5 并避光保存。' }
      ],
      sop: ['70% 乙醇避光 45℃ 超声提取姜黄', '45℃ 旋蒸脱醇并上 D101 树脂柱', '水与 30% 乙醇除杂、80% 乙醇收集亮黄流分', '低温浓缩析晶并避光烘干', '执行酸碱变色与日光三带 TLC 检识'],
      chemTests: [{ name: '遇碱红棕/遇酸复黄反应', passed: true }, { name: 'UV 365nm 亮黄绿荧光', passed: true }, { name: 'TLC 三黄带与对照品一致', passed: true }],
      demoBatches: [{ mass: 50, crude: 0.86, refined: 0.62, mp: 182.8 }, { mass: 50, crude: 0.91, refined: 0.66, mp: 183.3 }, { mass: 50, crude: 0.89, refined: 0.64, mp: 183.0 }]
    },
    licorice_qc: {
      id: 'licorice_qc', isInnovative: true, featured: true, sourceTag: '企业中试 · 氨提酸沉',
      herb: '甘草（企业QC氨提版）', compound: '甘草酸单铵盐', latin: 'Glycyrrhiza uralensis Fisch.',
      category: '皂苷与三萜', defaultRig: 'filter', applicableRigs: ['reflux', 'filter', 'rotavap'],
      defaultExtract: 'reflux', defaultSep: 'acid_precip', formulas: ['henderson', 'diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 70, time: 60, mesh: '粗粉(10~20目)', cycles: '2', solventType: '0.5%氨水', ph: '提取8.5→酸沉2.0' },
      limitVal: 2.0, limitUnit: '%', crudeUnit: 'g', mpRef: '甘草酸单铵盐 209~212℃',
      origin: '豆科甘草干燥根及根茎；中药提取企业大宗品种，采用 0.5% 稀氨水提取—稀硫酸酸沉—乙醇氨化制备甘草酸单铵盐。',
      chemistry: '甘草酸属三萜皂苷，含 3 个羧基呈较强酸性；在氨水中成易溶铵盐高效溶出，酸化至 pH 2.0 沉淀析出粗甘草酸，再以氨气/氨水乙醇精制为单铵盐。',
      pharmacopoeia: '《中国药典》规定甘草含甘草酸不得少于 2.0%（甘草苷 ≥ 0.50%）。',
      integrative: '对接复方甘草酸苷等临床保肝抗炎制剂原料药生产工艺，展示“水相氨提酸沉”的极低成本与绿色放大优势。',
      scaling: { auxName: '浓氨水/10%硫酸', auxFactor: 0.35, auxUnit: 'mL', yieldLow: 0.022, yieldHigh: 0.038, yieldUnit: 'g' },
      tlcSystem: '硅胶 GF254 板，乙酸乙酯-甲酸-冰醋酸-水 (15:1:1:2)，UV 254 nm 暗斑，喷 10% 硫酸乙醇 105℃ 烘烤显紫红色。',
      tlcDefault: { front: 8.0, sample: 3.1, ref: 3.1 },
      steps: [
        { stage: '提取', title: '0.5% 稀氨水 70℃ 温浸提取', principle: '氨水将游离甘草酸与钙镁盐转化为易溶性铵盐，大幅提升水相浸提率。', operation: '50 g 甘草粗粉加 500 mL 0.5% 氨水，70℃ 浸提 60 min×2 次，抽滤合并滤液。', qc: '避免剧烈搅拌产生大量持久皂苷泡沫。' },
        { stage: '分离', title: '旋蒸浓缩与 pH 2.0 酸沉粗甘草酸', principle: '酸化抑制羧基解离，甘草酸游离析出大量棕黄色絮状沉淀。', operation: '55℃ 旋蒸浓缩至原体积 1/4（加防暴沸球），滴加 10% H₂SO₄ 至 pH 2.0，静置 2 h 后抽滤。', qc: '浓缩时严防皂苷起泡冲料。' },
        { stage: '纯化', title: '乙醇溶解脱色与氨水精制单铵盐', principle: '粗品用 95% 乙醇热溶除去多糖胶质，滴加浓氨水至 pH 4.5 析出白色甘草酸单铵盐结晶。', operation: '粗甘草酸加 95% 乙醇热溶过滤，滤液滴加氨水调 pH 4.5，冷却抽滤得浅黄色/类白色单铵盐。', qc: '氨水切勿过量（pH > 6 生成易溶三铵盐）。' },
        { stage: '检识', title: '泡沫持久试验、Liebermann-Burchard 与 TLC', principle: '甘草酸具皂苷发泡性且三萜母核遇醋酐-浓硫酸显紫红变色。', operation: '开展发泡对比与 GF254 薄层对照检识。', qc: '|ΔRf| ≤ 0.03，收率 ≥ 2.0%。' }
      ],
      troubleshoot: [
        { issue: '浓缩起泡冲入冷凝管', cause: '甘草皂苷极强表面活性在减压下剧烈发泡。', fix: '必装防暴沸缓冲球、装液 ≤ 1/3 并滴加 1 滴食品级有机硅消泡剂。' }
      ],
      sop: ['0.5% 稀氨水 70℃ 提取甘草粗粉 2 次', '加缓冲球减压浓缩至 1/4 体积', '10% 硫酸调 pH 2.0 酸沉并抽滤', '95% 乙醇热溶去杂、调 pH 4.5 析出单铵盐', '完成发泡试验与 GF254 TLC 检识'],
      chemTests: [{ name: '酸碱持久泡沫试验阳性', passed: true }, { name: '10%硫酸乙醇加热紫红斑', passed: true }, { name: 'TLC 对照品共色谱', passed: true }],
      demoBatches: [{ mass: 50, crude: 1.48, refined: 1.12, mp: 209.6 }, { mass: 50, crude: 1.54, refined: 1.18, mp: 210.2 }, { mass: 50, crude: 1.51, refined: 1.15, mp: 209.9 }]
    }
  };

  // 新增 16 篇核实权威文献（将文献库从 34 篇扩充至 50 篇）
  const EXTRA_LITERATURE = [
    { tag: '药典教材', text: '国家药典委员会. 2025年版《中华人民共和国药典》四部通用技术要求和指导原则增修订概况[EB/OL]. 中国食品药品网, 2025.', url: 'https://cs.cnpharm.com/c/2025-07-28/1076831.shtml' },
    { tag: '高校实验', text: '乙酰水杨酸(阿司匹林)的制备及纯化实验教学研究[J]. 大学化学, 2021, 36(2): 2001033.', url: 'https://www.dxhx.pku.edu.cn/article/2021/1000-8438/20210219.shtml' },
    { tag: '高校实验', text: '非那西丁的合成与复方阿司匹林的主成分分析——推荐一个有机化学实验[J]. 大学化学, 2021, 36(12).', url: 'https://www.dxhx.pku.edu.cn/article/2021/1000-8438/20211220.shtml' },
    { tag: '中西医结合', text: '四川大学张跃林团队. Nature 发文揭示阿司匹林天然前体水杨酸的植物生物合成途径[EB/OL]. 四川大学新闻网, 2025.', url: 'https://www.scu.edu.cn/info/1776/35464.htm' },
    { tag: '药企中试', text: 'Simultaneous purification of dihydrotanshinone, tanshinone I, cryptotanshinone, and tanshinone IIA using D101 macroporous resin[J]. PMC, 2018.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5981213/' },
    { tag: '中西医结合', text: 'Tanshinones, Critical Pharmacological Components in Salvia miltiorrhiza: Extraction, Separation and Clinical Translation[J]. PMC, 2019.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6426754/' },
    { tag: '中药化学', text: 'Advances in Extraction, Purification, and Analysis Techniques of Puerarin from Pueraria lobata[J]. PMC, 2023.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10535729/' },
    { tag: '中西医结合', text: 'Puerarin—A Promising Flavonoid: Biosynthesis, Extraction Methods, Analytical Techniques and Biological Effects[J]. PMC, 2024.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11121215/' },
    { tag: '药企中试', text: 'Current status and future challenges in extraction and purification of cepharanthine (UAE + D101 Resin & ATPE)[J]. PMC, 2022.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9797411/' },
    { tag: '中西医结合', text: 'Analysis of Macroporous Resin Combined Extraction and Synergistic Anti-inflammatory Actions of Curcumin and Quercetin[J]. PMC, 2025.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11990265/' },
    { tag: '高校实验', text: 'A Comparative Analysis of Liquid-Liquid Extraction and Macroporous Resin Purification on Dendrobium fimbriatum Antioxidants[J]. PMC, 2023.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10454342/' },
    { tag: '中药化学', text: '绿原酸类化合物的种类、提取方法优化和生物活性研究进展[J]. 中国生物医学文献服务系统(SinoMed), 2025.', url: 'https://www.sinomed.ac.cn/article.do?ui=2025495694' },
    { tag: '高校实验', text: '沈阳药科大学中药学院实验教学中心. 中药化学与饮片技能大赛综合实验教学体系[EB/OL]. 沈阳药科大学.', url: 'https://stcm.syphu.edu.cn/info/1128/3755.htm' },
    { tag: '高校实验', text: '成都中医药大学药学院. 面向新质生产力的中药炮制与制剂交叉实验教学改革[EB/OL]. 成都中医药大学, 2024.', url: 'https://www.cdutcm.edu.cn/yxy/info/1801/25952.htm' },
    { tag: '药企中试', text: '上海中医药大学. 中药标准化技术国家工程研究中心与产教融合创新平台[EB/OL]. 上海中医药大学.', url: 'https://www.shutcm.edu.cn/6554/list.psp' },
    { tag: '药企中试', text: '大孔吸附树脂技术在现代中药提取与工业分离纯化中的应用原理[EB/OL]. 行业工艺文献.', url: 'http://csyskj.com/hangye/100.html' }
  ];

  // 新增 10 项全国高校 + 社会/药企 QC 与中试实验室案例（总计扩充至 20 项）
  const EXTRA_UNIV_CASES = [
    { type: '高校实验', univ: '沈阳药科大学中药学院', title: '300+ 中药饮片实训与国家级中药技能大赛实验体系', desc: '将中药化学提取分离、性状显微鉴别与技能竞赛深度融合，注重规范操作与平行质控训练。', url: 'https://stcm.syphu.edu.cn/info/1128/3755.htm' },
    { type: '高校实验', univ: '成都中医药大学药学院', title: '中药化学—炮制—制剂交叉备课与创新转化实验', desc: '依托西南特色中药资源国家重点实验室，打通川产道地药材（黄连/丹参/川芎）提取与制剂评价。', url: 'https://www.cdutcm.edu.cn/yxy/info/1801/25952.htm' },
    { type: '国家平台', univ: '上海中医药大学中药标准化中心', title: '中药标准化技术国家工程研究中心与 Q-Marker 质控', desc: '聚焦中药提取物全过程质量标志物标准化、指纹图谱与产教融合创新。', url: 'https://www.shutcm.edu.cn/6554/list.psp' },
    { type: '中西医结合', univ: '北京大学《大学化学》', title: '柳树皮水杨酸溯源→阿司匹林绿色乙酰化与限度检验', desc: '结合绿色催化与饱和碳酸氢钠除聚体纯化，串联天然产物溯源与西药质量检验（FeCl₃ 限度）。', url: 'https://www.dxhx.pku.edu.cn/article/2021/1000-8438/20210219.shtml' },
    { type: '中西医结合', univ: '四川大学生命科学学院', title: '《Nature》揭示柳树皮水杨酸植物生物合成通路', desc: '阐明阿司匹林天然前体水杨酸在植物中的关键合成机制，为中药次生代谢教学提供前沿案例。', url: 'https://www.scu.edu.cn/info/1776/35464.htm' },
    { type: '药企中试', univ: '现代中药企中试（丹参滴丸转化）', title: 'D101 大孔吸附树脂梯度洗脱同步纯化总丹参酮（>97%）', desc: '95% 乙醇提取后采用 0%/45%/90% 乙醇梯度分段洗脱，高收率、低污染，直接适配工业中试放大。', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5981213/' },
    { type: '药企中试', univ: '绿色制药实验室（ATPE + 树脂）', title: '千金藤素超声-双水相（ATPE）与 D101 树脂联用工艺', desc: '以乙醇-硫酸铵双水相替代有毒氯仿，降低 70%~90% 用水量，为社会实验室绿色工艺升级范例。', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9797411/' },
    { type: '药企QC', univ: '《中国药典》2025年版四部通则', title: '中药提取物通用技术要求、残留溶剂与重金属/农残质控', desc: '指导社会第三方检测机构与药企 QC 实验室建立符合最新药典规范的 TLC/HPLC 与 RSD 平行验证。', url: 'https://cs.cnpharm.com/c/2025-07-28/1076831.shtml' },
    { type: '高校实验', univ: '天然产物抗氧化对比实验室', title: '石斛酚类“液-液萃取 vs 大孔树脂纯化”平行对照设计', desc: '定量对比传统乙酸乙酯萃取与大孔树脂吸附的收率、破乳难度及 HepG2/DPPH 抗氧化活性。', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10454342/' },
    { type: '药企中试', univ: '药食同源开发实验室（葛根素）', title: '纤维素酶解预处理 + 大孔树脂纯化葛根素中试思路', desc: '利用酶解破壁显著提高葛根素溶出率，衔接现代心血管与代谢调节功能食品/中药新药开发。', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10535729/' }
  ];

  // AI 助教 6 大一键结构化问答模板
  const AI_CHAT_TEMPLATES = [
    { label: '⚗️ 工艺参数优化', prompt: '请结合我当前选定的药材和左侧参数，给出提取温度、料液比、时间与提取次数的正交优化建议（用表格对比默认方案与优化方案）。' },
    { label: '🔧 装置搭建排错', prompt: '请针对当前实验适用装置，列出搭建过程中最容易出错的 3 个细节、可能导致的后果以及现场急救处理方案。' },
    { label: '🧪 TLC 展开剂调优', prompt: '如果当前课题 TLC 出现斑点拖尾、Rf 偏高(>0.8)或偏低(<0.2)，请给出展开剂极性微调公式和点样饱和改进方案。' },
    { label: '📊 收率与 RSD 诊断', prompt: '请帮我诊断实验数据中粗提收率偏低或 3 批平行 RSD > 5% 的 4 个常见实验误差来源，并给出可直接写进报告的误差分析段落。' },
    { label: '📚 药典标准与波谱', prompt: '请总结当前目标成分的《中国药典》质控要点、特征显色反应原理以及 UV / 1H-NMR 关键归属信号，方便我答辩和写原理章节。' },
    { label: '📝 报告讨论润色', prompt: '请基于我当前课题的提取分离路线，帮我起草一段 200 字左右、学术规范的「实验结果讨论与改进展望」段落，供写入第 6 步报告。' }
  ];

  window.TCM_EXTRA_DATA = Object.freeze({
    EXTRA_RIGS,
    RIG_ENHANCEMENTS,
    STAGE_SUBBRANCHES,
    EXTRA_PRESETS,
    EXTRA_LITERATURE,
    EXTRA_UNIV_CASES,
    AI_CHAT_TEMPLATES
  });
})();
