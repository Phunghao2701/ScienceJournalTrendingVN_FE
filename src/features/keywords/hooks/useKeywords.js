/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\keywords\hooks\useKeywords.js
 */
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useKeywordFilterStore } from '../store/keywordFilterStore';
import keywordApi from '../api/keywordApi';
import { normalizeKeywordListResponse } from '../services/keywordService';

/**
 * Hook quản lý dữ liệu trang danh sách Keywords.
 * Đồng bộ filter/sort/pagination với Zustand store và URL query params.
 *
 * fetchKeywords đọc state live từ Zustand getState() tránh stale closure
 * khi store vừa hydrate xong từ URL params cùng render cycle.
 */
export function useKeywords() {
  const [searchParams, setSearchParams] = useSearchParams();
  const store = useKeywordFilterStore();
  const [keywords, setKeywords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, total_pages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  const syncUrl = useCallback((currentState) => {
    const params = new URLSearchParams();
    if (currentState.keyword) params.set('keyword', currentState.keyword);
    params.set('page', String(currentState.page));
    params.set('limit', String(currentState.limit));
    params.set('sortBy', currentState.sortBy);
    params.set('sortOrder', currentState.sortOrder);
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  /**
   * Fetch luôn đọc live state từ Zustand getState() để tránh stale closure.
   */
  const fetchKeywords = useCallback(async () => {
    // Lấy fresh state thay vì đọc từ closure
    const s = useKeywordFilterStore.getState();
    setLoading(true);
    setError(null);

    try {
      const response = await keywordApi.getKeywords({
        keyword: s.keyword || undefined,
        page: s.page,
        limit: s.limit,
        sortBy: s.sortBy,
        sortOrder: s.sortOrder,
      });
      const normalized = normalizeKeywordListResponse(response, s.limit);
      setKeywords(normalized.items);
      setPagination(normalized.pagination);
      syncUrl(s);
    } catch (err) {
      console.error('API error fetching keywords:', err);
      setError(err.response?.data?.message || err.message || 'Không thể tải danh sách keywords.');
      setKeywords([]);
      setPagination({ page: s.page, limit: s.limit, total: 0, total_pages: 1 });
      syncUrl(s);
    } finally {
      setLoading(false);
    }
  }, [syncUrl]);

  /**
   * Hydrate store từ URL params một lần khi mount.
   * Zustand set() là sync — sau khi set xong mới đánh dấu hydrated.
   */
  useEffect(() => {
    const keyword = searchParams.get('keyword') || '';
    const page   = Number(searchParams.get('page')  || 1);
    const limit  = Number(searchParams.get('limit') || 20);
    const sortBy    = searchParams.get('sortBy')    || 'article_count';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Ghi thẳng vào store (sync), không quan tâm tới giá trị cũ
    useKeywordFilterStore.setState({ keyword, page, limit, sortBy, sortOrder });
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch sau khi hydration xong
  useEffect(() => {
    if (!hydrated) return;
    fetchKeywords();
  }, [fetchKeywords, hydrated]);

  // Re-fetch khi store thay đổi (user tương tác: search, sort, page)
  useEffect(() => {
    if (!hydrated) return;
    fetchKeywords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.keyword, store.page, store.sortBy, store.sortOrder, store.limit]);

  return {
    keywords,
    pagination,
    loading,
    error,
    filters: {
      keyword: store.keyword,
      page: store.page,
      limit: store.limit,
      sortBy: store.sortBy,
      sortOrder: store.sortOrder,
      viewMode: store.viewMode,
    },
    actions: {
      setKeyword: store.setKeyword,
      setPage: store.setPage,
      setLimit: store.setLimit,
      setSort: store.setSort,
      setViewMode: store.setViewMode,
      clearFilters: store.clearFilters,
      refetch: fetchKeywords,
    },
  };
}
