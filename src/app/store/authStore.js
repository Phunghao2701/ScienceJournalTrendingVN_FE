/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: app\store\authStore.js
 */
import { create } from 'zustand';

const LEFTOVER_TOKEN_KEYS = [
  'researchpulse_token',
  'accessToken',
  'token',
  'researchpulse_guest_token',
  'user',
  'jwt',
];

const purgeStorageTokens = () => {
  try {
    LEFTOVER_TOKEN_KEYS.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  } catch {
    // Storage access might be restricted
  }
};

// Luôn xóa sạch mọi token tồn đọng trong localStorage khi module khởi tạo
purgeStorageTokens();

/**
 * Store quản lý trạng thái xác thực toàn cục (chỉ lưu trong memory, KHÔNG lưu token vào localStorage).
 * Xác thực thực tế được bảo đảm bằng HTTP-only cookie giữa Browser và Backend.
 */
export const useAuthStore = create((set) => ({
  token: null,
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,

  /**
   * Đánh dấu phiên đăng nhập là hợp lệ (lưu hoàn toàn trong memory).
   */
  loginSuccess: (token = null, user = null) => {
    // Bảo đảm không bao giờ lưu token vào localStorage
    purgeStorageTokens();

    return set((state) => ({
      token: token ?? state.token,
      user: user ?? state.user,
      isAuthenticated: Boolean(user ?? state.user ?? token ?? state.token),
      error: null,
    }));
  },

  setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  /**
   * Xóa toàn bộ trạng thái auth trong memory và dọn sạch localStorage.
   */
  logout: () => {
    purgeStorageTokens();
    return set({
      token: null,
      isAuthenticated: false,
      user: null,
      error: null,
      isLoading: false,
    });
  },
}));
