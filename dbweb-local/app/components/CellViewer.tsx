import { useState } from "react";
import { ModalCloseButton, ModalOverlay } from "./ModalOverlay";

interface CellViewerProps {
  column: string;
  value: string;
  onClose: () => void;
}

export function CellViewer({ column, value, onClose }: CellViewerProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable (e.g. permission denied) — nothing to do
    }
  };

  return (
    <ModalOverlay
      label={`Cell value: ${column}`}
      onClose={onClose}
      dialogClassName="flex max-h-[80vh] w-[min(48rem,90vw)] flex-col rounded-lg bg-white shadow-xl dark:border dark:border-gray-800 dark:bg-gray-950"
    >
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 dark:border-gray-800">
        <span className="truncate text-sm font-semibold" title={column}>
          {column}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copy}
            className="rounded border border-gray-300 px-2 py-0.5 text-xs hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <ModalCloseButton onClose={onClose} />
        </div>
      </div>
      <pre
        className="flex-1 overflow-auto whitespace-pre-wrap break-words px-4 py-3"
        style={{
          fontFamily: "var(--editor-font)",
          fontSize: "var(--editor-font-size)",
        }}
      >
        {value}
      </pre>
    </ModalOverlay>
  );
}
