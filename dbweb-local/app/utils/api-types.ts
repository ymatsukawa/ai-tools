import type { DbSettings } from "./settings";

export const MAX_ROWS = 1000;

export type QueryRequest = {
  settings: DbSettings;
  sql: string;
};

export type TablesRequest = {
  settings: DbSettings;
};

export type QueryErrorKind = "connection" | "sql" | "readonly" | "validation";

export type QueryResponse =
  | {
      ok: true;
      kind: "rows";
      columns: string[];
      rows: unknown[][];
      rowCount: number;
      truncated: boolean;
      durationMs: number;
    }
  | { ok: true; kind: "write"; affectedRows: number; durationMs: number }
  | { ok: false; error: string; errorKind: QueryErrorKind };

export type TablesResponse =
  | { ok: true; database: string; tables: string[] }
  | { ok: false; error: string };
