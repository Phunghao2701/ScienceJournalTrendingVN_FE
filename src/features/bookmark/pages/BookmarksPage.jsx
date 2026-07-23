import { useMemo, useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../../landing/components/Header';
import { getBookmarksApi } from '../../article/api/articleApi';
import { useBookmarkStore } from '../store/bookmarkStore';
import { toast } from '../../../shared/utils/toast';
import AnalysisDashboard from '../../trendingVN/components/analysis/AnalysisDashboard';
import WorkspaceSidebar from '../../trendingVN/components/WorkspaceSidebar';
import '../../trendingVN/trendingVN.css';
import './BookmarksPage.css';

const bookmarksQueryKey = ['bookmarks', 'list'];

export default function BookmarksPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setArticleBookmarked = useBookmarkStore((state) => state.setArticleBookmarked);
  const loadingByArticleId = useBookmarkStore((state) => state.loadingByArticleId);
  const toggleBookmark = useBookmarkStore((state) => state.toggleBookmark);

  const bookmarksQuery = useQuery({
    queryKey: bookmarksQueryKey,
    queryFn: async () => {
      const response = await getBookmarksApi();
      if (!response.data?.success) {
        throw new Error(response.data?.message || t('bookmarksLoadError'));
      }
      const items = response.data.data || [];
      items.forEach((item) => setArticleBookmarked(item.article_id, true));
      return items;
    },
  });

  const sortedBookmarks = useMemo(() => (
    [...(bookmarksQuery.data || [])].sort((a, b) => new Date(b.bookmarked_at || 0) - new Date(a.bookmarked_at || 0))
  ), [bookmarksQuery.data]);

  const [viewTab, setViewTab] = useState('list');

  const bookmarkAnalysisData = useMemo(() => {
    if (sortedBookmarks.length === 0) return null;

    const scholarlyWorks = sortedBookmarks.length;
    let totalCitations = 0;
    let totalReferences = 0;
    let openAccessWorks = 0;

    const yearCounts = {};
    const yearCitations = {};
    const journalCounts = {};
    const authorCounts = {};
    const instCounts = {};

    sortedBookmarks.forEach((item) => {
      const cit = Number(item.citation_count || item.citations || 0);
      const ref = Number(item.reference_count || item.references || 0);
      totalCitations += cit;
      totalReferences += ref;

      const isOa = item.open_access === true || item.access === 'oa' || item.access_type?.toLowerCase() === 'oa';
      if (isOa) {
        openAccessWorks += 1;
      }

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
      authors.forEach((auth) => {
        if (auth) authorCounts[auth] = (authorCounts[auth] || 0) + 1;
      });

      const insts = Array.isArray(item.institutions)
        ? item.institutions.map(i => i.name || i)
        : (typeof item.institutions === 'string' ? item.institutions.split(',').map(s => s.trim()) : []);
      insts.forEach((inst) => {
        if (inst) instCounts[inst] = (instCounts[inst] || 0) + 1;
      });
    });

    const years = Object.keys(yearCounts).map(Number).sort((a, b) => a - b);
    const fromYear = years[0] || new Date().getFullYear() - 5;
    const toYear = years[years.length - 1] || new Date().getFullYear();

    const worksOverTime = Object.entries(yearCounts).map(([year, count]) => ({
      year: Number(year),
      count: Number(count),
    })).sort((a, b) => a.year - b.year);

    const citationsOverTime = Object.entries(yearCitations).map(([year, citations]) => ({
      year: Number(year),
      citations: Number(citations),
      coverage_articles: yearCounts[year] || 0,
      total_articles_with_history: yearCounts[year] || 0,
    })).sort((a, b) => a.year - b.year);

    const mapToEntities = (counts) => {
      return Object.entries(counts)
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
    };

    const topJournals = mapToEntities(journalCounts);
    const topAuthors = mapToEntities(authorCounts);
    const topInstitutions = mapToEntities(instCounts);

    const trendingArticles = [...sortedBookmarks].map((item) => ({
      article_id: item.article_id,
      title: item.title || 'Untitled Article',
      publication_year: item.publication_year,
      citation_count: Number(item.citation_count || item.citations || 0),
      reference_count: Number(item.reference_count || item.references || 0),
      current_citations: Number(item.citation_count || item.citations || 0),
      previous_citations: 0,
      absolute_growth: Number(item.citation_count || item.citations || 0),
      growth_rate: null,
    })).sort((a, b) => b.citation_count - a.citation_count);

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
      top: {
        institutions: topInstitutions,
        authors: topAuthors,
        journals: topJournals,
        topics: [],
        keywords: [],
      },
      growth: {
        institutions: [],
        authors: [],
        journals: [],
        topics: [],
        keywords: [],
      },
      trending_articles: trendingArticles,
      trending_article_coverage: {
        eligible_articles: scholarlyWorks,
        total_articles: scholarlyWorks,
      },
    };
  }, [sortedBookmarks]);

  const removeBookmark = async (articleId) => {
    if (!articleId || loadingByArticleId[String(articleId)]) return;
    try {
      await toggleBookmark(articleId, false);
      queryClient.setQueryData(bookmarksQueryKey, (items = []) => (
        items.filter((item) => String(item.article_id) !== String(articleId))
      ));
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      toast.success(t('bookmarkRemoved'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('bookmarkUpdateError'));
    }
  };

  const retry = () => {
    bookmarksQuery.refetch();
  };

  return (
    <div className="bookmarks-page">
      <Header />
      <div className="tvn-layout-wrapper">
        <WorkspaceSidebar activeItem="collections" />
        <main className="tvn-main-content bookmarks-main-content">
          <div className="tvn-top-info-bar">
            <div className="total-count">
              <Icon icon="lucide:bookmark-check" width="13" className="me-1" />
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
                <Icon icon="lucide:bookmark" width="12" className="me-1" />
                {t('savedArticlesSubtitle')}
              </span>
            </div>
          </section>

          <div className="tvn-stats-bar bookmarks-stats-bar">
            {[
              { key: 'saved', color: '#00acc1', label: t('savedArticles'), value: sortedBookmarks.length },
              { key: 'citations', color: '#0288d1', label: t('statCitations'), value: bookmarkAnalysisData?.summary.total_citations || 0 },
              { key: 'authors', color: '#7b1fa2', label: t('statAuthors'), value: bookmarkAnalysisData?.summary.authors || 0 },
              { key: 'journals', color: '#475569', label: t('statJournals'), value: bookmarkAnalysisData?.summary.journals || 0 },
            ].map((segment) => (
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
                  <Icon icon="lucide:list" width="13" />
                  {t('viewList')}
                </button>
                <button
                  type="button"
                  className={`view-toggle-btn ${viewTab === 'analysis' ? 'active' : ''}`}
                  onClick={() => setViewTab('analysis')}
                  disabled={sortedBookmarks.length === 0}
                >
                  <Icon icon="lucide:bar-chart-3" width="13" />
                  {t('viewAnalysis')}
                </button>
              </div>
            </div>
            <div className="tvn-action-toolbar">
              <div className="action-group">
                <button type="button" className="tvn-action-btn" onClick={() => navigate('/articles')}>
                  <Icon icon="lucide:search" width="12" />
                  {t('browseArticles')}
                </button>
                <span className="action-sep" aria-hidden="true">|</span>
                <button type="button" className="tvn-action-btn" onClick={retry} disabled={bookmarksQuery.isFetching}>
                  <Icon icon="lucide:refresh-cw" width="12" className={bookmarksQuery.isFetching ? 'bookmarks-spin' : ''} />
                  {t('refresh')}
                </button>
              </div>
            </div>
          </div>

          <section className="bookmarks-results">
          {bookmarksQuery.isLoading ? (
            <div className="bookmarks-state">
              <Spinner animation="border" size="sm" />
              {t('bookmarksLoading')}
            </div>
          ) : bookmarksQuery.isError ? (
            <div className="bookmarks-state is-error">
              <Icon icon="lucide:alert-circle" width="20" />
              <span>{bookmarksQuery.error?.message || t('bookmarksLoadError')}</span>
              <Button variant="outline-primary" size="sm" onClick={retry}>{t('tryAgain')}</Button>
            </div>
          ) : sortedBookmarks.length === 0 ? (
            <div className="bookmarks-state">
              <Icon icon="lucide:bookmark" width="24" />
              <span>{t('bookmarksEmpty')}</span>
              <Button variant="primary" size="sm" onClick={() => navigate('/articles')}>{t('browseArticles')}</Button>
            </div>
          ) : (
            viewTab === 'analysis' ? (
              <div className="bookmarks-analysis-dashboard p-4 bg-white border rounded-3 mt-3 shadow-sm">
                <AnalysisDashboard
                  analysis={bookmarkAnalysisData}
                  isLoading={false}
                  error={null}
                  onArticleClick={(id) => navigate(`/trending/articles/${id}`)}
                />
              </div>
            ) : (
              <div className="bookmarks-list">
                {sortedBookmarks.map((item) => {
                  const articleId = item.article_id;
                  const isRemoving = Boolean(loadingByArticleId[String(articleId)]);
                  return (
                    <article key={item.bookmark_id || articleId} className="bookmark-item">
                      <div className="bookmark-item-main">
                        <button
                          type="button"
                          className="bookmark-title"
                          onClick={() => navigate(`/trending/articles/${articleId}`)}
                        >
                          {item.title || t('untitledArticle')}
                        </button>
                        {item.abstract && <p>{item.abstract}</p>}
                        <div className="bookmark-meta">
                          {item.publication_year && <span>{item.publication_year}</span>}
                          {item.doi && <span>DOI: {item.doi}</span>}
                          {item.bookmarked_at && (
                            <span>{t('savedOn')} {new Date(item.bookmarked_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="bookmark-actions">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => navigate(`/trending/articles/${articleId}`)}
                        >
                          <Icon icon="lucide:external-link" width="14" />
                          {t('viewDetail')}
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          disabled={isRemoving}
                          onClick={() => removeBookmark(articleId)}
                        >
                          {isRemoving ? <Spinner animation="border" size="sm" /> : <Icon icon="lucide:bookmark-minus" width="14" />}
                          {t('remove')}
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )
          )}
          </section>
        </main>
      </div>
    </div>
  );
}
