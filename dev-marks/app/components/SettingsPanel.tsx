import { useEffect } from "react";
import {
  FONT_LABELS,
  FONT_SAMPLES,
  FONT_STACKS,
  type FontKey,
  type LeadingKey,
  type Settings,
  type SizeKey,
  type ThemeKey,
} from "../lib/settings";

type Props = {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  onChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  onReset: () => void;
};

const FONTS: FontKey[] = ["sans", "serif", "mono", "reading"];
const SIZES: SizeKey[] = ["s", "m", "l", "xl"];
const LEADINGS: LeadingKey[] = ["tight", "normal", "relaxed"];
const THEMES: ThemeKey[] = ["auto", "light", "sepia", "dark"];

const SIZE_LABEL: Record<SizeKey, string> = { s: "S", m: "M", l: "L", xl: "XL" };
const LEADING_LABEL: Record<LeadingKey, string> = {
  tight: "Tight",
  normal: "Normal",
  relaxed: "Relaxed",
};
const THEME_LABEL: Record<ThemeKey, string> = {
  auto: "Auto",
  light: "Light",
  sepia: "Sepia",
  dark: "Dark",
};

const THEME_CHIP: Record<ThemeKey, string> = {
  auto: "linear-gradient(135deg,#faf6ec 0% 50%,#14110d 50% 100%)",
  light: "#faf6ec",
  sepia: "#efe1c0",
  dark: "#14110d",
};

export function SettingsPanel({ open, onClose, settings, onChange, onReset }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="no-print" role="dialog" aria-modal="true" aria-label="Reader settings">
      {/* backdrop */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close settings"
        className="anim-fade-in"
        style={{
          position: "fixed",
          inset: 0,
          background: "color-mix(in srgb, var(--ink) 25%, transparent)",
          border: 0,
          padding: 0,
          cursor: "default",
          zIndex: 50,
        }}
      />

      {/* panel */}
      <aside
        className="anim-slide-in"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100dvh",
          width: "min(420px, 100vw)",
          background: "var(--paper)",
          borderLeft: "1px solid var(--rule-soft)",
          boxShadow: "-12px 0 40px -20px color-mix(in srgb, var(--ink) 35%, transparent)",
          zIndex: 60,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.2rem 1.5rem",
            borderBottom: "1px solid var(--rule-soft)",
            position: "sticky",
            top: 0,
            background: "var(--paper)",
            zIndex: 1,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1.05rem",
              letterSpacing: "0.02em",
            }}
          >
            Reader settings
          </span>
          <button
            type="button"
            onClick={onClose}
            className="chrome-button chrome-button--icon chrome-button--ghost"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div style={{ padding: "1.4rem 1.5rem 2rem", display: "flex", flexDirection: "column", gap: "1.8rem" }}>
          {/* Font */}
          <section>
            <h3 className="section-label">Typeface</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.55rem" }}>
              {FONTS.map((f) => (
                <button
                  key={f}
                  type="button"
                  className="fontcard"
                  aria-pressed={settings.font === f}
                  onClick={() => onChange("font", f)}
                >
                  <span className="fontcard__sample" style={{ fontFamily: FONT_STACKS[f] }}>
                    {FONT_SAMPLES[f]}
                  </span>
                  <span className="fontcard__label">{FONT_LABELS[f]}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Size */}
          <section>
            <h3 className="section-label">Size</h3>
            <div className="segmented" role="group" aria-label="Font size">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={settings.size === s}
                  onClick={() => onChange("size", s)}
                >
                  {SIZE_LABEL[s]}
                </button>
              ))}
            </div>
          </section>

          {/* Leading */}
          <section>
            <h3 className="section-label">Line height</h3>
            <div className="segmented" role="group" aria-label="Line height">
              {LEADINGS.map((l) => (
                <button
                  key={l}
                  type="button"
                  aria-pressed={settings.leading === l}
                  onClick={() => onChange("leading", l)}
                >
                  {LEADING_LABEL[l]}
                </button>
              ))}
            </div>
          </section>

          {/* Theme */}
          <section>
            <h3 className="section-label">Theme</h3>
            <div className="swatchrow" role="group" aria-label="Theme">
              {THEMES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className="swatch"
                  aria-pressed={settings.theme === t}
                  onClick={() => onChange("theme", t)}
                >
                  <span
                    className="swatch__chip"
                    style={{ background: THEME_CHIP[t] }}
                    aria-hidden="true"
                  />
                  <span className="swatch__label">{THEME_LABEL[t]}</span>
                </button>
              ))}
            </div>
          </section>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid var(--rule-soft)",
              paddingTop: "1.2rem",
              marginTop: "0.4rem",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-prose-mono)",
                fontSize: "0.65rem",
                letterSpacing: "0.16em",
                color: "var(--ink-muted)",
                textTransform: "uppercase",
              }}
            >
              Saved locally
            </span>
            <button
              type="button"
              onClick={onReset}
              className="chrome-button chrome-button--ghost"
              style={{ height: "30px", fontSize: "0.65rem" }}
            >
              Reset
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
