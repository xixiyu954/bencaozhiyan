/**
 * 本草智研 1.3 · 第一人称 3D 虚拟实验室（深度细节版）
 * 对齐本草智研工作台全套溶剂/药材/耗材/装置：
 * - 试剂架：开放式三层不锈钢货架，配齐工作台常用提取溶剂、核心药材标本罐、检识滴瓶与防暴沸/避光耗材（绝无遮挡）
 * - 精密天平区：防震大理石台、三面防风罩分析天平、动态液晶屏、称量纸盒、不锈钢药匙
 * - 中心实验台：圆底烧瓶、锥形瓶、带刻度量筒、布氏漏斗抽滤瓶、滴管架、实验记录本与 MSDS 夹
 * - 通风橱：排风/照明控制面板、鹅颈冷水龙头、有机废液桶、铁架台双夹、数显电热套、5 球球形冷凝管（下进上出标注）
 * 工艺依据：仓库 lab-data-extra.js 丹参（脂水双提）标准工艺（50.00 g 20目丹参粗粉 + 400 mL 95% 乙醇 + 沸石 + 锡箔避光 + 70℃ 回流 60 min）
 */
import * as THREE from 'three';

const STATIONS = {
  reagent: {
    id: 'reagent',
    name: '试剂架',
    pos: new THREE.Vector3(-3.8, 0, -1.0),
    standPos: new THREE.Vector3(-2.15, 1.55, -1.0),
    lookAt: new THREE.Vector3(-4.05, 1.32, -1.0),
    tip: '配齐工作台常用溶剂（95%/70%乙醇、乙酸乙酯、石油醚、甲醇、纯化水）、五大核心药材与沸石/锡箔耗材。'
  },
  balance: {
    id: 'balance',
    name: '精密天平区',
    pos: new THREE.Vector3(3.8, 0, -1.0),
    standPos: new THREE.Vector3(2.15, 1.55, -1.0),
    lookAt: new THREE.Vector3(4.0, 1.18, -1.0),
    tip: '防震台分析天平：核对水平泡、关闭防风罩去皮归零，准确称取 50.00 g 丹参粗粉。'
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
    pos: new THREE.Vector3(0, 0, 2.05),
    standPos: new THREE.Vector3(0, 1.55, 0.55),
    lookAt: new THREE.Vector3(0, 1.12, 2.05),
    tip: '配齐圆底烧瓶、锥形瓶、量筒、布氏漏斗、滴管架、实验记录本与 MSDS 安全手册。'
  }
};

const REFLUX_STEPS = [
  {
    id: 'take_reagents',
    num: 1,
    zone: 'reagent',
    title: '试剂架领取药品与耗材',
    actionLabel: '🧪 领取丹参粗粉、95%乙醇、沸石与锡箔',
    detail: '从试剂架领取发光标注的 4 项本实验物资：20 目丹参粗粉、95% 乙醇 (400 mL)、素瓷沸石及锡箔避光纸。'
  },
  {
    id: 'weigh_herb',
    num: 2,
    zone: 'balance',
    title: '精密天平称量 50.00 g',
    actionLabel: '⚖️ 天平归零并称取 50.00 g 丹参粗粉',
    detail: '铺好称量纸并去皮归零，用药匙准确称取 50.00 g 丹参粗粉（20 目）。'
  },
  {
    id: 'load_flask',
    num: 3,
    zone: 'hood',
    title: '装瓶、加沸石与 95% 乙醇',
    actionLabel: '⚗️ 装入丹参粉、沸石与 400 mL 95%乙醇',
    detail: '铁架台固定 1000 mL 圆底烧瓶，加入 50 g 丹参粗粉、2~3 粒沸石（防暴沸）与 400 mL 95% 乙醇。'
  },
  {
    id: 'assemble_rig',
    num: 4,
    zone: 'hood',
    title: '自下而上搭球形冷凝管与避光',
    actionLabel: '🔧 装配数显电热套、球形冷凝管并开排风',
    detail: '自下而上就位调温电热套、5 球球形冷凝管、锡箔避光层（防丹参酮 IIA 光氧化），并开启通风橱排风。'
  },
  {
    id: 'start_water',
    num: 5,
    zone: 'hood',
    title: '接通冷凝水（下进上出）',
    actionLabel: '💧 接通冷凝水（下口进 / 上口出）',
    detail: '连接进出橡胶管并开阀，确认冷却水自下口进、上口出充满冷凝夹套。'
  },
  {
    id: 'run_reflux',
    num: 6,
    zone: 'hood',
    title: '70℃ 恒温避光回流 60 min',
    actionLabel: '🔥 设定 70℃ 开启恒温避光回流',
    detail: '数显电热套控温至 70℃，观察烧瓶微沸气泡、浸出液由浅琥珀转为深丹红及冷凝回流液滴。'
  },
  {
    id: 'safe_shutdown',
    num: 7,
    zone: 'hood',
    title: '先断热冷却，后停冷凝水取液',
    actionLabel: '✅ 断电冷却 → 关冷凝水 → 收集醇提液',
    detail: '先关闭电热套冷却至 40℃ 以下再关闭冷凝水，防止乙醇蒸气外逸，收集深红色丹参酮 IIA 醇提液。'
  }
];

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
    ctx.font = 'bold 30px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, w / 2, 52);
    ctx.fillStyle = '#a7f3d0';
    ctx.font = 'bold 18px "PingFang SC", "Microsoft YaHei", sans-serif';
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
    completedSteps: new Set(),
    activeZone: 'bench',
    tempC: 24.0,
    refluxMinutes: 0,
    heatingOn: false,
    waterOn: false,
    exhaustOn: false,
    foilOn: false,
    flaskLoaded: false,
    rigAssembled: false,
    shutdownDone: false,
    fps: 60,
    notice: '欢迎进入本草智研 3D 第一人称实验室！使用 WASD 走动、拖拽环顾，先前往左侧【试剂架】领取丹参粗粉、95%乙醇、沸石与锡箔。'
  };

  function getNextStep() {
    for (const st of REFLUX_STEPS) {
      if (!state.completedSteps.has(st.id)) return st;
    }
    return null;
  }

  // ===== BUILD DOM SHELL =====
  container.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
      <div class="lg:col-span-8 flex flex-col gap-2.5">
        <div id="vlab3dStageWrap" class="relative rounded-2xl bg-[#071d1a] border border-emerald-400/30 overflow-hidden select-none" style="min-height:370px;">
          <canvas id="vlab3dCanvas" class="w-full h-[370px] sm:h-[450px] block cursor-grab active:cursor-grabbing" style="touch-action:none;"></canvas>

          <!-- Top-left HUD -->
          <div class="pointer-events-none absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 max-w-[74%]">
            <span class="px-2.5 py-1 rounded-lg bg-slate-950/75 border border-emerald-400/30 text-emerald-200 text-xs font-extrabold">📍 <span id="vlab3dZoneLabel">中心实验台</span></span>
            <span class="px-2 py-1 rounded-lg bg-slate-950/75 border border-white/15 text-amber-200 text-[11px] font-bold">🌡️ <span id="vlab3dTempHud">24.0℃</span></span>
            <span id="vlab3dWaterBadge" class="px-2 py-1 rounded-lg bg-slate-950/75 border border-white/15 text-slate-300 text-[11px] font-bold">💧 冷凝水: 关</span>
            <span id="vlab3dFpsHud" class="px-2 py-1 rounded-lg bg-slate-950/75 border border-emerald-400/20 text-emerald-300 text-[11px] font-mono font-bold">60 FPS</span>
          </div>

          <!-- Top-right Mini-map -->
          <div class="pointer-events-none absolute top-2.5 right-2.5 rounded-xl bg-slate-950/75 border border-white/15 p-1.5 backdrop-blur-xs">
            <canvas id="vlab3dMinimap" width="96" height="80" class="block rounded-lg"></canvas>
          </div>

          <!-- Crosshair -->
          <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div class="w-2.5 h-2.5 rounded-full border-2 border-emerald-300/70 bg-emerald-400/20"></div>
          </div>

          <!-- Bottom Stacked Inventory + Context Action Bar (zero overlap) -->
          <div class="absolute bottom-2.5 left-2.5 right-2.5 flex flex-col gap-1.5">
            <div id="vlab3dInventoryBar" class="pointer-events-none flex flex-wrap items-center gap-1"></div>
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div id="vlab3dNotice" class="flex-1 min-w-[200px] px-3 py-2 rounded-xl bg-slate-950/85 backdrop-blur-sm border border-emerald-400/30 text-[11.5px] text-emerald-50 font-semibold leading-snug shadow-lg">
                ${state.notice}
              </div>
              <button type="button" id="vlab3dActionBtn" class="shrink-0 px-3.5 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-extrabold shadow-lg border border-emerald-300/40 transition">
                走近【试剂架】执行第 1 步 [E]
              </button>
            </div>
          </div>
        </div>

        <!-- Controls + Quick Walk Bar -->
        <div class="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-[#f6f8f7] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="text-slate-600 dark:text-slate-300 font-bold mr-1">走近工位：</span>
            <button type="button" data-vlab-goto="reagent" class="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-500">🧪 试剂架</button>
            <button type="button" data-vlab-goto="balance" class="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-500">⚖️ 天平区</button>
            <button type="button" data-vlab-goto="hood" class="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-500">🔥 通风橱</button>
            <button type="button" data-vlab-goto="bench" class="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-500">📋 实验台</button>
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

      <!-- Right SOP & Live Telemetry Panel -->
      <div class="lg:col-span-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-3.5 flex flex-col justify-between gap-3 text-xs">
        <div class="space-y-2.5">
          <div class="flex items-center justify-between gap-2">
            <div>
              <span class="inline-block px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-[#059669] dark:text-emerald-300 text-[10.5px] font-extrabold">旗舰装置 1/1 · 深度实景版</span>
              <h4 class="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">丹参 95% 乙醇回流提取</h4>
            </div>
            <button type="button" id="vlab3dResetBtn" class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-[11px] font-bold">↺ 重置</button>
          </div>

          <div class="space-y-1">
            <div class="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
              <span>SOP 完成进度</span>
              <span id="vlab3dProgressTxt">0 / 7 步</span>
            </div>
            <div class="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div id="vlab3dProgressBar" class="h-full bg-[#059669] transition-all duration-300" style="width:0%"></div>
            </div>
          </div>

          <div id="vlab3dStepList" class="space-y-1.5 max-h-[265px] overflow-y-auto pr-0.5"></div>
        </div>

        <div class="p-2.5 rounded-xl bg-[#f6f8f7] dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-700 space-y-1.5">
          <div class="flex items-center justify-between font-extrabold text-slate-800 dark:text-slate-200 text-[11px]">
            <span>实时回流工艺遥测</span>
            <span id="vlab3dTimeTxt" class="text-[#059669]">0 / 60 min</span>
          </div>
          <div class="grid grid-cols-3 gap-1.5 text-center text-[11px]">
            <div class="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
              <div class="text-[10px] text-slate-500">料液比</div>
              <div class="font-extrabold text-slate-800 dark:text-slate-100">1 : 8</div>
            </div>
            <div class="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
              <div class="text-[10px] text-slate-500">控温目标</div>
              <div class="font-extrabold text-slate-800 dark:text-slate-100">70℃</div>
            </div>
            <div class="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
              <div class="text-[10px] text-slate-500">安全互锁</div>
              <div id="vlab3dSafetyTxt" class="font-extrabold text-emerald-600">正常</div>
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

  // ===== THREE.JS SCENE SETUP (Fast Lambert/Phong for >=30 FPS everywhere) =====
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
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 8),
    new THREE.MeshLambertMaterial({ map: floorTex })
  );
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

  // Ceiling LED panels
  const ledMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  [[-2.2, -1.0], [2.2, -1.0], [0, 1.8]].forEach(([lx, lz]) => {
    const p = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.04, 0.45), ledMat);
    p.position.set(lx, 3.37, lz);
    scene.add(p);
  });

  // Safety Slogan Banner on North Wall
  const bannerTex = makeCanvasTexture(768, 92, (ctx, w, h) => {
    ctx.fillStyle = '#06322b';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, w - 8, h - 8);
    ctx.fillStyle = '#ecfdf5';
    ctx.font = 'bold 26px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('本草智研 · 中药化学实验室  |  加沸石防暴沸 · 冷凝水下进上出 · 避光控温', w / 2, 56);
  });
  const banner = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 0.52), new THREE.MeshBasicMaterial({ map: bannerTex }));
  banner.position.set(0, 3.06, -3.96);
  scene.add(banner);

  // Shared materials
  const cabinetMat = new THREE.MeshLambertMaterial({ color: 0xd9e3e1 });
  const benchTopMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
  const steelMat = new THREE.MeshPhongMaterial({ color: 0x94a3b8, shininess: 70 });
  const darkMetalMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
  const glassMat = new THREE.MeshPhongMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.36, shininess: 95 });
  const amberGlassMat = new THREE.MeshPhongMaterial({ color: 0x92400e, shininess: 85 });
  const clearGlassMat = new THREE.MeshPhongMaterial({ color: 0xcbe9f6, transparent: true, opacity: 0.65, shininess: 90 });

  // Helper: build a realistic labeled reagent bottle (with neck, cap, front label & optional target glow ring)
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

    // Front label curved patch facing +X (East, toward player standing in front of West rack!)
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

  // ===== STATION 1: OPEN-FRAME 3-TIER REAGENT RACK (West Wall, x = -4.25, fully visible!) =====
  const reagentGroup = new THREE.Group();
  reagentGroup.position.set(-4.35, 0, -1.0);
  scene.add(reagentGroup);

  // Backboard ONLY at the back (x = -0.32), NOT a solid blocking cube!
  const rackBack = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.25, 2.48), new THREE.MeshLambertMaterial({ color: 0xcbd5e1 }));
  rackBack.position.set(-0.32, 1.125, 0);
  reagentGroup.add(rackBack);

  // 4 stainless corner posts
  [[-0.30, -1.20], [-0.30, 1.20], [0.28, -1.20], [0.28, 1.20]].forEach(([px, pz]) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.045, 2.25, 0.045), steelMat);
    post.position.set(px, 1.125, pz);
    reagentGroup.add(post);
  });

  // Lower reagent cabinet base (0 ~ 0.66m) + 3 open shelves (0.68m, 1.20m, 1.72m) + top cap (2.22m)
  const rackBaseCab = new THREE.Mesh(new THREE.BoxGeometry(0.60, 0.66, 2.42), cabinetMat);
  rackBaseCab.position.set(-0.01, 0.33, 0);
  reagentGroup.add(rackBaseCab);

  [0.68, 1.20, 1.72, 2.22].forEach((sy) => {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.04, 2.44), benchTopMat);
    shelf.position.set(0, sy, 0);
    reagentGroup.add(shelf);
    // Stainless safety rail along front edge of shelf
    if (sy < 2.2) {
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 2.40, 8), steelMat);
      rail.rotation.x = Math.PI / 2;
      rail.position.set(0.28, sy + 0.055, 0);
      reagentGroup.add(rail);
    }
  });

  // Tier labels on the side
  const t3Badge = createSmallBadgeSprite('常用提取溶剂', 'rgba(6,41,34,0.9)', '#38bdf8', '#e0f2fe');
  t3Badge.position.set(0.32, 2.09, -0.95);
  reagentGroup.add(t3Badge);
  const t2Badge = createSmallBadgeSprite('核心药材标本', 'rgba(6,41,34,0.9)', '#f97316', '#ffedd5');
  t2Badge.position.set(0.32, 1.58, -0.95);
  reagentGroup.add(t2Badge);
  const t1Badge = createSmallBadgeSprite('检识试液与耗材', 'rgba(6,41,34,0.9)', '#34d399', '#ecfdf5');
  t1Badge.position.set(0.32, 1.06, -0.95);
  reagentGroup.add(t1Badge);

  // Target items picked in Step 1 (we hide ONLY these 4 when picked; all other 13 workbench items stay stocked!)
  const targetPickupGroup = new THREE.Group();
  reagentGroup.add(targetPickupGroup);

  // --- TOP SHELF (y = 1.74): 6 Workbench Extraction Solvents ---
  const solvents = [
    { z: -0.96, label: '95% 乙醇', sub: '400 mL 回流', mat: amberGlassMat, cap: 0xdc2626, accent: '#dc2626', target: true },
    { z: -0.58, label: '70% 乙醇', sub: '500 mL AR', mat: clearGlassMat, cap: 0x0284c7, accent: '#0284c7', target: false },
    { z: -0.20, label: '乙酸乙酯', sub: '500 mL 萃取', mat: amberGlassMat, cap: 0x2563eb, accent: '#2563eb', target: false },
    { z: 0.18,  label: '石油醚',   sub: '60-90℃ 脱脂', mat: amberGlassMat, cap: 0xd97706, accent: '#d97706', target: false },
    { z: 0.56,  label: '甲醇',     sub: 'HPLC 色谱纯', mat: amberGlassMat, cap: 0x7c3aed, accent: '#7c3aed', target: false },
    { z: 0.94,  label: '纯化水',   sub: '1000 mL', mat: clearGlassMat, cap: 0x059669, accent: '#059669', target: false }
  ];
  solvents.forEach((sv) => {
    const b = buildReagentBottle({
      r: 0.074, h: 0.24, bodyMat: sv.mat, capColor: sv.cap,
      labelText: sv.label, labelSub: sv.sub, labelAccent: sv.accent, isTarget: sv.target
    });
    b.position.set(0.06, 1.74, sv.z);
    (sv.target ? targetPickupGroup : reagentGroup).add(b);
  });

  // --- MIDDLE SHELF (y = 1.22): 5 Workbench Flagship Herb Jars ---
  const herbs = [
    { z: -0.92, label: '丹参粗粉', sub: '20目 · 50g', color: 0x991b1b, accent: '#dc2626', target: true },
    { z: -0.46, label: '黄芩饮片', sub: '含黄芩苷', color: 0xca8a04, accent: '#ca8a04', target: false },
    { z: 0.00,  label: '黄连饮片', sub: '含小檗碱', color: 0xeab308, accent: '#a16207', target: false },
    { z: 0.46,  label: '薄荷全草', sub: '含薄荷脑', color: 0x15803d, accent: '#15803d', target: false },
    { z: 0.92,  label: '金银花',   sub: '含绿原酸', color: 0x65a30d, accent: '#4d7c0f', target: false }
  ];
  herbs.forEach((hb) => {
    const jar = buildReagentBottle({
      r: 0.092, h: 0.21,
      bodyMat: new THREE.MeshLambertMaterial({ color: hb.color }),
      capColor: 0x1e293b,
      labelText: hb.label, labelSub: hb.sub, labelAccent: hb.accent, isTarget: hb.target
    });
    jar.position.set(0.05, 1.22, hb.z);
    (hb.target ? targetPickupGroup : reagentGroup).add(jar);
  });

  // --- BOTTOM SHELF (y = 0.70): Identification Reagents + Boiling Chips + Foil Roll + pH Paper ---
  const drops = [
    { z: -0.96, label: 'FeCl₃', sub: '酚羟基显色', color: 0xb45309 },
    { z: -0.64, label: 'AlCl₃', sub: '黄酮荧光', color: 0x0284c7 },
    { z: -0.32, label: '稀盐酸', sub: 'HCl-Mg', color: 0x475569 },
    { z: 0.00,  label: '碘化铋钾', sub: '生物碱', color: 0xc2410c }
  ];
  drops.forEach((dr) => {
    const b = buildReagentBottle({
      r: 0.055, h: 0.16,
      bodyMat: new THREE.MeshPhongMaterial({ color: dr.color, shininess: 80 }),
      capColor: 0x0f172a,
      labelText: dr.label, labelSub: dr.sub, labelAccent: '#0f766e', isTarget: false
    });
    b.position.set(0.08, 0.70, dr.z);
    reagentGroup.add(b);
  });

  // Boiling Chips Vial (Target!)
  const chipsJar = buildReagentBottle({
    r: 0.064, h: 0.16,
    bodyMat: new THREE.MeshLambertMaterial({ color: 0xe2e8f0 }),
    capColor: 0x059669,
    labelText: '素瓷沸石', labelSub: '防暴沸 2-3粒', labelAccent: '#059669', isTarget: true
  });
  chipsJar.position.set(0.08, 0.70, 0.42);
  targetPickupGroup.add(chipsJar);

  // Aluminum Foil Roll (Target!)
  const foilGroup = new THREE.Group();
  const foilCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.34, 14), steelMat);
  foilCyl.rotation.x = Math.PI / 2;
  foilCyl.position.set(0.08, 0.75, 0.86);
  foilGroup.add(foilCyl);
  const foilRing = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.09, 16), new THREE.MeshBasicMaterial({ color: 0x34d399, side: THREE.DoubleSide }));
  foilRing.rotation.x = -Math.PI / 2;
  foilRing.position.set(0.08, 0.706, 0.86);
  foilGroup.add(foilRing);
  const foilLbl = createSmallBadgeSprite('锡箔避光纸', 'rgba(6,41,34,0.9)', '#34d399', '#ecfdf5');
  foilLbl.position.set(0.16, 0.89, 0.86);
  foilGroup.add(foilLbl);
  targetPickupGroup.add(foilGroup);

  const reagentSign = createSignSprite('🧪 工作台试剂架', '6 种溶剂 · 5 味药材 · 检识试液与耗材', '#34d399', 1.65, 0.44);
  reagentSign.position.set(-4.0, 2.58, -1.0);
  scene.add(reagentSign);

  // ===== STATION 2: ANALYTICAL BALANCE (East Wall, x = +4.1) =====
  const balGroup = new THREE.Group();
  balGroup.position.set(4.1, 0, -1.0);
  scene.add(balGroup);

  const balBench = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.88, 2.1), cabinetMat);
  balBench.position.set(0, 0.44, 0);
  balGroup.add(balBench);
  const balTop = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.06, 2.18), benchTopMat);
  balTop.position.set(0, 0.91, 0);
  balGroup.add(balTop);

  // Anti-vibration marble slab
  const marble = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.05, 0.72), new THREE.MeshLambertMaterial({ color: 0xe2e8f0 }));
  marble.position.set(-0.08, 0.965, 0);
  balGroup.add(marble);

  // Analytical balance body + 3-sided draft shield + pan
  const balBase = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.12, 0.50), new THREE.MeshLambertMaterial({ color: 0xf8fafc }));
  balBase.position.set(-0.08, 1.05, 0);
  balGroup.add(balBase);
  const balShield = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.32, 0.38), glassMat);
  balShield.position.set(-0.04, 1.27, 0);
  balGroup.add(balShield);
  const balPan = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.016, 16), steelMat);
  balPan.position.set(-0.04, 1.135, 0);
  balGroup.add(balPan);

  // Weighing paper box & stainless medicine spoon (药匙) next to balance
  const paperBox = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.18), new THREE.MeshLambertMaterial({ color: 0xfef3c7 }));
  paperBox.position.set(-0.12, 0.96, 0.62);
  balGroup.add(paperBox);
  const spoon = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.01, 0.24), steelMat);
  spoon.position.set(-0.18, 0.95, -0.58);
  spoon.rotation.y = 0.25;
  balGroup.add(spoon);

  // Danshen powder mound on pan (visible after Step 2)
  const powderMound = new THREE.Mesh(
    new THREE.ConeGeometry(0.078, 0.058, 14),
    new THREE.MeshLambertMaterial({ color: 0x991b1b })
  );
  powderMound.position.set(-0.04, 1.175, 0);
  powderMound.visible = false;
  balGroup.add(powderMound);

  // Balance LCD screen
  const lcdCanvas = document.createElement('canvas');
  lcdCanvas.width = 256;
  lcdCanvas.height = 96;
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

  const balSign = createSignSprite('⚖️ 精密分析天平区', '去皮归零 · 称取 50.00 g 丹参粗粉', '#38bdf8');
  balSign.position.set(3.9, 2.08, -1.0);
  scene.add(balSign);

  // ===== STATION 3: FUME HOOD + 3D REFLUX EXTRACTION APPARATUS (North Wall) =====
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

  // Exhaust indicator LED + Control Panel on right pillar
  const exhaustLedMat = new THREE.MeshBasicMaterial({ color: 0x64748b });
  const exhaustLed = new THREE.Mesh(new THREE.SphereGeometry(0.036, 10, 10), exhaustLedMat);
  exhaustLed.position.set(1.05, 2.52, 0.62);
  hoodGroup.add(exhaustLed);

  const sash = new THREE.Mesh(new THREE.BoxGeometry(2.48, 0.50, 0.025), glassMat);
  sash.position.set(0, 2.12, 0.56);
  hoodGroup.add(sash);

  // Organic Waste Solvent Carboy (有机废液桶) on left side of fume hood
  const wasteDrum = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.32, 14), new THREE.MeshLambertMaterial({ color: 0xfacc15 }));
  wasteDrum.position.set(-0.98, 1.12, -0.15);
  hoodGroup.add(wasteDrum);
  const wasteLbl = createSmallBadgeSprite('含醇有机废液桶', 'rgba(113,63,18,0.92)', '#fde047', '#fef9c3');
  wasteLbl.position.set(-0.98, 1.38, -0.15);
  hoodGroup.add(wasteLbl);

  // Cold water faucet on right side of hood
  const faucetPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.24, 10), steelMat);
  faucetPipe.position.set(0.92, 1.08, -0.2);
  hoodGroup.add(faucetPipe);
  const faucetKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.03, 10), new THREE.MeshLambertMaterial({ color: 0x0284c7 }));
  faucetKnob.position.set(0.92, 1.21, -0.2);
  hoodGroup.add(faucetKnob);

  // Iron Retort Stand (铁架台)
  const standBase = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.03, 0.24), darkMetalMat);
  standBase.position.set(-0.24, 0.975, -0.05);
  hoodGroup.add(standBase);
  const standRod = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.28, 10), steelMat);
  standRod.position.set(-0.34, 1.61, -0.05);
  hoodGroup.add(standRod);

  // --- REFLUX EXTRACTION 3D RIG PARTS ---
  const rigGroup = new THREE.Group();
  rigGroup.position.set(0, 0.96, -0.05);
  hoodGroup.add(rigGroup);

  // 1) Digital Heating Mantle (数显调温电热套)
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

  // 2) 1000 mL Round-Bottom Flask + Liquid + Boiling Chips + Foil Shield
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

  const herbSediment = new THREE.Mesh(
    new THREE.SphereGeometry(0.125, 14, 10, 0, Math.PI * 2, Math.PI * 0.72, Math.PI * 0.28),
    new THREE.MeshLambertMaterial({ color: 0x7f1d1d })
  );
  herbSediment.position.y = 0.27;
  flaskGroup.add(herbSediment);

  // Visible white porcelain boiling chips at bottom
  const chipMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
  [[-0.03, 0.15, 0.02], [0.025, 0.148, -0.02], [0.0, 0.145, 0.03]].forEach(([cx, cy, cz]) => {
    const ch = new THREE.Mesh(new THREE.DodecahedronGeometry(0.011, 0), chipMat);
    ch.position.set(cx, cy, cz);
    flaskGroup.add(ch);
  });

  const clampArm = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.022, 0.025), darkMetalMat);
  clampArm.position.set(-0.17, 0.44, 0);
  flaskGroup.add(clampArm);

  const foilShield = new THREE.Mesh(
    new THREE.CylinderGeometry(0.158, 0.158, 0.16, 16, 1, true),
    new THREE.MeshPhongMaterial({ color: 0xcbd5e1, shininess: 90, transparent: true, opacity: 0.42, side: THREE.DoubleSide })
  );
  foilShield.position.y = 0.27;
  foilShield.visible = false;
  flaskGroup.add(foilShield);

  flaskGroup.visible = false;
  rigGroup.add(flaskGroup);

  // 3) 5-Bulb Allihn Spherical Condenser + Lower-Inlet / Upper-Outlet Hoses + Badges
  const condGroup = new THREE.Group();
  const condJacket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.056, 0.056, 0.58, 16),
    new THREE.MeshPhongMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.30, shininess: 90 })
  );
  condJacket.position.y = 0.80;
  condGroup.add(condJacket);

  const condWaterFill = new THREE.Mesh(
    new THREE.CylinderGeometry(0.050, 0.050, 0.54, 14),
    new THREE.MeshLambertMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.48 })
  );
  condWaterFill.position.y = 0.80;
  condWaterFill.visible = false;
  condGroup.add(condWaterFill);

  for (let bi = 0; bi < 5; bi++) {
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 10), glassMat);
    bulb.position.y = 0.60 + bi * 0.10;
    condGroup.add(bulb);
  }
  const clampArm2 = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.022, 0.025), darkMetalMat);
  clampArm2.position.set(-0.17, 0.85, 0);
  condGroup.add(clampArm2);

  const hoseMatOff = new THREE.MeshLambertMaterial({ color: 0x64748b });
  const hoseMatOn = new THREE.MeshLambertMaterial({ color: 0x0ea5e9 });
  const inletCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.055, 0.58, 0),
    new THREE.Vector3(0.46, 0.42, -0.05),
    new THREE.Vector3(0.92, 0.24, -0.15)
  ]);
  const outletCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.055, 1.02, 0),
    new THREE.Vector3(0.50, 0.92, -0.08),
    new THREE.Vector3(0.86, 0.12, -0.18)
  ]);
  const inletHose = new THREE.Mesh(new THREE.TubeGeometry(inletCurve, 14, 0.012, 6, false), hoseMatOff);
  const outletHose = new THREE.Mesh(new THREE.TubeGeometry(outletCurve, 14, 0.012, 6, false), hoseMatOff);
  condGroup.add(inletHose);
  condGroup.add(outletHose);

  const inBadge = createSmallBadgeSprite('下口进水 IN', 'rgba(2,132,199,0.9)', '#7dd3fc', '#f0f9ff');
  inBadge.position.set(0.34, 0.52, 0.04);
  inBadge.scale.set(0.36, 0.095, 1);
  condGroup.add(inBadge);
  const outBadge = createSmallBadgeSprite('上口出水 OUT', 'rgba(15,118,110,0.9)', '#5eead4', '#f0fdfa');
  outBadge.position.set(0.36, 1.03, 0.04);
  outBadge.scale.set(0.38, 0.095, 1);
  condGroup.add(outBadge);

  condGroup.visible = false;
  rigGroup.add(condGroup);

  // 4) Boiling bubbles & Reflux droplets
  const bubbles = [];
  const bubbleGeo = new THREE.SphereGeometry(0.010, 6, 6);
  const bubbleMat = new THREE.MeshBasicMaterial({ color: 0xfef3c7, transparent: true, opacity: 0.85 });
  for (let i = 0; i < 12; i++) {
    const b = new THREE.Mesh(bubbleGeo, bubbleMat);
    b.visible = false;
    b.userData = { ang: Math.random() * Math.PI * 2, rad: Math.random() * 0.08, y: 0.18 + Math.random() * 0.11, spd: 0.14 + Math.random() * 0.12 };
    rigGroup.add(b);
    bubbles.push(b);
  }
  const droplets = [];
  const dropGeo = new THREE.SphereGeometry(0.012, 6, 6);
  const dropMat = new THREE.MeshBasicMaterial({ color: 0xfde68a });
  for (let i = 0; i < 6; i++) {
    const d = new THREE.Mesh(dropGeo, dropMat);
    d.visible = false;
    d.userData = { y: 0.52 + (i / 6) * 0.52 };
    rigGroup.add(d);
    droplets.push(d);
  }

  const hoodSign = createSignSprite('🔥 通风橱 · 回流提取', '丹参 95% 乙醇 70℃ 避光回流', '#f97316', 1.30, 0.36);
  hoodSign.position.set(0, 2.58, -2.68);
  scene.add(hoodSign);

  // ===== STATION 4: RICHLY EQUIPPED CENTRAL PREP BENCH (South Center) =====
  const benchGroup = new THREE.Group();
  benchGroup.position.set(0, 0, 2.05);
  scene.add(benchGroup);
  const benchBase = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.86, 1.15), cabinetMat);
  benchBase.position.y = 0.43;
  benchGroup.add(benchBase);
  const benchTop = new THREE.Mesh(new THREE.BoxGeometry(2.88, 0.06, 1.24), benchTopMat);
  benchTop.position.y = 0.89;
  benchGroup.add(benchTop);

  // Workbench glassware & docs: graduated cylinder, conical flask, beaker w/ amber extract, Buchner funnel, lab notebook, MSDS binder
  const gradCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.34, 12), clearGlassMat);
  gradCyl.position.set(-0.95, 1.09, 0.05);
  benchGroup.add(gradCyl);
  const conFlask = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.25, 14), clearGlassMat);
  conFlask.position.set(-0.55, 1.045, -0.08);
  benchGroup.add(conFlask);
  const beaker = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.072, 0.16, 14), clearGlassMat);
  beaker.position.set(-0.15, 1.00, 0.12);
  benchGroup.add(beaker);
  const beakerLiq = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.066, 0.09, 12), new THREE.MeshLambertMaterial({ color: 0x059669, transparent: true, opacity: 0.7 }));
  beakerLiq.position.set(-0.15, 0.97, 0.12);
  benchGroup.add(beakerLiq);
  // Buchner funnel + suction flask
  const sucFlask = new THREE.Mesh(new THREE.ConeGeometry(0.095, 0.20, 14), clearGlassMat);
  sucFlask.position.set(0.35, 1.02, -0.10);
  benchGroup.add(sucFlask);
  const buchner = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.05, 0.08, 14), new THREE.MeshLambertMaterial({ color: 0xf8fafc }));
  buchner.position.set(0.35, 1.15, -0.10);
  benchGroup.add(buchner);
  // Lab Notebook & MSDS Safety Binder
  const notebook = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.022, 0.36), new THREE.MeshLambertMaterial({ color: 0x064e3b }));
  notebook.position.set(0.88, 0.935, 0.12);
  notebook.rotation.y = -0.12;
  benchGroup.add(notebook);
  const msdsBinder = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.035, 0.32), new THREE.MeshLambertMaterial({ color: 0xb91c1c }));
  msdsBinder.position.set(1.12, 0.94, -0.22);
  msdsBinder.rotation.y = 0.18;
  benchGroup.add(msdsBinder);

  const benchSign = createSignSprite('📋 中心实验台', '量筒 · 抽滤瓶 · 实验记录本 · MSDS', '#a78bfa');
  benchSign.position.set(0, 1.88, 2.05);
  scene.add(benchSign);

  // Glowing Floor Target Beacon
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.65, side: THREE.DoubleSide });
  const beaconRing = new THREE.Mesh(new THREE.RingGeometry(0.32, 0.46, 24), beaconMat);
  beaconRing.rotation.x = -Math.PI / 2;
  beaconRing.position.set(-2.15, 0.02, -1.0);
  scene.add(beaconRing);

  // ===== FIRST-PERSON PLAYER STATE =====
  const player = { x: 0, y: 1.55, z: 0.7, yaw: 0, pitch: -0.04 };
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
    const hasReagents = state.completedSteps.has('take_reagents');
    const weighed = state.completedSteps.has('weigh_herb');
    const loaded = state.completedSteps.has('load_flask');
    if (!hasReagents || loaded) {
      inventoryBarEl.innerHTML = loaded
        ? '<span class="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-400/40 text-emerald-200 text-[10.5px] font-bold">⚗️ 物料已全部装入通风橱圆底烧瓶</span>'
        : '';
      return;
    }
    const items = [
      weighed ? '⚖️ 丹参粗粉 50.00g (已称量)' : '🌿 丹参粗粉 (待称量)',
      '🧴 95% 乙醇 400mL',
      '⚪ 素瓷沸石',
      '🎞️ 锡箔避光纸'
    ];
    inventoryBarEl.innerHTML =
      '<span class="px-1.5 py-0.5 rounded-md bg-slate-950/80 text-amber-300 text-[10.5px] font-extrabold">🎒 随身物品：</span>' +
      items.map((it) => `<span class="px-2 py-0.5 rounded-md bg-slate-950/80 border border-emerald-400/35 text-emerald-100 text-[10.5px] font-bold">${it}</span>`).join('');
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

  function update3DVisualsFromState() {
    // Only the 4 picked items leave the shelf; all 13 other workbench solvents/herbs/reagents stay visible!
    targetPickupGroup.visible = !state.completedSteps.has('take_reagents');
    powderMound.visible = state.completedSteps.has('weigh_herb');
    updateBalanceLcd(state.completedSteps.has('weigh_herb') ? '50.00 g' : '0.00 g', state.completedSteps.has('weigh_herb') ? 'DANSHEN 20M' : 'TARE READY');

    flaskGroup.visible = state.flaskLoaded;
    mantleGroup.visible = state.rigAssembled;
    condGroup.visible = state.rigAssembled;
    foilShield.visible = state.foilOn;
    exhaustLedMat.color.setHex(state.exhaustOn ? 0x22c55e : 0x64748b);
    condWaterFill.visible = state.waterOn && state.rigAssembled;
    inletHose.material = state.waterOn ? hoseMatOn : hoseMatOff;
    outletHose.material = state.waterOn ? hoseMatOn : hoseMatOff;
    heaterGlowMat.color.setHex(state.heatingOn ? 0xf97316 : 0x334155);

    if (waterBadgeEl) {
      waterBadgeEl.textContent = state.waterOn ? '💧 冷凝水: 下进上出已通' : '💧 冷凝水: 关';
      waterBadgeEl.className = 'px-2 py-1 rounded-lg text-[11px] font-bold border ' + (
        state.waterOn ? 'bg-sky-950/85 border-sky-400/50 text-sky-200' : 'bg-slate-950/75 border-white/15 text-slate-300'
      );
    }

    const next = getNextStep();
    if (next && STATIONS[next.zone]) {
      const sp = STATIONS[next.zone].standPos;
      beaconRing.position.set(sp.x, 0.02, sp.z);
      beaconRing.visible = true;
    } else {
      beaconRing.visible = false;
    }
    updateInventoryHud();
  }

  function renderStepList() {
    const next = getNextStep();
    const doneCount = state.completedSteps.size;
    if (progressTxtEl) progressTxtEl.textContent = `${doneCount} / ${REFLUX_STEPS.length} 步`;
    if (progressBarEl) progressBarEl.style.width = `${Math.round((doneCount / REFLUX_STEPS.length) * 100)}%`;

    stepListEl.innerHTML = REFLUX_STEPS.map((st) => {
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
            done ? 'bg-emerald-600 text-white' : (isCur ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300')
          }">${done ? '✓' : (isCur ? '当前' : '待做')}</span>
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
      actionBtn.textContent = '🎉 回流提取全流程已完成';
      actionBtn.className = 'shrink-0 px-3.5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-extrabold border border-emerald-300/40';
      return;
    }
    if (state.activeZone === next.zone) {
      actionBtn.textContent = `${next.actionLabel} [E]`;
      actionBtn.className = 'shrink-0 px-3.5 py-2 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-extrabold shadow-lg border border-orange-300/50 transition';
    } else {
      const targetName = STATIONS[next.zone].name.split('（')[0];
      actionBtn.textContent = `走近【${targetName}】执行第 ${next.num} 步 [E]`;
      actionBtn.className = 'shrink-0 px-3.5 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-extrabold shadow-lg border border-emerald-300/40 transition';
    }
  }

  function triggerStep(stepId, skipWalkCheck = false) {
    const st = REFLUX_STEPS.find((x) => x.id === stepId);
    if (!st) return { ok: false, reason: 'unknown_step' };
    if (state.completedSteps.has(stepId)) {
      setNotice(`第 ${st.num} 步「${st.title}」已完成，可继续下一步。`, 'info');
      return { ok: true, alreadyDone: true };
    }
    if (stepId === 'run_reflux' && !state.waterOn) {
      if (safetyTxtEl) { safetyTxtEl.textContent = '已拦截'; safetyTxtEl.className = 'font-extrabold text-rose-600'; }
      setNotice('⚠️ 安全拦截：严禁未通冷凝水直接加热回流！95% 乙醇沸点 78.4℃，请先完成第 5 步接通冷凝水（下进上出）。', 'error');
      return { ok: false, reason: 'safety_no_water' };
    }
    const next = getNextStep();
    if (next && next.id !== stepId) {
      setNotice(`⚠️ 实验顺序提示：请先完成第 ${next.num} 步「${next.title}」（工位：${STATIONS[next.zone].name}）。`, 'error');
      return { ok: false, reason: 'out_of_order' };
    }
    if (!skipWalkCheck && state.activeZone !== st.zone) {
      walkToZone(st.zone);
      setNotice(`正在走向【${STATIONS[st.zone].name}】，到达后再次点击按钮或按 [E] 执行：${st.title}`, 'info');
      return { ok: false, reason: 'walking_to_zone' };
    }
    if (safetyTxtEl) { safetyTxtEl.textContent = '正常'; safetyTxtEl.className = 'font-extrabold text-emerald-600'; }

    if (stepId === 'take_reagents') {
      state.completedSteps.add(stepId);
      setNotice('✅ 已从试剂架领取丹参粗粉、95% 乙醇、素瓷沸石与锡箔纸（其余工作台溶剂与药材保持在架）！请前往【精密天平区】称量 50.00 g。', 'success');
    } else if (stepId === 'weigh_herb') {
      state.completedSteps.add(stepId);
      setNotice('✅ 精密天平归零称量完成（50.00 g 丹参粗粉）！请前往前方【通风橱】装瓶搭装置。', 'success');
    } else if (stepId === 'load_flask') {
      state.flaskLoaded = true;
      state.completedSteps.add(stepId);
      setNotice('✅ 已固定 1000 mL 圆底烧瓶并加入 50 g 丹参粉、素瓷沸石与 400 mL 95% 乙醇。', 'success');
    } else if (stepId === 'assemble_rig') {
      state.rigAssembled = true;
      state.foilOn = true;
      state.exhaustOn = true;
      state.completedSteps.add(stepId);
      setNotice('✅ 已自下而上装配数显电热套、5 球球形冷凝管、避光锡箔并开启通风橱排风！请接通冷凝水。', 'success');
    } else if (stepId === 'start_water') {
      state.waterOn = true;
      state.completedSteps.add(stepId);
      setNotice('✅ 冷凝水已按「下口进、上口出」充满夹套！现在可安全设定 70℃ 开启回流。', 'success');
    } else if (stepId === 'run_reflux') {
      state.heatingOn = true;
      state.completedSteps.add(stepId);
      setNotice('🔥 已开启 70℃ 恒温避光回流！观察烧瓶内微沸气泡、液色转为丹红及冷凝管液滴回流。', 'success');
    } else if (stepId === 'safe_shutdown') {
      state.heatingOn = false;
      state.waterOn = false;
      state.shutdownDone = true;
      state.refluxMinutes = 60;
      state.tempC = 36.5;
      if (timeTxtEl) timeTxtEl.textContent = '60 / 60 min';
      state.completedSteps.add(stepId);
      setNotice('🎉 规范停机完成（先断电冷却 → 后关冷凝水）！成功收集深红色丹参酮 IIA 醇提液。', 'success');
    }

    update3DVisualsFromState();
    renderStepList();
    return { ok: true, stepId };
  }

  function resetLab() {
    state.completedSteps.clear();
    state.tempC = 24.0;
    state.refluxMinutes = 0;
    state.heatingOn = false;
    state.waterOn = false;
    state.exhaustOn = false;
    state.foilOn = false;
    state.flaskLoaded = false;
    state.rigAssembled = false;
    state.shutdownDone = false;
    liquidMat.color.setHex(0xd97706);
    if (timeTxtEl) timeTxtEl.textContent = '0 / 60 min';
    if (safetyTxtEl) { safetyTxtEl.textContent = '正常'; safetyTxtEl.className = 'font-extrabold text-emerald-600'; }
    player.x = 0; player.z = 0.7; player.yaw = 0; player.pitch = -0.04;
    autoWalkTarget = null;
    update3DVisualsFromState();
    renderStepList();
    setNotice('已重置 3D 虚拟实验室，请从第 1 步【试剂架】重新开始。', 'info');
  }

  // ===== INPUTS =====
  actionBtn.addEventListener('click', () => {
    const next = getNextStep();
    if (!next) return;
    if (state.activeZone !== next.zone) {
      walkToZone(next.zone);
      setNotice(`正在快步走向【${STATIONS[next.zone].name}】…`, 'info');
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
    const mapX = (wx) => ((wx + 5) / 10) * (w - 10) + 5;
    const mapY = (wz) => ((wz + 4) / 8) * (h - 10) + 5;
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
        const step = Math.min(dist, 5.2 * dt);
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

    player.x = Math.max(-3.1, Math.min(3.1, player.x));
    player.z = Math.max(-2.15, Math.min(3.1, player.z));
    if (Math.abs(player.x) < 1.56 && player.z > 1.22 && player.z < 2.86) {
      if (player.z < 2.0) player.z = 1.22;
      else player.z = 2.86;
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

    if (state.heatingOn) {
      state.tempC = Math.min(70.0, state.tempC + 14.0 * dt);
      if (state.tempC >= 68.5) {
        state.refluxMinutes = Math.min(60, state.refluxMinutes + 6.0 * dt);
        const prog = state.refluxMinutes / 60;
        liquidMat.color.copy(new THREE.Color(0xd97706)).lerp(new THREE.Color(0x991b1b), prog);
        if (timeTxtEl) timeTxtEl.textContent = `${Math.round(state.refluxMinutes)} / 60 min`;
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
      if (state.tempC > 24.5) state.tempC = Math.max(24.0, state.tempC - 4.0 * dt);
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
    getState() {
      return {
        activeZone: state.activeZone,
        completedCount: state.completedSteps.size,
        completedSteps: Array.from(state.completedSteps),
        tempC: Number(state.tempC.toFixed(1)),
        waterOn: state.waterOn,
        heatingOn: state.heatingOn,
        rigAssembled: state.rigAssembled,
        fps: state.fps,
        playerPos: { x: Number(player.x.toFixed(2)), z: Number(player.z.toFixed(2)), yaw: Number(player.yaw.toFixed(2)) }
      };
    }
  };
}

if (typeof window !== 'undefined') {
  window.TCM_V22_VLAB3D = { mount: mountVlab3D };
}
