import api from '../../../shared/services/api';
import { useAuthStore } from '../../../app/store/authStore';
import { useUserStore } from '../../../app/store/userStore';
import { classifySsoError } from './ssoSessionContract';

let initializationPromise = null;

const setAuthenticatedUser = (user) => {
  useUserStore.getState().setUser?.(user);
  useUserStore.getState().setEmail?.(user?.email);
  useAuthStore.getState().loginSuccess(null, user);
  return { status: 'authenticated', user };
};

const checkChildSession = async () => {
  const response = await api.get('/auth/check-auth', { skipBearer: true, skipAuthRefresh: true });
  const user = response.data?.data || response.data?.user;
  if (!user) throw new Error('Authenticated response did not include a user');
  return setAuthenticatedUser(user);
};

const automaticBootstrap = async () => {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await api.post('/auth/sso/bootstrap', null, { skipBearer: true, skipAuthRefresh: true });
      return await checkChildSession();
    } catch (error) {
      if (error.response?.status === 409 && error.response?.data?.code === 'LEGACY_COOKIE_CLEARED' && attempt === 0) {
        continue;
      }
      const classification = classifySsoError(error);
      if (classification === 'sso-blocked') return { status: 'sso-blocked' };
      if (classification === 'anonymous') return { status: 'anonymous' };
      if (classification === 'error') return { status: 'error', error };
      throw error;
    }
  }
};

export const initializeSsoSession = () => {
  if (initializationPromise) return initializationPromise;
  initializationPromise = (async () => {
    try {
      localStorage.removeItem('researchpulse_token');
      sessionStorage.removeItem('researchpulse_token');
      useAuthStore.getState().logout();
      try {
        return await checkChildSession();
      } catch (error) {
        if (error.response?.status !== 401) throw error;
        return await automaticBootstrap();
      }
    } catch (error) {
      useAuthStore.getState().logout();
      throw error;
    } finally {
      initializationPromise = null;
    }
  })();
  return initializationPromise;
};

export const explicitSsoLogin = async () => {
  const response = await api.post('/auth/sso/login', null, { skipBearer: true, skipAuthRefresh: true });
  return setAuthenticatedUser(response.data?.data || response.data?.user);
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
