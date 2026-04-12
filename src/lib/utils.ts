import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** shadcn-svelte の UI プリミティブが使う型ヘルパー */
export type WithElementRef<T, E extends Element = HTMLElement> = T & {
  ref?: E | null;
};
export type WithoutChildren<T> = Omit<T, "children">;

/**
 * `/competition/foo.pdf` のような public アセットのパスに Astro の base を付ける。
 * 既に http(s) で始まる外部 URL はそのまま返す。
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
export function withBase(path: string | undefined): string | undefined {
  if (!path) return path;
  if (/^https?:\/\//.test(path)) return path;
  return BASE + path;
}
