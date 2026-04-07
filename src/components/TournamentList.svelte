<script lang="ts">
  import { t, type Locale } from "@/i18n";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
  } from "@/components/ui/select";
  import { Button } from "@/components/ui/button";

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

  let { tournaments, years, locale }: Props = $props();

  const i = t(locale);
  let selectedYear = $state<string>("all");

  const filtered = $derived(
    selectedYear === "all"
      ? tournaments
      : tournaments.filter((t) => t.year === Number(selectedYear))
  );

  async function handlePgnDownload(e: MouseEvent, href: string) {
    e.preventDefault();
    const filename = href.split("/").pop() || "game.pgn";
    const res = await fetch(href);
    const text = await res.text();
    const blob = new Blob([text], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
</script>

<div>
  <div class="mb-8">
    <div class="sm:hidden">
      <label
        for="year-filter-select"
        class="block text-xs uppercase tracking-wider text-[#737373] mb-2"
      >
        {locale === "ja" ? "年で絞り込み" : "Filter by year"}
      </label>
      <Select type="single" bind:value={selectedYear}>
        <SelectTrigger id="year-filter-select" class="w-full min-h-[44px] h-auto">
          {selectedYear === "all"
            ? locale === "ja" ? "すべての年" : "All years"
            : `${selectedYear}${locale === "ja" ? "年" : ""}`}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{locale === "ja" ? "すべての年" : "All years"}</SelectItem>
          {#each years as year}
            <SelectItem value={String(year)}>
              {year}{locale === "ja" ? "年" : ""}
            </SelectItem>
          {/each}
        </SelectContent>
      </Select>
    </div>
    <div class="hidden sm:flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        variant={selectedYear === "all" ? "default" : "secondary"}
        aria-pressed={selectedYear === "all"}
        onclick={() => (selectedYear = "all")}
        class="min-h-[44px]"
      >
        {locale === "ja" ? "すべて" : "All"}
      </Button>
      {#each years as year}
        <Button
          type="button"
          size="sm"
          variant={selectedYear === String(year) ? "default" : "secondary"}
          aria-pressed={selectedYear === String(year)}
          onclick={() => (selectedYear = String(year))}
          class="min-h-[44px]"
        >
          {year}
        </Button>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-4">
    {#each filtered as tournament, idx (`${tournament.year}-${idx}`)}
      {@const fileLinks = [
        tournament.detailsPdf && { label: i.tournament.detailsPdf, href: tournament.detailsPdf, isPgn: false },
        tournament.resultsPdf && { label: i.tournament.resultsPdf, href: tournament.resultsPdf, isPgn: false },
        tournament.gamesPgn && { label: i.tournament.gamesPgn, href: tournament.gamesPgn, isPgn: true },
      ].filter(Boolean) as { label: string; href: string; isPgn: boolean }[]}
      <div class="border border-[#f5f5f5] rounded-md p-4 animate-fade-in">
        <p class="text-base font-semibold">{tournament.title}</p>
        <p class="text-sm text-[#737373] mt-1">{tournament.date}</p>

        {#if fileLinks.length > 0}
          <div class="mt-3.5">
            {#each fileLinks as link, linkIdx}
              {@const rowClass = `flex items-center gap-1.5 py-3 px-2 -mx-2 rounded hover:bg-[#fafafa] transition-colors duration-150 ${linkIdx < fileLinks.length - 1 ? "border-b border-[#f5f5f5]" : ""}`}
              {#if link.isPgn}
                <a
                  href={link.href}
                  onclick={(e) => handlePgnDownload(e, link.href)}
                  aria-label={`${link.label}${locale === "ja" ? "をダウンロード" : " download"}`}
                  class={rowClass}
                >
                  <span class="text-sm">{link.label}</span>
                  <span class="text-[#737373]" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </span>
                </a>
              {:else}
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  class={rowClass}
                >
                  <span class="text-sm">{link.label}</span>
                  <span class="text-[#737373]" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </span>
                </a>
              {/if}
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
