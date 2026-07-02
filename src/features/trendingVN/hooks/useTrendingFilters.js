/**
 * React Query hook that loads filter dropdown data for the FilterDrawer component.
 *
 * File: features/trendingVN/hooks/useTrendingFilters.js
 *
 * NOTE: This is a separate, lighter hook from useTrending.js. Key differences:
 *   - Uses React Query (not useState/useEffect)
 *   - Imports from journal/api/journalApi and topic/api/topic.api (NOT trending.api.js)
 *   - Loads journal and topic lists for filter dropdowns only, not page-level data
 *   - Uses Promise.allSettled so one failed request does not block the other
 *   - Cache TTL: 10 minutes (staleTime)
 *
 * Consumed by: FilterDrawer.jsx or TrendingFilterBar.jsx.
 */
import { useQuery } from '@tanstack/react-query';
import { searchJournalsApi } from '../../journal/api/journalApi';
import { getTopicsApi } from '../../topic/api/topic.api';

export const useTrendingFilters = () => {
  const { data: filterData, isLoading, error } = useQuery({
    queryKey: ['trendingVN', 'filters'],
    queryFn: async () => {
      const [journalResponse, topicResponse] = await Promise.allSettled([
        searchJournalsApi({ limit: 100 }),
        getTopicsApi({ limit: 100, sort_by: 'display_name', sort_order: 'asc' })
      ]);

      let journals = [];
      let topics = [];

      if (journalResponse.status === 'fulfilled' && journalResponse.value?.data?.success && journalResponse.value?.data?.data?.items) {
        journals = journalResponse.value.data.data.items;
      }

      if (topicResponse.status === 'fulfilled' && topicResponse.value?.data?.success) {
        const topicData = topicResponse.value.data;
        // Topics endpoint returns data in one of three shapes: data.topics, data.items, or data directly.
        const topicItems = topicData?.data?.topics || topicData?.data?.items || topicData?.data || [];
        // Filter to items that have a recognizable id field.
        topics = topicItems.filter(item => item.topic_id || item.id);
      }

      return { journalOptions: journals, topicOptions: topics };
    },
    staleTime: 1000 * 60 * 10, // 10-minute cache -- filter options change infrequently
  });

  return { 
    journalOptions: filterData?.journalOptions || [], 
    topicOptions: filterData?.topicOptions || [],
    isLoading,
    error
  };
};
