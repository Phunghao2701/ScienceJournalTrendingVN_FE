/**
 * ArticleDetailPage: full-detail view for a single article, styled after Lens.org multi-column layout.
 *
 * File: src/features/trendingVN/pages/ArticleDetailPage.jsx
 *
 * Layout: Header -> top search bar -> two-column content (left: article detail, right: sidebar)
 * Tabs: Summary | Citing Works | References | Collections
 * Data source: GET /api/v1/articles/:id (via useTrendingArticleDetail)
 */
import { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Modal, Form, Collapse, Row, Col, Dropdown, ButtonGroup } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';

// Layout & Auth
import Header from '../../landing/components/Header';
import useAuth from '../../auth/hooks/useAuth';

// API & Helpers
import { getDoiUrl } from '../../article/utils/articleFormatters';
import { toast } from '../../../shared/utils/toast';
import { useTrendingArticleDetail } from '../hooks/useTrendingArticleDetail';

// Subcomponents
import ArticleDetailSkeleton from '../../article/components/ArticleDetailSkeleton';
import ArticleDetailEmpty from '../../article/components/ArticleDetailEmpty';
import ArticleDetailError from '../../article/components/ArticleDetailError';
import ArticlesTabContent from '../../journal/components/ArticlesTabContent';
import AuthRequiredModal from '../../../shared/components/AuthRequiredModal';

import '../trendingVN.css';

const formatReferenceLabel = (referenceUrl = '', index = 0) => {
  const rawValue = String(referenceUrl || '').trim();
  if (!rawValue) return `Reference ${index + 1}`;

  const workId = rawValue.split('/').filter(Boolean).pop();
  return workId ? `OpenAlex ${workId}` : `Reference ${index + 1}`;
};

export default function ArticleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const currentUser = auth?.user;


  const {
    article,
    isLoading,
    error,
    isBookmarked,
    isBookmarking: isBookmarkLoading,
    citingWorks,
    recommendedArticles,
    isRelatedLoading,
    searchQuery,
    handleBookmarkToggle,
    refetch,
  } = useTrendingArticleDetail(id, currentUser);
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'citations' | 'references' | 'recommended' | 'collections'
  const [expandedAbstracts, setExpandedAbstracts] = useState({});
  const [showAllAuthors, setShowAllAuthors] = useState(false);
  const [showCitationsModal, setShowCitationsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState(null); // 'filters' | 'profile' | 'info' | 'more'
  const [scholarlyResultsCount] = useState(0);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/articles?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e);
    }
  };

  const toggleAbstract = (articleId) => {
    setExpandedAbstracts((prev) => ({ ...prev, [articleId]: !prev[articleId] }));
  };

  const visibleAuthors = useMemo(() => {
    const authors = article?.authors || [];
    if (showAllAuthors) return authors;
    return authors.slice(0, 3);
  }, [article?.authors, showAllAuthors]);

  const hiddenAuthorCount = Math.max((article?.authors?.length || 0) - 3, 0);


  const renderRelatedArticleCard = (item) => {
    const isExpanded = expandedAbstracts[item.article_id] || false;
    const docId = `VN ${1000000 + Number(item.article_id)} A`;

    return (
      <div key={item.article_id} className="lens-article-card p-3 mb-3">
        <div className="d-flex align-items-start gap-2">
          {/* Chevron/Expand Trigger */}
          <div 
            className="d-flex align-items-center justify-content-center cursor-pointer pt-1" 
            style={{ minWidth: '24px', color: 'var(--primary)' }}
            onClick={() => toggleAbstract(item.article_id)}
          >
            <Icon 
              icon={isExpanded ? "lucide:chevron-down-circle" : "lucide:chevron-right-circle"} 
              width="18" 
            />
          </div>

          {/* Content */}
          <div className="flex-grow-1 min-w-0">
            {/* Title */}
            <div
              className="lens-article-title text-primary-hover fw-bold font-sans"
              style={{ fontSize: '1.05rem', cursor: 'pointer', color: 'var(--text-main)' }}
              onClick={() => navigate(`/trending/articles/${item.article_id}`)}
            >
              {item.title}
            </div>

            {/* Meta badges */}
            <div className="lens-meta-line mt-1">
              <span className="lens-meta-badge">{docId}</span>
              <span className="text-xs text-muted-custom">Journal Article</span>
              <span>â€¢</span>
              <span className="text-xs text-muted-custom">{t('yearLabel')}: {item.publication_year || 'â€”'}</span>
              <span>â€¢</span>
              <span className="d-flex align-items-center gap-1 text-xs">
                <span className="lens-status-dot" style={{ background: '#16a34a', width: '6px', height: '6px', borderRadius: '50%' }} />
                <span style={{ color: '#16a34a', fontWeight: 650 }}>{t('statusPublished')}</span>
              </span>
            </div>

            {/* Authors */}
            <div className="lens-detail-line text-xs mt-1" style={{ color: 'var(--text-main)' }}>
              <strong>{t('authorsLabel')}: </strong>
              {item.authors && item.authors.length > 0 ? (
                item.authors.map((au, aIdx) => (
                  <span key={aIdx} className="text-link" style={{ color: 'var(--primary)', cursor: 'pointer' }}>
                    {au.display_name || au.name}
                    {aIdx < item.authors.length - 1 ? '; ' : ''}
                  </span>
                ))
              ) : (
                <span style={{ fontStyle: 'italic' }}>{t('anyAuthor')}</span>
              )}
            </div>

            {/* Journal */}
            {item.journal_name && (
              <div className="lens-detail-line text-xs mt-1" style={{ color: 'var(--text-main)' }}>
                <strong>{t('journalLabel')}: </strong>
                <span
                  className="text-link"
                  style={{ color: 'var(--primary)', cursor: 'pointer' }}
                  onClick={() => navigate(`/journals/${item.journal_id}`)}
                >
                  {item.journal_name}
                </span>
              </div>
            )}

            {/* Citations/References counts */}
            <div className="lens-detail-line text-xs mt-1" style={{ color: 'var(--text-main)' }}>
              <strong>{t('citedWorksLabel')}:</strong> 0 | {' '}
              <strong>{t('citedByLabel')}:</strong>{' '}
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{item.citations || 0}</span> | {' '}
              <strong>{t('citesLabel')}:</strong> 0
              {item.doi && (
                <>
                  {' | '}
                  <strong>{t('doiLabel')}:</strong>{' '}
                  <span style={{ fontFamily: 'monospace', fontSize: '0.68rem' }}>{item.doi}</span>
                </>
              )}
            </div>

            {/* Badges row */}
            <div className="lens-pill-row mt-2">
              {item.is_open_access && (
                <span className="lens-pill lens-pill-oa">
                  <Icon icon="lucide:lock-open" width="10" />
                  {t('openAccess')}
                </span>
              )}
              <span className="lens-pill lens-pill-pending">
                <Icon icon="lucide:file-text" width="10" />
                {t('statusPublished')}
              </span>
              <span
                className="lens-pill lens-pill-abstract cursor-pointer"
                onClick={() => toggleAbstract(item.article_id)}
              >
                <Icon icon="lucide:text" width="10" />
                {t('abstract')}
              </span>
            </div>

            {/* Detailed split-layout collapse block (Lens-style, matched with Tri's search layout) */}
            <Collapse in={isExpanded}>
              <div className="lens-expanded-box mt-3 p-3 border rounded bg-white" style={{ borderColor: 'var(--border)' }}>
                <Row className="g-3">
                  {/* Left Column: Abstract, Claims, Applicants, Inventors, Classifications */}
                  <Col md={8} className="expanded-left-col">
                    {/* 1. Abstract */}
                    <div className="expanded-section mb-3">
                      <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>{t('abstractTitle')}</div>
                      <p className="text-muted text-xs text-justify" style={{ lineHeight: '1.5', margin: 0 }}>
                        {item.abstract || t('anyTopic')}
                      </p>
                    </div>

                    {/* 2. Claims */}
                    <div className="expanded-section mb-3">
                      <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>{t('claims')}</div>
                      <p className="text-muted text-xs mb-0" style={{ fontStyle: 'italic' }}>
                        {t('claimsUnavailable')}
                      </p>
                    </div>

                    {/* 3. Applicants & Classifications (Row layout) */}
                    <Row className="mb-3">
                      <Col sm={6}>
                        <div className="expanded-section">
                          <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>{t('publisherExact')}</div>
                          <div className="text-xs text-primary d-flex align-items-center gap-1 font-semibold">
                            <Icon icon="lucide:building-2" width="12" />
                            {item.publisher_name || item.journal_name || t('anyJournal')}
                          </div>
                        </div>
                      </Col>
                      <Col sm={6}>
                        <div className="expanded-section">
                          <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1 d-flex align-items-center gap-1" style={{ letterSpacing: '0.5px' }}>
                            {t('ipcClassifications')}
                            <Icon icon="lucide:info" width="12" style={{ color: '#ef6c00', cursor: 'pointer' }} />
                          </div>
                          <div className="text-xs">
                            <span className="badge bg-light text-dark border px-2 py-1 font-monospace" style={{ fontSize: '0.68rem', fontWeight: 500 }}>
                              {item.primary_topic || t('anyTopic')}
                            </span>
                          </div>
                        </div>
                      </Col>
                    </Row>

                    {/* 4. Inventors (Authors) */}
                    <div className="expanded-section">
                      <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>{t('authorsLabel')}</div>
                      <div className="d-flex flex-wrap gap-2">
                        {item.authors && item.authors.length > 0 ? (
                          item.authors.map((au, idx) => (
                            <span key={au.author_id || idx} className="text-xs text-primary d-flex align-items-center gap-1 border rounded px-2 py-1 bg-light">
                              <Icon icon="lucide:user" width="12" />
                              {au.display_name || au.name}
                              {au.last_known_institution && (
                                <span className="text-muted font-normal" style={{ fontSize: '0.62rem' }}>
                                  ({au.last_known_institution})
                                </span>
                              )}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-muted font-italic">{t('anyAuthor')}</span>
                        )}
                      </div>
                    </div>
                  </Col>

                  {/* Right Column: Document Preview, History */}
                  <Col md={4} className="expanded-right-col border-start ps-3">
                    {/* 1. Document Preview */}
                    <div className="expanded-section mb-3">
                      <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>{t('docPreview')}</div>
                      <div className="preview-container border rounded d-flex flex-column align-items-center justify-content-center bg-light p-4 text-center" style={{ minHeight: '160px' }}>
                        <Icon icon="lucide:alert-circle" className="text-danger mb-2" width="24" />
                        <span className="text-xs text-muted fw-bold">{t('noImageYet')}</span>
                      </div>
                    </div>

                    {/* 2. History */}
                    <div className="expanded-section">
                      <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>{t('history')}</div>
                      <div className="history-timeline text-xs d-flex flex-column gap-2">
                        <div className="history-item">
                          <div className="fw-semibold text-dark">{t('publication')}: {item.publication_year || 'â€”'}</div>
                          <div className="text-muted font-monospace" style={{ fontSize: '0.68rem' }}>
                            {docId}
                          </div>
                        </div>
                        <div className="history-item border-top pt-1.5">
                          <div className="fw-semibold text-dark">{t('application')}: {item.publication_year || 'â€”'}</div>
                          <div className="text-muted font-monospace" style={{ fontSize: '0.68rem' }}>
                            {docId.replace(/\s*[A-Z]$/, '')}
                          </div>
                        </div>
                        <div className="history-item border-top pt-1.5">
                          <div className="fw-semibold text-dark d-flex align-items-center gap-1">
                            {t('priority')}: {item.publication_year || 'â€”'}
                            <Icon icon="lucide:link" width="10" className="text-muted" />
                          </div>
                          <div className="text-muted font-monospace" style={{ fontSize: '0.68rem' }}>
                            {docId.replace(/\s*[A-Z]$/, '')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Collapse>
          </div>
        </div>
      </div>
    );
  };


  const handleBookmarkToggleClick = async () => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    try {
      await handleBookmarkToggle();
      toast.success(isBookmarked ? "Ðã b? luu bài vi?t" : "Ðã luu bài vi?t thành công");
    } catch (err) {
      toast.error("L?i khi c?p nh?t danh sách dã luu");
    }
  };


  const handleShareArticle = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: article?.title || 'Article detail',
      text: `KhÃ¡m phÃ¡ bÃ i bÃ¡o: ${article?.title || ''}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('ÄÃ£ má»Ÿ chia sáº» bÃ i bÃ¡o.');
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      toast.success('ÄÃ£ sao chÃ©p liÃªn káº¿t bÃ i bÃ¡o.');
    } catch (err) {
      if (err?.name === 'AbortError') return;
      console.warn('Unable to share article:', err);
      toast.error('KhÃ´ng thá»ƒ chia sáº» bÃ i bÃ¡o lÃºc nÃ y.');
    }
  };

  const handleKeywordClick = (keyword) => {
    const label = keyword.display_name || keyword.name || keyword.keyword;
    if (label) {
      navigate(`/articles?search=${encodeURIComponent(label)}`);
    }
  };

  const generateBibTeX = useCallback(() => {
    if (!article) return '';
    const authorList = (article.authors || [])
      .map((a) => a.display_name || a.name || 'TÃ¡c giáº£')
      .join(' and ');
    return `@article{article_${article.article_id || '3233'},
  title={${article.title}},
  author={${authorList}},
  journal={${article.journal_name || 'ArXiv.org'}},
  year={${article.publication_year || '2025'}},
  doi={${article.doi || ''}}
}`;
  }, [article]);

  const generateRIS = useCallback(() => {
    if (!article) return '';
    const authorList = (article.authors || [])
      .map((a) => `AU  - ${a.display_name || a.name || 'TÃ¡c giáº£'}`)
      .join('\n');
    return `TY  - JOUR
T1  - ${article.title}
${authorList}
JO  - ${article.journal_name || 'ArXiv.org'}
PY  - ${article.publication_year || '2025'}
DO  - ${article.doi || ''}
ER  - `;
  }, [article]);

  const handleCopyCitationText = async (text, formatName) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`ÄÃ£ sao chÃ©p trÃ­ch dáº«n dáº¡ng ${formatName}!`);
    } catch (err) {
      console.warn('Unable to copy citation:', err);
      toast.error('KhÃ´ng thá»ƒ sao chÃ©p trÃ­ch dáº«n.');
    }
  };

  const handleDownloadCitationFile = (content, filename, contentType) => {
    try {
      const blob = new Blob([content], { type: contentType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`ÄÃ£ táº£i xuá»‘ng tá»‡p ${filename}!`);
    } catch (err) {
      console.warn('Unable to download citation:', err);
      toast.error('KhÃ´ng thá»ƒ táº£i tá»‡p trÃ­ch dáº«n.');
    }
  };

  const handleTopicClick = (topic) => {
    const label = topic?.display_name || topic?.name || '';
    if (!label) return;
    navigate(`/articles?search=${encodeURIComponent(label)}`);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };



  const articleDoiUrl = getDoiUrl(article?.doi);

  if (isLoading) {
    return (
      <div className="article-detail-page-wrapper">
        <Header />
        <Container fluid className="px-3 px-xl-5 mt-4">
          <ArticleDetailSkeleton />
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="article-detail-page-wrapper">
        <Header />
        <Container fluid className="px-3 px-xl-5 mt-4">
          <ArticleDetailError errorMsg={error} onRetry={refetch} />
        </Container>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="article-detail-page-wrapper">
        <Header />
        <Container fluid className="px-3 px-xl-5 mt-4">
          <ArticleDetailEmpty articleId={id} />
        </Container>
      </div>
    );
  }

  return (
    <div className="article-detail-page-wrapper grid-bg">
      <Header />

      {/* Top search bar (mirrors Lens.org search UX) */}
      <section className="lens-top-search-section">
        <div className="lens-search-container-fluid d-flex align-items-center justify-content-between flex-wrap gap-3">
          {/* Left Side */}
          <div className="lens-top-search-left d-flex align-items-center gap-2">
            <Button 
              variant="link" 
              className="lens-home-btn p-1 text-muted d-flex align-items-center justify-content-center"
              onClick={() => navigate('/articles')}
              title="Home"
            >
              <Icon icon="lucide:home" width="18" height="18" />
            </Button>
            <div className="lens-top-search-divider" />
            <div 
              className="lens-results-count font-sans text-xs text-muted-custom cursor-pointer"
              onClick={handleSearchSubmit}
              title="Click to run this search query"
              style={{ cursor: 'pointer' }}
            >
              <span className="fw-bold text-dark">{scholarlyResultsCount}</span> Scholarly Results
            </div>
            <div 
              className="lens-active-id-badge font-sans text-xs text-muted-custom border rounded px-2 py-0.5 bg-light cursor-pointer"
              onClick={() => {
                const textToCopy = article.doi || `ID: ${article.article_id}`;
                navigator.clipboard.writeText(textToCopy);
                toast.success(article.doi ? `Copied DOI to clipboard!` : `Copied ID to clipboard!`);
              }}
              title={article.doi ? "Click to copy DOI to clipboard" : "Click to copy ID to clipboard"}
              style={{ cursor: 'pointer' }}
            >
              {article.doi || `ID: ${article.article_id}`}
            </div>
          </div>

          {/* Right Side */}
          <div className="lens-top-search-right d-flex align-items-center">
            <div className="lens-search-bar-wrapper d-flex align-items-stretch">
              <div className="position-relative d-flex align-items-center" style={{ width: '400px' }}>
                <Form.Control
                  type="text"
                  value={searchQuery}
                  onChange={() => {}}
                  onKeyDown={handleKeyDown}
                  placeholder="Search database..."
                  className="lens-search-input-field"
                />
                <span 
                  className="lens-search-help-trigger" 
                  onClick={() => setShowHelpModal(true)}
                  title="Search query syntax help"
                  style={{ cursor: 'pointer' }}
                >
                  <Icon icon="lucide:help-circle" width="16" height="16" />
                </span>
              </div>
              <Dropdown as={ButtonGroup} className="lens-search-split-dropdown">
                <Button className="lens-btn-search-submit" onClick={handleSearchSubmit}>Search</Button>
                <Dropdown.Toggle split className="lens-btn-search-toggle" />
                <Dropdown.Menu align="end" className="shadow-sm border">
                  <Dropdown.Item onClick={() => {
                    toast.info("Patent Search is not active in this edition. Redirecting to Scholarly search.");
                    navigate('/articles');
                  }}>New Patent Search</Dropdown.Item>
                  <Dropdown.Item onClick={() => navigate('/articles?search=')}>New Scholar Search</Dropdown.Item>
                  <Dropdown.Item onClick={() => navigate('/authors')}>Profile Search</Dropdown.Item>
                  <Dropdown.Item onClick={() => navigate('/keywords')}>Classification Explorer</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </div>
      </section>

      {/* Main Layout Wrapper */}
      <div className="lens-layout-wrapper">
        {/* Left Icon Sidebar (Lens-style) */}
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
          <button className="lens-sidebar-icon-btn" title={t('articleSearch')} onClick={() => navigate('/articles')}>
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

        {/* Expanded Sidebar Drawer (Lens-style) */}
        {activeLeftTab && (
          <aside className="lens-expanded-sidebar">
            {/* 1. FILTERS TAB VIEW */}
            {activeLeftTab === 'filters' && (
              <div className="lens-drawer-content">
                <div className="lens-drawer-header">
                  <span className="lens-drawer-title">{t('sbFilters') || 'Filters'}</span>
                  <Icon icon="lucide:info" className="info-icon" width="14" style={{ color: '#ef6c00', cursor: 'pointer' }} />
                </div>
                <div className="lens-drawer-scrollable">
                  {[
                    { key: 'dateRange', label: t('sbDateRange') || 'Date Range', icon: 'lucide:calendar', action: () => navigate('/articles') },
                    { key: 'flags', label: t('sbFlags') || 'Flags', icon: 'lucide:flag', action: () => navigate('/articles?access=open') },
                    { key: 'jurisdiction', label: t('sbJurisdiction') || 'Jurisdiction', icon: 'lucide:map-pin', action: () => navigate('/geography') },
                    { key: 'applicants', label: t('sbApplicants') || 'Applicants', icon: 'lucide:user-check', action: () => navigate('/journals') },
                    { key: 'inventors', label: t('sbInventors') || 'Inventors', icon: 'lucide:users', action: () => navigate('/authors') },
                    { key: 'owners', label: t('sbOwners') || 'Owners', icon: 'lucide:award', action: () => navigate('/articles') },
                    { key: 'legalStatus', label: t('sbLegalStatus') || 'Legal Status', icon: 'lucide:scale', action: () => navigate('/articles') },
                    { key: 'docType', label: t('sbDocType') || 'Document Type', icon: 'lucide:file-text', action: () => navigate('/articles') },
                    { key: 'citedWorks', label: t('sbCitedWorks') || 'Cited Works', icon: 'lucide:book-open', action: () => navigate('/articles') },
                    { key: 'classifications', label: t('sbClassifications') || 'Classifications', icon: 'lucide:list', action: () => navigate('/keywords') },
                    { key: 'newSearch', label: t('sbNewSearch') || 'New Search', icon: 'lucide:search', action: () => navigate('/articles') }
                  ].map(item => (
                    <div
                      key={item.key}
                      className="lens-drawer-item"
                      onClick={() => {
                        setActiveLeftTab(null);
                        item.action();
                      }}
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
                    {currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : 'GU'}
                  </div>
                  <div className="lens-profile-info">
                    <div className="profile-name">{currentUser?.name || currentUser?.username || 'Guest User'}</div>
                    <div className="profile-subtitle">
                      Personal Account
                    </div>
                  </div>
                </div>

                <div className="lens-profile-actions">
                  <Dropdown className="flex-fill">
                    <Dropdown.Toggle variant="outline-primary" size="sm" className="w-100 font-sans text-xs d-flex align-items-center justify-content-between">
                      New Item
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="text-xs">
                      <Dropdown.Item onClick={() => navigate('/projects/create')}>Create Project</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>

                <div className="lens-drawer-section-title">Work Area</div>
                <div className="lens-drawer-scrollable">
                  {[
                    { key: 'savedQueries', label: 'Saved Queries', icon: 'lucide:save', action: () => navigate('/dashboard') },
                    { key: 'searchHistory', label: 'Search History', icon: 'lucide:search', action: () => navigate('/dashboard') },
                    { key: 'collections', label: 'Collections', icon: 'lucide:folder', action: () => navigate('/projects') },
                    { key: 'settings', label: 'Settings', icon: 'lucide:settings', action: () => navigate('/profile') }
                  ].map(item => (
                    <div
                      key={item.key}
                      className="lens-drawer-item"
                      onClick={() => {
                        setActiveLeftTab(null);
                        item.action();
                      }}
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
                  <span className="lens-drawer-title">Support</span>
                </div>
                
                <div className="px-3 py-2">
                  <p className="text-muted" style={{ fontSize: '0.72rem', lineHeight: '1.4', margin: '0 0 10px 0' }}>
                    Access Lens documentation, FAQs, and submit feedback.
                  </p>
                </div>

                <hr className="my-2 text-muted opacity-20" />

                <div className="lens-drawer-header pt-1">
                  <span className="lens-drawer-title">Suggestions</span>
                </div>

                <div className="lens-drawer-scrollable">
                  <div className="lens-suggestion-item" onClick={() => navigate('/projects/create')}>
                    <div className="suggestion-icon-wrapper">
                      <Icon icon="lucide:folder-plus" width="18" className="text-primary" />
                    </div>
                    <div className="suggestion-info">
                      <div className="suggestion-title">Create Collection</div>
                      <div className="suggestion-desc">Organize research into dynamic folders.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. MORE MENU VIEW */}
            {activeLeftTab === 'more' && (
              <div className="lens-drawer-content">
                <div className="lens-drawer-header">
                  <span className="lens-drawer-title">More</span>
                </div>
                <div className="lens-drawer-scrollable">
                  <div className="lens-drawer-item" onClick={() => navigate('/')}>
                    <Icon icon="lucide:home" width="16" className="item-icon" />
                    <span className="item-label">Home</span>
                  </div>
                  <div className="lens-drawer-item" onClick={() => navigate('/articles')}>
                    <Icon icon="lucide:file-text" width="16" className="item-icon" />
                    <span className="item-label">Scholarly Search</span>
                  </div>
                  <div className="lens-drawer-item" onClick={() => navigate('/geography')}>
                    <Icon icon="lucide:globe" width="16" className="item-icon" />
                    <span className="item-label">Geography</span>
                  </div>
                </div>
              </div>
            )}
          </aside>
        )}

        {/* ==================== MAIN CONTENT AREA ==================== */}
        <main className="lens-main-content w-100 px-3 px-xl-4 py-3">
            
            {/* Breadcrumb */}
            <div className="lens-breadcrumb">
              <span className="lens-breadcrumb-link" onClick={() => navigate('/articles')}>BÃ i bÃ¡o</span>
              <Icon icon="lucide:chevron-right" width="12" />
              <span className="lens-breadcrumb-current">Chi tiáº¿t bÃ i bÃ¡o</span>
            </div>

            {/* Article title and core metadata */}
            <section className="lens-article-header-section">
              <h1 className="lens-article-title">
                {article.title}
              </h1>

              {/* Secondary metadata row */}
              <div className="lens-meta-line flex-wrap gap-2">
                <span className="lens-badge-type">
                  <Icon icon="lucide:file-text" className="me-1" />
                  {article.publication_info || 'Journal Article'}
                </span>
                <span className={`lens-badge-access ${article.is_open_access ? 'open' : 'restricted'}`}>
                  <Icon icon={article.is_open_access ? 'lucide:lock-keyhole-open' : 'lucide:lock-keyhole'} className="me-1" />
                  {article.is_open_access ? 'Open Access' : 'Restricted Access'}
                </span>
                <span className="lens-meta-source text-muted-custom font-sans">
                  {article.publication_info === 'Preprint' ? (
                    <>
                      <span 
                        className="text-primary-hover cursor-pointer font-semibold" 
                        onClick={() => {
                          if (article.journal_id) {
                            navigate(`/journals/${article.journal_id}`);
                          } else {
                            navigate(`/articles?search=${encodeURIComponent(article.journal_name || 'ArXiv.org')}`);
                          }
                        }}
                      >
                        {article.journal_name || 'ArXiv.org'}
                      </span>
                      {', '}
                      {article.publication_date || article.publication_year || 'â€”'}
                    </>
                  ) : (
                    <>
                      <strong>Journal:</strong>{' '}
                      <span 
                        className="text-primary-hover cursor-pointer font-semibold" 
                        onClick={() => {
                          if (article.journal_id) {
                            navigate(`/journals/${article.journal_id}`);
                          } else {
                            navigate(`/articles?search=${encodeURIComponent(article.journal_name || 'Äang cáº­p nháº­t')}`);
                          }
                        }}
                      >
                        {article.journal_name || 'Äang cáº­p nháº­t'}
                      </span>, 
                      <strong> Vol:</strong> {article.volume_number || 'â€”'}, 
                      <strong> Issue:</strong> {article.issue_number || 'â€”'}, 
                      <strong> Published:</strong> {article.publication_date || article.publication_year || 'â€”'}
                    </>
                  )}
                </span>
              </div>

              {/* Authors list */}
              <div className="lens-authors-line">
                <strong>Authors:</strong>{' '}
                {visibleAuthors.length > 0 ? (
                  visibleAuthors.map((author, index) => {
                    const name = author.display_name || author.name || 'TÃ¡c giáº£';
                    return (
                      <span key={index}>
                        <Button 
                          variant="link" 
                          className="lens-author-link p-0"
                          onClick={() => author.author_id && navigate(`/authors/${author.author_id}`)}
                          disabled={!author.author_id}
                        >
                          {name}
                        </Button>
                        {index < visibleAuthors.length - 1 ? ', ' : ''}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-muted-custom">Äang cáº­p nháº­t tÃ¡c giáº£</span>
                )}

                {hiddenAuthorCount > 0 && !showAllAuthors && (
                  <Button variant="link" className="lens-show-more-btn" onClick={() => setShowAllAuthors(true)}>
                    +{hiddenAuthorCount} more
                  </Button>
                )}
                {showAllAuthors && (article?.authors?.length || 0) > 3 && (
                  <Button variant="link" className="lens-show-more-btn" onClick={() => setShowAllAuthors(false)}>
                    Show less
                  </Button>
                )}
              </div>

              {/* Citation stats row */}
              <div className="lens-stats-plain-line text-xs font-sans mt-2 mb-2 d-flex flex-wrap gap-4">
                <span>Citing Patents: <strong className="text-dark">{article.citing_patents ?? 0}</strong></span>
                <span className="pointer" onClick={() => setShowCitationsModal(true)}>
                  Citing Scholarly Works: <strong className="text-dark">{article.citations ?? 0}</strong>
                </span>
                <span>
                  Reference Count: <strong className="text-dark">{article.reference_count ?? 0}</strong>
                </span>
              </div>

              {/* Additional info badge row */}
              <div className="lens-additional-info-badges d-flex align-items-center gap-2 mt-2 mb-3">
                <span className="text-xs fw-bold text-muted-custom">Additional Info:</span>
                {article.is_open_access && (
                  <span 
                    className="badge-info-green text-xs fw-semibold px-2 py-0.5 rounded cursor-pointer text-primary-hover"
                    onClick={() => scrollToSection('open-access-section')}
                  >
                    Open Access
                  </span>
                )}
                {article.abstract && (
                  <span 
                    className="badge-info-blue text-xs fw-semibold px-2 py-0.5 rounded cursor-pointer text-primary-hover"
                    onClick={() => scrollToSection('abstract-section')}
                  >
                    Abstract
                  </span>
                )}
                {(article.topics?.length > 0 || article.keywords?.length > 0) && (
                  <span 
                    className="badge-info-yellow text-xs fw-semibold px-2 py-0.5 rounded cursor-pointer text-primary-hover"
                    onClick={() => scrollToSection('field-of-study-section')}
                  >
                    Field of Study
                  </span>
                )}
              </div>

              {/* External identifier badges (DOI, Open Access, links) */}
              <div className="lens-external-links-badges gap-3 flex-wrap mt-2">
                <span className="lens-ext-badge text-uppercase gray">
                  <Icon icon="lucide:file-text" className="me-1 text-dark" />
                  {article.publication_info || 'Journal Article'}
                </span>
                {article.is_open_access && (
                  <span className="lens-ext-badge text-uppercase" style={{ color: '#d97706', borderColor: '#fcd34d', backgroundColor: '#fef3c7' }}>
                    <Icon icon="lucide:lock-keyhole-open" className="me-1" />
                    Open Access
                  </span>
                )}
                <span className="lens-ext-badge">
                  <Icon icon="lucide:fingerprint" className="me-1" />
                  {Number.isFinite(Number(article.article_id)) 
                    ? `VN ${1000000 + Number(article.article_id)} A` 
                    : article.article_id}
                </span>
                <a 
                  href={article.doi ? `https://libkey.io/doi/${article.doi}` : articleDoiUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="lens-ext-badge gray"
                  style={{ textDecoration: 'none' }}
                >
                  <Icon icon="lucide:globe" className="me-1" />
                  LibKey
                </a>
                <a 
                  href={`https://www.worldcat.org/search?q=${encodeURIComponent(article.title)}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="lens-ext-badge gray"
                  style={{ textDecoration: 'none' }}
                >
                  <Icon icon="lucide:library" className="me-1" />
                  WorldCat
                </a>
              </div>
            </section>

            {/* Main navigation tabs: Summary | Citing Works | References | Collections */}
            <div className="lens-tab-bar">
              <Button 
                variant="link" 
                className={`lens-tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
                onClick={() => setActiveTab('summary')}
              >
                Summary
              </Button>
              <Button 
                variant="link" 
                className={`lens-tab-btn ${activeTab === 'citations' ? 'active' : ''}`}
                onClick={() => setActiveTab('citations')}
              >
                {article.citations ?? 0} Citing Works
              </Button>
              <Button 
                variant="link" 
                className={`lens-tab-btn ${activeTab === 'references' ? 'active' : ''}`}
                onClick={() => setActiveTab('references')}
              >
                {article.reference_count ?? 0} References
              </Button>
              <Button 
                variant="link" 
                className={`lens-tab-btn ${activeTab === 'collections' ? 'active' : ''}`}
                onClick={() => setActiveTab('collections')}
              >
                Collections
              </Button>
            </div>

            {/* Tab content area */}
            {activeTab === 'summary' ? (
              <div className="lens-summary-tab-content">
                
                {/* Action bar: Share, Add to Collection, Download Citation */}
                <div className="lens-actions-bar">
                  <Button variant="link" className="lens-action-btn" onClick={handleShareArticle}>
                    <Icon icon="lucide:share-2" />
                    <span>Share Article</span>
                  </Button>
                  <Button 
                    variant="link" 
                    className={`lens-action-btn ${isBookmarked ? 'active' : ''}`} 
                    onClick={handleBookmarkToggleClick}
                    disabled={isBookmarkLoading}
                  >
                    <Icon icon={isBookmarked ? 'lucide:bookmark-check' : 'lucide:bookmark-plus'} />
                    <span>{isBookmarked ? 'Added to Project' : 'Add to Collection'}</span>
                  </Button>
                  <Button variant="link" className="lens-action-btn" onClick={() => setShowCitationsModal(true)}>
                    <Icon icon="lucide:quote" />
                    <span>Download Citation</span>
                  </Button>
                </div>

                {/* Summary two-column grid */}
                <div className="lens-summary-grid">
                  
                  {/* Left pane: Abstract, Authors, Field of Study, Identifiers */}
                  <div className="lens-summary-left-pane">
                    
                    {/* TL;DR (AI summary) if available */}
                    {article.semantic_tldr && (
                      <div className="lens-section-block mb-4 p-3 rounded" style={{ backgroundColor: 'var(--primary-light)', borderLeft: '4px solid var(--primary)' }}>
                        <div className="d-flex align-items-center gap-2 mb-2 font-weight-bold" style={{ color: 'var(--primary)', fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                          <Icon icon="lucide:sparkles" width="16" />
                          <strong className="text-uppercase">TL;DR (AI TÃ³m táº¯t nhanh)</strong>
                        </div>
                        <p className="lens-section-text mb-0" style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-main)' }}>
                          {article.semantic_tldr}
                        </p>
                      </div>
                    )}

                    {/* Abstract */}
                    <div id="abstract-section" className="lens-section-block">
                      <h3 className="lens-section-title">Abstract</h3>
                      <p className="lens-section-text">
                        {article.abstract || 'No abstract is available for this article.'}
                      </p>
                    </div>

                    {/* Authors List & Affiliations */}
                    <div className="lens-section-block">
                      <h3 className="lens-section-title">Authors</h3>
                      <div className="lens-authors-detail-inline text-xs font-sans" style={{ lineHeight: '1.6' }}>
                        {article.authors && article.authors.length > 0 ? (
                          article.authors.map((author, index) => {
                            const name = author.display_name || author.name || 'TÃ¡c giáº£';
                            return (
                              <span key={index}>
                                <span 
                                  className="text-primary-hover cursor-pointer" 
                                  style={{ color: 'var(--primary)', fontWeight: 600 }}
                                  onClick={() => author.author_id && navigate(`/authors/${author.author_id}`)}
                                >
                                  {name}
                                </span>
                                {author.orcid && (
                                  <a href={author.orcid} target="_blank" rel="noreferrer" className="ms-1 align-middle">
                                    <Icon icon="simple-icons:orcid" className="text-success" width="13" />
                                  </a>
                                )}
                                {index < article.authors.length - 1 ? ' , ' : ''}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-muted-custom">Äang cáº­p nháº­t danh sÃ¡ch tÃ¡c giáº£...</span>
                        )}
                      </div>
                    </div>

                    {/* Field of Study */}
                    <div id="field-of-study-section" className="lens-section-block">
                      <h3 className="lens-section-title">Field of Study</h3>
                      <div className="lens-field-of-study-list text-xs" style={{ lineHeight: '1.8' }}>
                        {article.topics?.length > 0 ? (
                          article.topics.map((topic, index) => (
                            <span key={index}>
                              <span 
                                className="text-primary-hover cursor-pointer" 
                                style={{ color: 'var(--primary)', fontWeight: 500 }}
                                onClick={() => handleTopicClick(topic)}
                              >
                                {topic.display_name}
                              </span>
                              {index < article.topics.length - 1 ? ' , ' : ''}
                            </span>
                          ))
                        ) : article.keywords?.length > 0 ? (
                          article.keywords.map((kw, index) => (
                            <span key={index}>
                              <span 
                                className="text-primary-hover cursor-pointer" 
                                style={{ color: 'var(--primary)', fontWeight: 500 }}
                                onClick={() => handleKeywordClick(kw)}
                              >
                                {kw.display_name}
                              </span>
                              {index < article.keywords.length - 1 ? ' , ' : ''}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted-custom">Äang cáº­p nháº­t tá»« khÃ³a...</span>
                        )}
                      </div>
                    </div>

                    {/* Identifiers */}
                    <div className="lens-section-block">
                      <h3 className="lens-section-title">Identifiers</h3>
                      <div className="d-flex flex-wrap gap-2 text-xs">
                        <span className="lens-ext-badge gray">
                          <Icon icon="lucide:fingerprint" className="me-1 text-dark" />
                          {Number.isFinite(Number(article.article_id)) 
                            ? `VN ${1000000 + Number(article.article_id)} A` 
                            : article.article_id}
                        </span>
                        {article.doi && (
                          <a 
                            href={articleDoiUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="lens-ext-badge" 
                            style={{ color: '#d97706', borderColor: '#fcd34d', backgroundColor: '#fef3c7' }}
                          >
                            <Icon icon="lucide:award" className="me-1 text-warning" />
                            {article.doi}
                          </a>
                        )}
                        <span className="lens-ext-badge gray">
                          <Icon icon="lucide:database" className="me-1 text-dark" />
                          W{article.article_id}
                        </span>
                      </div>
                    </div>

                    {/* Links to other sources */}
                    {articleDoiUrl && (
                      <div className="lens-section-block">
                        <h3 className="lens-section-title">Links to other sources</h3>
                        <div className="d-flex flex-wrap gap-2 text-xs">
                          <a 
                            href={articleDoiUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="lens-ext-badge gray"
                            style={{ textDecoration: 'none' }}
                          >
                            <Icon icon="lucide:help-circle" className="me-1 text-muted" />
                            {(() => {
                              try {
                                return new URL(articleDoiUrl).hostname.replace('www.', '');
                              } catch {
                                return 'doi.org';
                              }
                            })()}
                          </a>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Right pane: metadata cards */}
                  <div className="lens-summary-right-pane">
                    
                    {/* Metadata Card 1 */}
                    <div className="lens-meta-card">
                      <table className="lens-meta-table">
                        <tbody>
                          <tr>
                            <th>In:</th>
                            <td>
                              <span className="text-primary-hover font-sans" onClick={() => article.journal_id && navigate(`/journals/${article.journal_id}`)}>
                                {article.journal_name || 'Äang cáº­p nháº­t'}
                              </span>
                              {article.volume_number ? `, Vol: ${article.volume_number}` : ''}
                              {article.issue_number ? `, Issue: ${article.issue_number}` : ''}
                            </td>
                          </tr>
                          <tr>
                            <th>Journal is Open Access:</th>
                            <td className="text-uppercase text-muted-custom fw-semibold">
                              {article.is_open_access ? 'true' : 'false'}
                            </td>
                          </tr>
                          <tr>
                            <th>Published:</th>
                            <td>{article.publication_year || 'â€”'}</td>
                          </tr>
                          <tr>
                            <th>E-Published:</th>
                            <td>{article.publication_year || 'â€”'}</td>
                          </tr>
                          <tr>
                            <th>Publication Info:</th>
                            <td>Journal Article</td>
                          </tr>
                          <tr>
                            <th>Published:</th>
                            <td>{article.publication_date || article.publication_year || 'â€”'}</td>
                          </tr>
                          <tr>
                            <th>E-Published:</th>
                            <td>{article.publication_date || article.publication_year || 'â€”'}</td>
                          </tr>
                          <tr>
                            <th>Publication Info:</th>
                            <td>{article.publication_info || 'Journal Article'}</td>
                          </tr>
                          <tr>
                            <th>Publisher:</th>
                            <td>{article.publisher_name || 'â€”'}</td>
                          </tr>
                          <tr>
                            <th>Source ISSN:</th>
                            <td className="font-monospace text-muted-custom">
                              {article.issn || 'â€”'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Metadata Card 2 (Open Access Badge info) */}
                    {article.is_open_access && (
                      <div id="open-access-section" className="lens-meta-card border-orange">
                        <div className="lens-oa-card-header text-dark">
                          <Icon icon="lucide:lock-keyhole-open" className="me-2" />
                          <span>Open Access</span>
                          <Icon icon="lucide:info" className="ms-auto text-muted-custom cursor-pointer" />
                        </div>
                        <div className="lens-oa-card-body">
                          <div className="mb-2">
                            <span className="text-muted-custom me-2">License:</span>
                            <strong>Unknown</strong>
                          </div>
                          {article.journal_name === 'ArXiv.org' ? (
                            <div className="d-flex flex-column gap-2 mt-2">
                              <div 
                                className="d-flex align-items-center gap-2 text-danger cursor-pointer text-xs fw-semibold"
                                onClick={() => article.source_url && window.open(article.source_url, '_blank', 'noopener,noreferrer')}
                                title="Open PDF / Abstract source"
                              >
                                <Icon icon="lucide:file-text" />
                                <span>arXiv</span>
                              </div>
                              <div 
                                className="d-flex align-items-center gap-2 text-danger cursor-pointer text-xs fw-semibold"
                                onClick={() => article.doi_url && window.open(article.doi_url, '_blank', 'noopener,noreferrer')}
                                title="Open DOI link"
                              >
                                <Icon icon="lucide:file-text" />
                                <span>arXiv</span>
                              </div>
                            </div>
                          ) : (
                            <div 
                              className="d-flex align-items-center gap-1 text-dark cursor-pointer text-xs fw-semibold"
                              onClick={() => (article.source_url || article.doi_url) && window.open(article.source_url || article.doi_url, '_blank', 'noopener,noreferrer')}
                            >
                              <Icon icon="lucide:external-link" />
                              <span>Repository Link</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </div>

                </div>

              </div>
            ) : activeTab === 'citations' ? (
              <div className="lens-citations-tab-content py-4">
                <div className="lens-modal-stat-box text-start p-3 mb-4 d-flex align-items-start gap-3 border-orange" style={{ background: 'var(--primary-light)', borderRadius: '8px', border: '1px solid var(--primary)' }}>
                  <Icon icon="lucide:sparkles" width="32" className="text-primary mt-1" />
                  <div>
                    <h5 className="font-display fw-bold mb-1" style={{ color: 'var(--text-main)' }}>
                      This work is cited {article.citations ?? 0} times by other scholarly works
                    </h5>
                    <p className="text-muted-custom mb-2 text-xs">
                      Please load these results as a full search in order to access filtering, sorting, annotations, collection management and more.
                    </p>
                    <Button variant="outline-primary" size="sm" className="lens-btn-refine" onClick={() => navigate(`/trending-vn?search=${encodeURIComponent(article.title)}`)}>
                      View works in Scholar Search
                    </Button>
                  </div>
                </div>

                {isRelatedLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm me-2" role="status" />
                    <span className="text-xs text-muted-custom">Loading citing works...</span>
                  </div>
                ) : citingWorks.length > 0 ? (
                  <div className="d-flex flex-column">
                    {citingWorks.map((item, idx) => renderRelatedArticleCard(item, idx))}
                  </div>
                ) : (
                  <div className="article-reference-card-empty text-center py-5">
                    ChÆ°a cÃ³ bÃ i bÃ¡o trÃ­ch dáº«n nÃ o Ä‘Æ°á»£c tÃ¬m tháº¥y.
                  </div>
                )}
              </div>
            ) : activeTab === 'references' ? (
              <div className="lens-references-tab-content py-4">
                <h4 className="font-display fw-bold mb-3">TÃ i liá»‡u tham kháº£o (References)</h4>
                <p className="text-muted-custom mb-4 text-sm">
                  BÃ i bÃ¡o hiá»‡n cÃ³ <strong>{(article.references || []).length}</strong> tÃ i liá»‡u tham kháº£o Ä‘Æ°á»£c Ä‘á»“ng bá»™ trong há»‡ thá»‘ng.
                </p>

                {(article.references || []).length > 0 ? (
                  <div className="d-grid gap-3">
                    {article.references.map((referenceUrl, index) => {
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
                              Má»Ÿ nguá»“n
                            </span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <div className="article-reference-card-empty text-center py-5">
                    ChÆ°a cÃ³ danh sÃ¡ch reference chi tiáº¿t cho bÃ i bÃ¡o nÃ y.
                  </div>
                )}
              </div>
            ) : activeTab === 'recommended' ? (
              <div className="lens-recommended-tab-content py-4">
                <div className="lens-modal-stat-box text-start p-3 mb-4 d-flex align-items-start gap-3 border-orange" style={{ background: 'var(--primary-light)', borderRadius: '8px', border: '1px solid var(--primary)' }}>
                  <Icon icon="lucide:sparkles" width="32" className="text-primary mt-1" />
                  <div>
                    <h5 className="font-display fw-bold mb-1" style={{ color: 'var(--text-main)' }}>
                      Recommended Work
                    </h5>
                    <p className="text-muted-custom mb-2 text-xs">
                      Discover other works you might be interested in, using citations, styling, authors and topic management and more.
                    </p>
                    <Button variant="outline-primary" size="sm" className="lens-btn-refine" onClick={() => navigate(`/trending-vn?search=${encodeURIComponent(article.primary_topic || '')}`)}>
                      View works in Scholar Search
                    </Button>
                  </div>
                </div>

                {isRelatedLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm me-2" role="status" />
                    <span className="text-xs text-muted-custom">Loading recommended works...</span>
                  </div>
                ) : recommendedArticles.length > 0 ? (
                  <div className="d-flex flex-column">
                    {recommendedArticles.map((item, idx) => renderRelatedArticleCard(item, idx))}
                  </div>
                ) : (
                  <div className="article-reference-card-empty text-center py-5">
                    ChÆ°a cÃ³ bÃ i bÃ¡o Ä‘á» xuáº¥t nÃ o Ä‘Æ°á»£c tÃ¬m tháº¥y.
                  </div>
                )}
              </div>
            ) : (
              <div className="lens-collections-tab-content py-4">
                <h4 className="font-display fw-bold mb-4">BÃ i bÃ¡o liÃªn quan / Äá» xuáº¥t</h4>
                <ArticlesTabContent
                  recentArticles={recommendedArticles}
                  loading={isRelatedLoading}
                  onArticleClick={(articleId) => navigate(`/trending/articles/${articleId}`)}
                />
              </div>
            )}

          </main>
      </div>

      {/* Citations detail and Export Citation modal */}
      <Modal show={showCitationsModal} onHide={() => setShowCitationsModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="font-display fw-bold">Citations & Citation Manager</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row g-4">
            {/* Left column: citation statistics */}
            <div className="col-12 col-md-5 border-end">
              <div className="lens-modal-stat-box">
                <div className="text-muted-custom text-xs fw-bold text-uppercase mb-1">Tá»•ng lÆ°á»£t trÃ­ch dáº«n</div>
                <div className="font-display fw-bold text-dark mb-2" style={{ fontSize: '2.5rem' }}>
                  {(article?.citations ?? 0).toLocaleString('en-US')}
                </div>
              </div>
              <p className="text-muted-custom mb-3 text-xs" style={{ lineHeight: 1.6 }}>
                Sá»‘ lÆ°á»£t trÃ­ch dáº«n (Citations) biá»ƒu thá»‹ sá»‘ lÆ°á»£ng bÃ i bÃ¡o, tÃ i liá»‡u há»c thuáº­t khÃ¡c Ä‘Ã£ sá»­ dá»¥ng nguá»“n hoáº·c trÃ­ch dáº«n láº¡i káº¿t quáº£ cá»§a cÃ´ng trÃ¬nh nghiÃªn cá»©u nÃ y.
              </p>
              <div className="text-xs text-muted-custom d-flex flex-column gap-2">
                <div><strong>DOI:</strong> MÃ£ Ä‘á»‹nh danh Ä‘á»‘i tÆ°á»£ng sá»‘ Ä‘á»‹nh danh bÃ i bÃ¡o cá»‘ Ä‘á»‹nh trá»±c tuyáº¿n.</div>
                <div><strong>References:</strong> Sá»‘ lÆ°á»£ng cÃ´ng trÃ¬nh nghiÃªn cá»©u Ä‘Æ°á»£c bÃ i bÃ¡o nÃ y trÃ­ch dáº«n láº¡i.</div>
              </div>
            </div>

            {/* Right column: export citation formats */}
            <div className="col-12 col-md-7">
              <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <Icon icon="lucide:download" className="text-primary" />
                <span>Export Citation (Táº£i trÃ­ch dáº«n)</span>
              </h6>
              
              {/* BibTeX */}
              <div className="mb-4">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-xs fw-bold font-monospace text-muted">BibTeX Format</span>
                  <div className="d-flex gap-2">
                    <Button 
                      variant="link" 
                      className="p-0 text-xs text-primary font-semibold text-decoration-none"
                      onClick={() => handleCopyCitationText(generateBibTeX(), 'BibTeX')}
                    >
                      <Icon icon="lucide:copy" className="me-1" /> Copy
                    </Button>
                    <Button 
                      variant="link" 
                      className="p-0 text-xs text-primary font-semibold text-decoration-none"
                      onClick={() => handleDownloadCitationFile(generateBibTeX(), `citation-${article?.article_id || '3233'}.bib`, 'application/x-bibtex')}
                    >
                      <Icon icon="lucide:download" className="me-1" /> Download .bib
                    </Button>
                  </div>
                </div>
                <textarea 
                  readOnly 
                  value={generateBibTeX()} 
                  className="form-control font-monospace text-xs bg-light border p-2" 
                  rows="5"
                  style={{ resize: 'none', fontSize: '0.72rem' }}
                />
              </div>

              {/* RIS */}
              <div>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-xs fw-bold font-monospace text-muted">RIS Format (EndNote / RefWorks)</span>
                  <div className="d-flex gap-2">
                    <Button 
                      variant="link" 
                      className="p-0 text-xs text-primary font-semibold text-decoration-none"
                      onClick={() => handleCopyCitationText(generateRIS(), 'RIS')}
                    >
                      <Icon icon="lucide:copy" className="me-1" /> Copy
                    </Button>
                    <Button 
                      variant="link" 
                      className="p-0 text-xs text-primary font-semibold text-decoration-none"
                      onClick={() => handleDownloadCitationFile(generateRIS(), `citation-${article?.article_id || '3233'}.ris`, 'application/x-research-info-systems')}
                    >
                      <Icon icon="lucide:download" className="me-1" /> Download .ris
                    </Button>
                  </div>
                </div>
                <textarea 
                  readOnly 
                  value={generateRIS()} 
                  className="form-control font-monospace text-xs bg-light border p-2" 
                  rows="5"
                  style={{ resize: 'none', fontSize: '0.72rem' }}
                />
              </div>

            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={() => setShowCitationsModal(false)}>
            ÄÃ³ng
          </Button>
        </Modal.Footer>
      </Modal>

      <AuthRequiredModal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
      />

      {/* Help Modal - Query Syntax Guide */}
      <Modal show={showHelpModal} onHide={() => setShowHelpModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2 font-display fw-bold">
            <Icon icon="lucide:help-circle" className="text-primary" />
            Query Syntax Help & Search Tips
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="font-sans">
          <h6 className="fw-bold mb-2" style={{ fontSize: '0.9rem' }}>Structured Query Fields</h6>
          <p className="text-muted-custom mb-3" style={{ fontSize: '0.78rem' }}>
            You can search our scientific database using fields and query prefixes. Below are standard search options:
          </p>
          <div className="table-responsive">
            <table className="table table-bordered table-striped text-xs mb-4">
              <thead className="bg-light">
                <tr>
                  <th style={{ width: '30%' }}>Field / Prefix</th>
                  <th style={{ width: '40%' }}>Example</th>
                  <th style={{ width: '30%' }}>Matches</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>title:</code></td>
                  <td><code>title:"deep learning"</code></td>
                  <td>Articles with "deep learning" in the title</td>
                </tr>
                <tr>
                  <td><code>author:</code></td>
                  <td><code>author:"Nguyen Van A"</code></td>
                  <td>Articles authored by Nguyen Van A</td>
                </tr>
                <tr>
                  <td><code>source.issn:</code></td>
                  <td><code>source.issn:"0251-4184"</code></td>
                  <td>Articles published under specified ISSN journal</td>
                </tr>
                <tr>
                  <td><code>doi:</code></td>
                  <td><code>doi:"10.1007/s40306"</code></td>
                  <td>Articles with specified DOI identifier</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h6 className="fw-bold mb-2" style={{ fontSize: '0.9rem' }}>Boolean Operators</h6>
          <p className="text-muted-custom mb-0" style={{ fontSize: '0.78rem' }}>
            Combine terms using operators like <code>AND</code>, <code>OR</code>, <code>NOT</code>, or group expressions with parentheses. E.g., <code>author:"Loi" AND title:"Regularity"</code>.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowHelpModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}






