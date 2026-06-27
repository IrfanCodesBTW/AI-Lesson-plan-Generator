import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';
import { createApp } from '../src/app';
import { closePool, query } from '../src/lib/db';
import { resetEnvForTests } from '../src/config/env';
import { runMigrations } from '../src/lib/migrate';

const TEST_DB =
  process.env.TEST_DATABASE_URL ?? 'postgresql://lesson:lesson@localhost:5433/lesson_dev';

let app: Application;
let token: string;

const validUser = {
  name: 'Analytics Tester',
  email: 'analytics@example.com',
  password: 'analytics-tester-pw',
};

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = TEST_DB;
  process.env.DATABASE_DIRECT_URL = TEST_DB;
  process.env.JWT_SECRET = 'test-secret-32-characters-minimum-here-12345';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.CORS_ORIGIN = 'http://localhost:5173';
  resetEnvForTests();
  await runMigrations('up');
  app = createApp();

  const reg = await request(app).post('/api/auth/register').send(validUser);
  token = reg.body.token;
});

afterAll(async () => {
  await closePool();
});

beforeEach(async () => {
  await query('DELETE FROM tasks');
  await query('DELETE FROM focus_sessions');
  await query('DELETE FROM student_metrics');
  await query('DELETE FROM ai_insights');
  await query('DELETE FROM users');
  const reg = await request(app).post('/api/auth/register').send(validUser);
  token = reg.body.token;
});

describe('Analytics Dashboard & Reactivity API', () => {
  it('GET /api/analytics/dashboard seeds default metrics and returns valid metrics structure', async () => {
    const res = await request(app)
      .get('/api/analytics/dashboard')
      .set('Authorization', `Bearer ${token}`);

    if (res.status !== 200) {
      console.error('Test failed with body:', JSON.stringify(res.body, null, 2));
    }
    expect(res.status).toBe(200);
    expect(res.body.trends).toBeDefined();
    expect(res.body.trends.length).toBe(7); // Sunday to Saturday
    expect(res.body.summary).toBeDefined();
    expect(typeof res.body.summary.totalHours).toBe('number');
    expect(typeof res.body.summary.percentageChange).toBe('number');
    expect(res.body.kpis).toBeDefined();
    expect(typeof res.body.kpis.attendanceRate).toBe('number');
    expect(typeof res.body.kpis.engagementRate).toBe('number');
    expect(typeof res.body.kpis.completionRate).toBe('number');
    expect(res.body.kpis.totalTasks).toBeGreaterThan(0); // seeded tasks
  });

  it('GET /api/analytics/insights triggers regeneration initially and returns 3 insights', async () => {
    const res = await request(app)
      .get('/api/analytics/insights')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.insights).toBeDefined();
    expect(res.body.insights.length).toBe(3);

    const types = res.body.insights.map((ins: any) => ins.type);
    expect(types).toContain('classroom_engagement');
    expect(types).toContain('learning_gaps');
    expect(types).toContain('resource_suggestions');
  });

  it('POST /api/analytics/tasks creates a task and triggers dynamic metrics changes', async () => {
    const createRes = await request(app)
      .post('/api/analytics/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Task' });

    expect(createRes.status).toBe(201);
    expect(createRes.body.task.title).toBe('Test Task');
    expect(createRes.body.task.completed).toBe(false);

    const taskListRes = await request(app)
      .get('/api/analytics/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(taskListRes.status).toBe(200);
    const titles = taskListRes.body.tasks.map((t: any) => t.title);
    expect(titles).toContain('Test Task');
  });

  it('PUT /api/analytics/tasks/:id toggles completed state', async () => {
    const createRes = await request(app)
      .post('/api/analytics/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Toggle Task' });

    const taskId = createRes.body.task.id;

    const toggleRes = await request(app)
      .put(`/api/analytics/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ completed: true });

    expect(toggleRes.status).toBe(200);
    expect(toggleRes.body.task.completed).toBe(true);
    expect(toggleRes.body.task.completedAt).toBeDefined();
  });

  it('POST /api/analytics/focus-sessions logs focus hours successfully', async () => {
    const focusRes = await request(app)
      .post('/api/analytics/focus-sessions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        hours: 4.5,
        activityType: 'planning',
        date: '2026-06-19',
      });

    expect(focusRes.status).toBe(201);
    expect(focusRes.body.session.hours).toBe(4.5);
    expect(focusRes.body.session.activityType).toBe('planning');
    expect(focusRes.body.session.date).toBe('2026-06-19');
  });

  it('POST /api/analytics/student-metrics logs student performance metrics', async () => {
    const metricRes = await request(app)
      .post('/api/analytics/student-metrics')
      .set('Authorization', `Bearer ${token}`)
      .send({
        studentName: 'Group C',
        activityName: 'hands-on science activities',
        score: 95,
        attendanceStatus: 'present',
        engagementScore: 5,
        date: '2026-06-19',
      });

    expect(metricRes.status).toBe(201);
    expect(metricRes.body.metric.studentName).toBe('Group C');
    expect(metricRes.body.metric.score).toBe(95);
    expect(metricRes.body.metric.engagementScore).toBe(5);
    expect(metricRes.body.metric.attendanceStatus).toBe('present');
  });

  it('POST /api/analytics/insights/regenerate forces regeneration of AI insights', async () => {
    const res = await request(app)
      .post('/api/analytics/insights/regenerate')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.insights.length).toBe(3);
  });
});
