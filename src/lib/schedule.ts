import { t, type Locale } from "@/i18n";

export interface ScheduleDate {
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  venue: { ja: string; en: string };
  type?: "meeting" | "tournament";
  eventName?: { ja: string; en: string };
  formspreeId?: string;
  applicationOpenFrom?: string;
  applicationCloseAt?: string;
  note?: { ja: string; en: string };
}

/**
 * イベントの表示名を取得する。トーナメントなら eventName を優先、
 * 無ければ "大会" / "Tournament"。例会なら "例会" / "Meeting"。
 */
export function getEventName(date: ScheduleDate, locale: Locale): string {
  const i = t(locale);
  if (date.type === "tournament") {
    return date.eventName?.[locale] ?? i.badge.tournamentTag;
  }
  return i.badge.meetingTag;
}
