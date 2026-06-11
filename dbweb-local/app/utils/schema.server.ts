import type { DbSettings } from "./settings";
import type {
  ColumnInfo,
  ForeignKeyInfo,
  IndexInfo,
  SchemaResponse,
  TableSchema,
} from "./er-types";
import { executeQuery } from "./db.server";

// ---- shared helpers -------------------------------------------------------

type Row = Record<string, unknown>;

function quoteLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

/** Runs a metadata query and returns rows as name→value records. Throws on failure. */
async function queryRows(settings: DbSettings, sql: string): Promise<Row[]> {
  const result = await executeQuery(settings, sql);
  if (!result.ok) throw new Error(result.error);
  if (result.kind !== "rows") return [];
  return result.rows.map((row) =>
    Object.fromEntries(result.columns.map((name, i) => [name, row[i]]))
  );
}

/** information_schema column names arrive lower- or uppercase depending on the server. */
function field(row: Row, name: string): unknown {
  return row[name] ?? row[name.toUpperCase()];
}

function str(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}

function truthy(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || value === "t";
}

/** Groups ordered (index, column, unique) rows into IndexInfo entries. */
function collectIndexes(
  rows: Row[],
  pick: (row: Row) => { index: string; column: string; unique: boolean }
): IndexInfo[] {
  const byName = new Map<string, IndexInfo>();
  for (const row of rows) {
    const { index, column, unique } = pick(row);
    const existing = byName.get(index);
    if (existing) {
      existing.columns.push(column);
    } else {
      byName.set(index, { name: index, columns: [column], unique });
    }
  }
  return [...byName.values()];
}

/** Groups ordered (name, column, refTable, refColumn) rows into ForeignKeyInfo entries. */
function collectForeignKeys(
  rows: Row[],
  pick: (row: Row) => { name: string; column: string; refTable: string; refColumn: string }
): ForeignKeyInfo[] {
  const byName = new Map<string, ForeignKeyInfo>();
  for (const row of rows) {
    const { name, column, refTable, refColumn } = pick(row);
    const existing = byName.get(name);
    if (existing) {
      existing.columns.push(column);
      existing.refColumns.push(refColumn);
    } else {
      byName.set(name, { name, columns: [column], refTable, refColumns: [refColumn] });
    }
  }
  return [...byName.values()];
}

/** Columns covered by a single-column unique index are marked UK on the attribute. */
function markUnique(columns: ColumnInfo[], indexes: IndexInfo[]): void {
  const uniqueSingles = new Set(
    indexes.filter((ix) => ix.unique && ix.columns.length === 1).map((ix) => ix.columns[0])
  );
  for (const col of columns) {
    if (uniqueSingles.has(col.name)) col.isUnique = true;
  }
}

// ---- mysql ----------------------------------------------------------------

async function scanMysql(settings: DbSettings, table: string): Promise<TableSchema> {
  const schema = quoteLiteral(settings.database);
  const name = quoteLiteral(table);

  const columns = await mysqlColumns(settings, schema, name);
  const indexes = await mysqlIndexes(settings, schema, name);
  const foreignKeys = await mysqlForeignKeys(settings, schema, name);

  markUnique(columns, indexes);
  return { name: table, columns, foreignKeys, indexes };
}

async function mysqlColumns(
  settings: DbSettings,
  schema: string,
  name: string
): Promise<ColumnInfo[]> {
  const rows = await queryRows(
    settings,
    `SELECT column_name, column_type, is_nullable, column_key
     FROM information_schema.columns
     WHERE table_schema = ${schema} AND table_name = ${name}
     ORDER BY ordinal_position`
  );
  return rows.map((row) => {
    const key = str(field(row, "column_key"));
    return {
      name: str(field(row, "column_name")),
      dataType: str(field(row, "column_type")),
      nullable: str(field(row, "is_nullable")) === "YES",
      isPrimary: key === "PRI",
      isUnique: key === "UNI",
    };
  });
}

async function mysqlIndexes(
  settings: DbSettings,
  schema: string,
  name: string
): Promise<IndexInfo[]> {
  const rows = await queryRows(
    settings,
    `SELECT index_name, non_unique, column_name
     FROM information_schema.statistics
     WHERE table_schema = ${schema} AND table_name = ${name}
     ORDER BY index_name, seq_in_index`
  );
  return collectIndexes(rows, (row) => ({
    index: str(field(row, "index_name")),
    column: str(field(row, "column_name")),
    unique: !truthy(field(row, "non_unique")),
  }));
}

async function mysqlForeignKeys(
  settings: DbSettings,
  schema: string,
  name: string
): Promise<ForeignKeyInfo[]> {
  const rows = await queryRows(
    settings,
    `SELECT constraint_name, column_name, referenced_table_name, referenced_column_name
     FROM information_schema.key_column_usage
     WHERE table_schema = ${schema} AND table_name = ${name}
       AND referenced_table_name IS NOT NULL
     ORDER BY constraint_name, ordinal_position`
  );
  return collectForeignKeys(rows, (row) => ({
    name: str(field(row, "constraint_name")),
    column: str(field(row, "column_name")),
    refTable: str(field(row, "referenced_table_name")),
    refColumn: str(field(row, "referenced_column_name")),
  }));
}

// ---- postgres ---------------------------------------------------------------

async function scanPostgres(settings: DbSettings, table: string): Promise<TableSchema> {
  const name = quoteLiteral(table);

  const columns = await pgColumns(settings, name);
  const pkColumns = await pgPrimaryKeyColumns(settings, name);
  for (const col of columns) col.isPrimary = pkColumns.has(col.name);

  const indexes = await pgIndexes(settings, name);
  const foreignKeys = await pgForeignKeys(settings, name);

  markUnique(columns, indexes);
  return { name: table, columns, foreignKeys, indexes };
}

async function pgColumns(settings: DbSettings, name: string): Promise<ColumnInfo[]> {
  const rows = await queryRows(
    settings,
    `SELECT column_name, data_type, is_nullable
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = ${name}
     ORDER BY ordinal_position`
  );
  return rows.map((row) => ({
    name: str(row.column_name),
    dataType: str(row.data_type),
    nullable: str(row.is_nullable) === "YES",
    isPrimary: false,
    isUnique: false,
  }));
}

async function pgPrimaryKeyColumns(
  settings: DbSettings,
  name: string
): Promise<Set<string>> {
  const rows = await queryRows(
    settings,
    `SELECT kcu.column_name
     FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu
       ON kcu.constraint_name = tc.constraint_name AND kcu.table_schema = tc.table_schema
     WHERE tc.table_schema = 'public' AND tc.table_name = ${name}
       AND tc.constraint_type = 'PRIMARY KEY'`
  );
  return new Set(rows.map((row) => str(row.column_name)));
}

async function pgIndexes(settings: DbSettings, name: string): Promise<IndexInfo[]> {
  const rows = await queryRows(
    settings,
    `SELECT i.relname AS index_name, ix.indisunique AS is_unique, a.attname AS column_name
     FROM pg_class t
     JOIN pg_index ix ON ix.indrelid = t.oid
     JOIN pg_class i ON i.oid = ix.indexrelid
     JOIN LATERAL unnest(ix.indkey) WITH ORDINALITY AS k(attnum, ord) ON true
     JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = k.attnum
     WHERE t.relname = ${name} AND t.relnamespace = 'public'::regnamespace
     ORDER BY i.relname, k.ord`
  );
  return collectIndexes(rows, (row) => ({
    index: str(row.index_name),
    column: str(row.column_name),
    unique: truthy(row.is_unique),
  }));
}

async function pgForeignKeys(
  settings: DbSettings,
  name: string
): Promise<ForeignKeyInfo[]> {
  const rows = await queryRows(
    settings,
    `SELECT con.conname AS name, att.attname AS column_name,
            ref.relname AS ref_table, refatt.attname AS ref_column
     FROM pg_constraint con
     JOIN pg_class rel ON rel.oid = con.conrelid
     JOIN pg_class ref ON ref.oid = con.confrelid
     JOIN LATERAL unnest(con.conkey, con.confkey) WITH ORDINALITY AS k(attnum, refattnum, ord) ON true
     JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = k.attnum
     JOIN pg_attribute refatt ON refatt.attrelid = con.confrelid AND refatt.attnum = k.refattnum
     WHERE con.contype = 'f' AND rel.relname = ${name}
       AND rel.relnamespace = 'public'::regnamespace
     ORDER BY con.conname, k.ord`
  );
  return collectForeignKeys(rows, (row) => ({
    name: str(row.name),
    column: str(row.column_name),
    refTable: str(row.ref_table),
    refColumn: str(row.ref_column),
  }));
}

// ---- sqlite -----------------------------------------------------------------

async function scanSqlite(settings: DbSettings, table: string): Promise<TableSchema> {
  const name = quoteLiteral(table);

  const columnRows = await queryRows(settings, `PRAGMA table_info(${name})`);
  const columns: ColumnInfo[] = columnRows.map((row) => ({
    name: str(row.name),
    dataType: str(row.type) || "any",
    nullable: !truthy(row.notnull) && Number(row.pk) === 0,
    isPrimary: Number(row.pk) > 0,
    isUnique: false,
  }));

  const indexes = await sqliteIndexes(settings, name);

  const fkRows = await queryRows(settings, `PRAGMA foreign_key_list(${name})`);
  const foreignKeys = collectForeignKeys(fkRows, (row) => ({
    // sqlite has no constraint name — group by the fk id instead
    name: `fk_${str(row.id)}`,
    column: str(row.from),
    refTable: str(row.table),
    // `to` is null when the fk references the parent's implicit primary key
    refColumn: str(row.to),
  }));

  markUnique(columns, indexes);
  return { name: table, columns, foreignKeys, indexes };
}

async function sqliteIndexes(settings: DbSettings, name: string): Promise<IndexInfo[]> {
  const listRows = await queryRows(settings, `PRAGMA index_list(${name})`);
  const indexes: IndexInfo[] = [];
  for (const ix of listRows) {
    const ixName = str(ix.name);
    const infoRows = await queryRows(
      settings,
      `PRAGMA index_info(${quoteLiteral(ixName)})`
    );
    indexes.push({
      name: ixName,
      columns: infoRows.map((row) => str(row.name)),
      unique: truthy(ix.unique),
    });
  }
  return indexes;
}

// ---- public API ----------------------------------------------------------------

export async function scanTable(
  settings: DbSettings,
  table: string
): Promise<SchemaResponse> {
  try {
    switch (settings.type) {
      case "mysql":
        return { ok: true, schema: await scanMysql(settings, table) };
      case "postgres":
        return { ok: true, schema: await scanPostgres(settings, table) };
      case "sqlite":
        return { ok: true, schema: await scanSqlite(settings, table) };
      default:
        return { ok: false, error: `Unsupported db type: ${String(settings.type)}` };
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
