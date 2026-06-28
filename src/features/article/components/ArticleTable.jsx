/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\article\components\ArticleTable.jsx
 */
import { Table, Card, Button } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import ArticleTableRow from './ArticleTableRow';

export default function ArticleTable({
  articles,
  isLoading,
  onDetailClick,
  onClearFilters,
  visibleColumns = {
    doi: true,
    authors: true,
    article: true,
    journal: true,
    keywords: true,
    issn: true,
  },
  sortBy = 'created_at',
  sortOrder = 'desc',
  onSortChange,
}) {
  const { t } = useTranslation();

  const SORTABLE_COLS = [
    { key: "article", label: t("colArticle").toUpperCase(), sortField: "title", visible: visibleColumns.article !== false },
    { key: "journal", label: t("colJournal").toUpperCase(), sortField: null, visible: visibleColumns.journal !== false },
    { key: "year", label: t("yearLabel").toUpperCase(), sortField: "publication_year", visible: true },
    { key: "doi", label: t("colDoi").toUpperCase(), sortField: null, visible: visibleColumns.doi !== false },
    { key: "keywords", label: t("colTopic").toUpperCase(), sortField: null, visible: visibleColumns.keywords !== false },
    { key: "oa", label: t("colOa").toUpperCase(), sortField: null, visible: true },
  ];

  // Renders a loader with multiple shimmer rows, adapting to visibleColumns to prevent layout shift
  const renderSkeletons = () => (
    <tbody>
      {[1, 2, 3, 4, 5].map((i) => (
        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
          {/* Index column */}
          <td className="ps-3 py-3" style={{ width: '40px' }}>
            <div className="bg-secondary opacity-10 rounded" style={{ width: '15px', height: '14px' }} />
          </td>

          {/* Dynamic columns based on SORTABLE_COLS visibility */}
          {SORTABLE_COLS.filter(c => c.visible).map(col => {
            if (col.key === 'article') {
              return (
                <td key={col.key} className="py-3">
                  <div className="bg-secondary opacity-15 rounded mb-2" style={{ width: '80%', height: '18px' }} />
                  <div className="bg-secondary opacity-10 rounded" style={{ width: '45%', height: '12px' }} />
                </td>
              );
            }
            if (col.key === 'journal') {
              return (
                <td key={col.key} className="py-3">
                  <div className="bg-secondary opacity-10 rounded" style={{ width: '100px', height: '14px' }} />
                </td>
              );
            }
            if (col.key === 'year') {
              return (
                <td key={col.key} className="py-3 text-center">
                  <div className="bg-secondary opacity-10 rounded mx-auto" style={{ width: '40px', height: '14px' }} />
                </td>
              );
            }
            if (col.key === 'doi') {
              return (
                <td key={col.key} className="py-3">
                  <div className="bg-secondary opacity-10 rounded" style={{ width: '120px', height: '12px' }} />
                </td>
              );
            }
            if (col.key === 'keywords') {
              return (
                <td key={col.key} className="py-3">
                  <div className="bg-secondary opacity-10 rounded" style={{ width: '80px', height: '20px' }} />
                </td>
              );
            }
            if (col.key === 'oa') {
              return (
                <td key={col.key} className="py-3 text-center">
                  <div className="bg-secondary opacity-10 rounded mx-auto" style={{ width: '30px', height: '20px' }} />
                </td>
              );
            }
            return null;
          })}

          {/* Details column */}
          <td className="pe-3 text-end py-3">
            <div className="bg-secondary opacity-10 rounded ms-auto" style={{ width: '50px', height: '16px' }} />
          </td>
        </tr>
      ))}
    </tbody>
  );

  // Helper for topic colors
  const getTopicClassName = (topic) => {
    if (!topic) return '';
    const name = String(topic).toLowerCase();
    if (name.includes('machine learning') || name.includes('ml')) {
      return 'article-topic-badge--ml';
    }
    if (name.includes('computer science') || name.includes('cs')) {
      return 'article-topic-badge--cs';
    }
    if (name.includes('medicine') || name.includes('bio')) {
      return 'article-topic-badge--medicine';
    }
    if (name.includes('physic')) {
      return 'article-topic-badge--physics';
    }
    return 'article-topic-badge--other';
  };

  // If loading and there are no items
  if (isLoading && articles.length === 0) {
    return (
      <div className="article-table-card w-100">
        <Table responsive hover className="m-0 bg-transparent text-main border-0">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th className="bg-transparent text-muted-custom py-3 ps-3 text-xs" style={{ width: '40px' }}>#</th>
              {SORTABLE_COLS.filter(c => c.visible).map(col => (
                <th key={col.key} className="bg-transparent text-muted-custom py-3 text-xs">
                  {col.label}
                </th>
              ))}
              <th className="bg-transparent text-muted-custom py-3 text-xs text-end pe-3" style={{ width: '80px' }}>
                {t("colDetails")}
              </th>
            </tr>
          </thead>
          {renderSkeletons()}
        </Table>
      </div>
    );
  }

  // If search matches nothing
  if (articles.length === 0) {
    return (
      <div 
        className="text-center p-5 rounded-3 d-flex flex-column align-items-center justify-content-center"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          minHeight: '320px'
        }}
      >
        <div className="article-empty-icon mb-3">
          <Icon icon="lucide:search-code" width="30" height="30" />
        </div>
        <h5 className="text-main font-weight-bold mb-2 font-display">{t('noArticlesMatching')}</h5>
        <p className="text-muted-custom mb-4 text-sm max-w-md">
          {t('adjustFiltersTryAgain')}
        </p>
        {onClearFilters && (
          <Button 
            variant="outline-primary" 
            onClick={onClearFilters}
            className="d-flex align-items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-pill"
          >
            <Icon icon="lucide:rotate-ccw" width="14" />
            <span>{t('clearFiltersLabel')}</span>
          </Button>
        )}
      </div>
    );
  }



  return (
    <>
      {/* 1. TABLE LAYOUT (Desktop & Tablet) */}
      <div className="article-table-card w-100 d-none d-md-block">
        <Table responsive hover className="m-0 bg-transparent text-main border-0">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th className="bg-transparent text-muted-custom py-3 ps-3 text-xs" style={{ width: '40px' }}>#</th>
              {SORTABLE_COLS.filter(c => c.visible).map(col => (
                <th 
                  key={col.key}
                  style={{ cursor: col.sortField ? "pointer" : "default" }}
                  onClick={() => col.sortField && onSortChange && onSortChange(col.sortField)}
                  className="bg-transparent text-muted-custom py-3 text-xs"
                >
                  {col.label}{' '}
                  {col.sortField && sortBy === col.sortField && (
                    <Icon icon={sortOrder === "asc" ? "lucide:arrow-up" : "lucide:arrow-down"} width="11" />
                  )}
                </th>
              ))}
              <th className="bg-transparent text-muted-custom py-3 text-xs text-end pe-3" style={{ width: '80px' }}>
                {t("colDetails")}
              </th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article, index) => (
              <ArticleTableRow 
                key={article.article_id}
                article={article}
                index={index}
                onDetailClick={onDetailClick}
                visibleColumns={visibleColumns}
              />
            ))}
          </tbody>
        </Table>
      </div>

      {/* 2. CARD LAYOUT (Mobile) */}
      <div className="d-block d-md-none">
        <div className="d-flex flex-column gap-3">
          {articles.map((article, index) => {
            const topicClassName = getTopicClassName(article.primary_topic);
            return (
              <Card 
                key={article.article_id}
                onClick={() => onDetailClick(article.article_id)}
                className="article-mobile-card"
              >
                <Card.Body className="p-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted-custom text-xs font-display">#{index + 1}</span>
                    <div className="d-flex gap-1.5 align-items-center">
                      <span className={`article-topic-badge ${topicClassName}`}>
                        {article.primary_topic || t('unclassified')}
                      </span>
                      {article.is_open_access && (
                        <span className="article-oa-badge">
                          OA
                        </span>
                      )}
                    </div>
                  </div>

                  <h6 className="text-main font-weight-semibold mb-2" style={{ lineHeight: '1.4', fontSize: '0.9rem' }}>
                    {article.title}
                  </h6>

                  {article.abstract && (
                    <p className="text-muted-custom text-xs mb-3 text-truncate-2" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                      {article.abstract}
                    </p>
                  )}

                  <div className="pt-2 border-top border-light d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div>
                      {article.journal && (
                        <div className="text-primary text-xs font-weight-semibold" style={{ fontSize: '0.75rem' }}>
                          {article.journal.display_name}
                        </div>
                      )}
                      <div className="text-muted-custom text-xs font-display mt-0.5" style={{ fontSize: '0.7rem' }}>
                        {t('yearLabel')}: {article.publication_year} {article.doi ? `· DOI: ${article.doi}` : ''}
                      </div>
                    </div>
                    <span className="article-action-link d-flex align-items-center gap-0.5">
                      {t('detailsLink')}
                      <Icon icon="lucide:arrow-right" width="12" />
                    </span>
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
