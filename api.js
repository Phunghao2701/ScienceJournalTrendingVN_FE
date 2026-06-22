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

// Interceptor xử lý response và tự động refresh token khi gặp lỗi 401
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Mỗi request chỉ được refresh một lần để tránh vòng lặp vô hạn khi token lỗi
    if (error.response && error.response.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { withCredentials: true } 
        );

        if (res.status === 200) {
          const newToken = res.data?.token || res.data?.data?.token || null;
          
          if (newToken) {
            // 🔥 Giữ thay đổi: Lấy hàm loginSuccess trực tiếp từ kho Zustand mà không dùng Hook
            const { loginSuccess } = useAuthStore.getState(); 
            loginSuccess(newToken); 
            
            // Gán token mới vào header của request bị lỗi trước đó
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          }
          
          // Thực hiện lại request ban đầu với token mới
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Nếu refresh token cũng hết hạn hoặc lỗi, reject để đẩy user ra trang login (hoặc xử lý logout)
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;