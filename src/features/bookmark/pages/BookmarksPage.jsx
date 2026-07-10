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
      <main className="bookmarks-shell">
        <section className="bookmarks-hero">
          <div>
            <div className="bookmarks-eyebrow">
              <Icon icon="lucide:bookmark-check" width="16" />
              {t('savedArticles')}
            </div>
            <h1>{t('savedArticlesTitle')}</h1>
            <p>{t('savedArticlesSubtitle')}</p>
          </div>
          <Button variant="outline-primary" onClick={() => navigate('/articles')}>
            <Icon icon="lucide:search" width="16" />
            {t('browseArticles')}
          </Button>
        </section>

        <section className="bookmarks-panel">
          <div className="bookmarks-panel-header">
            <div>
              <h2>{t('savedArticles')}</h2>
              <span>{t('savedArticlesCount', { count: sortedBookmarks.length })}</span>
            </div>
            <div className="d-flex align-items-center gap-2 ms-auto">
              <div className="d-flex align-items-center gap-1 border rounded-2 p-1 bg-light me-2">
                <Button
                  variant={viewTab === 'list' ? 'primary' : 'light'}
                  size="sm"
                  onClick={() => setViewTab('list')}
                  className="d-flex align-items-center gap-1 py-1 px-3 text-xs"
                  style={
                    viewTab === 'list'
                      ? { backgroundColor: '#0d6efd', borderColor: '#0d6efd' }
                      : { backgroundColor: '#f8f9fa', borderColor: 'transparent' }
                  }
                >
                  <Icon
                    icon="lucide:list"
                    width="14"
                    style={viewTab === 'list' ? { color: '#ffffff' } : { color: '#212529' }}
                  />
                  <span
                    style={viewTab === 'list' ? { color: '#ffffff', fontWeight: '600', marginTop: '0', display: 'inline' } : { color: '#212529', fontWeight: '500', marginTop: '0', display: 'inline' }}
                  >
                    {t('viewList') || 'Danh sách'}
                  </span>
                </Button>
                <Button
                  variant={viewTab === 'analysis' ? 'primary' : 'light'}
                  size="sm"
                  onClick={() => setViewTab('analysis')}
                  className="d-flex align-items-center gap-1 py-1 px-3 text-xs"
                  disabled={sortedBookmarks.length === 0}
                  style={
                    viewTab === 'analysis'
                      ? { backgroundColor: '#0d6efd', borderColor: '#0d6efd' }
                      : { backgroundColor: '#f8f9fa', borderColor: 'transparent' }
                  }
                >
                  <Icon
                    icon="lucide:bar-chart-2"
                    width="14"
                    style={viewTab === 'analysis' ? { color: '#ffffff' } : { color: '#212529' }}
                  />
                  <span
                    style={viewTab === 'analysis' ? { color: '#ffffff', fontWeight: '600', marginTop: '0', display: 'inline' } : { color: '#212529', fontWeight: '500', marginTop: '0', display: 'inline' }}
                  >
                    {t('viewAnalysis') || 'Phân tích'}
                  </span>
                </Button>
              </div>
              <Button variant="link" className="bookmarks-refresh-btn" onClick={retry} disabled={bookmarksQuery.isFetching}>
                <Icon icon="lucide:refresh-cw" width="15" />
                {t('refresh')}
              </Button>
            </div>
          </div>

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
  );
}
