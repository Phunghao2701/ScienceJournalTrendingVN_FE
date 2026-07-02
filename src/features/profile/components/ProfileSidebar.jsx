/**
 * Sidebar hồ sơ: avatar, tên, vai trò, trạng thái và khối hoạt động.
 *
 * Lưu ý: các chỉ số hoạt động (dự án/từ khóa) hiện chưa có API thật,
 * nên hiển thị placeholder trung tính thay vì số liệu giả.
 */
export default function ProfileSidebar({ formData, user }) {
  const isActive = user?.is_active ?? true;

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

      <div className="role-badge">{formData.role || 'Nhà nghiên cứu'}</div>

      <div className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
        {isActive ? 'Active' : 'Inactive'}
      </div>

      <hr />

      <div className="activity-title">Hoạt động</div>

      <div className="stat-row">
        <span>Dự án đang theo dõi</span>
        <strong>—</strong>
      </div>

      <div className="stat-row">
        <span>Từ khóa đã lưu</span>
        <strong>—</strong>
      </div>
    </div>
  );
}
