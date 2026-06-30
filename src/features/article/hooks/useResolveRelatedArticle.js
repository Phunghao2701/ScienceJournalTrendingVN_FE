import { useCallback, useState } from 'react';
import { getArticlesListApi } from '../api/articleApi';
import { PAPER_VN_SCOPE } from '../utils/paperVnDiscoveryParams';

const formatAuthorsLine = (authors = [], limit = 3) => {
  if (!authors || authors.length === 0) return 'Authors are being updated';

  const names = authors
    .slice(0, limit)
    .map((author) => author.display_name || author.name || author.author_name || 'Author')
    .join(', ');
  return authors.length > limit ? `${names}...` : names;
};

const normalizeRecommendedArticle = (item = {}) => ({
  ...item,
  article_id: item.article_id || item.id,
  title: item.title || 'Untitled Article',
  publication_year: item.publication_year || item.year || '-',
  doi: item.doi || '',
  abstract: item.abstract || item.description || 'No abstract is available for this article.',
  authors: Array.isArray(item.authors)
    ? formatAuthorsLine(item.authors, 3)
    : item.authors || item.authors_text || '',
});

export default function useResolveRelatedArticle() {
  const [recommendedArticles, setRecommendedArticles] = useState([]);
  const [isRecommendedLoading, setIsRecommendedLoading] = useState(false);

  const fetchRecommendedArticles = useCallback(async (parsedArticle) => {
    try {
      setIsRecommendedLoading(true);
      const params = {
        scope: PAPER_VN_SCOPE,
        limit: 4,
        page: 1,
      };
      const journalId = Number(parsedArticle.journal_id);
      const topicId = Number(parsedArticle.primary_topic || parsedArticle.topic_id);
      if (Number.isFinite(journalId)) params.journal_id = journalId;
      if (Number.isFinite(topicId)) params.topic_id = topicId;

      const response = await getArticlesListApi(params);
      const payload = response.data?.data || response.data || {};
      const rawItems = payload.items || payload.articles || payload.data || [];
      const normalizedItems = rawItems
        .map(normalizeRecommendedArticle)
        .filter((item) => String(item.article_id) !== String(parsedArticle.article_id))
        .slice(0, 3);

      setRecommendedArticles(normalizedItems);
    } catch (err) {
      console.warn('Error fetching recommended articles:', err);
      setRecommendedArticles([]);
    } finally {
      setIsRecommendedLoading(false);
    }
  }, []);

  return {
    recommendedArticles,
    isRecommendedLoading,
    fetchRecommendedArticles,
  };
}
