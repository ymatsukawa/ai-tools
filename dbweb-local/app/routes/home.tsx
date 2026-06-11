import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/home";
import { Header } from "~/components/Header";
import { ScanConfirmModal } from "~/components/ScanConfirmModal";
import { Sidebar } from "~/components/Sidebar";
import { SettingsModal } from "~/components/SettingsModal";
import { MainPanels } from "~/components/MainPanels";
import { SqlEditor, type SqlEditorHandle } from "~/components/SqlEditor";
import { ResultsGrid } from "~/components/ResultsGrid";
import { BatchResultPanel } from "~/components/BatchResultPanel";
import { BatchHelpModal } from "~/components/BatchHelpModal";
import { useSettings } from "~/hooks/useSettings";
import { useFontVariables } from "~/hooks/useFontVariables";
import { useExecuteQuery } from "~/hooks/useDbApi";
import { useBatchRun } from "~/hooks/useBatchRun";
import { isLocalhost } from "~/utils/localhost";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "dbweb-local" },
    { name: "description", content: "Browser-based local DB access tool" },
  ];
}

export default function Home() {
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
  const editorRef = useRef<SqlEditorHandle>(null);
  const { run, result, isRunning } = useExecuteQuery();

  // Batch (red) mode: placeholder SQL expands to multiple statements.
  // Limited to localhost connections (sqlite is local by nature).
  const [batchMode, setBatchMode] = useState(false);
  const [batchHelpOpen, setBatchHelpOpen] = useState(false);
  const {
    state: batchState,
    start: startBatch,
    reset: resetBatch,
    isRunning: batchRunning,
  } = useBatchRun();
  const batchAvailable =
    isConfigured &&
    (settings.db.type === "sqlite" || isLocalhost(settings.db.host));

  const toggleBatch = useCallback(() => {
    setBatchMode((on) => !on);
    setBatchHelpOpen(false);
    resetBatch();
  }, [resetBatch]);

  const openBatchHelp = useCallback(() => setBatchHelpOpen(true), []);
  const closeBatchHelp = useCallback(() => setBatchHelpOpen(false), []);

  const handleRun = useCallback(
    (sql: string) => {
      if (!isConfigured || sql.trim() === "") return;
      if (batchMode) {
        startBatch(settings.db, sql, { test: false });
      } else {
        run(settings.db, sql);
      }
    },
    [isConfigured, batchMode, startBatch, run, settings.db]
  );

  const handleTestRun = useCallback(
    (sql: string) => {
      if (!batchMode || !isConfigured || sql.trim() === "") return;
      startBatch(settings.db, sql, { test: true });
    },
    [batchMode, isConfigured, startBatch, settings.db]
  );

  const handlePickTable = useCallback((table: string) => {
    editorRef.current?.setText(`SELECT * FROM ${table} LIMIT 100;`);
  }, []);

  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  const navigate = useNavigate();
  const [scanConfirmOpen, setScanConfirmOpen] = useState(false);
  const openScanConfirm = useCallback(() => setScanConfirmOpen(true), []);
  const closeScanConfirm = useCallback(() => setScanConfirmOpen(false), []);
  const confirmScan = useCallback(() => {
    setScanConfirmOpen(false);
    navigate("/scan");
  }, [navigate]);

  return (
    <div
      className={`flex h-screen flex-col ${
        batchMode ? "bg-red-50/70 dark:bg-red-950/20" : ""
      }`}
    >
      <Header
        readonly={readonly}
        readonlyForced={readonlyForced}
        onOpenSettings={openSettings}
        onBatch={batchAvailable ? toggleBatch : undefined}
        batchActive={batchMode}
        onScan={isConfigured ? openScanConfirm : undefined}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          db={settings.db}
          isConfigured={isConfigured}
          loaded={loaded}
          onPickTable={handlePickTable}
        />
        <main className="flex flex-1 flex-col overflow-hidden">
          <MainPanels
            editor={
              <SqlEditor
                ref={editorRef}
                dbType={settings.db.type}
                isRunning={batchMode ? batchRunning : isRunning}
                canRun={isConfigured}
                onRun={handleRun}
                batchMode={batchMode}
                onTestRun={handleTestRun}
                onShowHelp={openBatchHelp}
              />
            }
            results={
              batchMode ? (
                <BatchResultPanel state={batchState} />
              ) : (
                <ResultsGrid
                  result={result}
                  isRunning={isRunning}
                  dataSettings={settings.data}
                />
              )
            }
          />
        </main>
      </div>
      {batchHelpOpen && <BatchHelpModal onClose={closeBatchHelp} />}
      {scanConfirmOpen && (
        <ScanConfirmModal onConfirm={confirmScan} onClose={closeScanConfirm} />
      )}
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
