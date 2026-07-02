import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getArticleAnalyticsApi } from '../api/articleApi';
import { buildPaperVnDiscoveryParams } from '../utils/paperVnDiscoveryParams';

const normalizeList = (value, nameKey = 'name') => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => ({
    ...item,
    id: item.id || item.publisher_id || item.author_id || item.topic_id || item.keyword_id || item.institution_id || null,
    key: item.key ?? item.access ?? item.status ?? item.name ?? null,
    name: item.display_name || item[nameKey] || item.name || item.key || 'Unknown',
    count: Number(item.count ?? item.article_count ?? item.total ?? 0),
  }));
};

export default function useArticleAnalytics(filters, { enabled = true } = {}) {
  const analyticsParams = useMemo(() => {
    const params = buildPaperVnDiscoveryParams(filters);
    delete params.page;
    delete params.limit;
    return params;
  }, [filters]);

  const query = useQuery({
    queryKey: ['paper-vn-article-analytics', analyticsParams],
    enabled,
    queryFn: async () => {
      const response = await getArticleAnalyticsApi(analyticsParams);
      if (!response?.data?.success) {
        throw new Error(response?.data?.message || 'Unable to load article analytics');
      }

      const data = response.data.data || {};
      return {
        totals: data.totals || data.total || {},
        yearDistribution: normalizeList(data.yearDistribution || data.year_distribution || data.years, 'year'),
        topPublishers: normalizeList(data.topPublishers || data.top_publishers || data.publishers, 'publisher_name'),
        topInstitutions: normalizeList(data.topInstitutions || data.top_institutions || data.institutions, 'institution_name'),
        topAuthors: normalizeList(data.topAuthors || data.top_authors || data.authors, 'display_name'),
        topTopics: normalizeList(data.topTopics || data.top_topics || data.topics, 'topic_name'),
        accessDistribution: normalizeList(data.accessDistribution || data.access_distribution || data.access),
      };
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5,
  });

  return {
    analytics: query.data || null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error
      ? (query.error.response?.data?.message || query.error.message || 'Unable to load article analytics')
      : null,
    refetch: query.refetch,
    params: analyticsParams,
  };
}
