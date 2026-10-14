/**
 * ゲーム別ハブページ(/games/<slug>/)の定義。
 * 記事はタイトルに words のどれかが含まれるものを自動で集める。
 * ゲームを増やすときは、ここに1件足すだけでよい(記事が十分にあるゲームだけにすること)。
 */
export interface GameHub {
  slug: string;
  name: string;
  /** タイトル判定に使う語(小文字で比較) */
  words: string[];
  /** ハブの説明文(検索結果にも出る。ゲームごとに固有の内容にする) */
  lead: string;
}

export const GAME_HUBS: GameHub[] = [
  {
    slug: 'valorant',
    name: 'VALORANT',
    words: ['valorant', 'ヴァロラント'],
    lead: 'VALORANTのパッチノート、新マップ・新エージェントの情報、VCTなどの大会情報、スキン情報の記事を新しい順にまとめています。',
  },
  {
    slug: 'apex',
    name: 'Apex Legends',
    words: ['apex', 'エーペックス'],
    lead: 'Apex Legendsのシーズン情報、アップデート・パッチノート、イベント攻略、ランクやマッチメイキングの変更点の記事を新しい順にまとめています。',
  },
];

export const hubUrl = (h: GameHub) => `/games/${h.slug}/`;

export const matchesHub = (title: string, h: GameHub) => {
  const t = title.toLowerCase();
  return h.words.some((w) => t.includes(w));
};
