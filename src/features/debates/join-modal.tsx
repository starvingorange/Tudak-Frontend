"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
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
          "flex items-center gap-3 p-[15px_16px] rounded-xl font-sans w-full box-border text-left",
          taken
            ? "border border-[var(--border-1)] bg-[var(--bg-page)] opacity-75 cursor-default"
            : cn("cursor-pointer bg-[var(--bg-card)]", active ? tint : ""),
        )}
        style={
          !taken
            ? { border: active ? `2px solid ${color}` : undefined }
            : undefined
        }
      >
        <span
          className="text-white text-xs font-bold px-3 py-1 rounded-[var(--radius-pill)] shrink-0"
          style={{ background: color }}
        >
          {side === "pro" ? "찬성" : "반대"}
        </span>
        {/* The tint above is a fixed light pastel in both themes, so the active
            state needs fixed dark text instead of the theme's --text-1. */}
        <span
          className={cn(
            "flex-1 text-left text-[15px] font-bold",
            !active && "text-[var(--text-1)]",
          )}
          style={active ? { color: "#1a1a1a" } : undefined}
        >
          {stanceLabel}
        </span>
        {taken && host && (
          <span className="inline-flex items-center gap-[7px] text-[12.5px] font-bold text-[#909090]">
            <Image
              src={`/assets/stickers/${host.sticker}.png`}
              alt="방장"
              width={26}
              height={26}
              className="h-[26px] w-auto"
            />
            {host.name} (방장)
          </span>
        )}
        {!taken && (
          <span className="text-[12.5px] font-bold text-[var(--cat-sports)]">
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
      className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="bg-[var(--bg-card)] rounded-2xl w-[480px] max-w-[92vw] p-[28px_30px] box-border"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[13px] font-bold text-[#909090]">
              토론 참여
            </div>
            <div className="text-xl font-extrabold tracking-[-0.3px] mt-1.5 leading-snug">
              {room.title}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="border-none bg-transparent cursor-pointer text-[#909090] p-1 leading-none hover:text-[var(--text-1)]"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-col gap-2.5 mt-[22px]">
          {seatOption("pro", proTaken, room.proStance)}
          {seatOption("con", conTaken, room.conStance)}
        </div>
        <div className="mt-3 text-[12.5px] text-[#909090]">
          방장이 선택한 입장은 변경할 수 없어요. 남은 입장으로 참여합니다.
        </div>
        <div className="flex gap-2.5 mt-[22px]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-[var(--border-1)] bg-[var(--bg-card)] text-[var(--text-1)] text-sm font-bold py-[13px] rounded-[var(--radius-button)] cursor-pointer hover:border-[#c9c5bd]"
          >
            취소
          </button>
          <Link
            href={canConfirm ? `/debates/${room.id}/waiting` : "#"}
            aria-disabled={!canConfirm}
            className={cn(
              "flex-[1.4] inline-flex items-center justify-center text-sm font-extrabold py-[13px] rounded-[var(--radius-button)] no-underline",
              canConfirm
                ? "bg-[var(--brand-yellow)] text-[var(--brand-on-yellow)] pointer-events-auto"
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
