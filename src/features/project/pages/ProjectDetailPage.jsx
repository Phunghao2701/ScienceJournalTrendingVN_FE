import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ROUTES from '../../../app/routes/routePaths';
import { useKeywordTracking } from '../../keyword/hooks/useKeywordTracking';
import KeywordWatchList from '../../keyword/components/KeywordWatchList';
import AddKeywordModal from '../../keyword/components/AddKeywordModal';
import ManageKeywordsModal from '../../keyword/components/ManageKeywordsModal';
import { Icon } from '@iconify/react';
import useProjectDetails from '../hooks/useProjectDetails';
import { useProjectText } from '../i18n/useProjectText';
import { useTranslation } from 'react-i18next';


const ProjectDetailPage = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const p = useProjectText();
  const { i18n } = useTranslation();
  const {
    project,
    watchArticles,
    watchedKeywords,
    loading,
    error,
    actionLoading,
    addKeywordWatch,
    removeKeywordWatch
  } = useKeywordTracking(projectId);
  const {
    articles: relatedArticles,
    analytics,
    fetchRelatedArticles,
    fetchAnalytics,
  } = useProjectDetails(projectId);

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'articles', 'keywords'
  const [articlePage, setArticlePage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);

  useEffect(() => {
    fetchRelatedArticles(20);
    fetchAnalytics();
  }, [fetchAnalytics, fetchRelatedArticles]);

  if (loading) {
    return (
      <div className="project-detail-page container-fluid py-4 grid-bg min-vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="project-detail-page container-fluid py-4 grid-bg min-vh-100">
        <div className="container mx-auto" style={{ maxWidth: '1000px', marginTop: '20px' }}>
          <div className="alert alert-danger border-0 rounded-4 shadow-sm p-4 d-flex align-items-center gap-3">
            <Icon icon="lucide:alert-triangle" width="24" className="text-danger flex-shrink-0" />
            <div>
              <h6 className="fw-bold mb-1">{p('unableLoad')}</h6>
              <p className="mb-0 small">{error || p('projectMissing')}</p>
            </div>
            <button className="btn btn-outline-danger btn-sm ms-auto" onClick={() => navigate(ROUTES.PROJECTS)}>{p('back')}</button>
          </div>
        </div>
      </div>
    );
  }

  const title = project.title || p('untitledProject');
  const areaName =
    project.subject_area?.display_name ||
    project.subject_area?.name ||
    project.subject_area_name ||
    (typeof project.subject_area === 'string' ? project.subject_area : null) ||
    p('unspecifiedArea');
  const createdAt = project.created_at
    ? new Date(project.created_at).toLocaleDateString(
      i18n.resolvedLanguage?.startsWith('vi') ? 'vi-VN' : 'en-US',
    )
    : p('notAvailable');
  const keywordCount = watchedKeywords?.length || 0;
  const displayedArticles = Array.from(
    new Map(
      [...(relatedArticles || []), ...(watchArticles || [])]
        .filter((article) => article?.article_id != null)
        .map((article) => [String(article.article_id), article]),
    ).values(),
  );
  const articleCount = displayedArticles?.length || 0;
  const categoryCount = project.subject_categories?.length || 0;
  const journalCount = project.journals?.length || 0;
  const articleTrend = analytics?.article_volume_trend || [];
  const journalMetrics = analytics?.journal_metrics_comparison || [];
  const maxArticleCount = Math.max(...articleTrend.map(item => Number(item.article_count) || 0), 1);
  const trendTotal = articleTrend.reduce((sum, item) => sum + (Number(item.article_count) || 0), 0);
  const peakTrend = articleTrend.reduce(
    (peak, item) => Number(item.article_count) > Number(peak?.article_count || 0) ? item : peak,
    null,
  );
  const latestTrend = articleTrend.at(-1);
  const averagePerYear = articleTrend.length > 0
    ? (trendTotal / articleTrend.length).toFixed(1)
    : '0';
  const articlePageSize = 20;
  const articleTotalPages = Math.max(1, Math.ceil(articleCount / articlePageSize));
  const paginatedArticles = displayedArticles.slice(
    (articlePage - 1) * articlePageSize,
    articlePage * articlePageSize,
  );

  return (
    <div className="project-detail-page container-fluid py-4 grid-bg min-vh-100">
      <div className="container mx-auto" style={{ maxWidth: '1200px' }}>
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb mb-2 text-muted-custom small">
            <li className="breadcrumb-item"><Link to={ROUTES.DASHBOARD} className="text-decoration-none text-muted-custom hover-primary">{p('overview')}</Link></li>
            <li className="breadcrumb-item"><Link to={ROUTES.PROJECTS} className="text-decoration-none text-muted-custom hover-primary">{p('projects')}</Link></li>
            <li className="breadcrumb-item active" aria-current="page">{title}</li>
          </ol>
        </nav>

        {/* Header section (Mockup 3) */}
        <div className="glass-card rounded-4 shadow-sm border p-4 p-md-5 mb-4">
          <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
            <div>
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="badge rounded-pill text-primary fw-medium" style={{ backgroundColor: 'var(--primary-light)' }}>
                  {areaName}
                </span>
                <span className="text-muted-custom small">{p('updated')}: {createdAt}</span>
              </div>
              <h1 className="font-display fw-bold text-main mb-0" style={{ fontSize: '2rem' }}>{title}</h1>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-light border fw-medium d-flex align-items-center gap-2 rounded-pill px-3"
                onClick={() => navigate(ROUTES.PROJECT_EDIT.replace(':id', projectId))}
              >
                <Icon icon="lucide:settings" width="16" /> {p('settings')}
              </button>
              <button 
                className="btn btn-primary btn-primary-glow fw-medium d-flex align-items-center gap-2 rounded-pill px-3"
                onClick={() => setShowAddModal(true)}
              >
                <Icon icon="lucide:plus" width="16" /> {p('addKeyword')}
              </button>
            </div>
          </div>

          <div className="row g-4 pt-4 border-top">
            <div className="col-6 col-md-3">
              <div className="text-muted-custom small mb-1 text-uppercase tracking-wider fw-semibold">{p('watchedKeywords')}</div>
              <div className="fs-3 fw-bold text-main">{keywordCount}</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-muted-custom small mb-1 text-uppercase tracking-wider fw-semibold">{p('relatedArticles')}</div>
              <div className="fs-3 fw-bold text-main">{articleCount}</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-muted-custom small mb-1 text-uppercase tracking-wider fw-semibold">{p('subjectCategories')}</div>
              <div className="fs-3 fw-bold text-main">{categoryCount}</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-muted-custom small mb-1 text-uppercase tracking-wider fw-semibold">{p('watchedJournals')}</div>
              <div className="fs-3 fw-bold text-main">{journalCount}</div>
            </div>
          </div>
        </div>

        <ul className="nav nav-tabs tab-nav-custom mb-4 border-bottom-0 gap-4" style={{ paddingLeft: '1rem' }}>
          <li className="nav-item">
            <button 
              className={`nav-link bg-transparent px-0 pb-3 fw-medium ${activeTab === 'overview' ? 'active' : 'text-muted-custom'}`}
              onClick={() => setActiveTab('overview')}
            >
              <Icon icon="lucide:bar-chart-2" width="18" className="me-2" /> {p('overviewCharts')}
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link bg-transparent px-0 pb-3 fw-medium ${activeTab === 'articles' ? 'active' : 'text-muted-custom'}`}
              onClick={() => setActiveTab('articles')}
            >
              <Icon icon="lucide:file-text" width="18" className="me-2" /> {p('articleFeed')} ({articleCount})
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link bg-transparent px-0 pb-3 fw-medium ${activeTab === 'keywords' ? 'active' : 'text-muted-custom'}`}
              onClick={() => setActiveTab('keywords')}
            >
              <Icon icon="lucide:key" width="18" className="me-2" /> {p('keywordMonitoring')} ({keywordCount})
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        <div className="mb-5">
          {activeTab === 'overview' && (
            <div className="glass-card rounded-4 shadow-sm border p-4">
              <div className="mb-4">
                <h5 className="text-main fw-bold mb-1">{p('publicationTrend')}</h5>
                <p className="text-muted-custom small mb-0">
                  {p('publicationTrendHint')}
                </p>
              </div>
              {articleTrend.length === 0 && journalMetrics.length === 0 ? (
                <div className="text-center py-5 text-muted-custom">
                  <Icon icon="lucide:chart-no-axes-column" width="44" className="mb-3 opacity-50" />
                  <h6 className="text-main fw-semibold">{p('noAnalytics')}</h6>
                  <p className="small mb-3">
                    {p('noAnalyticsHint')}
                  </p>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => navigate(ROUTES.PROJECT_EDIT.replace(':id', projectId))}
                  >
                    {p('configureJournals')}
                  </button>
                </div>
              ) : (
                <>
                {articleTrend.length > 0 && (
                  <div className="row g-3 mb-4">
                    {[
                      { label: p('articlesInChart'), value: trendTotal.toLocaleString() },
                      { label: p('peakYear'), value: peakTrend ? `${peakTrend.year} · ${peakTrend.article_count} ${p('articles')}` : 'N/A' },
                      { label: p('averageYear'), value: `${averagePerYear} ${p('articles')}` },
                      { label: p('latestYear'), value: latestTrend ? `${latestTrend.year} · ${latestTrend.article_count} ${p('articles')}` : 'N/A' },
                    ].map((item) => (
                      <div className="col-6 col-lg-3" key={item.label}>
                        <div className="h-100 border rounded-3 p-3 bg-light">
                          <span className="d-block text-muted-custom small mb-1">{item.label}</span>
                          <strong className="text-main">{item.value}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="row g-4">
                  <div className={journalMetrics.length > 0 ? 'col-12 col-lg-7' : 'col-12'}>
                    {articleTrend.length > 0 ? (
                      <div className="d-flex align-items-end gap-3 project-trend-chart" aria-label="Article count by publication year">
                        {articleTrend.map((item) => (
                          <div className="project-trend-column" key={item.year}>
                            <span className="project-trend-value">{item.article_count}</span>
                            <div
                              className="project-trend-bar"
                              style={{ height: `${Math.max(12, (Number(item.article_count) / maxArticleCount) * 150)}px` }}
                            />
                            <span className="project-trend-year">{item.year}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-5 text-muted-custom border rounded-3">
                        {p('noYearlyData')}
                      </div>
                    )}
                  </div>
                  {journalMetrics.length > 0 && (
                    <div className="col-12 col-lg-5">
                      <h6 className="fw-semibold mb-3">{p('latestMetrics')}</h6>
                      <div className="d-flex flex-column gap-2">
                        {journalMetrics.slice(0, 6).map((metric, index) => (
                          <div className="d-flex justify-content-between gap-3 border-bottom pb-2 small" key={`${metric.journal_id}-${metric.metric_code}-${index}`}>
                            <span className="text-truncate">{metric.journal_name} · {metric.metric_code}</span>
                            <strong>{metric.value ?? 'N/A'}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'articles' && (
            <div className="glass-card rounded-4 shadow-sm border p-4">
              <div className="mb-4">
                <h5 className="fw-bold text-main mb-1">{p('latestFeed')}</h5>
                <p className="text-muted-custom small mb-0">
                  {p('feedHint')}
                </p>
              </div>

              {displayedArticles.length === 0 ? (
                <div className="text-center py-5 text-muted-custom">
                  <Icon icon="lucide:file-x" width="48" className="mb-3 opacity-50" />
                  <p className="mb-2">{p('noMatchingArticles')}</p>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => navigate(ROUTES.PROJECT_EDIT.replace(':id', projectId))}
                  >
                    {p('reviewSettings')}
                  </button>
                </div>
              ) : (
                <div className="list-group list-group-flush border-top pt-2">
                  {paginatedArticles.map((article, index) => (
                    <div key={article.article_id || article.id || index} className="list-group-item bg-transparent px-0 py-3 border-bottom">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className="text-muted-custom small">{article.journal_name || article.journal?.title || p('scientificJournal')}</span>
                        <span className="text-muted-custom small">{article.publication_year || new Date(article.publication_date).getFullYear()}</span>
                      </div>
                      <Link to={`/articles/${article.article_id || article.id}/visual`} className="text-decoration-none">
                        <h6 className="fw-bold text-main mb-2 hover-primary lh-base">{article.title}</h6>
                      </Link>
                      <p className="text-muted-custom small mb-2 text-truncate">{article.abstract || p('noAbstract')}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted-custom small">
                          {p('authors')}: <strong className="text-main fw-medium">{article.authors?.map(a => a.name).join(', ') || 'N/A'}</strong>
                        </span>
                        <span className="badge bg-light text-muted border fw-normal" style={{ fontSize: '0.7rem' }}>{p('highRelevance')}</span>
                      </div>
                    </div>
                  ))}
                  {articleTotalPages > 1 && (
                    <nav className="d-flex align-items-center justify-content-between gap-3 pt-3" aria-label="Article pagination">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        disabled={articlePage === 1}
                        onClick={() => setArticlePage((page) => Math.max(1, page - 1))}
                      >
                        {p('previous')}
                      </button>
                      <span className="text-muted-custom small">
                        {p('page')} {articlePage}/{articleTotalPages} · {articleCount.toLocaleString()} {p('articles')}
                      </span>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        disabled={articlePage === articleTotalPages}
                        onClick={() => setArticlePage((page) => Math.min(articleTotalPages, page + 1))}
                      >
                        {p('next')}
                      </button>
                    </nav>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'keywords' && (
            <div className="glass-card rounded-4 shadow-sm border p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 className="fw-bold text-main mb-1">{p('keywordWatchList')}</h5>
                  <p className="text-muted-custom small mb-0">{p('keywordWatchHint')}</p>
                </div>
                <button 
                  className="btn btn-dark btn-dark-solid rounded-pill px-3 py-2 fw-medium d-flex align-items-center gap-2"
                  onClick={() => setShowManageModal(true)}
                >
                  <Icon icon="lucide:edit-2" width="16" /> {p('manageKeywords')}
                </button>
              </div>

              <KeywordWatchList 
                watchedKeywords={watchedKeywords} 
                articles={watchArticles}
                loading={loading} 
                onManageClick={() => setShowManageModal(true)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddKeywordModal 
        show={showAddModal} 
        onHide={() => setShowAddModal(false)} 
        onAdd={addKeywordWatch}
        actionLoading={actionLoading}
      />

      <ManageKeywordsModal
        show={showManageModal}
        onHide={() => setShowManageModal(false)}
        watchedKeywords={watchedKeywords}
        onRemove={removeKeywordWatch}
        actionLoading={actionLoading}
      />
    </div>
  );
};

export default ProjectDetailPage;
