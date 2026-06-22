import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import SubmitButton from './SubmitButton';

export default function ResetPasswordSuccess() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) {
      navigate('/login', { replace: true });
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  const handleRedirect = () => {
    navigate('/login', { replace: true });
  };

  return (
    <div className="text-center py-4 animate-fade-in">
      <div 
        className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
        style={{ 
          width: '4.5rem', 
          height: '4.5rem', 
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)'
        }}
      >
        <Icon icon="lucide:check-circle" width="40" height="40" />
      </div>

      <h3 className="font-display fw-bold mb-3 text-main" style={{ fontSize: '1.75rem' }}>
        Đặt lại mật khẩu thành công!
      </h3>
      
      <p className="text-muted-custom text-sm mb-4 leading-relaxed" style={{ lineHeight: 1.6 }}>
        Mật khẩu của bạn đã được cập nhật thành công. Hệ thống sẽ tự động chuyển bạn về trang Đăng nhập sau <strong>{countdown}</strong> giây.
      </p>

      {/* Button Action */}
      <SubmitButton
        isLoading={false}
        onClick={handleRedirect}
        label="Đăng nhập ngay"
      />
    </div>
  );
}
