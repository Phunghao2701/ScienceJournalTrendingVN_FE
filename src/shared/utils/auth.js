import { initializeSsoSession } from '../../features/auth/services/ssoSession';

export const removeToken = () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  localStorage.removeItem('researchpulse_token');
  sessionStorage.removeItem('researchpulse_token');
};

export const isAuthenticated = async () => {
  const result = await initializeSsoSession();
  return result.status === 'authenticated';
};
