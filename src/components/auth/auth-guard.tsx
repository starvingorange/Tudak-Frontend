"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isAuthenticated as checkIsAuthenticated } from "@/api/api-client";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
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
  }, [router]);

  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}
