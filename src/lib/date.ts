/**
 * 札幌チェスクラブ = 日本時間 (JST, UTC+9) を基準に日付を扱う。
 *
 * デフォルトの new Date("2026-04-15") は UTC 真夜中扱いになり、米州ユーザーが
 * 見ると 1 日前にズレてしまうため、明示的に JST のカレンダー日として解釈する。
 */

const JST_OFFSET = "+09:00";

/**
 * CMS の date 文字列を JST のカレンダー日として Date オブジェクトに変換する。
 * - "2026-04-15" のような date-only 形式 → JST 真夜中 (= 同日 15:00 UTC)
 * - "2026-04-15T18:30:00+09:00" のような完全な ISO 形式 → そのまま尊重
 */
export function parseDate(s: string): Date {
  if (/T|Z|[+-]\d{2}:?\d{2}$/.test(s)) return new Date(s);
  return new Date(`${s}T00:00:00${JST_OFFSET}`);
}

/**
 * 「今日の JST 0:00」を表す Date を返す。フィルタリングの基準として使う。
 * 例: 2026-04-15 14:00 JST に呼ぶと 2026-04-15 00:00 JST が返る。
 */
export function startOfTodayJST(): Date {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return new Date(`${fmt.format(new Date())}T00:00:00${JST_OFFSET}`);
}

/**
 * "2026-04-15" のような date-only 文字列から年/月/日 を取り出す。
 * Date オブジェクトを介さないのでタイムゾーンの影響を受けない。
 * 完全な ISO の場合は parseDate 経由で JST 換算した日付を返す。
 */
/**
 * "2026-04-15" のような date 文字列から曜日を返す。
 * JST のカレンダー日として解釈し、locale に応じた短縮表記を返す。
 * 例: ja → "日" / "月" / "火" ..., en → "Sun" / "Mon" / "Tue" ...
 */
export function getDayOfWeek(s: string, locale: "ja" | "en"): string {
  const fmt = new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "en-US", {
    timeZone: "Asia/Tokyo",
    weekday: "short",
  });
  // "月曜日" → "月" のため ja は 1 文字に切り詰める (Intl の ja-JP short は "月" を返すので実質そのまま)
  return fmt.format(parseDate(s));
}

/**
 * "2026-03-21" + (-2) -> "2026-03-19" のように JST のカレンダー上で日数を加減した
 * date-only 文字列を返す。タイムゾーン跨ぎでも JST の日付計算として安定。
 */
export function shiftDays(s: string, days: number): string {
  const d = parseDate(s);
  d.setUTCDate(d.getUTCDate() + days);
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(d);
}

export function getDateParts(s: string): { year: number; month: number; day: number } {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(s);
  if (dateOnly) {
    const [year, month, day] = s.split("-").map(Number);
    return { year, month, day };
  }
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [year, month, day] = fmt.format(parseDate(s)).split("-").map(Number);
  return { year, month, day };
}
