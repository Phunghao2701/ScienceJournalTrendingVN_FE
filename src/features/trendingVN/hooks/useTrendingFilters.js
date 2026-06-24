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
        const topicItems = topicData?.data?.topics || topicData?.data?.items || topicData?.data || [];
        topics = topicItems.filter(item => item.topic_id || item.id);
      }

      return { journalOptions: journals, topicOptions: topics };
    },
    staleTime: 1000 * 60 * 10, // Cache trong 10 phút
  });

  return { 
    journalOptions: filterData?.journalOptions || [], 
    topicOptions: filterData?.topicOptions || [],
    isLoading,
    error
  };
};
