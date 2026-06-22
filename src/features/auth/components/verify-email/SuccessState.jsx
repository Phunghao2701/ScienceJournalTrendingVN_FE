// SuccessState.jsx
// Hiển thị khi API verify trả về thành công.
// Gồm: icon, heading, mô tả, countdown, buttons.

import SuccessIcon from './SuccessIcon';
import CountdownRedirect from '../../../../shared/components/CountdownRedirect';
import AuthActionButtons from './AuthActionButtons';

const SuccessState = ({ countdown, totalSeconds, onLogin, onHome }) => {
  return (
    <div>
      {/* Icon checkmark xanh lá */}
      <SuccessIcon />

      {/* Heading */}
      <h4
        className="text-center mb-2"
        style={{
          fontFamily: "'Source Serif 4', serif",
          fontWeight: 600,
          color: 'var(--text-main, #0D1B1C)',
        }}
      >
        Kích hoạt tài khoản thành công
      </h4>

      {/* Mô tả */}
      <p
        className="text-center mb-4"
        style={{
          fontSize: '0.93rem',
          color: 'var(--text-muted, #6B6B6B)',
          lineHeight: 1.6,
        }}
      >
        Tài khoản của bạn đã được kích hoạt thành công. Bây giờ bạn có thể
        đăng nhập và bắt đầu sử dụng{' '}
        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
          ResearchPulse
        </span>
        .
      </p>

      {/* Countdown + Progress bar */}
      <CountdownRedirect countdown={countdown} total={totalSeconds} />

      {/* Buttons */}
      <AuthActionButtons
        status="success"
        onLogin={onLogin}
        onHome={onHome}
      />
    </div>
  );
};

export default SuccessState;