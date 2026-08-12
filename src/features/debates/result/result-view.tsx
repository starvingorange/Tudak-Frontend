import { Home, Lightbulb, Sparkles } from "lucide-react";
import Link from "next/link";
import { CategoryBadge } from "@/components/ui/category-badge";
import { ROUTES } from "@/lib/routes";
import type { DebateResult } from "./data";

interface ResultViewProps {
  result: DebateResult;
}

export function ResultView({ result }: ResultViewProps) {
  return (
    <div className="max-w-240 mx-auto px-4 py-8 min-h-[calc(100dvh-var(--nav-height))] flex flex-col justify-between gap-6">
      <div className="flex flex-col justify-between gap-5">
        <div className="flex flex-col gap-2.5">
          <CategoryBadge category={result.category} className="w-fit" />
          <h1 className="text-4xl font-black tracking-[-0.5px] m-0">
            {result.topic}
          </h1>
        </div>

        <div className="flex flex-col gap-3.5">
          <div className="text-xl font-black">입장 요약</div>
          <div className="grid grid-cols-2 gap-5">
            {/* #eef1fd/#fdecec match the pro/con tints used in join-modal.tsx,
                so body copy needs fixed dark ink instead of the theme's --text-*. */}
            <div className="bg-[#eef1fd] border border-[#d3ddf8] rounded-2xl p-6 flex flex-col gap-3.5">
              <span className="w-fit text-sm font-extrabold text-(--vote-blue) border-[1.5px] border-(--vote-blue) px-4 py-1.5 rounded-full">
                {result.leftLabel}
              </span>
              <div className="text-base font-semibold leading-relaxed text-[#1a1a1a]">
                {result.leftSummary}
              </div>
            </div>
            <div className="bg-[#fdecec] border border-[#f6d2d2] rounded-2xl p-6 flex flex-col gap-3.5">
              <span className="w-fit text-sm font-extrabold text-(--vote-red) border-[1.5px] border-(--vote-red) px-4 py-1.5 rounded-full">
                {result.rightLabel}
              </span>
              <div className="text-base font-semibold leading-relaxed text-[#1a1a1a]">
                {result.rightSummary}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-(--bg-card) border border-(--border-1) rounded-2xl p-7 flex flex-col gap-4">
          <div className="text-lg font-black">AI 코멘트</div>
          <div className="grid grid-cols-2">
            <div className="flex flex-col gap-2 pr-7 border-r border-(--border-1)">
              <span className="text-base font-black text-(--vote-blue)">
                {result.leftLabel}
              </span>
              <div className="text-[15px] font-semibold leading-relaxed text-(--text-2)">
                {result.leftComment}
              </div>
            </div>
            <div className="flex flex-col gap-2 pl-7">
              <span className="text-base font-black text-(--vote-red)">
                {result.rightLabel}
              </span>
              <div className="text-[15px] font-semibold leading-relaxed text-(--text-2)">
                {result.rightComment}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-(--bg-card) border border-(--border-1) rounded-2xl p-6 flex gap-4 items-start">
          <div className="w-11 h-11 rounded-full bg-(--bg-hero) flex items-center justify-center shrink-0">
            <Sparkles size={20} color="var(--brand-yellow)" />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="text-base font-black">AI 의견 종합</div>
            <div className="text-[15px] font-semibold leading-relaxed text-(--text-2)">
              {result.aiSummary}
            </div>
          </div>
        </div>

        <div className="bg-(--bg-hero) border border-(--border-1) rounded-2xl p-6 flex gap-4 items-start">
          <div className="w-11 h-11 rounded-full bg-(--bg-card) flex items-center justify-center shrink-0">
            <Lightbulb size={20} />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="text-base font-black">내가 놓친 관점</div>
            <div className="text-[15px] font-semibold leading-relaxed text-(--text-2)">
              {result.missedPoint}
            </div>
          </div>
        </div>
      </div>

      <Link
        href={ROUTES.home()}
        className="h-14 rounded-2xl bg-(--brand-yellow) text-(--brand-on-yellow) text-base font-black flex items-center justify-center gap-2.5 hover:brightness-[0.96]"
      >
        <Home size={18} strokeWidth={2} />
        홈으로
      </Link>
    </div>
  );
}
