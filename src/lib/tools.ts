export interface ToolMeta {
  slug: string;
  href: string;
  name: string;
  summary: string;
  category: 'image' | 'game' | 'pc';
}

/** 公開済みのツールのみ載せる(実装済みのものだけリンクする) */
export const TOOLS: ToolMeta[] = [
  {
    slug: 'compressor',
    href: '/tools/image/compressor/',
    name: '画像圧縮',
    summary: '画質を保ったままファイルサイズを小さく。目標サイズの指定もできます。',
    category: 'image',
  },
];

export const TOOL_CATEGORIES = {
  image: '画像ツール',
  game: 'ゲームツール',
  pc: 'PCツール',
} as const;
