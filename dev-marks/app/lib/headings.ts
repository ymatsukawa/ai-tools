export type HeadingItem = {
  id: string;
  depth: 1 | 2 | 3;
  text: string;
};

export function extractHeadings(container: HTMLElement | null): HeadingItem[] {
  if (!container) return [];
  const nodes = container.querySelectorAll<HTMLHeadingElement>("h1[id], h2[id], h3[id]");
  const items: HeadingItem[] = [];
  nodes.forEach((n) => {
    const depth = Number(n.tagName.slice(1)) as 1 | 2 | 3;
    items.push({
      id: n.id,
      depth,
      text: (n.textContent || "").replace(/^§\s*/, "").trim(),
    });
  });
  return items;
}
