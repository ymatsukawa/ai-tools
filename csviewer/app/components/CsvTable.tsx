import { useColumnResize } from "../hooks/useColumnResize";
import { useTableSort } from "../hooks/useTableSort";
import { useCsvCopy } from "../hooks/useCsvCopy";
import { ClipboardIcon } from "./svg/ClipboardIcon";

interface CsvTableProps {
  headers: string[];
  rows: string[][];
}

export function CsvTable({ headers, rows }: CsvTableProps) {
  const { columnWidths, handleMouseDown } = useColumnResize(headers.length);
  const { sortColumn, sortDirection, handleSort, getSortedRows } = useTableSort(rows);
  const { copyRowToCsv, copyHeaderToCsv } = useCsvCopy();

  return (
    <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
      <table className="bg-white border border-gray-300" style={{ tableLayout: 'fixed' }}>
        <thead className="bg-gray-100 sticky top-0 z-10 group">
          <tr>
            {/* Copy button column header */}
            <th className="border-b border-gray-300 bg-gray-100 sticky top-0 z-10 text-center" style={{ width: '40px', minWidth: '40px' }}>
              <button
                onClick={() => copyHeaderToCsv(headers)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                title="Copy header as CSV"
                aria-label="Copy header as CSV"
              >
                <ClipboardIcon className="w-4 h-4 text-gray-600" />
              </button>
            </th>
            {headers.map((header, index) => (
              <th
                key={index}
                className="border-b border-gray-300 text-left font-semibold text-gray-700 select-none relative bg-gray-100"
                style={{
                  width: `${columnWidths[index]}px`,
                  maxWidth: `${columnWidths[index]}px`
                }}
              >
                <div
                  onClick={() => handleSort(index)}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                  style={{
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span>{header}</span>
                    {sortColumn === index && (
                      <span className="text-blue-600 flex-shrink-0">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </div>
                {/* Resize handle */}
                <div
                  onMouseDown={(e) => handleMouseDown(e, index)}
                  className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-400 bg-gray-300"
                  onClick={(e) => e.stopPropagation()}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {getSortedRows().map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50 group">
              {/* Copy button cell */}
              <td className="border-b border-gray-200 text-center" style={{ width: '40px', minWidth: '40px' }}>
                <button
                  onClick={() => copyRowToCsv(row)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                  title="Copy row as CSV"
                  aria-label="Copy row as CSV"
                >
                  <ClipboardIcon className="w-4 h-4 text-gray-600" />
                </button>
              </td>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-4 py-2 border-b border-gray-200"
                  style={{
                    width: `${columnWidths[cellIndex]}px`,
                    maxWidth: `${columnWidths[cellIndex]}px`,
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
