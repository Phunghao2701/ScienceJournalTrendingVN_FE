/**
 * useArticleList: manages ArticleListPage state, syncs filters with URL query params for shareable links and browser history.
 *
 * File: src/features/article/hooks/useArticleList.js
 */
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getArticlesListApi } from '../api/articleApi';
import { searchJournalsApi } from '../../journal/api/journalApi';

export default function useArticleList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read initial filter state from URL query params
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const sortBy = searchParams.get('sortBy') || 'created_at';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const selectedYear = searchParams.get('year') || 'all';
  const selectedJournal = searchParams.get('journal') || searchParams.get('journal_id') || 'all';
  const selectedTopic = searchParams.get('topic') || 'all';
  const selectedAccess = searchParams.get('access') || 'all';
  const selectedVolume = searchParams.get('volume_id') || '';
  const selectedIssue = searchParams.get('issue_id') || '';

  // === Data state ===
  const [articles, setArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stats shown in the four summary cards
  const [stats, setStats] = useState({
    totalArticles: 0,
    openAccessCount: 0,
    authorsCount: 0,
    topicsCount: 0,
  });

  // Auth modal kept for backward compatibility; no longer blocks article viewing
  const [showAuthModal, setShowAuthModal] = useState(false);

  /**
   * Fetch articles matching the current filters and pagination state.
   */
  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let journalIdToFilter = selectedJournal;
      let textSearch = search.trim();

      // Detect ISSN pattern in search input and resolve to journal_id (e.g. "1859-3526" or source.issn:"1859-3526")
      const issnMatch = textSearch.match(/(?:source\.issn:\s*")?(\d{4}-\d{3}[\dX]|\d{4}\s*-\s*\d{3}[\dX]|\d{8})(?:"\s*)?/i);
      if (issnMatch) {
        const issnVal = issnMatch[1].replace(/\s+/g, ''); // Strip whitespace from ISSN
        try {
          const journalRes = await searchJournalsApi({ search: issnVal });
          const journalList = journalRes?.data?.data?.items || [];
          if (journalList.length > 0) {
            const matchedJournal = journalList[0];
            journalIdToFilter = matchedJournal.journal_id || matchedJournal.id;
            textSearch = ''; // Clear text search so DB does not also run a LIKE filter
          }
        } catch (err) {
          console.warn("Failed to lookup journal by ISSN in fetchArticles:", err);
        }
      }

      const apiParams = {
        page,
        limit,
        sortBy,
        sortOrder,
      };

      // Only include params with non-empty valid values
      if (textSearch) apiParams.search = textSearch;
      if (selectedYear && selectedYear !== 'all') apiParams.publication_year = selectedYear;
      if (journalIdToFilter && journalIdToFilter !== 'all') apiParams.journal_id = journalIdToFilter;
      if (selectedTopic && selectedTopic !== 'all') apiParams.topic_id = selectedTopic;
      if (selectedAccess && selectedAccess !== 'all') apiParams.access = selectedAccess;
      if (selectedVolume) apiParams.volume_id = selectedVolume;
      if (selectedIssue) apiParams.issue_id = selectedIssue;

      const response = await getArticlesListApi(apiParams);

      if (response?.data?.success) {
        const resData = response.data.data || {};

        // Support both 'articles' and 'items' field names from the backend
        const rawList = resData.articles || resData.items || [];
        const paginationData = resData.pagination || {};
        const totalCount = paginationData.total || rawList.length;

        // Normalize to a consistent FE shape; no extra hardcoding
        const mappedArticles = rawList.map((item) => ({
          article_id: item.article_id,
          version: item.version || null,
          issue_id: item.issue_id || null,
          title: item.title || '',
          abstract: item.abstract || null,
          publication_year: item.publication_year || null,
          doi: item.doi || null,
          // Topic: prefer topic_name from JOIN result, fallback to 'Topic #ID'
          primary_topic: item.topic_name
            || (item.primary_topic ? `Topic #${item.primary_topic}` : null),
          topic_id: item.primary_topic || null,
          // Journal: map from flat fields returned by enriched-service endpoint
          journal_id: item.journal_id || null,
          journal_name: item.journal_name || null,
          journal_issn: item.journal_issn || null,
          // Backward compat: old components access article.journal.display_name
          journal: item.journal_id
            ? { journal_id: item.journal_id, display_name: item.journal_name }
            : null,
          is_open_access: Boolean(item.is_open_access),
          semantic_citation_count: item.semantic_citation_count !== undefined ? Number(item.semantic_citation_count) : null,
          created_at: item.created_at || null,
          authors: item.authors || [],
        }));

        setArticles(mappedArticles);
        setTotal(totalCount);

        const apiStats = resData.stats || null;
        setStats({
          totalArticles: Number(apiStats?.totalArticles ?? totalCount),
          openAccessCount: Number(apiStats?.openAccessCount ?? mappedArticles.filter((a) => a.is_open_access).length),
          authorsCount: Number(apiStats?.authorsCount ?? 0),
          topicsCount: Number(
            apiStats?.topicsCount ?? new Set(mappedArticles.map((a) => a.topic_id).filter(Boolean)).size
          ),
        });
      } else {
        throw new Error(response?.data?.message || 'Không thể tải danh sách bài báo');
      }
    } catch (err) {
      console.error('Lỗi khi gọi API articles:', err);
      setError(err.response?.data?.message || err.message || 'Đã xảy ra lỗi');
      setArticles([]);
      setTotal(0);
      setStats({ totalArticles: 0, openAccessCount: 0, authorsCount: 0, topicsCount: 0 });
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder, selectedYear, selectedJournal, selectedTopic, selectedAccess, selectedVolume, selectedIssue]);

  // Re-fetch whenever any filter or pagination dependency changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchArticles();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchArticles]);

  /**
   * Update URL query params when filters change; filter changes reset page to 1.
   */
  const updateFilters = useCallback((newFilters) => {
    const params = new URLSearchParams(searchParams);
    const filterKeys = ['search', 'year', 'journal', 'topic', 'access'];
    const hasFilterChange = Object.keys(newFilters).some((k) => filterKeys.includes(k));

    if (hasFilterChange) {
      params.set('page', '1');
    }

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === null || value === undefined || value === 'all' || value === '') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  /** Clear all active filters and reset to page 1. */
  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  /** Change page while keeping current filters. */
  const handlePageChange = useCallback((newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  /**
   * Navigate directly to the article visual detail page.
   * No auth check needed -- article detail is publicly accessible.
   */
  const handleDetailClick = useCallback((id) => {
    navigate(`/articles/${id}/visual`);
  }, [navigate]);

  /** Legacy: kept to avoid breaking any remaining auth-modal reference. */
  const handleAuthRedirect = useCallback(() => {
    setShowAuthModal(false);
    navigate('/login');
  }, [navigate]);

  return {
    articles,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    currentPage: page,
    isLoading,
    error,
    stats,
    filters: {
      search,
      page,
      limit,
      sortBy,
      sortOrder,
      selectedYear,
      selectedJournal,
      selectedTopic,
      selectedAccess,
      selectedVolume,
      selectedIssue,
    },
    updateFilters,
    clearFilters,
    refetch: fetchArticles,
    handlePageChange,
    handleDetailClick,
    showAuthModal,
    setShowAuthModal,
    handleAuthRedirect,
  };
}
