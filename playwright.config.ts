import { defineConfig, devices } from '@playwright/test';

const port = 4173;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    actionTimeout: 10_000,
  },
  expect: {
    timeout: 10_000,
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: 'docs-studio.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'docs-studio',
      testMatch: 'docs-studio.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:8080',
      },
    },
  ],
  webServer: [
    {
      command: `pnpm --filter basic-react exec vite preview --host 127.0.0.1 --port ${port}`,
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'python3 -m http.server 8080 --directory apps/docs/_build/html',
      url: 'http://127.0.0.1:8080/studio.html',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
});
