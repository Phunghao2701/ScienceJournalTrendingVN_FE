import assert from 'node:assert/strict';
import {
  TRENDING_VIEW_MODES,
  buildTrendingViewSearchParams,
  normalizeTrendingView,
  buildClearedTrendingSearchParams,
  buildFilterUpdateSearchParams,
  buildLegacyReturnToFromFilters,
  buildExactReturnToPath,
  resolveInstitutionDisplayName,
  resolveInstitutionSearchMatch,
} from '../src/features/trendingVN/utils/trendingViewParams.js';
import {
  buildPaperVnAnalysisParams,
  formatGrowthRate,
  mapPaperVnAnalysisResponse,
  computeYearChartLayout,
  isAnalysisCohortEmpty,
} from '../src/features/trendingVN/utils/paperVnAnalysis.js';

const test = (name, fn) => {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
};

test('invalid view falls back to canonical list', () => {
  assert.equal(normalizeTrendingView('grid'), TRENDING_VIEW_MODES.LIST);
});

test('list view removes the view query parameter while preserving filters', () => {
  const params = buildTrendingViewSearchParams('search=ai&year=2024&page=3&view=analysis', 'list');
  assert.equal(params.get('search'), 'ai');
  assert.equal(params.get('year'), '2024');
  assert.equal(params.has('view'), false);
});

test('analysis switch preserves filters and removes pagination', () => {
  const params = buildTrendingViewSearchParams('search=ai&journal_id=42&page=3&view=table', 'analysis');
  assert.equal(params.get('view'), 'analysis');
  assert.equal(params.get('search'), 'ai');
  assert.equal(params.get('journal_id'), '42');
  assert.equal(params.has('page'), false);
});

test('analysis params use scope, omit list-only params, and let explicit range suppress publication_year', () => {
  const params = buildPaperVnAnalysisParams({
    search: 'machine learning',
    page: 5,
    limit: 10,
    sortBy: 'created_at',
    sortOrder: 'desc',
    selectedYear: '2024',
    fromYear: '2021',
    toYear: '2024',
    selectedAccess: 'open',
  });

  assert.equal(params.scope, 'vn_universities');
  assert.equal(Object.hasOwn(params, 'publication_year'), false);
  assert.equal(params.from_year, '2021');
  assert.equal(params.to_year, '2024');
  assert.equal(params.access, 'oa');
  assert.equal(Object.hasOwn(params, 'page'), false);
  assert.equal(Object.hasOwn(params, 'sortBy'), false);
  assert.equal(Object.hasOwn(params, 'sortOrder'), false);
});

test('growth rate decimal is formatted as percentage', () => {
  assert.equal(formatGrowthRate(1.5), '150%');
  assert.equal(formatGrowthRate(null), 'New');
});

test('analysis mapper normalizes missing arrays and numeric strings', () => {
  const mapped = mapPaperVnAnalysisResponse({
    summary: { scholarly_works: '12' },
    top: { institutions: [{ entity_id: '1', display_name: 'FPT', current_count: '8' }] },
  });

  assert.equal(mapped.summary.scholarly_works, 12);
  assert.deepEqual(mapped.growth.authors, []);
  assert.equal(mapped.top.institutions[0].current_count, 8);
});

// --- FE-FIX-01: regression tests for known consistency gaps (expected red until fixed) ---

test('[FE-FIX-02] clearing filters from Analysis preserves view=analysis', () => {
  const params = buildClearedTrendingSearchParams(TRENDING_VIEW_MODES.ANALYSIS);
  assert.equal(params.get('view'), TRENDING_VIEW_MODES.ANALYSIS);
  assert.equal(params.has('page'), false);
});

test('[FE-FIX-02] clearing filters from Table preserves view=table', () => {
  const params = buildClearedTrendingSearchParams(TRENDING_VIEW_MODES.TABLE);
  assert.equal(params.get('view'), TRENDING_VIEW_MODES.TABLE);
});

test('[FE-FIX-02] clearing filters from List returns canonical empty params', () => {
  const params = buildClearedTrendingSearchParams(TRENDING_VIEW_MODES.LIST);
  assert.equal(params.has('view'), false);
  assert.equal(params.toString(), '');
});

test('[FE-FIX-02] updating a filter in Analysis never adds page', () => {
  const params = buildFilterUpdateSearchParams(
    'view=analysis&journal_id=1',
    { institution_id: '42' },
    TRENDING_VIEW_MODES.ANALYSIS
  );
  assert.equal(params.has('page'), false);
  assert.equal(params.get('institution_id'), '42');
  assert.equal(params.get('view'), TRENDING_VIEW_MODES.ANALYSIS);
});

test('[FE-FIX-02] updating a filter in Table resets page to 1', () => {
  const params = buildFilterUpdateSearchParams(
    'view=table&page=3',
    { institution_id: '42' },
    TRENDING_VIEW_MODES.TABLE
  );
  assert.equal(params.get('page'), '1');
});

test('[FE-FIX-03] returnTo equals the exact current pathname and search', () => {
  const pathname = '/trending-vn';
  const search = '?view=table&search=ai&page=2';
  assert.equal(buildExactReturnToPath(pathname, search), `${pathname}${search}`);
});

test('[FE-FIX-03] legacy filter-derived returnTo diverges from the exact path (documents the closed bug)', () => {
  const pathname = '/trending-vn';
  const search = '?view=table&search=ai&page=2';
  const legacy = buildLegacyReturnToFromFilters(pathname, search, {
    search: 'ai',
    page: 2,
    limit: 10,
    sortBy: 'created_at',
    sortOrder: 'desc',
    selectedYear: 'all',
    selectedJournal: 'all',
    selectedInstitution: 'all',
    selectedPublisher: 'all',
    selectedAuthor: 'all',
    selectedTopic: 'all',
    selectedKeyword: 'all',
    selectedAccess: 'all',
    fromYear: '',
    toYear: '',
  });
  assert.notEqual(legacy, buildExactReturnToPath(pathname, search));
});

test('[FE-FIX-04] explicit from_year and to_year suppress publication_year', () => {
  const params = buildPaperVnAnalysisParams({
    selectedYear: '2024',
    fromYear: '2021',
    toYear: '2024',
  });

  assert.equal(Object.hasOwn(params, 'publication_year'), false);
  assert.equal(params.from_year, '2021');
  assert.equal(params.to_year, '2024');
});

test('[FE-FIX-04] publication_year applies when no explicit range is set', () => {
  const params = buildPaperVnAnalysisParams({ selectedYear: '2024' });
  assert.equal(params.publication_year, '2024');
  assert.equal(Object.hasOwn(params, 'from_year'), false);
  assert.equal(Object.hasOwn(params, 'to_year'), false);
});

test('[FE-FIX-05] long year range chart layout stays within the SVG viewport', () => {
  const yearCounts = Array.from({ length: 20 }, (_, idx) => ({ year: String(2005 + idx), count: idx + 1 }));
  const layout = computeYearChartLayout(yearCounts);
  assert.equal(layout.overflowsViewport, false);
});

test('[FE-FIX-05] dashboard renders when trending coverage exists despite zero scholarly works', () => {
  const analysis = {
    summary: { scholarly_works: 0 },
    trending_article_coverage: { total_articles: 5, eligible_articles: 5 },
  };
  assert.equal(isAnalysisCohortEmpty(analysis), false);
});

test('[FE-FIX-05] dashboard reports empty when no scholarly works and no trending coverage', () => {
  const analysis = {
    summary: { scholarly_works: 0 },
    trending_article_coverage: { total_articles: 0, eligible_articles: 0 },
  };
  assert.equal(isAnalysisCohortEmpty(analysis), true);
});

test('[FE-INST-REL-01] updating institution_id without a name drops any stale institution_name', () => {
  const params = buildFilterUpdateSearchParams('institution_id=9&institution_name=Old+University', { selectedInstitution: 30 }, 'list');
  assert.equal(params.get('institution_id'), '30');
  assert.equal(params.has('institution_name'), false);
});

test('[FE-INST-REL-01] updating institution_id together with institutionName keeps both in sync', () => {
  const params = buildFilterUpdateSearchParams('', { selectedInstitution: 30, institutionName: 'FPT University' }, 'list');
  assert.equal(params.get('institution_id'), '30');
  assert.equal(params.get('institution_name'), 'FPT University');
});

test('[FE-INST-REL-01] clearing institution_id (all) also clears institution_name', () => {
  const params = buildFilterUpdateSearchParams('institution_id=30&institution_name=FPT+University', { selectedInstitution: 'all' }, 'list');
  assert.equal(params.has('institution_id'), false);
  assert.equal(params.has('institution_name'), false);
});

test('[FE-INST-REL-02] resolveInstitutionDisplayName prefers the URL institution_name metadata', () => {
  const name = resolveInstitutionDisplayName('30', 'FPT University', [{ id: '30', display_name: 'Wrong Name' }]);
  assert.equal(name, 'FPT University');
});

test('[FE-INST-REL-02] resolveInstitutionDisplayName falls back to a matching analytics row when no URL metadata', () => {
  const name = resolveInstitutionDisplayName('30', '', [{ id: '30', display_name: 'FPT University' }]);
  assert.equal(name, 'FPT University');
});

test('[FE-INST-REL-02] resolveInstitutionDisplayName returns empty string when nothing matches', () => {
  assert.equal(resolveInstitutionDisplayName('30', '', []), '');
  assert.equal(resolveInstitutionDisplayName('all', '', []), '');
  assert.equal(resolveInstitutionDisplayName('', '', []), '');
});

test('[FE-INST-REL-10] resolveInstitutionSearchMatch matches a partial name case-insensitively', () => {
  const match = resolveInstitutionSearchMatch('fpt', [{ id: '30', display_name: 'FPT University' }]);
  assert.deepEqual(match, { id: '30', name: 'FPT University' });
});

test('[FE-INST-REL-10] resolveInstitutionSearchMatch matches when the full display_name is entered', () => {
  const match = resolveInstitutionSearchMatch('FPT University', [{ id: '30', display_name: 'FPT University' }]);
  assert.deepEqual(match, { id: '30', name: 'FPT University' });
});

test('[FE-INST-REL-10] resolveInstitutionSearchMatch returns null when nothing matches (falls through to text search)', () => {
  assert.equal(resolveInstitutionSearchMatch('quantum computing', [{ id: '30', display_name: 'FPT University' }]), null);
});

test('[FE-INST-REL-10] resolveInstitutionSearchMatch returns null for an empty query or empty list', () => {
  assert.equal(resolveInstitutionSearchMatch('', [{ id: '30', display_name: 'FPT University' }]), null);
  assert.equal(resolveInstitutionSearchMatch('fpt', []), null);
  assert.equal(resolveInstitutionSearchMatch('fpt', undefined), null);
});
