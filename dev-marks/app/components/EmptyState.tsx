type Props = {
  onLoad: () => void;
};

const HERO_TAGS = [
  { label: "markdown", cls: "chip--mint" },
  { label: "reading", cls: "chip--coral" },
  { label: "typography", cls: "chip--lavender" },
  { label: "developers", cls: "chip--tangerine" },
];

const FEATURES = [
  {
    title: "Built for reading.",
    body: "A focused 720-pixel column, generous leading, and a typeface for every mood — sans, serif, mono, or accessibility-tuned.",
  },
  {
    title: "Code that reads well.",
    body: "Shiki-powered syntax highlighting in twenty-plus languages. Copy-to-clipboard on every block, hover to reveal.",
  },
  {
    title: "Three reading themes.",
    body: "Light by day, sepia for the long form, dark for the late nights. Auto follows your system, locally remembered.",
  },
];

export function EmptyState({ onLoad }: Props) {
  return (
    <section
      className="anim-fade-up"
      style={{
        minHeight: "calc(100dvh - 64px)",
        padding: "clamp(2.5rem, 7vw, 5rem) clamp(1.25rem, 4vw, 2rem) 5rem",
        position: "relative",
      }}
    >
      <div style={{ maxWidth: "880px", margin: "0 auto", textAlign: "center" }}>
        <div
          className="anim-pop"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.4rem 0.9rem",
            background: "var(--primary-soft)",
            color: "var(--primary)",
            borderRadius: "999px",
            fontFamily: "var(--font-display)",
            fontSize: "0.78rem",
            fontWeight: 700,
            letterSpacing: "-0.005em",
            marginBottom: "1.5rem",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "var(--primary)",
              boxShadow: "0 0 0 4px color-mix(in srgb, var(--primary) 25%, transparent)",
              animation: "dm-pulse 2s ease-in-out infinite",
            }}
          />
          A reading room for developers
        </div>

        <h1
          className="anim-fade-up"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            fontSize: "clamp(2.6rem, 7vw, 4.6rem)",
            lineHeight: 1.02,
            color: "var(--ink)",
            margin: 0,
            animationDelay: "60ms",
          }}
        >
          Read markdown
          <br />
          like a <span style={{ color: "var(--primary)" }}>developer</span>.
        </h1>

        <p
          className="anim-fade-up"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.05rem, 1.6vw, 1.25rem)",
            color: "var(--ink-soft)",
            marginTop: "1.4rem",
            marginBottom: "2.2rem",
            lineHeight: 1.55,
            maxWidth: "44ch",
            marginInline: "auto",
            animationDelay: "140ms",
          }}
        >
          An ultra-simple markdown viewer with high-visibility typography,
          three reading themes, and code blocks that look as good as they read.
        </p>

        <div
          className="anim-fade-up"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "0.45rem",
            marginBottom: "2.4rem",
            animationDelay: "220ms",
          }}
        >
          {HERO_TAGS.map((t) => (
            <span key={t.label} className={`chip ${t.cls}`}>
              {t.label}
            </span>
          ))}
        </div>

        <div
          className="anim-fade-up"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.85rem",
            animationDelay: "300ms",
          }}
        >
          <button type="button" onClick={onLoad} className="btn btn--mint btn--lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 3v4a1 1 0 0 0 1 1h4" />
              <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
              <path d="M9 13h6M9 17h4" />
            </svg>
            <span>Open a markdown file</span>
          </button>
          <span
            style={{
              fontFamily: "var(--font-prose-mono)",
              fontSize: "0.78rem",
              letterSpacing: "0.02em",
              color: "var(--ink-muted)",
            }}
          >
            .md / .markdown · stays on your device
          </span>
        </div>
      </div>

      <FeatureCards />

      <style>{`
        @keyframes dm-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.25); opacity: 0.6; }
        }
      `}</style>
    </section>
  );
}

function FeatureCards() {
  return (
    <ul
      className="anim-stagger"
      style={{
        listStyle: "none",
        padding: 0,
        margin: "5rem auto 0",
        maxWidth: "1080px",
        display: "grid",
        gap: "1rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
      }}
    >
      {FEATURES.map((f, i) => (
        <li
          key={f.title}
          style={{
            background: "var(--paper)",
            border: "1px solid var(--rule-soft)",
            borderRadius: "16px",
            padding: "1.5rem 1.6rem",
            textAlign: "left",
            boxShadow: "var(--shadow-sm)",
            transition: "transform 240ms cubic-bezier(0.2, 0.7, 0.2, 1), box-shadow 240ms ease",
            cursor: "default",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "var(--shadow-md)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "";
            e.currentTarget.style.boxShadow = "var(--shadow-sm)";
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-prose-mono)",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: "var(--primary)",
              marginBottom: "0.6rem",
            }}
          >
            № 0{i + 1}
          </div>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "1.18rem",
              letterSpacing: "-0.02em",
              margin: 0,
              color: "var(--ink)",
            }}
          >
            {f.title}
          </h3>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.92rem",
              color: "var(--ink-soft)",
              lineHeight: 1.55,
              marginTop: "0.55rem",
              marginBottom: 0,
            }}
          >
            {f.body}
          </p>
        </li>
      ))}
    </ul>
  );
}
