---
applyTo: "apps/backend/**"
---

# バックエンド（Node.js + Hono）指針

このファイルは、`apps/backend` 配下の Hono API 実装で常時守るべきルールを扱う。
詳細パターンは `.github/skills/backend-patterns/SKILL.md` を参照する。

---

## 1. Node.js + Hono 前提

- Hono を使って HTTP API サーバーを実装する
- 不要なフレームワーク（Express, NestJS 等）は導入しない
- TypeScript で実装し、strict mode を有効にする

## 2. handler は薄く保つ

handler（ルートハンドラ）は次の責務だけにする。

1. リクエストの受け取り
2. 入力検証（schema バリデーション）
3. ユースケース関数の呼び出し
4. レスポンスの整形

それ以外（CSV アクセス、ビジネスロジック、ログ整形）は機能フォルダ内の
別関数に分離する。

```ts
app.get('/chats', async (c) => {
  const result = await getChats({ repo: csvRepository })
  return c.json({ data: result })
})
```

## 3. 機能別配置

- `apps/backend/src/<feature>/` に機能単位で配置する
- 例: `chats/`
  - `handler.ts`（Hono ルート定義）
  - `getChats.ts`
  - `postChat.ts`
  - `chatsRepository.ts`
  - `chatsSchema.ts`
  - `chatsTypes.ts`
  - `getChats.test.ts`
- 横断的なユーティリティ（HTTP ラッパー、エラー型、CSV クライアント）は
  `apps/backend/src/shared/` に置く

## 4. CSV ファイル操作の隔離

- CSV ファイルへの直接アクセスはリポジトリ層（`chatsRepository.ts` 等）に閉じ込める
- ユースケース関数は CSV の詳細を知らず、自前のドメイン型を扱う
- これによりテストでは fake repository を差し替えやすくする

```ts
interface ChatsRepo {
  readAll(): Promise<ChatEntry[]>
  append(entry: ChatEntry): Promise<void>
  trim(maxCount: number): Promise<void>
}
```

## 5. 入力検証

- すべての外部入力は `zod` などで検証する
- クエリパラメータ、リクエストボディ、ヘッダ
- 検証失敗時は 400 系のステータスコードと、攻撃に有利な情報を含まないメッセージを返す

## 6. エラーレスポンス

統一フォーマットを既定にする。

```json
{
  "error": {
    "code": "validation_error",
    "message": "Request validation failed"
  }
}
```

- ステータスコードは HTTP セマンティクスに従う（200 で全部返さない）
- エラー詳細にスタックトレース・内部 ID・PII を含めない
- `console.error` 等の内部ログは詳細を残してよい

## 7. CORS 設定

- フロントエンド（`apps/frontend`）からのアクセスを許可する CORS 設定を行う
- 開発時は `http://localhost:xxxx` を許可する

## 8. ログ出力

- 機微情報（PII 等）はログに出さない
- `console.log` を本番コードに残さない

## 9. ローカル実行と再現性

- ローカルで `npm run dev` 相当のコマンドが動く構成を維持する
- CSV ファイルのパスは環境変数で設定可能にする

## 10. やってはいけないこと

- handler に CSV アクセス・ビジネスロジック・整形ロジックを詰め込む
- 失敗時に `error.message` をそのままレスポンスに含める
- 不要なミドルウェア・フレームワーク導入で見通しを悪くする

---

## 11. 推奨フォルダ構成（`apps/backend`）

```txt
apps/backend/
├── src/
│   ├── chats/
│   │   ├── handler.ts
│   │   ├── getChats.ts
│   │   ├── postChat.ts
│   │   ├── chatsRepository.ts
│   │   ├── chatsSchema.ts
│   │   ├── chatsTypes.ts
│   │   └── getChats.test.ts
│   │
│   ├── logs/
│   │   ├── handler.ts
│   │   ├── getLogs.ts
│   │   ├── logsRepository.ts
│   │   └── getLogs.test.ts
│   │
│   └── shared/
│       ├── http.ts
│       ├── errors.ts
│       └── csv.ts
│
├── data/
│   ├── chat.csv
│   └── log.csv
│
├── package.json
└── tsconfig.json
```

方針:

- 機能（`chats/`, `logs/`）ごとに handler、ユースケース、リポジトリ、schema、テストを同じフォルダにまとめる
- handler は薄く保ち、ロジックは同フォルダの関数に委譲する
- CSV アクセス依存は `chatsRepository.ts` のような機能内の薄いラッパーに閉じ込める
- 共通の HTTP ラッパー、エラー型、CSV クライアントは `shared/` に置く
- `handlers/` や `services/` などの技術レイヤー別フォルダをトップレベルに作らない
