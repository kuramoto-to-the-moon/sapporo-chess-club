import { getCollection } from "astro:content";
import { parseDate, startOfTodayJST } from "@/lib/date";
import { announcementPathToSlug, type ScheduleDate } from "@/lib/schedule";

/**
 * 例会 + 大会を統合し、JST 基準で昇順ソートして返す。
 * コレクションが分かれているので type は collection 名から決定する。
 * 大会の announcement (path) は announcements 照合済みの announcementSlug に解決する。
 */
export async function getSortedScheduleDates(): Promise<ScheduleDate[]> {
  const [meetings, tournaments, announcements] = await Promise.all([
    getCollection("scheduleMeetings"),
    getCollection("scheduleTournaments"),
    getCollection("announcements"),
  ]);
  const announcementIds = new Set(announcements.map((a) => a.id));

  const meetingDates: ScheduleDate[] = meetings.map((m) => ({
    ...m.data,
    type: "meeting" as const,
  }));

  const tournamentDates: ScheduleDate[] = tournaments.map((t) => {
    const { announcement, ...rest } = t.data;
    let announcementSlug: string | undefined;
    if (announcement) {
      const slug = announcementPathToSlug(announcement);
      if (announcementIds.has(slug)) {
        announcementSlug = slug;
      } else {
        console.warn(`[schedule] 関連お知らせが見つかりません: ${t.id} → ${announcement}`);
      }
    }
    return { ...rest, announcementSlug, type: "tournament" as const };
  });

  return [...meetingDates, ...tournamentDates]
    .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());
}

/**
 * build 時の JST「今日」以降・中止を除いたイベントを返す。
 * TOP (次回のイベント / スケジュール) 向け — 開催予定が確実なものだけを見せる。
 * 中止の記録は年間スケジュールページ (getSortedScheduleDates) 側にのみ残す。
 * 先頭 N 件だけ必要な場合に使う。
 */
export async function getUpcomingScheduleDates(limit?: number): Promise<ScheduleDate[]> {
  const all = await getSortedScheduleDates();
  const today = startOfTodayJST();
  const upcoming = all.filter((d) => parseDate(d.date) >= today && !d.cancelled);
  return limit ? upcoming.slice(0, limit) : upcoming;
}
