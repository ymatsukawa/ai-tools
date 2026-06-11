import type { Route } from "./+types/api.tables";
import type { TablesRequest, TablesResponse } from "~/utils/api-types";
import { listTables } from "~/utils/db.server";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json(
      { ok: false, error: "Method not allowed" },
      { status: 405 }
    );
  }

  let body: TablesRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({
      ok: false,
      error: "Invalid JSON body",
    } satisfies TablesResponse);
  }

  if (!body.settings) {
    return Response.json({
      ok: false,
      error: "Missing settings",
    } satisfies TablesResponse);
  }

  try {
    return Response.json(await listTables(body.settings));
  } catch (err) {
    return Response.json({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    } satisfies TablesResponse);
  }
}
