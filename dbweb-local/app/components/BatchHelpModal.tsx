import { ModalCloseButton, ModalOverlay } from "./ModalOverlay";
import { PLACEHOLDER_DOCS } from "~/utils/batch-template";

interface BatchHelpModalProps {
  onClose: () => void;
}

export function BatchHelpModal({ onClose }: BatchHelpModalProps) {
  return (
    <ModalOverlay
      label="Batch placeholders"
      onClose={onClose}
      dialogClassName="max-h-[85vh] w-[34rem] overflow-y-auto rounded-lg bg-white p-4 shadow-xl dark:border dark:border-gray-800 dark:bg-gray-950"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Batch placeholders</h2>
        <ModalCloseButton onClose={onClose} />
      </div>
      <p className="mb-3 text-xs text-gray-500">
        Placeholders expand per row. Write them without quotes — hash and date
        values are quoted automatically. The first {"{seq}"} range determines
        how many statements run.
      </p>
      <table className="w-full text-sm">
        <tbody>
          {PLACEHOLDER_DOCS.map((doc) => (
            <tr
              key={doc.syntax}
              className="border-t border-gray-200 dark:border-gray-800"
            >
              <td className="whitespace-nowrap py-2 pr-3 align-top font-mono text-xs">
                {doc.syntax}
              </td>
              <td className="py-2 text-xs text-gray-600 dark:text-gray-400">
                {doc.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 rounded bg-gray-50 p-2 font-mono text-xs dark:bg-gray-900">
        INSERT INTO examples (test_id, name, visited_at)
        <br />
        VALUES ({"{seq:to-100}"}, {"{hash}"}, {"{date:yyyy-mm-dd}"})
        <span className="mt-1 block font-sans text-gray-500">
          → inserts 100 rows: test_id 1–100, each with a unique hash and a
          random date within the last week.
        </span>
      </div>
    </ModalOverlay>
  );
}
