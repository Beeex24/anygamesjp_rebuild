/// <reference lib="webworker" />
import { compressImage, toFriendlyMessage, type CompressOptions } from './compress';

interface Request {
  file: File;
  options: CompressOptions;
}

self.onmessage = async (e: MessageEvent<Request>) => {
  const { file, options } = e.data;
  try {
    const result = await compressImage(file, options, (message) => self.postMessage({ type: 'progress', message }));
    self.postMessage({ type: 'done', result });
  } catch (err) {
    self.postMessage({ type: 'error', message: toFriendlyMessage(err) });
  }
};
