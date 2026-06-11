import type {
  CopyFormat,
  DataEncoding,
  DataNewline,
  DataSettings,
} from "~/utils/settings";
import { RadioGroup } from "./form";

interface DataSettingsPanelProps {
  data: DataSettings;
  updateData: (partial: Partial<DataSettings>) => void;
}

export function DataSettingsPanel({ data, updateData }: DataSettingsPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <RadioGroup<CopyFormat>
        legend="format"
        name="copyFormat"
        value={data.copyFormat}
        options={[
          { value: "csv", label: "CSV", description: "comma-separated (default)" },
          { value: "tsv", label: "TSV", description: "tab-separated" },
        ]}
        onChange={(copyFormat) => updateData({ copyFormat })}
      />
      <RadioGroup<boolean>
        legend="with head"
        name="withHeader"
        value={data.withHeader}
        options={[
          { value: true, label: "on", description: "include column names (default)" },
          { value: false, label: "off" },
        ]}
        onChange={(withHeader) => updateData({ withHeader })}
      />
      <RadioGroup<DataEncoding>
        legend="encoding"
        name="encoding"
        value={data.encoding}
        options={[
          { value: "utf-8", label: "UTF-8", description: "(default)" },
          { value: "shift-jis", label: "Shift-JIS" },
        ]}
        onChange={(encoding) => updateData({ encoding })}
      />
      <RadioGroup<DataNewline>
        legend="newline"
        name="newline"
        value={data.newline}
        options={[
          { value: "lf", label: "LF", description: "(default)" },
          { value: "crlf", label: "CRLF" },
        ]}
        onChange={(newline) => updateData({ newline })}
      />
      <p className="text-xs text-gray-500">
        Applied to the per-row copy button and the result download button.
        Encoding applies to downloads only (clipboard is always text).
      </p>
    </div>
  );
}
