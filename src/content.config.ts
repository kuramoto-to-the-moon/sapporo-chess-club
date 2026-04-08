import { defineCollection, z } from "astro:content";
import { glob, file } from "astro/loaders";

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
    title: z.object({ ja: z.string(), en: z.string() }),
    date: z.string(),
    venue: z.object({ ja: z.string(), en: z.string() }).optional(),
    detailsPdf: z.string().optional(),
    resultsPdf: z.string().optional(),
    gamesPgn: z.string().optional(),
    gamesPgnAnnotated: z.string().optional(),
    year: z.number(),
    sortOrder: z.number().optional(),
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
    }),
    date: z.string(),
    bodyEn: z.string().optional(),
  }),
});

export const collections = { schedule, tournaments, lessons, links, site, announcements };
