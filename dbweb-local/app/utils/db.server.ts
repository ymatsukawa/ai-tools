import { existsSync } from "node:fs";
import { isAbsolute, basename } from "node:path";
import type { Connection as MysqlConnection } from "mysql2/promise";
import type { Client as PgClient } from "pg";
import type { Database as SqliteDatabase } from "better-sqlite3";
import type { DbSettings, DbType } from "./settings";
import { MAX_ROWS, type QueryResponse, type TablesResponse } from "./api-types";
import { effectiveReadonly } from "./localhost";

// ---- connection cache --------------------------------------------------
// One live connection at a time, kept open across requests for the lifetime
// of the server process. Replaced when the connection settings change,
// evicted when a connection-level error occurs.

type Closer = () => Promise<void> | void;

let cache: {
  key: string;
  type: DbType;
  handle: unknown;
  close: Closer;
} | null = null;

function connKey(s: DbSettings): string {
  return JSON.stringify([
    s.type,
    s.host,
    s.port,
    s.user,
    s.password,
    s.database,
    s.sqlitePath,
    // sqlite open mode depends on readonly
    s.type === "sqlite" ? effectiveReadonly(s) : null,
  ]);
}

async function evict(): Promise<void> {
  if (!cache) return;
  const { close } = cache;
  cache = null;
  try {
    await close();
  } catch {
    // already dead — nothing to do
  }
}

// ---- shared helpers -----------------------------------------------------

function serializeValue(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "bigint") return String(value);
  if (value instanceof Uint8Array) {
    const hex = Buffer.from(value).toString("hex");
    return "0x" + (hex.length > 64 ? hex.slice(0, 64) + "…" : hex);
  }
  if (typeof value === "object") return JSON.stringify(value);
  return value;
}

function rowsResponse(
  columns: string[],
  allRows: unknown[][],
  durationMs: number
): QueryResponse {
  const truncated = allRows.length > MAX_ROWS;
  const rows = (truncated ? allRows.slice(0, MAX_ROWS) : allRows).map((row) =>
    row.map(serializeValue)
  );
  return {
    ok: true,
    kind: "rows",
    columns,
    rows,
    rowCount: allRows.length,
    truncated,
    durationMs: Math.round(durationMs),
  };
}

function writeResponse(affectedRows: number, durationMs: number): QueryResponse {
  return {
    ok: true,
    kind: "write",
    affectedRows,
    durationMs: Math.round(durationMs),
  };
}

function errorMessage(err: unknown): string {
  if (!(err instanceof Error)) return String(err);
  if (err.message) return err.message;
  // ECONNREFUSED etc. arrive as AggregateError with an empty message
  if (err instanceof AggregateError && err.errors.length > 0) {
    return err.errors.map(errorMessage).join("; ");
  }
  const code = (err as { code?: string }).code;
  return code ?? err.name;
}

const CONNECTION_ERROR_CODES = new Set([
  "ECONNREFUSED",
  "ETIMEDOUT",
  "ENOTFOUND",
  "EHOSTUNREACH",
  "ECONNRESET",
  "EPIPE",
  "PROTOCOL_CONNECTION_LOST",
  "ER_ACCESS_DENIED_ERROR",
  "ER_BAD_DB_ERROR",
  "28P01", // postgres invalid_password
  "3D000", // postgres invalid_catalog_name
]);

const CONNECTION_ERROR_PATTERNS =
  /connection (terminated|lost|closed)|closed state|not queryable/i;

function classifyError(err: unknown): "connection" | "sql" {
  const code = (err as { code?: string })?.code;
  if (code && CONNECTION_ERROR_CODES.has(code)) return "connection";
  if (CONNECTION_ERROR_PATTERNS.test(errorMessage(err))) return "connection";
  return "sql";
}

async function loadDriver<T>(
  name: string,
  load: () => Promise<T>
): Promise<{ ok: true; mod: T } | { ok: false; error: string }> {
  try {
    return { ok: true, mod: await load() };
  } catch (err) {
    return { ok: false, error: `Driver '${name}' failed to load: ${errorMessage(err)}` };
  }
}

type Acquired<THandle> =
  | { ok: true; handle: THandle; reused: boolean }
  | { ok: false; error: string };

/**
 * Acquire a connection and execute. A cached connection may have gone
 * stale, so on a connection-kind error evict it and retry once with a
 * fresh connection.
 */
async function runWithReconnect<THandle>(
  settings: DbSettings,
  acquire: (s: DbSettings) => Promise<Acquired<THandle>>,
  exec: (handle: THandle) => Promise<QueryResponse>,
  allowRetry = true
): Promise<QueryResponse> {
  const got = await acquire(settings);
  if (!got.ok) return { ok: false, errorKind: "connection", error: got.error };
  try {
    return await exec(got.handle);
  } catch (err) {
    const kind = classifyError(err);
    if (kind === "connection") {
      await evict();
      if (got.reused && allowRetry) {
        return runWithReconnect(settings, acquire, exec, false);
      }
    }
    return { ok: false, errorKind: kind, error: errorMessage(err) };
  }
}

// ---- mysql ---------------------------------------------------------------

async function getMysql(settings: DbSettings): Promise<Acquired<MysqlConnection>> {
  const key = connKey(settings);
  if (cache?.key === key && cache.type === "mysql") {
    return { ok: true, handle: cache.handle as MysqlConnection, reused: true };
  }

  const driver = await loadDriver("mysql2", () => import("mysql2/promise"));
  if (!driver.ok) return driver;

  await evict();
  try {
    const conn = await driver.mod.createConnection({
      host: settings.host,
      port: settings.port,
      user: settings.user,
      password: settings.password,
      database: settings.database,
      connectTimeout: 5000,
      rowsAsArray: true,
    });
    cache = { key, type: "mysql", handle: conn, close: () => conn.end() };
    return { ok: true, handle: conn, reused: false };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}

async function execMysql(conn: MysqlConnection, sql: string): Promise<QueryResponse> {
  const start = performance.now();
  const [result, fields] = await conn.query(sql);
  const durationMs = performance.now() - start;

  if (Array.isArray(result)) {
    const columns = (fields ?? []).map((f) => f.name);
    return rowsResponse(columns, result as unknown[][], durationMs);
  }
  return writeResponse(result.affectedRows ?? 0, durationMs);
}

function runMysql(settings: DbSettings, sql: string): Promise<QueryResponse> {
  return runWithReconnect(settings, getMysql, (conn) => execMysql(conn, sql));
}

// ---- postgres --------------------------------------------------------------

async function getPostgres(settings: DbSettings): Promise<Acquired<PgClient>> {
  const key = connKey(settings);
  if (cache?.key === key && cache.type === "postgres") {
    return { ok: true, handle: cache.handle as PgClient, reused: true };
  }

  const driver = await loadDriver("pg", () => import("pg"));
  if (!driver.ok) return driver;

  await evict();
  const client = new driver.mod.default.Client({
    host: settings.host,
    port: settings.port,
    user: settings.user,
    password: settings.password,
    database: settings.database,
    connectionTimeoutMillis: 5000,
  });
  try {
    await client.connect();
    // Drop the cache if the server kills the connection while idle,
    // and swallow the error so it doesn't crash the process
    client.on("error", () => {
      if (cache?.handle === client) cache = null;
    });
    cache = { key, type: "postgres", handle: client, close: () => client.end() };
    return { ok: true, handle: client, reused: false };
  } catch (err) {
    await client.end().catch(() => {});
    return { ok: false, error: errorMessage(err) };
  }
}

async function execPostgres(client: PgClient, sql: string): Promise<QueryResponse> {
  const start = performance.now();
  const result = await client.query({ text: sql, rowMode: "array" });
  const durationMs = performance.now() - start;

  if (result.fields.length > 0) {
    const columns = result.fields.map((f) => f.name);
    return rowsResponse(columns, result.rows as unknown[][], durationMs);
  }
  return writeResponse(result.rowCount ?? 0, durationMs);
}

function runPostgres(settings: DbSettings, sql: string): Promise<QueryResponse> {
  return runWithReconnect(settings, getPostgres, (client) => execPostgres(client, sql));
}

// ---- sqlite -----------------------------------------------------------------
// No reconnect logic: a local file handle does not go stale.

async function getSqlite(
  settings: DbSettings
): Promise<{ ok: true; db: SqliteDatabase } | { ok: false; error: string }> {
  const key = connKey(settings);
  if (cache?.key === key && cache.type === "sqlite") {
    return { ok: true, db: cache.handle as SqliteDatabase };
  }

  if (!settings.sqlitePath || !isAbsolute(settings.sqlitePath)) {
    return { ok: false, error: "SQLite file path must be an absolute path." };
  }
  if (!existsSync(settings.sqlitePath)) {
    return { ok: false, error: `SQLite file not found: ${settings.sqlitePath}` };
  }

  const driver = await loadDriver("better-sqlite3", async () => {
    return (await import("better-sqlite3")).default;
  });
  if (!driver.ok) return driver;

  await evict();
  try {
    const db = new driver.mod(settings.sqlitePath, {
      readonly: effectiveReadonly(settings),
      fileMustExist: true,
    });
    cache = {
      key,
      type: "sqlite",
      handle: db,
      close: () => {
        db.close();
      },
    };
    return { ok: true, db };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}

async function runSqlite(
  settings: DbSettings,
  sql: string
): Promise<QueryResponse> {
  const opened = await getSqlite(settings);
  if (!opened.ok) {
    return { ok: false, errorKind: "connection", error: opened.error };
  }
  try {
    const start = performance.now();
    const stmt = opened.db.prepare(sql);
    if (stmt.reader) {
      const columns = stmt.columns().map((c) => c.name);
      const raw = stmt.raw(true).all() as unknown[][];
      return rowsResponse(columns, raw, performance.now() - start);
    }
    const info = stmt.run();
    return writeResponse(info.changes, performance.now() - start);
  } catch (err) {
    return { ok: false, errorKind: "sql", error: errorMessage(err) };
  }
}

// ---- public API ----------------------------------------------------------

export async function executeQuery(
  settings: DbSettings,
  sql: string
): Promise<QueryResponse> {
  switch (settings.type) {
    case "mysql":
      return runMysql(settings, sql);
    case "postgres":
      return runPostgres(settings, sql);
    case "sqlite":
      return runSqlite(settings, sql);
    default:
      return {
        ok: false,
        errorKind: "validation",
        error: `Unsupported db type: ${String(settings.type)}`,
      };
  }
}

export async function listTables(
  settings: DbSettings
): Promise<TablesResponse> {
  return settings.type === "sqlite"
    ? listSqliteTables(settings)
    : listServerTables(settings);
}

async function listSqliteTables(settings: DbSettings): Promise<TablesResponse> {
  const result = await runSqlite(
    settings,
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY 1"
  );
  if (!result.ok) return { ok: false, error: result.error };
  if (result.kind !== "rows") return { ok: true, database: "", tables: [] };
  return {
    ok: true,
    database: basename(settings.sqlitePath),
    tables: result.rows.map((r) => String(r[0])),
  };
}

async function listServerTables(settings: DbSettings): Promise<TablesResponse> {
  const sql =
    settings.type === "mysql"
      ? `SELECT table_name FROM information_schema.tables WHERE table_schema = '${settings.database.replace(/'/g, "''")}' ORDER BY 1`
      : "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY 1";
  const result =
    settings.type === "mysql"
      ? await runMysql(settings, sql)
      : await runPostgres(settings, sql);
  if (!result.ok) return { ok: false, error: result.error };
  if (result.kind !== "rows") {
    return { ok: true, database: settings.database, tables: [] };
  }
  return {
    ok: true,
    database: settings.database,
    tables: result.rows.map((r) => String(r[0])),
  };
}
