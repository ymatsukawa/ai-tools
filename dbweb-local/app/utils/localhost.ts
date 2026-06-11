import type { DbSettings } from "./settings";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

export function isLocalhost(host: string): boolean {
  return LOCAL_HOSTS.has(host.trim().toLowerCase());
}

export function effectiveReadonly(db: DbSettings): boolean {
  return db.readonly || (db.type !== "sqlite" && !isLocalhost(db.host));
}
