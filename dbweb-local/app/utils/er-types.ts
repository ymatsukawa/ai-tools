import type { DbSettings } from "./settings";

export type ColumnInfo = {
  name: string;
  dataType: string;
  nullable: boolean;
  isPrimary: boolean;
  isUnique: boolean;
};

export type ForeignKeyInfo = {
  /** Constraint name when the dialect provides one. */
  name: string;
  columns: string[];
  refTable: string;
  refColumns: string[];
};

export type IndexInfo = {
  name: string;
  columns: string[];
  unique: boolean;
};

export type TableSchema = {
  name: string;
  columns: ColumnInfo[];
  foreignKeys: ForeignKeyInfo[];
  indexes: IndexInfo[];
};

export type SchemaRequest = {
  settings: DbSettings;
  table: string;
};

export type SchemaResponse =
  | { ok: true; schema: TableSchema }
  | { ok: false; error: string };
