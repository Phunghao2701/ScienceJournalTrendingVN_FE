/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: shared\services\api.js
 */
import axios from 'axios';
import { useAuthStore } from '../../app/store/authStore';

/**
 * Axios instance dùng chung cho toàn bộ FE.
 *
 * Luồng auth hiện tại sau khi merge nhánh Duy:
 * - BE lưu access token/refresh token trong HTTP-only cookie.
 * - `withCredentials: true` giúp browser gửi cookie kèm request.
 * - Nếu API trả 401, interceptor sẽ thử gọi `/auth/refresh` đúng 1 lần
 * để lấy access token mới rồi gọi lại request ban đầu.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Interceptor gửi token kèm request
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

// Axios instance for public endpoints (does not send cookies or tokens)
export const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Danh sách các endpoint auth public — không cần thử refresh token khi bị 401
// vì đây là các request chưa xác thực (login, register, google...)
const PUBLIC_AUTH_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/google',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify',
];

/**
 * Kiểm tra URL của request có phải endpoint public auth không.
 * Nếu có thì bỏ qua bước tự động refresh token.
 */
const isPublicAuthEndpoint = (url = '') =>
  PUBLIC_AUTH_ENDPOINTS.some((path) => url.includes(path));

// Interceptor xử lý response và tự động refresh token khi gặp lỗi 401
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';

    // Bỏ qua refresh cho các endpoint public auth — giữ nguyên lỗi gốc từ backend
    // để UI hiển thị đúng thông báo (ví dụ: "Email hoặc mật khẩu không đúng")
    if (isPublicAuthEndpoint(requestUrl)) {
      return Promise.reject(error);
    }

    // Mỗi request chỉ được refresh một lần để tránh vòng lặp vô hạn khi token lỗi
    if (error.response && error.response.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      // Lưu lại lỗi gốc để fallback nếu refresh thất bại
      const originalError = error;

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { withCredentials: true }
        );

        if (res.status === 200) {
          // Hỗ trợ cả 2 format response từ BE
          const newToken = res.data?.token || res.data?.data?.token || null;

          if (newToken) {
            // Lấy hàm loginSuccess trực tiếp từ kho Zustand mà không dùng Hook
            const { loginSuccess } = useAuthStore.getState();
            loginSuccess(newToken);

            // Gán token mới vào header của request bị lỗi trước đó
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          }

          // Thực hiện lại request ban đầu với token mới
          return api(originalRequest);
        }
      } catch {
        // Refresh thất bại: xoá session và reject bằng LỖI GỐC
        // (không dùng refreshError để tránh mất message từ backend)
        const { logout } = useAuthStore.getState();
        logout();
        localStorage.removeItem('researchpulse_token');
        return Promise.reject(originalError);
      }
    }

    // Nếu đã retry mà vẫn 401, xoá token
    if (error.response && error.response.status === 401) {
      const { logout } = useAuthStore.getState();
      logout();
      localStorage.removeItem('researchpulse_token');
    }

    return Promise.reject(error);
  }
);

export default api;