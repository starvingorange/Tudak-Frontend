import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/ui/category-badge";
import type { DebateRoom, DebateSeat } from "./data";

function Seat({
  side,
  seat,
}: {
  side: "pro" | "con";
  seat: DebateSeat | null;
}) {
  const label = side === "pro" ? "찬성" : "반대";
  const color = side === "pro" ? "var(--vote-blue)" : "var(--vote-red)";
  const tint = side === "pro" ? "#eef1fd" : "#fdecec";

  if (!seat) {
    return (
      <div className="flex flex-col items-center gap-2">
        <span
          className="inline-flex h-15 w-15 items-center justify-center rounded-full border-2 border-dashed bg-(--bg-card) text-2xl font-extrabold box-border sm:h-18 sm:w-18 sm:text-[26px]"
          style={{ borderColor: "#d8d5cf", color: "#c2beb6" }}
        >
          ?
        </span>
        <span
          className="rounded-(--radius-pill) border px-2.5 py-0.75 text-[11px] font-bold sm:px-2.75"
          style={{ borderColor: "#d8d5cf", color: "#909090" }}
        >
          {label}
        </span>
        <span className="text-[13px] font-bold text-[#909090] sm:text-[13.5px]">
          공석
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <span
        className="relative inline-flex h-15 w-15 items-center justify-center overflow-hidden rounded-full border-2 sm:h-18 sm:w-18"
        style={{ background: tint, borderColor: color }}
      >
        <Image
          src={`/assets/stickers/${seat.sticker}.png`}
          alt={label}
          fill
          sizes="(max-width: 639px) 60px, 72px"
          className="object-contain p-2"
        />
      </span>
      <span
        className="rounded-(--radius-pill) px-2.5 py-0.75 text-[11px] font-bold text-white sm:px-2.75"
        style={{ background: color }}
      >
        {label}
      </span>
      <span
        className="max-w-full truncate text-[13px] font-extrabold sm:text-[13.5px]"
        style={{ color }}
      >
        {seat.name}
      </span>
    </div>
  );
}

interface DebateCardProps {
  room: DebateRoom;
  onJoin: (room: DebateRoom) => void;
}

export function DebateCard({ room, onJoin }: DebateCardProps) {
  const isFull = room.pro !== null && room.con !== null;

  return (
    <div className="flex flex-col rounded-(--radius-card) border border-(--border-1) px-3.5 py-3.5 hover:border-(--brand-yellow) sm:px-5.5 sm:py-5">
      <CategoryBadge
        category={room.category}
        className="self-start px-2.5 py-1 text-[11px] sm:px-3 sm:py-1.25 sm:text-xs"
      />
      <div className="mt-2.5 text-[16px] font-extrabold leading-snug tracking-[-0.3px] sm:mt-3.5 sm:min-h-12.5 sm:text-lg">
        {room.title}
      </div>
      <div className="mt-3.5 grid grid-cols-[1fr_20px_1fr] items-center sm:mt-4 sm:grid-cols-[1fr_34px_1fr]">
        <Seat side="pro" seat={room.pro} />
        <span className="text-center text-[12px] font-extrabold text-[#909090] sm:text-sm">
          VS
        </span>
        <Seat side="con" seat={room.con} />
      </div>
      <div className="flex-1" />
      <div className="mt-3.5 flex justify-stretch border-t border-(--border-1) pt-3.5 sm:mt-4.5 sm:justify-end sm:pt-4">
        {isFull ? (
          <Link
            href={`/debates/${room.id}`}
            className="inline-flex w-full items-center justify-center gap-1.75 rounded-lg border border-(--border-1) px-5 py-2.25 text-[13px] font-extrabold text-(--text-1) hover:border-(--brand-yellow) sm:w-auto"
          >
            관전하기
          </Link>
        ) : (
          <Button
            size="sm"
            className="w-full justify-center sm:w-auto"
            onClick={() => onJoin(room)}
          >
            참여하기
          </Button>
        )}
      </div>
    </div>
  );
}
