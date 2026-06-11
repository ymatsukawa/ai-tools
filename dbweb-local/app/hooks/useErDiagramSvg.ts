import { useEffect, useState } from "react";

let renderSeq = 0;

/**
 * Renders mermaid erDiagram text to an SVG string. Mermaid is imported
 * lazily — it is a large client-only bundle.
 */
export function useErDiagramSvg(code: string) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "default",
          // er.fontSize alone has no effect on the v11 unified renderer
          themeVariables: { fontSize: "16px" },
          er: { useMaxWidth: false, fontSize: 16 },
          maxTextSize: 1_000_000,
          maxEdges: 10_000,
        });
        const rendered = await mermaid.render(`er-diagram-${++renderSeq}`, code);
        if (cancelled) return;
        setSvg(rendered.svg);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setSvg(null);
        setError(err instanceof Error ? err.message : String(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  return { svg, error };
}
