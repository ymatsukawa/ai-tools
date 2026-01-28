export interface Section {
  title: string;
  content: string;
}

export function splitMarkdownBySections(content: string, level: number): Section[] {
  if (!content.trim()) return [];

  const headingPrefix = '#'.repeat(level);
  const regex = new RegExp(`^${headingPrefix}(?!#)\\s+(.*)$`, 'gm');

  const matches: { index: number; title: string }[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    matches.push({ index: match.index, title: match[1].trim() });
  }

  if (matches.length === 0) {
    return [{ title: '', content }];
  }

  const sections: Section[] = [];

  if (matches[0].index > 0) {
    const preamble = content.substring(0, matches[0].index).trim();
    if (preamble) {
      sections.push({ title: '(Preamble)', content: preamble });
    }
  }

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : content.length;
    sections.push({
      title: matches[i].title,
      content: content.substring(start, end).trim()
    });
  }

  return sections;
}
