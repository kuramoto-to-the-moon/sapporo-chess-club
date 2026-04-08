import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const schedule = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/schedule" }),
  schema: z.object({
    dates: z.array(
      z.object({
        date: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        room: z.string(),
        venue: z.object({ ja: z.string(), en: z.string() }),
        type: z.enum(["meeting", "tournament"]).default("meeting"),
        series: z.enum(["hokkaido-championship", "summer", "autumn", "other"]).optional(),
        edition: z.number().optional(),
        /** 表示名の手動オーバーライド。series=other の場合は必須。 */
        eventName: z.object({ ja: z.string(), en: z.string() }).optional(),
        formspreeId: z.string().optional(),
        applicationOpenFrom: z.string().optional(),
        applicationCloseAt: z.string().optional(),
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
    date: z.string(),
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
