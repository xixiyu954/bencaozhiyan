(() => {
  'use strict';

  // 若在 Netlify 域名打开，会自动走同源 /.netlify/functions/ai-proxy（无需修改）
  // 若希望 GitHub Pages 也能调用，请把下面替换成你的 Netlify 站点域名（例如 https://tcm-lab.netlify.app）
  const NETLIFY_SITE_URL = 'https://YOUR-SITE.netlify.app';
  const PROXY_PATH = '/.netlify/functions/ai-proxy';
  const DEFAULT_MODEL = 'glm-4.7-flash';
  const PROVIDERS = {
    qwen: { label: '智谱 GLM-4.7-Flash 免费通道', timeoutMs: 45000 }
  };

  let lastProvider = null;

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
    return String(raw || '')
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/, '')
      .trim();
  }

  function normalizeMessages(messages) {
    const safe = Array.isArray(messages) ? messages.filter((item) => item && typeof item.content === 'string') : [];
    if (!safe.length || safe[0].role !== 'system') {
      safe.unshift({ role: 'system', content: '你是本草智研的中药化学实验助教。回答严谨、简洁，不编造标准或文献。' });
    }
    return safe.map((item) => ({ role: item.role || 'user', content: item.content.slice(0, 24000) }));
  }

  function assertUsableContent(content, expectJson) {
    if (!content || !content.trim()) throw new Error('模型返回内容为空');
    if (expectJson) JSON.parse(cleanJsonText(content));
    return content;
  }

  async function callProxy(messages, expectJson, signal) {
    const proxyUrl = resolveProxyUrl();
    if (!proxyUrl) {
      throw new Error('请先在 cloud-ai.js 中将 NETLIFY_SITE_URL 替换为你的 Netlify 站点域名，或直接通过 Netlify 域名访问');
    }
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages,
        temperature: expectJson ? 0.35 : 0.65,
        response_format: expectJson ? { type: 'json_object' } : undefined,
        max_tokens: expectJson ? 5000 : 1800
      }),
      signal
    });
    if (!response.ok) {
      const detail = (await response.text().catch(() => '')).slice(0, 160);
      throw new Error(`免费通道 HTTP ${response.status}${detail ? `：${detail}` : ''}`);
    }
    const data = await response.json();
    return assertUsableContent(data?.choices?.[0]?.message?.content || '', expectJson);
  }

  async function runAttempt(provider, messages, expectJson, externalSignal) {
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
      const content = await callProxy(messages, expectJson, controller.signal);
      return { content, provider, label: PROVIDERS[provider].label };
    } finally {
      clearTimeout(timer);
      externalSignal?.removeEventListener('abort', abortFromOutside);
    }
  }

  async function complete({ messages, expectJson = false, onProvider, signal } = {}) {
    const normalized = normalizeMessages(messages);
    const provider = 'qwen';
    try {
      onProvider?.(provider, PROVIDERS[provider].label);
      const result = await runAttempt(provider, normalized, expectJson, signal);
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
      lastProvider
    };
  }

  window.TCMCloudAI = Object.freeze({ complete, testProviders, cleanJsonText, getCapabilities });
})();