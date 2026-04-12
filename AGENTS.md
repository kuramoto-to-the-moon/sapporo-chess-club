# AGENTS.md

このリポジトリで作業する AI エージェント向けの指針。

## プロジェクト概要

札幌チェスクラブ公式サイト。Astro 6 + Tailwind v4 の静的サイト、GitHub Pages + カスタムドメイン (`sapporochessclub.com`) で公開。日本語/英語の 2 言語対応。フレームワーク JS は一切なし (vanilla `<script>` のみ)。

## アーキテクチャ

- **すべて Astro の静的 HTML + vanilla JS**。Svelte / React 等のフレームワークは使わない
- インタラクションは `<script>` ブロック + `src/lib/*.ts` のヘルパーで実装
- `<dialog>` 要素 (ハンバーガーメニュー)、vanilla listbox (年フィルター) 等のネイティブ API を活用

## i18n

- すべてのユーザー向け文字列は `src/i18n/ja.ts` / `en.ts` に集約
- コンポーネントで `import { t } from "@/i18n"` → `const i = t(locale)` → `{i.foo.bar}`
- `locale === "ja" ? "..." : "..."` のベタ書きは禁止

## 日付の扱い

クラブは札幌 (JST) なので日付文字列はすべて JST のカレンダー日として扱う。

- `src/lib/date.ts` の `parseDate` / `startOfTodayJST` / `getDateParts` を必ず通す
- `new Date("2026-04-15")` を直接使わない (UTC 真夜中扱いで日付がずれる)

## CMS データ

- スキーマ: `src/content.config.ts` (Zod + Content Layer API)
- CMS: Pages CMS (`.pages.yml` で定義)
- コンテンツはすべて `src/content/` 配下の個別 .md / .yaml ファイル (コレクション方式)
- スケジュール取得は `src/lib/schedule-data.ts` のヘルパーを使う

## デザイン / スタイル

- **Tailwind v4**: 設定は CSS 内 (`@theme` / `@custom-variant`)、`tailwind.config.*` は無い
- **カラー**: ブランド青 `#2563eb` / グレー階調 `#171717` `#525252` `#737373` `#d4d4d4` `#e5e5e5` `#f5f5f5` `#fafafa`
- **角丸**: `rounded-md` 統一
- **ホバー**: `[@media(hover:hover)]:hover:` で gate (モバイルのタップ残留を防ぐ)

## セキュリティ

- `BaseLayout.astro` に CSP meta タグあり
- 外部リンクには `target="_blank" rel="noopener noreferrer"`

## コミュニケーション規約

- Issue / PR / 運用ドキュメント → **日本語**
- コミットメッセージ → 英語 (Conventional Commits)
- コード内コメント → 既存ファイルのスタイルに合わせる

## 編集後の確認

```bash
pnpm build   # 必ず通す
```
