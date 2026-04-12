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
    .flatMap((s) => {
      // ファイル名から type を判定。YAML に type フィールドを持たせる必要がない。
      const type = s.id.includes("tournament") ? "tournament" as const : "meeting" as const;
      return s.data.dates.map((d) => ({ ...d, type }));
    })
    .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());
}

/**
 * build 時の JST「今日」以降のイベントだけを返す。
 * 先頭 N 件だけ必要な場合に使う。
 */
export async function getUpcomingScheduleDates(limit?: number): Promise<ScheduleDate[]> {
  const all = await getSortedScheduleDates();
  const today = startOfTodayJST();
  const upcoming = all.filter((d) => parseDate(d.date) >= today);
  return limit ? upcoming.slice(0, limit) : upcoming;
}
