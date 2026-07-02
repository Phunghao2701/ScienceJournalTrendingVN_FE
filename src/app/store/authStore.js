/**
 * Global authentication state store for the ResearchPulse FE.
 *
 * File: app/store/authStore.js
 *
 * Consumed by (outside React via getState()):
 *   - shared/services/api.js  — request interceptor reads token; response interceptor calls loginSuccess/logout
 *   - shared/utils/auth.js    — isAuthenticated() hydrates store after page refresh
 * Consumed inside React (via hook):
 *   - ProtectedRoute, AdminRoute — check isAuthenticated to gate pages
 *   - LoginForm, RegisterForm    — call loginSuccess after successful auth
 */
import { create } from 'zustand';

/**
 * Manages global auth state: token, full user object, loading/error flags.
 *
 * Auth transition note: the project is moving from localStorage tokens to HTTP-only
 * cookies. `token` is still held in store for cases where BE returns it explicitly
 * (login/refresh). `user` is hydrated from GET /users/me when only a cookie is present.
 *
 * NOTE: initialToken reads localStorage key 'researchpulse_token' — a third key
 * distinct from STORAGE_KEYS.ACCESS_TOKEN ('token') and httpClient's 'accessToken'.
 * See shared/constants/storageKeys.js for the full inconsistency note.
 */
export const useAuthStore = create((set) => {
  const initialToken = localStorage.getItem('researchpulse_token') || null;

  return {
    token: initialToken,
    isAuthenticated: Boolean(initialToken),
    user: null,
    isLoading: false,
    error: null,

    /**
     * Marks the session as authenticated and persists the token if provided.
     *
     * Two call modes:
     *   loginSuccess(token)       -- token-based login or refresh; writes to localStorage.
     *   loginSuccess(null, user)  -- cookie-based session restore; no localStorage write.
     * isAuthenticated is true if any of: new token / provided user / existing state.user.
     */
    loginSuccess: (token = null, user = null) => set((state) => {
      const targetToken = token ?? state.token;
      if (targetToken) {
        localStorage.setItem('researchpulse_token', targetToken);
      }
      return {
        token: targetToken,
        user: user ?? state.user,
        isAuthenticated: Boolean(targetToken ?? user ?? state.user),
        error: null,
      };
    }),

    setUser: (user) => set({ user }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),

    /**
     * Clears all auth state from Zustand AND removes 'researchpulse_token' from localStorage.
     * For a complete multi-key cleanup (all three auth keys), also call
     * removeToken() from shared/utils/auth.js after this.
     */
    logout: () => {
      localStorage.removeItem('researchpulse_token');
      return set({
        token: null,
        isAuthenticated: false,
        user: null,
        error: null,
        isLoading: false,
      });
    },
  };
});