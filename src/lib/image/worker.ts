/// <reference lib="webworker" />
import { compressImage, type CompressOptions } from './compress';
import { resizeImage, type ResizeOptions } from './resize';
import { convertImage, type ConvertOptions } from './convert';
import { toFriendlyMessage } from './canvas';

export type WorkerRequest =
  | { task: 'compress'; file: File; options: CompressOptions }
  | { task: 'resize'; file: File; options: ResizeOptions }
  | { task: 'convert'; file: File; options: ConvertOptions };

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const req = e.data;
  const progress = (message: string) => self.postMessage({ type: 'progress', message });
  try {
    const result =
      req.task === 'compress'
        ? await compressImage(req.file, req.options, progress)
        : req.task === 'resize'
          ? await resizeImage(req.file, req.options, progress)
          : await convertImage(req.file, req.options, progress);
    self.postMessage({ type: 'done', result });
  } catch (err) {
    self.postMessage({ type: 'error', message: toFriendlyMessage(err) });
  }
};
