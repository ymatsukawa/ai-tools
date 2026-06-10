import type { FileDiff } from "~/types/diff";

// Uppercase, word-boundary only: matches "// TODO: fix", not "todoList" or "mastodon".
const TODO_RE = /\b(?:TODO|TBD|FIXME|TMP|TEMP|WIP)\b/;

export const TODO_MARKERS = "TODO / TBD / FIXME / TMP / TEMP / WIP";

export function hasTodoMarker(content: string): boolean {
  return TODO_RE.test(content);
}

export function fileHasTodoMarker(file: FileDiff): boolean {
  return file.hunks.some((hunk) =>
    hunk.lines.some((line) => line.type === "add" && TODO_RE.test(line.content)),
  );
}
