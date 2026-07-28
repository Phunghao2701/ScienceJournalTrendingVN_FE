import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../../../shared/components/EmptyState';
import ErrorState from '../../../shared/components/ErrorState';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import PaginationControls from '../../../shared/components/PaginationControls';
import Icon from '../../../shared/components/Icon';
import OrcidArticleRow from './OrcidArticleRow';

function ResultsSkeleton() {
  return (
    <div className="orcid-results-skeleton" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index}>
          <LoadingSkeleton width="34%" height="12px" />
          <LoadingSkeleton width="86%" height="18px" className="my-2" />
          <LoadingSkeleton width="46%" height="12px" />
        </div>
      ))}
    </div>
  );
}

export default function OrcidScanResults({
  author,
  articles = [],
  pagination,
  isLoading = false,
  error = '',
  onRetry,
  onPageChange,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authorId = author?.author_id ?? author?.id;
  const authorName = author?.display_name || author?.full_name || t('orcidScan.authorFallback');
  const totalItems = Number(pagination?.total ?? articles.length);
  const currentPage = Number(pagination?.page ?? 1);
  const totalPages = Math.max(1, Math.ceil(totalItems / 20));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * 20 + 1;
  const endItem = Math.min(totalItems, currentPage * 20);
  return (
    <section className="orcid-scan-results" aria-labelledby="orcid-results-title">
      <header className="orcid-author-header">
        <div className="orcid-author-avatar" aria-hidden="true">
          {authorName.slice(0, 1).toUpperCase()}
        </div>
        <div className="orcid-author-copy">
          <span>{t('orcidScan.matchedAuthor')}</span>
          <h2>{authorName}</h2>
          <div className="orcid-author-meta">
            {author?.orcid && (
              <span>
                <Icon icon="lucide:fingerprint" width="14" />
                {author.orcid}
              </span>
            )}
            {author?.institution && (
              <span>
                <Icon icon="lucide:building-2" width="14" />
                {author.institution}
              </span>
            )}
          </div>
        </div>
        {authorId && (
          <Button
            variant="outline-primary"
            className="orcid-author-profile"
            onClick={() => navigate(`/authors/${encodeURIComponent(authorId)}`)}
          >
            {t('orcidScan.viewAuthor')}
            <Icon icon="lucide:arrow-up-right" width="15" />
          </Button>
        )}
      </header>

      <div className="orcid-results-heading">
        <div>
          <h3 id="orcid-results-title">{t('orcidScan.articlesTitle')}</h3>
          <p>{t('orcidScan.articlesDescription')}</p>
        </div>
        <span>
          {t('orcidScan.articleCount', {
            count: Number(pagination?.total ?? articles.length),
          })}
        </span>
      </div>

      {isLoading ? (
        <ResultsSkeleton />
      ) : error && articles.length === 0 ? (
        <ErrorState
          title={t('orcidScan.pageErrorTitle')}
          message={error}
          onRetry={onRetry}
          retryLabel={t('orcidScan.retry')}
          className="border-0"
        />
      ) : articles.length === 0 ? (
        <EmptyState
          title={t('orcidScan.emptyTitle')}
          description={t('orcidScan.emptyDescription')}
          icon="lucide:file-question"
          className="border-0"
        />
      ) : (
        <>
          <div className="orcid-article-list">
            {articles.map((article, index) => (
              <OrcidArticleRow
                key={article.article_id ?? article.id ?? `${article.doi}-${index}`}
                article={article}
                isLast={index === articles.length - 1}
              />
            ))}
          </div>
          {totalItems > 0 && (
            <div className="admin-pagination-bar">
              <div className="text-muted-custom small">
                {t('orcidScan.paginationSummary', {
                  start: startItem,
                  end: endItem,
                  total: totalItems,
                })}
              </div>
              <div className="admin-pagination-bar__center">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={onPageChange}
                />
              </div>
              <div className="admin-pagination-bar__right-placeholder" />
            </div>
          )}
        </>
      )}
    </section>
  );
}
