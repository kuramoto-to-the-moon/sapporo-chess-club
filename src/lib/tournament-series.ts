import type { Locale } from "@/i18n";

export type TournamentSeries =
  | "hokkaido-championship"
  | "summer"
  | "autumn"
  | "other";

const SERIES_NAMES: Record<Exclude<TournamentSeries, "other">, { ja: string; en: string }> = {
  "hokkaido-championship": {
    ja: "北海道チェス選手権",
    en: "Hokkaido Chess Championship",
  },
  summer: {
    ja: "札幌サマーチェス大会",
    en: "Sapporo Summer Chess Tournament",
  },
  autumn: {
    ja: "札幌オータムチェス大会",
    en: "Sapporo Autumn Chess Tournament",
  },
};

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

interface DisplayNameInput {
  series: TournamentSeries;
  year: number;
  edition?: number;
  /** 手動オーバーライド or series=other の場合の表示名。set されていれば最優先。 */
  override?: { ja: string; en: string };
}

/**
 * 大会の表示名を組み立てる。
 * - override が設定されていればそれを使う (古いエントリ互換)
 * - series=other は override 必須 (空文字列を返す)
 * - その他 series は `${year}年${seriesName}（第${edition}回）` (ja)
 *   または `${year} ${seriesName} (${ordinal(edition)})` (en)
 */
export function getTournamentDisplayName(input: DisplayNameInput, locale: Locale): string {
  if (input.override) return input.override[locale];
  if (input.series === "other") return "";
  const base = SERIES_NAMES[input.series][locale];
  const editionPart = input.edition
    ? locale === "ja"
      ? `（第${input.edition}回）`
      : ` (${ordinal(input.edition)})`
    : "";
  return locale === "ja"
    ? `${input.year}年${base}${editionPart}`
    : `${input.year} ${base}${editionPart}`;
}
