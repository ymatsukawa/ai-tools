import { useCallback, useEffect, useState } from "react";

export interface FontOption {
  id: string;
  label: string;
  stack: string;
  gfParam?: string;
}

export interface FontSettings {
  uiFont: string;
  codeFont: string;
  uiSize: number;
  codeSize: number;
}

const SANS_FALLBACK =
  'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
const MONO_FALLBACK =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

export const UI_FONTS: FontOption[] = [
  { id: "inter", label: "Inter (default)", stack: `"Inter", ${SANS_FALLBACK}` },
  {
    id: "noto-sans-jp",
    label: "Noto Sans JP",
    stack: `"Noto Sans JP", ${SANS_FALLBACK}`,
    gfParam: "Noto+Sans+JP:wght@400;500;600;700",
  },
  {
    id: "biz-udpgothic",
    label: "BIZ UDPGothic",
    stack: `"BIZ UDPGothic", ${SANS_FALLBACK}`,
    gfParam: "BIZ+UDPGothic:wght@400;700",
  },
];

export const CODE_FONTS: FontOption[] = [
  { id: "system", label: "System monospace (default)", stack: MONO_FALLBACK },
  {
    id: "jetbrains-mono",
    label: "JetBrains Mono",
    stack: `"JetBrains Mono", ${MONO_FALLBACK}`,
    gfParam: "JetBrains+Mono:wght@400;700",
  },
  {
    id: "source-code-pro",
    label: "Source Code Pro",
    stack: `"Source Code Pro", ${MONO_FALLBACK}`,
    gfParam: "Source+Code+Pro:wght@400;700",
  },
  {
    id: "noto-sans-mono",
    label: "Noto Sans Mono",
    stack: `"Noto Sans Mono", ${MONO_FALLBACK}`,
    gfParam: "Noto+Sans+Mono:wght@400;700",
  },
];

export const MIN_FONT_SIZE = 8;
export const MAX_FONT_SIZE = 24;

export const DEFAULT_SETTINGS: FontSettings = {
  uiFont: "inter",
  codeFont: "jetbrains-mono",
  uiSize: 16,
  codeSize: 18,
};

const STORAGE_KEY = "files-changed-local:font-settings";
const FONT_LINK_ID = "dynamic-fonts";

export function useFontSettings() {
  const [settings, setSettings] = useState<FontSettings>(loadSettings);

  useEffect(() => {
    persistSettings(settings);
    applyDocumentStyles(settings);
    syncGoogleFontsLink(settings);
  }, [settings]);

  const update = useCallback((patch: Partial<FontSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return { settings, update, reset };
}

function resolveFont(options: FontOption[], id: string): FontOption {
  return options.find((font) => font.id === id) ?? options[0];
}

// Runs on the server render too, where localStorage is unavailable.
function loadSettings(): FontSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return sanitizeSettings(JSON.parse(raw) as Partial<FontSettings>);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function sanitizeSettings(parsed: Partial<FontSettings>): FontSettings {
  return {
    uiFont: knownFontId(UI_FONTS, parsed.uiFont) ?? DEFAULT_SETTINGS.uiFont,
    codeFont: knownFontId(CODE_FONTS, parsed.codeFont) ?? DEFAULT_SETTINGS.codeFont,
    uiSize: clampSize(parsed.uiSize, DEFAULT_SETTINGS.uiSize),
    codeSize: clampSize(parsed.codeSize, DEFAULT_SETTINGS.codeSize),
  };
}

function knownFontId(options: FontOption[], id: string | undefined): string | null {
  return options.some((font) => font.id === id) ? (id as string) : null;
}

function clampSize(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, Math.round(value)));
}

function persistSettings(settings: FontSettings): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

// Tailwind v4 resolves font utilities through :root custom properties, so
// inline overrides on <html> restyle every component without touching them.
// UI size scales the whole rem-based layout; code size is a separate px
// variable so the diff area is excluded from that scaling.
function applyDocumentStyles(settings: FontSettings): void {
  const root = document.documentElement;
  root.style.fontSize = `${settings.uiSize}px`;
  root.style.setProperty("--font-sans", resolveFont(UI_FONTS, settings.uiFont).stack);
  root.style.setProperty("--font-mono", resolveFont(CODE_FONTS, settings.codeFont).stack);
  root.style.setProperty("--app-code-size", `${settings.codeSize}px`);
}

// Loads only the currently selected Google Fonts families; defaults
// (Inter, system monospace) need no extra stylesheet.
function syncGoogleFontsLink(settings: FontSettings): void {
  const params = [
    resolveFont(UI_FONTS, settings.uiFont).gfParam,
    resolveFont(CODE_FONTS, settings.codeFont).gfParam,
  ].filter(Boolean);
  const existing = document.getElementById(FONT_LINK_ID);

  if (params.length === 0) {
    existing?.remove();
    return;
  }

  const href = `https://fonts.googleapis.com/css2?family=${params.join("&family=")}&display=swap`;
  if (existing instanceof HTMLLinkElement) {
    if (existing.href !== href) existing.href = href;
    return;
  }

  const link = document.createElement("link");
  link.id = FONT_LINK_ID;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}
