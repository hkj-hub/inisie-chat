---
applyTo: "apps/frontend/**"
---

# フロントエンド指針

このファイルは、`apps/frontend` 配下のフロントエンド実装で常時守るべきルールを扱う。
詳細パターンは `.github/skills/frontend-patterns/SKILL.md` を参照する。

---

## 1. Vue.js + TypeScript SPA 前提

- Vue.js 3 + TypeScript で実装する
- Vue Router でページ間遷移を管理する
- Composition API（`<script setup>`）を標準とする
- Options API を新規コードで使わない

## 2. 機能別配置

- `apps/frontend/src/features/` 配下に機能単位で実装をまとめる
- 例: `entrance/`, `chat/`, `log/`
- UI コンポーネントとデータ取得・型・schema を同じ機能フォルダに置く
- 機能をまたぐ純粋ユーティリティは `apps/frontend/src/shared/` に置くが、「便利な置き場」にしない

## 3. UI とデータ取得の混在を避ける

- ページコンポーネントは取得結果の表示と高水準のレイアウトに集中させる
- データ取得・整形は機能フォルダ内の関数（`fetchChats.ts` 等）に分離する
- API レスポンスは `zod` で検証してから UI に渡す（信頼境界）

## 4. ポーリング実装

- `setInterval` で 1 分に 1 回チャットを取得する
- `onUnmounted` で `clearInterval` を呼び、リソースリークを防ぐ
- チャット送信後は即時更新する

```ts
onMounted(() => {
  fetchChats()
  const timer = setInterval(fetchChats, 60_000)
  onUnmounted(() => clearInterval(timer))
})
```

## 5. アクセシビリティ

- 主要操作はキーボードでも完結するよう実装する
- 画像には意味のある `alt`、装飾画像には空の `alt=""` を付ける
- 見出し階層 (`h1`〜`h6`) を飛ばさない
- フォーカス可視を消さない（CSS リセットで `outline: none` を残さない）
- フォームには `<label>` を結びつける

## 6. ユーザー入力の安全性

- `v-html` を信頼できないユーザー入力に使わない
- チャットメッセージの表示はテキスト補間（`{{ }}` / `v-text`）を使う
- 外部リンクには `rel="noopener noreferrer"` を付与する

## 7. 状態管理

- グローバルストアは「本当に複数機能をまたぐ」場合のみ導入する
- 多くは `ref` / `reactive` / 親コンポーネントで十分
- 名前・色などユーザー情報はセッションストレージで保持する

## 8. やってはいけないこと

- `v-html` を信頼できないデータに使う
- 1 機能のために `shared/` を肥大化させる
- ページコンポーネントに大量の fetch / 整形ロジックを詰め込む
- 設計レベルの大規模変更（状態管理ライブラリ導入等）を独断で行う

---

## 9. 推奨フォルダ構成（`apps/frontend`）

```txt
apps/frontend/
├── public/
│
├── src/
│   ├── router/
│   │   └── index.ts
│   │
│   ├── features/
│   │   ├── entrance/
│   │   │   ├── EntrancePage.vue
│   │   │   ├── fetchChats.ts
│   │   │   ├── chatSchema.ts
│   │   │   └── chatTypes.ts
│   │   │
│   │   ├── chat/
│   │   │   ├── ChatPage.vue
│   │   │   ├── ChatMessage.vue
│   │   │   ├── postChat.ts
│   │   │   └── fetchChats.ts
│   │   │
│   │   └── log/
│   │       ├── LogPage.vue
│   │       └── fetchLogs.ts
│   │
│   ├── shared/
│   │   ├── ui/
│   │   │   └── AppHeader.vue
│   │   └── lib/
│   │       └── formatDate.ts
│   │
│   ├── App.vue
│   └── main.ts
│
├── tests/
│   └── chat.test.ts
│
├── package.json
└── tsconfig.json
```

方針:

- `src/features/<機能>/` に UI、データ取得、型、schema をまとめる
- `src/shared/ui/` にはサイト共通の UI（ヘッダー等）
- `src/shared/lib/` には機能横断の純粋関数（`formatDate` 等）
- `tests/` は Vitest 用
- 機能専用コンポーネントを `shared/ui/` に置かない
