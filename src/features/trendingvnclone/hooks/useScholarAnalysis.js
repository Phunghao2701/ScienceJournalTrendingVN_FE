import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getArticleAnalysisApi } from '../../article/api/articleApi';
import {
  buildPaperVnAnalysisParams,
  mapPaperVnAnalysisResponse,
} from '../../trendingVN/utils/paperVnAnalysis';

// Powers the clone's Analysis view. Mirrors trendingVN's useArticleAnalysis hook —
// same endpoint, same param builder, same response normalizer — only the query
// namespace differs so the two features' caches don't collide.
export const useScholarAnalysis = (filters, { enabled = false } = {}) => {
  const analysisParams = useMemo(() => buildPaperVnAnalysisParams(filters), [filters]);

  const query = useQuery({
    queryKey: ['trendingvnclone-analysis', analysisParams],
    enabled,
    queryFn: async () => {
      const response = await getArticleAnalysisApi(analysisParams);
      if (!response?.data?.success) {
        throw new Error(response?.data?.message || 'Unable to load scholarly analysis');
      }
      return mapPaperVnAnalysisResponse(response.data.data || {});
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5,
  });

  return {
    analysis: query.data || null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error
      ? (query.error.response?.data?.message || query.error.message || 'Unable to load scholarly analysis')
      : null,
    refetch: query.refetch,
    params: analysisParams,
  };
};

export default useScholarAnalysis;
