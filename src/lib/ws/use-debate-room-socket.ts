"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthHydrated, useAuthStore } from "@/stores/auth-store";
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
  /** 이 유저에게 전달된 최신 `RoomStatusMessage`. 아직 하나도 안 왔으면 null. */
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

  // auth store가 localStorage에서 리하이드레이션을 끝낼 때까지 기다린다 —
  // 끝나기 전에 연결하면 토큰이 아예 없는 상태로 첫 CONNECT가 나가버리고,
  // 백엔드가 이를 거부한다(네트워크 순단이 아니라 진짜 STOMP ERROR임).
  // stompjs의 자동 재연결이 몇 초 뒤에 알아서 덮어주긴 하지만, 애초에 이
  // 실패를 겪을 이유가 없다.
  const authHydrated = useAuthHydrated();

  useEffect(() => {
    if (debateId === undefined || !authHydrated) return;

    const client = new DebateRoomSocketClient(
      debateId,
      () => useAuthStore.getState().accessToken,
      {
        onConnectionStateChange: setConnectionState,
        onRoomStatus: setRoom,
        onError: setError,
        onKicked: (message) => optionsRef.current.onKicked?.(message),
        onSignal: (message) => optionsRef.current.onSignal?.(message),
        onConnect: (isReconnect) => {
          // (재)연결에 성공했다는 건 이전 `onStompError`를 유발했던 원인(예:
          // 콜드 로드 시 auth store의 localStorage 리하이드레이션과 최초
          // CONNECT가 경합했던 상황)이 해소됐다는 뜻 — 방이 정상인데 예전
          // 에러 배너를 계속 띄워둘 이유는 없다.
          setError(null);
          if (isReconnect) {
            client.refreshStatus();
            return;
          }
          const agreement = optionsRef.current.agreement;
          if (agreement) client.join(agreement);
        },
      },
    );

    clientRef.current = client;
    client.connect();

    return () => {
      clientRef.current = null;
      client.disconnect();
    };
    // `options` is intentionally excluded — read via optionsRef above so
    // that a new callback identity doesn't reconnect the socket.
  }, [debateId, authHydrated]);

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
