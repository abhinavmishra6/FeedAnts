import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Authentication is required.' });
  try { req.user = jwt.verify(token, config.jwtSecret); next(); }
  catch { return res.status(401).json({ error: 'Session is invalid or expired.' }); }
}

