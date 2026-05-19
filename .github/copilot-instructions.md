# Copilot 共通指示

このファイルは、GitHub Copilot がリポジトリに対して常に守るべき基本方針を記載する。

詳細な作業手順、チェックリスト、レビュー観点などは以下に分離している。

- 領域別ルール: `.github/instructions/*.instructions.md`
- 特定タスクの詳細ワークフロー: `.github/skills/*/SKILL.md`
- 人間が明示的に呼び出す定型依頼: `.github/prompts/*.prompt.md`
- 専門 SubAgent と Orchestrator: `.github/agents/*.agent.md`

このファイルが肥大化しないよう、追記は「全領域に常時関わる方針」に限定する。

---

## 1. プロジェクト概要

このリポジトリは、エージェント開発サンプルとして作成する「昔ながらのシンプルな WebChat」である。

- フロントエンド・バックエンドともに TypeScript で実装する
- シンプルな WebChat として動作する
- 永続化は CSV ファイルを使用する
- ローカル環境でのみ動作させる（クラウドデプロイなし）

---

## 2. 技術スタックの前提

利用する主要スタックは以下である。

- バックエンド: Node.js + Hono + TypeScript
- フロントエンド: Vue.js + TypeScript
- データ保存: CSV ファイル（ファイルベース）
- パッケージ管理: npm（workspaces）またはプロジェクト単位の package.json
- テスト: Vitest（単体・結合）/ Playwright（E2E）

---

## 3. バックエンド API 仕様

以下の 3 つの API を提供する。

| メソッド | パス | 用途 |
|---|---|---|
| GET | /chats | 最新 20 件のチャット取得 |
| POST | /chats | チャット送信（記録） |
| GET | /logs | 全チャット履歴取得 |

### データ仕様

- `chat.csv`: 最新 20 件のみ保持する
- `log.csv`: 全履歴を保持する（無制限）

---

## 4. フロントエンド画面構成

以下の 3 画面を持つ。

1. **エントランス画面**: 名前入力・色選択・入室ボタン・チャット閲覧・ログ画面リンク
2. **チャット画面**: チャット一覧・コメント入力・送信ボタン（1 分ポーリング）
3. **ログ画面**: 全チャット履歴表示（読み取り専用）

### チャット画面の挙動

- 入力が空の場合は投稿せず、チャット更新のみ行う
- 1 分に 1 回ポーリング + 送信時に即時更新

---

## 5. 実装の基本原則

- **ad-hoc な変更はしない。正しい設計に基づく正しいコードだけを書く**
- シンプルであることを最優先する
- WebSocket を使わない（ポーリングのみ）
- データベースを使わない（CSV ファイルのみ）
- セキュリティを重視し、入力検証と出力エンコードを徹底する
- テストを重視し、重要パスには単体テストを書く

---

## 6. フォルダ構成の大原則

詳細は `.github/instructions/folder-structure.instructions.md` を参照する。

最低限守る原則のみここに残す。

- トップレベルは責務別（`apps/backend`, `apps/frontend`, `data`）
- アプリ内部は機能・ドメイン別
- 技術レイヤー別フォルダ（`handlers/`, `services/`, `repositories/` 等）をアプリ直下のトップレベルには作らない
- `shared` には複数機能から本当に共有されるものだけを置く
- 関連する型・schema・テスト・実装はできるだけ近くに置く

---

## 7. TypeScript strict 前提

- 全パッケージで TypeScript strict を有効にする
- `any` は原則禁止。やむを得ない場合は理由をコードコメントで明示する
- 外部入力（ユーザー入力、API レスポンス、環境変数等）は `unknown` で受けて schema validation で絞り込む
- `enum` よりも文字列リテラル union を優先する
- ESM 前提で import / export を整理する

---

## 8. テスト重視

- テストなしの実装変更は避ける
- 単体テストは Vitest を中心に、機能フォルダ内に近接配置する
- E2E は Playwright で主要導線（入室 → チャット → ログ閲覧）を確認する
- ローカルで検証コマンドが実行できる構成を維持する
- 詳細は `.github/instructions/testing.instructions.md` および `.github/skills/tdd-workflow/SKILL.md` を参照する

---

## 9. セキュリティ重視

- 入力検証、出力エンコードを徹底する
- 秘密情報をリポジトリに含めない
- 詳細は `.github/instructions/security.instructions.md` および `.github/skills/security-review/SKILL.md` を参照する

---

## 10. 新規ライブラリ導入時の判断基準

新しい依存関係を追加する場合は、以下を Pull Request 説明または ADR に明記する。

- 採用理由（解決したい問題は何か）
- 代替案（なぜそれを選ばないのか）
- ライセンス
- メンテナンス状況

これを満たさない一時的な追加は避ける。

---

## 11. SubAgent と Orchestrator の利用方針

- 複雑なタスクは `.github/agents/orchestrator.agent.md` の方針に従い、Orchestrator が作業分解と SubAgent への割り当てに集中する
- 各 SubAgent は自分の専門領域に集中し、不要に広いコンテキストを読まない
- 各 SubAgent は作業範囲、入力、出力、禁止事項を明確にして動く
- Orchestrator は実装を抱え込まず、最終統合と未解決事項の明示に集中する
- 専門 SubAgent の判断を、根拠なく Orchestrator が上書きしない

各 Agent の詳細は `.github/agents/*.agent.md` を参照する。

---

## 12. ドキュメント構造はユーザー定義を優先

- ドキュメントの章立てや配置はユーザー（リポジトリ所有者）の指定を優先する
- ADR、設計書、手順書のテンプレートは `.github/skills/doc-coauthoring/SKILL.md` の指針に従う