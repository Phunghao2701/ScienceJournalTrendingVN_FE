import { buildPaperVnDiscoveryParams } from '../../article/utils/paperVnDiscoveryParams.js';

const ANALYSIS_ENTITY_GROUPS = ['institutions', 'authors', 'journals', 'topics', 'keywords'];

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === '') return fallback;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const normalizeEntityRows = (value) => {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => ({
    ...item,
    rank: toNumber(item.rank, index + 1),
    entity_id: item.entity_id ?? item.id ?? null,
    display_name: item.display_name || item.name || 'Unknown',
    current_count: toNumber(item.current_count),
    previous_count: toNumber(item.previous_count),
    absolute_growth: toNumber(item.absolute_growth),
    growth_rate: item.growth_rate === null || item.growth_rate === undefined ? null : toNumber(item.growth_rate),
  }));
};

const normalizeEntityGroup = (group = {}) => {
  return ANALYSIS_ENTITY_GROUPS.reduce((acc, key) => {
    acc[key] = normalizeEntityRows(group[key]);
    return acc;
  }, {});
};

const normalizeSummary = (summary = {}) => ({
  scholarly_works: toNumber(summary.scholarly_works),
  total_citations: toNumber(summary.total_citations),
  total_references: toNumber(summary.total_references),
  available_citing_works: toNumber(summary.available_citing_works),
  available_references: toNumber(summary.available_references),
  authors: toNumber(summary.authors),
  institutions: toNumber(summary.institutions),
  journals: toNumber(summary.journals),
  open_access_works: toNumber(summary.open_access_works),
  closed_access_works: toNumber(summary.closed_access_works),
  oa_unavailable_works: toNumber(summary.oa_unavailable_works),
});

const normalizeWindow = (window = {}) => ({
  current: {
    from_year: toNumber(window.current?.from_year, null),
    to_year: toNumber(window.current?.to_year, null),
  },
  comparison: {
    from_year: toNumber(window.comparison?.from_year, null),
    to_year: toNumber(window.comparison?.to_year, null),
  },
  years: Array.isArray(window.years) ? window.years.map((year) => toNumber(year)).filter(Boolean) : [],
  mode: window.mode || 'unknown',
});

const normalizeWorksOverTime = (value) => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => ({
    year: toNumber(item.year, null),
    count: toNumber(item.count),
  })).filter((item) => item.year !== null);
};

const normalizeCitationsOverTime = (value) => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => ({
    year: toNumber(item.year, null),
    citations: toNumber(item.citations),
    coverage_articles: toNumber(item.coverage_articles),
    total_articles_with_history: toNumber(item.total_articles_with_history),
  })).filter((item) => item.year !== null);
};

const normalizeTrendingArticles = (value) => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => ({
    ...item,
    article_id: item.article_id ?? item.id ?? null,
    title: item.title || 'Untitled Article',
    publication_year: toNumber(item.publication_year, null),
    citation_count: toNumber(item.citation_count),
    reference_count: toNumber(item.reference_count),
    current_citations: toNumber(item.current_citations),
    previous_citations: toNumber(item.previous_citations),
    absolute_growth: toNumber(item.absolute_growth),
    growth_rate: item.growth_rate === null || item.growth_rate === undefined ? null : toNumber(item.growth_rate),
  }));
};

export const buildPaperVnAnalysisParams = (filters = {}) => {
  const params = buildPaperVnDiscoveryParams(filters);
  delete params.page;
  delete params.sortBy;
  delete params.sortOrder;
  // Explicit from_year/to_year define the analysis window and take precedence over
  // publication_year — sending both produces contradictory filter semantics (FE-FIX-04).
  if (params.from_year && params.to_year) {
    delete params.publication_year;
  }
  return params;
};

// Powers the List/Table sidebar publication-year SVG bar chart in TrendingVNPage.jsx.
// Column width/gap shrink to fit `yearCounts.length` columns inside the viewport
// (minus symmetric start/end padding) instead of staying fixed-width and clipping
// for long year ranges (FE-FIX-05).
export const computeYearChartLayout = (yearCounts, { colWidth = 16, gap = 6, startX = 14, viewportWidth = 200 } = {}) => {
  const count = yearCounts.length;
  const availableWidth = Math.max(viewportWidth - startX * 2, colWidth);
  const idealSlot = colWidth + gap;
  const slot = count > 0 ? Math.min(idealSlot, availableWidth / count) : idealSlot;
  const scale = idealSlot > 0 ? slot / idealSlot : 1;
  const effectiveColWidth = colWidth * scale;
  const effectiveGap = gap * scale;
  const columns = yearCounts.map((item, idx) => ({
    year: item.year,
    count: item.count,
    x: startX + idx * (effectiveColWidth + effectiveGap),
    width: effectiveColWidth,
  }));
  const lastX = columns.length ? columns[columns.length - 1].x + effectiveColWidth : startX;
  return {
    columns,
    colWidth: effectiveColWidth,
    contentWidth: lastX,
    overflowsViewport: lastX > viewportWidth,
  };
};

// Mirrors AnalysisDashboard's empty-state gate. The dashboard still has content to
// render (trending articles, citation history) when a trending/citation cohort exists
// even if the current-window scholarly_works count is zero (FE-FIX-05).
export const isAnalysisCohortEmpty = (analysis) => {
  if (!analysis) return true;
  const hasScholarlyWorks = analysis.summary?.scholarly_works > 0;
  const hasTrendingCohort = analysis.trending_article_coverage?.total_articles > 0;
  return !hasScholarlyWorks && !hasTrendingCohort;
};

export const formatGrowthRate = (value) => {
  if (value === null || value === undefined) return 'New';
  const percent = Number(value) * 100;
  if (!Number.isFinite(percent)) return 'N/A';
  return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(percent)}%`;
};

export const mapPaperVnAnalysisResponse = (payload = {}) => ({
  scope: payload.scope || 'vn_universities',
  window: normalizeWindow(payload.window),
  summary: normalizeSummary(payload.summary),
  works_over_time: normalizeWorksOverTime(payload.works_over_time),
  citations_over_time: normalizeCitationsOverTime(payload.citations_over_time),
  top: normalizeEntityGroup(payload.top),
  growth: normalizeEntityGroup(payload.growth),
  trending_articles: normalizeTrendingArticles(payload.trending_articles),
  trending_article_coverage: {
    eligible_articles: toNumber(payload.trending_article_coverage?.eligible_articles),
    total_articles: toNumber(payload.trending_article_coverage?.total_articles),
  },
});
