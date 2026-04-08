import { t, type Locale } from "@/i18n";
import { getDateParts } from "@/lib/date";
import {
  getTournamentDisplayName,
  type TournamentSeries,
} from "@/lib/tournament-series";

export interface ScheduleDate {
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  venue: { ja: string; en: string };
  type?: "meeting" | "tournament";
  series?: TournamentSeries;
  edition?: number;
  /** series=other の場合 or 手動オーバーライド時のみ。 */
  eventName?: { ja: string; en: string };
  formspreeId?: string;
  applicationOpenFrom?: string;
  applicationCloseAt?: string;
  note?: { ja: string; en: string };
}

/**
 * イベントの表示名を取得する。
 * - tournament で series がある → series + year + edition から自動生成
 * - tournament で series=other or eventName 設定 → eventName を使用
 * - tournament で何も無い → "大会" / "Tournament"
 * - meeting → "例会" / "Meeting"
 */
export function getEventName(date: ScheduleDate, locale: Locale): string {
  const i = t(locale);
  if (date.type !== "tournament") return i.badge.meetingTag;
  if (date.series && date.series !== "other") {
    return getTournamentDisplayName(
      {
        series: date.series,
        year: getDateParts(date.date).year,
        edition: date.edition,
      },
      locale
    );
  }
  return date.eventName?.[locale] ?? i.badge.tournamentTag;
}
