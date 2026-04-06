import { useState, useEffect } from "react";
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
}

interface Props {
  dates: ScheduleDate[];
  locale: Locale;
}

export default function NextEvent({ dates, locale }: Props) {
  const i = t(locale);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  if (!now) {
    // Server render placeholder to keep layout stable
    return <section className="px-5 py-6 border-t border-[#f5f5f5] min-h-[120px]" />;
  }

  const next = dates
    .filter((d) => new Date(d.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  if (!next) return null;

  const d = new Date(next.date);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const isTournament = next.type === "tournament";
  const title = isTournament
    ? next.eventName?.[locale] ?? (locale === "ja" ? "大会" : "Tournament")
    : `${next.dayOfWeek[locale]}${locale === "ja" ? "曜日" : ""}`;

  return (
    <section className="px-5 py-6 border-t border-[#f5f5f5] animate-fade-in-up">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="inline-block w-1 h-3 bg-[#2563eb]" />
        <span className="text-sm font-semibold uppercase tracking-wider text-[#737373]">
          {isTournament ? i.nextEvent.event : i.nextEvent.meeting}
        </span>
        {isTournament && (
          <span className="bg-[#2563eb] text-white text-xs px-1.5 py-0.5 rounded font-semibold">
            {i.badge.tournamentTag}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2.5">
        <span className="text-5xl font-extralight leading-none text-[#2563eb]">
          {month}/{day}
        </span>
        <div>
          <p className="text-base font-semibold">{title}</p>
          <p className="text-sm text-[#737373] mt-0.5 flex flex-wrap gap-x-3">
            <span>{next.startTime}–{next.endTime}</span>
            <span>{next.venue[locale]}</span>
            <span>{next.room}{locale === "ja" ? "室" : ""}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
