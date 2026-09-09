import { initializeSsoSession, clearClientStorageAndCookies } from '../../features/auth/services/ssoSession';

export const removeToken = () => {
  clearClientStorageAndCookies();
};

export const isAuthenticated = async () => {
  const result = await initializeSsoSession();
  return result.status === 'authenticated';
};
