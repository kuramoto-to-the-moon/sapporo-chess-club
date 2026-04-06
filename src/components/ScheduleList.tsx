import { useState } from "react";
import { t, type Locale } from "@/i18n";

interface ScheduleDate {
  date: string;
  dayOfWeek: { ja: string; en: string };
  startTime: string;
  endTime: string;
  room: string;
  venue: { ja: string; en: string };
  type: "meeting" | "tournament";
  note?: { ja: string; en: string };
}

interface Props {
  dates: ScheduleDate[];
  locale: Locale;
}

function formatDate(dateStr: string, dow: string, locale: Locale): string {
  const d = new Date(dateStr);
  if (locale === "ja") {
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${dow}`;
  }
  return `${d.toLocaleDateString("en", { month: "short" })} ${d.getDate()}, ${d.getFullYear()} ${dow}`;
}

function getMonthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthHeading(monthKey: string, locale: Locale): string {
  const [year, month] = monthKey.split("-");
  if (locale === "ja") {
    return `${year}年${parseInt(month)}月`;
  }
  const d = new Date(`${monthKey}-01`);
  return d.toLocaleDateString("en", { year: "numeric", month: "long" });
}

export default function ScheduleList({ dates, locale }: Props) {
  const [showAll, setShowAll] = useState(false);
  const i = t(locale);

  const collapsedDates = dates.slice(0, 5);
  const displayDates = showAll ? dates : collapsedDates;

  // Group by month for expanded view
  const groupedByMonth: { key: string; dates: ScheduleDate[] }[] = [];
  if (showAll) {
    const monthMap = new Map<string, ScheduleDate[]>();
    for (const d of dates) {
      const key = getMonthKey(d.date);
      if (!monthMap.has(key)) monthMap.set(key, []);
      monthMap.get(key)!.push(d);
    }
    for (const [key, monthDates] of monthMap) {
      groupedByMonth.push({ key, dates: monthDates });
    }
  }

  return (
    <div className="text-sm">
      {!showAll && (
        <div>
          {collapsedDates.map((date, idx) => (
            <div
              key={date.date + idx}
              className={`py-2 ${idx < collapsedDates.length - 1 ? "border-b border-[#f5f5f5]" : ""}`}
            >
              <div className="flex justify-between gap-3">
                <span>{formatDate(date.date, date.dayOfWeek[locale], locale)}</span>
                <span className="text-[#a3a3a3] whitespace-nowrap">
                  {date.startTime} / {date.room}{locale === "ja" ? "室" : ""}
                </span>
              </div>
              {date.note && (
                <p className="text-[#a3a3a3] text-xs mt-1">{date.note[locale]}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {showAll && (
        <div>
          {groupedByMonth.map(({ key, dates: monthDates }) => (
            <div key={key} className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#a3a3a3] mb-1.5 mt-2">
                {formatMonthHeading(key, locale)}
              </p>
              {monthDates.map((date, idx) => (
                <div
                  key={date.date + idx}
                  className={`py-2 ${idx < monthDates.length - 1 ? "border-b border-[#f5f5f5]" : ""}`}
                >
                  <div className="flex justify-between gap-3">
                    <span>{formatDate(date.date, date.dayOfWeek[locale], locale)}</span>
                    <span className="text-[#a3a3a3] whitespace-nowrap">
                      {date.startTime} / {date.room}{locale === "ja" ? "室" : ""}
                    </span>
                  </div>
                  {date.note && (
                    <p className="text-[#a3a3a3] text-xs mt-1">{date.note[locale]}</p>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {dates.length > 5 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="mt-3 text-xs text-[#a3a3a3] hover:text-[#525252] transition-colors duration-150 cursor-pointer"
        >
          {showAll ? `${i.schedule.collapse} ↑` : `${i.schedule.viewAll} ↓`}
        </button>
      )}
    </div>
  );
}
