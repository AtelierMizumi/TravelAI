import { test, expect } from '@playwright/test';
import { syntheticApi } from './fixtures/ux';

test.beforeEach(async ({ page }) => { await syntheticApi(page); });

test('featured depth stays within stable bounds and supports press', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('[data-featured-destination]').first();
  await expect(card).toBeVisible(); await card.scrollIntoViewIfNeeded();
  const before = await card.boundingBox();
  await card.hover();
  await expect.poll(() => card.evaluate(el => getComputedStyle(el).boxShadow)).not.toBe('none');
  expect(await card.boundingBox()).toEqual(before);
  expect(await card.evaluate(el => getComputedStyle(el).transform)).toBe('none');
  await page.mouse.down(); await expect(card).toHaveAttribute('data-pressed', 'true');
  await page.mouse.move(0, 0); await page.mouse.up();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => card.evaluate(el => getComputedStyle(el).transitionDuration)).toMatch(/^0s(, 0s)*$/);
});

test('search focus and clear keep filtering and input geometry', async ({ page }) => {
  await page.goto('/explore');
  const input = page.getByRole('textbox', { name: 'Tìm điểm đến' });
  await expect(input).toBeVisible();
  const before = await input.boundingBox();
  await input.fill('không-tồn-tại');
  await expect(page.getByText('Chưa có điểm đến phù hợp.')).toBeVisible();
  const clear = page.getByRole('button', { name: 'Xóa tìm kiếm: Tìm điểm đến' });
  await expect(clear).toBeEnabled(); await clear.click();
  await expect(input).toHaveValue(''); await expect(input).toBeFocused();
  await expect(page.getByRole('link', { name: 'Điểm thử nghiệm 1', exact: true })).toBeVisible();
  expect(await input.boundingBox()).toEqual(before);
});

test('compact notifications disclose and persist existing read mutation', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('travelai_token', 'synthetic-polish'));
  let read = false; let reads = 0;
  await page.route('**/api/notifications/**', route => {
    if (route.request().method() === 'PUT') { read = true; reads++; return route.fulfill({ json: {} }); }
    return route.fulfill({ json: [{ id: 801, title: 'Hoàn tiền thử nghiệm', message: 'Thông báo tổng hợp', type: 'BOOKING_REFUND', targetId: 1, targetReference: 'SYNTH-1', isRead: read, createdAt: '2026-11-22T10:00:00Z' }] });
  });
  await page.goto('/notifications');
  const card = page.getByTestId('notification-801');
  await expect(card).toBeVisible(); expect((await card.boundingBox())!.width).toBeLessThanOrEqual(760);
  const toggle = page.getByRole('button', { name: 'Hoàn tiền thử nghiệm' });
  await toggle.click(); await expect(page.getByText('Thông báo tổng hợp')).toBeHidden();
  await toggle.click(); await expect(page.getByText('Thông báo tổng hợp')).toBeVisible();
  await page.getByRole('button', { name: 'Đã đọc', exact: true }).click();
  await expect(card.getByText('Đã đọc', { exact: true })).toBeVisible(); expect(reads).toBe(1);
  await page.reload(); await expect(page.getByTestId('notification-801').getByText('Đã đọc', { exact: true })).toBeVisible();
});

test('chat bubbles preserve ownership order timestamps and existing send contract', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('travelai_token', 'synthetic-polish'));
  const avatar = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22%3E%3Crect width=%2240%22 height=%2240%22 fill=%22blue%22/%3E%3C/svg%3E';
  await page.route('**/api/auth/me', route => route.fulfill({ json: { id: 7001, name: 'Synthetic traveler', role: 'USER', status: 'ACTIVE', avatar } }));
  const messages = [
    { id: 1, senderId: 7002, receiverId: 7001, senderName: 'Synthetic friend', receiverName: 'Synthetic traveler', content: 'Tin đến tổng hợp', createdAt: '2026-11-22T09:01:00Z', isRead: false },
    { id: 2, senderId: 7001, receiverId: 7002, senderName: 'Synthetic traveler', receiverName: 'Synthetic friend', content: 'Tin gửi tổng hợp', createdAt: '2026-11-22T09:02:00Z', isRead: false },
  ];
  let sent: any;
  await page.route('**/api/chat/**', route => {
    if (route.request().method() === 'POST') sent = route.request().postDataJSON();
    return route.fulfill({ json: route.request().method() === 'POST' ? {} : messages });
  });
  await page.goto('/messages?peer=7002');
  const incoming = page.getByTestId('message-1'), outgoing = page.getByTestId('message-2');
  await expect(incoming).toBeVisible(); await expect(outgoing).toBeVisible();
  expect(await incoming.evaluate(el => getComputedStyle(el).justifyContent)).toMatch(/^(flex|flow)-start$/);
  expect(await outgoing.evaluate(el => getComputedStyle(el).justifyContent)).toMatch(/^(flex|flow)-end$/);
  expect((await incoming.boundingBox())!.y).toBeLessThan((await outgoing.boundingBox())!.y);
  await expect(outgoing.getByRole('img', { name: 'Ảnh đại diện của bạn' })).toBeVisible();
  await expect(incoming.getByText(/\d{2}:\d{2}/)).toBeVisible();
  await expect(outgoing.getByText(/delivered|đã nhận|đã xem/i)).toHaveCount(0);
  await page.getByRole('textbox', { name: 'Tin nhắn mới' }).fill('Nội dung kiểm thử');
  await page.getByRole('button', { name: 'Gửi', exact: true }).click();
  await expect.poll(() => sent?.content).toBe('Nội dung kiểm thử');
  expect(sent.receiverId).toBe(7002); expect(sent.clientMessageId).toBeTruthy();
});

test('viewer explicit controls ease briefly then stop rendering', async ({ page }) => {
  await page.goto('/destination/14');
  await page.getByRole('button', { name: 'Mở mô hình 3D thử nghiệm' }).click();
  const canvas = page.getByLabel('Mô hình đình Việt Nam 3D');
  await expect(page.getByRole('status').filter({ hasText: '3D sẵn sàng' })).toBeVisible();
  const before = Number(await canvas.getAttribute('data-frames'));
  await page.getByRole('button', { name: 'Xoay phải' }).click();
  await expect.poll(async () => Number(await canvas.getAttribute('data-frames')) - before).toBeGreaterThan(2);
  await page.waitForTimeout(250);
  const idle = await canvas.getAttribute('data-frames'); await page.waitForTimeout(250);
  expect(await canvas.getAttribute('data-frames')).toBe(idle);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Đặt lại góc nhìn' }).click();
  await expect(canvas).toHaveAttribute('data-camera', '7.000,5.000,8.000');
  await page.waitForTimeout(100);
  const reduced = await canvas.getAttribute('data-frames'); await page.waitForTimeout(100);
  expect(await canvas.getAttribute('data-frames')).toBe(reduced);
});
