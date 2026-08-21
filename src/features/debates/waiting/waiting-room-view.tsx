"use client";

import { ArrowLeft, MessageCircle, X } from "lucide-react";
import Image from "next/image";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useGetDebate } from "@/api/debate/hooks/useGetDebate";
import { CategoryBadge } from "@/components/ui/category-badge";
import {
  type ConnectCallArgs,
  useDebateCall,
} from "@/features/debates/shared/debate-call-provider";
import { getSeatsFromDetail } from "@/features/debates/shared/debate-seats";
import { BACKEND_TO_CATEGORY } from "@/features/shared/categories";
import { getStickerSrc } from "@/features/shared/sticker-src";
import { useCurrentUserId } from "@/lib/auth/jwt";
import { ROUTES } from "@/lib/routes";
import type {
  Agreement,
  OutgoingSignalMessage,
  RoomParticipant,
  RoomStatusMessage,
} from "@/lib/ws/types";
import { useDebateRoomSocket } from "@/lib/ws/use-debate-room-socket";

interface Seat {
  name: string;
  sticker: string;
}

// The debate-detail API doesn't return a chosen sticker per seat — these are
// the same defaults the create flow's preview used.
const SEAT_STICKER = { pro: "st-pro-basic", con: "st-con-basic" } as const;

interface WaitingRoomViewProps {
  debateId: string;
}

function isAgreement(value: string | null): value is Agreement {
  return value === "AGREE" || value === "DISAGREE";
}

function seatFromParticipants(
  participants: RoomParticipant[],
  wanted: Agreement,
): Seat | null {
  const participant = participants.find((p) => p.agreement === wanted);
  return participant
    ? {
        name: participant.nickname,
        sticker: wanted === "AGREE" ? SEAT_STICKER.pro : SEAT_STICKER.con,
      }
    : null;
}

/** Builds the args for `connectCall` once the room is STARTED — shared by
 * the auto-trigger effect and the "다시 시도" retry button, both of which
 * only have the raw `liveRoom` snapshot to work from (the effect runs before
 * `myAgreement` is computed further down, since hooks can't sit after the
 * loading early-return). */
function buildCallArgs(
  liveRoom: RoomStatusMessage | null,
  agreement: Agreement | undefined,
  myUserId: number | null,
  sendSignal: (signal: OutgoingSignalMessage) => boolean,
): ConnectCallArgs | null {
  if (liveRoom?.status !== "STARTED" || liveRoom.callerId === null) {
    return null;
  }
  const resolvedAgreement =
    agreement ??
    liveRoom.participants.find((p) => p.userId === myUserId)?.agreement ??
    null;
  const peer = liveRoom.participants.find((p) => p.userId !== myUserId);
  if (!resolvedAgreement || !peer) return null;

  return {
    peerUserId: peer.userId,
    isCaller: liveRoom.callerId === myUserId,
    myAgreement: resolvedAgreement,
    isHost: liveRoom.callerId === myUserId,
    startedAt: Date.now(),
    sendSignal,
  };
}

export function WaitingRoomView({ debateId }: WaitingRoomViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const numericId = Number(debateId);
  const myUserId = useCurrentUserId();
  const [copyLabel, setCopyLabel] = useState("복사하기");
  const [kickedMessage, setKickedMessage] = useState<string | null>(null);
  // 서버에서는 origin을 알 수 없으니 빈 문자열로 시작해 하이드레이션
  // 불일치를 피하고, 마운트 후에 현재 도메인으로 채운다.
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  const inviteLink = `${origin}${ROUTES.DEBATE_WAITING(debateId)}`;

  // 방 생성 플로우(방장) 또는 참여 모달(게스트)에서 설정됨 — 이 클라이언트가
  // 차지할 좌석을 나타냄. 두 플로우 중 어느 쪽도 거치지 않고 바로 들어온
  // 경우(예: 오래된 북마크)에만 값이 없음.
  const agreementParam = searchParams.get("agreement");
  const agreement = isAgreement(agreementParam) ? agreementParam : undefined;

  const { data, isLoading, isError } = useGetDebate(numericId, {
    query: { enabled: Number.isFinite(numericId) },
  });

  const {
    connectCall,
    disconnectCall,
    handleSignal,
    callState,
    error: callError,
  } = useDebateCall();

  const {
    connectionState,
    room: liveRoom,
    error: wsError,
    join,
    kick,
    start,
    leave,
    sendSignal,
    refreshStatus,
  } = useDebateRoomSocket(debateId, {
    agreement,
    onKicked: (message) => setKickedMessage(message.message),
    onSignal: handleSignal,
  });

  // `agreement`가 없으면(오래된 링크) 훅이 join을 보내지 않았다는 뜻 —
  // 연결되면 대신 읽기 전용 상태 스냅샷만 조회한다.
  const statusRequestedRef = useRef(false);
  useEffect(() => {
    if (agreement || statusRequestedRef.current) return;
    if (connectionState !== "connected") return;
    statusRequestedRef.current = true;
    refreshStatus();
  }, [agreement, connectionState, refreshStatus]);

  useEffect(() => {
    if (!kickedMessage) return;
    const timer = setTimeout(() => router.push(ROUTES.DEBATES()), 1500);
    return () => clearTimeout(timer);
  }, [kickedMessage, router]);

  // 초대링크로 들어온 게스트는 URL에 `agreement`가 없다 — 아직 참가자가
  // 아니므로 status 조회(위 effect)가 D006(참가자 아님)으로 거부되는데, 이걸
  // 입장 선택 UI 대신 "남은 자리로 자동 참여"로 처리한다. `liveRoom`은 이
  // 시점엔 아직 null(실패한 refreshStatus에서 온 게 아니라 join 성공 후에만
  // 채워짐)이라 REST 스냅샷(`data`)에서 직접 빈 자리를 판단해야 한다.
  const autoJoinRef = useRef(false);
  useEffect(() => {
    if (autoJoinRef.current || agreement) return;
    if (wsError?.error !== "D006") return;
    const detail = data?.data;
    if (!detail) return;
    const { pro: p, con: c } = getSeatsFromDetail(detail);
    const openAgreement: Agreement | null =
      p === null && c !== null
        ? "AGREE"
        : c === null && p !== null
          ? "DISAGREE"
          : null;
    if (!openAgreement) return;
    autoJoinRef.current = true;
    join(openAgreement);
  }, [agreement, wsError, data, join]);

  // 방이 STARTED되면 (아직 살아있는 이 소켓으로) WebRTC 시그널링을 시작한다 —
  // P2P가 실제로 붙기 전까진 토론방으로 넘어가지 않는다(토론방은 소켓이 아예
  // 없어서, 여기서 다 맺어놓고 넘겨줘야 함).
  const callRequestedRef = useRef(false);
  useEffect(() => {
    if (callRequestedRef.current) return;
    const args = buildCallArgs(liveRoom, agreement, myUserId, sendSignal);
    if (!args) return;
    callRequestedRef.current = true;
    connectCall(args);
  }, [liveRoom, agreement, myUserId, sendSignal, connectCall]);

  useEffect(() => {
    if (callState === "connected") {
      router.push(ROUTES.DEBATE_DETAIL(debateId));
    }
  }, [callState, debateId, router]);

  if (!Number.isFinite(numericId) || isError) {
    notFound();
  }

  const room = data?.data;
  if (isLoading || !room) {
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-var(--nav-height))] max-w-240 items-center justify-center px-4">
        <span className="text-sm font-bold text-(--text-2)">
          불러오는 중...
        </span>
      </div>
    );
  }

  // 최초 렌더링용 REST 스냅샷일 뿐이고, 소켓이 실시간 `RoomStatusMessage`를
  // 전달하기 시작하면(join/leave/kick 각각 모든 참가자의 개인 큐로 하나씩
  // push함) 그때부턴 그게 좌석 정보의 기준이 된다.
  const { pro: restPro, con: restCon } = getSeatsFromDetail(room);

  const pro = liveRoom
    ? seatFromParticipants(liveRoom.participants, "AGREE")
    : restPro;
  const con = liveRoom
    ? seatFromParticipants(liveRoom.participants, "DISAGREE")
    : restCon;
  const bothSeated = pro !== null && con !== null;
  const category = room.category ? BACKEND_TO_CATEGORY[room.category] : "기타";

  const myAgreement: Agreement | null =
    agreement ??
    liveRoom?.participants.find((p) => p.userId === myUserId)?.agreement ??
    null;
  const isHost = myAgreement !== null && myAgreement === room.hostAgreement;

  // 초대링크로 들어온 게스트가 아직 참가자가 아니라 D006을 받은 상태 —
  // 위 effect가 자동으로 남은 자리에 join을 시도 중이다. "오래된 북마크"
  // 에러 배너 대신 이 상태 전용 메시지를 보여준다.
  const needsStancePick =
    !agreement && myAgreement === null && wsError?.error === "D006";

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
    } catch {
      // clipboard access denied — the link is still visible to copy manually
    }
    setCopyLabel("복사됨!");
    setTimeout(() => setCopyLabel("복사하기"), 1500);
  };

  const leaveRoom = () => {
    disconnectCall();
    leave();
    router.push(ROUTES.DEBATES());
  };

  const retryCall = () => {
    const args = buildCallArgs(liveRoom, agreement, myUserId, sendSignal);
    if (args) connectCall(args);
  };

  const started = liveRoom?.status === "STARTED";
  const connectingCall = started && callState !== "connected";

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-var(--nav-height))] max-w-240 flex-col justify-between gap-6 px-4 py-6 sm:py-8">
      <div className="flex flex-col justify-between gap-5">
        <div className="relative flex min-h-9 flex-col items-start gap-3 sm:items-center sm:justify-center">
          <button
            type="button"
            onClick={leaveRoom}
            className="inline-flex items-center gap-2 rounded-[10px] border border-(--border-1) bg-(--bg-card) px-4 py-2.5 text-sm font-bold sm:absolute sm:left-0 sm:top-1/2 sm:-translate-y-1/2 sm:px-4.5 sm:py-2.75"
          >
            <ArrowLeft size={15} strokeWidth={2.4} />
            나가기
          </button>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-extrabold text-(--brand-yellow) tracking-wide">
            토론 대기방
          </span>
          <h1 className="m-0 text-center text-3xl font-black tracking-[-0.5px] sm:text-4xl">
            {room.title}
          </h1>
        </div>

        {kickedMessage && (
          <div className="rounded-xl bg-[#fdecec] text-(--vote-red) text-center text-sm font-bold py-3.5 px-4.5">
            {kickedMessage}
          </div>
        )}
        {/* D006(참가자 아님)은 항상 아래 "자동 참여 중.../정원 찼음" 전용
            메시지로만 보여준다 — 참여가 성공한 뒤에도 실패했던 예전 시도의
            에러가 wsError에 그대로 남아있어서, 코드로 걸러주지 않으면 참여
            완료 후에도 이 배너가 계속 떠 있게 된다. */}
        {!kickedMessage && wsError && wsError.error !== "D006" && (
          <div className="rounded-xl bg-[#fdecec] text-(--vote-red) text-center text-sm font-bold py-3.5 px-4.5">
            {wsError.message}
          </div>
        )}
        {needsStancePick && (
          <div className="rounded-xl border border-(--border-1) bg-(--bg-card) text-center text-sm font-bold text-(--text-2) py-3.5 px-4.5">
            남은 자리로 참여하는 중...
          </div>
        )}

        <div className="flex flex-col gap-3.5 rounded-2xl bg-(--bg-hero) p-4 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <span className="w-20 shrink-0 text-sm font-bold text-(--text-2)">
              카테고리
            </span>
            <span className="hidden h-4.5 w-px bg-(--border-1) sm:block" />
            <CategoryBadge category={category} />
          </div>
          {room.content && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <span className="w-20 shrink-0 text-sm font-bold text-(--text-2)">
                안건 설명
              </span>
              <span className="hidden h-4.5 w-px bg-(--border-1) sm:block" />
              <span className="text-[15px] font-bold leading-relaxed">
                {room.content}
              </span>
            </div>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <span className="w-20 shrink-0 text-sm font-bold text-(--text-2)">
              발언 시간
            </span>
            <span className="hidden h-4.5 w-px bg-(--border-1) sm:block" />
            <span className="text-[15px] font-bold leading-relaxed">
              1인당 7분{" "}
              <span className="font-semibold text-[13px] text-(--text-2)">
                (입론+반론 6분 · 최종발언 1분)
              </span>
            </span>
          </div>
        </div>

        <div className="grid items-stretch gap-4 sm:gap-6 md:grid-cols-[1fr_auto_1fr]">
          <WaitingSeat
            label="찬성"
            stance={room.agreeLabel ?? "찬성"}
            seat={pro}
            color="var(--vote-blue)"
            onKick={
              isHost && pro !== null && myAgreement !== "AGREE"
                ? kick
                : undefined
            }
          />
          <div className="self-center justify-self-center px-2 text-[28px] font-black text-(--text-3) md:text-[34px]">
            VS
          </div>
          <WaitingSeat
            label="반대"
            stance={room.disagreeLabel ?? "반대"}
            seat={con}
            color="var(--vote-red)"
            onKick={
              isHost && con !== null && myAgreement !== "DISAGREE"
                ? kick
                : undefined
            }
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2.5">
          <div className="text-base font-extrabold">초대 링크</div>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-3.5">
            <div className="min-w-0 flex-1 break-all rounded-2xl border border-(--border-1) bg-(--bg-card) px-4 py-4 text-sm text-(--text-2) sm:px-5 sm:text-base">
              {inviteLink}
            </div>
            <button
              type="button"
              onClick={copyInvite}
              className="flex h-14 shrink-0 items-center justify-center gap-2 rounded-2xl border-[1.5px] border-(--brand-yellow) bg-(--bg-card) px-6 text-[15px] font-extrabold whitespace-nowrap hover:bg-(--bg-hero) sm:self-auto"
            >
              {copyLabel}
            </button>
          </div>
          <div className="text-sm text-(--text-2)">
            링크를 공유하면 상대방이 이 토론방에 입장할 수 있어요.
          </div>
        </div>

        {connectingCall ? (
          callState === "failed" ? (
            <div className="flex h-14 items-center justify-center gap-3 rounded-2xl border border-(--vote-red) bg-(--bg-card) px-4 text-sm font-bold">
              <span className="text-(--vote-red)">
                {callError ?? "상대방과 연결하지 못했어요."}
              </span>
              <button
                type="button"
                onClick={retryCall}
                className="rounded-full border border-(--vote-red) px-3.5 py-1.5 text-(--vote-red) cursor-pointer hover:bg-[#fdecec]"
              >
                다시 시도
              </button>
            </div>
          ) : (
            <div className="flex h-14 items-center justify-center gap-2.5 rounded-2xl border border-(--border-1) bg-(--bg-card) text-base font-bold text-(--text-2)">
              상대와 연결 중...
            </div>
          )
        ) : (
          <button
            type="button"
            onClick={() => isHost && start()}
            disabled={!isHost || !bothSeated}
            className="h-14 rounded-2xl border-none bg-(--brand-yellow) text-(--brand-on-yellow) text-base font-black font-sans flex items-center justify-center gap-2.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 hover:brightness-[0.96]"
          >
            <MessageCircle size={18} strokeWidth={2.2} />
            {!bothSeated
              ? "상대방을 기다리는 중..."
              : isHost
                ? "토론 시작하기"
                : "호스트가 곧 시작해요..."}
          </button>
        )}
      </div>
    </div>
  );
}

function WaitingSeat({
  label,
  stance,
  seat,
  color,
  onKick,
}: {
  label: string;
  stance: string;
  seat: Seat | null;
  color: string;
  onKick?: () => void;
}) {
  return (
    <div
      className="relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 bg-(--bg-card) px-4 py-5 sm:px-5 sm:py-6"
      style={{ borderColor: seat ? color : "var(--border-1)" }}
    >
      {onKick && (
        <button
          type="button"
          onClick={onKick}
          title="강퇴하기"
          className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full border border-(--border-1) bg-(--bg-card) text-(--text-2) cursor-pointer hover:border-(--vote-red) hover:text-(--vote-red)"
        >
          <X size={14} strokeWidth={2.4} />
        </button>
      )}
      <div
        className="text-sm font-extrabold px-3.5 py-1 rounded-full text-white"
        style={{ background: seat ? color : "var(--text-3)" }}
      >
        {label}
      </div>
      <div className="relative rounded-2xl bg-(--bg-hero) px-4 py-3 text-center text-sm font-bold leading-relaxed sm:px-5.5 sm:py-3.5 sm:text-[15px]">
        {stance}
      </div>
      {seat ? (
        <>
          <Image
            src={getStickerSrc(seat.sticker)}
            alt={seat.name}
            width={120}
            height={120}
            className="h-24 w-24 rounded-full border border-(--border-1) bg-(--bg-hero) object-contain sm:h-30 sm:w-30"
          />
          <div className="text-center text-lg font-black sm:text-xl">
            {seat.name}
          </div>
          <div className="flex items-center gap-2 text-[15px] font-bold text-[#B08A00]">
            <span className="w-2.25 h-2.25 rounded-full bg-(--brand-yellow)" />
            대기 중
          </div>
        </>
      ) : (
        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-dashed border-(--border-1) px-4 text-center text-[13px] text-(--text-3) sm:h-30 sm:w-30">
          참가자를
          <br />
          기다리는 중
        </div>
      )}
    </div>
  );
}
