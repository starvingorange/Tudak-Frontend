"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  type UseDebateAudioCallResult,
  useDebateAudioCall,
} from "@/lib/webrtc/use-debate-audio-call";
import type { Agreement, OutgoingSignalMessage } from "@/lib/ws/types";

export interface ConnectCallArgs {
  peerUserId: number;
  isCaller: boolean;
  myAgreement: Agreement;
  isHost: boolean;
  /** Client-local timestamp captured the moment this client observed
   * `RoomStatusMessage.status === "STARTED"` — the turn-timer anchor. The
   * server sends no timestamp of its own, so this has the same clock-skew
   * characteristics the old WS-status-driven timer already had. */
  startedAt: number;
  sendSignal: (signal: OutgoingSignalMessage) => boolean;
}

export interface DebateCallContextValue extends UseDebateAudioCallResult {
  myAgreement: Agreement | null;
  isHost: boolean;
  peerUserId: number | null;
  startedAt: number | null;
  /** Starts (or restarts, e.g. after a failed attempt) the WebRTC handshake.
   * Not idempotent — callers own their own "have I already called this"
   * bookkeeping (a ref), same as the rest of this codebase's WS effects. */
  connectCall: (args: ConnectCallArgs) => void;
  disconnectCall: () => void;
}

const DebateCallContext = createContext<DebateCallContextValue | null>(null);

const noopSendSignal = () => false;

export interface DebateCallProviderProps {
  debateId: string;
  children: React.ReactNode;
}

/**
 * Owns the single `useDebateAudioCall` instance for a debate, at the
 * `[debateId]` route-segment layout — so it survives the client-side
 * navigation from `/waiting` to the room page (same layout, same debateId,
 * Next.js doesn't unmount it). That's what lets the WebRTC connection
 * (established while the waiting room's WS is still alive, for signaling)
 * keep running once the debate room itself has no socket at all.
 *
 * Also mounts under `/debates/{id}/result` (sibling route under the same
 * layout) — harmless, since nothing there ever calls `connectCall`.
 */
export function DebateCallProvider({
  debateId,
  children,
}: DebateCallProviderProps) {
  const [connectArgs, setConnectArgs] = useState<ConnectCallArgs | null>(null);

  const audioCall = useDebateAudioCall({
    peerUserId: connectArgs?.peerUserId ?? null,
    isCaller: connectArgs?.isCaller ?? false,
    sendSignal: connectArgs?.sendSignal ?? noopSendSignal,
  });

  // Next.js keeps this layout mounted across a debateId change (e.g. a
  // client-side nav from one debate straight into another) — reset so a
  // stale call/timer from the previous debate can't leak into the new one.
  // biome-ignore lint/correctness/useExhaustiveDependencies: debateId isn't read in the body, but it's the intentional re-run trigger.
  useEffect(() => {
    return () => setConnectArgs(null);
  }, [debateId]);

  const connectCall = useCallback((args: ConnectCallArgs) => {
    setConnectArgs(args);
  }, []);

  const disconnectCall = useCallback(() => {
    setConnectArgs(null);
  }, []);

  const value: DebateCallContextValue = {
    ...audioCall,
    myAgreement: connectArgs?.myAgreement ?? null,
    isHost: connectArgs?.isHost ?? false,
    peerUserId: connectArgs?.peerUserId ?? null,
    startedAt: connectArgs?.startedAt ?? null,
    connectCall,
    disconnectCall,
  };

  return (
    <DebateCallContext.Provider value={value}>
      {children}
    </DebateCallContext.Provider>
  );
}

export function useDebateCall(): DebateCallContextValue {
  const context = useContext(DebateCallContext);
  if (!context) {
    throw new Error("useDebateCall must be used within a DebateCallProvider");
  }
  return context;
}
