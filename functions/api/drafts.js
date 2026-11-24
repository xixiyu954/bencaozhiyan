// 放置路径：functions/api/drafts.js
// Cloudflare Pages Functions 实验草稿云端保存接口（支持 KV 绑定 TCM_DRAFTS_KV 或 D1 绑定 TCM_DRAFTS_DB）
// 部署到 Cloudflare Pages 后，只需在 Settings -> Functions -> Bindings 绑定：
//   - KV Namespace: TCM_DRAFTS_KV（推荐，零建表，默认 TTL 30 天）
//   - 或 D1 Database: TCM_DRAFTS_DB（自动建表 tcm_drafts，亦可执行同目录 drafts.schema.sql）
// 可选环境变量：DRAFTS_ACCESS_SECRET（如需全局口令保护，仅在服务端 env 读取，绝不暴露前端）。

const ALLOWED_EXACT_ORIGINS = new Set([
  'https://xixiyu954.github.io'
]);

const DRAFT_ID_RE = /^[a-zA-Z0-9_-]{6,64}$/;
const MAX_BODY_BYTES = 512 * 1024; // 512 KB
const KV_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 40;
const rateBuckets = new Map();

function isAllowedOrigin(origin, requestUrl) {
  if (!origin) return true; // 同源 GET 或 curl/健康检查允许无 Origin
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
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Draft-Token, X-Draft-Secret, If-None-Match',
    'Access-Control-Expose-Headers': 'ETag, X-Draft-Backend, X-Proxy-Platform',
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
    for (const [k, v] of rateBuckets) {
      if (now - v.start >= RATE_WINDOW_MS) rateBuckets.delete(k);
    }
  }
  return current.count <= RATE_LIMIT;
}

async function sha256Hex(text) {
  const data = new TextEncoder().encode(String(text || ''));
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function generateId(prefix = 'tcm') {
  const raw = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  return `${prefix}_${raw}`;
}

function generateToken() {
  return `${crypto.randomUUID().replace(/-/g, '')}${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
}

function detectBackend(env) {
  if (env && env.TCM_DRAFTS_KV && typeof env.TCM_DRAFTS_KV.get === 'function') return 'kv';
  if (env && env.TCM_DRAFTS_DB && typeof env.TCM_DRAFTS_DB.prepare === 'function') return 'd1';
  return 'unconfigured';
}

async function ensureD1Table(db) {
  await db
    .prepare(
      'CREATE TABLE IF NOT EXISTS tcm_drafts (id TEXT PRIMARY KEY, token_hash TEXT NOT NULL, title TEXT, schema_version INTEGER NOT NULL DEFAULT 1, payload TEXT NOT NULL, etag TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)'
    )
    .run();
}

async function storageGet(env, backend, id) {
  if (backend === 'kv') {
    const raw = await env.TCM_DRAFTS_KV.get(`draft:${id}`);
    return raw ? JSON.parse(raw) : null;
  }
  if (backend === 'd1') {
    await ensureD1Table(env.TCM_DRAFTS_DB);
    const row = await env.TCM_DRAFTS_DB.prepare(
      'SELECT id, token_hash, title, schema_version, payload, etag, created_at, updated_at FROM tcm_drafts WHERE id = ?'
    )
      .bind(id)
      .first();
    if (!row) return null;
    return {
      id: row.id,
      tokenHash: row.token_hash,
      title: row.title || '',
      schemaVersion: row.schema_version || 1,
      data: JSON.parse(row.payload),
      etag: row.etag,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
  return null;
}

async function storagePut(env, backend, record) {
  if (backend === 'kv') {
    await env.TCM_DRAFTS_KV.put(`draft:${record.id}`, JSON.stringify(record), {
      expirationTtl: KV_TTL_SECONDS
    });
    return;
  }
  if (backend === 'd1') {
    await ensureD1Table(env.TCM_DRAFTS_DB);
    await env.TCM_DRAFTS_DB.prepare(
      'INSERT INTO tcm_drafts (id, token_hash, title, schema_version, payload, etag, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET title = excluded.title, schema_version = excluded.schema_version, payload = excluded.payload, etag = excluded.etag, updated_at = excluded.updated_at'
    )
      .bind(
        record.id,
        record.tokenHash,
        record.title,
        record.schemaVersion,
        JSON.stringify(record.data),
        record.etag,
        record.createdAt,
        record.updatedAt
      )
      .run();
  }
}

async function storageDelete(env, backend, id) {
  if (backend === 'kv') {
    await env.TCM_DRAFTS_KV.delete(`draft:${id}`);
    return;
  }
  if (backend === 'd1') {
    await ensureD1Table(env.TCM_DRAFTS_DB);
    await env.TCM_DRAFTS_DB.prepare('DELETE FROM tcm_drafts WHERE id = ?').bind(id).run();
  }
}

function validateDraftData(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return '草稿数据必须是 JSON 对象';
  }
  if (typeof data.activeTopicId !== 'string' || !data.activeTopicId.trim()) {
    return '草稿数据缺少有效的 activeTopicId';
  }
  return null;
}

export async function onRequest(context) {
  const { request, env } = context;
  const origin = request.headers.get('origin') || '';
  const backend = detectBackend(env);

  if (request.method === 'OPTIONS') {
    if (!isAllowedOrigin(origin, request.url)) {
      return json({ ok: false, code: 'ORIGIN_FORBIDDEN', error: { message: 'Origin not allowed' } }, 403, 'null');
    }
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (!isAllowedOrigin(origin, request.url)) {
    return json({ ok: false, code: 'ORIGIN_FORBIDDEN', error: { message: 'Origin not allowed' } }, 403, 'null');
  }

  const url = new URL(request.url);
  const idParam = (url.searchParams.get('id') || '').trim();

  // 健康检查：GET /api/drafts（不带 id）
  if (request.method === 'GET' && !idParam) {
    return json(
      {
        ok: true,
        service: 'tcm-chemistry-lab-drafts',
        platform: 'cloudflare-pages-functions',
        backend,
        configured: backend !== 'unconfigured',
        maxBytes: MAX_BODY_BYTES,
        ttlDays: Math.round(KV_TTL_SECONDS / 86400)
      },
      200,
      origin,
      { 'X-Draft-Backend': backend }
    );
  }

  // 可选服务端环境口令校验（仅从 env 读取，前端无密钥）
  const serverSecret = (env && env.DRAFTS_ACCESS_SECRET) || '';
  if (serverSecret) {
    const provided = request.headers.get('X-Draft-Secret') || '';
    if (provided !== serverSecret) {
      return json(
        { ok: false, code: 'UNAUTHORIZED', error: { message: '需要有效的服务端访问口令' } },
        401,
        origin,
        { 'X-Draft-Backend': backend }
      );
    }
  }

  const forwardedFor = request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || '';
  const ip = forwardedFor.split(',')[0].trim() || 'unknown';
  if (!allowRequest(ip)) {
    return json(
      { ok: false, code: 'RATE_LIMITED', error: { message: '请求过于频繁，请稍后重试' } },
      429,
      origin,
      { 'X-Draft-Backend': backend }
    );
  }

  if (backend === 'unconfigured') {
    return json(
      {
        ok: false,
        code: 'STORAGE_NOT_CONFIGURED',
        fallback: 'local',
        error: { message: '云端存储尚未绑定（请在 Cloudflare Pages 绑定 TCM_DRAFTS_KV 或 TCM_DRAFTS_DB），已自动回退本地存储' }
      },
      503,
      origin,
      { 'X-Draft-Backend': backend }
    );
  }

  // 读取草稿：GET /api/drafts?id=<draftId>
  if (request.method === 'GET') {
    if (!DRAFT_ID_RE.test(idParam)) {
      return json({ ok: false, code: 'INVALID_ID', error: { message: '草稿编号格式无效' } }, 400, origin);
    }
    try {
      const record = await storageGet(env, backend, idParam);
      if (!record) {
        return json({ ok: false, code: 'NOT_FOUND', error: { message: '未找到对应云端草稿（可能已过期或编号错误）' } }, 404, origin);
      }
      const ifNoneMatch = request.headers.get('If-None-Match');
      if (ifNoneMatch && ifNoneMatch === record.etag) {
        return new Response(null, {
          status: 304,
          headers: {
            ...corsHeaders(origin),
            ETag: record.etag,
            'Cache-Control': 'private, max-age=0, must-revalidate',
            'X-Draft-Backend': backend
          }
        });
      }
      return json(
        {
          ok: true,
          backend,
          draft: {
            id: record.id,
            title: record.title,
            schemaVersion: record.schemaVersion,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
            data: record.data
          }
        },
        200,
        origin,
        {
          ETag: record.etag,
          'Cache-Control': 'private, max-age=0, must-revalidate',
          'X-Draft-Backend': backend
        }
      );
    } catch (err) {
      return json({ ok: false, code: 'STORAGE_ERROR', error: { message: '读取云端草稿失败' } }, 500, origin);
    }
  }

  // 创建或更新草稿：POST /api/drafts 或 PUT /api/drafts
  if (request.method === 'POST' || request.method === 'PUT') {
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > MAX_BODY_BYTES) {
      return json({ ok: false, code: 'PAYLOAD_TOO_LARGE', error: { message: '草稿体积不能超过 512 KB' } }, 413, origin);
    }

    let rawText = '';
    try {
      rawText = await request.text();
    } catch (_) {
      return json({ ok: false, code: 'INVALID_BODY', error: { message: '请求体读取失败' } }, 400, origin);
    }
    if (new TextEncoder().encode(rawText).byteLength > MAX_BODY_BYTES) {
      return json({ ok: false, code: 'PAYLOAD_TOO_LARGE', error: { message: '草稿体积不能超过 512 KB' } }, 413, origin);
    }

    let body;
    try {
      body = JSON.parse(rawText);
    } catch (_) {
      return json({ ok: false, code: 'INVALID_JSON', error: { message: '请求体不是有效 JSON' } }, 400, origin);
    }

    const validationErr = validateDraftData(body?.data);
    if (validationErr) {
      return json({ ok: false, code: 'INVALID_DRAFT', error: { message: validationErr } }, 400, origin);
    }

    const requestedId = typeof body.id === 'string' && body.id.trim() ? body.id.trim() : '';
    if (requestedId && !DRAFT_ID_RE.test(requestedId)) {
      return json({ ok: false, code: 'INVALID_ID', error: { message: '草稿编号格式无效' } }, 400, origin);
    }

    const providedToken = (request.headers.get('X-Draft-Token') || body.editToken || '').trim();
    const now = new Date().toISOString();

    try {
      let existing = null;
      if (requestedId) {
        existing = await storageGet(env, backend, requestedId);
      }

      let id = requestedId || generateId('tcm');
      let editToken = providedToken;
      let tokenHash = '';
      let createdAt = now;

      if (existing) {
        const providedHash = await sha256Hex(providedToken);
        if (!providedToken || providedHash !== existing.tokenHash) {
          return json(
            { ok: false, code: 'TOKEN_MISMATCH', error: { message: '无权覆盖他人云端草稿（请另存为新草稿或核对凭证）' } },
            403,
            origin
          );
        }
        tokenHash = existing.tokenHash;
        createdAt = existing.createdAt;
      } else {
        if (!editToken) editToken = generateToken();
        tokenHash = await sha256Hex(editToken);
      }

      const title = String(body.title || body.data.activeTopicId || '未命名实验草稿').slice(0, 120);
      const etagHash = await sha256Hex(`${id}:${now}:${JSON.stringify(body.data)}`);
      const etag = `"${etagHash.slice(0, 24)}"`;

      const record = {
        id,
        tokenHash,
        title,
        schemaVersion: 1,
        data: body.data,
        etag,
        createdAt,
        updatedAt: now
      };

      await storagePut(env, backend, record);

      return json(
        {
          ok: true,
          backend,
          id,
          editToken: existing ? undefined : editToken,
          title,
          etag,
          updatedAt: now,
          created: !existing
        },
        existing ? 200 : 201,
        origin,
        { ETag: etag, 'X-Draft-Backend': backend }
      );
    } catch (_) {
      return json({ ok: false, code: 'STORAGE_ERROR', error: { message: '云端草稿写入失败' } }, 500, origin);
    }
  }

  // 删除草稿：DELETE /api/drafts?id=<draftId>
  if (request.method === 'DELETE') {
    if (!DRAFT_ID_RE.test(idParam)) {
      return json({ ok: false, code: 'INVALID_ID', error: { message: '草稿编号格式无效' } }, 400, origin);
    }
    const providedToken = (request.headers.get('X-Draft-Token') || '').trim();
    try {
      const existing = await storageGet(env, backend, idParam);
      if (!existing) {
        return json({ ok: false, code: 'NOT_FOUND', error: { message: '草稿不存在' } }, 404, origin);
      }
      const providedHash = await sha256Hex(providedToken);
      if (!providedToken || providedHash !== existing.tokenHash) {
        return json({ ok: false, code: 'TOKEN_MISMATCH', error: { message: '无权删除该草稿' } }, 403, origin);
      }
      await storageDelete(env, backend, idParam);
      return json({ ok: true, backend, deleted: true, id: idParam }, 200, origin, { 'X-Draft-Backend': backend });
    } catch (_) {
      return json({ ok: false, code: 'STORAGE_ERROR', error: { message: '删除草稿失败' } }, 500, origin);
    }
  }

  return json({ ok: false, code: 'METHOD_NOT_ALLOWED', error: { message: 'Method Not Allowed' } }, 405, origin);
}
