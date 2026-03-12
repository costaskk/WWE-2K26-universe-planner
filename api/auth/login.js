import { handleLogin } from '../../server/lib/routes.js';
import { readBody } from '../../server/lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const body = await readBody(req);
    return await handleLogin(req, res, body);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Login failed.' });
  }
}
