---
name: backend-patterns
description: Node.js + Hono の WebChat API を、薄い handler・機能別配置・CSV リポジトリ隔離・ローカル再現性を保って実装するパターン集
---

# バックエンド パターン Skill

このプロジェクトでは、Node.js + Hono を使い、CSV ファイルをデータストアとした
シンプルな WebChat API を実装する。

---

## 目的

- handler を薄く保ち、機能フォルダで凝集度を高める
- ローカルで再現できるテスト・実行環境を保つ
- CSV ファイルアクセスをリポジトリ層に閉じ込める

## 使用するタイミング

- 新しい API エンドポイントを追加するとき
- 既存ユースケース関数の責務を整理するとき
- CSV 操作を追加するとき
- ローカル実行と CI の差を縮めたいとき

## 手順

### 1. 機能フォルダを切る

`apps/backend/src/<feature>/` の中に必要なファイルを揃える。

```txt
apps/backend/src/chats/
├── handler.ts              // Hono ルート定義
├── getChats.ts             // チャット取得ユースケース
├── postChat.ts             // チャット送信ユースケース
├── chatsRepository.ts      // CSV アクセスを隔離
├── chatsSchema.ts          // zod スキーマ
├── chatsTypes.ts           // ドメイン型
└── getChats.test.ts        // ユースケースのテスト
```

### 2. handler は 4 ステップだけ

```ts
// handler.ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { getChats } from './getChats'
import { postChatSchema } from './chatsSchema'
import { csvRepository } from './chatsRepository'

const app = new Hono()

app.get('/chats', async (c) => {
  const result = await getChats({ repo: csvRepository })
  return c.json({ data: result })
})

app.post('/chats', zValidator('json', postChatSchema), async (c) => {
  const body = c.req.valid('json')
  await postChat({ ...body, repo: csvRepository })
  return c.json({ data: null }, 201)
})

export default app
```

- handler でビジネスロジックを書かない
- 例外は handler の手前で捕まえ、エラーレスポンスに整形する

### 3. ユースケース関数は純粋寄りに保つ

- 引数で依存（リポジトリ・現在時刻）を受け取る
- 内部でファイル I/O を直接行わない
- これによりテストでは fake repository を渡すだけで網羅できる

```ts
interface ChatsRepo {
  readAll(): Promise<ChatEntry[]>
  append(entry: ChatEntry, logPath: string): Promise<void>
  trim(maxCount: number): Promise<void>
}

export async function getChats({ repo }: { repo: ChatsRepo }): Promise<ChatEntry[]> {
  return repo.readAll()
}
```

### 4. リポジトリは CSV アクセスをここだけに閉じ込める

```ts
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'
import fs from 'node:fs'

export const csvRepository = {
  async readAll(): Promise<ChatEntry[]> {
    const content = fs.readFileSync(process.env.CHAT_CSV_PATH!, 'utf-8')
    return parse(content, { columns: true })
  },

  async append(entry: ChatEntry): Promise<void> {
    const row = stringify([entry], { header: false })
    fs.appendFileSync(process.env.CHAT_CSV_PATH!, row)
  },

  async trim(maxCount: number): Promise<void> {
    const all = await this.readAll()
    const trimmed = all.slice(-maxCount)
    const content = stringify(trimmed, { header: true })
    fs.writeFileSync(process.env.CHAT_CSV_PATH!, content)
  },
}
```

### 5. 入力検証は zod に集約する

- リクエストボディ・クエリの全項目を schema 化
- `unknown` で受けて narrow する
- 検証失敗は 400 系で「攻撃に有利な情報を含まない」メッセージを返す

```ts
import { z } from 'zod'

export const postChatSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.enum(['red', 'blue', 'green', 'purple', 'orange']),
  message: z.string().min(1).max(500),
})
```

### 6. エラーレスポンスを統一する

```ts
// shared/http.ts
export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message)
  }
}

export function errorResponse(code: string, message: string, status = 400) {
  return { error: { code, message } }
}
```

### 7. CORS 設定

```ts
import { cors } from 'hono/cors'
app.use('*', cors({ origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173' }))
```

### 8. ローカル実行

- 環境変数（`.env`）で CSV ファイルパスを設定する
- `npm run dev` でローカルサーバーが起動する構成を維持する

## チェックリスト

エンドポイント追加時に確認する。

- [ ] handler が 4 ステップに収まっているか
- [ ] ユースケース関数に CSV アクセスが漏れていないか
- [ ] `unknown` で受けて zod で narrow しているか
- [ ] レスポンスフォーマットが既存と一致しているか
- [ ] ローカルで動作確認できるか
- [ ] ログに機微情報が出ていないか
- [ ] 単体テストで正常系・異常系・境界値が押さえられているか

## 禁止事項

- handler に CSV アクセスや整形ロジックを直接書く
- ユースケース関数内で直接ファイル I/O する
- 失敗時に `error.message` をそのままレスポンスに含める
- DB など新しいデータストアを ADR なしで導入する
