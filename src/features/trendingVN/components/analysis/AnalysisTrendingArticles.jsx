import { Table } from 'react-bootstrap';
import { formatGrowthRate, formatTrendingScore } from '../../utils/paperVnAnalysis';
import { useTranslation } from 'react-i18next';

const fmt = (value) => new Intl.NumberFormat().format(Number(value || 0));

export default function AnalysisTrendingArticles({ articles = [], coverage, onArticleClick }) {
  const { t } = useTranslation();
  const eligible = coverage?.eligible_articles || 0;
  const total = coverage?.total_articles || 0;

  return (
    <section className="analysis-section">
      <div className="analysis-section-header">
        <div>
          <h2>{t('trendingArticles')}</h2>
          <p>Rows are based only on usable citation-history JSON returned by the backend.</p>
        </div>
        <span className="analysis-coverage-pill">
          {t('coverage')}: {fmt(eligible)} / {fmt(total)}
        </span>
      </div>

      {articles.length === 0 ? (
        <div className="analysis-empty">No trending article rows returned for this cohort.</div>
      ) : (
        <Table responsive hover className="analysis-table mb-0">
          <thead>
            <tr>
              <th>{t('article')}</th>
              <th>{t('year')}</th>
              <th>{t('colJournal')}</th>
              <th className="text-end">{t('currentCitations')}</th>
              <th className="text-end">{t('previousCitations')}</th>
              <th className="text-end">{t('growth')}</th>
              <th className="text-end">{t('rate')}</th>
              <th className="text-end">{t('trendingScore')}</th>
              <th className="text-end">{t('importedCitations')}</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.article_id || article.title}>
                <td>
                  {article.article_id ? (
                    <button type="button" className="analysis-link-button" onClick={() => onArticleClick?.(article.article_id)}>
                      {article.title}
                    </button>
                  ) : (
                    article.title
                  )}
                </td>
                <td>{article.publication_year || 'N/A'}</td>
                <td>{article.journal_name || t('unknownJournal')}</td>
                <td className="text-end">{fmt(article.current_citations)}</td>
                <td className="text-end">{fmt(article.previous_citations)}</td>
                <td className="text-end">{fmt(article.absolute_growth)}</td>
                <td className="text-end">{formatGrowthRate(article.growth_rate)}</td>
                <td className="text-end">{formatTrendingScore(article.trending_score)}</td>
                <td className="text-end">{fmt(article.citation_count)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </section>
  );
}
