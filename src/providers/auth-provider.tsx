"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

/** Triggers the auth store's deferred localStorage hydration once on mount
 * (see `skipHydration` in src/stores/auth-store.ts) — mounted once in the
 * root layout so every route sees the same rehydrated state. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useAuthStore.persist.rehydrate();
  }, []);

  return children;
}
