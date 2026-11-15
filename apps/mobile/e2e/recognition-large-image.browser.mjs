// Browser regression for large photos on the recognition page (no image is sent to the AI API).
// Some browsers/devices cannot read back or allocate pixels of a huge canvas, which used to end in
// "CanvasRenderingContext2D.createImageData: Invalid width or height". This run makes every
// pixel read-back fail and caps canvas area, then expects the upload to still be prepared.
// Env: E2E_WEB_URL (static web export), CHROMIUM_PATH (optional).
import { chromium } from 'playwright';
import { strict as assert } from 'node:assert';

const base = process.env.E2E_WEB_URL;
if (!base) throw new Error('E2E_WEB_URL is required');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox'] });
const page = await (await browser.newContext({ viewport: { width: 1400, height: 900 } })).newPage();
const failures = [];
page.on('pageerror', (e) => failures.push(e.message));

await page.addInitScript(() => {
  window.__hostile = false;
  const ctx = CanvasRenderingContext2D.prototype;
  const originals = { createImageData: ctx.createImageData, getImageData: ctx.getImageData };
  for (const name of ['createImageData', 'getImageData']) {
    ctx[name] = function (...args) {
      if (window.__hostile) throw new DOMException(`CanvasRenderingContext2D.${name}: Invalid width or height`, 'IndexSizeError');
      return originals[name].apply(this, args);
    };
  }
  // Emulate engines (Safari, some mobile/low-memory browsers) that blank out oversized canvases.
  const getContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (...args) {
    if (window.__hostile && this.width * this.height > 16_777_216) { this.width = 0; this.height = 0; }
    return getContext.apply(this, args);
  };
});

await page.goto(base, { waitUntil: 'networkidle' });
await page.getByText('AI nhận diện', { exact: true }).first().click();
await page.getByText('Chọn ảnh từ thiết bị').first().waitFor();
await page.waitForTimeout(1500);

async function upload(width, height, hostile) {
  const before = await page.locator('img[alt="Ảnh đã chọn để nhận diện"]').evaluateAll((a) => a.map((i) => i.src));
  const bytes = Buffer.from(await page.evaluate(async ([w, h]) => {
    window.__hostile = false;
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const c = canvas.getContext('2d'); c.fillStyle = '#2563eb'; c.fillRect(0, 0, w, h);
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.6));
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  }, [width, height]));
  await page.evaluate((flag) => { window.__hostile = flag; }, hostile);
  const [chooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByText('Chọn ảnh từ thiết bị').filter({ visible: true }).first().click({ noWaitAfter: true }),
  ]);
  await chooser.setFiles({ name: `photo-${width}x${height}.jpg`, mimeType: 'image/jpeg', buffer: bytes });
  const preview = page.locator('img[alt="Ảnh đã chọn để nhận diện"]').last();
  await page.waitForFunction((known) => {
    const img = Array.from(document.querySelectorAll('img[alt="Ảnh đã chọn để nhận diện"]')).at(-1);
    return img && !known.includes(img.src);
  }, before, { timeout: 20000 }).catch(async () => {
    const alert = (await page.locator('[role=alert]').allInnerTexts()).join(' ');
    throw new Error(`${width}x${height} was not prepared: ${alert || failures.join(' | ') || 'no preview'}`);
  });
  return page.evaluate(async (src) => {
    window.__hostile = false;
    const blob = await (await fetch(src)).blob();
    const bitmap = await createImageBitmap(blob);
    return { type: blob.type, width: bitmap.width, height: bitmap.height };
  }, await preview.getAttribute('src'));
}

for (const [w, h, ew, eh, hostile] of [
  [2400, 1200, 1600, 800, false],
  [1200, 2400, 800, 1600, false],
  [640, 480, 640, 480, false],
  [6000, 4000, 1600, 1067, true], // 24 MP photo while pixel read-back fails and big canvases are blanked
  [4000, 6000, 1067, 1600, true],
]) {
  const out = await upload(w, h, hostile);
  assert.equal(out.type, 'image/jpeg', `${w}x${h} output type`);
  assert.deepEqual([out.width, out.height], [ew, eh], `${w}x${h} output size`);
  console.log(`PASS ${w}x${h}${hostile ? ' (hostile canvas)' : ''} -> ${out.width}x${out.height} JPEG`);
}
await browser.close();
