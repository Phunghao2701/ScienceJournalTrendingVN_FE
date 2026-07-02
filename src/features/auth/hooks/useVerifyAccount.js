// useVerifyAccount.js
// Manages all logic for the email verification page.
// The page component contains no logic -- it only calls this hook.
//
// Data flow: reads ?token= from URL -> calls verifyEmailApi (auth.api.js directly,
// not via authService) -> on success, starts a countdown then navigates to /login.

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ROUTES from '../../../app/routes/routePaths';
import { verifyEmailApi } from '../api/auth.api';

// Seconds to count down before auto-redirecting to /login after successful verification.
const COUNTDOWN_SECONDS = 5;

const useVerifyAccount = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // --- States ---
  const [status, setStatus] = useState('loading');   // 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  // --- Refs ---
  // hasCalled prevents the verify API from firing twice in React StrictMode double-mount.
  const hasCalled = useRef(false);
  const countdownRef = useRef(null); // holds the setInterval id so it can be cleared early

  // --- Step 1: Call the verify API once on mount ---
  useEffect(() => {
    if (hasCalled.current) return;
    hasCalled.current = true;

    

    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setErrorMessage('Liên kết kích hoạt không hợp lệ hoặc đã hết hạn.');
      return;
    }

    verifyEmailApi(token)
      .then(() => {
        setStatus('success');
      })
      .catch((err) => {
        setStatus('error');
        const message =
          err?.response?.data?.message ||
          'Liên kết kích hoạt không hợp lệ hoặc đã hết hạn.';
        setErrorMessage(message);
      });
  }, [searchParams]);

  // --- Step 2: When status becomes 'success', start the countdown to /login ---
  useEffect(() => {
    if (status !== 'success') return;

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          navigate(ROUTES.LOGIN);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(countdownRef.current);
    };
  }, [status, navigate]);

  // --- Handlers ---
  const goToLogin = () => {
    clearInterval(countdownRef.current);
    navigate(ROUTES.LOGIN);
  };

  const goToHome = () => {
    clearInterval(countdownRef.current);
    navigate(ROUTES.HOME);
  };

  const goToRegister = () => {
    navigate(ROUTES.REGISTER);
  };

  return {
    status,
    errorMessage,
    countdown,
    totalSeconds: COUNTDOWN_SECONDS,
    goToLogin,
    goToHome,
    goToRegister,
  };
};

export default useVerifyAccount;