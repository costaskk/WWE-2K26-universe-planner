async function parseResponse(response) {
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.error || 'Request failed.');
  }

  return data;
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  return parseResponse(response);
}

export const api = {
  getSession() {
    return request('/api/auth/session', { method: 'GET' });
  },
  register(payload) {
    return request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) });
  },
  login(payload) {
    return request('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) });
  },
  logout() {
    return request('/api/auth/logout', { method: 'POST', body: JSON.stringify({}) });
  },
  listUniverses() {
    return request('/api/universes', { method: 'GET' });
  },
  createUniverse(payload) {
    return request('/api/universes/create', { method: 'POST', body: JSON.stringify(payload) });
  },
  saveUniverse(payload) {
    return request('/api/universes/save', { method: 'POST', body: JSON.stringify(payload) });
  },
  deleteUniverse(payload) {
    return request('/api/universes/delete', { method: 'POST', body: JSON.stringify(payload) });
  },
};
