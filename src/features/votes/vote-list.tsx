"use client";

import { useMemo, useState } from "react";
import { useLoginGate } from "@/components/auth/use-login-gate";
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
  const { requireLogin, loginModal } = useLoginGate(
    "투표를 보려면 로그인이 필요해요.",
  );

  const rows = useMemo(
    () => VOTE_ROWS.filter((vote) => matchesListFilter(vote.category, tab)),
    [tab],
  );

  return (
    <>
      <div className="mt-4 flex flex-col gap-3 rounded-(--radius-section) border border-(--border-1) p-3.5 lg:mt-6 lg:flex-row lg:items-end lg:gap-6 lg:p-[18px_22px]">
        <div className="flex-1">
          <div className="mt-0 lg:mt-2.5">
            <CategoryTabBar active={tab} onChange={setTab} />
          </div>
        </div>
        <div className="w-full lg:w-55">
          <div className="mt-0 lg:mt-2.5">
            <VoteSortDropdown value={sort} onChange={setSort} />
          </div>
        </div>
      </div>

      <div className="mt-3.5 flex flex-col gap-2.5 sm:mt-5.5 sm:gap-3.5">
        {rows.map((vote) => (
          <VoteRow key={vote.id} vote={vote} onRequireLogin={requireLogin} />
        ))}
      </div>

      <Pagination />

      {loginModal}
    </>
  );
}
