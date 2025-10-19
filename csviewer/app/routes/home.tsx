import type { Route } from "./+types/home";

import { ErrorBoundary } from "../components/ErrorBoundary";
import { CsvRender } from "../main/csv_render";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "CSViewer" },
    { name: "description", content: "View and analyze CSV files in your browser" },
  ];
}

export default function Home() {
  return (
    <ErrorBoundary>
      <CsvRender />
    </ErrorBoundary>
  );
}
