---
name: content-authoring
description: ブログの Markdown / MDX 記事を書くときの最小ルール（frontmatter / slug / tags / draft / 画像 / OGP / 安全性）
---

# 記事執筆 Skill

参考元: なし（このプロジェクト固有）

`packages/content/posts/` 配下に置く Markdown / MDX 記事の書き方を最小限で定義する。
詳細は運用しながら拡張する。

---

## 目的

- 記事メタデータ（frontmatter）を一貫させる
- slug / tags / 公開状態の扱いを統一する
- Markdown / MDX の安全性と読みやすさを担保する

## 使用するタイミング

- 新しい記事を起こすとき
- 既存記事のメタデータを更新するとき
- 画像 / OGP を追加するとき
- カスタム MDX コンポーネントを使うとき

## 手順

### 1. frontmatter テンプレート

```md
---
title: "記事タイトル"
slug: "kebab-case-slug"
publishedAt: "2026-05-07"
updatedAt: "2026-05-07"
tags: ["aws", "cdk"]
description: "1〜2 文の概要（OGP / SEO 用）"
draft: false
---
```

- `title`: 60 文字程度を目安（OGP / 検索結果で切れない長さ）
- `slug`: 英小文字 + `-`。日本語 slug は使わない
- `publishedAt` / `updatedAt`: ISO 8601 日付（タイムゾーン省略可）
- `tags`: 小文字、必要最小限。タグの新設は記事 1 本のために増やしすぎない
- `description`: 検索結果と OGP に出る短い説明
- `draft`: `true` の間は本番ビルドに出さない

### 2. slug の付け方

- URL を後から変えない前提で付ける
- 検索キーワードに合うシンプルな英語を使う
- 重複しないかリポジトリ内で確認する

### 3. 内部リンク

- `[テキスト](/posts/<slug>)` の形を基本にする
- 絶対 URL は外部参照のみ
- リンク切れチェックは `tools/` 配下のスクリプトで定期確認する想定

### 4. 画像

- `packages/content/assets/images/` 配下に配置する
- ファイル名は kebab-case + 説明的にする
- 画像には必ず `alt` を付ける（装飾は `alt=""`）
- サイズは投稿前に圧縮（WebP 検討）し、無闇に大きいファイルを上げない

### 5. OGP

- frontmatter の `title` / `description` から自動生成する想定
- 個別 OG 画像が必要な場合は `og:image` 用の URL を frontmatter に追加する規約を作る

### 6. MDX のカスタムコンポーネント

- 利用可能なコンポーネントは許可リスト化する
- 信頼境界が同じでも `dangerouslySetInnerHTML` を避ける
- 新しいコンポーネントを記事内で使う場合は、
  `apps/web/src/features/articles/` で許可リストに追加する

### 7. コードブロック

- 言語名を必ず指定する（` ```ts `, ` ```bash ` 等）
- 長すぎるコードは要点に絞り、リンク or 折りたたみで対応する
- 実行可能コードは「再現できる前提」を本文で示す（依存・バージョン・コマンド）

### 8. 公開前チェック

- `pnpm typecheck` / `pnpm lint` / `pnpm test` がローカルで通る
- ローカルで実際にレンダリングを確認する
- VRT 対象のページに影響しないか確認する

## チェックリスト

記事 PR で確認する。

- [ ] frontmatter のキーが揃っているか
- [ ] slug がユニークで永続的か
- [ ] tags が必要最小限・既存タグと整合しているか
- [ ] 画像に意味のある `alt` が付いているか
- [ ] 外部リンクに `rel="noopener noreferrer"` が付くようになっているか
- [ ] 内部リンクが相対パスで書かれているか
- [ ] コードブロックに言語指定があるか
- [ ] `draft: false` で公開する準備ができているか
- [ ] OGP / description が読みやすい長さに収まっているか

## 禁止事項

- slug を後から変える（URL 永続性を破壊する）
- `dangerouslySetInnerHTML` 相当の生 HTML 挿入をする
- 画像をリポジトリにギガ単位で上げる
- 機密情報（個人データ・社内資料・他人のコード断片）を記事に含める
- 許可リストにないカスタム MDX コンポーネントを使う
- タグを 1 記事のために量産する
