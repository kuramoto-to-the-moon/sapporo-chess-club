import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import svelte from "@astrojs/svelte";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://sapporochessclub.com",
  base: "/",
  build: {
    // 小さい CSS は <style> としてインライン化し render-blocking を回避
    inlineStylesheets: "always",
  },
  prefetch: {
    // 全リンク prefetch は iOS PWA で rapid navigation した際にリクエストが
    // 積み上がり WebView の接続プール/メモリを圧迫する恐れがある。
    // ナビゲーション上重要なリンクだけ data-astro-prefetch を付けて選択的に行う。
    prefetchAll: false,
    defaultStrategy: "viewport",
  },
  integrations: [svelte(), sitemap({ i18n: { defaultLocale: "ja", locales: { ja: "ja-JP", en: "en-US" } } })],
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