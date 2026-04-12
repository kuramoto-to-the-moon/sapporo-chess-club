import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * CMS の type: date フィールドは YAML に引用符なしの日付 (例: 2026-03-16) を
 * 書き出す。YAML パーサーはこれを Date オブジェクトに変換するが、アプリ内では
 * "YYYY-MM-DD" 文字列として扱いたい。この zod スキーマで両方を受け入れて
 * 文字列に正規化する。
 */
const dateString = z.union([z.string(), z.date()]).transform((v) =>
  v instanceof Date ? v.toISOString().split("T")[0] : v
);

/**
 * YAML は引用符なしの数値 (740) や真偽値 (yes/no) を自動変換する。
 * CMS が string フィールドを保存する際に引用符が外れると z.string() が壊れる。
 * string / number / boolean どれが来ても文字列に正規化する。
 */
const yamlString = z.union([z.string(), z.number(), z.boolean()]).transform(String);

const schedule = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/schedule" }),
  schema: z.object({
    dates: z.array(
      z.object({
        date: dateString,
        startTime: yamlString,
        endTime: yamlString,
        room: yamlString,
        venue: z.object({ ja: z.string(), en: z.string() }).optional(),
        type: z.enum(["meeting", "tournament"]).default("meeting"),
        series: z.enum(["hokkaido-championship", "summer", "autumn", "other"]).optional(),
        edition: z.number().optional(),
        /** 表示名の手動オーバーライド。series=other の場合は必須。 */
        eventName: z.object({ ja: z.string(), en: z.string() }).optional(),
        formspreeId: z.string().optional(),
        applicationOpenFrom: dateString.optional(),
        applicationCloseAt: dateString.optional(),
        note: z.object({ ja: z.string(), en: z.string() }).optional(),
      })
    ),
  }),
});

const tournaments = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/tournaments" }),
  schema: z.object({
    series: z.enum(["hokkaido-championship", "summer", "autumn", "other"]),
    edition: z.number().optional(),
    /**
     * 表示名の手動オーバーライド。設定されていればこれを優先表示。
     * 古いエントリは元のタイトルが残っているのでこちらが使われる。
     * 新しく CMS で追加するエントリは未設定のままにすれば series + year +
     * edition から自動生成される。series=other の場合は必須。
     */
    title: z.object({ ja: z.string(), en: z.string() }).optional(),
    date: dateString,
    detailsPdf: z.string().optional(),
    resultsPdf: z.string().optional(),
    gamesPgn: z.string().optional(),
    gamesPgnAnnotated: z.string().optional(),
  }),
});

const lessons = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/lessons" }),
  schema: z.object({
    title: z.object({ ja: z.string(), en: z.string() }),
    description: z.object({ ja: z.string(), en: z.string() }),
    url: z.url().optional(),
  }),
});

const links = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/links" }),
  schema: z.object({
    links: z.array(
      z.object({
        title: z.object({ ja: z.string(), en: z.string() }),
        url: z.url(),
      })
    ),
  }),
});

const site = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/site" }),
  schema: z.object({
    email: z.email(),
    phone: yamlString,
    venue: z.object({
      name: z.object({ ja: z.string(), en: z.string() }),
      floor: yamlString,
      address: z.object({ ja: z.string(), en: z.string() }),
      access: z.object({ ja: z.string(), en: z.string() }),
    }),
    fee: z.object({
      general: z.number(),
      student: z.number(),
    }),
  }),
});

const announcements = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/announcements" }),
  schema: z.object({
    title: z.object({
      ja: z.string(),
      en: z.string().optional(),
    }),
    description: z.object({
      ja: z.string(),
      en: z.string().optional(),
    }).optional(),
    date: dateString,
    bodyEn: z.string().optional(),
  }),
});

export const collections = { schedule, tournaments, lessons, links, site, announcements };
