/**
 * @file AuthorArticleRow.jsx
 * @description Hiển thị một thẻ bài báo nghiên cứu khoa học của tác giả.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';

export default function AuthorArticleRow({ article, isLast = false }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const id = article.article_id ?? article.id;
  const title = article.title ?? 'Bài báo nghiên cứu';
  const journal = article.journal_name ?? article.journal ?? 'Tạp chí khoa học';
  const year = article.publication_year ?? article.year ?? '—';
  const citations = article.citation_count ?? article.cited_by_count ?? article.citations ?? 0;
  const doi = article.doi ?? '';

  const handleTitleClick = () => {
    if (id) navigate(`/articles/${id}/visual`);
  };

  const handleCopyDoi = (e) => {
    e.stopPropagation();
    if (!doi) return;
    navigator.clipboard.writeText(doi);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`author-article-row${isLast ? ' author-article-row--last' : ''}`}>
      <div className="author-article-meta">
        <span className="author-article-journal text-truncate">{journal}</span>
        <span className="author-article-year flex-shrink-0">{year}</span>
      </div>

      <h4 onClick={handleTitleClick} className="author-article-title">
        {title}
      </h4>

      <div className="author-article-footer">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <span className="author-article-citation">
            Được trích dẫn: <strong>{citations} lần</strong>
          </span>
          {doi && (
            <div onClick={handleCopyDoi} className="author-article-doi" title="Click để sao chép mã DOI">
              <Icon icon={copied ? 'lucide:check' : 'lucide:copy'} width="10" className={copied ? 'text-success' : ''} />
              <span>DOI: {doi}</span>
            </div>
          )}
        </div>

        <span onClick={handleTitleClick} className="author-article-detail">
          Chi tiết <Icon icon="lucide:chevron-right" width="12" />
        </span>
      </div>
    </div>
  );
}
