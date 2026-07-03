import { defineConfig, devices } from '@playwright/test'

const E2E_HOST = '127.0.0.1'
const E2E_PORT = process.env.E2E_PORT || '5199'
const E2E_BASE = `http://${E2E_HOST}:${E2E_PORT}`

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.js',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 90_000,
  reporter: 'list',
  expect: { timeout: 15_000 },
  use: {
    baseURL: E2E_BASE,
    trace: 'on-first-retry',
    browserName: 'chromium',
    // CI installs Playwright Chromium; locally fall back to system Chrome when bundled browser is missing.
    ...(process.env.CI ? {} : { channel: process.env.PW_CHANNEL || 'chrome' }),
    ...devices['Pixel 5'],
  },
  webServer: process.env.E2E_PREVIEW
    ? {
        command: `npm run preview -- --host ${E2E_HOST} --port ${E2E_PORT} --strictPort`,
        url: E2E_BASE,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      }
    : {
        command: `npm run dev -- --host ${E2E_HOST} --port ${E2E_PORT} --strictPort`,
        url: E2E_BASE,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
})
