import type { CurlFormHandle } from "../hooks/useCurlForm";
import type { BodyMode, JsonInputMode } from "../utils/curl";
import { KeyValueEditor } from "./KeyValueEditor";
import { monoFieldClass } from "./ui";

const BODY_MODES: { id: BodyMode; label: string }[] = [
  { id: "none", label: "None" },
  { id: "json", label: "JSON" },
  { id: "form", label: "Form (x-www-form-urlencoded)" },
];

const JSON_INPUT_MODES: { id: JsonInputMode; label: string }[] = [
  { id: "raw", label: "Raw text" },
  { id: "file", label: "File" },
];

export function BodyTab({ form }: { form: CurlFormHandle }) {
  const { config, update, addRow, updateRow, removeRow } = form;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4" role="radiogroup" aria-label="Body type">
        {BODY_MODES.map((mode) => (
          <label key={mode.id} className="flex items-center gap-1.5">
            <input
              type="radio"
              name="bodyMode"
              checked={config.bodyMode === mode.id}
              onChange={() => update("bodyMode", mode.id)}
            />
            {mode.label}
          </label>
        ))}
      </div>

      {config.bodyMode === "json" && <JsonBodyFields form={form} />}

      {config.bodyMode === "form" && (
        <KeyValueEditor
          rows={config.formFields}
          keyPlaceholder="name"
          valuePlaceholder="value"
          onAdd={() => addRow("formFields")}
          onUpdate={(id, part, value) =>
            updateRow("formFields", id, part, value)
          }
          onRemove={(id) => removeRow("formFields", id)}
        />
      )}
    </div>
  );
}

function JsonBodyFields({ form }: { form: CurlFormHandle }) {
  const { config, update } = form;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1">
        {JSON_INPUT_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => update("jsonInputMode", mode.id)}
            className={`px-3 py-1.5 rounded-md border ${
              config.jsonInputMode === mode.id
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950 font-semibold"
                : "border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400"
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {config.jsonInputMode === "raw" ? (
        <textarea
          value={config.jsonText}
          onChange={(e) => update("jsonText", e.target.value)}
          placeholder='{"name": "example"}'
          rows={6}
          className={monoFieldClass}
        />
      ) : (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-gray-500">-d @</span>
            <input
              type="text"
              value={config.jsonFileName}
              onChange={(e) => update("jsonFileName", e.target.value)}
              placeholder="example.json"
              className={`${monoFieldClass} flex-1`}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            References a file in the directory where the command runs
          </p>
        </div>
      )}
    </div>
  );
}
