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

const i = t("ja");

export async function GET(context: APIContext) {
  const items = await getSortedAnnouncements();
  return rss({
    title: i.rss.title,
    description: i.rss.description,
    site: new URL(import.meta.env.BASE_URL, context.site!).toString(),
    // ブラウザで開いた時に人間向けページとして見えるよう XSLT を適用。
    // RSS リーダーには引き続き生 XML が配信される。
    stylesheet: withBase("/rss-styles.xsl")!,
    items: items.map((item) => ({
      title: pickTitle(item, "ja"),
      description: pickDescription(item, "ja"),
      pubDate: parseDate(item.data.date),
      link: withBase(`/announcements/${item.id}/`)!,
    })),
  });
}
