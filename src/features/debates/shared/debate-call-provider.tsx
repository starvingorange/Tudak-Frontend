"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePostFinishDebate } from "@/api/debate/hooks/usePostFinishDebate";
import {
  type UseDebateAudioCallResult,
  useDebateAudioCall,
} from "@/lib/webrtc/use-debate-audio-call";
import { useDebateRecording } from "@/lib/webrtc/use-debate-recording";
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
  /** 대기방의 `RoomStatusMessage.participants[].presignedUrl`에서 그대로
   * 가져온 값 — 토론방엔 소켓이 없어서 여기(연결 시점)에 실어 보내야
   * 방 전환 후에도 유지된다. 프로필 사진을 안 올린 유저면 null. */
  myProfileImageUrl: string | null;
  opponentProfileImageUrl: string | null;
}

export interface DebateCallContextValue extends UseDebateAudioCallResult {
  myAgreement: Agreement | null;
  isHost: boolean;
  peerUserId: number | null;
  startedAt: number | null;
  myProfileImageUrl: string | null;
  opponentProfileImageUrl: string | null;
  /** Starts (or restarts, e.g. after a failed attempt) the WebRTC handshake.
   * Not idempotent — callers own their own "have I already called this"
   * bookkeeping (a ref), same as the rest of this codebase's WS effects. */
  connectCall: (args: ConnectCallArgs) => void;
  disconnectCall: () => void;
  /** Wire straight into `useDebateTurns`'s `onTurnStart`/`onTurnEnd` — records
   * (and, on turn end, uploads) only the caller's own turns. The actual P2P
   * key exchange and `finishDebate` call happen here in the provider so they
   * survive the room → result page navigation. */
  startRecordingTurn: (step: number, side: 0 | 1) => void;
  stopRecordingTurn: (step: number, side: 0 | 1) => void;
  /** The finished debate's pollId, once known — `finishDebate` only ever
   * runs on the host, so the guest learns it via a P2P relay (see below).
   * `null` until then; the result page shows a "정리하는 중" state till it
   * resolves. */
  pollId: number | null;
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

  const isHost = connectArgs?.isHost ?? false;
  const mySide: 0 | 1 | null =
    connectArgs?.myAgreement === "AGREE"
      ? 0
      : connectArgs?.myAgreement === "DISAGREE"
        ? 1
        : null;

  const recording = useDebateRecording({
    mySide,
    localStream: audioCall.localStream,
    resetKey: debateId,
  });

  const [pollId, setPollId] = useState<number | null>(null);

  // 게스트는 finishDebate를 직접 부르지 않으니 pollId를 방장의 릴레이로만
  // 안다 — 채널이 아직 안 열려 있으면(드묾) 열릴 때까지 짧게 재시도.
  const sendPollReadyRef = useRef(audioCall.sendPollReady);
  sendPollReadyRef.current = audioCall.sendPollReady;
  const relayPollId = useCallback((newPollId: number) => {
    let cancelled = false;
    const attempt = () => {
      if (cancelled) return;
      if (!sendPollReadyRef.current(newPollId)) {
        setTimeout(attempt, 500);
      }
    };
    attempt();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (audioCall.incomingPollReady) {
      setPollId(audioCall.incomingPollReady.pollId);
    }
  }, [audioCall.incomingPollReady]);

  const { mutate: finishDebate } = usePostFinishDebate({
    mutation: {
      onSuccess: (response) => {
        const newPollId = response.data?.pollId;
        if (newPollId === undefined) return;
        setPollId(newPollId);
        relayPollId(newPollId);
      },
      onError: (error) => console.error("[debate] finishDebate failed", error),
    },
  });

  // 게스트만 씀 — 자기 몫 3턴 업로드가 다 끝나면 방장에게 P2P로 한 번만
  // 보낸다. 데이터채널이 아직 안 열려 있어 전송이 실패하면(드묾) 열릴
  // 때까지 짧게 재시도.
  const sentKeysRef = useRef(false);
  useEffect(() => {
    if (isHost || !recording.isMineComplete || sentKeysRef.current) return;
    let cancelled = false;
    const attempt = () => {
      if (cancelled || sentKeysRef.current) return;
      if (audioCall.sendRecordingKeys(recording.myKeys)) {
        sentKeysRef.current = true;
      } else {
        setTimeout(attempt, 500);
      }
    };
    attempt();
    return () => {
      cancelled = true;
    };
  }, [
    isHost,
    recording.isMineComplete,
    recording.myKeys,
    audioCall.sendRecordingKeys,
  ]);

  // 방장만 씀 — 자기 몫 3턴 + 게스트가 보낸 3턴이 다 모이면 finishDebate를
  // 딱 한 번 호출.
  const finishCalledRef = useRef(false);
  useEffect(() => {
    if (!isHost || finishCalledRef.current || !recording.isMineComplete) {
      return;
    }
    const guestKeys = audioCall.incomingRecordingKeys?.keys;
    if (guestKeys?.length !== 3) return;

    // FindPollDetailsResponse가 agree/disagree 각자 자기 arguments(입론/
    // 반론/결론)를 따로 갖는 구조라, 요청도 턴 진행 순서(찬반 번갈아)가
    // 아니라 찬성 3개(입론→반론→결론) 다음 반대 3개(입론→반론→결론)로
    // 묶어서 보내야 한다 — step % 2(0=찬성,1=반대)로 먼저 묶고, 그 안에서
    // step 오름차순.
    const merged = [...recording.myKeys, ...guestKeys].sort(
      (a, b) => (a.step % 2) - (b.step % 2) || a.step - b.step,
    );
    finishCalledRef.current = true;
    const numericDebateId = Number(debateId);
    finishDebate({
      debateId: numericDebateId,
      data: {
        debateId: numericDebateId,
        s3ObjectKeyList: merged.map((entry) => entry.s3ObjectKey),
      },
    });
  }, [
    isHost,
    recording.isMineComplete,
    recording.myKeys,
    audioCall.incomingRecordingKeys,
    debateId,
    finishDebate,
  ]);

  // Next.js keeps this layout mounted across a debateId change (e.g. a
  // client-side nav from one debate straight into another) — reset so a
  // stale call/timer from the previous debate can't leak into the new one.
  // biome-ignore lint/correctness/useExhaustiveDependencies: debateId isn't read in the body, but it's the intentional re-run trigger.
  useEffect(() => {
    return () => {
      setConnectArgs(null);
      setPollId(null);
      sentKeysRef.current = false;
      finishCalledRef.current = false;
    };
  }, [debateId]);

  const connectCall = useCallback((args: ConnectCallArgs) => {
    setConnectArgs(args);
  }, []);

  const disconnectCall = useCallback(() => {
    setConnectArgs(null);
  }, []);

  const stopRecordingTurn = useCallback(
    (step: number, side: 0 | 1) => {
      recording.stopTurn(step, side);
    },
    [recording.stopTurn],
  );

  // 이 Provider는 [debateId] 레이아웃 전체(대기방/토론방/결과 페이지)를
  // 감싸므로, value를 매 렌더마다 새 객체로 만들면 useDebateCall()을 쓰는
  // 하위 트리 전체가 그만큼 자주 리렌더된다(상대 리액션 수신, 마이크
  // 토글 등). useDebateAudioCall이 반환하는 객체 자체는 매 렌더마다 새로
  // 만들어지므로 `audioCall`을 통째로 deps에 넣으면 메모이제이션이 무의미
  // 해져서, 실제로 바뀐 필드만 감지하도록 하나씩 풀어서 deps에 나열한다.
  const value: DebateCallContextValue = useMemo(
    () => ({
      remoteStream: audioCall.remoteStream,
      localStream: audioCall.localStream,
      micOn: audioCall.micOn,
      toggleMic: audioCall.toggleMic,
      callState: audioCall.callState,
      error: audioCall.error,
      handleSignal: audioCall.handleSignal,
      sendReaction: audioCall.sendReaction,
      incomingReaction: audioCall.incomingReaction,
      sendControl: audioCall.sendControl,
      incomingControl: audioCall.incomingControl,
      sendTurn: audioCall.sendTurn,
      incomingTurn: audioCall.incomingTurn,
      sendRecordingKeys: audioCall.sendRecordingKeys,
      incomingRecordingKeys: audioCall.incomingRecordingKeys,
      sendPollReady: audioCall.sendPollReady,
      incomingPollReady: audioCall.incomingPollReady,
      myAgreement: connectArgs?.myAgreement ?? null,
      isHost,
      peerUserId: connectArgs?.peerUserId ?? null,
      startedAt: connectArgs?.startedAt ?? null,
      myProfileImageUrl: connectArgs?.myProfileImageUrl ?? null,
      opponentProfileImageUrl: connectArgs?.opponentProfileImageUrl ?? null,
      connectCall,
      disconnectCall,
      startRecordingTurn: recording.startTurn,
      stopRecordingTurn,
      pollId,
    }),
    [
      audioCall.remoteStream,
      audioCall.localStream,
      audioCall.micOn,
      audioCall.toggleMic,
      audioCall.callState,
      audioCall.error,
      audioCall.handleSignal,
      audioCall.sendReaction,
      audioCall.incomingReaction,
      audioCall.sendControl,
      audioCall.incomingControl,
      audioCall.sendTurn,
      audioCall.incomingTurn,
      audioCall.sendRecordingKeys,
      audioCall.incomingRecordingKeys,
      audioCall.sendPollReady,
      audioCall.incomingPollReady,
      connectArgs,
      isHost,
      connectCall,
      disconnectCall,
      recording.startTurn,
      stopRecordingTurn,
      pollId,
    ],
  );

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
