import { SquareCheckBig } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CategoryBadge } from "@/components/ui/category-badge";
import { SectionHeader } from "@/components/ui/section-header";
import { POPULAR_VOTES } from "./data";

export function PopularVotesSection() {
  return (
    <section className="bg-(--bg-surface) border border-(--border-1) rounded-(--radius-section) mt-7 p-[24px_28px_28px]">
      <SectionHeader
        icon={<SquareCheckBig size={18} className="text-(--text-1)" />}
        title="지금 인기 있는 투표"
        moreHref="/votes"
      />
      <div className="grid grid-cols-3 gap-4.5 mt-5">
        {POPULAR_VOTES.map((vote) => (
          <Card key={vote.id} className="flex flex-col">
            <CategoryBadge category={vote.category} className="self-start" />
            <div className="text-xl font-extrabold leading-snug mt-3.5 tracking-[-0.3px] min-h-14 whitespace-pre-line">
              {vote.title}
            </div>
            <div className="mt-3.5 text-[13px] text-(--text-2)">
              투표수 {vote.voteCount.toLocaleString()}&nbsp;&nbsp;|&nbsp;&nbsp;
              {vote.deadline}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
