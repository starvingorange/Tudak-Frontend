"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useGetDebate } from "@/api/debate/hooks/useGetDebate";
import { useDebateCall } from "@/features/debates/shared/debate-call-provider";
import { getSeatsFromDetail } from "@/features/debates/shared/debate-seats";
import { ROUTES } from "@/lib/routes";
import { ChatLog } from "./chat-log";
import { ControlBar } from "./control-bar";
import type { DebaterState } from "./data";
import { DebaterCard } from "./debater-card";
import { TURN_SECONDS, useDebateTurns } from "./use-debate-turns";
import { VoteProgressPanel } from "./vote-progress-panel";

interface DebateRoomViewProps {
  debateId: string;
}

function formatClock(totalSeconds: number): string {
  const clamped = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function DebateRoomView({ debateId }: DebateRoomViewProps) {
  const router = useRouter();
  const numericId = Number(debateId);

  const { data, isLoading, isError } = useGetDebate(numericId, {
    query: { enabled: Number.isFinite(numericId) },
  });

  const {
    myAgreement,
    startedAt,
    callState,
    error: callError,
    remoteStream,
    micOn,
    toggleMic,
    sendReaction,
    incomingReaction,
    sendControl,
    incomingControl,
    sendTurn,
    incomingTurn,
    disconnectCall,
  } = useDebateCall();

  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const endTriggeredRef = useRef(false);
  const myTurnIndex: 0 | 1 | null =
    myAgreement === "AGREE" ? 0 : myAgreement === "DISAGREE" ? 1 : null;

  const {
    countdown,
    currentTurnIndex,
    isMyTurnNow,
    proRemainingSeconds,
    conRemainingSeconds,
    endTurn,
  } = useDebateTurns({
    myTurnIndex,
    micOn,
    toggleMic,
    sendTurn,
    incomingTurn,
    // 마지막(반대) 턴이 끝났을 때 — 시간이 다 됐거나 발언 종료를 눌렀을 때.
    onDebateEnd: () => {
      if (endTriggeredRef.current) return;
      endTriggeredRef.current = true;
      sendControl({ type: "end" });
      router.push(ROUTES.DEBATE_RESULT(debateId));
    },
  });

  useEffect(() => {
    if (incomingControl?.message.type === "end" && !endTriggeredRef.current) {
      endTriggeredRef.current = true;
      router.push(ROUTES.DEBATE_RESULT(debateId));
    }
  }, [incomingControl, router, debateId]);

  const [leftMessage, setLeftMessage] = useState<string | null>(null);
  useEffect(() => {
    if (incomingControl?.message.type === "leave") {
      setLeftMessage("상대방이 토론방을 나갔어요.");
    }
  }, [incomingControl]);
  useEffect(() => {
    if (!leftMessage) return;
    const timer = setTimeout(() => router.push(ROUTES.DEBATES()), 1500);
    return () => clearTimeout(timer);
  }, [leftMessage, router]);

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

  // 이 탭에서 대기방을 거치지 않고(새로고침 포함) 바로 이 URL로 들어온 경우
  // `startedAt`이 null — P2P 연결이 대기방에서만 맺어지므로 복구할 방법이
  // 없다. 빈 방을 그냥 보여주는 대신 대기방으로 돌아가게 안내한다.
  if (startedAt === null) {
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-var(--nav-height))] max-w-295 flex-col items-center justify-center gap-4 px-4 text-center">
        <span className="text-sm font-bold text-(--text-2)">
          이 페이지는 대기방을 통해서만 입장할 수 있어요.
        </span>
        <Link
          href={ROUTES.DEBATE_WAITING(debateId)}
          className="inline-flex items-center justify-center rounded-2xl bg-(--brand-yellow) px-6 py-3 text-sm font-extrabold text-(--brand-on-yellow) no-underline hover:brightness-[0.96]"
        >
          대기방으로 이동
        </Link>
      </div>
    );
  }

  const { pro: proSeatInfo, con: conSeatInfo } = getSeatsFromDetail(room);

  const seatFor = (
    seat: { name: string; sticker: string } | null,
    stance: string,
    turnIndex: 0 | 1,
    remainingSeconds: number,
  ): DebaterState | null => {
    if (!seat) return null;
    // 카운트다운이 도는 동안은 둘 다 중립 상태로 두고, 끝나는 순간 발언자
    // 쪽만 강조/반대쪽만 흐려지는 게 트랜지션으로 보이게 한다 — 카운트다운
    // 오버레이가 사라지기 전에 이미 스타일이 결정돼 있으면 그 변화가 안
    // 보이므로, `countdown === null`이 되고 나서야 갈린다.
    const turnDecided = countdown === null;
    return {
      name: seat.name,
      sticker: seat.sticker,
      statement: stance,
      remainingLabel: formatClock(remainingSeconds),
      remainingPercent: (remainingSeconds / TURN_SECONDS) * 100,
      speaking: turnDecided && currentTurnIndex === turnIndex,
      dimmed: turnDecided && currentTurnIndex !== turnIndex,
    };
  };

  const pro = seatFor(
    proSeatInfo,
    room.agreeLabel ?? "찬성",
    0,
    proRemainingSeconds,
  );
  const con = seatFor(
    conSeatInfo,
    room.disagreeLabel ?? "반대",
    1,
    conRemainingSeconds,
  );

  const leaveRoom = () => {
    sendControl({ type: "leave" });
    disconnectCall();
    router.push(ROUTES.DEBATES());
  };

  return (
    <div className="mx-auto max-w-295 px-4 pt-4 pb-8 sm:pt-5 sm:pb-10">
      {/* biome-ignore lint/a11y/useMediaCaption: opponent's live mic audio, nothing to caption */}
      <audio ref={remoteAudioRef} autoPlay className="hidden" />

      {countdown !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55">
          <span className="text-9xl font-black text-white">{countdown}</span>
        </div>
      )}

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

      {leftMessage && (
        <div className="mt-4 rounded-xl bg-[#fdecec] text-(--vote-red) text-center text-sm font-bold py-3.5 px-4.5">
          {leftMessage}
        </div>
      )}
      {!leftMessage && callState === "failed" && (
        <div className="mt-4 rounded-xl bg-[#fdecec] text-(--vote-red) text-center text-sm font-bold py-3.5 px-4.5">
          {callError ?? "상대방과의 연결이 끊어졌어요."}
        </div>
      )}

      {/* 채팅 로그, 관전자 투표, 득표수는 아직 토론 WS 프로토콜에 없는 기능이라
          — 연동되기 전까지 이 패널은 스텝 트래커만 보여준다. */}
      <VoteProgressPanel voteEnded={false} proVotes={0} conVotes={0} />

      <div className="mt-5.5 grid items-center gap-4 md:grid-cols-[1fr_88px_1fr] md:gap-x-0">
        <DebaterCard side="pro" debater={pro} isMe={myTurnIndex === 0} />
        <div className="flex justify-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-(--border-1) bg-(--bg-card) text-lg font-extrabold sm:h-16 sm:w-16 sm:text-xl">
            VS
          </span>
        </div>
        <DebaterCard side="con" debater={con} isMe={myTurnIndex === 1} />
      </div>

      <ChatLog messages={[]} />

      <ControlBar
        myTurn={isMyTurnNow}
        micOn={micOn}
        onToggleMic={toggleMic}
        onEndTurn={endTurn}
        onReactionSend={sendReaction}
        incomingReaction={incomingReaction}
      />
    </div>
  );
}
