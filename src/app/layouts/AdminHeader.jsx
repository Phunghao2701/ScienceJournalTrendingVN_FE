import React from 'react';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import Icon from '../../shared/components/Icon';

/**
 * AdminHeader Component
 * Renders the top search & user profile bar matching the mockups.
 */
export default function AdminHeader() {
  const user = useAuthStore((state) => state.user);
  const email = useUserStore((state) => state.email) || 'admin@researchpulse.org';
  const name = email.split('@')[0];
  const formattedName = name.charAt(0).toUpperCase() + name.slice(1);

  const displayName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || formattedName : formattedName;

  let displayRole = 'Journal Editor';
  if (user?.role) {
    if (user.role.toLowerCase() === 'admin') {
      displayRole = 'System Administrator';
    } else if (user.role.toLowerCase() === 'editor') {
      displayRole = 'Journal Editor';
    } else {
      displayRole = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    }
  }

  return (
    <header className="admin-header">
      {/* Search Bar matching Page 3: "Search manuscripts, authors, or IDs..." */}
      <label className="admin-header__search" htmlFor="admin-global-search">
        <Icon icon="lucide:search" width="16" />
        <input
          id="admin-global-search"
          type="text"
          placeholder="Search manuscripts, authors, or IDs..."
        />
      </label>

      {/* Right control utilities and profile section */}
      <div className="admin-header__actions">
        {/* Notification Icon */}
        <button type="button" className="admin-header__icon-btn" aria-label="Notifications">
          <Icon icon="lucide:bell" width="20" />
          <span className="admin-header__icon-badge" />
        </button>

        {/* Settings Icon */}
        <button type="button" className="admin-header__icon-btn" aria-label="Settings">
          <Icon icon="lucide:settings" width="20" />
        </button>

        {/* User profile section matching mockup format */}
        <div className="admin-header__profile">
          <div className="admin-header__profile-info">
            <span className="admin-header__profile-name">{displayName}</span>
            <span className="admin-header__profile-role">{displayRole}</span>
          </div>
          {/* Avatar fallback initials */}
          <div className="admin-header__avatar" aria-label={displayName}>
            {displayName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
