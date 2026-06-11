import { useCallback, useState } from "react";
import type { DbSettings } from "~/utils/settings";
import type { QueryResponse } from "~/utils/api-types";
import { parseBatchTemplate } from "~/utils/batch-template";
import { postJson } from "~/utils/api-client";
import { useRunToken } from "./useRunToken";

export interface BatchFailure {
  /** 1-based row number. */
  index: number;
  error: string;
}

export type BatchState =
  | { status: "idle" }
  | { status: "error"; error: string }
  | { status: "running"; done: number; total: number }
  | {
      status: "done";
      total: number;
      succeeded: number;
      failures: BatchFailure[];
      /** The rendered statement, shown for test runs only. */
      testSql: string | null;
      durationMs: number;
    };

/**
 * Expands a placeholder template and executes the statements one by one
 * (so progress is real and a failure doesn't stop the rest). Reset,
 * restart, and unmount cancel any in-flight loop via the run token.
 */
export function useBatchRun() {
  const [state, setState] = useState<BatchState>({ status: "idle" });
  const { begin, isCurrent, invalidate } = useRunToken();

  const reset = useCallback(() => {
    invalidate();
    setState({ status: "idle" });
  }, [invalidate]);

  const start = useCallback(
    async (settings: DbSettings, sql: string, opts: { test: boolean }) => {
      const runId = begin();

      const parsed = parseBatchTemplate(sql);
      if (!parsed.ok) {
        setState({ status: "error", error: parsed.error });
        return;
      }

      const total = opts.test ? 1 : parsed.template.count;
      const failures: BatchFailure[] = [];
      let succeeded = 0;
      let testSql: string | null = null;
      const startedAt = performance.now();

      for (let i = 0; i < total; i++) {
        setState({ status: "running", done: i, total });
        const rendered = parsed.template.render(i);
        if (opts.test) testSql = rendered;

        const result = await postJson<QueryResponse>(
          "/api/query",
          { settings, sql: rendered },
          (error) => ({ ok: false, errorKind: "connection", error })
        );
        if (!isCurrent(runId)) return;

        if (result.ok) {
          succeeded++;
        } else {
          failures.push({ index: i + 1, error: result.error });
        }
      }

      setState({
        status: "done",
        total,
        succeeded,
        failures,
        testSql,
        durationMs: Math.round(performance.now() - startedAt),
      });
    },
    [begin, isCurrent]
  );

  const isRunning = state.status === "running";

  return { state, start, reset, isRunning };
}
