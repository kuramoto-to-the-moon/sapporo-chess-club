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
              <div className="flex flex-wrap items-baseline gap-x-4">
                <span>{formatDate(date.date, date.dayOfWeek[locale], locale)}</span>
                <span className="text-[#a3a3a3] whitespace-nowrap">
                  {date.startTime}
                </span>
                <span className="text-[#a3a3a3] whitespace-nowrap">
                  {date.room}{locale === "ja" ? "室" : ""}
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
        <div className="relative pl-16 mt-2">
          <div className="absolute left-[60px] top-2 bottom-2 w-px bg-[#e5e5e5]" />
          {groupedByMonth.map(({ key, dates: monthDates }) => {
            const hasTournament = monthDates.some((d) => d.type === "tournament");
            const dotColor = hasTournament ? "bg-[#dc2626]" : "bg-[#2563eb]";
            const monthLabel = locale === "ja"
              ? `${parseInt(key.split("-")[1])}月`
              : new Date(`${key}-01`).toLocaleDateString("en", { month: "short" });
            return (
              <div key={key} className="relative mb-6">
                <div className="absolute -left-16 top-0 w-10 text-right text-sm font-semibold text-[#a3a3a3]">
                  {monthLabel}
                </div>
                <div className={`absolute -left-[19px] top-1.5 w-[9px] h-[9px] rounded-full border-2 border-white ${dotColor}`} />
                <div className="flex flex-col gap-1.5">
                  {monthDates.map((date, idx) => {
                    const d = new Date(date.date);
                    const day = d.getDate();
                    const isTournament = date.type === "tournament";
                    return (
                      <div key={date.date + idx} className="text-sm">
                        <div className="flex flex-wrap items-baseline gap-x-3">
                          <span className={isTournament ? "font-semibold" : ""}>
                            {day}{locale === "ja" ? "日" : ""} {date.dayOfWeek[locale]}
                          </span>
                          <span className="text-[#a3a3a3] whitespace-nowrap">
                            {isTournament
                              ? (locale === "ja" ? "大会" : "Tournament")
                              : (locale === "ja" ? "例会" : "Meeting")}
                          </span>
                          <span className="text-[#a3a3a3] whitespace-nowrap">
                            {date.room}{locale === "ja" ? "室" : ""}
                          </span>
                        </div>
                        {date.note && (
                          <p className="text-[#a3a3a3] text-xs mt-0.5">{date.note[locale]}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {dates.length > 5 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="mt-4 text-sm text-[#2563eb] hover:text-[#1d4ed8] transition-colors duration-150 cursor-pointer font-medium"
        >
          {showAll ? `${i.schedule.collapse} ↑` : `${i.schedule.viewAll} ↓`}
        </button>
      )}
    </div>
  );
}
