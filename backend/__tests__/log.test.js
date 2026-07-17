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

describe('GET /api/log', () => {
  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/log');
    expect(res.statusCode).toBe(401);
  });

  it('should return 403 for pt role', async () => {
    const res = await request(app)
      .get('/api/log')
      .set('Authorization', `Bearer ${makeToken('pt')}`);
    expect(res.statusCode).toBe(403);
  });

  it('should return all logs for admin', async () => {
    const mockLogs = [
      { id: 1, user_id: 1, user_name: 'Admin', aksi: 'Upload Laporan', detail: 'Upload laporan periode 2026-01', waktu: '2026-01-15' },
      { id: 2, user_id: 1, user_name: 'Admin', aksi: 'Konfirmasi Terima', detail: 'Menerima laporan PT Maju', waktu: '2026-01-16' },
    ];
    db.query.mockResolvedValue(mockLogs);
    const res = await request(app)
      .get('/api/log')
      .set('Authorization', `Bearer ${makeToken('admin')}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockLogs);
  });

  it('should filter logs by search', async () => {
    db.query.mockResolvedValue([]);
    await request(app)
      .get('/api/log?search=Admin')
      .set('Authorization', `Bearer ${makeToken('admin')}`);
    const sql = db.query.mock.calls[0][0];
    expect(sql).toContain('user_name LIKE ?');
  });

  it('should filter logs by aksi', async () => {
    db.query.mockResolvedValue([]);
    await request(app)
      .get('/api/log?aksi=Upload')
      .set('Authorization', `Bearer ${makeToken('admin')}`);
    const sql = db.query.mock.calls[0][0];
    expect(sql).toContain('aksi LIKE ?');
  });

  it('should combine search and aksi filters', async () => {
    db.query.mockResolvedValue([]);
    await request(app)
      .get('/api/log?search=Admin&aksi=Upload')
      .set('Authorization', `Bearer ${makeToken('admin')}`);
    const sql = db.query.mock.calls[0][0];
    expect(sql).toContain('user_name LIKE ?');
    expect(sql).toContain('aksi LIKE ?');
  });
});
