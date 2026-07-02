/**
 * File source for the ResearchPulse FE system.
 * Lens-style scientific article detail page.
 *
 * File: trendingVN\pages\ArticleDetailPage.jsx
 */
import React, { useState, useCallback, useMemo } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
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
  const returnToResults = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const encodedReturnTo = params.get('returnTo');
    if (location.state?.fromTrendingResults) return location.state.fromTrendingResults;
    if (encodedReturnTo) return encodedReturnTo;
    return '/trending-vn';
  }, [location.search, location.state]);

  const returnContext = useMemo(() => {
    const queryIndex = returnToResults.indexOf('?');
    if (queryIndex < 0) {
      return { query: '', filterCount: 0, page: '1' };
    }

    const params = new URLSearchParams(returnToResults.slice(queryIndex));
    const filterKeys = ['search', 'year', 'journal', 'journal_id', 'publisher_id', 'author_id', 'topic', 'topic_id', 'keyword_id', 'access'];
    const filterCount = filterKeys.filter((key) => {
      const value = params.get(key);
      return value && value !== 'all';
    }).length;

    return {
      query: params.get('search') || location.state?.query || '',
      filterCount,
      page: params.get('page') || '1',
    };
  }, [location.state, returnToResults]);

  const handleBackToResults = () => {
    navigate(returnToResults);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/trending-vn?search=${encodeURIComponent(searchQuery.trim())}`);
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
      <div key={itemKey} className="tvn-article-card p-3 mb-3">
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
              className="tvn-article-title text-primary-hover fw-bold font-sans"
              style={{ fontSize: '1.05rem', cursor: 'pointer', color: 'var(--text-main)' }}
              onClick={handleTitleClick}
            >
              <ScientificMathText title={toScientificPlainText(item.title)}>
                {item.title}
              </ScientificMathText>
            </div>

            <div className="tvn-detail-line text-xs mt-1" style={{ color: 'var(--text-main)' }}>
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

            <div className="tvn-detail-line text-xs mt-1" style={{ color: 'var(--text-main)' }}>
              <strong>Authors: </strong>
              {item.authors && item.authors.length > 0 ? (
                item.authors.map(renderRelatedAuthor)
              ) : (
                <span style={{ fontStyle: 'italic' }}>Any author</span>
              )}
            </div>

            <div className="tvn-detail-line text-xs mt-1" style={{ color: 'var(--text-main)' }}>
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

            <div className="tvn-pill-row mt-2">
              {item.is_open_access && (
                <span className="tvn-pill tvn-pill-oa">
                  <Icon icon="lucide:lock-open" width="10" />
                  Open Access
                </span>
              )}
              <span className="tvn-pill tvn-pill-pending">
                <Icon icon="lucide:file-text" width="10" />
                Published
              </span>
              <span
                className="tvn-pill tvn-pill-abstract cursor-pointer"
                onClick={() => toggleAbstract(itemKey)}
              >
                <Icon icon="lucide:text" width="10" />
                Abstract
              </span>
            </div>

            {/* Detailed split-layout collapse block (Lens-style, matched with Tri's search layout) */}
            <Collapse in={isExpanded} key={itemKey}>
              <div className="tvn-expanded-box mt-3 p-3 border rounded bg-white" style={{ borderColor: 'var(--border)' }}>
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
      if (paramName === 'institution_id' && fallbackText) {
        params.set('institution_name', fallbackText);
      }
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

  const handleInstitutionClick = (institution) => {
    const instId = institution.institution_id || institution.id;
    const label = institution.display_name || institution.name || '';
    navigateEntityFilter('institution_id', instId, label);
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
  const rawOpenAlex = article?.openalex_id || article?.work_id || article?.openalex_work_id || article?.openalex || article?.openalex_url;
  const openAlexUrl = rawOpenAlex
    ? rawOpenAlex.startsWith('http')
      ? rawOpenAlex
      : `https://openalex.org/${rawOpenAlex}`
    : null;
  const openAlexDisplayId = rawOpenAlex
    ? rawOpenAlex.replace(/^https?:\/\/openalex\.org\//i, '')
    : null;
  const pdfUrl = article?.pdf_url || article?.pdf_link || article?.pdf || article?.url_pdf || article?.pdf_download_url || article?.oa_pdf_url || article?.best_oa_location_pdf_url;

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
  const citingWorksRelationTotal = citingWorksTotal ?? article.citing_works_count ?? citingWorks?.length ?? 0;
  const availableReferencesTotal = referencesTotal ?? article.available_references_count ?? article.reference_count ?? references?.length ?? 0;
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
    <div className="article-detail-page-wrapper">
      <Header />

      {/* Lens-style query search bar */}
      <section className="tvn-top-search-section">
        <div className="tvn-search-container-fluid d-flex align-items-center justify-content-between flex-wrap gap-3">
          {/* Left Side */}
          <div className="tvn-top-search-left d-flex align-items-center gap-1">
            <Button 
              variant="link" 
              className="tvn-home-btn p-1 d-flex align-items-center justify-content-center"
              onClick={() => navigate('/')}
              title="Home"
            >
              <Icon icon="lucide:home" width="18" height="18" />
            </Button>
            <Icon icon="lucide:chevron-left" width="14" className="text-muted" />
            <div 
              className="tvn-results-count font-sans text-xs cursor-pointer d-flex align-items-center gap-1"
              onClick={handleSearchSubmit}
              title="Click to run this search query"
              style={{ cursor: 'pointer' }}
            >
              <span className="fw-semibold">{location.state?.resultCount ?? scholarlyResultsCount} Scholarly Results</span>
            </div>
            {(article?.display_id || article?.id || id) && (
              <div className="d-flex align-items-center ms-1 gap-1 text-muted">
                <Icon icon="lucide:chevron-left" width="14" />
                <span className="tvn-active-id-badge">{article?.display_id || article?.id || id}</span>
              </div>
            )}
          </div>

          {/* Right Side */}
          <div className="tvn-top-search-right d-flex align-items-center">
            <div className="tvn-search-bar-wrapper d-flex align-items-stretch">
              <div className="position-relative d-flex align-items-center" style={{ width: '400px' }}>
                <Form.Control
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search database..."
                  className="tvn-search-input-field"
                />
                <span 
                  className="tvn-search-help-trigger" 
                  onClick={() => setShowHelpModal(true)}
                  title="Search query syntax help"
                  style={{ cursor: 'pointer' }}
                >
                  <Icon icon="lucide:help-circle" width="16" height="16" />
                </span>
              </div>
              <Dropdown as={ButtonGroup} className="tvn-search-split-dropdown">
                <Button className="tvn-btn-search-submit" onClick={handleSearchSubmit}>Search</Button>
                <Dropdown.Toggle split className="tvn-btn-search-toggle" />
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
      <div className="tvn-layout-wrapper">
        {/* ==================== MAIN CONTENT AREA ==================== */}
        <main className="tvn-main-content w-100 p-4">
            
            {/* Title and core metadata card */}
            <section className="tvn-article-header-section">
              <div className="d-flex justify-content-between align-items-start gap-4 flex-wrap flex-md-nowrap">
                {/* Left Column: Details */}
                <div className="flex-grow-1 min-w-0">
                  <h1 className="tvn-article-title">
                    <ScientificMathText title={toScientificPlainText(article.title)}>
                      {article.title}
                    </ScientificMathText>
                  </h1>

                  {/* Secondary / Journal metadata */}
                  <div className="tvn-meta-line d-flex flex-wrap align-items-center gap-2 mb-2 text-xs">
                    <strong className="text-dark">Journal Article</strong>
                    <span 
                      className="text-primary-hover font-semibold"
                      style={{ color: '#2b54b2' }}
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
                    {(article.volume_number || article.issue_number || article.page_range || article.page_start) && (
                      <span className="text-muted">
                        {article.volume_number ? `, Volume: ${article.volume_number}` : ''}
                        {article.issue_number ? `, Issue: ${article.issue_number}` : ''}
                        {article.page_range || article.page_start ? `, Pages: ${article.page_range || article.page_start}` : ''}
                      </span>
                    )}
                    {article.publication_date && (
                      <span className="text-muted ms-2">{article.publication_date}</span>
                    )}
                  </div>

                  {/* Authors */}
                  <div className="tvn-authors-line text-xs mb-2">
                    <strong className="text-dark me-1">Authors:</strong>
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
                                className="tvn-author-link p-0"
                                style={{ color: '#2b54b2' }}
                                title={`View ${name} profile`}
                              >
                                {name}
                                {affiliations.length > 0 && (
                                  <sup className="ms-0.5">{affiliations.join(',')}</sup>
                                )}
                              </Link>
                            ) : (
                              <span className="tvn-author-link p-0" style={{ color: '#2b54b2' }}>
                                {name}
                                {affiliations.length > 0 && (
                                  <sup className="ms-0.5">{affiliations.join(',')}</sup>
                                )}
                              </span>
                            )}
                            {index < visibleAuthors.length - 1 ? ', ' : ''}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-muted">Authors are being updated</span>
                    )}

                    {hiddenAuthorCount > 0 && !showAllAuthors && (
                      <Button variant="link" className="tvn-show-more-btn ms-1" onClick={() => setShowAllAuthors(true)}>
                        +{hiddenAuthorCount} more
                      </Button>
                    )}
                    {showAllAuthors && (article?.authors?.length || 0) > 3 && (
                      <Button variant="link" className="tvn-show-more-btn ms-1" onClick={() => setShowAllAuthors(false)}>
                        Show less
                      </Button>
                    )}
                  </div>

                  {/* Count metrics */}
                  <div className="tvn-stats-plain-line text-xs mb-2 d-flex flex-wrap gap-4 text-muted">
                    <span>Citing Patents: <strong className="text-dark">0</strong></span>
                    <span className="pointer" onClick={() => setShowCitationsModal(true)}>
                      Citing Scholarly Works: <strong className="text-dark">{citationMetric || 0}</strong>
                    </span>
                    <span>
                      Reference Count: <strong style={{ color: '#2b54b2', fontWeight: 700 }}>{referenceMetric || 0}</strong>
                    </span>
                  </div>

                  {/* Additional info badges */}
                  <div className="tvn-additional-info-badges d-flex align-items-center gap-2 text-xs mt-2 flex-wrap">
                    <span className="text-muted fw-semibold me-1">Additional Info:</span>
                    {article.is_open_access && (
                      <span className="badge-pill-gray" onClick={() => scrollToSection('open-access-section')}>
                        Open Access
                      </span>
                    )}
                    {article.abstract && (
                      <span className="badge-pill-gray" onClick={() => scrollToSection('abstract-section')}>
                        Abstract
                      </span>
                    )}
                    <span className="badge-pill-gray" onClick={() => scrollToSection('affiliation-section')}>
                      Affiliation
                    </span>
                    <span className="badge-pill-gray">
                      Collection
                    </span>
                  </div>
                </div>

                {/* Right Column: Record ID Box */}
                <div className="tvn-scholarly-registry-box ms-md-auto shrink-0">
                  <span className="registry-label">Record ID</span>
                  <div className="registry-id-value">
                    {article?.display_id || article?.id || id || 'N/A'}
                  </div>
                  {article.doi && (
                    <div className="registry-actions d-flex gap-2 justify-content-center">
                      <button
                        className="registry-btn"
                        onClick={() => window.open(`https://doi.org/${article.doi}`, '_blank')}
                        title="Open article via DOI"
                      >
                        View DOI
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Main tabs */}
            <div className="tvn-tab-bar">
              <Button 
                variant="link" 
                className={`tvn-tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
                onClick={() => setActiveTab('summary')}
              >
                Summary
              </Button>
              <Button 
                variant="link" 
                className={`tvn-tab-btn ${activeTab === 'references' ? 'active' : ''}`}
                onClick={() => setActiveTab('references')}
              >
                {availableReferencesTotal} References
              </Button>
              <Button 
                variant="link" 
                className={`tvn-tab-btn ${activeTab === 'recommended' ? 'active' : ''}`}
                onClick={() => setActiveTab('recommended')}
              >
                Recommended
              </Button>
            </div>

            {/* Tab content */}
            {activeTab === 'summary' ? (
              <div className="tvn-summary-tab-content">
                
                {/* Action bar - Share only */}
                <div className="tvn-actions-bar">
                  <Button variant="link" className="tvn-action-btn" onClick={handleShareArticle}>
                    <Icon icon="lucide:share-2" />
                    <span>Share Article</span>
                  </Button>
                </div>

                {/* Summary grid (2-Column Layout matching Image 1) */}
                <div className="tvn-summary-grid-2col">
                  
                  {/* COLUMN 1 (LEFT MAIN PANE) */}
                  <div className="tvn-summary-col">
                    <div className="tvn-summary-card">
                      <div className="tvn-summary-card-header">
                        <Icon icon="lucide:file-text" />
                        <span>Abstract</span>
                      </div>
                      
                      {article.semantic_tldr && (
                        <div className="mb-3 p-3 rounded" style={{ backgroundColor: '#f0f4ff', borderLeft: '4px solid #2b54b2' }}>
                          <div className="d-flex align-items-center gap-2 mb-1 font-weight-bold" style={{ color: '#2b54b2', fontSize: '0.82rem' }}>
                            <Icon icon="lucide:sparkles" width="15" />
                            <strong className="text-uppercase">TL;DR</strong>
                          </div>
                          <p className="mb-0 text-xs" style={{ fontWeight: 500, color: '#334155', lineHeight: '1.5' }}>
                            {article.semantic_tldr}
                          </p>
                        </div>
                      )}

                      <p className="text-xs mb-4" style={{ lineHeight: '1.7', color: '#475569', textAlign: 'justify' }}>
                        {article.abstract || 'No abstract is available for this article.'}
                      </p>

                      {/* Sub-grid: 2 columns below Abstract */}
                      <div className="row g-3 pt-3 border-top">
                        {/* Sub-column 1: Authors, Keywords, Topics */}
                        <div className="col-md-6 d-flex flex-column gap-3">
                          {/* Authors */}
                          <div>
                            <div className="tvn-meta-heading">AUTHORS</div>
                            <div className="d-flex flex-column gap-1 text-xs" style={{ lineHeight: '1.6' }}>
                              {article.authors && article.authors.length > 0 ? (
                                article.authors.map((author, index) => {
                                  const name = author.display_name || author.name || 'Author';
                                  const affiliations = (author.institutions || [])
                                    .map((institution) => institutionIndexById.get(String(institution.institution_id || institution.id || institution.display_name)))
                                    .filter(Boolean);
                                  return (
                                    <div key={index} className="d-flex align-items-center gap-1">
                                      {author.author_id || author.id ? (
                                        <Link
                                          to={buildAuthorDetailPath(author.author_id || author.id)}
                                          className="text-primary-hover"
                                          style={{ color: '#2b54b2', fontWeight: 500 }}
                                          title={`View ${name} profile`}
                                        >
                                          {name}
                                          {affiliations.length > 0 && (
                                            <sup className="ms-1 text-primary">{affiliations.join(',')}</sup>
                                          )}
                                        </Link>
                                      ) : (
                                        <span style={{ fontWeight: 500, color: '#334155' }}>
                                          {name}
                                          {affiliations.length > 0 && (
                                            <sup className="ms-1 text-primary">{affiliations.join(',')}</sup>
                                          )}
                                        </span>
                                      )}
                                      {author.orcid && (
                                        <a href={author.orcid} target="_blank" rel="noreferrer" className="ms-1 align-middle">
                                          <Icon icon="simple-icons:orcid" className="text-success" width="12" />
                                        </a>
                                      )}
                                    </div>
                                  );
                                })
                              ) : (
                                <span className="text-muted-custom">Author list is being updated...</span>
                              )}
                            </div>
                          </div>

                          {/* Keywords */}
                          {article.keywords?.length > 0 && (
                            <div>
                              <div className="tvn-meta-heading">KEYWORDS</div>
                              <div className="text-xs" style={{ lineHeight: '1.6' }}>
                                {article.keywords.map((kw, index) => (
                                  <span key={index}>
                                    <span 
                                      className="text-primary-hover cursor-pointer" 
                                      style={{ color: '#2b54b2', fontWeight: 500 }}
                                      onClick={() => handleKeywordClick(kw)}
                                    >
                                      {kw.display_name}
                                    </span>
                                    {index < article.keywords.length - 1 ? ' , ' : ''}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Topics / Field of Study */}
                          {article.topics?.length > 0 && (
                            <div>
                              <div className="tvn-meta-heading">TOPICS</div>
                              <div className="text-xs" style={{ lineHeight: '1.6' }}>
                                {article.topics.map((topic, index) => (
                                  <span key={index}>
                                    <span 
                                      className="text-primary-hover cursor-pointer" 
                                      style={{ color: '#2b54b2', fontWeight: 500 }}
                                      onClick={() => handleTopicClick(topic)}
                                    >
                                      {topic.display_name}
                                    </span>
                                    {index < article.topics.length - 1 ? ' , ' : ''}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Sub-column 2: Identifiers, Institutions */}
                        <div className="col-md-6 d-flex flex-column gap-3">
                          {/* Identifiers */}
                          <div>
                            <div className="tvn-meta-heading">IDENTIFIERS</div>
                            <div className="d-flex flex-wrap gap-2 align-items-center mt-1">
                              {article.doi && (
                                <a
                                  href={articleDoiUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="tvn-identifier-pill text-decoration-none"
                                  title="Digital Object Identifier"
                                >
                                  <span className="tvn-doi-icon">doi</span>
                                  <span style={{ color: '#2b54b2' }}>{article.doi}</span>
                                </a>
                              )}
                              {openAlexUrl && (
                                <a
                                  href={openAlexUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="tvn-identifier-pill text-decoration-none"
                                  title="OpenAlex Record"
                                >
                                  <Icon icon="lucide:globe" style={{ color: '#0284c7' }} width="14" />
                                  <span style={{ color: '#0284c7' }}>{openAlexDisplayId}</span>
                                </a>
                              )}
                              {pdfUrl && (
                                <a
                                  href={pdfUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="tvn-identifier-pill text-decoration-none"
                                  title="View / Download Full PDF"
                                >
                                  <Icon icon="lucide:file-text" style={{ color: '#dc2626' }} width="14" />
                                  <span style={{ color: '#dc2626', fontWeight: 600 }}>PDF</span>
                                </a>
                              )}
                              {article.pmid && (
                                <div className="tvn-identifier-pill" title="PubMed ID">
                                  <Icon icon="lucide:file-code" className="text-info" width="14" />
                                  <span>{article.pmid}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Institutions */}
                          <div>
                            <div className="tvn-meta-heading">INSTITUTIONS</div>
                            {articleInstitutions.length > 0 ? (
                              <ol className="text-xs mb-0 ps-0 list-unstyled" style={{ lineHeight: '1.7', color: '#334155' }}>
                                {articleInstitutions.map((institution, index) => {
                                  const instName = institution.display_name || institution.name;
                                  const instId = institution.institution_id || institution.id;
                                  return (
                                    <li key={instId || instName || index} className="fw-medium">
                                      <span
                                        className="text-primary-hover cursor-pointer"
                                        style={{ color: '#2b54b2', fontWeight: 500 }}
                                        onClick={() => handleInstitutionClick(institution)}
                                        title={`Filter articles by ${instName}`}
                                      >
                                        {instName}
                                      </span>
                                      {institution.country_code ? (
                                        <span className="text-muted"> ({institution.country_code})</span>
                                      ) : null}
                                    </li>
                                  );
                                })}
                              </ol>
                            ) : (
                              <span className="text-xs text-muted">No institution records available.</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* COLUMN 2 (RIGHT SIDEBAR PANE) */}
                  <div className="tvn-summary-col">
                    {/* Publication Location & Dates Card */}
                    <div className="tvn-summary-card">
                      {/* PUBLICATION LOCATION */}
                      <div className="tvn-meta-heading">PUBLICATION LOCATION</div>
                      <div className="tvn-meta-subtext">
                        In:{' '}
                        {article.journal_name || article.journal || article.publisher_name ? (
                          <Button
                            variant="link"
                            className="p-0 text-start font-weight-bold"
                            style={{ color: '#2b54b2', fontSize: '0.82rem', textDecoration: 'none' }}
                            disabled={!article.journal_id && !article.journal_name}
                            onClick={() => navigateEntityFilter('journal_id', article.journal_id, article.journal_name)}
                          >
                            {article.journal_name || article.journal || article.publisher_name}
                          </Button>
                        ) : (
                          'Unknown Journal'
                        )}
                        {article.issue_number && `, Issue: ${article.issue_number}`}
                        {article.volume_number && `, Volume: ${article.volume_number}`}
                        {(article.first_page || article.page_range) && `, Page: ${article.first_page ? `${article.first_page}${article.last_page ? `-${article.last_page}` : ''}` : article.page_range}`}
                      </div>

                      {/* DATES */}
                      <div className="tvn-meta-heading">DATES</div>
                      <div className="tvn-meta-subtext">
                        <div>Published: {article.publication_date || article.publication_year || 'N/A'}</div>
                        {article.publication_date && <div>E-Published: {article.publication_date}</div>}
                      </div>

                      {/* PUBLICATION INFO */}
                      <div className="tvn-meta-heading">PUBLICATION INFO</div>
                      <div className="tvn-meta-subtext mb-0">
                        {article.publication_type || article.publication_info || 'Journal Article'}
                      </div>
                    </div>

                    {/* Open Access Badge info card */}
                    {article.is_open_access && (
                      <div className="tvn-summary-card border-orange">
                        <div className="d-flex align-items-center text-dark font-weight-bold text-xs mb-2">
                          <Icon icon="lucide:lock-keyhole-open" className="me-2 text-warning" />
                          <span>Open Access</span>
                          <Icon icon="lucide:info" className="ms-auto text-muted cursor-pointer" />
                        </div>
                        <div className="text-xs text-muted mb-2">
                          This record is marked as open access by the source data.
                        </div>
                        {(article.source_url || article.doi_url) && (
                          <a
                            className="d-flex align-items-center gap-1 text-primary text-xs fw-semibold"
                            href={article.source_url || article.doi_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#2b54b2', textDecoration: 'none' }}
                          >
                            <Icon icon="lucide:external-link" />
                            <span>Open sourced link</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                </div>

              </div>
            ) : activeTab === 'citations' ? (
              <div className="tvn-citations-tab-content py-4">
                <div className="tvn-modal-stat-box text-start p-3 mb-4 d-flex align-items-start gap-3" style={{ background: 'var(--primary-light)', borderRadius: '8px', border: '1px solid var(--primary)' }}>
                  <Icon icon="lucide:quote" width="32" className="text-primary mt-1" />
                  <div>
                    <h5 className="font-display fw-bold mb-1" style={{ color: 'var(--text-main)' }}>
                      {citingWorksRelationTotal} citing works are available
                    </h5>
                    <p className="text-muted-custom mb-2 text-xs">
                      Scientific articles that cite this work. Select a title to open the source article.
                      {isCitingWorksError ? ' The relation list could not be refreshed, so the detail count is shown.' : ''}
                    </p>
                    <Button variant="outline-primary" size="sm" className="tvn-btn-refine" onClick={() => navigate(`/trending-vn?search=${encodeURIComponent(toScientificPlainText(article.title))}`)}>
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
              <div className="tvn-references-tab-content py-4">
                <div className="tvn-modal-stat-box text-start p-3 mb-4 d-flex align-items-start gap-3" style={{ background: 'var(--primary-light)', borderRadius: '8px', border: '1px solid var(--primary)' }}>
                  <Icon icon="lucide:book-open" width="32" className="text-primary mt-1" />
                  <div>
                    <h5 className="font-display fw-bold mb-1" style={{ color: 'var(--text-main)' }}>
                      {availableReferencesTotal} available references
                    </h5>
                    <p className="text-muted-custom mb-2 text-xs">
                      Research works cited by this article. Select a title to open the source record.
                      {isReferencesError ? ' The reference list could not be refreshed, so the detail count is shown.' : ''}
                    </p>
                    <Button variant="outline-primary" size="sm" className="tvn-btn-refine" onClick={() => navigate(`/trending-vn?search=${encodeURIComponent(toScientificPlainText(article.title))}`)}>
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
              <div className="tvn-recommended-tab-content py-4">
                <div className="tvn-modal-stat-box text-start p-3 mb-4 d-flex align-items-start gap-3" style={{ background: 'var(--primary-light)', borderRadius: '8px', border: '1px solid var(--primary)' }}>
                  <Icon icon="lucide:lightbulb" width="32" className="text-primary mt-1" />
                  <div>
                    <h5 className="font-display fw-bold mb-1" style={{ color: 'var(--text-main)' }}>
                      Recommended articles
                    </h5>
                    <p className="text-muted-custom mb-2 text-xs">
                      Related research works you may be interested in, based on this article's topic and field.
                    </p>
                    <Button variant="outline-primary" size="sm" className="tvn-btn-refine" onClick={() => navigate(`/trending-vn?search=${encodeURIComponent(article.primary_topic || '')}`)}>
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
            ) : null}

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
              <div className="tvn-modal-stat-box">
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






