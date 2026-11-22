import { test, expect } from '@playwright/test';
import { syntheticApi } from './fixtures/ux';
test.beforeEach(async ({ page }) => { await syntheticApi(page); });
test('wheel scrolling keeps page/title/card transforms neutral and navigation usable', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Điểm thử nghiệm 1', { exact: true }).first()).toBeVisible();
  const camera = page.getByTestId('depth-camera');
  await page.mouse.move(600, 500);
  await page.mouse.wheel(0, 650);
  await expect.poll(() => page.evaluate(() => [...document.querySelectorAll('div')].some(el => el.scrollTop > 0))).toBe(true);
  await expect.poll(() => camera.evaluate(el => getComputedStyle(el).transform)).toBe('none');
  await expect(page.getByText('Điểm đến nổi bật', { exact: true })).toBeVisible();
  await page.getByText('Khám phá tour', { exact: true }).first().click();
  await expect(page).toHaveURL(/\/booking\/tours/);
});
test('AI screen scroll is stable and camera capture stays opt-in', async ({ page }) => {
  await page.goto('/detection');
  await expect(page.getByText('Khám phá qua hình ảnh', { exact: true })).toBeVisible();
  const heading = page.getByText('Khám phá qua hình ảnh', { exact: true });
  await page.mouse.move(600, 500); await page.mouse.wheel(0, 400);
  await expect.poll(() => heading.evaluate(el => getComputedStyle(el).transform)).toBe('none');
  expect(await page.locator('video').count()).toBe(0);
});

test('explicit destination controls and reduced-motion preserve static page interaction', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByText('Điểm thử nghiệm 1', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Điểm đến tiếp theo' }).click();
  await expect(page.getByText('02 / 08', { exact: true })).toBeVisible();
  await expect.poll(() => page.getByTestId('depth-camera').evaluate(el => getComputedStyle(el).transform)).toBe('none');
});
