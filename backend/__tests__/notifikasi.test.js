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

describe('GET /api/notifikasi', () => {
  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/notifikasi');
    expect(res.statusCode).toBe(401);
  });

  it('should return notifications for user', async () => {
    const mockNotif = [
      { id: 1, user_id: 1, title: 'Laporan Baru', message: 'PT Maju mengirim laporan', jenis: 'pending', dibaca: 0, terkait_id: 1, dibuat: '2026-01-15' },
    ];
    db.query.mockResolvedValue(mockNotif);
    const res = await request(app)
      .get('/api/notifikasi')
      .set('Authorization', `Bearer ${makeToken('admin', 1)}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockNotif);
  });

  it('should only return notifications for current user', async () => {
    db.query.mockResolvedValue([]);
    await request(app)
      .get('/api/notifikasi')
      .set('Authorization', `Bearer ${makeToken('pt', 5)}`);
    expect(db.query.mock.calls[0][1]).toContain(5);
  });
});

describe('PUT /api/notifikasi/:id/read', () => {
  it('should return 401 without token', async () => {
    const res = await request(app).put('/api/notifikasi/1/read');
    expect(res.statusCode).toBe(401);
  });

  it('should return 404 if notification not found', async () => {
    db.query.mockResolvedValue([]);
    const res = await request(app)
      .put('/api/notifikasi/999/read')
      .set('Authorization', `Bearer ${makeToken()}`);
    expect(res.statusCode).toBe(404);
  });

  it('should return 403 if notification belongs to another user', async () => {
    db.query.mockResolvedValue([{ id: 1, user_id: 2, title: 'Test', dibaca: 0 }]);
    const res = await request(app)
      .put('/api/notifikasi/1/read')
      .set('Authorization', `Bearer ${makeToken('admin', 1)}`);
    expect(res.statusCode).toBe(403);
  });

  it('should mark notification as read', async () => {
    db.query
      .mockResolvedValueOnce([{ id: 1, user_id: 1, title: 'Test', dibaca: 0 }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 1, user_id: 1, title: 'Test', dibaca: 1 }]);
    const res = await request(app)
      .put('/api/notifikasi/1/read')
      .set('Authorization', `Bearer ${makeToken('admin', 1)}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.dibaca).toBe(1);
  });
});

describe('PUT /api/notifikasi/read-all', () => {
  it('should return 401 without token', async () => {
    const res = await request(app).put('/api/notifikasi/read-all');
    expect(res.statusCode).toBe(401);
  });

  it('should mark all notifications as read', async () => {
    db.query.mockResolvedValue([]);
    const res = await request(app)
      .put('/api/notifikasi/read-all')
      .set('Authorization', `Bearer ${makeToken('admin', 1)}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(db.query.mock.calls[0][0]).toContain('SET dibaca = 1');
    expect(db.query.mock.calls[0][1]).toContain(1);
  });
});
