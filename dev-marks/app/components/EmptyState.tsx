type Props = {
  onLoad: () => void;
};

export function EmptyState({ onLoad }: Props) {
  return (
    <section
      className="anim-fade-up"
      style={{
        minHeight: "calc(100dvh - 64px)",
        display: "grid",
        placeItems: "center",
        padding: "clamp(2rem, 8vw, 5rem) 1.5rem",
        position: "relative",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "42rem" }}>
        <div
          aria-hidden="true"
          style={{
            fontFamily: "var(--font-prose-mono)",
            fontSize: "0.7rem",
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "var(--ink-muted)",
            marginBottom: "1.6rem",
          }}
        >
          № 001 — A reading room for developers
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontVariationSettings: '"opsz" 144',
            letterSpacing: "-0.04em",
            fontSize: "clamp(3.5rem, 10vw, 7rem)",
            lineHeight: 0.95,
            color: "var(--ink)",
            margin: 0,
          }}
        >
          DEV<span style={{ color: "var(--accent)" }}>·</span>MARKS
        </h1>

        <p
          style={{
            fontFamily: "var(--font-prose-serif)",
            fontStyle: "italic",
            fontSize: "clamp(1.05rem, 2vw, 1.35rem)",
            color: "var(--ink-soft)",
            marginTop: "1.2rem",
            marginBottom: "0",
            lineHeight: 1.5,
          }}
        >
          An ultra-simple markdown reader.
          <br />
          High visibility. Honest typography. Like reading on paper.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "1.4rem",
            marginTop: "3rem",
          }}
        >
          <button
            type="button"
            onClick={onLoad}
            className="chrome-button"
            style={{
              height: "52px",
              padding: "0 1.6rem",
              fontSize: "0.78rem",
              letterSpacing: "0.22em",
            }}
          >
            <span aria-hidden="true">↗</span>
            <span>Open a Document</span>
          </button>
          <span
            style={{
              fontFamily: "var(--font-prose-mono)",
              fontSize: "0.7rem",
              letterSpacing: "0.12em",
              color: "var(--ink-muted)",
            }}
          >
            .md / .markdown
          </span>
        </div>

        <Marginalia />
      </div>
    </section>
  );
}

function Marginalia() {
  const items = [
    { k: "i.", v: "Adjustable type" },
    { k: "ii.", v: "Three reading themes" },
    { k: "iii.", v: "Syntax-aware code" },
    { k: "iv.", v: "Print-friendly" },
  ];
  return (
    <ul
      style={{
        marginTop: "4rem",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: "1.2rem",
        listStyle: "none",
        padding: 0,
        borderTop: "1px solid var(--rule-soft)",
        paddingTop: "1.6rem",
      }}
    >
      {items.map((it) => (
        <li
          key={it.k}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
            textAlign: "left",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "0.95rem",
              color: "var(--accent)",
            }}
          >
            {it.k}
          </span>
          <span
            style={{
              fontFamily: "var(--font-prose-serif)",
              fontSize: "0.95rem",
              color: "var(--ink-soft)",
            }}
          >
            {it.v}
          </span>
        </li>
      ))}
    </ul>
  );
}
