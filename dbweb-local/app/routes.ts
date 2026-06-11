import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("scan", "routes/scan.tsx"),
  route("api/query", "routes/api.query.ts"),
  route("api/tables", "routes/api.tables.ts"),
  route("api/schema", "routes/api.schema.ts"),
] satisfies RouteConfig;
