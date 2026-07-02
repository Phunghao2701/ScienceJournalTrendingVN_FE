/**
 * File: shared/constants/systemConstants.js
 * Centralized role and account-status constants — import these instead of
 * hardcoding raw strings like 'RESEARCHER' or 'Active' across components.
 */

/**
 * All user roles recognized by the ResearchPulse system.
 * Consumed by role dropdowns (registration form, admin account form) and RoleBadge component.
 * Values must match the role strings expected by the BE auth and user management endpoints.
 */
export const SYSTEM_ROLES = [
  { value: 'RESEARCHER', label: 'Researcher' },
  { value: 'LECTURER', label: 'Lecturer' },
  { value: 'STUDENT', label: 'Student' },
  { value: 'ADMINISTRATOR', label: 'Administrator' }
];

/**
 * Possible status values for a user account in the ResearchPulse system.
 *   Active   - account is fully operational
 *   Inactive - account disabled by an administrator
 *   Pending  - account registered but awaiting admin approval
 * Labels intentionally contain Vietnamese text — displayed as-is in the admin UI dropdowns.
 */
export const ACCOUNT_STATUSES = [
  { value: 'Active', label: 'Hoạt động (Active)' },
  { value: 'Inactive', label: 'Vô hiệu hóa (Inactive)' },
  { value: 'Pending', label: 'Chờ duyệt (Pending)' }
];

