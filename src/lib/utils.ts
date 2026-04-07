import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * `/competition/foo.pdf` のような public アセットのパスに Astro の base (`/sapporo-chess-club`) を付ける。
 * 既に http(s) で始まる外部 URL はそのまま返す。
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
export function withBase(path: string | undefined): string | undefined {
  if (!path) return path;
  if (/^https?:\/\//.test(path)) return path;
  return BASE + path;
}
