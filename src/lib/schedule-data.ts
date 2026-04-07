import { getCollection } from "astro:content";
import { parseDate } from "@/lib/date";
import type { ScheduleDate } from "@/lib/schedule";

/**
 * 全 schedule コレクションから日付を取り出し、JST 基準で昇順ソートして返す。
 * Astro frontmatter (server-only) 専用。
 */
export async function getSortedScheduleDates(): Promise<ScheduleDate[]> {
  const data = await getCollection("schedule");
  return data
    .flatMap((s) => s.data.dates)
    .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());
}
