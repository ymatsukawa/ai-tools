import { useRef, useState } from "react";
import { getUrlHost, isLocalhostUrl } from "../utils/curl";

export function useTestConfirm() {
  const confirmedHosts = useRef<Set<string>>(new Set());
  const pendingRun = useRef<(() => void) | null>(null);
  const [pendingHost, setPendingHost] = useState<string | null>(null);

  function requestTest(url: string, run: () => void) {
    const host = getUrlHost(url);
    if (
      host === null ||
      isLocalhostUrl(url) ||
      confirmedHosts.current.has(host)
    ) {
      run();
      return;
    }
    pendingRun.current = run;
    setPendingHost(host);
  }

  function confirm() {
    if (pendingHost !== null) {
      confirmedHosts.current.add(pendingHost);
    }
    const run = pendingRun.current;
    pendingRun.current = null;
    setPendingHost(null);
    run?.();
  }

  function cancel() {
    pendingRun.current = null;
    setPendingHost(null);
  }

  return { pendingHost, requestTest, confirm, cancel };
}
