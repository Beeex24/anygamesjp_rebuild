import { compressImage, toFriendlyMessage, type CompressOptions, type CompressResult, type ProgressFn } from './compress';

/**
 * Web Worker(OffscreenCanvas対応時)で圧縮し、非対応・起動失敗時はメインスレッドで実行する。
 * このモジュールはツールページでのみ読み込まれる。
 */
export function runCompress(file: File, options: CompressOptions, onProgress: ProgressFn): Promise<CompressResult> {
  const canUseWorker = typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined';
  if (!canUseWorker) return runOnMainThread(file, options, onProgress);

  return new Promise<CompressResult>((resolve, reject) => {
    let worker: Worker;
    try {
      worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    } catch {
      runOnMainThread(file, options, onProgress).then(resolve, reject);
      return;
    }
    worker.onmessage = (e: MessageEvent) => {
      const msg = e.data;
      if (msg.type === 'progress') {
        onProgress(msg.message);
        return;
      }
      worker.terminate();
      if (msg.type === 'done') resolve(msg.result as CompressResult);
      else reject(new Error(String(msg.message)));
    };
    // Worker自体が動かない場合のみメインスレッドへ切り替える
    worker.onerror = () => {
      worker.terminate();
      runOnMainThread(file, options, onProgress).then(resolve, reject);
    };
    worker.postMessage({ file, options });
  });
}

async function runOnMainThread(file: File, options: CompressOptions, onProgress: ProgressFn): Promise<CompressResult> {
  try {
    return await compressImage(file, options, onProgress);
  } catch (err) {
    throw new Error(toFriendlyMessage(err));
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/** 保存用ファイル名。元の名前は信頼せず、安全な文字だけ残す */
export function buildFileName(original: string, mime: string): string {
  const base = original.replace(/\.[^.]+$/, '').replace(/[^\w\-ぁ-んァ-ヶ一-龠ー]+/g, '_').slice(0, 60) || 'image';
  const ext = mime === 'image/jpeg' ? 'jpg' : mime === 'image/webp' ? 'webp' : mime === 'image/png' ? 'png' : 'avif';
  return `${base}-anygames.${ext}`;
}
