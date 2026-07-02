import { useQuery } from '@tanstack/react-query';
import { searchJournalsApi } from '../../journal/api/journalApi';
import { getTopicsApi } from '../../topic/api/topic.api';
import { getInstitutionsApi } from '../../institution/api/institution.api';
import { getAuthorsApi } from '../../author/api/author.api';
import { useTrendingPublishers } from '../../trendingVN/hooks/useTrendingPublishers';

export const useScholarFilters = () => {
  const { data: filterData, isLoading, error } = useQuery({
    queryKey: ['trendingvnclone', 'filters'],
    queryFn: async () => {
      const [
        journalResponse,
        topicResponse,
        institutionResponse,
        authorResponse
      ] = await Promise.allSettled([
        searchJournalsApi({ limit: 100 }),
        getTopicsApi({ limit: 100, sort_by: 'display_name', sort_order: 'asc' }),
        getInstitutionsApi({ limit: 100 }),
        getAuthorsApi({ limit: 100 })
      ]);

      let journals = [];
      let topics = [];
      let institutions = [];
      let authors = [];

      // 1. Resolve Journals
      if (
        journalResponse.status === 'fulfilled' &&
        journalResponse.value?.data?.success
      ) {
        const payload = journalResponse.value.data.data;
        const list = payload?.items || payload?.journals || [];
        journals = list.map((item) => ({
          id: String(item.journal_id || item.id || ''),
          name: item.display_name || item.journal_name || item.name || 'Unknown Journal'
        }));
      }

      // 2. Resolve Topics
      if (
        topicResponse.status === 'fulfilled' &&
        topicResponse.value?.data?.success
      ) {
        const payload = topicResponse.value.data;
        const list = payload?.data?.topics || payload?.data?.items || payload?.data || [];
        topics = list
          .filter((item) => item.topic_id || item.id)
          .map((item) => ({
            id: String(item.topic_id || item.id),
            name: item.display_name || item.topic_name || item.name || 'Unknown Topic'
          }));
      }

      // 3. Resolve Institutions
      if (
        institutionResponse.status === 'fulfilled' &&
        institutionResponse.value?.data?.success
      ) {
        const payload = institutionResponse.value.data;
        const list = payload?.data || payload?.items || [];
        institutions = list.map((item) => ({
          id: String(item.institution_id || item.id),
          name: item.display_name || item.name || 'Unknown Institution'
        }));
      }

      // 4. Resolve Authors
      if (
        authorResponse.status === 'fulfilled' &&
        authorResponse.value?.data?.success
      ) {
        const payload = authorResponse.value.data;
        const list = payload?.data || payload?.items || [];
        authors = list.map((item) => ({
          id: String(item.author_id || item.id),
          name: item.display_name || item.name || item.author_name || 'Unknown Author'
        }));
      }

      return {
        journals,
        topics,
        institutions,
        authors
      };
    },
    staleTime: 1000 * 60 * 10 // Cache for 10 minutes
  });

  // Publisher options reuse trendingVN's own hook (same /publishers endpoint, same shape),
  // so both features list the exact same publishers with no duplicated fetch logic.
  const {
    publishers,
    isLoading: isPublishersLoading,
    error: publishersError
  } = useTrendingPublishers(100);

  const publisherOptions = (publishers || [])
    .map((p) => ({
      id: String(p.publisher_id || p.id || ''),
      name: p.display_name || p.name || 'Unknown Publisher'
    }))
    .filter((p) => p.id);

  return {
    journalOptions: filterData?.journals || [],
    topicOptions: filterData?.topics || [],
    institutionOptions: filterData?.institutions || [],
    authorOptions: filterData?.authors || [],
    publisherOptions,
    isLoading: isLoading || isPublishersLoading,
    error: error || publishersError
  };
};
