import { getSessionCookieValue, verifySessionToken } from './auth.js';
import { getSupabaseAdmin } from './supabaseAdmin.js';

export async function requireUser(req) {
  const token = getSessionCookieValue(req);
  if (!token) {
    return null;
  }

  const session = await verifySessionToken(token);
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('app_users')
    .select('id, username')
    .eq('id', session.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}
