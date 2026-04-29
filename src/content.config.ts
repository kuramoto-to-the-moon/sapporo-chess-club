import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// =============================================================================
// YAML + CMS 互換ヘルパー
//
// Pages CMS + YAML パーサーは以下の変換を行うため、Zod スキーマ側で
// 全パターンを吸収する必要がある:
//
//   YAML 入力        → JS の型        → 対策
//   field:           → null           → .nullable() で受けて undefined/デフォルト化
//   field: ""        → ""             → transform で undefined 化
//   field: null      → null           → .nullable() で受けて undefined 化
//   field: 2026-03-16→ Date object    → dateString で string 化
//   field: 740       → number         → yamlString で String() 化
//   field: yes       → boolean true   → yamlString で String() 化
// =============================================================================

/**
 * 必須の date フィールド。string / Date を YYYY-MM-DD に正規化。
 * null が来たら Zod バリデーションエラーになる (= ビルド失敗で気づける)。
 */
const requiredDate = z.string().or(z.date())
  .transform((v) => v instanceof Date ? v.toISOString().split("T")[0] : v);

/**
 * YAML の型自動変換に対応する文字列フィールド。
 * 数値 (740) / 真偽値 (yes) / null を全て文字列に変換。
 */
const yamlString = z.string().or(z.number()).or(z.boolean()).nullable()
  .transform((v) => (v === null || v === undefined) ? "" : String(v));

/**
 * 時刻フィールド。"9:00" → "09:00" のようにゼロ埋めして HH:MM に正規化。
 */
const timeString = z.string().or(z.number()).or(z.boolean()).nullable()
  .transform((v) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    const m = s.match(/^(\d{1,2}):(\d{2})$/);
    if (m) return `${m[1].padStart(2, "0")}:${m[2]}`;
    return s;
  });

/**
 * nullable + 空文字列 → undefined にする文字列。optional フォールバックを確実に効かせる。
 */
const nullableString = z.string().nullable().optional()
  .transform((v) => (v === null || v === undefined || v === "") ? undefined : v);

/**
 * ja/en の i18n オブジェクト。null / 空文字列 / 空オブジェクトを全て undefined に。
 * CMS が { ja: null, en: null } や { ja: "", en: "" } で保存するケースに対応。
 */
const i18nString = z.string().nullable().transform((v) => v ?? "");
const optionalI18n = z.object({ ja: i18nString, en: i18nString })
  .nullable()
  .optional()
  .transform((v) => {
    if (!v) return undefined;
    if (!v.ja && !v.en) return undefined;
    return v;
  });



// =============================================================================
// コレクション定義
// =============================================================================

/** 例会の個別ファイル (1 日程 = 1 YAML) */
const scheduleMeetings = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/schedule-meetings" }),
  schema: z.object({
    date: requiredDate,
    startTime: timeString,
    endTime: timeString,
    room: yamlString,
    note: optionalI18n,
  }),
});

/** 大会の個別ファイル (1 日程 = 1 YAML) */
const scheduleTournaments = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/schedule-tournaments" }),
  schema: z.object({
    date: requiredDate,
    eventName: optionalI18n,
    startTime: timeString,
    endTime: timeString,
    room: yamlString,
    note: optionalI18n,
  }),
});

const tournaments = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/tournaments" }),
  schema: z.object({
    title: z.object({
      ja: z.string(),
      en: z.string().nullable().optional().transform((v) => v ?? undefined),
    }),
    date: requiredDate,
    detailsPdf: nullableString,
    resultsPdf: nullableString,
    gamesPgn: nullableString,
    gamesPgnAnnotated: nullableString,
  }),
});

const lessons = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/lessons" }),
  schema: z.object({
    title: z.object({ ja: z.string(), en: z.string() }),
    description: z.object({ ja: z.string(), en: z.string() }),
    url: nullableString,
  }),
});

const links = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/links" }),
  schema: z.object({
    links: z.array(
      z.object({
        title: z.object({ ja: z.string(), en: z.string() }),
        url: z.string(),
      })
    ),
  }),
});

const site = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/site" }),
  schema: z.object({
    email: z.string(),
    phone: yamlString,
    venue: z.object({
      name: z.object({ ja: z.string(), en: z.string() }),
      floor: yamlString,
      address: z.object({ ja: z.string(), en: z.string() }),
      access: z.object({ ja: z.string(), en: z.string() }),
      geo: z.object({
        latitude: z.coerce.number(),
        longitude: z.coerce.number(),
      }),
    }),
    fee: z.object({
      general: z.coerce.number(),
      student: z.coerce.number(),
    }),
  }),
});

const announcements = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/announcements" }),
  schema: z.object({
    title: z.object({
      ja: z.string(),
      en: z.string().nullable().optional().transform((v) => (v === null || v === "") ? undefined : v),
    }),
    description: z.object({
      ja: z.string().nullable().transform((v) => v ?? ""),
      en: z.string().nullable().optional().transform((v) => (v === null || v === "") ? undefined : v),
    }).nullable().optional(),
    date: requiredDate,
    bodyEn: z.string().nullable().optional().transform((v) => (v === null || v === "") ? undefined : v),
  }),
});

export const collections = { scheduleMeetings, scheduleTournaments, tournaments, lessons, links, site, announcements };
