/**
 * Auth utility functions for the ResearchPulse FE.
 *
 * File: shared/utils/auth.js
 *
 * These helpers are called outside React components (route guards, Axios interceptors),
 * so they access Zustand via .getState() rather than hooks.
 *
 * NOTE: jwtDecode is imported but currently unused — kept for potential future use
 * (e.g. reading token expiry client-side without an extra API round-trip).
 */
import { useAuthStore } from '../../app/store/authStore';
import { useUserStore } from '../../app/store/userStore';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';



/**
 * Removes all client-side token copies from localStorage and sessionStorage.
 *
 * The current auth flow uses HTTP-only cookies, but older code paths may have
 * written tokens under 'token' or 'researchpulse_token'. Both keys in both
 * storages are cleared here to ensure a clean logout regardless of which path
 * originally stored the token.
 *
 * NOTE: httpClient.js reads localStorage key 'accessToken' (a third key, distinct
 * from the ones removed here) — that key is NOT cleared by this function.
 * See storageKeys.js for the full inconsistency note.
 */
export const removeToken = () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  localStorage.removeItem('researchpulse_token');
  sessionStorage.removeItem('researchpulse_token');
};

/**
 * Checks whether the current session is still valid, hydrating Zustand if needed.
 *
 * Fast path: if Zustand already has isAuthenticated + a user email, returns true
 * immediately — avoids redundant network calls on re-renders or route transitions.
 *
 * Slow path (e.g. after page refresh): Zustand is empty, so calls GET /users/me
 * to let the BE validate the HTTP-only cookie and return the user payload.
 * Falls back to GET /users/profile if /users/me returns 404 (endpoint varies by BE version).
 *
 * Called by ProtectedRoute (src/app/routes/ProtectedRoute.jsx) to gate private pages.
 */
export const isAuthenticated = async () => {
  try {
    const authStore = useAuthStore.getState();

    // Fast path: Zustand already hydrated — skip the network call.
    if (authStore.isAuthenticated && useUserStore.getState().email) {
      return true;
    }

    // Slow path: Zustand empty (e.g. after page refresh) — validate session via BE cookie.
    let meResponse;
    try {
      meResponse = await api.get('/users/me');
    } catch (error) {
      if (error.response?.status === 404) {
        meResponse = await api.get('/users/profile');
      } else {
        throw error;
      }
    }

    // BE returns either { data: { ...user } } or { ...user } directly — normalize both shapes.
    const meData = meResponse?.data?.data ?? meResponse?.data;

    // Any valid user payload returned by BE confirms the session is still live.
    if (meData) {
      useUserStore.getState().setUser?.(meData);
      useUserStore.getState().setEmail?.(meData?.email);
      authStore.loginSuccess(null, meData);
      return true;
    }


    return false;


  } catch (error) {
    // Hard 401: the Axios refresh interceptor in api.js already attempted token renewal and failed.
    useAuthStore.getState().logout(); // Clear any stale Zustand auth state before returning false.
    localStorage.removeItem('researchpulse_token');
    return false;
  }
};