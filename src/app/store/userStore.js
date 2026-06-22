/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: app\store\userStore.js
 */
import { create } from 'zustand';

/**
 * Store quản lý thông tin người dùng đã đăng nhập.
 * Chỉ lưu email/username để hiển thị giao diện, không cần fetch API.
 */
export const useUserStore = create((set) => ({
  email: null,

  /**
   * Lưu email người dùng khi đăng nhập thành công.
   * 
   * @param {string} email - Email của người dùng.
   */
  setEmail: (email) => set({ email }),

  /**
   * Xóa email khi logout.
   */
  clearEmail: () => set({ email: null }),
}));
