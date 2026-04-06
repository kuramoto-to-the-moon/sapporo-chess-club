import { useState } from "react";
import { t, type Locale } from "@/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      {/* Year filter — shadcn Select on mobile, buttons on desktop */}
      <div className="mb-8">
        <div className="sm:hidden">
          <label htmlFor="year-filter-select" className="block text-xs uppercase tracking-wider text-[#737373] mb-2">
            {locale === "ja" ? "年で絞り込み" : "Filter by year"}
          </label>
          <Select
            value={String(selectedYear)}
            onValueChange={(v) => setSelectedYear(v === "all" ? "all" : Number(v))}
          >
            <SelectTrigger id="year-filter-select" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{locale === "ja" ? "すべての年" : "All years"}</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}{locale === "ja" ? "年" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="hidden sm:flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedYear("all")}
            aria-pressed={selectedYear === "all"}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors duration-150 cursor-pointer min-h-[44px] ${
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
              aria-pressed={selectedYear === year}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors duration-150 cursor-pointer min-h-[44px] ${
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

          type FileLink = { label: string; href: string; isPgn?: boolean };
          const fileLinks: FileLink[] = [
            tournament.detailsPdf && { label: i.tournament.detailsPdf, href: tournament.detailsPdf },
            tournament.resultsPdf && { label: i.tournament.resultsPdf, href: tournament.resultsPdf },
            tournament.gamesPgn && { label: i.tournament.gamesPgn, href: tournament.gamesPgn, isPgn: true },
          ].filter(Boolean) as FileLink[];

          return (
            <div
              key={`${tournament.year}-${idx}`}
              className={`border ${borderClass} rounded-md p-4 animate-fade-in`}
            >
              <p className="text-base font-semibold">{tournament.title}</p>
              <p className="text-sm text-[#737373] mt-1">{tournament.date}</p>

              {fileLinks.length > 0 && (
                <div className="mt-3.5">
                  {fileLinks.map((link, linkIdx) => {
                    const rowClass = `flex justify-between items-center py-3 px-2 -mx-2 rounded ${
                      linkIdx < fileLinks.length - 1 ? "border-b border-[#f5f5f5]" : ""
                    }`;
                    if (link.isPgn) {
                      const filename = link.href.split("/").pop() || "game.pgn";

                      const handleView = async (e: React.MouseEvent) => {
                        e.preventDefault();
                        try {
                          const res = await fetch(link.href);
                          const text = await res.text();
                          const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
                          const url = URL.createObjectURL(blob);
                          window.open(url, "_blank");
                          setTimeout(() => URL.revokeObjectURL(url), 60000);
                        } catch {
                          window.open(link.href, "_blank");
                        }
                      };

                      const handleSave = async (e: React.MouseEvent) => {
                        e.preventDefault();
                        try {
                          const res = await fetch(link.href);
                          const blob = await res.blob();
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = filename;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          setTimeout(() => URL.revokeObjectURL(url), 1000);
                        } catch {
                          window.location.href = link.href;
                        }
                      };

                      return (
                        <div key={link.href} className={rowClass}>
                          <span className="text-sm">{link.label}</span>
                          <span className="flex items-center gap-3 text-sm">
                            <button
                              type="button"
                              onClick={handleView}
                              className="text-[#2563eb] hover:text-[#1d4ed8] transition-colors duration-150 cursor-pointer"
                            >
                              {locale === "ja" ? "表示" : "View"}
                            </button>
                            <span className="text-[#e5e5e5]" aria-hidden="true">|</span>
                            <button
                              type="button"
                              onClick={handleSave}
                              className="text-[#2563eb] hover:text-[#1d4ed8] transition-colors duration-150 cursor-pointer"
                            >
                              {locale === "ja" ? "保存" : "Save"}
                            </button>
                          </span>
                        </div>
                      );
                    }
                    return (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${rowClass} hover:bg-[#fafafa] transition-colors duration-150`}
                      >
                        <span className="text-sm">{link.label}</span>
                        <span className="text-[#737373]" aria-hidden="true">→</span>
                      </a>
                    );
                  })}
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}
