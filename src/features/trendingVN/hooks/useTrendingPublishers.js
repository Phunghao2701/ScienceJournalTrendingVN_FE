import { useQuery } from '@tanstack/react-query';
import { getTrendingPublishersApi } from '../api/trendingVN.api';

export const useTrendingPublishers = (limit = 8) => {
  const query = useQuery({
    queryKey: ['trendingVN', 'publishers', limit],
    queryFn: async () => {
      const response = await getTrendingPublishersApi({ limit });
      const payload = response?.data;
      const items = payload?.data?.data || payload?.data || [];
      return Array.isArray(items) ? items : [];
    },
    staleTime: 1000 * 60 * 10,
  });

  return {
    publishers: query.data || [],
    isLoading: query.isLoading,
    error: query.error ? (query.error.response?.data?.message || query.error.message || 'Failed to fetch publisher data') : null,
    refetch: query.refetch,
  };
};
