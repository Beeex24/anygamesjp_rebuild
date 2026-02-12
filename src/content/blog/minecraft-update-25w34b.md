---
title: '【Minecraft】スナップショット25w34b：新パノラマ画面とサーバー行動規範機能が追加される模様'
description: 'Minecraftスナップショット25w34bでは新しいメインメニュー背景、サーバー行動規範機能、カッパーゴーレムの各種バグ修正が実装されました。最新情報をわかりやすく解説します。'
pubDate: '2025-08-20'
updatedDate: '2025-08-20'
heroImage: '/pcgame/minecraft/update/25w34b/update34b.png'
category: 'minecraft'
---

## 【Minecraft】スナップショット25w34b：新パノラマ画面とサーバー行動規範機能を追加

Mojang Studiosより、**Minecraftスナップショット25w34b**がリリースされました。今回は比較的小規模なアップデートですが、新しいメインメニューのパノラマ画像、サーバー行動規範機能、そしてカッパーゴーレムに関する多くの修正が含まれています。

### リリース情報

- **リリース日**: 2025年8月20日
- **対象**: Minecraft Java Edition
- **データパックバージョン**: 84.0
- **リソースパックバージョン**: 66.0

## 新機能

### サーバー行動規範機能

スナップショット25w34bの最大の新機能は、**サーバー内行動規範システム**です。

#### 主な特徴
- サーバー接続時に行動規範画面を表示可能
- 行動規範への同意がサーバープレイの必須条件
- 「今後この行動規範を表示しない」チェックボックス
- 行動規範が変更された場合は再表示

#### サーバー管理者向け設定
```properties
# server.propertiesに追加
enable-code-of-conduct=true
```

行動規範ファイルは`codeofconduct`フォルダに言語コード形式で配置
- `ja_jp.txt` - 日本語版
- `en_us.txt` - 英語版（デフォルト）

プレイヤーの言語設定に応じて適切な行動規範が表示されます。

### 新しいメインメニュー背景

メインメニューのパノラマ背景が更新され、**村でのカッパーゴーレム**が描かれた新しい風景が追加されました。これまでのバニラの風景とは異なる、よりダイナミックな背景を楽しめます。

## 変更点・改善点

### エンドの光る閃光の調整

エンドディメンションでの光る閃光システムが改善されました。

- 閃光音の遅延時間を増加
- アクセシビリティ設定「稲妻の閃光を隠す」を「空の閃光を隠す」に名称変更
- エンドの閃光も無効化対象に追加
- 設定無効時でも閃光源は空に表示され、音も再生

### カッパーゴーレムの微調整

カッパーゴーレムの使い勝手が大幅に向上しました。

#### ヒットボックス調整
- **幅**: 0.6ブロック（ドアを通れるサイズに）
- **高さ**: 1.01ブロック（特定ブロックでスタックしないよう調整）

#### その他の改善
- 透明化ポーション使用時に目も透明に
- カッパーゴーレムとカッパーチェストの音が12ブロック先まで聞こえるように
- 銅の仕分け音をより静かに調整

## 技術的変更

### 新コマンド：fetchprofile

プレイヤープロファイルをMinecraftサーバーから取得する新しいコマンドが追加されました。

```mcfunction
# 名前でプロファイル取得（大文字小文字区別なし）
fetchprofile name <プレイヤー名>

# UUIDでプロファイル取得
fetchprofile id <uuid>
```

#### 特徴
- **非同期処理**: ゲームを一時停止せずにバックグラウンドで実行
- **結果表示**: 完了時に完全解決されたプロファイル情報を表示
- **コピー機能**: 結果をクリップボードにコピー可能

### データコンポーネントの変更

`minecraft:profile`コンポーネントが大幅に改良されました。

#### 静的プロファイル
- `properties`フィールドがある場合
- `name`と`id`両方が存在する場合
- 両方とも欠けている場合
- **特徴**: 装飾用途に最適、スキンが固定

#### 動的プロファイル
- `name`または`id`のみ存在する場合
- **特徴**: 常に最新のプレイヤースキンを表示
- クライアントサイドで自動解決
- ツールチップで静的/動的を区別表示

## 主要なバグ修正

### ワールド選択画面
- ワールド名/バージョン/タイムスタンプのオーバーフロー修正

### カッパーゴーレム関連
- 手のアニメーション再生問題を修正
- インベントリでの銅像モデル表示問題を解決
- ドアを通れないヒットボックス問題を修正
- NoAIタグ付きゴーレムの回転問題を修正
- バナーを後ろ向きに装着する問題を修正

### アクセシビリティ改善
- 統計画面のキーボードナビゲーション改善
- コマンドブロックインターフェースのTABキー順序修正
- 機織り機UIでのツールチップ表示修正

### ゲームプレイ関連
- 矢の所有権喪失問題を修正
- スプリント切り替え状態のリセット問題を解決
- 飛行状態の保存問題を修正
- ガーディアンがボートに入れない問題を修正

## スナップショットの入手方法

1. **Minecraft Launcher**を開く
2. 「導入」タブを選択
3. スナップショットを有効化
4. バックアップを作成してから試用することを強く推奨

**注意**: テスト版はワールドを破損する可能性があります。必ずバックアップを取り、メインワールドとは別のフォルダで実行してください。

## まとめ

スナップショット25w34bは小規模ながらも、サーバー管理者にとって非常に有用な行動規範機能と、カッパーゴーレムの使い勝手向上が注目ポイントです。新しいメインメニュー背景も含め、プレイ体験の質を向上させる内容となっています。

---

**[Minecraft公式サイトはこちら](https://www.minecraft.net/ja-jp)**

<div class="simple-related">
  <h3>🔗 関連記事</h3>
  <ul>
    <li><a href="/blog/minecraft-update-25w32a">【Minecraft】最新のスナップショット25w32aがリリース！新しい銅の装飾ブロックが登場！</a></li>
    <li><a href="/blog/minecraft-beupdate-1_21_1">【Minecraft】Bedrock Edition 1.21.1 アップデート完全ガイド！コッパーゴーレムと便利な新機能が満載</a></li>
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