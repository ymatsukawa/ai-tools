import type { Highlighter, BundledLanguage, BundledTheme } from "shiki";

const LANGS: BundledLanguage[] = [
  "ts",
  "tsx",
  "js",
  "jsx",
  "json",
  "bash",
  "shell",
  "html",
  "css",
  "md",
  "python",
  "go",
  "rust",
  "sql",
  "yaml",
  "toml",
  "diff",
  "java",
  "c",
  "cpp",
  "ruby",
  "php",
];

const THEMES: BundledTheme[] = ["github-light", "github-dark", "solarized-light"];

let highlighter: Highlighter | null = null;
let pending: Promise<Highlighter> | null = null;

export async function getHighlighter(): Promise<Highlighter> {
  if (highlighter) return highlighter;
  if (pending) return pending;
  pending = import("shiki").then(async ({ createHighlighter }) => {
    const h = await createHighlighter({ themes: THEMES, langs: LANGS });
    highlighter = h;
    return h;
  });
  return pending;
}

export function isKnownLang(lang: string | undefined): lang is BundledLanguage {
  if (!lang) return false;
  return (LANGS as readonly string[]).includes(lang);
}

export function normalizeLang(lang: string | undefined): BundledLanguage {
  if (!lang) return "txt" as BundledLanguage;
  const l = lang.toLowerCase();
  if (l === "typescript") return "ts";
  if (l === "javascript") return "js";
  if (l === "shell" || l === "sh" || l === "zsh") return "bash";
  if (l === "yml") return "yaml";
  if (isKnownLang(l)) return l;
  return "txt" as BundledLanguage;
}
