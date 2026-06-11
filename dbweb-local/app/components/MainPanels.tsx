import { useState } from "react";
import { Group, Panel, Separator, type Layout } from "react-resizable-panels";
import type { ReactNode } from "react";

interface MainPanelsProps {
  editor: ReactNode;
  results: ReactNode;
}

const LAYOUT_KEY = "dbweb-local:layout:v1";
const DEFAULT_LAYOUT: Layout = { editor: 40, results: 60 };

function loadLayout(): Layout {
  if (typeof window === "undefined") return DEFAULT_LAYOUT;
  try {
    const raw = window.localStorage.getItem(LAYOUT_KEY);
    return raw ? (JSON.parse(raw) as Layout) : DEFAULT_LAYOUT;
  } catch {
    return DEFAULT_LAYOUT;
  }
}

function saveLayout(layout: Layout): void {
  try {
    window.localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
  } catch {
    // localStorage unavailable — layout just won't persist
  }
}

export function MainPanels({ editor, results }: MainPanelsProps) {
  const [defaultLayout] = useState(loadLayout);

  return (
    <Group
      orientation="vertical"
      defaultLayout={defaultLayout}
      onLayoutChanged={saveLayout}
      className="flex-1"
    >
      <Panel id="editor" defaultSize={40} minSize="15%" className="overflow-hidden">
        {editor}
      </Panel>
      <Separator className="h-1 shrink-0 bg-gray-200 transition-colors hover:bg-blue-400 dark:bg-gray-800 dark:hover:bg-blue-600" />
      <Panel id="results" defaultSize={60} minSize="15%" className="overflow-hidden">
        {results}
      </Panel>
    </Group>
  );
}
