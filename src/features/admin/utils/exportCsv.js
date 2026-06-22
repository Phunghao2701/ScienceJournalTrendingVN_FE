// Header cột tương ứng với các field hiển thị trên table
const CSV_HEADERS = ['Volume', 'Total Issues', 'Publication Date', 'Status', 'Progress'];

/**
 * Chuyển 1 giá trị thành chuỗi an toàn cho CSV:
 * - Bọc trong dấu ngoặc kép nếu chứa dấu phẩy, ngoặc kép hoặc xuống dòng.
 * - Escape dấu ngoặc kép bên trong giá trị (" -> "").
 */
function escapeCsvValue(value) {
  const stringValue = String(value ?? '');
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

/**
 * Xuất danh sách Volume & Issue Overview thành file CSV và trigger download
 * ngay trên browser (không cần gọi API).
 *
 * @param {Array} volumeStatusList - mảng item giống mockVolumeStatus
 */
export function exportVolumeStatusToCsv(volumeStatusList) {
  // Build từng dòng dữ liệu theo đúng thứ tự CSV_HEADERS
  const rows = volumeStatusList.map((item) => [
    item.volume,
    item.totalIssues,
    item.publicationDate,
    item.status,
    `${item.progress}%`,
  ]);

  // Ghép header + rows thành nội dung CSV (mỗi dòng cách nhau \n)
  const csvContent = [CSV_HEADERS, ...rows]
    .map((row) => row.map(escapeCsvValue).join(','))
    .join('\n');

  // Tạo Blob và trigger download qua <a> ẩn - cách chuẩn để export file
  // từ phía client mà không cần backend.
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'volume-issue-status.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Giải phóng URL object sau khi dùng để tránh leak memory
  URL.revokeObjectURL(url);
}
