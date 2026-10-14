import {
  ACCEPTED, LIMITS, UserFacingError, canEncode, getCtx, makeCanvas, toBlob, type Mime,
} from './canvas';

export type ConvertFormat = 'jpeg' | 'png' | 'webp' | 'avif';
export type ConvertQuality = 'high' | 'standard' | 'small';
export type Background = 'white' | 'black';

export interface ConvertOptions {
  format: ConvertFormat;
  /** JPEG / WebP / AVIF のみ有効 */
  quality: ConvertQuality;
  /** JPEG に変換するとき、透明な部分を塗る色 */
  background: Background;
}

export interface ConvertResult {
  blob: Blob;
  mime: string;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  /** AFTER に添える補足(例: 品質 92) */
  quality: number | null;
  notes: string[];
}

export type ProgressFn = (message: string) => void;

const MIME: Record<ConvertFormat, Mime> = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif' };
const LABEL: Record<string, string> = { 'image/jpeg': 'JPEG', 'image/png': 'PNG', 'image/webp': 'WebP', 'image/avif': 'AVIF' };
const QUALITY: Record<ConvertQuality, number> = { high: 0.92, standard: 0.8, small: 0.65 };

/** 透明部分が実際にあるか(64x64に縮小した見本で判定) */
function hasTransparency(bitmap: ImageBitmap): boolean {
  const S = 64;
  const c = makeCanvas(S, S);
  const ctx = getCtx(c);
  ctx.drawImage(bitmap, 0, 0, S, S);
  const { data } = ctx.getImageData(0, 0, S, S);
  for (let i = 3; i < data.length; i += 4) if (data[i] < 250) return true;
  return false;
}

export async function convertImage(file: File, options: ConvertOptions, onProgress: ProgressFn = () => {}): Promise<ConvertResult> {
  if (!ACCEPTED.includes(file.type)) throw new UserFacingError('JPEG・PNG・WebP・AVIF の画像を選択してください。');
  if (file.size > LIMITS.maxFileBytes) throw new UserFacingError('ファイルサイズが大きすぎます(上限 40MB)。');

  const mime = MIME[options.format];
  if (file.type === mime) {
    throw new UserFacingError(`この画像はすでに${LABEL[mime]}形式です。別の形式を選んでください。`);
  }
  if (mime !== 'image/png' && !(await canEncode(mime))) {
    throw new UserFacingError('お使いのブラウザでは、この形式での保存に対応していません。別の形式をお選びください。');
  }

  onProgress('画像を解析しています…');
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new UserFacingError('この画像は現在のブラウザでは処理できません。');
  }

  try {
    const { width, height } = bitmap;
    // 変換では画像サイズを変えないため、大きすぎる場合は縮小せず案内する
    if (width * height > LIMITS.maxPixels) {
      throw new UserFacingError('画像が大きすぎて変換できません。先に「画像リサイズ」で小さくしてからお試しください。');
    }

    const notes: string[] = [];
    const transparent = hasTransparency(bitmap);
    const opaque = mime === 'image/jpeg';
    if (opaque && transparent) {
      notes.push(`JPEGは透過に対応していないため、透明な部分は${options.background === 'black' ? '黒' : '白'}になります。`);
    }
    if (!transparent && mime === 'image/png' && file.type !== 'image/png') {
      notes.push('PNGは写真をそのまま保存するためファイルサイズが大きくなりがちです。軽さを優先するなら JPEG か WebP がおすすめです。');
    }

    onProgress(mime === 'image/avif' ? 'AVIFに変換しています(時間がかかることがあります)…' : '変換しています…');
    const canvas = makeCanvas(width, height);
    const ctx = getCtx(canvas);
    if (opaque) {
      ctx.fillStyle = options.background === 'black' ? '#000' : '#fff';
      ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(bitmap, 0, 0);

    const q = mime === 'image/png' ? null : QUALITY[options.quality];
    const blob = await toBlob(canvas, mime, q ?? 1);
    if (!blob) throw new UserFacingError('この画像は現在のブラウザでは処理できません。');

    onProgress('処理が完了しました。');
    return { blob, mime, width, height, originalWidth: width, originalHeight: height, quality: q, notes };
  } finally {
    bitmap.close();
  }
}
