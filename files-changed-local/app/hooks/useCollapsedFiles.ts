import { useCallback, useEffect, useState } from "react";
import type { FileDiff } from "~/types/diff";

// Mirrors GitHub: very large and binary diffs start collapsed to keep the
// initial DOM small.
const LARGE_DIFF_THRESHOLD = 800;

export function useCollapsedFiles(files: FileDiff[], compareKey: string) {
  const [collapsed, setCollapsed] = useState<Set<string>>(() =>
    initialCollapsed(files),
  );

  // Depends on compareKey only: `files` is a new array every render, but the
  // collapse state should reset only when a different comparison is loaded.
  useEffect(() => {
    setCollapsed(initialCollapsed(files));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compareKey]);

  const isCollapsed = useCallback(
    (path: string) => collapsed.has(path),
    [collapsed],
  );

  const toggle = useCallback((path: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const expand = useCallback((path: string) => {
    setCollapsed((prev) => {
      if (!prev.has(path)) return prev;
      const next = new Set(prev);
      next.delete(path);
      return next;
    });
  }, []);

  const collapseAll = useCallback(() => {
    setCollapsed(new Set(files.map((f) => f.path)));
  }, [files]);

  const expandAll = useCallback(() => {
    setCollapsed(new Set());
  }, []);

  return { isCollapsed, toggle, expand, collapseAll, expandAll };
}

function initialCollapsed(files: FileDiff[]): Set<string> {
  return new Set(
    files
      .filter((f) => f.binary || f.additions + f.deletions > LARGE_DIFF_THRESHOLD)
      .map((f) => f.path),
  );
}
