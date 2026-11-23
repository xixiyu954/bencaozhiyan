(function () {
  const STORAGE_KEY = 'bencao_tcm_chem_pro_v8';
  const LEGACY_STORAGE_KEY = 'lnutcm_tcm_chem_pro_v7';
  const APPROVED_AI_BANK_KEY = 'bencao_ai_approved_bank_v1';
  const AI_REVIEW_PASS_SCORE = 90;
  const AUTHOR_EMAIL = 'Chenovo495666@163.com';
  const IS_WECHAT = /MicroMessenger/i.test(navigator.userAgent || '');

  const STEP_META = {
    1: { tag: '01 / 06', title: '选材' },
    2: { tag: '02 / 06', title: '定题' },
    3: { tag: '03 / 06', title: '原理与方案' },
    4: { tag: '04 / 06', title: '装置与流程' },
    5: { tag: '05 / 06', title: '实验数据' },
    6: { tag: '06 / 06', title: 'DIY 报告' },
    hub: { tag: '装置库', title: '动态流程与装置库' }, diy: { tag: 'DIY 实验室', title: 'DIY 创意实验室' }, mission: { tag: '任务舱', title: '任务式实验实操中心' }
  };

  // 全库真实核实的中医药与中西医结合文献库（不写具体页码占位，聚焦真实权威期刊与高校成果）
  const GLOBAL_LITERATURE = [
    { tag: '药典教材', text: '国家药典委员会. 中华人民共和国药典: 2025年版一部（2025年10月1日施行）[S]. 北京: 中国医药科技出版社, 2025.', url: 'https://ydz.chp.org.cn/' },
    { tag: '药典教材', text: '国家药典委员会. 中华人民共和国药典: 2020年版一部（过渡比对参考）[S]. 北京: 中国医药科技出版社, 2020.', url: 'https://ydz.chp.org.cn/' },
    { tag: '药典教材', text: '冯卫生. 中药化学[M]. 第4版(十四五规划教材). 北京: 中国中医药出版社, 2021.', url: 'http://www.zgkjcx.com/Article/ShowArticle.asp?ArticleID=27121' },
    { tag: '中药化学', text: '钟琳, 王盼, 苗丽坤. 薄荷提取工艺、药理作用及应用研究进展[J]. 食品与机械, 2022.', url: 'https://www.ifoodmm.cn/cgi/viewcontent.cgi?article=1075&context=journal' },
    { tag: '中西医结合', text: 'Li B, Xiao T, Xu Y, et al. Oxymatrine-fatty acid deep eutectic solvents as novel penetration enhancers for transdermal drug delivery[J]. Int J Pharm, 2023, 637: 122880.', url: 'https://sps.sysu.edu.cn/teacher/xuyuehong' },
    { tag: '中西医结合', text: '黄连素调节肠道菌群治疗2型糖尿病的机制研究进展[J]. 中国微生态学杂志, 2022. (山东中医药大学)', url: 'https://cjm.dmu.edu.cn/article/doi/10.13381/j.cnki.cjm.202212019?viewType=HTML' },
    { tag: '中西医结合', text: 'Li W, et al. Berberine regulates glycemia via local inhibition of intestinal dipeptidyl peptidase-Ⅳ[J]. PMC, 2016. (浙江省中医药研究院)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10397012/' },
    { tag: '中药化学', text: '符群, 等. 细叶小檗不同生长部位生物碱抑菌活性研究[J]. 北京林业大学学报, 2022.', url: 'https://j.bjfu.edu.cn/article/doi/10.12171/j.1000-1522.20220090' },
    { tag: '中西医结合', text: '基于多组学技术探讨中药黄酮类化合物在疾病治疗中的应用[J]. PMC, 2024.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12949871/' },
    { tag: '中药化学', text: '黄芩及其提取物中黄芩素成分分析标准物质的研制[J]. 医药导报, 2019, 38(3): 298-302.', url: 'https://www.yydbzz.com/article/2019/1004-0781/1004-0781-38-3-298.shtml' },
    { tag: '高校实验', text: '槐米中芦丁提取、精制与鉴定的创新实验教学[J]. 大学化学, 2018, 33(10): 75-79.', url: 'https://www.dxhx.pku.edu.cn/article/2018/1000-8438/20181014.shtml' },
    { tag: '中西医结合', text: '吴丛宇, 周悦, 寇俊萍, 等. 大黄素的药理作用机制研究进展[J]. 中国药科大学学报, 2023.', url: 'https://jcpu.cpu.edu.cn/article/doi/10.11665/j.issn.1000-5048.2023052501?viewType=citedby-info' },
    { tag: '中药化学', text: '青蒿素类抗疟药的研制[J]. 药学学报, 2016.', url: 'https://html.rhhz.net/YXXB/html/20160126.htm' },
    { tag: '中药化学', text: '金银花化学成分、药理作用研究进展及质量标志物的预测分析[J]. 中国现代应用药学, 2025.', url: 'http://www.zgxdyyzz.com.cn/CN/PDF/10.3969/j.issn.1672-9463.2025.04.006' },
    { tag: '中西医结合', text: '邱玲玲, 肖莹, 支星, 等. Box-Behnken响应曲面法筛选金银花中抗流感病毒活性成分研究[J]. 中国现代中药, 2016, 18(11): 1454-1457.', url: 'http://www.xfcrb2020.com/EN/article/downloadArticleFile.do?attachType=PDF&id=30' },
    { tag: '高校实验', text: '去皮苦杏仁粕中苦杏仁苷的提取与鉴定综合实验教学项目创新设计[J]. 教育进展(汉斯), 2021.', url: 'https://www.hanspub.org/journal/paperinformation?paperid=47120' },
    { tag: '中药化学', text: '响应面试验优化苦杏仁粕中苦杏仁苷提取工艺及其高效离心分配色谱分离[J]. 食品科学, 2016, 37(24).', url: 'https://www.spkx.net.cn/CN/10.7506/spkx1002-6630-201624011' },
    { tag: '中药化学', text: '基于UPLC-Q-TOF-MS/MS的丹参饮体内外成分鉴定[J]. 中国实验方剂学杂志, 2025.', url: 'https://www.syfjxzz.com/rc-pub/front/front-article/download/86291172/lowqualitypdf/%E5%9F%BA%E4%BA%8EUPLC-Q-TOF-MS/MS%E7%9A%84%E4%B8%B9%E5%8F%82%E9%A5%AE%E4%BD%93%E5%86%85%E5%A4%96%E6%88%90%E5%88%86%E9%89%B4%E5%AE%9A.pdf' },
    { tag: '药典教材', text: '甘肃省药品监督管理局. 垂盆草配方颗粒质量标准[S]. 2024.', url: 'http://yjj.gansu.gov.cn/yjj/ypbzbbj/202402/173860934/files/3d83b731b49d49ccbc2f664844ad629d.pdf' },
    { tag: '中药化学', text: '一种番泻苷A/B离子交换与大孔树脂提取分离工艺[P]. CN114031654A.', url: 'https://patents.google.com/patent/CN114031654A/zh' },
    { tag: '中药化学', text: '王晓中, 杨庆凤. 浊点萃取HPLC法测定秦皮中秦皮甲素和秦皮乙素的含量[J]. 中国实验方剂学杂志, 2015.', url: 'https://www.syfjxzz.com/cn/article/doi/10.13422/j.cnki.syfjx.2015180052' },
    { tag: '中药化学', text: '基于3种黄酮类化合物含量比值鉴别广陈皮道地性（橙皮苷/川陈皮素/橘皮素）[J]. 药物分析杂志, 2017.', url: 'https://html.rhhz.net/ywfxzz/html/20170103.htm' },
    { tag: '中西医结合', text: '天然低共熔溶剂(NADES)在药剂学与难溶性中药增溶中的应用[J]. 药学学报, 2021, 56(1): 146.', url: 'https://html.rhhz.net/YXXB/html/20210115.htm' },
    { tag: '中药化学', text: '天然低共熔溶剂(NADES)对植物酚类物质提取分离研究进展[J]. 食品与机械, 2022.', url: 'https://www.ifoodmm.cn/cgi/viewcontent.cgi?article=1416&context=journal' },
    { tag: '中药化学', text: '厚朴中厚朴酚与和厚朴酚的超临界CO₂提取工艺优化[J]. 中药材/高校科研论文.', url: 'https://pmt5b327c-pic7.websiteonline.cn/upload/9gar.pdf' },
    { tag: '中西医结合', text: '方彬宇, 孙晓波, 孙桂波, 等. 三七皂苷抗缺血性脑卒中的分子机制研究进展[J]. 中华全科医学, 2022.', url: 'http://www.zhqkyx.net/article/doi/10.16766/j.cnki.issn.1674-4152.002516' },
    { tag: '高校实验', text: '刘元, 夏超, 等. 牡丹皮中丹皮酚提取工艺的研究[J]. 蚌埠医学院学报.', url: 'https://xuebao.bbmu.edu.cn/article/id/9044' },
    { tag: '高校实验', text: '茶叶中咖啡因的提取实验装置（内通气集热式索氏提取器-升华法）改进与探索[J]. 大学化学, 2019, 34(3): 42.', url: 'https://www.dxhx.pku.edu.cn/article/2019/1000-8438/20190308.shtml' },
    { tag: '中药化学', text: '基质固相分散萃取-HPLC法同时测定五味子中5种木脂素类化合物[J]. PMC, 2023.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9982707/' },
    { tag: '中西医结合', text: '梁鑫淼团队. 本草物质科学研究方法与技术进展（正交分离材料与多维制备色谱）[J]. PMC.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC13425200/' },
    { tag: '中药化学', text: '一种乙醇回流与酸碱法提取分离丁香中丁香酚的工艺[P]. CN101781178A.', url: 'https://patents.google.com/patent/CN101781178A/zh' },
    { tag: '中药化学', text: '王聪, 等. 肉豆蔻对照品去氢二异丁香酚制备工艺优化[J]. 中国实验方剂学杂志, 2012. (北京中医药大学)', url: 'https://www.syfjxzz.com/cn/article/doi/10.13422/j.cnki.syfjx.2012.04.028' },
    { tag: '中药化学', text: '张璐, 刘强. 蛇床子素渗漉提取及醇提水沉重结晶工艺研究[J]. 中国实验方剂学杂志 / CN101948459B.', url: 'https://www.syfjxzz.com/en/article/47241062' },
    { tag: '中西医结合', text: '骨愈方中羟基红花黄色素A(HSYA)体外透皮性能与大孔树脂纯化研究[J]. 中国实验方剂学杂志, 2013.', url: 'https://www.syfjxzz.com/cn/article/doi/10.11653/syfj2013120040' },
    { tag: '高校实验', text: '大孔吸附树脂在天然药物（黄酮/皂苷/红花黄色素）分离纯化中的应用综述[EB/OL]. ChemicalBook, 2022.', url: 'https://www.chemicalbook.com/NewsInfo_49184.htm' }
  ];

  // 全国医药及中医药高校代表性药学/中西医结合实验参考库
  const UNIV_CASES = [
    { univ: '中国药科大学', title: '大黄素抗炎/抗纤维化信号通路与 pH 梯度萃取', desc: '结合传统酸水解-氯仿回流与 NaHCO₃/Na₂CO₃/NaOH 梯度萃取，衔接现代药理靶点研究。', url: 'https://jcpu.cpu.edu.cn/article/doi/10.11665/j.issn.1000-5048.2023052501?viewType=citedby-info' },
    { univ: '中山大学药学院', title: '中药低共熔溶剂(DES)与微针经皮递药（阿魏酸-黄芩苷/薄荷脑）', desc: '将薄荷脑、苦参碱、黄芩苷等天然成分拓展至现代经皮促渗与可溶性微针中西医结合制剂。', url: 'https://sps.sysu.edu.cn/teacher/xuyuehong' },
    { univ: '山东中医药大学', title: '盐酸小檗碱调节肠道菌群与局部 DPP-Ⅳ 降糖机制', desc: '突破“仅作肠道抗菌药”传统认知，从肠道药代动力学切入中西医结合降糖实验设计。', url: 'https://cjm.dmu.edu.cn/article/doi/10.13381/j.cnki.cjm.202212019?viewType=HTML' },
    { univ: '河南中医药大学', title: '中药药效物质基础与《中药化学》规划教材体系', desc: '强调提取分离、波谱解析与药效物质群关联，注重多维检识与质量标志物(Q-Marker)评价。', url: 'http://www.zgkjcx.com/Article/ShowArticle.asp?ArticleID=27121' },
    { univ: '北京大学《大学化学》', title: '槐米中芦丁碱提酸沉与绿色精制创新教学实验', desc: '优化硼砂保护浓度与酸沉 pH 控制，解决传统教学实验中氧化变色与收率波动痛点。', url: 'https://www.dxhx.pku.edu.cn/article/2018/1000-8438/20181014.shtml' },
    { univ: '南京/北京中医药大学', title: '黄芩“清热利胆”活性成分与多组学精准医疗评价', desc: '将沸水杀酶保苷传统炮制提取原理与现代代谢组学、宏基因组学评价相结合。', url: 'https://www.cnma.org.cn/nd.jsp?id=4573' },
    { univ: '北京大学《大学化学》', title: '茶叶咖啡因内通气集热式索氏提取与生石灰升华改进', desc: '针对传统索氏提取耗时长、易损坏痛点，采用生石灰中和单宁与控温升华提高结晶纯度。', url: 'https://www.dxhx.pku.edu.cn/article/2019/1000-8438/20190308.shtml' },
    { univ: '中国医科院药植所', title: '三七总皂苷抗缺血性脑卒中与血脑屏障保护转化研究', desc: '连接传统活血化瘀提取工艺与现代 PI3K/Akt/mTOR 促血管新生及抗焦亡信号通路。', url: 'http://www.zhqkyx.net/article/doi/10.16766/j.cnki.issn.1674-4152.002516' },
    { univ: '中科院大连化物所', title: '本草物质组正交分离材料与多维高效制备色谱体系', desc: '以多维正交分离突破中药复杂基质微量成分瓶颈，支撑创新中药质量标志物发现。', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC13425200/' },
    { univ: '广东省药检/广陈皮研究', title: '广陈皮橙皮苷、川陈皮素与橘皮素含量比值道地性鉴别', desc: '将二氢黄酮苷与多甲氧基黄酮分级提取与 UPLC 特征比值结合，实现道地药材精准质控。', url: 'https://html.rhhz.net/ywfxzz/html/20170103.htm' }
  ];

  // 核心物理化学与药学公式库（按成分大类自动匹配核心公式，配齐严谨公式与通俗大白话拆解）
  const FORMULA_BANK = {
    distill: {
      name: '道尔顿分压定律（水蒸气蒸馏）',
      category: '挥发油与热敏萜类',
      eq: '<span class="whitespace-nowrap">P总</span> = <span class="whitespace-nowrap">P水</span> + <span class="whitespace-nowrap">P油</span> = <span class="whitespace-nowrap">P₀</span> ； <span class="whitespace-nowrap">m油</span> / <span class="whitespace-nowrap">m水</span> = (<span class="whitespace-nowrap">P油</span>·<span class="whitespace-nowrap">M油</span>) / (<span class="whitespace-nowrap">P水</span>·<span class="whitespace-nowrap">M水</span>)',
      desc: '挥发油与水互不相溶，混合体系总蒸气压等于各组分饱和蒸气压之和，因此在低于 100℃ 时即可共沸馏出，保护热敏萜类。',
      plain: '【小白秒懂比喻】水和挥发油像两个互不相融的小伙伴，在烧瓶里“合力抬箱子”，各自拼命向外蒸发。只要它们两者的蒸气压之和达到 1 个大气压，混合液就会“提前沸腾”！所以通常在 95~98℃（不到 100℃）时，沸水蒸汽就化身为高速列车，顺便把挥发油分子“打包托运”到冷凝管里。这样既能蒸出香气成分，又完全不用担心高温把药材烤焦或破坏热敏有效成分！',
      breakdown: [
        { term: 'P总 = P水 + P油', expl: '水和油各自贡献一份蒸气压，凑满 1 个大气压（P₀）即共沸，沸点永远低于水的 100℃。' },
        { term: 'm油 / m水', expl: '馏出液中油与水的比例。虽然水蒸气很多，但挥发油萜类分子量大（150~300），因而能顺带蒸出可观药油。' }
      ],
      pitfalls: '加水比例建议为药材的 8~10 倍；务必加入 2~3 粒沸石防暴沸；蒸馏速度以每秒 2~3 滴为宜，冷凝水必须下进上出且充分对流！',
      examPoints: '适用条件：具挥发性、能随水蒸气馏出、与水不发生化学反应且在水中难溶或不溶的成分（如薄荷脑、丁香酚）。'
    },
    diffusion: {
      name: '菲克第一扩散定律（固液浸提传质）',
      category: '溶剂提取动力学',
      eq: 'dM / dt = − D · F · (dC / dx)',
      desc: '浸提速率与扩散系数 D（受温度、超声空化影响）、药材表面积 F（粉碎粒度）及浓度梯度 dC/dx（料液比与提取次数）成正比。',
      plain: '【小白秒懂比喻】这其实就是“科学泡茶指南”：① 表面积 F：把药材切碎成粗中粉，水能接触的表面积成倍增大，成分跑出来更快；但千万别磨成极细面糊，否则会把滤纸筛孔死死堵住！② 扩散系数 D：热茶泡得快（温度高分子热运动剧烈），超声波震荡直接震破细胞壁，扩散系数 D 飙升；③ 浓度梯度 dC/dx：茶汤泡浓了之后“内外浓度差”变小，成分就泡不出来了。所以做实验必须分 2~3 次提取，每次倒掉浓液换上新鲜溶剂，始终维持最大的“渗透吸力”！',
      breakdown: [
        { term: 'dM / dt', expl: '提取速度：单位时间内有多少毫克成分从药材细胞内部“逃逸”溶入到外面的溶剂中。' },
        { term: 'D (扩散系数)', expl: '扩散活力：温度升高或超声波空化震碎细胞壁，溶剂黏度下降，D 大幅提升。' },
        { term: 'F (表面积)', expl: '接触面积：切段/粗粉接触面积大。本科常规实验推荐 20~40 目粗中粉。' },
        { term: 'dC / dx (浓度差)', expl: '内外贫富差距：细胞内成分极多，外面新鲜溶剂为零。分 2~3 次提取比一次死煮效率高 35% 以上！' }
      ],
      pitfalls: '切忌打成 100 目以上超细粉！药材淀粉与黏液质遇水吸胀成面糊，抽滤时数小时都滴不出一滴！',
      examPoints: '影响固液提取的 4 大核心参数：粉碎粒度（F）、浸提温度与超声（D）、料液比与提取次数（dC/dx）、溶剂极性与选择性。'
    },
    henderson: {
      name: 'Henderson-Hasselbalch 酸碱解离方程',
      category: '生物碱/黄酮/有机酸定向解离',
      eq: 'pH = pKa + lg([A⁻] / [HA])',
      desc: '指导生物碱酸水成盐提取、黄酮/蒽醌碱溶酸沉与大黄 pH 梯度萃取的精准酸碱窗口设定。',
      plain: '【小白秒懂比喻】生物碱和酸性酚类成分就像“会变装的双面间谍”：① 生物碱是个“亲酸的小孩”，一遇酸水就穿上带电荷的马甲变成盐（亲水性大增，乖乖钻进水相里）；加碱脱掉马甲恢复游离态（带电荷消失，变身脂溶性，只喜欢钻进有机溶剂）。利用“一酸一碱、进水进油”，就能把不吃酸碱这套的淀粉、色素彻底甩掉！② 羟基蒽醌/黄酮则相反，本身显弱酸性，遇碱成酚钠盐溶于水，加酸又沉淀析出，这就是“碱溶酸沉法”！',
      breakdown: [
        { term: 'pH 与 pKa', expl: '当溶液 pH = pKa 时，解离型（离子）与非解离型（分子态）各占 50%。' },
        { term: '酸沉/游离窗口', expl: '让生物碱 99% 成盐溶于水需调节至 pH < pKa - 2；完全游离沉淀需调节至 pH > pKa + 2。' }
      ],
      pitfalls: '碱溶酸沉时加酸速度不可过猛！局部过酸会导致两性成分（如小檗碱、黄酮苷）重新溶掉，或引起热敏苷类发生酸催化水解破坏！',
      examPoints: '大黄蒽醌 pH 梯度萃取顺序（酸性由强到弱）：含-COOH（NaHCO₃）> 2个以上β-OH（Na₂CO₃）> 1个β-OH（1% NaOH）> 2个α-OH（5% NaOH）。'
    },
    qc: {
      name: '收率、重复性(RSD)与薄层比移值(Rf)',
      category: '实验定量评价与质控',
      eq: '收率(%) = (<span class="whitespace-nowrap">m提取物</span>/<span class="whitespace-nowrap">m药材</span>)×100% ； RSD = (S / <span class="whitespace-nowrap">x̄</span>)×100% ； Rf = <span class="whitespace-nowrap">L斑点</span> / <span class="whitespace-nowrap">L₀</span>',
      desc: '定量评价提取效率、平行批次工艺稳健性（一般要求 RSD < 5%）及薄层定性一致性（|ΔRf| ≤ 0.03）。',
      plain: '【小白秒懂比喻】这三组指标是导师给实验打分的依据：① 收率：你投了 100g 药材最终拿出多少克真金白银？对照药典标准看工艺是否及格；② RSD（相对标准偏差）：做 3 次平行实验，数据是整齐划一（RSD < 3% 优秀）还是忽上忽下（RSD > 10% 重新做）？评价实验操作规范性；③ Rf 比移值：硅胶板上的赛跑比赛！供试品斑点必须与标准品在同一水平线上（|ΔRf| ≤ 0.03），颜色荧光一致，才能证明你提取出的确是目标成分！',
      breakdown: [
        { term: '粗提收率 vs 精制收率', expl: '粗提物含有浸膏和少量杂质，精制得率则是重结晶或柱层析后的高纯度结晶。' },
        { term: 'Rf 黄金区间 (0.2~0.8)', expl: '理想展开斑点的 Rf 应在 0.3~0.5 之间。若 Rf < 0.2 说明展开剂极性太小跑不动；若 Rf > 0.8 说明极性太大全冲到顶了。' }
      ],
      pitfalls: 'TLC 点样量切忌过大！样品过浓或斑点直径超过 3mm 会导致严重拖尾超载；层析缸必须提前贴滤纸密封饱和 20 分钟消除边缘效应！',
      examPoints: '中国药典鉴别规范：供试品色谱中，在与对照品色谱相应的位置上，显相同颜色的斑点或荧光斑点，|ΔRf| ≤ 0.03。'
    },
    adsorption: {
      name: '极性吸附与洗脱动力学（柱层析/树脂）',
      category: '色谱纯化分离',
      eq: '吸附力 ∝ 极性强度； 洗脱力 ∝ 溶剂极性梯度',
      desc: '硅胶正相吸附极性物质，大孔树脂反相吸附亲脂性物质，通过极性梯度洗脱实现高纯度逐级分离。',
      plain: '【小白秒懂比喻】柱层析就像“赛跑通道”：硅胶柱（正相）表面布满亲水的硅羟基，好比一个“极度热情的亲水磁铁”。极性大的成分（如黄酮苷、皂苷）一进柱子就被硅胶死死拉住；而极性小的成分（如挥发油、游离苷元）和硅胶没有共同语言，跟着洗脱液一溜烟最先流出来。随后我们把洗脱剂的极性一点点加大（如氯仿-甲醇比例从 95:5 加到 80:20），硬生生把紧抱的成分给“冲洗”下来，实现逐级纯化！',
      breakdown: [
        { term: '硅胶正相层析', expl: '极性小者先洗脱出柱，极性大者后出柱。展开洗脱剂极性增大，洗脱能力随之增强。' },
        { term: '大孔吸附树脂', expl: '通过范德华力与氢键吸附；水洗脱去糖类、无机盐等水溶杂质，乙醇浓度由低到高梯度洗脱目标苷类与黄酮。' }
      ],
      pitfalls: '装柱严禁产生气泡或断层干柱！一旦干柱，样品流速不匀、色带倾斜，分离彻底失败，必须倒出重新装柱！',
      examPoints: '吸附强弱规律：化合物分子中形成氢键能力越强、极性基团越多（-COOH > -OH > -NH₂ > -CHO > -C=O），吸附越牢固。'
    },
    nernst: {
      name: '能斯特分配定律（液-液萃取）',
      category: '分液漏斗萃取分离',
      eq: 'K = C有机 / C水 ； Wn = W0 · [V水 / (K·V有 + V水)]ⁿ',
      desc: '利用溶质在两互不相溶溶剂中溶解度的差异，通过分液漏斗多次少量萃取实现高富集。',
      plain: '【小白秒懂比喻】为什么做分液萃取时，老师总强调“多次少量”？公式告诉你：假设你有 60 mL 萃取溶剂，如果一口气把 60 mL 全倒进去萃取 1 次，只能提取走约 70% 的成分；但如果你把 60 mL 分成 3 次（每次用 20 mL）萃取，最终提取率可以飙升到 96% 以上！这跟洗衣服漂洗一个道理：用一小盆清水漂洗两遍，绝对比一大桶水泡着漂一遍干净得多！',
      breakdown: [
        { term: '分配系数 K', expl: 'K 值越大，溶质越偏爱留在有机相中，萃取越轻松。' },
        { term: '萃取次数 n', expl: '残留在水里的量 Wn 随着次数 n 呈几何级数急剧衰减，3 次萃取基本达到 95% 以上提取率。' }
      ],
      pitfalls: '分液漏斗震摇时必须随时倒置打开旋塞放气！特别是乙醚、二氯甲烷等低沸点挥发溶剂，气压极高，不放气会直接顶飞塞子发生喷溅安全事故！',
      examPoints: '液-液萃取乳化破乳 4 大绝招：长时间静置、加氯化钠电解质盐析、滴加数滴无水乙醇、离心或电吹风局部微温加热。'
    }
  };

  // 《中药化学》通用核心 10 大章节知识库（第2~9、12~13章）
  const COURSE_CHAPTERS = [
    {
      ch: '第二章 糖和苷类化合物', sections: '2.1 糖类化合物 · 2.2 苷类化合物',
      biosyn: '光合作用单糖经糖基转移酶与苷元缩合形成氧苷、氮苷、硫苷或碳苷。',
      props: '多糖易溶于热水、不溶于高浓度乙醇（水提醇沉法 + Sevag法除蛋白）；苷类水解难易顺序：N-苷 > O-苷 > S-苷 > C-苷；2-去氧糖苷最易酸水解，糖醛酸苷最难水解。',
      detect: 'Molish 反应（α-萘酚+浓硫酸界面紫环）、斐林试剂（还原糖砖红沉淀）、苯酚-硫酸法 490nm 定量。',
      herbs: ['lycium', 'armeniaca', 'sedum', 'dendrobium']
    },
    {
      ch: '第三章 醌类化合物', sections: '3.1 概述 · 3.2 生物合成 · 3.3 结构分类 · 3.4 理化性质 · 3.5 检识 · 3.6 中药实例',
      biosyn: '主要经醋酸-丙二酸途径（大黄素型蒽醌，两环均有取代）及莽草酸-琥珀酰苯甲酸途径（茜草素型，单环取代）。',
      props: '游离蒽醌具升华性；酸性强弱顺序：含 -COOH（NaHCO₃溶）> 2个以上 β-OH > 1个 β-OH（Na₂CO₃溶）> 2个 α-OH（1% NaOH溶）> 1个 α-OH（5% NaOH溶），据此实施 pH 梯度萃取。',
      detect: 'Feigl 反应（所有醌类呈紫色）、Bornträger 反应（羟基蒽醌遇碱呈红~紫红色）、醋酸镁反应（邻二酚显蓝紫，对位显紫红）。',
      herbs: ['rheum', 'salvia', 'cassia', 'polygonum', 'senna']
    },
    {
      ch: '第四章 苯丙素类化合物', sections: '4.1 概述 · 4.2 生物合成 · 4.3 简单苯丙素 · 4.4 香豆素 · 4.5 木脂素',
      biosyn: '经莽草酸途径生成苯丙氨酸/酪氨酸，脱氨形成桂皮酸衍生物（C₆-C₃ 单元），环合得香豆素、双分子聚合得木脂素。',
      props: '简单苯丙素（绿原酸、阿魏酸）显较强酸性；香豆素具内酯环，碱液加热开环成顺式邻羟基桂皮酸盐溶于水，酸化复闭环析出（碱溶酸沉法），小分子具挥发性与 365nm 蓝色荧光。',
      detect: '香豆素：异羟肟酸铁反应（内酯环显红）、Gibbs/Emerson 反应（判断 C6 位有无取代）；木脂素：Labat 反应（亚甲二氧基显翠绿）。',
      herbs: ['lonicera', 'fraxinus', 'forsythia', 'magnolia', 'schisandra', 'curcuma_longa', 'star_anise']
    },
    {
      ch: '第五章 黄酮类化合物', sections: '5.1 概述 · 5.2 生物合成 · 5.3 结构分类 · 5.4 理化性质 · 5.5 检识 · 5.6 中药实例',
      biosyn: '复合途径：B环+C₃ 来自桂皮酸（莽草酸途径），A环由 3 分子丙二酰辅酶A 经醋酸-丙二酸途径缩合而成查耳酮再环合。',
      props: '黄酮/黄酮醇交叉共轭平面性强，溶解度小；二氢黄酮/异黄酮非平面分子溶解度较大。酸性顺序：7,4′-二OH > 7-或4′-OH > 一般酚OH > 5-OH（分子内氢键酸性最弱）。',
      detect: '盐酸-镁粉（黄酮/黄酮醇/二氢黄酮呈红~紫红，查耳酮/橙酮/异黄酮阴性）、NaBH₄（二氢黄酮专属性紫红）、锆盐-枸橼酸（区分 3-OH 与 5-OH）、AlCl₃ 荧光。',
      herbs: ['scutellaria', 'sophora', 'pueraria', 'ginkgo_flav', 'citrus', 'phellodendron_flav']
    },
    {
      ch: '第六章 萜类和挥发油', sections: '6.1 萜类 · 6.2 挥发油',
      biosyn: '经甲戊二羟酸（MVA）或甲基赤藓醇磷酸（MEP）途径生成异戊二烯焦磷酸（IPP/DMAPP），首尾相连构成单萜(C10)、倍半萜(C15)、二萜(C20)等。',
      props: '挥发油常温可挥发、不溶于水，遵循道尔顿分压定律可水蒸气蒸馏；低温冷冻析晶分离薄荷脑/樟脑；环烯醚萜苷（栀子苷）遇酸/酶易水解聚合成深蓝色。',
      detect: '挥发油：滤纸油斑挥发试验、香草醛-浓硫酸显色、异羟肟酸铁（内酯）；环烯醚萜：氨基酸加热显深蓝色。',
      herbs: ['mint', 'paeonia_moutan', 'artemisia', 'andrographis', 'gardenia']
    },
    {
      ch: '第七章 皂苷', sections: '7.1 概述 · 7.2 生物合成途径 · 7.3 结构分类 · 7.4 理化性质 · 7.5 检识',
      biosyn: '经 MVA 途径生成鲨烯（C30），氧化环合分化为四环三萜（达玛烷型：人参/三七）与五环三萜（齐墩果烷型：甘草/柴胡）。',
      props: '双亲分子具强起泡性与溶血性（但人参皂苷总皂苷因 Rb1 抗溶血整体不明显）；极性大，常用 70% 乙醇提取、正丁醇萃取或 D101/AB-8 大孔树脂富集。',
      detect: '泡沫试验（酸碱管均持久泡沫提示三萜皂苷）、Liebermann-Burchard（醋酐-浓硫酸：三萜最终呈紫红，甾体呈蓝绿）、三氯乙酸反应。',
      herbs: ['panax', 'panax_quinquefolius', 'notoginseng', 'glycyrrhiza']
    },
    {
      ch: '第八章 甾体（强心苷与甾体皂苷）', sections: '8.1 概述（C21甾体、强心苷、甾体皂苷）',
      biosyn: '由鲨烯经环阿屯醇/胆固醇侧链降解演化为 C27 甾体皂苷（螺旋甾烷醇）及 C23/C24 强心苷。',
      props: '甲型强心苷（C17连五元不饱和内酯环，如杠柳毒苷）UV 217~220nm；乙型（六元内酯环，如蟾毒配基）UV 295~300nm。甾体皂苷无羧基呈中性，可与胆甾醇生成难溶分子复合物沉淀。',
      detect: '甲型强心苷活性亚甲基：Legal（深红）、Kedde（红紫）、Raymond（紫红）；α-去氧糖：Keller-Kiliani（醋酸层显翠蓝）；甾体皂苷：Liebermann-Burchard 显蓝绿。',
      herbs: ['periploca', 'anemarrhena', 'dioscorea', 'venenum_bufonis']
    },
    {
      ch: '第九章 生物碱', sections: '9.1 概述 · 9.2 结构分类 · 9.3 理化性质 · 9.4 检识',
      biosyn: '主要来源于鸟氨酸、赖氨酸、苯丙氨酸、酪氨酸、色氨酸等氨基酸途径（萜类/甾体生物碱属伪生物碱）。',
      props: '碱性强弱规律：胍基 > 季铵碱（小檗碱）> 脂肪胺 > 芳杂环/芳胺 > 酰胺（秋水仙碱近中性）。游离亲脂、成盐亲水，适用“酸提碱沉”或季铵碱盐析法。',
      detect: '碘化铋钾（Dragendorff 橘红沉淀）、碘化汞钾（Mayer 类白）、硅钨酸（灰白）；小檗碱酸性漂白粉显樱红；咖啡因紫脲酸铵显紫红。',
      herbs: ['coptis', 'phellodendron', 'corydalis', 'tea_caffeine', 'ephedra']
    },
    {
      ch: '第十二章 中药有效成分的提取分离方法', sections: '12.1 提取方法 · 12.2 分离方法 · 12.3 各类成分提取分离',
      biosyn: '涵盖溶剂提取（浸渍/渗漉/回流/索氏/超声/NADES低共熔）、水蒸气蒸馏与升华法，核心受菲克第一扩散定律调控。',
      props: '分离五大原理：①溶解度差异（结晶/醇沉/酸碱沉淀）；②分配系数差异（pH梯度液-液萃取）；③吸附差异（硅胶/聚酰胺/大孔树脂）；④分子大小（凝胶/超滤）；⑤解离度差异（离子交换树脂）。',
      detect: '工艺设计必须结合成分热敏性、挥发性、pKa 酸碱性与极性窗口，避免盲目高温回流导致黄芩苷酶解、苦杏仁苷分解或丹皮酚升华损失。',
      herbs: ['mint', 'scutellaria', 'rheum', 'curcuma_longa']
    },
    {
      ch: '第十三章 中药有效成分的结构鉴定方法（UV / NMR）', sections: '13.3 紫外光谱(UV) · 13.5 核磁共振谱(NMR)',
      biosyn: '波谱学四谱联用（UV/IR/MS/NMR）是确定未知单体平面结构与立体构型的金标准。',
      props: '【UV 诊断试剂位移（黄酮核心）】带Ⅰ(300~400nm,桂皮酰基/B环)与带Ⅱ(240~285nm,苯甲酰基/A环)：+NaOMe 带Ⅰ红移 40~60nm 且强度不降→4′-OH；+NaOAc 带Ⅱ红移 5~20nm→7-OH；+NaOAc/H₃BO₃ 带Ⅰ红移 12~30nm→B环邻二OH；+AlCl₃/HCl 带Ⅰ仍红移 35~55nm→3-OH 或 5-OH。',
      detect: '【NMR 核心规律】①端基质子(δ 4.3~6.0)偶合常数 J：β-D-葡萄糖苷 J=7~9 Hz（双峰，aa偶合），α-苷 J=2~4 Hz；②黄酮 A环 H-6/H-8 呈间位偶合 J≈2 Hz（δ 6.0~6.5），B环 4′-取代呈 AA′BB′ 四重峰 J≈8.5 Hz；③¹³C-NMR 苷化位移可精准定位糖连接位置。',
      herbs: ['scutellaria', 'sophora', 'fraxinus', 'coptis']
    }
  ];

  // 第13章 UV & NMR 分类速查字典（动态联动 Step 3）
  const SPECTRA_BY_CAT = {
    '黄酮': {
      chapter: '第5章 黄酮 · 第13章 UV/NMR',
      biosyn: '复合途径：B环+C₃ 源自莽草酸-桂皮酸途径，A环由 3 分子丙二酰 CoA 经醋酸-丙二酸途径缩合。',
      uv: 'MeOH 中具带Ⅱ(240~285nm, A环)与带Ⅰ(300~400nm, B环)；+NaOMe 检 4′-OH（带Ⅰ红移40~60nm），+NaOAc 检 7-OH（带Ⅱ红移5~20nm），+AlCl₃/HCl 区分 3-OH/5-OH 与邻二酚羟基。',
      nmr: '¹H-NMR：5-OH 分子内氢键低场单峰 δ 12.0~13.5；A环 H-6/H-8 间位偶合 J≈2 Hz；B环 4′-OH 呈 AA′BB′ 双峰(J≈8.5 Hz)；糖端基质子 J=7~8 Hz 确证 β-构型。'
    },
    '蒽醌与醌类': {
      chapter: '第3章 醌类 · 第13章 UV/NMR',
      biosyn: '大黄素型蒽醌经醋酸-丙二酸途径（两苯环均有取代），丹参菲醌属二萜类醌（MVA 途径）。',
      uv: '蒽醌具 4~5 个特征吸收带：230nm（苯样带）、240~260nm（苯环）、262~295nm（醌样带）、305~389nm 及 >405nm（α-OH 越多红移越显著）。',
      nmr: '¹H-NMR：α-OH 与羰基形成螯合氢键出现于极低场 δ 11.5~13.5；芳环 α-H(δ 7.8~8.3) 较 β-H(δ 7.3~7.8) 更偏向低场；¹³C-NMR 羰基碳 δ 180~192。'
    },
    '香豆素与木脂素': {
      chapter: '第4章 苯丙素 · 第13章 UV/NMR',
      biosyn: '莽草酸途径生成桂皮酸（C₆-C₃），邻位羟化环合得香豆素，两分子氧化偶联得木脂素。',
      uv: '简单香豆素在 274nm（苯环）与 311nm（吡喃酮环）显强吸收；C7-OH 取代后 311nm 红移至 325nm，加碱进一步红移至 370nm 并增强。',
      nmr: '¹H-NMR：香豆素母核 H-3(δ 6.1~6.4) 与 H-4(δ 7.5~8.1) 呈顺式双键特征双峰，偶合常数 J≈9.5 Hz；呋喃香豆素呋喃环 H-2′/H-3′ J≈2.2 Hz。'
    },
    '苯丙素与有机酸': {
      chapter: '第4章 简单苯丙素 · 第13章 UV/NMR',
      biosyn: '经莽草酸途径（八角莽草酸即中间体）生成桂皮酸/咖啡酸，再与奎宁酸酯化生成绿原酸。',
      uv: '咖啡酰基/阿魏酰基共轭体系在 240nm 与 325~330nm 呈强特征双峰；姜黄素共轭二酮在 420~430nm 显强可见吸收。',
      nmr: '¹H-NMR：反式双键质子 H-7/H-8 呈大偶合常数双峰 J=15~16 Hz（δ 6.2~6.4 与 7.5~7.7），清晰区分顺式构型(J≈12 Hz)。'
    },
    '生物碱': {
      chapter: '第9章 生物碱 · 第13章 UV/NMR',
      biosyn: '源自酪氨酸（异喹啉类：小檗碱/延胡索乙素）、色氨酸、鸟氨酸或嘌呤核苷（咖啡因）途径。',
      uv: '异喹啉季铵碱（盐酸小檗碱）具高度共轭体系，在 228、263、345 及 422nm 具四重强吸收；咖啡因最大吸收约 273nm。',
      nmr: '¹H-NMR：N-CH₃ 单峰位于 δ 2.2~3.0（季铵盐移至 δ 3.2~4.2）；亚甲二氧基(-OCH₂O-) 特征单峰 δ 5.9~6.1；小檗碱 C-8 亚胺氢极低场 δ 9.8~10.0。'
    },
    '挥发油与萜类': {
      chapter: '第6章 萜类与挥发油 · 第13章 UV/NMR',
      biosyn: '甲戊二羟酸（MVA）或 MEP 途径生成异戊二烯单位(C₅)，缩合为单萜(C₁₀)、倍半萜(C₁₅)。',
      uv: '饱和单萜醇（薄荷脑）无强 UV 吸收（需 GC-MS 联用）；含共轭羰基/芳环挥发成分（丹皮酚 275nm、桂皮醛 285nm）具强特征峰。',
      nmr: '¹H-NMR：单萜角甲基与异丙基双峰群集中于高场 δ 0.8~1.2；双键质子 δ 4.8~5.6；¹³C-NMR DEPT 谱快速区分 CH₃/CH₂/CH/季碳骨架。'
    },
    '萜类内酯与环烯醚萜': {
      chapter: '第6章 萜类 · 第13章 UV/NMR',
      biosyn: 'MVA 途径形成环烯醚萜（栀子苷）或二萜内酯（穿心莲内酯）/倍半萜过氧内酯（青蒿素）。',
      uv: '环烯醚萜 C3=C4 双键连 C4-COOR 在 235~240nm 具强特征吸收；穿心莲内酯 α,β-不饱和内酯环 λmax ≈ 225nm；青蒿素无强 UV（需 ELSD/MS）。',
      nmr: '¹H-NMR：环烯醚萜 H-3 单峰 δ 7.4~7.6、H-1 缩醛质子 δ 5.0~5.8；青蒿素过氧桥邻位 H-12 单峰 δ 5.86 是特征鉴别信号。'
    },
    '皂苷与三萜': {
      chapter: '第7章 皂苷 · 第13章 UV/NMR',
      biosyn: 'MVA 途径生成 C30 鲨烯，环合为四环达玛烷型（人参/三七）或五环齐墩果烷型（甘草）。',
      uv: '大多数三萜皂苷仅具末端吸收(203nm)；甘草酸因 C11-酮基与 C12=C13 共轭在 250nm 具强吸收峰。',
      nmr: '¹H-NMR：高场 δ 0.7~1.3 密集出现 7~8 个角甲基单峰；烯氢 H-12 宽单峰 δ 5.2~5.4；糖端基质子 δ 4.3~5.3（β-D-Glc J≈7.8 Hz）；¹³C-NMR 苷化位移确定糖链连接位点。'
    },
    '甾体与强心苷': {
      chapter: '第8章 甾体 · 第13章 UV/NMR',
      biosyn: '经 MVA→鲨烯→胆固醇途径侧链降解生成 C23/C24 强心苷或 C27 螺旋甾烷醇皂苷。',
      uv: '甲型强心苷（五元不饱和内酯环）λmax 217~220nm (lgε≈4.2)；乙型强心苷（六元α-吡喃酮环）λmax 295~300nm；甾体皂苷仅末端吸收。',
      nmr: '¹H-NMR：C18/C19 角甲基单峰 δ 0.7~1.1；甲型强心苷内酯环 H-22 宽单峰 δ 5.8~6.0、C21-CH₂ AB四重峰 δ 4.8~5.0；α-去氧糖 C6-CH₃ 双峰 δ 1.2~1.4。'
    },
    '氰苷类': {
      chapter: '第2章 苷类化合物 · 第13章 UV/NMR',
      biosyn: '由苯丙氨酸（苦杏仁苷）或异亮氨酸（垂盆草苷）经 N-羟化、脱羧生成羟腈再糖基化。',
      uv: '苦杏仁苷苯环 B 带吸收位于 257~262nm（弱吸收），垂盆草苷共轭氰基烯烃在 210~220nm 显特征吸收。',
      nmr: '¹H-NMR：苦杏仁苷苯环 5H 峰 δ 7.3~7.6、手性次甲基(-CH-CN) 单峰 δ 5.9；¹³C-NMR 特征氰基碳(-C≡N) 位于 δ 116~120，结合 β-龙胆二糖端基 J=7.8 Hz 确证。'
    },
    '多糖类': {
      chapter: '第2章 糖类化合物 · 第13章 UV/NMR',
      biosyn: '植物初级/次级代谢中单糖经糖苷键聚合形成高分子杂多糖或蛋白多糖。',
      uv: '纯多糖在 260nm（核酸）与 280nm（蛋白质）处均应无吸收峰，UV 全波长扫描是检验 Sevag 法除蛋白彻底与否的直接依据。',
      nmr: '¹H-NMR：δ 4.4~5.5 端基质子区信号数对应单糖残基种类（α-构型 δ 5.0~5.5, β-构型 δ 4.4~4.9）；¹³C-NMR 端基碳 δ 95~110 解析糖苷键连接方式。'
    }
  };

  const TRACK_OPTIONS = [
    { id: 'comprehensive', name: '综合设计', desc: '提取、分离精制与多维检识全流程。', suffix: '提取、分离与多维检识综合实验设计' },
    { id: 'validation', name: '药典验证', desc: '对标《中国药典》标准，重在 RSD 重复性。', suffix: '药典标准提取分离工艺验证与检识' },
    { id: 'optimization', name: '中西医结合创新', desc: '结合现代递药、绿色提取或药理延伸。', suffix: '绿色提取纯化工艺及中西医结合转化研究' }
  ];

  const DIY_EXTRACT_LIST = [
    { id: 'steam', name: '水蒸气蒸馏法', rig: 'steam', desc: '挥发油及共沸单萜/倍半萜首选。' },
    { id: 'reflux', name: '乙醇加热回流', rig: 'reflux', desc: '耐热黄酮、生物碱、蒽醌、皂苷通用。' },
    { id: 'soxhlet', name: '索氏连续提取', rig: 'soxhlet', desc: '溶剂循环利用率高，适合微量脂溶性成分。' },
    { id: 'ultrasound', name: '超声低温提取', rig: 'ultrasound', desc: '空化破壁省时，保护热敏易氧化成分。' },
    { id: 'acid_water', name: '稀酸水渗漉', rig: 'filter', desc: '生物碱成盐溶出，减少脂溶性色素。' },
    { id: 'boil_enzyme', name: '沸水杀酶 / 硼砂碱提', rig: 'reflux', desc: '钝化黄芩酶保苷或硼砂护邻二酚羟基。' }
  ];

  const DIY_SEPARATE_LIST = [
    { id: 'freeze', name: '盐析脱水 + 冷冻结晶', desc: '利用凝固点差异析出薄荷脑结晶。' },
    { id: 'acid_precip', name: '碱溶酸沉 + 重结晶', desc: '调控 pH 实现黄酮/香豆素沉淀纯化。' },
    { id: 'salting_out', name: '石灰乳除杂 + 盐析', desc: '同离子效应沉淀盐酸小檗碱。' },
    { id: 'ph_extract', name: 'pH 梯度溶剂萃取', desc: '依次分离大黄酸/大黄素/大黄酚。' },
    { id: 'column', name: '硅胶柱层析洗脱', desc: '按极性梯度精密分离单体。' },
    { id: 'resin', name: '大孔树脂梯度纯化', desc: '去糖除杂，富集皂苷与黄酮苷。' }
  ];

  const DIY_DETECT_LIST = ['TLC 对照比对', '毛细管熔点测定', '滤纸油斑试验', '香草醛-硫酸显色', '盐酸-镁粉显色', 'FeCl₃ 显色', '碘化铋钾沉淀', 'Bornträger 显红', '365nm 紫外荧光'];

  const LAB_RIGS = {
    steam: {
      title: '水蒸气蒸馏挥发油提取装置', videoKw: '中药化学 水蒸气蒸馏 挥发油测定器',
      order: '电热套 → 圆底烧瓶(加沸石与10倍水) → 挥发油测定器(注水调零) → 球形冷凝管(下进上出冷水)。',
      plainTheory: '【水蒸气共沸·挥发油便车法】挥发油常温是液体、沸点多在 180~250℃，如果直接高温干烧会严重焦化分解。利用水蒸气分压原理，当水与油共沸时，沸点降低至 100℃ 以下。水蒸气带着微小油滴一起升华进入冷凝管，遇冷液化后在测定管中利用密度差自动油水分层（比水轻浮在上层，比水重沉在下层），轻松分离纯油。',
      equipment: ['1000mL圆底烧瓶', '调温电热套', '挥发油测定器', '球形冷凝管', '铁架台双夹', '沸石'],
      hotspots: [
        { id: 1, name: '圆底烧瓶与电热套', desc: '装液不超容积 2/3，加 3~5 粒沸石防暴沸。', warn: '先通水后通电，微沸防乳化。' },
        { id: 2, name: '导汽支管与磨口', desc: '微涂凡士林保证密闭，共沸蒸汽由此进入冷凝段。', warn: '漏气会直接拉低出油率。' },
        { id: 3, name: '球形冷凝管', desc: '冷却水下进上出逆流换热。', warn: '卡扣加固水管防崩脱。' },
        { id: 4, name: '刻度测定管', desc: '油水自动分层，薄荷油浮于上层直读体积。', warn: '先注水调零防初期油滴挂壁。' },
        { id: 5, name: '回流管与放液活塞', desc: '芳香水回流，结束先放水再接纯油。', warn: '油层立即加无水 Na₂SO₄ 脱水。' }
      ],
      svg: `<svg viewBox="0 0 420 260" class="w-full max-w-md h-auto"><defs><linearGradient id="wG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#bae6fd"/><stop offset="100%" stop-color="#38bdf8"/></linearGradient><linearGradient id="oG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fde047"/><stop offset="100%" stop-color="#eab308"/></linearGradient></defs><rect x="35" y="232" width="160" height="8" rx="4" fill="#475569"/><rect x="52" y="24" width="7" height="210" rx="3" fill="#64748b"/><rect x="58" y="82" width="72" height="5" rx="2" fill="#94a3b8"/><rect x="58" y="138" width="52" height="5" rx="2" fill="#94a3b8"/><path d="M92 204 Q130 240 168 204 L172 232 L88 232 Z" fill="#1e293b"/><rect x="115" y="216" width="30" height="8" rx="4" fill="#ef4444"/><circle cx="130" cy="182" r="34" fill="#fff" stroke="#0f5c54" stroke-width="2.5"/><path d="M99 186 A32 32 0 0 0 161 186 Z" fill="url(#wG)" opacity="0.82"/><circle cx="120" cy="198" r="2.8" fill="#fff" class="anim-bubble-1"/><circle cx="132" cy="202" r="2.2" fill="#fff" class="anim-bubble-2"/><circle cx="141" cy="196" r="2.5" fill="#fff" class="anim-bubble-3"/><rect x="122" y="128" width="16" height="24" fill="#fff" stroke="#0f5c54" stroke-width="2.5"/><path d="M130 128 L130 98 L255 98 L255 112" fill="none" stroke="#0f5c54" stroke-width="4"/><path d="M130 128 L130 98 L255 98 L255 112" fill="none" stroke="#6ee7b7" stroke-width="2" class="anim-flow"/><rect x="242" y="24" width="26" height="76" rx="10" fill="#e0f2fe" stroke="#0284c7" stroke-width="2" opacity="0.85"/><path d="M255 24 L255 100" stroke="#0f5c54" stroke-width="3"/><circle cx="255" cy="96" r="2.6" fill="#0284c7" class="anim-drop"/><line x1="268" y1="84" x2="312" y2="84" stroke="#0284c7" stroke-width="2"/><text x="316" y="87" font-size="9" fill="#0369a1" font-weight="700">冷水进 ←</text><line x1="268" y1="38" x2="312" y2="38" stroke="#f97316" stroke-width="2"/><text x="316" y="41" font-size="9" fill="#c2410c" font-weight="700">热水出 →</text><rect x="247" y="112" width="16" height="72" rx="3" fill="#fff" stroke="#0f5c54" stroke-width="2.2"/><rect x="248" y="122" width="14" height="16" fill="url(#oG)"/><rect x="248" y="138" width="14" height="44" fill="url(#wG)" opacity="0.72"/><text x="272" y="133" font-size="9" fill="#a16207" font-weight="700">挥发油层</text><path d="M247 166 L195 166 L195 118 L138 118" fill="none" stroke="#38bdf8" stroke-width="2.2" class="anim-flow"/><rect x="243" y="186" width="24" height="5" rx="2" fill="#0f5c54"/><path d="M246 206 L264 206 L272 232 L238 232 Z" fill="#fff" stroke="#0f5c54" stroke-width="2"/><g class="hotspot-btn" data-hotspot="1"><circle cx="130" cy="182" r="11" fill="#0a3630"/><text x="130" y="186" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">1</text></g><g class="hotspot-btn" data-hotspot="2"><circle cx="185" cy="98" r="11" fill="#0a3630"/><text x="185" y="102" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">2</text></g><g class="hotspot-btn" data-hotspot="3"><circle cx="255" cy="60" r="11" fill="#0284c7"/><text x="255" y="64" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">3</text></g><g class="hotspot-btn" data-hotspot="4"><circle cx="255" cy="148" r="11" fill="#c58a32"/><text x="255" y="152" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">4</text></g><g class="hotspot-btn" data-hotspot="5"><circle cx="255" cy="218" r="11" fill="#0a3630"/><text x="255" y="222" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">5</text></g></svg>`
    },
    reflux: {
      title: '有机溶剂加热回流提取装置', videoKw: '加热回流提取装置 球形冷凝管 搭建',
      order: '水浴锅就位 → 圆底烧瓶固定 → 加料、溶剂与沸石 → 垂直装球形冷凝管(顶端敞口) → 通冷水后加热。',
      plainTheory: '【恒温循环·防烧干无限浸出法】用乙醇等有机溶剂提取时，溶剂极易挥发且易燃。烧瓶上方垂直连接球形冷凝管，溶剂沸腾汽化升腾，遇冷水重新冷凝为液体回流到烧瓶中。这样即使连续加热数小时，溶剂总量基本不减，始终在恒定沸点温度下连续、高效地把药材内部成分浸提出来。',
      equipment: ['500mL圆底烧瓶', '恒温水浴锅', '球形冷凝管', '铁架台双夹', '沸石'],
      hotspots: [
        { id: 1, name: '恒温水浴锅', desc: '易燃有机溶剂优先水浴加热，控温平稳。', warn: '严禁明火，开启通风橱。' },
        { id: 2, name: '圆底烧瓶', desc: '装液不超容积 2/3，必加沸石。', warn: '防暴沸冲入冷凝管。' },
        { id: 3, name: '球形冷凝管', desc: '冷水下进上出，持续回流浸提。', warn: '顶端严禁加塞密闭！' },
        { id: 4, name: '双点铁夹', desc: '垂直夹持瓶颈与冷凝管。', warn: '垫橡皮防夹碎玻璃。' }
      ],
      svg: `<svg viewBox="0 0 420 260" class="w-full max-w-md h-auto"><rect x="90" y="232" width="180" height="8" rx="4" fill="#475569"/><rect x="110" y="22" width="7" height="212" rx="3" fill="#64748b"/><rect x="116" y="72" width="90" height="5" rx="2" fill="#94a3b8"/><rect x="116" y="148" width="90" height="5" rx="2" fill="#94a3b8"/><rect x="160" y="196" width="100" height="36" rx="6" fill="#1e293b"/><rect x="168" y="202" width="84" height="16" fill="#38bdf8" opacity="0.6"/><circle cx="210" cy="180" r="34" fill="#fff" stroke="#0f5c54" stroke-width="2.5"/><path d="M179 185 A32 32 0 0 0 241 185 Z" fill="#f59e0b" opacity="0.58"/><circle cx="202" cy="196" r="2.5" fill="#fff" class="anim-bubble-1"/><circle cx="218" cy="198" r="2.2" fill="#fff" class="anim-bubble-2"/><rect x="202" y="128" width="16" height="22" fill="#fff" stroke="#0f5c54" stroke-width="2.5"/><rect x="195" y="34" width="30" height="94" rx="12" fill="#e0f2fe" stroke="#0284c7" stroke-width="2" opacity="0.85"/><circle cx="210" cy="54" r="8" fill="#fff" stroke="#0f5c54" stroke-width="1.8"/><circle cx="210" cy="80" r="8" fill="#fff" stroke="#0f5c54" stroke-width="1.8"/><circle cx="210" cy="106" r="8" fill="#fff" stroke="#0f5c54" stroke-width="1.8"/><circle cx="210" cy="128" r="2.8" fill="#f59e0b" class="anim-drop"/><line x1="225" y1="112" x2="275" y2="112" stroke="#0284c7" stroke-width="2"/><text x="280" y="115" font-size="9" fill="#0369a1" font-weight="700">冷水进 ←</text><line x1="225" y1="48" x2="275" y2="48" stroke="#f97316" stroke-width="2"/><text x="280" y="51" font-size="9" fill="#c2410c" font-weight="700">热水出 →</text><g class="hotspot-btn" data-hotspot="1"><circle cx="210" cy="218" r="11" fill="#0a3630"/><text x="210" y="222" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">1</text></g><g class="hotspot-btn" data-hotspot="2"><circle cx="210" cy="180" r="11" fill="#c58a32"/><text x="210" y="184" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">2</text></g><g class="hotspot-btn" data-hotspot="3"><circle cx="210" cy="80" r="11" fill="#0284c7"/><text x="210" y="84" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">3</text></g><g class="hotspot-btn" data-hotspot="4"><circle cx="145" cy="74" r="11" fill="#475569"/><text x="145" y="78" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">4</text></g></svg>`
    },
    soxhlet: {
      title: '索氏连续提取器（Soxhlet 虹吸循环）', videoKw: '索氏提取器 搭建 使用方法',
      order: '水浴锅 → 烧瓶装低沸点溶剂 → 滤纸筒装药(不超虹吸管顶) → 球形冷凝管通冷水。',
      plainTheory: '【全自动虹吸·极省溶剂榨干法】普通浸润需要耗费数倍的新鲜溶剂。索氏提取器利用虹吸管原理：烧瓶中溶剂汽化经侧管上升，冷凝后滴入装有药材的滤纸筒中浸泡；当液面涨到虹吸管弯折处顶点时，瞬间触发虹吸，把浸出液“哗啦”一下子全抽回烧瓶底！溶剂再次汽化循环，有效成分留在烧瓶，用极少量的溶剂就能完成 6~10 次反复新鲜浸提。',
      equipment: ['250mL烧瓶', '索氏提取筒', '滤纸筒与脱脂棉', '球形冷凝管', '恒温水浴锅'],
      hotspots: [
        { id: 1, name: '溶剂蒸发烧瓶', desc: '石油醚/乙醚低温汽化上升。', warn: '热敏成分严控水浴温度。' },
        { id: 2, name: '滤纸药材筒', desc: '顶部压少量脱脂棉防漂浮。', warn: '高度严禁超过虹吸管顶点！' },
        { id: 3, name: '自动虹吸管', desc: '液面达顶点自动全量虹吸回烧瓶。', warn: '虹吸 6~10 次至无色即止。' },
        { id: 4, name: '球形冷凝管', desc: '蒸汽冷凝滴入药材筒。', warn: '保持冷却水充足防挥发。' }
      ],
      svg: `<svg viewBox="0 0 420 260" class="w-full max-w-md h-auto"><rect x="160" y="204" width="100" height="30" rx="6" fill="#1e293b"/><circle cx="210" cy="190" r="28" fill="#fff" stroke="#0f5c54" stroke-width="2.4"/><path d="M185 194 A26 26 0 0 0 235 194 Z" fill="#fcd34d" opacity="0.7"/><rect x="190" y="96" width="40" height="62" rx="4" fill="#fff" stroke="#0f5c54" stroke-width="2.4"/><rect x="197" y="114" width="26" height="38" rx="3" fill="#fef3c7" stroke="#d97706" stroke-width="1.5" stroke-dasharray="3 2"/><path d="M210 162 L248 162 L248 104 L230 104" fill="none" stroke="#0f5c54" stroke-width="3.5"/><path d="M210 162 L248 162 L248 104 L230 104" fill="none" stroke="#6ee7b7" stroke-width="1.8" class="anim-flow"/><path d="M190 150 L174 150 L174 108 L184 108 L184 168 L206 168" fill="none" stroke="#d97706" stroke-width="2.4" class="anim-flow"/><rect x="196" y="24" width="28" height="72" rx="10" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/><circle cx="210" cy="96" r="2.6" fill="#0284c7" class="anim-drop"/><text x="260" y="136" font-size="9" fill="#0f5c54" font-weight="700">蒸汽上升 ↑</text><text x="115" y="136" font-size="9" fill="#b45309" font-weight="700">虹吸回流 ↓</text><g class="hotspot-btn" data-hotspot="1"><circle cx="210" cy="196" r="11" fill="#0a3630"/><text x="210" y="200" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">1</text></g><g class="hotspot-btn" data-hotspot="2"><circle cx="210" cy="132" r="11" fill="#c58a32"/><text x="210" y="136" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">2</text></g><g class="hotspot-btn" data-hotspot="3"><circle cx="174" cy="126" r="11" fill="#ea580c"/><text x="174" y="130" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">3</text></g><g class="hotspot-btn" data-hotspot="4"><circle cx="210" cy="58" r="11" fill="#0284c7"/><text x="210" y="62" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">4</text></g></svg>`
    },
    ultrasound: {
      title: '超声波辅助低温提取装置', videoKw: '超声波辅助提取 中药成分 实验操作',
      order: '超声槽注水至液位线 → 具塞锥形瓶加料与溶剂 → 置网篮中 → 设 40kHz / 300W 定时提取。',
      plainTheory: '【微观声波空化·低温瞬间破壁法】热敏成分（如青蒿素、多糖、苷类）受热易氧化或降解失活。超声波以每秒 20000~40000 次的高频震荡，在液体中瞬间产生数以亿计的微气泡（空化效应），气泡急剧闭合破裂释放瞬间强冲击波和微射流，像无数微型小锤子把植物细胞壁“震破”，常温下 20~30 分钟即可高效率溶出有效成分。',
      equipment: ['数控超声提取机', '250mL具塞锥形瓶', '不锈钢网篮', '温度探头'],
      hotspots: [
        { id: 1, name: '压电换能器与空化效应', desc: '40 kHz 微气泡破裂破碎细胞壁，大幅提速。', warn: '严禁无水空载开机！' },
        { id: 2, name: '具塞锥形瓶', desc: '轻塞防挥发，放于网篮防贴底震裂。', warn: '瓶塞勿拧死防胀气。' },
        { id: 3, name: '恒温水浴槽', desc: '实时控温防超声生热破坏热敏成分。', warn: '有机溶剂须在通风橱操作。' }
      ],
      svg: `<svg viewBox="0 0 420 260" class="w-full max-w-md h-auto"><rect x="82" y="108" width="256" height="124" rx="14" fill="#1e293b" stroke="#0f5c54" stroke-width="2.5"/><rect x="96" y="118" width="228" height="82" rx="8" fill="#e0f2fe"/><circle cx="210" cy="186" r="24" fill="none" stroke="#0284c7" stroke-width="2" class="anim-sonar"/><circle cx="210" cy="186" r="24" fill="none" stroke="#0f766e" stroke-width="2" class="anim-sonar-2"/><path d="M198 62 L222 62 L222 96 L248 184 L172 184 L198 96 Z" fill="#fff" stroke="#0f5c54" stroke-width="2.4"/><path d="M180 156 L240 156 L246 182 L174 182 Z" fill="#f59e0b" opacity="0.6"/><rect x="196" y="52" width="28" height="10" rx="3" fill="#94a3b8"/><rect x="130" y="208" width="160" height="16" rx="4" fill="#0f172a"/><text x="210" y="219" text-anchor="middle" font-size="9" fill="#34d399" font-family="monospace">40 kHz · 300 W · 35.0℃</text><g class="hotspot-btn" data-hotspot="1"><circle cx="210" cy="214" r="10" fill="#0a3630"/><text x="210" y="218" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">1</text></g><g class="hotspot-btn" data-hotspot="2"><circle cx="210" cy="134" r="11" fill="#c58a32"/><text x="210" y="138" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">2</text></g><g class="hotspot-btn" data-hotspot="3"><circle cx="122" cy="154" r="11" fill="#0284c7"/><text x="122" y="158" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">3</text></g></svg>`
    },
    filter: {
      title: '减压抽滤精制与析晶收集装置', videoKw: '减压抽滤 布氏漏斗 安全瓶 搭建',
      order: '裁剪滤纸润湿贴紧布氏漏斗 → 漏斗斜口背向支管 → 串联安全缓冲瓶 → 连接真空泵。',
      plainTheory: '【布氏漏斗·真空负压强力抽滤法】中药提取液常伴有大量细小残渣和黏性胶质，如果用普通漏斗重力过滤，滴得很慢甚至堵死滤纸。减压抽滤将布氏漏斗密封在厚壁抽滤瓶上，连接真空泵抽走瓶内空气形成负压，外界 1 个大气压强行把液体快速压过滤纸，几秒钟即可完成固液分离，得到干爽紧实的残渣或结晶。',
      equipment: ['布氏漏斗与滤纸', '500mL抽滤瓶', '安全防倒吸瓶', '循环水真空泵', '厚壁真空管'],
      hotspots: [
        { id: 1, name: '布氏漏斗', desc: '滤纸盖住全部微孔，先润湿贴紧。', warn: '防卷边致结晶穿滤。' },
        { id: 2, name: '抽滤瓶', desc: '斜口背向支管防滤液倒吸入泵。', warn: '液面不超支管下 3 cm。' },
        { id: 3, name: '安全缓冲瓶', desc: '阻断停泵倒吸水。', warn: '结束必须“先拔管放气，再关泵”！' }
      ],
      svg: `<svg viewBox="0 0 420 260" class="w-full max-w-md h-auto"><rect x="92" y="54" width="66" height="36" rx="4" fill="#fff" stroke="#0f5c54" stroke-width="2.4"/><line x1="94" y1="84" x2="156" y2="84" stroke="#0f5c54" stroke-width="2" stroke-dasharray="4 3"/><path d="M98 90 L152 90 L132 118 L118 118 Z" fill="#fff" stroke="#0f5c54" stroke-width="2.4"/><path d="M114 118 L136 118 L136 144 L172 222 L78 222 L114 144 Z" fill="#fff" stroke="#0f5c54" stroke-width="2.5"/><path d="M88 200 L162 200 L170 220 L80 220 Z" fill="#bae6fd" opacity="0.82"/><circle cx="125" cy="146" r="2.8" fill="#0284c7" class="anim-drop"/><path d="M136 134 L220 134 L220 165" fill="none" stroke="#475569" stroke-width="3"/><path d="M136 134 L220 134 L220 165" fill="none" stroke="#38bdf8" stroke-width="1.6" class="anim-flow"/><rect x="200" y="148" width="60" height="74" rx="10" fill="#f8fafc" stroke="#0284c7" stroke-width="2.4"/><path d="M242 155 L242 134 L310 134 L310 170" fill="none" stroke="#475569" stroke-width="3"/><path d="M242 155 L242 134 L310 134 L310 170" fill="none" stroke="#38bdf8" stroke-width="1.6" class="anim-flow"/><rect x="290" y="170" width="84" height="52" rx="8" fill="#1e293b"/><text x="332" y="200" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">循环水真空泵</text><g class="hotspot-btn" data-hotspot="1"><circle cx="125" cy="70" r="11" fill="#0a3630"/><text x="125" y="74" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">1</text></g><g class="hotspot-btn" data-hotspot="2"><circle cx="125" cy="176" r="11" fill="#c58a32"/><text x="125" y="180" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">2</text></g><g class="hotspot-btn" data-hotspot="3"><circle cx="230" cy="186" r="11" fill="#0284c7"/><text x="230" y="190" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">3</text></g></svg>`
    },
    column: {
      title: '硅胶柱层析梯度洗脱装置', videoKw: '硅胶柱层析 装柱 洗脱 中药化学实验',
      order: '柱底塞脱脂棉排气泡 → 湿法匀浆装200~300目硅胶 → 干/湿法上样 → 极性由小到大梯度洗脱。',
      plainTheory: '【硅胶正相吸附·微观赛跑分离法】混合物中各种成分性质接近，无法用简单过滤分离。柱子里装满高极性固体硅胶（像一张布满亲水抓手的网），当混合物随洗脱剂流过时，极性越大的成分被硅胶抓得越紧、走得越慢（排在后排）；极性小的成分吸附弱、走得飞快（排在前排）。洗脱剂极性逐步调大，各成分就能被拉开距离、分段收集。',
      equipment: ['玻璃层析柱', '200~300目硅胶', '脱脂棉与海砂', '梯度洗脱剂', '接收试管架'],
      hotspots: [
        { id: 1, name: '梯度洗脱剂', desc: '沿壁缓加防冲散柱头，极性由小到大。', warn: '全过程严禁干柱！' },
        { id: 2, name: '硅胶固定相色带', desc: '小极性组分先洗脱，大极性后洗脱。', warn: '流速控 1~2 滴/秒防拖尾。' },
        { id: 3, name: '分段收集与 TLC 追踪', desc: '每 15 mL 接一管，TLC 合并纯流分。', warn: '换梯度时及时标注管号。' }
      ],
      svg: `<svg viewBox="0 0 420 260" class="w-full max-w-md h-auto"><rect x="115" y="232" width="190" height="8" rx="4" fill="#475569"/><rect x="135" y="18" width="7" height="216" rx="3" fill="#64748b"/><rect x="142" y="72" width="54" height="5" rx="2" fill="#94a3b8"/><rect x="192" y="26" width="36" height="156" rx="4" fill="#fff" stroke="#0f5c54" stroke-width="2.4"/><rect x="194" y="34" width="32" height="24" fill="#e0f2fe" opacity="0.8"/><rect x="194" y="58" width="32" height="114" fill="#f8fafc"/><g class="anim-band"><rect x="194" y="74" width="32" height="10" fill="#ef4444" opacity="0.75"/><rect x="194" y="102" width="32" height="12" fill="#f59e0b" opacity="0.8"/><rect x="194" y="132" width="32" height="10" fill="#10b981" opacity="0.8"/></g><rect x="194" y="172" width="32" height="8" fill="#cbd5e1"/><rect x="198" y="184" width="24" height="6" rx="2" fill="#0f5c54"/><circle cx="210" cy="196" r="2.5" fill="#10b981" class="anim-drop"/><path d="M200 206 L220 206 L225 232 L195 232 Z" fill="#fff" stroke="#0f5c54" stroke-width="2"/><text x="240" y="83" font-size="9" fill="#b91c1c" font-weight="700">大极性</text><text x="240" y="112" font-size="9" fill="#b45309" font-weight="700">目标单体</text><text x="240" y="140" font-size="9" fill="#047857" font-weight="700">小极性先出</text><g class="hotspot-btn" data-hotspot="1"><circle cx="210" cy="44" r="10" fill="#0284c7"/><text x="210" y="48" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">1</text></g><g class="hotspot-btn" data-hotspot="2"><circle cx="210" cy="112" r="11" fill="#c58a32"/><text x="210" y="116" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">2</text></g><g class="hotspot-btn" data-hotspot="3"><circle cx="210" cy="218" r="10" fill="#0a3630"/><text x="210" y="222" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">3</text></g></svg>`
    },
    extract: {
      title: '分液漏斗液-液萃取与 pH 梯度分离装置', videoKw: '分液漏斗 液液萃取 放气 乳化处理 中药化学实验',
      order: '分液漏斗试漏涂凡士林 → 铁圈固定 → 倒入水相与萃取溶剂 → 双手握紧倒置轻摇并及时开塞放气 → 静置分层后下层从下口放出、上层从上口倒出。',
      plainTheory: '【分液漏斗·水油选边站分配法】向提取液中加入互不相溶的有机溶剂（如水与乙酸乙酯），在分液漏斗中剧烈振摇。目标成分遵循“相似相溶”，若脂溶性好就会成群结队钻入有机层，而水溶性淀粉、鞣质等留在水层。静置分层后旋开活塞放出下层、倒出上层，遵循“多次少量”（每次 20mL 分 3 次提取远优于一次用 60mL）实现高效富集。',
      equipment: ['500mL梨形分液漏斗', '铁架台与铁圈', '250mL锥形瓶', 'pH精密试纸', '无水硫酸钠'],
      hotspots: [
        { id: 1, name: '磨口玻璃塞（倒置放气）', desc: '右手食指顶住瓶塞、左手握活塞；每轻摇 2~3 下立即倒置开活塞放气。', warn: '使用氯仿、乙醚或酸碱中和产气时，不放气极易冲塞喷液！' },
        { id: 2, name: '上下两相分配界面', desc: '乙酸乙酯/正丁醇在上层，氯仿在下层；遵循少量多次萃取原则。', warn: '若出现乳化层，可静置、轻搅或加饱和 NaCl 盐析破乳。' },
        { id: 3, name: '活塞与接液瓶', desc: '分液前先拔去上口玻璃塞平衡气压，下层从下口放出，上层由上口倒出。', warn: '合并有机层后加无水 Na₂SO₄ 脱水再减压浓缩。' }
      ],
      svg: `<svg viewBox="0 0 420 260" class="w-full max-w-md h-auto"><rect x="110" y="232" width="180" height="8" rx="4" fill="#475569"/><rect x="132" y="22" width="7" height="212" rx="3" fill="#64748b"/><rect x="139" y="128" width="44" height="5" rx="2" fill="#94a3b8"/><rect x="200" y="26" width="20" height="14" rx="3" fill="#94a3b8"/><path d="M202 40 L218 40 L218 54 C248 64 252 108 220 154 L218 178 L202 178 L200 154 C168 108 172 64 202 54 Z" fill="#fff" stroke="#0f5c54" stroke-width="2.5"/><path d="M180 96 C180 76 196 64 210 64 C224 64 240 76 240 96 L237 110 L183 110 Z" fill="#fbbf24" opacity="0.72"/><path d="M183 110 L237 110 L220 154 L200 154 Z" fill="#38bdf8" opacity="0.62"/><line x1="182" y1="110" x2="238" y2="110" stroke="#0f5c54" stroke-width="1.6" stroke-dasharray="3 2"/><rect x="196" y="162" width="28" height="6" rx="2" fill="#0a3630"/><circle cx="210" cy="186" r="2.8" fill="#0284c7" class="anim-drop"/><path d="M196 204 L224 204 L232 232 L188 232 Z" fill="#fff" stroke="#0f5c54" stroke-width="2.2"/><text x="246" y="82" font-size="8.5" fill="#b45309" font-weight="700">上层：轻质有机相(乙酸乙酯/正丁醇)<tspan x="246" dy="11" font-size="7.5" fill="#64748b">（若用氯仿等重质溶剂，则水相在上）</tspan></text><text x="246" y="124" font-size="8.5" fill="#0369a1" font-weight="700">下层：水相（常规轻质溶剂体系）<tspan x="246" dy="11" font-size="7.5" fill="#64748b">（若用氯仿/二氯甲烷，则有机相在下）</tspan></text><g class="hotspot-btn" data-hotspot="1"><circle cx="210" cy="34" r="10" fill="#0a3630"/><text x="210" y="38" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">1</text></g><g class="hotspot-btn" data-hotspot="2"><circle cx="210" cy="110" r="11" fill="#c58a32"/><text x="210" y="114" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">2</text></g><g class="hotspot-btn" data-hotspot="3"><circle cx="210" cy="165" r="10" fill="#0284c7"/><text x="210" y="169" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">3</text></g></svg>`
    }
  };

  const REPORT_MODULES = [
    { id: 'cover', title: '封面与成员分工', rec: '必填', cls: 'bg-teal-50 text-[#0f5c54] border-teal-200', slim: true },
    { id: 'origin', title: '一、药材基原与药典依据', rec: '推荐', cls: 'bg-teal-50 text-[#0f5c54] border-teal-200', slim: true },
    { id: 'theory', title: '二、核心公式原理与中西医结合视角', rec: '核心', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200', slim: true },
    { id: 'scheme', title: '三、工艺路线与配置参数', rec: '核心', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200', slim: true },
    { id: 'rig', title: '四、实验装置与安全要点', rec: '可省略', cls: 'bg-amber-50 text-amber-800 border-amber-200', slim: false },
    { id: 'scaling', title: '五、SOP 执行记录', rec: '可省略', cls: 'bg-amber-50 text-amber-800 border-amber-200', slim: false },
    { id: 'data', title: '六、平行数据统计与 TLC 检识', rec: '核心', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200', slim: true },
    { id: 'troubleshoot', title: '七、异常排障讨论', rec: '加分项', cls: 'bg-slate-100 text-slate-600 border-slate-200', slim: false },
    { id: 'conclusion', title: '八、标准学术结论与参考文献', rec: '必填', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200', slim: true }
  ];

  const FEATURED_PRESETS = {
    mint: {
      id: 'mint', herb: '薄荷', isClassGroup: true, compound: '薄荷挥发油、薄荷脑', latin: 'Mentha haplocalyx Briq.', category: '挥发油与萜类',
      defaultRig: 'steam', defaultExtract: 'steam', defaultSep: 'freeze', formulas: ['distill', 'diffusion', 'qc'],
      defaultCfg: { mass: 100, ratio: 10, temp: 100, time: 240, mesh: '切段(1~2cm)', cycles: '1', solventType: '纯化水', ph: '中性 7.0' },
      limitVal: 0.80, limitUnit: '% (mL/g)', crudeUnit: 'mL', mpRef: '42～44℃',
      origin: '唇形科植物薄荷干燥地上部分。性凉味辛，疏散风热、清利头目。',
      chemistry: '主含左旋薄荷醇（62%～87%，熔点 42～44℃，比旋度 -49°至-50°）及薄荷酮。',
      pharmacopoeia: '《中国药典》规定含挥发油 ≥ 0.80% (mL/g)（饮片 ≥ 0.40%）。',
      integrative: '中西医结合视角：除传统解表疏风外，薄荷脑可扰动皮肤角质层脂质双分子层，作为天然透皮吸收促进剂（参考中山大学药学院经皮递药研究），广泛与西药镇痛/抗炎乳膏或微针贴剂联用。',
      scaling: { auxName: 'NaCl 盐析', auxFactor: 0.20, auxUnit: 'g', yieldLow: 0.008, yieldHigh: 0.015, yieldUnit: 'mL' },
      tlcSystem: '硅胶 G 板；甲苯-乙酸乙酯 (19:1)；香草醛-硫酸 105℃ 显色。',
      tlcDefault: { front: 8.0, sample: 4.1, ref: 4.2 },
      steps: [
        { stage: '提取', title: '切段润胀与水蒸气蒸馏', principle: '依据道尔顿分压定律，挥发油与水在低于 100℃ 共沸馏出。', qc: '微沸 4 h 至油层体积恒定。' },
        { stage: '分离', title: '盐析破乳与无水 Na₂SO₄ 脱水', principle: '增大水相离子强度降低油溶解度，无水硫酸钠除微量水。', qc: '脱水至粉末松散不结块。' },
        { stage: '纯化', title: '梯度冷冻析晶分离薄荷脑', principle: '利用薄荷脑熔点(42~44℃)远高于薄荷酮实现低温结晶。', qc: '-18℃ 静置 12~24 h，必要时加晶种。' },
        { stage: '检识', title: '油斑挥发、熔点与 TLC 对照', principle: '挥发性确证叠加硅胶吸附分配 Rf 比对。', qc: '熔点 42~44℃，|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [{ issue: '出油率偏低', cause: '药材陈旧或蒸馏时间短。', fix: '换新鲜带叶饮片，蒸馏 4~5 h。' }, { issue: '馏液乳化', cause: '火力过猛或水温高。', fix: '缓沸并加饱和 NaCl 盐析。' }],
      sop: ['称取薄荷饮片并加沸石', '组装挥发油测定器并通冷凝水', '微沸蒸馏 4 h 记录刻度', 'NaCl 盐析与无水 Na₂SO₄ 脱水', '冷冻析晶测熔点与 TLC 检识'],
      chemTests: [{ name: '滤纸油斑挥发试验', passed: true }, { name: '薄荷脑针状结晶与清凉香气', passed: true }, { name: '香草醛-硫酸显色', passed: true }, { name: 'TLC 对照品同位置单斑', passed: true }],
      demoBatches: [{ mass: 100, crude: 1.05, refined: 0.48, mp: 42.8 }, { mass: 100, crude: 1.12, refined: 0.52, mp: 43.1 }, { mass: 100, crude: 1.08, refined: 0.50, mp: 42.9 }]
    },
    phellodendron: {
      id: 'phellodendron', herb: '关黄柏', compound: '盐酸小檗碱', latin: 'Phellodendron amurense Rupr.', category: '生物碱',
      defaultRig: 'filter', defaultExtract: 'acid_water', defaultSep: 'salting_out', formulas: ['henderson', 'diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 25, time: 180, mesh: '粗粉(10~20目)', cycles: '2', solventType: '0.5%酸水', ph: '酸提2 / 碱除杂11 / 盐析2' },
      limitVal: 0.60, limitUnit: '%', crudeUnit: 'g', mpRef: '200~206℃(分解)',
      origin: '芸香科植物黄檗干燥树皮。清热燥湿、泻火解毒。',
      chemistry: '季铵型异喹啉生物碱盐酸小檗碱（CAS 633-65-8），水中溶解度 1:500。',
      pharmacopoeia: '《中国药典》以盐酸小檗碱为指标，酸水提取结合石灰乳除杂与盐析精制。',
      integrative: '中西医结合视角：山东中医药大学与浙江省中医药研究院研究表明，口服小檗碱虽外周吸收率低，但在肠道高浓度局部抑制 DPP-Ⅳ 并调节肠道菌群、升高 GLP-1，是中西医结合治疗 2 型糖尿病的明星分子。',
      scaling: { auxName: 'NaCl 盐析', auxFactor: 0.80, auxUnit: 'g', yieldLow: 0.008, yieldHigh: 0.016, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板；正丁醇-冰醋酸-水 (7:1:2)；365 nm 亮黄荧光。',
      tlcDefault: { front: 8.0, sample: 4.5, ref: 4.6 },
      steps: [
        { stage: '提取', title: '0.5% 稀硫酸冷浸/超声提取', principle: '季铵碱成硫酸盐（溶解度 1:30）充分溶出。', qc: '滤过合并提取液。' },
        { stage: '分离', title: '石灰乳调 pH 11~12 除杂', principle: '沉淀酸性树脂与黏液质，小檗碱仍留于液相。', qc: '静置后减压抽滤。' },
        { stage: '纯化', title: '调 pH 2~3 加 NaCl 盐析与重结晶', principle: '同离子效应析出盐酸小檗碱（1:500），热水重结晶。', qc: '4℃ 静置过夜。' },
        { stage: '检识', title: '碘化铋钾、漂白粉显色与 TLC', principle: '酸性漂白粉显樱红，365nm 紫外亮黄荧光。', qc: '|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [{ issue: '过滤缓慢', cause: '黏液质堵塞滤纸。', fix: '沉降倾取上清后减压抽滤。' }],
      sop: ['0.5%硫酸冷浸提取', '石灰乳调pH11~12除杂', '加盐酸调pH2并盐析', '热水重结晶干燥', '显色与365nm TLC检识'],
      chemTests: [{ name: '碘化铋钾橘红沉淀', passed: true }, { name: '酸性漂白粉樱红显色', passed: true }, { name: 'TLC 365nm 荧光单斑', passed: true }],
      demoBatches: [{ mass: 50, crude: 0.58, refined: 0.42, mp: 203.5 }, { mass: 50, crude: 0.62, refined: 0.45, mp: 204.0 }, { mass: 50, crude: 0.60, refined: 0.43, mp: 203.2 }]
    },
    scutellaria: {
      id: 'scutellaria', herb: '黄芩', isClassGroup: true, compound: '黄芩苷', latin: 'Scutellaria baicalensis Georgi', category: '黄酮',
      defaultRig: 'reflux', defaultExtract: 'boil_enzyme', defaultSep: 'acid_precip', formulas: ['henderson', 'diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 100, time: 60, mesh: '粗粉(10~20目)', cycles: '2', solventType: '纯化水', ph: '酸沉 1.5~2.0' },
      limitVal: 9.0, limitUnit: '%', crudeUnit: 'g', mpRef: '223～225℃',
      origin: '唇形科植物黄芩干燥根。清热燥湿、泻火解毒。',
      chemistry: '黄芩苷（C₂₁H₁₈O₁₁，分子量 446.36，CAS 21967-41-9），易被内源黄芩酶水解变绿。',
      pharmacopoeia: '核心工艺为“沸水杀酶保苷”与“80℃ 热液调酸至 pH 1~2 沉淀”。',
      integrative: '中西医结合视角：基于多组学技术（代谢组学+宏基因组学）研究证实黄芩黄酮通过调控 NF-κB / PI3K-Akt 通路发挥抗炎保肝与肿瘤辅助治疗作用，亦常与阿魏酸构建微针共递送系统。',
      scaling: { auxName: '10% HCl 酸沉', auxFactor: 0.40, auxUnit: 'mL', yieldLow: 0.06, yieldHigh: 0.11, yieldUnit: 'g' },
      tlcSystem: '聚酰胺薄膜；乙酸乙酯-丁酮-甲酸-水 (5:3:1:1)；1% FeCl₃ 显色。',
      tlcDefault: { front: 8.0, sample: 3.6, ref: 3.7 },
      steps: [
        { stage: '提取', title: '沸水投料杀酶煎煮', principle: '高温瞬间钝化黄芩酶，保护黄芩苷不被水解氧化。', qc: '先烧沸水后投料。' },
        { stage: '纯化', title: '80℃ 热液调酸沉淀 (pH 1~2)', principle: '依 Henderson-Hasselbalch 方程使葡萄糖醛酸羧基质子化析出。', qc: '保温陈化 1 h 抽滤。' },
        { stage: '检识', title: '盐酸-镁粉、FeCl₃ 与 TLC', principle: '黄酮显红、酚羟基显深绿。', qc: '无绿色水解斑点干扰。' }
      ],
      troubleshoot: [{ issue: '提取液变绿', cause: '冷水浸泡激活黄芩酶。', fix: '先烧沸水再投药，禁用铁器。' }],
      sop: ['纯化水煮沸投药煎煮2次', '趁热过滤浓缩', '80℃调pH1~2保温陈化', '抽滤洗涤烘干', '显色与TLC检识'],
      chemTests: [{ name: '盐酸-镁粉橙红显色', passed: true }, { name: 'FeCl₃ 深绿显色', passed: true }, { name: 'TLC 对照单斑', passed: true }],
      demoBatches: [{ mass: 50, crude: 5.15, refined: 4.62, mp: 223.8 }, { mass: 50, crude: 5.30, refined: 4.78, mp: 224.2 }, { mass: 50, crude: 5.20, refined: 4.68, mp: 223.5 }]
    },
    sophora: {
      id: 'sophora', herb: '槐米', isClassGroup: true, compound: '芦丁', latin: 'Sophora japonica L.', category: '黄酮',
      defaultRig: 'reflux', defaultExtract: 'boil_enzyme', defaultSep: 'acid_precip', formulas: ['henderson', 'diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 95, time: 30, mesh: '粗粉(10~20目)', cycles: '2', solventType: '弱碱硼砂水', ph: '碱提8.5 / 酸沉4.8' },
      limitVal: 15.0, limitUnit: '%', crudeUnit: 'g', mpRef: '185～192℃',
      origin: '豆科植物槐干燥花蕾。凉血止血、清肝泻火。',
      chemistry: '黄酮醇苷芦丁（12%～20%），冷水难溶(1:10000)、沸水可溶(1:200)。',
      pharmacopoeia: '《中国药典》醇溶性浸出物 ≥ 25.0%。硼砂保护邻二酚羟基碱提酸沉。',
      integrative: '中西医结合视角：芦丁即维生素 P 核心组分，与维生素 C 联用可降低毛细血管脆性，广泛用于高血压微循环保护与抗氧化纳米制剂教学实验（参考《大学化学》创新实验教学）。',
      scaling: { auxName: '硼砂保护剂', auxFactor: 0.04, auxUnit: 'g', yieldLow: 0.12, yieldHigh: 0.18, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板；乙酸乙酯-甲酸-水 (8:1:1)；1% AlCl₃ 亮黄荧光。',
      tlcDefault: { front: 8.0, sample: 3.9, ref: 4.0 },
      steps: [
        { stage: '提取', title: '0.4% 硼砂石灰水热提 (pH 8~9)', principle: '硼砂络合邻二酚羟基防氧化，酚羟基成盐溶出。', qc: 'pH 严控 ≤ 9.5。' },
        { stage: '纯化', title: '盐酸调 pH 4.5~5.0 沉淀重结晶', principle: '破坏络合恢复游离态，利用冷热溶解度差重结晶。', qc: '避免 pH < 2 生成烊盐重溶。' },
        { stage: '检识', title: '盐酸-镁粉、Molish 与 AlCl₃ 荧光', principle: '黄酮母核、糖苷紫环与金属络合荧光。', qc: '|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [{ issue: '产品发黑', cause: 'pH > 10 或漏加硼砂。', fix: '先溶 0.4% 硼砂并控 pH 8~9。' }],
      sop: ['配制硼砂石灰水热提', '趁热滤过调pH至4.8', '冷却析晶抽滤水洗', '重结晶烘干称重', '显色与TLC检识'],
      chemTests: [{ name: '盐酸-镁粉樱红', passed: true }, { name: 'Molish 界面紫环', passed: true }, { name: 'AlCl₃ 荧光与 TLC', passed: true }],
      demoBatches: [{ mass: 50, crude: 8.60, refined: 7.45, mp: 187.5 }, { mass: 50, crude: 8.95, refined: 7.72, mp: 188.2 }, { mass: 50, crude: 8.75, refined: 7.58, mp: 187.9 }]
    },
    rheum: {
      id: 'rheum', herb: '大黄', compound: '大黄酸、大黄素、大黄酚', latin: 'Rheum palmatum L.', category: '蒽醌与醌类',
      defaultRig: 'reflux', defaultExtract: 'reflux', defaultSep: 'ph_extract', formulas: ['henderson', 'diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 70, time: 90, mesh: '中粉(40目)', cycles: '1', solventType: '70%乙醇', ph: '梯度 8.3→11→13' },
      limitVal: 1.50, limitUnit: '%', crudeUnit: 'g', mpRef: '大黄素 256～257℃',
      origin: '蓼科植物掌叶大黄干燥根及根茎。泻下攻积、清热泻火。',
      chemistry: '5 种游离蒽醌：大黄酸(含-COOH)、大黄素(CAS 518-82-1，含β-OH)、芦荟大黄素、大黄素甲醚、大黄酚。',
      pharmacopoeia: '利用酸性梯度差异，以 NaHCO₃ → Na₂CO₃ → NaOH 依次萃取分离单体。',
      integrative: '中西医结合视角：中国药科大学研究表明，大黄素通过调控炎症因子、抗纤维化与免疫信号通路，在急性胰腺炎、慢性肾病中西医结合治疗中发挥关键作用。',
      scaling: { auxName: '梯度碱液', auxFactor: 0.50, auxUnit: 'g', yieldLow: 0.015, yieldHigh: 0.025, yieldUnit: 'g' },
      tlcSystem: '硅胶 H 板；石油醚-甲酸乙酯-甲酸 (15:5:1)；氨蒸气熏显红。',
      tlcDefault: { front: 8.0, sample: 4.8, ref: 4.9 },
      steps: [
        { stage: '提取', title: '酸水解结合氯仿同步回流', principle: '水解蒽醌苷为游离苷元并同步萃取入有机相。', qc: '通风橱水浴回流 90 min。' },
        { stage: '分离', title: '5% NaHCO₃ → 5% Na₂CO₃ → 1% NaOH 梯度萃取', principle: '按 -COOH > β-OH > α-OH 酸性递减逐级萃取。', qc: '轻摇分液防乳化。' },
        { stage: '检识', title: 'Bornträger 显红与 TLC 梯度比对', principle: '羟基蒽醌遇碱形成共轭酚盐显樱红色。', qc: '核对 5 斑点 Rf 顺序。' }
      ],
      troubleshoot: [{ issue: '萃取乳化', cause: '剧烈振摇。', fix: '轻缓倒置振摇并静置。' }],
      sop: ['酸水解氯仿回流', 'NaHCO₃萃大黄酸', 'Na₂CO₃萃大黄素', 'NaOH萃大黄酚', 'Bornträger与TLC'],
      chemTests: [{ name: 'Bornträger 樱红显色', passed: true }, { name: '醋酸镁紫红显色', passed: true }, { name: 'TLC 梯度单斑', passed: true }],
      demoBatches: [{ mass: 50, crude: 0.92, refined: 0.65, mp: 256.2 }, { mass: 50, crude: 0.96, refined: 0.68, mp: 256.8 }, { mass: 50, crude: 0.94, refined: 0.66, mp: 256.5 }]
    },
    artemisia: {
      id: 'artemisia', herb: '青蒿', compound: '青蒿素', latin: 'Artemisia annua L.', category: '萜类内酯与环烯醚萜',
      defaultRig: 'soxhlet', defaultExtract: 'soxhlet', defaultSep: 'column', formulas: ['diffusion', 'qc'],
      defaultCfg: { mass: 100, ratio: 8, temp: 45, time: 180, mesh: '中粉(40目)', cycles: '1', solventType: '石油醚(30-60℃)', ph: '中性 7.0' },
      limitVal: 0.45, limitUnit: '%', crudeUnit: 'g', mpRef: '151～153℃',
      origin: '菊科植物黄花蒿干燥地上部分。清虚热、截疟。',
      chemistry: '含过氧桥倍半萜内酯（C₁₅H₂₂O₅），熔点 151~153℃，对高温及强酸强碱不稳定。',
      pharmacopoeia: '低沸点乙醚(34.6℃)或石油醚(30~60℃)低温提取结合硅胶柱层析纯化。',
      integrative: '中西医结合视角：从《肘后备急方》“青蒿一握，以水二升渍”到低温萃取发现过氧桥抗疟机制，并衍生出双氢青蒿素、蒿甲醚等现代一线联合抗疟药(ACTs)，是中西医结合典范。',
      scaling: { auxName: '柱层析硅胶', auxFactor: 1.50, auxUnit: 'g', yieldLow: 0.004, yieldHigh: 0.008, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板；石油醚-乙酸乙酯 (4:1)；香草醛-硫酸显蓝紫。',
      tlcDefault: { front: 8.0, sample: 4.4, ref: 4.5 },
      steps: [
        { stage: '提取', title: '低温石油醚/乙醚索氏提取', principle: '低温保护过氧桥结构不被热裂解。', qc: '水浴严控 ≤50℃，禁明火。' },
        { stage: '分离', title: '硅胶柱层析梯度洗脱', principle: '按极性分离叶绿素、蜡质与青蒿素单体。', qc: 'TLC 追踪合并纯流分。' },
        { stage: '检识', title: '熔点、比旋度与 TLC', principle: '核对 151~153℃ 熔点及对照品 Rf。', qc: '|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [{ issue: '浸膏发黑不出晶', cause: '浓缩温度过高破坏过氧桥。', fix: '减压浓缩 ≤50℃ 并硅胶柱脱色。' }],
      sop: ['低温石油醚索氏提取', '≤50℃减压浓缩', '硅胶柱梯度洗脱', '热石油醚重结晶', '熔点与TLC检识'],
      chemTests: [{ name: '无色针晶与熔点核对', passed: true }, { name: '香草醛-硫酸蓝紫显色', passed: true }, { name: 'TLC 对照单斑', passed: true }],
      demoBatches: [{ mass: 100, crude: 0.62, refined: 0.48, mp: 151.8 }, { mass: 100, crude: 0.65, refined: 0.50, mp: 152.2 }, { mass: 100, crude: 0.63, refined: 0.49, mp: 152.0 }]
        },
    coptis: {
      id: 'coptis', herb: '黄连', compound: '盐酸小檗碱(黄连素)', latin: 'Coptis chinensis Franch.', category: '生物碱', isClassGroup: true,
      defaultRig: 'filter', defaultExtract: 'acid_water', defaultSep: 'salting_out', formulas: ['henderson', 'diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 25, time: 180, mesh: '粗粉(10~20目)', cycles: '2', solventType: '0.5%酸水', ph: '酸提2 / 碱11 / 盐析2' },
      limitVal: 5.5, limitUnit: '%', crudeUnit: 'g', mpRef: '200～206℃(分解)',
      origin: '毛茛科植物黄连干燥根茎。清热燥湿、泻火解毒。',
      chemistry: '小檗碱含量可达 5%~8%，另含巴马汀、黄连碱等季铵型异喹啉生物碱。',
      pharmacopoeia: '《中国药典》以盐酸小檗碱为指标；经典采用 0.5% 硫酸冷浸提取 + 石灰乳除杂 + 盐酸盐析沉淀。',
      integrative: '中西医结合视角：黄连素调节肠道菌群与抑制肠道局部 DPP-Ⅳ 降糖机制已获多项临床与动物实验证实。',
      scaling: { auxName: 'NaCl 盐析', auxFactor: 0.80, auxUnit: 'g', yieldLow: 0.05, yieldHigh: 0.08, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板；正丁醇-冰醋酸-水 (7:1:2)；365nm 显亮黄荧光。',
      tlcDefault: { front: 8.0, sample: 4.5, ref: 4.6 },
      steps: [
        { stage: '提取', title: '0.5% 稀硫酸冷浸/渗漉提取', principle: '小檗碱生成易溶于水的硫酸小檗碱(1:30)溶出。', qc: '冷浸过夜抽滤合并提取液。' },
        { stage: '分离', title: '石灰乳调 pH 11~12 除杂', principle: '除去鞣质、黏液质与酸性色素。', qc: '减压抽滤得澄清碱液。' },
        { stage: '纯化', title: '调 pH 2 加 NaCl 盐析与热水重结晶', principle: '同离子效应沉淀盐酸小檗碱(1:500)。', qc: '4℃ 静置析晶过夜。' },
        { stage: '检识', title: '碘化铋钾、漂白粉显色与 TLC', principle: '酸性漂白粉显樱红色，365nm 紫外亮黄荧光。', qc: '|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [{ issue: '滤液浑浊难滤', cause: '石灰乳过量或沉降时间短。', fix: '静置 30 min 先倾上清再双层滤纸抽滤。' }],
      sop: ['0.5%硫酸冷浸提取黄连粗粉', '石灰乳调pH11~12抽滤除杂', '调pH2加NaCl盐析析晶', '热水重结晶干燥称重', '显色与365nm TLC检识'],
      chemTests: [{ name: '碘化铋钾橘红沉淀', passed: true }, { name: '酸性漂白粉樱红显色', passed: true }, { name: 'TLC 365nm 亮黄荧光', passed: true }],
      demoBatches: [{ mass: 50, crude: 3.10, refined: 2.75, mp: 203.2 }, { mass: 50, crude: 3.25, refined: 2.86, mp: 203.8 }, { mass: 50, crude: 3.18, refined: 2.80, mp: 203.5 }]
    },
    ginkgo_flav: {
      id: 'ginkgo_flav', herb: '银杏叶', compound: '银杏总黄酮(槲皮素/山奈酚苷)', latin: 'Ginkgo biloba L.', category: '黄酮', isClassGroup: true,
      defaultRig: 'reflux', defaultExtract: 'reflux', defaultSep: 'resin', formulas: ['diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 80, time: 90, mesh: '中粉(40目)', cycles: '2', solventType: '70%乙醇', ph: '中性 7.0' },
      limitVal: 0.40, limitUnit: '%', crudeUnit: 'g', mpRef: '总黄酮苷(UV/HPLC)',
      origin: '银杏科植物银杏干燥叶。活血化瘀、通络止痛、化浊降脂。',
      chemistry: '主含黄酮醇苷（槲皮素、山奈酚、异鼠李素糖苷）及双黄酮，另含银杏酚酸需脱除。',
      pharmacopoeia: '70% 乙醇热回流提取，经石油醚脱脂除银杏酸，再上 AB-8/D101 大孔吸附树脂梯度洗脱富集。',
      integrative: '中西医结合视角：银杏叶标准提取物(EGb761)广泛用于心脑血管缺血与认知障碍中西医联合治疗。',
      scaling: { auxName: 'D101大孔树脂', auxFactor: 1.0, auxUnit: 'g', yieldLow: 0.015, yieldHigh: 0.030, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板；乙酸乙酯-丁酮-甲酸-水 (5:3:1:1)；1% AlCl₃ 显荧光。',
      tlcDefault: { front: 8.0, sample: 4.3, ref: 4.4 },
      steps: [
        { stage: '提取', title: '70% 乙醇水浴回流提取 2 次', principle: '中极性醇水体系高效溶出银杏黄酮醇苷。', qc: '80℃ 回流 1.5 h，合并滤液减压浓缩。' },
        { stage: '分离', title: '石油醚萃取脱脂除银杏酸', principle: '除去脂溶性叶绿素及致敏银杏酚酸。', qc: '分液漏斗萃取 2~3 次。' },
        { stage: '纯化', title: '大孔树脂水洗除糖、70%乙醇洗脱', principle: '疏水吸附与分子筛效应富集总黄酮。', qc: '水洗至 Molish 阴性后再换醇洗脱。' },
        { stage: '检识', title: '盐酸-镁粉、AlCl₃ 显色与 TLC', principle: '黄酮母核特征显色与对照品 Rf 比对。', qc: '|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [{ issue: '树脂柱堵塞流速慢', cause: '上样液未离心或含大量叶绿素沉淀。', fix: '浓缩液冷藏静置离心取澄清液上柱。' }],
      sop: ['70%乙醇回流提取2次', '浓缩后石油醚脱脂除杂', '大孔树脂吸附与梯度洗脱', '干燥称重测收率', '盐酸-镁粉与TLC检识'],
      chemTests: [{ name: '盐酸-镁粉显红色', passed: true }, { name: 'AlCl₃ 365nm 黄绿荧光', passed: true }, { name: 'TLC 对照单斑', passed: true }],
      demoBatches: [{ mass: 50, crude: 1.25, refined: 0.85, mp: 192.0 }, { mass: 50, crude: 1.32, refined: 0.90, mp: 192.5 }, { mass: 50, crude: 1.28, refined: 0.88, mp: 192.2 }]
    },
    forsythia: {
      id: 'forsythia', herb: '连翘', compound: '连翘苷(木脂素类)', latin: 'Forsythia suspensa (Thunb.) Vahl', category: '香豆素与木脂素', isClassGroup: true,
      defaultRig: 'extract', defaultExtract: 'reflux', defaultSep: 'column', formulas: ['diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 75, time: 90, mesh: '中粉(40目)', cycles: '2', solventType: '70%乙醇', ph: '中性 7.0' },
      limitVal: 0.15, limitUnit: '%', crudeUnit: 'g', mpRef: '180～183℃',
      origin: '木犀科植物连翘干燥果实。清热解毒、消肿散结。',
      chemistry: '主含双环氧木脂素连翘苷(Phillyrin)及连翘脂素，易溶于热醇与乙酸乙酯。',
      pharmacopoeia: '70% 乙醇回流提取，浓缩后依次石油醚脱脂、乙酸乙酯液-液萃取，再经氧化铝或硅胶柱层析纯化。',
      integrative: '中西医结合视角：连翘木脂素与金银花绿原酸配伍为“银翘散”核心药对，具协同抗病毒作用。',
      scaling: { auxName: '乙酸乙酯萃取剂', auxFactor: 3.0, auxUnit: 'mL', yieldLow: 0.002, yieldHigh: 0.005, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板；三氯甲烷-甲醇 (5:1)；10% 硫酸乙醇 105℃ 显紫红斑点。',
      tlcDefault: { front: 8.0, sample: 4.0, ref: 4.1 },
      steps: [
        { stage: '提取', title: '70% 乙醇回流提取与浓缩', principle: '充分溶出连翘木脂素苷类成分。', qc: '回流 2 次合并减压浓缩至无醇味。' },
        { stage: '分离', title: '石油醚脱脂与乙酸乙酯液-液萃取', principle: '分配系数差异富集中等极性木脂素。', qc: '分液漏斗萃取 3 次合并乙酸乙酯层。' },
        { stage: '纯化', title: '氧化铝/硅胶柱层析纯化', principle: '氯仿-甲醇梯度洗脱去除酚酸与色素。', qc: 'TLC 追踪合并纯连翘苷流分。' },
        { stage: '检识', title: '硫酸乙醇显色与 TLC', principle: '核对连翘苷对照品紫红色特征斑点。', qc: '|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [{ issue: '乙酸乙酯萃取乳化', cause: '连翘含皂苷类表面活性杂质。', fix: '轻摇放气并加入少量饱和 NaCl 破乳。' }],
      sop: ['70%乙醇回流提取连翘粉', '石油醚脱脂与乙酸乙酯萃取', '硅胶/氧化铝柱层析纯化', '浓缩析晶干燥称重', '完成TLC硫酸乙醇显色检识'],
      chemTests: [{ name: '10%硫酸乙醇加热显紫红斑点', passed: true }, { name: 'TLC 连翘苷对照单斑', passed: true }],
      demoBatches: [{ mass: 50, crude: 0.14, refined: 0.09, mp: 181.2 }, { mass: 50, crude: 0.16, refined: 0.10, mp: 181.6 }, { mass: 50, crude: 0.15, refined: 0.095, mp: 181.4 }]
    },
    cassia: {
      id: 'cassia', herb: '决明子', compound: '大黄酚、橙黄决明素', latin: 'Cassia obtusifolia L.', category: '蒽醌与醌类', isClassGroup: true,
      defaultRig: 'reflux', defaultExtract: 'reflux', defaultSep: 'acid_precip', formulas: ['henderson', 'diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 75, time: 90, mesh: '中粉(40目)', cycles: '2', solventType: '70%乙醇', ph: '碱溶12 / 酸沉2' },
      limitVal: 0.20, limitUnit: '%', crudeUnit: 'g', mpRef: '大黄酚 196℃',
      origin: '豆科植物决明干燥成熟种子。清热明目、润肠通便。',
      chemistry: '主含游离及结合型羟基蒽醌（大黄酚、橙黄决明素），脂溶性较强，具酸性酚羟基。',
      pharmacopoeia: '先脱脂再醇提酸水解，利用酚羟基酸性经碱溶酸沉或氯仿萃取分离总蒽醌。',
      integrative: '中西医结合视角：决明子蒽醌兼具调血脂、护眼与缓泻作用，常用于代谢综合征中西医结合干预。',
      scaling: { auxName: '5% NaOH / HCl', auxFactor: 0.50, auxUnit: 'mL', yieldLow: 0.003, yieldHigh: 0.008, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板；石油醚-丙酮 (2:1)；氨蒸气熏显橙红色。',
      tlcDefault: { front: 8.0, sample: 5.1, ref: 5.2 },
      steps: [
        { stage: '提取', title: '脱脂后酸水解-氯仿回流提取', principle: '结合蒽醌水解为游离苷元并溶入氯仿。', qc: '通风橱内回流 1.5 h。' },
        { stage: '纯化', title: '碱溶酸沉精制总蒽醌', principle: '酚羟基遇碱成盐溶于水相，加酸复析。', qc: '调 pH 2 静置抽滤烘干。' },
        { stage: '检识', title: 'Bornträger 显红与 TLC', principle: '羟基蒽醌遇碱显樱红色。', qc: '|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [{ issue: '油脂过多影响结晶', cause: '种子类药材脂肪油含量高。', fix: '提取前先用石油醚冷浸或索氏脱脂。' }],
      sop: ['决明子粉碎脱脂', '酸水解并氯仿回流提取', '碱溶酸沉精制干燥', 'Bornträger与TLC检识'],
      chemTests: [{ name: 'Bornträger 碱液显樱红', passed: true }, { name: 'TLC 大黄酚/橙黄决明素单斑', passed: true }],
      demoBatches: [{ mass: 50, crude: 0.22, refined: 0.14, mp: 195.8 }, { mass: 50, crude: 0.24, refined: 0.15, mp: 196.1 }, { mass: 50, crude: 0.23, refined: 0.145, mp: 196.0 }]
    },
    senna: {
      id: 'senna', herb: '番泻叶', compound: '番泻苷 A/B（二蒽酮苷）', latin: 'Cassia angustifolia Vahl', category: '蒽醌与醌类', isClassGroup: true,
      defaultRig: 'ultrasound', defaultExtract: 'ultrasound', defaultSep: 'resin', formulas: ['henderson', 'diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 12, temp: 45, time: 60, mesh: '粗粉(10~20目)', cycles: '2', solventType: '70%乙醇', ph: '中性 6.5~7.0' },
      limitVal: 1.10, limitUnit: '%', crudeUnit: 'g', mpRef: '183～186℃(分解)',
      origin: '豆科植物狭叶番泻或尖叶番泻干燥小叶。泻热行滞、通便。',
      chemistry: '主含二蒽酮双葡萄糖苷番泻苷 A、B，对高温与强酸强碱敏感易分解。',
      pharmacopoeia: '低温弱碱水或 60% 乙醇超声提取避高温；经大孔吸附树脂或离子交换柱富集纯化。',
      integrative: '中西医结合视角：番泻苷到达结肠经肠道菌群转化为活性大黄酸蒽酮促肠动力，常用于肠道术前清肠。',
      scaling: { auxName: 'D101大孔树脂', auxFactor: 1.0, auxUnit: 'g', yieldLow: 0.012, yieldHigh: 0.025, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板；乙酸乙酯-正丙醇-水 (4:4:3)；365nm 紫外或硝酸-KOH 显色。',
      tlcDefault: { front: 8.0, sample: 3.4, ref: 3.5 },
      steps: [
        { stage: '提取', title: '低温 60% 乙醇超声/温浸提取', principle: '二蒽酮苷热敏易水解，低温提取保留番泻苷 A/B。', qc: '严控温度 ≤50℃。' },
        { stage: '纯化', title: '大孔树脂吸附与 50% 乙醇洗脱', principle: '水洗除糖与水溶性色素，醇洗富集番泻总苷。', qc: '减压低温浓缩干燥。' },
        { stage: '检识', title: '氧化水解 Bornträger 反应与 TLC', principle: '二蒽酮苷需先加酸+氧化剂水解为蒽醌后再显樱红色。', qc: '与番泻苷 A 对照品同板比对。' }
      ],
      troubleshoot: [{ issue: '直接做 Bornträger 呈阴性', cause: '番泻苷为二蒽酮结构，未氧化转化为蒽醌。', fix: '先加盐酸与微量 H₂O₂ 水浴加热氧化水解，再乙醚萃取加氨水即显红。' }],
      sop: ['低温(≤50℃)醇水超声提取', '滤过浓缩并大孔树脂纯化', '低温干燥称重测收率', '氧化水解Bornträger与TLC检识'],
      chemTests: [{ name: '氧化水解后 Bornträger 显樱红', passed: true }, { name: 'TLC 番泻苷 A/B 对照单斑', passed: true }],
      demoBatches: [{ mass: 50, crude: 0.78, refined: 0.60, mp: 184.2 }, { mass: 50, crude: 0.82, refined: 0.63, mp: 184.8 }, { mass: 50, crude: 0.80, refined: 0.61, mp: 184.5 }]
    },
    sedum: {
      id: 'sedum', herb: '垂盆草', compound: '垂盆草苷（氰苷类）', latin: 'Sedum sarmentosum Bunge', category: '氰苷类', isClassGroup: true,
      defaultRig: 'ultrasound', defaultExtract: 'ultrasound', defaultSep: 'resin', formulas: ['diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 50, time: 60, mesh: '切段(1~2cm)', cycles: '2', solventType: '70%乙醇', ph: '中性 7.0' },
      limitVal: 0.50, limitUnit: '%', crudeUnit: 'g', mpRef: '无定形粉末(强水溶性)',
      origin: '景天科植物垂盆草干燥全草。利湿退黄、清热解毒。',
      chemistry: '主含不饱和氰苷垂盆草苷(Sarmentosin)，极性大、易溶于水与醇，另含槲皮素/山奈酚黄酮。',
      pharmacopoeia: '70% 乙醇低温超声提取，经乙酸乙酯脱叶绿素及大孔树脂/正丁醇富集纯化。',
      integrative: '中西医结合视角：垂盆草苷显著降低血清 ALT，是中西医结合治疗病毒性肝炎的经典保肝降酶成分。',
      scaling: { auxName: '大孔树脂/活性炭', auxFactor: 0.80, auxUnit: 'g', yieldLow: 0.005, yieldHigh: 0.012, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板；乙酸乙酯-甲醇-水 (8:2:1)；香草醛-硫酸或碘蒸气显色。',
      tlcDefault: { front: 8.0, sample: 3.8, ref: 3.9 },
      steps: [
        { stage: '提取', title: '70% 乙醇低温超声提取', principle: '快速溶出强极性水溶性氰苷并抑制酶解。', qc: '控温 ≤50℃，提取 2 次合并。' },
        { stage: '分离', title: '乙酸乙酯除杂与大孔树脂富集', principle: '先除叶绿素，再水洗除糖富集垂盆草苷。', qc: '真空低温干燥防吸湿。' },
        { stage: '检识', title: '苦味酸钠试纸法与 TLC', principle: '酶解释放微量 HCN 使苦味酸钠试纸变砖红色。', qc: '通风橱内微量安全操作。' }
      ],
      troubleshoot: [{ issue: '提取物吸湿发黏', cause: '全草含黏液质与多糖。', fix: '大孔树脂水洗除糖后真空干燥。' }],
      sop: ['70%乙醇低温超声提取垂盆草', '乙酸乙酯脱色除叶绿素', '大孔树脂富集垂盆草苷', '苦味酸钠试纸(通风橱)与TLC检识'],
      chemTests: [{ name: '氰苷苦味酸钠试纸变砖红', passed: true }, { name: 'Molish 反应阳性', passed: true }, { name: 'TLC 对照单斑', passed: true }],
      demoBatches: [{ mass: 50, crude: 0.35, refined: 0.28, mp: 145.0 }, { mass: 50, crude: 0.38, refined: 0.30, mp: 145.5 }, { mass: 50, crude: 0.36, refined: 0.29, mp: 145.2 }]
    },
    lonicera: {
      id: 'lonicera', herb: '金银花', compound: '绿原酸（苯丙素有机酸）', latin: 'Lonicera japonica Thunb.', category: '苯丙素与有机酸', isClassGroup: true,
      defaultRig: 'extract', defaultExtract: 'reflux', defaultSep: 'ph_extract', formulas: ['henderson', 'diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 12, temp: 70, time: 60, mesh: '粗粉(10~20目)', cycles: '2', solventType: '70%乙醇', ph: '调酸萃取 pH 2.5' },
      limitVal: 1.50, limitUnit: '%', crudeUnit: 'g', mpRef: '206～208℃',
      origin: '忍冬科植物忍冬干燥花蕾。清热解毒、疏散风热。',
      chemistry: '绿原酸含羧基与邻二酚羟基，呈酸性，高温强碱易异构氧化。',
      pharmacopoeia: '《中国药典》规定绿原酸 ≥ 1.5%。70% 乙醇温提、调酸至 pH 2~3 后以乙酸乙酯液-液萃取纯化。',
      integrative: '中西医结合视角：绿原酸兼具抗菌、抗甲流与抑 α-葡萄糖苷酶活性，是银黄/双黄连等中西医结合抗感染核心 Q-Marker。',
      scaling: { auxName: '乙酸乙酯(pH2.5萃取)', auxFactor: 4.0, auxUnit: 'mL', yieldLow: 0.015, yieldHigh: 0.032, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板；乙酸丁酯-甲酸-水 (7:2.5:2.5) 上层液；365nm 亮蓝色荧光。',
      tlcDefault: { front: 8.0, sample: 3.7, ref: 3.8 },
      steps: [
        { stage: '提取', title: '70% 乙醇 70℃ 回流/超声提取', principle: '温和溶出绿原酸防异构水解。', qc: '提取 2 次减压回收乙醇。' },
        { stage: '分离', title: '调酸 pH 2~3 后乙酸乙酯液-液萃取', principle: '依 Henderson-Hasselbalch 方程抑制羧基电离转入有机相。', qc: '分液漏斗萃取 3~4 次。' },
        { stage: '检识', title: 'FeCl₃ 显色、365nm 蓝色荧光与 TLC', principle: '邻二酚羟基显墨绿，紫外显特征亮蓝荧光。', qc: '|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [{ issue: '萃取收率低', cause: '水相 pH 未调至 2~3。', fix: '稀盐酸精准调至 pH 2.0~2.5 并盐析后萃取。' }],
      sop: ['70%乙醇70℃提取金银花2次', '浓缩至无醇味并调pH至2.5', '分液漏斗乙酸乙酯萃取3次', '脱水浓缩烘干称重', 'FeCl₃与365nm荧光TLC检识'],
      chemTests: [{ name: '三氯化铁显墨绿色', passed: true }, { name: '365nm 特征亮蓝色荧光', passed: true }, { name: 'TLC 绿原酸对照单斑', passed: true }],
      demoBatches: [{ mass: 50, crude: 1.05, refined: 0.82, mp: 206.5 }, { mass: 50, crude: 1.12, refined: 0.88, mp: 207.1 }, { mass: 50, crude: 1.08, refined: 0.85, mp: 206.8 }]
    },
    phellodendron_flav: {
      id: 'phellodendron_flav', herb: '黄柏(黄酮项)', compound: '黄柏黄酮类(黄柏苷)', latin: 'Phellodendron amurense Rupr.', category: '黄酮', isClassGroup: true,
      defaultRig: 'reflux', defaultExtract: 'reflux', defaultSep: 'resin', formulas: ['henderson', 'diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 75, time: 90, mesh: '粗粉(10~20目)', cycles: '2', solventType: '70%乙醇', ph: '中性 7.0' },
      limitVal: 0.50, limitUnit: '%', crudeUnit: 'g', mpRef: '黄柏苷约 230℃',
      origin: '芸香科植物黄檗干燥树皮（聚焦非生物碱部位的黄酮类成分）。',
      chemistry: '含黄柏苷(Phellamurin)等二氢黄酮苷；与小檗碱共存，分离关键在于先除生物碱再富集黄酮。',
      pharmacopoeia: '70% 乙醇回流提取，阳离子树脂截留除生物碱，聚酰胺/大孔树脂纯化黄酮部位。',
      integrative: '中西医结合视角：拓展黄柏非生物碱药效物质基础，黄柏黄酮具抗氧化、免疫调节与骨保护活性。',
      scaling: { auxName: '聚酰胺/阳离子树脂', auxFactor: 1.0, auxUnit: 'g', yieldLow: 0.005, yieldHigh: 0.012, yieldUnit: 'g' },
      tlcSystem: '聚酰胺/硅胶 G 板；乙酸乙酯-甲酸-水 (8:1:1)；1% AlCl₃ 显荧光。',
      tlcDefault: { front: 8.0, sample: 4.1, ref: 4.2 },
      steps: [
        { stage: '提取', title: '70% 乙醇回流提取', principle: '醇水体系同时溶出黄酮苷与生物碱。', qc: '回流 2 次合并浓缩。' },
        { stage: '分离', title: '阳离子树脂除生物碱 + 聚酰胺富集黄酮', principle: '利用黄酮酚羟基与聚酰胺氢键吸附选择性分离。', qc: '水洗除杂后 70% 乙醇洗脱黄酮。' },
        { stage: '检识', title: '盐酸-镁粉、AlCl₃ 荧光与除碱确认', principle: '黄酮显红与荧光，碘化铋钾阴性确认无生物碱残留。', qc: '同步对照 TLC。' }
      ],
      troubleshoot: [{ issue: '生物碱干扰显色', cause: '未做阳离子树脂除碱。', fix: '先过强酸性阳离子树脂截留小檗碱再纯化黄酮。' }],
      sop: ['70%乙醇回流提取黄柏', '阳离子树脂截留去除生物碱', '聚酰胺/大孔树脂富集黄酮', '盐酸-镁粉/AlCl₃与TLC检识'],
      chemTests: [{ name: '盐酸-镁粉显橙红色', passed: true }, { name: 'AlCl₃ 365nm 荧光显色', passed: true }, { name: '碘化铋钾阴性(除碱彻底)', passed: true }],
      demoBatches: [{ mass: 50, crude: 0.34, refined: 0.26, mp: 229.5 }, { mass: 50, crude: 0.36, refined: 0.28, mp: 230.1 }, { mass: 50, crude: 0.35, refined: 0.27, mp: 229.8 }]
    },
    salvia: {
      id: 'salvia', herb: '丹参', compound: '丹参酮ⅡA(菲醌类)', latin: 'Salvia miltiorrhiza Bge.', category: '蒽醌与醌类', isClassGroup: true,
      defaultRig: 'column', defaultExtract: 'reflux', defaultSep: 'column', formulas: ['diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 8, temp: 75, time: 90, mesh: '中粉(40目)', cycles: '2', solventType: '95%乙醇', ph: '中性 7.0' },
      limitVal: 0.25, limitUnit: '%', crudeUnit: 'g', mpRef: '209～210℃',
      origin: '唇形科植物丹参干燥根及根茎。活血祛瘀、通经止痛。',
      chemistry: '脂溶性二萜邻菲醌（丹参酮Ⅰ、丹参酮ⅡA、隐丹参酮），呈暗红色结晶，易溶于 95% 乙醇。',
      pharmacopoeia: '95% 乙醇避光回流提取，硅胶柱层析石油醚-乙酸乙酯梯度洗脱得暗红针晶。',
      integrative: '中西医结合视角：丹参酮ⅡA 磺酸钠注射液是中西医结合治疗冠心病、心绞痛与脑缺血损伤的临床核心药物。',
      scaling: { auxName: '200-300目硅胶', auxFactor: 1.5, auxUnit: 'g', yieldLow: 0.003, yieldHigh: 0.008, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板；甲苯-乙酸乙酯 (19:1)；日光下直接呈暗红色特征斑点。',
      tlcDefault: { front: 8.0, sample: 4.9, ref: 5.0 },
      steps: [
        { stage: '提取', title: '95% 乙醇避光水浴回流', principle: '选择性溶出脂溶性菲醌，减少水溶性杂质。', qc: '避光回流 2 次浓缩得深红浸膏。' },
        { stage: '纯化', title: '硅胶柱层析梯度洗脱', principle: '石油醚-乙酸乙酯 (10:1→5:1) 分离暗红色丹参酮ⅡA 色带。', qc: '干法拌样上柱，乙醇重结晶。' },
        { stage: '检识', title: '浓硫酸显色与日光暗红斑点 TLC', principle: '菲醌共轭体系日光下直接呈暗红，无需显色剂。', qc: '核对熔点 209~210℃。' }
      ],
      troubleshoot: [{ issue: '色带拖尾', cause: '湿法上样过浓。', fix: '拌硅胶蒸干后干法上样，流速控 1~2 滴/秒。' }],
      sop: ['95%乙醇避光回流提取丹参', '减压浓缩干法拌样上柱', '硅胶柱梯度洗脱收暗红流分', '重结晶测熔点与日光TLC检识'],
      chemTests: [{ name: '暗红色针状结晶外观', passed: true }, { name: '浓硫酸显蓝紫色', passed: true }, { name: 'TLC 日光下暗红单斑', passed: true }],
      demoBatches: [{ mass: 50, crude: 0.20, refined: 0.14, mp: 209.2 }, { mass: 50, crude: 0.22, refined: 0.15, mp: 209.6 }, { mass: 50, crude: 0.21, refined: 0.145, mp: 209.4 }]
    },
    glycyrrhiza: {
      id: 'glycyrrhiza', herb: '甘草', compound: '甘草酸（三萜皂苷）', latin: 'Glycyrrhiza uralensis Fisch.', category: '皂苷与三萜', isClassGroup: true,
      defaultRig: 'filter', defaultExtract: 'acid_water', defaultSep: 'acid_precip', formulas: ['henderson', 'diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 60, time: 120, mesh: '粗粉(10~20目)', cycles: '2', solventType: '弱碱硼砂水', ph: '氨水提取9 / 酸沉2.0' },
      limitVal: 2.0, limitUnit: '%', crudeUnit: 'g', mpRef: '212～217℃(分解)',
      origin: '豆科植物甘草干燥根及根茎。补脾益气、清热解毒、调和诸药。',
      chemistry: '五环三萜皂苷，含 3 个羧基呈酸性，加稀氨水成易溶铵盐，加稀硫酸调 pH 2 析出游离酸。',
      pharmacopoeia: '《中国药典》规定甘草酸 ≥ 2.0%。0.5% 稀氨水提取 → 稀硫酸调 pH 1.5~2.0 酸沉 → 乙醇重结晶。',
      integrative: '中西医结合视角：复方甘草酸苷、异甘草酸镁是临床抗炎保肝与治疗药物性肝损伤的一线中西医结合制剂。',
      scaling: { auxName: '稀氨水 / 10% H₂SO₄', auxFactor: 0.60, auxUnit: 'mL', yieldLow: 0.02, yieldHigh: 0.04, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板；乙酸乙酯-甲酸-冰醋酸-水 (15:1:1:2)；10% 硫酸乙醇 105℃ 显色。',
      tlcDefault: { front: 8.0, sample: 3.5, ref: 3.6 },
      steps: [
        { stage: '提取', title: '0.5% 稀氨水温浸提取', principle: '难溶钙/镁盐转为极易溶的甘草酸铵。', qc: '60℃ 浸提 2 次合并浓缩。' },
        { stage: '纯化', title: '稀硫酸调 pH 1.5~2.0 沉淀与重结晶', principle: '三元羧基质子化析出，热乙醇-冰醋酸精制。', qc: '低温静置过夜抽滤水洗。' },
        { stage: '检识', title: '泡沫试验、Liebermann-Burchard 与 TLC', principle: '皂苷振摇现持久泡沫，醋酐-浓硫酸显紫红。', qc: '|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [{ issue: '酸沉物黏稠难滤', cause: '液过浓或室温加酸。', fix: '50℃ 温热缓滴稀硫酸并陈化后再抽滤。' }],
      sop: ['0.5%稀氨水60℃提取甘草2次', '过滤浓缩后调pH至2.0酸沉', '抽滤洗涤并乙醇重结晶', '泡沫/L-B反应与TLC检识'],
      chemTests: [{ name: '持续性泡沫试验阳性', passed: true }, { name: 'Liebermann-Burchard 显紫红', passed: true }, { name: 'TLC 甘草酸对照单斑', passed: true }],
      demoBatches: [{ mass: 50, crude: 1.45, refined: 1.15, mp: 214.2 }, { mass: 50, crude: 1.52, refined: 1.22, mp: 215.0 }, { mass: 50, crude: 1.48, refined: 1.18, mp: 214.6 }]
    },
    andrographis: {
      id: 'andrographis', herb: '穿心莲', compound: '穿心莲内酯（二萜内酯）', latin: 'Andrographis paniculata', category: '萜类内酯与环烯醚萜', isClassGroup: true,
      defaultRig: 'reflux', defaultExtract: 'reflux', defaultSep: 'column', formulas: ['diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 75, time: 60, mesh: '粗粉(10~20目)', cycles: '2', solventType: '95%乙醇', ph: '中性 7.0' },
      limitVal: 1.50, limitUnit: '%', crudeUnit: 'g', mpRef: '229～231℃',
      origin: '爵床科植物穿心莲干燥地上部分。清热解毒、凉血消肿。',
      chemistry: '二萜α,β-不饱和五元内酯，极苦，易溶于热乙醇，遇强碱内酯开环破坏。',
      pharmacopoeia: '95% 乙醇回流提取 → 活性炭热脱色除叶绿素 → 浓缩冷却析晶 → 乙醇重结晶得方形片晶。',
      integrative: '中西医结合视角：穿心莲内酯及其磺化物（喜炎平）具显著抗呼吸道感染与抗炎活性。',
      scaling: { auxName: '活性炭脱色', auxFactor: 0.05, auxUnit: 'g', yieldLow: 0.012, yieldHigh: 0.022, yieldUnit: 'g' },
      tlcSystem: '硅胶 GF254 板；氯仿-乙酸乙酯-甲醇 (4:3:0.4)；254nm 暗斑或 Kedde 显色。',
      tlcDefault: { front: 8.0, sample: 4.3, ref: 4.4 },
      steps: [
        { stage: '提取', title: '95% 乙醇回流提取', principle: '高浓度乙醇高效溶出二萜内酯。', qc: '回流 2 次，严禁加碱。' },
        { stage: '纯化', title: '活性炭热脱色与乙醇重结晶', principle: '活性炭吸附叶绿素，冷却析出白色方形片晶。', qc: '趁热抽滤除炭，浓缩至 1/4 析晶。' },
        { stage: '检识', title: 'Kedde 反应与 TLC', principle: '不饱和五元内酯环与 3,5-二硝基苯甲酸碱液显紫红。', qc: '核对熔点 229~231℃。' }
      ],
      troubleshoot: [{ issue: '晶体发绿', cause: '活性炭用量不足。', fix: '补加 2%~3% 活性炭微沸脱色 15 min 趁热抽滤。' }],
      sop: ['95%乙醇回流提取穿心莲', '活性炭微沸脱色趁热抽滤', '浓缩析晶并乙醇重结晶', 'Kedde反应、熔点与TLC检识'],
      chemTests: [{ name: 'Kedde 反应显紫红色', passed: true }, { name: '无色方形片晶与熔点核对', passed: true }, { name: 'TLC 254nm 暗斑比对', passed: true }],
      demoBatches: [{ mass: 50, crude: 0.92, refined: 0.78, mp: 229.8 }, { mass: 50, crude: 0.98, refined: 0.82, mp: 230.2 }, { mass: 50, crude: 0.95, refined: 0.80, mp: 230.0 }]
    },
    panax: {
      id: 'panax', herb: '人参', compound: '人参皂苷 Rg1/Rb1/Re', latin: 'Panax ginseng C. A. Mey.', category: '皂苷与三萜', isClassGroup: true,
      defaultRig: 'extract', defaultExtract: 'reflux', defaultSep: 'resin', formulas: ['diffusion', 'qc'],
      defaultCfg: { mass: 30, ratio: 10, temp: 75, time: 90, mesh: '中粉(40目)', cycles: '2', solventType: '70%乙醇', ph: '中性 7.0' },
      limitVal: 0.50, limitUnit: '%', crudeUnit: 'g', mpRef: '总皂苷粉末',
      origin: '五加科植物人参干燥根及根茎。大补元气、复脉固脱。',
      chemistry: '达玛烷型四环三萜皂苷（Rb1、Rg1、Re），具表面活性，易溶于水饱和正丁醇。',
      pharmacopoeia: '70% 乙醇回流 → 乙醚脱脂 → 水饱和正丁醇液-液萃取 → D101 大孔树脂纯化得人参总皂苷。',
      integrative: '中西医结合视角：人参皂苷 Rg1/Rb1 在神经保护、抗肿瘤免疫增强领域与现代药理深度结合。',
      scaling: { auxName: '水饱和正丁醇', auxFactor: 3.0, auxUnit: 'mL', yieldLow: 0.015, yieldHigh: 0.035, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板；氯仿-甲醇-水 (13:7:2) 下层液；10% 硫酸乙醇 105℃ 显紫红斑点。',
      tlcDefault: { front: 8.0, sample: 3.6, ref: 3.7 },
      steps: [
        { stage: '提取', title: '70% 乙醇回流提取', principle: '醇水体系充分溶出人参二醇/三醇型皂苷。', qc: '回流 2 次合并浓缩。' },
        { stage: '分离', title: '水饱和正丁醇萃取与 D101 树脂纯化', principle: '正丁醇富集皂苷，大孔树脂水洗除糖。', qc: '萃取 3~4 次减压蒸干。' },
        { stage: '检识', title: '泡沫试验、香草醛显色与 TLC', principle: '达玛烷皂苷遇香草醛-硫酸显紫红色。', qc: '比对 Rg1、Re、Rb1 对照品。' }
      ],
      troubleshoot: [{ issue: '正丁醇萃取乳化', cause: '皂苷自身是强乳化剂。', fix: '轻缓翻转静置或离心破乳。' }],
      sop: ['70%乙醇回流提取人参粉', '浓缩后水饱和正丁醇萃取', 'D101大孔树脂水洗醇洗纯化', '泡沫/香草醛与TLC对照检识'],
      chemTests: [{ name: '持续泡沫试验阳性', passed: true }, { name: '香草醛-硫酸显紫红', passed: true }, { name: 'TLC Rg1/Re/Rb1 一致', passed: true }],
      demoBatches: [{ mass: 30, crude: 0.85, refined: 0.68, mp: 194.0 }, { mass: 30, crude: 0.90, refined: 0.72, mp: 194.5 }, { mass: 30, crude: 0.88, refined: 0.70, mp: 194.2 }]
    },
    pueraria: {
      id: 'pueraria', herb: '葛根', compound: '葛根素及总黄酮(异黄酮碳苷)', latin: 'Pueraria lobata (Willd.) Ohwi', category: '黄酮', isClassGroup: true,
      defaultRig: 'reflux', defaultExtract: 'reflux', defaultSep: 'resin', formulas: ['diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 80, time: 90, mesh: '粗粉(10~20目)', cycles: '2', solventType: '70%乙醇', ph: '中性 7.0' },
      limitVal: 2.40, limitUnit: '%', crudeUnit: 'g', mpRef: '187～189℃',
      origin: '豆科植物野葛干燥根。解肌退热、生津止渴、通经活络。',
      chemistry: '8-C-葡萄糖基大豆苷元（异黄酮碳苷），难酸水解，365nm 下显特征蓝白荧光。',
      pharmacopoeia: '《中国药典》规定野葛含葛根素 ≥ 2.4%。70% 乙醇回流（防淀粉糊化）+ 大孔树脂富集 + 重结晶。',
      integrative: '中西医结合视角：葛根素注射液广泛用于心脑血管微循环改善与糖尿病视网膜病变中西医结合治疗。',
      scaling: { auxName: 'AB-8大孔树脂', auxFactor: 1.0, auxUnit: 'g', yieldLow: 0.025, yieldHigh: 0.045, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板；氯仿-甲醇-水 (7:2.5:0.25)；365nm 显亮蓝白荧光。',
      tlcDefault: { front: 8.0, sample: 4.2, ref: 4.3 },
      steps: [
        { stage: '提取', title: '70% 乙醇回流提取 2 次', principle: '避开葛根大量淀粉糊化，高效溶出异黄酮碳苷。', qc: '乙醇浓度 ≥ 65%。' },
        { stage: '纯化', title: 'AB-8 大孔树脂纯化与重结晶', principle: '水洗除糖、醇洗富集葛根素并析晶。', qc: '干燥测总黄酮与葛根素收率。' },
        { stage: '检识', title: '365nm 蓝白荧光与 TLC', principle: '异黄酮碳苷在 365nm 下具强蓝白荧光。', qc: '|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [{ issue: '提取液成糊状', cause: '乙醇浓度过低致淀粉糊化。', fix: '使用 ≥70% 乙醇提取。' }],
      sop: ['70%乙醇回流提取葛根粗粉', '滤过浓缩并AB-8树脂纯化', '乙醇重结晶测熔点', '365nm荧光与TLC对照检识'],
      chemTests: [{ name: '365nm 特征蓝白荧光', passed: true }, { name: '三氯化铁显色阳性', passed: true }, { name: 'TLC 葛根素对照单斑', passed: true }],
      demoBatches: [{ mass: 50, crude: 1.65, refined: 1.32, mp: 187.8 }, { mass: 50, crude: 1.72, refined: 1.38, mp: 188.2 }, { mass: 50, crude: 1.68, refined: 1.35, mp: 188.0 }]
    },
    armeniaca: {
      id: 'armeniaca', herb: '苦杏仁', compound: '苦杏仁苷（氰苷类）', latin: 'Prunus armeniaca L.', category: '氰苷类', isClassGroup: true,
      defaultRig: 'soxhlet', defaultExtract: 'reflux', defaultSep: 'freeze', formulas: ['diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 8, temp: 80, time: 60, mesh: '中粉(40目)', cycles: '2', solventType: '95%乙醇', ph: '中性 7.0' },
      limitVal: 3.0, limitUnit: '%', crudeUnit: 'g', mpRef: '214～216℃',
      origin: '蔷薇科植物山杏干燥成熟种子。降气止咳平喘、润肠通便。',
      chemistry: '典型氰苷，易被自身苦杏仁酶水解为苯甲醛与剧毒 HCN；易溶于沸乙醇，不溶于石油醚。',
      pharmacopoeia: '《中国药典》规定苦杏仁苷 ≥ 3.0%。核心工艺：“沸水燀制灭酶保苷 → 石油醚脱脂 → 热乙醇回流 → 冷却重结晶”。',
      integrative: '中西医结合视角：脱脂苦杏仁粕资源化提取苦杏仁苷是高校药学绿色化学经典教学创新项目。',
      scaling: { auxName: '石油醚脱脂剂', auxFactor: 4.0, auxUnit: 'mL', yieldLow: 0.03, yieldHigh: 0.045, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板；氯仿-乙酸乙酯-甲醇-水 (15:40:22:10) 下层液；碘蒸气显色。',
      tlcDefault: { front: 8.0, sample: 4.0, ref: 4.1 },
      steps: [
        { stage: '预处理', title: '沸水燀制去皮灭酶 + 石油醚脱脂', principle: '高温瞬间钝化苦杏仁酶防产毒，石油醚脱除 45% 脂肪油。', qc: '务必先灭酶再粉碎脱脂！' },
        { stage: '提取', title: '95% 热乙醇回流提取', principle: '苦杏仁苷易溶于沸乙醇而难溶于冷乙醇。', qc: '趁热抽滤合并醇提液。' },
        { stage: '纯化', title: '冷却析晶与无水乙醇重结晶', principle: '冷乙醇/乙醚中溶解度极小析出白色结晶。', qc: '测熔点 214~216℃。' },
        { stage: '检识', title: '苦味酸钠试纸法（通风橱）与 TLC', principle: '酶解产 HCN 使苦味酸钠试纸变砖红色。', qc: '严格通风橱微量操作防 HCN 中毒！' }
      ],
      troubleshoot: [{ issue: '粉碎时杏仁味浓且收率骤降', cause: '未先沸水灭酶导致苦杏仁酶已水解。', fix: '先沸水煮 10 min 灭酶去皮烘干后再粉碎脱脂。' }],
      sop: ['沸水燀制灭酶去皮并烘干', '石油醚索氏脱脂去脂肪油', '95%热乙醇回流趁热滤过', '冷却析晶重结晶测熔点', '通风橱苦味酸钠试纸与TLC'],
      chemTests: [{ name: '苦味酸钠试纸变砖红(通风橱)', passed: true }, { name: '熔点 214~216℃ 核对', passed: true }, { name: 'TLC 苦杏仁苷对照单斑', passed: true }],
      demoBatches: [{ mass: 50, crude: 1.85, refined: 1.56, mp: 214.6 }, { mass: 50, crude: 1.92, refined: 1.62, mp: 215.1 }, { mass: 50, crude: 1.88, refined: 1.58, mp: 214.9 }]
    },
    polygonum: {
      id: 'polygonum', herb: '虎杖', compound: '大黄素(蒽醌类)与白藜芦醇', latin: 'Polygonum cuspidatum', category: '蒽醌与醌类', isClassGroup: true,
      defaultRig: 'extract', defaultExtract: 'reflux', defaultSep: 'ph_extract', formulas: ['henderson', 'diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 75, time: 90, mesh: '中粉(40目)', cycles: '2', solventType: '70%乙醇', ph: 'Na₂CO₃萃取 pH 11' },
      limitVal: 0.60, limitUnit: '%', crudeUnit: 'g', mpRef: '大黄素 256～257℃',
      origin: '蓼科植物虎杖干燥根茎及根。利湿退黄、清热解毒。',
      chemistry: '主含游离及结合蒽醌（大黄素、大黄素甲醚）与虎杖苷/白藜芦醇。',
      pharmacopoeia: '醇提酸水解后氯仿萃取，5% Na₂CO₃ 梯度萃取分离橙黄色大黄素结晶。',
      integrative: '中西医结合视角：虎杖大黄素与白藜芦醇协同发挥保肝退黄、抗炎与心血管保护作用。',
      scaling: { auxName: '5% Na₂CO₃ / 氯仿', auxFactor: 2.0, auxUnit: 'mL', yieldLow: 0.008, yieldHigh: 0.016, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板；石油醚-甲酸乙酯-甲酸 (15:5:1) 上层液；氨蒸气熏显红。',
      tlcDefault: { front: 8.0, sample: 4.7, ref: 4.8 },
      steps: [
        { stage: '提取', title: '70% 乙醇回流 + 稀硫酸水解', principle: '结合型大黄素苷水解为游离大黄素。', qc: '回流浓缩后氯仿萃取。' },
        { stage: '分离', title: '5% Na₂CO₃ 碱水萃取与酸化析晶', principle: '大黄素含 β-酚羟基可溶于 Na₂CO₃，酸化析出橙黄针晶。', qc: '乙醇重结晶测熔点 256~257℃。' },
        { stage: '检识', title: 'Bornträger 显红、醋酸镁与 TLC', principle: '羟基蒽醌遇碱显樱红色。', qc: '|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [{ issue: '大黄素与大黄素甲醚混杂', cause: '未做 Na₂CO₃ 梯度分离。', fix: '用 5% Na₂CO₃ 专一性萃出大黄素。' }],
      sop: ['70%乙醇回流提取虎杖', '酸水解并氯仿萃取游离蒽醌', '5%Na₂CO₃萃取酸化得大黄素', 'Bornträger显色与TLC检识'],
      chemTests: [{ name: 'Bornträger 樱红显色', passed: true }, { name: '熔点 256~257℃ 核对', passed: true }, { name: 'TLC 大黄素对照单斑', passed: true }],
      demoBatches: [{ mass: 50, crude: 0.55, refined: 0.42, mp: 256.4 }, { mass: 50, crude: 0.58, refined: 0.45, mp: 256.8 }, { mass: 50, crude: 0.56, refined: 0.43, mp: 256.5 }]
    },
    panax_quinquefolius: {
      id: 'panax_quinquefolius', herb: '西洋参', compound: '西洋参皂苷(Rb1/Re/F11)', latin: 'Panax quinquefolium L.', category: '皂苷与三萜', isClassGroup: true,
      defaultRig: 'ultrasound', defaultExtract: 'ultrasound', defaultSep: 'resin', formulas: ['diffusion', 'qc'],
      defaultCfg: { mass: 30, ratio: 10, temp: 50, time: 60, mesh: '中粉(40目)', cycles: '2', solventType: '70%乙醇', ph: '中性 7.0' },
      limitVal: 2.0, limitUnit: '%', crudeUnit: 'g', mpRef: '总皂苷(含特征F11)',
      origin: '五加科植物西洋参干燥根。补气养阴、清热生津。',
      chemistry: 'Rb1 占比高，且特有奥克梯隆型“拟人参皂苷 F11”（可与人参严格鉴别）。',
      pharmacopoeia: '《中国药典》规定 Rg1+Re+Rb1 ≥ 2.0%。70% 乙醇超声提取 + 正丁醇萃取 + D101 大孔树脂纯化。',
      integrative: '中西医结合视角：西洋参皂苷具免疫双向调节与改善放化疗癌因性疲乏作用。',
      scaling: { auxName: '正丁醇/D101树脂', auxFactor: 3.0, auxUnit: 'mL', yieldLow: 0.025, yieldHigh: 0.045, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板；氯仿-乙酸乙酯-甲醇-水 (15:40:22:10) 下层液；10% 硫酸乙醇显色（特征 F11）。',
      tlcDefault: { front: 8.0, sample: 3.8, ref: 3.9 },
      steps: [
        { stage: '提取', title: '70% 乙醇超声辅助提取', principle: '温和高效溶出总皂苷，避免高温降解丙二酰基皂苷。', qc: '提取 2 次每次 45~60 min。' },
        { stage: '纯化', title: '正丁醇萃取与 D101 大孔树脂纯化', principle: '水洗除糖、70% 乙醇洗脱得西洋参总皂苷。', qc: '控流速 2 BV/h。' },
        { stage: '检识', title: '泡沫、香草醛显色与 F11 鉴别 TLC', principle: '与人参对照药材同板点样，核对特有 F11 斑点且无 Rf。', qc: '|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [{ issue: '与人参 TLC 难以区分', cause: '未点西洋参特征对照品 F11。', fix: '同板点样西洋参对照药材核对特征 F11 斑点。' }],
      sop: ['70%乙醇超声提取西洋参粉', '正丁醇萃取与D101树脂纯化', '干燥称重测总皂苷收率', '泡沫/香草醛与特征TLC鉴别'],
      chemTests: [{ name: '持续泡沫试验阳性', passed: true }, { name: '香草醛-硫酸显紫红', passed: true }, { name: 'TLC 西洋参特征斑点一致', passed: true }],
      demoBatches: [{ mass: 30, crude: 1.02, refined: 0.84, mp: 196.0 }, { mass: 30, crude: 1.08, refined: 0.88, mp: 196.4 }, { mass: 30, crude: 1.05, refined: 0.86, mp: 196.2 }]
    }
    ,paeonia_moutan: {
      id: 'paeonia_moutan', herb: '牡丹皮', isInnovative: true, compound: '丹皮酚（β-环糊精包合创新）', latin: 'Paeonia suffruticosa Andr.', category: '挥发油与萜类',
      defaultRig: 'steam', defaultExtract: 'steam', defaultSep: 'freeze', formulas: ['distill', 'diffusion', 'qc'],
      defaultCfg: { mass: 80, ratio: 10, temp: 100, time: 180, mesh: '粗粉(10~20目)', cycles: '1', solventType: '纯化水', ph: '中性 7.0' },
      limitVal: 1.20, limitUnit: '%', crudeUnit: 'g', mpRef: '48～51℃',
      origin: '毛茛科植物牡丹干燥根皮。清热凉血、活血化瘀。',
      chemistry: '主含丹皮酚（2-羟基-4-甲氧基苯乙酮），具挥发性、易升华，可随水蒸气共沸馏出，冷却后析出白色针状结晶。',
      pharmacopoeia: '《中国药典》规定干燥牡丹皮含丹皮酚不得少于 1.2%。',
      integrative: '创新制剂延伸：丹皮酚易挥发且水溶性差，实验可延伸“饱和水溶液法 β-环糊精包合”，利用主客体分子包合显著提高热稳定性与经皮吸收率，用于抗湿疹/抗炎外用凝胶开发。',
      scaling: { auxName: 'β-环糊精(包合选配)', auxFactor: 0.15, auxUnit: 'g', yieldLow: 0.012, yieldHigh: 0.022, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板；环己烷-乙酸乙酯 (3:1)；5% FeCl₃ 乙醇液显蓝褐色斑点。',
      tlcDefault: { front: 8.0, sample: 5.2, ref: 5.3 },
      steps: [
        { stage: '提取', title: '粗粉润胀与水蒸气蒸馏共沸', principle: '依据道尔顿分压定律，丹皮酚随水蒸气馏出，冷凝管壁即可析出白色针晶。', qc: '收集馏出液约 6~8 倍药材量，注意防冷凝管堵塞。' },
        { stage: '分离', title: '冰水浴静置结晶与减压抽滤', principle: '丹皮酚微溶于冷水而溶于热水，冰浴冷却促使结晶完全析出。', qc: '0~4℃ 静置 2 h 后抽滤，少量冰水洗涤。' },
        { stage: '纯化', title: '低温干燥或 β-环糊精包合创新', principle: '40℃以下阴干防升华损失；创新组可按 1:6 投料制备 β-CD 包合物。', qc: '严禁高温烘烤（熔点仅 48~51℃）。' },
        { stage: '检识', title: 'FeCl₃ 酚羟基显色、熔点与 TLC', principle: '分子含邻羟基苯乙酮结构，遇 FeCl₃ 显特征紫褐色/蓝褐色。', qc: '熔点 48~51℃，|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [{ issue: '冷凝管内壁堵晶', cause: '冷凝水过冷导致丹皮酚提前结晶。', fix: '阶段性暂停冷凝水 10 秒微热冲下结晶。' }, { issue: '干燥后收率骤降', cause: '烘箱温度高于 50℃ 导致升华挥发。', fix: '改用真空干燥器室温硅胶干燥。' }],
      sop: ['牡丹皮粗粉加水润胀 30 min', '水蒸气蒸馏收集共沸馏液', '冰浴静置析出针状结晶并抽滤', '室温避光干燥（或做β-CD包合）', 'FeCl₃显色、熔点及TLC对照'],
      chemTests: [{ name: '特异辛辣芳香针状结晶', passed: true }, { name: 'FeCl₃ 酚羟基显蓝褐色', passed: true }, { name: '熔点 48~51℃ 测定', passed: true }, { name: 'TLC 对照品同位置单斑', passed: true }],
      demoBatches: [{ mass: 80, crude: 1.24, refined: 1.05, mp: 49.4 }, { mass: 80, crude: 1.31, refined: 1.12, mp: 49.8 }, { mass: 80, crude: 1.27, refined: 1.08, mp: 49.6 }]
    },
    tea_caffeine: {
      id: 'tea_caffeine', herb: '绿茶', isInnovative: true, compound: '咖啡因（索氏提取-升华法）', latin: 'Camellia sinensis (L.) O. Ktze.', category: '生物碱',
      defaultRig: 'soxhlet', defaultExtract: 'soxhlet', defaultSep: 'freeze', formulas: ['diffusion', 'henderson', 'qc'],
      defaultCfg: { mass: 20, ratio: 8, temp: 82, time: 120, mesh: '粗粉(10~20目)', cycles: '6', solventType: '95%乙醇', ph: '生石灰碱性除单宁' },
      limitVal: 1.50, limitUnit: '%', crudeUnit: 'g', mpRef: '235～238℃(封管)',
      origin: '山茶科植物茶树干燥嫩叶，含咖啡因 1%~5%、茶多酚（鞣质）与叶绿素。',
      chemistry: '黄嘌呤类生物碱（1,3,7-三甲基黄嘌呤），微碱性，178℃ 即可显著升华，是天然产物物理升华纯化的经典模型。',
      pharmacopoeia: '参考《大学化学》高校创新实验教学标准：内通气集热式索氏提取-生石灰中和-控温升华工艺。',
      integrative: '创新绿色实验延伸：可对比“95%乙醇索氏提取”与“碳酸钠水提-二氯甲烷液液萃取”的原子经济性与溶剂毒性，并延伸探讨咖啡因与茶氨酸协同调节中枢神经兴奋性的现代药理机制。',
      scaling: { auxName: '生石灰(CaO)', auxFactor: 0.20, auxUnit: 'g', yieldLow: 0.015, yieldHigh: 0.032, yieldUnit: 'g' },
      tlcSystem: '硅胶 GF254 板；乙酸乙酯-甲醇-水 (100:17:13)；254 nm 紫外暗斑。',
      tlcDefault: { front: 8.0, sample: 4.9, ref: 5.0 },
      steps: [
        { stage: '提取', title: '滤纸筒装样与索氏连续提取', principle: '利用虹吸循环实现少量 95% 乙醇多次新鲜浸提，提高传质效率。', qc: '滤纸筒高度低于虹吸管顶部，虹吸 5~6 次至回流液色浅。' },
        { stage: '分离', title: '蒸馏回收乙醇与生石灰拌炒', principle: '生石灰吸收残余水分并与酸性茶多酚/鞣质结合生成难挥发钙盐。', qc: '小火焙炒至呈干燥疏松深绿色粉末，切忌炒焦。' },
        { stage: '纯化', title: '蒸发皿-刺孔滤纸-倒扣漏斗升华', principle: '利用咖啡因 178℃ 升华特性与非挥发性色素、钙盐一步分离。', qc: '控温 180~200℃ 缓慢升华，漏斗壁析出白色丝状针晶。' },
        { stage: '检识', title: '紫脲酸铵反应与 254nm TLC', principle: '氯酸钾+盐酸氧化蒸干后遇氨气呈特征紫红色（紫脲酸铵反应）。', qc: '白色丝状针晶，紫脲酸铵显色阳性。' }
      ],
      troubleshoot: [{ issue: '升华结晶发黄', cause: '焙炒不干或升华温度超过 220℃ 导致焦化。', fix: '充分炒干水分并严格控温缓慢升华。' }, { issue: '索氏管不虹吸', cause: '滤纸筒塞得过紧堵塞虹吸口。', fix: '滤纸筒直径略小于提取管内径并留底部间隙。' }],
      sop: ['称取茶叶装入滤纸筒置索氏提取器', '95%乙醇连续虹吸提取至色浅', '回收乙醇后拌入生石灰小火焙干', '覆盖刺孔滤纸与倒扣漏斗控温升华', '刮取丝状针晶做紫脲酸铵与TLC检识'],
      chemTests: [{ name: '白色丝状针晶升华外观', passed: true }, { name: '紫脲酸铵反应呈紫红色', passed: true }, { name: 'TLC 254nm 紫外暗斑一致', passed: true }],
      demoBatches: [{ mass: 20, crude: 0.42, refined: 0.34, mp: 236.2 }, { mass: 20, crude: 0.46, refined: 0.37, mp: 236.5 }, { mass: 20, crude: 0.44, refined: 0.35, mp: 236.0 }]
    },
    fraxinus: {
      id: 'fraxinus', herb: '秦皮', isInnovative: true, compound: '秦皮甲素、秦皮乙素', latin: 'Fraxinus rhynchophylla Hance', category: '香豆素与木脂素',
      defaultRig: 'reflux', defaultExtract: 'reflux', defaultSep: 'resin', formulas: ['henderson', 'diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 80, time: 90, mesh: '中粉(40目)', cycles: '2', solventType: '70%乙醇', ph: '中性 / 弱酸' },
      limitVal: 1.00, limitUnit: '%', crudeUnit: 'g', mpRef: '204～206℃(甲素)',
      origin: '木犀科植物苦枥白蜡树干燥枝皮或干皮。清热燥湿、收涩止痢、明目。',
      chemistry: '典型简单香豆素类：秦皮甲素（七叶苷）及苷元秦皮乙素（七叶内酯），在 365nm 紫外光下呈现极特征的亮蓝色荧光。',
      pharmacopoeia: '《中国药典》规定按干燥品计，秦皮甲素和秦皮乙素总量不得少于 1.0%。',
      integrative: '创新拓展视角：可引入“非离子表面活性剂浊点萃取（CPE）”替代有机溶剂富集秦皮香豆素（参考《中国实验方剂学杂志》方法），并延伸研究其抑制黄嘌呤氧化酶降尿酸抗痛风机制。',
      scaling: { auxName: 'D101树脂/乙醇', auxFactor: 0.30, auxUnit: 'g', yieldLow: 0.012, yieldHigh: 0.025, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板；甲苯-乙酸乙酯-甲酸-乙醇 (3:4:1:2)；365 nm 显亮蓝色荧光。',
      tlcDefault: { front: 8.0, sample: 3.4, ref: 3.5 },
      steps: [
        { stage: '提取', title: '70% 乙醇加热回流提取', principle: '兼顾极性较高的秦皮甲素（苷）与苷元秦皮乙素同步溶出。', qc: '回流 2 次，每次 1.5 h，合并滤液。' },
        { stage: '分离', title: '浓缩除醇与大孔树脂富集', principle: '水洗除糖类与鞣质，30%~50% 乙醇梯度洗脱富集香豆素部位。', qc: '收集 365nm 强蓝色荧光流分。' },
        { stage: '纯化', title: '热乙醇-水重结晶精制', principle: '秦皮甲素在热水中溶解度大、冷水中析出白色针晶。', qc: '4℃ 静置析晶，抽滤干燥。' },
        { stage: '检识', title: '紫外荧光、异羟肟酸铁与 TLC', principle: '香豆素内酯环遇碱性羟胺-FeCl₃显红色；水浸液日光下显碧蓝色荧光。', qc: '水浸液日光碧蓝荧光，|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [{ issue: '荧光斑点拖尾', cause: '展开剂中甲酸比例不足导致酚羟基解离。', fix: '保证展开剂含甲酸抑制电离，现配现用。' }],
      sop: ['秦皮中粉70%乙醇回流提取2次', '减压浓缩回收乙醇得水混悬液', 'D101大孔树脂水洗除杂后醇洗脱', '浓缩热乙醇-水重结晶得秦皮甲素', '异羟肟酸铁显色与365nm TLC检识'],
      chemTests: [{ name: '水浸液日光下碧蓝色荧光', passed: true }, { name: '异羟肟酸铁内酯反应显红色', passed: true }, { name: 'TLC 365nm 亮蓝荧光单斑', passed: true }],
      demoBatches: [{ mass: 50, crude: 0.92, refined: 0.64, mp: 204.6 }, { mass: 50, crude: 0.98, refined: 0.68, mp: 205.1 }, { mass: 50, crude: 0.95, refined: 0.66, mp: 204.8 }]
    },
    citrus: {
      id: 'citrus', herb: '广陈皮', isInnovative: true, compound: '橙皮苷与多甲氧基黄酮', latin: 'Citrus reticulata "Chachi"', category: '黄酮',
      defaultRig: 'reflux', defaultExtract: 'boil_enzyme', defaultSep: 'acid_precip', formulas: ['henderson', 'diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 12, temp: 70, time: 60, mesh: '粗粉(10~20目)', cycles: '2', solventType: '石灰水/甲醇', ph: '碱提11 / 酸沉4' },
      limitVal: 2.00, limitUnit: '%', crudeUnit: 'g', mpRef: '258～262℃(橙皮苷)',
      origin: '芸香科植物茶枝柑（广东新会广陈皮）干燥成熟果皮。理气健脾、燥湿化痰。',
      chemistry: '含两类黄酮：高含量二氢黄酮苷（橙皮苷，可碱溶酸沉）及脂溶性多甲氧基黄酮（川陈皮素、橘皮素，为广陈皮道地性标志物）。',
      pharmacopoeia: '《中国药典》规定广陈皮含橙皮苷 ≥ 2.0%，且川陈皮素与橘皮素含量比值可用于道地性鉴别。',
      integrative: '创新双组分分离设计：先用石油醚/低极性溶剂提取多甲氧基黄酮（川陈皮素），药渣再用石灰水碱提酸沉得橙皮苷，实现“一材双提”，并可对比普通陈皮与新会广陈皮的 TLC/HPLC 指纹差异。',
      scaling: { auxName: 'Ca(OH)₂/盐酸', auxFactor: 0.12, auxUnit: 'g', yieldLow: 0.025, yieldHigh: 0.048, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板；乙酸乙酯-甲醇-水 (100:17:13)；1% AlCl₃ 乙醇液 365 nm 显亮黄荧光。',
      tlcDefault: { front: 8.0, sample: 3.8, ref: 3.9 },
      steps: [
        { stage: '提取', title: '分级提取：先提脂溶性 PMFs 再碱提橙皮苷', principle: '利用极性差异先分离川陈皮素，再用 Ca(OH)₂ 饱和液使橙皮苷成酚盐溶出并沉淀果胶。', qc: '碱提 pH 控制在 11~12，避免强碱开环破坏二氢黄酮。' },
        { stage: '分离', title: '调 pH 4~5 酸沉析出橙皮苷粗晶', principle: '酸化恢复分子态橙皮苷，水中溶解度骤降析出类白色沉淀。', qc: '60℃ 保温陈化 30 min 增大晶粒利于抽滤。' },
        { stage: '纯化', title: 'DMSO/碱水-乙酸重结晶精制', principle: '橙皮苷在常规醇水中极难溶，采用微碱水溶-稀乙酸重沉淀法提纯。', qc: '水洗至中性，80℃ 烘干。' },
        { stage: '检识', title: '盐酸-镁粉、NaBH₄ 专属性反应与 TLC', principle: '二氢黄酮遇 NaBH₄ 显特征紫红色（与黄酮醇区分），AlCl₃ 荧光增强。', qc: 'NaBH₄ 反应紫红阳性，|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [{ issue: '碱提液黏稠难滤', cause: '陈皮果胶大量溶出。', fix: '使用石灰乳(Ca²⁺)替代 NaOH，使果胶生成果胶酸钙沉淀。' }],
      sop: ['广陈皮粗粉先以少量乙酸乙酯超声留取川陈皮素液', '药渣加饱和石灰水浸提2次合并滤液', '加稀盐酸调pH 4~5保温陈化析晶', '减压抽滤并重结晶精制橙皮苷', 'NaBH₄专属性显色与AlCl₃ TLC对照'],
      chemTests: [{ name: 'NaBH₄ 二氢黄酮专属性显紫红', passed: true }, { name: '盐酸-镁粉反应显紫红色', passed: true }, { name: 'AlCl₃ 365nm 亮黄荧光单斑', passed: true }],
      demoBatches: [{ mass: 50, crude: 1.92, refined: 1.48, mp: 259.4 }, { mass: 50, crude: 2.05, refined: 1.56, mp: 260.1 }, { mass: 50, crude: 1.98, refined: 1.52, mp: 259.8 }]
    },
    curcuma_longa: {
      id: 'curcuma_longa', herb: '姜黄', isInnovative: true, compound: '姜黄素（NADES 低共熔绿色提取）', latin: 'Curcuma longa L.', category: '苯丙素与有机酸',
      defaultRig: 'ultrasound', defaultExtract: 'ultrasound', defaultSep: 'column', formulas: ['diffusion', 'henderson', 'qc'],
      defaultCfg: { mass: 30, ratio: 15, temp: 50, time: 40, mesh: '细粉(60目)', cycles: '2', solventType: '氯化胆碱-乳酸 DES/乙醇', ph: '弱酸 4.5 (防碱解)' },
      limitVal: 1.00, limitUnit: '%', crudeUnit: 'g', mpRef: '183℃',
      origin: '姜科植物姜黄干燥根茎。破血行气、通经止痛。',
      chemistry: '二芳基庚烷类多酚色素（姜黄素、去甲氧基姜黄素、双去甲氧基姜黄素），酸性呈亮黄色，遇碱迅速变红棕色且易水解破坏。',
      pharmacopoeia: '《中国药典》规定干燥姜黄含姜黄素不得少于 1.0%。',
      integrative: '绿色化学与制剂前沿：采用氯化胆碱-乳酸天然低共熔溶剂（NADES）超声提取，氢键网络大幅提升难溶性姜黄素溶出率且无毒可降解（参考《药学学报》2021）；下游可构建纳米胶束解决其口服生物利用度极低的临床痛点。',
      scaling: { auxName: 'NADES/硅胶', auxFactor: 0.40, auxUnit: 'g', yieldLow: 0.015, yieldHigh: 0.035, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板；三氯甲烷-甲醇-甲酸 (96:4:0.7)；日光显3个橙黄色斑点，365nm显亮黄荧光。',
      tlcDefault: { front: 8.0, sample: 4.6, ref: 4.7 },
      steps: [
        { stage: '提取', title: 'NADES 或 85% 乙醇避光超声提取', principle: '低共熔溶剂氢键增溶叠加超声空化破壁，50℃ 温和防热分解。', qc: '全程棕色瓶避光操作，防止光致降解。' },
        { stage: '分离', title: '反溶剂加水析晶或硅胶柱层析', principle: 'NADES 提取液加 5 倍纯水破坏氢键网络即可快速沉淀姜黄素粗品。', qc: '离心收集橙黄色沉淀，避免使用碱性溶液。' },
        { stage: '纯化', title: '硅胶柱层析分离三种姜黄素单体', principle: '按极性由小到大依次洗脱出姜黄素、去甲氧基姜黄素、双去甲氧基姜黄素。', qc: '收集亮黄色主带浓缩，无水乙醇重结晶。' },
        { stage: '检识', title: '酸碱变色反应、硼酸显色与 TLC', principle: '遇碱变红棕、遇酸复黄；与硼酸-草酸生成玫瑰红络合物（姜黄试纸原理）。', qc: '365nm 三条清晰黄绿色荧光带，|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [{ issue: '提取液颜色发暗变褐', cause: '光照时间过长或接触碱性玻璃器皿。', fix: '锡箔纸包裹提取瓶并控制体系 pH ≤ 5.5。' }],
      sop: ['配制氯化胆碱-乳酸(1:2)低共熔溶剂或85%乙醇', '姜黄细粉避光50℃超声提取40 min', '加水反溶剂析出粗品或减压浓缩', '硅胶柱层析分离姜黄素单体', '酸碱变色、硼酸反应及TLC检识'],
      chemTests: [{ name: '遇稀 NaOH 变红棕、加酸复黄', passed: true }, { name: '硼酸显玫瑰红色络合物', passed: true }, { name: 'TLC 365nm 三色带清晰对照', passed: true }],
      demoBatches: [{ mass: 30, crude: 0.85, refined: 0.48, mp: 182.6 }, { mass: 30, crude: 0.91, refined: 0.52, mp: 183.1 }, { mass: 30, crude: 0.88, refined: 0.50, mp: 182.8 }]
    },
    magnolia: {
      id: 'magnolia', herb: '厚朴', isInnovative: true, compound: '厚朴酚与和厚朴酚', latin: 'Magnolia officinalis Rehd. et Wils.', category: '香豆素与木脂素',
      defaultRig: 'extract', defaultExtract: 'reflux', defaultSep: 'extract', formulas: ['henderson', 'diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 80, time: 90, mesh: '中粉(40目)', cycles: '2', solventType: '90%乙醇', ph: '碱溶12 / 酸沉5' },
      limitVal: 2.00, limitUnit: '%', crudeUnit: 'g', mpRef: '101～103℃(厚朴酚)',
      origin: '木兰科植物厚朴干燥干皮、根皮及枝皮。燥湿消痰、下气除满。',
      chemistry: '联苯型新木脂素异构体：厚朴酚（双邻位酚羟基）与和厚朴酚（一邻一对酚羟基），具弱酸性可溶于稀碱液。',
      pharmacopoeia: '《中国药典》规定干燥厚朴含厚朴酚与和厚朴酚总量不得少于 2.0%。',
      integrative: '绿色免柱层析创新：利用厚朴酚与和厚朴酚在弱极性溶剂及乙醇-水体系中的结晶度差异，通过选择性萃取与滴水梯度析晶即可高纯分离，免去高耗硅胶柱；现代药理聚焦其抗焦虑与抗肿瘤机制。',
      scaling: { auxName: '石油醚/2%NaOH', auxFactor: 0.35, auxUnit: 'g', yieldLow: 0.022, yieldHigh: 0.042, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板；甲苯-甲醇 (17:1)；1% 香草醛硫酸液 105℃ 显紫红色斑点。',
      tlcDefault: { front: 8.0, sample: 4.4, ref: 4.5 },
      steps: [
        { stage: '提取', title: '90% 乙醇加热回流提取', principle: '厚朴酚与和厚朴酚脂溶性强，高浓度乙醇充分提取并避开多糖。', qc: '回流 2 次，减压浓缩至浸膏。' },
        { stage: '分离', title: '碱溶酸沉-液液萃取除挥发油', principle: '2% NaOH 溶解酚类，石油醚萃取除去中性桉叶醇挥发油，水相酸化回提。', qc: '分液漏斗振摇放气，酸沉至 pH 5~6。' },
        { stage: '纯化', title: '乙醇-水梯度析晶分离异构体', principle: '厚朴酚较和厚朴酚更易在低浓度乙醇-水中优先结晶析出。', qc: '缓慢滴加纯水至微浑，静置析晶。' },
        { stage: '检识', title: 'FeCl₃ 显色、香草醛-硫酸与 TLC', principle: '酚羟基遇 FeCl₃ 显蓝黑色，TLC 可清晰区分厚朴酚与和厚朴酚双斑。', qc: '双斑点分离度良好，|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [{ issue: '碱液萃取乳化严重', cause: '浸膏含树脂及挥发油较多。', fix: '加少量乙醇或饱和食盐水破乳静置分层。' }],
      sop: ['厚朴中粉90%乙醇回流提取2次', '浓缩浸膏以2%NaOH溶解并石油醚除油', '水相调pH 5以乙酸乙酯分液萃取', '乙醇-水梯度析晶纯化厚朴酚', 'FeCl₃显色与双对照品TLC检识'],
      chemTests: [{ name: 'FeCl₃ 酚羟基显蓝黑色', passed: true }, { name: '香草醛-硫酸显紫红斑点', passed: true }, { name: 'TLC 厚朴酚/和厚朴酚双斑分离', passed: true }],
      demoBatches: [{ mass: 50, crude: 1.48, refined: 1.15, mp: 101.8 }, { mass: 50, crude: 1.56, refined: 1.22, mp: 102.2 }, { mass: 50, crude: 1.52, refined: 1.18, mp: 102.0 }]
    },
    schisandra: {
      id: 'schisandra', herb: '北五味子', isInnovative: true, compound: '五味子醇甲（总木脂素）', latin: 'Schisandra chinensis (Turcz.) Baill.', category: '香豆素与木脂素',
      defaultRig: 'ultrasound', defaultExtract: 'ultrasound', defaultSep: 'resin', formulas: ['diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 50, time: 45, mesh: '捣碎中粉(20目)', cycles: '2', solventType: '80%乙醇', ph: '中性 7.0' },
      limitVal: 0.40, limitUnit: '%', crudeUnit: 'g', mpRef: '132～134℃(醇甲)',
      origin: '木兰科植物五味子干燥成熟果实。收敛固涩、益气生津、补肾宁心。',
      chemistry: '联苯环辛烯型木脂素群（五味子醇甲、五味子甲素、乙素、酯甲），主要富集于种仁内，脂溶性强。',
      pharmacopoeia: '《中国药典》规定北五味子含五味子醇甲不得少于 0.40%。',
      integrative: '创新制剂延伸：五味子木脂素保肝降酶确切但难溶于水，可在大孔树脂富集后，以 PVP-K30 制备“总木脂素固体分散体”显著提升溶出度，或采用基质固相分散（MSPD）微量化前处理（参考 PMC 2023）。',
      scaling: { auxName: 'AB-8树脂/石油醚', auxFactor: 0.30, auxUnit: 'g', yieldLow: 0.006, yieldHigh: 0.015, yieldUnit: 'g' },
      tlcSystem: '硅胶 GF254 板；石油醚(30~60℃)-甲酸乙酯-甲酸 (15:5:1) 上层液；254 nm 暗斑。',
      tlcDefault: { front: 8.0, sample: 2.9, ref: 3.0 },
      steps: [
        { stage: '提取', title: '捣碎破籽与 80% 乙醇超声提取', principle: '必须击破坚硬种皮释放种仁内木脂素，超声空化加速脂溶性成分溶出。', qc: '果仁充分捣碎，避免只提果肉。' },
        { stage: '分离', title: '浓缩除醇与大孔树脂梯度洗脱', principle: '水与 30% 乙醇洗除有机酸与果糖，80% 乙醇集中洗脱总木脂素。', qc: '洗脱液无果酸黏腻感。' },
        { stage: '纯化', title: '石油醚脱脂与硅胶柱精制醇甲', principle: '除去种仁脂肪油后，硅胶柱分离极性相对较大的五味子醇甲。', qc: '254nm 紫外监测跟踪流分。' },
        { stage: '检识', title: 'Labat 显色反应与 254nm TLC', principle: '含亚甲二氧基木脂素遇没食子酸-浓硫酸显翠绿色，TLC 紫外暗斑对照。', qc: '|ΔRf| ≤ 0.03，斑点清晰无拖尾。' }
      ],
      troubleshoot: [{ issue: '提取物油状难干燥', cause: '五味子种仁含大量脂肪油。', fix: '大孔树脂上样前冷冻离心或低温石油醚脱脂。' }],
      sop: ['五味子捣碎破籽后80%乙醇超声提取', '浓缩除醇低温脱去脂肪油', 'AB-8大孔树脂水洗除糖酸后80%醇洗脱', '浓缩得总木脂素部位并TLC监测', '254nm紫外及香草醛显色检识'],
      chemTests: [{ name: '254nm 紫外特征荧光淬灭斑点', passed: true }, { name: '香草醛-硫酸加热显紫蓝色', passed: true }, { name: 'TLC 五味子醇甲同位单斑', passed: true }],
      demoBatches: [{ mass: 50, crude: 0.65, refined: 0.28, mp: 132.8 }, { mass: 50, crude: 0.70, refined: 0.31, mp: 133.2 }, { mass: 50, crude: 0.68, refined: 0.29, mp: 133.0 }]
    },
    notoginseng: {
      id: 'notoginseng', herb: '三七', isInnovative: true, compound: '三七总皂苷 (R1/Rg1/Rb1)', latin: 'Panax notoginseng (Burk.) F.H. Chen', category: '皂苷与三萜',
      defaultRig: 'ultrasound', defaultExtract: 'ultrasound', defaultSep: 'resin', formulas: ['diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 50, time: 60, mesh: '细粉(60目)', cycles: '2', solventType: '70%乙醇', ph: '中性 7.0' },
      limitVal: 5.00, limitUnit: '%', crudeUnit: 'g', mpRef: '194～198℃(Rg1)',
      origin: '五加科植物三七干燥根和根茎。散瘀止血、消肿定痛。',
      chemistry: '达玛烷型四环三萜皂苷，总皂苷含量高达 5%~12%，以特征成分三七皂苷 R1 及人参皂苷 Rg1、Rb1 为主。',
      pharmacopoeia: '《中国药典》规定三七含三七皂苷 R1、人参皂苷 Rg1 及 Rb1 总量不得少于 5.0%。',
      integrative: '中西医结合脑保护前沿：三七总皂苷（血栓通/血塞通原料）可通过 PI3K/Akt/mTOR 促血管新生、抑制 NLRP3 焦亡抗缺血性脑卒中（参考《中华全科医学》2022），适合设计“提取纯化+抗血小板聚集/抗氧化体外模型”综合课题。',
      scaling: { auxName: 'D101树脂/正丁醇', auxFactor: 0.40, auxUnit: 'g', yieldLow: 0.055, yieldHigh: 0.095, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板；三氯甲烷-甲醇-水 (13:7:2) 10℃ 以下下层液；10% 硫酸乙醇 105℃ 显紫红斑。',
      tlcDefault: { front: 8.0, sample: 3.1, ref: 3.2 },
      steps: [
        { stage: '提取', title: '70% 乙醇超声辅助浸提', principle: '三七皂苷热稳定性尚可但超声法可显著避免淀粉糊化并缩短工时。', qc: '提取 2 次，过滤合并澄清液。' },
        { stage: '分离', title: '水饱和正丁醇萃取或 D101 树脂纯化', principle: '水洗除糖，30% 乙醇除杂，70% 乙醇富集高纯度三七总皂苷。', qc: '70% 乙醇洗脱液无色透明、泡沫持久。' },
        { stage: '纯化', title: '脱色浓缩与真空干燥得白色总皂苷粉', principle: '活性炭微量脱色后减压蒸干得疏松类白色三七总皂苷。', qc: '干燥温度 ≤ 60℃ 防焦糖化。' },
        { stage: '检识', title: '泡沫试验、Liebermann-Burchard 与 TLC', principle: '三萜皂苷遇浓硫酸-醋酐显紫红色，TLC 可同时检识 R1、Rg1、Rb1 三斑。', qc: '特征三七皂苷 R1 斑点清晰，|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [{ issue: '正丁醇萃取乳化', cause: '皂苷本身是强表面活性剂。', fix: '优先采用 D101 大孔树脂吸附法替代正丁醇液液萃取。' }],
      sop: ['三七细粉70%乙醇超声提取2次', '减压浓缩回收乙醇并加水稀释上柱', 'D101大孔树脂水洗除糖、70%醇洗脱', '浓缩真空干燥得白色三七总皂苷', '泡沫试验与R1/Rg1/Rb1三对照TLC'],
      chemTests: [{ name: '水振摇产生持久蜂窝状泡沫', passed: true }, { name: '醋酐-浓硫酸显紫红色', passed: true }, { name: 'TLC R1/Rg1/Rb1 三斑清晰对照', passed: true }],
      demoBatches: [{ mass: 50, crude: 4.15, refined: 3.25, mp: 195.4 }, { mass: 50, crude: 4.32, refined: 3.38, mp: 196.0 }, { mass: 50, crude: 4.24, refined: 3.31, mp: 195.7 }]
    },
    lycium: {
      id: 'lycium', herb: '枸杞子', isInnovative: true, compound: '枸杞多糖 (LBP · 水提醇沉)', latin: 'Lycium barbarum L.', category: '多糖类',
      defaultRig: 'ultrasound', defaultExtract: 'ultrasound', defaultSep: 'precip', formulas: ['diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 15, temp: 75, time: 90, mesh: '剪碎脱脂果肉', cycles: '2', solventType: '纯化水 / 80%乙醇沉淀', ph: '中性 7.0' },
      limitVal: 1.80, limitUnit: '%', crudeUnit: 'g', mpRef: '高分子无固定熔点',
      origin: '茄科植物宁夏枸杞干燥成熟果实，药食同源经典滋补中药。',
      chemistry: '水溶性蛋白多糖复合物（阿拉伯糖、半乳糖、葡萄糖、鼠李糖等），易溶于水、不溶于高浓度乙醇。',
      pharmacopoeia: '《中国药典》规定枸杞子含枸杞多糖（以葡萄糖计）不得少于 1.8%。',
      integrative: '创新纯化与免疫评价：通过“80%乙醇先脱脂脱单糖 → 热水/超声提多糖 → 醇沉 → Sevag法除游离蛋白”完整演练大分子多糖制备全流程，并衔接免疫调节/肠道益生元药食同源产品开发。',
      scaling: { auxName: '无水乙醇(醇沉)', auxFactor: 3.00, auxUnit: 'mL', yieldLow: 0.025, yieldHigh: 0.055, yieldUnit: 'g' },
      tlcSystem: '苯酚-硫酸法 490 nm 紫外分光光度定量 + 酸水解单糖纸层析/TLC 对照。',
      tlcDefault: { front: 8.0, sample: 3.6, ref: 3.7 },
      steps: [
        { stage: '提取', title: '80% 乙醇回流脱脂脱单糖 → 热水超声提取', principle: '先除去脂溶性色素与游离单糖，再以纯化水充分溶出大分子多糖。', qc: '脱脂至醇液色淡，水提浓缩至 1:2。' },
        { stage: '分离', title: '4 倍量 95% 乙醇醇沉静置过夜', principle: '提高醇浓度至 80%，降低介电常数使多糖脱水凝聚沉淀。', qc: '4℃ 静置 12 h，离心收集粗多糖。' },
        { stage: '纯化', title: 'Sevag 法（氯仿-正丁醇 4:1）除游离蛋白', principle: '蛋白质在有机相界面变性形成白色凝胶层，水相保留纯化多糖。', qc: '重复振摇离心至两相界面无白色蛋白膜，冻干/丙酮脱水。' },
        { stage: '检识', title: 'Molish 紫环反应、考马斯亮蓝与苯酚-硫酸法', principle: 'Molish 阳性确认糖类，考马斯亮蓝阴性确认蛋白除净，490nm 测多糖含量。', qc: '无游离蛋白残留，多糖含量 ≥ 1.8%。' }
      ],
      troubleshoot: [{ issue: '醇沉物粘壁发黏', cause: '药材未先脱除大量游离果糖/葡萄糖。', fix: '水提前务必用 80% 乙醇热回流脱除单糖和色素。' }],
      sop: ['枸杞子80%乙醇回流脱脂脱单糖', '药渣纯化水75℃超声提取2次并浓缩', '加4倍量95%乙醇4℃静置醇沉过夜', '复溶后以Sevag法除游离蛋白', 'Molish反应与苯酚-硫酸490nm测定'],
      chemTests: [{ name: 'Molish 反应两相界面显紫环', passed: true }, { name: '考马斯亮蓝检测蛋白基本除净', passed: true }, { name: '苯酚-硫酸法 490nm 橙黄色显色', passed: true }],
      demoBatches: [{ mass: 50, crude: 2.35, refined: 1.42, mp: 0 }, { mass: 50, crude: 2.48, refined: 1.51, mp: 0 }, { mass: 50, crude: 2.40, refined: 1.46, mp: 0 }]
    },
    corydalis: {
      id: 'corydalis', herb: '醋延胡索', isInnovative: true, compound: '延胡索乙素（四氢巴马汀）', latin: 'Corydalis yanhusuo W.T. Wang', category: '生物碱',
      defaultRig: 'extract', defaultExtract: 'acid_water', defaultSep: 'extract', formulas: ['henderson', 'diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 65, time: 60, mesh: '中粉(40目)', cycles: '2', solventType: '70%乙醇 / 酸水', ph: '酸溶2 / 碱游离10' },
      limitVal: 0.05, limitUnit: '%', crudeUnit: 'g', mpRef: '147～149℃',
      origin: '罂粟科植物延胡索干燥块茎（醋炙品）。活血、行气、止痛。',
      chemistry: '原小檗碱型叔胺生物碱，游离态亲脂易溶于氯仿/乙醚，遇酸（如米醋中醋酸）成盐显著提高水溶性。',
      pharmacopoeia: '《中国药典》规定延胡索含延胡索乙素不得少于 0.050%。',
      integrative: '炮制化学机制创新实验：设计“生延胡索 vs 醋炙延胡索”平行水提对照实验，直观验证中医“醋制行气止痛增效”即酸碱成盐提高叔胺碱水溶性的化学本质，并延伸至非成瘾性镇痛机制探讨。',
      scaling: { auxName: '氨水/乙酸乙酯', auxFactor: 0.40, auxUnit: 'mL', yieldLow: 0.0006, yieldHigh: 0.0014, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板(1%NaOH制板)；甲苯-丙酮 (9:2)；碘蒸气显黄棕色斑，365nm 显荧光。',
      tlcDefault: { front: 8.0, sample: 4.7, ref: 4.8 },
      steps: [
        { stage: '提取', title: '生品与醋品对照提取（稀酸水或 70% 乙醇）', principle: '依据 Henderson-Hasselbalch 方程，酸性介质使叔胺生物碱质子化成盐溶出。', qc: '平行记录生品/醋品浸出物收率差异。' },
        { stage: '分离', title: '浓氨水调 pH 10 碱化 + 分液漏斗液-液萃取', principle: '碱化释放脂溶性游离延胡索乙素，用乙酸乙酯/氯仿萃取转入有机相。', qc: '分液萃取 3 次，合并有机相并无水 Na₂SO₄ 脱水。' },
        { stage: '纯化', title: '氧化铝小柱除杂与甲醇重结晶', principle: '除去非碱性色素，低温析出淡黄色棱柱状延胡索乙素结晶。', qc: '避光保存防氧化变色。' },
        { stage: '检识', title: '碘化铋钾沉淀、碱板 TLC 对照', principle: '生物碱沉淀试剂阳性，碱性硅胶板有效抑制生物碱斑点拖尾。', qc: '1% NaOH 硅胶板圆斑清晰，|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [{ issue: '普通硅胶板 TLC 严重拖尾', cause: '硅胶呈微酸性与叔胺生物碱成盐吸附。', fix: '使用 1% NaOH 制成的碱性硅胶 G 板或在展开缸加氨蒸气饱和。' }],
      sop: ['称取醋延胡索(可设生品对照组)中粉', '稀酸水或70%乙醇加热提取并过滤', '滤液以氨水调pH 10释放游离碱', '分液漏斗以乙酸乙酯萃取3次并浓缩', '碘化铋钾沉淀与碱板TLC对照检识'],
      chemTests: [{ name: '碘化铋钾试剂橘红色沉淀', passed: true }, { name: '碘化汞钾类白色沉淀', passed: true }, { name: '碱板 TLC 碘蒸气同位单斑', passed: true }],
      demoBatches: [{ mass: 50, crude: 0.062, refined: 0.038, mp: 147.8 }, { mass: 50, crude: 0.068, refined: 0.042, mp: 148.2 }, { mass: 50, crude: 0.065, refined: 0.040, mp: 148.0 }]
    },
    gardenia: {
      id: 'gardenia', herb: '栀子', isInnovative: true, compound: '栀子苷与西红花苷（双组分同步）', latin: 'Gardenia jasminoides Ellis', category: '萜类内酯与环烯醚萜',
      defaultRig: 'column', defaultExtract: 'ultrasound', defaultSep: 'resin', formulas: ['diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 45, time: 45, mesh: '粗粉(20目)', cycles: '2', solventType: '60%乙醇', ph: '中性 7.0 (防酸水解变蓝)' },
      limitVal: 1.80, limitUnit: '%', crudeUnit: 'g', mpRef: '163～165℃(栀子苷)',
      origin: '茜草科植物栀子干燥成熟果实。泻火除烦、清热利湿、凉血解毒。',
      chemistry: '同时富含环烯醚萜苷（栀子苷，无色，遇酸/酶水解后与氨基酸生成栀子蓝）及水溶性类胡萝卜素色素（西红花苷/栀子黄）。',
      pharmacopoeia: '《中国药典》规定干燥栀子含栀子苷不得少于 1.8%。',
      integrative: '一材双提绿色工艺：利用 HPD-100 大孔树脂极性梯度洗脱，30% 乙醇先收无色栀子苷（利胆保肝抗炎），60% 乙醇再收金黄色西红花苷（天然食品色素+抗抑郁活性），综合利用率翻倍。',
      scaling: { auxName: 'HPD-100树脂', auxFactor: 0.40, auxUnit: 'g', yieldLow: 0.024, yieldHigh: 0.045, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板；乙酸乙酯-丙酮-甲酸-水 (5:5:1:1)；10% 硫酸乙醇 110℃ 显紫黑色斑点。',
      tlcDefault: { front: 8.0, sample: 4.2, ref: 4.3 },
      steps: [
        { stage: '提取', title: '60% 乙醇低温超声同步提取', principle: '45℃ 低温保护热敏环烯醚萜苷与西红花苷双键，防止聚合变色。', qc: '控制 pH 中性，严禁强酸加热。' },
        { stage: '分离', title: 'HPD-100 大孔树脂分段梯度洗脱', principle: '水洗除糖，30% 乙醇洗脱栀子苷，60% 乙醇洗脱金黄色西红花苷。', qc: '按色带变化分段接收两股流分。' },
        { stage: '纯化', title: '丙酮-乙醇重结晶得白色栀子苷', principle: '栀子苷在丙酮-乙醇混合液中易析出白色针状结晶。', qc: '减压低温浓缩至析晶。' },
        { stage: '检识', title: '氨基酸变蓝特征反应与 TLC 对照', principle: '栀子苷经酸/β-葡萄糖苷酶水解成京尼平，与氨基酸共热呈现特征深蓝色。', qc: '京尼平-氨基酸显蓝阳性，|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [{ issue: '提取液发蓝发黑', cause: '溶液呈酸性或温度过高导致环烯醚萜水解。', fix: '保持提取液中性并采用 ≤ 45℃ 超声提取。' }],
      sop: ['栀子粉碎过20目，60%乙醇45℃超声提取', '浓缩除醇上HPD-100大孔树脂柱', '30%乙醇收栀子苷、60%乙醇收栀子黄', '30%流分浓缩丙酮重结晶得栀子苷', '京尼平显蓝反应与TLC对照检识'],
      chemTests: [{ name: '水解后遇氨基酸显特征深蓝色', passed: true }, { name: '60%流分呈鲜亮金黄色西红花苷', passed: true }, { name: 'TLC 10%硫酸乙醇紫黑单斑', passed: true }],
      demoBatches: [{ mass: 50, crude: 1.95, refined: 1.38, mp: 163.8 }, { mass: 50, crude: 2.08, refined: 1.46, mp: 164.4 }, { mass: 50, crude: 2.02, refined: 1.42, mp: 164.1 }]
    },
    star_anise: {
      id: 'star_anise', herb: '八角茴香', isInnovative: true, compound: '莽草酸（抗流感药物前体）', latin: 'Illicium verum Hook. f.', category: '苯丙素与有机酸',
      defaultRig: 'reflux', defaultExtract: 'reflux', defaultSep: 'resin', formulas: ['henderson', 'diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 85, time: 90, mesh: '粗粉(20目)', cycles: '2', solventType: '70%乙醇 / 热水', ph: '弱酸 3.5' },
      limitVal: 4.00, limitUnit: '%', crudeUnit: 'g', mpRef: '185～187℃',
      origin: '木兰科植物八角茴香干燥成熟果实，我国广西/云南特色道地药食同源资源。',
      chemistry: '三羟基环己烯羧酸（pKa ≈ 4.15），水与低级醇溶性极好，不溶于氯仿与石油醚，是抗甲流特效药奥司他韦（达菲）的关键天然手性前体。',
      pharmacopoeia: '《中国药典》收载八角茴香，优质药材干基含莽草酸可达 5%~8%。',
      integrative: '中西医结合制药典范：可串联“先水蒸气蒸馏收茴香油 → 药渣再水提醇沉 + 阴离子交换树脂捕获莽草酸”零废料联产工艺，展示中药天然产物向现代化学合成药物转化的完整产业链思维。',
      scaling: { auxName: '阴离子树脂/乙酸', auxFactor: 0.40, auxUnit: 'g', yieldLow: 0.038, yieldHigh: 0.068, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板；乙酸乙酯-甲醇-水-甲酸 (10:2:1:0.5)；0.5% 高锰酸钾或溴甲酚绿显色。',
      tlcDefault: { front: 8.0, sample: 3.5, ref: 3.6 },
      steps: [
        { stage: '提取', title: '先脱油（或直接 70% 乙醇热回流）提取', principle: '先除茴香脑挥发油减少乳化，再以极性溶剂充分溶出强极性莽草酸。', qc: '回流 2 次，每次 1.5 h。' },
        { stage: '分离', title: '醇沉除多糖 + 强碱性阴离子树脂吸附', principle: '利用莽草酸羧基解离带负电特性，选择性吸附于阴离子树脂并除去中性糖。', qc: '稀乙酸或稀盐酸洗脱回收莽草酸。' },
        { stage: '纯化', title: '活性炭脱色与甲醇-乙酸乙酯重结晶', principle: '脱除酚酸棕色杂质，浓缩后析出白色棱柱状莽草酸纯晶。', qc: '60℃ 干燥测熔点。' },
        { stage: '检识', title: '高碘酸氧化显色、溴甲酚绿与 TLC', principle: '邻二醇结构被高碘酸氧化后显特征色，溴甲酚绿板呈亮黄色酸性斑点。', qc: '熔点 185~187℃，|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [{ issue: '结晶带褐色粘稠物', cause: '未充分脱除鞣质与挥发油树脂。', fix: '上离子交换柱前先冷置过滤并用 1% 活性炭脱色 20 min。' }],
      sop: ['八角茴香粉碎，70%乙醇热回流提取2次', '浓缩加水冷置除油并活性炭脱色', '通过阴离子交换树脂吸附并以稀乙酸洗脱', '浓缩重结晶得白色莽草酸晶体', '溴甲酚绿酸性显色与TLC对照'],
      chemTests: [{ name: '溴甲酚绿喷雾显亮黄色酸性斑', passed: true }, { name: '高锰酸钾迅速褪色（双键阳性）', passed: true }, { name: '熔点 185~187℃ 及 TLC 单斑', passed: true }],
      demoBatches: [{ mass: 50, crude: 2.85, refined: 2.24, mp: 185.8 }, { mass: 50, crude: 3.02, refined: 2.38, mp: 186.4 }, { mass: 50, crude: 2.94, refined: 2.31, mp: 186.1 }]
    }
    ,periploca: {
      id: 'periploca', herb: '香加皮', isInnovative: true, compound: '杠柳毒苷（甲型强心苷）', latin: 'Periploca sepium Bge.', category: '甾体与强心苷',
      defaultRig: 'extract', defaultExtract: 'reflux', defaultSep: 'extract', formulas: ['diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 65, time: 60, mesh: '粗粉(20目)', cycles: '2', solventType: '70%乙醇', ph: '中性 7.0 (严防酸碱水解)' },
      limitVal: 0.20, limitUnit: '%', crudeUnit: 'g', mpRef: '220～224℃',
      origin: '萝藦科植物杠柳干燥根皮（北方称北五加皮，含强心苷，注意与五加皮区分）。祛风湿、强筋骨、利水消肿。',
      chemistry: '典型甲型强心苷（C17连五元不饱和内酯环 + α-去氧糖加拿大麻糖），具显著强心活性，对酸、碱及酶均敏感。',
      pharmacopoeia: '《中国药典》收载香加皮（同时含4-甲氧基水杨醛及杠柳毒苷），实验须严格佩戴手套、防误入口。',
      integrative: '第八章甾体核心教学模型：通过乙醇提取 + 中性醋酸铅除杂（严禁用碱式醋酸铅防破坏内酯环）+ 氯仿-乙醇液液萃取，直观演练甲型强心苷“活性亚甲基”与“α-去氧糖”双维特征检识。',
      scaling: { auxName: '氯仿-乙醇(2:1)', auxFactor: 0.50, auxUnit: 'mL', yieldLow: 0.002, yieldHigh: 0.005, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板；三氯甲烷-甲醇-水 (65:35:10 下层)；Kedde 试剂显紫红色斑点。',
      tlcDefault: { front: 8.0, sample: 4.5, ref: 4.6 },
      steps: [
        { stage: '提取', title: '70% 乙醇低温回流或超声提取', principle: '70% 乙醇兼顾原生苷与次生苷溶出，且可灭活水解酶保护糖链完整。', qc: '控制 pH 中性，严禁加酸或强碱。' },
        { stage: '分离', title: '石油醚脱脂 + 中性醋酸铅除鞣质色素', principle: '脱除树脂与 4-甲氧基水杨醛等脂溶性杂质，中性醋酸铅不破坏强心苷内酯环。', qc: '滤液通 CO₂ 或加 Na₂SO₄ 除尽过量铅离子。' },
        { stage: '纯化', title: '分液漏斗氯仿-乙醇(2:1) 梯度萃取', principle: '利用单糖/二糖强心苷亲脂性，转入有机相浓缩重结晶。', qc: '低温减压回收溶剂。' },
        { stage: '检识', title: 'Legal / Kedde 反应与 Keller-Kiliani 反应', principle: 'Kedde(3,5-二硝基苯甲酸)检五元内酯环显紫红；K-K 反应检 α-去氧糖使醋酸层显翠蓝。', qc: '两类反应均阳性，UV λmax ≈ 217nm。' }
      ],
      troubleshoot: [{ issue: 'Kedde 反应不显色', cause: '提取或除杂过程中误用强碱导致五元内酯环开环异构化。', fix: '全程维持中性 pH 6.5~7.2，除杂只用中性醋酸铅。' }],
      sop: ['香加皮粗粉70%乙醇65℃温和提取2次', '浓缩加水并以石油醚脱脂除杂', '中性醋酸铅沉淀色素并除铅', '氯仿-乙醇(2:1)分液萃取浓缩', 'Kedde、Keller-Kiliani及TLC检识'],
      chemTests: [{ name: 'Kedde 试剂（甲型内酯环）显紫红', passed: true }, { name: 'Keller-Kiliani（α-去氧糖）醋酸层翠蓝', passed: true }, { name: 'Liebermann-Burchard 甾体显蓝绿', passed: true }],
      demoBatches: [{ mass: 50, crude: 0.24, refined: 0.14, mp: 221.5 }, { mass: 50, crude: 0.27, refined: 0.16, mp: 222.2 }, { mass: 50, crude: 0.25, refined: 0.15, mp: 221.8 }]
    },
    anemarrhena: {
      id: 'anemarrhena', herb: '知母', isInnovative: true, compound: '知母皂苷 BⅡ / 菝葜皂苷元', latin: 'Anemarrhena asphodeloides Bge.', category: '甾体与强心苷',
      defaultRig: 'reflux', defaultExtract: 'reflux', defaultSep: 'resin', formulas: ['diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 80, time: 90, mesh: '中粉(40目)', cycles: '2', solventType: '70%乙醇', ph: '中性 7.0' },
      limitVal: 3.00, limitUnit: '%', crudeUnit: 'g', mpRef: '198～202℃(苷元)',
      origin: '百合科植物知母干燥根茎。清热泻火、滋阴润燥。',
      chemistry: '典型甾体皂苷（呋甾烷醇型知母皂苷 BⅡ 与螺甾烷醇型知母皂苷 AⅢ），无羧基呈中性，酸水解得菝葜皂苷元。',
      pharmacopoeia: '《中国药典》规定干燥知母含知母皂苷 BⅡ 不得少于 3.0%。',
      integrative: '第八章甾体与第七章三萜对照设计：将知母（甾体皂苷）与人参/甘草（三萜皂苷）平行进行泡沫酸碱管试验及 Liebermann-Burchard 反应，直观区分甾体(最终蓝绿)与三萜(最终紫红)的经典鉴别规律。',
      scaling: { auxName: 'D101树脂/盐酸(水解选)', auxFactor: 0.35, auxUnit: 'g', yieldLow: 0.032, yieldHigh: 0.058, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板；正丁醇-冰醋酸-水 (4:1:5 上层)；香草醛-硫酸 105℃ 显黄绿色斑点。',
      tlcDefault: { front: 8.0, sample: 3.6, ref: 3.7 },
      steps: [
        { stage: '提取', title: '70% 乙醇加热回流提取总甾体皂苷', principle: '抑制粘液质溶出，充分提取极性较大的呋甾烷醇双糖链皂苷 BⅡ。', qc: '回流 2 次，过滤合并滤液。' },
        { stage: '分离', title: '浓缩除醇 + D101 大孔树脂富集', principle: '水洗除糖与芒果苷等酚类，50%~70% 乙醇洗脱富集知母总皂苷。', qc: '洗脱液泡沫丰富持久。' },
        { stage: '纯化', title: '酸水解制备菝葜皂苷元（创新对比组）', principle: '创新组可用 2 mol/L 盐酸水解断裂糖链，析出脂溶性菝葜皂苷元并以丙酮重结晶。', qc: '比较原生皂苷与苷元极性 Rf 变化。' },
        { stage: '检识', title: '酸碱泡沫管、Liebermann-Burchard 与 TLC', principle: '碱管泡沫远高于酸管提示甾体皂苷；醋酐-浓硫酸最终显蓝绿色。', qc: 'L-B 反应最终蓝绿阳性，|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [{ issue: '提取液黏稠过滤慢', cause: '知母富含黏液质。', fix: '确保乙醇浓度 ≥ 70%，趁热抽滤。' }],
      sop: ['知母中粉70%乙醇回流提取2次', '减压浓缩回收乙醇加水分散', 'D101大孔树脂水洗除杂后醇洗脱', '浓缩干燥（可选做酸水解制苷元）', '酸碱泡沫管、L-B显蓝绿及TLC检识'],
      chemTests: [{ name: '碱管泡沫高度显著高于酸管', passed: true }, { name: 'Liebermann-Burchard 最终显蓝绿色', passed: true }, { name: 'TLC 香草醛-硫酸同位单斑', passed: true }],
      demoBatches: [{ mass: 50, crude: 2.38, refined: 1.76, mp: 199.4 }, { mass: 50, crude: 2.52, refined: 1.85, mp: 200.1 }, { mass: 50, crude: 2.45, refined: 1.80, mp: 199.8 }]
    }
    ,clove: {
      id: 'clove', herb: '丁香', isInnovative: true, compound: '丁香酚（碱溶酸沉分酚法）', latin: 'Eugenia caryophyllata Thunb.', category: '挥发油与萜类',
      defaultRig: 'steam', defaultExtract: 'steam', defaultSep: 'extract', formulas: ['distill', 'henderson', 'qc'],
      defaultCfg: { mass: 40, ratio: 10, temp: 100, time: 180, mesh: '粗粉(10~20目)', cycles: '1', solventType: '纯化水 / 5% NaOH', ph: '碱溶12 / 酸析2' },
      limitVal: 11.0, limitUnit: '%', crudeUnit: 'mL', mpRef: '液体(沸点254℃)',
      origin: '桃金娘科植物丁香干燥花蕾。温中降逆、补肾助阳，挥发油含量极高（15%~20%），本科实验室出油直观、极易成功。',
      chemistry: '丁香挥发油中 70%~85% 为酚性成分丁香酚（pKa≈10.19），其余为非酚性石竹烯等；利用酚羟基弱酸性可实现挥发油内“酚性 vs 非酚性”精准化学分离。',
      pharmacopoeia: '《中国药典》规定干燥丁香含丁香酚不得少于 11.0%。',
      integrative: '院校高可行经典创新：常规水蒸气蒸馏+分液漏斗即可完成。用 5% NaOH 萃取丁香酚成钠盐进入水相，分除上层非酚性油，水相酸化复析高纯丁香酚；可延伸探讨其牙科局麻镇痛与透皮促渗机制。',
      scaling: { auxName: '5%NaOH/无水Na₂SO₄', auxFactor: 0.50, auxUnit: 'g', yieldLow: 0.11, yieldHigh: 0.16, yieldUnit: 'mL' },
      tlcSystem: '硅胶 G 板；石油醚(60~90℃)-乙酸乙酯 (9:1)；5% 香草醛-硫酸 105℃ 显紫红斑。',
      tlcDefault: { front: 8.0, sample: 4.3, ref: 4.4 },
      steps: [
        { stage: '提取', title: '水蒸气蒸馏收集丁香总挥发油', principle: '依据道尔顿分压定律，丁香油（密度>1，沉于水底）随水蒸气共沸馏出。', qc: '选用重油测定器或以少量乙酸乙酯/二氯甲烷接收下层油。' },
        { stage: '分离', title: '5% NaOH 碱液萃取分离酚性与非酚性成分', principle: '依据 Henderson-Hasselbalch 方程，丁香酚成酚钠盐入水相，石竹烯等中性萜留在有机相。', qc: '分液漏斗温和振摇防乳化，萃取 3 次合并碱水层。' },
        { stage: '纯化', title: '稀盐酸调 pH 2 复析 + 无水 Na₂SO₄ 脱水', principle: '酸化恢复游离丁香酚，以乙酸乙酯回提并脱水蒸除溶剂得淡黄色澄清丁香酚。', qc: '脱水至无水硫酸钠松散不结块。' },
        { stage: '检识', title: 'FeCl₃ 酚羟基显蓝绿、溴水褪色与 TLC', principle: '酚羟基遇 FeCl₃ 显特征蓝绿色，烯丙基双键使溴水迅速褪色。', qc: 'FeCl₃ 蓝绿阳性，|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [{ issue: '蒸馏油沉在水底难读数', cause: '丁香油相对密度约 1.04~1.07 大于水。', fix: '使用重油挥发油测定器或在收集管中预加精确体积二甲苯/乙酸乙酯。' }],
      sop: ['丁香粗粉加水润胀后水蒸气蒸馏3 h', '乙酸乙酯接收总挥发油', '分液漏斗以5% NaOH萃取丁香酚入水相', '碱水层调pH 2酸析回提并无水Na₂SO₄脱水', 'FeCl₃显蓝绿与TLC对照检识'],
      chemTests: [{ name: 'FeCl₃ 乙醇液显特征蓝绿色', passed: true }, { name: '溴水迅速褪色（烯丙基双键）', passed: true }, { name: 'TLC 丁香酚对照单斑一致', passed: true }],
      demoBatches: [{ mass: 40, crude: 5.8, refined: 4.5, mp: 0 }, { mass: 40, crude: 6.1, refined: 4.8, mp: 0 }, { mass: 40, crude: 5.9, refined: 4.6, mp: 0 }]
    },
    cnidium: {
      id: 'cnidium', herb: '蛇床子', isInnovative: true, compound: '蛇床子素（免柱冷析重结晶）', latin: 'Cnidium monnieri (L.) Cuss.', category: '香豆素与木脂素',
      defaultRig: 'reflux', defaultExtract: 'reflux', defaultSep: 'freeze', formulas: ['diffusion', 'henderson', 'qc'],
      defaultCfg: { mass: 50, ratio: 8, temp: 80, time: 90, mesh: '粗粉(20目)', cycles: '2', solventType: '95%乙醇', ph: '中性 7.0' },
      limitVal: 1.00, limitUnit: '%', crudeUnit: 'g', mpRef: '83～85℃',
      origin: '伞形科植物蛇床干燥成熟果实。燥湿祛风、杀虫止痒，本科实验结晶成功率最高的香豆素单体之一。',
      chemistry: '7-甲氧基-8-异戊烯基香豆素（蛇床子素），亲脂性强、极易在石油醚或稀乙醇中低温析出规整白色针状结晶。',
      pharmacopoeia: '《中国药典》规定干燥蛇床子含蛇床子素不得少于 1.0%。',
      integrative: '本科常规实验优选创新：无需昂贵硅胶柱，仅用 95% 乙醇回流浓缩后低温静置，再用石油醚-乙酸乙酯(7:3)重结晶即可获得纯度 >95% 的针状晶体，还可拓展抗骨质疏松与抗瘙痒外用凝胶设计。',
      scaling: { auxName: '石油醚-乙酸乙酯', auxFactor: 0.40, auxUnit: 'mL', yieldLow: 0.012, yieldHigh: 0.024, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板；甲苯-乙酸乙酯-正己烷 (3:3:14)；365 nm 显亮蓝紫色荧光。',
      tlcDefault: { front: 8.0, sample: 4.6, ref: 4.7 },
      steps: [
        { stage: '提取', title: '95% 乙醇加热回流提取', principle: '高浓度乙醇选择性溶出脂溶性香豆素，大幅减少多糖与鞣质溶出。', qc: '回流 2 次，每次 1.5 h，趁热过滤。' },
        { stage: '分离', title: '浓缩至小体积 + 4℃ 冷藏析出粗晶', principle: '利用蛇床子素在冷乙醇中溶解度骤降的特性直接结晶分离。', qc: '4℃ 静置 12 h，减压抽滤得类白色粗晶。' },
        { stage: '纯化', title: '石油醚-乙酸乙酯(7:3)热溶重结晶', principle: '除去粘附叶绿素与脂肪油，获得雪白针状蛇床子素纯晶。', qc: '50℃ 以下干燥防融化（熔点 83~85℃）。' },
        { stage: '检识', title: '异羟肟酸铁、365nm 蓝紫荧光与熔点', principle: '香豆素内酯环遇碱性羟胺-FeCl₃显红色，365nm 紫外荧光极强。', qc: '熔点 83~85℃，|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [{ issue: '浓缩后呈油状不析晶', cause: '残留脂肪油过多或乙醇浓度偏高。', fix: '滴加少量纯水至微浑，用玻棒摩擦瓶壁并置 4℃ 诱导晶核。' }],
      sop: ['蛇床子粗粉95%乙醇回流提取2次', '减压回收乙醇至原体积1/5', '4℃冷藏静置析出粗晶并抽滤', '石油醚-乙酸乙酯重结晶得白色针晶', '测熔点(83~85℃)与365nm TLC检识'],
      chemTests: [{ name: '白色针状结晶熔点 83~85℃', passed: true }, { name: '异羟肟酸铁内酯反应显红色', passed: true }, { name: 'TLC 365nm 亮蓝紫荧光单斑', passed: true }],
      demoBatches: [{ mass: 50, crude: 0.92, refined: 0.68, mp: 83.6 }, { mass: 50, crude: 0.98, refined: 0.72, mp: 84.1 }, { mass: 50, crude: 0.95, refined: 0.70, mp: 83.9 }]
    },
    carthamus: {
      id: 'carthamus', herb: '红花', isInnovative: true, compound: '羟基红花黄色素 A（零有机溶剂水提）', latin: 'Carthamus tinctorius L.', category: '黄酮',
      defaultRig: 'ultrasound', defaultExtract: 'ultrasound', defaultSep: 'resin', formulas: ['diffusion', 'qc'],
      defaultCfg: { mass: 30, ratio: 15, temp: 50, time: 40, mesh: '干燥花丝(免粉碎)', cycles: '2', solventType: '纯化水（零有机溶剂）', ph: '中性 6.5 (防热降解)' },
      limitVal: 1.00, limitUnit: '%', crudeUnit: 'g', mpRef: '无定形黄色粉末',
      origin: '菊科植物红花干燥花。活血通经、散瘀止痛，心脑血管中成药核心水溶性原料。',
      chemistry: '单查耳酮碳苷（HSYA），极易溶于水，403 nm 处有强可见光特征吸收，但高温长时间煎煮易氧化降解。',
      pharmacopoeia: '《中国药典》规定红花含羟基红花黄色素 A 不得少于 1.0%。',
      integrative: '绿色零有机溶剂本科创新：全程仅用 50℃ 纯化水超声提取 + AB-8 大孔树脂水洗除糖、30% 乙醇洗脱精制，配合普通紫外-可见分光光度计 403 nm 即可定量，安全环保、现象鲜亮直观。',
      scaling: { auxName: 'AB-8大孔树脂', auxFactor: 0.50, auxUnit: 'g', yieldLow: 0.014, yieldHigh: 0.028, yieldUnit: 'g' },
      tlcSystem: '硅胶 H 板；乙酸乙酯-甲酸-水-甲醇 (7:2:3:0.4)；日光下直接显鲜亮黄色斑点。',
      tlcDefault: { front: 8.0, sample: 3.9, ref: 4.0 },
      steps: [
        { stage: '提取', title: '50℃ 纯化水低温超声浸提', principle: '利用查耳酮碳苷强水溶性，避开脂溶性红花醌苷，低温防热氧化。', qc: '提取温度严格 ≤ 55℃，得橙红色澄明液。' },
        { stage: '分离', title: 'AB-8 大孔树脂吸附与梯度洗脱', principle: '纯水冲洗除去游离糖与无机盐，20%~30% 乙醇洗脱高纯度 HSYA。', qc: '肉眼跟踪鲜亮金黄色色带集中接收。' },
        { stage: '纯化', title: '减压低温浓缩（≤50℃）得黄色精品', principle: '避光低温浓缩防止查耳酮环开裂变褐。', qc: '干燥后为疏松亮黄色粉末。' },
        { stage: '检识', title: '403 nm 可见光定量、浓硫酸显色与 TLC', principle: '查耳酮遇浓硫酸显深橙红，盐酸-镁粉呈阴性（与黄酮醇区分）。', qc: '403 nm 吸收强，日光 TLC 亮黄单斑。' }
      ],
      troubleshoot: [{ issue: '浓缩后粉末变暗褐色', cause: '水浴浓缩温度超过 70℃ 导致色素热分解。', fix: '减压旋蒸水浴控温 45~50℃ 并避光操作。' }],
      sop: ['红花花丝50℃纯化水超声提取2次', '抽滤合并橙红色水提液', 'AB-8大孔树脂水洗脱糖、30%乙醇收黄色带', '≤50℃减压浓缩干燥得HSYA精品', '403nm分光定量与日光TLC对照'],
      chemTests: [{ name: '盐酸-镁粉反应阴性（查耳酮特征）', passed: true }, { name: '浓硫酸显深橙红色', passed: true }, { name: '403 nm 强吸收及日光 TLC 亮黄斑', passed: true }],
      demoBatches: [{ mass: 30, crude: 0.72, refined: 0.44, mp: 0 }, { mass: 30, crude: 0.78, refined: 0.48, mp: 0 }, { mass: 30, crude: 0.75, refined: 0.46, mp: 0 }]
    },
    sophora_flavescens: {
      id: 'sophora_flavescens', herb: '苦参', isInnovative: true, compound: '苦参碱与氧化苦参碱（极性梯度分离）', latin: 'Sophora flavescens Ait.', category: '生物碱',
      defaultRig: 'extract', defaultExtract: 'acid_water', defaultSep: 'extract', formulas: ['henderson', 'diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 25, time: 120, mesh: '粗粉(20目)', cycles: '2', solventType: '0.5%稀酸水 / 乙醇', ph: '酸提2 / 碱化10' },
      limitVal: 1.20, limitUnit: '%', crudeUnit: 'g', mpRef: '76℃(苦参碱) / 208℃(氧化)',
      origin: '豆科植物苦参干燥根。清热燥湿、杀虫利尿，我国抗乙肝与抗肿瘤注射液核心原料。',
      chemistry: '喹诺里西啶类双稠哌啶生物碱：苦参碱亲脂溶于乙醚/氯仿；氧化苦参碱因含半极性 N→O 配位键，极性大、几乎不溶于乙醚但溶于氯仿与水。',
      pharmacopoeia: '《中国药典》规定干燥苦参含苦参碱和氧化苦参碱总量不得少于 1.2%。',
      integrative: '极性分级分离经典教学模型：本科仅用分液漏斗即可验证“N→O 配位键导致极性剧增”——碱化后先用乙醚萃出苦参碱，水相再用氯仿萃出氧化苦参碱，一步实现结构相似生物碱的精准分离。',
      scaling: { auxName: '氨水/乙醚/氯仿', auxFactor: 0.60, auxUnit: 'mL', yieldLow: 0.015, yieldHigh: 0.028, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板(2%NaOH制板)；甲苯-丙酮-甲醇 (8:3:0.5)；改良碘化铋钾显橘红双斑。',
      tlcDefault: { front: 8.0, sample: 5.1, ref: 5.2 },
      steps: [
        { stage: '提取', title: '0.5% 稀酸水冷浸或 70% 乙醇超声提取', principle: '成盐充分溶出苦参总生物碱，减少脂溶性黄酮（苦参酮）干扰。', qc: '提取 2 次，过滤合并清液。' },
        { stage: '分离', title: '氨水碱化 pH 10 → 乙醚与氯仿梯度萃取', principle: '利用苦参碱（溶于乙醚）与氧化苦参碱（不溶于乙醚、溶于氯仿）的显著溶解度差。', qc: '先乙醚萃 3 次得苦参碱，水相再以氯仿萃 3 次得氧化苦参碱。' },
        { stage: '纯化', title: '丙酮/石油醚低温析晶精制', principle: '氧化苦参碱在丙酮中溶解度小易析出白色结晶；苦参碱低温析晶。', qc: '分别回收溶剂并低温干燥。' },
        { stage: '检识', title: '碘化铋钾显色与碱板 TLC 双斑对照', principle: '碱板 TLC 上苦参碱 Rf 明显大于强极性氧化苦参碱，分离度清晰。', qc: '两斑点完全基线分离，|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [{ issue: '氧化苦参碱在乙醚中萃不出来', cause: 'N→O 键极性强，本身就不溶于乙醚。', fix: '乙醚只收苦参碱，务必换用氯仿或正丁醇继续萃取水相回收氧化苦参碱。' }],
      sop: ['苦参粗粉0.5%稀酸水浸提2次并过滤', '滤液浓缩后浓氨水调pH 10碱化', '分液漏斗先用乙醚萃出苦参碱', '水相改用氯仿萃出氧化苦参碱', '改良碘化铋钾与2%NaOH碱板TLC对照'],
      chemTests: [{ name: '改良碘化铋钾橘红色斑点', passed: true }, { name: '苦参碱与氧化苦参碱 Rf 显著分层', passed: true }, { name: '氧化苦参碱丙酮析晶白色粉末', passed: true }],
      demoBatches: [{ mass: 50, crude: 0.96, refined: 0.72, mp: 207.4 }, { mass: 50, crude: 1.04, refined: 0.78, mp: 208.1 }, { mass: 50, crude: 1.00, refined: 0.75, mp: 207.8 }]
    },
    epimedium: {
      id: 'epimedium', herb: '淫羊藿', isInnovative: true, compound: '淫羊藿苷（炮制增溶对照设计）', latin: 'Epimedium brevicornu Maxim.', category: '黄酮',
      defaultRig: 'ultrasound', defaultExtract: 'ultrasound', defaultSep: 'resin', formulas: ['diffusion', 'henderson', 'qc'],
      defaultCfg: { mass: 40, ratio: 12, temp: 55, time: 45, mesh: '剪碎粗粉(20目)', cycles: '2', solventType: '70%乙醇', ph: '中性 7.0' },
      limitVal: 0.50, limitUnit: '%', crudeUnit: 'g', mpRef: '231～234℃',
      origin: '小檗科植物淫羊藿干燥叶。补肾阳、强筋骨、祛风湿。',
      chemistry: '异戊烯基黄酮醇双糖苷（淫羊藿苷、朝藿定 C），亲脂性异戊烯基与亲水性糖基共存，70% 乙醇溶出最佳。',
      pharmacopoeia: '《中国药典》规定干燥淫羊藿含淫羊藿苷不得少于 0.50%。',
      integrative: '炮制化学本科创新实验：可设置“生淫羊藿 vs 羊脂油炙淫羊藿”平行超声提取组，直观对比炮制后表面脂质微乳化及糖链部分转化对淫羊藿苷/宝藿苷Ⅰ溶出率的影响，操作简便且学术深度高。',
      scaling: { auxName: 'D101大孔树脂', auxFactor: 0.35, auxUnit: 'g', yieldLow: 0.008, yieldHigh: 0.018, yieldUnit: 'g' },
      tlcSystem: '硅胶 H 板；乙酸乙酯-丁酮-甲酸-水 (10:1:1:1)；1% AlCl₃ 乙醇液 365 nm 显亮橙红色荧光。',
      tlcDefault: { front: 8.0, sample: 4.1, ref: 4.2 },
      steps: [
        { stage: '提取', title: '70% 乙醇超声提取（可设生品/炙品对照）', principle: '超声空化破除叶片蜡质层，较传统回流省时 60% 且防止糖苷水解。', qc: '提取 2 次，每次 45 min，滤过合并。' },
        { stage: '分离', title: '浓缩除叶绿素 + D101 大孔树脂富集', principle: '加适量纯水冷置滤除不溶性叶绿素，50% 乙醇洗脱富集淫羊藿总黄酮。', qc: '收集亮黄色洗脱液，无明显深绿叶绿素。' },
        { stage: '纯化', title: '稀乙醇重结晶得淡黄色针晶', principle: '淫羊藿苷在热 50% 乙醇中溶解、冷却后析出针状结晶。', qc: '减压抽滤，60℃ 烘干。' },
        { stage: '检识', title: '盐酸-镁粉、AlCl₃ 荧光与 270nm 紫外', principle: '黄酮醇苷遇盐酸-镁粉显紫红，AlCl₃ 络合后 365nm 显特征亮荧光。', qc: '|ΔRf| ≤ 0.03，平行对比生品与炙品斑点亮度。' }
      ],
      troubleshoot: [{ issue: '提取液发绿严重干扰结晶', cause: '叶片叶绿素在 70% 乙醇中大量溶出。', fix: '浓缩除醇后加水稀释冷藏静置 2 h，抽滤即可除尽大部分叶绿素。' }],
      sop: ['淫羊藿剪碎(可设羊脂油炙对照组)', '70%乙醇55℃超声提取2次', '浓缩除醇加水冷置滤除叶绿素', 'D101大孔树脂水洗除杂、50%醇洗脱结晶', 'AlCl₃荧光与TLC对照检识'],
      chemTests: [{ name: '盐酸-镁粉反应显紫红色', passed: true }, { name: 'AlCl₃ 乙醇液显强荧光', passed: true }, { name: 'TLC 365nm 亮橙红单斑对照', passed: true }],
      demoBatches: [{ mass: 40, crude: 0.56, refined: 0.34, mp: 231.8 }, { mass: 40, crude: 0.61, refined: 0.37, mp: 232.4 }, { mass: 40, crude: 0.58, refined: 0.35, mp: 232.0 }]
    },
    bupleurum: {
      id: 'bupleurum', herb: '柴胡', isInnovative: true, compound: '柴胡皂苷 a/d（保原生苷防异构）', latin: 'Bupleurum chinense DC.', category: '皂苷与三萜',
      defaultRig: 'ultrasound', defaultExtract: 'ultrasound', defaultSep: 'resin', formulas: ['henderson', 'diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 40, time: 45, mesh: '中粉(40目)', cycles: '2', solventType: '含5%氨水-70%乙醇', ph: '弱碱 8.5 (抑制异构转化)' },
      limitVal: 0.30, limitUnit: '%', crudeUnit: 'g', mpRef: '225～230℃',
      origin: '伞形科植物柴胡干燥根。疏散退热、疏肝解郁、升举阳气。',
      chemistry: '环氧醚齐墩果烷型五环三萜皂苷（柴胡皂苷 a、d 为原生苷，具 13,28-环氧醚键）；遇微酸或加热极易开环异构化为次生皂苷 b1、b2。',
      pharmacopoeia: '《中国药典》规定柴胡含柴胡皂苷 a 和 d 总量不得少于 0.30%，前处理明确要求加入氨试液防酸转化。',
      integrative: '结构稳定性经典本科设计：设立“普通纯乙醇回流 vs 含 5% 氨水低温超声”两组对照，用 TLC 直观观察原生苷 a/d 是否转化为异环双烯次生苷 b1/b2，深刻理解药典加氨提取的化学原理。',
      scaling: { auxName: '浓氨水/D101树脂', auxFactor: 0.35, auxUnit: 'mL', yieldLow: 0.004, yieldHigh: 0.009, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板；乙酸乙酯-乙醇-水 (8:2:1)；2% 对二甲氨基苯甲醛 40% 硫酸液 60℃ 显紫红斑。',
      tlcDefault: { front: 8.0, sample: 4.4, ref: 4.5 },
      steps: [
        { stage: '提取', title: '含 5% 浓氨水的 70% 乙醇低温超声提取', principle: '弱碱性介质中和药材自身有机酸，保护 13,28-环氧醚键免于开环异构。', qc: '温度 ≤ 45℃，全程禁止加酸。' },
        { stage: '分离', title: '减压浓缩除氨 + D101 大孔树脂富集', principle: '水洗除糖与多酚，30% 乙醇除杂，70% 乙醇洗脱总柴胡皂苷。', qc: '浓缩温度 ≤ 50℃，确保 pH 维持 7.5~8.5。' },
        { stage: '纯化', title: '水饱和正丁醇微萃浓缩干燥', principle: '进一步去除水溶性小分子杂质，得类白色柴胡总皂苷。', qc: '与“不加氨热回流对照组”同步制备。' },
        { stage: '检识', title: 'Ehrlich 试剂（对二甲氨基苯甲醛）与 TLC', principle: '原生皂苷 a/d 遇对二甲氨基苯甲醛-硫酸显特征紫红色，UV 254nm 下次生苷 b1/b2 显强异环双烯吸收。', qc: '原生苷组无明显次生苷杂斑，|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [{ issue: 'TLC 上原生苷 a/d 斑点变淡、254nm 出现强暗斑', cause: '提取时未加氨水或浓缩温度过高，发生异构化生成 b1/b2。', fix: '补加 5% 浓氨水并严格低温减压浓缩。' }],
      sop: ['柴胡中粉加入含5%浓氨水的70%乙醇', '40℃低温超声提取2次（另设热回流对照组）', '≤50℃减压浓缩并上D101大孔树脂柱', '水洗除杂后70%乙醇洗脱干燥', '对二甲氨基苯甲醛显色与TLC原生/次生对照'],
      chemTests: [{ name: '水振摇持久泡沫（五环三萜皂苷）', passed: true }, { name: '对二甲氨基苯甲醛-硫酸显紫红', passed: true }, { name: 'TLC 柴胡皂苷 a/d 斑点清晰无异构', passed: true }],
      demoBatches: [{ mass: 50, crude: 0.42, refined: 0.24, mp: 226.4 }, { mass: 50, crude: 0.46, refined: 0.27, mp: 227.0 }, { mass: 50, crude: 0.44, refined: 0.25, mp: 226.7 }]
    },
    astragalus: {
      id: 'astragalus', herb: '黄芪', isInnovative: true, compound: '黄芪多糖与黄芪甲苷（一材双提）', latin: 'Astragalus membranaceus (Fisch.) Bge.', category: '皂苷与三萜',
      defaultRig: 'reflux', defaultExtract: 'reflux', defaultSep: 'precip', formulas: ['diffusion', 'qc'],
      defaultCfg: { mass: 60, ratio: 10, temp: 90, time: 90, mesh: '斜片/粗粉(20目)', cycles: '2', solventType: '纯化水 / 75%乙醇醇沉', ph: '醇液碱化转化(10%NH₃)' },
      limitVal: 0.08, limitUnit: '%', crudeUnit: 'g', mpRef: '295～299℃(甲苷)',
      origin: '豆科植物蒙古黄芪干燥根。补气升阳、固表止汗，临床最常用补益中药之一。',
      chemistry: '同时含高含量水溶性黄芪多糖（APS，5%~10%）与四环三萜皂苷（黄芪甲苷为主，原生乙酰化皂苷经稀碱氨水脱乙酰后可转化为黄芪甲苷显著提高收率）。',
      pharmacopoeia: '《中国药典》规定干燥黄芪含黄芪甲苷不得少于 0.080%。',
      integrative: '一材双提零废料创新：水提浓缩后醇沉，沉淀即为黄芪粗多糖（Molish/苯酚-硫酸法测定），醇沉上清液经浓氨水洗涤脱乙酰+水饱和正丁醇萃取即得富集黄芪甲苷，一份药材同步完成两大类成分实验。',
      scaling: { auxName: '95%乙醇/正丁醇', auxFactor: 2.50, auxUnit: 'mL', yieldLow: 0.04, yieldHigh: 0.08, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板；三氯甲烷-甲醇-水 (13:7:2 下层)；10% 硫酸乙醇 105℃ 显棕褐色斑（365nm 显橙黄荧光）。',
      tlcDefault: { front: 8.0, sample: 3.4, ref: 3.5 },
      steps: [
        { stage: '提取', title: '纯化水加热回流提取 2 次', principle: '水提同步溶出黄芪多糖与极性皂苷群，绿色经济无毒。', qc: '合并水提液减压浓缩至药材量 1:1.5。' },
        { stage: '分离', title: '醇沉分级：沉淀收多糖、上清收皂苷', principle: '加 95% 乙醇使含醇量达 75%，多糖脱水沉淀，黄芪皂苷留于醇相。', qc: '4℃ 静置 12 h，抽滤分离沉淀与上清液。' },
        { stage: '纯化', title: '上清液正丁醇萃取 + 氨试液洗脱乙酰转化', principle: '氨水不仅除去酚酸色素，还可将乙酰化黄芪皂苷Ⅰ/Ⅱ脱乙酰转化为黄芪甲苷，收率翻倍。', qc: '氨水洗涤 2 次后蒸干正丁醇层。' },
        { stage: '检识', title: '多糖 Molish/苯酚-硫酸 + 甲苷 TLC 双检识', principle: '沉淀测多糖含量，皂苷部位做 L-B 反应及 365nm 橙黄荧光 TLC 对照。', qc: '两条产品线均检识阳性，|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [{ issue: '黄芪甲苷 TLC 斑点偏弱', cause: '未用氨试液洗涤转化乙酰基皂苷，导致甲苷含量偏低。', fix: '正丁醇萃取液务必用氨试液振摇洗涤 2 次。' }],
      sop: ['黄芪粗粉纯化水回流提取2次并浓缩', '加95%乙醇至75%含醇量4℃静置醇沉', '抽滤收集沉淀得黄芪多糖（Sevag精制）', '醇沉上清浓缩后正丁醇萃取并以氨水洗涤', '分别完成多糖定量与黄芪甲苷TLC检识'],
      chemTests: [{ name: '沉淀部位 Molish 紫环阳性（多糖）', passed: true }, { name: '皂苷部位 10%硫酸乙醇 365nm 橙黄荧光', passed: true }, { name: 'TLC 黄芪甲苷同位单斑', passed: true }],
      demoBatches: [{ mass: 60, crude: 3.85, refined: 0.072, mp: 296.5 }, { mass: 60, crude: 4.02, refined: 0.078, mp: 297.1 }, { mass: 60, crude: 3.94, refined: 0.075, mp: 296.8 }]
    },
    angelica_dahurica: {
      id: 'angelica_dahurica', herb: '白芷', isInnovative: true, compound: '欧前胡素与异欧前胡素（呋喃香豆素）', latin: 'Angelica dahurica (Fisch. ex Hoffm.) Benth. et Hook. f.', category: '香豆素与木脂素',
      defaultRig: 'column', defaultExtract: 'ultrasound', defaultSep: 'column', formulas: ['diffusion', 'henderson', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 45, time: 45, mesh: '中粉(40目)', cycles: '2', solventType: '80%乙醇', ph: '中性 7.0' },
      limitVal: 0.08, limitUnit: '%', crudeUnit: 'g', mpRef: '102℃(欧前胡素)',
      origin: '伞形科植物白芷干燥根。解表散寒、祛风止痛、通鼻窍。',
      chemistry: '典型线型呋喃香豆素（欧前胡素、异欧前胡素），具光敏性与特征 365nm 黄绿色荧光，硅胶柱层析下色带在紫外手电下肉眼可见。',
      pharmacopoeia: '《中国药典》规定干燥白芷含欧前胡素不得少于 0.080%。',
      integrative: '本科可视化柱层析教学明星课题：传统硅胶柱无色难跟踪，而白芷呋喃香豆素在 365nm 紫外灯照射柱身时呈现极其清晰的亮黄绿色荧光环带，学生可“肉眼看荧光收流分”，极大提升柱层析操作体验。',
      scaling: { auxName: '200-300目硅胶', auxFactor: 1.00, auxUnit: 'g', yieldLow: 0.0015, yieldHigh: 0.004, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板；石油醚(30~60℃)-乙醚 (3:2)；365 nm 紫外灯下显亮黄绿色双荧光斑。',
      tlcDefault: { front: 8.0, sample: 4.5, ref: 4.6 },
      steps: [
        { stage: '提取', title: '80% 乙醇超声提取总呋喃香豆素', principle: '快速溶出脂溶性欧前胡素与异欧前胡素，避开白芷大量淀粉。', qc: '提取 2 次，滤液减压浓缩至浸膏。' },
        { stage: '分离', title: '石油醚-乙酸乙酯梯度硅胶柱层析', principle: '以 365nm 紫外灯实时照射层析柱，肉眼跟踪亮黄绿色荧光带依次洗脱。', qc: '先收异欧前胡素，再收欧前胡素。' },
        { stage: '纯化', title: '石油醚-乙醇重结晶得白色结晶', principle: '低温析出高纯度欧前胡素，避光密闭保存。', qc: '减压过滤，干燥测熔点。' },
        { stage: '检识', title: '365nm 黄绿荧光、异羟肟酸铁与 TLC', principle: '呋喃香豆素内酯环呈异羟肟酸铁阳性，TLC 可清晰分辨欧前胡素与异欧前胡素。', qc: '365nm 黄绿双斑清晰，|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [{ issue: '提取液浑浊含淀粉', cause: '乙醇浓度低于 60% 或加热回流引起淀粉糊化。', fix: '采用 80% 以上乙醇常温超声提取。' }],
      sop: ['白芷中粉80%乙醇超声提取2次', '浓缩拌硅胶干法上样', '石油醚-乙酸乙酯梯度洗脱并365nm紫外跟带', '分别浓缩重结晶得欧前胡素', '异羟肟酸铁显色与365nm TLC对照'],
      chemTests: [{ name: '365nm 紫外灯下强黄绿色荧光', passed: true }, { name: '异羟肟酸铁内酯反应显红色', passed: true }, { name: 'TLC 欧前胡素/异欧前胡素双斑清晰', passed: true }],
      demoBatches: [{ mass: 50, crude: 0.22, refined: 0.095, mp: 101.6 }, { mass: 50, crude: 0.25, refined: 0.108, mp: 102.2 }, { mass: 50, crude: 0.23, refined: 0.101, mp: 101.9 }]
    },
    paeonia_lactiflora: {
      id: 'paeonia_lactiflora', herb: '白芍', isInnovative: true, compound: '芍药苷（单萜苷 · 树脂纯化）', latin: 'Paeonia lactiflora Pall.', category: '萜类内酯与环烯醚萜',
      defaultRig: 'reflux', defaultExtract: 'reflux', defaultSep: 'resin', formulas: ['diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 75, time: 60, mesh: '中粉(40目)', cycles: '2', solventType: '70%乙醇', ph: '中性 7.0' },
      limitVal: 1.60, limitUnit: '%', crudeUnit: 'g', mpRef: '196℃(无定形粉)',
      origin: '毛茛科植物芍药干燥根。养血调经、敛阴止汗、柔肝止痛。',
      chemistry: '蒎烷单萜苷（芍药苷），易溶于水与乙醇，对强酸强碱敏感，是“白芍总苷”（抗类风湿关节炎中药新药）的核心活性成分。',
      pharmacopoeia: '《中国药典》规定干燥白芍含芍药苷不得少于 1.6%。',
      integrative: '院校成熟易行且贴合临床新药：70% 乙醇提取 + D101 大孔树脂水洗除没食子酸/鞣质与糖类，30%~40% 乙醇一步富集白芍总苷，还可设计生白芍 vs 酒白芍/醋白芍提取率对照实验。',
      scaling: { auxName: 'D101大孔树脂', auxFactor: 0.40, auxUnit: 'g', yieldLow: 0.020, yieldHigh: 0.038, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板；三氯甲烷-乙酸乙酯-甲醇-甲酸 (40:5:10:0.2)；5% 香草醛-硫酸 105℃ 显蓝紫色斑。',
      tlcDefault: { front: 8.0, sample: 3.7, ref: 3.8 },
      steps: [
        { stage: '提取', title: '70% 乙醇加热回流提取 2 次', principle: '抑制大量淀粉溶出，高效提取水醇双溶的芍药苷。', qc: '回流 2 次，每次 1 h，趁热过滤。' },
        { stage: '分离', title: '浓缩除醇 + D101 大孔树脂梯度纯化', principle: '纯水与 10% 乙醇洗除游离糖及没食子酸，40% 乙醇集中洗脱芍药苷。', qc: '用 FeCl₃ 检测水洗液至无鞣质蓝黑反应。' },
        { stage: '纯化', title: '少量活性炭脱色 + 低温干燥得白色总苷', principle: '脱除微量棕色酚类，减压蒸干得疏松类白色白芍总苷粉末。', qc: '干燥温度 ≤ 60℃。' },
        { stage: '检识', title: '香草醛-硫酸显蓝紫、Molish 与 TLC', principle: '单萜苷遇香草醛-浓硫酸呈现极特征的蓝紫色斑点。', qc: 'TLC 蓝紫主斑与芍药苷对照品一致，|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [{ issue: '浓缩液泛棕红色', cause: '白芍含没食子酸与鞣质氧化。', fix: '树脂上柱后充分水洗并加 0.5% 活性炭短时脱色。' }],
      sop: ['白芍中粉70%乙醇回流提取2次', '减压浓缩回收乙醇加水稀释', 'D101大孔树脂水洗至无鞣质，40%醇洗脱', '活性炭微脱色并低温浓缩干燥', '香草醛-硫酸显蓝紫与TLC对照'],
      chemTests: [{ name: 'Molish 反应界面显紫环（苷类）', passed: true }, { name: '香草醛-硫酸加热显特征蓝紫色', passed: true }, { name: 'TLC 芍药苷对照品同位单斑', passed: true }],
      demoBatches: [{ mass: 50, crude: 1.52, refined: 1.08, mp: 0 }, { mass: 50, crude: 1.64, refined: 1.16, mp: 0 }, { mass: 50, crude: 1.58, refined: 1.12, mp: 0 }]
    },
    prunella: {
      id: 'prunella', herb: '夏枯草', isInnovative: true, compound: '迷迭香酸与熊果酸（极性双组分分离）', latin: 'Prunella vulgaris L.', category: '苯丙素与有机酸',
      defaultRig: 'extract', defaultExtract: 'reflux', defaultSep: 'extract', formulas: ['henderson', 'diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: 75, time: 60, mesh: '果穗粗粉(20目)', cycles: '2', solventType: '70%乙醇', ph: '碱溶8 / 酸析2' },
      limitVal: 0.20, limitUnit: '%', crudeUnit: 'g', mpRef: '285℃(熊果酸)',
      origin: '唇形科植物夏枯草干燥果穗。清肝泻火、明目、散结消肿，药食同源凉茶核心原料。',
      chemistry: '同时含极性迥异的两大活性成分：水溶性酚酸（迷迭香酸，具邻二酚羟基强抗氧化）与强脂溶性五环三萜酸（熊果酸/齐墩果酸）。',
      pharmacopoeia: '《中国药典》规定干燥夏枯草含迷迭香酸不得少于 0.20%。',
      integrative: '本科极性梯度双组分设计典范：一次 70% 乙醇提取后，浓缩加水，以石油醚/乙酸乙酯分配结合 pH 调节，同时获得脂溶性熊果酸与水溶性迷迭香酸，完美串联第4章苯丙素与第7章三萜两大章节知识。',
      scaling: { auxName: '乙酸乙酯/稀盐酸', auxFactor: 0.50, auxUnit: 'mL', yieldLow: 0.005, yieldHigh: 0.012, yieldUnit: 'g' },
      tlcSystem: '迷迭香酸：甲苯-乙酸乙酯-甲酸 (5:4:1)，FeCl₃显蓝黑；熊果酸：环己烷-氯仿-乙酸乙酯-甲酸 (20:5:8:0.1)，10%硫酸显紫红。',
      tlcDefault: { front: 8.0, sample: 4.1, ref: 4.2 },
      steps: [
        { stage: '提取', title: '70% 乙醇加热回流同步提取', principle: '70% 乙醇兼顾酚酸（迷迭香酸）与游离五环三萜（熊果酸）同步溶出。', qc: '回流 2 次，过滤浓缩至浸膏。' },
        { stage: '分离', title: '水分散 → 氯仿/乙酸乙酯分步液液萃取', principle: '中性水相先用氯仿萃取脂溶性熊果酸，再将水相调 pH 2~3 用乙酸乙酯萃取迷迭香酸。', qc: '分液漏斗清晰分离两股有效部位。' },
        { stage: '纯化', title: '无水乙醇重结晶（熊果酸）与浓缩干燥（酚酸）', principle: '熊果酸熔点高、易在无水乙醇中析出白色针晶；迷迭香酸低温避光干燥。', qc: '分别称重计算双组分收率。' },
        { stage: '检识', title: 'FeCl₃ 酚酸显色、L-B 三萜显色与双 TLC', principle: 'FeCl₃ 确证迷迭香酸，Liebermann-Burchard 显紫红确证熊果酸。', qc: '双体系 TLC 均见清晰特征主斑。' }
      ],
      troubleshoot: [{ issue: '迷迭香酸未进入乙酸乙酯相', cause: '水相未调至酸性，迷迭香酸呈离子态留在水中。', fix: '依据 Henderson-Hasselbalch 方程，务必先调水相至 pH 2~3 再萃取。' }],
      sop: ['夏枯草果穗70%乙醇回流提取2次', '浓缩加水分散，先以氯仿萃出脂溶性熊果酸', '水相调pH 2~3改用乙酸乙酯萃出迷迭香酸', '两相分别浓缩精制并称重核算双收率', 'FeCl₃与L-B双显色及TLC对照检识'],
      chemTests: [{ name: '乙酸乙酯相 FeCl₃ 显深蓝黑色（酚酸）', passed: true }, { name: '氯仿相 L-B 反应显紫红色（三萜）', passed: true }, { name: '双组分 TLC 特征斑点均阳性', passed: true }],
      demoBatches: [{ mass: 50, crude: 0.48, refined: 0.24, mp: 284.5 }, { mass: 50, crude: 0.52, refined: 0.27, mp: 285.2 }, { mass: 50, crude: 0.50, refined: 0.25, mp: 284.8 }]
    }
  };

  const CATALOG_45 = [
    { id: 'mint', isClassGroup: true, featured: true, herb: '薄荷', compound: '薄荷挥发油、薄荷脑', category: '挥发油与萜类', featured: true },
    { id: 'clove', isInnovative: true, featured: true, herb: '丁香', compound: '丁香酚', category: '挥发油与萜类' },
    { id: 'angelica', herb: '当归', compound: '藁本内酯', category: '挥发油与萜类' },
    { id: 'patchouli', herb: '广藿香', compound: '百秋李醇', category: '挥发油与萜类' },
    { id: 'curcuma', herb: '莪术', compound: '莪术醇', category: '挥发油与萜类' },
    { id: 'cinnamon', herb: '肉桂', compound: '桂皮醛', category: '挥发油与萜类' },
    { id: 'artemisia', herb: '青蒿', compound: '青蒿素', category: '萜类内酯与环烯醚萜', featured: true },
    { id: 'gardenia', isInnovative: true, featured: true, herb: '栀子', compound: '栀子苷', category: '萜类内酯与环烯醚萜' },
    { id: 'andrographis', isClassGroup: true, featured: true, herb: '穿心莲', compound: '穿心莲内酯', category: '萜类内酯与环烯醚萜' },
    { id: 'ginkgo', herb: '银杏叶', compound: '银杏内酯', category: '萜类内酯与环烯醚萜' },
    { id: 'gentiana', herb: '龙胆', compound: '龙胆苦苷', category: '萜类内酯与环烯醚萜' },
    { id: 'phellodendron', herb: '关黄柏', compound: '盐酸小檗碱', category: '生物碱', featured: true },
    { id: 'coptis', isClassGroup: true, featured: true, herb: '黄连', compound: '小檗碱', category: '生物碱' },
    { id: 'sophora_flavescens', isInnovative: true, featured: true, herb: '苦参', compound: '苦参碱', category: '生物碱' },
    { id: 'ephedra', herb: '麻黄', compound: '麻黄碱', category: '生物碱' },
    { id: 'corydalis', isInnovative: true, featured: true, herb: '延胡索', compound: '延胡索乙素', category: '生物碱' },
    { id: 'stephania', herb: '防己', compound: '粉防己碱', category: '生物碱' },
    { id: 'datura', herb: '洋金花', compound: '东莨菪碱', category: '生物碱' },
    { id: 'evodia', herb: '吴茱萸', compound: '吴茱萸碱', category: '生物碱' },
    { id: 'sinomenium', herb: '青风藤', compound: '青藤碱', category: '生物碱' },
    { id: 'scutellaria', isClassGroup: true, featured: true, herb: '黄芩', compound: '黄芩苷', category: '黄酮', featured: true },
    { id: 'sophora', isClassGroup: true, featured: true, herb: '槐米', compound: '芦丁', category: '黄酮', featured: true },
    { id: 'pueraria', isClassGroup: true, featured: true, herb: '葛根', compound: '葛根素', category: '黄酮' },
    { id: 'citrus', isInnovative: true, featured: true, herb: '陈皮', compound: '橙皮苷', category: '黄酮' },
    { id: 'epimedium', isInnovative: true, featured: true, herb: '淫羊藿', compound: '淫羊藿苷', category: '黄酮' },
    { id: 'carthamus', isInnovative: true, featured: true, herb: '红花', compound: '羟基红花黄色素A', category: '黄酮' },
    { id: 'crataegus', herb: '山楂叶', compound: '牡荆素鼠李糖苷', category: '黄酮' },
    { id: 'rheum', herb: '大黄', compound: '大黄酸/大黄素', category: '蒽醌与醌类', featured: true },
    { id: 'salvia', isClassGroup: true, featured: true, herb: '丹参', compound: '丹参酮ⅡA', category: '蒽醌与醌类' },
    { id: 'cassia', isClassGroup: true, featured: true, herb: '决明子', compound: '橙黄决明素', category: '蒽醌与醌类' },
    { id: 'polygonum', isClassGroup: true, featured: true, herb: '虎杖', compound: '大黄素/白藜芦醇', category: '蒽醌与醌类' },
    { id: 'fraxinus', isInnovative: true, featured: true, herb: '秦皮', compound: '秦皮甲素', category: '香豆素与木脂素' },
    { id: 'cnidium', isInnovative: true, featured: true, herb: '蛇床子', compound: '蛇床子素', category: '香豆素与木脂素' },
    { id: 'schisandra', isInnovative: true, featured: true, herb: '五味子', compound: '五味子醇甲', category: '香豆素与木脂素' },
    { id: 'forsythia', isClassGroup: true, featured: true, herb: '连翘', compound: '连翘苷', category: '香豆素与木脂素' },
    { id: 'magnolia', isInnovative: true, featured: true, herb: '厚朴', compound: '厚朴酚', category: '香豆素与木脂素' },
    { id: 'glycyrrhiza', isClassGroup: true, featured: true, herb: '甘草', compound: '甘草酸', category: '皂苷与三萜' },
    { id: 'panax', isClassGroup: true, featured: true, herb: '人参', compound: '人参皂苷Rg1', category: '皂苷与三萜' },
    { id: 'notoginseng', isInnovative: true, featured: true, herb: '三七', compound: '三七总皂苷', category: '皂苷与三萜' },
    { id: 'bupleurum', isInnovative: true, featured: true, herb: '柴胡', compound: '柴胡皂苷a/d', category: '皂苷与三萜' },
    { id: 'astragalus', isInnovative: true, featured: true, herb: '黄芪', compound: '黄芪甲苷', category: '皂苷与三萜' },
    { id: 'platycodon', herb: '桔梗', compound: '桔梗皂苷D', category: '皂苷与三萜' },
    { id: 'poria', herb: '茯苓', compound: '茯苓酸', category: '皂苷与三萜' },
    { id: 'lycium', isInnovative: true, featured: true, herb: '枸杞子', compound: '枸杞多糖', category: '多糖类' },
    { id: 'astragalus_poly', herb: '黄芪(多糖)', compound: '黄芪多糖', category: '多糖类' },
    { id: 'ginkgo_flav', herb: '银杏叶(黄酮)', compound: '银杏总黄酮', category: '黄酮', featured: true, isClassGroup: true },
    { id: 'senna', herb: '番泻叶', compound: '番泻苷A/B', category: '蒽醌与醌类', featured: true, isClassGroup: true },
    { id: 'sedum', herb: '垂盆草', compound: '垂盆草苷', category: '氰苷类', featured: true, isClassGroup: true },
    { id: 'lonicera', herb: '金银花', compound: '绿原酸', category: '苯丙素与有机酸', featured: true, isClassGroup: true },
    { id: 'phellodendron_flav', herb: '黄柏(黄酮项)', compound: '黄柏黄酮类', category: '黄酮', featured: true, isClassGroup: true },
    { id: 'armeniaca', herb: '苦杏仁', compound: '苦杏仁苷', category: '氰苷类', featured: true, isClassGroup: true },
    { id: 'panax_quinquefolius', herb: '西洋参', compound: '西洋参皂苷', category: '皂苷与三萜', featured: true, isClassGroup: true },
    { id: 'paeonia_moutan', herb: '牡丹皮', compound: '丹皮酚（β-CD包合）', category: '挥发油与萜类', featured: true, isInnovative: true },
    { id: 'tea_caffeine', herb: '绿茶', compound: '咖啡因（升华纯化）', category: '生物碱', featured: true, isInnovative: true },
    { id: 'curcuma_longa', herb: '姜黄', compound: '姜黄素（NADES提取）', category: '苯丙素与有机酸', featured: true, isInnovative: true },
    { id: 'star_anise', herb: '八角茴香', compound: '莽草酸（达菲前体）', category: '苯丙素与有机酸', featured: true, isInnovative: true },
    { id: 'psoralea', herb: '补骨脂', compound: '补骨脂素/异补骨脂素', category: '香豆素与木脂素' },
    { id: 'gastrodia', herb: '天麻', compound: '天麻素', category: '苯丙素与有机酸' },
    { id: 'rhodiola', herb: '红景天', compound: '红景天苷', category: '苯丙素与有机酸' },
    { id: 'ligusticum', herb: '川芎', compound: '川芎嗪/阿魏酸', category: '生物碱' },
    { id: 'huperzia', herb: '千层塔', compound: '石杉碱甲', category: '生物碱' },
    { id: 'rabdosia', herb: '冬凌草', compound: '冬凌草甲素', category: '萜类内酯与环烯醚萜' },
    { id: 'morus_leaf', herb: '桑叶', compound: '1-脱氧野尻霉素(DNJ)', category: '生物碱' },
    { id: 'ganoderma', herb: '灵芝', compound: '灵芝三萜/灵芝酸A', category: '皂苷与三萜' },
    { id: 'dendrobium', herb: '铁皮石斛', compound: '石斛多糖', category: '多糖类' },
    { id: 'atractylodes', herb: '白术', compound: '白术内酯Ⅰ/Ⅲ', category: '挥发油与萜类' },
    { id: 'salvia_acid', herb: '丹参(水溶项)', compound: '丹酚酸B', category: '苯丙素与有机酸' },
    { id: 'taxus', herb: '红豆杉', compound: '紫杉醇', category: '萜类内酯与环烯醚萜' },
    { id: 'pueraria_iso', herb: '大豆/淡豆豉', compound: '大豆苷元/染料木素', category: '黄酮' },
    { id: 'artemisia_argyi', herb: '艾叶', compound: '桉油精/异泽兰黄素', category: '挥发油与萜类' },
    { id: 'prunella', isInnovative: true, featured: true, herb: '夏枯草', compound: '迷迭香酸/熊果酸', category: '苯丙素与有机酸' },
    { id: 'eucommia', herb: '杜仲', compound: '松脂醇二葡萄糖苷', category: '香豆素与木脂素' },
    { id: 'paeonia_lactiflora', isInnovative: true, featured: true, herb: '白芍', compound: '芍药苷', category: '萜类内酯与环烯醚萜' },
    { id: 'angelica_dahurica', isInnovative: true, featured: true, herb: '白芷', compound: '欧前胡素/异欧前胡素', category: '香豆素与木脂素' },
    { id: 'periploca', herb: '香加皮', compound: '杠柳毒苷（甲型强心苷）', category: '甾体与强心苷', featured: true, isInnovative: true },
    { id: 'anemarrhena', herb: '知母', compound: '知母皂苷BⅡ/菝葜皂苷元', category: '甾体与强心苷', featured: true, isInnovative: true },
    { id: 'dioscorea', herb: '穿山龙', compound: '薯蓣皂苷元（甾体激素前体）', category: '甾体与强心苷' },
    { id: 'ophiopogon', herb: '麦冬', compound: '麦冬皂苷D（甾体皂苷）', category: '甾体与强心苷' },
    { id: 'venenum_bufonis', herb: '蟾酥', compound: '华蟾酥毒基（乙型强心苷）', category: '甾体与强心苷' }
  ];

  // ============ 合并扩展模块 TCM_EXTRA_DATA（9套装置/91项题库/50篇文献/20项院校药企案例） ============
  const EXTRA_DATA = window.TCM_EXTRA_DATA || {};
  if (EXTRA_DATA.EXTRA_RIGS) {
    Object.assign(LAB_RIGS, EXTRA_DATA.EXTRA_RIGS);
  }
  if (EXTRA_DATA.RIG_ENHANCEMENTS) {
    Object.entries(EXTRA_DATA.RIG_ENHANCEMENTS).forEach(([k, enh]) => {
      if (LAB_RIGS[k]) {
        Object.assign(LAB_RIGS[k], enh);
      }
    });
  }
  if (EXTRA_DATA.EXTRA_PRESETS) {
    Object.entries(EXTRA_DATA.EXTRA_PRESETS).forEach(([k, preset]) => {
      FEATURED_PRESETS[k] = preset;
      if (!CATALOG_45.some(c => c.id === k)) {
        CATALOG_45.push({
          id: preset.id,
          isInnovative: !!preset.isInnovative,
          isClassGroup: !!preset.isClassGroup,
          featured: true,
          herb: preset.herb,
          compound: preset.compound,
          category: preset.category,
          sourceTag: preset.sourceTag || ''
        });
      }
    });
  }
  if (Array.isArray(EXTRA_DATA.EXTRA_LITERATURE)) {
    EXTRA_DATA.EXTRA_LITERATURE.forEach(item => {
      if (!GLOBAL_LITERATURE.some(x => x.text === item.text)) GLOBAL_LITERATURE.push(item);
    });
  }
  if (Array.isArray(EXTRA_DATA.EXTRA_UNIV_CASES)) {
    UNIV_CASES.forEach(u => { if (!u.type) u.type = /药检|中科院|药植所/.test(u.univ) ? '国家平台' : '高校实验'; });
    EXTRA_DATA.EXTRA_UNIV_CASES.forEach(item => {
      if (!UNIV_CASES.some(x => x.title === item.title)) UNIV_CASES.push(item);
    });
  }

  // ============ 合并 v3.0 旗舰扩展数据（11套装置 / 100+题库 / 62篇文献 / 26项院校药企案例） ============
  const V3_DATA = window.TCM_V3_DATA || {};
  if (V3_DATA.V3_RIGS) {
    Object.assign(LAB_RIGS, V3_DATA.V3_RIGS);
  }
  if (V3_DATA.V3_PRESETS) {
    Object.entries(V3_DATA.V3_PRESETS).forEach(([k, preset]) => {
      FEATURED_PRESETS[k] = preset;
      if (!CATALOG_45.some(c => c.id === k)) {
        CATALOG_45.push({
          id: preset.id,
          isInnovative: !!preset.isInnovative,
          isClassGroup: !!preset.isClassGroup,
          featured: true,
          herb: preset.herb,
          compound: preset.compound,
          category: preset.category,
          sourceTag: preset.sourceTag || ''
        });
      }
    });
  }
  if (Array.isArray(V3_DATA.V3_LITERATURE)) {
    V3_DATA.V3_LITERATURE.forEach(item => {
      if (!GLOBAL_LITERATURE.some(x => x.text === item.text)) GLOBAL_LITERATURE.push(item);
    });
  }
  if (Array.isArray(V3_DATA.V3_UNIV_CASES)) {
    V3_DATA.V3_UNIV_CASES.forEach(item => {
      if (!UNIV_CASES.some(x => x.title === item.title)) UNIV_CASES.push(item);
    });
  }

  // ============ 合并 v4.0 & v5.0 扩展数据（13套装置 / 110+题库 / 74篇文献 / 32项院校药企案例） ============
  const V4_DATA = window.TCM_V4_SPECTRO || {};
  const V5_DATA = window.TCM_V5_ENCYCLOPEDIA || {};
  if (V4_DATA.V4_RIGS) {
    Object.assign(LAB_RIGS, V4_DATA.V4_RIGS);
  }
  if (window.TCM_V10_SANDBOX && window.TCM_V10_SANDBOX.V10_EXTRA_RIGS) {
    Object.assign(LAB_RIGS, window.TCM_V10_SANDBOX.V10_EXTRA_RIGS);
  }
  if (V5_DATA.V5_PRESETS) {
    Object.entries(V5_DATA.V5_PRESETS).forEach(([k, preset]) => {
      FEATURED_PRESETS[k] = preset;
      if (!CATALOG_45.some(c => c.id === k)) {
        CATALOG_45.push({
          id: preset.id,
          isInnovative: !!preset.isInnovative,
          isClassGroup: !!preset.isClassGroup,
          featured: true,
          herb: preset.herb,
          compound: preset.compound,
          category: preset.category,
          sourceTag: preset.sourceTag || ''
        });
      }
    });
  }
  if (Array.isArray(V5_DATA.V5_LITERATURE)) {
    V5_DATA.V5_LITERATURE.forEach(item => {
      if (!GLOBAL_LITERATURE.some(x => x.text === item.text)) GLOBAL_LITERATURE.push(item);
    });
  }
  if (Array.isArray(V5_DATA.V5_UNIV_CASES)) {
    V5_DATA.V5_UNIV_CASES.forEach(item => {
      if (!UNIV_CASES.some(x => x.title === item.title)) UNIV_CASES.push(item);
    });
  }
  // ============ 合并 v9.0 扩充题库、规范文献与高校案例 ============
  const V9_DATA = window.TCM_V9_DATA || {};
  if (V9_DATA.V9_PRESETS) {
    Object.entries(V9_DATA.V9_PRESETS).forEach(([k, preset]) => {
      FEATURED_PRESETS[k] = preset;
      if (!CATALOG_45.some(c => c.id === k)) {
        CATALOG_45.push({
          id: preset.id,
          isInnovative: !!preset.isInnovative,
          isClassGroup: !!preset.isClassGroup,
          featured: true,
          herb: preset.herb,
          compound: preset.compound,
          category: preset.category,
          sourceTag: preset.sourceTag || ''
        });
      }
    });
  }
  if (Array.isArray(V9_DATA.V9_LITERATURE)) {
    V9_DATA.V9_LITERATURE.forEach(item => {
      if (!GLOBAL_LITERATURE.some(x => x.text === item.text)) GLOBAL_LITERATURE.push(item);
    });
  }

  if (window.TCM_V14_COURSE && window.TCM_V14_COURSE.V14_COURSE_PRESETS) {
    Object.entries(window.TCM_V14_COURSE.V14_COURSE_PRESETS).forEach(([k, preset]) => {
      FEATURED_PRESETS[k] = preset;
      if (!CATALOG_45.some(c => c.id === k)) {
        CATALOG_45.unshift({
          id: preset.id,
          isInnovative: !!preset.isInnovative,
          isClassGroup: !!preset.isClassGroup,
          featured: true,
          herb: preset.herb,
          compound: preset.compound,
          category: preset.category,
          sourceTag: preset.sourceTag || ''
        });
      }
    });
  }

  if (Array.isArray(V9_DATA.V9_UNIV_CASES)) {
    V9_DATA.V9_UNIV_CASES.forEach(item => {
      if (!UNIV_CASES.some(x => x.title === item.title)) UNIV_CASES.push(item);
    });
  }


  // 精准短词 B站链接生成器（1~2 词高命中，解决检索词过多导致视频偏题问题）
  function biliUrl(kw) {
    const clean = String(kw || '中药化学实验').replace(/[（）()\[\]【】、,，。；;：:]/g, ' ').replace(/\s+/g, ' ').trim();
    const parts = clean.split(' ').filter(Boolean).slice(0, 2);
    return `https://search.bilibili.com/all?keyword=${encodeURIComponent(parts.join(' '))}`;
  }
  function getTopicShortBiliKw(t) {
    const herb = String(t?.herb || '中药').replace(/（.*?）|\(.*?\)/g, '').trim();
    const comp = String(t?.compound || '').replace(/（.*?）|\(.*?\)/g, '').split(/[、/+]/)[0].trim();
    return comp ? `${herb} ${comp}` : herb;
  }

  // 根据选材与当前实验设计，智能推导本课题适用的 2~3 套装置（解决 Step 4 全平铺杂乱问题）
  function getApplicableRigs(t, ws) {
    const out = [];
    const add = (key, roleLabel) => {
      const k = canonicalRigKey(key, '');
      if (k && LAB_RIGS[k] && !out.some(x => x.key === k)) out.push({ key: k, roleLabel });
    };
    const isDiy = ws && ws.schemeMode === 'diy';
    if (isDiy) {
      const extObj = DIY_EXTRACT_LIST.find(x => x.id === ws.diyExtract);
      if (extObj) add(extObj.rig, '① 提取适用');
      const sepRigMap = { freeze: 'filter', acid_precip: 'filter', salting_out: 'filter', resin: 'resin', extract: 'extract', column: 'column', precip: 'filter' };
      const sepRig = sepRigMap[ws.diySeparate] || 'filter';
      add(sepRig, '② 分离纯化适用');
      if (ws.diyExtract !== 'steam' && sepRig !== 'rotavap') add('rotavap', '③ 浓缩回收适用');
      return out.length ? out : [{ key: canonicalRigKey(t.defaultRig), roleLabel: '① 核心适用' }];
    }
    if (Array.isArray(t.applicableRigs) && t.applicableRigs.length) {
      const roles = ['① 提取/核心适用', '② 分离/浓缩适用', '③ 纯化/收尾适用', '④ 辅助适用'];
      t.applicableRigs.forEach((rk, i) => add(rk, roles[i] || '适用装置'));
      return out;
    }
    const mainRig = canonicalRigKey(t.defaultRig, 'reflux');
    add(mainRig, '① 提取适用');
    const sepMap = { freeze: 'filter', acid_precip: 'filter', salting_out: 'filter', resin: 'resin', extract: 'extract', column: 'column', precip: 'filter' };
    if (t.defaultSep && sepMap[t.defaultSep] && sepMap[t.defaultSep] !== mainRig) {
      add(sepMap[t.defaultSep], '② 分离纯化适用');
    }
    if (mainRig !== 'steam' && mainRig !== 'filter' && out.length < 3) {
      add('rotavap', out.length === 1 ? '② 浓缩回收适用' : '③ 浓缩回收适用');
    } else if (mainRig === 'steam' && !out.some(x => x.key === 'filter')) {
      add('filter', '② 析晶抽滤适用');
    }
    return out;
  }

  // 为任意大流程步骤生成可操作小分支（优先用 AI/预设自定义，否则零消耗匹配内置小分支模板）
  function getStepSubBranches(t, ws, stepObj, idx) {
    if (Array.isArray(stepObj?.subBranches) && stepObj.subBranches.length) {
      return stepObj.subBranches.slice(0, 4);
    }
    const sb = EXTRA_DATA.STAGE_SUBBRANCHES || {};
    const stageStr = String(stepObj?.stage || '');
    if (idx === 0 || /提取/.test(stageStr)) {
      const extKey = (ws?.schemeMode === 'diy' ? ws.diyExtract : t.defaultExtract) || 'reflux';
      return (sb.extract && sb.extract[extKey]) || (sb.extract && sb.extract.reflux) || [];
    }
    if (idx === 1 || /分离/.test(stageStr)) {
      const sepKey = (ws?.schemeMode === 'diy' ? ws.diySeparate : t.defaultSep) || 'resin';
      return (sb.separate && sb.separate[sepKey]) || (sb.separate && sb.separate.resin) || [];
    }
    if (/纯化|精制/.test(stageStr)) {
      return sb.purify || [];
    }
    if (/检识|鉴定|分析/.test(stageStr)) {
      return sb.detect || [];
    }
    return sb.purify || [];
  }

  function hydrateTopic(entry) {
    if (Object.prototype.hasOwnProperty.call(FEATURED_PRESETS, entry.id)) return JSON.parse(JSON.stringify(FEATURED_PRESETS[entry.id]));
    const isVol = entry.category === '挥发油与萜类' || entry.prop === 'volatile';
    const isSens = entry.prop === 'thermo_sensitive';
    const lim = Number(entry.limitVal) || 1.0;
    return {
      id: entry.id, herb: entry.herb, compound: entry.compound, latin: entry.latin || '《中国药典》或创新自定义基原',
      category: entry.category, isCustom: !!entry.isCustom,
      defaultRig: isVol ? 'steam' : entry.category === '生物碱' || entry.category === '蒽醌与醌类' ? 'extract' : entry.category === '多糖类' || isSens ? 'ultrasound' : entry.category === '香豆素与木脂素' ? 'column' : 'reflux',
      defaultExtract: isVol ? 'steam' : entry.category === '生物碱' ? 'acid_water' : entry.category === '多糖类' || isSens ? 'ultrasound' : 'reflux',
      defaultSep: isVol ? 'freeze' : entry.category === '生物碱' || entry.category === '蒽醌与醌类' ? 'extract' : entry.category === '多糖类' ? 'precip' : 'resin',
      formulas: isVol ? ['distill', 'diffusion', 'qc'] : ['henderson', 'diffusion', 'qc'],
      defaultCfg: { mass: 50, ratio: 10, temp: isSens ? 40 : 80, time: 60, mesh: '中粉(40目)', cycles: '2', solventType: isVol ? '纯化水' : '70%乙醇', ph: '中性 7.0' },
      limitVal: lim, limitUnit: '%', crudeUnit: 'g', mpRef: '按标准品实测核对',
      origin: entry.origin || `${entry.herb}为《中药化学》“${entry.category}”教学与创新研究药材。`,
      chemistry: `核心指标成分为 ${entry.compound}，可结合右侧文献库与左侧 DIY 参数自由微调工艺。`,
      pharmacopoeia: `参考限度 ≥ ${lim}%。`,
      integrative: `中西医结合延伸：${entry.innovationTag || `可围绕 ${entry.compound} 的现代药理靶点、生物利用度提升（纳米脂质体/低共熔溶剂）或与临床西药协同增效开展拓展研究。`}`,
      scaling: { auxName: '分离纯化辅料', auxFactor: 0.25, auxUnit: 'g', yieldLow: lim / 100 * 0.85, yieldHigh: lim / 100 * 1.4, yieldUnit: 'g' },
      tlcSystem: `硅胶 G 板，按《中国药典》${entry.herb}项下展开剂同板对照。`,
      tlcDefault: { front: 8.0, sample: 4.0, ref: 4.1 },
      steps: [
        { stage: '提取', title: `${entry.herb}提取`, principle: '依菲克扩散定律与相似相溶原理强化传质。', qc: '按左侧配置单控温控时。' },
        { stage: '纯化', title: '富集除杂与精制', principle: '利用极性、酸碱性或溶解度差纯化。', qc: '分步监测 pH 或洗脱流分。' },
        { stage: '检识', title: '显色与 TLC 对照', principle: '理化特征显色结合薄层 Rf 比对。', qc: '|ΔRf| ≤ 0.03。' }
      ],
      troubleshoot: [{ issue: '收率偏低', cause: '粒度粗或料液比偏小。', fix: '左侧配置单调细粒度或增加提取次数。' }],
      sop: [`称取${entry.herb}并配制溶剂`, '搭建实验装置并查安全', '执行提取与分离纯化', '测收率与 RSD', '完成理化与 TLC 检识'],
      chemTests: [{ name: `${entry.category}特征显色`, passed: true }, { name: '外观性状检查', passed: true }, { name: 'TLC 同位置单斑', passed: true }],
      demoBatches: [{ mass: 50, crude: Number((50 * lim / 100 * 1.15).toFixed(2)), refined: Number((50 * lim / 100 * 0.9).toFixed(2)), mp: 182.0 }, { mass: 50, crude: Number((50 * lim / 100 * 1.2).toFixed(2)), refined: Number((50 * lim / 100 * 0.95).toFixed(2)), mp: 182.4 }, { mass: 50, crude: Number((50 * lim / 100 * 1.18).toFixed(2)), refined: Number((50 * lim / 100 * 0.92).toFixed(2)), mp: 182.1 }]
    };
  }

  function createDefaultState() {
    return {
      step: 1, lastWorkStep: 1, hubRig: 'steam', hubCat: '全部', univFilter: '全部', rTab: 'bank', litFilter: '全部', activeTopicId: 'mint', sideQuery: '', sideCat: '全部', step1Tab: 'innovative', step1Query: '', step1Cat: '全部', theoryView: 'plain', drawerWide: false,
      customTopics: {}, topicStates: {}, extraGlobalRefs: [],
      meta: {
        className: '药学 / 中药学专业', groupName: '实验设计组', date: new Date().toISOString().slice(0, 10), teacher: '',
        members: [{ role: '组长', name: '', studentId: '', duty: '方案设计与报告统筹' }, { role: '提取分离', name: '', studentId: '', duty: '装置搭建与分离精制' }, { role: '检识统计', name: '', studentId: '', duty: 'TLC 检识与数据统计' }]
      }
    };
  }

  function isRecord(value) { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
  function cloneJson(value) { return JSON.parse(JSON.stringify(value)); }
  function canonicalRigKey(value, fallback = 'steam') {
    const key = value === 'funnel' ? 'extract' : value;
    const fallbackKey = fallback === 'funnel' ? 'extract' : fallback;
    if (Object.prototype.hasOwnProperty.call(LAB_RIGS, key)) return key;
    return Object.prototype.hasOwnProperty.call(LAB_RIGS, fallbackKey) ? fallbackKey : 'steam';
  }

  function createWorkState(t) {
    const c = isRecord(t.defaultCfg) ? t.defaultCfg : { mass: 50, ratio: 10, temp: 80, time: 60, mesh: '中粉(40目)', cycles: '2', solventType: '纯化水', ph: '中性 7.0' };
    const defaultRig = canonicalRigKey(t.defaultRig);
    return {
      trackId: 'comprehensive', formalTitle: `${t.herb}中${t.compound}的提取、分离与多维检识综合实验设计`,
      limitVal: t.limitVal, innovKeyword: '',
      mass: c.mass, ratio: c.ratio, temp: c.temp, time: c.time, mesh: c.mesh, cycles: c.cycles, solventType: c.solventType, ph: c.ph,
      schemeMode: 'classic', diyExtract: t.defaultExtract || 'steam', diySeparate: t.defaultSep || 'freeze',
      diyDetects: [DIY_DETECT_LIST[0], DIY_DETECT_LIST[1]], diyNotes: '',
      activeRig: defaultRig, reportRig: defaultRig, activeHotspot: 1,
      sopDone: (Array.isArray(t.sop) ? t.sop : []).map(() => false), batches: cloneJson(Array.isArray(t.demoBatches) ? t.demoBatches : []),
      tlc: { ...(isRecord(t.tlcDefault) ? t.tlcDefault : { front: 8, sample: 4, ref: 4.1 }) },
      chemTests: cloneJson(Array.isArray(t.chemTests) ? t.chemTests : []),
      reportModules: REPORT_MODULES.reduce((acc, m) => { acc[m.id] = true; return acc; }, {})
    };
  }

  function normalizeWorkState(raw, t) {
    const base = createWorkState(t), source = isRecord(raw) ? raw : {};
    const ws = { ...base, ...source };
    ws.activeRig = canonicalRigKey(source.activeRig, base.activeRig);
    ws.reportRig = canonicalRigKey(source.reportRig, base.reportRig);
    ws.tlc = { ...base.tlc, ...(isRecord(source.tlc) ? source.tlc : {}) };
    const batches = (Array.isArray(source.batches) ? source.batches : base.batches).filter(isRecord);
    ws.batches = (batches.length ? batches : base.batches).map(b => ({ mass: ws.mass, crude: 0, refined: 0, mp: 0, ...b }));
    const chemTests = (Array.isArray(source.chemTests) ? source.chemTests : base.chemTests).filter(isRecord);
    ws.chemTests = (chemTests.length ? chemTests : base.chemTests).map(x => ({ name: '特征检识', passed: false, ...x }));
    ws.reportModules = { ...base.reportModules, ...(isRecord(source.reportModules) ? source.reportModules : {}) };
    REPORT_MODULES.forEach(m => { if (typeof ws.reportModules[m.id] !== 'boolean') ws.reportModules[m.id] = base.reportModules[m.id]; });
    const sop = Array.isArray(t.sop) ? t.sop : [];
    ws.sopDone = sop.map((_, i) => Array.isArray(source.sopDone) ? Boolean(source.sopDone[i]) : false);
    ws.diyDetects = Array.isArray(source.diyDetects) ? source.diyDetects.filter(x => typeof x === 'string') : base.diyDetects;
    return ws;
  }

  function normalizeCustomTopic(raw, id) {
    if (!isRecord(raw)) return null;
    const seed = {
      ...raw, id,
      herb: typeof raw.herb === 'string' && raw.herb.trim() ? raw.herb.trim() : '自定义药材',
      compound: typeof raw.compound === 'string' && raw.compound.trim() ? raw.compound.trim() : '目标活性成分',
      category: typeof raw.category === 'string' && raw.category.trim() ? raw.category.trim() : '黄酮'
    };
    const base = hydrateTopic(seed), topic = { ...base, ...raw, id, herb: seed.herb, compound: seed.compound, category: seed.category };
    topic.defaultRig = canonicalRigKey(raw.defaultRig, base.defaultRig);
    topic.defaultCfg = { ...base.defaultCfg, ...(isRecord(raw.defaultCfg) ? raw.defaultCfg : {}) };
    topic.tlcDefault = { ...base.tlcDefault, ...(isRecord(raw.tlcDefault) ? raw.tlcDefault : {}) };
    topic.scaling = { ...base.scaling, ...(isRecord(raw.scaling) ? raw.scaling : {}) };
    ['steps', 'troubleshoot', 'chemTests', 'demoBatches'].forEach(key => {
      const values = Array.isArray(raw[key]) ? raw[key].filter(isRecord) : [];
      topic[key] = cloneJson(values.length ? values : base[key]);
    });
    topic.sop = Array.isArray(raw.sop) && raw.sop.length ? raw.sop.filter(x => typeof x === 'string') : cloneJson(base.sop);
    if (!topic.sop.length) topic.sop = cloneJson(base.sop);
    const formulas = Array.isArray(raw.formulas) ? raw.formulas.filter(k => Object.prototype.hasOwnProperty.call(FORMULA_BANK, k)) : [];
    topic.formulas = formulas.length ? formulas : cloneJson(base.formulas);
    return topic;
  }

  function findTopicDef(id, customTopics) {
    if (state && state.sessionDraftTopic && state.sessionDraftTopic.id === id) return state.sessionDraftTopic;
    if (customTopics && Object.prototype.hasOwnProperty.call(customTopics, id)) return customTopics[id];
    if (Object.prototype.hasOwnProperty.call(FEATURED_PRESETS, id)) return FEATURED_PRESETS[id];
    const entry = CATALOG_45.find(x => x.id === id);
    return entry ? hydrateTopic(entry) : null;
  }

  function normalizeState(raw) {
    const base = createDefaultState(), source = isRecord(raw) ? raw : {}, next = { ...base, ...source };
    const step = Number(source.step);
    const savedStep = (step === 'hub' || (Number.isInteger(step) && step >= 1 && step <= 6)) ? step : 1;
    next.lastSavedStep = savedStep;
    // 默认每次新打开页面都从第 1 步首页进入，避免新访客或再次打开时直接落到半路板块；若 URL 显式带 ?step= 则直达
    const urlParams = new URLSearchParams(window.location.search || '');
    const urlStepRaw = urlParams.get('step');
    if (urlStepRaw === 'hub') {
      next.step = 'hub';
    } else if (urlStepRaw && Number(urlStepRaw) >= 1 && Number(urlStepRaw) <= 6) {
      next.step = Number(urlStepRaw);
    } else {
      next.step = 1;
    }
    ['rTab', 'litFilter', 'sideQuery', 'sideCat', 'step1Tab', 'step1Query', 'step1Cat', 'theoryView'].forEach(key => {
      next[key] = typeof source[key] === 'string' ? source[key] : base[key];
    });
    next.drawerWide = Boolean(source.drawerWide);
    next.customTopics = {};
    if (isRecord(source.customTopics)) Object.entries(source.customTopics).forEach(([id, entry]) => {
      const topic = normalizeCustomTopic(entry, id);
      if (topic) next.customTopics[id] = topic;
    });
    next.activeTopicId = typeof source.activeTopicId === 'string' && findTopicDef(source.activeTopicId, next.customTopics) ? source.activeTopicId : base.activeTopicId;
    next.topicStates = {};
    if (isRecord(source.topicStates)) Object.entries(source.topicStates).forEach(([id, workState]) => {
      const topic = findTopicDef(id, next.customTopics);
      if (topic) next.topicStates[id] = normalizeWorkState(workState, topic);
    });
    const meta = isRecord(source.meta) ? source.meta : {};
    next.meta = { ...base.meta, ...meta };
    ['className', 'groupName', 'date', 'teacher'].forEach(key => {
      if (typeof next.meta[key] !== 'string') next.meta[key] = base.meta[key];
    });
    const members = (Array.isArray(meta.members) ? meta.members : []).filter(isRecord);
    next.meta.members = (members.length ? members : base.meta.members).map((m, i) => ({
      ...(base.meta.members[i] || { role: '组员', name: '', studentId: '', duty: '' }), ...m
    }));
    next.extraGlobalRefs = (Array.isArray(source.extraGlobalRefs) ? source.extraGlobalRefs : []).filter(isRecord).map(r => ({ tag: '自定义', text: '', url: '', ...r }));
    return next;
  }

  let state = createDefaultState();

  let yieldChartInstance = null, pendingConfirmAction = null, timerSeconds = 240 * 60, timerInterval = null, walkIdx = 0, walkTimer = null;

  function loadApprovedAiBank() {
    try {
      const raw = JSON.parse(localStorage.getItem(APPROVED_AI_BANK_KEY) || '{}');
      if (!isRecord(raw)) return {};
      const out = {};
      Object.entries(raw).forEach(([id, item]) => {
        if (item && item.aiReview && item.aiReview.approved === true && Number(item.aiReview.score) >= AI_REVIEW_PASS_SCORE) {
          out[id] = item;
        }
      });
      return out;
    } catch (_) {
      return {};
    }
  }

  function saveApprovedAiBank(map) {
    try {
      const clean = {};
      Object.entries(map || {}).forEach(([id, item]) => {
        if (item && item.aiReview && item.aiReview.approved === true && Number(item.aiReview.score) >= AI_REVIEW_PASS_SCORE) {
          clean[id] = item;
        }
      });
      localStorage.setItem(APPROVED_AI_BANK_KEY, JSON.stringify(clean));
    } catch (_) {}
  }

  function wipeTransientTraces() {
    const transientKeys = [
      STORAGE_KEY,
      LEGACY_STORAGE_KEY,
      'bencao_v15_insight_v1',
      'tcm_user_archived_cases_v1',
      'tcm_lab_missions_store_v2',
      'tcm_v8_dock_hidden'
    ];
    transientKeys.forEach(k => { try { localStorage.removeItem(k); } catch (_) {} });
  }

  // 无痕净享模式：每次打开/刷新网页一律彻底重置会话进度，不残留任何使用痕迹；
  // 仅保留经过「用户主动申请 + AI 评审打分 ≥ 90 分 + 用户确认编入」的正式 AI 自编课题。
  function loadState() {
    wipeTransientTraces();
    state = createDefaultState();
    state.sessionDraftTopic = null;
    state.customTopics = loadApprovedAiBank();
  }
  function saveState() {
    // 仅在当前页面生命周期内供 v15 实时体检读取；下次重新打开/刷新时会被 loadState() 自动清空
    try {
      const { sessionDraftTopic, ...rest } = state;
      const mirror = { ...rest, customTopics: { ...(state.customTopics || {}) } };
      if (sessionDraftTopic && sessionDraftTopic.id) {
        mirror.customTopics[sessionDraftTopic.id] = sessionDraftTopic;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mirror));
    } catch (e) {}
  }

  function getTopicDef() {
    return findTopicDef(state.activeTopicId, state.customTopics) || hydrateTopic(CATALOG_45[0]);
  }

  function getWorkState(t) {
    state.topicStates[t.id] = normalizeWorkState(state.topicStates[t.id], t);
    return state.topicStates[t.id];
  }

  function showToast(msg, type = 'success') {
    const c = document.getElementById('toastContainer'), el = document.createElement('div');
    const bg = type === 'error' ? 'bg-rose-600' : type === 'info' ? 'bg-slate-800' : 'bg-[#0a3630]';
    el.className = `px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-xl ${bg} transition-all duration-300`;
    el.textContent = msg; c.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 2500);
  }
  function copyText(text, msg = '已复制') {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => showToast(msg)).catch(() => fallbackCopy(text, msg));
    else fallbackCopy(text, msg);
  }
  function fallbackCopy(text, msg) {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); showToast(msg); } catch (e) { showToast('复制失败', 'error'); }
    ta.remove();
  }

  function computeStats(t, ws) {
    const limit = Number(ws.limitVal) || t.limitVal;
    const valid = ws.batches.filter(b => Number(b.mass) > 0);
    const crudeYields = valid.map(b => (Number(b.crude) || 0) / Number(b.mass) * 100);
    const refinedYields = valid.map(b => (Number(b.refined) || 0) / Number(b.mass) * 100);
    const mps = valid.map(b => Number(b.mp)).filter(v => v > 0);
    const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
    const avgCrude = mean(crudeYields), avgRefined = mean(refinedYields), avgMp = mean(mps);
    let sd = 0, rsd = 0;
    if (crudeYields.length > 1) {
      sd = Math.sqrt(crudeYields.reduce((acc, v) => acc + Math.pow(v - avgCrude, 2), 0) / (crudeYields.length - 1));
      rsd = avgCrude > 0 ? (sd / avgCrude) * 100 : 0;
    }
    const front = Number(ws.tlc.front), sampleL = Number(ws.tlc.sample), refL = Number(ws.tlc.ref); const tlcFrontOk = Number.isFinite(front) && front > 0, sampleValid = tlcFrontOk && Number.isFinite(sampleL) && sampleL > 0 && sampleL <= front, refValid = tlcFrontOk && Number.isFinite(refL) && refL > 0 && refL <= front, tlcValid = sampleValid && refValid; const sampleRf = sampleValid ? sampleL / front : null, refRf = refValid ? refL / front : null;
    const deltaRf = tlcValid ? Math.abs(sampleRf - refRf) : null, tlcOk = tlcValid && deltaRf <= 0.03;
    const totalTests = ws.chemTests.length + 1, passedTests = ws.chemTests.filter(x => x.passed).length + (tlcOk ? 1 : 0);
    return { limit, avgCrude, avgRefined, avgMp, sd, rsd, sampleRf, refRf, deltaRf, tlcValid, tlcOk, passedTests, totalTests, passRate: totalTests > 0 ? passedTests / totalTests * 100 : 0, meets: avgCrude >= limit, count: valid.length };
  }

  // 右侧抽屉开关
  function openRightDrawer(tab = null) {
    if (tab) setRightTab(tab);
    const d = document.getElementById('rightDrawer');
    if (state.drawerWide) d.classList.add('drawer-wide'); else d.classList.remove('drawer-wide');
    d.classList.remove('hidden'); void d.offsetWidth; d.classList.remove('translate-x-full'); d.classList.add('translate-x-0');
    document.getElementById('drawerBackdrop').classList.remove('hidden');
  }
  function closeRightDrawer() {
    const d = document.getElementById('rightDrawer'); d.classList.remove('translate-x-0'); d.classList.add('translate-x-full', 'hidden');
    document.getElementById('leftSidebar').classList.add('-translate-x-full');
    document.getElementById('drawerBackdrop').classList.add('hidden');
  }
  function setRightTab(tab) {
    state.rTab = tab;
    document.querySelectorAll('.rtab-btn').forEach(b => {
      const a = b.dataset.rtab === tab;
      b.className = `rtab-btn py-1.5 rounded-lg transition ${a ? 'bg-[#0a3630] text-white' : 'text-slate-600 hover:text-slate-900'}`;
    });
    ['bank', 'chapters', 'lit', 'univ'].forEach(k => document.getElementById(`rpanel-${k}`).classList.toggle('hidden', k !== tab));
    renderRightDrawer(getTopicDef(), getWorkState(getTopicDef()));
  }

  function setSelectValue(id, val) { const el = document.getElementById(id); if (!el || val == null) return; const str = String(val); if (!Array.from(el.options).some(o => o.value === str)) { const opt = document.createElement('option'); opt.value = str; opt.textContent = str; el.appendChild(opt); } el.value = str; } function renderLeftConfig(t, ws) {
    const sc = t.scaling;
    const totalSol = Math.round(ws.mass * ws.ratio * (Number(ws.cycles) || 1));
    const auxVal = (ws.mass * sc.auxFactor).toFixed(1).replace(/\.0$/, '');
    const yL = (ws.mass * sc.yieldLow).toFixed(2), yH = (ws.mass * sc.yieldHigh).toFixed(2);
    const modCnt = REPORT_MODULES.filter(m => ws.reportModules[m.id]).length;

    document.getElementById('cfgCategory').textContent = t.category;
    const topicBadge = t.isCustom ? '自建创新' : t.isInnovative ? '创新拓展' : t.isClassGroup ? '经典精选' : '经典方案'; document.getElementById('cfgModePill').textContent = ws.schemeMode === 'diy' ? `${topicBadge} · DIY` : topicBadge;
    document.getElementById('cfgHerbName').textContent = `${t.herb} · ${t.compound}`;
    document.getElementById('cfgSolventEst').textContent = `单次 ${Math.round(ws.mass * ws.ratio)} mL · 预估 ${yL}~${yH} ${sc.yieldUnit}`;

    document.getElementById('cfgMass').value = ws.mass;
    document.getElementById('cfgMassLbl').textContent = ws.mass;
    document.getElementById('cfgRatio').value = ws.ratio;
    document.getElementById('cfgRatioLbl').textContent = ws.ratio;
    document.getElementById('cfgTemp').value = ws.temp;
    document.getElementById('cfgTime').value = ws.time;
    setSelectValue('cfgMesh', ws.mesh);
    document.getElementById('cfgCycles').value = ws.cycles;
    setSelectValue('cfgSolventType', ws.solventType);
    document.getElementById('cfgPh').value = ws.ph;

    document.getElementById('cfgTotalSolvent').textContent = `${totalSol} mL (${ws.solventType})`;
    document.getElementById('cfgAuxEst').textContent = `${auxVal} ${sc.auxUnit} (${sc.auxName})`;
    document.getElementById('cfgReportCnt').textContent = `${modCnt} / ${REPORT_MODULES.length}`;
  }

  function renderRightDrawer(t, ws) {
    // 1. 题库
    const customList = Object.values(state.customTopics).map(c => ({ id: c.id, herb: c.herb, compound: c.compound, category: c.category, isCustom: true }));
    const combined = [...customList, ...CATALOG_45];
    const totalBank = combined.length; const rtabBtn = document.getElementById('rtabBankBtn'); if (rtabBtn) rtabBtn.textContent = `题库(${totalBank})`; const catAllOpt = document.getElementById('sideCatAllOpt'); if (catAllOpt) catAllOpt.textContent = `全部分类 (${totalBank})`; const bCount = document.getElementById('bannerBankCount'); if (bCount) bCount.textContent = totalBank; const bPill = document.getElementById('bannerBankPill'); if (bPill) bPill.textContent = `${totalBank} 项药材题库`; const q = state.sideQuery.trim().toLowerCase();
    const list = combined.filter(x => (state.sideCat === '全部' ? true : state.sideCat === '我的创新DIY' ? x.isCustom : state.sideCat === '经典精选课题' ? x.isClassGroup : state.sideCat === '创新拓展课题' ? x.isInnovative : x.category === state.sideCat) && (!q || `${x.herb} ${x.compound} ${x.category}`.toLowerCase().includes(q)));
    const listEl = document.getElementById('sideTopicList');
    listEl.innerHTML = list.map(item => {
      const cur = state.activeTopicId === item.id;
      return `<div class="flex items-center gap-1">
        <button type="button" data-pick-topic="${item.id}" class="flex-1 text-left px-3 py-2 rounded-xl border transition flex items-center justify-between gap-2 ${cur ? 'bg-teal-50 border-[#0f5c54] text-[#062420]' : 'bg-white border-slate-100 hover:border-teal-300 text-slate-800'}">
          <div class="min-w-0"><div class="text-xs font-bold truncate">${item.isCustom ? '★ ' : ''}${item.herb} <span class="font-normal text-slate-500">· ${item.compound}</span></div><div class="text-[10px] text-slate-400">${item.category}</div></div>
          ${item.featured ? '<span class="shrink-0 w-2 h-2 rounded-full bg-amber-500"></span>' : ''}
        </button>
        ${item.isCustom ? `<button type="button" data-del-custom="${item.id}" class="px-1.5 text-slate-400 hover:text-rose-600">×</button>` : ''}
      </div>`;
    }).join('') || '<div class="text-center text-xs text-slate-400 py-6">无匹配课题</div>';
    listEl.querySelectorAll('[data-pick-topic]').forEach(btn => btn.addEventListener('click', () => { if (autoRunning) cancelActiveAI(); state.activeTopicId = btn.dataset.pickTopic; walkIdx = 0; saveState(); closeRightDrawer(); renderAll(); showToast(`已切换：${getTopicDef().herb}`); }));
    listEl.querySelectorAll('[data-del-custom]').forEach(btn => btn.addEventListener('click', () => { if (autoRunning) cancelActiveAI(); delete state.customTopics[btn.dataset.delCustom]; if (state.activeTopicId === btn.dataset.delCustom) state.activeTopicId = 'mint'; saveState(); renderAll(); }));

    // 2. 海量文献库
    const kw = encodeURIComponent(`${t.herb} ${t.compound.split('、')[0]}`);
    document.getElementById('linkCnkiQuick').href = `https://kns.cnki.net/kns8s/search?kw=${kw}`;
    document.getElementById('linkWanfangQuick').href = `https://s.wanfangdata.com.cn/paper?q=${kw}`;
    document.getElementById('linkPubmedQuick').href = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(t.latin.split(' ')[0] || t.herb)}`;

    const litInput = document.getElementById('litSearchInput');
    if (litInput && !litInput.dataset.bound) {
      litInput.dataset.bound = '1';
      litInput.addEventListener('input', e => {
        state.litQuery = e.target.value;
        renderRightDrawer(t, ws);
      });
    }

    const tags = ['全部', '药典教材', '中药化学', '中西医结合', '高校实验', '药企中试', '经典复方'];
    const fb = document.getElementById('litFilterBar');
    fb.innerHTML = tags.map(tg => `<button type="button" data-lit-f="${tg}" class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${state.litFilter === tg ? 'bg-[#0a3630] text-white border-[#0a3630]' : 'bg-white text-slate-600 border-slate-200'}">${tg}</button>`).join('');
    fb.querySelectorAll('[data-lit-f]').forEach(b => b.addEventListener('click', () => { state.litFilter = b.dataset.litF; renderRightDrawer(t, ws); }));

    const allLit = [...GLOBAL_LITERATURE, ...state.extraGlobalRefs];
    const litQ = (state.litQuery || '').trim().toLowerCase();
    let shownLit = state.litFilter === '全部' ? allLit : allLit.filter(x => x.tag === state.litFilter);
    if (litQ) {
      shownLit = shownLit.filter(x => `${x.tag} ${x.text}`.toLowerCase().includes(litQ));
    }
    document.getElementById('globalLitList').innerHTML = shownLit.map((r, i) => `
      <div class="p-3 rounded-2xl bg-[#f7f7f4] border border-slate-200/80 text-xs leading-relaxed space-y-1.5 transition hover:shadow-2xs">
        <div class="flex items-center justify-between gap-2">
          <span class="px-2 py-0.5 rounded-full bg-teal-50 text-[#0f5c54] text-[10px] font-bold border border-teal-200/60">${r.tag}</span>
          <button type="button" data-copy-glit="${i}" class="text-xs font-bold text-[#0f5c54] hover:underline">复制 GB/T 7714 格式</button>
        </div>
        <div class="text-slate-800 text-xs sm:text-[13px] leading-relaxed select-all">${r.text}</div>
        ${r.url ? `<a href="${r.url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-[11px] font-bold text-[#0f5c54] hover:underline">原文与期刊核查 ↗</a>` : ''}
      </div>`).join('') || '<div class="text-center text-xs text-slate-400 py-6">无符合检索条件的文献</div>';
    document.querySelectorAll('[data-copy-glit]').forEach(b => b.addEventListener('click', () => copyText(shownLit[Number(b.dataset.copyGlit)].text, '已复制文献')));

    const queries = [
      { title: '2016+ 提取纯化工艺', q: `SU=('${t.herb}' AND '${t.compound.split('、')[0]}') AND SU=('提取工艺' OR '响应面') AND YE>='2016'` },
      { title: '2016+ 中西医结合/剂型', q: `SU=('${t.herb}' OR '${t.compound.split('、')[0]}') AND SU=('中西医结合' OR '透皮' OR '纳米' OR '肠道菌群') AND YE>='2016'` }
    ];
    document.getElementById('sideQueryList').innerHTML = queries.map((item, i) => `
      <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
        <div class="flex justify-between text-[10px] font-bold text-slate-600"><span>${item.title}</span><button type="button" data-side-q="${i}" class="text-[#0f5c54]">复制</button></div>
        <code class="block text-[10px] font-mono text-slate-600 break-all">${item.q}</code>
      </div>`).join('');
    document.querySelectorAll('[data-side-q]').forEach(b => b.addEventListener('click', () => copyText(queries[Number(b.dataset.sideQ)].q, '已复制检索式')));

    // 3. 高校、药企与用户收录实验案例
    const univInput = document.getElementById('univSearchInput');
    if (univInput && !univInput.dataset.bound) {
      univInput.dataset.bound = '1';
      univInput.addEventListener('input', e => {
        state.univQuery = e.target.value;
        renderRightDrawer(t, ws);
      });
    }

    const uTypes = ['全部', '我的收录案例', '高校实验', '经典复方', '药企中试', '药企QC', '中西医结合', '国家平台'];
    const ufEl = document.getElementById('univFilterBar');
    if (ufEl) {
      ufEl.innerHTML = uTypes.map(tg => `<button type="button" data-univ-f="${tg}" class="px-2.5 py-1 rounded-full text-[10px] font-bold border ${state.univFilter === tg ? 'bg-[#0a3630] text-white border-[#0a3630]' : 'bg-white text-slate-600 border-slate-200'}">${tg}</button>`).join('');
      ufEl.querySelectorAll('[data-univ-f]').forEach(b => b.addEventListener('click', () => { state.univFilter = b.dataset.univF; renderRightDrawer(t, ws); }));
    }
    const univQ = (state.univQuery || '').trim().toLowerCase();
    let shownUniv = state.univFilter === '全部' ? UNIV_CASES : UNIV_CASES.filter(u => (u.type || '高校实验') === state.univFilter);
    if (univQ) {
      shownUniv = shownUniv.filter(u => `${u.univ || ''} ${u.school || ''} ${u.title || ''} ${u.desc || ''}`.toLowerCase().includes(univQ));
    }
    const univListEl = document.getElementById('univCasesList');
    univListEl.innerHTML = shownUniv.length ? shownUniv.map(u => {
      const org = u.univ || u.school || '高校实验案例';
      const body = u.desc || u.summary || '';
      const loadId = u.topicId || u.targetId || '';
      const isUserCase = u.type === '我的收录案例';
      return `
      <div class="p-3.5 rounded-2xl ${isUserCase ? 'bg-amber-50/70 border-amber-200' : 'bg-[#f7f7f4] border-slate-200/80'} border space-y-1.5">
        <div class="flex items-center justify-between gap-2">
          <span class="px-2.5 py-0.5 rounded-full ${isUserCase ? 'bg-amber-500 text-white' : 'bg-[#0a3630] text-emerald-200'} text-[10px] font-bold">${org}</span>
          <div class="flex items-center gap-2">
            ${loadId ? `<button type="button" data-load-case-topic="${loadId}" class="px-2 py-0.5 rounded-lg bg-[#0a3630] text-white text-[10px] font-bold hover:bg-[#062420] transition">载入工作台 →</button>` : ''}
            ${u.url ? `<a href="${u.url}" target="_blank" rel="noopener noreferrer" class="text-[11px] text-[#0f5c54] underline">参考 ↗</a>` : ''}
          </div>
        </div>
        <div class="text-xs font-bold text-slate-900 pt-0.5">${u.title}</div>
        <p class="text-[12px] text-slate-600 leading-relaxed">${body}</p>
      </div>`;
    }).join('') : '<div class="p-6 text-center text-xs text-slate-500">暂无该分类案例，可点击顶栏「提交我的方案演算」创建并收录专属案例。</div>';
    univListEl.querySelectorAll('[data-load-case-topic]').forEach(b => b.addEventListener('click', () => {
      const tid = b.dataset.loadCaseTopic;
      if (tid) { state.activeTopicId = tid; state.step = 2; saveState(); renderAll(); closeRightDrawer(); showToast('已载入收录案例至工作台'); }
    }));

    // 4. 《中药化学》课程 10 大章节知识库
    const chEl = document.getElementById('courseChaptersList');
    if (chEl) {
      chEl.innerHTML = COURSE_CHAPTERS.map((c, idx) => `
        <details ${idx === 0 || idx === 9 ? 'open' : ''} class="group rounded-2xl bg-[#f7f7f4] border border-slate-200/80 overflow-hidden">
          <summary class="cursor-pointer list-none px-3.5 py-2.5 flex items-center justify-between gap-2 hover:bg-teal-50/50 transition">
            <div>
              <div class="text-xs font-extrabold text-[#0a3630]">${c.ch}</div>
              <div class="text-[10px] text-slate-500 mt-0.5">${c.sections}</div>
            </div>
            <span class="text-slate-400 text-xs font-bold group-open:rotate-180 transition">▾</span>
          </summary>
          <div class="px-3.5 pb-3 pt-1.5 border-t border-slate-200/60 space-y-1.5 text-[11px] leading-relaxed text-slate-700">
            <div><span class="font-bold text-[#0f5c54]">生物合成/核心：</span>${c.biosyn}</div>
            <div><span class="font-bold text-[#0f5c54]">理化与提取：</span>${c.props}</div>
            <div><span class="font-bold text-[#0f5c54]">检识/波谱：</span>${c.detect}</div>
            <div class="pt-1 flex flex-wrap gap-1.5 items-center">
              <span class="text-[10px] font-bold text-slate-500">实例直达：</span>
              ${c.herbs.map(hid => {
                const match = CATALOG_45.find(x => x.id === hid);
                return match ? `<button type="button" data-ch-pick="${hid}" class="px-2 py-0.5 rounded-full bg-white border border-teal-200 text-[#0f5c54] hover:bg-[#0a3630] hover:text-white text-[10px] font-bold transition">${match.herb} · ${match.compound.split('（')[0]}</button>` : '';
              }).join('')}
            </div>
          </div>
        </details>`).join('');
      chEl.querySelectorAll('[data-ch-pick]').forEach(btn => btn.addEventListener('click', () => {
        if (autoRunning) cancelActiveAI();
        state.activeTopicId = btn.dataset.chPick; walkIdx = 0; saveState(); closeRightDrawer(); renderAll(); showToast(`已从课程章节载入：${getTopicDef().herb}`);
      }));
    }
  }

  function getHerbLaymanNote(t) {
    if (t.layman) return t.layman;
    const h = t.herb;
    const c = t.category;
    if (c === '生物碱') {
      return `【${h} · 生物碱类】核心为含氮碱性化合物。小白通关要点：它就像个“变装双面谍”，遇酸穿上带电马甲溶于水相，加碱脱掉马甲变游离碱跳入有机相；常用酸水提取或碱化后萃取，极适合用 TLC 碘化铋钾试剂喷雾显橙红色斑点。`;
    }
    if (c === '挥发油与萜类') {
      return `【${h} · 挥发油类】核心具有挥发性与天然芳香。小白通关要点：沸点低、极性小、怕长时间强热！通常利用与水共沸特性，在 95~98℃ 下水蒸气蒸馏带出，或用低极性石油醚冷浸；千万不能开敞口高温长时间蒸发，否则香气成分全部挥发跑光！`;
    }
    if (c === '黄酮') {
      return `【${h} · 黄酮类】多具酚羟基与色原酮骨架。小白通关要点：怕强碱长时间氧化，遇酸可能水解糖苷键。通常选用 60%~80% 乙醇文火回流或超声提取；分离纯化常用大孔吸附树脂或聚酰胺吸附，检识用盐酸-镁粉反应显樱红色，紫外灯下呈亮黄色荧光。`;
    }
    if (c === '蒽醌与醌类') {
      return `【${h} · 醌类】核心具共轭醌环与不同数目的酚羟基。小白通关要点：酸性强弱取决于酚羟基的位置和数量！可巧妙利用 NaHCO₃、Na₂CO₃、1% NaOH 溶液梯度萃取法，像分楼梯一样把不同酸性的蒽醌依次分离出来，Bornträger 反应加碱显红。`;
    }
    if (c === '皂苷与三萜') {
      return `【${h} · 皂苷类】分子大，一头亲水（多糖链）一头亲脂（皂苷元）。小白通关要点：水溶液用力振摇会产生蜂窝状持久泡沫；提取常用正丁醇萃取纯化，或用大孔树脂脱盐；怕强酸水解，薄层色谱喷 10% 硫酸乙醇显紫红至褐色。`;
    }
    if (c === '多糖类') {
      return `【${h} · 多糖类】水溶性高分子聚合物。小白通关要点：极爱溶于热水，但在乙醇中会像雪花一样析出沉淀！所以经典工艺是“水提醇沉法”（水煮出浓缩液，加 4 倍量无水乙醇让多糖沉淀析出），Sevage 法除蛋白即可获得高纯多糖。`;
    }
    return `【${h} · ${c}】小白通关要点：目标成分为 ${t.compound}。请注意控制提取温度在 ${t.defaultCfg?.temp || 75}℃ 左右保护热敏活性，选用 ${t.defaultCfg?.solventType || '适宜溶剂'} 高效溶出，按提取、分离、纯化、检识 4 个阶段规范推进实验。`;
  }

  function renderStep1(t) {
    const el = document.getElementById('step1HerbCards');
    const CLASS_ORDER = ['coptis','ginkgo_flav','forsythia','sophora','cassia','mint','senna','sedum','lonicera','phellodendron_flav','salvia','scutellaria','glycyrrhiza','andrographis','panax','pueraria','armeniaca','polygonum','panax_quinquefolius'];
    const EXTRA_INNO_IDS = [...Object.keys(V5_DATA.V5_PRESETS || {}), ...Object.keys(V3_DATA.V3_PRESETS || {}), ...Object.keys(EXTRA_DATA.EXTRA_PRESETS || {})];
    const INNO_ORDER = [...EXTRA_INNO_IDS, 'clove','cnidium','carthamus','sophora_flavescens','epimedium','bupleurum','astragalus','angelica_dahurica','paeonia_lactiflora','prunella','citrus','curcuma_longa','magnolia','schisandra','notoginseng','lycium','corydalis','gardenia','fraxinus','tea_caffeine','paeonia_moutan','star_anise','periploca','anemarrhena'];
    const tab = state.step1Tab || 'innovative';
    document.querySelectorAll('[data-s1-tab]').forEach(btn => {
      const active = btn.dataset.s1Tab === tab;
      btn.className = active
        ? 'px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition bg-[#0a3630] text-white shadow-xs'
        : 'px-3.5 py-1.5 rounded-xl text-xs font-bold transition text-slate-600 hover:text-slate-900';
      btn.onclick = () => { state.step1Tab = btn.dataset.s1Tab; state.step1Cat = '全部'; saveState(); renderStep1(getTopicDef()); };
    });

    const qInput = document.getElementById('step1QuickSearch');
    if (qInput && !qInput.dataset.bound) {
      qInput.dataset.bound = '1';
      qInput.value = state.step1Query || '';
      qInput.addEventListener('input', e => { state.step1Query = e.target.value; renderStep1(getTopicDef()); });
    }

    const listIds = tab === 'class' ? CLASS_ORDER : tab === 'innovative' ? INNO_ORDER : [...INNO_ORDER, ...CLASS_ORDER, 'phellodendron', 'rheum', 'artemisia', 'ephedra'];
    const seen = new Set();
    const aiCustomList = Object.values(state.customTopics || {}).reverse(); const aiTabBtn = document.getElementById('btnStep1AiTab'); if (aiTabBtn) aiTabBtn.textContent = '🤖 AI/自建 (' + aiCustomList.length + ')'; const baseCards = tab === 'ai_custom' ? aiCustomList : listIds.filter(id => !seen.has(id) && seen.add(id)).map(id => FEATURED_PRESETS[id]).filter(Boolean);

    const catPillsEl = document.getElementById('step1CatPills');
    if (catPillsEl) {
      const cats = ['全部', ...Array.from(new Set(baseCards.map(p => p.category)))];
      const curCat = state.step1Cat || '全部';
      catPillsEl.innerHTML = cats.map(c => `<button type="button" data-s1-cat="${c}" class="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${curCat === c ? 'bg-teal-700 text-white border-teal-700' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'}">${c}</button>`).join('');
      catPillsEl.querySelectorAll('[data-s1-cat]').forEach(b => b.addEventListener('click', () => { state.step1Cat = b.dataset.s1Cat; renderStep1(getTopicDef()); }));
    }

    const q = (state.step1Query || '').trim().toLowerCase();
    const curCat = state.step1Cat || '全部';
    const RIG_SHORT = { steam: '水蒸气蒸馏', reflux: '加热回流', soxhlet: '索氏提取', ultrasound: '低温超声', filter: '减压抽滤', extract: '液-液萃取', column: '硅胶柱层析', rotavap: '旋转蒸发', resin: '大孔树脂', tlc: '薄层检视', percolation: '渗漉提取', hplc: 'HPLC分析', freeze_dry: '真空冻干' };
    const totalTopicsCount = CATALOG_45.length + Object.keys(state.customTopics || {}).length;
    const innoCount = INNO_ORDER.filter(id => FEATURED_PRESETS[id]).length;
    const classCount = CLASS_ORDER.filter(id => FEATURED_PRESETS[id]).length;
    const allFeaturedCount = Object.keys(FEATURED_PRESETS).length;
    const setTxt = (id, v) => { const x = document.getElementById(id); if (x) x.textContent = v; };
    setTxt('bannerBankCount', totalTopicsCount);
    setTxt('drawerBankCount', totalTopicsCount);
    setTxt('btnStep1BankCnt', totalTopicsCount);
    setTxt('bannerBankPill', `${totalTopicsCount} 项药材题库`);
    setTxt('bannerRigPill', `${Object.keys(LAB_RIGS).length} 套动态实验装置`);
    setTxt('bannerLitPill', `${GLOBAL_LITERATURE.length + state.extraGlobalRefs.length} 篇实证文献`);
    setTxt('navHubCount', Object.keys(LAB_RIGS).length); setTxt('step4HubCnt', Object.keys(LAB_RIGS).length);
    const tInno = document.querySelector('[data-s1-tab="innovative"]'); if (tInno) tInno.textContent = `✨ 创新拓展 (${innoCount}项)`;
    const tClass = document.querySelector('[data-s1-tab="class"]'); if (tClass) tClass.textContent = `★ 经典精选 (${classCount}项)`;
    const tAll = document.querySelector('[data-s1-tab="all"]'); if (tAll) tAll.textContent = `全部精编 (${allFeaturedCount}项)`;
    const cards = baseCards.filter(p => (curCat === '全部' || p.category === curCat) && (!q || `${p.herb} ${p.compound} ${p.category} ${p.integrative || ''} ${RIG_SHORT[p.defaultRig] || ''}`.toLowerCase().includes(q)));

    el.innerHTML = cards.map(p => {
      const sel = state.activeTopicId === p.id;
      const badge = p.isAiGenerated ? '<span class="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-teal-100 text-[#0a3630]">AI新创</span>' : p.isInnovative
        ? '<span class="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-900">创新</span>'
        : p.isClassGroup
          ? '<span class="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-900">经典</span>'
          : '';
      const rigTag = RIG_SHORT[p.defaultRig] || '常规提取';
      return `<button type="button" data-s1-pick="${p.id}" class="pick-card ${sel ? 'selected' : ''} text-left rounded-2xl bg-white border border-slate-200/90 p-3.5 space-y-1.5 flex flex-col justify-between">
        <div class="space-y-1">
          <div class="flex items-center justify-between gap-1"><div class="flex items-center gap-1 min-w-0"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-[#0f5c54] truncate">${p.category}</span>${badge}</div>${sel ? '<span class="shrink-0 text-[10px] font-extrabold text-[#0f5c54]">已选 ✓</span>' : ''}</div>
          <div class="text-base font-extrabold text-slate-900 pt-0.5">${p.herb}</div>
          <div class="text-xs text-slate-500 truncate">${p.compound}</div>
        </div>
        <div class="pt-1.5 mt-1 border-t border-slate-100 flex items-center justify-between gap-1.5 text-[10px] text-slate-500">
          <span class="font-semibold text-[#0f5c54] truncate">⚗️ ${rigTag}</span>
          <span class="shrink-0 whitespace-nowrap px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">常规可做</span>
        </div>
      </button>`;
    }).join('') || '<div class="col-span-full text-center text-xs text-slate-400 py-8">未找到匹配课题，可清空筛选或点击上方「创建创新 DIY 药材」</div>';
    el.querySelectorAll('[data-s1-pick]').forEach(btn => btn.addEventListener('click', () => {
      if (autoRunning) cancelActiveAI();
      state.activeTopicId = btn.dataset.s1Pick;
      walkIdx = 0;
      saveState();
      renderAll();
      showToast(`已锁定：${getTopicDef().herb}`);
      const profileCard = document.getElementById('s1HerbTitle');
      if (profileCard) profileCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }));

    document.getElementById('s1HerbTitle').textContent = `${t.herb} · ${t.compound}`;
    document.getElementById('s1HerbLatin').textContent = t.latin;
    document.getElementById('s1CatBadge').textContent = t.category;
    document.getElementById('s1LimitBadge').textContent = `药典限度 ≥ ${t.limitVal}${t.limitUnit}`;
    document.getElementById('s1Origin').textContent = t.origin;
    document.getElementById('s1Chem').textContent = t.chemistry;
    document.getElementById('s1Pharm').textContent = t.pharmacopoeia;
    const laymanEl = document.getElementById('s1Layman');
    if (laymanEl) laymanEl.textContent = getHerbLaymanNote(t);
  }

  function renderStep2(t, ws) {
    if (window.TCM_V5_ENCYCLOPEDIA) window.TCM_V5_ENCYCLOPEDIA.renderScaleUpCalculator(document.getElementById('step2ScaleUpCard'), t, ws, copyText);
    const el = document.getElementById('step2TrackCards');
    el.innerHTML = TRACK_OPTIONS.map(tr => `
      <button type="button" data-pick-track="${tr.id}" class="pick-card ${ws.trackId === tr.id ? 'selected' : ''} text-left rounded-2xl bg-white border border-slate-200 p-4 space-y-1">
        <div class="flex items-center justify-between"><span class="text-sm font-extrabold text-slate-900">${tr.name}</span>${ws.trackId === tr.id ? '<span class="text-xs font-bold text-[#0f5c54]">✓</span>' : ''}</div>
        <p class="text-xs text-slate-500">${tr.desc}</p>
      </button>`).join('');
    el.querySelectorAll('[data-pick-track]').forEach(btn => btn.addEventListener('click', () => {
      ws.trackId = btn.dataset.pickTrack; ws.formalTitle = `${t.herb}中${t.compound}的${TRACK_OPTIONS.find(x => x.id === ws.trackId).suffix}`; saveState(); renderAll();
    }));
    document.getElementById('inputFormalTitle').value = ws.formalTitle;
    document.getElementById('inputLimitOverride').value = ws.limitVal;
    document.getElementById('inputInnovKeyword').value = ws.innovKeyword || '';
  }

  function renderWalkthrough(t) {
    const steps = t.steps || []; if (!steps.length) return;
    const ws = getWorkState(t);
    walkIdx = walkIdx % steps.length; const cur = steps[walkIdx];
    document.getElementById('walkStagePill').textContent = `分镜 ${walkIdx + 1}/${steps.length} · ${cur.stage}`;
    document.getElementById('walkVisualTitle').textContent = cur.title;
    document.getElementById('walkPrinciple').textContent = cur.principle;
    document.getElementById('walkQc').textContent = cur.qc || '按左侧参数规范质控';
    const subMount = document.getElementById('walkSubBranches');
    if (subMount) {
      const subs = getStepSubBranches(t, ws, cur, walkIdx);
      subMount.innerHTML = subs.map((s, si) => `
        <div class="p-2.5 rounded-xl bg-white/10 border border-white/15 space-y-1.5">
          <div class="flex items-center justify-between gap-1">
            <span class="text-[11px] font-bold text-emerald-200">${walkIdx + 1}.${si + 1} ${aiEsc(s.name || s.title)}</span>
            <a href="${biliUrl(s.biliKw || getTopicShortBiliKw(t))}" target="_blank" rel="noopener noreferrer" class="px-2 py-0.5 rounded-full bg-pink-500/25 hover:bg-pink-500/40 text-pink-100 text-[10px] font-bold shrink-0">▶ B站</a>
          </div>
          <p class="text-[10.5px] text-teal-100/85 leading-relaxed">${aiEsc(s.detail || s.action || '')}</p>
        </div>`).join('');
    }
    const dots = document.getElementById('walkDots');
    dots.innerHTML = steps.map((_, i) => `<button type="button" data-walk-i="${i}" class="h-2 rounded-full transition ${i === walkIdx ? 'bg-emerald-300 w-5' : 'bg-white/25 w-2'}"></button>`).join('');
    dots.querySelectorAll('[data-walk-i]').forEach(b => b.addEventListener('click', () => { walkIdx = Number(b.dataset.walkI); renderWalkthrough(t); }));
  }
  function stopWalkthrough() { if (walkTimer) { clearInterval(walkTimer); walkTimer = null; } const l = document.getElementById('lblPlayWalk'); if (l) l.textContent = '播放分镜演示'; }

  function renderStep3(t, ws) {
    const fKeys = t.formulas || ['diffusion', 'qc'];
    const view = state.theoryView || 'plain';

    // 渲染理论公式/小白速懂模式切换按钮状态
    const btnPlain = document.getElementById('btnTheoryTabPlain');
    const btnFormula = document.getElementById('btnTheoryTabFormula');
    if (btnPlain && btnFormula) {
      if (view === 'plain') {
        btnPlain.className = 'theory-mode-btn px-3 py-1.5 rounded-lg bg-white text-[#0a3630] font-bold shadow-xs transition';
        btnFormula.className = 'theory-mode-btn px-3 py-1.5 rounded-lg text-slate-600 font-medium hover:text-slate-900 transition';
      } else {
        btnFormula.className = 'theory-mode-btn px-3 py-1.5 rounded-lg bg-white text-[#0a3630] font-bold shadow-xs transition';
        btnPlain.className = 'theory-mode-btn px-3 py-1.5 rounded-lg text-slate-600 font-medium hover:text-slate-900 transition';
      }
      btnPlain.onclick = () => { state.theoryView = 'plain'; saveState(); renderStep3(t, ws); };
      btnFormula.onclick = () => { state.theoryView = 'classic'; saveState(); renderStep3(t, ws); };
    }

    // 渲染核心公式/白话卡片
    document.getElementById('theoryFormulasGrid').innerHTML = fKeys.map(k => {
      const f = FORMULA_BANK[k] || FORMULA_BANK['diffusion'];
      return `
      <div class="rounded-3xl bg-white border border-teal-100 shadow-xs p-5 space-y-3.5 transition hover:shadow-md">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-lg bg-teal-50 text-[#0f5c54] flex items-center justify-center font-bold text-xs">⚗️</span>
            <h4 class="text-sm font-extrabold text-slate-900">${f.name}</h4>
          </div>
          <span class="px-2 py-0.5 rounded-full bg-teal-50 text-[#0f5c54] text-[10px] font-bold">${f.category || '核心原理'}</span>
        </div>

        ${view === 'plain' ? `
        <!-- 小白通俗大白话区域 -->
        <div class="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
          <div class="flex items-center gap-1.5 text-xs font-extrabold text-amber-900">
            <span>通俗原理解析</span>
          </div>
          <p class="text-xs text-amber-950 leading-relaxed">${f.plain || f.desc}</p>
        </div>
        ` : `
        <!-- 经典学术公式区域 -->
        <div class="space-y-2">
          <div class="formula-box px-3.5 py-2.5 rounded-xl bg-[#062420] text-emerald-300 font-mono text-xs sm:text-sm font-bold overflow-x-auto shadow-inner tracking-wide">
            ${f.eq}
          </div>
          <p class="text-xs text-slate-600 leading-relaxed"><strong class="text-[#0a3630]">标准定义：</strong>${f.desc}</p>
        </div>
        `}

        ${f.breakdown && f.breakdown.length ? `
        <div class="space-y-1.5 pt-1">
          <div class="text-[11px] font-bold text-slate-700 flex items-center gap-1"><span>🔍</span><span>参数在实验室里代表什么？（为什么要这样设定）</span></div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            ${f.breakdown.map(b => `
              <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] space-y-0.5">
                <div class="font-bold text-[#0f5c54]">${b.term}</div>
                <div class="text-slate-600 leading-relaxed">${b.expl}</div>
              </div>
            `).join('')}
          </div>
        </div>` : ''}

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
          ${f.pitfalls ? `
          <div class="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200 text-rose-950 text-[11px] leading-relaxed">
            <strong class="font-bold text-rose-800">⚠️ 实验避坑提醒：</strong>${f.pitfalls}
          </div>` : ''}
          ${f.examPoints ? `
          <div class="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-indigo-950 text-[11px] leading-relaxed">
            <strong class="font-bold text-indigo-800">🎓 核心考点速记：</strong>${f.examPoints}
          </div>` : ''}
        </div>
      </div>`;
    }).join('');

    // 新增：新手常见 4 问 4 答（为什么这个实验要这么做？）
    const faqMount = document.getElementById('step3DesignFaq');
    if (faqMount) {
      faqMount.innerHTML = `
        <div class="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 space-y-3">
          <div class="flex items-center gap-2 text-xs font-extrabold text-[#0a3630]">
            <span>🤔</span><span>新手研学快问快答 · 为什么本课题要这么设计？</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div class="p-3 rounded-xl bg-white border border-teal-100 space-y-1">
              <div class="font-bold text-[#0f5c54]">Q1: 为什么选「${ws.solventType || '特定溶剂'}」作为提取溶剂？</div>
              <div class="text-[11px] text-slate-600 leading-relaxed">根据“相似相溶”原则：目标成分【${t.compound}】属【${t.category}】，该溶剂极性与有效成分高度吻合，既能高效溶解目标物，又最大程度减少水溶性大分子淀粉与树脂共提。</div>
            </div>
            <div class="p-3 rounded-xl bg-white border border-teal-100 space-y-1">
              <div class="font-bold text-[#0f5c54]">Q2: 为什么控制提取温度在 ${ws.temp}℃、时长 ${ws.time}min？</div>
              <div class="text-[11px] text-slate-600 leading-relaxed">该温度区间可加速分子热运动扩散，但又低于有效成分的受热分解阈值（${t.mpRef || '热敏区间'}），防止高温导致氧化异构化或挥发损失。</div>
            </div>
            <div class="p-3 rounded-xl bg-white border border-teal-100 space-y-1">
              <div class="font-bold text-[#0f5c54]">Q3: 为什么分 ${ws.cycles} 次提取而不是煮一次？</div>
              <div class="text-[11px] text-slate-600 leading-relaxed">根据菲克第一扩散定律，提取速率由药材细胞内外的“浓度梯度”决定。分次提取每次更换新鲜溶剂，保持极高浓度差，提取效率比一次性单浸高 30% 以上。</div>
            </div>
            <div class="p-3 rounded-xl bg-white border border-teal-100 space-y-1">
              <div class="font-bold text-[#0f5c54]">Q4: 实验万一收率偏低或点样拖尾怎么办？</div>
              <div class="text-[11px] text-slate-600 leading-relaxed">检查粉碎粒度是否过粗导致提取不透；TLC 拖尾多由点样过浓或展开剂未充分预饱和引起，可用毛细管快速微量多次点样，并在层析缸内贴滤纸密封饱和 20 分钟。</div>
            </div>
          </div>
        </div>
      `;
    }

    // 新增：本课题配套文献与中药化学章节速览卡片
    const litMount = document.getElementById('step3LiteratureInline');
    if (litMount) {
      const allLit = [...GLOBAL_LITERATURE, ...state.extraGlobalRefs];
      const matched = allLit.filter(l => l.text.includes(t.herb) || l.text.includes(t.compound.split('、')[0])).slice(0, 3);
      const displayLit = matched.length ? matched : allLit.slice(0, 3);
      litMount.innerHTML = `
        <div class="p-4 rounded-2xl bg-[#f7f7f4] border border-slate-200/80 space-y-2.5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5 text-xs font-extrabold text-[#0a3630]">
              <span>📚</span><span>本课题关联文献与实证研究（GB/T 7714 规范）</span>
            </div>
            <button id="btnOpenFullLitFromStep3" type="button" class="text-xs font-bold text-[#0f5c54] hover:underline">查看全部 ${allLit.length} 篇文献库 ↗</button>
          </div>
          <div class="space-y-2">
            ${displayLit.map((item, idx) => `
              <div class="p-2.5 rounded-xl bg-white border border-slate-200/70 text-xs flex items-start justify-between gap-2">
                <div class="space-y-0.5">
                  <span class="inline-block px-1.5 py-0.5 rounded bg-teal-50 text-[#0f5c54] text-[10px] font-bold">${item.tag}</span>
                  <div class="text-slate-700 leading-relaxed text-[11px]">${item.text}</div>
                </div>
                <button type="button" data-inline-copy-lit="${idx}" class="shrink-0 text-[11px] text-[#0f5c54] font-bold hover:underline">复制</button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      litMount.querySelectorAll('[data-inline-copy-lit]').forEach(btn => {
        btn.onclick = () => {
          const idx = Number(btn.dataset.inlineCopyLit);
          if (displayLit[idx]) copyText(displayLit[idx].text, '已复制文献引用');
        };
      });
      const bOpenFull = document.getElementById('btnOpenFullLitFromStep3');
      if (bOpenFull) bOpenFull.onclick = () => openRightDrawer('lit');
    }

    document.getElementById('integrativePerspective').textContent = t.integrative;
    const sp = t.spectra ? Object.assign({}, SPECTRA_BY_CAT[t.category] || SPECTRA_BY_CAT['黄酮'], t.spectra) : SPECTRA_BY_CAT[t.category] || SPECTRA_BY_CAT['黄酮'];
    const chBadge = document.getElementById('s3ChapterBadge');
    const spGrid = document.getElementById('s3SpectraGrid');
    if (chBadge) chBadge.textContent = sp.chapter;
    if (spGrid) {
      spGrid.innerHTML = `
        <div class="p-3.5 rounded-2xl bg-[#f7f7f4] border border-slate-200/80 space-y-1">
          <div class="text-xs font-extrabold text-[#0a3630]">生物合成途径</div>
          <p class="text-[12px] text-slate-600 leading-relaxed">${sp.biosyn}</p>
        </div>
        <div class="p-3.5 rounded-2xl bg-[#f7f7f4] border border-slate-200/80 space-y-1">
          <div class="text-xs font-extrabold text-amber-800">紫外光谱（UV · 第13章§3）</div>
          <p class="text-[12px] text-slate-600 leading-relaxed">${sp.uv}</p>
        </div>
        <div class="p-3.5 rounded-2xl bg-[#f7f7f4] border border-slate-200/80 space-y-1">
          <div class="text-xs font-extrabold text-[#0f5c54]">核磁共振（NMR · 第13章§5）</div>
          <p class="text-[12px] text-slate-600 leading-relaxed">${sp.nmr}</p>
        </div>`;
    }
    if (window.TCM_V4_SPECTRO) window.TCM_V4_SPECTRO.renderFourSpectraPanel(document.getElementById('step3FourSpectraCard'), t);
    const btnOpenCh = document.getElementById('btnOpenChaptersFromStep3');
    if (btnOpenCh) btnOpenCh.onclick = () => { openRightDrawer('chapters'); };

    const isDiy = ws.schemeMode === 'diy';
    document.getElementById('btnModeClassic').className = `px-4 py-1.5 rounded-xl text-xs font-bold transition ${!isDiy ? 'bg-[#0a3630] text-white' : 'text-slate-600'}`;
    document.getElementById('btnModeDiy').className = `px-4 py-1.5 rounded-xl text-xs font-bold transition ${isDiy ? 'bg-[#0a3630] text-white' : 'text-slate-600'}`;
    document.getElementById('classicSchemeBox').classList.toggle('hidden', isDiy);
    document.getElementById('diySchemeBox').classList.toggle('hidden', !isDiy);

    document.getElementById('classicRouteBanner').textContent = t.steps.map(s => s.title).join(' → ');
    document.getElementById('classicStepsGrid').innerHTML = t.steps.map((s, i) => {
      const subs = getStepSubBranches(t, ws, s, i);
      return `
      <div class="p-4 rounded-2xl bg-[#f7f7f4] border border-slate-200/80 space-y-2">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <span class="inline-flex items-center justify-center w-5 h-5 rounded-lg bg-[#0a3630] text-white text-[10px] font-extrabold shrink-0">${i + 1}</span>
            <div class="text-xs font-extrabold text-slate-900 truncate">${aiEsc(s.title)}</div>
          </div>
          <span class="px-2 py-0.5 rounded-full bg-teal-50 text-[#0f5c54] text-[10px] font-bold shrink-0">${aiEsc(s.stage || ('阶段' + (i + 1)))}</span>
        </div>
        <p class="text-[12px] text-slate-600 leading-relaxed"><strong class="text-[#0f5c54]">原理：</strong>${aiEsc(s.principle)}</p>
        ${s.operation ? `<p class="text-[11px] text-slate-700 leading-relaxed"><strong class="text-[#0f5c54]">操作：</strong>${aiEsc(s.operation)}${s.duration ? ' <span class="text-slate-400">（' + aiEsc(s.duration) + '）</span>' : ''}</p>` : ''}
        ${s.qc ? `<p class="text-[11px] text-amber-800 leading-relaxed"><strong>质控：</strong>${aiEsc(s.qc)}</p>` : ''}
        ${subs.length ? `<div class="pt-2 border-t border-slate-200/70 space-y-1.5">
          <div class="text-[10.5px] font-extrabold text-slate-500">小分支操作与 B站微视频指引：</div>
          ${subs.map((sub, si) => `
            <div class="flex items-start justify-between gap-2 p-2 rounded-xl bg-white border border-slate-200/70 text-[11px]">
              <div class="min-w-0"><strong class="text-[#0a3630]">${i + 1}.${si + 1} ${aiEsc(sub.name || sub.title)}：</strong><span class="text-slate-600">${aiEsc(sub.detail || sub.action || '')}</span></div>
              <a href="${biliUrl(sub.biliKw || getTopicShortBiliKw(t))}" target="_blank" rel="noopener noreferrer" class="bili-pill shrink-0 !py-0.5 !px-2 !text-[10px]" title="B站精准检索：${aiEsc(sub.biliKw || '')}">▶ ${aiEsc((sub.biliKw || '视频').split(' ')[0])}</a>
            </div>`).join('')}
        </div>` : ''}
      </div>`;
    }).join('');

    const diagEl = document.getElementById('diySanityCheck');
    let warn = '';
    if (t.category === '挥发油与萜类' && (ws.diySeparate === 'acid_precip' || ws.diySeparate === 'salting_out')) warn = '挥发油为中性萜类，建议用「盐析脱水 + 冷冻结晶」。';
    else if (t.category === '黄酮' && ws.diyExtract === 'steam') warn = '黄酮苷无挥发性，建议改用沸水杀酶、超声或乙醇回流。';
    diagEl.className = `p-3.5 rounded-2xl border text-xs ${warn ? 'bg-amber-50 border-amber-300 text-amber-950' : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'}`;
    diagEl.innerHTML = warn ? `<strong>原理提示：</strong>${warn}` : `<strong>匹配良好：</strong>所选提取与分离组合契合「${t.category}」理化性质。`;

    const extEl = document.getElementById('diyExtractOptions');
    extEl.innerHTML = DIY_EXTRACT_LIST.map(item => `<button type="button" data-diy-ext="${item.id}" class="pick-card ${ws.diyExtract === item.id ? 'selected' : ''} text-left p-3 rounded-2xl bg-white border border-slate-200 space-y-0.5"><div class="text-xs font-bold text-slate-900">${item.name}</div><div class="text-[11px] text-slate-500">${item.desc}</div></button>`).join('');
    extEl.querySelectorAll('[data-diy-ext]').forEach(b => b.addEventListener('click', () => { ws.diyExtract = b.dataset.diyExt; const f = DIY_EXTRACT_LIST.find(x => x.id === ws.diyExtract); if (f) { ws.activeRig = f.rig; ws.reportRig = f.rig; } saveState(); renderAll(); }));

    const sepEl = document.getElementById('diySeparateOptions');
    sepEl.innerHTML = DIY_SEPARATE_LIST.map(item => `<button type="button" data-diy-sep="${item.id}" class="pick-card ${ws.diySeparate === item.id ? 'selected' : ''} text-left p-3 rounded-2xl bg-white border border-slate-200 space-y-0.5"><div class="text-xs font-bold text-slate-900">${item.name}</div><div class="text-[11px] text-slate-500">${item.desc}</div></button>`).join('');
    sepEl.querySelectorAll('[data-diy-sep]').forEach(b => b.addEventListener('click', () => { ws.diySeparate = b.dataset.diySep; saveState(); renderAll(); }));

    const detEl = document.getElementById('diyDetectOptions');
    detEl.innerHTML = DIY_DETECT_LIST.map(nm => { const a = ws.diyDetects.includes(nm); return `<button type="button" data-diy-det="${nm}" class="px-3 py-1 rounded-full text-xs font-semibold border ${a ? 'bg-[#0a3630] text-white border-[#0a3630]' : 'bg-white text-slate-600 border-slate-200'}">${a ? '✓ ' : '+ '}${nm}</button>`; }).join('');
    detEl.querySelectorAll('[data-diy-det]').forEach(b => b.addEventListener('click', () => { const nm = b.dataset.diyDet; ws.diyDetects = ws.diyDetects.includes(nm) ? ws.diyDetects.filter(x => x !== nm) : [...ws.diyDetects, nm]; saveState(); renderAll(); }));
    document.getElementById('diyNotesInput').value = ws.diyNotes || '';

    renderWalkthrough(t);
    const shortKw = getTopicShortBiliKw(t); const bLink = document.getElementById('vidBiliLink'); bLink.href = biliUrl(shortKw); bLink.textContent = `B站精准搜「${shortKw}」 ↗`;
    document.getElementById('vidMoocLink').href = `https://www.icourse163.org/search.htm?search=${encodeURIComponent('中药化学')}`;
  }

  function getScaledEquipment(rig, ws) { const vol = (Number(ws.mass) || 0) * (Number(ws.ratio) || 0); const req = vol * 1.5; const sizes = [250, 500, 1000, 2000, 5000]; let flask = '1000mL圆底烧瓶'; if (req > 0) { const m = sizes.find(s => s >= req); flask = m ? `${m}mL圆底烧瓶` : '5000mL圆底烧瓶（建议分批提取）'; } return (rig.equipment || []).map(e => e === '1000mL圆底烧瓶' ? flask : e); }
  function renderStep4(t, ws) {
    const applicable = getApplicableRigs(t, ws);
    const appKeys = applicable.map(x => x.key);
    if (!appKeys.includes(ws.activeRig)) {
      ws.activeRig = appKeys[0] || 'steam';
      ws.activeHotspot = 1;
    }
    const rigKey = LAB_RIGS[ws.activeRig] ? ws.activeRig : (appKeys[0] || 'steam');
    const rig = LAB_RIGS[rigKey];

    const hintEl = document.getElementById('step4ContextHint');
    if (hintEl) {
      hintEl.textContent = `当前课题「${t.herb} · ${t.compound}」（${ws.schemeMode === 'diy' ? 'DIY 定制方案' : '经典方案'}）已智能锁定 ${applicable.length} 套适用装置，排除无关干扰。`;
    }

    const tabsEl = document.getElementById('step4ApplicableRigTabs');
    if (tabsEl) {
      const RIG_LABELS = { steam: '水蒸气蒸馏', reflux: '加热回流', soxhlet: '索氏提取', ultrasound: '低温超声', filter: '减压抽滤', extract: '分液液-液萃取', column: '硅胶柱层析', rotavap: '旋转蒸发浓缩', resin: '大孔树脂纯化', tlc: 'TLC 展开检视', percolation: '渗漉连续提取', hplc: 'HPLC 精密分析', freeze_dry: '真空冷冻干燥' };
      tabsEl.innerHTML = applicable.map(item => {
        const active = item.key === rigKey;
        return `<button type="button" data-app-rig="${item.key}" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-extrabold border transition ${active ? 'bg-[#0a3630] text-white border-[#0a3630] shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-[#0f5c54] hover:bg-teal-50/50'}">
          <span class="px-1.5 py-0.5 rounded-md text-[10px] ${active ? 'bg-emerald-400/25 text-emerald-100' : 'bg-teal-100 text-[#0f5c54]'}">${item.roleLabel}</span>
          <span>${RIG_LABELS[item.key] || LAB_RIGS[item.key]?.title || item.key}</span>
        </button>`;
      }).join('');
      tabsEl.querySelectorAll('[data-app-rig]').forEach(btn => {
        btn.addEventListener('click', () => {
          ws.activeRig = btn.dataset.appRig;
          ws.activeHotspot = 1;
          saveState();
          renderStep4(t, ws);
        });
      });
    }

    const applyBtn = document.getElementById('applyRigToReportBtn');
    if (applyBtn) { const applied = (ws.reportRig || rigKey) === rigKey; applyBtn.textContent = applied ? '已应用到报告 ✓' : '应用到报告'; }
    document.getElementById('rigDiagramTitle').textContent = rig.title;
    document.getElementById('rigAssemblyOrder').innerHTML = `<strong>搭建顺序：</strong>${rig.order}`;
    const rigPt = document.getElementById('rigPlainTheoryText');
    if (rigPt) rigPt.textContent = rig.plainTheory || '利用理化性质差异实现成分高效富集。';
    const vLink = document.getElementById('rigVideoSearchLink');
    if (vLink) {
      vLink.href = biliUrl(rig.videoKw);
      vLink.textContent = `▶ B站搜「${rig.videoKw}」 ↗`;
    }
    const sw = document.getElementById('rigSvgWrapper'); sw.innerHTML = rig.svg; sw.classList.add('rig-live');
    sw.querySelectorAll('[data-hotspot]').forEach(g => g.addEventListener('click', () => { ws.activeHotspot = Number(g.dataset.hotspot); saveState(); renderStep4(t, ws); }));

    const hs = rig.hotspots.find(h => h.id === ws.activeHotspot) || rig.hotspots[0];
    document.getElementById('hotspotBadge').textContent = `组件 #${hs.id}`;
    document.getElementById('hotspotTitle').textContent = hs.name;
    document.getElementById('hotspotDesc').textContent = hs.desc;
    document.getElementById('hotspotWarn').textContent = hs.warn;
    document.getElementById('rigEquipmentChips').innerHTML = getScaledEquipment(rig, ws).map(e => `<span class="px-2.5 py-1 rounded-lg bg-[#f4f3ee] text-slate-700 text-xs font-medium">${e}</span>`).join('');

    // 渲染装置 4 步可操作小分支与精准 B站视频指引
    const subBox = document.getElementById('rigSubStepsBox');
    const subSteps = Array.isArray(rig.subSteps) ? rig.subSteps : [];
    const subBadge = document.getElementById('rigSubStepsBadge');
    if (subBadge) subBadge.textContent = `${subSteps.length} 个实操小分支`;
    if (subBox) {
      subBox.innerHTML = subSteps.map((s, idx) => `
        <div class="subbranch-item space-y-2">
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0">
              <span class="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-[#0a3630] text-emerald-200 text-[11px] font-extrabold shrink-0">${s.code || (idx + 1)}</span>
              <h4 class="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">${aiEsc(s.title)}</h4>
            </div>
            <a href="${biliUrl(s.biliKw || rig.videoKw)}" target="_blank" rel="noopener noreferrer" class="bili-pill shrink-0" title="精准B站检索：${aiEsc(s.biliKw || rig.videoKw)}">▶ ${aiEsc(s.biliKw || '看演示')} ↗</a>
          </div>
          <p class="text-xs text-slate-700 leading-relaxed">${aiEsc(s.action)}</p>
          <div class="text-[11px] text-amber-900 bg-amber-50/80 border border-amber-200/70 rounded-lg px-2.5 py-1.5"><strong>⚠ 避坑要点：</strong>${aiEsc(s.tip)}</div>
        </div>`).join('');
    }

    const doneCnt = ws.sopDone.filter(Boolean).length, pct = t.sop.length ? Math.round(doneCnt / t.sop.length * 100) : 0;
    document.getElementById('sopProgressText').textContent = `${doneCnt}/${t.sop.length} (${pct}%)`;
    document.getElementById('sopProgressBar').style.width = `${pct}%`;
    const sopEl = document.getElementById('sopList');
    sopEl.innerHTML = t.sop.map((txt, i) => `<label class="flex items-start gap-2.5 p-2.5 rounded-xl border ${ws.sopDone[i] ? 'bg-teal-50/50 border-teal-200' : 'bg-[#f7f7f4] border-slate-200/70'} cursor-pointer"><input type="checkbox" data-sop-i="${i}" ${ws.sopDone[i] ? 'checked' : ''} class="mt-0.5 accent-[#0a3630]" /><span class="text-xs sm:text-sm ${ws.sopDone[i] ? 'line-through text-slate-400' : 'text-slate-700'}">${String(txt).replace(/^\d+[\.、]\s*/, '')}</span></label>`).join('');
    sopEl.querySelectorAll('[data-sop-i]').forEach(chk => chk.addEventListener('change', () => { ws.sopDone[Number(chk.dataset.sopI)] = chk.checked; saveState(); renderStep4(t, ws); }));

    document.getElementById('troubleshootList').innerHTML = t.troubleshoot.map(tr => `<div class="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-xs space-y-1"><div class="font-bold text-amber-950">${tr.issue}</div><div class="text-slate-600">成因：${tr.cause}</div><div class="text-[#0f5c54] font-bold">对策：${tr.fix}</div></div>`).join('');
    if (window.TCMToolsV3) window.TCMToolsV3.renderSafetyMatrix(document.getElementById('step4SafetyMatrix'), t, ws, copyText);
    if (window.TCM_V7_MEDIA) window.TCM_V7_MEDIA.renderLabExamSim(document.getElementById('step4LabExamCard'), t, ws, applicable, LAB_RIGS);
  }

  // ============ 独立板块：动态流程与实验装置总览库渲染 ============
  let hubHotspotId = 1;
  function renderHub() {
    const RIG_CATS = {
      steam: '提取装置', reflux: '提取装置', soxhlet: '提取装置', ultrasound: '提取装置', percolation: '提取装置',
      supercritical: '提取装置', microwave: '提取装置',
      extract: '分离纯化', column: '分离纯化', resin: '分离纯化',
      rotavap: '浓缩与保活', filter: '浓缩与保活', freeze_dry: '浓缩与保活', tlc: '精密分析', hplc: '精密分析'
    };
    const catList = ['全部', '提取装置', '分离纯化', '浓缩与保活', '精密分析'];
    const curCat = state.hubCat || '全部';
    const pillsEl = document.getElementById('hubFilterPills');
    if (pillsEl) {
      pillsEl.innerHTML = catList.map(c => {
        const cnt = c === '全部' ? Object.keys(LAB_RIGS).length : Object.keys(LAB_RIGS).filter(k => RIG_CATS[k] === c).length;
        return `<button type="button" data-hub-cat="${c}" class="px-3 py-1.5 rounded-full text-xs font-bold border transition ${curCat === c ? 'bg-[#0a3630] text-white border-[#0a3630]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#0f5c54]'}">${c} (${cnt})</button>`;
      }).join('');
      pillsEl.querySelectorAll('[data-hub-cat]').forEach(b => b.addEventListener('click', () => { state.hubCat = b.dataset.hubCat; saveState(); renderHub(); }));
    }

    const keys = Object.keys(LAB_RIGS).filter(k => curCat === '全部' || RIG_CATS[k] === curCat);
    if (!keys.includes(state.hubRig)) { state.hubRig = keys[0] || 'steam'; hubHotspotId = 1; }
    const activeKey = state.hubRig;
    const gridEl = document.getElementById('hubRigCardsGrid');
    if (gridEl) {
      gridEl.innerHTML = keys.map(k => {
        const r = LAB_RIGS[k];
        const sel = k === activeKey;
        const rTitle = r.title || r.name || k;
        const rEquip = (r.equipment && r.equipment.length) ? r.equipment.slice(0, 3).join(' · ') : (r.shortDesc || r.tag || '');
        return `<button type="button" data-hub-rig="${k}" class="pick-card ${sel ? 'selected' : ''} text-left p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1">
          <div class="flex items-center justify-between gap-1.5">
            <span class="px-2 py-0.5 rounded-full bg-teal-50 text-[#0f5c54] text-[10px] font-bold">${r.stageTag || r.category || RIG_CATS[k] || '实验装置'}</span>
            <span class="text-[10px] text-slate-400 font-semibold">${(r.subSteps || []).length} 个小分支</span>
          </div>
          <div class="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">${aiEsc(rTitle)}</div>
          <div class="text-[11px] text-slate-500 line-clamp-1">${aiEsc(rEquip)}</div>
        </button>`;
      }).join('');
      gridEl.querySelectorAll('[data-hub-rig]').forEach(b => b.addEventListener('click', () => { state.hubRig = b.dataset.hubRig; hubHotspotId = 1; saveState(); renderHub(); }));
    }

    const mount = document.getElementById('hubRigDetailMount');
    const rig = LAB_RIGS[activeKey];
    if (!mount || !rig) return;
    const rigTitle = rig.title || rig.name || activeKey;
    const hsList = Array.isArray(rig.hotspots) ? rig.hotspots : [];
    const hs = hsList.find(h => h.id === hubHotspotId) || hsList[0] || {
      id: 1,
      name: rigTitle,
      desc: rig.shortDesc || rig.plainTheory || '点击下方 4 大分步小分支查看装置搭建与操作细节。',
      warn: rig.safety || '操作前请核查装置气密性、控温上限与通风防护要求。'
    };
    const matchedHerbs = Object.values(FEATURED_PRESETS).filter(p => p.defaultRig === activeKey || (Array.isArray(p.applicableRigs) && p.applicableRigs.includes(activeKey))).slice(0, 8);
    const subs = Array.isArray(rig.subSteps) ? rig.subSteps : [];
    const equipList = (rig.equipment && rig.equipment.length) ? rig.equipment : [rigTitle, rig.tag || '温控与安全防护单元'];

    mount.innerHTML = `
      <div class="lab-card rounded-3xl p-5 sm:p-6 space-y-5">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <span class="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0f5c54] text-[11px] font-bold">${aiEsc(rig.stageTag || rig.category || RIG_CATS[activeKey] || '实验室装置')}</span>
            <h3 class="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">${aiEsc(rigTitle)}</h3>
          </div>
          <a href="${biliUrl(rig.videoKw || rigTitle)}" target="_blank" rel="noopener noreferrer" class="bili-pill">▶ B站搜「${aiEsc(rig.videoKw || rigTitle)}」 ↗</a>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div class="lg:col-span-7 rounded-2xl bg-gradient-to-b from-[#fbfcfa] to-[#e9f4f1] border border-slate-200 p-4 flex flex-col justify-between space-y-3">
            <div id="hubSvgWrap" class="w-full flex items-center justify-center py-2 rig-live">${rig.svg}</div>
            <div class="text-xs text-[#0a3630] bg-white/90 rounded-xl px-3.5 py-2.5 border border-teal-100"><strong>搭建顺序：</strong>${aiEsc(rig.order || '请按下方 4 大分步小分支依次完成装样、密封、控温与终点判定。')}</div>
            <div class="text-xs text-amber-950 bg-amber-50/90 rounded-xl px-3.5 py-2.5 border border-amber-200"><strong class="text-amber-900">装置原理解析：</strong>${aiEsc(rig.plainTheory || rig.shortDesc || '')}</div>
          </div>
          <div class="lg:col-span-5 flex flex-col justify-between gap-3">
            <div class="rounded-2xl bg-[#062420] text-white p-5 space-y-2">
              <span class="inline-block px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-xs font-bold">组件 #${hs.id}${hsList.length > 1 ? '（点击左图编号切换）' : '（核心要点）'}</span>
              <h4 class="text-base font-bold">${aiEsc(hs.name)}</h4>
              <p class="text-xs text-teal-50/90 leading-relaxed">${aiEsc(hs.desc)}</p>
              <div class="p-2.5 rounded-xl bg-amber-400/15 border border-amber-300/30 text-xs text-amber-100"><strong class="text-amber-300">安全警示：</strong>${aiEsc(hs.warn)}</div>
            </div>
            <div class="rounded-2xl bg-white border border-slate-200 p-4 space-y-2">
              <div class="text-xs font-extrabold text-slate-800">核心器材清单</div>
              <div class="flex flex-wrap gap-1.5">${equipList.map(e => `<span class="px-2.5 py-1 rounded-lg bg-[#f4f3ee] text-slate-700 text-xs font-medium">${aiEsc(e)}</span>`).join('')}</div>
            </div>
            <div class="rounded-2xl bg-teal-50/60 border border-teal-200/80 p-4 space-y-2">
              <div class="text-xs font-extrabold text-[#0a3630]">适用代表药材（点击一键载入工作台）</div>
              <div class="flex flex-wrap gap-1.5">${matchedHerbs.length ? matchedHerbs.map(h => `<button type="button" data-hub-load-topic="${h.id}" class="px-2.5 py-1 rounded-full bg-white border border-teal-200 text-[#0f5c54] hover:bg-[#0a3630] hover:text-white text-[11px] font-bold transition">${aiEsc(h.herb)} · ${aiEsc(h.compound.split('、')[0])}</button>`).join('') : '<span class="text-xs text-slate-500">适用于各类定制工艺流程</span>'}</div>
            </div>
          </div>
        </div>

        <div class="space-y-3 pt-2 border-t border-slate-100">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-extrabold text-slate-900">装置搭建与实操分步指引</h4>
            <span class="text-[11px] text-slate-400">每个小步骤独立匹配 1~2 词高命中检索</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${subs.map((s, idx) => `
              <div class="subbranch-item space-y-2">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-[#0a3630] text-emerald-200 text-[11px] font-extrabold shrink-0">${s.code || (idx + 1)}</span>
                    <div class="text-xs sm:text-sm font-extrabold text-slate-900">${aiEsc(s.title)}</div>
                  </div>
                  <a href="${biliUrl(s.biliKw || s.kw || rig.videoKw || rigTitle)}" target="_blank" rel="noopener noreferrer" class="bili-pill shrink-0">▶ ${aiEsc(s.biliKw || s.kw || '看演示')} ↗</a>
                </div>
                <p class="text-xs text-slate-700 leading-relaxed">${aiEsc(s.action || s.detail || '')}</p>
                <div class="text-[11px] text-amber-900 bg-amber-50/80 border border-amber-200/70 rounded-lg px-2.5 py-1.5"><strong>⚠ 避坑要点：</strong>${aiEsc(s.tip || rig.safety || '注意控温与密封安全检查')}</div>
              </div>`).join('')}
          </div>
        </div>
      </div>`;

    mount.querySelectorAll('[data-hotspot]').forEach(g => g.addEventListener('click', () => { hubHotspotId = Number(g.dataset.hotspot); renderHub(); }));
    mount.querySelectorAll('[data-hub-load-topic]').forEach(btn => btn.addEventListener('click', () => {
      state.activeTopicId = btn.dataset.hubLoadTopic;
      state.step = 4;
      state.lastWorkStep = 4;
      const nt = getTopicDef(), nws = getWorkState(nt);
      nws.activeRig = activeKey;
      saveState();
      renderAll();
      showToast(`已载入「${nt.herb}」并定位至适用装置页`);
    }));
  }

  function renderStep5(t, ws, stats) {
    document.getElementById('thCrudeUnit').textContent = `(${t.crudeUnit})`;
    document.getElementById('kpiCrudeYield').textContent = stats.count ? `${stats.avgCrude.toFixed(2)}%` : '--';
    const stEl = document.getElementById('kpiCrudeStatus');
    stEl.textContent = stats.count ? (stats.meets ? `达标 ≥${stats.limit}%` : `低于 <${stats.limit}%`) : '--';
    stEl.className = `text-[11px] mt-0.5 font-bold ${stats.meets ? 'text-emerald-600' : 'text-rose-600'}`;
    document.getElementById('kpiRefinedYield').textContent = stats.count ? `${stats.avgRefined.toFixed(2)}%` : '--';
    document.getElementById('kpiMp').textContent = stats.avgMp > 0 ? `${stats.avgMp.toFixed(1)}℃` : '--';
    document.getElementById('kpiMpRef').textContent = t.mpRef;
    document.getElementById('kpiRsd').textContent = stats.count > 1 ? `${stats.rsd.toFixed(2)}%` : '--';
    document.getElementById('kpiSd').textContent = stats.count > 1 ? `SD ±${stats.sd.toFixed(3)}%` : '需≥2批';
    document.getElementById('kpiPassRate').textContent = `${stats.passRate.toFixed(0)}%`;
    document.getElementById('kpiPassDetail').textContent = `${stats.passedTests}/${stats.totalTests}`;

    const tbody = document.getElementById('batchTableBody');
    tbody.innerHTML = ws.batches.map((b, i) => {
      const y = Number(b.mass) > 0 ? (b.crude / b.mass * 100).toFixed(2) : '0.00';
      return `<tr><td class="py-2 px-2 font-bold">#${i + 1}</td>
        <td class="py-2 px-1.5"><input data-b-i="${i}" data-f="mass" type="number" step="1" min="1" value="${b.mass}" class="b-in w-14 px-1.5 py-1 rounded-lg border border-slate-200 tabular-nums" /></td>
        <td class="py-2 px-1.5"><input data-b-i="${i}" data-f="crude" type="number" step="0.01" min="0" value="${b.crude}" class="b-in w-14 px-1.5 py-1 rounded-lg border border-slate-200 tabular-nums" /></td>
        <td class="py-2 px-1.5"><input data-b-i="${i}" data-f="refined" type="number" step="0.01" min="0" value="${b.refined}" class="b-in w-14 px-1.5 py-1 rounded-lg border border-slate-200 tabular-nums" /></td>
        <td class="py-2 px-1.5"><input data-b-i="${i}" data-f="mp" type="number" step="0.1" min="0" value="${b.mp}" class="b-in w-14 px-1.5 py-1 rounded-lg border border-slate-200 tabular-nums" /></td>
        <td class="py-2 px-1.5 font-bold tabular-nums ${Number(y) >= stats.limit ? 'text-emerald-700' : 'text-rose-600'}">${y}%</td>
        <td class="py-2 px-1 text-center"><button type="button" data-del-b="${i}" class="text-slate-400 hover:text-rose-600">×</button></td></tr>`;
    }).join('');
    tbody.querySelectorAll('.b-in').forEach(inp => inp.addEventListener('change', () => { ws.batches[Number(inp.dataset.bI)][inp.dataset.f] = Number(inp.value) || 0; saveState(); renderAll(); }));
    tbody.querySelectorAll('[data-del-b]').forEach(btn => btn.addEventListener('click', () => { if (ws.batches.length <= 1) return; ws.batches.splice(Number(btn.dataset.delB), 1); saveState(); renderAll(); }));

    document.getElementById('chartLimitLabel').textContent = `限度 ${stats.limit}%`;
    const ctx = document.getElementById('yieldChart');
    if (ctx && typeof Chart !== 'undefined') {
     const labels = ws.batches.map((_, i) => `批次${i + 1}`), vals = ws.batches.map(b => Number(b.mass) > 0 ? Number((b.crude / b.mass * 100).toFixed(2)) : 0); const colors = vals.map(v => v >= stats.limit ? 'rgba(15, 92, 84, 0.85)' : 'rgba(225, 29, 72, 0.75)'); const limitData = labels.map(() => stats.limit); if (yieldChartInstance && yieldChartInstance.canvas === ctx) { yieldChartInstance.data.labels = labels; yieldChartInstance.data.datasets[0].data = vals; yieldChartInstance.data.datasets[0].backgroundColor = colors; yieldChartInstance.data.datasets[1].label = `限度(${stats.limit}%)`; yieldChartInstance.data.datasets[1].data = limitData; yieldChartInstance.update('none'); } else { if (yieldChartInstance) yieldChartInstance.destroy();
      
      yieldChartInstance = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets: [{ label: '收率(%)', data: vals, backgroundColor: vals.map(v => v >= stats.limit ? 'rgba(15, 92, 84, 0.85)' : 'rgba(225, 29, 72, 0.75)'), borderRadius: 8, maxBarThickness: 38 }, { label: `限度(${stats.limit}%)`, type: 'line', data: labels.map(() => stats.limit), borderColor: '#e11d48', borderWidth: 2, borderDash: [5, 4], pointRadius: 0, fill: false }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } }, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } }
      });
    } }

    document.getElementById('tlcFront').value = ws.tlc.front; document.getElementById('tlcSample').value = ws.tlc.sample; document.getElementById('tlcRef').value = ws.tlc.ref;
    document.getElementById('tlcSampleRf').textContent = stats.sampleRf !== null ? stats.sampleRf.toFixed(3) : '--'; document.getElementById('tlcRefRf').textContent = stats.refRf !== null ? stats.refRf.toFixed(3) : '--'; document.getElementById('tlcDeltaRf').textContent = stats.deltaRf !== null ? stats.deltaRf.toFixed(3) : '--'; const errEl = document.getElementById('tlcErrorMsg'); if (errEl) { if (!stats.tlcValid) { errEl.textContent = '参数非法：需满足 0 < 供试品/对照品位移 L ≤ 前沿位移 L₀（且 L₀ > 0）'; errEl.classList.remove('hidden'); } else { errEl.classList.add('hidden'); } }
    document.getElementById('tlcSystemNote').textContent = t.tlcSystem;
    const tb = document.getElementById('tlcVerdictBadge');
    tb.textContent = !stats.tlcValid ? '参数非法' : (stats.tlcOk ? '一致 (|ΔRf|≤0.03)' : '偏差偏大');
    tb.className = `px-2.5 py-0.5 rounded-full text-xs font-bold ${!stats.tlcValid ? 'bg-rose-100 text-rose-700' : (stats.tlcOk ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')}`;
    const cl = v => Math.max(0.05, Math.min(0.95, v));
    document.getElementById('svgSpotSample').setAttribute('cy', stats.sampleRf !== null ? (184 - cl(stats.sampleRf) * 156).toFixed(1) : '184');
    document.getElementById('svgSpotRef').setAttribute('cy', stats.refRf !== null ? (184 - cl(stats.refRf) * 156).toFixed(1) : '184');

    const ce = document.getElementById('chemTestsList');
    ce.innerHTML = ws.chemTests.map((x, i) => `<div class="flex items-center justify-between gap-2 p-2.5 rounded-xl border ${x.passed ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'}"><span class="text-xs text-slate-800">${i + 1}. ${x.name}</span><button type="button" data-tog-c="${i}" class="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white ${x.passed ? 'bg-emerald-600' : 'bg-rose-600'}">${x.passed ? '符合' : '待复检'}</button></div>`).join('');
    ce.querySelectorAll('[data-tog-c]').forEach(b => b.addEventListener('click', () => { ws.chemTests[Number(b.dataset.togC)].passed = !ws.chemTests[Number(b.dataset.togC)].passed; saveState(); renderAll(); }));

    // 渲染 0-Token 本地智能数据诊断与报告讨论草稿
    const diagCard = document.getElementById('step5AutoDiagCard');
    if (diagCard) {
      const yieldVerdict = stats.count
        ? (stats.meets ? `平均粗提收率 ${stats.avgCrude.toFixed(2)}% 高于参考限度（${stats.limit}%），工艺提取充分。` : `平均粗提收率 ${stats.avgCrude.toFixed(2)}% 低于参考限度（${stats.limit}%），建议核查药材粉碎目数（当前 ${ws.mesh}）、延长提取时长或将提取次数由 ${ws.cycles} 次增至 3 次。`)
        : '尚未录入平行批次数据，可点击左侧「演示数据」或手动录入 3 批数据。';
      const rsdVerdict = stats.count >= 2
        ? (stats.rsd < 3 ? `平行重复性极佳（RSD = ${stats.rsd.toFixed(2)}% < 3%），操作稳定可靠。` : stats.rsd <= 5 ? `平行重复性合格（RSD = ${stats.rsd.toFixed(2)}% ≤ 5%），满足常规质控要求。` : `平行波动偏大（RSD = ${stats.rsd.toFixed(2)}% > 5%），建议重点排查批次间温度波动、抽滤残留或浓缩挂壁损失。`)
        : '需录入至少 2 批平行数据以核算 RSD。';
      const tlcVerdict = stats.tlcValid
        ? (stats.tlcOk ? `TLC 定性确证通过（供试品 Rf=${stats.sampleRf.toFixed(2)}，对照品 Rf=${stats.refRf.toFixed(2)}，|ΔRf|=${stats.deltaRf.toFixed(3)} ≤ 0.03）。` : `TLC 斑点存在偏差（|ΔRf|=${stats.deltaRf.toFixed(3)} > 0.03），建议检查展开缸预饱和时间与点样浓度。`)
        : '请完善 TLC 前沿与斑点位移数值。';
      const draftPara = `本实验采用${ws.solventType}（料液比 1:${ws.ratio}，${ws.temp}℃，${ws.time} min，${ws.cycles}次）提取${t.herb}中的${t.compound}。${yieldVerdict}${rsdVerdict}${tlcVerdict}综合理化显色与薄层对照结果（通过率 ${stats.passedTests}/${stats.totalTests}），所建工艺具备良好的教学复现性与质控依据。`;
      diagCard.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-extrabold">实验数据智能诊断</span>
            <h3 class="text-sm font-extrabold text-slate-900">实验数据自动诊断与讨论段落生成</h3>
          </div>
          <button id="btnCopyStep5Draft" type="button" class="px-3 py-1 rounded-xl bg-[#0a3630] text-white text-xs font-bold hover:bg-[#062420] transition">复制讨论段落写入报告</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
          <div class="p-3 rounded-2xl ${stats.meets ? 'bg-emerald-50/70 border-emerald-200' : 'bg-amber-50/70 border-amber-200'} border text-slate-700 leading-relaxed"><strong class="block text-slate-900 mb-0.5">① 收率达标诊断</strong>${yieldVerdict}</div>
          <div class="p-3 rounded-2xl ${stats.rsd <= 5 ? 'bg-teal-50/70 border-teal-200' : 'bg-rose-50/70 border-rose-200'} border text-slate-700 leading-relaxed"><strong class="block text-slate-900 mb-0.5">② 平行性 RSD 诊断</strong>${rsdVerdict}</div>
          <div class="p-3 rounded-2xl ${stats.tlcOk ? 'bg-indigo-50/70 border-indigo-200' : 'bg-amber-50/70 border-amber-200'} border text-slate-700 leading-relaxed"><strong class="block text-slate-900 mb-0.5">③ TLC 定性诊断</strong>${tlcVerdict}</div>
        </div>
        <div class="p-3 rounded-2xl bg-[#f7f7f4] border border-slate-200/80 text-xs text-slate-700 leading-relaxed"><strong class="text-[#0a3630]">可直接写入第 6 步报告的讨论参考：</strong>${draftPara}</div>`;
      const copyBtn = document.getElementById('btnCopyStep5Draft');
      if (copyBtn) copyBtn.onclick = () => { ws.aiConclusion = draftPara; saveState(); copyText(draftPara, '已复制并同步写入第 6 步报告结论'); };
    }
    if (window.TCMToolsV3) {
      window.TCMToolsV3.renderTlcTuner(document.getElementById('step5TlcTunerCard'), t);
      if (window.TCM_V4_SPECTRO) window.TCM_V4_SPECTRO.renderUvCalibrationTool(document.getElementById('step5UvCalCard'), t, ws, copyText, (txt) => { ws.aiConclusion = (ws.aiConclusion ? ws.aiConclusion + '\n' : '') + txt; saveState(); });
      window.TCMToolsV3.renderOrthogonalTool(document.getElementById('step5OrthoCard'), t, ws, copyText, (txt) => {
        ws.aiConclusion = (ws.aiConclusion ? ws.aiConclusion + '\n' : '') + txt;
        saveState();
      });
    }
  }

  function buildReportInnerHtml(t, ws, stats) {
    const mod = ws.reportModules, rig = LAB_RIGS[ws.reportRig || ws.activeRig] || LAB_RIGS.steam;
    const ext = DIY_EXTRACT_LIST.find(x => x.id === ws.diyExtract) || DIY_EXTRACT_LIST[0], sep = DIY_SEPARATE_LIST.find(x => x.id === ws.diySeparate) || DIY_SEPARATE_LIST[0];
    const fKeys = t.formulas || ['diffusion', 'qc'];
    const allRefs = [...GLOBAL_LITERATURE.slice(0, 6), ...state.extraGlobalRefs];
    let html = '';

    if (mod.cover) {
      html += `<div class="text-center border-b-2 border-slate-800 pb-4 space-y-1">
        <div class="text-lg font-extrabold">《中药化学》实验设计与结果报告</div>
        <div class="text-sm font-bold text-[#0a3630]">${ws.formalTitle}</div>
        <div class="text-xs text-slate-600">班级：${state.meta.className || '______'} | 组别：${state.meta.groupName || '____'} | 日期：${state.meta.date || '______'} | 指导教师：${state.meta.teacher || '____'}</div>
      </div>
      <table class="w-full text-xs border-collapse border border-slate-300"><thead><tr class="bg-slate-100"><th class="border border-slate-300 px-2 py-1">角色</th><th class="border border-slate-300 px-2 py-1">姓名</th><th class="border border-slate-300 px-2 py-1">学号</th><th class="border border-slate-300 px-2 py-1">分工</th></tr></thead><tbody>${state.meta.members.map(m => `<tr><td class="border border-slate-300 px-2 py-1">${m.role}</td><td class="border border-slate-300 px-2 py-1">${m.name || '（待填）'}</td><td class="border border-slate-300 px-2 py-1">${m.studentId || '（待填）'}</td><td class="border border-slate-300 px-2 py-1">${m.duty}</td></tr>`).join('')}</tbody></table>`;
    }
    if (mod.origin) html += `<div class="space-y-1"><h4 class="text-sm font-extrabold border-b border-slate-300 pb-1">一、药材基原与药典依据</h4><p><strong>基原：</strong>${t.origin}</p><p><strong>化学成分：</strong>${t.chemistry}</p><p><strong>药典标准：</strong>${t.pharmacopoeia}</p></div>`;
    if (mod.theory) html += `<div class="space-y-1.5"><h4 class="text-sm font-extrabold border-b border-slate-300 pb-1">二、核心公式原理与中西医结合视角</h4>${fKeys.map(k => `<p class="text-xs"><strong>${FORMULA_BANK[k].name}：</strong><code>${FORMULA_BANK[k].eq}</code> — ${FORMULA_BANK[k].desc}</p>`).join('')}<p class="text-xs"><strong>中西医结合转化：</strong>${t.integrative}${ws.innovKeyword ? `（拓展关键词：${ws.innovKeyword}）` : ''}</p></div>`;
    if (mod.scheme) html += `<div class="space-y-1"><h4 class="text-sm font-extrabold border-b border-slate-300 pb-1">三、工艺路线与配置参数</h4><p class="text-xs"><strong>DIY 配置参数：</strong>投料 ${ws.mass}g，料液比 1:${ws.ratio}，溶剂 ${ws.solventType}，粒度 ${ws.mesh}，温度 ${ws.temp}℃，时间 ${ws.time}min，提取 ${ws.cycles} 次，pH 调控：${ws.ph}。</p><p class="text-xs"><strong>工艺路线：</strong>${ws.schemeMode === 'diy' ? `${ext.name} → ${sep.name} → ${ws.diyDetects.join('、')}` : t.steps.map(s => s.title).join(' → ')}</p>${ws.diyNotes ? `<p class="text-xs"><strong>改良说明：</strong>${ws.diyNotes}</p>` : ''}</div>`;
    if (mod.rig) html += `<div class="space-y-1"><h4 class="text-sm font-extrabold border-b border-slate-300 pb-1">四、实验装置与安全要点</h4><p class="text-xs"><strong>装置：</strong>${rig.title}（${getScaledEquipment(rig, ws).join('、')}）</p><p class="text-xs"><strong>搭建顺序：</strong>${rig.order}</p></div>`;
    if (mod.scaling) html += `<div class="space-y-1"><h4 class="text-sm font-extrabold border-b border-slate-300 pb-1">五、SOP 执行记录</h4><ul class="list-none space-y-0.5 text-xs">${t.sop.map((s, i) => `<li>[${ws.sopDone[i] ? '✓' : '○'}] ${s}</li>`).join('')}</ul></div>`;
    if (mod.data) html += `<div class="space-y-1.5"><h4 class="text-sm font-extrabold border-b border-slate-300 pb-1">六、平行数据统计与 TLC 检识</h4><table class="w-full text-xs border-collapse border border-slate-300"><thead><tr class="bg-slate-100"><th class="border border-slate-300 px-2 py-1">批次</th><th class="border border-slate-300 px-2 py-1">投料(g)</th><th class="border border-slate-300 px-2 py-1">粗提(${t.crudeUnit})</th><th class="border border-slate-300 px-2 py-1">精制(g)</th><th class="border border-slate-300 px-2 py-1">熔点(℃)</th><th class="border border-slate-300 px-2 py-1">收率</th></tr></thead><tbody>${ws.batches.map((b, i) => `<tr><td class="border border-slate-300 px-2 py-1">#${i + 1}</td><td class="border border-slate-300 px-2 py-1">${b.mass}</td><td class="border border-slate-300 px-2 py-1">${b.crude}</td><td class="border border-slate-300 px-2 py-1">${b.refined}</td><td class="border border-slate-300 px-2 py-1">${b.mp}</td><td class="border border-slate-300 px-2 py-1 font-bold">${(Number(b.mass) > 0 ? (b.crude / b.mass * 100).toFixed(2) : '0.00')}%</td></tr>`).join('')}</tbody></table><p class="text-xs">平均粗提收率 ${stats.avgCrude.toFixed(2)}%${stats.count > 1 ? `（SD ±${stats.sd.toFixed(3)}%，RSD ${stats.rsd.toFixed(2)}%）` : ''}；${stats.tlcValid ? `TLC 供试品 Rf = ${stats.sampleRf.toFixed(3)}，对照品 Rf = ${stats.refRf.toFixed(3)}，|ΔRf| = ${stats.deltaRf.toFixed(3)}。` : '<span class="text-rose-600 font-semibold">TLC 参数非法（需满足 0 &lt; L ≤ L₀），未写入有效 Rf 数据。</span>'}</p></div>`;
    if (mod.troubleshoot) html += `<div class="space-y-1"><h4 class="text-sm font-extrabold border-b border-slate-300 pb-1">七、异常排障讨论</h4><ul class="list-disc pl-5 text-xs">${t.troubleshoot.map(tr => `<li><strong>${tr.issue}：</strong>${tr.cause} 对策：${tr.fix}</li>`).join('')}</ul></div>`;
    if (mod.conclusion) html += `<div class="space-y-1.5"><h4 class="text-sm font-extrabold border-b border-slate-300 pb-1">八、实验结论与参考文献</h4><p class="text-xs leading-relaxed">本实验以${t.herb}为原料，按设定工艺完成 ${stats.count} 批次平行试验，平均收率 ${stats.avgCrude.toFixed(2)}%（${stats.meets ? '达到' : '低于'}限度 ${stats.limit}%），检识通过率 ${stats.passRate.toFixed(0)}%，${stats.meets && stats.passRate === 100 ? '工艺稳定可行，满足课程与质量控制要求。' : '建议结合排障分析进一步优化参数。'}</p>${ws.aiConclusion ? `<p class="text-xs leading-relaxed bg-emerald-50/60 p-2 rounded border border-emerald-200/70"><strong>AI 深度结论与工艺讨论：</strong>${ws.aiConclusion}</p>` : ''}<div class="text-[11px] space-y-0.5 pt-1">${allRefs.map((r, i) => `<p>[${i + 1}] ${r.text}</p>`).join('')}</div></div>`;
    return html || '<p class="text-center text-slate-400 py-8">请勾选至少 1 个章节</p>';
  }

  function renderStep6(t, ws, stats) {
    if (window.TCMToolsV3) window.TCMToolsV3.renderDefenseQuiz(document.getElementById('step6DefenseQuizCard'), t, ws, getApplicableRigs(t, ws), LAB_RIGS);
    const bFormal = document.getElementById('btnReportViewFormal');
    const bRaw = document.getElementById('btnReportViewRawLog');
    if (bFormal && bRaw && window.TCM_V7_MEDIA) {
      const isRaw = state.reportViewMode === 'raw';
      bFormal.className = `px-2.5 py-1 rounded-lg transition ${!isRaw ? 'bg-[#0a3630] text-white' : 'text-slate-600 hover:text-slate-900'}`;
      bRaw.className = `px-2.5 py-1 rounded-lg transition ${isRaw ? 'bg-[#0a3630] text-white' : 'text-slate-600 hover:text-slate-900'}`;
      bFormal.onclick = () => { state.reportViewMode = 'formal'; renderStep6(t, ws, stats); };
      bRaw.onclick = () => { state.reportViewMode = 'raw'; renderStep6(t, ws, stats); };
    }
    const modEl = document.getElementById('diyReportModulesList');
    modEl.innerHTML = REPORT_MODULES.map(m => {
      const on = !!ws.reportModules[m.id];
      return `<label class="flex items-center justify-between gap-2 p-2.5 rounded-xl border cursor-pointer ${on ? 'bg-teal-50/45 border-teal-200' : 'bg-white border-slate-200 opacity-70'}"><div class="flex items-center gap-2"><input type="checkbox" data-rep-mod="${m.id}" ${on ? 'checked' : ''} class="accent-[#0a3630]" /><span class="text-xs font-bold text-slate-800">${m.title}</span></div><span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${m.cls}">${m.rec}</span></label>`;
    }).join('');
    modEl.querySelectorAll('[data-rep-mod]').forEach(chk => chk.addEventListener('change', () => { ws.reportModules[chk.dataset.repMod] = chk.checked; saveState(); renderAll(); }));

    document.getElementById('reportModuleCount').textContent = `已选 ${REPORT_MODULES.filter(m => ws.reportModules[m.id]).length}/${REPORT_MODULES.length} 项`;
    document.getElementById('printableReportMount').innerHTML = (state.reportViewMode === 'raw' && window.TCM_V7_MEDIA) ? window.TCM_V7_MEDIA.buildRawLogSheetHtml(t, ws) : buildReportInnerHtml(t, ws, stats);
    document.getElementById('metaClass').value = state.meta.className || ''; document.getElementById('metaGroup').value = state.meta.groupName || '';
    document.getElementById('metaDate').value = state.meta.date || ''; document.getElementById('metaTeacher').value = state.meta.teacher || '';

    const memEl = document.getElementById('memberCompactList');
    memEl.innerHTML = state.meta.members.map((m, i) => `<div class="grid grid-cols-12 gap-1.5 items-center"><input data-mi="${i}" data-mf="role" value="${m.role}" placeholder="角色" class="m-in col-span-3 px-2 py-1 text-xs rounded-lg border border-slate-200" /><input data-mi="${i}" data-mf="name" value="${m.name}" placeholder="姓名" class="m-in col-span-3 px-2 py-1 text-xs rounded-lg border border-slate-200" /><input data-mi="${i}" data-mf="studentId" value="${m.studentId}" placeholder="学号" class="m-in col-span-5 px-2 py-1 text-xs rounded-lg border border-slate-200 tabular-nums" /><button type="button" data-del-m="${i}" class="col-span-1 text-slate-400 hover:text-rose-600">×</button></div>`).join('');
    memEl.querySelectorAll('.m-in').forEach(inp => inp.addEventListener('change', () => { state.meta.members[Number(inp.dataset.mi)][inp.dataset.mf] = inp.value; saveState(); renderStep6(t, ws, stats); }));
    memEl.querySelectorAll('[data-del-m]').forEach(b => b.addEventListener('click', () => { if (state.meta.members.length <= 1) return; state.meta.members.splice(Number(b.dataset.delM), 1); saveState(); renderStep6(t, ws, stats); }));
  }

  function renderAll() {
    try {
      const aiBox = document.getElementById('aiPlanShowcase'); if (aiBox && aiBox.dataset.topicId && aiBox.dataset.topicId !== state.activeTopicId) aiBox.classList.add('hidden');
      const t = getTopicDef(), ws = getWorkState(t), stats = computeStats(t, ws);
      const isHub = state.step === 'hub';
      const meta = STEP_META[state.step] || STEP_META[1];
      document.getElementById('headerStepTag').textContent = meta.tag;
      document.getElementById('headerTitle').textContent = meta.title;
      document.getElementById('topLinearProgress').style.width = isHub ? '100%' : `${(Number(state.step) / 6 * 100).toFixed(1)}%`;
      document.getElementById('mobStepIndicator').textContent = isHub ? '装置与工艺库' : `0${state.step}/06 · ${meta.title}`;
      document.getElementById('btnMobPrev').disabled = isHub || Number(state.step) <= 1;
      document.getElementById('btnMobNext').disabled = isHub || Number(state.step) >= 6;
      document.getElementById('btnMobPrev').textContent = !isHub && state.step > 1 ? `← ${STEP_META[state.step - 1]?.title || '上一步'}` : '← 上一步';
      document.getElementById('btnMobNext').textContent = !isHub && state.step < 6 ? `${STEP_META[state.step + 1]?.title || '下一步'} →` : '已完成报告';

      document.querySelectorAll('#wizardNav [data-wstep]').forEach(btn => {
        const rawStep = btn.dataset.wstep; btn.classList.remove('active', 'done');
        if (rawStep === 'hub') { if (isHub) btn.classList.add('active'); }
        else { const n = Number(rawStep); if (!isHub && n === state.step) btn.classList.add('active'); else if (!isHub && n < state.step) btn.classList.add('done'); }
      });
      document.querySelectorAll('.wpanel').forEach(p => p.classList.add('hidden'));
      const curP = document.getElementById(`wpanel-${state.step}`);
      if (curP) { curP.classList.remove('hidden'); curP.style.opacity = '1'; curP.classList.remove('panel-anim'); void curP.offsetWidth; curP.classList.add('panel-anim'); }

      renderLeftConfig(t, ws);
      renderRightDrawer(t, ws);
      if (state.step === 1) renderStep1(t);
      if (state.step === 2) renderStep2(t, ws);
      if (state.step === 3) renderStep3(t, ws);
      if (state.step === 4) renderStep4(t, ws);
      if (state.step === 5) renderStep5(t, ws, stats);
      if (state.step === 6) renderStep6(t, ws, stats);
    if (state.step === 'hub') renderHub();
      if (state.step === 'diy' && window.TCM_DIY_STUDIO) window.TCM_DIY_STUDIO.render();
      if (state.step === 'mission' && window.TCM_MISSION_OS) window.TCM_MISSION_OS.render();
      if (window.TCM_STUDIO_V8) window.TCM_STUDIO_V8.sync(t, ws, stats, state.step);
      if (window.TCM_V9) window.TCM_V9.sync(t, ws, stats, state.step);
      if (window.TCM_V10_SANDBOX) window.TCM_V10_SANDBOX.sync(t, ws, stats, state.step);
      if (window.TCM_V14_COURSE) window.TCM_V14_COURSE.sync(t, ws, stats, state.step);
      if (window.TCM_V16_PORTAL && window.TCM_V16_PORTAL.onAppRender) window.TCM_V16_PORTAL.onAppRender(t, ws, stats, state.step);
      if (typeof lucide !== 'undefined') lucide.createIcons();
    } catch (error) {
      console.error('工作台渲染失败，请检查存档或刷新重试。', error);
      if (document.getElementById('toastContainer')) showToast('页面渲染失败，请检查存档或刷新重试', 'error');
    }
  }

  function downloadBlob(content, filename, mime) {
    const blob = new Blob([content], { type: mime }), url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function generateReportImage() {
    const mount = document.getElementById('printableReportMount');
    if (typeof html2canvas === 'undefined') { showToast('长图组件加载中，请稍候或使用复制全文', 'error'); return; }
    showToast('正在生成高清报告长图...', 'info');
    try {
      const canvas = await html2canvas(mount, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
      const dataUrl = canvas.toDataURL('image/png');
      document.getElementById('generatedReportImg').src = dataUrl;
      const dl = document.getElementById('btnDownloadReportPng'); dl.href = dataUrl; dl.download = `中药化学_${getTopicDef().herb}_实验报告.png`;
      const m = document.getElementById('imageExportModal'); m.classList.remove('hidden'); m.classList.add('flex');
      showToast('高清长图已生成！微信端请长按保存');
    } catch { showToast('生成失败，请使用复制全文或电脑打印', 'error'); }
  }

  function updateTimerUI() {
    const h = String(Math.floor(timerSeconds / 3600)).padStart(2, '0'), m = String(Math.floor((timerSeconds % 3600) / 60)).padStart(2, '0'), s = String(timerSeconds % 60).padStart(2, '0');
    document.getElementById('timerDisplay').textContent = `${h}:${m}:${s}`;
  }

  function initEvents() {
    if (IS_WECHAT) document.getElementById('wechatNoticeBanner').classList.remove('hidden');
    document.getElementById('btnDismissWechat').addEventListener('click', () => document.getElementById('wechatNoticeBanner').classList.add('hidden'));

    // 左配置单抽屉(移动端) & 右资源抽屉(全端可拉出/折叠)
    document.getElementById('btnOpenLeftMobile').addEventListener('click', () => { document.getElementById('leftSidebar').classList.remove('-translate-x-full'); document.getElementById('drawerBackdrop').classList.remove('hidden'); });
    document.getElementById('btnCloseLeftMobile').addEventListener('click', closeRightDrawer);
    document.getElementById('btnOpenRightBank').addEventListener('click', () => openRightDrawer());
    document.getElementById('btnOpenBankFromStep1').addEventListener('click', () => openRightDrawer('bank'));
    document.getElementById('btnOpenLitFromStep3').addEventListener('click', () => openRightDrawer('lit'));
    document.getElementById('btnCloseRightDrawer').addEventListener('click', closeRightDrawer);
    document.getElementById('drawerBackdrop').addEventListener('click', closeRightDrawer);
    const btnWide = document.getElementById('btnToggleDrawerWide');
    if (btnWide) {
      btnWide.addEventListener('click', () => {
        state.drawerWide = !state.drawerWide;
        saveState();
        const d = document.getElementById('rightDrawer');
        if (state.drawerWide) d.classList.add('drawer-wide'); else d.classList.remove('drawer-wide');
        showToast(state.drawerWide ? '已开启资料抽屉宽屏阅读模式' : '已恢复标准抽屉模式');
      });
    }

    document.querySelectorAll('.rtab-btn').forEach(b => b.addEventListener('click', () => setRightTab(b.dataset.rtab)));
    document.getElementById('sideSearch').addEventListener('input', e => { state.sideQuery = e.target.value; renderRightDrawer(getTopicDef(), getWorkState(getTopicDef())); });
    document.getElementById('sideCatFilter').addEventListener('change', e => { state.sideCat = e.target.value; renderRightDrawer(getTopicDef(), getWorkState(getTopicDef())); });
    document.getElementById('btnSideCopyRefs').addEventListener('click', () => copyText([...GLOBAL_LITERATURE, ...state.extraGlobalRefs].map((r, i) => `[${i + 1}] ${r.text}`).join('\n'), '已复制全部文献'));

    // 左侧精细 DIY 配置单联动
    const bindCfg = (id, key, num = false) => {
      document.getElementById(id).addEventListener(id.includes('Mass') || id.includes('Ratio') ? 'input' : 'change', e => {
        const t = getTopicDef(), ws = getWorkState(t);
        ws[key] = num ? (Number(e.target.value) || 0) : e.target.value;
        saveState(); renderLeftConfig(t, ws);
        if (state.step === 6) renderStep6(t, ws, computeStats(t, ws));
      });
    };
    bindCfg('cfgMass', 'mass', true); bindCfg('cfgRatio', 'ratio', true); bindCfg('cfgTemp', 'temp', true);
    bindCfg('cfgTime', 'time', true); bindCfg('cfgMesh', 'mesh'); bindCfg('cfgCycles', 'cycles');
    bindCfg('cfgSolventType', 'solventType'); bindCfg('cfgPh', 'ph');

    // 创建创新 DIY 药材
    const openDiy = () => { const m = document.getElementById('diyHerbModal'); m.classList.remove('hidden'); m.classList.add('flex'); };
    const closeDiy = () => { const m = document.getElementById('diyHerbModal'); m.classList.add('hidden'); m.classList.remove('flex'); };
    ['btnOpenDiyHerbHero', 'btnOpenDiyHerbDrawer'].forEach(id => document.getElementById(id).addEventListener('click', openDiy));
    document.getElementById('btnCloseDiyHerb').addEventListener('click', closeDiy);
    document.getElementById('formDiyHerb').addEventListener('submit', e => {
      e.preventDefault();
      const id = 'draft_diy_' + Date.now();
      const entry = {
        id, isCustom: true, isDraft: true, herb: document.getElementById('dhName').value.trim(), compound: document.getElementById('dhComp').value.trim(),
        category: document.getElementById('dhCat').value, prop: document.getElementById('dhProp').value, limitVal: Number(document.getElementById('dhLimit').value) || 1.0,
        origin: document.getElementById('dhOrigin').value.trim(), innovationTag: document.getElementById('dhExtension').value.trim()
      };
      if (autoRunning) cancelActiveAI();
      // 作为本次临时演练草稿载入，绝不未经审核自动写入题库；用户可主动申请 AI 90 分审核编入
      state.sessionDraftTopic = hydrateTopic(entry);
      state.activeTopicId = id;
      saveState();
      e.target.reset();
      closeDiy();
      closeRightDrawer();
      renderAll();
      showToast(`已生成临时演练草稿「${entry.herb}」（未编入题库，如需收录请点击 AI 90分审核）`, 'info');
      if (window.TCM_AI_REVIEW && window.TCM_AI_REVIEW.open) {
        setTimeout(() => window.TCM_AI_REVIEW.open(state.sessionDraftTopic), 260);
      }
    });

    // 新增文献
    document.getElementById('btnOpenAddRefModal').addEventListener('click', () => { const m = document.getElementById('addRefModal'); m.classList.remove('hidden'); m.classList.add('flex'); });
    document.getElementById('btnCloseAddRef').addEventListener('click', () => { const m = document.getElementById('addRefModal'); m.classList.add('hidden'); m.classList.remove('flex'); });
    document.getElementById('formAddRef').addEventListener('submit', e => {
      e.preventDefault();
      state.extraGlobalRefs.unshift({ tag: '自定义', text: `${document.getElementById('refAuthor').value.trim()}. ${document.getElementById('refTitle').value.trim()}[J]. ${document.getElementById('refJournal').value.trim()}, ${document.getElementById('refYear').value.trim()}${document.getElementById('refIssue').value.trim() ? ', ' + document.getElementById('refIssue').value.trim() : ''}${document.getElementById('refPages').value.trim() ? ': ' + document.getElementById('refPages').value.trim() : ''}.`, url: '' });
      saveState(); e.target.reset(); document.getElementById('addRefModal').classList.add('hidden'); document.getElementById('addRefModal').classList.remove('flex'); renderRightDrawer(getTopicDef(), getWorkState(getTopicDef())); showToast('已加入文献库');
    });

    // 6步导航
    document.querySelectorAll('#wizardNav [data-wstep], [data-go-step]').forEach(btn => btn.addEventListener('click', () => {
      const rawTarget = btn.dataset.wstep || btn.dataset.goStep;
      if (rawTarget === 'hub' || rawTarget === 'diy' || rawTarget === 'mission') {
        if (state.step === 3) stopWalkthrough();
        if (state.step !== 'hub' && state.step !== 'diy' && state.step !== 'mission') state.lastWorkStep = state.step;
        state.step = rawTarget; saveState(); renderAll(); window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const target = Number(rawTarget);
      if (target >= 1 && target <= 6) {
        if (state.step === 3 && target !== 3) stopWalkthrough();
        state.step = target; state.lastWorkStep = target; saveState(); renderAll(); window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }));
    const btnJumpHub = document.getElementById('btnJumpHubFromStep4');
    if (btnJumpHub) btnJumpHub.addEventListener('click', () => { state.lastWorkStep = 4; state.step = 'hub'; saveState(); renderAll(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    const btnBackWf = document.getElementById('btnBackToWorkflow');
    if (btnBackWf) btnBackWf.addEventListener('click', () => { state.step = state.lastWorkStep || 1; saveState(); renderAll(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    const btnZoneWf = document.getElementById('zoneTabWorkflow');
    if (btnZoneWf) btnZoneWf.addEventListener('click', () => { state.step = state.lastWorkStep || 1; saveState(); renderAll(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    document.getElementById('btnMobPrev').addEventListener('click', () => { if (state.step > 1) { if (autoRunning) cancelActiveAI(); state.step--; stopWalkthrough(); saveState(); renderAll(); window.scrollTo({ top: 0, behavior: 'smooth' }); } });
    document.getElementById('btnMobNext').addEventListener('click', () => { if (state.step < 6) { if (autoRunning) cancelActiveAI(); state.step++; stopWalkthrough(); saveState(); renderAll(); window.scrollTo({ top: 0, behavior: 'smooth' }); } });

    // Step 2
    document.getElementById('inputFormalTitle').addEventListener('input', e => { getWorkState(getTopicDef()).formalTitle = e.target.value; saveState(); });
    document.getElementById('inputLimitOverride').addEventListener('change', e => { getWorkState(getTopicDef()).limitVal = Number(e.target.value) || 0.8; saveState(); });
    document.getElementById('inputInnovKeyword').addEventListener('input', e => { getWorkState(getTopicDef()).innovKeyword = e.target.value; saveState(); });

    // Step 3
    document.getElementById('btnModeClassic').addEventListener('click', () => { getWorkState(getTopicDef()).schemeMode = 'classic'; saveState(); renderAll(); });
    document.getElementById('btnModeDiy').addEventListener('click', () => { getWorkState(getTopicDef()).schemeMode = 'diy'; saveState(); renderAll(); });
    document.getElementById('diyNotesInput').addEventListener('input', e => { getWorkState(getTopicDef()).diyNotes = e.target.value; saveState(); });
    document.getElementById('btnPlayWalkthrough').addEventListener('click', () => {
      if (walkTimer) stopWalkthrough();
      else { document.getElementById('lblPlayWalk').textContent = '暂停演示'; walkTimer = setInterval(() => { walkIdx++; renderWalkthrough(getTopicDef()); }, 3500); }
    });

    // Step 4
    document.querySelectorAll('.rig-tab-btn').forEach(b => b.addEventListener('click', () => { const t = getTopicDef(), ws = getWorkState(t); ws.activeRig = b.dataset.rig; ws.activeHotspot = 1; saveState(); renderStep4(t, ws); })); document.getElementById('applyRigToReportBtn')?.addEventListener('click', () => { const t = getTopicDef(), ws = getWorkState(t); ws.reportRig = ws.activeRig; saveState(); renderAll(); showToast('已将当前预览装置应用到实验报告'); });
    document.querySelectorAll('[data-timer-preset]').forEach(b => b.addEventListener('click', () => { if (timerInterval) { clearInterval(timerInterval); timerInterval = null; document.getElementById('btnTimerToggle').textContent = '开始'; } timerSeconds = Number(b.dataset.timerPreset) * 60; updateTimerUI(); }));
    document.getElementById('btnTimerToggle').addEventListener('click', () => {
      const btn = document.getElementById('btnTimerToggle');
      if (timerInterval) { clearInterval(timerInterval); timerInterval = null; btn.textContent = '继续'; }
      else { btn.textContent = '暂停'; timerInterval = setInterval(() => { if (timerSeconds > 0) { timerSeconds--; updateTimerUI(); } else { clearInterval(timerInterval); timerInterval = null; btn.textContent = '开始'; showToast('倒计时结束！', 'info'); } }, 1000); }
    });
    document.getElementById('btnTimerReset').addEventListener('click', () => { if (timerInterval) { clearInterval(timerInterval); timerInterval = null; document.getElementById('btnTimerToggle').textContent = '开始'; } timerSeconds = 240 * 60; updateTimerUI(); });

    // Step 5
    document.getElementById('btnAddBatch').addEventListener('click', () => { const t = getTopicDef(), ws = getWorkState(t); ws.batches.push({ ...(ws.batches[ws.batches.length - 1] || { mass: ws.mass, crude: 1, refined: 0.5, mp: 43 }) }); saveState(); renderAll(); });
    document.getElementById('btnExportCsv').addEventListener('click', () => {
      if (IS_WECHAT) { showToast('微信内受限，请用浏览器打开后下载 CSV', 'info'); return; }
      const t = getTopicDef(), ws = getWorkState(t), rows = [['批次', '投料(g)', `粗提(${t.crudeUnit})`, '精制(g)', '熔点(℃)', '收率(%)']];
      ws.batches.forEach((b, i) => rows.push([`批次${i + 1}`, b.mass, b.crude, b.refined, b.mp, Number(b.mass) > 0 ? (b.crude / b.mass * 100).toFixed(2) : '0.00']));
      downloadBlob('\ufeff' + rows.map(r => r.join(',')).join('\n'), `${t.herb}_实验数据.csv`, 'text/csv;charset=utf-8');
    });
    ['tlcFront', 'tlcSample', 'tlcRef'].forEach(id => document.getElementById(id).addEventListener('input', () => {
      const ws = getWorkState(getTopicDef());
      ws.tlc.front = Number(document.getElementById('tlcFront').value) || 0; ws.tlc.sample = Number(document.getElementById('tlcSample').value) || 0; ws.tlc.ref = Number(document.getElementById('tlcRef').value) || 0;
      saveState(); renderAll();
    }));

    // Step 6
    document.getElementById('btnExportImage').addEventListener('click', generateReportImage);
    document.getElementById('btnCloseImgModal').addEventListener('click', () => { const m = document.getElementById('imageExportModal'); m.classList.add('hidden'); m.classList.remove('flex'); });
    document.getElementById('btnPrintPdf').addEventListener('click', () => { if (IS_WECHAT) { showToast('微信内自动为你生成高清长图！', 'info'); generateReportImage(); } else window.print(); });
    document.getElementById('btnExportWord').addEventListener('click', () => {
      if (IS_WECHAT) { showToast('微信内限制 .doc 下载，请点「高清报告长图」或浏览器打开', 'info'); return; }
      const t = getTopicDef(), inner = document.getElementById('printableReportMount').innerHTML;
      const doc = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>body{font-family:'SimSun','宋体',serif;font-size:12pt;line-height:1.7}table{width:100%;border-collapse:collapse;margin:8pt 0;font-size:10.5pt}th,td{border:1px solid #333;padding:4pt 6pt;text-align:left}th{background:#f2f5f4}</style></head><body>${inner}</body></html>`;
      downloadBlob('\ufeff' + doc, `中药化学_${t.herb}_实验报告.doc`, 'application/msword;charset=utf-8'); showToast('已导出 Word');
    });
    document.getElementById('btnCopyFullReport').addEventListener('click', () => copyText(document.getElementById('printableReportMount').innerText, '已复制报告全文'));
    document.getElementById('btnReportPresetFull').addEventListener('click', () => { REPORT_MODULES.forEach(m => getWorkState(getTopicDef()).reportModules[m.id] = true); saveState(); renderAll(); });
    document.getElementById('btnReportPresetSlim').addEventListener('click', () => { REPORT_MODULES.forEach(m => getWorkState(getTopicDef()).reportModules[m.id] = m.slim); saveState(); renderAll(); });
    ['metaClass', 'metaGroup', 'metaDate', 'metaTeacher'].forEach(id => { const mp = { metaClass: 'className', metaGroup: 'groupName', metaDate: 'date', metaTeacher: 'teacher' }; document.getElementById(id).addEventListener('change', e => { state.meta[mp[id]] = e.target.value; saveState(); renderAll(); }); });
    document.getElementById('btnAddMember').addEventListener('click', () => { state.meta.members.push({ role: '组员', name: '', studentId: '', duty: '' }); saveState(); renderAll(); });

    // 作者直邮
    const openFb = () => { document.getElementById('fbStatusBox').classList.add('hidden'); const m = document.getElementById('feedbackModal'); m.classList.remove('hidden'); m.classList.add('flex'); };
    const closeFb = () => { const m = document.getElementById('feedbackModal'); m.classList.add('hidden'); m.classList.remove('flex'); };
    ['btnOpenFeedbackSide', 'btnOpenFeedbackTop', 'btnOpenFeedbackFooter'].forEach(id => document.getElementById(id).addEventListener('click', openFb));
    document.getElementById('btnCloseFeedback').addEventListener('click', closeFb);
    ['btnCopyEmailSide', 'btnCopyEmailFooter'].forEach(id => document.getElementById(id).addEventListener('click', () => copyText(AUTHOR_EMAIL, `已复制：${AUTHOR_EMAIL}`)));
    document.getElementById('feedbackForm').addEventListener('submit', async e => {
      e.preventDefault();
      const type = (document.querySelector('input[name="fbType"]:checked') || {}).value || '功能建议';
      const content = document.getElementById('fbContent').value.trim(); if (!content) return;
      const btn = document.getElementById('btnSubmitFeedback'), sb = document.getElementById('fbStatusBox');
      btn.disabled = true; btn.textContent = '投递中...'; sb.classList.add('hidden');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      try {
        const res = await fetch(`https://formsubmit.co/ajax/${AUTHOR_EMAIL}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, signal: controller.signal,
          body: JSON.stringify({ _subject: `【中药化学实验工坊-${type}】${getTopicDef().herb}`, _template: 'table', _captcha: 'false', 反馈类型: type, 称呼: document.getElementById('fbSender').value.trim() || '匿名', 回复邮箱: document.getElementById('fbReplyEmail').value.trim() || '未填', 内容: content })
        });
        const data = await res.json();
        if (res.ok && (data.success === 'true' || data.success === true)) { sb.className = 'p-3 rounded-xl text-xs bg-emerald-50 text-emerald-800'; sb.textContent = `发送成功！已直投至 ${AUTHOR_EMAIL}。`; sb.classList.remove('hidden'); document.getElementById('fbContent').value = ''; showToast('发送成功'); }
        else throw 1;
      } catch { sb.className = 'p-3 rounded-xl text-xs bg-amber-50 text-amber-900'; sb.innerHTML = `预览环境网络受限（部署到 GitHub Pages 后即可直发）。请点右侧「复制备用」发至 <strong>${AUTHOR_EMAIL}</strong>。`; sb.classList.remove('hidden'); }
      finally { clearTimeout(timeoutId); btn.disabled = false; btn.textContent = '直接发送至作者邮箱'; }
    });
    document.getElementById('btnCopyFeedbackMail').addEventListener('click', () => copyText(`收件人：${AUTHOR_EMAIL}\n内容：${document.getElementById('fbContent').value.trim()}`, '已复制邮箱与正文'));

    // 存档与重置
    document.getElementById('btnDemoData').addEventListener('click', () => { const t = getTopicDef(), ws = getWorkState(t); ws.batches = JSON.parse(JSON.stringify(t.demoBatches)); ws.tlc = { ...t.tlcDefault }; ws.sopDone = t.sop.map(() => true); ws.chemTests.forEach(c => c.passed = true); saveState(); renderAll(); showToast('已填充演示数据'); });
    document.getElementById('btnExportJson').addEventListener('click', () => { if (IS_WECHAT) { showToast('微信内请用浏览器打开后导出', 'info'); return; } downloadBlob(JSON.stringify(state, null, 2), `tcm_lab_backup.json`, 'application/json'); });
    document.getElementById('inputImportJson').addEventListener('change', e => {
      const input = e.target, f = input.files && input.files[0];
      if (!f) return;
      input.value = '';
      if (f.size > 2 * 1024 * 1024) { showToast('存档文件不能超过 2MB', 'error'); return; }
      const r = new FileReader();
      r.onload = () => {
        try {
          const p = JSON.parse(r.result);
          if (!isRecord(p) || typeof p.activeTopicId !== 'string' || !p.activeTopicId.trim()) throw new Error('缺少有效的 activeTopicId');
          const normalized = normalizeState(p);
          if (autoRunning) cancelActiveAI();
          state = normalized;
          saveState(); renderAll(); showToast('存档已恢复');
        } catch (error) {
          console.warn('存档导入失败，当前状态未修改。', error);
          showToast('格式无效，当前存档未修改', 'error');
        }
      };
      r.onerror = () => showToast('存档读取失败，当前状态未修改', 'error');
      r.readAsText(f);
    });
    document.getElementById('btnResetTopic').addEventListener('click', () => { const t = getTopicDef(); document.getElementById('confirmMessage').textContent = `重置“${t.herb}”的 DIY 参数与实验数据？`; pendingConfirmAction = () => { delete state.topicStates[t.id]; saveState(); renderAll(); showToast('已重置', 'info'); }; const m = document.getElementById('confirmModal'); m.classList.remove('hidden'); m.classList.add('flex'); });
    document.getElementById('btnConfirmCancel').addEventListener('click', () => { const m = document.getElementById('confirmModal'); m.classList.add('hidden'); m.classList.remove('flex'); });
    document.getElementById('btnConfirmOk').addEventListener('click', () => { if (pendingConfirmAction) pendingConfirmAction(); const m = document.getElementById('confirmModal'); m.classList.add('hidden'); m.classList.remove('flex'); });
  }

  // ==================== 智谱 AI (Zhipu GLM) 接入与工作台全自动化调度引擎 ====================
  const QWEN_CFG_KEY = 'tcm_qwen_cfg_v1';
  let lastAIProviderLabel = '';
  let activeAIController = null;
  let autoRunning = false;
  let autoRequestSeq = 0;
  function cancelActiveAI() {
    autoRequestSeq += 1;
    if (activeAIController) activeAIController.abort();
    activeAIController = null;
    autoRunning = false;
  }
  try { localStorage.removeItem(QWEN_CFG_KEY); } catch (e) {}

  function getActiveQwenModel() { return lastAIProviderLabel || '智能设计助手'; }
  function isQwenReady() { return Boolean(window.TCMCloudAI); }

  function updateQwenStatusUI() {
    const capabilities = window.TCMCloudAI?.getCapabilities?.() || { qwen: true, workbuddy: false };
    const pill = document.getElementById('qwenStatusPill');
    const hdrLabel = document.getElementById('qwenHeaderBtnLabel');
    if (pill) {
      pill.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200';
      pill.textContent = '智能编排已就绪';
    }
    if (hdrLabel) hdrLabel.textContent = '智能助手';
  }

  async function callQwenAPI(messages, expectJson = false, options = {}) {
    if (!window.TCMCloudAI) throw new Error('云端服务暂不可用，已切换站内精编方案库');
    const result = await window.TCMCloudAI.complete({
      messages,
      expectJson,
      signal: options.signal,
      onProvider: (_provider, label) => {
        const stage = document.getElementById('qwenProgressStageText');
        if (stage) stage.textContent = `正在连接${label}...`;
      },
      onProgress: options.onProgress
    });
    lastAIProviderLabel = result.label;
    updateQwenStatusUI();
    return result.content;
  }

  function searchSiteKnowledge(prompt) { const q = String(prompt || '').trim(); const tokens = q.split(/[\s,，、。;；+＋/]+/).filter(s => s.length >= 2); const scoreText = (txt) => { const t = String(txt || ''); let sc = 0; if (q && t.includes(q)) sc += 5; tokens.forEach(tk => { if (t.includes(tk)) sc += 2; }); return sc; }; const topicMap = Object.assign({}, FEATURED_PRESETS || {}, state.customTopics || {}); const catExtra = Array.isArray(CATALOG_45) ? CATALOG_45 : []; const allTopics = Object.values(topicMap).concat(catExtra.filter(c => c && !topicMap[c.id])); const matchedTopics = allTopics.map(t => ({ item: t, score: scoreText([t.id, t.herb, t.compound, t.category, t.title, t.principle, t.routeSummary, (t.reagents || []).join(' ')].join(' ')) })).filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 6).map(x => ({ id: x.item.id, herb: x.item.herb, compound: x.item.compound, category: x.item.category, title: x.item.title, route: x.item.routeSummary || '', source: state.customTopics && state.customTopics[x.item.id] ? 'AI/自建题库' : '站内精编题库' })); const allLit = (Array.isArray(GLOBAL_LITERATURE) ? GLOBAL_LITERATURE : []).concat(state.extraGlobalRefs || []); const matchedLit = allLit.map(l => ({ item: l, score: scoreText((l.tag || '') + ' ' + (l.text || '')) })).filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 6).map(x => x.item); return { matchedTopics, matchedLit: matchedLit }; } function localSmartPlan(prompt) {
    const txt = prompt.trim();
    const allKnown = [...Object.values(FEATURED_PRESETS), ...CATALOG_45, ...Object.values(state.customTopics || {})];
    const normH = (h) => String(h || "").replace(/（.*?）|\(.*?\)/g, "").trim();
    const matched = allKnown.filter(Boolean).sort((a, b) => (b.herb || "").length - (a.herb || "").length)
      .find(x => txt.includes(x.herb) || (normH(x.herb).length >= 2 && txt.includes(normH(x.herb))) || (normH(x.herb).length >= 3 && txt.includes(normH(x.herb).slice(-2))) || (x.compound && txt.includes(x.compound.split(/[、/+（(]/)[0])));
    const isShortTime = /1小时|2小时|90分钟|快速|本科/.test(txt);
    const isNoToxic = /无毒|绿色|不用氯仿|无氯仿|水提|环保/.test(txt);
    const isVolatile = /挥发油|芳香|蒸馏|紫苏|薄荷|丁香|艾叶|肉桂|广藿香/.test(txt);
    const isUltra = /超声|低温|热敏|氧化|抗氧/.test(txt);
    const isCompare = /对照|对比|炮制|生.*炙|酒炙|醋炙/.test(txt);
    const isDouble = /双提|同步|多糖/.test(txt);

    const cleanedForHerb = txt.replace(/提取|分离|纯化|精制|检识|鉴定|萃取|蒸馏|研究|实验|设计|方案|工艺/g, '');
    let herb = matched ? matched.herb : (cleanedForHerb.match(/([一-龥]{2,4})(?:中|的|叶|根|皮|花|果|子|草)/)?.[1] || cleanedForHerb.match(/[一-龥]{2,6}/)?.[0] || '自定义药材');
    let compound = matched ? matched.compound : (isVolatile ? `${herb}挥发油与紫苏醛` : `${herb}总活性成分`);
    let category = matched ? matched.category : (isVolatile ? '挥发油与萜类' : isDouble ? '多糖类' : '黄酮');
    let rig = isVolatile ? 'steam' : isUltra || isShortTime ? 'ultrasound' : isNoToxic ? 'reflux' : (matched?.defaultRig || 'reflux');
    let ext = isVolatile ? 'steam' : isUltra || isShortTime ? 'ultrasound' : 'reflux';
    let sep = isVolatile ? 'freeze' : isNoToxic ? 'resin' : isDouble ? 'precip' : (matched?.defaultSep || 'resin');
    let timeMin = isShortTime ? 45 : (isVolatile ? 180 : 60);
    let tempC = isVolatile ? 100 : (isUltra ? 45 : 75);
    let solvent = isVolatile ? '纯化水' : (isNoToxic && /红花|多糖|黄芪/.test(txt) ? '纯化水（零有机溶剂）' : '70%乙醇');

    const basePreset = matched && FEATURED_PRESETS[matched.id] ? FEATURED_PRESETS[matched.id] : null;
    return {
      matchedId: basePreset ? basePreset.id : null,
      herb,
      compound,
      latin: basePreset?.latin || `《中国药典》收载药材 / AI 创新设计 (${herb})`,
      category,
      formalTitle: `${herb}中${compound.split('（')[0]}的${isNoToxic ? '绿色无毒' : ''}${isCompare ? '炮制对照' : ''}${isUltra ? '超声' : isVolatile ? '水蒸气蒸馏' : ''}提取分离与检识设计`,
      limitVal: basePreset?.limitVal || 1.0,
      limitUnit: basePreset?.limitUnit || (isVolatile ? '% (mL/g)' : '%'),
      mpRef: basePreset?.mpRef || '按标准品实测核对',
      origin: basePreset?.origin || `${herb}为本科院校常规实验室易于获取的中药材，适合开展绿色提取分离与多维检识综合设计。`,
      chemistry: basePreset?.chemistry || `目标成分为${compound}，结合其极性与热稳定性采用${solvent}高效溶出。`,
      pharmacopoeia: basePreset?.pharmacopoeia || `对标《中国药典》通则与含量限度要求，控制平行 3 批 RSD < 5%。`,
      integrative: `个性化实验延伸建议：围绕「${txt.slice(0, 36)}」需求，采用本科常规设备（${rig === 'steam' ? '挥发油测定器' : rig === 'ultrasound' ? '超声波清洗机+大孔树脂' : '回流装置+分液漏斗'}）即可落地；${isNoToxic ? '全程规避氯仿等高毒溶剂；' : ''}${isCompare ? '建议平行设立对照实验组并用 TLC/UV 量化差异；' : ''}可进一步拓展抗氧化/经皮递药评价。`,
      defaultRig: rig,
      defaultExtract: ext,
      defaultSep: sep,
      cfg: {
        mass: isShortTime ? 30 : 50,
        ratio: isVolatile ? 10 : 12,
        temp: tempC,
        time: timeMin,
        mesh: isVolatile ? '切段/粗粉(10~20目)' : '中粉(40目)',
        cycles: isShortTime ? '1' : '2',
        solventType: solvent,
        ph: isNoToxic ? '中性 7.0' : (basePreset?.defaultCfg?.ph || '中性 7.0')
      },
      tlcSystem: basePreset?.tlcSystem || `硅胶 G 板，按《中国药典》${herb}项下展开剂与对照品同板对照。`,
      steps: basePreset?.steps || [
        { stage: '提取', title: `${solvent}${rig === 'steam' ? '水蒸气蒸馏' : rig === 'ultrasound' ? '低温超声提取' : '加热回流提取'}`, principle: `依据${isVolatile ? '道尔顿分压定律' : '菲克第一扩散定律'}，在 ${tempC}℃ 下 ${timeMin} min 高效溶出目标成分。`, qc: `控制温度 ${tempC}℃，避免有效成分热降解。` },
        { stage: '分离', title: `${sep === 'resin' ? '大孔吸附树脂梯度除杂' : sep === 'freeze' ? '盐析脱水与低温析晶' : '醇沉/液-液萃取分离'}`, principle: '利用极性或溶解度差异除去糖类、色素与鞣质杂质。', qc: '收集目标流分并监测色带变化。' },
        { stage: '纯化', title: '减压浓缩与重结晶/干燥精制', principle: '低温回收溶剂获得高纯度精制品，核算收率与精制率。', qc: '平行 3 批操作，要求 RSD < 5%。' },
        { stage: '检识', title: '特征显色反应 + TLC 对照检识', principle: '理化显色结合硅胶薄层比移值 Rf 确证成分结构。', qc: '|ΔRf| ≤ 0.03，斑点清晰无拖尾。' }
      ],
      sop: basePreset?.sop || [
        `称取${herb}${isShortTime ? '30g' : '50g'}并按料液比配制${solvent}`,
        `组装${rig === 'steam' ? '水蒸气蒸馏' : rig === 'ultrasound' ? '超声提取' : '加热回流'}装置，控温${tempC}℃提取${timeMin} min`,
        `抽滤合并提取液并执行${sep === 'resin' ? '大孔树脂纯化' : sep === 'freeze' ? '盐析脱水析晶' : '分级分离'}`,
        '减压浓缩干燥称重，录入第5步计算3批收率与RSD',
        '完成特征化学显色、TLC点板对照并导出第6步实验报告'
      ],
      troubleshoot: basePreset?.troubleshoot || [{ issue: '收率低于预期', cause: '药材粉碎过粗或提取时间偏短。', fix: '适当减小粒度并补做一次短时复提。' }],
      chemTests: basePreset?.chemTests || [{ name: '特征化学显色反应阳性', passed: true }, { name: 'TLC 对照品同位置清晰单斑', passed: true }],
      aiAdvice: `已为你按「${isShortTime ? '本科课时高效落地' : '高校常规实验标准'}${isNoToxic ? ' + 绿色无毒溶剂' : ''}」原则自动规划「${herb} · ${compound}」全套方案，并同步写入左侧参数单、动态装置与报告模板。已同步写入左侧配置单、动态装置与报告框架，可直接微调参数继续完善。`
    };
  }

  /* ============ AI 实验设计方案 · 全景展示渲染 ============ */
  function aiEsc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function aiArr(v) { return Array.isArray(v) ? v.filter(x => x != null) : []; }
  function aiTxt(v, fb) { return (v == null || String(v).trim() === '') ? (fb || '') : String(v); }
  function aiRefText(r) {
    if (r == null) return '';
    if (typeof r === 'string') return r;
    return aiTxt(r.text, aiTxt(r.title, aiTxt(r.name, '')));
  }
  function aiSopText(x) {
    if (x == null) return '';
    if (typeof x === 'string') return x;
    return aiTxt(x.text, aiTxt(x.step, aiTxt(x.title, '')));
  }
  function aiStepDerived(plan, st, i, rig, ws) {
    const cfg = plan.cfg || {};
    const rigTitle = (typeof LAB_RIGS !== 'undefined' && LAB_RIGS[rig]) ? LAB_RIGS[rig].title : rig;
    const durDefault = Number(ws.time || cfg.time || 60) + ' min';
    return {
      stage: aiTxt(st.stage, ['提取', '分离', '纯化', '检识'][i] || ('阶段 ' + (i + 1))),
      title: aiTxt(st.title, '实验步骤 ' + (i + 1)),
      principle: aiTxt(st.principle, '依据目标成分理化性质实现该阶段分离富集。'),
      operation: aiTxt(st.operation || st.detail || st.howto, ''),
      reagents: aiTxt(st.reagents || st.reagent, ''),
      apparatus: aiTxt(st.apparatus || st.device, ''),
      duration: aiTxt(st.duration || st.time, ''),
      qc: aiTxt(st.qc || st.quality, '按《中国药典》通则控制平行 3 批 RSD < 5%。'),
      rigTitle: rigTitle,
      durDefault: durDefault,
      solvent: aiTxt(ws.solventType || cfg.solventType, '70%乙醇')
    };
  }

  function renderAiPlanShowcase(plan, meta) {
    const mount = document.getElementById('aiPlanMount');
    const box = document.getElementById('aiPlanShowcase');
    if (!mount || !box) return;
    const rig = meta.rig, ws = meta.ws || {}, rag = meta.ragCtx || {};
    const usedAI = !!meta.usedRealQwen;
    const steps = aiArr(plan.steps).filter(x => typeof x === 'object');
    const derived = steps.map((st, i) => aiStepDerived(plan, st, i, rig, ws));
    const herb = aiTxt(plan.herb, '自定义药材');
    const compound = aiTxt(plan.compound, '目标活性成分');
    const category = aiTxt(plan.category, '中药化学');
    const title = aiTxt(plan.formalTitle, herb + '中' + compound + '的提取分离与检识实验设计');
    const rigTitle = (typeof LAB_RIGS !== 'undefined' && LAB_RIGS[rig]) ? LAB_RIGS[rig].title : rig;
    const cfg = plan.cfg || {};
    const mass = aiTxt(ws.mass || cfg.mass, '50'), ratio = aiTxt(ws.ratio || cfg.ratio, '10'), temp = aiTxt(ws.temp || cfg.temp, '75'), time = aiTxt(ws.time || cfg.time, '60');
    const solvent = aiTxt(ws.solventType || cfg.solventType, '70%乙醇'), ph = aiTxt(ws.ph || cfg.ph, '中性 7.0');
    const innovation = aiTxt(plan.innovation, aiTxt(plan.integrative, '本方案结合站内题库与文献，围绕「' + herb + ' · ' + compound + '」在本科常规实验室条件下完成绿色、可重复的提取分离与多维检识设计。'));

    // 流程节点：准备 → 各工艺步骤 → 报告
    const nodes = [{
      stage: '准备', title: '药材前处理与称量', meta: mass + 'g · ' + aiTxt(ws.mesh || cfg.mesh, '中粉(40目)'),
      detail: '将' + herb + '净选、干燥、粉碎至' + aiTxt(ws.mesh || cfg.mesh, '中粉(40目)') + '，精密称取 ' + mass + ' g，按料液比 1:' + ratio + ' 加入' + solvent + '（' + ph + '）预浸润，备用。'
    }].concat(derived.map((d, i) => ({
      stage: d.stage, title: d.title, meta: (d.duration || d.durDefault) + ' · ' + (i === 0 ? temp + '℃' : '按质控执行'),
      detail: (d.operation || d.principle) + (d.qc ? '　【质控】' + d.qc : '')
    }))).concat([{
      stage: '报告', title: '数据整理与报告导出', meta: '3 批收率 / RSD / TLC',
      detail: '录入 3 批粗提物与精制品质量，计算收率、精制率与 RSD，完成 TLC 比移值对照与显色检识记录，勾选章节后一键导出 A4 实验报告或高清长图。'
    }]);

    const kpiChips = [
      ['投料量', mass + ' g'], ['料液比', '1:' + ratio], ['提取溶剂', solvent],
      ['温度', temp + ' ℃'], ['时长', time + ' min'], ['pH', ph], ['装置', rigTitle]
    ];

    const bankList = aiArr(rag.matchedTopics);
    const litList = aiArr(rag.matchedLit);
    const aiRefs = aiArr(plan.recommendedRefs).concat(aiArr(plan.citedLiterature));
    const citedBank = aiArr(plan.citedBank);

    const html = `
      <div class="ai-sc-hero text-white px-5 py-5 sm:px-7 sm:py-6">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/12 border border-white/20 text-[10px] font-bold tracking-widest text-emerald-200">
              <span class="ai-live-dot"></span> 本草智研 · 实验方案全景解读
            </div>
            <h2 class="text-lg sm:text-2xl font-extrabold mt-2.5 leading-snug">${aiEsc(title)}</h2>
            <p class="text-[11px] sm:text-xs text-teal-100/90 mt-1.5">${aiEsc(herb)} · ${aiEsc(compound)} · ${aiEsc(category)} ｜ 由 ${usedAI ? '智能设计助手' : '本草智研精编库'} 生成</p>
          </div>
          <div class="no-print flex gap-1.5 shrink-0">
            <button type="button" id="aiCopyPlan" class="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-[11px] font-bold transition">复制方案全文</button>
            <button type="button" id="aiHidePlan" class="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-[11px] font-bold transition">收起</button>
          </div>
        </div>
        <div class="flex flex-wrap gap-1.5 mt-4">
          ${kpiChips.map(c => `<span class="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-[10px] sm:text-[11px] font-bold text-white">${aiEsc(c[0])} <span class="text-emerald-200">${aiEsc(c[1])}</span></span>`).join('')}
        </div>
        <div class="flex flex-wrap gap-1.5 mt-3">
          ${[['1', '创新设计'], ['2', '流程图'], ['3', '步骤详解'], ['4', 'SOP 规程'], ['5', '文献题库'], ['6', '排障结论']].map(x => `<button type="button" data-ai-sec="${x[0]}" class="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/25 border border-white/15 text-[10px] font-bold text-white/95 transition">${x[0]}. ${x[1]}</button>`).join('')}
        </div>
      </div>

      <div id="aiInsightBody" class="p-4 sm:p-6 space-y-6">

        <div id="aiSec1" class="ai-sec-anchor">
          <div class="ai-sec-title"><span class="ai-sec-idx">1</span>创新设计说明</div>
          <div class="ai-innov text-[12px] sm:text-[13px] text-amber-950 leading-relaxed"><strong class="text-amber-900">✦ 设计亮点：</strong>${aiEsc(innovation)}</div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2.5">
            ${[
              ['基原与性味', plan.origin], ['核心理化性质', plan.chemistry],
              ['药典质控要求', plan.pharmacopoeia], ['薄层检识系统', plan.tlcSystem]
            ].map(x => `<div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200"><div class="text-[10px] font-extrabold text-[#0f5c54] mb-1">${aiEsc(x[0])}</div><div class="text-[12px] text-slate-600 leading-relaxed">${aiEsc(aiTxt(x[1], '按《中国药典》及课程要求执行。'))}</div></div>`).join('')}
          </div>
        </div>

        <div id="aiSec2" class="ai-sec-anchor">
          <div class="ai-sec-title"><span class="ai-sec-idx">2</span>动态实验流程图 <span class="ai-scroll-hint font-normal">· 点击任一节点查看该步操作</span></div>
          <div class="ai-flow-wrap">
            <div class="ai-flow">
              ${nodes.map((n, i) => `${i ? '<div class="ai-flow-arrow"></div>' : ''}<button type="button" data-ai-node="${i}" class="ai-flow-node ${i === 0 ? 'active' : ''}" style="animation-delay:${(i * 0.14).toFixed(2)}s"><span class="ai-n-num">${i + 1}</span><div class="ai-n-stage">${aiEsc(n.stage)}</div><div class="ai-n-title">${aiEsc(n.title)}</div><div class="ai-n-meta">${aiEsc(n.meta)}</div></button>`).join('')}
            </div>
          </div>
          <div id="aiNodeDetail" class="mt-2 p-3.5 rounded-2xl border border-teal-200 bg-teal-50/50 text-[12px] text-slate-700 leading-relaxed"></div>
        </div>

        <div id="aiSec3" class="ai-sec-anchor">
          <div class="ai-sec-title"><span class="ai-sec-idx">3</span>实验步骤详解 <span class="ai-scroll-hint font-normal">· 原理 / 操作方法 / 试剂仪器 / 质控</span></div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
            ${derived.map((d, i) => `
              <div class="ai-step-card" id="aiStepCard${i}">
                <div class="ai-step-hd"><span class="ai-step-badge">${i + 1}</span><div class="min-w-0"><div class="text-[10px] font-extrabold text-[#0f7a68]">${aiEsc(d.stage)}</div><div class="text-[12px] sm:text-[13px] font-extrabold text-slate-900 leading-snug">${aiEsc(d.title)}</div></div></div>
                <div class="ai-kv"><span class="ai-k">化学原理</span><span class="ai-v">${aiEsc(d.principle)}</span></div>
                <div class="ai-kv"><span class="ai-k">操作方法</span><span class="ai-v">${aiEsc(d.operation || ('按「' + d.title + '」执行：' + d.principle + ' 全程控温 ' + temp + ' ℃，控时 ' + (d.duration || d.durDefault) + '，' + d.qc))}</span></div>
                <div class="ai-kv"><span class="ai-k">试剂用量</span><span class="ai-v">${aiEsc(d.reagents || (solvent + '（料液比 1:' + ratio + '，' + ph + '），投料 ' + mass + ' g'))}</span></div>
                <div class="ai-kv"><span class="ai-k">仪器设备</span><span class="ai-v">${aiEsc(d.apparatus || (d.rigTitle + '、分析天平、抽滤装置、旋转蒸发仪、硅胶 G 薄层板'))}</span></div>
                <div class="ai-kv"><span class="ai-k">时长 / 质控</span><span class="ai-v"><strong class="text-[#0f5c54]">${aiEsc(d.duration || d.durDefault)}</strong> ｜ ${aiEsc(d.qc)}</span></div>
              </div>`).join('')}
          </div>
        </div>

        <div id="aiSec4" class="ai-sec-anchor">
          <div class="ai-sec-title"><span class="ai-sec-idx">4</span>标准操作规程 SOP <span class="ai-scroll-hint font-normal">· 可按实验进度逐条勾选</span></div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${(aiArr(plan.sop).length ? aiArr(plan.sop) : ['药材前处理与称量', '按设定参数组装装置并提取', '分离纯化富集目标成分', '浓缩干燥称重并计算收率', '显色反应与 TLC 对照检识', '整理数据并导出实验报告']).map((x, i) => `<label class="ai-sop-item cursor-pointer"><span class="ai-sop-no">${i + 1}</span><input type="checkbox" data-ai-sop="${i}" class="mt-1 accent-[#0a3630]" /><span class="text-[12px] text-slate-700 flex-1">${aiEsc(aiSopText(x))}</span></label>`).join('')}
          </div>
        </div>

        <div id="aiSec5" class="ai-sec-anchor">
          <div class="ai-sec-title"><span class="ai-sec-idx">5</span>题库与文献参考 <span class="ai-scroll-hint font-normal">· 站内检索 + AI 推荐</span></div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
              <div class="text-[11px] font-extrabold text-[#0f5c54] mb-1.5">站内精编题库引用 ${citedBank.length ? '· AI 指定引用 ' + citedBank.length + ' 项' : ''}</div>
              ${(citedBank.length ? citedBank.slice(0, 4).map(x => `<div class="ai-ref-item ai-ref-rec mb-1.5">✦ ${aiEsc(aiRefText(x))} <span class="text-[10px] text-amber-700 font-bold">（AI 指定）</span></div>`) : '')}
              ${(bankList.length ? bankList.slice(0, 4).map(x => `<div class="ai-ref-item mb-1.5">📚 ${aiEsc(aiTxt(x.title, aiTxt(x.herb, '站内课题')))} <span class="text-[10px] text-slate-400">· ${aiEsc(aiTxt(x.source, '站内精编题库'))}</span></div>`).join('') : '<div class="ai-ref-item mb-1.5 text-slate-400">本次为全新课题，AI 已将其作为创新课题收录进网站题库。</div>')}
            </div>
            <div>
              <div class="text-[11px] font-extrabold text-[#0f5c54] mb-1.5">文献参考（GB/T 7714 格式）</div>
              ${(aiRefs.length ? aiRefs.slice(0, 4).map(x => `<div class="ai-ref-item ai-ref-rec mb-1.5">📖 ${aiEsc(aiRefText(x))} <span class="text-[10px] text-amber-700 font-bold">· AI 推荐</span></div>`).join('') : '')}
              ${((() => { const _s = new Set(aiRefs.slice(0, 4).map(x => aiRefText(x).slice(0, 16))); const _f = litList.filter(x => !_s.has(aiTxt(x.text, aiRefText(x)).slice(0, 16))); return _f.length ? _f.slice(0, 4).map(x => `<div class="ai-ref-item mb-1.5">📄 ${aiEsc(aiTxt(x.text, aiRefText(x)))} <span class="text-[10px] text-slate-400">· ${aiEsc(aiTxt(x.tag, '站内文献库'))}</span></div>`).join('') : (!aiRefs.length ? '<div class="ai-ref-item mb-1.5 text-slate-400">可在右侧「文献库」按 GB/T 7714 录入参考文献。</div>' : ''); })())}
            </div>
          </div>
        </div>

        <div id="aiSec6" class="ai-sec-anchor">
          <div class="ai-sec-title"><span class="ai-sec-idx">6</span>异常排障 · 预期结论 · 导师点评</div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
              <div class="text-[11px] font-extrabold text-amber-800 mb-1.5">⚠ 常见异常与对策</div>
              ${(aiArr(plan.troubleshoot).length ? aiArr(plan.troubleshoot).slice(0, 4).map(tr => `<div class="ai-trouble mb-1.5"><strong>${aiEsc(aiTxt(tr.issue, '异常'))}</strong>：${aiEsc(aiTxt(tr.cause, ''))} <span class="text-[#0f5c54] font-bold">→ ${aiEsc(aiTxt(tr.fix, '按质控要点复核'))}</span></div>`).join('') : '<div class="ai-trouble">收率偏低时优先核查药材粒度、料液比与提取温度；TLC 拖尾可在展开剂中加入 0.5%~1% 甲酸抑制解离。</div>')}
            </div>
            <div class="space-y-2">
              <div class="ai-concl"><div class="font-extrabold text-emerald-200 mb-1 text-[11px]">📊 预期结果与工艺讨论</div>${aiEsc(aiTxt(plan.aiConclusion || plan.discussion || plan.expectedYield, '按 ' + mass + ' g 投料、' + solvent + ' 于 ' + temp + ' ℃ 提取 ' + time + ' min，预期获得足量粗提物与精制品；以 3 批平行数据核算收率与 RSD（要求 < 5%），并结合 TLC/UV 完成结构确证。'))}</div>
              <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[12px] text-slate-700 leading-relaxed"><strong class="text-[#0a3630]">👩‍🏫 导师点评：</strong>${aiEsc(aiTxt(plan.aiAdvice, '注意全程通风、佩戴护目镜；有机溶剂远离明火，废液分类回收。'))}</div>
            </div>
          </div>
        </div>

        <div class="no-print flex flex-wrap gap-2 pt-1 border-t border-slate-100">
          <button type="button" data-qwen-jump="3" class="px-3 py-1.5 rounded-xl bg-[#0a3630] text-white text-[11px] font-bold hover:bg-[#062420] transition">查看第 3 步原理与方案 →</button>
          <button type="button" data-qwen-jump="4" class="px-3 py-1.5 rounded-xl bg-white border border-teal-200 text-[#0f5c54] text-[11px] font-bold hover:bg-teal-50 transition">查看第 4 步动态装置 →</button>
          <button type="button" data-qwen-jump="6" class="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold hover:bg-amber-100 transition">直达第 6 步预览报告 →</button>
          <button type="button" id="aiOpenBank2" class="ml-auto px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition">📚 查看已更新题库</button>
        </div>
      </div>`;

    mount.innerHTML = html; box.dataset.topicId = state.activeTopicId;
    box.classList.remove('hidden');

    // 流程节点联动
    const detail = document.getElementById('aiNodeDetail');
    const setNode = (i) => {
      const n = nodes[i] || nodes[0];
      if (detail) detail.innerHTML = `<div class="font-extrabold text-[#0a3630] mb-1">步骤 ${i + 1} · ${aiEsc(n.stage)} — ${aiEsc(n.title)} <span class="text-[10px] font-normal text-slate-500">（${aiEsc(n.meta)}）</span></div><div>${aiEsc(n.detail)}</div>`;
      mount.querySelectorAll('[data-ai-node]').forEach(b => b.classList.toggle('active', Number(b.dataset.aiNode) === i));
    };
    setNode(0);
    mount.querySelectorAll('[data-ai-node]').forEach(b => b.addEventListener('click', () => {
      const i = Number(b.dataset.aiNode); setNode(i);
      const card = document.getElementById('aiStepCard' + (i - 1));
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }));
    // 按钮绑定
    const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.onclick = fn; };
    bind('aiCopyPlan', () => copyText(mount.innerText, '已复制 AI 实验方案全文'));
    mount.querySelectorAll('[data-ai-sec]').forEach(b => b.addEventListener('click', () => {
      const el = document.getElementById('aiSec' + b.dataset.aiSec);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
    bind('aiHidePlan', () => { const bd = document.getElementById('aiInsightBody'); const btn = document.getElementById('aiHidePlan'); if (!bd) return; const c = bd.classList.toggle('hidden'); if (btn) btn.textContent = c ? '展开' : '收起'; });
    bind('aiOpenBank2', () => openRightDrawer('bank'));
    mount.querySelectorAll('[data-qwen-jump]').forEach(b => b.addEventListener('click', () => {
      if (autoRunning) cancelActiveAI();
      state.step = Number(b.dataset.qwenJump); saveState(); renderAll();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }));
    mount.querySelectorAll('[data-ai-sop]').forEach(chk => chk.addEventListener('change', () => {
      chk.parentElement.querySelector('span:last-child').style.textDecoration = chk.checked ? 'line-through' : '';
    }));
    try { box.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
  }

  function safeAIString(value, max = 4000) {
    if (value === null || value === undefined) return '';
    return String(value).replace(/[&<>"']/g, (ch) => ({ '&': '＆', '<': '＜', '>': '＞', '"': '＂', "'": '＇' })[ch]).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
  }
  function finiteNumber(value, fallback, min, max) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
  }
  function normalizeAiPlan(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('AI 返回方案不是有效对象');
    const out = { matchedId: /^[a-zA-Z0-9_-]+$/.test(raw.matchedId || '') ? raw.matchedId : null, isNewTopic: raw.isNewTopic === true };
    const textKeys = ['herb', 'compound', 'latin', 'category', 'formalTitle', 'limitUnit', 'mpRef', 'origin', 'chemistry', 'pharmacopoeia', 'integrative', 'innovation', 'aiConclusion', 'aiAdvice', 'tlcSystem', 'principle', 'mechanism', 'expectedYield', 'rigAnalysis'];
    textKeys.forEach((key) => { out[key] = safeAIString(raw[key], key === 'herb' || key === 'compound' ? 160 : 5000); });
    out.herb = out.herb || '自定义药材';
    out.compound = out.compound || '目标活性成分';
    out.category = out.category || '黄酮';
    out.limitVal = finiteNumber(raw.limitVal, 1, 0, 1000);
    const requestedRig = raw.defaultRig === 'funnel' ? 'extract' : raw.defaultRig;
    out.defaultRig = Object.prototype.hasOwnProperty.call(LAB_RIGS, requestedRig) ? requestedRig : 'reflux';
    out.applicableRigs = (Array.isArray(raw.applicableRigs) ? raw.applicableRigs : []).map(r => canonicalRigKey(r, '')).filter(Boolean).slice(0, 4);
    if (!out.applicableRigs.includes(out.defaultRig)) out.applicableRigs.unshift(out.defaultRig);
    if (raw.tlcDefault && typeof raw.tlcDefault === 'object') {
      out.tlcDefault = { front: finiteNumber(raw.tlcDefault.front, 8.0, 2, 15), sample: finiteNumber(raw.tlcDefault.sample, 4.0, 0.5, 14), ref: finiteNumber(raw.tlcDefault.ref, 4.1, 0.5, 14) };
    }
    if (Array.isArray(raw.sampleBatches) && raw.sampleBatches.length) {
      out.sampleBatches = raw.sampleBatches.slice(0, 3).map(b => ({
        mass: finiteNumber(b.mass, out.cfg?.mass || 50, 1, 5000),
        crude: finiteNumber(b.crude, 0.85, 0.01, 500),
        refined: finiteNumber(b.refined, 0.62, 0.01, 500),
        mp: finiteNumber(b.mp, 0, 0, 450)
      }));
    }
    const extracts = ['steam', 'reflux', 'soxhlet', 'ultrasound', 'acid_water', 'boil_enzyme'];
    const separations = ['freeze', 'acid_precip', 'salting_out', 'resin', 'extract', 'column', 'precip'];
    out.defaultExtract = extracts.includes(raw.defaultExtract) ? raw.defaultExtract : '';
    out.defaultSep = separations.includes(raw.defaultSep) ? raw.defaultSep : '';
    const cfg = raw.cfg && typeof raw.cfg === 'object' ? raw.cfg : {};
    out.cfg = {
      mass: finiteNumber(cfg.mass, 50, 1, 5000), ratio: finiteNumber(cfg.ratio, 10, 1, 100),
      temp: finiteNumber(cfg.temp, 75, 0, 200), time: finiteNumber(cfg.time, 60, 1, 1440),
      mesh: safeAIString(cfg.mesh, 80) || '中粉(40目)', cycles: String(Math.round(finiteNumber(cfg.cycles, 2, 1, 3))),
      solventType: safeAIString(cfg.solventType, 100) || '70%乙醇', ph: safeAIString(cfg.ph, 80) || '中性 7.0'
    };
    out.steps = (Array.isArray(raw.steps) ? raw.steps : []).filter((s) => s && typeof s === 'object' && !Array.isArray(s)).slice(0, 8).map((s) => {
      const step = {};
      ['stage', 'title', 'principle', 'operation', 'reagents', 'apparatus', 'duration', 'qc'].forEach((key) => { step[key] = safeAIString(s[key], 5000); });
      if (Array.isArray(s.subBranches)) {
        step.subBranches = s.subBranches.filter(b => b && typeof b === 'object').slice(0, 4).map(b => ({
          name: safeAIString(b.name || b.title, 120),
          detail: safeAIString(b.detail || b.action, 400),
          biliKw: safeAIString(b.biliKw, 40)
        })).filter(b => b.name);
      }
      return step;
    });
    const stringArray = (value, maxItems = 12) => (Array.isArray(value) ? value : []).filter((x) => typeof x === 'string' || typeof x === 'number').slice(0, maxItems).map((x) => safeAIString(x, 2000)).filter(Boolean);
    out.sop = stringArray(raw.sop, 16);
    out.recommendedRefs = stringArray(raw.recommendedRefs, 8);
    out.citedBank = stringArray(raw.citedBank, 12);
    out.citedLiterature = stringArray(raw.citedLiterature, 12);
    out.troubleshoot = (Array.isArray(raw.troubleshoot) ? raw.troubleshoot : []).filter((x) => x && typeof x === 'object').slice(0, 10).map((x) => ({ issue: safeAIString(x.issue, 1000), cause: safeAIString(x.cause, 2000), fix: safeAIString(x.fix, 2000) }));
    out.chemTests = (Array.isArray(raw.chemTests) ? raw.chemTests : []).filter((x) => x && typeof x === 'object').slice(0, 12).map((x) => ({ name: safeAIString(x.name, 300) || '特征检识', passed: x.passed === true }));
    const spectra = raw.spectra && typeof raw.spectra === 'object' ? raw.spectra : {};
    out.spectra = { chapter: safeAIString(spectra.chapter, 500), uv: safeAIString(spectra.uv, 3000), nmr: safeAIString(spectra.nmr, 3000) };
    return out;
  }

  function applyAiPlanToWorkbench(plan, usedRealQwen, ragCtx) {
    const validRigs = Object.keys(LAB_RIGS);
    const rig = validRigs.includes(plan.defaultRig) ? plan.defaultRig : 'reflux';
    const existingCustom = Object.entries(state.customTopics).find(([, item]) => item && item.herb === plan.herb && item.compound === plan.compound);
    let targetId = plan.matchedId && FEATURED_PRESETS[plan.matchedId] ? plan.matchedId : (existingCustom ? existingCustom[0] : null);

    const createdNewDraft = !targetId || plan.isNewTopic === true;
    if (createdNewDraft) {
      targetId = 'draft_ai_' + Date.now();
      // 严禁自动污染题库！新生成的 AI 方案仅作为本次临时会话草稿，必须由用户主动申请 AI 审核 ≥ 90 分后才可编入
      state.sessionDraftTopic = {
        id: targetId,
        herb: plan.herb || '自定义药材',
        compound: plan.compound || '目标活性成分',
        latin: plan.latin || 'AI 辅助设计基原',
        category: plan.category || '黄酮',
        isCustom: true, isAiGenerated: true, isDraft: true, spectra: plan.spectra || null,
        defaultRig: rig,
        applicableRigs: plan.applicableRigs && plan.applicableRigs.length ? plan.applicableRigs : [rig, 'rotavap', 'filter'],
        defaultExtract: plan.defaultExtract || (rig === 'steam' ? 'steam' : rig === 'ultrasound' ? 'ultrasound' : 'reflux'),
        defaultSep: plan.defaultSep || 'resin',
        formulas: rig === 'steam' ? ['distill', 'diffusion', 'qc'] : ['henderson', 'diffusion', 'qc'],
        defaultCfg: Object.assign({ mass: 50, ratio: 10, temp: 75, time: 60, mesh: '中粉(40目)', cycles: '2', solventType: '70%乙醇', ph: '中性 7.0' }, plan.cfg || {}),
        limitVal: Number(plan.limitVal) || 1.0,
        limitUnit: plan.limitUnit || '%',
        crudeUnit: rig === 'steam' ? 'mL' : 'g',
        mpRef: plan.mpRef || '按标准品实测核对',
        origin: plan.origin || `${plan.herb}（AI 临时演练草稿）。`,
        chemistry: plan.chemistry || `核心成分：${plan.compound}。`,
        pharmacopoeia: plan.pharmacopoeia || `参考限度 ≥ ${Number(plan.limitVal) || 1.0}%。`,
        integrative: plan.integrative || plan.aiAdvice || '',
        scaling: { auxName: '分离纯化辅料', auxFactor: 0.30, auxUnit: 'g', yieldLow: 0.01, yieldHigh: 0.025, yieldUnit: rig === 'steam' ? 'mL' : 'g' },
        tlcSystem: plan.tlcSystem || `硅胶 G 板，按《中国药典》${plan.herb}项下展开剂对照。`,
        tlcDefault: plan.tlcDefault || { front: 8.0, sample: 4.1, ref: 4.2 },
        steps: Array.isArray(plan.steps) && plan.steps.length ? plan.steps : [
          { stage: '提取', title: '目标成分高效提取', principle: '依据菲克第一扩散定律优化传质。', qc: '控温防降解。' },
          { stage: '分离', title: '杂质去除与富集', principle: '按极性与酸碱性差异实现分离。', qc: '收集目标部位。' },
          { stage: '纯化', title: '浓缩精制与干燥', principle: '低温回收溶剂得精制品。', qc: '平行 3 批 RSD < 5%。' },
          { stage: '检识', title: '理化显色与 TLC 检识', principle: '显色反应叠加 TLC 对照。', qc: '|ΔRf| ≤ 0.03。' }
        ],
        troubleshoot: Array.isArray(plan.troubleshoot) && plan.troubleshoot.length ? plan.troubleshoot : [{ issue: '收率偏低', cause: '提取时间或溶剂比例不足。', fix: '适当提高料液比或增加提取次数。' }],
        sop: Array.isArray(plan.sop) && plan.sop.length ? plan.sop : ['药材前处理称量', '按设定参数提取', '分离纯化富集', '浓缩干燥计收率', '显色与TLC检识'],
        chemTests: Array.isArray(plan.chemTests) && plan.chemTests.length ? plan.chemTests : [{ name: '特征化学显色阳性', passed: true }, { name: 'TLC 对照品单斑一致', passed: true }],
        demoBatches: plan.sampleBatches && plan.sampleBatches.length ? plan.sampleBatches : [{ mass: Number(plan.cfg?.mass) || 50, crude: 0.85, refined: 0.62, mp: 0 }, { mass: Number(plan.cfg?.mass) || 50, crude: 0.91, refined: 0.66, mp: 0 }, { mass: Number(plan.cfg?.mass) || 50, crude: 0.88, refined: 0.64, mp: 0 }]
      };
    } else {
      state.sessionDraftTopic = null;
    }

    state.activeTopicId = targetId;
    const ws = getWorkState(getTopicDef());
    if (plan.formalTitle) ws.formalTitle = plan.formalTitle;
    ws.trackId = 'optimization';
    ws.activeRig = rig; ws.reportRig = rig;
    if (plan.defaultExtract) ws.diyExtract = plan.defaultExtract;
    if (plan.defaultSep) ws.diySeparate = plan.defaultSep;
    if (plan.integrative || plan.aiAdvice) ws.diyNotes = `[智能方案] ${plan.aiAdvice || plan.integrative}`;
    if (plan.cfg) {
      Object.assign(ws, {
        mass: Number(plan.cfg.mass) || ws.mass,
        ratio: Number(plan.cfg.ratio) || ws.ratio,
        temp: Number(plan.cfg.temp) || ws.temp,
        time: Number(plan.cfg.time) || ws.time,
        mesh: plan.cfg.mesh || ws.mesh,
        cycles: String(plan.cfg.cycles || ws.cycles),
        solventType: plan.cfg.solventType || ws.solventType,
        ph: plan.cfg.ph || ws.ph
      });
    }
    if (plan.tlcDefault) ws.tlc = { ...plan.tlcDefault };
    if (plan.sampleBatches && plan.sampleBatches.length) ws.batches = plan.sampleBatches.map(b => ({ ...b }));
    if (plan.aiConclusion) ws.aiConclusion = plan.aiConclusion;
    if (Array.isArray(plan.recommendedRefs)) { plan.recommendedRefs.slice(0, 3).forEach(r => { if (r && !state.extraGlobalRefs.some(x => x.text === r)) state.extraGlobalRefs.unshift({ tag: 'AI推荐', text: r, url: '' }); }); }
    saveState();
    renderAll();

    // Render automation receipt
    const rec = document.getElementById('qwenExecReceipt');
    if (rec) {
      rec.classList.remove('hidden');
      document.getElementById('qwenReceiptTitle').textContent = `${usedRealQwen ? '智能设计助手' : '本草智研精编库'} · 已完成本次无痕推演`;
      const bankBadge = document.getElementById('qwenBankStatusBadge');
      if (bankBadge) {
        bankBadge.textContent = createdNewDraft ? '临时草稿（未编入题库 · 刷新即清空）' : '已匹配权威题库';
      }
      // 注入用户自主决定「申请 AI 90 分审核并编入」入口按钮
      let reviewBtn = document.getElementById('btnApplyAiReviewFromReceipt');
      const bankBtn = document.getElementById('btnOpenBankFromReceipt');
      if (!reviewBtn && bankBtn && bankBtn.parentElement) {
        reviewBtn = document.createElement('button');
        reviewBtn.id = 'btnApplyAiReviewFromReceipt';
        reviewBtn.type = 'button';
        reviewBtn.className = 'px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-extrabold transition shadow-xs';
        reviewBtn.textContent = '🛡️ 申请 AI 90分审核编入自编库';
        reviewBtn.addEventListener('click', () => {
          if (window.TCM_AI_REVIEW && window.TCM_AI_REVIEW.open) window.TCM_AI_REVIEW.open(getTopicDef());
        });
        bankBtn.parentElement.insertBefore(reviewBtn, bankBtn);
      }
      if (reviewBtn) reviewBtn.classList.toggle('hidden', !createdNewDraft);
      document.getElementById('qwenReceiptAdvice').textContent = plan.aiAdvice || plan.integrative || `已为你生成「${plan.herb} · ${plan.compound}」临时演练方案（刷新自动重置；如需收录进 AI 自编库，请主动点击上方「申请 AI 90分审核编入」）。`;
      const checks = [
        `✓ 锁定课题：${plan.herb} · ${plan.compound}`,
        `✓ 写入左侧参数：${ws.mass}g / ${ws.solventType} / ${ws.temp}℃ / ${ws.time}min`,
        `✓ 切换动态装置：${({ ultrasound: '超声提取装置', steam: '水蒸气蒸馏装置', reflux: '热回流提取装置', extract: '液-液萃取装置', soxhlet: '索氏提取装置', percolation: '渗漉提取装置', filter: '减压抽滤装置', funnel: '分液漏斗萃取装置', column: '柱层析分离装置', rotary: '旋转蒸发浓缩装置' })[rig] || rig}`,
        '✓ 同步 4 步工艺、SOP 与第 6 步 A4 报告'
      ];
      document.getElementById('qwenReceiptChecks').innerHTML = checks.map(c => `<span class="px-2 py-0.5 rounded-full bg-white border border-emerald-200 text-emerald-900 font-semibold">${c}</span>`).join(''); const bankBadge2 = document.getElementById('qwenBankStatusBadge'); if (bankBadge2) bankBadge2.textContent = createdNewDraft ? '🛡️ 临时演练草稿（需 AI 审核 ≥90分方可编入）' : '📚 已引用并优化站内权威题库'; const deepEl = document.getElementById('qwenDeepCards'); if (deepEl) { const refTxt = (Array.isArray(plan.recommendedRefs) && plan.recommendedRefs.length) ? plan.recommendedRefs.slice(0, 3).join('；') : (plan.integrative || `已关联课题：${plan.herb} · ${plan.compound}`); const prinTxt = plan.principle || plan.mechanism || plan.aiAdvice || `装置：${rig}（${ws.solventType} / ${ws.temp}℃ / ${ws.time}min）`; const concTxt = plan.aiConclusion || ws.aiConclusion || `已完成 ${plan.herb}（${plan.compound}）实验编排，预期结论已同步写入报告。`; deepEl.innerHTML = [{ t: '📚 题库与文献引用', b: refTxt }, { t: '⚗️ 原理与动态装置解析', b: prinTxt }, { t: '📊 AI 预期结论（已写入报告）', b: concTxt }].map(c => `<div class="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm"><div class="text-[12px] font-bold text-slate-800 mb-1">${c.t}</div><div class="text-[12px] text-slate-600 leading-relaxed">${c.b}</div></div>`).join(''); } const bOpenBank = document.getElementById('btnOpenBankFromReceipt'); if (bOpenBank) bOpenBank.onclick = () => openRightDrawer('bank');
    }
    renderAiPlanShowcase(plan, { usedRealQwen: usedRealQwen, rig: rig, ws: ws, ragCtx: ragCtx || {} });
    showToast(`AI 已自动编排「${plan.herb}」全工作台，方案全景已展开！`);
  }

  // Bind Qwen Config Modal & Command Bar events
  (function bindQwenUI() {
    updateQwenStatusUI();
    const openCfg = () => {
      const capabilities = window.TCMCloudAI?.getCapabilities?.() || { qwen: false, workbuddy: false };
      const cfgSt = document.getElementById('qwenCfgStatus');
      cfgSt.className = 'p-2.5 rounded-xl text-[11px] bg-emerald-50 border border-emerald-200 text-emerald-900';
      cfgSt.textContent = `云端智能服务：${capabilities.qwen ? '连接正常' : '维护中'}；站内精编方案库：随时可用。`;
      cfgSt.classList.remove('hidden');
      const m = document.getElementById('qwenConfigModal');
      m.classList.remove('hidden'); m.classList.add('flex');
    };
    const closeCfg = () => {
      const m = document.getElementById('qwenConfigModal');
      m.classList.add('hidden'); m.classList.remove('flex');
    };
    ['btnOpenQwenCfgTop', 'btnOpenQwenCfgBar'].forEach(id => {
      const b = document.getElementById(id); if (b) b.addEventListener('click', openCfg);
    });
    const bc = document.getElementById('btnCloseQwenCfg'); if (bc) bc.addEventListener('click', closeCfg);

    const cfgForm = document.getElementById('qwenCfgForm');
    if (cfgForm) {
      cfgForm.addEventListener('submit', e => {
        e.preventDefault();
        closeCfg();
      });
    }

    const btnClr = document.getElementById('btnClearQwenCfg');
    if (btnClr) {
      btnClr.addEventListener('click', () => {
        try { localStorage.removeItem(QWEN_CFG_KEY); } catch (e) {}
        lastAIProviderLabel = '';
        updateQwenStatusUI();
        showToast('本地缓存已重置');
      });
    }

    const btnTest = document.getElementById('btnTestQwenCfg');
    if (btnTest) {
      btnTest.addEventListener('click', async () => {
        if (btnTest.disabled) return;
        const st = document.getElementById('qwenCfgStatus');
        btnTest.disabled = true;
        st.className = 'p-2.5 rounded-xl text-[11px] bg-slate-100 text-slate-700';
        st.textContent = '正在检测智能服务连接状态...';
        st.classList.remove('hidden');
        try {
          if (!window.TCMCloudAI?.testProviders) throw new Error('服务模块加载中，请稍候重试');
          const results = await window.TCMCloudAI.testProviders();
          const successful = results.filter((item) => item.ok);
          lastAIProviderLabel = successful[0]?.label || '本地智算';
          updateQwenStatusUI();
          st.className = successful.length ? 'p-2.5 rounded-xl text-[11px] bg-emerald-50 border border-emerald-200 text-emerald-900' : 'p-2.5 rounded-xl text-[11px] bg-amber-50 border border-amber-200 text-amber-900';
          const details = results.map((item) => item.ok ? `✓ ${item.label}：${item.reply}` : `× ${item.label}：${item.error}`).join('\n');
          const capabilities = window.TCMCloudAI.getCapabilities();
          st.textContent = details + '\n站内精编方案库随时可用。';
        } catch (err) {
          st.className = 'p-2.5 rounded-xl text-[11px] bg-amber-50 border border-amber-200 text-amber-900';
          st.textContent = `云端服务当前繁忙，站内精编方案库可正常使用。`;
        } finally {
          btnTest.disabled = false;
        }
      });
    }

    // Demo prompt pills
    document.querySelectorAll('[data-qwen-demo]').forEach(b => {
      b.addEventListener('click', () => {
        document.getElementById('qwenPromptInput').value = b.dataset.qwenDemo;
        document.getElementById('qwenAutoForm').dispatchEvent(new Event('submit', { cancelable: true }));
      });
    });

    // Jump buttons inside receipt
    document.querySelectorAll('[data-qwen-jump]').forEach(b => {
      b.addEventListener('click', () => {
        if (autoRunning) cancelActiveAI();
      state.step = Number(b.dataset.qwenJump); saveState(); renderAll();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
    const bCloseRec = document.getElementById('btnCloseQwenReceipt');
    if (bCloseRec) bCloseRec.addEventListener('click', () => document.getElementById('qwenExecReceipt').classList.add('hidden'));
    const bShowPlan = document.getElementById('btnShowFullPlan');
    if (bShowPlan) bShowPlan.addEventListener('click', () => {
      const sb = document.getElementById('aiPlanShowcase');
      if (sb) { sb.classList.remove('hidden'); try { sb.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {} }
    });

    // Main Automation Submit
    const autoForm = document.getElementById('qwenAutoForm');
    if (autoForm) {
      autoForm.addEventListener('submit', async e => {
        e.preventDefault();
        if (autoRunning) { showToast('正在为您编排实验方案，请稍候', 'info'); return; }
        const prompt = document.getElementById('qwenPromptInput').value.trim();
        if (!prompt) { showToast('请先输入你的实验想法或计划'); return; }
        if (prompt.length > 1200) { showToast('实验想法请控制在 1200 字以内', 'error'); return; }
        autoRunning = true;
        const requestId = ++autoRequestSeq;
        const requestController = new AbortController();
        activeAIController = requestController;
        const btnTxt = document.getElementById('btnRunQwenText');
        const btnEl = document.getElementById('btnRunQwenAuto');
        btnEl.disabled = true;
        btnTxt.textContent = '方案编排中...';
        const pBox = document.getElementById('qwenProgressBox'); const pBar = document.getElementById('qwenProgressBar'); const pStage = document.getElementById('qwenProgressStageText'); const pTimer = document.getElementById('qwenProgressTimer'); const setStage = (idx, txt, pct) => { if (pStage) pStage.textContent = txt; if (pBar) pBar.style.width = pct + '%'; [1,2,3,4].forEach(n => { const s = document.getElementById('qwenStep' + n); if (s) s.className = n <= idx ? 'text-teal-700 font-bold' : 'text-slate-400'; }); }; if (pBox) pBox.classList.remove('hidden'); const t0 = Date.now(); if (pTimer) pTimer.textContent = '0.0s'; const pInt = setInterval(() => { if (pTimer) pTimer.textContent = ((Date.now() - t0) / 1000).toFixed(1) + 's'; }, 100); setStage(1, '正在检索题库文献...', 20); const ragCtx = searchSiteKnowledge(prompt); setStage(2, '正在智能推演实验工艺与装置...', 38);
        const aiScene = document.getElementById('aiSceneSelect')?.value || '高校本科教学(3~4学时)';
        const aiGreen = document.getElementById('aiGreenSelect')?.value || '绿色无氯仿优先';
        const aiTpl = document.getElementById('aiTemplateSelect')?.value || '全板块一键贯通';
        const localFirst = document.getElementById('aiLocalFirstToggle')?.checked !== false;
        const forceCloud = autoForm.dataset.forceCloud === '1';
        autoForm.dataset.forceCloud = '0';
        const forceBtn = document.getElementById('btnForceCloudAi');
        if (forceBtn) forceBtn.classList.add('hidden');

        // 省流优先：若命中内置精编 55 项题库且未要求强制云端定制，则 0 Token 秒出全套方案
        const hasComplexMod = /改良|对照|对比|双提|微针|低共熔|纳米|正交|优化方案|定制|比较/.test(prompt);
        const HERB_ALIASES = {
          "黄柏": "phellodendron", "关黄柏": "phellodendron", "川黄柏": "phellodendron",
          "黄连": "coptis", "小檗碱": "coptis", "黄连素": "coptis",
          "阿司匹林": "willow_aspirin", "水杨酸": "willow_aspirin", "柳树皮": "willow_aspirin",
          "血塞通": "sanqi_xuesaitong", "血栓通": "sanqi_xuesaitong", "三七": "sanqi_xuesaitong",
          "黄连解毒汤": "huanglian_jiedu", "逍遥散": "xiaoyao_formula",
          "石杉碱甲": "huperzine_a", "千层塔": "huperzine_a",
          "白藜芦醇": "resveratrol_hydrolysis", "虎杖": "resveratrol_hydrolysis",
          "广陈皮": "citrus_pmf", "陈皮": "citrus", "薄荷": "mint", "薄荷脑": "mint",
          "紫杉醇": "taxus_paclitaxel", "红豆杉": "taxus_paclitaxel"
        };
        const sortedPresets = Object.values(FEATURED_PRESETS).filter(Boolean).sort((a, b) => (b.herb || "").length - (a.herb || "").length);
        const normHerb = (h) => String(h || "").replace(/（.*?）|\(.*?\)/g, "").trim();
        const exactFullPreset = sortedPresets.find(p => prompt.includes(p.herb));
        const aliasKey = Object.keys(HERB_ALIASES).sort((a, b) => b.length - a.length).find(k => prompt.includes(k));
        const exactPreset = exactFullPreset
          || sortedPresets.find(p => { const nh = normHerb(p.herb); return nh.length >= 2 && prompt.includes(nh); })
          || (aliasKey && FEATURED_PRESETS[HERB_ALIASES[aliasKey]])
          || sortedPresets.find(p => p.compound && prompt.includes(p.compound.split(/[、/+（(]/)[0]));
        if (localFirst && !forceCloud && exactPreset && (exactFullPreset || !hasComplexMod)) {
          setStage(3, '已匹配站内经典课题，正在同步全流程参数...', 82);
          const localPlan = normalizeAiPlan({
            ...exactPreset,
            matchedId: exactPreset.id,
            isNewTopic: false,
            cfg: exactPreset.defaultCfg,
            sampleBatches: exactPreset.demoBatches,
            aiAdvice: `✨ 已为您精准匹配精编课题「${exactPreset.herb} · ${exactPreset.compound}」，同步更新了全部 6 步参数、适用装置与实操指引；如需结合「${aiScene} / ${aiGreen}」做深度个性化改写，可点击下方按钮定制生成。`,
            aiConclusion: `本课题依据内置精编方案与《中国药典》参考限度（≥${exactPreset.limitVal}${exactPreset.limitUnit}）自动配置，请在第 4 步查看适用装置小分支并在第 5 步录入实测数据。`
          });
          lastAIProviderLabel = '本草智研精编库';
          applyAiPlanToWorkbench(localPlan, false, ragCtx);
          if (forceBtn) {
            forceBtn.classList.remove('hidden');
            forceBtn.onclick = () => { autoForm.dataset.forceCloud = '1'; autoForm.dispatchEvent(new Event('submit', { cancelable: true })); };
          }
          clearInterval(pInt);
          if (pBox) pBox.classList.add('hidden');
          btnEl.disabled = false;
          btnTxt.textContent = '生成研究 / 小试模拟方案';
          autoRunning = false;
          activeAIController = null;
          updateQwenStatusUI();
          return;
        }

        try {
          if (isQwenReady()) {
            const precondText = `【用户前置条件】实验场景：${aiScene}；绿色与溶剂约束：${aiGreen}；输出模板侧重：${aiTpl}。\n`;
            const ragText = precondText + '【站内检索题库】' + JSON.stringify(ragCtx.matchedTopics) + '\n【站内检索文献】' + JSON.stringify(ragCtx.matchedLit) + '\n';
            const sysPrompt = ragText + `你是“本草智研 · 中药化学智能实验设计工作台”的首席课程导师与排版编排引擎。你的输出将直接渲染到网站的 6 大结构化视觉模块（1.创新设计四宫格 2.动态流程图 3.双栏四步工艺详解卡 4.可勾选SOP规程 5.题库文献区 6.排障与导师结论卡），因此必须严格遵守以下内容深度与版面均衡规范：
【硬性规范】
1. 必须严格输出合法 JSON（不要 markdown 代码块、不要额外解释文字）。
2. 四宫格字数均衡：origin、chemistry、pharmacopoeia、tlcSystem 每项严格控制在 35~65 字，信息密度对等（含拉丁基原/性味、核心母核与溶解性、《中国药典》限度与RSD<5%、展开剂精确体积比与显色法）。
3. 必须完整输出 4 个工艺阶段（steps 数组长度严格为 4，stage 依次为“提取”“分离”“纯化”“检识”），禁止偷懒合并成 2 步；每步 7 个字段全填满，principle 25~45 字讲清化学机理，operation 45~75 字写出具体温度/时间/用量/操作手法，qc 给出明确质控指标。
4. sop 必须给出 6~8 条带精确数值（克、毫升、℃、min、目数、pH）的实验室可执行指令；troubleshoot 必须给出 3 条典型异常（如乳化、收率偏低、TLC拖尾/斑点不显）的成因与实操对策。
5. 必须结合上方【站内检索题库】与【站内检索文献】在 innovation（45~75 字）与 integrative 中体现绿色/本科可落地的创新亮点，并给出 2~3 条与本药材严格相关的 GB/T 7714 参考文献。
6. aiConclusion 80~140 字，包含预期收率区间、3 批平行 RSD 质控与 TLC/UV/NMR 确证结论；aiAdvice 50~85 字，含本科课时分配与安全防护提醒。
【JSON 字段模板】
{
  "herb": "中药名",
  "compound": "目标有效成分",
  "latin": "拉丁基原名",
  "category": "黄酮|生物碱|挥发油与萜类|香豆素与木脂素|蒽醌与醌类|皂苷与三萜|甾体与强心苷|萜类内酯与环烯醚萜|氰苷类|苯丙素与有机酸|多糖类",
  "formalTitle": "规范学术实验课题全称",
  "limitVal": 1.0,
  "limitUnit": "%",
  "mpRef": "参考熔点或性状",
  "origin": "35~65字：基原部位、性味归经与核心功效",
  "chemistry": "35~65字：化学母核、特征官能团、酸碱性与溶解性规律",
  "pharmacopoeia": "35~65字：《中国药典》含量限度、水分灰分与3批平行RSD<5%要求",
  "integrative": "45~80字：绿色溶剂替代/一材双提/活性评价等课程延伸思路",
  "innovation": "45~75字：相对传统教学实验的核心创新亮点（直击痛点）",
  "citedBank": ["引用的站内精编题库课题标题"],
  "citedLiterature": ["引用的站内文献标题"],
  "recommendedRefs": ["[1] 作者. 题名[J]. 期刊, 年, 卷(期): 页码.", "[2] 作者. 题名[J]. 期刊, 年, 卷(期): 页码."],
  "spectra": { "chapter": "对应教材章节", "uv": "UV最大吸收波长与带型解析", "nmr": "1H-NMR/13C-NMR特征化学位移解析" },
  "rigAnalysis": "所选实验装置的传质传热原理与安全运行要点",
  "defaultRig": "steam|reflux|soxhlet|ultrasound|percolation|filter|extract|column|rotavap|resin|tlc|hplc|freeze_dry",
  "applicableRigs": ["steam|reflux|soxhlet|ultrasound|percolation|filter|extract|column|rotavap|resin|tlc|hplc|freeze_dry", "第2适用装置"],
  "defaultExtract": "steam|reflux|soxhlet|ultrasound|acid_water|boil_enzyme",
  "defaultSep": "freeze|acid_precip|salting_out|resin|extract|column|precip",
  "cfg": { "mass": 50, "ratio": 10, "temp": 75, "time": 60, "mesh": "中粉(40目)", "cycles": "2", "solventType": "70%乙醇", "ph": "中性 7.0" },
  "tlcSystem": "35~65字：硅胶板类型、展开剂精确体积比、检视波长与显色剂及预期Rf范围",
  "steps": [
    { "stage": "提取", "title": "步骤名", "principle": "25~45字化学原理", "operation": "45~75字操作方法（含用量、温度、时长与手法）", "reagents": "试剂与用量", "apparatus": "主要仪器", "duration": "如 45 min", "qc": "关键质控红线", "subBranches": [{"name": "小分支名", "detail": "20~40字具体实操动作", "biliKw": "1~2个高命中B站短词如 水蒸气蒸馏"}] },
    { "stage": "分离", "title": "步骤名", "principle": "25~45字化学原理", "operation": "45~75字操作方法", "reagents": "试剂与用量", "apparatus": "主要仪器", "duration": "如 30 min", "qc": "关键质控红线" },
    { "stage": "纯化", "title": "步骤名", "principle": "25~45字化学原理", "operation": "45~75字操作方法", "reagents": "试剂与用量", "apparatus": "主要仪器", "duration": "如 35 min", "qc": "关键质控红线" },
    { "stage": "检识", "title": "步骤名", "principle": "25~45字化学原理", "operation": "45~75字操作方法", "reagents": "试剂与用量", "apparatus": "主要仪器", "duration": "如 25 min", "qc": "关键质控红线" }
  ],
  "sop": ["步骤1（含具体数值）", "步骤2", "步骤3", "步骤4", "步骤5", "步骤6"],
  "troubleshoot": [
    { "issue": "异常现象1", "cause": "机理原因", "fix": "实操对策" },
    { "issue": "异常现象2", "cause": "机理原因", "fix": "实操对策" },
    { "issue": "异常现象3", "cause": "机理原因", "fix": "实操对策" }
  ],
  "chemTests": [{ "name": "特征显色反应1", "passed": true }, { "name": "特征显色反应2", "passed": true }, { "name": "TLC对照品共色谱", "passed": true }],
  "expectedYield": "按投料量估算的粗提物/精制品预期收率区间与依据",
  "aiConclusion": "80~140字：预期收率区间、3批平行RSD质控讨论及TLC/UV结构确证结论",
  "tlcDefault": { "front": 8.0, "sample": 4.2, "ref": 4.3 },
  "sampleBatches": [{"mass": 50, "crude": 0.92, "refined": 0.65, "mp": 0}, {"mass": 50, "crude": 0.96, "refined": 0.68, "mp": 0}, {"mass": 50, "crude": 0.94, "refined": 0.66, "mp": 0}],
  "aiAdvice": "50~85字：贴合所选实验场景的课时/中试排期建议与通风/防爆/废液回收安全提醒"
}`;
            const raw = await callQwenAPI([
              { role: 'system', content: sysPrompt },
              { role: 'user', content: prompt }
            ], true, {
              signal: requestController.signal,
              onProgress: (chars) => {
                const pct = Math.min(74, 38 + Math.round((chars / 1800) * 36));
                setStage(2, `正在生成全景实验方案（已撰写 ${chars} 字）...`, pct);
              }
            });
            if (requestId !== autoRequestSeq) return;
            const cleaned = window.TCMCloudAI?.cleanJsonText ? window.TCMCloudAI.cleanJsonText(raw) : raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
            const parsed = normalizeAiPlan(JSON.parse(cleaned));
            setStage(3, '正在同步工作台参数与装置...', 78); applyAiPlanToWorkbench(parsed, true, ragCtx); setStage(4, '正在写入报告与入库...', 100);
          } else {
            await new Promise(r => setTimeout(r, 380));
            if (requestId !== autoRequestSeq) return;
            const plan = normalizeAiPlan(localSmartPlan(prompt));
            lastAIProviderLabel = '本地智算';
            setStage(3, '正在同步工作台参数与装置...', 78); applyAiPlanToWorkbench(plan, false, ragCtx); setStage(4, '正在写入报告与入库...', 100);
          }
        } catch (err) {
          if (requestId !== autoRequestSeq || requestController.signal.aborted) return;
          const fallback = normalizeAiPlan(localSmartPlan(prompt));
          fallback.aiAdvice = `云端服务当前繁忙，已自动采用站内精编方案库为您完成基础编排；具体实验参数与安全条件请结合实验室实际并经指导教师复核。`;
          lastAIProviderLabel = '本地智算';
          applyAiPlanToWorkbench(fallback, false, ragCtx);
        } finally {
          clearInterval(pInt);
          if (requestId === autoRequestSeq) {
            if (pBox) pBox.classList.add('hidden');
            btnEl.disabled = false;
            btnTxt.textContent = '生成研究 / 小试模拟方案';
            autoRunning = false;
            activeAIController = null;
            updateQwenStatusUI();
          }
        }
      });
    }

    // Qwen Q&A Chat Toggle & Submit
    const chatTplMount = document.getElementById('aiChatTemplateChips');
    if (chatTplMount && Array.isArray(EXTRA_DATA.AI_CHAT_TEMPLATES)) {
      chatTplMount.innerHTML = EXTRA_DATA.AI_CHAT_TEMPLATES.map((tpl, idx) =>
        `<button type="button" data-chat-tpl="${idx}" class="px-2.5 py-1 rounded-full bg-white hover:bg-teal-50 border border-slate-200 hover:border-[#0f5c54] text-[11px] font-bold text-slate-700 hover:text-[#0a3630] transition">${tpl.label}</button>`
      ).join('');
      chatTplMount.querySelectorAll('[data-chat-tpl]').forEach(btn => {
        btn.addEventListener('click', () => {
          const tpl = EXTRA_DATA.AI_CHAT_TEMPLATES[Number(btn.dataset.chatTpl)];
          const inp = document.getElementById('qwenChatInput');
          if (tpl && inp) { inp.value = tpl.prompt; inp.focus(); }
        });
      });
    }
    const btnToggleChat = document.getElementById('btnToggleQwenChat');
    if (btnToggleChat) btnToggleChat.addEventListener('click', () => document.getElementById('qwenChatBox').classList.toggle('hidden'));
    const btnClearChat = document.getElementById('btnClearQwenChat');
    if (btnClearChat) btnClearChat.addEventListener('click', () => {
      document.getElementById('qwenChatMessages').innerHTML = '<div class="p-2.5 rounded-xl bg-white border border-slate-200/80 text-slate-700">对话已清空。请针对当前实验提出你的问题！</div>';
    });

    function localTutorAnswer(q, t, ws) {
      if (/拖尾|TLC|薄层|斑点/i.test(q)) return `【${t.herb} TLC 优化建议】拖尾通常由酸碱解离引起：酸性成分可尝试在展开剂中加入少量甲酸或冰醋酸抑制电离；生物碱则需按对照方法调整碱化条件。当前推荐系统：${t.tlcSystem}。具体比例须经预实验和指导教师确认。`;
      if (/收率|偏低|提高/.test(q)) return `【${t.herb} 收率排查】依据扩散与传质原理，建议核查：①药材粒度（当前 ${ws.mesh}）；②溶剂浓度与 pH（当前 ${ws.solventType} / ${ws.ph}）；③温度（当前 ${ws.temp}℃）是否引起热敏降解或挥发损失。`;
      if (/讨论|报告|结论/.test(q)) return `【${t.herb} 实验讨论参考】本方案以${ws.solventType}在${ws.temp}℃下提取${ws.time} min，目标为获得${t.compound}。讨论应结合实测收率、RSD 与 TLC 结果，不应把预期结果写成已验证结论。`;
      return `【实验助教提示】已读取「${t.herb} · ${t.compound}」上下文（${ws.solventType}，${ws.temp}℃）。云端服务空闲时可支持更深入自由问答；当前可继续咨询 TLC、收率或报告讨论。`;
    }

    function renderTutorMarkdown(md) {
      const esc = String(md || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      const lines = esc.split(/\r?\n/);
      const out = [];
      let listTag = '';
      let tableRows = [];
      const inline = s => s
        .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-teal-50 text-[#0f5c54] border border-teal-200/70 font-mono text-[11px]">$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
      const closeList = () => { if (listTag) { out.push(`</${listTag}>`); listTag = ''; } };
      const flushTable = () => {
        if (!tableRows.length) return;
        const parseRow = r => r.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
        const head = parseRow(tableRows[0]);
        const bodyRows = tableRows.slice(1).filter(r => !/^\|?[\s:-]+(\|[\s:-]+)+\|?$/.test(r.trim()));
        out.push('<div class="overflow-x-auto my-2 rounded-xl border border-teal-200/80"><table class="w-full text-left border-collapse text-[11.5px]"><thead><tr class="bg-[#0a3630] text-white">' +
          head.map(h => `<th class="px-2.5 py-1.5 font-bold whitespace-nowrap">${inline(h)}</th>`).join('') +
          '</tr></thead><tbody>' +
          bodyRows.map((r, idx) => `<tr class="${idx % 2 ? 'bg-slate-50/90' : 'bg-white'} border-t border-slate-100">` + parseRow(r).map(c => `<td class="px-2.5 py-1.5 text-slate-700 align-top">${inline(c)}</td>`).join('') + '</tr>').join('') +
          '</tbody></table></div>');
        tableRows = [];
      };
      for (const raw of lines) {
        const line = raw.trimEnd();
        const trimmed = line.trim();
        if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.split('|').length >= 3) {
          closeList();
          tableRows.push(trimmed);
          continue;
        }
        flushTable();
        const hm = line.match(/^#{1,4}\s+(.+)$/);
        const bq = line.match(/^&gt;\s*(.+)$/);
        const ul = line.match(/^\s*[-*•]\s+(.+)$/);
        const ol = line.match(/^\s*\d+\.\s+(.+)$/);
        if (hm) {
          closeList();
          out.push('<h4 class="font-extrabold text-[#0a3630] text-[12.5px] mt-2.5 mb-1 pl-2 border-l-2 border-teal-600">' + inline(hm[1]) + '</h4>');
        } else if (bq) {
          closeList();
          out.push('<div class="my-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50/90 border-l-2 border-amber-500 text-amber-950 text-[12px] leading-relaxed">' + inline(bq[1]) + '</div>');
        } else if (ul) {
          if (listTag !== 'ul') { closeList(); out.push('<ul class="list-disc pl-4 space-y-1 my-1 text-slate-700">'); listTag = 'ul'; }
          out.push('<li>' + inline(ul[1]) + '</li>');
        } else if (ol) {
          if (listTag !== 'ol') { closeList(); out.push('<ol class="list-decimal pl-4 space-y-1 my-1 text-slate-700">'); listTag = 'ol'; }
          out.push('<li>' + inline(ol[1]) + '</li>');
        } else {
          closeList();
          out.push(trimmed === '' ? '<div class="h-1"></div>' : '<p class="my-1 text-slate-700 leading-relaxed">' + inline(line) + '</p>');
        }
      }
      flushTable();
      closeList();
      return out.join('');
    }
    let chatRunning = false;
    const chatForm = document.getElementById('qwenChatForm');
    if (chatForm) {
      chatForm.addEventListener('submit', async e => {
        e.preventDefault();
        if (chatRunning) { showToast('助教正在回答，请稍候', 'info'); return; }
        const inp = document.getElementById('qwenChatInput');
        const q = inp.value.trim();
        if (!q) return;
        if (q.length > 2000) { showToast('问题请控制在 2000 字以内', 'error'); return; }
        chatRunning = true;
        const chatSubmit = chatForm.querySelector('[type="submit"]');
        if (chatSubmit) chatSubmit.disabled = true;
        const chatController = new AbortController();
        inp.value = '';
        const box = document.getElementById('qwenChatMessages');
        const userMsg = document.createElement('div');
        userMsg.className = 'p-2.5 rounded-xl bg-[#0a3630] text-white ml-8';
        userMsg.textContent = q;
        box.appendChild(userMsg);
        const waitId = 'qw_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
        box.innerHTML += `<div id="${waitId}" class="p-2.5 rounded-xl bg-white border border-slate-200/80 text-slate-500 mr-6">思考中...</div>`;
        box.scrollTop = box.scrollHeight;

        const t = getTopicDef();
        const ws = getWorkState(t);
        const statsNow = computeStats(t, ws);
        const appRigsTxt = getApplicableRigs(t, ws).map(x => LAB_RIGS[x.key]?.title || x.key).join(' → ');
        const ctx = `当前实验课题：${t.herb}（${t.compound}，类别：${t.category}）。适用装置：${appRigsTxt}。左侧参数：投料${ws.mass}g、料液比1:${ws.ratio}、溶剂${ws.solventType}、温度${ws.temp}℃、时间${ws.time}min、pH:${ws.ph}。薄层系统：${t.tlcSystem}。当前实测统计：批次数${statsNow.count}、平均粗提收率${statsNow.avgCrude.toFixed(2)}%、RSD=${statsNow.rsd.toFixed(2)}%。`;
        let ans = '';
        try {
          if (isQwenReady()) {
            ans = await callQwenAPI([
              { role: 'system', content: `你是“本草智研”中药化学智能实验工作台的指导教师。请严格按以下版面风格作答：①先用 1~2 句话给出核心结论；②用小标题（###）配合分点清单或紧凑 Markdown 表格展示工艺参数、化学机理或对比；③用 > 引用块给出 1 条实验安全或质控提醒；④语言专业精炼、不编造药典标准或文献。${ctx}` },
              { role: 'user', content: q }
            ], false, { signal: chatController.signal });
          } else {
            await new Promise(r => setTimeout(r, 300));
            ans = localTutorAnswer(q, t, ws);
          }
        } catch (err) {
          ans = `${localTutorAnswer(q, t, ws)}\n\n（以上解答由站内中药化学知识库即时提供）`;
        } finally {
          chatRunning = false;
          if (chatSubmit) chatSubmit.disabled = false;
        }
        const el = document.getElementById(waitId);
        if (el) { el.className = 'p-2.5 rounded-xl bg-white border border-slate-200/80 text-slate-800 mr-6 leading-relaxed space-y-0.5'; el.innerHTML = renderTutorMarkdown(ans); }
        box.scrollTop = box.scrollHeight;
      });
    }
  })();

  loadState();
  initEvents();
  updateTimerUI();

  // ============ 用户自有方案推演联动桥接 & 启动加载已收录案例 ============
  function buildTopicFromUserPlan(plan) {
    const p = plan.params || {};
    const id = plan.id || ('user_plan_' + Date.now());
    return {
      id,
      isCustom: true,
      isInnovative: true,
      featured: true,
      herb: plan.herb || '自定药材',
      compound: plan.compound || '目标活性成分',
      latin: '用户自建与智能推演案例',
      category: plan.category || '黄酮',
      defaultRig: p.rig || 'reflux',
      applicableRigs: [p.rig || 'reflux', 'rotavap', 'tlc', 'hplc'],
      defaultExtract: p.rig === 'ultrasonic' ? 'ultrasonic' : (p.rig === 'steam' ? 'steam' : 'reflux'),
      defaultSep: 'extract',
      formulas: ['diffusion', 'henderson', 'qc'],
      defaultCfg: {
        mass: p.mass || 50,
        ratio: p.ratio || 10,
        temp: p.temp || 75,
        time: p.time || 60,
        mesh: '粗粉(10~20目)',
        cycles: String(p.cycles || 2),
        solventType: p.solventType || '70%乙醇',
        ph: '中性 7.0'
      },
      limitVal: 1.0, limitUnit: '%', crudeUnit: 'g', mpRef: '以实测熔点/标曲为准',
      origin: `用户提交方案：${plan.title || plan.herb}（综合可行性 ${plan.score || 88} 分）。`,
      chemistry: plan.sourceText || plan.summaryAdvice || '',
      pharmacopoeia: '请结合《中国药典》对应药材项下含量限度与实验室安全规范复核。',
      integrative: plan.summaryAdvice || '',
      scaling: { auxName: '常规辅助试剂', auxFactor: 0.5, auxUnit: 'mL/g', yieldLow: 0.015, yieldHigh: 0.035, yieldUnit: 'g' },
      tlcSystem: '硅胶 G 板（按目标成分极性微调乙酸乙酯-石油醚或甲酸-水比例），254/365 nm 紫外检视。',
      tlcDefault: { front: 8.0, sample: 4.2, ref: 4.2 },
      steps: (plan.stages || []).map(st => ({
        stage: (st.stage || '工艺').replace(/^[①②③④]\s*/, ''),
        title: st.title || '实验操作步骤',
        principle: st.phenomenon || '',
        operation: st.tip || '',
        qc: st.qc || ''
      })),
      troubleshoot: (plan.risks || []).map(r => ({ issue: '潜在工艺/安全隐患', cause: r, fix: '按推演建议微调温控、溶剂或操作顺序。' })),
      sop: (plan.stages || []).map(st => `${st.title}（${st.qc}）`),
      chemTests: [{ name: '供试品 TLC 对照斑点', passed: true }, { name: '紫外/含量测定精密度复核', passed: true }],
      demoBatches: [{ mass: p.mass || 50, crude: 1.25, refined: 0.86, mp: 0 }, { mass: p.mass || 50, crude: 1.32, refined: 0.91, mp: 0 }, { mass: p.mass || 50, crude: 1.28, refined: 0.88, mp: 0 }]
    };
  }

  // 严禁自动把未审核的自有方案写进题库或案例库；仅作为当前无痕会话临时演练草稿
  window.TCM_USER_PLAN_BRIDGE = {
    applyPlan: function (plan) {
      const topicObj = buildTopicFromUserPlan(plan);
      topicObj.isDraft = true;
      state.sessionDraftTopic = topicObj;
      state.activeTopicId = topicObj.id;
      const ws = getWorkState(topicObj);
      Object.assign(ws, topicObj.defaultCfg);
      saveState();
      renderAll();
      showToast('已载入本次临时演练草稿（刷新自动清零；如需编入 AI 自编库请先通过 90 分 AI 审核）', 'info');
      return topicObj;
    },
    buildTopicFromUserPlan
  };

  // ============ 无痕净享模式：禁用跨次“保留/续接进度”弹窗 ============
  window.TCM_RESUME_BRIDGE = {
    getResumeInfo: function () { return null; },
    resumeNow: function () {},
    dismiss: function () {}
  };

  window.TCM_LAB_API = {
    getAllTopics: () => {
      const custom = Object.values(state.customTopics || {}).map(x => ({ ...x, _isCustom: true }));
      return [...custom, ...CATALOG_45];
    },
    getApprovedAiTopics: () => Object.values(state.customTopics || {}),
    getSessionDraft: () => state.sessionDraftTopic || null,
    getTopicById: (id) => findTopicDef(id, state.customTopics) || getTopicDef(),
    getCurrentTopic: () => getTopicDef(),
    getCurrentWorkState: () => getWorkState(getTopicDef()),
    getStep: () => state.step,
    getLaymanNote: (t) => getHerbLaymanNote(t || getTopicDef()),
    getCounts: () => ({
      topics: CATALOG_45.length + Object.keys(state.customTopics || {}).length,
      approvedAi: Object.keys(state.customTopics || {}).length,
      rigs: Object.keys(LAB_RIGS || {}).length,
      literature: GLOBAL_LITERATURE.length + (state.extraGlobalRefs ? state.extraGlobalRefs.length : 0),
      univCases: UNIV_CASES.length
    }),
    setSessionDraft: (topicObj, wsPatch) => {
      if (!topicObj) return null;
      const draft = { ...hydrateTopic(topicObj), ...topicObj, isCustom: true, isDraft: true };
      if (!draft.id || !String(draft.id).startsWith('draft_')) draft.id = 'draft_' + Date.now();
      state.sessionDraftTopic = draft;
      state.activeTopicId = draft.id;
      const ws = getWorkState(draft);
      if (draft.defaultCfg) Object.assign(ws, draft.defaultCfg);
      if (wsPatch && typeof wsPatch === 'object') Object.assign(ws, wsPatch);
      saveState();
      renderAll();
      return draft;
    },
    commitApprovedAiTopic: (topicObj, reviewResult) => {
      const score = Number(reviewResult && reviewResult.score);
      if (!reviewResult || !Number.isFinite(score) || score < AI_REVIEW_PASS_SCORE) {
        showToast(`审核未满 ${AI_REVIEW_PASS_SCORE} 分，系统已拦截编入！请先接入 AI 协助优化。`, 'error');
        return { ok: false, reason: 'score_below_threshold' };
      }
      const approvedId = 'ai_approved_' + Date.now();
      const ws = getWorkState(topicObj);
      const finalized = {
        ...hydrateTopic(topicObj),
        ...topicObj,
        id: approvedId,
        isCustom: true,
        isAiGenerated: true,
        isDraft: false,
        defaultCfg: {
          mass: ws.mass, ratio: ws.ratio, temp: ws.temp, time: ws.time,
          mesh: ws.mesh, cycles: String(ws.cycles || '2'), solventType: ws.solventType, ph: ws.ph
        },
        aiReview: {
          approved: true,
          score: Math.round(score),
          engine: reviewResult.engine || '平台 AI 评审',
          summary: reviewResult.summary || '',
          dimensions: Array.isArray(reviewResult.dimensions) ? reviewResult.dimensions : [],
          reviewedAt: new Date().toLocaleString('zh-CN')
        }
      };
      state.customTopics[approvedId] = finalized;
      state.sessionDraftTopic = null;
      state.activeTopicId = approvedId;
      saveApprovedAiBank(state.customTopics);
      saveState();
      renderAll();
      showToast(`🎉 已通过 AI 严审（${Math.round(score)} 分）并正式编入「AI 自编题库」！`);
      return { ok: true, topic: finalized };
    },
    deleteApprovedAiTopic: (id) => {
      if (!state.customTopics || !state.customTopics[id]) return;
      delete state.customTopics[id];
      if (state.activeTopicId === id) state.activeTopicId = CATALOG_45[0].id;
      saveApprovedAiBank(state.customTopics);
      saveState();
      renderAll();
      showToast('已从 AI 自编题库移除该课题', 'info');
    },
    clearApprovedAiBank: () => {
      state.customTopics = {};
      state.sessionDraftTopic = null;
      state.activeTopicId = CATALOG_45[0].id;
      saveApprovedAiBank({});
      saveState();
      renderAll();
      showToast('已清空 AI 自编题库', 'info');
    },
    resetSessionClean: () => {
      wipeTransientTraces();
      state = createDefaultState();
      state.sessionDraftTopic = null;
      state.customTopics = loadApprovedAiBank();
      renderAll();
      showToast('已无痕重置工作台，恢复全新初始状态', 'info');
    },
    selectTopic: (id, targetStep) => {
      state.activeTopicId = id;
      if (targetStep !== undefined && targetStep !== null) {
        state.step = targetStep;
      } else if (state.step === 'hub' || state.step === 'diy' || state.step === 'mission') {
        state.step = 1;
      }
      saveState();
      renderAll();
      showToast(`已锁定课题：${getTopicDef().herb} · ${getTopicDef().compound}`);
    },
    goStep: (s) => {
      if (s === 'hub' || s === 'diy' || s === 'mission') {
        state.lastWorkStep = typeof state.step === 'number' ? state.step : (state.lastWorkStep || 1);
      }
      state.step = s;
      saveState();
      renderAll();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    openRightDrawer: (tab) => openRightDrawer(tab || 'bank'),
    openHubRig: (rk) => {
      state.hubRig = rk;
      state.hubCat = '全部';
      state.step = 'hub';
      saveState();
      renderAll();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    showToast
  };

  renderAll();
  if (window.TCM_V7_MEDIA) {
    window.TCM_V7_MEDIA.initVideoHubModal();
    window.TCM_V7_MEDIA.initDarkMode();
  }
  if (window.TCM_V6_PRO) {
    window.TCM_V6_PRO.initProSuite({
      getAllTopics: () => [...Object.values(state.customTopics || {}), ...CATALOG_45],
      getTopicById: (id) => findTopicDef(id, state.customTopics) || getTopicDef(),
      getRigs: () => LAB_RIGS,
      getLiterature: () => [...GLOBAL_LITERATURE, ...state.extraGlobalRefs],
      getUnivCases: () => UNIV_CASES,
      selectTopic: (id) => { state.activeTopicId = id; if (state.step === 'hub') state.step = 1; saveState(); renderAll(); showToast(`已切换课题：${getTopicDef().herb}`); },
      goStep: (s) => { if (s === 'hub') state.lastWorkStep = state.step !== 'hub' ? state.step : 1; state.step = s; saveState(); renderAll(); window.scrollTo({ top: 0, behavior: 'smooth' }); },
      openHubRig: (rk) => { state.hubRig = rk; state.hubCat = '全部'; state.step = 'hub'; saveState(); renderAll(); window.scrollTo({ top: 0, behavior: 'smooth' }); },
      copyText,
      showToast
    });
  }
})();