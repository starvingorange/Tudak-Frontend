import { CategoryBadge } from "@/components/ui/category-badge";
import type { CategorySlug } from "@/features/shared/categories";
import { cn } from "@/lib/utils";

interface MyDebateRowProps {
  category: CategorySlug;
  title: string;
  agrees: number;
  disagrees: number;
}

export function MyDebateRow({
  category,
  title,
  agrees,
  disagrees,
}: MyDebateRowProps) {
  const total = agrees + disagrees;
  const proPercent = total === 0 ? 50 : Math.round((agrees / total) * 100);
  const conPercent = 100 - proPercent;
  const winner: "pro" | "con" | "tie" =
    proPercent === conPercent ? "tie" : proPercent > conPercent ? "pro" : "con";

  // The winning side's percentage is emphasised; the other is muted, so the
  // outcome reads at a glance without a separate "우세" label.
  const side = (label: "찬성" | "반대") => {
    const isPro = label === "찬성";
    const won = winner === (isPro ? "pro" : "con");
    const color = isPro ? "text-(--vote-blue)" : "text-(--vote-red)";
    return (
      <span className="flex flex-col gap-1.5 items-center w-25 shrink-0">
        <span className={cn("text-[13px] font-bold", color)}>{label}</span>
        <span
          className={cn(
            "text-[15px]",
            won ? cn("font-black", color) : "font-bold text-(--text-2)",
          )}
        >
          {isPro ? proPercent : conPercent}%
        </span>
      </span>
    );
  };

  return (
    // 목록 조회 API가 토론 id를 안 줘서 결과 페이지로 링크를 걸 수가 없다 —
    // id가 추가되면 Link + ChevronRight로 되돌린다.
    <div className="flex items-center gap-5 border border-(--border-1) rounded-(--radius-card) px-6.5 py-5">
      <CategoryBadge category={category} className="shrink-0 self-center" />
      <span className="flex-1 text-[19px] font-extrabold tracking-[-0.3px] min-w-0">
        {title}
      </span>
      {side("찬성")}
      <span className="text-sm font-extrabold text-(--text-2)">VS</span>
      {side("반대")}
    </div>
  );
}
