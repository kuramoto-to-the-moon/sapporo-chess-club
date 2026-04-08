import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { parseDate } from "@/lib/date";
import { withBase } from "@/lib/utils";
import { getSortedAnnouncements } from "@/lib/announcement";

export async function GET(context: APIContext) {
  const items = await getSortedAnnouncements();
  return rss({
    title: "札幌チェスクラブ お知らせ",
    description: "札幌チェスクラブの新着情報",
    site: new URL(import.meta.env.BASE_URL, context.site!).toString(),
    // ブラウザで開いた時に人間向けページとして見えるよう XSLT を適用。
    // RSS リーダーには引き続き生 XML が配信される。
    stylesheet: withBase("/rss-styles.xsl")!,
    items: items.map((item) => ({
      title: item.data.title.ja,
      description: item.data.description.ja,
      pubDate: parseDate(item.data.date),
      link: withBase(`/announcements/${item.id}/`)!,
    })),
  });
}
