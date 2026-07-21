"use client";

import { useMemo, useState } from "react";
import { Pagination } from "@/components/ui/pagination";
import {
  type ListFilter,
  matchesListFilter,
} from "@/features/shared/categories";
import { CategoryTabBar } from "@/features/shared/category-tab-bar";
import { VOTE_ROWS, VOTE_SORT_OPTIONS } from "./data";
import { VoteRow } from "./vote-row";
import { VoteSortDropdown } from "./vote-sort-dropdown";

export function VoteList() {
  const [tab, setTab] = useState<ListFilter>("전체");
  const [sort, setSort] = useState<(typeof VOTE_SORT_OPTIONS)[number]>(
    VOTE_SORT_OPTIONS[0],
  );

  const rows = useMemo(
    () => VOTE_ROWS.filter((vote) => matchesListFilter(vote.category, tab)),
    [tab],
  );

  return (
    <>
      <div className="border border-(--border-1) rounded-(--radius-section) mt-6 p-[18px_22px] flex items-end gap-6">
        <div className="flex-1">
          <div className="mt-2.5">
            <CategoryTabBar active={tab} onChange={setTab} />
          </div>
        </div>
        <div className="w-55">
          <div className="mt-2.5">
            <VoteSortDropdown value={sort} onChange={setSort} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3.5 mt-5.5">
        {rows.map((vote) => (
          <VoteRow key={vote.id} vote={vote} />
        ))}
      </div>

      <Pagination />
    </>
  );
}
