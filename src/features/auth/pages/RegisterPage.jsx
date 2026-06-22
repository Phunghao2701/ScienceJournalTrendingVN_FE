/**
 * Trang đăng ký tài khoản mới.
 *
 * File: features/auth/pages/RegisterPage.jsx
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import AuthLayout from '../../../app/layouts/AuthLayout';
import AuthBanner from '../components/AuthBanner';
import RegisterForm from '../components/RegisterForm';
import Icon from '../../../shared/components/Icon';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  // State phục vụ UI đăng ký: loading, lỗi API, màn hình thành công.
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  /**
   * Gửi form đăng ký lên backend.
   * Nếu API không ném lỗi, hiển thị màn hình thông báo xác thực email.
   */
  const handleRegisterSubmit = async (payload) => {
    setIsLoading(true);
    setError(null);

    try {
      setRegisteredEmail(payload.email);
      await register(payload);
      setIsSuccess(true);
    } catch (err) {
      console.error('Registration failed:', err.response?.data?.message || err.message);
      setError(
        err.response?.data?.message
        || err.message
        || 'Đăng ký không thành công. Vui lòng thử lại.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Placeholder cho Google OAuth ở trang đăng ký.
   * Hiện chức năng này chưa bật trực tiếp tại màn hình register.
   */
  const handleGoogleAuth = () => {
    alert('Đăng nhập/Đăng ký bằng Google OAuth đang được cấu hình.');
  };

  return (
    <AuthLayout banner={<AuthBanner />}>
      {isSuccess ? (
        <div className="text-center py-4 animate-fade-in">
          <div
            className="d-inline-flex align-items-center justify-content-center mb-4"
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '2px solid #10b981',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.1)',
            }}
          >
            <Icon icon="lucide:check-circle" className="text-success" style={{ fontSize: '40px' }} />
          </div>

          <h2 className="font-display fw-bold mb-3" style={{ fontSize: '1.75rem', color: 'var(--text-main)' }}>
            Đăng ký thành công!
          </h2>

          <p className="text-muted-custom mb-4" style={{ color: 'var(--text-muted) !important', lineHeight: '1.6', fontSize: '14px' }}>
            Một email xác thực đã được gửi tới địa chỉ <strong style={{ color: 'var(--text-main)' }}>{registeredEmail}</strong>. Vui lòng kiểm tra hộp thư (hoặc thư rác) và làm theo hướng dẫn để kích hoạt tài khoản của bạn.
          </p>

          <button
            onClick={() => navigate('/login')}
            className="w-100 py-2.5 rounded-3 border-0 text-sm font-semibold transition-all"
            style={{
              background: 'var(--btn-dark)',
              color: '#ffffff',
              boxShadow: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--btn-dark)';
            }}
          >
            Đi đến Đăng nhập
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <h2 className="font-display fw-bold mb-1" style={{ fontSize: '1.85rem', color: 'var(--text-main)' }}>
              Tạo tài khoản
            </h2>
            <p className="text-muted-custom text-sm mb-0" style={{ color: 'var(--text-muted) !important' }}>
              Đăng ký miễn phí, không cần thẻ tín dụng.
            </p>
          </div>

          {/* Đường phân cách giữa phần tiêu đề và form đăng ký. */}
          <div className="d-flex align-items-center justify-content-center mb-4 text-xs font-semibold select-none text-muted-custom" style={{ color: 'var(--text-muted) !important' }}>
            <div className="w-100" style={{ height: '1px', background: 'var(--border)' }} />
            <div className="w-100" style={{ height: '1px', background: 'var(--border)' }} />
          </div>

          <RegisterForm
            onSubmit={handleRegisterSubmit}
            isLoading={isLoading}
            apiError={error}
            onGoogleAuth={handleGoogleAuth}
          />
        </>
      )}
    </AuthLayout>
  );
}
