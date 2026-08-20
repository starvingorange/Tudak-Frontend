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

/** `AuthProvider`의 `rehydrate()` 호출이 끝나면 true가 된다. 리액트 상태 밖에서
 * `accessToken`을 동기적으로 읽는 쪽(예: STOMP 클라이언트의 `beforeConnect`)은
 * 먼저 이 값을 기다려야 한다 — 안 그러면 마운트 시점에 연결하는 컴포넌트가
 * 리하이드레이션과 경합해서 토큰 없이 첫 요청을 보내버릴 수 있다. */
export const useAuthHydrated = () =>
  useSyncExternalStore(
    (onChange) => useAuthStore.persist.onFinishHydration(onChange),
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  );
