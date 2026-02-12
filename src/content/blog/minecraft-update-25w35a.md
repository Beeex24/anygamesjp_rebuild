---
title: '【Minecraft】25w35a スナップショット - サーバー管理プロトコル追加とカッパーゴーレム改善'
description: 'Minecraft 25w35aスナップショットの詳細解説。新しいサーバー管理プロトコル、カッパーゴーレムの改善、UI改良など最新情報をわかりやすく紹介します。'
pubDate: '2025-09-01'
updatedDate: '2025-09-01'
heroImage: '/pcgame/minecraft/update/25w35a/update35a.png'
category: 'minecraft'
---

## 今週の25w35aスナップショットで何が変わった？

今週リリースされたMinecraft 25w35aスナップショットでは、**サーバー管理プロトコル**という新機能が追加されました。これにより、サーバー管理者はより効率的にプレイヤーの確認やゲームルールの調整、サーバー設定の更新ができるようになります。

さらに、プレイヤーアイコンがチャットで使用可能になり、カッパーゴーレムにも重要な改善が加えられています。多数のバグ修正も含まれており、より安定したゲームプレイが期待できます。

## 新機能・追加要素

### Halychian言語サポート
新たにHalychian言語のサポートが追加されました。

## 主な変更点

### レシピ関連の変更
- **吊り看板（Hanging Signs）**の作成に**鉄の鎖（Iron Chain）**のみ使用可能になりました

### UI（ユーザーインターフェース）の改善

#### サーバー追加時の仕様変更
- サーバーリストに新しいサーバーを追加する際、名前が自動入力されなくなりました
- 空欄のままにしておくとデフォルト名が使用されます

#### テキスト選択機能の拡張
- より多くのテキスト入力欄でマウスドラッグによるテキスト選択が可能になりました

#### マウスカーソルの改善
以下のUI要素でマウスカーソルの形が変わるようになりました
- テキスト入力欄
- 数値スライダー
- ボタン
- スクロールバー
- クリック可能なテキストラベル（リンクなど）では「手」の形に変化

この機能は「マウス設定」メニューの「カーソル変更を許可」オプションで無効にできます。

## ブロック・アイテム・エンティティの微調整

### カッパーゴーレムの改善
- **ヒットボックスの調整**：高さ0.98ブロックに変更され、1ブロックの高さの空間でも移動可能
- **銅チェストの接続**：カッパーゴーレム生成時に作られる銅チェストが、近くの銅チェストと正しく接続されるように
- **装備スロットの改善**：
  - サドル装備スロットで避雷針の上に置かれたブロックを管理
  - 頭装備スロットが通常の頭スロットのように機能

## 技術的な変更

### バージョン情報
- **データパック**：85.0
- **リソースパック**：67.0

### サーバープロパティの変更
以下のサーバープロパティがゲームルールに移行され、サーバー稼働中に変更可能になりました

#### 削除されたプロパティ（ゲームルール化）
- `allow-nether`
- `spawn-monsters`
- `enable-command-block`
- `pvp`

#### 新しく追加されたプロパティ
- `management-server-enabled`：管理プロトコルの有効/無効（デフォルト：false）
- `management-server-port`：管理プロトコルのポート（デフォルト：25585）
- `management-server-host`：管理プロトコルのホスト（デフォルト：localhost）
- `status-heartbeat-interval`：ハートビート通知の間隔（デフォルト：0=無効）

## Minecraft サーバー管理プロトコル

### 概要
専用サーバー向けの新しい管理API（JSON-RPC over WebSocket）が追加されました。

### 設定方法
```
management-server-enabled=true
management-server-host=localhost
management-server-port=25585
```

### アクセス方法
有効時は `ws://<management-server-host>:<management-server-port>` でアクセス可能

### 主な機能
- **サーバー状態の確認・更新**（プレイヤー、許可リスト、オペレーター、設定、ゲームルール）
- **リアルタイム通知**（プレイヤー参加、ゲームルール更新など）
- **APIスキーマの取得**：`{"id":1,"method":"rpc.discover"}`

### 使用例

#### メソッド呼び出し例
```json
// リクエスト
{"method":"minecraft:allowlist/add","id":1,"params":[[{"name":"jeb_"}]]}

// レスポンス
{"jsonrpc":"2.0","id":1,"result":[{"id":"853c80ef-3c37-49fd-aa49-938b674adae6","name":"jeb_"}]}
```

#### 通知例
```json
{"jsonrpc":"2.0","method":"notification:players/joined","params":[{"id":"853c80ef-3c37-49fd-aa49-938b674adae6","name":"jeb_"}]}
```

## 新しいゲームルール

### 追加されたゲームルール
- `pvp`：プレイヤー同士のダメージ有効/無効（デフォルト：true）
- `allowEnteringNetherUsingPortals`：ネザーポータルによるネザー進入許可（デフォルト：true）
- `spawnMonsters`：モンスターの自然スポーン許可（デフォルト：true）
- `enableCommandBlocks`：コマンドブロックの有効/無効（デフォルト：true）

## 📝 テキスト描画の改良

### objectテキストコンポーネント
非文字オブジェクトをテキストの一部として表示可能になりました。

#### プレイヤーオブジェクトタイプ
プレイヤーの頭を描画できます：
```json
{
  "player": {
    "name": "プレイヤー名",
    "id": "プレイヤーUUID",
    "properties": "プロファイルプロパティ"
  },
  "hat": true
}
```

## スプライトの変更

### 名称変更
以下のスプライトが改名されました：
- `chain` → `iron_chain`（ブロック・アイテム両方）

## 修正されたバグ（主要なもの）

### カッパーゴーレム関連
- ヒットボックスと体の交差によるZ-fighting問題
- 死亡時のチェスト探索アニメーション継続
- 酸化除去時のパーティクル不表示
- 対角線上のチェスト操作問題
- リードに繋がれた状態でのパスファインディング

### UI・描画関連
- 創造モードでの水面スプリント阻害
- エンチャント光彩の表示問題
- マウスカーソル関連の問題
- 各種テクスチャ・アニメーション問題

### その他
- ワールドアップグレード時のエラー
- スポナー内ミニチュアモブの照明
- 時計の機能問題

## スナップショットの入手方法

1. Minecraft Launcherを開く
2. 「Installations」タブでスナップショットを有効化
3. 25w35aを選択してプレイ

**注意：テスト版はワールドを破損する可能性があります。必ずバックアップを取り、メインワールドとは別のフォルダで実行してください。**

## まとめ

25w35aスナップショットは、特にサーバー管理者にとって重要なアップデートです。新しい管理プロトコルにより、サーバーの運用がより効率的になります。また、カッパーゴーレムの改善やUI向上により、全体的なゲーム体験も向上しています。

多数のバグ修正も含まれているため、より安定したMinecraftプレイが楽しめるでしょう。次回のアップデートも楽しみですね！

---

**[Minecraft公式サイトはこちら](https://www.minecraft.net/ja-jp)**

<div class="simple-related">
  <h3>🔗 関連記事</h3>
  <ul>
    <li><a href="/blog/minecraft-update-25w32a">【Minecraft】最新のスナップショット25w32aがリリース！新しい銅の装飾ブロックが登場！</a></li>
    <li><a href="/blog/minecraft-update-25w34b">【Minecraft】スナップショット25w34b：新パノラマ画面とサーバー行動規範機能が追加される模様</a></li>
    <li><a href="/blog/minecraft-bepack-better">【Minecraft】BE版にもMOD追加！？！？Better on Bedrockの新要素でBedrockをもっと楽しく！</a></li>
  </ul>
</div>

<style>
.simple-related {
  background: #f8f9fa;
  border-left: 4px solid #667eea;
  border-radius: 0 8px 8px 0;
  padding: 1.5rem;
  margin: 2rem 0;
}

.simple-related h3 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.simple-related ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.simple-related li {
  margin-bottom: 0.75rem;
}

.simple-related a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.simple-related a:hover {
  color: #5a6fd8;
  text-decoration: underline;
}

/* スマホ版サイトの横はみ出し防止 */
@media (max-width: 768px) {
  * {
    max-width: 100% !important;
    box-sizing: border-box !important;
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
  }
  
  html, body {
    overflow-x: hidden !important;
    width: 100% !important;
    max-width: 100vw !important;
  }
  
  .container {
    max-width: 100vw !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
  }
  
  .main-content {
    padding: 0 10px !important;
    max-width: 100% !important;
    overflow-x: hidden !important;
  }
  
  .article-area {
    max-width: 100% !important;
    overflow-x: hidden !important;
  }
  
  .prose {
    max-width: 100% !important;
    overflow-x: hidden !important;
  }
  
  /* テーブルの横スクロール対応 */
  table {
    display: block !important;
    overflow-x: auto !important;
    white-space: nowrap !important;
    max-width: 100% !important;
  }
  
  /* 画像の横はみ出し防止 */
  img {
    max-width: 100% !important;
    height: auto !important;
    width: auto !important;
  }
  
  /* 長いURL・テキストの改行 */
  a, p, span, div, h1, h2, h3, h4, h5, h6 {
    word-break: break-all !important;
    overflow-wrap: break-word !important;
    hyphens: auto !important;
  }
  
  /* コードブロックの横スクロール */
  pre, code {
    overflow-x: auto !important;
    max-width: 100% !important;
  }
}

@media (max-width: 480px) {
  .container {
    margin: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    width: 100vw !important;
    max-width: 100vw !important;
  }
  
  .main-content {
    padding: 0 5px !important;
  }
}
</style>