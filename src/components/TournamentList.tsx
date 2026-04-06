import { useState } from "react";
import { t, type Locale } from "@/i18n";

interface Tournament {
  title: string;
  date: string;
  status: "upcoming" | "results";
  detailsPdf?: string;
  resultsPdf?: string;
  gamesPgn?: string;
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

  return (
    <div>
      {/* Year filter — select on mobile, buttons on desktop */}
      <div className="mb-8">
        <div className="sm:hidden">
          <label className="block text-xs uppercase tracking-wider text-[#a3a3a3] mb-2">
            {locale === "ja" ? "年で絞り込み" : "Filter by year"}
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="w-full px-3 py-2 rounded border border-[#e5e5e5] text-sm bg-white text-[#171717] focus:outline-none focus:border-[#2563eb] transition-colors duration-150"
          >
            <option value="all">{locale === "ja" ? "すべての年" : "All years"}</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}{locale === "ja" ? "年" : ""}</option>
            ))}
          </select>
        </div>
        <div className="hidden sm:flex flex-wrap gap-2">
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
      </div>

      {/* Tournament cards */}
      <div className="flex flex-col gap-4">
        {filtered.map((tournament, idx) => {
          const borderClass = "border-[#f5f5f5]";

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

            </div>
          );
        })}
      </div>
    </div>
  );
}
