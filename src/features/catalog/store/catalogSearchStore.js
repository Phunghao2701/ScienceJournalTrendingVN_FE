/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\catalog\store\catalogSearchStore.js
 */
import { create } from 'zustand';

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

  /** Replace selected subject areas and reset dependent categories/page. */
  setSelectedAreas: (selectedAreas) => set({ selectedAreas, selectedCategories: [], page: 1 }),

  /** Replace selected subject categories and reset pagination. */
  setSelectedCategories: (selectedCategories) => set({ selectedCategories, page: 1 }),

  /** Replace selected access filters and reset pagination. */
  setSelectedAccess: (selectedAccess) => set({ selectedAccess, page: 1 }),

  /** Replace selected quartile filters and reset pagination. */
  setSelectedQuartiles: (selectedQuartiles) => set({ selectedQuartiles, page: 1 }),

  /** Reset filters to defaults while preserving the default metric sort. */
  clearFilters: () => set({ ...CATALOG_DEFAULT_SEARCH_STATE }),

  /** Hydrate store values from URL query params. */
  hydrateFromQuery: (queryState) => set({ ...CATALOG_DEFAULT_SEARCH_STATE, ...queryState }),
}));
