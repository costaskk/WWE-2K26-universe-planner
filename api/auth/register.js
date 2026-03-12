import { handleRegister } from '../../server/lib/routes.js';
import { readBody } from '../../server/lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const body = await readBody(req);
    return handleRegister(req, res, body);
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Could not create that profile.' });
  }
}
