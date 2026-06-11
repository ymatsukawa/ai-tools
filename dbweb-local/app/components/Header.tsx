import { memo } from "react";
import { Link } from "react-router";
import { GearIcon, LayersIcon, ScanIcon } from "./icons";

const actionButtonClass =
  "flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs";

interface HeaderProps {
  readonly: boolean;
  readonlyForced: boolean;
  onOpenSettings: () => void;
  /** Renders a Batch toggle left of the Scan button. */
  onBatch?: () => void;
  /** Batch (red) mode is active — tints the header and marks the toggle. */
  batchActive?: boolean;
  /** Renders a Scan button left of the gear icon. */
  onScan?: () => void;
  /** Renders a back link before the title (used on the /scan page). */
  backTo?: string;
}

export const Header = memo(function Header({
  readonly,
  readonlyForced,
  onOpenSettings,
  onBatch,
  batchActive = false,
  onScan,
  backTo,
}: HeaderProps) {
  return (
    <header
      className={`flex items-center justify-between border-b px-4 py-2 ${
        batchActive
          ? "border-red-200 bg-red-100/70 dark:border-red-900 dark:bg-red-950/50"
          : "border-gray-200 dark:border-gray-800"
      }`}
    >
      <div className="flex items-center gap-3">
        {backTo && (
          <Link
            to={backTo}
            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            ← Back to SQL
          </Link>
        )}
        <h1 className="text-base font-semibold">dbweb-local</h1>
        {batchActive && (
          <span
            className="rounded-full bg-red-200 px-2 py-0.5 text-xs font-medium text-red-900 dark:bg-red-900 dark:text-red-100"
            title="Batch mode: placeholder SQL expands to multiple statements"
          >
            BATCH
          </span>
        )}
        {readonly && (
          <span
            className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-200"
            title={readonlyForced ? "Forced: host is not localhost" : "Readonly mode"}
          >
            READONLY{readonlyForced ? " (forced)" : ""}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        {onBatch && (
          <button
            type="button"
            onClick={onBatch}
            className={`${actionButtonClass} ${
              batchActive
                ? "border-red-400 bg-red-200 text-red-900 hover:bg-red-300 dark:border-red-700 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800"
                : "border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
            }`}
            title={batchActive ? "Exit batch mode" : "Enter batch mode (placeholder SQL)"}
          >
            <LayersIcon className="h-3.5 w-3.5" />
            Batch
          </button>
        )}
        {onScan && (
          <button
            type="button"
            onClick={onScan}
            className={`${actionButtonClass} border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800`}
            title="Scan the database and build an ER diagram"
          >
            <ScanIcon className="h-3.5 w-3.5" />
            Scan
          </button>
        )}
        <button
          type="button"
          aria-label="Settings"
          onClick={onOpenSettings}
          className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        >
          <GearIcon className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
});
