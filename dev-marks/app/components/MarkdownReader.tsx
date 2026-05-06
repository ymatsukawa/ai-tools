import { useCallback, useEffect, useRef, useState } from "react";
import { TopBar } from "./TopBar";
import { EmptyState } from "./EmptyState";
import { SettingsPanel } from "./SettingsPanel";
import { MarkdownView } from "./MarkdownView";
import { TOC } from "./TOC";
import { useSettings } from "../hooks/useSettings";
import { extractHeadings, type HeadingItem } from "../lib/headings";

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
    // allow re-selecting the same file
    e.target.value = "";
  }, []);

  // re-extract headings whenever rendered markdown changes
  useEffect(() => {
    if (!markdown) {
      setHeadings([]);
      return;
    }
    // wait one frame for ReactMarkdown to commit
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
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr)",
            padding: "clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 2rem) 6rem",
            maxWidth: "1280px",
            margin: "0 auto",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "3rem",
            }}
            className="reader-grid"
          >
            <MarkdownView ref={proseRef} source={markdown} theme={resolved} />
            <aside
              className="reader-toc"
              style={{
                position: "sticky",
                top: "84px",
                alignSelf: "start",
                maxHeight: "calc(100dvh - 100px)",
                overflow: "auto",
                display: "none",
              }}
            >
              <TOC headings={headings} />
            </aside>
          </div>

          <Footer fileName={fileName} markdown={markdown} />
        </main>
      )}

      {/* Layout: show TOC alongside on lg+ */}
      <style>{`
        @media (min-width: 1100px) {
          .reader-grid {
            grid-template-columns: minmax(0, 1fr) 14rem !important;
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

      {/* prevent flash before hydration */}
      {!hydrated ? <div style={{ position: "fixed", inset: 0, background: "var(--paper)", zIndex: 100, pointerEvents: "none", opacity: 0 }} /> : null}
    </div>
  );
}

function Footer({ fileName, markdown }: { fileName: string | null; markdown: string }) {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return (
    <footer
      className="no-print"
      style={{
        marginTop: "5rem",
        paddingTop: "1.4rem",
        borderTop: "1px solid var(--rule-soft)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "1rem",
        fontFamily: "var(--font-prose-mono)",
        fontSize: "0.7rem",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "var(--ink-muted)",
        maxWidth: "68ch",
        marginInline: "auto",
        width: "100%",
      }}
    >
      <span>{fileName ?? "untitled.md"}</span>
      <span>
        {words.toLocaleString()} words · {minutes} min
      </span>
    </footer>
  );
}
