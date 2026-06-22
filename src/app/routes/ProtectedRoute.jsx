import { useAuthStore } from "../store/authStore";
import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { isAuthenticated as checkAuthStatus } from "../../shared/utils/auth";

const ProtectedRoute = () => {
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

  if (loading) return <div>Đang kiểm tra quyền truy cập...</div>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;

