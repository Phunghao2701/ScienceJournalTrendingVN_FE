/**
 * File source for the ResearchPulse FE system.
 * Lens-style scientific article detail page.
 *
 * File: trendingVN\pages\ArticleDetailPage.jsx
 */
import React, { useState, useCallback, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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
import { getArticlesListApi } from '../../article/api/articleApi';
import ScientificMathText from '../../../shared/components/ScientificMathText';
import { toScientificPlainText } from '../../../shared/utils/scientificMath';
import {
  buildArticleAuthorFilterPath,
  buildAuthorDetailPath,
} from '../../../app/routes/routePaths';

// Subcomponents
import ArticleDetailSkeleton from '../../article/components/ArticleDetailSkeleton';
import ArticleDetailEmpty from '../../article/components/ArticleDetailEmpty';
import ArticleDetailError from '../../article/components/ArticleDetailError';
import ArticlesTabContent from '../../journal/components/ArticlesTabContent';
import AuthRequiredModal from '../../../shared/components/AuthRequiredModal';

import '../trendingVN.css';



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
    citingWorksTotal,
    isCitingWorksError,
    citingWorksAnalytics,
    references,
    referencesTotal,
    isReferencesError,
    recommendedArticles,
    isCitingWorksLoading,
    isReferencesLoading,
    isRecommendedLoading,
    searchQuery,
    setSearchQuery,
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


  const renderRelatedArticleCard = (item, idx, onTitleClick) => {
    // For citing works, article_id belongs to the parent article, so use openalex_work_id or doi as unique key
    const itemKey = item.openalex_work_id || item.doi || item.article_id || idx;
    const isExpanded = expandedAbstracts[itemKey] || false;
    // Default title click: navigate to internal article page (only works if item has its own article_id distinct from citing context)
    const handleTitleClick = onTitleClick
      ? onTitleClick
      : () => navigate(`/trending/articles/${item.article_id}`);

    const relatedPublicationDate = item.publication_date || item.publication_year || null;
    const relatedPublicationParts = [
      item.volume_number ? <> <strong>Volume:</strong> {item.volume_number}</> : null,
      item.issue_number ? <> <strong>Issue:</strong> {item.issue_number}</> : null,
      item.pages ? <> <strong>Pages:</strong> {item.pages}</> : null,
      relatedPublicationDate,
    ].filter(Boolean);
    const renderRelatedAuthor = (author, authorIndex) => {
      const authorId = author.author_id || author.id;
      const authorName = author.display_name || author.name || 'Author';
      const separator = authorIndex < item.authors.length - 1 ? '; ' : '';

      if (!authorId) {
        return (
          <span key={`${authorName}-${authorIndex}`}>
            {authorName}{separator}
          </span>
        );
      }

      return (
        <Link
          key={authorId}
          to={buildAuthorDetailPath(authorId)}
          className="text-link"
          style={{ color: 'var(--primary)', textDecoration: 'underline' }}
          onClick={(event) => event.stopPropagation()}
          title={`View ${authorName} profile`}
        >
          {authorName}{separator}
        </Link>
      );
    };

    return (
      <div key={itemKey} className="lens-article-card p-3 mb-3">
        <div className="d-flex align-items-start gap-2">
          {/* Chevron/Expand Trigger */}
          <div 
            className="d-flex align-items-center justify-content-center cursor-pointer pt-1" 
            style={{ minWidth: '24px', color: 'var(--primary)' }}
            onClick={() => toggleAbstract(itemKey)}
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
              onClick={handleTitleClick}
            >
              <ScientificMathText title={toScientificPlainText(item.title)}>
                {item.title}
              </ScientificMathText>
            </div>

            <div className="lens-detail-line text-xs mt-1" style={{ color: 'var(--text-main)' }}>
              {item.publication_info && <strong>{item.publication_info}</strong>}
              {item.journal_name && (
                <>
                  {item.publication_info ? ' ' : ''}
                  <span
                    className="text-link"
                    style={{ color: 'var(--primary)', cursor: 'pointer' }}
                    onClick={() => navigateEntityFilter('journal_id', item.journal_id, item.journal_name)}
                  >
                    {item.journal_name}
                  </span>
                </>
              )}
              {relatedPublicationParts.length > 0 && (
                <>
                  {', '}
                  {relatedPublicationParts.map((part, partIndex) => (
                    <React.Fragment key={partIndex}>
                      {partIndex > 0 ? ', ' : ''}
                      {part}
                    </React.Fragment>
                  ))}
                </>
              )}
            </div>

            <div className="lens-detail-line text-xs mt-1" style={{ color: 'var(--text-main)' }}>
              <strong>Authors: </strong>
              {item.authors && item.authors.length > 0 ? (
                item.authors.map(renderRelatedAuthor)
              ) : (
                <span style={{ fontStyle: 'italic' }}>Any author</span>
              )}
            </div>

            <div className="lens-detail-line text-xs mt-1" style={{ color: 'var(--text-main)' }}>
              <strong>Citation Count:</strong>{' '}
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                {item.citations ?? item.citation_count ?? item.semantic_citation_count ?? 0}
              </span> | {' '}
              <strong>Reference Count:</strong> {item.reference_count ?? 0}
              {item.doi && (
                <>
                  {' | '}
                  <strong>DOI:</strong>{' '}
                  <span style={{ fontFamily: 'monospace', fontSize: '0.68rem' }}>{item.doi}</span>
                </>
              )}
            </div>

            <div className="lens-pill-row mt-2">
              {item.is_open_access && (
                <span className="lens-pill lens-pill-oa">
                  <Icon icon="lucide:lock-open" width="10" />
                  Open Access
                </span>
              )}
              <span className="lens-pill lens-pill-pending">
                <Icon icon="lucide:file-text" width="10" />
                Published
              </span>
              <span
                className="lens-pill lens-pill-abstract cursor-pointer"
                onClick={() => toggleAbstract(itemKey)}
              >
                <Icon icon="lucide:text" width="10" />
                Abstract
              </span>
            </div>

            {/* Detailed split-layout collapse block (Lens-style, matched with Tri's search layout) */}
            <Collapse in={isExpanded} key={itemKey}>
              <div className="lens-expanded-box mt-3 p-3 border rounded bg-white" style={{ borderColor: 'var(--border)' }}>
                <Row className="g-3">
                  {/* Left Column: Abstract, Article Notes, Publishers, Authors, Classifications */}
                  <Col md={8} className="expanded-left-col">
                    {/* 1. Abstract */}
                    <div className="expanded-section mb-3">
                      <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>Abstract</div>
                      <p className="text-muted text-xs text-justify" style={{ lineHeight: '1.5', margin: 0 }}>
                        {item.abstract || 'No abstract available'}
                      </p>
                    </div>

                    {/* 2. Article Notes */}
                    <div className="expanded-section mb-3">
                      <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>Article Notes</div>
                      <p className="text-muted text-xs mb-0" style={{ fontStyle: 'italic' }}>
                        No additional article section is available for this record.
                      </p>
                    </div>

                    {/* 3. Publishers & Classifications (Row layout) */}
                    <Row className="mb-3">
                      <Col sm={6}>
                        <div className="expanded-section">
                          <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>Publisher</div>
                          <button
                            type="button"
                            className="text-xs text-primary d-flex align-items-center gap-1 font-semibold"
                            style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', textAlign: 'left' }}
                            onClick={() => navigateEntityFilter('publisher_id', item.publisher_id, item.publisher_name || item.journal_name)}
                          >
                            <Icon icon="lucide:building-2" width="12" />
                            {item.publisher_name || item.journal_name || 'Any journal'}
                          </button>
                        </div>
                      </Col>
                      <Col sm={6}>
                        <div className="expanded-section">
                          <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1 d-flex align-items-center gap-1" style={{ letterSpacing: '0.5px' }}>
                            Topic
                            <Icon icon="lucide:info" width="12" style={{ color: '#ef6c00', cursor: 'pointer' }} />
                          </div>
                          <div className="text-xs">
                            <button
                              type="button"
                              className="badge bg-light text-dark border px-2 py-1 font-monospace"
                              style={{ background: 'none', cursor: 'pointer', fontSize: '0.68rem', fontWeight: 500 }}
                              onClick={() => navigateEntityFilter('topic_id', item.topic_id || item.primary_topic, item.primary_topic)}
                            >
                              {item.primary_topic || 'Any topic'}
                            </button>
                          </div>
                        </div>
                      </Col>
                    </Row>

                    {/* 4. Authors (Authors) */}
                    <div className="expanded-section">
                      <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>Authors</div>
                      <div className="d-flex flex-wrap gap-2">
                        {item.authors && item.authors.length > 0 ? (
                          item.authors.map((au, idx) => {
                            const authorId = au.author_id || au.id;
                            const authorName = au.display_name || au.name || 'Author';
                            const content = (
                              <>
                                <Icon icon="lucide:user" width="12" />
                                {authorName}
                                {au.last_known_institution && (
                                  <span className="text-muted font-normal" style={{ fontSize: '0.62rem' }}>
                                    ({au.last_known_institution})
                                  </span>
                                )}
                              </>
                            );

                            if (!authorId) {
                              return (
                                <span
                                  key={`${authorName}-${idx}`}
                                  className="text-xs text-muted d-flex align-items-center gap-1 border rounded px-2 py-1 bg-light"
                                >
                                  {content}
                                </span>
                              );
                            }

                            return (
                              <Link
                                key={authorId}
                                to={buildAuthorDetailPath(authorId)}
                                className="text-xs text-primary d-flex align-items-center gap-1 border rounded px-2 py-1 bg-light"
                                onClick={(event) => event.stopPropagation()}
                                title={`View ${authorName} profile`}
                              >
                                {content}
                              </Link>
                            );
                          })
                        ) : (
                          <span className="text-xs text-muted font-italic">Any author</span>
                        )}
                      </div>
                    </div>
                  </Col>

                  {/* Right Column: Document Preview, History */}
                  <Col md={4} className="expanded-right-col border-start ps-3">
                    {/* 1. Document Preview */}
                    <div className="expanded-section mb-3">
                      <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>Document Preview</div>
                      <div className="preview-container border rounded d-flex flex-column align-items-center justify-content-center bg-light p-4 text-center" style={{ minHeight: '160px' }}>
                        <Icon icon="lucide:alert-circle" className="text-danger mb-2" width="24" />
                        <span className="text-xs text-muted fw-bold">No image yet</span>
                      </div>
                    </div>

                    {/* 2. History */}
                    <div className="expanded-section">
                      <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>History</div>
                      <div className="history-timeline text-xs d-flex flex-column gap-2">
                        {(item.publication_date || item.publication_year) && (
                          <div className="history-item">
                            <div className="fw-semibold text-dark">
                              Publication: {item.publication_date || item.publication_year}
                            </div>
                          </div>
                        )}
                        {item.volume_number && (
                          <div className="history-item border-top pt-1.5">
                            <div className="fw-semibold text-dark">Volume: {item.volume_number}</div>
                          </div>
                        )}
                        {item.issue_number && (
                          <div className="history-item border-top pt-1.5">
                            <div className="fw-semibold text-dark">Issue: {item.issue_number}</div>
                          </div>
                        )}
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
      toast.success(isBookmarked ? 'Removed article from saved list' : 'Article saved successfully');
    } catch {
      toast.error('Error updating saved list');
    }
  };


  const handleShareArticle = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: article?.title || 'Article detail',
      text: `Explore this article: ${article?.title || ''}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Share dialog opened.');
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Article link copied.');
    } catch (err) {
      if (err?.name === 'AbortError') return;
      console.warn('Unable to share article:', err);
      toast.error('Cannot share article at this time.');
    }
  };

  const navigateEntityFilter = (paramName, idValue, fallbackText) => {
    const params = new URLSearchParams();
    if (idValue) {
      params.set(paramName, idValue);
    } else if (fallbackText) {
      params.set('search', fallbackText);
    }
    params.set('page', '1');
    navigate(`/articles?${params.toString()}`);
  };

  const handleKeywordClick = (keyword) => {
    const keywordId = keyword.keyword_id || keyword.id;
    const label = keyword.display_name || keyword.name || keyword.keyword;
    navigateEntityFilter('keyword_id', keywordId, label);
  };

  const generateBibTeX = useCallback(() => {
    if (!article) return '';
    const articleTitle = toScientificPlainText(article.title);
    const authorList = (article.authors || [])
      .map((a) => a.display_name || a.name || 'Author')
      .join(' and ');
    return `@article{article_${article.article_id || '3233'},
  title={${articleTitle}},
  author={${authorList}},
  journal={${article.journal_name || 'ArXiv.org'}},
  year={${article.publication_year || '2025'}},
  doi={${article.doi || ''}}
}`;
  }, [article]);

  const generateRIS = useCallback(() => {
    if (!article) return '';
    const articleTitle = toScientificPlainText(article.title);
    const authorList = (article.authors || [])
      .map((a) => `AU  - ${a.display_name || a.name || 'Author'}`)
      .join('\n');
    return `TY  - JOUR
T1  - ${articleTitle}
${authorList}
JO  - ${article.journal_name || 'ArXiv.org'}
PY  - ${article.publication_year || '2025'}
DO  - ${article.doi || ''}
ER  - `;
  }, [article]);

  const handleCopyCitationText = async (text, formatName) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied ${formatName} citation!`);
    } catch (err) {
      console.warn('Unable to copy citation:', err);
      toast.error('Cannot copy citation.');
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
      toast.success(`Downloaded ${filename}!`);
    } catch (err) {
      console.warn('Unable to download citation:', err);
      toast.error('Cannot download citation file.');
    }
  };

  const handleTopicClick = (topic) => {
    const topicId = topic?.topic_id || topic?.id;
    const label = topic?.display_name || topic?.name || '';
    navigateEntityFilter('topic_id', topicId, label);
  };

  const normalizeDoiForCompare = (doi = '') => doi.toLowerCase().replace(/^https?:\/\/(dx\.)?doi\.org\//, '').trim();

  // Related API items can carry the parent article_id, so resolve by DOI/title before opening detail.
  const handleRelatedArticleTitleClick = async (item) => {
    const currentArticleId = String(article?.article_id || id || '');
    const directArticleId = item?.target_article_id || item?.related_article_id || item?.citing_article_id || item?.cited_article_id;

    if (directArticleId && String(directArticleId) !== currentArticleId) {
      navigate(`/trending/articles/${directArticleId}`);
      return;
    }

    const rawSearchTerm = item?.doi || item?.title;
    if (!rawSearchTerm) return;

    const searchTerm = item?.doi ? normalizeDoiForCompare(item.doi) : rawSearchTerm;

    try {
      const response = await getArticlesListApi({ search: searchTerm, limit: 5 });
      const payload = response.data?.data || response.data || {};
      const candidates = payload.items || payload.articles || [];
      const itemDoi = normalizeDoiForCompare(item?.doi);
      const itemTitle = (item?.title || '').trim().toLowerCase();
      const matchedArticle = candidates.find((candidate) => {
        const candidateId = String(candidate.article_id || '');
        if (!candidateId || candidateId === currentArticleId) return false;

        const candidateDoi = normalizeDoiForCompare(candidate.doi);
        const candidateTitle = (candidate.title || '').trim().toLowerCase();

        return (itemDoi && candidateDoi === itemDoi) || (itemTitle && candidateTitle === itemTitle);
      });

      if (matchedArticle?.article_id) {
        navigate(`/trending/articles/${matchedArticle.article_id}`);
        return;
      }
    } catch (resolveError) {
      console.warn('Unable to resolve related article detail route:', resolveError);
    }

    navigate(`/trending-vn?search=${encodeURIComponent(searchTerm)}`);
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

  const citationMetric = article.citation_count ?? article.citations ?? 0;
  const referenceMetric = article.reference_count ?? 0;
  const citingWorksRelationTotal = citingWorksTotal ?? article.citing_works_count ?? 0;
  const availableReferencesTotal = referencesTotal ?? article.available_references_count ?? 0;
  const publicationLabel = article.publication_date
    ? ['Published', article.publication_date]
    : article.publication_year
      ? ['Publication Year', article.publication_year]
      : null;
  const publicationMetadataRows = [
    article.journal_name ? ['Journal', article.journal_name, 'journal'] : null,
    article.publisher_name ? ['Publisher', article.publisher_name, 'publisher'] : null,
    article.volume_number ? ['Volume', article.volume_number] : null,
    article.issue_number ? ['Issue', article.issue_number] : null,
    publicationLabel,
    article.publication_info ? ['Publication Info', article.publication_info] : null,
    article.issn ? ['ISSN', article.issn] : null,
    article.doi ? ['DOI', article.doi] : null,
  ].filter(Boolean);
  const articleInstitutions = article.institutions?.length
    ? article.institutions
    : Array.from(new Map(
      (article.authors || [])
        .flatMap((author) => author.institutions || [])
        .map((institution) => [
          institution.institution_id || institution.id || institution.display_name,
          institution,
        ])
    ).values());
  const institutionIndexById = new Map(
    articleInstitutions.map((institution, index) => [
      String(institution.institution_id || institution.id || institution.display_name),
      index + 1,
    ])
  );
  const citingYearDistribution = citingWorksAnalytics?.yearDistribution || [];
  const maxCitingYearCount = Math.max(
    ...citingYearDistribution.map((item) => Number(item.count || 0)),
    1
  );

  return (
    <div className="article-detail-page-wrapper grid-bg">
      <Header />

      {/* Lens-style query search bar */}
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
          </div>

          {/* Right Side */}
          <div className="lens-top-search-right d-flex align-items-center">
            <div className="lens-search-bar-wrapper d-flex align-items-stretch">
              <div className="position-relative d-flex align-items-center" style={{ width: '400px' }}>
                <Form.Control
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                    toast.info("Scholarly search is active in this edition.");
                    navigate('/articles');
                  }}>New Scholarly Search</Dropdown.Item>
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
                    { key: 'applicants', label: t('sbPublishers') || 'Publishers', icon: 'lucide:user-check', action: () => navigate('/journals') },
                    { key: 'inventors', label: t('sbAuthors') || 'Authors', icon: 'lucide:users', action: () => navigate('/authors') },
                    { key: 'topics', label: 'Topics', icon: 'lucide:tags', action: () => navigate('/articles') },
                    { key: 'legalStatus', label: t('sbLegalStatus') || 'Access Status', icon: 'lucide:scale', action: () => navigate('/articles') },
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
        <main className="lens-main-content w-100 p-0">
            
            {/* Breadcrumb */}
            <div className="lens-breadcrumb">
              <span className="lens-breadcrumb-link" onClick={() => navigate('/articles')}>Articles</span>
              <Icon icon="lucide:chevron-right" width="12" />
              <span className="lens-breadcrumb-current">Article Details</span>
            </div>

            {/* Title and core metadata */}
            <section className="lens-article-header-section">
              <h1 className="lens-article-title">
                <ScientificMathText title={toScientificPlainText(article.title)}>
                  {article.title}
                </ScientificMathText>
              </h1>

              {/* Secondary metadata */}
              <div className="lens-meta-line flex-wrap gap-2">
                {article.publication_info && (
                  <span className="lens-badge-type">
                    <Icon icon="lucide:file-text" className="me-1" />
                    {article.publication_info}
                  </span>
                )}
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
                            navigateEntityFilter('journal_id', article.journal_id, article.journal_name || 'ArXiv.org');
                          } else {
                            navigateEntityFilter('journal_id', null, article.journal_name || 'ArXiv.org');
                          }
                        }}
                      >
                        {article.journal_name || 'ArXiv.org'}
                      </span>
                      {publicationLabel ? `, ${publicationLabel[1]}` : ''}
                    </>
                  ) : (
                    <>
                      <strong>Journal:</strong>{' '}
                      <span 
                        className="text-primary-hover cursor-pointer font-semibold" 
                        onClick={() => {
                          if (article.journal_id) {
                            navigateEntityFilter('journal_id', article.journal_id, article.journal_name);
                          } else {
                            navigateEntityFilter('journal_id', null, article.journal_name || 'Updating');
                          }
                        }}
                      >
                        {article.journal_name || 'Updating'}
                      </span>
                      {article.volume_number ? <><strong>, Vol:</strong> {article.volume_number}</> : null}
                      {article.issue_number ? <><strong>, Issue:</strong> {article.issue_number}</> : null}
                      {publicationLabel ? <><strong>, {publicationLabel[0]}:</strong> {publicationLabel[1]}</> : null}
                    </>
                  )}
                </span>
              </div>

              {/* Authors */}
              <div className="lens-authors-line">
                <strong>Authors:</strong>{' '}
                {visibleAuthors.length > 0 ? (
                  visibleAuthors.map((author, index) => {
                    const name = author.display_name || author.name || 'Author';
                    const affiliations = (author.institutions || [])
                      .map((institution) => institutionIndexById.get(String(institution.institution_id || institution.id || institution.display_name)))
                      .filter(Boolean);
                    return (
                      <span key={index}>
                        {author.author_id || author.id ? (
                          <Link
                            to={buildAuthorDetailPath(author.author_id || author.id)}
                            className="lens-author-link p-0"
                            title={`View ${name} profile`}
                          >
                            {name}
                            {affiliations.length > 0 && (
                              <sup className="ms-1">{affiliations.join(',')}</sup>
                            )}
                          </Link>
                        ) : (
                          <span className="lens-author-link p-0">
                            {name}
                            {affiliations.length > 0 && (
                              <sup className="ms-1">{affiliations.join(',')}</sup>
                            )}
                          </span>
                        )}
                        {index < visibleAuthors.length - 1 ? ', ' : ''}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-muted-custom">Authors are being updated</span>
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

              {visibleAuthors.some((author) => author.author_id || author.id) && (
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {visibleAuthors.map((author, index) => {
                    const authorId = author.author_id || author.id;
                    if (!authorId) return null;
                    const name = author.display_name || author.name || 'Author';
                    return (
                      <Link
                        key={`author-filter-${authorId}-${index}`}
                        to={buildArticleAuthorFilterPath(authorId)}
                        className="lens-pill lens-pill-abstract"
                        title={`Filter articles by ${name}`}
                      >
                        <Icon icon="lucide:filter" width="10" />
                        View articles by {name}
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Count metrics */}
              <div className="lens-stats-plain-line text-xs font-sans mt-2 mb-2 d-flex flex-wrap gap-4">
                <span className="pointer" onClick={() => setShowCitationsModal(true)}>
                  Citation Count: <strong className="text-dark">{citationMetric}</strong>
                </span>
                <span>
                  Reference Count: <strong className="text-dark">{referenceMetric}</strong>
                </span>
              </div>

              {/* Additional information badges */}
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
                    Keyword
                  </span>
                )}
              </div>

              {/* Identifiers and links */}
              <div className="lens-external-links-badges gap-3 flex-wrap mt-2">
                {article.publication_info && (
                  <span className="lens-ext-badge text-uppercase gray">
                    <Icon icon="lucide:file-text" className="me-1 text-dark" />
                    {article.publication_info}
                  </span>
                )}
                {article.is_open_access && (
                  <span className="lens-ext-badge text-uppercase" style={{ color: '#d97706', borderColor: '#fcd34d', backgroundColor: '#fef3c7' }}>
                    <Icon icon="lucide:lock-keyhole-open" className="me-1" />
                    Open Access
                  </span>
                )}
              </div>
            </section>

            {/* Main tabs */}
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
                Citing Works ({citingWorksRelationTotal})
              </Button>
              <Button 
                variant="link" 
                className={`lens-tab-btn ${activeTab === 'references' ? 'active' : ''}`}
                onClick={() => setActiveTab('references')}
              >
                Available References ({availableReferencesTotal})
              </Button>
              <Button 
                variant="link" 
                className={`lens-tab-btn ${activeTab === 'recommended' ? 'active' : ''}`}
                onClick={() => setActiveTab('recommended')}
              >
                Recommended
              </Button>
            </div>

            {/* Tab content */}
            {activeTab === 'summary' ? (
              <div className="lens-summary-tab-content">
                
                {/* Action bar */}
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

                {/* Summary grid */}
                <div className="lens-summary-grid">
                  
                  {/* Summary left pane */}
                  <div className="lens-summary-left-pane">
                    
                    {/* TL;DR (AI summary) if available */}
                    {article.semantic_tldr && (
                      <div className="lens-section-block mb-4 p-3 rounded" style={{ backgroundColor: 'var(--primary-light)', borderLeft: '4px solid var(--primary)' }}>
                        <div className="d-flex align-items-center gap-2 mb-2 font-weight-bold" style={{ color: 'var(--primary)', fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                          <Icon icon="lucide:sparkles" width="16" />
                          <strong className="text-uppercase">TL;DR</strong>
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
                            const name = author.display_name || author.name || 'Author';
                            const affiliations = (author.institutions || [])
                              .map((institution) => institutionIndexById.get(String(institution.institution_id || institution.id || institution.display_name)))
                              .filter(Boolean);
                            return (
                              <span key={index}>
                                {author.author_id || author.id ? (
                                  <Link
                                    to={buildAuthorDetailPath(author.author_id || author.id)}
                                    className="text-primary-hover"
                                    style={{ color: 'var(--primary)', fontWeight: 600 }}
                                    title={`View ${name} profile`}
                                  >
                                    {name}
                                    {affiliations.length > 0 && (
                                      <sup className="ms-1">{affiliations.join(',')}</sup>
                                    )}
                                  </Link>
                                ) : (
                                  <span style={{ fontWeight: 600 }}>
                                    {name}
                                    {affiliations.length > 0 && (
                                      <sup className="ms-1">{affiliations.join(',')}</sup>
                                    )}
                                  </span>
                                )}
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
                          <span className="text-muted-custom">Author list is being updated...</span>
                        )}
                      </div>
                    </div>

                    {articleInstitutions.length > 0 && (
                      <div className="lens-section-block">
                        <h3 className="lens-section-title">Institutions</h3>
                        <ol className="text-xs mb-0 ps-3" style={{ lineHeight: '1.7' }}>
                          {articleInstitutions.map((institution, index) => (
                            <li key={institution.institution_id || institution.id || institution.display_name || index}>
                              {institution.display_name || institution.name}
                              {institution.country_code ? (
                                <span className="text-muted-custom"> ({institution.country_code})</span>
                              ) : null}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Keyword */}
                    <div id="field-of-study-section" className="lens-section-block">
                      <h3 className="lens-section-title">Keyword</h3>
                      <div className="lens-field-of-study-list text-xs" style={{ lineHeight: '1.8' }}>
                        {article.keywords?.length > 0 ? (
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
                          <span className="text-muted-custom">Keywords are being updated...</span>
                        )}
                      </div>
                    </div>

                    {/* Topic */}
                    <div className="lens-section-block">
                      <h3 className="lens-section-title">Topic</h3>
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
                        ) : (
                          <span className="text-muted-custom">Topics are being updated...</span>
                        )}
                      </div>
                    </div>

                    {/* Identifiers */}
                    <div className="lens-section-block">
                      <h3 className="lens-section-title">Identifiers</h3>
                      <div className="d-flex flex-wrap gap-2 text-xs">

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
                          ResearchPulse ID: {article.article_id}
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

                  {/* Summary right pane */}
                  <div className="lens-summary-right-pane">
                    {citingYearDistribution.length > 0 && (
                      <div className="lens-meta-card">
                        <div className="lens-section-title mb-3">Citing Scholarly Works</div>
                        <div className="d-flex align-items-end gap-2" style={{ minHeight: '130px' }}>
                          {citingYearDistribution.map((item) => {
                            const count = Number(item.count || 0);
                            const height = Math.max(8, Math.round((count / maxCitingYearCount) * 100));
                            const yearLabel = item.year ?? 'Unknown';
                            return (
                              <button
                                key={yearLabel}
                                type="button"
                                className="p-0 border-0 bg-transparent d-flex flex-column align-items-center flex-fill"
                                title={`${yearLabel}: ${count} citing works`}
                              >
                                <span
                                  style={{
                                    width: '100%',
                                    maxWidth: '28px',
                                    height: `${height}px`,
                                    background: 'var(--primary)',
                                    display: 'block',
                                  }}
                                />
                                <span className="text-muted-custom mt-1" style={{ fontSize: '0.62rem' }}>
                                  {yearLabel}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        <div className="text-xs text-muted-custom mt-2">
                          Total citing works: {citingWorksAnalytics?.total ?? citingWorksRelationTotal}
                        </div>
                      </div>
                    )}
                    
                    {/* Metadata Card 1 */}
                    <div className="lens-meta-card">
                      <table className="lens-meta-table">
                        <tbody>
                          {publicationMetadataRows.map(([label, value, entityType]) => (
                            <tr key={label}>
                              <th>{label}:</th>
                              <td className={label === 'DOI' || label === 'ISSN' ? 'font-monospace text-muted-custom' : undefined}>
                                {entityType === 'journal' ? (
                                  <Button
                                    variant="link"
                                    className="p-0 text-start"
                                    disabled={!article.journal_id && !article.journal_name}
                                    onClick={() => navigateEntityFilter('journal_id', article.journal_id, article.journal_name)}
                                  >
                                    {value}
                                  </Button>
                                ) : entityType === 'publisher' ? (
                                  <Button
                                    variant="link"
                                    className="p-0 text-start"
                                    disabled={!article.publisher_id && !article.publisher_name}
                                    onClick={() => navigateEntityFilter('publisher_id', article.publisher_id, article.publisher_name)}
                                  >
                                    {value}
                                  </Button>
                                ) : value}
                              </td>
                            </tr>
                          ))}
                          <tr>
                            <th>Open Access:</th>
                            <td className="text-uppercase text-muted-custom fw-semibold">
                              {article.is_open_access ? 'true' : 'false'}
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
                          <div className="mb-2 text-xs text-muted-custom">
                            This record is marked as open access by the source data.
                          </div>
                          {(article.source_url || article.doi_url) && (
                            <a
                              className="d-flex align-items-center gap-1 text-dark text-xs fw-semibold"
                              href={article.source_url || article.doi_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Icon icon="lucide:external-link" />
                              <span>Open sourced link</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                  </div>

                </div>

              </div>
            ) : activeTab === 'citations' ? (
              <div className="lens-citations-tab-content py-4">
                <div className="lens-modal-stat-box text-start p-3 mb-4 d-flex align-items-start gap-3" style={{ background: 'var(--primary-light)', borderRadius: '8px', border: '1px solid var(--primary)' }}>
                  <Icon icon="lucide:quote" width="32" className="text-primary mt-1" />
                  <div>
                    <h5 className="font-display fw-bold mb-1" style={{ color: 'var(--text-main)' }}>
                      {citingWorksRelationTotal} citing works are available
                    </h5>
                    <p className="text-muted-custom mb-2 text-xs">
                      Scientific articles that cite this work. Select a title to open the source article.
                      {isCitingWorksError ? ' The relation list could not be refreshed, so the detail count is shown.' : ''}
                    </p>
                    <Button variant="outline-primary" size="sm" className="lens-btn-refine" onClick={() => navigate(`/trending-vn?search=${encodeURIComponent(toScientificPlainText(article.title))}`)}>
                      Find related works
                    </Button>
                  </div>
                </div>

                {isCitingWorksLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm me-2" role="status" />
                    <span className="text-xs text-muted-custom">Loading citing works...</span>
                  </div>
                ) : citingWorks.length > 0 ? (
                  <div className="d-flex flex-column">
                    {citingWorks.map((item, idx) => renderRelatedArticleCard(
                      item,
                      idx,
                      () => handleRelatedArticleTitleClick(item)
                    ))}
                  </div>
                ) : (
                  <div className="article-reference-card-empty text-center py-5">
                    No citing articles were found.
                  </div>
                )}
              </div>
            ) : activeTab === 'references' ? (
              <div className="lens-references-tab-content py-4">
                <div className="lens-modal-stat-box text-start p-3 mb-4 d-flex align-items-start gap-3" style={{ background: 'var(--primary-light)', borderRadius: '8px', border: '1px solid var(--primary)' }}>
                  <Icon icon="lucide:book-open" width="32" className="text-primary mt-1" />
                  <div>
                    <h5 className="font-display fw-bold mb-1" style={{ color: 'var(--text-main)' }}>
                      {availableReferencesTotal} available references
                    </h5>
                    <p className="text-muted-custom mb-2 text-xs">
                      Research works cited by this article. Select a title to open the source record.
                      {isReferencesError ? ' The reference list could not be refreshed, so the detail count is shown.' : ''}
                    </p>
                    <Button variant="outline-primary" size="sm" className="lens-btn-refine" onClick={() => navigate(`/trending-vn?search=${encodeURIComponent(toScientificPlainText(article.title))}`)}>
                      Find related works
                    </Button>
                  </div>
                </div>

                {isReferencesLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm me-2" role="status" />
                    <span className="text-xs text-muted-custom">Loading references...</span>
                  </div>
                ) : (references || []).length > 0 ? (
                  <div className="d-flex flex-column">
                    {(references || []).map((ref, index) => renderRelatedArticleCard(
                      ref,
                      index,
                      () => handleRelatedArticleTitleClick(ref)
                    ))}
                  </div>
                ) : (
                  <div className="article-reference-card-empty text-center py-5">
                    This article does not have detailed references yet.
                  </div>
                )}
              </div>
            ) : activeTab === 'recommended' ? (
              <div className="lens-recommended-tab-content py-4">
                <div className="lens-modal-stat-box text-start p-3 mb-4 d-flex align-items-start gap-3" style={{ background: 'var(--primary-light)', borderRadius: '8px', border: '1px solid var(--primary)' }}>
                  <Icon icon="lucide:lightbulb" width="32" className="text-primary mt-1" />
                  <div>
                    <h5 className="font-display fw-bold mb-1" style={{ color: 'var(--text-main)' }}>
                      Recommended articles
                    </h5>
                    <p className="text-muted-custom mb-2 text-xs">
                      Related research works you may be interested in, based on this article's topic and field.
                    </p>
                    <Button variant="outline-primary" size="sm" className="lens-btn-refine" onClick={() => navigate(`/trending-vn?search=${encodeURIComponent(article.primary_topic || '')}`)}>
                      View more in Scholar Search
                    </Button>
                  </div>
                </div>

                {isRecommendedLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm me-2" role="status" />
                    <span className="text-xs text-muted-custom">Loading recommended articles...</span>
                  </div>
                ) : recommendedArticles.length > 0 ? (
                  <div className="d-flex flex-column">
                    {recommendedArticles.map((item, idx) => renderRelatedArticleCard(item, idx))}
                  </div>
                ) : (
                  <div className="article-reference-card-empty text-center py-5">
                    No recommended articles were found.
                  </div>
                )}
              </div>
            ) : (
              <div className="lens-collections-tab-content py-4">
                <h4 className="font-display fw-bold mb-4">Related / Recommended Articles</h4>
                <ArticlesTabContent
                  recentArticles={recommendedArticles}
                  loading={isRecommendedLoading}
                  emptyMessage="This article does not have any related recommendations in the system yet."
                  onArticleClick={(articleId) => navigate(`/trending/articles/${articleId}`)}
                />
              </div>
            )}

          </main>
      </div>

      {/* Citation export modal */}
      <Modal show={showCitationsModal} onHide={() => setShowCitationsModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="font-display fw-bold">Citation Count & Citation Manager</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row g-4">
            {/* Citation information */}
            <div className="col-12 col-md-5 border-end">
              <div className="lens-modal-stat-box">
                <div className="text-muted-custom text-xs fw-bold text-uppercase mb-1">Citation Count</div>
                <div className="font-display fw-bold text-dark mb-2" style={{ fontSize: '2.5rem' }}>
                  {Number(article?.citation_count ?? article?.citations ?? 0).toLocaleString('en-US')}
                </div>
              </div>
              <p className="text-muted-custom mb-3 text-xs" style={{ lineHeight: 1.6 }}>
                Citations indicate how many scholarly articles or academic works have cited this research output.
              </p>
              <div className="text-xs text-muted-custom d-flex flex-column gap-2">
                <div><strong>DOI:</strong> A persistent digital object identifier for the online article.</div>
                <div><strong>References:</strong> The number of research works cited by this article.</div>
              </div>
            </div>

            {/* Citation export */}
            <div className="col-12 col-md-7">
              <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <Icon icon="lucide:download" className="text-primary" />
                <span>Export Citation</span>
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
            Close
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






