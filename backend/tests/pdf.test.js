import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { closePool, query } from '../src/lib/db.js';
import { resetEnvForTests } from '../src/config/env.js';
let app;
let token;
const TEST_DB =
  process.env.TEST_DATABASE_URL ?? 'postgresql://lesson:lesson@localhost:5433/lesson_dev';
const validUser = { name: 'PDF Tester', email: 'pdf@example.com', password: 'pdf-tester-pw' };
const otherUser = { name: 'Other PDF', email: 'other-pdf@example.com', password: 'other-pdf-pw' };
beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = TEST_DB;
  process.env.DATABASE_DIRECT_URL = TEST_DB;
  process.env.JWT_SECRET = 'test-secret-32-characters-minimum-here-12345';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.CORS_ORIGIN = 'http://localhost:5173';
  process.env.GEMINI_API_KEY = '';
  resetEnvForTests();
  app = createApp();
});
afterAll(async () => {
  await closePool();
});
beforeEach(async () => {
  await query('DELETE FROM lesson_plans');
  await query('DELETE FROM users');
  const reg = await request(app).post('/api/auth/register').send(validUser);
  token = reg.body.token;
});
async function createLesson() {
  const res = await request(app)
    .post('/api/lessons/generate')
    .set('Authorization', `Bearer ${token}`)
    .send({ ageGroup: '4-5', theme: 'Animals' });
  return { id: res.body.lesson.id, theme: res.body.lesson.theme };
}
describe('GET /api/export/pdf/:id', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/export/pdf/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
  it('returns application/pdf for own lesson', async () => {
    const { id } = await createLesson();
    const res = await request(app)
      .get(`/api/export/pdf/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .buffer(true)
      .parse((response, callback) => {
        const chunks = [];
        response.on('data', (c) => chunks.push(c));
        response.on('end', () => callback(null, Buffer.concat(chunks)));
      });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/pdf/);
    expect(res.headers['content-disposition']).toMatch(/attachment; filename=.+\.pdf/);
    const buf = res.body;
    expect(buf.length).toBeGreaterThan(100);
    expect(buf.slice(0, 4).toString()).toBe('%PDF');
  });
  it("returns 404 for another user's lesson", async () => {
    const { id } = await createLesson();
    const other = await request(app).post('/api/auth/register').send(otherUser);
    const otherToken = other.body.token;
    const res = await request(app)
      .get(`/api/export/pdf/${id}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(404);
  });
  it('returns 404 for a non-existent lesson', async () => {
    const res = await request(app)
      .get('/api/export/pdf/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
  it('filename encodes the theme slug and date', async () => {
    const { id } = await createLesson();
    const res = await request(app)
      .get(`/api/export/pdf/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .buffer(true)
      .parse((response, callback) => {
        const chunks = [];
        response.on('data', (c) => chunks.push(c));
        response.on('end', () => callback(null, Buffer.concat(chunks)));
      });
    expect(res.headers['content-disposition']).toMatch(
      /filename="lesson-animals-\d{4}-\d{2}-\d{2}\.pdf"/,
    );
  });
});
