import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import type { Locale } from "@/i18n";
import { parseDate, getDateParts, startOfTodayJST } from "@/lib/date";

export type Announcement = CollectionEntry<"announcements">;

const ARCHIVE_AFTER_DAYS = 365;

/**
 * 全 announcement を新しい順 (date desc) で返す。
 * Astro frontmatter (server-only) 専用。
 */
export async function getSortedAnnouncements(): Promise<Announcement[]> {
  const all = await getCollection("announcements");
  return all.sort(
    (a, b) => parseDate(b.data.date).getTime() - parseDate(a.data.date).getTime()
  );
}

/** ビルド時点の JST 今日から ARCHIVE_AFTER_DAYS 日前を境界として返す。 */
function getArchiveCutoff(): Date {
  const today = startOfTodayJST();
  return new Date(today.getTime() - ARCHIVE_AFTER_DAYS * 24 * 60 * 60 * 1000);
}

/** 直近 365 日以内に公開されたお知らせ (新しい順)。 */
export async function getActiveAnnouncements(): Promise<Announcement[]> {
  const all = await getSortedAnnouncements();
  const cutoff = getArchiveCutoff();
  return all.filter((e) => parseDate(e.data.date) >= cutoff);
}

/** 365 日より前に公開されたお知らせ (新しい順)。アーカイブページ用。 */
export async function getArchivedAnnouncements(): Promise<Announcement[]> {
  const all = await getSortedAnnouncements();
  const cutoff = getArchiveCutoff();
  return all.filter((e) => parseDate(e.data.date) < cutoff);
}

export function pickTitle(entry: Announcement, locale: Locale): string {
  return locale === "ja"
    ? entry.data.title.ja
    : (entry.data.title.en ?? entry.data.title.ja);
}

export function pickDescription(entry: Announcement, locale: Locale): string {
  return locale === "ja"
    ? entry.data.description.ja
    : (entry.data.description.en ?? entry.data.description.ja);
}

/** en サイトで未翻訳エントリかどうか判定 (en === undefined) */
export function hasJaOnlyContent(entry: Announcement): boolean {
  return !entry.data.title.en;
}

/** "2026-04-12" -> "2026.04.12" */
export function formatAnnouncementDate(dateStr: string): string {
  const { year, month, day } = getDateParts(dateStr);
  return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")}`;
}

/**
 * /announcements/[slug] ja/en route から共有して使う getStaticPaths 実装。
 * `prev` は古い側、`next` は新しい側 (sort が desc なので index が大 = 古い)。
 */
export async function getAnnouncementStaticPaths() {
  const all = await getSortedAnnouncements();
  return all.map((entry, idx) => ({
    params: { slug: entry.id },
    props: {
      entry,
      prev: all[idx + 1] ?? null,
      next: all[idx - 1] ?? null,
    },
  }));
}
