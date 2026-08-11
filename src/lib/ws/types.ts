/**
 * Wire types for the debate room STOMP protocol.
 *
 * Mirrors `WS_PROTOCOL.md` (kept in sync with the backend's
 * `DebateWebSocketService` / `DebateWebSocketController`) — do not change
 * these shapes without updating that doc and confirming with the backend.
 */

export type Agreement = "AGREE" | "DISAGREE";

export type RoomStatus = "WAITING" | "READY" | "STARTED" | "CLOSED";

export interface RoomParticipant {
  userId: number;
  nickname: string;
  agreement: Agreement | null;
}

/**
 * Sent to each participant individually on `/user/sub/debate/room` after
 * every join/kick/start/end/leave/status (formerly a public broadcast on
 * `/sub/debate/{debateId}/room` — moved to a personal queue per a security
 * audit finding that the public topic let anyone snoop on any room's
 * participants). `debateId` was added so the payload can identify which
 * room it's about, since the destination no longer encodes it.
 */
export interface RoomStatusMessage {
  debateId: number;
  status: RoomStatus;
  participants: RoomParticipant[];
  /** Host's userId. Only meaningful once `status === "STARTED"`. */
  callerId: number | null;
}

export type SignalType = "offer" | "answer" | "ice-candidate";

/** Sent by the client on `/pub/debate/{debateId}/signal`. */
export interface OutgoingSignalMessage {
  type: SignalType;
  /** SDP string or ICE candidate object — server does not interpret this. */
  payload: unknown;
  targetUserId: number;
}

/** Received on `/user/sub/signal` — the server fills in `fromUserId`. */
export interface IncomingSignalMessage {
  type: SignalType;
  payload: unknown;
  targetUserId: number;
  fromUserId: number;
}

/** Received on `/user/sub/errors`. */
export interface WsErrorMessage {
  error: string;
  message: string;
}

/** Received on `/user/sub/kicked`. */
export interface KickedMessage {
  message: string;
}

export type DebateWsErrorCode =
  | "A001" // TOKEN_EXPIRED
  | "A002" // TOKEN_INVALID
  | "U002" // USER_NOT_FOUND
  | "D001" // DEBATE_NOT_FOUND
  | "D002" // DEBATE_ROOM_FULL
  | "D003" // DEBATE_USER_NOT_HOST
  | "D004" // DEBATE_ROOM_NOT_READY
  | "D006"; // DEBATE_USER_NOT_PARTICIPANT — signal/status from a non-participant;
// delivered on /user/sub/errors like any other WsErrorMessage, no special
// handling needed on the client beyond the existing onError callback.

export type DebateSocketConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "error";
