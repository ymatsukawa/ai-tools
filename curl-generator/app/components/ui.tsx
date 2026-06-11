import { useCopyToClipboard } from "../hooks/useCopyToClipboard";

export const fieldClass =
  "rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2";

export const monoFieldClass = `${fieldClass} font-mono`;

export const readonlyFieldClass =
  "rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 font-mono";

export const secondaryButtonClass =
  "rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800";

export function CopyButton({
  text,
  disabled = false,
}: {
  text: string;
  disabled?: boolean;
}) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <button
      type="button"
      onClick={() => copy(text)}
      disabled={disabled}
      className={`px-3 py-1.5 ${secondaryButtonClass} disabled:opacity-40`}
    >
      {copied ? "✓ Copied!" : "Copy"}
    </button>
  );
}

export function AddRowButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="self-start px-3 py-1.5 rounded-md border border-dashed border-gray-400 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-600 dark:hover:border-gray-400"
    >
      + Add
    </button>
  );
}

export function RemoveRowButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Remove row"
      className="px-3 rounded-md border border-gray-300 dark:border-gray-700 text-gray-500 hover:text-red-600 hover:border-red-400"
    >
      ✕
    </button>
  );
}
