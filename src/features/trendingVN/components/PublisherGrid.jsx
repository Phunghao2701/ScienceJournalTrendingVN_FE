import { useState, useEffect } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import api from '../../../shared/services/api';
import '../trendingVN.css';

/**
 * Publisher name to SVG logo URL mapping.
 * If a publisher's display_name matches a key here its logo is used directly.
 * Otherwise the component falls back to ui-avatars.com.
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
 * PublisherGrid: grid of publishers fetched from GET /publishers (authenticated, uses `api` client).
 *
 * BE response shape: { success, data: [{ publisher_id, display_name, image_url, created_at }], pagination }
 * No article_count field -- only name and logo are displayed.
 * Logo resolution order: DB image_url -> LOGO_MAP -> ui-avatars.com fallback.
 */
export default function PublisherGrid() {
  const { t, i18n } = useTranslation();
  const language = i18n.language || 'vi';

  const [publishers, setPublishers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch up to 8 publishers from GET /publishers on mount
  useEffect(() => {
    const fetchPublishers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // publisher.route.js exposes GET /publishers
        const response = await api.get('/publishers', { params: { limit: 8 } });

        if (response?.data?.success && response?.data?.data) {
          setPublishers(response.data.data);
        } else {
          setError(
            language.startsWith('vi')
              ? 'Không lấy được dữ liệu nhà xuất bản'
              : 'Failed to fetch publisher data'
          );
        }
      } catch (err) {
        console.error('Error fetching publishers:', err);
        setError(
          language.startsWith('vi')
            ? 'Lỗi kết nối máy chủ'
            : 'Network error connecting to backend'
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchPublishers();
  }, [language]);

  // Resolve logo URL: DB image_url -> LOGO_MAP -> ui-avatars fallback
  const getLogoUrl = (pub) => {
    // Priority 1: image_url stored in DB
    if (pub.image_url) return pub.image_url;
    // Priority 2: hardcoded logo from LOGO_MAP
    if (LOGO_MAP[pub.display_name]) return LOGO_MAP[pub.display_name];
    // Priority 3: auto-generated avatar from display_name
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(pub.display_name)}&background=EAF4FF&color=1976D2&size=128&bold=true`;
  };

  // -- Loading state --
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5 my-5">
        <Spinner animation="border" color="var(--primary)" />
        <span className="ms-2 font-display text-sm text-muted">{t('loadingList')}</span>
      </div>
    );
  }

  // -- Error state --
  if (error) {
    return (
      <Alert variant="danger" className="my-4">
        {error}
      </Alert>
    );
  }

  // -- Empty state --
  if (publishers.length === 0) {
    return (
      <div className="text-center p-5 border rounded bg-white shadow-sm my-4">
        <h5 className="font-display font-weight-bold text-main">{t('noArticlesFound')}</h5>
      </div>
    );
  }

  // -- Render publisher grid --
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
                    // Fallback if the logo image fails to load
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
