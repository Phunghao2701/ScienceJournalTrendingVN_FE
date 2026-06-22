import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import Icon from '../../../../shared/components/Icon';
import { SYSTEM_ROLES, ACCOUNT_STATUSES } from '../../../../shared/constants/systemConstants';

/**
 * UserFilterBar Component
 * Renders filter controls for searching and filtering the user directory.
 * 
 * @param {Object} props - Props
 * @param {string} props.search - Current search text
 * @param {function} props.onSearchChange - Search input change handler
 * @param {string} props.selectedRole - Selected role filter value
 * @param {function} props.onRoleChange - Role filter dropdown change handler
 * @param {string} props.selectedStatus - Selected status filter value
 * @param {function} props.onStatusChange - Status filter dropdown change handler
 * @param {number} props.totalCount - Total matching users count
 */
export default function UserFilterBar({
  search,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
  totalCount
}) {
  return (
    <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
      {/* Left section: Contributor count */}
      <div className="d-flex align-items-center" style={{ gap: '12px' }}>
        <span className="fw-bold text-main" style={{ fontSize: '1.1rem' }}>All Contributors</span>
        <span 
          className="rounded-pill px-3 py-1 text-xs fw-semibold d-inline-block text-white" 
          style={{
            backgroundColor: '#ea580c',
            fontSize: '0.75rem',
            lineHeight: '1.2'
          }}
        >
          {totalCount} {totalCount === 1 ? 'User' : 'Users'}
        </span>
      </div>

      {/* Right section: Search input and selectors */}
      <div className="d-flex flex-wrap gap-2.5 align-items-center">
        {/* Search Field */}
        <div 
          className="d-flex align-items-center gap-2 px-3 py-1 rounded-3"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            minWidth: '220px',
          }}
        >
          <Icon icon="lucide:search" width="16" style={{ color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by name/email..." 
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="border-0 bg-transparent text-main w-100"
            style={{ outline: 'none', fontSize: '0.85rem' }}
          />
        </div>

        {/* Filter by Role Dropdown */}
        <Form.Select
          size="sm"
          value={selectedRole}
          onChange={(e) => onRoleChange(e.target.value)}
          className="form-control rounded-3"
          style={{
            width: '130px',
            height: '34px',
            borderColor: 'var(--border)',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          <option value="all">All Roles</option>
          {SYSTEM_ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </Form.Select>

        {/* Lọc theo trạng thái tài khoản - Lấy động từ hằng số hệ thống */}
        <Form.Select
          size="sm"
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="form-control rounded-3"
          style={{
            width: '130px',
            height: '34px',
            borderColor: 'var(--border)',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          <option value="all">All Statuses</option>
          {ACCOUNT_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.value}
            </option>
          ))}
        </Form.Select>

        {/* Clear Filters indicator */}
        {(search || selectedRole !== 'all' || selectedStatus !== 'all') && (
          <button 
            type="button"
            onClick={() => {
              onSearchChange('');
              onRoleChange('all');
              onStatusChange('all');
            }}
            className="btn btn-link p-0 text-decoration-none text-muted-custom hover-primary d-flex align-items-center gap-1"
            style={{ fontSize: '0.85rem' }}
          >
            <Icon icon="lucide:x-circle" width="16" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
