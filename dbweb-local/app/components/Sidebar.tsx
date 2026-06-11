import { memo, useEffect, useMemo } from "react";
import { useTables } from "~/hooks/useDbApi";
import type { TablesResponse } from "~/utils/api-types";
import type { DbSettings } from "~/utils/settings";
import { RefreshIcon } from "./icons";

interface SidebarProps {
  db: DbSettings;
  isConfigured: boolean;
  loaded: boolean;
  onPickTable: (table: string) => void;
}

export const Sidebar = memo(function Sidebar({
  db,
  isConfigured,
  loaded,
  onPickTable,
}: SidebarProps) {
  const { refresh, data, isLoading } = useTables();

  // Refetch when the connection target changes (value identity, not object identity)
  const dbKey = useMemo(() => JSON.stringify(db), [db]);
  useEffect(() => {
    if (!loaded || !isConfigured) return;
    refresh(JSON.parse(dbKey) as DbSettings);
  }, [dbKey, loaded, isConfigured, refresh]);

  const dbLabel =
    db.type === "sqlite"
      ? db.sqlitePath.split("/").pop() || "sqlite"
      : db.database || "(no database)";

  return (
    <aside className="flex w-64 shrink-0 flex-col overflow-hidden border-r border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2 dark:border-gray-800">
        <span className="truncate text-sm font-medium" title={dbLabel}>
          {dbLabel}
        </span>
        <button
          type="button"
          aria-label="Refresh tables"
          disabled={!isConfigured || isLoading}
          onClick={() => refresh(db)}
          className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-800"
        >
          <RefreshIcon />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <SidebarBody
          isConfigured={isConfigured}
          isLoading={isLoading}
          data={data}
          onPickTable={onPickTable}
        />
      </div>
    </aside>
  );
});

function SidebarBody({
  isConfigured,
  isLoading,
  data,
  onPickTable,
}: {
  isConfigured: boolean;
  isLoading: boolean;
  data: TablesResponse | undefined;
  onPickTable: (table: string) => void;
}) {
  const hint = (text: string) => <p className="px-1 text-xs text-gray-500">{text}</p>;

  if (!isConfigured) {
    return hint("Open settings (gear icon) to configure a database connection.");
  }
  if (isLoading) return hint("Loading tables…");
  if (!data) return null;
  if (!data.ok) {
    return (
      <p className="break-words px-1 text-xs text-red-600 dark:text-red-400">
        {data.error}
      </p>
    );
  }
  if (data.tables.length === 0) return hint("No tables");

  return (
    <ul>
      {data.tables.map((table) => (
        <li key={table}>
          <button
            type="button"
            onClick={() => onPickTable(table)}
            className="w-full truncate rounded px-2 py-1 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
            title={table}
          >
            {table}
          </button>
        </li>
      ))}
    </ul>
  );
}
