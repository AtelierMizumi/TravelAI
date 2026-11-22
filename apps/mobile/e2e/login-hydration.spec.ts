import { test, expect } from '@playwright/test';
import { syntheticApi } from './fixtures/ux';

test('login cold SSR matches client on desktop/mobile and mode changes keep fields usable', async ({ page }) => {
  await syntheticApi(page);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error' && /hydrat|server rendered|#418/i.test(message.text())) errors.push(message.text()); });
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 850 });
    const loaded = page.waitForResponse(response => new URL(response.url()).pathname.endsWith('/api/places'));
    await page.goto('/login'); await loaded;
    await expect(page.getByLabel('Địa chỉ email', { exact: true })).toBeVisible();
    await page.getByLabel('Địa chỉ email', { exact: true }).fill('login-only@example.test');
    await page.getByLabel('Mật khẩu', { exact: true }).fill('synthetic-password');
    await expect(page.getByRole('button', { name: 'Đăng nhập', exact: true })).toBeEnabled();
    await page.getByText('Quên mật khẩu?', { exact: true }).click();
    await expect(page.getByRole('button', { name: 'Gửi mã xác nhận', exact: true })).toBeVisible();
  }
  if (errors.length) console.log('LOGIN_RUNTIME', JSON.stringify(errors));
  expect(errors).toEqual([]);
});

test('login submit preserves auth request and navigation without hydration errors', async ({ page }) => {
  await syntheticApi(page);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  let submitted: unknown;
  await page.route('**/api/auth/login', async route => {
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' } });
    submitted = route.request().postDataJSON();
    return route.fulfill({ json: { token: 'synthetic-login-only', user: { id: 7001, name: 'Synthetic traveler', role: 'USER', status: 'ACTIVE' } }, headers: { 'access-control-allow-origin': '*' } });
  });
  await page.goto('/login');
  await page.getByLabel('Địa chỉ email', { exact: true }).fill('login@example.test');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('SyntheticOnly123!');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).toHaveURL(/\/profile$/);
  expect(submitted).toEqual({ email: 'login@example.test', password: 'SyntheticOnly123!' });
  expect(await page.evaluate(() => localStorage.getItem('travelai_token'))).toBe('synthetic-login-only');
  expect(errors).toEqual([]);
});
