import { useTranslation } from 'react-i18next';
import Icon from '../../../shared/components/Icon';

/**
 * Sidebar hồ sơ: avatar, tên, vai trò, trạng thái và khối hoạt động.
 *
 * Lưu ý: các chỉ số hoạt động (dự án/từ khóa) hiện chưa có API thật,
 * nên hiển thị placeholder trung tính thay vì số liệu giả.
 */
export default function ProfileSidebar({ formData, user, onLogout }) {
  const isActive = user?.is_active ?? true;
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage?.startsWith('vi');

  const researcherText = isVi ? 'Nhà nghiên cứu' : 'Researcher';
  const activeText = isVi ? 'Đang hoạt động' : 'Active';
  const inactiveText = isVi ? 'Không hoạt động' : 'Inactive';
  const activityText = isVi ? 'Hoạt động' : 'Activity';
  const watchedProjectsText = isVi ? 'Dự án đang theo dõi' : 'Watched projects';
  const savedKeywordsText = isVi ? 'Từ khóa đã lưu' : 'Saved keywords';
  const logoutText = isVi ? 'Đăng xuất' : 'Log out';

  return (
    <div className="profile-sidebar">
      <div className="avatar">
        {formData.url_image ? (
          <img
            src={formData.url_image}
            alt="avatar"
            className="avatar-image"
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextElementSibling) {
                e.target.nextElementSibling.style.display = 'flex';
              }
            }}
          />
        ) : (
          <span
            className="avatar-initials"
            style={{ display: formData.url_image ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {formData.first_name
              ? formData.first_name.charAt(0).toUpperCase()
              : formData.last_name
              ? formData.last_name.charAt(0).toUpperCase()
              : 'U'}
          </span>
        )}
      </div>

      <h2>
        {formData.last_name} {formData.first_name}
      </h2>

      <div className="role-badge">{formData.role || researcherText}</div>

      <div className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
        {isActive ? activeText : inactiveText}
      </div>

      <hr />

      <div className="activity-title">{activityText}</div>

      <div className="stat-row">
        <span>{watchedProjectsText}</span>
        <strong>—</strong>
      </div>

      <div className="stat-row">
        <span>{savedKeywordsText}</span>
        <strong>—</strong>
      </div>

      <hr />

      <button className="sidebar-logout-btn" onClick={onLogout} type="button">
        <Icon icon="lucide:log-out" width="16" />
        {logoutText}
      </button>
    </div>
  );
}
