export default function ProfileErrorState({ error, onRetry }) {
  return (
    <div className="error-state">
      <div className="error-box">
        <h3>Đã xảy ra lỗi</h3>
        <p>{error}</p>
        <button onClick={onRetry} className="retry-btn">
          Thử lại
        </button>
      </div>
    </div>
  );
}
