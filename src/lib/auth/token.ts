// TODO(auth): no real login flow persists a token anywhere in this codebase
// yet — `useLogin1`/`useSignup1` (src/api/generated/dev-auth-controller) just
// return `{ userId, nickname, providerType }` and nothing calls these helpers
// today. Once the real login flow lands, have it call `setAccessToken` with
// the issued JWT so the STOMP client (src/lib/ws) can attach it as the
// `Authorization: Bearer <token>` CONNECT header per WS_PROTOCOL.md.

const ACCESS_TOKEN_STORAGE_KEY = "tudak.accessToken";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function setAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
}

export function clearAccessToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
}
