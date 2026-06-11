import { ModalOverlay } from "./ModalOverlay";

interface ScanConfirmModalProps {
  onConfirm: () => void;
  onClose: () => void;
}

export function ScanConfirmModal({ onConfirm, onClose }: ScanConfirmModalProps) {
  return (
    <ModalOverlay
      label="Process to scan?"
      onClose={onClose}
      dialogClassName="w-[22rem] rounded-lg bg-white p-4 shadow-xl dark:border dark:border-gray-800 dark:bg-gray-950"
    >
      <p className="text-sm font-semibold">Process to scan?</p>
      <p className="mt-2 text-xs text-gray-500">
        Scans the connected database and builds an ER diagram of its tables.
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
        >
          Scan
        </button>
      </div>
    </ModalOverlay>
  );
}
