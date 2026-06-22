// Component hiển thị giao diện trống (Empty State)
// Dùng để thông báo cho người dùng khi danh sách hoặc kết quả tìm kiếm không có dữ liệu

import { Button } from 'react-bootstrap';
import Icon from './Icon';

/**
 * Thành phần hiển thị giao diện thông báo trực quan khi không tìm thấy dữ liệu.
 * 
 * @param {Object} props - Thuộc tính truyền vào component.
 * @param {string} [props.title='Không có dữ liệu'] - Tiêu đề thông báo.
 * @param {string} [props.description='Không tìm thấy kết quả phù hợp.'] - Mô tả chi tiết thông báo trống.
 * @param {string} [props.icon='lucide:folder-open'] - Icon hiển thị.
 * @param {string} [props.actionLabel=''] - Nhãn của nút hành động đi kèm (nếu có).
 * @param {Function} [props.onAction=null] - Hàm xử lý sự kiện khi click nút hành động.
 * @param {string} [props.className=''] - Lớp CSS tùy chọn bổ sung.
 * @returns {JSX.Element} Giao diện trạng thái trống.
 */
export default function EmptyState({
  title = 'Không có dữ liệu', // Tiêu đề thông báo
  description = 'Không tìm thấy kết quả phù hợp.', // Mô tả chi tiết thông báo trống
  icon = 'lucide:folder-open', // Icon hiển thị
  actionLabel = '', // Nhãn của nút hành động đi kèm (nếu có)
  onAction = null, // Hàm xử lý sự kiện khi click nút hành động
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
      {/* Vùng hiển thị Icon tròn */}
      <div 
        className="d-flex align-items-center justify-content-center mb-3 text-muted-custom"
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-section)'
        }}
      >
        <Icon icon={icon} width="32" className="opacity-75" />
      </div>
      
      {/* Tiêu đề trạng thái trống */}
      <h3 
        className="text-main fw-bold mb-2"
        style={{ fontSize: '1.1rem', fontFamily: 'var(--font-sans)' }}
      >
        {title}
      </h3>
      
      {/* Mô tả chi tiết trạng thái trống */}
      <p 
        className="text-muted-custom mb-4 mx-auto"
        style={{ fontSize: '0.85rem', maxWidth: '380px', lineHeight: '1.5' }}
      >
        {description}
      </p>
      
      {/* Nút hành động đi kèm (ví dụ: Tạo mới, Thử lại, Reset bộ lọc) */}
      {actionLabel && onAction && (
        <Button 
          className="btn-primary-glow rounded-pill px-4 py-2 text-xs font-bold"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
