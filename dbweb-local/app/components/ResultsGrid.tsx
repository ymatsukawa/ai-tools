import { useRef, useState } from "react";
import type { QueryResponse } from "~/utils/api-types";
import { downloadRows, formatRows } from "~/utils/data-format";
import type { DataSettings } from "~/utils/settings";
import { CellViewer } from "./CellViewer";
import { CheckIcon, CopyIcon, DownloadIcon } from "./icons";

interface ResultsGridProps {
  result: QueryResponse | undefined;
  isRunning: boolean;
  dataSettings: DataSettings;
}

const editorFontStyle = {
  fontFamily: "var(--editor-font)",
  fontSize: "var(--editor-font-size)",
} as const;

export function ResultsGrid({ result, isRunning, dataSettings }: ResultsGridProps) {
  if (isRunning) {
    return <p className="p-4 text-sm text-gray-500">Executing…</p>;
  }
  if (!result) {
    return <p className="p-4 text-sm text-gray-500">Run a query to see results.</p>;
  }
  if (!result.ok) {
    return (
      <div className="m-3 rounded border border-red-300 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950">
        <p className="mb-1 text-xs font-semibold uppercase text-red-700 dark:text-red-300">
          {result.errorKind} error
        </p>
        <pre
          className="whitespace-pre-wrap break-words text-sm text-red-800 dark:text-red-200"
          style={editorFontStyle}
        >
          {result.error}
        </pre>
      </div>
    );
  }
  if (result.kind === "write") {
    return (
      <p className="p-4 text-sm text-green-700 dark:text-green-400">
        OK — {result.affectedRows} row(s) affected ({result.durationMs} ms)
      </p>
    );
  }
  return <RowsResult result={result} dataSettings={dataSettings} />;
}

type RowsResponse = Extract<QueryResponse, { kind: "rows" }>;

function RowsResult({
  result,
  dataSettings,
}: {
  result: RowsResponse;
  dataSettings: DataSettings;
}) {
  const [selectedCell, setSelectedCell] = useState<{
    column: string;
    value: string;
  } | null>(null);
  const [copiedRow, setCopiedRow] = useState<number | null>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const copyRow = async (row: unknown[], ri: number) => {
    try {
      await navigator.clipboard.writeText(
        formatRows(result.columns, [row], dataSettings)
      );
      setCopiedRow(ri);
      clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopiedRow(null), 1500);
    } catch {
      // clipboard unavailable — nothing to do
    }
  };

  return (
    <div className="flex h-full flex-col">
      <ResultMetaBar result={result} dataSettings={dataSettings} />
      <div className="flex-1 overflow-auto">
        <table className="min-w-full border-collapse" style={editorFontStyle}>
          <thead className="sticky top-0 bg-gray-100 dark:bg-gray-900">
            <tr>
              <th className="w-8 border-b border-gray-300 dark:border-gray-700" />
              {result.columns.map((col, i) => (
                <th
                  key={`${col}-${i}`}
                  className="border-b border-gray-300 px-2 py-1 text-left font-semibold dark:border-gray-700"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, ri) => (
              <tr
                key={ri}
                className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-950 dark:even:bg-gray-900"
              >
                <td className="w-8 border-b border-gray-200 px-1 py-1 text-center dark:border-gray-800">
                  <RowCopyButton
                    rowIndex={ri}
                    copied={copiedRow === ri}
                    dataSettings={dataSettings}
                    onCopy={() => copyRow(row, ri)}
                  />
                </td>
                {row.map((cell, ci) => (
                  <ValueCell
                    key={ci}
                    value={cell}
                    onOpen={() =>
                      setSelectedCell({
                        column: result.columns[ci] ?? `#${ci + 1}`,
                        value: String(cell),
                      })
                    }
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedCell && (
        <CellViewer
          column={selectedCell.column}
          value={selectedCell.value}
          onClose={() => setSelectedCell(null)}
        />
      )}
    </div>
  );
}

function ResultMetaBar({
  result,
  dataSettings,
}: {
  result: RowsResponse;
  dataSettings: DataSettings;
}) {
  const downloadTitle = `Download shown rows (${dataSettings.copyFormat.toUpperCase()}, ${dataSettings.encoding.toUpperCase()}, ${dataSettings.newline.toUpperCase()})`;

  return (
    <div className="flex items-center justify-between border-b border-gray-200 px-3 py-1.5 text-xs text-gray-500 dark:border-gray-800">
      <span>
        {result.rowCount} row(s) ({result.durationMs} ms)
        {result.truncated && (
          <span className="ml-2 text-amber-600 dark:text-amber-400">
            — showing first {result.rows.length} rows (truncated)
          </span>
        )}
      </span>
      <button
        type="button"
        onClick={() => downloadRows(result.columns, result.rows, dataSettings)}
        title={downloadTitle}
        className="flex items-center gap-1 rounded border border-gray-300 px-2 py-0.5 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
      >
        <DownloadIcon className="h-3.5 w-3.5" />
        Download
      </button>
    </div>
  );
}

function RowCopyButton({
  rowIndex,
  copied,
  dataSettings,
  onCopy,
}: {
  rowIndex: number;
  copied: boolean;
  dataSettings: DataSettings;
  onCopy: () => void;
}) {
  const format = dataSettings.copyFormat.toUpperCase();
  return (
    <button
      type="button"
      aria-label={`Copy row ${rowIndex + 1} as ${format}`}
      title={`Copy row (${format}${dataSettings.withHeader ? ", with header" : ""})`}
      onClick={onCopy}
      className="rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
    >
      {copied ? (
        <CheckIcon className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
      ) : (
        <CopyIcon className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

function ValueCell({ value, onOpen }: { value: unknown; onOpen: () => void }) {
  if (value === null) {
    return (
      <td
        className="max-w-xs truncate border-b border-gray-200 px-2 py-1 dark:border-gray-800"
        title="NULL"
      >
        <span className="italic text-gray-400">NULL</span>
      </td>
    );
  }
  return (
    <td
      className="max-w-xs cursor-pointer truncate border-b border-gray-200 px-2 py-1 hover:bg-blue-50 dark:border-gray-800 dark:hover:bg-blue-950"
      title="Click to view full value"
      onClick={onOpen}
    >
      {/* collapse newlines so multi-line values stay one row tall */}
      {String(value).replace(/\s*\n\s*/g, " ⏎ ")}
    </td>
  );
}
