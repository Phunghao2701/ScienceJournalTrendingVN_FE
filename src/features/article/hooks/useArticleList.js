/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\article\hooks\useArticleList.js
 */
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getArticlesListApi, getArticleDetailApi } from '../api/articleApi';
import { searchJournalsApi } from '../../journal/api/journalApi';
import keywordApi from '../../keywords/api/keywordApi';
import { getTopicsApi, getTopicArticlesApi } from '../../topic/api/topic.api';

/**
 * Gộp dữ liệu detail vào item list vì API /articles hiện chưa trả đủ count/volume/issue.
 */
const enrichArticleList = async (rawList) => Promise.all(rawList.map(async (item) => {
  if (!item.article_id) return item;

  try {
    const detailResponse = await getArticleDetailApi(item.article_id);
    const detailData = detailResponse.data?.data || detailResponse.data || {};
    return { ...item, ...detailData };
  } catch (detailErr) {
    console.warn('Failed to enrich article list item with detail metadata:', detailErr);
    return item;
  }
}));

const mapArticleListItem = (item) => ({
  article_id: item.article_id,
  version: item.version || null,
  issue_id: item.issue_id || null,
  title: item.title || '',
  abstract: item.abstract || null,
  publication_year: item.publication_year || null,
  doi: item.doi || null,
  primary_topic: item.topic_name
    || (item.primary_topic ? `Topic #${item.primary_topic}` : null),
  topic_id: item.primary_topic || null,
  journal_id: item.journal_id || null,
  journal_name: item.journal_name || null,
  journal_issn: item.journal_issn || null,
  publication_date: item.publication_date || item.published_date || null,
  volume_number: item.volume_number || item.volume || item.volume_id || null,
  issue_number: item.issue_number || item.issue || item.issue_id || null,
  pages: item.pages || item.page_range || item.article_pages || null,
  journal: item.journal_id
    ? { journal_id: item.journal_id, display_name: item.journal_name }
    : null,
  is_open_access: Boolean(item.is_open_access),
  semantic_citation_count: Number(
    item.semantic_citation_count ?? item.citation_count ?? item.citations ?? item.citations_count ?? item.cited_by_count ?? 0
  ),
  reference_count: Number(item.reference_count ?? 0),
  created_at: item.created_at || null,
  authors: item.authors || [],
});

/**
 * Hook quản lý trạng thái trang Article List.
 * Sync filter với URL query params để hỗ trợ back/forward và copy link.
 */
export default function useArticleList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // === Đọc state từ URL params ===
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

  // Stats hiển thị thẻ thống kê
  const [stats, setStats] = useState({
    totalArticles: 0,
    openAccessCount: 0,
    authorsCount: 0,
    topicsCount: 0,
  });

  // Auth modal không còn dùng để block xem, nhưng giữ cho backward compat
  const [showAuthModal, setShowAuthModal] = useState(false);

  /**
   * Gọi API lấy danh sách bài báo theo filter/pagination hiện tại.
   */
  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let journalIdToFilter = selectedJournal;
      let textSearch = search.trim();

      // Kiểm tra nếu search có định dạng ISSN (VD: "1859-3526", hoặc source.issn:"1859-3526")
      const issnMatch = textSearch.match(/(?:source\.issn:\s*")?(\d{4}-\d{3}[\dX]|\d{4}\s*-\s*\d{3}[\dX]|\d{8})(?:"\s*)?/i);
      if (issnMatch) {
        const issnVal = issnMatch[1].replace(/\s+/g, ''); // Loại bỏ khoảng trắng
        try {
          const journalRes = await searchJournalsApi({ search: issnVal });
          const journalList = journalRes?.data?.data?.items || [];
          if (journalList.length > 0) {
            const matchedJournal = journalList[0];
            journalIdToFilter = matchedJournal.journal_id || matchedJournal.id;
            textSearch = ''; // Xóa textSearch để không lọc theo text LIKE trong DB
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

      // Chỉ gửi params khi có giá trị hợp lệ
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

        // Backend giờ trả `articles` (hoặc `items` tùy path cũ), hỗ trợ cả hai
        let rawList = resData.articles || resData.items || [];
        let paginationData = resData.pagination || {};
        let totalCount = paginationData.total || rawList.length;

        // API /articles hiện chỉ search title/abstract/DOI. Nếu không có kết quả,
        // thử search theo keyword rồi lấy bài từ /keywords/:id/articles.
        if (rawList.length === 0 && textSearch) {
          try {
            const keywordResponse = await keywordApi.getKeywords({ search: textSearch, limit: 1 });
            const keywordList = keywordResponse.data?.data?.items
              || keywordResponse.data?.data
              || [];
            const matchedKeyword = Array.isArray(keywordList) ? keywordList[0] : null;

            if (matchedKeyword?.keyword_id) {
              const keywordArticlesResponse = await keywordApi.getArticlesByKeyword(matchedKeyword.keyword_id, {
                page,
                limit,
                sortBy,
                sortOrder,
              });
              const keywordArticlesData = keywordArticlesResponse.data?.data || {};
              rawList = Array.isArray(keywordArticlesData)
                ? keywordArticlesData
                : (keywordArticlesData.articles || keywordArticlesData.items || []);
              paginationData = keywordArticlesResponse.data?.pagination || keywordArticlesData.pagination || {};
              totalCount = paginationData.total || rawList.length;
            }
          } catch (keywordErr) {
            console.warn('Failed to fallback article search by keyword:', keywordErr);
          }

          if (rawList.length === 0) {
            try {
              const topicResponse = await getTopicsApi({ search: textSearch, limit: 1 });
              const topicList = topicResponse.data?.data?.items
                || topicResponse.data?.data
                || [];
              const matchedTopic = Array.isArray(topicList) ? topicList[0] : null;

              if (matchedTopic?.topic_id) {
                const topicArticlesResponse = await getTopicArticlesApi(matchedTopic.topic_id, {
                  page,
                  limit,
                  sortBy,
                  sortOrder,
                });
                const topicArticlesData = topicArticlesResponse.data?.data || {};
                rawList = Array.isArray(topicArticlesData)
                  ? topicArticlesData
                  : (topicArticlesData.articles || topicArticlesData.items || []);
                paginationData = topicArticlesData.pagination || topicArticlesResponse.data?.pagination || {};
                totalCount = paginationData.total || rawList.length;
              }
            } catch (topicErr) {
              console.warn('Failed to fallback article search by topic:', topicErr);
            }
          }
        }

        const enrichedList = await enrichArticleList(rawList);
        const mappedArticles = enrichedList.map(mapArticleListItem);

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

  // Fetch khi dependency thay đổi
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchArticles();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchArticles]);

  /**
   * Cập nhật URL query params khi filter thay đổi.
   * Các filter thay đổi sẽ reset page về 1.
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

  /** Xóa toàn bộ filter, quay về trang 1 */
  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  /** Chuyển trang giữ filter */
  const handlePageChange = useCallback((newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  /**
   * Click Chi tiết → navigate thẳng, không cần kiểm tra token
   * (Article List là public, guest được xem detail)
   */
  const handleDetailClick = useCallback((id) => {
    navigate(`/articles/${id}/visual`);
  }, [navigate]);

  /** Legacy: giữ để không break modal nếu dùng nơi khác */
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
