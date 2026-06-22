/**
 * - status:          giá trị hiện tại (ARTICLE_REVIEW_STATUS), điều khiển
 *                     cả badge "Current Status" và dropdown.
 * - onChangeStatus:  handler khi đổi dropdown.
 * - stats:           { wordCount, referencesCount, reviewersAssigned, reviewersTotal, lastUpdated }
 * - onUpdate:        handler nút "Update Article".
 * - onCancel:        handler nút "Cancel Changes".
 * - onDelete:        handler nút "Delete Article" (mở confirm modal ở page cha).
 */
import { ARTICLE_REVIEW_STATUS_STYLE, ARTICLE_STATUS_OPTIONS } from '../../constants/articleStatus';

export default function ReviewStatusPanel({ status, onChangeStatus, stats, onUpdate, onCancel, onDelete }) {
  // Tra label hiển thị cho badge "Current Status" theo status hiện tại
  const currentStatusStyle = ARTICLE_REVIEW_STATUS_STYLE[status] || {
    label: status,
    className: 'status-badge--archived',
  };

  return (
    <div className="admin-review-panel">
      {/* Khối "Current Status" - nền tối, chữ trắng, nổi bật nhất panel */}
      <div className="admin-review-panel__current-status">
        <span className="admin-review-panel__current-status-label">Current Status</span>
        <span className="admin-review-panel__current-status-value">{currentStatusStyle.label}</span>
      </div>

      <div className="admin-review-panel__body">
        {/* Update Status dropdown */}
        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="article-update-status">
            Update Status
          </label>
          <select
            id="article-update-status"
            className="admin-form-input admin-form-select"
            value={status}
            onChange={(e) => onChangeStatus(e.target.value)}
          >
            {ARTICLE_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Statistics */}
        <div className="admin-review-panel__stats">
          <span className="admin-review-panel__stats-title">Quick Statistics</span>

          <div className="admin-review-panel__stat-row">
            <span className="admin-review-panel__stat-label">Words Count</span>
            <span className="admin-review-panel__stat-value">{stats.wordCount.toLocaleString('en-US')}</span>
          </div>
          <div className="admin-review-panel__stat-row">
            <span className="admin-review-panel__stat-label">References</span>
            <span className="admin-review-panel__stat-value">{stats.referencesCount}</span>
          </div>
          <div className="admin-review-panel__stat-row">
            <span className="admin-review-panel__stat-label">Reviewers Assigned</span>
            <span className="admin-review-panel__stat-value">
              {stats.reviewersAssigned}/{stats.reviewersTotal}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <button type="button" className="admin-btn admin-btn--primary" onClick={onUpdate}>
          Update Article
        </button>
        <button type="button" className="admin-btn admin-btn--outline" onClick={onCancel}>
          Cancel Changes
        </button>

        {/* Last updated info */}
        <p className="admin-review-panel__last-updated">Last updated: {stats.lastUpdated}</p>

        {/* Delete Article - tách riêng bằng đường kẻ để nhấn mạnh đây là
            hành động phá hủy, khác nhóm với Update/Cancel ở trên */}
        <hr className="admin-review-panel__divider" />
        <button type="button" className="admin-btn admin-btn--danger" onClick={onDelete}>
          Delete Article
        </button>
      </div>
    </div>
  );
}