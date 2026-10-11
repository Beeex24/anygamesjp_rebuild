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
    summary: 'JPEG・PNG・WebP・AVIFを相互に変換。透過画像の背景色も選べます。',
    category: 'image',
  },
  {
    slug: 'edpi',
    href: '/tools/game/edpi/',
    name: 'eDPI計算',
    summary: 'DPIと感度からeDPIと、360°振り向くマウス移動距離(cm/360)を計算。',
    category: 'game',
  },
  {
    slug: 'sensitivity',
    href: '/tools/game/sensitivity/',
    name: 'ゲーム感度変換',
    summary: 'VALORANT・CS2・Apexなど、ゲーム間で同じ振り向き距離になる感度に変換。',
    category: 'game',
  },
  {
    slug: 'fps',
    href: '/tools/game/fps/',
    name: 'FPS・フレームタイム変換',
    summary: 'FPSとフレームタイム(ms)を相互に変換。FPSを上げたときの短縮時間も計算。',
    category: 'game',
  },
  {
    slug: 'electricity',
    href: '/tools/pc/electricity/',
    name: 'PCの電気代計算',
    summary: '消費電力と使用時間から、1日・1か月・1年の電気代を計算。',
    category: 'pc',
  },
  {
    slug: 'psu',
    href: '/tools/pc/psu/',
    name: 'PC電源容量計算',
    summary: 'CPU・グラボなどの消費電力から、必要な電源容量の目安を計算。',
    category: 'pc',
  },
];

export const TOOL_CATEGORIES = {
  image: '画像ツール',
  game: 'ゲームツール',
  pc: 'PCツール',
} as const;

/** カテゴリ色。一覧・トップ・各ツールページで共通に使う */
export const TOOL_COLORS: Record<ToolMeta['category'], string> = {
  image: '#1e88e5',
  game: '#7e57c2',
  pc: '#2e9e5b',
};

/** 「やりたいこと」から探す導線(slug は TOOLS のもの) */
export const TOOL_GOALS: { label: string; hint: string; slug: ToolMeta['slug'] }[] = [
  { label: '画像を軽くしたい', hint: '画像圧縮', slug: 'compressor' },
  { label: '画像の大きさを変えたい', hint: '画像リサイズ', slug: 'resizer' },
  { label: '画像の形式を変えたい', hint: '画像変換', slug: 'converter' },
  { label: 'ゲームの感度を合わせたい', hint: 'ゲーム感度変換', slug: 'sensitivity' },
  { label: 'マウス感度を数値で比べたい', hint: 'eDPI計算', slug: 'edpi' },
  { label: 'FPSとフレームタイムを知りたい', hint: 'FPS・フレームタイム変換', slug: 'fps' },
  { label: 'PCの電気代を知りたい', hint: 'PCの電気代計算', slug: 'electricity' },
  { label: '必要な電源容量を知りたい', hint: 'PC電源容量計算', slug: 'psu' },
];
