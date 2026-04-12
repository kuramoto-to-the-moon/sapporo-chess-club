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
 * 1. eventName があればそのまま使う (CMS から直接入力された名前)
 * 2. series + edition がある → 旧データ用の自動生成
 * 3. どちらも無い → "大会" / "Tournament" フォールバック
 * 4. meeting → "例会" / "Meeting"
 */
export function getEventName(date: ScheduleDate, locale: Locale): string {
  const i = t(locale);
  if (date.type !== "tournament") return i.badge.meetingTag;
  // 直接入力された大会名を最優先
  if (date.eventName?.[locale]) return date.eventName[locale];
  if (date.eventName?.ja) return date.eventName.ja;
  // 旧データ: series + edition から自動生成
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
  return i.badge.tournamentTag;
}
