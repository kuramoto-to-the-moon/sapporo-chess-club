/**
 * サイト全体で共有するナビゲーションページの定義。
 *
 * Header (デスクトップ top nav) と HamburgerMenu (モバイル全画面メニュー) の
 * 両方から参照される。ページを増やすときはここを 1 箇所だけ編集すれば両方に反映される。
 */
import { t, getLocalePath, type Locale } from "@/i18n";

export interface NavPage {
  /** 表示名 (ロケール依存) */
  label: string;
  /** HamburgerMenu で表示するサブタイトル (セクション名) */
  section: string;
  /** 遷移先 URL (base path 込み) */
  href: string;
  /** aria-current 判定に使う正規化済みパス。例: "/", "/schedule" */
  path: string;
}

export function getNavPages(locale: Locale): NavPage[] {
  const i = t(locale);
  return [
    { label: i.nav.home, section: i.sections.home, href: getLocalePath(locale, "/"), path: "/" },
    { label: i.announcements.label, section: i.sections.announcements, href: getLocalePath(locale, "/announcements"), path: "/announcements" },
    { label: i.schedule.label, section: "SCHEDULE", href: getLocalePath(locale, "/schedule"), path: "/schedule" },
    { label: i.nav.tournaments, section: i.sections.tournaments, href: getLocalePath(locale, "/tournaments"), path: "/tournaments" },
  ];
}

/** Header の top nav で表示するページ (home を除く) */
export function getTopNavPages(locale: Locale): NavPage[] {
  return getNavPages(locale).filter((p) => p.path !== "/");
}
