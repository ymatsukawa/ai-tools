import { ErrorModal } from "../components/ErrorModal";
import { CsvDropZone } from "../components/CsvDropZone";
import { CsvTable } from "../components/CsvTable";
import { SettingsModal } from "../components/SettingsModal";
import { GearIcon } from "../components/svg/GearIcon";
import { useCsvParser } from "../hooks/useCsvParser";
import { useSettings } from "../hooks/useSettings";

export function CsvRender() {
  const { settings, updateSettings, isOpen, openSettings, closeSettings } = useSettings();
  const { csvData, error, parseFile, setError } = useCsvParser(settings);

  const handleFileAccepted = (file: File) => {
    parseFile(file);
  };

  const handleFileRejected = () => {
    setError("It's not .csv");
  };

  return (
    <div className="min-h-screen p-8">
      {/* Settings Button */}
      <button
        onClick={openSettings}
        className="fixed top-4 right-4 p-3 bg-white border border-gray-300 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
        aria-label="Settings"
      >
        <GearIcon className="w-6 h-6 text-gray-700" />
      </button>

      {error && <ErrorModal message={error} onClose={() => setError(null)} />}

      {isOpen && (
        <SettingsModal
          settings={settings}
          onSave={updateSettings}
          onClose={closeSettings}
        />
      )}

      {!csvData ? (
        <CsvDropZone
          onFileAccepted={handleFileAccepted}
          onFileRejected={handleFileRejected}
        />
      ) : (
        <CsvTable headers={csvData.headers} rows={csvData.rows} />
      )}
    </div>
  );
}
