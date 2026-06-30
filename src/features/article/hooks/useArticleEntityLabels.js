import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { getArticleEntityLabelApi } from '../api/articleApi';

const extractPayload = (response) => response?.data?.data || response?.data || {};

const getEntityDisplayName = (entityType, payload) => {
  if (!payload) return '';
  return payload.display_name
    || payload.name
    || payload[`${entityType}_name`]
    || payload.title
    || '';
};

export default function useArticleEntityLabels(filters = {}) {
  const requests = useMemo(() => [
    ['journal', filters.selectedJournal],
    ['publisher', filters.selectedPublisher],
    ['author', filters.selectedAuthor],
    ['topic', filters.selectedTopic],
    ['keyword', filters.selectedKeyword],
  ].filter(([, id]) => id && id !== 'all'), [
    filters.selectedAuthor,
    filters.selectedJournal,
    filters.selectedKeyword,
    filters.selectedPublisher,
    filters.selectedTopic,
  ]);

  const queries = useQueries({
    queries: requests.map(([entityType, id]) => ({
      queryKey: ['paper-vn-entity-label', entityType, String(id)],
      queryFn: async () => {
        const response = await getArticleEntityLabelApi(entityType, id);
        const payload = extractPayload(response);
        return {
          entityType,
          id: String(id),
          displayName: getEntityDisplayName(entityType, payload),
        };
      },
      staleTime: 1000 * 60 * 10,
      retry: 1,
    })),
  });

  return useMemo(() => {
    const labels = {};
    requests.forEach(([entityType, id], index) => {
      const queryData = queries[index]?.data;
      labels[entityType] = queryData?.displayName || '';
      labels[`${entityType}Loading`] = Boolean(queries[index]?.isLoading || queries[index]?.isFetching);
      labels[`${entityType}Error`] = Boolean(queries[index]?.isError);
      labels[`${entityType}Id`] = String(id);
    });
    return labels;
  }, [queries, requests]);
}
