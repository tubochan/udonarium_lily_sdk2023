# ユドナリウムリリィ (SkyWay 2023 対応版)

本プロジェクトは、円柱(entyu)様による「[ユドナリウムリリィ](https://github.com/entyu/udonarium_lily)」をベースに、**SkyWay 2023 SDK (@skyway-sdk/core)** に対応させた有志によるフォーク版です。

オリジナルの作者である円柱様、および本家ユドナリウムの作者である TK11235 様に深く感謝いたします。

## 📢 本フォーク版の目的
従来の SkyWay (旧PeerJSベース) API の提供終了に伴い、最新の SkyWay 2023 SDK で動作するようにネットワーク層および周辺機能を刷新しました。これにより、今後も継続してユドナリウムリリィを利用することが可能になります。

---

## 🛠 改修内容の詳細

本バージョンでは、以下の技術的な変更を行っています。

### 1. ネットワーク層の刷新
- **SkyWay 2023 SDK の導入**: `skyway-js` (旧) から `@skyway-sdk/core` (新) へ完全に移行しました。
- **動的ネットワーク切替**: `src/assets/config.yaml` の設定により、旧SkyWayと新SkyWayを切り替えて動作させることが可能です（デフォルトは新API）。
- **認証バックエンド連携**: 新SDKで必須となる認証トークン取得のため、外部の Web API (Cloudflare Workers 等) と通信する `SkyWayBackend` クラスを実装しました。

### 2. ロビーおよび接続ロジックの修正
- **ルーム一覧取得の刷新**: 従来の PeerJS による検索から、SkyWay 2023 のチャネル（Room）メタデータを使用したルーム一覧取得方式へ変更しました。
- **IDハッシュ化**: セキュリティと整合性のため、チャネル名にはルーム情報のハッシュ値を使用するように変更しました。

### 3. ビルド環境および依存関係の改善
- **TypeScript 設定**: パッケージの互換性向上のため `allowSyntheticDefaultImports: true` を有効化しました。
- **パッケージ管理**: 全ての SkyWay 関連ライブラリを `package.json` による管理に統合し、`index.html` からの外部CDN読み込みを廃止しました。

---

## 🚀 使い方

### 1. バックエンドサーバの準備
SkyWay 2023 SDK を利用するには、認証トークンを発行するためのバックエンドサーバが必要です。
[udonarium-backend](https://github.com/TK11235/udonarium-backend) 等をデプロイし、その URL を取得してください。

### 2. 設定ファイルの編集
`src/assets/config.yaml` を開き、以下の項目を設定します。

```yaml
backend:
  mode: skyway2023
  url: https://your-backend-api.workers.dev/  # 取得したバックエンドのURL
```

### 3. ビルドと設置
1. `npm install` で依存関係をインストール。
2. `npm run build` でプロダクションビルドを作成。
3. `dist/udonarium_lily` の内容を Web サーバに配置してください。

※ デプロイ先が HTTPS である必要があります（SkyWay 2023 の制約）。

---

## 📜 ライセンス・著作権
- 本家ユドナリウム（TK11235 様）およびユドナリウムリリィ（円柱 様）の著作権を尊重します。
- 本プロジェクトも同様に **MITライセンス** を引き継ぎます。
- 追加・変更されたコードについては、本フォーク版のコントリビューターに帰属しますが、ライセンスの範囲内で自由にご利用いただけます。

---
以下、オリジナルの README 内容です。

---------

このプロジェクトはユドナリウムをカスタマイズするために分岐し作成しました

ユドナリウム（Udonarium）はWebブラウザで動作するボードゲームオンラインセッション支援ツールです。
本家ユドナリウムの開発範囲は本家に著作権が有り、
追加したコードは私円柱(entyu)あるいは私が組み込んだソースの作者に著作権があります。
いずれにせよライセンスは本家のMITを引き継ぎます。
名前混同を避けるため本開発版名称はudonarium_lily　ユドナリウムリリィとします。

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/TK11235/udonarium/blob/master/LICENSE)


■立ち絵
■発言に色を付ける
■ログの書き出し、消去機能
■カウンターリモコン
■バフデバフ表示
■ダイス表
■画像タグ
■ポップアップ等のUI調整機能

を追加実装しています。

![lily_sample](https://user-images.githubusercontent.com/61339319/95869259-26b41380-0da6-11eb-96fa-1e6c6858c531.png)
