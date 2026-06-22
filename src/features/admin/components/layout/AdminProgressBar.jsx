/**
 * Mục đích:
 * - Thanh tiến trình hiển thị % hoàn thành của 1 Volume trong bảng
 *   Volume & Issue Overview.
 * - Khác với shared/components/ProgressBar.jsx (dùng cho countdown với
 *   props current/total), component này nhận trực tiếp "percentage"
 *   (0-100) - phù hợp với mock data (progress: 100, 25...).
 * - Không tái sử dụng/sửa shared ProgressBar để tránh ảnh hưởng tới
 *   luồng countdown ở Reset Password / Verify Email (giữ nguyên
 *   business logic hiện tại theo yêu cầu).
 */

export default function AdminProgressBar({ percentage }) {
  // Giới hạn percentage trong khoảng 0-100 để tránh tràn thanh progress
  const safePercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <div className="admin-progress-track">
      <div
        className="admin-progress-fill"
        style={{ width: `${safePercentage}%` }}
      />
    </div>
  );
}
