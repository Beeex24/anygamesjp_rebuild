import {
  ACCEPTED, LIMITS, UserFacingError, canEncode, getCtx, makeCanvas, toBlob,
  type AnyCanvas, type Mime,
} from './canvas';

export type ResizeMethod = 'edge' | 'size' | 'percent';
export type ResizeFormat = 'same' | 'jpeg' | 'webp' | 'png';

export interface ResizeOptions {
  method: ResizeMethod;
  /** method=edge: 長辺(px) */
  edge: number | null;
  /** method=size: 幅・高さ(px)。片方だけ指定も可 */
  width: number | null;
  height: number | null;
  /** method=size: 縦横比を保つ */
  keepRatio: boolean;
  /** method=percent: 倍率(%) */
  percent: number | null;
  format: ResizeFormat;
}

export interface ResizeResult {
  blob: Blob;
  mime: string;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  notes: string[];
}

export type ProgressFn = (message: string) => void;

const MAX_SIDE = 16384;
const OUTPUT_QUALITY = 0.92;

function positiveInt(v: number | null): number | null {
  if (v === null || !Number.isFinite(v)) return null;
  const n = Math.round(v);
  return n >= 1 ? n : null;
}

/** 入力値から出力サイズを決める。不正な入力は UserFacingError */
export function computeTargetSize(ow: number, oh: number, o: ResizeOptions): { w: number; h: number } {
  let w: number;
  let h: number;
  if (o.method === 'edge') {
    const edge = positiveInt(o.edge);
    if (!edge) throw new UserFacingError('長辺のサイズを1以上の数字で入力してください。');
    const s = edge / Math.max(ow, oh);
    w = ow * s;
    h = oh * s;
  } else if (o.method === 'percent') {
    const pct = o.percent;
    if (pct === null || !Number.isFinite(pct) || pct <= 0) throw new UserFacingError('倍率を0より大きい数字で入力してください。');
    w = ow * (pct / 100);
    h = oh * (pct / 100);
  } else {
    const tw = positiveInt(o.width);
    const th = positiveInt(o.height);
    if (!tw && !th) throw new UserFacingError('幅か高さのどちらかを入力してください。');
    if (o.keepRatio) {
      if (tw && th) {
        // 指定した枠の中に収める
        const s = Math.min(tw / ow, th / oh);
        w = ow * s;
        h = oh * s;
      } else if (tw) {
        w = tw;
        h = (oh * tw) / ow;
      } else {
        h = th as number;
        w = (ow * (th as number)) / oh;
      }
    } else {
      w = tw ?? ow;
      h = th ?? oh;
    }
  }
  return { w: Math.max(1, Math.round(w)), h: Math.max(1, Math.round(h)) };
}

function resolveMime(fileType: string, format: ResizeFormat, notes: string[]): Mime {
  if (format === 'jpeg') return 'image/jpeg';
  if (format === 'webp') return 'image/webp';
  if (format === 'png') return 'image/png';
  if (fileType === 'image/jpeg' || fileType === 'image/webp' || fileType === 'image/png') return fileType;
  notes.push('元の形式(AVIF)では保存できないため、WebPで保存しました。');
  return 'image/webp';
}

/** 縮小率が大きいときは半分ずつ縮めて、ギザギザやモアレを抑える */
function resample(bitmap: ImageBitmap, w: number, h: number, opaque: boolean): AnyCanvas {
  let src: ImageBitmap | AnyCanvas = bitmap;
  let cw = bitmap.width;
  let ch = bitmap.height;
  while (cw > w * 2 || ch > h * 2) {
    const nw = cw > w * 2 ? Math.ceil(cw / 2) : w;
    const nh = ch > h * 2 ? Math.ceil(ch / 2) : h;
    const step = makeCanvas(nw, nh);
    const sctx = getCtx(step);
    sctx.imageSmoothingEnabled = true;
    sctx.imageSmoothingQuality = 'high';
    sctx.drawImage(src as CanvasImageSource, 0, 0, nw, nh);
    src = step;
    cw = nw;
    ch = nh;
  }
  const out = makeCanvas(w, h);
  const ctx = getCtx(out);
  if (opaque) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(src as CanvasImageSource, 0, 0, w, h);
  return out;
}

export async function resizeImage(file: File, options: ResizeOptions, onProgress: ProgressFn = () => {}): Promise<ResizeResult> {
  if (!ACCEPTED.includes(file.type)) throw new UserFacingError('JPEG・PNG・WebP・AVIF の画像を選択してください。');
  if (file.size > LIMITS.maxFileBytes) throw new UserFacingError('ファイルサイズが大きすぎます(上限 40MB)。');

  onProgress('画像を解析しています…');
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new UserFacingError('この画像は現在のブラウザでは処理できません。');
  }

  try {
    const notes: string[] = [];
    const ow = bitmap.width;
    const oh = bitmap.height;
    const { w, h } = computeTargetSize(ow, oh, options);

    if (w > MAX_SIDE || h > MAX_SIDE || w * h > LIMITS.maxPixels) {
      throw new UserFacingError('出力サイズが大きすぎます。幅と高さを小さくしてお試しください(目安: 約3,300万画素まで)。');
    }

    const mime = resolveMime(file.type, options.format, notes);
    if (w === ow && h === oh && mime === file.type) {
      throw new UserFacingError('指定したサイズが元の画像と同じです。別のサイズを指定してください。');
    }
    if (mime !== 'image/png' && !(await canEncode(mime))) {
      throw new UserFacingError('お使いのブラウザでは、この形式での保存に対応していません。別の形式をお選びください。');
    }
    if (w > ow || h > oh) notes.push('拡大すると、画像は少しぼやけます。細かい部分が新しく作られるわけではありません。');
    if (mime === 'image/jpeg' && file.type !== 'image/jpeg') notes.push('JPEGは透過に対応していないため、透明な部分は白になります。');

    onProgress('サイズを変更しています…');
    const canvas = resample(bitmap, w, h, mime === 'image/jpeg');
    const blob = await toBlob(canvas, mime, OUTPUT_QUALITY);
    if (!blob) throw new UserFacingError('この画像は現在のブラウザでは処理できません。');

    onProgress('処理が完了しました。');
    return { blob, mime, width: w, height: h, originalWidth: ow, originalHeight: oh, notes };
  } finally {
    bitmap.close();
  }
}
