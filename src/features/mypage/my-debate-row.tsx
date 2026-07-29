import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { CategoryBadge } from "@/components/ui/category-badge";
import { cn } from "@/lib/utils";
import type { MyDebateSummary } from "./data";

export function MyDebateRow({ debate }: { debate: MyDebateSummary }) {
  // The winning side's percentage is emphasised; the other is muted, so the
  // outcome reads at a glance without a separate "우세" label.
  const side = (label: "찬성" | "반대") => {
    const isPro = label === "찬성";
    const won = debate.winner === (isPro ? "pro" : "con");
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
          {isPro ? debate.proPercent : debate.conPercent}%
        </span>
      </span>
    );
  };

  return (
    <Link
      href={`/debates/${debate.id}/result`}
      className="flex items-center gap-5 border border-(--border-1) rounded-(--radius-card) px-6.5 py-5 hover:border-(--brand-yellow)"
    >
      <CategoryBadge category={debate.category} className="shrink-0" />
      <span className="flex-1 text-[19px] font-extrabold tracking-[-0.3px] min-w-0">
        {debate.title}
      </span>
      {side("찬성")}
      <span className="text-sm font-extrabold text-(--text-2)">VS</span>
      {side("반대")}
      <span className="w-px h-9 bg-(--border-1)" />
      <ChevronRight size={18} className="text-(--text-3) shrink-0" />
    </Link>
  );
}
