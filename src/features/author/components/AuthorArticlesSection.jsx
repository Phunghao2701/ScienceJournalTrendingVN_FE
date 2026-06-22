/**
 * @file AuthorArticlesSection.jsx
 * @description Điều phối việc hiển thị danh sách các bài báo nghiên cứu khoa học của tác giả.
 */

import { useState } from 'react';
import { Card, Form } from 'react-bootstrap';
import AuthorArticleRow from './AuthorArticleRow';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import EmptyState from '../../../shared/components/EmptyState';
import ErrorState from '../../../shared/components/ErrorState';
import AdminPagination from '../../../shared/components/Pagination';

export default function AuthorArticlesSection({
  articles = [],
  loading = false,
  error = null,
  onRetry = null
}) {
  const [sortKey, setSortKey] = useState('year-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  if (error) {
    return (
      <Card className="author-articles-error-card">
        <ErrorState message={error} onRetry={onRetry} />
      </Card>
    );
  }

  const sortedArticles = [...articles].sort((a, b) => {
    if (sortKey === 'year-desc') return (b.publication_year ?? 0) - (a.publication_year ?? 0);
    if (sortKey === 'year-asc') return (a.publication_year ?? 0) - (b.publication_year ?? 0);
    if (sortKey === 'citations-desc') return (b.citation_count ?? 0) - (a.citation_count ?? 0);
    return 0;
  });

  const totalPages = Math.ceil(sortedArticles.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentArticles = sortedArticles.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Card id="articles-section" className="author-articles-card">
      <div className="author-articles-header d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
        <div>
          <h3 className="author-section-title">Công trình Công bố khoa học</h3>
          <p className="author-articles-description">Các bài viết và nghiên cứu gần đây được xuất bản.</p>
        </div>

        {!loading && articles.length > 0 && (
          <Form.Select
            size="sm"
            value={sortKey}
            onChange={(e) => {
              setSortKey(e.target.value);
              setCurrentPage(1);
            }}
            className="author-articles-sort"
          >
            <option value="year-desc">Năm xuất bản (Mới nhất)</option>
            <option value="year-asc">Năm xuất bản (Cũ nhất)</option>
            <option value="citations-desc">Trích dẫn (Nhiều nhất)</option>
          </Form.Select>
        )}
      </div>

      {loading ? (
        <div className="d-flex flex-column gap-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="author-article-row">
              <div className="d-flex justify-content-between mb-2">
                <LoadingSkeleton width="40%" height="12px" />
                <LoadingSkeleton width="10%" height="12px" />
              </div>
              <LoadingSkeleton width="85%" height="16px" className="mb-2" />
              <LoadingSkeleton width="30%" height="12px" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <EmptyState
          title="Chưa có công trình công bố"
          description="Tác giả này chưa có bài báo khoa học nào trong hệ thống."
          icon="lucide:file-question"
          className="border-0 py-4"
        />
      ) : (
        <div className="d-flex flex-column">
          {currentArticles.map((article, idx) => (
            <AuthorArticleRow
              key={article.article_id ?? article.id ?? idx}
              article={article}
              isLast={idx === currentArticles.length - 1}
            />
          ))}

          {totalPages > 1 && (
            <AdminPagination
              totalItems={sortedArticles.length}
              currentPage={currentPage}
              limit={itemsPerPage}
              onPageChange={handlePageChange}
              entityName="bài báo"
            />
          )}
        </div>
      )}
    </Card>
  );
}
