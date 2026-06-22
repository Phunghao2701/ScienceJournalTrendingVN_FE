/**
* Lưu ý: Submission Status ở đây dùng để LỌC danh sách (khác với
 * ARTICLE_STATUS_OPTIONS trong articleStatus.js dùng cho dropdown
 * "Update Status" trong Update Article) - nhưng dùng chung style badge.
 */
import { ARTICLE_REVIEW_STATUS_STYLE } from './articleStatus';

// Option "All Journals" + danh sách journal (tạm tĩnh, sẽ thay bằng
// GET /api/v1/journal khi tích hợp API)
export const JOURNAL_FILTER_OPTIONS = [
  'All Journals',
  'International Physics Review',
  'Civil Engineering Quarterly',
  'Applied Ethics Quarterly',
  'Advanced Bio-Quantum Research',
];

// Option "All Statuses" + toàn bộ status từ ARTICLE_REVIEW_STATUS_STYLE
// (đảm bảo label đồng bộ giữa filter và badge trong table)
export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  ...Object.entries(ARTICLE_REVIEW_STATUS_STYLE).map(([value, { label }]) => ({
    value,
    label,
  })),
];