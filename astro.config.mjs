import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://sapporochessclub.com",
  base: "/",
  // Astro 7 のデフォルト "jsx" はインライン要素間の空白まで除去し
  // 見た目が変わり得るため、v6 までの挙動を明示的に維持する
  compressHTML: true,
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
  integrations: [sitemap({ i18n: { defaultLocale: "ja", locales: { ja: "ja-JP", en: "en-US" } } })],
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Vite 8 のデフォルトターゲットは -webkit-backdrop-filter を落とすが、
      // ヘッダーのぼかしを iOS 17 以前でも維持するため prefix を保持させる
      // (unprefixed backdrop-filter は Safari 18 から)
      cssTarget: ["chrome111", "safari17", "firefox110"],
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