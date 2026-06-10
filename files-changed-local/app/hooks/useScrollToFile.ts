import { useCallback, useRef } from "react";

// Height of the sticky top bar (h-14 in RepoForm); scroll targets land just
// below it instead of underneath. Keep in sync with the bar's Tailwind class.
export const STICKY_BAR_HEIGHT = 56;

export function useScrollToFile() {
  const refs = useRef<Map<string, HTMLElement>>(new Map());

  const registerRef = useCallback(
    (path: string) => (el: HTMLElement | null) => {
      if (el) refs.current.set(path, el);
      else refs.current.delete(path);
    },
    [],
  );

  const scrollToFile = useCallback((path: string) => {
    const el = refs.current.get(path);
    if (!el) return;
    const top =
      el.getBoundingClientRect().top + window.scrollY - STICKY_BAR_HEIGHT;
    window.scrollTo({ top });
  }, []);

  return { registerRef, scrollToFile };
}
