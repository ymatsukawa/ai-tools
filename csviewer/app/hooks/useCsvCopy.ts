export function useCsvCopy() {
  const formatCellForCsv = (cell: string): string => {
    // If cell contains comma, newline, or quote, wrap in quotes
    if (cell.includes(',') || cell.includes('\n') || cell.includes('"')) {
      // Escape quotes by doubling them
      const escaped = cell.replace(/"/g, '""');
      return `"${escaped}"`;
    }
    return cell;
  };

  const copyRowToCsv = (row: string[]) => {
    const csvRow = row.map(cell => formatCellForCsv(cell)).join(',');
    navigator.clipboard.writeText(csvRow).then(() => {
      console.log('Row copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy row:', err);
    });
  };

  const copyHeaderToCsv = (headers: string[]) => {
    const csvHeader = headers.map(header => formatCellForCsv(header)).join(',');
    navigator.clipboard.writeText(csvHeader).then(() => {
      console.log('Header copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy header:', err);
    });
  };

  return {
    copyRowToCsv,
    copyHeaderToCsv
  };
}
