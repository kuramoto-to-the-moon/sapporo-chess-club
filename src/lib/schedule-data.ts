import { getCollection } from "astro:content";
import { parseDate, startOfTodayJST } from "@/lib/date";
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

/**
 * build 時の JST「今日」以降のイベントだけを返す。
 * client:idle で渡す props を最小化するために使う。
 */
export async function getUpcomingScheduleDates(limit?: number): Promise<ScheduleDate[]> {
  const all = await getSortedScheduleDates();
  const today = startOfTodayJST();
  const upcoming = all.filter((d) => parseDate(d.date) >= today);
  return limit ? upcoming.slice(0, limit) : upcoming;
}
