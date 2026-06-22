// ErrorState.jsx
// Hiển thị khi token không hợp lệ, hết hạn, hoặc không có token trên URL.
// Không tự redirect — user tự chọn hành động tiếp theo.

import ErrorIcon from './ErrorIcon';
import AuthActionButtons from './AuthActionButtons';

const ErrorState = ({ message, onLogin, onRegister }) => {
  return (
    <div>
      {/* Icon cảnh báo màu cam */}
      <ErrorIcon />

      {/* Heading */}
      <h4
        className="text-center mb-2"
        style={{
          fontFamily: "'Source Serif 4', serif",
          fontWeight: 600,
          color: 'var(--text-main, #0D1B1C)',
        }}
      >
        Kích hoạt tài khoản thất bại
      </h4>

      {/* Message lỗi — từ BE hoặc default */}
      <p
        className="text-center mb-4"
        style={{
          fontSize: '0.93rem',
          color: 'var(--text-muted, #6B6B6B)',
          lineHeight: 1.6,
        }}
      >
        {message || 'Liên kết kích hoạt không hợp lệ hoặc đã hết hạn.'}
      </p>

      {/* Buttons */}
      <AuthActionButtons
        status="error"
        onLogin={onLogin}
        onRegister={onRegister}
      />
    </div>
  );
};

export default ErrorState;