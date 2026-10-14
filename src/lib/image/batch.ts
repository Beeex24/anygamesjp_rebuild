import { formatBytes, buildFileName } from './client';
import { buildZip, uniqueName } from './zip';
import { $, clearError, describeSizeChange, revokeUrls, showError, trackUrl } from './ui';

/** 一度に処理できる枚数(ブラウザのメモリを守るための上限) */
export const MAX_FILES = 30;

/** 選ばれたファイルを上限までに絞る。超えた場合はお知らせを出す */
export function limitFiles(picked: File[]): File[] {
  if (picked.length <= MAX_FILES) return picked;
  showError(`一度に処理できるのは ${MAX_FILES} 枚までです。先頭の ${MAX_FILES} 枚を選択しました。`);
  return picked.slice(0, MAX_FILES);
}

export interface BatchResult {
  blob: Blob;
  mime: string;
  /** 保存名に付ける末尾(例: anygames) */
  suffix: string;
  /** 「これ以上小さくできず元のまま」の場合 */
  kept?: boolean;
  /** 行に添える補足(例: 1920×1080px) */
  extra?: string;
}
export type BatchProcess = (file: File, onProgress: (message: string) => void) => Promise<BatchResult>;

/** 複数枚を順番に処理し、結果一覧とZIP保存を表示する(ImageBatch コンポーネントに対応) */
export async function runBatch(list: File[], process: BatchProcess, statusEl: HTMLElement, reason = '形式変換のため'): Promise<void> {
  const rows = $('batch-rows');
  rows.replaceChildren();
  revokeUrls();
  const done: { name: string; blob: Blob }[] = [];
  const used = new Set<string>();
  let before = 0;
  let after = 0;
  for (let i = 0; i < list.length; i++) {
    const file = list[i];
    const prefix = `(${i + 1}/${list.length}) `;
    const li = document.createElement('li');
    const thumb = document.createElement('img');
    thumb.alt = '';
    thumb.src = trackUrl(file);
    const info = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = file.name;
    const sub = document.createElement('div');
    sub.className = 'sub';
    info.append(name, sub);
    li.append(thumb, info);
    rows.append(li);
    try {
      const r = await process(file, (m) => { statusEl.textContent = prefix + m; });
      const outName = uniqueName(buildFileName(file.name, r.mime, r.suffix), used);
      done.push({ name: outName, blob: r.blob });
      before += file.size;
      after += r.blob.size;
      const change = r.kept ? '元のまま' : describeSizeChange(file.size, r.blob.size, reason);
      sub.textContent = `${formatBytes(file.size)} → ${formatBytes(r.blob.size)}(${change})${r.extra ? ` ・ ${r.extra}` : ''}`;
      const a = document.createElement('a');
      a.href = trackUrl(r.blob);
      a.download = outName;
      a.textContent = '保存';
      li.append(a);
    } catch (err) {
      sub.textContent = err instanceof Error ? err.message : '処理できませんでした。';
      sub.classList.add('fail');
    }
  }
  statusEl.textContent = '';
  if (done.length === 0) {
    showError('処理できる画像がありませんでした。');
    return;
  }
  $('batch-summary').textContent = `${done.length}枚を処理しました(合計 ${formatBytes(before)} → ${formatBytes(after)}・${describeSizeChange(before, after, reason)})`;
  const zip = $<HTMLAnchorElement>('zip');
  zip.hidden = done.length < 2;
  if (done.length >= 2) zip.href = trackUrl(await buildZip(done));
  $('input-panel').hidden = true;
  $('batch').hidden = false;
  $('batch').scrollIntoView({ block: 'start' });
}

/** 「別の画像を選ぶ」(一括結果から入力画面へ戻る)。フォーム固有のリセットは onReset で行う */
export function initBatchReset(statusEl: HTMLElement, onReset: () => void): void {
  $('batch-reset').addEventListener('click', () => {
    revokeUrls();
    $<HTMLInputElement>('file').value = '';
    $('file-name').hidden = true;
    $('batch').hidden = true;
    $('input-panel').hidden = false;
    statusEl.textContent = '';
    clearError();
    onReset();
  });
}
