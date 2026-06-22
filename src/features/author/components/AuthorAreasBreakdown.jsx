/**
 * @file AuthorAreasBreakdown.jsx
 * @description Hiển thị trực quan hóa tỷ lệ phần trăm phân bổ các bài báo xuất bản của tác giả.
 */

import { Row, Col, Card } from 'react-bootstrap';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import EmptyState from '../../../shared/components/EmptyState';

export default function AuthorAreasBreakdown({ breakdown = [], loading = false, error = null }) {
  const breakdownItems = Array.isArray(breakdown) ? breakdown : [];
  const maxVisibleAreas = 5;
  const sortedBreakdownItems = [...breakdownItems].sort(
    (a, b) => (Number(b.percentage ?? b.percent ?? 0) || 0) - (Number(a.percentage ?? a.percent ?? 0) || 0)
  );
  const visibleBreakdownItems = sortedBreakdownItems.slice(0, maxVisibleAreas);
  const hiddenBreakdownCount = Math.max(0, sortedBreakdownItems.length - maxVisibleAreas);
  const hiddenArticleCount = sortedBreakdownItems
    .slice(maxVisibleAreas)
    .reduce((sum, item) => sum + (Number(item.count ?? item.article_count ?? 0) || 0), 0);

  if (loading) {
    return (
      <Card className="author-areas-card">
        <h5 className="author-section-title mb-4">Phân bổ lĩnh vực nghiên cứu</h5>
        <Row className="align-items-center">
          <Col xs={12} md={5} className="d-flex justify-content-center mb-3 mb-md-0">
            <div className="skeleton-shimmer rounded-circle author-areas-skeleton-chart" />
          </Col>
          <Col xs={12} md={7}>
            <div className="d-flex flex-column gap-3">
              <LoadingSkeleton width="90%" height="28px" />
              <LoadingSkeleton width="80%" height="28px" />
              <LoadingSkeleton width="70%" height="28px" />
            </div>
          </Col>
        </Row>
      </Card>
    );
  }

  if (error || breakdownItems.length === 0) {
    return (
      <Card className="author-areas-card">
        <h5 className="author-section-title mb-3">Phân bổ lĩnh vực nghiên cứu</h5>
        <EmptyState
          title="Chưa có dữ liệu phân bổ"
          description="Chưa có dữ liệu phân bổ lĩnh vực nghiên cứu của tác giả này."
          icon="lucide:pie-chart"
          className="border-0 py-4"
        />
      </Card>
    );
  }

  const colors = ['#FF7A33', '#6366F1', '#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercentage = 0;

  return (
    <Card className="author-areas-card">
      <h5 className="author-section-title mb-4">📊 Phân bổ lĩnh vực nghiên cứu</h5>

      <Row className="align-items-center">
        <Col xs={12} md={5} className="d-flex justify-content-center mb-4 mb-md-0">
          <div className="author-areas-chart">
            <svg width="180" height="180" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r={radius} fill="transparent" stroke="var(--bg-section)" strokeWidth="14" />
              {visibleBreakdownItems.map((item, idx) => {
                const strokeColor = colors[idx % colors.length];
                const pct = item.percentage ?? 0;
                const dashArray = `${(pct / 100) * circumference} ${circumference}`;
                const dashOffset = -((accumulatedPercentage / 100) * circumference);
                accumulatedPercentage += pct;

                return (
                  <circle
                    key={idx}
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="transparent"
                    stroke={strokeColor}
                    strokeWidth="15"
                    strokeDasharray={dashArray}
                    strokeDashoffset={dashOffset}
                    className="author-areas-slice"
                  />
                );
              })}
            </svg>
            <div className="author-areas-center">
              <span className="author-areas-center-label">Lĩnh vực</span>
              <span className="author-areas-center-value">{breakdownItems.length}</span>
            </div>
          </div>
        </Col>

        <Col xs={12} md={7}>
          <div className="author-areas-list">
            {visibleBreakdownItems.map((item, idx) => {
              const color = colors[idx % colors.length];
              const name = item.subject_area ?? item.category_name ?? item.subject_area_name ?? item.display_name ?? item.name ?? 'Chưa phân loại';
              const pct = item.percentage ?? 0;
              const count = item.count ?? item.article_count ?? 0;

              return (
                <div key={idx}>
                  <div className="author-areas-item-head">
                    <div className="author-areas-item-name">
                      <span className="author-areas-dot" style={{ backgroundColor: color }} />
                      <span className="text-truncate">{name}</span>
                    </div>
                    <div className="author-areas-item-stats">
                      <span>{count} bài báo</span>
                      <span>•</span>
                      <span className="text-main">{pct}%</span>
                    </div>
                  </div>
                  <div className="author-areas-progress">
                    <div className="author-areas-progress-fill" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            })}

            {hiddenBreakdownCount > 0 && (
              <div className="author-areas-more">
                … còn {hiddenBreakdownCount} lĩnh vực khác{hiddenArticleCount ? ` (${hiddenArticleCount} bài báo)` : ''}
              </div>
            )}
          </div>
        </Col>
      </Row>
    </Card>
  );
}
