import { create } from 'zustand';
import { MOCK_USERS, MOCK_REQUESTS } from '../../shared/constants/mockData';

/**
 * Zustand store for admin-side user management and article drafts.
 * Manages: user directory, pending role-upgrade requests, and local article drafts.
 *
 * NOTE: All state here is in-memory mock data (seeded from shared/constants/mockData.js)
 * and is NOT connected to any BE API. This store is UI-layer only.
 * When a real admin users API is wired up, replace these methods with async actions
 * that call admin/api/adminUsers.api.js instead.
 */
export const useAdminStore = create((set) => ({
  users: MOCK_USERS,
  pendingRequests: MOCK_REQUESTS,
  drafts: [], // holds user's local drafts

  /**
   * Adds a new user to the in-memory mock directory (not persisted to BE).
   * id derived from array length — not collision-safe, acceptable for mock-only use.
   */
  addUser: (userData) => set((state) => {
    const newUser = {
      id: String(state.users.length + 1),
      name: `${userData.first_name} ${userData.last_name}`,
      created_at: new Date().toISOString().split('T')[0],
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100', // generic placeholder; real flow would use uploaded avatar URL
      ...userData,
    };
    return { users: [...state.users, newUser] };
  }),

  /**
   * Updates an existing user record in the mock directory.
   * Re-derives `name` from first_name/last_name so the display name stays in sync.
   */
  updateUser: (userId, updatedData) => set((state) => ({
    users: state.users.map((u) => {
      if (u.id === userId) {
        // Ensure name is synced if first/last name changes
        const first = updatedData.first_name ?? u.first_name;
        const last = updatedData.last_name ?? u.last_name;
        return {
          ...u,
          ...updatedData,
          name: `${first} ${last}`.trim(),
        };
      }
      return u;
    }),
  })),

  /**
   * Remove a user from the directory.
   */
  deleteUser: (userId) => set((state) => ({
    users: state.users.filter((u) => u.id !== userId),
  })),

  /**
   * Approves a pending role-upgrade request.
   * If the requester exists in the user list: updates their role and sets status to Active.
   * If not: creates a minimal user record with a placeholder email derived from first name.
   * Both branches are mock-only — real approval would POST to a BE endpoint.
   */
  approveRequest: (requestId) => set((state) => {
    const req = state.pendingRequests.find((r) => r.id === requestId);
    if (!req) return state;

    // Check if the user already exists in users database
    const userExists = state.users.find((u) => u.name === req.name);
    let updatedUsers = [...state.users];

    if (userExists) {
      // Update their role and status to active
      updatedUsers = updatedUsers.map((u) => 
        u.name === req.name ? { ...u, role: req.roleRequested, status: 'Active' } : u
      );
    } else {
      // Create new user record
      const names = req.name.split(' ');
      const newUser = {
        id: String(state.users.length + 1),
        first_name: names[0] || '',
        last_name: names.slice(1).join(' ') || '',
        name: req.name,
        email: `${names[0]?.toLowerCase()}@example.com`,
        phone: '+1 (555) 000-0000',
        institution: req.institution,
        role: req.roleRequested,
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
        created_at: new Date().toISOString().split('T')[0],
      };
      updatedUsers.push(newUser);
    }

    return {
      users: updatedUsers,
      pendingRequests: state.pendingRequests.filter((r) => r.id !== requestId),
    };
  }),

  /**
   * Decline a pending role request.
   */
  declineRequest: (requestId) => set((state) => ({
    pendingRequests: state.pendingRequests.filter((r) => r.id !== requestId),
  })),

  /**
   * Upserts a local article draft (not persisted to BE or localStorage).
   * Matches by draftData.id — assigns Date.now() as id for new drafts.
   */
  saveDraft: (draftData) => set((state) => {
    // Overwrite existing draft by id, or append as new with timestamp id.
    const existingIdx = state.drafts.findIndex((d) => d.id === draftData.id);
    if (existingIdx >= 0) {
      const updatedDrafts = [...state.drafts];
      updatedDrafts[existingIdx] = draftData;
      return { drafts: updatedDrafts };
    }
    return { drafts: [...state.drafts, { ...draftData, id: String(Date.now()) }] };
  }),
}));
