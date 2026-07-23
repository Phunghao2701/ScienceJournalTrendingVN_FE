import { useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../../auth/hooks/useAuth';

const getInitials = (name) => {
  const parts = name?.split(/\s+/).filter(Boolean) || [];
  if (parts.length === 0) return 'RP';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts.at(-1)[0]}`.toUpperCase();
};

/**
 * Persistent workspace navigation for pages that live outside TrendingVNPage
 * but must keep the same ResearchPulse sidebar shell.
 */
export default function WorkspaceSidebar({ activeItem = 'collections' }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const userDisplayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') ||
      user.username ||
      user.email ||
      'Researcher'
    : 'Researcher';

  return (
    <>
      <aside className="tvn-left-sidebar" aria-label={t('sbWorkArea')}>
        <button
          type="button"
          className="tvn-sidebar-icon-btn"
          title={t('home')}
          onClick={() => navigate('/')}
        >
          <Icon icon="lucide:home" width="18" />
        </button>
        <button
          type="button"
          className="tvn-sidebar-icon-btn"
          title={t('articleSearch')}
          onClick={() => navigate('/articles')}
        >
          <Icon icon="lucide:chevron-right" width="18" />
        </button>
        <button
          type="button"
          className="tvn-sidebar-icon-btn"
          title={t('filtersLabel')}
          onClick={() => navigate('/articles')}
        >
          <Icon icon="lucide:filter" width="18" />
        </button>
        <button
          type="button"
          className={`tvn-sidebar-icon-btn ${isDrawerOpen ? 'active' : ''}`}
          title={t('sbWorkArea')}
          aria-expanded={isDrawerOpen}
          aria-controls="workspace-sidebar-drawer"
          onClick={() => setIsDrawerOpen((current) => !current)}
        >
          <Icon icon="lucide:user-cog" width="18" />
        </button>
      </aside>

      <aside
        id="workspace-sidebar-drawer"
        className={`tvn-expanded-sidebar ${isDrawerOpen ? 'is-open' : 'is-closed'}`}
        aria-label={t('sbWorkArea')}
        aria-hidden={!isDrawerOpen}
      >
        <div className="tvn-drawer-content">
          {isAuthenticated ? (
            <Dropdown className="w-100 workspace-profile-dropdown">
              <Dropdown.Toggle as="div" id="collections-profile-dropdown">
                <div className="tvn-profile-block">
                  <div className="tvn-profile-avatar">{getInitials(userDisplayName)}</div>
                  <div className="tvn-profile-info">
                    <div className="profile-name">{userDisplayName}</div>
                    <div className="profile-subtitle">
                      {t('personalAccount')}
                      <span className="text-danger workspace-license-note">
                        ({t('notCommercialUse')})
                      </span>
                    </div>
                  </div>
                  <Icon icon="lucide:chevron-down" width="16" className="text-muted ms-auto" />
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu className="w-100 text-xs shadow-sm workspace-profile-menu">
                <Dropdown.Item onClick={() => navigate('/profile')} className="d-flex align-items-center gap-2 py-2">
                  <Icon icon="lucide:user" width="14" />
                  <span>{t('profile') || 'Profile'}</span>
                </Dropdown.Item>
                <Dropdown.Divider className="my-1" />
                <Dropdown.Item onClick={() => logout()} className="d-flex align-items-center gap-2 py-2 text-danger">
                  <Icon icon="lucide:log-out" width="14" />
                  <span>{t('logoutLabel')}</span>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <button type="button" className="tvn-profile-block workspace-sign-in" onClick={() => navigate('/login')}>
              <div className="tvn-profile-avatar">
                <Icon icon="lucide:log-in" width="16" />
              </div>
              <div className="tvn-profile-info">
                <div className="profile-name text-primary fw-bold">{t('signIn')}</div>
              </div>
              <Icon icon="lucide:chevron-right" width="16" className="text-muted ms-auto" />
            </button>
          )}

          <div className="tvn-drawer-section-title">{t('sbWorkArea')}</div>
          <nav className="tvn-drawer-scrollable" aria-label={t('sbWorkArea')}>
            <button
              type="button"
              className={`tvn-drawer-item workspace-drawer-button ${activeItem === 'projects' ? 'active' : ''}`}
              onClick={() => navigate('/projects')}
              aria-current={activeItem === 'projects' ? 'page' : undefined}
            >
              <Icon icon="lucide:folder-kanban" width="16" className="item-icon" />
              <span className="item-label">{t('sbProjects')}</span>
              <Icon icon="lucide:chevron-right" width="12" className="item-arrow ms-auto" />
            </button>
            <button
              type="button"
              className={`tvn-drawer-item workspace-drawer-button ${activeItem === 'collections' ? 'active' : ''}`}
              onClick={() => navigate('/bookmarks')}
              aria-current={activeItem === 'collections' ? 'page' : undefined}
            >
              <Icon icon="lucide:folder" width="16" className="item-icon" />
              <span className="item-label">{t('sbCollections')}</span>
              <Icon icon="lucide:chevron-right" width="12" className="item-arrow ms-auto" />
            </button>
            <button
              type="button"
              className={`tvn-drawer-item workspace-drawer-button ${activeItem === 'dashboards' ? 'active' : ''}`}
              onClick={() => navigate('/')}
            >
              <Icon icon="lucide:bar-chart-2" width="16" className="item-icon" />
              <span className="item-label">{t('sbDashboards')}</span>
              <Icon icon="lucide:chevron-right" width="12" className="item-arrow ms-auto" />
            </button>
          </nav>
        </div>
      </aside>
    </>
  );
}
