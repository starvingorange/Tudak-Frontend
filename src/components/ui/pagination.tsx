"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Visual-only: there's no paginated data source yet, so this just tracks
// which page number looks active. Wire up real paging once an API exists.
export function Pagination({ pageCount = 5 }: { pageCount?: number }) {
  const [page, setPage] = useState(1);
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  const navButton =
    "w-[38px] h-[38px] rounded-[10px] border border-[var(--border-1)] bg-[var(--bg-card)] inline-flex items-center justify-center text-[var(--text-2)] cursor-pointer hover:border-[var(--brand-yellow)]";

  return (
    <div className="flex justify-center items-center gap-2 mt-[30px]">
      <button
        type="button"
        className={navButton}
        onClick={() => setPage((p) => Math.max(1, p - 1))}
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
            "w-[38px] h-[38px] rounded-[10px] text-sm font-semibold cursor-pointer",
            p === page
              ? "border-none bg-[var(--brand-yellow)] text-[var(--brand-on-yellow)] font-extrabold"
              : "border border-[var(--border-1)] bg-[var(--bg-card)] text-[var(--text-1)] hover:border-[var(--brand-yellow)]",
          )}
        >
          {p}
        </button>
      ))}
      <span className="text-[var(--text-3)] px-1">…</span>
      <button
        type="button"
        className={navButton}
        onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
        aria-label="다음 페이지"
      >
        <ChevronRight size={14} strokeWidth={2.4} />
      </button>
    </div>
  );
}
