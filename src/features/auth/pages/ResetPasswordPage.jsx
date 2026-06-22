import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import AuthLayout from '../../../app/layouts/AuthLayout';
import AuthBanner from '../components/AuthBanner';
import ResetPasswordForm from '../components/ResetPasswordForm';
import ResetPasswordSuccess from '../components/ResetPasswordSuccess';
import { resetPasswordApi } from '../api/auth.api';
import Icon from '../../../shared/components/Icon';
import ROUTES from '../../../app/routes/routePaths';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleResetPasswordSubmit = async (password) => {
    if (!token) {
      setError('Thiếu mã xác thực khôi phục mật khẩu. Vui lòng bấm vào liên kết chính xác từ email của bạn.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // API call with token and new_password (backend format is new_password)
      await resetPasswordApi({
        token: token,
        new_password: password
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error('Reset password API failed:', err.response?.data?.message || err.message);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Thay đổi mật khẩu thất bại. Vui lòng thử lại.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout banner={<AuthBanner />}>
      {isSubmitted ? (
        <ResetPasswordSuccess />
      ) : (
        <>
          {/* Logo on mobile only */}
          <div className="d-flex d-md-none align-items-center gap-2 mb-4">
            <div 
              className="d-flex align-items-center justify-content-center"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--btn-dark)',
                boxShadow: '0 4px 10px rgba(7, 26, 28, 0.15)'
              }}
            >
              <Icon icon="lucide:activity" className="text-white text-sm" />
            </div>
            <span 
              className="fs-5 fw-bold font-display" 
              style={{ letterSpacing: '0.03em', color: 'var(--text-main)' }}
            >
              ResearchPulse
            </span>
          </div>

          <div className="mb-4">
            <h2 className="font-display fw-bold mb-1" style={{ fontSize: '1.85rem', color: 'var(--text-main)' }}>
              Đặt lại mật khẩu
            </h2>
            <p className="text-muted-custom text-sm mb-0" style={{ color: 'var(--text-muted)' }}>
              Vui lòng nhập mật khẩu mới của bạn bên dưới.
            </p>
          </div>

          {!token ? (
            <div 
              className="alert alert-danger d-flex align-items-center gap-3 py-3 px-3 border-0 rounded-3 mb-4 text-danger bg-danger bg-opacity-10"
              style={{
                fontSize: '13px',
                fontWeight: 500
              }}
            >
              <Icon icon="lucide:alert-triangle" width="18" className="flex-shrink-0" />
              <div>
                Liên kết khôi phục mật khẩu không hợp lệ hoặc thiếu mã token. Vui lòng kiểm tra lại email của bạn hoặc gửi lại yêu cầu.
                <div className="mt-2">
                  <Link to={ROUTES.FORGOT_PASSWORD} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                    Yêu cầu liên kết mới →
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <ResetPasswordForm
              onSubmit={handleResetPasswordSubmit}
              isLoading={isLoading}
              apiError={error}
            />
          )}

          {/* Link back to Login */}
          {!isSubmitted && (
            <div className="text-center mt-4 text-sm font-medium">
              <span className="text-muted-custom">Quay lại </span>
              <Link to={ROUTES.LOGIN} className="text-decoration-none" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                Đăng nhập
              </Link>
            </div>
          )}
        </>
      )}
    </AuthLayout>
  );
}

