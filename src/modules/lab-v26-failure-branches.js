/**
 * 本草智研 v26 · 2.2 失败分支系统（v2 互动应急决策与 FMEA 深度版）
 * - 7 大经典中药化学实验事故（极性选错 / 高温酶解 / 气密性差 / 暴沸冲料 / 萃取乳化 / TLC 拖尾 / 假液面误判）
 * - 新增「⚡ 现场应急处置 3 选 1 决策挑战」：选错给出真实二次事故后果警示，选对立即触发 CAPA 修复动画并点亮实战通关勋章 🏅
 * - 新增 FMEA RPN 补救前后量化降幅条（RPN Before → After）与一键复制 CAPA 复盘单
 * - 深度联动 2.1 自由配方沙盒弹窗与本机 localStorage 双进度记录（图鉴解锁 + 实战通关）
 */
(function () {
  "use strict";

  var STORAGE_UNLOCKED = "tcm_v26_failures_unlocked_v1";
  var STORAGE_MASTERED = "tcm_v26_failures_mastered_v1";

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var FAILURE_BRANCHES = [
    {
      id: "polarity_mismatch", code: "F-01", short: "极性选错",
      title: "溶剂极性选错 · 目标成分提取率暴跌", tag: "相似相溶失配",
      rpnBefore: 240, rpnAfter: 36, rpnDetail: "S8 × O6 × D5",
      lossMetrics: { yield: "10.1%", purity: "低（多糖杂溶）", risk: "实验重做" },
      fixedMetrics: { yield: "80.1%", purity: "高（丹红澄清）", risk: "可控达标" },
      phenomenon: "用纯化水（p=10.2）回流提取丹参时，提取液呈浅褐色浑浊，滤液极难过滤，目标脂溶性丹参酮 IIA 提取率跌破 12%，TLC 几乎检不出红色斑点。",
      cause: "违背「相似相溶」原则：丹参酮 IIA 为强亲脂邻菲醌（理想极性 p=2.4~5.8），在强极性水中溶解度极低；相反，水相把大量淀粉、果胶等水溶性杂质溶出导致滤液黏稠。",
      remedy: "立刻停止水提，将药渣低温烘干后改用 95% 乙醇（p=5.45）或乙酸乙酯（p=4.4）在 78℃ 下避光回流提取 2 次；若需水溶性丹酚酸 B，采用「先醇提后水提」双提路线。",
      prevention: "投料前对照《溶剂极性指数表》核验目标成分 LogP/极性窗：挥发油与游离醌用高醇/低极性溶剂，多糖用纯水，黄酮苷与皂苷优选 50%~70% 乙醇。",
      principle: "化学机理：Δp = |p(溶剂) − p(目标)| > 2.5 时分配系数骤降，非极性母核形成疏水聚集体无法进入水相。",
      sandboxPreset: "polar_fail",
      drill: [
        { text: "A. 延长纯水沸腾时间至 4 小时强行浸出", ok: false, fb: "二次事故：纯水再煮 4 小时也无法溶解脂溶性丹参酮，反而使淀粉彻底糊化堵死滤纸！" },
        { text: "B. 停水提，药渣低温烘干改用 95% 乙醇 78℃ 避光回流", ok: true, fb: "处置正确！溶剂极性由 10.2 调回 5.45 精准落入邻菲醌极性窗，丹红提取液澄清且收率回升至 80%+。" },
        { text: "C. 直接往热水中倒入石油醚搅拌混合", ok: false, fb: "二次事故：石油醚沸点仅 30~60℃ 且极易燃，倒入热水瞬间汽化暴沸，存在严重燃爆风险！" }
      ]
    },
    {
      id: "thermal_degrade", code: "F-02", short: "高温/热敏",
      title: "温度失控 · 热敏降解与显色异常（黄芩变绿 / 酚酸褐变）", tag: "热敏与酶解",
      rpnBefore: 280, rpnAfter: 40, rpnDetail: "S8 × O7 × D5",
      lossMetrics: { yield: "7.1% ~ 40%", purity: "变绿/深棕褐变", risk: "成分失效" },
      fixedMetrics: { yield: "82.4%", purity: "金黄/嫩黄清透", risk: "活性完好" },
      phenomenon: "金银花在 95℃ 碱水中迅速氧化成深棕黑褐色；黄芩用 50℃ 温水浸泡 30 min 后药液转为暗墨绿色并析出黄绿色沉淀，HPLC 目标峰面积缩水超 60%。",
      cause: "绿原酸含邻二酚羟基与酯键，高温与强碱加速醌式氧化聚合及酯键水解；黄芩含内源黄芩酶，35~65℃ 温水正处酶活峰值，将黄芩苷水解为黄芩素并氧化成绿色醌类。",
      remedy: "热敏酚酸立即降温至 40~45℃、调微酸（pH 4~5）并改用超声辅助短时提取；黄芩改用沸水（≥95℃）直接投药瞬时钝化黄芩酶，或直接采用 ≥70% 乙醇提取。",
      prevention: "实验前排查成分结构中的热敏/酶敏基团（邻二酚、酯键、内酯、易酶解糖苷），明确温度红线与杀酶保苷前置步骤。",
      principle: "化学机理：黄芩苷（黄色）—[黄芩酶, 50℃水]→ 黄芩素（邻三酚）—[O₂]→ 绿色醌式聚合物。",
      sandboxPreset: "enzyme_trap",
      drill: [
        { text: "A. 继续 50℃ 温水浸泡过夜提高溶出率", ok: false, fb: "二次事故：50℃ 是黄芩酶最适活性温度，浸泡过夜将导致黄芩苷几乎完全酶解变绿失效！" },
        { text: "B. 改用沸水（≥95℃）直接投药瞬时杀酶保苷（或用 ≥70% 乙醇）", ok: true, fb: "处置正确！沸水瞬间使黄芩酶蛋白质变性失活，完整保留金黄澄清的黄芩苷提取液。" },
        { text: "C. 加入浓 NaOH 调至 pH 12 强碱助溶", ok: false, fb: "二次事故：强碱环境下酚羟基迅速氧化褐变聚合，导致提取液变黑且成分破坏。" }
      ]
    },
    {
      id: "seal_leak", code: "F-03", short: "气密性差",
      title: "装置气密性差 / 冷凝失效 · 溶剂逸散与产率损失", tag: "物理密封故障",
      rpnBefore: 252, rpnAfter: 36, rpnDetail: "S9 × O4 × D7",
      lossMetrics: { yield: "损失 42%", purity: "挥发油逃逸", risk: "易燃蒸汽隐患" },
      fixedMetrics: { yield: "86.5%", purity: "全馏分回收", risk: "安全密闭" },
      phenomenon: "回流 30 min 后烧瓶内乙醇液面明显下降，通风橱内弥漫强烈酒味或芳香气味；挥发油测定器上口冒白雾，最终测得挥发油与浸膏收率偏低 35%~50%。",
      cause: "标准磨口玻璃接头未涂微量真空脂或未卡紧蓝色防脱卡扣、冷凝管冷却水误接「上进下出」形成气堵、或忘记开启冷凝循环水导致蒸汽直接冲出管顶。",
      remedy: "立即断电停热，待体系微冷后检查所有磨口密封性并扣紧防脱夹，更正冷却水为「下进上出」并确认水流充盈无气泡，补足损失溶剂后再平稳升温。",
      prevention: "执行「先查气密 → 先通冷水 → 后开加热」铁律，低沸点易燃溶剂须在通风橱内操作并严禁明火。",
      principle: "工程机理：回流冷凝管需保持气-液逆流换热，若管壁温差不足，气相逃逸率随蒸汽压呈指数上升。",
      sandboxPreset: null,
      drill: [
        { text: "A. 用湿抹布堵死球形冷凝管最顶部开口防止跑气", ok: false, fb: "二次事故：严禁封闭回流体系顶部！密闭受热会引发内部压力骤增导致玻璃仪器炸裂！" },
        { text: "B. 立刻停热微冷，锁紧磨口卡扣并将冷却水更正为「下进上出」", ok: true, fb: "处置正确！逆流冷凝效率恢复 100%，磨口密闭且顶部保持常压通气安全。" },
        { text: "C. 不停加热直接从冷凝管顶口猛灌冷乙醇补液", ok: false, fb: "二次事故：冷溶剂倾入炽热蒸汽管易引发剧烈喷溅与玻璃骤冷炸裂。" }
      ]
    },
    {
      id: "bumping_boil", code: "F-04", short: "暴沸冲料",
      title: "剧烈暴沸冲料 · 皂苷起泡污染冷凝管", tag: "热力学过热",
      rpnBefore: 320, rpnAfter: 40, rpnDetail: "S8 × O8 × D5",
      lossMetrics: { yield: "冲料损失 30%", purity: "接收瓶污染", risk: "烫伤/火灾" },
      fixedMetrics: { yield: "88.0%", purity: "平稳微沸", risk: "零冲料" },
      phenomenon: "圆底烧瓶内液体突然剧烈弹跳冲入球形冷凝管，或旋蒸浓缩甘草/人参皂苷提取液时大量白色泡沫瞬间涌入冷凝管并污染回收溶剂瓶。",
      cause: "纯液体/光滑玻璃内壁缺乏汽化核心形成过热液体（忘加沸石），或液体沸腾后盲目补加沸石诱发瞬间暴沸；含皂苷/多糖溶液表面张力低，负压下剧烈发泡。",
      remedy: "回流暴沸立刻断热冷却至沸点以下再补加 2~3 粒新沸石；旋蒸起泡冲料时第一时间手扶放气阀缓泄真空（勿直接关真空泵防倒吸），并加装防暴沸缓冲球。",
      prevention: "装液量严禁超过烧瓶容积 1/2~2/3，加热前先投沸石；皂苷类旋蒸必装防暴沸球、控转速 60~80 rpm 并可滴加 1 滴食品级硅油消泡。",
      principle: "物理机理：过热液体缺乏气核时局部蒸汽压突超外压形成爆发性汽化；皂苷两亲分子在气-液界面形成稳定弹性泡膜。",
      sandboxPreset: null,
      drill: [
        { text: "A. 趁烧瓶正在剧烈沸腾时赶紧扔进 3 粒沸石镇压", ok: false, fb: "二次事故：向过热沸腾液体中补加沸石会瞬间引入海量气核，引发灾难性喷料烫伤！" },
        { text: "B. 回流先断热冷却再加沸石；旋蒸起泡先缓开放气阀泄压并装缓冲球", ok: true, fb: "处置正确！彻底消除过热暴沸并防止真空泵倒吸，系统迅速恢复平稳微沸。" },
        { text: "C. 旋蒸起泡时直接拔掉真空泵电源插座", ok: false, fb: "二次事故：未先放气直接断泵会导致泵内水/油倒吸入蒸发瓶污染样品！" }
      ]
    },
    {
      id: "emulsion_lock", code: "F-05", short: "萃取乳化",
      title: "分液萃取顽固乳化 · 两相界面消失锁死", tag: "胶体界面失稳",
      rpnBefore: 245, rpnAfter: 35, rpnDetail: "S7 × O7 × D5",
      lossMetrics: { yield: "相损失 28%", purity: "夹带水相杂质", risk: "无法分层" },
      fixedMetrics: { yield: "91.2%", purity: "界面如镜清晰", risk: "快速分层" },
      phenomenon: "用乙酸乙酯/氯仿萃取含皂苷、黏性多糖或蛋白的水提液后，分液漏斗中形成厚实乳白色乳浊层，静置 20 min 仍无法清晰分层，强行放液导致两相混杂。",
      cause: "剧烈上下狂摇产生微米级液滴，且药材中的皂苷、果胶、蛋白质作为天然表面活性剂吸附在油-水界面形成机械保护膜，阻止液滴聚并。",
      remedy: "① 滴加饱和 NaCl 溶液盐析增大水相密度与离子强度压缩双电层；② 补加少量乙醇或温水浴微热降低界面黏度；③ 用细玻棒轻搅乳化层或 3000 rpm 离心 5 min 破乳。",
      prevention: "萃取前先醇沉除多糖蛋白；分液漏斗振摇采取「温和倒转 8~10 次 + 及时开塞放气」，坚持「少量多次」萃取原则。",
      principle: "胶体化学：NaCl 强电解质提高水相离子强度（盐析效应），压缩液滴表面双电层厚度促使乳滴快速聚并分层。",
      sandboxPreset: null,
      drill: [
        { text: "A. 再加力上下狂摇 20 次试图把乳化层震散", ok: false, fb: "二次事故：剧烈剪切会把液滴打得更细，乳化膜更加致密，静置 2 小时也无法分层！" },
        { text: "B. 滴加饱和 NaCl 溶液盐析 + 温水微热或低速离心破乳", ok: true, fb: "处置正确！盐析压缩双电层并拉大两相密度差，乳化层迅速聚并恢复镜面级清晰分界。" },
        { text: "C. 直接旋开活塞把中间乳化层连同有机相一起倒掉", ok: false, fb: "二次事故：大量目标有效成分富集在乳化界面层，直接弃去将造成近三成收率损失。" }
      ]
    },
    {
      id: "tlc_tailing", code: "F-06", short: "TLC 拖尾",
      title: "TLC 斑点严重拖尾 · Rf 失准无法定性", tag: "色谱吸附失衡",
      rpnBefore: 196, rpnAfter: 28, rpnDetail: "S7 × O7 × D4",
      lossMetrics: { yield: "定性失败", purity: "斑点连成彗星", risk: "误判阴性" },
      fixedMetrics: { yield: "ΔRf ≤ 0.02", purity: "圆形锐利斑点", risk: "药典合格" },
      phenomenon: "黄连/延胡索生物碱或金银花绿原酸点板展开后，UV 365 nm 下斑点向下拉出长条彗星状拖尾，与对照品斑点重叠粘连，无法读取准确 Rf 值。",
      cause: "普通硅胶 G 板表面硅羟基（Si-OH）呈微酸性，与碱性生物碱发生不可逆离子交换吸附；或酸性酚酸/羧酸在中性展开剂中部分解离（分子态与离子态并存）；或点样过浓超载。",
      remedy: "生物碱类在展开缸中加入浓氨水蒸气预饱和或改用 1% NaOH 碱化硅胶板；有机酸/黄酮类在展开剂中加入 0.5%~1% 甲酸/冰醋酸抑制解离；稀释供试品并控制点样斑径 ≤2 mm。",
      prevention: "展开缸提前 15~20 min 用滤纸衬壁饱和展开剂蒸气；点样坚持「微量多次、吹干再点」，严禁用圆珠笔划基线。",
      principle: "色谱机理：调节流动相 pH 抑制待测物电离（酸加酸、碱加碱），使分子形态单一并消除硅胶活性位点次级吸附。",
      sandboxPreset: null,
      drill: [
        { text: "A. 把点样浓度提高 5 倍让主斑点更亮更显眼", ok: false, fb: "二次事故：点样超载会彻底饱和硅胶吸附位点，彗星拖尾反而拉长 2 倍以上！" },
        { text: "B. 按「酸加酸、碱加碱」调展开剂 pH（如氨蒸气/0.5%甲酸）+ 微量点样", ok: true, fb: "处置正确！抑制待测物电离并屏蔽硅羟基吸附后，供试品斑点收拢为锐利圆形，|ΔRf| ≤ 0.02。" },
        { text: "C. 直接换纯甲醇展开把斑点强推上去", ok: false, fb: "二次事故：纯甲醇洗脱力过强，所有组分会一起冲到前沿 Rf≈1.0，完全失去分离意义。" }
      ]
    },
    {
      id: "false_meniscus", code: "F-07", short: "假液面误判",
      title: "分液/滴定假液面误判 · 误放目标层或读数偏差", tag: "操作观察失误",
      rpnBefore: 180, rpnAfter: 24, rpnDetail: "S6 × O6 × D5",
      lossMetrics: { yield: "目标层误弃", purity: "混入水/渣层", risk: "数据作废" },
      fixedMetrics: { yield: "精准分相", purity: "纯有机相回收", risk: "零误判" },
      phenomenon: "旋开分液漏斗下端活塞时液柱纹丝不动或突然喷出；或在深色提取液（如丹参/大黄）分液时，误将悬浮细渣形成的暗色假界面当成真实油水界线，导致目标有机相被误弃。",
      cause: "忘记拔开分液漏斗顶部玻璃塞（或未对准通气凹槽）导致内部形成负压挂液；深色溶剂透光率低，未确认溶剂密度上下层归属（如氯仿在下层 1.49 vs 乙酸乙酯在上层 0.90）。",
      remedy: "放液前先拔开顶部玻璃塞平衡气压；深色液分液时用强光手电从侧面斜照漏斗壁识别折射率突变线，或取 1 滴待判液滴入纯水中观察互溶/浮沉立辨水相与有机相。",
      prevention: "分液牢记「上拔塞、下放重相、上倒轻相」口诀；滴定管读数平视凹液面最低点（深色高锰酸钾液读液面最高边缘）。",
      principle: "物理光学：不同密度液相的折射率边界在侧向背光下形成清晰亮线；水滴互溶试验可 1 秒确证相属性。",
      sandboxPreset: null,
      drill: [
        { text: "A. 用洗耳球对着漏斗下口用力吹气把液体顶出来", ok: false, fb: "二次事故：倒吹气体会搅乱全部已分层液相并引发有机溶剂喷溅到面部！" },
        { text: "B. 拔开顶部玻璃塞通气，侧向强光辨界并用「1滴入水互溶法」确证相属性", ok: true, fb: "处置正确！内外气压平衡后放液顺畅可控，侧光+水滴法 100% 精准区分目标有机相与水相。" },
        { text: "C. 凭颜色深浅盲猜下层一定是目标有机层直接全接", ok: false, fb: "二次事故：乙酸乙酯（0.90）在上层而氯仿（1.49）在下层，盲猜极易把水相误当有机相收集！" }
      ]
    }
  ];

  var activeId = "polarity_mismatch";
  var isRemedied = false;
  var drillState = {}; // { branchId: { pickedIdx, ok, fb } }
  var unlockedIds = loadList(STORAGE_UNLOCKED);
  var masteredIds = loadList(STORAGE_MASTERED);

  function loadList(key) {
    try {
      var raw = localStorage.getItem(key);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (_) { return []; }
  }

  function saveList(key, list) {
    try { localStorage.setItem(key, JSON.stringify(list)); } catch (_) {}
  }

  function markUnlocked(id) {
    if (unlockedIds.indexOf(id) < 0) {
      unlockedIds.push(id);
      saveList(STORAGE_UNLOCKED, unlockedIds);
    }
  }

  function markMastered(id) {
    if (masteredIds.indexOf(id) < 0) {
      masteredIds.push(id);
      saveList(STORAGE_MASTERED, masteredIds);
    }
  }

  function buildAccidentSvg(branch, fixed) {
    var id = branch.id;
    if (id === "polarity_mismatch") {
      return (
        '<svg viewBox="0 0 260 150" width="250" height="144">' +
          '<path d="M108 16 L108 46 L72 114 C67 124 74 136 86 136 L174 136 C186 136 193 124 188 114 L152 46 L152 16 Z" fill="rgba(226,232,240,0.25)" stroke="#64748b" stroke-width="2.4"/>' +
          '<path d="M84 92 L176 92 L187 114 C191 122 185 133 174 133 L86 133 C75 133 69 122 73 114 Z" fill="' + (fixed ? "#dc2626" : "#a8a29e") + '" opacity="' + (fixed ? "0.82" : "0.75") + '"/>' +
          (fixed
            ? '<text x="130" y="112" text-anchor="middle" fill="#fff" font-size="9.2" font-weight="800">95%乙醇 · 丹红澄清</text><text x="130" y="126" text-anchor="middle" fill="#fee2e2" font-size="9.5" font-weight="900">收率 80.1%</text>'
            : '<circle cx="105" cy="124" r="4" fill="#57534e"/><circle cx="128" cy="126" r="5" fill="#44403c"/><circle cx="152" cy="123" r="4" fill="#57534e"/><text x="130" y="106" text-anchor="middle" fill="#fff" font-size="9" font-weight="800">纯水失配 · 沉淀未溶</text><text x="130" y="118" text-anchor="middle" fill="#fef3c7" font-size="9" font-weight="800">收率仅 10.1%</text>') +
          '<text x="130" y="148" text-anchor="middle" fill="' + (fixed ? "#059669" : "#be123c") + '" font-size="11" font-weight="800">' + (fixed ? "✓ 相似相溶精准匹配" : "✗ Δp 过大导致有效成分析沉") + "</text>" +
        "</svg>"
      );
    }
    if (id === "thermal_degrade") {
      return (
        '<svg viewBox="0 0 260 150" width="250" height="144">' +
          '<rect x="78" y="34" width="104" height="96" rx="14" fill="rgba(226,232,240,0.22)" stroke="#64748b" stroke-width="2.4"/>' +
          '<rect x="81" y="68" width="98" height="59" rx="10" fill="' + (fixed ? "#eab308" : "#15803d") + '" opacity="0.86"/>' +
          '<rect x="202" y="36" width="14" height="84" rx="7" fill="#e2e8f0" stroke="#64748b" stroke-width="1.5"/>' +
          '<rect x="205" y="' + (fixed ? "42" : "74") + '" width="8" height="' + (fixed ? "74" : "42") + '" rx="4" fill="' + (fixed ? "#ef4444" : "#f59e0b") + '"/>' +
          '<text x="209" y="28" text-anchor="middle" fill="#475569" font-size="10.5" font-weight="800">' + (fixed ? "100℃" : "50℃") + "</text>" +
          '<text x="130" y="102" text-anchor="middle" fill="#fff" font-size="11" font-weight="800">' + (fixed ? "沸水杀酶 · 金黄澄清" : "黄芩酶解 · 墨绿浑浊!") + "</text>" +
        "</svg>"
      );
    }
    if (id === "seal_leak") {
      return (
        '<svg viewBox="0 0 260 150" width="250" height="144">' +
          '<rect x="114" y="16" width="32" height="58" rx="8" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/>' +
          '<circle cx="130" cy="108" r="30" fill="#fef3c7" stroke="#64748b" stroke-width="2.2"/>' +
          '<path d="M104 114 Q130 106 156 114 A30 30 0 0 1 104 114 Z" fill="#f59e0b" opacity="0.8"/>' +
          (fixed
            ? '<rect x="108" y="68" width="44" height="10" rx="5" fill="#059669"/><text x="130" y="148" text-anchor="middle" fill="#059669" font-size="11" font-weight="800">✓ 磨口锁紧 + 冷凝水下进上出</text>'
            : '<g class="v26-anim-vapor"><circle cx="100" cy="64" r="6" fill="#fda4af" opacity="0.75"/><circle cx="162" cy="58" r="7" fill="#fda4af" opacity="0.7"/><circle cx="130" cy="10" r="6" fill="#fda4af" opacity="0.7"/></g><text x="130" y="148" text-anchor="middle" fill="#be123c" font-size="11" font-weight="800">✗ 磨口漏气 · 蒸汽大量逸散</text>') +
        "</svg>"
      );
    }
    if (id === "bumping_boil") {
      return (
        '<svg viewBox="0 0 260 150" width="250" height="144">' +
          '<path d="M114 14 L114 58 L82 114 C78 122 84 134 96 134 L164 134 C176 134 182 122 178 114 L146 58 L146 14 Z" fill="rgba(226,232,240,0.22)" stroke="' + (fixed ? "#059669" : "#e11d48") + '" stroke-width="2.4"/>' +
          '<path d="M92 94 L168 94 L177 114 C180 122 175 131 164 131 L96 131 C85 131 80 122 83 114 Z" fill="#d97706" opacity="0.82"/>' +
          (fixed
            ? '<circle cx="118" cy="126" r="3" fill="#475569"/><circle cx="130" cy="127" r="3" fill="#475569"/><circle cx="142" cy="126" r="3" fill="#475569"/><text x="130" y="148" text-anchor="middle" fill="#059669" font-size="11" font-weight="800">✓ 已投沸石 · 平稳微沸</text>'
            : '<g class="v26-anim-boil"><circle cx="130" cy="52" r="10" fill="#fef3c7" stroke="#f59e0b"/><circle cx="122" cy="70" r="8" fill="#fde68a"/><circle cx="140" cy="66" r="9" fill="#fef3c7"/><circle cx="130" cy="30" r="7" fill="#fecdd3"/></g><text x="130" y="148" text-anchor="middle" fill="#be123c" font-size="11" font-weight="800">✗ 过热暴沸 · 泡沫冲入冷凝管!</text>') +
        "</svg>"
      );
    }
    if (id === "emulsion_lock") {
      return (
        '<svg viewBox="0 0 260 150" width="250" height="144">' +
          '<path d="M118 14 L142 14 L142 30 C168 48 170 86 140 116 L136 134 L124 134 L120 116 C90 86 92 48 118 30 Z" fill="rgba(226,232,240,0.22)" stroke="#64748b" stroke-width="2.2"/>' +
          (fixed
            ? '<path d="M103 60 L157 60 C158 70 155 78 152 84 L108 84 C105 78 102 70 103 60 Z" fill="#f59e0b" opacity="0.82"/><path d="M108 84 L152 84 C147 96 140 106 135 114 L125 114 C120 106 113 96 108 84 Z" fill="#38bdf8" opacity="0.72"/><text x="130" y="148" text-anchor="middle" fill="#059669" font-size="11" font-weight="800">✓ NaCl 盐析破乳 · 界面清晰</text>'
            : '<path d="M103 58 L157 58 C156 82 146 100 135 114 L125 114 C114 100 104 82 103 58 Z" fill="#fef3c7" opacity="0.95"/><text x="130" y="88" text-anchor="middle" fill="#92400e" font-size="10.5" font-weight="800">顽固乳白层</text><text x="130" y="148" text-anchor="middle" fill="#be123c" font-size="11" font-weight="800">✗ 皂苷乳化 · 两相锁死</text>') +
        "</svg>"
      );
    }
    if (id === "tlc_tailing") {
      return (
        '<svg viewBox="0 0 260 150" width="250" height="144">' +
          '<rect x="78" y="14" width="104" height="120" rx="6" fill="#fffbeb" stroke="#94a3b8" stroke-width="2"/>' +
          '<line x1="84" y1="114" x2="176" y2="114" stroke="#64748b" stroke-dasharray="3 2"/>' +
          '<line x1="84" y1="28" x2="176" y2="28" stroke="#38bdf8" stroke-dasharray="3 2"/>' +
          '<circle cx="108" cy="64" r="6" fill="#059669"/>' +
          (fixed
            ? '<circle cx="152" cy="64" r="6" fill="#059669"/><text x="130" y="148" text-anchor="middle" fill="#059669" font-size="11" font-weight="800">✓ 调 pH 抑电离 · 圆形锐利斑点</text>'
            : '<ellipse cx="152" cy="84" rx="6" ry="26" fill="#e11d48" opacity="0.72"/><text x="130" y="148" text-anchor="middle" fill="#be123c" font-size="11" font-weight="800">✗ 硅胶酸性吸附 · 彗星状拖尾</text>') +
          '<text x="108" y="128" text-anchor="middle" fill="#475569" font-size="9.5">对照品</text>' +
          '<text x="152" y="128" text-anchor="middle" fill="#475569" font-size="9.5">供试品</text>' +
        "</svg>"
      );
    }
    return (
      '<svg viewBox="0 0 260 150" width="250" height="144">' +
        '<path d="M118 22 L142 22 L142 34 C168 50 170 86 140 116 L136 134 L124 134 L120 116 C90 86 92 50 118 34 Z" fill="rgba(226,232,240,0.22)" stroke="#64748b" stroke-width="2.2"/>' +
        (fixed
          ? '<rect x="152" y="12" width="18" height="10" rx="3" fill="#059669"/><text x="192" y="21" fill="#059669" font-size="9.5" font-weight="800">已拔塞通气</text><path d="M104 64 L156 64 L152 84 L108 84 Z" fill="#dc2626" opacity="0.78"/><path d="M108 84 L152 84 L136 114 L124 114 Z" fill="#38bdf8" opacity="0.7"/><text x="130" y="148" text-anchor="middle" fill="#059669" font-size="11" font-weight="800">✓ 侧光辨界 + 拔塞顺畅分相</text>'
          : '<rect x="116" y="12" width="28" height="10" rx="3" fill="#e11d48"/><text x="184" y="21" fill="#be123c" font-size="9.5" font-weight="800">未拔塞负压!</text><path d="M104 62 L156 62 L136 114 L124 114 Z" fill="#451a03" opacity="0.88"/><line x1="106" y1="78" x2="154" y2="78" stroke="#facc15" stroke-dasharray="3 2" stroke-width="2"/><text x="130" y="148" text-anchor="middle" fill="#be123c" font-size="11" font-weight="800">✗ 深色暗渣假液面 · 负压挂液</text>') +
      "</svg>"
    );
  }

  function buildReviewCardHtml(branch, fixed) {
    var metrics = fixed ? branch.fixedMetrics : branch.lossMetrics;
    var ds = drillState[branch.id] || null;
    var dropPct = Math.round(((branch.rpnBefore - branch.rpnAfter) / branch.rpnBefore) * 100);
    var isMastered = masteredIds.indexOf(branch.id) >= 0;

    return (
      '<div class="v26-stage-grid">' +
        '<div class="v26-card">' +
          '<div class="v26-sim-stage' + (fixed ? " is-remedied" : "") + '">' +
            '<div class="v26-sim-status">' +
              '<span style="font-weight:900;">' + esc(branch.code) + " · " + esc(branch.short) + (isMastered ? " 🏅" : "") + "</span>" +
              '<span class="' + (fixed ? "v26-badge-safe" : "v26-badge-danger") + '">' + (fixed ? "🟢 已执行 CAPA 补救" : "🔴 事故触发态") + "</span>" +
            "</div>" +
            buildAccidentSvg(branch, fixed) +
            '<div class="v26-metrics-strip">' +
              '<div class="v26-metric-cell"><span>收率/判定</span><strong style="color:' + (fixed ? "#059669" : "#e11d48") + ';">' + esc(metrics.yield) + "</strong></div>" +
              '<div class="v26-metric-cell"><span>表观现象</span><strong>' + esc(metrics.purity) + "</strong></div>" +
              '<div class="v26-metric-cell"><span>风险后果</span><strong>' + esc(metrics.risk) + "</strong></div>" +
            "</div>" +

            // 现场应急处置 3 选 1 决策挑战
            '<div class="v26-drill-box">' +
              '<div class="v26-drill-title"><span>⚡ 现场应急处置决策（选错触发二次事故）</span><span>' + (isMastered ? "🏅 已通关" : "待处置") + "</span></div>" +
              '<div class="v26-drill-opts">' +
                branch.drill.map(function (opt, idx) {
                  var cls = "";
                  if (ds && ds.pickedIdx === idx) cls = opt.ok ? " is-right" : " is-wrong";
                  return '<button type="button" class="v26-drill-btn' + cls + '" data-v26-drill="' + idx + '">' + esc(opt.text) + "</button>";
                }).join("") +
              "</div>" +
              (ds
                ? '<div class="v26-drill-feedback ' + (ds.ok ? "fb-right" : "fb-wrong") + '">' + (ds.ok ? "✅ " : "💥 ") + esc(ds.fb) + "</div>"
                : "") +
            "</div>" +

            '<div class="v26-sim-actions">' +
              (fixed
                ? '<button type="button" class="v26-btn-accident" data-v26-toggle="accident">↩ 重现事故现场</button>'
                : '<button type="button" class="v26-btn-remedy" data-v26-toggle="remedy">🛠️ 直接演示 CAPA 补救</button>') +
              (branch.sandboxPreset
                ? '<button type="button" class="v26-btn-accident" data-v26-jump-sandbox="' + branch.sandboxPreset + '">🧪 在自由配方沙盒复现</button>'
                : "") +
            "</div>" +
          "</div>" +
        "</div>" +

        '<div class="v26-card">' +
          '<div class="v26-review-head">' +
            '<div>' +
              '<div style="font-size:15.5px;font-weight:900;">📋 事故复盘卡：' + esc(branch.title) + "</div>" +
              '<div style="font-size:12px;color:#64748b;margin-top:2px;">标准 FMEA / CAPA 闭环教学：现象 → 原因 → 补救 → 预防</div>' +
            "</div>" +
            '<button type="button" class="v26-btn-accident v26-btn-capa" data-v26-copy-capa="1">📋 复制 CAPA 复盘单</button>' +
          "</div>" +

          '<div class="v26-rpn-bar">' +
            '<span>FMEA 风险优先级（' + esc(branch.rpnDetail) + '）：<strong>RPN ' + branch.rpnBefore + '</strong> → CAPA 后降至 <strong>' + branch.rpnAfter + '</strong></span>' +
            '<span class="v26-rpn-drop">风险降低 ↓' + dropPct + '%</span>' +
          "</div>" +

          '<div class="v26-four-grid">' +
            '<div class="v26-step-card st-phenom"><h4>① 异常现象（Phenomenon）</h4><p>' + esc(branch.phenomenon) + "</p></div>" +
            '<div class="v26-step-card st-cause"><h4>② 根因剖析（Root Cause）</h4><p>' + esc(branch.cause) + "</p></div>" +
            '<div class="v26-step-card st-remedy"><h4>③ 现场补救（CAPA Remedy）</h4><p>' + esc(branch.remedy) + "</p></div>" +
            '<div class="v26-step-card st-prev"><h4>④ 源头预防（Prevention）</h4><p>' + esc(branch.prevention) + "</p></div>" +
          "</div>" +
          '<div class="v26-eq-strip">' + esc(branch.principle) + "</div>" +
        "</div>" +
      "</div>"
    );
  }

  function bindInteractiveEvents(rootEl, branch, rerenderFn) {
    rootEl.querySelectorAll("[data-v26-drill]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = Number(this.getAttribute("data-v26-drill"));
        var opt = branch.drill[idx];
        if (!opt) return;
        drillState[branch.id] = { pickedIdx: idx, ok: !!opt.ok, fb: opt.fb };
        if (opt.ok) {
          isRemedied = true;
          markMastered(branch.id);
        } else {
          isRemedied = false;
        }
        rerenderFn();
      });
    });

    rootEl.querySelectorAll("[data-v26-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        isRemedied = this.getAttribute("data-v26-toggle") === "remedy";
        rerenderFn();
      });
    });

    rootEl.querySelectorAll("[data-v26-copy-capa]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var txt = [
          "【本草智研 · FMEA / CAPA 实验事故复盘单】",
          "编号与名称：" + branch.code + " " + branch.title,
          "FMEA 风险降幅：RPN " + branch.rpnBefore + " (" + branch.rpnDetail + ") → CAPA 后 " + branch.rpnAfter,
          "① 异常现象：" + branch.phenomenon,
          "② 根因剖析：" + branch.cause,
          "③ 现场补救：" + branch.remedy,
          "④ 源头预防：" + branch.prevention,
          branch.principle
        ].join("\n");
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(txt).catch(function () {});
        }
        if (window.TCM_LAB_API && typeof window.TCM_LAB_API.showToast === "function") {
          window.TCM_LAB_API.showToast("已复制 " + branch.code + " CAPA 复盘单到剪贴板！");
        } else {
          btn.textContent = "✅ 已复制复盘单";
          setTimeout(function () { btn.textContent = "📋 复制 CAPA 复盘单"; }, 1800);
        }
      });
    });

    rootEl.querySelectorAll("[data-v26-jump-sandbox]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var presetId = this.getAttribute("data-v26-jump-sandbox");
        closeModal();
        var formulaTab = document.querySelector('[data-v16-diy-tab="formula"]');
        if (formulaTab) formulaTab.click();
        setTimeout(function () {
          var pBtn = document.querySelector('[data-v25-preset="' + presetId + '"]');
          if (pBtn) pBtn.click();
        }, 80);
      });
    });
  }

  function renderInto(container) {
    if (!container) return;
    markUnlocked(activeId);
    var branch = FAILURE_BRANCHES.find(function (b) { return b.id === activeId; }) || FAILURE_BRANCHES[0];
    var pct = Math.round((masteredIds.length / FAILURE_BRANCHES.length) * 100);

    container.innerHTML =
      '<div class="v26-shell">' +
        '<div class="v26-top-strip">' +
          '<div>' +
            '<div style="font-size:15px;font-weight:900;">现代本草 7 大经典失败分支实验室（FMEA / CAPA 应急处置实训）</div>' +
            '<div style="font-size:12px;color:#64748b;margin-top:2px;">先观察事故现场，再完成「现场应急 3 选 1」决策——选错会触发二次事故警示，选对立即演示 CAPA 修复并点亮通关勋章。</div>' +
          "</div>" +
          '<div class="v26-progress-wrap">' +
            '<span class="v26-stat-pill">图鉴浏览 ' + unlockedIds.length + "/" + FAILURE_BRANCHES.length + "</span>" +
            '<span class="v26-stat-pill is-gold">实战通关 ' + masteredIds.length + "/" + FAILURE_BRANCHES.length + "</span>" +
            '<div class="v26-progress-track"><div class="v26-progress-fill" style="width:' + pct + '%;"></div></div>' +
          "</div>" +
        "</div>" +

        '<div class="v26-branch-grid">' +
          FAILURE_BRANCHES.map(function (b) {
            var act = b.id === activeId;
            var mast = masteredIds.indexOf(b.id) >= 0;
            var seen = unlockedIds.indexOf(b.id) >= 0;
            return (
              '<button type="button" class="v26-branch-tab' + (act ? " is-active" : "") + (act && isRemedied ? " is-remedied" : "") + '" data-v26-branch="' + b.id + '">' +
                '<span class="v26-tab-head"><span>' + esc(b.short) + "</span><span>" + (mast ? "🏅" : seen ? "✓" : "○") + "</span></span>" +
                '<span class="v26-tab-sub">' + esc(b.code) + " · " + esc(b.tag) + "</span>" +
              "</button>"
            );
          }).join("") +
        "</div>" +

        buildReviewCardHtml(branch, isRemedied) +
      "</div>";

    container.querySelectorAll("[data-v26-branch]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeId = this.getAttribute("data-v26-branch");
        isRemedied = false;
        renderInto(container);
      });
    });

    bindInteractiveEvents(container, branch, function () { renderInto(container); });
  }

  function ensureModal() {
    var modal = document.getElementById("tcmV26FailureModal");
    if (modal) return modal;
    modal = document.createElement("div");
    modal.id = "tcmV26FailureModal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
    document.body.appendChild(modal);
    return modal;
  }

  function closeModal() {
    var modal = document.getElementById("tcmV26FailureModal");
    if (modal) modal.classList.remove("open");
  }

  function openReviewModal(branchId) {
    var branch = FAILURE_BRANCHES.find(function (b) { return b.id === branchId; }) || FAILURE_BRANCHES[0];
    activeId = branch.id;
    isRemedied = false;
    markUnlocked(branch.id);
    var modal = ensureModal();

    function renderModal() {
      modal.innerHTML =
        '<div class="v26-modal-box">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">' +
            '<div style="font-size:16px;font-weight:900;">🚨 失败分支触发 · ' + esc(branch.code) + " " + esc(branch.short) + "</div>" +
            '<button type="button" id="v26CloseModalBtn" style="border:1px solid currentColor;opacity:0.85;background:transparent;color:inherit;border-radius:999px;padding:4px 12px;font-weight:800;cursor:pointer;">关闭 ×</button>' +
          "</div>" +
          buildReviewCardHtml(branch, isRemedied) +
        "</div>";
      modal.querySelector("#v26CloseModalBtn").addEventListener("click", closeModal);
      bindInteractiveEvents(modal, branch, renderModal);
    }

    renderModal();
    modal.classList.add("open");
  }

  function matchFailureFromSandbox(res) {
    if (!res) return null;
    if (res.phenomenon && res.phenomenon.boilDanger) return "bumping_boil";
    if (res.phenomenon && res.phenomenon.foam) return "emulsion_lock";
    if (res.polarityScore < 50) return "polarity_mismatch";
    if (res.thermalScore < 65) return "thermal_degrade";
    if (res.rigScore < 55) return "seal_leak";
    return null;
  }

  window.TCM_V26_FAILURE_BRANCHES = {
    version: "2.0.0-drill",
    render: function (targetEl) {
      var el = targetEl || document.getElementById("v16DiyFailurePage");
      renderInto(el);
    },
    openReview: openReviewModal,
    closeReview: closeModal,
    matchFromSandbox: matchFailureFromSandbox,
    getStats: function () {
      return {
        version: "2.0.0-drill",
        totalBranches: FAILURE_BRANCHES.length,
        unlockedCount: unlockedIds.length,
        masteredCount: masteredIds.length,
        activeId: activeId,
        isRemedied: isRemedied
      };
    }
  };
})();
