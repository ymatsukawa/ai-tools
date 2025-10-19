import { useState } from "react";
import Encoding from "encoding-japanese";
import type { Settings } from "./useSettings";

interface CsvData {
  headers: string[];
  rows: string[][];
}

export function useCsvParser(settings: Settings) {
  const [csvData, setCsvData] = useState<CsvData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getLineBreakPattern = (lineBreak: string): string => {
    switch (lineBreak) {
      case 'CRLF':
        return '\r\n';
      case 'CR':
        return '\r';
      case 'LF':
      default:
        return '\n';
    }
  };

  const splitLines = (text: string, lineBreak: string): string[] => {
    const pattern = getLineBreakPattern(lineBreak);
    // Normalize all line breaks to the configured one, then split
    const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    return normalized.split('\n').filter(line => line.trim() !== '');
  };

  const parseField = (field: string): string => {
    let trimmed = field.trim();

    // If field is wrapped in double quotes, remove them
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      trimmed = trimmed.slice(1, -1);
      // Handle escaped quotes (double quotes "" become single quote ")
      trimmed = trimmed.replace(/""/g, '"');
    }

    return trimmed;
  };

  const parseLine = (line: string, separator: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote ("")
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          current += char;
        }
      } else if (char === separator && !inQuotes) {
        // End of field
        result.push(parseField(current));
        current = '';
      } else {
        current += char;
      }
    }

    // Add last field
    result.push(parseField(current));
    return result;
  };

  const parseCSV = (text: string, separator: string, lineBreak: string): CsvData => {
    const lines = splitLines(text, lineBreak);

    if (lines.length === 0) {
      throw new Error('CSV format is broken');
    }

    const headers = parseLine(lines[0], separator);
    const rows = lines.slice(1).map(line => parseLine(line, separator));

    return { headers, rows };
  };

  const parseFile = (file: File) => {
    setError(null);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(buffer);

        // Detect encoding (auto-detects UTF-8, Shift_JIS, EUC-JP, etc.)
        const detectedEncoding = Encoding.detect(uint8Array);

        // Convert to Unicode (UTF-16) array
        const unicodeArray = Encoding.convert(uint8Array, {
          to: 'UNICODE',
          from: detectedEncoding || 'AUTO'
        });

        // Convert to UTF-8 string
        const text = Encoding.codeToString(unicodeArray);

        // Use configured separator
        const separator = settings.separator;

        if (!text.includes(separator)) {
          setError(`Seperator ${separator} does not found`);
          return;
        }

        // Modeling for table with configured separator and line break
        const data = parseCSV(text, separator, settings.lineBreak);
        setCsvData(data);
      } catch (err) {
        setError('CSV format is broken');
      }
    };

    reader.onerror = () => {
      setError('CSV format is broken');
    };

    reader.readAsArrayBuffer(file);
  };

  const clearData = () => {
    setCsvData(null);
    setError(null);
  };

  return {
    csvData,
    error,
    parseFile,
    clearData,
    setError
  };
}
