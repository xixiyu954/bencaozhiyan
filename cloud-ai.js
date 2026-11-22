(() => {
  'use strict';

  // 若在 Netlify 域名打开，会自动走同源 /.netlify/functions/ai-proxy
  // 在 GitHub Pages 访问时走跨域代理地址
  const NETLIFY_SITE_URL = 'https://tcm-chemistry-lab.netlify.app';
  const PROXY_PATH = '/.netlify/functions/ai-proxy';
  const DEFAULT_MODEL = 'glm-4-flash-250414';
  const CACHE_KEY = 'tcm_ai_resp_cache_v1';
  const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 小时缓存，大幅降低重复请求 AI 消耗
  const MAX_CACHE_ENTRIES = 30;

  const PROVIDERS = {
    qwen: { label: '智谱 GLM 免费通道', timeoutMs: 85000 }
  };

  let lastProvider = null;
  let sessionCacheHits = 0;

  function resolveProxyUrl() {
    try {
      if (window.location.hostname.endsWith('.netlify.app')) {
        return PROXY_PATH;
      }
    } catch (_) {}
    const base = String(NETLIFY_SITE_URL || '').replace(/\/+$/, '');
    if (!base || base.includes('YOUR-SITE')) return '';
    return `${base}${PROXY_PATH}`;
  }

  function isProxyConfigured() {
    return Boolean(resolveProxyUrl());
  }

  function cleanJsonText(raw) {
    const text = String(raw || '')
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/, '')
      .trim();
    // 若模型在 JSON 前后偶发附加说明文字，自动截取最外层 {...}
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first !== -1 && last > first) {
      return text.slice(first, last + 1);
    }
    return text;
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
    if (expectJson) JSON.parse(cleanJsonText(content));
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

  async function callProxy(messages, expectJson, signal, onProgress) {
    const proxyUrl = resolveProxyUrl();
    if (!proxyUrl) {
      throw new Error('请先在 cloud-ai.js 中配置 NETLIFY_SITE_URL');
    }
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages,
        stream: true,
        temperature: expectJson ? 0.25 : 0.55,
        response_format: expectJson ? { type: 'json_object' } : undefined,
        max_tokens: expectJson ? 3000 : 1400
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

  window.TCMCloudAI = Object.freeze({ complete, testProviders, cleanJsonText, getCapabilities, clearCache, getCacheStats });
})();