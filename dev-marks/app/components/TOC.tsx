import { useEffect, useState } from "react";
import type { HeadingItem } from "../lib/headings";

type Props = {
  headings: HeadingItem[];
};

export function TOC({ headings }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) {
      setActiveId(null);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -65% 0px", threshold: [0, 1] }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav className="toc no-print" aria-label="Table of contents">
      <div className="toc__head">Contents</div>
      <div className="toc__list">
        {headings.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            className="toc__item"
            data-depth={h.depth}
            data-active={activeId === h.id}
          >
            {h.text}
          </a>
        ))}
      </div>
    </nav>
  );
}
