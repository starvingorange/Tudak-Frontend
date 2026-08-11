import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-(--bg-card) border border-(--border-1) rounded-(--radius-card) p-[22px_22px_20px] font-sans",
        className,
      )}
      {...rest}
    />
  );
}
