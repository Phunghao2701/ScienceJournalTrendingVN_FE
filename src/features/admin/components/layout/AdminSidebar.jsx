import { NavLink, useLocation } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import ADMIN_MENU from '../constants/adminMenu';
import { useTranslation } from 'react-i18next';

export default function AdminSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const isPreview = location.pathname.startsWith('/admin-preview');

  // Hàm chuyển đổi đường dẫn nếu đang ở chế độ xem thử (preview)
  const getPath = (path) => {
    if (isPreview) {
      return path.replace('/admin', '/admin-preview');
    }
    return path;
  };

  return (
    <aside className="admin-sidebar">
      {/* Logo / tên hệ thống - dùng font-display theo quy tắc DESIGN_SYSTEM */}
      <div>
        <div className="admin-sidebar__brand">
          <span className="admin-sidebar__brand-icon">
            <Icon icon="lucide:activity" />
          </span>
          <span>ResearchPulse</span>
        </div>

        {/* Danh sách menu chính - map từ ADMIN_MENU để dễ thêm/sửa */}
        <nav className="admin-sidebar__menu">
          {(ADMIN_MENU || []).map((item) => (
            <NavLink
              key={item.key}
              to={getPath(item.path)}
              // NavLink tự thêm class "active" khi path khớp,
              // ta map sang class riêng để style theo design token
              className={({ isActive }) =>
                `admin-sidebar__item${isActive ? ' admin-sidebar__item--active' : ''}`
              }
            >
              <Icon icon={item.icon} className="admin-sidebar__item-icon" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Khu vực dưới cùng: Support + Sign Out */}
      <div className="admin-sidebar__footer">
        <a href="#support" className="admin-sidebar__item">
          <Icon icon="lucide:help-circle" className="admin-sidebar__item-icon" />
          <span>{t('support')}</span>
        </a>
        <a href="/login" className="admin-sidebar__item">
          <Icon icon="lucide:log-out" className="admin-sidebar__item-icon" />
          <span>{t('logoutLabel')}</span>
        </a>
      </div>
    </aside>
  );
}
