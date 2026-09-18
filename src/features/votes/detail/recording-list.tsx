"use client";

import { Pause, Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ArgumentDetailsArgumentType } from "@/api/poll/types/ArgumentDetailsArgumentType";
import { cn } from "@/lib/utils";
import type { PollRecording } from "./data";

const PHASE_LABEL: Record<ArgumentDetailsArgumentType, string> = {
  OPENING: "입론",
  REBUTTAL: "반론",
  CONCLUSION: "최종결론",
};

interface RecordingListProps {
  recordings: PollRecording[];
  proName: string;
  conName: string;
}

export function RecordingList({
  recordings,
  proName,
  conName,
}: RecordingListProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const playAllRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeUrl =
    activeIndex != null ? recordings[activeIndex]?.audioUrl : undefined;
  const playingAll = playAllRef.current && activeIndex != null;

  // activeIndex가 바뀌면(다른 녹음 선택 / 전체재생 다음 트랙) 자동 재생하고,
  // 그 행을 고정 높이 박스 안에서 보이도록 스크롤한다.
  useEffect(() => {
    if (activeIndex == null) return;
    audioRef.current?.play().catch(() => setIsPlaying(false));
    rowRefs.current[activeIndex]?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [activeIndex]);

  const stop = () => {
    playAllRef.current = false;
    audioRef.current?.pause();
    setActiveIndex(null);
    setIsPlaying(false);
  };

  const playFrom = (index: number, all: boolean) => {
    playAllRef.current = all;
    if (index === activeIndex) {
      // 같은 트랙 다시 누름 — 재생/일시정지 토글
      if (isPlaying) audioRef.current?.pause();
      else audioRef.current?.play().catch(() => setIsPlaying(false));
      return;
    }
    setActiveIndex(index);
  };

  const handleEnded = () => {
    if (
      playAllRef.current &&
      activeIndex != null &&
      activeIndex < recordings.length - 1
    ) {
      setActiveIndex(activeIndex + 1);
    } else {
      stop();
    }
  };

  return (
    <section className="mt-6 flex flex-col gap-4 rounded-2xl border border-(--border-1) bg-(--bg-card) p-4 sm:p-[26px_28px]">
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-extrabold">토론 다시 듣기</span>
        <button
          type="button"
          onClick={() => (playingAll ? stop() : playFrom(0, true))}
          className="inline-flex items-center gap-1.5 rounded-full bg-(--brand-yellow) px-4 py-2 text-[13px] font-extrabold text-(--brand-on-yellow) hover:brightness-[0.96]"
        >
          {playingAll ? <Pause size={14} /> : <Play size={14} />}
          {playingAll ? "정지" : "전체 재생"}
        </button>
      </div>

      <div className="flex max-h-[20rem] flex-col gap-5 overflow-y-auto pr-1 sm:max-h-[24rem] sm:gap-6.5">
        {recordings.map((rec, i) => (
          <div
            key={`${rec.side}-${rec.phase}`}
            ref={(node) => {
              rowRefs.current[i] = node;
            }}
          >
            <RecordingRow
              rec={rec}
              name={rec.side === "pro" ? proName : conName}
              active={activeIndex === i}
              playing={activeIndex === i && isPlaying}
              dimmed={activeIndex != null && activeIndex !== i}
              onToggle={() => playFrom(i, playAllRef.current)}
            />
          </div>
        ))}
      </div>

      {/* biome-ignore lint/a11y/useMediaCaption: user-recorded debate audio, no caption track exists */}
      <audio
        ref={audioRef}
        src={activeUrl}
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleEnded}
        className="hidden"
      />
    </section>
  );
}

interface RecordingRowProps {
  rec: PollRecording;
  name: string;
  active: boolean;
  playing: boolean;
  dimmed: boolean;
  onToggle: () => void;
}

function RecordingRow({
  rec,
  name,
  active,
  playing,
  dimmed,
  onToggle,
}: RecordingRowProps) {
  const isPro = rec.side === "pro";
  const color = isPro ? "var(--vote-blue)" : "var(--vote-red)";
  const tint = isPro ? "#eef1fd" : "#fdecec";

  const avatar = (
    <Image
      src={
        isPro
          ? "/assets-characters/pro-conf.webp"
          : "/assets-characters/con-conf.webp"
      }
      alt={name}
      width={52}
      height={52}
      className="h-10 w-10 shrink-0 rounded-full border border-(--border-1) bg-(--bg-hero) sm:h-13 sm:w-13"
    />
  );

  return (
    <div
      className={cn(
        "flex max-w-[92%] items-start gap-2.5 transition-opacity sm:max-w-[72%] lg:max-w-[56%]",
        !isPro && "ml-auto justify-end",
        dimmed && "opacity-50",
      )}
    >
      {isPro && avatar}
      <div className={cn("flex min-w-0 flex-col gap-2", !isPro && "items-end")}>
        <div
          className={cn(
            "flex flex-wrap items-center gap-2",
            !isPro && "justify-start sm:justify-end",
          )}
        >
          <span className="text-sm font-extrabold sm:text-[15px]">{name}</span>
          <span
            className="rounded-(--radius-pill) px-2.25 py-0.75 text-[11px] font-bold text-white"
            style={{ background: color }}
          >
            {isPro ? "찬성" : "반대"}
          </span>
          <span className="text-[12px] text-[#909090] sm:text-[12.5px]">
            {PHASE_LABEL[rec.phase]}
          </span>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-[13px] font-bold transition-all",
            active ? "border-transparent scale-[1.03]" : "border-(--border-1)",
          )}
          style={
            active
              ? { background: tint, color, boxShadow: `0 0 0 2px ${color}` }
              : { color, background: "var(--bg-card)" }
          }
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
          {playing ? "재생 중" : active ? "이어 듣기" : "음성 다시 듣기"}
        </button>
      </div>
      {!isPro && avatar}
    </div>
  );
}
