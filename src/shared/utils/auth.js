import { initializeSsoSession } from '../../features/auth/services/ssoSession';

export const removeToken = () => {
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
  document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
  document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
  document.cookie = 'access_token=; path=/; domain=.hyperdatalab.org; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
  document.cookie = 'refresh_token=; path=/; domain=.hyperdatalab.org; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
  document.cookie = 'access_token=; path=/; domain=hyperdatalab.org; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
  document.cookie = 'refresh_token=; path=/; domain=hyperdatalab.org; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
};

export const isAuthenticated = async () => {
  const result = await initializeSsoSession();
  return result.status === 'authenticated';
};
