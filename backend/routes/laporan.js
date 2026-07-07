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

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

router.get('/', authenticate, async (req, res) => {
  const { status: filterStatus, negara, search } = req.query;

  let sql = 'SELECT * FROM laporan';
  const conditions = [];
  const params = [];

  if (req.user.role === 'pt') {
    conditions.push('perusahaan_id = ?');
    params.push(req.user.id);
  }
  if (filterStatus) {
    conditions.push('status = ?');
    params.push(filterStatus);
  }
  if (negara) {
    conditions.push('negara = ?');
    params.push(negara);
  }
  if (search) {
    conditions.push('(perusahaan LIKE ? OR negara LIKE ? OR periode LIKE ?)');
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY tgl_upload DESC';

  const laporan = await db.query(sql, params);
  res.json(laporan);
});

router.get('/stats', authenticate, async (req, res) => {
  let sql = 'SELECT COUNT(*) as total, SUM(status="pending") as pending, SUM(status="diterima") as diterima, SUM(status="ditolak") as ditolak FROM laporan';
  const params = [];

  if (req.user.role === 'pt') {
    sql += ' WHERE perusahaan_id = ?';
    params.push(req.user.id);
  }

  const [row] = await db.query(sql, params);
  const stats = {
    total: Number(row.total),
    pending: Number(row.pending),
    diterima: Number(row.diterima),
    ditolak: Number(row.ditolak),
  };
  res.json(stats);
});

router.post('/', authenticate, authorize('pt'), async (req, res) => {
  const { perusahaan, periode, jumlah, negara, file } = req.body;
  if (!perusahaan || !periode || !jumlah || !negara) {
    return res.status(400).json({ error: 'Semua field harus diisi' });
  }

  const result = await db.query(
    'INSERT INTO laporan (perusahaan_id, perusahaan, periode, jumlah, negara, file, status, catatan, tgl_upload) VALUES (?, ?, ?, ?, ?, ?, "pending", "", ?)',
    [req.user.id, perusahaan, periode, parseInt(jumlah), negara, file || '', db.now()]
  );
  const id = Number(result.insertId);

  await db.query(
    'INSERT INTO log_aktivitas (user_id, user_name, aksi, detail, waktu) VALUES (?, ?, "Upload Laporan", ?, ?)',
    [req.user.id, perusahaan, `Upload laporan periode ${periode} (${jumlah} CPMI ke ${negara})`, db.now()]
  );

  await db.query(
    'INSERT INTO notifikasi (user_id, title, message, jenis, dibaca, terkait_id, dibuat) VALUES (1, "Laporan Baru", ?, "pending", 0, ?, ?)',
    [`${perusahaan} mengirim laporan periode ${periode} (${jumlah} CPMI ke ${negara})`, id, db.now()]
  );

  const [newLaporan] = await db.query('SELECT * FROM laporan WHERE id = ?', [id]);
  res.status(201).json(newLaporan);
});

router.put('/:id/konfirmasi', authenticate, authorize('admin'), async (req, res) => {
  const { status, catatan } = req.body;
  if (!['diterima', 'ditolak'].includes(status)) {
    return res.status(400).json({ error: 'Status harus diterima atau ditolak' });
  }

  const [laporan] = await db.query('SELECT * FROM laporan WHERE id = ?', [parseInt(req.params.id)]);
  if (!laporan) return res.status(404).json({ error: 'Laporan tidak ditemukan' });

  await db.query(
    'UPDATE laporan SET status = ?, catatan = ?, tgl_konfirmasi = ? WHERE id = ?',
    [status, catatan || '', db.now(), parseInt(req.params.id)]
  );

  const aksi = status === 'diterima' ? 'Konfirmasi Terima' : 'Konfirmasi Tolak';
  const [admin] = await db.query('SELECT name FROM users WHERE id = ?', [req.user.id]);

  await db.query(
    'INSERT INTO log_aktivitas (user_id, user_name, aksi, detail, waktu) VALUES (?, ?, ?, ?, ?)',
    [req.user.id, admin?.name || 'Admin', aksi, `${status === 'diterima' ? 'Menerima' : 'Menolak'} laporan ${laporan.perusahaan} - ${laporan.periode}. Catatan: ${catatan || '-'}`, db.now()]
  );

  const notifTitle = status === 'diterima' ? 'Laporan Diterima' : 'Laporan Ditolak';
  const notifMsg = status === 'diterima'
    ? `Laporan periode ${laporan.periode} telah diterima oleh Admin Dinas.`
    : `Laporan periode ${laporan.periode} ditolak. Catatan: ${catatan || '-'}`;

  await db.query(
    'INSERT INTO notifikasi (user_id, title, message, jenis, dibaca, terkait_id, dibuat) VALUES (?, ?, ?, ?, 0, ?, ?)',
    [laporan.perusahaan_id, notifTitle, notifMsg, status, laporan.id, db.now()]
  );

  const [updated] = await db.query('SELECT * FROM laporan WHERE id = ?', [parseInt(req.params.id)]);
  res.json(updated);
});

router.get('/rekap', authenticate, async (req, res) => {
  const { periode, perusahaan, negara } = req.query;

  let sql = 'SELECT periode, COUNT(*) as total, SUM(status="diterima") as diterima, SUM(status="ditolak") as ditolak, SUM(status="pending") as pending FROM laporan';
  const conditions = [];
  const params = [];

  if (req.user.role === 'pt') {
    conditions.push('perusahaan_id = ?');
    params.push(req.user.id);
  }
  if (periode) {
    conditions.push('periode = ?');
    params.push(periode);
  }
  if (perusahaan) {
    conditions.push('perusahaan = ?');
    params.push(perusahaan);
  }
  if (negara) {
    conditions.push('negara = ?');
    params.push(negara);
  }

  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' GROUP BY periode ORDER BY periode DESC';

  const rows = await db.query(sql, params);
  const result = rows.map(r => ({
    periode: r.periode,
    total: Number(r.total),
    diterima: Number(r.diterima),
    ditolak: Number(r.ditolak),
    pending: Number(r.pending),
  }));
  res.json(result);
});

export default router;
