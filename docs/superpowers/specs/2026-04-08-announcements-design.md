# お知らせ機能 (Announcements) 設計

## Context

旧 BBS (`http://www4.rocketbbs.com/645/chess.html`) は運営から「今後も使う」と表明されており、リンクとして残してある。一方で BBS には以下の弱点がある:

- Google で検索できない (BBS の最大の弱点)
- スマホ対応が古い
- 過去ログが消える可能性
- ブランディングが BBS サービス側に依存

これらを補完するために、新サイト内に **「お知らせ」セクション** を追加する。BBS は当面残し、新規告知は新サイトのお知らせに書き、X (@SapporoChess) で URL を貼って拡散する流れに移行していく。最終的には BBS 利用者の自然減を待って撤退できる状態を目指す。

**重要前提**: この機能は確定ではないため、`feature/announcements` ブランチで隔離開発し、main にはマージしない。レビューを経て採用判断する。

## Goals

- 運営 (非エンジニア) が Pages CMS から日本語だけで投稿できる
- 投稿が Google 検索でヒットする (SEO 解消)
- 過去ログが git に永続化される
- EN 版サイト訪問者にも英語で内容が届く (自動翻訳)
- 既存のサイトデザイン言語 (静かなトーン、青 + グレー、コンパクト) と一貫
- RSS フィード対応で X / 他媒体への波及を可能にする

## Non-goals

- 双方向のコメント機能 (BBS の役割なので二重化しない)
- メンバー限定エリア / 認証 (静的サイトの範疇外)
- ピン留め / 重要マーク (将来必要になったら schema 1 行で追加可能)
- Hero 画像 (将来必要になったら schema + Image 対応で追加可能)
- イベント RSVP / 参加申込 (大会の ApplicationForm が既に存在)

## ユーザーフロー

### 編集者 (運営)
1. Pages CMS で「お知らせ」コレクションを開く
2. 「新規」ボタンで新エントリ作成
3. 日付・タイトル (ja)・抜粋 (ja)・本文 markdown (ja) を入力 → 保存
4. 自動コミット → GitHub Action で翻訳 → デプロイ
5. 必要なら X で `https://.../announcements/[slug]` を投稿して拡散

### 訪問者 (Home)
1. Home トップ → NextEvent の直後に「お知らせ」セクション (最新 5 件)
2. 各行: 日付 + タイトル + 1 行抜粋
3. クリックで詳細ページへ遷移
4. 「すべて見る →」リンクで一覧ページへ

### 訪問者 (一覧 `/announcements`)
1. ページタイトル「お知らせ」 + サブタイトル
2. 年でグルーピングされた一覧 (TournamentList 同様の年降順)
3. 各行: 日付 + タイトル + 1 行抜粋
4. クリックで詳細へ

### 訪問者 (詳細 `/announcements/[slug]`)
1. 「← お知らせ一覧」リンク
2. 日付 (小)
3. タイトル (大、`text-4xl md:text-5xl`)
4. 本文 markdown を Tailwind Typography (`prose-sm prose-neutral`) で表示
5. 末尾に prev / next のお知らせへのナビゲーション

## アーキテクチャ

```
src/content/announcements/          ← markdown ファイル群 (Pages CMS で編集)
  └─ 2026-04-12-summer-tournament.md

src/components/
  ├─ Announcements.astro            ← Home 用最新 5 件セクション
  ├─ AnnouncementsListPage.astro    ← 一覧ページ本体 (年グルーピング)
  └─ AnnouncementDetailPage.astro   ← 詳細ページ本体

src/pages/
  ├─ announcements/index.astro      ← <AnnouncementsListPage locale="ja" />
  ├─ announcements/[slug].astro     ← <AnnouncementDetailPage ... />
  ├─ en/announcements/index.astro
  ├─ en/announcements/[slug].astro
  └─ rss.xml.ts                     ← @astrojs/rss でフィード生成

.github/workflows/translate-announcements.yml  ← 翻訳 Action
scripts/translate-announcements.ts              ← Action から呼ぶスクリプト
```

### Content Collection スキーマ

`src/content.config.ts` に追加:

```ts
const announcements = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/announcements" }),
  schema: z.object({
    title: z.object({ ja: z.string(), en: z.string().optional() }),
    description: z.object({ ja: z.string(), en: z.string().optional() }),
    date: z.string(),  // YYYY-MM-DD
    bodyEn: z.string().optional(),  // 翻訳された本文 (Action が書き戻す)
  }),
});
```

ja の `title` / `description` / 本文 (markdown body) は必須。`en` 系は optional で、初回投稿時は空。GitHub Action が後から埋める。

### Markdown ファイル例

```md
---
title:
  ja: "夏の大会の申込を開始しました"
description:
  ja: "7月19-20日開催の札幌サマーチェス大会の参加申込を受付中です。"
date: "2026-04-12"
---

7月19日(日)〜20日(月・祝)に「札幌サマーチェス大会 2026」を開催します。

## 開催概要
- 日時: 2026年7月19日(日)〜20日(月・祝)
- 会場: かでる2.7 1010
- 参加費: 一般 ¥3,000 / 学生 ¥1,500

詳細とお申し込みは [スケジュールページ](/sapporo-chess-club/schedule) から。
```

GitHub Action 実行後:

```md
---
title:
  ja: "夏の大会の申込を開始しました"
  en: "Summer Tournament Registration Now Open"
description:
  ja: "7月19-20日開催の札幌サマーチェス大会の参加申込を受付中です。"
  en: "Registration is now open for Sapporo Summer Chess 2026 (July 19-20)."
date: "2026-04-12"
bodyEn: |
  We are holding "Sapporo Summer Chess 2026" on Sunday, July 19 ...
---

(日本語本文はそのまま残る)
```

EN 版ページでは `bodyEn` がレンダリングされる。本文の二重保持になるが、git diff で翻訳結果が見え、レビュー / 修正が容易になるメリットがある。

### 翻訳 GitHub Action

`.github/workflows/translate-announcements.yml`:

- トリガー: `push` to `feature/announcements` ブランチ (将来 main マージ後は main にも)
- 条件: `src/content/announcements/**.md` が変更された時のみ
- ステップ:
  1. `feature/announcements` を checkout
  2. `pnpm install`
  3. `pnpm tsx scripts/translate-announcements.ts` を実行
  4. 変更があれば `[skip ci]` 付きで自動コミット & push

`scripts/translate-announcements.ts`:

- `src/content/announcements/*.md` を全部読む
- 各エントリで `title.en` / `description.en` / `bodyEn` のいずれかが欠けているものを抽出
- Claude API を呼んで翻訳
  - `ANTHROPIC_API_KEY` が無い / 失敗時は DeepL API にフォールバック (`DEEPL_API_KEY`)
  - 両方失敗したらエラーログを出して終了 (Action は fail させない、人間が次回追加分で再試行)
- gray-matter で frontmatter を再ビルドして同じファイルに書き戻し
- markdown 本文は frontmatter とは別 (本文は ja のまま、翻訳は `bodyEn` に格納)

### コンポーネント

#### `Announcements.astro` (Home 用)

ChessLessons / Resources と同じ section パターン:
- `<section class="px-5 py-6 border-t border-[#f5f5f5]">`
- 青いタグ + uppercase 「お知らせ」見出し
- 日付 (text-xs tabular-nums grey) + タイトル (text-sm font-medium) + 1 行抜粋 (text-xs grey)
- 各行 `py-3` でタップ領域確保
- 5 件まで、「すべて見る →」リンク

#### `AnnouncementsListPage.astro` (一覧ページ本体)

`SchedulePage` / `TournamentsPage` と同じ「ページ見出し + サブタイトル + コンテンツ」レイアウト:
- ヘッダー: `text-4xl md:text-5xl font-extrabold` でページタイトル
- 年でグルーピング、各年見出しは `text-sm uppercase tracking-wider text-[#737373]`
- 各エントリ行は Home の Announcements と同じスタイル (DRY)
- ScheduleTimeline.astro の月グルーピングロジックを年用に流用 (`Map<year, entries[]>`)

#### `AnnouncementDetailPage.astro` (詳細ページ本体)

- 「← お知らせ一覧」 (text-sm text-[#737373])
- 日付 (text-sm text-[#737373])
- タイトル (`text-4xl md:text-5xl font-extrabold`)
- 区切り
- 本文: `<div class="prose prose-sm prose-neutral max-w-none">` で markdown body をレンダリング (Astro の `<Content />` または en は `marked` で処理)
- 末尾に prev / next の Announcement へのリンク (TournamentList の年フィルタと同じ data-driven パターン)

#### Header / HamburgerMenu の更新

- Header.astro のデスクトップ nav: 「スケジュール」と「大会記録」の間に「お知らせ」追加
- HamburgerMenu.svelte の `pages` 配列に `お知らせ` を追加 (3 → 4 件)

### i18n

`src/i18n/{ja,en}.ts` に追加:

```ts
announcements: {
  label: "お知らせ" / "News",
  pageTitle: "お知らせ" / "News",
  pageSubtitle: "新着情報・お知らせ一覧" / "Latest updates from the club",
  viewAll: "すべて見る →" / "View all →",
  back: "お知らせ一覧" / "All news",
  prev: "前のお知らせ" / "Previous",
  next: "次のお知らせ" / "Next",
  empty: "まだお知らせはありません。" / "No news yet.",
}
```

`menu.announcements`, `sections.announcements: "NEWS"` も同様に追加。

### Pages CMS 設定

`.pages.yml` に追加:

```yaml
- name: announcements
  label: お知らせ
  description: "新着情報・お知らせ。日本語で書けば英語は GitHub Action が自動翻訳します。"
  type: collection
  path: src/content/announcements
  format: yaml-frontmatter
  view:
    fields: [date, title.ja]
    primary: title.ja
    sort: [date]
    default: { sort: date, order: desc }
  fields:
    - name: date
      label: 公開日
      type: date
      required: true
    - name: title
      label: タイトル
      type: object
      fields:
        - { name: ja, label: 日本語, type: string, required: true }
        - { name: en, label: English (自動翻訳), type: string }
    - name: description
      label: 概要 (一覧の 1 行抜粋)
      type: object
      fields:
        - { name: ja, label: 日本語, type: text, required: true }
        - { name: en, label: English (自動翻訳), type: text }
    - name: bodyEn
      label: 本文 English (自動翻訳・編集可)
      type: text
      description: "GitHub Action が自動生成。修正したい場合のみ手動で書き換え。"
```

`en` / `bodyEn` フィールドは編集可だが「自動翻訳」とラベルに明記し、手動修正が override であることを示す。

### 追加依存パッケージ

```
pnpm add @astrojs/rss              # RSS フィード生成
pnpm add @tailwindcss/typography   # prose クラス (詳細ページ本文の markdown スタイル)
pnpm add -D marked                 # bodyEn 文字列を HTML に変換 (Astro の <Content /> は ja 本文のみ対応)
pnpm add -D @anthropic-ai/sdk      # 翻訳 Action 用 (devDep、CI でのみ使用)
```

### 本文レンダリングの実装ノート

- **ja**: `getEntry("announcements", slug)` から取れる `<Content />` (Astro 標準の markdown レンダラ) を使用 → 自然な markdown サポート
- **en**: 本文は frontmatter の `bodyEn` 文字列に格納されるため、`marked` で HTML 化して `<Fragment set:html={...} />` で挿入
- 両方とも `<div class="prose prose-sm prose-neutral max-w-none">` でラップして同じスタイル
- editor が CMS で見るのは「本文 (markdown body)」フィールド 1 つだけ。`bodyEn` は「自動翻訳・編集可」ラベル付きの別フィールドとして表示

### RSS

`src/pages/rss.xml.ts`:

```ts
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const items = (await getCollection("announcements"))
    .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
  return rss({
    title: "札幌チェスクラブ お知らせ",
    description: "札幌チェスクラブの新着情報",
    site: context.site,
    items: items.map((item) => ({
      title: item.data.title.ja,
      description: item.data.description.ja,
      pubDate: new Date(item.data.date),
      link: `/announcements/${item.id}`,
    })),
  });
}
```

依存追加: `pnpm add @astrojs/rss`

### `.gitignore`

`.superpowers/` を追加 (本 brainstorm の副産物)

## 既存パターンの再利用

| 既存 | 流用先 |
|---|---|
| `Resources.astro` のセクション + ループ | `Announcements.astro` |
| `SchedulePage.astro` / `TournamentsPage.astro` の構造 | `AnnouncementsListPage.astro` |
| `ScheduleTimeline.astro` の月グルーピング Map | `AnnouncementsListPage.astro` の年グルーピング |
| `TournamentsPage.astro` の薄いラッパーパターン | `pages/announcements/index.astro` |
| `withBase` / `getLocalePath` (lib/utils.ts) | URL 構築 |
| Footer.astro の外部リンクパターン | n/a (内部リンクなので不要) |
| `Header.astro` / `HamburgerMenu.svelte` のナビ追加 | お知らせの追加箇所 |

## ブランチ戦略

- 新規ブランチ `feature/announcements` を `main` から切る
- 全変更をこのブランチでコミット
- main にはマージせず、push のみ
- レビュー後に main へマージするかを別途決定
- GitHub Action は当面 `feature/announcements` でも動くようトリガー条件を `branches: [feature/announcements]` にする (確定後 main に変更)

## 検証

1. `pnpm build` クリーン
2. `pnpm preview`:
   - Home に「お知らせ」セクションが NextEvent の直後に表示
   - 最新 5 件、各行に日付 + タイトル + 1 行抜粋
   - クリックで `/announcements/[slug]` の詳細ページへ
   - 一覧ページが年グルーピング表示
   - Header / Hamburger に「お知らせ」リンク
3. ja サンプル 1 件を `src/content/announcements/` に置いて、Astro が collection を読めることを確認
4. RSS: `/rss.xml` が valid な XML を返す
5. GitHub Action のローカル dry-run:
   - `ANTHROPIC_API_KEY` をローカル env に設定
   - `pnpm tsx scripts/translate-announcements.ts` 実行
   - サンプル md の `title.en` / `description.en` / `bodyEn` が埋まる
   - 再実行しても上書きされない (idempotent)
6. EN 版 `/en/announcements/` にも同じエントリが英訳付きで表示
7. ブランチが `feature/announcements` であり main は変更されていないことを `git log main..feature/announcements` で確認

## 想定リスクと緩和

| リスク | 緩和 |
|---|---|
| Claude / DeepL API キーが切れる | Action のエラーログで通知、運営に再設定依頼の手順書を残す |
| 翻訳品質が低い | CMS 上で en を手動編集すれば override される、git diff で確認可能 |
| Action のコスト | 試算で月 $0.05 未満。心配なら DeepL 無料枠のみで運用も可 |
| BBS との二重管理 | お知らせ本文は新サイトのみ、X はリンクを貼るだけのルールを運営と合意 |
| 編集者が markdown に不慣れ | Pages CMS の `text` 型はプレーンテキスト編集、見出しや箇条書きが必要なら admin がサポート |
| ピン留め / hero 画像が後で必要になる | スキーマは optional フィールド追加で拡張可能、既存エントリへの影響なし |
