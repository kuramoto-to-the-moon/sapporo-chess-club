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
 * 任意の date フィールド。null / 空文字列は undefined に。
 */
const optionalDate = z.string().or(z.date()).nullable().optional()
  .transform((v) => {
    if (v === null || v === undefined || v === "") return undefined;
    if (v instanceof Date) return v.toISOString().split("T")[0];
    return v;
  });

/**
 * YAML の型自動変換に対応する文字列フィールド。
 * 数値 (740) / 真偽値 (yes) / null を全て文字列に変換。
 */
const yamlString = z.string().or(z.number()).or(z.boolean()).nullable()
  .transform((v) => (v === null || v === undefined) ? "" : String(v));

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

const schedule = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/schedule" }),
  schema: z.object({
    dates: z.array(
      z.object({
        date: requiredDate,
        startTime: yamlString,
        endTime: yamlString,
        room: yamlString,
        venue: z.object({ ja: z.string(), en: z.string() }).nullable().optional(),
        eventName: optionalI18n,
        formspreeId: nullableString,
        applicationOpenFrom: optionalDate,
        applicationCloseAt: optionalDate,
        note: optionalI18n,
      })
    ),
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

export const collections = { schedule, tournaments, lessons, links, site, announcements };
