import React from 'react';
import { Table } from 'react-bootstrap';
import RoleBadge from './RoleBadge';
import UserStatusBadge from './UserStatusBadge';
import Icon from '../../../../shared/components/Icon';
import { useTranslation } from 'react-i18next';

/**
 * UserTable Component
 * Renders the users list in a structured table.
 * 
 * @param {Object} props - Props
 * @param {Array} props.users - List of user objects
 * @param {function} props.onEdit - Edit action handler: (userId) => void
 * @param {function} props.onDelete - Delete action handler: (userId) => void
 */
export default function UserTable({ users = [], onEdit, onDelete }) {
  const { t } = useTranslation();
  if (users.length === 0) {
    return (
      <div className="text-center py-5 border rounded-3 bg-white">
        <Icon icon="lucide:users" width="48" className="text-muted mb-2 opacity-50" />
        <h6 className="text-main fw-bold">{t('accountNoUsersFound')}</h6>
        <p className="text-muted-custom small mb-0">{t('accountNoUsersHint')}</p>
      </div>
    );
  }

  return (
    <div className="table-responsive bg-white rounded-3 border">
      <Table className="align-middle mb-0" hover style={{ borderCollapse: 'collapse' }}>
        {/* Table Header */}
        <thead className="border-bottom text-muted-custom" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
          <tr>
            <th className="py-3 px-4 fw-bold text-uppercase" style={{ width: '45%', backgroundColor: '#f8fafc', color: '#64748b' }}>{t('accountUserProfile')}</th>
            <th className="py-3 px-3 fw-bold text-uppercase" style={{ width: '20%', backgroundColor: '#f8fafc', color: '#64748b' }}>{t('accountRole')}</th>
            <th className="py-3 px-3 fw-bold text-uppercase" style={{ width: '15%', backgroundColor: '#f8fafc', color: '#64748b' }}>{t('status')}</th>
            <th className="py-3 px-4 fw-bold text-uppercase text-end" style={{ width: '20%', backgroundColor: '#f8fafc', color: '#64748b' }}>{t('actions')}</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-bottom hover-row" style={{ height: '70px' }}>
              {/* Profile details column */}
              <td className="py-3 px-4">
                <div className="d-flex align-items-center gap-3">
                  {/* User profile picture */}
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 text-white fw-bold"
                    style={{
                      width: '42px',
                      height: '42px',
                      background: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
                      fontSize: '0.95rem',
                      boxShadow: '0 8px 18px rgba(234, 88, 12, 0.14)'
                    }}
                    aria-label={`Avatar chữ cái đầu của ${user.name || user.email || 'người dùng'}`}
                  >
                    {String(user.name || user.email || 'U').trim().charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="fw-bold text-main" style={{ fontSize: '0.9rem' }}>{user.name}</div>
                    <div className="text-muted-custom" style={{ fontSize: '0.78rem' }}>{user.email}</div>
                  </div>
                </div>
              </td>

              {/* Role badge column */}
              <td className="py-3 px-3">
                <RoleBadge role={user.role} />
              </td>

              {/* Status bullet column */}
              <td className="py-3 px-3">
                <UserStatusBadge status={user.status} />
              </td>

              {/* Action operations column */}
              <td className="py-3 px-4 text-end">
                <div className="d-flex align-items-center justify-content-end gap-2.5">
                  {/* Edit action */}
                  <button
                    type="button"
                    onClick={() => onEdit?.(user.id)}
                    className="btn btn-link p-1 text-decoration-none text-muted-custom hover-primary rounded-circle border-0 d-flex align-items-center justify-content-center"
                    style={{ width: '32px', height: '32px', transition: 'all 0.2s' }}
                    title={t('accountEditUser')}
                    aria-label={t('accountEditUser')}
                  >
                    <Icon icon="lucide:edit-2" width="16" />
                  </button>

                  {/* Delete action */}
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(t('accountConfirmDeleteUser', { name: user.name }))) {
                        onDelete?.(user.id);
                      }
                    }}
                    className="btn btn-link p-1 text-decoration-none text-muted-custom hover-danger rounded-circle border-0 d-flex align-items-center justify-content-center"
                    style={{ width: '32px', height: '32px', transition: 'all 0.2s' }}
                    title={t('accountDeleteUser')}
                    aria-label={t('accountDeleteUser')}
                  >
                    <Icon icon="lucide:trash-2" width="16" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
