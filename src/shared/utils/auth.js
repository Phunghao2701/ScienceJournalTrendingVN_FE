/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: shared\utils\auth.js
 */
import { useAuthStore } from '../../app/store/authStore';
import { useUserStore } from '../../app/store/userStore';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';



/**
 * Xóa các token cũ đang lưu ở phía client.
 *
 * Luồng auth hiện tại ưu tiên HTTP-only cookie, nhưng một số phần code cũ
 * vẫn có thể lưu token vào localStorage/sessionStorage. Xóa cả hai nhóm key
 * giúp logout hoặc xử lý phiên hết hạn sạch hơn.
 */
export const removeToken = () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  localStorage.removeItem('researchpulse_token');
  sessionStorage.removeItem('researchpulse_token');
};

/**
 * Kiểm tra người dùng hiện tại còn phiên đăng nhập hợp lệ hay không.
 *
 * Trường hợp nhanh: Zustand đã có user nên không cần gọi API.
 * Trường hợp F5/reload: Zustand mất dữ liệu, gọi `/auth/check-auth` để BE xác thực
 * bằng cookie HTTP-only và trả lại thông tin user.
 */
export const isAuthenticated = async () => {
  try {
    const authStore = useAuthStore.getState();

    // ưu tiên dev: nếu Zustand đã có trạng thái isAuthenticated hợp lệ thì trả true ngay
    if (authStore.isAuthenticated && useUserStore.getState().email) {
      return true;
    }

    // còn thiếu dữ liệu: gọi BE để xác thực theo luồng HEAD (users/me + fallback)
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

    // BE có thể trả payload nhiều format
    const meData = meResponse?.data?.data ?? meResponse?.data;

    // Chỉ cần lấy được user payload là coi như authenticated
    if (meData) {
      useUserStore.getState().setUser?.(meData);
      useUserStore.getState().setEmail?.(meData?.email);
      authStore.loginSuccess(null, meData);
      return true;
    }


    return false;


  } catch (error) {
    // Nếu dính lỗi 401 triệt để (kể cả sau khi Axios Interceptor đã cố Refresh thất bại)
    useAuthStore.getState().logout(); // Đảm bảo clear sạch Zustand cũ nếu có
    localStorage.removeItem('researchpulse_token');
    return false;
  }
};