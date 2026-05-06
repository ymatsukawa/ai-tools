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
      <div className="code-frame__header no-print">
        <span className="code-frame__lang" aria-hidden="true">
          {langLabel}
        </span>
        <button
          type="button"
          onClick={onCopy}
          className="code-frame__copy"
          data-copied={copied}
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
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
