"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  pageCount?: number;
  /** Pass together with `onPageChange` for a controlled, API-backed page.
   * Omit both to keep the old visual-only self-managed state. */
  page?: number;
  onPageChange?: (page: number) => void;
}

export function Pagination({
  pageCount = 5,
  page,
  onPageChange,
}: PaginationProps) {
  const [internalPage, setInternalPage] = useState(1);
  const currentPage = page ?? internalPage;
  const setPage = onPageChange ?? setInternalPage;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  const navButton =
    "w-[38px] h-[38px] rounded-[10px] border border-[var(--border-1)] bg-[var(--bg-card)] inline-flex items-center justify-center text-[var(--text-2)] cursor-pointer hover:border-[var(--brand-yellow)]";

  return (
    <div className="mt-7 flex items-center justify-center gap-1.5 sm:mt-7.5 sm:gap-2">
      <button
        type="button"
        className={navButton}
        onClick={() => setPage(Math.max(1, currentPage - 1))}
        aria-label="이전 페이지"
      >
        <ChevronLeft size={14} strokeWidth={2.4} />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => setPage(p)}
          className={cn(
            "h-9.5 w-8.5 rounded-[10px] text-sm font-semibold cursor-pointer sm:w-9.5",
            p === currentPage
              ? "border-none bg-(--brand-yellow) text-(--brand-on-yellow) font-extrabold"
              : "border border-(--border-1) bg-(--bg-card) text-(--text-1) hover:border-(--brand-yellow)",
          )}
        >
          {p}
        </button>
      ))}
      <span className="text-(--text-3) px-1">…</span>
      <button
        type="button"
        className={navButton}
        onClick={() => setPage(Math.min(pageCount, currentPage + 1))}
        aria-label="다음 페이지"
      >
        <ChevronRight size={14} strokeWidth={2.4} />
      </button>
    </div>
  );
}
