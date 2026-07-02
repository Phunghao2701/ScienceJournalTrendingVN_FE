/**
 * Legacy React context-based auth implementation.
 *
 * File: features/auth/contexts/AuthContext.jsx
 *
 * LEGACY: This context exists alongside the newer useAuth.js hook
 * (features/auth/hooks/useAuth.js). Key differences from useAuth.js:
 *   - Maintains local useState for user/isLoading/error (NOT Zustand)
 *   - Calls auth.api.js directly (NOT via authService.js)
 *   - logout() only clears local component state; does NOT call BE, clear
 *     Zustand, or remove tokens from localStorage
 *   - fetchProfile() failure path removes 'researchpulse_token' from
 *     localStorage directly (fourth location doing token removal in the app)
 *
 * Do not use this context in new code -- prefer useAuth.js instead.
 */
import { createContext, useState, useEffect, useCallback } from 'react';
import {
  loginApi,
  registerApi,
  getProfileApi,
  loginGoogleApi,
  updateProfileApi,
  deleteAccountApi,
} from '../api/auth.api';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from '../../../shared/utils/toast';
import { useAuthStore } from '../../../app/store/authStore';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  
  const [googleRedirect, setGoogleRedirect] = useState("/");
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loginSuccess = useAuthStore((state) => state.loginSuccess);

  const googleLogin = useGoogleLogin({
    flow: "auth-code",

    onSuccess: async (codeResponse) => {
      console.log("Google auth code received:", codeResponse.code); // debug log

      try {
        const result = await loginGoogleApi(codeResponse.code);

        const body = result.data;

        if (body.code == "GOOGLE_LOGIN_SUCCESS") {
          toast.success("Đăng nhập thành công");
          loginSuccess(body.data.token);

          navigate(googleRedirect, { replace: true });
        } else {
          toast.error("Đăng nhập thất bại");
        }
      } catch (error) {
        console.error(error);
        toast.error("Đăng nhập thất bại");
      }
    },

    onError: (error) => {
      console.error(error);
      toast.error("Đăng nhập thất bại");
    },
  });

  //=====================/Define Function/=====================/

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getProfileApi();
      if (response.data && response.data.success !== false) {
        setUser(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data?.message || 'Failed to fetch profile');
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
      setError(err.response?.data?.message || err.message);
      setUser(null);
      localStorage.removeItem('researchpulse_token'); // direct removal; see authStore.logout() for the canonical path
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Calls loginApi and persists the returned token via authStore.loginSuccess().
   * Does NOT write to sessionStorage despite the original JSDoc -- the `remember` flag
   * is forwarded to the BE, which decides cookie lifetime; no sessionStorage logic exists here.
   *
   * @param {string} email
   * @param {string} password
   * @param {boolean} remember - Forwarded to BE for cookie duration; not used client-side here.
   * @returns {Promise<Object>} Full response body on success.
   * @throws {Error} On login failure or unexpected response shape.
   */
  const login = useCallback(async (email, password, remember) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginApi({ email, password, remember });
      if (response.data && response.data.success !== false) {
        const token = response.data.data.token;
        if (token) {
          loginSuccess(token);
        }
        // setUser(userData || null);
        return response.data;
      } else {
        throw new Error(response.data?.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loginSuccess]);

  /**
   * Saves the post-login redirect path and triggers the Google OAuth popup/redirect.
   * The actual token handling happens in useGoogleLogin's onSuccess callback above.
   *
   * @param {string} [redirectTo="/"] - Route to navigate to after successful Google login.
   */
  const loginWithGoogle = (redirectTo = "/") => {
    setGoogleRedirect(redirectTo);
    googleLogin();
  };

  const register = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await registerApi(data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // NOTE: this logout only clears local context state (user = null).
  // It does NOT call the BE, clear Zustand authStore, or remove localStorage tokens.
  // For a full logout, use useAuth.js logout() instead.
  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await updateProfileApi(data);
      if (response.data && response.data.success !== false) {
        setUser(response.data.data);
        return response.data;
      } else {
        throw new Error(response.data?.message || 'Update profile failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await deleteAccountApi();
      if (response.data && response.data.success !== false) {
        logout();
        return response.data;
      } else {
        throw new Error(response.data?.message || 'Delete account failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  // Fetch profile once on mount (fetchProfile is stable via useCallback with [] deps,
  // so this effect runs exactly once). The `if (!user)` guard is redundant for the
  // same reason but acts as a safety check in case fetchProfile is ever made unstable.
  useEffect(() => {
    if (!user) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchProfile]);

  const value = {
    user,
    setUser,
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
