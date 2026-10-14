import type { Post } from './site';

/** どの記事にも出る一般的な語。関連度の判定からは外す */
const STOP = new Set(['最新情報', '徹底解説', '完全ガイド', '導入方法', '解説', '紹介', '情報', '公開', '発表', '発売', '開始', '登場', '追加', '最新', '詳細', 'まとめ', 'レビュー', 'おすすめ', '一覧', '大幅', '無料', '本日', '今回', '方法']);

/** タイトルから「ゲーム名・製品名・固有名詞」らしい語を取り出す(英数字の語・カタカナ・漢字の連なり) */
export function keywords(title: string): Set<string> {
  const t = title.toLowerCase();
  const found = [
    ...(t.match(/[a-z0-9][a-z0-9'.+-]*[a-z0-9]|[a-z0-9]/g) ?? []).filter((w) => w.length >= 2),
    ...(t.match(/[ァ-ヶー]{3,}/g) ?? []),
    ...(t.match(/[一-龥]{2,}/g) ?? []),
  ];
  return new Set(found.filter((w) => !STOP.has(w)));
}

const key = (p: Post) => `${p.collection}/${p.id}`;

/**
 * 関連記事を返す。タイトルの共通ワードが多い記事ほど上位(どの記事にも出る語は IDF で軽く扱う)。
 * 同じジャンルは少し優遇し、足りない分は同ジャンルの新着で補う。
 */
export function relatedPosts(post: Post, all: Post[], limit = 6): Post[] {
  const docs = all.map((p) => ({ p, kw: keywords(p.data.title) }));
  const df = new Map<string, number>();
  docs.forEach((d) => d.kw.forEach((w) => df.set(w, (df.get(w) ?? 0) + 1)));
  const idf = (w: string) => Math.log(1 + docs.length / (df.get(w) ?? 1));

  const mine = keywords(post.data.title);
  const scored = docs
    .filter((d) => key(d.p) !== key(post))
    .map((d) => {
      let score = 0;
      mine.forEach((w) => { if (d.kw.has(w)) score += idf(w); });
      if (score > 0 && d.p.collection === post.collection) score += 0.5;
      return { p: d.p, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || b.p.data.pubDate.valueOf() - a.p.data.pubDate.valueOf())
    .map((s) => s.p);

  const picked = scored.slice(0, limit);
  if (picked.length < limit) {
    const have = new Set(picked.map(key));
    const fill = all
      .filter((p) => p.collection === post.collection && key(p) !== key(post) && !have.has(key(p)))
      .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
    picked.push(...fill.slice(0, limit - picked.length));
  }
  return picked;
}
