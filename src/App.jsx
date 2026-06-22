/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: App.jsx
 */
import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './app/routes/AppRoutes';
import AppToast from './shared/components/AppToast';
import { isAuthenticated } from './shared/utils/auth';

function App() {
  return (
    <>
      <AppToast />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </>
  );
}

export default App;
