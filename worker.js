const ALLOWED_ORIGINS = new Set([
  'https://xixiyu954.github.io',
  'https://tcm-chemistry-lab.app.workbuddy.host'
]);
const ALLOWED_MODELS = new Set(['qwen3.7-plus', 'qwen4-max']);
const DEFAULT_MODEL = 'qwen3.7-plus';
const RATE_WINDOW_MS = 60000;
const RATE_LIMIT = 20;
const rateBuckets = new Map();

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
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
    for (const [key, value] of rateBuckets) if (now - value.start >= RATE_WINDOW_MS) rateBuckets.delete(key);
  }
  return current.count <= RATE_LIMIT;
}

function validMessages(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 12) return false;
  let total = 0;
  for (const message of value) {
    if (!message || !['system', 'user', 'assistant'].includes(message.role) || typeof message.content !== 'string') return false;
    if (message.content.length > 24000) return false;
    total += message.content.length;
  }
  return total <= 36000;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    if (!ALLOWED_ORIGINS.has(origin)) return json({ error: { message: 'Origin not allowed' } }, 403, 'null');

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
    if (request.method !== 'POST') return json({ error: { message: 'Method Not Allowed' } }, 405, origin);
    if (!env.DASHSCOPE_API_KEY) return json({ error: { message: 'AI service is not configured' } }, 503, origin);

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!allowRequest(ip)) return json({ error: { message: 'Too many requests, please retry later' } }, 429, origin);

    const contentLength = Number(request.headers.get('Content-Length') || 0);
    if (contentLength > 60000) return json({ error: { message: 'Request too large' } }, 413, origin);

    let body;
    try {
      body = await request.json();
    } catch (_) {
      return json({ error: { message: 'Invalid JSON body' } }, 400, origin);
    }
    if (!body || !validMessages(body.messages)) return json({ error: { message: 'Invalid messages' } }, 400, origin);

    const requestedModel = typeof body.model === 'string' ? body.model : DEFAULT_MODEL;
    const model = ALLOWED_MODELS.has(requestedModel) ? requestedModel : DEFAULT_MODEL;
    const expectJson = body.response_format?.type === 'json_object';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 40000);

    try {
      const upstream = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.DASHSCOPE_API_KEY}`
        },
        body: JSON.stringify({
          model,
          messages: body.messages,
          temperature: expectJson ? 0.35 : 0.65,
          max_tokens: Math.min(5000, Math.max(256, Number(body.max_tokens) || 1800)),
          response_format: expectJson ? { type: 'json_object' } : undefined,
          enable_thinking: false
        }),
        signal: controller.signal
      });
      const text = await upstream.text();
      return new Response(text, {
        status: upstream.status,
        headers: { ...corsHeaders(origin), 'Content-Type': upstream.headers.get('Content-Type') || 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
      });
    } catch (error) {
      const message = error?.name === 'AbortError' ? 'Upstream model timeout' : 'Upstream model unavailable';
      return json({ error: { message } }, 504, origin);
    } finally {
      clearTimeout(timer);
    }
  }
};
