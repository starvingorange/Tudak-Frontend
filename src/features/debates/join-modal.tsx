"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { getStickerSrc } from "@/features/shared/sticker-src";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { DebateRoom } from "./data";

interface JoinModalProps {
  room: DebateRoom;
  onClose: () => void;
}

type Side = "pro" | "con";

export function JoinModal({ room, onClose }: JoinModalProps) {
  const proTaken = room.pro !== null;
  const conTaken = room.con !== null;
  const [picked, setPicked] = useState<Side>(proTaken ? "con" : "pro");

  const host = proTaken ? room.pro : room.con;
  const canConfirm =
    (picked === "pro" && !proTaken) || (picked === "con" && !conTaken);

  const seatOption = (side: Side, taken: boolean, stanceLabel: string) => {
    const active = picked === side;
    const color = side === "pro" ? "var(--vote-blue)" : "var(--vote-red)";
    const tint = side === "pro" ? "bg-[#eef1fd]" : "bg-[#fdecec]";
    return (
      <button
        key={side}
        type="button"
        disabled={taken}
        onClick={() => !taken && setPicked(side)}
        className={cn(
          "flex w-full flex-col items-start gap-2.5 rounded-xl p-4 font-sans box-border text-left sm:flex-row sm:items-center sm:gap-3 sm:p-[15px_16px]",
          taken
            ? "border border-(--border-1) bg-(--bg-page) opacity-75 cursor-default"
            : cn("cursor-pointer bg-(--bg-card)", active ? tint : ""),
        )}
        style={
          !taken
            ? { border: active ? `2px solid ${color}` : undefined }
            : undefined
        }
      >
        <span
          className="text-white text-xs font-bold px-3 py-1 rounded-(--radius-pill) shrink-0"
          style={{ background: color }}
        >
          {side === "pro" ? "찬성" : "반대"}
        </span>
        {/* The tint above is a fixed light pastel in both themes, so the active
            state needs fixed dark text instead of the theme's --text-1. */}
        <span
          className={cn(
            "w-full text-left text-sm leading-relaxed font-bold sm:flex-1 sm:text-[15px]",
            !active && "text-(--text-1)",
          )}
          style={active ? { color: "#1a1a1a" } : undefined}
        >
          {stanceLabel}
        </span>
        {taken && host && (
          <span className="inline-flex items-center gap-1.75 text-[12px] font-bold text-[#909090] sm:text-[12.5px]">
            <Image
              src={getStickerSrc(host.sticker)}
              alt="방장"
              width={26}
              height={26}
              className="h-6.5 w-auto"
            />
            {host.name} (방장)
          </span>
        )}
        {!taken && (
          <span className="text-[12px] font-bold text-(--cat-sports) sm:text-[12.5px]">
            선택 가능
          </span>
        )}
      </button>
    );
  };

  return (
    // Click-outside-to-close backdrop (only closes when the click target is the
    // backdrop itself, not a bubbled click from the panel); Escape also closes it.
    // biome-ignore lint/a11y/noStaticElementInteractions: role="presentation" backdrop with click-outside-to-close is a standard modal pattern; every real control inside the dialog is a proper button.
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-3 py-4 sm:px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[calc(100vh-2rem)] w-full max-w-[92vw] overflow-y-auto rounded-2xl bg-(--bg-card) p-5 box-border sm:w-120 sm:p-[28px_30px]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[13px] font-bold text-[#909090]">
              토론 참여
            </div>
            <div className="mt-1.5 text-lg leading-snug font-extrabold tracking-[-0.3px] sm:text-xl">
              {room.title}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="border-none bg-transparent cursor-pointer text-[#909090] p-1 leading-none hover:text-(--text-1)"
          >
            ✕
          </button>
        </div>
        <div className="mt-5 flex flex-col gap-2.5 sm:mt-5.5">
          {seatOption("pro", proTaken, room.proStance)}
          {seatOption("con", conTaken, room.conStance)}
        </div>
        <div className="mt-3 text-[12px] leading-relaxed text-[#909090] sm:text-[12.5px]">
          방장이 선택한 입장은 변경할 수 없어요. 남은 입장으로 참여합니다.
        </div>
        <div className="mt-5 flex flex-col gap-2.5 sm:mt-5.5 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-(--radius-button) border border-(--border-1) bg-(--bg-card) py-3.25 text-sm font-bold text-(--text-1) cursor-pointer hover:border-[#c9c5bd]"
          >
            취소
          </button>
          <Link
            href={
              canConfirm
                ? ROUTES.DEBATE_WAITING(
                    room.id,
                    picked === "pro" ? "AGREE" : "DISAGREE",
                  )
                : "#"
            }
            aria-disabled={!canConfirm}
            className={cn(
              "inline-flex flex-1 items-center justify-center rounded-(--radius-button) py-3.25 text-sm font-extrabold no-underline sm:flex-[1.4]",
              canConfirm
                ? "bg-(--brand-yellow) text-(--brand-on-yellow) pointer-events-auto hover:brightness-105"
                : "bg-[#efedea] text-[#a3a09a] pointer-events-none",
            )}
          >
            {canConfirm
              ? picked === "pro"
                ? "찬성으로 참여하기"
                : "반대로 참여하기"
              : "입장을 선택하세요"}
          </Link>
        </div>
      </div>
    </div>
  );
}
