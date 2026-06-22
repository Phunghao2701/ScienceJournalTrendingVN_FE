import { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

export default function ActivityTimeline({ items = [], loading = false, error = '' }) {
  const [showAll, setShowAll] = useState(false);
  const safeItems = Array.isArray(items) ? items : [];

  const renderActivityItem = (item) => {
    const activityType = item.type || 'reviewer';

    return (
      <li key={item.id} className="admin-activity-item">
        <span className={`admin-activity-item__dot admin-activity-item__dot--${activityType}`} />

        <div className="admin-activity-item__content">
          <p className="admin-activity-item__title">{item.title}</p>
          <p className="admin-activity-item__description">{item.description}</p>
          <span className="admin-activity-item__time">{item.time}</span>
        </div>
      </li>
    );
  };

  return (
    <div className="admin-card admin-activity-card">
      <h3 className="admin-card__title mb-3">Recent Activity</h3>

      {loading ? (
        <p className="admin-muted-text mb-0">Đang tải hoạt động gần đây...</p>
      ) : error ? (
        <p className="admin-error-text mb-0">{error}</p>
      ) : safeItems.length === 0 ? (
        <p className="admin-muted-text mb-0">Chưa có hoạt động gần đây.</p>
      ) : (
        <>
          <ul className="admin-activity-list">
            {safeItems.slice(0, 4).map(renderActivityItem)}
          </ul>

          <button
            type="button"
            className="admin-link-button admin-activity-card__view-all"
            onClick={() => setShowAll(true)}
          >
            View All Activity
          </button>
        </>
      )}

      <Modal show={showAll} onHide={() => setShowAll(false)} centered size="lg" className="admin-activity-modal text-main">
        <Modal.Header closeButton className="border-bottom-0 pb-0">
          <div>
            <Modal.Title className="font-display fw-bold h4 text-main mb-1">All Activity</Modal.Title>
            <small className="text-muted-custom">Full editorial activity log for the admin dashboard.</small>
          </div>
        </Modal.Header>
        <Modal.Body className="pt-3">
          {safeItems.length === 0 ? (
            <p className="admin-muted-text mb-0">Chưa có hoạt động gần đây.</p>
          ) : (
            <ul className="admin-activity-list admin-activity-list--modal">
              {safeItems.map(renderActivityItem)}
            </ul>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top-0 pt-0">
          <Button className="btn-primary-glow px-4" onClick={() => setShowAll(false)}>
            Done
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}