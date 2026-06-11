import type { Route } from "./+types/api.schema";
import type { SchemaRequest, SchemaResponse } from "~/utils/er-types";
import { scanTable } from "~/utils/schema.server";
import { isLocalhost } from "~/utils/localhost";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json(
      { ok: false, error: "Method not allowed" },
      { status: 405 }
    );
  }

  let body: SchemaRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({
      ok: false,
      error: "Invalid JSON body",
    } satisfies SchemaResponse);
  }

  if (!body.settings || typeof body.table !== "string" || body.table === "") {
    return Response.json({
      ok: false,
      error: "Missing settings or table",
    } satisfies SchemaResponse);
  }

  // Scan mode is limited to localhost connections
  if (body.settings.type !== "sqlite" && !isLocalhost(body.settings.host)) {
    return Response.json({
      ok: false,
      error: "Scan is available for localhost connections only.",
    } satisfies SchemaResponse);
  }

  try {
    return Response.json(await scanTable(body.settings, body.table));
  } catch (err) {
    return Response.json({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    } satisfies SchemaResponse);
  }
}
