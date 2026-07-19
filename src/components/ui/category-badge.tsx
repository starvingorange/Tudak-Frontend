import type { HTMLAttributes } from "react";
import { CATEGORIES, type CategorySlug } from "@/features/shared/categories";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  category: CategorySlug;
}

export function CategoryBadge({
  category,
  className,
  style,
  ...rest
}: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block text-[var(--cat-fg)] font-sans text-xs font-bold px-3 py-[5px] rounded-[var(--radius-pill)] whitespace-nowrap",
        className,
      )}
      style={{ background: CATEGORIES[category].colorVar, ...style }}
      {...rest}
    >
      {category}
    </span>
  );
}
