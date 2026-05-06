import { useEffect, useRef, useState } from "react";
import { getHighlighter, normalizeLang } from "../lib/shiki";
import { shikiThemeFor, type ResolvedTheme } from "../lib/theme";

type Props = {
  code: string;
  lang: string | undefined;
  theme: ResolvedTheme;
};

export function CodeBlock({ code, lang, theme }: Props) {
  const [html, setHtml] = useState<string | null>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    const shikiTheme = shikiThemeFor(theme);
    const normalized = normalizeLang(lang);
    getHighlighter()
      .then((h) => {
        if (!alive.current) return;
        try {
          const out = h.codeToHtml(code, { lang: normalized, theme: shikiTheme });
          setHtml(out);
        } catch {
          // unknown lang — render plain
          const escaped = code
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
          setHtml(`<pre class="shiki"><code>${escaped}</code></pre>`);
        }
      })
      .catch(() => {
        if (!alive.current) return;
        setHtml(null);
      });
    return () => {
      alive.current = false;
    };
  }, [code, lang, theme]);

  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* ignore */
    }
  };

  const langLabel = (lang || "txt").toLowerCase();

  return (
    <div className="code-frame">
      <span className="code-frame__lang" aria-hidden="true">
        {langLabel}
      </span>
      <button
        type="button"
        onClick={onCopy}
        className="code-frame__copy no-print"
        data-copied={copied}
        aria-label="Copy code"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre>
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
