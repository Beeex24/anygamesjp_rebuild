import type { Post } from './site';

/**
 * 期間限定の情報(セール・イベント・コラボ等)を含む記事かどうかをタイトルで判定する。
 * frontmatter の endsAt があればそちらを優先する。
 */
const TIME_LIMITED = /セール|sale|プライムデー|ブラックフライデー|キャンペーン|イベント|コラボ|開催/i;

/** endsAt が無い期間限定記事は、最終更新(更新日がなければ公開日)から何日で「古い情報」扱いにするか */
export const STALE_AFTER_DAYS = 60;

const DAY = 24 * 3600 * 1000;

export type Expiry =
  | { kind: 'ended'; endsAt: Date }
  | { kind: 'stale'; since: Date }
  | null;

/** 記事の鮮度判定。ビルド時点の日付で判断する(静的サイトなので再ビルドで更新される)。 */
export function expiryOf(post: Post, now = Date.now()): Expiry {
  if (post.collection === 'minecraft_mod_blog') return null;
  const data = post.data as { title: string; pubDate: Date; updatedDate?: Date; endsAt?: Date };
  if (data.endsAt) {
    // 終了日の当日いっぱいは有効
    return data.endsAt.valueOf() + DAY <= now ? { kind: 'ended', endsAt: data.endsAt } : null;
  }
  if (!TIME_LIMITED.test(data.title)) return null;
  const since = data.updatedDate ?? data.pubDate;
  return now - since.valueOf() > STALE_AFTER_DAYS * DAY ? { kind: 'stale', since } : null;
}

/** トップや新着枠に出してよい(期限切れ・古い情報ではない)記事だけ残す */
export function onlyFresh<T extends Post>(posts: T[]): T[] {
  return posts.filter((p) => expiryOf(p) === null);
}
