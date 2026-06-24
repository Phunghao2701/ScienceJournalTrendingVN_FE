import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getArticleDetailApi, getArticlesListApi, bookmarkArticleApi } from '../../article/api/articleApi';
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

  // Effect phụ để khởi tạo các state nội bộ (bookmark, searchQuery) từ article data
  useEffect(() => {
    if (article) {
      setSearchQuery(article.parsedArticle.issn ? `source.issn:"${article.parsedArticle.issn}"` : '');
      
      const localBookmarkKey = `bookmark_${currentUser?.username || 'guest'}_${id}`;
      const isLocallyBookmarked = localStorage.getItem(localBookmarkKey) === 'true';
      setIsBookmarked(article.apiData.is_bookmarked || isLocallyBookmarked);
    }
  }, [article, currentUser, id]);

  // 2. Query lấy dữ liệu liên quan (phụ thuộc vào topicId của bài báo)
  const topicId = Number(article?.parsedArticle?.topic_id || article?.parsedArticle?.primary_topic?.id || article?.parsedArticle?.topic?.id);
  const isTopicValid = Number.isFinite(topicId);

  const { data: relatedData, isLoading: isRelatedLoading } = useQuery({
    queryKey: ['trendingVN', 'relatedArticles', topicId],
    queryFn: async () => {
      const params = { limit: 10, sort_by: 'semantic_citation_count', sort_order: 'desc', topic_id: topicId };
      const response = await getArticlesListApi(params);
      const payload = response.data?.data || response.data || {};
      const rawItems = payload.items || payload.articles || [];
      const normalizedItems = Array.isArray(rawItems) ? rawItems : [];
      
      return {
        citingWorks: normalizedItems.slice(0, 5),
        recommendedArticles: normalizedItems.slice(5, 10),
      };
    },
    enabled: !!article && isTopicValid, // Chỉ chạy khi đã có bài báo và topicId hợp lệ
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
    citingWorks: relatedData?.citingWorks || [],
    recommendedArticles: relatedData?.recommendedArticles || [],
    isRelatedLoading,
    searchQuery,
    handleBookmarkToggle,
    refetch,
  };
};
