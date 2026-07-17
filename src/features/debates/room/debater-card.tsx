import Image from "next/image";
import type { DebaterState } from "./data";

interface DebaterCardProps {
  side: "pro" | "con";
  debater: DebaterState | null;
}

export function DebaterCard({ side, debater }: DebaterCardProps) {
  const isPro = side === "pro";
  const color = isPro ? "var(--vote-blue)" : "var(--vote-red)";
  const label = isPro ? "찬성" : "반대";

  if (!debater) {
    return (
      <section
        className="relative bg-[var(--bg-card)] border rounded-2xl p-6 flex items-center justify-center min-h-[190px]"
        style={{ borderColor: color }}
      >
        <span
          className="absolute -top-px text-white text-sm font-extrabold px-[18px] py-2 rounded-b-[10px]"
          style={{ background: color, [isPro ? "left" : "right"]: "20px" }}
        >
          {label}
        </span>
        <span className="text-[15px] font-semibold text-[var(--text-2)]">
          상대를 기다리는 중…
        </span>
      </section>
    );
  }

  const image = (
    <Image
      src={`/assets/${side}-${debater.speaking ? "speaking" : "confident"}.png`}
      alt={`${debater.name} 캐릭터`}
      width={190}
      height={190}
      className="w-[clamp(120px,14vw,190px)] h-auto mt-[26px]"
    />
  );

  const content = (
    <div className="flex-1 min-w-0">
      <div
        className={`flex items-center gap-2.5 ${isPro ? "" : "justify-end"}`}
      >
        {!isPro && (
          <span
            className="border text-[12px] font-bold px-[11px] py-1 rounded-[var(--radius-pill)] whitespace-nowrap"
            style={{ borderColor: "#d8d5cf", color: "var(--text-2)" }}
          >
            {debater.speaking ? "발언 중" : "대기 중"}
          </span>
        )}
        <span className="text-[19px] font-extrabold whitespace-nowrap">
          {debater.name}
        </span>
        {isPro && (
          <span
            className="text-white text-xs font-bold px-[11px] py-1 rounded-[var(--radius-pill)] whitespace-nowrap"
            style={{ background: color }}
          >
            {debater.speaking ? "발언 중" : "대기 중"}
          </span>
        )}
      </div>
      <div className="mt-3 bg-[var(--bg-hero)] rounded-xl p-[14px_16px] text-[15px] leading-relaxed whitespace-pre-line">
        {debater.statement}
      </div>
      <div className="mt-3.5 text-[13px] text-[var(--text-2)]">남은 시간</div>
      <div
        className="text-[34px] font-extrabold tracking-wide leading-tight"
        style={{ color }}
      >
        {debater.remainingLabel}
      </div>
      <div className="mt-2.5 h-1.5 rounded-full bg-[var(--poll-track)] overflow-hidden">
        <span
          className="block h-full rounded-full"
          style={{ width: `${debater.remainingPercent}%`, background: color }}
        />
      </div>
    </div>
  );

  return (
    <section
      className="relative bg-[var(--bg-card)] border rounded-2xl p-6 flex gap-[22px] items-center"
      style={{ borderColor: color }}
    >
      <span
        className="absolute -top-px text-white text-sm font-extrabold px-[18px] py-2 rounded-b-[10px]"
        style={{ background: color, [isPro ? "left" : "right"]: "20px" }}
      >
        {label}
      </span>
      {isPro ? (
        <>
          {image}
          {content}
        </>
      ) : (
        <>
          {content}
          {image}
        </>
      )}
    </section>
  );
}
