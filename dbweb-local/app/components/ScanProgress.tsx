import type { ScanProgress as Progress } from "~/hooks/useSchemaScan";
import { ProgressBar } from "./ProgressBar";

export function ScanProgress({ progress }: { progress: Progress }) {
  return (
    <div className="mx-auto w-full max-w-xl p-6">
      <p className="text-sm">
        Scanning <span className="font-mono">{progress.current}</span> …
      </p>
      <div className="mt-2">
        <ProgressBar done={progress.done} total={progress.total} />
      </div>
      <p className="mt-1 text-xs text-gray-500">
        {progress.done} / {progress.total} tables
      </p>
    </div>
  );
}
