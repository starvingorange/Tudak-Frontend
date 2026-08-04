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
        "inline-block w-fit self-start whitespace-nowrap rounded-(--radius-pill) px-3 py-1.25 font-sans text-xs font-bold text-(--cat-fg)",
        className,
      )}
      style={{ background: CATEGORIES[category].colorVar, ...style }}
      {...rest}
    >
      {category}
    </span>
  );
}
