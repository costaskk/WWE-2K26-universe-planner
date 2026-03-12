import { clearSessionCookie, createSessionToken, hashPassword, isValidUsername, normalizeUsername, sessionCookie, verifyPassword } from './auth.js';
import { requireUser } from './currentUser.js';
import { sendJson } from './http.js';
import { getSupabaseAdmin } from './supabaseAdmin.js';

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 6 && password.length <= 100;
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

  const supabase = getSupabaseAdmin();
  const passwordHash = await hashPassword(password);

  const { data, error } = await supabase
    .from('app_users')
    .insert({ username, password_hash: passwordHash })
    .select('id, username')
    .single();

  if (error) {
    if (error.code === '23505') {
      return sendJson(res, 409, { error: 'That username is already taken.' });
    }
    return sendJson(res, 500, { error: 'Could not create that profile.' });
  }

  const token = await createSessionToken(data);
  return sendJson(res, 201, { user: data }, { 'Set-Cookie': sessionCookie(token) });
}

export async function handleLogin(req, res, body) {
  const username = normalizeUsername(body.username);
  const password = body.password;

  if (!username || !password) {
    return sendJson(res, 400, { error: 'Enter both username and password.' });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('app_users')
    .select('id, username, password_hash')
    .eq('username', username)
    .maybeSingle();

  if (error || !data) {
    return sendJson(res, 401, { error: 'Invalid username or password.' });
  }

  const valid = await verifyPassword(password, data.password_hash);
  if (!valid) {
    return sendJson(res, 401, { error: 'Invalid username or password.' });
  }

  const token = await createSessionToken(data);
  return sendJson(res, 200, { user: { id: data.id, username: data.username } }, { 'Set-Cookie': sessionCookie(token) });
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
  if (!user) {
    return sendJson(res, 401, { error: 'Not signed in.' });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('universes')
    .select('id, slot_name, data, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    return sendJson(res, 500, { error: 'Could not load universes.' });
  }

  return sendJson(res, 200, { universes: data || [] });
}

export async function handleCreateUniverse(req, res, body) {
  const user = await requireUser(req);
  if (!user) {
    return sendJson(res, 401, { error: 'Not signed in.' });
  }

  const slotName = String(body.slotName || '').trim();
  if (!slotName) {
    return sendJson(res, 400, { error: 'Enter a slot name.' });
  }

  const supabase = getSupabaseAdmin();
  const payload = {
    user_id: user.id,
    slot_name: slotName,
    data: body.data || {},
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('universes')
    .insert(payload)
    .select('id, slot_name, data, updated_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      return sendJson(res, 409, { error: 'That slot name already exists.' });
    }
    return sendJson(res, 500, { error: 'Could not create save slot.' });
  }

  return sendJson(res, 201, { universe: data });
}

export async function handleSaveUniverse(req, res, body) {
  const user = await requireUser(req);
  if (!user) {
    return sendJson(res, 401, { error: 'Not signed in.' });
  }

  if (!body.id) {
    return sendJson(res, 400, { error: 'Missing universe id.' });
  }

  const update = {
    data: body.data || {},
    updated_at: new Date().toISOString(),
  };

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('universes')
    .update(update)
    .eq('id', body.id)
    .eq('user_id', user.id)
    .select('id, slot_name, data, updated_at')
    .single();

  if (error) {
    return sendJson(res, 500, { error: 'Could not save universe.' });
  }

  return sendJson(res, 200, { universe: data });
}

export async function handleDeleteUniverse(req, res, body) {
  const user = await requireUser(req);
  if (!user) {
    return sendJson(res, 401, { error: 'Not signed in.' });
  }

  if (!body.id) {
    return sendJson(res, 400, { error: 'Missing universe id.' });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('universes')
    .delete()
    .eq('id', body.id)
    .eq('user_id', user.id);

  if (error) {
    return sendJson(res, 500, { error: 'Could not delete universe.' });
  }

  return sendJson(res, 200, { ok: true });
}
