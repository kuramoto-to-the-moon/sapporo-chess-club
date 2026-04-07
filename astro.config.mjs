import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import svelte from "@astrojs/svelte";

export default defineConfig({
  site: "https://kuramoto-to-the-moon.github.io",
  base: "/sapporo-chess-club",
  build: {
    // 小さい CSS は <style> としてインライン化し render-blocking を回避
    inlineStylesheets: "always",
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: "tap",
  },
  integrations: [svelte()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      noExternal: ["@lucide/svelte", "bits-ui"],
    },
  },
  i18n: {
    locales: ["ja", "en"],
    defaultLocale: "ja",
    routing: {
      prefixDefaultLocale: false,
    },
  },
});