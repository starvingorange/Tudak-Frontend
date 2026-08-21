"use client";

import { useState } from "react";
import { useGetView1 } from "@/api/poll/hooks/useGetView1";
import { Pagination } from "@/components/ui/pagination";
import {
  CATEGORY_TO_BACKEND,
  type ListFilter,
} from "@/features/shared/categories";
import { CategoryTabBar } from "@/features/shared/category-tab-bar";
import { useIsLoggedIn } from "@/stores/auth-store";
import { VOTE_SORT_OPTIONS } from "./data";
import { VoteRow } from "./vote-row";
import { voteRowFromPoll } from "./vote-row-from-poll";
import { VoteSortDropdown } from "./vote-sort-dropdown";

const PAGE_SIZE = 6;

// 목록은 초 단위로 신선할 필요가 없으니 20초간 캐시하고, 포커스 재요청은
// 끈다 — debate-list.tsx의 동일 설정과 같은 이유.
const QUERY_OPTIONS = { staleTime: 20_000, refetchOnWindowFocus: false };

export function VoteList() {
  const [tab, setTab] = useState<ListFilter>("전체");
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<(typeof VOTE_SORT_OPTIONS)[number]>(
    VOTE_SORT_OPTIONS[0],
  );
  const loggedIn = useIsLoggedIn();

  // GET /api/polls는 인증 없이 403이 난다 — 로그인 안 됐으면 쏘지도 않고
  // 안내만 보여준다 (재시도 루프에 걸려 화면이 그냥 비어 보이는 것 방지).
  const { data, isLoading } = useGetView1(
    {
      categoryType: tab === "전체" ? undefined : CATEGORY_TO_BACKEND[tab],
      pageable: { page, size: PAGE_SIZE },
    },
    { query: { ...QUERY_OPTIONS, enabled: loggedIn } },
  );
  const list = data?.data;
  const rows = (list?.content ?? []).map(voteRowFromPoll);

  const handleTabChange = (value: ListFilter) => {
    setTab(value);
    setPage(0);
  };

  return (
    <>
      <div className="mt-4 flex flex-col gap-3 rounded-(--radius-section) border border-(--border-1) p-3.5 lg:mt-6 lg:flex-row lg:items-end lg:gap-6 lg:p-[18px_22px]">
        <div className="flex-1">
          <div className="mt-0 lg:mt-2.5">
            <CategoryTabBar active={tab} onChange={handleTabChange} />
          </div>
        </div>
        <div className="w-full lg:w-55">
          <div className="mt-0 lg:mt-2.5">
            <VoteSortDropdown value={sort} onChange={setSort} />
          </div>
        </div>
      </div>

      {!loggedIn ? (
        <div className="mt-4 flex flex-col items-center gap-1.5 py-16 text-center sm:mt-5">
          <span className="text-[15px] font-bold text-(--text-2)">
            로그인하면 진행 중인 투표를 볼 수 있어요
          </span>
        </div>
      ) : isLoading ? null : rows.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-1.5 py-16 text-center sm:mt-5">
          <span className="text-[15px] font-bold text-(--text-2)">
            아직 진행 중인 투표가 없어요
          </span>
        </div>
      ) : (
        <div className="mt-3.5 flex flex-col gap-2.5 sm:mt-5.5 sm:gap-3.5">
          {rows.map((vote) => (
            <VoteRow key={vote.id} vote={vote} />
          ))}
        </div>
      )}

      {list && (list.totalPages ?? 0) > 1 && (
        <Pagination
          page={page + 1}
          pageCount={list.totalPages ?? 0}
          onPageChange={(p) => setPage(p - 1)}
        />
      )}
    </>
  );
}
