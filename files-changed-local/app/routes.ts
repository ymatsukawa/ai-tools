import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("pick-directory", "routes/pick-directory.ts"),
] satisfies RouteConfig;
