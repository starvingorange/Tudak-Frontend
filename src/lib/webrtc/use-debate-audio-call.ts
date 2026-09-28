"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  IncomingSignalMessage,
  OutgoingSignalMessage,
} from "@/lib/ws/types";
import {
  DebatePeerConnection,
  type RecordingKeyEntry,
} from "./debate-peer-connection";

export type DebateCallState =
  | "idle"
  | "connecting"
  | "connected"
  | "failed"
  | "closed";

const CALL_CONNECT_TIMEOUT_MS = 20_000;

export interface UseDebateAudioCallOptions {
  /** The other debater's userId — `null` until the room has both seats
   * filled, which also gates the whole call from starting. */
  peerUserId: number | null;
  /** The host always initiates the offer; the other side answers. */
  isCaller: boolean;
  sendSignal: (signal: OutgoingSignalMessage) => boolean;
}

export interface IncomingReaction {
  id: number;
  sticker: string;
}

export type DebateEndOrLeaveMessage = { type: "end" } | { type: "leave" };

export interface IncomingControlMessage {
  id: number;
  message: DebateEndOrLeaveMessage;
}

export type DebateTurnMessage = { type: "turn-pass"; usedSeconds: number };

export interface IncomingRecordingKeys {
  id: number;
  keys: RecordingKeyEntry[];
}

export interface IncomingPollReady {
  id: number;
  pollId: number;
}

export type DebateCaptionMessage = {
  type: "caption";
  step: number;
  side: 0 | 1;
  text: string;
  isFinal: boolean;
};

export interface IncomingCaption {
  id: number;
  step: number;
  side: 0 | 1;
  text: string;
  isFinal: boolean;
}

export interface UseDebateAudioCallResult {
  remoteStream: MediaStream | null;
  /** My own outgoing mic stream — same object for the call's lifetime, tracks
   * mute state via `track.enabled` rather than being replaced. Used by
   * `use-debate-recording.ts` to record my own turns locally. */
  localStream: MediaStream | null;
  micOn: boolean;
  toggleMic: () => void;
  callState: DebateCallState;
  error: string | null;
  /** Feed every message from `useDebateRoomSocket`'s `onSignal` option into
   * this — messages for other peers are ignored internally. */
  handleSignal: (message: IncomingSignalMessage) => void;
  /** Sends a sticker straight to the opponent over the P2P data channel —
   * only works once `callState` is `"connected"`; see `DebatePeerConnection.sendControlMessage`. */
  sendReaction: (sticker: string) => boolean;
  /** Latest reaction the opponent sent, or `null` before the first one —
   * changes identity on every message, even repeats of the same sticker. */
  incomingReaction: IncomingReaction | null;
  /** Sends an "end"/"leave" control message straight to the opponent over
   * the same P2P data channel used for reactions — replaces the old WS
   * `end`/`leave` publishes now that the debate room has no socket. */
  sendControl: (message: DebateEndOrLeaveMessage) => boolean;
  /** Latest "end"/"leave" the opponent sent, or `null` before the first one. */
  incomingControl: IncomingControlMessage | null;
  /** Sends a turn-pass event — see `use-debate-turns.ts`, which owns the
   * actual turn state machine. */
  sendTurn: (message: DebateTurnMessage) => boolean;
  /** Latest turn-timer event the opponent sent — a new object identity on
   * every message, even repeats. */
  incomingTurn: DebateTurnMessage | null;
  /** Sends my recorded turns' s3ObjectKeys straight to the opponent — see
   * `use-debate-recording.ts` and `debate-call-provider.tsx`, which own the
   * actual recording/upload and the merge-then-`finishDebate` step. */
  sendRecordingKeys: (keys: RecordingKeyEntry[]) => boolean;
  /** The opponent's recorded-keys message, or `null` before it arrives —
   * only ever sent once, by whichever side isn't the host. */
  incomingRecordingKeys: IncomingRecordingKeys | null;
  /** Sends the just-created pollId straight to the opponent — only the host
   * ever calls this (only the host calls `finishDebate`). */
  sendPollReady: (pollId: number) => boolean;
  /** The host's pollId message, or `null` before it arrives — only ever sent
   * once, by the host. */
  incomingPollReady: IncomingPollReady | null;
  /** Sends the local speaker's live speech-to-text transcript straight to the
   * opponent — see `use-live-caption.ts`, which owns the actual browser
   * Web Speech API recognition. */
  sendCaption: (message: DebateCaptionMessage) => boolean;
  /** The opponent's latest live-caption update, or `null` before the first
   * one — a new object identity on every message, even repeats. */
  incomingCaption: IncomingCaption | null;
}

/** Establishes (and tears down) a single 1:1 audio-only WebRTC call with the
 * debate opponent, riding the existing WS signal channel for offer/answer/
 * ICE exchange. Doesn't touch video — this app's room UI has none. */
export function useDebateAudioCall({
  peerUserId,
  isCaller,
  sendSignal,
}: UseDebateAudioCallOptions): UseDebateAudioCallResult {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(false);
  const [callState, setCallState] = useState<DebateCallState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [incomingReaction, setIncomingReaction] =
    useState<IncomingReaction | null>(null);
  const [incomingControl, setIncomingControl] =
    useState<IncomingControlMessage | null>(null);
  const [incomingTurn, setIncomingTurn] = useState<DebateTurnMessage | null>(
    null,
  );
  const [incomingRecordingKeys, setIncomingRecordingKeys] =
    useState<IncomingRecordingKeys | null>(null);
  const [incomingPollReady, setIncomingPollReady] =
    useState<IncomingPollReady | null>(null);
  const [incomingCaption, setIncomingCaption] =
    useState<IncomingCaption | null>(null);

  const peerRef = useRef<DebatePeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingSignalsRef = useRef<IncomingSignalMessage[]>([]);

  // Latest values in a ref so `handleSignal` (a stable callback handed to
  // useDebateRoomSocket) always reaches the current peer connection/sender
  // without needing to be re-created — same pattern as the WS hook itself.
  const sendSignalRef = useRef(sendSignal);
  sendSignalRef.current = sendSignal;
  const peerUserIdRef = useRef(peerUserId);
  peerUserIdRef.current = peerUserId;

  const applySignal = useCallback(
    (peer: DebatePeerConnection, message: IncomingSignalMessage) => {
      const targetUserId = peerUserIdRef.current;
      if (targetUserId === null) return;

      if (message.type === "offer") {
        peer
          .handleOffer(message.payload as RTCSessionDescriptionInit)
          .then((answer) => {
            sendSignalRef.current({
              type: "answer",
              targetUserId,
              payload: answer,
            });
          })
          .catch((err) =>
            setError(err instanceof Error ? err.message : String(err)),
          );
      } else if (message.type === "answer") {
        peer
          .handleAnswer(message.payload as RTCSessionDescriptionInit)
          .catch((err) =>
            setError(err instanceof Error ? err.message : String(err)),
          );
      } else if (message.type === "ice-candidate") {
        peer.addIceCandidate(message.payload as RTCIceCandidateInit);
      }
    },
    [],
  );

  useEffect(() => {
    if (peerUserId === null) return;

    let cancelled = false;
    setCallState("connecting");
    setError(null);

    // No TURN server (see debate-peer-connection.ts) means ICE negotiation
    // can hang forever for peers behind restrictive NATs — bound it with a
    // real failure state instead of leaving the caller on an infinite spinner.
    const connectTimeoutId = setTimeout(() => {
      setCallState((state) => (state === "connected" ? state : "failed"));
      setError((prev) => prev ?? "상대방과 연결하지 못했어요.");
    }, CALL_CONNECT_TIMEOUT_MS);

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        if (cancelled) {
          for (const track of stream.getTracks()) track.stop();
          return;
        }
        for (const track of stream.getTracks()) track.enabled = false;
        localStreamRef.current = stream;
        setLocalStream(stream);

        const peer = new DebatePeerConnection(stream, isCaller, {
          onIceCandidate: (candidate) => {
            sendSignalRef.current({
              type: "ice-candidate",
              targetUserId: peerUserId,
              payload: candidate,
            });
          },
          onTrack: (stream) => setRemoteStream(stream),
          onConnectionStateChange: (state) => {
            if (state === "connected") setCallState("connected");
            else if (state === "failed" || state === "disconnected")
              setCallState("failed");
            else if (state === "closed") setCallState("closed");
          },
          onControlMessage: (message) => {
            if (message.type === "reaction") {
              setIncomingReaction({
                id: Date.now() + Math.random(),
                sticker: message.sticker,
              });
            } else if (message.type === "end" || message.type === "leave") {
              setIncomingControl({ id: Date.now() + Math.random(), message });
            } else if (message.type === "recording-keys") {
              setIncomingRecordingKeys({
                id: Date.now() + Math.random(),
                keys: message.keys,
              });
            } else if (message.type === "poll-ready") {
              setIncomingPollReady({
                id: Date.now() + Math.random(),
                pollId: message.pollId,
              });
            } else if (message.type === "caption") {
              setIncomingCaption({
                id: Date.now() + Math.random(),
                step: message.step,
                side: message.side,
                text: message.text,
                isFinal: message.isFinal,
              });
            } else {
              setIncomingTurn(message);
            }
          },
        });
        peerRef.current = peer;

        const pending = pendingSignalsRef.current;
        pendingSignalsRef.current = [];
        for (const message of pending) applySignal(peer, message);

        if (isCaller) {
          peer
            .createOffer()
            .then((offer) => {
              sendSignalRef.current({
                type: "offer",
                targetUserId: peerUserId,
                payload: offer,
              });
            })
            .catch((err) =>
              setError(err instanceof Error ? err.message : String(err)),
            );
        }
      })
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "마이크 권한을 가져오지 못했어요.",
        );
        setCallState("failed");
      });

    return () => {
      cancelled = true;
      clearTimeout(connectTimeoutId);
      peerRef.current?.close();
      peerRef.current = null;
      for (const track of localStreamRef.current?.getTracks() ?? []) {
        track.stop();
      }
      localStreamRef.current = null;
      pendingSignalsRef.current = [];
      setRemoteStream(null);
      setLocalStream(null);
      setMicOn(false);
      setCallState("idle");
      setIncomingReaction(null);
      setIncomingControl(null);
      setIncomingTurn(null);
      setIncomingRecordingKeys(null);
      setIncomingPollReady(null);
      setIncomingCaption(null);
    };
  }, [peerUserId, isCaller, applySignal]);

  const sendReaction = useCallback(
    (sticker: string) =>
      peerRef.current?.sendControlMessage({ type: "reaction", sticker }) ??
      false,
    [],
  );

  const sendControl = useCallback(
    (message: DebateEndOrLeaveMessage) =>
      peerRef.current?.sendControlMessage(message) ?? false,
    [],
  );

  const sendTurn = useCallback(
    (message: DebateTurnMessage) =>
      peerRef.current?.sendControlMessage(message) ?? false,
    [],
  );

  const sendRecordingKeys = useCallback(
    (keys: RecordingKeyEntry[]) =>
      peerRef.current?.sendControlMessage({ type: "recording-keys", keys }) ??
      false,
    [],
  );

  const sendPollReady = useCallback(
    (pollId: number) =>
      peerRef.current?.sendControlMessage({ type: "poll-ready", pollId }) ??
      false,
    [],
  );

  const sendCaption = useCallback(
    (message: DebateCaptionMessage) =>
      peerRef.current?.sendControlMessage(message) ?? false,
    [],
  );

  const handleSignal = useCallback(
    (message: IncomingSignalMessage) => {
      if (message.fromUserId !== peerUserIdRef.current) return;
      const peer = peerRef.current;
      if (!peer) {
        // Arrived before our own peer connection finished setting up
        // (getUserMedia is async) — replay once it exists.
        pendingSignalsRef.current.push(message);
        return;
      }
      applySignal(peer, message);
    },
    [applySignal],
  );

  const toggleMic = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const next = !micOn;
    for (const track of stream.getTracks()) track.enabled = next;
    setMicOn(next);
  }, [micOn]);

  return {
    remoteStream,
    localStream,
    micOn,
    toggleMic,
    callState,
    error,
    handleSignal,
    sendReaction,
    incomingReaction,
    sendControl,
    incomingControl,
    sendTurn,
    incomingTurn,
    sendRecordingKeys,
    incomingRecordingKeys,
    sendPollReady,
    incomingPollReady,
    sendCaption,
    incomingCaption,
  };
}
