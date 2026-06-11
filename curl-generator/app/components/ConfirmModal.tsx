import { secondaryButtonClass } from "./ui";

interface Props {
  target: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ target, onConfirm, onCancel }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Confirm test execution"
        className="rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-6 max-w-md w-full mx-4 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-semibold">
          Really test to <span className="font-mono">{target}</span>?
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className={`px-4 py-2 ${secondaryButtonClass}`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            autoFocus
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
