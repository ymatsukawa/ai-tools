import type { FontOption } from '../types/common';

// System fallbacks used when the web font fails to load (offline, blocked, 404).
// Without these the browser falls back to its default sans-serif, so a 明朝
// selection would silently render as ゴシック.
const MINCHO_FALLBACK = "'Hiragino Mincho ProN', 'Hiragino Mincho Pro', 'Yu Mincho', 'YuMincho', 'MS PMincho', serif";
const GOTHIC_FALLBACK = "'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'YuGothic', Meiryo, sans-serif";

export const fontOptions: FontOption[] = [
  { name: "Inter", value: "Inter", displayName: "Inter (Default)", stack: `Inter, ui-sans-serif, system-ui, ${GOTHIC_FALLBACK}` },
  { name: "Noto Sans JP", value: "'Noto Sans JP'", displayName: "Noto Sans JP", stack: `'Noto Sans JP', ${GOTHIC_FALLBACK}` },
  { name: "Noto Serif JP", value: "'Noto Serif JP'", displayName: "Noto Serif JP (明朝)", stack: `'Noto Serif JP', ${MINCHO_FALLBACK}` },
  { name: "Sawarabi Mincho", value: "'Sawarabi Mincho'", displayName: "さわらび明朝", stack: `'Sawarabi Mincho', ${MINCHO_FALLBACK}` },
  { name: "Sawarabi Gothic", value: "'Sawarabi Gothic'", displayName: "さわらびゴシック", stack: `'Sawarabi Gothic', ${GOTHIC_FALLBACK}` },
  { name: "Kosugi Maru", value: "'Kosugi Maru'", displayName: "小杉丸ゴシック", stack: `'Kosugi Maru', ${GOTHIC_FALLBACK}` },
  { name: "Kosugi", value: "Kosugi", displayName: "小杉ゴシック", stack: `Kosugi, ${GOTHIC_FALLBACK}` },
  { name: "M PLUS Rounded 1c", value: "'M PLUS Rounded 1c'", displayName: "M PLUS Rounded", stack: `'M PLUS Rounded 1c', ${GOTHIC_FALLBACK}` },
  { name: "M PLUS 1p", value: "'M PLUS 1p'", displayName: "M PLUS 1p", stack: `'M PLUS 1p', ${GOTHIC_FALLBACK}` },
  { name: "Shippori Mincho", value: "'Shippori Mincho'", displayName: "しっぽり明朝", stack: `'Shippori Mincho', ${MINCHO_FALLBACK}` },
  { name: "Klee One", value: "'Klee One'", displayName: "クレー One", stack: `'Klee One', ${MINCHO_FALLBACK}` },
];

const DEFAULT_STACK = fontOptions[0].stack;

/** Resolve a stored font value to its full CSS font-family stack. */
export function getFontStack(value: string): string {
  return fontOptions.find(option => option.value === value)?.stack ?? DEFAULT_STACK;
}
