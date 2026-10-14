/**
 * 画像ツール共通の下請け処理(Canvas生成・エンコード可否判定・エラー文言)。
 * Web Worker とメインスレッドの両方で動く。
 */

export type Mime = 'image/jpeg' | 'image/webp' | 'image/png' | 'image/avif';

/** ユーザーにそのまま表示してよいエラー */
export class UserFacingError extends Error {}

export const LIMITS = {
  maxFileBytes: 40 * 1024 * 1024,
  /** デコード後のRGBAバッファ(4byte/px)を抑えるための上限。約33MP = 約134MB */
  maxPixels: 33_000_000,
  minQuality: 0.35,
  maxQuality: 0.95,
} as const;

export const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export type AnyCanvas = OffscreenCanvas | HTMLCanvasElement;
export type AnyCtx = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;

export function makeCanvas(w: number, h: number): AnyCanvas {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
  if (typeof document !== 'undefined') {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }
  throw new UserFacingError('お使いのブラウザでは画像を処理できません。');
}

export function getCtx(canvas: AnyCanvas): AnyCtx {
  const ctx = canvas.getContext('2d') as AnyCtx | null;
  if (!ctx) throw new UserFacingError('お使いのブラウザでは画像を処理できません。');
  return ctx;
}

/** Canvas標準のエンコード(WASMが使えない場合の代替) */
async function toBlobNative(canvas: AnyCanvas, mime: Mime, quality: number): Promise<Blob | null> {
  let blob: Blob | null;
  if ('convertToBlob' in canvas) {
    blob = await canvas.convertToBlob({ type: mime, quality });
  } else {
    blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, quality));
  }
  // 非対応形式は PNG にフォールバックされるため、種類が一致しなければ失敗扱い
  return blob && blob.type === mime ? blob : null;
}

/** WASMの読み込みに失敗した形式は、以降Canvasエンコードに切り替える */
const wasmBroken = new Set<Mime>();

export async function toBlob(canvas: AnyCanvas, mime: Mime, quality: number): Promise<Blob | null> {
  if (!wasmBroken.has(mime)) {
    try {
      const { encodeWithWasm } = await import('./wasm');
      return await encodeWithWasm(canvas, mime, quality);
    } catch {
      wasmBroken.add(mime);
    }
  }
  return toBlobNative(canvas, mime, quality);
}

const supportCache = new Map<Mime, boolean>();
export async function canEncode(mime: Mime): Promise<boolean> {
  const cached = supportCache.get(mime);
  if (cached !== undefined) return cached;
  let ok = false;
  try {
    const c = makeCanvas(2, 2);
    getCtx(c).fillRect(0, 0, 2, 2);
    ok = (await toBlob(c, mime, 0.8)) !== null;
  } catch {
    ok = false;
  }
  supportCache.set(mime, ok);
  return ok;
}

export function toFriendlyMessage(err: unknown): string {
  if (err instanceof UserFacingError) return err.message;
  const name = err instanceof Error ? err.name : '';
  if (name === 'InvalidStateError' || name === 'EncodingError' || name === 'DataError') {
    return 'この画像は現在のブラウザでは処理できません。別の画像をお試しください。';
  }
  if (name === 'RangeError' || name === 'QuotaExceededError') {
    return '画像が大きすぎて処理できませんでした。長辺を小さくして再度お試しください。';
  }
  return '処理中に問題が発生しました。もう一度お試しください。';
}

