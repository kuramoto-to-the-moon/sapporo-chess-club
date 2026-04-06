import { t, type Locale } from "@/i18n";

interface ScheduleDate {
  date: string;
  dayOfWeek: { ja: string; en: string };
  startTime: string;
  endTime: string;
  room: string;
  venue: { ja: string; en: string };
  type?: "meeting" | "tournament";
  eventName?: { ja: string; en: string };
  note?: { ja: string; en: string };
}

interface Props {
  dates: ScheduleDate[];
  locale: Locale;
  scheduleHref: string;
}

export default function UpcomingScheduleList({ dates, locale, scheduleHref }: Props) {
  const i = t(locale);
  const now = new Date();

  const upcoming = dates
    .filter((d) => new Date(d.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  if (upcoming.length === 0) {
    return (
      <p className="text-sm text-[#737373]">
        {locale === "ja" ? "予定されているイベントはありません。" : "No upcoming events."}
      </p>
    );
  }

  return (
    <>
      <ul className="flex flex-col">
        {upcoming.map((date, idx) => {
          const d = new Date(date.date);
          const month = d.getMonth() + 1;
          const day = d.getDate();
          const isTournament = date.type === "tournament";
          return (
            <li
              key={`${date.date}-${idx}`}
              className="flex items-center gap-4 py-3 border-b border-[#f5f5f5] last:border-0"
            >
              <div className="flex items-baseline gap-1.5 min-w-[80px]">
                <span
                  className={`text-2xl font-bold leading-none ${
                    isTournament ? "text-[#2563eb]" : "text-[#171717]"
                  }`}
                >
                  {month}/{day}
                </span>
                <span className="text-xs text-[#737373]">({date.dayOfWeek[locale]})</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold flex items-center gap-2 flex-wrap">
                  {isTournament && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-[#2563eb] text-white font-semibold">
                      {locale === "ja" ? "大会" : "Tournament"}
                    </span>
                  )}
                  <span>
                    {isTournament
                      ? date.eventName?.[locale] ?? (locale === "ja" ? "大会" : "Tournament")
                      : locale === "ja"
                      ? "例会"
                      : "Meeting"}
                  </span>
                </p>
                <p className="text-xs text-[#737373] mt-1">
                  {date.startTime}–{date.endTime} / {date.room}
                  {locale === "ja" ? "室" : ""}
                </p>
                {date.note && (
                  <p className="text-xs text-[#737373] mt-1">{date.note[locale]}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <a
        href={scheduleHref}
        className="inline-block mt-4 text-sm text-[#2563eb] hover:text-[#1d4ed8] transition-colors duration-150 font-medium"
      >
        {i.schedule.viewFullSchedule}
      </a>
    </>
  );
}
