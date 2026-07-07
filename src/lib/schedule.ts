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
 * Pages CMS reference の保存値 (例: "src/content/announcements/2026-06-29-75.md")
 * から announcements の slug ("2026-06-29-75") を取り出す。
 * slug 単体が渡された場合もそのまま返る。
 */
export function announcementPathToSlug(path: string): string {
  const base = path.split("/").pop() ?? path;
  return base.replace(/\.md$/, "");
}
