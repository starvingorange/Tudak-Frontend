import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface VsBarProps extends HTMLAttributes<HTMLDivElement> {
  leftPercent: number;
  leftLabel: string;
  rightLabel: string;
}

export function VsBar({
  leftPercent,
  leftLabel,
  rightLabel,
  className,
  ...rest
}: VsBarProps) {
  const rightPercent = 100 - leftPercent;
  return (
    <div className={cn("font-sans", className)} {...rest}>
      <div className="flex h-2.5 rounded-(--radius-poll) overflow-hidden">
        <span
          className="bg-(--vote-blue)"
          style={{ width: `${leftPercent}%` }}
        />
        <span
          className="bg-(--vote-red)"
          style={{ width: `${rightPercent}%` }}
        />
      </div>
      <div className="flex justify-between mt-2.5">
        <span className="text-[19px] font-extrabold text-(--vote-blue)">
          {leftPercent}%
        </span>
        <span className="text-[19px] font-extrabold text-(--vote-red)">
          {rightPercent}%
        </span>
      </div>
      <div className="flex justify-between mt-0.5 text-[13px]">
        <span className="text-(--vote-blue)">{leftLabel}</span>
        <span className="text-(--text-2)">{rightLabel}</span>
      </div>
    </div>
  );
}
