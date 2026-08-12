"use client";

import { ArrowLeft } from "lucide-react";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useGetDebate } from "@/api/debate/hooks/useGetDebate";
import { useCurrentUserId } from "@/lib/auth/jwt";
import { ROUTES } from "@/lib/routes";
import {
  type UseDebateAudioCallResult,
  useDebateAudioCall,
} from "@/lib/webrtc/use-debate-audio-call";
import type { Agreement } from "@/lib/ws/types";
import { useDebateRoomSocket } from "@/lib/ws/use-debate-room-socket";
import { ChatLog } from "./chat-log";
import { ControlBar } from "./control-bar";
import type { DebaterState } from "./data";
import { DebaterCard } from "./debater-card";
import { VoteProgressPanel } from "./vote-progress-panel";

interface DebateRoomViewProps {
  debateId: string;
}

// "1인당 7분 (입론+반론 6분 · 최종발언 1분)" per the waiting room copy — 찬성
// speaks first, 반대 second; once both budgets are spent the host ends the
// debate. There's no server-pushed clock (WS_PROTOCOL.md has no turn/timer
// message), so every client just times its own copy of the same two windows
// starting from the moment it saw `status` become `STARTED`.
const TURN_SECONDS = 7 * 60;

function formatClock(totalSeconds: number): string {
  const clamped = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function turnState(elapsedSeconds: number, turnIndex: 0 | 1) {
  const turnStart = turnIndex * TURN_SECONDS;
  const turnEnd = turnStart + TURN_SECONDS;
  const remainingSeconds = Math.max(
    0,
    Math.min(TURN_SECONDS, turnEnd - elapsedSeconds),
  );
  return {
    remainingLabel: formatClock(remainingSeconds),
    remainingPercent: (remainingSeconds / TURN_SECONDS) * 100,
    speaking: elapsedSeconds >= turnStart && elapsedSeconds < turnEnd,
  };
}

export function DebateRoomView({ debateId }: DebateRoomViewProps) {
  const router = useRouter();
  const numericId = Number(debateId);
  const myUserId = useCurrentUserId();

  const { data, isLoading, isError } = useGetDebate(numericId, {
    query: { enabled: Number.isFinite(numericId) },
  });

  // `useDebateRoomSocket` needs `onSignal` at call time, but the handler
  // that should receive those messages only exists after `useDebateAudioCall`
  // runs (which itself needs this hook's `sendSignal`) — a ref breaks the
  // circularity without either hook needing to know about the other.
  const audioCallRef = useRef<UseDebateAudioCallResult | null>(null);

  const {
    connectionState,
    room: liveRoom,
    sendSignal,
    leave,
    end,
    refreshStatus,
  } = useDebateRoomSocket(debateId, {
    onSignal: (message) => audioCallRef.current?.handleSignal(message),
  });

  // This view is only ever reached once the room's already STARTED (the
  // waiting room navigates here on that transition), but this is a fresh
  // socket connection — nothing auto-joins/refreshes on first connect, so
  // ask for the current status explicitly to learn `participants`/`callerId`.
  const statusRequestedRef = useRef(false);
  useEffect(() => {
    if (statusRequestedRef.current || connectionState !== "connected") return;
    statusRequestedRef.current = true;
    refreshStatus();
  }, [connectionState, refreshStatus]);

  const peerUserId =
    myUserId === null
      ? null
      : (liveRoom?.participants.find((p) => p.userId !== myUserId)?.userId ??
        null);
  const isCaller = myUserId !== null && liveRoom?.callerId === myUserId;

  const audioCall = useDebateAudioCall({ peerUserId, isCaller, sendSignal });
  audioCallRef.current = audioCall;

  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = audioCall.remoteStream;
    }
  }, [audioCall.remoteStream]);

  // Speaking clock — only ticks once the socket confirms the room is
  // actually STARTED.
  const started = liveRoom?.status === "STARTED";
  const startedAtRef = useRef<number | null>(null);
  const endCalledRef = useRef(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!started) return;
    if (startedAtRef.current === null) startedAtRef.current = Date.now();
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [started]);

  const elapsedSeconds = startedAtRef.current
    ? (now - startedAtRef.current) / 1000
    : 0;
  const isHost = myUserId !== null && liveRoom?.callerId === myUserId;

  useEffect(() => {
    if (!started || !isHost || endCalledRef.current) return;
    if (elapsedSeconds >= TURN_SECONDS * 2) {
      endCalledRef.current = true;
      end();
    }
  }, [started, isHost, elapsedSeconds, end]);

  useEffect(() => {
    if (liveRoom?.status === "CLOSED") {
      router.push(ROUTES.DEBATE_RESULT(debateId));
    }
  }, [liveRoom?.status, debateId, router]);

  if (!Number.isFinite(numericId) || isError) {
    notFound();
  }

  const room = data?.data;
  if (isLoading || !room) {
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-var(--nav-height))] max-w-295 items-center justify-center px-4">
        <span className="text-sm font-bold text-(--text-2)">
          불러오는 중...
        </span>
      </div>
    );
  }

  const seatFor = (
    agreement: Agreement,
    stance: string,
    turnIndex: 0 | 1,
  ): DebaterState | null => {
    const participant = liveRoom?.participants.find(
      (p) => p.agreement === agreement,
    );
    if (!participant) return null;
    return {
      name: participant.nickname,
      sticker: agreement === "AGREE" ? "st-pro-basic" : "st-con-basic",
      statement: stance,
      ...turnState(elapsedSeconds, turnIndex),
    };
  };

  const pro = seatFor("AGREE", room.agreeLabel ?? "찬성", 0);
  const con = seatFor("DISAGREE", room.disagreeLabel ?? "반대", 1);

  const myAgreement = liveRoom?.participants.find(
    (p) => p.userId === myUserId,
  )?.agreement;
  const myTurn =
    myAgreement === "AGREE"
      ? turnState(elapsedSeconds, 0).speaking
      : myAgreement === "DISAGREE"
        ? turnState(elapsedSeconds, 1).speaking
        : false;

  const leaveRoom = () => {
    leave();
    router.push(ROUTES.DEBATES());
  };

  return (
    <div className="mx-auto max-w-295 px-4 pt-4 pb-8 sm:pt-5 sm:pb-10">
      {/* biome-ignore lint/a11y/useMediaCaption: opponent's live mic audio, nothing to caption */}
      <audio ref={remoteAudioRef} autoPlay className="hidden" />

      <div className="relative flex min-h-13 flex-col items-start gap-3 sm:items-center sm:justify-center">
        <button
          type="button"
          onClick={leaveRoom}
          className="inline-flex items-center gap-2 rounded-[10px] border border-(--border-1) bg-(--bg-card) px-4 py-2.5 text-sm font-bold sm:absolute sm:left-0 sm:px-4.5 sm:py-2.75"
        >
          <ArrowLeft size={15} strokeWidth={2.4} />
          나가기
        </button>
        <h1 className="m-0 text-left text-2xl font-extrabold tracking-[-0.3px] sm:text-center sm:text-[28px]">
          Q. {room.title}
        </h1>
      </div>

      {/* Chat transcript, spectator voting, and vote counts aren't part of
          the debate WS protocol yet — this panel just shows the step
          tracker until that's wired up. */}
      <VoteProgressPanel voteEnded={false} proVotes={0} conVotes={0} />

      <div className="mt-5.5 grid items-center gap-4 md:grid-cols-[1fr_88px_1fr] md:gap-x-0">
        <DebaterCard side="pro" debater={pro} />
        <div className="flex justify-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-(--border-1) bg-(--bg-card) text-lg font-extrabold sm:h-16 sm:w-16 sm:text-xl">
            VS
          </span>
        </div>
        <DebaterCard side="con" debater={con} />
      </div>

      <ChatLog messages={[]} />

      <ControlBar
        myTurn={myTurn}
        micOn={audioCall.micOn}
        onToggleMic={audioCall.toggleMic}
      />
    </div>
  );
}
