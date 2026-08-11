import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getDebateSocketUrl } from "./socket-url";
import type {
  Agreement,
  DebateSocketConnectionState,
  IncomingSignalMessage,
  KickedMessage,
  OutgoingSignalMessage,
  RoomStatusMessage,
  WsErrorMessage,
} from "./types";

// Matches the backend's WebSocketConfig.java heartbeat setting — see
// WS_PROTOCOL.md §1.
const HEARTBEAT_MS = 10_000;
const RECONNECT_DELAY_MS = 5_000;

export interface DebateRoomSocketHandlers {
  onRoomStatus?: (message: RoomStatusMessage) => void;
  onError?: (message: WsErrorMessage) => void;
  onKicked?: (message: KickedMessage) => void;
  onSignal?: (message: IncomingSignalMessage) => void;
  onConnectionStateChange?: (state: DebateSocketConnectionState) => void;
  /**
   * Fires once subscriptions are (re)established. `isReconnect` is false only
   * for the very first successful connection — callers should `join` then,
   * and `refreshStatus` (join has side effects, status doesn't) on every
   * reconnect after that, per WS_PROTOCOL.md.
   */
  onConnect?: (isReconnect: boolean) => void;
}

function parseJsonBody<T>(body: string): T | null {
  try {
    return JSON.parse(body) as T;
  } catch {
    return null;
  }
}

/**
 * Thin, framework-agnostic wrapper around a `@stomp/stompjs` `Client` for a
 * single debate room. Handles connecting over SockJS, resubscribing to the
 * room's channels on every (re)connect, and exposes typed `send*` helpers for
 * the destinations documented in `WS_PROTOCOL.md`.
 *
 * Not React-specific — see `use-debate-room-socket.ts` for the hook that
 * owns one of these per component.
 */
export class DebateRoomSocketClient {
  private readonly debateId: string | number;
  private readonly getAccessToken: () => string | null | undefined;
  private readonly handlers: DebateRoomSocketHandlers;
  private client: Client | null = null;
  private subscriptions: StompSubscription[] = [];
  private state: DebateSocketConnectionState = "idle";
  private hasConnectedOnce = false;

  constructor(
    debateId: string | number,
    getAccessToken: () => string | null | undefined,
    handlers: DebateRoomSocketHandlers = {},
  ) {
    this.debateId = debateId;
    this.getAccessToken = getAccessToken;
    this.handlers = handlers;
  }

  getState(): DebateSocketConnectionState {
    return this.state;
  }

  private setState(state: DebateSocketConnectionState) {
    if (this.state === state) return;
    this.state = state;
    this.handlers.onConnectionStateChange?.(state);
  }

  connect(): void {
    if (this.client) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(getDebateSocketUrl()),
      // Re-read the token on every (re)connect attempt, not just the first —
      // `beforeConnect` runs before initial connect and every automatic
      // reconnect triggered by `reconnectDelay`.
      beforeConnect: () => {
        const token = this.getAccessToken();
        client.connectHeaders = token
          ? { Authorization: `Bearer ${token}` }
          : {};
      },
      heartbeatIncoming: HEARTBEAT_MS,
      heartbeatOutgoing: HEARTBEAT_MS,
      reconnectDelay: RECONNECT_DELAY_MS,
      onConnect: () => {
        this.subscribeAll(client);
        this.setState("connected");
        const isReconnect = this.hasConnectedOnce;
        this.hasConnectedOnce = true;
        this.handlers.onConnect?.(isReconnect);
      },
      onWebSocketClose: () => {
        this.clearSubscriptions();
        this.setState(client.active ? "reconnecting" : "disconnected");
      },
      onStompError: (frame) => {
        const parsed = parseJsonBody<WsErrorMessage>(frame.body);
        if (parsed) {
          this.handlers.onError?.(parsed);
        } else {
          this.handlers.onError?.({
            error: frame.headers.message ?? "STOMP_ERROR",
            message: frame.body || "WebSocket 연결 중 오류가 발생했습니다.",
          });
        }
        this.setState("error");
      },
    });

    this.client = client;
    this.setState("connecting");
    client.activate();
  }

  async disconnect(): Promise<void> {
    const client = this.client;
    this.client = null;
    this.clearSubscriptions();
    if (!client) return;
    await client.deactivate();
    this.setState("disconnected");
  }

  private subscribeAll(client: Client): void {
    this.clearSubscriptions();

    this.subscriptions.push(
      // Personal queue, not a public topic keyed by debateId — the backend
      // moved off the public `/sub/debate/{debateId}/room` broadcast (a
      // security-audit finding: anyone could subscribe and see other rooms'
      // participants) in favor of sending each participant their own copy.
      // The payload now carries `debateId` since the destination no longer
      // encodes it; guard against a stray message from a room we've since
      // left (e.g. a message in flight during a fast debateId switch).
      client.subscribe("/user/sub/debate/room", (message: IMessage) => {
        const parsed = parseJsonBody<RoomStatusMessage>(message.body);
        if (parsed && String(parsed.debateId) === String(this.debateId)) {
          this.handlers.onRoomStatus?.(parsed);
        }
      }),
      client.subscribe("/user/sub/errors", (message: IMessage) => {
        const parsed = parseJsonBody<WsErrorMessage>(message.body);
        if (parsed) this.handlers.onError?.(parsed);
      }),
      client.subscribe("/user/sub/kicked", (message: IMessage) => {
        const parsed = parseJsonBody<KickedMessage>(message.body);
        if (parsed) this.handlers.onKicked?.(parsed);
      }),
      client.subscribe("/user/sub/signal", (message: IMessage) => {
        const parsed = parseJsonBody<IncomingSignalMessage>(message.body);
        if (parsed) this.handlers.onSignal?.(parsed);
      }),
    );
  }

  private clearSubscriptions(): void {
    for (const sub of this.subscriptions) {
      try {
        sub.unsubscribe();
      } catch {
        // socket is already gone — nothing to clean up
      }
    }
    this.subscriptions = [];
  }

  private publish(destination: string, body?: unknown): boolean {
    if (!this.client?.connected) {
      console.warn(
        `[debate-socket] tried to publish to ${destination} while disconnected`,
      );
      return false;
    }
    this.client.publish({
      destination,
      body: body === undefined ? "" : JSON.stringify(body),
    });
    return true;
  }

  join(agreement: Agreement): boolean {
    return this.publish(`/pub/debate/${this.debateId}/join`, { agreement });
  }

  leave(): boolean {
    return this.publish(`/pub/debate/${this.debateId}/leave`);
  }

  kick(): boolean {
    return this.publish(`/pub/debate/${this.debateId}/kick`);
  }

  start(): boolean {
    return this.publish(`/pub/debate/${this.debateId}/start`);
  }

  end(): boolean {
    return this.publish(`/pub/debate/${this.debateId}/end`);
  }

  /** Re-fetches the current room state without join's side effects — use on reconnect. */
  refreshStatus(): boolean {
    return this.publish(`/pub/debate/${this.debateId}/status`);
  }

  sendSignal(signal: OutgoingSignalMessage): boolean {
    return this.publish(`/pub/debate/${this.debateId}/signal`, signal);
  }
}
