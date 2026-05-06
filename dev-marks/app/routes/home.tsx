import type { Route } from "./+types/home";
import { MarkdownReader } from "../components/MarkdownReader";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "DEV·MARKS — a reading room for developers" },
    {
      name: "description",
      content: "An ultra-simple, paper-like markdown reader for developers.",
    },
  ];
}

export default function Home() {
  return <MarkdownReader />;
}
