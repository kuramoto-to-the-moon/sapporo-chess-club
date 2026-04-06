import { useState } from "react";
import ApplicationForm from "@/components/ApplicationForm.tsx";
import { t, type Locale } from "@/i18n";

interface Tournament {
  title: string;
  date: string;
  status: "open" | "closed" | "upcoming" | "results";
  detailsPdf?: string;
  resultsPdf?: string;
  gamesPgn?: string;
  formspreeId?: string;
  year: number;
}

interface Props {
  tournaments: Tournament[];
  years: number[];
  locale: Locale;
}

export default function TournamentList({ tournaments, years, locale }: Props) {
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const i = t(locale);

  const filtered =
    selectedYear === "all"
      ? tournaments
      : tournaments.filter((t) => t.year === selectedYear);

  const badgeStyles: Record<string, string> = {
    open: "bg-[#2563eb] text-white",
    results: "bg-[#e5e5e5] text-[#525252]",
    closed: "bg-[#f5f5f5] text-[#a3a3a3]",
    upcoming: "bg-[#f5f5f5] text-[#a3a3a3]",
  };

  const badgeLabels: Record<string, string> = {
    open: i.badge.open,
    results: i.badge.results,
    closed: i.badge.closed,
    upcoming: i.badge.upcoming,
  };

  return (
    <div>
      {/* Year filter buttons */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedYear("all")}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors duration-150 cursor-pointer ${
            selectedYear === "all"
              ? "bg-[#2563eb] text-white"
              : "bg-[#fafafa] text-[#525252] hover:bg-[#f5f5f5]"
          }`}
        >
          {locale === "ja" ? "すべて" : "All"}
        </button>
        {years.map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors duration-150 cursor-pointer ${
              selectedYear === year
                ? "bg-[#2563eb] text-white"
                : "bg-[#fafafa] text-[#525252] hover:bg-[#f5f5f5]"
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Tournament cards */}
      <div className="flex flex-col gap-4">
        {filtered.map((tournament, idx) => {
          const isOpen = tournament.status === "open";
          const borderClass = isOpen ? "border-[#e5e5e5]" : "border-[#f5f5f5]";

          const fileLinks = [
            tournament.detailsPdf && { label: i.tournament.detailsPdf, href: tournament.detailsPdf },
            tournament.resultsPdf && { label: i.tournament.resultsPdf, href: tournament.resultsPdf },
            tournament.gamesPgn && { label: i.tournament.gamesPgn, href: tournament.gamesPgn },
          ].filter(Boolean) as { label: string; href: string }[];

          return (
            <div
              key={`${tournament.year}-${idx}`}
              className={`border ${borderClass} rounded-md p-4 animate-fade-in`}
            >
              <span
                className={`text-xs px-2 py-0.5 rounded font-semibold inline-block mb-2 ${badgeStyles[tournament.status]}`}
              >
                {badgeLabels[tournament.status]}
              </span>
              <p className="text-base font-semibold">{tournament.title}</p>
              <p className="text-sm text-[#a3a3a3] mt-1">{tournament.date}</p>

              {fileLinks.length > 0 && (
                <div className="mt-3.5">
                  {fileLinks.map((link, linkIdx) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex justify-between items-center py-3 px-2 -mx-2 rounded hover:bg-[#fafafa] transition-colors duration-150 ${
                        linkIdx < fileLinks.length - 1 ? "border-b border-[#f5f5f5]" : ""
                      }`}
                    >
                      <span className="text-sm">{link.label}</span>
                      <span className="text-[#a3a3a3]">→</span>
                    </a>
                  ))}
                </div>
              )}

              {isOpen && tournament.formspreeId && (
                <div className="mt-4">
                  <ApplicationForm
                    formspreeId={tournament.formspreeId}
                    tournamentName={tournament.title}
                    locale={locale}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
