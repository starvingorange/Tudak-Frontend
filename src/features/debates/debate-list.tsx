"use client";

import { useMemo, useState } from "react";
import { useLoginGate } from "@/components/auth/use-login-gate";
import { Pagination } from "@/components/ui/pagination";
import {
  type ListFilter,
  matchesListFilter,
} from "@/features/shared/categories";
import { CategoryTabBar } from "@/features/shared/category-tab-bar";
import { DEBATE_ROOMS, type DebateRoom } from "./data";
import { DebateCard } from "./debate-card";
import { JoinModal } from "./join-modal";

export function DebateList() {
  const [tab, setTab] = useState<ListFilter>("전체");
  const [openRoom, setOpenRoom] = useState<DebateRoom | null>(null);
  const { requireLogin, loginModal } = useLoginGate(
    "토론에 참여하려면 로그인이 필요해요.",
  );

  const rooms = useMemo(
    () => DEBATE_ROOMS.filter((room) => matchesListFilter(room.category, tab)),
    [tab],
  );

  return (
    <>
      <div className="mt-4 rounded-(--radius-section) border border-(--border-1) p-3.5 sm:mt-6 sm:p-4">
        <CategoryTabBar active={tab} onChange={setTab} />
      </div>
      <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:mt-5.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-4.5">
        {rooms.slice(0, 6).map((room) => (
          <DebateCard
            key={room.id}
            room={room}
            onJoin={setOpenRoom}
            onRequireLogin={requireLogin}
          />
        ))}
      </div>
      <Pagination />
      {openRoom && (
        <JoinModal room={openRoom} onClose={() => setOpenRoom(null)} />
      )}
      {loginModal}
    </>
  );
}
