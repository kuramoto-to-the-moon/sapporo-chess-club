<script lang="ts">
  import { t, type Locale } from "@/i18n";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
  } from "@/components/ui/select";
  import { Button } from "@/components/ui/button";

  interface Props {
    years: number[];
    locale: Locale;
  }

  let { years, locale }: Props = $props();
  const i = t(locale);

  let selectedYear = $state<string>("all");

  // 年が変わったら DOM 上のカードを直接フィルタする (Astro 静的 HTML カードを操作)
  $effect(() => {
    const cards = document.querySelectorAll<HTMLElement>("[data-card-year]");
    cards.forEach((c) => {
      c.hidden = selectedYear !== "all" && c.dataset.cardYear !== selectedYear;
    });
  });
</script>

<div>
  <div class="sm:hidden">
    <label
      for="year-filter-select"
      class="block text-xs uppercase tracking-wider text-[#737373] mb-2"
    >
      {i.schedule.filterByYear}
    </label>
    <Select type="single" bind:value={selectedYear}>
      <SelectTrigger id="year-filter-select" class="w-full min-h-[44px] h-auto">
        {selectedYear === "all"
          ? i.schedule.allYears
          : `${selectedYear}${i.schedule.yearSuffix}`}
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{i.schedule.allYears}</SelectItem>
        {#each years as year}
          <SelectItem value={String(year)}>
            {year}{i.schedule.yearSuffix}
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
      {i.schedule.all}
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
