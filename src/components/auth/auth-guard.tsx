"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isAuthenticated as checkIsAuthenticated } from "@/api/api-client";
import { useAuthHydrated } from "@/stores/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Wait for the auth store's localStorage rehydration (see
    // `skipHydration` in stores/auth-store.ts) — otherwise this always
    // reads a not-yet-hydrated `null` accessToken and fires an unnecessary
    // (and possibly flaky) token-reissue call even when a valid token is
    // already sitting in localStorage.
    if (!hydrated) return;

    let cancelled = false;

    async function checkAuth() {
      const ok = await checkIsAuthenticated();
      if (cancelled) return;

      if (ok) {
        setAuthenticated(true);
      } else {
        router.replace("/login");
      }
    }

    void checkAuth();

    return () => {
      cancelled = true;
    };
  }, [router, hydrated]);

  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}
