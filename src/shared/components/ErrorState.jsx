// Component hiển thị giao diện báo lỗi (Error State)
// Dùng để thông báo cho người dùng khi có lỗi kết nối hoặc API thất bại và cho phép click thử lại

import { Button } from 'react-bootstrap';
import Icon from './Icon';

/**
 * Thành phần hiển thị thông báo lỗi kèm nút bấm hành động thử lại (Retry).
 * 
 * @param {Object} props - Thuộc tính truyền vào component.
 * @param {string} [props.title='Không thể tải dữ liệu'] - Tiêu đề lỗi chính.
 * @param {string} [props.message='Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.'] - Chi tiết thông báo lỗi.
 * @param {string} [props.icon='lucide:alert-triangle'] - Icon biểu thị cảnh báo lỗi.
 * @param {Function} [props.onRetry=null] - Hàm xử lý sự kiện khi bấm nút thử lại.
 * @param {string} [props.retryLabel='Thử lại'] - Nhãn nút thử lại.
 * @param {string} [props.className=''] - Lớp CSS tùy chọn bổ sung.
 * @returns {JSX.Element} Giao diện thông báo lỗi.
 */
export default function ErrorState({
  title = 'Không thể tải dữ liệu', // Tiêu đề lỗi chính
  message = 'Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.', // Chi tiết thông báo lỗi
  icon = 'lucide:alert-triangle', // Icon biểu thị cảnh báo lỗi
  onRetry = null, // Hàm xử lý sự kiện khi bấm nút thử lại
  retryLabel = 'Thử lại', // Nhãn nút thử lại
  className = ''
}) {
  return (
    <div 
      className={`d-flex flex-column align-items-center justify-content-center text-center py-5 px-4 rounded-3 border ${className}`}
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border)',
        minHeight: '260px'
      }}
    >
      {/* Vùng hiển thị Icon cảnh báo màu đỏ nhạt */}
      <div 
        className="d-flex align-items-center justify-content-center mb-3 text-danger"
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.08)'
        }}
      >
        <Icon icon={icon} width="30" />
      </div>
      
      {/* Tiêu đề lỗi */}
      <h3 
        className="text-main fw-bold mb-2"
        style={{ fontSize: '1.1rem', fontFamily: 'var(--font-sans)' }}
      >
        {title}
      </h3>
      
      {/* Mô tả lỗi chi tiết */}
      <p 
        className="text-muted-custom mb-4 mx-auto"
        style={{ fontSize: '0.85rem', maxWidth: '380px', lineHeight: '1.5' }}
      >
        {message}
      </p>
      
      {/* Nút bấm để thực hiện tải lại dữ liệu (Retry) */}
      {onRetry && (
        <Button 
          className="btn-dark-solid rounded-pill px-4 py-2 text-xs font-bold"
          onClick={onRetry}
        >
          <Icon icon="lucide:rotate-cw" width="12" className="me-1.5" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
