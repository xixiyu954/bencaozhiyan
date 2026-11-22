(() => {
  'use strict';

  const publicConfig = Object.freeze({
    resourceId: 'wbcs_4nI7XYVCdQ1GI81bNgJUN4',
    endpoint: 'https://tcm-chemistry-lab.app.workbuddy.host',
    oauthRelayBaseUrl: 'https://www.workbuddy.cn/v2/as/genie-baas/oauth',
    publishableKey: 'wbpk_bRHPX7E0LSEYq1GLIB1pNn_cb424m7WNl7RRive78K4yoGPVUW1DC16'
  });
  const QWEN_PROXY_URL = 'https://tcm-qwen-proxy.chenovo495666.workers.dev/';
  const PROVIDERS = {
    qwen: { label: '通义千问公共通道', timeoutMs: 45000 },
    workbuddy: { label: 'WorkBuddy 备用模型', timeoutMs: 45000 }
  };

  let cloudClient = null;
  let modelListPromise = null;
  let lastProvider = null;

  function cleanJsonText(raw) {
    return String(raw || '')
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/, '')
      .trim();
  }

  function usableOnThisOrigin() {
    try {
      return window.location.origin === new URL(publicConfig.endpoint).origin;
    } catch (_) {
      return false;
    }
  }

  function getCloudClient() {
    if (!usableOnThisOrigin()) {
      throw new Error('当前站点未启用 WorkBuddy 备用通道');
    }
    if (!window.WorkBuddyCloud?.createWorkBuddyCloud) {
      throw new Error('WorkBuddy SDK 尚未加载');
    }
    if (!cloudClient) {
      cloudClient = window.WorkBuddyCloud.createWorkBuddyCloud({
        endpoint: publicConfig.endpoint,
        oauthRelayBaseUrl: publicConfig.oauthRelayBaseUrl,
        publishableKey: publicConfig.publishableKey
      });
    }
    return cloudClient;
  }

  async function getWorkBuddyModel() {
    const cloud = getCloudClient();
    if (!modelListPromise) {
      modelListPromise = cloud.llm.models.list().catch((error) => {
        modelListPromise = null;
        throw error;
      });
    }
    const models = await modelListPromise;
    if (!Array.isArray(models) || models.length === 0) {
      throw new Error('WorkBuddy 当前没有可用模型');
    }
    const model = models.find((item) => item && item.id && item.disabled !== true && item.enabled !== false);
    if (!model) throw new Error('WorkBuddy 模型均不可用');
    return model;
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

  async function callQwen(messages, expectJson, signal) {
    const response = await fetch(QWEN_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen3.7-plus',
        messages,
        temperature: expectJson ? 0.35 : 0.65,
        response_format: expectJson ? { type: 'json_object' } : undefined,
        max_tokens: expectJson ? 5000 : 1800
      }),
      signal
    });
    if (!response.ok) {
      const detail = (await response.text().catch(() => '')).slice(0, 160);
      throw new Error(`千问 HTTP ${response.status}${detail ? `：${detail}` : ''}`);
    }
    const data = await response.json();
    return assertUsableContent(data?.choices?.[0]?.message?.content || '', expectJson);
  }

  async function callWorkBuddy(messages, expectJson, signal) {
    const cloud = getCloudClient();
    const model = await getWorkBuddyModel();
    let answer = '';
    const options = {
      model: model.id,
      messages,
      stream: true,
      temperature: expectJson ? 0.35 : 0.65,
      signal
    };
    if (expectJson) options.response_format = { type: 'json_object' };
    for await (const chunk of cloud.llm.chat.completions.create(options)) {
      const delta = chunk?.choices?.[0]?.delta?.content;
      if (delta) answer += delta;
    }
    assertUsableContent(answer, expectJson);
    return { content: answer, modelName: model.name || model.id };
  }

  async function runAttempt(provider, messages, expectJson, externalSignal) {
    const controller = new AbortController();
    const abortFromOutside = () => controller.abort(externalSignal?.reason);
    if (externalSignal) {
      if (externalSignal.aborted) abortFromOutside();
      else externalSignal.addEventListener('abort', abortFromOutside, { once: true });
    }
    const timer = setTimeout(() => controller.abort(new DOMException('AI 请求超时', 'TimeoutError')), PROVIDERS[provider].timeoutMs);
    try {
      if (provider === 'qwen') {
        const content = await callQwen(messages, expectJson, controller.signal);
        return { content, provider, label: PROVIDERS[provider].label };
      }
      const result = await callWorkBuddy(messages, expectJson, controller.signal);
      return { content: result.content, provider, label: `${PROVIDERS[provider].label} · ${result.modelName}` };
    } finally {
      clearTimeout(timer);
      externalSignal?.removeEventListener('abort', abortFromOutside);
    }
  }

  async function complete({ messages, expectJson = false, onProvider, signal } = {}) {
    const normalized = normalizeMessages(messages);
    const providers = ['qwen'];
    if (usableOnThisOrigin()) providers.push('workbuddy');
    const errors = [];

    for (const provider of providers) {
      try {
        onProvider?.(provider, PROVIDERS[provider].label);
        const result = await runAttempt(provider, normalized, expectJson, signal);
        lastProvider = result;
        return result;
      } catch (error) {
        if (signal?.aborted) throw error;
        errors.push(`${PROVIDERS[provider].label}: ${error?.message || '未知错误'}`);
      }
    }
    throw new Error(errors.join('；') || '公共 AI 暂不可用');
  }

  function getCapabilities() {
    return {
      qwen: Boolean(QWEN_PROXY_URL),
      workbuddy: usableOnThisOrigin(),
      local: true,
      lastProvider
    };
  }

  window.TCMCloudAI = Object.freeze({ complete, cleanJsonText, getCapabilities });
})();
