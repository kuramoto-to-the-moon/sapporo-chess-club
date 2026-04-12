# 札幌チェスクラブ

[札幌チェスクラブ](https://sapporochessclub.com/) 公式サイトのソースコード。

## 技術スタック

- **Astro 6** — 静的サイトジェネレータ
- **Tailwind CSS v4** — スタイリング
- **TypeScript**
- **GitHub Pages** — ホスティング (カスタムドメイン)

フレームワーク JS なし。すべて Astro の静的 HTML + vanilla script。

## セットアップ

```bash
pnpm install
pnpm dev      # http://localhost:4321/
pnpm build    # dist/ に静的ファイル生成
pnpm preview  # 本番ビルドをローカルプレビュー
```

## コンテンツ更新

通常運用は **[Pages CMS](https://app.pagescms.org/kuramoto-to-the-moon/sapporo-chess-club/main)** から行います。日常の編集手順は **[docs/operations.md](./docs/operations.md)** を参照。

直接編集する場合の主なパス:

| コンテンツ | パス |
|---|---|
| 例会日程 | `src/content/schedule-meetings/*.md` |
| 大会予定 | `src/content/schedule-tournaments/*.md` |
| 大会記録 | `src/content/tournaments/*.md` |
| お知らせ | `src/content/announcements/*.md` |
| 講座 | `src/content/lessons/*.md` |
| 外部リンク | `src/content/links/links.yaml` |
| 会場・連絡先 | `src/content/site/info.yaml` |

スキーマは `src/content.config.ts`、CMS 定義は `.pages.yml`。両方を同期すること。

## デプロイ

`main` ブランチへの push で GitHub Actions が自動デプロイ。

## ライセンス

- **コード**: [MIT License](./LICENSE)
- **コンテンツ** (`src/content/` 配下): 札幌チェスクラブの所有物。再利用はクラブの許諾を得てください
