import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface PollOption {
  label: string;
  percent: number;
}

interface PollBarProps extends HTMLAttributes<HTMLDivElement> {
  options: PollOption[];
}

export function PollBar({ options, className, ...rest }: PollBarProps) {
  return (
    <div
      className={cn("flex flex-col gap-[11px] font-sans", className)}
      {...rest}
    >
      {options.map((option) => (
        <div key={option.label} className="flex items-center gap-3 text-[13px]">
          <span className="w-[26px] text-[var(--text-label)]">
            {option.label}
          </span>
          <span className="flex-1 h-2 rounded overflow-hidden block bg-[var(--poll-track)]">
            <span
              className="block h-full rounded bg-[var(--vote-blue)]"
              style={{ width: `${option.percent}%` }}
            />
          </span>
          <span className="w-8 text-right text-[var(--text-label)]">
            {option.percent}%
          </span>
        </div>
      ))}
    </div>
  );
}
