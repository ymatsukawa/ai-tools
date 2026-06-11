import { useCallback, useEffect, useRef } from "react";

/**
 * Cancellation token for sequential async loops: begin() starts a new run
 * and invalidates the previous one, isCurrent() lets the loop bail out
 * after each await. Unmount invalidates automatically. All returned
 * callbacks are referentially stable.
 */
export function useRunToken() {
  const runIdRef = useRef(0);

  useEffect(() => {
    return () => {
      runIdRef.current++;
    };
  }, []);

  const begin = useCallback(() => ++runIdRef.current, []);
  const isCurrent = useCallback((runId: number) => runIdRef.current === runId, []);
  const invalidate = useCallback(() => {
    runIdRef.current++;
  }, []);

  return { begin, isCurrent, invalidate };
}
