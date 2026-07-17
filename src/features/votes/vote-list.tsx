"use client";

import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { Pagination } from "@/components/ui/pagination";
import {
  LIST_FILTER_TABS,
  type ListFilterTab,
  matchesListFilterTab,
} from "@/features/shared/categories";
import { CategoryTabBar } from "@/features/shared/category-tab-bar";
import { VOTE_ROWS, VOTE_SORT_OPTIONS } from "./data";
import { VoteRow } from "./vote-row";

export function VoteList() {
  const [tab, setTab] = useState<ListFilterTab>(LIST_FILTER_TABS[0]);

  const rows = useMemo(
    () => VOTE_ROWS.filter((vote) => matchesListFilterTab(vote.category, tab)),
    [tab],
  );

  return (
    <>
      <div className="border border-[var(--border-1)] rounded-[var(--radius-section)] mt-6 p-[18px_22px] flex items-end gap-6">
        <div className="flex-1">
          <div className="text-[13px] font-bold text-[var(--text-2)]">
            카테고리
          </div>
          <div className="mt-2.5">
            <CategoryTabBar active={tab} onChange={setTab} />
          </div>
        </div>
        <div className="w-[220px]">
          <div className="text-[13px] font-bold text-[var(--text-2)]">정렬</div>
          <div className="mt-2.5 relative">
            <select className="w-full appearance-none border border-[var(--border-1)] bg-[var(--bg-card)] rounded-[var(--radius-button)] px-4 py-3 text-sm font-semibold text-[var(--text-1)] cursor-pointer">
              {VOTE_SORT_OPTIONS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-2)]"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3.5 mt-[22px]">
        {rows.map((vote) => (
          <VoteRow key={vote.id} vote={vote} />
        ))}
      </div>

      <Pagination />
    </>
  );
}
