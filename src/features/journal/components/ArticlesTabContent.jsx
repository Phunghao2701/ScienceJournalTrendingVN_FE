/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\journal\components\ArticlesTabContent.jsx
 */
import { Card, Button } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';

export default function ArticlesTabContent({ recentArticles = [], loading, onArticleClick, emptyMessage }) {
  if (loading) {
    return (
      <div className="d-flex flex-column gap-3">
        {[1, 2].map(i => (
          <section key={i} className="journal-surface p-4">
            <LoadingSkeleton width="120px" height="18px" className="mb-2" />
            <LoadingSkeleton width="80%" height="28px" className="mb-3" />
            <LoadingSkeleton width="200px" height="16px" className="mb-3" />
            <LoadingSkeleton width="100%" height="60px" />
          </section>
        ))}
      </div>
    );
  }

  if (!recentArticles || recentArticles.length === 0) {
    return (
      <section className="journal-surface journal-empty-state">
        {emptyMessage || "Journal này chưa có bài báo gần đây."}
      </section>
    );
  }

  return (
    <div className="d-flex flex-column gap-3 text-start">
      {recentArticles.map((article, index) => {
        const articleId = article.article_id || article.id || article.articleId;
        const hasArticleId = articleId !== undefined && articleId !== null && String(articleId).trim() !== '';
        const handleArticleOpen = () => {
          if (hasArticleId && onArticleClick) onArticleClick(articleId);
        };

        return (
          <Card key={articleId || `${article.title || 'article'}-${index}`} className="journal-article-card">
            <div className="d-flex align-items-center gap-3 mb-2 flex-wrap">
              <span className="journal-badge journal-badge--accent">
                {article.publication_year || article.year || 'N/A'}
              </span>
              {article.doi && (
                <span className="text-muted-custom d-flex align-items-center gap-1 small">
                  <Icon icon="lucide:link-2" width="14" />
                  DOI: {article.doi}
                </span>
              )}
            </div>

            <h3
              className={`journal-article-title ${hasArticleId ? '' : 'text-muted-custom'}`}
              onClick={handleArticleOpen}
              role={hasArticleId ? 'button' : undefined}
              title={hasArticleId ? 'Xem chi tiết bài báo' : 'Bài báo này chưa có mã định danh'}
            >
              {article.title || 'Untitled Article'}
            </h3>

            {article.authors && (
              <div className="text-muted-custom mb-3 d-flex align-items-center gap-2 small">
                <Icon icon="lucide:users" width="16" style={{ color: 'var(--text-muted)' }} />
                <span>{Array.isArray(article.authors) ? article.authors.map(author => author.display_name || author.name || author.author_name).filter(Boolean).join(', ') : article.authors}</span>
              </div>
            )}

            {article.abstract && (
              <p className="journal-article-abstract">
                {article.abstract}
              </p>
            )}

            <div className="mt-auto d-flex justify-content-end">
              <Button
                disabled={!hasArticleId}
                onClick={handleArticleOpen}
                className="journal-text-btn px-3 py-1"
              >
                Xem chi tiết
                <Icon icon="lucide:arrow-right" width="14" />
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
