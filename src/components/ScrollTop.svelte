<script lang="ts">
  import { onMount } from "svelte";
  import { observeScroll } from "@/lib/scroll-observer";

  let visible = $state(false);
  let pressed = $state(false);

  // 表示閾値とコンテンツ最下部のマージン
  const SHOW_AFTER_PX = 400;
  const NEAR_BOTTOM_PX = 120;

  onMount(() =>
    observeScroll(({ y, direction, viewportHeight }) => {
      const scrolled = y > SHOW_AFTER_PX;
      const nearBottom = viewportHeight + y >= document.body.offsetHeight - NEAR_BOTTOM_PX;
      if (!scrolled || nearBottom) {
        visible = false;
      } else if (direction !== "idle") {
        visible = direction === "up";
      }
    })
  );

  // visible が false になったら pressed (青ハイライト) もリセット
  $effect(() => {
    if (!visible && pressed) pressed = false;
  });

  function scrollToTop(e: MouseEvent) {
    pressed = true;
    window.scrollTo({ top: 0, behavior: "smooth" });
    (e.currentTarget as HTMLButtonElement).blur();
  }

  const colorClass = $derived(
    pressed
      ? "border-[#2563eb] text-[#2563eb]"
      : "border-[#e5e5e5] text-[#171717] [@media(hover:hover)]:hover:border-[#2563eb] [@media(hover:hover)]:hover:text-[#2563eb]"
  );

  const visibilityClass = $derived(
    visible
      ? "opacity-100 translate-y-0 pointer-events-auto"
      : "opacity-0 translate-y-2 pointer-events-none"
  );
</script>

<button
  type="button"
  onclick={scrollToTop}
  aria-label="Scroll to top"
  class="fixed z-40 inline-flex items-center gap-2.5 px-5 py-3.5 rounded-md bg-white border shadow-sm text-sm font-medium transition-all duration-150 cursor-pointer {colorClass} {visibilityClass}"
  style="
    right: max(1.5rem, calc((100vw - 56rem) / 2 - 1rem));
    bottom: calc(3rem + env(safe-area-inset-bottom));
  "
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <polyline points="18 15 12 9 6 15" />
  </svg>
  <span class="text-sm font-semibold uppercase tracking-wider">Top</span>
</button>
