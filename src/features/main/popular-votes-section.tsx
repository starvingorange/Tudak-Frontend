"use client";

import { SquareCheckBig } from "lucide-react";
import { useGetHome } from "@/api/user/hooks/useGetHome";
import { Card } from "@/components/ui/card";
import { CategoryBadge } from "@/components/ui/category-badge";
import { SectionHeader } from "@/components/ui/section-header";
import { BACKEND_TO_CATEGORY } from "@/features/shared/categories";

export function PopularVotesSection() {
  // GET /api/users/home is meant to be public (visible to logged-out
  // visitors too), so this isn't gated behind login — it currently 403s
  // for anonymous requests on the backend, which is a backend-side bug to
  // fix there, not something to work around by hiding the call here.
  const { data, isLoading } = useGetHome();
  const popularPolls = data?.data?.popularPolls ?? [];

  return (
    <section className="mt-5 rounded-(--radius-section) border border-(--border-1) bg-(--bg-surface) p-4 sm:mt-7 sm:p-[24px_28px_28px]">
      <SectionHeader
        icon={<SquareCheckBig size={18} className="text-(--text-1)" />}
        title="지금 인기 있는 투표"
        moreHref="/votes"
      />
      {isLoading ? null : popularPolls.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-1.5 py-10 text-center sm:mt-5">
          <span className="text-[15px] font-bold text-(--text-2)">
            아직 인기 있는 투표가 없어요
          </span>
          <span className="text-[13px] text-(--text-3)">
            투표 참여가 많아지면 순서대로 보여드려요
          </span>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4.5">
          {popularPolls.map((vote) => (
            <Card key={vote.title} className="flex flex-col">
              <CategoryBadge
                category={BACKEND_TO_CATEGORY[vote.category ?? "OTHERS"]}
                className="self-start"
              />
              <div className="mt-3 min-h-0 whitespace-pre-line text-lg leading-snug font-extrabold tracking-[-0.3px] sm:mt-3.5 sm:min-h-14 sm:text-xl">
                {vote.title}
              </div>
              <div className="mt-3 text-[13px] leading-relaxed text-(--text-2) sm:mt-3.5">
                투표수 {(vote.voteCount ?? 0).toLocaleString()}
                &nbsp;&nbsp;|&nbsp;&nbsp;
                {vote.dDay}
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
