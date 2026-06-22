import React from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

/**
 * Component JournalCard - Hiển thị thông tin tạp chí dưới dạng thẻ khối độc lập (Card View).
 * Tuân thủ chuẩn: Ứng dụng class cấu trúc .journal-dark-card từ Design System.
 * @param {Object} journal - Dữ liệu chi tiết của một tạp chí cụ thể
 */
export default function JournalCard({ journal }) {
  const navigate = useNavigate();

  return (
    <Col xs={12} sm={6} lg={4}>
      <Card className="journal-dark-card h-100 shadow-sm transition-hover">
        <Card.Body className="d-flex flex-column p-4">
          {/* Hàng đầu tiên: Danh mục và Badge trạng thái */}
          <div className="d-flex justify-content-between align-items-start mb-3">
            <span className="badge bg-dark-solid text-white text-uppercase" style={{ fontSize: '0.75rem' }}>
              {journal.subjectCategory}
            </span>
            <span className={`badge ${journal.status === 'Active' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
              {journal.status}
            </span>
          </div>

          {/* Tiêu đề chính của tạp chí */}
          <Card.Title className="font-display fw-bold text-main mb-2 line-clamp-2" style={{ fontSize: '1.2rem' }}>
            {journal.title}
          </Card.Title>

          {/* Nhà xuất bản công bố dữ liệu */}
          <Card.Subtitle className="text-muted-custom mb-3 small fw-normal">
            <i className="bi bi-building me-1"></i> {journal.publisher}
          </Card.Subtitle>

          {/* Khối thông tin chi tiết (Mã số ISSN, Biên tập viên) */}
          <div className="bg-light p-3 rounded-3 mb-4 mt-auto" style={{ backgroundColor: 'var(--bg-chip)' }}>
            <Row className="g-2 text-main small">
              <Col xs={6}>
                <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Mã số ISSN:</span>
                <span className="fw-medium">{journal.issn}</span>
              </Col>
              <Col xs={6}>
                <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Nhà xuất bản:</span>
                <span className="fw-medium text-truncate d-block">{journal.publisher}</span>
              </Col>
            </Row>
          </div>

          {/* Thanh tương tác phía chân thẻ bài viết */}
          <div className="d-flex gap-2 w-100 pt-2 border-top" style={{ borderColor: 'var(--border)' }}>
            <Button 
              variant="light" 
              className="w-50 text-main btn-custom-sm"
              onClick={() => navigate('/admin/journals/repository')}
            >
              <i className="bi bi-layers me-1"></i> Kho dữ liệu
            </Button>
            <Button 
              variant="outline-dark" 
              className="w-50 text-main btn-custom-sm"
              onClick={() => navigate(`/admin/journals/${journal.id}/edit`)}
            >
              <i className="bi bi-pencil me-1"></i> Sửa đổi
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
}