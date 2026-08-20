"use client";

import { ArrowLeft, MessageCircle, X } from "lucide-react";
import Image from "next/image";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useGetDebate } from "@/api/debate/hooks/useGetDebate";
import { CategoryBadge } from "@/components/ui/category-badge";
import { BACKEND_TO_CATEGORY } from "@/features/shared/categories";
import { getStickerSrc } from "@/features/shared/sticker-src";
import { useCurrentUserId } from "@/lib/auth/jwt";
import { ROUTES } from "@/lib/routes";
import type { Agreement, RoomParticipant } from "@/lib/ws/types";
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

export function WaitingRoomView({ debateId }: WaitingRoomViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const numericId = Number(debateId);
  const myUserId = useCurrentUserId();
  const [copyLabel, setCopyLabel] = useState("복사하기");
  const [kickedMessage, setKickedMessage] = useState<string | null>(null);
  const inviteLink = `tudak.app/join/${debateId}`;

  // 방 생성 플로우(방장) 또는 참여 모달(게스트)에서 설정됨 — 이 클라이언트가
  // 차지할 좌석을 나타냄. 두 플로우 중 어느 쪽도 거치지 않고 바로 들어온
  // 경우(예: 오래된 북마크)에만 값이 없음.
  const agreementParam = searchParams.get("agreement");
  const agreement = isAgreement(agreementParam) ? agreementParam : undefined;

  const { data, isLoading, isError } = useGetDebate(numericId, {
    query: { enabled: Number.isFinite(numericId) },
  });

  const {
    connectionState,
    room: liveRoom,
    error: wsError,
    kick,
    start,
    leave,
    refreshStatus,
  } = useDebateRoomSocket(debateId, {
    agreement,
    onKicked: (message) => setKickedMessage(message.message),
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

  useEffect(() => {
    if (liveRoom?.status === "STARTED") {
      router.push(ROUTES.DEBATE_DETAIL(debateId));
    }
  }, [liveRoom?.status, debateId, router]);

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
  const restPro: Seat | null =
    room.hostAgreement === "AGREE" && room.hostNickname
      ? { name: room.hostNickname, sticker: SEAT_STICKER.pro }
      : room.opponentAgreement === "AGREE" && room.opponentNickname
        ? { name: room.opponentNickname, sticker: SEAT_STICKER.pro }
        : null;
  const restCon: Seat | null =
    room.hostAgreement === "DISAGREE" && room.hostNickname
      ? { name: room.hostNickname, sticker: SEAT_STICKER.con }
      : room.opponentAgreement === "DISAGREE" && room.opponentNickname
        ? { name: room.opponentNickname, sticker: SEAT_STICKER.con }
        : null;

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
    leave();
    router.push(ROUTES.DEBATES());
  };

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
        {!kickedMessage && wsError && (
          <div className="rounded-xl bg-[#fdecec] text-(--vote-red) text-center text-sm font-bold py-3.5 px-4.5">
            {wsError.message}
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
