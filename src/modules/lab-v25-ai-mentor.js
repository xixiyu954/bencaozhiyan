/**
 * 本草智研 v25 · 板块三：悬浮 AI 导师（上下文感知 + 苏格拉底引导模式切换 + 实时 MSDS 安全督察）
 * 严格复用服务端代理 window.TCMCloudAI (/api/ai-proxy)，前端绝不包含任何密钥。
 */
const esc = (v) => String(v == null ? '' : v).replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));

let drawerEl = null;
let socraticMode = true; // 默认开启苏格拉底引导模式，可一键切换直接解答
let messages = [];
let busy = false;

function getContextSummary() {
  const api = typeof window !== 'undefined' ? window.TCM_LAB_API : null;
  const topic = api?.getCurrentTopic?.() || { herb: '薄荷', compound: '薄荷脑', category: '挥发油与萜类' };
  const ws = api?.getCurrentWorkState?.() || { mass: 100, ratio: 10, temp: 80, time: 60, solventType: '70%乙醇', cycles: '2' };
  return { topic, ws };
}

function runLocalSafetyAudit() {
  const { topic, ws } = getContextSummary();
  const sol = String(ws.solventType || '');
  const temp = Number(ws.temp) || 75;
  const warnings = [];
  if (/氯仿|三氯甲烷|乙醚|石油醚/.test(sol)) {
    warnings.push({ level: '高危', text: `当前溶剂「${sol}」具高挥发/毒性或极易燃风险，严禁明火，必须在通风橱内操作并分类回收卤代/有机废液！` });
  } else if (/乙醇|甲醇/.test(sol) && temp >= 75) {
    warnings.push({ level: '注意', text: `「${sol}」在 ${temp}℃ 接近沸点，务必使用水浴/电热套控温、加沸石防暴沸并确保回流冷凝水下进上出。` });
  }
  if (/酸|碱/.test(sol) || /酸|碱/.test(String(ws.ph || ''))) {
    warnings.push({ level: '防护', text: '涉及酸碱调节，请佩戴耐酸碱手套与护目镜；废液须先中和至 pH 6~9 再按规范处置。' });
  }
  if (warnings.length === 0) {
    warnings.push({ level: '合规', text: `「${topic.herb}」当前溶剂（${sol || '纯化水'} / ${temp}℃）整体风险可控，开机前常规复核器皿气密性与防烫防护即可。` });
  }
  return warnings;
}

function buildLocalFallbackReply(q) {
  const { topic, ws } = getContextSummary();
  if (socraticMode) {
    return `【苏格拉底引导 · ${topic.herb}】关于「${q}」，我们先一步步推演：\n1）你当前用的是 ${ws.solventType}、温度 ${ws.temp}℃、料液比 1:${ws.ratio}——目标成分「${topic.compound}」属于${topic.category}，你认为它在当前溶剂中的溶解度与热稳定性如何？\n2）如果把温度或料液比微调一档，杂质溶出和能耗会怎么变化？\n（提示：点击上方切换「直接模式」或待云端 AI 代理可用时可获得更深入解析）`;
  }
  return `【工艺要点速览 · ${topic.herb}】当前课题目标成分为「${topic.compound}」（${topic.category}），建议重点核对：溶剂极性是否贴合 ${ws.solventType}、控温 ${ws.temp}℃ 是否避开热敏降解区，以及过滤/浓缩转移损失。如需多轮 AI 深度推演，请确认 Cloudflare Pages 环境变量 ZHIPU_API_KEY 已配置。`;
}

function ensureDrawer() {
  if (drawerEl) return drawerEl;
  drawerEl = document.createElement('div');
  drawerEl.id = 'tcmV25MentorDrawer';
  drawerEl.className = 'no-print fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col transform translate-x-full transition-transform duration-300 hidden';
  drawerEl.innerHTML = `
    <div class="px-4 py-3.5 bg-gradient-to-r from-[#062922] to-[#0f6b58] text-white flex items-center justify-between gap-2">
      <div>
        <div class="text-[10px] font-extrabold text-emerald-200">板块三 · 24h 实验助教</div>
        <h3 class="text-sm font-extrabold">🧑‍🏫 本草 AI 导师 &amp; 安全督察</h3>
      </div>
      <button type="button" id="v25Close" class="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold">×</button>
    </div>
    <div class="px-4 py-2.5 bg-[#f6f8f7] border-b border-slate-200 space-y-2 text-xs">
      <div id="v25CtxBar" class="text-[11px] text-slate-600 font-semibold truncate"></div>
      <div class="flex items-center justify-between gap-2">
        <div class="inline-flex p-0.5 rounded-xl bg-white border border-slate-200 font-bold">
          <button type="button" id="v25ModeSoc" class="px-2.5 py-1 rounded-lg transition">🎓 苏格拉底引导</button>
          <button type="button" id="v25ModeDir" class="px-2.5 py-1 rounded-lg transition">⚡ 直接解答</button>
        </div>
        <button type="button" id="v25SafetyBtn" class="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold">🛡️ 安全督察快检</button>
      </div>
    </div>
    <div id="v25ChatList" class="flex-1 overflow-y-auto p-4 space-y-3 text-xs bg-slate-50/50"></div>
    <form id="v25Form" class="p-3 border-t border-slate-200 bg-white flex gap-2">
      <input id="v25Input" type="text" placeholder="输入实验原理、参数优化或安全疑问..." class="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500" />
      <button id="v25Send" type="submit" class="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-extrabold">发送</button>
    </form>`;
  document.body.appendChild(drawerEl);

  drawerEl.querySelector('#v25Close').addEventListener('click', closeDrawer);
  drawerEl.querySelector('#v25ModeSoc').addEventListener('click', () => { socraticMode = true; renderState(); });
  drawerEl.querySelector('#v25ModeDir').addEventListener('click', () => { socraticMode = false; renderState(); });
  drawerEl.querySelector('#v25SafetyBtn').addEventListener('click', () => {
    const checks = runLocalSafetyAudit();
    messages.push({
      role: 'assistant',
      text: '🛡️ 【AI 安全督察即时体检】\n' + checks.map((w) => `[${w.level}] ${w.text}`).join('\n')
    });
    try { window.dispatchEvent(new CustomEvent('tcm:achievement-event', { detail: { type: 'mentor_ask' } })); } catch (_) {}
    renderState();
  });

  drawerEl.querySelector('#v25Form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy) return;
    const inp = drawerEl.querySelector('#v25Input');
    const q = inp.value.trim();
    if (!q) return;
    inp.value = '';
    messages.push({ role: 'user', text: q });
    busy = true;
    renderState();
    try { window.dispatchEvent(new CustomEvent('tcm:achievement-event', { detail: { type: 'mentor_ask' } })); } catch (_) {}

    const { topic, ws } = getContextSummary();
    const sysPrompt = socraticMode
      ? `你是高校《中药化学》苏格拉底式 AI 导师。当前学生正在研究「${topic.herb} · ${topic.compound}」（${topic.category}），参数：溶剂 ${ws.solventType}、温度 ${ws.temp}℃、料液比 1:${ws.ratio}、时间 ${ws.time}min。请不要直接抛完整答案，而是结合其当前参数给出简明启发式反问（2~3 句）引导学生自己推导出原理或改进方案。`
      : `你是高校《中药化学》实验导师。当前课题「${topic.herb} · ${topic.compound}」（${topic.category}），参数：溶剂 ${ws.solventType}、温度 ${ws.temp}℃、料液比 1:${ws.ratio}、时间 ${ws.time}min。请直接、专业、精炼地解答学生问题并给出可执行参数与安全建议。`;

    let reply = '';
    try {
      if (window.TCMCloudAI && typeof window.TCMCloudAI.chat === 'function') {
        reply = await window.TCMCloudAI.chat([
          { role: 'system', content: sysPrompt },
          { role: 'user', content: q }
        ]);
      } else {
        reply = buildLocalFallbackReply(q);
      }
    } catch (_) {
      reply = buildLocalFallbackReply(q);
    }

    messages.push({ role: 'assistant', text: String(reply || buildLocalFallbackReply(q)) });
    busy = false;
    renderState();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawerEl && !drawerEl.classList.contains('hidden')) closeDrawer();
  });
  return drawerEl;
}

function renderState() {
  ensureDrawer();
  const { topic, ws } = getContextSummary();
  drawerEl.querySelector('#v25CtxBar').textContent = `当前上下文：${topic.herb} · ${topic.compound} | ${ws.solventType} · ${ws.temp}℃ · 1:${ws.ratio}`;

  const socBtn = drawerEl.querySelector('#v25ModeSoc');
  const dirBtn = drawerEl.querySelector('#v25ModeDir');
  socBtn.className = `px-2.5 py-1 rounded-lg transition ${socraticMode ? 'bg-[#064e3b] text-white' : 'text-slate-600'}`;
  dirBtn.className = `px-2.5 py-1 rounded-lg transition ${!socraticMode ? 'bg-[#064e3b] text-white' : 'text-slate-600'}`;

  const list = drawerEl.querySelector('#v25ChatList');
  if (messages.length === 0) {
    messages.push({
      role: 'assistant',
      text: `你好！我是你的 24 小时中药化学 AI 导师。当前已感知你正在研究「${topic.herb}（${topic.compound}）」。\n默认已开启「苏格拉底引导模式」，你可以随时问我工艺原理、参数取舍，或点击上方「🛡️ 安全督察快检」。`
    });
  }
  list.innerHTML = messages.map((m) => `
    <div class="flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}">
      <div class="max-w-[86%] px-3.5 py-2.5 rounded-2xl whitespace-pre-wrap leading-relaxed ${m.role === 'user' ? 'bg-[#064e3b] text-white' : 'bg-white border border-slate-200 text-slate-800 shadow-2xs'}">${esc(m.text)}</div>
    </div>`).join('') + (busy ? '<div class="text-[11px] text-slate-400">导师正在思考中...</div>' : '');
  list.scrollTop = list.scrollHeight;
}

export function openMentorDrawer() {
  ensureDrawer();
  drawerEl.classList.remove('hidden');
  requestAnimationFrame(() => drawerEl.classList.remove('translate-x-full'));
  renderState();
}

export function closeDrawer() {
  if (!drawerEl) return;
  drawerEl.classList.add('translate-x-full');
  setTimeout(() => drawerEl.classList.add('hidden'), 260);
}

export const TCM_V25_MENTOR = Object.freeze({
  version: '1.0.0',
  open: openMentorDrawer,
  close: closeDrawer,
  runLocalSafetyAudit
});

if (typeof window !== 'undefined') {
  window.TCM_V25_MENTOR = TCM_V25_MENTOR;
}

export default TCM_V25_MENTOR;
