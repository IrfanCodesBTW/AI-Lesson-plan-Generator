import { test, expect } from '@playwright/test';
import { uniqueEmail, uniqueName } from './fixtures/auth';
test.describe('Ownership enforcement', () => {
  test('user B cannot view or delete user A lessons', async ({ page }) => {
    const emailA = uniqueEmail('owner');
    const emailB = uniqueEmail('other');
    const password = 'owner-e2e-pw';
    const nameA = uniqueName('Owner');
    // Register user A
    const regA = await page.request.post('/api/auth/register', {
      data: { name: nameA, email: emailA, password },
    });
    expect(regA.status()).toBe(201);
    const tokenA = (await regA.json()).token;
    // Generate a lesson as user A
    const gen = await page.request.post('/api/lessons/generate', {
      data: { ageGroup: '4-5', theme: 'Animals' },
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    expect(gen.status()).toBe(201);
    const lessonId = (await gen.json()).lesson.id;
    // Register user B
    const regB = await page.request.post('/api/auth/register', {
      data: { name: uniqueName('Other'), email: emailB, password },
    });
    expect(regB.status()).toBe(201);
    const tokenB = (await regB.json()).token;
    // User B tries to get lesson — should 404
    const get = await page.request.get(`/api/lessons/${lessonId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    expect(get.status()).toBe(404);
    // User B tries to delete lesson — should 404
    const del = await page.request.delete(`/api/lessons/${lessonId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    expect(del.status()).toBe(404);
    // User B tries to export PDF — should 404
    const pdf = await page.request.get(`/api/export/pdf/${lessonId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    expect(pdf.status()).toBe(404);
    // User B's list does not include A's lesson
    const list = await page.request.get('/api/lessons', {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const listBody = await list.json();
    expect(listBody.items).toHaveLength(0);
  });
});
