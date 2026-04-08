# 札幌チェスクラブ

[札幌チェスクラブ](https://kuramoto-to-the-moon.github.io/sapporo-chess-club/) 公式サイトのソースコード。

## 技術スタック

- **Astro 6** — 静的サイトジェネレータ
- **Svelte 5** + **shadcn-svelte** (Bits UI) — インタラクティブ部分
- **Tailwind CSS v4** — スタイリング
- **TypeScript 6**
- **GitHub Pages** — ホスティング (`/sapporo-chess-club/` 配下)
- **Formspree** — お申込フォームの送信先

## セットアップ

```bash
pnpm install
pnpm dev      # http://localhost:4321/sapporo-chess-club/
pnpm build    # dist/ に静的ファイル生成
pnpm preview  # 本番ビルドをローカルプレビュー
```

Node 22.12+ が必要 (Astro 6 の要件)。

## ディレクトリ構成

```
src/
├── pages/              # ルーティング (ja: /, en: /en/)
├── layouts/            # BaseLayout
├── components/
│   ├── *.astro         # 静的レンダリング (大半はこれ)
│   ├── *.svelte        # クライアント側で hydrate するインタラクティブ要素
│   └── ui/             # shadcn-svelte primitives (button, sheet, select, ...)
├── content/            # CMS データ (schedule, tournaments, lessons, links, site)
├── content.config.ts   # Content Collections schema (Zod)
├── lib/                # 共通ヘルパー (date, schedule, scroll-observer, utils)
├── i18n/               # ja.ts / en.ts / index.ts
├── styles/globals.css  # Tailwind v4 + テーマ + 独自 utilities
└── assets/             # ビルド時に最適化される画像
public/                 # そのまま配信される静的アセット (favicon, manifest, og など)
```

## コンテンツ更新

通常運用は **[Pages CMS](https://app.pagescms.org/kuramoto-to-the-moon/sapporo-chess-club/main)** から行います (要 GitHub アカウント + リポジトリへの write 権限)。日常の編集手順は **[docs/operations.md](./docs/operations.md)** を参照。

直接ファイルを編集する場合: `src/content/` 配下の YAML / Markdown を編集。スキーマは `src/content.config.ts` に定義。

- **例会の日程**: `src/content/schedule/meetings.yaml`
- **大会予定**: `src/content/schedule/tournaments-upcoming.yaml`
- **大会記録 (過去)**: `src/content/tournaments/*.md`
- **講座**: `src/content/lessons/*.md`
- **会場・連絡先**: `src/content/site/info.yaml`
- **外部リンク**: `src/content/links/links.yaml`

`content.config.ts` を変更したら必ず `.pages.yml` (CMS スキーマ) も同期すること。

## デプロイ

`main` ブランチへの push で GitHub Actions が自動デプロイ。

## ライセンス

- **コード** (`src/`, `astro.config.mjs`, 設定ファイル等): [MIT License](./LICENSE)
- **コンテンツ** (`src/content/` 配下のスケジュール・大会記録・会場情報・講座情報): 札幌チェスクラブの所有物。再利用はクラブの許諾を得てください
- **第三者ロゴ** (`public/images/jca-logo.webp` 等): 各権利者に帰属
