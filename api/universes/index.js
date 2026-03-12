import { handleListUniverses } from '../../server/lib/routes.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    return await handleListUniverses(req, res);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Could not load universes.' });
  }
}
