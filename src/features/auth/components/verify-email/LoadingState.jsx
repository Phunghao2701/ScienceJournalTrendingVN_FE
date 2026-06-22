// LoadingState.jsx
// Hiển thị khi đang gọi API verify token.
// Không có button — user chỉ cần chờ.

const LoadingState = () => {
  return (
    <div className="text-center py-3">
      {/* Spinner Bootstrap */}
      <div
        className="spinner-border mb-4"
        role="status"
        style={{
          color: 'var(--primary, #FF7A33)',
          width: '3rem',
          height: '3rem',
        }}
      >
        <span className="visually-hidden">Đang tải...</span>
      </div>

      {/* Heading */}
      <h5
        style={{
          fontFamily: "'Source Serif 4', serif",
          fontWeight: 600,
          color: 'var(--text-main, #0D1B1C)',
          marginBottom: '0.5rem',
        }}
      >
        Đang xác thực tài khoản...
      </h5>

      {/* Mô tả */}
      <p
        style={{
          fontSize: '0.9rem',
          color: 'var(--text-muted, #6B6B6B)',
          marginBottom: 0,
        }}
      >
        Vui lòng chờ trong giây lát.
      </p>
    </div>
  );
};

export default LoadingState;