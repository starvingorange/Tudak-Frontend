import { SquareCheckBig } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CategoryBadge } from "@/components/ui/category-badge";
import { SectionHeader } from "@/components/ui/section-header";
import { POPULAR_VOTES } from "./data";

export function PopularVotesSection() {
  return (
    <section className="mt-5 rounded-(--radius-section) border border-(--border-1) bg-(--bg-surface) p-4 sm:mt-7 sm:p-[24px_28px_28px]">
      <SectionHeader
        icon={<SquareCheckBig size={18} className="text-(--text-1)" />}
        title="지금 인기 있는 투표"
        moreHref="/votes"
      />
      <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4.5">
        {POPULAR_VOTES.map((vote) => (
          <Card key={vote.id} className="flex flex-col">
            <CategoryBadge category={vote.category} className="self-start" />
            <div className="mt-3 min-h-0 whitespace-pre-line text-lg leading-snug font-extrabold tracking-[-0.3px] sm:mt-3.5 sm:min-h-14 sm:text-xl">
              {vote.title}
            </div>
            <div className="mt-3 text-[13px] leading-relaxed text-(--text-2) sm:mt-3.5">
              투표수 {vote.voteCount.toLocaleString()}&nbsp;&nbsp;|&nbsp;&nbsp;
              {vote.deadline}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
