import { useAutoHideOnScroll } from "../hooks/useAutoHideOnScroll";

type Props = {
  fileName: string | null;
  onLoad: () => void;
  onSettings: () => void;
};

export function TopBar({ fileName, onLoad, onSettings }: Props) {
  const visible = useAutoHideOnScroll();

  return (
    <header
      className="no-print"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "color-mix(in srgb, var(--paper) 88%, transparent)",
        backdropFilter: "saturate(140%) blur(8px)",
        WebkitBackdropFilter: "saturate(140%) blur(8px)",
        borderBottom: "1px solid var(--rule-soft)",
        transform: visible ? "translateY(0)" : "translateY(-110%)",
        transition: "transform 220ms cubic-bezier(0.2, 0.7, 0.2, 1)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          padding: "0.85rem clamp(1rem, 4vw, 2rem)",
          maxWidth: "1280px",
          margin: "0 auto",
        }}
      >
        <button
          type="button"
          onClick={onLoad}
          className="chrome-button"
          aria-label="Open a markdown file"
        >
          <span aria-hidden="true" style={{ fontSize: "0.9rem" }}>
            ↗
          </span>
          <span>Open</span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", minWidth: 0 }}>
          <span className="wordmark" aria-label="Dev Marks">
            DEV<span className="wordmark__dot">·</span>MARKS
          </span>
          {fileName ? (
            <span
              style={{
                fontFamily: "var(--font-prose-mono)",
                fontSize: "0.7rem",
                letterSpacing: "0.08em",
                color: "var(--ink-muted)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "30ch",
                display: "none",
              }}
              className="topbar__filename"
            >
              — {fileName}
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onSettings}
          className="chrome-button chrome-button--icon"
          aria-label="Open settings"
        >
          <GearIcon />
        </button>
      </div>

      <style>{`
        @media (min-width: 720px) {
          .topbar__filename { display: inline !important; }
        }
      `}</style>
    </header>
  );
}

function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  );
}
