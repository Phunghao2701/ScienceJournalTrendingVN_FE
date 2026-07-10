/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\auth\services\authService.js
 */
import { jwtDecode } from 'jwt-decode';
import {
  loginApi,
  registerApi,
  loginGoogleApi,
  logoutApi,
} from '../api/auth.api';
import {
  deleteProfileApi,
  getProfileApi,
  updateProfileApi,
} from '../../profile/api/profile.api';
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
  // ưu tiên dev: gửi remember lên BE
  const response = await loginApi({ email, password, remember });

  // giữ chức năng HEAD: hỗ trợ nhiều format token từ response
  let token = response.data?.data?.token;
  if (!token) {
    token = response.data?.token;
  }

  if (token) {
    // persistToken không nằm trong file hiện tại => fallback sang persist qua removeToken/shared flow
    // Nếu hàm persistToken tồn tại ở scope khác thì vẫn dùng được.
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('researchpulse_token', token);
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
  // Bổ sung cache-control để tránh trường hợp browser/cache trả dữ liệu rỗng
  const response = await getProfileApi();
  console.log('[fetchCurrentProfile] Response:', response?.data);

  // Backend có thể trả nhiều dạng payload:
  // - { data: { ...user } }
  // - { success: true, data: { ...user } }
  // - hoặc trực tiếp { ...user }
  const payload = response?.data;

  // Chuẩn form: response.data.data là user
  if (response?.status === 200 && payload?.data) {
    return payload.data;
  }

  // success form: response.data.success === true và có data
  if (payload?.success === true && payload?.data) {
    return payload.data;
  }

  // Fallback: nếu BE trả thẳng object user
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
  const response = await deleteProfileApi();
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
