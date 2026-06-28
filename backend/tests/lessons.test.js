import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { closePool, query } from '../src/lib/db.js';
import { resetEnvForTests } from '../src/config/env.js';
const TEST_DB =
  process.env.TEST_DATABASE_URL ?? 'postgresql://lesson:lesson@localhost:5433/lesson_dev';
let app;
let token;
const validUser = {
  name: 'Lesson Tester',
  email: 'lessons@example.com',
  password: 'lessons-tester-pw',
};
const sampleLesson = {
  ageGroup: '4-5',
  theme: 'Animals',
  date: '2026-06-07',
};
beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = TEST_DB;
  process.env.DATABASE_DIRECT_URL = TEST_DB;
  process.env.JWT_SECRET = 'test-secret-32-characters-minimum-here-12345';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.CORS_ORIGIN = 'http://localhost:5173';
  resetEnvForTests();
  app = createApp();
  const reg = await request(app).post('/api/auth/register').send(validUser);
  token = reg.body.token;
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
async function createSample(overrides = {}) {
  const res = await request(app)
    .post('/api/lessons/generate')
    .set('Authorization', `Bearer ${token}`)
    .send({ ...sampleLesson, ...overrides });
  expect(res.status).toBe(201);
  return res.body.lesson.id;
}
describe('Lesson CRUD', () => {
  it('GET /api/lessons returns empty list for new user', async () => {
    const res = await request(app).get('/api/lessons').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([]);
    expect(res.body.total).toBe(0);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(20);
  });
  it('GET /api/lessons rejects missing token with 401', async () => {
    const res = await request(app).get('/api/lessons');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
  it('POST /api/lessons/generate creates a lesson and persists it', async () => {
    const id = await createSample();
    const detail = await request(app)
      .get(`/api/lessons/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(detail.status).toBe(200);
    expect(detail.body.lesson.id).toBe(id);
    expect(detail.body.lesson.theme).toBe('Animals');
    expect(detail.body.lesson.ageGroup).toBe('4-5');
    expect(detail.body.lesson.source).toBe('fallback');
    expect(detail.body.lesson.lessonContent.objective).toBeTruthy();
    expect(Array.isArray(detail.body.lesson.lessonContent.materials)).toBe(true);
  });
  it('POST /api/lessons/generate rejects bad age group with 400', async () => {
    const res = await request(app)
      .post('/api/lessons/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...sampleLesson, ageGroup: '99' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });
  it('GET /api/lessons returns paginated list with theme filter', async () => {
    await createSample({ theme: 'Animals' });
    await createSample({ theme: 'Colors' });
    await createSample({ theme: 'Animals' });
    const all = await request(app).get('/api/lessons').set('Authorization', `Bearer ${token}`);
    expect(all.status).toBe(200);
    expect(all.body.total).toBe(3);
    const animals = await request(app)
      .get('/api/lessons?theme=animals')
      .set('Authorization', `Bearer ${token}`);
    expect(animals.status).toBe(200);
    expect(animals.body.total).toBe(2);
    expect(animals.body.items.every((l) => l.theme === 'Animals')).toBe(true);
  });
  it("GET /api/lessons/:id returns 404 for another user's lesson", async () => {
    const id = await createSample();
    const other = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Other', email: 'other@example.com', password: 'other-password-1' });
    const otherToken = other.body.token;
    const res = await request(app)
      .get(`/api/lessons/${id}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(404);
  });
  it('DELETE /api/lessons/:id removes the lesson and returns 204', async () => {
    const id = await createSample();
    const del = await request(app)
      .delete(`/api/lessons/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(204);
    const after = await request(app)
      .get(`/api/lessons/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(after.status).toBe(404);
    const list = await request(app).get('/api/lessons').set('Authorization', `Bearer ${token}`);
    expect(list.body.total).toBe(0);
  });
  it('DELETE /api/lessons/:id returns 404 for non-owner', async () => {
    const id = await createSample();
    const other = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Other2', email: 'other2@example.com', password: 'other2-password-1' });
    const otherToken = other.body.token;
    const res = await request(app)
      .delete(`/api/lessons/${id}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(404);
  });
});
