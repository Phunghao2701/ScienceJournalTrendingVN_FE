import { useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getArticleDetailApi,
  getArticlesListApi,
  getArticleCitingWorksApi,
  getArticleCitingWorksAnalyticsApi,
  getArticleReferencesApi,
  hydrateArticleReferencesApi,
} from '../../article/api/articleApi';
import useBookmark from '../../bookmark/hooks/useBookmark';
import { normalizeArticleDetail } from '../../article/utils/articleFormatters';
import { PAPER_VN_SCOPE } from '../../article/utils/paperVnDiscoveryParams';
import {
  buildReferenceHydrationQueryKey,
  getArticleReferenceSignalCount,
  shouldHydrateArticleReferences,
} from '../utils/referenceHydration';

export const useTrendingArticleDetail = (
  id,
  currentUser,
  { isReferencesTabActive = false } = {},
) => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [hydratingReferencesArticleId, setHydratingReferencesArticleId] = useState(null);
  const [referencesHydrationFailure, setReferencesHydrationFailure] = useState(null);
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
    isSuccess: isReferencesSuccess,
    refetch: refetchReferences,
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
    enabled: !!article && !!id && isReferencesTabActive,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const articleReferenceSignalCount = getArticleReferenceSignalCount(
    article?.parsedArticle,
    article?.apiData,
  );
  const articleIdKey = String(id ?? '');
  const referencesHydrationError = referencesHydrationFailure?.articleId === articleIdKey
    ? referencesHydrationFailure.error
    : null;
  const isHydratingReferences = hydratingReferencesArticleId === articleIdKey;
  const hasCompletedReferenceHydration = Boolean(
    queryClient.getQueryData(buildReferenceHydrationQueryKey(id)),
  );
  const isReferenceHydrationEligible = shouldHydrateArticleReferences({
    isReferencesTabActive,
    isAuthenticated: Boolean(currentUser),
    isGetSuccess: isReferencesSuccess,
    hasGetError: isReferencesError,
    detailedItemsCount: referencesData?.items?.length,
    detailedTotal: referencesData?.total,
    articleReferenceSignalCount,
  });
  const shouldStartReferenceHydration = (
    isReferenceHydrationEligible
    && !referencesHydrationError
    && !hasCompletedReferenceHydration
  );

  const hydrateReferencesIfNeeded = useCallback(async () => {
    if (!isReferenceHydrationEligible || !id) return false;

    const hydrationQueryKey = buildReferenceHydrationQueryKey(id);
    const referencesQueryKey = ['trendingVN', 'articleReferences', id];

    setReferencesHydrationFailure(null);
    setHydratingReferencesArticleId(articleIdKey);

    try {
      await queryClient.fetchQuery({
        queryKey: hydrationQueryKey,
        queryFn: async () => {
          await hydrateArticleReferencesApi(id);
          await queryClient.invalidateQueries({
            queryKey: referencesQueryKey,
            exact: true,
            refetchType: 'active',
          });
          return { hydrated: true };
        },
        staleTime: Infinity,
        gcTime: Infinity,
        retry: false,
      });
      return true;
    } catch (error) {
      setReferencesHydrationFailure({ articleId: articleIdKey, error });
      return false;
    } finally {
      setHydratingReferencesArticleId((currentArticleId) => (
        currentArticleId === articleIdKey ? null : currentArticleId
      ));
    }
  }, [
    articleIdKey,
    id,
    isReferenceHydrationEligible,
    queryClient,
  ]);

  useEffect(() => {
    if (!shouldStartReferenceHydration) return;
    void hydrateReferencesIfNeeded();
  }, [hydrateReferencesIfNeeded, shouldStartReferenceHydration]);

  const retryReferencesHydration = useCallback(
    () => hydrateReferencesIfNeeded(),
    [hydrateReferencesIfNeeded],
  );

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
    isHydratingReferences,
    isReferencesHydrationPending: shouldStartReferenceHydration,
    referencesHydrationError,
    retryReferences: refetchReferences,
    retryReferencesHydration,
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
