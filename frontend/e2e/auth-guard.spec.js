import { test, expect } from '@playwright/test';
test.describe('Auth guard', () => {
  test('anonymous /dashboard redirects to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL('/login');
    await expect(page.locator('h1')).toHaveText('Sign in to CurriculumAI');
  });
  test('anonymous /lessons/:id redirects to /login', async ({ page }) => {
    await page.goto('/lessons/00000000-0000-0000-0000-000000000000');
    await page.waitForURL('/login');
    await expect(page.locator('h1')).toHaveText('Sign in to CurriculumAI');
  });
});
