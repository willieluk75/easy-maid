import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration for Easy Maid Dual-App project.
 *
 * Worker App  → http://localhost:3000 (root)
 * Employer App → http://localhost:3001 (employer-app/)
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'html',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'worker-app',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3000',
      },
      testMatch: /workers-app\.spec\.ts/,
    },
    {
      name: 'employer-app',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3001',
      },
      testMatch: /employer-app\.spec\.ts/,
    },
  ],

  webServer: [
    {
      command: 'npm run dev',
      port: 3000,
      reuseExistingServer: true,
      timeout: 60_000,
    },
    {
      command: 'cd employer-app && npm run dev',
      port: 3001,
      reuseExistingServer: true,
      timeout: 60_000,
    },
  ],
});
