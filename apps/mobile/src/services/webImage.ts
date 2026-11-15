/**
 * Browser-side image preparation for recognition uploads.
 *
 * The picked photo is drawn straight into a canvas that already has the target size, so no
 * full-resolution canvas (and no getImageData/createImageData pixel copy) is ever allocated.
 * Large phone photos used to fail in the generic manipulator with
 * "createImageData: Invalid width or height" because it copies every source pixel.
 */
export const MAX_SIDE = 1600;
const JPEG_QUALITY = 0.85;

export function fitWithin(
  width: number,
  height: number,
  max: number = MAX_SIDE,
): { width: number; height: number } {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error("Không đọc được kích thước ảnh. Hãy thử ảnh khác.");
  }
  const scale = Math.min(1, max / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export interface DecodedImage {
  naturalWidth: number;
  naturalHeight: number;
}
export interface DrawingContext {
  imageSmoothingQuality: string;
  drawImage(image: never, x: number, y: number, width: number, height: number): void;
}
export interface OutputCanvas {
  width: number;
  height: number;
  getContext(kind: "2d"): DrawingContext | null;
  toBlob(done: (blob: Blob | null) => void, type: string, quality: number): void;
}
export interface BrowserDeps {
  loadImage(source: Blob): Promise<DecodedImage>;
  createCanvas(): OutputCanvas;
}

export async function downscaleToJpeg(
  source: Blob,
  deps: BrowserDeps = browserDeps(),
  max: number = MAX_SIDE,
): Promise<Blob> {
  const image = await deps.loadImage(source);
  const size = fitWithin(image.naturalWidth, image.naturalHeight, max);
  const canvas = deps.createCanvas();
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Trình duyệt không thể xử lý ảnh này.");
  context.imageSmoothingQuality = "high";
  context.drawImage(image as never, 0, 0, size.width, size.height);
  const jpeg = await new Promise<Blob | null>((done) =>
    canvas.toBlob(done, "image/jpeg", JPEG_QUALITY),
  );
  if (!jpeg) throw new Error("Trình duyệt không thể nén ảnh này thành JPEG.");
  return jpeg;
}

/** Reads the local uri, shrinks it and returns an object URL for the prepared JPEG. */
export async function prepareWebImage(uri: string): Promise<string> {
  const original = await (await fetch(uri)).blob();
  return URL.createObjectURL(await downscaleToJpeg(original));
}

function browserDeps(): BrowserDeps {
  return {
    loadImage: (source) =>
      new Promise((resolve, reject) => {
        const url = URL.createObjectURL(source);
        const image = new Image();
        image.onload = () => {
          URL.revokeObjectURL(url);
          resolve(image);
        };
        image.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error("Không mở được ảnh. Định dạng có thể chưa được hỗ trợ."));
        };
        image.src = url;
      }),
    createCanvas: () => document.createElement("canvas") as unknown as OutputCanvas,
  };
}
