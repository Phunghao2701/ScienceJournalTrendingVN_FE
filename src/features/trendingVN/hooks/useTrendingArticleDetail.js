import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getArticleDetailApi, getArticlesListApi, bookmarkArticleApi, getArticleCitingWorksApi, getArticleReferencesApi } from '../../article/api/articleApi';
import { normalizeArticleDetail } from '../../article/utils/articleFormatters';

export const useTrendingArticleDetail = (id, currentUser) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Query lấy chi tiết bài báo
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
    staleTime: 1000 * 60 * 5, // 5 phút
  });

  // Effect phụ để khởi tạo state bookmark từ article data
  useEffect(() => {
    if (article) {
      const localBookmarkKey = `bookmark_${currentUser?.username || 'guest'}_${id}`;
      const isLocallyBookmarked = localStorage.getItem(localBookmarkKey) === 'true';
      setIsBookmarked(article.apiData.is_bookmarked || isLocallyBookmarked);
    }
  }, [article, currentUser, id]);

  // 2. Query lấy dữ liệu liên quan (phụ thuộc vào topicId của bài báo)
  // primary_topic từ API là string chứa topic_id (ví dụ "6"), không phải object.
  // Fallback: lấy topic_id từ phần tử đầu tiên của mảng topics.
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

  // 3. Mutation cho Bookmark
  const bookmarkMutation = useMutation({
    mutationFn: async (newBookmarkState) => {
      await bookmarkArticleApi(id, newBookmarkState);
      return newBookmarkState;
    },
    onMutate: async (newBookmarkState) => {
      // Optimistic Update
      setIsBookmarked(newBookmarkState);
      const localBookmarkKey = `bookmark_${currentUser?.username}_${id}`;
      localStorage.setItem(localBookmarkKey, newBookmarkState.toString());
      return { previousState: !newBookmarkState };
    },
    onError: (err, newBookmarkState, context) => {
      // Rollback
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
