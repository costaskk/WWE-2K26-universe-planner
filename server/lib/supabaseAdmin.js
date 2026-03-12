import { createClient } from '@supabase/supabase-js';
import { getEnv } from './env.js';

let client;

export function getSupabaseAdmin() {
  if (!client) {
    client = createClient(getEnv('SUPABASE_URL'), getEnv('SUPABASE_SERVICE_ROLE_KEY'), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return client;
}
