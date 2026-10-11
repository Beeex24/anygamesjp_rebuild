// public/ 内の PNG/JPEG それぞれに、同名の .webp を横に生成する(元ファイルとURLはそのまま残す)。
// 実行: node scripts/make-webp.mjs   (すでに .webp があるものはスキップ。元より10%以上小さくならない場合は作らない)
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const SKIP = [/^public\/(favicon|apple-touch)/, /^public\/icons\//];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);

let src = 0, out = 0, made = 0, skipped = 0;
for (const f of walk('public').filter((f) => /\.(png|jpe?g)$/i.test(f) && !SKIP.some((r) => r.test(f)))) {
  const dest = f.replace(/\.(png|jpe?g)$/i, '.webp');
  const size = fs.statSync(f).size;
  if (fs.existsSync(dest)) { skipped++; continue; }
  const buf = await sharp(f, { limitInputPixels: false }).rotate().webp({ quality: 82, effort: 5, smartSubsample: true }).toBuffer();
  if (buf.length < size * 0.9) { fs.writeFileSync(dest, buf); src += size; out += buf.length; made++; } else skipped++;
}
console.log({ made, skipped, srcMB: (src / 1e6).toFixed(1), webpMB: (out / 1e6).toFixed(1) });
