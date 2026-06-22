import React from 'react';
import { Link } from 'react-router-dom';

const KeywordRelatedArticleList = ({ articles, loading }) => {
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

  if (!Array.isArray(articles) || articles.length === 0) {
    return (
      <div className="text-center py-4 text-muted-custom border rounded">
        Không có bài báo nào liên quan đến các keyword đang theo dõi.
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {articles.map((article, idx) => (
        <div key={article.id || idx} className="p-3 border rounded bg-card hover-shadow transition-all">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
               {article.matched_keyword && (
                 <span className="badge border mb-2 me-2" style={{ backgroundColor: 'var(--bg-chip)', color: 'var(--primary)', borderColor: 'var(--border) !important' }}>
                   {article.matched_keyword}
                 </span>
               )}
            </div>
            <span className="text-muted-custom small">
              {article.published_date || article.year || 'Gần đây'}
            </span>
          </div>
          <h5 className="font-display fw-bold mb-2">
            <Link to={`/articles/${article.id}/visual`} className="text-main text-decoration-none">
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
