import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TopBar } from "./TopBar";
import { EmptyState } from "./EmptyState";
import { SettingsPanel } from "./SettingsPanel";
import { MarkdownView } from "./MarkdownView";
import { TOC } from "./TOC";
import { ArticleHeader } from "./ArticleHeader";
import { useSettings } from "../hooks/useSettings";
import { extractHeadings, type HeadingItem } from "../lib/headings";

function splitTitle(source: string): { title: string; rest: string } {
  // strip a leading H1 ("# Title") and use it as the article title
  const match = source.match(/^\s*#\s+(.+?)\s*\n+/);
  if (!match) return { title: "", rest: source };
  return { title: match[1].trim(), rest: source.slice(match[0].length) };
}

export function MarkdownReader() {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [headings, setHeadings] = useState<HeadingItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const proseRef = useRef<HTMLDivElement>(null);

  const { settings, update, reset, resolved, hydrated } = useSettings();

  const triggerLoad = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setMarkdown(String(reader.result ?? ""));
      setFileName(file.name);
      window.scrollTo({ top: 0, behavior: "auto" });
    };
    reader.readAsText(file);
    e.target.value = "";
  }, []);

  const { title, rest } = useMemo(
    () => (markdown ? splitTitle(markdown) : { title: "", rest: "" }),
    [markdown]
  );

  useEffect(() => {
    if (!markdown) {
      setHeadings([]);
      return;
    }
    const id = requestAnimationFrame(() => {
      setHeadings(extractHeadings(proseRef.current));
    });
    return () => cancelAnimationFrame(id);
  }, [markdown]);

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown,text/markdown,text/plain"
        onChange={onFile}
        hidden
      />

      <TopBar fileName={fileName} onLoad={triggerLoad} onSettings={() => setSettingsOpen(true)} />

      {markdown === null ? (
        <EmptyState onLoad={triggerLoad} />
      ) : (
        <main
          style={{
            padding: "clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 2rem) 6rem",
            maxWidth: "1280px",
            margin: "0 auto",
            position: "relative",
          }}
        >
          <div
            className="reader-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "3rem",
              alignItems: "start",
            }}
          >
            <div>
              <ArticleHeader fileName={fileName ?? "untitled.md"} title={title} />
              <MarkdownView ref={proseRef} source={rest} theme={resolved} />
              <Footer fileName={fileName ?? "untitled.md"} />
            </div>
            <aside
              className="reader-toc"
              style={{
                position: "sticky",
                top: "84px",
                alignSelf: "start",
                maxHeight: "calc(100dvh - 100px)",
                overflow: "auto",
                display: "none",
                paddingTop: "0.4rem",
              }}
            >
              <TOC headings={headings} />
            </aside>
          </div>
        </main>
      )}

      <style>{`
        @media (min-width: 1100px) {
          .reader-grid {
            grid-template-columns: minmax(0, 1fr) 15rem !important;
          }
          .reader-toc { display: block !important; }
        }
      `}</style>

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onChange={update}
        onReset={reset}
      />

      {!hydrated ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "var(--paper)",
            zIndex: 100,
            pointerEvents: "none",
            opacity: 0,
          }}
        />
      ) : null}
    </div>
  );
}

function Footer({ fileName }: { fileName: string }) {
  return (
    <footer
      className="no-print"
      style={{
        marginTop: "4rem",
        paddingTop: "1.6rem",
        borderTop: "1px solid var(--rule-soft)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem",
        fontFamily: "var(--font-display)",
        fontSize: "0.8rem",
        color: "var(--ink-muted)",
        maxWidth: "720px",
        marginInline: "auto",
        width: "100%",
      }}
    >
      <span style={{ fontFamily: "var(--font-prose-mono)", fontSize: "0.78rem" }}>
        {fileName}
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4em" }}>
        Read on
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            color: "var(--ink)",
          }}
        >
          DEV<span style={{ color: "var(--primary)" }}>/</span>MARKS
        </span>
      </span>
    </footer>
  );
}
