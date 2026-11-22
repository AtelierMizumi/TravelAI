import { test, expect } from '@playwright/test';
import { syntheticApi } from './fixtures/ux';
test.beforeEach(async ({ page }) => { await syntheticApi(page); await page.addInitScript(() => localStorage.setItem('travelai_token', 'synthetic-m2-only')); });

test('M2 hero is retained without a root transform', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('[data-motion-kind="hero"]');
  await expect(hero).toHaveCount(1);
  await expect(hero).toHaveAttribute('data-motion-state', 'complete');
  await expect(page.getByTestId('depth-camera')).toHaveCSS('transform', 'none');
  await page.screenshot({ path: '/tmp/travelai-m2-after/home.png', fullPage: true });
});
test('M2 reveal runs once and stays within twelve pixels without layout changes', async ({ page }) => {
  await page.addInitScript(() => {
    const original = Element.prototype.animate;
    (window as any).motionFrames = [];
    Element.prototype.animate = function (frames, options) {
      if (this.hasAttribute('data-motion-kind')) (window as any).motionFrames.push({ target: this, kind: this.getAttribute('data-motion-kind'), frames });
      return original.call(this, frames, options);
    };
  });
  await page.goto('/');
  await expect(page.getByText('Điểm thử nghiệm 1', { exact: true }).first()).toBeAttached();
  await page.evaluate(() => document.fonts.ready);
  const reveal = page.locator('[data-motion-kind="reveal"]').first();
  await expect(reveal).toHaveCount(1);
  await reveal.scrollIntoViewIfNeeded();
  await expect(reveal).toHaveAttribute('data-motion-state', 'complete');
  const count = await reveal.evaluate(el => (window as any).motionFrames.filter((x: any) => x.target === el).length);
  expect(count).toBe(1);
  const size = await reveal.evaluate(el => ({ width: el.clientWidth, height: el.clientHeight }));
  await page.mouse.wheel(0, -1400); await page.mouse.wheel(0, 1400);
  await expect(reveal).toHaveAttribute('data-motion-state', 'complete');
  expect(await reveal.evaluate(el => (window as any).motionFrames.filter((x: any) => x.target === el).length)).toBe(count);
  expect(await reveal.evaluate(el => ({ width: el.clientWidth, height: el.clientHeight }))).toEqual(size);
  const frames = await page.evaluate(() => (window as any).motionFrames.filter((x: any) => x.kind === 'reveal'));
  expect(frames.length).toBeGreaterThan(0);
  for (const item of frames) for (const frame of item.frames) {
    expect(Object.keys(frame).every(key => ['opacity', 'transform'].includes(key))).toBe(true);
    if (frame.transform) expect(frame.transform).toMatch(/^translateY\((0|10)px\)$/);
  }
});
test('reduced-motion and unavailable observer leave readable interactive content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('[data-motion-kind="hero"]')).toHaveAttribute('data-motion-state', 'complete');
  expect(await page.locator('[data-motion-kind]').evaluateAll(nodes => nodes.every(n => n.getAnimations().length === 0))).toBe(true);
  await page.getByRole('button', { name: 'Điểm đến tiếp theo' }).click();
  await expect(page.getByText('02 / 08', { exact: true })).toBeVisible();
});
test('feed, existing exploration and destination detail preserve route entries and readable data', async ({ page }) => {
  for (const [route, title] of [['/feed', 'Cộng đồng du lịch'], ['/booking/tours', 'Khám phá tour'], ['/destination/101', 'Điểm thử nghiệm 1']]) {
    await page.goto(route);
    await expect(page.getByText(title, { exact: true }).first()).toBeVisible();
    if (route === '/feed') await expect(page.getByText('Synthetic community post', { exact: true })).toBeVisible();
    if (route === '/booking/tours') await expect(page.getByText('Tour tổng hợp', { exact: true })).toBeVisible();
    await expect(page.locator('[data-motion-kind="page"]')).toHaveAttribute('data-motion-state', 'complete');
    await expect(page.getByTestId('depth-camera')).toHaveCSS('transform', 'none');
  }
});

test('missing IntersectionObserver falls back to immediately visible content', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'IntersectionObserver', { value: undefined }); });
  await page.goto('/');
  await expect(page.locator('[data-motion-kind="hero"]')).toHaveAttribute('data-motion-state', 'complete');
  await expect(page.getByText('Chụp & khám phá', { exact: true })).toBeVisible();
  expect(await page.locator('[data-motion-kind]').evaluateAll(nodes => nodes.every(n => n.getAnimations().length === 0))).toBe(true);
});
test('in-flight entry pauses while hidden and runtime reduced-motion resolves to visible endpoint', async ({ page }) => {
  await page.addInitScript(() => {
    const OriginalObserver = window.IntersectionObserver;
    (window as any).observerStats = { created: 0, disconnected: 0 };
    window.IntersectionObserver = class extends OriginalObserver {
      constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) { super(callback, options); (window as any).observerStats.created++; }
      disconnect() { (window as any).observerStats.disconnected++; super.disconnect(); }
    };
    const original = Element.prototype.animate;
    Element.prototype.animate = function (frames, options) {
      const result = original.call(this, frames, options);
      if (this.hasAttribute('data-motion-kind')) result.playbackRate = 0.02;
      return result;
    };
  });
  await page.goto('/');
  const hero = page.locator('[data-motion-kind="hero"]');
  await expect(hero).toHaveAttribute('data-motion-state', 'entering');
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(hero).toHaveAttribute('data-motion-state', 'paused');
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(hero).toHaveAttribute('data-motion-state', 'entering');
  await page.mouse.move(600, 500); await page.mouse.wheel(0, 1800);
  await expect(hero).toHaveAttribute('data-motion-state', 'paused');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(hero).toHaveAttribute('data-motion-state', 'complete');
  expect(await hero.evaluate(el => el.getAnimations().length)).toBe(0);
  expect(await page.evaluate(() => (window as any).observerStats.disconnected)).toBeGreaterThan(0);
});
test('keyboard focus bypasses reveal and hover never lifts cards or action buttons', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-motion-kind="hero"]')).toHaveAttribute('data-motion-state', 'complete');
  const reveal = page.locator('[data-motion-kind="reveal"]').filter({ has: page.locator('a, button, [role="button"]') }).first();
  await reveal.locator('a, button, [role="button"]').first().focus();
  await expect(reveal).toHaveAttribute('data-motion-state', 'complete');
  await reveal.hover();
  expect(await reveal.evaluate(el => getComputedStyle(el).transform)).toBe('none');
  await page.goto('/booking/tours');
  const buttons = page.getByRole('button');
  if (await buttons.count()) {
    await buttons.first().hover();
    expect(await buttons.first().evaluate(el => getComputedStyle(el).transform)).toBe('none');
  }
});
