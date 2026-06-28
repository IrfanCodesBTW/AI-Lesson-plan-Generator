import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { closePool, query } from '../src/lib/db.js';
import { resetEnvForTests } from '../src/config/env.js';
vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: vi.fn(),
    SchemaType: { OBJECT: 'object', STRING: 'string', ARRAY: 'array' },
  };
});
import { GoogleGenerativeAI } from '@google/generative-ai';
let app;
let token;
const validContent = {
  objective: 'Children will explore the theme.',
  activity: '1. Step one.\n2. Step two.',
  rhyme: 'A rhyme for the theme.',
  worksheet: 'A worksheet idea.',
  materials: ['Card', 'Crayon'],
};
const TEST_DB =
  process.env.TEST_DATABASE_URL ?? 'postgresql://lesson:lesson@localhost:5433/lesson_dev';
const sampleLesson = { ageGroup: '4-5', theme: 'Animals' };
beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = TEST_DB;
  process.env.DATABASE_DIRECT_URL = TEST_DB;
  process.env.JWT_SECRET = 'test-secret-32-characters-minimum-here-12345';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.CORS_ORIGIN = 'http://localhost:5173';
  process.env.GEMINI_API_KEY = 'test-key';
  resetEnvForTests();
  app = createApp();
});
afterAll(async () => {
  await closePool();
});
beforeEach(async () => {
  await query('DELETE FROM lesson_plans');
  await query('DELETE FROM users');
  vi.mocked(GoogleGenerativeAI).mockReset();
  const reg = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Teacher', email: 't@example.com', password: 'password-strong' });
  token = reg.body.token;
});
function mockGemini(text) {
  vi.mocked(GoogleGenerativeAI).mockImplementation(() => ({
    getGenerativeModel: () => ({
      generateContent: vi.fn().mockResolvedValue({ response: { text: () => text } }),
    }),
  }));
}
describe('POST /api/lessons/generate (Phase 4 orchestrator)', () => {
  it('uses Gemini response when available and marks source=gemini', async () => {
    mockGemini(JSON.stringify(validContent));
    const res = await request(app)
      .post('/api/lessons/generate')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleLesson);
    expect(res.status).toBe(201);
    expect(res.body.lesson.source).toBe('gemini');
    expect(res.body.lesson.lessonContent).toEqual(validContent);
  });
  it('falls back to template and marks source=fallback when Gemini is unavailable', async () => {
    process.env.GEMINI_API_KEY = '';
    resetEnvForTests();
    const res = await request(app)
      .post('/api/lessons/generate')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleLesson);
    expect(res.status).toBe(201);
    expect(res.body.lesson.source).toBe('fallback');
    expect(res.body.lesson.theme).toBe('Animals');
    expect(res.body.lesson.lessonContent.objective.length).toBeGreaterThan(0);
    expect(res.body.lesson.lessonContent.materials.length).toBeGreaterThan(0);
    process.env.GEMINI_API_KEY = 'test-key';
    resetEnvForTests();
  });
  it('falls back when Gemini returns malformed JSON', async () => {
    mockGemini('not json at all');
    const res = await request(app)
      .post('/api/lessons/generate')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleLesson);
    expect(res.status).toBe(201);
    expect(res.body.lesson.source).toBe('fallback');
  });
  it('falls back when Gemini returns wrong shape', async () => {
    mockGemini(JSON.stringify({ objective: 'o' }));
    const res = await request(app)
      .post('/api/lessons/generate')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleLesson);
    expect(res.status).toBe(201);
    expect(res.body.lesson.source).toBe('fallback');
  });
  it('falls back when Gemini SDK throws', async () => {
    vi.mocked(GoogleGenerativeAI).mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: vi.fn().mockRejectedValue(new Error('network down')),
      }),
    }));
    const res = await request(app)
      .post('/api/lessons/generate')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleLesson);
    expect(res.status).toBe(201);
    expect(res.body.lesson.source).toBe('fallback');
  });
  it('completes generation in under 10 seconds end-to-end', async () => {
    mockGemini(JSON.stringify(validContent));
    const start = Date.now();
    const res = await request(app)
      .post('/api/lessons/generate')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleLesson);
    const elapsed = Date.now() - start;
    expect(res.status).toBe(201);
    expect(elapsed).toBeLessThan(10_000);
  });
});
