import { forwardRef, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { CodeBlock } from "./CodeBlock";
import type { ResolvedTheme } from "../lib/theme";

type Props = {
  source: string;
  theme: ResolvedTheme;
};

export const MarkdownView = forwardRef<HTMLDivElement, Props>(function MarkdownView(
  { source, theme },
  ref
) {
  const remarkPlugins = useMemo(() => [remarkGfm], []);
  const rehypePlugins = useMemo(
    () => [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "wrap" }] as any,
    ],
    []
  );

  return (
    <article ref={ref} className="prose anim-fade-up">
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins as any}
        components={{
          code({ className, children, ...rest }) {
            const text = String(children ?? "").replace(/\n$/, "");
            const isBlock = /\n/.test(text) || /language-/.test(className || "");
            if (!isBlock) {
              return <code className={className} {...rest}>{children}</code>;
            }
            const match = /language-([\w-]+)/.exec(className || "");
            return <CodeBlock code={text} lang={match?.[1]} theme={theme} />;
          },
          a({ href, children, ...rest }) {
            const external = href && /^https?:\/\//.test(href);
            return (
              <a
                href={href}
                {...rest}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </article>
  );
});
