---
applyTo: "**"
---

# フォルダ構成ルール

このファイルは、リポジトリ全体のフォルダ構成方針を扱う。
アプリ固有の詳細構成は、対応する instructions に記載する。

- `apps/backend/` の詳細構成: `.github/instructions/backend.instructions.md`
- `apps/frontend/` の詳細構成: `.github/instructions/frontend.instructions.md`

---

## 1. トップレベルは責務別

トップレベルでは技術レイヤー名ではなく、責務でディレクトリを切る。

- `apps/`: 実行されるアプリケーション（`backend`, `frontend`）
- `packages/`: フロント・バック両方から共有される型・schema・ユーティリティ（`shared` 等）
- `data/`: CSV ファイルなどのデータファイル（開発サンプル）
- `docs/`: 開発ドキュメント（開発者および AI が参照する）
- `.github/`: Copilot 設定、Skill / Prompt / Agent

ルート直下に `src/` や `lib/` を作らない。

## 2. アプリ内部は機能・ドメイン別

`apps/*/src/` の内側では、機能・ドメイン単位で分割する。

良い例（`apps/backend/src/`）:

```txt
apps/backend/src/
├── chats/
│   ├── handler.ts
│   ├── getChats.ts
│   ├── chatsRepository.ts
│   ├── chatsSchema.ts
│   └── getChats.test.ts
└── shared/
    ├── http.ts
    └── csv.ts
```

避ける例:

```txt
apps/backend/src/
├── handlers/
├── services/
├── repositories/
└── schemas/
```

技術レイヤー名（`handler`, `service`, `repository`, `schema`）は、
機能フォルダの **内側** でだけ使う。

## 3. `packages/shared` の活用

フロントエンドとバックエンドが共通で使う型・schema・ユーティリティは
`packages/shared/src/` に置く。

`packages/shared` に **置いてよい** もの:

- API レスポンスの共通型（`ChatEntry`, `LogEntry` 等）
- フロント・バック双方が参照する共通 schema（zod）
- 日付・文字列に関する純粋関数（`formatDate` 等）

`packages/shared` に **置かない** もの:

- Vue コンポーネント
- Hono / Node.js に依存するコード（ファイル I/O 等）
- 1 つのアプリでしか使わないコード

`shared` は便利な置き場ではなく、明確に共有されるものだけを置く。

## 4. アプリ内の `shared/` を肥大化させない

各アプリ（`apps/backend/src/shared/`, `apps/frontend/src/shared/`）内部の
`shared` も同様の原則で管理する。

- 複数の機能フォルダから自然に使われるものだけ置く
- 1 機能のためのコードは機能フォルダに置く

## 5. 関連ファイルは近接配置する

- 実装、テスト、型、schema は同じ機能フォルダに置く
- 1 機能のテストを別ツリーに分散させない

## 6. ドキュメント構造はユーザー定義を優先

- `docs/` 配下の章立てや配置はユーザーが定める
- エージェントが勝手に詳細構造を固定しないが、必要に応じて提案はする

## 7. 既存の採用しない構成

- 技術別トップレベル（`components/`, `hooks/`, `services/` をルート直下）
- すべてを `shared` に詰め込む構成
- 個人プロジェクト規模に対する過剰な Clean Architecture / DDD 構成

これらを新たに導入する場合は ADR で背景・代替案・採用しない条件を明示する。

---

## 8. プロジェクト全体のトップレベル構成

```txt
inisie-chat/
├── apps/
│   ├── backend/        # Node.js + Hono API
│   └── frontend/       # Vue.js SPA
│
├── packages/
│   └── shared/         # フロント・バック共通の型・schema・純粋関数
│       ├── src/
│       │   ├── types/
│       │   ├── schemas/
│       │   └── utils/
│       └── package.json
│
├── data/               # CSV サンプルデータ（開発用）
│   ├── chat.csv
│   └── log.csv
│
├── docs/               # 設計書・ADR
│
└── .github/            # Copilot 設定、Agent、Skill、Prompt
```

---

## 9. 配置判断ルール

### 機能フォルダに置くべきもの

次の質問に「はい」と答えられるものは機能フォルダに置く。

> そのファイルは特定の機能の言葉で説明できるか？

例:

- `chats/chatsSchema.ts`
- `chats/getChats.ts`
- `chats/chatsRepository.ts`
- `chat/ChatMessage.vue`

### `packages/shared` に置くべきもの

次の条件を **すべて** 満たすものだけを `packages/shared` に置く。

- フロントエンドとバックエンドの両方から使われる
- 特定のアプリや画面に依存しない
- 純粋関数、型、schema として説明できる

例:

- `packages/shared/src/types/chatEntry.ts`
- `packages/shared/src/schemas/chatSchema.ts`
- `packages/shared/src/utils/formatDate.ts`

### 技術レイヤー名を使ってよい場所

`handler`, `service`, `repository`, `schema` などの技術レイヤー名は、
**機能フォルダの内側でのみ** 使う。

---

## 10. 新規ファイル作成時の手順

エージェントは新しいファイルを作るとき、以下を守る。

1. 機能・ドメイン単位の配置先をまず検討する
2. 技術レイヤー別フォルダをトップレベルに新設しない
3. 関連するテスト、型、schema を実装ファイルの近くに置く
4. `packages/shared` に置く前に、本当にフロント・バック双方から使われるか確認する
5. 既存構成に従い、独自判断で新しい構成パターンを増やさない
