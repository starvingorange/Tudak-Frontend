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
    <div className="max-w-[960px] mx-auto px-4 pt-8 pb-14 flex flex-col gap-9">
      <h1 className="text-center text-[38px] font-black tracking-[-0.5px] m-0">
        {room.topic}
      </h1>

      <div className="bg-[var(--bg-hero)] rounded-2xl p-7 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-[var(--text-2)] w-20 shrink-0">
            카테고리
          </span>
          <span className="w-px h-[18px] bg-[var(--border-1)]" />
          <CategoryBadge category={room.category} />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-[var(--text-2)] w-20 shrink-0">
            안건 설명
          </span>
          <span className="w-px h-[18px] bg-[var(--border-1)]" />
          <span className="text-[15px] font-bold">{room.description}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-[var(--text-2)] w-20 shrink-0">
            발언 시간
          </span>
          <span className="w-px h-[18px] bg-[var(--border-1)]" />
          <span className="text-[15px] font-bold">
            1인당 7분{" "}
            <span className="font-semibold text-[13px] text-[var(--text-2)]">
              (입론+반론 6분 · 최종발언 1분)
            </span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-6 py-3">
        <WaitingSeat label="찬성" seat={room.pro} color="var(--vote-blue)" />
        <div className="text-[34px] font-black text-[var(--text-3)] self-center px-2">
          VS
        </div>
        <WaitingSeat label="반대" seat={room.con} color="var(--vote-red)" />
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="text-base font-extrabold">초대 링크</div>
        <div className="flex gap-3.5">
          <div className="flex-1 bg-[var(--bg-card)] border border-[var(--border-1)] rounded-2xl px-5 py-4 text-base text-[var(--text-2)]">
            {inviteLink}
          </div>
          <button
            type="button"
            onClick={copyInvite}
            className="flex items-center gap-2 h-14 px-6 rounded-2xl border-[1.5px] border-[var(--brand-yellow)] bg-[var(--bg-card)] text-[15px] font-extrabold cursor-pointer whitespace-nowrap shrink-0 hover:bg-[var(--bg-hero)]"
          >
            {copyLabel}
          </button>
        </div>
        <div className="text-sm text-[var(--text-2)]">
          링크를 공유하면 상대방이 이 토론방에 입장할 수 있어요.
        </div>
      </div>

      <button
        type="button"
        onClick={startDebate}
        disabled={!bothSeated}
        className="h-16 rounded-2xl border-none bg-[var(--brand-yellow)] text-[var(--brand-on-yellow)] text-lg font-black font-sans flex items-center justify-center gap-2.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 hover:brightness-[0.96]"
      >
        <MessageCircle size={20} strokeWidth={2.2} />
        {bothSeated ? "토론 시작하기" : "상대방을 기다리는 중..."}
      </button>
      {started && (
        <div className="rounded-xl bg-[#E7F8EE] text-[#1F9D55] text-center text-sm font-bold py-3.5 px-4.5">
          토론이 시작됩니다! 🔥
        </div>
      )}
    </div>
  );
}

function WaitingSeat({
  label,
  seat,
  color,
}: {
  label: string;
  seat: { name: string; sticker: string; stance: string } | null;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-2xl font-black" style={{ color }}>
        {label}
      </div>
      {seat ? (
        <>
          <div className="relative rounded-2xl px-[22px] py-3.5 text-[15px] font-bold bg-[var(--bg-hero)]">
            {seat.stance}
          </div>
          <Image
            src={`/assets/stickers/${seat.sticker}.png`}
            alt={seat.name}
            width={140}
            height={140}
            className="w-[140px] h-[140px] object-contain bg-[var(--bg-card)] border border-[var(--border-1)] rounded-full"
          />
          <div className="text-xl font-black">{seat.name}</div>
          <div className="flex items-center gap-2 text-[15px] font-bold text-[#B08A00]">
            <span className="w-[9px] h-[9px] rounded-full bg-[var(--brand-yellow)]" />
            대기 중
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="w-[140px] h-[140px] rounded-full border border-dashed border-[var(--border-1)] flex items-center justify-center text-[13px] text-[var(--text-3)] text-center px-4">
            참가자를
            <br />
            기다리는 중
          </div>
        </div>
      )}
    </div>
  );
}
