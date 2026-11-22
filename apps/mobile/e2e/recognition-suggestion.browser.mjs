// Browser check: when the AI service names a catalog landmark but only as a prediction, the place picker
// opens with that name filled in. Both services are stubbed through routes, so no image leaves the machine.
// Env: E2E_WEB_URL must be a web export built with EXPO_PUBLIC_API_URL=<origin>/api and EXPO_PUBLIC_AI_API_URL=<origin>/ai.
import { chromium } from 'playwright';
import { strict as assert } from 'node:assert';

const base = process.env.E2E_WEB_URL;
if (!base) throw new Error('E2E_WEB_URL is required');
const origin = new URL(base).origin;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox'] });
const page = await (await browser.newContext({ viewport: { width: 1400, height: 1000 } })).newPage();

const places = [
  { id: 7, name: 'Chợ Bến Thành', location: 'Hồ Chí Minh', province: 'Hồ Chí Minh', landmarkCode: 'cho_ben_thanh' },
  { id: 9, name: 'Dinh Độc Lập (Dinh Thống Nhất)', location: 'Hồ Chí Minh', province: 'Hồ Chí Minh', landmarkCode: 'dinh_doc_lap' },
];
const prediction = {
  success: true, recognitionStatus: 'predicted', isPrediction: true, landmarkCode: null,
  name: 'Chợ Bến Thành', displayName: 'Chợ Bến Thành', description: 'Chợ lâu đời ở Quận 1.',
  reason: 'Google Vision gợi ý một tên khớp địa danh trong danh mục; cần bạn xác nhận.', engine: 'google_vision',
  labels: ['Motorcycle'], objects: [],
  catalogCandidates: [{ code: 'cho_ben_thanh', name: 'Chợ Bến Thành', province: 'Hồ Chí Minh', score: 1.246 }],
};
await page.route(`${origin}/ai/detect`, (route) => route.fulfill({ json: prediction }));
await page.route(`${origin}/api/places`, (route) => route.fulfill({ json: places }));
await page.route(`${origin}/api/**`, (route) => (route.request().url().endsWith('/places') ? route.fallback() : route.fulfill({ status: 401, json: {} })));

await page.goto(`${base}/ai-detection`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const [chooser] = await Promise.all([
  page.waitForEvent('filechooser'),
  page.getByText('Chọn ảnh từ thiết bị').filter({ visible: true }).first().click({ noWaitAfter: true }),
]);
await chooser.setFiles({ name: 'ben-thanh.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=', 'base64') });
await page.getByLabel('Đồng ý gửi ảnh đến Google Cloud Vision').last().check({ force: true });
await page.getByText('Phân tích hình ảnh').filter({ visible: true }).first().click();

const box = page.getByLabel('Tên địa điểm hoặc tỉnh thành').filter({ visible: true }).first();
await box.waitFor({ timeout: 20000 });
assert.equal(await box.inputValue(), 'Chợ Bến Thành', 'the picker is pre-filled with the suggested landmark');
await page.getByText('Chợ Bến Thành').filter({ visible: true }).last().waitFor();
console.log('PASS predicted result opens the place picker pre-filled with the catalog suggestion');
await browser.close();
