import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getArticleDetailApi,
  getArticlesListApi,
  bookmarkArticleApi,
  getArticleCitingWorksApi,
  getArticleCitingWorksAnalyticsApi,
  getArticleReferencesApi,
} from '../../article/api/articleApi';
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
  const [isBookmarked, setIsBookmarked] = useState(false);

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

  // Initialize bookmark state from article data / local fallback
  useEffect(() => {
    if (article) {
      const localBookmarkKey = `bookmark_${currentUser?.username || 'guest'}_${articleId}`;
      const isLocallyBookmarked = localStorage.getItem(localBookmarkKey) === 'true';
      setIsBookmarked(article.raw?.is_bookmarked || isLocallyBookmarked);
    }
  }, [article, currentUser, articleId]);

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

  // 3. Bookmark mutation (local-only, mirrors trendingVN's optimistic update)
  const bookmarkMutation = useMutation({
    mutationFn: async (newBookmarkState) => {
      await bookmarkArticleApi(articleId, newBookmarkState);
      return newBookmarkState;
    },
    onMutate: async (newBookmarkState) => {
      setIsBookmarked(newBookmarkState);
      const localBookmarkKey = `bookmark_${currentUser?.username || 'guest'}_${articleId}`;
      localStorage.setItem(localBookmarkKey, newBookmarkState.toString());
      return { previousState: !newBookmarkState };
    },
    onError: (err, newBookmarkState, context) => {
      setIsBookmarked(context.previousState);
      const localBookmarkKey = `bookmark_${currentUser?.username || 'guest'}_${articleId}`;
      localStorage.setItem(localBookmarkKey, context.previousState.toString());
      console.error('Error updating bookmark:', err);
    },
  });

  const handleBookmarkToggle = async () => {
    if (!currentUser) return false;
    const newBookmarkState = !isBookmarked;
    await bookmarkMutation.mutateAsync(newBookmarkState);
    return true;
  };

  return {
    article: article?.item || null,
    isLoading,
    error: error ? (error.response?.data?.message || error.message) : null,
    isBookmarked,
    isBookmarking: bookmarkMutation.isPending,
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
