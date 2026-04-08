#!/usr/bin/env tsx
/**
 * Translate Japanese announcement frontmatter and body to English using
 * Claude API (primary) or DeepL API (fallback). Writes results back to the
 * same markdown file. Idempotent — only fills in missing en fields.
 *
 * Required env (one of):
 *   ANTHROPIC_API_KEY
 *   DEEPL_API_KEY
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import matter from "gray-matter";
import Anthropic from "@anthropic-ai/sdk";

const DIR = "src/content/announcements";

interface AnnouncementFrontmatter {
  title: { ja: string; en?: string };
  description: { ja: string; en?: string };
  date: string;
  bodyEn?: string;
}

async function translateClaude(texts: string[]): Promise<string[]> {
  const client = new Anthropic();
  const numbered = texts.map((t, i) => `[${i + 1}]\n${t}`).join("\n\n---\n\n");
  const prompt = `You are translating short announcements for a chess club website from Japanese to natural English. Preserve markdown formatting (headings, lists, links). Keep proper nouns like 札幌チェスクラブ as "Sapporo Chess Club", かでる2.7 as "Kaderu 2.7". Translate each numbered section. Output only the translations in the same numbered format, with [1], [2], etc. and nothing else.\n\n${numbered}`;
  const res = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });
  const text = res.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("");
  // Parse [1] [2] [3] sections
  const sections = text.split(/^\[(\d+)\]\s*$/m).filter(Boolean);
  const out: string[] = [];
  for (let i = 1; i < sections.length; i += 2) {
    out[parseInt(sections[i]) - 1] = sections[i + 1].trim();
  }
  if (out.length !== texts.length || out.some((s) => !s)) {
    throw new Error(`Claude translation parse failed (expected ${texts.length}, got ${out.filter(Boolean).length})`);
  }
  return out;
}

async function translateDeepL(texts: string[]): Promise<string[]> {
  const key = process.env.DEEPL_API_KEY!;
  const params = new URLSearchParams();
  params.append("auth_key", key);
  params.append("source_lang", "JA");
  params.append("target_lang", "EN");
  texts.forEach((t) => params.append("text", t));
  const res = await fetch("https://api-free.deepl.com/v2/translate", {
    method: "POST",
    body: params,
  });
  if (!res.ok) throw new Error(`DeepL API error: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { translations: { text: string }[] };
  return data.translations.map((t) => t.text);
}

async function translate(texts: string[]): Promise<string[]> {
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      return await translateClaude(texts);
    } catch (err) {
      console.error("Claude translation failed, trying DeepL:", err);
    }
  }
  if (process.env.DEEPL_API_KEY) {
    return await translateDeepL(texts);
  }
  throw new Error("No translation API key available (set ANTHROPIC_API_KEY or DEEPL_API_KEY)");
}

async function main() {
  const files = (await readdir(DIR)).filter((f) => f.endsWith(".md"));
  let changed = 0;

  for (const file of files) {
    const path = join(DIR, file);
    const raw = await readFile(path, "utf-8");
    const parsed = matter(raw);
    const fm = parsed.data as AnnouncementFrontmatter;

    const needs: { key: "title.en" | "description.en" | "bodyEn"; ja: string }[] = [];
    if (!fm.title.en) needs.push({ key: "title.en", ja: fm.title.ja });
    if (!fm.description.en) needs.push({ key: "description.en", ja: fm.description.ja });
    if (!fm.bodyEn && parsed.content.trim()) needs.push({ key: "bodyEn", ja: parsed.content.trim() });

    if (needs.length === 0) continue;

    console.log(`Translating ${file} (${needs.length} fields)`);
    const translated = await translate(needs.map((n) => n.ja));

    needs.forEach((n, i) => {
      if (n.key === "title.en") fm.title.en = translated[i];
      else if (n.key === "description.en") fm.description.en = translated[i];
      else if (n.key === "bodyEn") fm.bodyEn = translated[i];
    });

    const out = matter.stringify(parsed.content, fm);
    await writeFile(path, out, "utf-8");
    changed++;
  }

  console.log(`Done. ${changed} file(s) updated.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
