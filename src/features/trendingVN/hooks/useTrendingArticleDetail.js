import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getArticleDetailApi,
  getArticlesListApi,
  getArticleCitingWorksApi,
  getArticleCitingWorksAnalyticsApi,
  getArticleReferencesApi,
} from '../../article/api/articleApi';
import useBookmark from '../../bookmark/hooks/useBookmark';
import { normalizeArticleDetail } from '../../article/utils/articleFormatters';
import { PAPER_VN_SCOPE } from '../../article/utils/paperVnDiscoveryParams';

export const useTrendingArticleDetail = (id, currentUser) => {
  const [searchQuery, setSearchQuery] = useState('');
  const {
    isBookmarked,
    isBookmarkLoading,
    toggleBookmark,
  } = useBookmark(id);

  // 1. Article detail query
  const { data: article, isLoading, error, refetch } = useQuery({
    queryKey: ['trendingVN', 'articleDetail', id],
    queryFn: async () => {
      const response = await getArticleDetailApi(id);
      if (response.data && response.data.success !== false) {
        const apiData = response.data.data || {};
        const parsedArticle = normalizeArticleDetail(apiData, id);
        return { apiData, parsedArticle };
      }
      throw new Error('Unable to load article details.');
    },
    staleTime: 1000 * 60 * 5,
  });

  // 2. Related data queries depend on the article topic ID.
  // The API returns primary_topic as a topic_id string rather than an object.
  // Fallback: use topic_id from the first topics array item.
  const rawTopicId =
    article?.parsedArticle?.primary_topic ||
    article?.parsedArticle?.topics?.[0]?.topic_id;
  const topicId = Number(rawTopicId);
  const isTopicValid = Number.isFinite(topicId) && topicId > 0;

  const {
    data: citingWorksData,
    isLoading: isCitingWorksLoading,
    isError: isCitingWorksError,
  } = useQuery({
    queryKey: ['trendingVN', 'articleCitingWorks', id],
    queryFn: async () => {
      const response = await getArticleCitingWorksApi(id, { limit: 20 });
      const payload = response.data?.data || response.data || {};
      return {
        items: Array.isArray(payload.items) ? payload.items : [],
        total: Number(payload.pagination?.total ?? payload.total ?? 0),
      };
    },
    enabled: !!article && !!id,
    staleTime: 1000 * 60 * 5,
  });

  const { data: citingWorksAnalytics = null, isLoading: isCitingWorksAnalyticsLoading } = useQuery({
    queryKey: ['trendingVN', 'articleCitingWorksAnalytics', id],
    queryFn: async () => {
      const response = await getArticleCitingWorksAnalyticsApi(id);
      const payload = response.data?.data || response.data || {};
      return {
        total: Number(payload.total ?? 0),
        yearDistribution: Array.isArray(payload.year_distribution)
          ? payload.year_distribution
          : Array.isArray(payload.yearDistribution)
            ? payload.yearDistribution
            : [],
      };
    },
    enabled: !!article && !!id,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: referencesData,
    isLoading: isReferencesLoading,
    isError: isReferencesError,
  } = useQuery({
    queryKey: ['trendingVN', 'articleReferences', id],
    queryFn: async () => {
      const response = await getArticleReferencesApi(id, { limit: 50 });
      const payload = response.data?.data || response.data || {};
      return {
        items: Array.isArray(payload.items) ? payload.items : [],
        total: Number(payload.pagination?.total ?? payload.total ?? 0),
      };
    },
    enabled: !!article && !!id,
    staleTime: 1000 * 60 * 5,
  });

  const { data: recommendedArticles = [], isLoading: isRecommendedLoading } = useQuery({
    queryKey: ['trendingVN', 'relatedArticles', topicId],
    queryFn: async () => {
      const params = { scope: PAPER_VN_SCOPE, limit: 5, sortBy: 'publication_year', sortOrder: 'DESC', topic_id: topicId };
      const response = await getArticlesListApi(params);
      const payload = response.data?.data || response.data || {};
      const rawItems = payload.items || payload.articles || [];
      return Array.isArray(rawItems) ? rawItems : [];
    },
    enabled: !!article && isTopicValid,
    staleTime: 1000 * 60 * 5,
  });

  const handleBookmarkToggle = async () => {
    if (!currentUser) return false;
    const result = await toggleBookmark();
    return result.ok;
  };

  return {
    article: article?.parsedArticle || null,
    isLoading,
    error: error ? (error.response?.data?.message || error.message) : null,
    isBookmarked,
    isBookmarking: isBookmarkLoading,
    citingWorks: citingWorksData?.items || [],
    citingWorksTotal: citingWorksData?.total,
    isCitingWorksError,
    citingWorksAnalytics,
    references: referencesData?.items || [],
    referencesTotal: referencesData?.total,
    isReferencesError,
    recommendedArticles,
    isRelatedLoading: isCitingWorksLoading || isCitingWorksAnalyticsLoading || isReferencesLoading || isRecommendedLoading,
    isCitingWorksLoading,
    isCitingWorksAnalyticsLoading,
    isReferencesLoading,
    isRecommendedLoading,
    searchQuery,
    setSearchQuery,
    handleBookmarkToggle,
    refetch,
  };
};
