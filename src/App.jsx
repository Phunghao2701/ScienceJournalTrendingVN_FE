import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './app/routes/AppRoutes';
import AppToast from './shared/components/AppToast';
import { isAuthenticated } from './shared/utils/auth';

function AuthInitializer({ children }) {
  useEffect(() => {
    // Tự động kiểm tra và khôi phục session từ cookie ngay khi mở trang web (SSO)
    isAuthenticated().catch(() => {});
  }, []);

  return children;
}

function App() {
  return (
    <>
      <AppToast />
      <AuthInitializer>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthInitializer>
    </>
  );
}

export default App;
