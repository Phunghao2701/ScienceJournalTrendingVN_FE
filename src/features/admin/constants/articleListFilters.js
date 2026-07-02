/**
 * Filter option lists for the Admin Article Repository page.
 *
 * Note: Submission Status here is used for LIST FILTERING (distinct from
 * ARTICLE_STATUS_OPTIONS in articleStatus.js which drives the "Update Status"
 * dropdown in Update Article), but both share the same badge style map.
 *
 * File: src/features/admin/constants/articleListFilters.js
 */
import { ARTICLE_REVIEW_STATUS_STYLE } from './articleStatus';

// "All Journals" sentinel plus a static placeholder list;
// replace with GET /api/v1/journal when the API is integrated.
export const JOURNAL_FILTER_OPTIONS = [
  'All Journals',
  'International Physics Review',
  'Civil Engineering Quarterly',
  'Applied Ethics Quarterly',
  'Advanced Bio-Quantum Research',
];

// "All Statuses" sentinel plus every status derived from ARTICLE_REVIEW_STATUS_STYLE
// so filter labels stay in sync with table badge labels.
export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  ...Object.entries(ARTICLE_REVIEW_STATUS_STYLE).map(([value, { label }]) => ({
    value,
    label,
  })),
];