import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';
import { BookmarkCheck, Bookmark, Search, RefreshCw, AlertCircle, BarChart3, List } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../../landing/components/Header';
import { useAuthStore } from '../../../app/store/authStore';
import { useBookmarkStore } from '../store/bookmarkStore';
import {
  getBookmarkUserId,
  getBookmarksQueryKey,
  isBookmarkSessionCurrent,
  removeBookmarkFromList,
} from '../services/bookmarkQueryContract';
import { bookmarksQueryOptions } from '../services/bookmarkQueries';
import { toast } from '../../../shared/utils/toast';
import AnalysisDashboard from '../../trendingVN/components/analysis/AnalysisDashboard';
import WorkspaceSidebar from '../../trendingVN/components/WorkspaceSidebar';
import BookmarkItem from '../components/BookmarkItem';
import { ArticleCardSkeleton } from '../../../shared/components/LoadingSkeleton';
import '../../trendingVN/trendingVN.css';
import './BookmarksPage.css';

export default function BookmarksPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = useAuthStore(getBookmarkUserId);
  const bookmarksQueryKey = useMemo(() => getBookmarksQueryKey(userId), [userId]);

  // Chỉ subscribe vào slice cần thiết, tránh re-render không cần thiết
  const toggleBookmark = useBookmarkStore((state) => state.toggleBookmark);
  const hydrateFromList = useBookmarkStore((state) => state.hydrateFromList);

  const bookmarksQuery = useQuery({
    ...bookmarksQueryOptions(userId),
    enabled: Boolean(userId),
  });
  const refetchBookmarks = bookmarksQuery.refetch;

  // Đồng bộ store IDs từ query cache sau prefetch/refetch; không phát sinh request mới.
  const bookmarkItems = bookmarksQuery.data;
  useEffect(() => {
    if (bookmarkItems) hydrateFromList(bookmarkItems, userId);
  }, [bookmarkItems, hydrateFromList, userId]);

  const sortedBookmarks = useMemo(() => (
    [...(bookmarksQuery.data || [])].sort(
      (a, b) => new Date(b.bookmarked_at || 0) - new Date(a.bookmarked_at || 0)
    )
  ), [bookmarksQuery.data]);

  const [viewTab, setViewTab] = useState('list');

  // Tách heavy computation analysis data vào useMemo riêng với dependency chặt chẽ
  const bookmarkAnalysisData = useMemo(() => {
    if (!sortedBookmarks.length) return null;

    const scholarlyWorks = sortedBookmarks.length;
    let totalCitations = 0;
    let totalReferences = 0;
    let openAccessWorks = 0;

    const yearCounts = {};
    const yearCitations = {};
    const journalCounts = {};
    const authorCounts = {};
    const instCounts = {};

    for (const item of sortedBookmarks) {
      const cit = Number(item.citation_count || item.citations || 0);
      const ref = Number(item.reference_count || item.references || 0);
      totalCitations += cit;
      totalReferences += ref;

      const isOa = item.open_access === true || item.access === 'oa' || item.access_type?.toLowerCase() === 'oa';
      if (isOa) openAccessWorks += 1;

      const year = item.publication_year;
      if (year) {
        yearCounts[year] = (yearCounts[year] || 0) + 1;
        yearCitations[year] = (yearCitations[year] || 0) + cit;
      }

      const jName = item.journal_name || item.journal?.name || item.journal_id || 'Unknown Journal';
      journalCounts[jName] = (journalCounts[jName] || 0) + 1;

      const authors = Array.isArray(item.authors)
        ? item.authors.map(a => a.name || a)
        : (typeof item.authors === 'string' ? item.authors.split(',').map(s => s.trim()) : []);
      for (const auth of authors) {
        if (auth) authorCounts[auth] = (authorCounts[auth] || 0) + 1;
      }

      const insts = Array.isArray(item.institutions)
        ? item.institutions.map(i => i.name || i)
        : (typeof item.institutions === 'string' ? item.institutions.split(',').map(s => s.trim()) : []);
      for (const inst of insts) {
        if (inst) instCounts[inst] = (instCounts[inst] || 0) + 1;
      }
    }

    const years = Object.keys(yearCounts).map(Number).sort((a, b) => a - b);
    const fromYear = years[0] || new Date().getFullYear() - 5;
    const toYear = years[years.length - 1] || new Date().getFullYear();

    const worksOverTime = Object.entries(yearCounts)
      .map(([year, count]) => ({ year: Number(year), count: Number(count) }))
      .sort((a, b) => a.year - b.year);

    const citationsOverTime = Object.entries(yearCitations)
      .map(([year, citations]) => ({
        year: Number(year),
        citations: Number(citations),
        coverage_articles: yearCounts[year] || 0,
        total_articles_with_history: yearCounts[year] || 0,
      }))
      .sort((a, b) => a.year - b.year);

    const mapToEntities = (counts) =>
      Object.entries(counts)
        .map(([name, count], index) => ({
          rank: index + 1,
          entity_id: name,
          display_name: name,
          current_count: count,
          previous_count: 0,
          absolute_growth: count,
          growth_rate: null,
        }))
        .sort((a, b) => b.current_count - a.current_count)
        .slice(0, 10);

    const topJournals = mapToEntities(journalCounts);
    const topAuthors = mapToEntities(authorCounts);
    const topInstitutions = mapToEntities(instCounts);

    const trendingArticles = sortedBookmarks
      .map((item) => ({
        article_id: item.article_id,
        title: item.title || 'Untitled Article',
        publication_year: item.publication_year,
        citation_count: Number(item.citation_count || item.citations || 0),
        reference_count: Number(item.reference_count || item.references || 0),
        current_citations: Number(item.citation_count || item.citations || 0),
        previous_citations: 0,
        absolute_growth: Number(item.citation_count || item.citations || 0),
        growth_rate: null,
      }))
      .sort((a, b) => b.citation_count - a.citation_count);

    return {
      scope: 'vn_universities',
      window: {
        current: { from_year: fromYear, to_year: toYear },
        comparison: { from_year: null, to_year: null },
        years,
        mode: 'default',
      },
      summary: {
        scholarly_works: scholarlyWorks,
        total_citations: totalCitations,
        total_references: totalReferences,
        available_citing_works: totalCitations,
        available_references: totalReferences,
        authors: Object.keys(authorCounts).length,
        institutions: Object.keys(instCounts).length,
        journals: Object.keys(journalCounts).length,
        open_access_works: openAccessWorks,
        closed_access_works: scholarlyWorks - openAccessWorks,
        oa_unavailable_works: 0,
      },
      works_over_time: worksOverTime,
      citations_over_time: citationsOverTime,
      top: { institutions: topInstitutions, authors: topAuthors, journals: topJournals, topics: [], keywords: [] },
      growth: { institutions: [], authors: [], journals: [], topics: [], keywords: [] },
      trending_articles: trendingArticles,
      trending_article_coverage: {
        eligible_articles: scholarlyWorks,
        total_articles: scholarlyWorks,
      },
    };
  }, [sortedBookmarks]);

  // useCallback để tránh tạo function mới mỗi render → BookmarkItem không re-render
  const handleViewDetail = useCallback(
    (articleId) => navigate(`/trending/articles/${articleId}`),
    [navigate]
  );

  const removeBookmark = useCallback(async (articleId) => {
    if (!articleId) return;
    try {
      const result = await toggleBookmark(articleId, false, userId);
      if (
        result.skipped
        || result.stale
        || !isBookmarkSessionCurrent(useAuthStore.getState(), userId)
      ) return;
      // Optimistic update local cache — không cần invalidate (đã update store + query data)
      queryClient.setQueryData(bookmarksQueryKey, (items = []) =>
        removeBookmarkFromList(items, articleId)
      );
      toast.success(t('bookmarkRemoved'));
    } catch (error) {
      if (isBookmarkSessionCurrent(useAuthStore.getState(), userId)) {
        toast.error(error.response?.data?.message || t('bookmarkUpdateError'));
      }
    }
  }, [bookmarksQueryKey, queryClient, t, toggleBookmark, userId]);

  const retry = useCallback(() => refetchBookmarks(), [refetchBookmarks]);

  const stats = useMemo(() => [
    { key: 'saved', color: '#00acc1', label: t('savedArticles'), value: sortedBookmarks.length },
    { key: 'citations', color: '#0288d1', label: t('statCitations'), value: bookmarkAnalysisData?.summary.total_citations || 0 },
    { key: 'authors', color: '#7b1fa2', label: t('statAuthors'), value: bookmarkAnalysisData?.summary.authors || 0 },
    { key: 'journals', color: '#475569', label: t('statJournals'), value: bookmarkAnalysisData?.summary.journals || 0 },
  ], [sortedBookmarks.length, bookmarkAnalysisData, t]);

  return (
    <div className="bookmarks-page">
      <Header />
      <div className="tvn-layout-wrapper">
        <WorkspaceSidebar activeItem="collections" />
        <main className="tvn-main-content bookmarks-main-content">
          <div className="tvn-top-info-bar">
            <div className="total-count">
              <BookmarkCheck size={13} className="me-1" />
              {t('savedArticlesCount', { count: sortedBookmarks.length })}
            </div>
          </div>

          <section className="bookmarks-heading">
            <h1 className="tvn-page-title">{t('savedArticlesTitle')}</h1>
            <div className="tvn-filter-indicator">
              <span className="filter-count-link">
                {t('savedArticlesCount', { count: sortedBookmarks.length })}
              </span>
              <span className="tvn-filter-divider" aria-hidden="true">-</span>
              <span className="tvn-filter-status">
                <Bookmark size={12} className="me-1" />
                {t('savedArticlesSubtitle')}
              </span>
            </div>
          </section>

          <div className="tvn-stats-bar bookmarks-stats-bar">
            {stats.map((segment) => (
              <div className="stat-segment" key={segment.key}>
                <div className="stat-color-bar" style={{ background: segment.color }} />
                <div className="stat-label">{segment.label}</div>
                <div className="stat-value">{segment.value.toLocaleString()}</div>
              </div>
            ))}
          </div>

          <div className="tvn-sticky-results-toolbar bookmarks-toolbar">
            <div className="tvn-tab-row">
              <div className="tab-group">
                <button type="button" className="tab-item active">{t('savedArticles')}</button>
              </div>
              <div className="view-toggles ps-2">
                <button
                  type="button"
                  className={`view-toggle-btn ${viewTab === 'list' ? 'active' : ''}`}
                  onClick={() => setViewTab('list')}
                >
                  <List size={13} />
                  {t('viewList')}
                </button>
                <button
                  type="button"
                  className={`view-toggle-btn ${viewTab === 'analysis' ? 'active' : ''}`}
                  onClick={() => setViewTab('analysis')}
                  disabled={sortedBookmarks.length === 0}
                >
                  <BarChart3 size={13} />
                  {t('viewAnalysis')}
                </button>
              </div>
            </div>
            <div className="tvn-action-toolbar">
              <div className="action-group">
                <button type="button" className="tvn-action-btn" onClick={() => navigate('/articles')}>
                  <Search size={12} />
                  {t('browseArticles')}
                </button>
                <span className="action-sep" aria-hidden="true">|</span>
                <button type="button" className="tvn-action-btn" onClick={retry} disabled={bookmarksQuery.isFetching}>
                  <RefreshCw size={12} className={bookmarksQuery.isFetching ? 'bookmarks-spin' : ''} />
                  {t('refresh')}
                </button>
              </div>
            </div>
          </div>

          <section className="bookmarks-results">
            {bookmarksQuery.isLoading ? (
              <div className="bookmarks-list">
                {Array.from({ length: 5 }, (_, i) => <ArticleCardSkeleton key={i} />)}
              </div>
            ) : bookmarksQuery.isError ? (
              <div className="bookmarks-state is-error">
                <AlertCircle size={20} />
                <span>{bookmarksQuery.error?.message || t('bookmarksLoadError')}</span>
                <Button variant="outline-primary" size="sm" onClick={retry}>{t('tryAgain')}</Button>
              </div>
            ) : sortedBookmarks.length === 0 ? (
              <div className="bookmarks-state">
                <Bookmark size={24} />
                <span>{t('bookmarksEmpty')}</span>
                <Button variant="primary" size="sm" onClick={() => navigate('/articles')}>
                  {t('browseArticles')}
                </Button>
              </div>
            ) : viewTab === 'analysis' ? (
              <div className="bookmarks-analysis-dashboard p-4 bg-white border rounded-3 mt-3 shadow-sm">
                <AnalysisDashboard
                  analysis={bookmarkAnalysisData}
                  isLoading={false}
                  error={null}
                  onArticleClick={handleViewDetail}
                />
              </div>
            ) : (
              <div className="bookmarks-list">
                {sortedBookmarks.map((item) => (
                  <BookmarkItem
                    key={item.bookmark_id || item.article_id}
                    item={item}
                    onRemove={removeBookmark}
                    onViewDetail={handleViewDetail}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
