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
  const rows = await db.query('SELECT id, name, email, role, foto FROM users ORDER BY id ASC');
  res.json(rows);
});

router.post('/', authenticate, authorize('admin'), async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Semua field harus diisi' });
  }
  if (!['admin', 'pt'].includes(role)) {
    return res.status(400).json({ error: 'Role tidak valid' });
  }
  const existing = await db.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length) {
    return res.status(400).json({ error: 'Email sudah digunakan' });
  }
  const result = await db.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, password, role]);
  const id = Number(result.insertId);
  await db.query('INSERT INTO log_aktivitas (user_id, user_name, aksi, detail, waktu) VALUES (?, ?, ?, ?, ?)', [req.user.id, 'Admin', 'Tambah Akun', 'Menambahkan akun ' + name + ' (' + email + ') sebagai ' + role, db.now()]);
  const [newUser] = await db.query('SELECT id, name, email, role, foto FROM users WHERE id = ?', [id]);
  res.status(201).json(newUser);
});

router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  const { name, email, password, role } = req.body;
  const id = parseInt(req.params.id);
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Nama, email, dan role harus diisi' });
  }
  const existing = await db.query('SELECT id, name FROM users WHERE id = ?', [id]);
  if (!existing.length) return res.status(404).json({ error: 'Akun tidak ditemukan' });
  if (password) {
    await db.query('UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?', [name, email, password, role, id]);
  } else {
    await db.query('UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?', [name, email, role, id]);
  }
  await db.query('INSERT INTO log_aktivitas (user_id, user_name, aksi, detail, waktu) VALUES (?, ?, ?, ?, ?)', [req.user.id, 'Admin', 'Ubah Akun', 'Memperbarui akun ' + existing[0].name, db.now()]);
  const [updated] = await db.query('SELECT id, name, email, role, foto FROM users WHERE id = ?', [id]);
  res.json(updated);
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  const id = parseInt(req.params.id);
  if (id === req.user.id) return res.status(400).json({ error: 'Tidak dapat menghapus akun sendiri' });
  const existing = await db.query('SELECT id, name FROM users WHERE id = ?', [id]);
  if (!existing.length) return res.status(404).json({ error: 'Akun tidak ditemukan' });
  await db.query('DELETE FROM users WHERE id = ?', [id]);
  await db.query('INSERT INTO log_aktivitas (user_id, user_name, aksi, detail, waktu) VALUES (?, ?, ?, ?, ?)', [req.user.id, 'Admin', 'Hapus Akun', 'Menghapus akun ' + existing[0].name, db.now()]);
  res.json({ message: 'Akun berhasil dihapus' });
});

export default router;
