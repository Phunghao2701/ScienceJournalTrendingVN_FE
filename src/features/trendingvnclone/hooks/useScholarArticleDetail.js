import { useQuery } from '@tanstack/react-query';
import {
  getArticleDetailApi,
  getArticlesListApi,
  getArticleCitingWorksApi,
  getArticleCitingWorksAnalyticsApi,
  getArticleReferencesApi,
} from '../../article/api/articleApi';
import useBookmark from '../../bookmark/hooks/useBookmark';
import { PAPER_VN_SCOPE } from '../../article/utils/paperVnDiscoveryParams';
import { mapArticleToCardItem } from './useScholarSearch';

/**
 * Fetch and normalise a single article by its numeric article_id, plus its
 * citing works / references / recommended articles and bookmark state.
 * Mirrors src/features/trendingVN/hooks/useTrendingArticleDetail.js so both
 * features hit the exact same endpoints the same way; results are normalised
 * through mapArticleToCardItem so clone components can render them consistently.
 */
export const useScholarArticleDetail = (articleId, currentUser) => {
  const {
    isBookmarked,
    isBookmarkLoading,
    toggleBookmark,
  } = useBookmark(articleId);

  // 1. Article detail query
  const { data: article, isLoading, error, refetch } = useQuery({
    queryKey: ['trendingvnclone', 'article', articleId],
    queryFn: async () => {
      if (!articleId) throw new Error('No article ID provided');
      const response = await getArticleDetailApi(articleId);
      if (!response?.data?.success) {
        throw new Error(response?.data?.message || 'Failed to fetch article detail');
      }
      const raw = response.data.data;
      return { raw, item: mapArticleToCardItem(raw) };
    },
    enabled: !!articleId,
    staleTime: 1000 * 60 * 5 // Cache 5 minutes
  });

  // 2. Related data queries depend on the article's primary topic id
  const topicId = Number(article?.item?.topicId);
  const isTopicValid = Number.isFinite(topicId) && topicId > 0;

  const {
    data: citingWorksData,
    isLoading: isCitingWorksLoading,
    isError: isCitingWorksError,
  } = useQuery({
    queryKey: ['trendingvnclone', 'articleCitingWorks', articleId],
    queryFn: async () => {
      const response = await getArticleCitingWorksApi(articleId, { limit: 20 });
      const payload = response.data?.data || response.data || {};
      const rawItems = Array.isArray(payload.items) ? payload.items : [];
      return {
        items: rawItems.map(mapArticleToCardItem).filter(Boolean),
        total: Number(payload.pagination?.total ?? payload.total ?? 0),
      };
    },
    enabled: !!article && !!articleId,
    staleTime: 1000 * 60 * 5,
  });

  const { data: citingWorksAnalytics = null, isLoading: isCitingWorksAnalyticsLoading } = useQuery({
    queryKey: ['trendingvnclone', 'articleCitingWorksAnalytics', articleId],
    queryFn: async () => {
      const response = await getArticleCitingWorksAnalyticsApi(articleId);
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
    enabled: !!article && !!articleId,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: referencesData,
    isLoading: isReferencesLoading,
    isError: isReferencesError,
  } = useQuery({
    queryKey: ['trendingvnclone', 'articleReferences', articleId],
    queryFn: async () => {
      const response = await getArticleReferencesApi(articleId, { limit: 50 });
      const payload = response.data?.data || response.data || {};
      const rawItems = Array.isArray(payload.items) ? payload.items : [];
      return {
        items: rawItems.map(mapArticleToCardItem).filter(Boolean),
        total: Number(payload.pagination?.total ?? payload.total ?? 0),
      };
    },
    enabled: !!article && !!articleId,
    staleTime: 1000 * 60 * 5,
  });

  const { data: recommendedArticles = [], isLoading: isRecommendedLoading } = useQuery({
    queryKey: ['trendingvnclone', 'relatedArticles', topicId],
    queryFn: async () => {
      const params = { scope: PAPER_VN_SCOPE, limit: 5, sortBy: 'publication_year', sortOrder: 'DESC', topic_id: topicId };
      const response = await getArticlesListApi(params);
      const payload = response.data?.data || response.data || {};
      const rawItems = payload.items || payload.articles || [];
      return (Array.isArray(rawItems) ? rawItems : []).map(mapArticleToCardItem).filter(Boolean);
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
    article: article?.item || null,
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
    handleBookmarkToggle,
    refetch
  };
};
