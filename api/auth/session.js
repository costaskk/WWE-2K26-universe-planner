import { handleSession } from '../../server/lib/routes.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    return await handleSession(req, res);
  } catch (error) {
    return res.status(200).json({ user: null, error: error.message || 'Session lookup failed.' });
  }
}
