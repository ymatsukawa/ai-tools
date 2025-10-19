import { useState } from "react";

type SortDirection = 'asc' | 'desc' | null;

export function useTableSort(rows: string[][]) {
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const isNumeric = (value: string): boolean => {
    if (value.trim() === '') return false;
    return !isNaN(Number(value));
  };

  const isColumnNumeric = (rows: string[][], columnIndex: number): boolean => {
    return rows.every(row => {
      const value = row[columnIndex];
      return value === undefined || value === '' || isNumeric(value);
    });
  };

  const handleSort = (columnIndex: number) => {
    let newDirection: SortDirection = 'asc';

    if (sortColumn === columnIndex) {
      if (sortDirection === 'asc') {
        newDirection = 'desc';
      } else if (sortDirection === 'desc') {
        newDirection = null;
        setSortColumn(null);
        setSortDirection(null);
        return;
      }
    }

    setSortColumn(columnIndex);
    setSortDirection(newDirection);
  };

  const getSortedRows = (): string[][] => {
    if (sortColumn === null || sortDirection === null) {
      return rows;
    }

    const sortedRows = [...rows];
    const isNumColumn = isColumnNumeric(rows, sortColumn);

    sortedRows.sort((a, b) => {
      const aValue = a[sortColumn] || '';
      const bValue = b[sortColumn] || '';

      let comparison = 0;

      if (isNumColumn) {
        const aNum = Number(aValue);
        const bNum = Number(bValue);
        comparison = aNum - bNum;
      } else {
        comparison = aValue.localeCompare(bValue);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sortedRows;
  };

  return {
    sortColumn,
    sortDirection,
    handleSort,
    getSortedRows
  };
}
