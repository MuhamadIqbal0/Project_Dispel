import { Router } from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();
const JWT_SECRET = 'sipel-secret-key-2026';

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user-${req.user.id}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file gambar (jpg, jpeg, png, gif, webp) yang diizinkan'));
    }
  },
});

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

router.put('/profile', authenticate, async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Nama dan email harus diisi' });
  }
  await db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, req.user.id]);
  const users = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
  const { password: _, ...userData } = users[0];
  res.json({ user: userData });
});

router.post('/upload-foto', authenticate, (req, res) => {
  upload.single('foto')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Gagal upload foto' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Pilih file foto terlebih dahulu' });
    }
    const fotoUrl = `/uploads/${req.file.filename}`;
    await db.query('UPDATE users SET foto = ? WHERE id = ?', [fotoUrl, req.user.id]);
    const users = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const { password: _, ...userData } = users[0];
    res.json({ user: userData });
  });
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
