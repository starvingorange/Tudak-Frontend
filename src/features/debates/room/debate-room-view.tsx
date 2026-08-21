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
import { VoteProgressPanel } from "./vote-progress-panel";

interface DebateRoomViewProps {
  debateId: string;
}

// 대기방 문구에 나오는 "1인당 7분(입론+반론 6분 · 최종발언 1분)" 기준 — 찬성이
// 먼저 말하고 반대가 그다음. 양쪽 예산을 다 쓰면 방장이 토론을 종료한다.
// 서버가 밀어주는 타이머는 따로 없어서, 각 클라이언트가 `startedAt`(대기방에서
// STARTED를 관측한 시각)부터 스스로 같은 두 구간을 계산한다.
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

  const { data, isLoading, isError } = useGetDebate(numericId, {
    query: { enabled: Number.isFinite(numericId) },
  });

  const {
    myAgreement,
    isHost,
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
    disconnectCall,
  } = useDebateCall();

  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // 발언 타이머 — 대기방에서 P2P가 붙은 시점(`startedAt`)부터 흐른다.
  const endTriggeredRef = useRef(false);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (startedAt === null) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const elapsedSeconds = startedAt ? (now - startedAt) / 1000 : 0;

  // 종료: 호스트 쪽 타이머가 다 되면 상대에게 P2P로 알리고 결과 페이지로
  // 이동한다. 메시지가 유실돼도 상대는 자기 타이머로 결국 같은 결론에
  // 도달하므로(elapsedSeconds도 두 클라이언트 모두 계산 중), 이 effect
  // 자체가 fallback을 겸한다.
  useEffect(() => {
    if (startedAt === null || endTriggeredRef.current) return;
    if (elapsedSeconds < TURN_SECONDS * 2) return;
    endTriggeredRef.current = true;
    if (isHost) sendControl({ type: "end" });
    router.push(ROUTES.DEBATE_RESULT(debateId));
  }, [startedAt, elapsedSeconds, isHost, sendControl, router, debateId]);

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
  ): DebaterState | null => {
    if (!seat) return null;
    return {
      name: seat.name,
      sticker: seat.sticker,
      statement: stance,
      ...turnState(elapsedSeconds, turnIndex),
    };
  };

  const pro = seatFor(proSeatInfo, room.agreeLabel ?? "찬성", 0);
  const con = seatFor(conSeatInfo, room.disagreeLabel ?? "반대", 1);

  const myTurn =
    myAgreement === "AGREE"
      ? turnState(elapsedSeconds, 0).speaking
      : myAgreement === "DISAGREE"
        ? turnState(elapsedSeconds, 1).speaking
        : false;

  const leaveRoom = () => {
    sendControl({ type: "leave" });
    disconnectCall();
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
        micOn={micOn}
        onToggleMic={toggleMic}
        onReactionSend={sendReaction}
        incomingReaction={incomingReaction}
      />
    </div>
  );
}
