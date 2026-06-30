import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getArticleAnalysisApi } from '../../article/api/articleApi';
import {
  buildPaperVnAnalysisParams,
  mapPaperVnAnalysisResponse,
} from '../utils/paperVnAnalysis';

export default function useArticleAnalysis(filters, { enabled = false } = {}) {
  const analysisParams = useMemo(() => buildPaperVnAnalysisParams(filters), [filters]);

  const query = useQuery({
    queryKey: ['paper-vn-article-analysis', analysisParams],
    enabled,
    queryFn: async () => {
      const response = await getArticleAnalysisApi(analysisParams);
      if (!response?.data?.success) {
        throw new Error(response?.data?.message || 'Unable to load article analysis');
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
      ? (query.error.response?.data?.message || query.error.message || 'Unable to load article analysis')
      : null,
    refetch: query.refetch,
    params: analysisParams,
  };
}
