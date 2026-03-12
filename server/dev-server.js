import express from 'express';
import cookieParser from 'cookie-parser';
import { handleCreateUniverse, handleDeleteUniverse, handleListUniverses, handleLogin, handleLogout, handleRegister, handleSaveUniverse, handleSession } from './lib/routes.js';

const app = express();
const port = process.env.API_PORT || 3001;

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/api/auth/session', (req, res) => handleSession(req, res));
app.post('/api/auth/register', (req, res) => handleRegister(req, res, req.body));
app.post('/api/auth/login', (req, res) => handleLogin(req, res, req.body));
app.post('/api/auth/logout', (req, res) => handleLogout(req, res));
app.get('/api/universes', (req, res) => handleListUniverses(req, res));
app.post('/api/universes/create', (req, res) => handleCreateUniverse(req, res, req.body));
app.post('/api/universes/save', (req, res) => handleSaveUniverse(req, res, req.body));
app.post('/api/universes/delete', (req, res) => handleDeleteUniverse(req, res, req.body));

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
