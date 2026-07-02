/**
 * Auth service layer: wraps auth.api.js calls with response normalization and token extraction.
 *
 * File: features/auth/services/authService.js
 *
 * Sits between auth.api.js (raw Axios) and useAuth.js (React hook + Zustand).
 * Responsibilities: JWT decoding for email extraction, multi-shape BE response
 * normalization in fetchCurrentProfile, and token cleanup via removeToken().
 * Consumed exclusively by: useAuth.js.
 */
import { jwtDecode } from 'jwt-decode';
import {
  loginApi,
  registerApi,
  getProfileApi,
  updateProfileApi,
  deleteAccountApi,
  loginGoogleApi,
  logoutApi,
} from '../api/auth.api';
import { removeToken } from '../../../shared/utils/auth';

/**
 * Safely extract email-like identity from JWT payload.
 *
 * @param {string} token - JWT access token.
 * @returns {string} Email/sub fallback for display.
 */
const getEmailFromToken = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.email || decoded.sub || 'User';
  } catch {
    return 'User';
  }
};

/**
 * Login using email/password and persist token.
 *
 * @param {string} email - User email.
 * @param {string} password - User password.
 * @param {boolean} remember - Remember login flag.
 * @returns {Promise<{response: Object, token: string|null, email: string}>}
 */
export const loginWithPassword = async (email, password, remember = true) => {
  // Forward the remember flag to BE so it can set a long-lived refresh-token cookie.
  const response = await loginApi({ email, password, remember });

  // Support two token response shapes: { data: { token } } (standard) and { token } (legacy).
  let token = response.data?.data?.token;
  if (!token) {
    token = response.data?.token;
  }

  if (token) {
    // WARNING: persistToken is not defined or imported in this file.
    // This branch is dead code -- the typeof guard prevents a ReferenceError but
    // persistToken will never be a function here. Token persistence is handled
    // by authStore.loginSuccess() in useAuth.js after this function returns.
    if (typeof persistToken === 'function') {
      persistToken(token, remember);
    }
  }

  return {
    response: response.data,
    token: token || null,
    email: token ? getEmailFromToken(token) : email,
  };
};


/**
 * Exchange Google auth code for backend token.
 *
 * @param {string} code - Google OAuth auth code.
 * @returns {Promise<{response: Object, token: string|null, email: string}>}
 */
export const loginWithGoogleCode = async (code) => {
  const result = await loginGoogleApi(code);
  const body = result.data;
  const token = body?.data?.token;

  return {
    response: body,
    token: token || null,
    email: token ? getEmailFromToken(token) : 'User',
  };
};

/**
 * Register a new user account.
 *
 * @param {Object} payload - Register payload.
 * @returns {Promise<Object>} Backend response body.
 */
export const registerUser = async (payload) => {
  const response = await registerApi(payload);
  return response.data;
};

/**
 * Fetch current authenticated user's profile.
 *
 * @returns {Promise<Object>} User profile object.
 */
export const fetchCurrentProfile = async () => {
  const response = await getProfileApi();
  // Debug log -- can be removed once profile endpoint is stable.
  console.log('[fetchCurrentProfile] Response:', response?.data);

  // BE returns the user object in one of three shapes depending on endpoint version:
  //   Shape A (standard): { data: { ...user } }
  //   Shape B (success):  { success: true, data: { ...user } }
  //   Shape C (flat):     { ...user }  (direct user object, no wrapper)
  const payload = response?.data;

  // Shape A: response.data.data holds the user object.
  if (response?.status === 200 && payload?.data) {
    return payload.data;
  }

  // Shape B: explicit success flag with nested data.
  if (payload?.success === true && payload?.data) {
    return payload.data;
  }

  // Shape C: 200 with a plain object that has no data/success wrapper.
  if (response?.status === 200 && payload && typeof payload === 'object' && !payload?.data && !payload?.success) {
    return payload;
  }

  throw new Error(payload?.message || 'Failed to fetch profile');
};


/**
 * Update current authenticated user's profile.
 *
 * @param {Object} profileData - Profile fields to update.
 * @returns {Promise<Object>} Updated user profile.
 */
export const updateCurrentProfile = async (profileData) => {
  const response = await updateProfileApi(profileData);
  if (response.data?.success) {
    return response.data.data;
  }
  throw new Error(response.data?.message || 'Failed to update profile');
};

/**
 * Delete current authenticated user's account.
 *
 * @returns {Promise<Object>} Backend response body.
 */
export const deleteCurrentAccount = async () => {
  const response = await deleteAccountApi();
  if (response.data?.success) {
    removeToken();
    return response.data;
  }
  throw new Error(response.data?.message || 'Failed to delete account');
};

/**
 * Clear all auth tokens from browser storage.
 *
 * @returns {Promise<void>}
 */
export const logoutSession = async () => {
  try {
    await logoutApi();
  } finally {
    removeToken();
  }
};
