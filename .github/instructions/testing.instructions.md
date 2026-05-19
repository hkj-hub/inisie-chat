---
applyTo: "**/*.{test,spec}.{ts,tsx,js,jsx}"
---

# テスト指針

このファイルは、テストコード全般の常時ルールを扱う。
TDD の進め方は `.github/skills/tdd-workflow/SKILL.md`、
Web アプリ E2E は `.github/skills/webapp-testing/SKILL.md` を参照する。

---

## 1. テストフレームワーク

- 単体・結合: **Vitest**
- E2E / VRT: **Playwright**（`toHaveScreenshot()` でローカル VRT）

## 2. テストの種類と置き場所

| 種類 | フレームワーク | 配置 |
|---|---|---|
| 単体（純粋関数） | Vitest | 機能フォルダ内 `*.test.ts` |
| 結合（handler、IO 含む） | Vitest | 機能フォルダ内 `*.test.ts` |
| E2E（ユーザー操作） | Playwright | `apps/frontend/e2e/` |
| VRT（見た目の差分検出） | Playwright | `apps/frontend/e2e/` |

「実装ファイルの隣にテストを置く」を既定にする。

## 3. AAA パターンと構造化

```ts
test('日付の新しい順でソートされること', () => {
  // Arrange: テスト対象の入力と前提条件
  const input = [
    { name: 'Alice', timestamp: '2024-01-01T00:00:00Z' },
    { name: 'Bob',   timestamp: '2025-01-01T00:00:00Z' }
  ]

  // Act: テスト対象の関数を実行
  const result = sortByTimestampDesc(input)

  // Assert: 期待する結果を検証
  expect(result[0].name).toBe('Bob')
  expect(result[1].name).toBe('Alice')
})
```

### テスト構造のルール

- **1 テスト 1 振る舞い**: テスト名で「何が起きるか」を読めるようにする
- **Arrange-Act-Assert の明確な分離**: 空行でセクションを区切り、コメント付きで意図を示す
- **テスト名は述語形で統一**: 「〜すること」「〜であること」「〜が返却されること」など一貫性を保つ
- **セットアップは関数化**: 複雑な初期化は `beforeEach` や factory 関数で整理する

### describe でテストを整理

```ts
describe('getChats', () => {
  describe('チャットが存在するとき', () => {
    test('最新 20 件が返ること', () => { ... })
  })

  describe('チャットが空のとき', () => {
    test('空配列が返ること', () => { ... })
  })
})
```

## 4. ローカル再現性を最優先

- ランダム値・現在時刻・外部 API 等の外乱を最小化する
  - 必要なら `vi.useFakeTimers()` / 固定 seed を使う
- 環境差で壊れるテストは即修正する。スキップで放置しない

## 5. fixture の利用

- 反復するテストデータは機能フォルダ内 `__fixtures__/` にまとめる
- fixture は最小限・読みやすさ優先で作る

## 6. モックと外部依存

- 外部依存（ファイル I/O、ネットワーク）は handler やリポジトリ層で抽象化し、
  テストでは fake / stub を差し替える
- グローバルな `vi.mock` の濫用を避ける（テストの独立性を損なう）

## 7. VRT は代表画面に限定

- 全画面 VRT は行わない
- 代表画面（エントランス・チャット・ログ）に限定する
- スナップショット差分はレビューで必ず人が確認する（無条件に承認しない）

## 8. ローカルでの実行

```bash
bun run test      # Vitest
bun run e2e       # Playwright E2E + VRT
bun run lint      # ESLint + 型チェック
```

## 9. カバレッジ

- 機械的なしきい値（80% 等）は目安にとどめ、「重要パスがテストされているか」を優先する
- 「テストなし変更を避ける」ことを最優先指針とする

## 10. 反パターン

- 内部状態やプライベート関数を直接検証する
- CSS クラス名で要素を探す E2E（壊れやすいため避ける）
- セットアップ・クリーンアップを暗黙的に共有するテスト
- 「flaky だから retry」で逃げる（原因を特定して直す）
- スキップが残ったまま放置される
- **テスト名が曖昧で何をテストしているか不明**
- **Arrange / Act / Assert の分離なく、読み込むのに時間がかかるテスト**
- **単一の test に複数の振る舞いを詰め込む**

## 11. やってはいけないこと

- テストコードでのみ `any` を多用する（テストでも型は守る）
- 失敗するテストをコメントアウトして Commit する
- VRT のベースライン画像を中身を確認せず一括更新する
