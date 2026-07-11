import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { isAuthenticated as checkAuthStatus } from "../../shared/utils/auth";

const PublicRoute = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await checkAuthStatus();
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) return <div>Đang tải...</div>;
  
  // 🔥 Nếu đã đăng nhập thành công -> Đá ngược về trang chính, không cho xem trang login nữa
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicRoute;