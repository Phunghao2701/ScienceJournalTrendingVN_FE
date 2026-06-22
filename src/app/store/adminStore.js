import { create } from 'zustand';
import { MOCK_USERS, MOCK_REQUESTS } from '../../shared/constants/mockData';

/**
 * Zustand admin store
 * Quản lý trạng thái danh sách thành viên (users), yêu cầu nâng quyền (pendingRequests) và nháp bài viết (drafts).
 * Đã cấu trúc lại để đọc dữ liệu khởi tạo từ mockData.js nhằm tuân thủ quy tắc chất lượng mã nguồn.
 */
export const useAdminStore = create((set) => ({
  users: MOCK_USERS,
  pendingRequests: MOCK_REQUESTS,
  drafts: [], // holds user's local drafts

  /**
   * Add a new user to the mock users directory.
   */
  addUser: (userData) => set((state) => {
    const newUser = {
      id: String(state.users.length + 1),
      name: `${userData.first_name} ${userData.last_name}`,
      created_at: new Date().toISOString().split('T')[0],
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
      ...userData,
    };
    return { users: [...state.users, newUser] };
  }),

  /**
   * Update details of an existing user.
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
   * Approve a pending role request. Adds request user or updates status.
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
   * Save article draft.
   */
  saveDraft: (draftData) => set((state) => {
    // Overwrite or append based on identifier
    const existingIdx = state.drafts.findIndex((d) => d.id === draftData.id);
    if (existingIdx >= 0) {
      const updatedDrafts = [...state.drafts];
      updatedDrafts[existingIdx] = draftData;
      return { drafts: updatedDrafts };
    }
    return { drafts: [...state.drafts, { ...draftData, id: String(Date.now()) }] };
  }),
}));
