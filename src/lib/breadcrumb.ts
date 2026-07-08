import { t, getLocalePath, type Locale } from "@/i18n";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/** 全ページ共通の先頭「ホーム」項目。 */
export function homeCrumb(locale: Locale, site: URL | undefined): BreadcrumbItem {
  return {
    name: t(locale).nav.home,
    url: new URL(getLocalePath(locale, "/"), site).toString(),
  };
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  });
}
