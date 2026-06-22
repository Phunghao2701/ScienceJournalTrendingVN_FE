/**
 * Hook auth dùng chung cho các màn hình đăng nhập, đăng ký và profile.
 *
 * File: features/auth/hooks/useAuth.js
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
 * Gom toàn bộ thao tác auth vào một hook duy nhất.
 *
 * Hook này đọc/ghi state qua Zustand, còn việc gọi API được tách sang
 * `authService` để component page không phải biết chi tiết endpoint.
 */
export default function useAuth() {
  const navigate = useNavigate();
  const [googleRedirect, setGoogleRedirect] = useState('/');

  // State auth chính lấy từ Zustand store.
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

  // Store phụ dùng để hiển thị email trên header/landing.
  const setEmail = useUserStore((state) => state.setEmail);
  const clearEmail = useUserStore((state) => state.clearEmail);

  /**
   * Lấy profile người dùng hiện tại từ backend.
   * Dùng sau login hoặc khi cần đồng bộ lại thông tin cá nhân.
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
   * Cấu hình Google OAuth dạng auth-code.
   * Sau khi Google trả code, FE gửi code đó về BE để BE xác thực và trả token/user.
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
   * Đăng nhập bằng email/password.
   * `remember` quyết định BE có set refresh-token cookie dài hạn hay không.
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
   * Mở popup/redirect Google OAuth và ghi nhớ trang cần quay lại sau login.
   */
  const loginWithGoogle = useCallback((redirectTo = '/') => {
    setGoogleRedirect(redirectTo);
    googleLogin();
  }, [googleLogin]);

  /**
   * Đăng ký tài khoản mới.
   * BE sẽ gửi email xác thực nếu tạo tài khoản thành công.
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
   * Đăng xuất: gọi BE clear session/cookie, sau đó xóa state FE.
   */
  const logout = useCallback(async () => {
    await logoutSession();
    clearAuthState();
    clearEmail();
    navigate('/login', { replace: true });
  }, [clearAuthState, clearEmail, navigate]);

  /**
   * Cập nhật profile user và đồng bộ lại store sau khi API thành công.
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
   * Xóa tài khoản hiện tại rồi đưa người dùng về trang đăng ký.
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
