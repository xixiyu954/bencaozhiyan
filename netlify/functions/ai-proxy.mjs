// 放置路径：GitHub 仓库中的 netlify/functions/ai-proxy.mjs
// 在 Netlify 导入仓库后，于 Site configuration -> Environment variables 中添加：
//   Key:   ZHIPU_API_KEY
//   Value: 你的智谱开放平台 API Key（https://open.bigmodel.cn/）

const ALLOWED_EXACT_ORIGINS = new Set([
  'https://xixiyu954.github.io'
]);

const ALLOWED_MODELS = new Set([
  'glm-4.7-flash',
  'glm-4-flash-250414'
]);

const DEFAULT_MODEL = 'glm-4.7-flash';
const UPSTREAM_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 20;
const rateBuckets = new Map();

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_EXACT_ORIGINS.has(origin)) return true;
  try {
    const parsed = new URL(origin);
    return parsed.protocol === 'https:' && parsed.hostname.endsWith('.netlify.app');
  } catch (_) {
    return false;
  }
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(origin),
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
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

export default async (request) => {
  const origin = request.headers.get('origin') || '';
  const apiKey = process.env.ZHIPU_API_KEY || '';

  // 浏览器直接访问 /.netlify/functions/ai-proxy 可检查代理与 Key 状态
  if (request.method === 'GET') {
    const allowOrigin = isAllowedOrigin(origin) ? origin : '*';
    return json(
      {
        ok: true,
        service: 'tcm-chemistry-lab-ai-proxy',
        platform: 'netlify-functions',
        provider: 'zhipu-bigmodel-free',
        model: DEFAULT_MODEL,
        configured: Boolean(apiKey)
      },
      200,
      allowOrigin
    );
  }

  if (!isAllowedOrigin(origin)) {
    return json({ error: { message: 'Origin not allowed' } }, 403, 'null');
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (request.method !== 'POST') {
    return json({ error: { message: 'Method Not Allowed' } }, 405, origin);
  }

  if (!apiKey) {
    return json({ error: { message: 'ZHIPU_API_KEY is not configured in Netlify' } }, 503, origin);
  }

  const forwardedFor = request.headers.get('x-nf-client-connection-ip') || request.headers.get('x-forwarded-for') || '';
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
  const model = ALLOWED_MODELS.has(requestedModel) ? requestedModel : DEFAULT_MODEL;
  const expectJson = body.response_format?.type === 'json_object';

  const payload = {
    model,
    messages: body.messages,
    temperature: expectJson ? 0.35 : 0.65,
    max_tokens: Math.min(5000, Math.max(256, Number(body.max_tokens) || 1800))
  };

  if (expectJson) {
    payload.response_format = { type: 'json_object' };
  }

  // GLM-4.7-Flash 默认开启深度思考模式，关闭后可直接输出 content，避免空内容或超时
  if (model === 'glm-4.7-flash') {
    payload.thinking = { type: 'disabled' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 40_000);

  try {
    const upstream = await fetch(UPSTREAM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: {
        ...corsHeaders(origin),
        'Content-Type': upstream.headers.get('content-type') || 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    const message = error?.name === 'AbortError' ? 'Upstream model timeout' : 'Upstream model unavailable';
    return json({ error: { message } }, 504, origin);
  } finally {
    clearTimeout(timer);
  }
};