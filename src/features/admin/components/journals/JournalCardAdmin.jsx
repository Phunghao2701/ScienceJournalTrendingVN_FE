import { Card, Col, Row, Button } from 'react-bootstrap';
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

  const isPreview = window.location.pathname.startsWith('/admin-preview');
  const basePath = isPreview ? '/admin-preview' : '/admin';

  const idStr = id ? String(id) : '';
  const cleanId = idStr.replace(/\D/g, '') || '101';
  const displayId = `ID: #${cleanId}`;

  const isPublished = journal.status === 'Active' || journal.status === 'Published';
  const isReview = journal.status === 'Under Review' || journal.status === 'Draft';
  const statusClass = isPublished
    ? 'admin-status-dot admin-status-dot--accent'
    : isReview
      ? 'admin-status-dot admin-status-dot--warning'
      : 'admin-status-dot admin-status-dot--muted';

  return (
    <Col xs={12} sm={6} lg={4}>
      <Card
        className="journal-dark-card h-100 shadow-sm border-1 transition-hover admin-clickable-card"
        onClick={() => navigate(`${basePath}/journals/repository`)}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            navigate(`${basePath}/journals/repository`);
          }
        }}
      >
        <Card.Body className="d-flex flex-column p-4 text-start">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-muted-custom small fw-semibold font-monospace">{displayId}</span>
            <span className="badge bg-dark text-white px-2.5 py-1 text-uppercase text-xs fw-bold">
              {journal.subjectCategory || 'General'}
            </span>
          </div>

          <Card.Title className="font-display fw-bold text-main mb-1 line-clamp-2 h5">
            {title}
          </Card.Title>
          <div className="text-muted-custom font-monospace small mb-3">
            ISSN: {journal.issn || '—'}
          </div>

          <div className="bg-light p-3 rounded-3 mb-3" style={{ backgroundColor: 'var(--bg-chip)', fontSize: '0.8rem' }}>
            <Row className="g-2">
              <Col xs={6} className="border-end border-bottom pb-1.5" style={{ borderColor: 'var(--border)' }}>
                <span className="text-muted-custom text-xs d-block text-uppercase fw-semibold" style={{ fontSize: '0.65rem' }}>Publisher</span>
                <span className="text-main fw-bold text-truncate d-block">{journal.publisher || 'ResearchPulse'}</span>
              </Col>
              <Col xs={6} className="ps-3 border-bottom pb-1.5" style={{ borderColor: 'var(--border)' }}>
                <span className="text-muted-custom text-xs d-block text-uppercase fw-semibold" style={{ fontSize: '0.65rem' }}>Type</span>
                <span className="text-main fw-bold d-block">{journal.type || 'Journal'}</span>
              </Col>
              <Col xs={6} className="border-end pt-1.5" style={{ borderColor: 'var(--border)' }}>
                <span className="text-muted-custom text-xs d-block text-uppercase fw-semibold" style={{ fontSize: '0.65rem' }}>Coverage</span>
                <span className="text-main fw-bold d-block">{journal.coverage || '1980-2026'}</span>
              </Col>
              <Col xs={6} className="ps-3 pt-1.5">
                <span className="text-muted-custom text-xs d-block text-uppercase fw-semibold" style={{ fontSize: '0.65rem' }}>Region</span>
                <span className="text-main fw-bold text-truncate d-block">{journal.country || 'Vietnam'}</span>
              </Col>
            </Row>
          </div>

          <div className="d-flex gap-1.5 mb-3 flex-wrap">
            <span className="badge admin-status-badge admin-status-badge--accent text-xs py-1 px-2.5 rounded-pill">
              OPEN ACCESS
            </span>
            <span className="badge bg-warning-subtle text-warning border border-warning-subtle text-xs py-1 px-2.5 rounded-pill">
              DIAMOND OA
            </span>
          </div>

          <div className="d-flex align-items-center gap-2.5 bg-light p-2.5 rounded-3 mb-4 mt-auto" style={{ backgroundColor: 'var(--bg-chip)' }}>
            <div
              className="rounded-circle d-inline-flex align-items-center justify-content-center text-muted-custom"
              style={{ width: '36px', height: '36px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', flexShrink: 0 }}
              aria-hidden="true"
            >
              <Icon icon="lucide:building-2" width="16" />
            </div>
            <div className="text-truncate">
              <span className="fw-bold text-main d-block text-truncate" style={{ fontSize: '0.85rem' }}>
                {journal.publisher || 'Chưa chỉ định'}
              </span>
              <span className="text-muted-custom text-xs text-uppercase fw-semibold" style={{ fontSize: '0.65rem', letterSpacing: '0.02em' }}>
                Publisher
              </span>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center pt-3 border-top w-100" style={{ borderColor: 'var(--border)' }}>
            <div className="d-flex align-items-center gap-1.5">
              <span className={statusClass} />
              <span className="fw-bold text-uppercase text-main" style={{ fontSize: '0.75rem' }}>
                {journal.status || 'Draft'}
              </span>
            </div>

            <div className="d-flex gap-1.5">
              <Button
                variant="light"
                size="sm"
                className="btn-custom-sm d-inline-flex align-items-center justify-content-center p-2 rounded-2 border"
                onClick={(event) => {
                  event.stopPropagation();
                  navigate(`${basePath}/journals/repository`);
                }}
                title="View repository log"
              >
                <Icon icon="lucide:eye" width="14" />
              </Button>
              <Button
                variant="outline-dark"
                size="sm"
                className="btn-custom-sm d-inline-flex align-items-center justify-content-center p-2 rounded-2"
                onClick={(event) => {
                  event.stopPropagation();
                  navigate(`${basePath}/journals/${id}/edit`);
                }}
                title="Edit configurations"
              >
                <Icon icon="lucide:edit-2" width="14" />
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
}
