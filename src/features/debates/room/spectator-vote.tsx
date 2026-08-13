"use client";

import { SquareCheckBig } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SpectatorVoteProps {
  proName: string;
  proTagline: string;
  conName: string;
  conTagline: string;
  deadlineLabel?: string;
}

type Vote = "pro" | "con" | null;

export function SpectatorVote({
  proName,
  proTagline,
  conName,
  conTagline,
  deadlineLabel = "D-3",
}: SpectatorVoteProps) {
  const [myVote, setMyVote] = useState<Vote>(null);

  const optionClass = (side: "pro" | "con") => {
    const active = myVote === side;
    const color = side === "pro" ? "var(--vote-blue)" : "var(--vote-red)";
    return {
      className: cn(
        "flex items-center gap-4 text-left p-[16px_18px] rounded-xl cursor-pointer font-sans transition-all",
        active ? "" : "bg-[var(--bg-card)]",
        myVote && !active ? "opacity-55" : "opacity-100",
      ),
      style: {
        background: active
          ? side === "pro"
            ? "#eef1fd"
            : "#fdecec"
          : undefined,
        border: active ? `2px solid ${color}` : "1px solid var(--border-1)",
      },
    };
  };

  return (
    <section className="mx-auto mt-6 box-border max-w-180 rounded-2xl border border-(--border-1) bg-(--bg-card) p-4 sm:p-[26px_28px]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2.5">
        <SquareCheckBig size={18} />
        <span className="flex-1 text-lg font-extrabold">
          어느 입장에 공감하시나요?
        </span>
        <span className="text-[13px] text-[#909090]">
          투표 마감 {deadlineLabel}
        </span>
      </div>
      <div className="mt-2 text-[13.5px] text-(--text-2)">
        토론 종료 후 3일간 투표할 수 있어요. 마감 전까지 언제든 바꿀 수
        있습니다.
      </div>

      <div className="mt-4.5 grid gap-3.5 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMyVote("pro")}
          {...optionClass("pro")}
        >
          <Image
            src="/assets/stickers/st-pro-basic.png"
            alt="찬성"
            width={190}
            height={165}
            style={{ width: "auto" }}
            className="h-14 sm:h-16"
          />
          <span className="flex flex-col items-start gap-1">
            <span className="text-[15px] font-extrabold text-(--vote-blue) sm:text-base">
              찬성 · {proName}
            </span>
            <span
              className={cn(
                "text-[13px]",
                myVote !== "pro" && "text-(--text-2)",
              )}
              style={myVote === "pro" ? { color: "#6f6f6f" } : undefined}
            >
              {proTagline}
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMyVote("con")}
          {...optionClass("con")}
        >
          <Image
            src="/assets/stickers/st-con-basic.png"
            alt="반대"
            width={200}
            height={158}
            style={{ width: "auto" }}
            className="h-14 sm:h-16"
          />
          <span className="flex flex-col items-start gap-1">
            <span className="text-[15px] font-extrabold text-(--vote-red) sm:text-base">
              반대 · {conName}
            </span>
            <span
              className={cn(
                "text-[13px]",
                myVote !== "con" && "text-(--text-2)",
              )}
              style={myVote === "con" ? { color: "#6f6f6f" } : undefined}
            >
              {conTagline}
            </span>
          </span>
        </button>
      </div>

      {myVote && (
        <div className="mt-5 flex flex-col items-start gap-2 text-left sm:items-center sm:justify-center sm:gap-3.5 sm:text-center">
          <span
            className="text-sm font-extrabold"
            style={{
              color: myVote === "pro" ? "var(--vote-blue)" : "var(--vote-red)",
            }}
          >
            {myVote === "pro"
              ? `찬성(${proName})에 투표했어요!`
              : `반대(${conName})에 투표했어요!`}
          </span>
          <span className="text-[12.5px] text-[#909090]">
            결과는 투표 종료 후 공개돼요 · 다른 입장을 누르면 재투표할 수 있어요
          </span>
        </div>
      )}
    </section>
  );
}
