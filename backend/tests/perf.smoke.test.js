import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { closePool, query } from '../src/lib/db.js';
import { resetEnvForTests } from '../src/config/env.js';
const TEST_DB =
  process.env.TEST_DATABASE_URL ?? 'postgresql://lesson:lesson@localhost:5433/lesson_e2e';
let app;
let token;
let lessonId;
beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = TEST_DB;
  process.env.DATABASE_DIRECT_URL = TEST_DB;
  process.env.JWT_SECRET = 'test-secret-32-characters-minimum-here';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.CORS_ORIGIN = 'http://allowed-origin.com';
  resetEnvForTests();
  app = createApp();
  const reg = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Perf User', email: 'perf-user@test.local', password: 'perf-password' });
  token = reg.body.token;
  const gen = await request(app)
    .post('/api/lessons/generate')
    .set('Authorization', `Bearer ${token}`)
    .send({ ageGroup: '4-5', theme: 'Animals' });
  lessonId = gen.body.lesson.id;
});
afterAll(async () => {
  await query('DELETE FROM lesson_plans');
  await query('DELETE FROM users');
  await closePool();
});
describe('Performance smokes', () => {
  it('50 parallel /api/lessons/generate all complete within 10s', async () => {
    const start = performance.now();
    const promises = Array.from({ length: 50 }, () =>
      request(app)
        .post('/api/lessons/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({ ageGroup: '3-4', theme: 'Colors' })
        .timeout(10_000),
    );
    const results = await Promise.all(promises);
    const elapsed = performance.now() - start;
    const succeeded = results.filter((r) => r.status === 201).length;
    expect(succeeded).toBe(50);
    expect(elapsed).toBeLessThan(10_000);
  });
  it('/api/export/pdf/:id completes under 2s', async () => {
    const start = performance.now();
    const res = await request(app)
      .get(`/api/export/pdf/${lessonId}`)
      .set('Authorization', `Bearer ${token}`)
      .buffer(true)
      .parse((res, cb) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => cb(null, Buffer.concat(chunks)));
      });
    const elapsed = performance.now() - start;
    expect(res.status).toBe(200);
    expect(elapsed).toBeLessThan(2_000);
  });
});
