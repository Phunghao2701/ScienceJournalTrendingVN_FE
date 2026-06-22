/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\journal\components\JournalHero.jsx
 */
import { Row, Col, Button, Spinner } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';

export default function JournalHero({
  journal,
  isFollowing,
  isAddingToProject,
  onFollow,
  onAddToProject,
  loading
}) {
  const navigate = useNavigate();

  if (loading || !journal) {
    return (
      <section className="journal-surface journal-hero-card mb-4" aria-label="Đang tải thông tin tạp chí">
        <Row className="gy-4 journal-hero-content">
          <Col lg={8}>
            <div className="d-flex gap-2 mb-3">
              <div className="skeleton-shimmer" style={{ width: '60px', height: '24px', borderRadius: '6px' }} />
              <div className="skeleton-shimmer" style={{ width: '100px', height: '24px', borderRadius: '6px' }} />
            </div>
            <div className="skeleton-shimmer mb-3" style={{ width: '80%', height: '44px' }} />
            <div className="skeleton-shimmer mb-4" style={{ width: '95%', height: '64px' }} />
            <div className="d-flex gap-2 flex-wrap">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton-shimmer" style={{ width: '92px', height: '32px', borderRadius: '999px' }} />
              ))}
            </div>
          </Col>
          <Col lg={4} className="text-lg-end">
            <div className="skeleton-shimmer mb-2 ms-lg-auto" style={{ width: '150px', height: '72px' }} />
            <div className="skeleton-shimmer mb-3 ms-lg-auto" style={{ width: '160px', height: '20px' }} />
            <div className="d-flex gap-2 justify-content-lg-end flex-wrap">
              <div className="skeleton-shimmer" style={{ width: '110px', height: '38px', borderRadius: '6px' }} />
              <div className="skeleton-shimmer" style={{ width: '140px', height: '38px', borderRadius: '6px' }} />
            </div>
          </Col>
        </Row>
      </section>
    );
  }

  const {
    display_name,
    description,
    publisher_name,
    is_open_access,
    quartile = 'Q1',
    metric_value,
    metric_name = 'Impact Factor',
    metric_year = '2024',
    subject_categories = [],
    is_following
  } = journal;

  const handleCategoryClick = (categoryName) => {
    if (!categoryName) return;
    navigate(`/keywords?keyword=${encodeURIComponent(categoryName)}`);
  };

  const quartileClass = quartile === 'Q1' ? 'journal-badge--q1' : quartile === 'Q2' ? 'journal-badge--accent' : 'journal-badge--neutral';

  return (
    <section className="journal-surface journal-hero-card mb-4" aria-labelledby="journal-detail-title">
      <Row className="gy-4 align-items-start journal-hero-content">
        <Col lg={8} md={7}>
          <div className="journal-badge-row">
            {quartile && (
              <span className={`journal-badge ${quartileClass}`}>
                {quartile}
              </span>
            )}
            {is_open_access && (
              <span className="journal-badge journal-badge--accent">
                Open Access
              </span>
            )}
            {publisher_name && (
              <span className="journal-badge journal-badge--neutral">
                {publisher_name}
              </span>
            )}
          </div>

          <h1 id="journal-detail-title" className="journal-title">
            {display_name}
          </h1>

          <p className="journal-description">
            {description || 'Chưa có mô tả chi tiết phạm vi nghiên cứu cho tạp chí này.'}
          </p>

          {subject_categories.length > 0 && (
            <div className="journal-category-list" aria-label="Chủ đề nghiên cứu">
              {subject_categories.map((cat, idx) => (
                <span
                  key={cat.id || idx}
                  className="journal-category-chip"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleCategoryClick(cat.display_name)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCategoryClick(cat.display_name)}
                  title={`Tìm keyword ${cat.display_name}`}
                >
                  {cat.display_name}
                </span>
              ))}
            </div>
          )}
        </Col>

        <Col lg={4} md={5} className="text-md-end text-start mt-lg-2">
          {metric_value ? (
            <div className="journal-metric-panel ms-md-auto mb-3">
              <div className="journal-metric-value">
                {metric_value}
              </div>
              <div className="journal-metric-label">
                {metric_name} {metric_year}
              </div>
            </div>
          ) : (
            <div className="journal-metric-panel ms-md-auto mb-3">
              <span className="text-muted-custom">Chưa có dữ liệu ranking</span>
            </div>
          )}

          <div className="journal-action-row">
            <Button
              onClick={onFollow}
              disabled={isFollowing}
              className={`journal-outline-btn px-3 py-2 ${is_following ? 'is-active' : ''}`}
            >
              {isFollowing ? (
                <Spinner animation="border" size="sm" />
              ) : is_following ? (
                <>
                  <Icon icon="lucide:check" width="16" />
                  Đang theo dõi
                </>
              ) : (
                <>
                  <Icon icon="lucide:plus" width="16" />
                  Theo dõi
                </>
              )}
            </Button>

            <Button
              onClick={onAddToProject}
              disabled={isAddingToProject}
              className="btn-primary-glow d-flex align-items-center gap-2 px-3 py-2 text-white border-0"
              style={{ borderRadius: '6px' }}
            >
              {isAddingToProject ? (
                <Spinner animation="border" size="sm" variant="light" />
              ) : (
                <>
                  <Icon icon="lucide:folder-plus" width="16" />
                  Thêm vào Project
                </>
              )}
            </Button>
          </div>
        </Col>
      </Row>
    </section>
  );
}
