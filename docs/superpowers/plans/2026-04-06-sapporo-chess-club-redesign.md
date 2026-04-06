# 札幌チェスクラブ ウェブサイトリデザイン 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 札幌チェスクラブの既存サイトを Astro + GitHub Pages + Pages CMS + shadcn/ui で完全リデザインする。

**Architecture:** Astro の静的サイト生成でトップページ（シングルページ）と大会記録ページの2ページを構成。React Islands でインタラクティブ要素（ハンバーガーメニュー、年度フィルター、申込フォーム）を実装。コンテンツは Astro Content Collections で管理し、Pages CMS からブラウザ編集可能にする。

**Tech Stack:** Astro 5, React 19, Tailwind CSS 4, shadcn/ui, Formspree, GitHub Actions

**Design spec:** `docs/superpowers/specs/2026-04-06-sapporo-chess-club-redesign-design.md`

---

## ファイル構成

```
src/
├── components/
│   ├── ui/                    # shadcn/ui コンポーネント (button, card, badge etc.)
│   ├── Header.astro           # ヘッダー (ロゴ + ハンバーガー + 言語切替)
│   ├── Footer.astro           # フッター
│   ├── HamburgerMenu.tsx      # 全画面メニュー (React: 開閉アニメーション)
│   ├── LanguageToggle.astro   # JA/EN 切替
│   ├── Hero.astro             # ヒーロー (巨大タイポ)
│   ├── NextEvent.astro        # 次回のイベント
│   ├── Activities.astro       # 活動内容カード
│   ├── Schedule.astro         # スケジュールリスト
│   ├── ClubInfo.astro         # 参加案内・会場
│   ├── ChessLessons.astro     # チェス講座
│   ├── Links.astro            # リンク集
│   ├── Contact.astro          # お問い合わせ
│   ├── TournamentCard.astro   # 大会カード
│   ├── YearFilter.tsx         # 年度フィルター (React: タブ切替)
│   ├── ApplicationForm.tsx    # 申込フォーム (React: Formspree)
│   └── ScrollReveal.astro     # スクロール連動フェードイン
├── content/
│   ├── config.ts              # Content Collections スキーマ定義
│   ├── schedule/              # 例会スケジュール (YAML)
│   ├── tournaments/           # 大会データ (Markdown + frontmatter)
│   ├── lessons/               # チェス講座 (Markdown)
│   ├── links/                 # リンク集 (YAML)
│   └── site/                  # サイト基本情報 (YAML)
├── i18n/
│   ├── ja.ts                  # 日本語 UI 文字列
│   ├── en.ts                  # 英語 UI 文字列
│   └── index.ts               # ヘルパー関数
├── layouts/
│   └── BaseLayout.astro       # 共通レイアウト
├── pages/
│   ├── index.astro            # トップページ (JA, デフォルト)
│   ├── tournaments.astro      # 大会記録 (JA)
│   └── en/
│       ├── index.astro        # トップページ (EN)
│       └── tournaments.astro  # 大会記録 (EN)
├── styles/
│   └── globals.css            # グローバルCSS + アニメーション
└── lib/
    └── utils.ts               # cn() ヘルパー等
public/
├── competition/               # 過去の大会 PDF/PGN ファイル (移行)
└── fonts/                     # Web フォント (Noto Sans JP 等)
.pages.yml                     # Pages CMS 設定
.github/workflows/deploy.yml   # GitHub Pages デプロイ
```

---

## Task 1: プロジェクト初期化

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/styles/globals.css`, `src/lib/utils.ts`, `tailwind.config.mjs`

- [ ] **Step 1: Astro プロジェクトを作成**

```bash
cd /Users/koutarou/sapporo_chess_club
pnpm create astro@latest . --template minimal --install --git --typescript strict
```

選択肢が出たら: テンプレート=minimal, TypeScript=strict, install=yes

- [ ] **Step 2: React と Tailwind を追加**

```bash
pnpm astro add react tailwind
```

- [ ] **Step 3: shadcn/ui を初期化**

```bash
pnpm dlx shadcn@latest init -t astro
```

設定: style=new-york, base-color=neutral, css-variables=yes

- [ ] **Step 4: 必要な shadcn コンポーネントを追加**

```bash
pnpm dlx shadcn@latest add button badge card
```

- [ ] **Step 5: グローバル CSS にカスタムプロパティを追加**

`src/styles/globals.css` の末尾に追加:

```css
/* Animation utilities */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-out-right {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.animate-fade-in {
  animation: fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.animate-slide-out-right {
  animation: slide-out-right 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* Stagger delays */
.stagger-1 { animation-delay: 0.05s; }
.stagger-2 { animation-delay: 0.1s; }
.stagger-3 { animation-delay: 0.15s; }
.stagger-4 { animation-delay: 0.2s; }
.stagger-5 { animation-delay: 0.25s; }
.stagger-6 { animation-delay: 0.3s; }

/* Scroll reveal: hidden by default, revealed by IntersectionObserver */
.reveal {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Hover arrow shift */
.arrow-link:hover .arrow {
  transform: translateX(4px);
}

.arrow {
  transition: transform 0.15s ease-out;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in-up,
  .animate-fade-in,
  .animate-slide-in-right,
  .animate-slide-out-right {
    animation: none;
  }
  .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
  .arrow {
    transition: none;
  }
}
```

- [ ] **Step 6: astro.config.mjs に i18n とサイト設定を追加**

`astro.config.mjs` を以下に置き換え:

```javascript
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://sapporo-chess-club.github.io",
  integrations: [react(), tailwind()],
  i18n: {
    locales: ["ja", "en"],
    defaultLocale: "ja",
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
```

- [ ] **Step 7: ビルド確認**

```bash
pnpm build
```

Expected: `dist/` ディレクトリが生成されエラーなし

- [ ] **Step 8: コミット**

```bash
git add -A
git commit -m "feat: initialize Astro project with React, Tailwind, shadcn/ui, i18n"
```

---

## Task 2: i18n ヘルパーとコンテンツスキーマ

**Files:**
- Create: `src/i18n/ja.ts`, `src/i18n/en.ts`, `src/i18n/index.ts`, `src/content/config.ts`

- [ ] **Step 1: 日本語 UI 文字列ファイルを作成**

`src/i18n/ja.ts`:

```typescript
export default {
  nav: {
    home: "ホーム",
    tournaments: "大会記録",
  },
  sections: {
    home: "HOME",
    tournaments: "TOURNAMENTS",
  },
  hero: {
    subtitle: "北海道のチェス愛好家が集うコミュニティです。初心者歓迎。",
  },
  nextEvent: {
    meeting: "次回の例会",
    event: "次回のイベント",
  },
  activities: {
    label: "活動内容",
    meetup: "例会",
    meetupDesc: "月2回の定期開催",
    tournament: "大会",
    tournamentDesc: "年3回の公式戦",
    lesson: "講座",
    lessonDesc: "初心者向け",
  },
  schedule: {
    label: "スケジュール",
  },
  clubInfo: {
    fee: "参加案内",
    feeGeneral: "一般1,000円",
    feeStudent: "学生500円",
    venue: "会場",
  },
  lessons: {
    label: "チェス講座",
  },
  links: {
    label: "リンク",
  },
  contact: {
    label: "お問い合わせ",
  },
  tournament: {
    pageTitle: "大会記録",
    pageSubtitle: "2000年〜現在までの全大会アーカイブ",
    register: "申し込む",
    detailsPdf: "要項 PDF",
    resultsPdf: "結果 PDF",
    gamesPgn: "棋譜 PGN",
  },
  badge: {
    open: "申込受付中",
    results: "結果",
    closed: "申込締切",
    upcoming: "予定",
    tournamentTag: "大会",
  },
  footer: {
    top: "↑ TOP",
  },
  menu: {
    sectionLabel: "セクション",
    schedule: "スケジュール",
    activities: "活動内容",
    info: "参加案内・会場",
    lessons: "チェス講座",
    links: "リンク",
    contact: "お問い合わせ",
  },
} as const;
```

- [ ] **Step 2: 英語 UI 文字列ファイルを作成**

`src/i18n/en.ts`:

```typescript
export default {
  nav: {
    home: "Home",
    tournaments: "Tournaments",
  },
  sections: {
    home: "HOME",
    tournaments: "TOURNAMENTS",
  },
  hero: {
    subtitle: "A community for chess enthusiasts in Hokkaido. Beginners welcome.",
  },
  nextEvent: {
    meeting: "Next Meeting",
    event: "Next Event",
  },
  activities: {
    label: "Activities",
    meetup: "Meetups",
    meetupDesc: "Twice a month",
    tournament: "Tournaments",
    tournamentDesc: "3 per year",
    lesson: "Lessons",
    lessonDesc: "For beginners",
  },
  schedule: {
    label: "Schedule",
  },
  clubInfo: {
    fee: "Entry Fee",
    feeGeneral: "General ¥1,000",
    feeStudent: "Students ¥500",
    venue: "Venue",
  },
  lessons: {
    label: "Chess Lessons",
  },
  links: {
    label: "Links",
  },
  contact: {
    label: "Contact",
  },
  tournament: {
    pageTitle: "Tournaments",
    pageSubtitle: "Full archive from 2000 to present",
    register: "Register",
    detailsPdf: "Details PDF",
    resultsPdf: "Results PDF",
    gamesPgn: "Game Records PGN",
  },
  badge: {
    open: "Open",
    results: "Results",
    closed: "Closed",
    upcoming: "Upcoming",
    tournamentTag: "Tournament",
  },
  footer: {
    top: "↑ TOP",
  },
  menu: {
    sectionLabel: "Sections",
    schedule: "Schedule",
    activities: "Activities",
    info: "Entry Fee & Venue",
    lessons: "Chess Lessons",
    links: "Links",
    contact: "Contact",
  },
} as const;
```

- [ ] **Step 3: i18n ヘルパーを作成**

`src/i18n/index.ts`:

```typescript
import ja from "./ja";
import en from "./en";

const translations = { ja, en } as const;

export type Locale = keyof typeof translations;

export function t(locale: Locale) {
  return translations[locale];
}

export function getLocaleFromUrl(url: URL): Locale {
  const [, lang] = url.pathname.split("/");
  if (lang === "en") return "en";
  return "ja";
}

export function getLocalePath(locale: Locale, path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (locale === "ja") return cleanPath;
  return `/en${cleanPath}`;
}
```

- [ ] **Step 4: Content Collections スキーマを定義**

`src/content/config.ts`:

```typescript
import { defineCollection, z } from "astro:content";

const schedule = defineCollection({
  type: "data",
  schema: z.object({
    dates: z.array(
      z.object({
        date: z.string(),
        dayOfWeek: z.object({ ja: z.string(), en: z.string() }),
        startTime: z.string(),
        endTime: z.string(),
        room: z.string(),
        venue: z.object({ ja: z.string(), en: z.string() }),
        type: z.enum(["meeting", "tournament"]).default("meeting"),
        note: z.object({ ja: z.string(), en: z.string() }).optional(),
      })
    ),
  }),
});

const tournaments = defineCollection({
  type: "content",
  schema: z.object({
    title: z.object({ ja: z.string(), en: z.string() }),
    date: z.string(),
    venue: z.object({ ja: z.string(), en: z.string() }).optional(),
    status: z.enum(["open", "closed", "upcoming", "results"]),
    detailsPdf: z.string().optional(),
    resultsPdf: z.string().optional(),
    gamesPgn: z.string().optional(),
    formspreeId: z.string().optional(),
    year: z.number(),
    sortOrder: z.number().optional(),
  }),
});

const lessons = defineCollection({
  type: "content",
  schema: z.object({
    title: z.object({ ja: z.string(), en: z.string() }),
    description: z.object({ ja: z.string(), en: z.string() }),
    period: z.object({ ja: z.string(), en: z.string() }),
  }),
});

const links = defineCollection({
  type: "data",
  schema: z.object({
    links: z.array(
      z.object({
        title: z.object({ ja: z.string(), en: z.string() }),
        url: z.string().url(),
      })
    ),
  }),
});

const site = defineCollection({
  type: "data",
  schema: z.object({
    email: z.string().email(),
    phone: z.string(),
    venue: z.object({
      name: z.object({ ja: z.string(), en: z.string() }),
      floor: z.string(),
      address: z.object({ ja: z.string(), en: z.string() }),
      access: z.object({ ja: z.string(), en: z.string() }),
    }),
    fee: z.object({
      general: z.number(),
      student: z.number(),
    }),
  }),
});

export const collections = { schedule, tournaments, lessons, links, site };
```

- [ ] **Step 5: コミット**

```bash
git add src/i18n/ src/content/config.ts
git commit -m "feat: add i18n translations and content collection schemas"
```

---

## Task 3: サンプルコンテンツデータ

**Files:**
- Create: `src/content/schedule/current.yaml`, `src/content/tournaments/2026-hokkaido-championship.md`, `src/content/tournaments/2025-autumn.md`, `src/content/tournaments/2025-summer.md`, `src/content/lessons/beginner-course.md`, `src/content/links/links.yaml`, `src/content/site/info.yaml`

- [ ] **Step 1: スケジュールデータを作成**

`src/content/schedule/current.yaml`:

```yaml
dates:
  - date: "2026-04-05"
    dayOfWeek: { ja: "日", en: "Sun" }
    startTime: "13:00"
    endTime: "17:00"
    room: "810A"
    venue: { ja: "かでる2.7", en: "Kaderu 2.7" }
    type: meeting
  - date: "2026-04-19"
    dayOfWeek: { ja: "日", en: "Sun" }
    startTime: "13:00"
    endTime: "17:00"
    room: "740"
    venue: { ja: "かでる2.7", en: "Kaderu 2.7" }
    type: meeting
    note: { ja: "注意：810Aではなく740", en: "Note: Room 740, not 810A" }
  - date: "2026-05-10"
    dayOfWeek: { ja: "日", en: "Sun" }
    startTime: "13:00"
    endTime: "17:00"
    room: "810A"
    venue: { ja: "かでる2.7", en: "Kaderu 2.7" }
    type: meeting
  - date: "2026-05-24"
    dayOfWeek: { ja: "日", en: "Sun" }
    startTime: "13:00"
    endTime: "17:00"
    room: "810A"
    venue: { ja: "かでる2.7", en: "Kaderu 2.7" }
    type: meeting
  - date: "2026-07-19"
    dayOfWeek: { ja: "日", en: "Sun" }
    startTime: "10:00"
    endTime: "18:00"
    room: "1010"
    venue: { ja: "かでる2.7", en: "Kaderu 2.7" }
    type: tournament
  - date: "2026-07-20"
    dayOfWeek: { ja: "月", en: "Mon" }
    startTime: "10:00"
    endTime: "18:00"
    room: "1010"
    venue: { ja: "かでる2.7", en: "Kaderu 2.7" }
    type: tournament
```

- [ ] **Step 2: 大会データを作成**

`src/content/tournaments/2026-hokkaido-championship.md`:

```markdown
---
title:
  ja: "第32回 北海道チェス選手権"
  en: "32nd Hokkaido Chess Championship"
date: "2026-06-15"
venue:
  ja: "かでる2.7"
  en: "Kaderu 2.7"
status: "open"
detailsPdf: "/competition/hokkaido_32_ann.pdf"
formspreeId: "xyzabc12"
year: 2026
sortOrder: 1
---
```

`src/content/tournaments/2025-autumn.md`:

```markdown
---
title:
  ja: "札幌オータムチェス大会 2025"
  en: "Sapporo Autumn Tournament 2025"
date: "2025-11-09"
status: "results"
detailsPdf: "/competition/autumn_2025_ann.pdf"
resultsPdf: "/competition/autumn_2025_result.pdf"
gamesPgn: "/competition/autumn_2025.pgn"
year: 2025
sortOrder: 2
---
```

`src/content/tournaments/2025-summer.md`:

```markdown
---
title:
  ja: "札幌サマーチェス大会 2025"
  en: "Sapporo Summer Tournament 2025"
date: "2025-07-06"
status: "results"
detailsPdf: "/competition/summer_2025_ann.pdf"
resultsPdf: "/competition/summer_2025_result.pdf"
gamesPgn: "/competition/summer_2025.pgn"
year: 2025
sortOrder: 1
---
```

- [ ] **Step 3: 講座・リンク・サイト情報を作成**

`src/content/lessons/beginner-course.md`:

```markdown
---
title:
  ja: "初心者向けチェス講座"
  en: "Beginner Chess Course"
description:
  ja: "10月〜3月開催の6週間プログラム。駒の動��し方から学べます。"
  en: "6-week program from October to March. Learn from the basics."
period:
  ja: "10月〜3月"
  en: "October – March"
---
```

`src/content/links/links.yaml`:

```yaml
links:
  - title: { ja: "日本チェス協会", en: "Japan Chess Association" }
    url: "https://www.chess.or.jp/"
  - title: { ja: "Chess.com", en: "Chess.com" }
    url: "https://www.chess.com/"
  - title: { ja: "lichess.org", en: "lichess.org" }
    url: "https://lichess.org/"
```

`src/content/site/info.yaml`:

```yaml
email: "sapporochessclub@gmail.com"
phone: "011-865-0355"
venue:
  name: { ja: "かでる2.7", en: "Kaderu 2.7" }
  floor: "10F"
  address: { ja: "札幌市中央区北2条西7丁目", en: "Kita 2 Nishi 7, Chuo-ku, Sapporo" }
  access: { ja: "JR札幌駅 徒歩15分", en: "15 min walk from JR Sapporo Station" }
fee:
  general: 1000
  student: 500
```

- [ ] **Step 4: ビルド確認**

```bash
pnpm build
```

Expected: コンテンツスキーマのバリデーションが通りエラーなし

- [ ] **Step 5: コミット**

```bash
git add src/content/
git commit -m "feat: add sample content data for schedule, tournaments, lessons, links, site"
```

---

## Task 4: 共通レイアウトとヘッダー・フッター

**Files:**
- Create: `src/layouts/BaseLayout.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/components/LanguageToggle.astro`, `src/components/HamburgerMenu.tsx`

- [ ] **Step 1: BaseLayout を作成**

`src/layouts/BaseLayout.astro`:

```astro
---
import { ViewTransitions } from "astro:transitions";
import Header from "@/components/Header.astro";
import Footer from "@/components/Footer.astro";
import "@/styles/globals.css";
import type { Locale } from "@/i18n";

interface Props {
  title: string;
  locale: Locale;
}

const { title, locale } = Astro.props;
---

<!doctype html>
<html lang={locale}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title} | 札幌チェスクラブ</title>
    <ViewTransitions />
  </head>
  <body class="bg-white text-[#171717] font-sans antialiased">
    <Header locale={locale} />
    <main>
      <slot />
    </main>
    <Footer locale={locale} />

    <script>
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    </script>
  </body>
</html>
```

- [ ] **Step 2: LanguageToggle を作成**

`src/components/LanguageToggle.astro`:

```astro
---
import type { Locale } from "@/i18n";
import { getLocalePath } from "@/i18n";

interface Props {
  locale: Locale;
  path: string;
}

const { locale, path } = Astro.props;
const otherLocale: Locale = locale === "ja" ? "en" : "ja";
const otherPath = getLocalePath(otherLocale, path);
---

<a
  href={otherPath}
  class="text-[9px] tracking-[1px] text-[#a3a3a3] hover:text-[#171717] transition-colors duration-200"
>
  {locale === "ja" ? "EN" : "JA"}
</a>
```

- [ ] **Step 3: Header を作成**

`src/components/Header.astro`:

```astro
---
import LanguageToggle from "./LanguageToggle.astro";
import HamburgerMenu from "./HamburgerMenu.tsx";
import type { Locale } from "@/i18n";

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const currentPath = Astro.url.pathname.replace(/^\/(en\/)?/, "/");
---

<header class="flex items-center justify-between px-5 py-3">
  <span class="text-[9px] tracking-[3px] text-[#a3a3a3]">SAPPORO CHESS CLUB</span>
  <div class="flex items-center gap-4">
    <LanguageToggle locale={locale} path={currentPath} />
    <HamburgerMenu locale={locale} client:load />
  </div>
</header>
```

- [ ] **Step 4: HamburgerMenu を作成**

`src/components/HamburgerMenu.tsx`:

```tsx
import { useState, useEffect } from "react";
import { t, getLocalePath, type Locale } from "@/i18n";

interface Props {
  locale: Locale;
}

export default function HamburgerMenu({ locale }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const i = t(locale);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const pages = [
    { label: i.nav.home, sub: i.sections.home, href: getLocalePath(locale, "/") },
    { label: i.nav.tournaments, sub: i.sections.tournaments, href: getLocalePath(locale, "/tournaments") },
  ];

  const anchors = [
    { label: i.menu.schedule, href: "#schedule" },
    { label: i.menu.activities, href: "#activities" },
    { label: i.menu.info, href: "#info" },
    { label: i.menu.lessons, href: "#lessons" },
    { label: i.menu.links, href: "#links" },
    { label: i.menu.contact, href: "#contact" },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        className="flex flex-col gap-[3px] cursor-pointer"
      >
        <span className="w-4 h-[1.5px] bg-[#171717]" />
        <span className="w-4 h-[1.5px] bg-[#171717]" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#171717] text-[#fafafa] animate-slide-in-right"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-[9px] tracking-[3px] text-[#525252]">
              SAPPORO CHESS CLUB
            </span>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
              className="text-lg font-extralight cursor-pointer"
            >
              ✕
            </button>
          </div>

          <nav className="px-5 pt-8">
            {pages.map((page, i) => (
              <a
                key={page.href}
                href={page.href}
                onClick={() => setIsOpen(false)}
                className="block mb-6 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <span className="text-[28px] font-light">{page.label}</span>
                <span className="block text-[8px] tracking-[1px] text-[#525252] mt-1">
                  {page.sub}
                </span>
              </a>
            ))}

            <div className="border-t border-[#2a2a2a] my-5" />

            <p className="text-[8px] tracking-[1px] text-[#525252] mb-3">
              {i.menu.sectionLabel}
            </p>
            <div className="flex flex-col gap-3">
              {anchors.map((anchor, idx) => (
                <a
                  key={anchor.href}
                  href={anchor.href}
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-[#a3a3a3] hover:text-[#fafafa] transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${(pages.length + idx) * 0.05}s` }}
                >
                  {anchor.label}
                </a>
              ))}
            </div>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 px-5 py-3 border-t border-[#2a2a2a]">
            <span className="text-[8px] text-[#525252]">sapporochessclub@gmail.com</span>
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 5: Footer を作成**

`src/components/Footer.astro`:

```astro
---
import { t, type Locale } from "@/i18n";

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const i = t(locale);
---

<footer class="flex items-center justify-between px-5 py-3 border-t border-[#f5f5f5] text-[8px] text-[#d4d4d4]">
  <span>© {new Date().getFullYear()} Sapporo Chess Club</span>
  <a href="#top" class="text-[#a3a3a3] hover:text-[#171717] transition-colors">
    {i.footer.top}
  </a>
</footer>
```

- [ ] **Step 6: ビルド確認**

```bash
pnpm build
```

- [ ] **Step 7: コミット**

```bash
git add src/layouts/ src/components/Header.astro src/components/Footer.astro src/components/LanguageToggle.astro src/components/HamburgerMenu.tsx
git commit -m "feat: add base layout, header with hamburger menu, footer, language toggle"
```

---

## Task 5: トップページ — ヒーロー + 次回イベント + 活動内容

**Files:**
- Create: `src/components/Hero.astro`, `src/components/NextEvent.astro`, `src/components/Activities.astro`, `src/pages/index.astro`

- [ ] **Step 1: Hero コンポーネントを作成**

`src/components/Hero.astro`:

```astro
---
import { t, type Locale } from "@/i18n";

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const i = t(locale);
---

<section id="top" class="px-5 pt-9 pb-7 relative">
  <h1 class="text-[42px] font-extrabold leading-[1.05] tracking-tight">
    <span class="block animate-fade-in-up">札幌</span>
    <span class="block animate-fade-in-up stagger-1">チェス</span>
    <span class="block animate-fade-in-up stagger-2">クラブ</span>
  </h1>
  <span
    class="absolute top-8 right-4 text-[9px] tracking-[2px] text-[#a3a3a3] [writing-mode:vertical-rl] animate-fade-in stagger-3"
  >
    EST. 1990s — HOKKAIDO
  </span>
  <p class="mt-3.5 text-[10px] text-[#a3a3a3] leading-[1.8] max-w-[220px] animate-fade-in-up stagger-3">
    {i.hero.subtitle}
  </p>
</section>
```

- [ ] **Step 2: NextEvent コンポーネントを作成**

`src/components/NextEvent.astro`:

```astro
---
import { getCollection } from "astro:content";
import { Badge } from "@/components/ui/badge";
import { t, type Locale } from "@/i18n";

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const i = t(locale);

const scheduleData = await getCollection("schedule");
const tournamentsData = await getCollection("tournaments");

const now = new Date();

// Find next schedule date
const allDates = scheduleData.flatMap((s) => s.data.dates);
const nextSchedule = allDates.find((d) => new Date(d.date) >= now);

// Find next open tournament
const openTournament = tournamentsData
  .filter((t) => t.data.status === "open")
  .sort((a, b) => new Date(a.data.date).getTime() - new Date(b.data.date).getTime())[0];

// Determine which is sooner
const nextScheduleDate = nextSchedule ? new Date(nextSchedule.date) : null;
const nextTournamentDate = openTournament ? new Date(openTournament.data.date) : null;

const showTournament =
  nextTournamentDate &&
  (!nextScheduleDate || nextTournamentDate <= nextScheduleDate);

const displayDate = showTournament
  ? nextTournamentDate!
  : nextScheduleDate;

const month = displayDate ? displayDate.getMonth() + 1 : null;
const day = displayDate ? displayDate.getDate() : null;

const dayOfWeek = showTournament
  ? undefined
  : nextSchedule?.dayOfWeek[locale];

const time = showTournament
  ? undefined
  : `${nextSchedule?.startTime} – ${nextSchedule?.endTime}`;

const venue = showTournament
  ? openTournament?.data.venue?.[locale]
  : nextSchedule?.venue[locale];
---

{displayDate && (
  <section class="px-5 py-3.5 border-t border-[#f5f5f5] reveal">
    <div class="flex items-center gap-1.5 mb-1.5">
      <span class="text-[10px] font-semibold text-[#a3a3a3]">
        {showTournament ? i.nextEvent.event : i.nextEvent.meeting}
      </span>
      {showTournament && (
        <Badge className="bg-[#171717] text-white text-[8px] px-1.5 py-0 rounded-[3px] font-semibold hover:bg-[#171717]">
          {i.badge.tournamentTag}
        </Badge>
      )}
    </div>
    <div class="flex items-baseline gap-2.5">
      <span class="text-[30px] font-extralight leading-none">
        {month}/{day}
      </span>
      <div>
        {showTournament ? (
          <>
            <p class="text-[10px] font-semibold">{openTournament!.data.title[locale]}</p>
            {venue && <p class="text-[8px] text-[#a3a3a3] mt-0.5">{venue}</p>}
          </>
        ) : (
          <>
            <p class="text-[10px] font-semibold">{dayOfWeek}{locale === "ja" ? "曜日" : ""}</p>
            <p class="text-[8px] text-[#a3a3a3] mt-0.5">{time} / {venue} {nextSchedule?.room}{locale === "ja" ? "室" : ""}</p>
          </>
        )}
      </div>
    </div>
  </section>
)}
```

- [ ] **Step 3: Activities コンポーネントを作成**

`src/components/Activities.astro`:

```astro
---
import { t, getLocalePath, type Locale } from "@/i18n";

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const i = t(locale);

const cards = [
  { title: i.activities.meetup, desc: i.activities.meetupDesc },
  { title: i.activities.tournament, desc: i.activities.tournamentDesc },
  { title: i.activities.lesson, desc: i.activities.lessonDesc },
];
---

<section id="activities" class="px-5 py-3.5 reveal">
  <h2 class="text-[10px] font-semibold text-[#a3a3a3] mb-2">{i.activities.label}</h2>
  <div class="flex gap-1.5">
    {cards.map((card) => (
      <div class="flex-1 p-2.5 bg-[#fafafa] rounded-md">
        <p class="text-[10px] font-semibold">{card.title}</p>
        <p class="text-[8px] text-[#a3a3a3] mt-0.5">{card.desc}</p>
      </div>
    ))}
  </div>
</section>
```

- [ ] **Step 4: トップページを作成**

`src/pages/index.astro`:

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
import Hero from "@/components/Hero.astro";
import NextEvent from "@/components/NextEvent.astro";
import Activities from "@/components/Activities.astro";
---

<BaseLayout title="ホーム" locale="ja">
  <Hero locale="ja" />
  <NextEvent locale="ja" />
  <Activities locale="ja" />
</BaseLayout>
```

- [ ] **Step 5: dev サーバーで目視確認**

```bash
pnpm dev
```

ブラウザで `http://localhost:4321` を開き、ヒーロー・次回イベント・活動内容が表示されることを確認。

- [ ] **Step 6: コミット**

```bash
git add src/components/Hero.astro src/components/NextEvent.astro src/components/Activities.astro src/pages/index.astro
git commit -m "feat: add top page with hero, next event, activities sections"
```

---

## Task 6: トップページ — 残りのセクション

**Files:**
- Create: `src/components/Schedule.astro`, `src/components/ClubInfo.astro`, `src/components/ChessLessons.astro`, `src/components/Links.astro`, `src/components/Contact.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Schedule コンポーネントを作成**

`src/components/Schedule.astro`:

```astro
---
import { getCollection } from "astro:content";
import { t, type Locale } from "@/i18n";

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const i = t(locale);

const scheduleData = await getCollection("schedule");
const allDates = scheduleData.flatMap((s) => s.data.dates);
const now = new Date();
const upcomingDates = allDates
  .filter((d) => new Date(d.date) >= now)
  .slice(0, 5);

function formatDate(dateStr: string, dow: string): string {
  const d = new Date(dateStr);
  if (locale === "ja") {
    return `${d.getMonth() + 1}月${d.getDate()}日 ${dow}`;
  }
  return `${d.toLocaleDateString("en", { month: "short" })} ${d.getDate()} ${dow}`;
}
---

<section id="schedule" class="px-5 py-3.5 reveal">
  <h2 class="text-[10px] font-semibold text-[#a3a3a3] mb-2">{i.schedule.label}</h2>
  <div class="text-[10px]">
    {upcomingDates.map((date, idx) => (
      <div
        class:list={[
          "flex justify-between py-1.5",
          idx < upcomingDates.length - 1 && "border-b border-[#f5f5f5]",
        ]}
      >
        <span>
          {formatDate(date.date, date.dayOfWeek[locale])}
          {date.note && <span class="text-[#a3a3a3] text-[8px] ml-1">{date.note[locale]}</span>}
        </span>
        <span class="text-[#a3a3a3]">{date.startTime} / {date.room}{locale === "ja" ? "室" : ""}</span>
      </div>
    ))}
  </div>
</section>
```

- [ ] **Step 2: ClubInfo コンポーネントを作成**

`src/components/ClubInfo.astro`:

```astro
---
import { getCollection } from "astro:content";
import { t, type Locale } from "@/i18n";

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const i = t(locale);

const siteData = await getCollection("site");
const site = siteData[0].data;
---

<section id="info" class="px-5 py-3.5 border-t border-[#f5f5f5] reveal">
  <div class="grid grid-cols-2 gap-3.5">
    <div>
      <h2 class="text-[10px] font-semibold text-[#a3a3a3] mb-1">{i.clubInfo.fee}</h2>
      <p class="text-[9px] leading-[1.8] text-[#525252]">
        {locale === "ja" ? `一般${site.fee.general.toLocaleString()}円` : `General ¥${site.fee.general.toLocaleString()}`}<br />
        {locale === "ja" ? `学生${site.fee.student}円` : `Students ¥${site.fee.student}`}
      </p>
    </div>
    <div>
      <h2 class="text-[10px] font-semibold text-[#a3a3a3] mb-1">{i.clubInfo.venue}</h2>
      <p class="text-[9px] leading-[1.8] text-[#525252]">
        {site.venue.name[locale]} {site.venue.floor}<br />
        {site.venue.address[locale]}<br />
        <span class="text-[#a3a3a3]">{site.venue.access[locale]}</span>
      </p>
    </div>
  </div>
</section>
```

- [ ] **Step 3: ChessLessons コンポーネントを作成**

`src/components/ChessLessons.astro`:

```astro
---
import { getCollection } from "astro:content";
import { t, type Locale } from "@/i18n";

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const i = t(locale);

const lessonsData = await getCollection("lessons");
const lesson = lessonsData[0]?.data;
---

{lesson && (
  <section id="lessons" class="px-5 py-3.5 bg-[#fafafa] border-t border-[#f5f5f5] reveal">
    <h2 class="text-[10px] font-semibold text-[#a3a3a3] mb-1.5">{i.lessons.label}</h2>
    <p class="text-xs font-semibold mb-1">{lesson.title[locale]}</p>
    <p class="text-[9px] text-[#a3a3a3] leading-[1.7]">{lesson.description[locale]}</p>
  </section>
)}
```

- [ ] **Step 4: Links コンポーネントを作成**

`src/components/Links.astro`:

```astro
---
import { getCollection } from "astro:content";
import { t, type Locale } from "@/i18n";

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const i = t(locale);

const linksData = await getCollection("links");
const links = linksData[0]?.data.links ?? [];
---

<section id="links" class="px-5 py-3.5 border-t border-[#f5f5f5] reveal">
  <h2 class="text-[10px] font-semibold text-[#a3a3a3] mb-2">{i.links.label}</h2>
  <div class="text-[10px] leading-[2]">
    {links.map((link) => (
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        class="flex justify-between arrow-link hover:text-[#525252] transition-colors"
      >
        <span>{link.title[locale]}</span>
        <span class="text-[#a3a3a3] arrow">→</span>
      </a>
    ))}
  </div>
</section>
```

- [ ] **Step 5: Contact コンポーネントを作成**

`src/components/Contact.astro`:

```astro
---
import { getCollection } from "astro:content";
import { t, type Locale } from "@/i18n";

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const i = t(locale);

const siteData = await getCollection("site");
const site = siteData[0].data;
---

<section id="contact" class="px-5 py-3.5 border-t border-[#f5f5f5] reveal">
  <h2 class="text-[10px] font-semibold text-[#a3a3a3] mb-1.5">{i.contact.label}</h2>
  <p class="text-[10px] leading-[1.8] text-[#525252]">
    {site.email}<br />
    <span class="text-[#a3a3a3]">Tel: {site.phone}</span>
  </p>
</section>
```

- [ ] **Step 6: index.astro に全セクションを追加**

`src/pages/index.astro` を以下に置き換え:

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
import Hero from "@/components/Hero.astro";
import NextEvent from "@/components/NextEvent.astro";
import Activities from "@/components/Activities.astro";
import Schedule from "@/components/Schedule.astro";
import ClubInfo from "@/components/ClubInfo.astro";
import ChessLessons from "@/components/ChessLessons.astro";
import Links from "@/components/Links.astro";
import Contact from "@/components/Contact.astro";
---

<BaseLayout title="ホーム" locale="ja">
  <Hero locale="ja" />
  <NextEvent locale="ja" />
  <Activities locale="ja" />
  <Schedule locale="ja" />
  <ClubInfo locale="ja" />
  <ChessLessons locale="ja" />
  <Links locale="ja" />
  <Contact locale="ja" />
</BaseLayout>
```

- [ ] **Step 7: dev サーバーで全セクションの表示確認**

```bash
pnpm dev
```

- [ ] **Step 8: コミット**

```bash
git add src/components/Schedule.astro src/components/ClubInfo.astro src/components/ChessLessons.astro src/components/Links.astro src/components/Contact.astro src/pages/index.astro
git commit -m "feat: add schedule, club info, lessons, links, contact sections to top page"
```

---

## Task 7: 大会記録ページ

**Files:**
- Create: `src/components/TournamentCard.astro`, `src/components/YearFilter.tsx`, `src/components/ApplicationForm.tsx`, `src/pages/tournaments.astro`

- [ ] **Step 1: ApplicationForm を作成**

`src/components/ApplicationForm.tsx`:

```tsx
import { useState } from "react";
import type { Locale } from "@/i18n";
import { t } from "@/i18n";

interface Props {
  formspreeId: string;
  tournamentName: string;
  locale: Locale;
}

export default function ApplicationForm({ formspreeId, tournamentName, locale }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const i = t(locale);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    data.append("_subject", `大会申込: ${tournamentName}`);

    const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
    });

    if (res.ok) {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="p-4 bg-[#fafafa] text-center text-[10px] text-[#525252] rounded-b-md">
        {locale === "ja" ? "送信しました。ありがとうございます。" : "Submitted. Thank you."}
      </div>
    );
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-[#171717] text-white text-center py-2.5 rounded-[5px] text-[10px] font-medium hover:bg-[#3f3f46] transition-colors duration-200 cursor-pointer"
      >
        {i.tournament.register}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 animate-fade-in-up">
      <input type="hidden" name="tournament" value={tournamentName} />
      <input
        type="text"
        name="name"
        required
        placeholder={locale === "ja" ? "お名前" : "Name"}
        className="w-full bg-white border border-[#e5e5e5] rounded px-2 py-1.5 text-[9px] outline-none focus:border-[#a3a3a3] transition-colors"
      />
      <input
        type="email"
        name="email"
        required
        placeholder={locale === "ja" ? "メールアドレス" : "Email"}
        className="w-full bg-white border border-[#e5e5e5] rounded px-2 py-1.5 text-[9px] outline-none focus:border-[#a3a3a3] transition-colors"
      />
      <input
        type="text"
        name="jca_number"
        placeholder={locale === "ja" ? "JCA会員番号（��意）" : "JCA Number (optional)"}
        className="w-full bg-white border border-[#e5e5e5] rounded px-2 py-1.5 text-[9px] outline-none focus:border-[#a3a3a3] transition-colors"
      />
      <textarea
        name="notes"
        placeholder={locale === "ja" ? "備考" : "Notes"}
        rows={2}
        className="w-full bg-white border border-[#e5e5e5] rounded px-2 py-1.5 text-[9px] outline-none focus:border-[#a3a3a3] transition-colors resize-none"
      />
      <button
        type="submit"
        className="w-full bg-[#171717] text-white text-center py-2.5 rounded-[5px] text-[10px] font-medium hover:bg-[#3f3f46] transition-colors duration-200 cursor-pointer"
      >
        {locale === "ja" ? "送信する" : "Submit"}
      </button>
      <button
        type="button"
        onClick={() => setIsOpen(false)}
        className="text-[8px] text-[#a3a3a3] text-center cursor-pointer"
      >
        {locale === "ja" ? "閉じる" : "Cancel"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: TournamentCard を作成**

`src/components/TournamentCard.astro`:

```astro
---
import { Badge } from "@/components/ui/badge";
import ApplicationForm from "@/components/ApplicationForm.tsx";
import { t, type Locale } from "@/i18n";

interface Props {
  locale: Locale;
  title: string;
  date: string;
  status: "open" | "closed" | "upcoming" | "results";
  detailsPdf?: string;
  resultsPdf?: string;
  gamesPgn?: string;
  formspreeId?: string;
}

const { locale, title, date, status, detailsPdf, resultsPdf, gamesPgn, formspreeId } = Astro.props;
const i = t(locale);

const badgeStyles: Record<string, string> = {
  open: "bg-[#171717] text-white hover:bg-[#171717]",
  results: "bg-[#e5e5e5] text-[#525252] hover:bg-[#e5e5e5]",
  closed: "bg-[#f5f5f5] text-[#a3a3a3] hover:bg-[#f5f5f5]",
  upcoming: "bg-[#f5f5f5] text-[#a3a3a3] hover:bg-[#f5f5f5]",
};

const badgeLabels: Record<string, string> = {
  open: i.badge.open,
  results: i.badge.results,
  closed: i.badge.closed,
  upcoming: i.badge.upcoming,
};

const isOpen = status === "open";
const hasFiles = detailsPdf || resultsPdf || gamesPgn;
const borderClass = isOpen ? "border-[#e5e5e5]" : "border-[#f5f5f5]";

const fileLinks = [
  detailsPdf && { label: i.tournament.detailsPdf, href: detailsPdf },
  resultsPdf && { label: i.tournament.resultsPdf, href: resultsPdf },
  gamesPgn && { label: i.tournament.gamesPgn, href: gamesPgn },
].filter(Boolean) as { label: string; href: string }[];
---

<div class={`border ${borderClass} rounded-md p-4 reveal`}>
  <div class="flex justify-between items-start">
    <div>
      <p class="text-[11px] font-semibold">{title}</p>
      <p class="text-[9px] text-[#a3a3a3] mt-1">{date}</p>
    </div>
    <Badge className={`text-[8px] px-1.5 py-0 rounded-[3px] font-semibold ${badgeStyles[status]}`}>
      {badgeLabels[status]}
    </Badge>
  </div>

  {hasFiles && (
    <div class="mt-3.5">
      {fileLinks.map((link, idx) => (
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          class:list={[
            "flex justify-between py-2.5 text-[10px] arrow-link hover:text-[#525252] transition-colors",
            idx < fileLinks.length - 1 && "border-b border-[#f5f5f5]",
          ]}
        >
          <span>{link.label}</span>
          <span class="text-[#a3a3a3] arrow">→</span>
        </a>
      ))}
    </div>
  )}

  {isOpen && formspreeId && (
    <div class="mt-4">
      <ApplicationForm formspreeId={formspreeId} tournamentName={title} locale={locale} client:visible />
    </div>
  )}
</div>
```

- [ ] **Step 3: YearFilter を作成**

`src/components/YearFilter.tsx`:

```tsx
import { useState } from "react";

interface Tournament {
  title: string;
  date: string;
  status: "open" | "closed" | "upcoming" | "results";
  detailsPdf?: string;
  resultsPdf?: string;
  gamesPgn?: string;
  formspreeId?: string;
  year: number;
}

interface Props {
  tournaments: Tournament[];
  years: number[];
  locale: "ja" | "en";
  renderCard: (t: Tournament) => React.ReactNode;
}

export default function YearFilter({ tournaments, years, locale, renderCard }: Props) {
  const [selectedYear, setSelectedYear] = useState(years[0]);

  const filtered = tournaments.filter((t) => t.year === selectedYear);

  return (
    <div>
      <div className="flex gap-1.5 flex-wrap mb-5">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`text-[9px] px-2 py-0.5 rounded-[3px] cursor-pointer transition-colors duration-200 ${
              year === selectedYear
                ? "bg-[#171717] text-white"
                : "bg-[#fafafa] text-[#525252] hover:bg-[#e5e5e5]"
            }`}
          >
            {year}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {filtered.map((t) => renderCard(t))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 大会記録ページを作成**

`src/pages/tournaments.astro`:

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "@/layouts/BaseLayout.astro";
import TournamentCard from "@/components/TournamentCard.astro";
import { t } from "@/i18n";

const locale = "ja";
const i = t(locale);

const tournamentsData = await getCollection("tournaments");
const sorted = tournamentsData.sort((a, b) => {
  if (a.data.year !== b.data.year) return b.data.year - a.data.year;
  return (a.data.sortOrder ?? 99) - (b.data.sortOrder ?? 99);
});

const years = [...new Set(sorted.map((t) => t.data.year))].sort((a, b) => b - a);
const groupedByYear = years.map((year) => ({
  year,
  tournaments: sorted.filter((t) => t.data.year === year),
}));
---

<BaseLayout title={i.tournament.pageTitle} locale={locale}>
  <section class="px-5 pt-8 pb-5">
    <h1 class="text-2xl font-extrabold tracking-tight">{i.tournament.pageTitle}</h1>
    <p class="text-[9px] text-[#a3a3a3] mt-1.5">{i.tournament.pageSubtitle}</p>
  </section>

  <section class="px-5 pb-5">
    <div class="flex gap-1.5 flex-wrap mb-5">
      {years.map((year) => (
        <a
          href={`#year-${year}`}
          class="text-[9px] px-2 py-0.5 rounded-[3px] bg-[#fafafa] text-[#525252] hover:bg-[#e5e5e5] transition-colors"
        >
          {year}
        </a>
      ))}
    </div>

    {groupedByYear.map(({ year, tournaments }) => (
      <div id={`year-${year}`} class="mb-8">
        <h2 class="text-[10px] font-semibold text-[#a3a3a3] mb-3">{year}{locale === "ja" ? "年" : ""}</h2>
        <div class="flex flex-col gap-4">
          {tournaments.map((tournament) => (
            <TournamentCard
              locale={locale}
              title={tournament.data.title[locale]}
              date={tournament.data.date}
              status={tournament.data.status}
              detailsPdf={tournament.data.detailsPdf}
              resultsPdf={tournament.data.resultsPdf}
              gamesPgn={tournament.data.gamesPgn}
              formspreeId={tournament.data.formspreeId}
            />
          ))}
        </div>
      </div>
    ))}
  </section>
</BaseLayout>
```

- [ ] **Step 5: dev サーバーで大会記録ページを確認**

```bash
pnpm dev
```

`http://localhost:4321/tournaments` を確認。

- [ ] **Step 6: コミット**

```bash
git add src/components/TournamentCard.astro src/components/YearFilter.tsx src/components/ApplicationForm.tsx src/pages/tournaments.astro
git commit -m "feat: add tournaments page with cards, year filter, application form"
```

---

## Task 8: 英語版ページ

**Files:**
- Create: `src/pages/en/index.astro`, `src/pages/en/tournaments.astro`

- [ ] **Step 1: 英語版トップページを作成**

`src/pages/en/index.astro`:

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
import Hero from "@/components/Hero.astro";
import NextEvent from "@/components/NextEvent.astro";
import Activities from "@/components/Activities.astro";
import Schedule from "@/components/Schedule.astro";
import ClubInfo from "@/components/ClubInfo.astro";
import ChessLessons from "@/components/ChessLessons.astro";
import Links from "@/components/Links.astro";
import Contact from "@/components/Contact.astro";
---

<BaseLayout title="Home" locale="en">
  <Hero locale="en" />
  <NextEvent locale="en" />
  <Activities locale="en" />
  <Schedule locale="en" />
  <ClubInfo locale="en" />
  <ChessLessons locale="en" />
  <Links locale="en" />
  <Contact locale="en" />
</BaseLayout>
```

- [ ] **Step 2: 英語版大会記録ページを作成**

`src/pages/en/tournaments.astro`:

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "@/layouts/BaseLayout.astro";
import TournamentCard from "@/components/TournamentCard.astro";
import { t } from "@/i18n";

const locale = "en";
const i = t(locale);

const tournamentsData = await getCollection("tournaments");
const sorted = tournamentsData.sort((a, b) => {
  if (a.data.year !== b.data.year) return b.data.year - a.data.year;
  return (a.data.sortOrder ?? 99) - (b.data.sortOrder ?? 99);
});

const years = [...new Set(sorted.map((t) => t.data.year))].sort((a, b) => b - a);
const groupedByYear = years.map((year) => ({
  year,
  tournaments: sorted.filter((t) => t.data.year === year),
}));
---

<BaseLayout title={i.tournament.pageTitle} locale={locale}>
  <section class="px-5 pt-8 pb-5">
    <h1 class="text-2xl font-extrabold tracking-tight">{i.tournament.pageTitle}</h1>
    <p class="text-[9px] text-[#a3a3a3] mt-1.5">{i.tournament.pageSubtitle}</p>
  </section>

  <section class="px-5 pb-5">
    <div class="flex gap-1.5 flex-wrap mb-5">
      {years.map((year) => (
        <a
          href={`#year-${year}`}
          class="text-[9px] px-2 py-0.5 rounded-[3px] bg-[#fafafa] text-[#525252] hover:bg-[#e5e5e5] transition-colors"
        >
          {year}
        </a>
      ))}
    </div>

    {groupedByYear.map(({ year, tournaments }) => (
      <div id={`year-${year}`} class="mb-8">
        <h2 class="text-[10px] font-semibold text-[#a3a3a3] mb-3">{year}</h2>
        <div class="flex flex-col gap-4">
          {tournaments.map((tournament) => (
            <TournamentCard
              locale={locale}
              title={tournament.data.title[locale]}
              date={tournament.data.date}
              status={tournament.data.status}
              detailsPdf={tournament.data.detailsPdf}
              resultsPdf={tournament.data.resultsPdf}
              gamesPgn={tournament.data.gamesPgn}
              formspreeId={tournament.data.formspreeId}
            />
          ))}
        </div>
      </div>
    ))}
  </section>
</BaseLayout>
```

- [ ] **Step 3: 両言語のページを確認**

```bash
pnpm dev
```

- `http://localhost:4321/` (日本語トップ)
- `http://localhost:4321/en/` (英語トップ)
- `http://localhost:4321/tournaments` (日本語大会)
- `http://localhost:4321/en/tournaments` (英語大会)
- 言語切替リンクが正しく遷移するか確認

- [ ] **Step 4: コミット**

```bash
git add src/pages/en/
git commit -m "feat: add English version pages"
```

---

## Task 9: Pages CMS 設定

**Files:**
- Create: `.pages.yml`

- [ ] **Step 1: Pages CMS 設定ファイルを作成**

`.pages.yml`:

```yaml
media: public/competition

content:
  - name: schedule
    label: スケジュール
    type: file
    path: src/content/schedule/current.yaml
    format: yaml
    fields:
      - name: dates
        label: 日程
        type: object
        list: true
        fields:
          - { name: date, label: 日付, type: date, required: true }
          - name: dayOfWeek
            label: 曜日
            type: object
            fields:
              - { name: ja, label: 日本語, type: string, required: true }
              - { name: en, label: English, type: string, required: true }
          - { name: startTime, label: 開始時間, type: string, required: true }
          - { name: endTime, label: 終了時間, type: string, required: true }
          - name: venue
            label: 会場
            type: object
            fields:
              - { name: ja, label: 日本語, type: string, required: true }
              - { name: en, label: English, type: string, required: true }

  - name: tournaments
    label: 大会
    type: collection
    path: src/content/tournaments
    format: yaml-frontmatter
    fields:
      - name: title
        label: 大会名
        type: object
        fields:
          - { name: ja, label: 日本語, type: string, required: true }
          - { name: en, label: English, type: string, required: true }
      - { name: date, label: 日付, type: date, required: true }
      - name: venue
        label: 会場
        type: object
        fields:
          - { name: ja, label: 日本語, type: string }
          - { name: en, label: English, type: string }
      - name: status
        label: ステータス
        type: select
        options: [open, closed, upcoming, results]
        required: true
      - { name: detailsPdf, label: 要項 PDF, type: file }
      - { name: resultsPdf, label: 結果 PDF, type: file }
      - { name: gamesPgn, label: 棋譜 PGN, type: file }
      - { name: formspreeId, label: Formspree ID, type: string }
      - { name: year, label: 年, type: number, required: true }
      - { name: sortOrder, label: 並び順, type: number }

  - name: lessons
    label: チェス講座
    type: collection
    path: src/content/lessons
    format: yaml-frontmatter
    fields:
      - name: title
        label: タイトル
        type: object
        fields:
          - { name: ja, label: 日本語, type: string, required: true }
          - { name: en, label: English, type: string, required: true }
      - name: description
        label: 説明
        type: object
        fields:
          - { name: ja, label: 日本語, type: string, required: true }
          - { name: en, label: English, type: string, required: true }
      - name: period
        label: 期間
        type: object
        fields:
          - { name: ja, label: 日本語, type: string, required: true }
          - { name: en, label: English, type: string, required: true }

  - name: links
    label: リンク集
    type: file
    path: src/content/links/links.yaml
    format: yaml
    fields:
      - name: links
        label: リンク
        type: object
        list: true
        fields:
          - name: title
            label: タイトル
            type: object
            fields:
              - { name: ja, label: 日本語, type: string, required: true }
              - { name: en, label: English, type: string, required: true }
          - { name: url, label: URL, type: string, required: true }

  - name: site
    label: サイト情報
    type: file
    path: src/content/site/info.yaml
    format: yaml
    fields:
      - { name: email, label: メール, type: string, required: true }
      - { name: phone, label: 電話番号, type: string, required: true }
      - name: venue
        label: 会場
        type: object
        fields:
          - name: name
            type: object
            fields:
              - { name: ja, type: string, required: true }
              - { name: en, type: string, required: true }
          - { name: floor, type: string }
          - name: address
            type: object
            fields:
              - { name: ja, type: string, required: true }
              - { name: en, type: string, required: true }
          - name: access
            type: object
            fields:
              - { name: ja, type: string, required: true }
              - { name: en, type: string, required: true }
      - name: fee
        label: 参加費
        type: object
        fields:
          - { name: general, label: 一般, type: number, required: true }
          - { name: student, label: 学生, type: number, required: true }
```

- [ ] **Step 2: コミット**

```bash
git add .pages.yml
git commit -m "feat: add Pages CMS configuration"
```

---

## Task 10: 過去データの移行

**Files:**
- Copy: 旧サイトの `competition/` → `public/competition/`
- Create: 過去大会のコンテンツファイル群

- [ ] **Step 1: 旧サイトの大会ファイルをコピー**

```bash
cp -r /Users/koutarou/Downloads/sapporo_chess/sapporo_chess/competition/ /Users/koutarou/sapporo_chess_club/public/competition/
```

- [ ] **Step 2: 過去大会のコンテンツデータを生成するスクリプトを作成・実行**

`scripts/migrate-tournaments.ts` を作成し、旧サイトの `competition.html` を解析して各大会の Markdown ファイルを生成する。旧サイトの competition.html を読み、PDF/PGN ファイルのパスを抽出して年��別にコンテンツファイルを作成する。

このステップは手動で旧サイトの `competition.html` の大会リストを確認しながら、各年度の大会データを `src/content/tournaments/` に Markdown ファイルとして追加する。フォーマットは Task 3 Step 2 と同じ。

```bash
ls public/competition/*.pdf | head -20
```

出力されたファイル名を元に、各大会のfrontmatterファイルを作成。

- [ ] **Step 3: ビルド確認**

```bash
pnpm build
```

- [ ] **Step 4: コミット**

```bash
git add public/competition/ src/content/tournaments/
git commit -m "feat: migrate tournament archive data and PDF/PGN files from old site"
```

---

## Task 11: GitHub Pages デプロイ設定

**Files:**
- Create: `.github/workflows/deploy.yml`, `public/CNAME` (if custom domain), `.gitignore` update

- [ ] **Step 1: .gitignore を確認・更新**

`.gitignore` に以下が含まれていることを確認:

```
node_modules/
dist/
.superpowers/
.astro/
```

- [ ] **Step 2: GitHub Actions ワークフローを作成**

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
      - run: corepack enable && corepack prepare pnpm@latest --activate
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

- [ ] **Step 3: 最終ビルド確認**

```bash
pnpm build && pnpm preview
```

全ページ、全言語、全リンクを確認。

- [ ] **Step 4: コミット**

```bash
git add .github/ .gitignore
git commit -m "feat: add GitHub Actions deployment workflow"
```

---

## 検証チェックリスト

実装完了後に確認:

- [ ] `pnpm build` がエラーなく完了する
- [ ] トップページ: 全9セクションが表示される（JA/EN）
- [ ] 大会記録ページ: 年度フィルター、カード、バッジが正しく表示（JA/EN）
- [ ] ハンバーガーメニュー: 開閉、ページ遷移、アンカーリンクが動作
- [ ] 言語切替: JA/EN トグルが正しいパスに遷移
- [ ] 次回イベント: 例会と大会の自動切り替えが動作
- [ ] 申込フォーム: 展開、入力、送信が動作（Formspree）
- [ ] PDF/PGNリンク: 正しくファイルが開く
- [ ] アニメーション: フェードイン、ホバーエフェクト、メニュートラ��ジション
- [ ] `prefers-reduced-motion` でアニメーションが無効化される
- [ ] レスポンシブ: モバイル・デスクトップで崩れない
- [ ] Lighthouse: Performance 90+, Accessibility 90+
