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
    <div className="max-w-[960px] mx-auto px-4 py-8 min-h-[calc(100dvh-var(--nav-height))] flex flex-col justify-between gap-6">
      <div className="flex flex-col justify-between gap-5">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-extrabold text-[var(--brand-yellow)] tracking-wide">
            토론 대기방
          </span>
          <h1 className="text-center text-4xl font-black tracking-[-0.5px] m-0">
            {room.topic}
          </h1>
        </div>

        <div className="bg-[var(--bg-hero)] rounded-2xl p-6 flex flex-col gap-3.5">
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

        <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-6">
          <WaitingSeat
            label="찬성"
            stance={room.proStance}
            seat={room.pro}
            color="var(--vote-blue)"
          />
          <div className="text-[34px] font-black text-[var(--text-3)] self-center px-2">
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
          className="h-14 rounded-2xl border-none bg-[var(--brand-yellow)] text-[var(--brand-on-yellow)] text-base font-black font-sans flex items-center justify-center gap-2.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 hover:brightness-[0.96]"
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
      className="flex flex-col items-center justify-center gap-3 bg-[var(--bg-card)] border-2 rounded-2xl px-5 py-6"
      style={{ borderColor: seat ? color : "var(--border-1)" }}
    >
      <div
        className="text-sm font-extrabold px-3.5 py-1 rounded-full text-white"
        style={{ background: seat ? color : "var(--text-3)" }}
      >
        {label}
      </div>
      <div className="relative rounded-2xl px-[22px] py-3.5 text-[15px] font-bold bg-[var(--bg-hero)] text-center">
        {stance}
      </div>
      {seat ? (
        <>
          <Image
            src={`/assets/stickers/${seat.sticker}.png`}
            alt={seat.name}
            width={120}
            height={120}
            className="w-[120px] h-[120px] object-contain bg-[var(--bg-hero)] border border-[var(--border-1)] rounded-full"
          />
          <div className="text-xl font-black">{seat.name}</div>
          <div className="flex items-center gap-2 text-[15px] font-bold text-[#B08A00]">
            <span className="w-[9px] h-[9px] rounded-full bg-[var(--brand-yellow)]" />
            대기 중
          </div>
        </>
      ) : (
        <div className="w-[120px] h-[120px] rounded-full border border-dashed border-[var(--border-1)] flex items-center justify-center text-[13px] text-[var(--text-3)] text-center px-4">
          참가자를
          <br />
          기다리는 중
        </div>
      )}
    </div>
  );
}
