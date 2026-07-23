import { Link } from 'react-router-dom';
import { useProjectText } from '../../project/i18n/useProjectText';

const KeywordRelatedArticleList = ({ articles, loading, filterKeyword }) => {
  const p = useProjectText();
  if (loading) {
    return (
      <div className="d-flex flex-column gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-3 border rounded">
            <div className="skeleton-shimmer mb-2" style={{ width: '40%', height: '20px' }}></div>
            <div className="skeleton-shimmer mb-2" style={{ width: '100%', height: '24px' }}></div>
            <div className="skeleton-shimmer" style={{ width: '60%', height: '16px' }}></div>
          </div>
        ))}
      </div>
    );
  }

  const normalizedFilter = filterKeyword?.trim().toLocaleLowerCase();
  const filteredArticles = normalizedFilter
    ? (Array.isArray(articles) ? articles : []).filter((article) => {
        const matchedKeywords = article.matched_keywords
          || (article.matched_keyword ? [article.matched_keyword] : []);
        return matchedKeywords.some(
          (keyword) => keyword?.trim().toLocaleLowerCase() === normalizedFilter,
        );
      })
    : articles;

  if (!Array.isArray(filteredArticles) || filteredArticles.length === 0) {
    return (
      <div className="text-center py-4 text-muted-custom border rounded">
        {p('noKeywordArticles')}
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {filteredArticles.map((article, idx) => (
        <div key={article.article_id || article.id || idx} className="p-3 border rounded bg-card hover-shadow transition-all">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
               {(filterKeyword
                 ? [filterKeyword]
                 : article.matched_keywords || (article.matched_keyword ? [article.matched_keyword] : []))
                 .map((keyword) => (
                   <span key={keyword} className="badge border mb-2 me-2" style={{ backgroundColor: 'var(--bg-chip)', color: 'var(--primary)', borderColor: 'var(--border) !important' }}>
                     {keyword}
                   </span>
                 ))}
            </div>
            <span className="text-muted-custom small">
              {article.published_date || article.year || p('recent')}
            </span>
          </div>
          <h5 className="font-display fw-bold mb-2">
            <Link to={`/articles/${article.article_id || article.id}/visual`} className="text-main text-decoration-none">
              {article.title}
            </Link>
          </h5>
          <div className="text-muted-custom small d-flex flex-wrap gap-3">
            {article.journal_name && <span><i className="bi bi-journal-text me-1"></i> {article.journal_name}</span>}
            {article.doi && <span><i className="bi bi-link-45deg me-1"></i> {article.doi}</span>}
            {article.citations != null && <span><i className="bi bi-quote me-1"></i> {article.citations} citations</span>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KeywordRelatedArticleList;
