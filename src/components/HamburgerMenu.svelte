<script lang="ts">
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
  }

  let { locale, currentPath }: Props = $props();
  let isOpen = $state(false);

  const i = t(locale);
  const otherLocale: Locale = locale === "ja" ? "en" : "ja";
  const otherPath = getLocalePath(otherLocale, currentPath);

  const homeHref = getLocalePath(locale, "/");
  const currentHref = getLocalePath(locale, currentPath);
  const isHome = currentPath === "/" || currentPath === "";
  const anchorHref = (id: string) => (isHome ? `#${id}` : `${homeHref}#${id}`);

  const pages = [
    { label: i.nav.home, sub: i.sections.home, href: homeHref },
    { label: i.schedule.label, sub: "SCHEDULE", href: getLocalePath(locale, "/schedule") },
    { label: i.nav.tournaments, sub: i.sections.tournaments, href: getLocalePath(locale, "/tournaments") },
  ];

  const anchors = [
    { label: i.menu.schedule, href: anchorHref("schedule") },
    { label: i.menu.activities, href: anchorHref("activities") },
    { label: i.menu.info, href: anchorHref("info") },
    { label: i.menu.lessons, href: anchorHref("lessons") },
    { label: i.menu.links, href: anchorHref("links") },
    { label: i.menu.contact, href: anchorHref("contact") },
  ];

  function handleAnchorClick(href: string) {
    if (!href.startsWith("#")) return;
    isOpen = false;
    // ヘッダー headroom を一時凍結 → アンカー先まで下スクロール中も
    // ヘッダーが消えず、scroll-padding-top の補正が無駄にならない。
    // 凍結はヘッダー側がスクロール位置の安定を検知した瞬間に自動解除される。
    window.dispatchEvent(new CustomEvent("headroom:freeze"));
  }
</script>

<button
  type="button"
  onclick={() => (isOpen = true)}
  aria-label="Open navigation menu"
  aria-haspopup="dialog"
  aria-expanded={isOpen}
  class="relative inline-flex items-center justify-center w-10 h-10 -mr-2 cursor-pointer focus-visible:outline-none active:opacity-60 transition-opacity before:content-[''] before:absolute before:-inset-2"
>
  <span class="flex flex-col items-center justify-center gap-[6px]" aria-hidden="true">
    <span class="w-6 h-[2px] bg-[#171717]"></span>
    <span class="w-6 h-[2px] bg-[#171717]"></span>
  </span>
</button>

<Sheet bind:open={isOpen} preventScroll={false}>
  <SheetContent
    side="full"
    showCloseButton={false}
    onCloseAutoFocus={(e) => e.preventDefault()}
    class="bg-[#171717] text-[#fafafa] border-0 p-0 gap-0 flex flex-col"
  >
    <SheetTitle class="sr-only">Navigation menu</SheetTitle>

    <div class="w-full max-w-4xl mx-auto flex items-center justify-between px-5 pt-3 pb-2">
      <a
        href={homeHref}
        class="text-xs tracking-[3px] text-[#737373] hover:text-[#fafafa] transition-colors duration-150"
        aria-label="Sapporo Chess Club — Home"
      >
        SAPPORO CHESS CLUB
      </a>
      <SheetClose
        aria-label="Close navigation menu"
        class="relative inline-flex items-center justify-center w-10 h-10 -mr-2 text-[#fafafa] cursor-pointer rounded focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fafafa] before:content-[''] before:absolute before:-inset-2"
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

    <nav class="flex-1 w-full max-w-4xl mx-auto px-5 pt-5 overflow-y-auto" aria-label="Main navigation">
      {#each pages as page, idx (page.href)}
        <a
          href={page.href}
          data-astro-prefetch
          class="group block mb-4 animate-fade-in-up"
          style="animation-delay: {idx * 0.05}s"
          aria-current={page.href === currentHref ? "page" : undefined}
        >
          <span class="text-3xl font-light [@media(hover:hover)]:group-hover:text-white transition-colors duration-150 inline-flex items-center gap-3">
            {page.label}
            <span class="text-xl text-[#d4d4d4] [@media(hover:hover)]:group-hover:text-white [@media(hover:hover)]:group-hover:translate-x-2 transition-all duration-150" aria-hidden="true">→</span>
          </span>
          <span class="block text-[11px] tracking-[1px] text-[#d4d4d4] mt-0.5">
            {page.sub}
          </span>
        </a>
      {/each}

      <hr class="border-0 border-t border-[#2a2a2a] my-4" />

      <p class="text-xs uppercase tracking-wider text-[#737373] mb-2">
        {i.menu.sectionLabel}
      </p>
      <div class="flex flex-col gap-2">
        {#each anchors as anchor, idx (anchor.href)}
          <a
            href={anchor.href}
            onclick={() => handleAnchorClick(anchor.href)}
            class="group flex items-center gap-2 text-sm text-[#d4d4d4] [@media(hover:hover)]:hover:text-[#fafafa] transition-colors duration-150 animate-fade-in-up"
            style="animation-delay: {(pages.length + idx) * 0.05}s"
          >
            {anchor.label}
            <span class="opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:translate-x-1 transition-all duration-150" aria-hidden="true">→</span>
          </a>
        {/each}
      </div>
    </nav>

    <div class="border-t border-[#2a2a2a] [@media(display-mode:standalone)]:pb-[env(safe-area-inset-bottom)]">
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
