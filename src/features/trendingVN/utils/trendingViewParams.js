import { normalizeAccessFilter } from '../../article/utils/paperVnDiscoveryParams.js';

export const TRENDING_VIEW_MODES = {
  LIST: 'list',
  TABLE: 'table',
  ANALYSIS: 'analysis',
};

export const normalizeTrendingView = (value) => {
  if (value === TRENDING_VIEW_MODES.TABLE) return TRENDING_VIEW_MODES.TABLE;
  if (value === TRENDING_VIEW_MODES.ANALYSIS) return TRENDING_VIEW_MODES.ANALYSIS;
  return TRENDING_VIEW_MODES.LIST;
};

export const getTrendingViewFromParams = (searchParams) => {
  return normalizeTrendingView(searchParams?.get?.('view'));
};

export const buildTrendingViewSearchParams = (searchParams, nextView) => {
  const params = new URLSearchParams(searchParams);
  const normalizedView = normalizeTrendingView(nextView);

  if (normalizedView === TRENDING_VIEW_MODES.LIST) {
    params.delete('view');
    params.set('page', '1');
    return params;
  }

  params.set('view', normalizedView);
  if (normalizedView === TRENDING_VIEW_MODES.ANALYSIS) {
    params.delete('page');
  } else {
    params.set('page', '1');
  }
  return params;
};

export const shouldCanonicalizeTrendingView = (searchParams) => {
  const rawView = searchParams?.get?.('view');
  return Boolean(rawView) && rawView !== TRENDING_VIEW_MODES.TABLE && rawView !== TRENDING_VIEW_MODES.ANALYSIS;
};

// Used by useArticleList.clearFilters(). Clearing filters must preserve the active
// view: canonical List drops `view` entirely, Table/Analysis keep `view=<mode>`.
// Table also resets to page 1; Analysis never carries a page param.
export const buildClearedTrendingSearchParams = (viewMode) => {
  const normalizedView = normalizeTrendingView(viewMode);
  if (normalizedView === TRENDING_VIEW_MODES.LIST) {
    return new URLSearchParams();
  }
  const params = new URLSearchParams();
  params.set('view', normalizedView);
  if (normalizedView === TRENDING_VIEW_MODES.TABLE) {
    params.set('page', '1');
  }
  return params;
};

// Used by useArticleList.updateFilters(). Filter updates must not add/keep a page
// param while in Analysis (no pagination there); List/Table reset page to 1 on
// any filter change, same as before.
export const buildFilterUpdateSearchParams = (searchParams, newFilters, viewMode) => {
  const params = new URLSearchParams(searchParams);
  const normalizedView = normalizeTrendingView(viewMode);
  const filterKeys = [
    'search', 'year', 'journal', 'journal_id', 'institution_id', 'publisher_id',
    'author_id', 'topic', 'topic_id', 'keyword_id', 'access', 'selectedAccess',
    'selectedJournal', 'selectedInstitution', 'selectedPublisher', 'selectedAuthor',
    'selectedTopic', 'selectedKeyword', 'from_year', 'to_year', 'fromYear', 'toYear',
  ];
  const hasFilterChange = Object.keys(newFilters).some((k) => filterKeys.includes(k));
  if (hasFilterChange) {
    if (normalizedView === TRENDING_VIEW_MODES.ANALYSIS) {
      params.delete('page');
    } else {
      params.set('page', '1');
    }
  }

  const keyMap = {
    selectedAccess: 'access',
    selectedJournal: 'journal_id',
    selectedInstitution: 'institution_id',
    selectedPublisher: 'publisher_id',
    selectedAuthor: 'author_id',
    selectedTopic: 'topic_id',
    selectedKeyword: 'keyword_id',
    fromYear: 'from_year',
    toYear: 'to_year',
  };
  Object.entries(newFilters).forEach(([rawKey, rawValue]) => {
    const key = keyMap[rawKey] || rawKey;
    const value = key === 'access' ? normalizeAccessFilter(rawValue) : rawValue;

    if (value === null || value === undefined || value === 'all' || value === '') {
      params.delete(key);
      if (key === 'journal_id') params.delete('journal');
      if (key === 'topic_id') params.delete('topic');
    } else {
      params.set(key, String(value));
      if (key === 'journal_id') params.delete('journal');
      if (key === 'topic_id') params.delete('topic');
    }
  });

  return params;
};

// Mirrors TrendingVNPage.buildResultsReturnPath(); kept pure/parameterized for testability.
// Current behavior re-derives params from the parsed `filters` object (always injecting
// page) instead of preserving location.pathname + location.search verbatim
// (the bug FE-FIX-03 must close).
export const buildLegacyReturnToFromFilters = (pathname, search, filters) => {
  const params = new URLSearchParams(search);
  if (filters.search) params.set('search', filters.search);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
  if (filters.selectedYear && filters.selectedYear !== 'all') params.set('year', filters.selectedYear);
  if (filters.selectedJournal && filters.selectedJournal !== 'all') params.set('journal_id', filters.selectedJournal);
  if (filters.selectedInstitution && filters.selectedInstitution !== 'all') params.set('institution_id', filters.selectedInstitution);
  if (filters.selectedPublisher && filters.selectedPublisher !== 'all') params.set('publisher_id', filters.selectedPublisher);
  if (filters.selectedAuthor && filters.selectedAuthor !== 'all') params.set('author_id', filters.selectedAuthor);
  if (filters.selectedTopic && filters.selectedTopic !== 'all') params.set('topic_id', filters.selectedTopic);
  if (filters.selectedKeyword && filters.selectedKeyword !== 'all') params.set('keyword_id', filters.selectedKeyword);
  if (filters.selectedAccess && filters.selectedAccess !== 'all') params.set('access', filters.selectedAccess);
  if (filters.fromYear) params.set('from_year', filters.fromYear);
  if (filters.toYear) params.set('to_year', filters.toYear);
  const query = params.toString();
  return `${pathname}${query ? `?${query}` : ''}`;
};

// Desired exact returnTo: verbatim current location, no re-derivation.
export const buildExactReturnToPath = (pathname, search) => `${pathname}${search}`;
