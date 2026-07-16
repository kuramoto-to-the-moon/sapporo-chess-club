import { t, type Locale } from "@/i18n";

export interface ScheduleDate {
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  type?: "meeting" | "tournament";
  eventName?: { ja: string; en: string };
  note?: { ja: string; en: string };
  announcementSlug?: string;
  cancelled?: boolean;
  chessResults?: string;
}

/**
 * イベントの表示名を取得する。
 * - tournament: eventName を使う。無ければ "大会" フォールバック
 * - meeting: "例会" / "Meeting"
 */
export function getEventName(date: ScheduleDate, locale: Locale): string {
  const i = t(locale);
  if (date.type !== "tournament") return i.badge.meetingTag;
  if (date.eventName?.[locale]) return date.eventName[locale];
  if (date.eventName?.ja) return date.eventName.ja;
  return i.badge.tournamentTag;
}

/**
 * メタ行の各部品を返す。表示側で余白区切りの flex 項目として並べる。
 * room が未入力 (CMS で空欄) の場合は roomSuffix を付けず roomTbd ("未定") にする。
 */
export function formatScheduleMeta(date: ScheduleDate, locale: Locale): { timeRange: string; roomLabel: string } {
  const i = t(locale);
  const roomLabel = date.room ? `${date.room}${i.schedule.roomSuffix}` : i.schedule.roomTbd;
  return { timeRange: `${date.startTime}–${date.endTime}`, roomLabel };
}

/**
 * Pages CMS reference の保存値 (例: "src/content/announcements/2026-06-29-75.md")
 * から announcements の slug ("2026-06-29-75") を取り出す。
 * slug 単体が渡された場合もそのまま返る。
 */
export function announcementPathToSlug(path: string): string {
  const base = path.split("/").pop() ?? path;
  return base.replace(/\.md$/, "");
}
