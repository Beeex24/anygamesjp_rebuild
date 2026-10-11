import type { Post } from './site';

export type ListPageProps = {
  posts: Post[];
  currentPage: number;
  totalPages: number;
  totalPosts: number;
};

/** 日付の新しい順に並べる（元配列は変更しない） */
export function sortByDate<T extends { data: { pubDate: Date } }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** 既存URL（/xxx/N/）を維持するための静的パス生成。1ページ目も必ず出力する。 */
export function pageRoutes(posts: Post[], pageSize: number) {
  const sorted = sortByDate(posts);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  return Array.from({ length: totalPages }, (_, i) => {
    const currentPage = i + 1;
    const props: ListPageProps = {
      posts: sorted.slice(i * pageSize, currentPage * pageSize),
      currentPage,
      totalPages,
      totalPosts: sorted.length,
    };
    return { params: { page: String(currentPage) }, props };
  });
}

/** タイトルからゲーム名のカテゴリを判定（旧一覧のフィルタ仕様を踏襲） */
export const GAME_FILTERS = [
  { key: 'valorant', label: 'ヴァロラント', words: ['valorant', 'ヴァロラント'] },
  { key: 'overwatch2', label: 'オーバーウォッチ2', words: ['overwatch', 'オーバーウォッチ'] },
  { key: 'apexlegends', label: 'エーペックス', words: ['apex', 'エーペックス'] },
  { key: 'battlefield6', label: 'バトルフィールド6', words: ['battlefield', 'バトルフィールド'] },
  { key: 'minecraft', label: 'マインクラフト', words: ['minecraft', 'マインクラフト'] },
  { key: 'gta', label: 'GTA', words: ['grandtheftauto', 'グランド・セフト・オート', 'gta'] },
  { key: 'sale', label: 'セール', words: ['sale', 'セール'] },
] as const;

export function gameKey(title: string): string {
  const t = title.toLowerCase();
  return GAME_FILTERS.find((f) => f.words.some((w) => t.includes(w)))?.key ?? 'others';
}

/** [...page] 形式（1ページ目は /xxx/、2ページ目以降は /xxx/N/）の静的パス */
export function restRoutes(posts: Post[], pageSize: number) {
  return pageRoutes(posts, pageSize).map((r) => ({
    params: { page: r.props.currentPage === 1 ? undefined : r.params.page },
    props: r.props,
  }));
}
