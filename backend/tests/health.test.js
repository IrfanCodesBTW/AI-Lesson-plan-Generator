import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { resetEnvForTests } from '../src/config/env.js';
beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
  process.env.JWT_SECRET = 'test-secret-32-characters-minimum-here';
  process.env.GEMINI_API_KEY = '';
  resetEnvForTests();
});
describe('Health endpoint', () => {
  it('GET /health returns ok', async () => {
    const app = createApp();
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.service).toBe('ai-lesson-generator-backend');
    expect(res.body.gemini).toBe('fallback');
  });
  it('GET / returns service info', async () => {
    const app = createApp();
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('ai-lesson-generator-backend');
  });
  it('GET /unknown returns 404', async () => {
    const app = createApp();
    const res = await request(app).get('/this-does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
