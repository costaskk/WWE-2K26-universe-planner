import { getSessionCookieValue, verifySessionToken } from './auth.js';
import { restRequest } from './supabaseRest.js';

export async function requireUser(req) {
  const token = getSessionCookieValue(req);
  if (!token) return null;

  let session;
  try {
    session = verifySessionToken(token);
  } catch {
    return null;
  }

  try {
    const data = await restRequest(`/app_users?select=id,username&id=eq.${encodeURIComponent(session.id)}&limit=1`);
    return Array.isArray(data) && data[0] ? data[0] : null;
  } catch {
    return null;
  }
}
