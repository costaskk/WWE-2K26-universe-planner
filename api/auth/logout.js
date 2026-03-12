import { handleLogout } from '../../server/lib/routes.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  return handleLogout(req, res);
}
