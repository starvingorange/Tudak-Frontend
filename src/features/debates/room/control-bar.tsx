"use client";

import { Mic } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
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
    <div className="sticky bottom-0 z-20 bg-[var(--bg-surface)] border-t border-[var(--border-1)]">
      <div className="max-w-[1180px] mx-auto p-[14px_16px] flex items-center justify-center gap-7 relative">
        <button
          type="button"
          title="이모티콘"
          onClick={() => setPickerOpen((v) => !v)}
          className={cn(
            "w-12 h-12 rounded-full inline-flex items-center justify-center cursor-pointer hover:bg-[var(--bg-hero)]",
            pickerOpen
              ? "border-[1.5px] border-[var(--brand-yellow)] bg-[#fff8e8]"
              : "border border-[var(--border-1)] bg-[var(--bg-card)]",
          )}
        >
          <Image
            src="/assets/stickers/st-pro-happy.png"
            alt="이모티콘"
            width={175}
            height={172}
            style={{ width: "auto" }}
            className="h-[30px]"
          />
        </button>

        {pickerOpen && <EmojiPicker onSend={react} />}

        <button
          type="button"
          disabled={!myTurn}
          onMouseDown={() => myTurn && setTalking(true)}
          onMouseUp={() => setTalking(false)}
          onMouseLeave={() => setTalking(false)}
          className={cn(
            "inline-flex items-center gap-2.5 text-base font-extrabold px-[34px] py-3.5 rounded-full border-none transition-transform",
            !myTurn
              ? "bg-[#efedea] text-[#a3a09a] cursor-not-allowed"
              : isTalking
                ? "bg-[#e93a3a] text-white cursor-pointer scale-105"
                : "bg-[var(--brand-yellow)] text-[var(--brand-on-yellow)] cursor-pointer",
          )}
        >
          <Mic size={18} />
          {!myTurn
            ? "상대 발언 중"
            : isTalking
              ? "말하는 중…"
              : "누르고 말하기"}
        </button>

        <div className="w-[220px] text-[13px] text-[#909090]">
          {!myTurn
            ? "내 차례가 되면 버튼이 활성화돼요. 이모티콘으로 의사를 표현해 보세요!"
            : "버튼을 누르고 있는 동안 발언이 전달돼요."}
        </div>

        {reactions.map((r) => (
          <span
            key={r.id}
            className="absolute bottom-[76px] w-[88px] h-[88px] pointer-events-none [animation:tdk-react-pop_1.6s_ease-out_forwards]"
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
