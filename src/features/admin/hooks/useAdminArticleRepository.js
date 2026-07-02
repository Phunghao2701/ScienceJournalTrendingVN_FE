/**
 * useAdminArticleRepository: manages Article Repository page state -- article list, filters, pagination, and editor insights.
 *
 * File: src/features/admin/hooks/useAdminArticleRepository.js
 */
import { useEffect, useMemo, useState } from 'react';
import { JOURNAL_FILTER_OPTIONS, STATUS_FILTER_OPTIONS } from '../constants/articleListFilters';
import { getArticlesListApi } from '../../article/api/articleApi';

const PAGE_SIZE = 4;

const DEFAULT_FILTERS = {
  journal: JOURNAL_FILTER_OPTIONS[0],
  status: STATUS_FILTER_OPTIONS[0].value,
  submittedDate: '',
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

const normalizeArticle = (article) => {
  const authorName = article.lead_author || article.primary_author || article.author_name || article.authors?.[0]?.name || 'Chưa rõ tác giả';

  return {
    ...article,
    id: article.article_id || article.id,
    title: article.title || 'Untitled article',
    msId: article.manuscript_id || article.doi || `ART-${article.article_id || article.id || 'N/A'}`,
    pages: article.pages || article.page_count || '—',
    citations: article.citation_count || article.citations || article.semantic_citation_count || 0,
    leadAuthor: authorName,
    leadAuthorAvatar: article.lead_author_avatar || article.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=111827&color=ffffff&size=96`,
    journal: article.journal_name || article.journal_title || article.display_name || article.journal || '—',
    status: article.status || (article.is_deleted ? 'archived' : 'published'),
    submittedDate: formatDate(article.submitted_at || article.created_at || article.publication_date || article.publication_year),
  };
};

const buildInsights = (stats, totalItems) => ({
  performanceLabel: 'Live API',
  summary: 'Insight được tổng hợp từ dữ liệu bài báo hiện có trên backend thay vì mock data.',
  avgReviewTime: stats?.avg_review_time || 'N/A',
  avgReviewTrend: stats?.avg_review_trend || '—',
  acceptanceRate: stats?.acceptance_rate || (totalItems > 0 ? `${totalItems} articles` : 'N/A'),
  acceptanceTrend: stats?.acceptance_trend || 'Live total',
  activeReviewers: stats?.active_reviewers || 'N/A',
  reviewersTrend: stats?.reviewers_trend || '—',
});

export default function useAdminArticleRepository() {
  const [journalFilter, setJournalFilter] = useState(DEFAULT_FILTERS.journal);
  const [statusFilter, setStatusFilter] = useState(DEFAULT_FILTERS.status);
  const [submittedDateFilter, setSubmittedDateFilter] = useState(DEFAULT_FILTERS.submittedDate);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

  const [articles, setArticles] = useState([]);
  const [insights, setInsights] = useState(buildInsights(null, 0));
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let ignore = false;

    const fetchArticles = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getArticlesListApi({
          page: currentPage,
          limit: PAGE_SIZE,
          sortBy: 'created_at',
          sortOrder: 'desc',
        });

        if (ignore) return;

        const payload = response?.data?.data || {};
        const apiArticles = payload.items || payload.articles || [];
        const pagination = payload.pagination || {};
        const total = pagination.total ?? apiArticles.length;

        setArticles(apiArticles.map(normalizeArticle));
        setTotalItems(total);
        setTotalPages(Math.max(pagination.total_pages || Math.ceil(total / PAGE_SIZE), 1));
        setInsights(buildInsights(payload.stats, total));
      } catch (err) {
        if (ignore) return;
        setArticles([]);
        setTotalItems(0);
        setTotalPages(1);
        setError(err.response?.data?.message || 'Không thể tải danh sách article từ backend.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchArticles();

    return () => {
      ignore = true;
    };
  }, [currentPage]);

  const handleApplyFilters = () => {
    setAppliedFilters({
      journal: journalFilter,
      status: statusFilter,
      submittedDate: submittedDateFilter,
    });
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setJournalFilter(DEFAULT_FILTERS.journal);
    setStatusFilter(DEFAULT_FILTERS.status);
    setSubmittedDateFilter(DEFAULT_FILTERS.submittedDate);
    setAppliedFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  };

  const pageItems = useMemo(() => {
    return articles.filter((article) => {
      const matchJournal =
        appliedFilters.journal === JOURNAL_FILTER_OPTIONS[0] || article.journal === appliedFilters.journal;
      const matchStatus = appliedFilters.status === 'all' || article.status === appliedFilters.status;
      const matchDate = !appliedFilters.submittedDate || article.submittedDate === formatDate(appliedFilters.submittedDate);

      return matchJournal && matchStatus && matchDate;
    });
  }, [appliedFilters, articles]);

  const safePage = Math.min(currentPage, totalPages);
  const startIndex = totalItems === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min((safePage - 1) * PAGE_SIZE + pageItems.length, totalItems);

  return {
    journalFilter,
    statusFilter,
    submittedDateFilter,
    setJournalFilter,
    setStatusFilter,
    setSubmittedDateFilter,
    handleApplyFilters,
    handleClearFilters,
    pageItems,
    insights,
    totalItems,
    totalPages,
    loading,
    error,
    currentPage: safePage,
    setCurrentPage,
    startIndex,
    endIndex,
    pageSize: PAGE_SIZE,
  };
}
