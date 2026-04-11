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
    // 同一オリジンの全リンクを viewport に入った時点でバックグラウンド取得する。
    // 静的 HTML のみの軽量サイトなので全リンク prefetch でも帯域負荷は軽微。
    // 外部リンク (別オリジン / mailto: 等) は Astro が自動で除外する。
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
  integrations: [svelte()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      noExternal: ["bits-ui"],
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