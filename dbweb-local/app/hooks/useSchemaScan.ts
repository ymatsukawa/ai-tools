import { useCallback, useState } from "react";
import type { DbSettings } from "~/utils/settings";
import type { SchemaResponse, TableSchema } from "~/utils/er-types";
import { postJson } from "~/utils/api-client";
import { useRunToken } from "./useRunToken";

export interface ScanProgress {
  done: number;
  total: number;
  current: string;
}

export interface ScanError {
  table: string;
  error: string;
}

export type ScanState =
  | { status: "idle" }
  | { status: "running"; progress: ScanProgress }
  | { status: "done"; schemas: TableSchema[]; errors: ScanError[] };

/**
 * Scans tables one by one (so progress is real, not indeterminate) and
 * accumulates their schemas. Reset, restart, and unmount cancel any
 * in-flight loop via the run token.
 */
export function useSchemaScan() {
  const [state, setState] = useState<ScanState>({ status: "idle" });
  const { begin, isCurrent, invalidate } = useRunToken();

  const reset = useCallback(() => {
    invalidate();
    setState({ status: "idle" });
  }, [invalidate]);

  const start = useCallback(
    async (settings: DbSettings, tables: string[]) => {
      const runId = begin();
      const schemas: TableSchema[] = [];
      const errors: ScanError[] = [];

      for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        setState({
          status: "running",
          progress: { done: i, total: tables.length, current: table },
        });

        const result = await postJson<SchemaResponse>(
          "/api/schema",
          { settings, table },
          (error) => ({ ok: false, error })
        );
        if (!isCurrent(runId)) return;

        if (result.ok) {
          schemas.push(result.schema);
        } else {
          errors.push({ table, error: result.error });
        }
      }

      setState({ status: "done", schemas, errors });
    },
    [begin, isCurrent]
  );

  return { state, start, reset };
}
