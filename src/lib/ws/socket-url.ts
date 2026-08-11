const WS_PATH = "/ws";

/**
 * The SockJS endpoint for the debate WebSocket, derived from the same
 * `NEXT_PUBLIC_API_URL` the REST client (`src/api/api-client.ts`) uses.
 *
 * SockJS negotiates its own transport (WebSocket, XHR streaming, ...) over
 * plain http(s), so — per `WS_PROTOCOL.md`'s connection example — this stays
 * an http(s) URL rather than being rewritten to ws(s).
 */
export function getDebateSocketUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set; cannot build the debate WebSocket endpoint.",
    );
  }
  return `${base.replace(/\/+$/, "")}${WS_PATH}`;
}
