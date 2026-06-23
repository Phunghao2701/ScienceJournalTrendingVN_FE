/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\article\hooks\useArticleList.js
 */
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getArticlesListApi } from '../api/articleApi';

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
      const apiParams = {
        page,
        limit,
        sortBy,
        sortOrder,
      };

      // Chỉ gửi params khi có giá trị hợp lệ
      if (search.trim()) apiParams.search = search.trim();
      if (selectedYear && selectedYear !== 'all') apiParams.publication_year = selectedYear;
      if (selectedJournal && selectedJournal !== 'all') apiParams.journal_id = selectedJournal;
      if (selectedTopic && selectedTopic !== 'all') apiParams.topic_id = selectedTopic;
      if (selectedAccess && selectedAccess !== 'all') apiParams.access = selectedAccess;
      if (selectedVolume) apiParams.volume_id = selectedVolume;
      if (selectedIssue) apiParams.issue_id = selectedIssue;

      const response = await getArticlesListApi(apiParams);

      if (response?.data?.success) {
        const resData = response.data.data || {};

        // Backend giờ trả `articles` (hoặc `items` tùy path cũ), hỗ trợ cả hai
        const rawList = resData.articles || resData.items || [];
        const paginationData = resData.pagination || {};
        const totalCount = paginationData.total || rawList.length;

        // Map sang shape chuẩn cho FE: không hardcode gì thêm
        const mappedArticles = rawList.map((item) => ({
          article_id: item.article_id,
          version: item.version || null,
          issue_id: item.issue_id || null,
          title: item.title || '',
          abstract: item.abstract || null,
          publication_year: item.publication_year || null,
          doi: item.doi || null,
          // Topic: ưu tiên topic_name (từ JOIN), fallback hiển thị `Topic #ID`
          primary_topic: item.topic_name
            || (item.primary_topic ? `Topic #${item.primary_topic}` : null),
          topic_id: item.primary_topic || null,
          // Journal: map từ flat fields trả về bởi enriched service
          journal_id: item.journal_id || null,
          journal_name: item.journal_name || null,
          journal_issn: item.journal_issn || null,
          // Tương thích với component cũ đang dùng article.journal.display_name
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
