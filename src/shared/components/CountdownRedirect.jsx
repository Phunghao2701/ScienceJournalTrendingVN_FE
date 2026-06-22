// CountdownRedirect.jsx
// Hiển thị text đếm ngược + progress bar.
// Đặt trong shared/ để tái sử dụng ở nhiều flow auth.

import ProgressBar from './ProgressBar';

const CountdownRedirect = ({ countdown, total }) => {
  return (
    <div className="mb-4">
      <p
        className="text-center mb-2"
        style={{
          fontSize: '0.875rem',
          color: 'var(--text-muted, #6B6B6B)',
        }}
      >
        {'Tự động chuyển đến trang đăng nhập sau '}
        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
          {countdown} giây
        </span>
        {'...'}
      </p>
      <ProgressBar current={countdown} total={total} />
    </div>
  );
};

export default CountdownRedirect;