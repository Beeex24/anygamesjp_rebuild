import { formatBytes, buildFileName } from './client';

/** 画像ツール共通のDOM操作。ImageDropzone / ImageCompare コンポーネントのidに対応する。 */
export const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const urls: string[] = [];
export const trackUrl = (b: Blob): string => {
  const u = URL.createObjectURL(b);
  urls.push(u);
  return u;
};
export const revokeUrls = (): void => {
  urls.splice(0).forEach((u) => URL.revokeObjectURL(u));
};

export function showError(msg: string): void {
  const el = $('error');
  el.textContent = msg;
  el.hidden = false;
}
export function clearError(): void {
  const el = $('error');
  el.textContent = '';
  el.hidden = true;
}

/** ファイル選択(クリック・ドラッグ&ドロップ)。選ばれたファイルを onFile に渡す */
export function initDropzone(onFile: (f: File | undefined) => void): void {
  const input = $<HTMLInputElement>('file');
  const drop = $<HTMLLabelElement>('drop');
  input.addEventListener('change', () => onFile(input.files?.[0]));
  ['dragenter', 'dragover'].forEach((ev) =>
    drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) =>
    drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', (e) => onFile((e as DragEvent).dataTransfer?.files?.[0]));
}

/** 複数選択対応のファイル選択。選ばれたファイル一覧(画像のみ)を onFiles に渡す */
export function initDropzoneMulti(onFiles: (files: File[]) => void): void {
  const input = $<HTMLInputElement>('file');
  const drop = $<HTMLLabelElement>('drop');
  const pick = (list: FileList | null | undefined) => onFiles(Array.from(list ?? []).filter((f) => f.type.startsWith('image/')));
  input.addEventListener('change', () => pick(input.files));
  (['dragenter', 'dragover'] as const).forEach((ev) =>
    drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  (['dragleave', 'drop'] as const).forEach((ev) =>
    drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', (e) => pick(e.dataTransfer?.files));
}

export function showFileName(f: File | File[]): void {
  const el = $('file-name');
  el.textContent = Array.isArray(f)
    ? f.length === 1 ? `${f[0].name}(${formatBytes(f[0].size)})` : `${f.length}枚の画像を選択中(合計 ${formatBytes(f.reduce((n, x) => n + x.size, 0))})`
    : `${f.name}(${formatBytes(f.size)})`;
  el.hidden = false;
}

export interface CompareInfo {
  blob: Blob;
  mime: string;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  /** AFTER の補足(例: 品質 80) */
  afterExtra?: string;
  /** 結果の見出し(例: 64% 軽量化しました) */
  summary: string;
  notes: string[];
  fileSuffix: string;
}

const typeLabel = (mime: string) => mime.replace('image/', '').toUpperCase();

export function showCompare(file: File, r: CompareInfo): void {
  if (!sliderReady) { initSlider(); sliderReady = true; }
  $<HTMLInputElement>('slider-range').value = '50';
  $('slider').style.setProperty('--pos', '50%');
  revokeUrls();
  $<HTMLImageElement>('img-before').src = trackUrl(file);
  $<HTMLImageElement>('img-after').src = trackUrl(r.blob);
  $('meta-before').textContent = `${formatBytes(file.size)} ・ ${r.originalWidth}×${r.originalHeight}px ・ ${typeLabel(file.type)}`;
  $('meta-after').textContent =
    `${formatBytes(r.blob.size)} ・ ${r.width}×${r.height}px ・ ${typeLabel(r.mime)}${r.afterExtra ? ` ・ ${r.afterExtra}` : ''}`;
  $('saved').textContent = r.summary;
  $('notes').replaceChildren(...r.notes.map((n) => { const li = document.createElement('li'); li.textContent = n; return li; }));
  const dl = $<HTMLAnchorElement>('download');
  dl.href = trackUrl(r.blob);
  dl.download = buildFileName(file.name, r.mime, r.fileSuffix);
  $('input-panel').hidden = true;
  $('result').hidden = false;
  $('result').scrollIntoView({ block: 'start' });
}

/** 比較スライダー。位置をCSS変数 --pos に反映する */
function initSlider(): void {
  const range = $<HTMLInputElement>('slider-range');
  const slider = $('slider');
  range.addEventListener('input', () => slider.style.setProperty('--pos', `${range.value}%`));
}
let sliderReady = false;

/** 「別の画像を選ぶ」。フォーム固有のリセットは onReset で行う */
export function initCompareReset(onReset: () => void): void {
  $('reset').addEventListener('click', () => {
    revokeUrls();
    $<HTMLInputElement>('file').value = '';
    $('file-name').hidden = true;
    $('result').hidden = true;
    $('input-panel').hidden = false;
    $('status').textContent = '';
    clearError();
    onReset();
  });
}

/** 変更前後のサイズから、結果の見出し文を作る */
export function describeSizeChange(beforeBytes: number, afterBytes: number, reason = '形式変換のため'): string {
  const ratio = Math.round((1 - afterBytes / beforeBytes) * 100);
  if (ratio >= 1) return `${ratio}% 軽量化しました`;
  if (ratio <= -1) return `元の画像より ${-ratio}% 大きくなりました(${reason})`;
  return 'サイズはほぼ変わりませんでした';
}
