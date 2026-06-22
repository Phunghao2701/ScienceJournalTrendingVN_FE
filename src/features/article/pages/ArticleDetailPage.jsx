/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\article\pages\ArticleDetailPage.jsx
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Modal } from 'react-bootstrap';
import { Icon } from '@iconify/react';

// Layout
import Header from '../../landing/components/Header';

// Auth
import useAuth from '../../auth/hooks/useAuth';

// API
import { getArticleDetailApi, bookmarkArticleApi, getArticlesListApi } from '../api/articleApi';

// Subcomponents
import ArticleDetailSkeleton from '../components/ArticleDetailSkeleton';
import ArticleDetailEmpty from '../components/ArticleDetailEmpty';
import ArticleDetailError from '../components/ArticleDetailError';
import ArticlesTabContent from '../../journal/components/ArticlesTabContent';
import AuthRequiredModal from '../../../shared/components/AuthRequiredModal';
import { toast } from '../../../shared/utils/toast';
import { getDoiUrl, normalizeArticleDetail } from '../utils/articleFormatters';
import './ArticleDetailPage.css';

const formatAuthorsLine = (authors = [], limit = 3) => {
  if (!authors || authors.length === 0) return 'Đang cập nhật tác giả';

  const names = authors
    .slice(0, limit)
    .map((author) => author.display_name || author.name || author.author_name || 'Tác giả')
    .join(', ');
  return authors.length > limit ? `${names}...` : names;
};

const normalizeRecommendedArticle = (item = {}) => ({
  ...item,
  article_id: item.article_id || item.id,
  title: item.title || 'Untitled Article',
  publication_year: item.publication_year || item.year || '—',
  doi: item.doi || '',
  abstract: item.abstract || item.description || 'No abstract is available for this article.',
  authors: Array.isArray(item.authors)
    ? formatAuthorsLine(item.authors, 3)
    : item.authors || item.authors_text || '',
});

const topicKeywordChipStyle = {
  border: '1px solid var(--border)',
  color: 'var(--text-main)',
  backgroundColor: 'var(--bg-main)',
  borderRadius: '999px',
};

const formatReferenceLabel = (referenceUrl = '', index = 0) => {
  const rawValue = String(referenceUrl || '').trim();
  if (!rawValue) return `Reference ${index + 1}`;

  const workId = rawValue.split('/').filter(Boolean).pop();
  return workId ? `OpenAlex ${workId}` : `Reference ${index + 1}`;
};

const smoothScrollTo = (targetId) => {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export default function ArticleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const currentUser = auth?.user;

  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');
  const [recommendedArticles, setRecommendedArticles] = useState([]);
  const [isRecommendedLoading, setIsRecommendedLoading] = useState(false);
  const [showAllAuthors, setShowAllAuthors] = useState(false);
  const [showCitationsModal, setShowCitationsModal] = useState(false);
  const [referencePage, setReferencePage] = useState(1);
  const referencesPerPage = 2;

  const visibleAuthors = useMemo(() => {
    const authors = article?.authors || [];
    if (showAllAuthors) return authors;
    return authors.slice(0, 3);
  }, [article?.authors, showAllAuthors]);

  const hiddenAuthorCount = Math.max((article?.authors?.length || 0) - 3, 0);
  const references = article?.references || [];
  const referenceTotalPages = Math.max(1, Math.ceil(references.length / referencesPerPage));
  const paginatedReferences = references.slice(
    (referencePage - 1) * referencesPerPage,
    referencePage * referencesPerPage,
  );
  const keywordsText = useMemo(() => {
    const keywords = article?.keywords || [];
    if (!keywords.length) return 'Đang cập nhật từ khóa.';
    return keywords
      .map((keyword) => keyword.display_name || keyword.name || keyword.keyword)
      .filter(Boolean)
      .join('; ');
  }, [article?.keywords]);


  const fetchRecommendedArticles = useCallback(async (parsedArticle) => {
    try {
      setIsRecommendedLoading(true);
      const params = {
        limit: 4,
        page: 1,
      };
      const journalId = Number(parsedArticle.journal_id);
      const topicId = Number(parsedArticle.primary_topic || parsedArticle.topic_id);
      if (Number.isFinite(journalId)) params.journal_id = journalId;
      if (Number.isFinite(topicId)) params.topic_id = topicId;

      const response = await getArticlesListApi(params);
      const payload = response.data?.data || response.data || {};
      const rawItems = payload.items || payload.articles || payload.data || [];
      const normalizedItems = rawItems
        .map(normalizeRecommendedArticle)
        .filter((item) => String(item.article_id) !== String(parsedArticle.article_id))
        .slice(0, 3);

      setRecommendedArticles(normalizedItems);
    } catch (err) {
      console.warn('Error fetching recommended articles:', err);
      setRecommendedArticles([]);
    } finally {
      setIsRecommendedLoading(false);
    }
  }, []);

  const fetchArticleDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getArticleDetailApi(id);
      if (response.data && response.data.success !== false) {
        const apiData = response.data.data || {};
        const parsedArticle = normalizeArticleDetail(apiData, id);

        setArticle(parsedArticle);
        fetchRecommendedArticles(parsedArticle);

        const localBookmarkKey = `bookmark_${currentUser?.username || 'guest'}_${id}`;
        const isLocallyBookmarked = localStorage.getItem(localBookmarkKey) === 'true';
        setIsBookmarked(apiData.is_bookmarked || isLocallyBookmarked);
      } else {
        throw new Error('Không thể tải chi tiết bài báo khoa học.');
      }
    } catch (err) {
      console.error('Error fetching article detail:', err);
      setError(err.response?.data?.message || err.message || 'Lỗi khi tải dữ liệu bài báo khoa học.');
    } finally {
      setIsLoading(false);
    }
  }, [id, currentUser, fetchRecommendedArticles]);

  useEffect(() => {
    fetchArticleDetail();
  }, [fetchArticleDetail]);

  const handleBookmarkToggle = async () => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }

    setIsBookmarkLoading(true);
    const localBookmarkKey = `bookmark_${currentUser.username}_${id}`;
    const nextState = !isBookmarked;

    try {
      await bookmarkArticleApi(id);
      setIsBookmarked(nextState);
      localStorage.setItem(localBookmarkKey, String(nextState));
      toast.success(nextState ? 'Đã thêm bài báo vào project.' : 'Đã xóa bài báo khỏi project.');
    } catch (err) {
      console.warn('Bookmark API error, toggling state locally:', err);
      setIsBookmarked(nextState);
      localStorage.setItem(localBookmarkKey, String(nextState));
      toast.warning('Không thể đồng bộ server, đã cập nhật tạm trên trình duyệt.');
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  const handleDoiClick = () => {
    if (!articleDoiUrl) return;
    window.open(articleDoiUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareArticle = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: article?.title || 'Article detail',
      text: `Khám phá bài báo: ${article?.title || ''}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Đã mở chia sẻ bài báo.');
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      toast.success('Đã sao chép liên kết bài báo.');
    } catch (err) {
      if (err?.name === 'AbortError') return;
      console.warn('Unable to share article:', err);
      toast.error('Không thể chia sẻ bài báo lúc này.');
    }
  };



  const handleKeywordClick = (keyword) => {
    const keywordId = keyword.keyword_id || keyword.id;
    if (keywordId) {
      navigate(`/keywords/${keywordId}/articles`);
      return;
    }

    const label = keyword.display_name || keyword.name || keyword.keyword;
    if (label) {
      navigate(`/articles?search=${encodeURIComponent(label)}`);
    }
  };

  const handleTopicClick = (topic) => {
    const topicId = topic?.topic_id || topic?.id;
    if (topicId) {
      navigate(`/topics/${topicId}`);
      return;
    }

    const label = topic?.display_name || topic?.name || '';
    if (!label) return;
    navigate(`/articles?search=${encodeURIComponent(label)}`);
  };

  const handleOrganizationAccess = () => {
    if (article?.is_open_access && article?.doi) {
      window.open(getDoiUrl(article.doi), '_blank', 'noopener,noreferrer');
      return;
    }

    toast.info('Hiện chưa có cổng truy cập tổ chức riêng cho bài báo này.');
  };

  const articleDoiUrl = getDoiUrl(article?.doi);

  return (
    <div className="article-detail-page grid-bg">
      <Header />

      <Container fluid className="position-relative z-1 px-3 px-xl-5">
        {isLoading ? (
          <ArticleDetailSkeleton />
        ) : error ? (
          <ArticleDetailError errorMsg={error} onRetry={fetchArticleDetail} />
        ) : !article ? (
          <ArticleDetailEmpty articleId={id} />
        ) : (
          <main className="article-detail-container">
            <div className="article-detail-shell">
              <aside className="article-detail-sidebar d-none d-xl-block">
                <h2
                  className={`article-detail-journal-title mb-4 ${article.journal_id ? 'is-clickable' : ''}`}
                  role={article.journal_id ? 'button' : undefined}
                  onClick={() => article.journal_id && navigate(`/journals/${article.journal_id}`)}
                >
                  {article.journal_name || 'Scientific Journal'}
                </h2>

                <div className="article-detail-meta-list">
                  <span><strong>Date:</strong> {article.publication_year || 'Đang cập nhật'}</span>
                  <span><strong>Article:</strong> {article.article_id}</span>
                  <span>
                    <strong>Volume:</strong>{' '}
                    <Button
                      variant="link"
                      disabled={!article.volume_id}
                      onClick={() => article.volume_id && navigate(`/articles?volume_id=${article.volume_id}`)}
                      className="article-detail-meta-link"
                      
                    >
                      {article.volume_number || '—'}
                    </Button>
                  </span>
                  <span>
                    <strong>Issue:</strong>{' '}
                    <Button
                      variant="link"
                      disabled={!article.issue_id}
                      onClick={() => article.issue_id && navigate(`/articles?issue_id=${article.issue_id}`)}
                      className="article-detail-meta-link"
                      
                    >
                      {article.issue_number || '—'}
                    </Button>
                  </span>
                  <span><strong>Access:</strong> {article.is_open_access ? 'Open access' : 'Restricted'}</span>
                </div>

                <div className="article-detail-divider" />

                <div className="text-muted-custom text-xs fw-bold text-uppercase mb-2">Published by</div>
                <div className="text-xs text-muted-custom fw-semibold text-uppercase d-flex flex-column gap-1">
                  <span>{article.publisher_name || 'Đang cập nhật'}</span>
                  <span>Coverage: {article.publication_year || '—'}</span>
                </div>
              </aside>

              <section className="article-detail-main">
                <div className="article-detail-breadcrumb">
                  <span role="button" onClick={() => navigate('/articles')} className="article-detail-breadcrumb-link">Bài báo</span>
                  <Icon icon="lucide:chevron-right" width="12" />
                  <span style={{ color: 'var(--text-main)' }}>Chi tiết bài báo</span>
                </div>


                <h1 className="article-detail-title">
                  {article.title}
                </h1>

                <div className="article-detail-authors">
                  {visibleAuthors.length > 0 ? (
                    visibleAuthors.map((author, index) => {
                      const authorLabel = author.display_name || author.name || author.author_name || 'Tác giả';
                      const authorId = author.author_id || author.id;
                      return (
                        <Button
                          key={authorId || `${authorLabel}-${index}`}
                          variant="link"
                          disabled={!authorId}
                          onClick={() => authorId && navigate(`/authors/${authorId}`)}
                          className="article-detail-author-link"
                          title={authorId ? `Xem chi tiết ${authorLabel}` : authorLabel}
                        >
                          {authorLabel}{index < visibleAuthors.length - 1 ? ',' : ''}
                        </Button>
                      );
                    })
                  ) : (
                    <span>Đang cập nhật tác giả</span>
                  )}
                  {hiddenAuthorCount > 0 && !showAllAuthors && (
                    <Button
                      variant="link"
                      onClick={() => setShowAllAuthors(true)}
                      className="article-detail-author-toggle"
                      
                    >
                      Show more +{hiddenAuthorCount}
                    </Button>
                  )}
                  {showAllAuthors && (article?.authors?.length || 0) > 3 && (
                    <Button
                      variant="link"
                      onClick={() => setShowAllAuthors(false)}
                      className="article-detail-author-toggle"
                      
                    >
                      Show less
                    </Button>
                  )}
                </div>


                <div className="article-detail-action-bar">
                  <div className="article-detail-actions">
                    <Button
                      variant="link"
                      onClick={() => setShowCitationsModal(true)}
                      className="article-detail-action-btn"
                      
                    >
                      <Icon icon="lucide:quote" width="15" />
                      Citations: {article.semantic_citation_count ?? article.citations ?? 0}
                    </Button>
                    <Button
                      variant="link"
                      disabled={isBookmarkLoading}
                      onClick={handleBookmarkToggle}
                      className={`article-detail-action-btn ${isBookmarked ? 'is-active' : ''}`}
                    >
                      <Icon icon={isBookmarked ? 'lucide:bookmark-check' : 'lucide:bookmark-plus'} width="15" />
                      Add to Project
                    </Button>
                    <Button
                      variant="link"
                      onClick={handleShareArticle}
                      className="article-detail-action-btn"
                      
                    >
                      <Icon icon="lucide:share-2" width="15" />
                      Share
                    </Button>
                    
                  </div>
                </div>

                <div className="article-detail-external-bar">
                  {articleDoiUrl && (
                    <a
                      href={articleDoiUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="article-detail-doi-link"
                    >
                      {articleDoiUrl}
                      <Icon icon="lucide:external-link" width="14" />
                    </a>
                  )}
                  <span className="article-detail-access-badge">
                    <span className={`article-detail-access-dot ${article.is_open_access ? 'is-open' : ''}`} />
                    {article.is_open_access ? 'Open access' : 'Restricted access'}
                  </span>
                </div>

                <div className="article-detail-tabs">
                  <Button
                    variant="link"
                    onClick={() => setActiveTab('preview')}
                    className={`article-detail-tab-btn ${activeTab === 'preview' ? 'is-active' : ''}`}
                  >
                    Article Preview
                  </Button>
                  <Button
                    variant="link"
                    onClick={() => setActiveTab('keywords_topics')}
                    className={`article-detail-tab-btn ${activeTab === 'keywords_topics' ? 'is-active' : ''}`}
                  >
                    Keywords & Topics
                  </Button>
                  <Button
                    variant="link"
                    onClick={() => setActiveTab('references')}
                    className={`article-detail-tab-btn ${activeTab === 'references' ? 'is-active' : ''}`}
                  >
                    References ({(article.references || []).length})
                  </Button>
                  <Button
                    variant="link"
                    onClick={() => setActiveTab('recommended')}
                    className={`article-detail-tab-btn ${activeTab === 'recommended' ? 'is-active' : ''}`}
                  >
                    Recommended Articles
                  </Button>
                  <Button
                    variant="link"
                    onClick={() => navigate(`/articles/${id}/visual`)}
                    className="article-detail-tab-btn"
                    style={{ color: 'var(--primary)', fontWeight: 'bold' }}
                  >
                    <Icon icon="lucide:network" width="14" className="me-1" />
                    Interactive Graph
                  </Button>
                </div>

                {activeTab === 'preview' ? (
                  <div className="article-preview-grid">
                    <article>
                      {/* TL;DR section */}
                      {article.semantic_tldr && (
                        <section id="tldr" className="article-section">
                          <h2 className="article-section-title" style={{ fontSize: '1.4rem' }}>TL;DR</h2>
                          <div
                            className="p-3 rounded"
                            style={{
                              backgroundColor: 'var(--primary-light)',
                              borderLeft: '4px solid var(--primary)',
                              color: 'var(--text-main)',
                              fontSize: '0.95rem',
                              lineHeight: '1.65',
                            }}
                          >
                            <strong>Summary:</strong> {article.semantic_tldr}
                          </div>
                        </section>
                      )}

                      <section id="abstract" className="article-section">
                        <h2 className="article-section-title" style={{ fontSize: '1.65rem' }}>Abstract</h2>
                        {(article.abstract || 'No abstract is available for this article.')
                          .split('\n')
                          .filter(Boolean)
                          .map((paragraph, index) => (
                            <p key={index} className="article-section-text">
                              {paragraph}
                            </p>
                          ))}
                      </section>


                      <section id="section-snippets" className="article-section">
                        <h2 className="article-section-title">Section snippets</h2>
                        <p className="article-section-text" style={{ fontSize: '0.98rem' }}>
                          Tóm tắt nhanh: bài báo thuộc chủ đề <strong>{article.topic_name || 'Research'}</strong>,
                          công bố trong <strong>{article.journal_name || 'Scientific Journal'}</strong>
                          {article.publication_year ? ` năm ${article.publication_year}` : ''}.
                        </p>
                      </section>
                    </article>

                    <aside className="article-toc-aside d-none d-lg-block">
                      <div className="article-toc-title">Article preview</div>
                      <nav className="d-flex flex-column gap-2">
                        {article.semantic_tldr && (
                          <Button variant="link" onClick={() => smoothScrollTo('tldr')} className="article-toc-link">TL;DR</Button>
                        )}
                        <Button variant="link" onClick={() => smoothScrollTo('abstract')} className="article-toc-link is-active">Abstract</Button>
                        <Button variant="link" onClick={() => smoothScrollTo('section-snippets')} className="article-toc-link">Section snippets</Button>
                      </nav>
                    </aside>
                  </div>
                ) : activeTab === 'keywords_topics' ? (
                  <div className="keywords-topics-tab-panel">
                    <section className="mb-5">
                      <h2 className="article-section-title mb-4">Keywords</h2>
                      {(article.keywords || []).length > 0 ? (
                        <div className="row g-4">
                          {article.keywords.map((keyword, index) => {
                            const label = keyword.display_name || keyword.name || keyword.keyword;
                            const keywordId = keyword.keyword_id || keyword.id;
                            return (
                              <div key={keywordId || `${label}-${index}`} className="col-12 col-md-6 col-lg-4">
                                <div className="keyword-card d-flex flex-column justify-content-between h-100">
                                  <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                                    <div>
                                      <div className="keyword-card-label">Research keyword</div>
                                      <h3 className="keyword-card-title">{label}</h3>
                                    </div>
                                    <Icon icon="lucide:tags" width="18" className="keyword-card-icon" />
                                  </div>
                                  <Button
                                    id={`keyword-view-${keywordId || label}`}
                                    type="button"
                                    onClick={() => handleKeywordClick(keyword)}
                                    className="keyword-card-action d-inline-flex align-items-center gap-2 mt-3"
                                    style={{ width: 'fit-content' }}
                                  >
                                    <span>Xem bài báo liên quan</span>
                                    <Icon icon="lucide:arrow-up-right" width="16" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="article-reference-card-empty text-center py-5">
                          <Icon icon="lucide:tags" width="48" className="text-muted mb-3" />
                          <p className="mb-0">{keywordsText}</p>
                        </div>
                      )}
                    </section>

                    {article.topics?.length > 0 && (
                      <section className="mt-5">
                        <h2 className="article-section-title mb-3">Topics</h2>
                        <div className="d-flex gap-2 flex-wrap">
                          {article.topics.map((topic) => (
                            <Button
                              key={topic.topic_id || topic.display_name}
                              variant="light"
                              onClick={() => handleTopicClick(topic)}
                              className="article-topic-chip"
                              style={topicKeywordChipStyle}
                            >
                              {topic.display_name}
                            </Button>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                ) : activeTab === 'references' ? (
                  <div className="references-tab-panel">
                    <h2 className="article-section-title mb-4">References</h2>
                    <p className="article-section-text mb-4" style={{ fontSize: '0.98rem' }}>
                      Bài báo hiện có <strong>{(article.references || []).length}</strong> tài liệu tham khảo được đồng bộ trong hệ thống.
                      Số lượt trích dẫn của bài báo này là <strong>{article.semantic_citation_count ?? article.citations ?? 0}</strong>.
                    </p>

                    {(article.references || []).length > 0 ? (
                      <div className="d-grid gap-3">
                        {(article.references || []).map((referenceUrl, index) => {
                          return (
                            <a
                              key={`${referenceUrl}-${index}`}
                              href={referenceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="article-reference-card"
                            >
                              <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
                                <div className="min-w-0">
                                  <div className="article-reference-label">
                                    Reference {index + 1}
                                  </div>
                                  <div className="article-reference-title">
                                    {formatReferenceLabel(referenceUrl, index)}
                                  </div>
                                  <div className="article-reference-url">
                                    {referenceUrl}
                                  </div>
                                </div>
                                <span className="article-reference-action">
                                  <Icon icon="lucide:external-link" width="16" />
                                  Mở nguồn
                                </span>
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="article-reference-card-empty text-center py-5">
                        Chưa có danh sách reference chi tiết cho bài báo này.
                      </div>
                    )}
                  </div>
                ) : (
                  <ArticlesTabContent
                    recentArticles={recommendedArticles}
                    loading={isRecommendedLoading}
                    onArticleClick={(articleId) => navigate(`/articles/${articleId}/visual`)}
                  />
                )}
              </section>
            </div>

          </main>

        )}
      </Container>

      <Modal show={showCitationsModal} onHide={() => setShowCitationsModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="font-display fw-bold">Citations / Cited by</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="article-modal-stat-box">
            <div className="text-muted-custom text-xs fw-bold text-uppercase mb-1">Tổng lượt trích dẫn</div>
            <div className="font-display fw-bold" style={{ fontSize: '2rem', color: 'var(--text-main)' }}>
              {(article?.citations ?? 0).toLocaleString('en-US')}
            </div>
          </div>

          <p className="text-muted-custom mb-3" style={{ lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--text-main)' }}>Citations</strong> là số lượng bài báo hoặc công trình khác đã nhắc tới / trích dẫn lại bài báo này.
          </p>

          <div className="d-grid gap-2" style={{ fontSize: '0.94rem' }}>
            <div><strong>DOI:</strong> mã định danh cố định của bài báo.</div>
            <div><strong>References:</strong> danh sách tài liệu mà bài báo này trích dẫn.</div>
            <div><strong>Citations / Cited by:</strong> số công trình khác trích dẫn lại bài báo này.</div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowCitationsModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      <AuthRequiredModal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
      />
    </div>
  );
}
