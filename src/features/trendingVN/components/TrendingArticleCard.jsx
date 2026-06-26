import React from 'react';
import { Row, Col, Form, Collapse } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';

export default function TrendingArticleCard({
  article,
  index,
  currentPage,
  expandedAbstracts,
  groupingMode,
  visibleColumns,
  handleDetailClick,
  handleCopyDoi,
  toggleAbstract,
}) {
  const navigate = useNavigate();

  const publicationDate = article.publication_date || article.publication_year || '—';
  const publicationParts = [
    article.volume_number ? <> <strong>Volume:</strong> {article.volume_number}</> : null,
    article.issue_number ? <> <strong>Issue:</strong> {article.issue_number}</> : null,
    article.pages ? <> <strong>Pages:</strong> {article.pages}</> : null,
    publicationDate,
  ].filter(Boolean);

  const isExpanded = expandedAbstracts[article.article_id]
    || groupingMode === 'simple-expand'
    || groupingMode === 'extended-expand';
  const itemIndex = (currentPage - 1) * 10 + index + 1;

  return (
    <div key={article.article_id} className="lens-article-card">
      <div className="d-flex align-items-start gap-1">
        <div className="d-flex flex-column align-items-center gap-1" style={{ minWidth: '22px' }}>
          <Form.Check type="checkbox" className="lens-checkbox-sm" />
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            {itemIndex}
          </span>
        </div>

        <div className="flex-grow-1 min-w-0">
          {visibleColumns.article && (
            <div
              className="lens-article-title"
              onClick={() => handleDetailClick(article.article_id)}
            >
              {article.title}
            </div>
          )}

          <div className="lens-detail-line">
            <strong>Journal Article</strong>
            {visibleColumns.journal && article.journal_name && (
              <>
                {' '}
                <span
                  className="text-link"
                  onClick={() => navigate(`/journals/${article.journal_id}`)}
                >
                  {article.journal_name}
                </span>
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
                  <span
                    key={au.author_id || aIdx}
                    className="text-link cursor-pointer"
                    onClick={() => au.author_id && navigate(`/authors/${au.author_id}`)}
                  >
                    {au.display_name || au.name}
                    {aIdx < article.authors.length - 1 ? '; ' : ''}
                  </span>
                ))
              ) : (
                <span style={{ fontStyle: 'italic' }}>Any author</span>
              )}
            </div>
          )}

          <div className="lens-detail-line">
            <strong>Citing Patents:</strong> 0 |{' '}
            <strong>Citing Works:</strong>{' '}
            <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
              {article.semantic_citation_count || 0}
            </span>{' '}
            | <strong>Reference Count:</strong> 0
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

                  <div className="expanded-section mb-3">
                    <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>
                      Claims
                    </div>
                    <p className="text-muted text-xs mb-0" style={{ fontStyle: 'italic' }}>
                      Claims are unavailable for this record.
                    </p>
                  </div>

                  <Row className="mb-3">
                    <Col sm={6}>
                      <div className="expanded-section">
                        <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>
                          Publisher
                        </div>
                        <div className="text-xs text-primary d-flex align-items-center gap-1 font-semibold">
                          <Icon icon="lucide:building-2" width="12" />
                          {article.publisher_name || article.journal_name || 'Any journal'}
                        </div>
                      </div>
                    </Col>
                    <Col sm={6}>
                      <div className="expanded-section">
                        <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1 d-flex align-items-center gap-1" style={{ letterSpacing: '0.5px' }}>
                          Topic
                          <Icon icon="lucide:info" width="12" style={{ color: '#ef6c00', cursor: 'pointer' }} />
                        </div>
                        <div className="text-xs">
                          <span className="badge bg-light text-dark border px-2 py-1 font-monospace" style={{ fontSize: '0.68rem', fontWeight: 500 }}>
                            {article.primary_topic || 'Any topic'}
                          </span>
                        </div>
                      </div>
                    </Col>
                  </Row>

                  <div className="expanded-section">
                    <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>
                      Authors
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {article.authors && article.authors.length > 0 ? (
                        article.authors.map((au, idx) => (
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
                      History
                    </div>
                    <div className="history-timeline text-xs d-flex flex-column gap-2">
                      <div className="history-item">
                        <div className="fw-semibold text-dark">Publication: {article.publication_year || '—'}</div>
                      </div>
                      <div className="history-item border-top pt-1.5">
                        <div className="fw-semibold text-dark">Application: {article.publication_year || '—'}</div>
                      </div>
                      <div className="history-item border-top pt-1.5">
                        <div className="fw-semibold text-dark d-flex align-items-center gap-1">
                          Priority: {article.publication_year || '—'}
                          <Icon icon="lucide:link" width="10" className="text-muted" />
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
