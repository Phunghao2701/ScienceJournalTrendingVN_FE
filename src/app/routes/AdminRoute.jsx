import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * Chặn khu vực /admin cho tài khoản không có quyền ADMINISTRATOR.
 * Nếu user nhập trực tiếp URL admin trên thanh địa chỉ, hệ thống đưa về landing page.
 */
export default function AdminRoute() {
  const user = useAuthStore((state) => state.user);

  return user?.role === 'ADMINISTRATOR' ? <Outlet /> : <Navigate to="/" replace />;
}
