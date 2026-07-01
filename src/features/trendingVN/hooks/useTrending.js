/**
 * File: src/features/trendingVN/hooks/useTrending.js
 *
 * Custom hook quản lý toàn bộ state và logic fetch dữ liệu
 * cho trang Theo dõi Xu hướng Nghiên cứu (TrendingVN).
 *
 * Bao gồm:
 * - Danh sách bài báo xu hướng (có phân trang, tìm kiếm, sắp xếp)
 * - Danh sách chủ đề nổi bật (Topics)
 * - Danh sách tạp chí (Journals) cho chart và dropdown
 * - Bảng xếp hạng tác giả (Authors Leaderboard)
 * - Dữ liệu dropdown bộ lọc (Subject Areas, Subject Categories)
 * - Stat cards tổng quan
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getArticlesApi,
  getTopicsApi,
  getTopJournalsTrendingApi,
  getUniversityRankingsApi,
  getAuthorRankingsApi,
  getTrendingArticlesApi,
  getTrendingKeywordsApi,
  getSubjectAreasApi,
  getSubjectCategoriesApi,
  getKeywordsApi,
} from '../api/trending.api';

// ─── Giá trị mặc định cho bộ lọc ──────────────────────────────────────────
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
  // ─── State: Bài báo xu hướng ─────────────────────────────────────────────
  const [articles, setArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [articlesError, setArticlesError] = useState(null);
  const [articlesPagination, setArticlesPagination] = useState(DEFAULT_PAGINATION);

  // ─── State: Chủ đề nghiên cứu nổi bật ───────────────────────────────────
  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [topicsError, setTopicsError] = useState(null);

  // ─── State: Tạp chí (dùng cho bar chart Top Journals) ───────────────────
  const [journals, setJournals] = useState([]);
  const [journalsLoading, setJournalsLoading] = useState(false);
  const [journalsError, setJournalsError] = useState(null);

  // ─── State: Bảng xếp hạng tác giả ───────────────────────────────────────
  const [authors, setAuthors] = useState([]);
  const [authorsLoading, setAuthorsLoading] = useState(false);
  const [authorsError, setAuthorsError] = useState(null);

  // ─── State: Stat Cards ───────────────────────────────────────────────────
  const [stats, setStats] = useState({
    total_articles: 0,
    total_topics: 0,
    total_journals: 0,
    total_citations: null,   // can API rieng — hien thi null neu chua co
    highest_growth: null,    // can API rieng — hien thi null neu chua co
  });

  // ─── State: Dropdown bộ lọc ──────────────────────────────────────────────
  const [subjectAreas, setSubjectAreas] = useState([]);
  const [subjectCategories, setSubjectCategories] = useState([]);
  const [filtersLoading, setFiltersLoading] = useState(false);

  // ─── State: Keywords & Universities ──────────────────────────────────────
  const [keywords, setKeywords] = useState([]);
  const [universities, setUniversities] = useState([]);

  // ─── State: Trending Articles (dung cho treemap) ─────────────────────────
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [trendingArticlesLoading, setTrendingArticlesLoading] = useState(false);

  // ─── State: Bộ lọc draft vs applied ─────────────────────────────────────
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);

  // ─── Fetch: Danh sách bài báo ─────────────────────────────────────────────
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
      const rawArticles = resData.articles || resData.items || [];

      setArticles(Array.isArray(rawArticles) ? rawArticles : []);

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

  // ─── Fetch: Danh sách chủ đề nổi bật ────────────────────────────────────
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

      // Topics API trả về data.items và data.total (không có pagination object)
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

  // ─── Fetch: Danh sách tạp chí ────────────────────────────────────────────
  // ─── Fetch: Top Journals theo trich dan (trending-vn endpoint) ──────────
  const fetchJournals = useCallback(async () => {
    setJournalsLoading(true);
    setJournalsError(null);
    try {
      const res = await getTopJournalsTrendingApi({ years: 2, limit: 7 });
      // BE tra ve: { success, data: { window: {...}, items: [...] } }
      const resData = res?.data?.data || res?.data || {};
      setJournals(resData.items || []);
    } catch (err) {
      console.error('Lỗi khi lấy top journals:', err);
      setJournalsError('Không thể tải danh sách tạp chí.');
    } finally {
      setJournalsLoading(false);
    }
  }, []);

  // ─── Fetch: Bảng xếp hạng tác giả ───────────────────────────────────────
  // Endpoint: GET /api/v1/trending-vn/ranking/authors
  // Xep hang theo h_index + cited_by_count toan bo lich su
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

  // ─── Fetch: Top Universities theo ranking toan bo lich su ────────────────
  // Endpoint: GET /api/v1/trending-vn/ranking/universities
  // Khong gioi han nam, join truc tiep Article → Author → institution
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

  // ─── Fetch: Keywords theo trending (topic hot + article_count + citations) ─
  // Endpoint: GET /api/v1/trending-vn/trending/keywords
  // Fields: keyword_id, display_name, article_count, total_citations
  // Fallback: GET /api/v1/keywords neu endpoint moi chua co
  const fetchKeywords = useCallback(async () => {
    try {
      const res = await getTrendingKeywordsApi({ limit: 7, hot_limit: 10 });
      const resData = res?.data?.data || res?.data || {};
      const items = resData.items || [];
      if (items.length > 0) {
        setKeywords(items);
        return;
      }
      // Fallback neu items rong
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

  // ─── Fetch: Trending Articles cho treemap ────────────────────────────────
  // Endpoint: GET /api/v1/trending-vn/trending/articles
  // Xep hang theo trending_score = citation*3 + keyword_match*2 + topic_match*2
  //                               + citing_works*2 + references*0.5
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

  // ─── Fetch: Dropdown bộ lọc ──────────────────────────────────────────────
  const fetchFilterOptions = useCallback(async () => {
    setFiltersLoading(true);
    try {
      const [areasRes, categoriesRes] = await Promise.all([
        getSubjectAreasApi(),
        getSubjectCategoriesApi({ limit: 100 }),
      ]);

      // Subject Areas API trả về data là array trực tiếp
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

  // ─── Effect: Load dữ liệu lần đầu khi mount ──────────────────────────────
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

  // ─── Effect: Refetch articles khi appliedFilters hoặc currentPage thay đổi
  useEffect(() => {
    fetchArticles(appliedFilters, currentPage);
  }, [appliedFilters, currentPage, fetchArticles]);

  // ─── Handler: Cập nhật draft filter ──────────────────────────────────────
  const handleDraftFilterChange = useCallback((key, value) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ─── Handler: Áp dụng bộ lọc ─────────────────────────────────────────────
  const handleApplyFilters = useCallback(() => {
    setCurrentPage(1);
    setAppliedFilters({ ...draftFilters });
  }, [draftFilters]);

  // ─── Handler: Reset bộ lọc ───────────────────────────────────────────────
  const handleResetFilters = useCallback(() => {
    setDraftFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  }, []);

  // ─── Handler: Chuyển trang bài báo ───────────────────────────────────────
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ─── Handler: Thay đổi sắp xếp ───────────────────────────────────────────
  const handleSortChange = useCallback((sortBy, sortOrder = 'desc') => {
    setAppliedFilters((prev) => ({ ...prev, sortBy, sortOrder }));
    setDraftFilters((prev) => ({ ...prev, sortBy, sortOrder }));
    setCurrentPage(1);
  }, []);

  return {
    // Bài báo
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

    // Authors & Universities
    authors,
    authorsLoading,
    authorsError,
    universities,

    // Keywords
    keywords,

    // Trending Articles (cho treemap)
    trendingArticles,
    trendingArticlesLoading,

    // Stat cards
    stats,

    // Dropdown options
    subjectAreas,
    subjectCategories,
    filtersLoading,

    // Bộ lọc
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
