/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\keywords\components\KeywordArticleItem.jsx
 */
import { Button } from 'react-bootstrap';
import { Icon } from '@iconify/react';

/**
 * Item hiển thị bài báo liên quan đến keyword.
 */
export default function KeywordArticleItem({ article, onViewDetail }) {
  return (
    <div className="keyword-article-card">
      <div className="keyword-article-meta">
        {article.publication_year && <span className="keyword-article-year">{article.publication_year}</span>}
        {article.journal_name && (
          <span className="keyword-article-journal">
            <Icon icon="lucide:book-open" width="14" />
            {article.journal_name}
          </span>
        )}
        {article.citations_count > 0 && (
          <span className="keyword-article-citations">
            <Icon icon="lucide:quote" width="14" />
            {article.citations_count} citations
          </span>
        )}
      </div>

      <h2 className="keyword-article-item__title">
        {article.title}
      </h2>

      {article.doi && (
        <p className="keyword-article-doi">
          DOI: {article.doi}
        </p>
      )}

      {article.abstract && (
        <p className="keyword-article-abstract">
          {article.abstract}
        </p>
      )}

      <Button
        type="button"
        onClick={() => onViewDetail && onViewDetail(article.article_id)}
        className="keyword-article-action d-inline-flex align-items-center gap-2"
      >
        Xem chi tiết
        <Icon icon="lucide:arrow-right" width="16" />
      </Button>
    </div>
  );
}
