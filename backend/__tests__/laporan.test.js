import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';

jest.unstable_mockModule('../db.js', () => ({
  db: {
    query: jest.fn(),
    now: jest.fn(() => '2026-07-17 10:00:00'),
  },
}));

const { db } = await import('../db.js');
const app = (await import('../app.js')).default;

const JWT_SECRET = 'sipel-secret-key-2026';
function makeToken(role = 'admin', id = 1) {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '1h' });
}

afterEach(() => jest.clearAllMocks());

const mockLaporan = [
  { id: 1, perusahaan_id: 2, perusahaan: 'PT Maju', periode: '2026-01', jumlah: 10, negara: 'Malaysia', file: 'data.pdf', status: 'pending', catatan: '', tgl_upload: '2026-01-15', tgl_konfirmasi: null },
  { id: 2, perusahaan_id: 3, perusahaan: 'PT Sejahtera', periode: '2026-01', jumlah: 5, negara: 'Taiwan', file: '', status: 'diterima', catatan: 'OK', tgl_upload: '2026-01-10', tgl_konfirmasi: '2026-01-12' },
];

describe('GET /api/laporan', () => {
  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/laporan');
    expect(res.statusCode).toBe(401);
  });

  it('should return all laporan for admin', async () => {
    db.query.mockResolvedValue(mockLaporan);
    const res = await request(app)
      .get('/api/laporan')
      .set('Authorization', `Bearer ${makeToken('admin')}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockLaporan);
  });

  it('should filter by status', async () => {
    db.query.mockResolvedValue([mockLaporan[0]]);
    const res = await request(app)
      .get('/api/laporan?status=pending')
      .set('Authorization', `Bearer ${makeToken('admin')}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('should filter by negara', async () => {
    db.query.mockResolvedValue([mockLaporan[1]]);
    const res = await request(app)
      .get('/api/laporan?negara=Taiwan')
      .set('Authorization', `Bearer ${makeToken('admin')}`);
    expect(res.statusCode).toBe(200);
  });

  it('should filter by search term', async () => {
    db.query.mockResolvedValue([mockLaporan[0]]);
    const res = await request(app)
      .get('/api/laporan?search=Maju')
      .set('Authorization', `Bearer ${makeToken('admin')}`);
    expect(res.statusCode).toBe(200);
  });

  it('should scope to perusahaan_id for pt role', async () => {
    db.query.mockResolvedValue([mockLaporan[0]]);
    const res = await request(app)
      .get('/api/laporan')
      .set('Authorization', `Bearer ${makeToken('pt', 2)}`);
    expect(res.statusCode).toBe(200);
    const callArgs = db.query.mock.calls[0];
    expect(callArgs[0]).toContain('perusahaan_id = ?');
  });
});

describe('GET /api/laporan/stats', () => {
  it('should return stats for admin', async () => {
    db.query.mockResolvedValue([{ total: 10, pending: 3, diterima: 5, ditolak: 2 }]);
    const res = await request(app)
      .get('/api/laporan/stats')
      .set('Authorization', `Bearer ${makeToken('admin')}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ total: 10, pending: 3, diterima: 5, ditolak: 2 });
  });

  it('should scope stats for pt role', async () => {
    db.query.mockResolvedValue([{ total: 5, pending: 2, diterima: 2, ditolak: 1 }]);
    const res = await request(app)
      .get('/api/laporan/stats')
      .set('Authorization', `Bearer ${makeToken('pt', 2)}`);
    expect(res.statusCode).toBe(200);
    expect(db.query.mock.calls[0][0]).toContain('perusahaan_id = ?');
  });
});

describe('POST /api/laporan', () => {
  it('should return 401 without token', async () => {
    const res = await request(app).post('/api/laporan').send({ perusahaan: 'PT Test' });
    expect(res.statusCode).toBe(401);
  });

  it('should return 403 for admin role', async () => {
    const res = await request(app)
      .post('/api/laporan')
      .set('Authorization', `Bearer ${makeToken('admin')}`)
      .send({ perusahaan: 'PT Test', periode: '2026-01', jumlah: 10, negara: 'Malaysia' });
    expect(res.statusCode).toBe(403);
  });

  it('should return 400 if fields missing', async () => {
    const res = await request(app)
      .post('/api/laporan')
      .set('Authorization', `Bearer ${makeToken('pt')}`)
      .send({ perusahaan: 'PT Test' });
    expect(res.statusCode).toBe(400);
  });

  it('should create laporan with all DB calls', async () => {
    db.query
      .mockResolvedValueOnce({ insertId: 1 })
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 1, perusahaan: 'PT Test', periode: '2026-01', jumlah: 10, negara: 'Malaysia', status: 'pending' }]);

    const res = await request(app)
      .post('/api/laporan')
      .set('Authorization', `Bearer ${makeToken('pt', 5)}`)
      .send({ perusahaan: 'PT Test', periode: '2026-01', jumlah: 10, negara: 'Malaysia' });

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('pending');
    expect(db.query).toHaveBeenCalledTimes(4);
  });
});

describe('PUT /api/laporan/:id/konfirmasi', () => {
  it('should return 403 for pt role', async () => {
    const res = await request(app)
      .put('/api/laporan/1/konfirmasi')
      .set('Authorization', `Bearer ${makeToken('pt')}`)
      .send({ status: 'diterima' });
    expect(res.statusCode).toBe(403);
  });

  it('should return 400 for invalid status', async () => {
    const res = await request(app)
      .put('/api/laporan/1/konfirmasi')
      .set('Authorization', `Bearer ${makeToken('admin')}`)
      .send({ status: 'invalid' });
    expect(res.statusCode).toBe(400);
  });

  it('should return 404 if laporan not found', async () => {
    db.query.mockResolvedValue([]);
    const res = await request(app)
      .put('/api/laporan/999/konfirmasi')
      .set('Authorization', `Bearer ${makeToken('admin')}`)
      .send({ status: 'diterima' });
    expect(res.statusCode).toBe(404);
  });

  it('should accept laporan successfully', async () => {
    const laporan = { id: 1, perusahaan_id: 2, perusahaan: 'PT Maju', periode: '2026-01', status: 'pending' };
    db.query
      .mockResolvedValueOnce([laporan])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ name: 'Admin' }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ ...laporan, status: 'diterima', catatan: 'Bagus' }]);

    const res = await request(app)
      .put('/api/laporan/1/konfirmasi')
      .set('Authorization', `Bearer ${makeToken('admin')}`)
      .send({ status: 'diterima', catatan: 'Bagus' });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('diterima');
    expect(db.query).toHaveBeenCalledTimes(6);
  });

  it('should reject laporan successfully', async () => {
    const laporan = { id: 1, perusahaan_id: 2, perusahaan: 'PT Maju', periode: '2026-01', status: 'pending' };
    db.query
      .mockResolvedValueOnce([laporan])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ name: 'Admin' }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ ...laporan, status: 'ditolak', catatan: 'Tidak lengkap' }]);

    const res = await request(app)
      .put('/api/laporan/1/konfirmasi')
      .set('Authorization', `Bearer ${makeToken('admin')}`)
      .send({ status: 'ditolak', catatan: 'Tidak lengkap' });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ditolak');
  });
});

describe('GET /api/laporan/rekap', () => {
  it('should return rekap data', async () => {
    db.query.mockResolvedValue([
      { periode: '2026-01', total: 10, diterima: 5, ditolak: 3, pending: 2 },
    ]);
    const res = await request(app)
      .get('/api/laporan/rekap')
      .set('Authorization', `Bearer ${makeToken('admin')}`);
    expect(res.statusCode).toBe(200);
    expect(res.body[0]).toHaveProperty('periode', '2026-01');
    expect(res.body[0].total).toBe(10);
  });

  it('should filter rekap by periode', async () => {
    db.query.mockResolvedValue([]);
    await request(app)
      .get('/api/laporan/rekap?periode=2026-01')
      .set('Authorization', `Bearer ${makeToken('admin')}`);
    expect(db.query.mock.calls[0][0]).toContain('periode = ?');
  });

  it('should filter rekap by perusahaan', async () => {
    db.query.mockResolvedValue([]);
    await request(app)
      .get('/api/laporan/rekap?perusahaan=PT+Maju')
      .set('Authorization', `Bearer ${makeToken('admin')}`);
    expect(db.query.mock.calls[0][0]).toContain('perusahaan = ?');
  });

  it('should scope rekap for pt role', async () => {
    db.query.mockResolvedValue([]);
    await request(app)
      .get('/api/laporan/rekap')
      .set('Authorization', `Bearer ${makeToken('pt', 2)}`);
    expect(db.query.mock.calls[0][0]).toContain('perusahaan_id = ?');
  });
});
