import { handleListUniverses } from '../_lib/routes.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  return handleListUniverses(req, res);
}
