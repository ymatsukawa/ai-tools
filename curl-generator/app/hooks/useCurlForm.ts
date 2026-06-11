import { useRef, useState } from "react";
import {
  initialCurlConfig,
  type CurlConfig,
  type CurlOptions,
  type KeyValue,
} from "../utils/curl";

type KeyValueField = "headers" | "formFields";

export function useCurlForm() {
  const [config, setConfig] = useState<CurlConfig>(initialCurlConfig);
  const nextRowId = useRef(1);

  function update<K extends keyof CurlConfig>(key: K, value: CurlConfig[K]) {
    setConfig((current) => ({ ...current, [key]: value }));
  }

  function updateOption<K extends keyof CurlOptions>(
    key: K,
    value: CurlOptions[K],
  ) {
    setConfig((current) => ({
      ...current,
      options: { ...current.options, [key]: value },
    }));
  }

  function addRow(field: KeyValueField) {
    const id = `${field}-${nextRowId.current++}`;
    setConfig((current) => ({
      ...current,
      [field]: [...current[field], { id, key: "", value: "" }],
    }));
  }

  function updateRow(
    field: KeyValueField,
    id: string,
    part: "key" | "value",
    value: string,
  ) {
    setConfig((current) => ({
      ...current,
      [field]: current[field].map((row: KeyValue) =>
        row.id === id ? { ...row, [part]: value } : row,
      ),
    }));
  }

  function removeRow(field: KeyValueField, id: string) {
    setConfig((current) => ({
      ...current,
      [field]: current[field].filter((row: KeyValue) => row.id !== id),
    }));
  }

  return { config, update, updateOption, addRow, updateRow, removeRow };
}

export type CurlFormHandle = ReturnType<typeof useCurlForm>;
