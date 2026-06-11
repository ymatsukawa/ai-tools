import { useState } from "react";
import type { DataSettings, DbSettings, FontSettings } from "~/utils/settings";
import { DbSettingsPanel } from "./DbSettingsPanel";
import { FontSettingsPanel } from "./FontSettingsPanel";
import { DataSettingsPanel } from "./DataSettingsPanel";
import { ModalCloseButton, ModalOverlay } from "./ModalOverlay";

interface SettingsModalProps {
  db: DbSettings;
  font: FontSettings;
  data: DataSettings;
  readonlyForced: boolean;
  updateDb: (partial: Partial<DbSettings>) => void;
  updateFont: (partial: Partial<FontSettings>) => void;
  updateData: (partial: Partial<DataSettings>) => void;
  onClose: () => void;
}

const TABS = [
  { key: "db", label: "db settings" },
  { key: "font", label: "font settings" },
  { key: "data", label: "data settings" },
] as const;

type Tab = (typeof TABS)[number]["key"];

export function SettingsModal({
  db,
  font,
  data,
  readonlyForced,
  updateDb,
  updateFont,
  updateData,
  onClose,
}: SettingsModalProps) {
  const [tab, setTab] = useState<Tab>("db");

  return (
    <ModalOverlay
      label="Settings"
      onClose={onClose}
      dialogClassName="max-h-[85vh] w-[28rem] overflow-y-auto rounded-lg bg-white p-4 shadow-xl dark:bg-gray-950 dark:border dark:border-gray-800"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded px-3 py-1 text-sm ${
                tab === t.key
                  ? "bg-gray-200 font-medium dark:bg-gray-800"
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <ModalCloseButton onClose={onClose} />
      </div>
      {tab === "db" ? (
        <DbSettingsPanel db={db} readonlyForced={readonlyForced} updateDb={updateDb} />
      ) : tab === "font" ? (
        <FontSettingsPanel font={font} updateFont={updateFont} />
      ) : (
        <DataSettingsPanel data={data} updateData={updateData} />
      )}
    </ModalOverlay>
  );
}
