import { Spinner, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useTrendingPublishers } from '../hooks/useTrendingPublishers';
import '../trendingVN.css';

/**
 * Ánh xạ tên nhà xuất bản → URL logo SVG.
 * Nếu tên publisher trong DB khớp một key ở đây, logo tương ứng sẽ được dùng.
 * Nếu không khớp, component sẽ dùng fallback từ ui-avatars.com.
 */
const LOGO_MAP = {
  'Nature Research': 'https://upload.wikimedia.org/wikipedia/commons/b/b7/Nature_logo_2017.svg',
  'Nature Publishing Group': 'https://upload.wikimedia.org/wikipedia/commons/b/b7/Nature_logo_2017.svg',
  'Annual Reviews Inc.': 'https://www.annualreviews.org/assets/images/logo.svg',
  'Cell Press': 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Cell_Press_logo.svg',
  'Elsevier Ltd': 'https://upload.wikimedia.org/wikipedia/commons/8/82/Elsevier_logo.svg',
  'Elsevier B.V.': 'https://upload.wikimedia.org/wikipedia/commons/8/82/Elsevier_logo.svg',
  'Springer Nature': 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Springer_Nature_logo_2015.svg',
  'Oxford University Press': 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Oxford_University_Press_logo.svg',
  'John Wiley and Sons Inc': 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Wiley_logo.svg',
  'Springer': 'https://upload.wikimedia.org/wikipedia/commons/1/18/Springer_logo.svg'
};

/**
 * PublisherGrid – Hiển thị lưới nhà xuất bản lấy từ hook TanStack Query.
 *
 * BE trả về: { success, data: [{ publisher_id, display_name, image_url, created_at }], pagination }
 * Không có trường article_count nên component chỉ hiển thị tên và logo.
 */
export default function PublisherGrid() {
  const { t } = useTranslation();
  const { publishers, isLoading, error } = useTrendingPublishers(8);

  /**
   * Trả về URL logo cho nhà xuất bản.
   * Ưu tiên dùng image_url từ DB, rồi LOGO_MAP, cuối cùng fallback ui-avatars.
   */
  const getLogoUrl = (pub) => {
    // Ưu tiên 1: image_url lưu sẵn trong DB
    if (pub.image_url) return pub.image_url;
    // Ưu tiên 2: logo từ bản đồ LOGO_MAP
    if (LOGO_MAP[pub.display_name]) return LOGO_MAP[pub.display_name];
    // Fallback: avatar tự sinh từ tên
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(pub.display_name)}&background=EAF4FF&color=1976D2&size=128&bold=true`;
  };

  // --- Trạng thái Loading ---
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5 my-5">
        <Spinner animation="border" color="var(--primary)" />
        <span className="ms-2 font-display text-sm text-muted">{t('loadingList')}</span>
      </div>
    );
  }

  // --- Trạng thái Lỗi ---
  if (error) {
    return (
      <Alert variant="danger" className="my-4">
        {error}
      </Alert>
    );
  }

  // --- Trạng thái Trống ---
  if (publishers.length === 0) {
    return (
      <div className="text-center p-5 border rounded bg-white shadow-sm my-4">
        <h5 className="font-display font-weight-bold text-main">{t('noArticlesFound')}</h5>
      </div>
    );
  }

  // --- Render lưới nhà xuất bản ---
  return (
    <div className="publisher-section mb-5">
      <h4 className="publisher-section-title font-display text-main mb-4">
        {t('publisherExact')}
      </h4>

      <div className="publisher-lens-grid">
        {publishers.map((pub, index) => {
          const isLastColumn = (index + 1) % 4 === 0;
          const isLastRow = index >= 4;

          return (
            <div
              key={pub.publisher_id}
              className={`publisher-cell ${isLastColumn ? 'last-col' : ''} ${isLastRow ? 'last-row' : ''}`}
            >
              <div className="logo-container">
                <img
                  src={getLogoUrl(pub)}
                  alt={pub.display_name}
                  className="brand-logo-img"
                  onError={(e) => {
                    // Fallback khi logo không tải được
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(pub.display_name)}&background=F1F5F9&color=64748B&size=128&bold=true`;
                  }}
                />
              </div>
              <div className="publisher-meta-info">
                <div className="publisher-name-txt text-truncate" title={pub.display_name}>
                  {pub.display_name}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
