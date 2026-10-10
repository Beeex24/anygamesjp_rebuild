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
  {
    slug: 'resizer',
    href: '/tools/image/resizer/',
    name: '画像リサイズ',
    summary: '画像の拡大・縮小。長辺・倍率・幅と高さで指定できます。',
    category: 'image',
  },
  {
    slug: 'converter',
    href: '/tools/image/converter/',
    name: '画像変換',
    summary: 'JPEG・PNG・WebPを相互に変換。透過画像の背景色も選べます。',
    category: 'image',
  },
];

export const TOOL_CATEGORIES = {
  image: '画像ツール',
  game: 'ゲームツール',
  pc: 'PCツール',
} as const;
