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

router.get('/', authenticate, async (req, res) => {
  const perusahaan = await db.query('SELECT * FROM perusahaan ORDER BY nama ASC');
  res.json(perusahaan);
});

router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { nama, alamat, kontak, status } = req.body;
    if (!nama) return res.status(400).json({ error: 'Nama perusahaan wajib diisi' });

    const result = await db.query(
      'INSERT INTO perusahaan (nama, alamat, kontak, status) VALUES (?, ?, ?, ?)',
      [nama, alamat || '', kontak || '', status || 'aktif']
    );
    const id = Number(result.insertId);

    const [admin] = await db.query('SELECT name FROM users WHERE id = ?', [req.user.id]);
    await db.query(
      'INSERT INTO log_aktivitas (user_id, user_name, aksi, detail, waktu) VALUES (?, ?, "Tambah Perusahaan", ?, ?)',
      [req.user.id, admin?.name || 'Admin', `Menambahkan perusahaan: ${nama}`, db.now()]
    );

    const [newP] = await db.query('SELECT * FROM perusahaan WHERE id = ?', [id]);
    res.status(201).json(newP);
  } catch (err) {
    console.error('Tambah perusahaan error:', err.message, err.stack);
    res.status(500).json({ error: err.message || 'Gagal menambahkan perusahaan' });
  }
});

router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { nama, alamat, kontak, status } = req.body;
    const [p] = await db.query('SELECT * FROM perusahaan WHERE id = ?', [parseInt(req.params.id)]);
    if (!p) return res.status(404).json({ error: 'Not found' });

    await db.query(
      'UPDATE perusahaan SET nama = COALESCE(?, nama), alamat = COALESCE(?, alamat), kontak = COALESCE(?, kontak), status = COALESCE(?, status) WHERE id = ?',
      [nama ?? null, alamat ?? null, kontak ?? null, status ?? null, parseInt(req.params.id)]
    );

    const [updated] = await db.query('SELECT * FROM perusahaan WHERE id = ?', [parseInt(req.params.id)]);
    res.json(updated);
  } catch (err) {
    console.error('Update perusahaan error:', err.message);
    res.status(500).json({ error: 'Gagal menyimpan data perusahaan' });
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  const [p] = await db.query('SELECT * FROM perusahaan WHERE id = ?', [parseInt(req.params.id)]);
  if (!p) return res.status(404).json({ error: 'Not found' });

  await db.query('DELETE FROM perusahaan WHERE id = ?', [parseInt(req.params.id)]);

  const [admin] = await db.query('SELECT name FROM users WHERE id = ?', [req.user.id]);
  await db.query(
    'INSERT INTO log_aktivitas (user_id, user_name, aksi, detail, waktu) VALUES (?, ?, "Hapus Perusahaan", ?, ?)',
    [req.user.id, admin?.name || 'Admin', `Menghapus perusahaan: ${p.nama}`, db.now()]
  );

  res.json({ message: 'Deleted' });
});

export default router;
