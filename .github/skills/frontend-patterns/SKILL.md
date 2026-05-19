---
name: frontend-patterns
description: Vue.js 3 + TypeScript の WebChat フロントエンドにおけるコンポーネント設計、状態管理、データ取得、ポーリング、アクセシビリティの実務パターン
---

# フロントエンド パターン Skill

このプロジェクトは Vue.js 3 + TypeScript の SPA 構成の WebChat である。
Composition API（`<script setup>`）を標準とし、Vue Router でページ遷移を管理する。

---

## 目的

- WebChat 規模に合った、堅実なフロントエンド構成を持つ
- 機能フォルダ構成を崩さない
- アクセシビリティと入力の安全性を確保する

## 使用するタイミング

- 新しいページ・機能を追加するとき
- 既存コンポーネントの責務分割を見直すとき
- 状態管理・ポーリングの選択に迷うとき

## 手順

### 1. ページとデータ取得の責務を分ける

- ページコンポーネントはレイアウトと状態の橋渡しに集中する
- データの取得・整形・検証は機能フォルダ内の関数に分離する

```ts
// features/chat/fetchChats.ts
import { chatEntrySchema } from './chatSchema'

export async function fetchChats(): Promise<ChatEntry[]> {
  const res = await fetch('/api/chats')
  if (!res.ok) throw new Error('Failed to load chats')
  const json: unknown = await res.json()
  return chatEntrySchema.array().parse((json as { data: unknown[] }).data)
}
```

```vue
<!-- features/chat/ChatPage.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { fetchChats } from './fetchChats'
import ChatMessage from './ChatMessage.vue'

const chats = ref<ChatEntry[]>([])

async function refresh() {
  chats.value = await fetchChats()
}

onMounted(() => {
  refresh()
  const timer = setInterval(refresh, 60_000)
  onUnmounted(() => clearInterval(timer))
})
</script>
```

### 2. コンポーネント設計

- Composition API（`<script setup>`）を標準にする
- props は `interface` / `type` で明示する
- コンポジション優先（`slots` を活かす、props でモード分岐に頼りすぎない）

```vue
<script setup lang="ts">
interface Props {
  name: string
  color: string
  message: string
  timestamp: string
}
const props = defineProps<Props>()
</script>
```

### 3. ポーリング実装

```ts
onMounted(() => {
  refresh()
  const timer = setInterval(refresh, 60_000)
  onUnmounted(() => clearInterval(timer))
})
```

- `onUnmounted` で必ず `clearInterval` する
- 送信後は即時 `refresh()` を呼ぶ

### 4. ユーザー情報の保持

- 名前・色はセッションストレージで保持する
- チャット画面遷移時にエントランスに戻らせないため、入室済みかを判定する

```ts
const userInfo = sessionStorage.getItem('userInfo')
if (!userInfo) router.push('/')
```

### 5. 状態管理

- 既定は `ref` / `reactive` / 親からの props
- グローバルストア（Pinia 等）は「複数機能をまたぐ状態が出てから」導入する

### 6. アクセシビリティ

- フォーカス可視を消さない
- 主要操作はキーボードでも実行できる
- フォームには `<label>` を結びつける
- 見出し階層 (`h1` → `h2` → ...) を飛ばさない

### 7. 入力の安全性

- チャットメッセージ表示は `v-text` や `{{ }}` テキスト補間を使う
- `v-html` を信頼できないユーザー入力に使わない

## チェックリスト

新しい UI を作るとき、または PR 提出前に確認する。

- [ ] ページコンポーネントが薄く、データ整形を機能フォルダに移しているか
- [ ] zod でデータを検証してから UI に渡しているか
- [ ] 機能フォルダ内に関連ファイル（コンポーネント・型・フック・テスト）が揃っているか
- [ ] アクセシビリティ（キーボード・フォーカス・見出し階層）を確認したか
- [ ] ポーリングで `clearInterval` しているか
- [ ] `v-html` を信頼できないデータに使っていないか

## 禁止事項

- Options API を新規コードで使う
- ページコンポーネントに大量の fetch / 整形ロジックを詰め込む
- 1 機能のためだけに `shared/` を肥大化させる
- `v-html` を信頼できないユーザー入力に使う
- アクセシビリティ機能（フォーカス可視）を CSS で潰す
- 設計レベルの大規模変更（状態管理ライブラリ導入等）を独断で行う
  → `orchestrator.agent.md` 経由で ADR を要求する
