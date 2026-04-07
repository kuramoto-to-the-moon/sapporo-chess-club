<script lang="ts">
  import { t, type Locale } from "@/i18n";
  import { parseDate, startOfTodayJST, getDateParts } from "@/lib/date";
  import { getEventName, type ScheduleDate } from "@/lib/schedule";

  interface Props {
    dates: ScheduleDate[];
    locale: Locale;
    scheduleHref: string;
  }

  let { dates, locale, scheduleHref }: Props = $props();

  const i = t(locale);
  const today = startOfTodayJST();

  const upcoming = dates
    .filter((d) => parseDate(d.date) >= today)
    .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime())
    .slice(0, 5);
</script>

{#if upcoming.length === 0}
  <p class="text-sm text-[#737373]">
    {locale === "ja" ? "予定されているイベントはありません。" : "No upcoming events."}
  </p>
{:else}
  <ul class="flex flex-col">
    {#each upcoming as date, idx (`${date.date}-${idx}`)}
      {@const parts = getDateParts(date.date)}
      {@const isTournament = date.type === "tournament"}
      <li class="flex items-center gap-4 py-3 border-b border-[#f5f5f5] last:border-0">
        <div class="flex items-baseline gap-1.5 min-w-[80px]">
          <span
            class="text-2xl font-bold leading-none {isTournament ? 'text-[#2563eb]' : 'text-[#171717]'}"
          >
            {parts.month}/{parts.day}
          </span>
          <span class="text-xs text-[#737373]">({date.dayOfWeek[locale]})</span>
        </div>
        <div class="flex-1">
          <p class="text-sm font-semibold flex items-center gap-2 flex-wrap">
            {#if isTournament}
              <span class="text-xs px-1.5 py-0.5 rounded bg-[#2563eb] text-white font-semibold">
                {i.badge.tournamentTag}
              </span>
            {/if}
            <span>{getEventName(date, locale)}</span>
          </p>
          <p class="text-xs text-[#737373] mt-1">
            {date.startTime}–{date.endTime} / {date.room}{locale === "ja" ? "室" : ""}
          </p>
          {#if date.note}
            <p class="text-xs text-[#737373] mt-1">{date.note[locale]}</p>
          {/if}
        </div>
      </li>
    {/each}
  </ul>
  <a
    href={scheduleHref}
    class="inline-block mt-4 text-sm text-[#2563eb] hover:text-[#1d4ed8] transition-colors duration-150 font-medium"
  >
    {i.schedule.viewFullSchedule}
  </a>
{/if}
