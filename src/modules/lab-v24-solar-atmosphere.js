/**
 * 本草智研 v24 · 1.10 天气与节气氛围系统（新中式沉浸版）
 * - 覆盖全部 24 节气与 6 大标志性氛围主题（立春 / 谷雨 / 夏至 / 白露 / 霜降 / 小雪）
 * - 按当前公历日期自动切换节气、配色、新中式水墨插画、天气微粒子与节气药材化学推荐
 * - 支持一键切换代表节气、前后遍历 24 节气、恢复今日自动匹配，以及折叠/展开
 * - 药材推荐位直连药材题库搜索与 3D 分子结构库（window.TCM_V20_VISUALS）
 */
(function () {
  "use strict";

  var STORAGE_COLLAPSED = "tcm_v24_solar_collapsed_v1";

  // 6 大代表性节气氛围视觉体系（配色 + 天气粒子 + 诗意物候 + 新中式水墨 SVG 插画）
  var ATMOSPHERES = {
    spring: {
      key: "spring",
      label: "立春 · 柳芽初暖",
      weather: "春风飞瓣",
      particleKind: "petal",
      particleCount: 10,
      svg:
        '<svg viewBox="0 0 340 160" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<circle cx="272" cy="46" r="24" fill="#fde68a" fill-opacity="0.52"/>' +
          '<path d="M90 160 C138 112 186 106 238 124 C274 136 306 112 340 94 L340 160 Z" fill="#10b981" fill-opacity="0.13"/>' +
          '<path d="M150 160 C198 124 252 128 340 112 L340 160 Z" fill="#0f766e" fill-opacity="0.16"/>' +
          '<path d="M336 16 C284 30 248 56 212 96" stroke="#0f766e" stroke-width="2" stroke-opacity="0.38" stroke-linecap="round"/>' +
          '<ellipse cx="268" cy="44" rx="7" ry="3.5" transform="rotate(-24 268 44)" fill="#34d399" fill-opacity="0.72"/>' +
          '<ellipse cx="244" cy="64" rx="6.5" ry="3.2" transform="rotate(-36 244 64)" fill="#10b981" fill-opacity="0.62"/>' +
          '<circle cx="222" cy="84" r="4" fill="#fb7185" fill-opacity="0.65"/>' +
          '<circle cx="288" cy="30" r="3.5" fill="#fda4af" fill-opacity="0.7"/>' +
        "</svg>"
    },
    rain: {
      key: "rain",
      label: "谷雨 · 烟雨润茶",
      weather: "江南细雨",
      particleKind: "rain",
      particleCount: 14,
      svg:
        '<svg viewBox="0 0 340 160" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M72 160 C128 96 190 92 252 118 C288 134 316 108 340 92 L340 160 Z" fill="#0e7490" fill-opacity="0.13"/>' +
          '<path d="M148 160 C212 114 272 118 340 100 L340 160 Z" fill="#0891b2" fill-opacity="0.17"/>' +
          '<ellipse cx="260" cy="42" rx="44" ry="12" fill="#bae6fd" fill-opacity="0.36"/>' +
          '<ellipse cx="294" cy="54" rx="34" ry="10" fill="#e0f2fe" fill-opacity="0.30"/>' +
          '<line x1="230" y1="54" x2="218" y2="96" stroke="#0284c7" stroke-opacity="0.32" stroke-width="1.3" stroke-linecap="round"/>' +
          '<line x1="258" y1="60" x2="246" y2="108" stroke="#0284c7" stroke-opacity="0.28" stroke-width="1.3" stroke-linecap="round"/>' +
          '<line x1="286" y1="56" x2="274" y2="102" stroke="#0284c7" stroke-opacity="0.30" stroke-width="1.3" stroke-linecap="round"/>' +
          '<line x1="312" y1="62" x2="300" y2="106" stroke="#0284c7" stroke-opacity="0.25" stroke-width="1.2" stroke-linecap="round"/>' +
        "</svg>"
    },
    summer: {
      key: "summer",
      label: "夏至 · 荷风晴昼",
      weather: "流萤微光",
      particleKind: "firefly",
      particleCount: 10,
      svg:
        '<svg viewBox="0 0 340 160" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<circle cx="286" cy="40" r="26" fill="#fbbf24" fill-opacity="0.36"/>' +
          '<circle cx="286" cy="40" r="16" fill="#f59e0b" fill-opacity="0.44"/>' +
          '<path d="M110 160 C176 118 242 126 340 106 L340 160 Z" fill="#047857" fill-opacity="0.15"/>' +
          '<ellipse cx="242" cy="128" rx="38" ry="13" fill="#059669" fill-opacity="0.28"/>' +
          '<path d="M242 128 L256 116" stroke="#ffffff" stroke-opacity="0.4" stroke-width="1.2"/>' +
          '<path d="M294 114 C288 94 294 84 300 94 C306 84 312 94 306 114 Z" fill="#fb7185" fill-opacity="0.62"/>' +
          '<path d="M300 114 L300 144" stroke="#047857" stroke-opacity="0.4" stroke-width="1.5"/>' +
        "</svg>"
    },
    dew: {
      key: "dew",
      label: "白露 · 玉露清秋",
      weather: "清露浮岚",
      particleKind: "dew",
      particleCount: 10,
      svg:
        '<svg viewBox="0 0 340 160" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<circle cx="276" cy="42" r="22" fill="#e0f2fe" fill-opacity="0.62"/>' +
          '<path d="M88 160 C150 110 218 118 340 96 L340 160 Z" fill="#3b82f6" fill-opacity="0.11"/>' +
          '<path d="M164 160 C226 124 282 126 340 114 L340 160 Z" fill="#1d4ed8" fill-opacity="0.14"/>' +
          '<path d="M244 148 Q254 96 276 66" stroke="#2563eb" stroke-opacity="0.34" stroke-width="1.6" fill="none"/>' +
          '<circle cx="276" cy="66" r="4.5" fill="#38bdf8" fill-opacity="0.72"/>' +
          '<circle cx="256" cy="96" r="3.2" fill="#7dd3fc" fill-opacity="0.75"/>' +
        "</svg>"
    },
    frost: {
      key: "frost",
      label: "霜降 · 丹枫染林",
      weather: "秋枫飘叶",
      particleKind: "leaf",
      particleCount: 10,
      svg:
        '<svg viewBox="0 0 340 160" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<circle cx="282" cy="46" r="24" fill="#fdba74" fill-opacity="0.45"/>' +
          '<path d="M92 160 C152 106 214 114 340 92 L340 160 Z" fill="#ea580c" fill-opacity="0.13"/>' +
          '<path d="M168 160 C230 120 286 124 340 110 L340 160 Z" fill="#b45309" fill-opacity="0.16"/>' +
          '<path d="M336 22 C288 34 252 60 220 96" stroke="#9a3412" stroke-opacity="0.38" stroke-width="2" stroke-linecap="round"/>' +
          '<ellipse cx="268" cy="48" rx="8" ry="4" transform="rotate(-22 268 48)" fill="#ea580c" fill-opacity="0.72"/>' +
          '<ellipse cx="242" cy="70" rx="7" ry="3.8" transform="rotate(18 242 70)" fill="#f59e0b" fill-opacity="0.74"/>' +
          '<ellipse cx="294" cy="36" rx="6.5" ry="3.5" transform="rotate(-35 294 36)" fill="#dc2626" fill-opacity="0.65"/>' +
        "</svg>"
    },
    winter: {
      key: "winter",
      label: "小雪 · 寒梅映雪",
      weather: "素雪微扬",
      particleKind: "snow",
      particleCount: 14,
      svg:
        '<svg viewBox="0 0 340 160" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<circle cx="280" cy="42" r="22" fill="#e0f2fe" fill-opacity="0.56"/>' +
          '<path d="M84 160 C142 108 208 112 340 94 L340 160 Z" fill="#0284c7" fill-opacity="0.11"/>' +
          '<path d="M164 160 C226 122 284 126 340 112 L340 160 Z" fill="#1e3a8a" fill-opacity="0.13"/>' +
          '<path d="M336 28 C286 38 254 62 222 92" stroke="#334155" stroke-opacity="0.42" stroke-width="2" stroke-linecap="round"/>' +
          '<circle cx="266" cy="48" r="4.2" fill="#f43f5e" fill-opacity="0.72"/>' +
          '<circle cx="244" cy="68" r="3.6" fill="#fb7185" fill-opacity="0.68"/>' +
          '<circle cx="292" cy="38" r="3.2" fill="#f43f5e" fill-opacity="0.62"/>' +
          '<circle cx="212" cy="44" r="2.2" fill="#ffffff" fill-opacity="0.8"/>' +
          '<circle cx="236" cy="30" r="1.8" fill="#bae6fd" fill-opacity="0.8"/>' +
        "</svg>"
    }
  };

  // 24 节气完整历表 + 化学成分与工艺推荐映射
  var SOLAR_TERMS = [
    { name: "小寒", month: 1, day: 5, atmo: "winter", poem: "初冬严寒 · 温里散寒", note: "宜练温里药挥发油水蒸气蒸馏与密闭回流工艺。",
      herbs: [{ name: "干姜", cls: "挥发油/姜辣素", tech: "水蒸气蒸馏 · 姜烯/6-姜酚" }, { name: "肉桂", cls: "芳香醛", tech: "共沸蒸馏 · 桂皮醛提取" }] },
    { name: "大寒", month: 1, day: 20, atmo: "winter", poem: "岁暮大寒 · 温阳固本", note: "聚焦发散风寒药材中生物碱与挥发油的分离质控。",
      herbs: [{ name: "麻黄", cls: "生物碱", tech: "碱化蒸馏 · 麻黄碱精制" }, { name: "干姜", cls: "挥发油", tech: "连续回流 · 姜辣素定量" }] },
    { name: "立春", month: 2, day: 4, atmo: "spring", poem: "东风解冻 · 疏肝升发", note: "春季主升发，优选薄荷、柴胡开展挥发油提取与皂苷纯化训练。",
      herbs: [{ name: "薄荷", cls: "单萜挥发油", tech: "水蒸气蒸馏 · 薄荷脑析晶", molKey: "menthol" }, { name: "柴胡", cls: "三萜皂苷", tech: "稀醇提取 · 柴胡皂苷富集" }] },
    { name: "雨水", month: 2, day: 19, atmo: "rain", poem: "好雨知时 · 健脾化湿", note: "春雨渐多，重点演练多糖水提醇沉与挥发油提取对照。",
      herbs: [{ name: "茯苓", cls: "真菌多糖", tech: "热水浸提 · 醇沉脱蛋白" }, { name: "白术", cls: "倍半萜内酯", tech: "乙醇回流 · 白术内酯质控" }] },
    { name: "惊蛰", month: 3, day: 5, atmo: "spring", poem: "春雷始鸣 · 清热疏风", note: "春季风温初起，推荐绿原酸低温微酸超声提取以防邻二酚褐变。",
      herbs: [{ name: "金银花", cls: "苯丙素酚酸", tech: "40℃微酸超声 · 绿原酸保真", molKey: "chlorogenic" }, { name: "连翘", cls: "木脂素苷", tech: "70%乙醇回流 · 连翘苷" }] },
    { name: "春分", month: 3, day: 20, atmo: "spring", poem: "昼夜均分 · 平肝明目", note: "气血平和之时，适合演练黄酮分级萃取与紫外光谱特征解析。",
      herbs: [{ name: "菊花", cls: "黄酮类", tech: "稀醇超声 · 木犀草苷定量" }, { name: "薄荷", cls: "挥发油", tech: "共沸蒸馏 · 薄荷脑精制", molKey: "menthol" }] },
    { name: "清明", month: 4, day: 4, atmo: "rain", poem: "气清景明 · 芳草萋萋", note: "清明时节芳香药材挥发油饱满，适合开展得率核算与装置对比。",
      herbs: [{ name: "艾叶", cls: "挥发油", tech: "水蒸气蒸馏 · 桉油精测定" }, { name: "茵陈", cls: "香豆素/酚酸", tech: "微酸提取 · 绿原酸质控", molKey: "chlorogenic" }] },
    { name: "谷雨", month: 4, day: 20, atmo: "rain", poem: "雨生百谷 · 润物采药", note: "谷雨润泽根茎，重点演练丹参脂溶性丹参酮避光回流与水溶性丹酚酸双提。",
      herbs: [{ name: "丹参", cls: "邻菲醌类", tech: "95%乙醇避光回流 · 丹参酮IIA", molKey: "tanshinone" }, { name: "牡丹皮", cls: "酚苷/苯乙酮", tech: "水蒸气蒸馏 · 丹皮酚结晶" }] },
    { name: "立夏", month: 5, day: 5, atmo: "summer", poem: "万物繁茂 · 清心泻火", note: "入夏湿热渐生，经典酸水提取—石灰乳除杂—盐析精制小檗碱。",
      herbs: [{ name: "黄连", cls: "异喹啉季铵碱", tech: "酸水渗漉盐析 · 盐酸小檗碱", molKey: "berberine" }, { name: "黄柏", cls: "生物碱", tech: "酸水提取 · 小檗碱盐析", molKey: "berberine" }] },
    { name: "小满", month: 5, day: 21, atmo: "summer", poem: "物致于此 · 清热利湿", note: "聚焦生物碱酸碱成盐萃取与异黄酮大孔树脂纯化工艺。",
      herbs: [{ name: "苦参", cls: "喹诺里西啶碱", tech: "酸水提取 · 苦参碱氯仿萃取" }, { name: "葛根", cls: "异黄酮", tech: "70%乙醇回流 · 葛根素结晶" }] },
    { name: "芒种", month: 6, day: 5, atmo: "summer", poem: "仲夏芳菲 · 芳香化浊", note: "湿气上蒸，对比挥发油蒸馏与厚朴酚脂溶性提取差异。",
      herbs: [{ name: "广藿香", cls: "倍半萜醇", tech: "挥发油提取器 · 百秋李醇" }, { name: "厚朴", cls: "木脂素", tech: "碱提酸沉 · 厚朴酚/和厚朴酚" }] },
    { name: "夏至", month: 6, day: 21, atmo: "summer", poem: "日长之至 · 杀酶保苷", note: "盛夏高温易致苷类酶解变绿，重点训练黄芩沸水投药瞬时杀酶保苷。",
      herbs: [{ name: "黄芩", cls: "黄酮葡萄糖醛酸苷", tech: "沸水杀酶酸沉 · 黄芩苷", molKey: "baicalin" }, { name: "金银花", cls: "苯丙素酚酸", tech: "低温超声 · 绿原酸提取", molKey: "chlorogenic" }] },
    { name: "小暑", month: 7, day: 7, atmo: "summer", poem: "暑气初盛 · 解表清暑", note: "热敏性挥发油与酚酸提取需严控温度上限，防止挥散与氧化。",
      herbs: [{ name: "紫苏叶", cls: "挥发油", tech: "温和蒸馏 · 紫苏醛保护" }, { name: "薄荷", cls: "单萜醇", tech: "冷冻析晶 · 左旋薄荷脑", molKey: "menthol" }] },
    { name: "大暑", month: 7, day: 22, atmo: "summer", poem: "烈日炎炎 · 凉血止血", note: "演练槐米芦丁碱提酸沉精制与酸水解制备槲皮素苷元全流程。",
      herbs: [{ name: "槐米", cls: "黄酮醇苷", tech: "碱提酸沉水解 · 芦丁→槲皮素", molKey: "quercetin" }, { name: "黄芩", cls: "黄酮苷", tech: "沸水杀酶保苷 · 黄芩苷", molKey: "baicalin" }] },
    { name: "立秋", month: 8, day: 7, atmo: "dew", poem: "凉风至 · 养阴润燥", note: "秋燥渐起，重点训练麦冬多糖与甘草三萜皂苷的泡沫控制及纯化。",
      herbs: [{ name: "麦冬", cls: "甾体皂苷/多糖", tech: "水提醇沉 · 麦冬多糖精制" }, { name: "甘草", cls: "三萜皂苷", tech: "氨水浸提酸沉 · 甘草酸" }] },
    { name: "处暑", month: 8, day: 23, atmo: "dew", poem: "暑气至此而止", note: "聚焦皂苷起泡溶血特性检识与大孔树脂梯度洗脱分离。",
      herbs: [{ name: "桔梗", cls: "三萜皂苷", tech: "乙醇提取 · 桔梗皂苷D富集" }, { name: "甘草", cls: "三萜皂苷", tech: "酸沉精制 · 甘草酸铵" }] },
    { name: "白露", month: 9, day: 7, atmo: "dew", poem: "白露为霜 · 润肺清金", note: "露凝而白，演练银杏叶黄酮苷元提取与苦杏仁氰苷酶解防失活。",
      herbs: [{ name: "银杏叶", cls: "黄酮醇/内酯", tech: "稀醇提取树脂纯化 · 槲皮素", molKey: "quercetin" }, { name: "苦杏仁", cls: "氰苷类", tech: "沸水杀酶 · 苦杏仁苷提取" }] },
    { name: "秋分", month: 9, day: 23, atmo: "dew", poem: "金风玉露 · 硕果采收", note: "秋分采收果皮与银杏叶，对比橙皮苷与槲皮素的极性及溶解度。",
      herbs: [{ name: "陈皮", cls: "二氢黄酮苷", tech: "石灰水碱提酸沉 · 橙皮苷" }, { name: "银杏叶", cls: "黄酮醇", tech: "Al³⁺荧光显色 · 槲皮素", molKey: "quercetin" }] },
    { name: "寒露", month: 10, day: 8, atmo: "frost", poem: "露气寒冷 · 活血通络", note: "深秋采挖丹参根茎，对照脂溶性丹参酮与川芎挥发油回流工艺。",
      herbs: [{ name: "丹参", cls: "邻菲醌类", tech: "95%乙醇回流 · 丹参酮IIA", molKey: "tanshinone" }, { name: "川芎", cls: "酚酸/苯酞", tech: "乙醇回流 · 阿魏酸提取" }] },
    { name: "霜降", month: 10, day: 23, atmo: "frost", poem: "霜叶红于二月花", note: "霜后根皮类药材有效成分累积达峰，适合对比生物碱与黄酮工艺。",
      herbs: [{ name: "黄连", cls: "异喹啉生物碱", tech: "酸水盐析精制 · 小檗碱", molKey: "berberine" }, { name: "槐米", cls: "黄酮醇", tech: "碱提酸沉 · 芦丁/槲皮素", molKey: "quercetin" }] },
    { name: "立冬", month: 11, day: 7, atmo: "winter", poem: "水始冰 · 补气固表", note: "冬藏补益季，演练黄芪甲苷与人参皂苷的大孔树脂富集工艺。",
      herbs: [{ name: "黄芪", cls: "三萜皂苷", tech: "醇提大孔树脂 · 黄芪甲苷" }, { name: "人参", cls: "达玛烷皂苷", tech: "70%乙醇回流 · 人参皂苷Rg1" }] },
    { name: "小雪", month: 11, day: 22, atmo: "winter", poem: "虹藏不见 · 温经散寒", note: "小雪初寒，推荐当归、肉桂开展挥发油共沸蒸馏与回流提取工艺设计。",
      herbs: [{ name: "当归", cls: "苯酞挥发油", tech: "水蒸气蒸馏/回流 · 藁本内酯" }, { name: "丹参", cls: "邻菲醌类", tech: "95%乙醇回流 · 丹参酮IIA", molKey: "tanshinone" }] },
    { name: "大雪", month: 12, day: 7, atmo: "winter", poem: "仲冬大雪 · 游离结合分提", note: "重点演练大黄游离蒽醌与结合型蒽醌苷的 pH 梯度萃取分离。",
      herbs: [{ name: "大黄", cls: "蒽醌类", tech: "pH梯度萃取 · 大黄酸/大黄素" }, { name: "杜仲", cls: "苯丙素/木脂素", tech: "微酸超声 · 绿原酸提取", molKey: "chlorogenic" }] },
    { name: "冬至", month: 12, day: 21, atmo: "winter", poem: "一阳复始 · 炮制增效", note: "冬至进补与炮制对照，演练醋炙延胡索生物碱成盐增溶机理。",
      herbs: [{ name: "延胡索", cls: "叔胺生物碱", tech: "醋炙成盐增溶 · 延胡索乙素" }, { name: "黄连", cls: "季铵生物碱", tech: "酸提盐析 · 小檗碱质控", molKey: "berberine" }] }
  ];

  // 顶部一键直达的 6 大代表节气（覆盖全部 6 种氛围主题）
  var QUICK_TERM_NAMES = ["立春", "谷雨", "夏至", "白露", "霜降", "小雪"];

  var currentIndex = 0;
  var activeDate = new Date();
  var isManualOverride = false;
  var isCollapsed = false;

  function detectTermIndexByDate(date) {
    var d = date instanceof Date && !isNaN(date.getTime()) ? date : new Date();
    var md = (d.getMonth() + 1) * 100 + d.getDate();
    var bestIdx = SOLAR_TERMS.length - 1;
    var bestMd = -1;
    for (var i = 0; i < SOLAR_TERMS.length; i++) {
      var tMd = SOLAR_TERMS[i].month * 100 + SOLAR_TERMS[i].day;
      if (tMd <= md && tMd > bestMd) {
        bestMd = tMd;
        bestIdx = i;
      }
    }
    return bestIdx;
  }

  function findTermIndexByName(name) {
    for (var i = 0; i < SOLAR_TERMS.length; i++) {
      if (SOLAR_TERMS[i].name === name) return i;
    }
    return -1;
  }

  function jumpToBankWithHerb(herbName) {
    if (!window.TCM_V16_PORTAL || typeof window.TCM_V16_PORTAL.go !== "function") return;
    window.TCM_V16_PORTAL.go("bank");
    setTimeout(function () {
      var inp = document.getElementById("v16BankSearch");
      if (!inp) return;
      inp.value = herbName;
      inp.dispatchEvent(new Event("input", { bubbles: true }));
      inp.focus();
    }, 80);
  }

  function openMol3d(molKey) {
    if (window.TCM_V20_VISUALS && typeof window.TCM_V20_VISUALS.openMol3d === "function") {
      window.TCM_V20_VISUALS.openMol3d(molKey);
    }
  }

  function buildParticlesHtml(atmo) {
    var html = "";
    var count = atmo.particleCount || 10;
    for (var i = 0; i < count; i++) {
      var left = Math.round(6 + (i * 89) / count + ((i * 17) % 9));
      var dur = (atmo.particleKind === "rain" ? 1.4 + (i % 4) * 0.25 : 5.2 + (i % 5) * 1.1).toFixed(2);
      var delay = (-((i * 0.73) % 5)).toFixed(2);
      var drift = ((i % 2 === 0 ? 1 : -1) * (16 + (i * 7) % 28)) + "px";
      var op = (0.38 + (i % 4) * 0.12).toFixed(2);
      html +=
        '<span class="v24-particle kind-' + atmo.particleKind + '" style="' +
          "--px:" + left + "%;--pd:" + dur + "s;--pdelay:" + delay + "s;--pdrift:" + drift + ";--po:" + op + ';"></span>';
    }
    return html;
  }

  function ensureAuraLayer() {
    if (!document.getElementById("tcmSolarPageAura")) {
      var aura = document.createElement("div");
      aura.id = "tcmSolarPageAura";
      aura.setAttribute("aria-hidden", "true");
      document.body.insertBefore(aura, document.body.firstChild);
    }
  }

  function applyAtmosphereToBody(term) {
    var atmo = ATMOSPHERES[term.atmo] || ATMOSPHERES.spring;
    document.body.setAttribute("data-tcm-solar", atmo.key);
    document.body.setAttribute("data-tcm-solar-term", term.name);
  }

  function renderBannerContent(banner) {
    var term = SOLAR_TERMS[currentIndex];
    var atmo = ATMOSPHERES[term.atmo] || ATMOSPHERES.spring;
    applyAtmosphereToBody(term);

    banner.classList.toggle("is-collapsed", isCollapsed);

    var quickChipsHtml = QUICK_TERM_NAMES.map(function (qName) {
      var isAct = term.name === qName;
      return '<button type="button" class="v24-term-chip' + (isAct ? " is-active" : "") + '" data-v24-term="' + qName + '">' + qName + "</button>";
    }).join("");

    var dateLabel = isManualOverride
      ? "手动预览 · " + term.month + "月" + term.day + "日起"
      : "今日自动匹配 · " + (activeDate.getMonth() + 1) + "月" + activeDate.getDate() + "日";

    var herbsHtml = term.herbs.map(function (h) {
      var molBtn = h.molKey
        ? '<button type="button" class="v24-herb-mol" data-v24-mol="' + h.molKey + '" title="查看 3D 分子结构">3D</button>'
        : "";
      return (
        '<div class="v24-herb-card">' +
          '<div class="v24-herb-info">' +
            '<div class="v24-herb-name">' + h.name + '<span class="v24-herb-class">' + h.cls + "</span></div>" +
            '<div class="v24-herb-meta">' + h.tech + "</div>" +
          "</div>" +
          '<div class="v24-herb-actions">' +
            molBtn +
            '<button type="button" class="v24-herb-go" data-v24-herb="' + h.name + '">进题库 ↗</button>' +
          "</div>" +
        "</div>"
      );
    }).join("");

    var resetBtnHtml = isManualOverride
      ? '<button type="button" class="v24-term-chip" data-v24-act="today" title="恢复今日自动节气">回今日</button>'
      : "";

    var bodyHtml = isCollapsed
      ? ""
      : '<div class="v24-solar-body">' +
          '<div class="v24-solar-brief">' +
            '<div class="v24-solar-theme-name">' + atmo.label + " · " + atmo.weather + "</div>" +
            '<p class="v24-solar-desc">' + term.note + "</p>" +
          "</div>" +
          '<div class="v24-herb-grid">' + herbsHtml + "</div>" +
        "</div>";

    banner.innerHTML =
      '<div class="v24-solar-art" aria-hidden="true">' + atmo.svg + "</div>" +
      '<div class="v24-solar-particles" aria-hidden="true">' + buildParticlesHtml(atmo) + "</div>" +
      '<div class="v24-solar-inner">' +
        '<div class="v24-solar-top">' +
          '<div class="v24-solar-title-group">' +
            '<span class="v24-solar-seal">节气 · ' + term.name + "</span>" +
            '<span class="v24-solar-poem">' + term.poem + "</span>" +
            '<span class="v24-solar-date-badge">' + dateLabel + "</span>" +
          "</div>" +
          '<div class="v24-solar-controls">' +
            quickChipsHtml +
            resetBtnHtml +
            '<button type="button" class="v24-mini-btn" data-v24-act="prev" title="上一节气">‹</button>' +
            '<button type="button" class="v24-mini-btn" data-v24-act="next" title="下一节气">›</button>' +
            '<button type="button" class="v24-mini-btn" data-v24-act="collapse" title="' + (isCollapsed ? "展开节气推荐" : "收起节气推荐") + '">' + (isCollapsed ? "+" : "−") + "</button>" +
          "</div>" +
        "</div>" +
        bodyHtml +
      "</div>";
  }

  function mountSolarBanner() {
    ensureAuraLayer();
    var existing = document.getElementById("tcmV24SolarBanner");
    if (existing) {
      renderBannerContent(existing);
      return existing;
    }

    var banner = document.createElement("section");
    banner.id = "tcmV24SolarBanner";
    banner.className = "no-print";
    banner.setAttribute("aria-label", "节气氛围与节气药材推荐");

    banner.addEventListener("click", function (e) {
      var termBtn = e.target.closest("[data-v24-term]");
      if (termBtn) {
        var idx = findTermIndexByName(termBtn.getAttribute("data-v24-term"));
        if (idx >= 0) {
          currentIndex = idx;
          isManualOverride = true;
          renderBannerContent(banner);
        }
        return;
      }
      var herbBtn = e.target.closest("[data-v24-herb]");
      if (herbBtn) {
        jumpToBankWithHerb(herbBtn.getAttribute("data-v24-herb") || "");
        return;
      }
      var molBtn = e.target.closest("[data-v24-mol]");
      if (molBtn) {
        openMol3d(molBtn.getAttribute("data-v24-mol") || "");
        return;
      }
      var actBtn = e.target.closest("[data-v24-act]");
      if (!actBtn) return;
      var act = actBtn.getAttribute("data-v24-act");
      if (act === "prev") {
        currentIndex = (currentIndex - 1 + SOLAR_TERMS.length) % SOLAR_TERMS.length;
        isManualOverride = true;
        renderBannerContent(banner);
      } else if (act === "next") {
        currentIndex = (currentIndex + 1) % SOLAR_TERMS.length;
        isManualOverride = true;
        renderBannerContent(banner);
      } else if (act === "today") {
        activeDate = new Date();
        currentIndex = detectTermIndexByDate(activeDate);
        isManualOverride = false;
        renderBannerContent(banner);
      } else if (act === "collapse") {
        isCollapsed = !isCollapsed;
        try { localStorage.setItem(STORAGE_COLLAPSED, isCollapsed ? "1" : "0"); } catch (_) {}
        renderBannerContent(banner);
      }
    });

    var solarSlot = document.getElementById("v24SolarSlot");
    var bentoShell = document.querySelector("#v16HomePage .v19-home-shell");
    var homeWrap = document.querySelector("#v16HomePage .v16-home-wrap");
    if (solarSlot) {
      solarSlot.innerHTML = "";
      solarSlot.appendChild(banner);
    } else if (bentoShell) {
      var hero = bentoShell.querySelector(".v19-hero");
      if (hero && hero.nextSibling) bentoShell.insertBefore(banner, hero.nextSibling);
      else bentoShell.insertBefore(banner, bentoShell.firstChild);
    } else if (homeWrap) {
      homeWrap.insertBefore(banner, homeWrap.firstChild);
    } else {
      var homePage = document.getElementById("v16HomePage");
      if (homePage) homePage.insertBefore(banner, homePage.firstChild);
      else document.body.insertBefore(banner, document.body.firstChild);
    }

    renderBannerContent(banner);
    return banner;
  }

  function initSolarSystem() {
    try {
      isCollapsed = localStorage.getItem(STORAGE_COLLAPSED) === "1";
    } catch (_) {}
    activeDate = new Date();
    currentIndex = detectTermIndexByDate(activeDate);
    mountSolarBanner();

    var homePage = document.getElementById("v16HomePage");
    if (homePage && typeof MutationObserver !== "undefined") {
      new MutationObserver(function () {
        if (!document.getElementById("tcmV24SolarBanner")) mountSolarBanner();
      }).observe(homePage, { childList: true });
    }
  }

  window.TCM_V24_SOLAR = {
    version: "1.0.0-solar-atmosphere",
    getState: function () {
      var term = SOLAR_TERMS[currentIndex];
      var atmo = ATMOSPHERES[term.atmo] || ATMOSPHERES.spring;
      return {
        term: term.name,
        atmosphere: atmo.key,
        atmosphereLabel: atmo.label,
        weather: atmo.weather,
        herbs: term.herbs.map(function (h) { return h.name; }),
        isManualOverride: isManualOverride,
        isCollapsed: isCollapsed,
        totalTerms: SOLAR_TERMS.length,
        totalAtmospheres: Object.keys(ATMOSPHERES).length
      };
    },
    setTerm: function (name) {
      var idx = findTermIndexByName(name);
      if (idx < 0) return false;
      currentIndex = idx;
      isManualOverride = true;
      var banner = document.getElementById("tcmV24SolarBanner");
      if (banner) renderBannerContent(banner);
      else applyAtmosphereToBody(SOLAR_TERMS[currentIndex]);
      return true;
    },
    setDate: function (dateInput) {
      var d = dateInput instanceof Date ? dateInput : new Date(dateInput);
      if (isNaN(d.getTime())) return false;
      activeDate = d;
      currentIndex = detectTermIndexByDate(d);
      isManualOverride = false;
      var banner = document.getElementById("tcmV24SolarBanner");
      if (banner) renderBannerContent(banner);
      else applyAtmosphereToBody(SOLAR_TERMS[currentIndex]);
      return true;
    },
    resetToToday: function () {
      return this.setDate(new Date());
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSolarSystem, { once: true });
  } else {
    initSolarSystem();
  }
})();
