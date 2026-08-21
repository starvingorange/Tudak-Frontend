import Image from "next/image";
import type { DebaterState } from "./data";

// Intrinsic dimensions of each pose image, so the responsive clamp()-sized
// render doesn't distort — see public/assets-characters/{file}.webp below.
const POSE = {
  "pro-confident": { file: "pro-conf", width: 416, height: 461 },
  "pro-speaking": { file: "pro-speak", width: 472, height: 491 },
  "con-confident": { file: "con-conf", width: 339, height: 370 },
  "con-speaking": { file: "con-speak", width: 407, height: 352 },
} as const;

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
        className="relative flex min-h-42.5 items-center justify-center rounded-2xl border bg-(--bg-card) p-5 sm:min-h-47.5 sm:p-6"
        style={{ borderColor: color }}
      >
        <span
          className="absolute -top-px text-white text-sm font-extrabold px-4.5 py-2 rounded-b-[10px]"
          style={{ background: color, [isPro ? "left" : "right"]: "20px" }}
        >
          {label}
        </span>
        <span className="text-[15px] font-semibold text-(--text-2)">
          상대를 기다리는 중…
        </span>
      </section>
    );
  }

  const pose =
    `${side}-${debater.speaking ? "speaking" : "confident"}` as const;
  const image = (
    <Image
      src={`/assets-characters/${POSE[pose].file}.webp`}
      alt={`${debater.name} 캐릭터`}
      width={POSE[pose].width}
      height={POSE[pose].height}
      priority
      style={{ height: "auto" }}
      className="mt-2 w-[clamp(104px,26vw,190px)] sm:mt-6.5 sm:w-[clamp(120px,14vw,190px)]"
    />
  );

  const content = (
    <div className="min-w-0 flex-1">
      <div
        className={`flex flex-wrap items-center gap-2 ${isPro ? "" : "justify-start sm:justify-end"}`}
      >
        {!isPro && (
          <span
            className="border text-[12px] font-bold px-2.75 py-1 rounded-(--radius-pill) whitespace-nowrap"
            style={{ borderColor: "#d8d5cf", color: "var(--text-2)" }}
          >
            {debater.speaking ? "발언 중" : "대기 중"}
          </span>
        )}
        <span className="text-[17px] font-extrabold sm:text-[19px]">
          {debater.name}
        </span>
        {isPro && (
          <span
            className="text-white text-xs font-bold px-2.75 py-1 rounded-(--radius-pill) whitespace-nowrap"
            style={{ background: color }}
          >
            {debater.speaking ? "발언 중" : "대기 중"}
          </span>
        )}
      </div>
      <div className="mt-3 rounded-xl bg-(--bg-hero) p-[14px_16px] text-[14px] leading-relaxed whitespace-pre-line sm:text-[15px]">
        {debater.statement}
      </div>
      <div className="mt-3.5 text-[13px] text-(--text-2)">남은 시간</div>
      <div
        className="text-[30px] leading-tight font-extrabold tracking-wide sm:text-[34px]"
        style={{ color }}
      >
        {debater.remainingLabel}
      </div>
      <div className="mt-2.5 h-1.5 rounded-full bg-(--poll-track) overflow-hidden">
        <span
          className="block h-full rounded-full"
          style={{ width: `${debater.remainingPercent}%`, background: color }}
        />
      </div>
    </div>
  );

  return (
    <section
      className="relative flex flex-col items-center gap-4 rounded-2xl border bg-(--bg-card) p-5 text-left sm:gap-5.5 sm:p-6 md:flex-row"
      style={{ borderColor: color }}
    >
      <span
        className="absolute -top-px text-white text-sm font-extrabold px-4.5 py-2 rounded-b-[10px]"
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
          {image}
          {content}
        </>
      )}
    </section>
  );
}
