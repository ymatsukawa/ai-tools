import type { Route } from "./+types/home";
import { QrCode } from "~/features/qrcode/qr_code";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "QrCode Generator" },
    { name: "description", content: "QrCode Generator" },
  ];
}

export default function Home() {
  return <QrCode />;
}
