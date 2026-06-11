import type { Route } from "./+types/api.query";
import type { QueryRequest, QueryResponse } from "~/utils/api-types";
import { effectiveReadonly } from "~/utils/localhost";
import { guardSql } from "~/utils/sql-guard.server";
import { executeQuery } from "~/utils/db.server";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json(
      { ok: false, errorKind: "validation", error: "Method not allowed" },
      { status: 405 }
    );
  }

  let body: QueryRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({
      ok: false,
      errorKind: "validation",
      error: "Invalid JSON body",
    } satisfies QueryResponse);
  }

  const { settings, sql } = body;
  if (!settings || typeof sql !== "string" || sql.trim() === "") {
    return Response.json({
      ok: false,
      errorKind: "validation",
      error: "Missing settings or sql",
    } satisfies QueryResponse);
  }

  const readonly = effectiveReadonly(settings);
  const guard = guardSql(sql, settings.type, readonly);
  if (!guard.ok) {
    return Response.json({
      ok: false,
      errorKind: "readonly",
      error: guard.error,
    } satisfies QueryResponse);
  }

  try {
    return Response.json(await executeQuery(settings, sql));
  } catch (err) {
    return Response.json({
      ok: false,
      errorKind: "connection",
      error: err instanceof Error ? err.message : String(err),
    } satisfies QueryResponse);
  }
}
