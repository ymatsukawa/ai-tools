import { useCallback, useEffect, useMemo, useState } from "react";
import type { Route } from "./+types/scan";
import { Header } from "~/components/Header";
import { SettingsModal } from "~/components/SettingsModal";
import { ScanTargetForm } from "~/components/ScanTargetForm";
import { ScanProgress } from "~/components/ScanProgress";
import { ScanResult } from "~/components/ScanResult";
import { useSettings } from "~/hooks/useSettings";
import { useFontVariables } from "~/hooks/useFontVariables";
import { useTables } from "~/hooks/useDbApi";
import { useSchemaScan } from "~/hooks/useSchemaScan";
import { isLocalhost } from "~/utils/localhost";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Scan – dbweb-local" },
    { name: "description", content: "Scan the database and build an ER diagram" },
  ];
}

export default function Scan() {
  const {
    settings,
    loaded,
    updateDb,
    updateFont,
    updateData,
    readonly,
    readonlyForced,
    isConfigured,
  } = useSettings();
  useFontVariables(settings.font);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  const { refresh, data: tablesData, isLoading } = useTables();
  const { state, start, reset } = useSchemaScan();

  const scanAllowed =
    settings.db.type === "sqlite" || isLocalhost(settings.db.host);

  // Refetch the table list whenever the connection settings change
  const dbKey = useMemo(() => JSON.stringify(settings.db), [settings.db]);
  useEffect(() => {
    if (!loaded || !isConfigured) return;
    refresh(JSON.parse(dbKey));
  }, [dbKey, loaded, isConfigured, refresh]);

  const handleStart = useCallback(
    (tables: string[]) => {
      start(settings.db, tables);
    },
    [start, settings.db]
  );

  const database = tablesData?.ok ? tablesData.database : settings.db.database;

  return (
    <div className="flex h-screen flex-col">
      <Header
        readonly={readonly}
        readonlyForced={readonlyForced}
        onOpenSettings={openSettings}
        backTo="/"
      />
      {/* overflow-y-auto: the table checklist expands fully and scrolls with the page */}
      <main className="flex flex-1 flex-col overflow-y-auto">
        <ScanBody
          loaded={loaded}
          isConfigured={isConfigured}
          scanAllowed={scanAllowed}
          isLoadingTables={isLoading}
          tablesData={tablesData}
          state={state}
          database={database}
          onStart={handleStart}
          onRescan={reset}
        />
      </main>
      {settingsOpen && (
        <SettingsModal
          db={settings.db}
          font={settings.font}
          data={settings.data}
          readonlyForced={readonlyForced}
          updateDb={updateDb}
          updateFont={updateFont}
          updateData={updateData}
          onClose={closeSettings}
        />
      )}
    </div>
  );
}

interface ScanBodyProps {
  loaded: boolean;
  isConfigured: boolean;
  scanAllowed: boolean;
  isLoadingTables: boolean;
  tablesData: ReturnType<typeof useTables>["data"];
  state: ReturnType<typeof useSchemaScan>["state"];
  database: string;
  onStart: (tables: string[]) => void;
  onRescan: () => void;
}

function ScanBody({
  loaded,
  isConfigured,
  scanAllowed,
  isLoadingTables,
  tablesData,
  state,
  database,
  onStart,
  onRescan,
}: ScanBodyProps) {
  if (!loaded) return null;
  if (!isConfigured) {
    return <Notice>Configure a database connection in settings (⚙) first.</Notice>;
  }
  if (!scanAllowed) {
    return <Notice>Scan is available for localhost connections only.</Notice>;
  }
  if (state.status === "running") return <ScanProgress progress={state.progress} />;
  if (state.status === "done") {
    return (
      <ScanResult
        database={database}
        schemas={state.schemas}
        errors={state.errors}
        onRescan={onRescan}
      />
    );
  }
  if (isLoadingTables || !tablesData) {
    return <Notice>Loading tables…</Notice>;
  }
  if (!tablesData.ok) {
    return (
      <Notice className="text-red-600 dark:text-red-400">
        Failed to load tables: {tablesData.error}
      </Notice>
    );
  }
  if (tablesData.tables.length === 0) {
    return <Notice>No tables found in this database.</Notice>;
  }
  return <ScanTargetForm tables={tablesData.tables} onStart={onStart} />;
}

function Notice({
  children,
  className = "text-gray-500",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={`p-6 text-sm ${className}`}>{children}</p>;
}
