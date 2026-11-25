// 放置路径：GitHub 仓库中的 functions/api/ai-proxy.js
// Cloudflare Pages Functions 三引擎混合 AI 代理（智谱 GLM + 腾讯云 TokenHub + 讯飞星辰 MaaS）
// 所有 API 密钥均通过 Cloudflare Pages 加密环境变量注入，严禁硬编码到前端或仓库：
//   - ZHIPU_API_KEY（主引擎：智谱 GLM，默认 glm-4-flash-250414 / 备选 glm-4.7-flash）
//   - TENCENT_API_KEY（强推理引擎：腾讯云 TokenHub，默认 hy4-flash / 备选 deepseek-v4.1-flash；可选 TENCENT_BASE_URL / TENCENT_MODEL）
//   - XUNFEI_API_KEY（极速辅助引擎：讯飞星辰 MaaS，默认 spark-x2.5-1.7b；可选 XUNFEI_BASE_URL / XUNFEI_MODEL）

const ALLOWED_EXACT_ORIGINS = new Set([
  'https://xixiyu954.github.io'
]);

const ZHIPU_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const ZHIPU_DEFAULT_MODEL = 'glm-4-flash-250414';
const ZHIPU_FALLBACK_MODEL = 'glm-4.7-flash';

const XUNFEI_DEFAULT_URL = 'https://maas-api.cn-huabei-1.xf-yun.com/v2/chat/completions';
const XUNFEI_DEFAULT_MODEL = 'spark-x2.5-1.7b';

const TENCENT_DEFAULT_URL = 'https://tokenhub.tencentmaas.com/v1/chat/completions';
const TENCENT_DEFAULT_MODEL = 'hy4-flash';
const TENCENT_FALLBACK_MODEL = 'deepseek-v4.1-flash';

const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 24;
const rateBuckets = new Map();

function normalizeChatUrl(rawUrl, fallbackUrl) {
  const clean = String(rawUrl || '').trim().replace(/\/+$/, '');
  if (!clean) return fallbackUrl;
  if (/\/chat\/completions$/i.test(clean)) return clean;
  if (/\/v\d+$/i.test(clean)) return `${clean}/chat/completions`;
  return clean;
}

function isAllowedOrigin(origin, requestUrl) {
  if (!origin) return false;
  if (ALLOWED_EXACT_ORIGINS.has(origin)) return true;
  try {
    const parsed = new URL(origin);
    if (requestUrl) {
      const reqParsed = new URL(requestUrl);
      if (parsed.origin === reqParsed.origin) return true;
    }
    if (parsed.protocol === 'https:' && parsed.hostname.endsWith('.pages.dev')) {
      return true;
    }
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') return true;
  } catch (_) {
    return false;
  }
  return false;
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Expose-Headers': 'X-Actual-Provider, X-Actual-Model, X-Fallback, X-Tried-Providers, X-Proxy-Platform',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

function json(data, status, origin, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(origin),
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Proxy-Platform': 'cloudflare-pages',
      ...extraHeaders
    }
  });
}

function allowRequest(ip) {
  const now = Date.now();
  const current = rateBuckets.get(ip);
  if (!current || now - current.start >= RATE_WINDOW_MS) {
    rateBuckets.set(ip, { start: now, count: 1 });
    return true;
  }
  current.count += 1;
  if (rateBuckets.size > 5000) {
    for (const [key, value] of rateBuckets) {
      if (now - value.start >= RATE_WINDOW_MS) rateBuckets.delete(key);
    }
  }
  return current.count <= RATE_LIMIT;
}

function validMessages(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 14) return false;
  let total = 0;
  for (const message of value) {
    if (
      !message ||
      typeof message !== 'object' ||
      !['system', 'user', 'assistant'].includes(message.role || '') ||
      typeof message.content !== 'string'
    ) {
      return false;
    }
    if (message.content.length > 24_000) return false;
    total += message.content.length;
  }
  return total <= 36_000;
}

function getProviderConfigs(env) {
  const e = env || {};
  return {
    zhipu: {
      id: 'zhipu',
      name: '智谱 GLM',
      apiKey: String(e.ZHIPU_API_KEY || '').trim(),
      url: ZHIPU_URL,
      model: String(e.ZHIPU_MODEL || ZHIPU_DEFAULT_MODEL).trim(),
      fallbackModel: String(e.ZHIPU_FALLBACK_MODEL || ZHIPU_FALLBACK_MODEL).trim()
    },
    xunfei: {
      id: 'xunfei',
      name: '讯飞星辰 MaaS',
      apiKey: String(e.XUNFEI_API_KEY || '').trim(),
      url: normalizeChatUrl(e.XUNFEI_BASE_URL, XUNFEI_DEFAULT_URL),
      model: String(e.XUNFEI_MODEL || XUNFEI_DEFAULT_MODEL).trim(),
      fallbackModel: ''
    },
    tencent: {
      id: 'tencent',
      name: '腾讯云 TokenHub',
      apiKey: String(e.TENCENT_API_KEY || '').trim(),
      url: normalizeChatUrl(e.TENCENT_BASE_URL, TENCENT_DEFAULT_URL),
      model: String(e.TENCENT_MODEL || TENCENT_DEFAULT_MODEL).trim(),
      fallbackModel: String(e.TENCENT_FALLBACK_MODEL || TENCENT_FALLBACK_MODEL).trim()
    }
  };
}

function buildRoutePlan(configs, { routeMode, expectJson, totalChars, strictProvider }) {
  const candidates = [];
  const push = (providerId, modelOverride) => {
    const cfg = configs[providerId];
    if (!cfg || !cfg.apiKey) return;
    const model = modelOverride || cfg.model;
    if (!model) return;
    if (candidates.some((c) => c.provider === providerId && c.model === model)) return;
    candidates.push({
      provider: providerId,
      name: cfg.name,
      url: cfg.url,
      apiKey: cfg.apiKey,
      model
    });
  };

  const mode = ['auto', 'zhipu', 'tencent', 'xunfei'].includes(routeMode) ? routeMode : 'auto';

  if (strictProvider && mode !== 'auto') {
    push(mode);
    return candidates;
  }

  if (mode === 'xunfei') {
    push('xunfei');
    push('zhipu', configs.zhipu.model);
    push('tencent', configs.tencent.model);
    push('tencent', configs.tencent.fallbackModel);
    push('zhipu', configs.zhipu.fallbackModel);
    return candidates;
  }

  if (mode === 'tencent') {
    push('tencent', configs.tencent.model);
    if (configs.tencent.fallbackModel) push('tencent', configs.tencent.fallbackModel);
    push('zhipu', configs.zhipu.model);
    push('xunfei');
    push('zhipu', configs.zhipu.fallbackModel);
    return candidates;
  }

  if (mode === 'zhipu') {
    push('zhipu', configs.zhipu.model);
    push('zhipu', configs.zhipu.fallbackModel);
    push('tencent', configs.tencent.model);
    push('xunfei');
    return candidates;
  }

  // auto 场景智能混编：
  // - 结构化 JSON / 长文方案设计：优先智谱主模型 -> 腾讯云混元4/DeepSeek-V4.1 -> 智谱备选 -> 讯飞星辰
  // - 短对话 / 3.1 AI 导师即时答疑：优先智谱主模型 -> 腾讯云混元4-Flash -> 讯飞星辰 -> 智谱备选
  if (expectJson || totalChars > 900) {
    push('zhipu', configs.zhipu.model);
    push('tencent', configs.tencent.fallbackModel); // DeepSeek-V4.1-Flash 强于结构化 JSON 与推理
    push('tencent', configs.tencent.model);
    push('zhipu', configs.zhipu.fallbackModel);
    push('xunfei');
  } else {
    push('zhipu', configs.zhipu.model);
    push('tencent', configs.tencent.model);
    push('xunfei');
    push('zhipu', configs.zhipu.fallbackModel);
  }
  return candidates;
}

function buildPayload(candidate, messages, expectJson, body, wantStream) {
  const maxTokens = Math.min(4096, Math.max(128, Number(body.max_tokens) || (expectJson ? 3200 : 1800)));
  const payload = {
    model: candidate.model,
    messages,
    stream: wantStream,
    temperature: expectJson ? 0.25 : 0.6,
    max_tokens: maxTokens
  };

  if (expectJson) {
    payload.response_format = { type: 'json_object' };
  }

  if (candidate.provider === 'zhipu' && candidate.model === 'glm-4.7-flash') {
    payload.thinking = { type: 'disabled' };
  }

  if (candidate.provider === 'tencent') {
    // 腾讯云 TokenHub 的 hy4-flash / deepseek-v4.1-flash 须关闭隐藏思维链，确保极速且不截断 JSON
    payload.thinking = { type: 'disabled' };
  }

  if (candidate.provider === 'xunfei') {
    // 讯飞星辰 spark-x2.5 系列关闭隐藏思维链，确保快速稳定直出正文/JSON
    payload.enable_thinking = false;
    payload.thinking = { type: 'disabled' };
  }

  return payload;
}

function isFailoverWorthy(status, text) {
  if ([401, 402, 403, 404, 408, 429].includes(status) || status >= 500) return true;
  if (status >= 200 && status < 300 && text) {
    try {
      const data = JSON.parse(text);
      const code = String(data?.error?.code || '');
      if (['1305', '1302', '1303', '11200', 'invalid_api_key'].includes(code)) return true;
      if (data?.error?.message) return true;
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content === 'string' && !content.trim()) return true;
    } catch (_) {}
  }
  return false;
}

async function fetchCandidate(candidate, messages, expectJson, body, wantStream, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const payload = buildPayload(candidate, messages, expectJson, body, wantStream);
    const res = await fetch(candidate.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidate.apiKey}`
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    return { response: res, clear: () => clearTimeout(timer) };
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

export async function onRequest(context) {
  const { request, env } = context;
  const origin = request.headers.get('origin') || '';
  const configs = getProviderConfigs(env);

  // GET /api/ai-proxy：返回三引擎配置状态（绝不泄露任何密钥）
  if (request.method === 'GET') {
    const allowOrigin = isAllowedOrigin(origin, request.url) ? origin : '*';
    const providers = {
      zhipu: { configured: Boolean(configs.zhipu.apiKey), name: configs.zhipu.name, model: configs.zhipu.model },
      tencent: {
        configured: Boolean(configs.tencent.apiKey),
        name: configs.tencent.name,
        model: configs.tencent.model,
        fallbackModel: configs.tencent.fallbackModel
      },
      xunfei: { configured: Boolean(configs.xunfei.apiKey), name: configs.xunfei.name, model: configs.xunfei.model }
    };
    const activeProviders = Object.keys(providers).filter((k) => providers[k].configured);
    return json(
      {
        ok: true,
        service: 'tcm-chemistry-lab-ai-proxy',
        platform: 'cloudflare-pages-functions',
        hybridMode: true,
        provider: activeProviders.join('+') || 'none',
        activeCount: activeProviders.length,
        providers,
        streaming: true,
        configured: activeProviders.length > 0
      },
      200,
      allowOrigin
    );
  }

  if (!isAllowedOrigin(origin, request.url)) {
    return json({ error: { message: 'Origin not allowed' } }, 403, 'null');
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (request.method !== 'POST') {
    return json({ error: { message: 'Method Not Allowed' } }, 405, origin);
  }

  const forwardedFor = request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || '';
  const ip = forwardedFor.split(',')[0].trim() || 'unknown';
  if (!allowRequest(ip)) {
    return json({ error: { message: 'Too many requests, please retry later' } }, 429, origin);
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 60_000) {
    return json({ error: { message: 'Request too large' } }, 413, origin);
  }

  let body;
  try {
    body = await request.json();
  } catch (_) {
    return json({ error: { message: 'Invalid JSON body' } }, 400, origin);
  }

  if (!body || !validMessages(body.messages)) {
    return json({ error: { message: 'Invalid messages' } }, 400, origin);
  }

  const expectJson = body.response_format?.type === 'json_object';
  const wantStream = body.stream === true;
  const routeMode = typeof body.routeMode === 'string' ? body.routeMode : 'auto';
  const strictProvider = body.strictProvider === true;
  const totalChars = body.messages.reduce((sum, m) => sum + (m.content ? m.content.length : 0), 0);

  const plan = buildRoutePlan(configs, { routeMode, expectJson, totalChars, strictProvider });
  if (!plan.length) {
    return json(
      { error: { message: 'No AI provider API key is configured in Cloudflare Pages' } },
      503,
      origin
    );
  }

  const tried = [];
  let lastErrorStatus = 502;
  let lastErrorText = '';
  let lastContentType = 'application/json; charset=utf-8';

  for (let idx = 0; idx < plan.length; idx++) {
    const candidate = plan[idx];
    const isLast = idx === plan.length - 1;
    const fellBack = idx > 0;
    tried.push(`${candidate.provider}:${candidate.model}`);

    const perAttemptTimeout = wantStream
      ? (isLast ? 48_000 : 18_000)
      : (isLast ? 22_000 : 12_000);

    try {
      const { response: upstream, clear } = await fetchCandidate(
        candidate,
        body.messages,
        expectJson,
        body,
        wantStream,
        perAttemptTimeout
      );

      if (wantStream) {
        if (upstream.ok && upstream.body) {
          clear();
          return new Response(upstream.body, {
            status: 200,
            headers: {
              ...corsHeaders(origin),
              'Content-Type': upstream.headers.get('content-type') || 'text/event-stream; charset=utf-8',
              'Cache-Control': 'no-cache, no-store',
              'X-Actual-Provider': candidate.provider,
              'X-Actual-Model': candidate.model,
              'X-Fallback': fellBack ? 'true' : 'false',
              'X-Tried-Providers': tried.join(','),
              'X-Proxy-Platform': 'cloudflare-pages'
            }
          });
        }

        const errText = await upstream.text().catch(() => '');
        clear();
        lastErrorStatus = upstream.status || 502;
        lastErrorText = errText;
        lastContentType = upstream.headers.get('content-type') || 'application/json; charset=utf-8';
        if (!isLast && isFailoverWorthy(upstream.status, errText)) {
          continue;
        }
        return new Response(errText || JSON.stringify({ error: { message: `Upstream HTTP ${upstream.status}` } }), {
          status: lastErrorStatus,
          headers: {
            ...corsHeaders(origin),
            'Content-Type': lastContentType,
            'Cache-Control': 'no-store',
            'X-Actual-Provider': candidate.provider,
            'X-Actual-Model': candidate.model,
            'X-Fallback': fellBack ? 'true' : 'false',
            'X-Tried-Providers': tried.join(','),
            'X-Proxy-Platform': 'cloudflare-pages'
          }
        });
      }

      const text = await upstream.text();
      clear();
      const status = upstream.status;
      const contentType = upstream.headers.get('content-type') || 'application/json; charset=utf-8';

      if (!isLast && isFailoverWorthy(status, text)) {
        lastErrorStatus = status || 502;
        lastErrorText = text;
        lastContentType = contentType;
        continue;
      }

      return new Response(text, {
        status,
        headers: {
          ...corsHeaders(origin),
          'Content-Type': contentType,
          'Cache-Control': 'no-store',
          'X-Actual-Provider': candidate.provider,
          'X-Actual-Model': candidate.model,
          'X-Fallback': fellBack ? 'true' : 'false',
          'X-Tried-Providers': tried.join(','),
          'X-Proxy-Platform': 'cloudflare-pages'
        }
      });
    } catch (error) {
      lastErrorStatus = error?.name === 'AbortError' ? 504 : 502;
      lastErrorText = JSON.stringify({
        error: { message: error?.name === 'AbortError' ? `${candidate.name} 请求超时` : `${candidate.name} 暂不可达` }
      });
      if (!isLast) continue;
    }
  }

  return new Response(lastErrorText || JSON.stringify({ error: { message: 'All upstream models unavailable' } }), {
    status: lastErrorStatus,
    headers: {
      ...corsHeaders(origin),
      'Content-Type': lastContentType,
      'Cache-Control': 'no-store',
      'X-Tried-Providers': tried.join(','),
      'X-Proxy-Platform': 'cloudflare-pages'
    }
  });
}
