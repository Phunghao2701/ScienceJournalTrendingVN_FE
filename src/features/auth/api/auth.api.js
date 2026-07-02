/**
 * Raw API call layer for all authentication and user-profile endpoints.
 *
 * File: features/auth/api/auth.api.js
 *
 * All functions use the authenticated `api` client (shared/services/api.js).
 * Login/register/verify are public endpoints but still use `api` -- the request
 * interceptor only adds the Authorization header when a token exists, so
 * unauthenticated requests pass through cleanly without an auth header.
 *
 * Consumed by: authService.js (business logic) and useVerifyAccount.js (directly).
 */
import api from '../../../shared/services/api';

/**
 * Register a new user account
 * @param {Object} data - { email, password, first_name, last_name }
 * @returns {Promise} Axios promise
 */
export const registerApi = (data) => {
  return api.post('/auth/register', data);
};

/**
 * Verify user email activation via token
 * @param {string} token - Activation token
 * @returns {Promise} Axios promise
 */
export const verifyEmailApi = (token) => {
  return api.get('/auth/verify', {
    params: { token },
  });
};

/**
 * Log in a user with email and password
 * @param {Object} data - { email, password, remember }
 * @returns {Promise} Axios promise
 */
export const loginApi = (data) => {
  return api.post('/auth/login', data);
};

/**
 * Log in / Sign up via Google OAuth
 * @param {string} code - Google OAuth authorization code
 * @returns {Promise} Axios promise
 */
export const loginGoogleApi = (code) => {
  return api.post('/auth/google', { code });
};

/**
 * Request a password reset link to be sent via email
 * @param {string} email - Registered email address
 * @returns {Promise} Axios promise
 */
export const forgotPasswordApi = (email) => {
  return api.post('/auth/forgot-password', { email });
};

/**
 * Submit new password using reset token
 * @param {Object} data - { token, newPassword }
 * @returns {Promise} Axios promise
 */
export const resetPasswordApi = (data) => {
  return api.post('/auth/reset-password', data);
};

/**
 * Get profile details of currently logged-in user.
 * Tries GET /users/me first; falls back to GET /users/profile on 404
 * to handle API path differences between environments.
 * @returns {Promise} Axios promise
 */
export const getProfileApi = async () => {
  try {
    return await api.get('/users/me');
  } catch (error) {
    if (error.response?.status === 404) {
      return api.get('/users/profile');
    }
    throw error;
  }
};

/**
 * Update current user profile details
 * @param {Object} data
 * @returns {Promise} Axios promise
 */
export const updateProfileApi = (data) => {
  return api.put('/users/me', data);
};

/**
 * Delete current user account
 * @returns {Promise} Axios promise
 */
export const deleteAccountApi = () => {
  return api.delete('/users/me');
};

// authApi.verifyAccount is an alias for verifyEmailApi, kept for backward compatibility.
// Prefer importing verifyEmailApi directly by name.
const authApi = {
  verifyAccount: verifyEmailApi,
};


export const logoutApi = () => {
  return api.post('/auth/logout');
};

export default authApi;

