import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Form, Collapse } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from '../../../shared/utils/toast';

// ── Author popover: shown when clicking an author name ──
function AuthorPopover({ name, authorId, onClose, onFilterByAuthor, onNewSearch, onViewProfile }) {
  const { t } = useTranslation();
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    // delay to avoid catching the same click that opened the popover
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handler); };
  }, [onClose]);

  return (
    <div ref={ref} className="author-popover-menu" onClick={(e) => e.stopPropagation()}>
      <div className="author-popover-name">
        <Icon icon="lucide:user" width="13" />
        <span>{name}</span>
      </div>
      <hr className="author-popover-hr" />
      {authorId && (
        <button className="author-popover-item author-popover-item--profile" onClick={onViewProfile}>
          <Icon icon="lucide:user-circle" width="12" />
          {t('viewAuthorProfile')}
        </button>
      )}
      <button className="author-popover-item" onClick={onFilterByAuthor}>
        <Icon icon="lucide:filter" width="12" />
        {t('filterByAuthorLabel')}
      </button>
      <button className="author-popover-item" onClick={onNewSearch}>
        <Icon icon="lucide:search" width="12" />
        {t('newSearchForAuthorLabel')}
      </button>
    </div>
  );
}

// ── Main card component ──
export default function TrendingArticleCard({
  article, index, currentPage, expandedAbstracts, groupingMode, visibleColumns,
  handleDetailClick, updateFilters, handleCopyDoi, toggleAbstract, filters
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [openPopover, setOpenPopover] = useState(null); // key of currently open author popover

  const isExpanded = expandedAbstracts[article.article_id]
    || groupingMode === 'simple-expand'
    || groupingMode === 'extended-expand';

  const itemIndex = (currentPage - 1) * 10 + index + 1;

  // First author with known institution (used for Affiliation pill)
  const firstAffiliation = article.authors?.find(a => a.last_known_institution)?.last_known_institution;

  // 1.2.1 — Navigate to author profile page
  const handleAuthorClick = (e, authorId) => {
    e.stopPropagation();
    if (authorId) navigate(`/authors/${authorId}`);
  };

  // 1.2.2 — Filter by topic_id if available, else fall back to search by name
  const handleTopicClick = (e) => {
    e.stopPropagation();
    if (article.topic_id) {
      updateFilters({ topic: String(article.topic_id) });
    } else if (article.primary_topic) {
      updateFilters({ search: article.primary_topic });
    }
  };

  // 1.2.3 — Toggle Open Access filter
  const handleOAFilter = (e) => {
    e.stopPropagation();
    const isAlreadyFiltered = filters?.selectedAccess === 'open';
    updateFilters({ access: isAlreadyFiltered ? 'all' : 'open' });
  };

  // 1.2.4 — Cited-by count with conditional styling
  const citedByCount = article.semantic_citation_count || article.citations || 0;
  const citedByStyle = citedByCount > 0
    ? { color: 'var(--primary)', fontWeight: 700 }
    : { color: 'var(--text-muted)', fontWeight: 400 };

  return (
    <div className="lens-article-card">
      <div className="d-flex align-items-start gap-1">

        {/* ── Checkbox + item index ── */}
        <div className="d-flex flex-column align-items-center gap-1" style={{ minWidth: '22px' }}>
          <Form.Check type="checkbox" className="lens-checkbox-sm" />
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            {itemIndex}
          </span>
        </div>

        {/* ── Main content ── */}
        <div className="flex-grow-1 min-w-0">

          {/* Article title */}
          {visibleColumns.article && (
            <div className="lens-article-title" onClick={() => handleDetailClick(article.article_id)}>
              {article.title}
            </div>
          )}

          {/* ── Meta line: type | Open Access | journal, year ── */}
          <div className="lens-meta-line">
            <span>{t('journalArticleType')}</span>

            {article.is_open_access && (
              <>
                <span className="meta-sep">|</span>
                <span className="lens-oa-inline">
                  <Icon icon="lucide:lock-open" width="11" />
                  {t('openAccess')}
                </span>
              </>
            )}

            {(visibleColumns.journal && article.journal_name) && (
              <>
                <span className="meta-sep">|</span>
                <span
                  className="text-link"
                  onClick={(e) => { e.stopPropagation(); navigate(`/journals/${article.journal_id}`); }}
                >
                  {article.journal_name}
                </span>
                {article.publication_year && (
                  <span style={{ color: 'var(--text-muted)' }}>, {article.publication_year}</span>
                )}
              </>
            )}

            {(!visibleColumns.journal || !article.journal_name) && article.publication_year && (
              <>
                <span className="meta-sep">|</span>
                <span style={{ color: 'var(--text-muted)' }}>{article.publication_year}</span>
              </>
            )}
          </div>

          {/* ── Authors line (with popover) ── */}
          {visibleColumns.authors && (
            <div className="lens-detail-line">
              <strong>{t('authorsLabel')}: </strong>
              {article.authors && article.authors.length > 0 ? (
                article.authors.map((au, aIdx) => {
                  const name = au.display_name || au.name;
                  const key = au.author_id || `${name}-${aIdx}`;
                  return (
                    <span key={key} style={{ position: 'relative', display: 'inline' }}>
                      <span
                        className="text-link text-link--clickable"
                        title={au.last_known_institution || name}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenPopover(openPopover === key ? null : key);
                        }}
                      >
                        {name}
                      </span>
                      {aIdx < article.authors.length - 1 ? '; ' : ''}

                      {openPopover === key && (
                        <AuthorPopover
                          name={name}
                          authorId={au.author_id}
                          onClose={() => setOpenPopover(null)}
                          onViewProfile={(e) => {
                            handleAuthorClick(e || { stopPropagation: () => {} }, au.author_id);
                            setOpenPopover(null);
                          }}
                          onFilterByAuthor={() => {
                            updateFilters({ search: name });
                            setOpenPopover(null);
                          }}
                          onNewSearch={() => {
                            navigate(`/trending-vn?search=${encodeURIComponent(name)}`);
                            setOpenPopover(null);
                          }}
                        />
                      )}
                    </span>
                  );
                })
              ) : (
                <span style={{ fontStyle: 'italic' }}>{t('anyAuthor')}</span>
              )}
            </div>
          )}

          {/* ── ISSN line (toggled by checkbox) ── */}
          {visibleColumns.issn && article.journal_issn && (
            <div className="lens-detail-line">
              <strong>{t('issnLabel')}: </strong>
              <span style={{ fontFamily: 'monospace' }}>{article.journal_issn}</span>
            </div>
          )}

          {/* ── Identifiers line: DOI + OpenAlex ID ── */}
          {(article.doi || article.article_id) && (
            <div className="lens-identifiers-line">
              {visibleColumns.doi && article.doi && (
                <span className="lens-identifier-item">
                  <Icon icon="academicons:doi" width="13" style={{ color: '#e5a00d' }} />
                  <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{article.doi}</span>
                  <button
                    className="lens-identifier-copy-btn"
                    onClick={(e) => handleCopyDoi(e, article.doi)}
                    title="Copy DOI"
                  >
                    <Icon icon="lucide:copy" width="10" />
                  </button>
                </span>
              )}
              {article.article_id && (
                <span className="lens-identifier-item">
                  <Icon icon="lucide:database" width="12" style={{ color: '#64748b' }} />
                  <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>W{article.article_id}</span>
                </span>
              )}
            </div>
          )}

          {/* ── Citation counts line ── */}
          <div className="lens-detail-line">
            <strong>{t('referenceCount')}:</strong>{' '}
            <span>{article.reference_count ?? 0}</span>
            {' | '}
            <strong>{t('citingWorksCount')}:</strong>{' '}
            <span style={citedByStyle}>
              {citedByCount}
            </span>

            {/* Keywords inline when checkbox is enabled */}
            {visibleColumns.keywords && article.primary_topic && (
              <>
                {' | '}
                <strong>{t('keywordsLabel')}: </strong>
                <span
                  className="text-link cursor-pointer"
                  onClick={() => updateFilters({ search: article.primary_topic })}
                >
                  {article.primary_topic}
                </span>
              </>
            )}
          </div>

          {/* ── Pill badges ── */}
          <div className="lens-pill-row">
            {article.is_open_access && (
              <span
                className={`lens-pill lens-pill-oa lens-pill--clickable${filters?.selectedAccess === 'open' ? ' lens-pill--active' : ''}`}
                onClick={handleOAFilter}
                title={filters?.selectedAccess === 'open' ? t('removeOAFilter') : t('filterOAOnly')}
              >
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
              style={{ cursor: 'pointer' }}
              onClick={() => toggleAbstract(article.article_id)}
            >
              <Icon icon="lucide:text" width="10" />
              {t('abstract')}
            </span>

            {/* Affiliation — no institution filter API yet, show coming-soon toast */}
            {firstAffiliation && (
              <span
                className="lens-pill lens-pill-affiliation"
                style={{ cursor: 'pointer' }}
                title={firstAffiliation}
                onClick={() => toast.info(t('featureComingSoon'))}
              >
                <Icon icon="lucide:building-2" width="10" />
                {t('affiliationLabel')}
              </span>
            )}

            {/* Field of Study — filter by topic_id if available, else search by name */}
            {article.primary_topic && (
              <span
                className="lens-pill lens-pill-field lens-pill--clickable"
                title={`Filter: ${article.primary_topic}`}
                onClick={handleTopicClick}
              >
                <Icon icon="lucide:graduation-cap" width="10" />
                {t('fieldOfStudyLabel')}
              </span>
            )}
          </div>

          {/* ── Expanded block (click Abstract) ── */}
          <Collapse in={isExpanded}>
            <div className="lens-expanded-box mt-3 p-3 border rounded bg-white" style={{ borderColor: 'var(--border)' }}>
              <Row className="g-3">

                {/* Left column: Abstract, Publisher, Research Topic, Authors */}
                <Col md={8} className="expanded-left-col">

                  {/* Abstract */}
                  <div className="expanded-section mb-3">
                    <div className="expanded-section-title">{t('abstractTitle')}</div>
                    <p className="text-muted text-xs text-justify" style={{ lineHeight: '1.5', margin: 0 }}>
                      {article.abstract || <em style={{ color: 'var(--text-muted)' }}>{t('claimsUnavailable')}</em>}
                    </p>
                  </div>

                  {/* Publisher + Research Topic */}
                  <Row className="mb-3">
                    <Col sm={6}>
                      <div className="expanded-section">
                        <div className="expanded-section-title">{t('publisherExact')}</div>
                        <div className="text-xs text-primary d-flex align-items-center gap-1 font-semibold">
                          <Icon icon="lucide:building-2" width="12" />
                          {article.publisher_name || article.journal_name || t('anyJournal')}
                        </div>
                      </div>
                    </Col>
                    <Col sm={6}>
                      <div className="expanded-section">
                        <div className="expanded-section-title">{t('researchTopicLabel')}</div>
                        <div className="text-xs">
                          {article.primary_topic ? (
                            <span
                              className="badge bg-light text-dark border px-2 py-1"
                              style={{ fontSize: '0.68rem', fontWeight: 500, cursor: 'pointer' }}
                              onClick={() => updateFilters({ search: article.primary_topic })}
                            >
                              {article.primary_topic}
                            </span>
                          ) : (
                            <span className="text-muted" style={{ fontStyle: 'italic', fontSize: '0.72rem' }}>
                              {t('claimsUnavailable')}
                            </span>
                          )}
                        </div>
                      </div>
                    </Col>
                  </Row>

                  {/* Authors với institution */}
                  <div className="expanded-section">
                    <div className="expanded-section-title">{t('authorsLabel')}</div>
                    <div className="d-flex flex-wrap gap-2">
                      {article.authors && article.authors.length > 0 ? (
                        article.authors.map((au, idx) => (
                          <span
                            key={au.author_id || idx}
                            className="text-xs text-primary d-flex align-items-center gap-1 border rounded px-2 py-1 bg-light"
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              const name = au.display_name || au.name;
                              updateFilters({ search: name });
                            }}
                          >
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
                        <span className="text-xs text-muted" style={{ fontStyle: 'italic' }}>{t('anyAuthor')}</span>
                      )}
                    </div>
                  </div>
                </Col>

                {/* Right column: Document Preview + Publication info */}
                <Col md={4} className="expanded-right-col border-start ps-3">

                  {/* Document Preview */}
                  <div className="expanded-section mb-3">
                    <div className="expanded-section-title">{t('docPreview')}</div>
                    <div
                      className="preview-container border rounded d-flex flex-column align-items-center justify-content-center bg-light p-4 text-center"
                      style={{ minHeight: '120px' }}
                    >
                      <Icon icon="lucide:file-text" className="text-muted mb-2" width="24" />
                      <span className="text-xs text-muted">{t('noImageYet')}</span>
                    </div>
                  </div>

                  {/* Publication info */}
                  <div className="expanded-section">
                    <div className="expanded-section-title">{t('publicationSource')}</div>
                    <div className="text-xs d-flex flex-column gap-1" style={{ color: 'var(--text-muted)' }}>
                      <div>
                        <strong style={{ color: 'var(--text-main)' }}>{t('yearLabel')}: </strong>
                        {article.publication_year || '—'}
                      </div>
                      {article.journal_name && (
                        <div>
                          <strong style={{ color: 'var(--text-main)' }}>{t('journalLabel')}: </strong>
                          <span
                            className="text-link"
                            onClick={() => navigate(`/journals/${article.journal_id}`)}
                          >
                            {article.journal_name}
                          </span>
                        </div>
                      )}
                      {article.journal_issn && (
                        <div>
                          <strong style={{ color: 'var(--text-main)' }}>{t('issnLabel')}: </strong>
                          <span style={{ fontFamily: 'monospace' }}>{article.journal_issn}</span>
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
}
