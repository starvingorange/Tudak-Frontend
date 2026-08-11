"use client";

import { Mic } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useDismissableOpen } from "@/lib/use-dismissable-open";
import { cn } from "@/lib/utils";
import { EmojiPicker } from "./emoji-picker";

interface Reaction {
  id: number;
  sticker: string;
  left: string;
}

export function ControlBar({ myTurn }: { myTurn: boolean }) {
  const [talking, setTalking] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const pickerRef = useDismissableOpen<HTMLDivElement>(
    pickerOpen,
    setPickerOpen,
  );

  const react = (sticker: string) => {
    const id = Date.now() + Math.random();
    const left = `${44 + Math.random() * 12}%`;
    setReactions((prev) => [...prev, { id, sticker, left }]);
    setPickerOpen(false);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, 1600);
  };

  const isTalking = talking && myTurn;

  return (
    <div className="sticky bottom-0 z-20 bg-(--bg-surface) border-t border-(--border-1)">
      <div className="relative mx-auto flex max-w-295 flex-col items-center gap-3 p-[14px_16px] sm:flex-row sm:justify-center sm:gap-7">
        <div ref={pickerRef} className="relative self-start sm:self-auto">
          <button
            type="button"
            title="이모티콘"
            onClick={() => setPickerOpen((v) => !v)}
            className={cn(
              "inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-full hover:bg-(--bg-hero)",
              pickerOpen
                ? "border-[1.5px] border-(--brand-yellow) bg-[#fff8e8]"
                : "border border-(--border-1) bg-(--bg-card)",
            )}
          >
            <Image
              src="/assets/stickers/st-pro-happy.png"
              alt="이모티콘"
              width={175}
              height={172}
              style={{ width: "auto" }}
              className="h-7.5"
            />
          </button>

          {pickerOpen && <EmojiPicker onSend={react} />}
        </div>

        <button
          type="button"
          disabled={!myTurn}
          onMouseDown={() => myTurn && setTalking(true)}
          onMouseUp={() => setTalking(false)}
          onMouseLeave={() => setTalking(false)}
          onTouchStart={() => myTurn && setTalking(true)}
          onTouchEnd={() => setTalking(false)}
          className={cn(
            "inline-flex w-full items-center justify-center gap-2.5 rounded-full border-none px-6 py-3.5 text-base font-extrabold transition-transform sm:w-auto sm:px-8.5",
            !myTurn
              ? "bg-[#efedea] text-[#a3a09a] cursor-not-allowed"
              : isTalking
                ? "bg-[#e93a3a] text-white cursor-pointer scale-105"
                : "bg-(--brand-yellow) text-(--brand-on-yellow) cursor-pointer",
          )}
        >
          <Mic size={18} />
          {!myTurn
            ? "상대 발언 중"
            : isTalking
              ? "말하는 중…"
              : "누르고 말하기"}
        </button>

        <div className="w-full max-w-[320px] text-center text-[13px] text-[#909090] sm:w-55 sm:text-left">
          {!myTurn
            ? "내 차례가 되면 버튼이 활성화돼요. 이모티콘으로 의사를 표현해 보세요!"
            : "버튼을 누르고 있는 동안 발언이 전달돼요."}
        </div>

        {reactions.map((r) => (
          <span
            key={r.id}
            className="absolute bottom-19 w-22 h-22 pointer-events-none animate-[tdk-react-pop_1.6s_ease-out_forwards]"
            style={{ left: r.left }}
          >
            <Image
              src={`/assets/stickers/${r.sticker}.png`}
              alt="반응"
              fill
              sizes="88px"
              className="object-contain"
            />
          </span>
        ))}
      </div>
    </div>
  );
}
