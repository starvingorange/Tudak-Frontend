"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGetDebate } from "@/api/debate/hooks/useGetDebate";
import { useDebateCall } from "@/features/debates/shared/debate-call-provider";
import { getSeatsFromDetail } from "@/features/debates/shared/debate-seats";
import { ROUTES } from "@/lib/routes";
import { useLiveCaption } from "@/lib/webrtc/use-live-caption";
import { ChatLog } from "./chat-log";
import { ControlBar } from "./control-bar";
import type { DebaterState, TranscriptMessage } from "./data";
import { DebaterCard } from "./debater-card";
import { formatClock, TURN_SECONDS, useDebateTurns } from "./use-debate-turns";
import { VoteProgressPanel } from "./vote-progress-panel";

interface DebateRoomViewProps {
  debateId: string;
}

/** 실시간 자막 말풍선 하나 — `TranscriptMessage`와 달리 화자 이름은 안
 * 들고 있음(렌더 시점에 `pro`/`con` 시트 정보로 채움), 대신 `step`으로
 * 같은 턴의 갱신을 찾아 텍스트만 덮어쓴다. */
interface LiveTranscriptEntry {
  step: number;
  side: "pro" | "con";
  time: string;
  text: string;
}

function formatTimeLabel(): string {
  return new Date().toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
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
    sendCaption,
    incomingCaption,
    disconnectCall,
    startRecordingTurn,
    stopRecordingTurn,
    myProfileImageUrl,
    opponentProfileImageUrl,
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

  // 마지막(반대) 턴이 끝났을 때 — 시간이 다 됐거나 발언 종료를 눌렀을 때.
  // useCallback으로 고정해두면 이걸 deps로 삼는 useDebateTurns의 endTurn도
  // 안정된 참조를 유지한다 — 인라인 함수였다면 매 렌더마다 새로 만들어져
  // endTurn과 그걸 구독하는 자동종료 effect가 불필요하게 재생성됐다.
  const onDebateEnd = useCallback(() => {
    if (endTriggeredRef.current) return;
    endTriggeredRef.current = true;
    sendControl({ type: "end" });
    router.push(ROUTES.DEBATE_RESULT(debateId));
  }, [sendControl, router, debateId]);

  // 실시간 자막 — step으로 같은 턴의 말풍선을 찾아 텍스트만 갱신한다(매
  // 인식 조각마다 새 말풍선이 쌓이지 않게). 화자 이름은 여기서 안 채우고
  // ChatLog에 넘기기 직전(아래 JSX)에 그 시점의 pro/con 시트 정보로 채운다
  // — 이 훅들은 이르게 로딩 상태의 컴포넌트 return 이전에 있어서, room이
  // 아직 없을 때 이름을 미리 닫아버리면(closure) 나중에 room이 로드돼도
  // 갱신 안 되는 문제를 피하기 위함이다.
  const [transcript, setTranscript] = useState<LiveTranscriptEntry[]>([]);

  const upsertTranscript = useCallback(
    (step: number, side: 0 | 1, text: string) => {
      setTranscript((prev) => {
        const idx = prev.findIndex((m) => m.step === step);
        if (idx === -1) {
          if (!text) return prev;
          return [
            ...prev,
            {
              step,
              side: side === 0 ? "pro" : "con",
              time: formatTimeLabel(),
              text,
            },
          ];
        }
        const next = [...prev];
        next[idx] = { ...next[idx], text };
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    if (!incomingCaption) return;
    upsertTranscript(
      incomingCaption.step,
      incomingCaption.side,
      incomingCaption.text,
    );
  }, [incomingCaption, upsertTranscript]);

  const handleCaptionResult = useCallback(
    (step: number, side: 0 | 1, text: string, isFinal: boolean) => {
      upsertTranscript(step, side, text);
      sendCaption({ type: "caption", step, side, text, isFinal });
    },
    [upsertTranscript, sendCaption],
  );

  const { startTurn: startCaptionTurn, stopTurn: stopCaptionTurn } =
    useLiveCaption({ mySide: myTurnIndex, onResult: handleCaptionResult });

  // 턴이 끝나는 순간(발언 종료를 눌렀든 시간이 다 됐든) 그때까지 인식된
  // 최종 텍스트를 stopCaptionTurn에서 받아, 같은 턴의 업로드(stopRecordingTurn)에
  // 실어 보낸다 — finishDebate 요청의 voiceDataList[].sttText가 이렇게
  // 채워진다.
  const handleTurnEnd = useCallback(
    (step: number, side: 0 | 1) => {
      const sttText = stopCaptionTurn(step, side);
      stopRecordingTurn(step, side, sttText);
    },
    [stopCaptionTurn, stopRecordingTurn],
  );

  const {
    countdown,
    step,
    currentTurnIndex,
    currentPhase,
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
    onTurnStart: startRecordingTurn,
    onTurnEnd: handleTurnEnd,
    onDebateEnd,
  });

  // 마이크가 켜져 있는 동안만(=실제로 말하는 동안만) 인식을 돌린다 — 녹음은
  // 턴 내내 로컬 스트림을 그대로 녹음해 마이크가 꺼진 구간은 무음으로
  // 남지만, Web Speech API는 트랙의 enabled 상태와 무관하게 실제 마이크
  // 입력을 그대로 듣기 때문에 마이크를 끈 동안까지 인식하면 상대에게
  // 전달하는 자막과 실제 오디오 뮤트 상태가 어긋난다. 턴이 끝날 때의 정지는
  // 위 handleTurnEnd가 직접 처리하므로, 여기 cleanup은 사실상 "턴 중
  // 마이크를 일시적으로 끈" 경우만 담당한다(같은 턴이면 use-live-caption이
  // 누적 텍스트를 안 버림).
  useEffect(() => {
    if (!isMyTurnNow || !micOn) return;
    startCaptionTurn(step, currentTurnIndex);
    return () => {
      stopCaptionTurn(step, currentTurnIndex);
    };
  }, [
    isMyTurnNow,
    micOn,
    step,
    currentTurnIndex,
    startCaptionTurn,
    stopCaptionTurn,
  ]);

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
    imageUrl: string | null,
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
      imageUrl,
      statement: stance,
      remainingLabel: formatClock(remainingSeconds),
      remainingPercent: (remainingSeconds / TURN_SECONDS) * 100,
      speaking: turnDecided && currentTurnIndex === turnIndex,
      dimmed: turnDecided && currentTurnIndex !== turnIndex,
    };
  };

  const proImageUrl =
    myTurnIndex === 0 ? myProfileImageUrl : opponentProfileImageUrl;
  const conImageUrl =
    myTurnIndex === 1 ? myProfileImageUrl : opponentProfileImageUrl;

  const pro = seatFor(
    proSeatInfo,
    room.agreeLabel ?? "찬성",
    0,
    proRemainingSeconds,
    proImageUrl,
  );
  const con = seatFor(
    conSeatInfo,
    room.disagreeLabel ?? "반대",
    1,
    conRemainingSeconds,
    conImageUrl,
  );

  const leaveRoom = () => {
    sendControl({ type: "leave" });
    disconnectCall();
    router.push(ROUTES.DEBATES());
  };

  // 화자 이름은 여기서 채운다 — `transcript` 자체는 이름 없이 step/side만
  // 들고 있는 이유는 위 훅 선언부 주석 참고.
  const chatMessages: TranscriptMessage[] = transcript.map((message) => ({
    ...message,
    name:
      (message.side === "pro" ? pro?.name : con?.name) ??
      (message.side === "pro"
        ? (room.agreeLabel ?? "찬성")
        : (room.disagreeLabel ?? "반대")),
  }));

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

      {/* 관전자 투표, 득표수는 아직 토론 WS 프로토콜에 없는 기능이라 —
          연동되기 전까지 이 패널은 스텝 트래커만 보여준다. */}
      <VoteProgressPanel
        voteEnded={false}
        currentPhase={currentPhase}
        proVotes={0}
        conVotes={0}
      />

      <div className="mt-5.5 grid items-center gap-4 md:grid-cols-[1fr_88px_1fr] md:gap-x-0">
        <DebaterCard side="pro" debater={pro} isMe={myTurnIndex === 0} />
        <div className="flex justify-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-(--border-1) bg-(--bg-card) text-lg font-extrabold sm:h-16 sm:w-16 sm:text-xl">
            VS
          </span>
        </div>
        <DebaterCard side="con" debater={con} isMe={myTurnIndex === 1} />
      </div>

      <ChatLog messages={chatMessages} />

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
