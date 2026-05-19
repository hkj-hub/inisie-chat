# API 仕様書

## 想定読者と目的

- **想定読者**: このプロジェクトのフロントエンド実装者、およびバックエンド実装者
- **目的**: エンドポイントの入出力仕様を一元的に記録し、フロント・バック間の認識齟齬を防ぐ
- **スコープ**: `apps/backend` が提供する HTTP API の全エンドポイント。内部実装詳細は含まない

---

## Vite プロキシ設定方針

フロントエンド（`apps/frontend`）からバックエンドへのリクエストは、Vite の開発サーバープロキシを経由する。

- フロントエンドのコードは `/api/*` プレフィックスを付けてリクエストする
- Vite が `/api/*` を `http://localhost:3000/api/*` へ転送する
- バックエンドのルートはすべて `/api/` プレフィックスを持つ

```
フロントエンド (Port 5173)
  → /api/chats
  → [Vite proxy]
  → http://localhost:3000/api/chats (バックエンド)
```

この構成により、フロントエンドはバックエンドのポート番号（3000）を直接指定せずに開発できる。

---

## エンドポイント一覧

| メソッド | パス | 用途 |
|---|---|---|
| GET | /api/chats | 最新 20 件のチャット取得 |
| POST | /api/chats | チャット送信（chat.csv および log.csv に記録） |
| GET | /api/logs | 全チャット履歴取得（log.csv） |

---

## 共通仕様

### レスポンスフォーマット

**成功時**

```json
{
  "data": <レスポンスデータ>
}
```

**エラー時**

```json
{
  "error": {
    "code": "<エラーコード>",
    "message": "<人間可読なメッセージ>"
  }
}
```

### 共通ヘッダー

| ヘッダー | 値 |
|---|---|
| `Content-Type` | `application/json` |

---

## 型定義（zod スキーマ形式）

### ChatEntry

チャット 1 件を表す型。`packages/shared` で定義し、フロントエンド・バックエンドで共有する。

```ts
import { z } from 'zod'

// 名前に割り当て可能な色（30色）
const chatColorSchema = z.enum([
  'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'gray',
  'crimson', 'coral', 'salmon', 'tomato', 'chocolate', 'goldenrod', 'olive',
  'teal', 'cyan', 'turquoise', 'navy', 'indigo', 'violet', 'magenta', 'maroon',
  'lime', 'aqua', 'silver', 'darkgreen', 'darkblue', 'hotpink',
])

const chatEntrySchema = z.object({
  timestamp: z.string().datetime(),   // ISO 8601 形式
  name:      z.string().min(1).max(50),
  color:     chatColorSchema,
  message:   z.string().min(1).max(500),
})

type ChatEntry = z.infer<typeof chatEntrySchema>
```

### LogEntry

ログ 1 件を表す型。`ChatEntry` と同一の構造を持つ。

```ts
// LogEntry は ChatEntry と同一の schema を使う
const logEntrySchema = chatEntrySchema
type LogEntry = ChatEntry
```

### POST /api/chats リクエストボディ schema

```ts
const postChatBodySchema = z.object({
  name:    z.string().min(1).max(50),
  color:   chatColorSchema,
  message: z.string().min(1).max(500),
})
```

`timestamp` はサーバー側で付与するため、リクエストボディには含めない。

---

## エンドポイント詳細

### GET /api/chats

最新 20 件のチャットを取得する。

**リクエスト**

- クエリパラメータ: なし
- リクエストボディ: なし

**レスポンス（成功）**

- ステータスコード: `200 OK`

```json
{
  "data": [
    {
      "timestamp": "2026-05-19T12:34:56.000Z",
      "name": "Alice",
      "color": "blue",
      "message": "こんにちは！"
    }
  ]
}
```

- `data` の配列は `ChatEntry[]` 型
- 件数は最大 20 件（`chat.csv` の内容をそのまま返す）
- 並び順: タイムスタンプ昇順（古い順）

---

### POST /api/chats

チャットを送信する。`chat.csv`（最新 20 件）と `log.csv`（全履歴）の両方に記録する。

**リクエスト**

- `Content-Type: application/json`

```json
{
  "name": "Alice",
  "color": "blue",
  "message": "こんにちは！"
}
```

| フィールド | 型 | 制約 |
|---|---|---|
| `name` | `string` | 1〜50 文字 |
| `color` | `string` | 後述の 30 色いずれか |
| `message` | `string` | 1〜500 文字 |

**レスポンス（成功）**

- ステータスコード: `201 Created`

```json
{
  "data": {
    "timestamp": "2026-05-19T12:34:56.000Z",
    "name": "Alice",
    "color": "blue",
    "message": "こんにちは！"
  }
}
```

- `data` はサーバーが付与した `timestamp` を含む `ChatEntry` 型

**バリデーションエラー（400）**

```json
{
  "error": {
    "code": "validation_error",
    "message": "Request validation failed"
  }
}
```

---

### GET /api/logs

全チャット履歴を取得する（`log.csv` の全件）。

**リクエスト**

- クエリパラメータ: なし
- リクエストボディ: なし

**レスポンス（成功）**

- ステータスコード: `200 OK`

```json
{
  "data": [
    {
      "timestamp": "2026-05-19T10:00:00.000Z",
      "name": "Bob",
      "color": "red",
      "message": "最初の投稿"
    },
    {
      "timestamp": "2026-05-19T12:34:56.000Z",
      "name": "Alice",
      "color": "blue",
      "message": "こんにちは！"
    }
  ]
}
```

- `data` の配列は `LogEntry[]` 型（= `ChatEntry[]`）
- 件数上限なし（`log.csv` の全行）
- 並び順: タイムスタンプ昇順（古い順）

---

## ステータスコード一覧

| ステータスコード | 意味 | 使用するエンドポイント |
|---|---|---|
| `200 OK` | リクエスト成功 | GET /api/chats, GET /api/logs |
| `201 Created` | リソース作成成功 | POST /api/chats |
| `400 Bad Request` | バリデーションエラー | POST /api/chats |
| `405 Method Not Allowed` | 未定義の HTTP メソッド | 全エンドポイント |
| `500 Internal Server Error` | サーバー内部エラー（CSV I/O 失敗等） | 全エンドポイント |

---

## エラーコード一覧

| `code` 値 | 意味 | HTTP ステータス |
|---|---|---|
| `validation_error` | リクエストボディ・パラメータの検証失敗 | 400 |
| `internal_error` | サーバー内部エラー（CSV 読み書き失敗等） | 500 |

エラーレスポンスの `message` フィールドはスタックトレースや内部 ID、PII（個人情報）を含めない。

---

## 名前の色（30色）

チャット投稿時に指定できる色名の一覧。これ以外の値はバリデーションエラーとなる。

```
red, blue, green, yellow, purple, orange, pink, brown, gray,
crimson, coral, salmon, tomato, chocolate, goldenrod, olive,
teal, cyan, turquoise, navy, indigo, violet, magenta, maroon,
lime, aqua, silver, darkgreen, darkblue, hotpink
```

---

## 未解決事項

なし
