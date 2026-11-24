-- 本草智研 · Cloudflare D1 实验草稿表结构（如使用 KV 绑定 TCM_DRAFTS_KV 则无需建表）
-- 使用方式：wrangler d1 execute <DB_NAME> --file=functions/api/drafts.schema.sql
CREATE TABLE IF NOT EXISTS tcm_drafts (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL,
  title TEXT,
  schema_version INTEGER NOT NULL DEFAULT 1,
  payload TEXT NOT NULL,
  etag TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tcm_drafts_updated_at ON tcm_drafts (updated_at);
