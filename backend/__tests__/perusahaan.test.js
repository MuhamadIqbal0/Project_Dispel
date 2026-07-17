import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';

jest.unstable_mockModule('../db.js', () => ({
  db: {
    query: jest.fn(),
    now: jest.fn(() => '2026-07-17 00:00:00'),
  },
}));

const { db } = await import('../db.js');
const app = (await import('../app.js')).default;

const JWT_SECRET = 'sipel-secret-key-2026';

function makeToken(role = 'admin') {
  return jwt.sign({ id: 1, role }, JWT_SECRET, { expiresIn: '1h' });
}

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/perusahaan', () => {
  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/perusahaan');
    expect(res.statusCode).toBe(401);
  });

  it('should return list of perusahaan', async () => {
    const mockData = [
      { id: 1, nama: 'PT Maju', alamat: 'Jakarta', kontak: '08123', status: 'aktif' },
    ];
    db.query.mockResolvedValue(mockData);

    const res = await request(app)
      .get('/api/perusahaan')
      .set('Authorization', `Bearer ${makeToken('admin')}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData);
  });
});

describe('POST /api/perusahaan', () => {
  it('should return 403 for non-admin role', async () => {
    const res = await request(app)
      .post('/api/perusahaan')
      .set('Authorization', `Bearer ${makeToken('pt')}`)
      .send({ nama: 'PT Baru' });

    expect(res.statusCode).toBe(403);
  });

  it('should return 400 if nama is missing', async () => {
    const res = await request(app)
      .post('/api/perusahaan')
      .set('Authorization', `Bearer ${makeToken('admin')}`)
      .send({ nama: '' });

    expect(res.statusCode).toBe(400);
  });

  it('should create perusahaan and log activity', async () => {
    db.query
      .mockResolvedValueOnce({ insertId: 1 })
      .mockResolvedValueOnce([{ name: 'Admin' }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 1, nama: 'PT Baru', alamat: 'Bandung', kontak: '08999', status: 'aktif' }]);

    const res = await request(app)
      .post('/api/perusahaan')
      .set('Authorization', `Bearer ${makeToken('admin')}`)
      .send({ nama: 'PT Baru', alamat: 'Bandung', kontak: '08999' });

    expect(res.statusCode).toBe(201);
    expect(res.body.nama).toBe('PT Baru');
    expect(db.query).toHaveBeenCalledTimes(4);
  });
});

describe('DELETE /api/perusahaan/:id', () => {
  it('should return 404 if perusahaan not found', async () => {
    db.query.mockResolvedValue([]);

    const res = await request(app)
      .delete('/api/perusahaan/999')
      .set('Authorization', `Bearer ${makeToken('admin')}`);

    expect(res.statusCode).toBe(404);
  });

  it('should delete perusahaan and log activity', async () => {
    db.query
      .mockResolvedValueOnce([{ id: 1, nama: 'PT Lama' }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ name: 'Admin' }])
      .mockResolvedValueOnce([]);

    const res = await request(app)
      .delete('/api/perusahaan/1')
      .set('Authorization', `Bearer ${makeToken('admin')}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Deleted');
  });
});
