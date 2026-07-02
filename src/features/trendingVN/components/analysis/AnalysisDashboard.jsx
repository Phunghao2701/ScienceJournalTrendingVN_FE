import { Alert, Button, Spinner } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import AnalysisSummary from './AnalysisSummary';
import AnalysisTimeSeriesChart from './AnalysisTimeSeriesChart';
import AnalysisEntityPanel from './AnalysisEntityPanel';
import AnalysisTrendingArticles from './AnalysisTrendingArticles';
import { isAnalysisCohortEmpty } from '../../utils/paperVnAnalysis';

const fmt = (value) => new Intl.NumberFormat().format(Number(value || 0));

export default function AnalysisDashboard({
  analysis,
  isLoading,
  error,
  onEntityClick,
  onArticleClick,
  onRetry,
  onYearRangeChange,
}) {
  if (isLoading && !analysis) {
    return (
      <div className="analysis-state">
        <Spinner animation="border" size="sm" />
        <span>Loading analysis dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="analysis-alert">
        <div className="d-flex align-items-start gap-2">
          <Icon icon="lucide:alert-circle" width="18" className="mt-1" />
          <div>
            <strong>Unable to load analysis</strong>
            <div>{error}</div>
            {onRetry && (
              <Button variant="outline-danger" size="sm" className="mt-2" onClick={onRetry}>
                Try again
              </Button>
            )}
          </div>
        </div>
      </Alert>
    );
  }

  if (isAnalysisCohortEmpty(analysis)) {
    return (
      <div className="analysis-state empty">
        <Icon icon="lucide:bar-chart-3" width="28" />
        <strong>No analysis cohort found</strong>
        <span>Try broadening the search or removing a filter.</span>
      </div>
    );
  }

  const years = analysis.window?.years || [];
  const citationCoverage = analysis.citations_over_time?.[0];
  const citationCoverageLabel = citationCoverage
    ? `${fmt(citationCoverage.total_articles_with_history)} articles with citation history`
    : 'Citation-history coverage unavailable';

  return (
    <div className="analysis-dashboard">
      <AnalysisSummary
        summary={analysis.summary}
        window={analysis.window}
        onYearRangeChange={onYearRangeChange}
      />
      <div className="analysis-chart-grid">
        <AnalysisTimeSeriesChart
          title="Works over time"
          description="Zero-filled publication counts across the backend window."
          years={years}
          rows={analysis.works_over_time}
          valueKey="count"
          color="#1976D2"
        />
        <AnalysisTimeSeriesChart
          title="Citations over time"
          description="Only valid imported citation-history years are counted."
          years={years}
          rows={analysis.citations_over_time}
          valueKey="citations"
          coverageLabel={citationCoverageLabel}
          color="#00838f"
        />
      </div>
      <AnalysisEntityPanel top={analysis.top} growth={analysis.growth} onEntityClick={onEntityClick} />
      <AnalysisTrendingArticles
        articles={analysis.trending_articles}
        coverage={analysis.trending_article_coverage}
        onArticleClick={onArticleClick}
      />
    </div>
  );
}
