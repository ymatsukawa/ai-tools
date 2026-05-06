export type FontKey = "sans" | "serif" | "mono" | "reading";
export type SizeKey = "s" | "m" | "l" | "xl";
export type LeadingKey = "tight" | "normal" | "relaxed";
export type ThemeKey = "auto" | "light" | "sepia" | "dark";

export type Settings = {
  font: FontKey;
  size: SizeKey;
  leading: LeadingKey;
  theme: ThemeKey;
};

export const DEFAULTS: Settings = {
  font: "sans",
  size: "m",
  leading: "normal",
  theme: "auto",
};

export const STORAGE_KEY = "dev-marks:settings";

export const FONT_STACKS: Record<FontKey, string> = {
  sans: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
  serif: '"Newsreader", "Charter", Georgia, ui-serif, serif',
  mono: '"JetBrains Mono", ui-monospace, Menlo, monospace',
  reading: '"Atkinson Hyperlegible", "Newsreader", Georgia, serif',
};

export const FONT_LABELS: Record<FontKey, string> = {
  sans: "Sans — Jakarta",
  serif: "Serif — Newsreader",
  mono: "Mono — JetBrains",
  reading: "Reading — Atkinson",
};

export const FONT_SAMPLES: Record<FontKey, string> = {
  sans: "Aa Bb Cc",
  serif: "Aa Bb Cc",
  mono: "Aa Bb 0+1",
  reading: "Aa Bb Cc",
};

export const SIZE_PX: Record<SizeKey, string> = {
  s: "15px",
  m: "17px",
  l: "19px",
  xl: "22px",
};

export const LEADING_VAL: Record<LeadingKey, string> = {
  tight: "1.45",
  normal: "1.7",
  relaxed: "1.9",
};

export function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(s: Settings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* quota or disabled — ignore */
  }
}

export function applyToDocument(s: Settings, resolvedTheme: "light" | "sepia" | "dark"): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", resolvedTheme);
  const body = document.body;
  body.style.setProperty("--reader-font", FONT_STACKS[s.font]);
  body.style.setProperty("--reader-size", SIZE_PX[s.size]);
  body.style.setProperty("--reader-leading", LEADING_VAL[s.leading]);
}
