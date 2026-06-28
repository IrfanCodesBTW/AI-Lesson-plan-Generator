import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { uniqueEmail, uniqueName } from './fixtures/auth';
test.describe('Accessibility', () => {
  test('Home page has no serious or critical violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h2:has-text("System Connection Status")');
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious'),
    ).toHaveLength(0);
  });
  test('Login page has no serious or critical violations', async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector('h1');
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious'),
    ).toHaveLength(0);
  });
  test('Register page has no serious or critical violations', async ({ page }) => {
    await page.goto('/register');
    await page.waitForSelector('h1');
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious'),
    ).toHaveLength(0);
  });
  test('Dashboard page has no serious or critical violations', async ({ page, request }) => {
    // Register and seed auth
    const email = uniqueEmail('a11y');
    const password = 'a11y-e2e-pw';
    const reg = await request.post('/api/auth/register', {
      data: { name: uniqueName('A11y'), email, password },
    });
    const { token, user } = await reg.json();
    await page.addInitScript(
      ({ t, u }) => {
        localStorage.setItem('token', t);
        localStorage.setItem('user', JSON.stringify(u));
      },
      { t: token, u: user },
    );
    await page.goto('/dashboard');
    await page.waitForSelector('h1:has-text("Dashboard")');
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious'),
    ).toHaveLength(0);
  });
  test('Lesson detail page has no serious or critical violations', async ({ page, request }) => {
    // Register and generate a lesson
    const email = uniqueEmail('a11y-detail');
    const password = 'a11y-e2e-pw';
    const reg = await request.post('/api/auth/register', {
      data: { name: uniqueName('A11yD'), email, password },
    });
    const { token, user } = await reg.json();
    const gen = await request.post('/api/lessons/generate', {
      data: { ageGroup: '4-5', theme: 'Numbers & Counting' },
      headers: { Authorization: `Bearer ${token}` },
    });
    const { lesson } = await gen.json();
    await page.addInitScript(
      ({ t, u }) => {
        localStorage.setItem('token', t);
        localStorage.setItem('user', JSON.stringify(u));
      },
      { t: token, u: user },
    );
    await page.goto(`/lessons/${lesson.id}`);
    await page.waitForSelector('h1:has-text("Numbers & Counting")');
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious'),
    ).toHaveLength(0);
  });
});
