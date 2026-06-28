import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { closePool, query } from '../src/lib/db.js';
import { resetEnvForTests } from '../src/config/env.js';
const TEST_DB =
  process.env.TEST_DATABASE_URL ?? 'postgresql://lesson:lesson@localhost:5433/lesson_dev';
let app;
beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = TEST_DB;
  process.env.DATABASE_DIRECT_URL = TEST_DB;
  process.env.JWT_SECRET = 'test-secret-32-characters-minimum-here-12345';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.CORS_ORIGIN = 'http://localhost:5173';
  resetEnvForTests();
  app = createApp();
});
afterAll(async () => {
  await closePool();
});
beforeEach(async () => {
  await query('DELETE FROM lesson_plans');
  await query('DELETE FROM users');
});
describe('Auth endpoints', () => {
  const validUser = {
    name: 'Test Teacher',
    email: 'teacher@example.com',
    password: 'correct-horse-battery',
  };
  it('POST /api/auth/register creates a user and returns token', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(validUser.email);
    expect(res.body.user.name).toBe(validUser.name);
    expect(res.body.user.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(res.body.user.password_hash).toBeUndefined();
  });
  it('POST /api/auth/register rejects duplicate email with 409', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });
  it('POST /api/auth/register rejects short password with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });
  it('POST /api/auth/register rejects bad email with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'not-an-email' });
    expect(res.status).toBe(400);
  });
  it('POST /api/auth/login returns token for valid creds', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe(validUser.email);
  });
  it('POST /api/auth/login rejects wrong password with 401', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'wrong-password' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
  it('POST /api/auth/login rejects unknown email with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'whatever123' });
    expect(res.status).toBe(401);
  });
});
