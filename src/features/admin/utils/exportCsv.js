/**
 * Client-side CSV export utility for the Admin Dashboard Volume & Issue Overview table.
 *
 * File: src/features/admin/utils/exportCsv.js
 */

// Column headers matching the fields displayed in the Volume & Issue table.
const CSV_HEADERS = ['Volume', 'Total Issues', 'Publication Date', 'Status', 'Progress'];

/**
 * Serialise a single value to a safe CSV string:
 * - Wraps in double-quotes if the value contains a comma, double-quote, or newline.
 * - Escapes embedded double-quotes by doubling them (" -> "").
 */
function escapeCsvValue(value) {
  const stringValue = String(value ?? '');
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

/**
 * Export the Volume & Issue Overview list as a CSV file and trigger a browser download
 * entirely on the client side (no API call required).
 *
 * @param {Array} volumeStatusList - array of volume status items (same shape as the table rows)
 */
export function exportVolumeStatusToCsv(volumeStatusList) {
  // Build one row per item in the same column order as CSV_HEADERS.
  const rows = volumeStatusList.map((item) => [
    item.volume,
    item.totalIssues,
    item.publicationDate,
    item.status,
    `${item.progress}%`,
  ]);

  // Concatenate header + data rows into CSV content (newline-separated).
  const csvContent = [CSV_HEADERS, ...rows]
    .map((row) => row.map(escapeCsvValue).join(','))
    .join('\n');

  // Create a Blob and trigger download via a hidden <a> element --
  // the standard client-side export pattern without requiring a backend.
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'volume-issue-status.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Release the object URL after use to avoid a memory leak.
  URL.revokeObjectURL(url);
}
