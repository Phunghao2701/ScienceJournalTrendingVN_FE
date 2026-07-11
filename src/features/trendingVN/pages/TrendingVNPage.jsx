/**
 *
 * File: features\trendingVN\pages\TrendingVNPage.jsx
 */

import { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Form, Button, Badge, Modal, Dropdown } from 'react-bootstrap';
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
import SearchableSelect from '../../../shared/components/Select/SearchableSelect';
import TrendingArticleCard from '../components/TrendingArticleCard';
import AnalysisDashboard from '../components/analysis/AnalysisDashboard';
import { toast } from '../../../shared/utils/toast';
import { toScientificPlainText } from '../../../shared/utils/scientificMath';
import useAuth from '../../auth/hooks/useAuth';
import { useTrendingFilters } from '../hooks/useTrendingFilters';
import {
  TRENDING_VIEW_MODES,
  buildTrendingViewSearchParams,
  getTrendingViewFromParams,
  shouldCanonicalizeTrendingView,
  buildExactReturnToPath,
  resolveInstitutionSearchMatch,
} from '../utils/trendingViewParams';
import { computeYearChartLayout } from '../utils/paperVnAnalysis';
import '../trendingVN.css';

export default function TrendingVNPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const { user, logout, isAuthenticated, fetchProfile } = useAuth();
  const userDisplayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || user.email || 'Researcher'
    : 'Researcher';
  const viewMode = getTrendingViewFromParams(searchParams);
  const isAnalysisView = viewMode === TRENDING_VIEW_MODES.ANALYSIS;
  const [activeLeftTab, setActiveLeftTab] = useState(null); // 'filters', 'profile', 'info', 'more'
  const [activeTooltip, setActiveTooltip] = useState(null); // { name, count, x, y }
  const [drawerSelectOpen, setDrawerSelectOpen] = useState(null);
  const [statsExpanded, setStatsExpanded] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchProfile().catch(() => {});
    }
  }, [isAuthenticated, user, fetchProfile]);

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
  const institutionNameParam = (searchParams.get('institution_name') || '').trim();
  const entityLabels = useArticleEntityLabels(filters, {
    institutionNameParam,
    institutionList: analytics?.topInstitutions || [],
  });

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
  const [allExpanded, setAllExpanded] = useState(false);          // Toggle all abstracts
  const [showCustomise, setShowCustomise] = useState(false);

  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [groupingMode, setGroupingMode] = useState('none'); // 'none', 'simple-group', 'simple-expand', 'extended-group', 'extended-expand'

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
    publication: true,
    publisher: false,
    topic: false,
    keywords: false,
    issn: false,
    access: true,
    citations: true,
    references: true,
  });

  const toggleColumn = (key) => {
    setVisibleColumns(prev => {
      const nextColumns = { ...prev, [key]: !prev[key] };
      return Object.values(nextColumns).some(Boolean) ? nextColumns : prev;
    });
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

  const { journalOptions, topicOptions, institutionOptions } = useTrendingFilters();

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
    const institutionMatch = resolveInstitutionSearchMatch(
      localSearchInput,
      institutionOptions.map(inst => ({ id: inst.institution_id, display_name: inst.display_name }))
    );
    if (institutionMatch) {
      setLocalSearchInput('');
      updateFilters({ selectedInstitution: institutionMatch.id, institutionName: institutionMatch.name || null, search: '' });
      return;
    }
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
      const institutionDisplayName = entityLabels.institution || `#${filters.selectedInstitution}`;
      chips.push({ key: 'selectedInstitution', label: `Institution: ${institutionDisplayName}`, value: 'all' });
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

  const handleEntityFilter = (paramName, idValue, displayName) => {
    if (!idValue) return;
    if (paramName === 'institution_id' && idValue !== 'all') {
      updateFilters({ institution_id: idValue, institution_name: displayName || null });
    } else {
      updateFilters({ [paramName]: idValue });
    }
  };

  // Only positive local numeric institution IDs are actionable; the display name
  // rides along as institution_name URL metadata so the chip never falls back to
  // a bare `Institution #ID` after a standard click.
  const handleInstitutionFilter = (institution) => {
    const numericId = Number(institution?.id);
    if (!Number.isInteger(numericId) || numericId <= 0) return;
    const name = institution.display_name || institution.name || '';
    updateFilters({ selectedInstitution: numericId, institutionName: name || null });
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

  const authorCounts = useMemo(() => {
    return (analytics?.topAuthors || []).slice(0, 8);
  }, [analytics]);

  const institutionCounts = useMemo(() => {
    return (analytics?.topInstitutions || []).slice(0, 8);
  }, [analytics]);

  const keywordCounts = useMemo(() => {
    const sorted = analytics?.topKeywords || [];

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

  const maxKeywordCount = useMemo(() => {
    return Math.max(...keywordCounts.map((item) => item.count)) || 1;
  }, [keywordCounts]);

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

  const customiseColumns = useMemo(() => ([
    { key: 'article', label: t('colArticle') },
    { key: 'authors', label: t('colAuthors') },
    { key: 'journal', label: t('colJournal') },
    { key: 'publication', label: t('publicationDate') },
    { key: 'publisher', label: t('statPublishers') },
    { key: 'topic', label: t('statTopics') },
    { key: 'keywords', label: t('colKeywords') },
    { key: 'access', label: t('accessStatus') },
    { key: 'citations', label: t('citedByLabel') },
    { key: 'references', label: t('referencesLabel', 'References') },
    { key: 'doi', label: t('colDoi') },
    { key: 'issn', label: t('colIssn') },
  ]), [t]);

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const fmt = (n) => new Intl.NumberFormat().format(n || 0);

  const renderDrawerSearchSelect = ({ placeholder, value, onChange, options, children }) => (
    <div className="tvn-drawer-inline-select">
      <SearchableSelect
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        options={options}
      />
      {children}
    </div>
  );


  return (
    <div className="trending-vn-page">
      <Header />

      <div className="tvn-layout-wrapper">

        {/* ==================== LEFT ICON SIDEBAR (Lens-style) ==================== */}
        <aside className="tvn-left-sidebar">
          <button className="tvn-sidebar-icon-btn" title={t('home')} onClick={() => navigate('/')}>
            <Icon icon="lucide:home" width="18" />
          </button>
          <button className={`tvn-sidebar-icon-btn ${!activeLeftTab ? 'active' : ''}`} title={t('articleSearch')} onClick={() => setActiveLeftTab(prev => (prev ? null : 'filters'))}>
            <Icon icon="lucide:chevron-right" width="18" />
          </button>
          <button className={`tvn-sidebar-icon-btn ${activeLeftTab === 'filters' ? 'active' : ''}`} title={t('filtersLabel')} onClick={() => setActiveLeftTab(activeLeftTab === 'filters' ? null : 'filters')}>
            <Icon icon="lucide:filter" width="18" />
          </button>
          <button className={`tvn-sidebar-icon-btn ${activeLeftTab === 'profile' ? 'active' : ''}`} title={t('sbWorkArea')} onClick={() => setActiveLeftTab(activeLeftTab === 'profile' ? null : 'profile')}>
            <Icon icon="lucide:user-cog" width="18" />
          </button>
        </aside>

        {/* ==================== EXPANDED SIDEBAR DRAWER (Lens-style) ==================== */}
        <aside className={`tvn-expanded-sidebar ${activeLeftTab ? 'is-open' : 'is-closed'}`} aria-hidden={!activeLeftTab}>
            {/* 1. FILTERS TAB VIEW */}
            {activeLeftTab === 'filters' && (
              <div className="tvn-drawer-content">
                <div className="tvn-drawer-header">
                  <span className="tvn-drawer-title">{t('sbFilters')}</span>
                  <Icon icon="lucide:info" className="info-icon" width="14" style={{ color: 'var(--primary-hover)', cursor: 'pointer' }} />
                </div>
                <div className="tvn-drawer-scrollable">
                  {[
                    { key: 'dateRange', label: t('sbDateRange'), icon: 'lucide:calendar', select: 'dateRange' },
                    { key: 'accessStatus', label: t('accessStatus'), icon: 'lucide:lock-keyhole', select: 'access' },
                    { key: 'institutions', label: t('statInstitutions'), icon: 'lucide:building', select: 'institutions' },
                    { key: 'publishers', label: t('statPublishers'), icon: 'lucide:building-2', select: 'publishers' },
                    { key: 'authors', label: t('statAuthors'), icon: 'lucide:users', select: 'authors' },
                    { key: 'topics', label: t('statTopics'), icon: 'lucide:tags', select: 'topics' },
                    { key: 'journals', label: t('statJournals'), icon: 'lucide:book-open', select: 'journals' },
                    { key: 'docFamily', label: t('sbDocFamily'), icon: 'lucide:folder-tree', action: () => {
                      setGroupingMode(prev => prev === 'none' ? 'simple-group' : 'none');
                    }},
                    { key: 'queryTools', label: t('sbQueryTools'), icon: 'lucide:settings', action: () => {
                      setShowCustomise(prev => !prev);
                    }},
                    { key: 'newSearch', label: t('sbNewSearch'), icon: 'lucide:search', action: () => {
                      handleClearSearch();
                    }}
                  ].map(item => (
                    <div key={item.key}>
                      <div
                        className="tvn-drawer-item"
                        onClick={item.select
                          ? () => setDrawerSelectOpen(prev => (prev === item.select ? null : item.select))
                          : (item.action || (() => {}))}
                      >
                        <Icon icon={item.icon} width="16" className="item-icon" />
                        <span className="item-label">{item.label}</span>
                        <Icon icon="lucide:chevron-right" width="12" className="item-arrow ms-auto" />
                      </div>
                      {item.select === 'journals' && drawerSelectOpen === 'journals' && (
                        renderDrawerSearchSelect({
                          placeholder: `${t('journalLabel')}...`,
                          value: filters.selectedJournal !== 'all' ? filters.selectedJournal : '',
                          onChange: (id) => updateFilters({ selectedJournal: id || 'all' }),
                          options: journalOptions.map(j => ({ value: j.journal_id, label: j.display_name })),
                        })
                      )}
                      {item.select === 'publishers' && drawerSelectOpen === 'publishers' && (
                        renderDrawerSearchSelect({
                          placeholder: 'Publisher...',
                          value: filters.selectedPublisher !== 'all' ? filters.selectedPublisher : '',
                          onChange: (id) => updateFilters({ selectedPublisher: id || 'all' }),
                          options: (analytics?.topPublishers || []).map(p => ({ value: p.id, label: p.display_name || p.name })),
                        })
                      )}
                      {item.select === 'institutions' && drawerSelectOpen === 'institutions' && (
                        renderDrawerSearchSelect({
                          placeholder: `${t('statInstitutions')}...`,
                          value: filters.selectedInstitution !== 'all' ? filters.selectedInstitution : '',
                          onChange: (id) => {
                            if (!id) { updateFilters({ selectedInstitution: 'all', institutionName: null }); return; }
                            const match = institutionOptions.find(inst => String(inst.institution_id) === String(id));
                            updateFilters({ selectedInstitution: Number(id), institutionName: match?.display_name || null });
                          },
                          options: institutionOptions.map(inst => ({ value: inst.institution_id, label: inst.display_name })),
                        })
                      )}
                      {item.select === 'authors' && drawerSelectOpen === 'authors' && (
                        renderDrawerSearchSelect({
                          placeholder: 'Author...',
                          value: filters.selectedAuthor !== 'all' ? filters.selectedAuthor : '',
                          onChange: (id) => {
                            if (!id) { updateFilters({ selectedAuthor: 'all' }); return; }
                            handleEntityFilter('author_id', id);
                          },
                          options: authorCounts.filter(a => a.id && a.name && a.name !== 'Unknown').map(a => ({ value: a.id, label: a.name })),
                        })
                      )}
                      {item.select === 'topics' && drawerSelectOpen === 'topics' && (
                        renderDrawerSearchSelect({
                          placeholder: 'Topic...',
                          value: filters.selectedTopic !== 'all' ? filters.selectedTopic : '',
                          onChange: (id) => {
                            if (!id) { updateFilters({ selectedTopic: 'all' }); return; }
                            handleEntityFilter('topic_id', id);
                          },
                          options: topicOptions.map(tp => ({ value: tp.topic_id || tp.id, label: tp.display_name })),
                        })
                      )}
                      {item.select === 'access' && drawerSelectOpen === 'access' && (
                        <div className="tvn-drawer-inline-select d-flex gap-2">
                          {[
                            { key: 'all', label: t('accessAllLabel') },
                            { key: 'oa', label: t('openAccess') },
                            { key: 'closed', label: t('closedAccess') },
                          ].map(opt => (
                            <button
                              key={opt.key}
                              type="button"
                              className={`tvn-inline-pill ${filters.selectedAccess === opt.key || (opt.key === 'all' && (!filters.selectedAccess || filters.selectedAccess === 'all')) ? 'active' : ''}`}
                              onClick={() => updateFilters({ access: opt.key })}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                      {item.select === 'dateRange' && drawerSelectOpen === 'dateRange' && (
                        <div className="tvn-drawer-inline-select d-flex gap-2">
                          <SearchableSelect
                            placeholder={t('fromYearLabel')}
                            value={filters.fromYear || ''}
                            onChange={(y) => updateFilters({ fromYear: y })}
                            options={yearCounts.map(y => ({ value: y.year, label: y.year }))}
                          />
                          <SearchableSelect
                            placeholder={t('toYearLabel')}
                            value={filters.toYear || ''}
                            onChange={(y) => updateFilters({ toYear: y })}
                            options={yearCounts.map(y => ({ value: y.year, label: y.year }))}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. PROFILE / WORK AREA TAB VIEW */}
            {activeLeftTab === 'profile' && (
              <div className="tvn-drawer-content">
                {isAuthenticated ? (
                  <Dropdown className="w-100">
                    <Dropdown.Toggle
                      as="div"
                      id="profile-dropdown-toggle"
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="tvn-profile-block">
                        <div className="tvn-profile-avatar">
                          {userDisplayName !== 'Researcher' ? getInitials(userDisplayName) : 'TM'}
                        </div>
                        <div className="tvn-profile-info">
                          <div className="profile-name">{userDisplayName}</div>
                          <div className="profile-subtitle">
                            {t('personalAccount')}{' '}
                            <span className="text-danger" style={{ fontSize: '0.62rem', display: 'block' }}>
                              ({t('notCommercialUse')})
                            </span>
                          </div>
                        </div>
                        <Icon icon="lucide:chevron-down" width="16" className="text-muted ms-auto" />
                      </div>
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="w-100 text-xs shadow-sm" style={{ border: '1px solid var(--border)', padding: '4px 0' }}>
                      <Dropdown.Item onClick={() => navigate('/profile')} className="d-flex align-items-center gap-2 py-2">
                        <Icon icon="lucide:user" width="14" />
                        <span>{t('profile') || 'Profile'}</span>
                      </Dropdown.Item>
                      <Dropdown.Divider className="my-1" />
                      <Dropdown.Item onClick={() => logout(null)} className="d-flex align-items-center gap-2 py-2 text-danger">
                        <Icon icon="lucide:log-out" width="14" />
                        <span>{t('logoutLabel')}</span>
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                ) : (
                  <div
                    className="tvn-profile-block"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/login')}
                  >
                    <div className="tvn-profile-avatar" style={{ backgroundColor: 'var(--primary-light, #eef6ff)', color: 'var(--primary, #1976d2)' }}>
                      <Icon icon="lucide:log-in" width="16" />
                    </div>
                    <div className="tvn-profile-info">
                      <div className="profile-name text-primary fw-bold">{t('signIn') || 'Đăng nhập'}</div>
                      <div className="profile-subtitle">{t('clickToLogin') || 'Bấm để đăng nhập'}</div>
                    </div>
                    <Icon icon="lucide:chevron-right" width="16" className="text-muted ms-auto" />
                  </div>
                )}

                <div className="tvn-profile-actions">
                  <Dropdown className="flex-fill">
                    <Dropdown.Toggle variant="outline-primary" size="sm" className="w-100 font-sans text-xs d-flex align-items-center justify-content-between">
                      {t('sbNewItem')}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="text-xs">
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

                <div className="tvn-drawer-section-title">{t('sbWorkArea')}</div>
                <div className="tvn-drawer-scrollable">
                  {[
                    { key: 'searchHistory', label: t('sbSearchHistory'), icon: 'lucide:search' },
                    { key: 'collections', label: t('sbCollections'), icon: 'lucide:folder', action: () => navigate('/bookmarks') },
                    { key: 'dashboards', label: t('sbDashboards'), icon: 'lucide:bar-chart-2', action: () => navigate('/') },
                    { key: 'notes', label: t('sbNotes'), icon: 'lucide:file-text' },
                    { key: 'tags', label: t('sbTags'), icon: 'lucide:tag' },
                    { key: 'authorship', label: t('sbAuthorship'), icon: 'lucide:users' },
                    { key: 'notifications', label: t('sbNotifications'), icon: 'lucide:bell' },
                    { key: 'mediaLibrary', label: t('sbMediaLibrary'), icon: 'lucide:image' }
                  ].map(item => (
                    <div
                      key={item.key}
                      className="tvn-drawer-item"
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
        </aside>

        {/* ==================== MAIN CONTENT AREA ==================== */}
        <div className="tvn-main-content">
        <Container fluid className="p-0">

        {/* ==================== 1. TOP INFO BAR ==================== */}
        <div className="tvn-top-info-bar">
          <div className="total-count">
            <Icon icon="lucide:search" width="13" className="me-1" />
            {t('databaseArticlesCount', { count: fmt(isAnalysisView ? activeResultTotal : stats.totalArticles) })}
          </div>
        </div>

        {/* ==================== 2. PAGE TITLE ==================== */}
        <h1 className="tvn-page-title">{t('articleSearchResults')}</h1>

        {/* ==================== 3. FILTER INDICATOR ==================== */}
        <div className="tvn-filter-indicator">
          <button type="button" className="filter-count-link" onClick={clearFilters}>
            {t('databaseArticlesCount', { count: fmt(activeResultTotal) })}
          </button>
          <span className="tvn-filter-divider" aria-hidden="true">-</span>
          <span className="tvn-filter-status">
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
        <div className="tvn-stats-bar">
          {(() => {
            const segments = [
              {
                key: 'articles',
                color: '#00acc1',
                label: t('statArticleRecords'),
                loading: isAnalysisView && isAnalysisLoading,
                value: fmt(isAnalysisView ? activeResultTotal : (stats.totalArticles || total)),
              },
              {
                key: 'openAccess',
                color: '#0288d1',
                label: t('openAccess'),
                loading: isAnalysisView ? isAnalysisLoading : isLoading,
                value: fmt(openAccessTotal),
              },
              {
                key: 'authors',
                color: '#7b1fa2',
                label: t('statAuthors'),
                loading: isAnalysisView ? isAnalysisLoading : isAnalyticsLoading,
                value: fmt(authorTotal),
              },
              isAnalysisView
                ? {
                    key: 'institutions',
                    color: '#475569',
                    label: t('statInstitutions'),
                    loading: isAnalysisLoading,
                    value: fmt(institutionTotal),
                  }
                : {
                    key: 'topics',
                    color: '#475569',
                    label: t('statTopics'),
                    loading: isAnalyticsLoading,
                    value: fmt(topicTotal),
                  },
              !isAnalysisView && publisherTotal > 0 && {
                key: 'publishers',
                color: '#334155',
                label: t('statPublishers'),
                loading: isAnalyticsLoading,
                value: fmt(publisherTotal),
              },
              journalTotal > 0 && {
                key: 'journals',
                color: '#2e7d32',
                label: t('statJournals'),
                loading: isAnalysisView ? isAnalysisLoading : isAnalyticsLoading,
                value: fmt(journalTotal),
              },
              isAnalysisView && citationsTotal > 0 && {
                key: 'citations',
                color: '#c62828',
                label: t('statCitations'),
                loading: isAnalysisLoading,
                value: fmt(citationsTotal),
              },
            ].filter(Boolean);

            const visibleSegments = statsExpanded ? segments : segments.slice(0, 4);
            const hiddenCount = segments.length - visibleSegments.length;

            return (
              <>
                {visibleSegments.map((segment) => (
                  <div className="stat-segment" key={segment.key}>
                    <div className="stat-color-bar" style={{ background: segment.color }} />
                    <div className="stat-label">{segment.label}</div>
                    <div className="stat-value">{segment.loading ? '...' : segment.value}</div>
                  </div>
                ))}
                {segments.length > 4 && (
                  <button
                    type="button"
                    className="stat-segment-toggle"
                    onClick={() => setStatsExpanded((prev) => !prev)}
                  >
                    {statsExpanded ? t('showLessStats') : t('showMoreStats', { count: hiddenCount })}
                  </button>
                )}
              </>
            );
          })()}
        </div>

        {/* ==================== 5. STICKY TOP TOOLBAR (FULL WIDTH) ==================== */}
        <div className="tvn-sticky-results-toolbar">
          {/* --- Tab row --- */}
          <div className="tvn-tab-row">
            <div className="tab-group">
              <button className="tab-item active">
                {t('articles')}
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
          <div className="tvn-action-toolbar">
            <div className="action-group">
              {!isAnalysisView && (
                <>
                  <button className="tvn-action-btn" onClick={handleToggleAllAbstracts}>
                    <Icon icon={allExpanded ? "lucide:chevron-up" : "lucide:chevron-down"} width="12" />
                    {allExpanded ? t('collapseAbstract') : t('expand')}
                  </button>
                  <span className="action-sep" style={{ color: '#cbd5e1' }}>|</span>
                  <button className="tvn-action-btn" onClick={() => setShowCustomise(!showCustomise)}>
                    <Icon icon="lucide:list-checks" width="12" />
                    {t('customiseList')}
                  </button>
                  <span className="action-sep" style={{ color: '#cbd5e1' }}>|</span>
                </>
              )}
              <button className="tvn-action-btn" onClick={() => setShowShareModal(true)}>
                <Icon icon="lucide:share-2" width="12" />
                {t('share')}
              </button>
              {!isAnalysisView && (
                <>
                  <span className="action-sep" style={{ color: '#cbd5e1' }}>|</span>
                  <button className="tvn-action-btn" onClick={() => setShowExportModal(true)}>
                    <Icon icon="lucide:download" width="12" />
                    {t('export')}
                  </button>
                </>
              )}
            </div>

            {/* Right side of Action toolbar: Sort + Search */}
            <div className="tvn-toolbar-controls">
              {/* Sort dropdown */}
              {!isAnalysisView && (
                <div className="d-flex align-items-center gap-2">
                  <Icon icon="lucide:arrow-up-down" width="12" className="text-muted" />
                  <select
                    className="tvn-sort-select"
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
              <Form onSubmit={handleSearchSubmit} className="tvn-search-form">
                <div className="tvn-search-group" style={{ height: '32px', minHeight: '32px' }}>
                  <span className="d-flex align-items-center ps-2 pe-1" style={{ background: 'transparent' }}>
                    <Icon icon="lucide:search" width="14" className="text-muted" />
                  </span>
                  <Form.Control
                    placeholder={t('searchPlaceholder')}
                    value={localSearchInput}
                    onChange={(e) => setLocalSearchInput(e.target.value)}
                    className="tvn-search-input py-1"
                    style={{ fontSize: '0.8rem' }}
                  />
                  {localSearchInput && (
                    <Button variant="link" className="p-0 px-2 text-muted" onClick={handleClearSearch}>
                      <Icon icon="lucide:x" width="12" />
                    </Button>
                  )}
                  <Button type="submit" className="tvn-search-btn py-1 px-3">
                    {t('search')}
                  </Button>
                </div>
              </Form>
            </div>
          </div>

          {/* --- Panel Customise Your Results View --- */}
          {!isAnalysisView && showCustomise && (
            <div className="tvn-customise-panel">
              <div className="customise-title">{t('customiseYourResultsView')}</div>
              <div className="customise-grid">
                {customiseColumns.map(col => (
                  <Form.Check
                    key={col.key}
                    type="checkbox"
                    id={`customise-col-${col.key}`}
                    label={col.label}
                    checked={Boolean(visibleColumns[col.key])}
                    onChange={() => toggleColumn(col.key)}
                    className="customise-check"
                  />
                ))}
              </div>
            </div>
          )}

          {/* --- Active filter chips --- */}
          {activeChips.length > 0 && (
            <div className="tvn-chips-bar">
              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{t('filterSearch')}:</span>
              {activeChips.map(chip => (
                <span key={chip.key} className="tvn-filter-chip">
                  {chip.label}
                  <Icon
                    icon="lucide:x"
                    width="11"
                    className="tvn-chip-close"
                    onClick={() => (chip.onRemove ? chip.onRemove() : updateFilters({ [chip.key]: chip.value }))}
                  />
                </span>
              ))}
              {hasActiveFilters && (
                <button className="tvn-clear-link" onClick={clearFilters}>
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
            <div className="tvn-results-body">
              {isAnalysisView ? (
                <AnalysisDashboard
                  analysis={analysis}
                  isLoading={isAnalysisLoading}
                  error={analysisError}
                  onEntityClick={handleEntityFilter}
                  onArticleClick={handleDetailClick}
                  onRetry={refetchAnalysis}
                  onYearRangeChange={(fromYear, toYear) => updateFilters({ fromYear, toYear })}
                />
              ) : isLoading && articles.length === 0 ? (
                <div className="d-flex flex-column gap-0">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="tvn-article-card p-3">
                      <div className="tvn-skeleton mb-2" style={{ width: '100px', height: '12px' }} />
                      <div className="tvn-skeleton mb-2" style={{ width: '80%', height: '16px' }} />
                      <div className="tvn-skeleton mb-1" style={{ width: '60%', height: '11px' }} />
                      <div className="tvn-skeleton" style={{ width: '40%', height: '11px' }} />
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
                      <div key={groupName} className="tvn-group-section mb-3 border rounded shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
                        <div className="tvn-group-header p-2 d-flex align-items-center justify-content-between bg-light border-bottom">
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
                <div className="tvn-pagination-row">
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
            <Col lg={4} md={12} className="tvn-sidebar-col">

              <div className="tvn-sidebar-panel tvn-institutions-panel">
                {institutionCounts.length > 0 ? (
                  <>
                    <div className="tvn-sidebar-title">{t('topVietnameseInstitutions')}</div>
                    <div className="institution-tvn-grid">
                      {institutionCounts.map((institution, index) => {
                        const institutionName = institution.display_name || institution.name || 'Unknown institution';
                        const institutionIdValue = Number(institution.id);
                        const canFilterInstitution = Number.isInteger(institutionIdValue) && institutionIdValue > 0;
                        const isLastColumn = (index + 1) % 4 === 0;
                        const remainingCells = institutionCounts.length % 4 || 4;
                        const isLastRow = index >= institutionCounts.length - remainingCells;
                        return (
                          <button
                            key={institution.id || institutionName || index}
                            type="button"
                            className={`institution-grid-cell ${isLastColumn ? 'last-col' : ''} ${isLastRow ? 'last-row' : ''}`}
                            onClick={() => handleInstitutionFilter(institution)}
                            disabled={!canFilterInstitution}
                            title={canFilterInstitution ? `Filter articles by ${institutionName}` : institutionName}
                            aria-label={canFilterInstitution ? `Filter articles by ${institutionName}` : institutionName}
                          >
                            <span className="institution-logo-container">
                              <Icon icon="lucide:building-2" className="institution-logo-icon" width="28" />
                            </span>
                            <span className="institution-grid-name" title={institutionName}>
                              {institutionName}
                            </span>
                            <span className="institution-grid-count">{fmt(institution.count)}</span>
                          </button>
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

              <div className="tvn-sidebar-panel tvn-authors-panel">
                <div className="tvn-sidebar-title">{t('topAuthors')}</div>
                {authorCounts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {t('anyTopic')}
                  </div>
                ) : (
                  <div className="tvn-chart-frame tvn-author-chart-frame">
                    <svg className="tvn-sidebar-chart-svg tvn-author-chart-svg" viewBox="0 0 330 230" width="100%">
                      {/* Vertical grid lines and scale labels */}
                      {(() => {
                        const counts = authorCounts.map(item => item.count);
                        const maxVal = Math.max(...counts, 0);
                        const scaleMax = Math.max(5, Math.ceil(maxVal / 5) * 5);
                        const xTicks = Array.from({ length: 6 }, (_, i) => i * (scaleMax / 5));
                        const chartLeft = 118;
                        const chartRight = 296;
                        const chartTop = 12;
                        const chartBottom = 204;

                        return xTicks.map((tickVal) => {
                          const x = chartLeft + (tickVal / scaleMax) * (chartRight - chartLeft);
                          return (
                            <g key={tickVal}>
                              <line
                                x1={x}
                                y1={chartTop}
                                x2={x}
                                y2={chartBottom}
                                stroke="var(--border)"
                                strokeWidth="0.5"
                                strokeDasharray="3 3"
                                opacity="0.6"
                              />
                              <text
                                x={x}
                                y={220}
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

                      <line x1={118} y1={12} x2={118} y2={204} stroke="var(--border-dark)" strokeWidth="1" />
                      <line x1={118} y1={204} x2={296} y2={204} stroke="var(--border-dark)" strokeWidth="1" />

                      {/* Horizontal bars with readable author labels */}
                      {(() => {
                        const counts = authorCounts.map(item => item.count);
                        const maxVal = Math.max(...counts, 0);
                        const scaleMax = Math.max(5, Math.ceil(maxVal / 5) * 5);
                        const greenShades = ['#09542c', '#23884f', '#4fae6f', '#78c68e', '#9fd9ae', '#c2ebcc', '#dbf2e3', '#e8f8ed'];
                        const chartLeft = 118;
                        const chartRight = 296;
                        const rowHeight = 22;
                        const barHeight = 12;
                        const chartTop = 18;

                        return authorCounts.map((item, idx) => {
                          const rowY = chartTop + idx * rowHeight;
                          const barWidth = scaleMax > 0 ? (item.count / scaleMax) * (chartRight - chartLeft) : 0;
                          const barY = rowY + 4;
                          const color = greenShades[Math.min(idx, greenShades.length - 1)];
                          const canFilterAuthor = Boolean(item.id) && item.name && item.name !== 'Unknown';
                          const authorLabel = item.name && item.name.length > 18 ? `${item.name.slice(0, 17)}...` : item.name;
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
                              <text
                                x={110}
                                y={barY + barHeight / 2}
                                textAnchor="end"
                                dominantBaseline="middle"
                                fontSize="8"
                                fill="var(--text-main)"
                                fontWeight="600"
                                style={{ cursor: canFilterAuthor ? 'pointer' : 'default' }}
                                onClick={activateAuthor}
                              >
                                <title>{item.name}</title>
                                {authorLabel}
                              </text>
                              <rect
                                x={chartLeft}
                                y={barY}
                                width={barWidth}
                                height={barHeight}
                                rx="3"
                                fill={color}
                                opacity="0.85"
                                className="tvn-chart-bar"
                                style={{ transition: 'opacity 0.15s ease', cursor: canFilterAuthor ? 'pointer' : 'default' }}
                                role={canFilterAuthor ? 'button' : undefined}
                                tabIndex={canFilterAuthor ? 0 : undefined}
                                aria-label={canFilterAuthor ? `Filter by author ${item.name}` : undefined}
                                onClick={activateAuthor}
                                onKeyDown={handleAuthorKeyDown}
                                onMouseEnter={() => setActiveTooltip({
                                  name: item.name,
                                  count: item.count,
                                  x: chartLeft + barWidth,
                                  y: barY
                                })}
                                onMouseLeave={() => setActiveTooltip(null)}
                              />
                              <text
                                x={Math.min(chartRight + 4, chartLeft + barWidth + 4)}
                                y={barY + barHeight / 2}
                                textAnchor="start"
                                dominantBaseline="middle"
                                fontSize="8"
                                fill="var(--text-main)"
                                fontWeight="700"
                              >
                                {fmt(item.count)}
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
                          top: `${(activeTooltip.y / 230) * 100}%`,
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

              <div className="tvn-sidebar-panel tvn-topics-panel">
                <div className="tvn-sidebar-title">{t('topKeywords')}</div>
                {keywordCounts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {t('anyTopic')}
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {keywordCounts.map((keyword, idx) => {
                      const canFilterKeyword = Boolean(keyword.id) && keyword.name && keyword.name !== 'Unknown' && keyword.name !== t('others');
                      const width = `${Math.max(6, Math.round((keyword.count / maxKeywordCount) * 100))}%`;
                      return (
                        <div key={keyword.id || keyword.name || idx}>
                          <div className="d-flex align-items-center gap-2 text-xs">
                            {canFilterKeyword ? (
                              <button
                                type="button"
                                className="text-main p-0 text-truncate"
                                title={`${keyword.name}: ${keyword.count}`}
                                onClick={() => handleEntityFilter('keyword_id', keyword.id)}
                                style={{ background: 'none', border: 0, textAlign: 'left', maxWidth: '78%' }}
                              >
                                {keyword.name}
                              </button>
                            ) : (
                              <span className="text-main text-truncate" title={keyword.name} style={{ maxWidth: '78%' }}>
                                {keyword.name}
                              </span>
                            )}
                            <span className="text-muted ms-auto">{keyword.count}</span>
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

              <div className="tvn-sidebar-panel tvn-daterange-panel">
                <div className="tvn-sidebar-title">{t('publicationDate')}</div>
                {articles.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {t('anyTopic')}
                  </div>
                ) : (
                  <div className="tvn-chart-frame tvn-date-chart-frame">
                    <svg className="tvn-sidebar-chart-svg tvn-date-chart-svg" viewBox="0 0 200 100" width="100%">
                      {/* Elegant background grid lines */}
                      <line x1="8" y1="18" x2="192" y2="18" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.6" />
                      <line x1="8" y1="38" x2="192" y2="38" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.6" />
                      <line x1="8" y1="58" x2="192" y2="58" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.6" />

                      {yearChartLayout.columns.map((item, idx) => {
                        const colWidth = item.width;
                        const colHeight = maxYearCount > 0 ? (item.count / maxYearCount) * 60 : 0;
                        const y = 78 - colHeight;
                        const yearLabelStep = yearChartLayout.columns.length > 12 ? 3 : (yearChartLayout.columns.length > 8 ? 2 : 1);
                        const lastYearIndex = yearChartLayout.columns.length - 1;
                        const showYearLabel = idx === 0
                          || idx === lastYearIndex
                          || (idx % yearLabelStep === 0 && idx <= lastYearIndex - yearLabelStep);
                        const isMaxYearCount = item.count === maxYearCount;
                        const showValueLabel = item.count > 0 && (isMaxYearCount || idx === lastYearIndex);
                        const valueLabelY = Math.max(8, y - 4);
                        const canFilterYear = Boolean(item.year) && item.count > 0;
                        const activateYear = () => {
                          if (canFilterYear) updateFilters({ fromYear: item.year, toYear: item.year });
                        };
                        const handleYearKeyDown = (event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            activateYear();
                          }
                        };
                        return (
                          <g key={item.year}>
                            <rect
                              x={item.x} y={y}
                              width={colWidth} height={colHeight}
                              rx="2"
                              fill="#1976D2"
                              opacity="0.85"
                              className="tvn-chart-bar"
                              style={{ transition: 'opacity 0.15s ease', cursor: canFilterYear ? 'pointer' : 'default' }}
                              role={canFilterYear ? 'button' : undefined}
                              tabIndex={canFilterYear ? 0 : undefined}
                              aria-label={canFilterYear ? `${t('publicationYear')}: ${item.year} (${item.count})` : undefined}
                              onClick={activateYear}
                              onKeyDown={handleYearKeyDown}
                            >
                              <title>{`${item.year}: ${fmt(item.count)}`}</title>
                            </rect>
                            {showYearLabel && (
                              <text
                                x={item.x + colWidth / 2}
                                y="92"
                                textAnchor="middle"
                                fontSize={yearChartLayout.columns.length > 12 ? '5.8' : '6.5'}
                                fill="var(--text-muted)"
                                fontWeight="600"
                              >
                                {item.year}
                              </text>
                            )}
                            {showValueLabel && (
                              <text
                                x={item.x + colWidth / 2}
                                y={valueLabelY}
                                textAnchor="middle"
                                fontSize="6.5"
                                fontWeight="700"
                                fill="var(--text-main)"
                              >
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
                <div className="tvn-chart-hint">
                  <Icon icon="lucide:mouse-pointer-click" width="10" className="me-1" />
                  {t('chartHint')}
                </div>
              </div>

            </Col>
          )}
        </Row>
      </Container>
      </div>{/* /tvn-main-content */}
      </div>{/* /tvn-layout-wrapper */}

      {/* ==================== 6. MODALS ==================== */}
      {/* 6.1 Share Modal */}
      <Modal
        show={showShareModal}
        onHide={() => setShowShareModal(false)}
        centered
        className="tvn-modal"
      >
        <Modal.Header>
          <Modal.Title>{t('shareTitle')}</Modal.Title>
          <button className="tvn-modal-close-btn" onClick={() => setShowShareModal(false)}>x</button>
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

          <div className="tvn-modal-panel-title mb-2">
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
        className="tvn-modal"
      >
        <Modal.Header>
          <Modal.Title>{t('export')}</Modal.Title>
          <button className="tvn-modal-close-btn" onClick={() => setShowExportModal(false)}>x</button>
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
              className="tvn-modal-btn-cancel"
              onClick={() => setShowExportModal(false)}
            >
              {t('cancel')}
            </button>
            <button type="submit" className="tvn-modal-btn-save">
              {t('export')}
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
