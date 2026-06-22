/**
 * @file AuthorTable.jsx
 * @description Vỏ chứa dữ liệu dạng bảng hiển thị danh sách tác giả theo cấu trúc dòng cột.
 */

import { Table, Row, Col } from 'react-bootstrap';
import AuthorTableRow from './AuthorTableRow';
import AuthorCard from './AuthorCard';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import EmptyState from '../../../shared/components/EmptyState';
import ErrorState from '../../../shared/components/ErrorState';

export default function AuthorTable({
  authors = [],
  loading = false,
  error = null,
  onRetry = null,
  startIndex = 1
}) {
  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (!loading && authors.length === 0) {
    return (
      <EmptyState
        title="Không tìm thấy tác giả phù hợp"
        description="Hãy thử thay đổi từ khóa tìm kiếm hoặc đặt lại các bộ lọc."
        icon="lucide:search-slash"
      />
    );
  }

  return (
    <div>
      <div className="author-table-shell d-none d-md-block">
        <Table hover responsive className="author-table m-0 align-middle">
          <thead>
            <tr>
              <th className="author-table-index-col text-center py-3">#</th>
              <th className="py-3">Tác giả</th>
              <th className="py-3">Tổ chức</th>
              <th className="py-3">Số bài báo</th>
              <th className="py-3">Citations</th>
              <th className="py-3">H-index</th>
              <th className="author-table-action-col py-3">Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx}>
                  <td className="text-center"><LoadingSkeleton width="20px" height="15px" /></td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <LoadingSkeleton width="32px" height="32px" borderRadius="50%" />
                      <div className="flex-grow-1">
                        <LoadingSkeleton width="120px" height="14px" className="mb-1" />
                        <LoadingSkeleton width="80px" height="10px" />
                      </div>
                    </div>
                  </td>
                  <td><LoadingSkeleton width="150px" height="14px" /></td>
                  <td><LoadingSkeleton width="40px" height="14px" /></td>
                  <td><LoadingSkeleton width="50px" height="14px" /></td>
                  <td><LoadingSkeleton width="30px" height="14px" /></td>
                  <td><LoadingSkeleton width="60px" height="14px" /></td>
                </tr>
              ))
            ) : (
              authors.filter(Boolean).map((author, idx) => (
                <AuthorTableRow key={author.author_id ?? author.id ?? idx} author={author} index={startIndex + idx} />
              ))
            )}
          </tbody>
        </Table>
      </div>

      <div className="d-block d-md-none">
        {loading ? (
          <Row className="g-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Col xs={12} key={idx}>
                <div className="author-mobile-skeleton">
                  <div className="d-flex gap-3 mb-2">
                    <LoadingSkeleton width="48px" height="48px" borderRadius="50%" />
                    <div className="flex-grow-1">
                      <LoadingSkeleton width="60%" height="16px" className="mb-2" />
                      <LoadingSkeleton width="40%" height="12px" />
                    </div>
                  </div>
                  <LoadingSkeleton width="100%" height="40px" />
                </div>
              </Col>
            ))}
          </Row>
        ) : (
          <Row className="g-3">
            {authors.filter(Boolean).map((author, idx) => (
              <Col xs={12} key={author.author_id ?? author.id ?? idx}>
                <AuthorCard author={author} />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}
