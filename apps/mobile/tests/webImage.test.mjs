import test from "node:test";
import assert from "node:assert/strict";
import { fitWithin, downscaleToJpeg } from "../src/services/webImage.ts";

test("fitWithin keeps the aspect ratio and never upscales", () => {
  assert.deepEqual(fitWithin(2400, 1200), { width: 1600, height: 800 });
  assert.deepEqual(fitWithin(1200, 2400), { width: 800, height: 1600 });
  assert.deepEqual(fitWithin(12000, 9000), { width: 1600, height: 1200 });
  assert.deepEqual(fitWithin(640, 480), { width: 640, height: 480 });
  assert.deepEqual(fitWithin(1600, 1600), { width: 1600, height: 1600 });
});

test("fitWithin never produces a zero-sized side, even for extreme panoramas", () => {
  assert.deepEqual(fitWithin(20000, 3), { width: 1600, height: 1 });
  assert.deepEqual(fitWithin(3, 20000), { width: 1, height: 1600 });
});

test("fitWithin rejects sizes the browser could not decode", () => {
  for (const [w, h] of [[0, 100], [100, 0], [Number.NaN, 5], [5, Number.POSITIVE_INFINITY], [-3, 4]]) {
    assert.throws(() => fitWithin(w, h), /kích thước/i, `${w}x${h}`);
  }
});

function fakeBrowser({ natural }) {
  const calls = { draw: [], toBlob: [], canvas: null };
  const image = { naturalWidth: natural[0], naturalHeight: natural[1] };
  // The fake 2D context deliberately has NO getImageData/createImageData: using them must fail the test.
  const context = {
    imageSmoothingQuality: "",
    drawImage: (...args) => calls.draw.push(args),
  };
  const canvas = {
    width: 0,
    height: 0,
    getContext: (kind) => (kind === "2d" ? context : null),
    toBlob: (done, type, quality) => {
      calls.toBlob.push({ type, quality });
      done(new Blob(["jpeg"], { type }));
    },
  };
  calls.canvas = canvas;
  return { calls, image, deps: { loadImage: async () => image, createCanvas: () => canvas } };
}

test("a very large photo is drawn straight into a small canvas, never through getImageData", async () => {
  const { calls, image, deps } = fakeBrowser({ natural: [12000, 9000] });
  const blob = await downscaleToJpeg(new Blob(["raw"]), deps);
  assert.equal(blob.type, "image/jpeg");
  assert.equal(calls.canvas.width, 1600);
  assert.equal(calls.canvas.height, 1200);
  assert.deepEqual(calls.draw, [[image, 0, 0, 1600, 1200]]);
  assert.deepEqual(calls.toBlob, [{ type: "image/jpeg", quality: 0.85 }]);
});

test("a small photo keeps its size", async () => {
  const { calls, deps } = fakeBrowser({ natural: [640, 480] });
  await downscaleToJpeg(new Blob(["raw"]), deps);
  assert.equal(calls.canvas.width, 640);
  assert.equal(calls.canvas.height, 480);
});

test("an undecodable image gives a readable error instead of a canvas exception", async () => {
  const { deps } = fakeBrowser({ natural: [0, 0] });
  await assert.rejects(downscaleToJpeg(new Blob(["raw"]), deps), /kích thước/i);
});

test("a canvas that cannot encode reports a readable error", async () => {
  const { deps } = fakeBrowser({ natural: [800, 600] });
  const canvas = deps.createCanvas();
  canvas.toBlob = (done) => done(null);
  await assert.rejects(downscaleToJpeg(new Blob(["raw"]), { ...deps, createCanvas: () => canvas }), /không thể/i);
});
