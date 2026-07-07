import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const router = Router();
const JWT_SECRET = 'sipel-secret-key-2026';

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password harus diisi' });
  }

  const users = await db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
  const user = users[0];
  if (!user) {
    return res.status(401).json({ error: 'Email atau password salah' });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  const { password: _, ...userData } = user;
  res.json({ user: userData, token });
});

router.get('/me', authenticate, async (req, res) => {
  const users = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
  const user = users[0];
  if (!user) return res.status(401).json({ error: 'User not found' });
  const { password: _, ...userData } = user;
  res.json({ user: userData });
});

export default router;

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    req.user = jwt.verify(header.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalid' });
  }
}
