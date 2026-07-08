import { useEffect, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import SearchToolbar from '../components/SearchToolbar';
import { FilterSidebar } from '../components/FilterSidebar';
import { ResultsList } from '../components/ResultsList';
import { AnalysisPreview } from '../components/AnalysisPreview';
import AnalysisView from '../components/analysis/AnalysisView';
import Footer from '../components/Footer';
import { useScholarFilters } from '../hooks/useScholarFilters';
import { useScholarSearch } from '../hooks/useScholarSearch';
import { useScholarAnalytics } from '../hooks/useScholarAnalytics';
import { buildPaperVnQueryFilters } from '../../article/utils/paperVnDiscoveryParams';
import {
  TRENDING_VIEW_MODES,
  getTrendingViewFromParams,
  buildTrendingViewSearchParams,
  buildFilterUpdateSearchParams,
  buildClearedTrendingSearchParams,
  shouldCanonicalizeTrendingView,
  buildExactReturnToPath
} from '../../trendingVN/utils/trendingViewParams';

// Matches the clone's original starting ISSN value/sort — applied only when the
// URL doesn't already specify search/sortBy, so deep links always win.
const DEFAULT_SEARCH = 'source.issn:"26159570"';
const DEFAULT_SORT_BY = 'publication_date';
const DEFAULT_SORT_ORDER = 'desc';

const DATE_RANGE_OPTIONS = {
  'Last 12 Months': { start: '2025', end: '2026' },
  'Last 3 Years': { start: '2024', end: '2026' },
  'Last 5 Years': { start: '2022', end: '2026' },
  'Custom Range...': { start: '2016', end: '2026' }
};

const CATEGORY_FIELD_MAP = {
  author: 'selectedAuthor',
  institution: 'selectedInstitution',
  journal: 'selectedJournal',
  publisher: 'selectedPublisher',
  subjectMatter: 'selectedTopic'
};

const ANALYSIS_SECTION_IDS = {
  institutions: 'analysis-entity-rankings',
  topics: 'analysis-entity-rankings',
  summary: 'analysis-summary-cards'
};

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const returnTo = buildExactReturnToPath(location.pathname, location.search);

  // Canonicalize unknown `view` values, same as trendingVN
  useEffect(() => {
    if (shouldCanonicalizeTrendingView(searchParams)) {
      setSearchParams(buildTrendingViewSearchParams(searchParams, TRENDING_VIEW_MODES.LIST), { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const viewMode = getTrendingViewFromParams(searchParams);
  const isAnalysisView = viewMode === TRENDING_VIEW_MODES.ANALYSIS;

  // 1. Filters/search/sort/page — all state lives in the URL (shareable, bookmarkable)
  const filters = useMemo(() => {
    const parsed = buildPaperVnQueryFilters(searchParams);
    if (!searchParams.get('search')) parsed.search = DEFAULT_SEARCH;
    if (!searchParams.get('sortBy')) {
      parsed.sortBy = DEFAULT_SORT_BY;
      parsed.sortOrder = DEFAULT_SORT_ORDER;
    }
    return parsed;
  }, [searchParams]);

  // 2. Fetch search options checklist dynamically
  const {
    authorOptions,
    institutionOptions,
    journalOptions,
    topicOptions,
    publisherOptions
  } = useScholarFilters();

  const dynamicOptions = useMemo(() => ({
    authorOptions,
    institutionOptions,
    journalOptions,
    topicOptions,
    publisherOptions
  }), [authorOptions, institutionOptions, journalOptions, topicOptions, publisherOptions]);

  // 3. Fetch search results from backend API (disabled while in Analysis view, same as trendingVN)
  const {
    items,
    totalItems,
    stats,
    isLoading: isSearchLoading,
    error: searchError,
    refetch: refetchSearch
  } = useScholarSearch(filters, { enabled: !isAnalysisView });

  // 4. Fetch search statistics analytics (disabled while in Analysis view)
  const {
    analytics,
    isLoading: isAnalyticsLoading,
    error: analyticsError
  } = useScholarAnalytics(filters, { enabled: !isAnalysisView });

  // 5. Top stat segment bar — Article Records / Open Access / Authors / Topics
  const statSegments = useMemo(() => {
    const analyticsTotals = analytics?.totals || {};
    return [
      {
        key: 'articleRecords',
        label: 'Article Records',
        color: '#00acc1',
        value: stats.totalArticles || totalItems,
        isLoading: isSearchLoading
      },
      {
        key: 'openAccess',
        label: 'Open Access',
        color: '#0288d1',
        value: Number(stats.openAccessCount || 0),
        isLoading: isSearchLoading
      },
      {
        key: 'authors',
        label: 'Authors',
        color: '#7b1fa2',
        value: Number(analyticsTotals.authors ?? analyticsTotals.author_count ?? analyticsTotals.authorsCount ?? stats.authorsCount ?? 0),
        isLoading: isAnalyticsLoading
      },
      {
        key: 'topics',
        label: 'Topics',
        color: '#475569',
        value: Number(analyticsTotals.topics ?? analyticsTotals.topic_count ?? analyticsTotals.topicsCount ?? stats.topicsCount ?? 0),
        isLoading: isAnalyticsLoading
      }
    ];
  }, [stats, totalItems, analytics, isSearchLoading, isAnalyticsLoading]);

  // Update filters in the URL — mirrors trendingVN's useArticleList.updateFilters
  const updateFilters = (newFilters) => {
    setSearchParams(buildFilterUpdateSearchParams(searchParams, newFilters, viewMode));
  };

  const clearFilters = () => {
    setSearchParams(buildClearedTrendingSearchParams(viewMode));
  };

  const handleViewChange = (nextView) => {
    setSearchParams(buildTrendingViewSearchParams(searchParams, nextView));
  };

  const handleOpenAnalysis = (section) => {
    setSearchParams(buildTrendingViewSearchParams(searchParams, TRENDING_VIEW_MODES.ANALYSIS));
    const targetId = ANALYSIS_SECTION_IDS[section];
    if (targetId) {
      window.setTimeout(() => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  };

  // Toggle single filter option — single-select per category (matches backend, which
  // only accepts one id per filter dimension; clicking an active option clears it)
  const handleFilterToggle = (categoryId, optionValue) => {
    if (categoryId === 'dateRange') {
      const range = DATE_RANGE_OPTIONS[optionValue];
      const isSameRange = filters.fromYear === range?.start && filters.toYear === range?.end;
      updateFilters(isSameRange ? { fromYear: '', toYear: '' } : { fromYear: range.start, toYear: range.end });
      return;
    }

    if (categoryId === 'openAccess') {
      updateFilters({ selectedAccess: filters.selectedAccess === 'oa' ? 'all' : 'oa' });
      return;
    }

    const field = CATEGORY_FIELD_MAP[categoryId];
    if (!field) return;
    const isSame = filters[field] && filters[field] !== 'all' && String(filters[field]) === String(optionValue);
    updateFilters({ [field]: isSame ? 'all' : optionValue });
  };

  const hasError = searchError || analyticsError;
  const errorMessage = searchError || analyticsError || '';

  return (
    <div className="trendingvnclone-page min-h-screen bg-white flex flex-col font-sans select-none antialiased">
      {/* 1. Global Navigation Header */}
      <Header />

      {/* 2. Search Toolbar, Query & Metrics strip */}
      <SearchToolbar
        searchTerm={filters.search}
        setSearchTerm={(term) => updateFilters({ search: term })}
        totalWorks={totalItems}
        statSegments={statSegments}
      />

      {/* 3. Main Workspace Container */}
      <div className="flex-grow flex relative w-full max-w-[1440px] mx-auto items-stretch">
        {/* Left Sidebars: Tab rail & Accordion Filters */}
        <FilterSidebar
          selectedFilters={filters}
          onFilterToggle={handleFilterToggle}
          activeItems={items}
          dynamicOptions={dynamicOptions}
          analytics={analytics}
          onOpenAnalysis={handleOpenAnalysis}
          onClearFilters={clearFilters}
        />

        {/* Right content workspace: Results list + Preview Panel */}
        <div className="flex-grow flex flex-col lg:flex-row items-stretch min-w-0">
          {/* Main Results Column */}
          {hasError ? (
            <div className="flex-grow p-8 flex flex-col items-center justify-center bg-gray-50 border-r border-[#D8E7F4]">
              <div className="text-red-500 font-semibold mb-4 text-center">
                Đã xảy ra lỗi khi tìm kiếm bài viết: {errorMessage}
              </div>
              <button
                onClick={() => refetchSearch()}
                className="px-4 py-2 bg-lens-link-blue text-white rounded font-medium hover:bg-lens-link-blue/90 cursor-pointer"
              >
                Thử lại
              </button>
            </div>
          ) : isAnalysisView ? (
            <AnalysisView
              filters={filters}
              onEntityFilter={(field, value) => updateFilters({ [field]: value })}
            />
          ) : (
            <ResultsList
              items={items}
              totalItems={totalItems}
              sortBy={filters.sortBy}
              sortOrder={filters.sortOrder}
              onSortChange={(nextSortBy, nextSortOrder) => updateFilters({ sortBy: nextSortBy, sortOrder: nextSortOrder })}
              currentPage={filters.page}
              onPageChange={(page) => updateFilters({ page })}
              pageSize={filters.limit}
              onPageSizeChange={(limit) => updateFilters({ limit, page: 1 })}
              isLoading={isSearchLoading}
              viewMode={viewMode}
              onViewChange={handleViewChange}
              searchState={filters}
              returnTo={returnTo}
            />
          )}

          {/* Right Preview & Widgets Column — hidden in Analysis, same as trendingVN */}
          {!isAnalysisView && (
            <AnalysisPreview
              activeItems={items}
              analytics={analytics}
              selectedFilters={filters}
              onFilterToggle={handleFilterToggle}
            />
          )}
        </div>
      </div>

      {/* 4. Global Footer */}
      <Footer />
    </div>
  );
}
