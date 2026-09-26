# AI検索・検索エンジン向け運用

2026.09.27 時点の公式資料を確認。AIへの掲載・引用は保証されない。本文の正確性、取得しやすさ、更新の継続を優先する。

## 実装していること

- 主要コンテンツは静的HTML。JavaScriptなしでも本文・日程・FAQ・内部リンクを取得できる。
- robots.txt は全クローラーを許可。Googlebot・Bingbot・OAI-SearchBot・Claude-SearchBot・PerplexityBot を個別に追加する必要はない。検索用と学習用の制御は別で、今回学習の許可方針は変更していない。
- 日本語・英語の canonical / hreflang とRSSを維持。noindex のアーカイブ一覧と404をサイトマップから除外し、過去のお知らせ本文は掲載する。
- 日英FAQは持ち物・途中参加の補足に絞り、Homeの料金・会場・クラブ紹介を繰り返さない。質問と回答は常時表示し、静的HTMLに含める。質問ごとのアンカーへ直接リンクできる。
- クラブ・サイト・記事・イベントの構造化データに共通のクラブIDを使用。英語ページでも日本語本文は `inLanguage: ja-JP` とする。
- 設立年、記事の更新日、大会の参加費・空席・受付開始日を推定しない。情報がなければ該当項目を省く。検証ツールの任意項目の警告を消すために情報を作らない。
- 大会のEventデータはスケジュール本文に対応する。Googleのイベント検索にはイベントごとの専用ページ等の条件があり、一覧へのJSON-LD設置だけで対応完了とはみなさない。
- `/llms.txt` は同じ翻訳・CMSデータからビルド時に生成する補助的な案内。変化する日程を複製せず、正規のHTMLへリンクする。全AIが読む標準やランキング向上策とはみなさない。
- `max-image-preview:large` で大きな画像プレビューを許可する。本文の抜粋を制限する `nosnippet` / `max-snippet:0` は設定しない。

## 2026.09.27 公開前の判断

公式ガイドと、Ahrefs の一次調査（2025年12月、75,000ブランドの相関分析）を照合した。重視するのは、取得可能なHTML、本文の正確さ、継続的な活動記録、公式情報と外部掲載の整合性。Ahrefs の調査は一定以上の検索規模を持つブランドが対象で、相関は因果関係ではないため、小規模な地域クラブの必須要件にはしない。

| 観点 | このサイトでの対応 |
|---|---|
| 検索用クローラーの取得 | robots.txtで許可し、主要本文は静的HTMLで提供する。公開後のHTTP応答も別途確認する |
| 一次情報・鮮度 | 例会報告、大会記録、CMSの開催日程を維持する。日付・部屋・中止情報を同じデータから表示する |
| 明確な回答と読みやすさ | 参加案内と重複しない2問だけをFAQにし、回答は常時表示する。ページや質問の水増しはしない |
| クラブの同一性・外部情報 | 構造化データで共通IDを使う。日本チェス連盟の日英クラブ一覧でも名称とメールが一致することを確認した |
| 表示・引用の計測 | 公開後にSearch ConsoleとBing Webmaster Toolsで確認する。BingのAI Performanceは対応サービス内の引用の参考に使い、全AIの引用数とはみなさない |

IndexNowと更新日管理の追加は今回の公開条件にしない。検索への反映遅延が問題になった場合に再検討する。サイトマップのlastmodを付ける場合は、再ビルド日ではなく実際の重要な変更に基づかせる。

Googleはllms.txtを検索順位やAI機能の表示に利用しないと説明している。既存データから生成する補助ファイルとしてのみ維持し、効果のある必須施策とは数えない。FAQの特殊表示も目的にせず、専用のFAQPageマークアップは追加しない。

## 更新のしかた

1. 日程・部屋・中止情報はPages CMSのスケジュールで更新する。毎日15:00 UTC（翌日00:00 JST）のビルドで「今後」の表示が切り替わる。
2. 大会告知はPDFだけで済ませず、お知らせ本文にも大会名・日付・時刻・会場・参加条件・料金・申込方法を記載する。大会日程の関連お知らせを紐付ける。未確定項目は未定と書く。
3. 料金・住所は「サイト基本情報」を更新する。Homeの参加案内・会場とllms.txtに同じ値が反映される。
4. FAQの文章を変更するときは `src/i18n/ja.ts` と `en.ts` を両方更新する。予約不要・英語対応・持ち物など、確認できていない運用を追加しない。
5. 過去の記事を今の開催予定として書き換えない。変更や中止は日程データにも反映し、必要に応じて新しいお知らせを出す。

## 公開後に管理画面で確認すること

コードの変更だけではサイト所有権の確認やインデックス状況の確認は完了しない。

1. [Google Search Console](https://search.google.com/search-console) と [Bing Webmaster Tools](https://www.bing.com/webmasters/) でサイトを登録・所有権確認する。登録済みなら既存のプロパティを使う。
2. 両方に `https://sapporochessclub.com/sitemap-index.xml` を登録する。
3. トップ、英語トップ、スケジュール、最新のお知らせをURL検査し、取得できる本文・canonical・インデックス可否を確認する。変更した主要ページは必要に応じて再クロールを依頼する。
4. [Rich Results Test](https://search.google.com/test/rich-results) で構造化データを確認する。任意項目の不足と、構文エラーや本文との不一致を区別する。
5. 数週間単位で検索表示・クリックと、GA4の参照元や参加問い合わせを確認する。AIは参照元を送らない場合もあり、流入がないことだけで未引用とは判断しない。
6. 日本チェス連盟・会場案内など実際に掲載される外部案内でも、名称・公式URL・住所の整合性を保つ。会場を常設店舗として誤登録しない。

CDN・WAFを将来導入する場合、robots.txtが許可でもネットワーク側でAI検索を遮断することがある。実際の取得失敗を確認し、各社の公開IP情報等に基づき対応する。User-Agentを置き換えたcurlだけでは本物のクローラーの到達性は証明できない。

## リリース前の検証

```bash
pnpm build
pnpm check
pnpm check:search
```

`check:search` は生成HTML全件のcanonical・言語リンク・記事言語・JSON-LD、サイトマップとnoindexの整合、FAQの静的出力、llms.txtのリンク先を検証する。PR・公開・依存更新の各CIでビルド後に実行する。外部検索エンジンへの登録やライブサイトの到達性は別途確認が必要。

## 判断の根拠

- [Google: Optimizing your website for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) — AI検索にも従来のSEOの基本が適用され、専用AIファイルや特別なschemaは不要。
- [OpenAI: Overview of OpenAI Crawlers](https://developers.openai.com/api/docs/bots) — OAI-SearchBotは検索用、GPTBotは学習用。別々に制御できる。
- [Anthropic: Web crawlers](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) — Claudeの検索用・ユーザー操作用・学習用クローラーの区別。
- [Perplexity: Crawlers](https://docs.perplexity.ai/docs/resources/perplexity-crawlers) — 検索用クローラーと取得条件。
- [Bing: AI Performance](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/) — 対応AIサービスでの引用の計測。
- [Ahrefs: AI brand visibility correlations](https://ahrefs.com/blog/ai-brand-visibility-correlations/) — 外部での言及などを調べた相関研究。必須施策や因果関係の証明ではない。
- [日本チェス連盟: 公認クラブリスト](https://japanchess.org/clublist/) / [英語版](https://japanchess.org/en/registered-clubs/) — 公式の外部掲載情報との照合先。
- [Google: Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) — lastmodは実際の重要な変更を反映する。
- [Google: Event structured data](https://developers.google.com/search/docs/appearance/structured-data/event) — イベントページと構造化データの要件。
- [llms.txt proposal](https://llmstxt.org/) — 補助案内の提案。検索掲載の保証ではない。
