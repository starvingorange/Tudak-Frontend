"use client";

import {
  ArrowRight,
  Home,
  Lightbulb,
  Pause,
  Play,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CategoryBadge } from "@/components/ui/category-badge";
import type { DebateResult } from "./data";

interface ResultViewProps {
  result: DebateResult;
}

export function ResultView({ result }: ResultViewProps) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(result.replayElapsedSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!playing) return;
    intervalRef.current = setInterval(() => {
      setElapsed((e) => {
        const next = Math.min(result.replayTotalSeconds, e + 1);
        if (next >= result.replayTotalSeconds) setPlaying(false);
        return next;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [playing, result.replayTotalSeconds]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  const percent = Math.round((elapsed / result.replayTotalSeconds) * 100);

  return (
    <div className="max-w-[960px] mx-auto px-4 pt-8 pb-14 flex flex-col gap-7">
      <div className="flex flex-col gap-3.5">
        <CategoryBadge category={result.category} className="w-fit" />
        <h1 className="text-[40px] font-black tracking-[-0.5px] m-0">
          {result.topic}
        </h1>
      </div>

      <div className="bg-[var(--bg-hero)] border border-[var(--border-1)] rounded-2xl p-6 flex items-center gap-5">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "일시정지" : "재생"}
          className="w-14 h-14 rounded-full bg-[var(--brand-yellow)] flex items-center justify-center shrink-0 cursor-pointer hover:brightness-[0.96]"
        >
          {playing ? (
            <Pause size={20} fill="var(--brand-on-yellow)" />
          ) : (
            <Play size={20} fill="var(--brand-on-yellow)" className="ml-0.5" />
          )}
        </button>
        <div className="flex flex-col gap-3 flex-1">
          <div className="text-base font-extrabold">
            전체 다시듣기 · {mm}:{ss}
          </div>
          <div className="h-2 rounded overflow-hidden bg-[var(--poll-track)]">
            <div
              className="h-full bg-[var(--brand-yellow)] rounded transition-[width] duration-1000 ease-linear"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="text-xl font-black">입장 요약</div>
        <div className="grid grid-cols-2 gap-5">
          {/* #fff6e8/#f1eefb are fixed light pastels in both themes, so their
              body copy needs fixed dark ink instead of the theme's --text-*. */}
          <div className="bg-[#fff6e8] border border-[#f6e3c2] rounded-2xl p-6 flex flex-col gap-4">
            <span className="w-fit text-sm font-extrabold text-[#e8890c] border-[1.5px] border-[#e8890c] px-4 py-1 rounded-full">
              {result.leftLabel}
            </span>
            <div className="text-base font-semibold leading-relaxed text-[#1a1a1a]">
              {result.leftSummary}
            </div>
          </div>
          <div className="bg-[#f1eefb] border border-[#ddd5f4] rounded-2xl p-6 flex flex-col gap-4">
            <span className="w-fit text-sm font-extrabold text-[#6d3fe0] border-[1.5px] border-[#6d3fe0] px-4 py-1 rounded-full">
              {result.rightLabel}
            </span>
            <div className="text-base font-semibold leading-relaxed text-[#1a1a1a]">
              {result.rightSummary}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-1)] rounded-2xl p-7 flex flex-col gap-5">
        <div className="text-lg font-black">AI 코멘트</div>
        <div className="grid grid-cols-2">
          <div className="flex flex-col gap-2.5 pr-7 border-r border-[var(--border-1)]">
            <span className="text-base font-black text-[#e8890c]">
              {result.leftLabel}
            </span>
            <div className="text-[15px] font-semibold leading-[1.7] text-[var(--text-2)]">
              {result.leftComment}
            </div>
          </div>
          <div className="flex flex-col gap-2.5 pl-7">
            <span className="text-base font-black text-[#6d3fe0]">
              {result.rightLabel}
            </span>
            <div className="text-[15px] font-semibold leading-[1.7] text-[var(--text-2)]">
              {result.rightComment}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#f1eefb] border border-[#ddd5f4] rounded-2xl p-6 flex gap-5 items-start">
        <div className="w-12 h-12 rounded-full bg-[#e3dcf7] flex items-center justify-center shrink-0">
          <Sparkles size={20} color="#6d3fe0" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-base font-black text-[#1a1a1a]">
            AI 의견 종합
          </div>
          <div className="text-[15px] font-semibold leading-[1.7] text-[#1a1a1a]">
            {result.aiSummary}
          </div>
        </div>
      </div>

      <div className="bg-[var(--bg-hero)] border border-[var(--border-1)] rounded-2xl p-6 flex gap-5 items-start">
        <div className="w-12 h-12 rounded-full bg-[var(--bg-card)] flex items-center justify-center shrink-0">
          <Lightbulb size={20} />
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-base font-black">내가 놓친 관점</div>
          <div className="text-[15px] font-semibold leading-[1.7] text-[var(--text-2)]">
            {result.missedPoint}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_1.2fr] gap-5 mt-2">
        <Link
          href="/"
          className="h-15 py-4 rounded-2xl border border-[var(--border-1)] bg-[var(--bg-card)] text-base font-extrabold flex items-center justify-center gap-2.5 hover:bg-[var(--bg-hero)]"
        >
          <Home size={18} strokeWidth={2} />
          홈으로
        </Link>
        <Link
          href="/votes"
          className="h-15 py-4 rounded-2xl bg-[var(--brand-yellow)] text-[var(--brand-on-yellow)] text-[17px] font-black flex items-center justify-center gap-2.5 hover:brightness-[0.96]"
        >
          이 안건 투표 참여하기
          <ArrowRight size={18} strokeWidth={2.4} />
        </Link>
      </div>
    </div>
  );
}
