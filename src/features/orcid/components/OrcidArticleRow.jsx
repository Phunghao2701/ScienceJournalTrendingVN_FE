import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import { buildOrcidArticleDetailNavigation } from '../utils/orcid';

export default function OrcidArticleRow({ article, isLast = false }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  const id = article.article_id ?? article.id;
  const title = article.title || t('orcidScan.untitledArticle');
  const journal = article.journal_name || t('orcidScan.unknownJournal');
  const year = article.publication_year ?? '—';
  const citations = Number(article.citation_count ?? 0) || 0;
  const doi = article.doi || '';

  const openArticle = () => {
    if (!id) return;

    const navigation = buildOrcidArticleDetailNavigation(
      id,
      location.pathname,
      location.search,
    );
    navigate(navigation.to, {
      state: {
        fromTrendingResults: navigation.returnTo,
      },
    });
  };

  const copyDoi = async () => {
    if (!doi) return;

    try {
      await navigator.clipboard.writeText(doi);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <article className={`author-article-row${isLast ? ' author-article-row--last' : ''}`}>
      <div className="author-article-meta">
        <span className="author-article-journal text-truncate">{journal}</span>
        <span className="author-article-year flex-shrink-0">{year}</span>
      </div>

      <button
        type="button"
        className="author-article-title"
        onClick={openArticle}
        disabled={!id}
      >
        {title}
      </button>

      <div className="author-article-footer">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <span className="author-article-citation">
            {t('orcidScan.citations', { count: citations })}
          </span>
          {doi && (
            <button
              type="button"
              onClick={copyDoi}
              className="author-article-doi"
              title={t('orcidScan.copyDoi')}
            >
              <Icon
                icon={copied ? 'lucide:check' : 'lucide:copy'}
                width="11"
                className={copied ? 'text-success' : ''}
                aria-hidden="true"
              />
              <span>{copied ? t('orcidScan.copied') : `DOI: ${doi}`}</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={openArticle}
          className="author-article-detail"
          disabled={!id}
        >
          {t('orcidScan.details')}
          <Icon icon="lucide:chevron-right" width="12" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
