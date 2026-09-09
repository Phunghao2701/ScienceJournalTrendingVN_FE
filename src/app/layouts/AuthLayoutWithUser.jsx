import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { isAuthenticated } from "../../shared/utils/auth";
import { useAuthStore } from "../store/authStore";

/**
 * AuthLayoutWithUser
 * - Check token/session once on route entry
 * - Hydrate Zustand (useAuthStore + userStore) via isAuthenticated()
 * - Use catch to avoid unhandled promise rejections / minimize server calls
 */
export default function AuthLayoutWithUser() {
  const [booting, setBooting] = useState(true);
  const hasAuth = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      await isAuthenticated()
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setBooting(false);
        });
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [hasAuth]);

  if (booting) return <div />;
  return <Outlet />;
}
