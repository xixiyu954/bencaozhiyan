// =========================================================================
// 本草智研 v9.0 沉浸式动态可视化模型与高阶 DIY 积木工坊 (lab-v9-visuals.js)
// - Step 1: 活性成分「极性 × 提取路径」动态二维交互图谱
// - Step 2: 本科 4 学时甘特排程图 + 高阶 DIY 工艺积木拼装器 + 多方案本地保存槽
// - Step 3: Fick 扩散提取动力学实时 SVG 模拟曲线（响应温度/粒度/时长）
// - Step 4: 溶剂沸点安全裕度与防暴沸实时监控仪表
// - Step 5: 动态 HPLC / 柱层析高斯洗脱峰分离模拟器（实时算分离度 Rs 与塔板数 N）
// =========================================================================
(function () {
  'use strict';

  const DIY_STORAGE_KEY = 'tcm_v9_diy_recipes_v1';

  const POLAR_NODES = [
    { cat: '挥发油与萜类', x: 58, y: 42, color: '#10b981', sol: '纯化水共沸 / 石油醚', hint: '极性极低 · 具挥发性' },
    { cat: '甾体与强心苷', x: 112, y: 120, color: '#6366f1', sol: '70%~80% 乙醇', hint: '低中极性 · 需防酸水解' },
    { cat: '香豆素与木脂素', x: 146, y: 74, color: '#8b5cf6', sol: '95% 乙醇 / 乙酸乙酯', hint: '亲脂偏中 · 紫外强荧光' },
    { cat: '蒽醌与醌类', x: 192, y: 102, color: '#ef4444', sol: '70% 乙醇 / pH 梯度', hint: '游离亲脂 · 苷类亲水' },
    { cat: '生物碱', x: 242, y: 66, color: '#eab308', sol: '酸水 / 70% 乙醇', hint: '酸碱两相切换分离' },
    { cat: '黄酮', x: 294, y: 98, color: '#f59e0b', sol: '70% 乙醇 / 碱提酸沉', hint: '中等极性 · 铝盐荧光' },
    { cat: '萜类内酯与环烯醚萜', x: 344, y: 128, color: '#14b8a6', sol: '60%~70% 乙醇', hint: '热敏内酯 · 低温保护' },
    { cat: '苯丙素与有机酸', x: 394, y: 80, color: '#059669', sol: '微酸 70% 乙醇 / 超声', hint: '偏强极性 · 易氧化褐变' },
    { cat: '皂苷与三萜', x: 446, y: 112, color: '#0ea5e9', sol: '60% 乙醇 + 大孔树脂', hint: '两亲表面活性 · 防起泡' },
    { cat: '多糖类', x: 504, y: 54, color: '#06b6d4', sol: '纯化水提 + 80% 醇沉', hint: '极性强 · 不溶于高醇' }
  ];

  const SOLVENT_BP = {
    '石油醚(30-60℃)': { bp: 45, label: '石油醚 (沸程 30~60℃)', note: '极易燃低沸点！严禁明火，水浴控温 ≤ 50℃' },
    '95%乙醇': { bp: 78.3, label: '95% 乙醇 (沸点 78.3℃)', note: '经典回流温区 75~80℃，冷凝水须全程下进上出' },
    '70%乙醇': { bp: 81.0, label: '70% 乙醇 (沸点 ~81℃)', note: '黄金回流温区 75~82℃，兼顾极性与安全防暴沸' },
    '60%乙醇': { bp: 82.5, label: '60% 乙醇 (沸点 ~82.5℃)', note: '温和回流 75~82℃，皂苷类建议加沸石防暴沸起泡' },
    '0.5%酸水': { bp: 100.0, label: '0.5% 酸水 (沸点 100℃)', note: '微酸水提或渗漉，注意耐酸玻璃器皿与防腐蚀' },
    '弱碱硼砂水': { bp: 100.0, label: '弱碱硼砂水 (沸点 100℃)', note: '微沸 95~100℃ 防止苷键过度碱性水解' },
    '纯化水': { bp: 100.0, label: '纯化水 (沸点 100℃)', note: '零 VOC 绿色安全，蒸馏/煎煮维持 95~100℃ 微沸即可' }
  };

  let diyState = {
    selectedBricks: ['pre_cut', 'ext_ultra', 'sep_lle', 'qc_tlc', 'qc_uv'],
    chromPolarity: 48,
    chromFlow: 1.0,
    kineticsBoost: 'normal'
  };

  function getCfg(ws) {
    const src = (ws && ws.cfg) ? ws.cfg : (ws || {});
    return {
      mass: Number(src.mass) || 100,
      ratio: Number(src.ratio) || 10,
      temp: Number(src.temp) || 75,
      time: Number(src.time) || 60,
      cycles: Number(src.cycles) || 2,
      mesh: String(src.mesh || '粗粉(10~20目)'),
      solventType: String(src.solventType || '70%乙醇')
    };
  }

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }

  function ensureCard(panelId, cardId, insertAfterSelector) {
    const panel = document.getElementById(panelId);
    if (!panel) return null;
    let card = document.getElementById(cardId);
    if (!card) {
      card = document.createElement('section');
      card.id = cardId;
      card.className = 'lab-card v9-visual-card rounded-3xl p-4 sm:p-5 space-y-3.5';
      const anchor = insertAfterSelector ? panel.querySelector(insertAfterSelector) : null;
      if (anchor && anchor.parentNode === panel) {
        anchor.insertAdjacentElement('afterend', card);
      } else {
        panel.appendChild(card);
      }
    }
    return card;
  }

  // ==================== 1. Step 1: 成分极性 × 提取路径二维交互图谱 ====================
  function renderStep1PolarMap(topic) {
    const card = ensureCard('wpanel-1', 'v9Step1PolarMap');
    if (!card) return;
    const curCat = (topic && topic.category) || '挥发油与萜类';
    const activeNode = POLAR_NODES.find(n => curCat.includes(n.cat) || n.cat.includes(curCat)) || POLAR_NODES[0];

    card.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2.5">
          <span class="w-8 h-8 rounded-2xl bg-gradient-to-br from-[#062420] to-emerald-600 text-emerald-200 flex items-center justify-center text-sm shadow-xs">🧭</span>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-sm sm:text-base font-extrabold text-slate-900">中药活性成分「极性 × 提取路径」动态图谱</h3>
              <span class="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">v9.0 可视化</span>
            </div>
            <p class="text-[11px] text-slate-500">点击任意成分节点可快速定位所属极性区，当前已脉冲锁定 <strong class="text-[#0f5c54]">${esc(topic ? topic.herb : '薄荷')}</strong></p>
          </div>
        </div>
        <div class="px-3 py-1.5 rounded-2xl bg-teal-50/80 border border-teal-200 text-[11px] text-[#0a3630] font-bold">
          当前定位：${esc(activeNode.cat)} · ${esc(activeNode.sol)}
        </div>
      </div>

      <div class="rounded-2xl bg-gradient-to-br from-[#f8fbfa] via-white to-[#f6f9f7] border border-slate-200/80 p-3 overflow-x-auto v9-chart-surface">
        <svg viewBox="0 0 560 176" class="w-full min-w-[460px] h-[168px] block select-none">
          <defs>
            <linearGradient id="v9PolarGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#10b981" stop-opacity="0.16" />
              <stop offset="50%" stop-color="#f59e0b" stop-opacity="0.16" />
              <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.18" />
            </linearGradient>
          </defs>
          <!-- 极性分区底带 -->
          <rect x="26" y="18" width="510" height="128" rx="14" fill="url(#v9PolarGrad)" stroke="rgba(15,92,84,0.14)" stroke-width="1" />
          <line x1="196" y1="18" x2="196" y2="146" stroke="rgba(15,92,84,0.14)" stroke-dasharray="4 4" />
          <line x1="366" y1="18" x2="366" y2="146" stroke="rgba(15,92,84,0.14)" stroke-dasharray="4 4" />
          <text x="111" y="34" text-anchor="middle" fill="#0f766e" font-size="9.5" font-weight="700">低极性 · 亲脂/挥发区</text>
          <text x="281" y="34" text-anchor="middle" fill="#b45309" font-size="9.5" font-weight="700">中等极性 · 醇水/酸碱区</text>
          <text x="451" y="34" text-anchor="middle" fill="#0369a1" font-size="9.5" font-weight="700">强极性 · 水提/大孔树脂区</text>

          <!-- 极性轴 -->
          <line x1="34" y1="158" x2="528" y2="158" stroke="#0f5c54" stroke-width="1.5" />
          <text x="34" y="171" fill="#64748b" font-size="9" font-weight="700">低极性 (石油醚/挥发油)</text>
          <text x="281" y="171" text-anchor="middle" fill="#64748b" font-size="9" font-weight="700">中等极性 (70%~95% 乙醇)</text>
          <text x="528" y="171" text-anchor="end" fill="#64748b" font-size="9" font-weight="700">强极性 (纯化水/醇沉) →</text>

          ${POLAR_NODES.map(n => {
            const isAct = n.cat === activeNode.cat;
            return `
              <g class="v9-polar-node cursor-pointer" data-polar-cat="${esc(n.cat)}">
                ${isAct ? `<circle cx="${n.x}" cy="${n.y}" r="18" fill="${n.color}" fill-opacity="0.22" class="anim-sonar" />` : ''}
                <circle cx="${n.x}" cy="${n.y}" r="${isAct ? 10 : 7}" fill="${n.color}" stroke="#ffffff" stroke-width="${isAct ? 2.8 : 1.8}" />
                <text x="${n.x}" y="${n.y + (isAct ? 22 : 18)}" text-anchor="middle" fill="${isAct ? '#062420' : '#475569'}" font-size="${isAct ? 10 : 8.8}" font-weight="${isAct ? 800 : 600}">${esc(n.cat.replace('与', '/'))}</text>
              </g>
            `;
          }).join('')}
        </svg>
      </div>
    `;

    card.querySelectorAll('[data-polar-cat]').forEach(g => {
      g.addEventListener('click', () => {
        const cat = g.getAttribute('data-polar-cat');
        const sideFilter = document.getElementById('sideCatFilter');
        const openBank = document.getElementById('btnOpenRightBank');
        if (sideFilter) {
          sideFilter.value = cat;
          sideFilter.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (openBank) openBank.click();
      });
    });
  }

  // ==================== 2. Step 2: 4学时甘特图 + 高阶 DIY 工艺积木工坊 ====================
  function loadSavedRecipes() {
    try { return JSON.parse(localStorage.getItem(DIY_STORAGE_KEY) || '[]'); } catch { return []; }
  }
  function saveRecipes(list) {
    try { localStorage.setItem(DIY_STORAGE_KEY, JSON.stringify(list.slice(0, 8))); } catch {}
  }

  function renderStep2Visuals(topic, ws) {
    const cfg = getCfg(ws);

    // 2A. 动态 4 学时甘特排程图
    const ganttCard = ensureCard('wpanel-2', 'v9Step2GanttCard');
    if (ganttCard) {
      const prepMin = 20;
      const extMin = Math.min(240, cfg.time * cfg.cycles);
      const sepMin = 40;
      const qcMin = 30;
      const cleanMin = 15;
      const totalMin = prepMin + extMin + sepMin + qcMin + cleanMin;
      const scaleMax = Math.max(260, totalMin + 15);
      const bars = [
        { name: '① 称量润药前处理', start: 0, dur: prepMin, color: '#14b8a6' },
        { name: `② 主提取 (${cfg.cycles}次×${cfg.time}m)`, start: prepMin, dur: extMin, color: '#0f5c54' },
        { name: '③ 浓缩分离纯化', start: prepMin + extMin, dur: sepMin, color: '#f59e0b' },
        { name: '④ TLC/UV 检识', start: prepMin + extMin + sepMin, dur: qcMin, color: '#6366f1' },
        { name: '⑤ 仪器清洗复原', start: prepMin + extMin + sepMin + qcMin, dur: cleanMin, color: '#64748b' }
      ];
      const limitX = (240 / scaleMax) * 100;
      const statusBadge = totalMin <= 210
        ? '<span class="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-extrabold">✅ 充裕 · 适合 3.5~4h 课堂</span>'
        : totalMin <= 250
          ? '<span class="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-extrabold">⚠️ 紧凑 · 建议边浓缩边点板</span>'
          : '<span class="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-extrabold">🚨 超出 4h · 建议改超声或减时长</span>';

      ganttCard.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2.5">
            <span class="w-8 h-8 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center text-sm shadow-xs">⏱️</span>
            <div>
              <h3 class="text-sm sm:text-base font-extrabold text-slate-900">本科 4 学时动态排程甘特图（总计 ${totalMin} min / ${(totalMin / 60).toFixed(1)} h）</h3>
              <p class="text-[11px] text-slate-500">随左侧「提取时间 / 次数」实时伸缩，红虚线为 240 min 标准实验课上限</p>
            </div>
          </div>
          ${statusBadge}
        </div>
        <div class="relative rounded-2xl bg-slate-50/90 border border-slate-200/80 p-3.5 space-y-2.5 v9-chart-surface">
          <div class="absolute top-2 bottom-2 border-l-2 border-dashed border-rose-400/80 pointer-events-none z-10" style="left: calc(130px + (100% - 146px) * ${(limitX / 100).toFixed(3)})">
            <span class="absolute -top-1 left-1 text-[9px] font-extrabold text-rose-600 bg-rose-50 px-1 rounded whitespace-nowrap">240m 上限</span>
          </div>
          ${bars.map(b => {
            const leftPct = (b.start / scaleMax) * 100;
            const widthPct = Math.max(4, (b.dur / scaleMax) * 100);
            return `
              <div class="flex items-center gap-2.5 text-[11px]">
                <div class="w-[122px] shrink-0 font-bold text-slate-700 truncate">${esc(b.name)}</div>
                <div class="flex-1 h-5 rounded-lg bg-slate-200/60 relative overflow-hidden">
                  <div class="h-full rounded-lg flex items-center justify-end pr-1.5 text-[10px] font-extrabold text-white transition-all duration-300" style="margin-left:${leftPct.toFixed(1)}%; width:${widthPct.toFixed(1)}%; background:${b.color};">${b.dur}m</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    // 2B. 高阶 DIY 工艺积木拼装工坊
    const diyCard = ensureCard('wpanel-2', 'v9DiyBrickBuilder', '#v9Step2GanttCard');
    const v9Data = window.TCM_V9_DATA;
    if (!diyCard || !v9Data) return;

    const allBricks = v9Data.DIY_BRICKS;
    const chosen = allBricks.filter(b => diyState.selectedBricks.includes(b.id));
    const totalDiyMin = chosen.reduce((s, b) => s + b.min, 0);
    const avgGreen = chosen.length ? Math.round(chosen.reduce((s, b) => s + b.green, 0) / chosen.length) : 90;
    const totalCost = chosen.reduce((s, b) => s + b.cost, 0);
    const savedList = loadSavedRecipes();

    const stages = ['前处理', '提取', '分离纯化', '检识评价'];

    diyCard.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2.5">
          <span class="w-8 h-8 rounded-2xl bg-gradient-to-br from-[#062420] to-teal-500 text-amber-300 flex items-center justify-center text-sm shadow-xs">🧩</span>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="text-sm sm:text-base font-extrabold text-slate-900">高阶 DIY 工艺积木自由拼装工坊</h3>
              <span class="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-extrabold">自由组合 · 实时联算</span>
            </div>
            <p class="text-[11px] text-slate-500">点击积木自由搭建专属路线，实时计算总耗时、绿色环保指数与预估耗材，支持保存多套方案</p>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <button type="button" id="v9BtnSaveDiy" class="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-[#0f5c54] text-slate-700 text-xs font-bold transition">💾 存为方案槽</button>
          <button type="button" id="v9BtnApplyDiyToReport" class="px-3 py-1.5 rounded-xl bg-[#0a3630] hover:bg-[#062420] text-white text-xs font-extrabold transition shadow-xs">✨ 写入方案并复制</button>
        </div>
      </div>

      <!-- 一键黄金 DIY 模板 -->
      <div class="flex flex-wrap items-center gap-1.5">
        <span class="text-[11px] font-bold text-slate-500 mr-1">黄金模板：</span>
        ${v9Data.DIY_TEMPLATES.map(tpl => `
          <button type="button" data-diy-tpl="${tpl.id}" class="px-2.5 py-1 rounded-xl bg-teal-50/80 hover:bg-teal-100 border border-teal-200 text-[#0a3630] text-[11px] font-bold transition">${esc(tpl.name)}</button>
        `).join('')}
      </div>

      <!-- 4 阶段 16 块积木拼装区 -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        ${stages.map(st => `
          <div class="rounded-2xl bg-slate-50/85 border border-slate-200/80 p-3 space-y-2 v9-chart-surface">
            <div class="text-[11px] font-extrabold text-[#0f5c54] flex items-center justify-between">
              <span>${st}</span>
              <span class="text-[10px] text-slate-400">可多选</span>
            </div>
            <div class="space-y-1.5">
              ${allBricks.filter(b => b.stage === st).map(b => {
                const on = diyState.selectedBricks.includes(b.id);
                return `
                  <button type="button" data-diy-brick="${b.id}" class="v9-brick-btn w-full text-left p-2 rounded-xl border transition ${on ? 'active' : ''}">
                    <div class="flex items-center justify-between gap-1">
                      <span class="text-xs font-extrabold truncate">${b.icon} ${esc(b.name)}</span>
                      <span class="text-[10px] font-bold opacity-75 shrink-0">${b.min}m</span>
                    </div>
                    <div class="text-[10px] opacity-75 line-clamp-1 mt-0.5">${esc(b.desc)}</div>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- 实时拼装结果动态流程图链 + 三指标 -->
      <div class="rounded-2xl bg-gradient-to-r from-[#062420] via-[#0a3630] to-[#0f5c54] text-white p-3.5 space-y-2.5">
        <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div class="font-extrabold text-emerald-200">⚡ 当前 DIY 工艺链（已选 ${chosen.length} 块积木）</div>
          <div class="flex flex-wrap items-center gap-3 tabular-nums text-[11px]">
            <span>⏱ 预估总耗时：<strong class="text-amber-300">${totalDiyMin} min</strong></span>
            <span>🌿 绿色环保分：<strong class="text-emerald-300">${avgGreen} / 100</strong></span>
            <span>🧪 估算耗材：<strong class="text-sky-200">¥${totalCost} / 组</strong></span>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-1.5">
          ${chosen.length ? chosen.map((b, i) => `
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/12 border border-white/15 text-[11px] font-bold">${b.icon} ${esc(b.name)}</span>
            ${i < chosen.length - 1 ? '<span class="text-emerald-300 font-bold">→</span>' : ''}
          `).join('') : '<span class="text-xs text-teal-200/80">请点击上方积木开始搭建你的 DIY 实验流程...</span>'}
        </div>
      </div>

      ${savedList.length ? `
        <div class="flex flex-wrap items-center gap-2 pt-1">
          <span class="text-[11px] font-bold text-slate-500">已保存方案槽：</span>
          ${savedList.map((r, idx) => `
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-[11px] font-bold text-slate-700">
              <button type="button" data-load-recipe="${idx}" class="hover:text-[#0f5c54]">📂 ${esc(r.name)} (${r.bricks.length}块)</button>
              <button type="button" data-del-recipe="${idx}" class="text-slate-400 hover:text-rose-600 ml-1" title="删除">×</button>
            </span>
          `).join('')}
        </div>
      ` : ''}
    `;

    // 绑定积木点击
    diyCard.querySelectorAll('[data-diy-brick]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.diyBrick;
        if (diyState.selectedBricks.includes(id)) {
          diyState.selectedBricks = diyState.selectedBricks.filter(x => x !== id);
        } else {
          diyState.selectedBricks.push(id);
        }
        renderStep2Visuals(topic, ws);
      });
    });

    // 绑定一键模板（同步左侧参数滑块！）
    diyCard.querySelectorAll('[data-diy-tpl]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tpl = v9Data.DIY_TEMPLATES.find(x => x.id === btn.dataset.diyTpl);
        if (!tpl) return;
        diyState.selectedBricks = tpl.bricks.slice();
        const setVal = (id, val) => {
          const el = document.getElementById(id);
          if (el) { el.value = String(val); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }
        };
        setVal('cfgTemp', tpl.temp);
        setVal('cfgTime', tpl.time);
        setVal('cfgCycles', tpl.cycles);
        setVal('cfgSolventType', tpl.solvent);
        renderStep2Visuals(topic, ws);
      });
    });

    // 保存方案槽
    const saveBtn = diyCard.querySelector('#v9BtnSaveDiy');
    if (saveBtn) saveBtn.addEventListener('click', () => {
      const list = loadSavedRecipes();
      const label = `${topic ? topic.herb.slice(0, 6) : '自定义'}·方案${list.length + 1}`;
      list.unshift({ name: label, bricks: diyState.selectedBricks.slice(), time: totalDiyMin, green: avgGreen });
      saveRecipes(list);
      renderStep2Visuals(topic, ws);
    });

    // 加载/删除方案槽
    diyCard.querySelectorAll('[data-load-recipe]').forEach(b => b.addEventListener('click', () => {
      const list = loadSavedRecipes();
      const item = list[Number(b.dataset.loadRecipe)];
      if (item && Array.isArray(item.bricks)) {
        diyState.selectedBricks = item.bricks.slice();
        renderStep2Visuals(topic, ws);
      }
    }));
    diyCard.querySelectorAll('[data-del-recipe]').forEach(b => b.addEventListener('click', () => {
      const list = loadSavedRecipes();
      list.splice(Number(b.dataset.delRecipe), 1);
      saveRecipes(list);
      renderStep2Visuals(topic, ws);
    }));

    // 一键写入并复制 DIY 工艺单
    const applyBtn = diyCard.querySelector('#v9BtnApplyDiyToReport');
    if (applyBtn) applyBtn.addEventListener('click', () => {
      const chainText = chosen.map(b => b.name).join(' → ');
      const txt = `【本草智研 v9.0 DIY 定制路线】药材：${topic ? topic.herb : '自定义'} | 工艺链：${chainText} | 预估总耗时：${totalDiyMin} min | 绿色安全分：${avgGreen}/100 | 耗材估算：¥${totalCost}/组`;
      if (ws) ws.diyChainSummary = txt;
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).catch(() => {});
      applyBtn.textContent = '✓ 已复制并同步';
      setTimeout(() => { applyBtn.textContent = '✨ 写入方案并复制'; }, 1800);
    });
  }

  // ==================== 3. Step 3: Fick 扩散提取动力学实时 SVG 曲线 ====================
  function renderStep3Kinetics(topic, ws) {
    const card = ensureCard('wpanel-3', 'v9Step3KineticsCard');
    if (!card) return;
    const cfg = getCfg(ws);

    // 速率常数 k 与温度、粒度正相关
    const meshFactor = cfg.mesh.includes('细粉') ? 1.35 : (cfg.mesh.includes('中粉') ? 1.18 : (cfg.mesh.includes('粗粉') ? 1.0 : 0.82));
    const tempFactor = 0.45 + (cfg.temp / 100) * 0.95;
    const kBase = 0.014 * meshFactor * tempFactor;
    const kUltra = kBase * 1.68;
    const kCold = kBase * 0.42;

    const maxT = 240;
    const toPath = (k, cmax) => {
      const pts = [];
      for (let t = 0; t <= maxT; t += 10) {
        const yVal = cmax * (1 - Math.exp(-k * t));
        const px = 42 + (t / maxT) * 468;
        const py = 148 - (yVal / 100) * 120;
        pts.push(`${t === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`);
      }
      return pts.join(' ');
    };

    const curT = Math.min(maxT, cfg.time);
    const curYield = Math.min(98.5, 96 * (1 - Math.exp(-kBase * curT)));
    const ultraYield = Math.min(99.2, 98 * (1 - Math.exp(-kUltra * curT)));
    const tHalf = Math.round(Math.log(2) / kBase);
    const curX = 42 + (curT / maxT) * 468;
    const curY = 148 - (curYield / 100) * 120;

    card.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2.5">
          <span class="w-8 h-8 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center text-sm shadow-xs">📉</span>
          <div>
            <h3 class="text-sm sm:text-base font-extrabold text-slate-900">Fick 扩散传质动力学实时模拟曲线</h3>
            <p class="text-[11px] text-slate-500">拖动左侧「温度 / 粒度 / 时长」滑块，实时观察溶出平衡拐点与超声提速对比</p>
          </div>
        </div>
        <div class="flex items-center gap-2 text-[11px] font-extrabold tabular-nums">
          <span class="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">当前溶出率 ${curYield.toFixed(1)}%</span>
          <span class="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">半平衡 t½ ≈ ${tHalf}m</span>
        </div>
      </div>

      <div class="rounded-2xl bg-slate-50/90 border border-slate-200/80 p-3 overflow-x-auto v9-chart-surface">
        <svg viewBox="0 0 540 178" class="w-full min-w-[440px] h-[172px] block">
          <!-- 网格线 -->
          <g stroke="rgba(15,92,84,0.10)" stroke-width="1">
            <line x1="42" y1="28" x2="510" y2="28" />
            <line x1="42" y1="58" x2="510" y2="58" />
            <line x1="42" y1="88" x2="510" y2="88" />
            <line x1="42" y1="118" x2="510" y2="118" />
            <line x1="42" y1="148" x2="510" y2="148" stroke="#64748b" />
            <line x1="42" y1="24" x2="42" y2="148" stroke="#64748b" />
          </g>
          <text x="36" y="32" text-anchor="end" fill="#64748b" font-size="9">100%</text>
          <text x="36" y="91" text-anchor="end" fill="#64748b" font-size="9">50%</text>
          <text x="36" y="151" text-anchor="end" fill="#64748b" font-size="9">0%</text>
          <text x="42" y="164" fill="#64748b" font-size="9">0 min</text>
          <text x="159" y="164" text-anchor="middle" fill="#64748b" font-size="9">60 min</text>
          <text x="276" y="164" text-anchor="middle" fill="#64748b" font-size="9">120 min</text>
          <text x="393" y="164" text-anchor="middle" fill="#64748b" font-size="9">180 min</text>
          <text x="510" y="164" text-anchor="end" fill="#64748b" font-size="9">240 min</text>

          <!-- 三条动力学曲线 -->
          <path d="${toPath(kCold, 82)}" fill="none" stroke="#94a3b8" stroke-width="1.8" stroke-dasharray="5 5" />
          <path d="${toPath(kUltra, 98)}" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-dasharray="6 3" />
          <path d="${toPath(kBase, 96)}" fill="none" stroke="#0f5c54" stroke-width="3" />

          <!-- 当前设定时间点脉冲 -->
          <line x1="${curX.toFixed(1)}" y1="28" x2="${curX.toFixed(1)}" y2="148" stroke="#10b981" stroke-width="1.4" stroke-dasharray="3 3" />
          <circle cx="${curX.toFixed(1)}" cy="${curY.toFixed(1)}" r="10" fill="#10b981" fill-opacity="0.22" class="anim-sonar" />
          <circle cx="${curX.toFixed(1)}" cy="${curY.toFixed(1)}" r="5" fill="#10b981" stroke="#ffffff" stroke-width="2" />
          <rect x="${Math.min(410, curX + 8).toFixed(1)}" y="${Math.max(26, curY - 22).toFixed(1)}" width="92" height="20" rx="6" fill="#062420" />
          <text x="${(Math.min(410, curX + 8) + 46).toFixed(1)}" y="${(Math.max(26, curY - 22) + 13).toFixed(1)}" text-anchor="middle" fill="#a7f3d0" font-size="9.5" font-weight="800">${curT}m · ${curYield.toFixed(1)}%</text>

          <!-- 图例 -->
          <g transform="translate(260, 14)" font-size="9" font-weight="700">
            <line x1="0" y1="0" x2="14" y2="0" stroke="#0f5c54" stroke-width="3" /><text x="18" y="3" fill="#0f5c54">当前工艺 (${cfg.temp}℃/${esc(cfg.mesh.slice(0, 2))})</text>
            <line x1="112" y1="0" x2="126" y2="0" stroke="#f59e0b" stroke-width="2.2" stroke-dasharray="5 2" /><text x="130" y="3" fill="#b45309">超声空化 (${ultraYield.toFixed(0)}%)</text>
            <line x1="210" y1="0" x2="224" y2="0" stroke="#94a3b8" stroke-width="1.8" stroke-dasharray="4 4" /><text x="228" y="3" fill="#64748b">冷浸基准</text>
          </g>
        </svg>
      </div>
    `;
  }

  // ==================== 4. Step 4: 溶剂沸点安全裕度实时监控仪 ====================
  function renderStep4SafetyGauge(topic, ws) {
    const card = ensureCard('wpanel-4', 'v9Step4SafetyGauge');
    if (!card) return;
    const cfg = getCfg(ws);
    const info = SOLVENT_BP[cfg.solventType] || SOLVENT_BP['70%乙醇'];
    const pct = Math.max(4, Math.min(98, (cfg.temp / 120) * 100));
    const bpPct = Math.max(8, Math.min(96, (info.bp / 120) * 100));
    const diff = cfg.temp - info.bp;

    const status = diff > 8
      ? { badge: '🚨 超沸点暴沸风险', cls: 'bg-rose-50 border-rose-200 text-rose-800', bar: '#ef4444' }
      : diff >= -6
        ? { badge: '🔥 微沸回流黄金区', cls: 'bg-amber-50 border-amber-200 text-amber-800', bar: '#f59e0b' }
        : { badge: '✅ 温和浸提安全区', cls: 'bg-emerald-50 border-emerald-200 text-emerald-800', bar: '#10b981' };

    card.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2.5">
          <span class="w-8 h-8 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center text-sm shadow-xs">🌡️</span>
          <div>
            <h3 class="text-sm sm:text-base font-extrabold text-slate-900">溶剂沸点安全裕度与防暴沸实时监控</h3>
            <p class="text-[11px] text-slate-500">当前溶剂：<strong>${esc(info.label)}</strong> · 设定温度 <strong class="tabular-nums">${cfg.temp} ℃</strong></p>
          </div>
        </div>
        <span class="px-2.5 py-1 rounded-full border text-[11px] font-extrabold ${status.cls}">${status.badge}</span>
      </div>

      <div class="rounded-2xl bg-slate-50/90 border border-slate-200/80 p-3.5 space-y-2.5 v9-chart-surface">
        <div class="relative h-5 rounded-full bg-gradient-to-r from-emerald-200 via-amber-200 to-rose-300 overflow-visible">
          <div class="h-full rounded-full transition-all duration-300" style="width:${pct.toFixed(1)}%; background:${status.bar}; opacity:0.88;"></div>
          <div class="absolute -top-1.5 -bottom-1.5 w-0.5 bg-slate-900" style="left:${bpPct.toFixed(1)}%">
            <span class="absolute -top-4 -translate-x-1/2 text-[9px] font-extrabold text-slate-800 bg-white/90 px-1 rounded border border-slate-200 whitespace-nowrap">沸点 ${info.bp}℃</span>
          </div>
        </div>
        <div class="flex items-center justify-between text-[11px] text-slate-600 pt-1">
          <span>💡 操作提示：${esc(info.note)}</span>
          <span class="font-mono font-bold text-slate-700 shrink-0 ml-2">ΔT = ${diff >= 0 ? '+' : ''}${diff.toFixed(1)}℃</span>
        </div>
      </div>
    `;
  }

  // ==================== 5. Step 5: 动态 HPLC / 柱层析高斯洗脱峰模拟器 ====================
  function renderStep5ChromSim(topic) {
    const card = ensureCard('wpanel-5', 'v9Step5ChromSim');
    if (!card) return;

    const pol = diyState.chromPolarity; // 15..85 (%B)
    const flow = diyState.chromFlow;    // 0.4..2.0 mL/min

    // 保留时间随极性升高而提前、随流速升高而提前
    const tR1 = (11.5 - pol * 0.085) / Math.pow(flow, 0.72);
    const sepGap = (2.9 - pol * 0.022) / Math.pow(flow, 0.55);
    const tR2 = tR1 + Math.max(0.45, sepGap);

    // 范德姆特方程近似峰宽 w（流速 1.0 mL/min 附近峰最尖锐）
    const wBase = 0.42 + Math.abs(flow - 0.95) * 0.36 + (100 - pol) * 0.002;
    const sigma1 = wBase * 0.55;
    const sigma2 = wBase * 0.62;
    const rs = ((tR2 - tR1) / (2 * (sigma1 + sigma2)));
    const plates = Math.round(16 * Math.pow(tR1 / (4 * sigma1), 2));

    const maxX = 16; // min
    const buildCurve = (mu, sig, amp) => {
      const pts = [];
      for (let t = 0; t <= maxX; t += 0.12) {
        const y = amp * Math.exp(-0.5 * Math.pow((t - mu) / sig, 2));
        const px = 36 + (t / maxX) * 474;
        const py = 140 - y;
        pts.push(`${t === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`);
      }
      return pts.join(' ');
    };

    const rsStatus = rs >= 1.5
      ? '<span class="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-extrabold">✅ 药典基线分离达标 (Rs ≥ 1.5)</span>'
      : rs >= 1.0
        ? '<span class="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-extrabold">⚠️ 部分重叠 · 建议调低极性或优化流速</span>'
        : '<span class="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-extrabold">🚨 严重共洗脱 · 无法准确定量</span>';

    card.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2.5">
          <span class="w-8 h-8 rounded-2xl bg-gradient-to-br from-indigo-600 to-teal-600 text-white flex items-center justify-center text-sm shadow-xs">📊</span>
          <div>
            <h3 class="text-sm sm:text-base font-extrabold text-slate-900">动态 HPLC / 柱层析洗脱峰分离模拟器</h3>
            <p class="text-[11px] text-slate-500">拖动流动相极性与流速滑块，实时演练「目标成分峰 vs 邻近杂质峰」分离度 Rs 与理论塔板数 N</p>
          </div>
        </div>
        ${rsStatus}
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 v9-chart-surface">
          <div class="flex justify-between font-bold mb-1"><span>流动相有机相比例 (B%)</span><span class="text-[#0f5c54] tabular-nums">${pol}%</span></div>
          <input id="v9ChromPolSlider" type="range" min="15" max="85" step="1" value="${pol}" class="w-full accent-emerald-600" />
        </div>
        <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 v9-chart-surface">
          <div class="flex justify-between font-bold mb-1"><span>洗脱流速 (Van Deemter)</span><span class="text-indigo-700 tabular-nums">${flow.toFixed(1)} mL/min</span></div>
          <input id="v9ChromFlowSlider" type="range" min="0.4" max="2.0" step="0.1" value="${flow}" class="w-full accent-indigo-600" />
        </div>
      </div>

      <div class="rounded-2xl bg-slate-50/90 border border-slate-200/80 p-3 overflow-x-auto v9-chart-surface">
        <svg viewBox="0 0 540 166" class="w-full min-w-[440px] h-[160px] block">
          <line x1="36" y1="140" x2="510" y2="140" stroke="#64748b" stroke-width="1.5" />
          <line x1="36" y1="18" x2="36" y2="140" stroke="#64748b" stroke-width="1.5" />
          <path d="${buildCurve(tR1, sigma1, 108)} L510,140 L36,140 Z" fill="rgba(16,185,129,0.22)" />
          <path d="${buildCurve(tR1, sigma1, 108)}" fill="none" stroke="#0f5c54" stroke-width="2.6" />
          <path d="${buildCurve(tR2, sigma2, 74)} L510,140 L36,140 Z" fill="rgba(245,158,11,0.22)" />
          <path d="${buildCurve(tR2, sigma2, 74)}" fill="none" stroke="#d97706" stroke-width="2.2" />
          <text x="${(36 + (tR1 / maxX) * 474).toFixed(1)}" y="26" text-anchor="middle" fill="#0f5c54" font-size="9.5" font-weight="800">主成分 ${tR1.toFixed(1)}m</text>
          <text x="${(36 + (tR2 / maxX) * 474).toFixed(1)}" y="58" text-anchor="middle" fill="#b45309" font-size="9" font-weight="800">邻近杂质 ${tR2.toFixed(1)}m</text>
          <text x="36" y="156" fill="#64748b" font-size="9">0 min</text>
          <text x="273" y="156" text-anchor="middle" fill="#64748b" font-size="9">8 min</text>
          <text x="510" y="156" text-anchor="end" fill="#64748b" font-size="9">16 min</text>
        </svg>
        <div class="mt-2 grid grid-cols-3 gap-2 text-center text-[11px] tabular-nums">
          <div class="p-2 rounded-xl bg-white border border-slate-200/80"><span class="text-slate-500">分离度 Rs：</span><strong class="${rs >= 1.5 ? 'text-emerald-700' : 'text-rose-600'}">${rs.toFixed(2)}</strong></div>
          <div class="p-2 rounded-xl bg-white border border-slate-200/80"><span class="text-slate-500">理论塔板数 N：</span><strong class="text-indigo-700">${plates.toLocaleString()}</strong></div>
          <div class="p-2 rounded-xl bg-white border border-slate-200/80"><span class="text-slate-500">保留时间差 ΔtR：</span><strong class="text-amber-700">${(tR2 - tR1).toFixed(2)} min</strong></div>
        </div>
      </div>
    `;

    const polEl = card.querySelector('#v9ChromPolSlider');
    const flowEl = card.querySelector('#v9ChromFlowSlider');
    if (polEl) polEl.addEventListener('input', () => { diyState.chromPolarity = Number(polEl.value); renderStep5ChromSim(topic); });
    if (flowEl) flowEl.addEventListener('input', () => { diyState.chromFlow = Number(flowEl.value); renderStep5ChromSim(topic); });
  }

  window.TCM_V9 = {
    sync: function (topic, ws, stats, step) {
      try {
        if (step === 1) renderStep1PolarMap(topic);
        if (step === 2) renderStep2Visuals(topic, ws);
        if (step === 3) renderStep3Kinetics(topic, ws);
        if (step === 4) renderStep4SafetyGauge(topic, ws);
        if (step === 5) renderStep5ChromSim(topic);
      } catch (err) {
        console.error('TCM_V9 render error:', err);
      }
    }
  };
})();
