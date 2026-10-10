import { getCollection, type CollectionEntry } from 'astro:content';

/** サイト内の記事セクション。URLは既存の /{collection}/{id}/ を維持する。 */
export const SECTIONS = [
  { key: 'blog', label: 'ゲーム', path: '/blog/' },
  { key: 'mobileblog', label: 'モバイル・ゲーム機', path: '/mobileblog/' },
  { key: 'device', label: 'ガジェット', path: '/device/' },
  { key: 'minecraft_blog', label: 'マインクラフト', path: '/minecraft_blog/' },
  { key: 'minecraft_mod_blog', label: 'MOD解説', path: '/minecraft_mod_blog/' },
] as const;

export type SectionKey = (typeof SECTIONS)[number]['key'];

/** グローバルナビ。実在するページだけを載せる。 */
export const NAV = [
  { label: 'ホーム', href: '/' },
  { label: 'Tools', href: '/tools/' },
  ...SECTIONS.map((s) => ({ label: s.label, href: s.path })),
] as const;

export type Post = CollectionEntry<SectionKey>;

export function postUrl(post: Post): string {
  return `/${post.collection}/${post.id}/`;
}

export function sectionLabel(key: string): string {
  return SECTIONS.find((s) => s.key === key)?.label ?? '';
}

/** 全コレクションを新しい順にまとめて返す。 */
export async function getAllPosts(): Promise<Post[]> {
  const lists = await Promise.all(SECTIONS.map((s) => getCollection(s.key)));
  return (lists.flat() as Post[]).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'numeric', day: 'numeric' });
}
