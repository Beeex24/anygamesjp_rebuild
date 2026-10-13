// 記事(Markdown)の品質チェック。警告を表示するだけで、ビルドは止めない。
//   npm run check:content
import { readdirSync, readFileSync } from 'node:fs';

const COLLECTIONS = ['blog', 'mobileblog', 'device', 'minecraft_blog', 'minecraft_mod_blog'];
const SALE = /セール|sale|プライムデー|ブラックフライデー/i;
const warnings = [];

for (const c of COLLECTIONS) {
  const dir = `./src/content/${c}`;
  for (const f of readdirSync(dir).filter((n) => /\.(md|mdx)$/.test(n))) {
    const text = readFileSync(`${dir}/${f}`, 'utf8');
    const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
    const body = text.slice(text.indexOf('---', 3) + 3);
    const where = `${c}/${f}`;
    const title = fm.match(/^title:\s*['"]?(.*?)['"]?\s*$/m)?.[1] ?? '';

    if (/!\[(blog placeholder)?\]\(/i.test(body)) warnings.push(`${where}: 画像の alt が空、または "blog placeholder" です(内容が分かる説明に)`);
    if (/<img(?![^>]*\balt=)/i.test(body)) warnings.push(`${where}: alt の無い <img> があります`);
    // 新しいセール記事には終了日(endsAt)を入れる(古い記事は公開から60日で自動的に「古い情報」扱い)
    const pub = new Date(fm.match(/^pubDate:\s*['"]?([^'"\r\n]+)/m)?.[1] ?? '');
    const recent = Date.now() - pub.valueOf() < 90 * 24 * 3600 * 1000;
    if (c !== 'minecraft_mod_blog' && recent && SALE.test(title) && !/^endsAt:/m.test(fm)) warnings.push(`${where}: 新しいセール記事に endsAt(終了日)がありません`);
    if (/Latest/.test(fm) && c === 'minecraft_mod_blog') warnings.push(`${where}: version に「Latest」があります。確認日つきの表記に`);
  }
}

if (warnings.length === 0) console.log('警告なし');
else {
  console.log(`${warnings.length} 件の警告:`);
  for (const w of warnings) console.log(' - ' + w);
}
