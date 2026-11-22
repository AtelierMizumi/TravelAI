// Browser check: switching between the five tabs never leaves another tab visible underneath (web keeps blurred tabs mounted).
// Env: E2E_WEB_URL = web export (any API origin; every /api call is answered 401/empty here).
import { chromium } from 'playwright';
import { strict as assert } from 'node:assert';

const base = process.env.E2E_WEB_URL;
if (!base) throw new Error('E2E_WEB_URL is required');
const origin = new URL(base).origin;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox'] });
const page = await (await browser.newContext({ viewport: { width: 1450, height: 900 } })).newPage();
await page.route(`${origin}/api/**`, (route) => route.fulfill({ status: 401, json: {} }));
await page.route(`${origin}/ai/**`, (route) => route.fulfill({ status: 401, json: {} }));

const tabs = [['Trang chủ', '/'], ['Khám phá', '/explore'], ['AI', '/detection'], ['Cộng đồng', '/feed'], ['Tài khoản', '/profile']];
// a blurred scene = aria-hidden container that still has text and is not display:none
const leaks = () => page.evaluate(() => [...document.querySelectorAll('[aria-hidden="true"]')]
  .filter((e) => (e.innerText || '').trim().length > 30 && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().height > 0)
  .map((e) => e.innerText.trim().slice(0, 40)));

await page.goto(base, { waitUntil: 'load' });
await page.getByRole('link', { name: 'Khám phá', exact: true }).first().waitFor({ timeout: 30000 });
const nav = (name) => page.getByRole('link', { name, exact: true }).first();
for (const round of [0, 1]) {
  for (const [name] of tabs) {
    await nav(name).click();
    await page.waitForTimeout(500);
    const found = await leaks();
    assert.deepEqual(found, [], `round ${round}: after opening "${name}" a blurred tab is still visible: ${found.join(' | ')}`);
  }
}
const explore = page.getByText('Chọn hành trình của bạn', { exact: true });
await nav('Khám phá').click(); await page.waitForTimeout(400);
await nav('Trang chủ').click(); await page.waitForTimeout(400);
assert.equal(await explore.filter({ visible: true }).count(), 0, 'Explore content must be hidden on the home tab');
// a screen pushed on top of the tabs (login) must not show the tabs through it, and going back must restore a single tab
await page.getByRole('link', { name: 'Đăng nhập' }).first().click();
await page.waitForTimeout(600);
assert.equal(await explore.filter({ visible: true }).count(), 0, 'Explore content must be hidden behind the login screen');
const underLogin = await leaks();
assert.deepEqual(underLogin, [], `tabs show through the login screen: ${underLogin.join(' | ')}`);
console.log('tab-switch browser check passed');
await browser.close();
