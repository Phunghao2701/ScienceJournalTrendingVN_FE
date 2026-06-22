import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import Icon from '../../shared/components/Icon';
import Logo from '../../shared/components/Logo';
import useAuth from '../../features/auth/hooks/useAuth';
import ROUTES from '../routes/routePaths';

/**
 * AdminSidebar Component
 * Render thanh điều hướng sidebar bên trái của trang Admin theo mẫu thiết kế.
 */
export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const auth = useAuth() ?? { logout: () => {} };

  // Danh sách các mục menu trên sidebar - Sử dụng ROUTES thay vì hardcode
  const menuItems = [
    { label: 'Dashboard', path: ROUTES.ADMIN_DASHBOARD, icon: 'lucide:layout-dashboard' },
    { label: 'Journals', path: ROUTES.ADMIN_JOURNALS, icon: 'lucide:book-open' },
    { label: 'Articles', path: ROUTES.ADMIN_ARTICLES, icon: 'lucide:file-text' },
    { label: 'Volumes', path: ROUTES.ADMIN_REPOSITORY, icon: 'lucide:layers' },
    { label: 'Account', path: ROUTES.ADMIN_USERS, icon: 'lucide:user' },
  ];

  /**
   * Kiểm tra xem mục menu hiện tại có đang active (được chọn) hay không.
   */
  const isActive = (itemPath) => {
    if (itemPath === ROUTES.ADMIN_JOURNALS) {
      // Journals chỉ active khi ở /admin/journals hoặc các subpath mà không phải repository
      return pathname === ROUTES.ADMIN_JOURNALS || (pathname.startsWith(ROUTES.ADMIN_JOURNALS) && !pathname.startsWith(ROUTES.ADMIN_REPOSITORY));
    }
    if (itemPath === ROUTES.ADMIN_DASHBOARD) {
      return pathname === ROUTES.ADMIN_DASHBOARD;
    }
    return pathname.startsWith(itemPath);
  };

  return (
    <aside className="admin-sidebar" aria-label="Admin navigation">
      <div>
        {/* Brand Logo header */}
        <div className="admin-sidebar__brand-wrap">
          <Logo onClick={() => navigate('/')} />
        </div>

        {/* Navigation Link Items */}
        <Nav className="admin-sidebar__menu">
          {menuItems.map((item, idx) => {
            const active = isActive(item.path);
            return (
              <Nav.Link
                key={idx}
                onClick={() => navigate(item.path)}
                className={`admin-sidebar__item sidebar-link ${active ? 'admin-sidebar__item--active' : ''}`}
              >
                <Icon icon={item.icon} width="18" className="admin-sidebar__item-icon" />
                <span>{item.label}</span>
              </Nav.Link>
            );
          })}
        </Nav>
      </div>

      {/* Footer-aligned items inside the sidebar */}
      <Nav className="admin-sidebar__footer">
        {/* Support Link */}
        <Nav.Link
          onClick={() => navigate(ROUTES.DASHBOARD)}
          className="admin-sidebar__item"
        >
          <Icon icon="lucide:help-circle" width="18" className="admin-sidebar__item-icon" />
          <span>Support</span>
        </Nav.Link>

        {/* Sign Out Button */}
        <Nav.Link
          onClick={() => auth.logout()}
          className="admin-sidebar__item admin-sidebar__item--danger"
        >
          <Icon icon="lucide:log-out" width="18" className="admin-sidebar__item-icon" />
          <span>Sign Out</span>
        </Nav.Link>
      </Nav>
    </aside>
  );
}
