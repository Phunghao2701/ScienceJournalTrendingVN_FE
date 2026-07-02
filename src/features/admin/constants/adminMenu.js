/**
 * Admin sidebar navigation menu definition.
 *
 * File: src/features/admin/constants/adminMenu.js
 */
import ROUTES from '../../../app/routes/routePaths';

const ADMIN_MENU = [
  // Overview page: Total Journals, Total Articles, Pending Reviews, Active Users,
  // Publication Trends chart, Recent Activity, and Volume & Issue Overview table.
  { key: 'dashboard', label: 'Dashboard', icon: 'lucide:layout-dashboard', path: ROUTES.ADMIN_DASHBOARD },

  // Journal directory management (extended in a separate issue).
  { key: 'journals', label: 'Journals', icon: 'lucide:book-open', path: ROUTES.ADMIN_JOURNALS },

  // Article Repository and Update Article pages (Issue 1 -- remaining scope).
  { key: 'articles', label: 'Articles', icon: 'lucide:file-text', path: ROUTES.ADMIN_ARTICLES },

  // Volume/Issue management (shares journal context with the Journals section).
  { key: 'volumes', label: 'Volumes', icon: 'lucide:layers', path: ROUTES.ADMIN_REPOSITORY },

  // Admin account page (password change, personal info, etc.).
  { key: 'account', label: 'Account', icon: 'lucide:user', path: ROUTES.ADMIN_USERS },
];

export default ADMIN_MENU;
