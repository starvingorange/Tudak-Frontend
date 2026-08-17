"use client";

import { useQueries } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getDebateQueryOptions } from "@/api/debate/hooks/useGetDebate";
import { useGetDebateList } from "@/api/debate/hooks/useGetDebateList";
import { useLoginGate } from "@/components/auth/use-login-gate";
import { Pagination } from "@/components/ui/pagination";
import {
  BACKEND_TO_CATEGORY,
  CATEGORY_TO_BACKEND,
  type ListFilter,
} from "@/features/shared/categories";
import { CategoryTabBar } from "@/features/shared/category-tab-bar";
import type { DebateRoom } from "./data";
import { DebateCard } from "./debate-card";
import { debateRoomFromDetail } from "./debate-room-from-detail";
import { JoinModal } from "./join-modal";

const PAGE_SIZE = 6;

// 카드 하나당 상세 조회가 딸려 있는 목록이라 기본 설정(포커스될 때마다
// 전부 재요청)을 그대로 두면 요청이 과도하게 나간다 — 방 목록은 초 단위로
// 신선할 필요가 없으니 20초간 캐시하고, 포커스 재요청은 끈다.
const QUERY_OPTIONS = { staleTime: 20_000, refetchOnWindowFocus: false };

export function DebateList() {
  const [tab, setTab] = useState<ListFilter>("전체");
  const [page, setPage] = useState(0);
  const [openRoom, setOpenRoom] = useState<DebateRoom | null>(null);
  const { requireLogin, loginModal } = useLoginGate(
    "토론에 참여하려면 로그인이 필요해요.",
  );

  const { data: listData, isLoading } = useGetDebateList(
    {
      status: "WAITING",
      category: tab === "전체" ? undefined : CATEGORY_TO_BACKEND[tab],
      pageable: { page, size: PAGE_SIZE },
    },
    { query: QUERY_OPTIONS },
  );
  const list = listData?.data;
  const items = list?.content ?? [];
  const debateIds = items
    .map((room) => room.debateId)
    .filter((id): id is number => id !== undefined);

  // 목록 조회에서 참여 인원(찬성/반대 좌석) 정보를 안 줘서, 상세 조회로
  // 좌석 정보를 "보강"한다. 방은 실시간으로 열리고 닫히기 때문에 목록에
  // 있던 방의 상세 조회가 그 사이 404가 날 수 있는데, 그렇다고 카드 자체가
  // 사라지면 목록이 깜빡이는 것처럼 보인다 — 그래서 카드 노출 여부는
  // 목록 데이터만으로 결정하고, 상세 조회는 로딩됐을 때만 좌석 정보를
  // 덧붙이는 용도로만 쓴다. 404는 재시도해도 대개 다시 안 되니 1번만 시도.
  const detailQueries = useQueries({
    queries: debateIds.map((id) =>
      getDebateQueryOptions(id, {
        query: { ...QUERY_OPTIONS, retry: 1 },
      }),
    ),
  });

  const rooms = useMemo<DebateRoom[]>(
    () =>
      items
        .filter(
          (item): item is typeof item & { debateId: number } =>
            item.debateId !== undefined,
        )
        .map((item) => {
          const detail =
            detailQueries[debateIds.indexOf(item.debateId)]?.data?.data;
          if (detail) return debateRoomFromDetail(item.debateId, detail);
          return {
            id: String(item.debateId),
            category: item.category
              ? BACKEND_TO_CATEGORY[item.category]
              : "기타",
            title: item.title ?? "",
            proStance: "찬성",
            conStance: "반대",
            pro: null,
            con: null,
          };
        }),
    [items, debateIds, detailQueries],
  );

  const handleTabChange = (value: ListFilter) => {
    setTab(value);
    setPage(0);
  };

  return (
    <>
      <div className="mt-4 rounded-(--radius-section) border border-(--border-1) p-3.5 sm:mt-6 sm:p-4">
        <CategoryTabBar active={tab} onChange={handleTabChange} />
      </div>
      {isLoading ? null : rooms.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-1.5 py-16 text-center sm:mt-5">
          <span className="text-[15px] font-bold text-(--text-2)">
            아직 대기 중인 토론방이 없어요
          </span>
          <span className="text-[13px] text-(--text-3)">
            새로운 토론방을 만들어보세요
          </span>
        </div>
      ) : (
        <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:mt-5.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-4.5">
          {rooms.map((room) => (
            <DebateCard
              key={room.id}
              room={room}
              onJoin={setOpenRoom}
              onRequireLogin={requireLogin}
            />
          ))}
        </div>
      )}
      {list && list.totalPages > 1 && (
        <Pagination
          page={page + 1}
          pageCount={list.totalPages}
          onPageChange={(p) => setPage(p - 1)}
        />
      )}
      {openRoom && (
        <JoinModal room={openRoom} onClose={() => setOpenRoom(null)} />
      )}
      {loginModal}
    </>
  );
}
