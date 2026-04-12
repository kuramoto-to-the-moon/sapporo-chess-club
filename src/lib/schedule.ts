import { t, type Locale } from "@/i18n";

export interface ScheduleDate {
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  type?: "meeting" | "tournament";
  eventName?: { ja: string; en: string };
  formspreeId?: string;
  note?: { ja: string; en: string };
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
