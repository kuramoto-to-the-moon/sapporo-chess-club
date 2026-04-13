import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { t } from "@/i18n";
import { parseDate } from "@/lib/date";
import { withBase } from "@/lib/utils";
import {
  getSortedAnnouncements,
  pickTitle,
  pickDescription,
} from "@/lib/announcement";

const i = t("en");

export async function GET(context: APIContext) {
  const items = await getSortedAnnouncements();
  return rss({
    title: i.rss.title,
    description: i.rss.description,
    site: new URL(import.meta.env.BASE_URL, context.site!).toString(),
    stylesheet: withBase("/rss-styles-en.xsl")!,
    items: items.map((item) => ({
      title: pickTitle(item, "en"),
      description: pickDescription(item, "en"),
      pubDate: parseDate(item.data.date),
      link: withBase(`/en/announcements/${item.id}/`)!,
    })),
  });
}
