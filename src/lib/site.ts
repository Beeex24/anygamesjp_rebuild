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
  { label: 'ゲーム関連', href: '/blog/' },
  { label: 'マインクラフト', href: '/minecraft_blog/' },
  { label: 'マインクラフト MOD解説', href: '/minecraft_mod_blog/' },
  { label: 'ガジェットレビュー', href: '/device/' },
  { label: 'モバイル＆ゲーム機記事', href: '/mobileblog/' },
  { label: 'Tools', href: '/tools/' },
  { label: 'お問い合わせ', href: '/about/' },
  { label: '当サイトについて', href: '/infosite/' },
] as const;

export type Post = CollectionEntry<SectionKey>;

export function postUrl(post: Post): string {
  return `/${post.collection}/${post.id}/`;
}

/** セクションごとのラベル色(旧サイトのカテゴリ色に準拠) */
export const SECTION_COLORS: Record<string, string> = {
  blog: '#2f7de1',
  mobileblog: '#8e5bd6',
  device: '#2ea44f',
  minecraft_blog: '#e0702b',
  minecraft_mod_blog: '#d13f6a',
};

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
