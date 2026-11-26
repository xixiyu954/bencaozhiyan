/**
 * 本草智研 · 第一人称三维虚拟实验室（三场景完整实操版）
 * 场景 1：丹参 95% 乙醇避光回流提取（7 步 SOP + 未通冷凝水禁加热互锁）
 * 场景 2：丹参醇提液减压旋转蒸发浓缩（7 步 SOP + 冷凝水互锁 + 先放气后停泵防倒吸互锁）
 * 场景 3：HPLC-DAD 高效液相色谱外标法定量测定（7 步 SOP + Purge 排气泡互锁 + 基线平衡互锁 + 实时出峰工作站屏幕）
 */
import * as THREE from 'three';

const STATIONS = {
  reagent: {
    id: 'reagent',
    name: '试剂架',
    pos: new THREE.Vector3(-3.8, 0, -1.35),
    standPos: new THREE.Vector3(-2.15, 1.55, -1.35),
    lookAt: new THREE.Vector3(-4.05, 1.32, -1.35),
    tip: '配齐常用提取溶剂（95%/70%乙醇、乙酸乙酯、石油醚、色谱甲醇、纯化水）、核心药材与沸石/锡箔耗材。'
  },
  balance: {
    id: 'balance',
    name: '精密天平区',
    pos: new THREE.Vector3(3.8, 0, -1.35),
    standPos: new THREE.Vector3(2.15, 1.55, -1.35),
    lookAt: new THREE.Vector3(4.0, 1.18, -1.35),
    tip: '防震大理石台分析天平：核对水平泡、去皮归零，精密称量药材与对照品。'
  },
  hood: {
    id: 'hood',
    name: '通风橱（回流工位）',
    pos: new THREE.Vector3(0, 0, -3.25),
    standPos: new THREE.Vector3(0, 1.55, -1.55),
    lookAt: new THREE.Vector3(0, 1.45, -3.25),
    tip: '有机溶剂回流主工位：装瓶加沸石 → 搭球形冷凝管与避光 → 冷凝水下进上出 → 70℃ 恒温回流。'
  },
  bench: {
    id: 'bench',
    name: '中心实验台',
    pos: new THREE.Vector3(0, 0, 2.25),
    standPos: new THREE.Vector3(0, 1.55, 0.72),
    lookAt: new THREE.Vector3(0, 1.08, 2.25),
    tip: '样品前处理台：减压抽滤瓶、量筒、0.22 μm 微孔滤膜注射器、2 mL 棕色进样瓶架、实验记录本与 MSDS。'
  },
  rotavap: {
    id: 'rotavap',
    name: '减压旋蒸工位',
    pos: new THREE.Vector3(-3.85, 0, 1.55),
    standPos: new THREE.Vector3(-2.15, 1.55, 1.55),
    lookAt: new THREE.Vector3(-3.95, 1.32, 1.55),
    tip: 'RE-52AA 旋转蒸发仪：50℃ 数显水浴、斜置成膜蒸发瓶、蛇形冷凝管、乙醇回收瓶与循环水真空泵（-0.085 MPa）。'
  },
  hplc: {
    id: 'hplc',
    name: 'HPLC-DAD 液相工位',
    pos: new THREE.Vector3(3.85, 0, 1.55),
    standPos: new THREE.Vector3(2.15, 1.55, 1.55),
    lookAt: new THREE.Vector3(3.95, 1.34, 1.55),
    tip: '四元梯度高效液相色谱仪：在线脱气机、高压梯度泵、自动进样器、30℃ C18 柱温箱、DAD 检测器与色谱工作站。'
  }
};

const SCENARIOS = {
  reflux: {
    id: 'reflux',
    shortLabel: '01 回流提取',
    badge: '场景 1 / 3 · 提取单元',
    title: '丹参 95% 乙醇避光回流提取',
    telemetryTitle: '实时回流工艺遥测',
    kpi1: ['料液比', '1 : 8'],
    kpi2: ['控温目标', '70 ℃'],
    initZone: 'bench',
    initPos: { x: 0, z: 0.65, yaw: 0, pitch: -0.04 },
    initNotice: '当前场景：丹参 95% 乙醇回流提取。使用 WASD 走动或点击右下按钮，先前往左侧【试剂架】领取原料与耗材。',
    steps: [
      { id: 'take_reagents', num: 1, zone: 'reagent', title: '试剂架领取药品与耗材', actionLabel: '领取丹参粗粉、95%乙醇、沸石与锡箔', detail: '从试剂架领取发光标注的 4 项本实验物资：20 目丹参粗粉、95% 乙醇 (400 mL)、素瓷沸石及锡箔避光纸。' },
      { id: 'weigh_herb', num: 2, zone: 'balance', title: '精密天平称量 50.00 g', actionLabel: '天平归零并称取 50.00 g 丹参粗粉', detail: '铺好称量纸并去皮归零，用药匙准确称取 50.00 g 丹参粗粉（20 目）。' },
      { id: 'load_flask', num: 3, zone: 'hood', title: '装瓶、加沸石与 95% 乙醇', actionLabel: '装入丹参粉、沸石与 400 mL 95%乙醇', detail: '铁架台固定 1000 mL 圆底烧瓶，加入 50 g 丹参粗粉、2~3 粒沸石（防暴沸）与 400 mL 95% 乙醇。' },
      { id: 'assemble_rig', num: 4, zone: 'hood', title: '自下而上搭球形冷凝管与避光', actionLabel: '装配数显电热套、球形冷凝管并开排风', detail: '自下而上就位调温电热套、5 球球形冷凝管、锡箔避光层（防丹参酮 IIA 光氧化），并开启通风橱排风。' },
      { id: 'start_water', num: 5, zone: 'hood', title: '接通冷凝水（下进上出）', actionLabel: '接通冷凝水（下口进 / 上口出）', detail: '连接进出橡胶管并开阀，确认冷却水自下口进、上口出充满冷凝夹套。' },
      { id: 'run_reflux', num: 6, zone: 'hood', title: '70℃ 恒温避光回流 60 min', actionLabel: '设定 70℃ 开启恒温避光回流', detail: '数显电热套控温至 70℃，观察烧瓶微沸气泡、浸出液由浅琥珀转为深丹红及冷凝回流液滴。' },
      { id: 'safe_shutdown', num: 7, zone: 'hood', title: '先断热冷却，后停冷凝水取液', actionLabel: '断电冷却 → 关冷凝水 → 收集醇提液', detail: '先关闭电热套冷却至 40℃ 以下再关闭冷凝水，防止乙醇蒸气外逸，收集深红色丹参酮 IIA 醇提液。' }
    ]
  },
  rotavap: {
    id: 'rotavap',
    shortLabel: '02 减压旋蒸',
    badge: '场景 2 / 3 · 浓缩单元',
    title: '丹参醇提液 50℃ 减压旋转蒸发浓缩',
    telemetryTitle: '实时减压浓缩遥测',
    kpi1: ['目标真空', '-0.085 MPa'],
    kpi2: ['水浴控温', '50 ℃'],
    initZone: 'rotavap',
    initPos: { x: -2.05, z: 1.55, yaw: 1.57, pitch: -0.06 },
    initNotice: '当前场景：减压旋转蒸发浓缩。先前往【中心实验台】领取抽滤澄清的丹参醇提滤液与防脱落卡夹。',
    steps: [
      { id: 'rv_take_filtrate', num: 1, zone: 'bench', title: '实验台领取抽滤醇提液与卡夹', actionLabel: '领取丹参醇提滤液 (250 mL) 与标准口卡夹', detail: '在中心实验台核对布氏漏斗抽滤后的澄清丹参醇提液，装液量不得超过蒸发瓶容积的 1/2（防暴沸冲料）。' },
      { id: 'rv_mount_flask', num: 2, zone: 'rotavap', title: '旋蒸仪安装蒸发瓶与接收瓶', actionLabel: '斜置挂载 500 mL 蒸发瓶并锁紧卡夹', detail: '在磨口处薄涂真空脂，挂好 500 mL 梨形/圆底蒸发瓶与下方乙醇接收瓶，必须扣紧防脱落卡夹。' },
      { id: 'rv_cool_water', num: 3, zone: 'rotavap', title: '开启蛇形冷凝管循环冷却水', actionLabel: '接通蛇形冷凝管冷却水（下进上出）', detail: '先通低温冷却水充满蛇形盘管，确保减压沸腾的乙醇蒸气能迅速冷凝回收，不直冲真空泵。' },
      { id: 'rv_close_vent_vac', num: 4, zone: 'rotavap', title: '旋紧放气阀并抽真空至 -0.085 MPa', actionLabel: '密闭放气阀 → 启动真空泵 (-0.085 MPa)', detail: '关闭顶部 PTFE 放气阀，启动循环水真空泵，将体系压力降至 -0.085 MPa（乙醇沸点降至约 34℃）。' },
      { id: 'rv_spin_bath', num: 5, zone: 'rotavap', title: '开启 75 rpm 旋转并降入 50℃ 水浴', actionLabel: '开启电机旋转成膜 → 降入 50℃ 水浴浓缩', detail: '先以 75 rpm 匀速旋转形成薄液膜扩大蒸发面积、抑制暴沸，再降入 50℃ 恒温水浴低温浓缩护丹参酮。' },
      { id: 'rv_lift_and_vent', num: 6, zone: 'rotavap', title: '终点升瓶停转，先旋开放气阀通大气', actionLabel: '升瓶离浴 → 停旋转 → 缓慢旋开放气阀', detail: '浓缩至稠膏状时，先升起蒸发瓶脱离水浴、关闭旋转电机，再缓慢旋开放气阀使体系恢复常压。' },
      { id: 'rv_stop_pump', num: 7, zone: 'rotavap', title: '最后关闭真空泵与冷却水并收膏', actionLabel: '关闭真空泵与冷却水 → 卸瓶收集丹参稠膏', detail: '确认压力表归零（常压）后方可关闭真空泵，严防循环水倒吸入接收瓶，回收乙醇并收集丹参稠膏。' }
    ]
  },
  hplc: {
    id: 'hplc',
    shortLabel: '03 液相色谱',
    badge: '场景 3 / 3 · 定量质控',
    title: 'HPLC-DAD 丹参酮 IIA 外标法含量测定',
    telemetryTitle: '实时色谱系统遥测',
    kpi1: ['流动相', 'MeOH:H₂O 75:25'],
    kpi2: ['检测波长', '270 nm'],
    initZone: 'hplc',
    initPos: { x: 2.05, z: 1.55, yaw: -1.57, pitch: -0.05 },
    initNotice: '当前场景：HPLC-DAD 定量测定（2025 药典法）。先在【中心实验台】用 0.22 μm 微孔滤膜过滤供试液并装瓶。',
    steps: [
      { id: 'lc_filter_vial', num: 1, zone: 'bench', title: '0.22 μm 微孔滤膜过滤装进样瓶', actionLabel: '弃初滤液 → 0.22 μm 有机系滤膜过滤装瓶', detail: '弃去初滤液约 1 mL，续滤液过 0.22 μm PTFE 微孔滤膜装入 2 mL 棕色自动进样小瓶（避光防降解、防堵柱）。' },
      { id: 'lc_degas_mobile', num: 2, zone: 'hplc', title: '核查色谱纯流动相并开启在线脱气', actionLabel: '检查甲醇-水 (75:25) 储液瓶并开脱气机', detail: '核查顶层储液瓶液位高于砂芯滤头，开启真空在线脱气机除去流动相溶解空气。' },
      { id: 'lc_purge_pump', num: 3, zone: 'hplc', title: '开启排空阀 Purge 排尽泵头气泡', actionLabel: '旋开排空阀以 3.0 mL/min Purge 排气泡', detail: '逆时针旋开泵头排空阀，以 3.0 mL/min 冲洗排尽输液管气泡，观察废液管无气泡后顺时针旋紧排空阀。' },
      { id: 'lc_equilibrate', num: 4, zone: 'hplc', title: '设定 30℃ 柱温与 1.0 mL/min 平衡基线', actionLabel: '设定 1.0 mL/min · 30℃ · 270 nm 平衡 C18 柱', detail: '泵压稳定升至 14.6 MPa，观察右侧工作站屏幕基线漂移 < 0.5 mAU/30min，达进样平衡条件。' },
      { id: 'lc_load_inject', num: 5, zone: 'hplc', title: '自动进样器装瓶并启动 10 μL 进样', actionLabel: '装入对照品/供试品瓶 → 启动 10 μL 序列进样', detail: '将对照品瓶置 1 号位、供试品瓶置 2 号位，设定进样体积 10 μL 启动外标法采集序列。' },
      { id: 'lc_collect_peak', num: 6, zone: 'hplc', title: '采集丹参酮 IIA 主峰并核验系统适用性', actionLabel: '积分 tR=11.42 min 主峰并核验塔板数 N', detail: '工作站绘出 tR = 11.42 min 丹参酮 IIA 对称主峰，实测理论塔板数 N = 6840（符合药典 N ≥ 2000 规定）。' },
      { id: 'lc_flush_shutdown', num: 7, zone: 'hplc', title: '过渡冲洗 C18 色谱柱并规范停机', actionLabel: '甲醇-水梯度冲柱 20 min → 保存报告并停泵', detail: '序列完成后以 90% 甲醇冲洗强保留脂溶性杂质 20 min，保存外标含量报告后逐步降流速至 0 关机。' }
    ]
  }
};

function makeCanvasTexture(width, height, drawFn) {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  const ctx = c.getContext('2d');
  drawFn(ctx, width, height);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createFloorTexture() {
  return makeCanvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#dde6e4';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#c4d2ce';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, w, h);
    ctx.strokeStyle = '#cfdcd9';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
    ctx.stroke();
  });
}

function createLabelTexture(text, sub, bg = '#ffffff', fg = '#0f172a', accent = '#059669') {
  return makeCanvasTexture(256, 128, (ctx, w, h) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, w, 24);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('本草智研 · 试剂标', w / 2, 17);
    ctx.fillStyle = fg;
    ctx.font = 'bold 34px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText(text, w / 2, 74);
    if (sub) {
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(sub, w / 2, 108);
    }
  });
}

function createSignSprite(title, sub, accentHex, scaleX = 1.45, scaleY = 0.42) {
  const tex = makeCanvasTexture(420, 118, (ctx, w, h) => {
    ctx.fillStyle = 'rgba(6, 36, 32, 0.90)';
    ctx.beginPath();
    ctx.roundRect(6, 6, w - 12, h - 12, 18);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = accentHex || '#34d399';
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 29px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, w / 2, 52);
    ctx.fillStyle = '#a7f3d0';
    ctx.font = 'bold 17px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText(sub, w / 2, 88);
  });
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sp = new THREE.Sprite(mat);
  sp.scale.set(scaleX, scaleY, 1);
  return sp;
}

function createSmallBadgeSprite(text, bg = 'rgba(6,36,32,0.88)', border = '#34d399', fg = '#ecfdf5') {
  const tex = makeCanvasTexture(220, 56, (ctx, w, h) => {
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(3, 3, w - 6, h - 6, 12);
    ctx.fill();
    ctx.strokeStyle = border;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = fg;
    ctx.font = 'bold 24px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, w / 2, 37);
  });
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
  sp.scale.set(0.46, 0.12, 1);
  return sp;
}

export function mountVlab3D(container) {
  let destroyed = false;
  let rafId = null;

  const state = {
    scenario: 'reflux',
    completedSteps: new Set(),
    activeZone: 'bench',
    // Scenario 1 (Reflux) state
    tempC: 24.0,
    refluxMinutes: 0,
    heatingOn: false,
    waterOn: false,
    exhaustOn: false,
    foilOn: false,
    flaskLoaded: false,
    rigAssembled: false,
    shutdownDone: false,
    // Scenario 2 (Rotavap) state
    rvFlaskMounted: false,
    rvWaterOn: false,
    rvVacuumOn: false,
    rvVentClosed: false,
    rvSpinning: false,
    rvBathIn: false,
    rvProgress: 0,
    rvVacuumMpa: 0,
    // Scenario 3 (HPLC-DAD) state
    lcVialsReady: false,
    lcDegasOn: false,
    lcPurged: false,
    lcEquilibrated: false,
    lcRunning: false,
    lcPeakDone: false,
    lcRunMin: 0,
    lcPressureMpa: 0,
    // Common
    fps: 60,
    notice: SCENARIOS.reflux.initNotice
  };

  function curScenario() {
    return SCENARIOS[state.scenario] || SCENARIOS.reflux;
  }

  function getNextStep() {
    const steps = curScenario().steps;
    for (const st of steps) {
      if (!state.completedSteps.has(st.id)) return st;
    }
    return null;
  }

  // ===== BUILD DOM SHELL =====
  container.innerHTML = `
    <div class="space-y-2.5">
      <div class="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#f7f6f2] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
        <div class="flex flex-wrap items-center gap-1.5" id="vlab3dScenarioBar" role="tablist" aria-label="三维实操场景切换">
          <span class="text-xs font-extrabold text-slate-700 dark:text-slate-200 mr-1">实训场景：</span>
          ${Object.values(SCENARIOS).map((sc) => `
            <button type="button" data-vlab-sc="${sc.id}" class="px-3 py-1.5 rounded-lg text-xs font-extrabold border transition ${
              sc.id === state.scenario
                ? 'bg-[#0f4c3a] text-white border-[#0f4c3a]'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-[#0f4c3a]'
            }">${sc.shortLabel} · ${sc.title.replace(/^丹参/, '')}</button>
          `).join('')}
        </div>
        <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">同室六大工位联动 · 含真实安全互锁校验</span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        <div class="lg:col-span-8 flex flex-col gap-2.5">
          <div id="vlab3dStageWrap" class="relative rounded-2xl bg-[#071d1a] border border-emerald-400/30 overflow-hidden select-none" style="min-height:370px;">
            <canvas id="vlab3dCanvas" class="w-full h-[370px] sm:h-[445px] block cursor-grab active:cursor-grabbing" style="touch-action:none;"></canvas>

            <div class="pointer-events-none absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 max-w-[74%]">
              <span class="px-2.5 py-1 rounded-lg bg-slate-950/75 border border-emerald-400/30 text-emerald-200 text-xs font-extrabold">工位：<span id="vlab3dZoneLabel">中心实验台</span></span>
              <span class="px-2 py-1 rounded-lg bg-slate-950/75 border border-white/15 text-amber-200 text-[11px] font-bold font-mono"><span id="vlab3dTempHud">24.0℃</span></span>
              <span id="vlab3dWaterBadge" class="px-2 py-1 rounded-lg bg-slate-950/75 border border-white/15 text-slate-300 text-[11px] font-bold">冷凝水: 关</span>
              <span id="vlab3dFpsHud" class="px-2 py-1 rounded-lg bg-slate-950/75 border border-emerald-400/20 text-emerald-300 text-[11px] font-mono font-bold">60 FPS</span>
            </div>

            <div class="pointer-events-none absolute top-2.5 right-2.5 rounded-xl bg-slate-950/75 border border-white/15 p-1.5 backdrop-blur-xs">
              <canvas id="vlab3dMinimap" width="102" height="82" class="block rounded-lg"></canvas>
            </div>

            <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div class="w-2.5 h-2.5 rounded-full border-2 border-emerald-300/70 bg-emerald-400/20"></div>
            </div>

            <div class="absolute bottom-2.5 left-2.5 right-2.5 flex flex-col gap-1.5">
              <div id="vlab3dInventoryBar" class="pointer-events-none flex flex-wrap items-center gap-1"></div>
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div id="vlab3dNotice" class="flex-1 min-w-[200px] px-3 py-2 rounded-xl bg-slate-950/85 backdrop-blur-sm border border-emerald-400/30 text-[11.5px] text-emerald-50 font-semibold leading-snug shadow-lg">
                  ${state.notice}
                </div>
                <button type="button" id="vlab3dActionBtn" class="shrink-0 px-3.5 py-2 rounded-xl bg-[#0f4c3a] hover:bg-[#0a382b] text-white text-xs font-extrabold shadow-lg border border-emerald-300/40 transition">
                  走近【试剂架】执行第 1 步 [E]
                </button>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-[#f6f8f7] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
            <div class="flex flex-wrap items-center gap-1">
              <span class="text-slate-600 dark:text-slate-300 font-bold mr-0.5">直达工位：</span>
              <button type="button" data-vlab-goto="reagent" class="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:border-[#0f4c3a]">试剂架</button>
              <button type="button" data-vlab-goto="balance" class="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:border-[#0f4c3a]">天平区</button>
              <button type="button" data-vlab-goto="hood" class="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:border-[#0f4c3a]">通风橱</button>
              <button type="button" data-vlab-goto="rotavap" class="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:border-[#0f4c3a]">减压旋蒸</button>
              <button type="button" data-vlab-goto="hplc" class="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:border-[#0f4c3a]">HPLC液相</button>
              <button type="button" data-vlab-goto="bench" class="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:border-[#0f4c3a]">实验台</button>
            </div>
            <div class="flex items-center gap-1">
              <span class="text-[11px] text-slate-500 dark:text-slate-400 mr-1 hidden sm:inline">WASD 走动 · 拖拽环顾</span>
              <button type="button" data-vlab-pad="turnL" title="左转" class="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold">⟲</button>
              <button type="button" data-vlab-pad="fwd" title="前进" class="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold">↑</button>
              <button type="button" data-vlab-pad="back" title="后退" class="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold">↓</button>
              <button type="button" data-vlab-pad="left" title="左移" class="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold">←</button>
              <button type="button" data-vlab-pad="right" title="右移" class="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold">→</button>
              <button type="button" data-vlab-pad="turnR" title="右转" class="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold">⟳</button>
            </div>
          </div>
        </div>

        <div class="lg:col-span-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-3.5 flex flex-col justify-between gap-3 text-xs">
          <div class="space-y-2.5">
            <div class="flex items-center justify-between gap-2">
              <div>
                <span id="vlab3dScBadge" class="inline-block px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/40 text-[#0f4c3a] dark:text-emerald-300 text-[10.5px] font-extrabold">${SCENARIOS.reflux.badge}</span>
                <h4 id="vlab3dScTitle" class="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">${SCENARIOS.reflux.title}</h4>
              </div>
              <button type="button" id="vlab3dResetBtn" class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-[11px] font-bold">重置当前</button>
            </div>

            <div class="space-y-1">
              <div class="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                <span>SOP 完成进度</span>
                <span id="vlab3dProgressTxt">0 / 7 步</span>
              </div>
              <div class="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div id="vlab3dProgressBar" class="h-full bg-[#0f4c3a] transition-all duration-300" style="width:0%"></div>
              </div>
            </div>

            <div id="vlab3dStepList" class="space-y-1.5 max-h-[260px] overflow-y-auto pr-0.5"></div>
          </div>

          <div class="p-2.5 rounded-xl bg-[#f6f8f7] dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-700 space-y-1.5">
            <div class="flex items-center justify-between font-extrabold text-slate-800 dark:text-slate-200 text-[11px]">
              <span id="vlab3dTelemetryLbl">${SCENARIOS.reflux.telemetryTitle}</span>
              <span id="vlab3dTimeTxt" class="text-[#0f4c3a] dark:text-emerald-300 font-mono">0 / 60 min</span>
            </div>
            <div class="grid grid-cols-3 gap-1.5 text-center text-[11px]">
              <div class="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
                <div id="vlab3dKpi1Lbl" class="text-[10px] text-slate-500">料液比</div>
                <div id="vlab3dKpi1Val" class="font-extrabold text-slate-800 dark:text-slate-100 truncate">1 : 8</div>
              </div>
              <div class="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
                <div id="vlab3dKpi2Lbl" class="text-[10px] text-slate-500">控温目标</div>
                <div id="vlab3dKpi2Val" class="font-extrabold text-slate-800 dark:text-slate-100">70 ℃</div>
              </div>
              <div class="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
                <div class="text-[10px] text-slate-500">安全互锁</div>
                <div id="vlab3dSafetyTxt" class="font-extrabold text-emerald-600">正常</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const canvas = container.querySelector('#vlab3dCanvas');
  const minimapCanvas = container.querySelector('#vlab3dMinimap');
  const mCtx = minimapCanvas.getContext('2d');
  const zoneLabelEl = container.querySelector('#vlab3dZoneLabel');
  const tempHudEl = container.querySelector('#vlab3dTempHud');
  const waterBadgeEl = container.querySelector('#vlab3dWaterBadge');
  const fpsHudEl = container.querySelector('#vlab3dFpsHud');
  const noticeEl = container.querySelector('#vlab3dNotice');
  const inventoryBarEl = container.querySelector('#vlab3dInventoryBar');
  const actionBtn = container.querySelector('#vlab3dActionBtn');
  const stepListEl = container.querySelector('#vlab3dStepList');
  const progressTxtEl = container.querySelector('#vlab3dProgressTxt');
  const progressBarEl = container.querySelector('#vlab3dProgressBar');
  const timeTxtEl = container.querySelector('#vlab3dTimeTxt');
  const safetyTxtEl = container.querySelector('#vlab3dSafetyTxt');
  const scBadgeEl = container.querySelector('#vlab3dScBadge');
  const scTitleEl = container.querySelector('#vlab3dScTitle');
  const telemetryLblEl = container.querySelector('#vlab3dTelemetryLbl');
  const kpi1LblEl = container.querySelector('#vlab3dKpi1Lbl');
  const kpi1ValEl = container.querySelector('#vlab3dKpi1Val');
  const kpi2LblEl = container.querySelector('#vlab3dKpi2Lbl');
  const kpi2ValEl = container.querySelector('#vlab3dKpi2Val');

  // ===== THREE.JS SCENE SETUP =====
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xdbe7e4);
  scene.fog = new THREE.Fog(0xdbe7e4, 10, 22);

  const camera = new THREE.PerspectiveCamera(62, 16 / 10, 0.1, 40);

  scene.add(new THREE.HemisphereLight(0xf8fafc, 0x334155, 1.0));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
  dirLight.position.set(2.5, 6, 3.5);
  scene.add(dirLight);
  const hoodLight = new THREE.PointLight(0xe0f2fe, 1.1, 6.5);
  hoodLight.position.set(0, 2.35, -3.0);
  scene.add(hoodLight);

  // Room (10m x 8m x 3.4m)
  const floorTex = createFloorTexture();
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(10, 8);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 8), new THREE.MeshLambertMaterial({ map: floorTex }));
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const wallMat = new THREE.MeshLambertMaterial({ color: 0xeef4f2 });
  const trimMat = new THREE.MeshLambertMaterial({ color: 0x0f5c54 });
  const ceilMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(10, 8), ceilMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 3.4;
  scene.add(ceiling);

  [
    { pos: [0, 1.7, -4], rotY: 0, w: 10 },
    { pos: [0, 1.7, 4], rotY: Math.PI, w: 10 },
    { pos: [-5, 1.7, 0], rotY: Math.PI / 2, w: 8 },
    { pos: [5, 1.7, 0], rotY: -Math.PI / 2, w: 8 }
  ].forEach((ws) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(ws.w, 3.4), wallMat);
    m.position.set(ws.pos[0], ws.pos[1], ws.pos[2]);
    m.rotation.y = ws.rotY;
    scene.add(m);
    const baseboard = new THREE.Mesh(new THREE.BoxGeometry(ws.w, 0.14, 0.04), trimMat);
    baseboard.position.set(ws.pos[0], 0.07, ws.pos[2]);
    baseboard.rotation.y = ws.rotY;
    scene.add(baseboard);
  });

  const ledMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  [[-2.2, -1.2], [2.2, -1.2], [-2.2, 1.6], [2.2, 1.6]].forEach(([lx, lz]) => {
    const p = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.04, 0.42), ledMat);
    p.position.set(lx, 3.37, lz);
    scene.add(p);
  });

  const bannerTex = makeCanvasTexture(768, 92, (ctx, w, h) => {
    ctx.fillStyle = '#06322b';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, w - 8, h - 8);
    ctx.fillStyle = '#ecfdf5';
    ctx.font = 'bold 25px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('本草智研 · 现代本草实验室  |  回流控温 · 旋蒸先放气后停泵 · 液相排泡平衡', w / 2, 56);
  });
  const banner = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 0.52), new THREE.MeshBasicMaterial({ map: bannerTex }));
  banner.position.set(0, 3.06, -3.96);
  scene.add(banner);

  // Shared materials
  const cabinetMat = new THREE.MeshLambertMaterial({ color: 0xd9e3e1 });
  const benchTopMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
  const steelMat = new THREE.MeshPhongMaterial({ color: 0x94a3b8, shininess: 70 });
  const darkMetalMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
  const whiteBodyMat = new THREE.MeshLambertMaterial({ color: 0xf1f5f9 });
  const glassMat = new THREE.MeshPhongMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.36, shininess: 95 });
  const amberGlassMat = new THREE.MeshPhongMaterial({ color: 0x92400e, shininess: 85 });
  const clearGlassMat = new THREE.MeshPhongMaterial({ color: 0xcbe9f6, transparent: true, opacity: 0.65, shininess: 90 });
  const hoseMatOff = new THREE.MeshLambertMaterial({ color: 0x64748b });
  const hoseMatOn = new THREE.MeshLambertMaterial({ color: 0x0ea5e9 });

  function buildReagentBottle({ r = 0.068, h = 0.22, bodyMat, capColor = 0xf8fafc, labelText, labelSub, labelAccent = '#059669', isTarget = false }) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 14), bodyMat);
    body.position.y = h / 2;
    g.add(body);
    const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.42, r, h * 0.16, 14), bodyMat);
    shoulder.position.y = h + h * 0.08;
    g.add(shoulder);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.46, r * 0.46, 0.04, 12), new THREE.MeshLambertMaterial({ color: capColor }));
    cap.position.y = h + h * 0.16 + 0.02;
    g.add(cap);
    const lblTex = createLabelTexture(labelText, labelSub, '#ffffff', '#0f172a', labelAccent);
    const lbl = new THREE.Mesh(
      new THREE.CylinderGeometry(r + 0.002, r + 0.002, h * 0.56, 12, 1, true, Math.PI * 0.12, Math.PI * 0.76),
      new THREE.MeshBasicMaterial({ map: lblTex })
    );
    lbl.position.y = h * 0.5;
    g.add(lbl);
    if (isTarget) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(r + 0.015, r + 0.036, 18),
        new THREE.MeshBasicMaterial({ color: 0x34d399, side: THREE.DoubleSide })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.006;
      g.add(ring);
    }
    return g;
  }

  // ===== STATION 1: REAGENT RACK (West-North) =====
  const reagentGroup = new THREE.Group();
  reagentGroup.position.set(-4.35, 0, -1.35);
  scene.add(reagentGroup);

  const rackBack = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.25, 2.28), new THREE.MeshLambertMaterial({ color: 0xcbd5e1 }));
  rackBack.position.set(-0.32, 1.125, 0);
  reagentGroup.add(rackBack);
  [[-0.30, -1.10], [-0.30, 1.10], [0.28, -1.10], [0.28, 1.10]].forEach(([px, pz]) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.045, 2.25, 0.045), steelMat);
    post.position.set(px, 1.125, pz);
    reagentGroup.add(post);
  });
  const rackBaseCab = new THREE.Mesh(new THREE.BoxGeometry(0.60, 0.66, 2.22), cabinetMat);
  rackBaseCab.position.set(-0.01, 0.33, 0);
  reagentGroup.add(rackBaseCab);
  [0.68, 1.20, 1.72, 2.22].forEach((sy) => {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.04, 2.24), benchTopMat);
    shelf.position.set(0, sy, 0);
    reagentGroup.add(shelf);
    if (sy < 2.2) {
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 2.20, 8), steelMat);
      rail.rotation.x = Math.PI / 2;
      rail.position.set(0.28, sy + 0.055, 0);
      reagentGroup.add(rail);
    }
  });

  const targetPickupGroup = new THREE.Group();
  reagentGroup.add(targetPickupGroup);

  [
    { z: -0.88, label: '95% 乙醇', sub: '400 mL 回流', mat: amberGlassMat, cap: 0xdc2626, accent: '#dc2626', target: true },
    { z: -0.52, label: '70% 乙醇', sub: '500 mL AR', mat: clearGlassMat, cap: 0x0284c7, accent: '#0284c7', target: false },
    { z: -0.16, label: '乙酸乙酯', sub: '500 mL 萃取', mat: amberGlassMat, cap: 0x2563eb, accent: '#2563eb', target: false },
    { z: 0.20,  label: '石油醚',   sub: '60-90℃ 脱脂', mat: amberGlassMat, cap: 0xd97706, accent: '#d97706', target: false },
    { z: 0.54,  label: '色谱甲醇', sub: 'HPLC 级', mat: amberGlassMat, cap: 0x7c3aed, accent: '#7c3aed', target: false },
    { z: 0.88,  label: '纯化水',   sub: '1000 mL', mat: clearGlassMat, cap: 0x059669, accent: '#059669', target: false }
  ].forEach((sv) => {
    const b = buildReagentBottle({ r: 0.070, h: 0.23, bodyMat: sv.mat, capColor: sv.cap, labelText: sv.label, labelSub: sv.sub, labelAccent: sv.accent, isTarget: sv.target });
    b.position.set(0.06, 1.74, sv.z);
    (sv.target ? targetPickupGroup : reagentGroup).add(b);
  });

  [
    { z: -0.84, label: '丹参粗粉', sub: '20目 · 50g', color: 0x991b1b, accent: '#dc2626', target: true },
    { z: -0.42, label: '辽五味子', sub: '含五味子醇甲', color: 0x7f1d1d, accent: '#991b1b', target: false },
    { z: 0.00,  label: '清原龙胆', sub: '含龙胆苦苷', color: 0xca8a04, accent: '#a16207', target: false },
    { z: 0.42,  label: '黄芩饮片', sub: '含黄芩苷', color: 0xeab308, accent: '#ca8a04', target: false },
    { z: 0.84,  label: '薄荷全草', sub: '含薄荷脑', color: 0x15803d, accent: '#15803d', target: false }
  ].forEach((hb) => {
    const jar = buildReagentBottle({ r: 0.086, h: 0.20, bodyMat: new THREE.MeshLambertMaterial({ color: hb.color }), capColor: 0x1e293b, labelText: hb.label, labelSub: hb.sub, labelAccent: hb.accent, isTarget: hb.target });
    jar.position.set(0.05, 1.22, hb.z);
    (hb.target ? targetPickupGroup : reagentGroup).add(jar);
  });

  [
    { z: -0.88, label: 'FeCl₃', sub: '酚羟基显色', color: 0xb45309 },
    { z: -0.58, label: 'AlCl₃', sub: '黄酮荧光', color: 0x0284c7 },
    { z: -0.28, label: '稀盐酸', sub: 'HCl-Mg', color: 0x475569 },
    { z: 0.02,  label: '碘化铋钾', sub: '生物碱', color: 0xc2410c }
  ].forEach((dr) => {
    const b = buildReagentBottle({ r: 0.052, h: 0.16, bodyMat: new THREE.MeshPhongMaterial({ color: dr.color, shininess: 80 }), capColor: 0x0f172a, labelText: dr.label, labelSub: dr.sub, labelAccent: '#0f766e' });
    b.position.set(0.08, 0.70, dr.z);
    reagentGroup.add(b);
  });

  const chipsJar = buildReagentBottle({ r: 0.062, h: 0.16, bodyMat: new THREE.MeshLambertMaterial({ color: 0xe2e8f0 }), capColor: 0x059669, labelText: '素瓷沸石', labelSub: '防暴沸', labelAccent: '#059669', isTarget: true });
  chipsJar.position.set(0.08, 0.70, 0.40);
  targetPickupGroup.add(chipsJar);

  const foilGroup = new THREE.Group();
  const foilCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.30, 14), steelMat);
  foilCyl.rotation.x = Math.PI / 2;
  foilCyl.position.set(0.08, 0.75, 0.80);
  foilGroup.add(foilCyl);
  targetPickupGroup.add(foilGroup);

  const reagentSign = createSignSprite('工作台试剂架', '溶剂 · 道地药材 · 试液耗材', '#34d399', 1.5, 0.40);
  reagentSign.position.set(-4.0, 2.58, -1.35);
  scene.add(reagentSign);

  // ===== STATION 2: ANALYTICAL BALANCE (East-North) =====
  const balGroup = new THREE.Group();
  balGroup.position.set(4.1, 0, -1.35);
  scene.add(balGroup);
  const balBench = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.88, 1.85), cabinetMat);
  balBench.position.set(0, 0.44, 0);
  balGroup.add(balBench);
  const balTop = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.06, 1.92), benchTopMat);
  balTop.position.set(0, 0.91, 0);
  balGroup.add(balTop);
  const marble = new THREE.Mesh(new THREE.BoxGeometry(0.60, 0.05, 0.68), new THREE.MeshLambertMaterial({ color: 0xe2e8f0 }));
  marble.position.set(-0.08, 0.965, 0);
  balGroup.add(marble);
  const balBase = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.12, 0.50), whiteBodyMat);
  balBase.position.set(-0.08, 1.05, 0);
  balGroup.add(balBase);
  const balShield = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.32, 0.38), glassMat);
  balShield.position.set(-0.04, 1.27, 0);
  balGroup.add(balShield);
  const balPan = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.016, 16), steelMat);
  balPan.position.set(-0.04, 1.135, 0);
  balGroup.add(balPan);
  const powderMound = new THREE.Mesh(new THREE.ConeGeometry(0.078, 0.058, 14), new THREE.MeshLambertMaterial({ color: 0x991b1b }));
  powderMound.position.set(-0.04, 1.175, 0);
  powderMound.visible = false;
  balGroup.add(powderMound);

  const lcdCanvas = document.createElement('canvas');
  lcdCanvas.width = 256; lcdCanvas.height = 96;
  const lcdCtx = lcdCanvas.getContext('2d');
  const lcdTex = new THREE.CanvasTexture(lcdCanvas);
  lcdTex.colorSpace = THREE.SRGBColorSpace;
  function updateBalanceLcd(gramsText, subText) {
    lcdCtx.fillStyle = '#062420';
    lcdCtx.fillRect(0, 0, 256, 96);
    lcdCtx.strokeStyle = '#34d399';
    lcdCtx.lineWidth = 4;
    lcdCtx.strokeRect(3, 3, 250, 90);
    lcdCtx.fillStyle = '#34d399';
    lcdCtx.font = 'bold 42px monospace';
    lcdCtx.textAlign = 'right';
    lcdCtx.fillText(gramsText, 238, 56);
    lcdCtx.fillStyle = '#a7f3d0';
    lcdCtx.font = 'bold 16px sans-serif';
    lcdCtx.textAlign = 'left';
    lcdCtx.fillText(subText, 14, 82);
    lcdTex.needsUpdate = true;
  }
  updateBalanceLcd('0.00 g', 'TARE READY');
  const lcdMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.11), new THREE.MeshBasicMaterial({ map: lcdTex }));
  lcdMesh.position.set(-0.32, 1.06, 0);
  lcdMesh.rotation.y = -Math.PI / 2;
  balGroup.add(lcdMesh);

  const balSign = createSignSprite('精密分析天平区', '万分之一归零 · 精密称定', '#38bdf8', 1.4, 0.38);
  balSign.position.set(3.9, 2.08, -1.35);
  scene.add(balSign);

  // ===== STATION 3: FUME HOOD + REFLUX EXTRACTION (North Center) =====
  const hoodGroup = new THREE.Group();
  hoodGroup.position.set(0, 0, -3.35);
  scene.add(hoodGroup);
  const hoodCab = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.90, 1.15), cabinetMat);
  hoodCab.position.set(0, 0.45, 0);
  hoodGroup.add(hoodCab);
  const hoodTop = new THREE.Mesh(new THREE.BoxGeometry(2.74, 0.06, 1.22), benchTopMat);
  hoodTop.position.set(0, 0.93, 0);
  hoodGroup.add(hoodTop);
  const hoodSideMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });
  const hoodBack = new THREE.Mesh(new THREE.BoxGeometry(2.66, 1.55, 0.08), new THREE.MeshLambertMaterial({ color: 0xcbd5e1 }));
  hoodBack.position.set(0, 1.73, -0.54);
  hoodGroup.add(hoodBack);
  [-1.30, 1.30].forEach((sx) => {
    const side = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.55, 1.16), hoodSideMat);
    side.position.set(sx, 1.73, 0);
    hoodGroup.add(side);
  });
  const hoodCanopy = new THREE.Mesh(new THREE.BoxGeometry(2.74, 0.34, 1.22), new THREE.MeshLambertMaterial({ color: 0x0a3630 }));
  hoodCanopy.position.set(0, 2.52, 0);
  hoodGroup.add(hoodCanopy);
  const exhaustLedMat = new THREE.MeshBasicMaterial({ color: 0x64748b });
  const exhaustLed = new THREE.Mesh(new THREE.SphereGeometry(0.036, 10, 10), exhaustLedMat);
  exhaustLed.position.set(1.05, 2.52, 0.62);
  hoodGroup.add(exhaustLed);
  const sash = new THREE.Mesh(new THREE.BoxGeometry(2.48, 0.50, 0.025), glassMat);
  sash.position.set(0, 2.12, 0.56);
  hoodGroup.add(sash);
  const wasteDrum = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.32, 14), new THREE.MeshLambertMaterial({ color: 0xfacc15 }));
  wasteDrum.position.set(-0.98, 1.12, -0.15);
  hoodGroup.add(wasteDrum);
  const standBase = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.03, 0.24), darkMetalMat);
  standBase.position.set(-0.24, 0.975, -0.05);
  hoodGroup.add(standBase);
  const standRod = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.28, 10), steelMat);
  standRod.position.set(-0.34, 1.61, -0.05);
  hoodGroup.add(standRod);

  const rigGroup = new THREE.Group();
  rigGroup.position.set(0, 0.96, -0.05);
  hoodGroup.add(rigGroup);
  const mantleGroup = new THREE.Group();
  const mantleBody = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.205, 0.16, 18), new THREE.MeshLambertMaterial({ color: 0x1e3a5f }));
  mantleBody.position.y = 0.08;
  mantleGroup.add(mantleBody);
  const heaterGlowMat = new THREE.MeshBasicMaterial({ color: 0x334155 });
  const heaterCore = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.018, 8, 18), heaterGlowMat);
  heaterCore.rotation.x = Math.PI / 2;
  heaterCore.position.y = 0.155;
  mantleGroup.add(heaterCore);
  mantleGroup.visible = false;
  rigGroup.add(mantleGroup);

  const flaskGroup = new THREE.Group();
  const flaskBulb = new THREE.Mesh(new THREE.SphereGeometry(0.145, 18, 14), glassMat);
  flaskBulb.position.y = 0.27;
  flaskGroup.add(flaskBulb);
  const flaskNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.042, 0.14, 14), glassMat);
  flaskNeck.position.y = 0.44;
  flaskGroup.add(flaskNeck);
  const liquidMat = new THREE.MeshLambertMaterial({ color: 0xd97706, transparent: true, opacity: 0.84 });
  const flaskLiquid = new THREE.Mesh(new THREE.SphereGeometry(0.132, 16, 12, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55), liquidMat);
  flaskLiquid.position.y = 0.27;
  flaskGroup.add(flaskLiquid);
  const foilShield = new THREE.Mesh(
    new THREE.CylinderGeometry(0.158, 0.158, 0.16, 16, 1, true),
    new THREE.MeshPhongMaterial({ color: 0xcbd5e1, shininess: 90, transparent: true, opacity: 0.42, side: THREE.DoubleSide })
  );
  foilShield.position.y = 0.27;
  foilShield.visible = false;
  flaskGroup.add(foilShield);
  flaskGroup.visible = false;
  rigGroup.add(flaskGroup);

  const condGroup = new THREE.Group();
  const condJacket = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.58, 16), new THREE.MeshPhongMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.30, shininess: 90 }));
  condJacket.position.y = 0.80;
  condGroup.add(condJacket);
  const condWaterFill = new THREE.Mesh(new THREE.CylinderGeometry(0.050, 0.050, 0.54, 14), new THREE.MeshLambertMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.48 }));
  condWaterFill.position.y = 0.80;
  condWaterFill.visible = false;
  condGroup.add(condWaterFill);
  for (let bi = 0; bi < 5; bi++) {
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 10), glassMat);
    bulb.position.y = 0.60 + bi * 0.10;
    condGroup.add(bulb);
  }
  const inletCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0.055, 0.58, 0), new THREE.Vector3(0.46, 0.42, -0.05), new THREE.Vector3(0.92, 0.24, -0.15)]);
  const outletCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0.055, 1.02, 0), new THREE.Vector3(0.50, 0.92, -0.08), new THREE.Vector3(0.86, 0.12, -0.18)]);
  const inletHose = new THREE.Mesh(new THREE.TubeGeometry(inletCurve, 12, 0.012, 6, false), hoseMatOff);
  const outletHose = new THREE.Mesh(new THREE.TubeGeometry(outletCurve, 12, 0.012, 6, false), hoseMatOff);
  condGroup.add(inletHose);
  condGroup.add(outletHose);
  condGroup.visible = false;
  rigGroup.add(condGroup);

  const bubbles = [];
  const bubbleGeo = new THREE.SphereGeometry(0.010, 6, 6);
  const bubbleMat = new THREE.MeshBasicMaterial({ color: 0xfef3c7, transparent: true, opacity: 0.85 });
  for (let i = 0; i < 10; i++) {
    const b = new THREE.Mesh(bubbleGeo, bubbleMat);
    b.visible = false;
    b.userData = { ang: Math.random() * Math.PI * 2, rad: Math.random() * 0.08, y: 0.18 + Math.random() * 0.11, spd: 0.14 + Math.random() * 0.12 };
    rigGroup.add(b);
    bubbles.push(b);
  }
  const droplets = [];
  const dropGeo = new THREE.SphereGeometry(0.012, 6, 6);
  const dropMat = new THREE.MeshBasicMaterial({ color: 0xfde68a });
  for (let i = 0; i < 5; i++) {
    const d = new THREE.Mesh(dropGeo, dropMat);
    d.visible = false;
    d.userData = { y: 0.52 + (i / 5) * 0.52 };
    rigGroup.add(d);
    droplets.push(d);
  }
  const hoodSign = createSignSprite('通风橱 · 回流提取工位', '丹参 95% 乙醇 70℃ 避光回流', '#f97316', 1.35, 0.36);
  hoodSign.position.set(0, 2.58, -2.68);
  scene.add(hoodSign);

  // ===== STATION 4: CENTRAL PREP BENCH (South Center, z = 2.25) =====
  const benchGroup = new THREE.Group();
  benchGroup.position.set(0, 0, 2.25);
  scene.add(benchGroup);
  const benchBase = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.86, 1.05), cabinetMat);
  benchBase.position.y = 0.43;
  benchGroup.add(benchBase);
  const benchTop = new THREE.Mesh(new THREE.BoxGeometry(2.68, 0.06, 1.14), benchTopMat);
  benchTop.position.y = 0.89;
  benchGroup.add(benchTop);

  const gradCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.040, 0.040, 0.32, 12), clearGlassMat);
  gradCyl.position.set(-0.92, 1.08, 0.05);
  benchGroup.add(gradCyl);
  // Clarified Danshen filtrate flask (for Rotavap Step 1)
  const filtrateFlaskGroup = new THREE.Group();
  const conFlask = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.25, 14), clearGlassMat);
  conFlask.position.set(-0.48, 1.045, -0.08);
  filtrateFlaskGroup.add(conFlask);
  const conLiq = new THREE.Mesh(new THREE.ConeGeometry(0.098, 0.14, 14), new THREE.MeshLambertMaterial({ color: 0x991b1b, transparent: true, opacity: 0.85 }));
  conLiq.position.set(-0.48, 0.99, -0.08);
  filtrateFlaskGroup.add(conLiq);
  benchGroup.add(filtrateFlaskGroup);

  // Buchner suction flask + Syringe 0.22 um filter & 2 mL Amber HPLC Vial Rack (for HPLC Step 1)
  const sucFlask = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.20, 14), clearGlassMat);
  sucFlask.position.set(0.05, 1.02, -0.10);
  benchGroup.add(sucFlask);
  const buchner = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.048, 0.075, 14), whiteBodyMat);
  buchner.position.set(0.05, 1.15, -0.10);
  benchGroup.add(buchner);

  const vialRackGroup = new THREE.Group();
  const rackBlock = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.045, 0.14), new THREE.MeshLambertMaterial({ color: 0x0369a1 }));
  rackBlock.position.set(0.48, 0.945, 0.08);
  vialRackGroup.add(rackBlock);
  for (let vi = 0; vi < 4; vi++) {
    const vial = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.055, 10), amberGlassMat);
    vial.position.set(0.40 + vi * 0.052, 0.985, 0.08);
    vialRackGroup.add(vial);
  }
  const syringeFilter = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.014, 12), new THREE.MeshLambertMaterial({ color: 0x10b981 }));
  syringeFilter.position.set(0.48, 0.935, -0.14);
  vialRackGroup.add(syringeFilter);
  benchGroup.add(vialRackGroup);

  const notebook = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.022, 0.34), new THREE.MeshLambertMaterial({ color: 0x064e3b }));
  notebook.position.set(0.90, 0.935, 0.10);
  notebook.rotation.y = -0.12;
  benchGroup.add(notebook);
  const msdsBinder = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.032, 0.30), new THREE.MeshLambertMaterial({ color: 0xb91c1c }));
  msdsBinder.position.set(1.10, 0.94, -0.20);
  msdsBinder.rotation.y = 0.18;
  benchGroup.add(msdsBinder);

  const benchSign = createSignSprite('中心前处理实验台', '抽滤醇提液 · 0.22μm 过膜装瓶 · 记录本', '#a78bfa', 1.52, 0.38);
  benchSign.position.set(0, 1.86, 2.25);
  scene.add(benchSign);

  // ===== STATION 5: 3D ROTARY EVAPORATOR RE-52AA (West-South, x = -4.1, z = 1.55) =====
  const rvGroup = new THREE.Group();
  rvGroup.position.set(-4.1, 0, 1.55);
  scene.add(rvGroup);

  const rvBench = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.88, 1.95), cabinetMat);
  rvBench.position.set(0, 0.44, 0);
  rvGroup.add(rvBench);
  const rvTop = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.06, 2.02), benchTopMat);
  rvTop.position.set(0, 0.91, 0);
  rvGroup.add(rvTop);

  // Lift column + motor head (oriented along Z so player facing West sees full side profile!)
  const rvBasePlate = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.05, 0.44), whiteBodyMat);
  rvBasePlate.position.set(0.05, 0.965, 0.02);
  rvGroup.add(rvBasePlate);
  const rvColumn = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.82, 12), steelMat);
  rvColumn.position.set(0.02, 1.38, 0.02);
  rvGroup.add(rvColumn);

  // Movable lift carriage (moves down when lowered into 50℃ water bath!)
  const rvCarriage = new THREE.Group();
  rvCarriage.position.set(0.08, 1.56, 0.02);
  rvGroup.add(rvCarriage);

  const rvMotorBox = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.15, 0.24), whiteBodyMat);
  rvCarriage.add(rvMotorBox);

  // Tilted rotating evaporation shaft & flask (+Z side: dips into water bath)
  const rvTiltArm = new THREE.Group();
  rvTiltArm.position.set(0.02, -0.02, 0.14);
  rvTiltArm.rotation.x = 0.62; // tilted down toward +Z water bath
  rvCarriage.add(rvTiltArm);

  const rvSpinAssembly = new THREE.Group();
  rvTiltArm.add(rvSpinAssembly);

  const rvVaporDuct = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.24, 12), clearGlassMat);
  rvVaporDuct.rotation.x = Math.PI / 2;
  rvVaporDuct.position.z = 0.12;
  rvSpinAssembly.add(rvVaporDuct);

  // Keck clip (yellow/green joint clip)
  const rvKeckClip = new THREE.Mesh(new THREE.TorusGeometry(0.030, 0.008, 8, 14), new THREE.MeshLambertMaterial({ color: 0x10b981 }));
  rvKeckClip.position.z = 0.22;
  rvSpinAssembly.add(rvKeckClip);

  const rvEvapFlask = new THREE.Mesh(new THREE.SphereGeometry(0.125, 16, 14), glassMat);
  rvEvapFlask.position.z = 0.34;
  rvSpinAssembly.add(rvEvapFlask);
  const rvEvapLiqMat = new THREE.MeshLambertMaterial({ color: 0x991b1b, transparent: true, opacity: 0.88 });
  const rvEvapLiq = new THREE.Mesh(new THREE.SphereGeometry(0.114, 14, 12, 0, Math.PI * 2, Math.PI * 0.38, Math.PI * 0.62), rvEvapLiqMat);
  rvEvapLiq.position.z = 0.34;
  rvSpinAssembly.add(rvEvapLiq);
  rvEvapFlask.visible = false;
  rvEvapLiq.visible = false;
  rvKeckClip.visible = false;

  // Serpentine Diagonal Condenser & Receiving Flask (-Z side of motor head)
  const rvCondAssembly = new THREE.Group();
  rvCondAssembly.position.set(0.02, 0.04, -0.16);
  rvCondAssembly.rotation.x = 0.45;
  rvCarriage.add(rvCondAssembly);

  const rvCondTube = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.48, 14), glassMat);
  rvCondTube.position.y = 0.18;
  rvCondAssembly.add(rvCondTube);
  const rvCondWaterMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.044, 0.44, 12), new THREE.MeshLambertMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.52 }));
  rvCondWaterMesh.position.y = 0.18;
  rvCondWaterMesh.visible = false;
  rvCondAssembly.add(rvCondWaterMesh);

  // Red PTFE air-release vent valve at top of condenser
  const rvVentKnobMat = new THREE.MeshLambertMaterial({ color: 0xef4444 });
  const rvVentKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.045, 10), rvVentKnobMat);
  rvVentKnob.position.set(0, 0.45, 0);
  rvCondAssembly.add(rvVentKnob);

  // Receiving flask hanging below condenser (-Z)
  const rvRecvFlask = new THREE.Mesh(new THREE.SphereGeometry(0.105, 14, 12), clearGlassMat);
  rvRecvFlask.position.set(0.02, -0.22, -0.26);
  rvCarriage.add(rvRecvFlask);
  const rvRecvLiq = new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 10, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.45), new THREE.MeshLambertMaterial({ color: 0xfef3c7, transparent: true, opacity: 0.72 }));
  rvRecvLiq.position.set(0.02, -0.22, -0.26);
  rvRecvLiq.scale.set(0.2, 0.2, 0.2);
  rvRecvLiq.visible = false;
  rvCarriage.add(rvRecvLiq);

  // Digital Water Bath Pot (at +Z = +0.36 on bench)
  const rvBathPot = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.18, 0.20, 18), steelMat);
  rvBathPot.position.set(0.10, 1.04, 0.38);
  rvGroup.add(rvBathPot);
  const rvBathWater = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.175, 0.02, 16), new THREE.MeshLambertMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.65 }));
  rvBathWater.position.set(0.10, 1.13, 0.38);
  rvGroup.add(rvBathWater);

  // Circulating Water Vacuum Pump + Digital Pressure LCD (at -Z = -0.66 on bench)
  const vacPumpBody = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.30, 0.40), new THREE.MeshLambertMaterial({ color: 0x1e3a5f }));
  vacPumpBody.position.set(0.08, 1.09, -0.68);
  rvGroup.add(vacPumpBody);

  const vacLcdCanvas = document.createElement('canvas');
  vacLcdCanvas.width = 256; vacLcdCanvas.height = 96;
  const vacLcdCtx = vacLcdCanvas.getContext('2d');
  const vacLcdTex = new THREE.CanvasTexture(vacLcdCanvas);
  vacLcdTex.colorSpace = THREE.SRGBColorSpace;
  function updateVacLcd(mpaText, subText, ok = true) {
    vacLcdCtx.fillStyle = '#062420';
    vacLcdCtx.fillRect(0, 0, 256, 96);
    vacLcdCtx.strokeStyle = ok ? '#38bdf8' : '#f43f5e';
    vacLcdCtx.lineWidth = 4;
    vacLcdCtx.strokeRect(3, 3, 250, 90);
    vacLcdCtx.fillStyle = ok ? '#7dd3fc' : '#fda4af';
    vacLcdCtx.font = 'bold 34px monospace';
    vacLcdCtx.textAlign = 'right';
    vacLcdCtx.fillText(mpaText, 240, 54);
    vacLcdCtx.fillStyle = '#cbd5e1';
    vacLcdCtx.font = 'bold 16px sans-serif';
    vacLcdCtx.textAlign = 'left';
    vacLcdCtx.fillText(subText, 14, 82);
    vacLcdTex.needsUpdate = true;
  }
  updateVacLcd('0.000 MPa', 'VENT OPEN · 常压');
  const vacLcdMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.30, 0.11), new THREE.MeshBasicMaterial({ map: vacLcdTex }));
  vacLcdMesh.position.set(0.265, 1.14, -0.68);
  vacLcdMesh.rotation.y = Math.PI / 2;
  rvGroup.add(vacLcdMesh);

  const rvSign = createSignSprite('减压旋转蒸发工位', '50℃ 低温成膜浓缩 · 先放气后停泵', '#0ea5e9', 1.25, 0.34);
  rvSign.position.set(-3.9, 2.02, 1.55);
  scene.add(rvSign);

  // ===== STATION 6: 3D HPLC-DAD CHROMATOGRAPHY STACK + LIVE MONITOR (East-South, x = 4.1, z = 1.55) =====
  const lcGroup = new THREE.Group();
  lcGroup.position.set(4.1, 0, 1.55);
  scene.add(lcGroup);

  const lcBench = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.88, 2.05), cabinetMat);
  lcBench.position.set(0, 0.44, 0);
  lcGroup.add(lcBench);
  const lcTop = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.06, 2.12), benchTopMat);
  lcTop.position.set(0, 0.91, 0);
  lcGroup.add(lcTop);

  // Modular 4-Tier HPLC Tower (z = -0.36): Degasser/Pump -> Autosampler -> Column Oven -> DAD Detector
  const lcTower = new THREE.Group();
  lcTower.position.set(-0.04, 0.94, -0.36);
  lcGroup.add(lcTower);

  [
    { y: 0.09, h: 0.17, color: 0xf8fafc, stripe: 0x0f4c3a }, // Quaternary Pump + Degasser
    { y: 0.27, h: 0.17, color: 0xf1f5f9, stripe: 0x0284c7 }, // Autosampler
    { y: 0.44, h: 0.14, color: 0xf8fafc, stripe: 0xd97706 }, // Column Thermostat 30℃
    { y: 0.59, h: 0.14, color: 0xf1f5f9, stripe: 0x7c3aed }  // DAD UV Detector 270 nm
  ].forEach((mod) => {
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.50, mod.h, 0.56), new THREE.MeshLambertMaterial({ color: mod.color }));
    box.position.y = mod.y;
    lcTower.add(box);
    const frontAccent = new THREE.Mesh(new THREE.BoxGeometry(0.015, mod.h * 0.72, 0.50), new THREE.MeshLambertMaterial({ color: mod.stripe }));
    frontAccent.position.set(-0.252, mod.y, 0);
    lcTower.add(frontAccent);
  });

  // Autosampler dark glass window + loaded vial indicator LED
  const samplerWindow = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.11, 0.26), new THREE.MeshPhongMaterial({ color: 0x0f172a, transparent: true, opacity: 0.72 }));
  samplerWindow.position.set(-0.255, 0.27, 0.06);
  lcTower.add(samplerWindow);
  const lcStatusLedMat = new THREE.MeshBasicMaterial({ color: 0x64748b });
  const lcStatusLed = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), lcStatusLedMat);
  lcStatusLed.position.set(-0.258, 0.59, -0.18);
  lcTower.add(lcStatusLed);

  // Top Solvent Tray + 4 Mobile-Phase Bottles (MeOH, ACN, 0.1% H3PO4, Ultra-pure H2O)
  const solvTray = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.04, 0.54), steelMat);
  solvTray.position.y = 0.68;
  lcTower.add(solvTray);
  [
    { z: -0.18, mat: amberGlassMat, cap: 0x7c3aed },
    { z: -0.06, mat: amberGlassMat, cap: 0x0284c7 },
    { z: 0.06,  mat: clearGlassMat, cap: 0x059669 },
    { z: 0.18,  mat: clearGlassMat, cap: 0x2563eb }
  ].forEach((mb) => {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.18, 12), mb.mat);
    b.position.set(0, 0.79, mb.z);
    lcTower.add(b);
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.03, 10), new THREE.MeshLambertMaterial({ color: mb.cap }));
    c.position.set(0, 0.895, mb.z);
    lcTower.add(c);
  });

  // Chromatography Workstation Widescreen Monitor (z = +0.46, facing West toward player!)
  const monStand = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.18, 12), darkMetalMat);
  monStand.position.set(-0.08, 1.03, 0.48);
  lcGroup.add(monStand);
  const monFrame = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.44, 0.68), darkMetalMat);
  monFrame.position.set(-0.10, 1.30, 0.48);
  monFrame.rotation.y = 0.14;
  lcGroup.add(monFrame);

  const lcScreenCanvas = document.createElement('canvas');
  lcScreenCanvas.width = 420; lcScreenCanvas.height = 260;
  const lcCtx = lcScreenCanvas.getContext('2d');
  const lcScreenTex = new THREE.CanvasTexture(lcScreenCanvas);
  lcScreenTex.colorSpace = THREE.SRGBColorSpace;

  function drawHplcScreen() {
    const w = 420, h = 260;
    lcCtx.fillStyle = '#061a17';
    lcCtx.fillRect(0, 0, w, h);
    lcCtx.strokeStyle = 'rgba(52,211,153,0.22)';
    lcCtx.lineWidth = 1;
    for (let gx = 42; gx < w - 16; gx += 46) {
      lcCtx.beginPath(); lcCtx.moveTo(gx, 36); lcCtx.lineTo(gx, h - 32); lcCtx.stroke();
    }
    for (let gy = 50; gy < h - 30; gy += 38) {
      lcCtx.beginPath(); lcCtx.moveTo(42, gy); lcCtx.lineTo(w - 16, gy); lcCtx.stroke();
    }
    lcCtx.fillStyle = '#10b981';
    lcCtx.font = 'bold 14px sans-serif';
    lcCtx.fillText(`DAD 270 nm  |  C18 30.0℃  |  P = ${state.lcPressureMpa.toFixed(1)} MPa`, 14, 22);

    const baseY = h - 46;
    lcCtx.strokeStyle = '#34d399';
    lcCtx.lineWidth = 2.4;
    lcCtx.beginPath();
    const maxMin = state.lcRunning || state.lcPeakDone ? Math.max(0.5, state.lcRunMin) : 15;
    const drawToMin = state.lcPeakDone ? 15 : (state.lcRunning ? state.lcRunMin : (state.lcEquilibrated ? 15 : 6));
    const plotW = w - 62;
    for (let i = 0; i <= 140; i++) {
      const t = (i / 140) * 15;
      if (t > drawToMin) break;
      const x = 44 + (t / 15) * plotW;
      let signal = 0;
      if (!state.lcEquilibrated && !state.lcRunning && !state.lcPeakDone) {
        signal = Math.sin(i * 0.45) * 6 + (state.lcPurged ? 0 : Math.cos(i * 1.1) * 10);
      } else if (state.lcRunning || state.lcPeakDone) {
        // Solvent front at 2.1 min, Cryptotanshinone at 8.4 min, Tanshinone IIA main peak at 11.42 min
        signal += 22 * Math.exp(-Math.pow((t - 2.1) / 0.22, 2));
        signal += 38 * Math.exp(-Math.pow((t - 8.4) / 0.34, 2));
        signal += 138 * Math.exp(-Math.pow((t - 11.42) / 0.38, 2));
      }
      const y = baseY - signal;
      if (i === 0) lcCtx.moveTo(x, y);
      else lcCtx.lineTo(x, y);
    }
    lcCtx.stroke();

    if (state.lcPeakDone || state.lcRunMin >= 11.8) {
      const pkX = 44 + (11.42 / 15) * plotW;
      lcCtx.fillStyle = '#fde047';
      lcCtx.font = 'bold 13px sans-serif';
      lcCtx.fillText('丹参酮 IIA (tR=11.42m, N=6840)', pkX - 96, baseY - 146);
    }
    lcCtx.fillStyle = '#94a3b8';
    lcCtx.font = '12px monospace';
    lcCtx.fillText('0 min', 42, h - 12);
    lcCtx.fillText('7.5 min', 195, h - 12);
    lcCtx.fillText('15.0 min', w - 74, h - 12);
    lcScreenTex.needsUpdate = true;
  }
  drawHplcScreen();

  const monScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.64, 0.39), new THREE.MeshBasicMaterial({ map: lcScreenTex }));
  monScreen.position.set(-0.122, 1.30, 0.48);
  monScreen.rotation.y = -Math.PI / 2 + 0.14;
  lcGroup.add(monScreen);

  const lcSign = createSignSprite('HPLC-DAD 液相色谱工位', 'C18 柱 30℃ · 270nm 外标法定量', '#a855f7', 1.25, 0.34);
  lcSign.position.set(3.9, 2.02, 1.55);
  scene.add(lcSign);

  // Glowing Floor Target Beacon
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.65, side: THREE.DoubleSide });
  const beaconRing = new THREE.Mesh(new THREE.RingGeometry(0.32, 0.46, 24), beaconMat);
  beaconRing.rotation.x = -Math.PI / 2;
  beaconRing.position.set(-2.15, 0.02, -1.35);
  scene.add(beaconRing);

  // ===== FIRST-PERSON PLAYER STATE =====
  const player = { x: 0, y: 1.55, z: 0.65, yaw: 0, pitch: -0.04 };
  let autoWalkTarget = null;
  const keys = {};
  const padHeld = {};
  let looking = false;
  let lastPtrX = 0;
  let lastPtrY = 0;

  function setNotice(msg, type = 'info') {
    state.notice = msg;
    if (!noticeEl) return;
    noticeEl.textContent = msg;
    noticeEl.className = 'flex-1 min-w-[200px] px-3 py-2 rounded-xl backdrop-blur-xs text-[11.5px] font-semibold leading-snug border ' + (
      type === 'error'
        ? 'bg-rose-950/90 border-rose-400/70 text-rose-100'
        : type === 'success'
          ? 'bg-emerald-950/90 border-emerald-400/70 text-emerald-100'
          : 'bg-slate-950/82 border-emerald-400/25 text-emerald-100'
    );
  }

  function updateInventoryHud() {
    if (!inventoryBarEl) return;
    if (state.scenario === 'reflux') {
      const hasReagents = state.completedSteps.has('take_reagents');
      const weighed = state.completedSteps.has('weigh_herb');
      const loaded = state.completedSteps.has('load_flask');
      if (!hasReagents || loaded) {
        inventoryBarEl.innerHTML = loaded
          ? '<span class="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-400/40 text-emerald-200 text-[10.5px] font-bold">物料已全部装入通风橱圆底烧瓶</span>'
          : '';
        return;
      }
      const items = [
        weighed ? '丹参粗粉 50.00g (已称量)' : '丹参粗粉 (待称量)',
        '95% 乙醇 400mL',
        '素瓷沸石',
        '锡箔避光纸'
      ];
      inventoryBarEl.innerHTML =
        '<span class="px-1.5 py-0.5 rounded-md bg-slate-950/80 text-amber-300 text-[10.5px] font-extrabold">随身物品：</span>' +
        items.map((it) => `<span class="px-2 py-0.5 rounded-md bg-slate-950/80 border border-emerald-400/35 text-emerald-100 text-[10.5px] font-bold">${it}</span>`).join('');
    } else if (state.scenario === 'rotavap') {
      const picked = state.completedSteps.has('rv_take_filtrate');
      const mounted = state.completedSteps.has('rv_mount_flask');
      inventoryBarEl.innerHTML = picked && !mounted
        ? '<span class="px-2 py-0.5 rounded-md bg-slate-950/80 border border-sky-400/40 text-sky-200 text-[10.5px] font-bold">随身携带：澄清丹参醇提滤液 (250 mL) + 标准磨口防脱卡夹</span>'
        : '';
    } else {
      const filtered = state.completedSteps.has('lc_filter_vial');
      const injected = state.completedSteps.has('lc_load_inject');
      inventoryBarEl.innerHTML = filtered && !injected
        ? '<span class="px-2 py-0.5 rounded-md bg-slate-950/80 border border-purple-400/40 text-purple-200 text-[10.5px] font-bold">随身携带：0.22 μm 过膜供试品小瓶 + 丹参酮 IIA 对照品小瓶</span>'
        : '';
    }
  }

  function walkToZone(zoneId) {
    const st = STATIONS[zoneId];
    if (!st) return;
    const dx = st.lookAt.x - st.standPos.x;
    const dz = st.lookAt.z - st.standPos.z;
    autoWalkTarget = {
      x: st.standPos.x,
      z: st.standPos.z,
      yaw: Math.atan2(-dx, -dz),
      pitch: -0.06
    };
  }

  function syncHudBadges() {
    const sc = curScenario();
    if (scBadgeEl) scBadgeEl.textContent = sc.badge;
    if (scTitleEl) scTitleEl.textContent = sc.title;
    if (telemetryLblEl) telemetryLblEl.textContent = sc.telemetryTitle;
    if (kpi1LblEl) kpi1LblEl.textContent = sc.kpi1[0];
    if (kpi1ValEl) kpi1ValEl.textContent = sc.kpi1[1];
    if (kpi2LblEl) kpi2LblEl.textContent = sc.kpi2[0];
    if (kpi2ValEl) kpi2ValEl.textContent = sc.kpi2[1];

    container.querySelectorAll('[data-vlab-sc]').forEach((btn) => {
      const on = btn.getAttribute('data-vlab-sc') === state.scenario;
      btn.className = 'px-3 py-1.5 rounded-lg text-xs font-extrabold border transition ' + (
        on
          ? 'bg-[#0f4c3a] text-white border-[#0f4c3a]'
          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-[#0f4c3a]'
      );
    });

    if (state.scenario === 'reflux') {
      if (waterBadgeEl) {
        waterBadgeEl.textContent = state.waterOn ? '冷凝水: 下进上出已通' : '冷凝水: 关';
        waterBadgeEl.className = 'px-2 py-1 rounded-lg text-[11px] font-bold border ' + (
          state.waterOn ? 'bg-sky-950/85 border-sky-400/50 text-sky-200' : 'bg-slate-950/75 border-white/15 text-slate-300'
        );
      }
      if (timeTxtEl) timeTxtEl.textContent = `${Math.round(state.refluxMinutes)} / 60 min`;
    } else if (state.scenario === 'rotavap') {
      if (waterBadgeEl) {
        waterBadgeEl.textContent = state.rvVacuumOn ? `真空: ${state.rvVacuumMpa.toFixed(3)} MPa` : (state.rvWaterOn ? '冷却水: 已通 · 常压' : '冷却水: 关 · 常压');
        waterBadgeEl.className = 'px-2 py-1 rounded-lg text-[11px] font-bold border ' + (
          state.rvVacuumOn ? 'bg-sky-950/85 border-sky-400/50 text-sky-200' : 'bg-slate-950/75 border-white/15 text-slate-300'
        );
      }
      if (timeTxtEl) timeTxtEl.textContent = `浓缩 ${Math.round(state.rvProgress * 100)}%`;
    } else {
      if (waterBadgeEl) {
        waterBadgeEl.textContent = `泵压: ${state.lcPressureMpa.toFixed(1)} MPa`;
        waterBadgeEl.className = 'px-2 py-1 rounded-lg text-[11px] font-bold border ' + (
          state.lcEquilibrated ? 'bg-purple-950/85 border-purple-400/50 text-purple-200' : 'bg-slate-950/75 border-white/15 text-slate-300'
        );
      }
      if (timeTxtEl) timeTxtEl.textContent = `${state.lcRunMin.toFixed(1)} / 15.0 min`;
    }
  }

  function update3DVisualsFromState() {
    // Reflux visuals
    targetPickupGroup.visible = !(state.scenario === 'reflux' && state.completedSteps.has('take_reagents'));
    powderMound.visible = state.scenario === 'reflux' && state.completedSteps.has('weigh_herb');
    if (state.scenario === 'reflux') {
      updateBalanceLcd(state.completedSteps.has('weigh_herb') ? '50.00 g' : '0.00 g', state.completedSteps.has('weigh_herb') ? 'DANSHEN 20M' : 'TARE READY');
    }
    flaskGroup.visible = state.flaskLoaded;
    mantleGroup.visible = state.rigAssembled;
    condGroup.visible = state.rigAssembled;
    foilShield.visible = state.foilOn;
    exhaustLedMat.color.setHex(state.exhaustOn ? 0x22c55e : 0x64748b);
    condWaterFill.visible = state.waterOn && state.rigAssembled;
    inletHose.material = state.waterOn ? hoseMatOn : hoseMatOff;
    outletHose.material = state.waterOn ? hoseMatOn : hoseMatOff;
    heaterGlowMat.color.setHex(state.heatingOn ? 0xf97316 : 0x334155);

    // Rotavap visuals
    filtrateFlaskGroup.visible = !(state.scenario === 'rotavap' && state.completedSteps.has('rv_take_filtrate'));
    rvEvapFlask.visible = state.rvFlaskMounted;
    rvEvapLiq.visible = state.rvFlaskMounted;
    rvKeckClip.visible = state.rvFlaskMounted;
    rvCondWaterMesh.visible = state.rvWaterOn;
    rvCarriage.position.y = state.rvBathIn ? 1.44 : 1.56;
    rvVentKnobMat.color.setHex(state.rvVentClosed ? 0x10b981 : 0xef4444);
    rvRecvLiq.visible = state.rvProgress > 0.05;
    const recvScale = Math.max(0.22, Math.min(1.0, state.rvProgress));
    rvRecvLiq.scale.set(recvScale, recvScale, recvScale);
    updateVacLcd(
      `${state.rvVacuumMpa.toFixed(3)} MPa`,
      state.rvVentClosed ? (state.rvVacuumOn ? 'VACUUM LOCKED' : 'VENT CLOSED') : 'VENT OPEN · 常压',
      true
    );

    // HPLC visuals
    lcStatusLedMat.color.setHex(state.lcEquilibrated ? 0x22c55e : (state.lcDegasOn ? 0xf59e0b : 0x64748b));
    drawHplcScreen();

    const next = getNextStep();
    if (next && STATIONS[next.zone]) {
      const sp = STATIONS[next.zone].standPos;
      beaconRing.position.set(sp.x, 0.02, sp.z);
      beaconRing.visible = true;
    } else {
      beaconRing.visible = false;
    }
    syncHudBadges();
    updateInventoryHud();
  }

  function renderStepList() {
    const steps = curScenario().steps;
    const next = getNextStep();
    const doneCount = state.completedSteps.size;
    if (progressTxtEl) progressTxtEl.textContent = `${doneCount} / ${steps.length} 步`;
    if (progressBarEl) progressBarEl.style.width = `${Math.round((doneCount / steps.length) * 100)}%`;

    stepListEl.innerHTML = steps.map((st) => {
      const done = state.completedSteps.has(st.id);
      const isCur = next && next.id === st.id;
      const zName = STATIONS[st.zone].name.split('（')[0];
      return `
        <button type="button" data-vlab-exec="${st.id}" class="w-full text-left p-2 rounded-xl border transition flex items-start justify-between gap-2 ${
          done
            ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-400/70 text-emerald-900 dark:text-emerald-200'
            : isCur
              ? 'bg-amber-50/90 dark:bg-amber-950/35 border-amber-400 text-slate-900 dark:text-amber-100 ring-1 ring-amber-400/60'
              : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
        }">
          <div class="min-w-0">
            <div class="font-extrabold text-[11.5px] leading-snug">${st.num}. ${st.title}</div>
            <div class="text-[10px] opacity-80 mt-0.5">工位：${zName}</div>
          </div>
          <span class="shrink-0 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
            done ? 'bg-[#0f4c3a] text-white' : (isCur ? 'bg-[#9a4a24] text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300')
          }">${done ? '已完' : (isCur ? '当前' : '待做')}</span>
        </button>
      `;
    }).join('');

    stepListEl.querySelectorAll('[data-vlab-exec]').forEach((btn) => {
      btn.addEventListener('click', () => triggerStep(btn.getAttribute('data-vlab-exec')));
    });
    updateActionButton();
  }

  function updateActionButton() {
    const next = getNextStep();
    if (!actionBtn) return;
    if (!next) {
      actionBtn.textContent = `${curScenario().shortLabel}全流程已完成`;
      actionBtn.className = 'shrink-0 px-3.5 py-2 rounded-xl bg-[#0f4c3a] text-white text-xs font-extrabold border border-emerald-300/40';
      return;
    }
    if (state.activeZone === next.zone) {
      actionBtn.textContent = `${next.actionLabel} [E]`;
      actionBtn.className = 'shrink-0 px-3.5 py-2 rounded-xl bg-[#9a4a24] hover:bg-[#7d3a1b] text-white text-xs font-extrabold shadow-lg border border-orange-300/50 transition';
    } else {
      const targetName = STATIONS[next.zone].name.split('（')[0];
      actionBtn.textContent = `走近【${targetName}】执行第 ${next.num} 步 [E]`;
      actionBtn.className = 'shrink-0 px-3.5 py-2 rounded-xl bg-[#0f4c3a] hover:bg-[#0a382b] text-white text-xs font-extrabold shadow-lg border border-emerald-300/40 transition';
    }
  }

  function flagSafetyInterlock(msg, reason) {
    if (safetyTxtEl) { safetyTxtEl.textContent = '已拦截'; safetyTxtEl.className = 'font-extrabold text-rose-600'; }
    setNotice(msg, 'error');
    return { ok: false, reason };
  }

  function triggerStep(stepId, skipWalkCheck = false) {
    const steps = curScenario().steps;
    const st = steps.find((x) => x.id === stepId);
    if (!st) return { ok: false, reason: 'unknown_step' };
    if (state.completedSteps.has(stepId)) {
      setNotice(`第 ${st.num} 步「${st.title}」已完成，请继续下一步。`, 'info');
      return { ok: true, alreadyDone: true };
    }

    // ===== 5 REAL SAFETY INTERLOCKS ACROSS THE 3 SCENARIOS =====
    if (stepId === 'run_reflux' && !state.waterOn) {
      return flagSafetyInterlock('安全拦截：严禁未通冷凝水直接加热回流！95% 乙醇沸点 78.4℃，请先完成第 5 步接通冷凝水（下进上出）。', 'safety_no_water');
    }
    if (stepId === 'rv_close_vent_vac' && !state.rvWaterOn) {
      return flagSafetyInterlock('安全拦截：未开启蛇形冷凝管冷却水前严禁抽真空浓缩！否则乙醇蒸气将直抽入真空泵，请先完成第 3 步通冷却水。', 'safety_rv_no_water');
    }
    if (stepId === 'rv_stop_pump' && state.rvVentClosed) {
      updateVacLcd('-0.085 MPa', 'BACKSUCK RISK!', false);
      return flagSafetyInterlock('防倒吸安全拦截：严禁在负压状态下直接关闭真空泵！否则循环水会瞬间倒吸入浓缩液，请先完成第 6 步升瓶并旋开放气阀恢复常压。', 'safety_rv_backsuck');
    }
    if (stepId === 'lc_equilibrate' && !state.lcPurged) {
      return flagSafetyInterlock('仪器保护拦截：四元梯度泵尚未执行 Purge 排气泡！直接升压会导致压力剧烈脉动与基线锯齿，请先完成第 3 步排气泡。', 'safety_lc_no_purge');
    }
    if (stepId === 'lc_load_inject' && !state.lcEquilibrated) {
      return flagSafetyInterlock('质控拦截：C18 色谱柱与 270 nm 基线尚未平衡稳定！直接进样将导致保留时间漂移与积分失真，请先完成第 4 步平衡基线。', 'safety_lc_unbalanced');
    }

    const next = getNextStep();
    if (next && next.id !== stepId) {
      setNotice(`操作顺序提示：请先完成第 ${next.num} 步「${next.title}」（工位：${STATIONS[next.zone].name}）。`, 'error');
      return { ok: false, reason: 'out_of_order' };
    }
    if (!skipWalkCheck && state.activeZone !== st.zone) {
      walkToZone(st.zone);
      setNotice(`正在走向【${STATIONS[st.zone].name}】，到达后再次点击按钮或按 [E] 执行：${st.title}`, 'info');
      return { ok: false, reason: 'walking_to_zone' };
    }
    if (safetyTxtEl) { safetyTxtEl.textContent = '正常'; safetyTxtEl.className = 'font-extrabold text-emerald-600'; }

    // Scenario 1: Reflux
    if (stepId === 'take_reagents') {
      state.completedSteps.add(stepId);
      setNotice('已从试剂架领取丹参粗粉、95% 乙醇、素瓷沸石与锡箔避光纸。请前往【精密天平区】称量 50.00 g。', 'success');
    } else if (stepId === 'weigh_herb') {
      state.completedSteps.add(stepId);
      setNotice('精密天平归零称量完成（50.00 g 丹参粗粉）。请前往【通风橱】装瓶搭回流装置。', 'success');
    } else if (stepId === 'load_flask') {
      state.flaskLoaded = true;
      state.completedSteps.add(stepId);
      setNotice('已固定 1000 mL 圆底烧瓶并加入 50 g 丹参粗粉、沸石与 400 mL 95% 乙醇。', 'success');
    } else if (stepId === 'assemble_rig') {
      state.rigAssembled = true; state.foilOn = true; state.exhaustOn = true;
      state.completedSteps.add(stepId);
      setNotice('已自下而上装配数显电热套、5 球球形冷凝管、避光锡箔并开启通风橱排风。请接通冷凝水。', 'success');
    } else if (stepId === 'start_water') {
      state.waterOn = true;
      state.completedSteps.add(stepId);
      setNotice('冷凝水已按「下口进、上口出」充满夹套，现在可设定 70℃ 开启恒温回流。', 'success');
    } else if (stepId === 'run_reflux') {
      state.heatingOn = true;
      state.completedSteps.add(stepId);
      setNotice('已开启 70℃ 恒温避光回流，烧瓶内微沸起泡、浸提液逐渐转为深丹红色。', 'success');
    } else if (stepId === 'safe_shutdown') {
      state.heatingOn = false; state.waterOn = false; state.shutdownDone = true;
      state.refluxMinutes = 60; state.tempC = 36.5;
      state.completedSteps.add(stepId);
      setNotice('规范停机完成（先断电冷却 → 后关冷凝水），已收集深红色丹参醇提液，可切换至「02 减压旋蒸」继续浓缩。', 'success');
    }
    // Scenario 2: Rotary Evaporator
    else if (stepId === 'rv_take_filtrate') {
      state.completedSteps.add(stepId);
      setNotice('已领取抽滤澄清的丹参醇提滤液（250 mL，≤ 500 mL 蒸发瓶半量）与防脱卡夹，请前往【减压旋蒸工位】。', 'success');
    } else if (stepId === 'rv_mount_flask') {
      state.rvFlaskMounted = true;
      state.completedSteps.add(stepId);
      setNotice('蒸发瓶与乙醇接收瓶已斜置挂好并扣紧标准口卡夹。请先接通蛇形冷凝管循环冷却水。', 'success');
    } else if (stepId === 'rv_cool_water') {
      state.rvWaterOn = true;
      state.completedSteps.add(stepId);
      setNotice('蛇形冷凝管冷却水已接通，现在可关闭放气阀并启动循环水真空泵。', 'success');
    } else if (stepId === 'rv_close_vent_vac') {
      state.rvVentClosed = true; state.rvVacuumOn = true; state.rvVacuumMpa = -0.085;
      state.completedSteps.add(stepId);
      setNotice('放气阀已锁紧，体系真空度稳定在 -0.085 MPa！请开启旋转电机并将蒸发瓶降入 50℃ 水浴。', 'success');
    } else if (stepId === 'rv_spin_bath') {
      state.rvSpinning = true; state.rvBathIn = true; state.tempC = 50.0;
      state.completedSteps.add(stepId);
      setNotice('蒸发瓶正在 75 rpm 匀速旋转成膜，50℃ 低温减压浓缩中，回收乙醇持续滴入下方接收瓶。', 'success');
    } else if (stepId === 'rv_lift_and_vent') {
      state.rvBathIn = false; state.rvSpinning = false; state.rvVentClosed = false;
      state.rvVacuumMpa = 0.0; state.rvProgress = 1.0;
      state.completedSteps.add(stepId);
      setNotice('已升起蒸发瓶脱离水浴、停转电机，并缓慢旋开放气阀恢复常压（0.000 MPa），彻底解除倒吸风险！', 'success');
    } else if (stepId === 'rv_stop_pump') {
      state.rvVacuumOn = false; state.rvWaterOn = false; state.tempC = 28.0;
      state.completedSteps.add(stepId);
      setNotice('减压旋蒸规范收官（先升瓶放气 → 后关真空泵与冷却水）！已获得丹参浓缩稠膏并回收 95% 乙醇。', 'success');
    }
    // Scenario 3: HPLC-DAD
    else if (stepId === 'lc_filter_vial') {
      state.lcVialsReady = true;
      state.completedSteps.add(stepId);
      setNotice('供试液与丹参酮 IIA 对照品溶液已过 0.22 μm 有机系微孔滤膜并装入 2 mL 棕色小瓶，请前往【HPLC-DAD 液相工位】。', 'success');
    } else if (stepId === 'lc_degas_mobile') {
      state.lcDegasOn = true;
      state.completedSteps.add(stepId);
      setNotice('甲醇-水 (75:25) 储液瓶液位充足，在线真空脱气机已启动。接下来请执行泵头 Purge 排气泡。', 'success');
    } else if (stepId === 'lc_purge_pump') {
      state.lcPurged = true; state.lcPressureMpa = 1.2;
      state.completedSteps.add(stepId);
      setNotice('3.0 mL/min Purge 排气泡完成并已锁紧排空阀，输液管线无残留气泡。请升压平衡 C18 色谱柱。', 'success');
    } else if (stepId === 'lc_equilibrate') {
      state.lcEquilibrated = true; state.lcPressureMpa = 14.6; state.tempC = 30.0;
      state.completedSteps.add(stepId);
      setNotice('C18 色谱柱（30.0℃、1.0 mL/min、270 nm）压力稳定于 14.6 MPa，工作站屏幕基线已平直。', 'success');
    } else if (stepId === 'lc_load_inject') {
      state.lcRunning = true; state.lcRunMin = 0.8;
      state.completedSteps.add(stepId);
      setNotice('自动进样器已吸取 10 μL 注入色谱系统，观察右侧 3D 显示器实时洗脱出峰曲线！', 'success');
    } else if (stepId === 'lc_collect_peak') {
      state.lcRunning = false; state.lcPeakDone = true; state.lcRunMin = 15.0;
      state.completedSteps.add(stepId);
      setNotice('tR = 11.42 min 丹参酮 IIA 主峰积分完成：理论塔板数 N = 6840（药典要求 ≥ 2000），折算药材含量 0.38% 合格！', 'success');
    } else if (stepId === 'lc_flush_shutdown') {
      state.lcPressureMpa = 0.0; state.lcRunning = false;
      state.completedSteps.add(stepId);
      setNotice('已完成 90% 甲醇过渡冲柱 20 min、保存外标法定量报告并平稳降速停泵，三维实验三大单元全部通关！', 'success');
    }

    update3DVisualsFromState();
    renderStepList();
    return { ok: true, stepId };
  }

  function resetScenarioState(scId) {
    state.scenario = SCENARIOS[scId] ? scId : 'reflux';
    state.completedSteps.clear();
    state.tempC = 24.0;
    state.refluxMinutes = 0;
    state.heatingOn = false; state.waterOn = false; state.exhaustOn = false;
    state.foilOn = false; state.flaskLoaded = false; state.rigAssembled = false; state.shutdownDone = false;
    state.rvFlaskMounted = false; state.rvWaterOn = false; state.rvVacuumOn = false;
    state.rvVentClosed = false; state.rvSpinning = false; state.rvBathIn = false;
    state.rvProgress = 0; state.rvVacuumMpa = 0;
    state.lcVialsReady = false; state.lcDegasOn = false; state.lcPurged = false;
    state.lcEquilibrated = false; state.lcRunning = false; state.lcPeakDone = false;
    state.lcRunMin = 0; state.lcPressureMpa = 0;
    liquidMat.color.setHex(0xd97706);
    rvEvapLiqMat.color.setHex(0x991b1b);
    if (safetyTxtEl) { safetyTxtEl.textContent = '正常'; safetyTxtEl.className = 'font-extrabold text-emerald-600'; }
    const sc = curScenario();
    player.x = sc.initPos.x; player.z = sc.initPos.z; player.yaw = sc.initPos.yaw; player.pitch = sc.initPos.pitch;
    autoWalkTarget = null;
    update3DVisualsFromState();
    renderStepList();
    setNotice(sc.initNotice, 'info');
  }

  function resetLab() {
    resetScenarioState(state.scenario);
  }

  function switchScenario(scId) {
    resetScenarioState(scId);
  }

  // ===== INPUTS =====
  container.querySelectorAll('[data-vlab-sc]').forEach((btn) => {
    btn.addEventListener('click', () => switchScenario(btn.getAttribute('data-vlab-sc')));
  });
  actionBtn.addEventListener('click', () => {
    const next = getNextStep();
    if (!next) return;
    if (state.activeZone !== next.zone) {
      walkToZone(next.zone);
      setNotice(`正在走向【${STATIONS[next.zone].name}】…`, 'info');
    } else {
      triggerStep(next.id);
    }
  });
  container.querySelector('#vlab3dResetBtn').addEventListener('click', resetLab);
  container.querySelectorAll('[data-vlab-goto]').forEach((b) => {
    b.addEventListener('click', () => walkToZone(b.getAttribute('data-vlab-goto')));
  });
  container.querySelectorAll('[data-vlab-pad]').forEach((b) => {
    const dir = b.getAttribute('data-vlab-pad');
    const onDown = () => { autoWalkTarget = null; padHeld[dir] = true; };
    const onUp = () => { padHeld[dir] = false; };
    b.addEventListener('pointerdown', onDown);
    b.addEventListener('pointerup', onUp);
    b.addEventListener('pointerleave', onUp);
    b.addEventListener('pointercancel', onUp);
  });

  const onCanvasDown = (e) => {
    looking = true; autoWalkTarget = null; lastPtrX = e.clientX; lastPtrY = e.clientY;
    try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
  };
  const onCanvasMove = (e) => {
    if (!looking) return;
    player.yaw -= (e.clientX - lastPtrX) * 0.0055;
    player.pitch = Math.max(-0.55, Math.min(0.50, player.pitch - (e.clientY - lastPtrY) * 0.0045));
    lastPtrX = e.clientX; lastPtrY = e.clientY;
  };
  const onCanvasUp = () => { looking = false; };
  canvas.addEventListener('pointerdown', onCanvasDown);
  canvas.addEventListener('pointermove', onCanvasMove);
  canvas.addEventListener('pointerup', onCanvasUp);
  canvas.addEventListener('pointercancel', onCanvasUp);

  const onKeyDown = (e) => {
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    const k = e.key.toLowerCase();
    if (['w', 'a', 's', 'd', 'q', 'e', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
      if (k !== 'e') autoWalkTarget = null;
      keys[k] = true;
      if (k === 'e') {
        const next = getNextStep();
        if (next && state.activeZone === next.zone) triggerStep(next.id);
        else if (next) walkToZone(next.zone);
      }
    }
  };
  const onKeyUp = (e) => { keys[e.key.toLowerCase()] = false; };
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  function syncSize() {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(280, Math.round(rect.width || 640));
    const h = Math.max(280, Math.round(rect.height || 430));
    if (canvas.width !== Math.round(w * renderer.getPixelRatio()) || canvas.height !== Math.round(h * renderer.getPixelRatio())) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  }
  syncSize();
  const onResize = () => syncSize();
  window.addEventListener('resize', onResize);

  function drawMinimap() {
    const w = minimapCanvas.width, h = minimapCanvas.height;
    mCtx.clearRect(0, 0, w, h);
    mCtx.fillStyle = '#071f1c';
    mCtx.fillRect(0, 0, w, h);
    const mapX = (wx) => ((wx + 5) / 10) * (w - 12) + 6;
    const mapY = (wz) => ((wz + 4) / 8) * (h - 12) + 6;
    const next = getNextStep();
    Object.values(STATIONS).forEach((st) => {
      const sx = mapX(st.pos.x), sy = mapY(st.pos.z);
      const isTarget = next && next.zone === st.id;
      mCtx.fillStyle = isTarget ? '#f97316' : (state.activeZone === st.id ? '#34d399' : '#64748b');
      mCtx.beginPath(); mCtx.arc(sx, sy, isTarget ? 5 : 3.5, 0, Math.PI * 2); mCtx.fill();
    });
    const px = mapX(player.x), py = mapY(player.z);
    const fx = -Math.sin(player.yaw), fz = -Math.cos(player.yaw);
    mCtx.strokeStyle = '#fde047'; mCtx.lineWidth = 2;
    mCtx.beginPath(); mCtx.moveTo(px, py); mCtx.lineTo(px + fx * 11, py + fz * 11); mCtx.stroke();
    mCtx.fillStyle = '#fde047';
    mCtx.beginPath(); mCtx.arc(px, py, 3.5, 0, Math.PI * 2); mCtx.fill();
  }

  // ===== MAIN LOOP =====
  let lastTs = performance.now();
  let fpsFrames = 0;
  let fpsAccumTs = lastTs;
  let lastZoneReported = '';
  let lcScreenTick = 0;

  function animate(ts) {
    if (destroyed) return;
    rafId = requestAnimationFrame(animate);

    const dt = Math.min(0.05, Math.max(0.001, (ts - lastTs) / 1000));
    lastTs = ts;

    if (autoWalkTarget) {
      const dx = autoWalkTarget.x - player.x;
      const dz = autoWalkTarget.z - player.z;
      const dist = Math.hypot(dx, dz);
      if (dist > 0.06) {
        const step = Math.min(dist, 5.4 * dt);
        player.x += (dx / dist) * step;
        player.z += (dz / dist) * step;
      }
      let dyaw = autoWalkTarget.yaw - player.yaw;
      while (dyaw > Math.PI) dyaw -= Math.PI * 2;
      while (dyaw < -Math.PI) dyaw += Math.PI * 2;
      player.yaw += dyaw * Math.min(1, 9.0 * dt);
      player.pitch += (autoWalkTarget.pitch - player.pitch) * Math.min(1, 7.0 * dt);
      if (dist <= 0.06 && Math.abs(dyaw) < 0.03) autoWalkTarget = null;
    } else {
      const moveSpd = 2.7 * dt;
      const turnSpd = 1.9 * dt;
      if (keys['q'] || padHeld['turnL']) player.yaw += turnSpd;
      if (padHeld['turnR']) player.yaw -= turnSpd;
      const sinY = Math.sin(player.yaw), cosY = Math.cos(player.yaw);
      let mx = 0, mz = 0;
      if (keys['w'] || keys['arrowup'] || padHeld['fwd']) { mx -= sinY; mz -= cosY; }
      if (keys['s'] || keys['arrowdown'] || padHeld['back']) { mx += sinY; mz += cosY; }
      if (keys['a'] || keys['arrowleft'] || padHeld['left']) { mx -= cosY; mz += sinY; }
      if (keys['d'] || keys['arrowright'] || padHeld['right']) { mx += cosY; mz -= sinY; }
      const mlen = Math.hypot(mx, mz);
      if (mlen > 0) {
        player.x += (mx / mlen) * moveSpd;
        player.z += (mz / mlen) * moveSpd;
      }
    }

    player.x = Math.max(-3.05, Math.min(3.05, player.x));
    player.z = Math.max(-2.15, Math.min(3.15, player.z));
    if (Math.abs(player.x) < 1.48 && player.z > 1.45 && player.z < 2.95) {
      if (player.z < 2.2) player.z = 1.45;
      else player.z = 2.95;
    }

    camera.position.set(player.x, player.y, player.z);
    camera.rotation.order = 'YXZ';
    camera.rotation.y = player.yaw;
    camera.rotation.x = player.pitch;

    let nearestId = 'bench';
    let bestDist = 999;
    Object.values(STATIONS).forEach((st) => {
      const d = Math.hypot(player.x - st.standPos.x, player.z - st.standPos.z);
      if (d < bestDist) { bestDist = d; nearestId = st.id; }
    });
    state.activeZone = nearestId;
    if (nearestId !== lastZoneReported) {
      lastZoneReported = nearestId;
      if (zoneLabelEl) zoneLabelEl.textContent = STATIONS[nearestId].name;
      updateActionButton();
    }

    if (beaconRing.visible) {
      const pulse = 1 + 0.12 * Math.sin(ts * 0.005);
      beaconRing.scale.set(pulse, pulse, 1);
    }

    // Scenario 1 live animation
    if (state.heatingOn) {
      state.tempC = Math.min(70.0, state.tempC + 14.0 * dt);
      if (state.tempC >= 68.5) {
        state.refluxMinutes = Math.min(60, state.refluxMinutes + 6.0 * dt);
        const prog = state.refluxMinutes / 60;
        liquidMat.color.copy(new THREE.Color(0xd97706)).lerp(new THREE.Color(0x991b1b), prog);
        if (state.scenario === 'reflux' && timeTxtEl) timeTxtEl.textContent = `${Math.round(state.refluxMinutes)} / 60 min`;
      }
      bubbles.forEach((b) => {
        b.visible = state.tempC >= 60;
        if (!b.visible) return;
        b.userData.y += b.userData.spd * dt;
        if (b.userData.y > 0.29) b.userData.y = 0.17;
        b.position.set(Math.cos(b.userData.ang) * b.userData.rad, b.userData.y, Math.sin(b.userData.ang) * b.userData.rad);
      });
      droplets.forEach((d) => {
        d.visible = state.tempC >= 66 && state.waterOn;
        if (!d.visible) return;
        d.userData.y -= 0.42 * dt;
        if (d.userData.y < 0.46) d.userData.y = 1.02;
        d.position.set(0, d.userData.y, 0);
      });
    } else {
      bubbles.forEach((b) => { b.visible = false; });
      droplets.forEach((d) => { d.visible = false; });
      if (!state.rvBathIn && !state.lcEquilibrated && state.tempC > 24.5) {
        state.tempC = Math.max(24.0, state.tempC - 4.0 * dt);
      }
    }

    // Scenario 2 live Rotary Evaporator rotation & concentration
    if (state.rvSpinning) {
      rvSpinAssembly.rotation.z += 5.5 * dt;
      if (state.rvBathIn && state.rvVacuumOn) {
        state.rvProgress = Math.min(1.0, state.rvProgress + 0.16 * dt);
        rvRecvLiq.visible = state.rvProgress > 0.04;
        const sc = Math.max(0.22, state.rvProgress);
        rvRecvLiq.scale.set(sc, sc, sc);
        rvEvapLiqMat.color.copy(new THREE.Color(0x991b1b)).lerp(new THREE.Color(0x450a0a), state.rvProgress);
        if (state.scenario === 'rotavap' && timeTxtEl) timeTxtEl.textContent = `浓缩 ${Math.round(state.rvProgress * 100)}%`;
      }
    }

    // Scenario 3 live HPLC chromatogram elution
    if (state.lcRunning && !state.lcPeakDone) {
      state.lcRunMin = Math.min(15.0, state.lcRunMin + 2.8 * dt);
      lcScreenTick += dt;
      if (lcScreenTick >= 0.08) {
        lcScreenTick = 0;
        drawHplcScreen();
        if (state.scenario === 'hplc' && timeTxtEl) timeTxtEl.textContent = `${state.lcRunMin.toFixed(1)} / 15.0 min`;
      }
    }

    if (tempHudEl) tempHudEl.textContent = `${state.tempC.toFixed(1)}℃`;

    syncSize();
    renderer.render(scene, camera);
    drawMinimap();

    fpsFrames++;
    if (ts - fpsAccumTs >= 500) {
      state.fps = Math.round((fpsFrames * 1000) / (ts - fpsAccumTs));
      if (fpsHudEl) fpsHudEl.textContent = `${Math.min(60, state.fps)} FPS`;
      fpsFrames = 0;
      fpsAccumTs = ts;
    }
  }

  update3DVisualsFromState();
  renderStepList();
  rafId = requestAnimationFrame(animate);

  return {
    destroy() {
      destroyed = true;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    },
    walkToZone,
    triggerStep,
    resetLab,
    switchScenario,
    getState() {
      return {
        scenario: state.scenario,
        activeZone: state.activeZone,
        completedCount: state.completedSteps.size,
        completedSteps: Array.from(state.completedSteps),
        tempC: Number(state.tempC.toFixed(1)),
        waterOn: state.waterOn,
        heatingOn: state.heatingOn,
        rigAssembled: state.rigAssembled,
        rvVacuumMpa: state.rvVacuumMpa,
        rvSpinning: state.rvSpinning,
        lcPressureMpa: state.lcPressureMpa,
        lcEquilibrated: state.lcEquilibrated,
        fps: state.fps,
        playerPos: { x: Number(player.x.toFixed(2)), z: Number(player.z.toFixed(2)), yaw: Number(player.yaw.toFixed(2)) }
      };
    }
  };
}

if (typeof window !== 'undefined') {
  window.TCM_V22_VLAB3D = { mount: mountVlab3D };
}
