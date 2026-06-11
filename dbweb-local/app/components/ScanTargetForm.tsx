import { useState } from "react";

const COLUMN_COUNT = 3;

interface ScanTargetFormProps {
  tables: string[];
  onStart: (tables: string[]) => void;
}

export function ScanTargetForm({ tables, onStart }: ScanTargetFormProps) {
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set(tables));
  const [filter, setFilter] = useState("");

  const toggle = (table: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(table)) {
        next.delete(table);
      } else {
        next.add(table);
      }
      return next;
    });
  };

  /** Checks the whole group, or clears it when everything is already checked. */
  const toggleGroup = (group: string[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const allChecked = group.every((t) => next.has(t));
      for (const table of group) {
        if (allChecked) {
          next.delete(table);
        } else {
          next.add(table);
        }
      }
      return next;
    });
  };

  const filtered = tables.filter((t) =>
    t.toLowerCase().includes(filter.trim().toLowerCase())
  );
  const columns = splitIntoColumns(filtered, COLUMN_COUNT);
  const chosen = tables.filter((t) => selected.has(t));
  const allChecked = filtered.length > 0 && filtered.every((t) => selected.has(t));

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-semibold">
          Scan target
          <span className="ml-3 text-lg font-normal text-gray-500">
            {chosen.length} / {tables.length} table(s)
          </span>
        </h2>
        <button
          type="button"
          onClick={() => toggleGroup(filtered)}
          className="text-lg text-blue-600 hover:underline dark:text-blue-400"
        >
          {allChecked ? "Clear all" : "Check all"}
        </button>
      </div>
      <input
        type="search"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Search tables…"
        className="mt-3 w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-lg dark:border-gray-700 dark:bg-gray-900"
      />
      {filtered.length === 0 ? (
        <p className="mt-3 text-lg text-gray-500">No tables match the filter.</p>
      ) : (
        <div className="mt-3 rounded border border-gray-200 p-3 dark:border-gray-800">
          <div className="grid grid-cols-3 gap-x-6">
            {columns.map((column, i) => (
              <TableColumn
                key={i}
                tables={column}
                selected={selected}
                onToggle={toggle}
                onToggleAll={() => toggleGroup(column)}
              />
            ))}
          </div>
        </div>
      )}
      {/* The list is fully expanded (page scrolls), so keep the button reachable */}
      <div className="sticky bottom-0 mt-2 bg-white py-3 dark:bg-gray-950">
        <button
          type="button"
          disabled={chosen.length === 0}
          onClick={() => onStart(chosen)}
          className="rounded bg-blue-600 px-6 py-2 text-xl font-medium text-white hover:bg-blue-700 disabled:opacity-40"
        >
          Start scan
        </button>
      </div>
    </div>
  );
}

/** Splits column-major so each grid column is a contiguous, toggleable chunk. */
function splitIntoColumns(tables: string[], count: number): string[][] {
  const perColumn = Math.ceil(tables.length / count);
  return Array.from({ length: count }, (_, i) =>
    tables.slice(i * perColumn, (i + 1) * perColumn)
  );
}

function TableColumn({
  tables,
  selected,
  onToggle,
  onToggleAll,
}: {
  tables: string[];
  selected: ReadonlySet<string>;
  onToggle: (table: string) => void;
  onToggleAll: () => void;
}) {
  if (tables.length === 0) return <div />;
  const allChecked = tables.every((t) => selected.has(t));

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={onToggleAll}
        className="self-start text-lg text-blue-600 hover:underline dark:text-blue-400"
      >
        {allChecked ? "Clear" : "Select all"}
      </button>
      {tables.map((table) => (
        <label key={table} className="flex items-center gap-2 text-xl">
          <input
            type="checkbox"
            checked={selected.has(table)}
            onChange={() => onToggle(table)}
            className="h-5 w-5 shrink-0"
          />
          <span className="truncate" title={table}>
            {table}
          </span>
        </label>
      ))}
    </div>
  );
}
