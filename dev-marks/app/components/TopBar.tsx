import { useAutoHideOnScroll } from "../hooks/useAutoHideOnScroll";

type Props = {
  fileName: string | null;
  onLoad: () => void;
  onSettings: () => void;
};

export function TopBar({ fileName, onLoad, onSettings }: Props) {
  const visible = useAutoHideOnScroll();
  const hasFile = fileName !== null;

  return (
    <header
      className="no-print"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "color-mix(in srgb, var(--paper) 88%, transparent)",
        backdropFilter: "saturate(160%) blur(12px)",
        WebkitBackdropFilter: "saturate(160%) blur(12px)",
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
          padding: "0.7rem clamp(1rem, 4vw, 2rem)",
          maxWidth: "1280px",
          margin: "0 auto",
        }}
      >
        {hasFile ? (
          <div
            aria-label="Dev Marks"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.7rem",
              color: "inherit",
              minWidth: 0,
              cursor: "default",
              userSelect: "none",
            }}
          >
            <span className="logo-block logo-block--static" aria-hidden="true">
              DM
            </span>
            <span className="wordmark topbar__wordmark" aria-hidden="true">
              <span>DEV</span>
              <span className="wordmark__accent">/</span>
              <span>MARKS</span>
            </span>
          </div>
        ) : (
          <a
            href="/"
            aria-label="Dev Marks home"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.7rem",
              textDecoration: "none",
              color: "inherit",
              minWidth: 0,
            }}
          >
            <span className="logo-block" aria-hidden="true">
              DM
            </span>
            <span className="wordmark topbar__wordmark" aria-hidden="true">
              <span>DEV</span>
              <span className="wordmark__accent">/</span>
              <span>MARKS</span>
            </span>
          </a>
        )}

        {hasFile ? (
          <span
            className="topbar__filename"
            title={fileName ?? undefined}
            style={{
              fontFamily: "var(--font-prose-mono)",
              fontSize: "0.78rem",
              color: "var(--ink-soft)",
              fontWeight: 500,
              padding: "0.35em 0.75em",
              background: "var(--surface)",
              border: "1px solid var(--rule-soft)",
              borderRadius: "999px",
              maxWidth: "28ch",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "none",
            }}
          >
            {fileName}
          </span>
        ) : null}

        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
          {hasFile ? (
            <button
              type="button"
              onClick={() => window.print()}
              className="reaction reaction--compact"
              aria-label="Print"
              title="Print"
              style={{ marginRight: "0.15rem" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 9V2h12v7" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" rx="1" />
              </svg>
              <span className="reaction__label">Print</span>
            </button>
          ) : null}

          <button type="button" onClick={onLoad} className="btn btn--mint" aria-label="Open a markdown file">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span className="btn__label">Open</span>
          </button>
          <button
            type="button"
            onClick={onSettings}
            className="btn btn--ghost btn--icon"
            aria-label="Open settings"
          >
            <GearIcon />
          </button>
        </div>
      </div>

      <style>{`
        .topbar__wordmark { display: none; }
        .reaction--compact .reaction__label { display: none; }
        @media (min-width: 560px) {
          .topbar__wordmark { display: inline-flex; }
        }
        @media (min-width: 760px) {
          .topbar__filename { display: inline-flex !important; }
        }
        @media (min-width: 900px) {
          .reaction--compact .reaction__label { display: inline; }
        }
      `}</style>
    </header>
  );
}

function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  );
}
