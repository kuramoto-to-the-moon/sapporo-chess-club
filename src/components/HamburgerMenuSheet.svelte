<script lang="ts">
  import { onMount } from "svelte";
  import { t, getLocalePath, type Locale } from "@/i18n";
  import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetClose,
  } from "@/components/ui/sheet";

  interface Props {
    locale: Locale;
    currentPath: string;
    /** 外部のトリガーボタン。aria-expanded 同期 + open イベントの購読に使う */
    trigger?: HTMLElement;
  }

  let { locale, currentPath, trigger }: Props = $props();

  // 動的 mount された直後に自動で開く
  let isOpen = $state(true);

  // 外部トリガーから「開け」と言われたら開く
  onMount(() => {
    if (!trigger) return;
    const handler = () => (isOpen = true);
    trigger.addEventListener("hamburger-open", handler);
    return () => trigger.removeEventListener("hamburger-open", handler);
  });

  // open 状態をトリガーの aria-expanded に反映
  $effect(() => {
    if (trigger) trigger.setAttribute("aria-expanded", String(isOpen));
  });

  const otherLocale: Locale = locale === "ja" ? "en" : "ja";
  const otherPath = getLocalePath(otherLocale, currentPath);
  const i = t(locale);

  const pages = [
    { label: i.nav.home, sub: i.sections.home, href: getLocalePath(locale, "/") },
    { label: i.schedule.label, sub: "SCHEDULE", href: getLocalePath(locale, "/schedule") },
    { label: i.nav.tournaments, sub: i.sections.tournaments, href: getLocalePath(locale, "/tournaments") },
  ];

  const homeHref = getLocalePath(locale, "/");
  const isHome = currentPath === "/" || currentPath === "";
  const anchorHref = (id: string) => (isHome ? `#${id}` : `${homeHref}#${id}`);

  const anchors = [
    { label: i.menu.schedule, href: anchorHref("schedule") },
    { label: i.menu.activities, href: anchorHref("activities") },
    { label: i.menu.info, href: anchorHref("info") },
    { label: i.menu.lessons, href: anchorHref("lessons") },
    { label: i.menu.contact, href: anchorHref("contact") },
  ];
</script>

<Sheet bind:open={isOpen} preventScroll={false}>
  <SheetContent
    side="full"
    showCloseButton={false}
    onCloseAutoFocus={(e) => {
      e.preventDefault();
      trigger?.focus({ preventScroll: true });
    }}
    class="bg-[#171717] text-[#fafafa] border-0 p-0 [@media(display-mode:standalone)]:pb-[env(safe-area-inset-bottom)]"
  >
    <SheetTitle class="sr-only">Navigation menu</SheetTitle>

    <div class="w-full max-w-4xl mx-auto flex items-center justify-between px-5 py-2">
      <span class="text-xs tracking-[3px] text-[#737373]" aria-hidden="true">
        SAPPORO CHESS CLUB
      </span>
      <SheetClose
        aria-label="Close navigation menu"
        class="inline-flex items-center justify-center w-10 h-10 -mr-2 text-[#fafafa] cursor-pointer rounded focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fafafa]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </SheetClose>
    </div>

    <nav class="w-full max-w-4xl mx-auto px-5 pt-8" aria-label="Main navigation">
      {#each pages as page, idx (page.href)}
        <a
          href={page.href}
          data-astro-prefetch
          class="group block mb-6 animate-fade-in-up"
          style="animation-delay: {idx * 0.05}s"
          aria-current={page.href === getLocalePath(locale, currentPath) ? "page" : undefined}
        >
          <span class="text-4xl font-light [@media(hover:hover)]:group-hover:text-white transition-colors duration-150 inline-flex items-center gap-3">
            {page.label}
            <span class="text-2xl text-[#d4d4d4] [@media(hover:hover)]:group-hover:text-white [@media(hover:hover)]:group-hover:translate-x-2 transition-all duration-150" aria-hidden="true">→</span>
          </span>
          <span class="block text-xs tracking-[1px] text-[#d4d4d4] mt-1">
            {page.sub}
          </span>
        </a>
      {/each}

      <div class="border-t border-[#2a2a2a] my-5" role="separator"></div>

      <p class="text-xs uppercase tracking-wider text-[#737373] mb-3">
        {i.menu.sectionLabel}
      </p>
      <div class="flex flex-col gap-3">
        {#each anchors as anchor, idx (anchor.href)}
          <a
            href={anchor.href}
            onclick={() => {
              if (anchor.href.startsWith("#")) isOpen = false;
            }}
            class="group flex items-center gap-2 text-sm text-[#d4d4d4] [@media(hover:hover)]:hover:text-[#fafafa] transition-colors duration-150 animate-fade-in-up"
            style="animation-delay: {(pages.length + idx) * 0.05}s"
          >
            {anchor.label}
            <span class="opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:translate-x-1 transition-all duration-150" aria-hidden="true">→</span>
          </a>
        {/each}
      </div>
    </nav>

    <div class="absolute bottom-0 left-0 right-0 border-t border-[#2a2a2a] [@media(display-mode:standalone)]:pb-[env(safe-area-inset-bottom)]">
      <div class="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
        <a
          href="mailto:sapporochessclub@gmail.com"
          class="text-xs text-[#d4d4d4] hover:text-[#fafafa] transition-colors duration-150"
        >
          sapporochessclub@gmail.com
        </a>
        <a
          href={otherPath}
          class="text-xs tracking-[2px] text-[#d4d4d4] hover:text-[#fafafa] transition-colors duration-150"
          aria-label={i.nav.switchLanguage}
          hreflang={otherLocale}
        >
          {i.nav.languageShort}
        </a>
      </div>
    </div>
  </SheetContent>
</Sheet>
