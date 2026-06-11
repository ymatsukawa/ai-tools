import { useCallback, useRef } from "react";
import { useFetcher } from "react-router";
import type { QueryResponse, TablesResponse } from "~/utils/api-types";
import type { DbSettings } from "~/utils/settings";

/**
 * useFetcher wrapper that POSTs a JSON body to a resource route.
 * `post` is referentially stable so it can be used in effect deps.
 */
function useJsonPost<TResponse, TPayload>(action: string) {
  const fetcher = useFetcher<TResponse>();

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const post = useCallback(
    (payload: TPayload) => {
      fetcherRef.current.submit(payload as Parameters<typeof fetcher.submit>[0], {
        method: "post",
        action,
        encType: "application/json",
      });
    },
    [action]
  );

  return { post, data: fetcher.data, isLoading: fetcher.state !== "idle" };
}

export function useExecuteQuery() {
  const { post, data, isLoading } = useJsonPost<
    QueryResponse,
    { settings: DbSettings; sql: string }
  >("/api/query");

  const run = useCallback(
    (settings: DbSettings, sql: string) => post({ settings, sql }),
    [post]
  );

  return { run, result: data, isRunning: isLoading };
}

export function useTables() {
  const { post, data, isLoading } = useJsonPost<
    TablesResponse,
    { settings: DbSettings }
  >("/api/tables");

  const refresh = useCallback(
    (settings: DbSettings) => post({ settings }),
    [post]
  );

  return { refresh, data, isLoading };
}
