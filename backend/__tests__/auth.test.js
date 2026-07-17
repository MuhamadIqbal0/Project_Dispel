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

describe('PUT /api/auth/profile', () => {
  it('should return 401 without token', async () => {
    const res = await request(app).put('/api/auth/profile').send({ name: 'Test', email: 'test@test.com' });
    expect(res.statusCode).toBe(401);
  });

  it('should return 400 if name or email missing', async () => {
    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ name: '', email: '' });
    expect(res.statusCode).toBe(400);
  });

  it('should update profile successfully', async () => {
    db.query
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 1, name: 'Updated', email: 'updated@test.com', role: 'admin' }]);

    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ name: 'Updated', email: 'updated@test.com' });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.name).toBe('Updated');
  });
});

describe('POST /api/auth/login - edge cases', () => {
  it('should return 400 with empty body', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.statusCode).toBe(400);
  });

  it('should return 400 with no body', async () => {
    const res = await request(app).post('/api/auth/login');
    expect(res.statusCode).toBe(400);
  });
});

describe('GET /api/auth/me - edge cases', () => {
  it('should return 401 if user not found in DB', async () => {
    db.query.mockResolvedValue([]);
    const token = jwt.sign({ id: 999, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(401);
  });
});
