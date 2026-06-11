import { format } from "sql-formatter";
import type { DbType } from "./settings";

const LANGUAGE: Record<DbType, "mysql" | "postgresql" | "sqlite"> = {
  mysql: "mysql",
  postgres: "postgresql",
  sqlite: "sqlite",
};

export function formatSql(sql: string, dbType: DbType): string {
  try {
    return format(sql, {
      language: LANGUAGE[dbType],
      keywordCase: "upper",
      tabWidth: 2,
    });
  } catch {
    // unparseable SQL — leave the input untouched
    return sql;
  }
}
