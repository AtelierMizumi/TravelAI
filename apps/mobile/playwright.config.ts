import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e', workers: 1,
  outputDir: '/tmp/travelai-phase-a-playwright',
  use: { baseURL: process.env.UX_TEST_URL || 'http://127.0.0.1:18084', headless: true, viewport: { width: 1280, height: 800 } },
});
