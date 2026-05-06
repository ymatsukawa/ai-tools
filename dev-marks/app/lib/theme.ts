import type { ThemeKey } from "./settings";

export type ResolvedTheme = "light" | "sepia" | "dark";

export function resolveTheme(setting: ThemeKey, systemDark: boolean): ResolvedTheme {
  if (setting === "auto") return systemDark ? "dark" : "light";
  return setting;
}

export function shikiThemeFor(t: ResolvedTheme): "github-light" | "github-dark" | "solarized-light" {
  if (t === "dark") return "github-dark";
  if (t === "sepia") return "solarized-light";
  return "github-light";
}
