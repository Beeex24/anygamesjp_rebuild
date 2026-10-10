/**
 * 画像圧縮のコア処理。Web Worker とメインスレッドの両方で動く(DOM依存は makeCanvas のみ)。
 * 画像はサーバーへ送信しない。
 */

export type OutFormat = 'auto' | 'jpeg' | 'webp';
type Mime = 'image/jpeg' | 'image/webp';

export interface CompressOptions {
  format: OutFormat;
  /** 目標サイズ(byte)。null なら Smart Optimize の標準品質 */
  targetBytes: number | null;
  /** 長辺の上限(px)。null なら原寸(ただし極端に大きい場合は自動縮小) */
  maxEdge: number | null;
}

export interface CompressResult {
  blob: Blob;
  mime: string;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  /** 0〜1。元ファイルをそのまま返した場合は null */
  quality: number | null;
  keptOriginal: boolean;
  /** 目標サイズ指定時のみ。達成できたか */
  targetMet: boolean | null;
  notes: string[];
}

export type ProgressFn = (message: string) => void;

/** ユーザーにそのまま表示してよいエラー */
export class UserFacingError extends Error {}

export const LIMITS = {
  maxFileBytes: 40 * 1024 * 1024,
  /** デコード後のRGBAバッファ(4byte/px)を抑えるための上限。約33MP = 約134MB */
  maxPixels: 33_000_000,
  minQuality: 0.35,
  maxQuality: 0.95,
} as const;

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

type AnyCanvas = OffscreenCanvas | HTMLCanvasElement;
type AnyCtx = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;

function makeCanvas(w: number, h: number): AnyCanvas {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
  if (typeof document !== 'undefined') {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }
  throw new UserFacingError('お使いのブラウザでは画像を処理できません。');
}

function getCtx(canvas: AnyCanvas): AnyCtx {
  const ctx = canvas.getContext('2d') as AnyCtx | null;
  if (!ctx) throw new UserFacingError('お使いのブラウザでは画像を処理できません。');
  return ctx;
}

async function toBlob(canvas: AnyCanvas, mime: Mime, quality: number): Promise<Blob | null> {
  let blob: Blob | null;
  if ('convertToBlob' in canvas) {
    blob = await canvas.convertToBlob({ type: mime, quality });
  } else {
    blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, quality));
  }
  // 非対応形式は PNG にフォールバックされるため、種類が一致しなければ失敗扱い
  return blob && blob.type === mime ? blob : null;
}

const supportCache = new Map<Mime, boolean>();
async function canEncode(mime: Mime): Promise<boolean> {
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

interface Analysis {
  hasAlpha: boolean;
  /** 色数が少ないイラスト・スクリーンショット系か(簡易判定) */
  isGraphic: boolean;
}

/** 64x64 に縮小したサンプルから、透過の有無と画像の種類を推定する */
function analyze(bitmap: ImageBitmap): Analysis {
  const S = 64;
  const c = makeCanvas(S, S);
  const ctx = getCtx(c);
  ctx.drawImage(bitmap, 0, 0, S, S);
  const { data } = ctx.getImageData(0, 0, S, S);
  const colors = new Set<number>();
  let hasAlpha = false;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 250) hasAlpha = true;
    colors.add(((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4));
  }
  return { hasAlpha, isGraphic: colors.size < 200 };
}

function fitSize(w: number, h: number, maxEdge: number | null): { w: number; h: number; auto: boolean } {
  let scale = 1;
  if (maxEdge && Math.max(w, h) > maxEdge) scale = maxEdge / Math.max(w, h);
  let auto = false;
  if (w * h * scale * scale > LIMITS.maxPixels) {
    scale = Math.sqrt(LIMITS.maxPixels / (w * h));
    auto = true;
  }
  return { w: Math.max(1, Math.round(w * scale)), h: Math.max(1, Math.round(h * scale)), auto };
}

function render(bitmap: ImageBitmap, w: number, h: number, opaque: boolean): AnyCanvas {
  const c = makeCanvas(w, h);
  const ctx = getCtx(c);
  if (opaque) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, w, h);
  return c;
}

interface Candidate {
  mime: Mime;
  blob: Blob;
  quality: number;
}

/** 目標サイズ以下で最も高い品質を二分探索。到達不能なら null */
async function searchQuality(canvas: AnyCanvas, mime: Mime, target: number): Promise<Candidate | null> {
  const top = await toBlob(canvas, mime, LIMITS.maxQuality);
  if (!top) return null;
  if (top.size <= target) return { mime, blob: top, quality: LIMITS.maxQuality };
  let best: Candidate | null = null;
  let lo = LIMITS.minQuality;
  let hi = LIMITS.maxQuality;
  const floor = await toBlob(canvas, mime, lo);
  if (!floor || floor.size > target) return null;
  best = { mime, blob: floor, quality: lo };
  for (let i = 0; i < 6; i++) {
    const mid = (lo + hi) / 2;
    const b = await toBlob(canvas, mime, mid);
    if (!b) break;
    if (b.size <= target) {
      best = { mime, blob: b, quality: mid };
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return best;
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

export async function compressImage(
  file: File,
  options: CompressOptions,
  onProgress: ProgressFn = () => {},
): Promise<CompressResult> {
  if (!ACCEPTED.includes(file.type)) {
    throw new UserFacingError('JPEG・PNG・WebP・AVIF の画像を選択してください。');
  }
  if (file.size > LIMITS.maxFileBytes) {
    throw new UserFacingError('ファイルサイズが大きすぎます(上限 40MB)。');
  }

  onProgress('画像を解析しています…');
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new UserFacingError('この画像は現在のブラウザでは処理できません。');
  }

  try {
    const notes: string[] = [];
    const { hasAlpha, isGraphic } = analyze(bitmap);
    const [jpegOk, webpOk] = await Promise.all([canEncode('image/jpeg'), canEncode('image/webp')]);

    let mimes: Mime[];
    if (options.format === 'jpeg') mimes = ['image/jpeg'];
    else if (options.format === 'webp') mimes = ['image/webp'];
    else if (hasAlpha) mimes = ['image/webp'];
    else mimes = isGraphic ? ['image/webp', 'image/jpeg'] : ['image/jpeg', 'image/webp'];
    mimes = mimes.filter((m) => (m === 'image/jpeg' ? jpegOk : webpOk));
    if (mimes.length === 0) {
      throw new UserFacingError('お使いのブラウザでは、この形式への変換に対応していません。');
    }
    if (hasAlpha && mimes.includes('image/jpeg')) notes.push('透過部分は白で塗りつぶされます。');

    const size = fitSize(bitmap.width, bitmap.height, options.maxEdge);
    if (size.auto) notes.push('画像が非常に大きいため、安全に処理できるサイズまで縮小しました。');

    const baseQuality = isGraphic ? 0.9 : 0.8;
    let w = size.w;
    let h = size.h;
    let chosen: Candidate | null = null;
    let targetMet: boolean | null = null;

    if (options.targetBytes === null) {
      onProgress('最適化しています…');
      const canvasByOpaque = new Map<boolean, AnyCanvas>();
      const results: Candidate[] = [];
      for (const mime of mimes) {
        const opaque = mime === 'image/jpeg';
        let canvas = canvasByOpaque.get(opaque);
        if (!canvas) {
          canvas = render(bitmap, w, h, opaque);
          canvasByOpaque.set(opaque, canvas);
        }
        const blob = await toBlob(canvas, mime, baseQuality);
        if (blob) results.push({ mime, blob, quality: baseQuality });
      }
      chosen = results.sort((a, b) => a.blob.size - b.blob.size)[0] ?? null;
    } else {
      targetMet = false;
      let scale = 1;
      for (let step = 0; step < 5 && !chosen; step++) {
        onProgress(step === 0 ? '目標サイズに合わせて最適化しています…' : '目標サイズに届かないため、少し縮小して再試行しています…');
        const cw = Math.max(1, Math.round(w * scale));
        const ch = Math.max(1, Math.round(h * scale));
        const passed: Candidate[] = [];
        for (const mime of mimes) {
          const canvas = render(bitmap, cw, ch, mime === 'image/jpeg');
          const found = await searchQuality(canvas, mime, options.targetBytes);
          if (found) passed.push(found);
        }
        if (passed.length) {
          chosen = passed.sort((a, b) => b.quality - a.quality || a.blob.size - b.blob.size)[0];
          targetMet = true;
          if (step > 0) {
            notes.push(`目標サイズに合わせるため、画像を ${cw}×${ch}px に縮小しました。`);
            w = cw;
            h = ch;
          }
        } else {
          scale *= 0.8;
        }
      }
      if (!chosen) {
        // 到達できなかった場合は最小設定の結果を返し、理由を伝える
        const cw = Math.max(1, Math.round(w * scale));
        const ch = Math.max(1, Math.round(h * scale));
        const canvas = render(bitmap, cw, ch, mimes[0] === 'image/jpeg');
        const blob = await toBlob(canvas, mimes[0], LIMITS.minQuality);
        if (blob) {
          chosen = { mime: mimes[0], blob, quality: LIMITS.minQuality };
          w = cw;
          h = ch;
        }
        notes.push('この画像では指定の目標サイズまで小さくできませんでした。目標サイズを大きくしてお試しください。');
      }
    }

    if (!chosen) throw new UserFacingError('この画像は現在のブラウザでは処理できません。');

    const resized = w !== bitmap.width || h !== bitmap.height;
    const originalIsFine = options.targetBytes === null && file.size <= chosen.blob.size;
    if (originalIsFine && !resized && options.format === 'auto') {
      notes.push('元の画像がすでに十分小さいため、そのまま使えます。');
      return {
        blob: file, mime: file.type, width: bitmap.width, height: bitmap.height,
        originalWidth: bitmap.width, originalHeight: bitmap.height,
        quality: null, keptOriginal: true, targetMet, notes,
      };
    }
    if (options.targetBytes !== null && file.size <= options.targetBytes && !resized && options.format === 'auto') {
      notes.push('元の画像がすでに目標サイズ以下です。');
      return {
        blob: file, mime: file.type, width: bitmap.width, height: bitmap.height,
        originalWidth: bitmap.width, originalHeight: bitmap.height,
        quality: null, keptOriginal: true, targetMet: true, notes,
      };
    }

    onProgress('処理が完了しました。');
    return {
      blob: chosen.blob, mime: chosen.mime, width: w, height: h,
      originalWidth: bitmap.width, originalHeight: bitmap.height,
      quality: chosen.quality, keptOriginal: false, targetMet, notes,
    };
  } finally {
    bitmap.close();
  }
}
