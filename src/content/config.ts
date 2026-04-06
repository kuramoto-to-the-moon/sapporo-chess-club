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
        eventName: z.object({ ja: z.string(), en: z.string() }).optional(),
        formspreeId: z.string().optional(),
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
    status: z.enum(["upcoming", "results"]),
    detailsPdf: z.string().optional(),
    resultsPdf: z.string().optional(),
    gamesPgn: z.string().optional(),
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
