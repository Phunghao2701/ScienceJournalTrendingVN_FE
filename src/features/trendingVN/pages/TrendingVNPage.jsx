/**
 *
 * File: features\trendingVN\pages\TrendingVNPage.jsx
 */

import { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Form, Button, Badge, Collapse, Modal, Dropdown } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../../landing/components/Header';
import useArticleList from '../../article/hooks/useArticleList';
import useArticleAnalytics from '../../article/hooks/useArticleAnalytics';
import useArticleEntityLabels from '../../article/hooks/useArticleEntityLabels';
import useArticleAnalysis from '../hooks/useArticleAnalysis';
import ArticleTable from '../../article/components/ArticleTable';
import AdminPagination from '../../../shared/components/Pagination';
import PublisherGrid from '../components/PublisherGrid';
import TrendingArticleCard from '../components/TrendingArticleCard';
import AnalysisDashboard from '../components/analysis/AnalysisDashboard';
import { toast } from '../../../shared/utils/toast';
import { toScientificPlainText } from '../../../shared/utils/scientificMath';
import { useAuthStore } from '../../../app/store/authStore';
import { useTrendingFilters } from '../hooks/useTrendingFilters';
import {
  TRENDING_VIEW_MODES,
  buildTrendingViewSearchParams,
  getTrendingViewFromParams,
  shouldCanonicalizeTrendingView,
  buildExactReturnToPath,
} from '../utils/trendingViewParams';
import { computeYearChartLayout } from '../utils/paperVnAnalysis';
import '../trendingVN.css';

export default function TrendingVNPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const viewMode = getTrendingViewFromParams(searchParams);
  const isAnalysisView = viewMode === TRENDING_VIEW_MODES.ANALYSIS;
  const [activeLeftTab, setActiveLeftTab] = useState(null); // 'filters', 'profile', 'info', 'more'
  const [activeTooltip, setActiveTooltip] = useState(null); // { name, count, x, y }

  const {
    articles,
    total,
    currentPage,
    totalPages,
    isLoading,
    error,
    stats,
    filters,
    updateFilters,
    clearFilters,
    handlePageChange,
  } = useArticleList({ enabled: !isAnalysisView });
  const {
    analytics,
    isLoading: isAnalyticsLoading,
    error: analyticsError,
  } = useArticleAnalytics(filters, { enabled: !isAnalysisView });
  const {
    analysis,
    isLoading: isAnalysisLoading,
    error: analysisError,
    refetch: refetchAnalysis,
  } = useArticleAnalysis(filters, { enabled: isAnalysisView });
  const entityLabels = useArticleEntityLabels(filters);

  const buildResultsReturnPath = () => buildExactReturnToPath(location.pathname, location.search);

  const handleDetailClick = (id) => {
    const returnTo = buildResultsReturnPath();
    navigate(`/trending/articles/${id}?returnTo=${encodeURIComponent(returnTo)}`, {
      state: {
        fromTrendingResults: returnTo,
        resultCount: activeResultTotal,
        activeFilterCount: activeChips.length,
        query: filters.search,
      },
    });
  };

  const showSidebar = !isAnalysisView;
  const [expandedAbstracts, setExpandedAbstracts] = useState({});
  const [allExpanded, setAllExpanded] = useState(false);          // Toggle táº¥t cáº£ abstract
  const [showCustomise, setShowCustomise] = useState(false);

  const [showSaveQueryModal, setShowSaveQueryModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [groupingMode, setGroupingMode] = useState('none'); // 'none', 'simple-group', 'simple-expand', 'extended-group', 'extended-expand'

  const [queryTitle, setQueryTitle] = useState('');
  const [queryDesc, setQueryDesc] = useState('');
  const [queryNotify, setQueryNotify] = useState(false);
  const [queryEmailAlerts, setQueryEmailAlerts] = useState(false);
  const [queryAccess, setQueryAccess] = useState('restricted'); // 'restricted' hoáº·c 'public'

  const [exportDocCount, setExportDocCount] = useState(10);
  const [exportFormat, setExportFormat] = useState('CSV');
  const [exportFileName, setExportFileName] = useState('articles-export');
  const [exportFields, setExportFields] = useState({
    title: true,
    authors: true,
    journal: true,
    doi: true,
    issn: true,
    keywords: true,
    citations: true,
    year: true,
  });

  const [visibleColumns, setVisibleColumns] = useState({
    doi: true,
    authors: true,
    article: true,
    journal: true,
    keywords: false,
    issn: false,
  });

  const toggleColumn = (key) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const [localSearchInput, setLocalSearchInput] = useState(filters.search);

  useEffect(() => {
    if (shouldCanonicalizeTrendingView(searchParams)) {
      setSearchParams(buildTrendingViewSearchParams(searchParams, TRENDING_VIEW_MODES.LIST), { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    setLocalSearchInput(filters.search);
  }, [filters.search]);

  const { journalOptions, topicOptions } = useTrendingFilters();

  const toggleAbstract = (id) => {
    setExpandedAbstracts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleAllAbstracts = () => {
    const nextState = !allExpanded;
    setAllExpanded(nextState);
    const newExpanded = {};
    if (nextState) {
      articles.forEach(art => { newExpanded[art.article_id] = true; });
    }
    setExpandedAbstracts(newExpanded);
  };

  const handleCopyDoi = (e, doi) => {
    e.stopPropagation();
    if (!doi) return;
    navigator.clipboard.writeText(doi);
  };

  const handleSaveQuery = (e) => {
    e.preventDefault();
    if (!queryTitle.trim()) {
      toast.error('Please enter a query title');
      return;
    }

    const newQuery = {
      id: Date.now(),
      title: queryTitle.trim(),
      description: queryDesc.trim(),
      notify: queryNotify,
      emailAlerts: queryEmailAlerts,
      access: queryAccess,
      filters: { ...filters },
      savedAt: new Date().toISOString()
    };

    try {
      const storageKey = 'saved_search_queries';
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
      localStorage.setItem(storageKey, JSON.stringify([...existing, newQuery]));
      
      toast.success('Query saved successfully');
      setShowSaveQueryModal(false);
      setQueryTitle('');
      setQueryDesc('');
      setQueryNotify(false);
      setQueryEmailAlerts(false);
    } catch (err) {
      console.error('Unable to save query:', err);
      toast.error('Unable to save query');
    }
  };

  const handleExportSubmit = (e) => {
    e.preventDefault();
    
    const docsToExport = articles.slice(0, Math.min(exportDocCount, articles.length));
    if (docsToExport.length === 0) {
      toast.warning('There are no articles to export');
      return;
    }

    let fileContent;
    let mimeType;
    const fileExtension = exportFormat.toLowerCase();

    if (exportFormat === 'CSV') {
      mimeType = 'text/csv;charset=utf-8;';
      const csvEscape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
      
      const selectedHeaders = [];
      if (exportFields.title) selectedHeaders.push('Title');
      if (exportFields.authors) selectedHeaders.push('Authors');
      if (exportFields.journal) selectedHeaders.push('Journal');
      if (exportFields.doi) selectedHeaders.push('DOI');
      if (exportFields.issn) selectedHeaders.push('ISSN');
      if (exportFields.keywords) selectedHeaders.push('Keywords/Topic');
      if (exportFields.citations) selectedHeaders.push('Citations');
      if (exportFields.year) selectedHeaders.push('Publication Year');

      const csvRows = [selectedHeaders.join(',')];

      docsToExport.forEach(art => {
        const row = [];
        if (exportFields.title) row.push(csvEscape(art.title_plain || toScientificPlainText(art.title)));
        if (exportFields.authors) {
          const authorNames = (art.authors || []).map(au => au.display_name || au.name).join('; ');
          row.push(csvEscape(authorNames));
        }
        if (exportFields.journal) row.push(csvEscape(art.journal_name));
        if (exportFields.doi) row.push(csvEscape(art.doi));
        if (exportFields.issn) row.push(csvEscape(art.journal_issn));
        if (exportFields.keywords) row.push(csvEscape(art.primary_topic));
        if (exportFields.citations) row.push(art.citation_count || 0);
        if (exportFields.year) row.push(art.publication_year || '');
        csvRows.push(row.join(','));
      });

      fileContent = csvRows.join('\n');
    } else {
      mimeType = 'application/json;charset=utf-8;';
      const jsonList = docsToExport.map(art => {
        const item = {};
        if (exportFields.title) item.title = art.title_plain || toScientificPlainText(art.title);
        if (exportFields.authors) item.authors = (art.authors || []).map(au => au.display_name || au.name);
        if (exportFields.journal) item.journal = art.journal_name;
        if (exportFields.doi) item.doi = art.doi;
        if (exportFields.issn) item.issn = art.journal_issn;
        if (exportFields.keywords) item.topic = art.primary_topic;
        if (exportFields.citations) item.citations = art.citation_count || 0;
        if (exportFields.year) item.publication_year = art.publication_year;
        return item;
      });
      fileContent = JSON.stringify(jsonList, null, 2);
    }

    try {
      const blob = new Blob([fileContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${exportFileName || 'export'}.${fileExtension}`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Data exported successfully');
      setShowExportModal(false);
    } catch (err) {
      console.error('Unable to export file:', err);
      toast.error('Data export failed');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ search: localSearchInput });
  };

  const handleClearSearch = () => {
    setLocalSearchInput('');
    updateFilters({ search: '' });
  };

  const handleViewChange = (nextView) => {
    setSearchParams(buildTrendingViewSearchParams(searchParams, nextView));
  };

  // Mirrors buildPaperVnAnalysisParams precedence: an explicit from/to range suppresses
  // publication_year in the actual Analysis request, so the chip must reflect that instead
  // of showing both (FE-FIX-04 — no contradictory chips).
  const hasExplicitYearRange = Boolean(filters.fromYear && filters.toYear);
  const suppressYearChip = isAnalysisView && hasExplicitYearRange;

  const activeChips = (() => {
    const chips = [];
    if (filters.search) {
      chips.push({ key: 'search', label: `${t('search')}: "${filters.search}"`, value: '' });
    }
    if (filters.selectedYear && filters.selectedYear !== 'all' && !suppressYearChip) {
      chips.push({ key: 'year', label: `${t('publicationYear')}: ${filters.selectedYear}`, value: 'all' });
    }
    if (hasExplicitYearRange) {
      chips.push({
        key: 'yearRange',
        label: `${t('publicationYear')}: ${filters.fromYear}–${filters.toYear}`,
        value: 'all',
        onRemove: () => updateFilters({ fromYear: '', toYear: '' }),
      });
    }
    if (filters.selectedJournal && filters.selectedJournal !== 'all') {
      const jName = journalOptions.find(j => String(j.journal_id) === String(filters.selectedJournal))?.display_name || `Journal #${filters.selectedJournal}`;
      chips.push({ key: 'selectedJournal', label: `${t('journalLabel')}: ${jName}`, value: 'all' });
    }
    if (filters.selectedInstitution && filters.selectedInstitution !== 'all') {
      chips.push({ key: 'selectedInstitution', label: `Institution #${filters.selectedInstitution}`, value: 'all' });
    }
    if (filters.selectedPublisher && filters.selectedPublisher !== 'all') {
      const publisherName = entityLabels.publisher || 'Unknown publisher';
      chips.push({ key: 'selectedPublisher', label: `Publisher: ${publisherName}`, value: 'all' });
    }
    if (filters.selectedAuthor && filters.selectedAuthor !== 'all') {
      const authorName = entityLabels.author || 'Unknown author';
      chips.push({ key: 'selectedAuthor', label: `${t('authorLabel')}: ${authorName}`, value: 'all' });
    }
    if (filters.selectedTopic && filters.selectedTopic !== 'all') {
      const tName = topicOptions.find(tp => String(tp.topic_id || tp.id) === String(filters.selectedTopic))?.display_name
        || entityLabels.topic
        || 'Unknown topic';
      chips.push({ key: 'selectedTopic', label: tName, value: 'all' });
    }
    if (filters.selectedKeyword && filters.selectedKeyword !== 'all') {
      const keywordName = entityLabels.keyword || 'Unknown keyword';
      chips.push({ key: 'selectedKeyword', label: `${t('keywordsLabel')}: ${keywordName}`, value: 'all' });
    }
    if (filters.selectedAccess && filters.selectedAccess !== 'all') {
      const accessLabel = filters.selectedAccess === 'oa' ? t('openAccess') : t('closedAccess');
      chips.push({ key: 'access', label: `${t('accessStatus')}: ${accessLabel}`, value: 'all' });
    }
    return chips;
  })();

  const hasActiveFilters = activeChips.length > 0 || filters.sortBy !== 'created_at' || filters.sortOrder !== 'desc';

  const handleEntityFilter = (paramName, idValue) => {
    if (!idValue) return;
    updateFilters({ [paramName]: idValue });
  };

  const analyticsTotals = analytics?.totals || {};
  const analysisSummary = analysis?.summary || {};
  const activeResultTotal = isAnalysisView ? Number(analysisSummary.scholarly_works || 0) : total;
  // Analysis stats are sourced from the Analysis contract's own summary, never from the
  // disabled list/light-analytics queries (FE-FIX-03): topics/publishers have no Analysis
  // contract field, so they are hidden in Analysis instead of reading stale data.
  const openAccessTotal = isAnalysisView ? Number(analysisSummary.open_access_works || 0) : Number(stats.openAccessCount || 0);
  const authorTotal = isAnalysisView
    ? Number(analysisSummary.authors || 0)
    : Number(analyticsTotals.authors ?? analyticsTotals.author_count ?? analyticsTotals.authorsCount ?? stats.authorsCount ?? 0);
  const institutionTotal = Number(analysisSummary.institutions || 0);
  const topicTotal = Number(analyticsTotals.topics ?? analyticsTotals.topic_count ?? analyticsTotals.topicsCount ?? stats.topicsCount ?? 0);
  const journalTotal = isAnalysisView
    ? Number(analysisSummary.journals || 0)
    : Number(analyticsTotals.journals ?? analyticsTotals.journal_count ?? analyticsTotals.journalsCount ?? 0);
  const publisherTotal = Number(analyticsTotals.publishers ?? analyticsTotals.publisher_count ?? analyticsTotals.publishersCount ?? 0);
  const citationsTotal = Number(analysisSummary.total_citations || 0);

  const yearCounts = useMemo(() => {
    return (analytics?.yearDistribution || [])
      .map((item) => ({
        year: String(item.year || item.name || item.key || ''),
        count: Number(item.count || 0),
      }))
      .filter((item) => item.year)
      .sort((a, b) => Number(a.year) - Number(b.year));
  }, [analytics]);

  const maxYearCount = useMemo(() => {
    return Math.max(...yearCounts.map(item => item.count)) || 1;
  }, [yearCounts]);

  const yearChartLayout = useMemo(() => computeYearChartLayout(yearCounts), [yearCounts]);

  const accessStatusCounts = useMemo(() => {
    const counts = Object.fromEntries(
      (analytics?.accessDistribution || []).map((item) => [item.key || item.name, item.count || 0])
    );

    return [
      { key: 'oa', label: t('openAccess'), count: counts.oa || counts.open || 0, color: '#4ea72a' },
      { key: 'closed', label: t('closedAccess'), count: counts.closed || counts.subscription || 0, color: '#0099ab' },
      { key: 'unknown', label: t('statusUnknown'), count: counts.unknown || counts.unavailable || counts.null || 0, color: '#64748B' }
    ];
  }, [analytics, t]);

  const maxAccessCount = useMemo(() => {
    return Math.max(...accessStatusCounts.map(item => item.count)) || 1;
  }, [accessStatusCounts]);

  const authorCounts = useMemo(() => {
    return (analytics?.topAuthors || []).slice(0, 8);
  }, [analytics]);

  const institutionCounts = useMemo(() => {
    return (analytics?.topInstitutions || []).slice(0, 8);
  }, [analytics]);

  const topicCounts = useMemo(() => {
    const sorted = analytics?.topTopics || [];
    
    if (sorted.length <= 5) {
      return sorted;
    }
    const top4 = sorted.slice(0, 4);
    const othersCount = sorted.slice(4).reduce((sum, item) => sum + item.count, 0);
    if (othersCount > 0) {
      top4.push({ name: t('others'), count: othersCount });
    }
    return top4;
  }, [analytics, t]);

  const maxTopicCount = useMemo(() => {
    return Math.max(...topicCounts.map((item) => item.count)) || 1;
  }, [topicCounts]);

  const groupedArticles = useMemo(() => {
    if (groupingMode !== 'simple-group' && groupingMode !== 'extended-group') {
      return null;
    }
    const groups = {};
    articles.forEach(art => {
      const groupKey = art.primary_topic || t('anyTopic');
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(art);
    });
    return Object.entries(groups);
  }, [articles, groupingMode, t]);

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const fmt = (n) => new Intl.NumberFormat().format(n || 0);


  return (
    <div className="trending-vn-page">
      <Header />

      <div className="lens-layout-wrapper">

        {/* ==================== LEFT ICON SIDEBAR (Lens-style) ==================== */}
        <aside className="lens-left-sidebar">
          {activeLeftTab ? (
            <button className="lens-sidebar-icon-btn active" title={t('close')} onClick={() => setActiveLeftTab(null)}>
              <Icon icon="lucide:chevron-left-circle" width="18" />
            </button>
          ) : (
            <button className="lens-sidebar-icon-btn" title={t('home')} onClick={() => navigate('/')}>
              <Icon icon="lucide:home" width="18" />
            </button>
          )}
          <button className={`lens-sidebar-icon-btn ${!activeLeftTab ? 'active' : ''}`} title={t('articleSearch')} onClick={() => setActiveLeftTab(null)}>
            <Icon icon="lucide:chevron-right" width="18" />
          </button>
          <button className={`lens-sidebar-icon-btn ${activeLeftTab === 'filters' ? 'active' : ''}`} title={t('filtersLabel')} onClick={() => setActiveLeftTab(activeLeftTab === 'filters' ? null : 'filters')}>
            <Icon icon="lucide:filter" width="18" />
          </button>
          <button className={`lens-sidebar-icon-btn ${activeLeftTab === 'profile' ? 'active' : ''}`} title={t('sbWorkArea')} onClick={() => setActiveLeftTab(activeLeftTab === 'profile' ? null : 'profile')}>
            <Icon icon="lucide:user-cog" width="18" />
          </button>
          <button className={`lens-sidebar-icon-btn ${activeLeftTab === 'info' ? 'active' : ''}`} title={t('info')} onClick={() => setActiveLeftTab(activeLeftTab === 'info' ? null : 'info')}>
            <Icon icon="lucide:info" width="18" />
          </button>
          <button className={`lens-sidebar-icon-btn ${activeLeftTab === 'more' ? 'active' : ''}`} title={t('more')} onClick={() => setActiveLeftTab(activeLeftTab === 'more' ? null : 'more')}>
            <Icon icon="lucide:more-horizontal" width="18" />
          </button>
        </aside>

        {/* ==================== EXPANDED SIDEBAR DRAWER (Lens-style) ==================== */}
        {activeLeftTab && (
          <aside className="lens-expanded-sidebar">
            {/* 1. FILTERS TAB VIEW */}
            {activeLeftTab === 'filters' && (
              <div className="lens-drawer-content">
                <div className="lens-drawer-header">
                  <span className="lens-drawer-title">{t('sbFilters')}</span>
                  <Icon icon="lucide:info" className="info-icon" width="14" style={{ color: 'var(--primary-hover)', cursor: 'pointer' }} />
                </div>
                <div className="lens-drawer-scrollable">
                  {[
                    { key: 'dateRange', label: t('sbDateRange'), icon: 'lucide:calendar', action: () => {
                      const el = document.querySelector('.lens-sidebar-panel');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }},
                    { key: 'flags', label: t('sbFlags'), icon: 'lucide:flag', action: () => {
                      updateFilters({ access: filters.selectedAccess === 'all' ? 'oa' : 'all' });
                    }},
                    { key: 'jurisdiction', label: t('sbJurisdiction'), icon: 'lucide:map-pin' },
                    { key: 'publishers', label: 'Publishers', icon: 'lucide:building-2', action: () => {
                      const el = document.querySelector('.publisher-grid-container');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }},
                    { key: 'authors', label: 'Authors', icon: 'lucide:users', action: () => {
                      const el = document.querySelector('.author-lens-grid');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }},
                    { key: 'topics', label: 'Topics', icon: 'lucide:tags' },
                    { key: 'journals', label: 'Journals', icon: 'lucide:book-open' },
                    { key: 'accessStatus', label: t('accessStatus'), icon: 'lucide:lock-keyhole', action: () => {
                      const el = document.querySelector('.legal-status-chart');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }},
                    { key: 'docType', label: t('sbDocType'), icon: 'lucide:file-text' },
                    { key: 'citedWorks', label: t('sbCitedWorks'), icon: 'lucide:book-open' },
                    { key: 'biologicals', label: t('sbBiologicals'), icon: 'lucide:dna' },
                    { key: 'classifications', label: t('sbClassifications'), icon: 'lucide:list' },
                    { key: 'docFamily', label: t('sbDocFamily'), icon: 'lucide:folder-git2', action: () => {
                      setGroupingMode(prev => prev === 'none' ? 'simple-group' : 'none');
                    }},
                    { key: 'queryTools', label: t('sbQueryTools'), icon: 'lucide:settings', action: () => {
                      setShowCustomise(prev => !prev);
                    }},
                    { key: 'newSearch', label: t('sbNewSearch'), icon: 'lucide:search', action: () => {
                      handleClearSearch();
                    }}
                  ].map(item => (
                    <div
                      key={item.key}
                      className="lens-drawer-item"
                      onClick={item.action || (() => {})}
                    >
                      <Icon icon={item.icon} width="16" className="item-icon" />
                      <span className="item-label">{item.label}</span>
                      <Icon icon="lucide:chevron-right" width="12" className="item-arrow ms-auto" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. PROFILE / WORK AREA TAB VIEW */}
            {activeLeftTab === 'profile' && (
              <div className="lens-drawer-content">
                <div className="lens-profile-block">
                  <div className="lens-profile-avatar">
                    {user?.name ? getInitials(user.name) : 'TM'}
                  </div>
                  <div className="lens-profile-info">
                    <div className="profile-name">{user?.name || user?.username || 'Researcher'}</div>
                    <div className="profile-subtitle">
                      {t('personalAccount')}{' '}
                      <span className="text-danger" style={{ fontSize: '0.62rem', display: 'block' }}>
                        ({t('notCommercialUse')})
                      </span>
                    </div>
                  </div>
                  <Icon icon="lucide:chevron-down" width="16" className="text-muted ms-auto" />
                </div>

                <div className="lens-profile-actions">
                  <Dropdown className="flex-fill">
                    <Dropdown.Toggle variant="outline-primary" size="sm" className="w-100 font-sans text-xs d-flex align-items-center justify-content-between">
                      {t('sbNewItem')}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="text-xs">
                      <Dropdown.Item onClick={() => setShowSaveQueryModal(true)}>{t('saveAsQuery')}</Dropdown.Item>
                      <Dropdown.Item onClick={() => setShowExportModal(true)}>{t('export')}</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>

                  <Dropdown className="flex-fill">
                    <Dropdown.Toggle variant="primary" size="sm" className="w-100 font-sans text-xs d-flex align-items-center justify-content-between">
                      {t('sbSearch')}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="text-xs">
                      <Dropdown.Item onClick={() => updateFilters({ sortBy: 'created_at', sortOrder: 'desc' })}>{t('sortDateNewest')}</Dropdown.Item>
                      <Dropdown.Item onClick={() => updateFilters({ access: 'oa' })}>{t('openAccess')}</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>

                <div className="lens-drawer-section-title">{t('sbWorkArea')}</div>
                <div className="lens-drawer-scrollable">
                  {[
                    { key: 'savedQueries', label: t('sbSavedQueries'), icon: 'lucide:save', action: () => navigate('/dashboard') },
                    { key: 'searchHistory', label: t('sbSearchHistory'), icon: 'lucide:search' },
                    { key: 'collections', label: t('sbCollections'), icon: 'lucide:folder' },
                    { key: 'dashboards', label: t('sbDashboards'), icon: 'lucide:bar-chart-2' },
                    { key: 'notes', label: t('sbNotes'), icon: 'lucide:file-text' },
                    { key: 'tags', label: t('sbTags'), icon: 'lucide:tag' },
                    { key: 'authorship', label: t('sbAuthorship'), icon: 'lucide:users' },
                    { key: 'notifications', label: t('sbNotifications'), icon: 'lucide:bell' },
                    { key: 'mediaLibrary', label: t('sbMediaLibrary'), icon: 'lucide:image' },
                    { key: 'settings', label: t('sbSettings'), icon: 'lucide:settings', action: () => navigate('/profile') }
                  ].map(item => (
                    <div
                      key={item.key}
                      className="lens-drawer-item"
                      onClick={item.action || (() => {})}
                    >
                      <Icon icon={item.icon} width="16" className="item-icon" />
                      <span className="item-label">{item.label}</span>
                      <Icon icon="lucide:chevron-right" width="12" className="item-arrow ms-auto" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. INFO / SUPPORT / SUGGESTIONS VIEW */}
            {activeLeftTab === 'info' && (
              <div className="lens-drawer-content">
                <div className="lens-drawer-header">
                  <span className="lens-drawer-title">{t('sbSupport')}</span>
                </div>
                
                <div className="px-3 py-2">
                  <p className="text-muted" style={{ fontSize: '0.72rem', lineHeight: '1.4', margin: '0 0 10px 0' }}>
                    {t('sbSupportDesc')}
                  </p>
                  <div className="lens-search-group" style={{ height: '32px' }}>
                    <Form.Control
                      placeholder={t('sbSearchDoc')}
                      className="lens-search-input py-1"
                      style={{ fontSize: '0.78rem' }}
                    />
                    <span className="d-flex align-items-center pe-2">
                      <Icon icon="lucide:search" width="14" className="text-muted" />
                    </span>
                  </div>
                </div>

                <hr className="my-2 text-muted opacity-20" />

                <div className="lens-drawer-header pt-1">
                  <span className="lens-drawer-title">{t('sbSuggestions')}</span>
                  <Icon icon="lucide:info" className="info-icon" width="14" style={{ color: 'var(--primary-hover)', cursor: 'pointer' }} />
                </div>

                <div className="lens-drawer-scrollable">
                  <div className="lens-suggestion-item" onClick={() => setShowSaveQueryModal(true)}>
                    <div className="suggestion-icon-wrapper">
                      <Icon icon="lucide:folder-plus" width="18" className="text-primary" />
                    </div>
                    <div className="suggestion-info">
                      <div className="suggestion-title">{t('sbCreateCollection')}</div>
                      <div className="suggestion-desc">{t('sbCreateCollectionDesc')}</div>
                    </div>
                  </div>

                  <div className="lens-suggestion-item" onClick={() => setShowSaveQueryModal(true)}>
                    <div className="suggestion-icon-wrapper">
                      <Icon icon="lucide:save" width="18" className="text-primary" />
                    </div>
                    <div className="suggestion-info">
                      <div className="suggestion-title">{t('sbSaveQuery')}</div>
                      <div className="suggestion-desc">{t('sbSaveQueryDesc')}</div>
                    </div>
                  </div>

                  <div className="lens-suggestion-item" onClick={() => setShowExportModal(true)}>
                    <div className="suggestion-icon-wrapper">
                      <Icon icon="lucide:download-cloud" width="18" className="text-primary" />
                    </div>
                    <div className="suggestion-info">
                      <div className="suggestion-title">{t('sbExportResults')}</div>
                      <div className="suggestion-desc">{t('sbExportResultsDesc')}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. MORE MENU VIEW */}
            {activeLeftTab === 'more' && (
              <div className="lens-drawer-content">
                <div className="lens-drawer-header">
                  <span className="lens-drawer-title">{t('more')}</span>
                </div>
                <div className="lens-drawer-scrollable">
                  <div className="lens-drawer-item" onClick={() => navigate('/')}>
                    <Icon icon="lucide:home" width="16" className="item-icon" />
                    <span className="item-label">{t('home')}</span>
                  </div>
                  <div className="lens-drawer-item" onClick={() => navigate('/journals')}>
                    <Icon icon="lucide:book-open" width="16" className="item-icon" />
                    <span className="item-label">{t('journals')}</span>
                  </div>
                  <div className="lens-drawer-item" onClick={() => navigate('/trends')}>
                    <Icon icon="lucide:trending-up" width="16" className="item-icon" />
                    <span className="item-label">{t('trends')}</span>
                  </div>
                  <div className="lens-drawer-item" onClick={() => navigate('/geography')}>
                    <Icon icon="lucide:globe" width="16" className="item-icon" />
                    <span className="item-label">{t('geography')}</span>
                  </div>
                </div>
              </div>
            )}
          </aside>
        )}

        {/* ==================== MAIN CONTENT AREA ==================== */}
        <div className="lens-main-content">
        <Container fluid className="p-0">

        {/* ==================== 1. TOP INFO BAR ==================== */}
        <div className="lens-top-info-bar">
          <div className="total-count">
            <Icon icon="lucide:search" width="13" className="me-1" />
            {t('databaseArticlesCount', { count: fmt(isAnalysisView ? activeResultTotal : stats.totalArticles) })}
          </div>
          <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.75rem' }}>
            {t('exploreSectors')}
          </div>
        </div>

        {/* ==================== 2. PAGE TITLE ==================== */}
        <h1 className="lens-page-title">{t('articleSearchResults')}</h1>

        {/* ==================== 3. FILTER INDICATOR ==================== */}
        <div className="lens-filter-indicator">
          <span className="filter-count-link" onClick={clearFilters}>
            {t('articles')} ({fmt(activeResultTotal)})
          </span>
          <span>-</span>
          <span>{t('allDocs')}</span>
          <span>-</span>
          <span>Scope: Vietnamese universities</span>
          <span style={{ marginLeft: '16px' }}>
            <Icon icon="lucide:filter" width="12" className="me-1" />
            {t('filtersLabel')}: {activeChips.length > 0
              ? t('filtersApplied', { count: activeChips.length })
              : t('noFiltersApplied')}
          </span>
        </div>

        {/* ==================== 4. STATS COLOR BAR ==================== */}
        {/* In Analysis, every segment reads analysis.summary (never the disabled list/light
            analytics queries); Topics/Publishers have no Analysis contract field, so they are
            hidden instead of showing stale data (FE-FIX-03). */}
        <div className="lens-stats-bar">
          <div className="stat-segment">
            <div className="stat-color-bar" style={{ background: '#00acc1' }} />
            <div className="stat-label">{t('statArticleRecords')}</div>
            <div className="stat-value">{isAnalysisView && isAnalysisLoading ? '...' : fmt(isAnalysisView ? activeResultTotal : (stats.totalArticles || total))}</div>
          </div>
          <div className="stat-segment">
            <div className="stat-color-bar" style={{ background: '#0288d1' }} />
            <div className="stat-label">{t('openAccess')}</div>
            <div className="stat-value">{(isAnalysisView ? isAnalysisLoading : isLoading) ? '...' : fmt(openAccessTotal)}</div>
          </div>
          <div className="stat-segment">
            <div className="stat-color-bar" style={{ background: '#7b1fa2' }} />
            <div className="stat-label">{t('statAuthors')}</div>
            <div className="stat-value">{(isAnalysisView ? isAnalysisLoading : isAnalyticsLoading) ? '...' : fmt(authorTotal)}</div>
          </div>
          {isAnalysisView && (
            <div className="stat-segment">
              <div className="stat-color-bar" style={{ background: '#475569' }} />
              <div className="stat-label">{t('statInstitutions')}</div>
              <div className="stat-value">{isAnalysisLoading ? '...' : fmt(institutionTotal)}</div>
            </div>
          )}
          {!isAnalysisView && (
            <div className="stat-segment">
              <div className="stat-color-bar" style={{ background: '#475569' }} />
              <div className="stat-label">{t('statTopics')}</div>
              <div className="stat-value">{isAnalyticsLoading ? '...' : fmt(topicTotal)}</div>
            </div>
          )}
          {!isAnalysisView && publisherTotal > 0 && (
            <div className="stat-segment">
              <div className="stat-color-bar" style={{ background: '#334155' }} />
              <div className="stat-label">{t('statPublishers')}</div>
              <div className="stat-value">{isAnalyticsLoading ? '...' : fmt(publisherTotal)}</div>
            </div>
          )}
          {journalTotal > 0 && (
            <div className="stat-segment">
              <div className="stat-color-bar" style={{ background: '#2e7d32' }} />
              <div className="stat-label">{t('statJournals')}</div>
              <div className="stat-value">{(isAnalysisView ? isAnalysisLoading : isAnalyticsLoading) ? '...' : fmt(journalTotal)}</div>
            </div>
          )}
          {isAnalysisView && citationsTotal > 0 && (
            <div className="stat-segment">
              <div className="stat-color-bar" style={{ background: '#c62828' }} />
              <div className="stat-label">{t('statCitations')}</div>
              <div className="stat-value">{isAnalysisLoading ? '...' : fmt(citationsTotal)}</div>
            </div>
          )}
        </div>

        {/* ==================== 5. STICKY TOP TOOLBAR (FULL WIDTH) ==================== */}
        <div className="lens-sticky-results-toolbar">
          {/* --- Tab row --- */}
          <div className="lens-tab-row">
            <div className="tab-group">
              <button className="tab-item active">
                {t('articles')}
              </button>
              <button className="tab-item" disabled>
                {t('exploreCitations')}
                <Icon icon="lucide:check-check" width="13" style={{ color: '#16a34a' }} />
              </button>
            </div>
            
            <div className="view-toggles ps-2">
              <button
                className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => handleViewChange(TRENDING_VIEW_MODES.TABLE)}
              >
                <Icon icon="lucide:table" width="13" />
                {t('viewTable')}
              </button>
              <button
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => handleViewChange(TRENDING_VIEW_MODES.LIST)}
              >
                <Icon icon="lucide:list" width="13" />
                {t('viewList')}
              </button>
              <button
                className={`view-toggle-btn ${isAnalysisView ? 'active' : ''}`}
                onClick={() => handleViewChange(TRENDING_VIEW_MODES.ANALYSIS)}
              >
                <Icon icon="lucide:bar-chart-3" width="13" />
                {t('analysis')}
              </button>
            </div>
          </div>

          {/* --- Action toolbar: Expand, Customise, Save, Share, Export, Sort, Search --- */}
          <div className="lens-action-toolbar">
            <div className="action-group">
              {!isAnalysisView && (
                <>
                  <button className="lens-action-btn" onClick={handleToggleAllAbstracts}>
                    <Icon icon={allExpanded ? "lucide:chevron-up" : "lucide:chevron-down"} width="12" />
                    {allExpanded ? t('collapseAbstract') : t('expand')}
                  </button>
                  <span className="action-sep" style={{ color: '#cbd5e1' }}>|</span>
                  <button className="lens-action-btn" onClick={() => setShowCustomise(!showCustomise)}>
                    <Icon icon="lucide:list-checks" width="12" />
                    {t('customiseList')}
                  </button>
                  <span className="action-sep" style={{ color: '#cbd5e1' }}>|</span>
                </>
              )}
              <button className="lens-action-btn" onClick={() => setShowSaveQueryModal(true)}>
                <Icon icon="lucide:save" width="12" />
                {t('saveAsQuery')}
              </button>
              <span className="action-sep" style={{ color: '#cbd5e1' }}>|</span>
              <button className="lens-action-btn" onClick={() => setShowShareModal(true)}>
                <Icon icon="lucide:share-2" width="12" />
                {t('share')}
              </button>
              {!isAnalysisView && (
                <>
                  <span className="action-sep" style={{ color: '#cbd5e1' }}>|</span>
                  <button className="lens-action-btn" onClick={() => setShowExportModal(true)}>
                    <Icon icon="lucide:download" width="12" />
                    {t('export')}
                  </button>
                  <span className="action-sep" style={{ color: '#cbd5e1' }}>|</span>
                  <button className="lens-action-btn" disabled>
                    <Icon icon="lucide:sparkles" width="12" />
                    {t('analysisPreviewOptions')}
                    <Badge bg="secondary" style={{ fontSize: '0.58rem', padding: '1px 4px', marginLeft: '3px' }}>{t('badgeNew')}</Badge>
                  </button>
                </>
              )}
            </div>

            {/* Right side of Action toolbar: Sort + Search */}
            <div className="d-flex align-items-center gap-3">
              {/* Sort dropdown */}
              {!isAnalysisView && (
                <div className="d-flex align-items-center gap-2">
                  <Icon icon="lucide:arrow-up-down" width="12" className="text-muted" />
                  <select
                    className="lens-sort-select"
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split('-');
                      updateFilters({ sortBy, sortOrder });
                    }}
                  >
                    <option value="created_at-desc">{t('sortDateNewest')}</option>
                    <option value="created_at-asc">{t('sortDateOldest')}</option>
                    <option value="title-asc">{t('sortTitleAsc')}</option>
                    <option value="title-desc">{t('sortTitleDesc')}</option>
                    <option value="publication_year-desc">{t('sortYearDesc')}</option>
                    <option value="publication_year-asc">{t('sortYearAsc')}</option>
                  </select>
                </div>
              )}

              {/* Search Bar */}
              <Form onSubmit={handleSearchSubmit} className="lens-search-form" style={{ width: '300px', margin: 0 }}>
                <div className="lens-search-group" style={{ height: '32px', minHeight: '32px' }}>
                  <span className="d-flex align-items-center ps-2 pe-1" style={{ background: 'transparent' }}>
                    <Icon icon="lucide:search" width="14" className="text-muted" />
                  </span>
                  <Form.Control
                    placeholder={t('searchPlaceholder')}
                    value={localSearchInput}
                    onChange={(e) => setLocalSearchInput(e.target.value)}
                    className="lens-search-input py-1"
                    style={{ fontSize: '0.8rem' }}
                  />
                  {localSearchInput && (
                    <Button variant="link" className="p-0 px-2 text-muted" onClick={handleClearSearch}>
                      <Icon icon="lucide:x" width="12" />
                    </Button>
                  )}
                  <Button type="submit" className="lens-search-btn py-1 px-3">
                    {t('search')}
                  </Button>
                </div>
              </Form>
            </div>
          </div>

          {/* --- Panel Customise Your Results View --- */}
          <Collapse in={!isAnalysisView && showCustomise}>
            <div className="lens-customise-panel">
              <div className="customise-title">{t('customiseYourResultsView')}</div>
              <div className="customise-grid">
                {[
                  { key: 'doi', label: t('colDoi') },
                  { key: 'authors', label: t('colAuthors') },
                  { key: 'article', label: t('colArticle') },
                  { key: 'journal', label: t('colJournal') },
                ].map(col => (
                  <Form.Check
                    key={col.key}
                    type="checkbox"
                    id={`customise-col-${col.key}`}
                    label={col.label}
                    checked={visibleColumns[col.key]}
                    onChange={() => toggleColumn(col.key)}
                    className="customise-check"
                  />
                ))}
              </div>
            </div>
          </Collapse>

          {/* --- Active filter chips --- */}
          {activeChips.length > 0 && (
            <div className="lens-chips-bar">
              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{t('filterSearch')}:</span>
              {activeChips.map(chip => (
                <span key={chip.key} className="lens-filter-chip">
                  {chip.label}
                  <Icon
                    icon="lucide:x"
                    width="11"
                    className="lens-chip-close"
                    onClick={() => (chip.onRemove ? chip.onRemove() : updateFilters({ [chip.key]: chip.value }))}
                  />
                </span>
              ))}
              {hasActiveFilters && (
                <button className="lens-clear-link" onClick={clearFilters}>
                  {t('clearAll')}
                </button>
              )}
            </div>
          )}
        </div>

        {/* ==================== 6. MAIN CONTENT (LEFT + RIGHT) ==================== */}
        <Row className="g-0">

          <Col lg={showSidebar ? 8 : 12} md={12} className="transition-col">

            {/* ==================== ARTICLE RESULTS ==================== */}
            <div className="lens-results-body">
              {isAnalysisView ? (
                <AnalysisDashboard
                  analysis={analysis}
                  isLoading={isAnalysisLoading}
                  error={analysisError}
                  onEntityClick={handleEntityFilter}
                  onArticleClick={handleDetailClick}
                  onRetry={refetchAnalysis}
                />
              ) : isLoading && articles.length === 0 ? (
                <div className="d-flex flex-column gap-0">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="lens-article-card p-3">
                      <div className="lens-skeleton mb-2" style={{ width: '100px', height: '12px' }} />
                      <div className="lens-skeleton mb-2" style={{ width: '80%', height: '16px' }} />
                      <div className="lens-skeleton mb-1" style={{ width: '60%', height: '11px' }} />
                      <div className="lens-skeleton" style={{ width: '40%', height: '11px' }} />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center p-5 bg-white border">
                  <Icon icon="lucide:alert-circle" className="text-danger mb-2" width="36" />
                  <h6 style={{ fontWeight: 700 }}>{t('errorOccurred')}</h6>
                  <p className="text-muted" style={{ fontSize: '0.78rem' }}>{error}</p>
                  <Button variant="outline-secondary" size="sm" onClick={() => window.location.reload()}>
                    {t('tryAgain')}
                  </Button>
                </div>
              ) : articles.length === 0 ? (
                <div className="text-center p-5 bg-white border">
                  <Icon icon="lucide:search-x" className="text-muted mb-2" width="36" />
                  <h6 style={{ fontWeight: 700 }}>{t('noArticlesFound')}</h6>
                  <p className="text-muted" style={{ fontSize: '0.78rem' }}>{t('adjustSearchOrReset')}</p>
                  <Button variant="outline-secondary" size="sm" onClick={clearFilters}>
                    {t('resetFilters')}
                  </Button>
                </div>
              ) : viewMode === 'list' ? (
                <div className="d-flex flex-column gap-0">
                  {groupedArticles ? (
                    groupedArticles.map(([groupName, groupList]) => (
                      <div key={groupName} className="lens-group-section mb-3 border rounded shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
                        <div className="lens-group-header p-2 d-flex align-items-center justify-content-between bg-light border-bottom">
                          <span className="fw-bold text-xs font-sans text-main d-flex align-items-center">
                            <Icon icon="lucide:folder" className="me-2 text-primary" width="14" />
                            {groupName}
                          </span>
                          <Badge bg="secondary" style={{ fontSize: '0.62rem' }}>
                            {groupList.length} {t('articles').toLowerCase()}
                          </Badge>
                        </div>
                        <div className="d-flex flex-column gap-0">
                          {groupList.map((article, idx) => (
                          <TrendingArticleCard
                            key={article.article_id}
                            article={article}
                            index={idx}
                            currentPage={currentPage}
                            expandedAbstracts={expandedAbstracts}
                            groupingMode={groupingMode}
                            visibleColumns={visibleColumns}
                            handleDetailClick={handleDetailClick}
                            updateFilters={updateFilters}
                            handleCopyDoi={handleCopyDoi}
                            toggleAbstract={toggleAbstract}
                          />
                        ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    articles.map((article, index) => (
                    <TrendingArticleCard
                      key={article.article_id}
                      article={article}
                      index={index}
                      currentPage={currentPage}
                      expandedAbstracts={expandedAbstracts}
                      groupingMode={groupingMode}
                      visibleColumns={visibleColumns}
                      handleDetailClick={handleDetailClick}
                      updateFilters={updateFilters}
                      handleCopyDoi={handleCopyDoi}
                      toggleAbstract={toggleAbstract}
                    />
                  ))
                  )}
                </div>
              ) : (
                <div className="bg-white border overflow-hidden">
                  <ArticleTable
                    articles={articles}
                    isLoading={isLoading}
                    onDetailClick={handleDetailClick}
                    onClearFilters={clearFilters}
                  />
                </div>
              )}

              {!isAnalysisView && totalPages > 1 && !isLoading && (
                <div className="lens-pagination-row">
                  <AdminPagination
                    totalItems={total}
                    currentPage={currentPage}
                    limit={10}
                    onPageChange={handlePageChange}
                    entityName={t('articles').toLowerCase()}
                  />
                </div>
              )}
            </div>
          </Col>

          {showSidebar && (
            <Col lg={4} md={12} className="lens-sidebar-col">

              <div className="lens-sidebar-panel">
                {institutionCounts.length > 0 ? (
                  <>
                    <div className="lens-sidebar-title">Top Vietnamese Institutions</div>
                    <div className="d-flex flex-column gap-2">
                      {institutionCounts.map((institution, index) => {
                        const institutionName = institution.display_name || institution.name || 'Unknown institution';
                        return (
                          <div key={institution.id || institutionName || index} className="d-flex align-items-center gap-2">
                            <span
                              className="d-inline-flex align-items-center justify-content-center"
                              style={{
                                width: '28px',
                                height: '28px',
                                border: '1px solid var(--border)',
                                background: 'var(--bg-section)',
                                fontSize: '0.62rem',
                                fontWeight: 700,
                              }}
                            >
                              {getInitials(institutionName)}
                            </span>
                            <span className="flex-grow-1 text-truncate text-xs" title={institutionName}>
                              {institutionName}
                            </span>
                            <span className="text-muted-custom text-xs">{fmt(institution.count)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <PublisherGrid
                    publishers={(analytics?.topPublishers || []).slice(0, 8)}
                    isLoading={isAnalyticsLoading}
                    error={analyticsError}
                    onFilterEntity={handleEntityFilter}
                  />
                )}
              </div>

              <div className="lens-sidebar-panel">
                <div className="lens-sidebar-title">{t('publicationDate')}</div>
                {articles.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {t('anyTopic')}
                  </div>
                ) : (
                  <div style={{ paddingTop: '4px' }}>
                    <svg viewBox="0 0 200 100" width="100%" height="110px">
                      {/* Elegant background grid lines */}
                      <line x1="8" y1="18" x2="192" y2="18" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.6" />
                      <line x1="8" y1="38" x2="192" y2="38" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.6" />
                      <line x1="8" y1="58" x2="192" y2="58" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.6" />

                      {yearChartLayout.columns.map((item) => {
                        const colWidth = item.width;
                        const colHeight = maxYearCount > 0 ? (item.count / maxYearCount) * 60 : 0;
                        const y = 78 - colHeight;
                        return (
                          <g key={item.year}>
                            <rect
                              x={item.x} y={y}
                              width={colWidth} height={colHeight}
                              rx="2"
                              fill="#1976D2"
                              opacity="0.85"
                              className="lens-chart-bar"
                            />
                            <text x={item.x + colWidth / 2} y="92" textAnchor="middle" fontSize="6.5" fill="var(--text-muted)">
                              {item.year}
                            </text>
                            {item.count > 0 && (
                              <text x={item.x + colWidth / 2} y={y - 3} textAnchor="middle" fontSize="6.5" fontWeight="600" fill="var(--text-main)">
                                {item.count}
                              </text>
                            )}
                          </g>
                        );
                      })}
                      <line x1="8" y1="78" x2="192" y2="78" stroke="var(--border)" strokeWidth="1" />
                    </svg>
                  </div>
                )}
                <div className="lens-chart-hint">
                  <Icon icon="lucide:edit-2" width="10" className="me-1" />
                  {t('chartHint')}
                </div>
              </div>

              {/* --- Panel 2.5: Access Status chart --- */}
              <div className="lens-sidebar-panel">
                <div className="lens-sidebar-title">{t('accessStatus')}</div>
                {articles.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {t('anyTopic')}
                  </div>
                ) : (
                  <div style={{ paddingTop: '4px' }}>
                    <svg viewBox="0 0 330 220" width="100%" height="200px">
                      {/* Grid lines and Tick labels */}
                      {(() => {
                        const scaleLegalMax = Math.max(5, Math.ceil(maxAccessCount / 5) * 5);
                        const legalTicks = Array.from({ length: 6 }, (_, i) => i * (scaleLegalMax / 5));
                        return legalTicks.map((tickVal) => {
                          const x = 90 + (tickVal / scaleLegalMax) * 220;
                          return (
                            <g key={tickVal}>
                              {/* Dotted vertical grid lines */}
                              <line
                                x1={x}
                                y1={15}
                                x2={x}
                                y2={190}
                                stroke="var(--border)"
                                strokeWidth="0.5"
                                strokeDasharray="3 3"
                                opacity="0.6"
                              />
                              {/* Tick marks at X-axis */}
                              <line
                                x1={x}
                                y1={190}
                                x2={x}
                                y2={194}
                                stroke="var(--border-dark)"
                                strokeWidth="1"
                              />
                              {/* Tick numbers */}
                              <text
                                x={x}
                                y={205}
                                textAnchor="middle"
                                fontSize="7.5"
                                fill="var(--text-muted)"
                              >
                                {fmt(tickVal)}
                              </text>
                            </g>
                          );
                        });
                      })()}

                      {/* X and Y axes lines */}
                      <line x1={90} y1={15} x2={90} y2={190} stroke="var(--border-dark)" strokeWidth="1" />
                      <line x1={90} y1={190} x2={310} y2={190} stroke="var(--border-dark)" strokeWidth="1" />

                      {/* Horizontal Bars & Y-axis labels */}
                      {(() => {
                        const scaleLegalMax = Math.max(5, Math.ceil(maxAccessCount / 5) * 5);
                        const yStep = 175 / accessStatusCounts.length;
                        const barHeight = 12;

                        return accessStatusCounts.map((item, idx) => {
                          const centerOfStep = 15 + (idx + 0.5) * yStep;
                          const y = centerOfStep - barHeight / 2;
                          const barWidth = scaleLegalMax > 0 ? (item.count / scaleLegalMax) * 220 : 0;

                          return (
                            <g key={item.key}>
                              {/* Label on the left of Y-axis */}
                              <text
                                x={82}
                                y={centerOfStep}
                                textAnchor="end"
                                dominantBaseline="middle"
                                fontSize="7.5"
                                fill="var(--text-muted)"
                                fontWeight="600"
                              >
                                {item.label}
                              </text>
                              {/* Bar */}
                              <rect
                                x={90}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                fill={item.color}
                                opacity="0.85"
                                className="lens-chart-bar"
                              >
                                <title>{`${item.label}: ${item.count}`}</title>
                              </rect>
                            </g>
                          );
                        });
                      })()}
                    </svg>
                  </div>
                )}
              </div>

              <div className="lens-sidebar-panel">
                <div className="lens-sidebar-title">{t('topAuthors')}</div>
                {authorCounts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {t('anyTopic')}
                  </div>
                ) : (
                  <div style={{ position: 'relative', paddingTop: '4px' }}>
                    <svg viewBox="0 0 330 260" width="100%" height="240px">
                      {/* Grid lines and Tick labels on Y-axis */}
                      {(() => {
                        const counts = authorCounts.map(item => item.count);
                        const maxVal = Math.max(...counts, 0);
                        const scaleMax = Math.max(5, Math.ceil(maxVal / 5) * 5);
                        const yTicks = Array.from({ length: 6 }, (_, i) => i * (scaleMax / 5));

                        return yTicks.map((tickVal) => {
                          const y = 175 - (tickVal / scaleMax) * 160;
                          return (
                            <g key={tickVal}>
                              {/* Horizontal dotted grid lines */}
                              <line
                                x1={45}
                                y1={y}
                                x2={315}
                                y2={y}
                                stroke="var(--border)"
                                strokeWidth="0.5"
                                strokeDasharray="3 3"
                                opacity="0.6"
                              />
                              {/* Y-axis tick mark line */}
                              <line
                                x1={41}
                                y1={y}
                                x2={45}
                                y2={y}
                                stroke="var(--border-dark)"
                                strokeWidth="1"
                              />
                              {/* Y-axis tick labels */}
                              <text
                                x={37}
                                y={y}
                                textAnchor="end"
                                dominantBaseline="middle"
                                fontSize="7.5"
                                fill="var(--text-muted)"
                              >
                                {fmt(tickVal)}
                              </text>
                            </g>
                          );
                        });
                      })()}

                      {/* X and Y axes lines */}
                      <line x1={45} y1={15} x2={45} y2={175} stroke="var(--border-dark)" strokeWidth="1" />
                      <line x1={45} y1={175} x2={315} y2={175} stroke="var(--border-dark)" strokeWidth="1" />

                      {/* Bars & X-axis rotated labels */}
                      {(() => {
                        const counts = authorCounts.map(item => item.count);
                        const maxVal = Math.max(...counts, 0);
                        const scaleMax = Math.max(5, Math.ceil(maxVal / 5) * 5);
                        const greenShades = ['#09542c', '#23884f', '#4fae6f', '#78c68e', '#9fd9ae', '#c2ebcc', '#dbf2e3', '#e8f8ed'];
                        
                        const n = authorCounts.length;
                        const colWidth = 270 / n;
                        const gap = colWidth * 0.25;
                        const barWidth = colWidth - gap;

                        return authorCounts.map((item, idx) => {
                          const x = 45 + idx * colWidth + gap / 2;
                          const barHeight = scaleMax > 0 ? (item.count / scaleMax) * 160 : 0;
                          const y = 175 - barHeight;
                          const color = greenShades[Math.min(idx, greenShades.length - 1)];
                          const canFilterAuthor = Boolean(item.id) && item.name && item.name !== 'Unknown';
                          const activateAuthor = () => {
                            if (canFilterAuthor) handleEntityFilter('author_id', item.id);
                          };
                          const handleAuthorKeyDown = (event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              activateAuthor();
                            }
                          };

                          return (
                            <g key={item.name}>
                              {/* Bar */}
                              <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                fill={color}
                                opacity="0.85"
                                className="lens-chart-bar"
                                style={{ transition: 'opacity 0.15s ease', cursor: canFilterAuthor ? 'pointer' : 'default' }}
                                role={canFilterAuthor ? 'button' : undefined}
                                tabIndex={canFilterAuthor ? 0 : undefined}
                                aria-label={canFilterAuthor ? `Filter by author ${item.name}` : undefined}
                                onClick={activateAuthor}
                                onKeyDown={handleAuthorKeyDown}
                                onMouseEnter={() => setActiveTooltip({
                                  name: item.name,
                                  count: item.count,
                                  x: x + barWidth / 2,
                                  y: y
                                })}
                                onMouseLeave={() => setActiveTooltip(null)}
                              />
                              {/* Rotated text label */}
                              <text
                                transform={`translate(${x + barWidth / 2}, 183) rotate(90)`}
                                textAnchor="start"
                                dominantBaseline="middle"
                                fontSize="7"
                                fill="var(--text-muted)"
                                fontWeight="600"
                                style={{ cursor: canFilterAuthor ? 'pointer' : 'default' }}
                                onClick={activateAuthor}
                              >
                                {item.name}
                              </text>
                            </g>
                          );
                        });
                      })()}
                    </svg>

                    {/* Tooltip Overlay */}
                    {activeTooltip && (
                      <div
                        className="chart-tooltip"
                        style={{
                          position: 'absolute',
                          left: `${(activeTooltip.x / 330) * 100}%`,
                          top: `${(activeTooltip.y / 260) * 100}%`,
                          transform: 'translate(-50%, -100%)',
                          marginTop: '-8px',
                          backgroundColor: '#ffffff',
                          border: '1px solid var(--border-dark)',
                          borderRadius: '4px',
                          padding: '6px 10px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          pointerEvents: 'none',
                          zIndex: 10,
                          fontSize: '0.68rem',
                          lineHeight: '1.4',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <div style={{ color: 'var(--text-muted)' }}>
                          label: <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{activeTooltip.name}</span>
                        </div>
                        <div style={{ color: 'var(--text-muted)' }}>
                          Document Count: <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{fmt(activeTooltip.count)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="lens-sidebar-panel">
                <div className="lens-sidebar-title">{t('topTopics')}</div>
                {topicCounts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {t('anyTopic')}
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {topicCounts.map((topic, idx) => {
                      const canFilterTopic = Boolean(topic.id) && topic.name && topic.name !== 'Unknown' && topic.name !== t('others');
                      const width = `${Math.max(6, Math.round((topic.count / maxTopicCount) * 100))}%`;
                      return (
                        <div key={topic.id || topic.name || idx}>
                          <div className="d-flex align-items-center gap-2 text-xs">
                            {canFilterTopic ? (
                              <button
                                type="button"
                                className="text-main p-0 text-truncate"
                                title={`${topic.name}: ${topic.count}`}
                                onClick={() => handleEntityFilter('topic_id', topic.id)}
                                style={{ background: 'none', border: 0, textAlign: 'left', maxWidth: '78%' }}
                              >
                                {topic.name}
                              </button>
                            ) : (
                              <span className="text-main text-truncate" title={topic.name} style={{ maxWidth: '78%' }}>
                                {topic.name}
                              </span>
                            )}
                            <span className="text-muted ms-auto">{topic.count}</span>
                          </div>
                          <div style={{ height: '5px', background: 'var(--bg-section)', border: '1px solid var(--border)' }}>
                            <div style={{ width, height: '100%', background: 'var(--primary)' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </Col>
          )}
        </Row>
      </Container>
      </div>{/* /lens-main-content */}
      </div>{/* /lens-layout-wrapper */}

      {/* ==================== 6. MODALS ==================== */}
      {/* 6.1 Save Query Modal */}
      <Modal
        show={showSaveQueryModal}
        onHide={() => setShowSaveQueryModal(false)}
        centered
        className="lens-modal"
      >
        <Modal.Header>
          <Modal.Title>{t('saveQueryTitle')}</Modal.Title>
          <button className="lens-modal-close-btn" onClick={() => setShowSaveQueryModal(false)}>x</button>
        </Modal.Header>
        <Form onSubmit={handleSaveQuery}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="saveQueryTitleInput">
              <Form.Label>{t('queryTitleLabel')}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t('queryTitleLabel')}
                value={queryTitle}
                onChange={(e) => setQueryTitle(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="saveQueryDescInput">
              <Form.Label>{t('queryDescLabel')}</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder={t('queryDescLabel')}
                value={queryDesc}
                onChange={(e) => setQueryDesc(e.target.value)}
              />
            </Form.Group>

            <div className="lens-modal-panel-title">
              {t('notificationsLabel')}
              <Icon icon="lucide:info" className="info-icon" width="14" />
            </div>
            <div className="lens-modal-panel-box">
              <Form.Check
                type="checkbox"
                id="notify-alert"
                label={t('notificationsLabel')}
                checked={queryNotify}
                onChange={(e) => setQueryNotify(e.target.checked)}
                className="mb-2 text-xs"
              />
              <Form.Check
                type="checkbox"
                id="email-alerts"
                label={t('emailAlertsLabel')}
                checked={queryEmailAlerts}
                onChange={(e) => setQueryEmailAlerts(e.target.checked)}
                className="text-xs"
              />
            </div>

            <div className="lens-modal-panel-title">
              {t('whoHasAccessLabel')}
            </div>
            <div className="lens-modal-panel-box">
              <Form.Check
                type="radio"
                name="queryAccess"
                id="access-restricted"
                label={t('restrictedAccessLabel')}
                checked={queryAccess === 'restricted'}
                onChange={() => setQueryAccess('restricted')}
                className="mb-2 text-xs"
              />
              <Form.Check
                type="radio"
                name="queryAccess"
                id="access-public"
                label={t('publicAccessLabel')}
                checked={queryAccess === 'public'}
                onChange={() => setQueryAccess('public')}
                className="text-xs"
              />
            </div>
          </Modal.Body>
          <div className="modal-footer border-top-0 d-flex justify-content-end gap-2 p-3 pt-0">
            <button
              type="button"
              className="lens-modal-btn-cancel"
              onClick={() => setShowSaveQueryModal(false)}
            >
              {t('cancel')}
            </button>
            <button type="submit" className="lens-modal-btn-save">
              {t('save')}
            </button>
          </div>
        </Form>
      </Modal>

      {/* 6.2 Share Modal */}
      <Modal
        show={showShareModal}
        onHide={() => setShowShareModal(false)}
        centered
        className="lens-modal"
      >
        <Modal.Header>
          <Modal.Title>{t('shareTitle')}</Modal.Title>
          <button className="lens-modal-close-btn" onClick={() => setShowShareModal(false)}>x</button>
        </Modal.Header>
        <Modal.Body>
          <div className="share-social-grid">
            <button
              className="share-social-btn twitter"
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(document.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
            >
              <Icon icon="ri:twitter-x-fill" width="16" />
              {t('shareTwitter')}
            </button>
            <button
              className="share-social-btn linkedin"
              onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
            >
              <Icon icon="ri:linkedin-box-fill" width="16" />
              {t('shareLinkedIn')}
            </button>
            <button
              className="share-social-btn facebook"
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
            >
              <Icon icon="ri:facebook-box-fill" width="16" />
              {t('shareFacebook')}
            </button>
            <button
              className="share-social-btn email"
              onClick={() => { window.location.href = `mailto:?subject=${encodeURIComponent(document.title)}&body=${encodeURIComponent(window.location.href)}`; }}
            >
              <Icon icon="ri:mail-fill" width="16" />
              {t('shareEmail')}
            </button>
          </div>

          <div className="lens-modal-panel-title mb-2">
            {t('copyLinkToShare')}
          </div>
          <div className="share-copy-group">
            <Form.Control
              type="text"
              readOnly
              value={window.location.href}
              className="share-copy-input"
            />
            <button
              type="button"
              className="share-copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success(t('linkCopied'));
              }}
              title="Copy Link"
            >
              <Icon icon="lucide:copy" width="16" />
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* 6.3 Export Modal */}
      <Modal
        show={showExportModal}
        onHide={() => setShowExportModal(false)}
        centered
        size="lg"
        className="lens-modal"
      >
        <Modal.Header>
          <Modal.Title>{t('export')}</Modal.Title>
          <button className="lens-modal-close-btn" onClick={() => setShowExportModal(false)}>x</button>
        </Modal.Header>
        <Form onSubmit={handleExportSubmit}>
          <Modal.Body>
            <div className="export-split-layout">
              {/* Left pane: export settings */}
              <div className="export-left-pane">
                <Form.Group className="mb-2" controlId="exportDocCountInput">
                  <Form.Label>Export current page</Form.Label>
                  <Form.Select
                    value={exportDocCount}
                    onChange={(e) => setExportDocCount(Number(e.target.value))}
                    className="form-control"
                  >
                    <option value={10}>10</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </Form.Select>
                  <span className="text-muted d-block mt-1 mb-2" style={{ fontSize: '0.68rem' }}>
                    Export is limited to the {articles.length} article(s) loaded on this page.
                  </span>
                </Form.Group>

                <Form.Group className="mb-2" controlId="exportFormatInput">
                  <Form.Label>{t('exportFileFormat')}</Form.Label>
                  <Form.Select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="form-control"
                  >
                    <option value="CSV">CSV</option>
                    <option value="JSON">JSON</option>
                  </Form.Select>
                  <span className="text-muted d-block mt-1 mb-2" style={{ fontSize: '0.68rem' }}>
                    {t('selectJsonLines')}
                  </span>
                </Form.Group>

                <div className="export-fields-header">
                  <span className="form-label mb-0">{t('exportFieldsLabel')}</span>
                  <div className="export-fields-icons">
                    <button
                      type="button"
                      className="export-fields-icon-btn text-success"
                      onClick={() => setExportFields({
                        title: true, authors: true, journal: true, doi: true,
                        issn: true, keywords: true, citations: true, year: true
                      })}
                      title={t('selectAll', 'Select All')}
                    >
                      <Icon icon="lucide:check-circle-2" width="16" />
                    </button>
                    <button
                      type="button"
                      className="export-fields-icon-btn text-danger"
                      onClick={() => setExportFields({
                        title: false, authors: false, journal: false, doi: false,
                        issn: false, keywords: false, citations: false, year: false
                      })}
                      title={t('deselectAll', 'Deselect All')}
                    >
                      <Icon icon="lucide:minus-circle" width="16" />
                    </button>
                  </div>
                </div>

                <div className="export-fields-grid">
                  <Form.Check
                    type="checkbox"
                    id="field-title"
                    label={t('colArticle')}
                    checked={exportFields.title}
                    onChange={(e) => setExportFields(prev => ({ ...prev, title: e.target.checked }))}
                    className="export-field-check"
                  />
                  <Form.Check
                    type="checkbox"
                    id="field-authors"
                    label={t('colAuthors')}
                    checked={exportFields.authors}
                    onChange={(e) => setExportFields(prev => ({ ...prev, authors: e.target.checked }))}
                    className="export-field-check"
                  />
                  <Form.Check
                    type="checkbox"
                    id="field-journal"
                    label={t('colJournal')}
                    checked={exportFields.journal}
                    onChange={(e) => setExportFields(prev => ({ ...prev, journal: e.target.checked }))}
                    className="export-field-check"
                  />
                  <Form.Check
                    type="checkbox"
                    id="field-doi"
                    label={t('colDoi')}
                    checked={exportFields.doi}
                    onChange={(e) => setExportFields(prev => ({ ...prev, doi: e.target.checked }))}
                    className="export-field-check"
                  />
                  <Form.Check
                    type="checkbox"
                    id="field-issn"
                    label={t('colIssn')}
                    checked={exportFields.issn}
                    onChange={(e) => setExportFields(prev => ({ ...prev, issn: e.target.checked }))}
                    className="export-field-check"
                  />
                  <Form.Check
                    type="checkbox"
                    id="field-keywords"
                    label={t('colKeywords')}
                    checked={exportFields.keywords}
                    onChange={(e) => setExportFields(prev => ({ ...prev, keywords: e.target.checked }))}
                    className="export-field-check"
                  />
                  <Form.Check
                    type="checkbox"
                    id="field-citations"
                    label={t('citedByLabel')}
                    checked={exportFields.citations}
                    onChange={(e) => setExportFields(prev => ({ ...prev, citations: e.target.checked }))}
                    className="export-field-check"
                  />
                  <Form.Check
                    type="checkbox"
                    id="field-year"
                    label={t('yearLabel')}
                    checked={exportFields.year}
                    onChange={(e) => setExportFields(prev => ({ ...prev, year: e.target.checked }))}
                    className="export-field-check"
                  />
                </div>

                <Form.Group className="mt-2" controlId="exportFileNameInput">
                  <Form.Label>{t('exportFileNameLabel')}</Form.Label>
                  <Form.Control
                    type="text"
                    value={exportFileName}
                    onChange={(e) => setExportFileName(e.target.value)}
                    placeholder="articles-export"
                  />
                </Form.Group>
              </div>

              {/* Right pane: export scope summary */}
              <div className="export-right-pane">
                <h6>Paper VN discovery data</h6>
                <p>Exports include only the currently loaded article rows and selected fields.</p>
                <div className="btn-enabled-lens">
                  <Icon icon="lucide:check-circle" width="14" />
                  Scope: Vietnamese universities
                </div>
              </div>
            </div>
          </Modal.Body>
          <div className="modal-footer border-top-0 d-flex justify-content-end gap-2 p-3 pt-0">
            <button
              type="button"
              className="lens-modal-btn-cancel"
              onClick={() => setShowExportModal(false)}
            >
              {t('cancel')}
            </button>
            <button type="submit" className="lens-modal-btn-save">
              {t('export')}
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
