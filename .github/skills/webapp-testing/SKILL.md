---
name: webapp-testing
description: Vitest / Playwright を、このプロジェクトのスコープで運用するための手順
---

# Web アプリテスト Skill

このプロジェクトのテスト方針は `.github/instructions/testing.instructions.md` に
集約している。本 Skill は、そこから先の「具体的なツール運用」を扱う。

---

## 目的

- 単体・E2E をローカルで同じ手順で動かす
- フィードバックループを短く保つ（壊れにくく速いテスト）

## 使用するタイミング

- 新しい機能のテストを書くとき
- E2E の対象を見直すとき
- ローカルの挙動差を埋めるとき

## 手順

### 1. テストツールの役割を分ける

| ツール | 役割 |
|---|---|
| Vitest | 単体・結合テスト |
| Playwright | E2E、ブラウザ操作の検証 |

### 2. ローカルで同じコマンドを走らせる

```bash
bun run test       # Vitest
bun run e2e        # Playwright
bun run lint       # ESLint + 型チェック
```

### 3. Playwright（E2E）

- 主要導線（エントランス → チャット → ログ）を中心にする
- セレクタは `data-testid` または role / accessible name を優先する
- 待機は `waitForSelector` / `waitForURL` を使い、`waitForTimeout` を多用しない

```ts
import { test, expect } from '@playwright/test'

test('エントランス画面で名前を入力して入室できること', async ({ page }) => {
  await page.goto('http://localhost:5173')
  await page.getByLabel('名前').fill('Alice')
  await page.getByRole('button', { name: '入室' }).click()
  await expect(page).toHaveURL('/chat')
})
```

### 4. Playwright VRT（ローカルスクリーンショット比較）

- 代表画面（エントランス・チャット・ログ）に限定する
- `toHaveScreenshot()` でローカルに保存したベースラインと比較する
- 差分が出たら必ず人がスクリーンショットを比較してから承認する
- 一括ベースライン更新は禁止（差分の意味を必ず確認する）

```ts
test('エントランス画面のスクリーンショット', async ({ page }) => {
  await page.goto('http://localhost:5173')
  await expect(page).toHaveScreenshot('entrance.png')
})
```

### 6. fixture とローカル API

- バックエンドはローカルで起動し、E2E はそれに対して実行する
- テスト用の CSV データは `data/` 配下にサンプルを用意する
- フロントエンドからの fetch 先は環境変数で切り替える

### 7. flaky 対策

- 待機を「明示的な条件待ち」にする
- 時刻・乱数・並行 IO を fake / fixture に置き換える
- どうしても再現困難な flaky は Issue 化する（retry で逃げない）

### 8. レポートの読み方

- Vitest: `bun run test --reporter=verbose` で詳細
- Playwright: `--reporter=list,html` で HTML レポート

## チェックリスト

テスト関連 PR で確認する。

- [ ] テストの種類（単体 / 結合 / E2E）が適切に選ばれているか
- [ ] ローカルで同じコマンドが通るか
- [ ] flaky 対策（待機・乱数・並行 IO）が入っているか
- [ ] 失敗時のスクリーンショット・ログが取れる構成か
- [ ] 環境差を fixture で吸収できているか

## 禁止事項

- `waitForTimeout(5000)` で誤魔化す
- スキップ・retry に依存して flaky を見送る
