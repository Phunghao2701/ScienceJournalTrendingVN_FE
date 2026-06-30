import React from 'react';
import { Row, Col, Form, Collapse } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import ScientificMathText from '../../../shared/components/ScientificMathText';
import { toScientificPlainText } from '../../../shared/utils/scientificMath';

export default function TrendingArticleCard({
  article,
  expandedAbstracts,
  groupingMode,
  visibleColumns,
  handleDetailClick,
  handleCopyDoi,
  toggleAbstract,
}) {
  const navigate = useNavigate();

  const placeholder = '-';
  const publicationDate = article.publication_date || article.publication_year || placeholder;
  const publicationParts = [
    <> <strong>Volume:</strong> {article.volume_number || placeholder}</>,
    <> <strong>Issue:</strong> {article.issue_number || placeholder}</>,
    article.pages ? <> <strong>Pages:</strong> {article.pages}</> : null,
    publicationDate,
  ].filter(Boolean);

  const navigateEntityFilter = (paramName, id, fallbackText) => {
    const params = new URLSearchParams();
    if (id) {
      params.set(paramName, id);
    } else if (fallbackText) {
      params.set('search', fallbackText);
    }
    params.set('page', '1');
    navigate(`/articles?${params.toString()}`);
  };

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

  return (
    <div key={article.article_id} className="lens-article-card">
      <div className="d-flex align-items-start gap-1">
        <div className="d-flex flex-column align-items-center gap-1" style={{ minWidth: '22px' }}>
          <Form.Check type="checkbox" className="lens-checkbox-sm" />
          <button
            type="button"
            className="lens-article-expand-toggle"
            onClick={() => toggleAbstract(article.article_id)}
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
              className="lens-article-title"
              onClick={() => handleDetailClick(article.article_id)}
            >
              <ScientificMathText title={article.title_plain || toScientificPlainText(article.title)}>
                {article.title}
              </ScientificMathText>
            </div>
          )}

          <div className="lens-detail-line">
            <strong>Journal Article</strong>
            {visibleColumns.journal && article.journal_name && (
              <>
                {' '}
                <button
                  type="button"
                  className="text-link"
                  style={entityButtonStyle}
                  onClick={() => navigateEntityFilter('journal_id', article.journal_id, article.journal_name)}
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
            <div className="lens-detail-line">
              <strong>Authors: </strong>
              {article.authors && article.authors.length > 0 ? (
                article.authors.map((au, aIdx) => (
                  <button
                    type="button"
                    key={au.author_id || aIdx}
                    className="text-link cursor-pointer"
                    style={entityButtonStyle}
                    onClick={() => navigateEntityFilter('author_id', au.author_id, au.display_name || au.name)}
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

          <div className="lens-detail-line">
            <strong>Citation Count:</strong>{' '}
            <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
              {article.citation_count || article.semantic_citation_count || 0}
            </span>{' '}
            | <strong>Reference Count:</strong> {article.reference_count ?? 0}
            {visibleColumns.doi && article.doi && (
              <>
                {' | '}
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
          </div>

          <div className="lens-pill-row">
            {article.is_open_access && (
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
              className="lens-pill lens-pill-abstract"
              onClick={() => toggleAbstract(article.article_id)}
            >
              <Icon icon="lucide:text" width="10" />
              Abstract
            </span>
          </div>

          <Collapse in={isExpanded}>
            <div className="lens-expanded-box mt-3 p-3 border rounded bg-white" style={{ borderColor: 'var(--border)' }}>
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
                        <button
                          type="button"
                          className="text-xs text-primary d-flex align-items-center gap-1 font-semibold"
                          style={entityButtonStyle}
                          onClick={() => navigateEntityFilter('publisher_id', article.publisher_id, article.publisher_name || article.journal_name)}
                        >
                          <Icon icon="lucide:building-2" width="12" />
                          {article.publisher_name || article.journal_name || 'Any journal'}
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
                            style={{ ...entityButtonStyle, fontSize: '0.68rem', fontWeight: 500 }}
                            onClick={() => navigateEntityFilter('topic_id', article.topic_id, article.primary_topic)}
                          >
                            {article.primary_topic || 'Any topic'}
                          </button>
                        </div>
                      </div>
                    </Col>
                  </Row>

                  {article.keywords && article.keywords.length > 0 && (
                    <div className="expanded-section mb-3">
                      <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>
                        Keywords
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        {article.keywords.map((keyword, idx) => {
                          const keywordId = keyword.keyword_id || keyword.id;
                          const keywordName = keyword.display_name || keyword.name || keyword.keyword;
                          return (
                            <button
                              key={keywordId || keywordName || idx}
                              type="button"
                              className="badge bg-light text-dark border px-2 py-1"
                              style={{ ...entityButtonStyle, fontSize: '0.68rem', fontWeight: 500 }}
                              onClick={() => navigateEntityFilter('keyword_id', keywordId, keywordName)}
                            >
                              {keywordName}
                            </button>
                          );
                        })}
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
                            onClick={() => navigateEntityFilter('author_id', au.author_id, au.display_name || au.name)}
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
                  <div className="expanded-section mb-3">
                    <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>
                      Document Preview
                    </div>
                    <div className="preview-container border rounded d-flex flex-column align-items-center justify-content-center bg-light p-4 text-center" style={{ minHeight: '160px' }}>
                      <Icon icon="lucide:alert-circle" className="text-danger mb-2" width="24" />
                      <span className="text-xs text-muted fw-bold">No image yet</span>
                    </div>
                  </div>

                  <div className="expanded-section">
                    <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>
                      Publication Details
                    </div>
                    <div className="history-timeline text-xs d-flex flex-column gap-2">
                      <div className="history-item">
                        <div className="fw-semibold text-dark">Publication: {article.publication_year || placeholder}</div>
                      </div>
                      <div className="history-item border-top pt-1.5">
                        <div className="fw-semibold text-dark">Volume: {article.volume_number || '—'}</div>
                      </div>
                      <div className="history-item border-top pt-1.5">
                        <div className="fw-semibold text-dark d-flex align-items-center gap-1">
                          Issue: {article.issue_number || '—'}
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
}
