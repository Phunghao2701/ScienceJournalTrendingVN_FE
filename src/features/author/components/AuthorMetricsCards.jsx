/**
 * @file AuthorMetricsCards.jsx
 * @description Component hiển thị hàng thẻ chỉ số học thuật tóm tắt của tác giả (Bài báo, Trích dẫn, H-index, i10-index).
 * 
 * Chức năng chính:
 * - Hiển thị 4 thẻ chỉ số nhanh cho giao diện chi tiết tác giả.
 * - Sử dụng grid `xs={6} md={3}` để tự động hiển thị dạng lưới 2x2 trên mobile và 1x4 trên desktop.
 * - Hỗ trợ hiệu ứng hover viền và bóng đổ mượt mà.
 */

import { Row, Col, Card } from 'react-bootstrap';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';

/**
 * Component hiển thị 4 thẻ chỉ số học thuật nhanh của tác giả.
 * 
 * @param {Object} props - Thuộc tính truyền vào component.
 * @param {Object} props.stats - Các chỉ số bao gồm: { worksCount, citationsCount, hIndex, i10Index }.
 * @param {boolean} [props.loading=false] - Trạng thái loading.
 * @returns {JSX.Element} Giao diện hàng thẻ chỉ số.
 */
export default function AuthorMetricsCards({ stats, loading = false }) {
  
  // ── HIỂN THỊ LOADING SKELETON ───────────────────────────────────────────────
  // Hiển thị 4 khung xương (skeleton shimmer) tương ứng với 4 thẻ metrics khi dữ liệu đang tải
  if (loading) {
    return (
      <Row className="g-3 mb-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Col xs={6} md={3} key={idx}>
            <Card className="p-3 border rounded-3 bg-white">
              <LoadingSkeleton width="40px" height="12px" className="mb-2" />
              <LoadingSkeleton width="70%" height="24px" />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  // Giải nén các chỉ số học thuật với giá trị mặc định là 0
  const {
    worksCount = 0,
    citationsCount = 0,
    hIndex = 0,
    i10Index = 0
  } = stats || {};

  /**
   * Định dạng số theo chuẩn phân cách hàng nghìn bằng dấu chấm (ví dụ: 4520 -> 4.520)
   * Đồng thời thu gọn các số cực lớn bằng hậu tố K/M.
   * 
   * @param {number} num - Số cần định dạng.
   * @returns {string} Chuỗi số đã định dạng.
   */
  const formatLocalNumber = (num) => {
    if (num == null) return '0';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Danh sách các thẻ chỉ số hiển thị
  const metricItems = [
    { label: 'Bài báo', value: formatLocalNumber(worksCount) },
    { label: 'Citations', value: formatLocalNumber(citationsCount) },
    { label: 'H-index', value: hIndex },
    { label: 'i10-index', value: i10Index }
  ];

  return (
    <Row className="g-3 mb-4">
      {metricItems.map((item, idx) => (
        <Col xs={6} md={3} key={idx}>
          <Card 
            className="p-3 text-center border transition-all"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border)',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.01)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 122, 51, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.01)';
            }}
          >
            {/* Nhãn của chỉ số */}
            <div 
              className="text-muted-custom" 
              style={{ fontSize: '0.72rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              {item.label}
            </div>
            {/* Giá trị số của chỉ số hiển thị màu cam nổi bật */}
            <div 
              className="fw-bold mt-1.5" 
              style={{ fontSize: '1.5rem', color: 'var(--primary)', fontFamily: 'var(--font-sans)', lineHeight: '1.1' }}
            >
              {item.value}
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
