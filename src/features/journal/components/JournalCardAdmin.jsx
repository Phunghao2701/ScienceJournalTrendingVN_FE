import React from 'react';
import { Card, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

/**
 * Component JournalCardAdmin - Hiển thị thông tin tạp chí dưới dạng thẻ khối độc lập dành cho Admin.
 * Thỏa mãn tiêu chuẩn: Ứng dụng token class cấu trúc .journal-dark-card từ Design System.
 */
export default function JournalCardAdmin({ journal }) {
  const navigate = useNavigate();
  const id = journal.id || journal.journal_id;
  const title = journal.title || journal.display_name;

  return (
    <Col xs={12} sm={6} lg={4}>
      <Card className="journal-dark-card h-100 shadow-sm border-1 transition-hover">
        <Card.Body className="d-flex flex-column p-4">
          
          {/* Trạng thái phân loại và Badge màu hoạt động */}
          <div className="d-flex justify-content-between align-items-start mb-3">
            <span className="badge bg-dark text-white px-2 py-1 text-uppercase small">
              {journal.subjectCategory || 'General'}
            </span>
            <span className={`badge px-2 py-1 ${
              journal.status === 'Active' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'
            }`}>
              {journal.status || 'Draft'}
            </span>
          </div>

          {/* Tiêu đề tạp chí lớn */}
          <Card.Title className="font-display fw-bold text-main mb-2 line-clamp-2 h5">
            {title}
          </Card.Title>

          {/* Tên nhà xuất bản đi kèm */}
          <div className="text-muted-custom small d-flex align-items-center gap-1 mb-3">
            <Icon icon="lucide:building" width="14" />
            <span className="text-truncate">{journal.publisher || 'Chưa có nhà xuất bản'}</span>
          </div>

          {/* Khối thông tin chi tiết (Mã số ISSN, Người đứng đầu) */}
          <div className="bg-light p-3 rounded-3 mb-4 mt-auto" style={{ backgroundColor: 'var(--bg-chip)' }}>
            <div className="d-flex justify-content-between mb-2 small">
              <span className="text-muted-custom">Mã số ISSN:</span>
              <span className="fw-medium text-main font-monospace">{journal.issn || '—'}</span>
            </div>
            <div className="d-flex justify-content-between small">
              <span className="text-muted-custom">Tổng biên tập:</span>
              <span className="fw-medium text-main text-truncate" style={{ maxWidth: '150px' }}>
                {journal.editorInChief || 'Chưa chỉ định'}
              </span>
            </div>
          </div>

          {/* Thanh công cụ quản trị dưới chân thẻ */}
          <div className="d-flex gap-2 w-100 pt-3 border-top mt-auto" style={{ borderColor: 'var(--border)' }}>
            <Button 
              variant="light" 
              className="w-50 text-main btn-custom-sm d-flex align-items-center justify-content-center gap-1"
              onClick={() => navigate('/admin/journals/repository')}
            >
              <Icon icon="lucide:layers" width="14" />
              <span>Kho dữ liệu</span>
            </Button>
            <Button 
              variant="outline-dark" 
              className="w-50 text-main btn-custom-sm d-flex align-items-center justify-content-center gap-1"
              onClick={() => navigate(`/admin/journals/${id}/edit`)}
            >
              <Icon icon="lucide:edit-3" width="14" />
              <span>Sửa đổi</span>
            </Button>
          </div>

        </Card.Body>
      </Card>
    </Col>
  );
}