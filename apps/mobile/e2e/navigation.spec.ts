import { test, expect } from '@playwright/test';
import { syntheticApi } from './fixtures/ux';

test.beforeEach(async ({ page }) => {
  await syntheticApi(page);
  await page.addInitScript(() => localStorage.setItem('travelai_token', 'synthetic-navigation-only'));
});
test('compact navigation has one five-tab bar, keeps Explore search, and preserves root booking routes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/explore');
  await expect(page.getByRole('tablist')).toHaveCount(1);
  await expect(page.getByRole('tab')).toHaveCount(5);
  await page.getByLabel('Tìm điểm đến', { exact: true }).fill('thử nghiệm 1');
  await page.getByRole('tab', { name: 'Trang chủ' }).click();
  await page.getByRole('tab', { name: 'Khám phá' }).click();
  await expect(page.getByLabel('Tìm điểm đến', { exact: true })).toHaveValue('thử nghiệm 1');
  await page.getByRole('link', { name: 'Khám phá tour', exact: true }).click();
  await expect(page).toHaveURL(/\/booking\/tours/);
  await expect(page.getByRole('tablist')).toHaveCount(0);
  await page.getByRole('button', { name: 'Quay lại', exact: true }).click();
  await expect(page).toHaveURL(/\/explore/);
  await expect(page.getByRole('tablist')).toHaveCount(1);
});
test('desktop uses one header navigation while compact Account retains messaging and settings links', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('tablist')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Khám phá', exact: true })).toHaveCount(1);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('tab', { name: 'Tài khoản' }).click();
  await expect(page).toHaveURL(/\/profile/);
  await expect(page.getByRole('link', { name: 'Cài đặt', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Tin nhắn', exact: true }).last()).toBeVisible();
  await page.getByRole('link', { name: 'Cài đặt', exact: true }).click();
  await expect(page).toHaveURL(/\/settings/);
  await expect(page.getByRole('tablist')).toHaveCount(0);
});
test('cold legacy aliases, destination and payment URLs are retained without tabs or redirect loops', async ({ page }) => {
  for (const route of ['/ai-detection', '/destination/101', '/booking/payment?reviewId=synthetic', '/messages', '/notifications', '/policy']) {
    await page.goto(route);
    await expect(page).toHaveURL(new RegExp(route.split('?')[0]));
    await expect(page.getByText('Unmatched Route', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('tablist')).toHaveCount(0);
  }
});

test('Community keeps scroll position while refetching on tab focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let calls = 0;
  await page.route('**/api/posts?**', async route => {
    calls++;
    if (calls > 1) await new Promise(resolve => setTimeout(resolve, 350));
    await route.fulfill({ json: Array.from({ length: 20 }, (_, i) => ({ id: 8000 + i, authorId: 7002, authorName: 'Synthetic author', content: `Synthetic scroll post ${i}`, comments: [], likesCount: 0 })), headers: { 'access-control-allow-origin': '*' } });
  });
  await page.goto('/feed');
  const heading = page.getByText('Cộng đồng du lịch', { exact: true });
  await expect(page.getByText('Synthetic scroll post 0', { exact: true })).toBeVisible();
  const offset = () => heading.evaluate(el => { let node: HTMLElement | null = el as HTMLElement; while (node && getComputedStyle(node).overflowY !== 'auto') node = node.parentElement; return node?.scrollTop || 0; });
  await page.mouse.move(190, 450); await page.mouse.wheel(0, 650);
  await expect.poll(offset).toBeGreaterThan(300);
  const before = await offset();
  await page.getByRole('tab', { name: 'Khám phá' }).click();
  await page.getByRole('tab', { name: 'Cộng đồng' }).click();
  await expect.poll(offset).toBeGreaterThan(before - 30);
  await expect.poll(() => calls).toBeGreaterThan(1);
  await expect(page.getByText('Synthetic scroll post 19', { exact: true })).toBeVisible();
  await page.screenshot({ path: '/tmp/travelai-phase-b/compact-feed.png' });
});
