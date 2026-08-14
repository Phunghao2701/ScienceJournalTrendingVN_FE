import { useTranslation } from 'react-i18next';

export default function ProfileErrorState({ error, onRetry }) {
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage?.startsWith('vi');

  const errorTitle = isVi ? 'Đã xảy ra lỗi' : 'An error occurred';
  const retryText = isVi ? 'Thử lại' : 'Retry';

  return (
    <div className="error-state">
      <div className="error-box">
        <h3>{errorTitle}</h3>
        <p>{error}</p>
        <button onClick={onRetry} className="retry-btn">
          {retryText}
        </button>
      </div>
    </div>
  );
}
