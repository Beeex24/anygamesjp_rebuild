# ANYGAMES (anygamesjp.com)

ゲーム・ガジェットの情報メディア + ブラウザで使える無料Webツール。Astro 5 の静的サイトです。

## コマンド

| コマンド | 内容 |
| --- | --- |
| `npm ci` | 依存パッケージのインストール(ロックファイルどおり) |
| `npm run dev` | 開発サーバー(http://localhost:4321) |
| `npm run build` | `dist/` に本番ファイルを生成 |
| `npm run preview` | ビルド結果のプレビュー |
| `npx astro check` | 型チェック(エラー0を維持) |

## 構成

```
src/content/      記事(blog / mobileblog / device / minecraft_blog / minecraft_mod_blog)
src/pages/        ルーティング(記事URLは /<ジャンル>/<ファイル名>/ を維持)
src/layouts/      BaseLayout / ArticleLayout / ModArticleLayout / ToolLayout
src/components/   共通部品(ヘッダー・フッター・記事カード・一覧ページなど)
src/lib/image/    画像ツールの処理(WASMコーデック・Web Worker)
src/lib/tools.ts  ツール一覧(追加するときはここ)
src/styles/       デザイントークン(tokens.css)・MODページ用テーマ(mc.css)
public/           画像・.htaccess・robots.txt など(そのまま配信)
scripts/          OGP画像の生成スクリプト
```

## 運用メモ

- 公開手順は [DEPLOY.md](./DEPLOY.md)
- お問い合わせフォームは `.env`(`.env.example` を参照)が必要
- Astro は 5 系で固定。`npm audit fix --force` は実行しない
- トップの目玉記事は frontmatter の `pickup: 1〜3` で指定
