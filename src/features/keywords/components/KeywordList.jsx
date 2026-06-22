/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\keywords\components\KeywordList.jsx
 */
import { Row, Col } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import AdminPagination from '../../../shared/components/Pagination';
import KeywordListItem from './KeywordListItem';

/**
 * Danh sách keyword kèm loading, empty, error và pagination.
 */
export default function KeywordList({ keywords, loading, error, pagination, onPageChange, onViewArticles, onRetry }) {
  const totalItems = pagination?.total || pagination?.total_items || pagination?.totalItems || 0;
  const currentPage = pagination?.page || 1;
  const limit = pagination?.limit || pagination?.page_size || 10;


  if (loading) {
    return (
      <Row className="g-3">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Col md={6} xl={4} key={item}>
            <div className="keyword-skeleton-card">
              <LoadingSkeleton width="120px" height="14px" className="mb-3" />
              <LoadingSkeleton width="80%" height="28px" className="mb-3" />
              <LoadingSkeleton width="140px" height="22px" className="mb-4" />
              <LoadingSkeleton width="180px" height="40px" />
            </div>
          </Col>
        ))}
      </Row>
    );
  }

  if (error) {
    return (
      <div className="keyword-state-card">
        <Icon icon="lucide:alert-triangle" width="42" className="keyword-state-icon mb-3" />
        <h3 className="keyword-state-title mb-2">Không thể tải danh sách keywords</h3>
        <p className="text-muted-custom mb-4">{error}</p>
        <button type="button" onClick={onRetry} className="btn keyword-retry-btn px-4">Thử lại</button>
      </div>
    );
  }

  if (!keywords || keywords.length === 0) {
    return (
      <div className="keyword-state-card">
        <Icon icon="lucide:inbox" width="42" className="text-muted-custom mb-3" />
        <h3 className="keyword-state-title mb-2">Không tìm thấy keyword phù hợp</h3>
        <p className="text-muted-custom mb-0">Thử đổi từ khóa tìm kiếm hoặc reset bộ lọc.</p>
      </div>
    );
  }

  return (
    <>
      <Row className="g-3">
        {keywords.map((keyword) => (
          <Col md={6} xl={4} key={keyword.keyword_id}>
            <KeywordListItem keyword={keyword} onViewArticles={onViewArticles} />
          </Col>
        ))}
      </Row>
      {totalItems > limit && (
        <AdminPagination
          totalItems={totalItems}
          currentPage={currentPage}
          limit={limit}
          onPageChange={onPageChange}
          entityName="keywords"
        />
      )}
    </>
  );
}
