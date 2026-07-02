/**
 * File: shared/constants/mockData.js
 * Centralized fallback/placeholder data used when real API endpoints are unavailable.
 * These are NOT used in production API flows — they stand in during development or
 * when a BE endpoint is missing. Each export documents which API it replaces.
 */

// Placeholder users for the Admin User Directory (admin/pages/account/UserDirectoryPage.jsx).
// Replaces GET /api/v1/admin/users when the endpoint is unavailable.
export const MOCK_USERS = [
  {
    id: '1',
    first_name: 'Elena',
    last_name: 'Smith',
    name: 'Dr. Elena Smith',
    email: 'e.smith@university-press.edu',
    phone: '+1 (555) 012-3456',
    institution: 'Oxford University Press',
    role: 'Researcher',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100',
    created_at: '2023-10-15',
  },
  {
    id: '2',
    first_name: 'Julian',
    last_name: 'Lee',
    name: 'Julian Lee',
    email: 'julian.lee@scholar.net',
    phone: '+1 (555) 987-6543',
    institution: 'MIT Research Lab',
    role: 'Lecturer',
    status: 'Inactive',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100',
    created_at: '2024-01-20',
  },
  {
    id: '3',
    first_name: 'Ava',
    last_name: 'Martinez',
    name: 'Ava Martinez',
    email: 'a.martinez@university.edu',
    phone: '+1 (555) 456-7890',
    institution: 'Stanford University',
    role: 'Student',
    status: 'Pending',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
    created_at: '2024-05-12',
  },
  {
    id: '4',
    first_name: 'Sarah',
    last_name: 'Meyer',
    name: 'Sarah Meyer',
    email: 's.meyer@bio-science.com',
    phone: '+1 (555) 321-6540',
    institution: 'Bio-Science Monthly',
    role: 'Editor',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100',
    created_at: '2023-04-05',
  },
  {
    id: '5',
    first_name: 'David',
    last_name: 'Wu',
    name: 'David Wu',
    email: 'd.wu@physics-archives.org',
    phone: '+1 (555) 789-0123',
    institution: 'Physics Archives',
    role: 'Researcher',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
    created_at: '2023-08-30',
  }
];

// Placeholder pending role-upgrade requests shown in the admin sidebar.
// Consumed by admin/components/account/PendingRequestCard.jsx as a UI placeholder.
export const MOCK_REQUESTS = [
  {
    id: 'r1',
    name: 'Sarah Meyer',
    roleRequested: 'Editor',
    institution: 'BIO-SCIENCE MONTHLY',
    avatar: 'SM',
    status: 'Pending',
  },
  {
    id: 'r2',
    name: 'David Wu',
    roleRequested: 'Researcher',
    institution: 'PHYSICS ARCHIVES',
    avatar: 'DW',
    status: 'Pending',
  }
];

// Fallback subject area categories when GET /api/v1/topics (or equivalent) is unavailable.
// Used by filter dropdowns in article submission and filter bar components.
export const MOCK_CATEGORIES = [
  { id: 1, name: 'Computer Science' },
  { id: 2, name: 'Medicine & Health' },
  { id: 3, name: 'Physics & Astronomy' },
  { id: 4, name: 'Biotechnology' }
];

// Fallback journal list when GET /api/v1/journals is unavailable.
// Used by journal selection dropdowns in article filter and submission forms.
export const MOCK_JOURNALS = [
  { id: 1, title: 'Bio-Science Monthly', name: 'Bio-Science Monthly' },
  { id: 2, title: 'Physics Archives', name: 'Physics Archives' },
  { id: 3, title: 'IEEE Transactions', name: 'IEEE Transactions' }
];
