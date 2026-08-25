import { t, type Locale } from "@/i18n";
import { parseDate } from "@/lib/date";

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

/** 連続日の同一大会をまとめた 1 エントリ。単日イベントは要素 1 件。 */
export type ScheduleGroup = ScheduleDate[];

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
 * 結合キー。null を返した日程は決して他と結合しない。
 *
 * 大会に限るのは、例会の表示名が全て "例会" で同一になるため
 * (連続日の例会が 1 エントリに潰れてしまう)。
 * eventName 未入力を弾くのは、getEventName のフォールバックで
 * 無関係な大会同士が同名判定されるため。
 */
function mergeKey(date: ScheduleDate): string | null {
  if (date.type !== "tournament") return null;
  const name = date.eventName?.ja;
  if (!name) return null;
  return JSON.stringify([name, date.cancelled === true]);
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** JST 基準で b が a の翌日か。日本に DST は無いので固定 24h で判定できる。 */
function isNextDay(a: string, b: string): boolean {
  return parseDate(b).getTime() - parseDate(a).getTime() === DAY_MS;
}

/**
 * 日付昇順の日程を、連続日の同一大会ごとに 1 グループへまとめる。
 * 結合するのは mergeKey が一致し、かつ日付が連続しているときだけ。
 * cancelled はキーに含めるので、初日だけ中止のような場合は結合されず分かれる。
 *
 * 同じ日に例会と大会が並ぶと大会同士が隣接しないため、直前の要素ではなく
 * キーで引いたグループの最終日と比較する。
 */
export function groupScheduleDates(dates: ScheduleDate[]): ScheduleGroup[] {
  const groups: ScheduleGroup[] = [];
  const openByKey = new Map<string, ScheduleGroup>();

  for (const date of dates) {
    const key = mergeKey(date);
    const open = key ? openByKey.get(key) : undefined;
    if (open && isNextDay(open[open.length - 1].date, date.date)) {
      open.push(date);
      continue;
    }
    const group: ScheduleGroup = [date];
    groups.push(group);
    if (key) openByKey.set(key, group);
  }
  return groups;
}

/**
 * 部屋の表示ラベル。room が未入力 (CMS で空欄) の場合は roomSuffix を付けず
 * roomTbd ("未定") にする。
 */
export function formatRoomLabel(date: ScheduleDate, locale: Locale): string {
  const i = t(locale);
  return date.room ? `${date.room}${i.schedule.roomSuffix}` : i.schedule.roomTbd;
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
