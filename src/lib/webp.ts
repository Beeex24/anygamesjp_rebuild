import fs from 'node:fs';
import path from 'node:path';

const cache = new Map<string, string | null>();

/** public/ 配下の PNG/JPEG に、同名の .webp が横にあればそのURLを返す(ビルド時のみ使用) */
export function webpFor(src: string | undefined): string | null {
  if (!src || !src.startsWith('/') || !/\.(png|jpe?g)$/i.test(src)) return null;
  const hit = cache.get(src);
  if (hit !== undefined) return hit;
  const webp = src.replace(/\.(png|jpe?g)$/i, '.webp');
  const found = fs.existsSync(path.join(process.cwd(), 'public', decodeURI(webp))) ? webp : null;
  cache.set(src, found);
  return found;
}
