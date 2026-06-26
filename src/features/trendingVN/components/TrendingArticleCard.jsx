  import React from 'react';
import { Row, Col, Form, Collapse } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function TrendingArticleCard({
  article, index, currentPage, expandedAbstracts, groupingMode, visibleColumns,
  handleDetailClick, updateFilters, handleCopyDoi, toggleAbstract
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();

    const isExpanded = expandedAbstracts[article.article_id] || groupingMode === 'simple-expand' || groupingMode === 'extended-expand';
    const itemIndex = (currentPage - 1) * 10 + index + 1;

    return (
      <div key={article.article_id} className="lens-article-card">
        <div className="d-flex align-items-start gap-1">
          {/* Checkbox + số thứ tự */}
          <div className="d-flex flex-column align-items-center gap-1" style={{ minWidth: '22px' }}>
            <Form.Check type="checkbox" className="lens-checkbox-sm" />
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              {itemIndex}
            </span>
          </div>

          {/* Nội dung bài báo */}
          <div className="flex-grow-1 min-w-0">
            {/* Tiêu đề bài báo (link xanh) — ẩn/hiện theo checkbox Article */}
            {visibleColumns.article && (
              <div
                className="lens-article-title"
                onClick={() => handleDetailClick(article.article_id)}
              >
                {article.title}
              </div>
            )}

            {/* Dòng meta badges: mã tài liệu, loại, trạng thái */}
            <div className="lens-meta-line">
              <span>{t('scientificArticle')}</span>
              <span>•</span>
              <span>{t('yearLabel')}: {article.publication_year || '—'}</span>
              <span>•</span>
              <span className="d-flex align-items-center gap-1">
                <span className="lens-status-dot" style={{ background: '#16a34a' }} />
                <span style={{ color: '#16a34a', fontWeight: 600 }}>{t('statusPublished')}</span>
              </span>
            </div>

            {/* Dòng: Tác giả — ẩn/hiện theo checkbox Authors */}
            {visibleColumns.authors && (
              <div className="lens-detail-line">
                <strong>{t('authorsLabel')}: </strong>
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
                  <span style={{ fontStyle: 'italic' }}>{t('anyAuthor')}</span>
                )}
              </div>
            )}

            {/* Dòng: Tạp chí — ẩn/hiện theo checkbox Journal */}
            {visibleColumns.journal && article.journal_name && (
              <div className="lens-detail-line">
                <strong>{t('journalLabel')}: </strong>
                <span
                  className="text-link"
                  onClick={() => navigate(`/journals/${article.journal_id}`)}
                >
                  {article.journal_name}
                </span>
              </div>
            )}

            {/* Dòng: ISSN — ẩn/hiện theo checkbox ISSN */}
            {visibleColumns.issn && article.journal_issn && (
              <div className="lens-detail-line">
                <strong>{t('issnLabel')}: </strong>
                <span style={{ fontFamily: 'monospace' }}>{article.journal_issn}</span>
              </div>
            )}

            {/* Dòng: Keywords/Topic — ẩn/hiện theo checkbox Keywords */}
            {visibleColumns.keywords && article.primary_topic && (
              <div className="lens-detail-line">
                <strong>{t('keywordsLabel')}: </strong>
                <span 
                  className="text-link cursor-pointer"
                  onClick={() => updateFilters({ search: article.primary_topic })}
                >
                  {article.primary_topic}
                </span>
              </div>
            )}

            {/* Dòng: DOI + Trích dẫn — ẩn/hiện DOI theo checkbox */}
            <div className="lens-detail-line">
              <strong>{t('citedWorksLabel')}:</strong> 0 | {' '}
              <strong>{t('citedByLabel')}:</strong>{' '}
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{article.semantic_citation_count || 0}</span> | {' '}
              <strong>{t('citesLabel')}:</strong> 0
              {visibleColumns.doi && article.doi && (
                <>
                  {' | '}
                  <strong>{t('doiLabel')}:</strong>{' '}
                  <span style={{ fontFamily: 'monospace', fontSize: '13.6px' }}>{article.doi}</span>
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

            {/* Pill badges: Open Access, Abstract, Collection */}
            <div className="lens-pill-row">
              {article.is_open_access && (
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
                className="lens-pill lens-pill-abstract"
                onClick={() => toggleAbstract(article.article_id)}
              >
                <Icon icon="lucide:text" width="10" />
                {t('abstract')}
              </span>
            </div>

            {/* Detailed split-layout collapse block (Lens-style) */}
            <Collapse in={isExpanded}>
              <div className="lens-expanded-box mt-3 p-3 border rounded bg-white" style={{ borderColor: 'var(--border)' }}>
                <Row className="g-3">
                  {/* Left Column: Abstract, Claims, Applicants, Inventors, Classifications */}
                  <Col md={8} className="expanded-left-col">
                    {/* 1. Abstract */}
                    <div className="expanded-section mb-3">
                      <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>{t('abstractTitle')}</div>
                      <p className="text-muted text-xs text-justify" style={{ lineHeight: '1.5', margin: 0 }}>
                        {article.abstract || t('anyTopic')}
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
                            {article.publisher_name || article.journal_name || t('anyJournal')}
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
                              {article.primary_topic || t('anyTopic')}
                            </span>
                          </div>
                        </div>
                      </Col>
                    </Row>

                    {/* 4. Inventors (Authors) */}
                    <div className="expanded-section">
                      <div className="expanded-section-title fw-bold text-xs text-dark text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>{t('authorsLabel')}</div>
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
                          <div className="fw-semibold text-dark">{t('publication')}: {article.publication_year || '—'}</div>
                        </div>
                        <div className="history-item border-top pt-1.5">
                          <div className="fw-semibold text-dark">{t('application')}: {article.publication_year || '—'}</div>
                        </div>
                        <div className="history-item border-top pt-1.5">
                          <div className="fw-semibold text-dark d-flex align-items-center gap-1">
                            {t('priority')}: {article.publication_year || '—'}
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
  };

