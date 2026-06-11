import type { TestResult as TestResultData } from "../utils/testRequest.server";

export function TestResult({ result }: { result: TestResultData }) {
  const statusLine =
    result.status !== undefined
      ? `${result.status} ${result.statusText ?? ""}`.trim()
      : result.error;

  return (
    <div
      role="status"
      className={`rounded-md border px-4 py-3 flex flex-col gap-2 ${
        result.ok
          ? "border-green-400 bg-green-50 dark:bg-green-950 dark:border-green-700"
          : "border-red-400 bg-red-50 dark:bg-red-950 dark:border-red-700"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`font-bold ${
            result.ok
              ? "text-green-700 dark:text-green-300"
              : "text-red-700 dark:text-red-300"
          }`}
        >
          {result.ok ? "✓ Success" : "✗ Fail"}
        </span>
        <span className="font-mono">{statusLine}</span>
        {result.durationMs !== undefined && (
          <span className="text-gray-500 dark:text-gray-400">
            {result.durationMs}ms
          </span>
        )}
      </div>

      {result.note && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Note: {result.note}
        </p>
      )}
      {result.requestLog && (
        <LogBlock title="Request (-v)" text={result.requestLog} />
      )}
      {result.responseHeaders && (
        <LogBlock title="Response headers" text={result.responseHeaders} />
      )}
      {result.bodySnippet && <LogBlock text={result.bodySnippet} />}
    </div>
  );
}

function LogBlock({ title, text }: { title?: string; text: string }) {
  return (
    <div className="flex flex-col gap-1">
      {title && <span className="text-sm font-semibold">{title}</span>}
      <pre className="text-sm bg-white/60 dark:bg-black/30 rounded p-2 overflow-x-auto max-h-48 overflow-y-auto">
        {text}
      </pre>
    </div>
  );
}
