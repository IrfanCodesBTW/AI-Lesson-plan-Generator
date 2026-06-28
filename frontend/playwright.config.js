import { defineConfig, devices } from '@playwright/test';

const PORT_BE = 4000;
const PORT_FE = 5173;
const BE_BASE = `http://localhost:${PORT_BE}`;
const FE_BASE = `http://localhost:${PORT_FE}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: FE_BASE,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'node src/server.js',
      cwd: '../backend',
      url: `${BE_BASE}/health`,
      timeout: 30_000,
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        NODE_ENV: 'test',
        GEMINI_API_KEY: '',
        DATABASE_URL:
          process.env.E2E_DATABASE_URL ?? 'postgresql://lesson:lesson@localhost:5433/lesson_e2e',
        DATABASE_DIRECT_URL:
          process.env.E2E_DATABASE_URL ?? 'postgresql://lesson:lesson@localhost:5433/lesson_e2e',
        JWT_SECRET: 'e2e-only-jwt-secret-32-chars-minimum-length',
        JWT_EXPIRES_IN: '1h',
        PORT: String(PORT_BE),
        CORS_ORIGIN: FE_BASE,
        LOG_LEVEL: 'warn',
      },
    },
    {
      command: 'npm run preview -- --port 5173 --strictPort',
      cwd: '.',
      url: FE_BASE,
      timeout: 30_000,
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        VITE_API_BASE: BE_BASE,
      },
    },
  ],
});
