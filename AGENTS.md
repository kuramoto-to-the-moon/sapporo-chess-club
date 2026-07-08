# AGENTS.md

このリポジトリで作業する AI エージェント向けの指針。

## プロジェクト概要

札幌チェスクラブ公式サイト。Astro 6 + Tailwind v4 の静的サイト、GitHub Pages + カスタムドメイン (`sapporochessclub.com`) で公開。日本語/英語の 2 言語対応。フレームワーク JS は一切なし (vanilla `<script>` のみ)。

## アーキテクチャ

- **すべて Astro の静的 HTML + vanilla JS**。Svelte / React 等のフレームワークは使わない
- インタラクションは `<script>` ブロック + `src/lib/*.ts` のヘルパーで実装
- `<dialog>` 要素 (ハンバーガーメニュー)、vanilla listbox (年フィルター) 等のネイティブ API を活用
- hide-on-scroll ヘッダー (headroom) は意図的に複雑。**触る前に `docs/headroom-design.md` を読む**（部分簡素化禁止、二択の設計判断を記載済み）
- ページは薄いロケールラッパー: `src/pages/**` (ja) と `src/pages/en/**` は locale prop を渡すだけで、実体はすべて `src/components/*Page.astro`。**ja/en のページを片方だけ変更しない**
- CSS は全ページ `<style>` インライン化される (Astro の inlineStylesheets)。CSS の 1 変更が全 81 ページに波及する

## 共有部品（新規マークアップを書く前にここを見る）

| 部品 | 用途 |
|---|---|
| `SectionHeader.astro` | セクション h2 + 青ティック。見出しを直書きしない |
| `AnnouncementRow.astro` | お知らせ行。`fullDate` prop で TOP/一覧を切替 |
| `ScheduleEventBody.astro` | イベント行本体（バッジ・リンク・時刻・注記） |
| `ExternalLinkIcon` / `RssIcon` / `GlobeIcon` | 共通 SVG アイコン |
| `lib/jsonld.ts` | JSON-LD ビルダー（WebSite / SportsClub / Event / NewsArticle）。構造化データはコンポーネント内に書かない |
| `lib/breadcrumb.ts` | パンくず JSON-LD。先頭項目は `homeCrumb()` |
| `lib/schedule-data.ts` | スケジュール取得（JST フィルタ・お知らせ slug 解決込み） |
| `lib/announcement.ts` | お知らせ取得・整形・getStaticPaths 共有実装 |

## i18n

- すべてのユーザー向け文字列は `src/i18n/ja.ts` / `en.ts` に集約
- コンポーネントで `import { t } from "@/i18n"` → `const i = t(locale)` → `{i.foo.bar}`
- `locale === "ja" ? "..." : "..."` のベタ書きは禁止
- `en.ts` は `satisfies Shape<typeof ja>` で ja と構造一致をコンパイル時強制。キーは必ず両ファイル同時に追加/削除する

## 日付の扱い

クラブは札幌 (JST) なので日付文字列はすべて JST のカレンダー日として扱う。

- `src/lib/date.ts` の `parseDate` / `startOfTodayJST` / `getDateParts` を必ず通す
- `new Date("2026-04-15")` を直接使わない (UTC 真夜中扱いで日付がずれる)

## CMS データ

- スキーマ: `src/content.config.ts` (Zod + Content Layer API)
- CMS: Pages CMS (`.pages.yml` で定義)。**スキーマ変更時は content.config.ts / .pages.yml / 既存コンテンツの 3 点で破綻がないか必ず確認**
- コンテンツはすべて `src/content/` 配下の個別 .md / .yaml ファイル (コレクション方式)
- スケジュール取得は `src/lib/schedule-data.ts` のヘルパーを使う

## デザイン / スタイル

- **Tailwind v4**: 設定は CSS 内 (`@theme` / `@custom-variant`)、`tailwind.config.*` は無い
- **カラー**: `globals.css` の `@theme` で定義したセマンティックトークンを使う — `primary`(青) `primary-hover` `ink`(見出し) `sub`(本文) `muted`(弱) `hairline`(区切り) `edge`(枠線) `surface`(hover背景) `faint` `dim` `menu-line`。生 hex の arbitrary 値 (`text-[#...]`) は使わない
  - 例外: 外部サービスリンクの hover はブランドカラー可 — X → 黒、日本チェス連盟 → 赤 `#c8102e`、RSS → 橙 `#f26522`
- **リンクのトンマナ**:
  - 前進アクション「〜を見る →」: `text-sm text-primary hover:text-primary-hover transition-colors duration-150 font-medium`、セクションのリスト下に配置。ラベルは行き先名（「すべて見る」等の無情報アンカー禁止）
  - 戻りナビ「← 〜」: `text-muted hover:text-primary`。ラベルは行き先名（「〜に戻る」は直接着地ユーザーに不成立なので禁止）
  - hover は色変化のみ。`hover:underline` は使わない
- **角丸**: `rounded-md` 統一
- **ホバー gate** `[@media(hover:hover)]:hover:` はメニュー等の大きい hover 面のみ適用済み。テキストリンクは素の `hover:` が現状（全面適用は差分過大のため保留中）。**新規コードではどちらでも可、周囲に合わせる**
- **タップ領域**: アイコンボタンは 44px 確保（`before:absolute before:-inset-2` パターン）
- **focus**: グローバル `:focus-visible`（青 outline）に任せる。`focus-visible:outline-none` で消さない

## セキュリティ

- `BaseLayout.astro` に CSP meta タグあり
- 外部リンクには `target="_blank" rel="noopener noreferrer"`

## コミュニケーション規約

- Issue / PR / 運用ドキュメント → **日本語**
- コミットメッセージ → 英語 (Conventional Commits)
- コード内コメント → 既存ファイルのスタイルに合わせる

## 編集後の確認

```bash
pnpm build   # 必ず通す (81 ページ)
pnpm check   # astro check (型チェック)。エラー 0 を維持する
```

- リファクタ時は build 前後の `dist/` を diff して意図しない出力差分がないか確認する
- CI は push 時 + 毎日 15:00 UTC に再ビルド（「今日以降」フィルタをビルド時に評価しているため夜間再ビルドが必須）
