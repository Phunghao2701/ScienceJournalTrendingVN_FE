/**
 * Primary authenticated Axios instance for the ResearchPulse FE.
 *
 * File: shared/services/api.js
 *
 * TWO Axios clients exist in this codebase — use the right one:
 *   api.js (this file): reads token from Zustand authStore, sends HTTP-only cookies,
 *     has full 401 -> GET /auth/refresh -> retry loop. Use for all authenticated calls.
 *   httpClient.js: legacy, reads token from localStorage, no auto-refresh on 401.
 *     Only used by authApi.js (account activation endpoint) to avoid refresh loops.
 */
import axios from 'axios';
import { useAuthStore } from '../../app/store/authStore';

/**
 * Main Axios instance used by all authenticated feature APIs.
 *
 * Auth flow: BE stores tokens in HTTP-only cookies (set on login response).
 *   withCredentials: true causes the browser to attach those cookies automatically.
 *   On 401, the response interceptor calls GET /auth/refresh once to obtain a new
 *   access token, updates Zustand authStore, then replays the original request.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor: injects Bearer token from Zustand store into every request.
// Uses useAuthStore.getState() (not the hook) — safe to call outside React components.
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Unauthenticated Axios instance — no Bearer token, no cookies sent.
// Use for public read endpoints (e.g. GET /journals, GET /articles) that do not require auth.
export const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Response interceptor: transparent 401 recovery — refresh token, then replay the original request.

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // _retry flag prevents infinite loops if the refresh token itself is also expired or invalid.
    if (error.response && error.response.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { withCredentials: true }
        );

        if (res.status === 200) {
          // Supports both BE response shapes: { token } and { data: { token } }
          // — handles format divergence between two merged backend branches.
          const newToken = res.data?.token || res.data?.data?.token || null;

          if (newToken) {
            // Access Zustand store directly (no hook) to update auth state outside the React tree.
            const { loginSuccess } = useAuthStore.getState();
            loginSuccess(newToken);

            // Inject the refreshed token into the originally failed request before replaying it.
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

          }

          // Replay the original request now that the token has been refreshed.
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear everything
        const { logout } = useAuthStore.getState();
        logout();
        localStorage.removeItem('researchpulse_token');
        return Promise.reject(refreshError);
      }
    }

    // If it's 401 and we already retried, clear token
    if (error.response && error.response.status === 401) {
      const { logout } = useAuthStore.getState();
      logout();
      localStorage.removeItem('researchpulse_token');
    }

    return Promise.reject(error);
  }
);

export default api;