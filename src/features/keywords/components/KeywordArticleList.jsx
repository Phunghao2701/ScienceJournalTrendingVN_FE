/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\keywords\components\KeywordArticleList.jsx
 */
import { Icon } from '@iconify/react';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import AdminPagination from '../../../shared/components/Pagination';
import KeywordArticleItem from './KeywordArticleItem';

/**
 * Danh sách bài báo theo keyword với trạng thái và phân trang.
 */
export default function KeywordArticleList({ articles, loading, error, pagination, onPageChange, onViewDetail, onRetry }) {
  const totalItems = pagination?.total || pagination?.total_items || pagination?.totalItems || 0;
  const currentPage = pagination?.page || 1;
  const limit = pagination?.limit || pagination?.page_size || 10;

  if (loading) {
    return (
      <div className="keyword-article-list">
        {[1, 2, 3].map((item) => (
          <div key={item} className="keyword-article-skeleton">
            <LoadingSkeleton width="160px" height="18px" className="mb-3" />
            <LoadingSkeleton width="80%" height="28px" className="mb-3" />
            <LoadingSkeleton width="100%" height="44px" className="mb-4" />
            <LoadingSkeleton width="140px" height="38px" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="keyword-article-state">
        <Icon icon="lucide:alert-triangle" width="42" className="keyword-article-state-icon mb-3" />
        <h3 className="keyword-article-state-title">Không thể tải danh sách bài báo</h3>
        <p className="text-muted-custom mb-4">{error}</p>
        <button type="button" className="btn keyword-article-retry px-4" onClick={onRetry}>Thử lại</button>
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="keyword-article-state">
        <Icon icon="lucide:file-x" width="42" className="text-muted-custom mb-3" />
        <h3 className="keyword-article-state-title">Keyword này chưa có bài báo liên quan</h3>
        <p className="text-muted-custom mb-0">Hãy thử keyword khác để khám phá thêm xu hướng nghiên cứu.</p>
      </div>
    );
  }

  return (
    <>
      <div className="keyword-article-list">
        {articles.map((article) => (
          <KeywordArticleItem key={article.article_id} article={article} onViewDetail={onViewDetail} />
        ))}
      </div>
      {totalItems > limit && (
        <AdminPagination
          totalItems={totalItems}
          currentPage={currentPage}
          limit={limit}
          onPageChange={onPageChange}
          entityName="bài báo"
        />
      )}
    </>
  );
}
