import { useState } from "react";
import type { CurlFormHandle } from "../hooks/useCurlForm";
import type { KeyValue } from "../utils/curl";
import { AddRowButton, monoFieldClass, RemoveRowButton } from "./ui";

const COMMON_HEADERS = [
  "Content-Type",
  "Authorization",
  "Accept",
  "X-Api-Key",
  "User-Agent",
  "Cookie",
  "Cache-Control",
  "Origin",
  "Referer",
  "Accept-Language",
  "Accept-Encoding",
  "X-Requested-With",
  "If-None-Match",
];

const MIME_VALUES = [
  "application/json",
  "application/x-www-form-urlencoded",
  "multipart/form-data",
  "text/plain",
  "text/html",
  "application/xml",
  "application/octet-stream",
  "*/*",
];

const COMMON_VALUES: Record<string, string[]> = {
  "Content-Type": MIME_VALUES,
  Accept: MIME_VALUES,
  "Cache-Control": ["no-cache", "no-store", "max-age=0"],
  "Accept-Encoding": ["gzip, deflate, br", "gzip", "identity"],
  "Accept-Language": ["ja", "en-US,en;q=0.9", "ja,en-US;q=0.9,en;q=0.8"],
  "X-Requested-With": ["XMLHttpRequest"],
};

const CUSTOM = "__custom__";

export function HeadersTab({ form }: { form: CurlFormHandle }) {
  const { config, addRow, updateRow, removeRow } = form;

  return (
    <div className="flex flex-col gap-2">
      {config.headers.map((row) => (
        <HeaderRow
          key={row.id}
          row={row}
          onUpdate={(part, value) => updateRow("headers", row.id, part, value)}
          onRemove={() => removeRow("headers", row.id)}
        />
      ))}
      <AddRowButton onClick={() => addRow("headers")} />
    </div>
  );
}

interface RowProps {
  row: KeyValue;
  onUpdate: (part: "key" | "value", value: string) => void;
  onRemove: () => void;
}

function HeaderRow({ row, onUpdate, onRemove }: RowProps) {
  const [customKey, setCustomKey] = useState(
    () => row.key !== "" && !COMMON_HEADERS.includes(row.key),
  );
  const valueOptions = COMMON_VALUES[row.key];
  const [customValue, setCustomValue] = useState(
    () =>
      row.value !== "" &&
      valueOptions !== undefined &&
      !valueOptions.includes(row.value),
  );

  function handleKeySelect(selected: string) {
    if (selected === CUSTOM) {
      setCustomKey(true);
      onUpdate("key", "");
      return;
    }
    setCustomKey(false);
    setCustomValue(false);
    onUpdate("key", selected);
  }

  function handleValueSelect(selected: string) {
    if (selected === CUSTOM) {
      setCustomValue(true);
      onUpdate("value", "");
      return;
    }
    setCustomValue(false);
    onUpdate("value", selected);
  }

  const showValueSelect =
    !customKey && valueOptions !== undefined && !customValue;

  return (
    <div className="flex gap-2">
      <HeaderKeyField
        row={row}
        customKey={customKey}
        onUpdate={onUpdate}
        onSelect={handleKeySelect}
      />
      {showValueSelect ? (
        <ValueSelect
          value={row.value}
          options={valueOptions}
          onSelect={handleValueSelect}
        />
      ) : (
        <input
          type="text"
          value={row.value}
          onChange={(e) => onUpdate("value", e.target.value)}
          placeholder="value"
          aria-label="Header value (custom)"
          className={`${monoFieldClass} flex-1`}
        />
      )}
      <RemoveRowButton onClick={onRemove} />
    </div>
  );
}

interface KeyFieldProps {
  row: KeyValue;
  customKey: boolean;
  onUpdate: (part: "key" | "value", value: string) => void;
  onSelect: (selected: string) => void;
}

function HeaderKeyField({ row, customKey, onUpdate, onSelect }: KeyFieldProps) {
  if (customKey) {
    return (
      <input
        type="text"
        value={row.key}
        onChange={(e) => onUpdate("key", e.target.value)}
        placeholder="X-Custom-Header"
        aria-label="Header name (custom)"
        className={`${monoFieldClass} w-1/3`}
      />
    );
  }

  return (
    <select
      value={row.key}
      onChange={(e) => onSelect(e.target.value)}
      aria-label="Header name"
      className={`${monoFieldClass} w-1/3`}
    >
      <option value="">(select)</option>
      {COMMON_HEADERS.map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
      <option value={CUSTOM}>Custom…</option>
    </select>
  );
}

interface ValueSelectProps {
  value: string;
  options: string[];
  onSelect: (selected: string) => void;
}

function ValueSelect({ value, options, onSelect }: ValueSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onSelect(e.target.value)}
      aria-label="Header value"
      className={`${monoFieldClass} flex-1`}
    >
      <option value="">(select)</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
      <option value={CUSTOM}>Custom…</option>
    </select>
  );
}
