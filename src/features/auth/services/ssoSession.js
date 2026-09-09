import { jwtDecode } from 'jwt-decode';
import api from '../../../shared/services/api';
import { useAuthStore } from '../../../app/store/authStore';
import { useUserStore } from '../../../app/store/userStore';
import {
  classifySsoError,
  createSessionInitializer,
  getAuthenticatedSessionFromState,
  recoverSsoSession,
} from './ssoSessionContract';

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

const clearClientStorage = () => {
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
  } catch {
    // Storage access might be restricted
  }
};

export const clearClientStorageAndCookies = () => {
  clearClientStorage();
  try {
    if (typeof document !== 'undefined') {
      const cookieNames = [
        'access_token',
        'refresh_token',
        'vn_access_token_dev',
        'vn_refresh_token_dev',
        'vn_sso_block_dev',
        '__Host-vn_access_token',
        '__Host-vn_refresh_token',
        '__Host-vn_sso_block',
      ];
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

const sessionInitializer = createSessionInitializer(async () => {
    try {
      clearClientStorage();
      useAuthStore.getState().logout();
      return await recoverSsoSession({
        checkChildSession,
        bootstrapSession: automaticBootstrap,
      });
    } catch (error) {
      useAuthStore.getState().logout();
      throw error;
    }
});

export const initializeSsoSession = () => {
  const currentSession = getAuthenticatedSessionFromState(useAuthStore.getState());
  return currentSession ? Promise.resolve(currentSession) : sessionInitializer.run();
};

export const explicitSsoLogin = async () => {
  const response = await api.post('/auth/sso/login', null, { skipBearer: true, skipAuthRefresh: true });
  return setAuthenticatedUser(response.data?.data || response.data?.user);
};

export const logoutSsoSession = async () => {
  try {
    await api.post('/auth/logout', {}, { skipBearer: true, skipAuthRefresh: true });
  } catch {
    // Non-fatal: still proceed to wipe local session
  } finally {
    clearClientStorageAndCookies();
    useAuthStore.getState().logout();
    useUserStore.getState().setUser?.(null);
    useUserStore.getState().setEmail?.(null);
    sessionInitializer.reset();
  }
};
