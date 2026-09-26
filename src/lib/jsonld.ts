import type { CollectionEntry } from "astro:content";
import { t, getLocalePath, type Locale } from "@/i18n";
import { getEventName, groupScheduleDates, type ScheduleDate } from "@/lib/schedule";

const CLUB_ID = "https://sapporochessclub.com/#club";
const WEBSITE_ID = "https://sapporochessclub.com/#website";

/** HTML 内の script 終端として解釈されないようにする。 */
function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

type SiteData = CollectionEntry<"site">["data"];

/**
 * WebSite JSON-LD: Google 検索結果の「サイト名」表示に使われる。
 * https://developers.google.com/search/docs/appearance/site-names
 * これがないと検索結果がドメイン名（sapporochessclub.com）のまま表示されがち。
 */
export function buildWebsiteJsonLd(locale: Locale): string {
  const i = t(locale);
  return serializeJsonLd({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    publisher: { "@id": CLUB_ID },
    name: i.site.name,
    alternateName: i.site.alternateName,
    url: "https://sapporochessclub.com/",
    inLanguage: locale === "ja" ? "ja-JP" : "en-US",
  });
}

/** SportsClub JSON-LD: クラブ本体の構造化データ（TOP ページ用）。 */
export function buildClubJsonLd(locale: Locale, site: SiteData, astroSite: URL | undefined): string {
  const i = t(locale);
  const clubLogoUrl = new URL("/icon-512.png", astroSite).toString();
  const clubImageUrl = new URL("/images/og.webp", astroSite).toString();
  return serializeJsonLd({
    "@context": "https://schema.org",
    "@type": "SportsClub",
    "@id": CLUB_ID,
    name: i.site.name,
    alternateName: i.site.alternateName,
    description: i.site.description,
    url: "https://sapporochessclub.com/",
    logo: clubLogoUrl,
    image: clubImageUrl,
    sport: "Chess",
    // 本文で確認できるのは「1990年代」。設立年を推測して出力しない。
    sameAs: ["https://x.com/SapporoChess"],
    ...(site.email && { email: site.email }),
    address: {
      "@type": "PostalAddress",
      streetAddress: site.venue.address[locale],
      addressLocality: "Sapporo",
      addressRegion: "Hokkaido",
      addressCountry: "JP",
    },
    // geo / areaServed: 「near me」検索や Knowledge Panel の地図表示精度を上げる。
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.venue.geo.latitude,
      longitude: site.venue.geo.longitude,
    },
    areaServed: [
      { "@type": "City", name: "Sapporo" },
      { "@type": "AdministrativeArea", name: "Hokkaido" },
    ],
    location: {
      "@type": "Place",
      name: site.venue.name[locale],
      address: site.venue.address[locale],
      geo: {
        "@type": "GeoCoordinates",
        latitude: site.venue.geo.latitude,
        longitude: site.venue.geo.longitude,
      },
    },
  });
}

/**
 * 大会を Event としてマークアップ（過去含む、スケジュールページ用）。
 * 連続日の同一大会は groupScheduleDates で 1 イベントにまとめる（表示側と同じ規則）。
 * startDate = 初日の開始時刻, endDate = 最終日の終了時刻。
 * 大会が 1 件もなければ null。
 */
export function buildEventsJsonLd(
  locale: Locale,
  tournaments: ScheduleDate[],
  site: SiteData,
  astroSite: URL | undefined,
): string | null {
  const i = t(locale);
  const ogImage = new URL("/images/og.webp", astroSite).toString();

  const groups = groupScheduleDates(tournaments);
  if (groups.length === 0) return null;

  return serializeJsonLd(groups.map((group) => {
    const first = group[0];
    const last = group[group.length - 1];
    const name = getEventName(first, locale);
    // groupScheduleDates は cancelled をキーに含めるのでグループ内で必ず一致する
    const cancelled = first.cancelled === true;

    return {
      "@context": "https://schema.org",
      "@type": "Event",
      name,
      ...(first.announcementSlug && {
        url: new URL(getLocalePath(locale, `/announcements/${first.announcementSlug}/`), astroSite).toString(),
      }),
      startDate: first.startTime ? `${first.date}T${first.startTime}:00+09:00` : first.date,
      endDate: last.endTime ? `${last.date}T${last.endTime}:00+09:00` : last.date,
      description: `${name} — ${site.venue.name[locale]}`,
      image: ogImage,
      location: {
        "@type": "Place",
        name: site.venue.name[locale],
        address: {
          "@type": "PostalAddress",
          streetAddress: site.venue.address[locale],
          addressLocality: "Sapporo",
          addressRegion: "Hokkaido",
          addressCountry: "JP",
        },
      },
      organizer: {
        "@type": "SportsClub",
        "@id": CLUB_ID,
        name: i.site.name,
        url: "https://sapporochessclub.com/",
      },
      // 大会別の料金・受付開始・空席は未管理。例会料金や推定値を流用しない。
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      eventStatus: cancelled
        ? "https://schema.org/EventCancelled"
        : "https://schema.org/EventScheduled",
    };
  }));
}

/**
 * NewsArticle JSON-LD: お知らせをニュース記事としてマークアップ。
 * inLanguage と isAccessibleForFree を明示することで多言語サイトとしての
 * 理解を助け、rich result 適格性を上げる。
 */
export function buildNewsArticleJsonLd(args: {
  locale: Locale;
  contentLocale?: Locale;
  title: string;
  description: string;
  /** frontmatter の date ("YYYY-MM-DD") */
  date: string;
  canonicalUrl: string;
  astroSite: URL | undefined;
}): string {
  const { locale, contentLocale = locale, title, description, date, canonicalUrl, astroSite } = args;
  const i = t(locale);
  const ogImage = new URL("/images/og.webp", astroSite).toString();
  const datePublishedIso = `${date}T00:00:00+09:00`;
  return serializeJsonLd({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${canonicalUrl}#article`,
    headline: title,
    description,
    datePublished: datePublishedIso,
    // 更新日を管理していないため、公開日を更新日と見なさない。
    inLanguage: contentLocale === "ja" ? "ja-JP" : "en-US",
    isAccessibleForFree: true,
    image: [ogImage],
    url: canonicalUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    author: {
      "@type": "SportsClub",
      "@id": CLUB_ID,
      name: i.site.name,
      url: "https://sapporochessclub.com/",
    },
    publisher: {
      "@type": "SportsClub",
      "@id": CLUB_ID,
      name: i.site.name,
      url: "https://sapporochessclub.com/",
      logo: {
        "@type": "ImageObject",
        url: new URL("/icon-512.png", astroSite).toString(),
      },
    },
  });
}
