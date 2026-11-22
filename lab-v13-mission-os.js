// =========================================================================
// 本草智研 · 任务式实验实操中心与可扩展微实验室 (lab-v13-mission-os.js)
// - 双模任务工作台：实操清单模式 / 三列看板流转模式（待准备 → 实操中 → 已验收）
// - 智能课题任务拆解：按当前选中药材与工艺自动生成专属阶段化任务检查单
// - 实验台实时倒计时器 + 带时间戳电子原始记录本（支持一键汇总写入）
// - 6 大可插拔实验细节微工具：
//   1) 滴定与酸沉/碱游离动态 pH 烧杯模拟仪
//   2) 毛细管熔点测定动态晶体熔融模拟仪
//   3) 3 批平行称量回收率与 RSD 实时验收台
//   4) 溶液稀释配制计算器 (C1V1 = C2V2)
//   5) 实验室突发异常应急处置速查
//   6) 中国药典药筛目数与粒径对照表
// - 3 套工作台视觉主题皮肤自由切换（本草青瓷 / 科研冰蓝 / 典籍琥珀）
// =========================================================================
(function () {
  'use strict';

  const MISSION_STORE_KEY = 'tcm_lab_missions_store_v2';
  const PLUGIN_STORE_KEY = 'tcm_lab_plugins_v2';
  const THEME_STORE_KEY = 'tcm_lab_theme_skin_v1';

  const DEFAULT_CHECKLIST = [
    { id: 'c1', phase: '① 准备阶段', status: 'done', text: '核对药材饮片基原、含水量并完成精准称量' },
    { id: 'c2', phase: '① 准备阶段', status: 'done', text: '检查圆底烧瓶、冷凝管气密性并备好 2~3 粒沸石' },
    { id: 'c3', phase: '① 准备阶段', status: 'doing', text: '穿戴实验服、护目镜与丁腈手套，确认通风橱运行正常' },
    { id: 'c4', phase: '② 提取实操', status: 'todo', text: '按料液比润药浸泡 30 min，确保药材充分浸透无漂浮' },
    { id: 'c5', phase: '② 提取实操', status: 'todo', text: '先通冷凝水（下进上出），再开启阶梯控温维持微沸 2~3 滴/秒' },
    { id: 'c6', phase: '③ 分离纯化', status: 'todo', text: '合并提取液，45~55℃ 减压旋蒸回收溶剂并记录回收体积' },
    { id: 'c7', phase: '③ 分离纯化', status: 'todo', text: '完成萃取/酸沉/层析纯化，干燥后准确称量粗品与精制品干重' },
    { id: 'c8', phase: '④ 检识交付', status: 'todo', text: '展开缸预饱和 15 min，平行点样对照品与供试品测算 Rf 值' },
    { id: 'c9', phase: '④ 检识交付', status: 'todo', text: '录入 3 批平行数据核验 RSD ≤ 3%，导出 A4 规范实验报告' }
  ];

  const EMERGENCY_CARDS = [
    { title: '🔥 提取液暴沸冲料', action: '立即切断或调低热源，切勿用手直接扶瓶；待液面平稳冷却后补加 2~3 粒新沸石（严禁向沸腾液体中直接投沸石！）。' },
    { title: '🥛 分液漏斗严重乳化', action: '先静置 10 min；仍不分层时加入少量饱和氯化钠溶液破乳、轻柔旋转漏斗，或用玻璃棒轻轻搅动乳化界面，必要时低速离心。' },
    { title: '🌀 旋蒸发生倒吸暴冲', action: '第一时间缓慢打开放气阀破除真空，迅速抬升加热浴锅降低温度，检查防溅球并清洗后再减压重启。' },
    { title: '🧪 皮肤不慎溅到酸/碱', action: '立即用大量流动清水持续冲洗至少 15 min；沾酸用 3% 碳酸氢钠湿敷，沾碱用 2% 硼酸溶液轻洗，严重时及时就医。' }
  ];

  const MESH_TABLE = [
    { name: '一号筛（最粗粉）', mesh: '10 目', um: '2000 μm', use: '花叶类切段、挥发油水蒸气蒸馏防堵塞' },
    { name: '二号筛（粗粉）', mesh: '24 目', um: '850 μm', use: '根茎/树皮类常规乙醇回流与渗漉首选' },
    { name: '三号筛（中粉）', mesh: '50 目', um: '355 μm', use: '超声辅助提取与高效索氏萃取推荐粒度' },
    { name: '四号筛（细粉）', mesh: '65 目', um: '250 μm', use: '含量测定供试品精密称量与快速浸出' },
    { name: '五号筛（细粉）', mesh: '80 目', um: '180 μm', use: '显微鉴别与微量分析（回流易糊锅慎用）' }
  ];

  const MP_SAMPLES = [
    { id: 'naphthalene', name: '纯品萘', t1: 80.0, t2: 80.8, pure: true, note: '纯有机固体熔程窄（≤ 1℃），常作温度计校正标准品。' },
    { id: 'acetanilide', name: '乙酰苯胺（重结晶后）', t1: 113.8, t2: 114.6, pure: true, note: '标准熔点 114.3℃，重结晶纯化后熔程窄且初熔清晰。' },
    { id: 'rutin', name: '精制芦丁', t1: 177.2, t2: 178.4, pure: true, note: '槐米碱提酸沉并热水重结晶后纯度高，熔点稳定。' },
    { id: 'impure', name: '含杂质粗品（对比组）', t1: 105.5, t2: 111.8, pure: false, note: '混入杂质后呈现典型“熔点明显下降、熔程拉长至 > 6℃”特征！' }
  ];


  const ROTAVAP_SOLVENTS = [
    { id: 'etoh', name: '乙醇 (常压 78.3℃)', bp0: 78.3, k: 46 },
    { id: 'etoac', name: '乙酸乙酯 (常压 77.1℃)', bp0: 77.1, k: 48 },
    { id: 'meoh', name: '甲醇 (常压 64.7℃)', bp0: 64.7, k: 44 },
    { id: 'water', name: '纯化水 (常压 100.0℃)', bp0: 100.0, k: 56 },
    { id: 'acetone', name: '丙酮 (常压 56.1℃)', bp0: 56.1, k: 45 },
    { id: 'pe', name: '石油醚 (常压 45.0℃)', bp0: 45.0, k: 38 }
  ];

  const COLOR_REACTIONS = [
    { name: '盐酸-镁粉反应', cls: '黄酮类', swatch: '#dc2626', phenom: '冒气泡并呈樱红至深红色（黄酮/黄酮醇阳性；查耳酮阴性）' },
    { name: 'Molish 紫环反应', cls: '糖与苷类', swatch: '#7e22ce', phenom: 'α-萘酚+浓硫酸沿壁缓加，两液界面现紫红色环' },
    { name: '改良碘化铋钾', cls: '生物碱', swatch: '#ea580c', phenom: '酸性水溶液中立即产生橘红色致密沉淀' },
    { name: 'Borntrager 反应', cls: '羟基蒽醌', swatch: '#e11d48', phenom: '遇稀氨水或 NaOH 显鲜红至紫红色，酸化后褪色' },
    { name: '三氯化铁反应', cls: '酚羟基/鞣质', swatch: '#0f766e', phenom: '显蓝绿色、墨绿色或蓝黑色络合物' },
    { name: 'Liebermann-Burchard', cls: '三萜/甾体皂苷', swatch: '#2563eb', phenom: '醋酐-浓硫酸显黄→红→紫→蓝→绿多色渐变' },
    { name: '香草醛-浓硫酸', cls: '挥发油/萜类', swatch: '#9333ea', phenom: 'TLC 喷雾 105℃ 加热呈现紫红、蓝绿等多彩斑点' },
    { name: '2,4-二硝基苯肼', cls: '挥发油羰基', swatch: '#d97706', phenom: '与醛酮迅速生成橙红色结晶沉淀' }
  ];

  let rotaState = { sol: 'etoh', vacMpa: 0.085 };
  let colState = { crudeG: 2.0, ratio: 35 };

  let timerHandle = null;
  let timerState = { label: '首提回流计时', totalSec: 3600, remainSec: 3600, running: false };
  let viewMode = 'list'; // 'list' | 'kanban'
  let dilState = { c1: 95, c2: 70, v2: 500 };
  let phState = { ph: 8.5 };
  let mpState = { sampleId: 'acetanilide', curTemp: 96, rate: 1.5 };
  let rsdBatches = [
    { before: 3.0, after: 2.24 },
    { before: 3.0, after: 2.19 },
    { before: 3.0, after: 2.28 }
  ];

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }

  function applyThemeSkin(skin) {
    document.body.classList.remove('theme-clinical', 'theme-amber');
    if (skin === 'clinical') document.body.classList.add('theme-clinical');
    else if (skin === 'amber') document.body.classList.add('theme-amber');
    try { localStorage.setItem(THEME_STORE_KEY, skin); } catch {}
  }

  function getSavedSkin() {
    try { return localStorage.getItem(THEME_STORE_KEY) || 'botanical'; } catch { return 'botanical'; }
  }

  function loadPlugins() {
    try {
      const s = JSON.parse(localStorage.getItem(PLUGIN_STORE_KEY) || '{}');
      return {
        phSim: s.phSim !== false,
        mpSim: s.mpSim !== false,
        rotaSim: s.rotaSim !== false,
        colCalc: s.colCalc !== false,
        rsdCalc: s.rsdCalc !== false,
        colorRef: s.colorRef !== false,
        dilution: s.dilution !== false,
        emergency: s.emergency !== false,
        meshTable: s.meshTable === true
      };
    } catch {
      return { phSim: true, mpSim: true, rotaSim: true, colCalc: true, rsdCalc: true, colorRef: true, dilution: true, emergency: true, meshTable: false };
    }
  }
  function savePlugins(p) { try { localStorage.setItem(PLUGIN_STORE_KEY, JSON.stringify(p)); } catch {} }

  function buildTailoredChecklist(herbLabel, temp, solvent) {
    const h = String(herbLabel || '');
    const list = [
      { id: 't1', phase: '① 准备阶段', status: 'done', text: `核对「${h}」药材基原并精准称量，配制 ${solvent || '目标溶剂'}` },
      { id: 't2', phase: '① 准备阶段', status: 'doing', text: '检验玻璃器皿磨口密封性，确认通风橱与护目镜防护到位' }
    ];
    if (/挥发油|薄荷|细辛|当归/.test(h)) {
      list.push({ id: 't3', phase: '② 提取实操', status: 'todo', text: '安装挥发油测定器并注水调零，实验前保持三通管夹开启' });
      list.push({ id: 't4', phase: '② 提取实操', status: 'todo', text: '先通冷凝水（下进上出）再微沸共沸蒸馏，结束先开三通管夹防倒吸' });
      list.push({ id: 't5', phase: '③ 分离纯化', status: 'todo', text: '分取挥发油加无水 Na₂SO₄ 脱水，避光冷藏防氧化' });
      list.push({ id: 't6', phase: '④ 检识交付', status: 'todo', text: '执行硅胶 G 单向二次展开 TLC 与 KMnO₄/FeCl₃/2,4-DNPH 试管鉴别' });
    } else if (/槐米|芦丁|黄芩/.test(h)) {
      list.push({ id: 't3', phase: '② 提取实操', status: 'todo', text: '严控碱提 pH 8~9（或沸水杀酶），趁热抽滤时停泵前先拔橡皮管' });
      list.push({ id: 't4', phase: '③ 分离纯化', status: 'todo', text: '冷至 60~70℃ 慢滴稀酸精准调至 pH 4~5 析晶（防过酸成𨦡盐重溶）' });
      list.push({ id: 't5', phase: '③ 分离纯化', status: 'todo', text: '热水重结晶精制并测定初熔/全熔温度，核验回收率' });
      list.push({ id: 't6', phase: '④ 检识交付', status: 'todo', text: '完成 HCl-Mg 粉、Molish 紫环反应及聚酰胺薄膜色谱鉴别' });
    } else if (/苦参/.test(h)) {
      list.push({ id: 't3', phase: '② 提取实操', status: 'todo', text: '0.3% H₂SO₄ 浸泡 24 h 后以 4~5 mL/min 渗漉收集 400 mL 酸水液' });
      list.push({ id: 't4', phase: '③ 分离纯化', status: 'todo', text: '732 阳离子树脂柱 3~5 mL/min 交换吸附，碘化铋钾检终点' });
      list.push({ id: 't5', phase: '③ 分离纯化', status: 'todo', text: '氨水闷润 15 min 晾干后装入索氏提取器乙醇连续回流 2 h' });
      list.push({ id: 't6', phase: '④ 检识交付', status: 'todo', text: '氯仿-10 倍乙醚结晶分离氧化苦参碱，开展中性 Al₂O₃ TLC 鉴定' });
    } else {
      list.push({ id: 't3', phase: '② 提取实操', status: 'todo', text: `投入 2~3 粒沸石，阶梯控温至 ${temp || 75}℃ 保持平稳回流/提取` });
      list.push({ id: 't4', phase: '③ 分离纯化', status: 'todo', text: '45~55℃ 减压旋蒸回收 75%+ 溶剂，完成萃取/层析并称量精制品' });
      list.push({ id: 't5', phase: '④ 检识交付', status: 'todo', text: '平行点样 TLC 测 Rf 值，录入 3 批平行数据核算平均收率与 RSD' });
    }
    return list;
  }

  function loadMissionStore() {
    try {
      const raw = JSON.parse(localStorage.getItem(MISSION_STORE_KEY) || 'null');
      if (raw && Array.isArray(raw.missions) && raw.missions.length) return raw;
    } catch {}
    const curHerb = document.getElementById('cfgHerbName')?.textContent || '薄荷 · 挥发油提取实验';
    return {
      activeId: 'm_default_1',
      missions: [{
        id: 'm_default_1',
        title: curHerb,
        createdAt: new Date().toLocaleDateString('zh-CN'),
        checklist: JSON.parse(JSON.stringify(DEFAULT_CHECKLIST)),
        logs: [{ time: '08:30', tag: '实验准备', text: '已完成药材称量与玻璃仪器气密性复核，冷却水通路测试顺畅。' }]
      }]
    };
  }
  function saveMissionStore(store) { try { localStorage.setItem(MISSION_STORE_KEY, JSON.stringify(store)); } catch {} }

  function formatSec(sec) {
    return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
  }

  function updateTimerDisplayOnly() {
    const el = document.getElementById('missionTimerReadout');
    const bar = document.getElementById('missionTimerBar');
    if (el) el.textContent = formatSec(timerState.remainSec);
    if (bar) bar.style.width = `${(timerState.totalSec > 0 ? ((timerState.totalSec - timerState.remainSec) / timerState.totalSec) * 100 : 0).toFixed(1)}%`;
  }

  function startTimerLoop() {
    if (timerHandle) clearInterval(timerHandle);
    timerHandle = setInterval(() => {
      if (!timerState.running) return;
      if (timerState.remainSec > 0) { timerState.remainSec--; updateTimerDisplayOnly(); }
      else { timerState.running = false; clearInterval(timerHandle); timerHandle = null; renderMissionPanel(); }
    }, 1000);
  }

  function renderMissionPanel() {
    const panel = document.getElementById('wpanel-mission');
    if (!panel) return;

    const store = loadMissionStore();
    const plugins = loadPlugins();
    const curSkin = getSavedSkin();
    const active = store.missions.find(m => m.id === store.activeId) || store.missions[0];
    if (active) store.activeId = active.id;

    const doneCnt = active.checklist.filter(c => c.status === 'done').length;
    const totalCnt = active.checklist.length || 1;
    const pct = Math.round((doneCnt / totalCnt) * 100);
    const phases = ['① 准备阶段', '② 提取实操', '③ 分离纯化', '④ 检识交付'];

    // C1V1=C2V2
    const v1 = dilState.c1 > 0 ? (dilState.c2 * dilState.v2) / dilState.c1 : 0;
    const vWater = Math.max(0, dilState.v2 - v1);

    // pH 烧杯沉淀状态
    const ph = phState.ph;
    let phColor = '#fef08a', phPrecipH = 4, phStatus = '', phBadgeCls = '';
    if (ph >= 8.0) {
      phColor = '#f59e0b'; phPrecipH = 2;
      phStatus = '碱溶澄清态（pH 8.0~10.0）：酚羟基成钠/钙盐充分溶解于水相，适合趁热抽滤除渣。';
      phBadgeCls = 'bg-amber-100 text-amber-900 border-amber-300';
    } else if (ph >= 3.8 && ph <= 5.5) {
      phColor = '#fde68a'; phPrecipH = 30;
      phStatus = '✨ 黄金酸沉析晶区（pH 4.0~5.0）：游离黄酮/有机酸大量析出致密沉淀，收率最高！';
      phBadgeCls = 'bg-emerald-100 text-emerald-900 border-emerald-300';
    } else if (ph < 2.5) {
      phColor = '#fb923c'; phPrecipH = 6;
      phStatus = '🚨 过酸警示（pH < 2.5）：芦丁等黄酮易质子化生成𨦡盐重新溶解，导致收率明显下降！';
      phBadgeCls = 'bg-rose-100 text-rose-900 border-rose-300';
    } else {
      phColor = '#fef3c7'; phPrecipH = 14;
      phStatus = '过渡区间（pH 5.6~7.9 或 2.6~3.7）：仅部分析出，建议继续微调酸碱度至最佳目标点。';
      phBadgeCls = 'bg-slate-100 text-slate-800 border-slate-300';
    }

    // 熔点测定毛细管状态
    const mpObj = MP_SAMPLES.find(s => s.id === mpState.sampleId) || MP_SAMPLES[1];
    const mpT = mpState.curTemp;
    let mpPhaseText = '❄️ 固态结晶（柱体紧密无塌陷）', mpMeltPct = 0;
    if (mpT >= mpObj.t2) { mpPhaseText = `💧 完全熔融（全熔点 t₂ = ${mpObj.t2}℃，熔程 ${(mpObj.t2 - mpObj.t1).toFixed(1)}℃）`; mpMeltPct = 100; }
    else if (mpT >= mpObj.t1) {
      mpMeltPct = Math.round(((mpT - mpObj.t1) / Math.max(0.2, mpObj.t2 - mpObj.t1)) * 100);
      mpPhaseText = `🔥 正在熔化（已过初熔 t₁ = ${mpObj.t1}℃，液相占比 ${mpMeltPct}%）`;
    }
    const mpRateWarn = mpState.rate > 2.0 ? '⚠️ 距熔点 10℃ 内升温过快（> 2℃/min），会导致测得熔点偏高、熔程变宽！' : '✅ 升温速率符合药典规范（接近熔点控速 0.5~1.5℃/min）。';

    // 3批平行称量回收率与 RSD 计算
    const yields = rsdBatches.map(b => b.before > 0 ? (b.after / b.before) * 100 : 0);
    const meanY = yields.reduce((a, b) => a + b, 0) / yields.length;
    const sdY = Math.sqrt(yields.reduce((s, y) => s + Math.pow(y - meanY, 2), 0) / Math.max(1, yields.length - 1));
    const rsdY = meanY > 0 ? (sdY / meanY) * 100 : 0;


    // 旋蒸真空沸点换算（经验对数减压降沸模型）
    const rSol = ROTAVAP_SOLVENTS.find(x => x.id === rotaState.sol) || ROTAVAP_SOLVENTS[0];
    const pBar = Math.max(0.015, 1.0 - rotaState.vacMpa / 0.1013);
    const bpVac = Math.max(18, rSol.bp0 + (rSol.k * 0.4343 * Math.log(pBar)));
    const bathRec = Math.min(95, bpVac + 18);
    const chillRec = Math.max(0, bpVac - 20);

    // 柱层析装柱速算
    const silicaG = Math.round(colState.crudeG * colState.ratio);
    const colDiam = silicaG <= 30 ? '2.0 cm' : (silicaG <= 100 ? '3.0 cm' : (silicaG <= 250 ? '4.5 cm' : '6.0 cm'));
    const bvMl = Math.round(silicaG * 1.45);
    const enabledPluginCnt = Object.values(plugins).filter(Boolean).length;

    const timerPct = timerState.totalSec > 0 ? ((timerState.totalSec - timerState.remainSec) / timerState.totalSec) * 100 : 0;

    panel.innerHTML = `
      <!-- 顶部横幅 + 主题皮肤切换 + 视图模式切换 -->
      <section class="lab-card rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#062420] via-[#0b3b34] to-[#0f5c54] text-white space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="space-y-1">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/12 text-emerald-200 text-xs font-extrabold">⚡ 任务式实验实操中心 · 多任务 · 可扩展微实验室</div>
            <h2 class="text-xl sm:text-2xl font-extrabold tracking-tight">把实验拆解成可执行的任务流，在虚拟实验台上亲手演练每个关键细节</h2>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button type="button" id="btnAutoDecomposeMission" class="px-4 py-2 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-[#062420] text-xs font-extrabold shadow-sm transition">✨ 按当前课题智能拆解任务</button>
            <button type="button" id="btnNewLabMission" class="px-4 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-[#062420] text-xs font-extrabold shadow-sm transition">+ 新建空白任务</button>
            <button type="button" id="btnExportMissionMd" class="px-3.5 py-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-extrabold transition">📥 导出实验日志</button>
          </div>
        </div>

        
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div class="rounded-2xl bg-white/10 border border-white/15 px-3.5 py-2.5"><div class="text-xs text-teal-200">并行实验任务</div><div class="text-lg font-extrabold text-white tabular-nums">${store.missions.length} 项</div></div>
          <div class="rounded-2xl bg-white/10 border border-white/15 px-3.5 py-2.5"><div class="text-xs text-teal-200">当前任务进度</div><div class="text-lg font-extrabold text-emerald-300 tabular-nums">${pct}% (${doneCnt}/${totalCnt})</div></div>
          <div class="rounded-2xl bg-white/10 border border-white/15 px-3.5 py-2.5"><div class="text-xs text-teal-200">原始现象记录</div><div class="text-lg font-extrabold text-amber-300 tabular-nums">${active.logs.length} 条</div></div>
          <div class="rounded-2xl bg-white/10 border border-white/15 px-3.5 py-2.5"><div class="text-xs text-teal-200">已启微实验室</div><div class="text-lg font-extrabold text-sky-200 tabular-nums">${enabledPluginCnt} / 9 项</div></div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/12 text-xs">
          <div class="flex items-center gap-1.5">
            <span class="text-teal-200 font-bold mr-1">任务视图：</span>
            <button type="button" data-mis-view="list" class="px-3 py-1 rounded-xl font-extrabold transition ${viewMode === 'list' ? 'bg-white text-[#062420]' : 'bg-white/10 text-teal-100 hover:bg-white/20'}">📋 阶段清单模式</button>
            <button type="button" data-mis-view="kanban" class="px-3 py-1 rounded-xl font-extrabold transition ${viewMode === 'kanban' ? 'bg-white text-[#062420]' : 'bg-white/10 text-teal-100 hover:bg-white/20'}">🗂️ 三列看板模式</button>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-teal-200 font-bold mr-1">全站主题皮肤：</span>
            ${[
              ['botanical', '🌿 本草青瓷'],
              ['clinical', '🔬 科研冰蓝'],
              ['amber', '🏮 典籍琥珀']
            ].map(([sk, lbl]) => `
              <button type="button" data-theme-skin="${sk}" class="px-2.5 py-1 rounded-xl font-bold transition ${curSkin === sk ? 'bg-amber-400 text-[#062420]' : 'bg-white/10 text-teal-100 hover:bg-white/20'}">${lbl}</button>
            `).join('')}
          </div>
        </div>
      </section>

      <div class="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        <!-- 左栏：多任务线程列表 + 6 大可扩展微实验室插件开关 -->
        <div class="xl:col-span-4 space-y-5">
          <section class="lab-card v9-visual-card rounded-3xl p-4 sm:p-5 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-extrabold text-slate-900">📋 并行实验任务 (${store.missions.length})</h3>
              <span class="text-xs text-slate-500">点击切换线程</span>
            </div>
            <div class="space-y-2">
              ${store.missions.map(m => {
                const d = m.checklist.filter(x => x.status === 'done').length;
                const p = Math.round((d / Math.max(1, m.checklist.length)) * 100);
                const isAct = m.id === active.id;
                return `
                  <div data-select-mission="${m.id}" class="cursor-pointer p-3.5 rounded-2xl border transition ${isAct ? 'bg-gradient-to-r from-[#062420] to-[#0f5c54] text-white border-[#062420] shadow-md' : 'bg-slate-50 hover:bg-teal-50/60 border-slate-200/80 text-slate-800'}">
                    <div class="flex items-center justify-between gap-2">
                      <span class="text-sm font-extrabold truncate">${esc(m.title)}</span>
                      ${store.missions.length > 1 ? `<button type="button" data-del-mission="${m.id}" class="px-1.5 text-xs opacity-65 hover:opacity-100" title="删除任务">×</button>` : ''}
                    </div>
                    <div class="flex items-center justify-between text-xs mt-1.5 opacity-85">
                      <span>${m.createdAt} · ${d}/${m.checklist.length} 完成</span>
                      <span class="font-extrabold tabular-nums">${p}%</span>
                    </div>
                    <div class="h-1.5 rounded-full ${isAct ? 'bg-white/20' : 'bg-slate-200'} mt-2 overflow-hidden">
                      <div class="h-full rounded-full ${isAct ? 'bg-emerald-300' : 'bg-[#0f5c54]'}" style="width:${p}%"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </section>

          <section class="lab-card v9-visual-card rounded-3xl p-4 sm:p-5 space-y-3">
            <div>
              <h3 class="text-base font-extrabold text-slate-900">🔌 可扩展微实验室插件</h3>
              <div class="flex items-center justify-between gap-2"><p class="text-xs text-slate-500">按需插拔专业微工具</p><div class="flex gap-1"><button type="button" id="btnPluginAllOn" class="px-2 py-0.5 rounded-lg bg-teal-50 text-[#0f5c54] text-[11px] font-bold">全开</button><button type="button" id="btnPluginMinimal" class="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold">精简</button></div></div>
            </div>
            <div class="space-y-2 text-xs">
              ${[
                ['phSim', '🧫 酸沉/碱游离 pH 动态烧杯模拟仪'],
                ['mpSim', '🌡️ 毛细管熔点测定晶体熔融模拟仪'],
                ['rotaSim', '🌊 减压旋蒸沸点与水浴温差换算仪'],
                ['colCalc', '🫧 柱层析装柱硅胶量与 BV 速算器'],
                ['rsdCalc', '⚖️ 3 批平行称量回收率与 RSD 验收台'],
                ['colorRef', '🎨 8 大中药化学显色反应速查卡'],
                ['dilution', '🧪 溶液稀释配制计算器 (C₁V₁=C₂V₂)'],
                ['emergency', '🧯 实验室突发异常应急处置速查'],
                ['meshTable', '📏 中国药典筛网目数与粒径对照表']
              ].map(([key, label]) => `
                <label class="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer v9-chart-surface">
                  <span class="font-bold text-slate-800">${label}</span>
                  <input type="checkbox" data-toggle-plugin="${key}" ${plugins[key] ? 'checked' : ''} class="w-4 h-4 accent-emerald-600" />
                </label>
              `).join('')}
            </div>
          </section>
        </div>

        <!-- 右栏：任务执行主舞台 + 计时器/记录本 + 已启用插件 -->
        <div class="xl:col-span-8 space-y-5">
          <!-- 1. 任务执行区（支持 清单模式 / 三列看板模式） -->
          <section class="lab-card v9-visual-card rounded-3xl p-5 space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 class="text-base font-extrabold text-slate-900">✅ 当前任务：${esc(active.title)}</h3>
                <p class="text-xs text-slate-500">${viewMode === 'kanban' ? '点击卡片按钮即可在「待准备 → 实操中 → 已验收」之间自由流转' : '按 4 大实验阶段逐项勾选打卡，可随时补充自定义提醒'}</p>
              </div>
              <span class="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold tabular-nums">完成度 ${doneCnt} / ${totalCnt} (${pct}%)</span>
            </div>

            <div class="h-2.5 rounded-full bg-slate-200/80 overflow-hidden">
              <div class="h-full bg-gradient-to-r from-[#0a3630] via-emerald-500 to-amber-400 transition-all duration-300" style="width:${pct}%"></div>
            </div>

            ${viewMode === 'kanban' ? `
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                ${[
                  ['todo', '📌 待准备', 'bg-slate-50 border-slate-200', '▶ 开始实操', 'doing'],
                  ['doing', '🔥 实验进行中', 'bg-amber-50/70 border-amber-200', '✓ 验收完成', 'done'],
                  ['done', '✅ 已验收归档', 'bg-emerald-50/70 border-emerald-200', '↺ 重新核验', 'doing']
                ].map(([st, title, cls, nextLbl, nextSt]) => {
                  const colItems = active.checklist.filter(c => c.status === st);
                  return `
                    <div class="rounded-2xl border p-3 space-y-2.5 ${cls} v9-chart-surface">
                      <div class="flex items-center justify-between text-xs font-extrabold text-slate-800">
                        <span>${title}</span>
                        <span class="px-2 py-0.5 rounded-full bg-white text-slate-600">${colItems.length}</span>
                      </div>
                      <div class="space-y-2">
                        ${colItems.map(it => `
                          <div class="p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                            <div class="text-[11px] font-bold text-[#0f5c54]">${esc(it.phase)}</div>
                            <div class="text-xs font-semibold text-slate-800 leading-relaxed">${esc(it.text)}</div>
                            <button type="button" data-move-task="${it.id}|${nextSt}" class="w-full py-1.5 rounded-lg bg-slate-100 hover:bg-[#0a3630] hover:text-white text-slate-700 text-xs font-bold transition">${nextLbl}</button>
                          </div>
                        `).join('') || '<div class="text-xs text-slate-400 text-center py-4">暂无任务</div>'}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            ` : `
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                ${phases.map(ph => {
                  const items = active.checklist.filter(c => c.phase === ph);
                  return `
                    <div class="rounded-2xl bg-slate-50/90 border border-slate-200/80 p-3.5 space-y-2 v9-chart-surface">
                      <div class="text-xs font-extrabold text-[#0f5c54]">${ph}</div>
                      ${items.map(it => `
                        <label class="flex items-start gap-2.5 text-xs cursor-pointer p-1.5 rounded-xl hover:bg-white/80 transition">
                          <input type="checkbox" data-check-item="${it.id}" ${it.status === 'done' ? 'checked' : ''} class="mt-0.5 w-4 h-4 accent-emerald-600 shrink-0" />
                          <span class="${it.status === 'done' ? 'line-through opacity-60' : 'text-slate-800 font-medium'} leading-relaxed">${esc(it.text)}</span>
                        </label>
                      `).join('')}
                    </div>
                  `;
                }).join('')}
              </div>
            `}

            <form id="formAddCheckItem" class="flex flex-col sm:flex-row gap-2">
              <select id="newCheckPhase" class="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold">
                ${phases.map(ph => `<option value="${ph}">${ph}</option>`).join('')}
              </select>
              <input id="newCheckText" type="text" placeholder="添加自定义实操节点（如：记录真空表读数、避光冷藏样品）..." class="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs" />
              <button type="submit" class="px-4 py-2 rounded-xl bg-[#0a3630] hover:bg-[#062420] text-white text-xs font-extrabold shrink-0">+ 加入任务</button>
            </form>
          </section>

          <!-- 2. 实验台精准计时器 + 电子原始记录本 -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <section class="lg:col-span-5 lab-card v9-visual-card rounded-3xl p-5 space-y-3.5">
              <div class="flex items-center justify-between">
                <h3 class="text-base font-extrabold text-slate-900">⏱️ 实验台精准计时器</h3>
                <span class="text-xs font-bold text-[#0f5c54]">${esc(timerState.label)}</span>
              </div>
              <div class="rounded-2xl bg-gradient-to-br from-[#062420] to-[#0f5c54] text-white p-5 text-center space-y-3">
                <div id="missionTimerReadout" class="text-4xl font-extrabold font-mono tracking-wider tabular-nums">${formatSec(timerState.remainSec)}</div>
                <div class="h-2 rounded-full bg-white/15 overflow-hidden"><div id="missionTimerBar" class="h-full bg-amber-300 transition-all duration-500" style="width:${timerPct.toFixed(1)}%"></div></div>
                <div class="flex justify-center gap-2 pt-1">
                  <button type="button" id="btnTimerToggle" class="px-4 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-[#062420] text-xs font-extrabold transition">${timerState.running ? '⏸ 暂停' : '▶ 开始计时'}</button>
                  <button type="button" id="btnTimerReset" class="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition">↺ 重置</button>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2 text-xs">
                <button type="button" data-timer-preset="900|展开缸饱和" class="py-2 px-2 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-700 font-bold">展缸饱和 15m</button>
                <button type="button" data-timer-preset="1800|润药浸泡" class="py-2 px-2 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-700 font-bold">润药浸泡 30m</button>
                <button type="button" data-timer-preset="2400|超声提取" class="py-2 px-2 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-700 font-bold">超声提取 40m</button>
                <button type="button" data-timer-preset="3600|首提回流" class="py-2 px-2 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-700 font-bold">首提回流 60m</button>
              </div>
            </section>

            <section class="lg:col-span-7 lab-card v9-visual-card rounded-3xl p-5 space-y-3.5">
              <div class="flex items-center justify-between gap-2">
                <h3 class="text-base font-extrabold text-slate-900">📝 带时间戳原始记录本</h3>
                <button type="button" id="btnCopyLabLogs" class="px-3 py-1 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-[#0a3630] text-xs font-extrabold">复制记录全文</button>
              </div>
              <div class="max-h-[210px] overflow-y-auto custom-scroll space-y-2 pr-1">
                ${active.logs.map((lg, idx) => `
                  <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs flex items-start justify-between gap-2 v9-chart-surface">
                    <div class="space-y-1">
                      <div class="flex items-center gap-2"><span class="font-mono font-extrabold text-[#0f5c54]">${esc(lg.time)}</span><span class="px-2 py-0.5 rounded-full bg-teal-100 text-[#0a3630] text-[10px] font-bold">${esc(lg.tag)}</span></div>
                      <div class="text-slate-700 leading-relaxed">${esc(lg.text)}</div>
                    </div>
                    <button type="button" data-del-log="${idx}" class="text-slate-400 hover:text-rose-600 font-bold px-1">×</button>
                  </div>
                `).join('')}
              </div>
              <form id="formAddLabLog" class="flex flex-col sm:flex-row gap-2">
                <select id="labLogTag" class="px-2.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"><option>现象观察</option><option>参数微调</option><option>称量记录</option><option>异常排障</option></select>
                <input id="labLogText" type="text" placeholder="记录实时颜色、沉淀、熔点或称量读数..." class="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs" />
                <button type="submit" class="px-4 py-2 rounded-xl bg-[#0a3630] hover:bg-[#062420] text-white text-xs font-extrabold shrink-0">记录</button>
              </form>
            </section>
          </div>

          <!-- 3. 细节参与插件 A：酸沉/碱游离动态 pH 烧杯模拟仪 -->
          ${plugins.phSim ? `
            <section class="lab-card v9-visual-card rounded-3xl p-5 space-y-4">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 class="text-base font-extrabold text-slate-900">🧫 细节模拟 · 碱提酸沉 pH 滴定与析晶动态烧杯</h3>
                  <p class="text-xs text-slate-500">亲手滴加稀盐酸或石灰乳，直观体验槐米芦丁/黄芩苷在 pH 8~9 溶解、pH 4~5 析晶与过酸成𨦡盐重溶现象</p>
                </div>
                <span class="px-3 py-1 rounded-full bg-[#062420] text-emerald-200 font-mono text-sm font-extrabold tabular-nums">pH ${ph.toFixed(1)}</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div class="md:col-span-4 flex justify-center">
                  <svg viewBox="0 0 150 140" class="w-[144px] h-[134px] select-none">
                    <defs><clipPath id="phBeakerClip"><rect x="30" y="28" width="90" height="96" rx="10"/></clipPath></defs>
                    <g clip-path="url(#phBeakerClip)">
                      <rect x="30" y="54" width="90" height="70" fill="${phColor}" style="transition: fill 0.35s ease;" />
                      <rect x="30" y="${124 - phPrecipH}" width="90" height="${phPrecipH}" fill="#b45309" fill-opacity="0.88" style="transition: y 0.35s ease, height 0.35s ease;" />
                    </g>
                    <path d="M26 26 L30 26 L30 116 Q30 124 38 124 L112 124 Q120 124 120 116 L120 26 L124 26" fill="none" stroke="#0f5c54" stroke-width="2.6" stroke-linecap="round"/>
                    <text x="75" y="46" text-anchor="middle" fill="#0f5c54" font-size="11" font-weight="800">pH = ${ph.toFixed(1)}</text>
                  </svg>
                </div>
                <div class="md:col-span-8 space-y-3 text-xs">
                  <div class="flex flex-wrap gap-2">
                    <button type="button" data-ph-delta="-1.0" class="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-900 font-extrabold">💧 滴加浓 HCl (-1.0)</button>
                    <button type="button" data-ph-delta="-0.3" class="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-extrabold">💧 微调稀酸 (-0.3)</button>
                    <button type="button" data-ph-delta="0.5" class="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-[#0a3630] font-extrabold">💧 滴加石灰乳 (+0.5)</button>
                    <button type="button" data-ph-set="4.5" class="px-3 py-1.5 rounded-xl bg-[#0a3630] text-white font-extrabold">🎯 精准调至 pH 4.5</button>
                  </div>
                  <div class="p-3 rounded-2xl border font-bold leading-relaxed ${phBadgeCls}">${phStatus}</div>
                </div>
              </div>
            </section>
          ` : ''}

          <!-- 4. 细节参与插件 B：毛细管熔点测定动态模拟仪 -->
          ${plugins.mpSim ? `
            <section class="lab-card v9-visual-card rounded-3xl p-5 space-y-4">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 class="text-base font-extrabold text-slate-900">🌡️ 细节模拟 · 毛细管熔点测定仪（初熔 t₁ / 全熔 t₂ 观察）</h3>
                  <p class="text-xs text-slate-500">切换纯品与含杂质粗品，滑动电热台温度观察毛细管内晶体塌陷与全熔过程</p>
                </div>
                <span class="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-mono text-sm font-extrabold tabular-nums">${mpT.toFixed(1)} ℃</span>
              </div>
              <div class="flex flex-wrap gap-1.5">
                ${MP_SAMPLES.map(s => `<button type="button" data-mp-sample="${s.id}" class="px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ${s.id === mpObj.id ? 'bg-[#0a3630] text-white border-[#0a3630]' : 'bg-white text-slate-700 border-slate-200'}">${esc(s.name)}</button>`).join('')}
              </div>
              <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center text-xs">
                <div class="md:col-span-4 flex justify-center">
                  <svg viewBox="0 0 120 130" class="w-[116px] h-[126px]">
                    <rect x="48" y="10" width="24" height="106" rx="12" fill="#f8fafc" stroke="#0f5c54" stroke-width="2.2" />
                    <!-- 液态透明熔融层 -->
                    <rect x="51" y="${112 - Math.round(mpMeltPct * 0.48)}" width="18" height="${Math.round(mpMeltPct * 0.48)}" rx="6" fill="#38bdf8" fill-opacity="0.65" />
                    <!-- 未熔固体晶体颗粒 -->
                    <rect x="52" y="${64 + Math.round(mpMeltPct * 0.46)}" width="16" height="${Math.max(0, 48 - Math.round(mpMeltPct * 0.48))}" rx="4" fill="#e2e8f0" stroke="#94a3b8" stroke-dasharray="2 2" />
                    <text x="60" y="127" text-anchor="middle" fill="#0f5c54" font-size="10.5" font-weight="800">2~3mm 样品柱</text>
                  </svg>
                </div>
                <div class="md:col-span-8 space-y-2.5">
                  <div>
                    <div class="flex justify-between font-bold mb-1"><span>加热台实时温度（拖动升温观察初熔/全熔）</span><span class="text-[#0f5c54] tabular-nums">${mpT.toFixed(1)} ℃</span></div>
                    <input id="mpTempSlider" type="range" min="70" max="185" step="0.5" value="${mpT}" class="w-full accent-amber-500" />
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="font-bold text-slate-600">升温速率：</span>
                    ${[1.0, 1.5, 4.0].map(r => `<button type="button" data-mp-rate="${r}" class="px-2.5 py-1 rounded-lg font-bold border ${mpState.rate === r ? 'bg-[#0a3630] text-white border-[#0a3630]' : 'bg-white text-slate-700 border-slate-200'}">${r} ℃/min</button>`).join('')}
                  </div>
                  <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 v9-chart-surface">
                    <div class="font-extrabold text-slate-900">${mpPhaseText}</div>
                    <div class="text-slate-600">${esc(mpObj.note)}</div>
                    <div class="${mpState.rate > 2 ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}">${mpRateWarn}</div>
                  </div>
                </div>
              </div>
            </section>
          ` : ''}

          <!-- 5. 细节参与插件 C：3批平行称量回收率与 RSD 验收台 -->
          ${plugins.rsdCalc ? `
            <section class="lab-card v9-visual-card rounded-3xl p-5 space-y-3.5">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 class="text-base font-extrabold text-slate-900">⚖️ 细节验收 · 3 批平行称量回收率与 RSD 自动核算台</h3>
                  <p class="text-xs text-slate-500">直接录入实验前粗品重与精制后干重，即时计算平均回收率与精密度 RSD</p>
                </div>
                <button type="button" id="btnLogRsdToNotebook" class="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-[#0a3630] text-xs font-extrabold">写入原始记录本 →</button>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                ${rsdBatches.map((b, i) => `
                  <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 v9-chart-surface">
                    <div class="flex justify-between font-extrabold text-[#0f5c54]"><span>第 ${i + 1} 批平行样</span><span class="tabular-nums">${yields[i].toFixed(1)}%</span></div>
                    <div class="grid grid-cols-2 gap-2">
                      <div><label class="block text-[11px] text-slate-500">实验前 (g)</label><input type="number" step="0.01" data-rsd-b="${i}|before" value="${b.before}" class="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white tabular-nums" /></div>
                      <div><label class="block text-[11px] text-slate-500">实验后 (g)</label><input type="number" step="0.01" data-rsd-b="${i}|after" value="${b.after}" class="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white tabular-nums" /></div>
                    </div>
                  </div>
                `).join('')}
              </div>
              <div class="p-3.5 rounded-2xl border ${rsdY <= 3.0 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'} text-xs sm:text-sm font-extrabold flex flex-wrap justify-between gap-2 tabular-nums">
                <span>平均回收率：${meanY.toFixed(2)}% ｜ 标准差 SD：${sdY.toFixed(2)}% ｜ 精密度 RSD：${rsdY.toFixed(2)}%</span>
                <span>${rsdY <= 3.0 ? '✅ 精密度达标 (RSD ≤ 3.0%)' : '⚠️ 波动偏大，建议排查转移损耗与冷却一致性'}</span>
              </div>
            </section>
          ` : ''}


          ${plugins.rotaSim ? `
            <section class="lab-card v9-visual-card rounded-3xl p-5 space-y-4">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 class="text-base font-extrabold text-slate-900">🌊 细节模拟 · 减压旋转蒸发沸点与「20℃ 黄金温差」换算仪</h3>
                  <p class="text-xs text-slate-500">调节真空度与溶剂种类，自动推算减压沸点、推荐水浴温度与冷凝水温，防暴沸防倒吸</p>
                </div>
                <span class="px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-900 font-mono text-xs font-extrabold tabular-nums">真空 -${rotaState.vacMpa.toFixed(3)} MPa</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label class="block font-bold text-slate-700 mb-1">待浓缩溶剂</label>
                  <select id="rotaSolSel" class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold">
                    ${ROTAVAP_SOLVENTS.map(s => `<option value="${s.id}" ${s.id === rSol.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}
                  </select>
                </div>
                <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 v9-chart-surface">
                  <div class="flex justify-between font-bold mb-1"><span>水泵/隔膜泵真空度</span><span class="text-[#0f5c54] tabular-nums">-${rotaState.vacMpa.toFixed(3)} MPa</span></div>
                  <input id="rotaVacSlider" type="range" min="0.010" max="0.096" step="0.002" value="${rotaState.vacMpa}" class="w-full accent-sky-600" />
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center text-xs tabular-nums">
                <div class="p-3 rounded-2xl bg-sky-50 border border-sky-200"><div class="text-slate-500">减压下实际沸点</div><div class="text-lg font-extrabold text-sky-900 mt-0.5">${bpVac.toFixed(1)} ℃</div></div>
                <div class="p-3 rounded-2xl bg-amber-50 border border-amber-200"><div class="text-slate-500">推荐水浴锅温度</div><div class="text-lg font-extrabold text-amber-900 mt-0.5">${bathRec.toFixed(1)} ℃</div></div>
                <div class="p-3 rounded-2xl bg-emerald-50 border border-emerald-200"><div class="text-slate-500">建议冷凝循环水温</div><div class="text-lg font-extrabold text-emerald-900 mt-0.5">≤ ${chillRec.toFixed(0)} ℃</div></div>
              </div>
            </section>
          ` : ''}

          ${plugins.colCalc ? `
            <section class="lab-card v9-visual-card rounded-3xl p-5 space-y-3.5">
              <div>
                <h3 class="text-base font-extrabold text-slate-900">🫧 细节算具 · 柱层析硅胶装柱量与柱体积 (BV) 速算器</h3>
                <p class="text-xs text-slate-500">输入粗浸膏质量与分离难度，自动换算 200~300 目硅胶用量、层析柱内径与梯度洗脱备液量</p>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div><label class="block font-bold text-slate-700 mb-1">粗浸膏上样量 (g)</label><input id="colCrudeInp" type="number" step="0.5" min="0.2" max="50" value="${colState.crudeG}" class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold tabular-nums" /></div>
                <div>
                  <label class="block font-bold text-slate-700 mb-1">分离难度（硅胶:样品比）</label>
                  <select id="colRatioSel" class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold">
                    <option value="25" ${colState.ratio === 25 ? 'selected' : ''}>常规快速分离 (25 : 1)</option>
                    <option value="35" ${colState.ratio === 35 ? 'selected' : ''}>标准教学精制 (35 : 1)</option>
                    <option value="60" ${colState.ratio === 60 ? 'selected' : ''}>相近极性难分单体 (60 : 1)</option>
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs tabular-nums">
                <div class="p-3 rounded-2xl bg-teal-50 border border-teal-200"><div class="text-slate-500">推荐硅胶用量</div><div class="text-base font-extrabold text-[#0a3630] mt-0.5">${silicaG} g</div></div>
                <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200"><div class="text-slate-500">推荐柱内径</div><div class="text-base font-extrabold text-slate-900 mt-0.5">${colDiam}</div></div>
                <div class="p-3 rounded-2xl bg-indigo-50 border border-indigo-200"><div class="text-slate-500">估算 1 柱体积</div><div class="text-base font-extrabold text-indigo-900 mt-0.5">${bvMl} mL</div></div>
                <div class="p-3 rounded-2xl bg-amber-50 border border-amber-200"><div class="text-slate-500">单梯度备液 (3 BV)</div><div class="text-base font-extrabold text-amber-900 mt-0.5">${bvMl * 3} mL</div></div>
              </div>
            </section>
          ` : ''}

          ${plugins.colorRef ? `
            <section class="lab-card v9-visual-card rounded-3xl p-5 space-y-3">
              <h3 class="text-base font-extrabold text-slate-900">🎨 8 大经典中药化学检识显色反应速查卡</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                ${COLOR_REACTIONS.map(cr => `
                  <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 v9-chart-surface">
                    <span class="w-4 h-4 rounded-full shrink-0 mt-0.5 border border-white shadow-xs" style="background:${cr.swatch}"></span>
                    <div class="space-y-0.5">
                      <div class="font-extrabold text-slate-900">${esc(cr.name)} <span class="text-[#0f5c54] font-bold">· ${esc(cr.cls)}</span></div>
                      <div class="text-slate-600 leading-relaxed">${esc(cr.phenom)}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </section>
          ` : ''}

          <!-- 6. 稀释配液 / 应急处置 / 药典筛网表 -->
          ${plugins.dilution ? `
            <section class="lab-card v9-visual-card rounded-3xl p-5 space-y-3">
              <h3 class="text-base font-extrabold text-slate-900">🧪 溶液稀释配制速算器（C₁V₁ = C₂V₂）</h3>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div><label class="block font-bold text-slate-700 mb-1">母液浓度 C₁ (%)</label><input id="dilC1" type="number" step="0.5" min="1" max="100" value="${dilState.c1}" class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold tabular-nums" /></div>
                <div><label class="block font-bold text-slate-700 mb-1">目标浓度 C₂ (%)</label><input id="dilC2" type="number" step="0.5" min="0.1" max="100" value="${dilState.c2}" class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold tabular-nums" /></div>
                <div><label class="block font-bold text-slate-700 mb-1">目标总体积 V₂ (mL)</label><input id="dilV2" type="number" step="10" min="10" max="10000" value="${dilState.v2}" class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold tabular-nums" /></div>
              </div>
              <div class="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-950 font-bold">
                配制方案：量取 <strong class="text-[#0f5c54] tabular-nums">${v1.toFixed(1)} mL</strong> 母液（${dilState.c1}%），加纯化水 <strong class="text-amber-700 tabular-nums">${vWater.toFixed(1)} mL</strong> 定容混匀即可（酸液稀释牢记：酸入水、慢搅拌）。
              </div>
            </section>
          ` : ''}

          ${plugins.emergency ? `
            <section class="lab-card v9-visual-card rounded-3xl p-5 space-y-3">
              <h3 class="text-base font-extrabold text-slate-900">🧯 实验室突发异常应急处置速查</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                ${EMERGENCY_CARDS.map(ec => `<div class="p-3.5 rounded-2xl bg-rose-50/75 border border-rose-200/80 space-y-1"><div class="font-extrabold text-rose-900">${ec.title}</div><p class="text-rose-950/85 leading-relaxed">${ec.action}</p></div>`).join('')}
              </div>
            </section>
          ` : ''}

          ${plugins.meshTable ? `
            <section class="lab-card v9-visual-card rounded-3xl p-5 space-y-3">
              <h3 class="text-base font-extrabold text-slate-900">📏 中国药典常用药筛目数与粒径速查表</h3>
              <div class="overflow-x-auto"><table class="w-full text-xs text-left border-collapse"><thead><tr class="border-b border-slate-200 text-slate-500"><th class="py-2 pr-3 font-extrabold">药典筛号</th><th class="py-2 pr-3 font-extrabold">目数</th><th class="py-2 pr-3 font-extrabold">内径</th><th class="py-2 font-extrabold">适用场景</th></tr></thead><tbody class="divide-y divide-slate-100">${MESH_TABLE.map(r => `<tr><td class="py-2 pr-3 font-extrabold text-slate-900">${r.name}</td><td class="py-2 pr-3 font-bold text-[#0f5c54]">${r.mesh}</td><td class="py-2 pr-3 font-mono text-slate-600">${r.um}</td><td class="py-2 text-slate-700">${r.use}</td></tr>`).join('')}</tbody></table></div>
            </section>
          ` : ''}
        </div>
      </div>
    `;

    // 绑定视图与主题皮肤切换
    panel.querySelectorAll('[data-mis-view]').forEach(b => b.onclick = () => { viewMode = b.dataset.misView; renderMissionPanel(); });
    panel.querySelectorAll('[data-theme-skin]').forEach(b => b.onclick = () => { applyThemeSkin(b.dataset.themeSkin); renderMissionPanel(); });

    // 智能按当前课题拆解任务 / 新建任务
    const addMission = (title, customList) => {
      const nm = {
        id: 'm_' + Date.now(),
        title,
        createdAt: new Date().toLocaleDateString('zh-CN'),
        checklist: customList,
        logs: [{ time: new Date().toTimeString().slice(0, 5), tag: '任务拆解', text: `已按「${title}」自动生成 ${customList.length} 项专属实验检查单。` }]
      };
      store.missions.unshift(nm);
      store.activeId = nm.id;
      saveMissionStore(store);
      renderMissionPanel();
    };

    const btnAuto = panel.querySelector('#btnAutoDecomposeMission');
    if (btnAuto) btnAuto.onclick = () => {
      const h = document.getElementById('cfgHerbName')?.textContent || '当前实验课题';
      const t = document.getElementById('cfgTemp')?.value || '75';
      const s = document.getElementById('cfgSolventType')?.value || '70%乙醇';
      addMission(`${h} · 实操任务`, buildTailoredChecklist(h, t, s));
    };
    const btnNew = panel.querySelector('#btnNewLabMission');
    if (btnNew) btnNew.onclick = () => {
      const title = prompt('请输入新实验任务名称（如：苦参总生物碱阳离子树脂提取）：', '自定义实验任务');
      if (title && title.trim()) addMission(title.trim(), JSON.parse(JSON.stringify(DEFAULT_CHECKLIST)).map(c => ({ ...c, status: 'todo' })));
    };

    // 任务切换/删除
    panel.querySelectorAll('[data-select-mission]').forEach(el => el.onclick = e => {
      if (e.target.closest('[data-del-mission]')) return;
      store.activeId = el.dataset.selectMission; saveMissionStore(store); renderMissionPanel();
    });
    panel.querySelectorAll('[data-del-mission]').forEach(btn => btn.onclick = e => {
      e.stopPropagation();
      const id = btn.dataset.delMission;
      store.missions = store.missions.filter(m => m.id !== id);
      if (store.activeId === id && store.missions[0]) store.activeId = store.missions[0].id;
      saveMissionStore(store); renderMissionPanel();
    });

    // 插件开关
    panel.querySelectorAll('[data-toggle-plugin]').forEach(cb => cb.onchange = () => {
      plugins[cb.dataset.togglePlugin] = cb.checked; savePlugins(plugins); renderMissionPanel();
    });

    // 清单勾选 & 看板流转
    panel.querySelectorAll('[data-check-item]').forEach(cb => cb.onchange = () => {
      const item = active.checklist.find(c => c.id === cb.dataset.checkItem);
      if (item) item.status = cb.checked ? 'done' : 'todo';
      saveMissionStore(store); renderMissionPanel();
    });
    panel.querySelectorAll('[data-move-task]').forEach(btn => btn.onclick = () => {
      const [tid, st] = btn.dataset.moveTask.split('|');
      const item = active.checklist.find(c => c.id === tid);
      if (item) item.status = st;
      saveMissionStore(store); renderMissionPanel();
    });

    const addChkForm = panel.querySelector('#formAddCheckItem');
    if (addChkForm) addChkForm.onsubmit = e => {
      e.preventDefault();
      const txt = panel.querySelector('#newCheckText').value.trim();
      const ph = panel.querySelector('#newCheckPhase').value;
      if (!txt) return;
      active.checklist.push({ id: 'c_' + Date.now(), phase: ph, status: 'todo', text: txt });
      saveMissionStore(store); renderMissionPanel();
    };

    // 计时器
    const btnToggleT = panel.querySelector('#btnTimerToggle');
    if (btnToggleT) btnToggleT.onclick = () => { timerState.running = !timerState.running; if (timerState.running) startTimerLoop(); renderMissionPanel(); };
    const btnResetT = panel.querySelector('#btnTimerReset');
    if (btnResetT) btnResetT.onclick = () => { timerState.running = false; timerState.remainSec = timerState.totalSec; renderMissionPanel(); };
    panel.querySelectorAll('[data-timer-preset]').forEach(b => b.onclick = () => {
      const [sec, lbl] = b.dataset.timerPreset.split('|');
      timerState.running = false; timerState.totalSec = Number(sec); timerState.remainSec = Number(sec); timerState.label = lbl; renderMissionPanel();
    });

    // 记录本
    const addLogForm = panel.querySelector('#formAddLabLog');
    if (addLogForm) addLogForm.onsubmit = e => {
      e.preventDefault();
      const txt = panel.querySelector('#labLogText').value.trim();
      const tag = panel.querySelector('#labLogTag').value;
      if (!txt) return;
      active.logs.unshift({ time: new Date().toTimeString().slice(0, 5), tag, text: txt });
      saveMissionStore(store); renderMissionPanel();
    };
    panel.querySelectorAll('[data-del-log]').forEach(b => b.onclick = () => { active.logs.splice(Number(b.dataset.delLog), 1); saveMissionStore(store); renderMissionPanel(); });
    const copyLogsBtn = panel.querySelector('#btnCopyLabLogs');
    if (copyLogsBtn) copyLogsBtn.onclick = () => {
      const out = `【${active.title} · 实验原始记录】\n` + active.logs.map(l => `[${l.time}] (${l.tag}) ${l.text}`).join('\n');
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(out).catch(() => {});
      copyLogsBtn.textContent = '✓ 已复制'; setTimeout(() => { copyLogsBtn.textContent = '复制记录全文'; }, 1500);
    };

    // pH 烧杯事件
    panel.querySelectorAll('[data-ph-delta]').forEach(b => b.onclick = () => {
      phState.ph = Math.max(1.0, Math.min(12.0, phState.ph + Number(b.dataset.phDelta)));
      renderMissionPanel();
    });
    panel.querySelectorAll('[data-ph-set]').forEach(b => b.onclick = () => { phState.ph = Number(b.dataset.phSet); renderMissionPanel(); });

    // 熔点模拟事件
    panel.querySelectorAll('[data-mp-sample]').forEach(b => b.onclick = () => {
      mpState.sampleId = b.dataset.mpSample;
      const obj = MP_SAMPLES.find(x => x.id === mpState.sampleId);
      if (obj) mpState.curTemp = Math.max(70, obj.t1 - 8);
      renderMissionPanel();
    });
    const mpSlider = panel.querySelector('#mpTempSlider');
    if (mpSlider) mpSlider.oninput = () => { mpState.curTemp = Number(mpSlider.value); renderMissionPanel(); };
    panel.querySelectorAll('[data-mp-rate]').forEach(b => b.onclick = () => { mpState.rate = Number(b.dataset.mpRate); renderMissionPanel(); });

    // RSD 称量验收事件
    panel.querySelectorAll('[data-rsd-b]').forEach(inp => inp.oninput = () => {
      const [idx, field] = inp.dataset.rsdB.split('|');
      rsdBatches[Number(idx)][field] = Number(inp.value) || 0;
      renderMissionPanel();
    });
    const logRsdBtn = panel.querySelector('#btnLogRsdToNotebook');
    if (logRsdBtn) logRsdBtn.onclick = () => {
      active.logs.unshift({
        time: new Date().toTimeString().slice(0, 5),
        tag: '称量记录',
        text: `3 批平行样回收率：${yields.map(y => y.toFixed(1) + '%').join(' / ')}，平均 ${meanY.toFixed(2)}%，RSD = ${rsdY.toFixed(2)}%（${rsdY <= 3 ? '达标' : '偏大'}）。`
      });
      saveMissionStore(store); renderMissionPanel();
    };


    const btnExpMd = panel.querySelector('#btnExportMissionMd');
    if (btnExpMd) btnExpMd.onclick = () => {
      const md = `# ${active.title} — 实验任务与原始记录\n\n日期：${active.createdAt} ｜ 完成度：${pct}% (${doneCnt}/${totalCnt})\n\n## 一、实操检查单\n` +
        active.checklist.map(c => `- [${c.status === 'done' ? 'x' : ' '}] (${c.phase}) ${c.text}`).join('\n') +
        `\n\n## 二、时间戳原始记录\n` +
        active.logs.map(l => `- **[${l.time}] ${l.tag}**：${l.text}`).join('\n');
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      const u = URL.createObjectURL(blob); const a = document.createElement('a');
      a.href = u; a.download = `${active.title.replace(/[^\w\u4e00-\u9fa5]+/g, '_')}_实验日志.md`;
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 1000);
    };
    const btnAllOn = panel.querySelector('#btnPluginAllOn');
    if (btnAllOn) btnAllOn.onclick = () => { Object.keys(plugins).forEach(k => plugins[k] = true); savePlugins(plugins); renderMissionPanel(); };
    const btnMin = panel.querySelector('#btnPluginMinimal');
    if (btnMin) btnMin.onclick = () => { Object.keys(plugins).forEach(k => plugins[k] = (k === 'phSim' || k === 'rotaSim' || k === 'rsdCalc')); savePlugins(plugins); renderMissionPanel(); };

    const rotaSel = panel.querySelector('#rotaSolSel');
    const rotaVac = panel.querySelector('#rotaVacSlider');
    if (rotaSel) rotaSel.onchange = () => { rotaState.sol = rotaSel.value; renderMissionPanel(); };
    if (rotaVac) rotaVac.oninput = () => { rotaState.vacMpa = Number(rotaVac.value); renderMissionPanel(); };

    const colInp = panel.querySelector('#colCrudeInp');
    const colRat = panel.querySelector('#colRatioSel');
    if (colInp) colInp.oninput = () => { colState.crudeG = Number(colInp.value) || 0.5; renderMissionPanel(); };
    if (colRat) colRat.onchange = () => { colState.ratio = Number(colRat.value) || 35; renderMissionPanel(); };

    // 稀释计算器
    ['dilC1', 'dilC2', 'dilV2'].forEach(id => {
      const inp = panel.querySelector('#' + id);
      if (inp) inp.oninput = () => {
        if (id === 'dilC1') dilState.c1 = Number(inp.value) || 0;
        if (id === 'dilC2') dilState.c2 = Number(inp.value) || 0;
        if (id === 'dilV2') dilState.v2 = Number(inp.value) || 0;
        renderMissionPanel();
      };
    });
  }

  // 启动时恢复用户保存的主题皮肤
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => applyThemeSkin(getSavedSkin()));
  } else {
    applyThemeSkin(getSavedSkin());
  }

  window.TCM_MISSION_OS = {
    render: renderMissionPanel,
    applyThemeSkin
  };
})();
