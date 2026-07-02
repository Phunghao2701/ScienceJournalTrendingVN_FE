import { useQuery } from '@tanstack/react-query';
import { getArticleAnalyticsApi } from '../../article/api/articleApi';
import { searchJournalsApi } from '../../journal/api/journalApi';
import { buildPaperVnDiscoveryParams } from '../../article/utils/paperVnDiscoveryParams';

const resolveIssnJournalFilter = async (searchText) => {
  const text = (searchText || '').trim();
  const issnMatch = text.match(
    /(?:source\.issn:\s*")?(\d{4}-\d{3}[\dX]|\d{4}\s*-\s*\d{3}[\dX]|\d{8})(?:"\s*)?/i
  );
  if (!issnMatch) {
    return { journalId: null, searchStr: text };
  }

  const issnVal = issnMatch[1].replace(/\s+/g, '');
  try {
    const journalRes = await searchJournalsApi({ search: issnVal });
    const journalList = journalRes?.data?.data?.items || [];
    if (journalList.length > 0) {
      const matchedJournal = journalList[0];
      return {
        journalId: matchedJournal.journal_id || matchedJournal.id,
        searchStr: ''
      };
    }
  } catch (err) {
    console.warn('Failed to lookup journal by ISSN:', err);
  }

  return { journalId: null, searchStr: text };
};

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

/**
 * Fetches aggregated analytics for the current search.
 * `filters` uses the same flat shape as `useScholarSearch`, built the same way
 * trendingVN's `useArticleAnalytics` builds its request (discovery params, no pagination/sort).
 */
export const useScholarAnalytics = (filters = {}, { enabled = true } = {}) => {
  const query = useQuery({
    queryKey: ['trendingvnclone', 'analytics', filters],
    enabled,
    queryFn: async () => {
      // 1. Resolve ISSN filter if matching pattern
      const { journalId, searchStr } = await resolveIssnJournalFilter(filters.search);

      // 2. Build params the same way trendingVN's useArticleAnalytics does — no page/limit/sort
      const analyticsFilters = { ...filters };
      delete analyticsFilters.page;
      delete analyticsFilters.limit;
      delete analyticsFilters.sortBy;
      delete analyticsFilters.sortOrder;
      const params = buildPaperVnDiscoveryParams({
        ...analyticsFilters,
        search: searchStr,
        selectedJournal: journalId || filters.selectedJournal
      });

      const response = await getArticleAnalyticsApi(params);
      if (!response?.data?.success) {
        throw new Error(response?.data?.message || 'Failed to fetch scholarly analytics');
      }

      const data = response.data.data || {};
      return {
        totals: data.totals || data.total || {},
        yearDistribution: normalizeList(data.yearDistribution || data.year_distribution || data.years, 'year'),
        topInstitutions: normalizeList(data.topInstitutions || data.top_institutions || data.institutions, 'institution_name'),
        topAuthors: normalizeList(data.topAuthors || data.top_authors || data.authors, 'display_name'),
        topTopics: normalizeList(data.topTopics || data.top_topics || data.topics, 'topic_name'),
        topPublishers: normalizeList(data.topPublishers || data.top_publishers || data.publishers, 'publisher_name'),
        accessDistribution: normalizeList(data.accessDistribution || data.access_distribution || data.access),
      };
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 3 // Cache for 3 minutes
  });

  return {
    analytics: query.data || null,
    isLoading: query.isLoading,
    error: query.error ? query.error.message : null,
    refetch: query.refetch
  };
};
