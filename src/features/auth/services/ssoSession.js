import { jwtDecode } from 'jwt-decode';
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
  const token = response.data?.access_token || response.data?.token || null;
  let user = response.data?.data || response.data?.user;

  if (!user && token) {
    try {
      const decoded = jwtDecode(token);
      user = {
        user_id: decoded.user_id || decoded.sub || decoded.id,
        email: decoded.email,
        role: decoded.role,
        ...decoded,
      };
    } catch {
      // ignore token decode failure
    }
  }

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

export const clearClientStorageAndCookies = () => {
  try {
    const tokenKeys = [
      'token',
      'accessToken',
      'researchpulse_token',
      'researchpulse_guest_token',
      'user',
      'jwt',
    ];
    tokenKeys.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    if (typeof document !== 'undefined') {
      const cookieNames = ['access_token', 'refresh_token'];
      const domains = [
        '',
        '; domain=.hyperdatalab.org',
        '; domain=hyperdatalab.org',
        '; domain=.vn.hyperdatalab.org',
        '; domain=vn.hyperdatalab.org',
      ];
      cookieNames.forEach((name) => {
        domains.forEach((dom) => {
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${dom};`;
        });
      });
    }
  } catch {
    // Storage access might be restricted
  }
};

export const initializeSsoSession = () => {
  if (initializationPromise) return initializationPromise;
  initializationPromise = (async () => {
    try {
      clearClientStorageAndCookies();
      useAuthStore.getState().logout();
      try {
        return await checkChildSession();
      } catch (error) {
        if (error.response?.status === 401) {
          return { status: 'anonymous' };
        }
        throw error;
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
    await api.post('/auth/logout', {}, { skipBearer: true, skipAuthRefresh: true });
  } catch (error) {
    // Non-fatal: still proceed to wipe local session
  } finally {
    clearClientStorageAndCookies();
    useAuthStore.getState().logout();
    useUserStore.getState().setUser?.(null);
    useUserStore.getState().setEmail?.(null);
    initializationPromise = null;
  }
};
