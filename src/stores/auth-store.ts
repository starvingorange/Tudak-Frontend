import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  /** JWT issued on login — attached by the STOMP client (src/lib/ws) as the
   * `Authorization: Bearer <token>` CONNECT header per WS_PROTOCOL.md. */
  accessToken: string | null;
  /** Short-lived token issued for a first-time social login, carried through
   * the onboarding/profile-setup step until signup completes. */
  signupToken: string | null;
  setAccessToken: (token: string) => void;
  clearAccessToken: () => void;
  setSignupToken: (token: string) => void;
  clearSignupToken: () => void;
}

// `skipHydration` + the manual `.persist.rehydrate()` call in AuthProvider
// (src/providers/auth-provider.tsx) keeps the store's first client render
// matching the server's (`accessToken: null`) so hydration never mismatches
// against whatever's actually in localStorage.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      signupToken: null,
      setAccessToken: (token) => set({ accessToken: token }),
      clearAccessToken: () => set({ accessToken: null }),
      setSignupToken: (token) => set({ signupToken: token }),
      clearSignupToken: () => set({ signupToken: null }),
    }),
    {
      name: "tudak-auth",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        accessToken: state.accessToken,
        signupToken: state.signupToken,
      }),
    },
  ),
);

export const useIsLoggedIn = () =>
  useAuthStore((state) => state.accessToken !== null);

/** True once `AuthProvider`'s `rehydrate()` call has resolved. Callers that
 * read `accessToken` synchronously outside React state (e.g. the STOMP
 * client's `beforeConnect`) should wait on this first — otherwise a
 * component that connects on mount can race rehydration and send that first
 * request with no token at all. */
export const useAuthHydrated = () =>
  useSyncExternalStore(
    (onChange) => useAuthStore.persist.onFinishHydration(onChange),
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  );
