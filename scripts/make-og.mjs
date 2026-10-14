// ツール用のOGP画像(1200x630)を public/og/ に生成する。
// 実行: PLAYWRIGHT=<playwrightのindex.mjsのパス> node --experimental-strip-types scripts/make-og.mjs
// ツールを追加・名称変更したときに再実行する。
import fs from 'node:fs';
import sharp from 'sharp';
import { TOOLS, TOOL_CATEGORIES } from '../src/lib/tools.ts';

const { chromium } = await import(process.env.PLAYWRIGHT ?? 'playwright');
const COLORS = { image: ['#2f5bea', '#6a3df0'], game: ['#0f9d7a', '#2f5bea'], pc: ['#e0702b', '#d13f6a'] };

const page = (title, sub, chip, [c1, c2]) => `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;font-family:'Noto Sans CJK JP','Noto Sans JP',sans-serif;color:#fff;background:linear-gradient(135deg,${c1},${c2});padding:72px 80px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden}
body::after{content:'';position:absolute;right:-140px;top:-140px;width:520px;height:520px;border-radius:50%;background:rgba(255,255,255,.12)}
body::before{content:'';position:absolute;right:120px;bottom:-200px;width:380px;height:380px;border-radius:50%;background:rgba(255,255,255,.08)}
.chip{display:inline-block;padding:8px 22px;border-radius:999px;background:rgba(255,255,255,.2);font-size:28px;font-weight:700;letter-spacing:.04em}
h1{font-size:104px;line-height:1.15;font-weight:900;margin:28px 0 20px;word-break:keep-all}
p{font-size:38px;line-height:1.5;max-width:900px;opacity:.95;word-break:keep-all}
.foot{display:flex;justify-content:space-between;align-items:center;font-size:30px;font-weight:700;z-index:1}
.badge{padding:10px 22px;border-radius:12px;background:#fff;color:${c1};font-weight:900}
</style><div style="z-index:1"><span class="chip">${chip}</span><h1>${title}</h1><p>${sub}</p></div>
<div class="foot"><span>ANYGAMES放送局 Tools</span><span class="badge">無料・ブラウザで完結</span></div>`;

const jobs = [
  { file: 'tools', html: page('ツール一覧', '画像の圧縮・リサイズ、ゲーム感度、PCの電気代まで。すべて無料で使えます。', 'ANYGAMES Tools', COLORS.image) },
  ...TOOLS.map((t) => ({ file: `tool-${t.slug}`, html: page(t.name, t.summary, TOOL_CATEGORIES[t.category], COLORS[t.category]) })),
];

fs.mkdirSync('public/og', { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? '/opt/pw-browsers/chromium' });
const p = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const j of jobs) {
  await p.setContent(j.html);
  const png = await p.screenshot({ type: 'png' });
  const out = await sharp(png).png({ palette: true, quality: 90, effort: 8 }).toBuffer();
  fs.writeFileSync(`public/og/${j.file}.png`, out);
  console.log(j.file, Math.round(out.length / 1024) + 'KB');
}
await browser.close();
