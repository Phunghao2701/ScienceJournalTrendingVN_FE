/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: App.jsx
 */
import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './app/routes/AppRoutes';
import AppToast from './shared/components/AppToast';
import { initializeSsoSession } from './features/auth/services/ssoSession';
import BookmarkSessionSync from './features/bookmark/components/BookmarkSessionSync';

function App() {
  useEffect(() => {
    initializeSsoSession().catch((error) => {
      console.error('Unable to initialize the authentication session', error);
    });
  }, []);

  return (
    <>
      <AppToast />
      <BookmarkSessionSync />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </>
  );
}

export default App;
