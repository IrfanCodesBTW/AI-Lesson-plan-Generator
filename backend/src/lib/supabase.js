import { createClient } from '@supabase/supabase-js';
import { loadEnv } from '../config/env.js';
import { getLogger } from './logger.js';
let _client = null;
export function getSupabase() {
  if (_client) return _client;
  const env = loadEnv();
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    getLogger().warn('Supabase env not configured; client unavailable');
  }
  _client = createClient(
    env.SUPABASE_URL ?? 'https://placeholder.supabase.co',
    env.SUPABASE_ANON_KEY ?? 'placeholder',
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
  return _client;
}
