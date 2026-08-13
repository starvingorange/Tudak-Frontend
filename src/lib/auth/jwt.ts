import { useMemo } from "react";
import { useAuthStore } from "@/stores/auth-store";

interface DecodedAccessToken {
  userId?: number | string;
  sub?: string;
  [key: string]: unknown;
}

function base64UrlDecode(segment: string): string {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return atob(padded);
}

/** Reads the JWT's payload segment without verifying its signature — safe
 * here because the client is only ever reading its own already-trusted
 * token, never validating someone else's. */
function decodeAccessToken(token: string): DecodedAccessToken | null {
  try {
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) return null;
    return JSON.parse(base64UrlDecode(payloadSegment)) as DecodedAccessToken;
  } catch {
    return null;
  }
}

/** Pulls the numeric user id off a decoded token's `userId` (falling back to
 * `sub`) claim. `null` if the token is missing or carries neither in a form
 * we can parse. */
function extractUserId(token: string | null): number | null {
  if (!token) return null;

  const decoded = decodeAccessToken(token);
  const raw = decoded?.userId ?? decoded?.sub;
  if (raw === undefined) return null;

  const id = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(id) ? id : null;
}

/** Non-reactive snapshot of the signed-in user's id — for one-off reads
 * outside a component (e.g. a plain callback). Inside a component, prefer
 * `useCurrentUserId` so it updates once the auth store rehydrates. */
export function getCurrentUserId(): number | null {
  return extractUserId(useAuthStore.getState().accessToken);
}

/** Reactive version of `getCurrentUserId` — re-derives whenever the store's
 * `accessToken` changes, so it comes back non-null once AuthProvider's
 * rehydrate() resolves instead of staying stuck at the SSR-time `null`. */
export function useCurrentUserId(): number | null {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useMemo(() => extractUserId(accessToken), [accessToken]);
}
