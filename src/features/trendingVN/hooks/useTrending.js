/**
 * Aggregator hook managing all data-fetch state for the TrendingVN page.
 *
 * File: src/features/trendingVN/hooks/useTrending.js
 *
 * Covers: trending articles (paginated, searchable), topics, journals (for chart),
 * author/university rankings, filter dropdown options, keywords, and stat card totals.
 * All API calls go through trending.api.js which uses httpClient (not api.js).
 *
 * Filter model: two-tier -- `draftFilters` (in-progress edits) vs `appliedFilters`
 * (values actually sent to the API). Apply is explicit via handleApplyFilters().
 *
 * NOTE: On initial mount, fetchArticles is called TWICE -- once in the
 * first useEffect (explicitly with DEFAULT_FILTERS) and once in the second useEffect
 * (which also runs on mount because appliedFilters and currentPage are at defaults).
 * This is a known double-fetch on startup.
 *
 * Consumed by: TrendingPage.jsx, TrendingVNPage.jsx.
 * Note: useTrendingFilters.js is a separate hook for FilterDrawer -- it uses
 * different API files (journal/api, topic/api) and React Query.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getArticlesApi,
  getTopicsApi,
  getJournalsApi,
  getTopJournalsTrendingApi,
  getTopUniversitiesTrendingApi,
  getUniversityRankingsApi,
  getAuthorRankingsApi,
  getTrendingArticlesApi,
  getTrendingKeywordsApi,
  getAuthorsLeaderboardApi,
  getSubjectAreasApi,
  getSubjectCategoriesApi,
  getKeywordsApi,
} from '../api/trending.api';

// --- Default filter values (also used by handleResetFilters) ---
const DEFAULT_FILTERS = {
  search: '',
  subject_area_id: '',
  subject_category_id: '',
  sortBy: 'created_at',
  sortOrder: 'desc',
};

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  total: 0,
  total_pages: 1,
};

export default function useTrending() {
  // --- State: Trending articles ---
  const [articles, setArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [articlesError, setArticlesError] = useState(null);
  const [articlesPagination, setArticlesPagination] = useState(DEFAULT_PAGINATION);

  // --- State: Featured research topics ---
  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [topicsError, setTopicsError] = useState(null);

  // --- State: Journals (used for Top Journals bar chart) ---
  const [journals, setJournals] = useState([]);
  const [journalsLoading, setJournalsLoading] = useState(false);
  const [journalsError, setJournalsError] = useState(null);

  // --- State: Author leaderboard ---
  const [authors, setAuthors] = useState([]);
  const [authorsLoading, setAuthorsLoading] = useState(false);
  const [authorsError, setAuthorsError] = useState(null);

  // --- State: Stat card totals ---
  const [stats, setStats] = useState({
    total_articles: 0,
    total_topics: 0,
    total_journals: 0,
    total_citations: null,   // needs a dedicated endpoint -- displayed as null until available
    highest_growth: null,    // needs a dedicated endpoint -- displayed as null until available
  });

  // --- State: Filter dropdown options ---
  const [subjectAreas, setSubjectAreas] = useState([]);
  const [subjectCategories, setSubjectCategories] = useState([]);
  const [filtersLoading, setFiltersLoading] = useState(false);

  // --- State: Keywords and universities ---
  const [keywords, setKeywords] = useState([]);
  const [universities, setUniversities] = useState([]);

  // --- State: Trending articles list (used for topics treemap) ---
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [trendingArticlesLoading, setTrendingArticlesLoading] = useState(false);

  // --- State: Two-tier filters (draft = editing, applied = sent to API) ---
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);

  // --- Fetch: Paginated article list ---
  const fetchArticles = useCallback(async (filters = {}, page = 1) => {
    setArticlesLoading(true);
    setArticlesError(null);
    try {
      const params = {
        page,
        limit: DEFAULT_PAGINATION.limit,
        sortBy: filters.sortBy || DEFAULT_FILTERS.sortBy,
        sortOrder: filters.sortOrder || DEFAULT_FILTERS.sortOrder,
      };
      if (filters.search) params.search = filters.search;

      const res = await getArticlesApi(params);
      const resData = res?.data?.data || {};

      setArticles(resData.items || []);

      const pagination = resData.pagination || {};
      setArticlesPagination({
        page: pagination.page || 1,
        limit: pagination.limit || DEFAULT_PAGINATION.limit,
        total: pagination.total || 0,
        total_pages: pagination.total_pages || 1,
      });

      setStats((prev) => ({
        ...prev,
        total_articles: pagination.total || 0,
      }));
    } catch (err) {
      console.error('Lỗi khi lấy danh sách bài báo:', err);
      setArticlesError('Không thể tải danh sách bài báo. Vui lòng thử lại.');
    } finally {
      setArticlesLoading(false);
    }
  }, []);

  // --- Fetch: Featured research topics ---
  const fetchTopics = useCallback(async (filters = {}) => {
    setTopicsLoading(true);
    setTopicsError(null);
    try {
      const params = {
        page: 1,
        limit: 20,
        sort_by: 'score',
        sort_order: 'desc',
      };
      if (filters.subject_area_id) params.subject_area_id = filters.subject_area_id;
      if (filters.subject_category_id) params.subject_category_id = filters.subject_category_id;

      const res = await getTopicsApi(params);
      const resData = res?.data?.data || {};

      // Topics API returns data.items + data.total directly (no pagination wrapper object).
      setTopics(resData.items || []);
      setStats((prev) => ({
        ...prev,
        total_topics: resData.total || 0,
      }));
    } catch (err) {
      console.error('Lỗi khi lấy danh sách chủ đề:', err);
      setTopicsError('Không thể tải danh sách chủ đề nghiên cứu.');
    } finally {
      setTopicsLoading(false);
    }
  }, []);

  // --- Fetch: Top journals by citation count (trending-vn endpoint) ---
  const fetchJournals = useCallback(async () => {
    setJournalsLoading(true);
    setJournalsError(null);
    try {
      const res = await getTopJournalsTrendingApi({ years: 2, limit: 7 });
      // BE returns: { success, data: { window: {...}, items: [...] } }
      const resData = res?.data?.data || res?.data || {};
      setJournals(resData.items || []);
    } catch (err) {
      console.error('Lỗi khi lấy top journals:', err);
      setJournalsError('Không thể tải danh sách tạp chí.');
    } finally {
      setJournalsLoading(false);
    }
  }, []);

  // --- Fetch: All-time author ranking (h_index + cited_by_count) ---
  // Endpoint: GET /api/v1/trending-vn/ranking/authors
  // Fields: author_id, display_name, last_known_institution,
  //         h_index, cited_by_count, works_count, local_articles_count
  const fetchAuthors = useCallback(async () => {
    setAuthorsLoading(true);
    setAuthorsError(null);
    try {
      const res = await getAuthorRankingsApi({ limit: 5 });
      const resData = res?.data?.data || res?.data || {};
      const items = resData.items || [];
      setAuthors(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Lỗi khi lấy bảng xếp hạng tác giả:', err);
      setAuthorsError('Không thể tải bảng xếp hạng tác giả.');
    } finally {
      setAuthorsLoading(false);
    }
  }, []);

  // --- Fetch: All-time university ranking (no year restriction) ---
  // Endpoint: GET /api/v1/trending-vn/ranking/universities
  // Joined directly: Article -> Author -> institution
  // Fields: institution_name, institution_id, total_citations, total_articles_count
  const fetchUniversities = useCallback(async () => {
    try {
      const res = await getUniversityRankingsApi({ limit: 6 });
      const resData = res?.data?.data || res?.data || {};
      const items = resData.items || [];

      const uniList = items.map((u, i) => {
        const words = (u.institution_name || '').split(' ').filter(Boolean);
        const shortName = words.length > 1
          ? words.map((w) => w[0]).join('').substring(0, 5).toUpperCase()
          : (u.institution_name || '').substring(0, 4).toUpperCase();

        const cites = u.total_citations || 0;
        return {
          id: u.institution_id || i + 1,
          name: u.institution_name || '',
          shortName,
          papers: u.total_articles_count || 0,
          cites: cites >= 1000
            ? (cites / 1000).toFixed(1) + 'K'
            : String(cites),
        };
      });
      setUniversities(uniList);
    } catch (err) {
      console.error('Lỗi khi lấy top universities:', err);
    }
  }, []);

  // --- Fetch: Trending keywords (hot topics + article_count + citations) ---
  // Primary endpoint: GET /api/v1/trending-vn/trending/keywords
  // Fields: keyword_id, display_name, article_count, total_citations
  // Fallback: GET /api/v1/keywords if the trending endpoint returns empty items
  const fetchKeywords = useCallback(async () => {
    try {
      const res = await getTrendingKeywordsApi({ limit: 7, hot_limit: 10 });
      const resData = res?.data?.data || res?.data || {};
      const items = resData.items || [];
      if (items.length > 0) {
        setKeywords(items);
        return;
      }
      // Force fallback if trending endpoint returns no items.
      throw new Error('empty');
    } catch {
      try {
        const res = await getKeywordsApi({ limit: 7, sort_by: 'article_count', sort_order: 'desc' });
        const resData = res?.data?.data || [];
        setKeywords(Array.isArray(resData) ? resData : (resData.items || []));
      } catch (err) {
        console.error('Lỗi khi lấy từ khóa:', err);
      }
    }
  }, []);

  // --- Fetch: Trending articles for the topics treemap ---
  // Endpoint: GET /api/v1/trending-vn/trending/articles
  // trending_score formula: citation*3 + keyword_match*2 + topic_match*2
  //                         + citing_works*2 + references*0.5
  // Fields: article_id, title, citation_count, trending_score, journal_name
  const fetchTrendingArticles = useCallback(async () => {
    setTrendingArticlesLoading(true);
    try {
      const res = await getTrendingArticlesApi({ years: 2, limit: 6, hot_limit: 10 });
      const resData = res?.data?.data || res?.data || {};
      setTrendingArticles(resData.items || []);
    } catch (err) {
      console.error('Lỗi khi lấy trending articles:', err);
    } finally {
      setTrendingArticlesLoading(false);
    }
  }, []);

  // --- Fetch: Filter dropdown options (subject areas + categories) ---
  const fetchFilterOptions = useCallback(async () => {
    setFiltersLoading(true);
    try {
      const [areasRes, categoriesRes] = await Promise.all([
        getSubjectAreasApi(),
        getSubjectCategoriesApi({ limit: 100 }),
      ]);

      // Subject Areas API returns data as a direct array (not wrapped in items).
      const areasData = areasRes?.data?.data || [];
      const categoriesData = categoriesRes?.data?.data || {};

      setSubjectAreas(Array.isArray(areasData) ? areasData : (areasData.items || []));
      setSubjectCategories(categoriesData.items || []);
    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu bộ lọc:', err);
    } finally {
      setFiltersLoading(false);
    }
  }, []);

  // --- Effect: Initial data load on mount ---
  // NOTE: fetchArticles is also called by the second effect below (appliedFilters/currentPage deps),
  // so articles are fetched twice on the first render. See file header for details.
  useEffect(() => {
    fetchFilterOptions();
    fetchTopics();
    fetchJournals();
    fetchAuthors();
    fetchUniversities();
    fetchKeywords();
    fetchTrendingArticles();
    fetchArticles(DEFAULT_FILTERS, 1);
  }, [fetchFilterOptions, fetchTopics, fetchJournals, fetchAuthors, fetchUniversities, fetchKeywords, fetchTrendingArticles, fetchArticles]);

  // --- Effect: Refetch articles when appliedFilters or currentPage changes ---
  useEffect(() => {
    fetchArticles(appliedFilters, currentPage);
  }, [appliedFilters, currentPage, fetchArticles]);

  // --- Handler: Update a single draft filter key ---
  const handleDraftFilterChange = useCallback((key, value) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  // --- Handler: Promote draft filters to applied and reset to page 1 ---
  const handleApplyFilters = useCallback(() => {
    setCurrentPage(1);
    setAppliedFilters({ ...draftFilters });
  }, [draftFilters]);

  // --- Handler: Reset both draft and applied filters to defaults ---
  const handleResetFilters = useCallback(() => {
    setDraftFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  }, []);

  // --- Handler: Navigate to a different article page and scroll to top ---
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // --- Handler: Change sort field/order and apply immediately (bypasses draft) ---
  const handleSortChange = useCallback((sortBy, sortOrder = 'desc') => {
    setAppliedFilters((prev) => ({ ...prev, sortBy, sortOrder }));
    setDraftFilters((prev) => ({ ...prev, sortBy, sortOrder }));
    setCurrentPage(1);
  }, []);

  return {
    // Articles
    articles,
    articlesLoading,
    articlesError,
    articlesPagination,

    // Topics
    topics,
    topicsLoading,
    topicsError,

    // Journals
    journals,
    journalsLoading,
    journalsError,

    // Authors and universities
    authors,
    authorsLoading,
    authorsError,
    universities,

    // Keywords
    keywords,

    // Trending articles for treemap
    trendingArticles,
    trendingArticlesLoading,

    // Stat cards
    stats,

    // Filter dropdown options
    subjectAreas,
    subjectCategories,
    filtersLoading,

    // Active filters and pagination
    draftFilters,
    appliedFilters,
    currentPage,

    // Handlers
    handleDraftFilterChange,
    handleApplyFilters,
    handleResetFilters,
    handlePageChange,
    handleSortChange,
  };
}