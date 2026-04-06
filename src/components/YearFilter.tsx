import { useState } from "react";

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
  locale: "ja" | "en";
  renderCard: (t: Tournament) => React.ReactNode;
}

export default function YearFilter({ tournaments, years, locale, renderCard }: Props) {
  const [selectedYear, setSelectedYear] = useState(years[0]);

  const filtered = tournaments.filter((t) => t.year === selectedYear);

  return (
    <div>
      <div className="flex gap-1.5 flex-wrap mb-5">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`text-sm px-2 py-0.5 rounded-[3px] cursor-pointer transition-colors duration-200 ${
              year === selectedYear
                ? "bg-[#171717] text-white"
                : "bg-[#fafafa] text-[#525252] hover:bg-[#e5e5e5]"
            }`}
          >
            {year}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {filtered.map((t) => renderCard(t))}
      </div>
    </div>
  );
}
