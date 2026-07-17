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

describe('GET /api/users', () => {
  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(401);
  });

  it('should return 403 for pt role', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${makeToken('pt')}`);
    expect(res.statusCode).toBe(403);
  });

  it('should return all users for admin', async () => {
    const mockUsers = [
      { id: 1, name: 'Admin', email: 'admin@test.com', role: 'admin', foto: null },
      { id: 2, name: 'PT Maju', email: 'pt@test.com', role: 'pt', foto: null },
    ];
    db.query.mockResolvedValue(mockUsers);
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${makeToken('admin')}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockUsers);
    expect(res.body[0]).not.toHaveProperty('password');
  });
});

describe('POST /api/users', () => {
  it('should return 403 for pt role', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${makeToken('pt')}`)
      .send({ name: 'New', email: 'new@test.com', password: 'pass', role: 'pt' });
    expect(res.statusCode).toBe(403);
  });

  it('should return 400 if fields missing', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${makeToken('admin')}`)
      .send({ name: 'Test' });
    expect(res.statusCode).toBe(400);
  });

  it('should return 400 for invalid role', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${makeToken('admin')}`)
      .send({ name: 'Test', email: 'test@test.com', password: 'pass', role: 'invalid' });
    expect(res.statusCode).toBe(400);
  });

  it('should return 400 if email already exists', async () => {
    db.query.mockResolvedValue([{ id: 1 }]);
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${makeToken('admin')}`)
      .send({ name: 'Test', email: 'existing@test.com', password: 'pass', role: 'pt' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/sudah digunakan/);
  });

  it('should create user successfully', async () => {
    db.query
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({ insertId: 10 })
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 10, name: 'New User', email: 'new@test.com', role: 'pt', foto: null }]);

    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${makeToken('admin')}`)
      .send({ name: 'New User', email: 'new@test.com', password: 'pass123', role: 'pt' });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('New User');
    expect(res.body).not.toHaveProperty('password');
  });
});

describe('PUT /api/users/:id', () => {
  it('should return 403 for pt role', async () => {
    const res = await request(app)
      .put('/api/users/2')
      .set('Authorization', `Bearer ${makeToken('pt')}`)
      .send({ name: 'Updated', email: 'upd@test.com', role: 'pt' });
    expect(res.statusCode).toBe(403);
  });

  it('should return 400 if required fields missing', async () => {
    const res = await request(app)
      .put('/api/users/2')
      .set('Authorization', `Bearer ${makeToken('admin')}`)
      .send({ name: '' });
    expect(res.statusCode).toBe(400);
  });

  it('should return 404 if user not found', async () => {
    db.query.mockResolvedValue([]);
    const res = await request(app)
      .put('/api/users/999')
      .set('Authorization', `Bearer ${makeToken('admin')}`)
      .send({ name: 'Test', email: 'test@test.com', role: 'pt' });
    expect(res.statusCode).toBe(404);
  });

  it('should update user without password', async () => {
    db.query
      .mockResolvedValueOnce([{ id: 2, name: 'Old Name' }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 2, name: 'Updated', email: 'upd@test.com', role: 'pt', foto: null }]);

    const res = await request(app)
      .put('/api/users/2')
      .set('Authorization', `Bearer ${makeToken('admin')}`)
      .send({ name: 'Updated', email: 'upd@test.com', role: 'pt' });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated');
  });

  it('should update user with password', async () => {
    db.query
      .mockResolvedValueOnce([{ id: 2, name: 'Old Name' }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 2, name: 'Updated', email: 'upd@test.com', role: 'pt', foto: null }]);

    const res = await request(app)
      .put('/api/users/2')
      .set('Authorization', `Bearer ${makeToken('admin')}`)
      .send({ name: 'Updated', email: 'upd@test.com', password: 'newpass', role: 'pt' });

    expect(res.statusCode).toBe(200);
  });
});

describe('DELETE /api/users/:id', () => {
  it('should return 403 for pt role', async () => {
    const res = await request(app)
      .delete('/api/users/2')
      .set('Authorization', `Bearer ${makeToken('pt')}`);
    expect(res.statusCode).toBe(403);
  });

  it('should return 400 when trying to delete self', async () => {
    const res = await request(app)
      .delete('/api/users/1')
      .set('Authorization', `Bearer ${makeToken('admin', 1)}`);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/menghapus akun sendiri/);
  });

  it('should return 404 if user not found', async () => {
    db.query.mockResolvedValue([]);
    const res = await request(app)
      .delete('/api/users/999')
      .set('Authorization', `Bearer ${makeToken('admin', 1)}`);
    expect(res.statusCode).toBe(404);
  });

  it('should delete user successfully', async () => {
    db.query
      .mockResolvedValueOnce([{ id: 2, name: 'PT Maju' }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const res = await request(app)
      .delete('/api/users/2')
      .set('Authorization', `Bearer ${makeToken('admin', 1)}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/berhasil dihapus/);
  });
});
