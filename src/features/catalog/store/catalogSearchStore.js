/**
 * Zustand store for Journal Catalog search, filter, and pagination state.
 *
 * File: features/catalog/store/catalogSearchStore.js
 *
 * Global store (vs component-local state) so that filter selections persist across
 * tab switches within CatalogSearchPage, and so child components (FilterPanel, JournalTable)
 * can read/write the same state without prop-drilling.
 * hydrateFromQuery() allows the URL to seed the store on page load.
 * Consumed by: useCatalog.js, useCatalogSearch.js, CatalogSearchPage.jsx, FilterPanel.jsx.
 */
import { create } from 'zustand';

// Exported so both hydrateFromQuery and clearFilters share one source of truth for defaults.
// sort: 'metric' orders journals by composite impact score — best default for discovery use.
export const CATALOG_DEFAULT_SEARCH_STATE = {
  keyword: '',
  page: 1,
  limit: 10,
  sort: 'metric',
  viewMode: 'table',
  selectedAreas: [],
  selectedCategories: [],
  selectedAccess: [],
  selectedQuartiles: [],
};

export const useCatalogSearchStore = create((set) => ({
  ...CATALOG_DEFAULT_SEARCH_STATE,

  /** Update submitted keyword and reset pagination. */
  setKeyword: (keyword) => set({ keyword, page: 1 }),

  /** Update current page without mutating active filters. */
  setPage: (page) => set({ page: Math.max(1, Number(page) || 1) }),

  /** Update API sort mode and reset pagination. */
  setSort: (sort) => set({ sort: sort || CATALOG_DEFAULT_SEARCH_STATE.sort, page: 1 }),

  /** Switch between list and table result views. */
  setViewMode: (viewMode) => set({ viewMode: viewMode === 'table' ? 'table' : 'list' }),

  /** Replaces selected subject areas and resets categories + page.
   *  Categories are cleared because they are children of areas — a stale category
   *  from a different area would produce incorrect API filter results. */
  setSelectedAreas: (selectedAreas) => set({ selectedAreas, selectedCategories: [], page: 1 }),

  /** Replace selected subject categories and reset pagination. */
  setSelectedCategories: (selectedCategories) => set({ selectedCategories, page: 1 }),

  /** Replace selected access filters and reset pagination. */
  setSelectedAccess: (selectedAccess) => set({ selectedAccess, page: 1 }),

  /** Replace selected quartile filters and reset pagination. */
  setSelectedQuartiles: (selectedQuartiles) => set({ selectedQuartiles, page: 1 }),

  /** Reset filters to defaults while preserving the default metric sort. */
  clearFilters: () => set({ ...CATALOG_DEFAULT_SEARCH_STATE }),

  /** Seeds the store from URL query params on page load, merging over defaults.
   *  Called by useCatalogSearch.js when the route already has existing search params. */
  hydrateFromQuery: (queryState) => set({ ...CATALOG_DEFAULT_SEARCH_STATE, ...queryState }),
}));
