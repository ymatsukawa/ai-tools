import type { BatchState } from "~/hooks/useBatchRun";
import { ProgressBar } from "./ProgressBar";

interface BatchResultPanelProps {
  state: BatchState;
}

export function BatchResultPanel({ state }: BatchResultPanelProps) {
  switch (state.status) {
    case "idle":
      return (
        <p className="p-4 text-sm text-gray-500">
          Batch mode: write SQL with placeholders, then Test run (Ctrl+T) to
          try a single row or Batch run (Ctrl+Enter) to execute all rows.
        </p>
      );
    case "error":
      return (
        <div className="m-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {state.error}
        </div>
      );
    case "running":
      return <BatchProgress done={state.done} total={state.total} />;
    case "done":
      return <BatchSummary state={state} />;
  }
}

function BatchProgress({ done, total }: { done: number; total: number }) {
  return (
    <div className="p-4">
      <p className="text-sm">Executing batch…</p>
      <div className="mt-2">
        <ProgressBar done={done} total={total} barClassName="bg-red-500" />
      </div>
      <p className="mt-1 text-xs text-gray-500">
        {done} / {total}
      </p>
    </div>
  );
}

function BatchSummary({ state }: { state: Extract<BatchState, { status: "done" }> }) {
  const failed = state.failures.length;
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-gray-200 px-4 py-2 text-sm dark:border-gray-800">
        <span className="font-medium text-green-700 dark:text-green-400">
          {state.succeeded} succeeded
        </span>
        {failed > 0 && (
          <span className="ml-2 font-medium text-red-600 dark:text-red-400">
            {failed} failed
          </span>
        )}
        <span className="ml-2 text-xs text-gray-500">
          ({state.total} statement(s), {state.durationMs} ms)
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {state.testSql && (
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-500">Executed (test):</p>
            <pre
              className="mt-1 whitespace-pre-wrap break-words rounded bg-gray-50 p-2 text-xs dark:bg-gray-900"
              style={{ fontFamily: "var(--editor-font)" }}
            >
              {state.testSql}
            </pre>
          </div>
        )}
        {failed > 0 && (
          <ul className="flex flex-col gap-1 text-xs text-red-700 dark:text-red-300">
            {state.failures.map((f) => (
              <li key={f.index}>
                <span className="font-mono">#{f.index}</span>: {f.error}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
