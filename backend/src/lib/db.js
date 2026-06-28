import { Pool } from 'pg';
import { loadEnv } from '../config/env.js';
import { getLogger } from './logger.js';
let _pool = null;
export function getPool() {
  if (_pool) return _pool;
  const env = loadEnv();
  _pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 30_000,
    ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
  _pool.on('error', (err) => {
    getLogger().error({ err }, 'pg pool error');
  });
  return _pool;
}
export async function query(text, params) {
  const res = await getPool().query(text, params);
  return res.rows;
}
export async function withClient(fn) {
  const client = await getPool().connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}
export async function closePool() {
  if (_pool) {
    await _pool.end();
    _pool = null;
  }
}
