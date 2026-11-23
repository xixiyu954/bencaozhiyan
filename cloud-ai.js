(() => {
  'use strict';

  // 多平台智能代理路由：
  // 1. Cloudflare Pages (*.pages.dev / 自定义域名) -> 自动走同源 /api/ai-proxy（每日 10 万次免费）
  // 2. Netlify (*.netlify.app) -> 自动走同源 /.netlify/functions/ai-proxy
  // 3. GitHub Pages (xixiyu954.github.io) -> 自动在 Netlify 与 Cloudflare Pages 通道间弹性容错切换
  const NETLIFY_SITE_URL = 'https://tcm-chemistry-lab.netlify.app';
  const CLOUDFLARE_SITE_URL = 'https://bencaozhiyan-xixiyu.pages.dev';
  const CLOUDFLARE_BACKUP_URL = 'https://tcm-chemistry-lab.pages.dev';
  const NETLIFY_PROXY_PATH = '/.netlify/functions/ai-proxy';
  const CF_PROXY_PATH = '/api/ai-proxy';
  const CUSTOM_PROXY_STORAGE_KEY = 'tcm_custom_ai_proxy';
  const DEFAULT_MODEL = 'glm-4-flash-250414';
  const CACHE_KEY = 'tcm_ai_resp_cache_v2';
  const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
  const MAX_CACHE_ENTRIES = 30;

  const PROVIDERS = {
    qwen: { label: '智谱 GLM 免费通道', timeoutMs: 85000 }
  };

  let lastProvider = null;
  let sessionCacheHits = 0;

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
    const nfBase = String(NETLIFY_SITE_URL || '').replace(/\/+$/, '');
    const cfFull = cfBase ? `${cfBase}${CF_PROXY_PATH}` : '';
    const cfBakFull = cfBakBase ? `${cfBakBase}${CF_PROXY_PATH}` : '';
    const nfFull = nfBase && !nfBase.includes('YOUR-SITE') ? `${nfBase}${NETLIFY_PROXY_PATH}` : '';

    if (host.endsWith('.pages.dev')) {
      push(CF_PROXY_PATH);
    } else if (host.endsWith('.netlify.app')) {
      push(NETLIFY_PROXY_PATH);
      if (cfFull) push(cfFull);
    } else if (!host || host === 'localhost' || host === '127.0.0.1' || host.endsWith('.github.io')) {
      if (cfFull) push(cfFull);
      if (nfFull) push(nfFull);
      if (cfBakFull) push(cfBakFull);
    } else {
      // 自定义域名（如绑定在 Cloudflare Pages 上）优先同源 /api/ai-proxy，失败则回退
      push(CF_PROXY_PATH);
      if (cfFull) push(cfFull);
      if (nfFull) push(nfFull);
    }
    return list;
  }

  function resolveProxyUrl() {
    return resolveProxyCandidates()[0] || '';
  }

  function isProxyConfigured() {
    return resolveProxyCandidates().length > 0;
  }

  // 强容错 JSON 清洗与自动修复引擎：解决智谱 GLM 偶发截断缺 ']' / '}'、尾随逗号、字符串内未转义换行等问题
  function repairJsonText(raw) {
    let text = String(raw || '')
      .replace(/^\uFEFF/, '')
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim();

    const first = text.indexOf('{');
    if (first === -1) return text;
    const last = text.lastIndexOf('}');
    // 若模型输出完整，截取最外层 {...}；若因 token 截断缺少末尾 '}'，保留至结尾供自动补全
    text = last > first ? text.slice(first, last + 1) : text.slice(first);

    // 1. 尝试直接解析
    try {
      JSON.parse(text);
      return text;
    } catch (_) {}

    // 2. 修复字符串内部未转义的换行/制表符，并去除尾随逗号
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

    // 去除非法尾随逗号（,] 或 ,}）及非法控制符
    fixed = fixed
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

    try {
      JSON.parse(fixed);
      return fixed;
    } catch (_) {}

    // 3. 若发生输出截断或括号失衡（如 Expected ']'），用栈自动闭合未关闭的字符串、数组与对象
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

  function hashKey(messages, expectJson) {
    const raw = (expectJson ? 'J:' : 'T:') + messages.map((m) => `${m.role}:${m.content.slice(0, 800)}`).join('|');
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
      return item.content;
    }
    return null;
  }

  function setCachedResponse(key, content) {
    if (!content || content.length > 48000) return;
    const map = readCacheMap();
    map[key] = { content, ts: Date.now() };
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

  async function callSingleProxy(proxyUrl, messages, expectJson, signal, onProgress) {
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages,
        stream: true,
        temperature: expectJson ? 0.2 : 0.55,
        response_format: expectJson ? { type: 'json_object' } : undefined,
        max_tokens: expectJson ? 4096 : 1600
      }),
      signal
    });
    if (!response.ok) {
      const detail = (await response.text().catch(() => '')).slice(0, 160);
      throw new Error(`免费通道 HTTP ${response.status}${detail ? `：${detail}` : ''}`);
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
    return assertUsableContent(content, expectJson);
  }

  async function callProxy(messages, expectJson, signal, onProgress) {
    const candidates = resolveProxyCandidates();
    if (!candidates.length) {
      throw new Error('未检测到可用 AI 代理通道，请在 Cloudflare Pages 或 Netlify 配置 ZHIPU_API_KEY');
    }
    let firstError = null;
    for (let i = 0; i < candidates.length; i++) {
      const url = candidates[i];
      try {
        return await callSingleProxy(url, messages, expectJson, signal, onProgress);
      } catch (err) {
        if (signal?.aborted) throw err;
        if (!firstError) firstError = err;
        // 若是最后一个候选通道则抛出首个主通道错误，便于定位
        if (i === candidates.length - 1) throw firstError;
      }
    }
    throw firstError || new Error('免费通道暂不可用');
  }

  async function runAttempt(provider, messages, expectJson, externalSignal, onProgress) {
    const controller = new AbortController();
    const abortFromOutside = () => controller.abort(externalSignal?.reason);
    if (externalSignal) {
      if (externalSignal.aborted) abortFromOutside();
      else externalSignal.addEventListener('abort', abortFromOutside, { once: true });
    }
    const timer = setTimeout(
      () => controller.abort(new DOMException('AI 请求超时', 'TimeoutError')),
      PROVIDERS[provider].timeoutMs
    );
    try {
      const content = await callProxy(messages, expectJson, controller.signal, onProgress);
      return { content, provider, label: PROVIDERS[provider].label };
    } finally {
      clearTimeout(timer);
      externalSignal?.removeEventListener('abort', abortFromOutside);
    }
  }

  async function complete({ messages, expectJson = false, useCache = true, onProvider, onProgress, signal } = {}) {
    const normalized = normalizeMessages(messages);
    const provider = 'qwen';
    const cKey = hashKey(normalized, expectJson);

    if (useCache) {
      const cached = getCachedResponse(cKey);
      if (cached) {
        sessionCacheHits += 1;
        onProgress?.(cached.length, cached);
        const result = { content: cached, provider, label: '智谱 GLM（本地缓存·0消耗）', fromCache: true };
        lastProvider = result;
        return result;
      }
    }

    try {
      onProvider?.(provider, PROVIDERS[provider].label);
      const result = await runAttempt(provider, normalized, expectJson, signal, onProgress);
      if (useCache) setCachedResponse(cKey, result.content);
      lastProvider = result;
      return result;
    } catch (error) {
      if (signal?.aborted) throw error;
      // 若首次因 JSON 格式异常失败，自动用非流式精简重试 1 次
      if (expectJson && /JSON|Expected|Unexpected|parse/i.test(String(error?.message || ''))) {
        try {
          const retryMsgs = [
            ...normalized,
            { role: 'user', content: '请严格仅输出一个完整闭合的合法 JSON 对象，字段简洁完整，不要有任何多余说明文字或未闭合括号。' }
          ];
          const retryRes = await runAttempt(provider, retryMsgs, true, signal, onProgress);
          if (useCache) setCachedResponse(cKey, retryRes.content);
          lastProvider = retryRes;
          return retryRes;
        } catch (_) {}
      }
      throw new Error(`${PROVIDERS[provider].label}: ${error?.message || '未知错误'}`);
    }
  }

  async function testProviders() {
    const messages = normalizeMessages([
      { role: 'system', content: '你是本草智研服务连通性检查器，只返回用户要求的短句。' },
      { role: 'user', content: '请仅回复“连通成功”四个字。' }
    ]);
    const provider = 'qwen';
    try {
      const result = await runAttempt(provider, messages, false);
      return [{ provider, ok: true, label: result.label, reply: result.content.slice(0, 40) }];
    } catch (error) {
      return [{ provider, ok: false, label: PROVIDERS[provider].label, error: error?.message || '未知错误' }];
    }
  }

  function getCapabilities() {
    return {
      qwen: isProxyConfigured(),
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
    cleanJsonText,
    repairJsonText,
    getCapabilities,
    clearCache,
    getCacheStats,
    getProxyUrls: resolveProxyCandidates,
    setCustomProxyUrl
  });
})();