import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Source+Serif+4:ital,opsz,wght@0,8..60,300..800;1,8..60,300..800&family=Geist:wght@300..800&family=JetBrains+Mono:ital,wght@0,400..700;1,400..700&family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&display=swap",
  },
];

const themeBootScript = `(()=>{try{
var raw=localStorage.getItem("dev-marks:settings");
var s=raw?JSON.parse(raw):{};
var t=s.theme||"auto";
var resolved=t==="auto"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):t;
document.documentElement.setAttribute("data-theme",resolved);
var sizes={s:"15px",m:"17px",l:"19px",xl:"22px"};
var leadings={tight:"1.45",normal:"1.7",relaxed:"1.9"};
var fonts={sans:'"Geist",ui-sans-serif,system-ui,sans-serif',serif:'"Source Serif 4","Charter",Georgia,ui-serif,serif',mono:'"JetBrains Mono",ui-monospace,Menlo,monospace',reading:'"Atkinson Hyperlegible","Source Serif 4",Georgia,serif'};
var b=document.body||document.documentElement;
b.style.setProperty("--reader-font",fonts[s.font]||fonts.sans);
b.style.setProperty("--reader-size",sizes[s.size]||sizes.m);
b.style.setProperty("--reader-leading",leadings[s.leading]||leadings.normal);
}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
