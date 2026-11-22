import { test, expect } from '@playwright/test';
import { syntheticApi } from './fixtures/ux';

test('SSR hydration has no recoverable errors on desktop and compact detail pages', async ({ page }) => {
  await syntheticApi(page);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error' && /hydrat|server rendered|#418/i.test(message.text())) errors.push(message.text()); });
  for (const width of [1280, 420, 390]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of ['/destination/101', '/destination/14', '/']) {
      await page.goto(route);
      if (route !== '/') await page.getByRole('link', { name: 'Khám phá tour →' }).waitFor();
      else await page.getByText('Điểm thử nghiệm 1', { exact: true }).first().waitFor();
    }
  }
  expect(errors).toEqual([]);
});

test('async authenticated data and explicit WebGL initialization do not mismatch SSR', async ({ page }) => {
  await syntheticApi(page);
  await page.addInitScript(() => localStorage.setItem('travelai_token', 'synthetic-hydration'));
  await page.route('**/api/places/14', async route => {
    await new Promise(resolve => setTimeout(resolve, 100));
    await route.fulfill({ json: { id: 14, name: 'Địa điểm hydration tổng hợp', description: 'Synthetic async data' }, headers: { 'access-control-allow-origin': '*' } });
  });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error' && /hydrat|server rendered|#418/i.test(message.text())) errors.push(message.text()); });
  await page.goto('/destination/14');
  await expect(page.getByText('Địa điểm hydration tổng hợp', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Mô hình đình Việt Nam 3D')).toHaveCount(0);
  await page.getByRole('button', { name: 'Mở mô hình 3D thử nghiệm' }).click();
  await expect(page.getByRole('status').filter({ hasText: '3D sẵn sàng' })).toBeVisible();
  expect(errors).toEqual([]);
});
