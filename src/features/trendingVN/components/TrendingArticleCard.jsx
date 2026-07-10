import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ScientificMathText from '../../../shared/components/ScientificMathText';
import { toScientificPlainText } from '../../../shared/utils/scientificMath';
import useBookmark from '../../bookmark/hooks/useBookmark';
import { toast } from '../../../shared/utils/toast';

export default function TrendingArticleCard({
  article,
  expandedAbstracts,
  groupingMode,
  visibleColumns,
  handleDetailClick,
  updateFilters,
  handleCopyDoi,
  toggleAbstract,
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isBookmarked, isBookmarkLoading, toggleBookmark } = useBookmark(article.article_id);

  const placeholder = '-';
  const publicationDate = article.publication_date || article.publication_year || placeholder;
  const keywordItems = Array.isArray(article.keywords) ? article.keywords : [];
  const visibleKeywordItems = keywordItems
    .map((keyword) => ({
      id: keyword.keyword_id || keyword.id,
      name: keyword.display_name || keyword.name || keyword.keyword,
    }))
    .filter((keyword) => keyword.name);
  const citationCount = article.citation_count ?? article.semantic_citation_count ?? 0;
  const referenceCount = article.reference_count ?? 0;
  const accessLabel = article.is_open_access ? 'Open Access' : 'Closed Access';
  const publicationDateDetail = article.publication_date
    && String(article.publication_date) !== String(article.publication_year || '')
    ? article.publication_date
    : null;

  const applyEntityFilter = (paramName, id, fallbackText) => {
    const nextFilter = id
      ? { [paramName]: id }
      : (fallbackText ? { search: fallbackText } : null);

    if (!nextFilter) return;

    if (typeof updateFilters === 'function') {
      updateFilters(nextFilter);
      return;
    }

    const params = new URLSearchParams();
    Object.entries(nextFilter).forEach(([key, value]) => params.set(key, value));
    params.set('page', '1');
    navigate(`/articles?${params.toString()}`);
  };

  const publicationParts = [
    <> <strong>Volume:</strong> {article.volume_number || placeholder}</>,
    <> <strong>Issue:</strong> {article.issue_number || placeholder}</>,
    article.pages ? <> <strong>Pages:</strong> {article.pages}</> : null,
    visibleColumns.publication && article.publication_year ? (
      <button
        type="button"
        className="text-link"
        style={{ background: 'none', border: 0, padding: 0, color: 'var(--primary)', cursor: 'pointer', font: 'inherit' }}
        onClick={() => applyEntityFilter('year', article.publication_year)}
      >
        {publicationDate}
      </button>
    ) : (visibleColumns.publication ? publicationDate : null),
  ].filter(Boolean);

  const entityButtonStyle = {
    background: 'none',
    border: 0,
    padding: 0,
    color: 'var(--primary)',
    cursor: 'pointer',
    font: 'inherit',
    textAlign: 'left',
  };

  const isExpanded = expandedAbstracts[article.article_id]
    || groupingMode === 'simple-expand'
    || groupingMode === 'extended-expand';
  const hasMetadataLine = Boolean(
    visibleColumns.citations
    || visibleColumns.references
    || (visibleColumns.doi && article.doi)
    || (visibleColumns.issn && article.journal_issn)
  );

  const handleBookmarkClick = async (event) => {
    event.stopPropagation();
    if (isBookmarkLoading) return;
    try {
      const result = await toggleBookmark();
      if (result.needsAuth) {
        toast.info(t('loginToBookmark'));
        navigate('/login');
        return;
      }
      toast.success(result.isBookmarked ? t('bookmarkAdded') : t('bookmarkRemoved'));
    } catch (err) {
      console.warn('Unable to update bookmark:', err);
      toast.error(t('bookmarkUpdateError'));
    }
  };

  return (
    <div key={article.article_id} className="tvn-article-card">
      <div className="d-flex align-items-start gap-1">
        <div className="d-flex flex-column align-items-center gap-1" style={{ minWidth: '22px' }}>
          <button
            type="button"
            className="tvn-article-expand-toggle"
            onClick={() => toggleAbstract(article.article_id)}
            aria-expanded={Boolean(isExpanded)}
            aria-label={isExpanded ? 'Collapse article details' : 'Expand article details'}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            <Icon
              icon={isExpanded ? 'lucide:chevron-up-circle' : 'lucide:chevron-down-circle'}
              width="14"
            />
          </button>
        </div>

        <div className="flex-grow-1 min-w-0">
          {visibleColumns.article && (
            <div
              className="tvn-article-title"
              onClick={() => handleDetailClick(article.article_id)}
            >
              <ScientificMathText title={article.title_plain || toScientificPlainText(article.title)}>
                {article.title}
              </ScientificMathText>
            </div>
          )}

          <div className="tvn-detail-line">
            <strong>Journal Article</strong>
            {visibleColumns.journal && article.journal_name && (
              <>
                {' '}
                <button
                  type="button"
                  className="text-link"
                  style={entityButtonStyle}
                  onClick={() => applyEntityFilter('journal_id', article.journal_id, article.journal_name)}
                >
                  {article.journal_name}
                </button>
              </>
            )}
            {publicationParts.length > 0 && (
              <>
                {', '}
                {publicationParts.map((part, partIndex) => (
                  <React.Fragment key={partIndex}>
                    {partIndex > 0 ? ', ' : ''}
                    {part}
                  </React.Fragment>
                ))}
              </>
            )}
          </div>

          {visibleColumns.authors && (
            <div className="tvn-detail-line">
              <strong>Authors: </strong>
              {article.authors && article.authors.length > 0 ? (
                article.authors.map((au, aIdx) => (
                  <button
                    type="button"
                    key={au.author_id || aIdx}
                    className="text-link cursor-pointer"
                    style={entityButtonStyle}
                    onClick={() => applyEntityFilter('author_id', au.author_id, au.display_name || au.name)}
                  >
                    {au.display_name || au.name}
                    {aIdx < article.authors.length - 1 ? '; ' : ''}
                  </button>
                ))
              ) : (
                <span style={{ fontStyle: 'italic' }}>Any author</span>
              )}
            </div>
          )}

          {visibleColumns.publisher && article.publisher_name && (
            <div className="tvn-detail-line">
              <strong>Publisher: </strong>
              <button
                type="button"
                className="text-link"
                style={entityButtonStyle}
                onClick={() => applyEntityFilter('publisher_id', article.publisher_id, article.publisher_name)}
              >
                {article.publisher_name}
              </button>
            </div>
          )}

          {visibleColumns.topic && article.primary_topic && (
            <div className="tvn-detail-line">
              <strong>Topic: </strong>
              <button
                type="button"
                className="text-link"
                style={entityButtonStyle}
                onClick={() => applyEntityFilter('topic_id', article.topic_id, article.primary_topic)}
              >
                {article.primary_topic}
              </button>
            </div>
          )}

          {visibleColumns.keywords && visibleKeywordItems.length > 0 && (
            <div className="tvn-detail-line tvn-keyword-line">
              <strong>Keywords: </strong>
              <span className="d-inline-flex flex-wrap gap-1">
                {visibleKeywordItems.map((keyword, idx) => (
                  <button
                    key={keyword.id || keyword.name || idx}
                    type="button"
                    className="tvn-inline-filter-chip"
                    onClick={() => applyEntityFilter('keyword_id', keyword.id, keyword.name)}
                  >
                    {keyword.name}
                  </button>
                ))}
              </span>
            </div>
          )}

          {hasMetadataLine && (
            <div className="tvn-detail-line">
              {visibleColumns.citations && (
                <>
                  <strong>Citation Count:</strong>{' '}
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                    {citationCount}
                  </span>
                </>
              )}
              {visibleColumns.references && (
                <>
                  {visibleColumns.citations ? ' | ' : ''}
                  <strong>Reference Count:</strong> {referenceCount}
                </>
              )}
              {visibleColumns.doi && article.doi && (
                <>
                  {(visibleColumns.citations || visibleColumns.references) ? ' | ' : ''}
                  <strong>DOI:</strong>{' '}
                  <span style={{ fontFamily: 'monospace', fontSize: '13.6px' }}>
                    {article.doi}
                  </span>
                  <button
                    style={{ background: 'none', border: 'none', padding: 0, marginLeft: '3px', cursor: 'pointer', color: 'var(--text-muted)' }}
                    onClick={(e) => handleCopyDoi(e, article.doi)}
                    title="Copy DOI"
                  >
                    <Icon icon="lucide:copy" width="10" />
                  </button>
                </>
              )}
              {visibleColumns.issn && article.journal_issn && (
                <>
                  {(visibleColumns.citations || visibleColumns.references || (visibleColumns.doi && article.doi)) ? ' | ' : ''}
                  <strong>ISSN:</strong>{' '}
                  <button
                    type="button"
                    className="text-link"
                    style={entityButtonStyle}
                    onClick={() => applyEntityFilter('search', article.journal_issn)}
                  >
                    {article.journal_issn}
                  </button>
                </>
              )}
            </div>
          )}

          <div className="tvn-pill-row">
            {visibleColumns.access && (
              <button
                type="button"
                className={`tvn-pill ${article.is_open_access ? 'tvn-pill-oa' : 'tvn-pill-closed'}`}
                onClick={() => applyEntityFilter('access', article.is_open_access ? 'oa' : 'closed')}
              >
                <Icon icon={article.is_open_access ? 'lucide:lock-open' : 'lucide:lock'} width="10" />
                {accessLabel}
              </button>
            )}
            <span className="tvn-pill tvn-pill-pending">
              <Icon icon="lucide:file-text" width="10" />
              Published
            </span>
            <button
              type="button"
              className={`tvn-pill tvn-pill-collection ${isBookmarked ? 'is-active' : ''}`}
              disabled={isBookmarkLoading}
              onClick={handleBookmarkClick}
            >
              <Icon icon={isBookmarked ? 'lucide:bookmark-check' : 'lucide:bookmark-plus'} width="10" />
              {isBookmarked ? t('bookmarked') : t('bookmarkSave')}
            </button>
            <span
              className="tvn-pill tvn-pill-abstract"
              onClick={() => toggleAbstract(article.article_id)}
            >
              <Icon icon="lucide:text" width="10" />
              Abstract
            </span>
          </div>

          {isExpanded && (
            <div className="tvn-expanded-box mt-3 p-3 border rounded bg-white" style={{ borderColor: 'var(--border)' }}>
              <Row className="g-3">
                <Col md={8} className="expanded-left-col">
                  <div className="expanded-section mb-3">
                    <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>
                      Abstract
                    </div>
                    <p className="text-muted text-xs text-justify" style={{ lineHeight: '1.5', margin: 0 }}>
                      {article.abstract || 'No abstract available'}
                    </p>
                  </div>

                  <Row className="mb-3">
                    <Col sm={6}>
                      <div className="expanded-section">
                        <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>
                          Publisher
                        </div>
                        {article.publisher_name ? (
                          <button
                            type="button"
                            className="text-xs text-primary d-flex align-items-center gap-1 font-semibold"
                            style={entityButtonStyle}
                            onClick={() => applyEntityFilter('publisher_id', article.publisher_id, article.publisher_name)}
                          >
                            <Icon icon="lucide:building-2" width="12" />
                            {article.publisher_name}
                          </button>
                        ) : (
                          <span className="text-xs text-muted">Not available</span>
                        )}
                      </div>
                    </Col>
                    <Col sm={6}>
                      <div className="expanded-section">
                        <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1 d-flex align-items-center gap-1" style={{ letterSpacing: '0.5px' }}>
                          Topic
                          <Icon icon="lucide:info" width="12" style={{ color: 'var(--primary-hover)', cursor: 'pointer' }} />
                        </div>
                        <div className="text-xs">
                          {article.primary_topic ? (
                            <button
                              type="button"
                              className="badge bg-light text-dark border px-2 py-1 font-monospace"
                              style={{ ...entityButtonStyle, fontSize: '0.68rem', fontWeight: 500 }}
                              onClick={() => applyEntityFilter('topic_id', article.topic_id, article.primary_topic)}
                            >
                              {article.primary_topic}
                            </button>
                          ) : (
                            <span className="text-muted">Not available</span>
                          )}
                        </div>
                      </div>
                    </Col>
                  </Row>

                  {visibleKeywordItems.length > 0 && (
                    <div className="expanded-section mb-3">
                      <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>
                        Keywords
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        {visibleKeywordItems.map((keyword, idx) => (
                          <button
                            key={keyword.id || keyword.name || idx}
                            type="button"
                            className="badge bg-light text-dark border px-2 py-1"
                            style={{ ...entityButtonStyle, fontSize: '0.68rem', fontWeight: 500 }}
                            onClick={() => applyEntityFilter('keyword_id', keyword.id, keyword.name)}
                          >
                            {keyword.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="expanded-section">
                    <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>
                      Authors
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {article.authors && article.authors.length > 0 ? (
                        article.authors.map((au, idx) => (
                          <button
                            key={au.author_id || idx}
                            type="button"
                            className="text-xs text-primary d-flex align-items-center gap-1 border rounded px-2 py-1 bg-light"
                            style={entityButtonStyle}
                            onClick={() => applyEntityFilter('author_id', au.author_id, au.display_name || au.name)}
                          >
                            <Icon icon="lucide:user" width="12" />
                            {au.display_name || au.name}
                            {au.last_known_institution && (
                              <span className="text-muted font-normal" style={{ fontSize: '0.62rem' }}>
                                ({au.last_known_institution})
                              </span>
                            )}
                          </button>
                        ))
                      ) : (
                        <span className="text-xs text-muted font-italic">Any author</span>
                      )}
                    </div>
                  </div>
                </Col>

                <Col md={4} className="expanded-right-col border-start ps-3">
                  <div className="expanded-section">
                    <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>
                      Publication Details
                    </div>
                    <div className="history-timeline text-xs d-flex flex-column gap-2">
                      <div className="history-item">
                        <div className="fw-semibold text-dark">Publication year: {article.publication_year || placeholder}</div>
                      </div>
                      {publicationDateDetail && (
                        <div className="history-item border-top pt-1.5">
                          <div className="fw-semibold text-dark">Publication date: {publicationDateDetail}</div>
                        </div>
                      )}
                      <div className="history-item border-top pt-1.5">
                        <div className="fw-semibold text-dark">Volume: {article.volume_number || '—'}</div>
                      </div>
                      <div className="history-item border-top pt-1.5">
                        <div className="fw-semibold text-dark d-flex align-items-center gap-1">
                          Issue: {article.issue_number || '—'}
                        </div>
                      </div>
                      {article.pages && (
                        <div className="history-item border-top pt-1.5">
                          <div className="fw-semibold text-dark">Pages: {article.pages}</div>
                        </div>
                      )}
                      {article.doi && (
                        <div className="history-item border-top pt-1.5">
                          <div className="fw-semibold text-dark">
                            DOI:{' '}
                            <span style={{ fontFamily: 'monospace', overflowWrap: 'anywhere' }}>{article.doi}</span>
                            <button
                              style={{ background: 'none', border: 'none', padding: 0, marginLeft: '3px', cursor: 'pointer', color: 'var(--text-muted)' }}
                              onClick={(e) => handleCopyDoi(e, article.doi)}
                              title="Copy DOI"
                            >
                              <Icon icon="lucide:copy" width="10" />
                            </button>
                          </div>
                        </div>
                      )}
                      {article.journal_issn && (
                        <div className="history-item border-top pt-1.5">
                          <div className="fw-semibold text-dark">ISSN: {article.journal_issn}</div>
                        </div>
                      )}
                      <div className="history-item border-top pt-1.5">
                        <div className="fw-semibold text-dark">Citation Count: {citationCount}</div>
                      </div>
                      <div className="history-item border-top pt-1.5">
                        <div className="fw-semibold text-dark">Reference Count: {referenceCount}</div>
                      </div>
                      <div className="history-item border-top pt-1.5">
                        <div className="fw-semibold text-dark">Access: {accessLabel}</div>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
