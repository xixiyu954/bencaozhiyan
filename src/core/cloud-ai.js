(() => {
  'use strict';

  // 三引擎混合智能代理路由：
  // 1. Cloudflare Pages (*.pages.dev / 自定义域名) -> 优先走同源 /api/ai-proxy
  // 2. GitHub Pages (xixiyu954.github.io) / 本地预览 -> 自动在主站与备用 Cloudflare Pages 通道间容错切换
  // 后端支持三引擎混编：智谱 GLM + 讯飞星辰 MaaS + 阿里云通义/兼容网关（全自动故障切换）
  const CLOUDFLARE_SITE_URL = 'https://bencaozhiyan-xixiyu.pages.dev';
  const CLOUDFLARE_BACKUP_URL = 'https://bencaozhiyanxxy.pages.dev';
  const CF_PROXY_PATH = '/api/ai-proxy';
  const CUSTOM_PROXY_STORAGE_KEY = 'tcm_custom_ai_proxy';
  const ROUTE_MODE_STORAGE_KEY = 'tcm_ai_route_mode';
  const DEFAULT_MODEL = 'glm-4-flash-250414';
  const CACHE_KEY = 'tcm_ai_resp_cache_v3';
  const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
  const MAX_CACHE_ENTRIES = 30;

  const PROVIDER_NAMES = {
    auto: '三引擎智能混编',
    zhipu: '智谱 GLM',
    tencent: '腾讯云 TokenHub',
    xunfei: '讯飞星辰 MaaS'
  };

  // 全站统一 5 套中药化学标准化设计模板（供 2.5 AI课题竞技 / 智能方案编排 / 已有方案校核 / 助教答疑 四大板块共用）
  const DESIGN_TEMPLATES = [
    {
      id: 'undergrad_4h',
      label: '本科 4 学时标准模板',
      short: '本科4学时',
      desc: '总时长 ≤ 220 min · 绿色低毒溶剂 · 4阶段工艺 · 6~8步量化SOP · 3批RSD质控',
      promptRule: '严格套用【本科 4 学时规范教学模板】：单批投料 20~100 g，提取+浓缩+检识总耗时严控在 180~220 min 内；严禁使用氯仿/苯/乙醚等剧毒溶剂，优先水或 50%~95% 乙醇；必须完整包含提取→分离→纯化→检识 4 阶段、6~8 条带精确数值（g/mL/℃/min/目数/pH）的 SOP 及 3 批平行 RSD < 3.5% 质控。'
    },
    {
      id: 'innovation_ortho',
      label: '大创 / 正交工艺优化模板',
      short: '大创正交',
      desc: 'L9(3^4) 正交因素水平 · 收率/纯度/绿色度三维对比 · 工业中试衔接',
      promptRule: '严格套用【大创与正交工艺优化模板】：在工艺参数与创新亮点中明确列出 3~4 个关键优化因素（如溶剂浓度、料液比、温度、超声/回流时长）及 L9(3^4) 正交对照方案；兼顾粗提得率、HPLC 指标成分纯度与绿色评分三维综合评价。'
    },
    {
      id: 'green_clean',
      label: '绿色无氯仿环保替代模板',
      short: '绿色无氯仿',
      desc: '零含卤溶剂 · 水/乙醇/乙酸乙酯/NADES 替代 · 溶剂回收 ≥75% · E-因子评估',
      promptRule: '严格套用【绿色无氯仿环保替代模板】：强制禁用氯仿、二氯甲烷、苯、甲醇、石油醚等高危高毒溶剂，使用水、乙醇、乙酸乙酯或低共熔溶剂（NADES）/ 超临界 CO2 替代；必须写明旋蒸溶剂回收率 ≥75%、有机废液分类收集及绿色化学 E-因子减排优势。'
    },
    {
      id: 'pharmacopoeia_2025',
      label: '2025 版药典质控标杆模板',
      short: '2025药典标杆',
      desc: '对标《中国药典》2025版 · 基原/限度/水分灰分 · TLC ΔRf≤0.03 · HPLC定量',
      promptRule: '严格套用【2025 版《中国药典》质控标杆模板】：拉丁基原、指标成分定量限度、TLC 展开剂精确体积比与 254/365 nm 检视特征（ΔRf ≤ 0.03）、HPLC 检测波长与方法学精密度（RSD ≤ 2.0%）须高度规范，不可编造虚假药典数值。'
    },
    {
      id: 'formula_synergy',
      label: '经典名方复方协同模板',
      short: '复方协同',
      desc: '多成分脂水双提/酸碱分提 · 配伍增溶/拮抗机理 · 大孔树脂分级纯化',
      promptRule: '严格套用【经典名方复方协同与一材双提模板】：阐明多指标成分（如脂溶性醌/挥发油 vs 水溶性酚酸/多糖/生物碱）的极性差异与配伍酸碱/增溶机理，设计先后分级提取或大孔树脂梯度洗脱联产路线。'
    }
  ];

  function getDesignTemplate(idOrLabel) {
    const raw = String(idOrLabel || '').trim();
    return DESIGN_TEMPLATES.find((t) => t.id === raw || t.label === raw || t.short === raw) || DESIGN_TEMPLATES[0];
  }

  const PROVIDERS = {
    qwen: { label: '三引擎混合智能通道', timeoutMs: 85000 }
  };

  let lastProvider = null;
  let lastProxyStatus = null;
  let sessionCacheHits = 0;

  function getRouteMode() {
    try {
      const m = String(localStorage.getItem(ROUTE_MODE_STORAGE_KEY) || 'auto').trim();
      if (['auto', 'zhipu', 'tencent', 'xunfei'].includes(m)) return m;
    } catch (_) {}
    return 'auto';
  }

  function setRouteMode(mode) {
    const clean = ['auto', 'zhipu', 'tencent', 'xunfei'].includes(mode) ? mode : 'auto';
    try { localStorage.setItem(ROUTE_MODE_STORAGE_KEY, clean); } catch (_) {}
    return clean;
  }

  function formatProviderLabel(actualProvider, actualModel, fellBack) {
    const base = PROVIDER_NAMES[actualProvider] || '云端混合通道';
    const shortModel = actualModel ? ` (${actualModel})` : '';
    const fbTag = fellBack ? ' · 自动兜底' : '';
    return `${base}${shortModel}${fbTag}`;
  }

  function readCustomProxy() {
    try {
      const val = String(localStorage.getItem(CUSTOM_PROXY_STORAGE_KEY) || '').trim();
      if (val && (/^https?:\/\//i.test(val) || val.startsWith('/'))) return val;
    } catch (_) {}
    return '';
  }

  function resolveProxyCandidates() {
    const list = [];
    const push = (url) => {
      if (url && !list.includes(url)) list.push(url);
    };

    const custom = readCustomProxy();
    if (custom) push(custom);

    let host = '';
    try {
      host = String(window.location.hostname || '').toLowerCase();
    } catch (_) {}

    const cfBase = String(CLOUDFLARE_SITE_URL || '').replace(/\/+$/, '');
    const cfBakBase = String(CLOUDFLARE_BACKUP_URL || '').replace(/\/+$/, '');
    const cfFull = cfBase ? `${cfBase}${CF_PROXY_PATH}` : '';
    const cfBakFull = cfBakBase ? `${cfBakBase}${CF_PROXY_PATH}` : '';

    if (host.endsWith('.pages.dev')) {
      push(CF_PROXY_PATH);
      if (cfFull) push(cfFull);
      if (cfBakFull) push(cfBakFull);
    } else if (!host || host === 'localhost' || host === '127.0.0.1' || host.endsWith('.github.io')) {
      if (cfFull) push(cfFull);
      if (cfBakFull) push(cfBakFull);
    } else {
      push(CF_PROXY_PATH);
      if (cfFull) push(cfFull);
      if (cfBakFull) push(cfBakFull);
    }
    return list;
  }

  function isProxyConfigured() {
    return resolveProxyCandidates().length > 0;
  }

  // 强容错 JSON 清洗与自动修复引擎
  function repairJsonText(raw) {
    let text = String(raw || '')
      .replace(/^\uFEFF/, '')
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim();

    const first = text.indexOf('{');
    if (first === -1) return text;
    const last = text.lastIndexOf('}');
    text = last > first ? text.slice(first, last + 1) : text.slice(first);

    try {
      JSON.parse(text);
      return text;
    } catch (_) {}

    let fixed = '';
    let inStr = false;
    let escaped = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inStr) {
        if (escaped) {
          fixed += ch;
          escaped = false;
        } else if (ch === '\\') {
          fixed += ch;
          escaped = true;
        } else if (ch === '"') {
          fixed += ch;
          inStr = false;
        } else if (ch === '\n') {
          fixed += '\\n';
        } else if (ch === '\r') {
          fixed += '';
        } else if (ch === '\t') {
          fixed += '\\t';
        } else {
          fixed += ch;
        }
      } else {
        if (ch === '"') inStr = true;
        fixed += ch;
      }
    }

    fixed = fixed
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

    try {
      JSON.parse(fixed);
      return fixed;
    } catch (_) {}

    const stack = [];
    let sInStr = false;
    let sEsc = false;
    for (let i = 0; i < fixed.length; i++) {
      const ch = fixed[i];
      if (sInStr) {
        if (sEsc) sEsc = false;
        else if (ch === '\\') sEsc = true;
        else if (ch === '"') sInStr = false;
      } else {
        if (ch === '"') sInStr = true;
        else if (ch === '{') stack.push('}');
        else if (ch === '[') stack.push(']');
        else if (ch === '}' || ch === ']') {
          if (stack.length && stack[stack.length - 1] === ch) stack.pop();
        }
      }
    }
    if (sInStr) fixed += '"';
    fixed = fixed.replace(/,\s*$/, '').replace(/:\s*$/, ': ""');
    while (stack.length) {
      fixed = fixed.replace(/,\s*$/, '');
      fixed += stack.pop();
    }
    fixed = fixed.replace(/,\s*([}\]])/g, '$1');
    return fixed;
  }

  function cleanJsonText(raw) {
    return repairJsonText(raw);
  }

  function normalizeMessages(messages) {
    const safe = Array.isArray(messages) ? messages.filter((item) => item && typeof item.content === 'string') : [];
    if (!safe.length || safe[0].role !== 'system') {
      safe.unshift({ role: 'system', content: '你是本草智研的中药化学实验助教。回答严谨、简洁，不编造标准或文献。' });
    }
    return safe.map((item) => ({ role: item.role || 'user', content: item.content.slice(0, 24000) }));
  }

  function hashKey(messages, expectJson, routeMode) {
    const raw = `${routeMode}:${expectJson ? 'J' : 'T'}:` + messages.map((m) => `${m.role}:${m.content.slice(0, 800)}`).join('|');
    let h = 2166136261;
    for (let i = 0; i < raw.length; i++) {
      h ^= raw.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return 'k_' + (h >>> 0).toString(36) + '_' + raw.length;
  }

  function readCacheMap() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function writeCacheMap(map) {
    try {
      const entries = Object.entries(map)
        .filter(([, v]) => v && typeof v.ts === 'number' && Date.now() - v.ts < CACHE_TTL_MS)
        .sort((a, b) => b[1].ts - a[1].ts)
        .slice(0, MAX_CACHE_ENTRIES);
      localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
    } catch (_) {}
  }

  function getCachedResponse(key) {
    const map = readCacheMap();
    const item = map[key];
    if (item && typeof item.content === 'string' && Date.now() - item.ts < CACHE_TTL_MS) {
      return item;
    }
    return null;
  }

  function setCachedResponse(key, content, label) {
    if (!content || content.length > 48000) return;
    const map = readCacheMap();
    map[key] = { content, label: label || '', ts: Date.now() };
    writeCacheMap(map);
  }

  function clearCache() {
    try { localStorage.removeItem(CACHE_KEY); } catch (_) {}
    sessionCacheHits = 0;
  }

  function getCacheStats() {
    const map = readCacheMap();
    return { entries: Object.keys(map).length, hits: sessionCacheHits };
  }

  function assertUsableContent(content, expectJson) {
    if (!content || !content.trim()) throw new Error('模型返回内容为空');
    if (expectJson) {
      const repaired = repairJsonText(content);
      JSON.parse(repaired);
      return repaired;
    }
    return content;
  }

  async function readSseStream(response, onProgress) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let content = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === '[DONE]') continue;
        try {
          const parsed = JSON.parse(payload);
          if (parsed?.error?.message) {
            throw new Error(parsed.error.message);
          }
          const delta = parsed?.choices?.[0]?.delta?.content;
          if (typeof delta === 'string' && delta) {
            content += delta;
            onProgress?.(content.length, content);
          }
        } catch (err) {
          if (err && err.message && !String(err.message).includes('JSON')) throw err;
        }
      }
    }
    return content;
  }

  async function callSingleProxy(proxyUrl, messages, expectJson, signal, onProgress, opts = {}) {
    const wantStream = opts.stream !== false;
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        routeMode: opts.routeMode || getRouteMode(),
        strictProvider: opts.strictProvider === true,
        messages,
        stream: wantStream,
        temperature: expectJson ? 0.2 : 0.55,
        response_format: expectJson ? { type: 'json_object' } : undefined,
        max_tokens: opts.maxTokens || (expectJson ? 4096 : 1600)
      }),
      signal
    });
    const actualProvider = response.headers.get('x-actual-provider') || 'zhipu';
    const actualModel = response.headers.get('x-actual-model') || '';
    const fellBack = response.headers.get('x-fallback') === 'true';

    if (!response.ok) {
      const detail = (await response.text().catch(() => '')).slice(0, 180);
      throw new Error(`HTTP ${response.status}${detail ? `：${detail}` : ''}`);
    }

    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    let content = '';
    if (contentType.includes('text/event-stream') && response.body) {
      content = await readSseStream(response, onProgress);
    } else {
      const data = await response.json();
      if (data?.error?.message) throw new Error(data.error.message);
      content = data?.choices?.[0]?.message?.content || '';
      onProgress?.(content.length, content);
    }
    return {
      content: assertUsableContent(content, expectJson),
      actualProvider,
      actualModel,
      fellBack,
      label: formatProviderLabel(actualProvider, actualModel, fellBack)
    };
  }

  async function callProxy(messages, expectJson, signal, onProgress, opts = {}) {
    const candidates = resolveProxyCandidates();
    if (!candidates.length) {
      throw new Error('未检测到可用智能代理通道，请在 Cloudflare Pages 配置 AI 密钥');
    }
    let firstError = null;
    for (let i = 0; i < candidates.length; i++) {
      const url = candidates[i];
      try {
        return await callSingleProxy(url, messages, expectJson, signal, onProgress, opts);
      } catch (err) {
        if (signal?.aborted) throw err;
        if (!firstError) firstError = err;
        if (i === candidates.length - 1) throw firstError;
      }
    }
    throw firstError || new Error('智能通道暂不可用');
  }

  async function runAttempt(provider, messages, expectJson, externalSignal, onProgress, opts = {}) {
    const controller = new AbortController();
    const abortFromOutside = () => controller.abort(externalSignal?.reason);
    if (externalSignal) {
      if (externalSignal.aborted) abortFromOutside();
      else externalSignal.addEventListener('abort', abortFromOutside, { once: true });
    }
    const timer = setTimeout(
      () => controller.abort(new DOMException('AI 请求超时', 'TimeoutError')),
      opts.timeoutMs || PROVIDERS[provider].timeoutMs
    );
    try {
      const res = await callProxy(messages, expectJson, controller.signal, onProgress, opts);
      return {
        content: res.content,
        provider: res.actualProvider || provider,
        model: res.actualModel,
        fellBack: res.fellBack,
        label: res.label || PROVIDERS[provider].label
      };
    } finally {
      clearTimeout(timer);
      externalSignal?.removeEventListener('abort', abortFromOutside);
    }
  }

  async function getProxyStatus() {
    const candidates = resolveProxyCandidates();
    for (const url of candidates) {
      try {
        const res = await fetch(url, { method: 'GET', cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          lastProxyStatus = data;
          return data;
        }
      } catch (_) {}
    }
    return null;
  }

  async function complete({ messages, expectJson = false, useCache = true, routeMode, onProvider, onProgress, signal } = {}) {
    const normalized = normalizeMessages(messages);
    const provider = 'qwen';
    const activeRouteMode = routeMode || getRouteMode();
    const cKey = hashKey(normalized, expectJson, activeRouteMode);

    if (useCache) {
      const cached = getCachedResponse(cKey);
      if (cached) {
        sessionCacheHits += 1;
        onProgress?.(cached.content.length, cached.content);
        const result = {
          content: cached.content,
          provider,
          label: `${cached.label || '三引擎混编'}（本地缓存·0消耗）`,
          fromCache: true
        };
        lastProvider = result;
        return result;
      }
    }

    try {
      const pendingLabel = PROVIDER_NAMES[activeRouteMode] || PROVIDERS[provider].label;
      onProvider?.(provider, pendingLabel);
      const result = await runAttempt(provider, normalized, expectJson, signal, onProgress, { routeMode: activeRouteMode });
      onProvider?.(result.provider, result.label);
      if (useCache) setCachedResponse(cKey, result.content, result.label);
      lastProvider = result;
      return result;
    } catch (error) {
      if (signal?.aborted) throw error;
      if (expectJson && /JSON|Expected|Unexpected|parse/i.test(String(error?.message || ''))) {
        try {
          const retryMsgs = [
            ...normalized,
            { role: 'user', content: '请严格仅输出一个完整闭合的合法 JSON 对象，字段简洁完整，不要有任何多余说明文字或未闭合括号。' }
          ];
          const retryRes = await runAttempt(provider, retryMsgs, true, signal, onProgress, {
            routeMode: activeRouteMode,
            stream: false
          });
          if (useCache) setCachedResponse(cKey, retryRes.content, retryRes.label);
          lastProvider = retryRes;
          return retryRes;
        } catch (_) {}
      }
      throw new Error(`${PROVIDER_NAMES[activeRouteMode] || PROVIDERS[provider].label}: ${error?.message || '未知错误'}`);
    }
  }

  async function testProviders() {
    const messages = normalizeMessages([
      { role: 'system', content: '你是本草智研服务连通性检查器，只返回用户要求的短句。' },
      { role: 'user', content: '请仅回复“连通成功”四个字。' }
    ]);

    const status = await getProxyStatus();
    const providerIds = ['zhipu', 'tencent', 'xunfei'];
    const checks = await Promise.all(
      providerIds.map(async (pid) => {
        const info = status?.providers?.[pid];
        if (status && info && !info.configured) {
          return { provider: pid, ok: false, unconfigured: true, label: PROVIDER_NAMES[pid], error: '未配置密钥' };
        }
        const t0 = Date.now();
        try {
          const res = await runAttempt('qwen', messages, false, undefined, undefined, {
            routeMode: pid,
            strictProvider: true,
            stream: false,
            maxTokens: 64,
            timeoutMs: 16000
          });
          const ms = Date.now() - t0;
          return {
            provider: pid,
            ok: true,
            label: res.label || PROVIDER_NAMES[pid],
            reply: `${res.content.trim().slice(0, 28)} (${ms}ms)`
          };
        } catch (err) {
          return {
            provider: pid,
            ok: false,
            label: PROVIDER_NAMES[pid],
            error: String(err?.message || '连接异常').slice(0, 90)
          };
        }
      })
    );
    return checks;
  }

  function getCapabilities() {
    return {
      qwen: isProxyConfigured(),
      hybrid: true,
      routeMode: getRouteMode(),
      proxyStatus: lastProxyStatus,
      workbuddy: false,
      local: true,
      lastProvider,
      cache: getCacheStats()
    };
  }

  function setCustomProxyUrl(url) {
    try {
      const clean = String(url || '').trim();
      if (!clean) localStorage.removeItem(CUSTOM_PROXY_STORAGE_KEY);
      else localStorage.setItem(CUSTOM_PROXY_STORAGE_KEY, clean);
    } catch (_) {}
  }

  window.TCMCloudAI = Object.freeze({
    complete,
    testProviders,
    getProxyStatus,
    getRouteMode,
    setRouteMode,
    DESIGN_TEMPLATES,
    getDesignTemplate,
    cleanJsonText,
    repairJsonText,
    getCapabilities,
    clearCache,
    getCacheStats,
    getProxyUrls: resolveProxyCandidates,
    setCustomProxyUrl
  });
})();
