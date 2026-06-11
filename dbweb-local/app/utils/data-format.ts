import Encoding from "encoding-japanese";
import type {
  CopyFormat,
  DataEncoding,
  DataNewline,
  DataSettings,
} from "./settings";
import { downloadBlob } from "./download";

const DELIMITERS: Record<CopyFormat, string> = {
  csv: ",",
  tsv: "\t",
};

const NEWLINES: Record<DataNewline, string> = {
  lf: "\n",
  crlf: "\r\n",
};

function escapeField(value: unknown, delimiter: string): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (s.includes(delimiter) || s.includes('"') || /[\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function formatRows(
  columns: string[],
  rows: unknown[][],
  opts: Pick<DataSettings, "copyFormat" | "withHeader" | "newline">
): string {
  const delimiter = DELIMITERS[opts.copyFormat];
  const newline = NEWLINES[opts.newline];
  const lines: string[] = [];
  if (opts.withHeader) {
    lines.push(columns.map((c) => escapeField(c, delimiter)).join(delimiter));
  }
  for (const row of rows) {
    lines.push(row.map((v) => escapeField(v, delimiter)).join(delimiter));
  }
  return lines.join(newline);
}

export function downloadRows(
  columns: string[],
  rows: unknown[][],
  data: DataSettings
): void {
  const text = formatRows(columns, rows, data);
  const blob = new Blob([encodeText(text, data.encoding) as BlobPart], {
    type: contentType(data),
  });
  downloadBlob(blob, `result-${timestamp()}.${data.copyFormat}`);
}

function encodeText(text: string, encoding: DataEncoding): Uint8Array {
  if (encoding === "shift-jis") {
    return new Uint8Array(
      Encoding.convert(Encoding.stringToCode(text), {
        to: "SJIS",
        from: "UNICODE",
      })
    );
  }
  return new TextEncoder().encode(text);
}

function contentType(data: DataSettings): string {
  const mime =
    data.copyFormat === "csv" ? "text/csv" : "text/tab-separated-values";
  const charset = data.encoding === "shift-jis" ? "shift_jis" : "utf-8";
  return `${mime};charset=${charset}`;
}

function timestamp(): string {
  return new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
}
