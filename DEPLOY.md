# 公開手順(ロリポップ)

このサイトは Astro で作った**静的サイト**です。`npm run build` で `dist/` フォルダができ、その中身をレンタルサーバーに置くだけで公開できます。サーバー側にNodeは不要です。

## 0. 事前準備(初回のみ)

1. Node.js 20 以上をインストール(`node -v` で確認)
2. リポジトリを取得して依存パッケージを入れる
   ```bash
   git clone https://github.com/Beeex24/anygamesjp_rebuild.git
   cd anygamesjp_rebuild
   npm ci
   ```
   `npm ci` は `package-lock.json` のとおりに入れるため、Astro 5 のまま固定されます。
   **`npm audit fix --force` は実行しないでください**(Astro 7 に上がってビルドが壊れます)。
3. お問い合わせフォーム用の設定ファイルを作る
   ```bash
   cp .env.example .env
   ```
   `.env` を開き、EmailJS の3つの値(Service ID / Template ID / Public Key)を入れます。
   値はビルド時にHTMLへ埋め込まれます。`.env` は Git に入らないので、**ビルドするPCごとに作成**してください。

## 1. ビルド

```bash
npm run build
```

`dist/` ができます(約221ページ)。`astro check`(型チェック)も通したい場合は `npx astro check`。

ローカルで本番と同じ表示を確認するには `npm run preview`。

## 2. アップロード

1. FTPソフト(FileZilla など)でロリポップに接続
2. **`dist/` の中身すべて**を公開フォルダ(独自ドメインのフォルダ)へアップロード
   - `dist/` フォルダそのものではなく、**中身**を置きます
   - `.htaccess`(隠しファイル)も含まれます。FTPソフトの「隠しファイルを表示」をオンにして、アップロードされたか確認してください
3. 古いファイルが残らないよう、更新時は公開フォルダの中身を入れ替えます(初回は `anygamesjp.com` の旧ファイルを必ずバックアップしてから)

## 3. 公開後の確認

- トップ・記事・一覧・ツール・お問い合わせが開く
- 旧URL(末尾スラッシュなし、例 `https://anygamesjp.com/blog/battlefieldvi`)が `/blog/battlefieldvi/` に転送されて表示される
- 存在しないURLで404ページが出る(例 `/abc/`)
- 画像圧縮などのツールで画像を処理できる(WASM を使うため、スマホ実機でも確認)
- お問い合わせフォームのテスト送信
- `https://anygamesjp.com/sitemap-index.xml` と `/robots.txt` が開く
- Google Search Console にサイトマップ(`sitemap-index.xml`)を再送信

## 4. 切り戻し

問題があれば、事前に取っておいた旧ファイルのバックアップをそのまま戻してください。

## 5. 記事の追加・更新

- 記事は `src/content/<ジャンル>/` の Markdown を追加・編集
- 画像は `public/` 以下に置き、記事の `heroImage` や本文からパスで参照
- トップの目玉記事は、記事の先頭(frontmatter)に `pickup: 1`(大)・`2`・`3`(小)を書く。同じ番号は1記事だけにする。未指定の枠は画像つきの最新記事で埋まる
- 記事のURLは `/<ジャンル>/<ファイル名>/`。**ファイル名を変えるとURLが変わる**ので、公開済みの記事は名前を変えない
- 保存したら `npm run build` → `dist/` を再アップロード

## 補足

- `public/` の画像が約125MBあり、`dist/` は約150MBになります。アップロードが重い場合は、変更があった画像と HTML だけを差分アップロードできるFTPソフトの同期機能が便利です
- 記事の追加時、画像は可能なら横幅1200px程度に縮小してから置くと、表示も速くなります(サイト内の「画像リサイズ」ツールが使えます)
