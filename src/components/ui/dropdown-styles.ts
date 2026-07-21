import { cn } from "@/lib/utils";

/** Pill-shaped trigger button shared by category tabs, the "기타" overflow
 * button, and other small dropdown triggers (e.g. the votes sort picker). */
export const dropdownTriggerClass = (active: boolean) =>
  cn(
    "inline-flex items-center gap-[9px] text-sm px-6 py-[11px] rounded-(--radius-button) font-sans whitespace-nowrap cursor-pointer hover:border-(--brand-yellow)",
    active
      ? "border-[1.5px] border-(--brand-yellow) bg-(--bg-card) text-(--text-1) font-bold"
      : "border border-(--border-1) bg-(--bg-card) text-(--text-1) font-semibold",
  );

/** Floating panel container for a trigger's dropdown menu. */
export const dropdownPanelClass =
  "absolute top-full mt-2 z-20 bg-(--bg-card) border border-(--border-1) rounded-(--radius-button) p-1.5 flex flex-col gap-1 shadow-[0_8px_28px_rgba(0,0,0,0.08)]";

export const dropdownItemClass = (active: boolean) =>
  cn(
    "flex items-center gap-2 text-sm px-3 py-2 rounded-[8px] text-left cursor-pointer",
    active
      ? "bg-(--bg-hero) font-bold text-(--text-1)"
      : "font-semibold text-(--text-1) hover:bg-(--bg-hero)",
  );
