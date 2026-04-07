<script lang="ts">
  import { onMount } from "svelte";
  import { observeScroll } from "@/lib/scroll-observer";

  let visible = $state(false);
  let pressed = $state(false);

  onMount(() => {
    return observeScroll(({ y, direction, viewportHeight }) => {
      const scrolled = y > 400;
      const nearBottom = viewportHeight + y >= document.body.offsetHeight - 120;
      if (!scrolled || nearBottom) {
        visible = false;
      } else if (direction !== "idle") {
        visible = direction === "up";
      }
    });
  });

  $effect(() => {
    if (!visible && pressed) pressed = false;
  });

  function scrollToTop(e: MouseEvent) {
    pressed = true;
    window.scrollTo({ top: 0, behavior: "smooth" });
    (e.currentTarget as HTMLButtonElement).blur();
  }
</script>

<button
  type="button"
  onclick={scrollToTop}
  aria-label="Scroll to top"
  style="right: max(1.5rem, calc((100vw - 56rem) / 2 - 1rem))"
  class="fixed bottom-6 z-40 inline-flex items-center gap-2 px-4 py-3 rounded-md bg-white border shadow-sm text-sm font-medium transition-all duration-150 cursor-pointer
    {pressed
      ? 'border-[#2563eb] text-[#2563eb]'
      : 'border-[#e5e5e5] text-[#171717] [@media(hover:hover)]:hover:border-[#2563eb] [@media(hover:hover)]:hover:text-[#2563eb]'}
    {visible
      ? 'opacity-100 translate-y-0 pointer-events-auto'
      : 'opacity-0 translate-y-2 pointer-events-none'}"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <polyline points="18 15 12 9 6 15" />
  </svg>
  <span class="text-xs font-semibold uppercase tracking-wider">Top</span>
</button>
