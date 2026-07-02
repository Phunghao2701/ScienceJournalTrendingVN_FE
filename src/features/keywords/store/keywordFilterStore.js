/**
 * Zustand store for Keywords page filter, sort, and pagination state.
 *
 * File: features/keywords/store/keywordFilterStore.js
 *
 * Same filter/reset pattern as catalogSearchStore (features/catalog/store/catalogSearchStore.js),
 * but without an exported DEFAULT_STATE constant -- clearFilters hardcodes reset values inline.
 * Not persisted to localStorage intentionally: stale keyword filters between sessions
 * would be confusing since keyword popularity rankings change frequently.
 * Consumed by: useKeywords.js, KeywordListPage.jsx, KeywordSearchBar.jsx, KeywordSortDropdown.jsx.
 */
import { create } from 'zustand';

/**
 * Manages keyword search string, sort field/order, page, limit, and view mode.
 * All filter-changing actions also reset page to 1 to avoid showing empty results.
 */
export const useKeywordFilterStore = create((set) => ({
  keyword: '',
  page: 1,
  limit: 20,
  sortBy: 'article_count',
  sortOrder: 'desc',
  viewMode: 'list',

  /** Updates the search keyword and resets to page 1. */
  setKeyword: (keyword) => {
    set({ keyword, page: 1 });
  },

  /** Updates the current page without changing any active filters. */
  setPage: (page) => {
    set({ page });
  },

  /** Updates items-per-page and resets to page 1. */
  setLimit: (limit) => {
    set({ limit, page: 1 });
  },

  /** Updates sort field and direction, resets to page 1.
   *  sortBy values match field names accepted by GET /api/v1/keywords (e.g. 'article_count'). */
  setSort: (sortBy, sortOrder) => {
    set({ sortBy, sortOrder, page: 1 });
  },

  /** Switches display mode between 'list' (KeywordList.jsx) and 'cloud' (KeywordMomentumCloud.jsx). */
  setViewMode: (viewMode) => {
    set({ viewMode });
  },

  /** Resets all filters to defaults.
   *  Note: values are hardcoded here rather than referencing a DEFAULT_STATE constant,
   *  unlike catalogSearchStore which exports CATALOG_DEFAULT_SEARCH_STATE for reuse. */
  clearFilters: () => {
    set({
      keyword: '',
      page: 1,
      limit: 20,
      sortBy: 'article_count',
      sortOrder: 'desc',
      viewMode: 'list',
    });
  },
}));
