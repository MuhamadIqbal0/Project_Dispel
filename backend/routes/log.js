import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const router = Router();
const JWT_SECRET = 'sipel-secret-key-2026';

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try { req.user = jwt.verify(header.split(' ')[1], JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: 'Token invalid' }); }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

router.get('/', authenticate, authorize('admin'), async (req, res) => {
  const { search, aksi } = req.query;

  let sql = 'SELECT * FROM log_aktivitas WHERE 1=1';
  const params = [];

  if (search) {
    sql += ' AND (user_name LIKE ? OR aksi LIKE ? OR detail LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  if (aksi) {
    sql += ' AND aksi LIKE ?';
    params.push(`%${aksi}%`);
  }

  sql += ' ORDER BY waktu DESC';
  const logs = await db.query(sql, params);
  res.json(logs);
});

export default router;
