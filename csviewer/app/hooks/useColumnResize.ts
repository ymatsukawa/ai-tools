import { useState, useRef } from "react";

const DEFAULT_COLUMN_WIDTH = 200;
const MIN_COLUMN_WIDTH = 50;

export function useColumnResize(columnCount: number) {
  const [columnWidths, setColumnWidths] = useState<number[]>(
    Array(columnCount).fill(DEFAULT_COLUMN_WIDTH)
  );

  const resizingColumn = useRef<number | null>(null);
  const startX = useRef<number>(0);
  const startWidth = useRef<number>(0);

  const handleMouseDown = (e: React.MouseEvent, columnIndex: number) => {
    e.preventDefault();
    resizingColumn.current = columnIndex;
    startX.current = e.clientX;
    startWidth.current = columnWidths[columnIndex];

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (resizingColumn.current === null) return;

    const diff = e.clientX - startX.current;
    const newWidth = Math.max(MIN_COLUMN_WIDTH, startWidth.current + diff);

    setColumnWidths(prev => {
      const newWidths = [...prev];
      newWidths[resizingColumn.current!] = newWidth;
      return newWidths;
    });
  };

  const handleMouseUp = () => {
    resizingColumn.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return {
    columnWidths,
    handleMouseDown
  };
}
