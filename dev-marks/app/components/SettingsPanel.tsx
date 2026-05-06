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
  auto: "linear-gradient(135deg,#ffffff 0% 50%,#0c0c0c 50% 100%)",
  light: "#ffffff",
  sepia: "#fbf6ec",
  dark: "#0c0c0c",
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
      <button
        type="button"
        onClick={onClose}
        aria-label="Close settings"
        className="anim-fade-in"
        style={{
          position: "fixed",
          inset: 0,
          background: "color-mix(in srgb, var(--ink) 35%, transparent)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          border: 0,
          padding: 0,
          cursor: "default",
          zIndex: 50,
        }}
      />

      <aside
        className="anim-slide-in"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100dvh",
          width: "min(440px, 100vw)",
          background: "var(--paper)",
          borderLeft: "1px solid var(--rule-soft)",
          boxShadow: "var(--shadow-lg)",
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
            padding: "1.1rem 1.4rem",
            borderBottom: "1px solid var(--rule-soft)",
            position: "sticky",
            top: 0,
            background: "color-mix(in srgb, var(--paper) 92%, transparent)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            zIndex: 1,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "1.05rem",
              letterSpacing: "-0.02em",
              display: "inline-flex",
              alignItems: "baseline",
              gap: "0.35em",
            }}
          >
            <span style={{ color: "var(--primary)", fontWeight: 800 }}>#</span>
            settings
          </span>
          <button
            type="button"
            onClick={onClose}
            className="btn btn--ghost btn--icon"
            style={{ height: "32px", width: "32px" }}
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div style={{ padding: "1.4rem 1.4rem 2rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
          <section>
            <h3 className="section-label">
              <span className="section-label__hash">#</span> typeface
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
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

          <section>
            <h3 className="section-label">
              <span className="section-label__hash">#</span> size
            </h3>
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

          <section>
            <h3 className="section-label">
              <span className="section-label__hash">#</span> line height
            </h3>
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

          <section>
            <h3 className="section-label">
              <span className="section-label__hash">#</span> theme
            </h3>
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
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4em",
                fontFamily: "var(--font-display)",
                fontSize: "0.76rem",
                fontWeight: 600,
                color: "var(--ink-muted)",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Saved on this device
            </span>
            <button
              type="button"
              onClick={onReset}
              className="btn btn--ghost"
              style={{ height: "32px", padding: "0 0.85rem", fontSize: "0.78rem" }}
            >
              Reset
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
