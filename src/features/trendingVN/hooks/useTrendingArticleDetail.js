/**
 * React Query hook for the article detail page in the TrendingVN feature.
 *
 * File: features/trendingVN/hooks/useTrendingArticleDetail.js
 *
 * Manages four queries:
 *   1. Article detail (GET /articles/:id via getArticleDetailApi)
 *   2. Citing works  (GET /articles/:id/citing-works, enabled after query 1 resolves)
 *   3. References    (GET /articles/:id/references, enabled after query 1 resolves)
 *   4. Recommended   (GET /articles?topic_id=..., enabled only when topicId is valid)
 *
 * Bookmark state is dual-tracked:
 *   - API field: article.apiData.is_bookmarked (server truth)
 *   - localStorage: bookmark_{username|'guest'}_{id} (optimistic local fallback)
 * Bookmark toggles use optimistic updates with rollback on error.
 *
 * primary_topic from the API is a string containing a numeric ID (e.g. "6"),
 * not a number -- converted via Number() before use in the recommended query.
 *
 * Imports from: article/api/articleApi (NOT trending.api.js)
 */
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getArticleDetailApi, getArticlesListApi, bookmarkArticleApi, getArticleCitingWorksApi, getArticleReferencesApi } from '../../article/api/articleApi';
import { normalizeArticleDetail } from '../../article/utils/articleFormatters';

export const useTrendingArticleDetail = (id, currentUser) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Query: article detail -- the root query; queries 2-4 depend on its result
  const { data: article, isLoading, error, refetch } = useQuery({
    queryKey: ['trendingVN', 'articleDetail', id],
    queryFn: async () => {
      const response = await getArticleDetailApi(id);
      if (response.data && response.data.success !== false) {
        const apiData = response.data.data || {};
        const parsedArticle = normalizeArticleDetail(apiData, id);
        return { apiData, parsedArticle };
      }
      throw new Error('Không thể tải chi tiết bài báo khoa học.');
    },
    staleTime: 1000 * 60 * 5, // 5-minute cache
  });

  // Sync bookmark state from the API response and localStorage after query resolves.
  useEffect(() => {
    if (article) {
      const localBookmarkKey = `bookmark_${currentUser?.username || 'guest'}_${id}`;
      const isLocallyBookmarked = localStorage.getItem(localBookmarkKey) === 'true';
      setIsBookmarked(article.apiData.is_bookmarked || isLocallyBookmarked);
    }
  }, [article, currentUser, id]);

  // 2. Resolve topicId for the recommended articles query.
  // primary_topic from the API is a string like "6" (not a number or object).
  // Fallback: use the topic_id of the first element in the topics array.
  const rawTopicId =
    article?.parsedArticle?.primary_topic ||
    article?.parsedArticle?.topics?.[0]?.topic_id;
  const topicId = Number(rawTopicId);
  const isTopicValid = Number.isFinite(topicId) && topicId > 0;

  const { data: citingWorksData, isLoading: isCitingWorksLoading } = useQuery({
    queryKey: ['trendingVN', 'articleCitingWorks', id],
    queryFn: async () => {
      const response = await getArticleCitingWorksApi(id, { limit: 20 });
      const payload = response.data?.data || response.data || {};
      return Array.isArray(payload.items) ? payload.items : [];
    },
    enabled: !!article && !!id,
    staleTime: 1000 * 60 * 5,
  });

  const { data: referencesData, isLoading: isReferencesLoading } = useQuery({
    queryKey: ['trendingVN', 'articleReferences', id],
    queryFn: async () => {
      const response = await getArticleReferencesApi(id, { limit: 50 });
      const payload = response.data?.data || response.data || {};
      return Array.isArray(payload.items) ? payload.items : [];
    },
    enabled: !!article && !!id,
    staleTime: 1000 * 60 * 5,
  });

  const { data: recommendedArticles = [], isLoading: isRecommendedLoading } = useQuery({
    queryKey: ['trendingVN', 'relatedArticles', topicId],
    queryFn: async () => {
      const params = { limit: 5, sortBy: 'publication_year', sortOrder: 'DESC', topic_id: topicId };
      const response = await getArticlesListApi(params);
      const payload = response.data?.data || response.data || {};
      const rawItems = payload.items || payload.articles || [];
      return Array.isArray(rawItems) ? rawItems : [];
    },
    enabled: !!article && isTopicValid,
    staleTime: 1000 * 60 * 5,
  });

  // 3. Bookmark mutation with optimistic update and rollback on error.
  const bookmarkMutation = useMutation({
    mutationFn: async (newBookmarkState) => {
      await bookmarkArticleApi(id, newBookmarkState);
      return newBookmarkState;
    },
    onMutate: async (newBookmarkState) => {
      // Optimistic update: apply immediately before the API call resolves.
      setIsBookmarked(newBookmarkState);
      const localBookmarkKey = `bookmark_${currentUser?.username}_${id}`;
      localStorage.setItem(localBookmarkKey, newBookmarkState.toString());
      return { previousState: !newBookmarkState };
    },
    onError: (err, newBookmarkState, context) => {
      // Rollback to previous state on API failure.
      setIsBookmarked(context.previousState);
      const localBookmarkKey = `bookmark_${currentUser?.username}_${id}`;
      localStorage.setItem(localBookmarkKey, context.previousState.toString());
      console.error('Lỗi khi cập nhật bookmark:', err);
    },
  });

  const handleBookmarkToggle = async () => {
    if (!currentUser) return false;
    const newBookmarkState = !isBookmarked;
    await bookmarkMutation.mutateAsync(newBookmarkState);
    return true;
  };

  return {
    article: article?.parsedArticle || null,
    isLoading,
    error: error ? (error.response?.data?.message || error.message) : null,
    isBookmarked,
    isBookmarking: bookmarkMutation.isPending,
    citingWorks: citingWorksData || [],
    references: referencesData || [],
    recommendedArticles,
    isRelatedLoading: isCitingWorksLoading || isReferencesLoading || isRecommendedLoading,
    isCitingWorksLoading,
    isReferencesLoading,
    isRecommendedLoading,
    searchQuery,
    setSearchQuery,
    handleBookmarkToggle,
    refetch,
  };
};
