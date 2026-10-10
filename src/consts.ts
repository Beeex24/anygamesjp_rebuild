export const SITE_TITLE = 'ANYGAMES放送局';
export const SITE_DESCRIPTION =
  'ゲームの新作情報やセール情報、デバイスの新製品情報などをお届けする情報サイトです。';

export const ADSENSE_CLIENT = 'ca-pub-4929223237591717';
// 広告ユニットID。AdSense管理画面で枠ごとに新規作成して差し替えると、枠別の成果を比較できます。
// （記事本文中の自動挿入枠は astro.config.mjs の rehypeAds で指定）
export const ADS = {
  postBottom: '5954046828', // 記事末
  sidebar: '5954046828', // サイドバー（追従）
  listFeed: '5954046828', // 一覧のカード間
};

export const AFFILIATE_NOTICE = '※ 記事内にアフィリエイト広告が含まれています';
export const AMAZON_NOTICE = 'Amazonのアソシエイトとして、当サイトは適格販売により収入を得ています。';

export const SOCIAL = {
  x: 'https://x.com/ANYGAMES_jp',
  youtube: 'https://www.youtube.com/@chris8game',
};

// 記事末のプロフィール。実績・運営歴・レビュー経験などを足すほど信頼性が上がります。
export const AUTHOR = {
  name: 'ANYGAMES放送局 運営者',
  bio: 'ゲームの新作・セール情報やガジェットのレビューを発信しています。',
};