/**
 * Trang đăng nhập người dùng.
 *
 * File: features/auth/pages/LoginPage.jsx
 */
import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import AuthLayout from '../../../app/layouts/AuthLayout';
import AuthBanner from '../components/AuthBanner';
import LoginForm from '../components/LoginForm';
import SocialAuthButton from '../components/SocialAuthButton';
import { toast } from '../../../shared/utils/toast';
import ROUTES from '../../../app/routes/routePaths';

const DASHBOARD_PAGE = ROUTES.DASHBOARD;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();

  // State riêng của màn hình login để điều khiển loading và lỗi form.
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Nếu người dùng bị redirect tới login từ một trang khác, đăng nhập xong quay lại trang đó.
  const from = location.state?.from?.pathname || DASHBOARD_PAGE;

  /**
   * Xử lý submit form đăng nhập bằng email/password.
   * Thành công thì điều hướng tới trang trước đó hoặc dashboard.
   */
  const handleLoginSubmit = async (payload) => {
    setIsLoading(true);
    setError(null);

    try {
      await login(payload.email, payload.password, payload.remember_login);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login failed:', err.response?.data?.message || err.message);
      setError(
        err.response?.data?.message
        || err.message
        || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Khởi chạy luồng đăng nhập Google OAuth.
   * Sau khi thành công, hook `useAuth` sẽ tự điều hướng về dashboard.
   */
  const handleLoginWithGoogle = () => {
    setIsLoading(true);
    setError(null);

    try {
      loginWithGoogle(DASHBOARD_PAGE);
    } catch {
      toast.error('Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout banner={<AuthBanner />}>
      <div className="mb-4">
        <h2 className="font-display fw-bold mb-1" style={{ fontSize: '1.85rem', color: 'var(--text-main)' }}>
          Đăng nhập
        </h2>
        <p className="text-muted-custom text-sm mb-0" style={{ color: 'var(--text-muted) !important' }}>
          Chào mừng trở lại! Vui lòng nhập thông tin đăng nhập của bạn.
        </p>
      </div>

      {/* Nút đăng nhập bằng Google OAuth. */}
      <div className="mb-4">
        <SocialAuthButton onClick={handleLoginWithGoogle} disabled={isLoading} />
      </div>

      {/* Đường phân cách giữa Google OAuth và form email/password. */}
      <div className="d-flex align-items-center justify-content-center mb-4 text-xs font-semibold select-none text-muted-custom" style={{ color: 'var(--text-muted) !important' }}>
        <div className="w-100" style={{ height: '1px', background: 'var(--border)' }} />
        <span className="px-3 text-nowrap" style={{ letterSpacing: '0.05em' }}>HOẶC</span>
        <div className="w-100" style={{ height: '1px', background: 'var(--border)' }} />
      </div>

      <LoginForm
        onSubmit={handleLoginSubmit}
        isLoading={isLoading}
        apiError={error}
      />

      {/* Điều hướng sang trang đăng ký nếu người dùng chưa có tài khoản. */}
      <div className="text-center mt-4 text-sm font-medium">
        <span className="text-muted-custom" style={{ color: '#94a3b8 !important' }}>Chưa có tài khoản? </span>
        <Link to={ROUTES.REGISTER} className="text-decoration-none" style={{ color: 'var(--primary)', fontWeight: 600 }}>
          Đăng ký miễn phí
        </Link>
      </div>
    </AuthLayout>
  );
}
