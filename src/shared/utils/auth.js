import { initializeSsoSession } from '../../features/auth/services/ssoSession';

export const removeToken = () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  localStorage.removeItem('researchpulse_token');
  sessionStorage.removeItem('researchpulse_token');
  document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
  document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
};

export const isAuthenticated = async () => {
  const result = await initializeSsoSession();
  return result.status === 'authenticated';
};
