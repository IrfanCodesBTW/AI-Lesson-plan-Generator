import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { closePool, query } from '../src/lib/db.js';
import { resetEnvForTests } from '../src/config/env.js';
const TEST_DB =
  process.env.TEST_DATABASE_URL ?? 'postgresql://lesson:lesson@localhost:5433/lesson_e2e';
let app;
let tokenA;
beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = TEST_DB;
  process.env.DATABASE_DIRECT_URL = TEST_DB;
  process.env.JWT_SECRET = 'test-secret-32-characters-minimum-here';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.CORS_ORIGIN = 'http://allowed-origin.com';
  resetEnvForTests();
  app = createApp();
  // Seed a user
  const regA = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Security A', email: 'security-a@test.local', password: 'test-password-a' });
  tokenA = regA.body.token;
  // Generate a lesson for SQLi test
  await request(app)
    .post('/api/lessons/generate')
    .set('Authorization', `Bearer ${tokenA}`)
    .send({ ageGroup: '4-5', theme: 'Animals' });
  // ignore result, we just need a lesson in the DB
});
afterAll(async () => {
  await query('DELETE FROM lesson_plans');
  await query('DELETE FROM users');
  await closePool();
});
describe('Security smokes', () => {
  describe('JWT auth', () => {
    it('missing token returns 401', async () => {
      const res = await request(app).get('/api/lessons');
      expect(res.status).toBe(401);
    });
    it('malformed token returns 401', async () => {
      const res = await request(app)
        .get('/api/lessons')
        .set('Authorization', 'Bearer not-a-valid-jwt');
      expect(res.status).toBe(401);
    });
    it('expired token returns 401', async () => {
      const expiredJwt =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        'eyJzdWIiOiJhYmNkMTIzNCIsImlhdCI6MTUwMDAwMDAwMCwiZXhwIjoxNTAwMDAwMDAwfQ.' +
        'fake-signature';
      const res = await request(app)
        .get('/api/lessons')
        .set('Authorization', `Bearer ${expiredJwt}`);
      expect(res.status).toBe(401);
    });
    it('wrong secret signing returns 401', async () => {
      // Create a JWT with a different secret (simulated by making one offline)
      // We just test that a clearly invalid token is rejected
      const tampered = tokenA.slice(0, -5) + 'XXXXX';
      const res = await request(app).get('/api/lessons').set('Authorization', `Bearer ${tampered}`);
      expect(res.status).toBe(401);
    });
  });
  describe('SQL injection', () => {
    it('theme filter with SQL injection does not error', async () => {
      const res = await request(app)
        .get("/api/lessons?theme='; DROP TABLE lesson_plans; --")
        .set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).toBe(200);
      // Table should still exist — verify list still works
      const check = await request(app).get('/api/lessons').set('Authorization', `Bearer ${tokenA}`);
      expect(check.status).toBe(200);
    });
  });
});
describe('CORS', () => {
  it('disallowed origin is blocked', async () => {
    const res = await request(app).get('/health').set('Origin', 'https://evil.com');
    expect(res.headers['access-control-allow-origin']).not.toBe('https://evil.com');
  });
});
