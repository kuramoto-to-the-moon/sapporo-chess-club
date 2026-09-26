import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";

// Astro が生成した HTML/XML の整合性検査。依存パッケージや外部通信は不要。
const root = new URL("../dist/", import.meta.url);
const origin = "https://sapporochessclub.com";
const read = (path) => readFile(new URL(path, root), "utf8");
async function files(dir = "") {
  const entries = await readdir(new URL(dir, root), { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory()
    ? files(`${dir}${entry.name}/`) : `${dir}${entry.name}`))).flat();
}
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)=(?:"([^"]*)"|'([^']*)')/g)].map((m) => [m[1], m[2] ?? m[3]]));
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b(?:[^"'<>]|"[^"]*"|'[^']*')*>`, "g"))].map((m) => attrs(m[0]));
const locations = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const indexable = new Set();
const sitemap = new Set();
const pages = (await files()).filter((path) => path.endsWith(".html"));
async function checkTarget(href) {
  const url = new URL(href, origin);
  assert.equal(url.origin, origin, `Unexpected origin: ${href}`);
  const path = decodeURIComponent(url.pathname).slice(1);
  const file = path.endsWith("/") || !path ? `${path}index.html` : path;
  assert.ok((await stat(new URL(file, root))).isFile(), `Missing target: ${href}`);
  if (url.hash) assert.ok((await read(file)).includes(`id="${url.hash.slice(1)}"`), `Missing anchor: ${href}`);
}
for (const file of pages) {
  const html = await read(file);
  const links = tags(html, "link");
  const meta = tags(html, "meta");
  const canonical = links.filter((link) => link.rel === "canonical");
  assert.equal(canonical.length, 1, `${file}: canonical`);
  const expected = `${origin}/${file.replace(/index\.html$/, "")}`;
  assert.equal(canonical[0].href, expected, `${file}: canonical URL`);
  const noindex = meta.some((tag) => tag.name === "robots" && tag.content.includes("noindex"));
  if (!noindex) {
    indexable.add(expected);
    assert.ok(!meta.some((tag) => tag.name === "robots" && /nosnippet|noai/.test(tag.content)), `${file}: preview blocked`);
    for (const locale of ["ja", "en", "x-default"]) {
      const alternate = links.find((link) => link.hreflang === locale);
      assert.ok(alternate, `${file}: missing ${locale}`);
      await checkTarget(alternate.href);
    }
  }
  assert.ok(meta.some((tag) => tag.name === "description" && tag.content), `${file}: description`);
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (attrs(match[1]).type !== "application/ld+json") continue;
    const data = JSON.parse(match[2]);
    for (const node of Array.isArray(data) ? data : [data]) {
      assert.ok(node["@context"] && node["@type"], `${file}: invalid JSON-LD`);
      if (node["@type"] === "NewsArticle") {
        assert.equal(node.url, expected, `${file}: article URL`);
        const body = tags(html, "div").find((tag) => tag.class?.includes("prose prose-neutral"));
        assert.equal(node.inLanguage.split("-")[0], body?.lang, `${file}: article language`);
      }
    }
  }
}
for (const href of locations(await read("sitemap-index.xml"))) {
  for (const page of locations(await read(new URL(href).pathname.slice(1)))) sitemap.add(page);
}
assert.deepEqual(sitemap, indexable, "Sitemap must contain exactly the indexable HTML pages");
const guide = await read("llms.txt");
for (const match of guide.matchAll(/\]\((https:\/\/[^)]+)\)/g)) await checkTarget(match[1]);
for (const home of ["index.html", "en/index.html"]) {
  const html = await read(home);
  for (const id of ["belongings", "late-arrival"]) {
    assert.ok(html.includes(`id="faq-${id}"`), `${home}: FAQ missing from static HTML`);
  }
}
console.log(`Search checks passed: ${pages.length} HTML pages, ${sitemap.size} sitemap URLs, JSON-LD, hreflang and llms.txt links.`);
