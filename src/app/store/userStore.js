/**
 * Lightweight store for the currently logged-in user's display identity.
 *
 * File: app/store/userStore.js
 *
 * Separation from authStore: authStore owns auth state (token, isAuthenticated, full user object).
 * userStore holds only the email for lightweight display (header avatar, greeting) without
 * forcing components to import the heavier authStore.
 * Both stores are populated together in shared/utils/auth.js isAuthenticated() after session restore.
 */
import { create } from 'zustand';

/**
 * Stores the logged-in user's email for UI display purposes.
 * Not persisted to localStorage — re-populated on each page load via isAuthenticated().
 */
export const useUserStore = create((set) => ({
  email: null,

  /** Sets the email after successful login or session restore. */
  setEmail: (email) => set({ email }),

  /** Clears the email on logout. Should be called alongside authStore.logout(). */
  clearEmail: () => set({ email: null }),
}));
