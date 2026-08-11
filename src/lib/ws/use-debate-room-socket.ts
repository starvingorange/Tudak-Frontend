"use client";

import { useEffect, useRef, useState } from "react";
import { getAccessToken } from "@/lib/auth/token";
import { DebateRoomSocketClient } from "./debate-room-socket-client";
import type {
  Agreement,
  DebateSocketConnectionState,
  IncomingSignalMessage,
  KickedMessage,
  OutgoingSignalMessage,
  RoomStatusMessage,
  WsErrorMessage,
} from "./types";

export interface UseDebateRoomSocketOptions {
  /**
   * Sent with `join` on first connect. Ignored on reconnects (`status` is
   * sent instead, which has no side effects — see WS_PROTOCOL.md).
   * If omitted, the socket connects and subscribes but never joins — call
   * the returned `join` yourself once you know the user's stance.
   */
  agreement?: Agreement;
  onSignal?: (message: IncomingSignalMessage) => void;
  onKicked?: (message: KickedMessage) => void;
}

export interface UseDebateRoomSocketResult {
  connectionState: DebateSocketConnectionState;
  /** Latest `RoomStatusMessage` broadcast, or null until the first one arrives. */
  room: RoomStatusMessage | null;
  /** Most recent app-level error from `/user/sub/errors`, if any. */
  error: WsErrorMessage | null;
  join: (agreement: Agreement) => boolean;
  leave: () => boolean;
  kick: () => boolean;
  start: () => boolean;
  end: () => boolean;
  refreshStatus: () => boolean;
  sendSignal: (signal: OutgoingSignalMessage) => boolean;
}

/**
 * Owns a `DebateRoomSocketClient` for `debateId`: connects on mount,
 * auto-joins with `options.agreement` (if given), keeps the latest
 * `RoomStatusMessage` in state, and disconnects on unmount.
 *
 * WebRTC signal messages are only forwarded to `options.onSignal` — this
 * hook does not touch `RTCPeerConnection` itself.
 */
export function useDebateRoomSocket(
  debateId: string | number | undefined,
  options: UseDebateRoomSocketOptions = {},
): UseDebateRoomSocketResult {
  const [connectionState, setConnectionState] =
    useState<DebateSocketConnectionState>("idle");
  const [room, setRoom] = useState<RoomStatusMessage | null>(null);
  const [error, setError] = useState<WsErrorMessage | null>(null);
  const clientRef = useRef<DebateRoomSocketClient | null>(null);

  // Latest options in refs so the connection effect only depends on
  // `debateId` — reconnecting every time a callback prop changes identity
  // would drop the user from the room.
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (debateId === undefined) return;

    const client = new DebateRoomSocketClient(debateId, getAccessToken, {
      onConnectionStateChange: setConnectionState,
      onRoomStatus: setRoom,
      onError: setError,
      onKicked: (message) => optionsRef.current.onKicked?.(message),
      onSignal: (message) => optionsRef.current.onSignal?.(message),
      onConnect: (isReconnect) => {
        if (isReconnect) {
          client.refreshStatus();
          return;
        }
        const agreement = optionsRef.current.agreement;
        if (agreement) client.join(agreement);
      },
    });

    clientRef.current = client;
    client.connect();

    return () => {
      clientRef.current = null;
      client.disconnect();
    };
    // `options` is intentionally excluded — read via optionsRef above so
    // that a new callback identity doesn't reconnect the socket.
  }, [debateId]);

  return {
    connectionState,
    room,
    error,
    join: (agreement) => clientRef.current?.join(agreement) ?? false,
    leave: () => clientRef.current?.leave() ?? false,
    kick: () => clientRef.current?.kick() ?? false,
    start: () => clientRef.current?.start() ?? false,
    end: () => clientRef.current?.end() ?? false,
    refreshStatus: () => clientRef.current?.refreshStatus() ?? false,
    sendSignal: (signal) => clientRef.current?.sendSignal(signal) ?? false,
  };
}
