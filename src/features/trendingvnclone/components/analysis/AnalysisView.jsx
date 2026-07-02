import { BarChart3, AlertCircle } from 'lucide-react';
import AnalysisSummaryCards from './AnalysisSummaryCards';
import AnalysisTimeSeriesChart from './AnalysisTimeSeriesChart';
import AnalysisEntityRankings from './AnalysisEntityRankings';
import AnalysisTrendingArticles from './AnalysisTrendingArticles';
import { useScholarAnalysis } from '../../hooks/useScholarAnalysis';
import { isAnalysisCohortEmpty } from '../../../trendingVN/utils/paperVnAnalysis';

const fmt = (value) => new Intl.NumberFormat().format(Number(value || 0));

/**
 * Full Analysis dashboard for the clone — same data contract as trendingVN's
 * AnalysisDashboard (useArticleAnalysis / getArticleAnalysisApi), restyled in the
 * clone's Tailwind/lens-scholar visual language instead of react-bootstrap.
 */
export default function AnalysisView({ filters, onEntityFilter }) {
  const { analysis, isLoading, error, refetch } = useScholarAnalysis(filters, { enabled: true });

  if (isLoading && !analysis) {
    return (
      <div className="flex-grow flex items-center justify-center p-10 text-gray-500 text-[13.6px] gap-2">
        <div className="w-4 h-4 border-2 border-lens-link-blue border-t-transparent rounded-full animate-spin" />
        Loading analysis dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow p-8 flex flex-col items-center justify-center bg-gray-50">
        <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
        <p className="font-bold text-gray-800 mb-1">Unable to load analysis</p>
        <p className="text-[12.8px] text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-lens-link-blue text-white rounded font-medium hover:bg-lens-link-blue/90 cursor-pointer"
        >
          Try again
        </button>
      </div>
    );
  }

  if (isAnalysisCohortEmpty(analysis)) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-10 text-gray-500 gap-2">
        <BarChart3 className="w-8 h-8" />
        <p className="font-bold text-gray-800">No analysis cohort found</p>
        <p className="text-[12.8px]">Try broadening the search or removing a filter.</p>
      </div>
    );
  }

  const years = analysis.window?.years || [];
  const citationCoverage = analysis.citations_over_time?.[0];
  const citationCoverageLabel = citationCoverage
    ? `${fmt(citationCoverage.total_articles_with_history)} articles with citation history`
    : 'Citation-history coverage unavailable';

  return (
    <div className="flex-grow p-4 space-y-4 bg-gray-50/50">
      <div id="analysis-summary-cards">
        <AnalysisSummaryCards summary={analysis.summary} window={analysis.window} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <AnalysisTimeSeriesChart
          title="Works over time"
          description="Zero-filled publication counts across the backend window."
          years={years}
          rows={analysis.works_over_time}
          valueKey="count"
          color="#2B54B2"
        />
        <AnalysisTimeSeriesChart
          title="Citations over time"
          description="Only valid imported citation-history years are counted."
          years={years}
          rows={analysis.citations_over_time}
          valueKey="citations"
          coverageLabel={citationCoverageLabel}
          color="#0e7490"
        />
      </div>

      <AnalysisEntityRankings top={analysis.top} growth={analysis.growth} onEntityClick={onEntityFilter} />

      <AnalysisTrendingArticles articles={analysis.trending_articles} coverage={analysis.trending_article_coverage} />
    </div>
  );
}
