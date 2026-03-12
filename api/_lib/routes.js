import {
  clearSessionCookie,
  createSessionToken,
  hashPassword,
  isValidUsername,
  normalizeUsername,
  sessionCookie,
  verifyPassword,
} from './auth.js';
import { requireUser } from './currentUser.js';
import { sendJson } from './http.js';
import { restRequest } from './supabaseRest.js';

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 6 && password.length <= 100;
}

function detailsFromError(error, fallback) {
  return error?.message || error?.payload?.message || error?.payload?.details || fallback;
}

export async function handleRegister(req, res, body) {
  const username = normalizeUsername(body.username);
  const password = body.password;

  if (!isValidUsername(username)) {
    return sendJson(res, 400, { error: 'Usernames must be 3 to 24 characters and use letters, numbers, underscores, or dashes.' });
  }

  if (!validatePassword(password)) {
    return sendJson(res, 400, { error: 'Passwords must be between 6 and 100 characters.' });
  }

  try {
    const existing = await restRequest(`/app_users?select=id,username&username=eq.${encodeURIComponent(username)}&limit=1`);
    if (Array.isArray(existing) && existing[0]) {
      return sendJson(res, 409, { error: 'That username is already taken.' });
    }

    const inserted = await restRequest('/app_users?select=id,username', {
      method: 'POST',
      body: { username, password_hash: hashPassword(password) },
    });

    const user = Array.isArray(inserted) ? inserted[0] : inserted;
    const token = createSessionToken(user);
    return sendJson(res, 201, { user }, { 'Set-Cookie': sessionCookie(token) });
  } catch (error) {
    return sendJson(res, 500, {
      error: 'Could not create that profile.',
      details: detailsFromError(error, 'Check that app_users exists and your service role key is valid.'),
    });
  }
}

export async function handleLogin(req, res, body) {
  const username = normalizeUsername(body.username);
  const password = body.password;

  if (!username || !password) {
    return sendJson(res, 400, { error: 'Enter both username and password.' });
  }

  try {
    const found = await restRequest(`/app_users?select=id,username,password_hash&username=eq.${encodeURIComponent(username)}&limit=1`);
    const user = Array.isArray(found) ? found[0] : null;
    if (!user || !verifyPassword(password, user.password_hash)) {
      return sendJson(res, 401, { error: 'Invalid username or password.' });
    }

    const token = createSessionToken(user);
    return sendJson(res, 200, { user: { id: user.id, username: user.username } }, { 'Set-Cookie': sessionCookie(token) });
  } catch (error) {
    return sendJson(res, 500, { error: 'Could not sign in.', details: detailsFromError(error, 'Login service is not available.') });
  }
}

export async function handleLogout(_req, res) {
  return sendJson(res, 200, { ok: true }, { 'Set-Cookie': clearSessionCookie() });
}

export async function handleSession(req, res) {
  try {
    const user = await requireUser(req);
    return sendJson(res, 200, { user: user || null });
  } catch {
    return sendJson(res, 200, { user: null });
  }
}

export async function handleListUniverses(req, res) {
  const user = await requireUser(req);
  if (!user) return sendJson(res, 401, { error: 'Not signed in.' });

  try {
    const universes = await restRequest(`/universes?select=id,slot_name,data,updated_at&user_id=eq.${encodeURIComponent(user.id)}&order=updated_at.desc`);
    return sendJson(res, 200, { universes: Array.isArray(universes) ? universes : [] });
  } catch (error) {
    return sendJson(res, 500, { error: 'Could not load universes.', details: detailsFromError(error, 'Could not read saved universes.') });
  }
}

export async function handleCreateUniverse(req, res, body) {
  const user = await requireUser(req);
  if (!user) return sendJson(res, 401, { error: 'Not signed in.' });

  const slotName = String(body.slotName || '').trim();
  if (!slotName) return sendJson(res, 400, { error: 'Enter a slot name.' });

  try {
    const created = await restRequest('/universes?select=id,slot_name,data,updated_at', {
      method: 'POST',
      body: {
        user_id: user.id,
        slot_name: slotName,
        data: body.data || {},
        updated_at: new Date().toISOString(),
      },
    });
    return sendJson(res, 201, { universe: Array.isArray(created) ? created[0] : created });
  } catch (error) {
    const details = detailsFromError(error, 'Could not create save slot.');
    if (/duplicate key|already exists|universes_user_slot_name_unique/i.test(details)) {
      return sendJson(res, 409, { error: 'That slot name already exists.' });
    }
    return sendJson(res, 500, { error: 'Could not create save slot.', details });
  }
}

export async function handleSaveUniverse(req, res, body) {
  const user = await requireUser(req);
  if (!user) return sendJson(res, 401, { error: 'Not signed in.' });
  if (!body.id) return sendJson(res, 400, { error: 'Missing universe id.' });

  try {
    const saved = await restRequest(`/universes?id=eq.${encodeURIComponent(body.id)}&user_id=eq.${encodeURIComponent(user.id)}&select=id,slot_name,data,updated_at`, {
      method: 'PATCH',
      body: {
        data: body.data || {},
        updated_at: new Date().toISOString(),
      },
    });
    return sendJson(res, 200, { universe: Array.isArray(saved) ? saved[0] : saved });
  } catch (error) {
    return sendJson(res, 500, { error: 'Could not save universe.', details: detailsFromError(error, 'Save failed.') });
  }
}

export async function handleDeleteUniverse(req, res, body) {
  const user = await requireUser(req);
  if (!user) return sendJson(res, 401, { error: 'Not signed in.' });
  if (!body.id) return sendJson(res, 400, { error: 'Missing universe id.' });

  try {
    await restRequest(`/universes?id=eq.${encodeURIComponent(body.id)}&user_id=eq.${encodeURIComponent(user.id)}`, {
      method: 'DELETE',
      headers: { Prefer: 'return=minimal' },
    });
    return sendJson(res, 200, { ok: true });
  } catch (error) {
    return sendJson(res, 500, { error: 'Could not delete universe.', details: detailsFromError(error, 'Delete failed.') });
  }
}
