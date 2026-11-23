// 放置路径：GitHub 仓库中的 functions/api/ai-proxy.js
// Cloudflare Pages Functions 智谱 GLM 流式代理（每日 100,000 次免费请求）
// 部署到 Cloudflare Pages 后，只需在 Settings -> Environment variables 添加 ZHIPU_API_KEY 即可生效。

const ALLOWED_EXACT_ORIGINS = new Set([
  'https://xixiyu954.github.io'
]);

const ALLOWED_MODELS = new Set([
  'glm-4-flash-250414',
  'glm-4.7-flash'
]);

const DEFAULT_MODEL = 'glm-4-flash-250414';
const FALLBACK_MODEL = 'glm-4.7-flash';
const UPSTREAM_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 20;
const rateBuckets = new Map();

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
    'Access-Control-Expose-Headers': 'X-Actual-Model, X-Fallback, X-Proxy-Platform',
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
  if (!Array.isArray(value) || value.length < 1 || value.length > 12) return false;
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

function buildPayload(model, messages, expectJson, body, wantStream) {
  const payload = {
    model,
    messages,
    stream: wantStream,
    temperature: expectJson ? 0.3 : 0.6,
    max_tokens: Math.min(4096, Math.max(256, Number(body.max_tokens) || 2200))
  };
  if (expectJson) payload.response_format = { type: 'json_object' };
  if (model === 'glm-4.7-flash') payload.thinking = { type: 'disabled' };
  return payload;
}

async function fetchUpstream(payload, apiKey, signal) {
  return fetch(UPSTREAM_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload),
    signal
  });
}

function shouldFallback(status, text) {
  if (status === 429 || status >= 500) return true;
  if (status >= 200 && status < 300 && text) {
    try {
      const data = JSON.parse(text);
      const code = String(data?.error?.code || '');
      return ['1305', '1302', '1303'].includes(code);
    } catch (_) {}
  }
  return false;
}

export async function onRequest(context) {
  const { request, env } = context;
  const origin = request.headers.get('origin') || '';
  const apiKey = (env && env.ZHIPU_API_KEY) || '';

  // 浏览器直接访问 /api/ai-proxy 可检查代理与 Key 状态
  if (request.method === 'GET') {
    const allowOrigin = isAllowedOrigin(origin, request.url) ? origin : '*';
    return json(
      {
        ok: true,
        service: 'tcm-chemistry-lab-ai-proxy',
        platform: 'cloudflare-pages-functions',
        provider: 'zhipu-bigmodel-free',
        model: DEFAULT_MODEL,
        fallbackModel: FALLBACK_MODEL,
        streaming: true,
        configured: Boolean(apiKey)
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

  if (!apiKey) {
    return json({ error: { message: 'ZHIPU_API_KEY is not configured in Cloudflare Pages' } }, 503, origin);
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

  const requestedModel = typeof body.model === 'string' ? body.model : DEFAULT_MODEL;
  const primaryModel = ALLOWED_MODELS.has(requestedModel) ? requestedModel : DEFAULT_MODEL;
  const expectJson = body.response_format?.type === 'json_object';
  const wantStream = body.stream === true;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), wantStream ? 55_000 : 25_000);

  try {
    let usedModel = primaryModel;
    let fellBack = false;
    let upstream = await fetchUpstream(buildPayload(primaryModel, body.messages, expectJson, body, wantStream), apiKey, controller.signal);

    if (wantStream) {
      if ((upstream.status === 429 || upstream.status >= 500) && primaryModel !== FALLBACK_MODEL) {
        try { await upstream.body?.cancel(); } catch (_) {}
        fellBack = true;
        usedModel = FALLBACK_MODEL;
        upstream = await fetchUpstream(buildPayload(FALLBACK_MODEL, body.messages, expectJson, body, true), apiKey, controller.signal);
      }

      if (upstream.ok && upstream.body) {
        clearTimeout(timer);
        return new Response(upstream.body, {
          status: 200,
          headers: {
            ...corsHeaders(origin),
            'Content-Type': upstream.headers.get('content-type') || 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-store',
            'X-Actual-Model': usedModel,
            'X-Fallback': fellBack ? 'true' : 'false',
            'X-Proxy-Platform': 'cloudflare-pages'
          }
        });
      }

      const errText = await upstream.text();
      return new Response(errText, {
        status: upstream.status,
        headers: {
          ...corsHeaders(origin),
          'Content-Type': upstream.headers.get('content-type') || 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
          'X-Actual-Model': usedModel,
          'X-Fallback': fellBack ? 'true' : 'false',
          'X-Proxy-Platform': 'cloudflare-pages'
        }
      });
    }

    let text = await upstream.text();
    let status = upstream.status;
    let contentType = upstream.headers.get('content-type') || 'application/json; charset=utf-8';

    if (shouldFallback(status, text) && primaryModel !== FALLBACK_MODEL) {
      fellBack = true;
      usedModel = FALLBACK_MODEL;
      upstream = await fetchUpstream(buildPayload(FALLBACK_MODEL, body.messages, expectJson, body, false), apiKey, controller.signal);
      text = await upstream.text();
      status = upstream.status;
      contentType = upstream.headers.get('content-type') || 'application/json; charset=utf-8';
    }

    return new Response(text, {
      status,
      headers: {
        ...corsHeaders(origin),
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
        'X-Actual-Model': usedModel,
        'X-Fallback': fellBack ? 'true' : 'false',
        'X-Proxy-Platform': 'cloudflare-pages'
      }
    });
  } catch (error) {
    const message = error?.name === 'AbortError' ? 'Upstream model timeout' : 'Upstream model unavailable';
    return json({ error: { message } }, 504, origin);
  } finally {
    clearTimeout(timer);
  }
}
