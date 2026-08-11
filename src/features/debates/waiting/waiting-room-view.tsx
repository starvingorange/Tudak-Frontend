"use client";

import { MessageCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CategoryBadge } from "@/components/ui/category-badge";
import type { WaitingRoomInfo } from "./data";

interface WaitingRoomViewProps {
  room: WaitingRoomInfo;
}

export function WaitingRoomView({ room }: WaitingRoomViewProps) {
  const router = useRouter();
  const [copyLabel, setCopyLabel] = useState("복사하기");
  const [started, setStarted] = useState(false);
  const inviteLink = `tudak.app/join/${room.id}`;
  const bothSeated = room.pro !== null && room.con !== null;

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
    } catch {
      // clipboard access denied — the link is still visible to copy manually
    }
    setCopyLabel("복사됨!");
    setTimeout(() => setCopyLabel("복사하기"), 1500);
  };

  const startDebate = () => {
    if (!bothSeated) return;
    setStarted(true);
    setTimeout(() => router.push(`/debates/${room.id}`), 1200);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-var(--nav-height))] max-w-240 flex-col justify-between gap-6 px-4 py-6 sm:py-8">
      <div className="flex flex-col justify-between gap-5">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-extrabold text-(--brand-yellow) tracking-wide">
            토론 대기방
          </span>
          <h1 className="m-0 text-center text-3xl font-black tracking-[-0.5px] sm:text-4xl">
            {room.topic}
          </h1>
        </div>

        <div className="flex flex-col gap-3.5 rounded-2xl bg-(--bg-hero) p-4 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <span className="w-20 shrink-0 text-sm font-bold text-(--text-2)">
              카테고리
            </span>
            <span className="hidden h-4.5 w-px bg-(--border-1) sm:block" />
            <CategoryBadge category={room.category} />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <span className="w-20 shrink-0 text-sm font-bold text-(--text-2)">
              안건 설명
            </span>
            <span className="hidden h-4.5 w-px bg-(--border-1) sm:block" />
            <span className="text-[15px] font-bold leading-relaxed">
              {room.description}
            </span>
          </div>
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
            stance={room.proStance}
            seat={room.pro}
            color="var(--vote-blue)"
          />
          <div className="self-center justify-self-center px-2 text-[28px] font-black text-(--text-3) md:text-[34px]">
            VS
          </div>
          <WaitingSeat
            label="반대"
            stance={room.conStance}
            seat={room.con}
            color="var(--vote-red)"
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
          onClick={startDebate}
          disabled={!bothSeated}
          className="h-14 rounded-2xl border-none bg-(--brand-yellow) text-(--brand-on-yellow) text-base font-black font-sans flex items-center justify-center gap-2.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 hover:brightness-[0.96]"
        >
          <MessageCircle size={18} strokeWidth={2.2} />
          {bothSeated ? "토론 시작하기" : "상대방을 기다리는 중..."}
        </button>
        {started && (
          <div className="rounded-xl bg-[#E7F8EE] text-[#1F9D55] text-center text-sm font-bold py-3.5 px-4.5">
            토론이 시작됩니다! 🔥
          </div>
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
}: {
  label: string;
  stance: string;
  seat: { name: string; sticker: string } | null;
  color: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 bg-(--bg-card) px-4 py-5 sm:px-5 sm:py-6"
      style={{ borderColor: seat ? color : "var(--border-1)" }}
    >
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
            src={`/assets/stickers/${seat.sticker}.png`}
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
