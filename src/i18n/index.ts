import ja from "./ja";
import en from "./en";
import { withBase } from "@/lib/utils";

const translations = { ja, en } as const;

export type Locale = keyof typeof translations;

export function t(locale: Locale) {
  return translations[locale];
}

export function getLocalePath(locale: Locale, path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return withBase(locale === "en" ? `/en${cleanPath}` : cleanPath)!;
}
