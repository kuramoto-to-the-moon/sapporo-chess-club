# AGENTS.md

このリポジトリで作業する AI エージェント向けの指針。

## プロジェクト概要

札幌チェスクラブ公式サイト。Astro 6 + Svelte 5 + Tailwind v4 の静的サイト、GitHub Pages で `/sapporo-chess-club/` 配下に公開。日本語/英語の 2 言語対応。

## アーキテクチャの基本方針

- **デフォルトは Astro の静的 HTML**。インタラクティブにする必要があるところだけ Svelte 島にする
- **`*.astro` を最優先**、`*.svelte` は state やイベントが必須な場合のみ
- 既存の Svelte 島でも、interactivity が無くなったら Astro に降格する

## ハイドレーション戦略

`client:` ディレクティブの選び方:

- **`client:idle`**: ファーストビュー外、または初回ペイントを優先したい部品 (例: 年フィルター、ScrollTop)
- **`client:visible`**: 大きいフォーム等、見えるまで読み込まなくていいもの (例: ApplicationForm)
- **`client:only`**: SSR できない事情がある場合のみ。原則使わない
- **`client:load`**: 使わない (上記で代替)

HamburgerMenu のように **重い島** は、トリガーだけ静的 HTML + 動的 `import()` でメイン部分を遅延ロードする (`HamburgerMenu.astro` + `HamburgerMenuSheet.svelte` のパターン参照)。

## i18n

- **すべてのユーザー向け文字列は `src/i18n/ja.ts` / `en.ts` に集約**
- コンポーネントで `import { t } from "@/i18n"` → `const i = t(locale)` → `{i.foo.bar}`
- `locale === "ja" ? "..." : "..."` のベタ書きは原則禁止
- 例外: `Intl.DateTimeFormat` の locale 引数や `og:locale` のようなロケール識別子そのもの

## 日付の扱い

クラブは札幌 (JST) なので、CMS の date 文字列はすべて **JST のカレンダー日** として扱う。

- `src/lib/date.ts` の `parseDate` / `startOfTodayJST` / `getDateParts` を必ず通す
- `new Date("2026-04-15")` を直接使うと UTC 真夜中扱いになり、海外ユーザーで日付がずれる
- 既存ヘルパーで足りない処理が出たら、まず `src/lib/date.ts` を拡張する

## CMS データの読み込み

- スキーマは `src/content.config.ts` (Zod 4 + Content Layer API)
- データ取得は `src/lib/schedule-data.ts` の `getSortedScheduleDates()` / `getUpcomingScheduleDates(limit?)` を使う (`getCollection` を直接呼ばない)
- **島に渡す props は最小限に**。`<astro-island>` の props は HTML に JSON 直列化されるので、全件渡すと TBT が増える。必ず `getUpcomingScheduleDates(5)` のように絞ってから渡す

## デザイン / スタイル

- **Tailwind v4**。設定は CSS 内 (`@theme` / `@custom-variant`)、`tailwind.config.*` は無い
- **Important 修飾子**: v4 から **suffix `class!`** (v3 の prefix `!class` は非対応)
- **角丸**: サイト全体で `rounded-md` 統一。新しい primitive を追加する時は揃える
- **shadcn-svelte primitives**: `src/components/ui/` 配下に直接コピーされた所有コード。bug fix やデザイン調整は直接ファイルを編集してよい
- **カラー**: ブランド青 `#2563eb` / グレー階調 `#171717` `#525252` `#737373` `#d4d4d4` `#e5e5e5` `#f5f5f5` `#fafafa`
- カーソル: Tailwind v4 はデフォルトで `<button>` が `cursor: default`。`globals.css` の base layer で `cursor: pointer` を復元済 → 手動指定不要

## アクセシビリティ

- フォーカスリング、`aria-*`、`role` 属性は維持する。Bits UI primitives が大半を自動で付ける
- ホバーエフェクトは **`[@media(hover:hover)]:hover:`** で gate して、モバイルでタップ時に出ないようにする
- スクリーンリーダー対応: 成功通知は `role="status"` + `aria-live="polite"`、エラーは `role="alert"`

## パフォーマンスの守るべき線

- **Home ページの初期 JS = ハンバーガートリガー + Header script のみ** (~1.5KB gz)。これを増やさない
- 新しい島を追加する時は `client:idle` / `client:visible` のいずれかにする
- `astro:assets` の `<Image>` で画像最適化する (`src/assets/` に置く)。`public/images/` は OG 等そのまま配信したい物だけ
- CSS は `inlineStylesheets: 'always'` でインライン化済。新しい巨大な独自 CSS を `globals.css` に追加する前に再考する

## セキュリティ

- `BaseLayout.astro` に CSP meta タグあり。`unsafe-inline` / `unsafe-eval` は Svelte/Astro hydration の都合で必要 (撤去不可)
- フォームには Honeypot (`_gotcha`) と double-submit lock を入れる
- 外部リンクには必ず `target="_blank" rel="noopener noreferrer"`
- `aria-label` は visible テキストを **含む** 形にする (WCAG 2.5.3)

## コミュニケーション規約

このリポジトリのオーナーは日本語で運用しています。AI エージェントが作成・更新する以下のテキストはすべて **日本語で書く**:

- GitHub Issue (タイトル / 本文 / コメント)
- Pull Request (タイトル / 本文 / レビューコメント)
- `docs/` 配下の運用向けドキュメント

**例外** (英語のままで良いもの):
- コミットメッセージ (`feat(scope): ...` の Conventional Commits 形式)
- コード内のコメント / docstring (任意。既存ファイルのスタイルに合わせる)
- spec / plan の内部用ドキュメント (`docs/superpowers/` 配下)
- ライブラリの API 名や型注釈

issue / PR の本文中にコード例や英語テクニカル用語が混ざるのは構わないが、**説明文の地の文は日本語**。

## 編集後の確認

```bash
pnpm build      # 必ず通す
pnpm audit      # 依存の脆弱性チェック
```

ビルドが通ったら、可能なら `pnpm dev` で実機確認 (とくにハンバーガー、申込フォーム、年フィルター)。

## やらないこと

- React や別フレームワークの再導入
- `@astrojs/tailwind` (v3 統合) への retro
- フレームワーク機能で済むのに独自実装を作る (`<script>` ブロックを書く前にまず `client:` ディレクティブと Astro 機能を検討)
- ベタ書き翻訳文字列の追加
- `client:only` で SSR 可能なコンポーネントを描画する
