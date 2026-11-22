import { test, expect } from '@playwright/test';
import { syntheticApi } from './fixtures/ux';
test.beforeEach(async ({ page }) => {
  await syntheticApi(page);
  await page.addInitScript(() => {
    localStorage.setItem('travelai_token', 'synthetic-gap');
    (window as any).gapAnimations = [];
    const animate = Element.prototype.animate;
    Element.prototype.animate = function(frames, options) {
      const animation = animate.call(this, frames, options);
      if (this.getAttribute('data-motion-kind') === 'reveal') {
        const record = { id: this.getAttribute('data-motion-section'), frames, options, samples: [] as number[] };
        (window as any).gapAnimations.push(record);
        const sample = () => {
          if (!this.isConnected) return;
          record.samples.push(Number(getComputedStyle(this).opacity));
          if (record.samples.length < 8) requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      }
      return animation;
    };
  });
});
test('important sections reveal on all six routes; long list cells are not observers', async ({ page }) => {
  for (const route of ['/', '/feed', '/explore', '/detection', '/profile', '/destination/101']) {
    await page.goto(route);
    if (route === '/' || route === '/explore') await expect(page.getByText('Điểm thử nghiệm 1', { exact: true }).first()).toBeAttached();
    await page.evaluate(() => document.fonts.ready);
    const sections = page.locator('[data-motion-section]');
    await expect(sections.first()).toBeAttached();
    await expect(sections.first()).not.toHaveAttribute('data-motion-state', 'ready');
    const count = await sections.count();
    expect(count).toBeLessThanOrEqual(8);
    for (let i = 0; i < count; i++) {
      const section = sections.nth(i);
      await section.scrollIntoViewIfNeeded();
      await expect(section).toHaveAttribute('data-motion-state', 'complete');
    }
    const records = await page.evaluate(() => (window as any).gapAnimations);
    expect(records.length).toBeGreaterThan(0);
    expect(records.some((record: any) => record.samples.some((opacity: number) => opacity > 0 && opacity < 1))).toBe(true);
    for (const record of records) {
      expect(record.options.duration).toBeGreaterThanOrEqual(200); expect(record.options.duration).toBeLessThanOrEqual(300);
      expect(record.frames[0].transform).toBe('translateY(10px)');
    }
  }
});
test('card hover changes color without moving geometry and resets after pointer leaves', async ({ page }) => {
  await page.goto('/explore');
  const card = page.locator('[data-hover-surface="card"]').filter({ hasText: 'Điểm thử nghiệm 1' }).first();
  await expect(card).toBeVisible();
  const before = await card.evaluate(el => ({ color: getComputedStyle(el).backgroundColor, width: el.clientWidth, height: el.clientHeight }));
  await card.hover();
  await expect.poll(() => card.evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe(before.color);
  expect(await card.evaluate(el => ({ width: el.clientWidth, height: el.clientHeight, transform: getComputedStyle(el).transform }))).toEqual({ width: before.width, height: before.height, transform: 'none' });
  await page.mouse.move(0, 0);
  await expect.poll(() => card.evaluate(el => getComputedStyle(el).backgroundColor)).toBe(before.color);
});

test('below-fold reveal waits for scrolling, runs once, survives tab return and reload', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Điểm thử nghiệm 1', { exact: true }).first()).toBeAttached();
  await page.evaluate(() => document.fonts.ready);
  const footer = page.locator('[data-motion-section="home-footer"]');
  await expect(footer).toHaveAttribute('data-motion-state', 'waiting');
  const size = await footer.evaluate(el => ({ w: el.clientWidth, h: el.clientHeight }));
  await page.mouse.move(600, 500); await page.mouse.wheel(0, 8000);
  await expect(footer).toHaveAttribute('data-motion-state', 'complete');
  expect(await footer.evaluate(el => ({ w: el.clientWidth, h: el.clientHeight }))).toEqual(size);
  const count = () => page.evaluate(() => (window as any).gapAnimations.filter((a: any) => a.id === 'home-footer').length);
  expect(await count()).toBe(1);
  await page.mouse.wheel(0, -8000); await page.mouse.wheel(0, 8000);
  expect(await count()).toBe(1);
  await page.getByRole('link', { name: 'Khám phá', exact: true }).first().click();
  await expect(page).toHaveURL(/\/explore$/);
  await expect(page.locator('[data-motion-section="explore-intro"]')).toHaveAttribute('data-motion-state', 'complete');
  await page.getByRole('link', { name: 'Trang chủ', exact: true }).first().click();
  await expect(page).toHaveURL(/\/$/);
  await expect(footer).toHaveAttribute('data-motion-state', 'complete');
  expect(await count()).toBe(1);
  await page.reload();
  await expect(footer).toHaveAttribute('data-motion-state', 'waiting');
  await footer.scrollIntoViewIfNeeded();
  await expect(footer).toHaveAttribute('data-motion-state', 'complete');
  expect(await count()).toBe(1);
  await page.screenshot({ path: '/tmp/travelai-gap/home-scroll.png' });
});

test('mouse feedback covers tour/hotel, nav, button, dropdown trigger and icon without layout changes', async ({ page }) => {
  for (const route of ['/booking/tours', '/booking/hotels']) {
    await page.goto(route);
    const card = page.locator('[data-hover-surface="card"]').last();
    await expect(card).toBeVisible();
    const color = await card.evaluate(el => getComputedStyle(el).backgroundColor);
    await card.hover();
    await expect.poll(() => card.evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe(color);
    expect(await card.evaluate(el => getComputedStyle(el).transform)).toBe('none');
  }
  const trigger = page.getByRole('button', { name: 'Tất cả tỉnh/thành' });
  await trigger.hover();
  await expect(trigger).toHaveCSS('outline-style', 'solid');
  const nav = page.getByRole('link', { name: 'Khám phá', exact: true }).first();
  await nav.hover(); await expect(nav).toHaveCSS('text-decoration-line', 'underline');
  await page.goto('/detection');
  const button = page.getByRole('button', { name: 'Mở camera chụp ngay' });
  await expect(button).toBeVisible();
  await expect(page.locator('[data-motion-section="detection-upload"]')).toHaveAttribute('data-motion-state', 'complete');
  const bounds = await button.boundingBox(); await button.hover();
  await expect(button).toHaveCSS('outline-color', 'rgb(66, 169, 208)'); expect(await button.boundingBox()).toEqual(bounds);
  await page.screenshot({ path: '/tmp/travelai-gap/detection-hover.png' });
});

test('reduced motion, observer fallback and focused sections stay visible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.locator('[data-motion-section]').evaluateAll(nodes => nodes.every(n => n.getAnimations().length === 0))).toBe(true);
  await page.goto('/explore');
  const card = page.locator('[data-hover-surface="card"]').first(); await card.hover();
  await expect(card).toHaveCSS('transition-duration', '0s');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('[data-motion-kind="hero"]')).toHaveAttribute('data-motion-state', 'complete');
  const section = page.locator('[data-motion-section="home-actions"]');
  await section.getByRole('button').first().focus();
  await expect(section).toHaveAttribute('data-motion-state', 'complete');
  expect(await section.evaluate(el => getComputedStyle(el).opacity)).toBe('1');
  await page.addInitScript(() => { Object.defineProperty(window, 'IntersectionObserver', { value: undefined }); });
  await page.reload();
  expect(await page.locator('[data-motion-section]').evaluateAll(nodes => nodes.every(n => getComputedStyle(n).opacity === '1' && n.getAnimations().length === 0))).toBe(true);
});

test('touch capability never receives stuck card hover styles', async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  const page = await context.newPage(); await syntheticApi(page);
  await page.goto('/explore');
  expect(await page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches)).toBe(false);
  const card = page.locator('[data-hover-surface="card"]').filter({ hasText: 'Điểm thử nghiệm 1' }).first();
  const before = await card.evaluate(el => getComputedStyle(el).backgroundColor);
  await card.tap({ position: { x: 5, y: 5 } });
  await expect(card).toHaveCSS('background-color', before);
  await context.close();
});
