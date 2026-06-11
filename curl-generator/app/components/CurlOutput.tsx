import { CopyButton, readonlyFieldClass } from "./ui";

const MIN_ROWS = 3;

export function CurlOutput({ command }: { command: string }) {
  const rows = Math.max(MIN_ROWS, command.split("\n").length + 1);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Generated command</h2>
        <CopyButton text={command} />
      </div>
      <textarea
        readOnly
        value={command}
        rows={rows}
        aria-label="Generated curl command"
        className={readonlyFieldClass}
      />
    </div>
  );
}
