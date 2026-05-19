---
applyTo: "**"
---

# セキュリティ指針

このファイルは、リポジトリ全体で常時守るセキュリティ方針を扱う。
レビュー時の詳細チェックは `.github/skills/security-review/SKILL.md` を参照する。

---

## 1. 守るべき検査・ツール

このプロジェクトでは以下を採用する。

- OWASP ZAP: API Gateway + Lambdaを主とするWebAPI の動的検査
- GitHub CodeQL: 静的解析
- Dependabot: 依存関係の脆弱性検知・更新提案
- cdk-nag: CDK 設計のセキュリティ検査
- ESLint / TypeScript strict: コード品質起因の脆弱性予防

## 2. 秘密情報の扱い

- API キー、トークン、AWS 認証情報、`.env*` をコミットしない
- `.gitignore` に `.env*` を含める
- 既にコミット済みの秘密情報を発見した場合
  - 開発者にローテーションを推奨する
  - リポジトリ履歴の書き換えを検討する（`git filter-repo` 等）
  - GitHub Secrets / AWS SSM Parameter Store 等に移す
- 設定例として `.env.example` のみコミットする

## 3. 入力検証

- すべての外部入力（ユーザー入力、API レスポンス、S3 オブジェクト、
  クエリ文字列、ヘッダ、環境変数）は境界で検証する
- スキーマ検証は `zod` を既定にする（詳細は typescript.instructions.md §4）
- ホワイトリスト方式を優先する（許可しないものを列挙するのではなく、許可するものだけ通す）
- ファイルアップロードがある場合はサイズ・MIME・拡張子を全て検証する

## 4. Markdown / MDX のサニタイズ

- 信頼境界が同じでも `dangerouslySetInnerHTML` は避ける
- カスタム MDX コンポーネントは許可リストで制御する
- 外部リンクは `rel="noopener noreferrer"` を付与する
- 自身が書く記事だとしても、習慣として常に同じ扱いにする

## 5. XSS / CSRF / インジェクション

- React の標準エスケープを信頼し、`innerHTML` 系の API を増やさない
- 状態変更を伴う API には CSRF 対策を入れる
- データベースを利用する場合、文字列結合でクエリを組み立てない

## 6. セキュリティヘッダ

CloudFront / API Gateway で以下を設定する。

- `Strict-Transport-Security`（HSTS）: HTTPS 強制
- `Content-Security-Policy`: 実装に合わせて段階導入
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`: 不要なブラウザ機能を無効化

CSP は最初に過剰に厳しくして開発が止まらないよう、段階的に強化してもよい。

## 7. IAM 最小権限

- IAM は CDK で記述し、ワイルドカードを避ける
- Role を機能ごとに分け、共有の「全部入り Role」を作らない
- 詳細は `.github/instructions/aws-cdk.instructions.md` §4

## 8. 認証情報のログ・エラー出力

- ログにトークン・パスワード・PII を出さない
- エラーレスポンスにスタックトレース・SQL・内部 ID を含めない
- 「ユーザー向けメッセージ」と「内部ログ」を分ける

```ts
// 良い例
catch (error: unknown) {
  console.error('Internal error', error)
  return jsonResponse(500, { error: { code: 'internal_error', message: 'An error occurred' } })
}
```

## 9. 依存ライブラリ

- `pnpm-lock.yaml` を必ずコミットする
- Dependabot を有効化し、PR は速やかに確認する
- 新規ライブラリ導入時は `.github/copilot-instructions.md` §10 の判断基準を満たす
- `pnpm audit` で脆弱性をローカルでも確認する

## 10. CI のセキュリティ運用

- ZAP / CodeQL / Dependabot の結果を放置しない
- 既知の False Positive は理由をコメントしたうえで除外する
- セキュリティ系ジョブは `main` への push と PR で必ず動かす
- 機械的に検知された CRITICAL は merge ブロックを基本とする

## 11. やってはいけないこと

- API キー類を「とりあえず動かすため」一時的にコードへ書く
- ZAP / CodeQL の警告を一括で suppress する
- IAM Role を `AdministratorAccess` で作る
- 公開バケットを意図せず作る（CDK で `blockPublicAccess` を必ず確認）
- ログにユーザー入力を生で出して PII を漏らす
