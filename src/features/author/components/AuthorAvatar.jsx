/**
 * @file AuthorAvatar.jsx
 * @description Component hiển thị ảnh đại diện (avatar) của tác giả.
 * 
 * Chức năng chính:
 * - Hiển thị ảnh chân dung của tác giả nếu có đường dẫn URL hợp lệ.
 * - Nếu không có ảnh, tự động trích xuất chữ cái viết tắt từ tên tác giả và hiển thị trên nền tròn màu sắc.
 * - Hỗ trợ nhiều kích thước (sm, md, lg, xl) và tùy biến màu nền.
 */

/**
 * Component hiển thị Avatar hình tròn.
 * 
 * @param {Object} props - Thuộc tính truyền vào component.
 * @param {string} [props.name='Tác giả'] - Tên của tác giả để tạo chữ cái viết tắt.
 * @param {string} [props.url=''] - Đường dẫn ảnh đại diện.
 * @param {string} [props.size='md'] - Kích thước ("sm", "md", "lg", "xl").
 * @param {string} [props.bgColor=''] - Mã màu nền tùy chọn.
 * @param {string} [props.className=''] - Lớp CSS tùy chọn bổ sung.
 * @returns {JSX.Element} Giao diện ảnh đại diện hoặc chữ viết tắt của tác giả.
 */
export default function AuthorAvatar({
  name = 'Tác giả',
  url = '',
  size = 'md',
  bgColor = '',
  className = ''
}) {
  const nameStr = String(name || 'Tác giả');
  
  // Trích xuất chữ cái đầu tiên của hai từ cuối trong tên tác giả
  const initials = nameStr
    .split(' ')
    .filter(Boolean)
    .slice(-2) // Lấy hai từ cuối (ví dụ: "Văn A" -> "V", "A")
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');

  // Sử dụng chữ cái cuối cùng làm chữ cái hiển thị nếu không tìm thấy chuỗi phù hợp
  const displayInitials = initials.length > 0 ? initials.slice(-1) : '?'; 

  // Bản đồ kích thước (rộng, cao, cỡ chữ) tương ứng với các lựa chọn kích cỡ
  const sizeMap = {
    sm: { width: '32px', height: '32px', fontSize: '0.75rem' },
    md: { width: '48px', height: '48px', fontSize: '1.1rem' },
    lg: { width: '80px', height: '80px', fontSize: '1.8rem' },
    xl: { width: '100px', height: '100px', fontSize: '2.2rem' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Xác định kiểu màu nền: màu tùy chọn hoặc dải màu gradient mặc định
  const bgStyle = bgColor 
    ? { backgroundColor: bgColor } 
    : { background: 'linear-gradient(135deg, var(--btn-dark) 0%, var(--primary) 100%)' };

  return (
    <div
      className={`d-flex align-items-center justify-content-center rounded-circle text-white font-weight-bold flex-shrink-0 select-none ${className}`}
      style={{
        ...currentSize,
        ...bgStyle,
        fontWeight: 700,
        fontFamily: 'var(--font-sans)',
        boxShadow: size === 'xl' || size === 'lg' ? '0 10px 25px rgba(0,0,0,0.05)' : 'none',
        overflow: 'hidden'
      }}
    >
      {url ? (
        <img
          src={url}
          alt={name}
          className="w-100 h-100 object-fit-cover"
          onError={(e) => {
            e.target.style.display = 'none'; // Ẩn thẻ ảnh và quay về hiển thị chữ cái viết tắt nếu tải ảnh lỗi
          }}
        />
      ) : (
        <span>{displayInitials}</span>
      )}
    </div>
  );
}
