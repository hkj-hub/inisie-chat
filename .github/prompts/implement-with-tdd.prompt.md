---
name: implement-with-tdd
description: 失敗するテストから始めて小さく実装するサイクルで機能を追加・修正してもらう
---

# TDD 実装依頼

このプロンプトは、ロジック・API・データ整形などの実装を TDD で進めてもらう
ためのものである。UI / VRT / 外部連携は TDD 対象外として扱う。

利用 Skill:

- `.github/skills/tdd-workflow/SKILL.md`
- `.github/skills/coding-standards/SKILL.md`

利用 SubAgent 候補:

- `.github/agents/tdd-implementer.agent.md`

---

## 依頼内容

以下のテンプレートを埋めてから、エージェントに実装を依頼してください。

```txt
## 実装対象
- 機能 / 関数 / エンドポイント名:
- 期待される振る舞い（1〜2 行）:
- 入力と出力の概形:

## 周辺情報
- 配置先（機能フォルダ）:
- 既存コードとの依存関係:
- 既存テストの有無:

## 完了条件
- ローカルで `pnpm test`, `pnpm typecheck`, `pnpm lint` が通る
- 異常系・境界値が押さえられている
```

## エージェントが守ること

- `.github/skills/tdd-workflow/SKILL.md` の手順に従う
  1. 振る舞いを言語化する
  2. 失敗するテストを書く（Red）
  3. テストを実行して失敗を確認する
  4. 最小実装で通す（Green）
  5. リファクタリングする（Refactor）
  6. 異常系・境界値のテストを追加する
- `.github/instructions/coding.instructions.md` /
  `.github/instructions/typescript.instructions.md` のルールに従う
- 1 関数 1 責務、1 テスト 1 振る舞いを保つ
- 内部状態ではなく外側から見える振る舞いを検証する
- `any` を使わず、`unknown` で受けて `zod` で narrow する
- 不変性パターンを守る（mutation を避ける）
- handler / ユースケース / リポジトリの責務分離を保つ
- 実行したコマンド（`pnpm test ...` など）と結果を最後に記録する

## 出力フォーマット

```txt
## 振る舞いの言語化

## 追加 / 変更したテストファイル

## 実装ファイル

## 実行コマンドと結果
- pnpm test ...
- pnpm typecheck
- pnpm lint

## 残課題 / 質問
```

## 禁止事項

- 失敗テストを書かずにいきなり実装する
- 緑にしたあと無関係なリファクタを混ぜる
- 内部状態 / プライベート関数を直接検証する
- カバレッジを上げるためだけのテストを大量追加する
- 失敗テストをコメントアウトして PR を出す
- TDD 対象外領域（UI / VRT / 外部連携）について TDD を強制する
