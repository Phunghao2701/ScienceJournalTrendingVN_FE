/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\article\hooks\useArticleList.js
 */
import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getArticlesListApi } from '../api/articleApi';
import { searchJournalsApi } from '../../journal/api/journalApi';
import {
  buildPaperVnDiscoveryParams,
  buildPaperVnQueryFilters,
} from '../utils/paperVnDiscoveryParams';
import {
  getTrendingViewFromParams,
  buildClearedTrendingSearchParams,
  buildFilterUpdateSearchParams,
} from '../../trendingVN/utils/trendingViewParams';

const normalizeArticleText = (value) => String(value || '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const mapArticleListItem = (item) => ({
  article_id: item.article_id,
  version: item.version || null,
  issue_id: item.issue_id || null,
  title: item.title || 'Untitled Article',
  title_plain: normalizeArticleText(item.title) || 'Untitled Article',
  abstract: normalizeArticleText(item.abstract) || null,
  publication_year: item.publication_year || null,
  doi: item.doi || null,
  keywords: item.keywords || item.article_keywords || [],
  primary_topic: item.topic_name
    || (item.primary_topic ? `Topic #${item.primary_topic}` : null),
  topic_id: item.primary_topic || item.topic_id || null,
  journal_id: item.journal_id || null,
  journal_name: item.journal_name || null,
  journal_issn: item.journal_issn || null,
  publisher_id: item.publisher_id || null,
  publisher_name: item.publisher_name || null,
  publication_date: item.publication_date || item.published_date || null,
  volume_number: item.volume_number || item.volume || item.volume_id || null,
  issue_number: item.issue_number || item.issue || item.issue_id || null,
  pages: item.pages || item.page_range || item.article_pages || null,
  journal: item.journal_id
    ? { journal_id: item.journal_id, display_name: item.journal_name }
    : null,
  is_open_access: Boolean(item.is_open_access),
  citation_count: Number(
    item.citation_count ?? item.semantic_citation_count ?? item.citations ?? item.citations_count ?? item.cited_by_count ?? 0
  ),
  semantic_citation_count: Number(
    item.citation_count ?? item.semantic_citation_count ?? item.citations ?? item.citations_count ?? item.cited_by_count ?? 0
  ),
  reference_count: Number(item.reference_count ?? 0),
  created_at: item.created_at || null,
  authors: item.authors || [],
});

const resolveIssnJournalFilter = async ({ search, selectedJournal }) => {
  let journalIdToFilter = selectedJournal;
  let textSearch = search.trim();

  const issnMatch = textSearch.match(/(?:source\.issn:\s*")?(\d{4}-\d{3}[\dX]|\d{4}\s*-\s*\d{3}[\dX]|\d{8})(?:"\s*)?/i);
  if (!issnMatch) {
    return { journalIdToFilter, textSearch };
  }

  const issnVal = issnMatch[1].replace(/\s+/g, '');
  try {
    const journalRes = await searchJournalsApi({ search: issnVal });
    const journalList = journalRes?.data?.data?.items || [];
    if (journalList.length > 0) {
      const matchedJournal = journalList[0];
      journalIdToFilter = matchedJournal.journal_id || matchedJournal.id;
      textSearch = '';
    }
  } catch (err) {
    console.warn('Failed to lookup journal by ISSN in fetchArticles:', err);
  }

  return { journalIdToFilter, textSearch };
};

/**
 * Hook quản lý trạng thái trang Article List.
 * Sync filter với URL query params để hỗ trợ back/forward và copy link.
 */
export default function useArticleList({ enabled = true } = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const filters = useMemo(() => buildPaperVnQueryFilters(searchParams), [searchParams]);

  const articleQuery = useQuery({
    queryKey: ['paper-vn-articles', filters],
    enabled,
    placeholderData: (previousData) => previousData,
    queryFn: async () => {
      const { journalIdToFilter, textSearch } = await resolveIssnJournalFilter({
        search: filters.search,
        selectedJournal: filters.selectedJournal,
      });

      const apiParams = buildPaperVnDiscoveryParams({
        ...filters,
        search: textSearch,
        selectedJournal: journalIdToFilter,
      });

      const response = await getArticlesListApi(apiParams);

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || 'Unable to load articles');
      }

      const resData = response.data.data || {};
      const rawList = resData.articles || resData.items || [];
      const paginationData = resData.pagination || {};
      const totalCount = paginationData.total || rawList.length;

      const mappedArticles = rawList.map(mapArticleListItem);
      const apiStats = resData.stats || null;

      return {
        articles: mappedArticles,
        total: totalCount,
        stats: {
          totalArticles: Number(apiStats?.totalArticles ?? totalCount),
          openAccessCount: Number(apiStats?.openAccessCount ?? mappedArticles.filter((a) => a.is_open_access).length),
          authorsCount: Number(apiStats?.authorsCount ?? 0),
          topicsCount: Number(
            apiStats?.topicsCount ?? new Set(mappedArticles.map((a) => a.topic_id).filter(Boolean)).size
          ),
        },
      };
    },
  });

  const articles = articleQuery.data?.articles || [];
  const total = articleQuery.data?.total || 0;
  const stats = articleQuery.data?.stats || {
    totalArticles: 0,
    openAccessCount: 0,
    authorsCount: 0,
    topicsCount: 0,
  };

  const updateFilters = useCallback((newFilters) => {
    const viewMode = getTrendingViewFromParams(searchParams);
    setSearchParams(buildFilterUpdateSearchParams(searchParams, newFilters, viewMode));
  }, [searchParams, setSearchParams]);

  const clearFilters = useCallback(() => {
    const viewMode = getTrendingViewFromParams(searchParams);
    setSearchParams(buildClearedTrendingSearchParams(viewMode));
  }, [searchParams, setSearchParams]);

  const handlePageChange = useCallback((newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const handleDetailClick = useCallback((id) => {
    navigate(`/articles/${id}/visual`);
  }, [navigate]);

  const handleAuthRedirect = useCallback(() => {
    setShowAuthModal(false);
    navigate('/login');
  }, [navigate]);

  return {
    articles,
    total,
    totalPages: Math.max(1, Math.ceil(total / filters.limit)),
    currentPage: filters.page,
    isLoading: articleQuery.isLoading,
    isFetching: articleQuery.isFetching,
    error: articleQuery.error
      ? (articleQuery.error.response?.data?.message || articleQuery.error.message || 'An error occurred')
      : null,
    stats,
    filters,
    updateFilters,
    clearFilters,
    refetch: articleQuery.refetch,
    handlePageChange,
    handleDetailClick,
    showAuthModal,
    setShowAuthModal,
    handleAuthRedirect,
  };
}
