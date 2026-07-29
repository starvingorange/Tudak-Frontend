import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  title: string;
  /** Omit to render the header without a "더보기" link — for sections that
   * already show everything they have. */
  moreHref?: string;
}

export function SectionHeader({
  icon,
  title,
  moreHref,
  className,
  ...rest
}: SectionHeaderProps) {
  return (
    <div
      className={cn("flex items-center gap-[9px] font-sans", className)}
      {...rest}
    >
      {icon}
      <span className="text-lg font-extrabold flex-1 text-[var(--text-1)]">
        {title}
      </span>
      {moreHref && (
        <Link
          href={moreHref}
          className="text-[13px] text-[var(--text-3)] no-underline"
        >
          더보기 ›
        </Link>
      )}
    </div>
  );
}
