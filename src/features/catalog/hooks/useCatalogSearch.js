/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\catalog\hooks\useCatalogSearch.js
 */
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchJournalsApi } from '../../journal/api/journalApi';
import { getSubjectAreasApi, getSubjectCategoriesApi } from '../api/catalogApi';
import { getCountryStatsApi } from '../../zone/api/zone.api';
import { normalizeSearchResponse } from '../services/catalogSearchService';
import { useCatalogSearchStore } from '../store/catalogSearchStore';

/**
 * Custom hook powering the catalog search page.
 * Source of truth: URL search params (for shareability).
 * Default sort: metric (highest metric first), per ISSUE_FE_SEARCH_PAGE.
 */
export function useCatalogSearch(currentUser) {
  const [searchParams, setSearchParams] = useSearchParams();

  /* ----- Local controlled search input (not yet submitted) ----- */
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  /* ----- Filter data lists ----- */
  const [subjectAreas, setSubjectAreas] = useState([]);
  const [subjectCategories, setSubjectCategories] = useState([]);
  const [zones, setZones] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(false);

  /* ----- Result state ----- */
  const [journals, setJournals] = useState([]);
  const [total, setTotal] = useState(0);
  const [loadingJournals, setLoadingJournals] = useState(false);
  const [error, setError] = useState(null);

  /* ----- Auth-gated actions state ----- */
  const [followedJournals, setFollowedJournals] = useState({});
  const [showAuthModal, setShowAuthModal] = useState(false);

  /* ----- View mode (list | table), stored globally via Zustand ----- */
  const viewMode = useCatalogSearchStore((state) => state.viewMode);
  const setViewMode = useCatalogSearchStore((state) => state.setViewMode);
  const hydrateFromQuery = useCatalogSearchStore((state) => state.hydrateFromQuery);

  /* ----- Parse active filters from URL (single source of truth) ----- */
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  // Default to 'metric' (highest metric first) on first load per ISSUE_FE_SEARCH_PAGE
  const sort = searchParams.get('sort') || 'metric';

  const selectedAreas = searchParams.getAll('area_id').map(String);
  const selectedCategories = searchParams.getAll('cat_id').map(String);
  const selectedAccess = searchParams.getAll('access');
  const selectedQuartiles = searchParams.getAll('quartile');
  const selectedYear = searchParams.get('ranking_year') || '';
  const selectedZone = searchParams.get('country_id') || '';
  const isOaDiamond = searchParams.get('is_oa_diamond') === 'true';

  const selectedAreasStr = selectedAreas.join(',');
  const selectedCategoriesStr = selectedCategories.join(',');
  const selectedAccessStr = selectedAccess.join(',');
  const selectedQuartilesStr = selectedQuartiles.join(',');

  useEffect(() => {
    hydrateFromQuery({
      keyword: search,
      page,
      limit,
      sort,
      selectedAreas,
      selectedCategories,
      selectedAccess,
      selectedQuartiles,
      selectedYear,
      selectedZone,
      isOaDiamond,
      viewMode,
    });
  }, [search, page, limit, sort, selectedAreasStr, selectedCategoriesStr, selectedAccessStr, selectedQuartilesStr, viewMode, hydrateFromQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ----- Load filter dropdown lists on mount ----- */
  useEffect(() => {
    async function loadFilters() {
      setLoadingFilters(true);
      try {
        const [areasRes, catsRes, zonesRes] = await Promise.all([
          getSubjectAreasApi(),
          getSubjectCategoriesApi(),
          getCountryStatsApi({ page: 1, limit: 300 }),
        ]);
        setSubjectAreas(areasRes.data?.data?.items || areasRes.data?.data || []);
        setSubjectCategories(catsRes.data?.data?.items || catsRes.data?.data || []);
        setZones(zonesRes.data?.data?.items || zonesRes.data?.data?.countries || zonesRes.data?.data || []);
      } catch (err) {
        console.error('Failed to load catalog filter lists:', err);
        setSubjectAreas([]);
        setSubjectCategories([]);
        setZones([]);
      } finally {
        setLoadingFilters(false);
      }
    }
    loadFilters();
  }, []);

  /* ----- Fetch journals whenever URL params change ----- */

  const fetchJournals = useCallback(async () => {
    setLoadingJournals(true);
    setError(null);
    try {
      const params = {
        search: search || undefined,
        page,
        limit,
        sort,
        subject_area_ids: selectedAreas.join(',') || undefined,
        subject_category_ids: selectedCategories.join(',') || undefined,
        is_open_access:
          selectedAccess.includes('open_access') && !selectedAccess.includes('subscription')
            ? true
            : !selectedAccess.includes('open_access') && selectedAccess.includes('subscription')
            ? false
            : undefined,
        quartiles: selectedQuartiles.join(',') || undefined,
        ranking_year: selectedYear || undefined,
        country_ids: selectedZone || undefined,
        is_oa_diamond: isOaDiamond ? true : undefined,
      };

      const response = await searchJournalsApi(params);

      if (response.data && response.data.success !== false) {
        const { items, pagination } = normalizeSearchResponse(response.data);
        setJournals(items);
        setTotal(pagination.total);
      } else {
        throw new Error(response.data?.message || 'Lỗi không xác định từ server');
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) {
        setError('Không tìm thấy kết quả.');
      } else {
        setError(err.response?.data?.message || err.message || 'Lỗi kết nối đến server.');
      }
      setJournals([]);
      setTotal(0);
    } finally {
      setLoadingJournals(false);
    }
  }, [search, page, limit, sort, selectedAreasStr, selectedCategoriesStr, selectedAccessStr, selectedQuartilesStr, selectedYear, selectedZone, isOaDiamond]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { fetchJournals(); }, [fetchJournals]);

  /* ----- Ensure default sort is reflected in URL on first load ----- */
  useEffect(() => {
    if (!searchParams.get('sort')) {
      const next = new URLSearchParams(searchParams);
      next.set('sort', 'metric');
      setSearchParams(next, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ========================= HANDLERS ========================= */

  /** Submit the local search input value. Resets to page 1. */
  const handleSearchSubmit = (e) => {
    if (e?.preventDefault) e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      next.set('search', searchInput.trim());
    } else {
      next.delete('search');
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  /** Jump-search by clicking a tag / badge label. */
  const searchForTag = (tag) => {
    setSearchInput(tag);
    const next = new URLSearchParams(searchParams);
    next.set('search', tag);
    next.set('page', '1');
    setSearchParams(next);
  };

  /* ----- Multi-value param toggle helper ----- */
  const toggleParamValue = (key, value) => {
    const next = new URLSearchParams(searchParams);
    const current = next.getAll(key);
    if (current.includes(String(value))) {
      const updated = current.filter(v => v !== String(value));
      next.delete(key);
      updated.forEach(v => next.append(key, v));
    } else {
      next.append(key, String(value));
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleQuartileToggle = (q) => toggleParamValue('quartile', q);
  const handleAccessToggle = (a) => toggleParamValue('access', a);

  /** Toggle a subject area; if toggled off, removes dependent categories. */
  const handleAreaToggle = (areaId) => {
    const next = new URLSearchParams(searchParams);
    const currentAreas = next.getAll('area_id').map(String);
    const areaIdStr = String(areaId);

    if (currentAreas.includes(areaIdStr)) {
      const remaining = currentAreas.filter(id => id !== areaIdStr);
      next.delete('area_id');
      remaining.forEach(id => next.append('area_id', id));

      const dependent = subjectCategories
        .filter(c => String(c.subject_area_id) === areaIdStr)
        .map(c => String(c.subject_category_id));
      const currentCats = next.getAll('cat_id').map(String);
      const remainingCats = currentCats.filter(id => !dependent.includes(id));
      next.delete('cat_id');
      remainingCats.forEach(id => next.append('cat_id', id));
    } else {
      next.append('area_id', areaIdStr);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleCategoryToggle = (catId) => toggleParamValue('cat_id', catId);

  /** Single-select area from dropdown. Clears dependent categories. */
  const onAreaSelect = (areaId) => {
    const next = new URLSearchParams(searchParams);
    next.delete('area_id');
    next.delete('cat_id');
    if (areaId && areaId !== 'all') next.set('area_id', String(areaId));
    next.set('page', '1');
    setSearchParams(next);
  };

  const onCategorySelect = (catId) => {
    const next = new URLSearchParams(searchParams);
    next.delete('cat_id');
    if (catId && catId !== 'all') next.set('cat_id', String(catId));
    next.set('page', '1');
    setSearchParams(next);
  };

  const onAccessSelect = (accessVal) => {
    const next = new URLSearchParams(searchParams);
    next.delete('access');
    if (accessVal && accessVal !== 'all') next.set('access', accessVal);
    next.set('page', '1');
    setSearchParams(next);
  };

  const onQuartileSelect = (quartileVal) => {
    const next = new URLSearchParams(searchParams);
    next.delete('quartile');
    if (quartileVal && quartileVal !== 'all') next.set('quartile', quartileVal);
    next.set('page', '1');
    setSearchParams(next);
  };

  const onYearSelect = (yearVal) => {
    const next = new URLSearchParams(searchParams);
    if (yearVal && yearVal !== 'all') {
      next.set('ranking_year', String(yearVal));
    } else {
      next.delete('ranking_year');
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const onZoneSelect = (zoneId) => {
    const next = new URLSearchParams(searchParams);
    if (zoneId && zoneId !== 'all') {
      next.set('country_id', String(zoneId));
    } else {
      next.delete('country_id');
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  /** Toggle is_oa_diamond filter. */
  const handleOaDiamondToggle = (val) => {
    const next = new URLSearchParams(searchParams);
    if (val) {
      next.set('is_oa_diamond', 'true');
    } else {
      next.delete('is_oa_diamond');
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  /** Reset all filters. Always resets sort back to default metric. */
  const handleClearAll = () => {
    setSearchInput('');
    setSearchParams({ page: '1', limit: String(limit), sort: 'metric' });
  };

  /** Change sort, preserve other params, reset to page 1. */
  const handleSortChange = (newSort) => {
    const next = new URLSearchParams(searchParams);
    next.set('sort', newSort);
    next.set('page', '1');
    setSearchParams(next);
  };

  /** Navigate to a different page. */
  const handlePageChange = (newPage) => {
    if (newPage < 1) return;
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
  };

  /** Guest-aware follow toggle (shows login modal for unauthenticated). */
  const handleFollowJournal = async (journalId) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    setFollowedJournals(prev => ({ ...prev, [journalId]: !prev[journalId] }));
  };

  return {
    // Controlled input
    searchInput,
    setSearchInput,

    // Filter data
    subjectAreas,
    subjectCategories,
    zones,
    loadingFilters,

    // Results
    journals,
    total,
    loadingJournals,
    error,

    // Active URL params
    search,
    page,
    limit,
    sort,
    selectedAreas,
    selectedCategories,
    selectedAccess,
    selectedQuartiles,
    selectedYear,
    selectedZone,
    isOaDiamond,

    // View mode
    viewMode,
    setViewMode,

    // Auth modal
    followedJournals,
    showAuthModal,
    setShowAuthModal,

    // Handlers
    handleSearchSubmit,
    searchForTag,
    handleQuartileToggle,
    handleAccessToggle,
    handleAreaToggle,
    handleCategoryToggle,
    onAreaSelect,
    onCategorySelect,
    onAccessSelect,
    onQuartileSelect,
    onYearSelect,
    onZoneSelect,
    handleOaDiamondToggle,
    handleClearAll,
    handleSortChange,
    handlePageChange,
    handleFollowJournal,
    fetchJournals,
  };
}
