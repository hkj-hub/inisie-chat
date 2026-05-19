# ADR-002: チャット一覧の表示順

## ステータス

採用

---

## 背景

バックエンドの `GET /api/chats` は CSV ファイルの行順（昇順）でレスポンスを返す。
チャット画面ではユーザーが最新メッセージをすぐ確認できるよう、降順（新しい順）での表示が望ましい。
一方、ログ画面は履歴の閲覧が目的であるため、昇順（古い順）のままで問題ない。

これを踏まえ、「どこでソートを行うか」について決定が必要だった。

---

## 決定

`apps/frontend/src/features/chat/fetchChats.ts` でソートを実施する。
API レスポンス取得後、`timestamp` の降順ソートを適用する。
`ChatPage.vue` への変更はゼロとする。
エントランス画面も同様に `apps/frontend/src/features/entrance/fetchChats.ts` で降順ソートを適用する。

---

## 検討した選択肢

| 案 | 概要 | 採否 |
|---|---|---|
| 案1: `fetchChats.ts` でソート | API 取得後にフィーチャー層でソート | **採用** |
| 案2: `ChatPage.vue` の computed でソート | ビュー層でソート | 不採用 |
| 案3: バックエンド API でソート | `GET /api/chats` にソートクエリを追加 | 不採用 |

### 案1: `fetchChats.ts` でソート（採用）

- ソートロジックがフィーチャーフォルダ（`features/chat/`）に閉じており、関心の分離を維持できる
- `ChatPage.vue` を変更せずに済む
- ログ画面は独立した `fetchLogs.ts` を持つため、ログ画面の表示順に影響しない
- エントランス画面も同様のパターン（`features/entrance/fetchChats.ts`）で降順ソートを適用する

### 案2: `ChatPage.vue` の computed でソート（不採用）

- ソートというデータ加工のロジックがビュー層に漏れる
- `ChatPage.vue` が取得・変換・表示の複数の責務を担うことになり、保守性が下がる

### 案3: バックエンド API でソート（不採用）

- `GET /api/chats` の仕様変更が必要となり、API の後方互換性に影響する
- チャット API とログ API で異なる順序が必要なため、両 API の実装に手を入れる必要がある

---

## 影響範囲

- **変更対象**: `apps/frontend/src/features/chat/fetchChats.ts`、`apps/frontend/src/features/entrance/fetchChats.ts`
- **変更なし**: `ChatPage.vue`、バックエンド、ログ画面

---

## 採用しない条件

以下のいずれかが生じた場合、この決定を見直す。

- バックエンドが `GET /api/chats` にソートパラメータを正式サポートした場合
- チャット件数が大幅に増え、フロントエンドでのソートが性能上の問題になった場合

---

## 未解決事項

なし
