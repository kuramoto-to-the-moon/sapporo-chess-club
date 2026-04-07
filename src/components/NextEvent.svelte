<script lang="ts">
  import { t, type Locale } from "@/i18n";
  import { parseDate, startOfTodayJST, getDateParts } from "@/lib/date";
  import { getEventName, type ScheduleDate } from "@/lib/schedule";

  interface Props {
    dates: ScheduleDate[];
    locale: Locale;
  }

  let { dates, locale }: Props = $props();

  const i = t(locale);
  const today = startOfTodayJST();

  const next = dates
    .filter((d) => parseDate(d.date) >= today)
    .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime())[0];
</script>

{#if next}
  {@const parts = getDateParts(next.date)}
  {@const isTournament = next.type === "tournament"}
  {@const title = isTournament
    ? getEventName(next, locale)
    : `${next.dayOfWeek[locale]}${locale === "ja" ? "曜日" : ""}`}
  <section class="px-5 py-6 border-t border-[#f5f5f5] animate-fade-in-up">
    <div class="flex items-center gap-1.5 mb-1.5">
      <span class="inline-block w-1 h-3 bg-[#2563eb]"></span>
      <span class="text-sm font-semibold uppercase tracking-wider text-[#737373]">
        {isTournament ? i.nextEvent.event : i.nextEvent.meeting}
      </span>
      {#if isTournament}
        <span class="bg-[#2563eb] text-white text-xs px-1.5 py-0.5 rounded font-semibold">
          {i.badge.tournamentTag}
        </span>
      {/if}
    </div>
    <div class="flex items-baseline gap-2.5">
      <span class="text-5xl font-extralight leading-none text-[#2563eb]">
        {parts.month}/{parts.day}
      </span>
      <div>
        <p class="text-base font-semibold">{title}</p>
        <p class="text-sm text-[#737373] mt-0.5 flex flex-wrap gap-x-3">
          <span>{next.startTime}–{next.endTime}</span>
          <span>{next.venue[locale]}</span>
          <span>{next.room}{locale === "ja" ? "室" : ""}</span>
        </p>
      </div>
    </div>
  </section>
{/if}
