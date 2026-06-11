import sqlParser from "node-sql-parser";
import type { DbType } from "./settings";

const { Parser } = sqlParser;

const DIALECT: Record<DbType, string> = {
  mysql: "MySQL",
  postgres: "PostgresQL",
  sqlite: "Sqlite",
};

export type GuardResult = { ok: true } | { ok: false; error: string };

export function guardSql(
  sql: string,
  dbType: DbType,
  readonly: boolean
): GuardResult {
  const parser = new Parser();
  let statements: { type?: string }[];
  try {
    const ast = parser.astify(sql, { database: DIALECT[dbType] });
    statements = Array.isArray(ast) ? ast : [ast];
  } catch {
    if (readonly) {
      return {
        ok: false,
        error:
          "Readonly mode: could not verify the statement is read-only. Only plain SELECT statements are allowed.",
      };
    }
    // Vendor-specific syntax the parser doesn't know — let the driver decide
    return { ok: true };
  }

  if (statements.length > 1) {
    return { ok: false, error: "Execute one statement at a time." };
  }

  if (readonly && statements[0]?.type !== "select") {
    return { ok: false, error: "Readonly mode: only SELECT is allowed." };
  }

  return { ok: true };
}
