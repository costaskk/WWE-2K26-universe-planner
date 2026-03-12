import { getEnv } from './env.js';

function trimSlash(value) {
  return value.replace(/\/+$/, '');
}

function restBase() {
  return `${trimSlash(getEnv('SUPABASE_URL'))}/rest/v1`;
}

function defaultHeaders(extra = {}) {
  const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  return {
    apikey: serviceKey,
    Authorization: serviceKey,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
    ...extra,
  };
}

function buildErrorMessage(payload, fallback) {
  if (!payload) return fallback;
  return payload.message || payload.error_description || payload.details || payload.hint || payload.error || fallback;
}

export async function restRequest(path, options = {}) {
  const url = `${restBase()}${path}`;
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: defaultHeaders(options.headers),
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let payload = null;
  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { error: text };
    }
  }

  if (!response.ok) {
    const error = new Error(buildErrorMessage(payload, 'Supabase request failed.'));
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}