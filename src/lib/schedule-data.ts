import { getCollection } from "astro:content";
import { parseDate, startOfTodayJST } from "@/lib/date";
import type { ScheduleDate } from "@/lib/schedule";

/**
 * 例会 + 大会を統合し、JST 基準で昇順ソートして返す。
 * コレクションが分かれているので type は collection 名から決定する。
 */
export async function getSortedScheduleDates(): Promise<ScheduleDate[]> {
  const [meetings, tournaments] = await Promise.all([
    getCollection("scheduleMeetings"),
    getCollection("scheduleTournaments"),
  ]);

  const meetingDates: ScheduleDate[] = meetings.map((m) => ({
    ...m.data,
    type: "meeting" as const,
  }));

  const tournamentDates: ScheduleDate[] = tournaments.map((t) => ({
    ...t.data,
    type: "tournament" as const,
  }));

  return [...meetingDates, ...tournamentDates]
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
