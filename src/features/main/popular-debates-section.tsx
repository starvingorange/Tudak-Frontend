import { Flame, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CategoryBadge } from "@/components/ui/category-badge";
import { SectionHeader } from "@/components/ui/section-header";
import { POPULAR_DEBATES } from "./data";

export function PopularDebatesSection() {
  return (
    <section className="bg-[var(--bg-surface)] border border-[var(--border-1)] rounded-[var(--radius-section)] mt-7 p-[24px_28px_28px]">
      <SectionHeader
        icon={<Flame size={18} className="text-[var(--live-dot)]" />}
        title="지금 인기 있는 토론"
        moreHref="/debates"
      />
      <div className="grid grid-cols-3 gap-[18px] mt-5">
        {POPULAR_DEBATES.map((debate) => (
          <Card key={debate.id}>
            <CategoryBadge category={debate.category} />
            <div className="text-xl font-extrabold leading-snug mt-3.5 tracking-[-0.3px] min-h-14 whitespace-pre-line">
              {debate.title}
            </div>
            <div className="flex items-center gap-3.5 mt-4 text-[13px] text-[var(--text-2)]">
              <span className="inline-flex items-center gap-1">
                <Users size={13} />
                참여자 {debate.participants}명
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-[7px] h-[7px] rounded-full bg-[var(--live-dot)]" />
                진행 중
              </span>
            </div>
            <div className="mt-[18px] text-base font-extrabold flex items-center gap-1.5">
              <Flame size={15} className="text-[var(--live-dot)]" />
              {debate.fireCount.toLocaleString()}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
