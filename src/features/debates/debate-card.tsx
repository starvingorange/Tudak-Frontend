import Image from "next/image";
import Link from "next/link";
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
          className="w-[72px] h-[72px] rounded-full bg-[var(--bg-card)] border-2 border-dashed inline-flex items-center justify-center text-[26px] font-extrabold box-border"
          style={{ borderColor: "#d8d5cf", color: "#c2beb6" }}
        >
          ?
        </span>
        <span
          className="border text-[11px] font-bold px-[11px] py-[3px] rounded-[var(--radius-pill)]"
          style={{ borderColor: "#d8d5cf", color: "#909090" }}
        >
          {label}
        </span>
        <span className="text-[13.5px] font-bold text-[#909090]">공석</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <span
        className="relative w-[72px] h-[72px] rounded-full border-2 inline-flex items-center justify-center overflow-hidden"
        style={{ background: tint, borderColor: color }}
      >
        <Image
          src={`/assets/stickers/${seat.sticker}.png`}
          alt={label}
          fill
          sizes="72px"
          className="object-contain p-2"
        />
      </span>
      <span
        className="text-white text-[11px] font-bold px-[11px] py-[3px] rounded-[var(--radius-pill)]"
        style={{ background: color }}
      >
        {label}
      </span>
      <span className="text-[13.5px] font-extrabold" style={{ color }}>
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
    <div className="border border-[var(--border-1)] rounded-[var(--radius-card)] px-[22px] py-5 flex flex-col hover:border-[var(--brand-yellow)]">
      <CategoryBadge category={room.category} />
      <div className="text-lg font-extrabold leading-snug tracking-[-0.3px] mt-3.5 min-h-[50px]">
        {room.title}
      </div>
      <div className="grid grid-cols-[1fr_34px_1fr] items-center mt-4">
        <Seat side="pro" seat={room.pro} />
        <span className="text-center text-sm font-extrabold text-[#909090]">
          VS
        </span>
        <Seat side="con" seat={room.con} />
      </div>
      <div className="flex-1" />
      <div className="flex justify-end mt-[18px] pt-4 border-t border-[var(--border-1)]">
        {isFull ? (
          <Link
            href={`/debates/${room.id}`}
            className="inline-flex items-center gap-[7px] text-[13px] font-extrabold px-5 py-[9px] rounded-lg text-[var(--text-1)] border border-[var(--border-1)] hover:border-[var(--brand-yellow)]"
          >
            관전하기
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => onJoin(room)}
            className="inline-flex items-center gap-[7px] text-[13px] font-extrabold px-5 py-[9px] rounded-lg bg-[var(--brand-yellow)] text-[var(--brand-on-yellow)] cursor-pointer"
          >
            참여하기
          </button>
        )}
      </div>
    </div>
  );
}
