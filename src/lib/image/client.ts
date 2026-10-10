import { compressImage, type CompressOptions, type CompressResult } from './compress';
import { resizeImage, type ResizeOptions, type ResizeResult } from './resize';
import { convertImage, type ConvertOptions, type ConvertResult } from './convert';
import { toFriendlyMessage } from './canvas';
import type { WorkerRequest } from './worker';

type Progress = (message: string) => void;

/**
 * Web Worker(OffscreenCanvas対応時)で実行し、非対応・起動失敗時はメインスレッドで実行する。
 * このモジュールはツールページでのみ読み込まれる。
 */
function runTask<T>(req: WorkerRequest, onProgress: Progress, fallback: () => Promise<T>): Promise<T> {
  const mainThread = async (): Promise<T> => {
    try {
      return await fallback();
    } catch (err) {
      throw new Error(toFriendlyMessage(err));
    }
  };
  if (typeof Worker === 'undefined' || typeof OffscreenCanvas === 'undefined') return mainThread();

  return new Promise<T>((resolve, reject) => {
    let worker: Worker;
    try {
      worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    } catch {
      mainThread().then(resolve, reject);
      return;
    }
    worker.onmessage = (e: MessageEvent) => {
      const msg = e.data;
      if (msg.type === 'progress') {
        onProgress(msg.message);
        return;
      }
      worker.terminate();
      if (msg.type === 'done') resolve(msg.result as T);
      else reject(new Error(String(msg.message)));
    };
    // Worker自体が動かない場合のみメインスレッドへ切り替える
    worker.onerror = () => {
      worker.terminate();
      mainThread().then(resolve, reject);
    };
    worker.postMessage(req);
  });
}

export const runCompress = (file: File, options: CompressOptions, onProgress: Progress): Promise<CompressResult> =>
  runTask({ task: 'compress', file, options }, onProgress, () => compressImage(file, options, onProgress));

export const runResize = (file: File, options: ResizeOptions, onProgress: Progress): Promise<ResizeResult> =>
  runTask({ task: 'resize', file, options }, onProgress, () => resizeImage(file, options, onProgress));

export const runConvert = (file: File, options: ConvertOptions, onProgress: Progress): Promise<ConvertResult> =>
  runTask({ task: 'convert', file, options }, onProgress, () => convertImage(file, options, onProgress));

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/** 保存用ファイル名。元の名前は信頼せず、安全な文字だけ残す */
export function buildFileName(original: string, mime: string, suffix = 'anygames'): string {
  const base = original.replace(/\.[^.]+$/, '').replace(/[^\w\-ぁ-んァ-ヶ一-龠ー]+/g, '_').slice(0, 60) || 'image';
  const ext = mime === 'image/jpeg' ? 'jpg' : mime === 'image/webp' ? 'webp' : mime === 'image/png' ? 'png' : 'avif';
  return `${base}-${suffix}.${ext}`;
}
