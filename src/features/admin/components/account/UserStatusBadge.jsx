import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * UserStatusBadge Component
 * Renders user status with bullet indicators matching Page 3 mockup.
 * 
 * @param {Object} props - Props
 * @param {string} props.status - User status: 'Active', 'Inactive', 'Pending'
 */
export default function UserStatusBadge({ status }) {
  const { t } = useTranslation();
  // Map color points and font color values for statuses
  const statusConfig = {
    Active: {
      dotColor: 'var(--primary)',
      textColor: 'var(--primary)',
    },
    Inactive: {
      dotColor: 'var(--text-muted)',
      textColor: 'var(--text-muted)',
    },
    Pending: {
      dotColor: 'var(--primary)',
      textColor: 'var(--primary)',
    }
  };

  const config = statusConfig[status] || statusConfig.Pending;

  return (
    <div className="d-inline-flex align-items-center fw-medium text-xs" style={{ fontSize: '0.825rem', color: config.textColor, gap: '8px' }}>
      <span 
        className="rounded-circle d-inline-block" 
        style={{
          width: '6px',
          height: '6px',
          backgroundColor: config.dotColor,
        }}
      />
      <span>{t(`accountStatus${status}`, { defaultValue: status })}</span>
    </div>
  );
}
