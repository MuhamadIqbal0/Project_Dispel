import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const router = Router();
const JWT_SECRET = 'sipel-secret-key-2026';

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

router.get('/', authenticate, async (req, res) => {
  const notif = await db.query(
    'SELECT * FROM notifikasi WHERE user_id = ? ORDER BY id DESC',
    [req.user.id]
  );
  res.json(notif);
});

router.put('/:id/read', authenticate, async (req, res) => {
  const [notif] = await db.query('SELECT * FROM notifikasi WHERE id = ?', [parseInt(req.params.id)]);
  if (!notif) return res.status(404).json({ error: 'Notifikasi tidak ditemukan' });
  if (notif.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  await db.query('UPDATE notifikasi SET dibaca = 1 WHERE id = ?', [parseInt(req.params.id)]);
  const [updated] = await db.query('SELECT * FROM notifikasi WHERE id = ?', [parseInt(req.params.id)]);
  res.json(updated);
});

router.put('/read-all', authenticate, async (req, res) => {
  await db.query('UPDATE notifikasi SET dibaca = 1 WHERE user_id = ?', [req.user.id]);
  res.json({ ok: true });
});

export default router;
