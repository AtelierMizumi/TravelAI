// Browser check of the admin screens with every API call stubbed (no real data, nothing leaves the machine).
// Build first: EXPO_PUBLIC_API_URL=http://127.0.0.1:$E2E_PORT/api npx expo export -p web --output-dir dist
// Env: E2E_DIST (export dir), E2E_PORT (same port as in the build), E2E_SHOTS (optional screenshot dir), CHROMIUM_PATH (optional).
import { chromium } from 'playwright';
import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const dist = process.env.E2E_DIST, port = Number(process.env.E2E_PORT || 4173), shots = process.env.E2E_SHOTS;
if (!dist) throw new Error('E2E_DIST is required');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.ttf': 'font/ttf', '.ico': 'image/x-icon' };
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const candidates = [url, `${url}.html`, path.join(url, 'index.html'), '/index.html'];
  const file = candidates.map((c) => path.join(dist, c)).find((c) => c.startsWith(dist) && fs.existsSync(c) && fs.statSync(c).isFile());
  res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(port, '127.0.0.1');

const origin = `http://127.0.0.1:${port}`;
const admin = { id: 1, name: 'Quản trị thử', email: 'admin@example.test', role: 'ADMIN' };
const tours = [
  { id: 1, name: 'Tour Bà Nà', location: 'Đà Nẵng', province: 'Đà Nẵng', price: 900000, rating: 4.6, status: 'active' },
  { id: 2, name: 'Tour đã tắt', location: 'Huế', province: 'Huế', price: 500000, rating: 4.1, status: 'inactive' },
];
const itinerary = (name, offeringId, start) => ({ kind: 'TOUR', name, start, selection: { offeringId } });
const bookings = [
  { id: 'BK-1', ownerId: 5, status: 'CONFIRMED', revision: 1, totalPaid: 900000, itinerary: itinerary('Tour Bà Nà', 'o1', '2026-06-01T20:30:00Z') },
  { id: 'BK-2', ownerId: 6, status: 'CONFIRMED', revision: 1, totalPaid: 900000, itinerary: itinerary('Tour Bà Nà', 'o1', '2026-06-03T02:00:00Z') },
];
const stubs = [
  [/\/auth\/me$/, admin], [/\/admin\/stats$/, { users: 12, posts: 3, places: 17, totalBookings: 2, tourBookings: 2, hotelBookings: 0, canonicalBookings: 2 }],
  [/\/admin\/catalog\/tours$/, tours], [/\/admin\/catalog\/hotels$/, []], [/\/places$/, []],
  [/\/booking\/bookings$/, bookings], [/\/tour-bookings$/, []], [/\/hotel-bookings$/, []],
  [/\/booking\/admin\/offers$/, [{ id: 'o1', kind: 'TOUR', legacyId: 1, name: 'Tour Bà Nà' }]],
  [/\/users$/, [{ id: 5, name: 'An', email: 'an@example.test' }, { id: 6, name: 'Bình', email: 'binh@example.test' }]],
  [/\/admin\/system-settings$/, { id: 1, siteName: 'TravelAI', adminEmail: 'a@example.test', emailNotify: true, systemNotify: true, maintenanceMode: false }],
];
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox'] });
for (const [label, viewport] of [['desktop', { width: 1400, height: 1000 }], ['phone', { width: 390, height: 844 }]]) {
  const context = await browser.newContext({ viewport });
  await context.addInitScript(() => localStorage.setItem('travelai_token', 'stub-token'));
  const page = await context.newPage();
  const puts = [];
  await page.route(`${origin}/api/**`, (route) => {
    const request = route.request();
    if (request.method() !== 'GET') { puts.push(`${request.method()} ${new URL(request.url()).pathname}`); return route.fulfill({ json: {} }); }
    const hit = stubs.find(([pattern]) => pattern.test(new URL(request.url()).pathname));
    return route.fulfill(hit ? { json: hit[1] } : { status: 404, json: { message: 'unstubbed' } });
  });
  const shot = async (name) => shots && (fs.mkdirSync(shots, { recursive: true }), page.screenshot({ path: path.join(shots, `${label}-${name}.png`), fullPage: true }));
  const menu = (title) => page.getByRole('button', { name: title }).filter({ visible: true }).first();

  await page.goto(`${origin}/admin`, { waitUntil: 'networkidle' });
  await page.getByText('Tổng quan hệ thống').first().waitFor({ timeout: 20000 });
  assert.ok(await page.getByText('Tour · 100%').first().isVisible(), 'dashboard shows the tour share');
  assert.ok(await page.getByText('Chưa có đặt chỗ đã xác nhận').count() === 0);
  await shot('dashboard');

  await menu('Tour').click();
  await page.getByText('Tour đã tắt').first().waitFor({ timeout: 10000 });
  await page.getByText('Đã tắt', { exact: true }).first().waitFor();
  await page.getByLabel('Tìm theo tên, địa điểm hoặc tỉnh').filter({ visible: true }).first().fill('bà nà');
  assert.equal(await page.getByText('Tour đã tắt').filter({ visible: true }).count(), 0, 'search narrows the list');
  await shot('tours');

  await menu('Đặt chỗ').click();
  await page.getByText('Tour Bà Nà').first().waitFor({ timeout: 10000 });
  await page.getByText('2 đặt chỗ').first().click();
  await page.getByText('Bình').first().waitFor();
  assert.ok(await page.getByText('2026-06-02 · 03:30').count() > 0, 'dates are shown in Vietnam time');
  await shot('bookings');

  await menu('Hệ thống').click();
  await page.getByText('Chế độ bảo trì').first().waitFor({ timeout: 10000 });
  assert.ok(await page.getByText(/chỉ được lưu lại/).first().isVisible(), 'notification flags are described honestly');
  await page.getByText('Lưu cấu hình').filter({ visible: true }).first().click();
  await page.getByText('Đã lưu cấu hình.').first().waitFor({ timeout: 5000 });
  assert.ok(puts.some((entry) => entry === 'PUT /api/system-settings'), 'settings are sent to the API');
  await shot('settings');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert.ok(overflow <= 1, `no horizontal page scroll on ${label} (overflow ${overflow}px)`);
  await context.close();
  console.log(`PASS ${label}`);
}
await browser.close(); server.close();
