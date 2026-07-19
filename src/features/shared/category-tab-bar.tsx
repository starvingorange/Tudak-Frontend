"use client";

import {
  Grid2x2,
  Heart,
  MoreHorizontal,
  ScrollText,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LIST_FILTER_TABS, type ListFilterTab } from "./categories";

const TAB_ICONS: Record<ListFilterTab, React.ElementType> = {
  전체: Grid2x2,
  시사: ScrollText,
  연애: Heart,
  사회: Users,
  학교: Users,
  기타: MoreHorizontal,
};

interface CategoryTabBarProps {
  active: ListFilterTab;
  onChange: (tab: ListFilterTab) => void;
}

export function CategoryTabBar({ active, onChange }: CategoryTabBarProps) {
  return (
    <div className="flex gap-3 flex-wrap">
      {LIST_FILTER_TABS.map((tab) => {
        const Icon = TAB_ICONS[tab];
        const isActive = tab === active;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={cn(
              "inline-flex items-center gap-[9px] text-sm px-6 py-[11px] rounded-[var(--radius-button)] font-sans cursor-pointer hover:border-[var(--brand-yellow)]",
              isActive
                ? "border-[1.5px] border-[var(--brand-yellow)] bg-[var(--bg-card)] text-[var(--text-1)] font-bold"
                : "border border-[var(--border-1)] bg-[var(--bg-card)] text-[var(--text-1)] font-semibold",
            )}
          >
            <Icon size={16} />
            {tab}
          </button>
        );
      })}
    </div>
  );
}
