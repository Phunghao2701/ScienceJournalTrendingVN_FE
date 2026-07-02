// httpClient.js
// Legacy Axios instance retained for authApi.js and older feature API files.
// For new feature code, prefer api.js (src/shared/services/api.js) instead:
// it adds the full 401 -> /auth/refresh -> retry flow backed by Zustand authStore.
// Key difference: this client reads the access token from localStorage directly,
// while api.js reads from useAuthStore.getState().token.

import axios from 'axios';

const httpClient = axios.create({
  // VITE_API_URL is the canonical env key; VITE_API_BASE_URL is a legacy alias.
  // Falls back to local dev server if neither env var is set.
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',

  // 10-second cap prevents a hanging request from freezing the UI indefinitely.
  timeout: 10000,

  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ───────────────────────────────────────────────────
// Attaches Bearer token from localStorage to every outgoing request.
// Reads 'accessToken' key — contrast with api.js which reads Zustand store token.
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────
// Minimal error pass-through — no auto-redirect, no retry, no logout call.
// Unlike api.js, this client does NOT attempt a token refresh on 401.
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extend here if needed: per-status toasts, redirect on 403, etc.
    return Promise.reject(error);
  }
);

export default httpClient;