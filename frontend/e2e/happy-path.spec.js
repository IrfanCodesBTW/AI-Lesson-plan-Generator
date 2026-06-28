import { test, expect } from '@playwright/test';
import { uniqueEmail, uniqueName } from './fixtures/auth';
test.describe('Happy path', () => {
  test('register, generate, view, download PDF, and delete', async ({ page }) => {
    const email = uniqueEmail('happy');
    const password = 'happy-e2e-pw';
    // 1. Register
    await page.goto('/register');
    await page.fill('#name', uniqueName('Happy'));
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    await expect(page.locator('h1')).toHaveText('Teacher Dashboard');
    // Wait for initial lesson list load
    await page.waitForSelector('h2:has-text("Quick Generate")');
    // 2. Generate lesson
    await page.selectOption('#age', '4-5');
    await page.selectOption('#theme', 'Animals');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/lessons\//);
    await expect(page.locator('h1')).toHaveText('Animals');
    // 3. Verify detail page sections
    await expect(page.locator('h2:has-text("Learning Objective")')).toBeVisible();
    await expect(page.locator('h2:has-text("Activity")')).toBeVisible();
    await expect(page.locator('h2:has-text("Rhyme")')).toBeVisible();
    await expect(page.locator('h2:has-text("Worksheet Idea")')).toBeVisible();
    await expect(page.locator('h2:has-text("Materials Required")')).toBeVisible();
    await expect(page.locator('span:text-is("Template")')).toBeVisible();
    // 4. Export PDF — intercept download
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 15_000 }),
      page.click('button:has-text("Export PDF")'),
    ]);
    expect(download.suggestedFilename()).toMatch(/^lesson-animals-\d{4}-\d{2}-\d{2}\.pdf$/);
    // 5. Navigate back to dashboard
    await page.click('a:has-text("Back")');
    await page.waitForURL('/dashboard');
    await page.waitForSelector('h2:has-text("Quick Generate")');
    // Wait for lesson list item to appear
    await expect(page.getByRole('link', { name: /Animals/ })).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=Ages 4-5')).toBeVisible();
    // 6. Delete the lesson
    page.on('dialog', (dialog) => dialog.accept());
    await page.click('button:has-text("Delete")');
    await page.waitForTimeout(500);
    await expect(page.locator('text=No lessons yet')).toBeVisible();
  });
});
