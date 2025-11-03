import type { Route } from "./+types/home";
import { MediaViewer } from "../components/MediaViewer/index";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Media Viewer" },
    { name: "description", content: "Local media viewer for images and videos" },
  ];
}

export default function Home() {
  return <MediaViewer />;
}
