import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { parseDate } from "@/lib/date";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const items = (await getCollection("announcements")).sort(
    (a, b) => parseDate(b.data.date).getTime() - parseDate(a.data.date).getTime()
  );
  return rss({
    title: "札幌チェスクラブ お知らせ",
    description: "札幌チェスクラブの新着情報",
    site: new URL(import.meta.env.BASE_URL, context.site!).toString(),
    items: items.map((item) => ({
      title: item.data.title.ja,
      description: item.data.description.ja,
      pubDate: parseDate(item.data.date),
      link: `${import.meta.env.BASE_URL}/announcements/${item.id}/`,
    })),
  });
}
