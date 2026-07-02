/**
 * Primary auth hook for login, register, profile, and logout flows.
 *
 * File: features/auth/hooks/useAuth.js
 *
 * Architecture: delegates all API calls to authService.js; reads/writes
 * auth state via authStore (Zustand) and display email via userStore.
 * This is the current auth implementation. AuthContext.jsx (features/auth/contexts/)
 * is an older parallel implementation -- do not use it for new code.
 *
 * Consumed by: LoginForm, RegisterForm, ProfilePage, Header, and any component
 * that needs auth state without importing Zustand stores directly.
 */
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from '../../../shared/utils/toast';
import { useAuthStore } from '../../../app/store/authStore';
import { useUserStore } from '../../../app/store/userStore';
import {
  deleteCurrentAccount,
  fetchCurrentProfile,
  loginWithGoogleCode,
  loginWithPassword,
  logoutSession,
  registerUser,
  updateCurrentProfile,
} from '../services/authService';

/**
 * Consolidates all auth operations into a single hook.
 *
 * Reads/writes state via Zustand (authStore + userStore); API calls are
 * delegated to authService.js so page components are shielded from endpoint details.
 */
export default function useAuth() {
  const navigate = useNavigate();
  const [googleRedirect, setGoogleRedirect] = useState('/');

  // Primary auth state from Zustand. These are the source-of-truth values for gates and UI.
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const loginSuccess = useAuthStore((state) => state.loginSuccess);
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setError = useAuthStore((state) => state.setError);
  const clearAuthState = useAuthStore((state) => state.logout);

  // userStore holds only the display email for header/landing; kept separate from authStore.
  const setEmail = useUserStore((state) => state.setEmail);
  const clearEmail = useUserStore((state) => state.clearEmail);

  /**
   * Fetches the current user's profile from the backend and syncs both stores.
   * Call after login or when profile data may have changed.
   */
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const userData = await fetchCurrentProfile();
      setUser(userData);
      setEmail(userData.email);
      return userData;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Không thể tải hồ sơ người dùng';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setEmail, setError, setLoading, setUser]);

  /**
   * Configures Google OAuth in auth-code flow.
   * After Google returns the code, FE sends it to BE for validation; BE returns token/user.
   */
  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResponse) => {
      setLoading(true);
      setError(null);

      try {
        const { response, token: googleToken, email } = await loginWithGoogleCode(codeResponse.code);

        if (response?.success && googleToken) {
          loginSuccess(googleToken);
          setEmail(email);
          toast.success('Đăng nhập thành công');
          navigate(googleRedirect, { replace: true });
        } else {
          toast.error('Đăng nhập thất bại');
        }
      } catch (err) {
        const message = err.response?.data?.message || err.message || 'Đăng nhập thất bại';
        setError(message);
        toast.error('Đăng nhập thất bại');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast.error('Đăng nhập Google thất bại');
    },
  });

  /**
   * Logs in with email/password credentials.
   * `remember` tells the BE whether to set a long-lived refresh-token cookie.
   */
  const login = useCallback(async (email, password, remember = true, onSuccess) => {
    setLoading(true);
    setError(null);

    try {
      const result = await loginWithPassword(email, password, remember);

      if (result.token) {
        loginSuccess(result.token);
        onSuccess?.(result.token);
        setEmail(result.email);
      }

      return result.response;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Đăng nhập thất bại';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loginSuccess, setEmail, setError, setLoading]);

  /**
   * Opens the Google OAuth popup/redirect and saves the post-login target route.
   */
  const loginWithGoogle = useCallback((redirectTo = '/') => {
    setGoogleRedirect(redirectTo);
    googleLogin();
  }, [googleLogin]);

  /**
   * Registers a new user account.
   * On success, BE sends a verification email; account is inactive until verified.
   */
  const register = useCallback(async (data) => {
    setLoading(true);
    setError(null);

    try {
      return await registerUser(data);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Đăng ký thất bại';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading]);

  /**
   * Logs out: calls BE to clear session/cookie, then clears Zustand and userStore,
   * and navigates to /login. logoutSession() always calls removeToken() in finally
   * to ensure local cleanup even if the network request fails.
   */
  const logout = useCallback(async () => {
    await logoutSession();
    clearAuthState();
    clearEmail();
    navigate('/login', { replace: true });
  }, [clearAuthState, clearEmail, navigate]);

  /**
   * Updates the current user's profile and syncs the updated object back into authStore and userStore.
   */
  const updateProfile = useCallback(async (profileData) => {
    setLoading(true);
    setError(null);

    try {
      const updatedUser = await updateCurrentProfile(profileData);
      setUser(updatedUser);

      if (updatedUser.email) {
        setEmail(updatedUser.email);
      }

      return updatedUser;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Cập nhật hồ sơ thất bại';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setEmail, setError, setLoading, setUser]);

  /**
   * Deletes the current account, clears all auth state, and redirects to /register.
   */
  const deleteAccount = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await deleteCurrentAccount();
      clearAuthState();
      clearEmail();
      navigate('/register', { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Xóa tài khoản thất bại';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearAuthState, clearEmail, navigate, setError, setLoading]);

  return {
    user,
    setUser,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    loginWithGoogle,
    register,
    logout,
    fetchProfile,
    updateProfile,
    deleteAccount,
  };
}
