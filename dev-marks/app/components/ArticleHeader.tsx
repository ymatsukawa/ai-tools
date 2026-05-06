type Props = {
  fileName: string;
  title: string;
};

function nicerTitle(fileName: string, title: string): string {
  if (title) return title;
  return fileName.replace(/\.(md|markdown)$/i, "").replace(/[-_]+/g, " ");
}

export function ArticleHeader({ fileName, title }: Props) {
  const display = nicerTitle(fileName, title);
  return (
    <header
      className="anim-fade-up"
      style={{
        maxWidth: "720px",
        marginInline: "auto",
        marginBottom: "2rem",
        paddingBottom: "1.4rem",
        borderBottom: "1px solid var(--rule-soft)",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          lineHeight: 1.08,
          fontSize: "clamp(1.95rem, 4.4vw, 2.85rem)",
          margin: 0,
          color: "var(--ink)",
          textTransform: "capitalize",
        }}
      >
        {display}
      </h1>
    </header>
  );
}
