import type { CollectionEntry } from "astro:content";
import { t, type Locale } from "@/i18n";
import { parseDate } from "@/lib/date";
import { getEventName, groupScheduleDates, type ScheduleDate } from "@/lib/schedule";

type SiteData = CollectionEntry<"site">["data"];

/**
 * WebSite JSON-LD: Google 検索結果の「サイト名」表示に使われる。
 * https://developers.google.com/search/docs/appearance/site-names
 * これがないと検索結果がドメイン名（sapporochessclub.com）のまま表示されがち。
 */
export function buildWebsiteJsonLd(locale: Locale): string {
  const i = t(locale);
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: i.site.name,
    alternateName: i.site.alternateName,
    url: "https://sapporochessclub.com",
    inLanguage: locale === "ja" ? "ja-JP" : "en-US",
  });
}

/** SportsClub JSON-LD: クラブ本体の構造化データ（TOP ページ用）。 */
export function buildClubJsonLd(locale: Locale, site: SiteData, astroSite: URL | undefined): string {
  const i = t(locale);
  const clubLogoUrl = new URL("/icon-512.png", astroSite).toString();
  const clubImageUrl = new URL("/images/og.webp", astroSite).toString();
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SportsClub",
    name: i.site.name,
    alternateName: i.site.alternateName,
    description: i.site.description,
    url: "https://sapporochessclub.com",
    logo: clubLogoUrl,
    image: clubImageUrl,
    sport: "Chess",
    foundingDate: "1990",
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

  return JSON.stringify(groups.map((group) => {
    const first = group[0];
    const last = group[group.length - 1];
    const name = getEventName(first, locale);
    // groupScheduleDates は cancelled をキーに含めるのでグループ内で必ず一致する
    const cancelled = first.cancelled === true;

    return {
      "@context": "https://schema.org",
      "@type": "Event",
      name,
      startDate: `${first.date}T${first.startTime}:00+09:00`,
      endDate: `${last.date}T${last.endTime}:00+09:00`,
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
        name: i.site.name,
        url: "https://sapporochessclub.com",
      },
      // 中止した回に参加枠は無いので offers ごと落とす。
      // InStock のまま残すと eventStatus: EventCancelled と矛盾する。
      ...(cancelled ? {} : {
        offers: {
          "@type": "Offer",
          price: String(site.fee.general),
          priceCurrency: "JPY",
          availability: "https://schema.org/InStock",
          url: new URL(locale === "en" ? "/en/schedule" : "/schedule", astroSite).toString(),
          // Google Rich Results は validFrom を要求する。
          // 見学・当日参加 OK のため、開催日の 1 年前から有効とみなす（告知開始の近似）。
          validFrom: new Date(parseDate(first.date).getTime() - 365 * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 10),
        },
      }),
      performer: {
        "@type": "SportsTeam",
        name: i.site.name,
      },
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
  title: string;
  description: string;
  /** frontmatter の date ("YYYY-MM-DD") */
  date: string;
  canonicalUrl: string;
  astroSite: URL | undefined;
}): string {
  const { locale, title, description, date, canonicalUrl, astroSite } = args;
  const i = t(locale);
  const ogImage = new URL("/images/og.webp", astroSite).toString();
  const datePublishedIso = `${date}T00:00:00+09:00`;
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description,
    datePublished: datePublishedIso,
    dateModified: datePublishedIso,
    inLanguage: locale === "ja" ? "ja-JP" : "en-US",
    isAccessibleForFree: true,
    image: [ogImage],
    url: canonicalUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    author: {
      "@type": "Organization",
      name: i.site.name,
      url: "https://sapporochessclub.com",
    },
    publisher: {
      "@type": "Organization",
      name: i.site.name,
      url: "https://sapporochessclub.com",
      logo: {
        "@type": "ImageObject",
        url: new URL("/icon-512.png", astroSite).toString(),
      },
    },
  });
}
