/**
 * WASMエンコーダ(MozJPEG / libwebp / libavif / oxipng)。ブラウザ標準のCanvasエンコードより
 * 同じ見た目で小さくなる。使う形式のコードだけを遅延読み込みし、失敗時は呼び出し側が
 * Canvasエンコードへフォールバックする。画像はブラウザの外へ出ない。
 */
import type { AnyCanvas, Mime } from './canvas';

const toImageData = (canvas: AnyCanvas): ImageData => {
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
  if (!ctx) throw new Error('no 2d context');
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
};

/** 0〜1 の品質を、AVIFの品質値(0〜100)へ。AVIFは同じ数値でも小さく・高画質になるため低めに寄せる */
const avifQuality = (q: number): number => Math.round(10 + q * 70);

/** PNGは非可逆の品質指定がないため、可逆の再圧縮(oxipng)で小さくする */
async function encodePng(canvas: AnyCanvas): Promise<Blob> {
  const { default: optimise } = await import('@jsquash/oxipng/optimise');
  const raw = await (canvas as OffscreenCanvas).convertToBlob?.({ type: 'image/png' }) ??
    (await new Promise<Blob | null>((r) => (canvas as HTMLCanvasElement).toBlob(r, 'image/png')));
  if (!raw) throw new Error('png encode failed');
  const out = await optimise(await raw.arrayBuffer(), { level: 2, interlace: false, optimiseAlpha: true });
  return new Blob([out], { type: 'image/png' });
}

export async function encodeWithWasm(canvas: AnyCanvas, mime: Mime, quality: number): Promise<Blob> {
  switch (mime) {
    case 'image/jpeg': {
      const { default: encode } = await import('@jsquash/jpeg/encode');
      return new Blob([await encode(toImageData(canvas), { quality: Math.round(quality * 100) })], { type: mime });
    }
    case 'image/webp': {
      const { default: encode } = await import('@jsquash/webp/encode');
      return new Blob([await encode(toImageData(canvas), { quality: Math.round(quality * 100) })], { type: mime });
    }
    case 'image/avif': {
      const { default: encode } = await import('@jsquash/avif/encode');
      return new Blob([await encode(toImageData(canvas), { quality: avifQuality(quality), speed: 8 })], { type: mime });
    }
    case 'image/png':
      return encodePng(canvas);
  }
}
