import { t, type Locale } from "@/i18n";

/** Home の基本案内と重複しない参加前の補足。本文と llms.txt で共有する。 */
export function getFaqItems(locale: Locale) {
  const i = t(locale);
  return [
    { id: "belongings", ...i.faq.belongings },
    { id: "late-arrival", ...i.faq.lateArrival },
  ];
}
