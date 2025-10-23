import { JsonViewer } from "~/components/json_viewer";
import type { Route } from "./+types/home";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "JsonViewer" },
    { name: "description", content: "jsonviewer" },
  ];
}

export default function Home() {
  return <JsonViewer />;
}
