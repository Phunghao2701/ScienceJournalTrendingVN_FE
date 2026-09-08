import api from '../../../shared/services/api';
import { useAuthStore } from '../../../app/store/authStore';
import { useUserStore } from '../../../app/store/userStore';

let initializationPromise = null;

const setAuthenticatedUser = (user, token = null) => {
  useUserStore.getState().setUser?.(user);
  useUserStore.getState().setEmail?.(user?.email);
  useAuthStore.getState().loginSuccess(token, user);
  return { status: 'authenticated', user };
};

export const checkChildSession = async () => {
  const response = await api.get('/auth/check-auth', { skipBearer: false, skipAuthRefresh: true });
  const user = response.data?.data || response.data?.user;
  if (!user) throw new Error('Authenticated response did not include a user');
  const token = response.data?.access_token || localStorage.getItem('researchpulse_token') || null;
  return setAuthenticatedUser(user, token);
};

export const initializeSsoSession = () => {
  if (initializationPromise) return initializationPromise;
  initializationPromise = (async () => {
    try {
      return await checkChildSession();
    } catch (error) {
      // Nếu check-auth trả về 401 hoặc lỗi, và trước đó đang lưu state đăng nhập không hợp lệ thì dọn dẹp
      if (useAuthStore.getState().token || useAuthStore.getState().user) {
        useAuthStore.getState().logout();
      }
      return { status: 'anonymous', error };
    } finally {
      initializationPromise = null;
    }
  })();
  return initializationPromise;
};

export const logoutSsoSession = async () => {
  try {
    await api.post('/auth/logout', null, { skipBearer: true, skipAuthRefresh: true });
  } finally {
    useAuthStore.getState().logout();
    useUserStore.getState().setUser?.(null);
    useUserStore.getState().setEmail?.(null);
    initializationPromise = null;
  }
};
