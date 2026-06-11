import { useMemo } from "react";
import type { TableSchema } from "~/utils/er-types";
import type { ScanError } from "~/hooks/useSchemaScan";
import { buildErDiagram } from "~/utils/mermaid-er";
import { ErDiagram } from "./ErDiagram";

interface ScanResultProps {
  database: string;
  schemas: TableSchema[];
  errors: ScanError[];
  onRescan: () => void;
}

export function ScanResult({ database, schemas, errors, onRescan }: ScanResultProps) {
  const code = useMemo(() => buildErDiagram(schemas), [schemas]);
  const downloadName = `er-${database || "diagram"}.svg`;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-1.5 dark:border-gray-800">
        <span className="text-xs text-gray-500">
          {schemas.length} table(s) scanned
          {errors.length > 0 && (
            <span className="ml-2 text-red-600 dark:text-red-400">
              {errors.length} failed
            </span>
          )}
        </span>
        <button
          type="button"
          onClick={onRescan}
          className="rounded border border-gray-300 px-3 py-1 text-xs hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Rescan
        </button>
      </div>
      {errors.length > 0 && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {errors.map((e) => (
            <p key={e.table}>
              <span className="font-mono">{e.table}</span>: {e.error}
            </p>
          ))}
        </div>
      )}
      {schemas.length === 0 ? (
        <p className="p-4 text-sm text-gray-500">No tables were scanned.</p>
      ) : (
        <>
          <ErDiagram code={code} downloadName={downloadName} />
          <IndexSummary schemas={schemas} />
        </>
      )}
    </div>
  );
}

/** Indexes cannot be drawn inside a mermaid ER diagram, so list them below. */
function IndexSummary({ schemas }: { schemas: TableSchema[] }) {
  const withIndexes = schemas.filter((s) => s.indexes.length > 0);
  if (withIndexes.length === 0) return null;

  return (
    <details className="border-t border-gray-200 px-4 py-2 text-xs dark:border-gray-800">
      <summary className="cursor-pointer select-none text-gray-500">
        Indexes ({withIndexes.reduce((n, s) => n + s.indexes.length, 0)})
      </summary>
      <div className="mt-2 max-h-48 overflow-y-auto">
        {withIndexes.map((schema) => (
          <div key={schema.name} className="mb-2">
            <p className="font-semibold">{schema.name}</p>
            <ul className="ml-4 list-disc font-mono">
              {schema.indexes.map((ix) => (
                <li key={ix.name}>
                  {ix.name} ({ix.columns.join(", ")})
                  {ix.unique && (
                    <span className="ml-1 font-sans text-amber-700 dark:text-amber-400">
                      UNIQUE
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </details>
  );
}
