import Icon from '../../../shared/components/Icon';
import { useAuthStore } from '../../../app/store/authStore';

export default function AdminHeader() {
  const user = useAuthStore((state) => state.user);
  
  const name = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Admin User';
  const role = user?.role || 'Administrator';
  const avatarUrl = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=random';
  const notificationCount = 0;

  return (
    <header className="admin-header">
      {/* Search bar bên trái - chỉ UI, chưa gắn logic search thật */}
      <div className="admin-header__search">
        <Icon icon="lucide:search" />
        <input type="text" placeholder="Search journals, articles..." />
      </div>

      {/* Khu vực icon + profile bên phải */}
      <div className="admin-header__actions">
        {/* Icon thông báo - hiển thị badge đỏ nếu có notification chưa đọc */}
        <button type="button" className="admin-header__icon-btn" aria-label="Notifications">
          <Icon icon="lucide:bell" />
          {notificationCount > 0 && <span className="admin-header__icon-badge" />}
        </button>

        {/* Icon settings */}
        <button type="button" className="admin-header__icon-btn" aria-label="Settings">
          <Icon icon="lucide:settings" />
        </button>

        {/* Profile admin */}
        <div className="admin-header__profile">
          <img src={avatarUrl} alt={name} className="admin-header__avatar" />
          <div className="admin-header__profile-info">
            <span className="admin-header__profile-name">{name}</span>
            <span className="admin-header__profile-role">{role}</span>
          </div>
        </div>
      </div>
    </header>
  );
}